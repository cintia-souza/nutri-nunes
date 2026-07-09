'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import Link from 'next/link';

const GruposAlimentaresChart = dynamic(() => import('@/components/RelatorioCharts').then(m => m.GruposAlimentaresChart), { ssr: false, loading: () => <ChartSkeleton /> });
const HabitosInadequadosChart = dynamic(() => import('@/components/RelatorioCharts').then(m => m.HabitosInadequadosChart), { ssr: false, loading: () => <ChartSkeleton /> });
const RadarHabitosChart = dynamic(() => import('@/components/RelatorioCharts').then(m => m.RadarHabitosChart), { ssr: false, loading: () => <ChartSkeleton /> });
const PesoChart = dynamic(() => import('@/components/RelatorioCharts').then(m => m.PesoChart), { ssr: false, loading: () => <ChartSkeleton /> });

function ChartSkeleton() {
  return (
    <div className="h-[280px] flex items-center justify-center">
      <div className="w-12 h-12 rounded-full border-4 border-cream-200 border-t-sage-500 animate-spin" />
    </div>
  );
}

interface Progresso { data: string; peso?: number; aguaMl?: number; }
interface Check { data: string; realizada: boolean; }
interface FeedbackItem { data: string; texto: string; }
interface Habito { data: string; aderenciaDieta: number; variedadeAlimentar: number; aceitacaoNovos: number; hidratacao: number; comportamentoMesa: number; }
interface AvalNutri {
  data: string; tipo: string;
  frutas: number; verduras: number; legumes: number; proteinas: number; cereais: number; agua: number;
  refrigerantes: number; doces: number; fastFood: number; ultraprocessados: number; beliscos: number;
}

interface Relatorio {
  cliente: { nome: string; email: string; pesoAtual?: number; altura?: number; objetivo?: string };
  checks: Check[];
  progressos: Progresso[];
  feedbacks: FeedbackItem[];
  habitos: Habito[];
  avaliacoesNutricionais: AvalNutri[];
}

export default function RelatorioPage() {
  return (
    <Suspense fallback={<div className="max-w-6xl mx-auto p-6 pt-10"><div className="animate-pulse h-10 bg-cream-200 rounded-xl w-1/3" /></div>}>
      <RelatorioContent />
    </Suspense>
  );
}

function RelatorioContent() {
  const params = useSearchParams();
  const [clienteId, setClienteId] = useState(params.get('clienteId') || '');
  const [clientes, setClientes] = useState<{id:string;nome:string}[]>([]);
  const [data, setData] = useState<Relatorio | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/admin/clientes').then(r => r.ok ? r.json() : []).then(setClientes).catch(() => {});
  }, []);

  useEffect(() => {
    if (!clienteId) return;
    setLoading(true);
    fetch(`/api/admin/relatorio?clienteId=${clienteId}`).then(r => r.ok ? r.json() : null).then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false));
  }, [clienteId]);

  if (!clienteId) return (
    <main className="max-w-6xl mx-auto p-6 pt-10">
      <h1 className="text-2xl font-bold text-warm-800 mb-6">📈 Relatório de Evolução</h1>
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-cream-200 shadow-sm max-w-md">
        <label className="block text-sm font-medium text-warm-600 mb-2">Selecione um paciente</label>
        <select value={clienteId} onChange={(e) => setClienteId(e.target.value)}
          className="w-full border border-cream-300 rounded-xl px-4 py-3 bg-cream-50 text-warm-800 focus-visible:ring-2 focus-visible:ring-sage-400">
          <option value="">Selecione...</option>
          {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
        </select>
      </div>
    </main>
  );

  if (loading || !data) return (
    <main className="max-w-6xl mx-auto p-6 pt-10">
      <div className="animate-pulse space-y-6">
        <div className="h-12 bg-cream-200 rounded-xl w-1/3" />
        <div className="h-40 bg-cream-200 rounded-3xl" />
        <div className="grid grid-cols-3 gap-4">{[1,2,3].map(i => <div key={i} className="h-32 bg-cream-200 rounded-2xl" />)}</div>
      </div>
    </main>
  );

  const totalChecks = data.checks.length;
  const realizados = data.checks.filter(c => c.realizada).length;
  const aderencia = totalChecks > 0 ? Math.round((realizados / totalChecks) * 100) : 0;
  const dadosPeso = data.progressos.filter(p => p.peso).reverse().map(p => ({ data: p.data.slice(5), peso: p.peso }));

  // Avaliações nutricionais
  const avaliacoes = data.avaliacoesNutricionais || [];
  const inicial = avaliacoes.find(a => a.tipo === 'INICIAL');
  const atual = avaliacoes.length > 0 ? avaliacoes[avaliacoes.length - 1] : null;

  const gruposData = [
    { grupo: 'Frutas', inicial: inicial?.frutas ?? 0, atual: atual?.frutas ?? 0 },
    { grupo: 'Verduras', inicial: inicial?.verduras ?? 0, atual: atual?.verduras ?? 0 },
    { grupo: 'Legumes', inicial: inicial?.legumes ?? 0, atual: atual?.legumes ?? 0 },
    { grupo: 'Proteínas', inicial: inicial?.proteinas ?? 0, atual: atual?.proteinas ?? 0 },
    { grupo: 'Cereais', inicial: inicial?.cereais ?? 0, atual: atual?.cereais ?? 0 },
    { grupo: 'Água', inicial: inicial?.agua ?? 0, atual: atual?.agua ?? 0 },
  ];

  const habitosRuinsData = [
    { habito: 'Refrigerantes', inicial: inicial?.refrigerantes ?? 0, atual: atual?.refrigerantes ?? 0 },
    { habito: 'Doces', inicial: inicial?.doces ?? 0, atual: atual?.doces ?? 0 },
    { habito: 'Fast-Food', inicial: inicial?.fastFood ?? 0, atual: atual?.fastFood ?? 0 },
    { habito: 'Ultraproc.', inicial: inicial?.ultraprocessados ?? 0, atual: atual?.ultraprocessados ?? 0 },
    { habito: 'Beliscos', inicial: inicial?.beliscos ?? 0, atual: atual?.beliscos ?? 0 },
  ];

  const mudancas = gerarMudancas(inicial, atual);

  // Hábitos radar
  const habitosOrd = [...data.habitos].sort((a, b) => a.data.localeCompare(b.data));
  const metade = Math.floor(habitosOrd.length / 2);
  const recentes = habitosOrd.slice(metade);
  const antigos = habitosOrd.slice(0, metade);
  const mediaR = mediaHabitos(recentes);
  const mediaA = mediaHabitos(antigos);
  const scoreGeral = habitosOrd.length > 0 ? +((mediaR.aderenciaDieta + mediaR.variedadeAlimentar + mediaR.aceitacaoNovos + mediaR.hidratacao + mediaR.comportamentoMesa) / 5).toFixed(1) : 0;

  const radarData = [
    { dim: 'Aderência', atual: mediaR.aderenciaDieta, anterior: mediaA.aderenciaDieta },
    { dim: 'Variedade', atual: mediaR.variedadeAlimentar, anterior: mediaA.variedadeAlimentar },
    { dim: 'Novos', atual: mediaR.aceitacaoNovos, anterior: mediaA.aceitacaoNovos },
    { dim: 'Hidratação', atual: mediaR.hidratacao, anterior: mediaA.hidratacao },
    { dim: 'Comportamento', atual: mediaR.comportamentoMesa, anterior: mediaA.comportamentoMesa },
  ];

  // Score color
  const scoreColor = scoreGeral >= 7 ? '#059669' : scoreGeral >= 4 ? '#d97706' : '#dc2626';

  return (
    <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">

      {/* ═══ HEADER ═══ */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg" style={{background:'linear-gradient(135deg,#34d399,#059669)'}}>
            {data.cliente.nome.split(' ').map(n => n[0]).slice(0, 2).join('')}
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-warm-800">{data.cliente.nome}</h1>
            <p className="text-warm-500 text-sm mt-0.5">{data.cliente.objetivo || 'Acompanhamento nutricional'}</p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link href={`/admin/avaliacao-nutricional?clienteId=${clienteId}`}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm text-white min-h-[40px] shadow-md hover:shadow-lg hover:scale-[1.02] transition-all"
            style={{background:'linear-gradient(135deg,#059669,#047857)'}}>
            🩺 Nova Avaliação
          </Link>
          <Link href={`/admin/habitos?clienteId=${clienteId}`}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm border border-cream-200 text-warm-600 hover:bg-cream-50 min-h-[40px] transition-all">
            📊 Hábitos
          </Link>
        </div>
      </div>

      {/* ═══ BANNER HERO ═══ */}
      <div className="relative rounded-3xl overflow-hidden p-8" style={{background:'linear-gradient(135deg,#0f2d1e 0%,#0f3d29 40%,#1a8558 100%)'}}>
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-10" style={{background:'radial-gradient(circle,#34d399,transparent)', transform:'translate(30%,-30%)'}} />
        <div className="absolute bottom-0 left-0 w-60 h-60 rounded-full opacity-5" style={{background:'radial-gradient(circle,#fbbf24,transparent)', transform:'translate(-30%,30%)'}} />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <p className="text-emerald-300/60 text-xs uppercase tracking-[3px] mb-2 font-medium">Relatório de Evolução</p>
            <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight">&ldquo;O peso é consequência.<br/>O hábito é a conquista.&rdquo;</h2>
          </div>
          <div className="flex gap-6">
            <ScoreCircle value={scoreGeral} max={10} label="Score" color={scoreColor} />
            <ScoreCircle value={aderencia} max={100} label="Aderência" color="#3b82f6" suffix="%" />
          </div>
        </div>
      </div>

      {/* ═══ INDICADORES RÁPIDOS ═══ */}
      {inicial && atual && (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {gruposData.map((g) => {
            const diff = g.atual - g.inicial;
            return (
              <div key={g.grupo} className="relative overflow-hidden rounded-2xl p-4 text-center border border-cream-100 shadow-sm" style={{background:'linear-gradient(180deg,#ffffff,#fafaf8)'}}>
                <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{background: `linear-gradient(90deg, ${diff > 0 ? '#10b981' : '#f59e0b'}, ${diff > 0 ? '#059669' : '#d97706'})`, opacity: Math.min(Math.abs(diff) / 5, 1)}} />
                <p className="text-2xl font-bold text-warm-800">{g.atual}</p>
                <p className="text-xs text-warm-500 mt-0.5">{g.grupo}</p>
                {diff !== 0 && (
                  <span className={`inline-block mt-1 text-xs font-bold px-2 py-0.5 rounded-full ${diff > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
                    {diff > 0 ? '+' : ''}{diff}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ═══ GRÁFICO 1: Grupos Alimentares ═══ */}
      <section className="rounded-3xl border border-cream-100 shadow-sm overflow-hidden" style={{background:'linear-gradient(180deg,#ffffff,#fdfcfb)'}}>
        <div className="px-8 pt-7 pb-2">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{background:'linear-gradient(135deg,#34d399,#059669)'}}>
              <span className="text-white text-sm">🥗</span>
            </div>
            <h2 className="font-bold text-warm-800 text-lg">Aceitação de Grupos Alimentares</h2>
          </div>
          <p className="text-sm text-warm-400 ml-11">Comparativo entre avaliação inicial e atual — escala de 0 a 10</p>
        </div>
        <div className="px-4 pb-6">
          {inicial && atual ? (
            <GruposAlimentaresChart data={gruposData} />
          ) : <EmptyState clienteId={clienteId} msg="Registre a avaliação inicial e uma de acompanhamento." />}
        </div>
      </section>

      {/* ═══ GRÁFICO 2: Hábitos Inadequados ═══ */}
      <section className="rounded-3xl border border-cream-100 shadow-sm overflow-hidden" style={{background:'linear-gradient(180deg,#ffffff,#fdfcfb)'}}>
        <div className="px-8 pt-7 pb-2">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{background:'linear-gradient(135deg,#f87171,#dc2626)'}}>
              <span className="text-white text-sm">⚠️</span>
            </div>
            <h2 className="font-bold text-warm-800 text-lg">Redução de Hábitos Inadequados</h2>
          </div>
          <p className="text-sm text-warm-400 ml-11">Frequência semanal de consumo — quanto menor, melhor</p>
        </div>
        <div className="px-4 pb-6">
          {inicial && atual ? (
            <HabitosInadequadosChart data={habitosRuinsData} />
          ) : <EmptyState clienteId={clienteId} msg="Registre avaliações para ver o comparativo." />}
        </div>
      </section>

      {/* ═══ GRÁFICO 3: Resumo de Mudanças ═══ */}
      {mudancas.length > 0 && (
        <section className="rounded-3xl border border-cream-100 shadow-sm overflow-hidden" style={{background:'linear-gradient(180deg,#ffffff,#fdfcfb)'}}>
          <div className="px-8 pt-7 pb-2">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{background:'linear-gradient(135deg,#a78bfa,#7c3aed)'}}>
                <span className="text-white text-sm">✨</span>
              </div>
              <h2 className="font-bold text-warm-800 text-lg">Principais Conquistas</h2>
            </div>
            <p className="text-sm text-warm-400 ml-11">Mudanças significativas entre a avaliação inicial e a mais recente</p>
          </div>
          <div className="px-8 pb-7 pt-4 space-y-3">
            {mudancas.map((m, i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-2xl transition-all hover:scale-[1.01]" style={{background: m.positivo ? 'linear-gradient(135deg,#f0fdf4,#ecfdf5)' : 'linear-gradient(135deg,#fef2f2,#fff1f2)', border: `1px solid ${m.positivo ? '#bbf7d0' : '#fecaca'}`}}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-sm" style={{background: m.positivo ? '#dcfce7' : '#fee2e2'}}>
                  {m.emoji}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-warm-800">{m.label}</p>
                  <p className="text-xs text-warm-500 mt-0.5">{m.desc}</p>
                </div>
                <div className={`text-right ${m.positivo ? 'text-emerald-600' : 'text-red-500'}`}>
                  <p className="text-lg font-bold">{m.positivo ? '+' : '-'}{Math.abs(m.diff)}</p>
                  <p className="text-xs opacity-60">{m.positivo ? 'melhora' : 'atenção'}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ═══ RADAR + PESO ═══ */}
      <div className="grid md:grid-cols-2 gap-6">
        <section className="rounded-3xl border border-cream-100 shadow-sm p-6" style={{background:'linear-gradient(180deg,#ffffff,#fdfcfb)'}}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{background:'linear-gradient(135deg,#34d399,#059669)'}}>
              <span className="text-white text-xs">🎯</span>
            </div>
            <div>
              <h2 className="font-bold text-warm-800">Perfil de Hábitos</h2>
              <p className="text-xs text-warm-400">Recente vs anterior</p>
            </div>
          </div>
          {habitosOrd.length > 0 ? (
            <RadarHabitosChart data={radarData} temAntigos={antigos.length > 0} />
          ) : <div className="h-[260px] flex items-center justify-center text-warm-400 text-sm">Sem dados</div>}
        </section>

        <section className="rounded-3xl border border-cream-100 shadow-sm p-6" style={{background:'linear-gradient(180deg,#ffffff,#fdfcfb)'}}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{background:'linear-gradient(135deg,#a78bfa,#7c3aed)'}}>
              <span className="text-white text-xs">⚖️</span>
            </div>
            <div>
              <h2 className="font-bold text-warm-800">Peso</h2>
              <p className="text-xs text-warm-400">Referência secundária — consequência dos hábitos</p>
            </div>
          </div>
          {dadosPeso.length > 1 ? (
            <PesoChart data={dadosPeso} />
          ) : <div className="h-[260px] flex items-center justify-center text-warm-400 text-sm">Dados insuficientes</div>}
        </section>
      </div>

      {/* ═══ FEEDBACKS ═══ */}
      {data.feedbacks.length > 0 && (
        <section className="rounded-3xl border border-cream-100 shadow-sm p-6" style={{background:'linear-gradient(180deg,#ffffff,#fdfcfb)'}}>
          <h2 className="font-bold text-warm-800 mb-4 flex items-center gap-2">💬 Comentários do Paciente</h2>
          <div className="space-y-3 max-h-[250px] overflow-y-auto">
            {data.feedbacks.slice(0, 8).map((f, i) => (
              <div key={i} className="flex gap-3 animate-fade-slide-in" style={{animationDelay:`${i*50}ms`}}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{background:'linear-gradient(135deg,#e0e7ff,#c7d2fe)'}}>
                  <span className="text-xs">💬</span>
                </div>
                <div className="flex-1 bg-cream-50/80 rounded-2xl p-4 border border-cream-100">
                  <p className="text-sm text-warm-700">{f.texto}</p>
                  <p className="text-xs text-warm-400 mt-2">{f.data}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

/* ═══ COMPONENTES AUXILIARES ═══ */

function ScoreCircle({ value, max, label, color, suffix = '' }: { value: number; max: number; label: string; color: string; suffix?: string }) {
  const pct = Math.min((value / max) * 100, 100);
  const r = 36;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;

  return (
    <div className="text-center">
      <div className="relative w-24 h-24">
        <svg className="w-24 h-24 -rotate-90" viewBox="0 0 88 88">
          <circle cx="44" cy="44" r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
          <circle cx="44" cy="44" r={r} fill="none" stroke={color} strokeWidth="6" strokeLinecap="round"
            strokeDasharray={circ} strokeDashoffset={offset}
            style={{transition:'stroke-dashoffset 1.2s ease-out'}} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold text-white">{value}{suffix}</span>
        </div>
      </div>
      <p className="text-white/50 text-xs mt-1">{label}</p>
    </div>
  );
}

function EmptyState({ clienteId, msg }: { clienteId: string | null; msg: string }) {
  return (
    <div className="h-[220px] flex items-center justify-center text-warm-400 text-sm">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl mx-auto mb-3 flex items-center justify-center" style={{background:'linear-gradient(135deg,#f0fdf4,#ecfdf5)'}}>
          <span className="text-2xl">🩺</span>
        </div>
        <p className="text-warm-500">{msg}</p>
        <Link href={`/admin/avaliacao-nutricional?clienteId=${clienteId}`} className="text-xs font-medium underline mt-2 inline-block" style={{color:'#059669'}}>Registrar agora →</Link>
      </div>
    </div>
  );
}

/* ═══ FUNÇÕES UTILITÁRIAS ═══ */

function mediaHabitos(arr: Habito[]) {
  if (!arr.length) return { aderenciaDieta: 0, variedadeAlimentar: 0, aceitacaoNovos: 0, hidratacao: 0, comportamentoMesa: 0 };
  const n = arr.length;
  return {
    aderenciaDieta: +(arr.reduce((s, h) => s + h.aderenciaDieta, 0) / n).toFixed(1),
    variedadeAlimentar: +(arr.reduce((s, h) => s + h.variedadeAlimentar, 0) / n).toFixed(1),
    aceitacaoNovos: +(arr.reduce((s, h) => s + h.aceitacaoNovos, 0) / n).toFixed(1),
    hidratacao: +(arr.reduce((s, h) => s + h.hidratacao, 0) / n).toFixed(1),
    comportamentoMesa: +(arr.reduce((s, h) => s + h.comportamentoMesa, 0) / n).toFixed(1),
  };
}

interface Mudanca { emoji: string; label: string; desc: string; diff: number; positivo: boolean; }

function gerarMudancas(inicial: AvalNutri | undefined, atual: AvalNutri | null): Mudanca[] {
  if (!inicial || !atual) return [];
  const m: Mudanca[] = [];

  const grupos = [
    { key: 'frutas' as const, emoji: '🍎', label: 'Frutas' },
    { key: 'verduras' as const, emoji: '🥬', label: 'Verduras' },
    { key: 'legumes' as const, emoji: '🥕', label: 'Legumes' },
    { key: 'proteinas' as const, emoji: '🍗', label: 'Proteínas' },
    { key: 'cereais' as const, emoji: '🌾', label: 'Cereais' },
    { key: 'agua' as const, emoji: '💧', label: 'Hidratação' },
  ];

  for (const g of grupos) {
    const diff = atual[g.key] - inicial[g.key];
    if (diff >= 2) m.push({ emoji: g.emoji, label: `Aumento no consumo de ${g.label.toLowerCase()}`, desc: `De ${inicial[g.key]} para ${atual[g.key]} na escala de aceitação`, diff, positivo: true });
  }

  const habitos = [
    { key: 'refrigerantes' as const, emoji: '🥤', label: 'Refrigerantes' },
    { key: 'doces' as const, emoji: '🍬', label: 'Doces' },
    { key: 'fastFood' as const, emoji: '🍔', label: 'Fast-food' },
    { key: 'ultraprocessados' as const, emoji: '📦', label: 'Ultraprocessados' },
    { key: 'beliscos' as const, emoji: '🍿', label: 'Beliscos' },
  ];

  for (const h of habitos) {
    const diff = inicial[h.key] - atual[h.key];
    if (diff >= 2) m.push({ emoji: h.emoji, label: `Redução de ${h.label.toLowerCase()}`, desc: `De ${inicial[h.key]}x para ${atual[h.key]}x por semana`, diff, positivo: true });
  }

  m.sort((a, b) => b.diff - a.diff);
  return m;
}
