'use client';

import { useEffect, useState } from 'react';
import { hojeLocal } from '@/lib/datas';

interface Agendamento {
  id: string;
  tipo: string;
  data: string;
  horario: string;
  nome: string;
  email: string;
  telefone: string;
  mensagem?: string;
  status: string;
  criadoEm: string;
}

const STATUS_CONFIG: Record<string, { label: string; style: string; icon: string }> = {
  PENDENTE: { label: 'Pendente', style: 'bg-amber-50 text-amber-700 border-amber-200', icon: '⏳' },
  CONFIRMADO: { label: 'Confirmado', style: 'bg-sage-50 text-sage-700 border-sage-200', icon: '✅' },
  CANCELADO: { label: 'Cancelado', style: 'bg-red-50 text-danger border-red-200', icon: '❌' },
  REALIZADO: { label: 'Realizado', style: 'bg-blue-50 text-info border-blue-200', icon: '✔️' },
};

const HORARIOS = ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];

export default function AgendaAdminPage() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [filtro, setFiltro] = useState('todos');
  const [remarcando, setRemarcando] = useState<string | null>(null);
  const [novaData, setNovaData] = useState('');
  const [novoHorario, setNovoHorario] = useState('');
  const [criandoManual, setCriandoManual] = useState(false);
  const [formManual, setFormManual] = useState({ tipo: 'retorno', data: '', horario: '', nome: '', email: '', telefone: '' });

  useEffect(() => { carregar(); }, []);

  async function carregar() {
    const res = await fetch('/api/agendamento');
    if (res.ok) setAgendamentos(await res.json());
  }

  async function alterarStatus(id: string, acao: string) {
    await fetch('/api/agendamento', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, acao }),
    });
    carregar();
  }

  async function remarcar(id: string) {
    if (!novaData || !novoHorario) return;
    const res = await fetch('/api/agendamento', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, acao: 'remarcar', novaData, novoHorario }),
    });
    if (res.ok) { setRemarcando(null); setNovaData(''); setNovoHorario(''); carregar(); }
    else { const err = await res.json(); alert(err.error); }
  }

  async function criarManual(e: React.FormEvent) {
    e.preventDefault();
    await fetch('/api/agendamento', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formManual, confirmarDireto: true }),
    });
    setCriandoManual(false);
    setFormManual({ tipo: 'retorno', data: '', horario: '', nome: '', email: '', telefone: '' });
    carregar();
  }

  async function excluir(id: string) {
    if (!confirm('Excluir este agendamento permanentemente?')) return;
    await fetch('/api/agendamento', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    carregar();
  }

  const filtrados = filtro === 'todos' ? agendamentos : agendamentos.filter(a => a.status === filtro);
  const pendentes = agendamentos.filter(a => a.status === 'PENDENTE').length;
  const hojeConsultas = agendamentos.filter(a => a.data === hojeLocal() && a.status === 'CONFIRMADO').length;

  return (
    <main className="max-w-5xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-warm-800">Agenda</h1>
          <p className="text-warm-500 mt-1">{pendentes} pendentes • {hojeConsultas} consultas hoje</p>
        </div>
        <button onClick={() => setCriandoManual(true)} className="bg-sage-600 text-white px-5 py-3 rounded-xl font-medium hover:bg-sage-700 transition-all min-h-[48px]">
          + Agendar Manual
        </button>
      </div>

      {/* Formulário de criação manual */}
      {criandoManual && (
        <form onSubmit={criarManual} className="bg-white/80 backdrop-blur-sm rounded-2xl border border-cream-200 shadow-sm p-6 mb-8 animate-fade-slide-in space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-warm-800">Agendar Manualmente</h2>
            <button type="button" onClick={() => setCriandoManual(false)} className="text-warm-400 hover:text-warm-600">✕</button>
          </div>
          <div className="grid md:grid-cols-3 gap-3">
            <input value={formManual.nome} onChange={e => setFormManual(f => ({ ...f, nome: e.target.value }))} placeholder="Nome do paciente" className="border border-cream-300 rounded-xl px-4 py-3 bg-cream-50 focus-visible:ring-2 focus-visible:ring-sage-400" required />
            <input type="email" value={formManual.email} onChange={e => setFormManual(f => ({ ...f, email: e.target.value }))} placeholder="Email" className="border border-cream-300 rounded-xl px-4 py-3 bg-cream-50 focus-visible:ring-2 focus-visible:ring-sage-400" required />
            <input type="tel" value={formManual.telefone} onChange={e => setFormManual(f => ({ ...f, telefone: e.target.value }))} placeholder="Telefone" className="border border-cream-300 rounded-xl px-4 py-3 bg-cream-50 focus-visible:ring-2 focus-visible:ring-sage-400" required />
          </div>
          <div className="grid md:grid-cols-3 gap-3">
            <select value={formManual.tipo} onChange={e => setFormManual(f => ({ ...f, tipo: e.target.value }))} className="border border-cream-300 rounded-xl px-4 py-3 bg-cream-50 focus-visible:ring-2 focus-visible:ring-sage-400">
              <option value="primeira">Primeira Consulta</option>
              <option value="retorno">Retorno</option>
              <option value="online">Consulta Online</option>
            </select>
            <input type="date" value={formManual.data} onChange={e => setFormManual(f => ({ ...f, data: e.target.value }))} className="border border-cream-300 rounded-xl px-4 py-3 bg-cream-50 focus-visible:ring-2 focus-visible:ring-sage-400" required />
            <select value={formManual.horario} onChange={e => setFormManual(f => ({ ...f, horario: e.target.value }))} className="border border-cream-300 rounded-xl px-4 py-3 bg-cream-50 focus-visible:ring-2 focus-visible:ring-sage-400" required>
              <option value="">Horário</option>
              {HORARIOS.map(h => <option key={h} value={h}>{h}</option>)}
            </select>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => setCriandoManual(false)} className="px-5 py-2.5 rounded-xl border border-cream-300 text-warm-600 hover:bg-cream-50">Cancelar</button>
            <button type="submit" className="flex-1 bg-sage-600 text-white py-2.5 rounded-xl font-medium hover:bg-sage-700">Criar e Confirmar</button>
          </div>
          <p className="text-xs text-warm-400">O paciente receberá email de confirmação automaticamente.</p>
        </form>
      )}

      {/* Filtros */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {[{ key: 'todos', label: 'Todos' }, { key: 'PENDENTE', label: '⏳ Pendentes' }, { key: 'CONFIRMADO', label: '✅ Confirmados' }, { key: 'REALIZADO', label: '✔️ Realizados' }, { key: 'CANCELADO', label: '❌ Cancelados' }].map(f => (
          <button key={f.key} onClick={() => setFiltro(f.key)} className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${filtro === f.key ? 'bg-sage-600 text-white' : 'bg-cream-100 text-warm-600 hover:bg-cream-200'}`}>
            {f.label} {f.key !== 'todos' && <span className="ml-1 opacity-60">({agendamentos.filter(a => a.status === f.key).length})</span>}
          </button>
        ))}
      </div>

      {/* Lista */}
      {filtrados.length === 0 ? (
        <div className="bg-white/80 rounded-2xl border border-cream-200 p-12 text-center">
          <span className="text-4xl block mb-4">📅</span>
          <p className="text-warm-400">Nenhum agendamento {filtro !== 'todos' ? 'neste filtro' : 'encontrado'}.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtrados.map(ag => {
            const cfg = STATUS_CONFIG[ag.status] || STATUS_CONFIG.PENDENTE;
            return (
              <div key={ag.id} className="bg-white/80 backdrop-blur-sm rounded-2xl border border-cream-200 shadow-sm overflow-hidden">
                <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-cream-100 flex items-center justify-center text-lg shrink-0">{cfg.icon}</div>
                    <div>
                      <p className="font-semibold text-warm-800">{ag.nome}</p>
                      <p className="text-sm text-warm-500">{ag.tipo} • <strong>{ag.data}</strong> às <strong>{ag.horario}</strong></p>
                      <p className="text-xs text-warm-400 mt-0.5">{ag.email} • {ag.telefone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs font-medium px-3 py-1.5 rounded-lg border ${cfg.style}`}>{cfg.label}</span>

                    {ag.status === 'PENDENTE' && (
                      <>
                        <button onClick={() => alterarStatus(ag.id, 'confirmar')} className="text-xs bg-sage-50 text-sage-700 px-3 py-1.5 rounded-lg hover:bg-sage-100 font-medium">✅ Confirmar</button>
                        <button onClick={() => alterarStatus(ag.id, 'cancelar')} className="text-xs text-warm-400 px-3 py-1.5 rounded-lg hover:bg-red-50 hover:text-danger">Cancelar</button>
                      </>
                    )}

                    {ag.status === 'CONFIRMADO' && (
                      <>
                        <button onClick={() => setRemarcando(ag.id)} className="text-xs bg-amber-50 text-amber-700 px-3 py-1.5 rounded-lg hover:bg-amber-100 font-medium">🔄 Remarcar</button>
                        <button onClick={() => alterarStatus(ag.id, 'realizado')} className="text-xs bg-blue-50 text-info px-3 py-1.5 rounded-lg hover:bg-blue-100 font-medium">✔️ Realizado</button>
                        <button onClick={() => alterarStatus(ag.id, 'cancelar')} className="text-xs text-warm-400 px-3 py-1.5 rounded-lg hover:bg-red-50 hover:text-danger">Cancelar</button>
                      </>
                    )}

                    {(ag.status === 'CANCELADO' || ag.status === 'REALIZADO') && (
                      <button onClick={() => excluir(ag.id)} className="text-xs text-warm-400 px-3 py-1.5 rounded-lg hover:bg-red-50 hover:text-danger">🗑️</button>
                    )}
                  </div>
                </div>

                {/* Painel de remarcação */}
                {remarcando === ag.id && (
                  <div className="px-5 pb-5 pt-2 border-t border-cream-100 animate-fade-slide-in">
                    <p className="text-sm font-medium text-warm-700 mb-3">Remarcar para:</p>
                    <div className="flex gap-3 items-end flex-wrap">
                      <div>
                        <label className="text-xs text-warm-500">Nova data</label>
                        <input type="date" value={novaData} onChange={e => setNovaData(e.target.value)} min={new Date().toISOString().split('T')[0]} className="block border border-cream-300 rounded-xl px-3 py-2.5 text-sm bg-cream-50 mt-1 focus-visible:ring-2 focus-visible:ring-sage-400" />
                      </div>
                      <div>
                        <label className="text-xs text-warm-500">Novo horário</label>
                        <select value={novoHorario} onChange={e => setNovoHorario(e.target.value)} className="block border border-cream-300 rounded-xl px-3 py-2.5 text-sm bg-cream-50 mt-1 focus-visible:ring-2 focus-visible:ring-sage-400">
                          <option value="">—</option>
                          {HORARIOS.map(h => <option key={h} value={h}>{h}</option>)}
                        </select>
                      </div>
                      <button onClick={() => remarcar(ag.id)} disabled={!novaData || !novoHorario} className="bg-amber-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-amber-700 disabled:opacity-40 min-h-[42px]">
                        Confirmar Remarcação
                      </button>
                      <button onClick={() => setRemarcando(null)} className="text-warm-400 text-sm px-3 py-2.5 hover:text-warm-600">Cancelar</button>
                    </div>
                    <p className="text-xs text-warm-400 mt-2">O paciente receberá email com a nova data automaticamente.</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
