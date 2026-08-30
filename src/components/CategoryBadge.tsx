interface CategoryBadgeProps {
  category: 'Spatial Outlier' | 'Thermal Drift' | 'Atmospheric Noise' | string;
}

const CATEGORY_STYLES: Record<string, string> = {
  'Spatial Outlier': 'badge-spatial',
  'Thermal Drift': 'badge-thermal',
  'Atmospheric Noise': 'badge-atmospheric',
  'Cleared': 'category-badge bg-green-500/10 text-green-500 border-green-500/30',
};

export function CategoryBadge({ category }: CategoryBadgeProps) {
  const cls = CATEGORY_STYLES[category] ?? 'category-badge border-border-subtle text-text-muted';
  return (
    <span className={cls} role="status" aria-label={`Category: ${category}`}>
      {category}
    </span>
  );
}
