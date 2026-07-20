import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') return NextResponse.json(null, { status: 403 });
  const { tenantId } = session;

  const posts = await prisma.post.findMany({
    where: { tenantId, publicado: true },
    orderBy: { criadoEm: 'desc' },
    select: { id: true, titulo: true, slug: true, resumo: true, imagemUrl: true, criadoEm: true },
  });
  return NextResponse.json(posts);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') return NextResponse.json(null, { status: 403 });
  const { tenantId } = session;

  const { titulo, resumo, conteudo, imagemUrl, publicado } = await req.json();
  const slug = titulo
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  const post = await prisma.post.create({
    data: { tenantId, titulo, slug, resumo, conteudo, imagemUrl, publicado: publicado ?? false },
  });
  return NextResponse.json(post, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') return NextResponse.json(null, { status: 403 });
  const { tenantId } = session;

  const { id, titulo, resumo, conteudo, imagemUrl, publicado } = await req.json();
  // Verifica ownership antes de atualizar
  const post = await prisma.post.findFirst({ where: { id, tenantId }, select: { id: true } });
  if (!post) return NextResponse.json(null, { status: 404 });

  const atualizado = await prisma.post.update({
    where: { id },
    data: { titulo, resumo, conteudo, imagemUrl, publicado },
  });
  return NextResponse.json(atualizado);
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') return NextResponse.json(null, { status: 403 });
  const { tenantId } = session;

  const { id } = await req.json();
  const post = await prisma.post.findFirst({ where: { id, tenantId }, select: { id: true } });
  if (!post) return NextResponse.json(null, { status: 404 });

  await prisma.post.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
