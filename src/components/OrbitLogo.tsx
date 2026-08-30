// Orbit/satellite logo mark — matches the reference screenshots
// Blue ring with an orange satellite dot and trail arc

interface OrbitLogoProps {
  size?: number;
  className?: string;
}

export function OrbitLogo({ size = 48, className = '' }: OrbitLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="ISRO Ground Station logo"
    >
      {/* Outer ring */}
      <circle cx="24" cy="24" r="20" stroke="#3B7CF6" strokeWidth="1.5" strokeDasharray="4 2" opacity="0.6" />
      {/* Inner orbit ellipse */}
      <ellipse cx="24" cy="24" rx="20" ry="8" stroke="#3B7CF6" strokeWidth="1.5" fill="none" opacity="0.8" />
      {/* Globe */}
      <circle cx="24" cy="24" r="10" fill="#1A2840" stroke="#3B7CF6" strokeWidth="1.5" />
      {/* Globe surface lines */}
      <ellipse cx="24" cy="24" rx="10" ry="4" stroke="#3B7CF6" strokeWidth="0.8" fill="none" opacity="0.5" />
      <line x1="24" y1="14" x2="24" y2="34" stroke="#3B7CF6" strokeWidth="0.8" opacity="0.5" />
      {/* Satellite dot */}
      <circle cx="38" cy="20" r="3" fill="#F59E0B" />
      {/* Satellite trail */}
      <path d="M38 20 Q34 18 30 19" stroke="#F59E0B" strokeWidth="1.2" fill="none" opacity="0.7" />
    </svg>
  );
}
