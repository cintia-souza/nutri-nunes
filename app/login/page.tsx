'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro('');
    setLoading(true);

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha }),
    });

    setLoading(false);

    if (res.ok) {
      const { role } = await res.json();
      router.push(role === 'ADMIN' ? '/admin' : '/cliente');
    } else {
      setErro('Email ou senha inválidos');
    }
  }

  return (
    <main className="min-h-[calc(100vh-60px)] flex items-center justify-center p-6 bg-cream-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white/80 backdrop-blur-sm p-8 md:p-10 rounded-3xl border border-cream-200 shadow-sm w-full max-w-sm space-y-5"
        aria-labelledby="login-heading"
      >
        <div className="text-center mb-2">
          <h1 id="login-heading" className="text-2xl font-bold text-warm-800">Entrar</h1>
          <p className="text-sm text-warm-500 mt-1">Acesse seu portal de nutrição</p>
        </div>

        <div role="alert" aria-live="polite">
          {erro && (
            <p className="text-sm text-danger bg-red-50 border border-red-100 rounded-xl p-3 text-center animate-fade-slide-in">
              {erro}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="login-email" className="block text-sm font-medium text-warm-600 mb-1.5">Email</label>
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-cream-300 rounded-xl px-4 py-3 text-warm-800 bg-cream-50 placeholder-warm-400 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-sage-400 focus-visible:border-sage-400"
            placeholder="seu@email.com"
            required
            autoComplete="email"
          />
        </div>

        <div>
          <label htmlFor="login-senha" className="block text-sm font-medium text-warm-600 mb-1.5">Senha</label>
          <input
            id="login-senha"
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="w-full border border-cream-300 rounded-xl px-4 py-3 text-warm-800 bg-cream-50 placeholder-warm-400 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-sage-400 focus-visible:border-sage-400"
            placeholder="••••••••"
            required
            autoComplete="current-password"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-sage-600 text-white py-3.5 rounded-xl font-semibold text-base transition-all duration-200 hover:bg-sage-700 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px] focus-visible:ring-2 focus-visible:ring-sage-400 focus-visible:ring-offset-2"
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </main>
  );
}
