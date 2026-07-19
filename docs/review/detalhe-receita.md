# Review — `detalhe-receita.html` (Detalhes da Receita)

**Rota:** `/detalhe-receita.html` · **Tipo:** app (logada) · **Objetivo:** visão de uma receita: KPIs, decomposição de custos, ingredientes e otimizador de preço.

Legenda: 🔴 Alta · 🟡 Média · 🟢 Baixa

---

## 📱 Responsividade

- 🟢 **Muito boa.** Header `flex-col sm:flex-row` (linha 75), KPIs `grid-cols-2 lg:grid-cols-4`, grid principal `grid-cols-1 lg:grid-cols-12`, e até o skeleton é responsivo. Referência de como o header do app deveria ser em todas as telas.
- 🟡 `main ... p-12` — padding grande no mobile (`p-4 sm:p-12`).

## 🎨 Visual / UX

- 🟢 **Cobertura de estados exemplar:** skeleton de carregamento, conteúdo, e **estado de erro** dedicado ("Receita não encontrada" com ícone `search_off` e CTA de volta). É o padrão que as outras telas deveriam seguir.
- 🟢 Otimizador de margem com slider em card escuro + preço sugerido em destaque = ótima UX.
- 🟢 Toast com `role="alert"`.

## ♿ Acessibilidade / Semântica

- 🔴 **Sem `<h1>`** — o nome da receita é `<h2>` (linha 82).
- 🟡 **Contraste sobre o card escuro.** O card "Otimizador" usa `bg-inverse-surface` (#0c0e10) mas mantém rótulos em `text-on-surface-variant` (#5c5f63) — cinza pensado para fundo claro → contraste ~2.8:1 no escuro (falha WCAG). *Correção:* usar `text-inverse-on-surface` ou `text-white/70` nesse card.
- 🟢 Slider com `aria-label` e `aria-valuemin/max`; breadcrumb; skip-link; toast acessível.

## 🧩 Consistência de código

- 🟡 **Paleta crua no skeleton e KPIs:** `bg-slate-100/200`, `border-slate-100`, `text-slate-400` (linhas 39–61, 93–109). *Correção:* tokens de surface/outline.
- 🟡 **Token de texto claro usado em fundo escuro** (ver a11y acima) — sinal de que faltam tokens "on-inverse" no vocabulário aplicado.
- 🟢 Sombras arbitrárias repetidas.

---

### Quick wins
1. `<h1>` no nome da receita (🔴 a11y).
2. Trocar `text-on-surface-variant` por `text-white/70`/`inverse-on-surface` no card escuro (🟡 contraste).
3. Migrar `slate-*` do skeleton/KPIs para tokens (🟡).
