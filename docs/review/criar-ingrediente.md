# Review — `criar-ingrediente.html` (Novo Ingrediente)

**Rota:** `/criar-ingrediente.html` · **Tipo:** app (logada) · **Objetivo:** cadastro de matéria-prima (dados, classificação, custo/estoque).

Legenda: 🔴 Alta · 🟡 Média · 🟢 Baixa

---

## 📱 Responsividade

- 🔴 **Header sem breakpoint.** `section ... flex items-end justify-between` (linha 38): `h2 text-5xl` + "Cancelar"/"Salvar Ingrediente" lado a lado no mobile → overflow. *Correção:* `flex-col sm:flex-row` (+ botões full-width no mobile).
- 🟢 **Grids de formulário corretos:** `grid grid-cols-1 sm:grid-cols-2` em todas as seções (linhas 67, 127) com `sm:col-span-2` para campos largos — bem feito.
- 🟡 `main ... p-12` — padding grande no mobile.

## 🎨 Visual / UX

- 🟢 **Melhor formulário do projeto:** seções nomeadas, indicador de obrigatório (`*`), placeholders úteis e `<p>` de erro por campo. Excelente.

## ♿ Acessibilidade / Semântica

- 🔴 **Sem `<h1>`** — h2 na linha 41.
- 🟢🟢 **Todos os inputs têm `<label for>`** e `required` onde aplicável — padrão a ser replicado no resto do app.
- 🟡 **Erros de campo não anunciados.** Os `<p id="ci-*-error">` (linhas 79, 143) não estão ligados ao input por `aria-describedby` nem têm `role="alert"`/`aria-live` → leitor de tela não anuncia a validação. *Correção:* `aria-describedby` no input + `aria-live="polite"` no `<p>`.
- 🟡 **Tooltips não focáveis por teclado** (gatilhos `<span>` com `data-tooltip`).

## 🧩 Consistência de código

- 🟡 **`bg-white/70` nos inputs** em vez de token de superfície (padrão repetido de `criar-receita.html`).
- 🟡 Header não-responsivo (mesmo desvio das outras telas do app).
- 🟢 Sombras arbitrárias repetidas.

---

### Quick wins
1. `flex-col sm:flex-row` no header (🔴 mobile).
2. `<h1>` (🔴 a11y).
3. Ligar erros de campo via `aria-describedby` + `aria-live` (🟡 a11y) — reaproveita a disciplina de labels que já existe.
