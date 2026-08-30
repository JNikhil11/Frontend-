interface LoadingPanelProps {
  label?: string;
  rows?: number;
}

export function LoadingPanel({ label = 'Loading...', rows = 3 }: LoadingPanelProps) {
  return (
    <div className="flex flex-col gap-3 p-5" role="status" aria-label={label} aria-busy="true">
      <div className="h-4 bg-border-subtle/60 rounded animate-pulse w-1/3" />
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="h-3 bg-border-subtle/40 rounded animate-pulse"
          style={{ width: `${65 + (i % 3) * 10}%`, animationDelay: `${i * 80}ms` }}
        />
      ))}
      <span className="sr-only">{label}</span>
    </div>
  );
}
