import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({}, { status: 401 });

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const perfil = await (prisma as any).perfilFoto.findUnique({ where: { userId: session.userId } });
    return NextResponse.json(perfil || {});
  } catch {
    return NextResponse.json({});
  }
}
