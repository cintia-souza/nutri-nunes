'use client';

import { useEffect, useState } from 'react';
import { Receita } from '@/types';

interface ReceitaComRefeicao extends Receita {
  alimentoNome?: string;
  refeicaoTipo?: string;
}

const EMOJI_REFEICAO: Record<string, string> = {
  CAFE_DA_MANHA: '☀️',
  LANCHE_DA_MANHA: '🍎',
  ALMOCO: '🍽️',
  LANCHE_DA_TARDE: '🥤',
  JANTA: '🌙',
  CEIA: '🫖',
};

const IMAGES_PLACEHOLDER = [
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1547592180-85f173990554?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=400&h=300&fit=crop',
];

export default function ReceitasPage() {
  const [receitas, setReceitas] = useState<ReceitaComRefeicao[]>([]);
  const [selecionada, setSelecionada] = useState<ReceitaComRefeicao | null>(null);

  useEffect(() => {
    fetch('/api/cliente/dieta')
      .then(r => r.json())
      .then(dieta => {
        if (!dieta?.refeicoes) return;
        const recs: ReceitaComRefeicao[] = [];
        for (const ref of dieta.refeicoes) {
          for (const al of ref.alimentos) {
            if (al.receita) {
              recs.push({ ...al.receita, alimentoNome: al.nome, refeicaoTipo: ref.tipo });
            }
          }
        }
        setReceitas(recs);
      });
  }, []);

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 md:px-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-warm-800">Minhas Receitas</h1>
        <p className="text-warm-500 mt-1">
          Todas as receitas do seu plano alimentar em um só lugar.
        </p>
      </div>

      {receitas.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 border border-cream-200 text-center">
          <div className="w-20 h-20 bg-cream-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">📖</span>
          </div>
          <h2 className="text-lg font-semibold text-warm-700 mb-2">Nenhuma receita disponível</h2>
          <p className="text-warm-500 text-sm">Quando sua nutricionista adicionar receitas ao seu plano, elas aparecerão aqui.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-5">
          {receitas.map((rec, i) => (
            <button
              key={rec.id}
              onClick={() => setSelecionada(rec)}
              className="group text-left bg-white/80 backdrop-blur-sm rounded-2xl border border-cream-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden"
            >
              {/* Imagem */}
              <div className="h-44 overflow-hidden relative">
                <img
                  src={IMAGES_PLACEHOLDER[i % IMAGES_PLACEHOLDER.length]}
                  alt={rec.titulo}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                {rec.tempoPreparo && (
                  <span className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm text-warm-700 text-xs font-medium px-2.5 py-1 rounded-lg">
                    ⏱ {rec.tempoPreparo}
                  </span>
                )}
                {rec.refeicaoTipo && (
                  <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-sm px-2 py-1 rounded-lg">
                    {EMOJI_REFEICAO[rec.refeicaoTipo]}
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="p-5">
                <h3 className="font-bold text-warm-800 text-lg mb-1 group-hover:text-sage-700 transition-colors">
                  {rec.titulo}
                </h3>
                {rec.alimentoNome && (
                  <p className="text-sm text-warm-500">Para: {rec.alimentoNome}</p>
                )}
                <div className="flex items-center gap-2 mt-3">
                  <span className="text-xs bg-sage-50 text-sage-700 px-2.5 py-1 rounded-lg font-medium">
                    {rec.ingredientes.length} ingredientes
                  </span>
                  <span className="text-xs bg-cream-100 text-warm-600 px-2.5 py-1 rounded-lg font-medium">
                    {rec.modoPreparo.length} passos
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Modal de Receita detalhada */}
      {selecionada && (
        <div
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="receita-titulo"
          onClick={() => setSelecionada(null)}
        >
          <div className="absolute inset-0 bg-warm-900/50 backdrop-blur-sm" aria-hidden="true" />

          <div
            onClick={(e) => e.stopPropagation()}
            className="relative bg-white rounded-t-3xl md:rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-fade-slide-in"
          >
            {/* Header com imagem */}
            <div className="relative h-48 overflow-hidden rounded-t-3xl md:rounded-t-3xl">
              <img
                src={IMAGES_PLACEHOLDER[receitas.indexOf(selecionada) % IMAGES_PLACEHOLDER.length]}
                alt={selecionada.titulo}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <button
                onClick={() => setSelecionada(null)}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-warm-700 hover:bg-white transition-colors shadow-sm"
                aria-label="Fechar"
              >
                ✕
              </button>
              <div className="absolute bottom-4 left-5">
                <h3 id="receita-titulo" className="text-xl font-bold text-white">{selecionada.titulo}</h3>
                {selecionada.tempoPreparo && (
                  <p className="text-white/80 text-sm mt-1">⏱ {selecionada.tempoPreparo}</p>
                )}
              </div>
            </div>

            <div className="p-6 md:p-8">
              {/* Ingredientes */}
              <section className="mb-6">
                <h4 className="text-sm font-bold text-sage-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-sage-100 flex items-center justify-center text-xs">🧾</span>
                  Ingredientes
                </h4>
                <ul className="space-y-2">
                  {selecionada.ingredientes.map((ing, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-warm-700">
                      <span className="w-2 h-2 rounded-full bg-sage-400 mt-1.5 shrink-0" />
                      {ing}
                    </li>
                  ))}
                </ul>
              </section>

              {/* Modo de preparo */}
              <section>
                <h4 className="text-sm font-bold text-sage-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-sage-100 flex items-center justify-center text-xs">👩‍🍳</span>
                  Modo de Preparo
                </h4>
                <ol className="space-y-4">
                  {selecionada.modoPreparo.map((passo, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="w-7 h-7 rounded-full bg-sage-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                        {i + 1}
                      </span>
                      <p className="text-sm text-warm-700 pt-1 leading-relaxed">{passo}</p>
                    </li>
                  ))}
                </ol>
              </section>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
