'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NovoClientePage() {
  const [form, setForm] = useState({ nome: '', email: '', senha: '', telefone: '' });
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro('');
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setSucesso(true);
      setTimeout(() => router.push('/admin'), 1500);
    } else {
      const data = await res.json();
      setErro(data.error || 'Erro ao criar cliente');
    }
  }

  return (
    <main className="max-w-lg mx-auto px-6 py-8">
      <Link href="/admin" className="text-sage-600 text-sm font-medium hover:text-sage-700 inline-flex items-center gap-1 mb-6">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Voltar
      </Link>

      <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-cream-200 shadow-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-sage-100 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">👤</span>
          </div>
          <h1 className="text-2xl font-bold text-warm-800">Novo Paciente</h1>
          <p className="text-warm-500 text-sm mt-1">Cadastre um novo paciente no sistema</p>
        </div>

        <div role="alert" aria-live="polite">
          {sucesso && (
            <div className="bg-sage-50 border border-sage-200 text-sage-700 p-4 rounded-xl mb-6 text-sm font-medium text-center animate-fade-slide-in">
              ✓ Paciente cadastrado com sucesso!
            </div>
          )}
          {erro && (
            <div className="bg-red-50 border border-red-200 text-danger p-4 rounded-xl mb-6 text-sm text-center animate-fade-slide-in">
              {erro}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="cli-nome" className="block text-sm font-medium text-warm-600 mb-1.5">Nome completo</label>
            <input
              id="cli-nome"
              placeholder="Maria da Silva"
              value={form.nome}
              onChange={(e) => setForm(f => ({ ...f, nome: e.target.value }))}
              className="w-full border border-cream-300 rounded-xl px-4 py-3.5 bg-cream-50 text-warm-800 placeholder-warm-400 focus-visible:ring-2 focus-visible:ring-sage-400 transition-all"
              required
            />
          </div>
          <div>
            <label htmlFor="cli-email" className="block text-sm font-medium text-warm-600 mb-1.5">Email</label>
            <input
              id="cli-email"
              type="email"
              placeholder="paciente@email.com"
              value={form.email}
              onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
              className="w-full border border-cream-300 rounded-xl px-4 py-3.5 bg-cream-50 text-warm-800 placeholder-warm-400 focus-visible:ring-2 focus-visible:ring-sage-400 transition-all"
              required
            />
          </div>
          <div>
            <label htmlFor="cli-senha" className="block text-sm font-medium text-warm-600 mb-1.5">Senha inicial</label>
            <input
              id="cli-senha"
              type="password"
              placeholder="••••••••"
              value={form.senha}
              onChange={(e) => setForm(f => ({ ...f, senha: e.target.value }))}
              className="w-full border border-cream-300 rounded-xl px-4 py-3.5 bg-cream-50 text-warm-800 placeholder-warm-400 focus-visible:ring-2 focus-visible:ring-sage-400 transition-all"
              required
            />
          </div>
          <div>
            <label htmlFor="cli-tel" className="block text-sm font-medium text-warm-600 mb-1.5">Telefone</label>
            <input
              id="cli-tel"
              type="tel"
              placeholder="(11) 99999-9999"
              value={form.telefone}
              onChange={(e) => setForm(f => ({ ...f, telefone: e.target.value }))}
              className="w-full border border-cream-300 rounded-xl px-4 py-3.5 bg-cream-50 text-warm-800 placeholder-warm-400 focus-visible:ring-2 focus-visible:ring-sage-400 transition-all"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-sage-600 text-white py-3.5 rounded-xl font-semibold hover:bg-sage-700 active:scale-[0.98] transition-all shadow-sm min-h-[52px]"
          >
            Cadastrar Paciente
          </button>
        </form>
      </div>
    </main>
  );
}
