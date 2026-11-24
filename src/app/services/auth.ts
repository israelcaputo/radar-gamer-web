import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, map, switchMap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { NovoUsuario, Usuario, UsuarioSessao } from '../models/usuario';

const CHAVE_SESSAO = 'radar-gamer.sessao';

/**
 * Cadastro, login e sessão do usuário. Os usuários ficam na Web API (json-server)
 * e a sessão fica no navegador: localStorage com "Lembrar de mim", sessionStorage sem.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly url = `${environment.apiUrl}/usuarios`;

  private readonly sessao = signal<UsuarioSessao | null>(this.lerSessao());

  readonly usuario = this.sessao.asReadonly();
  readonly logado = computed(() => this.sessao() !== null);
  readonly iniciais = computed(() =>
    (this.sessao()?.nome ?? '')
      .split(' ')
      .filter(Boolean)
      .map((parte) => parte[0])
      .filter((_, i, partes) => i === 0 || i === partes.length - 1)
      .join('')
      .toUpperCase(),
  );
  readonly primeiroNome = computed(() => this.sessao()?.nome.split(' ')[0] ?? '');

  /** ID do usuário logado. Usado pelos outros services para filtrar os dados dele. */
  idUsuario(): string {
    const usuario = this.sessao();
    if (!usuario) {
      throw new Error('Nenhum usuário logado.');
    }
    return usuario.id;
  }

  emailCadastrado(email: string): Observable<boolean> {
    return this.buscarPorEmail(email).pipe(map((usuarios) => usuarios.length > 0));
  }

  /** Regra de negócio: não permite dois usuários com o mesmo e-mail. */
  cadastrar(dados: NovoUsuario): Observable<UsuarioSessao> {
    const novo: NovoUsuario = {
      nome: dados.nome.trim(),
      email: this.normalizarEmail(dados.email),
      senha: dados.senha,
    };

    return this.emailCadastrado(novo.email).pipe(
      switchMap((existe) =>
        existe
          ? throwError(() => new Error('Este e-mail já está cadastrado.'))
          : this.http.post<Usuario>(this.url, novo),
      ),
      map((usuario) => this.iniciarSessao(usuario, true)),
    );
  }

  entrar(email: string, senha: string, lembrar: boolean): Observable<UsuarioSessao> {
    return this.buscarPorEmail(email).pipe(
      switchMap((usuarios) => {
        const usuario = usuarios.find((u) => u.senha === senha);
        return usuario
          ? [this.iniciarSessao(usuario, lembrar)]
          : throwError(() => new Error('E-mail ou senha incorretos.'));
      }),
    );
  }

  sair(): void {
    localStorage.removeItem(CHAVE_SESSAO);
    sessionStorage.removeItem(CHAVE_SESSAO);
    this.sessao.set(null);
    this.router.navigate(['/login']);
  }

  private buscarPorEmail(email: string): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.url, { params: { email: this.normalizarEmail(email) } });
  }

  private normalizarEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private iniciarSessao(usuario: Usuario, lembrar: boolean): UsuarioSessao {
    const sessao: UsuarioSessao = { id: usuario.id, nome: usuario.nome, email: usuario.email };
    const armazenamento = lembrar ? localStorage : sessionStorage;
    try {
      armazenamento.setItem(CHAVE_SESSAO, JSON.stringify(sessao));
    } catch {
      // Sem acesso ao armazenamento (ex.: modo privado): a sessão vale só nesta aba.
    }
    this.sessao.set(sessao);
    return sessao;
  }

  private lerSessao(): UsuarioSessao | null {
    try {
      const salvo = localStorage.getItem(CHAVE_SESSAO) ?? sessionStorage.getItem(CHAVE_SESSAO);
      return salvo ? (JSON.parse(salvo) as UsuarioSessao) : null;
    } catch {
      return null;
    }
  }
}
