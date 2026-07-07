"use strict";

export const STORAGE_KEYS = {
  machines: "nexudrive_mvp_machines",
  reservations: "nexudrive_mvp_reservations",
  reschedules: "nexudrive_mvp_reschedules",
  delays: "nexudrive_mvp_delays",
  reviews: "nexudrive_mvp_reviews",
  availabilitySlots: "nexudrive_mvp_availability_slots",
  notifications: "nexudrive_mvp_notifications",
  auth: "nexudrive_mvp_auth",
  devActiveUser: "nexudrive_mvp_dev_active_user",
  devRecentUsers: "nexudrive_mvp_dev_recent_users",
  devProfiles: "nexudrive_mvp_dev_profiles",
  devFixtures: "nexudrive_mvp_dev_fixtures",
  theme: "nexudrive_mvp_theme",
};

export function defaultCatalogFilters() {
  return { availability: "Todas", service: "Todos", reputation: "Todas", todayOnly: false };
}
