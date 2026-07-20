import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // SUPERADMIN precisa de um tenant próprio (schema exige tenantId NOT NULL)
  // Criamos um tenant especial com slug 'nutri-hub-platform' que nunca é exposto
  const tenantPlataforma = await prisma.tenant.upsert({
    where: { slug: 'nutri-hub-platform' },
    update: {},
    create: {
      nome: 'NutriHub Platform',
      email: 'platform@nutri-hub.com',
      slug: 'nutri-hub-platform',
      ativo: true,
    },
  });

  const senhaHash = await bcrypt.hash('NutriHub@2025!', 12);

  const superAdmin = await prisma.usuario.upsert({
    where: { tenantId_email: { tenantId: tenantPlataforma.id, email: 'admin@nutri-hub.com' } },
    update: {},
    create: {
      tenantId: tenantPlataforma.id,
      nome: 'Super Admin NutriHub',
      email: 'admin@nutri-hub.com',
      senhaHash,
      role: 'SUPERADMIN',
    },
  });

  console.log('✅ SUPERADMIN criado com sucesso!');
  console.log('   Email:', superAdmin.email);
  console.log('   Senha: NutriHub@2025!');
  console.log('   Role:', superAdmin.role);
  console.log('\n⚠️  Troque a senha após o primeiro login.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
