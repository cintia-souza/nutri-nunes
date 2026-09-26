import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { enviarEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || (session.role !== 'ADMIN' && session.role !== 'SUPERADMIN')) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
  }

  const { clienteId } = await req.json();
  if (!clienteId) return NextResponse.json({ error: 'clienteId obrigatório' }, { status: 400 });

  const [cliente, progressos, checks, avaliacoes, habitos] = await Promise.all([
    prisma.usuario.findUnique({
      where: { id: clienteId },
      select: { nome: true, email: true, pesoAtual: true, altura: true, objetivo: true },
    }),
    prisma.registroProgresso.findMany({ where: { clienteId }, orderBy: { data: 'desc' }, take: 10 }),
    prisma.checkRefeicao.findMany({ where: { clienteId }, orderBy: { data: 'desc' }, take: 90 }),
    prisma.avaliacaoNutricional.findMany({ where: { clienteId }, orderBy: { data: 'asc' } }),
    prisma.registroHabito.findMany({ where: { clienteId }, orderBy: { data: 'desc' }, take: 30 }),
  ]);

  if (!cliente) return NextResponse.json({ error: 'Paciente não encontrado' }, { status: 404 });

  // Métricas resumidas
  const totalChecks = checks.length;
  const realizados = checks.filter(c => c.realizada).length;
  const aderencia = totalChecks > 0 ? Math.round((realizados / totalChecks) * 100) : 0;

  const pesoAtual = progressos.find(p => p.peso)?.peso;
  const pesoAnterior = progressos.filter(p => p.peso)[1]?.peso;
  const diffPeso = pesoAtual && pesoAnterior ? (pesoAtual - pesoAnterior).toFixed(1) : null;

  const scoreHabitos = habitos.length > 0
    ? +(habitos.slice(0, 10).reduce((s, h) =>
        s + (h.aderenciaDieta + h.variedadeAlimentar + h.aceitacaoNovos + h.hidratacao + h.comportamentoMesa) / 5, 0
      ) / Math.min(habitos.length, 10)).toFixed(1)
    : null;

  const inicial = avaliacoes.find(a => a.tipo === 'INICIAL');
  const atual = avaliacoes.length > 0 ? avaliacoes[avaliacoes.length - 1] : null;

  const html = gerarHtmlRelatorio({
    nome: cliente.nome,
    objetivo: cliente.objetivo,
    aderencia,
    pesoAtual,
    diffPeso,
    scoreHabitos,
    inicial,
    atual,
    totalAvaliacoes: avaliacoes.length,
  });

  const ok = await enviarEmail({
    to: cliente.email,
    subject: `Seu Relatório de Evolução — ${new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`,
    html,
  });

  if (!ok) return NextResponse.json({ error: 'Falha ao enviar email' }, { status: 500 });
  return NextResponse.json({ ok: true });
}

// ── Template HTML do email ────────────────────────────────────────────────────

interface TemplateData {
  nome: string;
  objetivo?: string | null;
  aderencia: number;
  pesoAtual?: number | null;
  diffPeso?: string | null;
  scoreHabitos?: number | null;
  inicial?: { frutas: number; verduras: number; legumes: number; proteinas: number; agua: number } | null;
  atual?: { frutas: number; verduras: number; legumes: number; proteinas: number; agua: number } | null;
  totalAvaliacoes: number;
}

function esc(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function barraProgresso(valor: number, max: number, cor: string) {
  const pct = Math.min(Math.round((valor / max) * 100), 100);
  return `
    <div style="background:#f0f0f0;border-radius:99px;height:8px;margin-top:4px;">
      <div style="background:${cor};width:${pct}%;height:8px;border-radius:99px;"></div>
    </div>`;
}

function gerarHtmlRelatorio(d: TemplateData): string {
  const nome = esc(d.nome.split(' ')[0]);
  const mes = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  const pesoRow = d.pesoAtual ? `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #f0ede8;">
        <span style="color:#7d7670;font-size:13px;">⚖️ Peso atual</span>
      </td>
      <td style="padding:10px 0;border-bottom:1px solid #f0ede8;text-align:right;">
        <strong style="color:#28251f;">${d.pesoAtual} kg</strong>
        ${d.diffPeso ? `<span style="color:${Number(d.diffPeso) <= 0 ? '#059669' : '#d97706'};font-size:12px;margin-left:6px;">(${Number(d.diffPeso) > 0 ? '+' : ''}${d.diffPeso} kg)</span>` : ''}
      </td>
    </tr>` : '';

  const scoreRow = d.scoreHabitos ? `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #f0ede8;">
        <span style="color:#7d7670;font-size:13px;">🎯 Score de hábitos</span>
      </td>
      <td style="padding:10px 0;border-bottom:1px solid #f0ede8;text-align:right;">
        <strong style="color:#28251f;">${d.scoreHabitos}/10</strong>
      </td>
    </tr>` : '';

  const gruposSection = d.inicial && d.atual ? `
    <div style="margin-top:24px;">
      <p style="font-weight:600;color:#28251f;margin-bottom:12px;">📊 Grupos Alimentares (inicial → atual)</p>
      ${[
        { label: '🍎 Frutas', ini: d.inicial.frutas, atu: d.atual.frutas },
        { label: '🥬 Verduras', ini: d.inicial.verduras, atu: d.atual.verduras },
        { label: '🥕 Legumes', ini: d.inicial.legumes, atu: d.atual.legumes },
        { label: '🍗 Proteínas', ini: d.inicial.proteinas, atu: d.atual.proteinas },
        { label: '💧 Água', ini: d.inicial.agua, atu: d.atual.agua },
      ].map(g => {
        const diff = g.atu - g.ini;
        const cor = diff >= 0 ? '#059669' : '#d97706';
        return `
          <div style="margin-bottom:10px;">
            <div style="display:flex;justify-content:space-between;font-size:13px;">
              <span style="color:#5c5650;">${g.label}</span>
              <span style="color:${cor};font-weight:600;">${g.ini} → ${g.atu} ${diff > 0 ? `(+${diff})` : diff < 0 ? `(${diff})` : ''}</span>
            </div>
            ${barraProgresso(g.atu, 10, cor)}
          </div>`;
      }).join('')}
    </div>` : '';

  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
    <body style="margin:0;padding:0;background:#f5f3ef;font-family:'Helvetica Neue',Arial,sans-serif;">
      <div style="max-width:560px;margin:32px auto;background:white;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

        <!-- Header -->
        <div style="background:linear-gradient(135deg,#0f3d29,#1a8558);padding:32px 32px 24px;">
          <p style="color:rgba(255,255,255,0.6);font-size:11px;text-transform:uppercase;letter-spacing:3px;margin:0 0 8px;">Relatório de Evolução</p>
          <h1 style="color:white;font-size:22px;margin:0 0 4px;">Olá, ${nome}! 🌱</h1>
          <p style="color:rgba(255,255,255,0.7);font-size:14px;margin:0;">${mes}</p>
        </div>

        <!-- Corpo -->
        <div style="padding:28px 32px;">
          ${d.objetivo ? `<p style="color:#5c5650;font-size:14px;margin:0 0 20px;padding:12px 16px;background:#f0faf5;border-radius:10px;border-left:3px solid #22a06b;">🎯 Objetivo: <strong>${esc(d.objetivo)}</strong></p>` : ''}

          <!-- Métricas -->
          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid #f0ede8;">
                <span style="color:#7d7670;font-size:13px;">✅ Aderência à dieta</span>
                ${barraProgresso(d.aderencia, 100, d.aderencia >= 70 ? '#059669' : '#d97706')}
              </td>
              <td style="padding:10px 0;border-bottom:1px solid #f0ede8;text-align:right;vertical-align:top;">
                <strong style="color:#28251f;font-size:18px;">${d.aderencia}%</strong>
              </td>
            </tr>
            ${pesoRow}
            ${scoreRow}
          </table>

          ${gruposSection}

          <!-- CTA -->
          <div style="margin-top:28px;text-align:center;">
            <p style="color:#7d7670;font-size:13px;margin-bottom:16px;">Acesse o app para ver seu relatório completo com gráficos.</p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL ?? 'https://nutrihub-plataforma.vercel.app'}/adriana/cliente"
              style="display:inline-block;background:linear-gradient(135deg,#22a06b,#166947);color:white;text-decoration:none;padding:12px 28px;border-radius:12px;font-weight:600;font-size:14px;">
              Ver relatório completo →
            </a>
          </div>
        </div>

        <!-- Footer -->
        <div style="padding:16px 32px;background:#faf8f4;border-top:1px solid #ede9e2;text-align:center;">
          <p style="color:#a8a099;font-size:12px;margin:0;">Enviado pela sua nutricionista via NutriHub</p>
        </div>
      </div>
    </body>
    </html>`;
}
