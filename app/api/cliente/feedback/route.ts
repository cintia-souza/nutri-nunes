import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

    const { texto, data } = await req.json();

    if (!texto || typeof texto !== 'string' || texto.trim().length === 0) {
      return NextResponse.json({ error: 'Texto é obrigatório' }, { status: 400 });
    }

    if (texto.length > 2000) {
      return NextResponse.json({ error: 'Texto muito longo (máx. 2000 caracteres)' }, { status: 400 });
    }

    if (!data || !/^\d{4}-\d{2}-\d{2}$/.test(data)) {
      return NextResponse.json({ error: 'Data inválida' }, { status: 400 });
    }

    const feedback = await prisma.feedback.create({
      data: { clienteId: session.userId, texto: texto.trim(), data },
    });

    return NextResponse.json(feedback, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
