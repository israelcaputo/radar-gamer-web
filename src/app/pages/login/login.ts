import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, input, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthShell } from '../../components/auth-shell/auth-shell';
import { AuthService } from '../../services/auth';
import { CampoErro } from '../../shared/campo-erro';
import { mensagemDeErro } from '../../shared/erros';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, AuthShell, CampoErro],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  /** Página que o usuário tentou abrir antes de ser mandado para o login (?voltar=). */
  readonly voltar = input<string>();

  protected readonly form = inject(NonNullableFormBuilder).group({
    email: ['', [Validators.required, Validators.email]],
    senha: ['', [Validators.required]],
    lembrar: [true],
  });

  protected readonly senhaVisivel = signal(false);
  protected readonly enviando = signal(false);
  protected readonly erro = signal('');

  protected entrar(): void {
    // Não envia nada para a API enquanto houver campo inválido.
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.erro.set('Confira os campos destacados.');
      return;
    }

    const { email, senha, lembrar } = this.form.getRawValue();
    this.erro.set('');
    this.enviando.set(true);

    this.auth
      .entrar(email, senha, lembrar)
      .pipe(finalize(() => this.enviando.set(false)))
      .subscribe({
        next: () => this.router.navigateByUrl(this.voltar() || '/home'),
        error: (e: Error | HttpErrorResponse) => this.erro.set(mensagemDeErro(e)),
      });
  }
}
