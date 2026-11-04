import { Component, OnInit } from '@angular/core';
import { Game } from '../../models/game';
import { GameService } from '../../services/game';
import { CommonModule } from '@angular/common';

@Component({
  imports: [CommonModule],
  selector: 'app-home',
  styleUrl: './home.css',
  templateUrl: './home.html',
})
export class Home implements OnInit {
  jogos: Game[] = []; // Array que receberá os dados

  constructor(private gameService: GameService) {}

  ngOnInit(): void {
    // Carregando os Mock Objects do service usando data-binding
    this.jogos = this.gameService.getGames();
  }
}
