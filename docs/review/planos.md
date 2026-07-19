# Review — `planos.html` (Planos e Assinaturas)

**Rota:** `/planos.html` · **Tipo:** pública · **Objetivo:** pricing com 3 planos, toggle mensal/anual e faixa social.

Legenda: 🔴 Alta · 🟡 Média · 🟢 Baixa

---

## 📱 Responsividade

- 🔴 **Cards de preço com `flex-1` + `flex-wrap` sem `min-width`** (linhas 82–85): os três `flex-1` tendem a permanecer na mesma linha e encolher em telas pequenas em vez de empilhar → 3 colunas espremidas no celular. *Correção:* `w-full sm:flex-1` ou trocar por `grid grid-cols-1 md:grid-cols-3`. Atenção ao card em destaque com `scale-105` (linha 125), que pode vazar nas bordas.
- 🔴 **Faixa social com `px-16` e `h-48` no mobile** (linhas 214–217): padding de 64px + `h2 text-5xl` + linha de 3 stats (`flex gap-8`) não cabem numa faixa de 192px de altura → overflow. *Correção:* `px-6 sm:px-16`, `text-2xl sm:text-5xl` e `flex-wrap` nos stats.
- 🟡 `pt-40` no hero é bastante espaço no mobile; considerar `pt-28 sm:pt-40`.

## 🎨 Visual / UX

- 🟢 **Toggle de cobrança** com `aria-pressed` e badge "−20%" muito bem resolvido; preços trocam via `data-annual`/`data-monthly`.
- 🟢 Card "Mais Popular" com borda/escala/sombra destaca bem o plano recomendado.
- 🟢 Boa distinção entre itens incluídos (`check_circle` verde) e não incluídos (`remove_circle` apagado).

## ♿ Acessibilidade / Semântica

- 🟡 **Estado incluído/excluído só por ícone+cor.** Nas listas de features, "não incluído" é comunicado apenas por `remove_circle` + texto acinzentado. *Correção:* `sr-only` "Incluído"/"Não incluído" ou `aria-label` no ícone.
- 🟢 Bom: `<h1>` presente (linha 59), `role="group"` + `aria-label` no toggle, `aria-current` no menu.
- 🟢 Ícones decorativos sem `aria-hidden` (padrão repetido no projeto).

## 🧩 Consistência de código

- 🟢 **Typo no menu mobile:** "Precos" sem cedilha (linha 47), enquanto o resto usa "Preços".
- 🟡 **Nav e footer duplicados**; `style="font-variation-settings:'FILL' 1;"` inline repetido.
- 🟢 Sombras arbitrárias com hex embutido (`rgba(189,0,80,0.12)`) — considerar tokens de sombra.

---

### Quick wins
1. `grid grid-cols-1 md:grid-cols-3` nos cards de preço (🔴 mobile).
2. Faixa social responsiva: `px-6 sm:px-16` + `flex-wrap` nos stats (🔴).
3. Corrigir "Precos" → "Preços" (🟢).
