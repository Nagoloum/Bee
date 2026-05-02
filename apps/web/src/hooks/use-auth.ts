'use client';

// Hook d'auth en mode "mock / déconnecté".
// Retourne un utilisateur null (non connecté) sans appel réseau.
// Quand le backend sera prêt, rebrancher sur `api.get('/users/me')` etc.

interface User {
  id: string;
  email: string;
  role: 'CLIENT' | 'VENDOR' | 'DELIVERY' | 'ADMIN';
}

export function useAuth(): {
  user: User | undefined;
  isLoading: boolean;
  login: { mutate: (dto: { email: string; password: string }) => void; isPending: boolean };
  logout: { mutate: () => void; isPending: boolean };
} {
  return {
    user: undefined,
    isLoading: false,
    login: {
      mutate: (dto) => {
        // eslint-disable-next-line no-console
        console.warn('[useAuth] login — backend non connecté', dto.email);
      },
      isPending: false,
    },
    logout: {
      mutate: () => {
        // eslint-disable-next-line no-console
        console.warn('[useAuth] logout — backend non connecté');
      },
      isPending: false,
    },
  };
}
