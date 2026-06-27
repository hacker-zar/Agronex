"use strict";
/* ================================================================
   AGRONEX module: NexuDrive catalog, filters, favorites, search and listing display
   Extracted from java.js without behavior changes.
================================================================ */

// ---- original java.js lines 370-830 ----
// ===== MARKET =====
const marketData = [
    { id: 1, emoji: '🚜🌱', title: 'Sembradora John Deere 1113', price: 'Desde USD 85/ha', priceNum: 85, priceOperario: 105, serviceOptions: ['Solo maquinaria', 'Maquinaria + operario'], saving: 'Ahorrás $320.000', savingShort: 'Ahorrás $320K', cat: 'Sembradora', dist: '28 km', distNum: 28, avail: 'Disponible', availNow: true, operario: true, marca: 'John Deere', year: 2019, hp: 220, area: 'Pergamino, BA', rating: 4.8, reviews: 34, reservasCampana: 18, responseMin: 12 },
    { id: 2, emoji: '🚜🌾', title: 'Cosechadora Case IH 8250', price: 'USD 120/ha', priceNum: 120, serviceOptions: ['Maquinaria + operario'], saving: 'Ahorrás $180.000', savingShort: 'Ahorrás $180K', cat: 'Cosechadora', dist: '45 km', distNum: 45, avail: 'Disponible', availNow: true, operario: true, marca: 'Case IH', year: 2021, hp: 380, area: 'Junín, BA', rating: 4.9, reviews: 51, reservasCampana: 24, responseMin: 8 },
    { id: 3, emoji: '💦', title: 'Pulverizadora Jacto Uniport', price: 'USD 55/ha', priceNum: 55, serviceOptions: ['Solo maquinaria'], saving: 'Ahorrás $95.000', savingShort: 'Ahorrás $95K', cat: 'Pulverizadora', dist: '12 km', distNum: 12, avail: 'Disponible', availNow: true, operario: false, marca: 'Jacto', year: 2020, hp: 150, area: 'Rojas, BA', rating: 4.7, reviews: 28, reservasCampana: 11, responseMin: 22 },
    { id: 4, emoji: '🚜🌱', title: 'Sembradora Agrometal MX', price: 'Desde USD 75/ha', priceNum: 75, priceOperario: 92, serviceOptions: ['Solo maquinaria', 'Maquinaria + operario'], saving: 'Ahorrás $210.000', savingShort: 'Ahorrás $210K', cat: 'Sembradora', dist: '38 km', distNum: 38, avail: 'Disponible en 5 días', availNow: false, operario: true, marca: 'Agrometal', year: 2018, hp: 180, area: 'Ramallo, BA', rating: 4.6, reviews: 19, reservasCampana: 9, responseMin: 45 },
    { id: 5, emoji: '🚁', title: 'Dron fumigación — DJI Agras T40', price: 'USD 18/ha', priceNum: 18, serviceOptions: ['Servicio completo'], saving: 'Bajás $24/ha en agroquímicos', savingShort: '–$24/ha agro', cat: 'Dron', dist: '22 km', distNum: 22, avail: 'Disponible', availNow: true, operario: true, marca: 'DJI Agras', year: 2023, hp: null, area: 'Cañada de Gómez, SF', rating: 4.9, reviews: 41, reservasCampana: 30, responseMin: 5, trabajos: ['Fumigación', 'Pulverización', 'Aplicación aérea'], capacidad: '40 kg por vuelo', rendimiento: '~15 ha/h', servicio: 'Aplicación más precisa: usás hasta 20% menos de producto por hectárea' },
    { id: 6, emoji: '🚁', title: 'Dron monitoreo y diagnóstico', price: 'USD 8/ha', priceNum: 8, serviceOptions: ['Servicio completo'], saving: 'Detectá pérdidas invisibles', savingShort: 'Detecta pérdidas', cat: 'Dron', dist: '35 km', distNum: 35, avail: 'Disponible', availNow: true, operario: true, marca: 'DJI Mavic 3', year: 2022, hp: null, area: 'Pergamino, BA', rating: 4.7, reviews: 22, reservasCampana: 14, responseMin: 18, trabajos: ['Monitoreo', 'Relevamiento', 'Diagnóstico de cultivo'], capacidad: 'Cámara RGB + Multiespectral', rendimiento: '~80 ha/h vuelo', servicio: 'Incluye informe económico de lote: detecta focos de pérdida antes de que sean irreversibles' },
    { id: 7, emoji: '🚜', title: 'Tractor John Deere 6120J', price: 'USD 35/ha', priceNum: 35, priceOperario: 50, serviceOptions: ['Solo maquinaria', 'Maquinaria + operario'], saving: 'Ahorrás $140.000', savingShort: 'Ahorrás $140K', cat: 'Tractor', dist: '18 km', distNum: 18, avail: 'Disponible', availNow: true, operario: true, marca: 'John Deere', year: 2020, hp: 120, area: 'Venado Tuerto, SF', rating: 4.7, reviews: 23, reservasCampana: 16, responseMin: 15 },
    { id: 8, emoji: '🚜', title: 'Tractor New Holland T6.180', price: 'USD 42/ha', priceNum: 42, serviceOptions: ['Solo maquinaria'], saving: 'Ahorrás $160.000', savingShort: 'Ahorrás $160K', cat: 'Tractor', dist: '30 km', distNum: 30, avail: 'Disponible en 3 días', availNow: false, operario: false, marca: 'New Holland', year: 2021, hp: 180, area: 'Arrecifes, BA', rating: 4.8, reviews: 31, reservasCampana: 20, responseMin: 30 },
    { id: 9, emoji: '🚛', title: 'Camión Mercedes-Benz Atego 1729', price: 'USD 38/ha', priceNum: 38, serviceOptions: ['Maquinaria + operario'], saving: 'Flete flexible por campaña', savingShort: 'Camión 14 tn', cat: 'Camion', dist: '16 km', distNum: 16, avail: 'Disponible hoy', availNow: true, operario: true, marca: 'Mercedes-Benz', modelo: 'Atego 1729', year: 2020, hp: 290, area: 'Pergamino, BA', rating: 4.8, reviews: 18, reservasCampana: 12, responseMin: 9, capacidad: '14 toneladas', estado: 'Listo para carga', trabajos: ['Transporte de granos', 'Movimiento de insumos', 'Logística de cosecha'] },
    { id: 10, emoji: '🚚', title: 'Acoplado cerealero Ombú 3 ejes', price: 'USD 24/ha', priceNum: 24, serviceOptions: ['Solo maquinaria', 'Maquinaria + operario'], saving: 'Mayor capacidad por viaje', savingShort: 'Acoplado 28 tn', cat: 'Acoplado', dist: '24 km', distNum: 24, avail: 'Disponible', availNow: true, operario: false, marca: 'Ombú', modelo: 'Cerealero 3 ejes', year: 2019, hp: null, area: 'Rojas, BA', rating: 4.6, reviews: 14, reservasCampana: 8, responseMin: 18, capacidad: '28 toneladas', estado: 'Usado muy bueno', tipo: 'Cerealero', trabajos: ['Apoyo a cosecha', 'Transporte corto', 'Acopio temporal'] },
];
let selectedMarket = null;

const SALES_CATEGORIES = [
    { key: 'Tractor', label: 'Tractores', icon: 'fa-tractor' },
    { key: 'Sembradora', label: 'Sembradoras', icon: 'fa-seedling' },
    { key: 'Pulverizadora', label: 'Pulverizadoras', icon: 'fa-spray-can-sparkles' },
    { key: 'Cosechadora', label: 'Cosechadoras', icon: 'fa-wheat-awn' },
    { key: 'Dron', label: 'Drones', icon: 'fa-helicopter' },
    { key: 'Camion', label: 'Camiones', icon: 'fa-truck' },
    { key: 'Acoplado', label: 'Acoplados', icon: 'fa-trailer' },
    { key: 'Tolva', label: 'Tolvas', icon: 'fa-truck-ramp-box' },
];
const salesSchema = {
    sales_listings: ['id', 'category', 'brand', 'model', 'year', 'hours', 'condition', 'province', 'location', 'price', 'currency', 'verified', 'seller_id', 'status'],
    sales_photos: ['id', 'listing_id', 'url', 'kind', 'position', 'compressed'],
    sales_favorites: ['id', 'listing_id', 'user_id', 'created_at'],
    sales_contacts: ['id', 'listing_id', 'user_id', 'channel', 'message', 'created_at'],
    sales_views: ['id', 'listing_id', 'user_id', 'created_at'],
    sales_recommendations: ['id', 'listing_id', 'user_id', 'reason', 'score', 'created_at'],
};
let salesListings = [
    { id: 101, category: 'Tractor', brand: 'John Deere', model: '6155J', year: 2021, location: 'Pergamino', province: 'Buenos Aires', price: 128000, currency: 'USD', hours: 2150, condition: 'Usado excelente', verified: true, demand: true, featured: true, goodPrice: false, distanceKm: 28, photos: ['Frontal', 'Lateral', 'Cabina'], seller: 'Agroservicios Norte', sellerType: 'Empresa verificada', maintenance: 'Service oficial cada 500 h. Cubiertas 80%.', description: 'Tractor de alta demanda, listo para campaña fina y gruesa. Documentación al día.', specs: ['155 HP', 'Doble tracción', 'Piloto hidráulico', 'Toma de fuerza 540/1000'], createdDays: 2, priceDelta: -4, status: 'active' },
    { id: 102, category: 'Sembradora', brand: 'Agrometal', model: 'TX Mega', year: 2019, location: 'Venado Tuerto', province: 'Santa Fe', price: 92000, currency: 'USD', hours: 0, condition: 'Usado muy bueno', verified: true, demand: false, featured: false, goodPrice: true, distanceKm: 64, photos: ['Frontal', 'Lateral', 'Dosificador'], seller: 'El Trébol SRL', sellerType: 'Contratista verificado', maintenance: 'Dosificadores revisados y trenes de siembra calibrados.', description: 'Sembradora neumática para granos gruesos, muy cuidada y lista para trabajar.', specs: ['16 surcos', '52 cm', 'Monitor de siembra', 'Fertilizadora'], createdDays: 5, priceDelta: -8, status: 'active' },
    { id: 103, category: 'Pulverizadora', brand: 'Metalfor', model: 'Multiple 3200', year: 2020, location: 'Río Cuarto', province: 'Córdoba', price: 155000, currency: 'USD', hours: 1780, condition: 'Usado excelente', verified: true, demand: true, featured: false, goodPrice: true, distanceKm: 140, photos: ['Frontal', 'Barral', 'Motor'], seller: 'Campo Sur', sellerType: 'Productor verificado', maintenance: 'Barral repasado, picos nuevos y bomba en garantía.', description: 'Pulverizadora autopropulsada con muy buen estado general.', specs: ['3200 litros', 'Barral 32 m', 'Piloto automático', 'Corte por sección'], createdDays: 1, priceDelta: -2, status: 'active' },
    { id: 104, category: 'Cosechadora', brand: 'Case IH', model: 'Axial Flow 7230', year: 2018, location: 'Junín', province: 'Buenos Aires', price: 265000, currency: 'USD', hours: 3120, condition: 'Usado bueno', verified: false, demand: false, featured: true, goodPrice: false, distanceKm: 46, photos: ['Frontal', 'Lateral', 'Interior'], seller: 'Mario Fernández', sellerType: 'Productor', maintenance: 'Mantenimiento propio documentado. Plataforma opcional.', description: 'Cosechadora con historial completo y buen rendimiento en maíz y soja.', specs: ['Motor 8.7 L', 'Rotor axial', 'Tolva 10570 L', 'Monitor AFS'], createdDays: 8, priceDelta: 0, status: 'active' },
    { id: 105, category: 'Dron', brand: 'DJI', model: 'Agras T40', year: 2023, location: 'Rosario', province: 'Santa Fe', price: 28000, currency: 'USD', hours: 420, condition: 'Usado excelente', verified: true, demand: true, featured: true, goodPrice: true, distanceKm: 92, photos: ['Frontal', 'Baterías', 'Control'], seller: 'AeroAgro Tech', sellerType: 'Empresa verificada', maintenance: 'Incluye 4 baterías, cargador y service reciente.', description: 'Dron agrícola para aplicación y cobertura rápida en lotes chicos o zonas complicadas.', specs: ['Tanque 40 L', 'Radar activo', '4 baterías', 'Control remoto pro'], createdDays: 3, priceDelta: -6, status: 'active' },
    { id: 106, category: 'Tolva', brand: 'Cestari', model: 'S6 26000', year: 2022, location: 'Tandil', province: 'Buenos Aires', price: 39000, currency: 'USD', hours: 0, condition: 'Usado muy bueno', verified: true, demand: false, featured: false, goodPrice: true, distanceKm: 210, photos: ['Frontal', 'Lateral', 'Sinfin'], seller: 'La Esperanza', sellerType: 'Productor verificado', maintenance: 'Sin golpes estructurales. Sinfín en excelente estado.', description: 'Tolva autodescargable con muy poco uso y cubiertas en gran estado.', specs: ['26000 L', 'Balanza', 'Eje balancín', 'Sinfín reforzado'], createdDays: 4, priceDelta: -3, status: 'paused' },
];
function readStoredJSON(key, fallback) {
    try {
        const value = JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
        return value == null ? fallback : value;
    }
    catch (e) {
        console.warn("[Agronex]", e);
        return fallback;
    }
}
let salesFavorites = readStoredJSON('agronex_sales_favs', []);
let currentNexuMode = 'rental';
let currentSalesCategory = 'Todos';
let selectedSalesListing = null;
let salesWizardStep = 1;
let salesWizardData = {};
// ============================================================
//  INVISIBLE AI ENGINE — NexuDrive Intelligence Layer
//  Reads: campaigns, bookings, costs, behavior, marketData
//  Outputs: scores, badges, alerts, smart sort, insights
// ============================================================
const AI = {
    // ── 1. SCORING ENGINE ────────────────────────────────────
    // Returns 0–100 composite score per machine.
    // Weights: price(30) + distance(25) + rating(20) + availability(15) + response(10)
    score(m, contextHa) {
        const ha = contextHa || 150;
        // Price: compare against category median
        const catItems = marketData.filter(x => x.cat === m.cat);
        const prices = catItems.map(x => x.priceNum).sort((a, b) => a - b);
        const medPrice = prices[Math.floor(prices.length / 2)] || m.priceNum;
        const priceScore = Math.max(0, Math.min(100, 100 - ((m.priceNum - medPrice) / medPrice) * 120));
        // Distance: 100 = 0km, 0 = 80km+
        const distScore = Math.max(0, 100 - (m.distNum / 80) * 100);
        // Rating: 4.5–5.0 maps to 70–100
        const ratingScore = Math.min(100, Math.max(0, (m.rating - 4.0) / 1.0 * 100));
        // Availability: available now = 100, future = 40
        const availScore = m.availNow ? 100 : 40;
        // Response speed: <15min = 100, >60min = 20
        const respScore = Math.max(20, Math.min(100, 100 - (m.responseMin / 60) * 80));
        return Math.round(priceScore * 0.30 +
            distScore * 0.25 +
            ratingScore * 0.20 +
            availScore * 0.15 +
            respScore * 0.10);
    },
    // ── 2. AUTO-SORT (by score desc) ────────────────────────
    sortedMarket(items, contextHa) {
        return [...items].sort((a, b) => AI.score(b, contextHa) - AI.score(a, contextHa));
    },
    // ── 3. BADGES ────────────────────────────────────────────
    // Returns array of badge objects {text, color, icon} per machine
    badges(m, allItems) {
        const badges = [];
        const scores = allItems.map(x => ({ id: x.id, s: AI.score(x) })).sort((a, b) => b.s - a.s);
        const rank = scores.findIndex(x => x.id === m.id);
        const catItems = allItems.filter(x => x.cat === m.cat);
        // Mejor opción overall
        if (rank === 0)
            badges.push({ text: 'Mejor opción', icon: '🏆', color: 'gold' });
        // Más cercano en su categoría
        const closestInCat = [...catItems].sort((a, b) => a.distNum - b.distNum)[0];
        if ((closestInCat === null || closestInCat === void 0 ? void 0 : closestInCat.id) === m.id && catItems.length > 1)
            badges.push({ text: 'Más cercano', icon: '📍', color: 'blue' });
        // Menor costo en su categoría
        const cheapestInCat = [...catItems].sort((a, b) => a.priceNum - b.priceNum)[0];
        if ((cheapestInCat === null || cheapestInCat === void 0 ? void 0 : cheapestInCat.id) === m.id && catItems.length > 1)
            badges.push({ text: 'Menor costo', icon: '💰', color: 'green' });
        // Más reservado
        const maxRes = Math.max(...allItems.map(x => x.reservasCampana || 0));
        if (m.reservasCampana === maxRes && maxRes > 0)
            badges.push({ text: 'Más reservado', icon: '🔥', color: 'red' });
        // Disponible hoy
        if (m.availNow)
            badges.push({ text: 'Disponible hoy', icon: '✅', color: 'green' });
        // Respuesta rápida (<15min)
        if (m.responseMin <= 15)
            badges.push({ text: 'Respuesta rápida', icon: '⚡', color: 'amber' });
        // Nuevo (year >= 2022)
        if (m.year >= 2022)
            badges.push({ text: 'Equipo nuevo', icon: '✨', color: 'blue' });
        // Return max 3 most relevant
        return badges.slice(0, 3);
    },
    // ── 4. CONTEXTUAL MICRO-INSIGHT per machine ──────────────
    // One-line insight shown in detail panel
    insight(m, allItems) {
        const catItems = allItems.filter(x => x.cat === m.cat && x.id !== m.id);
        const cheaperAlt = catItems.filter(x => x.priceNum < m.priceNum);
        const closerAlt = catItems.filter(x => x.distNum < m.distNum);
        const score = AI.score(m, 150);
        const topScore = AI.score(allItems.reduce((best, x) => AI.score(x) > AI.score(best) ? x : best), 150);
        if (score === topScore)
            return { icon: '🏆', text: 'Esta es la mejor opción disponible para tu zona.', color: 'green' };
        if (m.distNum <= 20 && m.availNow)
            return { icon: '📍', text: `A solo ${m.dist} — podría trabajar esta semana.`, color: 'green' };
        if (cheaperAlt.length && m.priceNum > cheaperAlt[0].priceNum) {
            const diff = Math.round(((m.priceNum - cheaperAlt[0].priceNum) / m.priceNum) * 100);
            return { icon: '💡', text: `Hay opciones ${diff}% más baratas en esta categoría.`, color: 'amber' };
        }
        if (closerAlt.length)
            return { icon: '📍', text: `Hay equipos más cercanos disponibles.`, color: 'amber' };
        if (m.reservasCampana >= 20)
            return { icon: '🔥', text: `Alta demanda — ${m.reservasCampana} reservas esta campaña.`, color: 'red' };
        if (m.rating >= 4.8)
            return { icon: '⭐', text: `Muy bien puntuado: ${m.rating} con ${m.reviews} reseñas.`, color: 'green' };
        return null;
    },
    // ── 5. MATCHING — best machine for a given context ──────
    // context: { cat, ha, date, needOperario }
    bestMatch(context) {
        let candidates = [...marketData];
        if (context.cat)
            candidates = candidates.filter(m => m.cat === context.cat);
        if (context.needOperario)
            candidates = candidates.filter(m => m.operario);
        if (!candidates.length)
            candidates = [...marketData];
        return AI.sortedMarket(candidates, context.ha)[0] || null;
    },
    // ── 6. SMART ALERTS (shown in NexuDrive top bar) ────────
    alerts() {
        var _a;
        const out = [];
        const bookings = Object.values(nexuDriveBookings || {});
        const hasPending = bookings.some(b => ['reserved', 'confirmed'].includes(b.status));
        const campañas = ((_a = window.perfilData) === null || _a === void 0 ? void 0 : _a.cultivos) || ['Soja'];
        const now = new Date();
        const month = now.getMonth(); // 0-based
        // High season alert (Sep-Nov in Argentina)
        if (month >= 8 && month <= 10) {
            out.push({ icon: '🔥', text: 'Alta temporada de siembra — la disponibilidad baja rápido.', color: 'red', cta: 'Reservar ahora' });
        }
        // Cost saving opportunity
        const camionesCercanos = marketData.filter(m => m.cat === 'Camion' && m.availNow && m.distNum <= 25);
        if (camionesCercanos.length) {
            out.push({ icon: '🚛', text: `${camionesCercanos.length} camión${camionesCercanos.length !== 1 ? 'es' : ''} disponible${camionesCercanos.length !== 1 ? 's' : ''} cerca tuyo`, color: 'green', cta: 'Ver camiones', category: 'Camion' });
        }
        const acopladosValor = marketData.filter(m => m.cat === 'Acoplado' && m.availNow);
        if (acopladosValor.length) {
            out.push({ icon: '🚚', text: 'Acoplados con mejor relación costo/capacidad', color: 'amber', cta: 'Ver opciones', category: 'Acoplado' });
        }
        // Pending coordination
        if (hasPending) {
            out.push({ icon: '📋', text: 'Tenés reservas pendientes de coordinación.', color: 'amber', cta: 'Ver reservas' });
        }
        return out.slice(0, 2); // max 2 alerts
    },
    // ── 7. SMART WA MESSAGE ──────────────────────────────────
    waMessage(m, booking) {
        const ha = (booking === null || booking === void 0 ? void 0 : booking.hectares) || '—';
        const fecha = (booking === null || booking === void 0 ? void 0 : booking.fecha) || 'a confirmar';
        const op = (booking === null || booking === void 0 ? void 0 : booking.operario) === 'Maquinaria + operario' ? 'con operario' : 'sin operario';
        const lote = (booking === null || booking === void 0 ? void 0 : booking.notas) ? `\nLote/zona: ${booking.notas}` : '';
        const nombreUsuario = (typeof AgronexBus !== 'undefined' && AgronexBus.fullName)
            ? AgronexBus.fullName()
            : 'Productor';
        return `Hola, soy ${nombreUsuario}. Reservé la *${m.title}* a través de Agronex (ID: ${(booking === null || booking === void 0 ? void 0 : booking.txId) || '—'}).\n\n📋 Detalles:\n• Hectáreas: ${ha} ha\n• Fecha estimada: ${fecha}\n• Servicio: ${op}${lote}\n\n¿Confirmamos la llegada?`;
    },
    // ── 8. OWNER INSIGHTS (for machine owners) ───────────────
    ownerInsights(m) {
        const days = 10; // mock idle days
        const potIncome = m.priceNum * 150; // 150 ha potential
        const demandLevel = m.reservasCampana >= 20 ? 'alta' : m.reservasCampana >= 10 ? 'media' : 'baja';
        return {
            idleDays: days,
            potIncome,
            demandLevel,
            tips: [
                days > 7 ? `Tu equipo lleva ${days} días sin reservas.` : null,
                demandLevel === 'alta' ? `Alta demanda en tu zona — buen momento para publicar.` : null,
                `Podés generar hasta USD ${potIncome} por campaña con 150 ha.`,
            ].filter(Boolean),
        };
    },
};
// ── Compute scores and sort market once on load ──────────
function aiSortMarket() {
    const sorted = AI.sortedMarket(marketData, 150);
    // Write score back to each item for use in renderMarket
    sorted.forEach((m, idx) => { m._score = AI.score(m, 150); m._rank = idx; });
    return sorted;
}
const PAYMENT_CONFIG = {
    depositRate: 0.20,
    commissionRate: 0.10,
};
let nexuDriveBookings = readStoredJSON('agronex_bookings', {});
window.nexuDriveBookings = nexuDriveBookings;
let listingReports = readStoredJSON('agronex_listing_reports', []);
let selectedReportReason = '';
const reportModerationSchema = {
    listing_reports: ['report_id', 'listing_id', 'reporter_user_id', 'reason', 'description', 'created_at', 'status'],
    statuses: ['pendiente', 'revisada', 'descartada', 'validada'],
};
function saveListingReports() {
    try {
        localStorage.setItem('agronex_listing_reports', JSON.stringify(listingReports));
    }
    catch (e) { console.warn("[Agronex]", e); }
}
function currentReporterId() {
    return (window.perfilData && (perfilData.email || perfilData.nombre)) || 'demo-user';
}
function validateField(value, rules) {
    const cfg = rules || {};
    const raw = value === undefined || value === null ? '' : String(value).trim();
    if (cfg.required && !raw)
        return { valid: false, message: 'Completá este campo para continuar.' };
    if (cfg.minLength && raw.length < cfg.minLength)
        return { valid: false, message: `Ingresá al menos ${cfg.minLength} caracteres.` };
    if (cfg.maxLength && raw.length > cfg.maxLength)
        return { valid: false, message: `El máximo permitido es ${cfg.maxLength} caracteres.` };
    if (cfg.type === 'number') {
        const n = Number(raw);
        if (!raw || Number.isNaN(n))
            return { valid: false, message: 'Ingresá un número válido.' };
        if (cfg.min !== undefined && n < cfg.min)
            return { valid: false, message: `El valor mínimo es ${cfg.min}.` };
        if (cfg.max !== undefined && n > cfg.max)
            return { valid: false, message: `El valor máximo es ${cfg.max}.` };
    }
    if (cfg.type === 'date') {
        const d = new Date(`${raw}T12:00:00`);
        if (!raw || Number.isNaN(d.getTime()))
            return { valid: false, message: 'Ingresá una fecha válida.' };
    }
    return { valid: true, message: '' };
}
function listingReportId(kind, id) {
    return `${kind}:${id}`;
}
function getReportListing(kind, id) {
    if (kind === 'sales') {
        const item = salesListings.find(x => Number(x.id) === Number(id));
        return item ? { title: salesListingTitle(item), ownerText: `${item.brand || ''} ${item.model || ''}`.trim() } : null;
    }
    const item = marketData.find(x => Number(x.id) === Number(id));
    return item ? { title: item.title, ownerText: item.title } : null;
}
function isOwnListing(kind, id) {
    const listing = getReportListing(kind, id);
    if (!listing)
        return false;
    const exactId = Number(id);
    // TODO: conectar sourceId cuando backend esté disponible.
    if (kind === 'market' || kind === 'rental') {
        const bySourceId = (ofertasData || []).some(o => Number(o.sourceId) === exactId);
        if (bySourceId)
            return true;
    }
    const title = String(listing.ownerText || listing.title || '').toLowerCase();
    return (ofertasData || []).some(o => {
        const ownTitle = String(o.titulo || o.title || '').toLowerCase();
        return ownTitle && (title.includes(ownTitle) || ownTitle.includes(title));
    });
}
function hasRecentDuplicateReport(listingId, reporterId, reason) {
    const now = Date.now();
    return listingReports.some(r => r.listing_id === listingId && r.reporter_user_id === reporterId && r.reason === reason && (now - new Date(r.created_at).getTime()) < 5 * 60 * 1000);
}
function openReportListingModal(kind, id, ev) {
    if (ev)
        ev.stopPropagation();
    if (isOwnListing(kind, id)) {
        showToast('No podés denunciar tu propia oferta.', 'warning');
        return;
    }
    const listing = getReportListing(kind, id);
    if (!listing)
        return;
    selectedReportReason = '';
    document.querySelectorAll('.report-reason').forEach(b => b.classList.remove('active'));
    const kindEl = document.getElementById('report-listing-kind');
    const idEl = document.getElementById('report-listing-id');
    const sub = document.getElementById('report-listing-sub');
    const desc = document.getElementById('report-description');
    if (kindEl)
        kindEl.value = kind;
    if (idEl)
        idEl.value = id;
    if (sub)
        sub.textContent = listing.title;
    if (desc)
        desc.value = '';
    updateReportCounter();
    document.getElementById('report-listing-modal').style.display = 'flex';
}
function closeReportListingModal(e) {
    if (!e || e.target.id === 'report-listing-modal') {
        document.getElementById('report-listing-modal').style.display = 'none';
    }
}
function selectReportReason(btn, reason) {
    selectedReportReason = reason;
    document.querySelectorAll('.report-reason').forEach(b => b.classList.remove('active'));
    if (btn)
        btn.classList.add('active');
}
function updateReportCounter() {
    const desc = document.getElementById('report-description');
    const counter = document.getElementById('report-counter');
    if (counter)
        counter.textContent = String((desc && desc.value ? desc.value.length : 0));
}
function submitListingReport() {
    const kind = document.getElementById('report-listing-kind')?.value;
    const id = document.getElementById('report-listing-id')?.value;
    const description = (document.getElementById('report-description')?.value || '').trim().slice(0, 500);
    const reasonCheck = validateField(selectedReportReason, { required: true });
    if (!reasonCheck.valid) {
        showToast('Elegí un motivo para enviar la denuncia.', 'warning');
        return;
    }
    const listingId = listingReportId(kind, id);
    const reporterId = currentReporterId();
    if (hasRecentDuplicateReport(listingId, reporterId, selectedReportReason)) {
        showToast('Ya enviaste una denuncia similar hace unos minutos.', 'warning');
        return;
    }
    const activeReports = listingReports.filter(r => r.reporter_user_id === reporterId && r.status === 'pendiente').length;
    if (activeReports >= 10) {
        showToast('Alcanzaste el límite de denuncias activas.', 'warning');
        return;
    }
    const reasonKey = String(selectedReportReason || '').toLowerCase();
    if (['fraude', 'datos_falsos', 'posible estafa', 'información falsa'].includes(reasonKey) && description.length < 20) {
        showToast('Para este motivo, escribí al menos 20 caracteres en la descripción.', 'warning');
        return;
    }
    listingReports.push({
        report_id: `rep_${Date.now()}`,
        listing_id: listingId,
        reporter_user_id: reporterId,
        reason: selectedReportReason,
        description,
        created_at: new Date().toISOString(),
        status: 'pendiente'
    });
    saveListingReports();
    closeReportListingModal();
    showToast('Gracias. Revisaremos esta publicación.', 'success');
}
function renderAIAlerts() {
    const container = document.getElementById('ai-alerts-strip');
    if (!container)
        return;
    if (document.getElementById('nd-ia-strip')) {
        container.style.display = 'none';
        container.innerHTML = '';
        return;
    }
    const alerts = AI.alerts();
    if (!alerts.length) {
        container.style.display = 'none';
        return;
    }
    container.style.display = 'flex';
    container.innerHTML = alerts.map(a => `
    <div class="ai-alert ai-alert-${a.color}">
      <span>${a.icon} ${a.text}</span>
      ${a.cta ? `<button class="ai-alert-cta" onclick="${a.targetId ? `selectMarket(${a.targetId})` : `showScreen('reservas')`}">${a.cta} →</button>` : ''}
    </div>
  `).join('');
}
function renderOpportunityContextBanner() {
    const el = document.getElementById('market-context-banner');
    if (!el)
        return;
    const ctx = (typeof AgronexBus !== 'undefined' && AgronexBus.consumeOpportunityContext)
        ? AgronexBus.consumeOpportunityContext()
        : null;
    if (!ctx || !ctx.impactUsd || ctx.impactUsd <= 0) {
        el.style.display = 'none';
        el.innerHTML = '';
        return;
    }
    const impact = Math.round(ctx.impactUsd).toLocaleString('es-AR');
    el.style.display = 'block';
    el.innerHTML = `
    <div class="market-context-banner-inner">
      <div class="market-context-banner-icon"><i class="fas fa-bullseye"></i></div>
      <div class="market-context-banner-text">
        <strong>Detectamos un sobrecosto de hasta USD ${impact}</strong>
        <span>${ctx.title || 'Te mostramos alternativas disponibles para tu campaña.'}</span>
      </div>
    </div>`;
}
document.addEventListener('DOMContentLoaded', function () {
    onShowScreen(function (id) {
        if (id === 'market') {
            setTimeout(() => {
                if (typeof renderOpportunityContextBanner === 'function')
                    renderOpportunityContextBanner();
            }, 50);
        }
    });
});
// Smart match: suggest best machine based on current calc context
function renderSmartMatch() {
    var _a, _b;
    const cultivo = ((_a = document.getElementById('c-cultivo')) === null || _a === void 0 ? void 0 : _a.value) || 'soja';
    const ha = parseFloat((_b = document.getElementById('c-ha')) === null || _b === void 0 ? void 0 : _b.value) || 150;
    const catMap = { soja: 'Sembradora', maiz: 'Sembradora', trigo: 'Sembradora' };
    const match = AI.bestMatch({ cat: catMap[cultivo], ha, needOperario: false });
    const el = document.getElementById('smart-match-banner');
    if (!el || !match)
        return;
    el.style.display = 'flex';
    el.innerHTML = `
    <div class="smart-match-inner">
      <span class="smart-match-icon">🏆</span>
      <div class="smart-match-text">
        <strong>Mejor opción para ${ha} ha de ${cultivo}:</strong>
        ${match.title} — ${match.price} a ${match.dist}
      </div>
      <button class="btn btn-primary btn-sm" onclick="showScreen('market');setTimeout(()=>selectMarket(${match.id}),150)">
        Ver →
      </button>
    </div>
  `;
}
function serviceOptionsFor(m) {
    var _a;
    return ((_a = m === null || m === void 0 ? void 0 : m.serviceOptions) === null || _a === void 0 ? void 0 : _a.length) ? m.serviceOptions : ((m === null || m === void 0 ? void 0 : m.operario) ? ['Solo maquinaria', 'Maquinaria + operario'] : ['Solo maquinaria']);
}
function serviceLabelFor(m) {
    const opts = serviceOptionsFor(m);
    if (opts.length > 1)
        return 'Ambas opciones';
    return opts[0] || 'Solo maquinaria';
}
function servicePriceFor(m, service) {
    if (!m)
        return 0;
    const base = Number(m.priceNum) || parseFloat(String(m.price || '').replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
    if (service === 'Maquinaria + operario')
        return Number(m.priceOperario) || base;
    return base;
}
function fmtUSDPlain(n) {
    return 'USD ' + Math.round(Math.abs(n)).toLocaleString('es-AR');
}
function fmtPct(n) {
    return `${Math.round(n * 100)}%`;
}
function bookingKey(id) {
    return `machine-${id}`;
}
function getBooking(id) {
    return nexuDriveBookings[bookingKey(id)] || null;
}
function hasPaidReservation(id) {
    const booking = getBooking(id);
    return !!booking && ['reservado', 'confirmado', 'en camino', 'trabajando', 'finalizado'].includes(booking.status);
}
function saveBookings() {
    localStorage.setItem('agronex_bookings', JSON.stringify(nexuDriveBookings));
    window.nexuDriveBookings = nexuDriveBookings;
    updateReservasBadge();
}
function checkMachineAvailability(machine) {
    if (!machine)
        return false;
    return machine.avail !== 'Sin disponibilidad' && machine.avail !== 'No disponible' && machine.avail != null;
}

// ---- original java.js lines 1622-3308 ----
// ===== FAVOURITES =====
let favIds = readStoredJSON('agronex_favs', []);
function isFav(id) { return favIds.includes(id); }
function saveFavs() {
    localStorage.setItem('agronex_favs', JSON.stringify(favIds));
    updateFavBadge();
}
function updateFavBadge() {
    const badge = document.getElementById('fav-nav-badge');
    if (badge)
        badge.style.display = 'none';
}
function toggleFav(id) {
    if (isFav(id)) {
        favIds = favIds.filter(x => x !== id);
        showToast('Quitado de favoritos', 'info');
    }
    else {
        favIds.push(id);
        showToast('💚 Guardado en favoritos', 'success');
    }
    saveFavs();
    renderMarket();
    renderFavoritos();
}
function renderFavoritos() {
    const grid = document.getElementById('favoritos-grid');
    const empty = document.getElementById('favoritos-empty');
    if (!grid || !empty)
        return;
    const items = marketData.filter(m => favIds.includes(m.id));
    const salesItems = salesListings.filter(m => salesFavorites.includes(m.id));
    const serviceFavs = Array.isArray(globalThis.service_favorites) ? globalThis.service_favorites : [];
    const serviceItems = (typeof service_profiles !== 'undefined' ? service_profiles : []).filter(p => serviceFavs.includes(p.id));
    if (items.length === 0 && salesItems.length === 0 && serviceItems.length === 0) {
        grid.style.display = 'none';
        empty.style.display = 'block';
    }
    else {
        empty.style.display = 'none';
        grid.style.display = 'grid';
        const rentalHTML = items.map(m => `
      <div class="market-card" onclick="showScreen('market');setTimeout(()=>selectMarket(${m.id}),100);">
        <div class="market-card-img">
          ${m.emoji}
          <div class="market-saving-badge">${m.savingShort}</div>
          <button class="fav-btn fav-active" onclick="event.stopPropagation();toggleFav(${m.id})" title="Quitar de favoritos">
            <i class="fas fa-heart"></i>
          </button>
        </div>
        <div class="market-card-body">
          <div class="market-card-saving">${m.saving}</div>
          <div class="market-card-title">${m.title}</div>
          <div class="market-card-price">${m.price}</div>
          <div class="market-card-meta">
            <span class="market-card-meta-item"><i class="fas fa-map-pin"></i> ${m.dist}</span>
            <span class="market-card-meta-item"><i class="fas fa-clock"></i> ${m.avail}</span>
          </div>
        </div>
      </div>`).join('');
        const salesHTML = salesItems.map(item => {
            const statusLabel = item.status === 'sold' ? 'Publicación vendida' : item.status === 'paused' ? 'Publicación pausada' : 'Activa';
            const similar = salesListings.filter(x => x.category === item.category && x.id !== item.id).length;
            const delta = item.priceDelta < 0 ? `Bajó ${Math.abs(item.priceDelta)}%` : item.priceDelta > 0 ? `Subió ${item.priceDelta}%` : 'Sin variación';
            return `
      <div class="market-card" onclick="showScreen('market');switchNexuMode('sales');setTimeout(()=>selectSalesMarket(${item.id}),120);">
        <div class="market-card-img">
          ${getSalesCatIcon(item.category)}
          <div class="market-saving-badge">${delta}</div>
          <div class="nd-avail-badge ${item.status === 'paused' ? 'nd-avail-soon' : 'nd-avail-now'}"><i class="fas fa-circle" style="font-size:7px;"></i> ${statusLabel}</div>
          <button class="fav-btn fav-active" onclick="event.stopPropagation();toggleSalesFavorite(${item.id});renderFavoritos()" title="Quitar favorito">
            <i class="fas fa-heart"></i>
          </button>
        </div>
        <div class="market-card-body">
          <div class="ai-badges-row">${salesCardBadges(item)}</div>
          <div class="market-card-saving"><i class="fas fa-store" style="font-size:9px;"></i> Compra/Venta</div>
          <div class="market-card-title">${salesListingTitle(item)}</div>
          <div class="market-card-price">${salesMoney(item)}</div>
          <div class="market-card-meta">
            <span class="market-card-meta-item"><i class="fas fa-chart-line"></i> ${delta}</span>
            <span class="market-card-meta-item"><i class="fas fa-layer-group"></i> ${similar} similares</span>
            <span class="market-card-meta-item"><i class="fas fa-map-pin"></i> ${item.location}</span>
          </div>
        </div>
      </div>`;
        }).join('');
        const serviceHTML = serviceItems.map(p => `
      <div class="market-card service-fav-card" onclick="showScreen('service');setTimeout(()=>selectServiceProfile(${p.id}),120);">
        <div class="market-card-img service-card-photo">
          ${p.photo ? `<img src="${p.photo}" alt="${serviceEscape(p.name)}">` : `<div class="service-avatar">${serviceInitials(p.name)}</div>`}
          <div class="market-saving-badge">Técnico</div>
          <button class="fav-btn fav-active" onclick="event.stopPropagation();toggleServiceFavorite(${p.id});renderFavoritos()" title="Quitar técnico de favoritos">
            <i class="fas fa-heart"></i>
          </button>
        </div>
        <div class="market-card-body">
          <div class="market-card-saving"><i class="fas fa-screwdriver-wrench" style="font-size:9px;"></i> NexuService</div>
          <div class="market-card-title">${serviceEscape(p.name)}</div>
          <div class="market-card-price">${serviceEscape(p.specialty)}</div>
          <div class="market-card-meta">
            <span class="market-card-meta-item"><i class="fas fa-map-pin"></i> ${serviceEscape(p.location)}</span>
            <span class="market-card-meta-item"><i class="fas fa-star" style="color:var(--amber-400);"></i> ${p.rating} (${p.reviews})</span>
            <span class="market-card-meta-item"><i class="fas fa-briefcase"></i> ${p.experienceYears} años</span>
          </div>
          <div class="nd-card-badges">${serviceBadges(p)}</div>
        </div>
      </div>`).join('');
        grid.innerHTML = rentalHTML + salesHTML + serviceHTML;
    }
}
// ===== FILTERS =====
let activeFilters = { cat: 'Todos', serv: 'Cualquiera', year: '', dist: '', avail: 'Cualquiera' };
function quickCatFilter(cat, el) {
    // Update quick chip active state
    document.querySelectorAll('#quick-cat-chips .filter-chip').forEach(c => c.classList.remove('active'));
    document.querySelectorAll('.nd-cat').forEach(b => {
        b.classList.toggle('active', b.dataset.cat === cat);
    });
    if (el)
        el.classList.add('active');
    // Filter market
    if (cat === 'Todos') {
        renderMarket();
    }
    else if (cat === 'Flete') {
        const filtered = marketData.filter(m => ['Camion', 'Acoplado'].includes(m.cat));
        renderMarket(filtered);
    }
    else if (cat === 'Servicio') {
        const filtered = marketData.filter(m => m.operario || ['Pulverizadora', 'Sembradora', 'Cosechadora', 'Dron'].includes(m.cat));
        renderMarket(filtered);
    }
    else {
        const filtered = marketData.filter(m => m.cat === cat);
        renderMarket(filtered);
    }
}
function quickSearchMarket(q) {
    const filtered = marketData.filter(m => !q || m.title.toLowerCase().includes(q.toLowerCase()) ||
        m.area.toLowerCase().includes(q.toLowerCase()) ||
        m.cat.toLowerCase().includes(q.toLowerCase()) ||
        (m.trabajos && m.trabajos.some(t => t.toLowerCase().includes(q.toLowerCase()))));
    renderMarket(filtered);
    if (q && q.trim().length > 1 && typeof pushUserAction === 'function') {
        pushUserAction('search', { query: q.trim() });
    }
}
// Legacy shim so any old code that calls updatePublishPreview still works
function updatePublishPreview() {
    if (typeof pubUpdatePreview === 'function')
        pubUpdatePreview();
}
function filterChip(el) {
    document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
    el.classList.add('active');
    activeFilters.cat = el.textContent.trim();
    applyFilters();
}
function closeFilterModal(e) {
    if (!e || e.target.id === 'filter-modal') {
        document.getElementById('filter-modal').style.display = 'none';
    }
}
function toggleFilterChip(el, group) {
    el.parentElement.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
    el.classList.add('active');
}
function salesMoney(item) {
    return `${item.currency} ${Math.round(item.price).toLocaleString('es-AR')}`;
}
function salesBadgeHTML(item) {
    const badges = [];
    if (item.verified)
        badges.push('<span class="sales-badge verified"><i class="fas fa-check-circle"></i> Verificado</span>');
    if (item.demand)
        badges.push('<span class="sales-badge demand"><i class="fas fa-fire"></i> Alta demanda</span>');
    if (item.featured)
        badges.push('<span class="sales-badge featured"><i class="fas fa-star"></i> Destacado</span>');
    if (item.goodPrice)
        badges.push('<span class="sales-badge price"><i class="fas fa-coins"></i> Buen precio</span>');
    return badges.join('');
}
function salesRecommendation(item) {
    const haText = UserStore && UserStore.get ? UserStore.get('ha') : '100-500';
    if (item.goodPrice && item.category === 'Tractor')
        return 'Comprar este equipo podría ser más rentable que alquilarlo para tu escala productiva.';
    if (item.distanceKm <= 50)
        return 'Encontramos opciones competitivas cerca de tu zona.';
    if (item.category === 'Dron')
        return 'Según tu operación, este equipo puede reducir gastos de aplicaciones puntuales.';
    if (haText === 'mas1500')
        return 'Por tu escala productiva, este equipo puede mejorar disponibilidad operativa.';
    return 'Este equipo es compatible con productores que combinan maquinaria propia y alquiler.';
}
function initSalesMarket() {
    // El grid unificado ya está activo en market-grid.
    // Solo inicializar el estado visual de compra.
    renderSalesUnified();
    renderSalesUnifiedIA();
}
function renderSalesCategories() {
    const wrap = document.getElementById('sales-cats');
    if (!wrap)
        return;
    const all = [{ key: 'Todos', label: 'Todos', icon: 'fa-border-all' }, ...SALES_CATEGORIES];
    wrap.innerHTML = all.map(cat => `
    <button class="sales-cat ${currentSalesCategory === cat.key ? 'active' : ''}" onclick="setSalesCategory('${cat.key}')">
      <i class="fas ${cat.icon}"></i><span>${cat.label}</span>
    </button>
  `).join('');
}
function setSalesCategory(cat) {
    currentSalesCategory = cat;
    const sel = document.getElementById('sales-filter-category');
    if (sel)
        sel.value = cat === 'Todos' ? '' : cat;
    renderSalesCategories();
    applySalesFilters();
}
function hydrateSalesFilterOptions() {
    const category = document.getElementById('sales-filter-category');
    const brand = document.getElementById('sales-filter-brand');
    const province = document.getElementById('sales-filter-province');
    const fill = (el, label, values) => {
        if (!el || el.dataset.ready === '1')
            return;
        el.innerHTML = `<option value="">${label}</option>` + values.map(v => `<option>${v}</option>`).join('');
        el.dataset.ready = '1';
    };
    fill(category, 'Categoría', SALES_CATEGORIES.map(c => c.key));
    fill(brand, 'Marca', [...new Set(salesListings.map(x => x.brand))].sort());
    fill(province, 'Provincia', [...new Set(salesListings.map(x => x.province))].sort());
}
function applySalesFilters() {
    renderSalesUnified(getSalesFilteredItems());
}
function renderSalesCatalog(items) {
    const grid = document.getElementById('sales-grid');
    const count = document.getElementById('sales-results-count');
    if (!grid)
        return;
    if (count)
        count.textContent = `${items.length} equipo${items.length !== 1 ? 's' : ''} disponible${items.length !== 1 ? 's' : ''}`;
    if (!items.length) {
        grid.innerHTML = `<div class="sales-empty"><i class="fas fa-search"></i><strong>Sin resultados</strong><span>Probá limpiar filtros o ampliar la distancia.</span></div>`;
        return;
    }
    grid.innerHTML = items.map(item => `
    <article class="sales-card" onclick="openSalesDetail(${item.id})">
      <div class="sales-card-photo ${listingPhotoUrls(item).length ? 'has-photo' : ''}">
        ${listingPhotoMedia(item) || `<i class="fas ${SALES_CATEGORIES.find(c => c.key === item.category)?.icon || 'fa-tractor'}"></i>`}
        <button class="sales-fav-btn ${isSalesFav(item.id) ? 'active' : ''}" onclick="event.stopPropagation();toggleSalesFavorite(${item.id})" title="Guardar favorito">
          <i class="${isSalesFav(item.id) ? 'fas' : 'far'} fa-heart"></i>
        </button>
        <div class="sales-photo-count"><i class="fas fa-camera"></i> ${listingPhotoCount(item)}</div>
      </div>
      <div class="sales-card-body">
        <div class="sales-card-badges">${salesBadgeHTML(item)}</div>
        <div class="sales-card-cat">${item.category}</div>
        <h3>${item.brand} ${item.model}</h3>
        <div class="sales-card-price">${salesMoney(item)}</div>
        <div class="sales-card-meta">
          <span><i class="fas fa-calendar"></i> ${item.year}</span>
          <span><i class="fas fa-gauge-high"></i> ${item.hours ? item.hours.toLocaleString('es-AR') + ' h' : 'Sin horas'}</span>
          <span><i class="fas fa-map-pin"></i> ${item.location}, ${item.province}</span>
        </div>
        <div class="sales-card-state">${item.condition}</div>
      </div>
    </article>
  `).join('');
}
function renderSalesAI() {
    const el = document.getElementById('sales-ai-strip');
    if (!el)
        return;
    const best = [...salesListings].sort((a, b) => (b.goodPrice ? 1 : 0) - (a.goodPrice ? 1 : 0) || a.distanceKm - b.distanceKm)[0];
    const tractor = salesListings.find(x => x.category === 'Tractor');
    const messages = [
        best ? `Encontramos opciones más económicas en tu zona: ${best.brand} ${best.model}.` : null,
        tractor ? 'Este tractor podría reducir gastos de alquiler si lo usás varias campañas.' : null,
        'Según tu escala productiva, priorizamos equipos verificados y con buen valor.',
    ].filter(Boolean);
    el.innerHTML = messages.map(m => `<div class="sales-ai-pill"><i class="fas fa-bolt"></i>${m}</div>`).join('');
}
function resetSalesFilters() {
    ['sales-search-input', 'sales-filter-price-min', 'sales-filter-price-max', 'sales-filter-year-min', 'sales-filter-year-max', 'sales-filter-hours'].forEach(id => {
        const el = document.getElementById(id);
        if (el)
            el.value = '';
    });
    ['sales-filter-category', 'sales-filter-brand', 'sales-filter-province', 'sales-filter-state', 'sales-filter-distance'].forEach(id => {
        const el = document.getElementById(id);
        if (el)
            el.value = '';
    });
    const sort = document.getElementById('sales-sort');
    if (sort)
        sort.value = 'recent';
    const verified = document.getElementById('sales-filter-verified');
    if (verified)
        verified.checked = false;
    currentSalesCategory = 'Todos';
    renderSalesCategories();
    applySalesFilters();
}
function scrollSalesCatalog() {
    const target = document.getElementById('sales-catalog-anchor');
    if (target)
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
function isSalesFav(id) { return salesFavorites.includes(id); }
function openSalesDetail(id) {
    const item = salesListings.find(x => x.id === id);
    if (!item)
        return;
    selectedSalesListing = id;
    const title = document.getElementById('sales-detail-title');
    const sub = document.getElementById('sales-detail-sub');
    const body = document.getElementById('sales-detail-body');
    const relatedSalesItems = (() => {
        const sameCategory = salesListings.filter(x => x.category === item.category && x.id !== item.id);
        return (sameCategory.length ? sameCategory : salesListings.filter(x => x.id !== item.id).sort((a, b) => a.distanceKm - b.distanceKm)).slice(0, 3);
    })();
    if (title)
        title.innerHTML = `<i class="fas fa-store" style="color:var(--accent);margin-right:8px;"></i> ${item.brand} ${item.model}`;
    if (sub)
        sub.textContent = `${item.category} · ${item.location}, ${item.province}`;
    if (body) {
        body.innerHTML = `
      <div class="sales-detail-grid">
        <div class="sales-gallery">
          ${(listingPhotoUrls(item).length ? listingPhotoUrls(item).map((p, idx) => `<div class="sales-gallery-item ${idx === 0 ? 'main' : ''} has-photo"><img src="${p}" alt="${salesListingTitle(item)} foto ${idx + 1}"></div>`) : item.photos.slice(0, 6).map((p, idx) => `<div class="sales-gallery-item ${idx === 0 ? 'main' : ''}"><i class="fas fa-camera"></i><span>${p}</span></div>`)).join('')}
        </div>
        <div class="sales-detail-main">
          <div class="sales-card-badges">${salesBadgeHTML(item)}</div>
          <div class="sales-detail-price">${salesMoney(item)}</div>
          <div class="sales-detail-summary">${item.year} · ${item.hours ? item.hours.toLocaleString('es-AR') + ' horas' : 'Sin horas'} · ${item.condition}</div>
          <div class="ai-detail-insight ai-insight-green" style="margin:12px 0;"><i class="fas fa-bolt"></i> ${salesRecommendation(item)}</div>
          <div class="sales-detail-actions">
            <button class="btn btn-primary" onclick="requestSalesInfo(${item.id})"><i class="fas fa-circle-info"></i> Solicitar información</button>
            <button class="btn btn-ghost" onclick="toggleSalesFavorite(${item.id});openSalesDetail(${item.id})"><i class="${isSalesFav(item.id) ? 'fas' : 'far'} fa-heart"></i> Guardar favorito</button>
            <button class="btn btn-ghost" onclick="shareSalesListing(${item.id})"><i class="fas fa-share-nodes"></i> Compartir</button>
          </div>
        </div>
      </div>
      <div class="sales-detail-sections">
        <section><h4>Descripción</h4><p>${item.description}</p></section>
        <section><h4>Características técnicas</h4><div class="sales-specs">${item.specs.map(s => `<span>${s}</span>`).join('')}</div></section>
        <section><h4>Ubicación y estado</h4><p>${item.location}, ${item.province}. A ${item.distanceKm} km de tu zona. Estado: ${item.condition}.</p></section>
        <section><h4>Historial de mantenimiento</h4><p>${item.maintenance}</p></section>
        <section>
          <h4>Vendedor</h4>
          <div style="display:flex;align-items:center;gap:12px;padding:12px;background:var(--bg-secondary);border-radius:10px;margin-top:6px;">
            <div style="width:44px;height:44px;border-radius:50%;background:var(--accent-light);display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:800;color:var(--accent);flex-shrink:0;">
              ${item.seller.split(' ').map(w => w[0]).slice(0,2).join('')}
            </div>
            <div style="flex:1;">
              <div style="font-weight:700;font-size:14px;color:var(--text-primary);">${item.seller}</div>
              <div style="font-size:12px;color:var(--text-muted);margin-top:2px;">${item.sellerType}</div>
            </div>
            ${item.verified ? '<span class="ai-badge ai-badge-green" style="flex-shrink:0;">✅ Verificado</span>' : ''}
          </div>
        </section>
        <section>
          <h4>Equipos similares</h4>
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:10px;margin-top:8px;">
            ${relatedSalesItems.map(x => `
              <div onclick="openSalesDetail(${x.id})" style="cursor:pointer;border:1px solid var(--border);border-radius:10px;overflow:hidden;background:var(--bg-card);transition:border-color .15s;" onmouseover="this.style.borderColor='var(--accent)'" onmouseout="this.style.borderColor='var(--border)'">
                <div style="height:80px;background:var(--bg-secondary);display:flex;align-items:center;justify-content:center;font-size:28px;">
                  ${NEXU_SALES_CATS.find(c=>c.key===x.category)?.icon||'🚜'}
                </div>
                <div style="padding:8px 10px;">
                  <div style="font-size:12px;font-weight:600;color:var(--text-primary);margin-bottom:3px;">${x.brand} ${x.model}</div>
                  <div style="font-size:13px;font-weight:800;color:var(--accent);">${salesMoney(x)}</div>
                  <div style="font-size:11px;color:var(--text-muted);margin-top:2px;">${x.distanceKm} km · ${x.year}</div>
                </div>
              </div>`).join('') || '<span style="color:var(--text-muted);font-size:13px;">No hay equipos similares disponibles.</span>'}
          </div>
        </section>
      </div>`;
    }
    const overlay = document.getElementById('sales-detail-overlay');
    const sheet = document.getElementById('sales-detail-sheet');
    if (overlay)
        overlay.classList.add('open');
    if (sheet)
        sheet.classList.add('open');
    document.body.style.overflow = 'hidden';
}
function closeSalesDetail(e) {
    if (!e || e.target.id === 'sales-detail-overlay' || e.currentTarget?.classList?.contains('modal-close')) {
        const overlay = document.getElementById('sales-detail-overlay');
        const sheet = document.getElementById('sales-detail-sheet');
        if (overlay)
            overlay.classList.remove('open');
        if (sheet)
            sheet.classList.remove('open');
        document.body.style.overflow = '';
    }
}
function requestSalesInfo(id) {
    const item = salesListings.find(x => x.id === id);
    showToast(`Solicitud enviada por ${item ? item.brand + ' ' + item.model : 'la publicación'}`, 'success');
}
function shareSalesListing(id) {
    const item = salesListings.find(x => x.id === id);
    const text = `NexuDrive Market: ${item.brand} ${item.model} - ${salesMoney(item)}`;
    if (navigator.share) {
        navigator.share({ title: 'NexuDrive Market', text }).catch(() => { });
    }
    else {
        navigator.clipboard && navigator.clipboard.writeText(text);
        showToast('Datos de publicación copiados', 'success');
    }
}
function updateSalesPlanMeter() {
    const used = document.getElementById('sales-plan-used');
    const bar = document.getElementById('sales-plan-bar');
    const own = 2;
    if (used)
        used.textContent = own;
    if (bar)
        bar.style.width = `${Math.min(100, own / 3 * 100)}%`;
}
function openSalesWizard() {
    salesWizardStep = 1;
    salesWizardData = {};
    renderSalesWizard();
    const modal = document.getElementById('sales-wizard-modal');
    if (modal)
        modal.style.display = 'flex';
}
function closeSalesWizard(e) {
    if (!e || e.target.id === 'sales-wizard-modal') {
        const modal = document.getElementById('sales-wizard-modal');
        if (modal)
            modal.style.display = 'none';
    }
}
function salesWizardSave(key, value) {
    salesWizardData[key] = value;
}
function renderSalesWizard() {
    const body = document.getElementById('sales-wizard-body');
    const label = document.getElementById('sales-wizard-step-label');
    const progress = document.getElementById('sales-wizard-progress');
    const back = document.getElementById('sales-wizard-back');
    const next = document.getElementById('sales-wizard-next');
    const titles = ['Información básica', 'Precio y descripción', 'Fotos', 'Vista previa final'];
    if (label)
        label.textContent = `Paso ${salesWizardStep} de 4 · ${titles[salesWizardStep - 1]}`;
    if (progress)
        progress.innerHTML = titles.map((t, i) => `<span class="${i + 1 <= salesWizardStep ? 'active' : ''}">${i + 1}</span>`).join('');
    if (back)
        back.style.visibility = salesWizardStep === 1 ? 'hidden' : 'visible';
    if (next)
        next.innerHTML = salesWizardStep === 4 ? '<i class="fas fa-paper-plane"></i> Publicar equipo' : 'Siguiente <i class="fas fa-arrow-right"></i>';
    if (!body)
        return;
    if (salesWizardStep === 1) {
        body.innerHTML = `<div class="form-grid-2">
      <select class="form-select" onchange="salesWizardSave('category',this.value)"><option>Categoría</option>${SALES_CATEGORIES.map(c => `<option>${c.key}</option>`).join('')}</select>
      <input class="form-input" placeholder="Marca" oninput="salesWizardSave('brand',this.value)">
      <input class="form-input" placeholder="Modelo" oninput="salesWizardSave('model',this.value)">
      <input class="form-input" type="number" placeholder="Año" oninput="salesWizardSave('year',this.value)">
      <input class="form-input" type="number" placeholder="Horas de uso" oninput="salesWizardSave('hours',this.value)">
      <select class="form-select" onchange="salesWizardSave('condition',this.value)"><option>Estado</option><option>Nuevo</option><option>Usado excelente</option><option>Usado muy bueno</option><option>Usado bueno</option></select>
      <input class="form-input" placeholder="Ubicación" oninput="salesWizardSave('location',this.value)">
    </div>`;
    }
    else if (salesWizardStep === 2) {
        body.innerHTML = `<div class="form-grid-2">
      <input class="form-input" type="number" placeholder="Precio" oninput="salesWizardSave('price',this.value)">
      <select class="form-select" onchange="salesWizardSave('currency',this.value)"><option>USD</option><option>ARS</option></select>
    </div>
    <textarea class="form-textarea" rows="4" placeholder="Descripción" oninput="salesWizardSave('description',this.value)"></textarea>
    <textarea class="form-textarea" rows="3" placeholder="Características separadas por coma" oninput="salesWizardSave('specs',this.value)"></textarea>`;
    }
    else if (salesWizardStep === 3) {
        body.innerHTML = `<div class="sales-dropzone">
      <i class="fas fa-cloud-arrow-up"></i>
      <strong>Arrastrá fotos o tocá para seleccionar</strong>
      <span>Obligatorias: frontal, lateral y estado general. Las imágenes se comprimen automáticamente.</span>
    </div>
    <div class="sales-photo-preview">
      <div>Frontal</div><div>Lateral</div><div>Estado general</div>
    </div>
    <div class="sales-reorder-note"><i class="fas fa-grip-lines"></i> Reordená las imágenes antes de publicar.</div>`;
    }
    else {
        const title = `${salesWizardData.brand || 'Marca'} ${salesWizardData.model || 'Modelo'}`;
        body.innerHTML = `<div class="sales-preview-card">
      <div class="sales-card-photo"><i class="fas fa-tractor"></i><div class="sales-photo-count"><i class="fas fa-camera"></i> 3</div></div>
      <div class="sales-card-body">
        <div class="sales-card-badges"><span class="sales-badge verified"><i class="fas fa-check-circle"></i> Verificado</span></div>
        <div class="sales-card-cat">${salesWizardData.category || 'Categoría'}</div>
        <h3>${title}</h3>
        <div class="sales-card-price">${salesWizardData.currency || 'USD'} ${Number(salesWizardData.price || 0).toLocaleString('es-AR')}</div>
        <div class="sales-card-meta"><span><i class="fas fa-calendar"></i> ${salesWizardData.year || 'Año'}</span><span><i class="fas fa-gauge-high"></i> ${salesWizardData.hours || '0'} h</span><span><i class="fas fa-map-pin"></i> ${salesWizardData.location || 'Ubicación'}</span></div>
      </div>
    </div>`;
    }
}
function salesWizardNext() {
    if (salesWizardStep < 4) {
        salesWizardStep += 1;
        renderSalesWizard();
        return;
    }
    showToast('Equipo publicado en NexuDrive Market', 'success');
    closeSalesWizard();
}
function salesWizardBack() {
    if (salesWizardStep > 1) {
        salesWizardStep -= 1;
        renderSalesWizard();
    }
}

const NEXU_RENTAL_CATS = [
    { key: 'Todos', label: 'Todos', icon: '🏕️' },
    { key: 'Tractor', label: 'Tractor', icon: '🚜' },
    { key: 'Sembradora', label: 'Sembradora', icon: '🚜🌱' },
    { key: 'Pulverizadora', label: 'Pulveriz.', icon: '💦' },
    { key: 'Cosechadora', label: 'Cosechadora', icon: '🚜🌾' },
    { key: 'Dron', label: 'Dron', icon: '🚁' },
    { key: 'Servicio', label: 'Servicios', icon: '🛠️' },
    { key: 'Flete', label: 'Fletes', icon: '🚚' },
    { key: 'Camion', label: 'Camiones', icon: '🚛' },
    { key: 'Acoplado', label: 'Acoplados', icon: '🚚' },
];
const NEXU_SALES_CATS = [
    { key: 'Todos', label: 'Todos', icon: '🏕️' },
    { key: 'Tractor', label: 'Tractores', icon: '🚜' },
    { key: 'Sembradora', label: 'Sembradoras', icon: '🚜🌱' },
    { key: 'Pulverizadora', label: 'Pulveriz.', icon: '💦' },
    { key: 'Cosechadora', label: 'Cosechadoras', icon: '🚜🌾' },
    { key: 'Dron', label: 'Drones', icon: '🚁' },
    { key: 'Camion', label: 'Camiones', icon: '🚛' },
    { key: 'Acoplado', label: 'Acoplados', icon: '🚚' },
    { key: 'Tolva', label: 'Tolvas', icon: '🚚' },
];
let _salesFilterState = { brand: '', province: '', priceMin: '', priceMax: '', yearMin: '', yearMax: '', hoursMax: '', condition: '', verified: false, distance: '', sort: 'recent' };
let _filterModalOriginal = null;
function getSalesCatIcon(cat) {
    var _a;
    return ((_a = NEXU_SALES_CATS.find(c => c.key === cat)) === null || _a === void 0 ? void 0 : _a.icon) || '🚜';
}
function salesListingTitle(item) {
    return `${(item === null || item === void 0 ? void 0 : item.brand) || (item === null || item === void 0 ? void 0 : item.marca) || ''} ${(item === null || item === void 0 ? void 0 : item.model) || (item === null || item === void 0 ? void 0 : item.modelo) || ''}`.trim() || (item === null || item === void 0 ? void 0 : item.title) || 'Equipo publicado';
}
function listingPhotoUrls(item) {
    const raw = (item && (item.photoUrls || item.photosData || item.images || item.photos)) || [];
    return raw.map(p => {
        if (!p)
            return null;
        if (typeof p === 'string' && (p.startsWith('data:image') || p.startsWith('http') || p.startsWith('assets/')))
            return p;
        if (p.dataUrl)
            return p.dataUrl;
        if (p.url)
            return p.url;
        return null;
    }).filter(Boolean).slice(0, 6);
}
function listingPhotoCount(item) {
    const urls = listingPhotoUrls(item);
    const labels = Array.isArray(item === null || item === void 0 ? void 0 : item.photos) ? item.photos.length : 0;
    return Math.min(6, urls.length || labels || 0);
}
function listingPhotoMedia(item, className = 'listing-photo-img') {
    const urls = listingPhotoUrls(item);
    return urls.length ? `<img src="${urls[0]}" class="${className}" alt="${salesListingTitle(item)}">` : '';
}
function salesStatusLabel(item) {
    const condition = item.condition === 'Usado excelente' ? '💎 Usado excelente' : item.condition;
    return item.status === 'sold' ? 'Vendido' : item.status === 'paused' ? 'Pausado' : condition;
}
function rentalSpecificMeta(m) {
    if (m.cat === 'Camion') {
        return `
        <div class="market-card-meta market-card-meta-spec">
          <span class="market-card-meta-item"><i class="fas fa-truck"></i> ${m.marca} ${m.modelo}</span>
          <span class="market-card-meta-item"><i class="fas fa-calendar"></i> ${m.year}</span>
          <span class="market-card-meta-item"><i class="fas fa-weight-hanging"></i> ${m.capacidad}</span>
        </div>
        <div class="market-card-meta market-card-meta-spec">
          <span class="market-card-meta-item"><i class="fas fa-location-dot"></i> ${m.area}</span>
        </div>`;
    }
    if (m.cat === 'Acoplado') {
        return `
        <div class="market-card-meta market-card-meta-spec">
          <span class="market-card-meta-item"><i class="fas fa-trailer"></i> ${m.tipo || m.modelo}</span>
          <span class="market-card-meta-item"><i class="fas fa-weight-hanging"></i> ${m.capacidad}</span>
          <span class="market-card-meta-item"><i class="fas fa-circle-check"></i> ${m.estado}</span>
        </div>
        <div class="market-card-meta market-card-meta-spec">
          <span class="market-card-meta-item"><i class="fas fa-location-dot"></i> ${m.area}</span>
        </div>`;
    }
    return '';
}
function renderMarket(data) {
    if (currentNexuMode === 'sales') {
        renderSalesUnified(data || getSalesFilteredItems());
        return;
    }
    const grid = document.getElementById('market-grid');
    if (!grid)
        return;
    const raw = data || marketData;
    const items = data ? raw : aiSortMarket();
    const countEl = document.getElementById('nd-results-count');
    if (countEl)
        countEl.textContent = `${items.length} resultado${items.length !== 1 ? 's' : ''} · ordenados por mejor opción`;
    if (items.length === 0) {
        grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:60px 20px;color:var(--text-muted);">
      <i class="fas fa-search" style="font-size:32px;display:block;margin-bottom:12px;opacity:.3;"></i>
      <div style="font-size:15px;font-weight:600;color:var(--text-secondary);margin-bottom:6px;">Todavía no encontramos equipos con esos filtros.</div>
      <div style="font-size:13px;">Probá ampliar la distancia o elegir otra categoría.</div>
    </div>`;
        return;
    }
    grid.innerHTML = items.map(m => {
        const visibleBadgeTexts = new Set(['Disponible hoy', 'Más cercano', 'Menor costo', 'Equipo nuevo']);
        const badges = AI.badges(m, marketData).filter(b => !visibleBadgeTexts.has(b.text));
        const badgeHTML = `<span class="ai-badge ai-badge-green"><i class="fas fa-shield-alt"></i> Verificado</span>` + badges.slice(0, 1).map(b => `<span class="ai-badge ai-badge-${b.color}">${b.icon} ${b.text}</span>`).join('');
        const isBest = m._rank === 0 && !data;
        const isSelected = selectedMarket === m.id;
        const available = checkMachineAvailability(m);
        const cardClass = ['market-card', isSelected ? 'selected' : '', isBest ? 'market-card-best' : ''].filter(Boolean).join(' ');
        const availBadge = m.availNow
            ? `<div class="nd-avail-badge nd-avail-now"><i class="fas fa-circle" style="font-size:7px;"></i> Disponible hoy</div>`
            : `<div class="nd-avail-badge nd-avail-soon"><i class="fas fa-clock" style="font-size:8px;"></i> ${m.avail}</div>`;
        const ratingStars = m.rating ? `<span class="market-card-meta-item"><i class="fas fa-star" style="color:var(--amber-400);"></i> ${m.rating} (${m.reviews})</span>` : '';
        const specificMeta = rentalSpecificMeta(m);
        return `
    <div class="${cardClass}" onclick="selectMarket(${m.id})">
      <div class="market-card-img ${listingPhotoUrls(m).length ? 'has-photo' : ''}">
        ${listingPhotoMedia(m) || m.emoji}
        ${availBadge}
        <button class="fav-btn ${isFav(m.id) ? 'fav-active' : ''}" onclick="event.stopPropagation();toggleFav(${m.id})">
          <i class="${isFav(m.id) ? 'fas' : 'far'} fa-heart"></i>
        </button>
        <button class="report-btn report-btn-card" onclick="openReportListingModal('rental',${m.id},event)" title="Denunciar oferta"><i class="fas fa-flag"></i></button>
      </div>
      <div class="market-card-body">
        ${badgeHTML ? `<div class="ai-badges-row">${badgeHTML}</div>` : ''}
        <div class="market-card-saving"><i class="fas fa-leaf" style="font-size:9px;"></i> ${m.saving}</div>
        <div class="market-card-title">${m.title}</div>
        <div class="market-card-price">${m.price}</div>
        <div class="market-card-meta">
          <span class="market-card-meta-item"><i class="fas fa-map-pin"></i> ${m.dist}</span>
          ${ratingStars}
          <span class="market-card-meta-item"><i class="fas fa-user"></i> ${m.operario ? 'Con operario' : 'Solo equipo'}</span>
        </div>
        ${specificMeta}
      </div>
      <div class="nd-card-cta" onclick="event.stopPropagation()">
        <button class="nd-card-cta-secondary" onclick="openMarketInfo(${m.id})">
          <i class="fas fa-message" style="font-size:11px;"></i> Consultar
        </button>
        <button class="${available ? 'nd-card-cta-main' : 'btn-ghost'}" ${available ? `onclick="openPaymentModal(${m.id})"` : 'disabled'}>
          <i class="fas fa-calendar-check" style="font-size:11px;"></i> ${available ? 'Reservar' : 'Sin disponibilidad'}
        </button>
        <button class="nd-card-cta-fav" onclick="toggleFav(${m.id});this.innerHTML='<i class=\\'fas fa-heart\\' style=\\'color:var(--danger-500);\\'></i>'" title="Guardar">
          <i class="${isFav(m.id) ? 'fas' : 'far'} fa-heart" style="${isFav(m.id) ? 'color:var(--danger-500);' : ''}"></i>
        </button>
      </div>
    </div>`;
    }).join('');
    renderNdIAStrip();
}
function renderNexuCategories() {
    const wrap = document.getElementById('nd-cats');
    if (!wrap)
        return;
    const cats = currentNexuMode === 'sales' ? NEXU_SALES_CATS : NEXU_RENTAL_CATS;
    const active = currentNexuMode === 'sales' ? currentSalesCategory : 'Todos';
    wrap.innerHTML = cats.map(c => `
    <button class="nd-cat ${active === c.key ? 'active' : ''}" onclick="ndCatFilter('${c.key}', this)" data-cat="${c.key}">
      <span class="nd-cat-icon">${c.icon}</span>
      ${c.label}
    </button>
  `).join('');
}
function switchNexuMode(mode) {
    currentNexuMode = mode === 'sales' ? 'sales' : 'rental';
    localStorage.setItem('agronex_nexudrive_mode', currentNexuMode);
    const marketScreen = document.getElementById('screen-market');
    if (marketScreen)
        marketScreen.classList.toggle('sales-mode', currentNexuMode === 'sales');
    const salesPanel = document.getElementById('nd-sales-panel');
    const sharedPanels = document.querySelectorAll('.nd-rental-panel');
    if (salesPanel)
        salesPanel.style.display = 'none';
    sharedPanels.forEach(el => el.style.display = '');
    const rentalTab = document.getElementById('nd-mode-rental-tab');
    const salesTab = document.getElementById('nd-mode-sales-tab');
    if (rentalTab)
        rentalTab.classList.toggle('active', currentNexuMode === 'rental');
    if (salesTab)
        salesTab.classList.toggle('active', currentNexuMode === 'sales');
    setNexuHero(currentNexuMode);
    configureNexuSearch(currentNexuMode);
    configureNexuPublishPromo(currentNexuMode);
    renderNexuCategories();
    if (currentNexuMode === 'sales') {
        renderSalesUnified();
        renderSalesUnifiedIA();
    }
    else {
        selectedSalesListing = null;
        renderMarket();
        renderNdIAStrip();
    }
}
function initNexuMode() {
    switchNexuMode(localStorage.getItem('agronex_nexudrive_mode') || 'rental');
}
function ndCatFilter(cat, el) {
    document.querySelectorAll('.nd-cat').forEach(b => b.classList.remove('active'));
    if (el) {
        el.classList.add('active');
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
    if (currentNexuMode === 'sales') {
        currentSalesCategory = cat;
        renderSalesUnified();
        return;
    }
    quickCatFilter(cat, null);
};
function quickSearchSalesMarket(q) {
    const text = (q || '').toLowerCase();
    const filtered = getSalesFilteredItems().filter(item => !text ||
        `${item.category} ${item.brand} ${item.model} ${item.location} ${item.province}`.toLowerCase().includes(text));
    renderSalesUnified(filtered);
}
function getSalesFilteredItems() {
    let items = salesListings.filter(item => {
        if (currentSalesCategory !== 'Todos' && salesDisplayCategory(item) !== currentSalesCategory)
            return false;
        if (_salesFilterState.brand && item.brand !== _salesFilterState.brand)
            return false;
        if (_salesFilterState.province && item.province !== _salesFilterState.province)
            return false;
        if (_salesFilterState.condition && item.condition !== _salesFilterState.condition)
            return false;
        if (_salesFilterState.verified && !item.verified)
            return false;
        if (_salesFilterState.priceMin && item.price < Number(_salesFilterState.priceMin))
            return false;
        if (_salesFilterState.priceMax && item.price > Number(_salesFilterState.priceMax))
            return false;
        if (_salesFilterState.yearMin && item.year < Number(_salesFilterState.yearMin))
            return false;
        if (_salesFilterState.yearMax && item.year > Number(_salesFilterState.yearMax))
            return false;
        if (_salesFilterState.hoursMax && item.hours > Number(_salesFilterState.hoursMax))
            return false;
        if (_salesFilterState.distance && item.distanceKm > Number(_salesFilterState.distance))
            return false;
        return true;
    });
    const valueScore = item => (item.goodPrice ? 40 : 0) + (item.verified ? 25 : 0) + Math.max(0, 25 - item.distanceKm / 10) + Math.max(0, 10 - item.createdDays);
    items.sort((a, b) => {
        if (_salesFilterState.sort === 'priceAsc')
            return a.price - b.price;
        if (_salesFilterState.sort === 'priceDesc')
            return b.price - a.price;
        if (_salesFilterState.sort === 'near')
            return a.distanceKm - b.distanceKm;
        if (_salesFilterState.sort === 'value')
            return valueScore(b) - valueScore(a);
        return a.createdDays - b.createdDays;
    });
    return items;
}
function saveSalesFavs() { localStorage.setItem('agronex_sales_favs', JSON.stringify(salesFavorites)); }
function toggleSalesFavorite(id) {
    if (isSalesFav(id)) {
        salesFavorites = salesFavorites.filter(x => x !== id);
        showToast('Publicación quitada de favoritos', 'info');
    }
    else {
        salesFavorites.push(id);
        showToast('Publicación guardada en favoritos', 'success');
    }
    saveSalesFavs();
    updateFavBadge();
    if (currentNexuMode === 'sales')
        renderSalesUnified();
    else
        renderFavoritos();
}
function cacheFilterModalOriginal() {
    const modal = document.getElementById('filter-modal');
    if (!modal || _filterModalOriginal)
        return;
    _filterModalOriginal = {
        title: modal.querySelector('.modal-title') ? modal.querySelector('.modal-title').innerHTML : '',
        sub: modal.querySelector('.modal-hdr div div:nth-child(2)') ? modal.querySelector('.modal-hdr div div:nth-child(2)').innerHTML : '',
        body: modal.querySelector('.modal-body') ? modal.querySelector('.modal-body').innerHTML : '',
        footer: modal.querySelector('.modal-footer') ? modal.querySelector('.modal-footer').innerHTML : '',
    };
}
function restoreRentalFilterModal() {
    cacheFilterModalOriginal();
    const modal = document.getElementById('filter-modal');
    if (!modal || !_filterModalOriginal)
        return;
    const title = modal.querySelector('.modal-title');
    const sub = modal.querySelector('.modal-hdr div div:nth-child(2)');
    const body = modal.querySelector('.modal-body');
    const footer = modal.querySelector('.modal-footer');
    if (title)
        title.innerHTML = _filterModalOriginal.title;
    if (sub)
        sub.innerHTML = _filterModalOriginal.sub;
    if (body)
        body.innerHTML = _filterModalOriginal.body;
    if (footer)
        footer.innerHTML = _filterModalOriginal.footer;
}
function salesModalSetCat(cat, el) {
    currentSalesCategory = cat;
    if (el && el.parentElement) {
        el.parentElement.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
        el.classList.add('active');
    }
}
function openFilterModal() {
    if (currentNexuMode === 'sales')
        renderSalesFilterModal();
    else
        restoreRentalFilterModal();
    const modal = document.getElementById('filter-modal');
    if (modal)
        modal.style.display = 'flex';
}
function applyFilters() {
    if (currentNexuMode !== 'sales') {
        applyRentalFiltersUnified();
        return;
    }
    const val = id => { var _a; return (((_a = document.getElementById(id)) === null || _a === void 0 ? void 0 : _a.value) || '').trim(); };
    _salesFilterState = {
        brand: val('sf-brand'),
        province: val('sf-province'),
        priceMin: val('sf-price-min'),
        priceMax: val('sf-price-max'),
        yearMin: val('sf-year-min'),
        yearMax: val('sf-year-max'),
        hoursMax: val('sf-hours'),
        condition: val('sf-condition'),
        verified: !!(document.getElementById('sf-verified') && document.getElementById('sf-verified').checked),
        distance: val('sf-distance'),
        sort: val('sf-sort') || 'recent',
    };
    renderNexuCategories();
    renderSalesUnified();
    closeFilterModal();
    showToast(`${getSalesFilteredItems().length} resultado${getSalesFilteredItems().length !== 1 ? 's' : ''} encontrado${getSalesFilteredItems().length !== 1 ? 's' : ''}`, 'success');
}
function applyRentalFiltersUnified() {
    var _a, _b, _c, _d, _e;
    const stripEmoji = s => s.replace(/^\p{Emoji_Presentation}\s*/u, '').replace(/^[🌱🌾💦🚛🚚🔧🚁🚜📦]\s*/u, '').trim();
    const catRaw = ((_a = document.querySelector('#filter-cat-chips .filter-chip.active')) === null || _a === void 0 ? void 0 : _a.textContent.trim()) || 'Todos';
    const cat = stripEmoji(catRaw);
    const serv = ((_b = document.querySelector('#filter-serv-chips .filter-chip.active')) === null || _b === void 0 ? void 0 : _b.textContent.trim()) || 'Cualquiera';
    const avail = ((_c = document.querySelector('#filter-avail-chips .filter-chip.active')) === null || _c === void 0 ? void 0 : _c.textContent.trim()) || 'Cualquiera';
    const year = +(((_d = document.getElementById('filter-year')) === null || _d === void 0 ? void 0 : _d.value) || 0);
    const dist = +(((_e = document.getElementById('filter-dist')) === null || _e === void 0 ? void 0 : _e.value) || 0);
    const filtered = marketData.filter(m => {
        var _a, _b;
        if (cat !== 'Todos' && m.cat !== cat)
            return false;
        if (serv === 'Con operario' && !m.operario)
            return false;
        if (serv === 'Solo maquinaria' && m.operario && ((_a = m.serviceOptions) === null || _a === void 0 ? void 0 : _a.length) === 1)
            return false;
        if (serv === 'Servicio completo' && !((_b = m.serviceOptions) === null || _b === void 0 ? void 0 : _b.includes('Servicio completo')))
            return false;
        if (year && m.year < year)
            return false;
        if (dist && parseInt(m.dist) > dist)
            return false;
        if (avail === 'Disponible ahora' && !m.avail.toLowerCase().includes('disponible'))
            return false;
        return true;
    });
    renderMarket(filtered);
    closeFilterModal();
    if (cat !== 'Todos' || serv !== 'Cualquiera' || year || dist || avail !== 'Cualquiera')
        showToast(`${filtered.length} resultado${filtered.length !== 1 ? 's' : ''} encontrado${filtered.length !== 1 ? 's' : ''}`, 'success');
}
function resetFilters() {
    if (currentNexuMode !== 'sales') {
        document.querySelectorAll('#filter-cat-chips .filter-chip').forEach((c, i) => c.classList.toggle('active', i === 0));
        document.querySelectorAll('#filter-serv-chips .filter-chip').forEach((c, i) => c.classList.toggle('active', i === 0));
        document.querySelectorAll('#filter-avail-chips .filter-chip').forEach((c, i) => c.classList.toggle('active', i === 0));
        const y = document.getElementById('filter-year');
        if (y)
            y.value = '';
        const d = document.getElementById('filter-dist');
        if (d)
            d.value = '';
        renderMarket();
        closeFilterModal();
        showToast('Filtros limpiados', 'info');
        return;
    }
    _salesFilterState = { brand: '', province: '', priceMin: '', priceMax: '', yearMin: '', yearMax: '', hoursMax: '', condition: '', verified: false, distance: '', sort: 'recent' };
    currentSalesCategory = 'Todos';
    renderNexuCategories();
    renderSalesUnified();
    closeFilterModal();
    showToast('Filtros limpiados', 'info');
}

// Normalize the unified NexuDrive UI away from mojibake-prone emoji strings.
NEXU_RENTAL_CATS.splice(0, NEXU_RENTAL_CATS.length, ...[
    { key: 'Todos', label: 'Todos', icon: '🏕️' },
    { key: 'Tractor', label: 'Tractores', icon: '🚜' },
    { key: 'Sembradora', label: 'Sembradoras', icon: '🚜🌱' },
    { key: 'Pulverizadora', label: 'Pulverizadoras', icon: '💦' },
    { key: 'Cosechadora', label: 'Cosechadoras', icon: '🚜🌾' },
    { key: 'Dron', label: 'Drones', icon: '🚁' },
    { key: 'Servicio', label: 'Servicios', icon: '🛠️' },
    { key: 'Flete', label: 'Fletes', icon: '🚚' },
    { key: 'Camion', label: 'Camiones', icon: '🚛' },
    { key: 'Acoplado', label: 'Acoplados', icon: '🚚' },
]);
NEXU_SALES_CATS.splice(0, NEXU_SALES_CATS.length, ...[
    { key: 'Todos', label: 'Todos', icon: '🏕️' },
    { key: 'Tractor', label: 'Tractores', icon: '🚜' },
    { key: 'Sembradora', label: 'Sembradoras', icon: '🚜🌱' },
    { key: 'Pulverizadora', label: 'Pulverizadoras', icon: '💦' },
    { key: 'Cosechadora', label: 'Cosechadoras', icon: '🚜🌾' },
    { key: 'Dron', label: 'Drones', icon: '🚁' },
    { key: 'Camion', label: 'Camiones', icon: '🚛' },
    { key: 'Acoplado', label: 'Acoplados', icon: '🚚' },
]);
function salesDisplayCategory(item) {
    const cat = (item && item.category) || '';
    if (cat === 'Tolva')
        return 'Acoplado';
    return NEXU_SALES_CATS.some(c => c.key === cat) ? cat : 'Acoplado';
}
function salesCardBadges(item) {
    const badges = [];
    if (item.verified)
        badges.push({ text: 'Verificado', icon: '<i class="fas fa-check-circle"></i>', color: 'green' });
    if (item.demand)
        badges.push({ text: 'Alta demanda', icon: '<i class="fas fa-fire"></i>', color: 'red' });
    if (item.featured)
        badges.push({ text: 'Destacado', icon: '<i class="fas fa-star"></i>', color: 'gold' });
    if (item.goodPrice)
        badges.push({ text: 'Buen precio', icon: '<i class="fas fa-coins"></i>', color: 'green' });
    return badges.slice(0, 3).map(b => `<span class="ai-badge ai-badge-${b.color}">${b.icon} ${b.text}</span>`).join('');
}
function setNexuHero(mode) {
    const icon = document.querySelector('.nd-hero-icon');
    const headline = document.querySelector('.nd-hero-headline');
    const sub = document.querySelector('.nd-hero-sub');
    const saving = document.querySelector('.nd-hero-saving');
    if (mode === 'sales') {
        if (icon)
            icon.innerHTML = '<i class="fas fa-store"></i>';
        if (headline)
            headline.textContent = 'NexuDrive Market';
        if (sub)
            sub.innerHTML = `Maquinaria en venta · <span style="font-weight:600;color:var(--accent);">${salesListings.length} equipos</span> publicados`;
        if (saving) {
            const verified = salesListings.filter(x => x.verified).length;
            saving.style.display = '';
            saving.innerHTML = `<span style="font-size:22px;font-weight:900;color:var(--accent);font-family:var(--font-display);text-align:right;">${verified}</span><span>vendedores verificados</span>`;
        }
    }
    else {
        if (icon)
            icon.innerHTML = '<i class="fas fa-tractor"></i>';
        if (headline)
            headline.textContent = 'NexuDrive';
        if (sub)
            sub.innerHTML = `Contratá maquinaria, servicios, fletes y operarios cerca de tu campaña.`;
        if (saving) {
            saving.style.display = '';
            saving.innerHTML = `<span id="nd-saving-hero" style="font-size:22px;font-weight:900;color:var(--accent);font-family:var(--font-display);text-align:right;">USD 420k</span><span>ahorro estimado</span>`;
        }
    }
}
function configureNexuSearch(mode) {
    const input = document.getElementById('nd-search-input');
    const filterBtn = document.getElementById('nd-filter-btn');
    if (input) {
        input.value = '';
        input.placeholder = mode === 'sales' ? 'Buscar equipo, marca o ubicacion...' : 'Buscar equipo, marca o zona...';
        input.oninput = () => mode === 'sales' ? quickSearchSalesMarket(input.value) : quickSearchMarket(input.value);
    }
    if (filterBtn)
        filterBtn.onclick = () => openFilterModal();
}
function configureNexuPublishPromo(mode) {
    const promo = document.querySelector('.nd-publish-promo');
    if (!promo)
        return;
    const icon = promo.querySelector('.nd-publish-promo-icon');
    const title = promo.querySelector('.nd-publish-promo-title');
    const sub = promo.querySelector('.nd-publish-promo-sub');
    const btn = promo.querySelector('button');
    if (mode === 'sales') {
        promo.onclick = () => showScreen('publicar');
        if (icon)
            icon.innerHTML = '<i class="fas fa-store"></i>';
        if (title)
            title.textContent = 'Queres vender maquinaria?';
        if (sub)
            sub.textContent = 'Publica tu equipo en NexuDrive Market y recibi consultas de compradores verificados.';
        if (btn)
            btn.innerHTML = '<i class="fas fa-plus"></i> Publicar equipo';
    }
    else {
        promo.onclick = () => showScreen('publicar');
        if (icon)
            icon.innerHTML = '<i class="fas fa-tractor"></i>';
        if (title)
            title.textContent = 'Tenes maquinaria disponible?';
        if (sub)
            sub.textContent = 'Publica en NexuDrive y recibi reservas de productores de tu zona.';
        if (btn)
            btn.innerHTML = '<i class="fas fa-plus"></i> Publicar equipo';
    }
}
function renderSalesUnified(items) {
    const grid = document.getElementById('market-grid');
    if (!grid)
        return;
    const shown = items || getSalesFilteredItems();
    const countEl = document.getElementById('nd-results-count');
    if (countEl)
        countEl.textContent = `${shown.length} equipo${shown.length !== 1 ? 's' : ''} · compra y venta`;
    if (!shown.length) {
        grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:60px 20px;color:var(--text-muted);">
      <i class="fas fa-search" style="font-size:32px;display:block;margin-bottom:12px;opacity:.3;"></i>
      <div style="font-size:15px;font-weight:600;color:var(--text-secondary);margin-bottom:6px;">Sin resultados</div>
      <div style="font-size:13px;">Proba con otro filtro, marca o distancia.</div>
    </div>`;
        return;
    }
    grid.innerHTML = shown.map(item => {
        const isSelected = selectedSalesListing === item.id;
        const cardClass = ['market-card', isSelected ? 'selected' : '', item.goodPrice ? 'market-card-best' : ''].filter(Boolean).join(' ');
        const statusClass = item.status === 'paused' ? 'nd-avail-soon' : 'nd-avail-now';
        const itemCat = salesDisplayCategory(item);
        return `
    <div class="${cardClass}" onclick="openSalesDetail(${item.id})">
      <div class="market-card-img ${listingPhotoUrls(item).length ? 'has-photo' : ''}">
        ${listingPhotoMedia(item) || getSalesCatIcon(itemCat)}
        <div class="sales-photo-count"><i class="fas fa-camera"></i> ${listingPhotoCount(item)}</div>
        <div class="nd-avail-badge ${statusClass}"><i class="fas fa-circle" style="font-size:7px;"></i> ${salesStatusLabel(item)}</div>
        <button class="fav-btn ${isSalesFav(item.id) ? 'fav-active' : ''}" onclick="event.stopPropagation();toggleSalesFavorite(${item.id})">
          <i class="${isSalesFav(item.id) ? 'fas' : 'far'} fa-heart"></i>
        </button>
        <button class="report-btn report-btn-card" onclick="openReportListingModal('sales',${item.id},event)" title="Denunciar oferta"><i class="fas fa-flag"></i></button>
      </div>
      <div class="market-card-body">
        <div class="ai-badges-row">${salesCardBadges(item)}</div>
        <div class="market-card-saving"><i class="fas fa-store" style="font-size:9px;"></i> ${itemCat} en venta</div>
        <div class="market-card-title">${salesListingTitle(item)}</div>
        <div class="market-card-price">${salesMoney(item)}</div>
        <div class="market-card-meta">
          <span class="market-card-meta-item"><i class="fas fa-map-pin"></i> ${item.location}, ${item.province}</span>
          <span class="market-card-meta-item"><i class="fas fa-calendar"></i> ${item.year}</span>
          <span class="market-card-meta-item"><i class="fas fa-gauge-high"></i> ${item.hours ? item.hours.toLocaleString('es-AR') + ' h' : 'Sin horas'}</span>
          <span class="market-card-meta-item"><i class="fas fa-route"></i> ${item.distanceKm} km</span>
        </div>
      </div>
      <div class="nd-card-cta" onclick="event.stopPropagation()">
        <button class="nd-card-cta-secondary" onclick="openSalesDetail(${item.id})">
          <i class="fas fa-message" style="font-size:11px;"></i> Consultar
        </button>
        <button class="nd-card-cta-fav" onclick="toggleSalesFavorite(${item.id})" title="Guardar">
          <i class="${isSalesFav(item.id) ? 'fas' : 'far'} fa-heart" style="${isSalesFav(item.id) ? 'color:var(--danger-500);' : ''}"></i>
        </button>
      </div>
    </div>`;
    }).join('');
}
function renderSalesUnifiedIA() {
    const container = document.getElementById('nd-ia-strip');
    if (!container)
        return;
    const best = [...salesListings].sort((a, b) => (b.goodPrice ? 1 : 0) - (a.goodPrice ? 1 : 0) || a.distanceKm - b.distanceKm)[0];
    const near = [...salesListings].sort((a, b) => a.distanceKm - b.distanceKm)[0];
    const verified = salesListings.filter(x => x.verified).length;
    const alerts = [
        best && best.goodPrice ? { color: 'green', icon: '💰', text: `Buen precio: ${salesListingTitle(best)} está por debajo del promedio de mercado.`, targetId: best.id } : null,
        near ? { color: 'amber', icon: '📍', text: `Opción cercana: ${salesListingTitle(near)} a solo ${near.distanceKm} km de tu zona.`, targetId: near.id } : null,
        { color: 'green', icon: '✅', text: `${verified} vendedor${verified !== 1 ? 'es' : ''} verificado${verified !== 1 ? 's' : ''} disponibles en NexuDrive Market.`, targetId: null },
    ].filter(Boolean);
    container.style.display = alerts.length ? 'flex' : 'none';
    const colorMap = { green: 'nd-ia-pill-green', amber: 'nd-ia-pill-amber', red: 'nd-ia-pill-red' };
    container.innerHTML = alerts.map(a => `
    <div class="nd-ia-pill ${colorMap[a.color]}" ${a.targetId ? `onclick="openSalesDetail(${a.targetId})" style="cursor:pointer;"` : ''}>
      ${a.icon} ${a.text}
      ${a.targetId ? `<span class="nd-pill-cta">Ver →</span>` : ''}
    </div>`).join('');
}
function renderSalesFilterModal() {
    cacheFilterModalOriginal();
    const modal = document.getElementById('filter-modal');
    if (!modal)
        return;
    const title = modal.querySelector('.modal-title');
    const sub = modal.querySelector('.modal-hdr div div:nth-child(2)');
    const body = modal.querySelector('.modal-body');
    const footer = modal.querySelector('.modal-footer');
    const brands = [...new Set(salesListings.map(x => x.brand))].sort();
    const provinces = [...new Set(salesListings.map(x => x.province))].sort();
    if (title)
        title.innerHTML = '<i class="fas fa-sliders-h" style="color:var(--accent);margin-right:8px;"></i> Filtros de busqueda';
    if (sub)
        sub.textContent = 'Filtra por categoria, precio, estado y distancia';
    if (body)
        body.innerHTML = `
      <div class="form-group">
        <label class="form-label">Categoria de maquinaria</label>
        <div style="display:flex;gap:6px;flex-wrap:wrap;" id="sales-filter-cat-chips">
          ${NEXU_SALES_CATS.map(c => `<button class="filter-chip ${currentSalesCategory === c.key ? 'active' : ''}" onclick="salesModalSetCat('${c.key}',this)">${c.label}</button>`).join('')}
        </div>
      </div>
      <div class="form-grid-2">
        <div class="form-group"><label class="form-label">Marca</label><select class="form-select" id="sf-brand"><option value="">Todas</option>${brands.map(b => `<option ${_salesFilterState.brand === b ? 'selected' : ''}>${b}</option>`).join('')}</select></div>
        <div class="form-group"><label class="form-label">Provincia</label><select class="form-select" id="sf-province"><option value="">Todas</option>${provinces.map(p => `<option ${_salesFilterState.province === p ? 'selected' : ''}>${p}</option>`).join('')}</select></div>
      </div>
      <div class="form-grid-2">
        <div class="form-group"><label class="form-label">Precio minimo</label><input class="form-input" id="sf-price-min" type="number" value="${_salesFilterState.priceMin}" placeholder="USD"></div>
        <div class="form-group"><label class="form-label">Precio maximo</label><input class="form-input" id="sf-price-max" type="number" value="${_salesFilterState.priceMax}" placeholder="USD"></div>
      </div>
      <div class="form-grid-2">
        <div class="form-group"><label class="form-label">Anio minimo</label><input class="form-input" id="sf-year-min" type="number" value="${_salesFilterState.yearMin}" placeholder="2018"></div>
        <div class="form-group"><label class="form-label">Anio maximo</label><input class="form-input" id="sf-year-max" type="number" value="${_salesFilterState.yearMax}" placeholder="2024"></div>
      </div>
      <div class="form-grid-2">
        <div class="form-group"><label class="form-label">Horas de uso max.</label><input class="form-input" id="sf-hours" type="number" value="${_salesFilterState.hoursMax}" placeholder="3000"></div>
        <div class="form-group"><label class="form-label">Distancia</label><select class="form-select" id="sf-distance"><option value="">Sin limite</option><option value="50" ${_salesFilterState.distance === '50' ? 'selected' : ''}>Hasta 50 km</option><option value="100" ${_salesFilterState.distance === '100' ? 'selected' : ''}>Hasta 100 km</option><option value="250" ${_salesFilterState.distance === '250' ? 'selected' : ''}>Hasta 250 km</option></select></div>
      </div>
      <div class="form-grid-2">
        <div class="form-group"><label class="form-label">Estado</label><select class="form-select" id="sf-condition"><option value="">Todos</option><option ${_salesFilterState.condition === 'Nuevo' ? 'selected' : ''}>Nuevo</option><option ${_salesFilterState.condition === 'Usado excelente' ? 'selected' : ''}>Usado excelente</option><option ${_salesFilterState.condition === 'Usado muy bueno' ? 'selected' : ''}>Usado muy bueno</option><option ${_salesFilterState.condition === 'Usado bueno' ? 'selected' : ''}>Usado bueno</option></select></div>
        <div class="form-group"><label class="form-label">Ordenar por</label><select class="form-select" id="sf-sort"><option value="recent" ${_salesFilterState.sort === 'recent' ? 'selected' : ''}>Mas recientes</option><option value="priceAsc" ${_salesFilterState.sort === 'priceAsc' ? 'selected' : ''}>Menor precio</option><option value="priceDesc" ${_salesFilterState.sort === 'priceDesc' ? 'selected' : ''}>Mayor precio</option><option value="near" ${_salesFilterState.sort === 'near' ? 'selected' : ''}>Mas cercanos</option><option value="value" ${_salesFilterState.sort === 'value' ? 'selected' : ''}>Mejor valor</option></select></div>
      </div>
      <label class="filter-chip ${_salesFilterState.verified ? 'active' : ''}" style="width:max-content;"><input type="checkbox" id="sf-verified" ${_salesFilterState.verified ? 'checked' : ''} style="display:none;"> Verificados</label>
    `;
    if (footer)
        footer.innerHTML = `
      <button class="btn btn-primary" style="flex:1;" onclick="applyFilters()"><i class="fas fa-check"></i> Aplicar filtros</button>
      <button class="btn btn-ghost btn-sm" onclick="resetFilters()">Limpiar</button>`;
}
function selectMarket(id) {
    const item = marketData.find(x => x.id === id);
    if (!item)
        return;
    selectedMarket = id;
    if (typeof pushUserAction === 'function') {
        pushUserAction('view_machine', { id: item.id, title: item.title, category: item.cat });
    }
    renderMarket();
    const insight = AI.insight(item, marketData);
    const detailBadges = AI.badges(item, marketData).slice(0, 3).map(b => `<span class="ai-badge ai-badge-${b.color}">${b.icon} ${b.text}</span>`).join('');
    const related = marketData.filter(x => x.cat === item.cat && x.id !== item.id).slice(0, 3);
    const detailPhotos = listingPhotoUrls(item);
    const available = checkMachineAvailability(item);
    const options = serviceOptionsFor(item);
    const trabajos = item.trabajos || [item.cat];
    const title = document.getElementById('market-detail-title');
    const sub = document.getElementById('market-detail-sub');
    const body = document.getElementById('market-detail-body');
    if (title)
        title.innerHTML = `<i class="fas fa-tractor" style="color:var(--accent);margin-right:8px;"></i> ${item.title}`;
    if (sub)
        sub.textContent = `${item.cat} · ${item.area}`;
    if (body) {
        const specs = [
            item.hp ? { label: 'Potencia', value: `${item.hp} HP` } : null,
            item.year ? { label: 'Año', value: item.year } : null,
            item.capacidad ? { label: 'Capacidad', value: item.capacidad } : null,
            item.rendimiento ? { label: 'Rendimiento', value: item.rendimiento } : null,
            { label: 'Operario', value: item.operario ? 'Incluido' : 'No incluido' },
            { label: 'Distancia', value: `A ${item.dist} de tu lote` },
        ].filter(Boolean);
        body.innerHTML = `
      <div class="sales-detail-grid">
        <div class="sales-gallery">
          ${(detailPhotos.length ? detailPhotos.map((p, idx) => `<div class="sales-gallery-item ${idx === 0 ? 'main' : ''} has-photo"><img src="${p}" alt="${item.title} foto ${idx + 1}"></div>`) : [`<div class="sales-gallery-item main"><span style="font-size:48px;">${item.emoji}</span></div>`]).join('')}
        </div>
        <div class="sales-detail-main">
          <div class="sales-card-badges">${detailBadges}</div>
          <div class="sales-detail-price">${item.price}</div>
          <div class="sales-detail-summary">${options.map(o => o === 'Maquinaria + operario' ? 'Máquina + operario' : o).join(' · ')} · ${item.avail}</div>
          ${insight ? `<div class="ai-detail-insight ai-insight-${insight.color === 'amber' ? 'amber' : 'green'}" style="margin:12px 0;">${insight.icon} ${insight.text}</div>` : ''}
          <div class="sales-detail-actions">
            ${available
                ? `<button class="btn btn-primary" onclick="openBookingStepsModal(${item.id})"><i class="fas fa-calendar-check"></i> Reservar</button>`
                : `<button class="btn btn-ghost" disabled><i class="fas fa-calendar-xmark"></i> Sin disponibilidad</button>`}
            <button class="btn btn-ghost" onclick="toggleFav(${item.id});selectMarket(${item.id})"><i class="${isFav(item.id) ? 'fas' : 'far'} fa-heart"></i> ${isFav(item.id) ? 'Guardado' : 'Guardar favorito'}</button>
            <button class="btn btn-ghost report-detail-btn" onclick="openReportListingModal('rental',${item.id},event)"><i class="fas fa-flag"></i> Denunciar oferta</button>
          </div>
        </div>
      </div>
      <div class="sales-detail-sections">
        <section><h4>Especificaciones</h4><div class="sales-specs">${specs.map(s => `<span>${s.label}: ${s.value}</span>`).join('')}</div></section>
        <section><h4>Trabajos que realiza</h4><div class="sales-specs">${trabajos.map(t => `<span>${t}</span>`).join('')}</div></section>
        ${item.servicio ? `<section><h4>Sobre el servicio</h4><p>${item.servicio}</p></section>` : ''}
        <section><h4>Ubicación</h4><p>${item.area}. A ${item.dist} de tu lote. ${item.avail}.</p></section>
        <section>
          <h4>Contratista</h4>
          <div style="display:flex;align-items:center;gap:12px;padding:12px;background:var(--bg-secondary);border-radius:10px;margin-top:6px;">
            <div style="width:44px;height:44px;border-radius:50%;background:var(--accent-light);display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:800;color:var(--accent);flex-shrink:0;">
              ${item.area.split(',')[0].split(' ').map(w => w[0]).slice(0,2).join('')}
            </div>
            <div style="flex:1;">
              <div style="font-weight:700;font-size:14px;color:var(--text-primary);">${item.area.split(',')[0]}</div>
              <div style="font-size:12px;color:var(--text-muted);margin-top:2px;"><i class="fas fa-star" style="color:var(--amber-400);"></i> ${item.rating} (${item.reviews}) · Responde en ~${item.responseMin} min · ${item.reservasCampana} reservas esta campaña</div>
            </div>
            <span class="ai-badge ai-badge-green" style="flex-shrink:0;"><i class="fas fa-shield-alt"></i> Verificado</span>
          </div>
        </section>
        <section>
          <h4>Equipos similares</h4>
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:10px;margin-top:8px;">
            ${related.map(r => `
              <div onclick="selectMarket(${r.id})" style="cursor:pointer;border:1px solid var(--border);border-radius:10px;overflow:hidden;background:var(--bg-card);transition:border-color .15s;" onmouseover="this.style.borderColor='var(--accent)'" onmouseout="this.style.borderColor='var(--border)'">
                <div style="height:80px;background:var(--bg-secondary);display:flex;align-items:center;justify-content:center;font-size:28px;">
                  ${listingPhotoMedia(r) || r.emoji}
                </div>
                <div style="padding:8px 10px;">
                  <div style="font-size:12px;font-weight:600;color:var(--text-primary);margin-bottom:3px;">${r.title}</div>
                  <div style="font-size:13px;font-weight:800;color:var(--accent);">${r.price}</div>
                  <div style="font-size:11px;color:var(--text-muted);margin-top:2px;">${r.dist} · ${r.avail}</div>
                </div>
              </div>`).join('') || '<span style="color:var(--text-muted);font-size:13px;">No hay equipos similares disponibles.</span>'}
          </div>
        </section>
      </div>`;
    }
    const overlay = document.getElementById('market-detail-overlay');
    const sheet = document.getElementById('market-detail-sheet');
    if (overlay)
        overlay.classList.add('open');
    if (sheet)
        sheet.classList.add('open');
    document.body.style.overflow = 'hidden';
}
function closeMarketDetail(e) {
    if (!e || e.target.id === 'market-detail-overlay' || e.currentTarget?.classList?.contains('modal-close')) {
        const overlay = document.getElementById('market-detail-overlay');
        const sheet = document.getElementById('market-detail-sheet');
        if (overlay)
            overlay.classList.remove('open');
        if (sheet)
            sheet.classList.remove('open');
        document.body.style.overflow = '';
    }
}

function selectSalesMarket(id) {
    selectedSalesListing = id;
    renderSalesUnified();
    const item = salesListings.find(x => x.id === id);
    if (!item)
        return;
    const grid = document.getElementById('market-grid');
    if (!grid)
        return;
    const existing = grid.querySelector('.market-detail-strip.open');
    if (existing)
        existing.remove();
    const selectedCard = grid.querySelector('.market-card.selected');
    if (!selectedCard)
        return;
    const detailBadges = salesCardBadges(item);
    const related = salesListings.filter(x => salesDisplayCategory(x) === salesDisplayCategory(item) && x.id !== item.id).slice(0, 3);
    const strip = document.createElement('div');
    strip.className = 'market-detail-strip open';
    strip.id = `nd-sales-detail-${item.id}`;
    const detailPhotos = listingPhotoUrls(item);
    strip.innerHTML = `
    ${detailPhotos.length ? `<div class="mds-photo-strip">${detailPhotos.map((p, idx) => `<img src="${p}" class="${idx === 0 ? 'main' : ''}" alt="${salesListingTitle(item)} foto ${idx + 1}">`).join('')}</div>` : ''}
    <div class="mds-inner">
      <div class="mds-emoji">${detailPhotos.length ? `<img src="${detailPhotos[0]}" alt="${salesListingTitle(item)}">` : getSalesCatIcon(salesDisplayCategory(item))}</div>
      <div class="mds-cell">
        ${detailBadges ? `<div class="ai-badges-row" style="margin-bottom:6px;">${detailBadges}</div>` : ''}
        <div class="mds-lbl">Equipo</div>
        <div class="mds-val" style="font-weight:700;font-size:14px;margin-bottom:4px;">${salesListingTitle(item)}</div>
        <div style="font-size:11px;color:var(--text-muted);">${salesDisplayCategory(item)} · ${item.year} · ${item.location}, ${item.province}</div>
      </div>
      <div class="mds-cell">
        <div class="mds-lbl">Precio total</div>
        <div class="mds-price">${salesMoney(item)}</div>
        <div class="mds-saving">${item.priceDelta < 0 ? `Bajo ${Math.abs(item.priceDelta)}%` : item.goodPrice ? 'Buen valor de mercado' : 'Precio publicado'}</div>
        <div style="font-size:11px;color:var(--text-muted);margin-top:2px;">${item.sellerType}</div>
      </div>
      <div class="mds-cell">
        <div class="mds-lbl">Estado</div>
        <div class="mds-val">${item.condition}</div>
        <div style="margin-top:6px;"><span style="font-size:11px;color:var(--text-muted);">${item.hours ? item.hours.toLocaleString('es-AR') + ' horas' : 'Sin horas'} · ${item.distanceKm} km</span></div>
        <div class="ai-detail-insight ai-insight-green" style="margin-top:8px;">${salesRecommendation(item)}</div>
      </div>
      <div class="mds-cell">
        <div class="mds-lbl">Vendedor</div>
        <div class="mds-val">${item.seller || item.sellerType || 'Vendedor verificado'}</div>
        <div style="font-size:11px;color:var(--text-muted);margin-top:4px;">${item.sellerType || 'Productor'} · ${item.location}, ${item.province}</div>
      </div>
      <div class="mds-actions">
        <button class="btn btn-ghost btn-sm w-full" style="border-radius:9px;font-size:12px;" onclick="requestSalesInfo(${item.id})">
          <i class="fas fa-circle-info"></i> Solicitar informacion
        </button>
        <button class="btn btn-ghost btn-sm w-full" style="border-radius:9px;font-size:12px;" onclick="toggleSalesFavorite(${item.id});selectSalesMarket(${item.id})">
          <i class="${isSalesFav(item.id) ? 'fas' : 'far'} fa-heart" style="${isSalesFav(item.id) ? 'color:var(--danger-500);' : ''}"></i>
          ${isSalesFav(item.id) ? 'Guardado' : 'Favorito'}
        </button>
        <button class="btn btn-ghost btn-sm w-full report-detail-btn" style="border-radius:9px;font-size:12px;" onclick="openReportListingModal('sales',${item.id},event)"><i class="fas fa-flag"></i> Denunciar oferta</button>
      </div>
    </div>
    <div style="padding:12px 16px;border-top:1px solid var(--border);display:flex;gap:8px;flex-wrap:wrap;font-size:11px;color:var(--text-muted);">
      <strong style="color:var(--text-secondary);">Descripcion:</strong> <span style="line-height:1.45;">${item.description || 'Equipo publicado para compra en NexuDrive.'}</span>
    </div>
    <div style="padding:12px 16px;border-top:1px solid var(--border);display:flex;gap:8px;flex-wrap:wrap;font-size:11px;color:var(--text-muted);">
      <strong style="color:var(--text-secondary);">Mantenimiento:</strong> <span style="line-height:1.45;">${item.maintenance || 'A consultar con el vendedor.'}</span>
    </div>
    <div style="padding:12px 16px;border-top:1px solid var(--border);display:flex;gap:8px;flex-wrap:wrap;font-size:11px;color:var(--text-muted);">
      <strong style="color:var(--text-secondary);">Caracteristicas:</strong> ${item.specs.map(s => `<span class="ai-badge ai-badge-blue">${s}</span>`).join('')}
      ${related.length ? `<strong style="color:var(--text-secondary);margin-left:6px;">Relacionadas:</strong> ${related.map(r => `<button class="ai-badge ai-badge-green" style="cursor:pointer;" onclick="selectSalesMarket(${r.id})">${salesListingTitle(r)}</button>`).join('')}` : ''}
    </div>`;
    const detail = document.getElementById('market-detail');
    if (detail) {
        detail.classList.add('has-content');
        detail.innerHTML = strip.innerHTML;
    }
    selectedCard.insertAdjacentElement('afterend', strip);
    setTimeout(() => strip.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 80);
    if (window.innerWidth <= 900 && typeof openMktSheet === 'function')
        setTimeout(openMktSheet, 90);
}

// ---- original java.js lines 6403-6426 ----
// Market sheet
function openMktSheet() {
    if (window.innerWidth > 900)
        return;
    const detail = document.getElementById('market-detail');
    const content = document.getElementById('mkt-sheet-content');
    if (detail && content)
        content.innerHTML = detail.innerHTML;
    document.getElementById('mkt-sheet-overlay').classList.add('open');
    document.getElementById('mkt-sheet').classList.add('open');
    document.body.style.overflow = 'hidden';
}
function closeMktSheet() {
    document.getElementById('mkt-sheet-overlay').classList.remove('open');
    document.getElementById('mkt-sheet').classList.remove('open');
    document.body.style.overflow = '';
};
