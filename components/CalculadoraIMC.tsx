'use client';

import { useState } from 'react';
import { IMCResult } from '@/types';

const FAIXAS = [
  { max: 18.5, label: 'Abaixo do peso', cor: '#4a7a9a', bg: 'bg-info/10' },
  { max: 25, label: 'Peso normal', cor: '#4a9a6b', bg: 'bg-success/10' },
  { max: 30, label: 'Sobrepeso', cor: '#c49a3c', bg: 'bg-warning/10' },
  { max: 35, label: 'Obesidade Grau I', cor: '#d97706', bg: 'bg-amber-600/10' },
  { max: 40, label: 'Obesidade Grau II', cor: '#c45a4a', bg: 'bg-danger/10' },
  { max: Infinity, label: 'Obesidade Grau III', cor: '#991b1b', bg: 'bg-red-900/10' },
];

function calcularIMC(peso: number, alturaCm: number): IMCResult {
  const alturaM = alturaCm / 100;
  const valor = +(peso / (alturaM * alturaM)).toFixed(1);
  const faixa = FAIXAS.find(f => valor < f.max) || FAIXAS[FAIXAS.length - 1];
  return { valor, classificacao: faixa.label, cor: faixa.cor };
}

function getProgressPercent(imc: number): number {
  // Escala visual: IMC 15–45 mapeado para 0–100%
  const clamped = Math.max(15, Math.min(45, imc));
  return ((clamped - 15) / 30) * 100;
}

function getGradientPosition(imc: number): string {
  const pct = getProgressPercent(imc);
  return `${pct}%`;
}

export default function CalculadoraIMC() {
  const [peso, setPeso] = useState('');
  const [altura, setAltura] = useState('');
  const [resultado, setResultado] = useState<IMCResult | null>(null);

  function handleCalcular(e: React.FormEvent) {
    e.preventDefault();
    const p = parseFloat(peso);
    const a = parseFloat(altura);
    if (p > 0 && a > 0) setResultado(calcularIMC(p, a));
  }

  return (
    <section
      className="max-w-md mx-auto p-8 bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm border border-cream-200 transition-all duration-300 hover:shadow-md"
      aria-labelledby="imc-heading"
    >
      <h2 id="imc-heading" className="text-2xl font-bold text-warm-800 text-center mb-6">
        Calculadora de IMC
      </h2>

      <form onSubmit={handleCalcular} className="space-y-5" aria-label="Formulário de cálculo de IMC">
        <div>
          <label htmlFor="imc-peso" className="block text-sm font-medium text-warm-600 mb-1.5">
            Peso (kg)
          </label>
          <input
            id="imc-peso"
            type="number"
            step="0.1"
            min="1"
            value={peso}
            onChange={(e) => setPeso(e.target.value)}
            className="w-full border border-cream-300 rounded-xl px-4 py-3 text-warm-800 bg-cream-50 placeholder-warm-400 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-sage-400 focus-visible:border-sage-400"
            placeholder="Ex: 68.5"
            required
            aria-describedby="imc-peso-desc"
          />
          <span id="imc-peso-desc" className="sr-only">Insira seu peso em quilogramas</span>
        </div>

        <div>
          <label htmlFor="imc-altura" className="block text-sm font-medium text-warm-600 mb-1.5">
            Altura (cm)
          </label>
          <input
            id="imc-altura"
            type="number"
            min="1"
            value={altura}
            onChange={(e) => setAltura(e.target.value)}
            className="w-full border border-cream-300 rounded-xl px-4 py-3 text-warm-800 bg-cream-50 placeholder-warm-400 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-sage-400 focus-visible:border-sage-400"
            placeholder="Ex: 170"
            required
            aria-describedby="imc-altura-desc"
          />
          <span id="imc-altura-desc" className="sr-only">Insira sua altura em centímetros</span>
        </div>

        <button
          type="submit"
          className="w-full bg-sage-600 text-white py-3.5 rounded-xl font-semibold text-base transition-all duration-200 hover:bg-sage-700 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-sage-400 focus-visible:ring-offset-2 min-h-[48px]"
        >
          Calcular IMC
        </button>
      </form>

      {/* Resultado com acessibilidade aria-live */}
      <div aria-live="polite" aria-atomic="true" className="mt-6">
        {resultado && (
          <div className="animate-fade-slide-in space-y-4">
            {/* Valor principal */}
            <div className="text-center p-5 rounded-2xl bg-cream-100 border border-cream-200">
              <p className="text-5xl font-bold tracking-tight" style={{ color: resultado.cor }}>
                {resultado.valor}
              </p>
              <p className="text-base font-medium mt-1.5" style={{ color: resultado.cor }}>
                {resultado.classificacao}
              </p>
            </div>

            {/* Barra de escala visual */}
            <div className="space-y-2" role="img" aria-label={`Escala visual: IMC ${resultado.valor}, classificado como ${resultado.classificacao}`}>
              <div className="relative h-3 rounded-full overflow-hidden bg-gradient-to-r from-blue-300 via-green-400 via-yellow-400 via-orange-400 to-red-500">
                {/* Indicador de posição */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-2 shadow-md transition-all duration-500 ease-out"
                  style={{
                    left: getGradientPosition(resultado.valor),
                    borderColor: resultado.cor,
                    transform: `translateX(-50%) translateY(-50%)`,
                  }}
                />
              </div>
              <div className="flex justify-between text-xs text-warm-400 px-1">
                <span>15</span>
                <span>18.5</span>
                <span>25</span>
                <span>30</span>
                <span>35</span>
                <span>40+</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
