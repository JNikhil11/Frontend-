import { useLotSummary } from '../hooks/useLotSummary';
import { useDashboardStore } from '../store/dashboardStore';
import { LoadingPanel } from './LoadingPanel';
import { ErrorPanel } from './ErrorPanel';

interface StatCardProps {
  label: string;
  value: string | number;
  valueColor?: string;
  caption?: React.ReactNode;
  subtext?: string;
}

function StatCard({ label, value, valueColor = 'text-text-primary', caption, subtext }: StatCardProps) {
  return (
    <div className="panel px-5 py-4 flex flex-col gap-1 flex-1 min-w-0 border-l-0 border-t-0 border-r-0 border-b border-border-subtle" style={{borderLeft: '2px solid #1A2129'}}>
      <p className="stat-label">{label}</p>
      <p className={`text-4xl font-bold leading-none stat-value ${valueColor}`} aria-label={`${label}: ${value}`}>
        {value}
      </p>
      {caption && <div className="text-xs text-text-muted mt-1 flex items-center gap-1.5 font-mono-data">{caption}</div>}
      {subtext && <p className="text-xs text-text-muted mt-0.5 font-mono-data">{subtext}</p>}
    </div>
  );
}

export function StatCardRow() {
  const { selectedVehicleId } = useDashboardStore();
  const { data, isLoading, isError } = useLotSummary(selectedVehicleId);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="panel px-5 py-4">
            <LoadingPanel rows={2} />
          </div>
        ))}
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="panel">
        <ErrorPanel message="Could not load lot summary data." />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-5" role="region" aria-label="Lot summary statistics">
      <StatCard
        label="Tested Components"
        value={data.tested_components}
        valueColor="text-text-primary"
        subtext={`Lot ID: ${data.lot_id}`}
      />
      <StatCard
        label="Passed Screening"
        value={data.passed_screening}
        valueColor="text-status-green"
        caption={
          <>
            <span aria-hidden="true">✓</span>
            <span>Cleared for Flight</span>
          </>
        }
      />
      <StatCard
        label="Hardware Rejects"
        value={data.hardware_rejects}
        valueColor="text-status-red"
        caption={
          <>
            <span aria-hidden="true">▲</span>
            <span>Outliers &amp; Drift Violations</span>
          </>
        }
      />
      <StatCard
        label="Atmospheric Triggers"
        value={data.atmospheric_triggers}
        valueColor="text-status-purple"
        caption={
          <>
            <span aria-hidden="true">▲</span>
            <span>EMI &amp; Attenuation Spikes</span>
          </>
        }
      />
    </div>
  );
}
