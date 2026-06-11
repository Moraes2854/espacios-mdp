const moneyFormatter = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
});

export function formatMoney(value: string | number | undefined | null) {
  return moneyFormatter.format(Number(value || 0));
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat('es-AR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  }).format(new Date(value.includes('T') ? value : `${value}T00:00:00`));
}

export function formatLongDate(value: string) {
  return new Intl.DateTimeFormat('es-AR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  }).format(new Date(value.includes('T') ? value : `${value}T00:00:00`));
}

export function formatShortDate(value: string) {
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
  }).format(new Date(value.includes('T') ? value : `${value}T00:00:00`));
}

export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export function formatTime(value: string) {
  return new Date(value).toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDateRange(startAt: string, endAt: string) {
  return `${formatLongDate(startAt)} · ${formatTime(startAt)} - ${formatTime(endAt)}`;
}

export function formatDurationHours(startAt: string, endAt: string) {
  const start = new Date(startAt).getTime();
  const end = new Date(endAt).getTime();
  const hours = Math.max((end - start) / (1000 * 60 * 60), 0);
  return `${hours} ${hours === 1 ? 'hora' : 'horas'}`;
}

export function fullName(value?: { firstName?: string | null; lastName?: string | null; email?: string | null }) {
  const name = [value?.firstName, value?.lastName].filter(Boolean).join(' ').trim();
  return name || value?.email || 'Usuario';
}

export function percent(value: number) {
  return `${Math.round(value)}%`;
}
