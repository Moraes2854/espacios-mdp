import { useEffect, useMemo, useState } from 'react';
import { SignInModal } from './components/auth/SignInModal';
import { LoadingState } from './components/common/LoadingState';
import { useSession } from './hooks/useSession';
import { AdminView } from './views/AdminView';
import { PublicView } from './views/PublicView';
import { UserView } from './views/UserView';
import { LoginPayload, SignUpPayload, User } from './types';
import {
  currentPath,
  getAdminSectionFromPath,
  getUserSectionFromPath,
  isAdminPanelPath,
  isPanelPath,
  isUserPanelPath,
  navigateAdminSection,
  navigateHome,
  navigatePanel,
  navigateUserSection,
} from './utils/router';

function useBrowserPath() {
  const [pathname, setPathname] = useState(() => currentPath());

  useEffect(() => {
    const updatePathname = () => setPathname(currentPath());
    window.addEventListener('popstate', updatePathname);
    return () => window.removeEventListener('popstate', updatePathname);
  }, []);

  return pathname;
}

function isAdminUser(user: User | null) {
  return user?.role === 'ADMIN' || user?.role === 'OPERATOR';
}

function normalizePanelRoute(pathname: string, user: User) {
  if (isAdminUser(user)) {
    if (pathname === '/panel' || !isAdminPanelPath(pathname)) navigateAdminSection('summary');
    return;
  }

  if (pathname === '/user/panel' || !isUserPanelPath(pathname)) navigateUserSection('summary');
}

function App() {
  const { user, login, signUp, logout, isBootstrapping } = useSession();
  const pathname = useBrowserPath();
  const [showSignIn, setShowSignIn] = useState(false);
  const wantsPanel = useMemo(() => isPanelPath(pathname), [pathname]);

  useEffect(() => {
    if (!isBootstrapping && wantsPanel && !user) {
      setShowSignIn(true);
    }
  }, [isBootstrapping, wantsPanel, user]);

  useEffect(() => {
    if (!isBootstrapping && wantsPanel && user) {
      normalizePanelRoute(pathname, user);
    }
  }, [isBootstrapping, pathname, wantsPanel, user]);

  async function handleLogin(payload: LoginPayload) {
    const authenticatedUser = await login(payload);
    setShowSignIn(false);
    if (wantsPanel) normalizePanelRoute(pathname, authenticatedUser);
  }

  async function handleSignUp(payload: SignUpPayload) {
    const authenticatedUser = await signUp(payload);
    setShowSignIn(false);
    navigatePanel(authenticatedUser.role);
  }

  function handleLogout() {
    logout();
    navigateHome();
  }

  if (isBootstrapping) {
    return (
      <main className="app-loading-shell">
        <LoadingState label="Recuperando sesión..." />
      </main>
    );
  }

  if (wantsPanel && user) {
    return isAdminUser(user) ? (
      <AdminView user={user} activeTab={getAdminSectionFromPath(pathname)} onLogout={handleLogout} />
    ) : (
      <UserView user={user} activeTab={getUserSectionFromPath(pathname)} onLogout={handleLogout} />
    );
  }

  return (
    <>
      <PublicView
        user={user}
        onSignIn={() => setShowSignIn(true)}
        onOpenPanel={() => (user ? navigatePanel(user.role) : setShowSignIn(true))}
      />
      {showSignIn && (
        <SignInModal
          onClose={() => setShowSignIn(false)}
          onLogin={handleLogin}
          onSignUp={handleSignUp}
        />
      )}
    </>
  );
}

export default App;
