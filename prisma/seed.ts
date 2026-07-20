import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // 1. Cria o Tenant (nutricionista assinante)
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'adriana' },
    update: {},
    create: {
      nome: 'Adriana Rodrigues',
      email: 'adriana@nutriinteligente.com',
      crn: 'CRN-3 45.892',
      slug: 'adriana',
      ativo: true,
    },
  });

  // 2. Cria o usuário admin vinculado ao tenant
  const senhaHash = await bcrypt.hash('admin123', 10);
  await prisma.usuario.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: 'adriana@nutriinteligente.com' } },
    update: {},
    create: {
      tenantId: tenant.id,
      nome: 'Adriana Rodrigues',
      email: 'adriana@nutriinteligente.com',
      senhaHash,
      role: 'ADMIN',
    },
  });

  // 3. Posts do blog vinculados ao tenant
  const posts = [
    {
      titulo: 'Como montar um prato equilibrado em 5 passos',
      slug: 'como-montar-um-prato-equilibrado',
      resumo: 'Descubra a regra prática para compor refeições nutritivas, saborosas e visualmente atrativas sem precisar contar calorias.',
      imagemUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=500&fit=crop',
      publicado: true,
      conteudo: `Montar um prato equilibrado não precisa ser complicado. Com algumas regras simples, você garante todos os nutrientes essenciais em cada refeição.\n\n## A Regra do Prato Saudável\n\nImagine seu prato dividido em partes:\n\n- Metade do prato: vegetais e folhas (quanto mais colorido, melhor)\n- Um quarto: proteína de qualidade (carnes magras, ovos, leguminosas)\n- Um quarto: carboidratos complexos (arroz integral, batata-doce, quinoa)\n- Uma colher: gorduras boas (azeite, abacate, castanhas)`,
    },
    {
      titulo: '7 mitos sobre dietas que você precisa parar de acreditar',
      slug: '7-mitos-sobre-dietas',
      resumo: 'De "carboidrato engorda" a "comer à noite faz mal": desvendamos as crenças populares com base em evidência científica.',
      imagemUrl: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&h=500&fit=crop',
      publicado: true,
      conteudo: `A internet está cheia de informações sobre nutrição, mas nem tudo que circula é verdade.\n\n## Mito 1: Carboidrato engorda\n\nNenhum nutriente isolado engorda. O que causa ganho de peso é o excesso calórico sustentado ao longo do tempo.`,
    },
  ];

  for (const post of posts) {
    await prisma.post.upsert({
      where: { tenantId_slug: { tenantId: tenant.id, slug: post.slug } },
      update: { titulo: post.titulo, resumo: post.resumo, conteudo: post.conteudo, imagemUrl: post.imagemUrl, publicado: post.publicado },
      create: { tenantId: tenant.id, ...post },
    });
  }

  console.log(`Seed concluído: tenant "${tenant.slug}" + admin + ${posts.length} posts`);
}

main().finally(() => prisma.$disconnect());
