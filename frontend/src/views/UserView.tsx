import { CalendarDays, Home, ListChecks, Plus, UserRound } from 'lucide-react';
import { DashboardNavItem, DashboardShell } from '../components/layout/DashboardShell';
import { UserCalendarPage } from '../pages/user/UserCalendarPage';
import { UserBookingsPage } from '../pages/user/UserBookingsPage';
import { UserProfilePage } from '../pages/user/UserProfilePage';
import { UserSpacesPage } from '../pages/user/UserSpacesPage';
import { UserSummaryPage } from '../pages/user/UserSummaryPage';
import { User } from '../types';
import { UserSection, navigateUserSection } from '../utils/router';

type UserViewProps = {
  user: User;
  activeTab: UserSection;
  onLogout: () => void;
};

const userTabs: DashboardNavItem<UserSection>[] = [
  { id: 'summary', label: 'Mi resumen', Icon: Home },
  { id: 'calendar', label: 'Calendario', Icon: CalendarDays },
  { id: 'bookings', label: 'Mis reservas', Icon: ListChecks },
  { id: 'spaces', label: 'Espacios', Icon: Plus },
  { id: 'profile', label: 'Perfil', Icon: UserRound },
];

function UserRoute({ activeTab, user }: { activeTab: UserSection; user: User }) {
  switch (activeTab) {
    case 'calendar':
      return <UserCalendarPage user={user} />;
    case 'bookings':
      return <UserBookingsPage user={user} />;
    case 'spaces':
      return <UserSpacesPage onNavigate={navigateUserSection} />;
    case 'profile':
      return <UserProfilePage user={user} />;
    case 'summary':
    default:
      return <UserSummaryPage user={user} onNavigate={navigateUserSection} />;
  }
}

export function UserView({ user, activeTab, onLogout }: UserViewProps) {
  return (
    <DashboardShell
      title="Mi panel"
      subtitle="Gestioná tus reservas y consultá disponibilidad real."
      user={user}
      activeItem={activeTab}
      items={userTabs}
      onChangeItem={navigateUserSection}
      onLogout={onLogout}
    >
      <UserRoute activeTab={activeTab} user={user} />
    </DashboardShell>
  );
}
