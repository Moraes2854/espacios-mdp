export function translateRole(role?: string | null) {
  const value = (role || '').toUpperCase();
  const labels: Record<string, string> = {
    ADMIN: 'Administrador',
    OPERATOR: 'Operador',
    PROFESSIONAL: 'Profesional',
  };
  return labels[value] || role || '-';
}

export function translatePaymentMethod(method?: string | null) {
  const value = (method || '').toUpperCase();
  const labels: Record<string, string> = {
    CASH: 'Efectivo',
    BANK_TRANSFER: 'Transferencia bancaria',
    MERCADO_PAGO: 'Mercado Pago',
    CARD: 'Tarjeta',
    OTHER: 'Otro',
  };
  return labels[value] || method || '-';
}

export function translateModuleType(type?: string | null) {
  const value = (type || '').toUpperCase();
  const labels: Record<string, string> = {
    SINGLE: 'Hora simple',
    CONTINUOUS_BLOCK: 'Bloque corrido',
    WEEKLY_PACK: 'Pack semanal',
  };
  return labels[value] || type || '-';
}

export function translateLeadSource(source?: string | null) {
  const value = (source || '').toUpperCase();
  const labels: Record<string, string> = {
    WEB: 'Web',
    WHATSAPP: 'WhatsApp',
    GOOGLE_ADS: 'Google Ads',
    INSTAGRAM: 'Instagram',
    REFERRAL: 'Recomendación',
    OTHER: 'Otro',
  };
  return labels[value] || source || '-';
}

export function translateAuditAction(action?: string | null) {
  const value = (action || '').toUpperCase();
  const labels: Record<string, string> = {
    SIGN_UP: 'Registro de usuario',
    SEED_UPDATED: 'Actualización de datos iniciales',
    SEED_DATABASE: 'Carga inicial de datos',
    CREATE_BOOKING: 'Creación de reserva',
    BOOKING_CREATED: 'Creación de reserva',
    WEEKLY_PACK_CREATED: 'Creación de pack semanal',
    PAYMENT_CREATED: 'Creación de pago',
    LEAD_CREATED: 'Nueva consulta recibida',
    LOGIN: 'Inicio de sesión',
  };
  return labels[value] || action || '-';
}

export function translateEntityType(entityType?: string | null) {
  const value = (entityType || '').toUpperCase();
  const labels: Record<string, string> = {
    USER: 'Usuario',
    SYSTEM: 'Sistema',
    BOOKING: 'Reserva',
    PAYMENT: 'Pago',
    LEAD: 'Consulta',
    SPACE: 'Espacio',
    PRICINGMODULE: 'Módulo de precio',
    PRICING_MODULE: 'Módulo de precio',
  };
  return labels[value] || entityType || '-';
}
