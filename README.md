# 💰 Controle Financeiro Brum

Site completo de gestão financeira para o casal **Darci Brum** e **Jamylli Kauane**.

## Funcionalidades

- **Perfis separados** — cada um entra no seu perfil (com botão Sair) e pode cadastrar **mais de um e-mail**
- **Lançamentos** de entradas e saídas por perfil, com categorias: mercado, pensão, aluguel, contas, transporte, saúde, educação, lazer, cartão de crédito, empréstimos, investimentos, planejamento e categorias personalizadas
- **Dashboard** com cartões de resumo, gráfico de rosca por categoria (com porcentagens), gráfico de barras entradas × saídas dos últimos 6 meses e divisão de gastos por perfil — tudo com **tooltip ao passar o mouse** e **modal de detalhes ao clicar**
- **Cartões de crédito** — limite, fechamento, vencimento e acompanhamento da fatura do mês
- **Empréstimos** — parcelas pagas/restantes com barra de progresso
- **Investimentos** — carteira do casal com divisão por titular
- **Planejamento** — metas com progresso e orçamento mensal (teto) por categoria
- **Tema claro / escuro** com um clique, em tons pastéis neutros e fundo tranquilo
- **Filtros** por mês e por perfil (ou o casal inteiro)
- Exportação dos dados em JSON

## Como usar

Abra o `index.html` no navegador — ou acesse a versão publicada no GitHub Pages.
Os dados ficam salvos no próprio navegador (localStorage), em cada dispositivo.

> O site vem com alguns lançamentos de exemplo para você conhecer os gráficos.
> Para removê-los: **Configurações → Remover dados de exemplo**.

## Tecnologia

HTML + CSS + JavaScript puros, sem dependências. Gráficos em SVG desenhados à mão
com paleta de cores validada para acessibilidade (daltonismo e contraste).
