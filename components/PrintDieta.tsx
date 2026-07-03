'use client';

const LABELS: Record<string, { emoji: string; nome: string }> = {
  CAFE_DA_MANHA:   { emoji: '☀️', nome: 'Café da Manhã'   },
  LANCHE_DA_MANHA: { emoji: '🍎', nome: 'Lanche da Manhã' },
  ALMOCO:          { emoji: '🍽️', nome: 'Almoço'          },
  LANCHE_DA_TARDE: { emoji: '🥤', nome: 'Lanche da Tarde' },
  JANTA:           { emoji: '🌙', nome: 'Janta'           },
  CEIA:            { emoji: '🫖', nome: 'Ceia'            },
};

interface Alimento { nome: string; quantidade: string; observacao?: string; }
interface Refeicao { tipo: string; horarioSugerido?: string; alimentos: Alimento[]; }

interface Props {
  titulo: string;
  paciente?: string;
  refeicoes: Refeicao[];
  variant?: 'button' | 'fab';
}

export default function PrintDieta({ titulo, paciente, refeicoes, variant = 'button' }: Props) {
  const hoje = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  const refeicoesFilled = refeicoes.filter(r => r.alimentos.some(a => a.nome?.trim()));

  function handlePrint() {
    const logoUrl = `${window.location.origin}/logo.png`;

    const refeicoesHtml = refeicoesFilled.map(ref => {
      const label = LABELS[ref.tipo] ?? { emoji: '🍴', nome: ref.tipo };
      const alsFilled = ref.alimentos.filter(a => a.nome?.trim());
      const rows = alsFilled.map((al, i) => `
        <tr style="background:${i % 2 === 0 ? '#fff' : '#fdfcfb'}">
          <td style="padding:7px 10px;color:#28251f;border-bottom:1px solid #f5f2ee">${al.nome}</td>
          <td style="padding:7px 10px;color:#1a8558;font-weight:600;text-align:center;border-bottom:1px solid #f5f2ee">${al.quantidade}</td>
          <td style="padding:7px 10px;color:#7d7670;font-size:11px;border-bottom:1px solid #f5f2ee">${al.observacao || '—'}</td>
        </tr>`).join('');

      return `
        <div style="margin-bottom:18px;break-inside:avoid">
          <div style="display:flex;align-items:center;gap:10px;background:#f0faf5;border-left:4px solid #1a8558;border-radius:0 8px 8px 0;padding:9px 14px;margin-bottom:6px">
            <span style="font-size:16px">${label.emoji}</span>
            <span style="font-weight:700;font-size:13px;color:#0f3d29;flex:1">${label.nome}</span>
            ${ref.horarioSugerido ? `<span style="font-size:11px;color:#1a8558;font-weight:600;background:white;padding:2px 10px;border-radius:20px;border:1px solid #a8e8c8">${ref.horarioSugerido}</span>` : ''}
          </div>
          <table style="width:100%;border-collapse:collapse;font-size:12px">
            <thead>
              <tr>
                <th style="text-align:left;padding:5px 10px;color:#7d7670;font-weight:600;font-size:10px;text-transform:uppercase;letter-spacing:0.5px;border-bottom:1px solid #ede9e2">Alimento</th>
                <th style="text-align:center;padding:5px 10px;color:#7d7670;font-weight:600;font-size:10px;text-transform:uppercase;letter-spacing:0.5px;border-bottom:1px solid #ede9e2;width:110px">Quantidade</th>
                <th style="text-align:left;padding:5px 10px;color:#7d7670;font-weight:600;font-size:10px;text-transform:uppercase;letter-spacing:0.5px;border-bottom:1px solid #ede9e2">Observação</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>`;
    }).join('');

    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8"/>
  <title>${titulo}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Georgia, serif; color: #1a1714; padding: 40px 48px; background: #fff; }
    @media print { @page { margin: 20mm 15mm; } }
  </style>
</head>
<body>
  <div style="border-bottom:3px solid #1a8558;padding-bottom:20px;margin-bottom:24px;display:flex;justify-content:space-between;align-items:flex-start">
    <div>
      <img src="${logoUrl}" alt="Logo" style="height:44px;width:auto;object-fit:contain;margin-bottom:6px"/>
      <p style="font-size:11px;color:#7d7670">Nutrição Pediátrica Especializada</p>
    </div>
    <div style="text-align:right">
      <p style="font-size:11px;color:#7d7670;margin-bottom:2px">Data de emissão</p>
      <p style="font-size:13px;font-weight:600;color:#1a1714">${hoje}</p>
    </div>
  </div>

  <div style="background:linear-gradient(135deg,#0f3d29,#1a8558);border-radius:10px;padding:18px 22px;margin-bottom:24px;color:white">
    <p style="font-size:10px;text-transform:uppercase;letter-spacing:2px;opacity:0.65;margin-bottom:5px">Plano Alimentar</p>
    <h1 style="font-size:20px;font-weight:700;margin-bottom:4px">${titulo}</h1>
    ${paciente ? `<p style="font-size:12px;opacity:0.85">Paciente: <strong>${paciente}</strong></p>` : ''}
  </div>

  ${refeicoesHtml}

  <div style="margin-top:36px;padding-top:20px;border-top:2px solid #ede9e2;display:flex;justify-content:space-between;align-items:flex-end">
    <div>
      <p style="font-size:10px;color:#a8a099;margin-bottom:3px">Este plano foi elaborado exclusivamente para o paciente acima.</p>
      <p style="font-size:10px;color:#a8a099">Dúvidas? Entre em contato com sua nutricionista.</p>
    </div>
    <div style="text-align:center">
      <div style="width:150px;border-top:1px solid #3d3a35;padding-top:5px">
        <p style="font-size:11px;color:#3d3a35;font-weight:600">Adriana Rodrigues</p>
        <p style="font-size:10px;color:#7d7670">Nutricionista Pediátrica</p>
      </div>
    </div>
  </div>
</body>
</html>`;

    const win = window.open('', '_blank', 'width=900,height=700');
    if (!win) return;
    win.document.write(html);
    win.document.close();
    win.onload = () => { win.focus(); win.print(); };
  }

  if (variant === 'fab') {
    return (
      <button
        onClick={handlePrint}
        title="Imprimir / Salvar PDF"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 text-white pl-4 pr-5 py-3 rounded-2xl font-semibold shadow-xl hover:opacity-90 active:scale-95 transition-all"
        style={{background:'linear-gradient(135deg,#0f3d29,#1a8558)'}}
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
        </svg>
        Salvar PDF
      </button>
    );
  }

  return (
    <button
      onClick={handlePrint}
      className="w-full flex items-center justify-center gap-2 text-white py-3.5 rounded-xl font-semibold transition-all hover:opacity-90"
      style={{background:'linear-gradient(135deg,#0f3d29,#1a8558)'}}
    >
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
      </svg>
      Imprimir / Salvar PDF
    </button>
  );
}
