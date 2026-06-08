import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json(null, { status: 401 });

  const { peso, aguaMl, data } = await req.json();

  const registro = await prisma.registroProgresso.upsert({
    where: { clienteId_data: { clienteId: session.userId, data } },
    update: { ...(peso && { peso }), ...(aguaMl && { aguaMl }) },
    create: { clienteId: session.userId, data, peso, aguaMl },
  });

  return NextResponse.json(registro);
}
