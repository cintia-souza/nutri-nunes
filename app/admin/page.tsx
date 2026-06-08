'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface ClienteResumo {
  id: string;
  nome: string;
  email: string;
  pesoAtual?: number;
  telefone?: string;
}

export default function AdminDashboard() {
  const [clientes, setClientes] = useState<ClienteResumo[]>([]);
  const [busca, setBusca] = useState('');

  useEffect(() => {
    fetch('/api/admin/clientes').then(r => r.json()).then(setClientes);
  }, []);

  const filtrados = clientes.filter(c =>
    c.nome.toLowerCase().includes(busca.toLowerCase()) ||
    c.email.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <main className="max-w-6xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-warm-800">Painel da Nutricionista</h1>
          <p className="text-warm-500 mt-1">Bom dia, Adriana! Aqui está o resumo dos seus pacientes.</p>
        </div>
        <Link
          href="/admin/clientes"
          className="inline-flex items-center gap-2 bg-sage-600 text-white px-5 py-3 rounded-xl font-medium shadow-sm hover:bg-sage-700 hover:shadow-md transition-all duration-200 min-h-[48px]"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Novo Paciente
        </Link>
      </div>

      {/* Métricas rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <MetricCard icon="👥" label="Pacientes Ativos" valor={clientes.length.toString()} cor="sage" />
        <MetricCard icon="📋" label="Dietas Ativas" valor={clientes.length.toString()} cor="sage" />
        <MetricCard icon="📅" label="Consultas Hoje" valor="3" cor="info" />
        <MetricCard icon="⭐" label="Satisfação" valor="98%" cor="gold" />
      </div>

      {/* Ações rápidas */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <Link href="/admin/clientes" className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-cream-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
          <div className="w-12 h-12 rounded-xl bg-sage-100 flex items-center justify-center mb-3 group-hover:bg-sage-200 transition-colors">
            <span className="text-xl">➕</span>
          </div>
          <h3 className="font-semibold text-warm-800 mb-1">Cadastrar Paciente</h3>
          <p className="text-sm text-warm-500">Adicionar novo paciente ao sistema</p>
        </Link>
        <Link href="/admin/blog" className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-cream-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-3 group-hover:bg-blue-100 transition-colors">
            <span className="text-xl">✏️</span>
          </div>
          <h3 className="font-semibold text-warm-800 mb-1">Publicar no Blog</h3>
          <p className="text-sm text-warm-500">Criar novo artigo ou dica</p>
        </Link>
        <Link href="/api/agendamento" className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-cream-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center mb-3 group-hover:bg-amber-100 transition-colors">
            <span className="text-xl">📅</span>
          </div>
          <h3 className="font-semibold text-warm-800 mb-1">Agendamentos</h3>
          <p className="text-sm text-warm-500">Ver consultas pendentes</p>
        </Link>
      </div>

      {/* Busca */}
      <div className="mb-6">
        <div className="relative">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-warm-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar paciente por nome ou email..."
            className="w-full pl-12 pr-4 py-3.5 bg-white/80 backdrop-blur-sm border border-cream-200 rounded-xl text-warm-700 placeholder-warm-400 focus-visible:ring-2 focus-visible:ring-sage-400 focus-visible:border-sage-400 transition-all"
          />
        </div>
      </div>

      {/* Lista de pacientes */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-cream-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-cream-200">
          <h2 className="font-semibold text-warm-800">Pacientes ({filtrados.length})</h2>
        </div>

        {filtrados.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-warm-400 text-lg">Nenhum paciente encontrado.</p>
          </div>
        ) : (
          <div className="divide-y divide-cream-100">
            {filtrados.map((c) => (
              <div key={c.id} className="px-6 py-4 flex items-center justify-between hover:bg-cream-50/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-sage-400 to-sage-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                    {c.nome.split(' ').map(n => n[0]).slice(0, 2).join('')}
                  </div>
                  <div>
                    <p className="font-medium text-warm-800">{c.nome}</p>
                    <p className="text-sm text-warm-500">{c.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {c.pesoAtual && (
                    <span className="hidden md:inline-block text-sm text-warm-500 bg-cream-100 px-3 py-1 rounded-lg">
                      {c.pesoAtual} kg
                    </span>
                  )}
                  <Link
                    href={`/admin/dietas?clienteId=${c.id}`}
                    className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl text-sage-600 hover:bg-sage-50 transition-colors"
                    title="Prescrever dieta"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
                    </svg>
                  </Link>
                  <Link
                    href={`/admin/relatorio?clienteId=${c.id}`}
                    className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl text-info hover:bg-blue-50 transition-colors"
                    title="Ver relatório"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function MetricCard({ icon, label, valor, cor }: { icon: string; label: string; valor: string; cor: string }) {
  const bgMap: Record<string, string> = {
    sage: 'bg-sage-50 border-sage-100',
    info: 'bg-blue-50 border-blue-100',
    gold: 'bg-amber-50 border-amber-100',
  };
  const textMap: Record<string, string> = { sage: 'text-sage-700', info: 'text-info', gold: 'text-gold-600' };

  return (
    <div className={`rounded-2xl p-5 border ${bgMap[cor]} transition-all hover:shadow-sm`}>
      <span className="text-2xl" aria-hidden="true">{icon}</span>
      <p className={`text-2xl font-bold mt-2 ${textMap[cor]}`}>{valor}</p>
      <p className="text-sm text-warm-500 mt-0.5">{label}</p>
    </div>
  );
}
