# Review — `precos.html` (Precificação / Estratégia de Margens)

**Rota:** `/precos.html` · **Tipo:** app (logada, sidebar) · **Objetivo:** saúde financeira, sugestão estratégica e sliders de margem por categoria.

> ⚠️ **Inconsistência de produto:** a sidebar (`initSidebarHtml`) marca **Precificação como "em breve"/disabled**, mas esta página está totalmente construída e acessível por URL direta. Alinhar: liberar no menu ou marcar como rascunho.

Legenda: 🔴 Alta · 🟡 Média · 🟢 Baixa

---

## 📱 Responsividade

- 🔴 **`grid grid-cols-2` fixo sem breakpoint no card de Saúde Financeira** (linha 40): métricas + indicador circular ficam lado a lado mesmo em mobile → conteúdo espremido e overflow. É a dívida de overflow do `precos`. *Correção:* `grid-cols-1 sm:grid-cols-2`.
- 🟡 **`main ... p-12`** (linha 27): 48px de padding no mobile some com a largura útil, ainda mais com `p-8` nos cards. *Correção:* `p-4 sm:p-8 lg:p-12`.
- 🟢 Grid superior `md:grid-cols-3` com `md:col-span-2` colapsa bem.

## 🎨 Visual / UX

- 🟡 **Mistura de ícones emoji e Material Symbols.** O aviso do Macaron usa "⚠" emoji (linha 151) enquanto o resto usa Material Symbols. *Correção:* usar `warning` (Material Symbols) para consistência.
- 🟢 **"Salvar Alterações" como link-texto** (linha 113) tem baixa affordance para uma ação de escrita. *Correção:* botão sólido.
- 🟢 Sliders com output ao vivo e sugestão estratégica destacada = boa UX.

## ♿ Acessibilidade / Semântica

- 🔴 **Sem `<h1>`.** A página começa em `<h2>` (linha 32) — dívida de "falta de h1 nas páginas do app". *Correção:* promover o título "Estratégia de Margens" a `<h1>` (ou h1 visualmente oculto).
- 🟡 **Output do slider não é anunciado.** O `<span id="out-*">` que mostra a % (linhas 126 etc.) não tem `aria-live`; considerar `aria-valuetext` no range com sufixo "%". *Correção:* `aria-live="polite"` no span ou `aria-valuetext`.
- 🟢 Bom: sliders com `aria-label` descritivo; `skip-link`; overlay com `aria-hidden`.

## 🧩 Consistência de código

- 🟡 **Hex hard-coded no SVG** do anel: `stroke="#eceef1"` e `stroke="#bd0050"` (linhas 76–77). *Correção:* `stroke="currentColor"` + classe de token, ou variável CSS.
- 🟢 Larguras de barra inline (`style="width:75%"`) — aceitável por serem dados, mas idealmente vindas do JS.
- 🟢 Sidebar injetada via JS (padrão correto).

---

### Quick wins
1. `grid-cols-1 sm:grid-cols-2` no card de Saúde Financeira (🔴 overflow).
2. Promover título a `<h1>` (🔴 a11y) — vale para todas as telas do app.
3. Padding responsivo no `main` (`p-4 sm:p-8 lg:p-12`).
