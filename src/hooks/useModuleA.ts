import { useQuery } from '@tanstack/react-query';
import { apiGetModuleA } from '../api/client';
import { MOCK_MODULE_A } from '../api/mocks';

export function useModuleA(vehicleId: string) {
  return useQuery({
    queryKey: ['module-a', vehicleId],
    queryFn: () => apiGetModuleA(vehicleId),
    enabled: !!vehicleId,
    initialData: MOCK_MODULE_A[vehicleId] ?? { dynamic_limit_uA: 40.0, points: [] },
    initialDataUpdatedAt: 0, // Forces background fetch immediately to replace mock data with real data
  });
}
