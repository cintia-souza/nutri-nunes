'use client';

import { useEffect, useState } from 'react';

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

const INITIAL: Config = {
  fotoSobre: '',
  fotoCapa: '',
  bio1: '',
  bio2: '',
  crn: '',
  especialidades: [],
  telefone: '',
  endereco: '',
  instagram: '',
  whatsapp: '',
};

export default function ConfiguracoesPage() {
  const [form, setForm] = useState<Config>(INITIAL);
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);
  const [novaEspecialidade, setNovaEspecialidade] = useState('');

  useEffect(() => {
    fetch('/api/admin/configuracoes')
      .then(r => r.json())
      .then(data => {
        if (data && Object.keys(data).length > 0) {
          setForm({ ...INITIAL, ...data });
        }
      });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    await fetch('/api/admin/configuracoes', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setSalvando(false);
    setSalvo(true);
    setTimeout(() => setSalvo(false), 3000);
  }

  function addEspecialidade() {
    if (!novaEspecialidade.trim()) return;
    setForm(f => ({ ...f, especialidades: [...f.especialidades, novaEspecialidade.trim()] }));
    setNovaEspecialidade('');
  }

  function removeEspecialidade(idx: number) {
    setForm(f => ({ ...f, especialidades: f.especialidades.filter((_, i) => i !== idx) }));
  }

  return (
    <main className="max-w-3xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-warm-800">Configurações do Site</h1>
        <p className="text-warm-500 mt-1">Personalize as informações que aparecem na landing page.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Foto da seção Sobre */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-cream-200 shadow-sm">
          <h2 className="font-semibold text-warm-800 mb-4 flex items-center gap-2">
            <span>📸</span> Foto da Seção &quot;Sobre&quot;
          </h2>
          <input
            type="url"
            value={form.fotoSobre}
            onChange={(e) => setForm(f => ({ ...f, fotoSobre: e.target.value }))}
            placeholder="URL da foto (ex: https://...)"
            className="w-full border border-cream-300 rounded-xl px-4 py-3 bg-cream-50 text-warm-800 placeholder-warm-400 focus-visible:ring-2 focus-visible:ring-sage-400"
          />
          {form.fotoSobre && (
            <div className="mt-4 rounded-2xl overflow-hidden border border-cream-200 h-48">
              <img src={form.fotoSobre} alt="Preview" className="w-full h-full object-cover" />
            </div>
          )}
          <p className="text-xs text-warm-400 mt-2">💡 Dica: Use o Imgur ou Cloudinary para hospedar imagens e cole a URL aqui.</p>
        </div>

        {/* Foto de capa/hero */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-cream-200 shadow-sm">
          <h2 className="font-semibold text-warm-800 mb-4 flex items-center gap-2">
            <span>🖼️</span> Foto do Hero (Capa)
          </h2>
          <input
            type="url"
            value={form.fotoCapa}
            onChange={(e) => setForm(f => ({ ...f, fotoCapa: e.target.value }))}
            placeholder="URL da imagem de fundo do hero"
            className="w-full border border-cream-300 rounded-xl px-4 py-3 bg-cream-50 text-warm-800 placeholder-warm-400 focus-visible:ring-2 focus-visible:ring-sage-400"
          />
          {form.fotoCapa && (
            <div className="mt-4 rounded-2xl overflow-hidden border border-cream-200 h-32">
              <img src={form.fotoCapa} alt="Preview capa" className="w-full h-full object-cover" />
            </div>
          )}
        </div>

        {/* Biografia */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-cream-200 shadow-sm">
          <h2 className="font-semibold text-warm-800 mb-4 flex items-center gap-2">
            <span>✍️</span> Biografia
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-warm-600 mb-1.5">Parágrafo 1</label>
              <textarea
                value={form.bio1}
                onChange={(e) => setForm(f => ({ ...f, bio1: e.target.value }))}
                placeholder="Apresentação principal..."
                className="w-full border border-cream-300 rounded-xl px-4 py-3 bg-cream-50 text-warm-800 placeholder-warm-400 h-24 resize-none focus-visible:ring-2 focus-visible:ring-sage-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-warm-600 mb-1.5">Parágrafo 2</label>
              <textarea
                value={form.bio2}
                onChange={(e) => setForm(f => ({ ...f, bio2: e.target.value }))}
                placeholder="Abordagem e diferenciais..."
                className="w-full border border-cream-300 rounded-xl px-4 py-3 bg-cream-50 text-warm-800 placeholder-warm-400 h-24 resize-none focus-visible:ring-2 focus-visible:ring-sage-400"
              />
            </div>
          </div>
        </div>

        {/* CRN e especialidades */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-cream-200 shadow-sm">
          <h2 className="font-semibold text-warm-800 mb-4 flex items-center gap-2">
            <span>🏷️</span> Registro e Especialidades
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-warm-600 mb-1.5">CRN</label>
              <input
                value={form.crn}
                onChange={(e) => setForm(f => ({ ...f, crn: e.target.value }))}
                placeholder="Ex: CRN-3 • 45.892"
                className="w-full border border-cream-300 rounded-xl px-4 py-3 bg-cream-50 text-warm-800 placeholder-warm-400 focus-visible:ring-2 focus-visible:ring-sage-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-warm-600 mb-1.5">Especialidades</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {form.especialidades.map((esp, i) => (
                  <span key={i} className="bg-sage-50 text-sage-700 px-3 py-1.5 rounded-lg text-sm font-medium border border-sage-100 flex items-center gap-1.5">
                    {esp}
                    <button type="button" onClick={() => removeEspecialidade(i)} className="text-warm-400 hover:text-danger text-xs">✕</button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  value={novaEspecialidade}
                  onChange={(e) => setNovaEspecialidade(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addEspecialidade(); } }}
                  placeholder="Adicionar especialidade..."
                  className="flex-1 border border-cream-300 rounded-xl px-4 py-2.5 bg-cream-50 text-warm-800 placeholder-warm-400 text-sm focus-visible:ring-2 focus-visible:ring-sage-400"
                />
                <button type="button" onClick={addEspecialidade} className="bg-sage-100 text-sage-700 px-4 rounded-xl text-sm font-medium hover:bg-sage-200 transition-colors min-h-[44px]">
                  Adicionar
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Contato */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-cream-200 shadow-sm">
          <h2 className="font-semibold text-warm-800 mb-4 flex items-center gap-2">
            <span>📞</span> Contato & Redes
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-warm-600 mb-1.5">Telefone</label>
              <input
                value={form.telefone}
                onChange={(e) => setForm(f => ({ ...f, telefone: e.target.value }))}
                placeholder="(11) 99999-9999"
                className="w-full border border-cream-300 rounded-xl px-4 py-3 bg-cream-50 text-warm-800 placeholder-warm-400 focus-visible:ring-2 focus-visible:ring-sage-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-warm-600 mb-1.5">WhatsApp (com DDI)</label>
              <input
                value={form.whatsapp}
                onChange={(e) => setForm(f => ({ ...f, whatsapp: e.target.value }))}
                placeholder="5511999999999"
                className="w-full border border-cream-300 rounded-xl px-4 py-3 bg-cream-50 text-warm-800 placeholder-warm-400 focus-visible:ring-2 focus-visible:ring-sage-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-warm-600 mb-1.5">Endereço</label>
              <input
                value={form.endereco}
                onChange={(e) => setForm(f => ({ ...f, endereco: e.target.value }))}
                placeholder="São Paulo, SP"
                className="w-full border border-cream-300 rounded-xl px-4 py-3 bg-cream-50 text-warm-800 placeholder-warm-400 focus-visible:ring-2 focus-visible:ring-sage-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-warm-600 mb-1.5">Instagram</label>
              <input
                value={form.instagram}
                onChange={(e) => setForm(f => ({ ...f, instagram: e.target.value }))}
                placeholder="@adriananutricionista"
                className="w-full border border-cream-300 rounded-xl px-4 py-3 bg-cream-50 text-warm-800 placeholder-warm-400 focus-visible:ring-2 focus-visible:ring-sage-400"
              />
            </div>
          </div>
        </div>

        {/* Botão salvar */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={salvando}
            className="bg-sage-600 text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-sage-700 active:scale-[0.98] transition-all shadow-sm disabled:opacity-50 min-h-[52px]"
          >
            {salvando ? 'Salvando...' : '💾 Salvar Configurações'}
          </button>
          {salvo && (
            <span className="text-sage-600 font-medium text-sm animate-fade-slide-in">✓ Salvo com sucesso!</span>
          )}
        </div>
      </form>
    </main>
  );
}
