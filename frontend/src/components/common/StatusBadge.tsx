type StatusBadgeProps = {
  status?: string | null;
};

const statusLabels: Record<string, string> = {
  PENDING: 'Pendiente',
  CONFIRMED: 'Confirmada',
  PAID: 'Pagada',
  APPROVED: 'Aprobado',
  CANCELLED: 'Cancelada',
  COMPLETED: 'Completada',
  NO_SHOW: 'Ausente',
  NEW: 'Nuevo',
  CONTACTED: 'Contactado',
  CONVERTED: 'Convertido',
  LOST: 'Perdido',
  ACTIVE: 'Activo',
  INACTIVE: 'Inactivo',
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const normalized = (status || 'PENDING').toUpperCase();
  return <span className={`status-badge status-${normalized.toLowerCase()}`}>{statusLabels[normalized] || normalized}</span>;
}
