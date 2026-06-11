export const ROUTES = {
  home: '/',
  adminPanel: '/panel/resumen',
  userPanel: '/user/panel/resumen',
  legacyPanel: '/panel',
  legacyUserPanel: '/user/panel',
} as const;

export type AdminSection = 'summary' | 'calendar' | 'spaces' | 'amenities' | 'bookings' | 'users' | 'leads' | 'payments' | 'modules' | 'audit';
export type UserSection = 'summary' | 'calendar' | 'bookings' | 'spaces' | 'profile';

const ADMIN_SECTION_SLUGS: Record<AdminSection, string> = {
  summary: 'resumen',
  calendar: 'calendario',
  spaces: 'espacios',
  amenities: 'servicios',
  bookings: 'reservas',
  users: 'usuarios',
  leads: 'consultas',
  payments: 'pagos',
  modules: 'modulos',
  audit: 'auditoria',
};

const USER_SECTION_SLUGS: Record<UserSection, string> = {
  summary: 'resumen',
  calendar: 'calendario',
  bookings: 'reservas',
  spaces: 'espacios',
  profile: 'perfil',
};

const ADMIN_SECTIONS_BY_SLUG = invert(ADMIN_SECTION_SLUGS);
const USER_SECTIONS_BY_SLUG = invert(USER_SECTION_SLUGS);

function invert<T extends string>(record: Record<T, string>) {
  return (Object.entries(record) as Array<[T, string]>).reduce<Record<string, T>>((accumulator, [key, value]) => {
    accumulator[value] = key;
    return accumulator;
  }, {});
}

function normalizePath(pathname: string) {
  const normalized = pathname.split('?')[0].replace(/\/+$/, '');
  return normalized || ROUTES.home;
}

export function currentPath() {
  return normalizePath(window.location.pathname || ROUTES.home);
}

export function isAdminPanelPath(pathname = currentPath()) {
  const path = normalizePath(pathname);
  return path === ROUTES.legacyPanel || path.startsWith('/panel/');
}

export function isUserPanelPath(pathname = currentPath()) {
  const path = normalizePath(pathname);
  return path === ROUTES.legacyUserPanel || path.startsWith('/user/panel/');
}

export function isPanelPath(pathname = currentPath()) {
  return isAdminPanelPath(pathname) || isUserPanelPath(pathname);
}

export function getAdminSectionFromPath(pathname = currentPath()): AdminSection {
  const path = normalizePath(pathname);
  if (path === ROUTES.legacyPanel) return 'summary';
  const slug = path.replace('/panel/', '').split('/')[0];
  return ADMIN_SECTIONS_BY_SLUG[slug] || 'summary';
}

export function getUserSectionFromPath(pathname = currentPath()): UserSection {
  const path = normalizePath(pathname);
  if (path === ROUTES.legacyUserPanel) return 'summary';
  const slug = path.replace('/user/panel/', '').split('/')[0];
  return USER_SECTIONS_BY_SLUG[slug] || 'summary';
}

export function adminSectionPath(section: AdminSection) {
  return `/panel/${ADMIN_SECTION_SLUGS[section]}`;
}

export function userSectionPath(section: UserSection) {
  return `/user/panel/${USER_SECTION_SLUGS[section]}`;
}

export function navigateTo(pathname: string) {
  if (currentPath() === normalizePath(pathname)) return;
  window.history.pushState({}, '', pathname);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

export function navigateHome() {
  navigateTo(ROUTES.home);
}

export function navigateAdminSection(section: AdminSection = 'summary') {
  navigateTo(adminSectionPath(section));
}

export function navigateUserSection(section: UserSection = 'summary') {
  navigateTo(userSectionPath(section));
}

export function navigatePanel(role?: string) {
  if (role === 'ADMIN' || role === 'OPERATOR') {
    navigateAdminSection('summary');
    return;
  }

  navigateUserSection('summary');
}

export function adminPricingModuleCreatePath() {
  return `${adminSectionPath('modules')}/nuevo`;
}

export function adminPricingModuleEditPath(id: string) {
  return `${adminSectionPath('modules')}/${id}/editar`;
}

export function getAdminPricingModuleRoute(pathname = currentPath()) {
  const path = normalizePath(pathname);
  const basePath = adminSectionPath('modules');

  if (path === `${basePath}/nuevo`) {
    return { mode: 'create' as const, id: null };
  }

  const match = path.match(/^\/panel\/modulos\/([^/]+)\/editar$/);
  if (match) {
    return { mode: 'edit' as const, id: match[1] };
  }

  return { mode: 'list' as const, id: null };
}

export function adminSpaceCreatePath() {
  return `${adminSectionPath('spaces')}/nuevo`;
}

export function adminSpaceEditPath(id: string) {
  return `${adminSectionPath('spaces')}/${id}/editar`;
}

export function getAdminSpaceRoute(pathname = currentPath()) {
  const path = normalizePath(pathname);
  const basePath = adminSectionPath('spaces');

  if (path === `${basePath}/nuevo`) {
    return { mode: 'create' as const, id: null };
  }

  const match = path.match(/^\/panel\/espacios\/([^/]+)\/editar$/);
  if (match) {
    return { mode: 'edit' as const, id: match[1] };
  }

  return { mode: 'list' as const, id: null };
}

export function adminAmenityCreatePath() {
  return `${adminSectionPath('amenities')}/nuevo`;
}

export function adminAmenityEditPath(id: string) {
  return `${adminSectionPath('amenities')}/${id}/editar`;
}

export function getAdminAmenityRoute(pathname = currentPath()) {
  const path = normalizePath(pathname);
  const basePath = adminSectionPath('amenities');

  if (path === `${basePath}/nuevo`) {
    return { mode: 'create' as const, id: null };
  }

  const match = path.match(/^\/panel\/servicios\/([^/]+)\/editar$/);
  if (match) {
    return { mode: 'edit' as const, id: match[1] };
  }

  return { mode: 'list' as const, id: null };
}
