'use client';

import { useEffect, useState } from 'react';

interface Receita {
  id: string;
  titulo: string;
  ingredientes: string[];
  modoPreparo: string[];
  tempoPreparo?: string;
  videoUrl?: string;
  _count?: { alimentos: number };
}

export default function ReceitasAdminPage() {
  const [receitas, setReceitas] = useState<Receita[]>([]);
  const [editando, setEditando] = useState<Receita | null>(null);
  const [formAberto, setFormAberto] = useState(false);
  const [form, setForm] = useState({ titulo: '', tempoPreparo: '', videoUrl: '', ingredientes: [''], modoPreparo: [''] });
  const [salvando, setSalvando] = useState(false);
  const [busca, setBusca] = useState('');

  useEffect(() => { carregar(); }, []);

  async function carregar() {
    const res = await fetch('/api/admin/receitas');
    setReceitas(await res.json());
  }

  function resetForm() {
    setForm({ titulo: '', tempoPreparo: '', videoUrl: '', ingredientes: [''], modoPreparo: [''] });
    setEditando(null);
    setFormAberto(false);
  }

  function iniciarEdicao(r: Receita) {
    setEditando(r);
    setForm({
      titulo: r.titulo,
      tempoPreparo: r.tempoPreparo || '',
      videoUrl: r.videoUrl || '',
      ingredientes: r.ingredientes.length > 0 ? r.ingredientes : [''],
      modoPreparo: r.modoPreparo.length > 0 ? r.modoPreparo : [''],
    });
    setFormAberto(true);
  }

  function updateLista(tipo: 'ingredientes' | 'modoPreparo', idx: number, value: string) {
    setForm(f => {
      const arr = [...f[tipo]];
      arr[idx] = value;
      return { ...f, [tipo]: arr };
    });
  }

  function addLista(tipo: 'ingredientes' | 'modoPreparo') {
    setForm(f => ({ ...f, [tipo]: [...f[tipo], ''] }));
  }

  function removeLista(tipo: 'ingredientes' | 'modoPreparo', idx: number) {
    setForm(f => ({ ...f, [tipo]: f[tipo].filter((_, i) => i !== idx) }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);

    const payload = {
      ...(editando && { id: editando.id }),
      titulo: form.titulo,
      tempoPreparo: form.tempoPreparo || undefined,
      videoUrl: form.videoUrl || undefined,
      ingredientes: form.ingredientes.filter(i => i.trim()),
      modoPreparo: form.modoPreparo.filter(p => p.trim()),
    };

    await fetch('/api/admin/receitas', {
      method: editando ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    setSalvando(false);
    resetForm();
    carregar();
  }

  async function handleDelete(id: string) {
    if (!confirm('Excluir esta receita? Alimentos vinculados perderão a referência.')) return;
    await fetch('/api/admin/receitas', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    carregar();
  }

  const filtradas = receitas.filter(r => r.titulo.toLowerCase().includes(busca.toLowerCase()));

  return (
    <main className="max-w-5xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-warm-800">Banco de Receitas</h1>
          <p className="text-warm-500 mt-1">Crie receitas e vincule-as aos alimentos das dietas.</p>
        </div>
        <button
          onClick={() => { resetForm(); setFormAberto(true); }}
          className="inline-flex items-center gap-2 bg-sage-600 text-white px-5 py-3 rounded-xl font-medium shadow-sm hover:bg-sage-700 transition-all min-h-[48px]"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Nova Receita
        </button>
      </div>

      {/* Formulário */}
      {formAberto && (
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-cream-200 shadow-sm p-6 md:p-8 mb-8 animate-fade-slide-in">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-warm-800">{editando ? 'Editar Receita' : 'Nova Receita'}</h2>
            <button onClick={resetForm} className="text-warm-400 hover:text-warm-600 p-2 rounded-lg hover:bg-cream-100 transition-colors" aria-label="Fechar">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Título, tempo e vídeo */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label htmlFor="rec-titulo" className="block text-sm font-medium text-warm-600 mb-1.5">Nome da receita</label>
                <input
                  id="rec-titulo"
                  value={form.titulo}
                  onChange={(e) => setForm(f => ({ ...f, titulo: e.target.value }))}
                  placeholder="Ex: Panqueca proteica de banana"
                  className="w-full border border-cream-300 rounded-xl px-4 py-3 bg-cream-50 text-warm-800 placeholder-warm-400 focus-visible:ring-2 focus-visible:ring-sage-400"
                  required
                />
              </div>
              <div>
                <label htmlFor="rec-tempo" className="block text-sm font-medium text-warm-600 mb-1.5">Tempo de preparo</label>
                <input
                  id="rec-tempo"
                  value={form.tempoPreparo}
                  onChange={(e) => setForm(f => ({ ...f, tempoPreparo: e.target.value }))}
                  placeholder="Ex: 15 min"
                  className="w-full border border-cream-300 rounded-xl px-4 py-3 bg-cream-50 text-warm-800 placeholder-warm-400 focus-visible:ring-2 focus-visible:ring-sage-400"
                />
              </div>
            </div>

            {/* Link de vídeo */}
            <div>
              <label htmlFor="rec-video" className="block text-sm font-medium text-warm-600 mb-1.5 flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-red-50 flex items-center justify-center text-xs">▶️</span>
                Link do Vídeo (opcional)
              </label>
              <input
                id="rec-video"
                value={form.videoUrl}
                onChange={(e) => setForm(f => ({ ...f, videoUrl: e.target.value }))}
                placeholder="https://youtube.com/watch?v=... ou https://vimeo.com/..."
                className="w-full border border-cream-300 rounded-xl px-4 py-3 bg-cream-50 text-warm-800 placeholder-warm-400 focus-visible:ring-2 focus-visible:ring-sage-400"
              />
              {form.videoUrl && (
                <p className="text-xs text-sage-600 mt-1.5">✓ Vídeo vinculado — paciente verá o botão &quot;Assistir vídeo&quot; na receita</p>
              )}
            </div>

            {/* Ingredientes */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-warm-600 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-sage-100 flex items-center justify-center text-xs">🧾</span>
                  Ingredientes
                </label>
                <button type="button" onClick={() => addLista('ingredientes')} className="text-sage-600 text-sm font-medium hover:text-sage-700">+ Adicionar</button>
              </div>
              <div className="space-y-2">
                {form.ingredientes.map((ing, i) => (
                  <div key={i} className="flex gap-2 items-center group">
                    <span className="text-warm-300 text-xs w-5 text-center">{i + 1}.</span>
                    <input
                      value={ing}
                      onChange={(e) => updateLista('ingredientes', i, e.target.value)}
                      placeholder="Ex: 1 banana madura"
                      className="flex-1 border border-cream-200 rounded-xl px-3.5 py-2.5 text-sm bg-cream-50 text-warm-700 placeholder-warm-400 focus-visible:ring-2 focus-visible:ring-sage-400"
                    />
                    {form.ingredientes.length > 1 && (
                      <button type="button" onClick={() => removeLista('ingredientes', i)} className="opacity-0 group-hover:opacity-100 text-warm-300 hover:text-danger transition-all p-1">✕</button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Modo de Preparo */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-warm-600 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-sage-100 flex items-center justify-center text-xs">👩‍🍳</span>
                  Modo de Preparo
                </label>
                <button type="button" onClick={() => addLista('modoPreparo')} className="text-sage-600 text-sm font-medium hover:text-sage-700">+ Adicionar passo</button>
              </div>
              <div className="space-y-2">
                {form.modoPreparo.map((passo, i) => (
                  <div key={i} className="flex gap-2 items-start group">
                    <span className="w-6 h-6 rounded-full bg-sage-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-2">{i + 1}</span>
                    <textarea
                      value={passo}
                      onChange={(e) => updateLista('modoPreparo', i, e.target.value)}
                      placeholder={`Passo ${i + 1}...`}
                      className="flex-1 border border-cream-200 rounded-xl px-3.5 py-2.5 text-sm bg-cream-50 text-warm-700 placeholder-warm-400 resize-none h-16 focus-visible:ring-2 focus-visible:ring-sage-400"
                    />
                    {form.modoPreparo.length > 1 && (
                      <button type="button" onClick={() => removeLista('modoPreparo', i)} className="opacity-0 group-hover:opacity-100 text-warm-300 hover:text-danger transition-all p-1 mt-2">✕</button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Botões */}
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={resetForm} className="px-5 py-3 rounded-xl border border-cream-300 text-warm-600 font-medium hover:bg-cream-50 transition-all min-h-[48px]">
                Cancelar
              </button>
              <button
                type="submit"
                disabled={salvando}
                className="flex-1 bg-sage-600 text-white py-3 rounded-xl font-semibold hover:bg-sage-700 active:scale-[0.98] transition-all shadow-sm disabled:opacity-50 min-h-[48px]"
              >
                {salvando ? 'Salvando...' : editando ? 'Salvar Alterações' : 'Criar Receita'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Busca */}
      <div className="relative mb-6">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-warm-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar receita..."
          className="w-full pl-12 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-cream-200 rounded-xl text-warm-700 placeholder-warm-400 focus-visible:ring-2 focus-visible:ring-sage-400"
        />
      </div>

      {/* Lista de receitas */}
      {filtradas.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-12 border border-cream-200 text-center">
          <span className="text-4xl mb-4 block">📖</span>
          <p className="text-warm-500">{busca ? 'Nenhuma receita encontrada.' : 'Nenhuma receita cadastrada ainda.'}</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filtradas.map((r) => (
            <div key={r.id} className="bg-white/80 backdrop-blur-sm rounded-2xl border border-cream-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-warm-800 text-lg">{r.titulo}</h3>
                    <div className="flex items-center gap-2 mt-1.5">
                      {r.tempoPreparo && (
                        <span className="text-xs bg-cream-100 text-warm-600 px-2.5 py-1 rounded-lg">⏱ {r.tempoPreparo}</span>
                      )}
                      <span className="text-xs bg-sage-50 text-sage-700 px-2.5 py-1 rounded-lg">{r.ingredientes.length} ingredientes</span>
                      <span className="text-xs bg-blue-50 text-info px-2.5 py-1 rounded-lg">{r.modoPreparo.length} passos</span>
                      {r.videoUrl && (
                        <span className="text-xs bg-red-50 text-red-600 px-2.5 py-1 rounded-lg">▶️ Vídeo</span>
                      )}
                    </div>
                  </div>
                  {r._count && r._count.alimentos > 0 && (
                    <span className="text-xs bg-sage-100 text-sage-700 px-2 py-1 rounded-lg font-medium shrink-0">
                      {r._count.alimentos} uso{r._count.alimentos > 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                {/* Preview ingredientes */}
                <div className="mb-3">
                  <p className="text-xs text-warm-400 mb-1">Ingredientes:</p>
                  <p className="text-sm text-warm-600 line-clamp-2">
                    {r.ingredientes.slice(0, 4).join(' • ')}{r.ingredientes.length > 4 ? ` +${r.ingredientes.length - 4}` : ''}
                  </p>
                </div>

                {/* Ações */}
                <div className="flex gap-2 pt-2 border-t border-cream-100">
                  <button
                    onClick={() => iniciarEdicao(r)}
                    className="flex-1 text-sm text-sage-600 font-medium py-2 rounded-lg hover:bg-sage-50 transition-colors min-h-[40px]"
                  >
                    ✏️ Editar
                  </button>
                  <button
                    onClick={() => handleDelete(r.id)}
                    className="flex-1 text-sm text-warm-400 font-medium py-2 rounded-lg hover:bg-red-50 hover:text-danger transition-colors min-h-[40px]"
                  >
                    🗑️ Excluir
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info de uso */}
      <div className="mt-8 bg-cream-100 rounded-2xl p-5 border border-cream-200">
        <h3 className="font-semibold text-warm-700 text-sm mb-2">💡 Como vincular receitas</h3>
        <p className="text-sm text-warm-500 leading-relaxed">
          Após criar as receitas aqui, vá em <strong>Dietas</strong> e ao adicionar um alimento a uma refeição, você poderá vincular uma receita existente. O paciente verá a receita detalhada ao clicar no alimento.
        </p>
      </div>
    </main>
  );
}
