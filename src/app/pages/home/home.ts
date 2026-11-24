import { CurrencyPipe, UpperCasePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { rxResource, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormControl,
  FormRecord,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { FiltroOfertas, Oferta, Ordenacao } from '../../models/oferta';
import { CambioService } from '../../services/cambio';
import { DesejoService } from '../../services/desejo';
import { JogoService, LOJAS_SUPORTADAS } from '../../services/jogo';
import { CampoErro } from '../../shared/campo-erro';
import { mensagemDeErro } from '../../shared/erros';
import { ImagemReserva } from '../../shared/imagem-reserva';
import { peloMenosUmMarcado } from '../../shared/validadores';

const FILTRO_INICIAL: FiltroOfertas = {
  termo: '',
  lojas: LOJAS_SUPORTADAS,
  somenteComDesconto: true,
  ordenacao: 'relevancia',
};

@Component({
  selector: 'app-home',
  imports: [RouterLink, ReactiveFormsModule, CurrencyPipe, UpperCasePipe, ImagemReserva, CampoErro],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  private readonly jogoService = inject(JogoService);
  protected readonly desejos = inject(DesejoService);
  protected readonly cotacao = inject(CambioService).cotacao;
  protected readonly lojas = this.jogoService.lojas;

  protected readonly opcoesOrdenacao: { valor: Ordenacao; rotulo: string }[] = [
    { valor: 'relevancia', rotulo: 'Relevância' },
    { valor: 'menor-preco', rotulo: 'Menor preço' },
    { valor: 'maior-desconto', rotulo: 'Maior desconto' },
    { valor: 'titulo', rotulo: 'Título (A–Z)' },
  ];

  /** Formulário reativo da busca e dos filtros. */
  protected readonly form = inject(NonNullableFormBuilder).group({
    termo: ['', [Validators.maxLength(60)]],
    // Um checkbox por loja, criado a partir da lista de lojas suportadas.
    lojas: new FormRecord<FormControl<boolean>>(
      Object.fromEntries(
        LOJAS_SUPORTADAS.map((id) => [id, new FormControl(true, { nonNullable: true })]),
      ),
      { validators: peloMenosUmMarcado() },
    ),
    somenteComDesconto: [true],
    ordenacao: ['relevancia' as Ordenacao],
  });

  /** Filtro enviado à API. Mudar este signal dispara uma nova busca. */
  protected readonly filtro = signal<FiltroOfertas>(FILTRO_INICIAL);

  protected readonly ofertas = rxResource({
    params: () => this.filtro(),
    stream: ({ params }) => this.jogoService.buscarOfertas(params),
    defaultValue: [],
  });

  /** Carrega a lista de desejos para marcar os corações dos cards. */
  private readonly listaDesejos = rxResource({ stream: () => this.desejos.garantirCarregada() });

  protected readonly destaque = computed(() => {
    const lista = this.ofertas.value();
    return lista.length ? lista.reduce((a, b) => (b.desconto > a.desconto ? b : a)) : undefined;
  });

  protected readonly aviso = signal('');

  constructor() {
    // A ordenação é aplicada assim que o usuário troca a opção.
    this.form.controls.ordenacao.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((ordenacao) => this.filtro.update((f) => ({ ...f, ordenacao })));
  }

  protected buscar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { termo, lojas, somenteComDesconto, ordenacao } = this.form.getRawValue();
    this.filtro.set({
      termo: termo.trim(),
      lojas: Object.keys(lojas).filter((id) => lojas[id]),
      somenteComDesconto,
      ordenacao,
    });
  }

  protected limparFiltros(): void {
    this.form.reset();
    this.filtro.set(FILTRO_INICIAL);
  }

  protected alternarDesejo(evento: Event, oferta: Oferta): void {
    // O card inteiro é um link; o clique no coração não deve abrir os detalhes.
    evento.preventDefault();
    evento.stopPropagation();
    this.desejos.alternar(this.jogoService.referencia(oferta)).subscribe({
      next: (salvo) =>
        this.aviso.set(
          salvo
            ? `${oferta.titulo} foi para a sua lista de desejos.`
            : `${oferta.titulo} saiu da sua lista.`,
        ),
      error: (e) => this.aviso.set(mensagemDeErro(e)),
    });
  }

  protected erroListaDesejos(): string {
    return this.listaDesejos.error() ? mensagemDeErro(this.listaDesejos.error()) : '';
  }
}
