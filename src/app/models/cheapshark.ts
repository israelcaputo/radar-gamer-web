/**
 * Formato das respostas da API da CheapShark (https://apidocs.cheapshark.com).
 * A API devolve números como string e preços em dólar (USD).
 */

/** GET /deals */
export interface CheapSharkDeal {
  internalName: string;
  title: string;
  dealID: string;
  storeID: string;
  gameID: string;
  salePrice: string;
  normalPrice: string;
  isOnSale: '0' | '1';
  savings: string;
  metacriticScore: string;
  steamRatingText: string | null;
  steamRatingPercent: string;
  steamAppID: string | null;
  releaseDate: number;
  lastChange: number;
  dealRating: string;
  thumb: string;
}

/** GET /games?id={id} */
export interface CheapSharkGameLookup {
  info: {
    title: string;
    steamAppID: string | null;
    thumb: string;
  };
  cheapestPriceEver: {
    price: string;
    /** Data em segundos (Unix timestamp). */
    date: number;
  };
  deals: {
    storeID: string;
    dealID: string;
    price: string;
    retailPrice: string;
    savings: string;
  }[];
}

/** GET /stores */
export interface CheapSharkStore {
  storeID: string;
  storeName: string;
  isActive: 0 | 1;
  images: {
    banner: string;
    logo: string;
    icon: string;
  };
}

/** Parâmetros aceitos por GET /deals que a aplicação utiliza. */
export interface CheapSharkDealsParams {
  title?: string;
  storeID?: string;
  onSale?: 0 | 1;
  sortBy?: 'Deal Rating' | 'Title' | 'Savings' | 'Price' | 'Metacritic' | 'Reviews' | 'Recent';
  desc?: 0 | 1;
  pageSize?: number;
  pageNumber?: number;
}

/** Resposta da AwesomeAPI para /json/last/USD-BRL */
export interface CotacaoUsdBrlResponse {
  USDBRL: {
    code: string;
    codein: string;
    bid: string;
    ask: string;
    create_date: string;
  };
}
