# Review — `termos.html` (Central Legal)

**Rota:** `/termos.html` · **Tipo:** pública · **Objetivo:** Termos de Uso, Política de Privacidade e Cookies com nav lateral sticky.

Legenda: 🔴 Alta · 🟡 Média · 🟢 Baixa

---

## 📱 Responsividade

- 🟢 **A melhor estrutura responsiva do projeto.** `flex flex-col md:grid md:grid-cols-12 gap-12` (linha 56): a nav lateral vira full-width acima do conteúdo no mobile e só vira grid a partir de `md`. Badges de segurança com `flex-wrap`. Sem overflow esperado.

## 🎨 Visual / UX

- 🟢 Nav de seções sticky com destaque ativo (`terms-nav-link`), card "Precisa de ajuda?" com mailto e card escuro de segurança = navegação e leitura muito boas.
- 🟢 Uso de `prose-konditor` dá ritmo tipográfico consistente ao texto legal.

## ♿ Acessibilidade / Semântica

- 🟡 **Provável ausência de `<h1>`.** As três seções abrem com `<h2>` ("Termos de Uso", "Política de Privacidade", "Política de Cookies"); não há um `<h1>` que dê título à página. *Correção:* adicionar `<h1>` (ex.: "Central Legal" ou "Termos e Políticas"), visualmente oculto se preciso.
- 🟡 **Contraste de rótulos pequenos.** `text-[10px] ... text-outline` (#777b7f) fica em ~4.3:1 — abaixo do confortável para texto muito pequeno. *Correção:* usar `text-on-surface-variant` ou aumentar o tamanho.
- 🟢 **Nav de seções sem `aria-label`** (há duas `<nav>` na página). *Correção:* `aria-label="Seções do documento"`.
- 🟢 Listas `prose-konditor ul/li` mantêm semântica (o `list-style:none` só troca o marcador por um `::before`).

## 🧩 Consistência de código

- 🟡 **Data desatualizada:** "Última atualização: 1 de novembro de 2024" (linha 88) conflita com o "© 2026" do footer. *Correção:* revisar/parametrizar a data.
- 🟡 **`prose-konditor` usa hex hard-coded no CSS** (`#2f3336`, `#5c5f63`, `#bd0050`) em vez de tokens — divergência com a convenção. *Correção:* migrar para variáveis CSS dos tokens.
- 🟢 `style="margin-top:0;"` inline (linha 168) — override pontual aceitável.

---

### Quick wins
1. Adicionar `<h1>` à página (🟡 a11y/SEO).
2. Atualizar a data de "última atualização" (🟡).
3. `aria-label` na nav de seções (🟢).
