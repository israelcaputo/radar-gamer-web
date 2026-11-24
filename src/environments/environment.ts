export const environment = {
  /** Web API local (json-server) com usuários, lista de desejos e alertas. Rode: pnpm api */
  apiUrl: 'http://localhost:3000',
  /** API pública de preços de jogos para PC (valores em dólar). */
  cheapSharkUrl: 'https://www.cheapshark.com/api/1.0',
  /** Página de redirecionamento da CheapShark para a loja da oferta. */
  cheapSharkRedirectUrl: 'https://www.cheapshark.com/redirect',
  /** Base das imagens (logos/ícones) das lojas. */
  cheapSharkAssetsUrl: 'https://www.cheapshark.com',
  /** API de cotações (AwesomeAPI) usada para converter dólar em real. */
  cambioUrl: 'https://economia.awesomeapi.com.br/json/last/USD-BRL',
  /** Cotação usada apenas se a API de câmbio estiver fora do ar. */
  cotacaoReserva: 5.5,
};
