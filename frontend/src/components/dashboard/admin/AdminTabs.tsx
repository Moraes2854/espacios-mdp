import { BarChart3, CalendarDays, Clock, CreditCard, MapPin, MessageCircle, Settings, ShieldCheck, Sparkles, UserRound } from 'lucide-react';
import { DashboardNavItem } from '../../layout/DashboardShell';

export type AdminTab = 'summary' | 'calendar' | 'spaces' | 'amenities' | 'bookings' | 'users' | 'leads' | 'payments' | 'modules' | 'audit';

export const adminTabs: DashboardNavItem<AdminTab>[] = [
  { id: 'summary', label: 'Resumen', Icon: BarChart3 },
  { id: 'calendar', label: 'Calendario', Icon: CalendarDays },
  { id: 'spaces', label: 'Espacios', Icon: MapPin },
  { id: 'amenities', label: 'Servicios', Icon: Sparkles },
  { id: 'bookings', label: 'Reservas', Icon: Clock },
  { id: 'users', label: 'Usuarios', Icon: UserRound },
  { id: 'leads', label: 'Consultas', Icon: MessageCircle },
  { id: 'payments', label: 'Pagos', Icon: CreditCard },
  { id: 'modules', label: 'Módulos', Icon: Settings },
  { id: 'audit', label: 'Auditoría', Icon: ShieldCheck },
];

export function AdminTabs() {
  return null;
}
