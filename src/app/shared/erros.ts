import { HttpErrorResponse } from '@angular/common/http';

/** Converte erros de requisição em mensagens que o usuário entende. */
export function mensagemDeErro(erro: unknown): string {
  // Erros vindos de rxResource podem chegar embrulhados, com o erro original em `cause`.
  if (erro instanceof Error && erro.cause) {
    return mensagemDeErro(erro.cause);
  }
  if (erro instanceof HttpErrorResponse) {
    if (erro.status === 0) {
      return 'Não foi possível conectar ao servidor. Verifique se a API está rodando (pnpm api).';
    }
    if (erro.status === 404) {
      return 'Registro não encontrado. Ele pode ter sido removido.';
    }
    return `O servidor respondeu com erro (${erro.status}). Tente novamente.`;
  }
  if (erro instanceof Error) {
    return erro.message;
  }
  return 'Algo deu errado. Tente novamente.';
}
