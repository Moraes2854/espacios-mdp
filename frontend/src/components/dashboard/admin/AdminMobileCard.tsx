import { ReactNode } from 'react';

type AdminMobileCardProps = {
  title: string;
  subtitle?: string;
  badge?: ReactNode;
  rows: { label: string; value: ReactNode }[];
};

export function AdminMobileCard({ title, subtitle, badge, rows }: AdminMobileCardProps) {
  return (
    <article className="admin-mobile-card">
      <header>
        <div>
          <strong>{title}</strong>
          {subtitle && <span>{subtitle}</span>}
        </div>
        {badge && <div className="admin-mobile-card-badge">{badge}</div>}
      </header>
      <dl>
        {rows.map((row) => (
          <div key={row.label}>
            <dt>{row.label}</dt>
            <dd>{row.value}</dd>
          </div>
        ))}
      </dl>
    </article>
  );
}
