import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Observable, catchError, map, of, shareReplay } from 'rxjs';
import { environment } from '../../environments/environment';
import { CotacaoUsdBrlResponse } from '../models/cheapshark';
import { Cotacao } from '../models/oferta';

/**
 * Busca a cotação do dólar na AwesomeAPI e converte valores de USD para BRL.
 * A cotação é buscada uma única vez e compartilhada por toda a aplicação.
 */
@Injectable({ providedIn: 'root' })
export class CambioService {
  private readonly http = inject(HttpClient);

  readonly cotacao$: Observable<Cotacao> = this.http
    .get<CotacaoUsdBrlResponse>(environment.cambioUrl)
    .pipe(
      map((resposta): Cotacao => ({
        valor: Number(resposta.USDBRL.bid),
        origem: 'api',
        atualizadaEm: new Date(resposta.USDBRL.create_date.replace(' ', 'T')),
      })),
      catchError(() =>
        of<Cotacao>({
          valor: environment.cotacaoReserva,
          origem: 'reserva',
          atualizadaEm: new Date(),
        }),
      ),
      shareReplay(1),
    );

  /** Cotação atual como signal, para exibir na interface. */
  readonly cotacao = toSignal(this.cotacao$);

  /** Converte um valor em dólar para real, arredondando para centavos. */
  converter(valorUsd: number | string, cotacao: number): number {
    return Math.round(Number(valorUsd) * cotacao * 100) / 100;
  }
}
