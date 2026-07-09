'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Plus, FileText, Trash2, Copy, ClipboardList } from 'lucide-react';

interface Cliente { id: string; nome: string; email: string; }
interface Entrada {
  id: string; data: string; tipo: string; titulo?: string; texto?: string;
  peso?: number; pressaoSist?: number; pressaoDiast?: number;
  glicemia?: number; temperatura?: number;
  circAbdominal?: number; circBraco?: number; circQuadril?: number;
  criadoEm: string;
}
interface Pergunta { pergunta: string; tipo: 'TEXTO' | 'CHECKBOX'; opcoes?: string[]; }
interface Formulario { id: string; titulo: string; perguntas: Pergunta[]; criadoEm: string; respostas: { respondidoEm: string }[]; }

const TIPOS = [
  { value: 'NOTA', label: 'Nota / Comentário', icon: '📝', color: '#6366f1' },
  { value: 'MEDIDA', label: 'Medidas Clínicas', icon: '🩺', color: '#0891b2' },
  { value: 'AVALIACAO_NUTRICIONAL', label: 'Avaliação Nutricional', icon: '🥗', color: '#16a34a' },
  { value: 'CONSULTA', label: 'Registro de Consulta', icon: '📋', color: '#d97706' },
] as const;

export default function DiarioPage() {
  return (
    <Suspense fallback={<div className="max-w-4xl mx-auto px-6 py-8"><div className="animate-pulse h-10 bg-cream-200 rounded-xl w-1/3" /></div>}>
      <DiarioContent />
    </Suspense>
  );
}

function DiarioContent() {
  const params = useSearchParams();
  const [clienteId, setClienteId] = useState(params.get('clienteId') || '');
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [entradas, setEntradas] = useState<Entrada[]>([]);
  const [formularios, setFormularios] = useState<Formulario[]>([]);

  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showFormBuilder, setShowFormBuilder] = useState(false);
  const [tipoForm, setTipoForm] = useState<string>('NOTA');
  const [formData, setFormData] = useState({ data: new Date().toISOString().slice(0, 10), titulo: '', texto: '', peso: '', pressaoSist: '', pressaoDiast: '', glicemia: '', temperatura: '', circAbdominal: '', circBraco: '', circQuadril: '' });
  const [salvando, setSalvando] = useState(false);

  // Form builder state
  const [formTitulo, setFormTitulo] = useState('');
  const [perguntas, setPerguntas] = useState<Pergunta[]>([{ pergunta: '', tipo: 'TEXTO' }]);

  useEffect(() => { fetch('/api/admin/clientes').then(r => r.json()).then(setClientes); }, []);

  useEffect(() => {
    if (!clienteId) return;
    setLoading(true);
    Promise.all([
      fetch(`/api/admin/diario?clienteId=${clienteId}`).then(r => r.ok ? r.json() : []).catch(() => []),
      fetch(`/api/admin/formularios?clienteId=${clienteId}`).then(r => r.ok ? r.json() : []).catch(() => []),
    ]).then(([d, f]) => { setEntradas(d || []); setFormularios(f || []); }).finally(() => setLoading(false));
  }, [clienteId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!clienteId) return;
    setSalvando(true);
    const payload: Record<string, unknown> = { clienteId, tipo: tipoForm, data: formData.data };
    if (formData.titulo) payload.titulo = formData.titulo;
    if (formData.texto) payload.texto = formData.texto;
    if (formData.peso) payload.peso = parseFloat(formData.peso);
    if (formData.pressaoSist) payload.pressaoSist = parseInt(formData.pressaoSist);
    if (formData.pressaoDiast) payload.pressaoDiast = parseInt(formData.pressaoDiast);
    if (formData.glicemia) payload.glicemia = parseFloat(formData.glicemia);
    if (formData.temperatura) payload.temperatura = parseFloat(formData.temperatura);
    if (formData.circAbdominal) payload.circAbdominal = parseFloat(formData.circAbdominal);
    if (formData.circBraco) payload.circBraco = parseFloat(formData.circBraco);
    if (formData.circQuadril) payload.circQuadril = parseFloat(formData.circQuadril);

    const res = await fetch('/api/admin/diario', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const nova = await res.json();
    setEntradas(prev => [nova, ...prev]);
    setShowForm(false);
    setFormData({ data: new Date().toISOString().slice(0, 10), titulo: '', texto: '', peso: '', pressaoSist: '', pressaoDiast: '', glicemia: '', temperatura: '', circAbdominal: '', circBraco: '', circQuadril: '' });
    setSalvando(false);
  }

  async function handleCreateFormulario(e: React.FormEvent) {
    e.preventDefault();
    if (!clienteId || !formTitulo || perguntas.some(p => !p.pergunta)) return;
    setSalvando(true);
    const res = await fetch('/api/admin/formularios', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clienteId, titulo: formTitulo, perguntas }),
    });
    if (!res.ok) { alert('Erro ao criar formulário'); setSalvando(false); return; }
    const novo = await res.json();
    setFormularios(prev => [{ ...novo, respostas: [] }, ...prev]);
    setShowFormBuilder(false);
    setFormTitulo('');
    setPerguntas([{ pergunta: '', tipo: 'TEXTO' }]);
    setSalvando(false);
  }

  async function handleDelete(id: string) {
    if (!confirm('Excluir esta entrada?')) return;
    await fetch('/api/admin/diario', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    setEntradas(prev => prev.filter(e => e.id !== id));
  }

  function addPergunta() { setPerguntas(prev => [...prev, { pergunta: '', tipo: 'TEXTO' }]); }
  function removePergunta(i: number) { setPerguntas(prev => prev.filter((_, idx) => idx !== i)); }
  function updatePergunta(i: number, field: string, value: string | string[]) {
    setPerguntas(prev => prev.map((p, idx) => idx === i ? { ...p, [field]: value } : p));
  }

  function copyLink(id: string) {
    const url = `${window.location.origin}/formulario/${id}`;
    navigator.clipboard.writeText(url);
    alert('Link copiado!');
  }

  const tipoInfo = (tipo: string) => TIPOS.find(t => t.value === tipo) || TIPOS[0];

  return (
    <main className="max-w-4xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-warm-800 flex items-center gap-2">
            <ClipboardList className="w-7 h-7" style={{ color: '#1a8558' }} /> Diário do Paciente
          </h1>
          <p className="text-warm-500 mt-1">Prontuário, medidas, notas e formulários.</p>
        </div>
        {clienteId && (
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-white text-sm font-semibold transition-all" style={{ background: 'linear-gradient(135deg,#1a8558,#0f3d29)' }}>
              <Plus className="w-4 h-4" /> Entrada
            </button>
            <button onClick={() => setShowFormBuilder(true)} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-white text-sm font-semibold transition-all" style={{ background: 'linear-gradient(135deg,#6366f1,#4338ca)' }}>
              <FileText className="w-4 h-4" /> Formulário
            </button>
          </div>
        )}
      </div>

      {/* Seletor de paciente */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-cream-200 shadow-sm mb-6">
        <label className="block text-sm font-medium text-warm-600 mb-2">Paciente</label>
        <select value={clienteId} onChange={(e) => setClienteId(e.target.value)}
          className="w-full border border-cream-300 rounded-xl px-4 py-3 bg-cream-50 text-warm-800 focus-visible:ring-2 focus-visible:ring-sage-400">
          <option value="">Selecione um paciente...</option>
          {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
        </select>
      </div>

      {/* Form Builder Modal */}
      {showFormBuilder && (
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 border border-indigo-200 shadow-lg mb-6 animate-fade-slide-in">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-warm-800 flex items-center gap-2"><FileText className="w-5 h-5" style={{ color: '#6366f1' }} /> Criar Formulário</h2>
            <button onClick={() => setShowFormBuilder(false)} className="text-warm-400 hover:text-warm-600 text-xl">✕</button>
          </div>

          <form onSubmit={handleCreateFormulario} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-warm-500 mb-1">Título do formulário</label>
              <input type="text" value={formTitulo} onChange={e => setFormTitulo(e.target.value)} placeholder="Ex: Questionário de hábitos alimentares"
                className="w-full border border-cream-300 rounded-xl px-3 py-2.5 bg-cream-50 text-warm-800 text-sm" required />
            </div>

            <div className="space-y-3">
              <p className="text-xs font-semibold text-warm-600 uppercase tracking-wide">Perguntas</p>
              {perguntas.map((p, i) => (
                <div key={i} className="bg-cream-50 rounded-xl p-4 space-y-3 border border-cream-200">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-warm-400 w-5">{i + 1}.</span>
                    <input type="text" value={p.pergunta} onChange={e => updatePergunta(i, 'pergunta', e.target.value)}
                      placeholder="Escreva a pergunta..." className="flex-1 border border-cream-200 rounded-lg px-3 py-2 bg-white text-warm-800 text-sm" required />
                    {perguntas.length > 1 && (
                      <button type="button" onClick={() => removePergunta(i)} className="text-warm-300 hover:text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-3 ml-7">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input type="radio" name={`tipo-${i}`} checked={p.tipo === 'TEXTO'} onChange={() => updatePergunta(i, 'tipo', 'TEXTO')} className="w-3.5 h-3.5" />
                      <span className="text-xs text-warm-600">Texto livre</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input type="radio" name={`tipo-${i}`} checked={p.tipo === 'CHECKBOX'} onChange={() => updatePergunta(i, 'tipo', 'CHECKBOX')} className="w-3.5 h-3.5" />
                      <span className="text-xs text-warm-600">Múltipla escolha</span>
                    </label>
                  </div>

                  {p.tipo === 'CHECKBOX' && (
                    <div className="ml-7 space-y-2">
                      <p className="text-xs text-warm-400">Opções (uma por linha):</p>
                      <textarea value={(p.opcoes || []).join('\n')}
                        onChange={e => updatePergunta(i, 'opcoes', e.target.value.split('\n'))}
                        rows={3} placeholder={"Opção 1\nOpção 2\nOpção 3"}
                        className="w-full border border-cream-200 rounded-lg px-3 py-2 bg-white text-warm-800 text-sm resize-none" />
                    </div>
                  )}
                </div>
              ))}

              <button type="button" onClick={addPergunta} className="flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-lg hover:bg-cream-100 transition-colors" style={{ color: '#6366f1' }}>
                <Plus className="w-4 h-4" /> Adicionar pergunta
              </button>
            </div>

            <button type="submit" disabled={salvando}
              className="w-full text-white py-3 rounded-xl font-semibold transition-all disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg,#6366f1,#4338ca)' }}>
              {salvando ? 'Criando...' : '✓ Criar e gerar link'}
            </button>
          </form>
        </div>
      )}

      {/* Form nova entrada */}
      {showForm && (
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-cream-200 shadow-lg mb-6 animate-fade-slide-in">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-warm-800">Nova Entrada</h2>
            <button onClick={() => setShowForm(false)} className="text-warm-400 hover:text-warm-600 text-xl">✕</button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-5">
            {TIPOS.map(t => (
              <button key={t.value} type="button" onClick={() => setTipoForm(t.value)}
                className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all text-xs font-medium ${tipoForm === t.value ? 'border-current shadow-sm' : 'border-cream-200 text-warm-500 hover:border-cream-300'}`}
                style={tipoForm === t.value ? { borderColor: t.color, color: t.color } : {}}>
                <span className="text-lg">{t.icon}</span>
                <span>{t.label}</span>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-warm-500 mb-1">Data</label>
                <input type="date" value={formData.data} onChange={e => setFormData(p => ({ ...p, data: e.target.value }))}
                  className="w-full border border-cream-300 rounded-xl px-3 py-2.5 bg-cream-50 text-warm-800 text-sm" required />
              </div>
              <div>
                <label className="block text-xs font-medium text-warm-500 mb-1">Título (opcional)</label>
                <input type="text" value={formData.titulo} onChange={e => setFormData(p => ({ ...p, titulo: e.target.value }))} placeholder="Ex: Retorno mensal"
                  className="w-full border border-cream-300 rounded-xl px-3 py-2.5 bg-cream-50 text-warm-800 text-sm" />
              </div>
            </div>

            {(tipoForm === 'MEDIDA' || tipoForm === 'CONSULTA') && (
              <div className="bg-cream-50 rounded-xl p-4 space-y-3">
                <p className="text-xs font-semibold text-warm-600 uppercase tracking-wide">Medidas Clínicas</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <NumField label="Peso (kg)" value={formData.peso} onChange={v => setFormData(p => ({ ...p, peso: v }))} placeholder="72.5" />
                  <NumField label="Pressão Sist." value={formData.pressaoSist} onChange={v => setFormData(p => ({ ...p, pressaoSist: v }))} placeholder="120" />
                  <NumField label="Pressão Diast." value={formData.pressaoDiast} onChange={v => setFormData(p => ({ ...p, pressaoDiast: v }))} placeholder="80" />
                  <NumField label="Glicemia (mg/dL)" value={formData.glicemia} onChange={v => setFormData(p => ({ ...p, glicemia: v }))} placeholder="95" />
                  <NumField label="Temperatura (°C)" value={formData.temperatura} onChange={v => setFormData(p => ({ ...p, temperatura: v }))} placeholder="36.5" />
                  <NumField label="Circ. Abdominal (cm)" value={formData.circAbdominal} onChange={v => setFormData(p => ({ ...p, circAbdominal: v }))} placeholder="85" />
                  <NumField label="Circ. Braço (cm)" value={formData.circBraco} onChange={v => setFormData(p => ({ ...p, circBraco: v }))} placeholder="30" />
                  <NumField label="Circ. Quadril (cm)" value={formData.circQuadril} onChange={v => setFormData(p => ({ ...p, circQuadril: v }))} placeholder="98" />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-warm-500 mb-1">
                {tipoForm === 'NOTA' ? 'Nota' : tipoForm === 'CONSULTA' ? 'Resumo da consulta' : 'Observação (opcional)'}
              </label>
              <textarea value={formData.texto} onChange={e => setFormData(p => ({ ...p, texto: e.target.value }))} rows={3}
                placeholder="Escreva aqui..." className="w-full border border-cream-300 rounded-xl px-3 py-2.5 bg-cream-50 text-warm-800 text-sm resize-none" />
            </div>

            <button type="submit" disabled={salvando}
              className="w-full text-white py-3 rounded-xl font-semibold transition-all disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg,#1a8558,#0f3d29)' }}>
              {salvando ? 'Salvando...' : '✓ Registrar'}
            </button>
          </form>
        </div>
      )}

      {/* Formulários enviados */}
      {formularios.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-warm-600 mb-3 flex items-center gap-2"><FileText className="w-4 h-4" /> Formulários</h3>
          <div className="space-y-2">
            {formularios.map(f => (
              <div key={f.id} className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-indigo-100 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-warm-800 truncate">{f.titulo}</p>
                  <p className="text-xs text-warm-400">
                    {f.respostas.length > 0 ? `✅ Respondido` : '⏳ Aguardando resposta'}
                    {' · '}{new Date(f.criadoEm).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <button onClick={() => copyLink(f.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-indigo-200 hover:bg-indigo-50 transition-colors" style={{ color: '#6366f1' }}>
                  <Copy className="w-3.5 h-3.5" /> Copiar link
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Timeline */}
      {loading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-3 border-sage-300 border-t-sage-600 rounded-full animate-spin" /></div>
      ) : clienteId && entradas.length === 0 && formularios.length === 0 ? (
        <div className="text-center py-16 text-warm-400">
          <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="font-medium">Nenhuma entrada ainda.</p>
          <p className="text-sm mt-1">Clique em &quot;Entrada&quot; ou &quot;Formulário&quot; para começar.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {entradas.map(entrada => {
            const info = tipoInfo(entrada.tipo);
            return (
              <div key={entrada.id} className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-cream-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0" style={{ background: `${info.color}15` }}>
                    {info.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: `${info.color}15`, color: info.color }}>{info.label}</span>
                        <span className="text-xs text-warm-400">{formatDate(entrada.data)}</span>
                      </div>
                      <button onClick={() => handleDelete(entrada.id)} className="text-warm-300 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                    {entrada.titulo && <p className="font-medium text-warm-800 text-sm">{entrada.titulo}</p>}
                    {(entrada.peso || entrada.pressaoSist || entrada.glicemia || entrada.temperatura || entrada.circAbdominal) && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {entrada.peso && <Badge label="Peso" value={`${entrada.peso} kg`} />}
                        {entrada.pressaoSist && <Badge label="PA" value={`${entrada.pressaoSist}/${entrada.pressaoDiast}`} />}
                        {entrada.glicemia && <Badge label="Glicemia" value={`${entrada.glicemia} mg/dL`} />}
                        {entrada.temperatura && <Badge label="Temp" value={`${entrada.temperatura}°C`} />}
                        {entrada.circAbdominal && <Badge label="Abd" value={`${entrada.circAbdominal} cm`} />}
                        {entrada.circBraco && <Badge label="Braço" value={`${entrada.circBraco} cm`} />}
                        {entrada.circQuadril && <Badge label="Quadril" value={`${entrada.circQuadril} cm`} />}
                      </div>
                    )}
                    {entrada.texto && <p className="text-sm text-warm-600 mt-2 whitespace-pre-wrap">{entrada.texto}</p>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}

function NumField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div>
      <label className="block text-xs text-warm-500 mb-1">{label}</label>
      <input type="number" step="any" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full border border-cream-200 rounded-lg px-3 py-2 bg-white text-warm-800 text-sm" />
    </div>
  );
}

function Badge({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs bg-cream-100 text-warm-700 px-2 py-1 rounded-lg">
      <span className="text-warm-400">{label}:</span> <span className="font-semibold">{value}</span>
    </span>
  );
}

function formatDate(d: string) {
  const [y, m, day] = d.split('-');
  return `${day}/${m}/${y}`;
}

