import { LucideIcon } from 'lucide-react';

type MetricProps = {
  label: string;
  value: string | number;
  hint?: string;
  Icon?: LucideIcon;
};

export function Metric({ label, value, hint, Icon }: MetricProps) {
  return (
    <article className="metric-card">
      <div className="metric-icon">{Icon && <Icon size={20} />}</div>
      <span>{label}</span>
      <strong>{value}</strong>
      {hint && <small>{hint}</small>}
    </article>
  );
}
