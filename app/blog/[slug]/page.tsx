import { prisma } from '@/lib/prisma';
import { getTenantFromHost } from '@/lib/auth';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;

  const tenantId = await getTenantFromHost();
  if (!tenantId) notFound();

  const post = await prisma.post.findUnique({ where: { tenantId_slug: { tenantId, slug } } });
  if (!post || !post.publicado) notFound();

  const relacionados = await prisma.post.findMany({
    where: { tenantId, publicado: true, id: { not: post.id } },
    take: 3,
    orderBy: { criadoEm: 'desc' },
    select: { titulo: true, slug: true, resumo: true, imagemUrl: true },
  });

  return (
    <main className="min-h-screen">
      {/* Header do artigo com imagem */}
      <section className="relative h-[40vh] md:h-[50vh] overflow-hidden">
        <img
          src={post.imagemUrl || 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1600&h=800&fit=crop'}
          alt={post.titulo}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-cream-50 via-transparent to-warm-900/20" />
      </section>

      {/* Conteúdo do artigo */}
      <article className="max-w-3xl mx-auto px-6 -mt-20 relative z-10 pb-20">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg border border-cream-200 p-8 md:p-12">
          {/* Breadcrumb */}
          <Link href="/blog" className="inline-flex items-center gap-1.5 text-sage-600 text-sm font-medium hover:text-sage-700 mb-6 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Voltar ao Blog
          </Link>

          {/* Meta */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sage-400 to-sage-600 flex items-center justify-center text-white text-xs font-bold">NH</div>
            <div>
              <p className="text-sm font-medium text-warm-800">NutriHub</p>
              <p className="text-xs text-warm-400">
                {new Date(post.criadoEm).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Título */}
          <h1 className="text-3xl md:text-4xl font-bold text-warm-800 leading-tight mb-4">
            {post.titulo}
          </h1>

          {/* Resumo */}
          <p className="text-lg text-warm-500 leading-relaxed mb-8 border-l-4 border-sage-300 pl-4 italic">
            {post.resumo}
          </p>

          {/* Conteúdo */}
          <div className="prose-custom text-warm-700 leading-relaxed text-base whitespace-pre-wrap space-y-4">
            {post.conteudo.split('\n\n').map((paragrafo, i) => {
              if (paragrafo.startsWith('## ')) {
                return <h2 key={i} className="text-xl font-bold text-warm-800 mt-8 mb-3">{paragrafo.replace('## ', '')}</h2>;
              }
              if (paragrafo.startsWith('### ')) {
                return <h3 key={i} className="text-lg font-semibold text-warm-800 mt-6 mb-2">{paragrafo.replace('### ', '')}</h3>;
              }
              if (paragrafo.startsWith('- ')) {
                return (
                  <ul key={i} className="space-y-2 pl-1">
                    {paragrafo.split('\n').map((item, j) => (
                      <li key={j} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-sage-400 mt-2.5 shrink-0" />
                        <span>{item.replace('- ', '')}</span>
                      </li>
                    ))}
                  </ul>
                );
              }
              return <p key={i}>{paragrafo}</p>;
            })}
          </div>

          {/* Rodapé do artigo */}
          <div className="mt-12 pt-8 border-t border-cream-200">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sage-400 to-sage-600 flex items-center justify-center text-white font-bold shadow-sm">NH</div>
              <div>
                <p className="font-semibold text-warm-800">NutriHub</p>
                <p className="text-sm text-warm-500">Plataforma de Nutrição</p>
              </div>
            </div>
          </div>
        </div>

        {/* Posts relacionados */}
        {relacionados.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-bold text-warm-800 mb-6">Leia também</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {relacionados.map((rel) => (
                <Link
                  key={rel.slug}
                  href={`/blog/${rel.slug}`}
                  className="group bg-white/80 backdrop-blur-sm rounded-2xl border border-cream-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
                >
                  <div className="h-32 overflow-hidden">
                    <img
                      src={rel.imagemUrl || 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=200&fit=crop'}
                      alt={rel.titulo}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-warm-800 text-sm line-clamp-2 group-hover:text-sage-700 transition-colors">{rel.titulo}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>
    </main>
  );
}
