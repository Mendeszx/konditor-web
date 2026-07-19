# Review — `receitas.html` (Dashboard / Minhas Receitas)

**Rota:** `/receitas.html` · **Tipo:** app (logada) · **Objetivo:** dashboard de receitas com stats, filtros e grid. É a home do app.

Legenda: 🔴 Alta · 🟡 Média · 🟢 Baixa

---

## 📱 Responsividade

- 🟢 **Boa no geral.** Title row `flex-col sm:flex-row`, stats `grid-cols-2 lg:grid-cols-4`, chips com `overflow-x-auto`, grid `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` — tudo com breakpoints corretos.
- 🟡 **`main ... p-10`** (linha 27): 40px de padding no mobile reduz muito a área útil. *Correção:* `p-4 sm:p-6 lg:p-10`.
- 🟢 A faixa "Melhor Margem" usa `truncate`/`min-w-0` para evitar estouro — bom cuidado.

## 🎨 Visual / UX

- 🟢 **Estados de carregamento excelentes:** skeletons `animate-pulse`, placeholders "—", badges condicionais. Referência de qualidade para o resto do app.
- 🟢 Tooltips explicativos nos stats (margem média, margem baixa) agregam muito.

## ♿ Acessibilidade / Semântica

- 🔴 **Sem `<h1>`** — começa em `<h2>` (linha 37). Dívida recorrente do app. *Correção:* `<h1>` "Minhas Receitas".
- 🟡 **Tooltips não acessíveis por teclado.** Os gatilhos são `<span class="tooltip-trigger" data-tooltip>` (linhas 72, 95) — não focáveis, então usuários de teclado/leitor de tela não acessam o conteúdo. *Correção:* usar `<button>` com `aria-describedby`/`aria-label`, ou `tabindex="0"` + handlers de foco.
- 🟢 Chips de filtro com `aria-pressed`; overlay com `aria-hidden`; `skip-link` presente.

## 🧩 Consistência de código

- 🟡 **Paleta crua do Tailwind misturada com tokens.** A página usa `border-slate-100`, `text-slate-400`, `bg-amber-50/100`, `text-amber-400/600` (linhas 55, 60, 78–90) ao lado de tokens (`on-surface`, `primary`). Isso quebra a convenção "só tokens" e cria inconsistência de cor (o "amber" dos rascunhos não é um token do design system). *Correção:* mapear `amber-*` para um token semântico de aviso (ex.: `tertiary`/novo `warning`) e `slate-*` para `surface`/`outline`.
- 🟢 `style="font-size:1.25rem"` inline em ícones → usar `text-xl`.
- 🟢 Sidebar injetada via JS (padrão correto).

---

### Quick wins
1. `<h1>` "Minhas Receitas" (🔴 a11y).
2. Tornar tooltips focáveis por teclado (🟡 a11y).
3. Substituir `slate-*`/`amber-*` por tokens (🟡 consistência) — vale para todo o app.
