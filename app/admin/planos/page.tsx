'use client';

import { useEffect, useState } from 'react';

interface Plano {
  id: string;
  nome: string;
  preco: string;
  periodo: string;
  destaque: boolean;
  itens: string[];
  ordem: number;
}

export default function PlanosAdminPage() {
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [editando, setEditando] = useState<Plano | null>(null);
  const [formAberto, setFormAberto] = useState(false);
  const [form, setForm] = useState({ nome: '', preco: '', periodo: '', destaque: false, itens: [''], ordem: 0 });

  useEffect(() => { carregar(); }, []);

  async function carregar() {
    const res = await fetch('/api/admin/planos');
    setPlanos(await res.json());
  }

  function resetForm() { setForm({ nome: '', preco: '', periodo: '', destaque: false, itens: [''], ordem: 0 }); setEditando(null); setFormAberto(false); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const method = editando ? 'PUT' : 'POST';
    const payload = { ...(editando && { id: editando.id }), ...form, itens: form.itens.filter(i => i.trim()), ativo: true };
    await fetch('/api/admin/planos', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    resetForm();
    carregar();
  }

  async function handleDelete(id: string) {
    if (!confirm('Excluir este plano?')) return;
    await fetch('/api/admin/planos', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    carregar();
  }

  return (
    <main className="max-w-4xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-warm-800">Planos & Valores</h1>
          <p className="text-warm-500 mt-1">Gerencie os planos exibidos na landing page.</p>
        </div>
        <button onClick={() => { resetForm(); setFormAberto(true); }} className="bg-sage-600 text-white px-5 py-3 rounded-xl font-medium hover:bg-sage-700 transition-all min-h-[48px]">
          + Novo Plano
        </button>
      </div>

      {formAberto && (
        <form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur-sm rounded-2xl border border-cream-200 shadow-sm p-6 mb-8 space-y-4 animate-fade-slide-in">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-warm-800">{editando ? 'Editar Plano' : 'Novo Plano'}</h2>
            <button type="button" onClick={resetForm} className="text-warm-400 hover:text-warm-600">✕</button>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-warm-600 mb-1">Nome</label>
              <input value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} placeholder="Ex: Mensal" className="w-full border border-cream-300 rounded-xl px-4 py-3 bg-cream-50 focus-visible:ring-2 focus-visible:ring-sage-400" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-warm-600 mb-1">Preço</label>
              <input value={form.preco} onChange={e => setForm(f => ({ ...f, preco: e.target.value }))} placeholder="R$ 450" className="w-full border border-cream-300 rounded-xl px-4 py-3 bg-cream-50 focus-visible:ring-2 focus-visible:ring-sage-400" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-warm-600 mb-1">Período</label>
              <input value={form.periodo} onChange={e => setForm(f => ({ ...f, periodo: e.target.value }))} placeholder="/mês" className="w-full border border-cream-300 rounded-xl px-4 py-3 bg-cream-50 focus-visible:ring-2 focus-visible:ring-sage-400" required />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.destaque} onChange={e => setForm(f => ({ ...f, destaque: e.target.checked }))} className="w-4 h-4 rounded border-cream-300 text-sage-600 focus:ring-sage-400" />
              <span className="text-sm text-warm-700">Plano destaque (mais popular)</span>
            </label>
            <div className="flex items-center gap-2">
              <label className="text-sm text-warm-600">Ordem:</label>
              <input type="number" value={form.ordem} onChange={e => setForm(f => ({ ...f, ordem: +e.target.value }))} className="w-16 border border-cream-300 rounded-lg px-2 py-1 text-sm bg-cream-50" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-warm-600">Itens inclusos</label>
              <button type="button" onClick={() => setForm(f => ({ ...f, itens: [...f.itens, ''] }))} className="text-sage-600 text-sm font-medium">+ Adicionar</button>
            </div>
            <div className="space-y-2">
              {form.itens.map((item, i) => (
                <div key={i} className="flex gap-2 items-center group">
                  <svg className="w-4 h-4 text-sage-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  <input value={item} onChange={e => { const u = [...form.itens]; u[i] = e.target.value; setForm(f => ({ ...f, itens: u })); }} placeholder="Ex: Consultas ilimitadas" className="flex-1 border border-cream-200 rounded-xl px-3 py-2 text-sm bg-cream-50 focus-visible:ring-2 focus-visible:ring-sage-400" />
                  {form.itens.length > 1 && (
                    <button type="button" onClick={() => setForm(f => ({ ...f, itens: f.itens.filter((_, j) => j !== i) }))} className="opacity-0 group-hover:opacity-100 text-warm-300 hover:text-danger">✕</button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={resetForm} className="px-5 py-2.5 rounded-xl border border-cream-300 text-warm-600 hover:bg-cream-50">Cancelar</button>
            <button type="submit" className="flex-1 bg-sage-600 text-white py-2.5 rounded-xl font-medium hover:bg-sage-700">{editando ? 'Salvar' : 'Criar Plano'}</button>
          </div>
        </form>
      )}

      {planos.length === 0 ? (
        <div className="bg-white/80 rounded-2xl border border-cream-200 p-12 text-center"><p className="text-warm-400">Nenhum plano cadastrado. Os padrões serão exibidos.</p></div>
      ) : (
        <div className="grid md:grid-cols-3 gap-4">
          {planos.map(p => (
            <div key={p.id} className={`rounded-2xl p-5 border transition-all ${p.destaque ? 'bg-sage-50 border-sage-300 shadow-md' : 'bg-white/80 border-cream-200 shadow-sm'}`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-warm-800">{p.nome}</h3>
                {p.destaque && <span className="text-xs bg-sage-200 text-sage-700 px-2 py-0.5 rounded-lg">⭐ Destaque</span>}
              </div>
              <p className="text-2xl font-bold text-sage-700">{p.preco}<span className="text-sm font-normal text-warm-400 ml-1">{p.periodo}</span></p>
              <ul className="mt-3 space-y-1 text-sm text-warm-600">
                {p.itens.map((item, i) => <li key={i} className="flex items-center gap-1.5"><span className="text-sage-500">✓</span>{item}</li>)}
              </ul>
              <div className="flex gap-2 mt-4 pt-3 border-t border-cream-100">
                <button onClick={() => { setEditando(p); setForm({ nome: p.nome, preco: p.preco, periodo: p.periodo, destaque: p.destaque, itens: p.itens.length > 0 ? p.itens : [''], ordem: p.ordem }); setFormAberto(true); }} className="text-sage-600 text-sm px-3 py-1.5 rounded-lg hover:bg-sage-50">✏️ Editar</button>
                <button onClick={() => handleDelete(p.id)} className="text-warm-400 text-sm px-3 py-1.5 rounded-lg hover:bg-red-50 hover:text-danger">🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
