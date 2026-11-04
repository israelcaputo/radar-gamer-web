import { Component } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-alertas',
  styleUrl: './alertas.css',
  templateUrl: './alertas.html',
})
export class Alertas {
  alertasMock = [
    {
      id: 1,
      titulo: 'Elden Ring',
      edicao: 'Edição padrão',
      lojas: '3 lojas',
      status: 'Ativo',
      precoAlvo: 'R$ 129,90',
      precoAtual: 'R$ 149,94',
      mensagemStatus: 'R$ 20,04 acima da meta',
      imagem: 'https://placehold.co/100x100/2A2D35/8E93A3?text=Elden',
    },
  ];
}
