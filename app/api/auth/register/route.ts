import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession, resolveTenantId } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    }

    // Admin cria paciente no seu próprio tenant
    const tenantId = session.tenantId;

    const body = await req.json();
    const { nome, email, senha, telefone, dataNascimento } = body;

    if (!nome || !email || !senha || typeof nome !== 'string' || typeof email !== 'string' || typeof senha !== 'string') {
      return NextResponse.json({ error: 'Nome, email e senha são obrigatórios' }, { status: 400 });
    }

    const emailNorm = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNorm)) {
      return NextResponse.json({ error: 'Email inválido' }, { status: 400 });
    }
    if (senha.length < 6) {
      return NextResponse.json({ error: 'Senha deve ter no mínimo 6 caracteres' }, { status: 400 });
    }
    if (nome.trim().length < 2 || nome.trim().length > 100) {
      return NextResponse.json({ error: 'Nome inválido' }, { status: 400 });
    }

    // Email único por tenant (não globalmente)
    const existente = await prisma.usuario.findUnique({
      where: { tenantId_email: { tenantId, email: emailNorm } },
    });
    if (existente) {
      return NextResponse.json({ error: 'Email já cadastrado' }, { status: 409 });
    }

    const senhaHash = await bcrypt.hash(senha, 12);
    const usuario = await prisma.usuario.create({
      data: { tenantId, nome: nome.trim(), email: emailNorm, senhaHash, telefone: telefone?.trim() || null, dataNascimento: dataNascimento ? new Date(dataNascimento) : null, role: 'CLIENTE' },
      select: { id: true, nome: true, email: true },
    });

    return NextResponse.json(usuario, { status: 201 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : '';
    if (msg.includes('Unique constraint')) {
      return NextResponse.json({ error: 'Email já cadastrado' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

// Exporta resolveTenantId para evitar lint de import não usado
export { resolveTenantId };
