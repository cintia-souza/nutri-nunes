'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, Check, X, Minus } from 'lucide-react';
import Link from 'next/link';

interface Habito {
  id: string; data: string;
  aderenciaDieta: number; variedadeAlimentar: number;
  aceitacaoNovos: number; hidratacao: number; comportamentoMesa: number;
  acFrutas: boolean | null; acVerduras: boolean | null;
  acLegumes: boolean | null; acProteinas: boolean | null;
  acCereais: boolean | null; acAgua: boolean | null;
  refrigerante: boolean | null; doces: boolean | null;
  fastFood: boolean | null; ultraprocessados: boolean | null; beliscos: boolean | null;
}

interface Avaliacao {
  id: string; data: string; tipo: string;
  frutas: number; verduras: number; legumes: number;
  proteinas: number; cereais: number; agua: number;
  refrigerantes: number; doces: number; fastFood: number;
  ultraprocessados: number; beliscos: number;
}




const HABITOS_INADEQUADOS = [
  { key: 'refrigerante', label: 'Refrigerante', emoji: '🥤' },
  { key: 'doces', label: 'Doces', emoji: '🍬' },
  { key: 'fastFood', label: 'Fast-food', emoji: '🍔' },
  { key: 'ultraprocessados', label: 'Ultraprocessados', emoji: '📦' },
  { key: 'beliscos', label: 'Beliscos entre refeições', emoji: '🍪' },
] as const;

const GRUPOS_ALIMENTARES = [
  { key: 'frutas', label: 'Frutas', emoji: '🍎' },
  { key: 'verduras', label: 'Verduras', emoji: '🥬' },
  { key: 'legumes', label: 'Legumes', emoji: '🥕' },
  { key: 'proteinas', label: 'Proteínas', emoji: '🥩' },
  { key: 'cereais', label: 'Cereais', emoji: '🌾' },
  { key: 'agua', label: 'Água', emoji: '💧' },
] as const;

export default function HabitosClientePage() {
  const [historico, setHistorico] = useState<Habito[]>([]);
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [data] = useState(() => new Date().toISOString().slice(0, 10));
  const [scores] = useState<Record<string, number>>({
    aderenciaDieta: 5, variedadeAlimentar: 5, aceitacaoNovos: 5, hidratacao: 5, comportamentoMesa: 5,
  });
  const [inadequados, setInadequados] = useState<Record<string, boolean | null>>({
    refrigerante: null, doces: null, fastFood: null, ultraprocessados: null, beliscos: null,
  });
  const [observacao, setObservacao] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [tab, setTab] = useState<'registrar' | 'historico' | 'evolucao'>('registrar');

  const [grupos, setGrupos] = useState<Record<string, boolean | null>>({
  acFrutas: null, acVerduras: null, acLegumes: null, acProteinas: null, acCereais: null, acAgua: null,
});


  useEffect(() => {
    fetch('/api/cliente/habitos').then(r => r.ok ? r.json() : { habitos: [], avaliacoes: [] }).then((res) => {
      const h = res.habitos || [];
      const a = res.avaliacoes || [];
      setHistorico(h);
      setAvaliacoes(a);
      

      const hoje = new Date().toISOString().slice(0, 10);
      const hojeReg = h.find((hab: Habito) => hab.data === hoje);
      if (hojeReg) {
        setInadequados({
          refrigerante: hojeReg.refrigerante,
          doces: hojeReg.doces,
          fastFood: hojeReg.fastFood,
          ultraprocessados: hojeReg.ultraprocessados,
          beliscos: hojeReg.beliscos,
        });
        setGrupos({
          acFrutas: hojeReg.acFrutas,
          acVerduras: hojeReg.acVerduras,
          acLegumes: hojeReg.acLegumes,
          acProteinas: hojeReg.acProteinas,
          acCereais: hojeReg.acCereais,
          acAgua: hojeReg.acAgua,
        });
      }
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    const res = await fetch('/api/cliente/habitos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data, ...scores, ...grupos, ...inadequados, observacao: observacao || undefined }),
    });
    if (res.ok) {
      const novo = await res.json();
      setHistorico(prev => {
        const filtered = prev.filter(h => h.data !== data);
        return [novo, ...filtered];
      });
      setSucesso(true);
      setTimeout(() => setSucesso(false), 3000);
    }
    
    setSalvando(false);
  }

  function setInadequadoValue(key: string, val: boolean | null) {
    setInadequados(prev => ({ ...prev, [key]: val }));
  }

  function setGrupoValue(key: string, val: boolean | null) {
    setGrupos(prev => ({ ...prev, [key]: val }));
  }


  // Avaliações: inicial e mais recente
  const avalInicial = avaliacoes.find(a => a.tipo === 'INICIAL') || avaliacoes[0];
  const avalAtual = avaliacoes.length > 1 ? avaliacoes[avaliacoes.length - 1] : null;

  return (
    <main className="max-w-3xl mx-auto px-4 py-8 md:px-6">
      <Link href="/cliente" className="flex items-center gap-1.5 text-sm text-warm-500 hover:text-warm-700 mb-6">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-warm-800">Meus Hábitos</h1>
        <p className="text-warm-500 text-sm mt-1">Registre como foi seu dia e acompanhe sua evolução.</p>
      </div>


      {/* Tabs */}
      <div className="flex gap-1 bg-cream-100 rounded-xl p-1 mb-6">
        <button onClick={() => setTab('registrar')} className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${tab === 'registrar' ? 'bg-white shadow-sm text-warm-800' : 'text-warm-500'}`}>
          Registrar
        </button>
        <button onClick={() => setTab('historico')} className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${tab === 'historico' ? 'bg-white shadow-sm text-warm-800' : 'text-warm-500'}`}>
          Histórico
        </button>
        <button onClick={() => setTab('evolucao')} className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${tab === 'evolucao' ? 'bg-white shadow-sm text-warm-800' : 'text-warm-500'}`}>
          Evolução
        </button>
      </div>

      {tab === 'registrar' && (
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Aceitação dos Grupos Alimentares - tri-state */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-cream-200 shadow-sm">
            <p className="text-sm font-semibold text-warm-700 mb-1">Aceitação dos Grupos Alimentares</p>
            <p className="text-xs text-warm-400 mb-4">Você consumiu hoje?</p>
            <div className="space-y-2">
              {GRUPOS_ALIMENTARES.map(g => {
                const stateKey = 'ac' + g.key.charAt(0).toUpperCase() + g.key.slice(1);
                const val = grupos[stateKey];
                return (
                  <div key={g.key} className="flex items-center gap-3 p-2.5 rounded-xl border transition-all" style={{ borderColor: val === true ? '#86efac' : val === false ? '#fca5a5' : '#e5e0d8', background: val === true ? '#f0fdf4' : val === false ? '#fef2f2' : 'transparent' }}>
                    <span className="text-lg">{g.emoji}</span>
                    <span className="flex-1 text-sm font-medium text-warm-700">{g.label}</span>
                    <div className="flex gap-1">
                      <button type="button" onClick={() => setGrupoValue(stateKey, true)} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${val === true ? 'bg-green-100 ring-2 ring-green-400' : 'bg-cream-100 hover:bg-green-50'}`}><Check className={`w-4 h-4 ${val === true ? 'text-green-600' : 'text-warm-400'}`} /></button>
                      <button type="button" onClick={() => setGrupoValue(stateKey, false)} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${val === false ? 'bg-red-100 ring-2 ring-red-400' : 'bg-cream-100 hover:bg-red-50'}`}><X className={`w-4 h-4 ${val === false ? 'text-red-500' : 'text-warm-400'}`} /></button>
                      <button type="button" onClick={() => setGrupoValue(stateKey, null)} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${val === null ? 'bg-warm-100 ring-2 ring-warm-300' : 'bg-cream-100 hover:bg-warm-50'}`}><Minus className={`w-4 h-4 ${val === null ? 'text-warm-500' : 'text-warm-300'}`} /></button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Hábitos inadequados - 3 botões */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-cream-200 shadow-sm">
            <p className="text-sm font-semibold text-warm-700 mb-1">Hábitos Inadequados</p>
            <p className="text-xs text-warm-400 mb-4">Você cometeu hoje?</p>
            <div className="space-y-2">
              {HABITOS_INADEQUADOS.map(h => {
                const val = inadequados[h.key];
                return (
                  <div key={h.key} className="flex items-center gap-3 p-2.5 rounded-xl border transition-all" style={{ borderColor: val === true ? '#fca5a5' : val === false ? '#86efac' : '#e5e0d8', background: val === true ? '#fef2f2' : val === false ? '#f0fdf4' : 'transparent' }}>
                    <span className="text-lg">{h.emoji}</span>
                    <span className="flex-1 text-sm font-medium text-warm-700">{h.label}</span>
                    <div className="flex gap-1">
                      <button type="button" onClick={() => setInadequadoValue(h.key, true)} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${val === true ? 'bg-red-100 ring-2 ring-red-400' : 'bg-cream-100 hover:bg-red-50'}`} title="Sim"><Check className={`w-4 h-4 ${val === true ? 'text-red-500' : 'text-warm-400'}`} /></button>
                      <button type="button" onClick={() => setInadequadoValue(h.key, false)} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${val === false ? 'bg-green-100 ring-2 ring-green-400' : 'bg-cream-100 hover:bg-green-50'}`} title="Não"><X className={`w-4 h-4 ${val === false ? 'text-green-600' : 'text-warm-400'}`} /></button>
                      <button type="button" onClick={() => setInadequadoValue(h.key, null)} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${val === null ? 'bg-warm-100 ring-2 ring-warm-300' : 'bg-cream-100 hover:bg-warm-50'}`} title="Não informar"><Minus className={`w-4 h-4 ${val === null ? 'text-warm-500' : 'text-warm-300'}`} /></button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Observação */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-cream-200 shadow-sm">
            <textarea value={observacao} onChange={e => setObservacao(e.target.value)} rows={2}
              placeholder="Alguma observação sobre o dia? (opcional)"
              className="w-full border border-cream-300 rounded-xl px-3 py-2.5 bg-cream-50 text-warm-800 text-sm resize-none" />
          </div>

          <button type="submit" disabled={salvando}
            className="w-full text-white py-3.5 rounded-xl font-semibold transition-all disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg,#1a8558,#0f3d29)' }}>
            {salvando ? 'Salvando...' : '✓ Registrar'}
          </button>

          {sucesso && (
            <div className="text-center py-3 rounded-xl text-sm font-medium animate-fade-slide-in" style={{ background: '#f0faf5', color: '#166947' }}>
              ✓ Hábitos registrados!
            </div>
          )}
        </form>
      )}

      {tab === 'historico' && (
        <div className="space-y-3">
          {historico.length === 0 ? (
            <div className="text-center py-12 text-warm-400">
              <p className="text-3xl mb-2">📊</p>
              <p className="text-sm">Nenhum registro ainda.</p>
            </div>
          ) : historico.map(h => {
            const inadequadosCount = [h.refrigerante, h.doces, h.fastFood, h.ultraprocessados, h.beliscos].filter(v => v === true).length;
            const gruposCount = [h.acFrutas, h.acVerduras, h.acLegumes, h.acProteinas, h.acCereais, h.acAgua].filter(v => v === true).length;
            return (
              <div key={h.id} className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-cream-200 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-warm-500">{formatDate(h.data)}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-700 font-medium">{gruposCount}/6 grupos</span>
                    {inadequadosCount > 0 && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-600 font-medium">
                        {inadequadosCount} inadequado{inadequadosCount > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === 'evolucao' && (
        <div className="space-y-6">
          {/* Comparativo Grupos Alimentares */}
          {avalInicial ? (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-cream-200 shadow-sm">
              <h3 className="text-sm font-semibold text-warm-700 mb-1">Aceitação dos Grupos Alimentares</h3>
              <p className="text-xs text-warm-400 mb-4">
                Comparativo: avaliação inicial{avalAtual ? ' vs atual' : ' (aguardando reavaliação)'}
              </p>
              <div className="space-y-3">
                {GRUPOS_ALIMENTARES.map(g => {
                  const inicial = (avalInicial as unknown as Record<string, number>)[g.key] || 0;
                  const atual = avalAtual ? (avalAtual as unknown as Record<string, number>)[g.key] || 0 : inicial;
                  const diff = atual - inicial;
                  return (
                    <div key={g.key}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-warm-600 flex items-center gap-1.5">
                          <span>{g.emoji}</span> {g.label}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-warm-400">{inicial}</span>
                          {avalAtual && (
                            <>
                              <span className="text-xs text-warm-300">→</span>
                              <span className="text-xs font-bold" style={{ color: atual >= 7 ? '#1a8558' : atual >= 4 ? '#b45309' : '#dc2626' }}>{atual}</span>
                              {diff !== 0 && (
                                <span className={`text-xs font-bold ${diff > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                  {diff > 0 ? '+' : ''}{diff}
                                </span>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                      <div className="relative h-3 bg-cream-200 rounded-full overflow-hidden">
                        {avalAtual && (
                          <div className="absolute inset-y-0 left-0 rounded-full opacity-30" style={{ width: `${inicial * 10}%`, background: '#94a3b8' }} />
                        )}
                        <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${atual * 10}%`, background: atual >= 7 ? '#1a8558' : atual >= 4 ? '#d97706' : '#dc2626' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
              {avalAtual && (
                <p className="text-xs text-warm-400 mt-3">
                  Inicial: {formatDate(avalInicial.data)} · Atual: {formatDate(avalAtual.data)}
                </p>
              )}
            </div>
          ) : (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-cream-200 shadow-sm text-center text-warm-400">
              <p className="text-sm">Nenhuma avaliação nutricional registrada pela nutricionista ainda.</p>
            </div>
          )}

          {/* Comparativo Hábitos Inadequados */}
          {avalInicial && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-cream-200 shadow-sm">
              <h3 className="text-sm font-semibold text-warm-700 mb-1">Redução de Hábitos Inadequados</h3>
              <p className="text-xs text-warm-400 mb-4">Frequência semanal (0-7x) — quanto menor, melhor</p>
              <div className="space-y-3">
                {HABITOS_INADEQUADOS.map(h => {
                  const keyMap: Record<string, string> = { refrigerante: 'refrigerantes', doces: 'doces', fastFood: 'fastFood', ultraprocessados: 'ultraprocessados', beliscos: 'beliscos' };
                  const inicial = (avalInicial as unknown as Record<string, number>)[keyMap[h.key]] || 0;
                  const atual = avalAtual ? (avalAtual as unknown as Record<string, number>)[keyMap[h.key]] || 0 : inicial;
                  const diff = atual - inicial;
                  return (
                    <div key={h.key}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-warm-600 flex items-center gap-1.5">
                          <span>{h.emoji}</span> {h.label}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-warm-400">{inicial}x/sem</span>
                          {avalAtual && (
                            <>
                              <span className="text-xs text-warm-300">→</span>
                              <span className="text-xs font-bold" style={{ color: atual <= 2 ? '#1a8558' : atual <= 4 ? '#b45309' : '#dc2626' }}>{atual}x/sem</span>
                              {diff !== 0 && (
                                <span className={`text-xs font-bold ${diff < 0 ? 'text-green-600' : 'text-red-500'}`}>
                                  {diff > 0 ? '+' : ''}{diff}
                                </span>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                      <div className="relative h-3 bg-cream-200 rounded-full overflow-hidden">
                        {avalAtual && (
                          <div className="absolute inset-y-0 left-0 rounded-full opacity-30" style={{ width: `${(inicial / 7) * 100}%`, background: '#94a3b8' }} />
                        )}
                        <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${(atual / 7) * 100}%`, background: atual <= 2 ? '#1a8558' : atual <= 4 ? '#d97706' : '#dc2626' }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Resumo diário dos últimos registros */}
              {historico.length > 0 && (
                <div className="mt-5 pt-4 border-t border-cream-200">
                  <p className="text-xs font-semibold text-warm-600 mb-2">Seus registros diários recentes</p>
                  <div className="grid grid-cols-5 gap-1 text-center mb-1">
                    {HABITOS_INADEQUADOS.map(h => (
                      <span key={h.key} className="text-xs" title={h.label}>{h.emoji}</span>
                    ))}
                  </div>
                  {historico.slice(0, 7).map(reg => (
                    <div key={reg.id} className="grid grid-cols-5 gap-1 text-center py-1 border-t border-cream-100">
                      {HABITOS_INADEQUADOS.map(h => {
                        const val = (reg as unknown as Record<string, boolean | null>)[h.key];
                        return (
                          <span key={h.key} className="flex justify-center">
                            {val === true && <Check className="w-3.5 h-3.5 text-red-500" />}
                            {val === false && <X className="w-3.5 h-3.5 text-green-600" />}
                            {val === null && <Minus className="w-3.5 h-3.5 text-warm-300" />}
                          </span>
                        );
                      })}
                    </div>
                  ))}
                  <div className="grid grid-cols-5 gap-1 text-center mt-1">
                    {historico.slice(0, 7).length > 0 && HABITOS_INADEQUADOS.map(h => {
                      const count = historico.slice(0, 7).filter(r => (r as unknown as Record<string, boolean | null>)[h.key] === true).length;
                      return (
                        <span key={h.key} className="text-xs font-bold" style={{ color: count <= 1 ? '#1a8558' : count <= 3 ? '#b45309' : '#dc2626' }}>
                          {count}/7
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </main>
  );
}

function formatDate(d: string) {
  const [y, m, day] = d.split('-');
  return `${day}/${m}/${y}`;
}
