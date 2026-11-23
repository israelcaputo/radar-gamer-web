import { CurrencyPipe, UpperCasePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { FiltroOfertas, Ordenacao } from '../../models/oferta';
import { CambioService } from '../../services/cambio';
import { JogoService, LOJAS_SUPORTADAS } from '../../services/jogo';
import { ImagemReserva } from '../../shared/imagem-reserva';

const FILTRO_INICIAL: FiltroOfertas = {
  termo: '',
  lojas: LOJAS_SUPORTADAS,
  somenteComDesconto: true,
  ordenacao: 'relevancia',
};

@Component({
  selector: 'app-home',
  imports: [RouterLink, CurrencyPipe, UpperCasePipe, ImagemReserva],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  private readonly jogoService = inject(JogoService);
  protected readonly cotacao = inject(CambioService).cotacao;
  protected readonly lojas = this.jogoService.lojas;

  protected readonly opcoesOrdenacao: { valor: Ordenacao; rotulo: string }[] = [
    { valor: 'relevancia', rotulo: 'Relevância' },
    { valor: 'menor-preco', rotulo: 'Menor preço' },
    { valor: 'maior-desconto', rotulo: 'Maior desconto' },
    { valor: 'titulo', rotulo: 'Título (A–Z)' },
  ];

  // Estado dos filtros na tela (editado pelo usuário, ainda não aplicado).
  protected readonly termo = signal(FILTRO_INICIAL.termo);
  protected readonly lojasSelecionadas = signal<string[]>(FILTRO_INICIAL.lojas);
  protected readonly somenteComDesconto = signal(FILTRO_INICIAL.somenteComDesconto);

  // Filtro efetivamente enviado à API. Mudar este signal dispara uma nova busca.
  protected readonly filtro = signal<FiltroOfertas>(FILTRO_INICIAL);

  protected readonly ofertas = rxResource({
    params: () => this.filtro(),
    stream: ({ params }) => this.jogoService.buscarOfertas(params),
    defaultValue: [],
  });

  /** Jogo em destaque: a oferta com maior desconto entre os resultados. */
  protected readonly destaque = computed(() => {
    const lista = this.ofertas.value();
    return lista.length ? lista.reduce((a, b) => (b.desconto > a.desconto ? b : a)) : undefined;
  });

  protected alternarLoja(id: string): void {
    this.lojasSelecionadas.update((atuais) =>
      atuais.includes(id) ? atuais.filter((l) => l !== id) : [...atuais, id],
    );
  }

  protected buscar(): void {
    this.filtro.update((f) => ({
      ...f,
      termo: this.termo(),
      lojas: this.lojasSelecionadas(),
      somenteComDesconto: this.somenteComDesconto(),
    }));
  }

  protected ordenar(ordenacao: string): void {
    this.filtro.update((f) => ({ ...f, ordenacao: ordenacao as Ordenacao }));
  }

  protected limparFiltros(): void {
    this.termo.set(FILTRO_INICIAL.termo);
    this.lojasSelecionadas.set(FILTRO_INICIAL.lojas);
    this.somenteComDesconto.set(FILTRO_INICIAL.somenteComDesconto);
    this.filtro.set(FILTRO_INICIAL);
  }
}
