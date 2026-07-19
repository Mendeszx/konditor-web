# Review — `editar-receita.html` (Edição de Receita)

**Rota:** `/editar-receita.html` · **Tipo:** app (logada) · **Objetivo:** editar uma receita existente. Reaproveita os campos/calculadora de `criar-receita.html`.

Legenda: 🔴 Alta · 🟡 Média · 🟢 Baixa

---

## 📱 Responsividade

- 🟢 **Header com `flex-wrap`** (linha 69) → botões "Cancelar"/"Salvar" descem no mobile em vez de estourar. Melhor que o header de `criar-receita.html` (que não é responsivo). Container `max-w-4xl` mais enxuto.
- 🟡 `main ... p-12` — padding grande no mobile.
- ⚠️ Os campos do formulário reaproveitam os padrões de `criar-receita.html` → **herdam os mesmos pontos** (ver aquele relatório): `grid grid-cols-2` sem breakpoint e inputs de parâmetro sem label.

## 🎨 Visual / UX

- 🟢 **Estados completos:** breadcrumb, skeleton de carregamento, estado de erro ("Receita não encontrada") e toast `role="alert"`. Muito bom.

## ♿ Acessibilidade / Semântica

- 🔴 **Sem `<h1>`** — h2 na linha 72.
- 🟢 **Breadcrumb `<nav>` sem `aria-label`** (linha 61). *Correção:* `aria-label="Trilha de navegação"`.
- ⚠️ Herda de `criar-receita.html`: inputs de parâmetro da calculadora provavelmente sem `aria-label`, toggles sem `aria-pressed`, tooltips não focáveis. Validar e corrigir junto.

## 🧩 Consistência de código

- 🟡 **Paleta crua no skeleton** (`bg-slate-100/200`) — mesmo padrão das outras telas.
- 🟡 **Header divergente entre telas do app:** aqui usa `flex-wrap`, `detalhe` usa `flex-col sm:flex-row`, `ingredientes`/`criar-receita` não são responsivos. *Correção:* extrair um único componente de "page header" reutilizável.

---

### Quick wins
1. `<h1>` (🔴 a11y).
2. Consolidar o header de página do app num componente único (🟡).
3. Aplicar as correções de `criar-receita.md` também aqui (campos compartilhados).
