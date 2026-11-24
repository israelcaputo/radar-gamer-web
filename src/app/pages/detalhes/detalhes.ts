import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, inject, input, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';
import { AlertaForm } from '../../components/alerta-form/alerta-form';
import { DadosAlerta } from '../../models/alerta';
import { Loja } from '../../models/oferta';
import { AlertaService } from '../../services/alerta';
import { DesejoService } from '../../services/desejo';
import { JogoService } from '../../services/jogo';
import { mensagemDeErro } from '../../shared/erros';
import { ImagemReserva } from '../../shared/imagem-reserva';

@Component({
  selector: 'app-detalhes',
  imports: [RouterLink, CurrencyPipe, DatePipe, ImagemReserva, AlertaForm],
  templateUrl: './detalhes.html',
  styleUrl: './detalhes.css',
})
export class Detalhes {
  private readonly jogoService = inject(JogoService);
  private readonly desejoService = inject(DesejoService);
  private readonly alertaService = inject(AlertaService);

  /** Vem do parâmetro :id da rota (withComponentInputBinding). */
  readonly id = input.required<string>();

  protected readonly jogo = rxResource({
    params: () => this.id(),
    stream: ({ params }) => this.jogoService.detalhar(params),
  });

  /** Lista de desejos e alertas do usuário, para saber o estado deste jogo. */
  private readonly dadosUsuario = rxResource({
    stream: () =>
      forkJoin([this.desejoService.garantirCarregada(), this.alertaService.garantirCarregados()]),
  });

  protected readonly melhorOferta = computed(() => this.jogo.value()?.ofertas[0]);

  protected readonly lojasDoJogo = computed(() =>
    (this.jogo.value()?.ofertas ?? []).map((o) => o.loja).filter((l): l is Loja => !!l),
  );

  protected readonly naLista = computed(() => this.desejoService.idsSalvos().has(this.id()));

  protected readonly alertaExistente = computed(() =>
    this.alertaService.alertas().find((a) => a.jogoId === this.id()),
  );

  /** Sugestão inicial de preço-alvo: 10% abaixo do melhor preço atual. */
  protected readonly sugestaoPreco = computed(() => {
    const preco = this.melhorOferta()?.preco;
    return preco ? Math.round(preco * 0.9 * 100) / 100 : null;
  });

  protected readonly acimaDoHistorico = computed(() => {
    const jogo = this.jogo.value();
    const melhor = this.melhorOferta();
    return jogo && melhor ? Math.max(0, melhor.preco - jogo.menorPrecoHistorico.preco) : 0;
  });

  protected readonly salvandoAlerta = signal(false);
  protected readonly aviso = signal<{ texto: string; erro: boolean } | null>(null);

  protected alternarListaDesejos(): void {
    const jogo = this.jogo.value();
    if (!jogo) return;
    this.desejoService.alternar(this.jogoService.referencia(jogo)).subscribe({
      next: (salvo) =>
        this.mostrar(
          salvo ? 'Jogo salvo na sua lista de desejos.' : 'Jogo removido da sua lista de desejos.',
        ),
      error: (e) => this.mostrar(mensagemDeErro(e), true),
    });
  }

  protected salvarAlerta(dados: DadosAlerta): void {
    const jogo = this.jogo.value();
    if (!jogo) return;

    const existente = this.alertaExistente();
    const requisicao = existente
      ? this.alertaService.atualizar(existente.id, dados)
      : this.alertaService.criar(this.jogoService.referencia(jogo), dados);

    this.salvandoAlerta.set(true);
    requisicao.pipe(finalize(() => this.salvandoAlerta.set(false))).subscribe({
      next: () =>
        this.mostrar(
          existente ? 'Alerta atualizado.' : 'Alerta criado! Acompanhe em Meus alertas.',
        ),
      error: (e) => this.mostrar(mensagemDeErro(e), true),
    });
  }

  protected erroDadosUsuario(): string {
    const erro = this.dadosUsuario.error();
    return erro ? mensagemDeErro(erro) : '';
  }

  private mostrar(texto: string, erro = false): void {
    this.aviso.set({ texto, erro });
  }
}
