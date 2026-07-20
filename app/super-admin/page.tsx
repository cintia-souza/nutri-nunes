'use client';

import { useEffect, useState, useCallback } from 'react';
import { Users, ShieldCheck, ShieldOff, Activity } from 'lucide-react';

interface TenantRow {
  id: string;
  nome: string;
  email: string;
  slug: string;
  ativo: boolean;
  criadoEm: string;
  totalUsuarios: number;
}

interface Metricas {
  totalTenants: number;
  totalAtivas: number;
  totalBloqueadas: number;
  totalPacientes: number;
}

function MetricCard({ icon, label, value, color }: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="rounded-2xl p-5 border border-white/10 flex items-center gap-4"
      style={{ background: 'rgba(255,255,255,0.05)' }}>
      <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: color + '20' }}>
        <span style={{ color }}>{icon}</span>
      </div>
      <div>
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-xs text-slate-400 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

function StatusToggle({ tenant, onToggle }: { tenant: TenantRow; onToggle: (id: string, ativo: boolean) => void }) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    await onToggle(tenant.id, !tenant.ativo);
    setLoading(false);
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all min-w-[90px] justify-center ${
        loading ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90 active:scale-95'
      }`}
      style={tenant.ativo
        ? { background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' }
        : { background: 'rgba(34,197,94,0.15)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.3)' }
      }
    >
      {loading ? (
        <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
          <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" className="opacity-75" />
        </svg>
      ) : tenant.ativo ? (
        <><ShieldOff className="w-3 h-3" /> Bloquear</>
      ) : (
        <><ShieldCheck className="w-3 h-3" /> Ativar</>
      )}
    </button>
  );
}

export default function SuperAdminDashboard() {
  const [tenants, setTenants] = useState<TenantRow[]>([]);
  const [metricas, setMetricas] = useState<Metricas>({ totalTenants: 0, totalAtivas: 0, totalBloqueadas: 0, totalPacientes: 0 });
  const [busca, setBusca] = useState('');
  const [loading, setLoading] = useState(true);

  const carregar = useCallback(async () => {
    const res = await fetch('/api/super-admin/tenants');
    if (res.ok) {
      const data = await res.json();
      setTenants(data.tenants);
      setMetricas(data.metricas);
    }
    setLoading(false);
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  async function handleToggle(tenantId: string, ativo: boolean) {
    const res = await fetch('/api/super-admin/tenants', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenantId, ativo }),
    });
    if (res.ok) {
      setTenants(prev => prev.map(t => t.id === tenantId ? { ...t, ativo } : t));
      setMetricas(prev => ({
        ...prev,
        totalAtivas: prev.totalAtivas + (ativo ? 1 : -1),
        totalBloqueadas: prev.totalBloqueadas + (ativo ? -1 : 1),
      }));
    }
  }

  const filtrados = tenants.filter(t =>
    t.nome.toLowerCase().includes(busca.toLowerCase()) ||
    t.email.toLowerCase().includes(busca.toLowerCase()) ||
    t.slug.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-white">Painel Geral NutriHub</h1>
        <p className="text-slate-400 text-sm mt-1">Gerenciamento de nutricionistas assinantes da plataforma</p>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <MetricCard icon={<Activity className="w-5 h-5" />} label="Total de Tenants" value={metricas.totalTenants} color="#6366f1" />
        <MetricCard icon={<ShieldCheck className="w-5 h-5" />} label="Nutricionistas Ativas" value={metricas.totalAtivas} color="#22c55e" />
        <MetricCard icon={<ShieldOff className="w-5 h-5" />} label="Nutricionistas Bloqueadas" value={metricas.totalBloqueadas} color="#ef4444" />
        <MetricCard icon={<Users className="w-5 h-5" />} label="Total de Pacientes" value={metricas.totalPacientes} color="#f59e0b" />
      </div>

      {/* Tabela */}
      <div className="rounded-2xl border border-white/10 overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>

        {/* Toolbar */}
        <div className="px-6 py-4 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-white">Nutricionistas Cadastradas</h2>
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={busca}
              onChange={e => setBusca(e.target.value)}
              placeholder="Buscar por nome, email ou slug..."
              className="pl-9 pr-4 py-2 text-sm rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 w-64"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
            />
          </div>
        </div>

        {/* Tabela desktop */}
        {loading ? (
          <div className="p-16 text-center">
            <svg className="w-8 h-8 animate-spin text-indigo-400 mx-auto" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
              <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" className="opacity-75" />
            </svg>
          </div>
        ) : filtrados.length === 0 ? (
          <div className="p-16 text-center">
            <p className="text-slate-500 text-sm">Nenhuma nutricionista encontrada.</p>
          </div>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    {['Nutricionista', 'Subdomínio', 'Cadastro', 'Pacientes', 'Status', 'Ação'].map(h => (
                      <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filtrados.map(t => (
                    <tr key={t.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0"
                            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                            {t.nome.split(' ').map(n => n[0]).slice(0, 2).join('')}
                          </div>
                          <div>
                            <p className="font-medium text-white">{t.nome}</p>
                            <p className="text-xs text-slate-500">{t.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <code className="text-xs px-2 py-1 rounded-lg font-mono"
                          style={{ background: 'rgba(99,102,241,0.15)', color: '#a5b4fc' }}>
                          {t.slug}
                        </code>
                      </td>
                      <td className="px-6 py-4 text-slate-400 text-xs">
                        {new Date(t.criadoEm).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4">
                        <span className="flex items-center gap-1.5 text-slate-300">
                          <Users className="w-3.5 h-3.5 text-slate-500" />
                          {t.totalUsuarios}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${
                          t.ativo
                            ? 'text-emerald-400'
                            : 'text-red-400'
                        }`} style={{ background: t.ativo ? 'rgba(52,211,153,0.1)' : 'rgba(248,113,113,0.1)' }}>
                          <span className={`w-1.5 h-1.5 rounded-full ${t.ativo ? 'bg-emerald-400' : 'bg-red-400'}`} />
                          {t.ativo ? 'Ativa' : 'Bloqueada'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <StatusToggle tenant={t} onToggle={handleToggle} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile: cards */}
            <div className="md:hidden divide-y divide-white/5">
              {filtrados.map(t => (
                <div key={t.id} className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0"
                      style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                      {t.nome.split(' ').map(n => n[0]).slice(0, 2).join('')}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-white text-sm truncate">{t.nome}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <code className="text-xs font-mono" style={{ color: '#a5b4fc' }}>{t.slug}</code>
                        <span className="text-slate-600">·</span>
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Users className="w-3 h-3" />{t.totalUsuarios}
                        </span>
                      </div>
                    </div>
                  </div>
                  <StatusToggle tenant={t} onToggle={handleToggle} />
                </div>
              ))}
            </div>
          </>
        )}

        {/* Footer */}
        {!loading && filtrados.length > 0 && (
          <div className="px-6 py-3 border-t border-white/10">
            <p className="text-xs text-slate-600">{filtrados.length} nutricionista{filtrados.length !== 1 ? 's' : ''} exibida{filtrados.length !== 1 ? 's' : ''}</p>
          </div>
        )}
      </div>
    </div>
  );
}
