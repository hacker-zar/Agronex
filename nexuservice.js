"use strict";
/* ================================================================
   AGRONEX module: NexuService technicians, services, requests and maintenance flows
   Extracted from java.js without behavior changes.
================================================================ */

// ---- original java.js lines 4972-5439 ----
// NEXUSERVICE - catalogo de tecnicos rurales
// ======================================================
const service_categories = [
    { key: 'Todos', label: 'Todos', icon: 'fa-border-all' },
    { key: 'Mecanica general', label: 'Mecanica', icon: 'fa-wrench' },
    { key: 'Tractores', label: 'Tractores', icon: 'fa-tractor' },
    { key: 'Sembradoras', label: 'Sembradoras', icon: 'fa-seedling' },
    { key: 'Pulverizadoras', label: 'Pulveriz.', icon: 'fa-spray-can-sparkles' },
    { key: 'Cosechadoras', label: 'Cosechadoras', icon: 'fa-wheat-awn' },
    { key: 'Camiones', label: 'Camiones', icon: 'fa-truck' },
    { key: 'Drones', label: 'Drones', icon: 'fa-helicopter' },
    { key: 'Electricidad', label: 'Electricidad', icon: 'fa-bolt' },
    { key: 'Hidraulica', label: 'Hidraulica', icon: 'fa-oil-can' },
    { key: 'Soldadura', label: 'Soldadura', icon: 'fa-fire-flame-simple' },
    { key: 'Taller movil', label: 'Taller movil', icon: 'fa-truck-fast' },
];
const service_profiles = [
    { id: 1, name: 'Hernan Molina', specialty: 'Pulverizadoras e hidraulica', category: 'Pulverizadoras', location: 'Pergamino, Buenos Aires', distanceKm: 18, experienceYears: 12, rating: 4.9, reviews: 38, verification: 'verified', fastResponse: true, topRated: true, certified: true, description: 'Tecnico rural especializado en bombas, barrales, sensores y circuitos hidraulicos de pulverizadoras.', certifications: ['Tecnicatura agromecanica', 'Precision Planting soporte campo'], coverage: 'Pergamino, Rojas, Colon y zonas cercanas', machines: ['Pla MAP II', 'Metalfor', 'John Deere', 'Case IH'], jobs: ['Calibracion de caudal', 'Cambio de bomba hidraulica', 'Diagnostico electrico de corte por seccion'] },
    { id: 2, name: 'Valeria Benitez', specialty: 'Electricidad agricola', category: 'Electricidad', location: 'Venado Tuerto, Santa Fe', distanceKm: 42, experienceYears: 9, rating: 4.8, reviews: 24, verification: 'verified', fastResponse: true, topRated: false, certified: true, description: 'Diagnostico electrico, instalacion de monitores, sensores, luces de trabajo y cableado de maquinaria.', certifications: ['Electricidad industrial', 'Sistemas CAN bus'], coverage: 'Sur de Santa Fe y norte de Buenos Aires', machines: ['Tractores', 'Cosechadoras', 'Sembradoras'], jobs: ['Reparacion de arnes', 'Instalacion de monitor', 'Falla intermitente en modulo'] },
    { id: 3, name: 'Taller Rural Los Sauces', specialty: 'Mecanica general y taller movil', category: 'Mecanica general', location: 'Rojas, Buenos Aires', distanceKm: 35, experienceYears: 18, rating: 4.7, reviews: 51, verification: 'verified', fastResponse: false, topRated: true, certified: false, description: 'Taller rural con unidad movil para reparaciones en campo, mantenimiento preventivo y auxilio tecnico.', certifications: ['Registro de taller rural'], coverage: 'Rojas, Salto, Pergamino y Arrecifes', machines: ['Tractores', 'Camiones', 'Acoplados'], jobs: ['Service completo', 'Cambio de embrague', 'Frenos de camion'] },
    { id: 4, name: 'Matias Duarte', specialty: 'Cosechadoras y tractores', category: 'Cosechadoras', location: 'Junin, Buenos Aires', distanceKm: 76, experienceYears: 14, rating: 4.6, reviews: 29, verification: 'pending', fastResponse: true, topRated: false, certified: true, description: 'Especialista en transmisiones, plataformas, motores y puesta a punto de cosechadoras.', certifications: ['Cursos OEM en motores diesel'], coverage: 'Junin, Chacabuco, Lincoln', machines: ['Case IH', 'New Holland', 'John Deere'], jobs: ['Revision de plataforma', 'Falla de transmision', 'Mantenimiento pre cosecha'] },
    { id: 5, name: 'AgroDrone Service', specialty: 'Drones agricolas', category: 'Drones', location: 'Rosario, Santa Fe', distanceKm: 94, experienceYears: 6, rating: 4.9, reviews: 31, verification: 'verified', fastResponse: true, topRated: true, certified: true, description: 'Servicio tecnico de drones, baterias, picos, bombas, calibracion y actualizacion de firmware.', certifications: ['Piloto VANT', 'DJI Agriculture soporte'], coverage: 'Santa Fe, Cordoba este y norte bonaerense', machines: ['DJI Agras', 'XAG', 'Drones multirrotor'], jobs: ['Calibracion IMU', 'Cambio de bomba', 'Diagnostico de bateria'] },
    { id: 6, name: 'Oscar Fernandez', specialty: 'Soldadura y estructuras', category: 'Soldadura', location: 'Colon, Buenos Aires', distanceKm: 28, experienceYears: 22, rating: 4.5, reviews: 17, verification: 'verified', fastResponse: false, topRated: false, certified: false, description: 'Reparacion de chasis, acoplados, tolvas, barrales y estructuras de maquinaria pesada.', certifications: ['Soldadura MIG y electrica'], coverage: 'Colon, Wheelwright, Hughes', machines: ['Acoplados', 'Tolvas', 'Pulverizadoras', 'Sembradoras'], jobs: ['Refuerzo de chasis', 'Reparacion de barral', 'Soldadura de tolva'] },
    { id: 7, name: 'Nicolas Peralta', specialty: 'Sembradoras y dosificacion', category: 'Sembradoras', location: 'Salto, Buenos Aires', distanceKm: 54, experienceYears: 11, rating: 4.8, reviews: 33, verification: 'verified', fastResponse: true, topRated: false, certified: true, description: 'Puesta a punto de cuerpos de siembra, dosificadores, placas, sensores y tren cinetico.', certifications: ['Dosificacion variable', 'Precision Ag'], coverage: 'Salto, Arrecifes, Pergamino', machines: ['Agrometal', 'Crucianelli', 'John Deere', 'Apache'], jobs: ['Control de densidad', 'Cambio de cuchillas', 'Sensor de surco'] },
    { id: 8, name: 'Hidraulica Campo Norte', specialty: 'Hidraulica pesada', category: 'Hidraulica', location: 'Arrecifes, Buenos Aires', distanceKm: 62, experienceYears: 16, rating: 4.7, reviews: 22, verification: 'pending', fastResponse: true, topRated: false, certified: true, description: 'Mangueras, cilindros, bombas, valvulas y diagnostico de presion para maquinaria agricola.', certifications: ['Hidraulica movil'], coverage: 'Arrecifes, Capitan Sarmiento, San Antonio de Areco', machines: ['Tractores', 'Pulverizadoras', 'Cosechadoras'], jobs: ['Cambio de retenes', 'Fuga en cilindro', 'Prueba de presion'] },
];
let service_requests = [];
let service_reviews = [
    { id: 1, profileId: 1, rating: 5, text: 'Resolvio una falla de bomba en el dia.' },
    { id: 2, profileId: 7, rating: 5, text: 'Muy claro para explicar la puesta a punto.' },
];
let service_favorites = [];
let service_recommendations = [];
const serviceState = { category: 'Todos', q: '', selectedId: null, contextProblem: '', contextMachine: '', contextCategory: '' };
function readServiceStoredJSON(key, fallback) {
    try {
        const value = JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
        return value == null ? fallback : value;
    }
    catch (e) {
        console.warn("[Agronex]", e);
        return fallback;
    }
}
try {
    const savedRequests = readServiceStoredJSON('agronex_service_requests', []);
    const savedFavs = readServiceStoredJSON('agronex_service_favorites', []);
    if (Array.isArray(savedRequests))
        service_requests = savedRequests;
    if (Array.isArray(savedFavs))
        service_favorites = savedFavs;
}
catch (e) { console.warn("[Agronex]", e); }
globalThis.service_favorites = service_favorites;
function saveServiceState() {
    try {
        localStorage.setItem('agronex_service_requests', JSON.stringify(service_requests));
        localStorage.setItem('agronex_service_favorites', JSON.stringify(service_favorites));
        globalThis.service_favorites = service_favorites;
    }
    catch (e) { console.warn("[Agronex]", e); }
}
function serviceEscape(v) {
    return String(v || '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}
function serviceInitials(name) {
    return String(name || 'NS').split(' ').filter(Boolean).slice(0, 2).map(p => p[0]).join('').toUpperCase();
}
function isServiceFav(id) { return service_favorites.includes(id); }
function toggleServiceFavorite(id) {
    service_favorites = isServiceFav(id) ? service_favorites.filter(x => x !== id) : [...service_favorites, id];
    saveServiceState();
    updateFavBadge();
    renderFavoritos();
    renderNexuService();
    if (serviceState.selectedId === id)
        selectServiceProfile(id);
}
function serviceVerificationLabel(p) {
    if (p.verification === 'verified')
        return 'Verificado';
    if (p.verification === 'rejected')
        return 'Rechazado';
    return 'Pendiente';
}
function serviceVerificationClass(p) {
    return p.verification === 'verified' ? 'nd-avail-now' : 'nd-avail-soon';
}
function serviceBadges(p) {
    const badges = [];
    if (p.verification === 'verified')
        badges.push('<span class="nd-mini-badge"><i class="fas fa-shield-alt"></i> Verificado</span>');
    if (p.fastResponse)
        badges.push('<span class="nd-mini-badge amber"><i class="fas fa-bolt"></i> Respuesta rapida</span>');
    if (p.topRated)
        badges.push('<span class="nd-mini-badge"><i class="fas fa-star"></i> Mejor valorado</span>');
    if (p.certified)
        badges.push('<span class="nd-mini-badge"><i class="fas fa-screwdriver-wrench"></i> Especialista certificado</span>');
    return badges.join('');
}
function serviceScore(p) {
    let score = p.rating * 20 - p.distanceKm / 3 + p.experienceYears;
    if (p.fastResponse)
        score += 12;
    if (p.certified)
        score += 10;
    if (p.verification === 'verified')
        score += 12;
    if (serviceState.contextCategory && p.category === serviceState.contextCategory)
        score += 35;
    const machine = String(serviceState.contextMachine || '').toLowerCase();
    if (machine && p.machines.some(m => machine.includes(m.toLowerCase()) || m.toLowerCase().includes(machine)))
        score += 18;
    return score;
}
function getServiceFilteredItems() {
    const modalCategory = (document.getElementById('service-filter-category') || {}).value || '';
    const activeCategory = modalCategory || serviceState.category || 'Todos';
    const verified = (document.getElementById('service-filter-verified') || {}).value || '';
    const maxDist = parseFloat((document.getElementById('service-filter-distance') || {}).value || '0') || 0;
    const sort = (document.getElementById('service-sort') || {}).value || 'recommended';
    const fast = !!((document.getElementById('service-filter-fast') || {}).checked);
    const certified = !!((document.getElementById('service-filter-certified') || {}).checked);
    const q = (serviceState.q || '').trim().toLowerCase();
    let items = service_profiles.filter(p => {
        const text = [p.name, p.specialty, p.category, p.location, ...(p.machines || [])].join(' ').toLowerCase();
        if (activeCategory !== 'Todos' && p.category !== activeCategory)
            return false;
        if (q && !text.includes(q))
            return false;
        if (verified === 'verified' && p.verification !== 'verified')
            return false;
        if (verified === 'pending' && p.verification !== 'pending')
            return false;
        if (maxDist && p.distanceKm > maxDist)
            return false;
        if (fast && !p.fastResponse)
            return false;
        if (certified && !p.certified)
            return false;
        return true;
    });
    items.sort((a, b) => {
        if (sort === 'rating')
            return b.rating - a.rating || b.reviews - a.reviews;
        if (sort === 'near')
            return a.distanceKm - b.distanceKm;
        if (sort === 'experience')
            return b.experienceYears - a.experienceYears;
        return serviceScore(b) - serviceScore(a);
    });
    service_recommendations = items.slice(0, 3).map(p => ({ profileId: p.id, score: serviceScore(p), reason: serviceState.contextProblem || 'Coincide con tu zona y maquinaria' }));
    return items;
}
function renderServiceCategories() {
    const wrap = document.getElementById('service-cats');
    if (!wrap)
        return;
    wrap.innerHTML = service_categories.map(c => `
    <button class="nd-cat ${serviceState.category === c.key ? 'active' : ''}" onclick="serviceFilterCategory('${serviceEscape(c.key)}')" data-cat="${serviceEscape(c.key)}">
      <span class="nd-cat-icon"><i class="fas ${c.icon}"></i></span>${serviceEscape(c.label)}
    </button>`).join('');
}
function renderServiceRecommendations(items) {
    const strip = document.getElementById('service-ia-strip');
    if (!strip)
        return;
    const shown = items || getServiceFilteredItems();
    const pills = [];
    if (serviceState.contextProblem) {
        const cat = serviceState.contextCategory || 'tu maquinaria';
        pills.push(`<button class="nd-ia-pill nd-ia-pill-green"><i class="fas fa-bolt"></i> Encontramos ${shown.slice(0, 3).length} tecnicos especializados en ${serviceEscape(cat.toLowerCase())} cerca de tu zona</button>`);
    }
    const best = shown[0];
    const similar = shown.find(p => serviceState.contextMachine && p.machines.some(m => serviceState.contextMachine.toLowerCase().includes(m.toLowerCase()) || m.toLowerCase().includes(serviceState.contextMachine.toLowerCase())));
    if (best)
        pills.push(`<button class="nd-ia-pill nd-ia-pill-amber" onclick="selectServiceProfile(${best.id})"><i class="fas fa-star"></i> ${serviceEscape(best.name)} es la mejor coincidencia <span class="nd-pill-cta">Ver</span></button>`);
    if (similar)
        pills.push(`<button class="nd-ia-pill nd-ia-pill-green" onclick="selectServiceProfile(${similar.id})"><i class="fas fa-check-circle"></i> Este tecnico ya trabajo con maquinaria similar <span class="nd-pill-cta">Ver</span></button>`);
    const fast = shown.find(p => p.fastResponse);
    if (fast)
        pills.push(`<button class="nd-ia-pill nd-ia-pill-green" onclick="selectServiceProfile(${fast.id})"><i class="fas fa-bolt"></i> Respuesta rapida cerca de tu zona <span class="nd-pill-cta">Ver</span></button>`);
    strip.innerHTML = pills.join('') || `<button class="nd-ia-pill nd-ia-pill-green"><i class="fas fa-screwdriver-wrench"></i> Tecnicos rurales disponibles en tu zona</button>`;
}
function renderServiceCatalog(items) {
    const grid = document.getElementById('service-grid');
    const count = document.getElementById('service-results-count');
    const hero = document.getElementById('service-hero-count');
    if (!grid)
        return;
    const shown = items || getServiceFilteredItems();
    if (count)
        count.textContent = `${shown.length} tecnico${shown.length !== 1 ? 's' : ''} disponibles`;
    if (hero)
        hero.textContent = service_profiles.length;
    if (!shown.length) {
        grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:60px 20px;color:var(--text-muted);">
      <i class="fas fa-search" style="font-size:32px;display:block;margin-bottom:12px;opacity:.3;"></i>
      <div style="font-size:15px;font-weight:600;color:var(--text-secondary);margin-bottom:6px;">Todavía no hay técnicos para este filtro.</div>
      <div style="font-size:13px;">Probá otra especialidad o ampliá la distancia.</div>
    </div>`;
        return;
    }
    grid.innerHTML = shown.map(p => {
        const selected = serviceState.selectedId === p.id;
        const best = service_recommendations[0] && service_recommendations[0].profileId === p.id;
        return `
    <div class="market-card ${selected ? 'selected' : ''} ${best ? 'market-card-best' : ''}" onclick="selectServiceProfile(${p.id})">
      <div class="market-card-img service-card-photo">
        <div class="service-avatar">${serviceInitials(p.name)}</div>
        <div class="market-saving-badge">${serviceEscape(p.category)}</div>
        <div class="nd-avail-badge ${serviceVerificationClass(p)}"><i class="fas fa-circle" style="font-size:7px;"></i> ${serviceVerificationLabel(p)}</div>
        <button class="fav-btn ${isServiceFav(p.id) ? 'fav-active' : ''}" onclick="event.stopPropagation();toggleServiceFavorite(${p.id})">
          <i class="${isServiceFav(p.id) ? 'fas' : 'far'} fa-heart"></i>
        </button>
      </div>
      <div class="market-card-body">
        <div class="nd-card-badges">${serviceBadges(p)}</div>
        <div class="market-card-saving"><i class="fas fa-screwdriver-wrench" style="font-size:9px;"></i> ${serviceEscape(p.specialty)}</div>
        <div class="market-card-title">${serviceEscape(p.name)}</div>
        <div class="market-card-price">${p.experienceYears} años de experiencia</div>
        <div class="market-card-meta">
          <span class="market-card-meta-item"><i class="fas fa-map-pin"></i> ${serviceEscape(p.location)}</span>
          <span class="market-card-meta-item"><i class="fas fa-route"></i> ${p.distanceKm} km</span>
          <span class="market-card-meta-item"><i class="fas fa-star" style="color:var(--amber-400);"></i> ${p.rating} (${p.reviews})</span>
        </div>
        <div class="service-zone-line"><i class="fas fa-map-location-dot"></i> ${serviceEscape(p.coverage)}</div>
      </div>
      <div class="nd-card-cta" onclick="event.stopPropagation()">
        <button class="nd-card-cta-main" onclick="openServiceRequest(${p.id})"><i class="fas fa-clipboard-list" style="font-size:11px;"></i> Consultar</button>
        <button class="nd-card-cta-fav" onclick="selectServiceProfile(${p.id})" title="Ver perfil"><i class="fas fa-user-check"></i></button>
      </div>
    </div>`;
    }).join('');
}
function renderNexuService() {
    renderServiceCategories();
    const items = getServiceFilteredItems();
    renderServiceRecommendations(items);
    renderServiceCatalog(items);
}
function serviceFilterCategory(cat) {
    serviceState.category = cat || 'Todos';
    const select = document.getElementById('service-filter-category');
    if (select)
        select.value = serviceState.category === 'Todos' ? '' : serviceState.category;
    
    // Actualizar clases activas y hacer scroll
    const buttons = document.querySelectorAll('#service-cats .nd-cat');
    buttons.forEach(b => b.classList.remove('active'));
    const activeBtn = document.querySelector(`#service-cats .nd-cat[data-cat="${cat}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
        activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
    
    renderNexuService();
}
function quickSearchService(q) { serviceState.q = q || ''; renderNexuService(); }
function applyServiceFilters() {
    const btn = document.getElementById('service-filter-btn');
    if (btn) {
        const active = ['service-filter-category', 'service-filter-verified', 'service-filter-distance'].some(id => !!((document.getElementById(id) || {}).value)) || !!((document.getElementById('service-filter-fast') || {}).checked) || !!((document.getElementById('service-filter-certified') || {}).checked);
        btn.classList.toggle('has-filter', active);
    }
    renderNexuService();
}
function resetServiceFilters() {
    serviceState.category = 'Todos';
    ['service-filter-category', 'service-filter-verified', 'service-filter-distance'].forEach(id => { const el = document.getElementById(id); if (el)
        el.value = ''; });
    const sort = document.getElementById('service-sort');
    if (sort)
        sort.value = 'recommended';
    ['service-filter-fast', 'service-filter-certified'].forEach(id => { const el = document.getElementById(id); if (el)
        el.checked = false; });
    applyServiceFilters();
}
function openServiceFilterModal() {
    const select = document.getElementById('service-filter-category');
    if (select)
        select.value = serviceState.category === 'Todos' ? '' : serviceState.category;
    const modal = document.getElementById('service-filter-modal');
    if (modal)
        modal.style.display = 'flex';
}
function closeServiceFilterModal(e) { if (!e || e.target.id === 'service-filter-modal') {
    const modal = document.getElementById('service-filter-modal');
    if (modal)
        modal.style.display = 'none';
} }
function selectServiceProfile(id) {
    const p = service_profiles.find(x => x.id === id);
    if (!p)
        return;
    serviceState.selectedId = id;
    renderServiceCatalog(getServiceFilteredItems());
    const title = document.getElementById('service-profile-title');
    const sub = document.getElementById('service-profile-sub');
    const body = document.getElementById('service-profile-body');
    if (title)
        title.innerHTML = `<i class="fas fa-screwdriver-wrench" style="color:var(--accent);margin-right:8px;"></i> ${serviceEscape(p.name)}`;
    if (sub)
        sub.textContent = `${p.specialty} - ${p.location}`;
    if (body) {
        body.innerHTML = `
      <div class="service-profile-head">
        <div class="service-avatar service-avatar-lg">${serviceInitials(p.name)}</div>
        <div style="flex:1;min-width:0;">
          <div class="nd-card-badges" style="margin-bottom:8px;">${serviceBadges(p)}</div>
          <div style="font-size:13px;color:var(--text-secondary);line-height:1.6;">${serviceEscape(p.description)}</div>
        </div>
      </div>
      <div class="service-profile-grid">
        <div class="service-info-box"><span>Experiencia</span><strong>${p.experienceYears} anos</strong></div>
        <div class="service-info-box"><span>Calificacion</span><strong>${p.rating} / 5</strong></div>
        <div class="service-info-box"><span>Zona de trabajo</span><strong>${serviceEscape(p.coverage)}</strong></div>
        <div class="service-info-box"><span>Verificacion</span><strong>${serviceVerificationLabel(p)}</strong></div>
      </div>
      <section class="service-detail-section"><h4>Certificaciones</h4><div class="filter-chips">${p.certifications.map(x => `<span class="filter-chip active">${serviceEscape(x)}</span>`).join('')}</div></section>
      <section class="service-detail-section"><h4>Maquinaria que domina</h4><div class="filter-chips">${p.machines.map(x => `<span class="filter-chip">${serviceEscape(x)}</span>`).join('')}</div></section>
      <section class="service-detail-section"><h4>Trabajos realizados</h4><div class="service-work-list">${p.jobs.map(x => `<div><i class="fas fa-check-circle"></i> ${serviceEscape(x)}</div>`).join('')}</div></section>
      <section class="service-detail-section"><h4>Calificaciones</h4><div class="service-work-list">${service_reviews.filter(r => r.profileId === p.id).map(r => `<div><i class="fas fa-star" style="color:var(--amber-400);"></i> ${r.rating}/5 - ${serviceEscape(r.text)}</div>`).join('') || '<div>Sin resenas publicadas todavia.</div>'}</div></section>
      <div class="service-profile-actions">
        <button class="btn btn-primary" onclick="openServiceRequest(${p.id})"><i class="fas fa-clipboard-list"></i> Solicitar servicio</button>
        <button class="btn btn-ghost" onclick="contactService(${p.id})"><i class="fas fa-message"></i> Contactar</button>
        <button class="btn ${isServiceFav(p.id) ? 'btn-primary' : 'btn-ghost'}" onclick="toggleServiceFavorite(${p.id});selectServiceProfile(${p.id})"><i class="${isServiceFav(p.id) ? 'fas' : 'far'} fa-heart"></i> Guardar</button>
      </div>`;
    }
    const modal = document.getElementById('service-profile-modal');
    if (modal)
        modal.style.display = 'flex';
}
function closeServiceProfile(e) { if (!e || e.target.id === 'service-profile-modal') {
    const modal = document.getElementById('service-profile-modal');
    if (modal)
        modal.style.display = 'none';
} }
let serviceRequestProfileId = null;
function openServiceRequest(id) {
    const p = service_profiles.find(x => x.id === id);
    if (!p)
        return;
    serviceRequestProfileId = id;
    const sub = document.getElementById('service-request-tech');
    if (sub)
        sub.textContent = `${p.name} - ${p.specialty}`;
    const problem = document.getElementById('service-req-problem');
    const machine = document.getElementById('service-req-machine');
    const location = document.getElementById('service-req-location');
    if (problem && serviceState.contextProblem)
        problem.value = serviceState.contextProblem;
    if (machine && serviceState.contextMachine)
        machine.value = serviceState.contextMachine;
    if (location && !location.value)
        location.value = 'Pergamino, Buenos Aires';
    const modal = document.getElementById('service-request-modal');
    if (modal)
        modal.style.display = 'flex';
}
function closeServiceRequest(e) { if (!e || e.target.id === 'service-request-modal') {
    const modal = document.getElementById('service-request-modal');
    if (modal)
        modal.style.display = 'none';
} }
function sendServiceRequest() {
    if (!serviceRequestProfileId)
        return;
    const get = id => { var _a; return ((_a = document.getElementById(id)) === null || _a === void 0 ? void 0 : _a.value) || ''; };
    const problem = get('service-req-problem');
    const machine = get('service-req-machine');
    service_requests.unshift({ id: Date.now(), profileId: serviceRequestProfileId, problem, machine, brand: get('service-req-brand'), model: get('service-req-model'), location: get('service-req-location'), description: get('service-req-desc'), status: 'sent', createdAt: new Date().toISOString() });
    saveServiceState();
    if (typeof pushUserAction === 'function') {
        pushUserAction('service_request', { profileId: serviceRequestProfileId, problem, machine });
    }
    closeServiceRequest();
    showToast('Solicitud enviada al tecnico', 'success');
}
function contactService(id) {
    const p = service_profiles.find(x => x.id === id);
    showToast(p ? `Contacto preparado para ${p.name}. No se abre WhatsApp automaticamente.` : 'Contacto preparado', 'info');
}
function serviceCategoryFromPause(reason, oferta) {
    const text = `${reason || ''} ${(oferta === null || oferta === void 0 ? void 0 : oferta.titulo) || ''} ${(oferta === null || oferta === void 0 ? void 0 : oferta.tipo) || ''}`.toLowerCase();
    if (text.includes('electrico'))
        return 'Electricidad';
    if (text.includes('hidraulico'))
        return 'Hidraulica';
    if (text.includes('pulver'))
        return 'Pulverizadoras';
    if (text.includes('cosech'))
        return 'Cosechadoras';
    if (text.includes('sembr'))
        return 'Sembradoras';
    if (text.includes('tractor'))
        return 'Tractores';
    if (text.includes('dron'))
        return 'Drones';
    if (text.includes('camion'))
        return 'Camiones';
    return 'Mecanica general';
}
function openNexuServiceFromPause(reason, oferta) {
    serviceState.contextProblem = reason || 'Mantenimiento';
    serviceState.contextMachine = (oferta === null || oferta === void 0 ? void 0 : oferta.titulo) || '';
    serviceState.contextCategory = serviceCategoryFromPause(reason, oferta);
    serviceState.category = serviceState.contextCategory;
    serviceState.q = '';
    const search = document.getElementById('service-search-input');
    if (search)
        search.value = '';
    showScreen('service');
    setTimeout(() => {
        renderNexuService();
        showToast('NexuService encontro tecnicos cercanos para esta maquinaria', 'success');
    }, 80);
}
let pendingPauseOfertaId = null;
let pendingPauseReason = '';
function openPauseReasonModal(id) {
    pendingPauseOfertaId = id;
    pendingPauseReason = '';
    document.querySelectorAll('#pause-reason-options .filter-chip').forEach(b => b.classList.remove('active'));
    const help = document.getElementById('pause-service-help');
    if (help)
        help.style.display = 'none';
    const btn = document.getElementById('pause-confirm-btn');
    if (btn) {
        btn.disabled = true;
        btn.style.display = '';
    }
    const modal = document.getElementById('pause-reason-modal');
    if (modal)
        modal.style.display = 'flex';
}
function closePauseReasonModal(e) {
    if (!e || e.target.id === 'pause-reason-modal') {
        const modal = document.getElementById('pause-reason-modal');
        if (modal)
            modal.style.display = 'none';
        pendingPauseOfertaId = null;
        pendingPauseReason = '';
    }
}
function selectPauseReason(reason, el) {
    pendingPauseReason = reason;
    document.querySelectorAll('#pause-reason-options .filter-chip').forEach(b => b.classList.remove('active'));
    if (el)
        el.classList.add('active');
    const needsHelp = ['Necesita mantenimiento', 'Problema mecanico', 'Problema electrico', 'Problema hidraulico'].includes(reason);
    const help = document.getElementById('pause-service-help');
    if (help)
        help.style.display = needsHelp ? 'block' : 'none';
    const btn = document.getElementById('pause-confirm-btn');
    if (btn) {
        btn.disabled = false;
        btn.style.display = needsHelp ? 'none' : '';
    }
}
function completePauseOferta(wantsService) {
    const o = ofertasData.find(x => x.id === pendingPauseOfertaId);
    if (!o || !pendingPauseReason)
        return;
    o.estado = 'pausada';
    o.pauseReason = pendingPauseReason;
    saveOfertasData();
    renderOfertas();
    const reason = pendingPauseReason;
    closePauseReasonModal();
    showToast(t('toasts.ofertaPaused'), 'warning');
    if (wantsService)
        openNexuServiceFromPause(reason, o);
}
document.addEventListener('DOMContentLoaded', function () {
    renderNexuService();
});

