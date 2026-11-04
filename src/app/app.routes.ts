import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Detalhes } from './pages/detalhes/detalhes';
import { Login } from './pages/login/login';
import { Cadastro } from './pages/cadastro/cadastro';
import { ListaDesejos } from './pages/lista-desejos/lista-desejos';
import { Alertas } from './pages/alertas/alertas';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'cadastro', component: Cadastro },
  { path: 'home', component: Home },
  { path: 'detalhes/:id', component: Detalhes },
  { path: 'lista-desejos', component: ListaDesejos },
  { path: 'alertas', component: Alertas },
];
