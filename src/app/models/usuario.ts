export interface Usuario {
  id: string;
  nome: string;
  email: string;
  /** Guardada em texto puro só porque o json-server é uma API de estudo. */
  senha: string;
}

export type NovoUsuario = Omit<Usuario, 'id'>;

/** Dados do usuário logado mantidos no navegador (sem a senha). */
export type UsuarioSessao = Omit<Usuario, 'senha'>;
