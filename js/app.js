"use strict";

const STORAGE_KEYS = {
  machines: "nexudrive_mvp_machines",
  reservations: "nexudrive_mvp_reservations",
  auth: "nexudrive_mvp_auth",
};

const seedMachines = [
  {
    id: "m-tractor-6120",
    title: "Tractor John Deere 6120J",
    category: "Tractor",
    price: 35,
    location: "Venado Tuerto, Santa Fe",
    availability: "Disponible esta semana",
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
  Dron:         "fa-helicopter",
  Camion:       "fa-truck",
  Embolsadora:  "fa-bag-shopping",
  Acoplado:     "fa-trailer",
  Tolva:        "fa-truck-ramp-box",
};

const categoryOrder = ["Todas", "Tractor", "Sembradora", "Pulverizadora", "Cosechadora", "Camion", "Embolsadora", "Dron", "Acoplado", "Tolva"];

const defaultJobByCategory = {
  Tractor: "Labores generales",
  Sembradora: "Siembra",
  Pulverizadora: "Pulverizacion / Fumigacion",
  Cosechadora: "Cosecha",
  Camion: "Distribucion",
  Embolsadora: "Embolsado",
  Dron: "Pulverizacion / Fumigacion",
  Acoplado: "Distribucion",
  Tolva: "Apoyo a cosecha",
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

const state = {
  screen:       "catalogo",
  offersTab:    "activas",
  category:     "Todas",
  search:       "",
  machines:     readJSON(STORAGE_KEYS.machines, seedMachines),
  reservations: readJSON(STORAGE_KEYS.reservations, []),
  auth:         readObject(STORAGE_KEYS.auth, null),
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

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

document.addEventListener("DOMContentLoaded", init);

function init() {
  bindNavigation();
  bindForms();
  bindPublishWizard();
  bindProfile();
  bindAuth();
  bindConfirmModal();
  bindOffersTabs();
  render();
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

  $("#filter-toggle").addEventListener("click", () => {
    showToast("Filtros: elegí una categoría o buscá por texto.");
  });

  $("#catalog-empty-clear").addEventListener("click", () => {
    state.category = "Todas";
    state.search = "";
    $("#catalog-search").value = "";
    renderCategoryFilters();
    renderCatalog();
  });

  $("#user-chip").addEventListener("click", () => showScreen(state.auth ? "perfil" : "acceso"));
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
      const machine = {
        id: `m-${Date.now()}`,
        title:        clean(form.get("title")),
        category:     clean(form.get("category")),
        price:        Number(form.get("price")),
        location:     clean(form.get("location")),
        availability: clean(form.get("availability")),
        plate:        normalizePlate(form.get("plate")),
        owner:        clean(form.get("owner")),
        description:  clean(form.get("description")) || "Maquinaria publicada para solicitar reserva.",
        distanceKm:   null, rating: null, reviews: 0,
        offerStatus:  "active",
      };
      state.machines.unshift(machine);
      saveMachines();
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
      const jobType = clean(form.get("job"));
      const jobOther = clean(form.get("jobOther"));
      state.reservations.unshift({
        id: `r-${Date.now()}`,
        machineId:    machine.id,
        machineTitle: machine.title,
        owner:        machine.owner,
        category:     machine.category,
        status:       "pending",
        date:         form.get("date"),
        dateEnd:      clean(form.get("dateEnd")),
        dateFlexible: form.get("dateFlexible") === "on",
        hectares:     Number(form.get("hectares")),
        jobType,
        jobOther,
        job:          jobType === "Otros" && jobOther ? `${jobType}: ${jobOther}` : jobType,
        field:        clean(form.get("field")),
        fieldParts:   parseFieldParts(form.get("field")),
        urgency:      clean(form.get("urgency")),
        createdAt:    new Date().toISOString(),
      });
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
  requestForm.addEventListener("input", hideRequestError);

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
    const fields = ["title", "price", "location", "availability"];
    const invalid = fields.find((n) => !form.elements[n].checkValidity());
    if (invalid) { form.elements[invalid].reportValidity(); return false; }
  }
  return true;
}

function updatePublishPreview() {
  const form = $("#publish-form");
  const selectedCategory = clean($("#publish-category")?.value);
  const category = selectedCategory || "Maquinaria";
  syncPublishPlateField(selectedCategory);
  const icon = categoryIcons[category] || "fa-tractor";
  $("#publish-preview-icon").innerHTML = `<i class="fa-solid ${icon}"></i>`;
  $("#publish-preview-category").textContent = category;
  $("#publish-preview-title").textContent = clean(form.elements.title.value) || "Tu equipo publicado";
  $("#publish-preview-description").textContent = clean(form.elements.description.value) || "Completá los datos para ver cómo aparecerá en el catálogo.";
  $("#publish-preview-location").textContent = clean(form.elements.location.value) || "Zona de trabajo";
  $("#publish-preview-availability").textContent = clean(form.elements.availability.value) || "Disponibilidad";
  $("#publish-preview-owner").textContent = clean(form.elements.owner.value) || "Contratista";
  $("#publish-preview-price").textContent = form.elements.price.value ? `USD ${money(form.elements.price.value)}` : "USD -";
  const plate = normalizePlate(formControl(form, "plate")?.value);
  const showPlate = machineSupportsPlate(category) && plate;
  $("#publish-preview-plate-row").hidden = !showPlate;
  $("#publish-preview-plate").textContent = showPlate ? plate : "";
}

function resetPublishWizard() {
  state.publishStep = 1;
  $$("#publish-category-grid .pub-cat-btn").forEach((b) => b.classList.remove("selected"));
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
    const role = clean(formControl(form, "role").value) || "Productor";

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showAuthError("Ingresá un email válido.");
      return;
    }
    if (mode === "register" && !name) {
      showAuthError("Ingresá tu nombre para registrarte.");
      return;
    }

    state.auth = {
      email,
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
  form.dataset.mode = mode;
  $$(".auth-tab").forEach((btn) => btn.classList.toggle("active", btn.dataset.authMode === mode));
  $$(".auth-register-field").forEach((field) => { field.hidden = mode !== "register"; });
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
  renderCatalog();
  renderReservations();
  renderMisOfertas();
  renderProfile();
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
  $("#category-filters").innerHTML = categories.map((cat) => `
    <button class="filter-chip ${state.category === cat ? "active" : ""}" type="button" data-category="${escapeHTML(cat)}">
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
    const text = `${m.title} ${m.category} ${m.location} ${m.owner}`.toLowerCase();
    return matchesCat && (!state.search || text.includes(state.search));
  });

  $("#catalog-empty").hidden = items.length > 0;
  $("#catalog-empty-text").textContent = state.search || state.category !== "Todas"
    ? "No hay maquinaria para esta búsqueda. Probá con otra categoría o término."
    : "Todavía no hay maquinaria publicada.";
  $("#results-meta").textContent = `${items.length} resultado${items.length === 1 ? "" : "s"}`;
  grid.innerHTML = items.map(machineCard).join("");

  $$(".request-btn").forEach((btn) => btn.addEventListener("click", () => openRequestModal(btn.dataset.machineId)));
  $$(".report-btn").forEach((btn) => btn.addEventListener("click", () => showToast("Denuncia recibida para revisión.")));
}

function machineCard(machine) {
  const hasRating   = typeof machine.rating === "number";
  const hasDistance = typeof machine.distanceKm === "number";
  return `
    <article class="machine-card">
      <div class="machine-media">
        <i class="fa-solid ${categoryIcons[machine.category] || "fa-tractor"}"></i>
        ${machine.badge ? `<span class="machine-badge">${escapeHTML(machine.badge)}</span>` : ""}
        <button class="floating-action report-btn" type="button" aria-label="Denunciar publicación" title="Denunciar">
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
          <span><i class="fa-regular fa-calendar-check"></i>${escapeHTML(machine.availability)}</span>
          <span><i class="fa-solid fa-user-tie"></i>${escapeHTML(machine.owner)}</span>
          ${hasRating ? `<span><i class="fa-solid fa-star"></i>${machine.rating.toFixed(1)}${machine.reviews ? ` (${machine.reviews})` : ""}</span>` : ""}
        </div>
        <p class="machine-description">${escapeHTML(machine.description)}</p>
        <div class="card-footer">
          <div class="price">
            <strong>USD ${money(machine.price)}</strong>
            <span>por hectárea</span>
          </div>
          <button class="btn primary request-btn" type="button" data-machine-id="${escapeHTML(machine.id)}">
            Solicitar
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
  $$(".offer-delete-btn").forEach((btn) => btn.addEventListener("click", () =>
    confirmAction(
      "Eliminar definitivamente",
      `¿Eliminar "${findMachine(btn.dataset.id)?.title}" de forma permanente?`,
      "Esta acción no se puede deshacer.",
      () => {
        state.machines = state.machines.filter((m) => m.id !== btn.dataset.id);
        saveMachines();
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
          <span><i class="fa-solid fa-dollar-sign"></i>USD ${money(machine.price)}/ha</span>
          <span><i class="fa-regular fa-calendar-check"></i>${escapeHTML(machine.availability)}</span>
          ${reservasTotales > 0 ? `<span><i class="fa-solid fa-inbox"></i>${reservasTotales} reserva${reservasTotales > 1 ? "s" : ""}</span>` : ""}
        </div>
        <div class="offer-actions">${actions}</div>
      </div>
    </div>
  `;
}

function solicitudCard(reservation) {
  const urgencyLabel = formatUrgency(reservation.urgency);
  return `
    <div class="offer-solicitud-card">
      <div class="offer-solicitud-head">
        <div>
          <div class="offer-solicitud-title">${escapeHTML(reservation.machineTitle)}</div>
          <div class="offer-solicitud-meta">
            ${formatDateRange(reservation)} · ${money(reservation.hectares)} ha · ${escapeHTML(reservation.job)}
          </div>
          <div class="offer-solicitud-meta">${escapeHTML(reservation.field)}${urgencyLabel ? ` · Urgencia ${urgencyLabel}` : ""}</div>
        </div>
        <span class="status-pill status-pending">Pendiente</span>
      </div>
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

function setOfferStatus(machineId, status) {
  const machine = findMachine(machineId);
  if (!machine) return;
  machine.offerStatus = status;
  saveMachines();
  renderMisOfertas();
  renderCatalog();
  renderCategoryFilters();
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
}

function reservationCard(reservation) {
  const canResolve    = reservation.status === "pending";
  const canStartWork  = reservation.status === "accepted";
  const canFinishWork = reservation.status === "working";
  const machine = findMachine(reservation.machineId);
  const icon = categoryIcons[reservation.category] || categoryIcons[machine?.category] || "fa-tractor";
  const requestCode = reservationCode(reservation);
  const urgency = formatUrgency(reservation.urgency) || "Media";

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
        ${reservationMetric("fa-regular fa-calendar", "Fecha", formatDateRangeStack(reservation))}
        ${reservationMetric("fa-solid fa-wheat-awn", "Hect&aacute;reas", `${money(reservation.hectares)} ha`)}
        ${reservationMetric("fa-solid fa-seedling", "Trabajo", escapeHTML(reservation.job))}
        ${reservationMetric("fa-solid fa-location-dot", "Lote", formatFieldStack(reservation.field))}
        ${reservationMetric("fa-regular fa-clock", "Urgencia", `<span class="urgency-${escapeHTML(clean(reservation.urgency) || "media")}">${escapeHTML(urgency)}</span>`)}
      </div>
      ${reservationStatusTrack(reservation)}
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
    </article>
  `;
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
function setReservationStatus(id, status) {
  const res = state.reservations.find((r) => r.id === id);
  if (!res) return;
  res.status = status;
  res.resolvedAt = new Date().toISOString();
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
  hideRequestError();
  formControl(form, "job").value = defaultJobForMachine(machine);
  toggleJobOther(form);
  formControl(form, "machineId").value = machine.id;
  formControl(form, "date").min = new Date().toISOString().slice(0, 10);
  formControl(form, "dateEnd").min = formControl(form, "date").min;
  syncRequestDateRange(form);
  $("#request-title").textContent = machine.title;
  $("#request-modal").hidden = false;
  formControl(form, "date").focus();
}

function defaultJobForMachine(machine) {
  return defaultJobByCategory[machine.category] || "Otros";
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

function validateRequestForm(form) {
  toggleJobOther(form);
  syncRequestDateRange(form);

  if (!formControl(form, "date").value) return { valid: false, message: "Elegí una fecha de inicio estimada." };

  const hectares = Number(formControl(form, "hectares").value);
  if (!Number.isFinite(hectares) || hectares <= 0) {
    return { valid: false, message: "Ingresá hectáreas con un número mayor a 0." };
  }

  if (!formControl(form, "job").value) return { valid: false, message: "Seleccioná el trabajo solicitado." };

  const dateEnd = formControl(form, "dateEnd").value;
  if (dateEnd && dateEnd < formControl(form, "date").value) {
    return { valid: false, message: "La fecha fin no puede ser anterior a la fecha de inicio." };
  }

  if (!clean(formControl(form, "field").value)) {
    return { valid: false, message: "Indicá la ubicación del lote como campo / zona / partido." };
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
  const map = { baja: "Baja", media: "Media", alta: "Alta" };
  return map[clean(value)] || "";
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
