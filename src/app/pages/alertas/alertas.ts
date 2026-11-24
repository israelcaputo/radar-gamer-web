import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, input, linkedSignal, signal } from '@angular/core';
import { rxResource, takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import {
  FormControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { catchError, debounceTime, distinctUntilChanged, finalize, map, of, switchMap } from 'rxjs';
import { AlertaForm } from '../../components/alerta-form/alerta-form';
import { Alerta, DadosAlerta, StatusAlerta } from '../../models/alerta';
import { JogoBusca, Loja } from '../../models/oferta';
import { AlertaService } from '../../services/alerta';
import { JogoService } from '../../services/jogo';
import { CampoErro } from '../../shared/campo-erro';
import { mensagemDeErro } from '../../shared/erros';
import { ImagemReserva } from '../../shared/imagem-reserva';

type FiltroStatus = 'todos' | StatusAlerta;

@Component({
  selector: 'app-alertas',
  imports: [RouterLink, ReactiveFormsModule, CurrencyPipe, ImagemReserva, AlertaForm, CampoErro],
  templateUrl: './alertas.html',
  styleUrl: './alertas.css',
})
export class Alertas {
  private readonly alertaService = inject(AlertaService);
  private readonly jogoService = inject(JogoService);
  private readonly fb = inject(NonNullableFormBuilder);

  /** ?editar=<id> abre direto a edição (link "Ver alerta" da lista de desejos). */
  readonly editar = input<string>();

  protected readonly rotulosStatus: Record<StatusAlerta, string> = {
    ativo: 'Ativo',
    'meta-atingida': 'Meta atingida',
    pausado: 'Pausado',
  };

  // ---------- Listagem ----------

  protected readonly dados = rxResource({ stream: () => this.alertaService.carregar() });

  protected readonly precos = rxResource({
    params: () => this.alertaService.alertas().map((a) => a.jogoId),
    stream: ({ params }) => this.jogoService.detalharVarios(params),
    defaultValue: new Map(),
  });

  protected readonly itens = computed(() =>
    this.alertaService.comPrecos(this.alertaService.alertas(), this.precos.value()),
  );

  protected readonly resumo = computed(() => this.alertaService.resumo(this.itens()));

  /** Formulário reativo de pesquisa e filtro por status. */
  protected readonly filtros = this.fb.group({
    busca: ['', [Validators.maxLength(60)]],
    status: ['todos' as FiltroStatus],
  });
  private readonly valoresFiltro = toSignal(this.filtros.valueChanges, {
    initialValue: this.filtros.getRawValue(),
  });

  protected readonly itensFiltrados = computed(() => {
    const { busca = '', status = 'todos' } = this.valoresFiltro();
    const termo = busca.trim().toLowerCase();
    return this.itens().filter(
      (i) =>
        i.alerta.titulo.toLowerCase().includes(termo) &&
        (status === 'todos' || i.status === status),
    );
  });

  protected readonly primeiraMetaAtingida = computed(() =>
    this.itens().find((i) => i.status === 'meta-atingida'),
  );

  // ---------- Edição ----------

  protected readonly editandoId = linkedSignal(() => this.editar() ?? null);

  protected readonly emEdicao = computed(() =>
    this.alertaService.alertas().find((a) => a.id === this.editandoId()),
  );

  protected readonly lojasEmEdicao = computed(() => {
    const alerta = this.emEdicao();
    return alerta ? this.lojasDo(alerta.jogoId) : [];
  });

  protected readonly salvando = signal(false);
  protected readonly removendoId = signal<string | null>(null);
  protected readonly aviso = signal<{ texto: string; erro: boolean } | null>(null);

  protected salvarEdicao(dados: DadosAlerta): void {
    const alerta = this.emEdicao();
    if (!alerta) return;
    this.salvando.set(true);
    this.alertaService
      .atualizar(alerta.id, dados)
      .pipe(finalize(() => this.salvando.set(false)))
      .subscribe({
        next: () => {
          this.editandoId.set(null);
          this.mostrar(`Alerta de ${alerta.titulo} atualizado.`);
        },
        error: (e) => this.mostrar(mensagemDeErro(e), true),
      });
  }

  protected alternarAtivo(alerta: Alerta): void {
    this.alertaService.alternarAtivo(alerta).subscribe({
      next: (salvo) =>
        this.mostrar(`Alerta de ${salvo.titulo} ${salvo.ativo ? 'retomado' : 'pausado'}.`),
      error: (e) => this.mostrar(mensagemDeErro(e), true),
    });
  }

  protected remover(alerta: Alerta): void {
    this.alertaService.remover(alerta.id).subscribe({
      next: () => {
        this.removendoId.set(null);
        if (this.editandoId() === alerta.id) this.editandoId.set(null);
        this.mostrar(`Alerta de ${alerta.titulo} removido.`);
      },
      error: (e) => this.mostrar(mensagemDeErro(e), true),
    });
  }

  // ---------- Cadastro ----------

  /** Campo de busca do jogo para um alerta novo. */
  protected readonly buscaJogo = new FormControl('', {
    nonNullable: true,
    validators: [Validators.minLength(2), Validators.maxLength(60)],
  });

  protected readonly sugestoes = signal<JogoBusca[]>([]);
  protected readonly buscandoJogos = signal(false);
  protected readonly jogoSelecionado = signal<JogoBusca | null>(null);

  protected readonly detalheSelecionado = rxResource({
    params: () => this.jogoSelecionado()?.jogoId,
    stream: ({ params }) => this.jogoService.detalhar(params),
  });

  protected readonly lojasSelecionado = computed(() =>
    (this.detalheSelecionado.value()?.ofertas ?? [])
      .map((o) => o.loja)
      .filter((l): l is Loja => !!l),
  );

  protected readonly sugestaoSelecionado = computed(() => {
    const preco = this.detalheSelecionado.value()?.ofertas[0]?.preco;
    return preco ? Math.round(preco * 0.9 * 100) / 100 : null;
  });

  protected readonly criando = signal(false);

  constructor() {
    // Busca sugestões enquanto o usuário digita (espera 400 ms sem digitar).
    this.buscaJogo.valueChanges
      .pipe(
        map((termo) => termo.trim()),
        debounceTime(400),
        distinctUntilChanged(),
        switchMap((termo) => {
          if (termo.length < 2 || this.buscaJogo.invalid) return of([]);
          this.buscandoJogos.set(true);
          return this.jogoService.pesquisarTitulos(termo).pipe(
            catchError(() => of([])),
            finalize(() => this.buscandoJogos.set(false)),
          );
        }),
        takeUntilDestroyed(),
      )
      .subscribe((jogos) => this.sugestoes.set(jogos));
  }

  protected escolherJogo(jogo: JogoBusca): void {
    this.jogoSelecionado.set(jogo);
    this.sugestoes.set([]);
    this.buscaJogo.setValue(jogo.titulo, { emitEvent: false });
  }

  protected trocarJogo(): void {
    this.jogoSelecionado.set(null);
    this.buscaJogo.reset();
  }

  protected criar(dados: DadosAlerta): void {
    const jogo = this.detalheSelecionado.value();
    if (!jogo) return;
    this.criando.set(true);
    this.alertaService
      .criar(this.jogoService.referencia(jogo), dados)
      .pipe(finalize(() => this.criando.set(false)))
      .subscribe({
        next: () => {
          this.mostrar(`Alerta de ${jogo.titulo} criado.`);
          this.trocarJogo();
        },
        error: (e) => this.mostrar(mensagemDeErro(e), true),
      });
  }

  protected jaTemAlerta(jogoId: string): boolean {
    return !!this.alertaService.doJogo(jogoId);
  }

  protected mensagemErro(erro: unknown): string {
    return mensagemDeErro(erro);
  }

  private lojasDo(jogoId: string): Loja[] {
    return (this.precos.value().get(jogoId)?.ofertas ?? [])
      .map((o) => o.loja)
      .filter((l): l is Loja => !!l);
  }

  private mostrar(texto: string, erro = false): void {
    this.aviso.set({ texto, erro });
  }
}
