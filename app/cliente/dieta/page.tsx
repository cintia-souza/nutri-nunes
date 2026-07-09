'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Dieta, Receita } from '@/types';
import ModalReceita from '@/components/ModalReceita';
import { hojeLocal } from '@/lib/datas';
import PrintDieta from '@/components/PrintDieta';

const LABELS: Record<string, { emoji: string; nome: string }> = {
  CAFE_DA_MANHA: { emoji: '☀️', nome: 'Café da Manhã' },
  LANCHE_DA_MANHA: { emoji: '🍎', nome: 'Lanche da Manhã' },
  ALMOCO: { emoji: '🍽️', nome: 'Almoço' },
  LANCHE_DA_TARDE: { emoji: '🥤', nome: 'Lanche da Tarde' },
  JANTA: { emoji: '🌙', nome: 'Janta' },
  CEIA: { emoji: '🫖', nome: 'Ceia' },
};

const META_AGUA = 2500;

export default function DietaPage() {
  const [dieta, setDieta] = useState<Dieta | null>(null);
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const [animatingCheck, setAnimatingCheck] = useState<string | null>(null);
  const [receitaAberta, setReceitaAberta] = useState<Receita | null>(null);
  const [aguaHoje, setAguaHoje] = useState(0);
  const [aguaSalva, setAguaSalva] = useState(false);

  useEffect(() => {
    const hoje = hojeLocal();
    fetch('/api/cliente/dieta').then(r => r.json()).then(setDieta);
    fetch('/api/cliente/checks?data=' + hoje).then(r => r.json()).then((data) => {
      const map: Record<string, boolean> = {};
      data.forEach((c: { refeicaoId: string; realizada: boolean }) => { map[c.refeicaoId] = c.realizada; });
      setChecks(map);
    });
    fetch('/api/cliente/telemetria').then(r => r.json()).then(data => {
      if (data?.aguaHoje) setAguaHoje(data.aguaHoje);
    });
  }, []);

  async function toggleCheck(refeicaoId: string) {
    const novo = !checks[refeicaoId];
    setChecks(prev => ({ ...prev, [refeicaoId]: novo }));
    if (novo) { setAnimatingCheck(refeicaoId); setTimeout(() => setAnimatingCheck(null), 500); }
    await fetch('/api/cliente/checks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refeicaoId, realizada: novo, data: hojeLocal() }),
    });
  }

  function adicionarAgua(ml: number) { setAguaHoje(prev => prev + ml); }

  async function salvarAgua() {
    await fetch('/api/cliente/progresso', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ aguaMl: aguaHoje, data: hojeLocal() }),
    });
    setAguaSalva(true);
    setTimeout(() => setAguaSalva(false), 3000);
  }

  const totalRefeicoes = dieta?.refeicoes.length || 0;
  const realizadas = Object.values(checks).filter(Boolean).length;
  const progressoPct = totalRefeicoes > 0 ? Math.round((realizadas / totalRefeicoes) * 100) : 0;
  const aguaPct = Math.min(Math.round((aguaHoje / META_AGUA) * 100), 100);

  if (!dieta) {
    return (
      <main className="max-w-3xl mx-auto p-6 pt-10">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-cream-200 rounded-xl w-2/3" />
          <div className="h-40 bg-cream-200 rounded-2xl" />
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-4 pb-8 pt-6 md:px-6">
      <Link href="/cliente" className="flex items-center gap-1.5 text-sm text-warm-500 hover:text-warm-700 mb-6">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-warm-800">Minha Dieta</h1>
        <p className="text-warm-500 text-sm mt-1">{dieta.titulo}</p>
      </div>

      {/* Progresso do dia */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-cream-200 shadow-sm text-center">
          <div className="relative w-14 h-14 mx-auto mb-2">
            <svg className="w-14 h-14 -rotate-90" viewBox="0 0 64 64">
              <circle cx="32" cy="32" r="26" fill="none" stroke="#f3f0e8" strokeWidth="5" />
              <circle cx="32" cy="32" r="26" fill="none" stroke="#556f4a" strokeWidth="5" strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 26}`}
                strokeDashoffset={`${2 * Math.PI * 26 * (1 - progressoPct / 100)}`}
                className="transition-all duration-700 ease-out" />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-sage-700">{realizadas}/{totalRefeicoes}</span>
          </div>
          <p className="text-xs text-warm-500 font-medium">Refeições</p>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-cream-200 shadow-sm text-center">
          <div className="relative w-14 h-14 mx-auto mb-2">
            <svg className="w-14 h-14 -rotate-90" viewBox="0 0 64 64">
              <circle cx="32" cy="32" r="26" fill="none" stroke="#f3f0e8" strokeWidth="5" />
              <circle cx="32" cy="32" r="26" fill="none" stroke="#4a7a9a" strokeWidth="5" strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 26}`}
                strokeDashoffset={`${2 * Math.PI * 26 * (1 - aguaPct / 100)}`}
                className="transition-all duration-700 ease-out" />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-info">{aguaPct}%</span>
          </div>
          <p className="text-xs text-warm-500 font-medium">Água</p>
        </div>
      </div>

      {/* Tracker de água */}
      <div className="bg-gradient-to-r from-blue-50/80 to-cyan-50/80 backdrop-blur-sm rounded-2xl p-5 border border-blue-100 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-warm-800 text-sm flex items-center gap-2">💧 Hidratação</h2>
          <span className="text-sm text-info font-bold">{aguaHoje} / {META_AGUA} ml</span>
        </div>
        <div className="h-3 bg-blue-100 rounded-full overflow-hidden mb-4">
          <div className="h-full rounded-full bg-gradient-to-r from-blue-400 to-cyan-500 transition-all duration-500" style={{ width: `${aguaPct}%` }} />
        </div>
        <div className="flex gap-2 flex-wrap">
          {[200, 300, 500].map(ml => (
            <button key={ml} onClick={() => adicionarAgua(ml)}
              className="bg-white border border-blue-200 text-info px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-50 active:scale-95 transition-all min-h-[44px]">
              +{ml}ml
            </button>
          ))}
          <button onClick={salvarAgua}
            className={`ml-auto px-4 py-2.5 rounded-xl text-sm font-medium min-h-[44px] transition-all ${aguaSalva ? 'bg-sage-500 text-white' : 'bg-info text-white hover:bg-blue-600 active:scale-95'}`}>
            {aguaSalva ? '✓ Salvo' : 'Salvar'}
          </button>
        </div>
      </div>

      {/* Refeições */}
      <div className="space-y-3">
        <h2 className="font-semibold text-warm-800 text-lg mb-1">Refeições do Dia</h2>
        {dieta.refeicoes.map((ref) => {
          const isChecked = checks[ref.id];
          const isAnimating = animatingCheck === ref.id;
          const label = LABELS[ref.tipo];
          return (
            <div key={ref.id} className={`rounded-2xl border transition-all duration-300 overflow-hidden ${isChecked ? 'bg-sage-50/50 border-sage-200' : 'bg-white/80 backdrop-blur-sm border-cream-200 shadow-sm hover:shadow-md'}`}>
              <div className="flex items-center justify-between p-4 pb-0">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{label.emoji}</span>
                  <div>
                    <h3 className={`font-semibold transition-colors duration-300 ${isChecked ? 'text-sage-600' : 'text-warm-800'}`}>{label.nome}</h3>
                    {ref.horarioSugerido && <p className="text-xs text-warm-400">{ref.horarioSugerido}</p>}
                  </div>
                </div>
                <button onClick={() => toggleCheck(ref.id)}
                  className={`min-w-[52px] min-h-[52px] flex items-center justify-center rounded-2xl font-medium transition-all duration-300 focus-visible:ring-2 focus-visible:ring-sage-400 ${isChecked ? 'bg-sage-500 text-white shadow-md' : 'bg-cream-100 text-warm-400 border border-cream-300 hover:border-sage-300 hover:text-sage-600 hover:bg-sage-50'} ${isAnimating ? 'animate-check-pop' : ''}`}>
                  {isChecked ? (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span className="w-5 h-5 rounded-lg border-2 border-current" />
                  )}
                </button>
              </div>
              <div className="px-4 pb-4 pt-3">
                <ul className="space-y-1.5">
                  {ref.alimentos.map((al) => (
                    <li key={al.id} className="flex items-center justify-between">
                      <span className={`text-sm transition-all duration-300 ${isChecked ? 'text-warm-400 line-through' : 'text-warm-700'}`}>
                        <span className="text-warm-300 mr-1.5">•</span>
                        {al.nome} <span className="text-warm-400 ml-1">({al.quantidade})</span>
                      </span>
                      {al.receita && (
                        <button onClick={() => setReceitaAberta(al.receita!)}
                          className="text-xs text-sage-600 font-medium px-3 py-1.5 rounded-lg bg-sage-50 hover:bg-sage-100 transition-colors min-h-[32px]">
                          📖 Receita
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>

      {receitaAberta && <ModalReceita receita={receitaAberta} onClose={() => setReceitaAberta(null)} />}

      <PrintDieta
        titulo={dieta.titulo}
        refeicoes={dieta.refeicoes.map(r => ({
          tipo: r.tipo,
          horarioSugerido: r.horarioSugerido ?? undefined,
          alimentos: r.alimentos.map(a => ({ nome: a.nome, quantidade: a.quantidade, observacao: a.observacao ?? undefined })),
        }))}
        variant="fab"
      />
    </main>
  );
}
