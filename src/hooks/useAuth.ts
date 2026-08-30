import { useMutation } from '@tanstack/react-query';
import { apiLogin } from '../api/client';
import type { LoginRequest } from '../api/types';

export function useAuth() {
  return useMutation({
    mutationFn: (payload: LoginRequest) => apiLogin(payload),
    onSuccess: (data) => {
      localStorage.setItem('isro_token', data.token);
    },
  });
}
