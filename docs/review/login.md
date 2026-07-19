# Review — `login.html`

**Rota:** `/login.html` · **Tipo:** pública · **Objetivo:** login passwordless via Google.

Legenda: 🔴 Alta · 🟡 Média · 🟢 Baixa

---

## 📱 Responsividade

- 🟢 **Sólida.** `min-h-screen flex flex-col items-center justify-center p-6` com card `max-w-md` (linhas 18, 27). Sem larguras fixas; adapta bem do desktop ao mobile. Footer `flex-col md:flex-row`. Nenhum overflow esperado.

## 🎨 Visual / UX

- 🟢 Fluxo enxuto e claro (só Google, sem senha). Card com glass + sombra suave, boa hierarquia.
- 🟡 **Feedback de erro é só `hidden`.** `<p data-auth-error class="hidden">` (linha 61) aparece via JS mas não é anunciado nem tem ícone. *Correção:* adicionar `role="alert"` (ver a11y) e um ícone de erro.
- 🟢 Considerar um link "Voltar ao site" / logo já leva à home (ok).

## ♿ Acessibilidade / Semântica

- 🟡 **Região de erro sem `aria-live`.** `data-auth-error` só alterna `hidden` (linha 61) → leitores de tela não anunciam o erro ao surgir. *Correção:* `role="alert"` (ou `aria-live="assertive"`).
- 🟢 Bom: `skip-link`, um `<h1>`, `type="button"` no botão, SVG do Google com `aria-hidden="true"`, contraste adequado.

## 🧩 Consistência de código

- 🟡 **Hex hard-coded no HTML.** `style="color:#bd0050;"` no parágrafo de erro (linha 61) viola a convenção de tokens. *Correção:* usar `text-primary`.
- 🟡 **Footer duplicado** (idêntico ao de todas as páginas públicas). *Correção:* partial compartilhado.
- 🟢 `rounded-[2rem]` e sombra arbitrária `shadow-[0_40px_40px_-20px_...]` — valores mágicos; considerar token de raio/sombra.

---

### Quick wins
1. Trocar `style="color:#bd0050;"` por `text-primary` (🟡 token).
2. `role="alert"` na `<p data-auth-error>` (🟡 a11y).
