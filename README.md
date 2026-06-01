# RINU

Marketplace de espaços e serviços para eventos — pesquisa, reservas, área de anfitrião e backoffice.

**Produção:** [molinapersonal.vercel.app](https://molinapersonal.vercel.app)

## Stack

- [Next.js 15](https://nextjs.org/) (App Router, React 19, TypeScript)
- [Supabase](https://supabase.com/) — Auth, Postgres, Storage
- [Vercel](https://vercel.com/) — hosting
- Stripe — pagamentos
- TanStack Query, React Aria, Sentry, PostHog

## Funcionalidades

- Pesquisa de espaços com mapa, filtros e destaques
- Páginas de espaço, packs e reserva (`/book`)
- Área de anfitrião (`/host`) — venues, espaços, packs, calendário, reservas
- Onboarding de novos anfitriões
- Admin — utilizadores, destaques, orçamentos, reservas
- API REST em `/api/[service]/v1` (substitui o antigo api-gateway Go)
- Migração de dados do stack legado (scripts em `scripts/migrate-data/`)

## Requisitos

- Node.js 22+
- Projeto Supabase (URL + chaves)
- Conta Vercel (deploy)

## Como correr localmente

```bash
npm install
```

Copia as variáveis de ambiente:

```bash
cp .env.example .env
```

No PowerShell:

```powershell
Copy-Item .env.example .env
```

Preenche pelo menos:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SITE_URL` (ex.: `http://localhost:3000`)

Aplica o schema na base de dados (Supabase CLI ligado ao projeto):

```bash
supabase db push
```

Arranca o servidor de desenvolvimento:

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Variáveis de ambiente

Ver [`.env.example`](.env.example) para a lista completa.

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Sim | URL do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Sim | Chave anon (cliente) |
| `SUPABASE_SERVICE_ROLE_KEY` | Sim | Chave service role (API server-side) |
| `NEXT_PUBLIC_SITE_URL` | Sim | URL pública do site |
| `STRIPE_*` | Reservas | Pagamentos Stripe |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Mapa | Google Maps na pesquisa |
| `BREVO_*` | Email/CRM | Brevo (opcional em dev) |
| `NEXT_PUBLIC_SENTRY_DSN` | Monitorização | Sentry (opcional) |

**Não commits:** `.env`, `.env.production`, `.env.migrate` — estão no `.gitignore`.

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Desenvolvimento |
| `npm run build` | Build de produção |
| `npm run start` | Servidor após build |
| `npm run lint` | ESLint |
| `npm run db:types` | Gera tipos TypeScript a partir do schema Supabase local |

### Migração de dados (legado → Supabase)

Documentação detalhada: [`scripts/migrate-data/README.md`](scripts/migrate-data/README.md)

Exemplos:

```bash
node scripts/migrate-data/01-users.mjs
node scripts/migrate-data/02-business.mjs
node scripts/migrate-data/seed-highlights.mjs
node scripts/migrate-data/fix-reregistered-owners.mjs
```

Requer `.env` (Supabase) e `.env.migrate` (`OLD_DATABASE_URL` para a BD antiga, quando aplicável).

## Estrutura do projeto

```
app/              # Rotas Next.js (público, host, admin, onboarding, API)
lib/              # API handlers, Supabase, pricing, Stripe
supabase/         # Migrações SQL
scripts/          # Migração de dados e utilitários
public/           # Assets estáticos (imagens, PDFs, ícones)
```

## API

Rotas autenticadas: `/api/{service}/v1/...`  
Rotas públicas: `/api/public/{service}/v1/...`

Serviços principais: `search`, `venues`, `spaces`, `packs`, `bookings`, `highlights`, `watchlist`, `photos`, `payments`, `dashboard`.

## Deploy (Vercel)

1. Repositório ligado a [github.com/joaomolina1/Molinapersonal](https://github.com/joaomolina1/Molinapersonal)
2. Configurar as mesmas variáveis que em `.env.example` no painel Vercel
3. `npm run build` (automático no deploy)
4. Webhook Stripe: `POST /api/payments/v1/stripe/webhook`
5. Cron iCal (se usado): configurar `CRON_SECRET` e o endpoint em `vercel.json`

## Notas

- Fotos em produção usam o CDN `img.rinu.pt` (URLs migradas da GCP).
- A pesquisa só mostra espaços com pack publicado e preços futuros (paridade com o backend Go antigo).
- `profiles.id` deve coincidir com `auth.users.id`.

## Licença

Projeto privado — uso interno RINU.
