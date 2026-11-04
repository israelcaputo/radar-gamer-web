import { Injectable } from '@angular/core';
import { Game } from '../models/game';

@Injectable({
  providedIn: 'root',
})
export class GameService {
  getGames(): Game[] {
    return [
      {
        id: 1,
        titulo: 'Cyberpunk 2077',
        edicao: 'Edição padrão',
        plataforma: 'PC',
        desconto: '-60%',
        precoAntigo: 'R$ 199,90',
        precoAtual: 'R$ 79,90',
        melhorLoja: 'Steam',
        imagem: 'https://placehold.co/400x300/2A2D35/8E93A3?text=Cyberpunk', // ou um link genérico
      },
      {
        id: 2,
        titulo: 'Red Dead Redemption 2',
        edicao: 'Edição padrão',
        plataforma: 'PC',
        desconto: '-67%',
        precoAntigo: 'R$ 299,90',
        precoAtual: 'R$ 98,96',
        melhorLoja: 'Nuuvem',
        imagem: 'https://placehold.co/400x300/2A2D35/8E93A3?text=RDR+2',
      },
      {
        id: 3,
        titulo: 'The Witcher 3: Wild Hunt',
        edicao: 'Complete Edition',
        plataforma: 'PC',
        desconto: '-75%',
        precoAntigo: 'R$ 139,90',
        precoAtual: 'R$ 34,97',
        melhorLoja: 'GOG',
        imagem: 'https://placehold.co/400x300/2A2D35/8E93A3?text=Witcher+3',
      },
    ];
  }
}
