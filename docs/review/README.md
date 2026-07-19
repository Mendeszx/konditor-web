# Revisão de Front-end — Konditor

Relatório de revisão das telas do Konditor nos 4 eixos pedidos: **responsividade mobile**, **polish visual/UX**, **acessibilidade/semântica** e **consistência de código**. Um `.md` por página.

## Método

- **Base: análise de código** (HTML de cada rota + `assets/css/konditor.css` + tokens em `konditor-config.js`). A responsividade foi avaliada pelas classes Tailwind (larguras fixas, breakpoints `md:`/`lg:`, `overflow`), que é como as dívidas conhecidas foram mapeadas.
- **Visual desktop** conferido no navegador (`localhost:4599`) para as páginas públicas.
- **Limitações:** (1) as páginas do app (`receitas`, `criar/editar/detalhe-receita`, `ingredientes`, `criar-ingrediente`, `desempenho`, `lucro`) **redirecionam para o login sem sessão**, então não foram vistas renderizadas — a revisão delas é por código; (2) o resize da janela do Chrome aqui não altera o viewport da captura, então não há screenshots mobile confiáveis. `auth-callback.html` é redirect técnico, sem UI — não revisado.

## Índice

| Página | Tipo | Destaques |
|---|---|---|
| [index](index.md) | pública | 🔴 cards flutuantes do hero causam overflow mobile; 🔴 ratings de estrela sem alt |
| [login](login.md) | pública | 🟢 responsivo; 🟡 hex inline + erro sem `aria-live` |
| [onboarding](onboarding.md) | pública | 🟡 "4 passos" mas só 2; barras de progresso sem semântica |
| [precos](precos.md) | app | 🔴 `grid-cols-2` fixo → overflow; 🔴 sem `<h1>`; inconsistência "em breve" |
| [planos](planos.md) | pública | 🔴 cards de preço + faixa social estouram no mobile |
| [termos](termos.md) | pública | 🟢 melhor responsividade; 🟡 sem `<h1>`; data desatualizada |
| [receitas](receitas.md) | app | 🟢 estados ótimos; 🟡 paleta crua (slate/amber); tooltips sem teclado |
| [ingredientes](ingredientes.md) | app | 🔴 header + `grid-cols-3` sem breakpoint; salto h2→h4 |
| [criar-receita](criar-receita.md) | app | 🔴 inputs da calculadora sem label; header não-responsivo |
| [editar-receita](editar-receita.md) | app | 🟢 estados completos; herda pontos de criar-receita |
| [detalhe-receita](detalhe-receita.md) | app | 🟢 referência de estados; 🟡 contraste em card escuro |
| [criar-ingrediente](criar-ingrediente.md) | app | 🟢 melhor form (labels); 🔴 header; erros sem `aria-live` |
| [desempenho](desempenho.md) | app | 🟢 tabela semântica; 🟡 linhas clicáveis sem teclado |
| [lucro](lucro.md) | app | 🟡 gráfico de barras inacessível; hex nos SVGs |

---

## Achados transversais (padrões que se repetem)

Estes valem a correção num só lugar (componente/utilitário) e resolvem várias telas de uma vez:

### 🔴 Prioridade alta
1. **Falta de `<h1>` em todas as telas do app.** `precos`, `receitas`, `ingredientes`, `criar/editar/detalhe-receita`, `criar-ingrediente`, `desempenho`, `lucro` começam em `<h2>`. Prejudica leitores de tela e SEO. → Promover o título de cada página a `<h1>` (pode ser `sr-only` se o design pedir).
2. **Header de página do app não-padronizado e frequentemente não-responsivo.** Vários usam `flex items-end justify-between` **sem breakpoint** (`ingredientes`, `criar-receita`, `criar-ingrediente`) → título grande + botões estouram no mobile. Outros acertam (`detalhe` com `flex-col sm:flex-row`, `editar` com `flex-wrap`). → **Extrair um único componente "page header" responsivo** e usar em todas.
3. **Grids com colunas fixas sem breakpoint** causam overflow mobile: `grid-cols-2` em `precos`/`criar-receita`, `grid-cols-3` em `ingredientes`, cards `flex-1` em `planos`. → Sempre `grid-cols-1 sm:grid-cols-N`.

### 🟡 Prioridade média
4. **Mistura de tokens com paleta crua do Tailwind.** `slate-*` e `amber-*` (em `receitas`, `detalhe-receita`, skeletons) e `bg-white/70` em inputs (`criar-receita`, `criar-ingrediente`) fogem do design system. O "amber" dos rascunhos/alertas nem é um token. → Criar tokens semânticos (ex.: `warning`) e mapear `slate→surface/outline`, `white/70→surface-container-lowest`.
5. **Tooltips não acessíveis por teclado.** Em todo o app os gatilhos são `<span class="tooltip-trigger" data-tooltip>` — não focáveis. → `<button>`/`tabindex="0"` + `aria-describedby`.
6. **Feedback de erro sem `aria-live`.** `data-auth-error` (login/onboarding) e `*-error` dos forms não são anunciados. → `role="alert"`/`aria-live` + `aria-describedby` no campo.
7. **Ícones decorativos sem `aria-hidden="true"`.** Padrão em todas as páginas (Material Symbols). → Adicionar `aria-hidden` nos decorativos; `aria-label` nos que carregam significado (ratings, tendências).
8. **Nav e footer duplicados** byte a byte nas páginas públicas. → Extrair para partial JS, como já é feito com a sidebar do app (`initSidebarHtml`).
9. **Hex hard-coded** onde tokens não alcançam: SVGs (`precos`, `lucro`: `#eceef1/#bd0050/#006f1d`), `style="color:#bd0050"` (login/onboarding), CSS `prose-konditor` (termos). → `currentColor` + classes de token / variáveis CSS.

### 🟢 Prioridade baixa
10. **Datas inconsistentes:** "Nov 2024" (`lucro`, gauge), "1 de novembro de 2024" (`termos`) vs "© 2026" nos footers.
11. **Rótulos de CTA divergentes** na landing (4 textos para a mesma ação).
12. **Typo** "Precos" (sem cedilha) no menu mobile de `planos`.
13. **Inconsistência de produto:** sidebar marca Precificação/Desempenho/Lucro como "em breve", mas as três páginas estão construídas e acessíveis por URL.

---

## Plano sugerido de correção

- **P0 — a11y estrutural (rápido, alto impacto):** `<h1>` em todas as telas do app; `aria-live` nos erros; `aria-hidden`/`aria-label` nos ícones; tooltips focáveis.
- **P1 — responsividade mobile:** componente de page header responsivo; trocar grids de coluna fixa por `grid-cols-1 sm:grid-cols-N`; esconder/reposicionar cards flutuantes do hero (`index`); revisar `planos` (cards + faixa) e `precos` (saúde financeira).
- **P2 — consistência/design system:** criar token `warning` e eliminar `slate-*`/`amber-*`/`bg-white/70`/hex em SVG; extrair nav/footer para partial; unificar sombras/raios arbitrários em tokens; acertar datas e rótulos de CTA.

> Pontos fortes a preservar: excelente cobertura de **estados** (skeletons, vazio, erro) em `receitas`/`detalhe-receita`; toasts com `role="alert"`; tabela semântica em `desempenho`; disciplina de `<label>` em `criar-ingrediente`; CSS global cuidadoso (skip-link, focus-visible, gerência de cor Display-P3, print).
