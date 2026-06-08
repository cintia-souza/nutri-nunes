import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function BlogPage() {
  const posts = await prisma.post.findMany({
    where: { publicado: true },
    orderBy: { criadoEm: 'desc' },
  });

  const destaque = posts[0];
  const demais = posts.slice(1);

  return (
    <main className="min-h-screen">
      {/* Hero do Blog */}
      <section className="relative py-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-sage-50 via-cream-50 to-sage-100" />
        <div className="absolute top-10 right-10 w-64 h-64 bg-sage-200/30 rounded-full blur-3xl" aria-hidden="true" />
        <div className="absolute bottom-10 left-10 w-48 h-48 bg-sage-300/20 rounded-full blur-2xl" aria-hidden="true" />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <span className="text-sage-600 font-semibold text-sm uppercase tracking-widest">Blog</span>
          <h1 className="text-4xl md:text-5xl font-bold text-warm-800 mt-3 mb-4">
            Nutrição & Bem-estar
          </h1>
          <p className="text-warm-500 text-lg max-w-2xl mx-auto">
            Dicas baseadas em ciência, receitas saudáveis e tudo que você precisa saber para uma alimentação consciente.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-20 -mt-4">
        {posts.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-16 border border-cream-200 text-center">
            <span className="text-5xl mb-4 block">✍️</span>
            <h2 className="text-xl font-semibold text-warm-700 mb-2">Em breve</h2>
            <p className="text-warm-500">Novos artigos estão sendo preparados. Volte em breve!</p>
          </div>
        ) : (
          <>
            {/* Post destaque */}
            {destaque && (
              <Link
                href={`/blog/${destaque.slug}`}
                className="group block bg-white/80 backdrop-blur-sm rounded-3xl border border-cream-200 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden mb-10"
              >
                <div className="grid md:grid-cols-2">
                  <div className="h-64 md:h-auto overflow-hidden">
                    <img
                      src={destaque.imagemUrl || 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&h=500&fit=crop'}
                      alt={destaque.titulo}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                  <div className="p-8 md:p-10 flex flex-col justify-center">
                    <span className="text-xs font-semibold text-sage-600 bg-sage-50 px-3 py-1 rounded-lg w-fit mb-4">DESTAQUE</span>
                    <h2 className="text-2xl md:text-3xl font-bold text-warm-800 mb-3 group-hover:text-sage-700 transition-colors">
                      {destaque.titulo}
                    </h2>
                    <p className="text-warm-500 leading-relaxed mb-4 line-clamp-3">{destaque.resumo}</p>
                    <div className="flex items-center gap-3 text-sm text-warm-400">
                      <span>{new Date(destaque.criadoEm).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    </div>
                  </div>
                </div>
              </Link>
            )}

            {/* Grid de posts */}
            {demais.length > 0 && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {demais.map((post, i) => (
                  <Link
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    className="group bg-white/80 backdrop-blur-sm rounded-2xl border border-cream-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                  >
                    <div className="h-48 overflow-hidden">
                      <img
                        src={post.imagemUrl || PLACEHOLDER_IMAGES[i % PLACEHOLDER_IMAGES.length]}
                        alt={post.titulo}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-5">
                      <span className="text-xs text-warm-400">
                        {new Date(post.criadoEm).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}
                      </span>
                      <h3 className="font-bold text-warm-800 text-lg mt-2 mb-2 group-hover:text-sage-700 transition-colors line-clamp-2">
                        {post.titulo}
                      </h3>
                      <p className="text-warm-500 text-sm leading-relaxed line-clamp-3">{post.resumo}</p>
                      <span className="inline-flex items-center gap-1 text-sage-600 text-sm font-medium mt-4 group-hover:gap-2 transition-all">
                        Ler mais
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}

const PLACEHOLDER_IMAGES = [
  'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&h=350&fit=crop',
  'https://images.unsplash.com/photo-1543362906-acfc16c67564?w=500&h=350&fit=crop',
  'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=500&h=350&fit=crop',
  'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&h=350&fit=crop',
  'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=500&h=350&fit=crop',
  'https://images.unsplash.com/photo-1547592180-85f173990554?w=500&h=350&fit=crop',
];
