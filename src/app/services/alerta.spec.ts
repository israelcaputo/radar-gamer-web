import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { Alerta } from '../models/alerta';
import { JogoDetalhe, Oferta } from '../models/oferta';
import { AlertaService } from './alerta';
import { DesejoService } from './desejo';

const sessao = { id: 'u1', nome: 'Ana', email: 'ana@x.com' };
const jogo = { jogoId: '10', titulo: 'Hades', imagem: 'h.jpg', imagemReserva: 't.jpg' };
const dados = { precoAlvo: 25, lojaId: null, notificarEmail: true, ativo: true };

function oferta(lojaId: string, preco: number): Oferta {
  return {
    dealId: lojaId,
    jogoId: '10',
    titulo: 'Hades',
    preco,
    precoOriginal: 80,
    desconto: 50,
    imagem: '',
    imagemReserva: '',
    linkLoja: '',
    loja: { id: lojaId, nome: `Loja ${lojaId}`, ativa: true, logo: '', icone: '' },
  };
}

describe('AlertaService e DesejoService', () => {
  let alertas: AlertaService;
  let desejos: DesejoService;
  let http: HttpTestingController;

  beforeEach(() => {
    localStorage.setItem('radar-gamer.sessao', JSON.stringify(sessao));
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    alertas = TestBed.inject(AlertaService);
    desejos = TestBed.inject(DesejoService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    localStorage.clear();
  });

  it('cria alerta com POST e não deixa criar outro para o mesmo jogo', async () => {
    const criado = firstValueFrom(alertas.criar(jogo, dados));
    const req = http.expectOne(`${environment.apiUrl}/alertas`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toMatchObject({ usuarioId: 'u1', jogoId: '10', precoAlvo: 25 });
    req.flush({ ...req.request.body, id: 'a1' });
    await criado;

    await expect(firstValueFrom(alertas.criar(jogo, dados))).rejects.toThrow(
      'Você já tem um alerta para Hades.',
    );
  });

  it('recusa preço-alvo zero ou negativo sem chamar a API', async () => {
    await expect(firstValueFrom(alertas.criar(jogo, { ...dados, precoAlvo: 0 }))).rejects.toThrow(
      'O preço-alvo deve ser maior que zero.',
    );
  });

  it('calcula status considerando só a loja acompanhada', () => {
    const alerta: Alerta = {
      ...jogo,
      ...dados,
      id: 'a1',
      usuarioId: 'u1',
      criadoEm: '',
      lojaId: '7',
    };
    const detalhe = { ofertas: [oferta('1', 20), oferta('7', 30)] } as JogoDetalhe;

    const naLoja7 = alertas.melhorOferta(alerta, detalhe);
    expect(naLoja7?.preco).toBe(30);
    expect(alertas.status(alerta, naLoja7)).toBe('ativo');

    const todasAsLojas = { ...alerta, lojaId: null };
    expect(alertas.status(todasAsLojas, alertas.melhorOferta(todasAsLojas, detalhe))).toBe(
      'meta-atingida',
    );
    expect(alertas.status({ ...todasAsLojas, ativo: false }, oferta('1', 1))).toBe('pausado');
  });

  it('não adiciona o mesmo jogo duas vezes na lista de desejos', async () => {
    const adicionado = firstValueFrom(desejos.adicionar(jogo));
    const req = http.expectOne(`${environment.apiUrl}/desejos`);
    req.flush({ ...req.request.body, id: 'd1' });
    await adicionado;

    expect(desejos.estaNaLista('10')).toBe(true);
    await expect(firstValueFrom(desejos.adicionar(jogo))).rejects.toThrow(
      'já está na sua lista de desejos',
    );
  });
});
