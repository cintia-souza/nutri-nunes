'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface ClienteResumo { id: string; nome: string; email: string; }

const GRUPOS = [
  { key: 'frutas', label: 'Frutas', emoji: '🍎', desc: 'Aceitação e variedade de frutas' },
  { key: 'verduras', label: 'Verduras', emoji: '🥬', desc: 'Folhas verdes e vegetais crus' },
  { key: 'legumes', label: 'Legumes', emoji: '🥕', desc: 'Legumes cozidos e preparados' },
  { key: 'proteinas', label: 'Proteínas', emoji: '🍗', desc: 'Carnes, ovos, leguminosas' },
  { key: 'cereais', label: 'Cereais', emoji: '🌾', desc: 'Arroz, pães, massas, aveia' },
  { key: 'agua', label: 'Água', emoji: '💧', desc: 'Consumo adequado de água' },
] as const;

const HABITOS_RUINS = [
  { key: 'refrigerantes', label: 'Refrigerantes', emoji: '🥤', desc: 'Refrigerantes e sucos industrializados' },
  { key: 'doces', label: 'Doces', emoji: '🍬', desc: 'Balas, chocolates, sobremesas' },
  { key: 'fastFood', label: 'Fast-Food', emoji: '🍔', desc: 'Lanches de redes, frituras' },
  { key: 'ultraprocessados', label: 'Ultraprocessados', emoji: '📦', desc: 'Salgadinhos, biscoitos, embutidos' },
  { key: 'beliscos', label: 'Beliscos', emoji: '🍿', desc: 'Comer entre refeições sem fome' },
] as const;

export default function AvaliacaoNutricionalPage() {
  return (
    <Suspense fallback={<div className="max-w-3xl mx-auto px-6 py-8"><div className="animate-pulse h-10 bg-cream-200 rounded-xl w-1/3" /></div>}>
      <AvaliacaoContent />
    </Suspense>
  );
}

function AvaliacaoContent() {
  const params = useSearchParams();
  const [clienteId, setClienteId] = useState(params.get('clienteId') || '');
  const [clientes, setClientes] = useState<ClienteResumo[]>([]);
  const [data, setData] = useState(() => new Date().toISOString().slice(0, 10));
  const [tipo, setTipo] = useState<'INICIAL' | 'ACOMPANHAMENTO'>('ACOMPANHAMENTO');
  const [grupos, setGrupos] = useState<Record<string, number>>({ frutas: 5, verduras: 5, legumes: 5, proteinas: 5, cereais: 5, agua: 5 });
  const [habitos, setHabitos] = useState<Record<string, number>>({ refrigerantes: 0, doces: 0, fastFood: 0, ultraprocessados: 0, beliscos: 0 });
  const [observacao, setObservacao] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  useEffect(() => {
    fetch('/api/admin/clientes').then(r => r.json()).then(setClientes);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!clienteId) return;
    setSalvando(true);
    await fetch('/api/admin/avaliacao-nutricional', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clienteId, data, tipo, ...grupos, ...habitos, observacao: observacao || undefined }),
    });
    setSalvando(false);
    setSucesso(true);
    setTimeout(() => setSucesso(false), 3000);
  }

  const clienteSelecionado = clientes.find(c => c.id === clienteId);

  return (
    <main className="max-w-3xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-warm-800">🩺 Avaliação Nutricional</h1>
        <p className="text-warm-500 mt-1">Registre a aceitação de grupos alimentares e hábitos inadequados.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Paciente + Data + Tipo */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-cream-200 shadow-sm">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-warm-600 mb-2">Paciente</label>
              <select value={clienteId} onChange={(e) => setClienteId(e.target.value)}
                className="w-full border border-cream-300 rounded-xl px-4 py-3 bg-cream-50 text-warm-800 focus-visible:ring-2 focus-visible:ring-sage-400" required>
                <option value="">Selecione...</option>
                {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-warm-600 mb-2">Data</label>
              <input type="date" value={data} onChange={(e) => setData(e.target.value)}
                className="w-full border border-cream-300 rounded-xl px-4 py-3 bg-cream-50 text-warm-800 focus-visible:ring-2 focus-visible:ring-sage-400" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-warm-600 mb-2">Tipo</label>
              <select value={tipo} onChange={(e) => setTipo(e.target.value as 'INICIAL' | 'ACOMPANHAMENTO')}
                className="w-full border border-cream-300 rounded-xl px-4 py-3 bg-cream-50 text-warm-800 focus-visible:ring-2 focus-visible:ring-sage-400">
                <option value="INICIAL">Avaliação Inicial</option>
                <option value="ACOMPANHAMENTO">Acompanhamento</option>
              </select>
            </div>
          </div>
          {clienteSelecionado && (
            <p className="mt-3 text-sm font-medium" style={{color:'#1a8558'}}>✓ {clienteSelecionado.nome}</p>
          )}
        </div>

        {/* Grupos Alimentares */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-cream-200 shadow-sm space-y-5">
          <div>
            <h2 className="font-semibold text-warm-800 flex items-center gap-2">🥗 Aceitação de Grupos Alimentares</h2>
            <p className="text-xs text-warm-400 mt-1">0 = rejeita totalmente · 10 = aceita com variedade</p>
          </div>
          {GRUPOS.map(g => (
            <div key={g.key}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span>{g.emoji}</span>
                  <span className="text-sm font-medium text-warm-700">{g.label}</span>
                </div>
                <span className="text-lg font-bold" style={{color: grupos[g.key] >= 7 ? '#1a8558' : grupos[g.key] >= 4 ? '#b45309' : '#dc2626'}}>
                  {grupos[g.key]}
                </span>
              </div>
              <p className="text-xs text-warm-400 mb-2">{g.desc}</p>
              <input type="range" min={0} max={10} value={grupos[g.key]}
                onChange={(e) => setGrupos(prev => ({ ...prev, [g.key]: Number(e.target.value) }))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer"
                style={{background: `linear-gradient(to right, #1a8558 ${grupos[g.key] * 10}%, #ede9e2 ${grupos[g.key] * 10}%)`}} />
            </div>
          ))}
        </div>

        {/* Hábitos Inadequados */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-cream-200 shadow-sm space-y-5">
          <div>
            <h2 className="font-semibold text-warm-800 flex items-center gap-2">⚠️ Hábitos Inadequados</h2>
            <p className="text-xs text-warm-400 mt-1">Frequência semanal: 0 = nunca · 7 = todos os dias</p>
          </div>
          {HABITOS_RUINS.map(h => (
            <div key={h.key}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span>{h.emoji}</span>
                  <span className="text-sm font-medium text-warm-700">{h.label}</span>
                </div>
                <span className="text-lg font-bold" style={{color: habitos[h.key] <= 1 ? '#1a8558' : habitos[h.key] <= 3 ? '#b45309' : '#dc2626'}}>
                  {habitos[h.key]}x/sem
                </span>
              </div>
              <p className="text-xs text-warm-400 mb-2">{h.desc}</p>
              <input type="range" min={0} max={7} value={habitos[h.key]}
                onChange={(e) => setHabitos(prev => ({ ...prev, [h.key]: Number(e.target.value) }))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer"
                style={{background: `linear-gradient(to right, #dc2626 ${(habitos[h.key] / 7) * 100}%, #ede9e2 ${(habitos[h.key] / 7) * 100}%)`}} />
            </div>
          ))}
        </div>

        {/* Observação */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-cream-200 shadow-sm">
          <label className="block text-sm font-medium text-warm-600 mb-2">Observação (opcional)</label>
          <textarea value={observacao} onChange={(e) => setObservacao(e.target.value)} rows={3} placeholder="Notas sobre a avaliação..."
            className="w-full border border-cream-300 rounded-xl px-4 py-3 bg-cream-50 text-warm-800 placeholder-warm-400 focus-visible:ring-2 focus-visible:ring-sage-400 resize-none" />
        </div>

        {/* Submit */}
        <div className="flex gap-3">
          <button type="submit" disabled={salvando || !clienteId}
            className="flex-1 text-white py-4 rounded-2xl font-semibold transition-all disabled:opacity-40 min-h-[56px]"
            style={{background:'linear-gradient(135deg,#1a8558,#0f3d29)'}}>
            {salvando ? 'Salvando...' : '✓ Registrar Avaliação'}
          </button>
          {clienteId && (
            <Link href={`/admin/relatorio?clienteId=${clienteId}`}
              className="flex items-center justify-center px-6 py-4 rounded-2xl font-medium border border-cream-300 text-warm-600 hover:bg-cream-50 transition-all min-h-[56px]">
              📈 Relatório
            </Link>
          )}
        </div>

        {sucesso && (
          <div className="text-center py-3 rounded-xl text-sm font-medium animate-fade-slide-in" style={{background:'#f0faf5', color:'#166947'}}>
            ✓ Avaliação nutricional registrada!
          </div>
        )}
      </form>
    </main>
  );
}
