import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, of, tap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { Alerta, AlertaComPreco, DadosAlerta, StatusAlerta } from '../models/alerta';
import { JogoReferencia } from '../models/desejo';
import { JogoDetalhe, Oferta } from '../models/oferta';
import { AuthService } from './auth';

export interface ResumoAlertas {
  total: number;
  aguardando: number;
  metasAtingidas: number;
  pausados: number;
}

/**
 * CRUD de alertas de preço na Web API e as regras de negócio dos alertas:
 * qual o melhor preço nas lojas acompanhadas e se a meta foi atingida.
 */
@Injectable({ providedIn: 'root' })
export class AlertaService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly url = `${environment.apiUrl}/alertas`;

  private readonly lista = signal<Alerta[]>([]);
  private carregadaPara: string | null = null;

  readonly alertas = this.lista.asReadonly();

  carregar(): Observable<Alerta[]> {
    const usuarioId = this.auth.idUsuario();
    return this.http.get<Alerta[]>(this.url, { params: { usuarioId } }).pipe(
      tap((alertas) => {
        this.lista.set(alertas);
        this.carregadaPara = usuarioId;
      }),
    );
  }

  garantirCarregados(): Observable<Alerta[]> {
    return this.carregadaPara === this.auth.idUsuario() ? of(this.lista()) : this.carregar();
  }

  doJogo(jogoId: string): Alerta | undefined {
    return this.lista().find((a) => a.jogoId === jogoId);
  }

  /** Regra de negócio: cada jogo tem no máximo um alerta por usuário. */
  criar(jogo: JogoReferencia, dados: DadosAlerta): Observable<Alerta> {
    if (this.doJogo(jogo.jogoId)) {
      return throwError(() => new Error(`Você já tem um alerta para ${jogo.titulo}.`));
    }
    const erro = this.validar(dados);
    if (erro) {
      return throwError(() => new Error(erro));
    }

    const novo: Omit<Alerta, 'id'> = {
      ...jogo,
      ...dados,
      usuarioId: this.auth.idUsuario(),
      criadoEm: new Date().toISOString(),
    };
    return this.http
      .post<Alerta>(this.url, novo)
      .pipe(tap((salvo) => this.lista.update((lista) => [...lista, salvo])));
  }

  atualizar(id: string, mudancas: Partial<DadosAlerta>): Observable<Alerta> {
    const atual = this.lista().find((a) => a.id === id);
    const erro = atual ? this.validar({ ...atual, ...mudancas }) : null;
    if (erro) {
      return throwError(() => new Error(erro));
    }
    return this.http
      .patch<Alerta>(`${this.url}/${id}`, mudancas)
      .pipe(
        tap((salvo) => this.lista.update((lista) => lista.map((a) => (a.id === id ? salvo : a)))),
      );
  }

  alternarAtivo(alerta: Alerta): Observable<Alerta> {
    return this.atualizar(alerta.id, { ativo: !alerta.ativo });
  }

  remover(id: string): Observable<void> {
    return this.http
      .delete<void>(`${this.url}/${id}`)
      .pipe(tap(() => this.lista.update((lista) => lista.filter((a) => a.id !== id))));
  }

  /** Melhor oferta entre as lojas que o alerta acompanha. */
  melhorOferta(alerta: Pick<Alerta, 'lojaId'>, jogo: JogoDetalhe | undefined): Oferta | undefined {
    // jogo.ofertas já vem ordenado do menor para o maior preço.
    return jogo?.ofertas.find((o) => !alerta.lojaId || o.loja?.id === alerta.lojaId);
  }

  status(alerta: Alerta, oferta: Oferta | undefined): StatusAlerta {
    if (!alerta.ativo) return 'pausado';
    if (oferta && oferta.preco <= alerta.precoAlvo) return 'meta-atingida';
    return 'ativo';
  }

  /** Junta cada alerta com o preço atual e calcula o status. */
  comPrecos(alertas: Alerta[], jogos: Map<string, JogoDetalhe>): AlertaComPreco[] {
    return alertas.map((alerta) => {
      const oferta = this.melhorOferta(alerta, jogos.get(alerta.jogoId));
      return { alerta, oferta, status: this.status(alerta, oferta) };
    });
  }

  resumo(itens: AlertaComPreco[]): ResumoAlertas {
    return {
      total: itens.length,
      aguardando: itens.filter((i) => i.status === 'ativo').length,
      metasAtingidas: itens.filter((i) => i.status === 'meta-atingida').length,
      pausados: itens.filter((i) => i.status === 'pausado').length,
    };
  }

  /** Mesmas regras dos validators do formulário, repetidas aqui para proteger a API. */
  private validar(dados: DadosAlerta): string | null {
    if (!Number.isFinite(dados.precoAlvo) || dados.precoAlvo <= 0) {
      return 'O preço-alvo deve ser maior que zero.';
    }
    return null;
  }
}
