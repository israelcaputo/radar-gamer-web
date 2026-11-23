import { Routes } from '@angular/router';

// Cada página é carregada sob demanda (lazy loading com loadComponent).
export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    title: 'Entrar · Radar Gamer',
    loadComponent: () => import('./pages/login/login').then((m) => m.Login),
  },
  {
    path: 'cadastro',
    title: 'Criar conta · Radar Gamer',
    loadComponent: () => import('./pages/cadastro/cadastro').then((m) => m.Cadastro),
  },
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
    loadComponent: () => import('./pages/lista-desejos/lista-desejos').then((m) => m.ListaDesejos),
  },
  {
    path: 'alertas',
    title: 'Meus alertas · Radar Gamer',
    loadComponent: () => import('./pages/alertas/alertas').then((m) => m.Alertas),
  },
  { path: '**', redirectTo: 'home' },
];
