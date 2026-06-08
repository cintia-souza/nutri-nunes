'use client';

import { useState } from 'react';

export default function AvaliacaoClientePage() {
  const [nota, setNota] = useState(5);
  const [texto, setTexto] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [hoverNota, setHoverNota] = useState(0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!texto.trim()) return;
    await fetch('/api/cliente/avaliacao', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nota, texto }),
    });
    setEnviado(true);
  }

  if (enviado) {
    return (
      <main className="max-w-lg mx-auto px-6 py-16 text-center">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-10 border border-cream-200 shadow-sm animate-fade-slide-in">
          <div className="w-20 h-20 bg-sage-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">⭐</span>
          </div>
          <h2 className="text-2xl font-bold text-warm-800 mb-2">Obrigada pela avaliação!</h2>
          <p className="text-warm-500">Seu depoimento será revisado e publicado em breve.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-lg mx-auto px-6 py-8">
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-cream-200 shadow-sm">
        <div className="text-center mb-6">
          <span className="text-4xl mb-3 block">⭐</span>
          <h1 className="text-2xl font-bold text-warm-800">Avalie seu atendimento</h1>
          <p className="text-warm-500 text-sm mt-1">Sua opinião ajuda outros pacientes e nos motiva!</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Estrelas interativas */}
          <div className="text-center">
            <p className="text-sm font-medium text-warm-600 mb-3">Qual sua nota?</p>
            <div className="flex justify-center gap-1">
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setNota(n)}
                  onMouseEnter={() => setHoverNota(n)}
                  onMouseLeave={() => setHoverNota(0)}
                  className="text-4xl transition-transform hover:scale-125 active:scale-95 min-w-[48px] min-h-[48px]"
                  aria-label={`${n} estrela${n > 1 ? 's' : ''}`}
                >
                  {n <= (hoverNota || nota) ? '⭐' : '☆'}
                </button>
              ))}
            </div>
            <p className="text-sm text-warm-400 mt-2">
              {nota === 5 ? 'Excelente!' : nota === 4 ? 'Muito bom!' : nota === 3 ? 'Bom' : nota === 2 ? 'Regular' : 'Poderia melhorar'}
            </p>
          </div>

          {/* Texto */}
          <div>
            <label htmlFor="avaliacao-texto" className="block text-sm font-medium text-warm-600 mb-1.5">Conte sua experiência</label>
            <textarea
              id="avaliacao-texto"
              value={texto}
              onChange={e => setTexto(e.target.value)}
              placeholder="Como foi seu acompanhamento? O que mudou na sua vida?"
              className="w-full border border-cream-300 rounded-xl px-4 py-3 bg-cream-50 text-warm-800 placeholder-warm-400 h-32 resize-none focus-visible:ring-2 focus-visible:ring-sage-400"
              required
            />
          </div>

          <button
            type="submit"
            disabled={!texto.trim()}
            className="w-full bg-sage-600 text-white py-3.5 rounded-xl font-semibold hover:bg-sage-700 active:scale-[0.98] transition-all disabled:opacity-40 min-h-[52px]"
          >
            Enviar Avaliação
          </button>
        </form>
      </div>
    </main>
  );
}
