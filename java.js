﻿"use strict";
/* ================================================================
   AGRONEX — TypeScript unificado
   Bloque 1: Lógica principal (calculadora, NexuDrive, perfil, etc.)
   Bloque 2: Mobile layer (bottom nav, FAB, sheets, verificación)
================================================================ */
/* ================================================================
   AGRONEX — JavaScript unificado
   Bloque 1: Lógica principal (calculadora, NexuDrive, perfil, etc.)
   Bloque 2: Mobile layer (bottom nav, FAB, sheets, verificación)
================================================================ */
// ===== STATE =====
let isDark = false;
let currentWAMachine = '';
let currentWAMarket = null;
let currentWABooking = null;
let currentPaymentMarket = null;
let currentPaymentService = 'Solo maquinaria';
let currentPaymentProvider = 'Mercado Pago';
let currentWAUrgency = 'Normal';
let currentWAOp = 'Solo maquinaria';
// simMode y calcChart viven en calculadora.js
// ── Central showScreen hook registry ─────────────────────────────────────────
// Replaces the 3 fragile monkey-patches that chained window.showScreen.
// Each module registers its side-effect via onShowScreen(fn).
// The single wrap is applied once on DOMContentLoaded (end of file).
const _showScreenHooks = [];
function onShowScreen(fn) { _showScreenHooks.push(fn); }
// ══════════════════════════════════════════════════════════════════════════════
// USER STORE — single source of truth for all user data
// All modules read from here. Changes propagate automatically via syncAll().
// ══════════════════════════════════════════════════════════════════════════════
const _USER_DEFAULTS = {
    // Personal
    nombre: 'Carlos',
    apellido: 'Argüello',
    email: 'carlos.arguello@campo.com',
    tel: '+54 9 11 4567-8901',
    provincia: 'Buenos Aires',
    ciudad: 'Pergamino',
    empresa: '',
    cuit: '',
    fotoUrl: null,
    // Operation
    ha: '100-500',
    cultivos: ['Soja', 'Maíz'],
    tipo: 'productor',
    maq: 'alquilada',
    campo: 'alquilado',
    // Preferences
    moneda: 'USD',
    unidadGrano: 'qq',
    numFormat: 'normal',
    sufijoPorHa: 'por hectárea',
};
const UserStore = (() => {
    const LS_KEY = 'agronex_user';
    let _data = Object.assign({}, _USER_DEFAULTS);
    let _subs = [];
    function _load() {
        try {
            const saved = JSON.parse(localStorage.getItem(LS_KEY) || '{}');
            // Deep merge: restore arrays correctly
            const merged = Object.assign(Object.assign({}, _USER_DEFAULTS), saved);
            if (!Array.isArray(merged.cultivos))
                merged.cultivos = _USER_DEFAULTS.cultivos;
            _data = merged;
        }
        catch (e) {
            _data = Object.assign({}, _USER_DEFAULTS);
        }
    }
    function _persist() {
        try {
            localStorage.setItem(LS_KEY, JSON.stringify(_data));
        }
        catch (e) { console.warn("[Agronex]", e); }
    }
    function get(key) {
        if (!key)
            return Object.assign({}, _data);
        // Deep clone arrays to avoid external mutation
        const v = _data[key];
        return Array.isArray(v) ? [...v] : v;
    }
    function set(keyOrObj, value) {
        if (typeof keyOrObj === 'object' && keyOrObj !== null) {
            Object.assign(_data, keyOrObj);
        }
        else {
            _data[keyOrObj] = value;
        }
        _persist();
        // Notify asynchronously to avoid re-entrant calls during initialization
        setTimeout(() => _subs.forEach(fn => { try {
            fn(_data);
        }
        catch (e) { console.warn("[Agronex]", e); } }), 0);
    }
    // Immediate sync (no timeout) for init path
    function setQuiet(keyOrObj, value) {
        if (typeof keyOrObj === 'object' && keyOrObj !== null)
            Object.assign(_data, keyOrObj);
        else
            _data[keyOrObj] = value;
        _persist();
    }
    function subscribe(fn) { _subs.push(fn); }
    function init() { _load(); }
    // ── Puente con Supabase: profiles (fuente única de verdad real) ──
    // Mapea columnas de la tabla `profiles` a las claves internas que ya usa
    // todo el resto del código (nombre, tel, ha, etc.) — no rompe nada existente,
    // solo cambia DE DÓNDE viene el dato inicial.
    function loadFromProfile(profile) {
        if (!profile) return;
        const mapped = {
            nombre: profile.nombre || _USER_DEFAULTS.nombre,
            apellido: profile.apellido || _USER_DEFAULTS.apellido,
            email: profile.email || _USER_DEFAULTS.email,
            tel: profile.telefono || _USER_DEFAULTS.tel,
            provincia: profile.provincia || _USER_DEFAULTS.provincia,
            empresa: profile.empresa || _USER_DEFAULTS.empresa,
            cuit: profile.cuit || _USER_DEFAULTS.cuit,
            fotoUrl: profile.foto_url || null,
            ha: profile.ha != null ? String(profile.ha) : _USER_DEFAULTS.ha,
            cultivos: profile.cultivo_principal ? [profile.cultivo_principal] : _USER_DEFAULTS.cultivos,
            tipo: profile.tipo || _USER_DEFAULTS.tipo,
            moneda: profile.moneda || _USER_DEFAULTS.moneda,
            unidadGrano: profile.unidad_peso || _USER_DEFAULTS.unidadGrano,
            numFormat: profile.formato || _USER_DEFAULTS.numFormat,
            // Campos propios de profiles, sin equivalente previo en _USER_DEFAULTS:
            _profileId: profile.id,
            onboardingCompletado: !!profile.onboarding_completado,
            verificado: profile.verificado || null,
            idioma: profile.idioma || 'es',
        };
        setQuiet(mapped); // setQuiet: no dispara subs todavía, lo hace doLogin() después vía syncAll()
    }
    // Persiste un subconjunto de campos en Supabase (no todo localStorage, solo lo relevante a profiles)
    async function saveToSupabase(fields) {
        const profileId = get('_profileId');
        if (!profileId || typeof supabaseClient === 'undefined') {
            console.warn('[Agronex] No hay sesión activa, no se guarda en Supabase.');
            return { error: 'no-session' };
        }
        const { error } = await supabaseClient
            .from('profiles')
            .update(Object.assign({}, fields, { updated_at: new Date().toISOString() }))
            .eq('id', profileId);
        if (error) console.error('[Agronex] Error guardando perfil en Supabase:', error);
        return { error };
    }
    return { get, set, setQuiet, subscribe, init, loadFromProfile, saveToSupabase };
})();
// ═══════════════════════════════════════════════════════════════
//  AGRONEX INTEGRATION BUS
//  Single source of truth: UserStore drives everything.
//  NexuDrive ↔ Campañas ↔ Calculadora ↔ Perfil ↔ Reservas
// ═══════════════════════════════════════════════════════════════
const AgronexBus = (() => {
    let _opportunityContext = null;
    // ── 1. Derived helpers (read from UserStore) ──────────────
    function fullName() {
        const n = UserStore.get('nombre') || '';
        const a = UserStore.get('apellido') || '';
        return [n, a].filter(Boolean).join(' ') || 'Productor';
    }
    function userLocation() {
        const c = UserStore.get('ciudad') || '';
        const p = UserStore.get('provincia') || '';
        return [c, p].filter(Boolean).join(', ') || 'Argentina';
    }
    function userPhone() {
        return UserStore.get('tel') || '';
    }
    function setOpportunityContext(ctx) {
        _opportunityContext = ctx || null;
    }
    function consumeOpportunityContext() {
        const ctx = _opportunityContext;
        _opportunityContext = null;
        return ctx;
    }
    // ── 2. Sync profile everywhere it appears ────────────────
    function syncProfileUI() {
        const name = fullName();
        const loc = userLocation();
        const email = UserStore.get('email') || '';
        const tel = UserStore.get('tel') || '';
        const ha = UserStore.get('ha') || '100-500';
        const haNum = { 'menos100': '<100 ha', '100-500': '100–500 ha', '500-1500': '500–1500 ha', 'mas1500': '+1500 ha' }[ha] || ha;
        // Sidebar user card
        document.querySelectorAll('.sidebar-user-name, .profile-name-display').forEach(el => el.textContent = name);
        document.querySelectorAll('.sidebar-user-sub, .profile-loc-display').forEach(el => el.textContent = loc);
        // Nav greeting
        const gr = document.querySelector('.home-greeting-name, .greeting-name');
        if (gr)
            gr.textContent = name.split(' ')[0];
        // Perfil screen fields
        const pn = document.getElementById('perfil-nombre');
        const pa = document.getElementById('perfil-apellido');
        const pm = document.getElementById('perfil-email');
        const pt = document.getElementById('perfil-tel');
        const pc = document.getElementById('perfil-ciudad');
        const pp = document.getElementById('perfil-prov');
        if (pn && !document.activeElement.closest('#perfil-nombre'))
            pn.value = UserStore.get('nombre') || '';
        if (pa && !document.activeElement.closest('#perfil-apellido'))
            pa.value = UserStore.get('apellido') || '';
        if (pm && !document.activeElement.closest('#perfil-email'))
            pm.value = email;
        if (pt && !document.activeElement.closest('#perfil-tel'))
            pt.value = tel;
        if (pc && !document.activeElement.closest('#perfil-ciudad'))
            pc.value = UserStore.get('ciudad') || '';
        if (pp && !document.activeElement.closest('#perfil-prov'))
            pp.value = UserStore.get('provincia') || '';
        // Publicar form: pre-fill contact from profile
        const pubContact = document.getElementById('pub-contacto');
        if (pubContact && !pubContact.value)
            pubContact.value = tel;
        const pubZona = document.getElementById('pub-zona');
        if (pubZona && !pubZona.value)
            pubZona.value = userLocation();
        // Payment modal: pre-fill name field
        const payNombre = document.getElementById('pay-nombre');
        if (payNombre && !payNombre.value)
            payNombre.value = name;
        // WA modal: pre-fill requester name
        const waNombre = document.getElementById('wa-nombre');
        if (waNombre && !waNombre.value)
            waNombre.value = name;
    }
    // ── 3. Pull current campaign costs into calculator ────────
    // Reads the most recent active campaign from nexuDriveBookings
    // and patches c-maq if a real booking exists for this campaign
    function syncCampaignCostsToCalc() {
        var _a;
        if (typeof nexuDriveBookings === 'undefined')
            return;
        const active = Object.values(nexuDriveBookings)
            .filter(b => b && ['reservado', 'confirmado', 'activo'].includes(b.status));
        if (!active.length)
            return;
        // Total maquinaria cost per ha from active bookings
        const ha = parseFloat((_a = document.getElementById('c-ha')) === null || _a === void 0 ? void 0 : _a.value) || 150;
        const maqCost = active.reduce((sum, b) => sum + (b.priceHa || 0), 0);
        if (maqCost <= 0)
            return;
        const maqInput = document.getElementById('c-maq');
        if (maqInput && parseFloat(maqInput.value) === 40) {
            // Only auto-fill if still at default — don't overwrite user input
            maqInput.value = maqCost;
            maqInput.classList.add('integration-synced');
            if (typeof calcAuto === 'function')
                calcAuto();
            showIntegrationToast(`Costo de maquinaria actualizado desde NexuDrive (${mktFmt(maqCost)}/ha)`);
        }
    }
    // ── 4. Push booking → campaign cost snapshot ─────────────
    // Called after every successful booking payment
    function onBookingCreated(booking, machine) {
        // 4a. Store machine cost in campaign snapshot (localStorage)
        const snapKey = 'agronex_campaign_costs';
        let costs = {};
        try {
            costs = JSON.parse(localStorage.getItem(snapKey) || '{}');
        }
        catch (e) { console.warn("[Agronex]", e); }
        costs[booking.id] = {
            type: 'maquinaria_nexudrive',
            machineTitle: (machine === null || machine === void 0 ? void 0 : machine.title) || booking.machineTitle,
            category: (machine === null || machine === void 0 ? void 0 : machine.cat) || '—',
            priceHa: booking.priceHa,
            hectares: booking.hectares,
            totalCost: booking.total,
            fecha: booking.fecha,
            createdAt: booking.createdAt,
        };
        localStorage.setItem(snapKey, JSON.stringify(costs));
        // 4b. Notify calculator to update
        syncCampaignCostsToCalc();
        // 4c. Show economic impact insight
        const impact = booking.total;
        if (impact > 0) {
            setTimeout(() => {
                showIntegrationToast(`💰 Reserva impacta USD ${impact.toLocaleString('es-AR')} en tu campaña activa`);
            }, 1200);
        }
        // 4d. Refresh NexuDrive saving banner with real booked cost
        refreshSavingBanner();
    }
    // ── 5. Refresh NexuDrive saving banner (real data) ────────
    function refreshSavingBanner() {
        const banner = document.getElementById('nexudrive-banner-headline');
        if (!banner)
            return;
        const costs = (() => {
            try {
                return JSON.parse(localStorage.getItem('agronex_campaign_costs') || '{}');
            }
            catch (e) {
                return {};
            }
        })();
        const nexuCosts = Object.values(costs).filter(c => c.type === 'maquinaria_nexudrive');
        if (!nexuCosts.length)
            return;
        const totalUSD = nexuCosts.reduce((s, c) => s + (c.totalCost || 0), 0);
        if (totalUSD > 0) {
            const mon = (typeof perfilData !== 'undefined') ? perfilData.moneda : 'USD';
            const tc = (typeof getTC === 'function') ? getTC() : 1;
            const val = mon === 'ARS' ? totalUSD * tc : totalUSD;
            const sym = mon === 'ARS' ? 'ARS ' : 'USD ';
            const compact = (typeof compactNum === 'function') ? compactNum(val, 'force') : Math.round(val).toLocaleString('es-AR');
            banner.textContent = `Ya gestionaste ${sym}${compact} en maquinaria este ciclo`;
        }
    }
    // ── 6. Build smart WA message from real data ─────────────
    function buildSmartWAMessage(machine, booking) {
        const name = fullName();
        const loc = userLocation();
        const tel = userPhone();
        const ha = (booking === null || booking === void 0 ? void 0 : booking.hectares) || '—';
        const fecha = (booking === null || booking === void 0 ? void 0 : booking.fecha) || 'a confirmar';
        const serv = (booking === null || booking === void 0 ? void 0 : booking.service) || 'Solo maquinaria';
        const lote = (booking === null || booking === void 0 ? void 0 : booking.lote) || loc;
        const id = (booking === null || booking === void 0 ? void 0 : booking.id) || '—';
        const cultivos = (UserStore.get('cultivos') || []).join(', ') || '—';
        const haRange = UserStore.get('ha') || '—';
        return `Hola, soy *${name}* — productor de ${loc} (${haRange} ha de ${cultivos}).

Reservé la *${(machine === null || machine === void 0 ? void 0 : machine.title) || '—'}* en Agronex (ID: ${id}).

📋 *Detalles del servicio:*
• Hectáreas: ${ha} ha
• Fecha estimada: ${fecha}
• Modalidad: ${serv}
• Zona de trabajo: ${lote}
${tel ? `• Mi teléfono: ${tel}` : ''}

¿Podemos confirmar la llegada?`;
    }
    // ── 7. Sync WA message inputs with real profile data ─────
    function fillWAModalFromProfile(machine, booking) {
        const name = fullName();
        const loc = userLocation();
        // Pre-fill requester name in WA form
        const waNombre = document.getElementById('wa-nombre');
        if (waNombre)
            waNombre.value = name;
        // Pre-fill lote with user location if empty
        const waLote = document.getElementById('wa-lote');
        if (waLote && !waLote.value)
            waLote.value = loc;
        // Update WA preview
        if (typeof updateWAPreview === 'function')
            updateWAPreview();
    }
    // ── 8. Show integration sync toast ───────────────────────
    function showIntegrationToast(msg) {
        if (typeof showToast === 'function')
            showToast(msg, 'info');
    }
    // ── 9. Subscribe to UserStore changes → sync everywhere ──
    UserStore.subscribe(data => {
        syncProfileUI();
        // If name/location changed, rebuild WA previews if modal is open
        const waModal = document.getElementById('wa-modal');
        if (waModal && waModal.style.display !== 'none') {
            if (typeof updateWAPreview === 'function')
                updateWAPreview();
        }
        // Refresh market with new currency/unit prefs
        if (typeof renderMarket === 'function')
            renderMarket();
    });
    // ── 10. Initial sync on load ──────────────────────────────
    function init() {
        syncProfileUI();
        refreshSavingBanner();
        // Read any existing booking costs and patch calc
        setTimeout(() => syncCampaignCostsToCalc(), 500);
    }
    return {
        fullName,
        userLocation,
        userPhone,
        setOpportunityContext,
        consumeOpportunityContext,
        syncProfileUI,
        syncCampaignCostsToCalc,
        onBookingCreated,
        refreshSavingBanner,
        buildSmartWAMessage,
        fillWAModalFromProfile,
        init,
    };
})();
// ── Expose helpers used by existing code ────────────────────
function buildFullName() { return AgronexBus.fullName(); }
// ── Backward-compat Proxies so existing code like perfilData.moneda still works ──
// Reads → UserStore.get(). Writes → UserStore.set() (which also triggers syncAll).
const perfilData = new Proxy({}, {
    get: (_, k) => UserStore.get(k),
    set: (_, k, v) => { UserStore.set(k, v); return true; }
});
const personalData = new Proxy({}, {
    get: (_, k) => UserStore.get(k),
    set: (_, k, v) => { UserStore.set(k, v); return true; }
});
// CSS for integration-synced fields (injected after proxies to keep parser happy)
(() => {
    const s = document.createElement('style');
    s.textContent = '.integration-synced { border-color: var(--accent) !important; background: var(--accent-light) !important; transition: border-color .4s, background .4s; }';
    document.head.appendChild(s);
})();

// ===== CALCULADORA =====
// Módulo separado en: js/calculator/calculator.js
// Se carga desde index.html junto al resto de módulos de negocio.


/* ================================================================
   Feature modules moved out of java.js
   Load order is defined in index.html under JavaScript del proyecto.
================================================================ */

// ── Single central showScreen wrap (replaces 3 fragile monkey-patches) ────────
// All hooks registered via onShowScreen() are called here, in registration order.
document.addEventListener('DOMContentLoaded', function () {
    const _origShowScreen = window.showScreen;
    window.showScreen = function (id, navEl) {
        if (typeof _origShowScreen === 'function')
            _origShowScreen(id, navEl);
        _showScreenHooks.forEach(function (fn) {
            try { fn(id, navEl); } catch (e) { console.warn('[Agronex] showScreen hook error:', e); }
        });
    };
});
