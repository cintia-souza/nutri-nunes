import CalculadoraIMC from '@/components/CalculadoraIMC';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

interface SiteConfig {
  fotoSobre?: string;
  fotoCapa?: string;
  bio1?: string;
  bio2?: string;
  crn?: string;
  especialidades?: string[];
  telefone?: string;
  endereco?: string;
  whatsapp?: string;
}

const SERVICOS = [
  {
    titulo: 'Consulta Inicial',
    desc: 'Avaliação completa do perfil nutricional, anamnese detalhada e definição de metas personalizadas.',
    icon: '🔬',
    img: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=300&fit=crop',
  },
  {
    titulo: 'Plano Alimentar',
    desc: 'Cardápio personalizado com receitas práticas, lista de compras e substituições inteligentes.',
    icon: '🥗',
    img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop',
  },
  {
    titulo: 'Acompanhamento Contínuo',
    desc: 'Monitoramento semanal via app, ajustes de dieta e suporte por mensagem.',
    icon: '📱',
    img: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=400&h=300&fit=crop',
  },
  {
    titulo: 'Nutrição Esportiva',
    desc: 'Performance otimizada com periodização nutricional para atletas e praticantes.',
    icon: '💪',
    img: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=300&fit=crop',
  },
  {
    titulo: 'Reeducação Alimentar',
    desc: 'Transforme hábitos de forma sustentável, sem dietas restritivas ou radicais.',
    icon: '🌱',
    img: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=300&fit=crop',
  },
  {
    titulo: 'Nutrição Clínica',
    desc: 'Acompanhamento especializado para diabetes, hipertensão, intolerâncias e alergias.',
    icon: '🩺',
    img: 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=400&h=300&fit=crop',
  },
];

const PLANOS = [
  {
    nome: 'Consulta Avulsa',
    preco: 'R$ 250',
    periodo: 'por sessão',
    destaque: false,
    itens: ['Avaliação completa', 'Plano alimentar', 'Receitas personalizadas', 'Retorno em 30 dias'],
  },
  {
    nome: 'Acompanhamento Mensal',
    preco: 'R$ 450',
    periodo: '/mês',
    destaque: true,
    itens: ['Tudo do plano avulso', 'App de acompanhamento', 'Ajustes semanais', 'Suporte via WhatsApp', 'Checklist de refeições'],
  },
  {
    nome: 'Premium Trimestral',
    preco: 'R$ 1.100',
    periodo: '/trimestre',
    destaque: false,
    itens: ['Tudo do mensal', 'Bioimpedância mensal', 'Receitas exclusivas', 'Consultas ilimitadas', 'Relatório de evolução'],
  },
];

const DEPOIMENTOS = [
  { nome: 'Camila S.', texto: 'Perdi 12kg em 4 meses sem passar fome. A Adriana mudou minha relação com a comida!', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face' },
  { nome: 'Roberto M.', texto: 'Minha performance nos treinos melhorou absurdamente. Recomendo demais!', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face' },
  { nome: 'Ana Paula R.', texto: 'O app facilita muito o dia a dia. Consigo acompanhar tudo pelo celular.', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face' },
];

export default async function HomePage() {
  let config: SiteConfig = {};
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    config = (await (prisma as any).configSite.findUnique({ where: { id: 'config' } })) || {};
  } catch { /* tabela pode não existir ainda */ }

  const fotoSobre = config.fotoSobre || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=600&h=750&fit=crop';
  const fotoCapa = config.fotoCapa || 'https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=1920&h=1080&fit=crop';
  const bio1 = config.bio1 || 'Sou nutricionista formada pela USP, pós-graduada em Nutrição Clínica Funcional e Nutrição Esportiva. Há 8 anos ajudo pessoas a transformarem sua saúde através da alimentação consciente.';
  const bio2 = config.bio2 || 'Minha abordagem é individualizada — nada de dietas genéricas. Utilizo tecnologia e acompanhamento próximo para garantir que cada paciente alcance seus objetivos de forma saudável e duradoura.';
  const crn = config.crn || 'CRN-3 • 45.892';
  const especialidades = config.especialidades?.length ? config.especialidades : ['Nutrição Clínica', 'Esportiva', 'Emagrecimento', 'Reeducação'];
  const whatsapp = config.whatsapp || '5511999999999';
  const telefone = config.telefone || '(11) 99999-9999';
  const endereco = config.endereco || 'São Paulo, SP';

  return (
    <main className="min-h-screen overflow-hidden">
      {/* HERO — Full visual com imagem */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          <img
            src={fotoCapa}
            alt=""
            className="w-full h-full object-cover"
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-sage-900/80 via-sage-800/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-cream-50 via-transparent to-transparent" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-slide-up">
            <span className="inline-block bg-white/20 backdrop-blur-sm text-white text-xs font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6 border border-white/20">
              CRN • Nutricionista Clínica
            </span>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-[1.1] tracking-tight">
              Transforme sua
              <br />
              <span className="text-sage-200">saúde</span> pela
              <br />
              alimentação
            </h1>
            <p className="text-lg text-white/80 mb-8 max-w-lg leading-relaxed">
              Nutrição baseada em ciência, personalizada para o seu corpo, sua rotina e seus objetivos. Resultados reais e sustentáveis.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/agendamento"
                className="bg-white text-sage-800 px-7 py-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 min-h-[52px] flex items-center gap-2"
              >
                Agendar Consulta
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                href="#sobre"
                className="border-2 border-white/40 text-white px-7 py-4 rounded-2xl font-medium hover:bg-white/10 transition-all duration-300 min-h-[52px] flex items-center"
              >
                Conheça-me
              </Link>
            </div>
          </div>

          {/* Stats card flutuante */}
          <div className="hidden md:block animate-fade-slide-up stagger-3">
            <div className="glass rounded-3xl p-8 shadow-xl border border-white/20 max-w-sm ml-auto animate-float">
              <div className="grid grid-cols-2 gap-6 text-center">
                <div>
                  <p className="text-3xl font-bold text-sage-700">500+</p>
                  <p className="text-sm text-warm-500 mt-1">Pacientes atendidos</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-sage-700">8</p>
                  <p className="text-sm text-warm-500 mt-1">Anos de experiência</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-sage-700">98%</p>
                  <p className="text-sm text-warm-500 mt-1">Satisfação</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-sage-700">4.9</p>
                  <p className="text-sm text-warm-500 mt-1">⭐ Avaliação</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SOBRE A NUTRICIONISTA */}
      <section id="sobre" className="py-24 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div className="relative">
            <div className="absolute -top-4 -left-4 w-full h-full bg-sage-200/40 rounded-3xl" aria-hidden="true" />
            <img
              src={fotoSobre}
              alt="Nutricionista Adriana Rodrigues em seu consultório"
              className="relative rounded-3xl object-cover w-full h-[500px] shadow-lg"
            />
            <div className="absolute -bottom-6 -right-6 bg-white rounded-2xl shadow-lg p-5 animate-fade-slide-in">
              <p className="text-sage-700 font-bold text-lg">{crn}</p>
              <p className="text-warm-500 text-sm">Nutricionista Clínica e Esportiva</p>
            </div>
          </div>

          <div>
            <span className="text-sage-600 font-semibold text-sm uppercase tracking-wider">Sobre mim</span>
            <h2 className="text-3xl md:text-4xl font-bold text-warm-800 mt-3 mb-6 leading-tight">
              Olá, eu sou a <span className="text-gradient">Adriana Rodrigues</span>
            </h2>
            <p className="text-warm-600 leading-relaxed mb-4">
              {bio1}
            </p>
            <p className="text-warm-600 leading-relaxed mb-6">
              {bio2}
            </p>
            <div className="flex flex-wrap gap-3">
              {especialidades.map((tag) => (
                <span key={tag} className="bg-sage-50 text-sage-700 px-4 py-2 rounded-xl text-sm font-medium border border-sage-100">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SERVIÇOS */}
      <section id="servicos" className="py-24 px-6 bg-cream-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-sage-600 font-semibold text-sm uppercase tracking-wider">Serviços</span>
            <h2 className="text-3xl md:text-4xl font-bold text-warm-800 mt-3">
              Como posso te ajudar
            </h2>
            <p className="text-warm-500 mt-4 max-w-2xl mx-auto text-lg">
              Atendimento personalizado para cada fase da sua vida e seus objetivos.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICOS.map((s, i) => (
              <div
                key={s.titulo}
                className={`group bg-white rounded-3xl overflow-hidden border border-cream-200 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2 animate-fade-slide-up stagger-${i + 1}`}
              >
                <div className="h-48 overflow-hidden">
                  <img
                    src={s.img}
                    alt={s.titulo}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                </div>
                <div className="p-6">
                  <span className="text-2xl" aria-hidden="true">{s.icon}</span>
                  <h3 className="font-bold text-warm-800 text-lg mt-3 mb-2">{s.titulo}</h3>
                  <p className="text-warm-500 text-sm leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PLANOS E VALORES */}
      <section id="planos" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-sage-600 font-semibold text-sm uppercase tracking-wider">Investimento</span>
            <h2 className="text-3xl md:text-4xl font-bold text-warm-800 mt-3">
              Planos & Valores
            </h2>
            <p className="text-warm-500 mt-4 text-lg">
              Escolha o acompanhamento ideal para seus objetivos.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {PLANOS.map((plano) => (
              <div
                key={plano.nome}
                className={`relative rounded-3xl p-8 transition-all duration-300 hover:-translate-y-2 ${
                  plano.destaque
                    ? 'bg-gradient-to-br from-sage-600 to-sage-800 text-white shadow-xl scale-[1.02]'
                    : 'bg-white border border-cream-200 shadow-sm hover:shadow-lg'
                }`}
              >
                {plano.destaque && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold-400 text-white text-xs font-bold uppercase px-4 py-1 rounded-full shadow-sm">
                    Mais Popular
                  </span>
                )}

                <h3 className={`font-bold text-lg mb-1 ${plano.destaque ? 'text-white' : 'text-warm-800'}`}>
                  {plano.nome}
                </h3>

                <div className="flex items-baseline gap-1 mb-6">
                  <span className={`text-4xl font-bold ${plano.destaque ? 'text-white' : 'text-sage-700'}`}>
                    {plano.preco}
                  </span>
                  <span className={`text-sm ${plano.destaque ? 'text-sage-200' : 'text-warm-400'}`}>
                    {plano.periodo}
                  </span>
                </div>

                <ul className="space-y-3 mb-8">
                  {plano.itens.map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <svg className={`w-5 h-5 shrink-0 mt-0.5 ${plano.destaque ? 'text-sage-200' : 'text-sage-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className={`text-sm ${plano.destaque ? 'text-sage-100' : 'text-warm-600'}`}>{item}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/agendamento"
                  className={`block text-center w-full py-3.5 rounded-xl font-semibold transition-all duration-200 min-h-[48px] ${
                    plano.destaque
                      ? 'bg-white text-sage-700 hover:bg-sage-50 shadow-sm'
                      : 'bg-sage-600 text-white hover:bg-sage-700 shadow-sm'
                  }`}
                >
                  Começar Agora
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DEPOIMENTOS */}
      <section className="py-24 px-6 bg-cream-100">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-sage-600 font-semibold text-sm uppercase tracking-wider">Depoimentos</span>
            <h2 className="text-3xl md:text-4xl font-bold text-warm-800 mt-3">
              O que meus pacientes dizem
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {DEPOIMENTOS.map((d) => (
              <div key={d.nome} className="bg-white rounded-3xl p-7 border border-cream-200 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <img src={d.avatar} alt={d.nome} className="w-12 h-12 rounded-full object-cover" />
                  <div>
                    <p className="font-semibold text-warm-800 text-sm">{d.nome}</p>
                    <div className="flex gap-0.5 text-gold-400 text-xs">★★★★★</div>
                  </div>
                </div>
                <p className="text-warm-600 text-sm leading-relaxed italic">&ldquo;{d.texto}&rdquo;</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CALCULADORA IMC */}
      <section className="py-24 px-6" aria-labelledby="imc-section-heading">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div>
            <span className="text-sage-600 font-semibold text-sm uppercase tracking-wider">Ferramenta gratuita</span>
            <h2 id="imc-section-heading" className="text-3xl md:text-4xl font-bold text-warm-800 mt-3 mb-4">
              Calcule seu IMC
            </h2>
            <p className="text-warm-500 text-lg leading-relaxed mb-6">
              Uma estimativa rápida para entender em qual faixa de peso você se encontra. Lembrando: o IMC é apenas um indicador — uma avaliação completa considera muito mais.
            </p>
            <img
              src="https://images.unsplash.com/photo-1547592180-85f173990554?w=500&h=350&fit=crop"
              alt="Alimentos saudáveis e coloridos"
              className="rounded-2xl shadow-sm w-full h-48 object-cover"
            />
          </div>
          <CalculadoraIMC />
        </div>
      </section>

      {/* CTA AGENDAMENTO */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=1920&h=600&fit=crop"
            alt=""
            className="w-full h-full object-cover"
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-sage-900/75 backdrop-blur-sm" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Pronta para transformar sua alimentação?
          </h2>
          <p className="text-sage-100 text-lg mb-8">
            Agende sua primeira consulta e dê o primeiro passo rumo a uma vida mais saudável.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/agendamento"
              className="bg-white text-sage-800 px-8 py-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 min-h-[52px]"
            >
              Agendar Consulta
            </Link>
            <a
              href={`https://wa.me/${whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="border-2 border-white/50 text-white px-8 py-4 rounded-2xl font-medium hover:bg-white/10 transition-all duration-300 min-h-[52px] flex items-center gap-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.12.553 4.11 1.519 5.838L.057 23.647l5.965-1.414A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.82c-1.94 0-3.79-.5-5.4-1.44l-.39-.23-3.54.84.89-3.43-.26-.4A9.82 9.82 0 012.18 12c0-5.41 4.41-9.82 9.82-9.82 5.41 0 9.82 4.41 9.82 9.82 0 5.41-4.41 9.82-9.82 9.82z"/>
              </svg>
              WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* BLOG PREVIEW */}
      <section className="py-24 px-6" aria-labelledby="blog-heading">
        <div className="max-w-5xl mx-auto text-center">
          <span className="text-sage-600 font-semibold text-sm uppercase tracking-wider">Blog</span>
          <h2 id="blog-heading" className="text-3xl md:text-4xl font-bold text-warm-800 mt-3 mb-4">Dicas & Artigos</h2>
          <p className="text-warm-500 text-lg mb-10">Conteúdo baseado em ciência para o seu dia a dia.</p>

          <div className="grid md:grid-cols-3 gap-6 mb-10">
            {[
              { img: 'https://images.unsplash.com/photo-1543362906-acfc16c67564?w=400&h=250&fit=crop', titulo: 'Como montar um prato equilibrado', tag: 'Dica' },
              { img: 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=400&h=250&fit=crop', titulo: '5 mitos sobre dietas que você precisa parar de acreditar', tag: 'Educação' },
              { img: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=250&fit=crop', titulo: 'Nutrição pré e pós treino: guia completo', tag: 'Esportiva' },
            ].map((post) => (
              <div key={post.titulo} className="bg-white rounded-3xl overflow-hidden border border-cream-200 shadow-sm hover:shadow-md transition-all duration-300 text-left group">
                <div className="h-44 overflow-hidden">
                  <img src={post.img} alt={post.titulo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-5">
                  <span className="text-xs font-semibold text-sage-600 bg-sage-50 px-2.5 py-1 rounded-lg">{post.tag}</span>
                  <h3 className="font-semibold text-warm-800 mt-3 text-sm leading-snug">{post.titulo}</h3>
                </div>
              </div>
            ))}
          </div>

          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sage-700 font-semibold hover:text-sage-800 transition-colors px-4 py-2 rounded-xl hover:bg-sage-50"
          >
            Ver todos os artigos
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-warm-900 text-white py-16 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-[12px] bg-gradient-to-br from-sage-800 to-sage-500 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.15),transparent)]" />
                <span className="text-white font-bold text-sm relative">A</span>
                <span className="absolute bottom-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-sage-300/70" />
              </div>
              <span className="font-bold text-lg">Adriana Nutrição</span>
            </div>
            <p className="text-warm-400 text-sm leading-relaxed max-w-sm">
              Nutrição inteligente e personalizada. Transformando vidas através da alimentação consciente há mais de 8 anos.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-warm-400">Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/#sobre" className="text-warm-400 hover:text-white transition-colors">Sobre</Link></li>
              <li><Link href="/#servicos" className="text-warm-400 hover:text-white transition-colors">Serviços</Link></li>
              <li><Link href="/#planos" className="text-warm-400 hover:text-white transition-colors">Planos</Link></li>
              <li><Link href="/blog" className="text-warm-400 hover:text-white transition-colors">Blog</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-warm-400">Contato</h4>
            <ul className="space-y-2 text-sm text-warm-400">
              <li>📍 {endereco}</li>
              <li>📞 {telefone}</li>
              <li>✉️ contato@adriananutrição.com</li>
              <li className="pt-2">
                <Link href="/agendamento" className="text-sage-400 hover:text-sage-300 font-medium transition-colors">
                  Agendar Consulta →
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-6xl mx-auto border-t border-warm-700 mt-12 pt-8 text-center">
          <p className="text-warm-500 text-sm">© {new Date().getFullYear()} Adriana Rodrigues — Nutrição Inteligente. Todos os direitos reservados.</p>
        </div>
      </footer>
    </main>
  );
}
