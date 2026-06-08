'use client';

import { useEffect, useState } from 'react';

interface Post {
  id: string;
  titulo: string;
  slug: string;
  resumo: string;
  conteudo: string;
  imagemUrl?: string;
  publicado: boolean;
  criadoEm: string;
}

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [editando, setEditando] = useState<Post | null>(null);
  const [formAberto, setFormAberto] = useState(false);
  const [form, setForm] = useState({ titulo: '', resumo: '', conteudo: '', imagemUrl: '', publicado: true });
  const [salvando, setSalvando] = useState(false);

  useEffect(() => { carregar(); }, []);

  async function carregar() {
    const res = await fetch('/api/admin/blog');
    setPosts(await res.json());
  }

  function resetForm() {
    setForm({ titulo: '', resumo: '', conteudo: '', imagemUrl: '', publicado: true });
    setEditando(null);
    setFormAberto(false);
  }

  function iniciarEdicao(post: Post) {
    setEditando(post);
    setForm({ titulo: post.titulo, resumo: post.resumo, conteudo: post.conteudo, imagemUrl: post.imagemUrl || '', publicado: post.publicado });
    setFormAberto(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    const method = editando ? 'PUT' : 'POST';
    const body = editando ? { ...form, id: editando.id } : form;

    await fetch('/api/admin/blog', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    setSalvando(false);
    resetForm();
    carregar();
  }

  async function handleDelete(id: string) {
    if (!confirm('Excluir este post permanentemente?')) return;
    await fetch('/api/admin/blog', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    carregar();
  }

  async function togglePublicado(post: Post) {
    await fetch('/api/admin/blog', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: post.id, titulo: post.titulo, resumo: post.resumo, conteudo: post.conteudo, imagemUrl: post.imagemUrl, publicado: !post.publicado }),
    });
    carregar();
  }

  const publicados = posts.filter(p => p.publicado).length;

  return (
    <main className="max-w-5xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-warm-800">Blog</h1>
          <p className="text-warm-500 mt-1">{posts.length} posts • {publicados} publicados</p>
        </div>
        <button
          onClick={() => { resetForm(); setFormAberto(true); }}
          className="inline-flex items-center gap-2 bg-sage-600 text-white px-5 py-3 rounded-xl font-medium shadow-sm hover:bg-sage-700 transition-all min-h-[48px]"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Novo Post
        </button>
      </div>

      {/* Formulário */}
      {formAberto && (
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-cream-200 shadow-sm p-6 md:p-8 mb-8 animate-fade-slide-in">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-warm-800">{editando ? '✏️ Editar Post' : '✍️ Novo Post'}</h2>
            <button onClick={resetForm} className="text-warm-400 hover:text-warm-600 p-2 rounded-lg hover:bg-cream-100 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-warm-600 mb-1.5">Título</label>
              <input
                value={form.titulo}
                onChange={(e) => setForm(f => ({ ...f, titulo: e.target.value }))}
                placeholder="Um título chamativo para o artigo..."
                className="w-full border border-cream-300 rounded-xl px-4 py-3.5 bg-cream-50 text-warm-800 text-lg placeholder-warm-400 focus-visible:ring-2 focus-visible:ring-sage-400"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-warm-600 mb-1.5">Resumo</label>
              <input
                value={form.resumo}
                onChange={(e) => setForm(f => ({ ...f, resumo: e.target.value }))}
                placeholder="Breve descrição que aparecerá nos cards do blog..."
                className="w-full border border-cream-300 rounded-xl px-4 py-3 bg-cream-50 text-warm-800 placeholder-warm-400 focus-visible:ring-2 focus-visible:ring-sage-400"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-warm-600 mb-1.5">
                Conteúdo <span className="text-warm-400 font-normal">(use ## para títulos, - para listas)</span>
              </label>
              <textarea
                value={form.conteudo}
                onChange={(e) => setForm(f => ({ ...f, conteudo: e.target.value }))}
                placeholder="Escreva o conteúdo do artigo aqui..."
                className="w-full border border-cream-300 rounded-xl px-4 py-3.5 bg-cream-50 text-warm-800 placeholder-warm-400 h-56 resize-none focus-visible:ring-2 focus-visible:ring-sage-400 font-mono text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-warm-600 mb-1.5">URL da imagem de capa</label>
              <input
                value={form.imagemUrl}
                onChange={(e) => setForm(f => ({ ...f, imagemUrl: e.target.value }))}
                placeholder="https://images.unsplash.com/..."
                className="w-full border border-cream-300 rounded-xl px-4 py-3 bg-cream-50 text-warm-800 placeholder-warm-400 focus-visible:ring-2 focus-visible:ring-sage-400"
              />
              {form.imagemUrl && (
                <div className="mt-3 h-32 rounded-xl overflow-hidden border border-cream-200">
                  <img src={form.imagemUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <div className={`w-10 h-6 rounded-full transition-colors ${form.publicado ? 'bg-sage-500' : 'bg-cream-300'} relative`}>
                <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${form.publicado ? 'left-5' : 'left-1'} shadow-sm`} />
              </div>
              <span className="text-sm text-warm-700">{form.publicado ? 'Publicar imediatamente' : 'Salvar como rascunho'}</span>
            </label>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={resetForm} className="px-5 py-3 rounded-xl border border-cream-300 text-warm-600 font-medium hover:bg-cream-50 transition-all min-h-[48px]">
                Cancelar
              </button>
              <button
                type="submit"
                disabled={salvando}
                className="flex-1 bg-sage-600 text-white py-3 rounded-xl font-semibold hover:bg-sage-700 active:scale-[0.98] transition-all shadow-sm disabled:opacity-50 min-h-[48px]"
              >
                {salvando ? 'Salvando...' : editando ? 'Salvar Alterações' : 'Publicar Post'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de posts */}
      {posts.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-12 border border-cream-200 text-center">
          <span className="text-4xl mb-4 block">✍️</span>
          <p className="text-warm-500">Nenhum post criado ainda. Comece escrevendo!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post.id} className="bg-white/80 backdrop-blur-sm rounded-2xl border border-cream-200 shadow-sm overflow-hidden hover:shadow-md transition-all duration-300">
              <div className="flex flex-col md:flex-row">
                {/* Thumbnail */}
                <div className="w-full md:w-40 h-32 md:h-auto shrink-0 overflow-hidden">
                  <img
                    src={post.imagemUrl || 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=300&h=200&fit=crop'}
                    alt={post.titulo}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <button
                        onClick={() => togglePublicado(post)}
                        className={`text-xs font-medium px-2.5 py-1 rounded-lg border transition-colors ${
                          post.publicado ? 'bg-sage-50 text-sage-700 border-sage-200 hover:bg-sage-100' : 'bg-cream-100 text-warm-500 border-cream-200 hover:bg-cream-200'
                        }`}
                      >
                        {post.publicado ? '● Publicado' : '○ Rascunho'}
                      </button>
                      <span className="text-xs text-warm-400">
                        {new Date(post.criadoEm).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <h3 className="font-bold text-warm-800 text-lg mb-1">{post.titulo}</h3>
                    <p className="text-warm-500 text-sm line-clamp-2">{post.resumo}</p>
                  </div>

                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-cream-100">
                    <button onClick={() => iniciarEdicao(post)} className="text-sm text-sage-600 font-medium px-3 py-1.5 rounded-lg hover:bg-sage-50 transition-colors">
                      ✏️ Editar
                    </button>
                    <button onClick={() => handleDelete(post.id)} className="text-sm text-warm-400 font-medium px-3 py-1.5 rounded-lg hover:bg-red-50 hover:text-danger transition-colors">
                      🗑️ Excluir
                    </button>
                    {post.publicado && (
                      <a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer" className="text-sm text-info font-medium px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors ml-auto">
                        👁 Ver no site
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
