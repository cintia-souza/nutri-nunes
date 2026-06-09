/**
 * Utilitários de data — sempre trabalha com strings YYYY-MM-DD
 * para evitar problemas de fuso horário entre server (UTC) e client (local).
 */

/** Retorna a data de hoje no formato YYYY-MM-DD no fuso de São Paulo */
export function hojeLocal(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });
}

/** Formata YYYY-MM-DD para exibição por extenso em pt-BR */
export function formatarDataExtenso(dataStr: string): string {
  const [ano, mes, dia] = dataStr.split('-').map(Number);
  const date = new Date(ano, mes - 1, dia, 12, 0, 0);
  return date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
}

/** Formata YYYY-MM-DD para exibição curta em pt-BR */
export function formatarDataCurta(dataStr: string): string {
  const [ano, mes, dia] = dataStr.split('-').map(Number);
  const date = new Date(ano, mes - 1, dia, 12, 0, 0);
  return date.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' });
}

/** Converte dia/mes/ano para string YYYY-MM-DD */
export function montarData(ano: number, mes: number, dia: number): string {
  return `${ano}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
}
