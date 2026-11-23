import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  CheapSharkDeal,
  CheapSharkDealsParams,
  CheapSharkGameLookup,
  CheapSharkStore,
} from '../models/cheapshark';

/**
 * Acesso direto à API da CheapShark. Só faz as requisições HTTP e devolve
 * os dados no formato original; a conversão para o domínio fica no JogoService.
 */
@Injectable({ providedIn: 'root' })
export class CheapSharkService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.cheapSharkUrl;

  /** A lista de lojas quase nunca muda, então é buscada uma vez e reaproveitada. */
  private readonly lojas$ = this.http
    .get<CheapSharkStore[]>(`${this.baseUrl}/stores`)
    .pipe(shareReplay(1));

  listarOfertas(filtro: CheapSharkDealsParams): Observable<CheapSharkDeal[]> {
    let params = new HttpParams();
    for (const [chave, valor] of Object.entries(filtro)) {
      if (valor !== undefined && valor !== '') {
        params = params.set(chave, String(valor));
      }
    }
    return this.http.get<CheapSharkDeal[]>(`${this.baseUrl}/deals`, { params });
  }

  buscarJogo(id: string): Observable<CheapSharkGameLookup> {
    return this.http.get<CheapSharkGameLookup>(`${this.baseUrl}/games`, { params: { id } });
  }

  listarLojas(): Observable<CheapSharkStore[]> {
    return this.lojas$;
  }

  linkDaOferta(dealId: string): string {
    return `${environment.cheapSharkRedirectUrl}?dealID=${encodeURIComponent(dealId)}`;
  }
}
