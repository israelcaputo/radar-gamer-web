import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthShell } from '../../components/auth-shell/auth-shell';
import { AuthService } from '../../services/auth';
import { CampoErro } from '../../shared/campo-erro';
import { mensagemDeErro } from '../../shared/erros';
import { SENHA_FORTE, camposIguais, emailDisponivel, naoVazio } from '../../shared/validadores';

@Component({
  selector: 'app-cadastro',
  imports: [ReactiveFormsModule, AuthShell, CampoErro],
  templateUrl: './cadastro.html',
  styleUrl: './cadastro.css',
})
export class Cadastro {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly form = inject(NonNullableFormBuilder).group(
    {
      nome: [
        '',
        [Validators.required, naoVazio(), Validators.minLength(3), Validators.maxLength(60)],
      ],
      email: [
        '',
        {
          validators: [Validators.required, Validators.email],
          asyncValidators: [emailDisponivel((email) => this.auth.emailCadastrado(email))],
        },
      ],
      senha: ['', [Validators.required, Validators.pattern(SENHA_FORTE)]],
      confirmarSenha: ['', [Validators.required]],
      termos: [false, [Validators.requiredTrue]],
    },
    { validators: [camposIguais('senha', 'confirmarSenha')] },
  );

  protected readonly senhaVisivel = signal(false);
  protected readonly enviando = signal(false);
  protected readonly erro = signal('');

  protected cadastrar(): void {
    // Bloqueia o envio se algum campo for inválido ou se a checagem do e-mail ainda estiver rodando.
    if (this.form.invalid || this.form.pending) {
      this.form.markAllAsTouched();
      this.erro.set(
        this.form.pending ? 'Aguarde a verificação do e-mail.' : 'Confira os campos destacados.',
      );
      return;
    }

    const { nome, email, senha } = this.form.getRawValue();
    this.erro.set('');
    this.enviando.set(true);

    this.auth
      .cadastrar({ nome, email, senha })
      .pipe(finalize(() => this.enviando.set(false)))
      .subscribe({
        next: () => this.router.navigate(['/home']),
        error: (e) => this.erro.set(mensagemDeErro(e)),
      });
  }
}
