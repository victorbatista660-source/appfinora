# FINORA — DESIGN E FRONTEND

## Identidade do produto

O Finora é um gerenciador financeiro pessoal com aparência premium, confiável, contemporânea e editorial.

O design deve parecer desenvolvido por uma equipe profissional de produto, e não por um gerador automático de dashboards.

## Paleta visual

- Background: `#F7F6F2`
- Surface: `#FFFFFF`
- Primary: `#174D3A`
- Primary hover: `#103B2C`
- Accent: `#2F795B`
- Text primary: `#17231D`
- Text secondary: `#526158`
- Border: `#D9E0DA`
- Muted surface: `#EEF1EB`
- Danger: `#A52F35`

Centralize esses valores em tokens CSS reutilizáveis. Não espalhe cores hexadecimais desnecessariamente pelos componentes.

## Tipografia

- **Space Grotesk** para títulos e valores financeiros destacados.
- **Plus Jakarta Sans** para textos, navegação, formulários e tabelas.

Não utilizar Inter, Roboto ou Arial como fontes primárias.

Configure pesos, tamanhos, alturas de linha e espaçamento tipográfico de forma consistente.

## Direção de arte

- Layout editorial com espaçamento generoso.
- Composição levemente assimétrica quando melhorar a hierarquia.
- Cartões apenas quando ajudarem na leitura ou organização.
- Bordas discretas e sombras muito sutis.
- Números financeiros com destaque e alinhamento consistente (`tabular-nums`).
- Ícones Lucide usados com moderação.
- Gráficos simples, legíveis e sem efeitos decorativos excessivos.
- Transições discretas e rápidas.
- Sem gradientes roxos.
- Sem excesso de efeitos de vidro, brilhos ou elementos flutuantes.
- Não utilizar emojis como substitutos de ícones de interface.
- Não criar layouts genéricos com três cartões simétricos como solução para toda página.

## Componentes

- Personalize os componentes shadcn/ui por meio dos tokens do projeto.
- Mantenha consistência entre botões, campos, menus, tabelas, diálogos, filtros e estados de foco.
- Todos os controles visíveis devem ter comportamento coerente. Não criar botões decorativos que pareçam funcionais.

## Acessibilidade

- Preferir WCAG AAA para textos quando viável e garantir no mínimo WCAG AA nos casos restantes.
- Não comunicar informações somente por cor.
- Garantir foco visível e navegação por teclado.
- Incluir rótulos acessíveis (`aria-label`, `sr-only`).
- Respeitar `prefers-reduced-motion`.
- Utilizar áreas de interação adequadas para telas sensíveis ao toque (mínimo 44x44px).
- Garantir contraste suficiente em estados hover, disabled, focus e error.

## Responsividade

- Desenvolver primeiro para desktop, mas garantir funcionamento em tablet e celular.
- No desktop, utilizar navegação lateral refinada.
- Em telas pequenas, adaptar a navegação sem comprimir tabelas e gráficos de forma ilegível.

## Integridade dos dados

- Durante a fase visual, qualquer dado demonstrativo deve ser identificado como exemplo.
- Nunca afirmar que o Supabase, o WhatsApp ou qualquer serviço externo está conectado sem integração real.
- Não inserir credenciais ou segredos no frontend.

## Qualidade

Antes de considerar uma tela pronta:

1. Executar a aplicação.
2. Verificar o layout no navegador.
3. Testar os principais estados e interações.
4. Conferir responsividade.
5. Corrigir erros de console e problemas visuais relevantes.
6. Manter os componentes reutilizáveis e o código organizado.

Essas regras devem orientar todas as futuras implementações do Finora.
