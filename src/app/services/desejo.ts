import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, map, of, tap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { Desejo, JogoReferencia } from '../models/desejo';
import { AuthService } from './auth';

/**
 * CRUD da lista de desejos na Web API. Mantém em memória a lista do usuário logado
 * para que todas as telas (Home, Detalhes, Lista) mostrem o mesmo estado.
 */
@Injectable({ providedIn: 'root' })
export class DesejoService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly url = `${environment.apiUrl}/desejos`;

  private readonly lista = signal<Desejo[]>([]);
  /** De qual usuário é a lista em memória (evita mostrar a lista de outra conta). */
  private carregadaPara: string | null = null;

  readonly desejos = this.lista.asReadonly();
  /** IDs dos jogos salvos, para marcar o coração nos cards. */
  readonly idsSalvos = computed(() => new Set(this.lista().map((d) => d.jogoId)));

  carregar(): Observable<Desejo[]> {
    const usuarioId = this.auth.idUsuario();
    return this.http.get<Desejo[]>(this.url, { params: { usuarioId } }).pipe(
      tap((desejos) => {
        this.lista.set(desejos);
        this.carregadaPara = usuarioId;
      }),
    );
  }

  estaNaLista(jogoId: string): boolean {
    return this.idsSalvos().has(jogoId);
  }

  /** Regra de negócio: o mesmo jogo não entra duas vezes na lista. */
  adicionar(jogo: JogoReferencia): Observable<Desejo> {
    if (this.estaNaLista(jogo.jogoId)) {
      return throwError(() => new Error(`${jogo.titulo} já está na sua lista de desejos.`));
    }
    const novo: Omit<Desejo, 'id'> = {
      ...jogo,
      usuarioId: this.auth.idUsuario(),
      adicionadoEm: new Date().toISOString(),
    };
    return this.http
      .post<Desejo>(this.url, novo)
      .pipe(tap((salvo) => this.lista.update((lista) => [...lista, salvo])));
  }

  remover(id: string): Observable<void> {
    return this.http
      .delete<void>(`${this.url}/${id}`)
      .pipe(tap(() => this.lista.update((lista) => lista.filter((d) => d.id !== id))));
  }

  /** Adiciona se não estiver na lista; remove se estiver. Devolve se ficou salvo. */
  alternar(jogo: JogoReferencia): Observable<boolean> {
    const existente = this.lista().find((d) => d.jogoId === jogo.jogoId);
    return existente
      ? this.remover(existente.id).pipe(map(() => false))
      : this.adicionar(jogo).pipe(map(() => true));
  }

  /** Carrega a lista só se ainda não foi carregada (usado nos corações da Home). */
  garantirCarregada(): Observable<Desejo[]> {
    return this.carregadaPara === this.auth.idUsuario() ? of(this.lista()) : this.carregar();
  }
}
