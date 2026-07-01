"use strict";

const STORAGE_KEYS = {
  machines: "nexudrive_mvp_machines",
  reservations: "nexudrive_mvp_reservations",
  reschedules: "nexudrive_mvp_reschedules",
  delays: "nexudrive_mvp_delays",
  availabilitySlots: "nexudrive_mvp_availability_slots",
  auth: "nexudrive_mvp_auth",
  theme: "nexudrive_mvp_theme",
};

const seedMachines = [
  {
    id: "m-tractor-6120",
    title: "Tractor John Deere 6120J",
    category: "Tractor",
    price: 35,
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
    price: 28,
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
    price: 18,
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
  Tolva: ["viaje", "tonelada", "hora"],
  Tractor: ["hora", "dia", "hectarea"],
  Otros: ["hectarea", "tonelada", "viaje", "hora", "dia", "bolsa", "fijo"],
  default: ["hectarea", "tonelada", "viaje", "hora", "dia", "bolsa", "fijo"],
};
const statusLabels = {
  pending:  "Pendiente",
  accepted: "Aceptada",
  working:  "En curso",
  done:     "Finalizada",
  rejected: "Rechazada",
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
  availabilitySlots: readJSON(STORAGE_KEYS.availabilitySlots, []),
  auth:         readObject(STORAGE_KEYS.auth, null),
  theme:        normalizeTheme(localStorage.getItem(STORAGE_KEYS.theme)),
  profile:      readObject("nexudrive_mvp_profile", {
    name:     "",
    zone:     "Pergamino, Buenos Aires",
    hectares: "120",
    role:     "Productor y contratista",
    bio:      "",
  }),
  publishStep: 1,
};

// Pending confirm action
let pendingAction = null;
const locationPickerState = { map: null, marker: null, form: null, selected: null };

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

document.addEventListener("DOMContentLoaded", init);

function init() {
  applyTheme(state.theme);
  bindNavigation();
  bindForms();
  bindPublishWizard();
  bindProfile();
  bindAuth();
  bindConfirmModal();
  bindReportModal();
  bindRescheduleModal();
  bindDelayModal();
  bindLocationPicker();
  bindOffersTabs();
  render();
  persistMachinePricingMigration();
  openLocationDemoFromQuery();
}

/* ─── NAVIGATION ─── */
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
  $("#user-chip").addEventListener("click", () => showScreen(state.auth ? "perfil" : "acceso"));
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
        owner:        clean(form.get("owner")),
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
      state.reservations.unshift(reservationFromForm(formEl, machine));
      saveReservations();
      setButtonLoading(submitBtn, false);
      closeRequestModal();
      updateBadges();
      showToast("Solicitud enviada al contratista.");
      showScreen("reservas");
    }, 500);
  });

  formControl(requestForm, "job").addEventListener("change", () => toggleJobOther(requestForm));
  formControl(requestForm, "date").addEventListener("change", () => syncRequestDateRange(requestForm));
  formControl(requestForm, "dateFlexible").addEventListener("change", () => syncRequestDateRange(requestForm));
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

function normalizePriceUnit(unit, category = "") {
  const cleanUnit = clean(unit);
  const units = priceUnitsForCategory(category);
  if (units.includes(cleanUnit)) return cleanUnit;
  if (priceUnitMeta[cleanUnit]) return cleanUnit;
  return units[0] || "hectarea";
}

function normalizeMachinePricing(machine) {
  const category = clean(machine?.category);
  return {
    ...machine,
    price: Number(machine?.price ?? machine?.precio ?? 0),
    precio: Number(machine?.precio ?? machine?.price ?? 0),
    priceUnit: normalizePriceUnit(machine?.priceUnit || machine?.unidad_precio || machine?.unitPrice || "hectarea", category),
    unidad_precio: normalizePriceUnit(machine?.unidad_precio || machine?.priceUnit || machine?.unitPrice || "hectarea", category),
  };
}

function persistMachinePricingMigration() {
  const needsMigration = state.machines.some((machine) => !machine.unidad_precio || !machine.priceUnit || machine.precio === undefined);
  if (!needsMigration) return;
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
  form.elements.name.value     = state.profile.name || "";
  form.elements.zone.value     = state.profile.zone || "";
  formControl(form, "hectares").value = state.profile.hectares || "";
  form.elements.bio.value      = state.profile.bio || "";

  form.addEventListener("input", () => {
    state.profile = profileFromForm();
    renderProfile();
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    state.profile = profileFromForm();
    saveProfile();
    renderProfile();
    showToast("Perfil guardado.");
  });

  form.querySelectorAll('input[name="theme"]').forEach((input) => {
    input.addEventListener("change", () => {
      if (!input.checked) return;
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

function profileFromForm() {
  const form = $("#profile-form");
  return {
    name:     clean(form.elements.name.value),
    zone:     clean(form.elements.zone.value),
    hectares: clean(formControl(form, "hectares").value),
    role:     state.profile.role || clean(state.auth?.role) || "Productor y contratista",
    bio:      clean(form.elements.bio.value),
  };
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
    const role = clean(formControl(form, "role").value) || "Productor";

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

    state.auth = {
      email,
      password,
      name: mode === "register" ? name : state.profile.name || email.split("@")[0],
      role: mode === "register" ? role : state.profile.role || "Productor y contratista",
      signedInAt: new Date().toISOString(),
    };

    if (mode === "register") {
      state.profile = {
        ...state.profile,
        name,
        role,
      };
      formControl($("#profile-form"), "name").value = name;
      saveProfile();
    }

    saveAuth();
    hideAuthError();
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
  updateBadges();
}

function renderProfile() {
  const sessionName = state.auth ? clean(state.auth.name) : "";
  const name = clean(state.profile.name) || sessionName || "Mi perfil";
  const role = clean(state.profile.role) || clean(state.auth?.role) || "Productor y contratista";
  const initials = name.split(/\s+/).filter(Boolean).map((p) => p[0]).slice(0, 2).join("").toUpperCase() || "ND";
  $("#profile-avatar").textContent     = initials;
  $("#profile-name-label").textContent = name;
  $("#profile-role-label").textContent = role;
  $("#profile-zone-label").textContent = clean(state.profile.zone) || "Zona sin cargar";
  $("#profile-hectares-label").textContent = state.profile.hectares ? `${money(state.profile.hectares)} ha` : "Sin cargar";
  $("#profile-role-value").textContent = role;
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
          <span><i class="fa-solid fa-user-tie"></i>${escapeHTML(machine.owner)}</span>
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
  const myMachines = state.machines;

  // Count per tab
  const activas    = myMachines.filter((m) => m.offerStatus === "active");
  const pausadas   = myMachines.filter((m) => m.offerStatus === "paused");
  const inactivas  = myMachines.filter((m) => m.offerStatus === "inactive");

  // Solicitudes = reservations pending (that can be resolved as contractor)
  const solicitudes = state.reservations.filter((r) => r.status === "pending");

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
      // Bind accept/reject buttons
      $$(".accept-solicitud-btn").forEach((btn) =>
        btn.addEventListener("click", () => setReservationStatus(btn.dataset.id, "accepted")));
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
    setOfferStatus(btn.dataset.id, "paused");
    showToast("Oferta pausada. No aparece en el catálogo hasta que la actives.");
  }));
  $$(".offer-activate-btn").forEach((btn) => btn.addEventListener("click", () => {
    setOfferStatus(btn.dataset.id, "active");
    showToast("Oferta activada. Ya aparece en el catálogo.");
  }));
  $$(".offer-baja-btn").forEach((btn) => btn.addEventListener("click", () =>
    confirmAction(
      "Dar de baja la oferta",
      `¿Querés dar de baja "${findMachine(btn.dataset.id)?.title}"?`,
      "La oferta dejará de aparecer en el catálogo. Podés reactivarla desde 'Dadas de baja'.",
      () => { setOfferStatus(btn.dataset.id, "inactive"); showToast("Oferta dada de baja."); },
      "Dar de baja"
    )
  ));
  $$(".slot-status-btn").forEach((btn) => btn.addEventListener("click", () => setAvailabilitySlotStatus(btn.dataset.machineId, btn.dataset.status)));
  $$(".offer-delete-btn").forEach((btn) => btn.addEventListener("click", () =>
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
  ));
}

function offerCard(machine, tab) {
  const solicitudesPendientes = state.reservations.filter((r) => r.machineId === machine.id && r.status === "pending").length;
  const reservasTotales       = state.reservations.filter((r) => r.machineId === machine.id).length;
  const icon = categoryIcons[machine.category] || "fa-tractor";
  const statusClass = machine.offerStatus === "active" ? "status-active" : machine.offerStatus === "paused" ? "status-paused" : "status-inactive";
  const statusLabel = offerStatusLabels[machine.offerStatus] || machine.offerStatus;
  const slot = availabilitySlotForMachine(machine);
  const slotStatus = slot ? availabilitySlotStatusLabel(slot.status) : "Sin ventana flexible";
  const slotStatusClass = slot ? availabilitySlotStatusClass(slot.status) : "status-paused";
  const slotControls = tab !== "bajas" ? availabilitySlotControls(machine, slot) : "";

  const actions = tab === "activas" ? `
    ${solicitudesPendientes > 0 ? `<button class="btn btn-sm warning" disabled><i class="fa-solid fa-inbox"></i> ${solicitudesPendientes} pendiente${solicitudesPendientes > 1 ? "s" : ""}</button>` : ""}
    <button class="btn btn-sm ghost offer-pause-btn" type="button" data-id="${machine.id}"><i class="fa-solid fa-pause"></i> Pausar</button>
    <button class="btn btn-sm danger offer-baja-btn" type="button" data-id="${machine.id}"><i class="fa-solid fa-ban"></i> Dar de baja</button>
  ` : tab === "pausadas" ? `
    <button class="btn btn-sm primary offer-activate-btn" type="button" data-id="${machine.id}"><i class="fa-solid fa-play"></i> Activar</button>
    <button class="btn btn-sm danger offer-baja-btn" type="button" data-id="${machine.id}"><i class="fa-solid fa-ban"></i> Dar de baja</button>
  ` : `
    <button class="btn btn-sm ghost offer-activate-btn" type="button" data-id="${machine.id}"><i class="fa-solid fa-rotate-left"></i> Reactivar</button>
    <button class="btn btn-sm danger offer-delete-btn" type="button" data-id="${machine.id}"><i class="fa-solid fa-trash"></i> Eliminar</button>
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
        <div class="availability-window-actions">${slotControls}</div>
        <div class="offer-actions">${actions}</div>
      </div>
    </div>
  `;
}

function solicitudSummary(reservation) {
  const quantity = reservationQuantityLabel(reservation);
  if (reservation.requestMode === "truck" || reservation.category === "Camion") {
    return `${formatDate(reservation.date)} - ${escapeHTML(reservation.cargoType || "Carga")} - ${quantity}`;
  }
  if (reservation.requestMode === "harvest" || reservation.category === "Cosechadora") {
    return `${formatDate(reservation.date)} - ${quantity} - ${escapeHTML(reservation.crop || "Cultivo")}`;
  }
  if (reservation.requestMode === "bagger" || reservation.category === "Embolsadora") {
    return `${formatDate(reservation.date)} - ${escapeHTML(reservation.grainType || "Grano")} - ${quantity}`;
  }
  return `${formatDateRange(reservation)} - ${quantity} - ${escapeHTML(reservation.job)}`;
}

function solicitudLocationSummary(reservation) {
  if (reservation.requestMode === "truck" || reservation.category === "Camion") {
    return `${escapeHTML(reservation.origin || "Origen a confirmar")} -> ${escapeHTML(reservation.destination || "Destino a confirmar")}`;
  }
  return escapeHTML(reservation.field || "Ubicacion a confirmar");
}
function solicitudCard(reservation) {
  const urgencyLabel = formatUrgency(reservation.urgency);
  return `
    <div class="offer-solicitud-card">
      <div class="offer-solicitud-head">
        <div>
          <div class="offer-solicitud-title">${escapeHTML(reservation.machineTitle)}</div>
          <div class="offer-solicitud-meta">
            ${solicitudSummary(reservation)}
          </div>
          <div class="offer-solicitud-meta">${solicitudLocationSummary(reservation)}${urgencyLabel ? ` - Urgencia ${urgencyLabel}` : ""}</div>
        </div>
        <span class="status-pill status-pending">Pendiente</span>
      </div>
      ${solicitudLogisticsPanel(reservation)}
      <div class="offer-solicitud-actions">
        <button class="btn btn-sm danger reject-solicitud-btn" type="button"
          data-id="${reservation.id}" data-title="${escapeHTML(reservation.machineTitle)}">
          <i class="fa-solid fa-xmark"></i> Rechazar
        </button>
        <button class="btn btn-sm primary accept-solicitud-btn" type="button" data-id="${reservation.id}">
          <i class="fa-solid fa-check"></i> Aceptar
        </button>
      </div>
    </div>
  `;
}

function solicitudLogisticsPanel(reservation) {
  const workLocation = reservationWorkLocation(reservation);
  const route = reservationRouteInfo(reservation, workLocation);
  const duration = reservationDurationLabel(reservation);
  const economicContext = reservationEconomicContext(reservation);
  const map = workLocation ? logisticsMapMarkup(workLocation, reservation) : logisticsMapFallback();
  const payment = formatEstimatedMoney(economicContext?.estimate?.estimatedValue);
  return `
    <section class="solicitud-decision" aria-label="Resumen ejecutivo de la solicitud">
      <div class="solicitud-exec-grid">
        ${executiveInfoCard("fa-solid fa-location-dot", "Distancia", route.distanceLabel)}
        ${executiveInfoCard("fa-regular fa-clock", "Viaje", route.timeLabel)}
        ${executiveInfoCard("fa-solid fa-coins", "Ganancia estimada", payment)}
        ${executiveInfoCard("fa-regular fa-calendar", "Fecha", formatDateRange(reservation))}
        ${executiveInfoCard("fa-solid fa-tractor", "Trabajo", reservationJobLabel(reservation))}
      </div>
      <details class="solicitud-more">
        <summary><span>M&aacute;s informaci&oacute;n</span><i class="fa-solid fa-chevron-down"></i></summary>
        <div class="solicitud-more-body">
          <div class="solicitud-more-inner">
            <div class="solicitud-logistics-head">
              <span><i class="fa-solid fa-route"></i> Detalle logistico</span>
              ${route.googleMapsUrl ? `<a class="btn btn-sm ghost" href="${route.googleMapsUrl}" target="_blank" rel="noopener"><i class="fa-solid fa-diamond-turn-right"></i> Ver ruta</a>` : ""}
            </div>
            <div class="solicitud-logistics-grid">
              ${logisticInfoCard("fa-solid fa-location-dot", "Ubicacion", reservationLocationLabel(reservation))}
              ${duration ? logisticInfoCard("fa-solid fa-hourglass-half", "Duracion estimada", duration) : ""}
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
  if (reservation.estimatedServiceHours) return `${money(reservation.estimatedServiceHours)} h estimadas`;
  if (reservation.estimatedDays) return `${money(reservation.estimatedDays)} dia${Number(reservation.estimatedDays) === 1 ? "" : "s"}`;
  if (reservation.hectares) {
    const hours = Math.max(1, Math.ceil(Number(reservation.hectares) / 18));
    return hours <= 8 ? "1 jornada de trabajo" : `${Math.ceil(hours / 8)} jornadas de trabajo`;
  }
  return "";
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
    };
  }
  if (!contractorLocation) {
    return {
      distanceLabel: "No pudimos calcularla todavia.",
      timeLabel: "Falta la ubicacion precisa del contratista.",
      googleMapsUrl: mapsUrl,
    };
  }
  const distanceKm = haversineKm(contractorLocation, workLocation);
  return {
    distanceLabel: `${formatKm(distanceKm)} km`,
    timeLabel: estimatedTravelTime(distanceKm),
    googleMapsUrl: mapsUrl,
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

function estimatedTravelTime(distanceKm) {
  if (!Number.isFinite(distanceKm) || distanceKm <= 0) return "No disponible";
  const minutes = Math.max(10, Math.round((distanceKm / 55) * 60));
  if (minutes < 60) return `${minutes} min aprox.`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours} h ${rest} min aprox.` : `${hours} h aprox.`;
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
function setOfferStatus(machineId, status) {
  const machine = findMachine(machineId);
  if (!machine) return;
  machine.offerStatus = status;
  saveMachines();
  renderMisOfertas();
  renderCatalog();
  renderCategoryFilters();
}

function availabilitySlotControls(machine, slot) {
  if (!slot) return "";
  const statuses = [
    { status: "available", icon: "fa-circle-check", label: "Libre" },
    { status: "partially_booked", icon: "fa-circle-half-stroke", label: "Parcial" },
    { status: "unavailable", icon: "fa-lock", label: "Cerrar ventana" },
  ];
  return statuses.map((item) => `
    <button class="btn btn-sm ghost slot-status-btn ${slot.status === item.status ? "active" : ""}" type="button"
      data-machine-id="${escapeHTML(machine.id)}" data-status="${item.status}">
      <i class="fa-solid ${item.icon}"></i> ${item.label}
    </button>
  `).join("");
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
  const note  = $("#reservas-role-note");
  note.textContent = "Aquí ves tus solicitudes como productor y las que recibís como contratista.";

  const hasReservations = state.reservations.length > 0;
  $("#reservations-empty").hidden = hasReservations;
  $("#reservations-empty-text").textContent = "Todavía no hiciste ninguna solicitud de maquinaria.";
  $("#reservations-empty-cta").dataset.nav  = "catalogo";

  list.innerHTML = state.reservations.map((r) => reservationCard(r)).join("");

  $$(".accept-reservation").forEach((btn) => btn.addEventListener("click", () => setReservationStatus(btn.dataset.reservationId, "accepted")));
  $$(".reject-reservation").forEach((btn) => btn.addEventListener("click", () =>
    confirmAction("Rechazar solicitud", "¿Rechazar esta solicitud?",
      `${btn.dataset.title} para ${formatDate(btn.dataset.date)}. No se puede deshacer.`,
      () => setReservationStatus(btn.dataset.reservationId, "rejected"),
      "Rechazar"
    )));
  $$(".start-work-reservation").forEach((btn)  => btn.addEventListener("click", () => setReservationStatus(btn.dataset.reservationId, "working")));
  $$(".finish-work-reservation").forEach((btn) => btn.addEventListener("click", () => setReservationStatus(btn.dataset.reservationId, "done")));
  $$(".delete-finished-reservation").forEach((btn) => btn.addEventListener("click", () =>
    confirmAction("Eliminar reserva", "Eliminar reserva del historial",
      `${btn.dataset.title}. Esta accion quita la reserva del historial local.`,
      () => deleteReservation(btn.dataset.reservationId),
      "Eliminar"
    )));
  $$(".open-reschedule-btn").forEach((btn) => btn.addEventListener("click", () => openRescheduleModal(btn.dataset.reservationId)));
  $$(".accept-reschedule-btn").forEach((btn) => btn.addEventListener("click", () => acceptRescheduleRequest(btn.dataset.rescheduleId)));
  $$(".reject-reschedule-btn").forEach((btn) => btn.addEventListener("click", () => rejectRescheduleRequest(btn.dataset.rescheduleId)));
  $$(".open-delay-btn").forEach((btn) => btn.addEventListener("click", () => openDelayModal(btn.dataset.reservationId)));
}

function reservationCard(reservation) {
  const canResolve    = reservation.status === "pending";
  const canStartWork  = reservation.status === "accepted";
  const canFinishWork = reservation.status === "working";
  const canDeleteFinished = reservation.status === "done" || reservation.status === "rejected";
  const canRequestReschedule = ["accepted", "working"].includes(reservation.status) && !pendingRescheduleFor(reservation.id);
  const canReportDelay = ["accepted", "working"].includes(reservation.status);
  const machine = findMachine(reservation.machineId);
  const icon = categoryIcons[reservation.category] || categoryIcons[machine?.category] || "fa-tractor";
  const requestCode = reservationCode(reservation);
  const urgency = formatUrgency(reservation.urgency) || "Media";
  const economicContext = reservationEconomicContext(reservation);

  return `
    <article class="reservation-card">
      <div class="reservation-head">
        <div class="reservation-title-wrap">
          <span class="reservation-machine-icon"><i class="fa-solid ${icon}"></i></span>
          <div>
            <h3>${escapeHTML(reservation.machineTitle)}</h3>
            <p>${escapeHTML(reservation.owner)} <span>�</span> Solicitud ${formatDate(reservation.createdAt)} <span>�</span> ID: ${requestCode}</p>
          </div>
        </div>
        <div class="reservation-head-actions">
          <span class="status-pill status-${reservation.status}">${statusLabels[reservation.status]}</span>
          <button class="icon-btn reservation-menu-btn" type="button" aria-label="Mas opciones">
            <i class="fa-solid fa-ellipsis-vertical"></i>
          </button>
        </div>
      </div>
      <div class="reservation-grid">
        ${reservationMetrics(reservation)}
      </div>
      ${canResolve ? solicitudLogisticsPanel(reservation) : ""}
      ${reservationStatusTrack(reservation)}
      ${rescheduleSection(reservation)}
      ${delaySection(reservation)}
      <div class="reservation-equipment">
        <i class="fa-solid fa-truck-pickup"></i>
        <div>
          <strong>${machinePlate(reservation) ? `Patente: ${escapeHTML(machinePlate(reservation))}` : "Sin patente registrada"}</strong>
          <span>${escapeHTML(machine?.brand || reservation.machineTitle)}</span>
        </div>
      </div>
      ${canResolve ? `
        <div class="reservation-actions">
          <button class="btn ghost reject-reservation" type="button"
            data-reservation-id="${reservation.id}"
            data-title="${escapeHTML(reservation.machineTitle)}"
            data-date="${reservation.date}">
            <i class="fa-solid fa-xmark"></i> Rechazar
          </button>
          <button class="btn primary accept-reservation" type="button" data-reservation-id="${reservation.id}">
            <i class="fa-solid fa-check"></i> Aceptar
          </button>
        </div>
      ` : ""}
      ${canReportDelay ? `
        <div class="reservation-actions">
          <button class="btn ghost open-delay-btn" type="button" data-reservation-id="${reservation.id}">
            <i class="fa-regular fa-clock"></i> Reportar retraso
          </button>
        </div>
      ` : ""}
      ${canRequestReschedule ? `
        <div class="reservation-actions">
          <button class="btn ghost open-reschedule-btn" type="button" data-reservation-id="${reservation.id}">
            <i class="fa-regular fa-calendar-plus"></i> Solicitar reprogramacion
          </button>
        </div>
      ` : ""}
      ${canStartWork ? `
        <div class="reservation-actions">
          <button class="btn primary start-work-reservation" type="button" data-reservation-id="${reservation.id}">
            <i class="fa-solid fa-play"></i> Iniciar trabajo
          </button>
        </div>
      ` : ""}
      ${canFinishWork ? `
        <div class="reservation-actions">
          <button class="btn primary finish-work-reservation" type="button" data-reservation-id="${reservation.id}">
            <i class="fa-solid fa-flag-checkered"></i> Marcar finalizado
          </button>
        </div>
      ` : ""}
      ${canDeleteFinished ? `
        <div class="reservation-actions">
          <button class="btn danger delete-finished-reservation" type="button"
            data-reservation-id="${reservation.id}"
            data-title="${escapeHTML(reservation.machineTitle)}">
            <i class="fa-solid fa-trash"></i> Eliminar reserva
          </button>
        </div>
      ` : ""}
    </article>
  `;
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
      <strong>${formatDateRangeValues(request.proposedStart, request.proposedEnd)}</strong>
      <small>Pedido por ${escapeHTML(request.requestedByName || request.requestedBy)}. Fecha actual: ${formatDateRangeValues(request.oldStart, request.oldEnd)}.</small>
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
      <strong>${formatDateRangeValues(request.proposedStart, request.proposedEnd)}</strong>
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
function reservationStatusTrack(reservation) {
  const status = typeof reservation === "string" ? reservation : reservation.status;
  if (status === "rejected") return `<p class="reservation-rejected"><i class="fa-solid fa-xmark-circle"></i> Solicitud rechazada</p>`;
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
  if (reservation.dateFlexible) return `${start}<br><small>fin flexible</small>`;
  if (reservation.dateEnd) return `${start}<br><small>al ${formatDate(reservation.dateEnd)}</small>`;
  return start;
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
  formControl(form, "proposedEnd").value = reservation.dateEnd || reservation.date || "";
  $("#reschedule-current-range").textContent = `Fecha actual: ${formatDateRangeValues(reservation.date, reservation.dateEnd || reservation.date)}`;
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
  if (!proposedStart) {
    showRescheduleError("Elegi una nueva fecha de inicio.");
    return;
  }
  if (proposedEnd < proposedStart) {
    showRescheduleError("La fecha fin propuesta no puede ser anterior al inicio.");
    return;
  }
  state.rescheduleRequests.unshift({
    id: `rs-${Date.now()}`,
    jobId: reservation.id,
    requestedBy: currentUserId(),
    requestedByName: currentUserLabel(),
    oldStart: reservation.date,
    oldEnd: reservation.dateEnd || reservation.date,
    proposedStart,
    proposedEnd,
    status: "pending",
    reason: clean(formControl(form, "reason").value),
    createdAt: new Date().toISOString(),
  });
  saveRescheduleRequests();
  closeRescheduleModal();
  renderReservations();
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
  if (reservation.status === "pending") reservation.status = "accepted";
  reservation.rescheduledAt = request.resolvedAt;
  saveReservations();
  saveRescheduleRequests();
  renderReservations();
  renderMisOfertas();
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

function currentUserId() {
  return clean(state.auth?.email) || "local-user";
}

function currentUserLabel() {
  return clean(state.profile.name) || clean(state.auth?.name) || "Usuario local";
}
function deleteReservation(id) {
  const index = state.reservations.findIndex((r) => r.id === id && (r.status === "done" || r.status === "rejected"));
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
  res.status = status;
  res.resolvedAt = new Date().toISOString();
  if (status === "accepted") markAvailabilitySlotPartiallyBooked(res.machineId);
  saveReservations();
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
  toggleField("#request-flexible-field", config.showFlexible);
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
  if (!config.showFlexible) formControl(form, "dateFlexible").checked = false;
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
    category:     machine.category,
    status:       "pending",
    date:         formControl(form, "date").value,
    serviceType:  config.serviceType,
    jobType:      formControl(form, "job").value,
    job:          formControl(form, "job").value,
    notes:        clean(formControl(form, "notes").value),
    accessConditions: clean(formControl(form, "accessConditions").value),
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
    dateFlexible: formControl(form, "dateFlexible").checked,
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

  const current = locationPickerState.selected;
  const center = current ? [current.latitude, current.longitude] : [-34.6037, -58.3816];
  locationPickerState.map.setView(center, current ? 15 : 6);
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
  const current = locationPickerState.selected;
  locationPickerState.map.setView(current ? [current.latitude, current.longitude] : [-34.6037, -58.3816], current ? 15 : 6);
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
  $("#location-selected-address").textContent = hasLocation ? location.address : "Sin ubicacion seleccionada";
  $("#location-selected-lat").textContent = hasLocation ? Number(location.latitude).toFixed(6) : "-";
  $("#location-selected-lon").textContent = hasLocation ? Number(location.longitude).toFixed(6) : "-";
  $("#location-manual-lat").value = hasLocation ? Number(location.latitude).toFixed(6) : "";
  $("#location-manual-lon").value = hasLocation ? Number(location.longitude).toFixed(6) : "";
  if (updateSearch) $("#location-search-input").value = hasLocation ? location.address : "";
  updateLocationConfirmState();
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
  const dateStart = formControl(form, "date").value || new Date().toISOString().slice(0, 10);
  formControl(form, "dateEnd").min = dateStart;
  const flexible = formControl(form, "dateFlexible").checked;
  formControl(form, "dateEnd").disabled = flexible;
  if (flexible) formControl(form, "dateEnd").value = "";
}

function updateRequestEstimate(form) {
  const estimate = $("#request-estimate");
  const machine = findMachine(formControl(form, "machineId")?.value);
  if (estimate) {
    const hectares = Number(formControl(form, "hectares").value);
    if (Number.isFinite(hectares) && hectares > 0 && !$(".request-hectares-field")?.hidden) {
      const hours = Math.max(1, Math.ceil(hectares / 18));
      const label = hours <= 8 ? "1 jornada de trabajo" : `${Math.ceil(hours / 8)} jornadas de trabajo`;
      estimate.textContent = `Duracion estimada: ${label} � aprox. ${hours} h`;
      estimate.hidden = false;
    } else {
      estimate.hidden = true;
      estimate.textContent = "";
    }
  }
  updateRequestEconomicSummary(form, machine);
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
function updateBadges() {
  const pendingCount = state.reservations.filter((r) => r.status === "pending").length;
  const badge = $("#reservation-badge");
  badge.hidden = pendingCount === 0;
  badge.textContent = pendingCount;

  const offersBadge = $("#offers-badge");
  offersBadge.hidden = pendingCount === 0;
  offersBadge.textContent = pendingCount;
}

/* ─── STORAGE ─── */
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
function saveAvailabilitySlots() {
  localStorage.setItem(STORAGE_KEYS.availabilitySlots, JSON.stringify(state.availabilitySlots));
}
function saveAuth() {
  if (state.auth) {
    localStorage.setItem(STORAGE_KEYS.auth, JSON.stringify(state.auth));
  } else {
    localStorage.removeItem(STORAGE_KEYS.auth);
  }
}
function saveProfile() {
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
  if (reservation.dateFlexible) return `${start} - flexible`;
  if (reservation.dateEnd) return `${start} - ${formatDate(reservation.dateEnd)}`;
  return start;
}

function formatDate(value) {
  if (!value) return "-";
  const d = new Date(String(value).includes("T") ? value : `${value}T12:00:00`);
  if (isNaN(d.getTime())) return value;
  return d.toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" });
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
