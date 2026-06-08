'use client';

import { useEffect, useRef } from 'react';
import { Receita } from '@/types';

interface Props {
  receita: Receita;
  onClose: () => void;
}

export default function ModalReceita({ receita, onClose }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();

    function handleEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-receita-titulo"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-warm-900/40 backdrop-blur-sm animate-fade-slide-in" aria-hidden="true" />

      {/* Panel */}
      <div
        ref={dialogRef}
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white rounded-t-3xl md:rounded-3xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-6 md:p-8 shadow-xl animate-fade-slide-in"
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-5">
          <div>
            <h3 id="modal-receita-titulo" className="text-xl font-bold text-warm-800">{receita.titulo}</h3>
            {receita.tempoPreparo && (
              <p className="text-sm text-warm-500 mt-1 flex items-center gap-1">
                <span aria-hidden="true">⏱</span>
                <span>{receita.tempoPreparo}</span>
              </p>
            )}
          </div>
          <button
            ref={closeRef}
            onClick={onClose}
            aria-label="Fechar receita"
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-warm-400 hover:text-warm-700 hover:bg-cream-100 transition-colors focus-visible:ring-2 focus-visible:ring-sage-400"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Ingredientes */}
        <section aria-labelledby="ingredientes-heading" className="mb-6">
          <h4 id="ingredientes-heading" className="text-sm font-semibold text-sage-700 uppercase tracking-wide mb-3">
            Ingredientes
          </h4>
          <ul className="space-y-2" role="list">
            {receita.ingredientes.map((ing, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-warm-700">
                <span className="w-1.5 h-1.5 rounded-full bg-sage-400 mt-1.5 shrink-0" aria-hidden="true" />
                {ing}
              </li>
            ))}
          </ul>
        </section>

        {/* Modo de Preparo */}
        <section aria-labelledby="preparo-heading">
          <h4 id="preparo-heading" className="text-sm font-semibold text-sage-700 uppercase tracking-wide mb-3">
            Modo de Preparo
          </h4>
          <ol className="space-y-3" role="list">
            {receita.modoPreparo.map((passo, i) => (
              <li key={i} className="flex gap-3 text-sm text-warm-700">
                <span className="w-6 h-6 rounded-full bg-sage-100 text-sage-700 flex items-center justify-center text-xs font-bold shrink-0">
                  {i + 1}
                </span>
                <span className="pt-0.5">{passo}</span>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  );
}
