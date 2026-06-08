import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json(null, { status: 401 });

  const { texto, data } = await req.json();

  const feedback = await prisma.feedback.create({
    data: { clienteId: session.userId, texto, data },
  });

  return NextResponse.json(feedback, { status: 201 });
}
