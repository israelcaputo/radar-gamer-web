import { AbstractControl, AsyncValidatorFn, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Observable, catchError, map, of, switchMap, timer } from 'rxjs';

/** Pelo menos 8 caracteres, com letras e números. */
export const SENHA_FORTE = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

/** Validator de grupo: compara dois campos (ex.: senha e confirmação). */
export function camposIguais(campo: string, confirmacao: string): ValidatorFn {
  return (grupo: AbstractControl): ValidationErrors | null => {
    const valor = grupo.get(campo)?.value;
    const repetido = grupo.get(confirmacao)?.value;
    if (!repetido) return null;
    return valor === repetido ? null : { senhasDiferentes: true };
  };
}

/** Validator de grupo de checkboxes: exige ao menos um marcado. */
export function peloMenosUmMarcado(): ValidatorFn {
  return (grupo: AbstractControl): ValidationErrors | null => {
    const valores = Object.values(grupo.value ?? {});
    return valores.some(Boolean) ? null : { nenhumMarcado: true };
  };
}

/** Recusa textos formados só por espaços. */
export function naoVazio(): ValidatorFn {
  return (controle: AbstractControl): ValidationErrors | null => {
    const valor = controle.value;
    return typeof valor === 'string' && valor.length > 0 && valor.trim().length === 0
      ? { required: true }
      : null;
  };
}

/**
 * Validator assíncrono: consulta a Web API e marca erro se o e-mail já existe.
 * O timer espera o usuário parar de digitar antes de fazer a requisição.
 */
export function emailDisponivel(
  consulta: (email: string) => Observable<boolean>,
): AsyncValidatorFn {
  return (controle: AbstractControl): Observable<ValidationErrors | null> => {
    if (!controle.value) return of(null);
    return timer(400).pipe(
      switchMap(() => consulta(controle.value)),
      map((existe) => (existe ? { emailEmUso: true } : null)),
      // Se a API estiver fora do ar, não trava o formulário; o service confere de novo ao salvar.
      catchError(() => of(null)),
    );
  };
}
