import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { enviarEmail } from '@/lib/email';
import { analisarRelatorio, type DadosAnalise, type Analise } from '@/lib/analise-relatorio';

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || (session.role !== 'ADMIN' && session.role !== 'SUPERADMIN')) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
  }

  const { clienteId } = await req.json();
  if (!clienteId) return NextResponse.json({ error: 'clienteId obrigatório' }, { status: 400 });

  const [cliente, progressos, checks, avaliacoes, habitos, admin] = await Promise.all([
    prisma.usuario.findUnique({
      where: { id: clienteId },
      select: { nome: true, email: true, pesoAtual: true, altura: true, objetivo: true, criadoEm: true, tenantId: true },
    }),
    prisma.registroProgresso.findMany({ where: { clienteId }, orderBy: { data: 'asc' } }),
    prisma.checkRefeicao.findMany({ where: { clienteId }, orderBy: { data: 'desc' }, take: 90 }),
    prisma.avaliacaoNutricional.findMany({ where: { clienteId }, orderBy: { data: 'asc' } }),
    prisma.registroHabito.findMany({ where: { clienteId }, orderBy: { data: 'desc' }, take: 30 }),
    prisma.usuario.findFirst({ where: { id: session.userId }, select: { email: true } }),
  ]);

  if (!cliente) return NextResponse.json({ error: 'Paciente não encontrado' }, { status: 404 });

  // Sem domínio verificado no Resend, só é possível enviar para o próprio email cadastrado.
  // Enviamos para a nutricionista (remetente = destinatário permitido).
  const destinatario = admin?.email ?? cliente.email;

  const totalChecks = checks.length;
  const realizados = checks.filter(c => c.realizada).length;
  const aderencia = totalChecks > 0 ? Math.round((realizados / totalChecks) * 100) : 0;

  const pesosOrdenados = progressos.filter(p => p.peso);
  const pesoAtual = pesosOrdenados[pesosOrdenados.length - 1]?.peso ?? cliente.pesoAtual;
  const pesoInicial = pesosOrdenados[0]?.peso;

  const scoreHabitos = habitos.length > 0
    ? +(habitos.slice(0, 14).reduce((s, h) =>
        s + (h.aderenciaDieta + h.variedadeAlimentar + h.aceitacaoNovos + h.hidratacao + h.comportamentoMesa) / 5, 0
      ) / Math.min(habitos.length, 14)).toFixed(1)
    : null;

  const hidratacaoMedia = habitos.length > 0
    ? Math.round(progressos.filter(p => p.aguaMl).reduce((s, p) => s + (p.aguaMl ?? 0), 0) / Math.max(progressos.filter(p => p.aguaMl).length, 1))
    : null;

  const inicial = avaliacoes.find(a => a.tipo === 'INICIAL') ?? null;
  const atual = avaliacoes.length > 0 ? avaliacoes[avaliacoes.length - 1] : null;

  const diasAcompanhamento = cliente.criadoEm
    ? Math.floor((Date.now() - new Date(cliente.criadoEm).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const dadosAnalise: DadosAnalise = {
    nome: cliente.nome,
    objetivo: cliente.objetivo,
    pesoAtual,
    pesoInicial,
    altura: cliente.altura,
    aderencia,
    scoreHabitos,
    hidratacaoMedia,
    inicial,
    atual,
    totalAvaliacoes: avaliacoes.length,
    diasAcompanhamento,
  };

  const analise = analisarRelatorio(dadosAnalise);
  const mes = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  const html = gerarHtml(cliente.nome, mes, dadosAnalise, analise);

  const ok = await enviarEmail({
    to: destinatario,
    subject: `Relatório de ${cliente.nome} — ${mes}`,
    html,
  });

  if (!ok) return NextResponse.json({ error: 'Falha ao enviar email' }, { status: 500 });
  return NextResponse.json({ ok: true });
}

// ── Template HTML ─────────────────────────────────────────────────────────────

function esc(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function barra(valor: number, max: number, cor: string) {
  const pct = Math.min(Math.round((valor / max) * 100), 100);
  return `<div style="background:#eee;border-radius:99px;height:6px;margin-top:5px;"><div style="background:${cor};width:${pct}%;height:6px;border-radius:99px;"></div></div>`;
}

function cardInsight(emoji: string, titulo: string, descricao: string, cor: string, bg: string) {
  return `
    <div style="border-radius:12px;padding:16px;margin-bottom:12px;background:${bg};border-left:4px solid ${cor};">
      <p style="margin:0 0 6px;font-weight:700;color:#28251f;font-size:14px;">${emoji} ${esc(titulo)}</p>
      <p style="margin:0;color:#5c5650;font-size:13px;line-height:1.6;">${esc(descricao)}</p>
    </div>`;
}

function gerarHtml(nomeCompleto: string, mes: string, d: DadosAnalise, a: Analise): string {
  const nome = esc(nomeCompleto.split(' ')[0]);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://nutrihub-plataforma.vercel.app';

  // Seção de conquistas
  const conquistasHtml = a.conquistas.length > 0 ? `
    <div style="margin-bottom:24px;">
      <p style="font-weight:700;color:#28251f;font-size:15px;margin:0 0 12px;">🏆 Conquistas do período</p>
      ${a.conquistas.map(c => cardInsight(c.emoji, c.titulo, c.descricao, '#059669', '#f0fdf4')).join('')}
    </div>` : '';

  // Seção de atenção
  const atencaoHtml = a.atencao.length > 0 ? `
    <div style="margin-bottom:24px;">
      <p style="font-weight:700;color:#28251f;font-size:15px;margin:0 0 12px;">📌 Pontos de atenção</p>
      ${a.atencao.map(c => cardInsight(c.emoji, c.titulo, c.descricao, '#d97706', '#fffbeb')).join('')}
    </div>` : '';

  // Análise detalhada
  const insightsDetalhados = [a.analiseAderencia, a.analisePeso, a.analiseHabitos, a.analiseAlimentacao]
    .filter(Boolean)
    .map(i => i!)
    .filter(i => !a.conquistas.includes(i) && !a.atencao.includes(i))
    .map(i => cardInsight(i.emoji, i.titulo, i.descricao,
      i.nivel === 'positivo' ? '#059669' : i.nivel === 'atencao' ? '#d97706' : '#6b7280',
      i.nivel === 'positivo' ? '#f0fdf4' : i.nivel === 'atencao' ? '#fffbeb' : '#f9fafb',
    )).join('');

  // Grupos alimentares
  const gruposHtml = d.inicial && d.atual ? `
    <div style="margin-bottom:24px;">
      <p style="font-weight:700;color:#28251f;font-size:15px;margin:0 0 12px;">🥗 Evolução dos grupos alimentares</p>
      <table style="width:100%;border-collapse:collapse;">
        ${[
          { label: '🍎 Frutas', ini: d.inicial.frutas, atu: d.atual.frutas },
          { label: '🥬 Verduras', ini: d.inicial.verduras, atu: d.atual.verduras },
          { label: '🥕 Legumes', ini: d.inicial.legumes, atu: d.atual.legumes },
          { label: '🍗 Proteínas', ini: d.inicial.proteinas, atu: d.atual.proteinas },
          { label: '💧 Hidratação', ini: d.inicial.agua, atu: d.atual.agua },
        ].map(g => {
          const diff = g.atu - g.ini;
          const cor = diff > 0 ? '#059669' : diff < 0 ? '#dc2626' : '#6b7280';
          const sinal = diff > 0 ? `+${diff}` : `${diff}`;
          return `
            <tr>
              <td style="padding:8px 0;font-size:13px;color:#5c5650;width:40%;">${g.label}</td>
              <td style="padding:8px 0;width:45%;">${barra(g.atu, 10, cor)}</td>
              <td style="padding:8px 0;text-align:right;font-size:13px;font-weight:700;color:${cor};width:15%;">${diff !== 0 ? sinal : '='}</td>
            </tr>`;
        }).join('')}
      </table>
      <p style="font-size:11px;color:#a8a099;margin:8px 0 0;">Escala de 0 a 10 — comparativo entre avaliação inicial e mais recente</p>
    </div>` : '';

  // Próximos passos
  const passosHtml = `
    <div style="margin-bottom:24px;background:#f8f5f0;border-radius:12px;padding:16px;">
      <p style="font-weight:700;color:#28251f;font-size:15px;margin:0 0 12px;">🎯 Próximos passos recomendados</p>
      ${a.proximosPassos.map(p => `
        <div style="display:flex;gap:10px;margin-bottom:8px;align-items:flex-start;">
          <span style="color:#22a06b;font-weight:700;font-size:16px;line-height:1.4;">→</span>
          <p style="margin:0;font-size:13px;color:#5c5650;line-height:1.6;">${esc(p)}</p>
        </div>`).join('')}
    </div>`;

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f3ef;font-family:'Helvetica Neue',Arial,sans-serif;">
<div style="max-width:580px;margin:32px auto;background:white;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

  <!-- Header -->
  <div style="background:linear-gradient(135deg,#0f3d29,#1a8558);padding:32px 32px 28px;">
    <p style="color:rgba(255,255,255,0.55);font-size:11px;text-transform:uppercase;letter-spacing:3px;margin:0 0 8px;">Relatório de Evolução</p>
    <h1 style="color:white;font-size:24px;margin:0 0 6px;font-weight:700;">${nome} ${a.emojiStatus}</h1>
    <p style="color:rgba(255,255,255,0.7);font-size:14px;margin:0 0 16px;">${mes}</p>
    <!-- Status badge -->
    <div style="display:inline-block;background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.25);border-radius:99px;padding:6px 16px;">
      <span style="color:white;font-size:13px;font-weight:600;">${a.fraseStatus}</span>
    </div>
  </div>

  <!-- Métricas rápidas -->
  <div style="display:flex;background:#faf8f4;border-bottom:1px solid #ede9e2;">
    <div style="flex:1;padding:16px;text-align:center;border-right:1px solid #ede9e2;">
      <p style="margin:0;font-size:22px;font-weight:700;color:${d.aderencia >= 70 ? '#059669' : '#d97706'};">${d.aderencia}%</p>
      <p style="margin:4px 0 0;font-size:11px;color:#a8a099;text-transform:uppercase;letter-spacing:1px;">Aderência</p>
    </div>
    ${d.scoreHabitos ? `
    <div style="flex:1;padding:16px;text-align:center;border-right:1px solid #ede9e2;">
      <p style="margin:0;font-size:22px;font-weight:700;color:${d.scoreHabitos >= 6 ? '#059669' : '#d97706'};">${d.scoreHabitos}/10</p>
      <p style="margin:4px 0 0;font-size:11px;color:#a8a099;text-transform:uppercase;letter-spacing:1px;">Hábitos</p>
    </div>` : ''}
    ${d.pesoAtual ? `
    <div style="flex:1;padding:16px;text-align:center;">
      <p style="margin:0;font-size:22px;font-weight:700;color:#28251f;">${d.pesoAtual} kg</p>
      <p style="margin:4px 0 0;font-size:11px;color:#a8a099;text-transform:uppercase;letter-spacing:1px;">Peso atual</p>
    </div>` : ''}
  </div>

  <!-- Corpo -->
  <div style="padding:28px 32px;">

    <!-- Resumo analítico -->
    <div style="background:#f0fdf4;border-radius:12px;padding:16px;margin-bottom:24px;border-left:4px solid #22a06b;">
      <p style="margin:0;font-size:14px;color:#166947;line-height:1.7;">${esc(a.paragrafoResumo)}</p>
    </div>

    ${conquistasHtml}
    ${atencaoHtml}
    ${insightsDetalhados ? `<div style="margin-bottom:24px;">${insightsDetalhados}</div>` : ''}
    ${gruposHtml}
    ${passosHtml}

    <!-- Conclusão -->
    <div style="margin-bottom:24px;padding:16px;background:#faf8f4;border-radius:12px;">
      <p style="font-weight:700;color:#28251f;font-size:15px;margin:0 0 8px;">📝 Análise da nutricionista</p>
      <p style="margin:0;font-size:13px;color:#5c5650;line-height:1.7;">${esc(a.conclusao)}</p>
    </div>

    <!-- Nota para nutricionista -->
    <div style="margin-top:8px;padding:12px 16px;background:#f0fdf4;border-radius:10px;border:1px solid #bbf7d0;text-align:center;">
      <p style="margin:0;font-size:12px;color:#166947;">📎 Para enviar ao paciente, encaminhe este email ou imprima o relatório pelo painel.</p>
    </div>
  </div>

  <!-- Footer -->
  <div style="padding:16px 32px;background:#faf8f4;border-top:1px solid #ede9e2;text-align:center;">
    <p style="color:#a8a099;font-size:12px;margin:0;">Gerado via NutriHub — enviado para sua caixa de entrada</p>
  </div>
</div>
</body>
</html>`;
}
