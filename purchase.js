"use strict";
/* ================================================================
   AGRONEX module: NexuDrive purchase, payment, WhatsApp and publication wizard
   Extracted from java.js without behavior changes.
================================================================ */

// ---- original java.js lines 3309-4403 ----
// ===== RESERVA / PAGO NEXUDRIVE =====
function renderPaymentServiceOptions(m) {
    const optionsEl = document.getElementById('pay-service-options');
    if (!optionsEl)
        return;
    const opts = serviceOptionsFor(m);
    currentPaymentService = opts[0] || 'Solo maquinaria';
    optionsEl.innerHTML = opts.map((opt, idx) => `
    <button class="urgency-btn ${idx === 0 ? 'active normal' : ''}" onclick="selectPaymentService('${opt}',this)">
      ${opt === 'Maquinaria + operario' ? 'Máquina + operario' : opt}
    </button>
  `).join('');
}
function openPaymentModal(marketId) {
    // Redirects to the new 5-step booking flow
    openBookingStepsModal(marketId);
}
function openMarketInfo(marketId) {
    selectMarket(marketId);
    const layout = document.querySelector('#screen-market .market-layout');
    const sideCol = document.querySelector('#screen-market .market-side-col');
    if (layout)
        layout.classList.remove('info-open');
    if (sideCol)
        sideCol.style.display = 'none';
}
function closePaymentModal(e) {
    if (!e || e.target.id === 'payment-modal') {
        document.getElementById('payment-modal').style.display = 'none';
    }
}
function selectPaymentService(service, el) {
    currentPaymentService = service;
    el.parentElement.querySelectorAll('.urgency-btn').forEach(b => b.classList.remove('active', 'normal'));
    el.classList.add('active', 'normal');
    updatePaymentSummary();
}
function selectPaymentProvider(provider, el) {
    currentPaymentProvider = provider;
    el.parentElement.querySelectorAll('.payment-provider-btn').forEach(b => b.classList.remove('active'));
    el.classList.add('active');
}
function updatePaymentSummary() {
    var _a;
    const summary = document.getElementById('payment-summary');
    if (!summary || !currentPaymentMarket)
        return;
    const ha = parseFloat((_a = document.getElementById('pay-ha')) === null || _a === void 0 ? void 0 : _a.value) || 0;
    const a = calcBookingAmounts(currentPaymentMarket, currentPaymentService, ha);
    const totalLabel = a.hectares ? fmtUSDPlain(a.total) : 'Ingresá hectáreas';
    summary.innerHTML = `
    <div class="payment-summary-row"><span>Precio por hectárea</span><span>${fmtUSDPlain(a.priceHa)}/ha</span></div>
    <div class="payment-summary-row"><span>Gasto total estimado</span><span>${totalLabel}</span></div>
    <div class="payment-summary-row"><span>Reserva mínima (${fmtPct(PAYMENT_CONFIG.depositRate)})</span><span>${a.hectares ? fmtUSDPlain(a.deposit) : '—'}</span></div>
    <div class="payment-summary-row"><span>Comisión Agronex (${fmtPct(PAYMENT_CONFIG.commissionRate)})</span><span>${a.hectares ? fmtUSDPlain(a.commission) : '—'}</span></div>
    <div class="payment-summary-row pay-now"><span>Pagás ahora</span><span>${a.hectares ? fmtUSDPlain(a.payNow) : '—'}</span></div>
    <div class="payment-summary-row"><span>Saldo estimado al finalizar</span><span>${a.hectares ? fmtUSDPlain(a.balance) : '—'}</span></div>
  `;
}
function processReservationPayment() {
    var _a, _b, _c, _d, _e;
    if (!currentPaymentMarket)
        return;
    const ha = parseFloat((_a = document.getElementById('pay-ha')) === null || _a === void 0 ? void 0 : _a.value) || 0;
    if (ha <= 0) {
        showToast('Ingresá las hectáreas para calcular la reserva.', 'warning');
        return;
    }
    const btn = document.getElementById('pay-submit-btn');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Guardando con ${currentPaymentProvider}...`;
    }
    const m = currentPaymentMarket;
    const amounts = calcBookingAmounts(m, currentPaymentService, ha);
    const booking = {
        id: `NXD-${Date.now().toString().slice(-6)}`,
        machineId: m.id,
        machineTitle: m.title,
        clientName: ((_b = document.getElementById('pay-nombre')) === null || _b === void 0 ? void 0 : _b.value) || (typeof buildFullName === 'function' ? buildFullName() : ''),
        service: currentPaymentService,
        trabajo: ((_c = document.getElementById('pay-trabajo')) === null || _c === void 0 ? void 0 : _c.value) || '',
        fecha: ((_d = document.getElementById('pay-fecha')) === null || _d === void 0 ? void 0 : _d.value) || '',
        lote: ((_e = document.getElementById('pay-lote')) === null || _e === void 0 ? void 0 : _e.value) || '',
        hectares: amounts.hectares,
        priceHa: amounts.priceHa,
        total: amounts.total,
        deposit: amounts.deposit,
        commission: amounts.commission,
        payNow: amounts.payNow,
        balance: amounts.balance,
        provider: currentPaymentProvider,
        status: 'reservado',
        createdAt: new Date().toISOString(),
    };
    setTimeout(() => {
        nexuDriveBookings[bookingKey(m.id)] = booking;
        saveBookings();
        if (typeof pushUserAction === 'function') {
            pushUserAction('reservation', { machineId: m.id, title: m.title, total: amounts.total, date: booking.fecha });
        }
        // ── Integration: push booking cost into campaign ──
        AgronexBus.onBookingCreated(booking, m);
        closePaymentModal();
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = `<i class="fas fa-lock"></i> Pagar reserva`;
        }
        selectMarket(m.id);
        showToast('Reserva pagada. WhatsApp desbloqueado para coordinar.', 'success');
    }, 800);
}
// ===== WA MODAL =====
function renderWAServiceOptions(m) {
    const group = document.getElementById('wa-op-group');
    const optionsEl = document.getElementById('wa-op-options');
    if (!group || !optionsEl)
        return;
    const opts = serviceOptionsFor(m);
    currentWAOp = opts[0] || 'Solo maquinaria';
    group.style.display = 'block';
    optionsEl.innerHTML = opts.map((opt, idx) => `
    <button class="urgency-btn ${idx === 0 ? 'active normal' : ''}" onclick="selectWAOp('${opt}',this)">
      ${opt === 'Maquinaria + operario' ? 'Máquina + operario' : opt}
    </button>
  `).join('');
}
function getWAEstimate() {
    var _a;
    const ha = parseFloat((_a = document.getElementById('wa-ha')) === null || _a === void 0 ? void 0 : _a.value) || 0;
    const priceHa = servicePriceFor(currentWAMarket, currentWAOp);
    if (!currentWAMarket || !ha || !priceHa)
        return null;
    return {
        ha,
        priceHa,
        total: ha * priceHa,
        label: `${fmtUSDPlain(priceHa)}/ha`
    };
}
// ── Status sets ────────────────────────────────────────────────────────
// These statuses mean "work is already coordinated" — skip the form, open WA direct
const WA_FOLLOWUP_STATUSES = new Set([
    'en camino', 'confirmado', 'trabajando', // booking statuses
    'transit', 'active', // map machine statuses
]);
const WA_FORM_STATUSES = new Set([
    'reservado', 'pending', 'confirmed', // new reservation, needs coordination form
    'available', 'reserved', // market listing, not yet coordinated
]);
// ── Build a context-aware follow-up message ───────────────────────────
function buildFollowUpMessage(machineName, operarioName, booking, mapMachine) {
    const senderName = (booking === null || booking === void 0 ? void 0 : booking.clientName) ||
        (typeof AgronexBus !== 'undefined' && AgronexBus.fullName ? AgronexBus.fullName() : '') ||
        (typeof buildFullName === 'function' ? buildFullName() : '') ||
        'Productor';
    const fecha = (booking === null || booking === void 0 ? void 0 : booking.fecha) ? ` para el ${formatDateHuman(booking.fecha)}` : '';
    const lote = (booking === null || booking === void 0 ? void 0 : booking.lote) ? ` en ${booking.lote}` : '';
    const ha = (booking === null || booking === void 0 ? void 0 : booking.hectares) ? ` (${booking.hectares} ha)` : '';
    // Pick contextual variant based on status
    const status = (booking === null || booking === void 0 ? void 0 : booking.status) || (mapMachine === null || mapMachine === void 0 ? void 0 : mapMachine.status) || '';
    if (status === 'en camino' || status === 'transit') {
        return `Hola${operarioName ? ' ' + operarioName : ''}, soy ${senderName}. ¿Cómo viene el traslado de la ${machineName}? Quería confirmar si todo está en orden${fecha}${lote}. Gracias.`;
    }
    if (status === 'trabajando' || status === 'active') {
        return `Hola${operarioName ? ' ' + operarioName : ''}, soy ${senderName}. ¿Todo bien con los trabajos de la ${machineName}${lote}${ha}? Cualquier novedad avisame. Gracias.`;
    }
    if (status === 'confirmado' || status === 'confirmed') {
        return `Hola${operarioName ? ' ' + operarioName : ''}, soy ${senderName}. Quería confirmar que todo esté listo para la ${machineName}${fecha}${lote}${ha}. ¿Sigue bien lo coordinado? Gracias.`;
    }
    // Fallback
    return `Hola${operarioName ? ' ' + operarioName : ''}, soy ${senderName}. Te escribo por la reserva de la ${machineName}${fecha}. ¿Podemos coordinar los detalles finales? Gracias.`;
}
// ── Open WA: smart router ─────────────────────────────────────────────
function openWAModal(marketId) {
    const m = marketData.find(x => x.id === marketId);
    if (!m)
        return;
    const booking = getBooking(marketId);
    if (!booking) {
        showToast('Primero reservá dentro de NexuDrive para desbloquear WhatsApp.', 'warning');
        openPaymentModal(marketId);
        return;
    }
    const status = booking.status || 'reservado';
    // ACTIVE / IN-PROGRESS → skip form, open WA directly with follow-up message
    if (WA_FOLLOWUP_STATUSES.has(status)) {
        const operarioName = m.operario ? (typeof m.operario === 'string' ? m.operario.split(' ')[0] : '') : '';
        const msg = buildFollowUpMessage(m.title, operarioName, booking, null);
        const phone = booking.providerPhone || '5491112345678';
        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
        showToast(`Abriendo WhatsApp — seguimiento de "${m.title}"`, 'success');
        return;
    }
    // NEW / PENDING → show the coordination form as before
    currentWAMarket = m;
    currentWABooking = booking;
    currentWAMachine = m.title;
    document.getElementById('wa-modal-name').textContent = `${m.title} · Reserva ${booking.id}`;
    renderWAServiceOptions(m);
    currentWAOp = booking.service || currentWAOp;
    document.querySelectorAll('#wa-op-options .urgency-btn').forEach(btn => {
        const txt = btn.textContent.trim();
        const isMatch = txt === currentWAOp || (txt === 'Máquina + operario' && currentWAOp === 'Maquinaria + operario');
        btn.classList.toggle('active', isMatch);
        btn.classList.toggle('normal', isMatch);
    });
    document.getElementById('wa-modal').style.display = 'flex';
    document.getElementById('wa-trabajo').value = booking.trabajo || '';
    document.getElementById('wa-lote').value = booking.lote || AgronexBus.userLocation();
    document.getElementById('wa-ha').value = booking.hectares || '';
    document.getElementById('wa-fecha').value = booking.fecha || '';
    document.getElementById('wa-dur').value = '';
    // ── Integration: fill from real profile ──
    AgronexBus.fillWAModalFromProfile(m, booking);
    updateWAPreview();
}
function closeWAModal(e) {
    if (!e || e.target.id === 'wa-modal') {
        document.getElementById('wa-modal').style.display = 'none';
        currentWABooking = null;
    }
}
function selectWAUrgency(val, el) {
    currentWAUrgency = val;
    const sel = el.parentElement;
    sel.querySelectorAll('.urgency-btn').forEach(b => b.classList.remove('active', 'normal', 'urgent', 'today'));
    const cls = val === 'Normal' ? 'normal' : val === 'Urgente' ? 'urgent' : 'today';
    el.classList.add('active', cls);
    updateWAPreview();
}
function selectWAOp(val, el) {
    currentWAOp = val;
    el.parentElement.querySelectorAll('.urgency-btn').forEach(b => b.classList.remove('active', 'normal'));
    el.classList.add('active', 'normal');
    updateWAPreview();
}
function buildReservationCoordinationMessage(asHtml = false) {
    var _a, _b, _c, _d, _e, _f;
    const trabajo = ((_a = document.getElementById('wa-trabajo')) === null || _a === void 0 ? void 0 : _a.value) || (currentWABooking === null || currentWABooking === void 0 ? void 0 : currentWABooking.trabajo) || '';
    const lote = ((_b = document.getElementById('wa-lote')) === null || _b === void 0 ? void 0 : _b.value) || (currentWABooking === null || currentWABooking === void 0 ? void 0 : currentWABooking.lote) || '';
    const fecha = ((_c = document.getElementById('wa-fecha')) === null || _c === void 0 ? void 0 : _c.value) || (currentWABooking === null || currentWABooking === void 0 ? void 0 : currentWABooking.fecha) || '';
    const dur = ((_d = document.getElementById('wa-dur')) === null || _d === void 0 ? void 0 : _d.value) || '';
    const obs = ((_e = document.getElementById('wa-obs')) === null || _e === void 0 ? void 0 : _e.value) || '';
    const ha = parseFloat((_f = document.getElementById('wa-ha')) === null || _f === void 0 ? void 0 : _f.value) || (currentWABooking === null || currentWABooking === void 0 ? void 0 : currentWABooking.hectares) || 0;
    const br = asHtml ? '<br>' : '\n';
    const strongOpen = asHtml ? '<strong>' : '';
    const strongClose = asHtml ? '</strong>' : '';
    let msg = `${strongOpen}Hola, reservé tu ${currentWAMachine} en NexuDrive.${strongClose}`;
    // Always use the live name — either what was saved at booking time, or the current name
    const senderName = (currentWABooking === null || currentWABooking === void 0 ? void 0 : currentWABooking.clientName) || buildFullName();
    if (senderName)
        msg += `${br}Soy ${senderName}.`;
    msg += `${br}Reserva: ${(currentWABooking === null || currentWABooking === void 0 ? void 0 : currentWABooking.id) || 'confirmada'}`;
    msg += `${br}Servicio: ${currentWAOp}`;
    if (trabajo)
        msg += `${br}Trabajo: ${trabajo}`;
    if (fecha)
        msg += `${br}Fecha: ${formatDateHuman(fecha)}`;
    if (lote)
        msg += `${br}Ubicación: ${lote}`;
    if (ha)
        msg += `${br}Hectáreas: ${ha} ha`;
    if (dur)
        msg += `${br}Duración estimada: ${dur}`;
    if (obs)
        msg += `${br}Observaciones: ${obs}`;
    msg += `${br}Reserva pagada en NexuDrive: ${fmtUSDPlain((currentWABooking === null || currentWABooking === void 0 ? void 0 : currentWABooking.payNow) || 0)}.`;
    msg += `${br}${br}¿Coordinamos los detalles finales?`;
    return msg;
}
function updateWAPreview() {
    var _a, _b, _c, _d, _e, _f;
    const trabajo = ((_a = document.getElementById('wa-trabajo')) === null || _a === void 0 ? void 0 : _a.value) || '';
    const fecha = ((_b = document.getElementById('wa-fecha')) === null || _b === void 0 ? void 0 : _b.value) || '';
    const dur = ((_c = document.getElementById('wa-dur')) === null || _c === void 0 ? void 0 : _c.value) || '';
    const lote = ((_d = document.getElementById('wa-lote')) === null || _d === void 0 ? void 0 : _d.value) || '';
    const ha = parseFloat((_e = document.getElementById('wa-ha')) === null || _e === void 0 ? void 0 : _e.value) || 0;
    const obs = ((_f = document.getElementById('wa-obs')) === null || _f === void 0 ? void 0 : _f.value) || '';
    const prev = document.getElementById('wa-preview');
    if (!prev)
        return;
    if (currentWABooking) {
        prev.innerHTML = buildReservationCoordinationMessage(true);
        return;
    }
    if (!trabajo && !lote && !ha) {
        prev.innerHTML = 'Completá el formulario para ver el mensaje...';
        return;
    }
    const estimate = getWAEstimate();
    let msg = `<strong>Hola, vi tu publicación en Agronex.</strong>`;
    if (trabajo)
        msg += `<br>Necesito: ${trabajo}`;
    if (lote)
        msg += `<br>Ubicación: ${lote}`;
    if (ha)
        msg += `<br>Hectáreas: ${ha} ha`;
    if (fecha)
        msg += `<br>Fecha: ${fecha}`;
    if (dur)
        msg += `<br>Duración estimada: ${dur}`;
    msg += `<br>Servicio: ${currentWAOp}`;
    if (estimate) {
        msg += `<div class="wa-estimate">Costo estimado<strong>${fmtUSDPlain(estimate.total)}</strong><small>${estimate.ha} ha × ${estimate.label}. Valor aproximado, a confirmar con el proveedor.</small></div>`;
    }
    else if (currentWAMarket) {
        const priceHa = servicePriceFor(currentWAMarket, currentWAOp);
        msg += `<div class="wa-estimate">Costo estimado<strong>${priceHa ? fmtUSDPlain(priceHa) + '/ha' : '—'}</strong><small>Ingresá las hectáreas para calcular el total aproximado.</small></div>`;
    }
    msg += `<br>Urgencia: ${currentWAUrgency}`;
    if (obs)
        msg += `<br>Obs: ${obs}`;
    msg += `<br><br>¿Estás disponible?`;
    prev.innerHTML = msg;
}
function sendWAMessage() {
    if (currentWABooking) {
        const encodedBooking = encodeURIComponent(buildReservationCoordinationMessage(false));
        window.open(`https://wa.me/5491112345678?text=${encodedBooking}`, '_blank');
        document.getElementById('wa-modal').style.display = 'none';
        showToast('Abriendo WhatsApp de la reserva...', 'success');
        return;
    }
    showToast('WhatsApp se habilita después de pagar una reserva.', 'warning');
    document.getElementById('wa-modal').style.display = 'none';
    if (currentWAMarket === null || currentWAMarket === void 0 ? void 0 : currentWAMarket.id)
        openPaymentModal(currentWAMarket.id);
}
// ===== PUBLICAR WIZARD V2 =====
// State
const pubState = {
    step: 1,
    cat: '',
    service: '',
    listingMode: '',
    photos: [], // array of {dataUrl, file}
    autoSaveTimer: null,
};
const PUB_CAT_EMOJI = {
    Tractor: '🚜', Sembradora: '🚜🌱', Pulverizadora: '💦',
    Cosechadora: '🚜🌾', Dron: '🚁', Camion: '🚛', Acoplado: '🚚',
};
const TOTAL_STEPS = 3;
function pubGoStep(n, back = false) {
    // Validate current step before advancing
    if (n > pubState.step) {
        if (!pubValidateStep(pubState.step))
            return;
    }
    // Hide all steps
    document.querySelectorAll('.pub-step').forEach(s => {
        s.classList.remove('active', 'back');
    });
    // Show target step
    const target = document.getElementById(`pub-step-${n}`);
    if (!target)
        return;
    if (back)
        target.classList.add('back');
    target.classList.add('active');
    pubState.step = n;
    // Update progress
    pubUpdateProgress(n);
    // Back button visibility
    const backBtn = document.getElementById('pub-back-btn');
    if (backBtn)
        backBtn.style.visibility = n > 1 ? 'visible' : 'hidden';
    // Autosave visible from step 2
    const autosave = document.getElementById('pub-autosave');
    if (autosave)
        autosave.style.visibility = n >= 2 ? 'visible' : 'hidden';
    // Quality bar from step 2
    const qualBar = document.getElementById('pub-quality-bar');
    if (qualBar)
        qualBar.style.display = n >= 2 ? 'flex' : 'none';
    // Update preview on step 3
    if (n === 3)
        pubUpdatePreview();
    // Scroll top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
function pubBack() {
    if (pubState.step > 1)
        pubGoStep(pubState.step - 1, true);
    else
        showScreen('market');
}
function pubUpdateProgress(step) {
    const pct = Math.round(((step - 1) / TOTAL_STEPS) * 100);
    const fill = document.getElementById('pub-prog-fill');
    const label = document.getElementById('pub-prog-label');
    const pctEl = document.getElementById('pub-prog-pct');
    if (fill)
        fill.style.width = Math.max(pct, 5) + '%';
    if (label)
        label.textContent = `Paso ${step} de ${TOTAL_STEPS}`;
    if (pctEl)
        pctEl.textContent = pct + '%';
    // Dots
    const dots = document.querySelectorAll('.pub-step-dot');
    dots.forEach((d, i) => {
        d.classList.remove('active', 'done');
        if (i + 1 === step)
            d.classList.add('active');
        else if (i + 1 < step)
            d.classList.add('done');
    });
}
function pubSelectCat(cat, el) {
    pubState.cat = cat;
    document.querySelectorAll('.pub-cat-btn').forEach(b => b.classList.remove('selected'));
    el.classList.add('selected');
    document.getElementById('err-cat').classList.remove('show');
    // Show/hide service completo for dron
    const srvCompleto = document.getElementById('pub-srv-completo');
    if (srvCompleto)
        srvCompleto.style.display = cat === 'Dron' ? 'flex' : 'none';
    // Auto-select servicio completo for dron
    if (cat === 'Dron') {
        const srvBtn = document.getElementById('pub-srv-completo');
        if (srvBtn) {
            srvBtn.style.display = 'flex';
            pubSelectService('Servicio completo', srvBtn);
        }
    }
    pubAutoSave();
}
function pubSelectService(service, el) {
    pubState.service = service;
    document.querySelectorAll('.pub-service-btn').forEach(b => b.classList.remove('selected'));
    el.classList.add('selected');
    document.getElementById('err-service').classList.remove('show');
    pubAutoSave();
}
function pubToggleAvail(el) {
    el.classList.toggle('active');
}
function pubValidateStep(step) {
    var _a, _b, _c, _d, _e, _f;
    let valid = true;
    if (step === 1) {
        if (!pubState.cat) {
            document.getElementById('err-cat').classList.add('show');
            valid = false;
        }
        if (!pubState.service) {
            document.getElementById('err-service').classList.add('show');
            valid = false;
        }
    }
    if (step === 2) {
        const marca = (_a = document.getElementById('pub-marca')) === null || _a === void 0 ? void 0 : _a.value.trim();
        const modelo = (_b = document.getElementById('pub-modelo')) === null || _b === void 0 ? void 0 : _b.value.trim();
        const anio = (_c = document.getElementById('pub-anio')) === null || _c === void 0 ? void 0 : _c.value;
        const precio = (_d = document.getElementById('pub-precio')) === null || _d === void 0 ? void 0 : _d.value;
        const titulo = (_e = document.getElementById('pub-titulo')) === null || _e === void 0 ? void 0 : _e.value.trim();
        const prov = (_f = document.getElementById('pub-prov')) === null || _f === void 0 ? void 0 : _f.value;
        if (!marca) {
            document.getElementById('err-marca').classList.add('show');
            valid = false;
        }
        else
            document.getElementById('err-marca').classList.remove('show');
        if (!modelo) {
            document.getElementById('err-modelo').classList.add('show');
            valid = false;
        }
        else
            document.getElementById('err-modelo').classList.remove('show');
        if (!anio) {
            document.getElementById('err-anio').classList.add('show');
            valid = false;
        }
        else
            document.getElementById('err-anio').classList.remove('show');
        if (!precio) {
            document.getElementById('err-precio').classList.add('show');
            valid = false;
        }
        else
            document.getElementById('err-precio').classList.remove('show');
        if (!titulo) {
            document.getElementById('err-titulo').classList.add('show');
            valid = false;
        }
        else
            document.getElementById('err-titulo').classList.remove('show');
        if (!prov) {
            document.getElementById('err-prov').classList.add('show');
            valid = false;
        }
        else
            document.getElementById('err-prov').classList.remove('show');
        // Show drone fields if needed
        const droneFields = document.getElementById('pub-drone-fields');
        if (droneFields)
            droneFields.style.display = pubState.cat === 'Dron' ? 'block' : 'none';
    }
    if (step === 3) {
        if (pubState.photos.length === 0) {
            document.getElementById('err-photos').classList.add('show');
            valid = false;
        }
        else {
            document.getElementById('err-photos').classList.remove('show');
        }
    }
    if (!valid) {
        const firstErr = document.querySelector('.pub-error-msg.show');
        if (firstErr)
            firstErr.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Shake the next button
        const nextBtns = document.querySelectorAll('.pub-btn-next');
        nextBtns.forEach(b => { b.style.animation = 'none'; setTimeout(() => { b.style.animation = ''; }, 0); });
    }
    return valid;
}
function pubQuality() {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    let score = 0;
    const checks = [
        pubState.cat,
        pubState.service,
        (_a = document.getElementById('pub-marca')) === null || _a === void 0 ? void 0 : _a.value.trim(),
        (_b = document.getElementById('pub-modelo')) === null || _b === void 0 ? void 0 : _b.value.trim(),
        (_c = document.getElementById('pub-anio')) === null || _c === void 0 ? void 0 : _c.value,
        (_d = document.getElementById('pub-precio')) === null || _d === void 0 ? void 0 : _d.value,
        (_e = document.getElementById('pub-titulo')) === null || _e === void 0 ? void 0 : _e.value.trim(),
        (_f = document.getElementById('pub-prov')) === null || _f === void 0 ? void 0 : _f.value,
        (_g = document.getElementById('pub-desc')) === null || _g === void 0 ? void 0 : _g.value.trim(),
        pubState.photos.length > 0,
        pubState.photos.length >= 2,
        (_h = document.getElementById('pub-radio')) === null || _h === void 0 ? void 0 : _h.value,
    ];
    score = checks.filter(Boolean).length;
    const pct = Math.round((score / checks.length) * 100);
    const fill = document.getElementById('pub-quality-fill');
    const pctEl = document.getElementById('pub-quality-pct');
    if (fill) {
        fill.style.width = pct + '%';
        fill.className = 'pub-quality-fill ' + (pct < 40 ? 'low' : pct < 70 ? 'mid' : 'high');
    }
    if (pctEl)
        pctEl.textContent = pct + '%';
    // Title char count
    const titulo = document.getElementById('pub-titulo');
    const tCount = document.getElementById('pub-titulo-count');
    if (titulo && tCount)
        tCount.textContent = `${titulo.value.length} / 80 caracteres`;
    return pct;
}
function pubAutoSave() {
    clearTimeout(pubState.autoSaveTimer);
    pubState.autoSaveTimer = setTimeout(() => {
        var _a, _b, _c, _d, _e, _f, _g;
        // Save to localStorage
        const data = {
            cat: pubState.cat,
            service: pubState.service,
            marca: (_a = document.getElementById('pub-marca')) === null || _a === void 0 ? void 0 : _a.value,
            modelo: (_b = document.getElementById('pub-modelo')) === null || _b === void 0 ? void 0 : _b.value,
            anio: (_c = document.getElementById('pub-anio')) === null || _c === void 0 ? void 0 : _c.value,
            precio: (_d = document.getElementById('pub-precio')) === null || _d === void 0 ? void 0 : _d.value,
            titulo: (_e = document.getElementById('pub-titulo')) === null || _e === void 0 ? void 0 : _e.value,
            prov: (_f = document.getElementById('pub-prov')) === null || _f === void 0 ? void 0 : _f.value,
            desc: (_g = document.getElementById('pub-desc')) === null || _g === void 0 ? void 0 : _g.value,
        };
        try {
            localStorage.setItem('agronex_pub_draft', JSON.stringify(data));
        }
        catch (e) { console.warn("[Agronex]", e); }
        pubQuality();
    }, 600);
}
// ── Photo handling ──
function pubHandleFiles(files) {
    Array.from(files).forEach(file => {
        if (!file.type.startsWith('image/'))
            return;
        if (pubState.photos.length >= 6)
            return;
        const reader = new FileReader();
        reader.onload = e => {
            var _a;
            pubState.photos.push({ dataUrl: e.target.result, file });
            pubRenderPhotoSlots();
            pubQuality();
            (_a = document.getElementById('err-photos')) === null || _a === void 0 ? void 0 : _a.classList.remove('show');
        };
        reader.readAsDataURL(file);
    });
}
function pubHandleDrop(e) {
    var _a;
    e.preventDefault();
    (_a = document.getElementById('pub-dropzone')) === null || _a === void 0 ? void 0 : _a.classList.remove('drag-over');
    pubHandleFiles(e.dataTransfer.files);
}
function pubClickSlot(idx) {
    var _a;
    if (pubState.photos[idx]) {
        // Remove photo
        pubState.photos.splice(idx, 1);
        pubRenderPhotoSlots();
        pubQuality();
    }
    else {
        (_a = document.getElementById('pub-file-input')) === null || _a === void 0 ? void 0 : _a.click();
    }
}
function pubRenderPhotoSlots() {
    const labels = ['Vista frontal', 'Vista lateral', 'Estado general', 'Foto extra', 'Foto extra', 'Foto extra'];
    const required = [true, true, false, false, false, false];
    for (let i = 0; i < 6; i++) {
        const slot = document.getElementById(`pub-slot-${i}`);
        if (!slot)
            continue;
        const photo = pubState.photos[i];
        if (photo) {
            slot.classList.add('filled');
            slot.classList.remove('required-slot');
            slot.innerHTML = `
        <img src="${photo.dataUrl}" class="pub-photo-preview" alt="Foto ${i + 1}">
        <button class="pub-photo-remove" onclick="event.stopPropagation();pubRemovePhoto(${i})"><i class="fas fa-times"></i></button>
      `;
        }
        else {
            slot.classList.remove('filled');
            if (required[i])
                slot.classList.add('required-slot');
            slot.innerHTML = `
        <div class="pub-photo-slot-icon"><i class="fas ${i < 2 ? 'fa-camera' : 'fa-plus'}"></i></div>
        <div class="pub-photo-slot-label">${labels[i]}</div>
        ${required[i] ? '<div class="pub-photo-required-badge">Requerida</div>' : ''}
      `;
        }
    }
    // Update preview image
    pubUpdatePreview();
}
function pubRemovePhoto(idx) {
    pubState.photos.splice(idx, 1);
    pubRenderPhotoSlots();
    pubQuality();
}
function pubUpdatePreview() {
    var _a, _b, _c, _d;
    const emoji = PUB_CAT_EMOJI[pubState.cat] || '🚜';
    const titulo = ((_a = document.getElementById('pub-titulo')) === null || _a === void 0 ? void 0 : _a.value) || 'Completá el título...';
    const precio = (_b = document.getElementById('pub-precio')) === null || _b === void 0 ? void 0 : _b.value;
    const prov = (_c = document.getElementById('pub-prov')) === null || _c === void 0 ? void 0 : _c.value;
    const anio = (_d = document.getElementById('pub-anio')) === null || _d === void 0 ? void 0 : _d.value;
    const prevImg = document.getElementById('pub-prev-img');
    const prevEmoji = document.getElementById('pub-prev-emoji');
    const prevTitle = document.getElementById('pub-prev-title');
    const prevPrice = document.getElementById('pub-prev-price');
    const prevLoc = document.getElementById('pub-prev-loc');
    const prevYear = document.getElementById('pub-prev-year');
    const prevSrv = document.getElementById('pub-prev-service');
    if (prevEmoji)
        prevEmoji.innerHTML = emoji;
    if (prevTitle)
        prevTitle.textContent = titulo;
    if (prevPrice)
        prevPrice.textContent = precio ? `USD ${precio}/ha` : 'USD —/ha';
    if (prevLoc)
        prevLoc.innerHTML = `<i class="fas fa-map-pin"></i> ${prov || '—'}`;
    if (prevYear)
        prevYear.innerHTML = `<i class="fas fa-calendar"></i> ${anio || '—'}`;
    if (prevSrv)
        prevSrv.innerHTML = `<i class="fas fa-user"></i> ${pubState.service || '—'}`;
    // If first photo, show it in preview
    if (prevImg && pubState.photos.length > 0) {
        prevImg.innerHTML = `<img src="${pubState.photos[0].dataUrl}" style="width:100%;height:100%;object-fit:cover;position:absolute;inset:0;" alt="Preview">`;
    }
    else if (prevImg) {
        prevImg.innerHTML = `<span id="pub-prev-emoji" style="font-size:52px;">${emoji}</span>`;
    }
}
function pubReset() {
    pubState.step = 1;
    pubState.cat = '';
    pubState.service = '';
    pubState.listingMode = '';
    pubState.photos = [];
    document.querySelectorAll('.pub-cat-btn, .pub-service-btn, .pub-mode-btn').forEach(b => b.classList.remove('selected'));
    ['pub-marca', 'pub-modelo', 'pub-anio', 'pub-precio', 'pub-titulo', 'pub-desc', 'pub-radio', 'pub-sale-price', 'pub-sale-hours', 'pub-sale-problem', 'pub-sale-maintenance'].forEach(id => {
        const el = document.getElementById(id);
        if (el)
            el.value = '';
    });
    const prov = document.getElementById('pub-prov');
    if (prov)
        prov.value = '';
    const saleCondition = document.getElementById('pub-sale-condition');
    if (saleCondition)
        saleCondition.value = '';
    const saleNegotiable = document.getElementById('pub-sale-negotiable');
    if (saleNegotiable)
        saleNegotiable.value = 'Si';
    pubApplyModeUI();
    pubRenderPhotoSlots();
    pubUpdateProgress(1);
    try {
        localStorage.removeItem('agronex_pub_draft');
    }
    catch (e) { console.warn("[Agronex]", e); }
}
function pubSetupListingModeUI() {
    const step1Hdr = document.querySelector('#pub-step-1 .pub-step-hdr');
    if (step1Hdr && !document.getElementById('pub-mode-block')) {
        const techRegistered = isTechRegistered();
        const techBtnLabel  = techRegistered ? 'Gestionar perfil técnico' : 'Registrarme como técnico';
        const techBtnDesc   = techRegistered ? 'Editá especialidades, zona y disponibilidad.' : 'Ofrecé tus servicios a productores de la zona.';
        const techBtnIcon   = techRegistered ? 'fa-id-card-clip' : 'fa-screwdriver-wrench';
        const techBtnAction = techRegistered ? 'openTechManageModal()' : 'openTechRegisterModal()';
        step1Hdr.insertAdjacentHTML('afterend', `
      <div class="pub-mode-block" id="pub-mode-block">
        <div class="pub-field-label"><div class="pub-required"></div> ¿Qué querés hacer?</div>
        <div class="pub-mode-grid pub-mode-grid--4">
          <button class="pub-mode-btn" onclick="pubSelectListingMode('rent',this)">
            <span class="pub-mode-icon"><i class="fas fa-calendar-check"></i></span>
            <span class="pub-mode-name">Poner a alquilar</span>
            <span class="pub-mode-desc">Recibir reservas por hectárea o servicio.</span>
            <span class="pub-service-check"><i class="fas fa-check"></i></span>
          </button>
          <button class="pub-mode-btn" onclick="pubSelectListingMode('sell',this)">
            <span class="pub-mode-icon"><i class="fas fa-store"></i></span>
            <span class="pub-mode-name">Poner a vender</span>
            <span class="pub-mode-desc">Publicar precio total y contacto del vendedor.</span>
            <span class="pub-service-check"><i class="fas fa-check"></i></span>
          </button>
          <button class="pub-mode-btn" onclick="pubSelectListingMode('both',this)">
            <span class="pub-mode-icon"><i class="fas fa-layer-group"></i></span>
            <span class="pub-mode-name">Ambas opciones</span>
            <span class="pub-mode-desc">Disponible para alquiler y también venta.</span>
            <span class="pub-service-check"><i class="fas fa-check"></i></span>
          </button>
          <button class="pub-mode-btn pub-mode-btn--tech" onclick="${techBtnAction}">
            <span class="pub-mode-icon pub-mode-icon--tech"><i class="fas ${techBtnIcon}"></i></span>
            <span class="pub-mode-name">${techBtnLabel}</span>
            <span class="pub-mode-desc">${techBtnDesc}</span>
            ${techRegistered ? '<span class="pub-tech-badge"><i class="fas fa-circle-check"></i> Activo</span>' : ''}
          </button>
        </div>
        <div class="pub-error-msg" id="err-mode"><i class="fas fa-exclamation-circle"></i> Elegí si querés alquilar, vender o ambas</div>
      </div>`);
    }
    const descField = document.querySelector('#pub-desc') && document.querySelector('#pub-desc').closest('.pub-field-group');
    if (descField && !document.getElementById('pub-sale-fields')) {
        descField.insertAdjacentHTML('beforebegin', `
      <div id="pub-sale-fields" style="display:none;">
        <div style="border-top:1px solid var(--border);padding-top:18px;margin-top:4px;margin-bottom:16px;">
          <div class="pub-field-label" style="color:var(--accent);"><i class="fas fa-store" style="font-size:12px;"></i> Datos para venta</div>
        </div>
        <div class="pub-grid-2">
          <div class="pub-field-group">
            <div class="pub-field-label"><div class="pub-required"></div> Precio de venta</div>
            <div class="pub-input-group has-suffix"><span class="pub-input-prefix">USD</span><input class="pub-input" type="number" id="pub-sale-price" placeholder="128000" oninput="pubAutoSave();pubQuality();updatePublishPreview()"></div>
            <div class="pub-error-msg" id="err-sale-price"><i class="fas fa-exclamation-circle"></i> Ingresa el precio de venta</div>
          </div>
          <div class="pub-field-group">
            <div class="pub-field-label">Precio discutible</div>
            <select class="pub-select" id="pub-sale-negotiable" onchange="pubAutoSave();updatePublishPreview()"><option value="Si">Si, escucho ofertas</option><option value="No">No, precio fijo</option></select>
          </div>
        </div>
        <div class="pub-grid-2">
          <div class="pub-field-group">
            <div class="pub-field-label"><div class="pub-required"></div> Estado de venta</div>
            <select class="pub-select" id="pub-sale-condition" onchange="pubAutoSave();pubQuality()"><option value="">Seleccionar...</option><option>0 km</option><option>Usado excelente</option><option>Usado muy bueno</option><option>Usado bueno</option><option>Usado a revisar</option></select>
            <div class="pub-error-msg" id="err-sale-condition"><i class="fas fa-exclamation-circle"></i> Selecciona el estado del equipo</div>
          </div>
          <div class="pub-field-group">
            <div class="pub-field-label">Horas de uso</div>
            <div class="pub-input-group has-suffix"><input class="pub-input" type="number" id="pub-sale-hours" placeholder="2150" oninput="pubAutoSave();updatePublishPreview()"><span class="pub-input-suffix">h</span></div>
          </div>
        </div>
        <div class="pub-field-group">
          <div class="pub-field-label">Tiene algun problema?</div>
          <div class="pub-avail-grid">
            <button class="pub-avail-chip active" type="button" id="pub-sale-problem-no" onclick="pubSetSaleProblem(false,this)">Sin problemas declarados</button>
            <button class="pub-avail-chip" type="button" id="pub-sale-problem-yes" onclick="pubSetSaleProblem(true,this)">Tiene detalles</button>
          </div>
        </div>
        <div class="pub-field-group" id="pub-sale-problem-wrap" style="display:none;">
          <div class="pub-field-label">Detalle del problema o desgaste</div>
          <textarea class="pub-textarea" id="pub-sale-problem" placeholder="Ej: perdida hidraulica menor, cubierta trasera a cambiar, pintura con detalles..." rows="3" oninput="pubAutoSave();pubQuality()"></textarea>
        </div>
        <div class="pub-field-group">
          <div class="pub-field-label">Historial de mantenimiento</div>
          <textarea class="pub-textarea" id="pub-sale-maintenance" placeholder="Ej: services al dia, reparaciones recientes, repuestos cambiados..." rows="3" oninput="pubAutoSave();pubQuality()"></textarea>
        </div>
      </div>`);
    }
    pubApplyModeUI();
}
function pubSelectListingMode(mode, el) {
    pubState.listingMode = mode;
    document.querySelectorAll('.pub-mode-btn').forEach(b => b.classList.remove('selected'));
    if (el)
        el.classList.add('selected');
    const err = document.getElementById('err-mode');
    if (err)
        err.classList.remove('show');
    pubApplyModeUI();
    pubAutoSave();
}
function pubIsSaleMode() { return pubState.listingMode === 'sell' || pubState.listingMode === 'both'; }
function pubIsRentMode() { return pubState.listingMode === 'rent' || pubState.listingMode === 'both'; }
function pubApplyModeUI() {
    const serviceGrid = document.getElementById('pub-service-grid');
    const serviceLabel = serviceGrid && serviceGrid.previousElementSibling;
    const saleFields = document.getElementById('pub-sale-fields');
    const priceInput = document.getElementById('pub-precio');
    const priceGroup = priceInput && priceInput.closest('.pub-field-group');
    const priceSuffix = priceInput && priceInput.parentElement.querySelector('.pub-input-suffix');
    const priceLabel = priceInput && priceInput.closest('.pub-field-group').querySelector('.pub-field-label');
    const radioInput = document.getElementById('pub-radio');
    const radioGroup = radioInput && radioInput.closest('.pub-field-group');
    const availGrid = document.getElementById('pub-avail-chips');
    const availGroup = availGrid && availGrid.closest('.pub-field-group');
    const stepSub = document.querySelector('#pub-step-1 .pub-step-sub');
    if (stepSub)
        stepSub.textContent = 'Elegi si queres alquilar, vender o ambas opciones.';
    if (serviceLabel)
        serviceLabel.style.display = pubIsRentMode() ? '' : 'none';
    if (serviceGrid)
        serviceGrid.style.display = pubIsRentMode() ? 'grid' : 'none';
    if (saleFields)
        saleFields.style.display = pubIsSaleMode() ? 'block' : 'none';
    if (priceGroup)
        priceGroup.style.display = pubIsRentMode() ? '' : 'none';
    if (radioGroup)
        radioGroup.style.display = pubIsRentMode() ? '' : 'none';
    if (availGroup)
        availGroup.style.display = pubIsRentMode() ? '' : 'none';
    if (priceSuffix)
        priceSuffix.textContent = pubIsRentMode() ? '/ha' : '';
    if (priceLabel)
        priceLabel.innerHTML = `<div class="pub-required"></div> ${pubIsRentMode() ? 'Precio de alquiler' : 'Precio de referencia'}`;
    if (pubState.listingMode === 'sell') {
        pubState.service = 'Venta';
        document.querySelectorAll('.pub-service-btn').forEach(b => b.classList.remove('selected'));
    }
}
function pubSetSaleProblem(hasProblem, el) {
    const wrap = document.getElementById('pub-sale-problem-wrap');
    document.querySelectorAll('#pub-sale-problem-no,#pub-sale-problem-yes').forEach(b => b.classList.remove('active'));
    if (el)
        el.classList.add('active');
    if (wrap)
        wrap.style.display = hasProblem ? 'block' : 'none';
    if (!hasProblem) {
        const textarea = document.getElementById('pub-sale-problem');
        if (textarea)
            textarea.value = '';
    }
    pubAutoSave();
}
function pubValidateSaleFields() {
    if (!pubIsSaleMode())
        return true;
    let valid = true;
    const price = document.getElementById('pub-sale-price');
    const condition = document.getElementById('pub-sale-condition');
    const priceErr = document.getElementById('err-sale-price');
    const condErr = document.getElementById('err-sale-condition');
    if (!price || !price.value) {
        if (priceErr)
            priceErr.classList.add('show');
        valid = false;
    }
    else if (priceErr)
        priceErr.classList.remove('show');
    if (!condition || !condition.value) {
        if (condErr)
            condErr.classList.add('show');
        valid = false;
    }
    else if (condErr)
        condErr.classList.remove('show');
    return valid;
}
// ── Legacy compat: onPubCatChange ──
function onPubCatChange() {
    var _a;
    const cat = (_a = document.getElementById('pub-cat')) === null || _a === void 0 ? void 0 : _a.value;
    const droneFields = document.getElementById('pub-drone-fields');
    const tipoSelect = document.getElementById('pub-tipo');
    if (droneFields)
        droneFields.style.display = cat === 'Dron' ? 'block' : 'none';
    if (tipoSelect && cat === 'Dron')
        tipoSelect.value = 'Servicio completo';
    updatePublishPreview();
}

const _pubValidateStepBase = pubValidateStep;
window.pubValidateStep = function (step) {
    var _a, _b, _c, _d, _e, _f;
    if (step === 1) {
        let ok = true;
        if (!pubState.listingMode) {
            const err = document.getElementById('err-mode');
            if (err)
                err.classList.add('show');
            ok = false;
        }
        if (!pubState.cat) {
            document.getElementById('err-cat').classList.add('show');
            ok = false;
        }
        if (pubIsRentMode() && !pubState.service) {
            document.getElementById('err-service').classList.add('show');
            ok = false;
        }
        return ok;
    }
    if (step === 2) {
        let valid = true;
        const marca = (_a = document.getElementById('pub-marca')) === null || _a === void 0 ? void 0 : _a.value.trim();
        const modelo = (_b = document.getElementById('pub-modelo')) === null || _b === void 0 ? void 0 : _b.value.trim();
        const anio = (_c = document.getElementById('pub-anio')) === null || _c === void 0 ? void 0 : _c.value;
        const precio = (_d = document.getElementById('pub-precio')) === null || _d === void 0 ? void 0 : _d.value;
        const titulo = (_e = document.getElementById('pub-titulo')) === null || _e === void 0 ? void 0 : _e.value.trim();
        const prov = (_f = document.getElementById('pub-prov')) === null || _f === void 0 ? void 0 : _f.value;
        const setErr = (id, show) => {
            const err = document.getElementById(id);
            if (err)
                err.classList.toggle('show', !!show);
        };
        setErr('err-marca', !marca);
        setErr('err-modelo', !modelo);
        setErr('err-anio', !anio);
        setErr('err-titulo', !titulo);
        setErr('err-prov', !prov);
        if (!marca || !modelo || !anio || !titulo || !prov)
            valid = false;
        setErr('err-precio', pubIsRentMode() && !precio);
        if (pubIsRentMode() && !precio)
            valid = false;
        if (!pubValidateSaleFields())
            valid = false;
        const droneFields = document.getElementById('pub-drone-fields');
        if (droneFields)
            droneFields.style.display = pubState.cat === 'Dron' ? 'block' : 'none';
        if (!valid) {
            const firstErr = document.querySelector('.pub-error-msg.show');
            if (firstErr)
                firstErr.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return valid;
    }
    const baseOk = _pubValidateStepBase(step);
    return baseOk;
};
const _pubQualityBase = pubQuality;
window.pubQuality = function () {
    const pct = _pubQualityBase();
    if (pubIsSaleMode()) {
        const saleChecks = [
            document.getElementById('pub-sale-price') && document.getElementById('pub-sale-price').value,
            document.getElementById('pub-sale-condition') && document.getElementById('pub-sale-condition').value,
            document.getElementById('pub-sale-maintenance') && document.getElementById('pub-sale-maintenance').value,
        ].filter(Boolean).length;
        const boosted = Math.min(100, pct + saleChecks * 4);
        const fill = document.getElementById('pub-quality-fill');
        const pctEl = document.getElementById('pub-quality-pct');
        if (fill)
            fill.style.width = boosted + '%';
        if (pctEl)
            pctEl.textContent = boosted + '%';
        return boosted;
    }
    return pct;
};
window.pubUpdatePreview = function () {
    var _a, _b, _c, _d;
    const iconMap = { Tractor: '🚜', Sembradora: '🚜🌱', Pulverizadora: '💦', Cosechadora: '🚜🌾', Dron: '🚁', Camion: '🚛', Acoplado: '🚚' };
    const titulo = ((_a = document.getElementById('pub-titulo')) === null || _a === void 0 ? void 0 : _a.value) || 'Completa el titulo...';
    const rentPrice = (_b = document.getElementById('pub-precio')) === null || _b === void 0 ? void 0 : _b.value;
    const salePrice = (_c = document.getElementById('pub-sale-price')) === null || _c === void 0 ? void 0 : _c.value;
    const prov = ((_d = document.getElementById('pub-prov')) === null || _d === void 0 ? void 0 : _d.value) || '';
    const anio = (document.getElementById('pub-anio') || {}).value || '';
    const prevImg = document.getElementById('pub-prev-img');
    const prevTitle = document.getElementById('pub-prev-title');
    const prevPrice = document.getElementById('pub-prev-price');
    const prevLoc = document.getElementById('pub-prev-loc');
    const prevYear = document.getElementById('pub-prev-year');
    const prevSrv = document.getElementById('pub-prev-service');
    if (prevTitle)
        prevTitle.textContent = titulo;
    if (prevPrice) {
        if (pubIsSaleMode() && salePrice)
            prevPrice.textContent = `USD ${Number(salePrice).toLocaleString('es-AR')}`;
        else
            prevPrice.textContent = rentPrice ? `USD ${rentPrice}/ha` : 'USD -';
    }
    if (prevLoc)
        prevLoc.innerHTML = `<i class="fas fa-map-pin"></i> ${prov || '-'}`;
    if (prevYear)
        prevYear.innerHTML = `<i class="fas fa-calendar"></i> ${anio || '-'}`;
    if (prevSrv)
        prevSrv.innerHTML = `<i class="fas fa-tag"></i> ${pubState.listingMode === 'sell' ? 'Venta' : pubState.listingMode === 'both' ? 'Alquiler + venta' : (pubState.service || '-')}`;
    if (prevImg && pubState.photos.length > 0) {
        prevImg.innerHTML = `<img src="${pubState.photos[0].dataUrl}" style="width:100%;height:100%;object-fit:cover;position:absolute;inset:0;" alt="Preview">`;
    }
    else if (prevImg) {
        prevImg.innerHTML = `<span id="pub-prev-emoji" style="font-size:42px;color:var(--accent);">${iconMap[pubState.cat] || '🚜'}</span>`;
    }
};
window.submitPublicacion = function () {
    var _a, _b, _c, _d, _e, _f, _g;
    if (!pubValidateStep(2))
        return;
    if (pubState.photos.length === 0) {
        document.getElementById('err-photos').classList.add('show');
        document.getElementById('err-photos').scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
    }
    const rentPrice = parseFloat(((_a = document.getElementById('pub-precio')) === null || _a === void 0 ? void 0 : _a.value) || '0') || 0;
    const salePrice = parseFloat(((_b = document.getElementById('pub-sale-price')) === null || _b === void 0 ? void 0 : _b.value) || '0') || 0;
    const titulo = ((_c = document.getElementById('pub-titulo')) === null || _c === void 0 ? void 0 : _c.value) || 'Mi equipo';
    const prov = ((_d = document.getElementById('pub-prov')) === null || _d === void 0 ? void 0 : _d.value) || 'Buenos Aires';
    const anio = parseInt(((_e = document.getElementById('pub-anio')) === null || _e === void 0 ? void 0 : _e.value) || '2020') || 2020;
    const marca = ((_f = document.getElementById('pub-marca')) === null || _f === void 0 ? void 0 : _f.value) || '';
    const modelo = ((_g = document.getElementById('pub-modelo')) === null || _g === void 0 ? void 0 : _g.value) || '';
    const photoUrls = pubState.photos.map(p => p.dataUrl).filter(Boolean).slice(0, 6);
    let createdSourceId = null;
    if (pubIsRentMode()) {
        const newId = marketData.length + 1;
        createdSourceId = newId;
        marketData.push({
            id: newId, emoji: PUB_CAT_EMOJI[pubState.cat] || '🚜',
            title: titulo, price: `USD ${rentPrice}/ha`, priceNum: rentPrice,
            saving: 'Recien publicado', savingShort: 'Nuevo',
            cat: pubState.cat, dist: '-', distNum: 99, avail: 'Disponible', availNow: true,
            operario: pubState.service !== 'Solo maquinaria', marca, year: anio, hp: null, area: prov,
            rating: 0, reviews: 0, reservasCampana: 0, responseMin: 10, serviceOptions: [pubState.service],
            photoUrls,
        });
    }
    if (pubIsSaleMode()) {
        const saleId = Math.max(100, ...salesListings.map(x => x.id)) + 1;
        if (!createdSourceId)
            createdSourceId = saleId;
        const condition = (document.getElementById('pub-sale-condition') || {}).value || 'Usado bueno';
        const hours = parseInt((document.getElementById('pub-sale-hours') || {}).value || '0') || 0;
        const maintenance = (document.getElementById('pub-sale-maintenance') || {}).value || 'Mantenimiento a consultar con el vendedor.';
        const problem = (document.getElementById('pub-sale-problem') || {}).value || '';
        salesListings.unshift({
            id: saleId, category: pubState.cat, brand: marca, model: modelo, year: anio,
            location: prov, province: prov, price: salePrice, currency: 'USD', hours,
            condition, verified: false, demand: false, featured: false, goodPrice: false,
            distanceKm: 99, photos: ['Frontal', 'Lateral', 'Estado general', 'Foto extra', 'Foto extra', 'Foto extra'].slice(0, photoUrls.length || 3), photosData: photoUrls, seller: buildFullName(),
            sellerType: 'Productor', maintenance, description: problem ? `Detalles declarados: ${problem}` : 'Equipo publicado para venta en NexuDrive Market.',
            specs: [condition, `${hours} horas`, (document.getElementById('pub-sale-negotiable') || {}).value === 'Si' ? 'Precio discutible' : 'Precio fijo'],
            createdDays: 0, priceDelta: 0, status: 'active',
        });
    }
    addOfertaFromPublication({
        titulo,
        precio: pubIsSaleMode() && !pubIsRentMode() ? `USD ${salePrice.toLocaleString('es-AR')}` : pubIsRentMode() && pubIsSaleMode() ? `Alq. USD ${rentPrice}/ha - Venta USD ${salePrice.toLocaleString('es-AR')}` : `USD ${rentPrice}/ha`,
        tipo: pubState.listingMode === 'sell' ? 'Venta' : pubState.listingMode === 'both' ? 'Alquiler + venta' : pubState.service,
        desc: pubIsSaleMode()
            ? `Venta - ${((document.getElementById('pub-sale-condition') || {}).value || 'Estado a confirmar')}${((document.getElementById('pub-sale-negotiable') || {}).value === 'Si') ? ' - precio discutible' : ' - precio fijo'}`
            : `Alquiler - ${pubState.service}`,
        sourceMode: pubState.listingMode,
        sourceId: createdSourceId,
        photoUrls,
    });
    document.querySelectorAll('.pub-step').forEach(s => s.classList.remove('active', 'back'));
    const success = document.getElementById('pub-step-success');
    if (success)
        success.classList.add('active');
    const hdr = document.getElementById('pub-prog-hdr');
    if (hdr)
        hdr.style.display = 'none';
    const autosave = document.getElementById('pub-autosave');
    if (autosave)
        autosave.style.visibility = 'hidden';
    const qualBar = document.getElementById('pub-quality-bar');
    if (qualBar)
        qualBar.style.display = 'none';
    showToast(pubIsSaleMode() && pubIsRentMode() ? 'Equipo publicado para alquiler y venta' : pubIsSaleMode() ? 'Equipo publicado para venta' : 'Equipo publicado para alquiler', 'success');
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
};
document.addEventListener('DOMContentLoaded', function () {
    pubSetupListingModeUI();
});
// Register publicar hook via central system (see _showScreenHooks at end of file)
document.addEventListener('DOMContentLoaded', function () {
    onShowScreen(function (id) {
        if (id === 'publicar') {
            pubSetupListingModeUI();
            const hdr = document.getElementById('pub-prog-hdr');
            if (hdr)
                hdr.style.display = 'flex';
            if (pubState.step > TOTAL_STEPS)
                pubGoStep(1);
        }
    });
});

// ═══════════════════════════════════════════════════════════════
// NEXUSERVICE — REGISTRO DE TÉCNICO
// ═══════════════════════════════════════════════════════════════

const TECH_SPECIALTIES = [
    { key: 'mecanica',   label: 'Mecánica agrícola',       icon: 'fa-wrench' },
    { key: 'electricidad', label: 'Electricidad',          icon: 'fa-bolt' },
    { key: 'electronica',  label: 'Electrónica',           icon: 'fa-microchip' },
    { key: 'hidraulica',   label: 'Hidráulica',            icon: 'fa-oil-can' },
    { key: 'motores',      label: 'Motores diesel',        icon: 'fa-engine' },
    { key: 'gps',          label: 'GPS y ag. de precisión', icon: 'fa-satellite-dish' },
    { key: 'drones',       label: 'Drones agrícolas',      icon: 'fa-helicopter' },
    { key: 'soldadura',    label: 'Soldadura',             icon: 'fa-fire-flame-simple' },
    { key: 'mantenimiento', label: 'Mantenimiento general', icon: 'fa-screwdriver-wrench' },
];

const TECH_COVERAGE = [
    { key: 'local',      label: 'Local',      desc: 'Hasta ~30 km' },
    { key: 'regional',   label: 'Regional',   desc: 'Hasta ~100 km' },
    { key: 'provincial', label: 'Provincial', desc: 'Toda la provincia' },
    { key: 'nacional',   label: 'Nacional',   desc: 'Todo el país' },
];

let techWizardStep = 1;
const TECH_WIZARD_STEPS = 3;

let techFormData = {
    nombre: '', especialidadPrincipal: '', zona: '', telefono: '', email: '',
    especialidades: [], cobertura: '', aniosExperiencia: '', certificaciones: '', descripcion: '',
};

function isTechRegistered() {
    try {
        return !!JSON.parse(localStorage.getItem('agronex_tech_profile') || 'null');
    } catch (e) { return false; }
}

function getTechProfile() {
    try {
        return JSON.parse(localStorage.getItem('agronex_tech_profile') || 'null');
    } catch (e) { return null; }
}

function saveTechProfile(data) {
    try {
        const profile = { ...data, id: Date.now(), registeredAt: new Date().toISOString(), verification: 'pending' };
        localStorage.setItem('agronex_tech_profile', JSON.stringify(profile));
        // Inject into service_profiles so the user sees themselves in NexuService
        if (typeof service_profiles !== 'undefined') {
            const existing = service_profiles.findIndex(p => p._isOwner);
            const entry = {
                id: profile.id, _isOwner: true,
                name: profile.nombre,
                specialty: profile.especialidadPrincipal,
                category: TECH_SPECIALTIES.find(s => s.key === profile.especialidades[0])?.label || 'Mecanica general',
                location: profile.zona,
                distanceKm: 0,
                experienceYears: parseInt(profile.aniosExperiencia, 10) || 0,
                rating: 5.0, reviews: 0,
                verification: 'pending', fastResponse: false, topRated: false, certified: !!profile.certificaciones,
                description: profile.descripcion || `Técnico especializado en ${profile.especialidadPrincipal}.`,
                certifications: profile.certificaciones ? profile.certificaciones.split(',').map(s => s.trim()).filter(Boolean) : [],
                coverage: profile.zona, machines: [], jobs: [],
            };
            if (existing >= 0) service_profiles[existing] = entry;
            else service_profiles.unshift(entry);
        }
    } catch (e) { console.warn('[Agronex]', e); }
}

function techEsc(v) {
    return String(v || '').replace(/[&<>"']/g, ch => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[ch]));
}

// ── Modal render ──────────────────────────────────────────────

function renderTechWizardStep() {
    const body  = document.getElementById('tech-wizard-body');
    const label = document.getElementById('tech-wizard-step-label');
    const backBtn = document.getElementById('tech-wizard-back');
    const nextBtn = document.getElementById('tech-wizard-next');
    if (!body) return;

    if (label) label.textContent = `Paso ${techWizardStep} de ${TECH_WIZARD_STEPS}`;
    if (backBtn) backBtn.style.display = techWizardStep > 1 ? '' : 'none';
    if (nextBtn) nextBtn.textContent = techWizardStep === TECH_WIZARD_STEPS ? 'Registrarme ✓' : 'Siguiente →';

    // Progress dots
    const dots = document.querySelectorAll('#tech-wizard-dots .tech-dot');
    dots.forEach((d, i) => {
        d.classList.remove('active', 'done');
        if (i + 1 === techWizardStep) d.classList.add('active');
        else if (i + 1 < techWizardStep) d.classList.add('done');
    });

    if (techWizardStep === 1) {
        body.innerHTML = `
          <div class="tech-section-title"><i class="fas fa-user-tie"></i> Información profesional</div>
          <div class="tech-field-group">
            <label class="tech-label">Nombre profesional <span class="pub-required"></span></label>
            <input class="pub-input" id="tech-nombre" type="text" placeholder="Ej: Juan Martínez" value="${techEsc(techFormData.nombre)}" oninput="techFormData.nombre=this.value">
            <div class="pub-error-msg" id="tech-err-nombre"><i class="fas fa-exclamation-circle"></i> Campo requerido</div>
          </div>
          <div class="tech-field-group">
            <label class="tech-label">Especialidad principal <span class="pub-required"></span></label>
            <select class="pub-input" id="tech-especialidad" onchange="techFormData.especialidadPrincipal=this.value">
              <option value="">— Seleccioná una —</option>
              ${TECH_SPECIALTIES.map(s => `<option value="${techEsc(s.label)}" ${techFormData.especialidadPrincipal === s.label ? 'selected' : ''}>${techEsc(s.label)}</option>`).join('')}
            </select>
            <div class="pub-error-msg" id="tech-err-esp"><i class="fas fa-exclamation-circle"></i> Seleccioná una especialidad</div>
          </div>
          <div class="tech-grid-2">
            <div class="tech-field-group">
              <label class="tech-label">Zona de trabajo <span class="pub-required"></span></label>
              <input class="pub-input" id="tech-zona" type="text" placeholder="Ej: Rosario, Santa Fe" value="${techEsc(techFormData.zona)}" oninput="techFormData.zona=this.value">
              <div class="pub-error-msg" id="tech-err-zona"><i class="fas fa-exclamation-circle"></i> Campo requerido</div>
            </div>
            <div class="tech-field-group">
              <label class="tech-label">Teléfono <span class="pub-required"></span></label>
              <input class="pub-input" id="tech-telefono" type="tel" placeholder="Ej: +54 341 555-0000" value="${techEsc(techFormData.telefono)}" oninput="techFormData.telefono=this.value">
              <div class="pub-error-msg" id="tech-err-tel"><i class="fas fa-exclamation-circle"></i> Campo requerido</div>
            </div>
          </div>
          <div class="tech-field-group">
            <label class="tech-label">Email de contacto <span class="pub-required"></span></label>
            <input class="pub-input" id="tech-email" type="email" placeholder="tu@email.com" value="${techEsc(techFormData.email)}" oninput="techFormData.email=this.value">
            <div class="pub-error-msg" id="tech-err-email"><i class="fas fa-exclamation-circle"></i> Ingresá un email válido</div>
          </div>`;
    }

    if (techWizardStep === 2) {
        body.innerHTML = `
          <div class="tech-section-title"><i class="fas fa-tags"></i> Especialidades y cobertura</div>
          <div class="tech-field-group">
            <label class="tech-label">Especialidades que ofrecés <span class="pub-required"></span></label>
            <div class="tech-specialty-grid">
              ${TECH_SPECIALTIES.map(s => `
                <button type="button" class="tech-specialty-chip ${techFormData.especialidades.includes(s.key) ? 'active' : ''}"
                  onclick="techToggleSpecialty('${s.key}',this)">
                  <i class="fas ${s.icon}"></i> ${techEsc(s.label)}
                </button>`).join('')}
            </div>
            <div class="pub-error-msg" id="tech-err-specs"><i class="fas fa-exclamation-circle"></i> Seleccioná al menos una especialidad</div>
          </div>
          <div class="tech-field-group">
            <label class="tech-label">Radio de cobertura <span class="pub-required"></span></label>
            <div class="tech-coverage-grid">
              ${TECH_COVERAGE.map(c => `
                <button type="button" class="tech-coverage-btn ${techFormData.cobertura === c.key ? 'active' : ''}"
                  onclick="techSelectCoverage('${c.key}',this)">
                  <span class="tech-coverage-name">${techEsc(c.label)}</span>
                  <span class="tech-coverage-desc">${techEsc(c.desc)}</span>
                  <span class="pub-service-check"><i class="fas fa-check"></i></span>
                </button>`).join('')}
            </div>
            <div class="pub-error-msg" id="tech-err-cov"><i class="fas fa-exclamation-circle"></i> Seleccioná tu radio de cobertura</div>
          </div>`;
    }

    if (techWizardStep === 3) {
        body.innerHTML = `
          <div class="tech-section-title"><i class="fas fa-medal"></i> Experiencia y presentación</div>
          <div class="tech-grid-2">
            <div class="tech-field-group">
              <label class="tech-label">Años de experiencia <span class="pub-required"></span></label>
              <input class="pub-input" id="tech-anios" type="number" min="1" max="50" placeholder="Ej: 8" value="${techEsc(techFormData.aniosExperiencia)}" oninput="techFormData.aniosExperiencia=this.value">
              <div class="pub-error-msg" id="tech-err-anios"><i class="fas fa-exclamation-circle"></i> Campo requerido</div>
            </div>
            <div class="tech-field-group">
              <label class="tech-label">Certificaciones <span class="tech-label-opt">(opcional)</span></label>
              <input class="pub-input" id="tech-certs" type="text" placeholder="Ej: Tecnicatura agromecánica" value="${techEsc(techFormData.certificaciones)}" oninput="techFormData.certificaciones=this.value">
            </div>
          </div>
          <div class="tech-field-group">
            <label class="tech-label">Presentación profesional <span class="pub-required"></span></label>
            <textarea class="pub-textarea" id="tech-desc" rows="4" placeholder="Contale a los productores quién sos, qué máquinas dominás y en qué sos mejor..."
              oninput="techFormData.descripcion=this.value">${techEsc(techFormData.descripcion)}</textarea>
            <div class="pub-error-msg" id="tech-err-desc"><i class="fas fa-exclamation-circle"></i> Escribí una presentación breve</div>
            <div class="tech-char-count" id="tech-char-count"></div>
          </div>
          <div class="tech-preview-card">
            <div class="tech-preview-label"><i class="fas fa-eye"></i> Vista previa de tu perfil</div>
            <div class="tech-preview-inner">
              <div class="service-avatar" style="width:44px;height:44px;font-size:16px;flex-shrink:0;">${techInitials()}</div>
              <div>
                <div style="font-weight:800;font-size:14px;color:var(--text-primary);">${techEsc(techFormData.nombre || 'Tu nombre')}</div>
                <div style="font-size:12px;color:var(--text-secondary);margin-top:2px;">${techEsc(techFormData.especialidadPrincipal || 'Especialidad principal')}</div>
                <div style="font-size:11px;color:var(--text-muted);margin-top:4px;"><i class="fas fa-map-pin" style="font-size:9px;"></i> ${techEsc(techFormData.zona || 'Zona')}</div>
              </div>
            </div>
          </div>`;
        // Attach textarea listener for char count
        const desc = document.getElementById('tech-desc');
        const count = document.getElementById('tech-char-count');
        if (desc && count) {
            const update = () => { count.textContent = `${desc.value.length} / 400 caracteres`; };
            desc.addEventListener('input', update); update();
        }
    }
}

function techInitials() {
    return String(techFormData.nombre || 'TU').split(' ').filter(Boolean).slice(0, 2).map(p => p[0]).join('').toUpperCase();
}

function techToggleSpecialty(key, el) {
    if (techFormData.especialidades.includes(key)) {
        techFormData.especialidades = techFormData.especialidades.filter(k => k !== key);
        el.classList.remove('active');
    } else {
        techFormData.especialidades.push(key);
        el.classList.add('active');
    }
}

function techSelectCoverage(key, el) {
    techFormData.cobertura = key;
    document.querySelectorAll('.tech-coverage-btn').forEach(b => b.classList.remove('active'));
    el.classList.add('active');
}

function techValidateStep(step) {
    let ok = true;
    const setErr = (id, show) => {
        const el = document.getElementById(id);
        if (el) el.classList.toggle('show', show);
        if (show) ok = false;
    };
    if (step === 1) {
        setErr('tech-err-nombre', !techFormData.nombre.trim());
        setErr('tech-err-esp',    !techFormData.especialidadPrincipal);
        setErr('tech-err-zona',   !techFormData.zona.trim());
        setErr('tech-err-tel',    !techFormData.telefono.trim());
        const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(techFormData.email);
        setErr('tech-err-email', !emailOk);
    }
    if (step === 2) {
        setErr('tech-err-specs', techFormData.especialidades.length === 0);
        setErr('tech-err-cov',   !techFormData.cobertura);
    }
    if (step === 3) {
        const anios = parseInt(techFormData.aniosExperiencia, 10);
        setErr('tech-err-anios', isNaN(anios) || anios < 1);
        setErr('tech-err-desc',  !techFormData.descripcion.trim() || techFormData.descripcion.trim().length < 20);
    }
    return ok;
}

function techWizardNext() {
    if (!techValidateStep(techWizardStep)) return;
    if (techWizardStep < TECH_WIZARD_STEPS) {
        techWizardStep++;
        renderTechWizardStep();
    } else {
        techSubmitProfile();
    }
}

function techWizardBack() {
    if (techWizardStep > 1) {
        techWizardStep--;
        renderTechWizardStep();
    }
}

function techSubmitProfile() {
    saveTechProfile({ ...techFormData });
    closeTechRegisterModal();
    // Refresh the pub-mode-block so the button updates
    const modeBlock = document.getElementById('pub-mode-block');
    if (modeBlock) { modeBlock.remove(); pubSetupListingModeUI(); }
    showToast('¡Perfil técnico creado! Aparecerás en NexuService mientras validamos tu perfil.', 'success');
}

// ── Modal DOM — auto-creado si no existe (no depende de index.html) ──────────

function ensureTechModal() {
    if (document.getElementById('tech-register-modal')) return;
    const div = document.createElement('div');
    div.innerHTML = `
<div id="tech-register-modal" class="modal-overlay" style="display:none;" onclick="closeTechRegisterModal(event)">
  <div class="modal-card" style="max-width:560px;width:100%;max-height:92vh;overflow:hidden;display:flex;flex-direction:column;border-radius:20px;" onclick="event.stopPropagation()">
    <div class="tech-wizard-hdr">
      <div class="tech-wizard-hdr-icon"><i class="fas fa-screwdriver-wrench"></i></div>
      <div style="flex:1;min-width:0;">
        <div class="tech-wizard-title" id="tech-wizard-title">Registrarme como técnico</div>
        <div class="tech-wizard-sub" id="tech-wizard-step-label">Paso 1 de 3</div>
      </div>
      <div class="tech-wizard-dots" id="tech-wizard-dots">
        <div class="tech-dot active"></div>
        <div class="tech-dot"></div>
        <div class="tech-dot"></div>
      </div>
      <button class="modal-close" onclick="closeTechRegisterModal()" style="margin-left:8px;flex-shrink:0;"><i class="fas fa-times"></i></button>
    </div>
    <div class="modal-body" id="tech-wizard-body" style="overflow-y:auto;flex:1;padding:0 20px 8px;"></div>
    <div class="tech-wizard-footer">
      <button class="btn btn-ghost" id="tech-wizard-back" onclick="techWizardBack()" style="display:none;"><i class="fas fa-arrow-left"></i> Atrás</button>
      <button class="btn btn-primary" id="tech-wizard-next" onclick="techWizardNext()" style="margin-left:auto;">Siguiente <i class="fas fa-arrow-right"></i></button>
    </div>
  </div>
</div>`;
    document.body.appendChild(div.firstElementChild);
}

// ── Open / Close ──────────────────────────────────────────────

function openTechRegisterModal() {
    ensureTechModal(); // garantiza que el DOM existe antes de usarlo
    techWizardStep = 1;
    // Pre-fill from existing profile if editing
    const existing = getTechProfile();
    if (existing) {
        techFormData = {
            nombre: existing.nombre || '', especialidadPrincipal: existing.especialidadPrincipal || '',
            zona: existing.zona || '', telefono: existing.telefono || '', email: existing.email || '',
            especialidades: existing.especialidades || [], cobertura: existing.cobertura || '',
            aniosExperiencia: String(existing.aniosExperiencia || ''), certificaciones: existing.certificaciones || '',
            descripcion: existing.descripcion || '',
        };
    } else {
        techFormData = {
            nombre: '', especialidadPrincipal: '', zona: '', telefono: '', email: '',
            especialidades: [], cobertura: '', aniosExperiencia: '', certificaciones: '', descripcion: '',
        };
    }
    const modal = document.getElementById('tech-register-modal');
    const title = document.getElementById('tech-wizard-title');
    if (title) title.textContent = isTechRegistered() ? 'Gestionar perfil técnico' : 'Registrarme como técnico';
    if (modal) modal.style.display = 'flex';
    renderTechWizardStep();
}

function openTechManageModal() {
    openTechRegisterModal();
}

function closeTechRegisterModal(e) {
    if (!e || e.target.id === 'tech-register-modal') {
        const modal = document.getElementById('tech-register-modal');
        if (modal) modal.style.display = 'none';
    }
}
