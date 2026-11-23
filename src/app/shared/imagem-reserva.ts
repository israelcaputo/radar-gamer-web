import { Directive, ElementRef, inject, input } from '@angular/core';

/**
 * Troca a imagem por uma alternativa caso ela não carregue.
 * Uso: <img [src]="oferta.imagem" [appImagemReserva]="oferta.imagemReserva" />
 */
@Directive({
  selector: 'img[appImagemReserva]',
  host: { '(error)': 'usarReserva()' },
})
export class ImagemReserva {
  readonly appImagemReserva = input.required<string>();

  private readonly img = inject<ElementRef<HTMLImageElement>>(ElementRef);
  private jaTrocou = false;

  usarReserva(): void {
    if (!this.jaTrocou && this.appImagemReserva()) {
      this.jaTrocou = true;
      this.img.nativeElement.src = this.appImagemReserva();
    }
  }
}
