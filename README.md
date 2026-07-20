# Nutri Nunes — Sistema de Nutrição

Plataforma web completa para consultório de nutrição, com portal do paciente e painel administrativo para a nutricionista.

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI | React 19 + Tailwind CSS 4 |
| Banco de dados | PostgreSQL (Neon serverless) |
| ORM | Prisma 6 |
| Autenticação | JWT (jose) + bcryptjs |
| Ícones | lucide-react |
| Gráficos | Recharts 3 |
| Email | Resend API |
| Deploy | Vercel |

---

## Estrutura do Projeto

```
nutri-nunes/
├── app/
│   ├── admin/          # Painel da nutricionista
│   ├── api/            # API Routes (Next.js)
│   │   ├── admin/      # Endpoints protegidos (ADMIN)
│   │   ├── auth/       # Login, logout, register, refresh
│   │   ├── cliente/    # Endpoints protegidos (CLIENTE)
│   │   └── formulario/ # Endpoint público (formulários)
│   ├── cliente/        # Portal do paciente
│   └── (public)/       # Landing page, blog, agendamento
├── components/         # Componentes React reutilizáveis
├── lib/
│   ├── auth.ts         # JWT helpers (createToken, verifyToken, getSession)
│   ├── datas.ts        # Utilitários de data (fuso America/Sao_Paulo)
│   ├── email.ts        # Envio de emails via Resend
│   └── prisma.ts       # Singleton do PrismaClient
├── middleware.ts        # Proteção de rotas e APIs
├── prisma/
│   ├── schema.prisma   # Modelos do banco
│   └── migrations/     # Histórico de migrações
└── types/index.ts      # Tipos TypeScript compartilhados
```

---

## Configuração Local

### 1. Pré-requisitos

- Node.js 20+
- Conta no [Neon](https://neon.tech) (PostgreSQL serverless)
- Conta no [Resend](https://resend.com) (opcional, para emails)

### 2. Instalar dependências

```bash
npm install
```

### 3. Variáveis de ambiente

Copie `.env.example` para `.env` e preencha:

```env
DATABASE_URL="postgresql://..."     # Connection string do Neon
JWT_SECRET="string-aleatoria-longa" # Mínimo 32 caracteres
RESEND_API_KEY="re_..."             # Opcional — emails
FROM_EMAIL="noreply@seudominio.com" # Opcional
```

> **Importante:** `JWT_SECRET` é obrigatório. O servidor não inicia sem ele.

### 4. Banco de dados

```bash
npm run db:migrate   # Aplica migrações
npm run db:generate  # Gera o Prisma Client
npm run db:seed      # Cria usuário admin inicial (opcional)
```

### 5. Rodar em desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

---

## Autenticação

- **Algoritmo:** HS256 (JWT via `jose`)
- **Token de acesso:** cookie `httpOnly`, `sameSite=lax`, expira em 1 dia
- **Refresh token:** cookie `httpOnly`, `sameSite=lax`, expira em 30 dias
- **Proteção de rotas:** `middleware.ts` intercepta todas as rotas `/admin/*`, `/cliente/*`, `/api/admin/*`, `/api/cliente/*`
- **Roles:** `ADMIN` (nutricionista) e `CLIENTE` (paciente)

---

## Modelos do Banco

| Model | Descrição |
|---|---|
| `Usuario` | Pacientes e admin |
| `Dieta` | Plano alimentar do paciente |
| `Refeicao` | Refeições da dieta |
| `Alimento` | Itens de cada refeição |
| `Receita` | Receitas vinculadas a alimentos |
| `CheckRefeicao` | Registro diário de refeições realizadas |
| `RegistroProgresso` | Peso e água diários |
| `Feedback` | Mensagens do paciente para a nutri |
| `RegistroHabito` | Hábitos diários do paciente (grupos alimentares + inadequados) |
| `AvaliacaoNutricional` | Avaliação inicial e de acompanhamento |
| `EntradaDiario` | Prontuário (notas, medidas, consultas) |
| `Formulario` | Questionários criados pela nutri |
| `RespostaFormulario` | Respostas dos pacientes |
| `Agendamento` | Consultas agendadas |
| `Post` | Artigos do blog |
| `ConfigSite` | Configurações da landing page |

---

## APIs

### Públicas
| Método | Rota | Descrição |
|---|---|---|
| POST | `/api/agendamento` | Criar agendamento |
| GET | `/api/agendamento?data=` | Horários ocupados |
| GET | `/api/formulario?id=` | Buscar formulário |
| POST | `/api/formulario` | Enviar respostas |
| GET | `/api/public/...` | Dados públicos (serviços, planos, blog) |

### Autenticação
| Método | Rota | Descrição |
|---|---|---|
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/logout` | Logout |
| POST | `/api/auth/register` | Criar paciente (admin only) |
| POST | `/api/auth/refresh` | Renovar token |

### Admin (requer role ADMIN)
| Método | Rota | Descrição |
|---|---|---|
| GET/DELETE | `/api/admin/clientes` | Listar/excluir pacientes |
| GET/POST/PUT/DELETE | `/api/admin/dietas` | Gerenciar dietas |
| GET/POST/DELETE | `/api/admin/diario` | Prontuário do paciente |
| GET/POST | `/api/admin/formularios` | Criar formulários |
| GET/POST | `/api/admin/habitos` | Ver hábitos do paciente |
| GET | `/api/admin/relatorio` | Relatório de evolução |

### Cliente (requer role CLIENTE)
| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/cliente/dieta` | Dieta ativa |
| GET/POST | `/api/cliente/checks` | Checks de refeições |
| POST | `/api/cliente/progresso` | Registrar peso/água |
| POST | `/api/cliente/feedback` | Enviar feedback |
| GET/POST | `/api/cliente/habitos` | Hábitos diários |
| GET/POST | `/api/cliente/formularios` | Formulários pendentes/responder |
| GET | `/api/cliente/telemetria` | Dados do dashboard |

---

## Segurança

- **JWT_SECRET obrigatório** — servidor não inicia sem a variável definida
- **Cookies httpOnly** — tokens inacessíveis via JavaScript
- **Proteção IDOR** — checks de refeição verificam ownership antes de gravar
- **Validação de input** — todos os endpoints validam tipos, formatos e tamanhos
- **Timing-safe login** — bcrypt sempre executa para evitar enumeração de usuários
- **Sanitização de HTML** — templates de email escapam dados do usuário
- **Headers de segurança** — CSP, HSTS, X-Frame-Options, X-Content-Type-Options
- **bcrypt rounds: 12** — custo aumentado para hashes de senha

---

## Deploy (Vercel)

1. Conecte o repositório no [Vercel](https://vercel.com)
2. Configure as variáveis de ambiente:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `RESEND_API_KEY` (opcional)
   - `FROM_EMAIL` (opcional)
3. Deploy automático a cada push na branch `main`

### Keep-alive do banco (Neon)

O Neon hiberna conexões inativas. Configure um cron job externo (ex: [cron-job.org](https://cron-job.org)) para chamar `/api/ping` a cada 5 minutos.

---

## Scripts

```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build de produção
npm run start        # Servidor de produção
npm run lint         # ESLint
npm run db:migrate   # Criar e aplicar migração
npm run db:generate  # Regenerar Prisma Client
npm run db:seed      # Popular banco com dados iniciais
```
