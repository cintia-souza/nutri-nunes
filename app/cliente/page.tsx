'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, BarChart3, CalendarDays, TrendingUp, Check, X, Minus } from 'lucide-react';
import TelemetriaAviso from '@/components/TelemetriaAviso';
import { hojeLocal } from '@/lib/datas';

interface FormularioPendente { id: string; titulo: string; }
interface HabitoResumo {
  data: string;
  acFrutas: boolean | null; acVerduras: boolean | null; acLegumes: boolean | null;
  acProteinas: boolean | null; acCereais: boolean | null; acAgua: boolean | null;
  refrigerante: boolean | null; doces: boolean | null; fastFood: boolean | null;
  ultraprocessados: boolean | null; beliscos: boolean | null;
}

const GRUPOS = [
  { key: 'acFrutas', emoji: '🍎' },
  { key: 'acVerduras', emoji: '🥬' },
  { key: 'acLegumes', emoji: '🥕' },
  { key: 'acProteinas', emoji: '🥩' },
  { key: 'acCereais', emoji: '🌾' },
  { key: 'acAgua', emoji: '💧' },
];

const INADEQUADOS = [
  { key: 'refrigerante', emoji: '🥤' },
  { key: 'doces', emoji: '🍬' },
  { key: 'fastFood', emoji: '🍔' },
  { key: 'ultraprocessados', emoji: '📦' },
  { key: 'beliscos', emoji: '🍪' },
];

export default function ClienteDashboard() {
  const [formulariosPendentes, setFormulariosPendentes] = useState<FormularioPendente[]>([]);
  const [habitos, setHabitos] = useState<HabitoResumo[]>([]);
  const [feedback, setFeedback] = useState('');
  const [feedbackEnviado, setFeedbackEnviado] = useState(false);

  useEffect(() => {
    fetch('/api/cliente/formularios').then(r => r.ok ? r.json() : []).then((data: { id: string; titulo: string; respondido: boolean }[]) => {
      setFormulariosPendentes(data.filter(f => !f.respondido));
    });
    fetch('/api/cliente/habitos').then(r => r.ok ? r.json() : { habitos: [] }).then(res => {
      setHabitos(res.habitos || []);
    });
  }, []);

  async function enviarFeedback() {
    if (!feedback.trim()) return;
    await fetch('/api/cliente/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texto: feedback, data: hojeLocal() }),
    });
    setFeedback('');
    setFeedbackEnviado(true);
    setTimeout(() => setFeedbackEnviado(false), 3000);
  }

  // Resumo últimos 7 dias
  const ultimos7 = habitos.slice(0, 7);
  const gruposAceitos = GRUPOS.map(g => ({
    ...g,
    count: ultimos7.filter(h => (h as unknown as Record<string, boolean | null>)[g.key] === true).length,
  }));
  const inadequadosCometidos = INADEQUADOS.map(i => ({
    ...i,
    count: ultimos7.filter(h => (h as unknown as Record<string, boolean | null>)[i.key] === true).length,
  }));

  return (
    <main className="max-w-3xl mx-auto px-4 pb-8 pt-6 md:px-6">
      {/* Header */}
      <div className="mb-6">
        <p className="text-warm-500 text-sm">
          {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
        <h1 className="text-2xl md:text-3xl font-bold text-warm-800 mt-1">Olá! 👋</h1>
      </div>

      {/* Telemetria semanal */}
      <TelemetriaAviso />

      {/* Formulários pendentes */}
      {formulariosPendentes.length > 0 && (
        <div className="mb-6 space-y-2">
          {formulariosPendentes.map(f => (
            <Link key={f.id} href={`/cliente/formulario/${f.id}`}
              className="flex items-center gap-3 p-4 rounded-2xl border border-indigo-200 bg-indigo-50/80 hover:bg-indigo-100/80 transition-all">
              <span className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-base" style={{ background: '#6366f120' }}>📋</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-indigo-800">Questionário pendente</p>
                <p className="text-xs text-indigo-500 truncate">{f.titulo}</p>
              </div>
              <span className="text-xs font-bold text-white px-2 py-1 rounded-full" style={{ background: '#6366f1' }}>Responder</span>
            </Link>
          ))}
        </div>
      )}

      {/* Atalhos rápidos */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Link href="/cliente/dieta" className="flex items-center gap-3 p-4 rounded-2xl border border-cream-200 bg-white/80 hover:shadow-md transition-all">
          <span className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#1a855815' }}>
            <BookOpen className="w-5 h-5" style={{ color: '#1a8558' }} />
          </span>
          <div>
            <p className="text-sm font-semibold text-warm-800">Minha Dieta</p>
            <p className="text-xs text-warm-400">Refeições do dia</p>
          </div>
        </Link>
        <Link href="/cliente/habitos" className="flex items-center gap-3 p-4 rounded-2xl border border-cream-200 bg-white/80 hover:shadow-md transition-all">
          <span className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#6366f115' }}>
            <BarChart3 className="w-5 h-5" style={{ color: '#6366f1' }} />
          </span>
          <div>
            <p className="text-sm font-semibold text-warm-800">Meus Hábitos</p>
            <p className="text-xs text-warm-400">Registrar o dia</p>
          </div>
        </Link>
        <Link href="/cliente/progresso" className="flex items-center gap-3 p-4 rounded-2xl border border-cream-200 bg-white/80 hover:shadow-md transition-all">
          <span className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#0891b215' }}>
            <TrendingUp className="w-5 h-5" style={{ color: '#0891b2' }} />
          </span>
          <div>
            <p className="text-sm font-semibold text-warm-800">Progresso</p>
            <p className="text-xs text-warm-400">Peso e evolução</p>
          </div>
        </Link>
        <Link href="/cliente/agendamento" className="flex items-center gap-3 p-4 rounded-2xl border border-cream-200 bg-white/80 hover:shadow-md transition-all">
          <span className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#d9770615' }}>
            <CalendarDays className="w-5 h-5" style={{ color: '#d97706' }} />
          </span>
          <div>
            <p className="text-sm font-semibold text-warm-800">Agendar</p>
            <p className="text-xs text-warm-400">Próxima consulta</p>
          </div>
        </Link>
      </div>

      {/* Resumo de hábitos - últimos 7 dias */}
      {ultimos7.length > 0 && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-cream-200 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-warm-700">Resumo da Semana</h2>
            <Link href="/cliente/habitos" className="text-xs font-medium" style={{ color: '#1a8558' }}>Ver tudo →</Link>
          </div>

          {/* Grupos alimentares aceitos */}
          <p className="text-xs text-warm-500 mb-2">Grupos alimentares aceitos</p>
          <div className="grid grid-cols-6 gap-2 mb-4">
            {gruposAceitos.map(g => (
              <div key={g.key} className="text-center">
                <span className="text-lg">{g.emoji}</span>
                <p className="text-xs font-bold mt-0.5" style={{ color: g.count >= 5 ? '#1a8558' : g.count >= 3 ? '#b45309' : '#dc2626' }}>
                  {g.count}/7
                </p>
              </div>
            ))}
          </div>

          {/* Hábitos inadequados */}
          <p className="text-xs text-warm-500 mb-2">Hábitos inadequados cometidos</p>
          <div className="grid grid-cols-5 gap-2">
            {inadequadosCometidos.map(i => (
              <div key={i.key} className="text-center">
                <span className="text-lg">{i.emoji}</span>
                <p className="text-xs font-bold mt-0.5" style={{ color: i.count <= 1 ? '#1a8558' : i.count <= 3 ? '#b45309' : '#dc2626' }}>
                  {i.count}/7
                </p>
              </div>
            ))}
          </div>

          {/* Último registro */}
          {ultimos7[0] && (
            <div className="mt-4 pt-3 border-t border-cream-200">
              <p className="text-xs text-warm-400 mb-2">Hoje</p>
              <div className="flex gap-1.5">
                {GRUPOS.map(g => {
                  const val = (ultimos7[0] as unknown as Record<string, boolean | null>)[g.key];
                  return (
                    <span key={g.key} className="w-6 h-6 rounded-md flex items-center justify-center text-xs" style={{
                      background: val === true ? '#dcfce7' : val === false ? '#fee2e2' : '#f5f0eb',
                    }}>
                      {val === true && <Check className="w-3.5 h-3.5 text-green-600" />}
                      {val === false && <X className="w-3.5 h-3.5 text-red-500" />}
                      {val === null && <Minus className="w-3.5 h-3.5 text-warm-300" />}
                    </span>
                  );
                })}
                <span className="w-px bg-cream-200 mx-1" />
                {INADEQUADOS.map(i => {
                  const val = (ultimos7[0] as unknown as Record<string, boolean | null>)[i.key];
                  return (
                    <span key={i.key} className="w-6 h-6 rounded-md flex items-center justify-center text-xs" style={{
                      background: val === true ? '#fee2e2' : val === false ? '#dcfce7' : '#f5f0eb',
                    }}>
                      {val === true && <Check className="w-3.5 h-3.5 text-red-500" />}
                      {val === false && <X className="w-3.5 h-3.5 text-green-600" />}
                      {val === null && <Minus className="w-3.5 h-3.5 text-warm-300" />}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Feedback */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-cream-200 shadow-sm">
        <h2 className="font-semibold text-warm-800 mb-3 flex items-center gap-2">
          <span className="text-lg">📝</span> Como foi seu dia?
        </h2>
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          className="w-full border border-cream-200 rounded-xl p-4 h-24 text-sm text-warm-700 bg-cream-50 placeholder-warm-400 resize-none focus-visible:ring-2 focus-visible:ring-sage-400"
          placeholder="Conte como se sentiu, dificuldades, conquistas..."
        />
        <div className="flex items-center justify-between mt-3">
          <div>
            {feedbackEnviado && (
              <span className="text-sm text-sage-600 font-medium animate-fade-slide-in">✓ Enviado!</span>
            )}
          </div>
          <button onClick={enviarFeedback} disabled={!feedback.trim()}
            className="bg-sage-600 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-all hover:bg-sage-700 active:scale-[0.97] disabled:opacity-40 min-h-[44px]">
            Enviar
          </button>
        </div>
      </div>
    </main>
  );
}
