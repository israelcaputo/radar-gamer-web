import { Component, computed, input } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { AbstractControl } from '@angular/forms';
import { map, startWith, switchMap } from 'rxjs';

const MENSAGENS_PADRAO: Record<string, (erro: any) => string> = {
  required: () => 'Campo obrigatório.',
  email: () => 'Informe um e-mail válido.',
  minlength: (e) => `Use pelo menos ${e.requiredLength} caracteres.`,
  maxlength: (e) => `Use no máximo ${e.requiredLength} caracteres.`,
  min: (e) => `O valor mínimo é ${formatarNumero(e.min)}.`,
  max: (e) => `O valor máximo é ${formatarNumero(e.max)}.`,
  pattern: () => 'Formato inválido.',
};

function formatarNumero(valor: number): string {
  return valor.toLocaleString('pt-BR');
}

/**
 * Mostra a mensagem de erro de um campo do formulário reativo depois que o
 * usuário interagiu com ele (touched). Escuta os eventos do controle, então
 * também atualiza quando um validator assíncrono termina.
 *
 * Uso: <app-campo-erro [controle]="form.controls.email" />
 */
@Component({
  selector: 'app-campo-erro',
  template: `
    @if (mensagem(); as texto) {
      <p class="text-xs text-red-400 mt-1.5" role="alert">{{ texto }}</p>
    }
  `,
})
export class CampoErro {
  readonly controle = input.required<AbstractControl>();
  /** Mensagens específicas deste campo, por nome do erro. */
  readonly mensagens = input<Record<string, string>>({});

  private readonly estado = toSignal(
    toObservable(this.controle).pipe(
      switchMap((controle) =>
        controle.events.pipe(
          startWith(null),
          map(() => ({ touched: controle.touched, errors: controle.errors })),
        ),
      ),
    ),
  );

  protected readonly mensagem = computed(() => {
    const estado = this.estado();
    if (!estado?.touched || !estado.errors) return null;
    const [chave, detalhe] = Object.entries(estado.errors)[0];
    return this.mensagens()[chave] ?? MENSAGENS_PADRAO[chave]?.(detalhe) ?? 'Valor inválido.';
  });
}
