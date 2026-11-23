import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { JogoService } from './jogo';

const API = environment.cheapSharkUrl;

const lojas = [
  {
    storeID: '1',
    storeName: 'Steam',
    isActive: 1,
    images: { banner: '', logo: '/l1.png', icon: '/i1.png' },
  },
  {
    storeID: '7',
    storeName: 'GOG',
    isActive: 1,
    images: { banner: '', logo: '/l7.png', icon: '/i7.png' },
  },
];

function deal(
  gameID: string,
  storeID: string,
  salePrice: string,
  normalPrice: string,
  savings: string,
) {
  return {
    title: `Jogo ${gameID}`,
    internalName: '',
    dealID: `d-${gameID}-${storeID}`,
    storeID,
    gameID,
    salePrice,
    normalPrice,
    savings,
    isOnSale: '1',
    metacriticScore: '0',
    steamRatingText: null,
    steamRatingPercent: '0',
    steamAppID: gameID === '10' ? '1245620' : null,
    releaseDate: 0,
    lastChange: 0,
    dealRating: '9',
    thumb: `thumb-${gameID}.jpg`,
  };
}

describe('JogoService', () => {
  let service: JogoService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(JogoService);
    http = TestBed.inject(HttpTestingController);
    http.expectOne(`${API}/stores`).flush(lojas);
  });

  afterEach(() => http.verify());

  it('converte para real e mantém só a oferta mais barata de cada jogo', async () => {
    const resultado = firstValueFrom(
      service.buscarOfertas({
        termo: 'elden',
        lojas: ['1', '7'],
        somenteComDesconto: true,
        ordenacao: 'relevancia',
      }),
    );

    const req = http.expectOne((r) => r.url === `${API}/deals`);
    expect(req.request.params.get('title')).toBe('elden');
    expect(req.request.params.get('storeID')).toBe('1,7');
    expect(req.request.params.get('onSale')).toBe('1');
    req.flush([
      deal('10', '1', '35.99', '59.99', '40.0'),
      deal('10', '7', '29.99', '59.99', '50.0'),
      deal('20', '7', '5.00', '10.00', '50.0'),
    ]);
    http.expectOne(environment.cambioUrl).flush({
      USDBRL: {
        code: 'USD',
        codein: 'BRL',
        bid: '5.00',
        ask: '5.01',
        create_date: '2026-11-22 18:00:00',
      },
    });

    const ofertas = await resultado;
    expect(ofertas.length).toBe(2);
    expect(ofertas[0].jogoId).toBe('10');
    expect(ofertas[0].loja?.nome).toBe('GOG');
    expect(ofertas[0].preco).toBe(149.95);
    expect(ofertas[0].precoOriginal).toBe(299.95);
    expect(ofertas[0].desconto).toBe(50);
    expect(ofertas[0].imagem).toContain('/1245620/header.jpg');
    expect(ofertas[1].imagem).toBe('thumb-20.jpg');
  });

  it('usa a cotação de reserva quando a API de câmbio falha', async () => {
    const resultado = firstValueFrom(service.detalhar('10'));

    http
      .expectOne((r) => r.url === `${API}/games`)
      .flush({
        info: { title: 'ELDEN RING', steamAppID: '1245620', thumb: 't.jpg' },
        cheapestPriceEver: { price: '20.00', date: 1700000000 },
        deals: [
          { storeID: '1', dealID: 'a', price: '40.00', retailPrice: '60.00', savings: '33.3' },
          { storeID: '7', dealID: 'b', price: '30.00', retailPrice: '60.00', savings: '50' },
        ],
      });
    http.expectOne(environment.cambioUrl).flush('erro', { status: 500, statusText: 'Erro' });

    const jogo = await resultado;
    const taxa = environment.cotacaoReserva;
    expect(jogo.ofertas.map((o) => o.loja?.nome)).toEqual(['GOG', 'Steam']);
    expect(jogo.ofertas[0].preco).toBe(Math.round(30 * taxa * 100) / 100);
    expect(jogo.menorPrecoHistorico.preco).toBe(Math.round(20 * taxa * 100) / 100);
  });

  it('não chama a API quando nenhuma loja está selecionada', async () => {
    const ofertas = await firstValueFrom(
      service.buscarOfertas({
        termo: '',
        lojas: [],
        somenteComDesconto: false,
        ordenacao: 'titulo',
      }),
    );
    expect(ofertas).toEqual([]);
    // A cotação é buscada assim que o serviço é criado (aparece no cabeçalho da Home).
    http
      .expectOne(environment.cambioUrl)
      .flush({ USDBRL: { bid: '5', create_date: '2026-11-22 18:00:00' } });
  });
});
