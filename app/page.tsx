import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';

interface SiteConfig {
  fotoSobre?: string; fotoCapa?: string; bio1?: string; bio2?: string;
  crn?: string; especialidades?: string[]; telefone?: string; endereco?: string; whatsapp?: string;
}

async function resolveTenantId(): Promise<string | null> {
  const headerStore = await headers();
  const slug = headerStore.get('x-tenant-slug') ?? '';
  if (!slug) return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tenant = await (prisma as any).tenant.findUnique({ where: { slug }, select: { id: true } });
  return tenant?.id ?? null;
}

const SERVICOS = [
  { titulo: 'Consulta Pediátrica', desc: 'Avaliação nutricional completa para bebês, crianças e adolescentes com plano alimentar personalizado.', icon: '👶', img: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=400&h=300&fit=crop' },
  { titulo: 'Introdução Alimentar', desc: 'Orientação segura para os primeiros alimentos do bebê a partir dos 6 meses, respeitando cada etapa.', icon: '🥣', img: 'https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=400&h=300&fit=crop' },
  { titulo: 'Seletividade Alimentar', desc: 'Estratégias para crianças com dificuldades alimentares, neofobia e recusa de alimentos.', icon: '🌈', img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop' },
  { titulo: 'Peso Saudável', desc: 'Acompanhamento do crescimento e peso ideal para cada fase, sem dietas restritivas.', icon: '📊', img: 'https://images.unsplash.com/photo-1543362906-acfc16c67564?w=400&h=300&fit=crop' },
  { titulo: 'Alergias e Intolerâncias', desc: 'Manejo nutricional de alergias alimentares, intolerância à lactose e doença celíaca.', icon: '🛡️', img: 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=400&h=300&fit=crop' },
  { titulo: 'Acompanhamento Familiar', desc: 'Educação nutricional para toda a família, criando hábitos saudáveis desde cedo.', icon: '👨‍👩‍👧', img: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=400&h=300&fit=crop' },
];

const PLANOS = [
  { nome: 'Consulta Avulsa', preco: 'R$ 250', periodo: 'por sessão', destaque: false, itens: ['Avaliação nutricional', 'Plano alimentar', 'Receitas para crianças', 'Retorno em 30 dias'] },
  { nome: 'Acompanhamento Mensal', preco: 'R$ 450', periodo: '/mês', destaque: true, itens: ['Tudo do plano avulso', 'App de acompanhamento', 'Ajustes semanais', 'Suporte via WhatsApp', 'Diário alimentar'] },
  { nome: 'Premium Trimestral', preco: 'R$ 1.100', periodo: '/trimestre', destaque: false, itens: ['Tudo do mensal', 'Avaliação antropométrica', 'Receitas exclusivas', 'Consultas ilimitadas', 'Relatório de crescimento'] },
];

export default async function HomePage() {
  let config: SiteConfig = {};
  let servicosDB: { titulo: string; descricao: string; icone?: string; imagemUrl?: string }[] = [];
  let planosDB: { nome: string; preco: string; periodo: string; destaque: boolean; itens: string[] }[] = [];
  let avaliacoes: { nota: number; texto: string; cliente: { nome: string } }[] = [];

  try {
    const tenantId = await resolveTenantId();
    if (!tenantId) notFound();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const p = prisma as any;
    if (tenantId) {
      config = (await p.configSite.findUnique({ where: { tenantId } })) || {};
      servicosDB = await p.servico.findMany({ where: { tenantId, ativo: true }, orderBy: { ordem: 'asc' } }).catch(() => []);
      planosDB = await p.plano.findMany({ where: { tenantId, ativo: true }, orderBy: { ordem: 'asc' } }).catch(() => []);
      avaliacoes = await p.avaliacao.findMany({ where: { aprovada: true, cliente: { tenantId } }, orderBy: { criadoEm: 'desc' }, take: 6, include: { cliente: { select: { nome: true } } } }).catch(() => []);
    }
  } catch { /* banco offline */ }

  const servicosFinal = servicosDB.length > 0 ? servicosDB.map(s => ({ titulo: s.titulo, desc: s.descricao, icon: s.icone || '🥗', img: s.imagemUrl || '' })) : SERVICOS;
  const planosFinal = planosDB.length > 0 ? planosDB : PLANOS;

  const fotoSobre = config.fotoSobre || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=600&h=750&fit=crop';
  const fotoCapa = config.fotoCapa || 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=1920&h=1080&fit=crop';
  const bio1 = config.bio1 || 'Sou nutricionista pediátrica formada pela USP, especialista em alimentação infantil e introdução alimentar. Há 8 anos ajudo famílias a criarem uma relação saudável e feliz com a comida desde os primeiros meses de vida.';
  const bio2 = config.bio2 || 'Minha abordagem é acolhedora e baseada em evidências — sem julgamentos, sem dietas restritivas. Acredito que cada criança tem seu ritmo e que pais bem orientados fazem toda a diferença.';
  const crn = config.crn || 'CRN-3 • 45.892';
  const especialidades = config.especialidades?.length ? config.especialidades : ['Nutrição Pediátrica', 'Introdução Alimentar', 'Seletividade', 'Alergias Alimentares'];
  const whatsapp = config.whatsapp || '5511999999999';
  const telefone = config.telefone || '(11) 99999-9999';
  const endereco = config.endereco || 'São Paulo, SP';

  return (
    <main className="min-h-screen overflow-hidden">

      {/* HERO */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={fotoCapa} alt="" className="w-full h-full object-cover" aria-hidden="true" />
          <div className="absolute inset-0" style={{background: 'linear-gradient(to right, rgba(15,61,41,0.88), rgba(20,84,56,0.55), transparent)'}} />
          <div className="absolute inset-0" style={{background: 'linear-gradient(to top, #fdfcfb 0%, transparent 40%)'}} />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-slide-up">
            <span className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6 border border-white/20">
              {crn} · Nutrição Pediátrica
            </span>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-[1.1] tracking-tight">
              Nutrição que<br />
              <span className="text-coral-300">cuida</span> desde<br />
              o início
            </h1>
            <p className="text-lg text-white/80 mb-8 max-w-lg leading-relaxed">
              Especialista em alimentação infantil — do desmame à adolescência. Ajudo sua família a criar uma relação saudável e feliz com a comida.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/login" style={{backgroundColor:'#ff7a55'}} className="text-white px-7 py-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 min-h-[52px] flex items-center gap-2">
                Agendar Consulta
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
              </Link>
              <Link href="#sobre" className="text-white px-7 py-4 rounded-2xl font-medium transition-all duration-300 min-h-[52px] flex items-center" style={{border:'2px solid rgba(255,255,255,0.6)', backgroundColor:'rgba(255,255,255,0.1)'}}>
                Conheça-me
              </Link>
            </div>
          </div>


        </div>
      </section>

      {/* SOBRE */}
      <section id="sobre" className="py-24 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div className="relative">
            <div className="absolute -top-4 -left-4 w-full h-full bg-mint-200/40 blob rounded-3xl" aria-hidden="true" />
            <img src={fotoSobre} alt="Nutricionista" className="relative rounded-3xl object-cover w-full h-[500px] shadow-lg" />
            <div className="absolute -bottom-6 -right-6 bg-white rounded-2xl shadow-lg p-5 animate-fade-slide-in">
              <p className="text-mint-700 font-bold text-lg">{crn}</p>
              <p className="text-stone-500 text-sm">Nutricionista Pediátrica</p>
            </div>
          </div>

          <div>
            <span className="text-coral-500 font-semibold text-sm uppercase tracking-wider">Sobre mim</span>
            <h2 className="text-3xl md:text-4xl font-bold text-stone-800 mt-3 mb-6 leading-tight">
              Olá, eu sou a <span className="text-gradient">Adriana Rodrigues</span>
            </h2>
            <p className="text-stone-600 leading-relaxed mb-4">{bio1}</p>
            <p className="text-stone-600 leading-relaxed mb-6">{bio2}</p>
            <div className="flex flex-wrap gap-3">
              {especialidades.map((tag) => (
                <span key={tag} className="bg-mint-50 text-mint-700 px-4 py-2 rounded-xl text-sm font-medium border border-mint-100">{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SERVIÇOS */}
      <section id="servicos" className="py-24 px-6 bg-stone-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-coral-500 font-semibold text-sm uppercase tracking-wider">Serviços</span>
            <h2 className="text-3xl md:text-4xl font-bold text-stone-800 mt-3">Como posso ajudar sua família</h2>
            <p className="text-stone-500 mt-4 max-w-2xl mx-auto text-lg">Atendimento especializado em nutrição infantil para cada fase do desenvolvimento.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {servicosFinal.map((s, i) => (
              <div key={s.titulo} className={`group bg-white rounded-3xl overflow-hidden transition-all duration-500 hover:-translate-y-2 animate-fade-slide-up stagger-${Math.min(i + 1, 6)}`} style={{boxShadow:'0 4px 20px rgba(0,0,0,0.07)'}}>
                {s.img && (
                  <div className="h-48 overflow-hidden">
                    <img src={s.img} alt={s.titulo} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  </div>
                )}
                <div className="p-6">
                  <span className="text-2xl" aria-hidden="true">{s.icon}</span>
                  <h3 className="font-bold text-stone-800 text-lg mt-3 mb-2">{s.titulo}</h3>
                  <p className="text-stone-500 text-sm leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PLANOS */}
      <section id="planos" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-coral-500 font-semibold text-sm uppercase tracking-wider">Investimento</span>
            <h2 className="text-3xl md:text-4xl font-bold text-stone-800 mt-3">Planos & Valores</h2>
            <p className="text-stone-500 mt-4 text-lg">Escolha o acompanhamento ideal para sua família.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {planosFinal.map((plano) => (
              <div key={plano.nome} className="relative rounded-3xl p-10 transition-all duration-300 hover:-translate-y-1" style={plano.destaque ? {background:'linear-gradient(135deg,#1a8558,#0f3d29)',boxShadow:'0 8px 40px rgba(26,133,88,0.3)',color:'white'} : {background:'#ffffff',boxShadow:'0 4px 24px rgba(0,0,0,0.07)',border:'1px solid #ede9e2'}}>
                {plano.destaque && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-white text-xs font-bold uppercase px-4 py-1 rounded-full shadow-sm" style={{backgroundColor:'#ff7a55'}}>Mais Popular</span>
                )}
                <h3 className={`font-bold text-lg mb-1 ${plano.destaque ? 'text-white' : 'text-stone-800'}`}>{plano.nome}</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className={`text-4xl font-bold ${plano.destaque ? 'text-white' : 'text-mint-700'}`}>{plano.preco}</span>
                  <span className={`text-sm ${plano.destaque ? 'text-mint-200' : 'text-stone-400'}`}>{plano.periodo}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plano.itens.map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <svg className={`w-5 h-5 shrink-0 mt-0.5 ${plano.destaque ? 'text-mint-200' : 'text-mint-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      <span className={`text-sm ${plano.destaque ? 'text-mint-100' : 'text-stone-600'}`}>{item}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/login" className="block text-center w-full py-3.5 rounded-xl font-semibold transition-all duration-200 min-h-[48px]" style={plano.destaque ? {backgroundColor:'white', color:'#1a8558'} : {backgroundColor:'#1a8558', color:'white'}}>
                  Começar Agora
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DEPOIMENTOS */}
      {avaliacoes.length > 0 && (
        <section className="py-24 px-6 bg-stone-100">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <span className="text-coral-500 font-semibold text-sm uppercase tracking-wider">Depoimentos</span>
              <h2 className="text-3xl md:text-4xl font-bold text-stone-800 mt-3">O que as famílias dizem</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {avaliacoes.map((a, i) => (
                <div key={i} className="bg-white rounded-3xl p-7 transition-all duration-300" style={{boxShadow:'0 4px 20px rgba(0,0,0,0.07)'}}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-mint-400 to-mint-600 flex items-center justify-center text-white font-bold text-sm">
                      {a.cliente.nome.split(' ').map((n: string) => n[0]).slice(0, 2).join('')}
                    </div>
                    <div>
                      <p className="font-semibold text-stone-800 text-sm">{a.cliente.nome.split(' ')[0]} {a.cliente.nome.split(' ').slice(-1)[0]?.[0]}.</p>
                      <div className="flex gap-0.5 text-honey-400 text-xs">{'★'.repeat(a.nota)}{'☆'.repeat(5 - a.nota)}</div>
                    </div>
                  </div>
                  <p className="text-stone-600 text-sm leading-relaxed italic">&ldquo;{a.texto}&rdquo;</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0" style={{background:'linear-gradient(135deg,#0f3d29,#166947,#1a8558)'}} />
        <div className="absolute top-0 right-0 w-96 h-96 blob animate-float" style={{backgroundColor:'rgba(255,122,85,0.12)'}} aria-hidden="true" />
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <span className="text-4xl mb-4 block">🌱</span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Pronta para cuidar da alimentação do seu filho?</h2>
          <p className="text-white/80 text-lg mb-8">Agende uma consulta e dê o primeiro passo para uma infância mais saudável e feliz.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/login" className="text-white px-8 py-4 rounded-2xl font-semibold shadow-lg hover:scale-[1.02] transition-all duration-300 min-h-[52px]" style={{backgroundColor:'#ff7a55'}}>
              Agendar Consulta
            </Link>
            <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer" className="border-2 border-white/50 text-white px-8 py-4 rounded-2xl font-medium hover:bg-white/10 transition-all duration-300 min-h-[52px] flex items-center gap-2">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.12.553 4.11 1.519 5.838L.057 23.647l5.965-1.414A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.82c-1.94 0-3.79-.5-5.4-1.44l-.39-.23-3.54.84.89-3.43-.26-.4A9.82 9.82 0 012.18 12c0-5.41 4.41-9.82 9.82-9.82 5.41 0 9.82 4.41 9.82 9.82 0 5.41-4.41 9.82-9.82 9.82z"/></svg>
              WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* BLOG */}
      <section className="py-24 px-6" aria-labelledby="blog-heading">
        <div className="max-w-5xl mx-auto text-center">
          <span className="text-coral-500 font-semibold text-sm uppercase tracking-wider">Blog</span>
          <h2 id="blog-heading" className="text-3xl md:text-4xl font-bold text-stone-800 mt-3 mb-4">Dicas para pais</h2>
          <p className="text-stone-500 text-lg mb-10">Conteúdo baseado em evidências para ajudar no dia a dia da alimentação infantil.</p>
          <div className="grid md:grid-cols-3 gap-6 mb-10">
            {[
              { img: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=400&h=250&fit=crop', titulo: 'Como fazer a introdução alimentar com segurança', tag: 'Introdução Alimentar' },
              { img: 'https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=400&h=250&fit=crop', titulo: 'Meu filho não quer comer: o que fazer?', tag: 'Seletividade' },
              { img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=250&fit=crop', titulo: '10 lanches saudáveis para crianças em idade escolar', tag: 'Dicas' },
            ].map((post) => (
              <div key={post.titulo} className="bg-white rounded-3xl overflow-hidden transition-all duration-300 text-left group" style={{boxShadow:'0 4px 20px rgba(0,0,0,0.07)'}}>
                <div className="h-44 overflow-hidden">
                  <img src={post.img} alt={post.titulo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-5">
                  <span className="text-xs font-semibold text-mint-600 bg-mint-50 px-2.5 py-1 rounded-lg">{post.tag}</span>
                  <h3 className="font-semibold text-stone-800 mt-3 text-sm leading-snug">{post.titulo}</h3>
                </div>
              </div>
            ))}
          </div>
          <Link href="/blog" className="inline-flex items-center gap-2 text-mint-700 font-semibold hover:text-mint-800 transition-colors px-4 py-2 rounded-xl hover:bg-mint-50">
            Ver todos os artigos
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{background:'linear-gradient(160deg,#0f2d1e 0%,#0f3d29 50%,#1a2e1a 100%)'}} className="text-white pt-16 pb-8 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-12 gap-10 pb-12 border-b border-white/10">

            {/* Brand */}
            <div className="md:col-span-5">
              <img src="/logo.png" alt="NutriHub" className="h-12 w-auto object-contain mb-5" style={{filter:'brightness(0) invert(1)', maxWidth:'200px'}} />
              <p className="text-stone-300 text-sm leading-relaxed max-w-xs mb-6">
                Nutrição pediátrica com carinho e ciência. Ajudando famílias a criar uma relação saudável com a comida desde os primeiros meses de vida.
              </p>
              {/* Redes sociais */}
              <div className="flex gap-3">
                {[
                  { label: 'Instagram', href: '#', icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg> },
                  { label: 'WhatsApp', href: `https://wa.me/${whatsapp}`, icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.12.553 4.11 1.519 5.838L.057 23.647l5.965-1.414A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.82c-1.94 0-3.79-.5-5.4-1.44l-.39-.23-3.54.84.89-3.43-.26-.4A9.82 9.82 0 012.18 12c0-5.41 4.41-9.82 9.82-9.82 5.41 0 9.82 4.41 9.82 9.82 0 5.41-4.41 9.82-9.82 9.82z"/></svg> },
                ].map(({ label, href, icon }) => (
                  <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-stone-300 hover:text-white transition-all duration-200"
                    style={{backgroundColor:'rgba(255,255,255,0.08)'}}>
                    {icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Links */}
            <div className="md:col-span-3">
              <h4 className="font-semibold mb-5 text-xs uppercase tracking-widest" style={{color:'#ff7a55'}}>Navegação</h4>
              <ul className="space-y-3 text-sm">
                {[['/#sobre','Sobre mim'],['/#servicos','Serviços'],['/#planos','Planos & Valores'],['/blog','Blog']].map(([href, label]) => (
                  <li key={href}>
                    <Link href={href} className="text-stone-400 hover:text-white transition-colors flex items-center gap-2 group">
                      <span className="w-1 h-1 rounded-full bg-stone-600 group-hover:bg-coral-400 transition-colors" style={{}} />
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contato */}
            <div className="md:col-span-4">
              <h4 className="font-semibold mb-5 text-xs uppercase tracking-widest" style={{color:'#ff7a55'}}>Contato</h4>
              <ul className="space-y-4 text-sm">
                <li className="flex items-start gap-3 text-stone-300">
                  <span className="text-base mt-0.5">📍</span>
                  <span>{endereco}</span>
                </li>
                <li className="flex items-start gap-3 text-stone-300">
                  <span className="text-base mt-0.5">📞</span>
                  <span>{telefone}</span>
                </li>
                <li className="pt-2">
                  <Link href="/login"
                    className="inline-flex items-center gap-2 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all duration-200 hover:opacity-90"
                    style={{backgroundColor:'#ff7a55'}}>
                    Agendar Consulta
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-stone-500 text-xs">© {new Date().getFullYear()} NutriHub. Todos os direitos reservados.</p>
            <p className="text-stone-600 text-xs">{crn}</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
