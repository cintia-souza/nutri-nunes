import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== 'SUPERADMIN') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
  }

  const tenants = await prisma.tenant.findMany({
    orderBy: { criadoEm: 'desc' },
    select: {
      id: true,
      nome: true,
      email: true,
      slug: true,
      ativo: true,
      criadoEm: true,
      _count: { select: { usuarios: true } },
    },
  });

  // Métricas agregadas
  const totalAtivas = tenants.filter(t => t.ativo).length;
  const totalBloqueadas = tenants.filter(t => !t.ativo).length;
  const totalPacientes = tenants.reduce((acc, t) => acc + t._count.usuarios, 0);

  return NextResponse.json({
    tenants: tenants.map(t => ({
      id: t.id,
      nome: t.nome,
      email: t.email,
      slug: t.slug,
      ativo: t.ativo,
      criadoEm: t.criadoEm,
      totalUsuarios: t._count.usuarios,
    })),
    metricas: { totalAtivas, totalBloqueadas, totalPacientes, totalTenants: tenants.length },
  });
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'SUPERADMIN') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
  }

  const body = await req.json();
  const { tenantId, ativo } = body;

  if (!tenantId || typeof tenantId !== 'string') {
    return NextResponse.json({ error: 'tenantId inválido' }, { status: 400 });
  }
  if (typeof ativo !== 'boolean') {
    return NextResponse.json({ error: 'ativo deve ser boolean' }, { status: 400 });
  }

  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId }, select: { id: true } });
  if (!tenant) {
    return NextResponse.json({ error: 'Tenant não encontrado' }, { status: 404 });
  }

  const atualizado = await prisma.tenant.update({
    where: { id: tenantId },
    data: { ativo },
    select: { id: true, nome: true, ativo: true },
  });

  return NextResponse.json(atualizado);
}
