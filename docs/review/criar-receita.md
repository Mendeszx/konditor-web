# Review — `criar-receita.html` (Criação de Receita)

**Rota:** `/criar-receita.html` · **Tipo:** app (logada) · **Objetivo:** formulário de nova receita com calculadora de custo/preço em tempo real.

Legenda: 🔴 Alta · 🟡 Média · 🟢 Baixa

---

## 📱 Responsividade

- 🔴 **Header sem breakpoint.** `section ... flex items-end justify-between` (linha 37): `h2 text-5xl` + botões "Salvar Rascunho"/"Publicar" lado a lado no mobile → overflow. *Correção:* `flex-col sm:flex-row` e empilhar botões.
- 🟡 **`grid grid-cols-2` fixo** em Categoria + Tempo de Preparo (linha 85): dois `<select>`/inputs lado a lado mesmo no celular. *Correção:* `grid-cols-1 sm:grid-cols-2` (como já é feito no bloco de cima, linha 63).
- 🟡 `main ... p-12` — padding grande no mobile.
- 🟢 Layout principal `grid-cols-1 lg:grid-cols-12` (form 8 / análise 4) colapsa bem; o painel de análise `sticky top-24` cai abaixo do form no mobile.

## 🎨 Visual / UX

- 🟢 **Calculadora de custo em tempo real é o ponto alto do produto:** parâmetros editáveis (mão de obra, custos fixos %/R$, margem), métricas, preço sugerido e detalhamento por g/porção. Muito bem pensado.
- 🟢 **Toast com `role="alert" aria-live="assertive"`** (linha 20) — feedback acessível bem feito.
- 🟢 Busca de ingredientes com dropdown + estado vazio explicativo.

## ♿ Acessibilidade / Semântica

- 🔴 **Sem `<h1>`** — h2 na linha 40.
- 🔴 **Inputs de parâmetro sem label associado.** "Mão de Obra", "Custos Fixos", "Margem de Lucro" usam `<span>` visual (linhas 194, 208, 227), mas os inputs `#input-valor-hora`, `#input-custos-fixos`, `#input-margem` não têm `<label for>` nem `aria-label` → leitor de tela lê "campo numérico" sem nome. *Correção:* adicionar `aria-label` a cada input.
- 🟡 **Toggle "%/R$" sem estado acessível.** Botões (linhas 213–216) não têm `aria-pressed`. *Correção:* `aria-pressed` refletindo o modo ativo.
- 🟡 **Tooltips não acessíveis por teclado** (gatilhos `<span>` com `data-tooltip`).
- 🟢 Bom: inputs principais com `<label for>`, `type="number"` com `min/max/step`, `inputmode`, selects nativos (com seta custom via `appearance-none`).

## 🧩 Consistência de código

- 🟡 **`bg-white/70` em vez de token.** Repetido em quase todos os inputs (linhas 66, 74, 92…) — deveria ser `bg-surface-container-lowest/70` ou similar. *Correção:* token de fundo de input.
- 🟢 Radii/sombras arbitrárias (`rounded-[2.5rem]`, `shadow-[0_40px_80px_rgba(189,0,80,0.08)]`).
- 🟢 Header não-responsivo repete o desvio de padrão de `ingredientes.html`.

---

### Quick wins
1. `aria-label` nos inputs de parâmetro da calculadora (🔴 a11y).
2. `<h1>` + header responsivo (🔴/🟡).
3. `grid-cols-1 sm:grid-cols-2` em Categoria/Tempo (🟡 mobile).
