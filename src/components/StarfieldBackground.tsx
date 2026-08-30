// Decorative starfield background — pure CSS dots, no heavy canvas libs
// Dots are randomly placed via inline styles, fixed behind all content.

const STARS = Array.from({ length: 80 }, (_, i) => ({
  id: i,
  x: Math.floor(Math.random() * 100),
  y: Math.floor(Math.random() * 100),
  size: Math.random() < 0.7 ? 1 : Math.random() < 0.9 ? 1.5 : 2,
  opacity: 0.05 + Math.random() * 0.12,
}));

export function StarfieldBackground() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 overflow-hidden pointer-events-none z-0"
    >
      {STARS.map((s) => (
        <span
          key={s.id}
          style={{
            position: 'absolute',
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            borderRadius: '50%',
            backgroundColor: '#A0B0C8',
            opacity: s.opacity,
          }}
        />
      ))}
    </div>
  );
}
