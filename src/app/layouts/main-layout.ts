import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from '../components/navbar/navbar';

/** Layout das páginas internas (usuário logado): navbar, conteúdo e rodapé. */
@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, Navbar],
  template: `
    <div class="min-h-screen flex flex-col">
      <app-navbar />
      <main class="flex-1 w-full">
        <router-outlet />
      </main>
      <footer
        class="border-t border-radar-border px-8 py-5 flex flex-wrap justify-between gap-2 text-xs text-radar-text-muted"
      >
        <span>Radar Gamer · Projeto acadêmico / FUMEC</span>
        <span>
          Preços da
          <a href="https://www.cheapshark.com" target="_blank" rel="noopener" class="underline"
            >CheapShark</a
          >
          convertidos pela cotação do dia. O valor final é o da loja.
        </span>
        <span>Protótipo web · 2026</span>
      </footer>
    </div>
  `,
})
export class MainLayout {}
