import { Component } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-lista-desejos',
  styleUrl: './lista-desejos.css',
  templateUrl: './lista-desejos.html',
})
export class ListaDesejos {
  desejosMock = [
    {
      id: 1,
      titulo: 'Hollow Knight',
      edicao: 'Edição padrão',
      plataforma: 'PC',
      precoAtual: 'R$ 13,99',
      desconto: '-50%',
      melhorLoja: 'Steam',
      statusAlerta: 'Abaixo da meta',
      textoAlerta: 'R$ 1,01 abaixo do seu alvo',
      imagem: 'https://placehold.co/150x200/2A2D35/8E93A3?text=Hollow',
    },
  ];
}
