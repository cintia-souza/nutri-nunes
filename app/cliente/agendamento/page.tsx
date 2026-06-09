'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { hojeLocal, formatarDataExtenso, formatarDataCurta, montarData } from '@/lib/datas';

const HORARIOS = [
  { periodo: 'Manhã', slots: ['08:00', '09:00', '10:00', '11:00'] },
  { periodo: 'Tarde', slots: ['14:00', '15:00', '16:00', '17:00'] },
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
  const [usuario, setUsuario] = useState<{ nome: string; email: string; telefone: string } | null>(null);

  useEffect(() => {
    fetch('/api/cliente/perfil').then(r => r.ok ? r.json() : null).then(setUsuario);
  }, []);

  // Gera array do calendário
  const calendario = useMemo(() => {
    const primeiro = new Date(ano, mes, 1).getDay();
    const total = new Date(ano, mes + 1, 0).getDate();
    const celulas: (number | null)[] = [];
    for (let i = 0; i < primeiro; i++) celulas.push(null);
    for (let i = 1; i <= total; i++) celulas.push(i);
    while (celulas.length < 42) celulas.push(null);
    return celulas;
  }, [ano, mes]);

  const hojeStr = hojeLocal();

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
    const date = new Date(ano, mes, d);
    if (date.getDay() === 0) return true;
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
    setErro('');
    try {
      const res = await fetch('/api/agendamento', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo, data: dataSel, horario, nome: usuario.nome, email: usuario.email, telefone: usuario.telefone || '', mensagem }),
      });
      if (res.ok) setEnviado(true);
      else { const e = await res.json(); setErro(e.error || 'Erro ao agendar.'); }
    } catch { setErro('Erro de conexão. Tente novamente.'); }
  }

  // --- TELA DE SUCESSO ---
  if (enviado) {
    return (
      <main className="min-h-[80vh] flex items-center justify-center p-6">
        <div className="text-center max-w-sm animate-fade-slide-in">
          <div className="w-16 h-16 bg-sage-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <svg className="w-8 h-8 text-sage-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          </div>
          <h1 className="text-xl font-bold text-warm-800 mb-2">Agendamento Enviado!</h1>
          <p className="text-warm-500 text-sm mb-6">Você receberá um email quando for confirmado.</p>
          <div className="bg-cream-100 rounded-xl p-4 text-left text-sm text-warm-600 space-y-1 mb-6">
            <p><strong>{TIPOS.find(t => t.id === tipo)?.nome}</strong></p>
            <p>{formatarDataExtenso(dataSel)} às {horario}</p>
          </div>
          <div className="flex gap-3 justify-center">
            <Link href="/cliente" className="bg-sage-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-sage-700">Minha Dieta</Link>
            <Link href="/" className="border border-cream-300 text-warm-600 px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-cream-50">Site</Link>
          </div>
        </div>
      </main>
    );
  }

  // --- PÁGINA PRINCIPAL ---
  return (
    <main className="max-w-lg mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-warm-800">Agendar Consulta</h1>
        <Link href="/" className="text-xs text-sage-600 hover:text-sage-700 font-medium">← Site</Link>
      </div>

      {/* TIPO */}
      <section className="mb-5">
        <p className="text-xs font-semibold text-warm-500 uppercase tracking-wider mb-2">Tipo de consulta</p>
        <div className="flex gap-2">
          {TIPOS.map(t => (
            <button key={t.id} onClick={() => setTipo(t.id)}
              className={`flex-1 py-3 rounded-xl text-center border-2 transition-all ${tipo === t.id ? 'border-sage-500 bg-sage-50' : 'border-cream-200 hover:border-sage-300'}`}>
              <span className="block text-lg">{t.icon}</span>
              <span className="block text-[11px] font-semibold text-warm-800 mt-0.5">{t.nome.split(' ')[0]}</span>
              <span className="block text-[10px] text-sage-600">{t.preco}</span>
            </button>
          ))}
        </div>
      </section>

      {/* CALENDÁRIO */}
      <section className="bg-white rounded-2xl border border-cream-200 shadow-sm p-4 mb-5">
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => podeMesAnterior() && mudarMes(-1)} disabled={!podeMesAnterior()}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-cream-100 disabled:opacity-30 disabled:cursor-not-allowed text-warm-600">
            ‹
          </button>
          <span className="text-sm font-semibold text-warm-800 capitalize">{nomeMes}</span>
          <button onClick={() => mudarMes(1)}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-cream-100 text-warm-600">
            ›
          </button>
        </div>

        {/* Cabeçalho */}
        <div className="grid grid-cols-7 text-center mb-1">
          {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((l, i) => (
            <span key={i} className={`text-[10px] font-bold py-1 ${i === 0 ? 'text-red-300' : 'text-warm-400'}`}>{l}</span>
          ))}
        </div>

        {/* Dias */}
        <div className="grid grid-cols-7 text-center">
          {calendario.map((d, i) => {
            if (d === null) return <span key={i} className="h-9" />;
            const off = diaDisabled(d);
            const sel = dia === d;
            const ehHoje = montarData(ano, mes, d) === hojeStr;
            return (
              <button
                key={i}
                disabled={off}
                onClick={() => clickDia(d)}
                className={`h-9 w-full rounded-lg text-xs font-medium transition-all
                  ${off ? 'text-warm-300 cursor-not-allowed' : ''}
                  ${sel ? 'bg-sage-600 text-white font-bold' : ''}
                  ${!off && !sel && ehHoje ? 'ring-2 ring-sage-400 text-sage-700 font-bold' : ''}
                  ${!off && !sel && !ehHoje ? 'text-warm-700 hover:bg-sage-50' : ''}
                `}
              >
                {d}
              </button>
            );
          })}
        </div>

        {dia && !diaDisabled(dia) && (
          <div className="mt-3 text-center">
            <span className="inline-block bg-sage-50 text-sage-700 text-xs font-medium px-3 py-1 rounded-lg">
              {formatarDataExtenso(dataSel)}
            </span>
          </div>
        )}
      </section>

      {/* HORÁRIOS */}
      {dia && !diaDisabled(dia) && (
        <section className="bg-white rounded-2xl border border-cream-200 shadow-sm p-4 mb-5 animate-fade-slide-in">
          <p className="text-xs font-semibold text-warm-500 uppercase tracking-wider mb-3">Horário disponível</p>
          {HORARIOS.map(grupo => (
            <div key={grupo.periodo} className="mb-3 last:mb-0">
              <p className="text-[10px] text-warm-400 uppercase mb-1.5">{grupo.periodo}</p>
              <div className="grid grid-cols-4 gap-1.5">
                {grupo.slots.map(h => {
                  const occ = ocupados.includes(h);
                  const sel = horario === h;
                  return (
                    <button key={h} disabled={occ} onClick={() => setHorario(h)}
                      className={`py-2 rounded-lg text-xs font-medium transition-all
                        ${occ ? 'bg-cream-100 text-warm-300 line-through cursor-not-allowed' : ''}
                        ${sel ? 'bg-sage-600 text-white' : ''}
                        ${!occ && !sel ? 'bg-cream-50 text-warm-700 hover:bg-sage-50 border border-cream-200' : ''}
                      `}
                    >{h}</button>
                  );
                })}
              </div>
            </div>
          ))}
        </section>
      )}

      {/* CONFIRMAR */}
      {horario && tipo && (
        <section className="animate-fade-slide-in space-y-4">
          <div className="bg-white rounded-2xl border border-cream-200 shadow-sm p-4">
            <label className="text-xs font-medium text-warm-600 block mb-1.5">Observação (opcional)</label>
            <textarea value={mensagem} onChange={e => setMensagem(e.target.value)} rows={2}
              className="w-full border border-cream-200 rounded-lg px-3 py-2 text-sm bg-cream-50 resize-none focus-visible:ring-2 focus-visible:ring-sage-400"
              placeholder="Algo que gostaria de informar?" />
          </div>

          <div className="bg-sage-50 border border-sage-200 rounded-2xl p-4 text-sm text-sage-800 space-y-1">
            <p className="font-semibold">Resumo</p>
            <p>{TIPOS.find(t => t.id === tipo)?.icon} {TIPOS.find(t => t.id === tipo)?.nome} — {TIPOS.find(t => t.id === tipo)?.preco}</p>
            <p>📅 {formatarDataCurta(dataSel)} às {horario}</p>
            <p className="text-sage-600 text-xs">👤 {usuario?.nome}</p>
          </div>

          {erro && <p className="text-sm text-danger bg-red-50 rounded-xl p-3">{erro}</p>}

          <button onClick={confirmar}
            className="w-full bg-sage-600 text-white py-3.5 rounded-xl font-semibold hover:bg-sage-700 active:scale-[0.98] transition-all shadow-sm min-h-[52px]">
            Confirmar Agendamento
          </button>
        </section>
      )}
    </main>
  );
}
