// ============================================================
// Dashboard Store — Zustand
// Shared state for vehicle / lot / part selection, keeping
// the register table and deep-inspection panel in two-way sync.
// ============================================================

import { create } from 'zustand';

interface DashboardState {
  selectedVehicleId: string;
  selectedLotId: string;
  selectedPartId: string | null;
  lastUpdated: number;

  setSelectedVehicleId: (id: string) => void;
  setSelectedLotId: (id: string) => void;
  setSelectedPartId: (id: string | null) => void;
  triggerRefresh: () => void;
}

// Default to LVM3 to match the reference screenshots
export const useDashboardStore = create<DashboardState>((set) => ({
  selectedVehicleId: 'lvm3',
  selectedLotId: 'LVM3_STAGE_02',
  selectedPartId: 'PART_088',
  lastUpdated: Date.now(),

  setSelectedVehicleId: (id) =>
    set({ selectedVehicleId: id, selectedPartId: null }),

  setSelectedLotId: (id) => set({ selectedLotId: id }),

  setSelectedPartId: (id) => set({ selectedPartId: id }),

  triggerRefresh: () => set({ lastUpdated: Date.now() }),
}));
