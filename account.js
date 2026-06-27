"use strict";
/* ================================================================
   AGRONEX module: Account, profile, verification, offers, personal stats and mobile account views
   Extracted from java.js without behavior changes.
================================================================ */

// ---- original java.js lines 4404-4971 ----
// ===== PERFIL CHIPS =====
function selectChip(group, val, el, label) {
    el.parentElement.querySelectorAll('.profile-chip').forEach(c => c.classList.remove('active'));
    el.classList.add('active');
    perfilData[group] = val;
    updatePerfilDisplay();
    // Show/hide alquiler price input based on campo selection
    if (group === 'campo') {
        const extra = document.getElementById('campo-alq-extra');
        if (extra)
            extra.style.display = (val === 'alquilado' || val === 'mixto') ? 'block' : 'none';
    }
}
function onHaNumInput(val) {
    const n = parseInt(val, 10);
    if (!isNaN(n) && n > 0) {
        perfilData.ha = n;
        // Highlight matching quick-pick chip if exact match
        document.querySelectorAll('#chips-ha .profile-chip').forEach(c => c.classList.remove('active'));
        updatePerfilDisplay();
        applyPerfilToCalc();
    }
}
function quickPickHa(n, el) {
    perfilData.ha = n;
    const inp = document.getElementById('perfil-ha-num');
    if (inp) inp.value = n;
    document.querySelectorAll('#chips-ha .profile-chip').forEach(c => c.classList.remove('active'));
    el.classList.add('active');
    updatePerfilDisplay();
    applyPerfilToCalc();
}
function toggleCultivo(el, cultivo) {
    el.classList.toggle('active');
    if (el.classList.contains('active')) {
        if (!perfilData.cultivos.includes(cultivo))
            perfilData.cultivos.push(cultivo);
    }
    else {
        perfilData.cultivos = perfilData.cultivos.filter(c => c !== cultivo);
    }
    updatePerfilDisplay();
}
function savePerfilChips() {
    applyPerfilToCalc();
    showToast('Perfil guardado — la calculadora ya usa tus datos ✓', 'success');
    if (typeof pushUserAction === 'function') {
        pushUserAction('profile_update', { kind: 'operation' });
    }
}
// ===== PERFIL PERSONAL =====
// State for personal info (persists in memory, survives tab switches)
// ── Helpers that depend on UserStore ─────────────────────────────────────────
function getInitials(nombre, apellido) {
    const n = (nombre || '').trim();
    const a = (apellido || '').trim();
    if (!n && !a)
        return '?';
    if (!a)
        return n.charAt(0).toUpperCase();
    return (n.charAt(0) + a.charAt(0)).toUpperCase();
}
function buildRoleLabel() {
    const u = UserStore.get();
    const tipoMap = { productor: 'Productor', contratista: 'Contratista', arrendatario: 'Arrendatario', mixto: 'Mixto' };
    const tipo = tipoMap[u.tipo] || 'Productor';
    const loc = [u.ciudad, u.provincia].filter(Boolean).join(', ') || 'Argentina';
    return `${tipo} · ${loc}`;
}
function _applyAvatar(el, fotoUrl, initials, isTopbar = false) {
    if (!el)
        return;
    if (fotoUrl) {
        el.innerHTML = `<img src="${fotoUrl}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
        el.style.background = 'transparent';
        if (isTopbar)
            el.style.padding = '0';
    }
    else {
        el.innerHTML = '';
        el.textContent = initials;
        el.style.background = 'var(--accent)';
        if (isTopbar)
            el.style.padding = '';
    }
}
// ── syncAll: single dispatcher — called by UserStore on every change ──────────
function syncAll() {
    const u = UserStore.get();
    const fullName = buildFullName();
    const initials = getInitials(u.nombre, u.apellido);
    const role = buildRoleLabel();
    // 1. Desktop sidebar user block
    const deskName = document.querySelector('.sidebar .sidebar-user .sidebar-user-name');
    const deskSub = document.querySelector('.sidebar .sidebar-user .sidebar-user-sub');
    const deskAv = document.querySelector('.sidebar .sidebar-user .sidebar-avatar');
    if (deskName)
        deskName.textContent = fullName;
    if (deskSub)
        deskSub.textContent = role;
    _applyAvatar(deskAv, u.fotoUrl, initials);
    // 3. Topbar avatar
    const topAv = document.querySelector('.topbar .avatar-btn');
    _applyAvatar(topAv, u.fotoUrl, initials, true);
    // 3b. User menu avatar + info
    const umAv = document.getElementById('user-menu-avatar');
    const umName = document.getElementById('user-menu-name');
    const umEmail = document.getElementById('user-menu-email');
    _applyAvatar(umAv, u.fotoUrl, initials);
    if (umName) umName.textContent = fullName;
    if (umEmail) umEmail.textContent = u.email || 'productor@campo.com';
    // 4. Profile screen card
    const psName = document.getElementById('profile-sidebar-name');
    const psRole = document.getElementById('profile-sidebar-role');
    const psAv = document.getElementById('profile-sidebar-avatar');
    if (psName)
        psName.textContent = fullName;
    if (psRole)
        psRole.textContent = role;
    _applyAvatar(psAv, u.fotoUrl, initials);
    // 5. Profile name label (static text next to avatar in form header)
    const pnLabel = document.getElementById('perfil-fullname-label');
    if (pnLabel)
        pnLabel.textContent = fullName;
    // 6. Foto preview
    const fotoPreview = document.getElementById('perfil-foto-preview');
    _applyAvatar(fotoPreview, u.fotoUrl, initials);
    // 7. Greeting — both screen variants
    const h = new Date().getHours();
    const grKey = h < 12 ? 'greeting.morning' : h < 18 ? 'greeting.afternoon' : 'greeting.evening';
    const grText = h < 12 ? 'Buenos días' : h < 18 ? 'Buenas tardes' : 'Buenas noches';
    const grEl = document.querySelector('.home-greeting-text');
    if (grEl)
        grEl.innerHTML = `${t(grKey)}, <span>${u.nombre || 'Carlos'}.</span>`;
    const hnEl = document.querySelector('.home-welcome-name');
    if (hnEl)
        hnEl.innerHTML = `${grText}, <em>${u.nombre || 'Carlos'}.</em>`;
    // 8. Pre-fill WA modal name (only if not yet typed by user)
    const waNombre = document.getElementById('wa-nombre');
    if (waNombre && !waNombre._userEdited)
        waNombre.value = fullName;
    // 9. Pre-fill payment modal client name (only if not yet typed)
    const payNombre = document.getElementById('pay-nombre');
    if (payNombre && !payNombre._userEdited)
        payNombre.value = fullName;
    // 10. Re-apply calc defaults (ha, cultivo)
    applyPerfilToCalc();
}
// Mark fields as user-edited so syncAll doesn't overwrite them mid-flow
document.addEventListener('DOMContentLoaded', () => {
    ['wa-nombre', 'pay-nombre'].forEach(id => {
        const el = document.getElementById(id);
        if (el)
            el.addEventListener('input', () => { el._userEdited = true; });
    });
    if (typeof initNotifAccordion === 'function') {
        initNotifAccordion();
    }
});
// Register syncAll as the universal subscriber
UserStore.subscribe(syncAll);
// ── syncPerfilPersonal: reads form → stores in UserStore (triggers syncAll) ──
function syncPerfilPersonal() {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    UserStore.set({
        nombre: ((_a = document.getElementById('perfil-nombre')) === null || _a === void 0 ? void 0 : _a.value) || '',
        apellido: ((_b = document.getElementById('perfil-apellido')) === null || _b === void 0 ? void 0 : _b.value) || '',
        email: ((_c = document.getElementById('perfil-email')) === null || _c === void 0 ? void 0 : _c.value) || '',
        tel: ((_d = document.getElementById('perfil-tel')) === null || _d === void 0 ? void 0 : _d.value) || '',
        ciudad: ((_e = document.getElementById('perfil-ciudad')) === null || _e === void 0 ? void 0 : _e.value) || '',
        empresa: ((_f = document.getElementById('perfil-empresa')) === null || _f === void 0 ? void 0 : _f.value) || '',
        cuit: ((_g = document.getElementById('perfil-cuit')) === null || _g === void 0 ? void 0 : _g.value) || '',
        provincia: ((_h = document.getElementById('perfil-provincia')) === null || _h === void 0 ? void 0 : _h.value) || UserStore.get('provincia'),
    });
    // syncAll fires automatically via subscriber
}
// ── Backward compat shim — old code called syncPerfilSidebarDisplay() ─────────
function syncPerfilSidebarDisplay() { syncAll(); }
function updatePerfilDisplay() { syncAll(); }
function savePerfilPersonal() {
    syncPerfilPersonal();
    showToast(`Información de ${buildFullName()} guardada ✓`, 'success');
    if (typeof pushUserAction === 'function') {
        pushUserAction('profile_update', { kind: 'personal' });
    }
}
function handleFotoUpload(event) {
    var _a;
    const file = (_a = event.target.files) === null || _a === void 0 ? void 0 : _a[0];
    if (!file)
        return;
    if (!file.type.startsWith('image/')) {
        showToast('Seleccioná una imagen válida (JPG, PNG, etc.)', 'error');
        return;
    }
    if (file.size > 5 * 1024 * 1024) {
        showToast('La imagen no puede superar los 5 MB', 'error');
        return;
    }
    const reader = new FileReader();
    reader.onload = (e) => { UserStore.set('fotoUrl', e.target.result); showToast('Foto de perfil actualizada ✓', 'success'); };
    reader.readAsDataURL(file);
}
function resetFoto() {
    UserStore.set('fotoUrl', null);
    const input = document.getElementById('perfil-foto-input');
    if (input)
        input.value = '';
    showToast('Foto eliminada', 'info');
}
// ===== INIT =====
// IMPORTANTE: doLogin() ya NO se llama acá directamente.
// auth.js controla el ingreso real: enterApp() verifica la sesión de Supabase
// y solo llama a doLogin() si hay una sesión válida con onboarding completo.
// Lo que sí podemos pre-computar sin depender de auth (no toca datos de usuario):
window.onload = function () {
    aiSortMarket();
    initNexuMode();
    updateFavBadge();
};
// Override closeAll to also close drawer
function closeAll() {
    closeNotifs();
}
// ======================================================
// FIX 2 — LANGUAGE / i18n  (ES / EN)
// ======================================================
const LANG = {
    es: {
        appName: 'Agronex',
        nav: { home: 'Inicio', calc: 'Calculadora', market: 'Buscar maquinaria', publicar: 'Publicar equipo', favoritos: 'Mis favoritos', campanas: 'Campañas anteriores', ofertas: 'Ofertas publicadas', perfil: 'Mi perfil', reservas: 'Reservas', verificacion: 'Verificación de cuenta' },
        greeting: { morning: 'Buenos días', afternoon: 'Buenas tardes', evening: 'Buenas noches' },
        market: { title: 'NexuDrive', sub: 'Tractores, sembradoras, pulverizadoras, cosechadoras y drones en tu zona.', selectHint: 'Seleccioná una opción para ver los detalles y el ahorro estimado.', publishTitle: '¿Tenés equipo disponible?', publishDesc: 'Publicá tu maquinaria o servicio en NexuDrive y recibí consultas de productores de tu zona.', publishBtn: 'Publicar mi equipo' },
        calc: { title: 'Calculadora', sub: 'Calculá cuánto puede dejarte esta campaña.', save: 'Guardar cálculo', clear: 'Limpiar',
            cultivoLabel: 'Cultivo', haLabel: 'Hectáreas', precioLabel: 'Precio de venta', rendLabel: 'Rendimiento esperado',
            costSection: 'Costos directos', indirectSection: 'Costos indirectos',
            semLabel: 'Semillas', fertLabel: 'Fertilizantes', agroLabel: 'Agroquímicos', combLabel: 'Combustible', maqLabel: 'Maquinaria', moLabel: 'Empleados', alqLabel: 'Alquiler de campo',
            comLabel: 'Comercialización', segLabel: 'Seguro', impLabel: 'Administración / impuestos',
            resultTitle: 'Tu resultado', ingresoLabel: 'Ingreso bruto', costoLabel: 'Gasto total', gananciaLabel: 'Ganancia', margenLabel: 'Margen', ganHaLabel: 'Ganancia por hectárea', peLabel: 'Precio de equilibrio',
            modeSimple: 'En conjunto', modeLotes: 'Por lotes/cultivos', addLote: 'Agregar lote',
            simTitle: 'Simulador', simAlquilar: 'Alquilar', simComprar: 'Maquinaria propia',
            saving: 'Guardar campaña', reset: 'Reiniciar',
        },
        perfil: { title: 'Tu campo', sub: 'Todo lo que sabemos de tu operación.',
            tabPersonal: 'Información personal', tabOperation: 'Mi operación', tabPrefs: 'Preferencias', tabPlans: 'Planes',
            hLabel: '¿Cuántas hectáreas trabajás?', cultivosLabel: 'Cultivos que trabajás', tipoLabel: 'Tipo de productor', maqLabel: 'Maquinaria', campoLabel: 'Tenencia del campo',
            roleProductor: 'Productor', roleContratista: 'Contratista', roleArrendatario: 'Arrendatario', roleMixto: 'Mixto',
            maqPropia: 'Tengo propia', maqAlquilada: 'Alquilo siempre', maqMixta: 'Mezclo las dos', maqOfrezco: 'Ofrezco servicios',
            campoPropio: 'Campo propio', campoAlquilado: 'Campo alquilado', campoMixto: 'Mixto (propio + alquilado)', campoAparceria: 'Aparcería',
            saveBtn: 'Guardar preferencias',
            opHa: 'Hectáreas', opCultivos: 'Cultivos', opTipo: 'Tipo', opMaq: 'Maquinaria', opCampo: 'Campo', opMoneda: 'Moneda',
            nameLabel: 'Nombre', surnameLabel: 'Apellido', emailLabel: 'Email', telLabel: 'Teléfono / WhatsApp', ubicLabel: 'Ubicación', empresaLabel: 'Empresa', photoLabel: 'Foto de perfil', photoOpt: '(opcional)', savePersonal: 'Guardar información personal',
        },
        prefs: { title: 'Preferencias de uso', lang: 'Idioma', unit: 'Unidad de grano', moneda: 'Moneda', tema: 'Tema visual', alertas: 'Alertas de precio',
            unitQq: 'Quintales (qq)', unitKg: 'Kilos (kg)', monUSD: 'Dólares (USD)', monARS: 'Pesos (ARS)', temaLight: 'Claro', temaDark: 'Oscuro',
            tcLabel: 'Tipo de cambio (ARS/USD)',
        },
        campanas: { title: 'Campañas anteriores', sub: 'Todos tus cálculos guardados. Compará campañas y entendé cómo evolucionás.',
            colCultivo: 'Cultivo', colHa: 'Hectáreas', colIngreso: 'Ingreso', colGasto: 'Gasto total', colGanancia: 'Ganancia', colMargen: 'Margen', colVsAnt: 'vs anterior', colFecha: 'Fecha',
            recalc: 'Recalcular',
        },
        ofertas: { title: 'Ofertas publicadas', sub: 'Tu maquinaria publicada en NexuDrive. Gestioná disponibilidad y consultas.',
            edit: 'Editar', pause: 'Pausar', resume: 'Despausar', delete: 'Eliminar', active: 'Activa', paused: 'Pausada', newBtn: 'Nueva publicación',
            colEquipo: 'Equipo', colPrecio: 'Precio', colEstado: 'Estado', colConsultas: 'Consultas', colFecha: 'Fecha', colAcciones: 'Acciones',
        },
        publish: { title: 'Publicar en NexuDrive', sub: 'Completá los datos y publicá tu equipo gratis.',
            catLabel: 'Categoría', tipoLabel: '¿Qué ofrecés?', titleLabel: 'Título del anuncio', precioLabel: 'Precio', yearLabel: 'Año del equipo', provLabel: 'Provincia', radioLabel: 'Radio de trabajo', descLabel: 'Descripción',
            optSoloMaq: 'Solo equipo', optMaqOp: 'Equipo + operario', optServComp: 'Servicio completo', optAmbas: 'Ambas opciones',
            previewTitle: 'Vista previa', publishBtn: 'Publicar en NexuDrive', draftBtn: 'Guardar borrador',
        },
        home: { welcome: 'Bienvenido de vuelta', sub: 'Tu operación conectada. Tus decisiones, más inteligentes.', lastCalc: 'Último cálculo', viewCalc: 'Ver calculadora', nexudriveTitle: 'NexuDrive cerca tuyo', viewNexu: 'Ver maquinaria', alertTitle: 'Alertas económicas' },
        favoritos: { title: 'Mis favoritos', sub: 'Maquinaria y servicios que guardaste para comparar.', empty: 'No tenés favoritos todavía. Explorá NexuDrive y guardá las que te interesan.', explore: 'Explorar NexuDrive' },
        reservas: { title: 'Reservas', sub: 'Tus solicitudes de maquinaria en NexuDrive. Estado de alquileres y coordinación.',
            ctaBtn: 'Buscar maquinaria', lblActivas: 'Reservas activas', subActivas: 'Este mes', lblPendientes: 'Pendientes', subPendientes: 'Sin confirmar', lblTotal: 'Total pagado', subPagado: 'Reservas protegidas',
            listTitle: 'Mis reservas', chipActiva: 'Activas', chipTodas: 'Todas',
            emptyTitle: 'Todavía no tenés reservas', emptySub: 'Cuando reserves una máquina en NexuDrive, aparece acá con el estado y los datos de coordinación.', emptyCta: 'Explorar maquinaria',
            calTitle: 'Próximos trabajos', calEmpty: 'No hay trabajos agendados próximamente.',
            thEquipo: 'Equipo', thServicio: 'Servicio', thHa: 'Hectáreas', thReserva: 'Reserva', thEstado: 'Estado', thFecha: 'Fecha', thAcciones: 'Acciones',
            statusActive: 'Activa', statusPending: 'Pendiente', statusDone: 'Completada', statusCancelled: 'Cancelada',
            coordBtn: 'Coordinar', detailBtn: 'Ver detalle',
        },
        map: { title: 'Mapa en vivo', cercana: 'Maquinaria cercana', enlote: 'En el lote', tracking: 'Tracking' },
        insight: { losing: '⚠ ESTÁS PERDIENDO PLATA', maqHigh: '🔴 TU MAQUINARIA CUESTA DEMASIADO', agroHigh: '🟠 LA PULVERIZACIÓN ESTÁ CONSUMIENDO MARGEN', ok: '✓ VAS BIEN',
            losingText: 'Con estos números, perdés {0} por hectárea. Revisá tus gastos o evaluá alquilar maquinaria más barata.',
            maqText: 'La maquinaria representa el {0}% de tus gastos. Alquilar podría hacerte ahorrar dinero — mirá NexuDrive.',
            agroText: 'El costo de agroquímicos y aplicación representa {0}% de tus gastos.',
            okText: 'Estás ganando {0} por hectárea. Margen del {1}%. Tu campaña es rentable.',
            seeDrones: '🚁 Ver drones disponibles',
        },
        confirm: { deleteTitle: '¿Eliminar esta oferta?', deleteBody: 'Esta acción no se puede deshacer. La oferta dejará de aparecer en NexuDrive.', cancel: 'Cancelar', confirm: 'Sí, eliminar' },
        detail: { dist: 'Distancia', avail: 'Disponibilidad', zone: 'Zona', brand: 'Marca', year: 'Año', power: 'Potencia', cat: 'Categoría', mode: 'Modalidad', contact: 'Contactar por WhatsApp', saveFav: 'Guardar en favoritos', inFavs: 'En favoritos' },
        toasts: { welcome: 'Bienvenido de vuelta 👋', logout: 'Sesión cerrada correctamente', favAdded: '💚 Guardado en favoritos', favRemoved: 'Quitado de favoritos', calcSaved: 'Cálculo guardado ✓', langChanged: 'Idioma: Español 🇦🇷', ofertaEdited: 'Oferta actualizada ✓', ofertaDeleted: 'Oferta eliminada', ofertaPaused: 'Oferta pausada', ofertaReactivated: 'Oferta reactivada ✓' },
    },
    en: {
        appName: 'Agronex',
        nav: { home: 'Home', calc: 'Calculator', market: 'Find Machinery', publicar: 'List Equipment', favoritos: 'My Favorites', campanas: 'Past Seasons', ofertas: 'My Listings', perfil: 'My Profile', reservas: 'Bookings' },
        greeting: { morning: 'Good morning', afternoon: 'Good afternoon', evening: 'Good evening' },
        market: { title: 'NexuDrive', sub: 'Find nearby machinery and rural services when you need them.', selectHint: 'Select an option to see details and estimated savings.', publishTitle: 'Have equipment available?', publishDesc: 'List your machinery or service on NexuDrive and receive inquiries from producers in your area.', publishBtn: 'List my equipment' },
        calc: { title: 'Farm Calculator', sub: 'Enter your season data and calculate profitability in seconds.', save: 'Save calculation', clear: 'Clear',
            cultivoLabel: 'Crop', haLabel: 'Hectares', precioLabel: 'Selling price', rendLabel: 'Expected yield',
            costSection: 'Direct costs', indirectSection: 'Indirect costs',
            semLabel: 'Seeds', fertLabel: 'Fertilizers', agroLabel: 'Agrochemicals', combLabel: 'Fuel', maqLabel: 'Machinery', moLabel: 'Labor', alqLabel: 'Land lease',
            comLabel: 'Marketing', segLabel: 'Insurance', impLabel: 'Admin / taxes',
            resultTitle: 'Your result', ingresoLabel: 'Gross income', costoLabel: 'Total cost', gananciaLabel: 'Profit', margenLabel: 'Margin', ganHaLabel: 'Profit per hectare', peLabel: 'Break-even price',
            modeSimple: 'Combined', modeLotes: 'By plot/crop', addLote: 'Add plot',
            simTitle: 'Simulator', simAlquilar: 'Rent', simComprar: 'Own machinery',
            saving: 'Save season', reset: 'Reset',
        },
        perfil: { title: 'My Farm', sub: 'Everything we know about your operation.',
            tabPersonal: 'Personal info', tabOperation: 'My Operation', tabPrefs: 'Preferences', tabPlans: 'Plans',
            hLabel: 'How many hectares do you farm?', cultivosLabel: 'Crops you grow', tipoLabel: 'Producer type', maqLabel: 'Machinery', campoLabel: 'Land tenure',
            roleProductor: 'Producer', roleContratista: 'Contractor', roleArrendatario: 'Tenant', roleMixto: 'Mixed',
            maqPropia: 'I own machinery', maqAlquilada: 'I always rent', maqMixta: 'Mix of both', maqOfrezco: 'I offer services',
            campoPropio: 'Own land', campoAlquilado: 'Rented land', campoMixto: 'Mixed (own + rented)', campoAparceria: 'Sharecropping',
            saveBtn: 'Save preferences',
            opHa: 'Hectares', opCultivos: 'Crops', opTipo: 'Type', opMaq: 'Machinery', opCampo: 'Land', opMoneda: 'Currency',
            nameLabel: 'First name', surnameLabel: 'Last name', emailLabel: 'Email', telLabel: 'Phone / WhatsApp', ubicLabel: 'Location', empresaLabel: 'Company', photoLabel: 'Profile photo', photoOpt: '(optional)', savePersonal: 'Save personal info',
        },
        prefs: { title: 'Preferences', lang: 'Language', unit: 'Grain unit', moneda: 'Currency', tema: 'Visual theme', alertas: 'Price alerts',
            unitQq: 'Quintals (qq)', unitKg: 'Kilograms (kg)', monUSD: 'Dollars (USD)', monARS: 'Pesos (ARS)', temaLight: 'Light', temaDark: 'Dark',
            tcLabel: 'Exchange rate (ARS/USD)',
        },
        campanas: { title: 'Past Seasons', sub: 'All your saved calculations. Compare seasons and track your progress.',
            colCultivo: 'Crop', colHa: 'Hectares', colIngreso: 'Income', colGasto: 'Total cost', colGanancia: 'Profit', colMargen: 'Margin', colVsAnt: 'vs previous', colFecha: 'Date',
            recalc: 'Recalculate',
        },
        ofertas: { title: 'My Listings', sub: 'Your machinery listed on NexuDrive. Manage availability and inquiries.',
            edit: 'Edit', pause: 'Pause', resume: 'Unpause', delete: 'Delete', active: 'Active', paused: 'Paused', newBtn: 'New listing',
            colEquipo: 'Equipment', colPrecio: 'Price', colEstado: 'Status', colConsultas: 'Inquiries', colFecha: 'Date', colAcciones: 'Actions',
        },
        publish: { title: 'List on NexuDrive', sub: 'Fill in the details and list your equipment for free.',
            catLabel: 'Category', tipoLabel: 'What do you offer?', titleLabel: 'Ad title', precioLabel: 'Price', yearLabel: 'Equipment year', provLabel: 'Province', radioLabel: 'Work radius', descLabel: 'Description',
            optSoloMaq: 'Equipment only', optMaqOp: 'Equipment + operator', optServComp: 'Full service', optAmbas: 'Both options',
            previewTitle: 'Preview', publishBtn: 'List on NexuDrive', draftBtn: 'Save draft',
        },
        home: { welcome: 'Welcome back', sub: 'Your farm, your numbers, your decisions.', lastCalc: 'Last calculation', viewCalc: 'Open calculator', nexudriveTitle: 'NexuDrive nearby', viewNexu: 'View machinery', alertTitle: 'Economic alerts' },
        favoritos: { title: 'My Favorites', sub: 'Machinery and services you saved to compare.', empty: "You don't have any favorites yet. Explore NexuDrive and save the ones you like.", explore: 'Explore NexuDrive' },
        reservas: { title: 'Bookings', sub: 'Your machinery requests on NexuDrive. Rental status and coordination.',
            ctaBtn: 'Find machinery', lblActivas: 'Active bookings', subActivas: 'This month', lblPendientes: 'Pending', subPendientes: 'Unconfirmed', lblTotal: 'Total paid', subPagado: 'Protected bookings',
            listTitle: 'My bookings', chipActiva: 'Active', chipTodas: 'All',
            emptyTitle: "You don't have any bookings yet", emptySub: 'When you book a machine on NexuDrive, it will appear here with status and coordination details.', emptyCta: 'Explore machinery',
            calTitle: 'Upcoming jobs', calEmpty: 'No upcoming jobs scheduled.',
            thEquipo: 'Equipment', thServicio: 'Service', thHa: 'Hectares', thReserva: 'Deposit', thEstado: 'Status', thFecha: 'Date', thAcciones: 'Actions',
            statusActive: 'Active', statusPending: 'Pending', statusDone: 'Completed', statusCancelled: 'Cancelled',
            coordBtn: 'Coordinate', detailBtn: 'View details',
        },
        map: { title: 'Live map', cercana: 'Nearby machinery', enlote: 'On the plot', tracking: 'Tracking' },
        insight: { losing: '⚠ YOU ARE LOSING MONEY', maqHigh: '🔴 YOUR MACHINERY COSTS TOO MUCH', agroHigh: '🟠 SPRAYING IS CONSUMING YOUR MARGIN', ok: '✓ LOOKING GOOD',
            losingText: "With these numbers, you're losing {0} per hectare. Review your costs or consider renting cheaper machinery.",
            maqText: 'Machinery represents {0}% of your costs. Renting could save you money — check NexuDrive.',
            agroText: 'Agrochemical and application cost represents {0}% of your expenses.',
            okText: "You're earning {0} per hectare. {1}% margin. Your season is profitable.",
            seeDrones: '🚁 View available drones',
        },
        confirm: { deleteTitle: 'Delete this listing?', deleteBody: 'This action cannot be undone. The listing will be removed from NexuDrive.', cancel: 'Cancel', confirm: 'Yes, delete' },
        detail: { dist: 'Distance', avail: 'Availability', zone: 'Zone', brand: 'Brand', year: 'Year', power: 'Power', cat: 'Category', mode: 'Service type', contact: 'Contact via WhatsApp', saveFav: 'Save to favorites', inFavs: 'In favorites' },
        toasts: { welcome: 'Welcome back 👋', logout: 'Signed out successfully', favAdded: '💚 Saved to favorites', favRemoved: 'Removed from favorites', calcSaved: 'Calculation saved ✓', langChanged: 'Language: English 🇺🇸', ofertaEdited: 'Listing updated ✓', ofertaDeleted: 'Listing deleted', ofertaPaused: 'Listing paused', ofertaReactivated: 'Listing reactivated ✓' },
    }
};
let currentLang = localStorage.getItem('agronex_lang') || 'es';
function t(path) {
    const keys = path.split('.');
    let obj = LANG[currentLang];
    for (const k of keys) {
        obj = obj === null || obj === void 0 ? void 0 : obj[k];
    }
    return obj !== null && obj !== void 0 ? obj : path;
}
function setAppLang(lang, el) {
    currentLang = lang;
    localStorage.setItem('agronex_lang', lang);
    // Update toggle buttons
    document.querySelectorAll('[id^="pref-lang-"]').forEach(b => b.classList.remove('active'));
    const btn = document.getElementById('pref-lang-' + lang);
    if (btn)
        btn.classList.add('active');
    applyLang();
    showToast(t('toasts.langChanged'), 'success');
}
function applyLang() {
    // Nav items (update text nodes, preserve icons)
    const navMap = {
        'nav-home': 'nav.home', 'nav-calc': 'nav.calc', 'nav-market': 'nav.market',
        'nav-publicar': 'nav.publicar', 'nav-favoritos': 'nav.favoritos', 'nav-campanas': 'nav.campanas',
        'nav-ofertas': 'nav.ofertas', 'nav-perfil': 'nav.perfil', 'nav-reservas': 'nav.reservas'
    };
    Object.entries(navMap).forEach(([id, key]) => {
        const el = document.getElementById(id);
        if (!el)
            return;
        el.childNodes.forEach(n => { if (n.nodeType === 3 && n.textContent.trim())
            n.textContent = ' ' + t(key); });
    });
    // Reservas screen texts
    const rMap = {
        'reservas-page-title': 'reservas.title', 'reservas-page-sub': 'reservas.sub',
        'reservas-cta-btn': 'reservas.ctaBtn',
        'res-lbl-activas': 'reservas.lblActivas', 'res-sub-activas': 'reservas.subActivas',
        'res-lbl-pendientes': 'reservas.lblPendientes', 'res-sub-pendientes': 'reservas.subPendientes',
        'res-lbl-total': 'reservas.lblTotal', 'res-sub-pagado': 'reservas.subPagado',
        'res-list-title': 'reservas.listTitle',
        'res-chip-activa': 'reservas.chipActiva', 'res-chip-todas': 'reservas.chipTodas',
        'res-empty-title': 'reservas.emptyTitle', 'res-empty-sub': 'reservas.emptySub', 'res-empty-cta': 'reservas.emptyCta',
        'res-cal-title': 'reservas.calTitle', 'res-cal-empty-text': 'reservas.calEmpty',
        'res-th-equipo': 'reservas.thEquipo', 'res-th-servicio': 'reservas.thServicio', 'res-th-ha': 'reservas.thHa',
        'res-th-reserva': 'reservas.thReserva', 'res-th-estado': 'reservas.thEstado',
        'res-th-fecha': 'reservas.thFecha', 'res-th-acciones': 'reservas.thAcciones',
    };
    Object.entries(rMap).forEach(([id, key]) => {
        const el = document.getElementById(id);
        if (el)
            el.textContent = t(key);
    });
    // Page headers
    const pMap = {
        'screen-market': ['market.title', 'market.sub'],
        'screen-calc': ['calc.title', 'calc.sub'],
        'screen-perfil': ['perfil.title', 'perfil.sub'],
    };
    Object.entries(pMap).forEach(([sid, [tk, sk]]) => {
        const sc = document.getElementById(sid);
        if (!sc)
            return;
        const tEl = sc.querySelector('.page-title');
        const sEl = sc.querySelector('.page-sub');
        if (tEl)
            tEl.textContent = t(tk);
        if (sEl)
            sEl.textContent = t(sk);
    });
    // Market detail empty
    const mde = document.querySelector('.market-detail-empty p');
    if (mde)
        mde.textContent = t('market.selectHint');
    // Publish card
    const mpt = document.querySelector('.market-publish-title');
    const mpd = document.querySelector('.market-publish-desc');
    if (mpt)
        mpt.textContent = t('market.publishTitle');
    if (mpd)
        mpd.textContent = t('market.publishDesc');
    // Greeting
    const h = new Date().getHours();
    const grKey = h < 12 ? 'greeting.morning' : h < 18 ? 'greeting.afternoon' : 'greeting.evening';
    const nombre = UserStore.get('nombre') || 'Carlos';
    const gEl = document.querySelector('.home-greeting-text');
    if (gEl)
        gEl.innerHTML = `${t(grKey)}, <span>${nombre}.</span>`;
    // Re-render dynamic content
    renderOfertas();
    renderMarket();
    renderFavoritos();
    renderReservas();
}
// ======================================================
// FIX 3 — QQ ↔ KG fully respected in insights/PE
// (the syncUnitLabels already handles input conversion;
//  this ensures renderInsight also uses display units)
// ======================================================
// Patch renderInsight to use display unit for PE in messages
const _origRenderInsight = typeof renderInsight === 'function' ? renderInsight : null;
function renderInsightWithUnit(v) {
    const block = document.getElementById('r-insight');
    if (!block)
        return;
    block.innerHTML = '';
    block.style.display = 'none';
}
// ======================================================
// FIX 8/9/10 — EDITAR / ELIMINAR / PAUSAR OFERTAS
// ======================================================
// ======================================================

// ---- original java.js lines 5440-6402 ----
let ofertasData = [
    { id: 1, titulo: 'Cosechadora Case 8250', precio: 'USD 120/ha', estado: 'activa', consultas: 3, reservas: 0, vistas: 0, ingresos: 0, fecha: 'Hace 2 días', tipo: 'Solo maquinaria', desc: 'Modelo 2020, pocas horas. Plataforma maicera y sojera.' },
    { id: 2, titulo: 'Sembradora JD 1113', precio: 'USD 85/ha', estado: 'pausada', consultas: 7, reservas: 0, vistas: 0, ingresos: 0, fecha: 'Hace 3 semanas', tipo: 'Maquinaria + operario', desc: 'Bien mantenida. Disco y cuchilla cortadora.' },
];
try {
    const savedOfertas = JSON.parse(localStorage.getItem('agronex_ofertas') || '[]');
    if (Array.isArray(savedOfertas) && savedOfertas.length) {
        ofertasData = savedOfertas;
    }
}
catch (e) { console.warn("[Agronex]", e); }
window.ofertasData = ofertasData;
function saveOfertasData() {
    try {
        localStorage.setItem('agronex_ofertas', JSON.stringify(ofertasData));
    }
    catch (e) { console.warn("[Agronex]", e); }
    window.ofertasData = ofertasData;
}
function addOfertaFromPublication(data) {
    const nextId = Math.max(0, ...ofertasData.map(o => Number(o.id) || 0)) + 1;
    ofertasData.unshift({
        id: nextId,
        titulo: data.titulo || 'Mi equipo',
        precio: data.precio || 'A consultar',
        estado: 'activa',
        consultas: 0,
        reservas: 0,
        vistas: 0,
        ingresos: 0,
        fecha: 'Recien publicada',
        tipo: data.tipo || 'Publicacion',
        desc: data.desc || '',
        sourceMode: data.sourceMode || 'rent',
        sourceId: data.sourceId || data.marketId || null,
        photoUrls: (data.photoUrls || []).slice(0, 6),
    });
    saveOfertasData();
    renderOfertas();
}
let ofertaToDelete = null;
let ofertaEditing = null;
function renderOfertas() {
    const tbody = document.getElementById('ofertas-tbody');
    if (!tbody) {
        if (typeof renderOfertasDashboard === 'function')
            renderOfertasDashboard();
        return;
    }
    const ol = t('ofertas');
    tbody.innerHTML = ofertasData.map(o => {
        const activa = o.estado === 'activa';
        const chipClass = activa ? 'chip-green' : 'chip-amber';
        const estadoLabel = activa ? ol.active : ol.paused;
        const toggleIcon = activa ? 'fa-pause' : 'fa-play';
        const toggleFn = activa ? `pauseOferta(${o.id})` : `reactivarOferta(${o.id})`;
        const toggleTitle = activa ? ol.pause : ol.resume;
        return `<tr>
      <td><strong>${o.titulo}</strong><div style="font-size:11px;color:var(--text-muted);margin-top:3px;">${o.tipo || 'Publicacion'}</div></td>
      <td>${o.precio}</td>
      <td><span class="chip ${chipClass}">${estadoLabel}</span></td>
      <td><strong>${o.consultas}</strong></td>
      <td>${o.fecha}</td>
      <td><div style="display:flex;gap:4px;align-items:center;">
        <button class="btn btn-ghost btn-xs" onclick="editOferta(${o.id})" title="${ol.edit}"><i class="fas fa-edit"></i></button>
        <button class="btn btn-ghost btn-xs" onclick="${toggleFn}" title="${toggleTitle}"><i class="fas ${toggleIcon}"></i></button>
        <button class="btn btn-ghost btn-xs" onclick="askDeleteOferta(${o.id})" title="${ol.delete}" style="color:var(--red-400);"><i class="fas fa-trash"></i></button>
      </div></td>
    </tr>`;
    }).join('');
}
function editOferta(id) {
    const o = ofertasData.find(x => x.id === id);
    if (!o)
        return;
    ofertaEditing = id;
    const el = id => document.getElementById(id);
    if (el('edit-titulo'))
        el('edit-titulo').value = o.titulo;
    if (el('edit-precio'))
        el('edit-precio').value = parseFloat(o.precio) || '';
    if (el('edit-tipo'))
        el('edit-tipo').value = o.tipo;
    if (el('edit-desc'))
        el('edit-desc').value = o.desc;
    document.getElementById('edit-oferta-modal').style.display = 'flex';
}
function saveEditOferta() {
    if (!ofertaEditing)
        return;
    const o = ofertasData.find(x => x.id === ofertaEditing);
    if (!o)
        return;
    const g = id => { var _a; return (_a = document.getElementById(id)) === null || _a === void 0 ? void 0 : _a.value; };
    o.titulo = g('edit-titulo') || o.titulo;
    const pVal = g('edit-precio');
    if (pVal)
        o.precio = `USD ${pVal}/ha`;
    o.tipo = g('edit-tipo') || o.tipo;
    o.desc = g('edit-desc') || o.desc;
    saveOfertasData();
    renderOfertas();
    closeEditOfertaModal();
    showToast(t('toasts.ofertaEdited'), 'success');
    ofertaEditing = null;
}
function closeEditOfertaModal(e) {
    if (!e || e.target.id === 'edit-oferta-modal') {
        document.getElementById('edit-oferta-modal').style.display = 'none';
    }
}
function askDeleteOferta(id) {
    ofertaToDelete = id;
    document.getElementById('confirm-modal').style.display = 'flex';
}
function closeConfirmModal(e) {
    if (!e || e.target.id === 'confirm-modal') {
        document.getElementById('confirm-modal').style.display = 'none';
        ofertaToDelete = null;
    }
}
function confirmDeleteOferta() {
    if (!ofertaToDelete)
        return;
    const deletedId = ofertaToDelete;
    const hadActiveBookings = Object.values(nexuDriveBookings || {}).some(b => {
        const sameOffer = Number(b.machineId) === Number(deletedId) || Number(b.offerId) === Number(deletedId);
        return sameOffer && b.status !== 'finalizado' && b.status !== 'done' && b.status !== 'cancelled';
    });
    ofertasData = ofertasData.filter(o => o.id !== ofertaToDelete);
    saveOfertasData();
    renderOfertas();
    renderMarket();
    updateReservasBadge();
    closeConfirmModal();
    showToast(hadActiveBookings ? `${t('toasts.ofertaDeleted')} Tenías reservas activas en esta oferta. Revisá la sección Reservas.` : t('toasts.ofertaDeleted'), 'error');
    ofertaToDelete = null;
}
function pauseOferta(id) {
    openPauseReasonModal(id);
}
function reactivarOferta(id) {
    const o = ofertasData.find(x => x.id === id);
    if (!o)
        return;
    o.estado = 'activa';
    saveOfertasData();
    renderOfertas();
    showToast('Oferta reactivada.', 'success');
}
function getOfertaSolicitudesStatus(oferta) {
    const consultas = Number((oferta && oferta.consultas) || 0);
    const reservas = Number((oferta && oferta.reservas) || 0);
    if (oferta && oferta.estado === 'vendida')
        return 'vendida';
    if (consultas === 0 && reservas === 0)
        return 'sin_solicitudes';
    if (consultas > 0 && reservas === 0)
        return 'con_consultas';
    return 'con_reservas';
}
/* ================================================================
   BLOQUE 2 — MOBILE LAYER
================================================================ */
/* ====================================================
   MOBILE-FIRST LAYER
==================================================== */
function ofMoney(n) {
    return 'USD ' + Math.round(n || 0).toLocaleString('es-AR');
}
function ofPrice(o) {
    const m = String((o && o.precio) || '').replace(/\./g, '').replace(/,/g, '.').match(/\d+(?:\.\d+)?/);
    return m ? Number(m[0]) : 65;
}
function ofIcon(o) {
    const text = String((o && (o.titulo || o.tipo || o.sourceMode)) || '').toLowerCase();
    if (text.includes('pulver'))
        return '💦';
    if (text.includes('sembr'))
        return '🚜🌱';
    if (text.includes('cosech'))
        return '🚜🌾';
    if (text.includes('dron'))
        return '🚁';
    if (text.includes('cam'))
        return '🚛';
    if (text.includes('acopl'))
        return '🚚';
    return o.sourceMode === 'sell' ? '🏷️' : '🚜';
}
function ofCat(o) {
    const text = String((o && (o.titulo || o.tipo)) || '').toLowerCase();
    if (text.includes('pulver'))
        return 'Pulverizadoras';
    if (text.includes('sembr'))
        return 'Sembradoras';
    if (text.includes('cosech'))
        return 'Cosechadoras';
    if (text.includes('dron'))
        return 'Drones';
    if (text.includes('cam'))
        return 'Camiones';
    if (text.includes('acopl'))
        return 'Acoplados';
    return 'Tractores';
}
function isSaleOferta(o) {
    const text = String((o && `${o.sourceMode || ''} ${o.tipo || ''} ${o.precio || ''}`) || '').toLowerCase();
    return text.includes('sell') || text.includes('both') || text.includes('venta') || text.includes('alquiler + venta');
}
function ofertaIsSold(o) {
    const estado = String((o === null || o === void 0 ? void 0 : o.estado) || '').toLowerCase();
    return estado === 'vendida' || estado === 'sold';
}
function ofMetrics() {
    const items = (ofertasData || []).map((o, i) => {
        const consultas = Number(o.consultas || 0) + (i + 1) * 6;
        const reservas = Math.max(1, Math.round(consultas * (0.28 + (i % 3) * 0.06)));
        const ingresos = Number(o.ingresos || Math.round(ofPrice(o) * reservas * (o.sourceMode === 'sell' ? 1 : 115)));
        return Object.assign({}, o, {
            consultas,
            reservas,
            ingresos,
            vistas: Number(o.vistas || consultas * (9 + i * 2) + 120),
            horas: reservas * (7 + (i % 4) * 2),
            activa: o.estado === 'activa',
            vendida: ofertaIsSold(o),
            icon: ofIcon(o),
            categoria: ofCat(o)
        });
    });
    const totalIngresos = items.reduce((s, o) => s + o.ingresos, 0);
    const totalReservas = items.reduce((s, o) => s + o.reservas, 0);
    const totalConsultas = items.reduce((s, o) => s + o.consultas, 0);
    const activas = items.filter(o => o.activa).length;
    return {
        items,
        totalIngresos,
        totalReservas,
        totalConsultas,
        activas,
        pausadas: items.length - activas,
        completadas: Math.round(totalReservas * 0.62),
        canceladas: Math.round(totalReservas * 0.08)
    };
}
function verEstadisticasOferta(id) {
    const item = ofMetrics().items.find(o => o.id === id);
    if (item)
        showToast(`${item.titulo}: ${ofMoney(item.ingresos)} · ${item.reservas} reservas · ${item.consultas} consultas`, 'success');
}
let providerOpsState = (() => {
    try {
        return JSON.parse(localStorage.getItem('agronex_provider_ops') || '{}') || {};
    }
    catch (e) {
        console.warn("[Agronex]", e);
        return {};
    }
})();
function saveProviderOpsState() {
    localStorage.setItem('agronex_provider_ops', JSON.stringify(providerOpsState));
}
function providerBookingsForOffers(items) {
    const offerNames = items.map(o => String(o.titulo || '').toLowerCase());
    let bookings = Object.values(nexuDriveBookings || {}).filter(Boolean).filter(b => {
        const name = String(b.machineName || b.machineTitle || b.title || '').toLowerCase();
        return offerNames.some(of => of && (name.includes(of) || of.includes(name)));
    });
    if (!bookings.length) {
        bookings = items.slice(0, 3).map((o, i) => ({
            id: `OP-${o.id}`,
            machineId: o.id,
            machineName: o.titulo,
            machineTitle: o.titulo,
            service: o.tipo || 'Maquinaria + operario',
            clientName: ['Juan Pérez', 'María Alonso', 'Roberto Salvatierra'][i % 3],
            clientLocation: ['Pergamino', 'Rojas', 'Colón'][i % 3],
            clientVerified: true,
            clientHistory: `${2 + i} trabajos previos`,
            fecha: i === 0 ? new Date().toISOString().slice(0, 10) : `2026-06-${String(12 + i).padStart(2, '0')}`,
            lote: ['Lote Norte', 'Campo La Emilia', 'Sector B'][i % 3],
            hectares: 90 + i * 35,
            priceHa: ofPrice(o),
            status: providerOpsState[o.id] || (i === 0 ? 'preparando_salida' : i === 1 ? 'trabajando' : 'reservado'),
            createdAt: new Date(Date.now() - (i + 1) * 86400000).toISOString(),
            providerHistory: []
        }));
    }
    return bookings;
}
function providerBookingFinancials(b) {
    const priceHa = Number(b.priceHa || b.pricePerHa || ofPrice({ precio: b.price || b.precio }));
    const hectares = Number(b.hectares || 0);
    const total = Number(b.total || Math.round(priceHa * hectares));
    const commission = Math.round(total * 0.05);
    return { priceHa, hectares, total, commission, net: total - commission };
}
function providerBookingHistory(b) {
    const created = b.createdAt ? new Date(b.createdAt) : new Date();
    const currentIdx = trackingStepIndex(b.status || 'reservado');
    const auto = TRACKING_STEPS.slice(0, currentIdx + 1).map((step, i) => ({
        label: step.label,
        time: new Date(created.getTime() + i * 90 * 60000).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
    }));
    return [...auto, ...((b.providerHistory || []).map(h => ({ label: h.label, time: h.time })))];
}
function advanceProviderBookingStatus(machineId) {
    const key = bookingKey(machineId);
    let b = nexuDriveBookings[key];
    if (!b)
        b = Object.values(nexuDriveBookings || {}).find(x => (x.machineId || x.id) === machineId);
    if (!b)
        b = providerBookingsForOffers(ofMetrics().items).find(x => Number(x.machineId || x.id) === Number(machineId));
    if (!b)
        return;
    const order = ['reservado', 'preparando_salida', 'en_camino', 'llegando', 'trabajando', 'finalizado'];
    const current = Math.max(0, order.indexOf(String(b.status || 'reservado').replace(' ', '_')));
    const next = order[Math.min(current + 1, order.length - 1)];
    b.status = next;
    const [, label] = trackingStatusLabel(next);
    b.providerHistory = b.providerHistory || [];
    b.providerHistory.push({ status: next, label, time: new Date().toLocaleString('es-AR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) });
    if (nexuDriveBookings[key]) {
        nexuDriveBookings[key] = b;
        saveBookings();
    }
    else {
        providerOpsState[machineId] = next;
        saveProviderOpsState();
    }
    renderOfertas();
    const modal = document.getElementById('provider-op-modal');
    if (modal && modal.style.display !== 'none') {
        openProviderOfertaModal(machineId);
    }
    showToast(`Estado actualizado: ${label}`, 'success');
}
function buildProviderBookingCard(b) {
    const machineId = b.machineId || b.id;
    const status = b.status || 'reservado';
    const [chipCls, chipLabel] = trackingStatusLabel(status);
    const progress = trackingProgress(status);
    const fin = providerBookingFinancials(b);
    const history = providerBookingHistory(b);
    const finalDone = trackingStepIndex(status) >= TRACKING_STEPS.length - 1;
    return `<div class="res-live-card provider-op-card ${['en_camino', 'en camino', 'llegando'].includes(status) ? 'res-card-transit' : ['trabajando'].includes(status) ? 'res-card-active' : ''}" id="provider-op-${machineId}">
      <div class="res-live-card-header">
        <div class="res-live-emoji">${catEmoji(b.machineName || b.machineTitle)}</div>
        <div class="res-live-info">
          <div class="res-live-title">${b.machineName || b.machineTitle || 'Equipo reservado'}</div>
          <div class="res-live-meta">${b.clientName || 'Productor'} · ${b.clientLocation || b.lote || 'Zona a confirmar'}</div>
        </div>
        <span class="chip ${chipCls}" style="flex-shrink:0;">${chipLabel}</span>
      </div>
      <div class="res-progress-track"><div class="res-progress-fill" style="width:${progress}%;"></div></div>
      <div class="res-live-status-row"><span>Paso ${Math.min(trackingStepIndex(status) + 1, TRACKING_STEPS.length)} de ${TRACKING_STEPS.length}</span><strong>${TRACKING_STEPS[Math.min(trackingStepIndex(status), TRACKING_STEPS.length - 1)].label}</strong></div>
      <div class="res-live-grid">
        <div><div class="res-live-detail-lbl">Cliente</div><div class="res-live-detail-val">${b.clientName || 'Productor verificado'}</div></div>
        <div><div class="res-live-detail-lbl">Fecha</div><div class="res-live-detail-val">${b.fecha ? formatDateHuman(b.fecha) : 'A confirmar'}</div></div>
        <div><div class="res-live-detail-lbl">Ubicación</div><div class="res-live-detail-val">${b.clientLocation || b.lote || 'Zona cercana'}</div></div>
        <div><div class="res-live-detail-lbl">Hectáreas</div><div class="res-live-detail-val">${fin.hectares || '—'} ha</div></div>
      </div>
      <div class="provider-client-strip">
        <div><span>Productor</span><strong>${b.clientName || 'Cliente verificado'}</strong><small>${b.clientVerified === false ? 'Pendiente' : 'Verificado'} · ${b.clientHistory || 'Sin incidentes previos'}</small></div>
        <div><span>Ingreso estimado</span><strong>${ofMoney(fin.total)}</strong><small>${finalDone ? `Ingreso final: ${ofMoney(fin.net)}` : 'Final pendiente al cerrar trabajo'}</small></div>
      </div>
      <div class="provider-income-grid">
        <div><span>Precio</span><strong>USD ${fin.priceHa}/ha</strong></div>
        <div><span>Hectáreas</span><strong>${fin.hectares}</strong></div>
        <div><span>Total</span><strong>${ofMoney(fin.total)}</strong></div>
        <div><span>Comisión Agronex</span><strong>${ofMoney(fin.commission)}</strong></div>
        <div><span>Ganancia neta</span><strong>${ofMoney(fin.net)}</strong></div>
      </div>
      <div class="provider-timeline">${history.map((h, i) => `<div class="tracking-timeline-step ${i < history.length - 1 ? 'done-line' : ''}"><div class="tracking-step-dot ${i < history.length - 1 ? 'done' : 'active'}"><i class="fas ${i < history.length - 1 ? 'fa-check' : 'fa-circle'}"></i></div><div class="tracking-step-text"><div class="tracking-step-label ${i < history.length - 1 ? 'done' : 'active'}">${h.label}</div><div class="tracking-step-sub">${h.time}</div></div></div>`).join('')}</div>
      <div class="res-live-footer">
        <div class="res-live-price">${ofMoney(fin.net)}</div>
        <button class="btn btn-primary btn-xs" onclick="advanceProviderBookingStatus(${Number(machineId) || 0})" ${finalDone ? 'disabled' : ''}><i class="fas fa-arrows-rotate"></i> Cambiar estado</button>
      </div>
    </div>`;
}
function providerBookingForOffer(id) {
    return providerBookingsForOffers(ofMetrics().items).find(b => Number(b.machineId || b.id) === Number(id));
}
function providerBookingIsConfirmedToday(b) {
    if (!b)
        return false;
    const today = new Date().toISOString().slice(0, 10);
    const confirmedStatuses = new Set(['reservado', 'confirmed', 'confirmado', 'preparando_salida', 'en_camino', 'en camino', 'llegando', 'trabajando', 'active']);
    return (b.fecha || b.date) === today && confirmedStatuses.has(b.status || 'reservado');
}
function consultasForOferta(id) {
    const offer = ofMetrics().items.find(o => Number(o.id) === Number(id));
    if (!offer || !offer.consultas)
        return [];
    const names = ['Juan Pérez', 'Martín Acosta', 'Lucía Rojas', 'Santiago Vera', 'Carolina Molina'];
    const places = ['Pergamino', 'Rojas', 'Colón', 'Salto', 'Arrecifes'];
    const states = [['Nueva', 'chip-amber'], ['Respondida', 'chip-blue'], ['Convertida en reserva', 'chip-green']];
    const count = Math.min(Number(offer.consultas) || 0, 5);
    return Array.from({ length: count }, (_, i) => ({
        name: names[i % names.length],
        place: places[i % places.length],
        date: i === 0 ? 'Hoy' : `Hace ${i + 1} días`,
        status: states[i % states.length],
        offer: offer.titulo
    }));
}
function buyerForOferta(offer) {
    if (offer && offer.buyer)
        return offer.buyer;
    const buyers = [
        { name: 'Martín Acosta', location: 'Rojas, Buenos Aires', phone: '+54 9 2475 44-2190', email: 'martin.acosta@campo.com', verified: true, history: '3 compras verificadas', date: 'Hoy', payment: 'Seña coordinada' },
        { name: 'Lucía Rojas', location: 'Colón, Buenos Aires', phone: '+54 9 2473 61-8804', email: 'lucia.rojas@campo.com', verified: true, history: '5 operaciones en Agronex', date: 'Ayer', payment: 'Transferencia pactada' },
        { name: 'Santiago Vera', location: 'Pergamino, Buenos Aires', phone: '+54 9 2477 39-1248', email: 'santiago.vera@campo.com', verified: true, history: 'Productor verificado', date: 'Hace 2 días', payment: 'Pago pendiente de entrega' }
    ];
    const idx = Math.abs(Number((offer === null || offer === void 0 ? void 0 : offer.id) || 0)) % buyers.length;
    return buyers[idx];
}
function saleInterestsForOferta(id) {
    const rawOffer = (ofertasData || []).find(o => Number(o.id) === Number(id));
    const count = Math.min(Number((rawOffer === null || rawOffer === void 0 ? void 0 : rawOffer.consultas) || 0), 5);
    if (!count)
        return [];
    const offer = ofMetrics().items.find(o => Number(o.id) === Number(id));
    const names = ['Juan Pérez', 'Martín Acosta', 'Lucía Rojas', 'Santiago Vera', 'Carolina Molina'];
    const places = ['Pergamino', 'Rojas', 'Colón', 'Salto', 'Arrecifes'];
    const statuses = [['Interesado', 'chip-amber'], ['Pidió más datos', 'chip-blue'], ['Quiere comprar', 'chip-green']];
    return Array.from({ length: count }, (_, i) => ({
        name: names[i % names.length],
        place: places[i % places.length],
        date: i === 0 ? 'Hoy' : `Hace ${i + 1} días`,
        status: statuses[i % statuses.length],
        offer: (offer === null || offer === void 0 ? void 0 : offer.titulo) || 'Publicación',
        phone: ['+54 9 2475 44-2190', '+54 9 2473 61-8804', '+54 9 2477 39-1248'][i % 3],
        email: ['martin.acosta@campo.com', 'lucia.rojas@campo.com', 'santiago.vera@campo.com'][i % 3]
    }));
}
function buildSaleOfertaView(id) {
    const offer = ofMetrics().items.find(o => Number(o.id) === Number(id));
    const rawOffer = (ofertasData || []).find(o => Number(o.id) === Number(id)) || offer;
    if (!offer)
        return '';
    if (ofertaIsSold(rawOffer)) {
        const buyer = buyerForOferta(rawOffer);
        const amount = rawOffer.soldAmount || rawOffer.precio || offer.precio || 'A consultar';
        return `<div class="sale-oferta-view">
          <div class="sale-status-card sold">
            <div><span>Estado de venta</span><strong>Vendida</strong><small>${rawOffer.soldAt ? new Date(rawOffer.soldAt).toLocaleDateString('es-AR') : buyer.date}</small></div>
            <i class="fas fa-circle-check"></i>
          </div>
          <div class="sale-buyer-card">
            <div class="sale-buyer-head">
              <div><strong>${buyer.name}</strong><span>Compró: ${offer.titulo}</span></div>
              <span class="chip chip-green">${buyer.verified ? 'Cliente verificado' : 'Pendiente'}</span>
            </div>
            <div class="sale-buyer-grid">
              <div><span>Ubicación</span><strong>${buyer.location}</strong></div>
              <div><span>Teléfono</span><strong>${buyer.phone}</strong></div>
              <div><span>Email</span><strong>${buyer.email}</strong></div>
              <div><span>Historial</span><strong>${buyer.history}</strong></div>
              <div><span>Precio acordado</span><strong>${amount}</strong></div>
              <div><span>Pago</span><strong>${buyer.payment}</strong></div>
            </div>
          </div>
        </div>`;
    }
    const interests = saleInterestsForOferta(id);
    if (!interests.length) {
        return `<div class="provider-consultas-empty"><i class="fas fa-inbox"></i><strong>Todavía no hay interesados</strong><span>Cuando alguien pregunte o quiera comprar ${offer.titulo}, lo vas a ver acá.</span></div>`;
    }
    return `<div class="provider-consultas-view">
      <div class="provider-consultas-head"><div><strong>${offer.icon} ${offer.titulo}</strong><span>Esta publicación está en venta. Estos son los interesados recibidos.</span></div><span class="chip chip-green">${interests.length} interesados</span></div>
      <div class="provider-consultas-list">${interests.map((q, i) => `<div class="provider-consulta-card sale-interest-card"><div><strong>${q.name}</strong><span>${q.status[0]} por: ${q.offer}</span><small><i class="fas fa-map-pin"></i> ${q.place} · ${q.date}</small><small><i class="fas fa-phone"></i> ${q.phone} · ${q.email}</small></div><div class="sale-interest-actions"><span class="chip ${q.status[1]}">${q.status[0]}</span><button class="btn btn-primary btn-xs" onclick="markOfertaSold(${offer.id}, ${i})"><i class="fas fa-handshake"></i> Marcar vendida</button></div></div>`).join('')}</div>
    </div>`;
}
function buildOfertaConsultasView(id) {
    const offer = ofMetrics().items.find(o => Number(o.id) === Number(id));
    const consultas = consultasForOferta(id);
    if (!offer)
        return '';
    if (!consultas.length) {
        return `<div class="provider-consultas-empty"><i class="fas fa-inbox"></i><strong>No hay consultas para esta publicación</strong><span>Cuando alguien pregunte por ${offer.titulo}, lo vas a ver acá.</span></div>`;
    }
    return `<div class="provider-consultas-view">
      <div class="provider-consultas-head"><div><strong>${offer.icon} ${offer.titulo}</strong><span>No hay reserva confirmada para hoy. Estas son las consultas recibidas.</span></div><span class="chip chip-amber">${consultas.length} consultas</span></div>
      <div class="provider-consultas-list">${consultas.map(q => `<div class="provider-consulta-card"><div><strong>${q.name}</strong><span>Consultó por: ${q.offer}</span><small><i class="fas fa-map-pin"></i> ${q.place} · ${q.date}</small></div><span class="chip ${q.status[1]}">${q.status[0]}</span></div>`).join('')}</div>
    </div>`;
}
function openProviderOfertaModal(id) {
    const modal = document.getElementById('provider-op-modal');
    const body = document.getElementById('provider-op-modal-body');
    const sub = document.getElementById('provider-op-modal-sub');
    if (!modal || !body)
        return;
    const offer = ofMetrics().items.find(o => Number(o.id) === Number(id));
    if (isSaleOferta(offer)) {
        if (sub)
            sub.textContent = `${(offer === null || offer === void 0 ? void 0 : offer.titulo) || 'Publicación'} · ${ofertaIsSold(offer) ? 'Vendida' : 'Interesados'}`;
        body.innerHTML = buildSaleOfertaView(id);
        modal.style.display = 'flex';
        return;
    }
    const b = providerBookingForOffer(id);
    if (providerBookingIsConfirmedToday(b)) {
        if (sub)
            sub.textContent = `${b.machineName || b.machineTitle || 'Equipo'} · ${b.clientName || 'Productor verificado'}`;
        body.innerHTML = buildProviderBookingCard(b).replace('provider-op-card', 'provider-op-card provider-op-card-modal');
    }
    else {
        const offer = ofMetrics().items.find(o => Number(o.id) === Number(id));
        if (sub)
            sub.textContent = `${(offer === null || offer === void 0 ? void 0 : offer.titulo) || 'Publicación'} · Consultas`;
        body.innerHTML = buildOfertaConsultasView(id);
    }
    modal.style.display = 'flex';
}
function closeProviderOpModal(e) {
    if (!e || e.target.id === 'provider-op-modal') {
        const modal = document.getElementById('provider-op-modal');
        if (modal)
            modal.style.display = 'none';
    }
}
function focusProviderOferta(id) {
    openProviderOfertaModal(id);
}
function markOfertaSold(id, buyerIndex = 0) {
    const o = (ofertasData || []).find(x => Number(x.id) === Number(id));
    if (!o)
        return;
    const interests = saleInterestsForOferta(id);
    o.estado = 'vendida';
    o.soldAt = new Date().toISOString();
    o.buyer = interests[buyerIndex] ? {
        name: interests[buyerIndex].name,
        location: `${interests[buyerIndex].place}, Buenos Aires`,
        phone: interests[buyerIndex].phone,
        email: interests[buyerIndex].email,
        verified: true,
        history: 'Interesado registrado en Agronex',
        date: interests[buyerIndex].date,
        payment: 'A coordinar con el comprador'
    } : (o.buyer || buyerForOferta(o));
    o.reservas = Math.max(Number(o.reservas || 0), 1);
    o.ingresos = Number(o.ingresos || ofPrice(o));
    saveOfertasData();
    renderOfertas();
    showToast('Oferta marcada como vendida.', 'success');
    openProviderOfertaModal(id);
}
function renderOfertasDashboard() {
    const root = document.getElementById('ofertas-dashboard');
    if (!root)
        return;
    const data = ofMetrics();
    const items = data.items;
    if (!items.length) {
        root.innerHTML = `<div class="of-empty"><i class="fas fa-tag"></i><strong>Todavía no tenés ofertas publicadas</strong><span>Publicá tu primera máquina para empezar a medir ingresos, reservas y consultas.</span><button class="btn btn-primary btn-sm" onclick="showScreen('publicar')"><i class="fas fa-plus"></i> Publicar equipo</button></div>`;
        return;
    }
    const ranked = [...items].sort((a, b) => b.ingresos - a.ingresos);
    const rankById = Object.fromEntries(ranked.map((o, i) => [o.id, i + 1]));
    const providerBookings = providerBookingsForOffers(items.filter(o => !isSaleOferta(o)));
    const providerFinancials = providerBookings.map(providerBookingFinancials);
    const providerIncome = providerFinancials.reduce((s, f) => s + f.net, 0);
    const providerActive = providerBookings.filter(b => !['finalizado', 'done', 'cancelled'].includes(b.status)).length;
    const providerWorking = providerBookings.filter(b => ['trabajando', 'active'].includes(b.status)).length;
    const providerDone = providerBookings.filter(b => ['finalizado', 'done'].includes(b.status)).length;
    root.innerHTML = `
      <div class="of-summary-grid">
        <div class="of-summary-card accent"><div class="of-summary-icon">💰</div><div><span>Ingresos generados</span><strong>${ofMoney(providerIncome)}</strong><small>Neto operativo · ${ofMoney(data.totalIngresos)} estimado comercial</small></div></div>
        <div class="of-summary-card"><div class="of-summary-icon">📅</div><div><span>Reservas activas</span><strong>${providerActive}</strong><small>${providerBookings.length} reservas vinculadas a tus ofertas</small></div></div>
        <div class="of-summary-card"><div class="of-summary-icon">🚜</div><div><span>Equipos trabajando</span><strong>${providerWorking}</strong><small>En operación o seguimiento activo</small></div></div>
        <div class="of-summary-card"><div class="of-summary-icon">🏁</div><div><span>Trabajos finalizados</span><strong>${providerDone}</strong><small>${data.activas} publicaciones activas · ${data.pausadas} pausadas</small></div></div>
      </div>
      <section class="of-panel"><div class="of-panel-hdr"><div><h3>Publicaciones</h3><p>Cards grandes con rendimiento por máquina.</p></div></div><div class="of-publications-grid">${items.map(o => {
        const saleOffer = isSaleOferta(o);
        const sold = ofertaIsSold(o);
        const active = o.estado === 'activa';
        const status = sold ? 'Vendida' : active ? 'Activa' : 'Pausada';
        const primaryLabel = saleOffer ? (sold ? 'Ver comprador' : 'Ver interesados') : 'Ver operación';
        const toggleButton = sold ? '' : active ? `<button class="btn btn-ghost btn-xs" onclick="pauseOferta(${o.id})"><i class="fas fa-pause"></i> Pausar</button>` : `<button class="btn btn-ghost btn-xs" onclick="reactivarOferta(${o.id})"><i class="fas fa-play"></i> Activar</button>`;
        return `<article class="of-pub-card ${sold ? 'is-sold' : ''}" onclick="openProviderOfertaModal(${o.id})"><span class="of-rank-chip">#${rankById[o.id] || '—'} rentable</span><div class="of-pub-img ${listingPhotoUrls(o).length ? 'has-photo' : ''}">${listingPhotoMedia(o) || `<span>${o.icon}</span>`}<em>${status}</em>${listingPhotoCount(o) ? `<b class="of-photo-count"><i class="fas fa-camera"></i> ${listingPhotoCount(o)}</b>` : ''}</div><div class="of-pub-body"><div class="of-pub-title"><strong>${o.titulo}</strong><span>${o.precio}</span></div><p>${o.desc || o.tipo || 'Publicación verificada en NexuDrive.'}</p><div class="of-pub-metrics"><div><b>${ofMoney(o.ingresos)}</b><span>ingresos</span></div><div><b>${o.reservas}</b><span>${saleOffer ? 'ventas' : 'reservas'}</span></div><div><b>${o.consultas}</b><span>consultas</span></div><div><b>${o.vistas}</b><span>vistas</span></div></div><div class="of-pub-footer" onclick="event.stopPropagation()"><div><button class="btn btn-ghost btn-xs" onclick="focusProviderOferta(${o.id})"><i class="fas fa-clipboard-list"></i> ${primaryLabel}</button><button class="btn btn-ghost btn-xs" onclick="editOferta(${o.id})"><i class="fas fa-edit"></i> Editar</button>${toggleButton}<button class="btn btn-ghost btn-xs" onclick="verEstadisticasOferta(${o.id})"><i class="fas fa-chart-line"></i> Ver estadísticas</button><button class="btn btn-ghost btn-xs" onclick="askDeleteOferta(${o.id})" style="color:var(--red-400);"><i class="fas fa-trash"></i></button></div></div></div></article>`;
    }).join('')}</div></section>`;
}
const BN_MAP = {
    home: 'bn-home', calc: 'bn-calc', publicar: 'bn-publicar',
    reservas: 'bn-reservas',
    // These go via the Más sheet — mark as bn-mas when active
    perfil: 'bn-mas', campanas: 'bn-mas', favoritos: 'bn-mas', service: 'bn-mas',
    ofertas: 'bn-mas', publicar: 'bn-mas', verificacion: 'bn-mas'
};
// Screens where the calc FAB must stay hidden
const FAB_HIDDEN_SCREENS = new Set(['market', 'service', 'reservas', 'perfil', 'favoritos', 'ofertas', 'campanas', 'publicar']);
function navTo(id, bnId) {
    showScreen(id);
    syncBottomNav(bnId || BN_MAP[id] || null);
    toggleFabForScreen(id);
}
function toggleFabForScreen(id) {
    const fab = document.getElementById('calc-fab');
    if (!fab)
        return;
    if (FAB_HIDDEN_SCREENS.has(id)) {
        fab.classList.remove('fab-show');
    }
    // On calc/home, re-trigger update to show if data exists
    if (id === 'calc' || id === 'home')
        setTimeout(updateCalcFab, 80);
}
function syncBottomNav(activeBnId) {
    document.querySelectorAll('.bn-item').forEach(b => b.classList.remove('active'));
    // Reset FAB state
    const fab = document.getElementById('bn-publicar');
    if (fab) fab.style.background = '';
    if (activeBnId) {
        const btn = document.getElementById(activeBnId);
        if (btn) {
            if (btn.id === 'bn-publicar') {
                // FAB: indicate active with a slightly different shade
                btn.style.background = 'var(--green-800, #274d0a)';
            } else {
                btn.classList.add('active');
            }
        }
    }
}
// Register bottom-nav + FAB hook via central system
document.addEventListener('DOMContentLoaded', function () {
    onShowScreen(function (id) {
        syncBottomNav(BN_MAP[id] || null);
        toggleFabForScreen(id);
    });
});
// ── Más sheet ──
function openMasSheet() {
    document.getElementById('mas-sheet-overlay').classList.add('open');
    document.getElementById('mas-sheet').classList.add('open');
    document.getElementById('bn-mas').classList.add('active');
    document.body.style.overflow = 'hidden';
}
function closeMasSheet() {
    document.getElementById('mas-sheet-overlay').classList.remove('open');
    document.getElementById('mas-sheet').classList.remove('open');
    document.body.style.overflow = '';
}
function masNav(id) {
    closeMasSheet();
    navTo(id, 'bn-mas');
}
// Calc FAB
function scrollToCalcResult() {
    const rp = document.querySelector('.result-panel');
    if (rp)
        rp.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
function updateCalcFab() {
    var _a;
    if (window.innerWidth > 900)
        return;
    const fab = document.getElementById('calc-fab');
    const fabAmt = document.getElementById('fab-amount');
    const fabSub = document.getElementById('fab-sub');
    if (!fab || !fabAmt)
        return;
    const ganEl = document.getElementById('r-ganancia');
    const text = ganEl ? ganEl.textContent.trim() : '';
    if (!text || text === '$0') {
        fab.classList.remove('fab-show');
        return;
    }
    const isNeg = (ganEl.classList.contains('red') || text.startsWith('-'));
    fab.className = 'calc-fab ' + (isNeg ? 'fab-neg' : 'fab-pos') + ' fab-show';
    fabAmt.textContent = text;
    const haEl = document.getElementById('c-ha');
    const cultEl = document.getElementById('c-cultivo');
    if (haEl && cultEl) {
        const crop = (((_a = cultEl.options[cultEl.selectedIndex]) === null || _a === void 0 ? void 0 : _a.text) || '').replace(/[^\w\sáéíóúüñÁÉÍÓÚÜÑ]/g, '').trim();
        fabSub.textContent = `${haEl.value} ha · ${crop}`;
    }
}
(function () {
    const _o = window.calcAuto;
    if (typeof _o === 'function')
        window.calcAuto = function () { _o(); setTimeout(updateCalcFab, 60); };
})();
// Market sheet
// ═══════════════════════════════════════════════════════════
//  BLOQUE 3 — SISTEMA DE VERIFICACIÓN
// ═══════════════════════════════════════════════════════════
(function () {
    // --- State ---
    let verifCurrentStep = 1;
    const TOTAL_STEPS = 4;
    let verifData = {};
    let verifDocUploaded = { frente: false, dorso: false, selfie: false };
    let autoSaveTimer = null;
    // IA micro-tips by step
    const AI_TIPS = {
        1: 'Completar tu perfil aumenta <strong>la visibilidad hasta un 85%</strong> en los resultados de NexuDrive.',
        2: 'Las publicaciones verificadas reciben <strong>4× más solicitudes</strong>. El DNI se valida en segundos.',
        3: 'Agregar una foto real genera confianza inmediata. <strong>Los perfiles con foto tienen 3× más reservas.</strong>',
        4: 'Tu perfil está casi listo. <strong>Completarlo aumenta tus reservas desde el primer día.</strong>'
    };
    // IA spam / quality messages
    const QUALITY_MSGS = [
        'Faltan datos requeridos — completá para aumentar visibilidad.',
        'Buen comienzo. Agregá más info para destacarte.',
        'Perfil en progreso. Casi verificado.',
        'Perfil sólido. Falta el documento para completar la verificación.',
        '¡Perfil completo! Listo para verificación.'
    ];
    window.verifGoStep = function (step) {
        var _a, _b, _c;
        if (step < 1 || step > TOTAL_STEPS + 1)
            return;
        // Update current step panel
        (_a = document.getElementById('verif-step-' + verifCurrentStep)) === null || _a === void 0 ? void 0 : _a.classList.remove('active');
        if (step > TOTAL_STEPS) {
            (_b = document.getElementById('verif-step-success')) === null || _b === void 0 ? void 0 : _b.classList.add('active');
        }
        else {
            (_c = document.getElementById('verif-step-' + step)) === null || _c === void 0 ? void 0 : _c.classList.add('active');
        }
        verifCurrentStep = step;
        updateVerifProgress();
        updateVerifPreview();
        // Update AI tip
        const tipEl = document.getElementById('verif-ai-tip-text');
        if (tipEl && AI_TIPS[step])
            tipEl.innerHTML = AI_TIPS[step];
        verifQuality();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    function updateVerifProgress() {
        for (let i = 1; i <= TOTAL_STEPS; i++) {
            const dot = document.getElementById('verif-dot-' + i);
            const line = document.getElementById('verif-line-' + i);
            if (!dot)
                continue;
            dot.className = 'verif-step-dot';
            if (i < verifCurrentStep) {
                dot.classList.add('done');
                dot.innerHTML = '<i class="fas fa-check" style="font-size:9px;"></i>';
            }
            else if (i === verifCurrentStep) {
                dot.classList.add('active');
                dot.textContent = i;
            }
            else {
                dot.textContent = i;
            }
            if (line) {
                line.className = 'verif-step-line' + (i < verifCurrentStep ? ' done' : '');
            }
        }
    }
    window.verifAutoSave = function () {
        var _a, _b, _c, _d, _e, _f;
        const dot = document.getElementById('verif-autosave-dot');
        const txt = document.getElementById('verif-autosave-text');
        if (dot)
            dot.className = 'verif-autosave-dot saving';
        if (txt)
            txt.textContent = 'Guardando borrador…';
        clearTimeout(autoSaveTimer);
        autoSaveTimer = setTimeout(() => {
            if (dot)
                dot.className = 'verif-autosave-dot';
            if (txt)
                txt.textContent = 'Borrador guardado automáticamente';
        }, 1000);
        // persist to sessionStorage
        try {
            verifData.nombre = ((_a = document.getElementById('verif-nombre')) === null || _a === void 0 ? void 0 : _a.value) || '';
            verifData.apellido = ((_b = document.getElementById('verif-apellido')) === null || _b === void 0 ? void 0 : _b.value) || '';
            verifData.tel = ((_c = document.getElementById('verif-tel')) === null || _c === void 0 ? void 0 : _c.value) || '';
            verifData.email = ((_d = document.getElementById('verif-email')) === null || _d === void 0 ? void 0 : _d.value) || '';
            verifData.prov = ((_e = document.getElementById('verif-prov')) === null || _e === void 0 ? void 0 : _e.value) || '';
            verifData.ciudad = ((_f = document.getElementById('verif-ciudad')) === null || _f === void 0 ? void 0 : _f.value) || '';
            verifData.serviceSpecialty = ((document.getElementById('verif-service-specialty') || {}).value) || '';
            verifData.serviceYears = ((document.getElementById('verif-service-years') || {}).value) || '';
            verifData.serviceCert = ((document.getElementById('verif-service-cert') || {}).value) || '';
            verifData.serviceZone = ((document.getElementById('verif-service-zone') || {}).value) || '';
            sessionStorage.setItem('agronex_verif_draft', JSON.stringify(verifData));
        }
        catch (e) { console.warn("[Agronex]", e); }
    };
    window.verifQuality = function () {
        var _a, _b, _c, _d, _e;
        let score = 0;
        const n = (_a = document.getElementById('verif-nombre')) === null || _a === void 0 ? void 0 : _a.value.trim();
        const a = (_b = document.getElementById('verif-apellido')) === null || _b === void 0 ? void 0 : _b.value.trim();
        const t = (_c = document.getElementById('verif-tel')) === null || _c === void 0 ? void 0 : _c.value.trim();
        const e = (_d = document.getElementById('verif-email')) === null || _d === void 0 ? void 0 : _d.value.trim();
        const p = (_e = document.getElementById('verif-prov')) === null || _e === void 0 ? void 0 : _e.value;
        if (n)
            score += 18;
        if (a)
            score += 18;
        if (t && t.length > 6)
            score += 18;
        if (e && e.includes('@'))
            score += 18;
        if (p)
            score += 8;
        if (verifDocUploaded.frente)
            score += 10;
        if (verifDocUploaded.selfie)
            score += 10;
        score = Math.min(100, score);
        const fill = document.getElementById('verif-quality-fill');
        const pct = document.getElementById('verif-quality-pct');
        if (fill)
            fill.style.width = score + '%';
        if (pct)
            pct.textContent = score + '%';
        // Color the fill
        if (fill) {
            if (score < 40)
                fill.style.background = 'var(--amber-400)';
            else if (score < 80)
                fill.style.background = 'var(--green-200)';
            else
                fill.style.background = 'var(--green-400)';
        }
    };
    window.verifValidateField = function (input, type) {
        var _a, _b, _c, _d;
        let ok = false;
        if (type === 'email')
            ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value);
        else if (type === 'tel')
            ok = input.value.trim().length >= 8;
        else
            ok = input.value.trim().length >= 2;
        input.className = 'verif-input ' + (input.value.trim() ? (ok ? 'valid' : 'invalid') : '');
        // IA scan feedback
        const scan = document.getElementById('verif-scan-1');
        if (scan) {
            const allValid = [
                (_a = document.getElementById('verif-nombre')) === null || _a === void 0 ? void 0 : _a.classList.contains('valid'),
                (_b = document.getElementById('verif-apellido')) === null || _b === void 0 ? void 0 : _b.classList.contains('valid'),
                (_c = document.getElementById('verif-tel')) === null || _c === void 0 ? void 0 : _c.classList.contains('valid'),
                (_d = document.getElementById('verif-email')) === null || _d === void 0 ? void 0 : _d.classList.contains('valid'),
            ].every(Boolean);
            scan.className = 'verif-ai-scan ' + (allValid ? 'ok' : 'scanning');
            scan.querySelector('span').textContent = allValid
                ? 'IA revisó los datos — sin inconsistencias detectadas ✓'
                : 'IA analizando datos en tiempo real…';
        }
    };
    window.verifClickDoc = function (type) {
        var _a;
        (_a = document.getElementById('verif-doc-' + type + '-input')) === null || _a === void 0 ? void 0 : _a.click();
    };
    window.verifHandleDoc = function (type, input) {
        if (!input.files || !input.files[0])
            return;
        const file = input.files[0];
        verifDocUploaded[type] = true;
        // Update zone UI
        const zone = document.getElementById(type === 'selfie' ? 'verif-selfie-zone' : 'verif-doc-' + type);
        const icon = document.getElementById(type === 'selfie' ? 'verif-selfie-icon' : 'verif-doc-' + type + '-icon');
        if (zone)
            zone.classList.add('uploaded');
        if (icon)
            icon.textContent = '✅';
        // Update scan indicator
        if (type === 'frente' || type === 'dorso') {
            const scan = document.getElementById('verif-scan-doc');
            if (scan) {
                scan.className = 'verif-ai-scan scanning';
                document.getElementById('verif-scan-doc-text').textContent = 'IA procesando documento…';
                setTimeout(() => {
                    scan.className = 'verif-ai-scan ok';
                    document.getElementById('verif-scan-doc-text').textContent = 'Documento válido — sin señales de alteración ✓';
                }, 1800);
            }
        }
        verifQuality();
        verifAutoSave();
        showToast('Documento cargado correctamente ✓', 'success');
    };
    function updateVerifPreview() {
        var _a, _b, _c, _d;
        const nombre = ((_a = document.getElementById('verif-nombre')) === null || _a === void 0 ? void 0 : _a.value.trim()) || '';
        const apellido = ((_b = document.getElementById('verif-apellido')) === null || _b === void 0 ? void 0 : _b.value.trim()) || '';
        const prov = ((_c = document.getElementById('verif-prov')) === null || _c === void 0 ? void 0 : _c.value) || '';
        const ciudad = ((_d = document.getElementById('verif-ciudad')) === null || _d === void 0 ? void 0 : _d.value.trim()) || '';
        const fullName = [nombre, apellido].filter(Boolean).join(' ') || '—';
        const loc = [ciudad, prov].filter(Boolean).join(', ') || '—';
        const initials = (nombre[0] || '') + (apellido[0] || '');
        const nameEl = document.getElementById('verif-prev-name');
        const locEl = document.getElementById('verif-prev-loc');
        const avatarEl = document.getElementById('verif-prev-avatar');
        if (nameEl)
            nameEl.textContent = fullName;
        if (locEl)
            locEl.textContent = loc;
        if (avatarEl)
            avatarEl.textContent = initials || '?';
    }
    window.updateVerifPreview = updateVerifPreview;
    window.verifSubmit = function () {
        var _a, _b;
        // Update status card
        const card = document.getElementById('verif-status-card');
        const dot = document.getElementById('verif-status-dot');
        const label = document.getElementById('verif-status-label');
        const desc = document.getElementById('verif-status-desc');
        if (card) {
            card.className = 'verif-status-card pending';
        }
        if (dot) {
            dot.className = 'verif-status-dot pending';
        }
        if (label)
            label.textContent = '🟡 Pendiente de revisión';
        if (desc)
            desc.textContent = 'Revisión automática en curso. Resultado estimado: 24–48 hs.';
        // Show badges
        ['badge-verified', 'badge-validated'].forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.style.display = 'inline-flex';
                el.style.opacity = '0.5';
                el.title = 'En proceso de verificación';
            }
        });
        // Show success step
        (_a = document.getElementById('verif-step-' + verifCurrentStep)) === null || _a === void 0 ? void 0 : _a.classList.remove('active');
        (_b = document.getElementById('verif-step-success')) === null || _b === void 0 ? void 0 : _b.classList.add('active');
        verifCurrentStep = TOTAL_STEPS + 1;
        updateVerifProgress();
        showToast('¡Solicitud enviada! Te avisamos en 24–48 hs 🎉', 'success');
    };
    // Restore draft on screen show — registered via central hook
    onShowScreen(function (id) {
        if (id !== 'verificacion')
            return;
        try {
            const draft = JSON.parse(sessionStorage.getItem('agronex_verif_draft') || '{}');
            if (draft.nombre)
                document.getElementById('verif-nombre').value = draft.nombre;
            if (draft.apellido)
                document.getElementById('verif-apellido').value = draft.apellido;
            if (draft.tel)
                document.getElementById('verif-tel').value = draft.tel;
            if (draft.email)
                document.getElementById('verif-email').value = draft.email;
            if (draft.prov)
                document.getElementById('verif-prov').value = draft.prov;
            if (draft.ciudad)
                document.getElementById('verif-ciudad').value = draft.ciudad;
            if (draft.serviceSpecialty && document.getElementById('verif-service-specialty'))
                document.getElementById('verif-service-specialty').value = draft.serviceSpecialty;
            if (draft.serviceYears && document.getElementById('verif-service-years'))
                document.getElementById('verif-service-years').value = draft.serviceYears;
            if (draft.serviceCert && document.getElementById('verif-service-cert'))
                document.getElementById('verif-service-cert').value = draft.serviceCert;
            if (draft.serviceZone && document.getElementById('verif-service-zone'))
                document.getElementById('verif-service-zone').value = draft.serviceZone;
            verifQuality();
            updateVerifPreview();
        }
        catch (e) { console.warn('[Agronex] verif draft restore failed:', e); }
    });
    // Init
    document.addEventListener('DOMContentLoaded', function () {
        updateVerifProgress();
        verifQuality();
    });
})();

// ---- original java.js lines 6531-6567 ----
// Ofertas cards
function renderOfertasMobileCards() {
    const list = document.getElementById('ofertas-mobile-list');
    if (!list)
        return;
    const data = ofertasData || [];
    list.innerHTML = data.map(o => {
        const icon = o.sourceMode === 'sell' ? 'fa-store' : o.sourceMode === 'both' ? 'fa-layer-group' : 'fa-calendar-check';
        return `
    <div class="oferta-card">
      <div class="oferta-card-body">
        <div class="oferta-card-emoji"><i class="fas ${icon}"></i></div>
        <div class="oferta-card-info">
          <div class="oferta-card-title">${o.titulo || o.title || '-'}</div>
          <div style="font-size:12px;color:var(--text-muted);margin-bottom:3px;">${o.tipo || 'Publicacion'}</div>
          <div class="oferta-card-price">${o.precio || ''}</div>
          <span class="chip ${o.estado === 'activa' ? 'chip-green' : 'chip-gray'}">${o.estado === 'activa' ? 'Activa' : 'Pausada'}</span>
        </div>
      </div>
      <div class="oferta-card-footer">
        <span style="font-size:12px;color:var(--text-muted);">${o.consultas || 0} consultas</span>
        <div style="display:flex;gap:6px;">
          <button class="btn btn-ghost btn-xs" onclick="editOferta(${o.id})"><i class="fas fa-edit"></i></button>
          ${o.estado === 'activa'
        ? `<button class="btn btn-ghost btn-xs" onclick="pauseOferta(${o.id})"><i class="fas fa-pause"></i></button>`
        : `<button class="btn btn-ghost btn-xs" onclick="reactivarOferta(${o.id})"><i class="fas fa-play"></i></button>`}
          <button class="btn btn-ghost btn-xs" onclick="askDeleteOferta(${o.id})" style="color:var(--red-400);"><i class="fas fa-trash"></i></button>
        </div>
      </div>
    </div>`;
    }).join('');
}
