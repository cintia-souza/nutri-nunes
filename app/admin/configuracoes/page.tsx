'use client';

import { useEffect, useState, useRef } from 'react';

interface Config {
  fotoSobre: string;
  fotoCapa: string;
  bio1: string;
  bio2: string;
  crn: string;
  especialidades: string[];
  telefone: string;
  endereco: string;
  instagram: string;
  whatsapp: string;
}

const DEFAULTS: Config = {
  fotoSobre: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=600&h=750&fit=crop',
  fotoCapa: 'https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=1920&h=1080&fit=crop',
  bio1: 'Sou nutricionista formada pela USP, pós-graduada em Nutrição Clínica Funcional e Nutrição Esportiva. Há 8 anos ajudo pessoas a transformarem sua saúde através da alimentação consciente.',
  bio2: 'Minha abordagem é individualizada — nada de dietas genéricas. Utilizo tecnologia e acompanhamento próximo para garantir que cada paciente alcance seus objetivos de forma saudável e duradoura.',
  crn: 'CRN-3 • 45.892',
  especialidades: ['Nutrição Clínica', 'Esportiva', 'Emagrecimento', 'Reeducação'],
  telefone: '(11) 99999-9999',
  endereco: 'São Paulo, SP',
  instagram: '@adriananutricionista',
  whatsapp: '5511999999999',
};

export default function ConfiguracoesPage() {
  const [form, setForm] = useState<Config>(DEFAULTS);
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);
  const [novaEsp, setNovaEsp] = useState('');
  const [editando, setEditando] = useState<string | null>(null);
  const inputFotoSobre = useRef<HTMLInputElement>(null);
  const inputFotoCapa = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/admin/configuracoes')
      .then(r => r.ok ? r.json() : {})
      .then(data => {
        if (data && Object.keys(data).length > 0) {
          setForm({ ...DEFAULTS, ...data });
        }
      })
      .catch(() => {});
  }, []);

  function handleFileUpload(field: 'fotoSobre' | 'fotoCapa', file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setForm(f => ({ ...f, [field]: base64 }));
    };
    reader.readAsDataURL(file);
  }

  async function handleSave() {
    setSalvando(true);
    await fetch('/api/admin/configuracoes', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setSalvando(false);
    setSalvo(true);
    setEditando(null);
    setTimeout(() => setSalvo(false), 3000);
  }

  function addEsp() {
    if (!novaEsp.trim()) return;
    setForm(f => ({ ...f, especialidades: [...f.especialidades, novaEsp.trim()] }));
    setNovaEsp('');
  }

  return (
    <main className="max-w-4xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-warm-800">Configurações do Site</h1>
          <p className="text-warm-500 mt-1">Clique em qualquer seção para editar.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={salvando}
          className="bg-sage-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-sage-700 active:scale-[0.98] transition-all shadow-sm disabled:opacity-50 min-h-[48px]"
        >
          {salvando ? '⏳ Salvando...' : salvo ? '✓ Salvo!' : '💾 Salvar Tudo'}
        </button>
      </div>

      {salvo && (
        <div className="bg-sage-50 border border-sage-200 rounded-xl p-3 mb-6 text-center text-sage-700 font-medium text-sm animate-fade-slide-in">
          ✓ Configurações atualizadas! As mudanças já estão visíveis no site.
        </div>
      )}

      {/* PREVIEW HERO + FOTO SOBRE */}
      <div className="space-y-6">
        {/* Foto Hero/Capa */}
        <div
          className={`bg-white/80 backdrop-blur-sm rounded-2xl border shadow-sm overflow-hidden cursor-pointer transition-all ${editando === 'capa' ? 'border-sage-400 ring-2 ring-sage-200' : 'border-cream-200 hover:border-sage-300'}`}
          onClick={() => setEditando('capa')}
        >
          <div className="relative h-48 overflow-hidden">
            <img src={form.fotoCapa} alt="Capa atual" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-sage-900/60 to-transparent flex items-center px-6">
              <div>
                <p className="text-white/60 text-xs uppercase tracking-wider">Imagem de Capa (Hero)</p>
                <p className="text-white font-bold text-lg mt-1">Transforme sua saúde pela alimentação</p>
              </div>
            </div>
            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-medium text-warm-600">
              📸 Clique para trocar
            </div>
          </div>
          {editando === 'capa' && (
            <div className="p-5 border-t border-cream-100 animate-fade-slide-in" onClick={e => e.stopPropagation()}>
              <p className="text-sm font-medium text-warm-700 mb-3">Trocar imagem de capa</p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => inputFotoCapa.current?.click()}
                  className="bg-sage-100 text-sage-700 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-sage-200 transition-colors min-h-[44px]"
                >
                  📁 Carregar do computador
                </button>
                <input
                  type="url"
                  value={form.fotoCapa.startsWith('data:') ? '' : form.fotoCapa}
                  onChange={(e) => setForm(f => ({ ...f, fotoCapa: e.target.value }))}
                  placeholder="ou cole uma URL..."
                  className="flex-1 border border-cream-200 rounded-xl px-3 py-2.5 text-sm bg-cream-50 text-warm-700 placeholder-warm-400 focus-visible:ring-2 focus-visible:ring-sage-400"
                />
              </div>
              <input ref={inputFotoCapa} type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) handleFileUpload('fotoCapa', e.target.files[0]); }} />
            </div>
          )}
        </div>

        {/* Foto Sobre */}
        <div
          className={`bg-white/80 backdrop-blur-sm rounded-2xl border shadow-sm overflow-hidden cursor-pointer transition-all ${editando === 'sobre' ? 'border-sage-400 ring-2 ring-sage-200' : 'border-cream-200 hover:border-sage-300'}`}
          onClick={() => setEditando('sobre')}
        >
          <div className="flex">
            <div className="w-40 h-40 shrink-0 overflow-hidden">
              <img src={form.fotoSobre} alt="Foto sobre atual" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 p-5 flex flex-col justify-center">
              <p className="text-xs text-warm-400 uppercase tracking-wider mb-1">Foto da Seção "Sobre mim"</p>
              <p className="text-warm-700 font-medium">Sua foto profissional</p>
              <p className="text-xs text-warm-400 mt-1">Aparece ao lado da biografia na landing page</p>
            </div>
            <div className="p-5 flex items-center">
              <span className="bg-cream-100 px-3 py-1.5 rounded-lg text-xs font-medium text-warm-500">📸 Editar</span>
            </div>
          </div>
          {editando === 'sobre' && (
            <div className="p-5 border-t border-cream-100 animate-fade-slide-in" onClick={e => e.stopPropagation()}>
              <p className="text-sm font-medium text-warm-700 mb-3">Trocar foto da seção Sobre</p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => inputFotoSobre.current?.click()}
                  className="bg-sage-100 text-sage-700 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-sage-200 transition-colors min-h-[44px]"
                >
                  📁 Carregar do computador
                </button>
                <input
                  type="url"
                  value={form.fotoSobre.startsWith('data:') ? '' : form.fotoSobre}
                  onChange={(e) => setForm(f => ({ ...f, fotoSobre: e.target.value }))}
                  placeholder="ou cole uma URL..."
                  className="flex-1 border border-cream-200 rounded-xl px-3 py-2.5 text-sm bg-cream-50 text-warm-700 placeholder-warm-400 focus-visible:ring-2 focus-visible:ring-sage-400"
                />
              </div>
              <input ref={inputFotoSobre} type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) handleFileUpload('fotoSobre', e.target.files[0]); }} />
              {form.fotoSobre.startsWith('data:') && (
                <p className="text-xs text-sage-600 mt-2">✓ Imagem carregada (será salva no banco)</p>
              )}
            </div>
          )}
        </div>

        {/* Biografia */}
        <div
          className={`bg-white/80 backdrop-blur-sm rounded-2xl border shadow-sm p-6 cursor-pointer transition-all ${editando === 'bio' ? 'border-sage-400 ring-2 ring-sage-200' : 'border-cream-200 hover:border-sage-300'}`}
          onClick={() => setEditando('bio')}
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-warm-800 flex items-center gap-2"><span>✍️</span> Biografia</h2>
            <span className="text-xs text-warm-400">Clique para editar</span>
          </div>
          {editando === 'bio' ? (
            <div className="space-y-4 animate-fade-slide-in" onClick={e => e.stopPropagation()}>
              <textarea
                value={form.bio1}
                onChange={(e) => setForm(f => ({ ...f, bio1: e.target.value }))}
                className="w-full border border-cream-300 rounded-xl px-4 py-3 bg-cream-50 text-warm-800 h-28 resize-none focus-visible:ring-2 focus-visible:ring-sage-400 text-sm"
                placeholder="Primeiro parágrafo..."
              />
              <textarea
                value={form.bio2}
                onChange={(e) => setForm(f => ({ ...f, bio2: e.target.value }))}
                className="w-full border border-cream-300 rounded-xl px-4 py-3 bg-cream-50 text-warm-800 h-28 resize-none focus-visible:ring-2 focus-visible:ring-sage-400 text-sm"
                placeholder="Segundo parágrafo..."
              />
            </div>
          ) : (
            <div className="text-sm text-warm-600 space-y-2">
              <p>{form.bio1 || <span className="italic text-warm-400">Sem texto ainda...</span>}</p>
              <p>{form.bio2}</p>
            </div>
          )}
        </div>

        {/* CRN + Especialidades */}
        <div
          className={`bg-white/80 backdrop-blur-sm rounded-2xl border shadow-sm p-6 cursor-pointer transition-all ${editando === 'crn' ? 'border-sage-400 ring-2 ring-sage-200' : 'border-cream-200 hover:border-sage-300'}`}
          onClick={() => setEditando('crn')}
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-warm-800 flex items-center gap-2"><span>🏷️</span> Registro & Especialidades</h2>
            <span className="text-xs text-warm-400">Editar</span>
          </div>

          <p className="text-sage-700 font-bold mb-3">{form.crn || 'CRN não definido'}</p>
          <div className="flex flex-wrap gap-2">
            {form.especialidades.map((esp, i) => (
              <span key={i} className="bg-sage-50 text-sage-700 px-3 py-1.5 rounded-lg text-sm font-medium border border-sage-100">
                {esp}
                {editando === 'crn' && (
                  <button type="button" onClick={(e) => { e.stopPropagation(); setForm(f => ({ ...f, especialidades: f.especialidades.filter((_, j) => j !== i) })); }} className="ml-1.5 text-warm-400 hover:text-danger">✕</button>
                )}
              </span>
            ))}
          </div>

          {editando === 'crn' && (
            <div className="mt-4 space-y-3 animate-fade-slide-in" onClick={e => e.stopPropagation()}>
              <input
                value={form.crn}
                onChange={(e) => setForm(f => ({ ...f, crn: e.target.value }))}
                placeholder="CRN-3 • 45.892"
                className="w-full border border-cream-300 rounded-xl px-4 py-3 bg-cream-50 text-warm-800 text-sm focus-visible:ring-2 focus-visible:ring-sage-400"
              />
              <div className="flex gap-2">
                <input
                  value={novaEsp}
                  onChange={(e) => setNovaEsp(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addEsp(); } }}
                  placeholder="Nova especialidade..."
                  className="flex-1 border border-cream-200 rounded-xl px-3 py-2.5 text-sm bg-cream-50 focus-visible:ring-2 focus-visible:ring-sage-400"
                />
                <button type="button" onClick={addEsp} className="bg-sage-100 text-sage-700 px-4 rounded-xl text-sm font-medium hover:bg-sage-200 min-h-[40px]">+ Adicionar</button>
              </div>
            </div>
          )}
        </div>

        {/* Contato */}
        <div
          className={`bg-white/80 backdrop-blur-sm rounded-2xl border shadow-sm p-6 cursor-pointer transition-all ${editando === 'contato' ? 'border-sage-400 ring-2 ring-sage-200' : 'border-cream-200 hover:border-sage-300'}`}
          onClick={() => setEditando('contato')}
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-warm-800 flex items-center gap-2"><span>📞</span> Contato & Redes</h2>
            <span className="text-xs text-warm-400">Editar</span>
          </div>

          {editando === 'contato' ? (
            <div className="grid md:grid-cols-2 gap-4 animate-fade-slide-in" onClick={e => e.stopPropagation()}>
              <div>
                <label className="block text-xs text-warm-500 mb-1">Telefone</label>
                <input value={form.telefone} onChange={(e) => setForm(f => ({ ...f, telefone: e.target.value }))} className="w-full border border-cream-300 rounded-xl px-3 py-2.5 text-sm bg-cream-50 focus-visible:ring-2 focus-visible:ring-sage-400" />
              </div>
              <div>
                <label className="block text-xs text-warm-500 mb-1">WhatsApp</label>
                <input value={form.whatsapp} onChange={(e) => setForm(f => ({ ...f, whatsapp: e.target.value }))} className="w-full border border-cream-300 rounded-xl px-3 py-2.5 text-sm bg-cream-50 focus-visible:ring-2 focus-visible:ring-sage-400" />
              </div>
              <div>
                <label className="block text-xs text-warm-500 mb-1">Endereço</label>
                <input value={form.endereco} onChange={(e) => setForm(f => ({ ...f, endereco: e.target.value }))} className="w-full border border-cream-300 rounded-xl px-3 py-2.5 text-sm bg-cream-50 focus-visible:ring-2 focus-visible:ring-sage-400" />
              </div>
              <div>
                <label className="block text-xs text-warm-500 mb-1">Instagram</label>
                <input value={form.instagram} onChange={(e) => setForm(f => ({ ...f, instagram: e.target.value }))} className="w-full border border-cream-300 rounded-xl px-3 py-2.5 text-sm bg-cream-50 focus-visible:ring-2 focus-visible:ring-sage-400" />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 text-sm text-warm-600">
              <p>📞 {form.telefone || '—'}</p>
              <p>💬 {form.whatsapp || '—'}</p>
              <p>📍 {form.endereco || '—'}</p>
              <p>📷 {form.instagram || '—'}</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
