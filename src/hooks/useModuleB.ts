import { useQuery } from '@tanstack/react-query';
import { apiGetModuleB } from '../api/client';
import { MOCK_MODULE_B } from '../api/mocks';

export function useModuleB(vehicleId: string) {
  return useQuery({
    queryKey: ['module-b', vehicleId],
    queryFn: () => apiGetModuleB(vehicleId),
    enabled: !!vehicleId,
    initialData: MOCK_MODULE_B[vehicleId] ?? { safety_slope_limit_uA: 50.0, series: [] },
    initialDataUpdatedAt: 0,
  });
}
