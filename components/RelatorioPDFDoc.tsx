import React from 'react';
import {
  Document, Page, Text, View, StyleSheet, Font,
} from '@react-pdf/renderer';
import { type DadosAnalise, type Analise } from '@/lib/analise-relatorio';

// ── Fonte com suporte completo a UTF-8 / caracteres latinos ──────────────────
Font.register({
  family: 'Roboto',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Me5Q.ttf', fontWeight: 400 },
    { src: 'https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmWUlvAw.ttf', fontWeight: 700 },
  ],
});

// Sanitiza caracteres que a fonte não suporta
function t(str: string | null | undefined): string {
  if (!str) return '';
  return str
    .replace(/\u2014/g, '-')  // em dash —
    .replace(/\u2013/g, '-')  // en dash –
    .replace(/\u2019/g, "'") // ’
    .replace(/\u201c/g, '"') // “
    .replace(/\u201d/g, '"'); // ”
}

// ── Paleta ────────────────────────────────────────────────────────────────────
const C = {
  verde:      '#1a8558',
  verdeClaro: '#f0fdf4',
  verdeBorda: '#bbf7d0',
  azul:       '#1d4ed8',
  azulClaro:  '#eff6ff',
  amarelo:    '#d97706',
  amareloClaro: '#fffbeb',
  vermelho:   '#dc2626',
  vermelhoClaro: '#fef2f2',
  cinza1:     '#28251f',
  cinza2:     '#5c5650',
  cinza3:     '#a8a099',
  cinza4:     '#f5f3ef',
  cinza5:     '#ede9e2',
  branco:     '#ffffff',
  escuro:     '#0f3d29',
};

// ── Estilos ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  page: {
    fontFamily: 'Roboto',
    backgroundColor: C.branco,
    paddingBottom: 60,
  },
  // Header
  header: {
    backgroundColor: C.escuro,
    padding: '32 40 28 40',
  },
  headerLabel: {
    fontSize: 8,
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  headerNome: {
    fontSize: 22,
    fontFamily: 'Roboto',
    fontWeight: 700,
    color: C.branco,
    marginBottom: 4,
  },
  headerSub: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.65)',
    marginBottom: 14,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 99,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 10,
    color: C.branco,
    fontWeight: 700,
  },
  // Métricas rápidas
  metricas: {
    flexDirection: 'row',
    backgroundColor: C.cinza4,
    borderBottomWidth: 1,
    borderBottomColor: C.cinza5,
  },
  metricaItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRightWidth: 1,
    borderRightColor: C.cinza5,
  },
  metricaValor: {
    fontSize: 20,
    fontWeight: 700,
    marginBottom: 3,
  },
  metricaLabel: {
    fontSize: 8,
    color: C.cinza3,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  // Corpo
  body: {
    paddingHorizontal: 40,
    paddingTop: 24,
  },
  // Seções
  secaoTitulo: {
    fontSize: 11,
    fontWeight: 700,
    color: C.cinza1,
    marginBottom: 8,
    marginTop: 20,
  },
  // Resumo
  resumoBox: {
    backgroundColor: C.verdeClaro,
    borderLeftWidth: 4,
    borderLeftColor: C.verde,
    borderRadius: 6,
    padding: 14,
    marginBottom: 20,
  },
  resumoTexto: {
    fontSize: 10,
    color: '#166947',
    lineHeight: 1.7,
  },
  // Cards insight
  card: {
    borderRadius: 6,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
  },
  cardTitulo: {
    fontSize: 10,
    fontWeight: 700,
    color: C.cinza1,
    marginBottom: 4,
  },
  cardTexto: {
    fontSize: 9.5,
    color: C.cinza2,
    lineHeight: 1.6,
  },
  // Tabela grupos
  tabelaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: C.cinza5,
  },
  tabelaLabel: {
    fontSize: 9.5,
    color: C.cinza2,
    width: '30%',
  },
  tabelaBarraContainer: {
    width: '50%',
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 99,
    marginHorizontal: 8,
  },
  tabelaBarraFill: {
    height: 6,
    borderRadius: 99,
  },
  tabelaDiff: {
    fontSize: 9.5,
    fontWeight: 700,
    width: '12%',
    textAlign: 'right',
  },
  tabelaAtual: {
    fontSize: 9.5,
    color: C.cinza3,
    width: '8%',
    textAlign: 'right',
  },
  // Próximos passos
  passoRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 6,
    alignItems: 'flex-start',
  },
  passoSeta: {
    fontSize: 10,
    color: C.verde,
    fontWeight: 700,
    marginTop: 1,
  },
  passoTexto: {
    fontSize: 9.5,
    color: C.cinza2,
    lineHeight: 1.6,
    flex: 1,
  },
  // Conclusão
  conclusaoBox: {
    backgroundColor: C.cinza4,
    borderRadius: 6,
    padding: 14,
    marginTop: 8,
  },
  conclusaoTexto: {
    fontSize: 9.5,
    color: C.cinza2,
    lineHeight: 1.7,
  },
  // Divisor
  divisor: {
    borderBottomWidth: 1,
    borderBottomColor: C.cinza5,
    marginVertical: 16,
  },
  // Footer
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: C.cinza5,
    paddingHorizontal: 40,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: C.branco,
  },
  footerTexto: {
    fontSize: 8,
    color: C.cinza3,
  },
  // Objetivo
  objetivoBox: {
    backgroundColor: C.azulClaro,
    borderLeftWidth: 3,
    borderLeftColor: C.azul,
    borderRadius: 4,
    padding: 10,
    marginBottom: 16,
  },
  objetivoTexto: {
    fontSize: 9.5,
    color: '#1e40af',
  },
  // Grid 2 colunas
  grid2: {
    flexDirection: 'row',
    gap: 12,
  },
  col: {
    flex: 1,
  },
  // Nota rodapé tabela
  notaTabela: {
    fontSize: 8,
    color: C.cinza3,
    marginTop: 4,
  },
});

// ── Componentes auxiliares ────────────────────────────────────────────────────

function CardInsight({ emoji, titulo, descricao, nivel }: {
  emoji: string; titulo: string; descricao: string;
  nivel: 'positivo' | 'neutro' | 'atencao';
}) {
  const cor = nivel === 'positivo' ? C.verde : nivel === 'atencao' ? C.amarelo : '#6b7280';
  const bg  = nivel === 'positivo' ? C.verdeClaro : nivel === 'atencao' ? C.amareloClaro : C.cinza4;
  return (
    <View style={[s.card, { backgroundColor: bg, borderLeftColor: cor }]}>
      <Text style={s.cardTitulo}>{t(titulo)}</Text>
      <Text style={s.cardTexto}>{t(descricao)}</Text>
    </View>
  );
}

function BarraGrupo({ label, ini, atu }: { label: string; ini: number; atu: number }) {
  const diff = atu - ini;
  const cor = diff > 0 ? C.verde : diff < 0 ? C.vermelho : C.cinza3;
  const pct = Math.min((atu / 10) * 100, 100);
  return (
    <View style={s.tabelaRow}>
      <Text style={s.tabelaLabel}>{label}</Text>
      <View style={s.tabelaBarraContainer}>
        <View style={[s.tabelaBarraFill, { width: `${pct}%`, backgroundColor: cor }]} />
      </View>
      <Text style={[s.tabelaDiff, { color: cor }]}>
        {diff > 0 ? `+${diff}` : diff < 0 ? `${diff}` : '='}
      </Text>
      <Text style={s.tabelaAtual}>{atu}/10</Text>
    </View>
  );
}

// ── Documento principal ───────────────────────────────────────────────────────

interface Props {
  dados: DadosAnalise;
  analise: Analise;
  mes: string;
  nomeNutricionista: string;
}

export function RelatorioPDF({ dados, analise, mes, nomeNutricionista }: Props) {
  const nome = dados.nome;
  const dataGeracao = new Date().toLocaleDateString('pt-BR');

  return (
    <Document title={`Relatório de Evolução — ${nome}`} author={nomeNutricionista}>
      <Page size="A4" style={s.page}>

        {/* ── HEADER ── */}
        <View style={s.header}>
          <Text style={s.headerLabel}>Relatorio de Evolucao Nutricional</Text>
          <Text style={s.headerNome}>{t(nome)}</Text>
          <Text style={s.headerSub}>{t(mes)}  -  {dados.diasAcompanhamento > 0 ? `${dados.diasAcompanhamento} dias de acompanhamento` : 'Inicio do acompanhamento'}</Text>
          <View style={s.badge}>
            <Text style={s.badgeText}>{t(analise.fraseStatus)}</Text>
          </View>
        </View>

        {/* ── MÉTRICAS RÁPIDAS ── */}
        <View style={s.metricas}>
          <View style={[s.metricaItem]}>
            <Text style={[s.metricaValor, { color: dados.aderencia >= 70 ? C.verde : C.amarelo }]}>
              {dados.aderencia}%
            </Text>
            <Text style={s.metricaLabel}>Aderencia</Text>
          </View>
          {dados.scoreHabitos != null && (
            <View style={s.metricaItem}>
              <Text style={[s.metricaValor, { color: dados.scoreHabitos >= 6 ? C.verde : C.amarelo }]}>
                {dados.scoreHabitos}/10
              </Text>
              <Text style={s.metricaLabel}>Score Habitos</Text>
            </View>
          )}
          {dados.pesoAtual != null && (
            <View style={[s.metricaItem, { borderRightWidth: 0 }]}>
              <Text style={[s.metricaValor, { color: C.cinza1 }]}>{dados.pesoAtual} kg</Text>
              <Text style={s.metricaLabel}>Peso Atual</Text>
            </View>
          )}
          {dados.pesoInicial != null && dados.pesoAtual != null && (
            <View style={[s.metricaItem, { borderRightWidth: 0 }]}>
              {(() => {
                const diff = +(dados.pesoAtual - dados.pesoInicial).toFixed(1);
                const cor = diff <= 0 ? C.verde : C.amarelo;
                return <>
                  <Text style={[s.metricaValor, { color: cor }]}>{diff > 0 ? '+' : ''}{diff} kg</Text>
                  <Text style={s.metricaLabel}>Variação</Text>
                </>;
              })()}
            </View>
          )}
        </View>

        {/* ── CORPO ── */}
        <View style={s.body}>

          {/* Objetivo */}
          {dados.objetivo && (
            <View style={s.objetivoBox}>
              <Text style={s.objetivoTexto}>Objetivo: {t(dados.objetivo)}</Text>
            </View>
          )}

          {/* Resumo analítico */}
          <View style={s.resumoBox}>
            <Text style={s.resumoTexto}>{t(analise.paragrafoResumo)}</Text>
          </View>

          {/* Conquistas + Atenção em grid */}
          <View style={s.grid2}>
            {analise.conquistas.length > 0 && (
              <View style={s.col}>
                <Text style={s.secaoTitulo}>Conquistas do periodo</Text>
                {analise.conquistas.map((c, i) => (
                  <CardInsight key={i} {...c} />
                ))}
              </View>
            )}
            {analise.atencao.length > 0 && (
              <View style={s.col}>
                <Text style={s.secaoTitulo}>Pontos de atencao</Text>
                {analise.atencao.map((c, i) => (
                  <CardInsight key={i} {...c} />
                ))}
              </View>
            )}
          </View>

          {/* Insights detalhados (os que não estão em conquistas/atenção) */}
          {(() => {
            const detalhados = [analise.analiseAderencia, analise.analisePeso, analise.analiseHabitos, analise.analiseAlimentacao]
              .filter(Boolean)
              .map(i => i!)
              .filter(i => !analise.conquistas.includes(i) && !analise.atencao.includes(i));
            if (!detalhados.length) return null;
            return (
              <>
                <Text style={s.secaoTitulo}>Analise detalhada</Text>
                {detalhados.map((i, idx) => <CardInsight key={idx} {...i} />)}
              </>
            );
          })()}

          {/* Grupos alimentares */}
          {dados.inicial && dados.atual && (
            <>
              <View style={s.divisor} />
              <Text style={s.secaoTitulo}>Evolucao dos grupos alimentares</Text>
              {[
                { label: 'Frutas',     ini: dados.inicial.frutas,    atu: dados.atual.frutas },
                { label: 'Verduras',   ini: dados.inicial.verduras,  atu: dados.atual.verduras },
                { label: 'Legumes',    ini: dados.inicial.legumes,   atu: dados.atual.legumes },
                { label: 'Proteinas',  ini: dados.inicial.proteinas, atu: dados.atual.proteinas },
                { label: 'Cereais',    ini: dados.inicial.cereais,   atu: dados.atual.cereais },
                { label: 'Hidratacao', ini: dados.inicial.agua,      atu: dados.atual.agua },
              ].map(g => <BarraGrupo key={g.label} {...g} />)}

              <Text style={s.secaoTitulo}>Habitos inadequados</Text>
              {[
                { label: 'Refrigerantes',    ini: dados.inicial.refrigerantes,    atu: dados.atual.refrigerantes },
                { label: 'Doces',            ini: dados.inicial.doces,            atu: dados.atual.doces },
                { label: 'Fast-food',        ini: dados.inicial.fastFood,         atu: dados.atual.fastFood },
                { label: 'Ultraprocessados', ini: dados.inicial.ultraprocessados, atu: dados.atual.ultraprocessados },
                { label: 'Beliscos',         ini: dados.inicial.beliscos,         atu: dados.atual.beliscos },
              ].map(g => (
                // Para hábitos inadequados, redução é positivo
                <BarraGrupo key={g.label} label={g.label} ini={g.ini} atu={g.atu} />
              ))}
              <Text style={s.notaTabela}>Escala de 0 a 10 - comparativo entre avaliacao inicial e mais recente. Para habitos inadequados, valores menores sao melhores.</Text>
            </>
          )}

          {/* Próximos passos */}
          <View style={s.divisor} />
          <Text style={s.secaoTitulo}>Proximos passos recomendados</Text>
          <View style={{ backgroundColor: C.cinza4, borderRadius: 6, padding: 12, marginBottom: 16 }}>
            {analise.proximosPassos.map((p, i) => (
              <View key={i} style={s.passoRow}>
                <Text style={s.passoSeta}>-&gt;</Text>
                <Text style={s.passoTexto}>{t(p)}</Text>
              </View>
            ))}
          </View>

          {/* Conclusão */}
          <Text style={s.secaoTitulo}>Parecer da nutricionista</Text>
          <View style={s.conclusaoBox}>
            <Text style={s.conclusaoTexto}>{t(analise.conclusao)}</Text>
          </View>

        </View>

        {/* ── FOOTER ── */}
        <View style={s.footer} fixed>
          <Text style={s.footerTexto}>Relatorio gerado em {dataGeracao} via NutriHub</Text>
          <Text style={s.footerTexto}>{t(nomeNutricionista)}</Text>
        </View>

      </Page>
    </Document>
  );
}
