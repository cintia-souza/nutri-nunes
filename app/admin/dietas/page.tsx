'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { TipoRefeicao } from '@/types';
import Link from 'next/link';

const TIPOS: { value: TipoRefeicao; label: string; emoji: string; horaPadrao: string }[] = [
  { value: 'CAFE_DA_MANHA', label: 'Café da Manhã', emoji: '☀️', horaPadrao: '07:00' },
  { value: 'LANCHE_DA_MANHA', label: 'Lanche da Manhã', emoji: '🍎', horaPadrao: '10:00' },
  { value: 'ALMOCO', label: 'Almoço', emoji: '🍽️', horaPadrao: '12:30' },
  { value: 'LANCHE_DA_TARDE', label: 'Lanche da Tarde', emoji: '🥤', horaPadrao: '15:30' },
  { value: 'JANTA', label: 'Janta', emoji: '🌙', horaPadrao: '19:00' },
  { value: 'CEIA', label: 'Ceia', emoji: '🫖', horaPadrao: '21:00' },
];

interface AlimentoForm { nome: string; quantidade: string; observacao: string; receitaId: string; }
interface RefeicaoForm { tipo: TipoRefeicao; horarioSugerido: string; alimentos: AlimentoForm[]; aberto: boolean; }
interface ClienteResumo { id: string; nome: string; email: string; }
interface ReceitaResumo { id: string; titulo: string; tempoPreparo?: string; }

function criarRefeicaoVazia(): RefeicaoForm[] {
  return TIPOS.map(t => ({ tipo: t.value, horarioSugerido: t.horaPadrao, alimentos: [{ nome: '', quantidade: '', observacao: '', receitaId: '' }], aberto: false }));
}

export default function DietasPage() {
  return (
    <Suspense fallback={<div className="max-w-4xl mx-auto px-6 py-8"><div className="animate-pulse h-10 bg-cream-200 rounded-xl w-1/3" /></div>}>
      <DietasContent />
    </Suspense>
  );
}

function DietasContent() {
  const params = useSearchParams();
  const paramClienteId = params.get('clienteId');

  const [clienteId, setClienteId] = useState(paramClienteId || '');
  const [clientes, setClientes] = useState<ClienteResumo[]>([]);
  const [receitas, setReceitas] = useState<ReceitaResumo[]>([]);
  const [titulo, setTitulo] = useState('');
  const [refeicoes, setRefeicoes] = useState<RefeicaoForm[]>(criarRefeicaoVazia());
  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  // Modo edição
  const [dietaId, setDietaId] = useState<string | null>(null);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    fetch('/api/admin/clientes').then(r => r.json()).then(setClientes);
    fetch('/api/admin/receitas').then(r => r.json()).then(setReceitas);
  }, []);

  // Carregar dieta existente quando selecionar paciente (se quiser editar)
  async function carregarDietaAtual() {
    if (!clienteId) return;
    setCarregando(true);
    const res = await fetch(`/api/admin/dietas?clienteId=${clienteId}`);
    const dieta = await res.json();
    setCarregando(false);

    if (!dieta) {
      alert('Este paciente não possui dieta ativa. Crie uma nova.');
      return;
    }

    setDietaId(dieta.id);
    setTitulo(dieta.titulo);
    setModoEdicao(true);

    // Mapear as refeições existentes para o form
    const refsMap = new Map<string, RefeicaoForm>();
    for (const ref of dieta.refeicoes) {
      refsMap.set(ref.tipo, {
        tipo: ref.tipo,
        horarioSugerido: ref.horarioSugerido || '',
        aberto: true,
        alimentos: ref.alimentos.map((al: { nome: string; quantidade: string; observacao?: string; receitaId?: string }) => ({
          nome: al.nome,
          quantidade: al.quantidade,
          observacao: al.observacao || '',
          receitaId: al.receitaId || '',
        })),
      });
    }

    // Preencher todas as refeições (mesmo as que não tinham dados)
    setRefeicoes(TIPOS.map(t => refsMap.get(t.value) || {
      tipo: t.value, horarioSugerido: t.horaPadrao, alimentos: [{ nome: '', quantidade: '', observacao: '', receitaId: '' }], aberto: false,
    }));
  }

  function resetTudo() {
    setTitulo('');
    setRefeicoes(criarRefeicaoVazia());
    setDietaId(null);
    setModoEdicao(false);
    setSucesso(false);
  }

  function toggleRefeicao(idx: number) {
    const u = [...refeicoes]; u[idx].aberto = !u[idx].aberto; setRefeicoes(u);
  }

  function addAlimento(refIdx: number) {
    const u = [...refeicoes]; u[refIdx].alimentos.push({ nome: '', quantidade: '', observacao: '', receitaId: '' }); setRefeicoes(u);
  }

  function updateAlimento(refIdx: number, alIdx: number, field: keyof AlimentoForm, value: string) {
    const u = [...refeicoes]; u[refIdx].alimentos[alIdx][field] = value; setRefeicoes(u);
  }

  function removeAlimento(refIdx: number, alIdx: number) {
    const u = [...refeicoes]; u[refIdx].alimentos.splice(alIdx, 1); setRefeicoes(u);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!clienteId) return;
    setSalvando(true);

    const refsPayload = refeicoes.map(r => ({
      tipo: r.tipo,
      horarioSugerido: r.horarioSugerido || undefined,
      alimentos: r.alimentos.filter(a => a.nome.trim()).map(a => ({
        nome: a.nome,
        quantidade: a.quantidade,
        observacao: a.observacao || undefined,
        receitaId: a.receitaId || undefined,
      })),
    })).filter(r => r.alimentos.length > 0);

    if (modoEdicao && dietaId) {
      // Editar existente
      await fetch('/api/admin/dietas', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dietaId, titulo, refeicoes: refsPayload }),
      });
    } else {
      // Criar nova
      await fetch('/api/admin/dietas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clienteId, titulo, refeicoes: refsPayload }),
      });
    }

    setSalvando(false);
    setSucesso(true);
  }

  if (sucesso) {
    return (
      <main className="max-w-lg mx-auto px-6 py-16 text-center">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-10 border border-cream-200 shadow-sm animate-fade-slide-in">
          <div className="w-20 h-20 bg-sage-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-sage-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-warm-800 mb-2">
            {modoEdicao ? 'Dieta Atualizada!' : 'Dieta Prescrita!'}
          </h2>
          <p className="text-warm-500 mb-6">
            {modoEdicao ? 'As alterações foram salvas com sucesso.' : 'Plano alimentar atribuído com sucesso.'}
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/admin" className="bg-sage-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-sage-700 transition-all">Painel</Link>
            <button onClick={resetTudo} className="border border-cream-300 text-warm-600 px-6 py-3 rounded-xl font-medium hover:bg-cream-50 transition-all">
              Nova Dieta
            </button>
          </div>
        </div>
      </main>
    );
  }

  const clienteSelecionado = clientes.find(c => c.id === clienteId);
  const alimentosPreenchidos = refeicoes.reduce((sum, r) => sum + r.alimentos.filter(a => a.nome.trim()).length, 0);

  return (
    <main className="max-w-4xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-warm-800">
          {modoEdicao ? '✏️ Editar Dieta' : 'Prescrever Dieta'}
        </h1>
        <p className="text-warm-500 mt-1">
          {modoEdicao ? 'Reajuste o plano alimentar do paciente.' : 'Monte o plano alimentar personalizado.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Seletor de paciente + botão carregar */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-cream-200 shadow-sm">
          <label htmlFor="select-cliente" className="block text-sm font-medium text-warm-600 mb-2">Paciente</label>
          <div className="flex gap-3">
            <select
              id="select-cliente"
              value={clienteId}
              onChange={(e) => { setClienteId(e.target.value); setModoEdicao(false); setDietaId(null); }}
              className="flex-1 border border-cream-300 rounded-xl px-4 py-3.5 bg-cream-50 text-warm-800 focus-visible:ring-2 focus-visible:ring-sage-400 transition-all appearance-none"
              required
            >
              <option value="">Selecione um paciente...</option>
              {clientes.map(c => (
                <option key={c.id} value={c.id}>{c.nome} — {c.email}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={carregarDietaAtual}
              disabled={!clienteId || carregando}
              className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-xl text-sm font-medium hover:bg-amber-100 transition-all disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap min-h-[48px]"
            >
              {carregando ? '⏳' : '📋'} {carregando ? 'Carregando...' : 'Editar Atual'}
            </button>
          </div>
          {clienteSelecionado && (
            <div className="mt-2 flex items-center gap-2">
              <p className="text-sm text-sage-600 font-medium">✓ {clienteSelecionado.nome}</p>
              {modoEdicao && (
                <span className="text-xs bg-amber-100 text-amber-700 px-2.5 py-0.5 rounded-lg font-medium">Modo edição</span>
              )}
            </div>
          )}
        </div>

        {/* Título da dieta */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-cream-200 shadow-sm">
          <label htmlFor="dieta-titulo" className="block text-sm font-medium text-warm-600 mb-2">Nome da Dieta</label>
          <input
            id="dieta-titulo"
            type="text"
            placeholder="Ex: Plano Emagrecimento – Fase 1"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            className="w-full border border-cream-300 rounded-xl px-4 py-3.5 text-lg bg-cream-50 text-warm-800 placeholder-warm-400 focus-visible:ring-2 focus-visible:ring-sage-400 transition-all"
            required
          />
        </div>

        {/* Resumo rápido */}
        <div className="flex gap-3 items-center justify-between text-sm bg-cream-100 rounded-xl px-4 py-3 border border-cream-200">
          <div className="flex items-center gap-2 text-warm-500">
            <span>📊</span>
            <span>{alimentosPreenchidos} alimentos em {refeicoes.filter(r => r.alimentos.some(a => a.nome.trim())).length} refeições</span>
          </div>
          {modoEdicao && (
            <button
              type="button"
              onClick={resetTudo}
              className="text-xs text-warm-400 hover:text-danger underline"
            >
              Descartar e criar nova
            </button>
          )}
        </div>

        {/* Refeições accordion */}
        <div className="space-y-3">
          {refeicoes.map((ref, refIdx) => {
            const temAlimentos = ref.alimentos.some(a => a.nome.trim());
            return (
              <div key={ref.tipo} className="bg-white/80 backdrop-blur-sm rounded-2xl border border-cream-200 shadow-sm overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleRefeicao(refIdx)}
                  className="w-full flex items-center justify-between px-6 py-4 hover:bg-cream-50/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{TIPOS[refIdx].emoji}</span>
                    <span className="font-semibold text-warm-800">{TIPOS[refIdx].label}</span>
                    {temAlimentos && (
                      <span className="bg-sage-100 text-sage-700 text-xs font-medium px-2 py-0.5 rounded-lg">
                        {ref.alimentos.filter(a => a.nome.trim()).length} itens
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-warm-400">{ref.horarioSugerido}</span>
                    <svg className={`w-5 h-5 text-warm-400 transition-transform duration-200 ${ref.aberto ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {ref.aberto && (
                  <div className="px-6 pb-5 pt-2 border-t border-cream-100 animate-fade-slide-in">
                    <div className="flex items-center gap-2 mb-4">
                      <label className="text-xs text-warm-500">Horário:</label>
                      <input
                        type="text"
                        value={ref.horarioSugerido}
                        onChange={(e) => { const u = [...refeicoes]; u[refIdx].horarioSugerido = e.target.value; setRefeicoes(u); }}
                        className="border border-cream-200 rounded-lg px-3 py-1.5 text-sm w-20 text-center bg-cream-50 focus-visible:ring-2 focus-visible:ring-sage-400"
                      />
                    </div>

                    <div className="space-y-3">
                      {ref.alimentos.map((al, alIdx) => (
                        <div key={alIdx} className="bg-cream-50/50 rounded-xl p-3 border border-cream-100 group">
                          <div className="flex gap-2 items-center">
                            <span className="text-warm-300 text-sm w-5 text-center">{alIdx + 1}.</span>
                            <input
                              placeholder="Alimento"
                              value={al.nome}
                              onChange={(e) => updateAlimento(refIdx, alIdx, 'nome', e.target.value)}
                              className="flex-1 border border-cream-200 rounded-xl px-3.5 py-2.5 text-sm bg-white text-warm-700 placeholder-warm-400 focus-visible:ring-2 focus-visible:ring-sage-400"
                            />
                            <input
                              placeholder="Qtd"
                              value={al.quantidade}
                              onChange={(e) => updateAlimento(refIdx, alIdx, 'quantidade', e.target.value)}
                              className="w-24 border border-cream-200 rounded-xl px-3 py-2.5 text-sm bg-white text-warm-700 placeholder-warm-400 focus-visible:ring-2 focus-visible:ring-sage-400"
                            />
                            <button
                              type="button"
                              onClick={() => removeAlimento(refIdx, alIdx)}
                              className="opacity-0 group-hover:opacity-100 min-w-[32px] min-h-[32px] flex items-center justify-center rounded-lg text-warm-300 hover:text-danger hover:bg-red-50 transition-all"
                              aria-label="Remover"
                            >
                              ✕
                            </button>
                          </div>
                          <div className="mt-2 ml-7 flex items-center gap-2">
                            <span className="text-xs text-warm-400">📖 Receita:</span>
                            <select
                              value={al.receitaId}
                              onChange={(e) => { const u = [...refeicoes]; u[refIdx].alimentos[alIdx].receitaId = e.target.value; setRefeicoes(u); }}
                              className="flex-1 border border-cream-200 rounded-lg px-2.5 py-1.5 text-xs bg-white text-warm-700 focus-visible:ring-2 focus-visible:ring-sage-400"
                            >
                              <option value="">Nenhuma (opcional)</option>
                              {receitas.map(r => (
                                <option key={r.id} value={r.id}>{r.titulo}{r.tempoPreparo ? ` (${r.tempoPreparo})` : ''}</option>
                              ))}
                            </select>
                            {al.receitaId && <span className="text-xs text-sage-600 font-medium">✓</span>}
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => addAlimento(refIdx)}
                      className="mt-3 inline-flex items-center gap-1.5 text-sage-600 text-sm font-medium hover:text-sage-700 px-3 py-2 rounded-lg hover:bg-sage-50 transition-all"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                      Adicionar alimento
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Botão submit */}
        <button
          type="submit"
          disabled={salvando || !clienteId || !titulo}
          className={`w-full text-white py-4 rounded-2xl font-semibold text-base active:scale-[0.98] transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed min-h-[56px] ${
            modoEdicao ? 'bg-amber-600 hover:bg-amber-700' : 'bg-sage-600 hover:bg-sage-700'
          }`}
        >
          {salvando ? 'Salvando...' : modoEdicao ? '✏️ Salvar Alterações na Dieta' : '✓ Criar Nova Dieta'}
        </button>
      </form>
    </main>
  );
}
