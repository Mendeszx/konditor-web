# Review — `onboarding.html`

**Rota:** `/onboarding.html` · **Tipo:** pública · **Objetivo:** configuração inicial (login Google + nome do ateliê).

Legenda: 🔴 Alta · 🟡 Média · 🟢 Baixa

---

## 📱 Responsividade

- 🟢 **Boa.** `max-w-5xl px-6`, grid `md:grid-cols-12 gap-8` colapsa para 1 coluna; barras de progresso `hidden md:flex` somem no mobile (linha 32); input e cards são fluidos.
- 🟢 Coluna visual `sticky top-24` (linha 109) — inofensiva no mobile (fica abaixo do formulário).

## 🎨 Visual / UX

- 🟡 **"4 passos simples" mas o formulário só tem 2.** Nav (linha 31) e header (linha 50) prometem 4 passos; existem apenas Step 1 (Google) e Step 2 (nome). As 4 barras de progresso reforçam a expectativa. *Correção:* alinhar a cópia à realidade (ex.: "2 passos") **ou** revelar os demais passos.
- 🟢 Estado `disabled` do botão "Finalizar" bem tratado; card de "Dica Pro" agrega bom contexto.

## ♿ Acessibilidade / Semântica

- 🟡 **Barras de progresso sem semântica.** 4 `<div>` coloridas (linhas 33–36) sem `role`/aria — SR não sabe que é um indicador de etapas. *Correção:* `role="progressbar"` com `aria-valuenow/min/max`, ou lista de etapas com `aria-current`.
- 🟡 **Erro sem `aria-live`.** `<p data-auth-error class="hidden">` (linha 79). *Correção:* `role="alert"`.
- 🟢 **Passos como `<div>`.** Poderiam ser um `<ol>` para transmitir sequência. (Baixo impacto.)
- 🟢 Bom: `<label>` associado ao input (linha 90), `maxlength`/`autocomplete`, `<h1>` único, `skip-link`, SVG Google `aria-hidden`.

## 🧩 Consistência de código

- 🟡 **Hex hard-coded:** `style="color:#bd0050;"` (linha 79) → usar `text-primary`.
- 🟡 **Nav e footer duplicados** das outras páginas públicas.

---

### Quick wins
1. Acertar a contagem de passos (cópia vs. formulário) (🟡 UX).
2. `role="alert"` no erro + `text-primary` no lugar do hex (🟡).
3. Semântica nas barras de progresso (🟡 a11y).
