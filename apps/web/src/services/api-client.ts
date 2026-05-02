// API client en mode "mock / déconnecté".
// Le backend NestJS n'est pas encore implémenté : aucun appel réseau n'est fait.
// Quand le backend sera prêt (Phase 6), remplacer cette implémentation par la vraie.

export interface ApiError {
  success: false;
  statusCode: number;
  error: string;
}

const NOT_CONNECTED = (method: string, path: string): never => {
  // eslint-disable-next-line no-console
  console.warn(`[api-client] ${method} ${path} — backend non connecté (mode front-only)`);
  throw {
    success: false,
    statusCode: 503,
    error: 'Backend non connecté (mode développement front-only)',
  } satisfies ApiError;
};

class ApiClient {
  setAccessToken(_token: string | null): void {
    // no-op tant que le backend n'est pas connecté
  }

  get<T>(path: string): Promise<T> {
    return Promise.reject(NOT_CONNECTED('GET', path));
  }

  post<T, B = unknown>(path: string, _body?: B): Promise<T> {
    return Promise.reject(NOT_CONNECTED('POST', path));
  }

  put<T, B = unknown>(path: string, _body?: B): Promise<T> {
    return Promise.reject(NOT_CONNECTED('PUT', path));
  }

  del<T>(path: string): Promise<T> {
    return Promise.reject(NOT_CONNECTED('DELETE', path));
  }
}

export const api = new ApiClient();
