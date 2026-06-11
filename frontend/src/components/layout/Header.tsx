import { Mail, UserRound } from 'lucide-react';
import { businessConfig } from '../../config/business';
import { User } from '../../types';
import { fullName } from '../../utils/formatters';

type HeaderProps = {
  user?: User | null;
  onSignIn: () => void;
  onOpenPanel: () => void;
};

function goHome(event: React.MouseEvent<HTMLAnchorElement>) {
  event.preventDefault();
  window.history.pushState({}, '', '/');
  window.dispatchEvent(new PopStateEvent('popstate'));
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

export function Header({ user, onSignIn, onOpenPanel }: HeaderProps) {
  const userLabel = user ? fullName(user) || user.email : null;

  return (
    <header className="public-header public-header-premium">
      <a className="brand brand-premium" href="/" onClick={goHome}>
        <span>Espacios MDP</span>
      </a>

      <nav className="public-nav">
        <a href="#calendario">Calendario</a>
        <a href="#espacios">Espacios</a>
      </nav>

      <div className="header-actions">
        <a className="ghost-button hide-mobile" href={`mailto:${businessConfig.email}`}>
          <Mail size={15} /> Contacto
        </a>
        {user ? (
          <button className="panel-access-button" type="button" onClick={onOpenPanel} title={userLabel || 'Abrir panel'}>
            <span className="panel-access-avatar">{(user.firstName?.[0] || user.email[0] || 'U').toUpperCase()}</span>
            Panel
          </button>
        ) : (
          <button className="google-signin-placeholder" type="button" onClick={onSignIn}>
            <UserRound size={14} /> Sign in
          </button>
        )}
      </div>
    </header>
  );
}
