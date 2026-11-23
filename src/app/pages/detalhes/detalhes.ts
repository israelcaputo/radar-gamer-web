import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, inject, input, linkedSignal, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { JogoService } from '../../services/jogo';
import { ImagemReserva } from '../../shared/imagem-reserva';

@Component({
  selector: 'app-detalhes',
  imports: [RouterLink, CurrencyPipe, DatePipe, ImagemReserva],
  templateUrl: './detalhes.html',
  styleUrl: './detalhes.css',
})
export class Detalhes {
  private readonly jogoService = inject(JogoService);

  /** Vem do parâmetro :id da rota (withComponentInputBinding). */
  readonly id = input.required<string>();

  protected readonly jogo = rxResource({
    params: () => this.id(),
    stream: ({ params }) => this.jogoService.detalhar(params),
  });

  protected readonly melhorOferta = computed(() => this.jogo.value()?.ofertas[0]);

  /** Diferença entre o preço atual e o menor preço já registrado. */
  protected readonly acimaDoHistorico = computed(() => {
    const jogo = this.jogo.value();
    const melhor = this.melhorOferta();
    return jogo && melhor ? Math.max(0, melhor.preco - jogo.menorPrecoHistorico.preco) : 0;
  });

  /** Sugestão inicial de preço-alvo: 10% abaixo do melhor preço atual. */
  protected readonly precoAlvo = linkedSignal(() => {
    const preco = this.melhorOferta()?.preco ?? 0;
    return Math.round(preco * 0.9 * 100) / 100;
  });

  // Mensagem temporária até a lista de desejos e os alertas irem para a Web API.
  protected readonly aviso = signal('');

  protected adicionarNaListaDesejos(): void {
    this.aviso.set(`${this.jogo.value()?.titulo} será salvo na lista de desejos na próxima etapa.`);
  }

  protected criarAlerta(): void {
    const valor = this.precoAlvo().toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    this.aviso.set(`Alerta de ${valor} será salvo na próxima etapa.`);
  }
}
