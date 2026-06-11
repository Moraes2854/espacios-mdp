import { Home, LucideIcon, LogOut } from 'lucide-react';
import { ReactNode } from 'react';
import { businessConfig } from '../../config/business';
import { User } from '../../types';
import { fullName } from '../../utils/formatters';
import { navigateHome } from '../../utils/router';

export type DashboardNavItem<T extends string> = {
  id: T;
  label: string;
  Icon: LucideIcon;
};

type DashboardShellProps<T extends string> = {
  title: string;
  subtitle: string;
  user: User;
  activeItem: T;
  items: DashboardNavItem<T>[];
  onChangeItem: (item: T) => void;
  onLogout?: () => void;
  actions?: ReactNode;
  children: ReactNode;
};

export function DashboardShell<T extends string>({
  title,
  subtitle,
  user,
  activeItem,
  items,
  onChangeItem,
  onLogout,
  actions,
  children,
}: DashboardShellProps<T>) {
  const preferredMobileIds = ['summary', 'calendar', 'bookings'];
  const mobileItems = preferredMobileIds
    .map((id) => items.find((item) => item.id === id))
    .filter(Boolean) as DashboardNavItem<T>[];
  const fallbackMobileItems = mobileItems.length ? mobileItems : items.slice(0, 3);

  return (
    <div className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <div className="sidebar-brand">
          <span className="brand-mark">MDP</span>
          <div>
            <strong>{businessConfig.name}</strong>
            <small>{title}</small>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button className="sidebar-home-link" type="button" onClick={navigateHome}>
            <Home size={18} /> Inicio
          </button>

          <span className="sidebar-nav-separator" aria-hidden="true" />

          {items.map(({ id, label, Icon }) => (
            <button key={id} className={activeItem === id ? 'active' : ''} onClick={() => onChangeItem(id)}>
              <Icon size={18} /> {label}
            </button>
          ))}
        </nav>

        <div className="sidebar-profile">
          <div className="avatar">{(user.firstName?.[0] || user.email[0] || 'U').toUpperCase()}</div>
          <div>
            <strong>{fullName(user)}</strong>
            <span>{user.email}</span>
          </div>
          {onLogout && (
            <button className="icon-button" onClick={onLogout} title="Cerrar sesión">
              <LogOut size={16} />
            </button>
          )}
        </div>
      </aside>

      <div className="dashboard-main">
        <header className="dashboard-topbar">
          <div>
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>
          <div className="dashboard-topbar-actions">
            {actions}
            <div className="dashboard-mobile-brand">
              <span className="brand-mark">MDP</span>
            </div>
          </div>
        </header>

        <div className="dashboard-mobile-section-picker" aria-label="Secciones del panel">
          {items.map(({ id, label }) => (
            <button key={id} type="button" className={activeItem === id ? 'active' : ''} onClick={() => onChangeItem(id)}>
              {label}
            </button>
          ))}
        </div>

        {children}
      </div>

      <nav className="mobile-bottom-nav">
        <button className="mobile-home-link" type="button" onClick={navigateHome}>
          <Home size={18} />
          <span>Inicio</span>
        </button>
        {fallbackMobileItems.map(({ id, label, Icon }) => (
          <button key={id} className={activeItem === id ? 'active' : ''} onClick={() => onChangeItem(id)}>
            <Icon size={18} />
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
