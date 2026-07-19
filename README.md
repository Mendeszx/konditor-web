# 🧁 Konditor — Artisanal Intelligence

> Plataforma de **inteligência financeira para confeitarias e ateliês artesanais**.
> Transforma receitas em dados financeiros precisos: custo por ingrediente, margem real,
> precificação sugerida e visão de lucro.

Este repositório contém o **front-end web** do Konditor — um site estático (único passo de
build é o CSS do Tailwind), que consome uma **API REST** própria.

---

## 📑 Índice

- [Visão geral](#-visão-geral)
- [Stack técnica](#-stack-técnica)
- [Estrutura do projeto](#-estrutura-do-projeto)
- [Páginas](#-páginas)
- [Arquitetura de autenticação](#-arquitetura-de-autenticação)
- [Integração com a API](#-integração-com-a-api)
- [Design system](#-design-system)
- [JavaScript — módulos](#-javascript--módulos)
- [Como rodar localmente](#-como-rodar-localmente)
- [Configuração de ambiente](#-configuração-de-ambiente)
- [Convenções de código](#-convenções-de-código)
- [Problemas conhecidos / roadmap técnico](#-problemas-conhecidos--roadmap-técnico)
- [Fluxo de trabalho e documentação](#-fluxo-de-trabalho-e-documentação)

---

## 🎯 Visão geral

O Konditor ajuda confeiteiros a saber **quanto realmente custa e quanto lucram** em cada
receita. As principais capacidades são:

- **Gestão de receitas** — cadastro, edição, cálculo automático de custo por lote / unidade / porção.
- **Gestão de ingredientes** — catálogo, estoque, alertas de mercado, unidades de medida.
- **Análise de margens** — margem real por receita e por categoria, com alertas de margem baixa.
- **Precificação inteligente** — preço sugerido a partir da margem desejada.
- **Visão de lucro / desempenho** — dashboards financeiros (em construção).

O público-alvo acessa fortemente pelo **celular**, então responsividade é um requisito de primeira classe.

---

## 🧱 Stack técnica

| Camada | Tecnologia |
|---|---|
| Marcação | HTML5 estático (uma página por rota) |
| Estilo | [Tailwind CSS](https://tailwindcss.com) **compilado em build** (`assets/css/tailwind.css`) + `assets/css/konditor.css` (utilitários custom) |
| Script | JavaScript **vanilla** (ES5/ES6, padrão IIFE, sem framework nem bundler) |
| Tipografia | Plus Jakarta Sans (títulos), Manrope (corpo) — via Google Fonts |
| Ícones | Material Symbols Outlined (Google Fonts) |
| Auth | Google OAuth 2.0 (OIDC *implicit* via popup) + JWT |
| Backend | API REST externa (repositório separado) |

> ℹ️ **Único passo de build: o CSS do Tailwind.** O site continua estático e sem bundler; o
> `assets/css/tailwind.css` (commitado) é gerado por [`scripts/build-css.sh`](scripts/build-css.sh)
> usando o **Tailwind standalone CLI** (baixado automaticamente, sem Node/npm). Rode o script
> sempre que criar/remover classes Tailwind no HTML/JS ou alterar tokens no
> [`tailwind.config.js`](tailwind.config.js). Durante o desenvolvimento: `./scripts/build-css.sh --watch`.

---

## 📂 Estrutura do projeto

```
konditor-web/
├── index.html               # Landing page (marketing)
├── login.html               # Login (Entrar com Google)
├── onboarding.html          # Criação do ateliê/workspace (pós-primeiro login)
├── auth-callback.html       # Recebe o id_token do popup do Google e devolve via postMessage
├── planos.html              # Planos e preços (toggle mensal/anual)
├── termos.html              # Termos de uso (com scroll-spy na navegação lateral)
│
├── receitas.html            # 🔒 Dashboard principal: lista de receitas + estatísticas
├── detalhe-receita.html     # 🔒 Detalhe da receita + slider de margem/preço
├── criar-receita.html       # 🔒 Criação de receita
├── editar-receita.html      # 🔒 Edição de receita
├── ingredientes.html        # 🔒 Catálogo e estoque de ingredientes
├── criar-ingrediente.html   # 🔒 Criação de ingrediente
├── precos.html              # 🔒 Precificação / Estratégia de Margens (em breve)
├── desempenho.html          # 🔒 Desempenho (em breve)
├── lucro.html               # 🔒 Visão de Lucro (em breve)
│
└── assets/
    ├── css/
    │   ├── konditor.css          # Utilitários custom: glass, gradientes, sidebar, range, focus
    │   ├── tailwind.source.css   # Fonte do build do Tailwind (@tailwind base/components/utilities)
    │   └── tailwind.css          # CSS gerado pelo build (commitado — é o que as páginas linkam)
    └── js/
        ├── konditor-config.js    # URL da API + Client ID Google (runtime)
        └── konditor-app.js       # Toda a lógica da aplicação (~3.2k linhas)
```

> 🔒 = página autenticada (exige sessão válida; redireciona para `login.html` sem token).

---

## 🗺️ Páginas

### Públicas / marketing
- **`index.html`** — Landing page: hero, prova social, seção de funcionalidades, CTA.
- **`planos.html`** — Planos com alternância mensal/anual (`initBillingToggle`).
- **`termos.html`** — Termos com navegação lateral e *scroll-spy* (`initTermsScrollSpy`).
- **`login.html`** — Entrar com Google.
- **`onboarding.html`** — Passo 1: conectar Google · Passo 2: nomear o ateliê (cria workspace).
- **`auth-callback.html`** — Página utilitária do fluxo OAuth (popup → `postMessage`).

### Aplicação (autenticadas — layout com sidebar)
- **`receitas.html`** — Dashboard: estatísticas (total, margem média, melhor margem, rascunhos,
  alertas), grid de receitas com filtro por categoria e alternância publicadas/rascunhos.
- **`detalhe-receita.html?id=…`** — Detalhe: custos, ingredientes, slider de margem → preço sugerido.
- **`criar-receita.html` / `editar-receita.html`** — Formulário de receita.
- **`ingredientes.html` / `criar-ingrediente.html`** — Ingredientes e estoque.
- **`precos.html`, `desempenho.html`, `lucro.html`** — Telas já desenhadas, marcadas como
  **"em breve"** no menu (`disabled: true` em `initSidebarHtml`).

---

## 🔐 Arquitetura de autenticação

Modelo **access token + refresh token** implementado em `konditor-app.js`:

- **Access token (JWT)**: mantido **em memória** e espelhado em `sessionStorage`
  (`konditor_at`), com fallback em `localStorage` (`konditor_at_x`) para novas abas
  (middle-click / Ctrl+click).
- **Refresh token**: cookie **HttpOnly** (não acessível via JS), enviado com `credentials: 'include'`.
- **Renovação proativa**: `scheduleRefresh()` agenda um refresh ~60s antes do `exp`.
- **Auto-retry em 401**: `apiFetch()` tenta renovar o token e refaz a requisição uma vez.
- **Serialização**: `renovarToken()` reaproveita a promise em andamento para evitar refresh duplicado.

**Login com Google (OIDC implicit via popup):**
1. `initGoogleAuth()` abre popup em `accounts.google.com` com `response_type=id_token`.
2. `auth-callback.html` lê o `id_token` do fragmento e envia via `postMessage` (validando `origin`).
3. O front envia `POST /auth/google { idToken }` → recebe `accessToken`, `usuario`, `workspace`.
4. Sem workspace → `onboarding.html`; com workspace → `receitas.html`.

Dados de sessão em cache: `konditor_user`, `konditor_workspace` (localStorage).

---

## 🔌 Integração com a API

Base configurável em `window.KONDITOR_API` (ver [Configuração de ambiente](#-configuração-de-ambiente)).
Todas as chamadas autenticadas usam o helper **`apiFetch(url, options)`** (adiciona `Bearer` + `credentials`).

| Método | Endpoint | Uso |
|---|---|---|
| POST | `/auth/google` | Autentica com `id_token` do Google |
| POST | `/auth/refresh` | Renova o access token (via cookie) |
| POST | `/auth/logout` | Encerra a sessão |
| POST | `/onboarding` | Cria o workspace (`nomeWorkspace`, `moeda`) |
| GET | `/dashboard/estatisticas` | KPIs do dashboard |
| GET | `/dashboard/receitas` | Grid de receitas (`?status=rascunho` para rascunhos) |
| GET/POST | `/receitas` · `/receitas/{id}` | CRUD de receitas |
| POST | `/receitas/calcular` | Cálculo de custo/preço |
| GET | `/receitas/categorias` | Categorias de receitas |
| GET | `/ingredientes` · `/ingredientes/categorias` | Ingredientes |
| GET | `/ingredientes/estoque` (+ `/resumo`, `/alertas-mercado`) | Estoque |
| GET | `/unidades` | Unidades de medida |

---

## 🎨 Design system

Tokens no padrão **Material Design 3** (fonte única em [`tailwind.config.js`](tailwind.config.js)), estendidos no Tailwind.

- **Cor primária (marca):** `#bd0050` (*berry/rosa*).
- **Secundária:** `#006f1d` (verde — usada em indicadores positivos).
- **Superfícies:** paleta `surface-*` clara (`#f9f9fb` base).
- **Tipografia:** `font-headline` (Plus Jakarta Sans), `font-body` / `font-label` (Manrope).
- **Utilitários custom** (`konditor.css`): `.berry-gradient`, `.glass*`, estilo do slider de range,
  `:focus-visible` consistente, slide-in da sidebar em mobile, regras de `@media print`.

A **sidebar do app é injetada dinamicamente** por `initSidebarHtml()` — é a **única fonte de
verdade** do HTML do menu lateral. Alterações de navegação devem ser feitas **ali**, não em cada página.

---

## ⚙️ JavaScript — módulos

`konditor-app.js` é uma IIFE que expõe *initializers* acionados conforme os elementos presentes na página:

| Função | Responsabilidade |
|---|---|
| `initSession` / `apiFetch` / `renovarToken` | Sessão, token e fetch autenticado |
| `initGoogleAuth` | Login com Google (popup OIDC) |
| `initOnboarding` | Criação do workspace |
| `initSidebar` / `initSidebarHtml` | Sidebar mobile (slide-in) e injeção do menu |
| `initMobileNav` | Menu hambúrguer das páginas públicas |
| `initDashboard` | Estatísticas + grid de receitas + rascunhos + filtros |
| `initDetalhesReceita` | Detalhe da receita + slider de margem |
| `initRangeInputs` | Sliders com feedback visual ao vivo |
| `initFilterChips` | Chips de filtro (seleção única) |
| `initBillingToggle` | Toggle mensal/anual em `planos.html` |
| `initTermsScrollSpy` | Destaque de seção ativa em `termos.html` |

---

## 🚀 Como rodar localmente

Como é um site estático, basta servir a pasta por HTTP (não abra via `file://` — o OAuth e o
`postMessage` dependem de uma *origin* real).

```bash
# Python 3 (já disponível no macOS)
python3 -m http.server 8899
# abra http://localhost:8899/index.html
```

Se você alterou classes Tailwind ou tokens, regenere o CSS antes:

```bash
./scripts/build-css.sh          # gera assets/css/tailwind.css (minificado)
./scripts/build-css.sh --watch  # rebuild automático em desenvolvimento
```

> O login com Google exige que a **origin** esteja autorizada no Google Cloud Console e que a
> **API** (`KONDITOR_API`) esteja no ar. Sem a API, as telas públicas funcionam; as autenticadas não.

---

## 🔧 Configuração de ambiente

Editar [`assets/js/konditor-config.js`](assets/js/konditor-config.js):

```js
window.KONDITOR_API = 'http://localhost:8080';          // base da API
window.KONDITOR_GOOGLE_CLIENT_ID = '…apps.googleusercontent.com';  // OAuth Client ID
```

> ⚠️ Antes de publicar, apontar `KONDITOR_API` para a URL de produção e revisar o Client ID/origins.

---

## 📐 Convenções de código

- **Estilo via Tailwind** direto no HTML; utilitários realmente reutilizáveis vão em `konditor.css`.
- **Cores sempre via tokens** (`text-primary`, `bg-surface-container`, …), nunca hex hard-coded no HTML.
- **JS**: um `init*` por funcionalidade, *early-return* quando o elemento âncora não existe na página.
- **Segurança**: todo conteúdo vindo da API renderizado via `innerHTML` passa por `escHtml()`.
- **Navegação**: alterar o menu lateral **somente** em `initSidebarHtml()`.
- **Sem dependências novas** sem necessidade — manter o projeto leve e sem build.

---

## 🐞 Problemas conhecidos / roadmap técnico

| Prioridade | Item | Notas |
|---|---|---|
| 🟡 Média | **Semântica de headings** | Páginas do app (`precos`, `lucro`, `receitas`) sem `<h1>` |
| 🟡 Média | **Duplicação de HTML** | Header/sidebar replicados em várias páginas — avaliar SSG/includes |

---

## 🔁 Fluxo de trabalho e documentação

Este projeto mantém documentação **em dois lugares que devem andar juntos**:

1. **Aqui no repositório** — este `README.md` e o arquivo de memória do agente em
   `.claude/.../memory/` (contexto técnico consultado antes de qualquer alteração).
2. **No Notion** — página **Projetos → Konditor** (documentação de produto/arquitetura) e o
   quadro **Kanban** de tasks.

> **Regra de ouro:** ao concluir uma task que altere arquitetura, endpoints, páginas, tokens de
> design ou o fluxo de auth, **atualizar este README e a documentação no Notion** na mesma entrega,
> e mover o card correspondente no Kanban.

---

<sub>Konditor — Artisanal Intelligence · documentação mantida em conjunto com o Notion do projeto.</sub>
