import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json([], { status: 401 });

  const progressos = await prisma.registroProgresso.findMany({
    where: { clienteId: session.userId },
    orderBy: { data: 'asc' },
    take: 60,
  });

  return NextResponse.json(progressos);
}
