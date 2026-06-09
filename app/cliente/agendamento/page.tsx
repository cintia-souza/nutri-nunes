'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const HORARIOS_MANHA = ['08:00', '09:00', '10:00', '11:00'];
const HORARIOS_TARDE = ['14:00', '15:00', '16:00', '17:00'];
const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const TIPOS_CONSULTA = [
  { id: 'primeira', nome: 'Primeira Consulta', duracao: '60 min', preco: 'R$ 250', icon: '🩺' },
  { id: 'retorno', nome: 'Retorno', duracao: '30 min', preco: 'R$ 150', icon: '🔄' },
  { id: 'online', nome: 'Consulta Online', duracao: '45 min', preco: 'R$ 200', icon: '💻' },
];

function gerarDiasMes(ano: number, mes: number) {
  const primeiroDia = new Date(ano, mes, 1).getDay();
  const totalDias = new Date(ano, mes + 1, 0).getDate();
  const dias: (number | null)[] = Array(primeiroDia).fill(null);
  for (let i = 1; i <= totalDias; i++) dias.push(i);
  return dias;
}

export default function AgendamentoClientePage() {
  const [step, setStep] = useState(1);
  const [tipo, setTipo] = useState('');
  const [mesAtual, setMesAtual] = useState(() => { const d = new Date(); return { ano: d.getFullYear(), mes: d.getMonth() }; });
  const [diaSelecionado, setDiaSelecionado] = useState<number | null>(null);
  const [horario, setHorario] = useState('');
  const [horariosOcupados, setHorariosOcupados] = useState<string[]>([]);
  const [mensagem, setMensagem] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState('');
  const [usuario, setUsuario] = useState<{ nome: string; email: string; telefone: string } | null>(null);

  useEffect(() => {
    fetch('/api/cliente/perfil').then(r => r.ok ? r.json() : null).then(setUsuario);
  }, []);

  const hoje = new Date();
  const diasDoMes = gerarDiasMes(mesAtual.ano, mesAtual.mes);
  const nomeMes = new Date(mesAtual.ano, mesAtual.mes).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  const dataSelecionada = diaSelecionado
    ? `${mesAtual.ano}-${String(mesAtual.mes + 1).padStart(2, '0')}-${String(diaSelecionado).padStart(2, '0')}`
    : '';

  function isDiaPassado(dia: number) {
    const d = new Date(mesAtual.ano, mesAtual.mes, dia);
    const hojeZerado = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
    return d < hojeZerado;
  }

  function isDomingo(dia: number) {
    return new Date(mesAtual.ano, mesAtual.mes, dia).getDay() === 0;
  }

  function isHoje(dia: number) {
    return mesAtual.ano === hoje.getFullYear() && mesAtual.mes === hoje.getMonth() && dia === hoje.getDate();
  }

  async function selecionarDia(dia: number) {
    setDiaSelecionado(dia);
    setHorario('');
    const dataStr = `${mesAtual.ano}-${String(mesAtual.mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
    const res = await fetch(`/api/agendamento?data=${dataStr}`);
    setHorariosOcupados(await res.json());
  }

  function navMes(dir: number) {
    setMesAtual(prev => {
      let m = prev.mes + dir;
      let a = prev.ano;
      if (m > 11) { m = 0; a++; }
      if (m < 0) { m = 11; a--; }
      return { ano: a, mes: m };
    });
    setDiaSelecionado(null);
    setHorario('');
  }

  async function handleSubmit() {
    if (!usuario || !dataSelecionada || !horario || !tipo) return;
    setErro('');
    const res = await fetch('/api/agendamento', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tipo, data: dataSelecionada, horario, nome: usuario.nome, email: usuario.email, telefone: usuario.telefone || '', mensagem }),
    });
    if (res.ok) setEnviado(true);
    else { const err = await res.json(); setErro(err.error || 'Erro ao agendar'); }
  }

  if (enviado) {
    return (
      <main className="min-h-[80vh] flex items-center justify-center px-6">
        <div className="text-center animate-fade-slide-in max-w-md">
          <div className="w-24 h-24 bg-sage-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-sage-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-warm-800 mb-3">Agendamento Enviado! 🎉</h1>
          <p className="text-warm-500 mb-2">Você receberá um email de confirmação.</p>
          <div className="mt-6 bg-cream-100 rounded-2xl p-5 text-left space-y-1">
            <p className="text-sm text-warm-600"><strong>📋</strong> {TIPOS_CONSULTA.find(t => t.id === tipo)?.nome}</p>
            <p className="text-sm text-warm-600"><strong>📅</strong> {new Date(dataSelecionada + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
            <p className="text-sm text-warm-600"><strong>🕐</strong> {horario}</p>
          </div>
          <div className="flex gap-3 mt-8 justify-center">
            <Link href="/cliente" className="bg-sage-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-sage-700 transition-all">Minha Dieta</Link>
            <Link href="/" className="border border-cream-300 text-warm-600 px-6 py-3 rounded-xl font-medium hover:bg-cream-50 transition-all">Voltar ao Site</Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 md:px-6">
      {/* Header com link para voltar ao site */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-warm-800">Agendar Consulta</h1>
          <p className="text-warm-500 mt-1">Escolha a data e horário ideais para você.</p>
        </div>
        <Link href="/" className="text-sm text-sage-600 font-medium hover:text-sage-700 px-3 py-2 rounded-lg hover:bg-sage-50 transition-all">
          ← Voltar ao Site
        </Link>
      </div>

      <div className="grid md:grid-cols-5 gap-6">
        {/* Coluna esquerda: Calendário */}
        <div className="md:col-span-3 space-y-6">
          {/* Tipo de consulta */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-cream-200 shadow-sm p-5">
            <h2 className="font-semibold text-warm-800 mb-3">Tipo de Consulta</h2>
            <div className="grid grid-cols-3 gap-2">
              {TIPOS_CONSULTA.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTipo(t.id)}
                  className={`p-3 rounded-xl border-2 text-center transition-all duration-200 min-h-[80px] flex flex-col items-center justify-center gap-1 ${
                    tipo === t.id ? 'border-sage-500 bg-sage-50' : 'border-cream-200 hover:border-sage-300'
                  }`}
                >
                  <span className="text-xl">{t.icon}</span>
                  <span className="text-xs font-semibold text-warm-800">{t.nome}</span>
                  <span className="text-xs text-warm-400">{t.duracao}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Calendário visual */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-cream-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <button onClick={() => navMes(-1)} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-cream-100 text-warm-500 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
              </button>
              <h2 className="font-semibold text-warm-800 capitalize">{nomeMes}</h2>
              <button onClick={() => navMes(1)} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-cream-100 text-warm-500 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>

            {/* Dias da semana */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {DIAS_SEMANA.map(d => (
                <div key={d} className="text-center text-xs font-medium text-warm-400 py-1">{d}</div>
              ))}
            </div>

            {/* Grid de dias */}
            <div className="grid grid-cols-7 gap-1">
              {diasDoMes.map((dia, i) => {
                if (!dia) return <div key={`empty-${i}`} />;
                const passado = isDiaPassado(dia);
                const domingo = isDomingo(dia);
                const selecionado = diaSelecionado === dia;
                const eHoje = isHoje(dia);
                const disabled = passado || domingo;

                return (
                  <button
                    key={dia}
                    onClick={() => !disabled && selecionarDia(dia)}
                    disabled={disabled}
                    className={`relative w-full aspect-square rounded-xl flex items-center justify-center text-sm font-medium transition-all duration-200 ${
                      disabled ? 'text-warm-300 cursor-not-allowed' :
                      selecionado ? 'bg-sage-600 text-white shadow-md scale-105' :
                      eHoje ? 'bg-sage-100 text-sage-700 font-bold' :
                      'text-warm-700 hover:bg-sage-50 hover:text-sage-700'
                    }`}
                  >
                    {dia}
                    {eHoje && !selecionado && <span className="absolute bottom-1 w-1 h-1 rounded-full bg-sage-500" />}
                  </button>
                );
              })}
            </div>

            {diaSelecionado && !isDomingo(diaSelecionado) && (
              <p className="mt-3 text-sm text-sage-600 font-medium text-center">
                📅 {new Date(dataSelecionada + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
            )}
          </div>

          {/* Horários */}
          {diaSelecionado && !isDomingo(diaSelecionado) && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-cream-200 shadow-sm p-5 animate-fade-slide-in">
              <h2 className="font-semibold text-warm-800 mb-4">Horários Disponíveis</h2>

              <div className="space-y-4">
                <div>
                  <p className="text-xs text-warm-400 uppercase tracking-wider mb-2">☀️ Manhã</p>
                  <div className="grid grid-cols-4 gap-2">
                    {HORARIOS_MANHA.map(h => {
                      const ocupado = horariosOcupados.includes(h);
                      return (
                        <button key={h} onClick={() => !ocupado && setHorario(h)} disabled={ocupado}
                          className={`py-3 rounded-xl text-sm font-medium transition-all min-h-[48px] ${
                            ocupado ? 'bg-cream-100 text-warm-300 line-through cursor-not-allowed' :
                            horario === h ? 'bg-sage-600 text-white shadow-sm' :
                            'bg-cream-50 border border-cream-200 text-warm-700 hover:border-sage-300 hover:bg-sage-50'
                          }`}
                        >
                          {h}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-warm-400 uppercase tracking-wider mb-2">🌙 Tarde</p>
                  <div className="grid grid-cols-4 gap-2">
                    {HORARIOS_TARDE.map(h => {
                      const ocupado = horariosOcupados.includes(h);
                      return (
                        <button key={h} onClick={() => !ocupado && setHorario(h)} disabled={ocupado}
                          className={`py-3 rounded-xl text-sm font-medium transition-all min-h-[48px] ${
                            ocupado ? 'bg-cream-100 text-warm-300 line-through cursor-not-allowed' :
                            horario === h ? 'bg-sage-600 text-white shadow-sm' :
                            'bg-cream-50 border border-cream-200 text-warm-700 hover:border-sage-300 hover:bg-sage-50'
                          }`}
                        >
                          {h}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Coluna direita: Resumo */}
        <div className="md:col-span-2">
          <div className="sticky top-24 space-y-4">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-cream-200 shadow-sm p-5">
              <h2 className="font-semibold text-warm-800 mb-4">Resumo</h2>

              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-sage-100 flex items-center justify-center text-sm">{tipo ? TIPOS_CONSULTA.find(t => t.id === tipo)?.icon : '📋'}</span>
                  <div>
                    <p className="text-warm-400 text-xs">Consulta</p>
                    <p className="text-warm-800 font-medium">{tipo ? TIPOS_CONSULTA.find(t => t.id === tipo)?.nome : 'Selecione...'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-sage-100 flex items-center justify-center text-sm">📅</span>
                  <div>
                    <p className="text-warm-400 text-xs">Data</p>
                    <p className="text-warm-800 font-medium">{dataSelecionada ? new Date(dataSelecionada + 'T12:00:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' }) : 'Selecione...'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-sage-100 flex items-center justify-center text-sm">🕐</span>
                  <div>
                    <p className="text-warm-400 text-xs">Horário</p>
                    <p className="text-warm-800 font-medium">{horario || 'Selecione...'}</p>
                  </div>
                </div>

                {tipo && (
                  <div className="pt-3 border-t border-cream-100 flex justify-between items-center">
                    <span className="text-warm-500">Valor</span>
                    <span className="text-lg font-bold text-sage-700">{TIPOS_CONSULTA.find(t => t.id === tipo)?.preco}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Mensagem opcional */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-cream-200 shadow-sm p-5">
              <label className="block text-sm font-medium text-warm-600 mb-2">Observação (opcional)</label>
              <textarea
                value={mensagem}
                onChange={e => setMensagem(e.target.value)}
                placeholder="Algum detalhe que gostaria de informar?"
                className="w-full border border-cream-200 rounded-xl px-3 py-2.5 text-sm bg-cream-50 h-20 resize-none focus-visible:ring-2 focus-visible:ring-sage-400"
              />
            </div>

            {erro && <p className="text-danger text-sm bg-red-50 p-3 rounded-xl">{erro}</p>}

            <button
              onClick={handleSubmit}
              disabled={!tipo || !dataSelecionada || !horario}
              className="w-full bg-sage-600 text-white py-4 rounded-2xl font-semibold hover:bg-sage-700 active:scale-[0.98] transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed min-h-[56px]"
            >
              Confirmar Agendamento
            </button>

            <p className="text-center text-xs text-warm-400">
              Agendando como <strong>{usuario?.nome || '...'}</strong> ({usuario?.email || '...'})
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
