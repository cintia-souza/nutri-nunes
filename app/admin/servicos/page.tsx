'use client';

import { useEffect, useState } from 'react';

interface Servico {
  id?: string;
  titulo: string;
  descricao: string;
  icone: string;
  imagemUrl: string;
  ordem: number;
  ativo?: boolean;
  isDefault?: boolean;
}

const ICONES = ['🔬', '🥗', '📱', '💪', '🌱', '🩺', '🧠', '❤️', '🍎', '⚡', '🏃', '🥑', '🎯', '📊'];

const DEFAULTS: Servico[] = [
  { titulo: 'Consulta Inicial', descricao: 'Avaliação completa do perfil nutricional, anamnese detalhada e definição de metas personalizadas.', icone: '🔬', imagemUrl: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=300&fit=crop', ordem: 1, isDefault: true },
  { titulo: 'Plano Alimentar', descricao: 'Cardápio personalizado com receitas práticas, lista de compras e substituições inteligentes.', icone: '🥗', imagemUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop', ordem: 2, isDefault: true },
  { titulo: 'Acompanhamento Contínuo', descricao: 'Monitoramento semanal via app, ajustes de dieta e suporte por mensagem.', icone: '📱', imagemUrl: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=400&h=300&fit=crop', ordem: 3, isDefault: true },
  { titulo: 'Nutrição Esportiva', descricao: 'Performance otimizada com periodização nutricional para atletas e praticantes.', icone: '💪', imagemUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=300&fit=crop', ordem: 4, isDefault: true },
  { titulo: 'Reeducação Alimentar', descricao: 'Transforme hábitos de forma sustentável, sem dietas restritivas ou radicais.', icone: '🌱', imagemUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=300&fit=crop', ordem: 5, isDefault: true },
  { titulo: 'Nutrição Clínica', descricao: 'Acompanhamento especializado para diabetes, hipertensão, intolerâncias e alergias.', icone: '🩺', imagemUrl: 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=400&h=300&fit=crop', ordem: 6, isDefault: true },
];

export default function ServicosAdminPage() {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [editandoIdx, setEditandoIdx] = useState<number | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);

  useEffect(() => {
    fetch('/api/admin/servicos').then(r => r.ok ? r.json() : []).then((data: Servico[]) => {
      setServicos(data.length > 0 ? data : DEFAULTS);
    }).catch(() => setServicos(DEFAULTS));
  }, []);

  function updateServico(idx: number, field: keyof Servico, value: string | number) {
    const u = [...servicos];
    (u[idx] as unknown as Record<string, unknown>)[field] = value;
    u[idx].isDefault = false;
    setServicos(u);
  }

  function addServico() {
    setServicos(s => [...s, { titulo: '', descricao: '', icone: '🥗', imagemUrl: '', ordem: s.length + 1, isDefault: false }]);
    setEditandoIdx(servicos.length);
  }

  function removeServico(idx: number) {
    const s = servicos[idx];
    if (s.id) {
      fetch('/api/admin/servicos', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: s.id }) });
    }
    setServicos(prev => prev.filter((_, i) => i !== idx));
    setEditandoIdx(null);
  }

  async function salvarTudo() {
    setSalvando(true);
    for (const s of servicos) {
      if (!s.titulo.trim()) continue;
      const payload = { titulo: s.titulo, descricao: s.descricao, icone: s.icone, imagemUrl: s.imagemUrl, ordem: s.ordem, ativo: true };
      if (s.id) {
        await fetch('/api/admin/servicos', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: s.id, ...payload }) });
      } else {
        const res = await fetch('/api/admin/servicos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        const created = await res.json();
        s.id = created.id;
      }
    }
    setSalvando(false);
    setSalvo(true);
    setEditandoIdx(null);
    setTimeout(() => setSalvo(false), 3000);
  }

  return (
    <main className="max-w-4xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-warm-800">Serviços</h1>
          <p className="text-warm-500 mt-1">Clique em qualquer serviço para editar. As mudanças aparecem no site ao salvar.</p>
        </div>
        <button onClick={salvarTudo} disabled={salvando} className="bg-sage-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-sage-700 active:scale-[0.98] transition-all disabled:opacity-50 min-h-[48px]">
          {salvando ? '⏳ Salvando...' : salvo ? '✓ Salvo!' : '💾 Salvar Tudo'}
        </button>
      </div>

      {salvo && (
        <div className="bg-sage-50 border border-sage-200 rounded-xl p-3 mb-6 text-center text-sage-700 font-medium text-sm animate-fade-slide-in">
          ✓ Serviços atualizados no site!
        </div>
      )}

      <div className="space-y-4">
        {servicos.map((s, idx) => (
          <div
            key={idx}
            className={`bg-white/80 backdrop-blur-sm rounded-2xl border shadow-sm overflow-hidden cursor-pointer transition-all ${editandoIdx === idx ? 'border-sage-400 ring-2 ring-sage-200' : 'border-cream-200 hover:border-sage-300'}`}
            onClick={() => setEditandoIdx(idx)}
          >
            {/* Preview visual */}
            <div className="flex items-center gap-4 p-5">
              <span className="text-3xl">{s.icone}</span>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-warm-800">{s.titulo || <span className="italic text-warm-400">Sem título</span>}</h3>
                <p className="text-sm text-warm-500 line-clamp-1">{s.descricao || 'Sem descrição'}</p>
              </div>
              {s.imagemUrl && (
                <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 hidden md:block">
                  <img src={s.imagemUrl} alt="" className="w-full h-full object-cover" />
                </div>
              )}
              <span className="text-xs text-warm-400 shrink-0">#{s.ordem}</span>
            </div>

            {/* Editor expandido */}
            {editandoIdx === idx && (
              <div className="px-5 pb-5 pt-2 border-t border-cream-100 animate-fade-slide-in" onClick={e => e.stopPropagation()}>
                <div className="grid md:grid-cols-2 gap-3 mb-3">
                  <input value={s.titulo} onChange={e => updateServico(idx, 'titulo', e.target.value)} placeholder="Título do serviço" className="border border-cream-300 rounded-xl px-3 py-2.5 text-sm bg-cream-50 focus-visible:ring-2 focus-visible:ring-sage-400" />
                  <input value={s.imagemUrl} onChange={e => updateServico(idx, 'imagemUrl', e.target.value)} placeholder="URL da imagem" className="border border-cream-300 rounded-xl px-3 py-2.5 text-sm bg-cream-50 focus-visible:ring-2 focus-visible:ring-sage-400" />
                </div>
                <textarea value={s.descricao} onChange={e => updateServico(idx, 'descricao', e.target.value)} placeholder="Descrição..." className="w-full border border-cream-300 rounded-xl px-3 py-2.5 text-sm bg-cream-50 h-16 resize-none mb-3 focus-visible:ring-2 focus-visible:ring-sage-400" />
                <div className="flex items-center justify-between">
                  <div className="flex gap-1.5 flex-wrap">
                    {ICONES.map(ic => (
                      <button key={ic} type="button" onClick={() => updateServico(idx, 'icone', ic)} className={`w-8 h-8 rounded-lg flex items-center justify-center text-base border transition-all ${s.icone === ic ? 'border-sage-500 bg-sage-50' : 'border-cream-200'}`}>{ic}</button>
                    ))}
                  </div>
                  <button type="button" onClick={() => removeServico(idx)} className="text-xs text-warm-400 hover:text-danger px-3 py-1.5 rounded-lg hover:bg-red-50">🗑️ Remover</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <button onClick={addServico} className="mt-6 w-full border-2 border-dashed border-cream-300 rounded-2xl py-5 text-warm-400 hover:text-sage-600 hover:border-sage-300 transition-all font-medium">
        + Adicionar novo serviço
      </button>
    </main>
  );
}
