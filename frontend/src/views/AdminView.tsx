import { Download, Plus } from 'lucide-react';
import { AdminTab, adminTabs } from '../components/dashboard/admin/AdminTabs';
import { DashboardShell } from '../components/layout/DashboardShell';
import { User } from '../types';
import { navigateAdminSection } from '../utils/router';
import { AdminAmenitiesPage } from '../pages/admin/AdminAmenitiesPage';
import { AdminAuditPage } from '../pages/admin/AdminAuditPage';
import { AdminBookingsPage } from '../pages/admin/AdminBookingsPage';
import { AdminCalendarPage } from '../pages/admin/AdminCalendarPage';
import { AdminLeadsPage } from '../pages/admin/AdminLeadsPage';
import { AdminPaymentsPage } from '../pages/admin/AdminPaymentsPage';
import { AdminPricingModulesPage } from '../pages/admin/AdminPricingModulesPage';
import { AdminSpacesPage } from '../pages/admin/AdminSpacesPage';
import { AdminSummaryPage } from '../pages/admin/AdminSummaryPage';
import { AdminUsersPage } from '../pages/admin/AdminUsersPage';

type AdminViewProps = {
  user: User;
  activeTab: AdminTab;
  onLogout: () => void;
};

function AdminRoute({ activeTab, user }: { activeTab: AdminTab; user: User }) {
  switch (activeTab) {
    case 'calendar':
      return <AdminCalendarPage user={user} />;
    case 'spaces':
      return <AdminSpacesPage />;
    case 'amenities':
      return <AdminAmenitiesPage />;
    case 'bookings':
      return <AdminBookingsPage />;
    case 'users':
      return <AdminUsersPage />;
    case 'leads':
      return <AdminLeadsPage />;
    case 'payments':
      return <AdminPaymentsPage />;
    case 'modules':
      return <AdminPricingModulesPage />;
    case 'audit':
      return <AdminAuditPage />;
    case 'summary':
    default:
      return <AdminSummaryPage user={user} onNavigate={navigateAdminSection} />;
  }
}

export function AdminView({ user, activeTab, onLogout }: AdminViewProps) {
  return (
    <DashboardShell
      title="Panel de administración"
      subtitle="Estado operativo de reservas, espacios, pagos y consultas."
      user={user}
      activeItem={activeTab}
      items={adminTabs}
      onChangeItem={navigateAdminSection}
      onLogout={onLogout}
      actions={(
        <div className="admin-actions dashboard-actions">
          <button className="ghost-button"><Download size={16} /> Exportar</button>
          <button className="primary-button" onClick={() => navigateAdminSection('calendar')}><Plus size={16} /> Nueva reserva</button>
        </div>
      )}
    >
      <AdminRoute activeTab={activeTab} user={user} />
    </DashboardShell>
  );
}
