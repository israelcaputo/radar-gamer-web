import { Routes } from '@angular/router';
import { authGuard, visitanteGuard } from './guards/auth.guard';
import { MainLayout } from './layouts/main-layout';

// Cada página é carregada sob demanda (lazy loading com loadComponent).
export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },

  // Telas abertas: só para quem não está logado.
  {
    path: 'login',
    title: 'Entrar · Radar Gamer',
    canActivate: [visitanteGuard],
    loadComponent: () => import('./pages/login/login').then((m) => m.Login),
  },
  {
    path: 'cadastro',
    title: 'Criar conta · Radar Gamer',
    canActivate: [visitanteGuard],
    loadComponent: () => import('./pages/cadastro/cadastro').then((m) => m.Cadastro),
  },

  // Telas internas: exigem login e usam o layout com navbar.
  {
    path: '',
    component: MainLayout,
    canActivate: [authGuard],
    children: [
      {
        path: 'home',
        title: 'Ofertas · Radar Gamer',
        loadComponent: () => import('./pages/home/home').then((m) => m.Home),
      },
      {
        path: 'detalhes/:id',
        title: 'Detalhes do jogo · Radar Gamer',
        loadComponent: () => import('./pages/detalhes/detalhes').then((m) => m.Detalhes),
      },
      {
        path: 'lista-desejos',
        title: 'Lista de desejos · Radar Gamer',
        loadComponent: () =>
          import('./pages/lista-desejos/lista-desejos').then((m) => m.ListaDesejos),
      },
      {
        path: 'alertas',
        title: 'Meus alertas · Radar Gamer',
        loadComponent: () => import('./pages/alertas/alertas').then((m) => m.Alertas),
      },
    ],
  },

  { path: '**', redirectTo: 'home' },
];
