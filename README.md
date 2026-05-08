# Breastfeed Tracker

Aplicacao web mobile-first para registo de amamentacao e biberoes.

Estado atual: Etapa 2 (gestao de filhos) concluida.

## Stack

- Next.js (App Router + TypeScript)
- Tailwind CSS
- Supabase (Auth + Postgres)
- Prisma ORM

## Requisitos

- Node.js 20+
- Conta Supabase
- Projeto criado no Vercel (opcional nesta fase)

## Como correr localmente

1. Instalar dependencias:

```bash
npm install
```

2. Criar ficheiro de ambiente:

```bash
cp .env.example .env
```

No Windows PowerShell, usa:

```powershell
Copy-Item .env.example .env
```

3. Preencher variaveis no .env com os valores do teu projeto Supabase.

4. Gerar Prisma Client:

```bash
npm run prisma:generate
```

5. Correr a app:

```bash
npm run dev
```

6. Abrir no browser:

http://localhost:3000

## Variaveis de ambiente

- DATABASE_URL: string de ligacao Postgres (Supabase)
- NEXT_PUBLIC_SUPABASE_URL: URL publica do projeto Supabase
- NEXT_PUBLIC_SUPABASE_ANON_KEY: chave anon publica do Supabase
- SUPABASE_SERVICE_ROLE_KEY: chave service role (apenas server-side)

## Scripts uteis

- npm run dev: arranca em desenvolvimento
- npm run build: gera build de producao
- npm run start: corre build de producao
- npm run lint: valida qualidade de codigo
- npm run prisma:generate: gera cliente Prisma
- npm run prisma:migrate: cria/aplica migracoes locais
- npm run prisma:studio: abre interface visual da base de dados

## Deploy (Vercel)

1. Push do repositorio para GitHub.
2. No Vercel, importar repositorio.
3. Configurar variaveis de ambiente iguais ao .env.
4. Fazer deploy.

## Etapa 1: autenticacao (concluida)

Implementado:

- Registo com email/password
- Login com email/password
- Logout
- Rotas protegidas com proxy (`proxy.ts`)
- Dashboard protegido em `/dashboard`

### Teste manual da Etapa 1

1. Abre `/register` e cria conta.
2. Vai para `/login` e faz login.
3. Confirma que entras em `/dashboard`.
4. Faz logout no botao da dashboard.
5. Tenta abrir `/dashboard` sem login e confirma redirecao para `/login`.

## Etapa 2: gestao de filhos (concluida)

Implementado:

- Criacao de filhos em `/children`
- Suporte a multiplos filhos (inclui gemeos)
- Campos: nome, data de nascimento opcional e notas opcionais
- Lista de filhos do utilizador autenticado

### Teste manual da Etapa 2

1. Faz login e abre `/children`.
2. Adiciona o primeiro filho.
3. Adiciona um segundo filho.
4. Confirma que os dois aparecem na lista.

## Nota sobre base de dados

Se der erro de ligacao a `localhost:5432`, atualiza o `DATABASE_URL` no `.env` para a string do teu projeto Supabase.

## Proximas etapas

- Etapa 3: mamada direta (timer + manual)
- Etapa 4: biberao
- Etapa 5: historico
- Etapa 6: dashboard diario simples
