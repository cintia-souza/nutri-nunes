'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FileText, ArrowLeft, CheckCircle2 } from 'lucide-react';

interface Pergunta { pergunta: string; tipo: 'TEXTO' | 'CHECKBOX'; opcoes?: string[]; }

export default function FormularioClientePage() {
  const { id } = useParams();
  const router = useRouter();
  const [form, setForm] = useState<{ id: string; titulo: string; perguntas: Pergunta[] } | null>(null);
  const [respostas, setRespostas] = useState<Record<number, string | string[]>>({});
  const [enviado, setEnviado] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/formulario?id=${id}`).then(r => r.ok ? r.json() : null).then(d => {
      if (d?.perguntas) {
        setForm(d);
        const init: Record<number, string | string[]> = {};
        d.perguntas.forEach((p: Pergunta, i: number) => { init[i] = p.tipo === 'CHECKBOX' ? [] : ''; });
        setRespostas(init);
      }
      setLoading(false);
    });
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    const payload = form.perguntas.map((p, i) => ({ pergunta: p.pergunta, tipo: p.tipo, resposta: respostas[i] }));
    const res = await fetch('/api/cliente/formularios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ formularioId: form.id, respostas: payload }),
    });
    if (res.ok) setEnviado(true);
  }

  function toggleCheckbox(idx: number, opcao: string) {
    setRespostas(prev => {
      const current = (prev[idx] as string[]) || [];
      return { ...prev, [idx]: current.includes(opcao) ? current.filter(o => o !== opcao) : [...current, opcao] };
    });
  }

  if (loading) return <div className="min-h-[50vh] flex items-center justify-center"><div className="w-8 h-8 border-3 border-sage-300 border-t-sage-600 rounded-full animate-spin" /></div>;
  if (!form) return <div className="min-h-[50vh] flex items-center justify-center text-warm-500">Formulário não encontrado.</div>;

  if (enviado) return (
    <div className="min-h-[50vh] flex items-center justify-center px-6">
      <div className="text-center">
        <CheckCircle2 className="w-16 h-16 mx-auto mb-4" style={{ color: '#1a8558' }} />
        <h1 className="text-2xl font-bold text-warm-800 mb-2">Respostas enviadas!</h1>
        <p className="text-warm-500 mb-6">Sua nutricionista receberá suas respostas.</p>
        <button onClick={() => router.push('/cliente')} className="px-6 py-3 rounded-xl text-white font-semibold" style={{ background: 'linear-gradient(135deg,#1a8558,#0f3d29)' }}>
          Voltar ao início
        </button>
      </div>
    </div>
  );

  return (
    <main className="max-w-2xl mx-auto px-4 py-8 md:px-6">
      <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-warm-500 hover:text-warm-700 mb-6">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </button>

      <div className="mb-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#6366f115' }}>
          <FileText className="w-5 h-5" style={{ color: '#6366f1' }} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-warm-800">{form.titulo}</h1>
          <p className="text-warm-500 text-xs">Responda as perguntas abaixo.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {form.perguntas.map((p, i) => (
          <div key={i} className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-cream-200 shadow-sm">
            <p className="font-medium text-warm-800 mb-3 text-sm">{i + 1}. {p.pergunta}</p>

            {p.tipo === 'TEXTO' ? (
              <textarea value={respostas[i] as string} onChange={e => setRespostas(prev => ({ ...prev, [i]: e.target.value }))}
                rows={2} placeholder="Sua resposta..."
                className="w-full border border-cream-300 rounded-xl px-3 py-2.5 bg-cream-50 text-warm-800 text-sm resize-none" />
            ) : (
              <div className="space-y-2">
                {p.opcoes?.map(opcao => (
                  <label key={opcao} className="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" checked={(respostas[i] as string[])?.includes(opcao)}
                      onChange={() => toggleCheckbox(i, opcao)}
                      className="w-4 h-4 rounded border-cream-300" />
                    <span className="text-sm text-warm-700 group-hover:text-warm-900">{opcao}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        ))}

        <button type="submit" className="w-full text-white py-3.5 rounded-xl font-semibold transition-all"
          style={{ background: 'linear-gradient(135deg,#1a8558,#0f3d29)' }}>
          Enviar Respostas
        </button>
      </form>
    </main>
  );
}
