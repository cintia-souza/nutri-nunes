'use client';

import { useEffect, useState, useRef } from 'react';

interface Perfil {
  nome: string;
  email: string;
  telefone: string;
  dataNascimento: string;
  altura: string;
  objetivo: string;
}

export default function PerfilPage() {
  const [perfil, setPerfil] = useState<Perfil>({ nome: '', email: '', telefone: '', dataNascimento: '', altura: '', objetivo: '' });
  const [foto, setFoto] = useState('');
  const [editando, setEditando] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);
  const inputFoto = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/cliente/perfil').then(r => r.ok ? r.json() : null).then(data => {
      if (data) {
        setPerfil({
          nome: data.nome || '',
          email: data.email || '',
          telefone: data.telefone || '',
          dataNascimento: data.dataNascimento ? data.dataNascimento.split('T')[0] : '',
          altura: data.altura ? String(data.altura) : '',
          objetivo: data.objetivo || '',
        });
      }
    });
    fetch('/api/cliente/perfil/foto').then(r => r.ok ? r.json() : null).then((data: { foto?: string } | null) => {
      if (data?.foto) setFoto(data.foto);
    }).catch(() => {});
  }, []);

  function handleFotoUpload(file: File) {
    if (file.size > 2 * 1024 * 1024) { alert('Imagem muito grande. Máximo 2MB.'); return; }
    const reader = new FileReader();
    reader.onload = (e) => setFoto(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  async function salvar() {
    setSalvando(true);
    await fetch('/api/cliente/perfil', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...perfil, fotoPerfil: foto || undefined }),
    });
    setSalvando(false);
    setSalvo(true);
    setEditando(null);
    setTimeout(() => setSalvo(false), 3000);
  }

  const iniciais = perfil.nome.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

  return (
    <main className="max-w-2xl mx-auto px-4 py-8 md:px-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-warm-800">Meu Perfil</h1>
        <button onClick={salvar} disabled={salvando} className="bg-sage-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-sage-700 active:scale-[0.98] transition-all disabled:opacity-50 min-h-[44px]">
          {salvando ? '⏳' : salvo ? '✓ Salvo!' : '💾 Salvar'}
        </button>
      </div>

      {salvo && (
        <div className="bg-sage-50 border border-sage-200 rounded-xl p-3 mb-6 text-center text-sage-700 font-medium text-sm animate-fade-slide-in">
          ✓ Perfil atualizado!
        </div>
      )}

      {/* Foto de perfil */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-cream-200 shadow-sm p-6 mb-6 text-center">
        <div className="relative w-28 h-28 mx-auto mb-4">
          {foto ? (
            <img src={foto} alt="Foto de perfil" className="w-28 h-28 rounded-full object-cover border-4 border-cream-200" />
          ) : (
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-sage-400 to-sage-600 flex items-center justify-center text-white text-2xl font-bold border-4 border-cream-200">
              {iniciais || '?'}
            </div>
          )}
          <button
            onClick={() => inputFoto.current?.click()}
            className="absolute bottom-0 right-0 w-9 h-9 bg-sage-600 text-white rounded-full flex items-center justify-center shadow-md hover:bg-sage-700 transition-colors border-2 border-white"
            aria-label="Trocar foto"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
          <input ref={inputFoto} type="file" accept="image/*" className="hidden" onChange={e => { if (e.target.files?.[0]) handleFotoUpload(e.target.files[0]); }} />
        </div>
        <p className="text-warm-800 font-semibold text-lg">{perfil.nome || 'Seu nome'}</p>
        <p className="text-warm-500 text-sm">{perfil.email}</p>
      </div>

      {/* Dados pessoais */}
      <div className="space-y-4">
        {/* Nome */}
        <div
          className={`bg-white/80 backdrop-blur-sm rounded-2xl border shadow-sm p-5 cursor-pointer transition-all ${editando === 'nome' ? 'border-sage-400 ring-2 ring-sage-200' : 'border-cream-200 hover:border-sage-300'}`}
          onClick={() => setEditando('nome')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-warm-400 uppercase tracking-wider">Nome</p>
              <p className="text-warm-800 font-medium mt-0.5">{perfil.nome || <span className="italic text-warm-400">Não definido</span>}</p>
            </div>
            <span className="text-xs text-warm-400">✏️</span>
          </div>
          {editando === 'nome' && (
            <div className="mt-3 animate-fade-slide-in" onClick={e => e.stopPropagation()}>
              <input value={perfil.nome} onChange={e => setPerfil(p => ({ ...p, nome: e.target.value }))} className="w-full border border-cream-300 rounded-xl px-4 py-2.5 text-sm bg-cream-50 focus-visible:ring-2 focus-visible:ring-sage-400" />
            </div>
          )}
        </div>

        {/* Telefone */}
        <div
          className={`bg-white/80 backdrop-blur-sm rounded-2xl border shadow-sm p-5 cursor-pointer transition-all ${editando === 'telefone' ? 'border-sage-400 ring-2 ring-sage-200' : 'border-cream-200 hover:border-sage-300'}`}
          onClick={() => setEditando('telefone')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-warm-400 uppercase tracking-wider">Telefone</p>
              <p className="text-warm-800 font-medium mt-0.5">{perfil.telefone || <span className="italic text-warm-400">Não definido</span>}</p>
            </div>
            <span className="text-xs text-warm-400">✏️</span>
          </div>
          {editando === 'telefone' && (
            <div className="mt-3 animate-fade-slide-in" onClick={e => e.stopPropagation()}>
              <input type="tel" value={perfil.telefone} onChange={e => setPerfil(p => ({ ...p, telefone: e.target.value }))} placeholder="(11) 99999-9999" className="w-full border border-cream-300 rounded-xl px-4 py-2.5 text-sm bg-cream-50 focus-visible:ring-2 focus-visible:ring-sage-400" />
            </div>
          )}
        </div>

        {/* Data de Nascimento */}
        <div
          className={`bg-white/80 backdrop-blur-sm rounded-2xl border shadow-sm p-5 cursor-pointer transition-all ${editando === 'nascimento' ? 'border-sage-400 ring-2 ring-sage-200' : 'border-cream-200 hover:border-sage-300'}`}
          onClick={() => setEditando('nascimento')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-warm-400 uppercase tracking-wider">Data de Nascimento</p>
              <p className="text-warm-800 font-medium mt-0.5">{perfil.dataNascimento ? new Date(perfil.dataNascimento + 'T12:00:00').toLocaleDateString('pt-BR') : <span className="italic text-warm-400">Não definida</span>}</p>
            </div>
            <span className="text-xs text-warm-400">✏️</span>
          </div>
          {editando === 'nascimento' && (
            <div className="mt-3 animate-fade-slide-in" onClick={e => e.stopPropagation()}>
              <input type="date" value={perfil.dataNascimento} onChange={e => setPerfil(p => ({ ...p, dataNascimento: e.target.value }))} className="w-full border border-cream-300 rounded-xl px-4 py-2.5 text-sm bg-cream-50 focus-visible:ring-2 focus-visible:ring-sage-400" />
            </div>
          )}
        </div>

        {/* Altura */}
        <div
          className={`bg-white/80 backdrop-blur-sm rounded-2xl border shadow-sm p-5 cursor-pointer transition-all ${editando === 'altura' ? 'border-sage-400 ring-2 ring-sage-200' : 'border-cream-200 hover:border-sage-300'}`}
          onClick={() => setEditando('altura')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-warm-400 uppercase tracking-wider">Altura</p>
              <p className="text-warm-800 font-medium mt-0.5">{perfil.altura ? `${perfil.altura} cm` : <span className="italic text-warm-400">Não definida</span>}</p>
            </div>
            <span className="text-xs text-warm-400">✏️</span>
          </div>
          {editando === 'altura' && (
            <div className="mt-3 animate-fade-slide-in" onClick={e => e.stopPropagation()}>
              <input type="number" value={perfil.altura} onChange={e => setPerfil(p => ({ ...p, altura: e.target.value }))} placeholder="170" className="w-full border border-cream-300 rounded-xl px-4 py-2.5 text-sm bg-cream-50 focus-visible:ring-2 focus-visible:ring-sage-400" />
            </div>
          )}
        </div>

        {/* Objetivo */}
        <div
          className={`bg-white/80 backdrop-blur-sm rounded-2xl border shadow-sm p-5 cursor-pointer transition-all ${editando === 'objetivo' ? 'border-sage-400 ring-2 ring-sage-200' : 'border-cream-200 hover:border-sage-300'}`}
          onClick={() => setEditando('objetivo')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-warm-400 uppercase tracking-wider">Objetivo</p>
              <p className="text-warm-800 font-medium mt-0.5">{perfil.objetivo || <span className="italic text-warm-400">Não definido</span>}</p>
            </div>
            <span className="text-xs text-warm-400">✏️</span>
          </div>
          {editando === 'objetivo' && (
            <div className="mt-3 animate-fade-slide-in" onClick={e => e.stopPropagation()}>
              <textarea value={perfil.objetivo} onChange={e => setPerfil(p => ({ ...p, objetivo: e.target.value }))} placeholder="Ex: Emagrecer 5kg, ganhar massa muscular..." className="w-full border border-cream-300 rounded-xl px-4 py-2.5 text-sm bg-cream-50 h-20 resize-none focus-visible:ring-2 focus-visible:ring-sage-400" />
            </div>
          )}
        </div>

        {/* Email (read-only) */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-cream-200 shadow-sm p-5 opacity-60">
          <p className="text-xs text-warm-400 uppercase tracking-wider">Email</p>
          <p className="text-warm-800 font-medium mt-0.5">{perfil.email}</p>
          <p className="text-xs text-warm-400 mt-1">O email não pode ser alterado.</p>
        </div>
      </div>
    </main>
  );
}
