import { Injectable } from '@angular/core';
import { Game } from '../models/game';

@Injectable({
  providedIn: 'root',
})
export class GameService {
  // O array passa a ser uma propriedade privada da classe para manter o estado
  private games: Game[] = [
    {
      id: 1,
      titulo: 'Cyberpunk 2077',
      edicao: 'Edição padrão',
      plataforma: 'PC',
      desconto: '-60%',
      precoAntigo: 'R$ 199,90',
      precoAtual: 'R$ 79,90',
      melhorLoja: 'Steam',
      imagem: 'https://placehold.co/400x300/2A2D35/8E93A3?text=Cyberpunk',
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

  // CREATE (Cadastro)
  adicionar(jogo: Omit<Game, 'id'>): void {
    // Encontra o maior ID atual e soma 1, ou começa no 1 se a lista estiver vazia
    const novoId = this.games.length > 0 ? Math.max(...this.games.map((g) => g.id)) + 1 : 1;

    const novoJogo = { ...jogo, id: novoId } as Game;
    this.games.push(novoJogo);
  }

  // READ (Listagem completa)
  getGames(): Game[] {
    return this.games;
  }

  // READ (Pesquisa/Filtro - Funcionalidade que substitui a página de busca)
  pesquisar(termo: string): Game[] {
    if (!termo || termo.trim() === '') {
      return this.games; // Se a busca estiver vazia, retorna tudo
    }

    const termoMin = termo.toLowerCase();
    return this.games.filter(
      (g) =>
        g.titulo.toLowerCase().includes(termoMin) || g.plataforma.toLowerCase().includes(termoMin),
    );
  }

  // UPDATE (Edição)
  editar(id: number, jogoAtualizado: Partial<Game>): void {
    const index = this.games.findIndex((g) => g.id === id);
    if (index !== -1) {
      // Mescla os dados antigos com os novos dados recebidos
      this.games[index] = { ...this.games[index], ...jogoAtualizado };
    }
  }

  // DELETE (Exclusão)
  excluir(id: number): void {
    // Filtra o array mantendo todos os jogos, exceto o que tem o ID informado
    this.games = this.games.filter((g) => g.id !== id);
  }
}
