import { useQuery } from '@tanstack/react-query';
import { apiGetLotSummary } from '../api/client';
import { MOCK_LOT_SUMMARIES, DEFAULT_LOT_IDS } from '../api/mocks';

export function useLotSummary(vehicleId: string) {
  return useQuery({
    queryKey: ['lot-summary', vehicleId],
    queryFn: () => apiGetLotSummary(vehicleId),
    enabled: !!vehicleId,
    initialData: MOCK_LOT_SUMMARIES[vehicleId] ?? {
        lot_id: DEFAULT_LOT_IDS[vehicleId] ?? `${vehicleId}_LOT`,
        tested_components: 0,
        passed_screening: 0,
        hardware_rejects: 0,
        atmospheric_triggers: 0
    },
    initialDataUpdatedAt: 0,
  });
}
