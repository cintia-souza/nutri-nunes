'use client';

import { useEffect, useState } from 'react';

interface Agendamento {
  id: string;
  tipo: string;
  data: string;
  horario: string;
  nome: string;
  email: string;
  telefone: string;
  status: string;
  criadoEm: string;
}

const STATUS_STYLE: Record<string, string> = {
  PENDENTE: 'bg-amber-50 text-amber-700 border-amber-200',
  CONFIRMADO: 'bg-sage-50 text-sage-700 border-sage-200',
  CANCELADO: 'bg-red-50 text-danger border-red-200',
  REALIZADO: 'bg-blue-50 text-info border-blue-200',
};

export default function AgendamentosAdmin() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);

  useEffect(() => {
    fetch('/api/agendamento').then(r => r.json()).then(setAgendamentos);
  }, []);

  return (
    <main className="max-w-5xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-warm-800">Agendamentos</h1>
        <p className="text-warm-500 mt-1">Consultas solicitadas pelos pacientes.</p>
      </div>

      {agendamentos.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-12 border border-cream-200 text-center">
          <span className="text-4xl mb-4 block">📅</span>
          <p className="text-warm-500">Nenhum agendamento encontrado.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {agendamentos.map((ag) => (
            <div key={ag.id} className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-cream-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-sage-100 flex items-center justify-center">
                  <span className="text-lg">📋</span>
                </div>
                <div>
                  <p className="font-medium text-warm-800">{ag.nome}</p>
                  <p className="text-sm text-warm-500">{ag.tipo} • {ag.data} às {ag.horario}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-medium px-3 py-1 rounded-lg border ${STATUS_STYLE[ag.status] || STATUS_STYLE.PENDENTE}`}>
                  {ag.status}
                </span>
                <a href={`tel:${ag.telefone}`} className="text-sage-600 text-sm hover:underline">{ag.telefone}</a>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
