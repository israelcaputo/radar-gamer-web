# Radar Gamer (web)

Comparador de preços de jogos digitais para PC. Mostra as ofertas de várias lojas em reais,
permite salvar jogos numa lista de desejos e criar alertas de preço.

Projeto acadêmico da disciplina Desenvolvimento Web Front-End (FUMEC), feito com Angular 22.

## Como rodar

São dois processos, cada um em um terminal:

```bash
pnpm install

# 1. Web API local (json-server) com usuários, lista de desejos e alertas — porta 3000
pnpm api

# 2. Aplicação Angular — http://localhost:4200
pnpm start
```

Conta de demonstração: `joao@radargamer.com` / `radar1234` (ou crie uma conta na tela de cadastro).

## Fontes de dados

| Dado                                | Origem                                                                 |
| ----------------------------------- | ---------------------------------------------------------------------- |
| Usuários, lista de desejos, alertas | `db.json` via json-server (`http://localhost:3000`)                    |
| Ofertas, lojas e preços (USD)       | [CheapShark API](https://apidocs.cheapshark.com)                       |
| Cotação do dólar                    | [AwesomeAPI](https://docs.awesomeapi.com.br/api-de-moedas) (`USD-BRL`) |

## Estrutura

```
src/app/
  components/   navbar, moldura de login/cadastro, formulário de alerta
  guards/       authGuard (páginas internas) e visitanteGuard (login/cadastro)
  layouts/      layout das páginas internas (navbar + rodapé)
  models/       interfaces de domínio e das APIs
  pages/        login, cadastro, home, detalhes, lista-desejos, alertas
  services/     auth, desejo, alerta (CRUD na Web API), jogo, cheapshark, cambio
  shared/       validators, mensagens de erro de campo, tratamento de erros
```

## Testes

```bash
pnpm test
```
