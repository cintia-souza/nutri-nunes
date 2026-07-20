export type Role = 'SUPERADMIN' | 'ADMIN' | 'CLIENTE';

export interface Tenant {
  id: string;
  nome: string;
  email: string;
  crn?: string;
  slug: string;
  logoUrl?: string;
  ativo: boolean;
  criadoEm: Date;
}

export type TipoRefeicao =
  | 'CAFE_DA_MANHA'
  | 'LANCHE_DA_MANHA'
  | 'ALMOCO'
  | 'LANCHE_DA_TARDE'
  | 'JANTA'
  | 'CEIA';

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  role: Role;
  tenantId: string;
  telefone?: string;
  dataNascimento?: Date;
  criadoEm: Date;
}

export interface Cliente extends Usuario {
  role: 'CLIENTE';
  pesoAtual?: number;
  altura?: number;
  objetivo?: string;
  dietaAtiva?: Dieta;
}

export interface Alimento {
  id: string;
  nome: string;
  quantidade: string;
  observacao?: string;
  receita?: Receita;
}

export interface Receita {
  id: string;
  titulo: string;
  ingredientes: string[];
  modoPreparo: string[];
  tempoPreparo?: string;
}

export interface Refeicao {
  id: string;
  tipo: TipoRefeicao;
  horarioSugerido?: string;
  alimentos: Alimento[];
}

export interface Dieta {
  id: string;
  clienteId: string;
  titulo: string;
  refeicoes: Refeicao[];
  ativa: boolean;
  criadaEm: Date;
}

export interface CheckRefeicao {
  id: string;
  clienteId: string;
  refeicaoId: string;
  data: string; // YYYY-MM-DD
  realizada: boolean;
}

export interface Feedback {
  id: string;
  clienteId: string;
  data: string;
  texto: string;
  criadoEm: Date;
}

export interface RegistroProgresso {
  id: string;
  clienteId: string;
  data: string;
  peso?: number;
  aguaMl?: number;
  criadoEm: Date;
}

export interface IMCResult {
  valor: number;
  classificacao: string;
  cor: string;
}
