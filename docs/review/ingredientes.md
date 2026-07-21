# Review — `ingredientes.html` (Gestão de Ingredientes)

**Rota:** `/ingredientes.html` · **Tipo:** app (logada) · **Objetivo:** estoque de ingredientes (resumo + grid).

> Nota (2026-07-21): a feature "Alerta de Mercado" foi removida do produto. Bullets abaixo que a mencionam são anteriores à remoção.

Legenda: 🔴 Alta · 🟡 Média · 🟢 Baixa

---

## 📱 Responsividade

- 🔴 **Header sem breakpoint.** `section ... flex items-end justify-between` (linha 31) mantém o `h2 text-5xl` e o botão "Novo Ingrediente" lado a lado no mobile → aperto do estouro. Note que `receitas.html` resolve isso com `flex-col sm:flex-row` — aqui ficou inconsistente. *Correção:* `flex-col sm:flex-row sm:items-end gap-4`.
- 🔴 **`grid grid-cols-3` fixo nos cards de mercado** (linha 44): três colunas mesmo no celular → espremido/overflow. *Correção:* `grid-cols-1 sm:grid-cols-3`.
- 🟡 `main ... p-10` — padding grande no mobile (`p-4 sm:p-10`).
- 🟢 Chips com `overflow-x-auto`; grid `grid-cols-1 lg:grid-cols-2` ok.

## 🎨 Visual / UX

- 🟢 Card de "Alerta de Mercado" com variações +/− coloridas e timestamp — boa densidade de informação.
- 🟢 Uso de tokens mais limpo aqui (`error`, `primary`, `outline`) do que em `receitas.html`.

## ♿ Acessibilidade / Semântica

- 🔴 **Sem `<h1>`** — começa em `<h2>` (linha 34).
- 🟡 **Salto de hierarquia de headings.** "3 Atualizações" é `<h4>` (linha 52) logo após um `<h2>`, pulando o `<h3>`. *Correção:* usar `<h3>` (ou `<p>` estilizado se não for título estrutural).
- 🟢 Lista de alertas semântica (`<ul>`), chips com `aria-pressed`, `skip-link`.

## 🧩 Consistência de código

- 🟢 Boa aderência a tokens (poucas cores cruas).
- 🟡 **Padrão de header divergente** do `receitas.html` (um responsivo, outro não) — padronizar o cabeçalho de página do app num único componente.
- 🟢 Sombras arbitrárias repetidas (`shadow-[0_4px_24px_rgba(0,0,0,0.02)]`).

---

### Quick wins
1. `flex-col sm:flex-row` no header (🔴 mobile).
2. `grid-cols-1 sm:grid-cols-3` nos cards de mercado (🔴 mobile).
3. `<h1>` + corrigir `<h4>`→`<h3>` (🔴/🟡 a11y).
