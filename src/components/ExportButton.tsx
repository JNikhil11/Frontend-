import { useDashboardStore } from '../store/dashboardStore';
import { DEFAULT_LOT_IDS } from '../api/mocks';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';

export function ExportButton() {
  const { selectedVehicleId } = useDashboardStore();
  const token = localStorage.getItem('isro_token');

  async function handleExport() {
    const lotId = DEFAULT_LOT_IDS[selectedVehicleId] ?? `${selectedVehicleId.toUpperCase()}_LOT_01`;
    try {
      const res = await fetch(`${BASE_URL}/api/lots/${lotId}/export`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${lotId}_telemetry.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Export failed. Please try again.');
    }
  }

  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-[#334155] text-text-muted hover:text-text-primary hover:border-brand-primary transition-all"
      title="Download full raw dataset as CSV"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
      Export Dataset (CSV)
    </button>
  );
}
