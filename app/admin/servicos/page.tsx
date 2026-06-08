'use client';

import { useEffect, useState } from 'react';

interface Servico {
  id: string;
  titulo: string;
  descricao: string;
  icone: string;
  imagemUrl: string;
  ordem: number;
  ativo: boolean;
}

const ICONES = ['🔬', '🥗', '📱', '💪', '🌱', '🩺', '🧠', '❤️', '🍎', '⚡'];

export default function ServicosAdminPage() {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [editando, setEditando] = useState<Servico | null>(null);
  const [formAberto, setFormAberto] = useState(false);
  const [form, setForm] = useState({ titulo: '', descricao: '', icone: '🥗', imagemUrl: '', ordem: 0 });

  useEffect(() => { carregar(); }, []);

  async function carregar() {
    const res = await fetch('/api/admin/servicos');
    setServicos(await res.json());
  }

  function resetForm() { setForm({ titulo: '', descricao: '', icone: '🥗', imagemUrl: '', ordem: 0 }); setEditando(null); setFormAberto(false); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const method = editando ? 'PUT' : 'POST';
    const body = editando ? { id: editando.id, ...form, ativo: true } : { ...form, ativo: true };
    await fetch('/api/admin/servicos', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    resetForm();
    carregar();
  }

  async function handleDelete(id: string) {
    if (!confirm('Excluir este serviço?')) return;
    await fetch('/api/admin/servicos', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    carregar();
  }

  return (
    <main className="max-w-4xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-warm-800">Serviços</h1>
          <p className="text-warm-500 mt-1">Gerencie os serviços exibidos na landing page.</p>
        </div>
        <button onClick={() => { resetForm(); setFormAberto(true); }} className="bg-sage-600 text-white px-5 py-3 rounded-xl font-medium hover:bg-sage-700 transition-all min-h-[48px]">
          + Novo Serviço
        </button>
      </div>

      {formAberto && (
        <form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur-sm rounded-2xl border border-cream-200 shadow-sm p-6 mb-8 space-y-4 animate-fade-slide-in">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-warm-800">{editando ? 'Editar Serviço' : 'Novo Serviço'}</h2>
            <button type="button" onClick={resetForm} className="text-warm-400 hover:text-warm-600">✕</button>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-warm-600 mb-1">Título</label>
              <input value={form.titulo} onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))} placeholder="Ex: Consulta Nutricional" className="w-full border border-cream-300 rounded-xl px-4 py-3 bg-cream-50 focus-visible:ring-2 focus-visible:ring-sage-400" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-warm-600 mb-1">Ordem</label>
              <input type="number" value={form.ordem} onChange={e => setForm(f => ({ ...f, ordem: +e.target.value }))} className="w-full border border-cream-300 rounded-xl px-4 py-3 bg-cream-50 focus-visible:ring-2 focus-visible:ring-sage-400" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-warm-600 mb-1">Descrição</label>
            <textarea value={form.descricao} onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))} placeholder="Breve descrição do serviço..." className="w-full border border-cream-300 rounded-xl px-4 py-3 bg-cream-50 h-20 resize-none focus-visible:ring-2 focus-visible:ring-sage-400" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-warm-600 mb-1">Ícone</label>
            <div className="flex gap-2 flex-wrap">
              {ICONES.map(ic => (
                <button key={ic} type="button" onClick={() => setForm(f => ({ ...f, icone: ic }))} className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl border transition-all ${form.icone === ic ? 'border-sage-500 bg-sage-50 scale-110' : 'border-cream-200 hover:border-sage-300'}`}>{ic}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-warm-600 mb-1">URL da Imagem</label>
            <input value={form.imagemUrl} onChange={e => setForm(f => ({ ...f, imagemUrl: e.target.value }))} placeholder="https://images.unsplash.com/..." className="w-full border border-cream-300 rounded-xl px-4 py-3 bg-cream-50 focus-visible:ring-2 focus-visible:ring-sage-400" />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={resetForm} className="px-5 py-2.5 rounded-xl border border-cream-300 text-warm-600 hover:bg-cream-50">Cancelar</button>
            <button type="submit" className="flex-1 bg-sage-600 text-white py-2.5 rounded-xl font-medium hover:bg-sage-700">{editando ? 'Salvar' : 'Criar Serviço'}</button>
          </div>
        </form>
      )}

      {servicos.length === 0 ? (
        <div className="bg-white/80 rounded-2xl border border-cream-200 p-12 text-center"><p className="text-warm-400">Nenhum serviço cadastrado. Os padrões serão exibidos.</p></div>
      ) : (
        <div className="space-y-3">
          {servicos.map(s => (
            <div key={s.id} className="bg-white/80 backdrop-blur-sm rounded-2xl border border-cream-200 shadow-sm p-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-2xl">{s.icone}</span>
                <div>
                  <h3 className="font-semibold text-warm-800">{s.titulo}</h3>
                  <p className="text-sm text-warm-500 line-clamp-1">{s.descricao}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setEditando(s); setForm({ titulo: s.titulo, descricao: s.descricao, icone: s.icone, imagemUrl: s.imagemUrl, ordem: s.ordem }); setFormAberto(true); }} className="text-sage-600 text-sm px-3 py-1.5 rounded-lg hover:bg-sage-50">✏️</button>
                <button onClick={() => handleDelete(s.id)} className="text-warm-400 text-sm px-3 py-1.5 rounded-lg hover:bg-red-50 hover:text-danger">🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
