import { CurrencyPipe } from '@angular/common';
import { Component, computed, effect, input, output } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DadosAlerta } from '../../models/alerta';
import { Loja } from '../../models/oferta';
import { CampoErro } from '../../shared/campo-erro';

export const PRECO_MAXIMO = 10000;

/**
 * Formulário reativo de alerta de preço. É o mesmo na página de detalhes
 * (criar) e na de alertas (criar e editar). Só emite `salvar` se estiver válido.
 */
@Component({
  selector: 'app-alerta-form',
  imports: [ReactiveFormsModule, CurrencyPipe, CampoErro],
  templateUrl: './alerta-form.html',
})
export class AlertaForm {
  /** Lojas que vendem o jogo, para o campo "Lojas acompanhadas". */
  readonly lojas = input<Loja[]>([]);
  /** Valores iniciais (edição). Sem valor = formulário de criação. */
  readonly valor = input<DadosAlerta | null>(null);
  /** Valor sugerido para o preço-alvo quando é um alerta novo. */
  readonly sugestao = input<number | null>(null);
  /** Menor preço atual, para mostrar a diferença em relação ao alvo. */
  readonly precoAtual = input<number | undefined>(undefined);
  readonly mostrarAtivo = input(false);
  readonly mostrarCancelar = input(false);
  readonly textoBotao = input('Criar alerta');
  readonly enviando = input(false);

  readonly salvar = output<DadosAlerta>();
  readonly cancelar = output<void>();

  protected readonly form = new FormGroup({
    precoAlvo: new FormControl<number | null>(null, [
      Validators.required,
      Validators.min(0.01),
      Validators.max(PRECO_MAXIMO),
    ]),
    lojaId: new FormControl('', { nonNullable: true }),
    notificarEmail: new FormControl(true, { nonNullable: true }),
    ativo: new FormControl(true, { nonNullable: true }),
  });

  private readonly precoDigitado = toSignal(this.form.controls.precoAlvo.valueChanges, {
    initialValue: null,
  });

  /** Quanto o alvo está abaixo do preço atual (negativo = alvo já atingido). */
  protected readonly diferenca = computed(() => {
    const alvo = this.precoDigitado();
    const atual = this.precoAtual();
    return alvo && atual !== undefined ? atual - alvo : null;
  });

  constructor() {
    // Sempre que o alerta (ou a sugestão) mudar, recarrega os valores do formulário.
    effect(() => {
      const valor = this.valor();
      this.form.reset({
        precoAlvo: valor?.precoAlvo ?? this.sugestao(),
        lojaId: valor?.lojaId ?? '',
        notificarEmail: valor?.notificarEmail ?? true,
        ativo: valor?.ativo ?? true,
      });
    });
  }

  protected enviar(): void {
    // Campos inválidos não são enviados: mostra os erros e para aqui.
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { precoAlvo, lojaId, notificarEmail, ativo } = this.form.getRawValue();
    this.salvar.emit({
      precoAlvo: Math.round(precoAlvo! * 100) / 100,
      lojaId: lojaId || null,
      notificarEmail,
      ativo,
    });
  }
}
