const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || 'onboarding@resend.dev';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

function esc(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;');
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
      body: JSON.stringify({ from: FROM_EMAIL, to: [to], subject, html }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error(`[EMAIL ERRO] Status ${res.status}: ${err}`);
      return false;
    }

    console.log(`[EMAIL OK] Enviado para: ${to}`);
    return true;
  } catch (e) {
    console.error('[EMAIL ERRO] Exceção:', e);
    return false;
  }
}

export function emailAgendamentoRecebido(nome: string, data: string, horario: string, tipo: string) {
  const [n, d, h, t] = [esc(nome), esc(data), esc(horario), esc(tipo)];
  return {
    subject: 'Agendamento Recebido — Adriana Rodrigues Nutrição',
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 30px; background: #faf8f4; border-radius: 16px;">
        <h2 style="color: #44583c; margin-bottom: 8px;">Agendamento Recebido!</h2>
        <p style="color: #5c5850;">Olá <strong>${n}</strong>, recebemos seu pedido de consulta:</p>
        <div style="background: white; padding: 20px; border-radius: 12px; margin: 20px 0; border: 1px solid #e8e3d8;">
          <p style="margin: 4px 0; color: #3d3a35;"><strong>Tipo:</strong> ${t}</p>
          <p style="margin: 4px 0; color: #3d3a35;"><strong>Data:</strong> ${d}</p>
          <p style="margin: 4px 0; color: #3d3a35;"><strong>Horário:</strong> ${h}</p>
        </div>
        <p style="color: #7a746a; font-size: 14px;">Aguarde a confirmação — você receberá outro email quando sua consulta for confirmada.</p>
        <p style="color: #556f4a; font-weight: bold; margin-top: 20px;">Adriana Rodrigues — Nutrição Inteligente</p>
      </div>
    `,
  };
}

export function emailConfirmacaoAgendamento(nome: string, data: string, horario: string, tipo: string) {
  const [n, d, h, t] = [esc(nome), esc(data), esc(horario), esc(tipo)];
  return {
    subject: 'Consulta Confirmada — Adriana Rodrigues Nutrição',
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 30px; background: #faf8f4; border-radius: 16px;">
        <h2 style="color: #44583c; margin-bottom: 8px;">Consulta Confirmada!</h2>
        <p style="color: #5c5850;">Olá <strong>${n}</strong>, sua consulta foi confirmada:</p>
        <div style="background: white; padding: 20px; border-radius: 12px; margin: 20px 0; border: 1px solid #e8e3d8;">
          <p style="margin: 4px 0; color: #3d3a35;"><strong>Tipo:</strong> ${t}</p>
          <p style="margin: 4px 0; color: #3d3a35;"><strong>Data:</strong> ${d}</p>
          <p style="margin: 4px 0; color: #3d3a35;"><strong>Horário:</strong> ${h}</p>
        </div>
        <p style="color: #7a746a; font-size: 14px;">Caso precise remarcar ou cancelar, entre em contato conosco.</p>
        <p style="color: #556f4a; font-weight: bold; margin-top: 20px;">Adriana Rodrigues — Nutrição Inteligente</p>
      </div>
    `,
  };
}

export function emailCancelamentoAgendamento(nome: string, data: string, horario: string) {
  const [n, d, h] = [esc(nome), esc(data), esc(horario)];
  return {
    subject: 'Consulta Cancelada — Adriana Rodrigues Nutrição',
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 30px; background: #faf8f4; border-radius: 16px;">
        <h2 style="color: #c45a4a; margin-bottom: 8px;">Consulta Cancelada</h2>
        <p style="color: #5c5850;">Olá <strong>${n}</strong>, sua consulta do dia <strong>${d}</strong> às <strong>${h}</strong> foi cancelada.</p>
        <p style="color: #7a746a; font-size: 14px; margin-top: 16px;">Para remarcar, acesse nosso site ou entre em contato.</p>
        <p style="color: #556f4a; font-weight: bold; margin-top: 20px;">Adriana Rodrigues — Nutrição Inteligente</p>
      </div>
    `,
  };
}

export function emailRemarcacaoAgendamento(nome: string, dataAnterior: string, novaData: string, novoHorario: string) {
  const [n, da, nd, nh] = [esc(nome), esc(dataAnterior), esc(novaData), esc(novoHorario)];
  return {
    subject: 'Consulta Remarcada — Adriana Rodrigues Nutrição',
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 30px; background: #faf8f4; border-radius: 16px;">
        <h2 style="color: #44583c; margin-bottom: 8px;">Consulta Remarcada</h2>
        <p style="color: #5c5850;">Olá <strong>${n}</strong>, sua consulta foi remarcada:</p>
        <div style="background: white; padding: 20px; border-radius: 12px; margin: 20px 0; border: 1px solid #e8e3d8;">
          <p style="margin: 4px 0; color: #9c9588; text-decoration: line-through;">Anterior: ${da}</p>
          <p style="margin: 8px 0; color: #3d3a35;"><strong>Nova data:</strong> ${nd}</p>
          <p style="margin: 4px 0; color: #3d3a35;"><strong>Novo horário:</strong> ${nh}</p>
        </div>
        <p style="color: #556f4a; font-weight: bold; margin-top: 20px;">Adriana Rodrigues — Nutrição Inteligente</p>
      </div>
    `,
  };
}
