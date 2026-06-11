import { useEffect, useMemo, useState } from 'react';
import { api, authStorage } from '../api';
import { AuthSession, LoginPayload, SessionMode, SignUpPayload, User } from '../types';

function modeFromUser(user: User | null): SessionMode {
  if (!user) return 'public';
  return user.role === 'ADMIN' || user.role === 'OPERATOR' ? 'admin' : 'user';
}

function persistSession(session: AuthSession) {
  authStorage.setSession(session);
  return session.user;
}

export function useSession() {
  const [user, setUser] = useState<User | null>(() => authStorage.getSession()?.user || null);
  const [isBootstrapping, setIsBootstrapping] = useState(Boolean(authStorage.getSession()?.token));
  const [authError, setAuthError] = useState<string | null>(null);

  const mode = useMemo(() => modeFromUser(user), [user]);

  useEffect(() => {
    let cancelled = false;
    const stored = authStorage.getSession();

    if (!stored?.token) {
      setIsBootstrapping(false);
      return;
    }

    api.me()
      .then((currentUser) => {
        if (cancelled) return;
        setUser(currentUser);
        authStorage.setSession({ ...stored, user: currentUser });
      })
      .catch(() => {
        if (cancelled) return;
        authStorage.clearSession();
        setUser(null);
      })
      .finally(() => {
        if (!cancelled) setIsBootstrapping(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function login(payload: LoginPayload) {
    setAuthError(null);
    const session = await api.login(payload);
    const authenticatedUser = persistSession(session);
    setUser(authenticatedUser);
    return authenticatedUser;
  }

  async function signUp(payload: SignUpPayload) {
    setAuthError(null);
    const session = await api.signUp(payload);
    const authenticatedUser = persistSession(session);
    setUser(authenticatedUser);
    return authenticatedUser;
  }

  function logout() {
    authStorage.clearSession();
    setUser(null);
    setAuthError(null);
  }

  return {
    mode,
    user,
    login,
    signUp,
    logout,
    isBootstrapping,
    authError,
  };
}
