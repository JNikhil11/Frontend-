interface ErrorPanelProps {
  message?: string;
}

export function ErrorPanel({ message = 'Failed to load data. Please try again.' }: ErrorPanelProps) {
  return (
    <div
      role="alert"
      className="flex items-center gap-3 p-5 text-status-red text-sm"
    >
      <span className="text-xl" aria-hidden="true">⚠</span>
      <div>
        <p className="font-semibold">Data Unavailable</p>
        <p className="text-text-muted text-xs mt-0.5">{message}</p>
      </div>
    </div>
  );
}
