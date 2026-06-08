'use client';

import { useEffect, useState } from 'react';

interface Plano {
  id?: string;
  nome: string;
  preco: string;
  periodo: string;
  destaque: boolean;
  itens: string[];
  ordem: number;
  isDefault?: boolean;
}

const DEFAULTS: Plano[] = [
  { nome: 'Consulta Avulsa', preco: 'R$ 250', periodo: 'por sessão', destaque: false, itens: ['Avaliação completa', 'Plano alimentar', 'Receitas personalizadas', 'Retorno em 30 dias'], ordem: 1, isDefault: true },
  { nome: 'Acompanhamento Mensal', preco: 'R$ 450', periodo: '/mês', destaque: true, itens: ['Tudo do plano avulso', 'App de acompanhamento', 'Ajustes semanais', 'Suporte via WhatsApp', 'Checklist de refeições'], ordem: 2, isDefault: true },
  { nome: 'Premium Trimestral', preco: 'R$ 1.100', periodo: '/trimestre', destaque: false, itens: ['Tudo do mensal', 'Bioimpedância mensal', 'Receitas exclusivas', 'Consultas ilimitadas', 'Relatório de evolução'], ordem: 3, isDefault: true },
];

export default function PlanosAdminPage() {
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [editandoIdx, setEditandoIdx] = useState<number | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);

  useEffect(() => {
    fetch('/api/admin/planos').then(r => r.ok ? r.json() : []).then((data: Plano[]) => {
      setPlanos(data.length > 0 ? data : DEFAULTS);
    }).catch(() => setPlanos(DEFAULTS));
  }, []);

  function updatePlano(idx: number, field: string, value: unknown) {
    const u = [...planos];
    (u[idx] as unknown as Record<string, unknown>)[field] = value;
    u[idx].isDefault = false;
    setPlanos(u);
  }

  function updateItem(planoIdx: number, itemIdx: number, value: string) {
    const u = [...planos];
    u[planoIdx].itens[itemIdx] = value;
    u[planoIdx].isDefault = false;
    setPlanos(u);
  }

  function addItem(planoIdx: number) {
    const u = [...planos];
    u[planoIdx].itens.push('');
    setPlanos(u);
  }

  function removeItem(planoIdx: number, itemIdx: number) {
    const u = [...planos];
    u[planoIdx].itens = u[planoIdx].itens.filter((_, i) => i !== itemIdx);
    setPlanos(u);
  }

  function addPlano() {
    setPlanos(p => [...p, { nome: '', preco: '', periodo: '', destaque: false, itens: [''], ordem: p.length + 1, isDefault: false }]);
    setEditandoIdx(planos.length);
  }

  function removePlano(idx: number) {
    const p = planos[idx];
    if (p.id) {
      fetch('/api/admin/planos', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: p.id }) });
    }
    setPlanos(prev => prev.filter((_, i) => i !== idx));
    setEditandoIdx(null);
  }

  async function salvarTudo() {
    setSalvando(true);
    for (const p of planos) {
      if (!p.nome.trim()) continue;
      const payload = { nome: p.nome, preco: p.preco, periodo: p.periodo, destaque: p.destaque, itens: p.itens.filter(i => i.trim()), ordem: p.ordem, ativo: true };
      if (p.id) {
        await fetch('/api/admin/planos', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: p.id, ...payload }) });
      } else {
        const res = await fetch('/api/admin/planos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        const created = await res.json();
        p.id = created.id;
      }
    }
    setSalvando(false);
    setSalvo(true);
    setEditandoIdx(null);
    setTimeout(() => setSalvo(false), 3000);
  }

  return (
    <main className="max-w-5xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-warm-800">Planos & Valores</h1>
          <p className="text-warm-500 mt-1">Clique em qualquer plano para editar. Salve para publicar no site.</p>
        </div>
        <button onClick={salvarTudo} disabled={salvando} className="bg-sage-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-sage-700 active:scale-[0.98] transition-all disabled:opacity-50 min-h-[48px]">
          {salvando ? '⏳ Salvando...' : salvo ? '✓ Salvo!' : '💾 Salvar Tudo'}
        </button>
      </div>

      {salvo && (
        <div className="bg-sage-50 border border-sage-200 rounded-xl p-3 mb-6 text-center text-sage-700 font-medium text-sm animate-fade-slide-in">
          ✓ Planos atualizados no site!
        </div>
      )}

      {/* Preview como cards (como aparece na landing) */}
      <div className="grid md:grid-cols-3 gap-5">
        {planos.map((p, idx) => (
          <div
            key={idx}
            onClick={() => setEditandoIdx(idx)}
            className={`relative rounded-2xl border cursor-pointer transition-all ${
              editandoIdx === idx ? 'ring-2 ring-sage-300 border-sage-400' : 'hover:border-sage-300'
            } ${p.destaque ? 'bg-gradient-to-br from-sage-600 to-sage-800 text-white border-sage-600 shadow-lg' : 'bg-white/80 border-cream-200 shadow-sm'}`}
          >
            {/* Card preview */}
            <div className="p-6">
              {p.destaque && <span className="text-xs bg-gold-400 text-white px-2.5 py-0.5 rounded-full font-bold mb-2 inline-block">⭐ Destaque</span>}
              <h3 className={`font-bold text-lg mb-1 ${p.destaque ? 'text-white' : 'text-warm-800'}`}>{p.nome || 'Novo plano'}</h3>
              <p className={`text-3xl font-bold ${p.destaque ? 'text-white' : 'text-sage-700'}`}>
                {p.preco || '—'}
                <span className={`text-sm font-normal ml-1 ${p.destaque ? 'text-sage-200' : 'text-warm-400'}`}>{p.periodo}</span>
              </p>
              <ul className="mt-4 space-y-1.5">
                {p.itens.filter(i => i.trim()).map((item, i) => (
                  <li key={i} className={`text-sm flex items-center gap-1.5 ${p.destaque ? 'text-sage-100' : 'text-warm-600'}`}>
                    <span className={p.destaque ? 'text-sage-300' : 'text-sage-500'}>✓</span>{item}
                  </li>
                ))}
              </ul>
              <div className={`mt-4 text-center text-xs ${p.destaque ? 'text-sage-200' : 'text-warm-400'}`}>
                Clique para editar
              </div>
            </div>

            {/* Editor inline */}
            {editandoIdx === idx && (
              <div className="border-t border-cream-200/30 p-5 space-y-3 animate-fade-slide-in" onClick={e => e.stopPropagation()}>
                <div className="grid grid-cols-2 gap-2">
                  <input value={p.nome} onChange={e => updatePlano(idx, 'nome', e.target.value)} placeholder="Nome" className="border border-cream-300 rounded-lg px-3 py-2 text-sm bg-white text-warm-800 focus-visible:ring-2 focus-visible:ring-sage-400" />
                  <input value={p.preco} onChange={e => updatePlano(idx, 'preco', e.target.value)} placeholder="R$ 450" className="border border-cream-300 rounded-lg px-3 py-2 text-sm bg-white text-warm-800 focus-visible:ring-2 focus-visible:ring-sage-400" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input value={p.periodo} onChange={e => updatePlano(idx, 'periodo', e.target.value)} placeholder="/mês" className="border border-cream-300 rounded-lg px-3 py-2 text-sm bg-white text-warm-800 focus-visible:ring-2 focus-visible:ring-sage-400" />
                  <label className="flex items-center gap-2 px-3 py-2 cursor-pointer">
                    <input type="checkbox" checked={p.destaque} onChange={e => updatePlano(idx, 'destaque', e.target.checked)} className="w-4 h-4 rounded text-sage-600" />
                    <span className="text-sm text-warm-700">Destaque</span>
                  </label>
                </div>

                <div>
                  <p className="text-xs text-warm-500 mb-1.5">Itens inclusos:</p>
                  {p.itens.map((item, i) => (
                    <div key={i} className="flex gap-1.5 items-center mb-1.5 group">
                      <span className="text-sage-500 text-xs">✓</span>
                      <input value={item} onChange={e => updateItem(idx, i, e.target.value)} placeholder="Benefício..." className="flex-1 border border-cream-200 rounded-lg px-2.5 py-1.5 text-xs bg-white focus-visible:ring-2 focus-visible:ring-sage-400" />
                      {p.itens.length > 1 && <button onClick={() => removeItem(idx, i)} className="opacity-0 group-hover:opacity-100 text-warm-300 hover:text-danger text-xs">✕</button>}
                    </div>
                  ))}
                  <button onClick={() => addItem(idx)} className="text-xs text-sage-600 font-medium mt-1">+ Adicionar item</button>
                </div>

                <button onClick={() => removePlano(idx)} className="text-xs text-warm-400 hover:text-danger w-full text-center pt-2 border-t border-cream-100">
                  🗑️ Remover este plano
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <button onClick={addPlano} className="mt-6 w-full border-2 border-dashed border-cream-300 rounded-2xl py-5 text-warm-400 hover:text-sage-600 hover:border-sage-300 transition-all font-medium">
        + Adicionar novo plano
      </button>
    </main>
  );
}
