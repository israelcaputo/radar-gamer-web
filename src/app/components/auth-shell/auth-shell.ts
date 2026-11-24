import { Component, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * Moldura das telas de login e cadastro: imagem com a proposta do app à
 * esquerda e o formulário (conteúdo projetado) à direita.
 */
@Component({
  selector: 'app-auth-shell',
  imports: [RouterLink],
  templateUrl: './auth-shell.html',
})
export class AuthShell {
  /** Linhas do título grande sobre a imagem. */
  readonly destaque = input.required<string[]>();
  readonly pergunta = input.required<string>();
  readonly textoLink = input.required<string>();
  readonly rotaLink = input.required<string>();

  protected readonly anoAtual = new Date().getFullYear();
  protected readonly imagemFundo =
    'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1245620/library_hero.jpg';
  protected readonly imagemFalhou = signal(false);
}
