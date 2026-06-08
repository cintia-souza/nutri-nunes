import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

// GET público - lista posts publicados
export async function GET() {
  const posts = await prisma.post.findMany({
    where: { publicado: true },
    orderBy: { criadoEm: 'desc' },
    select: { id: true, titulo: true, slug: true, resumo: true, imagemUrl: true, criadoEm: true },
  });
  return NextResponse.json(posts);
}

// POST - criar post (admin only)
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') return NextResponse.json(null, { status: 403 });

  const { titulo, resumo, conteudo, imagemUrl, publicado } = await req.json();
  const slug = titulo
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  const post = await prisma.post.create({
    data: { titulo, slug, resumo, conteudo, imagemUrl, publicado: publicado ?? false },
  });

  return NextResponse.json(post, { status: 201 });
}

// PUT - editar post (admin only)
export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') return NextResponse.json(null, { status: 403 });

  const { id, titulo, resumo, conteudo, imagemUrl, publicado } = await req.json();

  const post = await prisma.post.update({
    where: { id },
    data: { titulo, resumo, conteudo, imagemUrl, publicado },
  });

  return NextResponse.json(post);
}

// DELETE - excluir post (admin only)
export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') return NextResponse.json(null, { status: 403 });

  const { id } = await req.json();
  await prisma.post.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
