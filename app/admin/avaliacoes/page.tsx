'use client';

import { useEffect, useState } from 'react';

interface Avaliacao {
  id: string;
  nota: number;
  texto: string;
  aprovada: boolean;
  criadoEm: string;
  cliente: { nome: string; email: string };
}

export default function AvaliacoesAdminPage() {
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);

  useEffect(() => { carregar(); }, []);

  async function carregar() {
    const res = await fetch('/api/admin/avaliacoes');
    if (res.ok) setAvaliacoes(await res.json());
  }

  async function toggleAprovacao(id: string, aprovada: boolean) {
    await fetch('/api/admin/avaliacoes', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, aprovada }) });
    carregar();
  }

  async function handleDelete(id: string) {
    if (!confirm('Excluir esta avaliação?')) return;
    await fetch('/api/admin/avaliacoes', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    carregar();
  }

  const aprovadas = avaliacoes.filter(a => a.aprovada).length;

  return (
    <main className="max-w-4xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-warm-800">Avaliações dos Pacientes</h1>
        <p className="text-warm-500 mt-1">{avaliacoes.length} avaliações • {aprovadas} aprovadas (visíveis no site)</p>
      </div>

      {avaliacoes.length === 0 ? (
        <div className="bg-white/80 rounded-2xl border border-cream-200 p-12 text-center">
          <span className="text-4xl block mb-4">⭐</span>
          <p className="text-warm-400">Nenhuma avaliação recebida ainda.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {avaliacoes.map(a => (
            <div key={a.id} className={`bg-white/80 backdrop-blur-sm rounded-2xl border shadow-sm p-5 transition-all ${a.aprovada ? 'border-sage-200' : 'border-cream-200'}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sage-400 to-sage-600 flex items-center justify-center text-white text-xs font-bold">
                    {a.cliente.nome.split(' ').map(n => n[0]).slice(0, 2).join('')}
                  </div>
                  <div>
                    <p className="font-medium text-warm-800">{a.cliente.nome}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-gold-400 text-sm">{'★'.repeat(a.nota)}{'☆'.repeat(5 - a.nota)}</span>
                      <span className="text-xs text-warm-400">{new Date(a.criadoEm).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-lg ${a.aprovada ? 'bg-sage-50 text-sage-700' : 'bg-amber-50 text-amber-700'}`}>
                  {a.aprovada ? '✓ No site' : '⏳ Pendente'}
                </span>
              </div>

              <p className="text-warm-700 text-sm leading-relaxed italic mb-4">&ldquo;{a.texto}&rdquo;</p>

              <div className="flex gap-2 pt-3 border-t border-cream-100">
                {a.aprovada ? (
                  <button onClick={() => toggleAprovacao(a.id, false)} className="text-sm text-amber-600 px-3 py-1.5 rounded-lg hover:bg-amber-50 font-medium">Ocultar do site</button>
                ) : (
                  <button onClick={() => toggleAprovacao(a.id, true)} className="text-sm text-sage-600 px-3 py-1.5 rounded-lg hover:bg-sage-50 font-medium">✓ Aprovar e publicar</button>
                )}
                <button onClick={() => handleDelete(a.id)} className="text-sm text-warm-400 px-3 py-1.5 rounded-lg hover:bg-red-50 hover:text-danger">Excluir</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
