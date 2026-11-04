import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GameService } from '../../services/game';
import { Game } from '../../models/game';

@Component({
  selector: 'app-alertas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './alertas.html',
})
export class Alertas implements OnInit {
  meusAlertas: Game[] = [];

  // Variáveis para o formulário de criação (CREATE)
  novoJogoTitulo: string = '';
  novoJogoPreco: string = '';

  // Variáveis de controle do Modal de Edição (UPDATE)
  mostrarModal: boolean = false;
  idEmEdicao: number | null = null;
  precoEdicao: string = '';

  constructor(private gameService: GameService) {}

  ngOnInit() {
    this.carregarAlertas();
  }

  carregarAlertas() {
    this.meusAlertas = this.gameService.getGames();
  }

  adicionarAlerta() {
    if (this.novoJogoTitulo.trim() !== '') {
      this.gameService.adicionar({
        titulo: this.novoJogoTitulo,
        plataforma: 'PC',
        edicao: 'Padrão',
        desconto: '0%',
        precoAntigo: 'R$ 0,00',
        precoAtual: this.novoJogoPreco || 'R$ 0,00',
        melhorLoja: 'A definir',
        imagem: `https://placehold.co/400x300/2A2D35/8E93A3?text=${this.novoJogoTitulo.replace(' ', '+')}`,
      });

      this.novoJogoTitulo = '';
      this.novoJogoPreco = '';
      this.carregarAlertas();
    }
  }

  // Abre o modal e carrega os dados do alerta selecionado
  abrirModalEditar(alerta: Game) {
    this.idEmEdicao = alerta.id;
    this.precoEdicao = alerta.precoAtual;
    this.mostrarModal = true;
  }

  // Fecha o modal e limpa as variáveis temporárias
  fecharModal() {
    this.mostrarModal = false;
    this.idEmEdicao = null;
    this.precoEdicao = '';
  }

  // Salva a alteração no service e atualiza a tela
  salvarEdicao() {
    if (this.idEmEdicao !== null && this.precoEdicao.trim() !== '') {
      this.gameService.editar(this.idEmEdicao, { precoAtual: this.precoEdicao });
      this.carregarAlertas();
      this.fecharModal();
    }
  }

  removerAlerta(id: number) {
    this.gameService.excluir(id);
    this.carregarAlertas();
  }
}
