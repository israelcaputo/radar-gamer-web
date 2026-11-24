import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
  host: { '(document:keydown.escape)': 'menuAberto.set(false)' },
})
export class Navbar {
  protected readonly auth = inject(AuthService);
  protected readonly menuAberto = signal(false);

  protected readonly links = [
    { rota: '/home', texto: 'Ofertas' },
    { rota: '/lista-desejos', texto: 'Lista de desejos' },
    { rota: '/alertas', texto: 'Meus alertas' },
  ];

  protected sair(): void {
    this.menuAberto.set(false);
    this.auth.sair();
  }
}
