# Review — `desempenho.html` (Desempenho de Produtos)

**Rota:** `/desempenho.html` · **Tipo:** app (logada, marcada "em breve" na sidebar) · **Objetivo:** relatório comparativo de rentabilidade em tabela.

Legenda: 🔴 Alta · 🟡 Média · 🟢 Baixa

---

## 📱 Responsividade

- 🟢 **Tabela com `overflow-x-auto`** (linha 86) — rola horizontalmente no mobile em vez de quebrar. Correto.
- 🟡 **Barra de filtros sem scroll/wrap.** `flex gap-2` com 5 chips + "Exportar CSV" num `justify-between` (linhas 71–72): no mobile os chips estouram. *Correção:* `overflow-x-auto` na lista de chips (como em `receitas.html`).
- 🟢 Quick stats `grid grid-cols-2 lg:grid-cols-4`; header sem botões (empilha bem).

## 🎨 Visual / UX

- 🟢 Tabela rica: thumbnail do produto, badge de categoria, custo/preço/margem e ícone de tendência (up/down/flat) com cor semântica. Boa leitura.
- 🟢 Exportar CSV disponível.

## ♿ Acessibilidade / Semântica

- 🔴 **Sem `<h1>`** — h2 na linha 32.
- 🟢🟢 **Tabela semântica correta:** `<table>/<thead>/<th scope="col">/<tbody>` — ótimo.
- 🟡 **Linhas clicáveis sem suporte a teclado.** `<tr class="... cursor-pointer">` (linha 99) sugere navegação por clique, mas `<tr>` não é focável. *Correção:* transformar o nome do produto num `<a>`, ou dar `tabindex="0"` + handler de tecla à linha.
- 🟢 `<img alt="">` nas thumbs (decorativas, nome ao lado) — uso correto de alt vazio.

## 🧩 Consistência de código

- 🟢 Boa aderência a tokens (secondary/error/tertiary-container etc.).
- 🟢 Dados de exemplo estáticos no HTML (serão dinâmicos) — esperado num mock.
- 🟢 Ícones de tendência sem `aria-hidden` (padrão repetido).

---

### Quick wins
1. `<h1>` (🔴 a11y).
2. `overflow-x-auto` na barra de chips de filtro (🟡 mobile).
3. Nome do produto como `<a>` para linhas navegáveis por teclado (🟡 a11y).
