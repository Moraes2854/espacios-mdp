import { AdminDashboard } from '../types';

export const EMPTY_ADMIN_DASHBOARD: AdminDashboard = {
  metrics: {
    activeSpaces: 0,
    totalUsers: 0,
    newLeads: 0,
    activeBookings: 0,
    approvedRevenue: 0,
  },
  spaces: [],
  users: [],
  leads: [],
  bookings: [],
  payments: [],
  auditLogs: [],
  recurringRules: [],
  availabilityBlocks: [],
  availabilityRules: [],
  pricingModules: [],
};
