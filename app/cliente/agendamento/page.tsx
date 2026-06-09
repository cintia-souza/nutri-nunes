'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { hojeLocal, formatarDataExtenso, formatarDataCurta, montarData } from '@/lib/datas';

const SLOTS = [
  { periodo: 'Manhã', icon: '☀️', horarios: ['08:00', '09:00', '10:00', '11:00'] },
  { periodo: 'Tarde', icon: '🌤️', horarios: ['14:00', '15:00', '16:00', '17:00'] },
];

const TIPOS = [
  { id: 'primeira', nome: 'Primeira Consulta', duracao: '60 min', preco: 'R$ 250', icon: '🩺' },
  { id: 'retorno', nome: 'Retorno', duracao: '30 min', preco: 'R$ 150', icon: '🔄' },
  { id: 'online', nome: 'Consulta Online', duracao: '45 min', preco: 'R$ 200', icon: '💻' },
];

export default function AgendamentoPage() {
  const [tipo, setTipo] = useState('');
  const [ano, setAno] = useState(new Date().getFullYear());
  const [mes, setMes] = useState(new Date().getMonth());
  const [dia, setDia] = useState<number | null>(null);
  const [horario, setHorario] = useState('');
  const [ocupados, setOcupados] = useState<string[]>([]);
  const [mensagem, setMensagem] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const [usuario, setUsuario] = useState<{ nome: string; email: string; telefone: string } | null>(null);

  const hojeStr = hojeLocal();

  useEffect(() => {
    fetch('/api/cliente/perfil').then(r => r.ok ? r.json() : null).then(setUsuario);
  }, []);

  const calendario = useMemo(() => {
    const primeiro = new Date(ano, mes, 1).getDay();
    const total = new Date(ano, mes + 1, 0).getDate();
    const celulas: (number | null)[] = [];
    for (let i = 0; i < primeiro; i++) celulas.push(null);
    for (let i = 1; i <= total; i++) celulas.push(i);
    while (celulas.length < 42) celulas.push(null);
    return celulas;
  }, [ano, mes]);

  const dataSel = dia ? montarData(ano, mes, dia) : '';
  const nomeMes = new Date(ano, mes).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  function podeMesAnterior() {
    const [aH, mH] = hojeStr.split('-').map(Number);
    return !(ano === aH && mes === mH - 1);
  }

  function mudarMes(dir: number) {
    let m = mes + dir, a = ano;
    if (m > 11) { m = 0; a++; }
    if (m < 0) { m = 11; a--; }
    setAno(a); setMes(m); setDia(null); setHorario('');
  }

  function diaDisabled(d: number) {
    if (new Date(ano, mes, d).getDay() === 0) return true;
    return montarData(ano, mes, d) < hojeStr;
  }

  async function clickDia(d: number) {
    setDia(d); setHorario('');
    const str = montarData(ano, mes, d);
    try {
      const res = await fetch(`/api/agendamento?data=${str}`);
      if (res.ok) setOcupados(await res.json());
      else setOcupados([]);
    } catch { setOcupados([]); }
  }

  async function confirmar() {
    if (!usuario || !dataSel || !horario || !tipo) return;
    setErro(''); setLoading(true);
    try {
      const res = await fetch('/api/agendamento', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo, data: dataSel, horario, nome: usuario.nome, email: usuario.email, telefone: usuario.telefone || '', mensagem }),
      });
      if (res.ok) setEnviado(true);
      else { const e = await res.json(); setErro(e.error || 'Erro ao agendar.'); }
    } catch { setErro('Erro de conexão. Tente novamente.'); }
    setLoading(false);
  }

  // ─── TELA DE SUCESSO ───
  if (enviado) {
    return (
      <main className="min-h-[80vh] flex items-center justify-center p-6">
        <div className="text-center max-w-sm animate-fade-slide-in">
          <div className="w-20 h-20 bg-sage-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-sage-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          </div>
          <h1 className="text-2xl font-bold text-warm-800 mb-2">Agendamento Enviado!</h1>
          <p className="text-warm-500 text-sm mb-6">Você receberá um email quando for confirmado.</p>
          <div className="bg-cream-100 rounded-2xl p-5 text-left text-sm text-warm-600 space-y-1.5 mb-8">
            <p><strong>{TIPOS.find(t => t.id === tipo)?.nome}</strong> — {TIPOS.find(t => t.id === tipo)?.preco}</p>
            <p>📅 {formatarDataExtenso(dataSel)} às {horario}</p>
            <p className="text-warm-400 text-xs">👤 {usuario?.nome}</p>
          </div>
          <div className="flex gap-3 justify-center">
            <Link href="/cliente" className="bg-sage-600 text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-sage-700 transition-all">Minha Dieta</Link>
            <Link href="/" className="border border-cream-300 text-warm-600 px-6 py-3 rounded-xl text-sm font-medium hover:bg-cream-50 transition-all">Voltar ao Site</Link>
          </div>
        </div>
      </main>
    );
  }

  // ─── PÁGINA PRINCIPAL ───
  return (
    <main className="max-w-5xl mx-auto px-4 py-8 md:px-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-warm-800">Agendar Consulta</h1>
          <p className="text-warm-500 text-sm mt-1">Selecione o tipo, data e horário.</p>
        </div>
        <Link href="/" className="text-sm text-sage-600 font-medium hover:text-sage-700 px-3 py-2 rounded-lg hover:bg-sage-50 transition-all hidden md:inline-flex items-center gap-1">
          ← Voltar ao site
        </Link>
      </div>

      {/* Tipo de consulta */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {TIPOS.map(t => (
          <button
            key={t.id}
            onClick={() => setTipo(t.id)}
            className={`relative p-4 rounded-2xl border-2 text-center transition-all duration-200 ${
              tipo === t.id
                ? 'border-sage-500 bg-sage-50 shadow-sm'
                : 'border-cream-200 bg-white hover:border-sage-300 hover:shadow-sm'
            }`}
          >
            <span className="text-2xl block mb-1">{t.icon}</span>
            <span className="text-xs font-semibold text-warm-800 block">{t.nome}</span>
            <span className="text-[10px] text-warm-400 block mt-0.5">{t.duracao}</span>
            <span className="text-xs font-bold text-sage-700 block mt-1">{t.preco}</span>
            {tipo === t.id && (
              <span className="absolute top-2 right-2 w-5 h-5 bg-sage-600 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Grid principal: Calendário + Horários */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* ─── LADO ESQUERDO: CALENDÁRIO (5 cols) ─── */}
        <div className="md:col-span-5">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-cream-200">
            {/* Navegação mês */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => podeMesAnterior() && mudarMes(-1)}
                disabled={!podeMesAnterior()}
                className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-cream-100 disabled:opacity-30 disabled:cursor-not-allowed text-warm-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
              </button>
              <h3 className="text-sm font-bold text-warm-800 capitalize">{nomeMes}</h3>
              <button
                onClick={() => mudarMes(1)}
                className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-cream-100 text-warm-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>

            {/* Cabeçalho semana */}
            <div className="grid grid-cols-7 mb-1">
              {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((l, i) => (
                <div key={i} className={`text-center text-[10px] font-bold uppercase py-1.5 ${i === 0 ? 'text-red-400' : 'text-warm-400'}`}>{l}</div>
              ))}
            </div>

            {/* Dias */}
            <div className="grid grid-cols-7 gap-0.5">
              {calendario.map((d, i) => {
                if (d === null) return <div key={`e${i}`} className="h-10" />;
                const off = diaDisabled(d);
                const sel = dia === d;
                const ehHoje = montarData(ano, mes, d) === hojeStr;

                return (
                  <button
                    key={`d${i}`}
                    disabled={off}
                    onClick={() => clickDia(d)}
                    className={`h-10 rounded-xl text-sm font-medium transition-all duration-150 relative
                      ${off ? 'text-warm-300 cursor-not-allowed' : ''}
                      ${sel ? 'bg-sage-600 text-white font-bold shadow-md shadow-sage-200' : ''}
                      ${!off && !sel && ehHoje ? 'bg-sage-100 text-sage-800 font-bold' : ''}
                      ${!off && !sel && !ehHoje ? 'text-warm-700 hover:bg-sage-50' : ''}
                    `}
                  >
                    {d}
                    {ehHoje && !sel && <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-sage-500" />}
                  </button>
                );
              })}
            </div>

            {/* Data selecionada */}
            {dia && !diaDisabled(dia) && (
              <div className="mt-4 text-center animate-fade-slide-in">
                <span className="inline-block bg-sage-50 text-sage-700 text-xs font-medium px-4 py-1.5 rounded-full border border-sage-200">
                  📅 {formatarDataExtenso(dataSel)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ─── LADO DIREITO: HORÁRIOS + CONFIRMAÇÃO (7 cols) ─── */}
        <div className="md:col-span-7">
          {!dia || diaDisabled(dia) ? (
            /* Estado vazio */
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-cream-200 flex flex-col items-center justify-center h-full min-h-[300px] text-center">
              <div className="w-16 h-16 bg-cream-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">📅</span>
              </div>
              <h3 className="font-semibold text-warm-700 mb-1">Selecione uma data</h3>
              <p className="text-warm-400 text-sm">Clique em um dia no calendário para ver os horários disponíveis.</p>
            </div>
          ) : (
            /* Horários + Confirmação */
            <div className="space-y-5 animate-fade-slide-in">
              {/* Horários */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-cream-200">
                <h3 className="text-sm font-bold text-warm-800 mb-4">
                  Horários para {formatarDataCurta(dataSel)}
                </h3>

                {SLOTS.map(grupo => (
                  <div key={grupo.periodo} className="mb-4 last:mb-0">
                    <p className="text-[11px] font-semibold text-warm-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <span>{grupo.icon}</span> {grupo.periodo}
                    </p>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                      {grupo.horarios.map(h => {
                        const occ = ocupados.includes(h);
                        const sel = horario === h;
                        return (
                          <button
                            key={h}
                            disabled={occ}
                            onClick={() => setHorario(h)}
                            className={`py-3 rounded-xl text-sm font-medium transition-all duration-200 border
                              ${occ ? 'bg-cream-100 text-warm-300 border-cream-200 cursor-not-allowed line-through opacity-60' : ''}
                              ${sel ? 'bg-sage-600 text-white border-sage-600 shadow-md shadow-sage-200/50 scale-[1.02]' : ''}
                              ${!occ && !sel ? 'bg-white text-warm-700 border-cream-200 hover:bg-sage-50 hover:border-sage-300 hover:shadow-sm' : ''}
                            `}
                          >
                            {h}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {ocupados.length === SLOTS.flatMap(s => s.horarios).length && (
                  <p className="text-sm text-warm-400 text-center py-4 bg-cream-50 rounded-xl mt-3">
                    😔 Todos os horários estão ocupados neste dia.
                  </p>
                )}
              </div>

              {/* Observação */}
              {horario && (
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-cream-200 animate-fade-slide-in">
                  <label className="text-xs font-semibold text-warm-600 block mb-2">Observação (opcional)</label>
                  <textarea
                    value={mensagem}
                    onChange={e => setMensagem(e.target.value)}
                    rows={2}
                    placeholder="Algo que gostaria de informar antes da consulta?"
                    className="w-full border border-cream-200 rounded-xl px-4 py-3 text-sm bg-cream-50 resize-none placeholder-warm-400 focus-visible:ring-2 focus-visible:ring-sage-400 focus-visible:border-sage-400 transition-all"
                  />
                </div>
              )}

              {/* Resumo + CTA */}
              {horario && tipo && (
                <div className="animate-fade-slide-in space-y-4">
                  {/* Resumo */}
                  <div className="bg-sage-50 border border-sage-200 rounded-2xl p-5">
                    <h4 className="text-xs font-bold text-sage-700 uppercase tracking-wider mb-3">Resumo do Agendamento</h4>
                    <div className="space-y-2 text-sm text-sage-800">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm text-sm">{TIPOS.find(t => t.id === tipo)?.icon}</span>
                        <div>
                          <p className="font-medium">{TIPOS.find(t => t.id === tipo)?.nome}</p>
                          <p className="text-sage-600 text-xs">{TIPOS.find(t => t.id === tipo)?.duracao} — {TIPOS.find(t => t.id === tipo)?.preco}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm text-sm">📅</span>
                        <p className="font-medium">{formatarDataCurta(dataSel)} às {horario}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm text-sm">👤</span>
                        <p className="text-sage-600 text-xs">{usuario?.nome} ({usuario?.email})</p>
                      </div>
                    </div>
                  </div>

                  {/* Erro */}
                  {erro && (
                    <div className="bg-red-50 border border-red-200 text-danger rounded-xl p-3.5 text-sm font-medium animate-fade-slide-in">
                      ⚠️ {erro}
                    </div>
                  )}

                  {/* Botão CTA */}
                  <button
                    onClick={confirmar}
                    disabled={loading}
                    className="w-full bg-sage-600 hover:bg-sage-700 text-white font-semibold py-4 rounded-xl shadow-lg shadow-sage-200/50 transition-all duration-200 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed min-h-[56px] text-base"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" /><path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" className="opacity-75" /></svg>
                        Agendando...
                      </span>
                    ) : (
                      '✓ Confirmar Agendamento'
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
