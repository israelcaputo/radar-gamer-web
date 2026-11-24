/**
 * Modelos de domínio usados pelas telas. Os dados vêm da CheapShark,
 * já convertidos de dólar para real.
 */

export interface Loja {
  id: string;
  nome: string;
  ativa: boolean;
  logo: string;
  icone: string;
}

export interface Oferta {
  dealId: string;
  jogoId: string;
  titulo: string;
  loja: Loja | undefined;
  preco: number;
  precoOriginal: number;
  /** Desconto em porcentagem inteira (ex.: 40 = -40%). */
  desconto: number;
  imagem: string;
  imagemReserva: string;
  linkLoja: string;
}

export interface JogoDetalhe {
  id: string;
  titulo: string;
  steamAppId: string | null;
  capa: string;
  banner: string;
  imagemReserva: string;
  menorPrecoHistorico: { preco: number; data: Date };
  /** Ofertas de cada loja, ordenadas do menor para o maior preço. */
  ofertas: Oferta[];
}

export type Ordenacao = 'relevancia' | 'menor-preco' | 'maior-desconto' | 'titulo';

export interface FiltroOfertas {
  termo: string;
  lojas: string[];
  somenteComDesconto: boolean;
  ordenacao: Ordenacao;
}

export interface Cotacao {
  valor: number;
  origem: 'api' | 'reserva';
  atualizadaEm: Date;
}

/** Resultado da busca de jogos por título (usado ao cadastrar um alerta). */
export interface JogoBusca {
  jogoId: string;
  titulo: string;
  imagem: string;
  menorPreco: number;
}
