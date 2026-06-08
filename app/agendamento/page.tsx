'use client';

import { useState } from 'react';

const HORARIOS = ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];

const TIPOS_CONSULTA = [
  { id: 'primeira', nome: 'Primeira Consulta', duracao: '60 min', preco: 'R$ 250' },
  { id: 'retorno', nome: 'Retorno', duracao: '30 min', preco: 'R$ 150' },
  { id: 'online', nome: 'Consulta Online', duracao: '45 min', preco: 'R$ 200' },
];

export default function AgendamentoPage() {
  const [step, setStep] = useState(1);
  const [tipo, setTipo] = useState('');
  const [data, setData] = useState('');
  const [horario, setHorario] = useState('');
  const [form, setForm] = useState({ nome: '', email: '', telefone: '', mensagem: '' });
  const [enviado, setEnviado] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await fetch('/api/agendamento', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tipo, data, horario, ...form }),
    });
    setEnviado(true);
  }

  if (enviado) {
    return (
      <main className="min-h-[80vh] flex items-center justify-center px-6">
        <div className="text-center animate-fade-slide-in max-w-md">
          <div className="w-20 h-20 bg-sage-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-sage-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-warm-800 mb-3">Agendamento Confirmado!</h1>
          <p className="text-warm-500 mb-2">Sua consulta foi solicitada com sucesso.</p>
          <p className="text-warm-500 text-sm">Entraremos em contato para confirmar o horário em até 24h.</p>
          <div className="mt-8 bg-cream-100 rounded-2xl p-5 text-left">
            <p className="text-sm text-warm-600"><strong>Tipo:</strong> {TIPOS_CONSULTA.find(t => t.id === tipo)?.nome}</p>
            <p className="text-sm text-warm-600"><strong>Data:</strong> {data}</p>
            <p className="text-sm text-warm-600"><strong>Horário:</strong> {horario}</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen py-12 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-sage-600 font-semibold text-sm uppercase tracking-wider">Agendamento</span>
          <h1 className="text-3xl md:text-4xl font-bold text-warm-800 mt-3">Agende sua Consulta</h1>
          <p className="text-warm-500 mt-3 text-lg">Escolha o melhor horário para você.</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                step >= s ? 'bg-sage-600 text-white shadow-sm' : 'bg-cream-200 text-warm-400'
              }`}>
                {s}
              </div>
              {s < 3 && <div className={`w-12 h-0.5 rounded transition-colors duration-300 ${step > s ? 'bg-sage-500' : 'bg-cream-200'}`} />}
            </div>
          ))}
        </div>

        {/* Step 1: Tipo de Consulta */}
        {step === 1 && (
          <div className="animate-fade-slide-in space-y-4">
            <h2 className="font-semibold text-warm-800 text-xl mb-6">Selecione o tipo de consulta</h2>
            <div className="grid gap-4">
              {TIPOS_CONSULTA.map((t) => (
                <button
                  key={t.id}
                  onClick={() => { setTipo(t.id); setStep(2); }}
                  className={`w-full text-left p-6 rounded-2xl border-2 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 min-h-[80px] ${
                    tipo === t.id ? 'border-sage-500 bg-sage-50' : 'border-cream-200 bg-white hover:border-sage-300'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-warm-800 text-lg">{t.nome}</p>
                      <p className="text-warm-500 text-sm mt-1">⏱ {t.duracao}</p>
                    </div>
                    <span className="text-sage-700 font-bold text-lg">{t.preco}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Data e Horário */}
        {step === 2 && (
          <div className="animate-fade-slide-in space-y-6">
            <h2 className="font-semibold text-warm-800 text-xl">Escolha data e horário</h2>

            <div>
              <label htmlFor="agendar-data" className="block text-sm font-medium text-warm-600 mb-2">Data</label>
              <input
                id="agendar-data"
                type="date"
                value={data}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setData(e.target.value)}
                className="w-full border border-cream-300 rounded-xl px-4 py-3.5 text-warm-800 bg-white focus-visible:ring-2 focus-visible:ring-sage-400 text-lg"
                required
              />
            </div>

            {data && (
              <div className="animate-fade-slide-in">
                <p className="text-sm font-medium text-warm-600 mb-3">Horários disponíveis</p>
                <div className="grid grid-cols-4 gap-3">
                  {HORARIOS.map((h) => (
                    <button
                      key={h}
                      onClick={() => setHorario(h)}
                      className={`py-3 px-4 rounded-xl font-medium text-sm transition-all duration-200 min-h-[48px] ${
                        horario === h
                          ? 'bg-sage-600 text-white shadow-sm'
                          : 'bg-white border border-cream-200 text-warm-700 hover:border-sage-300 hover:bg-sage-50'
                      }`}
                    >
                      {h}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button onClick={() => setStep(1)} className="px-6 py-3 rounded-xl border border-cream-300 text-warm-600 font-medium hover:bg-cream-100 transition-all min-h-[48px]">
                Voltar
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!data || !horario}
                className="flex-1 bg-sage-600 text-white py-3 rounded-xl font-semibold hover:bg-sage-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed min-h-[48px]"
              >
                Continuar
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Dados pessoais */}
        {step === 3 && (
          <form onSubmit={handleSubmit} className="animate-fade-slide-in space-y-5">
            <h2 className="font-semibold text-warm-800 text-xl">Seus dados</h2>

            <div>
              <label htmlFor="ag-nome" className="block text-sm font-medium text-warm-600 mb-1.5">Nome completo</label>
              <input
                id="ag-nome"
                value={form.nome}
                onChange={(e) => setForm(f => ({ ...f, nome: e.target.value }))}
                className="w-full border border-cream-300 rounded-xl px-4 py-3.5 bg-white text-warm-800 placeholder-warm-400 focus-visible:ring-2 focus-visible:ring-sage-400"
                placeholder="Seu nome"
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="ag-email" className="block text-sm font-medium text-warm-600 mb-1.5">Email</label>
                <input
                  id="ag-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full border border-cream-300 rounded-xl px-4 py-3.5 bg-white text-warm-800 placeholder-warm-400 focus-visible:ring-2 focus-visible:ring-sage-400"
                  placeholder="seu@email.com"
                  required
                />
              </div>
              <div>
                <label htmlFor="ag-tel" className="block text-sm font-medium text-warm-600 mb-1.5">Telefone</label>
                <input
                  id="ag-tel"
                  type="tel"
                  value={form.telefone}
                  onChange={(e) => setForm(f => ({ ...f, telefone: e.target.value }))}
                  className="w-full border border-cream-300 rounded-xl px-4 py-3.5 bg-white text-warm-800 placeholder-warm-400 focus-visible:ring-2 focus-visible:ring-sage-400"
                  placeholder="(11) 99999-9999"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="ag-msg" className="block text-sm font-medium text-warm-600 mb-1.5">Mensagem (opcional)</label>
              <textarea
                id="ag-msg"
                value={form.mensagem}
                onChange={(e) => setForm(f => ({ ...f, mensagem: e.target.value }))}
                className="w-full border border-cream-300 rounded-xl px-4 py-3.5 bg-white text-warm-800 placeholder-warm-400 resize-none h-24 focus-visible:ring-2 focus-visible:ring-sage-400"
                placeholder="Alguma observação ou objetivo que gostaria de compartilhar?"
              />
            </div>

            {/* Resumo */}
            <div className="bg-cream-100 rounded-2xl p-5 border border-cream-200">
              <p className="text-sm font-semibold text-warm-700 mb-2">Resumo do agendamento</p>
              <div className="text-sm text-warm-600 space-y-1">
                <p>📋 {TIPOS_CONSULTA.find(t => t.id === tipo)?.nome} — {TIPOS_CONSULTA.find(t => t.id === tipo)?.preco}</p>
                <p>📅 {data} às {horario}</p>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setStep(2)} className="px-6 py-3.5 rounded-xl border border-cream-300 text-warm-600 font-medium hover:bg-cream-100 transition-all min-h-[48px]">
                Voltar
              </button>
              <button
                type="submit"
                className="flex-1 bg-sage-600 text-white py-3.5 rounded-xl font-semibold hover:bg-sage-700 active:scale-[0.98] transition-all shadow-sm min-h-[48px]"
              >
                Confirmar Agendamento
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
