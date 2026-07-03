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

      {/* Banner hero */}
      <div className="relative rounded-3xl overflow-hidden mb-8 p-8" style={{background:'linear-gradient(135deg,#0f3d29,#1a8558)'}}>
        <div className="absolute top-0 right-0 w-72 h-72 blob opacity-10" style={{backgroundColor:'#ff7a55'}} aria-hidden="true" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="Logo" className="h-10 w-auto object-contain" style={{filter:'brightness(0) invert(1)', maxWidth:'180px'}} />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">Olá, Adriana! 👋</h1>
            <p className="text-white/70 mt-1 text-sm">Cada paciente é um novo começo. O que vamos fazer hoje?</p>
          </div>
          <Link
            href="/admin/clientes"
            className="inline-flex items-center gap-2 text-white px-5 py-3 rounded-xl font-semibold shadow-lg hover:opacity-90 transition-all min-h-[48px] shrink-0"
            style={{backgroundColor:'#ff7a55'}}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Novo Paciente
          </Link>
        </div>
      </div>

      {/* Ações rápidas */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        {[
          { href:'/admin/clientes',     icon:'➕', label:'Cadastrar Paciente', desc:'Adicionar novo paciente ao sistema', bg:'#f0faf5', border:'#a8e8c8' },
          { href:'/admin/blog',         icon:'✏️', label:'Publicar no Blog',   desc:'Criar novo artigo ou dica',          bg:'#eff6ff', border:'#bfdbfe' },
          { href:'/admin/agendamentos', icon:'📅', label:'Agendamentos',       desc:'Ver consultas pendentes',            bg:'#fffbeb', border:'#fde68a' },
        ].map(a => (
          <Link key={a.href} href={a.href}
            className="group rounded-2xl p-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
            style={{background:a.bg, border:`1px solid ${a.border}`}}>
            <span className="text-2xl mb-3 block">{a.icon}</span>
            <h3 className="font-semibold text-warm-800 mb-1">{a.label}</h3>
            <p className="text-sm text-warm-500">{a.desc}</p>
          </Link>
        ))}
      </div>

      {/* Busca */}
      <div className="mb-5">
        <div className="relative">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-warm-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar paciente por nome ou email..."
            className="w-full pl-12 pr-4 py-3.5 bg-white/80 backdrop-blur-sm border border-cream-200 rounded-xl text-warm-700 placeholder-warm-400 focus-visible:ring-2 focus-visible:ring-sage-400 transition-all"
          />
        </div>
      </div>

      {/* Lista de pacientes */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-cream-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-cream-200 flex items-center justify-between">
          <h2 className="font-semibold text-warm-800">Pacientes</h2>
          <span className="text-xs font-medium px-2.5 py-1 rounded-lg" style={{background:'#f0faf5', color:'#166947'}}>{filtrados.length} encontrados</span>
        </div>

        {filtrados.length === 0 ? (
          <div className="p-16 text-center">
            <span className="text-4xl block mb-3">🔍</span>
            <p className="text-warm-400">Nenhum paciente encontrado.</p>
          </div>
        ) : (
          <div className="divide-y divide-cream-100">
            {filtrados.map((c) => (
              <div key={c.id} className="px-6 py-4 flex items-center justify-between hover:bg-cream-50/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm" style={{background:'linear-gradient(135deg,#3dba82,#166947)'}}>
                    {c.nome.split(' ').map((n: string) => n[0]).slice(0, 2).join('')}
                  </div>
                  <div>
                    <p className="font-medium text-warm-800">{c.nome}</p>
                    <p className="text-sm text-warm-500">{c.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {c.pesoAtual && (
                    <span className="hidden md:inline-block text-xs text-warm-500 bg-cream-100 px-3 py-1 rounded-lg">
                      {c.pesoAtual} kg
                    </span>
                  )}
                  <Link href={`/admin/dietas?clienteId=${c.id}`}
                    className="min-w-[38px] min-h-[38px] flex items-center justify-center rounded-xl text-sage-600 hover:bg-sage-50 transition-colors"
                    title="Prescrever dieta">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
                    </svg>
                  </Link>
                  <Link href={`/admin/relatorio?clienteId=${c.id}`}
                    className="min-w-[38px] min-h-[38px] flex items-center justify-center rounded-xl text-info hover:bg-blue-50 transition-colors"
                    title="Ver relatório">
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

