'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Link from 'next/link';

interface Progresso { data: string; peso?: number; aguaMl?: number; }
interface Check { data: string; realizada: boolean; }
interface FeedbackItem { data: string; texto: string; }

interface Relatorio {
  cliente: { nome: string; email: string; pesoAtual?: number; altura?: number; objetivo?: string };
  checks: Check[];
  progressos: Progresso[];
  feedbacks: FeedbackItem[];
}

// Medidor circular SVG
function CircularGauge({ value, max, label, unit, color }: { value: number; max: number; label: string; unit: string; color: string }) {
  const pct = Math.min((value / max) * 100, 100);
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-32">
        <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r={radius} fill="none" stroke="currentColor" strokeWidth="8" className="text-cream-200" />
          <circle
            cx="60" cy="60" r={radius} fill="none"
            stroke={color} strokeWidth="8" strokeLinecap="round"
            strokeDasharray={circumference} strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-warm-800">{value}</span>
          <span className="text-xs text-warm-500">{unit}</span>
        </div>
      </div>
      <p className="text-sm font-medium text-warm-600 mt-2">{label}</p>
    </div>
  );
}

// Card de stat
function StatCard({ icon, label, value, subtitle, trend }: { icon: string; label: string; value: string; subtitle?: string; trend?: 'up' | 'down' | 'neutral' }) {
  const trendColors = { up: 'text-success', down: 'text-danger', neutral: 'text-warm-400' };
  const trendIcons = { up: '↑', down: '↓', neutral: '→' };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-cream-200 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xl" aria-hidden="true">{icon}</span>
        {trend && <span className={`text-sm font-bold ${trendColors[trend]}`}>{trendIcons[trend]}</span>}
      </div>
      <p className="text-2xl font-bold text-warm-800">{value}</p>
      <p className="text-sm text-warm-500 mt-0.5">{label}</p>
      {subtitle && <p className="text-xs text-warm-400 mt-1">{subtitle}</p>}
    </div>
  );
}

export default function RelatorioPage() {
  return (
    <Suspense fallback={<div className="max-w-6xl mx-auto p-6 pt-10"><div className="animate-pulse h-10 bg-cream-200 rounded-xl w-1/3" /></div>}>
      <RelatorioContent />
    </Suspense>
  );
}

function RelatorioContent() {
  const params = useSearchParams();
  const clienteId = params.get('clienteId');
  const [data, setData] = useState<Relatorio | null>(null);

  useEffect(() => {
    if (clienteId) {
      fetch(`/api/admin/relatorio?clienteId=${clienteId}`).then(r => r.json()).then(setData);
    }
  }, [clienteId]);

  if (!data) {
    return (
      <main className="max-w-6xl mx-auto p-6 pt-10">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-cream-200 rounded-xl w-1/3" />
          <div className="grid grid-cols-4 gap-4">
            {[1,2,3,4].map(i => <div key={i} className="h-28 bg-cream-200 rounded-2xl" />)}
          </div>
          <div className="h-64 bg-cream-200 rounded-2xl" />
        </div>
      </main>
    );
  }

  const totalChecks = data.checks.length;
  const realizados = data.checks.filter(c => c.realizada).length;
  const aderencia = totalChecks > 0 ? Math.round((realizados / totalChecks) * 100) : 0;

  const dadosPeso = data.progressos.filter(p => p.peso).reverse().map(p => ({ data: p.data.slice(5), peso: p.peso }));
  const dadosAgua = data.progressos.filter(p => p.aguaMl).reverse().map(p => ({ data: p.data.slice(5), agua: p.aguaMl }));

  const mediaAgua = dadosAgua.length > 0 ? Math.round(dadosAgua.reduce((s, d) => s + (d.agua || 0), 0) / dadosAgua.length) : 0;
  const pesoInicial = dadosPeso.length > 0 ? dadosPeso[0].peso || 0 : 0;
  const pesoAtual = dadosPeso.length > 0 ? dadosPeso[dadosPeso.length - 1].peso || 0 : 0;
  const variacaoPeso = pesoAtual - pesoInicial;

  return (
    <main className="max-w-6xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sage-400 to-sage-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
            {data.cliente.nome.split(' ').map(n => n[0]).slice(0, 2).join('')}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-warm-800">{data.cliente.nome}</h1>
            <p className="text-warm-500 text-sm">{data.cliente.email} • Objetivo: {data.cliente.objetivo || 'Não definido'}</p>
          </div>
        </div>
        <Link
          href={`/admin/dietas?clienteId=${clienteId}`}
          className="inline-flex items-center gap-2 bg-sage-600 text-white px-5 py-2.5 rounded-xl font-medium shadow-sm hover:bg-sage-700 transition-all min-h-[44px]"
        >
          Prescrever Dieta
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard icon="📊" label="Aderência" value={`${aderencia}%`} subtitle={`${realizados} de ${totalChecks}`} trend={aderencia >= 70 ? 'up' : 'down'} />
        <StatCard icon="⚖️" label="Peso Atual" value={pesoAtual ? `${pesoAtual} kg` : '--'} subtitle={variacaoPeso !== 0 ? `${variacaoPeso > 0 ? '+' : ''}${variacaoPeso.toFixed(1)} kg` : undefined} trend={variacaoPeso < 0 ? 'up' : variacaoPeso > 0 ? 'down' : 'neutral'} />
        <StatCard icon="💧" label="Água Média" value={mediaAgua ? `${mediaAgua} ml` : '--'} subtitle="Média diária" trend={mediaAgua >= 2000 ? 'up' : 'down'} />
        <StatCard icon="📝" label="Feedbacks" value={data.feedbacks.length.toString()} subtitle="Mensagens enviadas" trend="neutral" />
      </div>

      {/* Medidores Circulares */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-cream-200 shadow-sm mb-8">
        <h2 className="font-semibold text-warm-800 text-lg mb-6">Indicadores de Saúde</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 justify-items-center">
          <CircularGauge value={aderencia} max={100} label="Aderência" unit="%" color="#556f4a" />
          <CircularGauge value={Math.round(mediaAgua / 100)} max={25} label="Hidratação" unit={`${mediaAgua}ml`} color="#4a7a9a" />
          <CircularGauge value={data.feedbacks.length} max={30} label="Engajamento" unit="msgs" color="#c49a3c" />
          <CircularGauge value={dadosPeso.length} max={12} label="Pesagens" unit="registros" color="#5b9a6b" />
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Evolução do Peso */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-cream-200 shadow-sm">
          <h2 className="font-semibold text-warm-800 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-sage-500" />
            Evolução do Peso
          </h2>
          {dadosPeso.length > 1 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={dadosPeso}>
                <defs>
                  <linearGradient id="gradPeso" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#556f4a" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#556f4a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f0e8" />
                <XAxis dataKey="data" fontSize={11} stroke="#9c9588" />
                <YAxis domain={['dataMin - 1', 'dataMax + 1']} fontSize={11} stroke="#9c9588" unit=" kg" />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e8e3d8' }} formatter={(v) => [`${v} kg`, 'Peso']} />
                <Area type="monotone" dataKey="peso" stroke="#556f4a" strokeWidth={2.5} fill="url(#gradPeso)" dot={{ r: 4, fill: '#556f4a' }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-warm-400">
              <p>Dados insuficientes para gráfico</p>
            </div>
          )}
        </div>

        {/* Consumo de Água */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-cream-200 shadow-sm">
          <h2 className="font-semibold text-warm-800 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-info" />
            Consumo de Água
          </h2>
          {dadosAgua.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={dadosAgua}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f0e8" />
                <XAxis dataKey="data" fontSize={11} stroke="#9c9588" />
                <YAxis fontSize={11} stroke="#9c9588" unit=" ml" />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e8e3d8' }} formatter={(v) => [`${v} ml`, 'Água']} />
                <Bar dataKey="agua" fill="#4a7a9a" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-warm-400">
              <p>Nenhum registro de água ainda</p>
            </div>
          )}
        </div>
      </div>

      {/* Aderência semanal */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-cream-200 shadow-sm mb-8">
        <h2 className="font-semibold text-warm-800 mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-gold-400" />
          Barra de Aderência
        </h2>
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <span className="text-sm text-warm-500 w-20">Refeições</span>
            <div className="flex-1 h-4 bg-cream-200 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-sage-400 to-sage-600 transition-all duration-700"
                style={{ width: `${aderencia}%` }}
              />
            </div>
            <span className="text-sm font-bold text-sage-700 w-12 text-right">{aderencia}%</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-warm-500 w-20">Hidratação</span>
            <div className="flex-1 h-4 bg-cream-200 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-300 to-blue-500 transition-all duration-700"
                style={{ width: `${Math.min((mediaAgua / 2500) * 100, 100)}%` }}
              />
            </div>
            <span className="text-sm font-bold text-info w-12 text-right">{Math.round(Math.min((mediaAgua / 2500) * 100, 100))}%</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-warm-500 w-20">Engajamento</span>
            <div className="flex-1 h-4 bg-cream-200 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-300 to-amber-500 transition-all duration-700"
                style={{ width: `${Math.min((data.feedbacks.length / 20) * 100, 100)}%` }}
              />
            </div>
            <span className="text-sm font-bold text-gold-600 w-12 text-right">{Math.min(Math.round((data.feedbacks.length / 20) * 100), 100)}%</span>
          </div>
        </div>
      </div>

      {/* Feedbacks */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-cream-200 shadow-sm">
        <h2 className="font-semibold text-warm-800 mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-warm-400" />
          Últimos Comentários
        </h2>
        {data.feedbacks.length > 0 ? (
          <div className="space-y-4 max-h-[400px] overflow-y-auto">
            {data.feedbacks.map((f, i) => (
              <div key={i} className="flex gap-3 animate-fade-slide-in" style={{ animationDelay: `${i * 0.05}s` }}>
                <div className="w-8 h-8 rounded-full bg-cream-200 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs">📝</span>
                </div>
                <div className="flex-1 bg-cream-50 rounded-xl p-3.5 border border-cream-100">
                  <p className="text-sm text-warm-700">{f.texto}</p>
                  <p className="text-xs text-warm-400 mt-2">{f.data}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-warm-400 py-8 text-center">Nenhum feedback enviado pelo paciente.</p>
        )}
      </div>
    </main>
  );
}
