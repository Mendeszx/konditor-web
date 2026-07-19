# Review — `lucro.html` (Visão de Lucro / Rentabilidade)

**Rota:** `/lucro.html` · **Tipo:** app (logada, marcada "em breve" na sidebar) · **Objetivo:** dashboard de rentabilidade com gauge, cards-resumo e gráfico de barras.

Legenda: 🔴 Alta · 🟡 Média · 🟢 Baixa

---

## 📱 Responsividade

- 🟡 **`h2 text-6xl` sem escala mobile** (linha 33): "Rentabilidade Refinada." a ~60px pode encostar nas bordas / contribuir para o overflow do `lucro` já registrado. *Correção:* `text-4xl sm:text-5xl md:text-6xl`.
- 🟡 **Gráfico de barras com alturas inline fixas.** `style="height:144px"` + `style="height:X%"` (linhas 131–133): funciona, mas é rígido; com muitas categorias e `gap-6` pode apertar no mobile. *Correção:* revisar em telas estreitas; considerar `overflow-x-auto` no trilho de barras.
- 🟢 Hero `md:grid-cols-12`, cards `md:grid-cols-3`, seção inferior `lg:grid-cols-12` — estrutura responsiva ok.

## 🎨 Visual / UX

- 🟢 Composição forte: gauge SVG, três cards-resumo (Receita/Custo/Lucro, o último em `berry-gradient`), badges de variação e gráfico com legenda. Visualmente o dashboard mais "premium".
- 🟡 **Data "Nov 2024"** (linha 64) conflita com o "© 2026" do restante — atualizar/parametrizar.

## ♿ Acessibilidade / Semântica

- 🔴 **Sem `<h1>`** — h2 na linha 33.
- 🟡 **Gráfico de barras inacessível.** As barras são `<div>` sem valores textuais nem alternativa — leitor de tela só lê os rótulos de categoria, não os números. *Correção:* tabela de dados visualmente oculta (`sr-only`) ou `aria-label` com os valores em cada barra.
- 🟢 Gauge SVG é decorativo com o valor "68%" em texto ao lado — aceitável.

## 🧩 Consistência de código

- 🟡 **Hex hard-coded nos SVGs** do gauge: `#eceef1`, `#bd0050`, `#006f1d` (linhas 53–57) — mesma violação de `precos.html`. *Correção:* `currentColor` + classes de token ou variáveis CSS.
- 🟢 Fora os SVGs, boa aderência a tokens; dados de exemplo estáticos (mock) esperados.

---

### Quick wins
1. `<h1>` (🔴 a11y).
2. Escalar o `h2` no mobile (`text-4xl sm:text-6xl`) (🟡).
3. Tokenizar as cores dos SVGs do gauge (🟡 consistência).
