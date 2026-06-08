'use client';

import { useEffect, useState } from 'react';

interface ProgressoItem {
  data: string;
  peso?: number;
  aguaMl?: number;
}

export default function ProgressoPage() {
  const [progressos, setProgressos] = useState<ProgressoItem[]>([]);
  const [pesoInput, setPesoInput] = useState('');
  const [salvo, setSalvo] = useState(false);

  useEffect(() => {
    fetch('/api/cliente/progresso/historico')
      .then(r => r.ok ? r.json() : [])
      .then(setProgressos)
      .catch(() => {});
  }, []);

  async function registrarPeso() {
    const peso = parseFloat(pesoInput);
    if (!peso) return;
    await fetch('/api/cliente/progresso', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ peso, data: new Date().toISOString().split('T')[0] }),
    });
    setPesoInput('');
    setSalvo(true);
    setTimeout(() => setSalvo(false), 3000);
  }

  const pesos = progressos.filter(p => p.peso);
  const aguas = progressos.filter(p => p.aguaMl);
  const pesoAtual = pesos.length > 0 ? pesos[pesos.length - 1].peso : null;
  const pesoInicial = pesos.length > 0 ? pesos[0].peso : null;
  const variacao = pesoAtual && pesoInicial ? pesoAtual - pesoInicial : null;

  return (
    <main className="max-w-3xl mx-auto px-4 py-8 md:px-6">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-warm-800">Meu Progresso</h1>
        <p className="text-warm-500 mt-1">Acompanhe sua evolução semana a semana.</p>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-cream-200 shadow-sm text-center">
          <p className="text-2xl font-bold text-sage-700">{pesoAtual ? `${pesoAtual}` : '--'}</p>
          <p className="text-xs text-warm-500 mt-1">Peso Atual (kg)</p>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-cream-200 shadow-sm text-center">
          <p className={`text-2xl font-bold ${variacao && variacao < 0 ? 'text-sage-600' : variacao && variacao > 0 ? 'text-danger' : 'text-warm-400'}`}>
            {variacao ? `${variacao > 0 ? '+' : ''}${variacao.toFixed(1)}` : '--'}
          </p>
          <p className="text-xs text-warm-500 mt-1">Variação (kg)</p>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-cream-200 shadow-sm text-center">
          <p className="text-2xl font-bold text-info">{pesos.length}</p>
          <p className="text-xs text-warm-500 mt-1">Pesagens</p>
        </div>
      </div>

      {/* Registrar peso */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-cream-200 shadow-sm mb-8">
        <h2 className="font-semibold text-warm-800 mb-3 flex items-center gap-2">
          <span>⚖️</span> Registrar Peso
        </h2>
        <div className="flex gap-3">
          <input
            type="number"
            step="0.1"
            value={pesoInput}
            onChange={(e) => setPesoInput(e.target.value)}
            placeholder="Ex: 68.5"
            className="flex-1 border border-cream-300 rounded-xl px-4 py-3 bg-cream-50 text-warm-800 placeholder-warm-400 focus-visible:ring-2 focus-visible:ring-sage-400"
          />
          <button
            onClick={registrarPeso}
            disabled={!pesoInput}
            className="bg-sage-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-sage-700 active:scale-[0.97] transition-all disabled:opacity-40 min-h-[48px]"
          >
            {salvo ? '✓' : 'Salvar'}
          </button>
        </div>
      </div>

      {/* Histórico de peso */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-cream-200 shadow-sm mb-8 overflow-hidden">
        <div className="px-5 py-4 border-b border-cream-100">
          <h2 className="font-semibold text-warm-800 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-sage-500" />
            Histórico de Peso
          </h2>
        </div>
        {pesos.length > 0 ? (
          <div className="divide-y divide-cream-100">
            {[...pesos].reverse().map((p, i) => (
              <div key={p.data} className="px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-warm-400 w-24">{p.data}</span>
                  {i > 0 && pesos[pesos.length - 1 - i + 1] && (
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-lg ${
                      (p.peso || 0) < (pesos[pesos.length - 1 - i + 1]?.peso || 0) ? 'bg-sage-50 text-sage-700' : 'bg-red-50 text-danger'
                    }`}>
                      {((p.peso || 0) - (pesos[pesos.length - 1 - i + 1]?.peso || 0)).toFixed(1)} kg
                    </span>
                  )}
                </div>
                <span className="font-bold text-warm-800">{p.peso} kg</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-warm-400">Nenhum registro ainda.</div>
        )}
      </div>

      {/* Histórico de água */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-cream-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-cream-100">
          <h2 className="font-semibold text-warm-800 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-info" />
            Histórico de Hidratação
          </h2>
        </div>
        {aguas.length > 0 ? (
          <div className="divide-y divide-cream-100">
            {[...aguas].reverse().slice(0, 14).map((p) => (
              <div key={p.data} className="px-5 py-3 flex items-center justify-between">
                <span className="text-sm text-warm-400">{p.data}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-cream-200 rounded-full overflow-hidden">
                    <div className="h-full bg-info rounded-full" style={{ width: `${Math.min(((p.aguaMl || 0) / 2500) * 100, 100)}%` }} />
                  </div>
                  <span className="font-medium text-warm-700 text-sm w-16 text-right">{p.aguaMl} ml</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-warm-400">Nenhum registro ainda.</div>
        )}
      </div>
    </main>
  );
}
