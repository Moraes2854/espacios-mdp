import { ReactNode } from 'react';
import { EmptyState } from './EmptyState';

type TableProps = {
  headers: string[];
  children: ReactNode;
  empty?: boolean;
  emptyLabel?: string;
  mobileCards?: ReactNode;
};

export function Table({ headers, children, empty = false, emptyLabel = 'Sin datos para mostrar.', mobileCards }: TableProps) {
  if (empty) return <EmptyState title={emptyLabel} />;

  return (
    <>
      <div className="table-scroll admin-table-desktop">
        <table>
          <thead>
            <tr>{headers.map((header) => <th key={header}>{header}</th>)}</tr>
          </thead>
          <tbody>{children}</tbody>
        </table>
      </div>
      {mobileCards && <div className="admin-mobile-card-list">{mobileCards}</div>}
    </>
  );
}
