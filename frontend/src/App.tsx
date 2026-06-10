import {
  CalendarDays,
  Check,
  Clock,
  CreditCard,
  FileText,
  LayoutDashboard,
  LockKeyhole,
  LogOut,
  Mail,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  UserRound,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { api } from './api';
import {
  buildFallbackCalendar,
  fallbackAdminDashboard,
  fallbackBookings,
  fallbackPricingModules,
  fallbackSpaces,
  fallbackUser,
} from './fallbackData';
import {
  AdminDashboard,
  Booking,
  CalendarDay,
  CalendarSlot,
  PricingModule,
  SessionMode,
  Space,
  SpaceAvailabilityCalendar,
  User,
} from './types';

const whatsapp = import.meta.env.VITE_BUSINESS_WHATSAPP || '5492235196273';
const email = import.meta.env.VITE_BUSINESS_EMAIL || 'moraessantiago@gmail.com';

type SignInModalProps = {
  onClose: () => void;
  onLogin: (mode: SessionMode) => void;
};

type SelectedRange = {
  spaceId: string;
  startAt: string;
  endAt: string;
  slotKeys: string[];
};

function formatMoney(value: string | number | undefined) {
  const numeric = Number(value || 0);
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(numeric);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('es-AR', { weekday: 'short', day: '2-digit', month: 'short' }).format(new Date(`${value}T00:00:00`));
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function slotKey(slot: CalendarSlot) {
  return slot.startAt;
}

function moduleHours(module?: PricingModule) {
  return module?.durationHours || module?.weeklyHours || 1;
}

function App() {
  const [mode, setMode] = useState<SessionMode>('public');
  const [showSignIn, setShowSignIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  async function handleLogin(nextMode: SessionMode) {
    try {
      const response = await api.devLogin(nextMode);
      setUser(response.user || fallbackUser);
    } catch {
      setUser(nextMode === 'admin' ? { ...fallbackUser, role: 'ADMIN', email: 'admin@espaciosmdp.com', firstName: 'Santiago' } : fallbackUser);
    }
    setMode(nextMode);
    setShowSignIn(false);
  }

  function logout() {
    setMode('public');
    setUser(null);
  }

  return (
    <div className="app-shell">
      <Header mode={mode} user={user} onSignIn={() => setShowSignIn(true)} onLogout={logout} />
      <main>
        {mode === 'public' && <PublicView onSignIn={() => setShowSignIn(true)} />}
        {mode === 'user' && <UserView user={user || fallbackUser} />}
        {mode === 'admin' && <AdminView user={user || { ...fallbackUser, role: 'ADMIN' }} />}
      </main>
      <Footer />
      {showSignIn && <SignInModal onClose={() => setShowSignIn(false)} onLogin={handleLogin} />}
    </div>
  );
}

function Header({ mode, user, onSignIn, onLogout }: { mode: SessionMode; user: User | null; onSignIn: () => void; onLogout: () => void }) {
  return (
    <header className="topbar">
      <a className="brand" href="#home" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
        <div className="brand-mark">MDP</div>
        <div>
          <strong>Espacios MDP</strong>
          <span>Profesional · Flexible · Céntrico</span>
        </div>
      </a>
      <nav className="nav-links">
        <a href="#calendario">Calendario</a>
        <a href="#modulos">Módulos</a>
        <a href="#espacios">Espacios</a>
        {mode !== 'public' && <a href="#panel">Panel</a>}
      </nav>
      <div className="topbar-actions">
        <a className="ghost-button hide-mobile" href={`mailto:${email}`}>
          <Mail size={16} /> Contacto
        </a>
        {mode === 'public' ? (
          <button className="primary-button" onClick={onSignIn}>
            <UserRound size={16} /> Sign in
          </button>
        ) : (
          <div className="session-pill">
            <span>{user?.firstName || 'Usuario'}</span>
            <button onClick={onLogout} title="Cerrar sesión">
              <LogOut size={16} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

function SignInModal({ onClose, onLogin }: SignInModalProps) {
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <section className="modal-card" onMouseDown={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <div>
            <p className="eyebrow">Acceso</p>
            <h2>Ingresar a Espacios MDP</h2>
          </div>
          <button className="icon-button" onClick={onClose}>×</button>
        </div>

        <button className="google-button" disabled>
          <span className="google-dot">G</span>
          Continuar con Google
          <small>OAuth pendiente</small>
        </button>

        <div className="divider"><span>Modo demo</span></div>

        <div className="modal-grid">
          <button className="role-card" onClick={() => onLogin('user')}>
            <UserRound />
            <strong>Usuario registrado</strong>
            <span>Reservas, pagos, perfil profesional y disponibilidad.</span>
          </button>
          <button className="role-card" onClick={() => onLogin('admin')}>
            <LayoutDashboard />
            <strong>Admin</strong>
            <span>Espacios, calendario, clientes, leads, pagos y auditoría.</span>
          </button>
        </div>
      </section>
    </div>
  );
}

function useCoreData() {
  const [spaces, setSpaces] = useState<Space[]>(fallbackSpaces);
  const [pricingModules, setPricingModules] = useState<PricingModule[]>(fallbackPricingModules);

  useEffect(() => {
    api.getSpaces().then(setSpaces).catch(() => setSpaces(fallbackSpaces));
    api.getPricingModules().then(setPricingModules).catch(() => setPricingModules(fallbackPricingModules));
  }, []);

  return { spaces, pricingModules };
}

function PublicView({ onSignIn }: { onSignIn: () => void }) {
  const { spaces, pricingModules } = useCoreData();

  return (
    <>
      <section className="hero" id="home">
        <div className="hero-copy">
          <span className="eyebrow">Mar del Plata · reserva por hora</span>
          <h1>Espacios profesionales con calendario real y módulos por hora.</h1>
          <p>
            Elegí el espacio, seleccioná un módulo y marcá el horario disponible. La estructura queda preparada para reservas online, pagos, calendario y acceso digital.
          </p>
          <div className="hero-actions">
            <a className="primary-button" href="#calendario">
              <CalendarDays size={18} /> Ver disponibilidad
            </a>
            <a className="ghost-button" href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer">
              <MessageCircle size={18} /> Consultar por WhatsApp
            </a>
          </div>
          <div className="trust-row">
            <span><Check size={15} /> Pago por adelantado</span>
            <span><Check size={15} /> Limpieza incluida</span>
            <span><Check size={15} /> Acceso digital futuro</span>
          </div>
        </div>
        <div className="hero-card">
          <div className="hero-card-overlay">
            <Sparkles size={18} /> Disponible por módulos
          </div>
        </div>
      </section>

      <section className="section" id="calendario">
        <SectionHeading
          eyebrow="Calendario reutilizable"
          title="Elegí un horario disponible"
          text="El mismo componente se reutiliza para visitantes, usuarios registrados y admin. En público permite consultar; registrado permite reservar; admin permite visualizar operación."
        />
        <BookingCalendar mode="public" spaces={spaces} pricingModules={pricingModules} onSignIn={onSignIn} />
      </section>

      <PricingModulesSection pricingModules={pricingModules} />
      <SpacesSection spaces={spaces} />
    </>
  );
}

function UserView({ user }: { user: User }) {
  const { spaces, pricingModules } = useCoreData();
  const [bookings, setBookings] = useState<Booking[]>(fallbackBookings);

  useEffect(() => {
    api.getBookings(user.id).then(setBookings).catch(() => setBookings(fallbackBookings));
  }, [user.id]);

  return (
    <section className="dashboard" id="panel">
      <div className="dashboard-hero">
        <div>
          <span className="eyebrow">Usuario registrado</span>
          <h1>Reservá por módulo y consultá tus horarios.</h1>
          <p>Vista pensada para profesionales y clientes recurrentes. Puede evolucionar a pagos, facturación y códigos de acceso por reserva.</p>
        </div>
        <ProfileCard user={user} />
      </div>

      <div className="two-column wide-first">
        <div className="panel-card">
          <h2>Calendario de disponibilidad</h2>
          <BookingCalendar mode="user" user={user} spaces={spaces} pricingModules={pricingModules} onBookingCreated={(booking) => setBookings((current) => [booking, ...current])} />
        </div>
        <div className="panel-card">
          <h2>Mis reservas</h2>
          <BookingList bookings={bookings} />
        </div>
      </div>
    </section>
  );
}

function AdminView({ user }: { user: User }) {
  const [dashboard, setDashboard] = useState<AdminDashboard>(fallbackAdminDashboard);
  const [activeTab, setActiveTab] = useState<'calendar' | 'modules' | 'bookings' | 'spaces' | 'users' | 'leads' | 'payments' | 'audit'>('calendar');

  useEffect(() => {
    api.getAdminDashboard().then(setDashboard).catch(() => setDashboard(fallbackAdminDashboard));
  }, []);

  return (
    <section className="dashboard" id="panel">
      <div className="dashboard-hero admin-hero">
        <div>
          <span className="eyebrow">Admin</span>
          <h1>Operación: calendario, módulos, reservas y datos.</h1>
          <p>Panel inicial para administrar el negocio. Los módulos ya viven como entidad propia en base de datos y alimentan el calendario.</p>
        </div>
        <ProfileCard user={user} admin />
      </div>

      <div className="grid metric-grid">
        <Metric label="Espacios activos" value={dashboard.metrics.activeSpaces} />
        <Metric label="Usuarios" value={dashboard.metrics.totalUsers} />
        <Metric label="Leads nuevos" value={dashboard.metrics.newLeads} />
        <Metric label="Reservas activas" value={dashboard.metrics.activeBookings} />
        <Metric label="Ingresos aprobados" value={formatMoney(dashboard.metrics.approvedRevenue)} />
      </div>

      <div className="admin-layout">
        <aside className="admin-tabs">
          <button className={activeTab === 'calendar' ? 'active' : ''} onClick={() => setActiveTab('calendar')}><CalendarDays size={16} /> Calendario</button>
          <button className={activeTab === 'modules' ? 'active' : ''} onClick={() => setActiveTab('modules')}><CreditCard size={16} /> Módulos</button>
          <button className={activeTab === 'bookings' ? 'active' : ''} onClick={() => setActiveTab('bookings')}><Clock size={16} /> Reservas</button>
          <button className={activeTab === 'spaces' ? 'active' : ''} onClick={() => setActiveTab('spaces')}><MapPin size={16} /> Espacios</button>
          <button className={activeTab === 'users' ? 'active' : ''} onClick={() => setActiveTab('users')}><UserRound size={16} /> Usuarios</button>
          <button className={activeTab === 'leads' ? 'active' : ''} onClick={() => setActiveTab('leads')}><MessageCircle size={16} /> Leads</button>
          <button className={activeTab === 'payments' ? 'active' : ''} onClick={() => setActiveTab('payments')}><FileText size={16} /> Pagos</button>
          <button className={activeTab === 'audit' ? 'active' : ''} onClick={() => setActiveTab('audit')}><ShieldCheck size={16} /> Auditoría</button>
        </aside>

        <div className="panel-card">
          {activeTab === 'calendar' && <BookingCalendar mode="admin" user={user} spaces={dashboard.spaces} pricingModules={dashboard.pricingModules} />}
          {activeTab === 'modules' && <PricingModulesAdmin pricingModules={dashboard.pricingModules} />}
          {activeTab === 'bookings' && <BookingsTable bookings={dashboard.bookings} />}
          {activeTab === 'spaces' && <SpacesAdmin spaces={dashboard.spaces} />}
          {activeTab === 'users' && <UsersTable users={dashboard.users} />}
          {activeTab === 'leads' && <LeadsTable leads={dashboard.leads} />}
          {activeTab === 'payments' && <PaymentsTable payments={dashboard.payments} />}
          {activeTab === 'audit' && <AuditTable auditLogs={dashboard.auditLogs} />}
        </div>
      </div>
    </section>
  );
}

function BookingCalendar({
  mode,
  user,
  spaces,
  pricingModules,
  onSignIn,
  onBookingCreated,
}: {
  mode: SessionMode;
  user?: User;
  spaces: Space[];
  pricingModules: PricingModule[];
  onSignIn?: () => void;
  onBookingCreated?: (booking: Booking) => void;
}) {
  const [spaceId, setSpaceId] = useState(spaces[0]?.id || '');
  const [moduleId, setModuleId] = useState(pricingModules[0]?.id || '');
  const [calendars, setCalendars] = useState<SpaceAvailabilityCalendar[]>(buildFallbackCalendar(spaceId));
  const [selected, setSelected] = useState<SelectedRange | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (spaces[0]?.id && !spaceId) setSpaceId(spaces[0].id);
  }, [spaces, spaceId]);

  useEffect(() => {
    if (pricingModules[0]?.id && !moduleId) setModuleId(pricingModules[0].id);
  }, [pricingModules, moduleId]);

  useEffect(() => {
    if (!spaceId) return;
    setSelected(null);
    api.getAvailabilitySlots({ spaceId, days: 7 })
      .then(setCalendars)
      .catch(() => setCalendars(buildFallbackCalendar(spaceId)));
  }, [spaceId]);

  const selectedModule = pricingModules.find((item) => item.id === moduleId) || pricingModules[0];
  const currentCalendar = calendars.find((item) => item.spaceId === spaceId) || calendars[0];
  const hours = moduleHours(selectedModule);

  function trySelect(day: CalendarDay, slotIndex: number) {
    if (!selectedModule || !currentCalendar) return;
    const range = day.slots.slice(slotIndex, slotIndex + hours);
    const canSelect = range.length === hours && range.every((slot) => slot.status === 'AVAILABLE');
    if (!canSelect) {
      setMessage('Ese módulo no entra completo en el bloque seleccionado. Elegí horas consecutivas disponibles.');
      return;
    }
    setMessage(null);
    setSelected({
      spaceId: currentCalendar.spaceId,
      startAt: range[0].startAt,
      endAt: range[range.length - 1].endAt,
      slotKeys: range.map(slotKey),
    });
  }

  async function createBooking() {
    if (mode === 'public') {
      onSignIn?.();
      return;
    }
    if (!selected || !selectedModule) {
      setMessage('Primero seleccioná un horario disponible.');
      return;
    }

    try {
      const booking = await api.createBooking({
        spaceId: selected.spaceId,
        userId: user?.id,
        professionalProfileId: user?.professionalProfile?.id,
        pricingModuleId: selectedModule.id,
        startAt: selected.startAt,
        endAt: selected.endAt,
        status: mode === 'admin' ? 'CONFIRMED' : 'PENDING',
        bookingType: mode === 'admin' ? 'INTERNAL_USE' : selectedModule.moduleType === 'WEEKLY_PACK' ? 'RECURRENT' : 'ONE_TIME',
        notes: mode === 'admin' ? 'Carga rápida desde calendario admin.' : 'Reserva solicitada desde calendario web.',
      });
      setMessage(mode === 'admin' ? 'Reserva/bloqueo creado correctamente.' : 'Reserva solicitada. Queda pendiente de confirmación/pago.');
      setSelected(null);
      onBookingCreated?.(booking);
      const refreshed = await api.getAvailabilitySlots({ spaceId, days: 7 });
      setCalendars(refreshed);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo crear la reserva.');
    }
  }

  return (
    <div className="calendar-shell">
      <div className="calendar-toolbar">
        <label>
          <span>Espacio</span>
          <select value={spaceId} onChange={(event) => setSpaceId(event.target.value)}>
            {spaces.map((space) => <option key={space.id} value={space.id}>{space.name}</option>)}
          </select>
        </label>
        <label>
          <span>Módulo</span>
          <select value={moduleId} onChange={(event) => setModuleId(event.target.value)}>
            {pricingModules.map((module) => <option key={module.id} value={module.id}>{module.name} · {formatMoney(module.totalPrice)}</option>)}
          </select>
        </label>
        <div className="module-summary">
          <strong>{selectedModule?.name || 'Módulo'}</strong>
          <span>{hours} h · {formatMoney(selectedModule?.pricePerHour)} / h · Total {formatMoney(selectedModule?.totalPrice)}</span>
        </div>
      </div>

      <div className="calendar-grid" style={{ gridTemplateColumns: `repeat(${currentCalendar?.days.length || 7}, minmax(148px, 1fr))` }}>
        {currentCalendar?.days.map((day) => (
          <div className="calendar-day" key={day.date}>
            <div className="calendar-day-header">
              <strong>{formatDate(day.date)}</strong>
              <span>{day.isClosed ? 'Cerrado' : `${day.slots.length} horarios`}</span>
            </div>
            <div className="slot-stack">
              {day.isClosed && <div className="closed-day">Domingo cerrado</div>}
              {day.slots.map((slot, index) => {
                const key = slotKey(slot);
                const isSelected = selected?.slotKeys.includes(key);
                return (
                  <button
                    key={key}
                    className={`slot-button ${slot.status.toLowerCase()} ${isSelected ? 'selected' : ''}`}
                    disabled={slot.status !== 'AVAILABLE'}
                    onClick={() => trySelect(day, index)}
                    title={slot.blockReason || slot.bookingStatus || slot.status}
                  >
                    <span>{slot.label}</span>
                    <small>{slot.status === 'AVAILABLE' ? 'Disponible' : slot.status === 'BOOKED' ? 'Ocupado' : slot.status === 'BLOCKED' ? 'Bloqueado' : 'Pasado'}</small>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="calendar-footer-panel">
        <div>
          <span className="eyebrow">Selección</span>
          <strong>{selected ? `${formatDateTime(selected.startAt)} → ${new Date(selected.endAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}` : 'Todavía no seleccionaste horario'}</strong>
          <p>{selectedModule ? `${selectedModule.name} · ${formatMoney(selectedModule.totalPrice)}` : 'Elegí un módulo de precio.'}</p>
        </div>
        <button className="primary-button" onClick={createBooking}>
          {mode === 'public' ? 'Iniciar sesión para reservar' : mode === 'admin' ? 'Crear reserva admin' : 'Solicitar reserva'}
        </button>
      </div>
      {message && <p className="calendar-message">{message}</p>}
    </div>
  );
}

function SectionHeading({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) {
  return (
    <div className="section-heading">
      <span className="eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      <p>{text}</p>
    </div>
  );
}

function PricingModulesSection({ pricingModules }: { pricingModules: PricingModule[] }) {
  return (
    <section className="section muted" id="modulos">
      <SectionHeading
        eyebrow="Módulos guardados en base de datos"
        title="Precios por módulo"
        text="Los precios no quedan hardcodeados en la vista: se consumen desde el modelo PricingModule."
      />
      <div className="grid pricing-grid dense-pricing">
        {pricingModules.map((module) => (
          <article className="price-card" key={module.id}>
            <span>{module.moduleType === 'WEEKLY_PACK' ? 'Semanal' : 'Por hora'}</span>
            <h3>{module.name}</h3>
            <div className="price-main">{formatMoney(module.totalPrice)}</div>
            <p>{moduleHours(module)} h · {formatMoney(module.pricePerHour)} por hora</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function SpacesSection({ spaces }: { spaces: Space[] }) {
  return (
    <section className="section" id="espacios">
      <SectionHeading eyebrow="Espacios" title="Preparado para uno o varios espacios" text="El calendario permite cambiar de espacio y recalcular disponibilidad según reglas, bloqueos y reservas." />
      <div className="grid space-grid">
        {spaces.map((space) => (
          <article className="space-card" key={space.id}>
            <img src={space.images?.[0]?.url} alt={space.images?.[0]?.alt || space.name} />
            <div>
              <h3>{space.name}</h3>
              <p>{space.description}</p>
              <div className="amenity-row">
                {space.amenities?.slice(0, 4).map((amenity) => <span key={amenity.id}>{amenity.name}</span>)}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function ProfileCard({ user, admin = false }: { user: User; admin?: boolean }) {
  return (
    <aside className={`profile-card ${admin ? 'admin-profile' : ''}`}>
      <UserRound />
      <strong>{user.firstName} {user.lastName}</strong>
      <span>{user.email}</span>
      <small>{admin ? 'Administrador' : user.professionalProfile?.profession || 'Profesional'}</small>
    </aside>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="panel-card metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function BookingList({ bookings }: { bookings: Booking[] }) {
  if (!bookings.length) return <p className="muted-text">Todavía no tenés reservas.</p>;
  return (
    <div className="list-stack">
      {bookings.map((booking) => (
        <article className="booking-item" key={booking.id}>
          <div>
            <strong>{booking.space?.name || 'Espacio'}</strong>
            <span>{formatDateTime(booking.startAt)} → {new Date(booking.endAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}</span>
            <span>{booking.pricingModule?.name || booking.bookingType}</span>
          </div>
          <div>
            <strong>{formatMoney(booking.totalPrice)}</strong>
            <span className={`status ${booking.status.toLowerCase()}`}>{booking.status}</span>
          </div>
        </article>
      ))}
    </div>
  );
}

function PricingModulesAdmin({ pricingModules }: { pricingModules: PricingModule[] }) {
  return (
    <div>
      <h2>Módulos de precio</h2>
      <p className="muted-text">Estos registros salen del modelo PricingModule. Después se pueden editar desde admin.</p>
      <Table headers={['Módulo', 'Tipo', 'Horas', 'Precio/h', 'Total', 'Activo']}>
        {pricingModules.map((module) => (
          <tr key={module.id}>
            <td>{module.name}</td>
            <td>{module.moduleType}</td>
            <td>{moduleHours(module)}</td>
            <td>{formatMoney(module.pricePerHour)}</td>
            <td>{formatMoney(module.totalPrice)}</td>
            <td>{module.isActive ? 'Sí' : 'No'}</td>
          </tr>
        ))}
      </Table>
    </div>
  );
}

function BookingsTable({ bookings }: { bookings: Booking[] }) {
  return (
    <div>
      <h2>Reservas</h2>
      <Table headers={['Espacio', 'Cliente', 'Inicio', 'Fin', 'Módulo', 'Estado', 'Total']}>
        {bookings.map((booking) => (
          <tr key={booking.id}>
            <td>{booking.space?.name || '-'}</td>
            <td>{booking.user?.email || booking.professionalProfile?.displayName || '-'}</td>
            <td>{formatDateTime(booking.startAt)}</td>
            <td>{formatDateTime(booking.endAt)}</td>
            <td>{booking.pricingModule?.name || '-'}</td>
            <td><span className={`status ${booking.status.toLowerCase()}`}>{booking.status}</span></td>
            <td>{formatMoney(booking.totalPrice)}</td>
          </tr>
        ))}
      </Table>
    </div>
  );
}

function SpacesAdmin({ spaces }: { spaces: Space[] }) {
  return (
    <div>
      <h2>Espacios</h2>
      <Table headers={['Nombre', 'Capacidad', 'Dirección', 'Precio base', 'Estado']}>
        {spaces.map((space) => (
          <tr key={space.id}>
            <td>{space.name}</td>
            <td>{space.capacity || '-'}</td>
            <td>{space.address || '-'}</td>
            <td>{formatMoney(space.baseHourlyPrice)}</td>
            <td>{space.isActive ? 'Activo' : 'Inactivo'}</td>
          </tr>
        ))}
      </Table>
    </div>
  );
}

function UsersTable({ users }: { users: User[] }) {
  return (
    <div>
      <h2>Usuarios</h2>
      <Table headers={['Nombre', 'Email', 'Teléfono', 'Rol', 'Profesión']}>
        {users.map((user) => (
          <tr key={user.id}>
            <td>{user.firstName} {user.lastName}</td>
            <td>{user.email}</td>
            <td>{user.phone || '-'}</td>
            <td>{user.role}</td>
            <td>{user.professionalProfile?.profession || '-'}</td>
          </tr>
        ))}
      </Table>
    </div>
  );
}

function LeadsTable({ leads }: { leads: AdminDashboard['leads'] }) {
  return (
    <div>
      <h2>Leads</h2>
      <Table headers={['Nombre', 'Contacto', 'Espacio', 'Estado', 'Fecha']}>
        {leads.map((lead) => (
          <tr key={lead.id}>
            <td>{lead.name || '-'}</td>
            <td>{lead.phone || lead.email || '-'}</td>
            <td>{lead.desiredSpace?.name || '-'}</td>
            <td>{lead.status}</td>
            <td>{formatDateTime(lead.createdAt)}</td>
          </tr>
        ))}
      </Table>
    </div>
  );
}

function PaymentsTable({ payments }: { payments: AdminDashboard['payments'] }) {
  return (
    <div>
      <h2>Pagos</h2>
      <Table headers={['Reserva', 'Usuario', 'Método', 'Estado', 'Monto']}>
        {payments.map((payment) => (
          <tr key={payment.id}>
            <td>{payment.booking?.space?.name || payment.bookingId}</td>
            <td>{payment.user?.email || '-'}</td>
            <td>{payment.method}</td>
            <td><span className={`status ${payment.status.toLowerCase()}`}>{payment.status}</span></td>
            <td>{formatMoney(payment.amount)}</td>
          </tr>
        ))}
      </Table>
    </div>
  );
}

function AuditTable({ auditLogs }: { auditLogs: AdminDashboard['auditLogs'] }) {
  return (
    <div>
      <h2>Auditoría</h2>
      <Table headers={['Acción', 'Entidad', 'Usuario', 'Fecha']}>
        {auditLogs.map((log) => (
          <tr key={log.id}>
            <td>{log.action}</td>
            <td>{log.entityType}</td>
            <td>{log.user?.email || '-'}</td>
            <td>{formatDateTime(log.createdAt)}</td>
          </tr>
        ))}
      </Table>
    </div>
  );
}

function Table({ headers, children }: { headers: string[]; children: React.ReactNode }) {
  return (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>{headers.map((header) => <th key={header}>{header}</th>)}</tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div>
        <strong>Espacios MDP</strong>
        <p>Espacios profesionales y consultorios por hora en Mar del Plata.</p>
      </div>
      <div className="footer-links">
        <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer"><MessageCircle size={16} /> WhatsApp</a>
        <a href={`mailto:${email}`}><Mail size={16} /> {email}</a>
        <span><LockKeyhole size={16} /> Acceso digital futuro</span>
      </div>
    </footer>
  );
}

export default App;
