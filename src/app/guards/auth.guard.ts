import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

/** Só deixa entrar nas páginas internas quem está logado. */
export const authGuard: CanActivateFn = (_rota, estado) => {
  const auth = inject(AuthService);
  return auth.logado()
    ? true
    : inject(Router).createUrlTree(['/login'], { queryParams: { voltar: estado.url } });
};

/** Quem já está logado não precisa ver login/cadastro: vai direto para as ofertas. */
export const visitanteGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return auth.logado() ? inject(Router).createUrlTree(['/home']) : true;
};
