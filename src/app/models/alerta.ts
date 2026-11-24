import { JogoReferencia } from './desejo';
import { Oferta } from './oferta';

export interface Alerta extends JogoReferencia {
  id: string;
  usuarioId: string;
  precoAlvo: number;
  /** Loja acompanhada; null = todas as lojas compatíveis. */
  lojaId: string | null;
  notificarEmail: boolean;
  ativo: boolean;
  criadoEm: string;
}

/** Campos que o usuário preenche no formulário de alerta. */
export interface DadosAlerta {
  precoAlvo: number;
  lojaId: string | null;
  notificarEmail: boolean;
  ativo: boolean;
}

export type StatusAlerta = 'ativo' | 'meta-atingida' | 'pausado';

/** Alerta junto com o melhor preço atual das lojas acompanhadas. */
export interface AlertaComPreco {
  alerta: Alerta;
  oferta: Oferta | undefined;
  status: StatusAlerta;
}
