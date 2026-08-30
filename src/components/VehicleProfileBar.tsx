import { useVehicleProfiles } from '../hooks/useVehicleProfiles';
import { useDashboardStore } from '../store/dashboardStore';
import { DEFAULT_LOT_IDS } from '../api/mocks';

export function VehicleProfileBar() {
  const { data: profiles, isLoading } = useVehicleProfiles();
  const { selectedVehicleId, setSelectedVehicleId, setSelectedLotId } =
    useDashboardStore();

  const selected = profiles?.find((p) => p.id === selectedVehicleId);

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const id = e.target.value;
    setSelectedVehicleId(id);
    setSelectedLotId(DEFAULT_LOT_IDS[id] ?? `${id.toUpperCase()}_LOT_01`);
  }

  return (
    <div className="panel px-5 py-3 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
      {/* Left: vehicle dropdown */}
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-lg shrink-0" aria-hidden="true">🚀</span>
        <label htmlFor="vehicle-select" className="stat-label whitespace-nowrap">
          Launch Vehicle Profile:
        </label>
        {isLoading ? (
          <div className="h-8 w-64 bg-border-subtle/40 rounded animate-pulse" />
        ) : (
          <select
            id="vehicle-select"
            value={selectedVehicleId}
            onChange={handleChange}
            className="bg-bg-panel-alt border border-border-subtle text-text-primary text-sm
                       rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-accent-blue
                       focus:border-accent-blue transition-colors cursor-pointer min-w-64"
            aria-label="Select launch vehicle profile"
          >
            {profiles?.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Divider */}
      <div className="hidden sm:block w-px h-5 bg-border-subtle" aria-hidden="true" />

      {/* Right: inline threshold stats */}
      {selected && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
          <Stat label="Total Vehicle Components" value={String(selected.component_count)} />
          <Sep />
          <Stat label="Max Iddq" value={`${selected.max_iddq_uA} µA`} />
          <Sep />
          <Stat label="Wind Shear Cap" value={`${selected.wind_shear_cap_knots} knots`} />
          <Sep />
          <Stat label="EMI Limit" value={`${selected.emi_limit_db} dB`} />
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <span className="text-text-muted text-xs">
      {label}:{' '}
      <span className="text-text-primary font-medium">{value}</span>
    </span>
  );
}

function Sep() {
  return (
    <span className="text-border-subtle select-none" aria-hidden="true">|</span>
  );
}
