import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Game } from '../../models/game';
import { GameService } from '../../services/game';

// Provisório: os alertas ainda ficam em memória no GameService.
// Na próxima etapa passam para o AlertaService (json-server + HttpClient)
// e os campos viram formulários com validação.
@Component({
  selector: 'app-alertas',
  imports: [FormsModule],
  templateUrl: './alertas.html',
  styleUrl: './alertas.css',
})
export class Alertas {
  private readonly gameService = inject(GameService);

  protected readonly meusAlertas = signal<Game[]>(this.gameService.getGames());

  // Formulário de criação
  protected readonly novoJogoTitulo = signal('');
  protected readonly novoJogoPreco = signal('');

  // Modal de edição
  protected readonly idEmEdicao = signal<number | null>(null);
  protected readonly precoEdicao = signal('');

  protected adicionarAlerta(): void {
    const titulo = this.novoJogoTitulo().trim();
    if (!titulo) return;

    this.gameService.adicionar({
      titulo,
      plataforma: 'PC',
      edicao: 'Padrão',
      desconto: '0%',
      precoAntigo: 'R$ 0,00',
      precoAtual: this.novoJogoPreco() || 'R$ 0,00',
      melhorLoja: 'A definir',
      imagem: `https://placehold.co/400x300/2A2D35/8E93A3?text=${encodeURIComponent(titulo)}`,
    });

    this.novoJogoTitulo.set('');
    this.novoJogoPreco.set('');
    this.recarregar();
  }

  protected abrirModalEditar(alerta: Game): void {
    this.idEmEdicao.set(alerta.id);
    this.precoEdicao.set(alerta.precoAtual);
  }

  protected fecharModal(): void {
    this.idEmEdicao.set(null);
    this.precoEdicao.set('');
  }

  protected salvarEdicao(): void {
    const id = this.idEmEdicao();
    if (id !== null && this.precoEdicao().trim()) {
      this.gameService.editar(id, { precoAtual: this.precoEdicao() });
      this.recarregar();
      this.fecharModal();
    }
  }

  protected removerAlerta(id: number): void {
    this.gameService.excluir(id);
    this.recarregar();
  }

  private recarregar(): void {
    this.meusAlertas.set([...this.gameService.getGames()]);
  }
}
