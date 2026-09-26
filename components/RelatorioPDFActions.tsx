'use client';

import { useState } from 'react';
import { FileDown, Mail, Loader2, CheckCircle } from 'lucide-react';

interface Props {
  clienteId: string;
  clienteEmail: string;
  clienteNome: string;
}

export default function RelatorioPDFActions({ clienteId, clienteEmail, clienteNome }: Props) {
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState('');

  const [baixando, setBaixando] = useState(false);
  const [erroPdf, setErroPdf] = useState('');

  async function handlePrint() {
    setBaixando(true);
    setErroPdf('');
    try {
      const res = await fetch(`/api/admin/relatorio/pdf?clienteId=${clienteId}`);
      if (!res.ok) throw new Error(`Erro ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `relatorio-${clienteNome.toLowerCase().replace(/\s+/g, '-')}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setErroPdf('Erro ao gerar PDF. Tente novamente.');
      setTimeout(() => setErroPdf(''), 4000);
    } finally {
      setBaixando(false);
    }
  }

  async function handleEmail() {
    setEnviando(true);
    setErro('');
    setEnviado(false);
    try {
      const res = await fetch('/api/admin/relatorio/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clienteId }),
      });
      if (!res.ok) throw new Error();
      setEnviado(true);
      setTimeout(() => setEnviado(false), 4000);
    } catch {
      setErro('Erro ao enviar. Tente novamente.');
      setTimeout(() => setErro(''), 4000);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="flex items-center gap-2 print-hidden">
      {/* Botão PDF */}
      <button
        onClick={handlePrint}
        disabled={baixando}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm border border-cream-200 text-warm-600 hover:bg-cream-50 min-h-[40px] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {baixando ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
        {baixando ? 'Gerando PDF...' : 'Baixar PDF'}
      </button>

      {/* Botão Email */}
      <button
        onClick={handleEmail}
        disabled={enviando}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm text-white min-h-[40px] shadow-md hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        style={{ background: 'linear-gradient(135deg,#3b82f6,#1d4ed8)' }}
        title="Envia o relatório para o seu email"
      >
        {enviando ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : enviado ? (
          <CheckCircle className="w-4 h-4" />
        ) : (
          <Mail className="w-4 h-4" />
        )}
        {enviando ? 'Enviando...' : enviado ? 'Enviado!' : 'Enviar por email'}
      </button>

      {(erro || erroPdf) && (
        <span className="text-xs text-red-500 font-medium">{erro || erroPdf}</span>
      )}
    </div>
  );
}
