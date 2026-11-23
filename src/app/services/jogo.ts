import { Injectable, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Observable, forkJoin, map, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { CheapSharkDeal, CheapSharkDealsParams, CheapSharkStore } from '../models/cheapshark';
import { FiltroOfertas, JogoDetalhe, Loja, Oferta, Ordenacao } from '../models/oferta';
import { CambioService } from './cambio';
import { CheapSharkService } from './cheapshark';

/** Lojas exibidas nos filtros (IDs da CheapShark). */
export const LOJAS_SUPORTADAS = ['1', '3', '7', '11', '15', '25'];

const STEAM_CDN = 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps';

const ORDENACAO_API: Record<Ordenacao, CheapSharkDealsParams['sortBy']> = {
  relevancia: 'Deal Rating',
  'menor-preco': 'Price',
  'maior-desconto': 'Savings',
  titulo: 'Title',
};

/**
 * Regras de negócio sobre jogos e ofertas: junta os dados da CheapShark
 * com a cotação do dólar e entrega tudo em real, pronto para as telas.
 */
@Injectable({ providedIn: 'root' })
export class JogoService {
  private readonly cheapShark = inject(CheapSharkService);
  private readonly cambio = inject(CambioService);

  private readonly lojasPorId$: Observable<Map<string, Loja>> = this.cheapShark
    .listarLojas()
    .pipe(map((lojas) => new Map(lojas.map((l) => [l.storeID, this.paraLoja(l)]))));

  /** Lojas suportadas, para montar os filtros. */
  readonly lojas = toSignal(
    this.lojasPorId$.pipe(
      map((porId) =>
        LOJAS_SUPORTADAS.map((id) => porId.get(id)).filter((l): l is Loja => !!l?.ativa),
      ),
    ),
    { initialValue: [] as Loja[] },
  );

  /**
   * Busca ofertas e devolve uma por jogo (a mais barata entre as lojas filtradas).
   */
  buscarOfertas(filtro: FiltroOfertas): Observable<Oferta[]> {
    if (filtro.lojas.length === 0) {
      return of([]);
    }

    const ofertas$ = this.cheapShark.listarOfertas({
      title: filtro.termo.trim() || undefined,
      storeID: filtro.lojas.join(','),
      onSale: filtro.somenteComDesconto ? 1 : undefined,
      sortBy: ORDENACAO_API[filtro.ordenacao],
      desc: filtro.ordenacao === 'maior-desconto' ? 1 : 0,
      pageSize: 60,
    });

    return forkJoin([ofertas$, this.cambio.cotacao$, this.lojasPorId$]).pipe(
      map(([deals, cotacao, lojas]) =>
        this.maisBarataPorJogo(deals).map((deal) => this.paraOferta(deal, cotacao.valor, lojas)),
      ),
    );
  }

  /** Detalhes de um jogo com o preço em cada loja e o menor preço já registrado. */
  detalhar(jogoId: string): Observable<JogoDetalhe> {
    return forkJoin([
      this.cheapShark.buscarJogo(jogoId),
      this.cambio.cotacao$,
      this.lojasPorId$,
    ]).pipe(
      map(([jogo, cotacao, lojas]) => {
        const brl = (usd: string) => this.cambio.converter(usd, cotacao.valor);
        const appId = jogo.info.steamAppID;
        const imagens = this.imagens(appId, jogo.info.thumb);

        const ofertas: Oferta[] = jogo.deals
          .map((d) => ({
            dealId: d.dealID,
            jogoId,
            titulo: jogo.info.title,
            loja: lojas.get(d.storeID),
            preco: brl(d.price),
            precoOriginal: brl(d.retailPrice),
            desconto: Math.round(Number(d.savings)),
            imagem: imagens.header,
            imagemReserva: jogo.info.thumb,
            linkLoja: this.cheapShark.linkDaOferta(d.dealID),
          }))
          .sort((a, b) => a.preco - b.preco);

        return {
          id: jogoId,
          titulo: jogo.info.title,
          steamAppId: appId,
          capa: imagens.capa,
          banner: imagens.header,
          imagemReserva: jogo.info.thumb,
          menorPrecoHistorico: {
            preco: brl(jogo.cheapestPriceEver.price),
            data: new Date(jogo.cheapestPriceEver.date * 1000),
          },
          ofertas,
        };
      }),
    );
  }

  /** A API devolve uma linha por loja; mantém só a mais barata de cada jogo. */
  private maisBarataPorJogo(deals: CheapSharkDeal[]): CheapSharkDeal[] {
    const porJogo = new Map<string, CheapSharkDeal>();
    for (const deal of deals) {
      const atual = porJogo.get(deal.gameID);
      if (!atual || Number(deal.salePrice) < Number(atual.salePrice)) {
        porJogo.set(deal.gameID, deal);
      }
    }
    // Mantém a ordem em que cada jogo apareceu (respeita a ordenação pedida à API).
    const ordemOriginal = [...new Set(deals.map((d) => d.gameID))];
    return ordemOriginal.map((id) => porJogo.get(id)!);
  }

  private paraOferta(deal: CheapSharkDeal, cotacao: number, lojas: Map<string, Loja>): Oferta {
    return {
      dealId: deal.dealID,
      jogoId: deal.gameID,
      titulo: deal.title,
      loja: lojas.get(deal.storeID),
      preco: this.cambio.converter(deal.salePrice, cotacao),
      precoOriginal: this.cambio.converter(deal.normalPrice, cotacao),
      desconto: Math.round(Number(deal.savings)),
      imagem: this.imagens(deal.steamAppID, deal.thumb).header,
      imagemReserva: deal.thumb,
      linkLoja: this.cheapShark.linkDaOferta(deal.dealID),
    };
  }

  private paraLoja(loja: CheapSharkStore): Loja {
    return {
      id: loja.storeID,
      nome: loja.storeName,
      ativa: loja.isActive === 1,
      logo: environment.cheapSharkAssetsUrl + loja.images.logo,
      icone: environment.cheapSharkAssetsUrl + loja.images.icon,
    };
  }

  /** Jogos da Steam têm imagens maiores no CDN dela; os demais usam a miniatura da CheapShark. */
  private imagens(steamAppId: string | null, thumb: string) {
    if (!steamAppId) {
      return { header: thumb, capa: thumb };
    }
    return {
      header: `${STEAM_CDN}/${steamAppId}/header.jpg`,
      capa: `${STEAM_CDN}/${steamAppId}/library_600x900.jpg`,
    };
  }
}
