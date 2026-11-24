import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth';

const URL = `${environment.apiUrl}/usuarios`;
const usuario = { id: 'u1', nome: 'Ana Souza Lima', email: 'ana@x.com', senha: 'segredo12' };

describe('AuthService', () => {
  let service: AuthService;
  let http: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('entra com e-mail e senha corretos e guarda a sessão', async () => {
    const login = firstValueFrom(service.entrar(' ANA@x.com ', 'segredo12', true));
    const req = http.expectOne((r) => r.url === URL);
    expect(req.request.params.get('email')).toBe('ana@x.com');
    req.flush([usuario]);

    await login;
    expect(service.logado()).toBe(true);
    expect(service.iniciais()).toBe('AL');
    expect(localStorage.getItem('radar-gamer.sessao')).not.toContain('segredo12');
  });

  it('recusa senha errada', async () => {
    const login = firstValueFrom(service.entrar('ana@x.com', 'errada', false));
    http.expectOne((r) => r.url === URL).flush([usuario]);
    await expect(login).rejects.toThrow('E-mail ou senha incorretos.');
    expect(service.logado()).toBe(false);
  });

  it('não cadastra e-mail repetido', async () => {
    const cadastro = firstValueFrom(
      service.cadastrar({ nome: 'Outra', email: 'ana@x.com', senha: 'abc12345' }),
    );
    http.expectOne((r) => r.url === URL && r.method === 'GET').flush([usuario]);
    await expect(cadastro).rejects.toThrow('Este e-mail já está cadastrado.');
  });

  it('cadastra com POST e já deixa o usuário logado', async () => {
    const cadastro = firstValueFrom(
      service.cadastrar({ nome: ' Bia ', email: 'Bia@X.com', senha: 'abc12345' }),
    );
    http.expectOne((r) => r.url === URL && r.method === 'GET').flush([]);
    const post = http.expectOne((r) => r.url === URL && r.method === 'POST');
    expect(post.request.body).toEqual({ nome: 'Bia', email: 'bia@x.com', senha: 'abc12345' });
    post.flush({ id: 'novo', nome: 'Bia', email: 'bia@x.com', senha: 'abc12345' });

    await cadastro;
    expect(service.usuario()?.id).toBe('novo');
  });
});
