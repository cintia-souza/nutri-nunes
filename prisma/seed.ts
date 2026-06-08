import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Admin
  const senhaHash = await bcrypt.hash('admin123', 10);
  await prisma.usuario.upsert({
    where: { email: 'adriana@nutriinteligente.com' },
    update: {},
    create: {
      nome: 'Adriana Rodrigues',
      email: 'adriana@nutriinteligente.com',
      senhaHash,
      role: 'ADMIN',
    },
  });

  // Posts do blog
  const posts = [
    {
      titulo: 'Como montar um prato equilibrado em 5 passos',
      slug: 'como-montar-um-prato-equilibrado',
      resumo: 'Descubra a regra prática para compor refeições nutritivas, saborosas e visualmente atrativas sem precisar contar calorias.',
      imagemUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=500&fit=crop',
      publicado: true,
      conteudo: `Montar um prato equilibrado não precisa ser complicado. Com algumas regras simples, você garante todos os nutrientes essenciais em cada refeição.

## A Regra do Prato Saudável

Imagine seu prato dividido em partes:

- Metade do prato: vegetais e folhas (quanto mais colorido, melhor)
- Um quarto: proteína de qualidade (carnes magras, ovos, leguminosas)
- Um quarto: carboidratos complexos (arroz integral, batata-doce, quinoa)
- Uma colher: gorduras boas (azeite, abacate, castanhas)

## Por que funciona?

Essa distribuição garante saciedade prolongada, energia estável ao longo do dia e todos os micronutrientes que seu corpo precisa para funcionar bem.

## Dica extra

Comece sempre pelos vegetais. Quando enchemos metade do prato com salada e legumes, naturalmente reduzimos as porções dos outros grupos sem sentir fome.

A variedade de cores é chave: cada cor representa diferentes fitoquímicos e antioxidantes. Tente incluir ao menos 3 cores diferentes no prato.`,
    },
    {
      titulo: '7 mitos sobre dietas que você precisa parar de acreditar',
      slug: '7-mitos-sobre-dietas',
      resumo: 'De "carboidrato engorda" a "comer à noite faz mal": desvendamos as crenças populares com base em evidência científica.',
      imagemUrl: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&h=500&fit=crop',
      publicado: true,
      conteudo: `A internet está cheia de informações sobre nutrição, mas nem tudo que circula é verdade. Vamos desmistificar 7 crenças populares.

## Mito 1: Carboidrato engorda

Nenhum nutriente isolado engorda. O que causa ganho de peso é o excesso calórico sustentado ao longo do tempo, independente da fonte.

## Mito 2: Comer à noite faz mal

Seu corpo não sabe que horas são. O que importa é o balanço calórico e nutricional do dia inteiro, não o horário específico da refeição.

## Mito 3: Suco detox elimina toxinas

Seu fígado e rins fazem esse trabalho 24h por dia. Sucos verdes são saudáveis pelo aporte de vitaminas, não por "desintoxicar".

## Mito 4: Ovo aumenta colesterol

Estudos recentes mostram que para a maioria das pessoas, o colesterol dietético tem impacto mínimo no colesterol sanguíneo. Pode comer sem culpa.

## Mito 5: Glúten faz mal para todos

Apenas celíacos e sensíveis ao glúten precisam evitá-lo. Para o restante da população, não há benefício em cortá-lo.

## Mito 6: Tem que comer de 3 em 3 horas

Não existe regra universal. Algumas pessoas se dão bem com mais refeições, outras com menos. O importante é atender suas necessidades nutricionais.

## Mito 7: Dieta restritiva é mais eficiente

Dietas muito restritivas podem funcionar a curto prazo, mas têm altas taxas de reganho de peso. A reeducação alimentar sustentável é sempre superior.`,
    },
    {
      titulo: 'Nutrição pré e pós-treino: guia completo',
      slug: 'nutricao-pre-pos-treino',
      resumo: 'O que comer antes e depois do exercício físico para maximizar performance, recuperação muscular e resultados.',
      imagemUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&h=500&fit=crop',
      publicado: true,
      conteudo: `A alimentação ao redor do treino pode potencializar (ou atrapalhar) seus resultados. Veja o que a ciência recomenda.

## Pré-treino (1-2h antes)

O objetivo é fornecer energia e evitar desconforto gástrico:

- Carboidratos de fácil digestão: banana, pão integral, aveia
- Proteína moderada: iogurte, ovo cozido
- Pouca gordura e fibra (demoram para digerir)

### Exemplo prático
Banana com pasta de amendoim e uma fatia de pão integral.

## Pós-treino (até 2h depois)

O foco é recuperação muscular e reposição de glicogênio:

- Proteína de qualidade: frango, peixe, whey, ovos
- Carboidratos: arroz, batata-doce, frutas
- Hidratação adequada com água ou água de coco

### Exemplo prático
Frango grelhado com batata-doce e salada verde, acompanhado de bastante água.

## Hidratação

Beba água antes, durante e após o treino. Para atividades acima de 1 hora, considere uma bebida isotônica para repor eletrólitos.

A individualização é essencial — o que funciona para um atleta pode não funcionar para você. Consulte uma nutricionista esportiva para um plano personalizado.`,
    },
    {
      titulo: 'A importância da hidratação: quanto de água devo beber?',
      slug: 'importancia-da-hidratacao',
      resumo: 'Entenda por que a água é essencial para seu metabolismo e como calcular a quantidade ideal para o seu corpo.',
      imagemUrl: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=800&h=500&fit=crop',
      publicado: true,
      conteudo: `A água compõe cerca de 60% do nosso corpo e participa de praticamente todas as reações metabólicas. Manter-se hidratado é fundamental.

## Como calcular sua necessidade

Uma referência prática é: 35ml por kg de peso corporal.

- Pessoa de 60kg: ~2.100ml/dia
- Pessoa de 80kg: ~2.800ml/dia

## Fatores que aumentam a necessidade

- Exercício físico intenso
- Clima quente
- Altitude elevada
- Consumo de cafeína ou álcool
- Período gestacional ou amamentação

## Sinais de desidratação

- Urina escura e com odor forte
- Dor de cabeça frequente
- Cansaço sem motivo aparente
- Pele ressecada
- Dificuldade de concentração

## Dicas para beber mais água

- Tenha uma garrafa sempre visível
- Adicione sabor natural: limão, hortelã, gengibre
- Estabeleça gatilhos: um copo ao acordar, antes de cada refeição
- Use aplicativos de lembrete
- Alimentos ricos em água também contam: melancia, pepino, tomate`,
    },
    {
      titulo: 'Reeducação alimentar: por que dietas restritivas não funcionam',
      slug: 'reeducacao-alimentar',
      resumo: 'Entenda a diferença entre dieta e reeducação alimentar, e por que mudar hábitos gradualmente traz resultados permanentes.',
      imagemUrl: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800&h=500&fit=crop',
      publicado: true,
      conteudo: `Se você já fez dieta, perdeu peso e depois recuperou tudo (e mais um pouco), saiba que isso é extremamente comum — e não é culpa sua.

## O problema das dietas restritivas

Dietas muito radicais causam:

- Perda de massa muscular (não apenas gordura)
- Redução do metabolismo basal
- Aumento de compulsão alimentar
- Relação negativa com comida
- Efeito sanfona

## O que é reeducação alimentar?

É um processo gradual de construir novos hábitos, sem listas de alimentos proibidos. Você aprende a fazer escolhas melhores por entender como os alimentos afetam seu corpo.

## Princípios fundamentais

- Nenhum alimento é proibido — existem frequências diferentes
- Mudanças pequenas e consistentes superam mudanças radicais e temporárias
- Prazer na alimentação não é opcional — é parte do processo
- Resultados sustentáveis levam tempo e isso é normal

## Como começar

### Semana 1-2
Observe seus hábitos sem julgamento. Anote o que come e como se sente.

### Semana 3-4
Introduza uma mudança por vez: mais vegetais no almoço, ou trocar refrigerante por água saborizada.

### Mês 2 em diante
Construa progressivamente. Cada pequena mudança que se mantém é uma vitória permanente.

O acompanhamento profissional acelera esse processo e evita deficiências nutricionais. Agende uma consulta e comece sua transformação de forma segura.`,
    },
  ];

  for (const post of posts) {
    await prisma.post.upsert({
      where: { slug: post.slug },
      update: { titulo: post.titulo, resumo: post.resumo, conteudo: post.conteudo, imagemUrl: post.imagemUrl, publicado: post.publicado },
      create: post,
    });
  }

  console.log('Seed concluído: admin + 5 posts de blog criados');
}

main().finally(() => prisma.$disconnect());
