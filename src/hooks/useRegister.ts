import { useQuery } from '@tanstack/react-query';
import { apiGetRegister } from '../api/client';
import { MOCK_REGISTER } from '../api/mocks';

export function useRegister(vehicleId: string) {
  return useQuery({
    queryKey: ['register', vehicleId],
    queryFn: () => apiGetRegister(vehicleId),
    enabled: !!vehicleId,
    initialData: MOCK_REGISTER[vehicleId] ?? [],
    initialDataUpdatedAt: 0,
  });
}
