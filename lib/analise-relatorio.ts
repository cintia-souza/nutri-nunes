// Motor de análise determinística — interpreta dados nutricionais e gera textos analíticos

export interface DadosAnalise {
  nome: string;
  objetivo?: string | null;
  pesoAtual?: number | null;
  pesoInicial?: number | null;
  altura?: number | null;
  aderencia: number; // 0-100%
  scoreHabitos?: number | null; // 0-10
  hidratacaoMedia?: number | null; // ml/dia
  inicial?: AvalNutri | null;
  atual?: AvalNutri | null;
  totalAvaliacoes: number;
  diasAcompanhamento: number;
  feedbacks?: string[];
}

export interface AvalNutri {
  frutas: number; verduras: number; legumes: number;
  proteinas: number; cereais: number; agua: number;
  refrigerantes: number; doces: number; fastFood: number;
  ultraprocessados: number; beliscos: number;
}

export interface Analise {
  statusGeral: 'excelente' | 'bom' | 'regular' | 'atencao';
  corStatus: string;
  emojiStatus: string;
  fraseStatus: string;
  paragrafoResumo: string;
  conquistas: Insight[];
  atencao: Insight[];
  analiseAderencia: Insight;
  analisePeso: Insight | null;
  analiseHabitos: Insight | null;
  analiseAlimentacao: Insight | null;
  conclusao: string;
  proximosPassos: string[];
}

export interface Insight {
  titulo: string;
  descricao: string;
  emoji: string;
  nivel: 'positivo' | 'neutro' | 'atencao';
}

// ── Classificadores ──────────────────────────────────────────────────────────

function classificarAderencia(v: number): 'excelente' | 'bom' | 'regular' | 'atencao' {
  if (v >= 85) return 'excelente';
  if (v >= 70) return 'bom';
  if (v >= 50) return 'regular';
  return 'atencao';
}

function classificarScore(v: number): 'excelente' | 'bom' | 'regular' | 'atencao' {
  if (v >= 8) return 'excelente';
  if (v >= 6) return 'bom';
  if (v >= 4) return 'regular';
  return 'atencao';
}

function imc(peso: number, altura: number) {
  const h = altura / 100;
  return +(peso / (h * h)).toFixed(1);
}

function classificarIMC(v: number): string {
  if (v < 18.5) return 'abaixo do peso';
  if (v < 25) return 'peso normal';
  if (v < 30) return 'sobrepeso';
  if (v < 35) return 'obesidade grau I';
  return 'obesidade grau II ou mais';
}

function imcDesc(peso: number, altura: number): string {
  const v = imc(peso, altura);
  return ` (IMC ${v} - ${classificarIMC(v)})`;
}

function primeiroNome(nome: string) {
  return nome.split(' ')[0];
}

// ── Motor principal ──────────────────────────────────────────────────────────

export function analisarRelatorio(d: DadosAnalise): Analise {
  const nome = primeiroNome(d.nome);
  const conquistas: Insight[] = [];
  const atencao: Insight[] = [];

  // ── Aderência ──
  const nivelAderencia = classificarAderencia(d.aderencia);
  const analiseAderencia: Insight = {
    emoji: d.aderencia >= 85 ? '🏆' : d.aderencia >= 70 ? '✅' : d.aderencia >= 50 ? '⚠️' : '🚨',
    nivel: nivelAderencia === 'excelente' || nivelAderencia === 'bom' ? 'positivo' : nivelAderencia === 'regular' ? 'neutro' : 'atencao',
    titulo: `Aderência à dieta: ${d.aderencia}%`,
    descricao: d.aderencia >= 85
      ? `${nome} seguiu o plano alimentar em ${d.aderencia}% das refeições registradas — um resultado excelente que demonstra comprometimento consistente com o tratamento.`
      : d.aderencia >= 70
      ? `${nome} cumpriu ${d.aderencia}% das refeições planejadas. É um bom resultado, mas ainda há espaço para melhorar a consistência nos dias mais difíceis.`
      : d.aderencia >= 50
      ? `A aderência de ${d.aderencia}% indica que ${nome} está seguindo o plano em apenas metade das refeições. Identificar os horários de maior dificuldade pode ajudar a melhorar esse número.`
      : `Com ${d.aderencia}% de aderência, ${nome} está tendo dificuldades em seguir o plano alimentar. É importante conversar sobre os obstáculos para ajustar a estratégia.`,
  };

  if (nivelAderencia === 'excelente') conquistas.push(analiseAderencia);
  else if (nivelAderencia === 'atencao') atencao.push(analiseAderencia);

  // ── Peso ──
  let analisePeso: Insight | null = null;
  if (d.pesoAtual && d.pesoInicial) {
    const diffPeso = +(d.pesoAtual - d.pesoInicial).toFixed(1);
    const perdeu = diffPeso < 0;
    const ganhou = diffPeso > 0;
    const imcAtual = d.altura ? imc(d.pesoAtual, d.altura) : null;
    const imcDescStr = imcAtual ? imcDesc(d.pesoAtual, d.altura!) : '';

    analisePeso = {
      emoji: perdeu ? '📉' : ganhou ? '📈' : '⚖️',
      nivel: perdeu ? 'positivo' : ganhou ? 'atencao' : 'neutro',
      titulo: `Peso: ${d.pesoAtual} kg${imcDescStr}`,
      descricao: perdeu
        ? `${nome} reduziu ${Math.abs(diffPeso)} kg desde o inicio do acompanhamento, passando de ${d.pesoInicial} kg para ${d.pesoAtual} kg${imcDescStr}. Essa reducao e resultado direto da melhora nos habitos alimentares.`
        : ganhou
        ? `O peso de ${nome} aumentou ${diffPeso} kg em relacao ao inicio (${d.pesoInicial} kg -> ${d.pesoAtual} kg)${imcDescStr}. Vale avaliar se esse ganho e esperado dentro do objetivo do tratamento.`
        : `O peso de ${nome} se manteve estavel em ${d.pesoAtual} kg${imcDescStr}. A manutencao do peso pode ser um objetivo positivo dependendo do plano tracado.`,
    };

    if (perdeu && Math.abs(diffPeso) >= 1) conquistas.push(analisePeso);
    else if (ganhou && Math.abs(diffPeso) >= 2) atencao.push(analisePeso);
  }

  // ── Score de hábitos ──
  let analiseHabitos: Insight | null = null;
  if (d.scoreHabitos !== null && d.scoreHabitos !== undefined) {
    const nivelScore = classificarScore(d.scoreHabitos);
    analiseHabitos = {
      emoji: d.scoreHabitos >= 8 ? '⭐' : d.scoreHabitos >= 6 ? '👍' : d.scoreHabitos >= 4 ? '📊' : '⚠️',
      nivel: nivelScore === 'excelente' || nivelScore === 'bom' ? 'positivo' : nivelScore === 'regular' ? 'neutro' : 'atencao',
      titulo: `Score de hábitos: ${d.scoreHabitos}/10`,
      descricao: d.scoreHabitos >= 8
        ? `O score de ${d.scoreHabitos}/10 reflete hábitos alimentares muito bem estabelecidos. ${nome} demonstra consistência em aderência à dieta, variedade alimentar, hidratação e comportamento à mesa.`
        : d.scoreHabitos >= 6
        ? `Com ${d.scoreHabitos}/10, ${nome} apresenta bons hábitos no geral. Pequenos ajustes em consistência e variedade podem elevar ainda mais esse resultado.`
        : d.scoreHabitos >= 4
        ? `O score de ${d.scoreHabitos}/10 indica hábitos em desenvolvimento. Há progresso, mas aspectos como hidratação ou variedade alimentar ainda precisam de atenção.`
        : `Score de ${d.scoreHabitos}/10 sinaliza que os hábitos alimentares de ${nome} precisam de reforço. Recomenda-se revisar as metas e identificar os maiores obstáculos.`,
    };

    if (nivelScore === 'excelente') conquistas.push(analiseHabitos);
    else if (nivelScore === 'atencao') atencao.push(analiseHabitos);
  }

  // ── Alimentação (grupos) ──
  let analiseAlimentacao: Insight | null = null;
  if (d.inicial && d.atual) {
    const grupos = [
      { nome: 'frutas', label: 'frutas', ini: d.inicial.frutas, atu: d.atual.frutas },
      { nome: 'verduras', label: 'verduras', ini: d.inicial.verduras, atu: d.atual.verduras },
      { nome: 'legumes', label: 'legumes', ini: d.inicial.legumes, atu: d.atual.legumes },
      { nome: 'proteinas', label: 'proteínas', ini: d.inicial.proteinas, atu: d.atual.proteinas },
      { nome: 'agua', label: 'hidratação', ini: d.inicial.agua, atu: d.atual.agua },
    ];
    const habRuins = [
      { label: 'refrigerantes', ini: d.inicial.refrigerantes, atu: d.atual.refrigerantes },
      { label: 'doces', ini: d.inicial.doces, atu: d.atual.doces },
      { label: 'ultraprocessados', ini: d.inicial.ultraprocessados, atu: d.atual.ultraprocessados },
    ];

    const melhorias = grupos.filter(g => g.atu - g.ini >= 2).map(g => g.label);
    const reducoes = habRuins.filter(h => h.ini - h.atu >= 2).map(h => h.label);
    const baixos = grupos.filter(g => g.atu <= 3).map(g => g.label);

    const mediaGrupos = +(grupos.reduce((s, g) => s + g.atu, 0) / grupos.length).toFixed(1);

    let descricao = '';
    if (melhorias.length > 0) {
      descricao += `Houve melhora significativa no consumo de ${melhorias.join(', ')}. `;
    }
    if (reducoes.length > 0) {
      descricao += `A redução no consumo de ${reducoes.join(', ')} é um avanço importante para a saúde. `;
    }
    if (baixos.length > 0) {
      descricao += `Ainda há baixa aceitação de ${baixos.join(', ')}, o que merece atenção nas próximas semanas.`;
    }
    if (!descricao) {
      descricao = mediaGrupos >= 6
        ? `${nome} apresenta boa aceitação dos grupos alimentares com média de ${mediaGrupos}/10, indicando uma alimentação equilibrada.`
        : `A aceitação média dos grupos alimentares é de ${mediaGrupos}/10. Há oportunidade de ampliar a variedade na dieta.`;
    }

    analiseAlimentacao = {
      emoji: melhorias.length >= 2 ? '🥗' : baixos.length >= 2 ? '⚠️' : '🍽️',
      nivel: melhorias.length >= 2 ? 'positivo' : baixos.length >= 2 ? 'atencao' : 'neutro',
      titulo: 'Evolução da alimentação',
      descricao,
    };

    if (melhorias.length >= 2) conquistas.push(analiseAlimentacao);
    else if (baixos.length >= 2) atencao.push(analiseAlimentacao);
  }

  // ── Status geral ──
  const pontos = [
    classificarAderencia(d.aderencia),
    d.scoreHabitos ? classificarScore(d.scoreHabitos) : null,
  ].filter(Boolean) as string[];

  const excelentes = pontos.filter(p => p === 'excelente').length;
  const ruins = pontos.filter(p => p === 'atencao').length;

  const statusGeral: Analise['statusGeral'] =
    excelentes >= 2 ? 'excelente' :
    excelentes >= 1 && ruins === 0 ? 'bom' :
    ruins >= 2 ? 'atencao' : 'regular';

  const corStatus = { excelente: '#059669', bom: '#3b82f6', regular: '#d97706', atencao: '#dc2626' }[statusGeral];
  const emojiStatus = { excelente: '🏆', bom: '👍', regular: '📊', atencao: '⚠️' }[statusGeral];
  const fraseStatus = {
    excelente: `${nome} está com evolução excelente!`,
    bom: `${nome} está evoluindo bem.`,
    regular: `${nome} está em progresso, com pontos a melhorar.`,
    atencao: `${nome} precisa de atenção em alguns aspectos.`,
  }[statusGeral];

  // ── Parágrafo resumo ──
  const diasTexto = d.diasAcompanhamento > 0
    ? `Após ${d.diasAcompanhamento} dias de acompanhamento, `
    : '';

  const paragrafoResumo = `${diasTexto}${nome} apresenta aderência de ${d.aderencia}% ao plano alimentar${
    d.scoreHabitos ? `, score de hábitos de ${d.scoreHabitos}/10` : ''
  }${
    d.pesoAtual && d.pesoInicial && d.pesoAtual !== d.pesoInicial
      ? ` e variação de peso de ${+(d.pesoAtual - d.pesoInicial).toFixed(1)} kg`
      : ''
  }. ${fraseStatus}`;

  // ── Conclusão ──
  const conclusao = statusGeral === 'excelente'
    ? `${nome} demonstra excelente comprometimento com o tratamento nutricional. Os resultados refletem dedicação consistente e mudanças reais de comportamento alimentar. O caminho está sendo trilhado com sucesso.`
    : statusGeral === 'bom'
    ? `${nome} está no caminho certo. Os indicadores mostram evolução positiva e os hábitos estão se consolidando. Com continuidade e pequenos ajustes, os resultados tendem a se fortalecer ainda mais.`
    : statusGeral === 'regular'
    ? `${nome} apresenta progresso, mas ainda há aspectos importantes a desenvolver. A consistência nos próximos dias será fundamental para consolidar as mudanças iniciadas.`
    : `${nome} está enfrentando desafios no processo. É importante identificar os obstáculos e ajustar o plano para torná-lo mais viável na rotina atual.`;

  // ── Próximos passos ──
  const proximosPassos: string[] = [];
  if (d.aderencia < 70) proximosPassos.push('Identificar os horários de maior dificuldade e adaptar o plano alimentar');
  if (d.scoreHabitos && d.scoreHabitos < 6) proximosPassos.push('Focar em um hábito por semana para consolidar mudanças graduais');
  if (d.inicial && d.atual) {
    const baixos = ['frutas','verduras','legumes'].filter(k => (d.atual as Record<string,number>)[k] <= 3);
    if (baixos.length > 0) proximosPassos.push(`Aumentar gradualmente o consumo de ${baixos.join(' e ')}`);
    if (d.atual.refrigerantes >= 3) proximosPassos.push('Reduzir o consumo de refrigerantes — substituir por água com limão ou chás');
    if (d.atual.ultraprocessados >= 3) proximosPassos.push('Diminuir ultraprocessados — planejar lanches saudáveis com antecedência');
  }
  if (proximosPassos.length === 0) {
    proximosPassos.push('Manter a consistência e registrar os hábitos diariamente no app');
    proximosPassos.push('Agendar a próxima avaliação nutricional para acompanhar a evolução');
  }

  return {
    statusGeral, corStatus, emojiStatus, fraseStatus,
    paragrafoResumo, conquistas, atencao,
    analiseAderencia, analisePeso, analiseHabitos, analiseAlimentacao,
    conclusao, proximosPassos,
  };
}
