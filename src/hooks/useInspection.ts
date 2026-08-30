import { useQuery } from '@tanstack/react-query';
import { apiGetPartInspection } from '../api/client';

export function useInspection(partId: string | null) {
  return useQuery({
    queryKey: ['inspection', partId],
    queryFn: () => apiGetPartInspection(partId!),
    enabled: !!partId,
  });
}
