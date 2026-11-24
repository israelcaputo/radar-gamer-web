import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Alerta, StatusAlerta } from '../../models/alerta';
import { Desejo } from '../../models/desejo';
import { Oferta } from '../../models/oferta';
import { AlertaService } from '../../services/alerta';
import { DesejoService } from '../../services/desejo';
import { JogoService } from '../../services/jogo';
import { CampoErro } from '../../shared/campo-erro';
import { mensagemDeErro } from '../../shared/erros';
import { ImagemReserva } from '../../shared/imagem-reserva';

type OrdemLista = 'adicionados' | 'menor-preco' | 'maior-desconto' | 'titulo';

interface ItemLista {
  desejo: Desejo;
  oferta: Oferta | undefined;
  alerta: Alerta | undefined;
  statusAlerta: StatusAlerta | undefined;
}

@Component({
  selector: 'app-lista-desejos',
  imports: [RouterLink, ReactiveFormsModule, CurrencyPipe, ImagemReserva, CampoErro],
  templateUrl: './lista-desejos.html',
  styleUrl: './lista-desejos.css',
})
export class ListaDesejos {
  private readonly desejoService = inject(DesejoService);
  private readonly alertaService = inject(AlertaService);
  private readonly jogoService = inject(JogoService);

  protected readonly opcoesOrdem: { valor: OrdemLista; rotulo: string }[] = [
    { valor: 'adicionados', rotulo: 'Adicionados recentemente' },
    { valor: 'menor-preco', rotulo: 'Menor preço' },
    { valor: 'maior-desconto', rotulo: 'Maior desconto' },
    { valor: 'titulo', rotulo: 'Título (A–Z)' },
  ];

  /** Formulário reativo de busca e ordenação dentro da lista. */
  protected readonly filtros = inject(NonNullableFormBuilder).group({
    busca: ['', [Validators.maxLength(60)]],
    ordem: ['adicionados' as OrdemLista],
  });
  private readonly valoresFiltro = toSignal(this.filtros.valueChanges, {
    initialValue: this.filtros.getRawValue(),
  });

  /** Busca a lista de desejos e os alertas do usuário na Web API. */
  protected readonly dados = rxResource({
    stream: () => forkJoin([this.desejoService.carregar(), this.alertaService.carregar()]),
  });

  /** Preços atuais dos jogos da lista, numa única consulta à CheapShark. */
  protected readonly precos = rxResource({
    params: () => this.desejoService.desejos().map((d) => d.jogoId),
    stream: ({ params }) => this.jogoService.detalharVarios(params),
    defaultValue: new Map(),
  });

  protected readonly itens = computed<ItemLista[]>(() => {
    const jogos = this.precos.value();
    return this.desejoService.desejos().map((desejo) => {
      const alerta = this.alertaService.alertas().find((a) => a.jogoId === desejo.jogoId);
      const oferta = jogos.get(desejo.jogoId)?.ofertas[0];
      const ofertaAlerta = alerta
        ? this.alertaService.melhorOferta(alerta, jogos.get(desejo.jogoId))
        : undefined;
      return {
        desejo,
        oferta,
        alerta,
        statusAlerta: alerta ? this.alertaService.status(alerta, ofertaAlerta) : undefined,
      };
    });
  });

  protected readonly itensFiltrados = computed(() => {
    const { busca = '', ordem = 'adicionados' } = this.valoresFiltro();
    const termo = busca.trim().toLowerCase();
    const lista = this.itens().filter((i) => i.desejo.titulo.toLowerCase().includes(termo));
    const preco = (i: ItemLista) => i.oferta?.preco ?? Infinity;

    switch (ordem) {
      case 'menor-preco':
        return lista.sort((a, b) => preco(a) - preco(b));
      case 'maior-desconto':
        return lista.sort((a, b) => (b.oferta?.desconto ?? 0) - (a.oferta?.desconto ?? 0));
      case 'titulo':
        return lista.sort((a, b) => a.desejo.titulo.localeCompare(b.desejo.titulo));
      default:
        return lista.sort((a, b) => b.desejo.adicionadoEm.localeCompare(a.desejo.adicionadoEm));
    }
  });

  /** Números do topo da página. */
  protected readonly resumo = computed(() => {
    const itens = this.itens();
    const emPromocao = itens.filter((i) => (i.oferta?.desconto ?? 0) > 0);
    return {
      salvos: itens.length,
      emPromocao: emPromocao.length,
      metasAtingidas: itens.filter((i) => i.statusAlerta === 'meta-atingida').length,
      economia: emPromocao.reduce(
        (total, i) => total + (i.oferta!.precoOriginal - i.oferta!.preco),
        0,
      ),
    };
  });

  protected readonly removendo = signal<string | null>(null);
  protected readonly erro = signal('');

  protected remover(desejo: Desejo): void {
    this.removendo.set(desejo.id);
    this.desejoService.remover(desejo.id).subscribe({
      next: () => this.removendo.set(null),
      error: (e) => {
        this.removendo.set(null);
        this.erro.set(mensagemDeErro(e));
      },
    });
  }

  protected mensagemErro(erro: unknown): string {
    return mensagemDeErro(erro);
  }
}
