# Review — `index.html` (Landing)

**Rota:** `/index.html` · **Tipo:** pública · **Objetivo:** landing de marketing (hero, funcionalidades, missão, depoimentos, CTA).

Legenda de severidade: 🔴 Alta · 🟡 Média · 🟢 Baixa

---

## 📱 Responsividade

- 🔴 **Cards flutuantes do hero causam overflow horizontal no mobile.** Os cards "Margem Real" e "Receita Premium" usam `absolute bottom-8 -left-8` e `top-8 -right-4` (linhas 105, 116). Os offsets negativos empurram conteúdo para fora da viewport em telas estreitas, gerando scroll horizontal — é a dívida de overflow do `index` já registrada. *Correção:* esconder os cards (`hidden lg:block`) ou trocar offsets negativos por posicionamento interno no mobile.
- 🟡 **`h1` com `text-6xl` no mobile é grande demais.** `text-6xl md:text-7xl` (linha 63) → ~60px em <400px. "Confeitaria" pode quase encostar nas bordas. *Correção:* iniciar em `text-4xl sm:text-5xl md:text-7xl`.
- 🟡 **Linha de stats sem `flex-wrap`.** `flex gap-8 pt-4` (linha 79) com 3 números + 2 divisores; em telas muito estreitas pode estourar a largura. *Correção:* `flex-wrap gap-x-8 gap-y-4`.
- 🟢 A grid bento (`md:grid-cols-12`) e depoimentos (`md:grid-cols-3`) colapsam bem para 1 coluna.

## 🎨 Visual / UX

- 🟡 **Rótulos de CTA inconsistentes.** "Começar Grátis" (nav), "Começar Agora" (hero), "Experimentar Grátis" (bento), "Criar Conta Grátis" (CTA final) — quatro textos para a mesma ação. *Correção:* padronizar 1–2 variações no máximo.
- 🟢 **Sem estado de foco visível custom nos botões-link** além do global — ok, mas os botões-âncora com `active:scale-95` não têm `hover` de cor no primário. Consistência boa no geral.
- 🟢 Hierarquia visual e ritmo de espaçamento (`py-24`) muito consistentes.

## ♿ Acessibilidade / Semântica

- 🔴 **Ratings de estrelas sem texto alternativo.** Blocos de 5 `<span>star</span>` (linhas 257–262 etc.) — leitor de tela lê "star star star…" sem valor. *Correção:* envolver em `<div role="img" aria-label="5 de 5 estrelas">` e `aria-hidden` nos ícones.
- 🟡 **Ícones decorativos sem `aria-hidden="true"`.** Vários Material Symbols (`trending_up`, `star`, `check_circle`, `cake`, `arrow_forward`) são lidos pelo SR. *Correção:* adicionar `aria-hidden="true"` em ícones puramente decorativos.
- 🟢 Bem feito: `skip-link`, `aria-current="page"`, `aria-label`/`aria-expanded`/`aria-controls` no toggle mobile, `alt` descritivo nas imagens, um único `<h1>`.

## 🧩 Consistência de código

- 🟡 **Nav e footer duplicados** byte a byte em quase todas as páginas públicas (linhas 22–52 e 328–343) — dívida de duplicação de HTML. *Correção:* extrair para um include/partial JS (como já é feito com a sidebar do app).
- 🟢 **`style="font-variation-settings:'FILL' 1;"` repetido inline** em muitos ícones. *Correção:* criar utilitário `.icon-fill` no `konditor.css`.
- 🟢 Tokens usados corretamente (sem hex hard-coded no HTML).

---

### Quick wins
1. `hidden lg:block` nos cards flutuantes do hero → mata o overflow mobile (🔴).
2. `role="img" aria-label` nos ratings de estrela (🔴 a11y).
3. Reduzir `h1` mobile para `text-4xl`.
