import { useQuery } from '@tanstack/react-query';
import { apiGetMetrics } from '../api/client';

export function useMetrics(vehicleId: string) {
  return useQuery({
    queryKey: ['metrics', vehicleId],
    queryFn: () => apiGetMetrics(vehicleId),
    enabled: !!vehicleId,
  });
}
