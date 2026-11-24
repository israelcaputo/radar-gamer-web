/** Jogo salvo na lista de desejos. O preço não é salvo: vem sempre atualizado da CheapShark. */
export interface Desejo {
  id: string;
  usuarioId: string;
  jogoId: string;
  titulo: string;
  imagem: string;
  imagemReserva: string;
  /** Data ISO em que o jogo foi adicionado. */
  adicionadoEm: string;
}

/** Dados de um jogo que a lista de desejos e os alertas guardam como referência. */
export type JogoReferencia = Pick<Desejo, 'jogoId' | 'titulo' | 'imagem' | 'imagemReserva'>;
