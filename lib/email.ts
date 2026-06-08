const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || 'onboarding@resend.dev';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function enviarEmail({ to, subject, html }: EmailOptions): Promise<boolean> {
  if (!RESEND_API_KEY) {
    console.log(`[EMAIL SIMULADO] Para: ${to} | Assunto: ${subject}`);
    return true;
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: FROM_EMAIL, to, subject, html }),
    });
    return res.ok;
  } catch {
    console.error('[EMAIL ERRO] Falha ao enviar email');
    return false;
  }
}

export function emailConfirmacaoAgendamento(nome: string, data: string, horario: string, tipo: string) {
  return {
    subject: '✅ Consulta Confirmada — Adriana Rodrigues Nutrição',
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 30px; background: #faf8f4; border-radius: 16px;">
        <h2 style="color: #44583c; margin-bottom: 8px;">Consulta Confirmada! ✅</h2>
        <p style="color: #5c5850;">Olá <strong>${nome}</strong>, sua consulta foi confirmada:</p>
        <div style="background: white; padding: 20px; border-radius: 12px; margin: 20px 0; border: 1px solid #e8e3d8;">
          <p style="margin: 4px 0; color: #3d3a35;"><strong>📋 Tipo:</strong> ${tipo}</p>
          <p style="margin: 4px 0; color: #3d3a35;"><strong>📅 Data:</strong> ${data}</p>
          <p style="margin: 4px 0; color: #3d3a35;"><strong>🕐 Horário:</strong> ${horario}</p>
        </div>
        <p style="color: #7a746a; font-size: 14px;">Caso precise remarcar ou cancelar, entre em contato conosco.</p>
        <p style="color: #556f4a; font-weight: bold; margin-top: 20px;">Adriana Rodrigues — Nutrição Inteligente</p>
      </div>
    `,
  };
}

export function emailCancelamentoAgendamento(nome: string, data: string, horario: string) {
  return {
    subject: '❌ Consulta Cancelada — Adriana Rodrigues Nutrição',
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 30px; background: #faf8f4; border-radius: 16px;">
        <h2 style="color: #c45a4a; margin-bottom: 8px;">Consulta Cancelada</h2>
        <p style="color: #5c5850;">Olá <strong>${nome}</strong>, sua consulta do dia <strong>${data}</strong> às <strong>${horario}</strong> foi cancelada.</p>
        <p style="color: #7a746a; font-size: 14px; margin-top: 16px;">Para remarcar, acesse nosso site ou entre em contato.</p>
        <p style="color: #556f4a; font-weight: bold; margin-top: 20px;">Adriana Rodrigues — Nutrição Inteligente</p>
      </div>
    `,
  };
}

export function emailRemarcacaoAgendamento(nome: string, dataAnterior: string, novaData: string, novoHorario: string) {
  return {
    subject: '🔄 Consulta Remarcada — Adriana Rodrigues Nutrição',
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 30px; background: #faf8f4; border-radius: 16px;">
        <h2 style="color: #44583c; margin-bottom: 8px;">Consulta Remarcada 🔄</h2>
        <p style="color: #5c5850;">Olá <strong>${nome}</strong>, sua consulta foi remarcada:</p>
        <div style="background: white; padding: 20px; border-radius: 12px; margin: 20px 0; border: 1px solid #e8e3d8;">
          <p style="margin: 4px 0; color: #9c9588; text-decoration: line-through;">Anterior: ${dataAnterior}</p>
          <p style="margin: 8px 0; color: #3d3a35;"><strong>📅 Nova data:</strong> ${novaData}</p>
          <p style="margin: 4px 0; color: #3d3a35;"><strong>🕐 Novo horário:</strong> ${novoHorario}</p>
        </div>
        <p style="color: #556f4a; font-weight: bold; margin-top: 20px;">Adriana Rodrigues — Nutrição Inteligente</p>
      </div>
    `,
  };
}
