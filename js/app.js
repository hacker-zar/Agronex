"use strict";

const TERMS_VERSION = "1.0";
const TERMS_EFFECTIVE_DATE = "2026-06-11";
const TERMS_URL = "legal/terminos-agronex.html";

const STORAGE_KEYS = {
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

const seedMachines = [
  {
    id: "m-tractor-6120",
    title: "Tractor John Deere 6120J",
    category: "Tractor",
    price: 35,
    priceUnit: "hectarea",
    location: "Venado Tuerto, Santa Fe",
    availability: "Disponible ma\u00f1ana",
    availableTomorrow: true,
    owner: "Agroservicios Norte",
    description: "Tractor de 120 HP para labores generales, listo para coordinar por hectárea.",
    highlight: "Disponible para labores generales",
    distanceKm: 18, rating: 4.7, reviews: 23, operator: true, brand: "John Deere", year: 2020,
    offerStatus: "active",
  },
  {
    id: "m-sembradora-1113",
    title: "Sembradora John Deere 1113",
    category: "Sembradora",
    price: 85,
    priceUnit: "hectarea",
    location: "Pergamino, Buenos Aires",
    availability: "Disponible",
    availableToday: true,
    owner: "Contratistas Pergamino",
    description: "Equipo para granos gruesos con mantenimiento al día y operador opcional.",
    highlight: "Ahorras $320.000",
    distanceKm: 28, rating: 4.8, reviews: 34, operator: true, brand: "John Deere", year: 2019,
    badge: "Respuesta rápida",
    offerStatus: "active",
  },
  {
    id: "m-case-8250",
    title: "Cosechadora Case IH 8250",
    category: "Cosechadora",
    price: 120,
    priceUnit: "hectarea",
    location: "Junín, Buenos Aires",
    availability: "Disponible desde la próxima semana",
    owner: "La Campana Servicios",
    description: "Cosechadora axial para soja y maíz. Publicación orientada a reservas simples.",
    highlight: "Equipo listo para campaña",
    distanceKm: 45, rating: 4.9, reviews: 51, operator: true, brand: "Case IH", year: 2021,
    offerStatus: "active",
  },
  {
    id: "m-jacto-uniport",
    title: "Pulverizadora Jacto Uniport",
    category: "Pulverizadora",
    price: 55,
    priceUnit: "hectarea",
    location: "Rojas, Buenos Aires",
    availability: "Disponible",
    availableToday: true,
    owner: "Rojas Agro",
    description: "Pulverizadora autopropulsada para aplicaciones terrestres por hectárea.",
    highlight: "Ahorras $95.000",
    distanceKm: 12, rating: 4.7, reviews: 28, operator: false, brand: "Jacto", year: 2020,
    offerStatus: "active",
  },
  {
    id: "m-camion-scania",
    title: "Camión Scania R450 con acoplado",
    category: "Camion",
    price: 3500,
    priceUnit: "kilometro",
    location: "Rosario, Santa Fe",
    availability: "Disponible para la cosecha",
    owner: "Transportes Del Campo",
    description: "Camión de larga distancia ideal para traslado de granos entre acopios. Capacidad 30 tn.",
    distanceKm: 8, rating: 4.6, reviews: 17, operator: true, brand: "Scania", year: 2022,
    badge: "Nuevo",
    offerStatus: "paused",
  },
  {
    id: "m-embolsadora-richiger",
    title: "Embolsadora Richiger E-900",
    category: "Embolsadora",
    price: 7500,
    priceUnit: "tonelada",
    location: "Córdoba Capital",
    availability: "Disponible esta cosecha",
    owner: "Agrobolsas Sur",
    description: "Embolsadora de alto rendimiento para almacenaje a campo. Capacidad 900 tn/h.",
    distanceKm: 32, rating: 4.5, reviews: 12, operator: true, brand: "Richiger", year: 2021,
    offerStatus: "active",
  },
];

const categoryIcons = {
  Tractor:      "fa-tractor",
  Sembradora:   "fa-seedling",
  Cosechadora:  "fa-wheat-awn",
  Pulverizadora:"fa-spray-can-sparkles",
  Fertilizadora:"fa-leaf",
  Dron:         "fa-helicopter",
  Camion:       "fa-truck",
  Embolsadora:  "fa-bag-shopping",
  Extractora:   "fa-industry",
  Otros:        "fa-screwdriver-wrench",
  Acoplado:     "fa-trailer",
  Tolva:        "fa-truck-ramp-box",
};

const categoryOrder = ["Todas", "Tractor", "Sembradora", "Pulverizadora", "Fertilizadora", "Cosechadora", "Camion", "Embolsadora", "Extractora", "Dron", "Acoplado", "Tolva", "Otros"];

const defaultJobByCategory = {
  Tractor: "Labores generales",
  Sembradora: "Siembra",
  Pulverizadora: "Pulverizacion / Fumigacion",
  Fertilizadora: "Labores generales",
  Cosechadora: "Cosecha",
  Camion: "Distribucion",
  Embolsadora: "Embolsado",
  Extractora: "Embolsado",
  Dron: "Pulverizacion / Fumigacion",
  Acoplado: "Distribucion",
  Tolva: "Apoyo a cosecha",
  Otros: "Otros",
};

const priceUnitMeta = {
  hectarea: { label: "Por hectarea", short: "/ ha", preview: "por hectarea", priceLabel: "Precio por hectarea", placeholder: "25000" },
  tonelada: { label: "Por tonelada", short: "/ tn", preview: "por tonelada", priceLabel: "Precio por tonelada", placeholder: "6500" },
  bolsa: { label: "Por bolsa", short: "/ bolsa", preview: "por bolsa", priceLabel: "Precio por bolsa", placeholder: "18000" },
  viaje: { label: "Por viaje", short: "/ viaje", preview: "por viaje", priceLabel: "Precio por viaje", placeholder: "120000" },
  kilometro: { label: "Por kilometro", short: "/ km", preview: "por kilometro", priceLabel: "Precio por kilometro", placeholder: "9000" },
  tonelada_kilometro: { label: "Por tonelada/kilometro", short: "/ tn/km", preview: "por tonelada/km", priceLabel: "Precio por tonelada/kilometro", placeholder: "180" },
  hora: { label: "Por hora", short: "/ hora", preview: "por hora", priceLabel: "Precio por hora", placeholder: "35000" },
  dia: { label: "Por dia", short: "/ dia", preview: "por dia", priceLabel: "Precio por dia", placeholder: "250000" },
  fijo: { label: "Precio fijo", short: "precio fijo", preview: "precio fijo", priceLabel: "Precio fijo", placeholder: "180000" },
};

const priceUnitsByCategory = {
  Cosechadora: ["hectarea"],
  Sembradora: ["hectarea"],
  Pulverizadora: ["hectarea"],
  Fertilizadora: ["hectarea"],
  Embolsadora: ["tonelada", "bolsa"],
  Extractora: ["tonelada", "bolsa"],
  Camion: ["viaje", "tonelada", "kilometro", "tonelada_kilometro"],
  Dron: ["hectarea"],
  Acoplado: ["viaje", "tonelada", "kilometro"],
  Tolva: ["viaje", "tonelada", "hora"],
  Tractor: ["hora", "dia", "hectarea"],
  Otros: ["hectarea", "tonelada", "viaje", "hora", "dia", "bolsa", "fijo"],
  default: ["hectarea", "tonelada", "viaje", "hora", "dia", "bolsa", "fijo"],
};
const reviewCategoriesByRole = {
  producer: [
    ["punctuality", "Puntualidad"],
    ["communication", "Comunicacion"],
    ["vehicleCondition", "Estado del vehiculo"],
    ["workCompliance", "Cumplimiento del trabajo"],
  ],
  contractor: [
    ["requestClarity", "Claridad del pedido"],
    ["loadPunctuality", "Puntualidad para carga y descarga"],
    ["coordination", "Coordinacion"],
    ["paymentCompliance", "Cumplimiento del pago"],
  ],
};

const reviewTagsByRole = {
  producer: ["Puntual", "Buena comunicacion", "Trabajo de calidad", "Vehiculo en buenas condiciones", "Muy profesional", "Demoras", "Problemas de coordinacion"],
  contractor: ["Pedido claro", "Buena coordinacion", "Puntual", "Pago en termino", "Facil de trabajar", "Demoras", "Informacion incompleta"],
};

const reviewCategoryWeightsByReviewedRole = {
  contractor: { workCompliance: 0.4, punctuality: 0.25, communication: 0.25, vehicleCondition: 0.1 },
  producer: { paymentCompliance: 0.4, coordination: 0.25, loadPunctuality: 0.25, requestClarity: 0.1 },
};

const defaultPriceUnitByCategory = {
  Tractor: "hectarea",
  Sembradora: "hectarea",
  Pulverizadora: "hectarea",
  Fertilizadora: "hectarea",
  Cosechadora: "hectarea",
  Dron: "hectarea",
  Acoplado: "viaje",
  Tolva: "viaje",
  Camion: "kilometro",
  Embolsadora: "tonelada",
  Extractora: "tonelada",
  Otros: "hectarea",
};

const seedPricingCorrections = {
  "m-camion-scania": { oldPrice: 28, price: 3500, priceUnit: "kilometro" },
  "m-embolsadora-richiger": { oldPrice: 18, price: 7500, priceUnit: "tonelada" },
};

const operationFlow = [
  { key: "accepted", label: "Solicitud aceptada", action: "Salir hacia el origen", icon: "fa-circle-check", notify: "La solicitud fue aceptada." },
  { key: "on_way_origin", label: "En camino al origen", action: "Llegue al origen", icon: "fa-route", notify: "El contratista salio hacia el origen." },
  { key: "arrived_origin", label: "Llego al origen", action: "Comenzar carga", icon: "fa-location-dot", notify: "El contratista llego al origen." },
  { key: "loading", label: "Cargando", action: "Carga finalizada", icon: "fa-boxes-stacked", notify: "Comenzo la carga." },
  { key: "loaded", label: "Carga finalizada", action: "Iniciar viaje", icon: "fa-clipboard-check", notify: "Finalizo la carga." },
  { key: "in_transit_destination", label: "En viaje al destino", action: "Llegue al destino", icon: "fa-truck-fast", notify: "El contratista esta en viaje al destino." },
  { key: "arrived_destination", label: "Llego al destino", action: "Comenzar descarga", icon: "fa-map-pin", notify: "El contratista llego al destino." },
  { key: "unloading", label: "Descargando", action: "Descarga finalizada", icon: "fa-dolly", notify: "Comenzo la descarga." },
  { key: "unloaded", label: "Descarga finalizada", action: "Finalizar trabajo", icon: "fa-flag-checkered", notify: "Finalizo la descarga." },
  { key: "done", label: "Trabajo finalizado", action: "", icon: "fa-circle-check", notify: "El trabajo fue finalizado." },
];

const operationIncidents = ["Voy con demora", "Ruta cortada", "Problema mecanico", "Clima adverso", "Otro inconveniente"];

const statusLabels = {
  pending:  "Pendiente",
  schedule_counter: "Esperando respuesta del productor",
  original_kept: "Productor mantiene horario original",
  accepted: "Aceptada",
  working:  "En curso",
  done:     "Finalizada",
  rejected: "Rechazada",
  cancelled: "Cancelada",
};

const offerStatusLabels = {
  active:   "Activa",
  paused:   "Pausada",
  inactive: "Dada de baja",
};

const availabilitySlotStatusLabels = {
  available: "Libre",
  partially_booked: "Parcialmente ocupada",
  unavailable: "No disponible",
};


const defaultProfile = {
  name: "",
  zone: "Pergamino, Buenos Aires",
  hectares: "120",
  baseLocation: "Pergamino, Buenos Aires",
  operationRadiusKm: 80,
  bio: "",
};

const devTestUsers = [
  {
    id: "dev-juan1",
    name: "Juan1",
    email: "juan1@agronex.dev",
    businessName: "Juan1 Servicios",
    profile: {
      name: "Juan1",
      zone: "Rosario, Santa Fe",
      hectares: "180",
      baseLocation: "Rosario, Santa Fe",
      baseLatitude: -32.9468,
      baseLongitude: -60.6393,
      operationRadiusKm: 90,
      bio: "Productor y contratista de prueba para validar el flujo completo del MVP.",
    },
  },
  {
    id: "dev-jose2",
    name: "Jose2",
    email: "jose2@agronex.dev",
    businessName: "Jose2 Cosecha",
    profile: {
      name: "Jose2",
      zone: "Pergamino, Buenos Aires",
      hectares: "320",
      baseLocation: "Pergamino, Buenos Aires",
      baseLatitude: -33.8895,
      baseLongitude: -60.5736,
      operationRadiusKm: 120,
      bio: "Contratista de prueba con foco en cosecha y servicios de campania.",
    },
  },
  {
    id: "dev-maria3",
    name: "Maria3",
    email: "maria3@agronex.dev",
    businessName: "Maria3 Transporte",
    profile: {
      name: "Maria3",
      zone: "Venado Tuerto, Santa Fe",
      hectares: "95",
      baseLocation: "Venado Tuerto, Santa Fe",
      baseLatitude: -33.7456,
      baseLongitude: -61.9688,
      operationRadiusKm: 160,
      bio: "Usuaria de prueba para transporte, embolsado y coordinacion logistica.",
    },
  },
];

const devUserSwitcherEnabled = Boolean(import.meta.env?.DEV);

const state = {
  screen:       "catalogo",
  offersTab:    "activas",
  category:     "Todas",
  search:       "",
  filters:      { availability: "Todas", service: "Todos", reputation: "Todas", todayOnly: false },
  filterDraft:  null,
  machines:     readJSON(STORAGE_KEYS.machines, seedMachines).map(normalizeMachinePricing),
  reservations: readJSON(STORAGE_KEYS.reservations, []),
  rescheduleRequests: readJSON(STORAGE_KEYS.reschedules, []),
  delayRecords: readJSON(STORAGE_KEYS.delays, []),
  reviews: readJSON(STORAGE_KEYS.reviews, []),
  availabilitySlots: readJSON(STORAGE_KEYS.availabilitySlots, []),
  notifications: readJSON(STORAGE_KEYS.notifications, []),
  auth:         initialAuth(),
  theme:        normalizeTheme(localStorage.getItem(STORAGE_KEYS.theme)),
  profile:      initialProfile(),
  publishStep: 1,
};

// Pending confirm action
let pendingAction = null;
let notificationToastTimer = null;
let notificationGroupTimer = null;
let notificationToastQueue = [];
let lastUserActivityAt = Date.now();
let lastOperationUndo = null;
const locationPickerState = { map: null, marker: null, form: null, selected: null, operationCircle: null, operationCenterMarker: null, operationCenter: null };

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

document.addEventListener("DOMContentLoaded", init);

function init() {
  applyTheme(state.theme);
  ensureDevUserFixtures();
  bindDevUserSwitcher();
  bindNavigation();
  bindForms();
  bindPublishWizard();
  bindProfile();
  bindAuth();
  bindTermsModal();
  bindPublicProfileModal();
  bindNotificationCenter();
  bindContactModal();
  bindPresenceTracking();
  registerNotificationServiceWorker();
  bindConfirmModal();
  bindReportModal();
  bindRescheduleModal();
  bindScheduleCounterModal();
  bindDelayModal();
  bindReviewModal();
  bindLocationPicker();
  bindOffersTabs();
  bindOperationSheet();
  syncMachineRatingsFromReviews();
  render();
  persistMachinePricingMigration();
  openLocationDemoFromQuery();
}

/* ─── NAVIGATION ─── */

function initialAuth() {
  if (!devUserSwitcherEnabled) return readObject(STORAGE_KEYS.auth, null);
  return devAuthFor(activeDevUserId());
}

function initialProfile() {
  if (!devUserSwitcherEnabled) return readObject("nexudrive_mvp_profile", defaultProfile);
  return devProfileFor(activeDevUserId());
}

function activeDevUserId() {
  const stored = clean(localStorage.getItem(STORAGE_KEYS.devActiveUser));
  return devTestUsers.some((user) => user.id === stored) ? stored : devTestUsers[0].id;
}

function devUserById(id) {
  return devTestUsers.find((user) => user.id === id) || devTestUsers[0];
}

function devAuthFor(id) {
  const user = devUserById(id);
  return {
    email: user.email,
    name: user.name,
    devUserId: user.id,
    isDevUser: true,
    signedInAt: new Date().toISOString(),
  };
}

function devProfileFor(id) {
  const user = devUserById(id);
  const profiles = readObject(STORAGE_KEYS.devProfiles, {});
  return { ...defaultProfile, ...user.profile, ...(profiles[user.id] || {}) };
}

function currentDevUser() {
  return devUserById(state.auth?.devUserId || activeDevUserId());
}


function bindDevUserSwitcher() {
  const root = $("#dev-user-switcher");
  const button = $("#dev-user-button");
  const menu = $("#dev-user-menu");
  if (!root || !button || !menu) return;
  if (!devUserSwitcherEnabled) {
    root.hidden = true;
    return;
  }
  root.hidden = false;
  button.addEventListener("click", () => toggleDevUserMenu());
  menu.addEventListener("click", (event) => {
    const option = event.target.closest(".dev-user-option");
    if (!option) return;
    switchDevUser(option.dataset.userId);
  });
  document.addEventListener("click", (event) => {
    if (!root.contains(event.target)) closeDevUserMenu();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeDevUserMenu();
  });
  renderDevUserSwitcher();
}

function toggleDevUserMenu() {
  const menu = $("#dev-user-menu");
  const button = $("#dev-user-button");
  if (!menu || !button) return;
  const willOpen = menu.hidden;
  menu.hidden = !willOpen;
  button.setAttribute("aria-expanded", willOpen ? "true" : "false");
  if (willOpen) renderDevUserSwitcher();
}

function closeDevUserMenu() {
  const menu = $("#dev-user-menu");
  const button = $("#dev-user-button");
  if (menu) menu.hidden = true;
  if (button) button.setAttribute("aria-expanded", "false");
}

function renderDevUserSwitcher() {
  const root = $("#dev-user-switcher");
  if (!root || !devUserSwitcherEnabled) return;
  const activeId = currentUserId();
  const activeUser = devUserById(state.auth?.devUserId || activeDevUserId());
  const label = $("#dev-user-label");
  if (label) label.textContent = "Usuario activo: " + activeUser.name;
  const menu = $("#dev-user-menu");
  if (!menu) return;
  const recent = readJSON(STORAGE_KEYS.devRecentUsers, []);
  const ordered = [
    activeUser,
    ...recent.map(devUserById),
    ...devTestUsers,
  ].filter((user, index, list) => user && list.findIndex((item) => item.id === user.id) === index);
  menu.innerHTML = ordered.map((user) => {
    const active = user.email === activeId;
    return '<button class="dev-user-option ' + (active ? 'active' : '') + '" type="button" data-user-id="' + escapeHTML(user.id) + '">' +
      '<span>' + (active ? 'Activo - ' : '') + escapeHTML(user.name) + '</span>' +
      '<small>' + escapeHTML(user.businessName) + '</small>' +
    '</button>';
  }).join("");
}

function switchDevUser(id) {
  const user = devUserById(id);
  if (!user || currentUserId() === user.email) {
    closeDevUserMenu();
    return;
  }
  saveProfile();
  localStorage.setItem(STORAGE_KEYS.devActiveUser, user.id);
  rememberDevUser(user.id);
  state.auth = devAuthFor(user.id);
  state.profile = devProfileFor(user.id);
  saveAuth();
  syncProfileFormFromState();
  updateOperationRadiusValue();
  if (state.screen === "acceso") state.screen = "catalogo";
  closeDevUserMenu();
  render();
  showScreen(state.screen);
  showToast("Usuario activo: " + user.name);
}

function rememberDevUser(id) {
  const recent = readJSON(STORAGE_KEYS.devRecentUsers, []);
  const next = [id, ...recent.filter((item) => item !== id && devTestUsers.some((user) => user.id === item))].slice(0, devTestUsers.length);
  localStorage.setItem(STORAGE_KEYS.devRecentUsers, JSON.stringify(next));
}

function ensureDevUserFixtures() {
  if (!devUserSwitcherEnabled) return;
  localStorage.setItem(STORAGE_KEYS.devActiveUser, activeDevUserId());
  const profiles = readObject(STORAGE_KEYS.devProfiles, {});
  let profilesChanged = false;
  devTestUsers.forEach((user) => {
    if (!profiles[user.id]) {
      profiles[user.id] = user.profile;
      profilesChanged = true;
    }
  });
  if (profilesChanged) localStorage.setItem(STORAGE_KEYS.devProfiles, JSON.stringify(profiles));

  const fixtures = devFixtures();
  let machinesChanged = false;
  fixtures.machines.forEach((machine) => {
    if (!state.machines.some((item) => item.id === machine.id)) {
      state.machines.unshift(machine);
      machinesChanged = true;
    }
  });
  let slotsChanged = false;
  fixtures.availabilitySlots.forEach((slot) => {
    if (!state.availabilitySlots.some((item) => item.id === slot.id)) {
      state.availabilitySlots.unshift(slot);
      slotsChanged = true;
    }
  });
  let reservationsChanged = false;
  fixtures.reservations.forEach((reservation) => {
    if (!state.reservations.some((item) => item.id === reservation.id)) {
      state.reservations.unshift(reservation);
      reservationsChanged = true;
    }
  });
  let reviewsChanged = false;
  fixtures.reviews.forEach((review) => {
    if (!state.reviews.some((item) => item.id === review.id)) {
      state.reviews.unshift(review);
      reviewsChanged = true;
    }
  });
  let notificationsChanged = false;
  fixtures.notifications.forEach((notification) => {
    if (!state.notifications.some((item) => item.id === notification.id)) {
      state.notifications.unshift(notification);
      notificationsChanged = true;
    }
  });
  if (machinesChanged) localStorage.setItem(STORAGE_KEYS.machines, JSON.stringify(state.machines));
  if (slotsChanged) localStorage.setItem(STORAGE_KEYS.availabilitySlots, JSON.stringify(state.availabilitySlots));
  if (reservationsChanged) localStorage.setItem(STORAGE_KEYS.reservations, JSON.stringify(state.reservations));
  if (reviewsChanged) localStorage.setItem(STORAGE_KEYS.reviews, JSON.stringify(state.reviews));
  if (notificationsChanged) localStorage.setItem(STORAGE_KEYS.notifications, JSON.stringify(state.notifications));
}

function devFixtures() {
  return {
    machines: [
      devFixtureMachine("m-dev-juan1-tractor", "Tractor John Deere 6120J", "Tractor", "dev-juan1", 35, "hectarea", "Rosario, Santa Fe", "Disponible esta semana"),
      devFixtureMachine("m-dev-jose2-cosechadora", "Cosechadora Case IH 8250", "Cosechadora", "dev-jose2", 120, "hectarea", "Pergamino, Buenos Aires", "Disponible hoy"),
      devFixtureMachine("m-dev-maria3-camion", "Camion Scania R450", "Camion", "dev-maria3", 3500, "kilometro", "Venado Tuerto, Santa Fe", "Disponible manana"),
    ],
    availabilitySlots: [
      devFixtureSlot("slot-dev-juan1-tractor", "m-dev-juan1-tractor", "2026-07-08", "2026-07-12", 32),
      devFixtureSlot("slot-dev-jose2-cosechadora", "m-dev-jose2-cosechadora", "2026-07-06", "2026-07-10", 40),
      devFixtureSlot("slot-dev-maria3-camion", "m-dev-maria3-camion", "2026-07-07", "2026-07-14", 55),
    ],
    reservations: [
      devFixtureReservation("r-dev-juan1-jose2", "dev-juan1", "dev-jose2", "m-dev-jose2-cosechadora", "Cosechadora Case IH 8250", "Cosechadora", "pending", "2026-07-09", 120),
      devFixtureReservation("r-dev-jose2-maria3", "dev-jose2", "dev-maria3", "m-dev-maria3-camion", "Camion Scania R450", "Camion", "accepted", "2026-07-08", 0, { estimatedKm: 84, cargoType: "Maiz", origin: "Lote La Esperanza", destination: "Cooperativa Bouquet" }),
      devFixtureReservation("r-dev-maria3-juan1", "dev-maria3", "dev-juan1", "m-dev-juan1-tractor", "Tractor John Deere 6120J", "Tractor", "done", "2026-07-01", 42),
    ],
    reviews: [
      {
        id: "review-dev-maria3-juan1",
        reservationId: "r-dev-maria3-juan1",
        reviewerId: "producer:maria3",
        reviewerName: "Maria3",
        reviewerRole: "producer",
        reviewedUserId: "contractor:juan1-servicios",
        reviewedName: "Juan1 Servicios",
        reviewedUserType: "Contratista",
        reviewedRole: "contractor",
        overallRating: 5,
        categories: { punctuality: 5, communication: 5, vehicleCondition: 4, workCompliance: 5 },
        tags: ["Puntual", "Buena comunicacion"],
        wouldWorkAgain: true,
        comment: "Trabajo coordinado sin problemas.",
        createdAt: "2026-07-02T12:00:00.000Z",
      },
    ],
    notifications: [
      devFixtureNotification("notif-dev-juan1", "dev-juan1", "job_accepted", "Trabajo finalizado", "Ya podes evaluar a Juan1 Servicios.", "MEDIUM", "r-dev-maria3-juan1"),
      devFixtureNotification("notif-dev-jose2", "dev-jose2", "job_request", "Nueva solicitud", "Juan1 solicito la Cosechadora Case IH 8250.", "HIGH", "r-dev-juan1-jose2"),
      devFixtureNotification("notif-dev-maria3", "dev-maria3", "job_accepted", "Solicitud aceptada", "Tenes un viaje confirmado para Jose2.", "MEDIUM", "r-dev-jose2-maria3"),
    ],
  };
}

function devFixtureMachine(id, title, category, userId, price, priceUnit, location, availability) {
  const user = devUserById(userId);
  return {
    id,
    title,
    category,
    price,
    precio: price,
    priceUnit,
    unidad_precio: priceUnit,
    location,
    availability,
    owner: user.businessName,
    ownerId: user.email,
    devOwnerUserId: user.id,
    description: title + " publicado para pruebas de desarrollo.",
    distanceKm: null,
    rating: 4.8,
    reviews: 1,
    operator: true,
    offerStatus: "active",
  };
}

function devFixtureSlot(id, machineId, startDate, endDate, estimatedHours) {
  return { id, machineId, startDate, endDate, estimatedHours, status: "available" };
}

function devFixtureReservation(id, requesterId, contractorId, machineId, machineTitle, category, status, date, hectares, extra = {}) {
  const requester = devUserById(requesterId);
  const contractor = devUserById(contractorId);
  const priceUnit = category === "Camion" ? "kilometro" : "hectarea";
  return compactRecord({
    id,
    machineId,
    machineTitle,
    owner: contractor.businessName,
    ownerId: contractor.email,
    category,
    status,
    date,
    startTime: "08:00",
    endTime: status === "done" ? "17:30" : "",
    serviceType: defaultJobByCategory[category] || "Labores generales",
    jobType: defaultJobByCategory[category] || "Labores generales",
    job: defaultJobByCategory[category] || "Labores generales",
    requestedBy: requester.email,
    requestedByName: requester.name,
    requestMode: category === "Camion" ? "truck" : "default",
    unitPrice: category === "Camion" ? 3500 : 35,
    priceUnit,
    unidad_precio: priceUnit,
    hectares,
    estimatedKm: extra.estimatedKm,
    cargoType: extra.cargoType,
    origin: extra.origin,
    destination: extra.destination,
    field: "Partido de Pergamino, Buenos Aires, Argentina",
    location: { address: "Partido de Pergamino, Buenos Aires, Argentina", latitude: -33.8895, longitude: -60.5736 },
    createdAt: "2026-07-01T10:15:00.000Z",
    acceptedAt: ["accepted", "working", "done"].includes(status) ? "2026-07-01T14:40:00.000Z" : "",
    completedAt: status === "done" ? "2026-07-02T18:00:00.000Z" : "",
    resolvedAt: status === "done" ? "2026-07-02T18:00:00.000Z" : "",
    wasAccepted: ["accepted", "working", "done"].includes(status),
  });
}

function devFixtureNotification(id, userId, type, title, body, priority, relatedId) {
  const user = devUserById(userId);
  return { id, user_id: user.email, type, title, body, priority, read: false, created_at: "2026-07-02T09:00:00.000Z", related_id: relatedId };
}

function activeUserOwnsMachine(machine) {
  const userId = currentUserId();
  if (!userId || userId === "local-user") return true;
  if (!devUserSwitcherEnabled && !clean(machine.ownerId)) return true;
  return clean(machine.ownerId) === userId || clean(machine.devOwnerUserId) === clean(state.auth?.devUserId) || clean(machine.owner) === currentUserLabel();
}

function activeUserRequestedReservation(reservation) {
  return clean(reservation.requestedBy) === currentUserId() || clean(reservation.requestedByName) === currentUserLabel();
}

function activeUserOwnsReservationMachine(reservation) {
  const machine = findMachine(reservation.machineId);
  if (!devUserSwitcherEnabled && !clean(reservation.ownerId) && machine && !clean(machine.ownerId)) return true;
  return clean(reservation.ownerId) === currentUserId() || (machine && activeUserOwnsMachine(machine)) || clean(reservation.owner) === currentUserLabel();
}

function visibleReservationForActiveUser(reservation) {
  return activeUserRequestedReservation(reservation) || activeUserOwnsReservationMachine(reservation);
}

function bindNavigation() {
  $$("[data-nav]").forEach((btn) => {
    btn.addEventListener("click", () => showScreen(btn.dataset.nav));
  });

  $("#catalog-search").addEventListener("input", (e) => {
    state.search = e.target.value.trim().toLowerCase();
    renderCatalog();
  });

  $("#filter-toggle").addEventListener("click", openCatalogFilters);
  $("#filters-close").addEventListener("click", closeCatalogFilters);
  $("#catalog-filters-modal").addEventListener("click", (e) => {
    if (e.target.id === "catalog-filters-modal") closeCatalogFilters();
  });

  $("#availability-filter").addEventListener("change", (e) => {
    ensureFilterDraft();
    state.filterDraft.filters.availability = e.target.value;
  });
  $("#service-filter").addEventListener("change", (e) => {
    ensureFilterDraft();
    state.filterDraft.filters.service = e.target.value;
  });
  $("#reputation-filter").addEventListener("change", (e) => {
    ensureFilterDraft();
    state.filterDraft.filters.reputation = e.target.value;
  });
  $("#today-filter").addEventListener("change", (e) => {
    ensureFilterDraft();
    state.filterDraft.filters.todayOnly = e.target.checked;
  });
  $("#catalog-filters-clear").addEventListener("click", resetCatalogFilterDraft);
  $("#catalog-filters-apply").addEventListener("click", applyCatalogFilters);
  $("#catalog-empty-clear").addEventListener("click", () => {
    clearCatalogFilters();
  });
  $("#user-chip").addEventListener("click", () => {
    showScreen(state.auth ? "perfil" : "acceso");
  });
}

function openCatalogFilters() {
  state.filterDraft = currentCatalogFilterState();
  syncCatalogFilterControls(state.filterDraft.filters);
  renderCategoryFilters();
  $("#catalog-filters-modal").hidden = false;
}

function closeCatalogFilters() {
  $("#catalog-filters-modal").hidden = true;
  state.filterDraft = null;
  renderCategoryFilters();
}

function ensureFilterDraft() {
  if (!state.filterDraft) state.filterDraft = currentCatalogFilterState();
}

function currentCatalogFilterState() {
  return {
    category: state.category,
    filters: { ...state.filters },
  };
}
window.openCatalogFilters = openCatalogFilters;
window.closeCatalogFilters = closeCatalogFilters;

function openLocationDemoFromQuery() {
  const params = new URLSearchParams(window.location.search);
  if (!params.has("demoLocation")) return;
  window.setTimeout(() => {
    const machine = state.machines.find((item) => item.offerStatus !== "inactive") || state.machines[0];
    const form = $("#request-form");
    if (!machine || !form) return;
    showScreen("catalogo");
    openRequestModal(machine.id);
    openLocationPicker(form);
  }, 300);
}
function showScreen(screen) {
  if (screen === "perfil" && !state.auth) screen = "acceso";
  state.screen = screen;
  $$(".screen").forEach((el) => el.classList.toggle("active", el.id === `screen-${screen}`));
  $$(".nav-btn").forEach((btn) => btn.classList.toggle("active", btn.dataset.nav === screen));

  if (screen === "reservas")    renderReservations();
  if (screen === "catalogo")    renderCatalog();
  if (screen === "mis-ofertas") renderMisOfertas();
  if (screen === "acceso")      renderAuth();
}

/* ─── FORMS ─── */
function bindForms() {
  $("#publish-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const formEl = e.currentTarget;
    const form = new FormData(formEl);
    const submitBtn = $("#publish-submit");
    setButtonLoading(submitBtn, true, "Publicando...");

    setTimeout(() => {
      const machineId = `m-${Date.now()}`;
      const availabilityWindow = availabilityWindowFromPublishForm(formEl);
      const availabilitySlot = {
        id: `slot-${Date.now()}`,
        machineId,
        startDate: availabilityWindow.startDate,
        endDate: availabilityWindow.endDate,
        estimatedHours: availabilityWindow.estimatedHours,
        status: "available",
      };
      const machine = {
        id: machineId,
        title:        clean(form.get("title")),
        category:     clean(form.get("category")),
        price:        Number(form.get("price")),
        precio:       Number(form.get("price")),
        priceUnit:    normalizePriceUnit(form.get("priceUnit"), clean(form.get("category"))),
        unidad_precio: normalizePriceUnit(form.get("priceUnit"), clean(form.get("category"))),
        minHectares:  optionalNumber(form.get("minHectares")),
        dailyCapacity: optionalNumber(form.get("dailyCapacity")),
        location:     clean(form.get("location")),
        availability: availabilityLabelForSlot(availabilitySlot),
        plate:        normalizePlate(form.get("plate")),
        owner:        clean(form.get("owner")) || currentUserLabel(),
        ownerId:      currentUserId(),
        description:  clean(form.get("description")) || "Maquinaria publicada para solicitar reserva.",
        distanceKm:   null, rating: null, reviews: 0,
        offerStatus:  "active",
      };
      state.machines.unshift(machine);
      state.availabilitySlots.unshift(availabilitySlot);
      saveMachines();
      saveAvailabilitySlots();
      formEl.reset();
      resetPublishWizard();
      setButtonLoading(submitBtn, false);
      showToast("¡Maquinaria publicada! Ya aparece en el catálogo.");
      showScreen("mis-ofertas");
    }, 500);
  });

  const requestForm = $("#request-form");
  requestForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const formEl = e.currentTarget;
    const validation = validateRequestForm(formEl);
    if (!validation.valid) {
      showRequestError(validation.message);
      return;
    }

    hideRequestError();
    const form = new FormData(formEl);
    const machine = findMachine(form.get("machineId"));
    if (!machine) return;
    const submitBtn = $("#request-submit");
    setButtonLoading(submitBtn, true, "Enviando...");

    setTimeout(() => {
      const reservation = reservationFromForm(formEl, machine);
      state.reservations.unshift(reservation);
      saveReservations();
      emitAppEvent("job.created", { reservation, machine });
      setButtonLoading(submitBtn, false);
      closeRequestModal();
      updateBadges();
      state.offersTab = "solicitudes";
      showToast("Solicitud enviada. La abrimos en Solicitudes para que puedas probar el flujo.");
      showScreen("mis-ofertas");
    }, 500);
  });

  formControl(requestForm, "job").addEventListener("change", () => toggleJobOther(requestForm));
  formControl(requestForm, "date").addEventListener("change", () => syncRequestDateRange(requestForm));
  formControl(requestForm, "hectares").addEventListener("input", () => updateRequestEstimate(requestForm));
  ["estimatedTons", "estimatedBags", "estimatedTrips", "estimatedKm", "estimatedServiceHours", "estimatedDays", "origin", "destination"].forEach((name) => {
    formControl(requestForm, name)?.addEventListener("input", () => updateRequestEstimate(requestForm));
  });
  $("#request-location-picker").addEventListener("click", () => openLocationPicker(requestForm));
  requestForm.addEventListener("input", () => {
    hideRequestError();
    updateRequestEstimate(requestForm);
  });
  requestForm.addEventListener("change", () => updateRequestEstimate(requestForm));

  $("#request-close").addEventListener("click", closeRequestModal);
  $("#request-cancel").addEventListener("click", closeRequestModal);
  $("#request-modal").addEventListener("click", (e) => {
    if (e.target.id === "request-modal") closeRequestModal();
  });
}

/* ─── PUBLISH WIZARD ─── */
function bindPublishWizard() {
  $$("#publish-category-grid .pub-cat-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      $("#publish-category").value = btn.dataset.category;
      $$("#publish-category-grid .pub-cat-btn").forEach((b) => b.classList.toggle("selected", b === btn));
      syncPublishPlateField(btn.dataset.category);
      syncPublishPricingFields(btn.dataset.category);
      updatePublishPreview();
    });
  });

  $("#publish-next").addEventListener("click", () => {
    if (!validatePublishStep()) return;
    state.publishStep = Math.min(state.publishStep + 1, 3);
    renderPublishStep();
  });

  $("#publish-back").addEventListener("click", () => {
    state.publishStep = Math.max(state.publishStep - 1, 1);
    renderPublishStep();
  });

  $("#publish-form").addEventListener("input", updatePublishPreview);
  $("#publish-form").addEventListener("change", updatePublishPreview);
  renderPublishStep();
  updatePublishPreview();
}

function renderPublishStep() {
  $$(".pub-step").forEach((step) => {
    step.classList.toggle("active", Number(step.dataset.step) === state.publishStep);
  });
  $$(".pub-step-dot").forEach((dot, i) => {
    dot.classList.toggle("active", i + 1 <= state.publishStep);
  });
  $("#publish-back").hidden   = state.publishStep === 1;
  $("#publish-next").hidden   = state.publishStep === 3;
  $("#publish-submit").hidden = state.publishStep !== 3;
  syncPublishPricingFields($("#publish-category")?.value);
}

function syncPublishPricingFields(categoryOverride) {
  const form = $("#publish-form");
  if (!form) return;
  const category = clean(categoryOverride || formControl(form, "category")?.value);
  const unitSelect = formControl(form, "priceUnit");
  if (!unitSelect) return;
  const units = priceUnitsForCategory(category);
  const previous = clean(unitSelect.value);
  if (unitSelect.dataset.category !== category) {
    unitSelect.innerHTML = units.map((unit) => `<option value="${unit}">${escapeHTML(priceUnitMeta[unit]?.label || unit)}</option>`).join("");
    unitSelect.dataset.category = category;
  }
  unitSelect.value = units.includes(previous) ? previous : units[0];
  const activeUnit = normalizePriceUnit(unitSelect.value, category);
  const meta = priceUnitMeta[activeUnit] || priceUnitMeta.hectarea;
  $("#publish-price-label").textContent = meta.priceLabel;
  formControl(form, "price").placeholder = meta.placeholder;
  const isHarvest = category === "Cosechadora";
  $("#publish-min-hectares-field").hidden = !isHarvest;
  $("#publish-daily-capacity-field").hidden = !isHarvest;
  if (!isHarvest) {
    formControl(form, "minHectares").value = "";
    formControl(form, "dailyCapacity").value = "";
  }
}

function priceUnitsForCategory(category) {
  return priceUnitsByCategory[category] || priceUnitsByCategory.default;
}

function defaultPriceUnitForCategory(category = "") {
  const cleanCategory = clean(category);
  const units = priceUnitsForCategory(cleanCategory);
  const preferred = defaultPriceUnitByCategory[cleanCategory];
  return units.includes(preferred) ? preferred : units[0] || "hectarea";
}

function normalizePriceUnit(unit, category = "") {
  const cleanUnit = clean(unit);
  const cleanCategory = clean(category);
  const units = priceUnitsForCategory(cleanCategory);
  if (units.includes(cleanUnit)) return cleanUnit;
  if (!cleanCategory && priceUnitMeta[cleanUnit]) return cleanUnit;
  return defaultPriceUnitForCategory(cleanCategory);
}

function correctedSeedPricing(machine, price, unit) {
  const correction = seedPricingCorrections[machine?.id];
  if (!correction) return { price, unit };
  const rawUnit = clean(machine?.priceUnit || machine?.unidad_precio || machine?.unitPrice);
  const looksLikeOldSeed = Number(price) === correction.oldPrice && (!rawUnit || rawUnit === "hectarea");
  return looksLikeOldSeed ? { price: correction.price, unit: correction.priceUnit } : { price, unit };
}

function normalizeMachinePricing(machine) {
  const category = clean(machine?.category);
  const rawPrice = Number(machine?.price ?? machine?.precio ?? 0);
  const rawUnit = clean(machine?.priceUnit || machine?.unidad_precio || machine?.unitPrice);
  const normalizedUnit = normalizePriceUnit(rawUnit, category);
  const corrected = correctedSeedPricing(machine, rawPrice, normalizedUnit);
  return {
    ...machine,
    price: corrected.price,
    precio: corrected.price,
    priceUnit: corrected.unit,
    unidad_precio: corrected.unit,
  };
}

function machinePricingNeedsMigration(machine) {
  const normalized = normalizeMachinePricing(machine);
  return Number(machine.price ?? machine.precio ?? 0) !== normalized.price
    || Number(machine.precio ?? machine.price ?? 0) !== normalized.precio
    || machine.priceUnit !== normalized.priceUnit
    || machine.unidad_precio !== normalized.unidad_precio;
}

function persistMachinePricingMigration() {
  if (!state.machines.some(machinePricingNeedsMigration)) return;
  localStorage.setItem(STORAGE_KEYS.machines, JSON.stringify(state.machines.map(normalizeMachinePricing)));
}

function optionalNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : null;
}

function priceAmountLabel(machine) {
  return `${money(machine?.price)}`;
}

function priceUnitPreviewLabel(unit) {
  const meta = priceUnitMeta[normalizePriceUnit(unit)] || priceUnitMeta.hectarea;
  return meta.preview;
}

function priceDisplay(machine) {
  const unit = normalizePriceUnit(machine?.priceUnit, machine?.category);
  const meta = priceUnitMeta[unit] || priceUnitMeta.hectarea;
  if (unit === "fijo") return `${priceAmountLabel(machine)} ${meta.short}`;
  return `${priceAmountLabel(machine)}${meta.short}`;
}
function requestQuantityFieldsForPriceUnit(unit) {
  return {
    hectares: unit === "hectarea",
    tons: unit === "tonelada" || unit === "tonelada_kilometro",
    bags: unit === "bolsa",
    trips: unit === "viaje",
    km: unit === "kilometro" || unit === "tonelada_kilometro",
    hours: unit === "hora",
    days: unit === "dia",
  };
}

function estimateServiceCost({ serviceType, priceUnit, unitPrice, quantity, modifiers = {} }) {
  const price = Number(unitPrice);
  const qty = Number(quantity);
  const adjustment = Object.values(modifiers).reduce((sum, value) => sum + (Number(value) || 0), 0);
  if (!Number.isFinite(price) || price <= 0) return { estimatedValue: null, quantity: null, priceUnit, unitPrice: price };
  const effectiveQuantity = priceUnit === "fijo" ? 1 : qty;
  if (!Number.isFinite(effectiveQuantity) || effectiveQuantity <= 0) {
    return { estimatedValue: null, quantity: null, priceUnit, unitPrice: price };
  }
  return {
    serviceType,
    priceUnit,
    unitPrice: price,
    quantity: effectiveQuantity,
    estimatedValue: Math.max(0, Math.round((price * effectiveQuantity) + adjustment)),
  };
}

function requestEconomicContext(form, machine) {
  if (!machine) return null;
  const priceUnit = normalizePriceUnit(machine.priceUnit, machine.category);
  const quantity = requestQuantityForUnit(form, priceUnit);
  const estimate = estimateServiceCost({
    serviceType: defaultJobForMachine(machine),
    priceUnit,
    unitPrice: machine.price,
    quantity,
    modifiers: {},
  });
  return {
    machine,
    serviceType: defaultJobForMachine(machine),
    priceUnit,
    unitPrice: Number(machine.price),
    quantity,
    estimate,
  };
}

function requestQuantityForUnit(form, priceUnit) {
  if (priceUnit === "hectarea") return Number(formControl(form, "hectares").value);
  if (priceUnit === "tonelada") return Number(formControl(form, "estimatedTons").value);
  if (priceUnit === "bolsa") return Number(formControl(form, "estimatedBags").value);
  if (priceUnit === "viaje") return Number(formControl(form, "estimatedTrips").value);
  if (priceUnit === "kilometro") return Number(formControl(form, "estimatedKm").value);
  if (priceUnit === "hora") return Number(formControl(form, "estimatedServiceHours").value);
  if (priceUnit === "dia") return Number(formControl(form, "estimatedDays").value);
  if (priceUnit === "tonelada_kilometro") {
    const tons = Number(formControl(form, "estimatedTons").value);
    const km = Number(formControl(form, "estimatedKm").value);
    return Number.isFinite(tons) && Number.isFinite(km) ? tons * km : NaN;
  }
  if (priceUnit === "fijo") return 1;
  return NaN;
}

function requestEconomicPayload(form, machine) {
  const context = requestEconomicContext(form, machine);
  if (!context) return {};
  return {
    estimateQuantity: context.estimate.quantity,
    estimatedCost: context.estimate.estimatedValue,
    estimatedRevenue: context.estimate.estimatedValue,
    estimatedValueDisclaimer: "El valor es estimado y puede variar segun el trabajo realizado.",
  };
}

function quantityUnitLabel(priceUnit) {
  const labels = {
    hectarea: "ha",
    tonelada: "tn",
    bolsa: "bolsas",
    viaje: "viajes",
    kilometro: "km",
    tonelada_kilometro: "tn/km",
    hora: "horas",
    dia: "dias",
    fijo: "servicio",
  };
  return labels[priceUnit] || priceUnit;
}

function formatEstimatedMoney(value) {
  return Number.isFinite(Number(value)) ? `$${money(value)}` : "Sin datos suficientes";
}

function economicSummaryLines(context, formOrReservation = null) {
  if (!context) return [];
  const lines = [
    ["Servicio", context.serviceType || context.machine?.category || "Servicio"],
    ["Tarifa", priceDisplay(context.machine || { price: context.unitPrice, priceUnit: context.priceUnit, category: context.machine?.category })],
  ];
  if (context.priceUnit !== "fijo" && context.estimate.quantity) {
    lines.splice(1, 0, ["Cantidad estimada", `${money(context.estimate.quantity)} ${quantityUnitLabel(context.priceUnit)}`]);
  }
  return lines;
}

function economicSummaryMarkup(context, title = "Estimacion economica", totalLabel = "Costo estimado", formOrReservation = null, showTotalLine = true) {
  const lines = economicSummaryLines(context, formOrReservation);
  return `
    <section class="economic-summary">
      <div class="economic-summary-head">
        <span><i class="fa-solid fa-coins"></i> ${escapeHTML(title)}</span>
        <strong>${formatEstimatedMoney(context?.estimate?.estimatedValue)}</strong>
      </div>
      <div class="economic-summary-grid">
        ${lines.map(([label, value]) => `<div class="economic-summary-line"><span>${escapeHTML(label)}</span><strong>${escapeHTML(value)}</strong></div>`).join("")}
        ${showTotalLine ? `<div class="economic-summary-line"><span>${escapeHTML(totalLabel)}</span><strong>${formatEstimatedMoney(context?.estimate?.estimatedValue)}</strong></div>` : ""}
      </div>
      <p>El valor mostrado es una estimacion calculada con la informacion disponible.</p>
      <p>El importe final podra variar segun la cantidad efectivamente trabajada, la modalidad de cobro del contratista y las condiciones reales del servicio.</p>
    </section>
  `;
}

function reservationEconomicContext(reservation) {
  const machine = findMachine(reservation.machineId) || {
    category: reservation.category,
    price: reservation.unitPrice || reservation.price,
    priceUnit: reservation.priceUnit,
  };
  const priceUnit = normalizePriceUnit(reservation.priceUnit || machine.priceUnit, reservation.category || machine.category);
  const quantity = reservation.estimateQuantity || reservationQuantityForUnit(reservation, priceUnit);
  const estimate = estimateServiceCost({
    serviceType: reservation.job || defaultJobForMachine(machine),
    priceUnit,
    unitPrice: reservation.unitPrice || machine.price,
    quantity,
    modifiers: {},
  });
  return { machine, serviceType: reservation.job || defaultJobForMachine(machine), priceUnit, unitPrice: Number(reservation.unitPrice || machine.price), quantity, estimate };
}

function reservationQuantityLabel(reservation) {
  const context = reservationEconomicContext(reservation);
  if (context.priceUnit === "fijo") return "precio fijo";
  const quantity = context.estimate.quantity || context.quantity;
  return Number.isFinite(Number(quantity)) && Number(quantity) > 0
    ? `${money(quantity)} ${quantityUnitLabel(context.priceUnit)}`
    : "cantidad a confirmar";
}

function reservationQuantityForUnit(reservation, priceUnit) {
  if (priceUnit === "hectarea") return Number(reservation.hectares);
  if (priceUnit === "tonelada") return Number(reservation.estimatedTons);
  if (priceUnit === "bolsa") return Number(reservation.estimatedBags);
  if (priceUnit === "viaje") return Number(reservation.estimatedTrips);
  if (priceUnit === "kilometro") return Number(reservation.estimatedKm);
  if (priceUnit === "hora") return Number(reservation.estimatedServiceHours);
  if (priceUnit === "dia") return Number(reservation.estimatedDays);
  if (priceUnit === "tonelada_kilometro") return Number(reservation.estimatedTons) * Number(reservation.estimatedKm);
  if (priceUnit === "fijo") return 1;
  return NaN;
}

function syncPublishPlateField(categoryOverride) {
  const form = $("#publish-form");
  const category = clean(categoryOverride ?? $("#publish-category")?.value);
  const plateField = $("#publish-plate-field");
  const plateInput = formControl(form, "plate");
  const showPlate = machineSupportsPlate(category);
  if (plateField) plateField.hidden = !showPlate;
  if (!showPlate && plateInput) plateInput.value = "";
}
function validatePublishStep() {
  const form = $("#publish-form");
  if (state.publishStep === 1 && !$("#publish-category")?.value) {
    showToast("Elegí una categoría para continuar.");
    return false;
  }
  if (state.publishStep === 2) {
    const fields = ["title", "price", "priceUnit", "location", "availabilityStart", "availabilityEnd"];
    const invalid = fields.find((n) => !form.elements[n].checkValidity());
    if (invalid) { form.elements[invalid].reportValidity(); return false; }
    const start = clean(form.elements.availabilityStart.value);
    const end = clean(form.elements.availabilityEnd.value);
    if (start && end && start > end) {
      showToast("La ventana de disponibilidad debe terminar despues de iniciar.");
      form.elements.availabilityEnd.focus();
      return false;
    }
    const estimatedHours = Number(form.elements.estimatedHours.value || 0);
    if (form.elements.estimatedHours.value && estimatedHours <= 0) {
      form.elements.estimatedHours.reportValidity();
      return false;
    }
    const minHectares = Number(form.elements.minHectares.value || 0);
    if (form.elements.minHectares.value && minHectares <= 0) {
      form.elements.minHectares.reportValidity();
      return false;
    }
    const dailyCapacity = Number(form.elements.dailyCapacity.value || 0);
    if (form.elements.dailyCapacity.value && dailyCapacity <= 0) {
      form.elements.dailyCapacity.reportValidity();
      return false;
    }
  }
  return true;
}

function updatePublishPreview() {
  const form = $("#publish-form");
  const selectedCategory = clean($("#publish-category")?.value);
  const category = selectedCategory || "Maquinaria";
  syncPublishPlateField(selectedCategory);
  syncPublishPricingFields(selectedCategory);
  const icon = categoryIcons[category] || "fa-tractor";
  $("#publish-preview-icon").innerHTML = `<i class="fa-solid ${icon}"></i>`;
  $("#publish-preview-category").textContent = category;
  $("#publish-preview-title").textContent = clean(form.elements.title.value) || "Tu equipo publicado";
  $("#publish-preview-description").textContent = clean(form.elements.description.value) || "Completá los datos para ver cómo aparecerá en el catálogo.";
  $("#publish-preview-location").textContent = clean(form.elements.location.value) || "Zona de trabajo";
  const availabilityWindow = availabilityWindowFromPublishForm(form);
  const availabilityLabel = availabilityWindow.startDate && availabilityWindow.endDate
    ? availabilityLabelForSlot(availabilityWindow)
    : "Ventana de disponibilidad";
  if (form.elements.availability) form.elements.availability.value = availabilityLabel;
  $("#publish-preview-availability").textContent = availabilityLabel;
  $("#publish-preview-owner").textContent = clean(form.elements.owner.value) || "Contratista";
  const previewUnit = normalizePriceUnit(form.elements.priceUnit?.value, category);
  $("#publish-preview-price").textContent = form.elements.price.value ? `${money(form.elements.price.value)}` : "$ -";
  $("#publish-preview-price-unit").textContent = priceUnitPreviewLabel(previewUnit);
  const plate = normalizePlate(formControl(form, "plate")?.value);
  const showPlate = machineSupportsPlate(category) && plate;
  $("#publish-preview-plate-row").hidden = !showPlate;
  $("#publish-preview-plate").textContent = showPlate ? plate : "";
}

function resetPublishWizard() {
  state.publishStep = 1;
  $$("#publish-category-grid .pub-cat-btn").forEach((b) => b.classList.remove("selected"));
  syncPublishPricingFields("");
  updatePublishPreview();
  renderPublishStep();
}

/* ─── PROFILE ─── */

function bindProfile() {
  const form = $("#profile-form");
  syncProfileFormFromState();
  updateOperationRadiusValue();
  syncThemeControls();
  form.addEventListener("input", (event) => {
    if (event.target?.name === "operationRadiusKm") updateOperationRadiusValue(event.target.value);
    state.profile = profileFromForm();
    saveProfile();
    renderProfile();
    updateOperationCircle();
  });
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    state.profile = profileFromForm();
    saveProfile();
    renderProfile();
    updateOperationCircle();
    showToast("Perfil actualizado.");
  });
  form.querySelectorAll('input[name="theme"]').forEach((input) => {
    input.addEventListener("change", () => {
      setTheme(input.value);
    });
  });
  $("#logout-btn").addEventListener("click", () => {
    state.auth = null;
    saveAuth();
    updateBadges();
    renderProfile();
    showToast("Sesion cerrada.");
    showScreen("acceso");
  });
}

function syncProfileFormFromState() {
  const form = $("#profile-form");
  if (!form) return;
  form.elements.name.value = state.profile.name || "";
  form.elements.zone.value = state.profile.zone || "";
  form.elements.baseLocation.value = state.profile.baseLocation || state.profile.zone || "";
  formControl(form, "hectares").value = state.profile.hectares || "";
  formControl(form, "operationRadiusKm").value = profileOperationRadiusKm();
  form.elements.bio.value = state.profile.bio || "";
}

function profileFromForm() {
  const form = $("#profile-form");
  return {
    name: clean(form.elements.name.value),
    zone: clean(form.elements.zone.value),
    hectares: clean(formControl(form, "hectares").value),
    baseLocation: clean(form.elements.baseLocation.value),
    operationRadiusKm: profileOperationRadiusKm(formControl(form, "operationRadiusKm").value),
    bio: clean(form.elements.bio.value),
  };
}

function profileOperationRadiusKm(value = state.profile.operationRadiusKm) {
  const radius = Number(value);
  if (!Number.isFinite(radius)) return 80;
  return Math.min(500, Math.max(10, Math.round(radius)));
}

function updateOperationRadiusValue() {
  const label = $("#operation-radius-value");
  if (label) label.textContent = `${profileOperationRadiusKm()} km`;
}

function profileBaseLocation() {
  if (isValidCoordinate(state.profile.baseLatitude, state.profile.baseLongitude)) {
    return {
      latitude: Number(state.profile.baseLatitude),
      longitude: Number(state.profile.baseLongitude),
      address: clean(state.profile.baseLocation) || clean(state.profile.zone) || "Ubicacion base",
    };
  }
  return knownCoordinatesForLocation(state.profile.baseLocation || state.profile.zone);
}

function normalizeTheme(value) {
  return ["normal", "dark", "field"].includes(value) ? value : "normal";
}

function applyTheme(theme) {
  const safeTheme = normalizeTheme(theme);
  document.documentElement.dataset.theme = safeTheme;
  document.documentElement.style.colorScheme = safeTheme === "normal" ? "light" : "dark";
}

function setTheme(theme) {
  state.theme = normalizeTheme(theme);
  applyTheme(state.theme);
  localStorage.setItem(STORAGE_KEYS.theme, state.theme);
  syncThemeControls();
  showToast(themeLabel(state.theme));
}

function syncThemeControls() {
  $$("input[name='theme']").forEach((input) => {
    input.checked = input.value === state.theme;
  });
}

function themeLabel(theme) {
  const labels = {
    normal: "Modo Normal activado.",
    dark: "Modo Oscuro activado.",
    field: "Modo Campo activado.",
  };
  return labels[normalizeTheme(theme)];
}
function bindPublicProfileModal() {
  const modal = $("#public-profile-modal");
  if (!modal) return;
  $("#public-profile-close")?.addEventListener("click", closePublicProfileModal);
  $("#public-profile-view-all")?.addEventListener("click", () => {
    const target = modal.dataset.profileKind === "contractor" ? "mis-ofertas" : "reservas";
    closePublicProfileModal();
    showScreen(target);
  });
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closePublicProfileModal();
  });
  document.addEventListener("click", (e) => {
    const trigger = e.target.closest(".public-profile-trigger");
    if (!trigger) return;
    e.preventDefault();
    e.stopPropagation();
    openPublicProfileModal(profileDataFromTrigger(trigger.dataset));
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.hidden) closePublicProfileModal();
    if (!["Enter", " "].includes(e.key)) return;
    const trigger = e.target.closest?.(".public-profile-trigger");
    if (!trigger || trigger.tagName === "BUTTON") return;
    e.preventDefault();
    openPublicProfileModal(profileDataFromTrigger(trigger.dataset));
  });
}

function profileTrigger({ type, machineId = "", name = "", label = "" }) {
  const visibleLabel = clean(label || name) || "Usuario Agronex";
  return `<button class="public-profile-trigger" type="button" data-profile-type="${escapeHTML(type)}" data-profile-machine-id="${escapeHTML(machineId)}" data-profile-name="${escapeHTML(name || visibleLabel)}">${escapeHTML(visibleLabel)}</button>`;
}

function profileDataFromTrigger(dataset) {
  if (dataset.profileType === "contractor") {
    const machine = findMachine(dataset.profileMachineId);
    return publicProfileForContractor(machine, dataset.profileName);
  }
  return publicProfileForProducer(dataset.profileName);
}

function openPublicProfileModal(profile) {
  const modal = $("#public-profile-modal");
  if (!modal || !profile) return;
  modal.dataset.profileKind = profile.kind;
  $("#public-profile-avatar").textContent = initialsFor(profile.name);
  $("#public-profile-type").textContent = profile.typeLabel;
  $("#public-profile-name").textContent = profile.name;
  $("#public-profile-meta").textContent = `${profile.location} - Miembro desde ${profile.memberSince}`;
  renderPublicProfileReputation(profile);
  renderPublicProfileComments(profile);
  renderPublicProfileBadges(profile);
  renderChipList("#public-profile-specialties", profile.specialties);
  $("#public-profile-experience").textContent = profile.experience;
  const machinesSection = $("#public-profile-machines-section");
  machinesSection.hidden = profile.kind !== "contractor";
  renderChipList("#public-profile-machines", profile.machines);
  $("#public-profile-publications-title").textContent = profile.kind === "contractor" ? "Ultimas ofertas" : "Ultimas solicitudes";
  $("#public-profile-publications").innerHTML = profile.publications.length
    ? profile.publications.slice(0, 5).map(profilePublicationItem).join("")
    : `<p class="profile-empty">No hay publicaciones recientes para mostrar.</p>`;
  $("#public-profile-view-all").hidden = profile.publications.length <= 3;
  modal.hidden = false;
}

function closePublicProfileModal() {
  const modal = $("#public-profile-modal");
  if (modal) modal.hidden = true;
}

function renderPublicProfileReputation(profile) {
  const stats = $("#public-profile-stats");
  const empty = $("#public-profile-reputation-empty");
  const visibleStats = (profile.stats || []).filter((item) => item.value);
  const hasReputation = visibleStats.length > 0;
  empty.hidden = hasReputation;
  stats.hidden = !hasReputation;
  stats.innerHTML = hasReputation ? visibleStats.map((item) => `
    <div class="public-profile-stat">
      <span>${item.label}</span>
      <strong>${item.value}</strong>
    </div>
  `).join("") : "";
}
function renderPublicProfileComments(profile) {
  const section = $("#public-profile-comments-section");
  const target = $("#public-profile-comments");
  if (!section || !target) return;
  const comments = profile.recentComments || [];
  section.hidden = comments.length === 0;
  target.innerHTML = comments.map((item) => `
    <div class="public-profile-comment">
      <span>${Number(item.overallRating).toFixed(1)}/5 - ${formatDate(item.createdAt)}</span>
      <p>${escapeHTML(item.comment)}</p>
    </div>
  `).join("");
}

function renderPublicProfileBadges(profile) {
  const section = $("#public-profile-badges-section");
  const target = $("#public-profile-badges");
  if (!section || !target) return;
  const badges = profile.badges || [];
  section.hidden = badges.length === 0;
  target.innerHTML = badges.map((item) => `<span class="profile-chip">${escapeHTML(item)}</span>`).join("");
}

function renderChipList(selector, items) {
  const target = $(selector);
  if (!target) return;
  target.innerHTML = (items || []).length
    ? items.map((item) => `<span class="profile-chip">${escapeHTML(item)}</span>`).join("")
    : `<span class="profile-empty">Sin datos cargados.</span>`;
}

function profilePublicationItem(item) {
  return `
    <div class="public-profile-item">
      <span>${escapeHTML(item.meta)}</span>
      <strong>${escapeHTML(item.title)}</strong>
    </div>
  `;
}

function publicProfileForContractor(machine, fallbackName = "") {
  const owner = clean(machine?.owner) || clean(fallbackName) || "Contratista Agronex";
  const machines = state.machines.filter((item) => clean(item.owner) === owner);
  const categories = uniqueList(machines.map((item) => item.category));
  const specialties = uniqueList(machines.map((item) => defaultJobByCategory[item.category]).filter(Boolean));
  const mainMachine = machine || machines[0];
  return {
    kind: "contractor",
    typeLabel: "Contratista",
    name: owner,
    location: clean(mainMachine?.location) || "Zona no informada",
    memberSince: memberSinceFor(owner),
    stats: reputationStatsForProfile("contractor", owner),
    recentComments: recentReviewCommentsForProfile("contractor", owner),
    badges: reputationBadgesForProfile("contractor", owner),
    specialties: specialties.length ? specialties : categories,
    experience: clean(mainMachine?.description) || owner + " ofrece servicios rurales y maquinaria agricola en " + (clean(mainMachine?.location) || "su zona de trabajo") + ".",
    machines: categories,
    publications: machines.map((item) => ({ title: item.title, meta: item.category + " - " + priceDisplay(item) })),
  };
}
function publicProfileForProducer(name = "") {
  const producer = clean(name) || currentUserLabel();
  const requests = state.reservations.filter((item) => clean(item.requestedByName || item.requestedBy) === producer || (!name && item.requestedBy === currentUserId()));
  const specialties = uniqueList(requests.map((item) => item.job || item.serviceType || defaultJobByCategory[item.category]).filter(Boolean));
  return {
    kind: "producer",
    typeLabel: "Productor",
    name: producer,
    location: clean(state.profile.zone) || "Zona no informada",
    memberSince: memberSinceFor(producer),
    stats: reputationStatsForProfile("producer", producer),
    recentComments: recentReviewCommentsForProfile("producer", producer),
    badges: reputationBadgesForProfile("producer", producer),
    specialties: specialties.length ? specialties : ["Siembra", "Cosecha", "Transporte"],
    experience: clean(state.profile.bio) || producer + " utiliza Agronex para coordinar trabajos agricolas y maquinaria en su zona.",
    machines: [],
    publications: requests.map((item) => ({ title: item.machineTitle, meta: reservationJobLabel(item).replace(/<[^>]*>/g, "") + " - " + formatDateRange(item) })),
  };
}
function initialsFor(name) {
  return clean(name).split(/\s+/).filter(Boolean).map((part) => part[0]).slice(0, 2).join("").toUpperCase() || "AG";
}

function uniqueList(items) {
  return Array.from(new Set((items || []).map(clean).filter(Boolean)));
}

function memberSinceFor(seed) {
  const year = 2024 + (Math.abs(hashCode(seed || "agronex")) % 3);
  return String(year);
}

function responseTimeFor(seed) {
  const hours = 2 + (Math.abs(hashCode(seed || "respuesta")) % 20);
  return hours < 12 ? `${hours} h aprox.` : "24 h aprox.";
}
function bindTermsModal() {
  const openBtn = $("#auth-terms-open");
  const closeBtn = $("#terms-close");
  const acceptBtn = $("#terms-accept-btn");
  const modal = $("#terms-modal");
  if (!modal) return;
  if (openBtn) openBtn.addEventListener("click", openTermsModal);
  if (closeBtn) closeBtn.addEventListener("click", closeTermsModal);
  if (acceptBtn) acceptBtn.addEventListener("click", acceptTermsFromModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeTermsModal();
  });
}

function openTermsModal() {
  const modal = $("#terms-modal");
  if (!modal) return;
  modal.hidden = false;
}

function closeTermsModal() {
  const modal = $("#terms-modal");
  if (!modal) return;
  modal.hidden = true;
}

function acceptTermsFromModal() {
  const form = $("#auth-form");
  const termsInput = form ? formControl(form, "termsAccepted") : null;
  if (termsInput) termsInput.checked = true;
  hideAuthError();
  closeTermsModal();
}
function bindAuth() {
  const form = $("#auth-form");
  $$(".auth-tab").forEach((btn) => {
    btn.addEventListener("click", () => {
      form.dataset.mode = btn.dataset.authMode;
      renderAuth();
    });
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const mode = form.dataset.mode || "login";
    const email = clean(formControl(form, "email").value).toLowerCase();
    const name = clean(formControl(form, "name").value);
    const password = clean(formControl(form, "password").value);
    const termsAccepted = Boolean(formControl(form, "termsAccepted")?.checked);

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showAuthError("Ingresá un email válido.");
      return;
    }
    if (!password) {
      showAuthError(mode === "register" ? "Creá una contraseña para registrarte." : "Ingresá tu contraseña.");
      return;
    }
    if (mode === "register" && !name) {
      showAuthError("Ingresá tu nombre para registrarte.");
      return;
    }
    if (mode === "register" && password.length < 4) {
      showAuthError("La contraseña debe tener al menos 4 caracteres.");
      return;
    }

    if (mode === "register" && !termsAccepted) {
      showAuthError("Para crear tu cuenta tenes que aceptar los Terminos y Condiciones de Agronex.");
      return;
    }

    const signedInAt = new Date().toISOString();
    state.auth = {
      email,
      password,
      name: mode === "register" ? name : state.profile.name || email.split("@")[0],
      signedInAt,
      terms: mode === "register" ? { version: TERMS_VERSION, effectiveDate: TERMS_EFFECTIVE_DATE, acceptedAt: signedInAt, url: TERMS_URL } : state.auth?.terms,
    };

    if (mode === "register") {
      state.profile = {
        ...state.profile,
        name,
      };
      formControl($("#profile-form"), "name").value = name;
      saveProfile();
    }

    saveAuth();
    hideAuthError();
    if (devUserSwitcherEnabled) renderDevUserSwitcher();
    renderProfile();
    showToast(mode === "register" ? "Cuenta creada." : "Sesion iniciada.");
    showScreen("perfil");
  });
}

function renderAuth() {
  const form = $("#auth-form");
  const mode = form.dataset.mode || "login";
  const passwordField = $("#auth-password-field");
  const passwordInput = formControl(form, "password");
  form.dataset.mode = mode;
  $$(".auth-tab").forEach((btn) => btn.classList.toggle("active", btn.dataset.authMode === mode));
  $$(".auth-register-field").forEach((field) => { field.hidden = mode !== "register"; });
  if (passwordField) {
    const passwordLabel = passwordField.querySelector("span");
    if (passwordLabel) passwordLabel.textContent = mode === "register" ? "Crear contraseña" : "Contraseña";
  }
  if (passwordInput) {
    passwordInput.placeholder = mode === "register" ? "Creá una contraseña" : "Ingresá tu contraseña";
  }
  $("#auth-submit .btn-label").innerHTML = mode === "register"
    ? '<i class="fa-solid fa-user-plus"></i> Crear cuenta'
    : '<i class="fa-solid fa-arrow-right-to-bracket"></i> Iniciar sesion';
  hideAuthError();
}

function showAuthError(message) {
  const error = $("#auth-error");
  error.textContent = message;
  error.hidden = false;
}

function hideAuthError() {
  const error = $("#auth-error");
  if (!error) return;
  error.textContent = "";
  error.hidden = true;
}

/* ─── RENDER ─── */
function render() {
  renderCategoryFilters();
  syncCatalogFilterControls();
  renderCatalog();
  renderReservations();
  renderMisOfertas();
  renderProfile();
  syncThemeControls();
  renderPublishStep();
  renderNotifications();
  renderDevUserSwitcher();
  updateBadges();
}

function renderProfile() {
  const sessionName = state.auth ? clean(state.auth.name) : "";
  const name = clean(state.profile.name) || sessionName || "Mi perfil";
  const initials = name.split(/\s+/).filter(Boolean).map((p) => p[0]).slice(0, 2).join("").toUpperCase() || "ND";
  $("#profile-avatar").textContent     = initials;
  $("#profile-name-label").textContent = name;
  $("#profile-zone-label").textContent = clean(state.profile.zone) || "Zona sin cargar";
  $("#profile-hectares-label").textContent = state.profile.hectares ? `${money(state.profile.hectares)} ha` : "Sin cargar";
  $("#profile-radius-label") && ($("#profile-radius-label").textContent = `${profileOperationRadiusKm()} km`);
  [$("#profile-avatar"), $("#profile-name-label")].forEach((el) => {
    if (!el) return;
    el.classList.remove("public-profile-trigger");
    delete el.dataset.profileType;
    delete el.dataset.profileName;
    el.removeAttribute("tabindex");
    el.removeAttribute("role");
  });
  // User chip
  $("#user-chip-avatar").textContent = state.auth ? initials : "ND";
  $("#user-chip-name").textContent   = state.auth ? name.split(" ")[0] : "Iniciar sesion";
  $("#user-chip").setAttribute("aria-label", state.auth ? "Entrar al perfil" : "Iniciar sesion");
}

/* ─── CATALOG ─── */
function renderCategoryFilters() {
  const existing = new Set(state.machines.map((m) => m.category));
  const categories = categoryOrder.filter((c) => c === "Todas" || existing.has(c));
  const activeCategory = state.filterDraft?.category || state.category;
  $("#category-filters").innerHTML = categories.map((cat) => `
    <button class="filter-chip ${activeCategory === cat ? "active" : ""}" type="button" data-category="${escapeHTML(cat)}">
      <i class="fa-solid ${cat === "Todas" ? "fa-shapes" : (categoryIcons[cat] || "fa-tractor")}"></i>
      ${escapeHTML(cat === "Todas" ? "Todos" : pluralCategory(cat))}
    </button>
  `).join("");

  $$("#category-filters .filter-chip").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.category = btn.dataset.category;
      renderCategoryFilters();
      renderCatalog();
    });
  });
}

function renderCatalog() {
  const grid = $("#catalog-grid");
  const items = state.machines.filter((m) => {
    const matchesCat = state.category === "Todas" || m.category === state.category;
    const text = `${m.title} ${m.category} ${m.location} ${m.owner} ${m.availability}`.toLowerCase();
    return matchesCat
      && (!state.search || text.includes(state.search))
      && matchesAvailabilityFilter(m)
      && matchesServiceFilter(m)
      && matchesReputationFilter(m)
      && matchesTodayFilter(m);
  });

  $("#catalog-empty").hidden = items.length > 0;
  $("#catalog-empty-text").textContent = hasActiveCatalogFilters()
    ? "No hay maquinaria para esta busqueda. Proba limpiando filtros."
    : "Todavia no hay maquinaria publicada.";
  $("#results-meta").textContent = `${items.length} resultado${items.length === 1 ? "" : "s"}`;
  grid.innerHTML = items.map(machineCard).join("");

  $$(".request-btn").forEach((btn) => btn.addEventListener("click", () => openRequestModal(btn.dataset.machineId)));
  $$(".report-btn").forEach((btn) => btn.addEventListener("click", () => openReportModal(btn.dataset.machineId)));
}

function clearCatalogFilters() {
  state.category = "Todas";
  state.search = "";
  state.filters = defaultCatalogFilters();
  state.filterDraft = null;
  $("#catalog-search").value = "";
  syncCatalogFilterControls(state.filters);
  renderCategoryFilters();
  renderCatalog();
}

function resetCatalogFilterDraft() {
  state.filterDraft = { category: "Todas", filters: defaultCatalogFilters() };
  syncCatalogFilterControls(state.filterDraft.filters);
  renderCategoryFilters();
}

function applyCatalogFilters() {
  ensureFilterDraft();
  state.category = state.filterDraft.category;
  state.filters = { ...state.filterDraft.filters };
  closeCatalogFilters();
  renderCatalog();
}

function defaultCatalogFilters() {
  return { availability: "Todas", service: "Todos", reputation: "Todas", todayOnly: false };
}

function syncCatalogFilterControls(filters = state.filters) {
  if ($("#availability-filter")) $("#availability-filter").value = filters.availability;
  if ($("#service-filter")) $("#service-filter").value = filters.service;
  if ($("#reputation-filter")) $("#reputation-filter").value = filters.reputation;
  if ($("#today-filter")) $("#today-filter").checked = Boolean(filters.todayOnly);
}

function hasActiveCatalogFilters() {
  return Boolean(state.search)
    || state.category !== "Todas"
    || state.filters.availability !== "Todas"
    || state.filters.service !== "Todos"
    || state.filters.reputation !== "Todas"
    || Boolean(state.filters.todayOnly);
}

function matchesAvailabilityFilter(machine) {
  const filter = state.filters.availability;
  if (filter === "Todas") return true;
  const slot = availabilitySlotForMachine(machine);
  if (slot) {
    if (filter === "Disponible") return slot.status !== "unavailable";
    if (filter === "Esta semana") return slotOverlapsDateWindow(slot, 0, 7);
    if (filter === "Proxima semana") return slotOverlapsDateWindow(slot, 7, 14);
  }
  const value = textKey(machineAvailabilityLabel(machine));
  if (filter === "Disponible") return value.includes("disponible");
  if (filter === "Esta semana") return value.includes("esta semana");
  if (filter === "Proxima semana") return value.includes("proxima semana");
  if (filter === "Cosecha") return value.includes("cosecha");
  return true;
}

function matchesServiceFilter(machine) {
  const filter = state.filters.service;
  if (filter === "Todos") return true;
  return defaultJobByCategory[machine.category] === filter;
}

function matchesReputationFilter(machine) {
  const filter = state.filters.reputation;
  if (filter === "Todas") return true;
  return typeof machine.rating === "number" && machine.rating >= Number(filter);
}
function isAvailableToday(machine) {
  const slot = availabilitySlotForMachine(machine);
  if (slot) return slotContainsDate(slot, offsetISODate(0));
  return machine.availableToday === true || textKey(machine.availability) === "disponible";
}

function isAvailableTomorrow(machine) {
  const slot = availabilitySlotForMachine(machine);
  if (slot) return slotContainsDate(slot, offsetISODate(1));
  const value = textKey(machineAvailabilityLabel(machine));
  return machine.availableTomorrow === true || value.includes("manana") || value.includes("ma\\u00f1ana");
}
function matchesTodayFilter(machine) {
  return !state.filters.todayOnly || isAvailableToday(machine);
}
function machineCard(machine) {
  const hasRating   = typeof machine.rating === "number";
  const hasDistance = typeof machine.distanceKm === "number";
  const availableToday = isAvailableToday(machine);
  const availableTomorrow = !availableToday && isAvailableTomorrow(machine);
  const slot = availabilitySlotForMachine(machine);
  const availabilityLabel = machineAvailabilityLabel(machine);
  const availabilityStatus = slot ? availabilitySlotStatusLabel(slot.status) : "Ventana flexible";
  const slotUnavailable = slot?.status === "unavailable";
  const availabilityClass = availableToday ? "available-today" : (availableTomorrow ? "available-tomorrow" : "");
  const availabilityBadge = availableToday
    ? `<span class="availability-badge available-today-badge"><span class="availability-dot available-today-dot" aria-hidden="true"></span> Disponible hoy</span>`
    : availableTomorrow
      ? `<span class="availability-badge available-tomorrow-badge"><span class="availability-dot available-tomorrow-dot" aria-hidden="true"></span> Disponible ma\u00f1ana</span>`
      : "";
  return `
    <article class="machine-card ${availabilityClass}">
      <div class="machine-media">
        <i class="fa-solid ${categoryIcons[machine.category] || "fa-tractor"}"></i>
        ${machine.badge ? `<span class="machine-badge">${escapeHTML(machine.badge)}</span>` : ""}
        ${availabilityBadge}
        <button class="floating-action report-btn" type="button" aria-label="Denunciar publicación" title="Denunciar" data-machine-id="${escapeHTML(machine.id)}">
          <i class="fa-solid fa-flag"></i>
        </button>
      </div>
      <div class="machine-body">
        <div class="machine-top">
          <h2 class="machine-title">${escapeHTML(machine.title)}</h2>
          <span class="category-pill">${escapeHTML(machine.category)}</span>
        </div>
        <div class="machine-meta">
          <span><i class="fa-solid fa-location-dot"></i>${escapeHTML(machine.location)}${hasDistance ? ` · ${machine.distanceKm} km` : ""}</span>
          <span><i class="fa-regular fa-calendar-check"></i>${escapeHTML(availabilityLabel)}</span>
          <span><i class="fa-solid fa-layer-group"></i>${escapeHTML(availabilityStatus)}</span>
          <span><i class="fa-solid fa-user-tie"></i>${profileTrigger({ type: "contractor", machineId: machine.id, label: machine.owner })}</span>
          ${hasRating ? `<span><i class="fa-solid fa-star"></i>${machine.rating.toFixed(1)}${machine.reviews ? ` (${machine.reviews})` : ""}</span>` : ""}
        </div>
        <p class="machine-description">${escapeHTML(machine.description)}</p>
        <div class="card-footer">
          <div class="price">
            <strong>${priceAmountLabel(machine)}</strong>
            <span>${priceUnitPreviewLabel(machine.priceUnit)}</span>
          </div>
          <button class="btn primary request-btn" type="button" data-machine-id="${escapeHTML(machine.id)}" ${slotUnavailable ? "disabled" : ""}>
            ${slotUnavailable ? "No disponible" : "Solicitar"}
          </button>
        </div>
      </div>
    </article>
  `;
}

/* ─── MIS OFERTAS ─── */
function bindOffersTabs() {
  $$("#offers-tabs .offers-tab").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.offersTab = btn.dataset.tab;
      $$("#offers-tabs .offers-tab").forEach((b) => b.classList.toggle("active", b === btn));
      renderMisOfertas();
    });
  });
}

function renderMisOfertas() {
  $$("#offers-tabs .offers-tab").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.tab === state.offersTab);
  });
  const myMachines = state.machines.filter(activeUserOwnsMachine);

  // Count per tab
  const activas    = myMachines.filter((m) => m.offerStatus === "active");
  const pausadas   = myMachines.filter((m) => m.offerStatus === "paused");
  const inactivas  = myMachines.filter((m) => m.offerStatus === "inactive");

  // Solicitudes = reservations pending (that can be resolved as contractor)
  const solicitudes = state.reservations.filter((reservation) => activeUserOwnsReservationMachine(reservation) && isContractorNegotiationStatus(reservation));

  $("#tab-count-activas").textContent    = activas.length;
  $("#tab-count-pausadas").textContent   = pausadas.length;
  $("#tab-count-bajas").textContent      = inactivas.length;
  $("#tab-count-solicitudes").textContent = solicitudes.length;

  // Keep alert style on solicitudes
  const solTab = document.querySelector('[data-tab="solicitudes"] .offers-tab-count');
  if (solTab) {
    solTab.classList.toggle("offers-tab-count--alert", solicitudes.length > 0);
  }

  const list   = $("#offers-list");
  const empty  = $("#offers-empty");
  const tab    = state.offersTab;

  let items = [];
  let emptyText = "";

  if (tab === "activas") {
    items = activas;
    emptyText = "No tenés ofertas activas todavía.";
  } else if (tab === "pausadas") {
    items = pausadas;
    emptyText = "No tenés ofertas pausadas.";
  } else if (tab === "bajas") {
    items = inactivas;
    emptyText = "No diste de baja ninguna oferta.";
  } else if (tab === "solicitudes") {
    list.innerHTML = solicitudes.map(solicitudCard).join("");
    empty.hidden = solicitudes.length > 0;
    $("#offers-empty-text").textContent = "No hay solicitudes pendientes.";

    if (solicitudes.length === 0) {
      list.innerHTML = "";
    } else {
      $$(".accept-solicitud-btn").forEach((btn) =>
        btn.addEventListener("click", () => acceptNegotiatedSchedule(btn.dataset.id)));
      $$(".open-schedule-counter-btn").forEach((btn) =>
        btn.addEventListener("click", () => openScheduleCounterModal(btn.dataset.id)));
      $$(".accept-reschedule-btn").forEach((btn) =>
        btn.addEventListener("click", () => acceptRescheduleRequest(btn.dataset.rescheduleId)));
      $$(".reject-reschedule-btn").forEach((btn) =>
        btn.addEventListener("click", () => rejectRescheduleRequest(btn.dataset.rescheduleId)));
      $$(".operation-next-btn").forEach((btn) =>
        btn.addEventListener("click", () => advanceOperationState(btn.dataset.reservationId)));
      $$(".open-operation-sheet-btn").forEach((btn) =>
        btn.addEventListener("click", () => openOperationSheet(btn.dataset.reservationId)));
      $$(".reject-solicitud-btn").forEach((btn) =>
        btn.addEventListener("click", () => confirmAction(
          "Rechazar solicitud",
          `¿Rechazar la solicitud de ${btn.dataset.title}?`,
          "No se puede deshacer. El productor verá el estado actualizado.",
          () => setReservationStatus(btn.dataset.id, "rejected"),
          "Rechazar"
        )));
    }
    return;
  }

  empty.hidden = items.length > 0;
  $("#offers-empty-text").textContent = emptyText;
  list.innerHTML = items.map((m) => offerCard(m, tab)).join("");

  // Bind offer action buttons
  $$(".offer-pause-btn").forEach((btn) => btn.addEventListener("click", () => {
    if (setOfferStatus(btn.dataset.id, "paused")) {
      showToast("Oferta pausada. No aparece en el catalogo hasta que la actives.");
    }
  }));
  $$(".offer-activate-btn").forEach((btn) => btn.addEventListener("click", () => {
    if (setOfferStatus(btn.dataset.id, "active")) {
      showToast("Oferta activada. Ya aparece en el catalogo.");
    }
  }));
  $$(".offer-baja-btn").forEach((btn) => btn.addEventListener("click", () =>
    confirmAction(
      "Dar de baja la oferta",
      `¿Querés dar de baja "${findMachine(btn.dataset.id)?.title}"?`,
      "La oferta dejará de aparecer en el catálogo. Podés reactivarla desde 'Dadas de baja'.",
      () => { if (setOfferStatus(btn.dataset.id, "inactive")) showToast("Oferta dada de baja."); },
      "Dar de baja"
    )
  ));
  $$(".offer-delete-btn").forEach((btn) => btn.addEventListener("click", () => {
    if (hasPendingRequestsForMachine(btn.dataset.id)) {
      showToast("Primero acepta o rechaza la solicitud pendiente para eliminar esta oferta.");
      return;
    }
    confirmAction(
      "Eliminar definitivamente",
      `¿Eliminar "${findMachine(btn.dataset.id)?.title}" de forma permanente?`,
      "Esta acción no se puede deshacer.",
      () => {
        state.machines = state.machines.filter((m) => m.id !== btn.dataset.id);
        state.availabilitySlots = state.availabilitySlots.filter((slot) => slot.machineId !== btn.dataset.id);
        saveMachines();
        saveAvailabilitySlots();
        renderMisOfertas();
        showToast("Oferta eliminada.");
      },
      "Eliminar"
    )
  }));
}

function offerCard(machine, tab) {
  const solicitudesPendientes = pendingRequestsForMachine(machine.id).length;
  const offerChangeLocked = solicitudesPendientes > 0;
  const offerLockAttr = offerChangeLocked ? 'disabled title="Acepta o rechaza la solicitud pendiente antes de cambiar esta oferta"' : "";
  const reservasTotales       = state.reservations.filter((r) => r.machineId === machine.id).length;
  const icon = categoryIcons[machine.category] || "fa-tractor";
  const statusClass = machine.offerStatus === "active" ? "status-active" : machine.offerStatus === "paused" ? "status-paused" : "status-inactive";
  const statusLabel = offerStatusLabels[machine.offerStatus] || machine.offerStatus;
  const slot = availabilitySlotForMachine(machine);
  const slotStatus = slot ? availabilitySlotStatusLabel(slot.status) : "Sin ventana flexible";
  const slotStatusClass = slot ? availabilitySlotStatusClass(slot.status) : "status-paused";

  const actions = tab === "activas" ? `
    ${solicitudesPendientes > 0 ? `<button class="btn btn-sm warning" disabled><i class="fa-solid fa-inbox"></i> ${solicitudesPendientes} pendiente${solicitudesPendientes > 1 ? "s" : ""}</button>` : ""}
    <button class="btn btn-sm ghost offer-pause-btn" type="button" data-id="${machine.id}" ${offerLockAttr}><i class="fa-solid fa-pause"></i> Pausar</button>
    <button class="btn btn-sm danger offer-baja-btn" type="button" data-id="${machine.id}" ${offerLockAttr}><i class="fa-solid fa-ban"></i> Dar de baja</button>
  ` : tab === "pausadas" ? `
    ${solicitudesPendientes > 0 ? `<button class="btn btn-sm warning" disabled><i class="fa-solid fa-inbox"></i> ${solicitudesPendientes} pendiente${solicitudesPendientes > 1 ? "s" : ""}</button>` : ""}
    <button class="btn btn-sm primary offer-activate-btn" type="button" data-id="${machine.id}" ${offerLockAttr}><i class="fa-solid fa-play"></i> Activar</button>
    <button class="btn btn-sm danger offer-baja-btn" type="button" data-id="${machine.id}" ${offerLockAttr}><i class="fa-solid fa-ban"></i> Dar de baja</button>
  ` : `
    ${solicitudesPendientes > 0 ? `<button class="btn btn-sm warning" disabled><i class="fa-solid fa-inbox"></i> ${solicitudesPendientes} pendiente${solicitudesPendientes > 1 ? "s" : ""}</button>` : ""}
    <button class="btn btn-sm ghost offer-activate-btn" type="button" data-id="${machine.id}" ${offerLockAttr}><i class="fa-solid fa-rotate-left"></i> Reactivar</button>
    <button class="btn btn-sm danger offer-delete-btn" type="button" data-id="${machine.id}" ${offerLockAttr}><i class="fa-solid fa-trash"></i> Eliminar</button>
  `;

  return `
    <div class="offer-card">
      <div class="offer-icon">
        <i class="fa-solid ${icon}"></i>
      </div>
      <div class="offer-body">
        <div style="display:flex;align-items:start;justify-content:space-between;gap:10px;margin-bottom:4px;">
          <h3 class="offer-title">${escapeHTML(machine.title)}</h3>
          <span class="status-pill ${statusClass}">${statusLabel}</span>
        </div>
        <div class="offer-meta">
          <span><i class="fa-solid fa-location-dot"></i>${escapeHTML(machine.location)}</span>
          <span><i class="fa-solid fa-dollar-sign"></i>${priceDisplay(machine)}</span>
          <span><i class="fa-regular fa-calendar-check"></i>${escapeHTML(machineAvailabilityLabel(machine))}</span>
          <span><i class="fa-solid fa-layer-group"></i><strong class="status-pill ${slotStatusClass}">${escapeHTML(slotStatus)}</strong></span>
          ${reservasTotales > 0 ? `<span><i class="fa-solid fa-inbox"></i>${reservasTotales} reserva${reservasTotales > 1 ? "s" : ""}</span>` : ""}
        </div>
        <div class="offer-actions">${actions}</div>
      </div>
    </div>
  `;
}

function solicitudCard(reservation) {
  return `
    <div class="offer-solicitud-card">
      <div class="offer-solicitud-head">
        <div>
          <div class="offer-solicitud-title">${escapeHTML(reservation.machineTitle)}</div>
          <div class="offer-solicitud-meta">Solicitud ${formatDate(reservation.createdAt)} - ID: ${reservationCode(reservation)}</div>
        </div>
        <span class="status-pill status-${reservation.status}">${escapeHTML(statusLabels[reservation.status] || reservation.status)}</span>
      </div>
      ${solicitudLogisticsPanel(reservation)}
      ${scheduleNegotiationSection(reservation, "contractor")}
      ${contractorOperationPanel(reservation)}
      ${rescheduleSection(reservation, "contractor")}
      ${contractorScheduleActions(reservation)}
    </div>
  `;
}

function contractorOperationPanel(reservation) {
  if (!operationVisibleForReservation(reservation)) return "";
  const current = currentOperationState(reservation);
  const next = nextOperationState(current.key);
  const incidents = operationIncidentsMarkup(reservation);
  const locationNote = reservation.locationSharingActive
    ? `<p class="operation-location-note"><i class="fa-solid fa-location-crosshairs"></i> Ubicacion compartida durante esta contratacion.</p>`
    : "";
  return `
    <section class="operation-status-card" aria-label="Seguimiento operativo">
      <div class="operation-status-head">
        <div class="operation-status-title">
          <span class="operation-status-icon"><i class="fa-solid ${current.icon}"></i></span>
          <div>
            <span>Estado actual del viaje</span>
            <strong>${escapeHTML(current.label)}</strong>
          </div>
        </div>
        <div class="operation-status-time">${operationUpdatedLabel(reservation)}</div>
      </div>
      ${operationTimeline(reservation)}
      <div class="operation-actions">
        ${next ? `<button class="btn primary operation-next-btn" type="button" data-reservation-id="${reservation.id}"><i class="fa-solid ${next.icon}"></i> ${escapeHTML(next.action || next.label)}</button>` : `<button class="btn primary" type="button" disabled><i class="fa-solid fa-check"></i> Trabajo finalizado</button>`}
        <button class="btn ghost open-operation-sheet-btn" type="button" data-reservation-id="${reservation.id}"><i class="fa-solid fa-sliders"></i> Actualizar estado</button>
      </div>
      ${locationNote}
      ${incidents}
    </section>
  `;
}

function operationVisibleForReservation(reservation) {
  return ["accepted", "working", "done"].includes(reservation?.status) || Boolean(reservation?.operationStatus || reservation?.operationEvents?.length);
}

function currentOperationState(reservation) {
  const key = reservation?.operationStatus || (reservation?.status === "done" ? "done" : reservation?.status === "working" ? "on_way_origin" : "accepted");
  return operationStateByKey(key) || operationFlow[0];
}

function operationStateByKey(key) {
  return operationFlow.find((item) => item.key === key);
}

function nextOperationState(key) {
  const index = operationFlow.findIndex((item) => item.key === key);
  if (index < 0 || index >= operationFlow.length - 1) return null;
  return operationFlow[index + 1];
}

function operationTimeline(reservation) {
  const currentKey = currentOperationState(reservation).key;
  const currentIndex = Math.max(0, operationFlow.findIndex((item) => item.key === currentKey));
  return `
    <div class="status-track operation-track" aria-label="Progreso operativo">
      ${operationFlow.map((step, i) => `
        <span class="status-track-step ${i <= currentIndex ? "done" : ""} ${i === currentIndex ? "current" : ""}">
          <span class="status-track-dot">${i < currentIndex ? '<i class="fa-solid fa-check"></i>' : ""}</span>
          <span class="status-track-label">${escapeHTML(step.label)}</span>
          <span class="status-track-time">${operationEventTime(reservation, step.key)}</span>
        </span>
      `).join("")}
    </div>
  `;
}

function operationEventTime(reservation, key) {
  const event = (reservation.operationEvents || []).find((item) => item.status === key);
  const value = event?.createdAt || (key === "accepted" ? reservation.acceptedAt || reservation.resolvedAt : key === "done" ? reservation.completedAt || reservation.resolvedAt : "");
  return value ? formatTime(value) : "";
}

function operationUpdatedLabel(reservation) {
  const value = reservation.operationUpdatedAt || reservation.completedAt || reservation.startedAt || reservation.acceptedAt || reservation.resolvedAt;
  return value ? `Actualizado ${formatTime(value)}` : "Sin actualizaciones";
}

function operationIncidentsMarkup(reservation) {
  const incidents = reservation.operationIncidents || [];
  if (!incidents.length) return "";
  return `
    <div class="operation-incidents">
      <span>Incidencias reportadas</span>
      <ul>${incidents.slice(0, 3).map((item) => `<li><i class="fa-solid fa-triangle-exclamation"></i> ${escapeHTML(item.reason)} � ${formatTime(item.createdAt)}</li>`).join("")}</ul>
    </div>
  `;
}

function advanceOperationState(reservationId) {
  const reservation = state.reservations.find((item) => item.id === reservationId);
  if (!reservation) return;
  const next = nextOperationState(currentOperationState(reservation).key);
  if (!next) return;
  applyOperationState(reservationId, next.key);
}

function applyOperationState(reservationId, operationKey) {
  const reservation = state.reservations.find((item) => item.id === reservationId);
  const next = operationStateByKey(operationKey);
  if (!reservation || !next) return;
  const previous = JSON.parse(JSON.stringify(reservation));
  const now = new Date().toISOString();
  reservation.operationStatus = next.key;
  reservation.operationUpdatedAt = now;
  reservation.operationEvents = [...(reservation.operationEvents || []), { status: next.key, label: next.label, createdAt: now }];
  if (!reservation.firstResponseAt) reservation.firstResponseAt = now;
  if (next.key === "accepted") {
    reservation.status = "accepted";
  }
  if (next.key !== "accepted" && next.key !== "done") {
    reservation.status = "working";
    reservation.startedAt = reservation.startedAt || now;
  }
  if (next.key === "done") {
    reservation.status = "done";
    reservation.completedAt = now;
    reservation.resolvedAt = now;
    reservation.locationSharingActive = false;
  }
  saveReservations();
  notifyProducerOperationUpdate(reservation, next);
  if (next.key === "done") emitReviewNotificationsForCompletedJob(reservation);
  renderReservations();
  renderMisOfertas();
  updateBadges();
  showOperationUndoToast("Estado actualizado correctamente.", () => restoreOperationSnapshot(previous));
  if (next.key === "on_way_origin" && !reservation.locationSharePrompted) promptLocationSharing(reservation.id);
}

function restoreOperationSnapshot(snapshot) {
  const index = state.reservations.findIndex((item) => item.id === snapshot.id);
  if (index === -1) return;
  state.reservations[index] = snapshot;
  saveReservations();
  renderReservations();
  renderMisOfertas();
  updateBadges();
  showToast("Ultima accion deshecha.");
}

function notifyProducerOperationUpdate(reservation, stateMeta) {
  createNotification({
    user_id: clean(reservation.requestedBy) || currentUserId(),
    type: "system",
    title: "Seguimiento actualizado",
    body: stateMeta.notify || stateMeta.label,
    priority: stateMeta.key === "done" ? "HIGH" : "MEDIUM",
    related_id: reservation.id,
  });
}

function promptLocationSharing(reservationId) {
  const reservation = state.reservations.find((item) => item.id === reservationId);
  if (!reservation || reservation.locationSharePrompted) return;
  reservation.locationSharePrompted = true;
  saveReservations();
  confirmAction(
    "Ubicacion en viaje",
    "�Deseas compartir tu ubicacion durante este viaje?",
    "Se comparte solo durante esta contratacion activa y se detiene al finalizar el trabajo.",
    () => enableOperationLocationSharing(reservationId),
    "Compartir ubicacion"
  );
}

function enableOperationLocationSharing(reservationId) {
  const reservation = state.reservations.find((item) => item.id === reservationId);
  if (!reservation) return;
  reservation.locationSharingActive = true;
  reservation.locationSharedAt = new Date().toISOString();
  saveReservations();
  renderMisOfertas();
  renderReservations();
  createNotification({
    user_id: clean(reservation.requestedBy) || currentUserId(),
    type: "system",
    title: "Ubicacion compartida",
    body: "El contratista comparte su ubicacion durante el viaje.",
    priority: "MEDIUM",
    related_id: reservation.id,
  });
  showToast("Ubicacion compartida durante esta contratacion.");
}

function showOperationUndoToast(message, onUndo) {
  const toast = $("#toast");
  if (!toast) return;
  if (lastOperationUndo?.timer) clearTimeout(lastOperationUndo.timer);
  lastOperationUndo = { onUndo };
  toast.innerHTML = `${escapeHTML(message)} <button class="toast-action" type="button">Deshacer</button>`;
  toast.hidden = false;
  toast.style.animation = "none";
  toast.offsetHeight;
  toast.style.animation = "";
  toast.querySelector("button")?.addEventListener("click", () => {
    const action = lastOperationUndo?.onUndo;
    lastOperationUndo = null;
    toast.hidden = true;
    if (typeof action === "function") action();
  });
  clearTimeout(toastTimer);
  lastOperationUndo.timer = setTimeout(() => {
    toast.hidden = true;
    lastOperationUndo = null;
  }, 10000);
}

function openOperationSheet(reservationId) {
  const reservation = state.reservations.find((item) => item.id === reservationId);
  if (!reservation) return;
  $("#operation-sheet-reservation-id").value = reservation.id;
  renderOperationSheet(reservation);
  $("#operation-sheet-modal").hidden = false;
}

function closeOperationSheet() {
  const modal = $("#operation-sheet-modal");
  if (modal) modal.hidden = true;
}

function renderOperationSheet(reservation) {
  const currentKey = currentOperationState(reservation).key;
  $("#operation-state-list").innerHTML = operationFlow.map((item) => `
    <button class="btn ${item.key === currentKey ? "primary" : "ghost"} operation-state-choice" type="button" data-operation-state="${item.key}">
      <i class="fa-solid ${item.icon}"></i> ${escapeHTML(item.label)}
    </button>
  `).join("");
  $("#operation-incident-list").innerHTML = operationIncidents.map((reason) => `
    <button class="btn ghost operation-incident-choice" type="button" data-incident="${escapeHTML(reason)}">
      <i class="fa-solid fa-triangle-exclamation"></i> ${escapeHTML(reason)}
    </button>
  `).join("");
}

function bindOperationSheet() {
  $("#operation-sheet-close")?.addEventListener("click", closeOperationSheet);
  $("#operation-sheet-modal")?.addEventListener("click", (event) => {
    if (event.target.id === "operation-sheet-modal") closeOperationSheet();
  });
  $("#operation-state-list")?.addEventListener("click", (event) => {
    const button = event.target.closest(".operation-state-choice");
    if (!button) return;
    const reservationId = $("#operation-sheet-reservation-id").value;
    closeOperationSheet();
    applyOperationState(reservationId, button.dataset.operationState);
  });
  $("#operation-incident-list")?.addEventListener("click", (event) => {
    const button = event.target.closest(".operation-incident-choice");
    if (!button) return;
    const reservationId = $("#operation-sheet-reservation-id").value;
    closeOperationSheet();
    reportOperationIncident(reservationId, button.dataset.incident);
  });
}

function reportOperationIncident(reservationId, reason) {
  const reservation = state.reservations.find((item) => item.id === reservationId);
  if (!reservation) return;
  const incident = { reason: clean(reason), createdAt: new Date().toISOString(), reportedBy: currentUserId() };
  reservation.operationIncidents = [incident, ...(reservation.operationIncidents || [])];
  reservation.operationUpdatedAt = incident.createdAt;
  saveReservations();
  createNotification({
    user_id: clean(reservation.requestedBy) || currentUserId(),
    type: "system",
    title: "Incidencia reportada",
    body: incident.reason + " en " + reservation.machineTitle + ".",
    priority: "HIGH",
    related_id: reservation.id,
  });
  renderMisOfertas();
  renderReservations();
  showToast("Incidencia reportada al productor.");
}
function contractorScheduleActions(reservation) {
  if (reservation.status === "schedule_counter") {
    return `<p class="reservation-rejected neutral"><i class="fa-regular fa-clock"></i> Esperando respuesta del productor.</p>`;
  }
  if (!["pending", "original_kept"].includes(reservation.status)) return "";
  return `
    <div class="offer-solicitud-actions">
      <button class="btn btn-sm danger reject-solicitud-btn" type="button"
        data-id="${reservation.id}" data-title="${escapeHTML(reservation.machineTitle)}">
        <i class="fa-solid fa-xmark"></i> Rechazar
      </button>
      <button class="btn btn-sm ghost open-schedule-counter-btn" type="button" data-id="${reservation.id}">
        <i class="fa-regular fa-clock"></i> Proponer otro horario
      </button>
      <button class="btn btn-sm primary accept-solicitud-btn" type="button" data-id="${reservation.id}">
        <i class="fa-solid fa-check"></i> Aceptar
      </button>
    </div>
  `;
}

function solicitudLogisticsPanel(reservation, viewContext = "contractor") {
  const workLocation = reservationWorkLocation(reservation);
  const route = reservationRouteInfo(reservation, workLocation);
  const duration = reservationDurationLabel(reservation);
  const totalTime = reservationTotalTimeLabel(route, reservation);
  const economicContext = reservationEconomicContext(reservation);
  const map = workLocation ? logisticsMapMarkup(workLocation, reservation) : logisticsMapFallback();
  const payment = formatEstimatedMoney(economicContext?.estimate?.estimatedValue);
  const accountCard = reservationAccountCard(reservation, viewContext);
  return `
    <section class="solicitud-decision" aria-label="Resumen ejecutivo de la solicitud">
      <div class="solicitud-exec-grid">
        ${executiveInfoCard("fa-solid fa-coins", "Ingreso", payment)}
        ${executiveInfoCard("fa-solid fa-location-dot", "Distancia", route.distanceLabel)}
        ${executiveInfoCard("fa-regular fa-clock", "Tiempo", totalTime)}
        ${executiveInfoCard("fa-regular fa-calendar", "Fecha", formatDateRange(reservation))}
        ${executiveInfoCard("fa-solid fa-tractor", "Trabajo", reservationJobLabel(reservation))}
      </div>
      <details class="solicitud-more">
        <summary><span class="solicitud-more-label"></span><i class="fa-solid fa-chevron-down"></i></summary>
        <div class="solicitud-more-body">
          <div class="solicitud-more-inner">
            <div class="solicitud-logistics-head">
              <span><i class="fa-solid fa-route"></i> Detalle logistico</span>
            </div>
            <div class="solicitud-logistics-grid">
              ${accountCard}
              ${logisticInfoCard("fa-solid fa-location-dot", "Ubicacion", reservationLocationLabel(reservation))}
              ${logisticTravelCard(route.timeLabel, route.googleMapsUrl)}
              ${duration ? logisticInfoCard("fa-solid fa-hourglass-half", "Tiempo de trabajo", duration) : ""}
              ${logisticInfoCard("fa-solid fa-calculator", "Cantidad", escapeHTML(reservationQuantityLabel(reservation)))}
            </div>
            ${map}
            ${reservation.accessConditions ? `<div class="solicitud-note-card"><strong>Condiciones de acceso</strong><p>${escapeHTML(reservation.accessConditions)}</p></div>` : ""}
            ${reservation.notes ? `<div class="solicitud-note-card"><strong>Observaciones</strong><p>${escapeHTML(reservation.notes)}</p></div>` : ""}
          </div>
        </div>
      </details>
    </section>
  `;
}

function executiveInfoCard(icon, label, value) {
  return `
    <div class="solicitud-exec-card">
      <i class="${icon}"></i>
      <div>
        <span>${escapeHTML(label)}</span>
        <strong>${value}</strong>
      </div>
    </div>
  `;
}

function logisticTravelCard(timeLabel, routeUrl) {
  const routeAction = routeUrl ? `<a class="solicitud-travel-action" href="${routeUrl}" target="_blank" rel="noopener"><i class="fa-solid fa-diamond-turn-right"></i> Ver ruta</a>` : "";
  return `
    <div class="solicitud-logistic-card solicitud-travel-card">
      <i class="fa-regular fa-clock"></i>
      <div>
        <span>Tiempo de viaje</span>
        <strong>${timeLabel}</strong>
        ${routeAction}
      </div>
    </div>
  `;
}
function logisticInfoCard(icon, label, value) {
  return `
    <div class="solicitud-logistic-card">
      <i class="${icon}"></i>
      <div>
        <span>${escapeHTML(label)}</span>
        <strong>${value}</strong>
      </div>
    </div>
  `;
}

function reservationJobLabel(reservation) {
  if (reservation.requestMode === "truck" || reservation.category === "Camion") return escapeHTML(reservation.cargoType ? `Distribucion - ${reservation.cargoType}` : "Distribucion");
  if (reservation.requestMode === "harvest" || reservation.category === "Cosechadora") return escapeHTML(reservation.crop ? `Cosecha - ${reservation.crop}` : "Cosecha");
  if (reservation.requestMode === "bagger" || reservation.category === "Embolsadora") return escapeHTML(reservation.grainType ? `Embolsado - ${reservation.grainType}` : "Embolsado");
  return escapeHTML(reservation.job || reservation.serviceType || "Trabajo agricola");
}

function reservationLocationLabel(reservation) {
  if (reservation.requestMode === "truck" || reservation.category === "Camion") {
    return `${escapeHTML(reservation.origin || "Origen a confirmar")}<br><small>Destino: ${escapeHTML(reservation.destination || "a confirmar")}</small>`;
  }
  return formatFieldStack(reservation.field || reservation.location?.address || "Ubicacion a confirmar");
}

function reservationDurationLabel(reservation) {
  const minutes = reservationWorkMinutes(reservation);
  if (!minutes) return "";
  if (reservation.estimatedDays) return `${money(reservation.estimatedDays)} dia${Number(reservation.estimatedDays) === 1 ? "" : "s"}`;
  if (reservation.hectares && minutes >= 480) {
    const days = Math.ceil(minutes / 480);
    return days === 1 ? "1 jornada de trabajo" : `${days} jornadas de trabajo`;
  }
  return formatDurationMinutes(minutes);
}

function reservationWorkMinutes(reservation) {
  if (reservation.estimatedServiceHours) return Math.max(1, Math.round(Number(reservation.estimatedServiceHours) * 60));
  if (reservation.estimatedDays) return Math.max(1, Math.round(Number(reservation.estimatedDays) * 480));
  if (reservation.hectares) return Math.max(60, Math.ceil(Number(reservation.hectares) / 18) * 60);
  return null;
}

function reservationTotalTimeLabel(route, reservation) {
  const travel = Number(route.travelMinutes || 0);
  const work = Number(reservationWorkMinutes(reservation) || 0);
  if (travel > 0 && work > 0) return `${formatDurationMinutes(travel + work)} aprox.`;
  if (travel > 0) return `${formatDurationMinutes(travel)} de viaje aprox.`;
  if (work > 0) return `${formatDurationMinutes(work)} de trabajo aprox.`;
  return "No disponible";
}

function formatDurationMinutes(minutes) {
  const total = Math.max(1, Math.round(Number(minutes)));
  if (total < 60) return `${total} min`;
  const hours = Math.floor(total / 60);
  const rest = total % 60;
  return rest ? `${hours} h ${rest} min` : `${hours} h`;
}

function reservationAccountCard(reservation, viewContext = "contractor") {
  if (viewContext === "producer") {
    return logisticInfoCard("fa-solid fa-user-tie", "Contratista", profileTrigger({ type: "contractor", machineId: reservation.machineId, label: reservationContractorLabel(reservation, false) }));
  }
  return logisticInfoCard("fa-solid fa-user", "Cuenta solicitante", profileTrigger({ type: "producer", name: reservationRequesterLabel(reservation, false), label: reservationRequesterLabel(reservation, false) }));
}

function reservationContractorLabel(reservation, escaped = true) {
  const machine = findMachine(reservation.machineId);
  const label = clean(reservation.owner) || clean(machine?.owner) || "Contratista sin identificar";
  return escaped ? escapeHTML(label) : label;
}
function reservationRequesterLabel(reservation, escaped = true) {
  const label = clean(reservation.requestedByName) || clean(reservation.requestedBy) || "Productor sin identificar";
  return escaped ? escapeHTML(label) : label;
}

function reservationWorkLocation(reservation) {
  const direct = reservation.location;
  if (direct && isValidCoordinate(direct.latitude, direct.longitude)) {
    return {
      address: clean(direct.address) || reservation.field || "Ubicacion del trabajo",
      latitude: Number(direct.latitude),
      longitude: Number(direct.longitude),
      approximate: false,
    };
  }
  const approximate = knownCoordinatesForLocation(reservation.field || reservation.destination || reservation.origin);
  return approximate ? { ...approximate, approximate: true } : null;
}

function reservationRouteInfo(reservation, workLocation) {
  const machine = findMachine(reservation.machineId);
  const contractorLocation = machineLocationCoordinates(machine);
  const mapsUrl = workLocation ? googleMapsRouteUrl(workLocation, contractorLocation) : "";
  if (!workLocation) {
    return {
      distanceLabel: "No pudimos calcularla todavia.",
      timeLabel: "Selecciona una ubicacion exacta para estimar el viaje.",
      googleMapsUrl: mapsUrl,
      travelMinutes: null,
    };
  }
  if (!contractorLocation) {
    return {
      distanceLabel: "No pudimos calcularla todavia.",
      timeLabel: "Falta la ubicacion precisa del contratista.",
      googleMapsUrl: mapsUrl,
      travelMinutes: null,
    };
  }
  const distanceKm = haversineKm(contractorLocation, workLocation);
  const travelMinutes = estimatedTravelMinutes(distanceKm);
  return {
    distanceLabel: `${formatKm(distanceKm)} km`,
    timeLabel: `${formatDurationMinutes(travelMinutes)} aprox.`,
    googleMapsUrl: mapsUrl,
    travelMinutes,
  };
}

function machineLocationCoordinates(machine) {
  if (!machine) return null;
  if (isValidCoordinate(machine.latitude, machine.longitude)) {
    return { latitude: Number(machine.latitude), longitude: Number(machine.longitude), address: machine.location || machine.title };
  }
  return knownCoordinatesForLocation(machine.location);
}

function knownCoordinatesForLocation(value) {
  const key = textKey(value);
  if (!key) return null;
  const places = [
    { match: ["venado tuerto"], address: "Venado Tuerto, Santa Fe", latitude: -33.7456, longitude: -61.9688 },
    { match: ["pergamino"], address: "Pergamino, Buenos Aires", latitude: -33.8895, longitude: -60.5736 },
    { match: ["junin", "jun�n", "jun n"], address: "Junin, Buenos Aires", latitude: -34.5850, longitude: -60.9589 },
    { match: ["rojas"], address: "Rojas, Buenos Aires", latitude: -34.1977, longitude: -60.7350 },
    { match: ["rosario"], address: "Rosario, Santa Fe", latitude: -32.9442, longitude: -60.6505 },
    { match: ["cordoba", "c�rdoba", "c�rdoba"], address: "Cordoba Capital", latitude: -31.4201, longitude: -64.1888 },
    { match: ["buenos aires"], address: "Buenos Aires", latitude: -34.6037, longitude: -58.3816 },
  ];
  const found = places.find((place) => place.match.some((item) => key.includes(item)));
  return found ? { address: found.address, latitude: found.latitude, longitude: found.longitude } : null;
}

function haversineKm(origin, destination) {
  const toRad = (value) => Number(value) * Math.PI / 180;
  const radiusKm = 6371;
  const dLat = toRad(destination.latitude - origin.latitude);
  const dLon = toRad(destination.longitude - origin.longitude);
  const lat1 = toRad(origin.latitude);
  const lat2 = toRad(destination.latitude);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return radiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatKm(value) {
  return Number(value).toLocaleString("es-AR", { maximumFractionDigits: value < 20 ? 1 : 0 });
}

function estimatedTravelMinutes(distanceKm) {
  if (!Number.isFinite(distanceKm) || distanceKm <= 0) return null;
  return Math.max(10, Math.round((distanceKm / 55) * 60));
}

function googleMapsRouteUrl(destination, origin = null) {
  if (!destination || !isValidCoordinate(destination.latitude, destination.longitude)) return "";
  const params = new URLSearchParams({ api: "1", destination: `${destination.latitude},${destination.longitude}`, travelmode: "driving" });
  if (origin && isValidCoordinate(origin.latitude, origin.longitude)) params.set("origin", `${origin.latitude},${origin.longitude}`);
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

function logisticsMapMarkup(location, reservation) {
  const lat = Number(location.latitude);
  const lon = Number(location.longitude);
  const delta = 0.018;
  const bbox = [lon - delta, lat - delta, lon + delta, lat + delta].join("%2C");
  const marker = `${lat}%2C${lon}`;
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${marker}`;
  const approximate = location.approximate ? "Ubicacion aproximada por texto" : "Ubicacion exacta seleccionada";
  return `
    <div class="solicitud-map-card">
      <iframe title="Mapa de ${escapeHTML(reservation.machineTitle)}" loading="lazy" src="${src}"></iframe>
      <div class="solicitud-map-caption">
        <span><i class="fa-solid fa-map-pin"></i> ${escapeHTML(approximate)}</span>
        <small>${escapeHTML(location.address || formatCoordinates(lat, lon))}</small>
      </div>
    </div>
  `;
}

function logisticsMapFallback() {
  return `
    <div class="solicitud-map-fallback">
      <i class="fa-solid fa-map-location-dot"></i>
      <div>
        <strong>No pudimos mostrar el mapa.</strong>
        <p>La solicitud necesita una ubicacion exacta para ver el punto y calcular la ruta.</p>
      </div>
    </div>
  `;
}
function pendingRequestsForMachine(machineId) {
  return state.reservations.filter((r) => r.machineId === machineId && isContractorNegotiationStatus(r));
}

function isContractorNegotiationStatus(reservation) {
  return ["pending", "schedule_counter", "original_kept", "accepted", "working"].includes(reservation?.status) || Boolean(pendingRescheduleFor(reservation?.id));
}

function hasPendingRequestsForMachine(machineId) {
  return pendingRequestsForMachine(machineId).length > 0;
}

function setOfferStatus(machineId, status) {
  const machine = findMachine(machineId);
  if (!machine) return false;
  if (status !== machine.offerStatus && hasPendingRequestsForMachine(machineId)) {
    showToast("Primero acepta o rechaza la solicitud pendiente para cambiar esta oferta.");
    return false;
  }
  machine.offerStatus = status;
  saveMachines();
  renderMisOfertas();
  renderCatalog();
  renderCategoryFilters();
  return true;
}

function setAvailabilitySlotStatus(machineId, status) {
  const slot = findAvailabilitySlot(machineId);
  if (!slot || !availabilitySlotStatusLabels[status]) return;
  slot.status = status;
  saveAvailabilitySlots();
  renderMisOfertas();
  renderCatalog();
  showToast(`Ventana marcada como ${availabilitySlotStatusLabel(status).toLowerCase()}.`);
}

function markAvailabilitySlotPartiallyBooked(machineId) {
  const slot = findAvailabilitySlot(machineId);
  if (!slot || slot.status === "unavailable") return;
  slot.status = "partially_booked";
  saveAvailabilitySlots();
}
/* ─── RESERVAS ─── */

function renderReservations() {
  const list  = $("#reservations-list");
  const note  = $("#reservas-note");
  note.textContent = "Aqui ves tus solicitudes como productor y las que recibis como contratista.";

  const visibleReservations = state.reservations.filter(visibleReservationForActiveUser);
  const hasReservations = visibleReservations.length > 0;
  $("#reservations-empty").hidden = hasReservations;
  $("#reservations-empty-text").textContent = "Todavia no hiciste ninguna solicitud de maquinaria.";
  $("#reservations-empty-cta").dataset.nav  = "catalogo";

  list.innerHTML = visibleReservations.map((r) => reservationCard(r)).join("");

  $$(".accept-reservation").forEach((btn) => btn.addEventListener("click", () => setReservationStatus(btn.dataset.reservationId, "accepted")));
  $$(".reject-reservation").forEach((btn) => btn.addEventListener("click", () =>
    confirmAction("Rechazar solicitud", "Rechazar esta solicitud?",
      btn.dataset.title + " para " + formatDate(btn.dataset.date) + ". No se puede deshacer.",
      () => setReservationStatus(btn.dataset.reservationId, "rejected"),
      "Rechazar"
    )));
  $$(".start-work-reservation").forEach((btn)  => btn.addEventListener("click", () => setReservationStatus(btn.dataset.reservationId, "working")));
  $$(".finish-work-reservation").forEach((btn) => btn.addEventListener("click", () => setReservationStatus(btn.dataset.reservationId, "done")));
  $$(".delete-finished-reservation").forEach((btn) => btn.addEventListener("click", () =>
    confirmAction("Eliminar reserva", "Eliminar reserva del historial",
      btn.dataset.title + ". Esta accion quita la reserva del historial local.",
      () => deleteReservation(btn.dataset.reservationId),
      "Eliminar"
    )));
  $$(".open-reschedule-btn").forEach((btn) => btn.addEventListener("click", () => openRescheduleModal(btn.dataset.reservationId)));
  $$(".accept-reschedule-btn").forEach((btn) => btn.addEventListener("click", () => acceptRescheduleRequest(btn.dataset.rescheduleId)));
  $$(".reject-reschedule-btn").forEach((btn) => btn.addEventListener("click", () => rejectRescheduleRequest(btn.dataset.rescheduleId)));
  $$(".open-delay-btn").forEach((btn) => btn.addEventListener("click", () => openDelayModal(btn.dataset.reservationId)));
  $$(".accept-schedule-counter-btn").forEach((btn) => btn.addEventListener("click", () => acceptScheduleCounter(btn.dataset.reservationId)));
  $$(".keep-original-schedule-btn").forEach((btn) => btn.addEventListener("click", () => keepOriginalSchedule(btn.dataset.reservationId)));
  $$(".cancel-schedule-request-btn").forEach((btn) => btn.addEventListener("click", () => cancelScheduleRequest(btn.dataset.reservationId)));
  $$(".open-review-btn").forEach((btn) => btn.addEventListener("click", () => openReviewModal(btn.dataset.reservationId, btn.dataset.reviewerRole)));
}

function reservationCard(reservation) {
  const canResolve    = reservation.status === "pending";
  const canStartWork  = reservation.status === "accepted";
  const canFinishWork = reservation.status === "working";
  const canDeleteFinished = ["done", "rejected", "cancelled"].includes(reservation.status);
  const canReviewContractor = reservation.status === "done" && !reviewForReservation(reservation.id, "producer");
  const canReviewProducer = reservation.status === "done" && !reviewForReservation(reservation.id, "contractor");
  const canRespondScheduleCounter = reservation.status === "schedule_counter";
  const canRequestReschedule = ["accepted", "working"].includes(reservation.status) && !pendingRescheduleFor(reservation.id);
  const canReportDelay = ["accepted", "working"].includes(reservation.status);
  const machine = findMachine(reservation.machineId);
  const icon = categoryIcons[reservation.category] || categoryIcons[machine?.category] || "fa-tractor";
  const requestCode = reservationCode(reservation);
  const equipmentMarkup = reservationEquipmentMarkup(reservation, machine);
  const actionsMarkup = reservationActionsMarkup(reservation, { canResolve, canStartWork, canFinishWork, canDeleteFinished, canRequestReschedule, canReportDelay, canRespondScheduleCounter, canReviewContractor, canReviewProducer });

  return `
    <article class="reservation-card">
      <div class="reservation-head">
        <div class="reservation-title-wrap">
          <span class="reservation-machine-icon"><i class="fa-solid ${icon}"></i></span>
          <div>
            <h3>${escapeHTML(reservation.machineTitle)}</h3>
            <p>${profileTrigger({ type: "contractor", machineId: reservation.machineId, label: reservation.owner })} - Solicitud ${formatDate(reservation.createdAt)} - ID: ${requestCode}</p>
          </div>
        </div>
        <div class="reservation-head-actions">
          <span class="status-pill status-${reservation.status}">${statusLabels[reservation.status]}</span>
        </div>
      </div>
      ${solicitudLogisticsPanel(reservation, "producer")}
      ${scheduleNegotiationSection(reservation, "producer")}
      ${reservationStatusTrack(reservation)}
      ${rescheduleSection(reservation)}
      ${delaySection(reservation)}
      ${equipmentMarkup}
      ${actionsMarkup}
    </article>
  `;
}

function reservationActionsMarkup(reservation, flags) {
  const actions = [];
  if (flags.canResolve) {
    actions.push(`
      <button class="btn ghost reject-reservation" type="button"
        data-reservation-id="${reservation.id}"
        data-title="${escapeHTML(reservation.machineTitle)}"
        data-date="${reservation.date}">
        <i class="fa-solid fa-xmark"></i> Rechazar
      </button>
    `);
    actions.push(`
      <button class="btn primary accept-reservation" type="button" data-reservation-id="${reservation.id}">
        <i class="fa-solid fa-check"></i> Aceptar
      </button>
    `);
  }
  if (flags.canRespondScheduleCounter) {
    actions.push(`
      <button class="btn primary accept-schedule-counter-btn" type="button" data-reservation-id="${reservation.id}">
        <i class="fa-solid fa-check"></i> Aceptar propuesta
      </button>
    `);
    actions.push(`
      <button class="btn ghost keep-original-schedule-btn" type="button" data-reservation-id="${reservation.id}">
        <i class="fa-regular fa-clock"></i> Mantener horario original
      </button>
    `);
    actions.push(`
      <button class="btn danger cancel-schedule-request-btn" type="button" data-reservation-id="${reservation.id}">
        <i class="fa-solid fa-ban"></i> Cancelar solicitud
      </button>
    `);
  }
  if (flags.canReportDelay) {
    actions.push(`
      <button class="btn ghost open-delay-btn" type="button" data-reservation-id="${reservation.id}">
        <i class="fa-regular fa-clock"></i> Reportar retraso
      </button>
    `);
  }
  if (flags.canRequestReschedule) {
    actions.push(`
      <button class="btn ghost open-reschedule-btn" type="button" data-reservation-id="${reservation.id}">
        <i class="fa-regular fa-calendar-plus"></i> Solicitar reprogramacion
      </button>
    `);
  }
  if (flags.canStartWork) {
    actions.push(`
      <button class="btn primary start-work-reservation" type="button" data-reservation-id="${reservation.id}">
        <i class="fa-solid fa-play"></i> Iniciar trabajo
      </button>
    `);
  }
  if (flags.canFinishWork) {
    actions.push(`
      <button class="btn primary finish-work-reservation" type="button" data-reservation-id="${reservation.id}">
        <i class="fa-solid fa-flag-checkered"></i> Marcar finalizado
      </button>
    `);
  }
  if (flags.canReviewContractor) {
    actions.push(`
      <button class="btn ghost open-review-btn" type="button" data-reservation-id="${reservation.id}" data-reviewer-role="producer">
        <i class="fa-solid fa-star"></i> Evaluar contratista
      </button>
    `);
  }
  if (flags.canReviewProducer) {
    actions.push(`
      <button class="btn ghost open-review-btn" type="button" data-reservation-id="${reservation.id}" data-reviewer-role="contractor">
        <i class="fa-regular fa-star"></i> Evaluar productor
      </button>
    `);
  }
  if (flags.canDeleteFinished) {
    actions.push(`
      <button class="btn danger delete-finished-reservation" type="button"
        data-reservation-id="${reservation.id}"
        data-title="${escapeHTML(reservation.machineTitle)}">
        <i class="fa-solid fa-trash"></i> Eliminar reserva
      </button>
    `);
  }
  return actions.length ? `<div class="reservation-actions">${actions.join("")}</div>` : "";
}
function scheduleNegotiationSection(reservation, viewContext = "producer") {
  const proposal = reservation.scheduleProposal;
  if (!proposal) return "";
  const statusText = proposal.status === "accepted"
    ? "Propuesta aceptada"
    : proposal.status === "original_kept"
      ? "El productor mantiene el horario original"
      : proposal.status === "cancelled"
        ? "Solicitud cancelada"
        : "Contrapropuesta de horario";
  const helper = viewContext === "contractor" && reservation.status === "schedule_counter"
    ? "El precio, origen, destino y condiciones quedan bloqueados hasta que responda el productor."
    : "Solo se negocia el horario; el resto de las condiciones no cambia.";
  return `
    <section class="schedule-negotiation-panel" aria-label="Negociacion de horario">
      <div class="reschedule-panel-head">
        <div>
          <h4>${escapeHTML(statusText)}</h4>
          <p>${helper}</p>
        </div>
        <span class="status-pill status-reschedule-pending">Horario</span>
      </div>
      <div class="reschedule-list">
        <div class="reschedule-item">
          <strong>${escapeHTML(scheduleProposalLabel(proposal))}</strong>
          <small>Horario original: ${escapeHTML(originalScheduleLabel(reservation))}</small>
          ${proposal.reason ? `<small>Motivo: ${escapeHTML(proposal.reason)}</small>` : ""}
        </div>
      </div>
    </section>
  `;
}

function scheduleProposalLabel(proposal) {
  return formatDateTimeRangeValues(proposal.date, proposal.date, proposal.startTime, proposal.endTime || proposal.startTime);
}

function originalScheduleLabel(reservation) {
  return formatDateTimeRangeValues(reservation.originalDate || reservation.date, reservation.originalDate || reservation.date, reservation.originalStartTime || reservation.startTime, reservation.originalEndTime || reservation.endTime || reservation.startTime);
}
function delaySection(reservation) {
  const delays = delayHistoryFor(reservation.id);
  if (delays.length === 0) return "";
  return `
    <section class="delay-panel" aria-label="Retrasos registrados">
      <div class="reschedule-panel-head">
        <div>
          <h4>Retrasos registrados</h4>
          <p>Registro de realidad operativa. No cambia fechas ni estado del trabajo.</p>
        </div>
        <span class="status-pill status-delay">${delays.length}</span>
      </div>
      <div class="reschedule-list">
        ${delays.map(delayHistoryItem).join("")}
      </div>
    </section>
  `;
}

function delayHistoryFor(jobId) {
  return state.delayRecords
    .filter((record) => record.jobId === jobId)
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
}

function delayHistoryItem(record) {
  return `
    <div class="reschedule-item">
      <strong>${delayTypeLabel(record.delayType)} � ${money(record.minutesDelayed)} min</strong>
      <small>Reportado por ${escapeHTML(record.reportedByName || record.reportedBy)} � ${formatDate(record.createdAt)}</small>
      ${record.reason ? `<small>Motivo: ${escapeHTML(record.reason)}</small>` : ""}
    </div>
  `;
}

function delayTypeLabel(type) {
  const labels = { start: "Inicio", execution: "Ejecucion", end: "Final" };
  return labels[type] || type;
}
function rescheduleSection(reservation) {
  const pending = pendingRescheduleFor(reservation.id);
  const history = rescheduleHistoryFor(reservation.id);
  if (!pending && history.length === 0) return "";
  return `
    <section class="reschedule-panel" aria-label="Reprogramacion">
      <div class="reschedule-panel-head">
        <div>
          <h4>Reprogramacion</h4>
          <p>Nadie cambia una fecha solo. La otra parte debe aceptar la propuesta.</p>
        </div>
        ${pending ? '<span class="status-pill status-reschedule-pending">Pendiente</span>' : ""}
      </div>
      ${pending ? reschedulePendingMarkup(pending) : ""}
      ${history.length ? `
        <div class="reschedule-list">
          ${history.map(rescheduleHistoryItem).join("")}
        </div>
      ` : ""}
    </section>
  `;
}

function reschedulePendingMarkup(request) {
  return `
    <div class="reschedule-item">
      <strong>${formatDateTimeRangeValues(request.proposedStart, request.proposedEnd, request.proposedStartTime, request.proposedEndTime)}</strong>
      <small>Pedido por ${profileTrigger({ type: "producer", name: request.requestedByName || request.requestedBy, label: request.requestedByName || request.requestedBy })}. Fecha actual: ${formatDateTimeRangeValues(request.oldStart, request.oldEnd, request.oldStartTime, request.oldEndTime)}.</small>
      ${request.reason ? `<small>Motivo: ${escapeHTML(request.reason)}</small>` : ""}
      <div class="reschedule-actions">
        <button class="btn btn-sm ghost reject-reschedule-btn" type="button" data-reschedule-id="${request.id}">
          <i class="fa-solid fa-xmark"></i> Rechazar
        </button>
        <button class="btn btn-sm primary accept-reschedule-btn" type="button" data-reschedule-id="${request.id}">
          <i class="fa-solid fa-check"></i> Aceptar
        </button>
      </div>
    </div>
  `;
}

function rescheduleHistoryItem(request) {
  return `
    <div class="reschedule-item">
      <strong>${formatDateTimeRangeValues(request.proposedStart, request.proposedEnd, request.proposedStartTime, request.proposedEndTime)}</strong>
      <small>${rescheduleStatusLabel(request.status)} � pedido por ${escapeHTML(request.requestedByName || request.requestedBy)}</small>
      ${request.reason ? `<small>Motivo: ${escapeHTML(request.reason)}</small>` : ""}
    </div>
  `;
}

function pendingRescheduleFor(jobId) {
  return state.rescheduleRequests.find((request) => request.jobId === jobId && request.status === "pending");
}

function rescheduleHistoryFor(jobId) {
  return state.rescheduleRequests
    .filter((request) => request.jobId === jobId && request.status !== "pending")
    .sort((a, b) => String(b.resolvedAt || b.createdAt).localeCompare(String(a.resolvedAt || a.createdAt)));
}

function rescheduleStatusLabel(status) {
  const labels = { accepted: "Aceptada", rejected: "Rechazada", pending: "Pendiente" };
  return labels[status] || status;
}

function formatDateRangeValues(start, end) {
  const formattedStart = formatDate(start);
  if (!end || end === start) return formattedStart;
  return `${formattedStart} al ${formatDate(end)}`;
}

function formatDateTimeRangeValues(start, end, startTime = "", endTime = "") {
  const formattedStart = formatDate(start);
  const formattedEnd = formatDate(end || start);
  const cleanStartTime = clean(startTime);
  const cleanEndTime = clean(endTime);
  if (!end || end === start) {
    if (cleanStartTime && cleanEndTime && cleanStartTime !== cleanEndTime) {
      return `${formattedStart} de ${cleanStartTime} a ${cleanEndTime} hs`;
    }
    if (cleanStartTime) return `${formattedStart} ${cleanStartTime} hs`;
    return formattedStart;
  }
  const startLabel = cleanStartTime ? `${formattedStart} ${cleanStartTime} hs` : formattedStart;
  const endLabel = cleanEndTime ? `${formattedEnd} ${cleanEndTime} hs` : formattedEnd;
  return `${startLabel} al ${endLabel}`;
}
function reservationStatusTrack(reservation) {
  const status = typeof reservation === "string" ? reservation : reservation.status;
  if (status === "rejected") return `<p class="reservation-rejected"><i class="fa-solid fa-xmark-circle"></i> Solicitud rechazada</p>`;
  if (status === "cancelled") return `<p class="reservation-rejected"><i class="fa-solid fa-ban"></i> Solicitud cancelada</p>`;
  if (status === "schedule_counter") return `<p class="reservation-rejected neutral"><i class="fa-regular fa-clock"></i> Esperando respuesta del productor</p>`;
  if (status === "original_kept") return `<p class="reservation-rejected neutral"><i class="fa-regular fa-clock"></i> El productor mantuvo el horario original</p>`;
  const steps = [
    { key: "pending",  label: "Solicitada" },
    { key: "accepted", label: "Aceptada" },
    { key: "dispatch", label: "Sali&oacute; del taller" },
    { key: "arrival",  label: "Lleg&oacute; al lote" },
    { key: "working",  label: "En curso" },
    { key: "done",     label: "Finalizada" },
  ];
  const currentIndex = reservationStepIndex(status);
  return `
    <div class="status-track" aria-label="Progreso de la reserva">
      ${steps.map((step, i) => `
        <span class="status-track-step ${i <= currentIndex ? "done" : ""} ${i === currentIndex ? "current" : ""}">
          <span class="status-track-dot">${i < currentIndex ? '<i class="fa-solid fa-check"></i>' : ""}</span>
          <span class="status-track-label">${step.label}</span>
          <span class="status-track-time">${timelineStamp(step.key, reservation)}</span>
        </span>
      `).join("")}
    </div>
  `;
}

function reservationStepIndex(status) {
  const map = { pending: 0, accepted: 1, working: 4, done: 5 };
  return map[status] ?? 0;
}

function reservationMetrics(reservation) {
  if (reservation.requestMode === "truck" || reservation.category === "Camion") {
    return [
      reservationMetric("fa-regular fa-calendar", "Fecha", formatDate(reservation.date)),
      reservationMetric("fa-solid fa-boxes-stacked", "Carga", escapeHTML(reservation.cargoType || "Carga")),
      reservationMetric("fa-solid fa-calculator", "Cantidad", escapeHTML(reservationQuantityLabel(reservation))),
      reservationMetric("fa-solid fa-location-arrow", "Origen", escapeHTML(reservation.origin || "-")),
      reservationMetric("fa-solid fa-location-dot", "Destino", escapeHTML(reservation.destination || "-")),
    ].join("");
  }

  if (reservation.requestMode === "harvest" || reservation.category === "Cosechadora") {
    return [
      reservationMetric("fa-regular fa-calendar", "Fecha", formatDate(reservation.date)),
      reservationMetric("fa-solid fa-calculator", "Cantidad", escapeHTML(reservationQuantityLabel(reservation))),
      reservationMetric("fa-solid fa-seedling", "Cultivo", escapeHTML(reservation.crop || "-")),
      reservationMetric("fa-solid fa-location-dot", "Ubicacion", formatFieldStack(reservation.field)),
      reservationMetric("fa-solid fa-clipboard-list", "Trabajo", escapeHTML(reservation.job || "Cosecha")),
    ].join("");
  }

  if (reservation.requestMode === "bagger" || reservation.category === "Embolsadora") {
    return [
      reservationMetric("fa-regular fa-calendar", "Fecha", formatDate(reservation.date)),
      reservationMetric("fa-solid fa-seedling", "Grano", escapeHTML(reservation.grainType || "-")),
      reservationMetric("fa-solid fa-calculator", "Cantidad", escapeHTML(reservationQuantityLabel(reservation))),
      reservationMetric("fa-solid fa-location-dot", "Ubicacion", formatFieldStack(reservation.field)),
      reservationMetric("fa-solid fa-bag-shopping", "Trabajo", escapeHTML(reservation.job || "Embolsado")),
    ].join("");
  }

  const urgency = formatUrgency(reservation.urgency) || "Media";
  return [
    reservationMetric("fa-regular fa-calendar", "Fecha", formatDateRangeStack(reservation)),
    reservationMetric("fa-solid fa-calculator", "Cantidad", escapeHTML(reservationQuantityLabel(reservation))),
    reservationMetric("fa-solid fa-seedling", "Trabajo", escapeHTML(reservation.job)),
    reservationMetric("fa-solid fa-location-dot", "Lote", formatFieldStack(reservation.field)),
    reservationMetric("fa-regular fa-clock", "Urgencia", `<span class="urgency-${escapeHTML(urgencyClass(reservation.urgency))}">${escapeHTML(urgency)}</span>`),
  ].join("");
}
function reservationMetric(icon, label, value) {
  return `
    <div class="reservation-detail">
      <i class="${icon}"></i>
      <div>
        <span>${label}</span>
        <strong>${value}</strong>
      </div>
    </div>
  `;
}

function formatDateRangeStack(reservation) {
  const start = formatDate(reservation.date);
  const time = reservationTimeLabel(reservation);
  const startLabel = time ? `${start}<br><small>${escapeHTML(time)}</small>` : start;
  if (reservation.dateFlexible) return `${startLabel}<br><small>fin flexible</small>`;
  if (reservation.dateEnd) return `${startLabel}<br><small>al ${formatDate(reservation.dateEnd)}</small>`;
  return startLabel;
}

function formatFieldStack(value) {
  const parts = clean(value).split("/").map((part) => escapeHTML(clean(part))).filter(Boolean);
  return parts.length > 1 ? parts.join("<br>") : escapeHTML(value);
}

function reservationCode(reservation) {
  const date = new Date(reservation.createdAt || Date.now());
  const year = isNaN(date.getTime()) ? new Date().getFullYear() : date.getFullYear();
  return `#ND-${year}-${String(Math.abs(hashCode(reservation.id || reservation.machineId)) % 10000).padStart(4, "0")}`;
}

function reservationEquipmentMarkup(reservation, machine = findMachine(reservation.machineId)) {
  const plate = machinePlate(reservation);
  if (!plate) return "";
  return `
    <div class="reservation-equipment">
      <i class="fa-solid fa-id-card"></i>
      <div>
        <strong>Patente: ${escapeHTML(plate)}</strong>
        <span>${escapeHTML(machine?.brand || reservation.machineTitle)}</span>
      </div>
    </div>
  `;
}
function machinePlate(reservation) {
  const machine = findMachine(reservation.machineId);
  return normalizePlate(machine?.plate || reservation.plate || "");
}
function timelineStamp(stepKey, reservation) {
  const status = typeof reservation === "string" ? reservation : reservation.status;
  if (!["pending", "accepted", "working", "done"].includes(status)) return "";
  const dateByStep = {
    pending: reservation.createdAt || reservation.date,
    accepted: reservation.resolvedAt || reservation.createdAt || reservation.date,
    dispatch: reservation.date,
    arrival: reservation.date,
    working: reservation.date,
    done: reservation.resolvedAt || reservation.dateEnd || reservation.date,
  };
  const timeByStep = {
    pending: "10:15 hs",
    accepted: "14:40 hs",
    dispatch: "07:30 hs",
    arrival: "09:10 hs",
    working: "09:30 hs",
    done: "",
  };
  const time = timeByStep[stepKey];
  if (!time && stepKey !== "done") return "";
  return `<time>${formatDate(dateByStep[stepKey])}</time>${time ? `<strong>${time}</strong>` : ""}`;
}
function bindScheduleCounterModal() {
  const form = $("#schedule-counter-form");
  if (!form) return;
  form.addEventListener("submit", submitScheduleCounterProposal);
  form.addEventListener("input", hideScheduleCounterError);
  $("#schedule-counter-close").addEventListener("click", closeScheduleCounterModal);
  $("#schedule-counter-cancel").addEventListener("click", closeScheduleCounterModal);
  $("#schedule-counter-modal").addEventListener("click", (e) => {
    if (e.target.id === "schedule-counter-modal") closeScheduleCounterModal();
  });
}

function openScheduleCounterModal(reservationId) {
  const reservation = state.reservations.find((item) => item.id === reservationId);
  if (!reservation) return;
  const form = $("#schedule-counter-form");
  form.reset();
  formControl(form, "reservationId").value = reservation.id;
  formControl(form, "date").value = reservation.date || "";
  formControl(form, "startTime").value = reservation.startTime || "08:00";
  formControl(form, "endTime").value = reservation.endTime || "";
  $("#schedule-counter-current").textContent = `Horario solicitado: ${originalScheduleLabel(reservation)}`;
  hideScheduleCounterError();
  $("#schedule-counter-modal").hidden = false;
  formControl(form, "startTime").focus();
}

function closeScheduleCounterModal() {
  $("#schedule-counter-modal").hidden = true;
  hideScheduleCounterError();
}

function submitScheduleCounterProposal(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const reservation = state.reservations.find((item) => item.id === formControl(form, "reservationId").value);
  if (!reservation) return;
  const date = formControl(form, "date").value || reservation.date;
  const startTime = formControl(form, "startTime").value;
  const endTime = formControl(form, "endTime").value;
  const reason = clean(formControl(form, "reason").value);
  if (!startTime) {
    showScheduleCounterError("Elegi una hora de inicio.");
    return;
  }
  if (endTime && endTime <= startTime) {
    showScheduleCounterError("La hora estimada de finalizacion debe ser posterior al inicio.");
    return;
  }
  reservation.originalDate = reservation.originalDate || reservation.date;
  reservation.originalStartTime = reservation.originalStartTime || reservation.startTime || "";
  reservation.originalEndTime = reservation.originalEndTime || reservation.endTime || "";
  reservation.scheduleProposal = {
    date,
    startTime,
    endTime,
    reason,
    status: "pending",
    proposedBy: currentUserId(),
    createdAt: new Date().toISOString(),
  };
  reservation.status = "schedule_counter";
  reservation.firstResponseAt = reservation.firstResponseAt || new Date().toISOString();
  saveReservations();
  emitAppEvent("schedule.proposed", { reservation });
  closeScheduleCounterModal();
  renderReservations();
  renderMisOfertas();
  updateBadges();
  showToast("Contrapropuesta enviada. Esperando respuesta del productor.");
}

function acceptScheduleCounter(reservationId) {
  const reservation = state.reservations.find((item) => item.id === reservationId && item.status === "schedule_counter");
  if (!reservation?.scheduleProposal) return;
  reservation.date = reservation.scheduleProposal.date || reservation.date;
  reservation.startTime = reservation.scheduleProposal.startTime || reservation.startTime || "";
  reservation.endTime = reservation.scheduleProposal.endTime || reservation.endTime || reservation.startTime || "";
  reservation.scheduleProposal.status = "accepted";
  reservation.status = "accepted";
  const now = new Date().toISOString();
  reservation.firstResponseAt = reservation.firstResponseAt || now;
  reservation.acceptedAt = reservation.acceptedAt || now;
  reservation.wasAccepted = true;
  reservation.resolvedAt = now;
  markAvailabilitySlotPartiallyBooked(reservation.machineId);
  saveReservations();
  emitAppEvent("schedule.accepted", { reservation });
  renderReservations();
  renderMisOfertas();
  updateBadges();
  showToast("Propuesta aceptada. La contratacion quedo confirmada.");
}

function keepOriginalSchedule(reservationId) {
  const reservation = state.reservations.find((item) => item.id === reservationId && item.status === "schedule_counter");
  if (!reservation?.scheduleProposal) return;
  reservation.scheduleProposal.status = "original_kept";
  reservation.status = "original_kept";
  reservation.firstResponseAt = reservation.firstResponseAt || new Date().toISOString();
  saveReservations();
  emitAppEvent("schedule.original_kept", { reservation });
  renderReservations();
  renderMisOfertas();
  updateBadges();
  showToast("Horario original mantenido. El contratista debe aceptar o rechazar.");
}

function cancelScheduleRequest(reservationId) {
  const reservation = state.reservations.find((item) => item.id === reservationId && item.status === "schedule_counter");
  if (!reservation) return;
  if (reservation.scheduleProposal) reservation.scheduleProposal.status = "cancelled";
  const now = new Date().toISOString();
  reservation.status = "cancelled";
  reservation.firstResponseAt = reservation.firstResponseAt || now;
  reservation.resolvedAt = now;
  saveReservations();
  emitAppEvent("job.cancelled", { reservation });
  renderReservations();
  renderMisOfertas();
  updateBadges();
  showToast("Solicitud cancelada.");
}

function acceptNegotiatedSchedule(reservationId) {
  const reservation = state.reservations.find((item) => item.id === reservationId);
  if (!reservation) return;
  if (reservation.status === "schedule_counter") return;
  setReservationStatus(reservationId, "accepted");
}

function showScheduleCounterError(message) {
  const error = $("#schedule-counter-error");
  error.textContent = message;
  error.hidden = false;
}

function hideScheduleCounterError() {
  const error = $("#schedule-counter-error");
  if (!error) return;
  error.textContent = "";
  error.hidden = true;
}
function bindDelayModal() {
  const form = $("#delay-form");
  if (!form) return;
  form.addEventListener("submit", submitDelayRecord);
  form.addEventListener("input", hideDelayError);
  $("#delay-close").addEventListener("click", closeDelayModal);
  $("#delay-cancel").addEventListener("click", closeDelayModal);
  $("#delay-modal").addEventListener("click", (e) => {
    if (e.target.id === "delay-modal") closeDelayModal();
  });
}

function openDelayModal(reservationId) {
  const reservation = state.reservations.find((item) => item.id === reservationId);
  if (!reservation) return;
  const form = $("#delay-form");
  form.reset();
  formControl(form, "reservationId").value = reservation.id;
  hideDelayError();
  $("#delay-modal").hidden = false;
  formControl(form, "minutesDelayed").focus();
}

function closeDelayModal() {
  $("#delay-modal").hidden = true;
  hideDelayError();
}

function submitDelayRecord(e) {
  e.preventDefault();
  const form = e.currentTarget;
  const reservationId = formControl(form, "reservationId").value;
  const reservation = state.reservations.find((item) => item.id === reservationId);
  if (!reservation) return;
  const minutesDelayed = Number(formControl(form, "minutesDelayed").value);
  if (!Number.isFinite(minutesDelayed) || minutesDelayed <= 0) {
    showDelayError("Ingresa minutos de retraso con un numero mayor a 0.");
    return;
  }
  state.delayRecords.unshift({
    id: `delay-${Date.now()}`,
    jobId: reservation.id,
    reportedBy: currentUserId(),
    reportedByName: currentUserLabel(),
    delayType: clean(formControl(form, "delayType").value) || "execution",
    minutesDelayed,
    reason: clean(formControl(form, "reason").value),
    createdAt: new Date().toISOString(),
  });
  saveDelayRecords();
  closeDelayModal();
  renderReservations();
  renderMisOfertas();
  showToast("Retraso registrado. El estado y la fecha del trabajo no cambiaron.");
}



function bindReviewModal() {
  const form = $("#review-form");
  if (!form) return;
  form.addEventListener("submit", submitReview);
  form.addEventListener("input", () => {
    hideReviewError();
    updateReviewProgress();
  });
  form.addEventListener("change", () => {
    hideReviewError();
    updateReviewProgress();
  });
  form.addEventListener("click", handleReviewFormClick);
  form.addEventListener("pointerover", handleStarHover);
  form.addEventListener("pointerout", handleStarHoverOut);
  formControl(form, "comment")?.addEventListener("input", updateReviewCommentCounter);
  $("#review-close")?.addEventListener("click", closeReviewModal);
  $("#review-cancel")?.addEventListener("click", closeReviewModal);
  $("#review-modal")?.addEventListener("click", (e) => {
    if (e.target.id === "review-modal") closeReviewModal();
  });
}


function openReviewModal(reservationId, reviewerRole) {
  const reservation = state.reservations.find((item) => item.id === reservationId);
  if (!reservation || reservation.status !== "done") {
    showToast("Solo se pueden evaluar trabajos finalizados.");
    return;
  }
  const role = reviewerRole === "contractor" ? "contractor" : "producer";
  if (reviewForReservation(reservation.id, role)) {
    showToast("Esta evaluacion ya fue enviada y no se puede editar.");
    return;
  }
  const target = reviewTargetFor(reservation, role);
  const form = $("#review-form");
  form.reset();
  formControl(form, "reservationId").value = reservation.id;
  formControl(form, "reviewerRole").value = role;
  formControl(form, "overallRating").value = "";
  $("#review-title").textContent = role === "producer" ? "Evaluar contratista" : "Evaluar productor";
  $("#review-context").textContent = "Esta evaluacion queda asociada a una contratacion finalizada dentro de Agronex.";
  $("#review-target-type").textContent = target.reviewedUserType;
  $("#review-target-name").textContent = target.reviewedName;
  $("#review-target-job").textContent = reservation.machineTitle + " - " + formatDateRange(reservation);
  $("#review-work-again-label").textContent = "?Volverias a trabajar con este " + target.reviewedUserType.toLowerCase() + "?";
  renderStarRating($(".star-rating[data-rating-name='overallRating']"), "overallRating");
  renderReviewCategoryFields(role);
  renderReviewTags(role);
  updateReviewCommentCounter();
  updateReviewProgress();
  hideReviewError();
  $("#review-modal").hidden = false;
  $("#review-modal .review-choice input")?.focus();
}

function closeReviewModal() {
  const modal = $("#review-modal");
  if (modal) modal.hidden = true;
  hideReviewError();
}



function renderReviewCategoryFields(reviewerRole) {
  const target = $("#review-category-fields");
  if (!target) return;
  const categories = reviewCategoriesByRole[reviewerRole] || reviewCategoriesByRole.producer;
  target.innerHTML = categories.map(([key, label]) => [
    '<div class="review-rating-field review-category-field">',
    '<span>' + escapeHTML(label) + '</span>',
    '<input name="review_' + escapeHTML(key) + '" type="hidden" required>',
    '<div class="star-rating" data-rating-name="review_' + escapeHTML(key) + '" role="radiogroup" aria-label="' + escapeHTML(label) + '"></div>',
    '</div>',
  ].join("")).join("");
  categories.forEach(([key]) => renderStarRating(target.querySelector('.star-rating[data-rating-name="review_' + key + '"]'), "review_" + key));
}

function submitReview(e) {
  e.preventDefault();
  const form = e.currentTarget;
  const reservation = state.reservations.find((item) => item.id === formControl(form, "reservationId").value);
  const reviewerRole = formControl(form, "reviewerRole").value === "contractor" ? "contractor" : "producer";
  if (!reservation || reservation.status !== "done") {
    showReviewError("Solo se pueden evaluar contrataciones finalizadas.");
    return;
  }
  if (reviewForReservation(reservation.id, reviewerRole)) {
    showReviewError("Ya enviaste esta evaluacion.");
    return;
  }
  const overallRating = Number(formControl(form, "overallRating").value);
  if (!validRating(overallRating)) {
    showReviewError("Selecciona una calificacion general de 1 a 5 estrellas.");
    return;
  }
  const wouldWorkAgain = clean(form.querySelector('input[name="wouldWorkAgain"]:checked')?.value);
  if (!wouldWorkAgain) {
    showReviewError("Indica si volverias a trabajar con este usuario.");
    return;
  }
  const categories = {};
  for (const [key] of reviewCategoriesByRole[reviewerRole] || []) {
    const value = Number(formControl(form, "review_" + key)?.value);
    if (!validRating(value)) {
      showReviewError("Completa todos los aspectos especificos con 1 a 5 estrellas.");
      return;
    }
    categories[key] = value;
  }
  const target = reviewTargetFor(reservation, reviewerRole);
  const comment = clean(formControl(form, "comment").value).slice(0, 300);
  const review = {
    id: "review-" + Date.now() + "-" + Math.random().toString(16).slice(2),
    reservationId: reservation.id,
    reviewerId: target.reviewerId,
    reviewerName: target.reviewerName,
    reviewerRole,
    reviewedUserId: target.reviewedUserId,
    reviewedName: target.reviewedName,
    reviewedUserType: target.reviewedUserType,
    reviewedRole: target.reviewedRole,
    overallRating,
    categories,
    tags: selectedReviewTags(),
    wouldWorkAgain: wouldWorkAgain === "yes",
    comment,
    createdAt: new Date().toISOString(),
  };
  state.reviews.unshift(review);
  saveReviews();
  syncMachineRatingsFromReviews();
  closeReviewModal();
  renderReservations();
  renderMisOfertas();
  renderCatalog();
  showToast("Evaluacion enviada. Gracias, suma confianza al perfil.");
}

function handleReviewFormClick(e) {
  const star = e.target.closest(".star-btn");
  if (star && star.closest("#review-form")) {
    setStarRating(star.dataset.ratingName, Number(star.dataset.ratingValue));
    return;
  }
  const chip = e.target.closest(".review-tag-chip");
  if (!chip || !chip.closest("#review-form")) return;
  chip.classList.toggle("selected");
  chip.setAttribute("aria-pressed", chip.classList.contains("selected") ? "true" : "false");
  updateReviewProgress();
}

function handleStarHover(e) {
  const star = e.target.closest(".star-btn");
  if (!star || !star.closest("#review-form")) return;
  updateStarRatingUI(star.dataset.ratingName, Number(star.dataset.ratingValue));
}

function handleStarHoverOut(e) {
  const group = e.target.closest(".star-rating");
  if (!group || !group.closest("#review-form")) return;
  updateStarRatingUI(group.dataset.ratingName);
}


function renderStarRating(container, name) {
  if (!container) return;
  container.dataset.ratingName = name;
  container.innerHTML = [1, 2, 3, 4, 5].map((value) =>
    '<button class="star-btn" type="button" data-rating-name="' + escapeHTML(name) + '" data-rating-value="' + value + '" role="radio" aria-checked="false" aria-label="' + value + ' de 5">&#9733;</button>'
  ).join("");
  updateStarRatingUI(name);
}

function setStarRating(name, value) {
  const form = $("#review-form");
  const input = formControl(form, name);
  if (!input || !validRating(value)) return;
  input.value = String(value);
  updateStarRatingUI(name);
  updateReviewProgress();
  hideReviewError();
}


function updateStarRatingUI(name, previewValue = null) {
  const form = $("#review-form");
  if (!form || !name) return;
  const selected = Number(formControl(form, name)?.value);
  const preview = validRating(previewValue) ? previewValue : null;
  $$('.star-rating[data-rating-name="' + name + '"] .star-btn').forEach((button) => {
    const value = Number(button.dataset.ratingValue);
    button.classList.toggle("selected", validRating(selected) && value <= selected);
    button.classList.toggle("preview", preview !== null && value <= preview);
    button.setAttribute("aria-checked", validRating(selected) && selected === value ? "true" : "false");
  });
}


function renderReviewTags(reviewerRole) {
  const target = $("#review-tags");
  if (!target) return;
  const tags = reviewTagsByRole[reviewerRole] || [];
  target.innerHTML = tags.map((tag) =>
    '<button class="review-tag-chip" type="button" data-tag="' + escapeHTML(tag) + '" aria-pressed="false">' + escapeHTML(tag) + '</button>'
  ).join("");
}

function selectedReviewTags() {
  return $$("#review-tags .review-tag-chip.selected")
    .map((button) => clean(button.dataset.tag))
    .filter(Boolean);
}

function updateReviewProgress() {
  const progress = $("#review-progress");
  const form = $("#review-form");
  if (!progress || !form) return;
  const reviewerRole = formControl(form, "reviewerRole")?.value === "contractor" ? "contractor" : "producer";
  const wouldWorkAgain = Boolean(form.querySelector('input[name="wouldWorkAgain"]:checked'));
  const overallDone = validRating(Number(formControl(form, "overallRating")?.value));
  const categoryDone = (reviewCategoriesByRole[reviewerRole] || []).every(([key]) => validRating(Number(formControl(form, "review_" + key)?.value)));
  let step = 1;
  if (wouldWorkAgain) step = 2;
  if (wouldWorkAgain && overallDone) step = 3;
  if (wouldWorkAgain && overallDone && categoryDone) step = 5;
  progress.textContent = "Paso " + step + " de 5";
}

function updateReviewCommentCounter() {
  const value = clean(formControl($("#review-form"), "comment")?.value);
  const counter = $("#review-comment-counter");
  if (counter) counter.textContent = Math.min(value.length, 300) + "/300";
}

function showReviewError(message) {
  const error = $("#review-error");
  if (!error) return;
  error.textContent = message;
  error.hidden = false;
}

function hideReviewError() {
  const error = $("#review-error");
  if (!error) return;
  error.textContent = "";
  error.hidden = true;
}

function validRating(value) {
  return Number.isInteger(value) && value >= 1 && value <= 5;
}

function showDelayError(message) {
  const error = $("#delay-error");
  error.textContent = message;
  error.hidden = false;
}

function hideDelayError() {
  const error = $("#delay-error");
  if (!error) return;
  error.textContent = "";
  error.hidden = true;
}
function bindRescheduleModal() {
  const form = $("#reschedule-form");
  if (!form) return;
  form.addEventListener("submit", submitRescheduleRequest);
  form.addEventListener("input", hideRescheduleError);
  $("#reschedule-close").addEventListener("click", closeRescheduleModal);
  $("#reschedule-cancel").addEventListener("click", closeRescheduleModal);
  $("#reschedule-modal").addEventListener("click", (e) => {
    if (e.target.id === "reschedule-modal") closeRescheduleModal();
  });
}

function openRescheduleModal(reservationId) {
  const reservation = state.reservations.find((item) => item.id === reservationId);
  if (!reservation) return;
  if (pendingRescheduleFor(reservationId)) {
    showToast("Ya hay una reprogramacion pendiente para esta reserva.");
    return;
  }
  const form = $("#reschedule-form");
  form.reset();
  formControl(form, "reservationId").value = reservation.id;
  formControl(form, "proposedStart").value = reservation.date || "";
  formControl(form, "proposedStartTime").value = reservation.startTime || "08:00";
  formControl(form, "proposedEnd").value = reservation.dateEnd || reservation.date || "";
  formControl(form, "proposedEndTime").value = reservation.endTime || reservation.startTime || "18:00";
  $("#reschedule-current-range").textContent = `Fecha actual: ${formatDateTimeRangeValues(reservation.date, reservation.dateEnd || reservation.date, reservation.startTime, reservation.endTime)}`;
  hideRescheduleError();
  $("#reschedule-modal").hidden = false;
  formControl(form, "proposedStart").focus();
}

function closeRescheduleModal() {
  $("#reschedule-modal").hidden = true;
  hideRescheduleError();
}

function submitRescheduleRequest(e) {
  e.preventDefault();
  const form = e.currentTarget;
  const reservationId = formControl(form, "reservationId").value;
  const reservation = state.reservations.find((item) => item.id === reservationId);
  if (!reservation) return;
  if (pendingRescheduleFor(reservation.id)) {
    showRescheduleError("Ya existe una reprogramacion pendiente para esta reserva.");
    return;
  }
  const proposedStart = formControl(form, "proposedStart").value;
  const proposedEnd = formControl(form, "proposedEnd").value || proposedStart;
  const proposedStartTime = formControl(form, "proposedStartTime").value;
  const proposedEndTime = formControl(form, "proposedEndTime").value;
  if (!proposedStart) {
    showRescheduleError("Elegi una nueva fecha de inicio.");
    return;
  }
  if (!proposedStartTime) {
    showRescheduleError("Elegi un horario de inicio.");
    return;
  }
  if (!proposedEndTime) {
    showRescheduleError("Elegi un horario de fin.");
    return;
  }
  if (proposedEnd < proposedStart) {
    showRescheduleError("La fecha fin propuesta no puede ser anterior al inicio.");
    return;
  }
  if (proposedEnd === proposedStart && proposedEndTime <= proposedStartTime) {
    showRescheduleError("El horario de fin debe ser posterior al horario de inicio.");
    return;
  }
  state.rescheduleRequests.unshift({
    id: `rs-${Date.now()}`,
    jobId: reservation.id,
    requestedBy: currentUserId(),
    requestedByName: currentUserLabel(),
    oldStart: reservation.date,
    oldEnd: reservation.dateEnd || reservation.date,
    oldStartTime: reservation.startTime || "",
    oldEndTime: reservation.endTime || reservation.startTime || "",
    proposedStart,
    proposedEnd,
    proposedStartTime,
    proposedEndTime,
    status: "pending",
    reason: clean(formControl(form, "reason").value),
    createdAt: new Date().toISOString(),
  });
  saveRescheduleRequests();
  closeRescheduleModal();
  renderReservations();
  renderMisOfertas();
  updateBadges();
  showToast("Propuesta de reprogramacion enviada. La fecha no cambia hasta que sea aceptada.");
}

function acceptRescheduleRequest(id) {
  const request = state.rescheduleRequests.find((item) => item.id === id && item.status === "pending");
  if (!request) return;
  const reservation = state.reservations.find((item) => item.id === request.jobId);
  if (!reservation) return;
  request.status = "accepted";
  request.resolvedAt = new Date().toISOString();
  reservation.date = request.proposedStart;
  reservation.dateEnd = request.proposedEnd && request.proposedEnd !== request.proposedStart ? request.proposedEnd : "";
  reservation.startTime = request.proposedStartTime || "";
  reservation.endTime = request.proposedEndTime || request.proposedStartTime || "";
  if (reservation.status === "pending") reservation.status = "accepted";
  reservation.rescheduledAt = request.resolvedAt;
  saveReservations();
  saveRescheduleRequests();
  renderReservations();
  renderMisOfertas();
  updateBadges();
  showToast("Reprogramacion aceptada. La fecha del trabajo fue actualizada.");
}

function rejectRescheduleRequest(id) {
  const request = state.rescheduleRequests.find((item) => item.id === id && item.status === "pending");
  if (!request) return;
  request.status = "rejected";
  request.resolvedAt = new Date().toISOString();
  saveRescheduleRequests();
  renderReservations();
  renderMisOfertas();
  updateBadges();
  showToast("Reprogramacion rechazada. La fecha original se mantiene.");
}

function showRescheduleError(message) {
  const error = $("#reschedule-error");
  error.textContent = message;
  error.hidden = false;
}

function hideRescheduleError() {
  const error = $("#reschedule-error");
  if (!error) return;
  error.textContent = "";
  error.hidden = true;
}


function reviewForReservation(reservationId, reviewerRole) {
  return state.reviews.find((item) => item.reservationId === reservationId && item.reviewerRole === reviewerRole);
}

function reviewTargetFor(reservation, reviewerRole) {
  const contractorName = reservationContractorLabel(reservation, false);
  const producerName = reservationRequesterLabel(reservation, false);
  if (reviewerRole === "contractor") {
    return {
      reviewerId: contractorProfileId(contractorName),
      reviewerName: contractorName,
      reviewedUserId: producerProfileId(producerName),
      reviewedName: producerName,
      reviewedUserType: "Productor",
      reviewedRole: "producer",
    };
  }
  return {
    reviewerId: producerProfileId(producerName),
    reviewerName: producerName,
    reviewedUserId: contractorProfileId(contractorName),
    reviewedName: contractorName,
    reviewedUserType: "Contratista",
    reviewedRole: "contractor",
  };
}

function contractorProfileId(name) {
  return "contractor:" + profileKey(name || "contratista");
}

function producerProfileId(name) {
  return "producer:" + profileKey(name || "productor");
}

function profileKey(value) {
  return clean(value).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-");
}

function reviewsForProfile(kind, name) {
  const id = kind === "contractor" ? contractorProfileId(name) : producerProfileId(name);
  return state.reviews.filter((item) => item.reviewedUserId === id || (item.reviewedRole === kind && profileKey(item.reviewedName) === profileKey(name)));
}

function reservationsForProfile(kind, name) {
  const targetName = clean(name);
  if (kind === "contractor") {
    return state.reservations.filter((item) => clean(item.owner) === targetName);
  }
  return state.reservations.filter((item) => clean(item.requestedByName || item.requestedBy) === targetName);
}

function completedReservationsForProfile(kind, name) {
  return reservationsForProfile(kind, name).filter((item) => item.status === "done");
}

function automaticReputationMetrics(kind, name) {
  const reservations = reservationsForProfile(kind, name);
  const completed = reservations.filter((item) => item.status === "done");
  const acceptedLike = reservations.filter((item) => ["accepted", "working", "done", "original_kept"].includes(item.status) || item.acceptedAt || item.wasAccepted);
  const responded = reservations.filter((item) => ["accepted", "rejected", "cancelled", "schedule_counter", "original_kept", "done", "working"].includes(item.status) || item.firstResponseAt || item.resolvedAt || item.acceptedAt);
  const cancelledAfterAccepted = reservations.filter((item) => ["cancelled", "rejected"].includes(item.status) && (item.wasAccepted || item.acceptedAt || item.startedAt));
  const started = reservations.filter((item) => item.startedAt || ["working", "done"].includes(item.status));
  const responseMinutes = reservations
    .map((item) => responseMinutesForReservation(item))
    .filter((value) => Number.isFinite(value) && value >= 0);
  return {
    totalRequests: reservations.length,
    acceptedCount: acceptedLike.length,
    responseCount: responded.length,
    acceptanceRate: reservations.length ? Math.round((acceptedLike.length / reservations.length) * 100) : null,
    cancellationRate: acceptedLike.length ? Math.round((cancelledAfterAccepted.length / acceptedLike.length) * 100) : null,
    averageResponseMinutes: responseMinutes.length ? Math.round(average(responseMinutes)) : null,
    completedCount: completed.length,
    startedCount: started.length,
    complianceRate: started.length ? Math.round((completed.length / started.length) * 100) : null,
    latestActivity: latestDate([
      ...reservations.map((item) => item.resolvedAt || item.startedAt || item.acceptedAt || item.createdAt || item.date),
    ]),
    memberSince: memberSinceFor(name),
  };
}

function responseMinutesForReservation(reservation) {
  const created = new Date(reservation.createdAt || reservation.date);
  const response = new Date(reservation.firstResponseAt || reservation.acceptedAt || reservation.resolvedAt || "");
  if (Number.isNaN(created.getTime()) || Number.isNaN(response.getTime())) return null;
  return Math.max(0, Math.round((response.getTime() - created.getTime()) / 60000));
}


function weightedReviewCategoryAverage(reviews, reviewedRole) {
  const weights = reviewCategoryWeightsByReviewedRole[reviewedRole] || {};
  const values = [];
  reviews.forEach((review) => {
    let weightedSum = 0;
    let totalWeight = 0;
    Object.entries(weights).forEach(([key, weight]) => {
      const value = Number(review.categories?.[key]);
      if (!validRating(value)) return;
      weightedSum += value * weight;
      totalWeight += weight;
    });
    if (totalWeight > 0) values.push(weightedSum / totalWeight);
  });
  return average(values);
}

function responseReputationScore(minutes) {
  if (!Number.isFinite(minutes)) return null;
  if (minutes <= 120) return 100;
  if (minutes <= 720) return 85;
  if (minutes <= 1440) return 70;
  if (minutes <= 2880) return 50;
  return 30;
}

function calculateReputationScore(reviews, metrics, reviewedRole, averageRating, wouldAgainPercent) {
  const categoryAverage = weightedReviewCategoryAverage(reviews, reviewedRole);
  const components = [
    { value: typeof averageRating === "number" ? (averageRating / 5) * 100 : null, weight: 0.24 },
    { value: typeof categoryAverage === "number" ? (categoryAverage / 5) * 100 : null, weight: 0.18 },
    { value: typeof wouldAgainPercent === "number" ? wouldAgainPercent : null, weight: 0.16 },
    { value: Math.min(100, (metrics.completedCount || 0) * 12), weight: 0.12 },
    { value: Math.min(100, reviews.length * 14), weight: 0.08 },
    { value: typeof metrics.acceptanceRate === "number" ? metrics.acceptanceRate : null, weight: 0.09 },
    { value: typeof metrics.cancellationRate === "number" ? Math.max(0, 100 - metrics.cancellationRate) : null, weight: 0.08 },
    { value: responseReputationScore(metrics.averageResponseMinutes), weight: 0.05 },
  ].filter((item) => Number.isFinite(item.value));
  if (!components.length) return null;
  const totalWeight = components.reduce((sum, item) => sum + item.weight, 0);
  return Math.round(components.reduce((sum, item) => sum + item.value * item.weight, 0) / totalWeight);
}


function profileReputationSummary(kind, name) {
  const reviews = reviewsForProfile(kind, name);
  const metrics = automaticReputationMetrics(kind, name);
  const avg = reviews.length ? average(reviews.map((item) => Number(item.overallRating))) : null;
  const wouldAgain = reviews.length ? Math.round((reviews.filter((item) => item.wouldWorkAgain).length / reviews.length) * 100) : null;
  const latest = latestDate([
    ...reviews.map((item) => item.createdAt),
    metrics.latestActivity,
  ]);
  return {
    reviews,
    metrics,
    completedCount: metrics.completedCount,
    averageRating: avg,
    reputationScore: calculateReputationScore(reviews, metrics, kind, avg, wouldAgain),
    evaluationCount: reviews.length,
    wouldAgainPercent: wouldAgain,
    latestActivity: latest,
  };
}


function reputationStatsForProfile(kind, name) {
  const summary = profileReputationSummary(kind, name);
  const metrics = summary.metrics;
  return [
    { label: "Reputacion", value: typeof summary.reputationScore === "number" ? summary.reputationScore + "/100" : "" },
    { label: "Promedio general", value: typeof summary.averageRating === "number" ? summary.averageRating.toFixed(1) + "/5" : "" },
    { label: "Trabajos completados", value: metrics.completedCount ? String(metrics.completedCount) : "" },
    { label: "Evaluaciones", value: summary.evaluationCount ? String(summary.evaluationCount) : "" },
    { label: "Volverian a contratar", value: typeof summary.wouldAgainPercent === "number" ? summary.wouldAgainPercent + "%" : "" },
    { label: "Tasa de aceptacion", value: typeof metrics.acceptanceRate === "number" ? metrics.acceptanceRate + "%" : "" },
    { label: "Tasa de cancelacion", value: typeof metrics.cancellationRate === "number" ? metrics.cancellationRate + "%" : "" },
    { label: "Respuesta promedio", value: formatResponseTime(metrics.averageResponseMinutes) },
    { label: "Cumplimiento", value: typeof metrics.complianceRate === "number" ? metrics.complianceRate + "%" : "" },
    { label: "Antiguedad", value: metrics.memberSince ? "Desde " + metrics.memberSince : "" },
    { label: "Ultima actividad", value: summary.latestActivity ? formatDate(summary.latestActivity) : "" },
  ];
}

function reputationBadgesForProfile(kind, name) {
  const summary = profileReputationSummary(kind, name);
  const metrics = summary.metrics;
  const reviews = summary.reviews;
  const badges = [];
  const punctualityKeys = kind === "contractor" ? ["punctuality"] : ["loadPunctuality"];
  const punctualityAvg = average(reviews.flatMap((item) => punctualityKeys.map((key) => Number(item.categories?.[key])).filter(Number.isFinite)));
  if (typeof punctualityAvg === "number" && punctualityAvg >= 4.6 && reviews.length >= 2) badges.push("Excelente puntualidad");
  if (typeof metrics.averageResponseMinutes === "number" && metrics.averageResponseMinutes <= 180 && metrics.responseCount >= 2) badges.push("Respuesta rapida");
  if (typeof metrics.acceptanceRate === "number" && metrics.acceptanceRate >= 85 && metrics.totalRequests >= 3) badges.push("Alta tasa de aceptacion");
  if (kind === "contractor" && metrics.completedCount >= 3 && (metrics.cancellationRate ?? 0) <= 10 && (summary.wouldAgainPercent ?? 100) >= 80) badges.push("Contratista confiable");
  if (kind === "producer" && metrics.completedCount >= 3 && (metrics.cancellationRate ?? 0) <= 10 && (summary.wouldAgainPercent ?? 100) >= 80) badges.push("Productor confiable");
  return uniqueList(badges);
}

function recentReviewCommentsForProfile(kind, name) {
  return reviewsForProfile(kind, name)
    .filter((item) => clean(item.comment))
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
    .slice(0, 3);
}

function average(values) {
  const valid = values.filter((value) => Number.isFinite(value));
  if (!valid.length) return null;
  return valid.reduce((sum, value) => sum + value, 0) / valid.length;
}

function latestDate(values) {
  const valid = values.map((value) => new Date(value)).filter((date) => !Number.isNaN(date.getTime()));
  if (!valid.length) return null;
  return valid.sort((a, b) => b.getTime() - a.getTime())[0].toISOString();
}

function formatResponseTime(minutes) {
  if (!Number.isFinite(minutes)) return "";
  if (minutes < 60) return minutes + " min";
  const hours = Math.round(minutes / 60);
  if (hours < 24) return hours + " h";
  const days = Math.round(hours / 24);
  return days + " dia" + (days === 1 ? "" : "s");
}


function syncMachineRatingsFromReviews() {
  state.machines.forEach((machine) => {
    const reviews = reviewsForProfile("contractor", machine.owner);
    if (!reviews.length) return;
    const summary = profileReputationSummary("contractor", machine.owner);
    machine.rating = typeof summary.reputationScore === "number"
      ? Number((summary.reputationScore / 20).toFixed(1))
      : Number(average(reviews.map((item) => Number(item.overallRating))).toFixed(1));
    machine.reviews = reviews.length;
  });
  saveMachines();
}


function emitReviewNotificationsForCompletedJob(reservation) {
  if (!reviewForReservation(reservation.id, "producer")) {
    createNotification({ user_id: clean(reservation.requestedBy) || currentUserId(), type: "review", title: "Califica al contratista", body: reservation.machineTitle + " finalizo. Deja una evaluacion verificada.", priority: "MEDIUM", related_id: reservation.id });
  }
  if (!reviewForReservation(reservation.id, "contractor")) {
    createNotification({ user_id: clean(reservation.ownerId) || clean(findMachine(reservation.machineId)?.ownerId) || currentUserId(), type: "review", title: "Califica al productor", body: reservation.machineTitle + " finalizo. Registra como fue la coordinacion.", priority: "MEDIUM", related_id: reservation.id });
  }
}

function currentUserId() {
  return clean(state.auth?.email) || "local-user";
}

function currentUserLabel() {
  return clean(state.profile.name) || clean(state.auth?.name) || "Usuario local";
}
function deleteReservation(id) {
  const index = state.reservations.findIndex((r) => r.id === id && ["done", "rejected", "cancelled"].includes(r.status));
  if (index === -1) return;
  state.reservations.splice(index, 1);
  saveReservations();
  renderReservations();
  renderMisOfertas();
  updateBadges();
  showToast("Reserva eliminada del historial.");
}
function setReservationStatus(id, status) {
  const res = state.reservations.find((r) => r.id === id);
  if (!res) return;
  const now = new Date().toISOString();
  if (["accepted", "rejected", "cancelled"].includes(status) && !res.firstResponseAt) res.firstResponseAt = now;
  if (status === "accepted") {
    res.acceptedAt = res.acceptedAt || now;
    res.wasAccepted = true;
  }
  if (status === "working") {
    res.startedAt = res.startedAt || now;
  }
  if (status === "done") {
    res.completedAt = now;
    res.startedAt = res.startedAt || now;
  }
  if (["cancelled", "rejected"].includes(status) && (res.acceptedAt || res.startedAt)) res.wasAccepted = true;
  res.status = status;
  res.resolvedAt = now;
  if (status === "accepted") markAvailabilitySlotPartiallyBooked(res.machineId);
  saveReservations();
  if (status === "accepted") emitAppEvent("job.accepted", { reservation: res });
  if (status === "rejected") emitAppEvent("job.cancelled", { reservation: res });
  if (status === "done") emitReviewNotificationsForCompletedJob(res);
  renderReservations();
  renderMisOfertas();
  updateBadges();
  const msgs = {
    accepted: "Solicitud aceptada. El productor ve el cambio de estado.",
    rejected: "Solicitud rechazada.",
    working:  "Trabajo iniciado.",
    done:     "Trabajo marcado como finalizado.",
  };
  showToast(msgs[status] || "Estado actualizado.");
}

/* ─── REQUEST MODAL ─── */
function openRequestModal(machineId) {
  const machine = findMachine(machineId);
  if (!machine) return;
  const form = $("#request-form");
  form.reset();
  resetRequestLocation(form);
  hideRequestError();
  formControl(form, "job").value = defaultJobForMachine(machine);
  toggleJobOther(form);
  formControl(form, "machineId").value = machine.id;
  syncRequestMode(form, machine);
  formControl(form, "date").min = new Date().toISOString().slice(0, 10);
  formControl(form, "startTime").value = "";
  formControl(form, "endTime").value = "";
  formControl(form, "dateEnd").min = formControl(form, "date").min;
  syncRequestDateRange(form);
  updateRequestEstimate(form);
  $("#request-title").textContent = machine.title;
  $("#request-modal").hidden = false;
  formControl(form, "date").focus();
}

const requestServiceConfigs = {
  default: {
    mode: "default",
    serviceType: "general",
    dateLabel: "Inicio estimado",
    locationLabel: "Ubicacion del lote",
    tonsLabel: "Toneladas aproximadas",
    showDeadline: true,
    showFlexible: true,
    showUrgency: true,
    showJob: true,
    showCrop: false,
    showGrain: false,
    showHectares: true,
    showTons: false,
    showTransport: false,
    showLocation: true,
  },
  harvest: {
    mode: "harvest",
    serviceType: "cosecha",
    dateLabel: "Fecha del trabajo",
    locationLabel: "Ubicacion",
    tonsLabel: "Toneladas aproximadas",
    showDeadline: false,
    showFlexible: false,
    showUrgency: false,
    showJob: false,
    showCrop: true,
    showGrain: false,
    showHectares: true,
    showTons: false,
    showTransport: false,
    showLocation: true,
  },
  truck: {
    mode: "truck",
    serviceType: "distribucion",
    dateLabel: "Fecha",
    locationLabel: "Ubicacion",
    tonsLabel: "Toneladas aproximadas",
    showDeadline: false,
    showFlexible: false,
    showUrgency: false,
    showJob: false,
    showCrop: false,
    showGrain: false,
    showHectares: false,
    showTons: false,
    showTransport: true,
    showLocation: false,
  },
  bagger: {
    mode: "bagger",
    serviceType: "embolsadora",
    dateLabel: "Fecha del trabajo",
    locationLabel: "Ubicacion",
    tonsLabel: "Toneladas aproximadas a embolsar",
    showDeadline: false,
    showFlexible: false,
    showUrgency: false,
    showJob: false,
    showCrop: false,
    showGrain: true,
    showHectares: false,
    showTons: false,
    showTransport: false,
    showLocation: true,
  },
};

function requestConfigForMachine(machine) {
  const categoryMode = {
    Camion: "truck",
    Cosechadora: "harvest",
    Embolsadora: "bagger",
  };
  return requestServiceConfigs[categoryMode[machine?.category] || "default"];
}

function requestModeForMachine(machine) {
  return requestConfigForMachine(machine).mode;
}

function syncRequestMode(form, machine) {
  const config = requestConfigForMachine(machine);
  form.dataset.requestMode = config.mode;
  form.dataset.serviceType = config.serviceType;

  toggleField("#request-deadline-field", config.showDeadline);
  toggleField("#request-urgency-field", config.showUrgency);
  toggleField("#request-job-field", config.showJob);
  toggleField("#job-other-field", false);
  toggleField("#request-crop-field", config.showCrop);
  toggleField("#request-grain-field", config.showGrain);
  const priceUnit = normalizePriceUnit(machine?.priceUnit, machine?.category);
  const quantityFields = requestQuantityFieldsForPriceUnit(priceUnit);
  toggleField(".request-hectares-field", (config.showHectares && priceUnit === "hectarea") || quantityFields.hectares);
  toggleField("#request-tons-field", (config.showTons && ["tonelada", "tonelada_kilometro"].includes(priceUnit)) || quantityFields.tons);
  toggleField("#request-bags-field", quantityFields.bags);
  toggleField("#request-trips-field", quantityFields.trips);
  toggleField("#request-km-field", quantityFields.km);
  toggleField("#request-hours-field", quantityFields.hours);
  toggleField("#request-days-field", quantityFields.days);
  toggleField("#request-location-field", config.showLocation);
  toggleField("#request-transport-fields", config.showTransport);

  $("#request-date-label").textContent = config.dateLabel;
  $("#request-location-label").textContent = config.locationLabel;
  $("#request-tons-label").textContent = config.tonsLabel;

  formControl(form, "job").value = defaultJobForMachine(machine);
  clearHiddenRequestFields(form, config);
}

function clearHiddenRequestFields(form, config) {
  const machine = findMachine(formControl(form, "machineId")?.value);
  const quantityFields = requestQuantityFieldsForPriceUnit(normalizePriceUnit(machine?.priceUnit, machine?.category));
  if (!config.showDeadline) formControl(form, "dateEnd").value = "";
  if (!config.showUrgency) formControl(form, "urgency").value = "flexible";
  if (!config.showCrop) formControl(form, "crop").value = "";
  if (!config.showGrain) formControl(form, "grainType").value = "";
  if (!config.showHectares && !quantityFields.hectares) formControl(form, "hectares").value = "";
  if (!config.showTons && !quantityFields.tons) formControl(form, "estimatedTons").value = "";
  if (!quantityFields.bags) formControl(form, "estimatedBags").value = "";
  if (!quantityFields.trips) formControl(form, "estimatedTrips").value = "";
  if (!quantityFields.km) formControl(form, "estimatedKm").value = "";
  if (!quantityFields.hours) formControl(form, "estimatedServiceHours").value = "";
  if (!quantityFields.days) formControl(form, "estimatedDays").value = "";
  if (!config.showTransport) {
    formControl(form, "origin").value = "";
    formControl(form, "destination").value = "";
    formControl(form, "cargoType").value = "";
  }
  if (!config.showLocation) clearRequestLocation(form);
}

function toggleField(selector, visible) {
  const el = $(selector);
  if (el) el.hidden = !visible;
}

const requestPayloadBuilders = {
  truck: buildTruckReservationPayload,
  harvest: buildHarvestReservationPayload,
  bagger: buildBaggerReservationPayload,
  default: buildDefaultReservationPayload,
};

function reservationFromForm(form, machine) {
  const config = requestConfigForMachine(machine);
  const mode = config.mode;
  const location = getRequestLocation(form);
  const priceUnit = normalizePriceUnit(machine.priceUnit, machine.category);
  const base = {
    id: `r-${Date.now()}`,
    machineId:    machine.id,
    machineTitle: machine.title,
    owner:        machine.owner,
    ownerId:      machine.ownerId || "",
    category:     machine.category,
    status:       "pending",
    date:         formControl(form, "date").value,
    
    startTime:    clean(formControl(form, "startTime").value),
    endTime:      clean(formControl(form, "endTime").value),
    serviceType:  config.serviceType,
    jobType:      formControl(form, "job").value,
    job:          formControl(form, "job").value,
    notes:        clean(formControl(form, "notes").value),
    accessConditions: clean(formControl(form, "accessConditions").value),
    requestedBy:   currentUserId(),
    requestedByName: currentUserLabel(),
    requestMode:  mode,
    unitPrice:    Number(machine.price),
    priceUnit,
    unidad_precio: priceUnit,
    createdAt:    new Date().toISOString(),
  };
  const buildPayload = requestPayloadBuilders[mode] || requestPayloadBuilders.default;
  return compactRecord({ ...base, ...buildPayload(form, location), ...requestEconomicPayload(form, machine) });
}

function buildTruckReservationPayload(form) {
  return {
    origin:        clean(formControl(form, "origin").value),
    destination:   clean(formControl(form, "destination").value),
    cargoType:     clean(formControl(form, "cargoType").value),
    estimatedTons: requestPositiveNumber(form, "estimatedTons"),
    estimatedBags: requestPositiveNumber(form, "estimatedBags"),
    estimatedTrips: requestPositiveNumber(form, "estimatedTrips"),
    estimatedKm: requestPositiveNumber(form, "estimatedKm"),
    estimatedServiceHours: requestPositiveNumber(form, "estimatedServiceHours"),
    estimatedDays: requestPositiveNumber(form, "estimatedDays"),
  };
}

function buildHarvestReservationPayload(form, location) {
  return {
    crop:       clean(formControl(form, "crop").value),
    hectares:   requestPositiveNumber(form, "hectares"),
    estimatedTons: requestPositiveNumber(form, "estimatedTons"),
    estimatedBags: requestPositiveNumber(form, "estimatedBags"),
    estimatedTrips: requestPositiveNumber(form, "estimatedTrips"),
    estimatedKm: requestPositiveNumber(form, "estimatedKm"),
    estimatedServiceHours: requestPositiveNumber(form, "estimatedServiceHours"),
    estimatedDays: requestPositiveNumber(form, "estimatedDays"),
    field:      location?.address,
    fieldParts: parseFieldParts(location?.address),
    location,
  };
}

function buildBaggerReservationPayload(form, location) {
  return {
    grainType:     clean(formControl(form, "grainType").value),
    estimatedTons: requestPositiveNumber(form, "estimatedTons"),
    estimatedBags: requestPositiveNumber(form, "estimatedBags"),
    estimatedKm: requestPositiveNumber(form, "estimatedKm"),
    estimatedServiceHours: requestPositiveNumber(form, "estimatedServiceHours"),
    estimatedDays: requestPositiveNumber(form, "estimatedDays"),
    field:         location?.address,
    fieldParts:    parseFieldParts(location?.address),
    location,
  };
}

function buildDefaultReservationPayload(form, location) {
  const jobType = clean(formControl(form, "job").value);
  const jobOther = clean(formControl(form, "jobOther").value);
  return {
    dateEnd:      clean(formControl(form, "dateEnd").value),
    dateFlexible: !clean(formControl(form, "dateEnd").value),
    hectares:     requestPositiveNumber(form, "hectares"),
    estimatedTons: requestPositiveNumber(form, "estimatedTons"),
    estimatedBags: requestPositiveNumber(form, "estimatedBags"),
    estimatedTrips: requestPositiveNumber(form, "estimatedTrips"),
    estimatedKm: requestPositiveNumber(form, "estimatedKm"),
    estimatedServiceHours: requestPositiveNumber(form, "estimatedServiceHours"),
    estimatedDays: requestPositiveNumber(form, "estimatedDays"),
    jobOther,
    job:          jobType === "Otros" && jobOther ? `${jobType}: ${jobOther}` : jobType,
    field:        location?.address,
    fieldParts:   parseFieldParts(location?.address),
    location,
    urgency:      clean(formControl(form, "urgency").value),
  };
}

function requestPositiveNumber(form, name) {
  const value = Number(formControl(form, name)?.value);
  return Number.isFinite(value) && value > 0 ? value : null;
}

function compactRecord(record) {
  return Object.fromEntries(Object.entries(record).filter(([, value]) => {
    if (value === "" || value === null || value === undefined) return false;
    if (typeof value === "number" && !Number.isFinite(value)) return false;
    if (typeof value === "object" && !Array.isArray(value) && Object.values(value).every((v) => !v)) return false;
    return true;
  }));
}
function defaultJobForMachine(machine) {
  return defaultJobByCategory[machine.category] || "Otros";
}

function bindLocationPicker() {
  const modal = $("#location-picker-modal");
  if (!modal) return;
  $("#location-picker-close")?.addEventListener("click", closeLocationPicker);
  $("#location-picker-cancel")?.addEventListener("click", closeLocationPicker);
  $("#location-confirm-btn")?.addEventListener("click", confirmLocationPicker);
  $("#location-current-btn")?.addEventListener("click", useCurrentLocation);
  $("#location-retry-btn")?.addEventListener("click", retryLocationMap);
  $("#location-manual-use")?.addEventListener("click", useManualCoordinates);
  $("#location-search-form")?.addEventListener("submit", submitLocationSearch);
  $("#location-search-input")?.addEventListener("input", handleLocationSearchInput);
  $("#location-search-results")?.addEventListener("click", (event) => {
    const button = event.target.closest(".location-result-btn");
    if (!button) return;
    setLocationSelection(Number(button.dataset.lat), Number(button.dataset.lon), button.dataset.address, false, { pan: true, updateSearch: true });
    hideLocationSearchResults();
  });
  modal.addEventListener("click", (e) => {
    if (e.target.id === "location-picker-modal") closeLocationPicker();
  });
}

function openLocationPicker(form) {
  locationPickerState.form = form;
  locationPickerState.selected = getRequestLocation(form);
  locationPickerState.searchTimer = null;
  locationPickerState.reverseToken = 0;
  $("#location-picker-modal").hidden = false;
  $("#location-search-input").value = locationPickerState.selected?.address || "";
  hideLocationSearchResults();
  setLocationPickerStatus("Busca una direccion o toca el mapa para marcar el punto del trabajo.");
  setLocationMapUnavailable(false);
  updateLocationSelectionUI(locationPickerState.selected);

  if (!initLocationMap()) {
    setLocationMapUnavailable(true);
    updateLocationConfirmState();
    return;
  }

  locationPickerState.operationCenter = profileBaseLocation();
  updateOperationCircle();
  const current = locationPickerState.selected;
  const center = current ? [current.latitude, current.longitude] : (locationPickerState.operationCenter ? [locationPickerState.operationCenter.latitude, locationPickerState.operationCenter.longitude] : [-34.6037, -58.3816]);
  locationPickerState.map.setView(center, current ? 15 : (locationPickerState.operationCenter ? 9 : 6));
  if (current) {
    setLocationSelection(current.latitude, current.longitude, current.address, false, { pan: false, updateSearch: true });
  } else {
    clearLocationPickerMarker();
  }
  setTimeout(() => locationPickerState.map?.invalidateSize(), 80);
}

function initLocationMap() {
  if (locationPickerState.map) return true;
  if (!window.L) return false;
  try {
    const map = L.map("location-map", { zoomControl: true }).setView([-34.6037, -58.3816], 6);
    const tiles = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap",
    }).addTo(map);
    tiles.on("tileerror", () => {
      setLocationPickerStatus("El mapa puede estar cargando con problemas. Tambien podes ingresar coordenadas manualmente.");
      $("#location-manual-panel").hidden = false;
    });
    map.on("click", (event) => {
      setLocationSelection(event.latlng.lat, event.latlng.lng, formatCoordinates(event.latlng.lat, event.latlng.lng), true, { pan: false, updateSearch: true });
    });
    locationPickerState.map = map;
    return true;
  } catch {
    return false;
  }
}

function retryLocationMap() {
  setLocationMapUnavailable(false);
  if (locationPickerState.map) {
    locationPickerState.map.invalidateSize();
    return;
  }
  if (!initLocationMap()) {
    setLocationMapUnavailable(true);
    return;
  }
  updateOperationCircle();
  const current = locationPickerState.selected;
  const base = locationPickerState.operationCenter || profileBaseLocation();
  locationPickerState.map.setView(current ? [current.latitude, current.longitude] : (base ? [base.latitude, base.longitude] : [-34.6037, -58.3816]), current ? 15 : (base ? 9 : 6));
  if (current) setLocationSelection(current.latitude, current.longitude, current.address, false, { pan: false, updateSearch: true });
  setTimeout(() => locationPickerState.map?.invalidateSize(), 80);
}

function setLocationMapUnavailable(isUnavailable) {
  $("#location-map").hidden = isUnavailable;
  $("#location-map-error").hidden = !isUnavailable;
  $("#location-manual-panel").hidden = !isUnavailable;
  if (isUnavailable) setLocationPickerStatus("No pudimos cargar el mapa. Podes reintentar o ingresar coordenadas manualmente.");
}

function clearLocationPickerMarker() {
  if (locationPickerState.marker && locationPickerState.map) {
    locationPickerState.marker.remove();
  }
  locationPickerState.marker = null;
  locationPickerState.selected = null;
  updateLocationSelectionUI(null);
}

function setLocationSelection(latitude, longitude, address = "Ubicacion seleccionada", shouldReverseGeocode = false, options = {}) {
  if (!isValidCoordinate(latitude, longitude)) {
    setLocationPickerStatus("Las coordenadas ingresadas no son validas.");
    return;
  }
  const location = {
    address: clean(address) || formatCoordinates(latitude, longitude),
    latitude: Number(latitude),
    longitude: Number(longitude),
  };
  locationPickerState.selected = location;
  const latLng = [location.latitude, location.longitude];
  if (locationPickerState.map && window.L) {
    if (!locationPickerState.marker) {
      locationPickerState.marker = L.marker(latLng, { draggable: true }).addTo(locationPickerState.map);
      locationPickerState.marker.on("dragend", () => {
        const next = locationPickerState.marker.getLatLng();
        setLocationSelection(next.lat, next.lng, formatCoordinates(next.lat, next.lng), true, { pan: false, updateSearch: true });
      });
    } else {
      locationPickerState.marker.setLatLng(latLng);
    }
    if (options.pan !== false) locationPickerState.map.setView(latLng, Math.max(locationPickerState.map.getZoom(), 15));
  }
  updateLocationSelectionUI(location, options.updateSearch !== false);
  setLocationPickerStatus("Ubicacion seleccionada. Podes ajustar el marcador o confirmar.");
  if (shouldReverseGeocode) reverseGeocodeLocation(location.latitude, location.longitude);
}

function updateLocationSelectionUI(location, updateSearch = true) {
  const hasLocation = Boolean(location && isValidCoordinate(location.latitude, location.longitude));
  const info = $("#location-selected-info");
  if (info) info.innerHTML = hasLocation ? locationRadiusInfoMarkup(location) : '<strong id="location-selected-address">Sin ubicacion seleccionada</strong>';
  $("#location-selected-lat").textContent = hasLocation ? Number(location.latitude).toFixed(6) : "-";
  $("#location-selected-lon").textContent = hasLocation ? Number(location.longitude).toFixed(6) : "-";
  $("#location-manual-lat").value = hasLocation ? Number(location.latitude).toFixed(6) : "";
  $("#location-manual-lon").value = hasLocation ? Number(location.longitude).toFixed(6) : "";
  if (updateSearch) $("#location-search-input").value = hasLocation ? location.address : "";
  updateLocationConfirmState();
}

function updateOperationCircle(center = locationPickerState.operationCenter || profileBaseLocation()) {
  if (!locationPickerState.map || !window.L) return;
  if (locationPickerState.operationCircle) {
    locationPickerState.operationCircle.remove();
    locationPickerState.operationCircle = null;
  }
  if (locationPickerState.operationCenterMarker) {
    locationPickerState.operationCenterMarker.remove();
    locationPickerState.operationCenterMarker = null;
  }
  if (!center || !isValidCoordinate(center.latitude, center.longitude)) return;
  locationPickerState.operationCenter = center;
  const latLng = [Number(center.latitude), Number(center.longitude)];
  locationPickerState.operationCircle = L.circle(latLng, {
    radius: profileOperationRadiusKm() * 1000,
    color: "#38761d",
    weight: 2,
    fillColor: "#22C55E",
    fillOpacity: 0.12,
    interactive: false,
  }).addTo(locationPickerState.map);
  locationPickerState.operationCenterMarker = L.circleMarker(latLng, {
    radius: 5,
    color: "#1f5f13",
    weight: 2,
    fillColor: "#ffffff",
    fillOpacity: 1,
    interactive: false,
  }).addTo(locationPickerState.map);
}

function locationRadiusInfoMarkup(location) {
  const info = locationRadiusInfo(location);
  if (!info) {
    return `<strong id="location-selected-address">${escapeHTML(location.address || "Ubicacion seleccionada")}</strong>`;
  }
  return `
    <strong id="location-selected-address">${escapeHTML(location.address || "Ubicacion seleccionada")}</strong>
    <div class="location-radius-card ${info.inside ? "inside" : "outside"}">
      <span><i class="fa-solid fa-route"></i> Distancia: <strong>${info.distanceLabel}</strong></span>
      <span><i class="fa-solid ${info.inside ? "fa-circle-check" : "fa-circle-exclamation"}"></i> ${info.statusLabel}</span>
      ${info.inside ? "" : `<span>Radio configurado: <strong>${info.radiusLabel}</strong></span>`}
      <span><i class="fa-regular fa-clock"></i> Tiempo estimado: <strong>${info.timeLabel}</strong></span>
    </div>
  `;
}

function locationRadiusInfo(location) {
  const center = locationPickerState.operationCenter || profileBaseLocation();
  if (!center || !location || !isValidCoordinate(center.latitude, center.longitude) || !isValidCoordinate(location.latitude, location.longitude)) return null;
  const distance = haversineKm(center, location);
  const radius = profileOperationRadiusKm();
  const inside = distance <= radius;
  const travelMinutes = estimatedTravelMinutes(distance);
  return {
    inside,
    distanceLabel: `${formatKm(distance)} km`,
    radiusLabel: `${radius} km`,
    timeLabel: travelMinutes ? `${formatDurationMinutes(travelMinutes)} aprox.` : "No disponible",
    statusLabel: inside ? "Dentro de tu radio de operacion" : "Fuera de tu radio de operacion",
  };
}

function updateLocationConfirmState() {
  const location = locationPickerState.selected;
  $("#location-confirm-btn").disabled = !(location && isValidCoordinate(location.latitude, location.longitude));
}

function handleLocationSearchInput(event) {
  const query = clean(event.target.value);
  window.clearTimeout(locationPickerState.searchTimer);
  if (!query) {
    hideLocationSearchResults();
    return;
  }
  const coordinates = parseCoordinateQuery(query);
  if (coordinates) {
    locationPickerState.searchTimer = window.setTimeout(() => {
      setLocationSelection(coordinates.latitude, coordinates.longitude, formatCoordinates(coordinates.latitude, coordinates.longitude), true, { pan: true, updateSearch: true });
      hideLocationSearchResults();
    }, 350);
    return;
  }
  if (query.length < 3) {
    hideLocationSearchResults();
    return;
  }
  locationPickerState.searchTimer = window.setTimeout(() => searchLocationQuery(query), 450);
}

function submitLocationSearch(event) {
  event.preventDefault();
  const query = clean($("#location-search-input").value);
  if (!query) return;
  const coordinates = parseCoordinateQuery(query);
  if (coordinates) {
    setLocationSelection(coordinates.latitude, coordinates.longitude, formatCoordinates(coordinates.latitude, coordinates.longitude), true, { pan: true, updateSearch: true });
    hideLocationSearchResults();
    return;
  }
  searchLocationQuery(query, true);
}

async function searchLocationQuery(query, autoSelectFirst = false) {
  setLocationPickerStatus("Buscando ubicacion...");
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=6&addressdetails=0&q=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error("search failed");
    const results = await response.json();
    if (!Array.isArray(results) || results.length === 0) {
      hideLocationSearchResults();
      setLocationPickerStatus("No encontramos resultados. Proba con otra direccion o coordenadas.");
      return;
    }
    if (autoSelectFirst) {
      selectLocationSearchResult(results[0]);
      return;
    }
    renderLocationSearchResults(results);
    setLocationPickerStatus("Selecciona un resultado o toca el mapa.");
  } catch {
    hideLocationSearchResults();
    setLocationPickerStatus("No pudimos buscar esa direccion. Podes ingresar coordenadas manualmente.");
    $("#location-manual-panel").hidden = false;
  }
}

function renderLocationSearchResults(results) {
  const panel = $("#location-search-results");
  panel.innerHTML = results.map((item) => {
    const lat = Number(item.lat);
    const lon = Number(item.lon);
    const address = clean(item.display_name) || formatCoordinates(lat, lon);
    return `
      <button class="location-result-btn" type="button" data-lat="${lat}" data-lon="${lon}" data-address="${escapeHTML(address)}">
        <span>${escapeHTML(address)}</span>
        <small>${formatCoordinates(lat, lon)}</small>
      </button>
    `;
  }).join("");
  panel.hidden = false;
}

function selectLocationSearchResult(item) {
  const latitude = Number(item.lat);
  const longitude = Number(item.lon);
  const address = clean(item.display_name) || formatCoordinates(latitude, longitude);
  setLocationSelection(latitude, longitude, address, false, { pan: true, updateSearch: true });
  hideLocationSearchResults();
}

function hideLocationSearchResults() {
  const panel = $("#location-search-results");
  if (!panel) return;
  panel.hidden = true;
  panel.innerHTML = "";
}

async function reverseGeocodeLocation(latitude, longitude) {
  const token = (locationPickerState.reverseToken || 0) + 1;
  locationPickerState.reverseToken = token;
  setLocationPickerStatus("Buscando direccion aproximada...");
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(latitude)}&lon=${encodeURIComponent(longitude)}&zoom=16&addressdetails=0`);
    if (!response.ok) throw new Error("reverse geocode failed");
    const data = await response.json();
    if (locationPickerState.reverseToken !== token || !locationPickerState.selected) return;
    const fallback = formatCoordinates(latitude, longitude);
    locationPickerState.selected.address = clean(data.display_name) || fallback;
    updateLocationSelectionUI(locationPickerState.selected, true);
    setLocationPickerStatus("Direccion aproximada encontrada.");
  } catch {
    if (!locationPickerState.selected) return;
    locationPickerState.selected.address = formatCoordinates(latitude, longitude);
    updateLocationSelectionUI(locationPickerState.selected, true);
    setLocationPickerStatus("No se encontro direccion cercana. Se guardaran las coordenadas.");
  }
}

function useCurrentLocation() {
  if (!navigator.geolocation) {
    setLocationPickerStatus("Tu navegador no permite obtener la ubicacion actual.");
    return;
  }
  setLocationPickerStatus("Solicitando ubicacion actual...");
  navigator.geolocation.getCurrentPosition((position) => {
    const { latitude, longitude } = position.coords;
    locationPickerState.operationCenter = { latitude, longitude, address: "Mi ubicacion actual" };
    updateOperationCircle();
    if (locationPickerState.map) locationPickerState.map.setView([latitude, longitude], 15);
    setLocationSelection(latitude, longitude, formatCoordinates(latitude, longitude), true, { pan: false, updateSearch: true });
  }, () => {
    setLocationPickerStatus("No pudimos acceder a tu ubicacion actual. Podes tocar el mapa o ingresar coordenadas.");
    $("#location-manual-panel").hidden = false;
  }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 });
}

function useManualCoordinates() {
  const latitude = Number($("#location-manual-lat").value);
  const longitude = Number($("#location-manual-lon").value);
  if (!isValidCoordinate(latitude, longitude)) {
    setLocationPickerStatus("Ingresa una latitud y longitud validas.");
    return;
  }
  setLocationSelection(latitude, longitude, formatCoordinates(latitude, longitude), true, { pan: true, updateSearch: true });
}

function confirmLocationPicker() {
  const form = locationPickerState.form;
  const location = locationPickerState.selected;
  if (!form || !location || !isValidCoordinate(location.latitude, location.longitude)) {
    setLocationPickerStatus("Selecciona un punto valido antes de confirmar.");
    return;
  }
  setRequestLocation(form, location);
  updateRequestEstimate(form);
  closeLocationPicker();
  hideRequestError();
}

function closeLocationPicker() {
  $("#location-picker-modal").hidden = true;
  hideLocationSearchResults();
  locationPickerState.form = null;
}

function setLocationPickerStatus(message) {
  $("#location-picker-status").textContent = message;
}

function parseCoordinateQuery(query) {
  const match = clean(query).match(/^(-?\d+(?:\.\d+)?)\s*[,;\s]\s*(-?\d+(?:\.\d+)?)$/);
  if (!match) return null;
  const latitude = Number(match[1]);
  const longitude = Number(match[2]);
  return isValidCoordinate(latitude, longitude) ? { latitude, longitude } : null;
}

function isValidCoordinate(latitude, longitude) {
  return Number.isFinite(Number(latitude))
    && Number.isFinite(Number(longitude))
    && Math.abs(Number(latitude)) <= 90
    && Math.abs(Number(longitude)) <= 180;
}

function formatCoordinates(latitude, longitude) {
  return `${Number(latitude).toFixed(6)}, ${Number(longitude).toFixed(6)}`;
}

function setRequestLocation(form, location) {
  const address = clean(location.address) || formatCoordinates(location.latitude, location.longitude);
  formControl(form, "field").value = address;
  formControl(form, "locationAddress").value = address;
  formControl(form, "locationLatitude").value = String(location.latitude);
  formControl(form, "locationLongitude").value = String(location.longitude);
  updateRequestLocationButton(address);
}

function clearRequestLocation(form) {
  formControl(form, "field").value = "";
  formControl(form, "locationAddress").value = "";
  formControl(form, "locationLatitude").value = "";
  formControl(form, "locationLongitude").value = "";
  updateRequestLocationButton("");
}

function resetRequestLocation(form) {
  clearRequestLocation(form);
  locationPickerState.selected = null;
}

function updateRequestLocationButton(address) {
  const button = $("#request-location-picker");
  const label = $("#request-location-text");
  const hasAddress = Boolean(clean(address));
  button.classList.toggle("has-location", hasAddress);
  label.textContent = hasAddress ? address : "Seleccionar ubicacion";
}

function getRequestLocation(form) {
  const address = clean(formControl(form, "locationAddress").value || formControl(form, "field").value);
  const latitude = Number(formControl(form, "locationLatitude").value);
  const longitude = Number(formControl(form, "locationLongitude").value);
  if (!address || !isValidCoordinate(latitude, longitude)) return null;
  return { address, latitude, longitude };
}
function closeRequestModal() {
  $("#request-modal").hidden = true;
  hideRequestError();
}

function toggleJobOther(form) {
  const job = formControl(form, "job");
  const jobOther = formControl(form, "jobOther");
  const isOther = job.value === "Otros";
  $("#job-other-field").hidden = !isOther;
  if (!isOther) jobOther.value = "";
}

function syncRequestDateRange(form) {
  const dateStart = formControl(form, "date").value;
  const dateEnd = formControl(form, "dateEnd");
  if (!dateEnd) return;
  dateEnd.min = dateStart;
  if (dateEnd.value && dateStart && dateEnd.value < dateStart) dateEnd.value = "";
}

function updateRequestEstimate(form) {
  const estimate = $("#request-estimate");
  if (estimate) {
    estimate.hidden = true;
    estimate.textContent = "";
  }
  updateRequestEconomicSummary(form, findMachine(formControl(form, "machineId")?.value));
}

function requestDurationEstimateLabel(form) {
  const hectaresField = $(".request-hectares-field");
  const hectares = Number(formControl(form, "hectares").value);
  if (!hectaresField || hectaresField.hidden || !Number.isFinite(hectares) || hectares <= 0) return "";
  const hours = Math.max(1, Math.ceil(hectares / 18));
  const label = hours <= 8 ? "1 jornada de trabajo" : `${Math.ceil(hours / 8)} jornadas de trabajo`;
  return `${label} � aprox. ${hours} h`;
}
function updateRequestEconomicSummary(form, machine) {
  const summary = $("#request-economic-summary");
  if (!summary) return;
  const context = requestEconomicContext(form, machine);
  const total = $("#request-estimated-total");
  const lines = $("#request-economic-lines");
  if (!context) {
    total.textContent = "Sin datos suficientes";
    lines.innerHTML = "";
    return;
  }
  total.textContent = formatEstimatedMoney(context.estimate.estimatedValue);
  const lineItems = economicSummaryLines(context, form);
  const durationLabel = requestDurationEstimateLabel(form);
  if (durationLabel) lineItems.push(["Duracion estimada", durationLabel]);
  lines.innerHTML = lineItems.map(([label, value]) => `
    <div class="economic-summary-line"><span>${escapeHTML(label)}</span><strong>${escapeHTML(value)}</strong></div>
  `).join("");
}

const requestValidators = {
  truck: validateTruckRequest,
  harvest: validateHarvestRequest,
  bagger: validateBaggerRequest,
  default: validateDefaultRequest,
};

function validateRequestForm(form) {
  const mode = form.dataset.requestMode || "default";
  toggleJobOther(form);
  syncRequestDateRange(form);

  if (!formControl(form, "date").value) return { valid: false, message: "Elegi una fecha para el trabajo." };
  const startTime = clean(formControl(form, "startTime").value);
  const endTime = clean(formControl(form, "endTime").value);
  if (!startTime) return { valid: false, message: "Elegi una hora de inicio." };
  if (endTime && endTime <= startTime) return { valid: false, message: "La hora estimada de finalizacion debe ser posterior al inicio." };

  const validateVisibleFields = requestValidators[mode] || requestValidators.default;
  const visibleResult = validateVisibleFields(form);
  if (!visibleResult.valid) return visibleResult;
  return validateEconomicQuantity(form);
}

function validateTruckRequest(form) {
  if (!clean(formControl(form, "origin").value)) return { valid: false, message: "Indica el origen del viaje." };
  if (!clean(formControl(form, "destination").value)) return { valid: false, message: "Indica el destino del viaje." };
  if (!clean(formControl(form, "cargoType").value)) return { valid: false, message: "Indica el tipo de carga." };
  return { valid: true, message: "" };
}

function validateHarvestRequest(form) {
  if (!clean(formControl(form, "crop").value)) return { valid: false, message: "Indica el cultivo." };
  if (!getRequestLocation(form)) return { valid: false, message: "Selecciona la ubicacion exacta en el mapa." };
  return { valid: true, message: "" };
}

function validateBaggerRequest(form) {
  if (!clean(formControl(form, "grainType").value)) return { valid: false, message: "Indica el tipo de grano." };
  if (!getRequestLocation(form)) return { valid: false, message: "Selecciona la ubicacion exacta en el mapa." };
  return { valid: true, message: "" };
}

function validateDefaultRequest(form) {
  if (!formControl(form, "job").value) return { valid: false, message: "Selecciona el trabajo solicitado." };

  const dateEnd = formControl(form, "dateEnd").value;
  if (dateEnd && dateEnd < formControl(form, "date").value) {
    return { valid: false, message: "La fecha limite no puede ser anterior al inicio estimado." };
  }

  if (!getRequestLocation(form)) {
    return { valid: false, message: "Selecciona la ubicacion exacta en el mapa." };
  }

  return { valid: true, message: "" };
}

function validateEconomicQuantity(form) {
  const machine = findMachine(formControl(form, "machineId")?.value);
  const unit = normalizePriceUnit(machine?.priceUnit, machine?.category);
  const labels = {
    hectarea: "hectareas a trabajar",
    tonelada: "toneladas aproximadas",
    bolsa: "bolsas aproximadas",
    viaje: "viajes estimados",
    kilometro: "kilometros estimados",
    tonelada_kilometro: "toneladas y kilometros estimados",
    hora: "horas estimadas",
    dia: "dias estimados",
  };
  if (unit === "fijo") return { valid: true, message: "" };
  if (unit === "tonelada_kilometro") {
    const tons = Number(formControl(form, "estimatedTons").value);
    const km = Number(formControl(form, "estimatedKm").value);
    if (!Number.isFinite(tons) || tons <= 0 || !Number.isFinite(km) || km <= 0) {
      return { valid: false, message: "Ingresa toneladas y kilometros estimados con numeros mayores a 0." };
    }
    return { valid: true, message: "" };
  }
  const quantity = requestQuantityForUnit(form, unit);
  if (!Number.isFinite(quantity) || quantity <= 0) {
    return { valid: false, message: `Ingresa ${labels[unit] || "la cantidad estimada"} con un numero mayor a 0.` };
  }
  return { valid: true, message: "" };
}

function showRequestError(message) {
  const error = $("#request-error");
  error.textContent = message;
  error.hidden = false;
}

function hideRequestError() {
  const error = $("#request-error");
  if (!error) return;
  error.textContent = "";
  error.hidden = true;
}

/* ─── REPORT MODAL ─── */
function bindReportModal() {
  const form = $("#report-form");
  if (!form) return;

  formControl(form, "reason").addEventListener("change", () => toggleReportOther(form));
  form.addEventListener("input", hideReportError);
  form.addEventListener("submit", submitReportForm);
  $("#report-close").addEventListener("click", closeReportModal);
  $("#report-cancel").addEventListener("click", closeReportModal);
  $("#report-modal").addEventListener("click", (e) => {
    if (e.target.id === "report-modal") closeReportModal();
  });
}

function openReportModal(machineId) {
  const machine = findMachine(machineId);
  const form = $("#report-form");
  if (!machine || !form) return;
  form.reset();
  formControl(form, "machineId").value = machine.id;
  $("#report-target").textContent = `${machine.title} � ${machine.owner}`;
  toggleReportOther(form);
  hideReportError();
  $("#report-modal").hidden = false;
  formControl(form, "reason").focus();
}

function closeReportModal() {
  $("#report-modal").hidden = true;
  hideReportError();
}

function toggleReportOther(form) {
  const isOther = formControl(form, "reason").value === "Otro";
  const details = formControl(form, "details");
  $("#report-other-field").hidden = !isOther;
  if (!isOther) details.value = "";
}

function submitReportForm(e) {
  e.preventDefault();
  const form = e.currentTarget;
  toggleReportOther(form);
  const reason = clean(formControl(form, "reason").value);
  const details = clean(formControl(form, "details").value);
  if (!reason) {
    showReportError("Selecciona un motivo para enviar la denuncia.");
    return;
  }
  if (reason === "Otro" && !details) {
    showReportError("Contanos brevemente el motivo de la denuncia.");
    return;
  }
  closeReportModal();
  showToast("Denuncia enviada para revision.");
}

function showReportError(message) {
  const error = $("#report-error");
  error.textContent = message;
  error.hidden = false;
}

function hideReportError() {
  const error = $("#report-error");
  if (!error) return;
  error.textContent = "";
  error.hidden = true;
}
/* ─── CONFIRM MODAL ─── */
function confirmAction(eyebrow, title, body, onConfirm, confirmLabel = "Confirmar") {
  pendingAction = onConfirm;
  $("#confirm-eyebrow").textContent = eyebrow;
  $("#confirm-title").textContent   = title;
  $("#confirm-body").textContent    = body;
  $("#confirm-accept").textContent  = confirmLabel;
  $("#confirm-modal").hidden = false;
}

function closeConfirmModal() {
  $("#confirm-modal").hidden = true;
  pendingAction = null;
}

function bindContactModal() {
  $("#contact-button")?.addEventListener("click", openContactModal);
  $("#contact-close")?.addEventListener("click", closeContactModal);
  $("#contact-modal")?.addEventListener("click", (event) => {
    if (event.target.id === "contact-modal") closeContactModal();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !$("#contact-modal")?.hidden) closeContactModal();
  });
}

function openContactModal() {
  const modal = $("#contact-modal");
  if (modal) modal.hidden = false;
}

function closeContactModal() {
  const modal = $("#contact-modal");
  if (modal) modal.hidden = true;
}
function bindConfirmModal() {
  $("#confirm-close").addEventListener("click", closeConfirmModal);
  $("#confirm-cancel").addEventListener("click", closeConfirmModal);
  $("#confirm-modal").addEventListener("click", (e) => {
    if (e.target.id === "confirm-modal") closeConfirmModal();
  });
  $("#confirm-accept").addEventListener("click", () => {
    if (typeof pendingAction === "function") pendingAction();
    closeConfirmModal();
  });
}

/* ─── BADGES ─── */
/* NOTIFICACIONES */
function bindNotificationCenter() {
  $("#notification-toggle")?.addEventListener("click", toggleNotificationCenter);
  $("#notification-close")?.addEventListener("click", closeNotificationCenter);
  $("#notification-backdrop")?.addEventListener("click", closeNotificationCenter);
  $("#notification-mark-read")?.addEventListener("click", markAllNotificationsRead);
  $("#notification-permission")?.addEventListener("click", requestBrowserNotificationPermission);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && isNotificationCenterOpen()) closeNotificationCenter();
  });
}

function bindPresenceTracking() {
  ["click", "keydown", "mousemove", "touchstart", "scroll"].forEach((eventName) => {
    window.addEventListener(eventName, () => { lastUserActivityAt = Date.now(); }, { passive: true });
  });
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) renderNotifications();
  });
}

function registerNotificationServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  navigator.serviceWorker.register("/sw.js").catch(() => {});
  navigator.serviceWorker.addEventListener("message", (event) => {
    if (event.data?.type === "NEXUDRIVE_NOTIFICATION_CLICK") openNotificationDetail(event.data.notification?.id);
  });
}

function emitAppEvent(eventName, payload = {}) {
  const notification = notificationFromEvent(eventName, payload);
  if (!notification) return null;
  return createNotification(notification);
}


function notificationFromEvent(eventName, payload) {
  const reservation = payload.reservation || {};
  const machine = payload.machine || findMachine(reservation.machineId) || {};
  const machineTitle = clean(reservation.machineTitle || machine.title || "Trabajo");
  const requester = clean(reservation.requestedByName || reservation.requestedBy || currentUserLabel());
  const contractorUserId = clean(reservation.ownerId || machine.ownerId) || currentUserId();
  const requesterUserId = clean(reservation.requestedBy) || currentUserId();
  if (eventName === "job.created") {
    return { user_id: contractorUserId, type: "job_request", title: "Nueva solicitud de trabajo", body: requester + " solicito " + machineTitle + ". Revisala antes de cambiar la oferta.", priority: "HIGH", related_id: reservation.id };
  }
  if (eventName === "job.accepted") {
    return { user_id: requesterUserId, type: "job_accepted", title: "Solicitud aceptada", body: machineTitle + " fue aceptada y ya figura en tus reservas.", priority: "MEDIUM", related_id: reservation.id };
  }
  if (eventName === "job.cancelled") {
    return { user_id: requesterUserId, type: "job_cancelled", title: "Solicitud rechazada", body: machineTitle + " fue rechazada. La fecha original no cambia.", priority: "HIGH", related_id: reservation.id };
  }
  if (eventName === "schedule.proposed") {
    return { user_id: requesterUserId, type: "system", title: "Nuevo horario propuesto", body: "El contratista propuso " + scheduleProposalLabel(reservation.scheduleProposal) + " para " + machineTitle + ".", priority: "MEDIUM", related_id: reservation.id };
  }
  if (eventName === "schedule.accepted") {
    return { user_id: contractorUserId, type: "job_accepted", title: "Horario aceptado", body: machineTitle + " quedo confirmado con el horario propuesto.", priority: "MEDIUM", related_id: reservation.id };
  }
  if (eventName === "schedule.original_kept") {
    return { user_id: contractorUserId, type: "system", title: "Horario original mantenido", body: "El productor mantuvo el horario original de " + machineTitle + ".", priority: "MEDIUM", related_id: reservation.id };
  }
  if (eventName === "message.created") {
    return { user_id: payload.user_id || currentUserId(), type: "message", title: payload.title || "Nuevo mensaje", body: payload.body || "Tenes un mensaje nuevo en la conversacion.", priority: payload.priority || "LOW", related_id: payload.related_id || null };
  }
  return null;
}

function createNotification(input) {
  const notification = {
    id: notificationId(),
    user_id: clean(input.user_id) || currentUserId(),
    type: clean(input.type) || "system",
    title: clean(input.title) || "Nueva notificacion",
    body: clean(input.body),
    priority: normalizeNotificationPriority(input.priority),
    read: false,
    created_at: new Date().toISOString(),
    related_id: clean(input.related_id),
  };
  state.notifications.unshift(notification);
  state.notifications = state.notifications.slice(0, 80);
  saveNotifications();
  handleIncomingNotification(notification);
  return notification;
}

function handleIncomingNotification(notification) {
  renderNotifications();
  updateBadges();
  if (shouldUsePushNotification(notification)) {
    sendBrowserPushNotification(notification);
    return;
  }
  if (isUserActiveInApp()) {
    if (!isNotificationCenterOpen()) showGroupedNotificationToast(notification);
    if (notification.priority === "HIGH" && !isNotificationCenterOpen()) playNotificationSound(notification.type);
  }
}

function showGroupedNotificationToast(notification) {
  notificationToastQueue.push(notification);
  window.clearTimeout(notificationGroupTimer);
  notificationGroupTimer = window.setTimeout(() => {
    const items = notificationToastQueue.splice(0);
    if (!items.length) return;
    const latest = items[items.length - 1];
    const grouped = items.length > 1
      ? { ...latest, title: `${items.length} notificaciones nuevas`, body: "Tenes nueva actividad pendiente en NexuDrive." }
      : latest;
    renderNotificationToast(grouped);
  }, 250);
}

function renderNotificationToast(notification) {
  const toast = $("#notification-toast");
  if (!toast) return;
  toast.innerHTML = `
    <button type="button" data-notification-id="${escapeHTML(notification.id)}">
      <span class="notification-icon"><i class="fa-solid ${notificationIcon(notification.type)}"></i></span>
      <span><strong>${escapeHTML(notification.title)}</strong><p>${escapeHTML(notification.body)}</p></span>
    </button>
  `;
  toast.hidden = false;
  toast.querySelector("button")?.addEventListener("click", () => openNotificationDetail(notification.id));
  window.clearTimeout(notificationToastTimer);
  notificationToastTimer = window.setTimeout(() => { toast.hidden = true; }, 4200);
}

function renderNotifications() {
  const list = $("#notification-list");
  const empty = $("#notification-empty");
  if (!list || !empty) return;
  const notifications = notificationsForCurrentUser();
  empty.hidden = notifications.length > 0;
  list.innerHTML = notifications.map(notificationItemMarkup).join("");
  $$(".notification-item").forEach((item) => item.addEventListener("click", () => openNotificationDetail(item.dataset.notificationId)));
  syncNotificationPermissionButton();
}

function notificationItemMarkup(notification) {
  const priorityClass = notification.priority.toLowerCase();
  return `
    <button class="notification-item ${priorityClass} ${notification.read ? "" : "unread"}" type="button" data-notification-id="${escapeHTML(notification.id)}">
      <span class="notification-icon"><i class="fa-solid ${notificationIcon(notification.type)}"></i></span>
      <span class="notification-copy">
        <span class="notification-meta"><span>${escapeHTML(notification.priority)}</span><span>${timeAgo(notification.created_at)}</span></span>
        <strong>${escapeHTML(notification.title)}</strong>
        <p>${escapeHTML(notification.body)}</p>
      </span>
    </button>
  `;
}

function toggleNotificationCenter() {
  isNotificationCenterOpen() ? closeNotificationCenter() : openNotificationCenter();
}

function openNotificationCenter() {
  const center = $("#notification-center");
  const backdrop = $("#notification-backdrop");
  const toggle = $("#notification-toggle");
  if (!center || !backdrop) return;
  center.classList.add("open");
  center.setAttribute("aria-hidden", "false");
  backdrop.hidden = false;
  toggle?.classList.add("active");
  toggle?.setAttribute("aria-expanded", "true");
  markAllNotificationsRead(true);
}

function closeNotificationCenter() {
  const center = $("#notification-center");
  const backdrop = $("#notification-backdrop");
  const toggle = $("#notification-toggle");
  center?.classList.remove("open");
  center?.setAttribute("aria-hidden", "true");
  if (backdrop) backdrop.hidden = true;
  toggle?.classList.remove("active");
  toggle?.setAttribute("aria-expanded", "false");
}

function isNotificationCenterOpen() {
  return Boolean($("#notification-center")?.classList.contains("open"));
}

function openNotificationDetail(id) {
  const notification = state.notifications.find((item) => item.id === id);
  if (!notification) return;
  notification.read = true;
  saveNotifications();
  renderNotifications();
  updateBadges();
  if (["job_request", "job_accepted", "job_cancelled", "review"].includes(notification.type)) {
    if (notification.type === "job_request") state.offersTab = "solicitudes";
    showScreen(notification.type === "job_request" ? "mis-ofertas" : "reservas");
  }
  closeNotificationCenter();
  const toast = $("#notification-toast");
  if (toast) toast.hidden = true;
}

function markAllNotificationsRead(shouldRender = true) {
  let changed = false;
  notificationsForCurrentUser().forEach((notification) => {
    if (!notification.read) {
      notification.read = true;
      changed = true;
    }
  });
  if (changed) saveNotifications();
  if (shouldRender) renderNotifications();
  updateBadges();
}

async function requestBrowserNotificationPermission() {
  if (!("Notification" in window)) {
    showToast("Este navegador no soporta notificaciones push.");
    return;
  }
  const permission = await Notification.requestPermission();
  syncNotificationPermissionButton();
  showToast(permission === "granted" ? "Avisos del navegador activados." : "No se activaron los avisos del navegador.");
}

function syncNotificationPermissionButton() {
  const button = $("#notification-permission");
  if (!button) return;
  if (!("Notification" in window)) {
    button.hidden = true;
    return;
  }
  button.hidden = Notification.permission === "granted";
}

function shouldUsePushNotification(notification) {
  if (!("Notification" in window)) return false;
  if (Notification.permission !== "granted") return false;
  if (!isPushEligiblePriority(notification)) return false;
  return document.hidden || !isUserActiveInApp();
}

function isPushEligiblePriority(notification) {
  return notification.priority === "HIGH" || (notification.priority === "MEDIUM" && ["job_accepted", "job_cancelled"].includes(notification.type));
}

function sendBrowserPushNotification(notification) {
  if (navigator.serviceWorker?.controller) {
    navigator.serviceWorker.controller.postMessage({ type: "NEXUDRIVE_NOTIFICATION", notification });
    return;
  }
  try {
    new Notification(notification.title, { body: notification.body, tag: notification.related_id || notification.id, data: notification });
  } catch (_) {}
}

function isUserActiveInApp() {
  return !document.hidden && Date.now() - lastUserActivityAt < 60000;
}

function notificationsForCurrentUser() {
  const userId = currentUserId();
  return state.notifications
    .filter((item) => !item.user_id || item.user_id === userId)
    .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
}

function unreadNotificationsCount() {
  return notificationsForCurrentUser().filter((item) => !item.read).length;
}

function normalizeNotificationPriority(priority) {
  const value = clean(priority).toUpperCase();
  return ["HIGH", "MEDIUM", "LOW"].includes(value) ? value : "LOW";
}

function notificationIcon(type) {
  const icons = {
    job_request: "fa-clipboard-list",
    job_accepted: "fa-circle-check",
    job_cancelled: "fa-triangle-exclamation",
    message: "fa-message",
    review: "fa-star",
    system: "fa-circle-info",
  };
  return icons[type] || icons.system;
}

function notificationId() {
  if (crypto?.randomUUID) return crypto.randomUUID();
  return `nt-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function playNotificationSound(type) {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const context = new AudioContext();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const tone = type === "job_cancelled" ? 180 : type === "job_accepted" ? 660 : 880;
    oscillator.type = "sine";
    oscillator.frequency.value = tone;
    gain.gain.setValueAtTime(0.0001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.08, context.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.22);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.24);
  } catch (_) {}
}

function timeAgo(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Ahora";
  const diff = Math.max(0, Date.now() - date.getTime());
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Ahora";
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} h`;
  return formatDate(value);
}

function updateBadges() {
  const pendingAsContractor = state.reservations.filter((reservation) => activeUserOwnsReservationMachine(reservation) && isContractorNegotiationStatus(reservation)).length;
  const pendingVisible = state.reservations.filter((reservation) => visibleReservationForActiveUser(reservation) && isContractorNegotiationStatus(reservation)).length;
  const badge = $("#reservation-badge");
  badge.hidden = pendingVisible === 0;
  badge.textContent = pendingVisible;

  const offersBadge = $("#offers-badge");
  offersBadge.hidden = pendingAsContractor === 0;
  offersBadge.textContent = pendingAsContractor;

  const notificationCount = unreadNotificationsCount();
  const notificationBadge = $("#notification-badge");
  if (notificationBadge) {
    notificationBadge.hidden = notificationCount === 0;
    notificationBadge.textContent = notificationCount > 9 ? "9+" : notificationCount;
  }
}

function saveMachines() {
  localStorage.setItem(STORAGE_KEYS.machines, JSON.stringify(state.machines));
  renderCategoryFilters();
}
function saveReservations() {
  localStorage.setItem(STORAGE_KEYS.reservations, JSON.stringify(state.reservations));
}
function saveRescheduleRequests() {
  localStorage.setItem(STORAGE_KEYS.reschedules, JSON.stringify(state.rescheduleRequests));
}
function saveDelayRecords() {
  localStorage.setItem(STORAGE_KEYS.delays, JSON.stringify(state.delayRecords));
}
function saveReviews() {
  localStorage.setItem(STORAGE_KEYS.reviews, JSON.stringify(state.reviews));
}
function saveAvailabilitySlots() {
  localStorage.setItem(STORAGE_KEYS.availabilitySlots, JSON.stringify(state.availabilitySlots));
}
function saveNotifications() {
  localStorage.setItem(STORAGE_KEYS.notifications, JSON.stringify(state.notifications));
}

function saveAuth() {
  if (state.auth) {
    localStorage.setItem(STORAGE_KEYS.auth, JSON.stringify(state.auth));
    if (devUserSwitcherEnabled && state.auth.devUserId) localStorage.setItem(STORAGE_KEYS.devActiveUser, state.auth.devUserId);
  } else {
    localStorage.removeItem(STORAGE_KEYS.auth);
  }
}
function saveProfile() {
  if (devUserSwitcherEnabled && state.auth?.devUserId) {
    const profiles = readObject(STORAGE_KEYS.devProfiles, {});
    profiles[state.auth.devUserId] = state.profile;
    localStorage.setItem(STORAGE_KEYS.devProfiles, JSON.stringify(profiles));
    return;
  }
  localStorage.setItem("nexudrive_mvp_profile", JSON.stringify(state.profile));
}

function findMachine(id) {
  return state.machines.find((m) => m.id === id);
}
function findAvailabilitySlot(machineId) {
  return state.availabilitySlots.find((slot) => slot.machineId === machineId);
}

function availabilityWindowFromPublishForm(form) {
  const startDate = clean(formControl(form, "availabilityStart")?.value);
  const endDate = clean(formControl(form, "availabilityEnd")?.value);
  const estimatedRaw = clean(formControl(form, "estimatedHours")?.value);
  return {
    startDate,
    endDate,
    estimatedHours: estimatedRaw ? Number(estimatedRaw) : null,
  };
}

function availabilitySlotForMachine(machine) {
  return machine ? findAvailabilitySlot(machine.id) : null;
}

function machineAvailabilityLabel(machine) {
  const slot = availabilitySlotForMachine(machine);
  return slot ? availabilityLabelForSlot(slot) : clean(machine?.availability) || "Disponibilidad a coordinar";
}

function availabilityLabelForSlot(slot) {
  if (!slot?.startDate || !slot?.endDate) return "Ventana flexible";
  const range = slot.startDate === slot.endDate
    ? formatDate(slot.startDate)
    : `${formatDate(slot.startDate)} al ${formatDate(slot.endDate)}`;
  const hours = Number(slot.estimatedHours || 0) > 0 ? ` - ${money(slot.estimatedHours)} h estimadas` : "";
  return `Disponible del ${range}${hours}`;
}

function availabilitySlotStatusLabel(status) {
  return availabilitySlotStatusLabels[status] || status || "Ventana flexible";
}

function availabilitySlotStatusClass(status) {
  const map = {
    available: "status-available-window",
    partially_booked: "status-partial-window",
    unavailable: "status-unavailable-window",
  };
  return map[status] || "status-paused";
}

function slotContainsDate(slot, isoDate) {
  if (!slot || slot.status === "unavailable") return false;
  return clean(slot.startDate) <= isoDate && clean(slot.endDate) >= isoDate;
}

function slotOverlapsDateWindow(slot, fromOffsetDays, toOffsetDays) {
  if (!slot || slot.status === "unavailable") return false;
  const start = offsetISODate(fromOffsetDays);
  const end = offsetISODate(toOffsetDays);
  return clean(slot.startDate) <= end && clean(slot.endDate) >= start;
}

function offsetISODate(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}
function readJSON(key, fallback) {
  try {
    const v = JSON.parse(localStorage.getItem(key));
    return Array.isArray(v) ? v : fallback;
  } catch { return fallback; }
}
function readObject(key, fallback) {
  try {
    const v = JSON.parse(localStorage.getItem(key));
    return v && typeof v === "object" && !Array.isArray(v) ? { ...fallback, ...v } : fallback;
  } catch { return fallback; }
}

/* ─── UTILS ─── */
function clean(value) { return String(value || "").trim(); }

function textKey(value) { return clean(value).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""); }

function hashCode(value) {
  return Array.from(String(value || "")).reduce((hash, char) => ((hash << 5) - hash) + char.charCodeAt(0), 0);
}

function formControl(form, name) {
  return form.elements.namedItem(name);
}

function escapeHTML(value) {
  return clean(value).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[c]));
}

function money(value) { return Number(value || 0).toLocaleString("es-AR"); }

function formatDateRange(reservation) {
  const start = formatDate(reservation.date);
  const time = reservationTimeLabel(reservation);
  const startLabel = time ? `${start} � ${time}` : start;
  if (reservation.dateFlexible) return `${startLabel} - flexible`;
  if (reservation.dateEnd) return `${startLabel} - ${formatDate(reservation.dateEnd)}`;
  return startLabel;
}

function reservationTimeLabel(reservation) {
  const startTime = clean(reservation.startTime);
  const endTime = clean(reservation.endTime);
  if (startTime && endTime && endTime !== startTime) return `${startTime} a ${endTime} hs`;
  if (startTime) return `${startTime} hs`;
  return "";
}

function formatDate(value) {
  if (!value) return "-";
  const d = new Date(String(value).includes("T") ? value : `${value}T12:00:00`);
  if (isNaN(d.getTime())) return value;
  return d.toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" });
}

function formatTime(value) {
  if (!value) return "";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
}
function formatUrgency(value) {
  const map = {
    flexible: "Flexible",
    "esta-semana": "Esta semana",
    manana: "Manana",
    hoy: "Hoy mismo",
    baja: "Flexible",
    media: "Esta semana",
    alta: "Hoy mismo",
  };
  return map[clean(value)] || "";
}

function urgencyClass(value) {
  const map = {
    flexible: "flexible",
    "esta-semana": "semana",
    manana: "manana",
    hoy: "hoy",
    baja: "flexible",
    media: "semana",
    alta: "hoy",
  };
  return map[clean(value)] || "flexible";
}
function parseFieldParts(value) {
  const [field = "", zone = "", district = ""] = clean(value).split("/").map((part) => clean(part));
  return { field, zone, district };
}

function machineSupportsPlate(category) {
  const cat = clean(category);
  return Boolean(cat) && cat !== "Dron";
}
function normalizePlate(value) {
  return clean(value).toUpperCase().replace(/\s+/g, " ");
}
function pluralCategory(cat) {
  const map = { Tractor: "Tractores", Sembradora: "Sembradoras", Cosechadora: "Cosechadoras", Pulverizadora: "Pulverizadoras", Dron: "Drones", Camion: "Camiones", Embolsadora: "Embolsadoras", Acoplado: "Acoplados", Tolva: "Tolvas" };
  return map[cat] || cat;
}

function setButtonLoading(btn, isLoading, loadingText) {
  if (!btn) return;
  const label = btn.querySelector(".btn-label") || btn;
  if (isLoading) {
    btn.dataset.originalLabel = label.innerHTML;
    label.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> ${escapeHTML(loadingText || "Procesando...")}`;
    btn.disabled = true;
  } else {
    if (btn.dataset.originalLabel) {
      label.innerHTML = btn.dataset.originalLabel;
      delete btn.dataset.originalLabel;
    }
    btn.disabled = false;
  }
}

let toastTimer = null;
function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.hidden = false;
  // Re-trigger animation
  toast.style.animation = "none";
  toast.offsetHeight; // reflow
  toast.style.animation = "";
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast.hidden = true; }, 2800);
}
