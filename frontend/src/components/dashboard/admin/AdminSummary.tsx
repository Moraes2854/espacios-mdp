import {
  CalendarDays,
  CreditCard,
  LayoutDashboard,
  ListChecks,
  MessageCircle,
  PieChart,
  Plus,
  UserRound,
} from 'lucide-react';
import { AdminMetrics, Booking, Lead, User } from '../../../types';
import { formatDateRange, formatDateTime, formatMoney, fullName, percent } from '../../../utils/formatters';
import { StatusBadge } from '../../common/StatusBadge';
import { AdminTab } from './AdminTabs';

type AdminSummaryProps = {
  metrics: AdminMetrics;
  recentBookings: Booking[];
  recentLeads: Lead[];
  occupancy: number;
  user: User;
  onChangeTab: (tab: AdminTab) => void;
};

type SummaryMetric = {
  label: string;
  value: string | number;
  hint?: string;
  tone?: 'primary' | 'secondary' | 'neutral' | 'tertiary';
  Icon: typeof CreditCard;
};

function getFirstName(user: User) {
  return user.firstName || fullName(user).split(' ')[0] || 'administrador';
}

function leadContact(lead: Lead) {
  return lead.phone || lead.email || 'Sin contacto informado';
}

function leadInitials(lead: Lead) {
  const source = lead.name || lead.email || lead.phone || 'Consulta';
  return source
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'C';
}

function bookingClient(booking: Booking) {
  return booking.user?.email || booking.professionalProfile?.displayName || 'Sin cliente asignado';
}

function SummaryMetricCard({ metric, isFeatured = false }: { metric: SummaryMetric; isFeatured?: boolean }) {
  const Icon = metric.Icon;

  return (
    <article className={isFeatured ? 'admin-summary-metric admin-summary-metric-featured' : `admin-summary-metric tone-${metric.tone || 'primary'}`}>
      <div>
        <span>{metric.label}</span>
        <strong>{metric.value}</strong>
        {metric.hint && <small>{metric.hint}</small>}
      </div>
      <div className="admin-summary-metric-icon">
        <Icon size={20} />
      </div>
    </article>
  );
}

function RecentBookingItem({ booking }: { booking: Booking }) {
  return (
    <article className="admin-recent-item">
      <div className="admin-recent-icon">
        <CalendarDays size={18} />
      </div>
      <div className="admin-recent-body">
        <strong>{booking.space?.name || 'Reserva'}</strong>
        <span>{bookingClient(booking)}</span>
        <small>{formatDateRange(booking.startAt, booking.endAt)}</small>
      </div>
      <div className="admin-recent-side">
        <strong>{formatMoney(booking.totalPrice)}</strong>
        <StatusBadge status={booking.status} />
      </div>
    </article>
  );
}

function RecentLeadItem({ lead }: { lead: Lead }) {
  return (
    <article className="admin-recent-item compact">
      <div className="admin-lead-avatar">{leadInitials(lead)}</div>
      <div className="admin-recent-body">
        <strong>{lead.name || 'Consulta sin nombre'}</strong>
        <span>{leadContact(lead)}</span>
        <small>{lead.message || lead.desiredSpace?.name || formatDateTime(lead.createdAt)}</small>
      </div>
      <div className="admin-recent-side">
        <StatusBadge status={lead.status} />
      </div>
    </article>
  );
}

export function AdminSummary({ metrics: adminMetrics, recentBookings, recentLeads, occupancy, user, onChangeTab }: AdminSummaryProps) {

  const featuredMetric: SummaryMetric = {
    label: 'Ingresos aprobados',
    value: formatMoney(adminMetrics.approvedRevenue),
    hint: 'Pagos confirmados',
    Icon: CreditCard,
    tone: 'secondary',
  };

  const metricCards: SummaryMetric[] = [
    { label: 'Espacios activos', value: adminMetrics.activeSpaces, Icon: ListChecks, tone: 'primary' },
    { label: 'Reservas activas', value: adminMetrics.activeBookings, Icon: CalendarDays, tone: 'tertiary' },
    { label: 'Usuarios registrados', value: adminMetrics.totalUsers, Icon: UserRound, tone: 'neutral' },
    { label: 'Consultas nuevas', value: adminMetrics.newLeads, Icon: MessageCircle, tone: 'neutral' },
    { label: 'Ocupación estimada', value: percent(occupancy), hint: 'Según reservas activas', Icon: PieChart, tone: 'primary' },
  ];

  return (
    <div className="admin-summary-page">
      <section className="admin-summary-welcome">
        <div>
          <span className="eyebrow">Resumen de hoy</span>
          <h2>Hola, {getFirstName(user)}</h2>
          <p>Revisá reservas, pagos, espacios y consultas desde un solo lugar.</p>
        </div>
        <button className="primary-button" type="button" onClick={() => onChangeTab('calendar')}>
          <Plus size={16} /> Nueva reserva
        </button>
      </section>

      <section className="admin-summary-metrics" aria-label="Métricas principales del panel">
        <SummaryMetricCard metric={featuredMetric} isFeatured />
        {metricCards.map((metric) => <SummaryMetricCard key={metric.label} metric={metric} />)}
      </section>

      <section className="admin-summary-grid">
        <article className="admin-summary-panel wide">
          <header>
            <div>
              <h3>Reservas recientes</h3>
              <p>Últimas reservas creadas en el sistema.</p>
            </div>
            <button className="link-button" type="button" onClick={() => onChangeTab('bookings')}>Ver todas</button>
          </header>

          <div className="admin-recent-list">
            {recentBookings.length ? (
              recentBookings.map((booking) => <RecentBookingItem key={booking.id} booking={booking} />)
            ) : (
              <div className="admin-summary-empty">
                <LayoutDashboard size={22} />
                <strong>Todavía no hay reservas</strong>
                <span>Cuando se cree una reserva, va a figurar en este resumen.</span>
              </div>
            )}
          </div>
        </article>

        <article className="admin-summary-panel">
          <header>
            <div>
              <h3>Consultas recientes</h3>
              <p>Contactos recibidos desde la web o WhatsApp.</p>
            </div>
            <button className="link-button" type="button" onClick={() => onChangeTab('leads')}>Ver todas</button>
          </header>

          <div className="admin-recent-list">
            {recentLeads.length ? (
              recentLeads.map((lead) => <RecentLeadItem key={lead.id} lead={lead} />)
            ) : (
              <div className="admin-summary-empty">
                <MessageCircle size={22} />
                <strong>No hay consultas nuevas</strong>
                <span>Las nuevas consultas van a aparecer en este listado.</span>
              </div>
            )}
          </div>
        </article>
      </section>
    </div>
  );
}
