import { useQuery } from '@tanstack/react-query';
import { apiGetVehicleProfiles } from '../api/client';
import { MOCK_VEHICLE_PROFILES } from '../api/mocks';

export function useVehicleProfiles() {
  return useQuery({
    queryKey: ['vehicle-profiles'],
    queryFn: apiGetVehicleProfiles,
    initialData: MOCK_VEHICLE_PROFILES,
    initialDataUpdatedAt: 0,
    staleTime: 5 * 60 * 1000, // profiles rarely change
  });
}
