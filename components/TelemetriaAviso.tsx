'use client';

import { useEffect, useState } from 'react';

export default function TelemetriaAviso() {
  const [precisaPeso, setPrecisaPeso] = useState(false);
  const [pesoInput, setPesoInput] = useState('');
  const [salvo, setSalvo] = useState(false);

  useEffect(() => {
    fetch('/api/cliente/telemetria').then(r => r.json()).then(data => {
      if (data?.precisaAtualizarPeso) setPrecisaPeso(true);
    });
  }, []);

  async function salvarPeso() {
    const peso = parseFloat(pesoInput);
    if (!peso) return;
    await fetch('/api/cliente/progresso', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ peso, data: new Date().toISOString().split('T')[0] }),
    });
    setPrecisaPeso(false);
    setSalvo(true);
  }

  if (!precisaPeso && !salvo) return null;

  if (salvo) {
    return (
      <div className="bg-sage-50 border border-sage-200 rounded-2xl p-4 mb-4 animate-fade-slide-in" role="status" aria-live="polite">
        <p className="text-sage-700 font-medium text-sm">✓ Peso atualizado com sucesso!</p>
      </div>
    );
  }

  return (
    <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-5 mb-4 animate-fade-slide-in" role="alert">
      <p className="font-medium text-amber-800 mb-3 text-sm">⚠️ Faz mais de 7 dias — atualize seu peso</p>
      <div className="flex gap-2">
        <label htmlFor="peso-semanal" className="sr-only">Peso atual em kg</label>
        <input
          id="peso-semanal"
          type="number"
          step="0.1"
          placeholder="Peso atual (kg)"
          value={pesoInput}
          onChange={(e) => setPesoInput(e.target.value)}
          className="border border-amber-200 rounded-xl px-4 py-3 flex-1 text-sm bg-white text-warm-700 placeholder-warm-400 focus-visible:ring-2 focus-visible:ring-sage-400 focus-visible:border-sage-400"
        />
        <button
          onClick={salvarPeso}
          className="bg-amber-600 text-white px-5 rounded-xl font-medium text-sm transition-all duration-200 hover:bg-amber-700 active:scale-[0.97] min-h-[48px] focus-visible:ring-2 focus-visible:ring-sage-400 focus-visible:ring-offset-2"
        >
          Salvar
        </button>
      </div>
    </div>
  );
}
