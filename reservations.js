"use strict";
/* ================================================================
   AGRONEX module: NexuDrive reservations, tracking and rental follow-up
   Extracted from java.js without behavior changes.
================================================================ */

// ---- original java.js lines 831-1621 ----
// ── RESERVAS SCREEN ──────────────────────────────────────────────────────────
function updateReservasBadge() {
    const badge = document.getElementById('tcn-res-badge');
    const subBadge = document.getElementById('sn-res-badge');
    const mobBadge = document.getElementById('reservas-mob-badge');
    const bnBadge = document.getElementById('bn-res-badge');
    [badge, subBadge, mobBadge, bnBadge].forEach(el => {
        if (!el)
            return;
        el.textContent = '';
        el.style.display = 'none';
    });
}
let _reservasFilter = 'activa';
function filterReservas(filter, el) {
    _reservasFilter = filter;
    document.querySelectorAll('.res-filter-chip').forEach(c => {
        c.classList.remove('chip-green', 'active');
        c.classList.add('chip-gray');
    });
    if (el) {
        el.classList.remove('chip-gray');
        el.classList.add('chip-green', 'active');
    }
    renderReservas();
}
// ── TRACKING STATE ──────────────────────────────────────────────────────────
const TRACKING_STEPS = [
    { key: 'reservado', icon: 'fa-check', label: 'Reserva confirmada', sub: 'Tu seña está procesada. WhatsApp desbloqueado.' },
    { key: 'preparando_salida', icon: 'fa-tools', label: 'Preparando salida', sub: 'El equipo se está preparando para el traslado.' },
    { key: 'en_camino', icon: 'fa-route', label: 'En camino', sub: 'El equipo está en traslado hacia tu campo.' },
    { key: 'llegando', icon: 'fa-map-marker-alt', label: 'Llegando', sub: 'Estimado de llegada: próximos 30 minutos.' },
    { key: 'trabajando', icon: 'fa-tractor', label: 'Trabajando', sub: 'El equipo está operando en tu lote.' },
    { key: 'finalizado', icon: 'fa-flag-checkered', label: 'Trabajo finalizado', sub: 'Confirmá recepción para cerrar la reserva.' },
];
const TRACKING_STATUS_MAP = {
    'reservado': 0,
    'pending': 0,
    'confirmed': 0,
    'preparando_salida': 1,
    'en camino': 2,
    'en_camino': 2,
    'transit': 2,
    'llegando': 3,
    'trabajando': 4,
    'active': 4,
    'finalizado': 5,
    'done': 5,
};
function trackingStepIndex(status) {
    var _a;
    return (_a = TRACKING_STATUS_MAP[status]) !== null && _a !== void 0 ? _a : 0;
}
function catEmoji(name) {
    if (!name)
        return '🚜';
    const n = name.toLowerCase();
    if (n.includes('dron'))
        return '🚁';
    if (n.includes('sembradora'))
        return '🌱';
    if (n.includes('cosechadora'))
        return '⚙️';
    if (n.includes('pulverizadora'))
        return '💦';
    return '🚜';
}
function trackingStatusLabel(status) {
    const map = {
        reservado: ['chip-green', 'Reserva confirmada'],
        confirmed: ['chip-green', 'Confirmada'],
        pending: ['chip-amber', 'Pendiente'],
        preparando_salida: ['chip-amber', 'Preparando salida'],
        'en camino': ['chip-amber', '🚛 En camino'],
        en_camino: ['chip-amber', '🚛 En camino'],
        transit: ['chip-amber', '🚛 En camino'],
        llegando: ['chip-amber', '📍 Llegando'],
        trabajando: ['chip-green', '⚙ Trabajando'],
        active: ['chip-green', '⚙ Trabajando'],
        finalizado: ['chip-gray', '✓ Finalizado'],
        done: ['chip-gray', '✓ Finalizado'],
        cancelled: ['chip-red', 'Cancelada'],
        cancelada: ['chip-red', 'Cancelada'],
    };
    return map[status] || ['chip-gray', status || '—'];
}
function trackingProgress(status) {
    const idx = trackingStepIndex(status);
    return Math.round((idx / (TRACKING_STEPS.length - 1)) * 100);
}
function etaForStatus(status) {
    const map = {
        preparando_salida: '~2 horas',
        'en camino': '~45 min',
        en_camino: '~45 min',
        llegando: '~25 min',
    };
    return map[status] || null;
}
// ── Render reservation live card ───────────────────────────────────────────
function buildResLiveCard(b) {
    const machineId = b.machineId || b.id;
    const machineName = b.machineName || b.machineTitle || b.title || '—';
    const service = b.service || b.selectedService || '—';
    const ha = b.hectares ? `${b.hectares} ha` : '—';
    const status = b.status || 'reservado';
    const [chipCls, chipLabel] = trackingStatusLabel(status);
    const emoji = catEmoji(machineName);
    const progress = trackingProgress(status);
    const isTransit = ['en camino', 'en_camino', 'llegando', 'transit'].includes(status);
    const isWorking = ['trabajando', 'active'].includes(status);
    const deposit = b.payNow
        ? (typeof fmtCalcCurrency === 'function' ? fmtCalcCurrency(b.payNow) : '$' + Math.round(b.payNow))
        : '—';
    const dateStr = (b.fecha || b.date)
        ? new Date((b.fecha || b.date) + 'T12:00:00').toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' })
        : '—';
    const cardBorder = isTransit ? 'res-card-transit' : (isWorking ? 'res-card-active' : '');
    const eta = etaForStatus(status);
    return `
  <div class="res-live-card ${cardBorder}">
    <div class="res-live-card-header">
      <div class="res-live-emoji">${emoji}</div>
      <div class="res-live-info">
        <div class="res-live-title">${machineName}</div>
        <div class="res-live-meta">${service}${b.lote ? ' · ' + b.lote : ''}</div>
      </div>
      <span class="chip ${chipCls}" style="flex-shrink:0;">${chipLabel}</span>
    </div>

    ${eta ? `
    <div style="padding:6px 16px 8px;background:var(--amber-50);border-top:1px solid var(--amber-200);">
      <div style="display:flex;align-items:center;gap:8px;">
        <i class="fas fa-clock" style="color:var(--amber-400);font-size:13px;"></i>
        <span style="font-size:12px;font-weight:700;color:var(--amber-600);">ETA:</span>
        <span style="font-size:13px;font-weight:800;font-family:var(--font-display);color:var(--amber-400);">${eta}</span>
      </div>
    </div>` : ''}

    <div class="res-progress-track">
      <div class="res-progress-fill ${isTransit ? 'amber' : ''}" style="width:${progress}%;"></div>
    </div>

    <div class="res-live-status-row">
      <span style="font-size:11px;color:var(--text-muted);font-weight:600;text-transform:uppercase;letter-spacing:.4px;">
        Paso ${Math.min(trackingStepIndex(status) + 1, TRACKING_STEPS.length)} de ${TRACKING_STEPS.length}:
      </span>
      <span style="font-size:12px;font-weight:600;color:var(--text-primary);">
        ${TRACKING_STEPS[Math.min(trackingStepIndex(status), TRACKING_STEPS.length - 1)].label}
      </span>
    </div>

    <div class="res-live-grid">
      <div><div class="res-live-detail-lbl">Fecha</div><div class="res-live-detail-val">${dateStr}</div></div>
      <div><div class="res-live-detail-lbl">Hectáreas</div><div class="res-live-detail-val">${ha}</div></div>
      <div><div class="res-live-detail-lbl">Reserva ID</div><div class="res-live-detail-val" style="font-size:11px;font-family:var(--font-mono);">${b.id || '—'}</div></div>
      <div><div class="res-live-detail-lbl">Seña pagada</div><div class="res-live-detail-val" style="color:var(--accent);">${deposit}</div></div>
    </div>

    <div class="res-live-footer">
      <div class="res-live-price">${deposit}</div>
      <div class="res-live-actions">
        <button class="btn btn-ghost btn-xs res-action-btn" onclick="openTrackingModal(${machineId})" title="Ver seguimiento">
          <i class="fas fa-route"></i> Seguimiento
        </button>
        <button class="btn btn-xs res-action-btn res-whatsapp-btn" onclick="openWAModal(${machineId})" title="Contactar por WhatsApp">
          <i class="fab fa-whatsapp"></i> Contactar por WhatsApp
        </button>
        <button class="btn btn-ghost btn-xs res-action-btn" onclick="openReportListingModal('rental',${machineId},event)" title="Denunciar oferta">
          <i class="fas fa-flag"></i> Denunciar
        </button>
      </div>
    </div>
  </div>`;
}
// ── Build demo stages for simulate button ──────────────────────────────────
function advanceBookingStatus(machineId) {
    var _a;
    const b = getBooking(machineId);
    if (!b)
        return;
    const order = ['reservado', 'preparando_salida', 'en_camino', 'llegando', 'trabajando', 'finalizado'];
    const cur = (_a = order.indexOf(b.status.replace(' ', '_'))) !== null && _a !== void 0 ? _a : 0;
    b.status = order[Math.min(cur + 1, order.length - 1)];
    saveBookings();
    renderReservas();
    selectMarket(machineId);
    const [, label] = trackingStatusLabel(b.status);
    showToast(`Estado actualizado: ${label}`, 'success');
}
// ── renderReservas ─────────────────────────────────────────────────────────
function renderReservas() {
    updateReservasBadge();
    const allBookings = Object.values(nexuDriveBookings).filter(Boolean);
    const DONE_STATUSES = new Set(['finalizado', 'done', 'cancelled', 'cancelada']);
    const filterFn = {
        'activa': b => !DONE_STATUSES.has(b.status),
        'todas': b => true,
        'en-camino': b => ['en camino', 'en_camino', 'transit', 'llegando'].includes(b.status),
        'historial': b => DONE_STATUSES.has(b.status),
        'cancelada': b => ['cancelled', 'cancelada'].includes(b.status),
    }[_reservasFilter] || (() => true);
    const shown = allBookings.filter(filterFn);
    // Metrics
    const activas = allBookings.filter(b => !DONE_STATUSES.has(b.status)).length;
    const pendientes = allBookings.filter(b => ['pending', 'reservado', 'confirmed'].includes(b.status)).length;
    const totalPaid = allBookings.reduce((s, b) => s + (b.payNow || 0), 0);
    const el = id => document.getElementById(id);
    if (el('res-count-activas'))
        el('res-count-activas').textContent = activas;
    if (el('res-count-pendientes'))
        el('res-count-pendientes').textContent = pendientes;
    if (el('res-total-pagado'))
        el('res-total-pagado').textContent = totalPaid > 0
            ? (typeof fmtCalcCurrency === 'function' ? fmtCalcCurrency(totalPaid) : 'USD ' + Math.round(totalPaid))
            : '—';
    const emptyEl = el('reservas-empty');
    const liveList = el('reservas-live-list');
    const tableWrap = el('reservas-table-wrap');
    const cardsList = el('reservas-cards-list');
    if (!shown.length) {
        if (emptyEl)
            emptyEl.style.display = '';
        if (liveList)
            liveList.style.display = 'none';
        if (tableWrap)
            tableWrap.style.display = 'none';
        if (cardsList)
            cardsList.style.display = 'none';
        renderCalendarSection([]);
        return;
    }
    if (emptyEl)
        emptyEl.style.display = 'none';
    // Live cards — always shown
    if (liveList) {
        liveList.style.display = '';
        liveList.innerHTML = shown.map(b => buildResLiveCard(b)).join('');
    }
    if (tableWrap)
        tableWrap.style.display = 'none';
    if (cardsList)
        cardsList.style.display = 'none';
    renderCalendarSection(shown);
    updateReservasBadge();
}
function renderCalendarSection(shown) {
    const section = document.getElementById('reservas-calendar-section');
    const calEmpty = document.getElementById('reservas-calendar-empty');
    const calList = document.getElementById('reservas-calendar-list');
    if (section)
        section.style.display = 'none';
    if (calEmpty)
        calEmpty.style.display = 'none';
    if (calList) {
        calList.style.display = 'none';
        calList.innerHTML = '';
    }
    return;
    const upcoming = shown.filter(b => b.fecha || b.date).slice(0, 4);
    if (!upcoming.length) {
        if (calEmpty)
            calEmpty.style.display = '';
        if (calList)
            calList.style.display = 'none';
        return;
    }
    if (calEmpty)
        calEmpty.style.display = 'none';
    if (calList) {
        calList.style.display = '';
        calList.innerHTML = upcoming.map(b => {
            const d = b.fecha || b.date;
            const dateStr = d ? new Date(d + 'T12:00:00').toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' }) : '—';
            const name = b.machineName || b.machineTitle || b.title || '—';
            const lote = b.lote ? ` · ${b.lote}` : '';
            const [chipCls, chipLabel] = trackingStatusLabel(b.status || 'reservado');
            return `<div style="display:flex;align-items:center;gap:12px;padding:12px 20px;border-bottom:1px solid var(--border);">
        <div style="width:44px;height:44px;border-radius:var(--r-md);background:var(--accent-light);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
          <i class="fas fa-tractor" style="color:var(--accent);font-size:18px;"></i>
        </div>
        <div style="flex:1;min-width:0;">
          <div style="font-size:13px;font-weight:600;margin-bottom:2px;">${name}${lote}</div>
          <div style="font-size:12px;color:var(--text-muted);"><i class="fas fa-calendar" style="font-size:10px;margin-right:3px;"></i>${dateStr}</div>
        </div>
        <span class="chip ${chipCls}" style="font-size:10px;flex-shrink:0;">${chipLabel}</span>
      </div>`;
        }).join('');
    }
}
// ── TRACKING MODAL ──────────────────────────────────────────────────────────
let _trackingMachineId = null;
function openTrackingModal(machineId) {
    const m = marketData.find(x => x.id === machineId);
    const b = getBooking(machineId);
    if (!m || !b) {
        showToast('No se encontró la reserva.', 'warning');
        return;
    }
    _trackingMachineId = machineId;
    const status = b.status || 'reservado';
    const stepIdx = trackingStepIndex(status);
    const [chipCls, chipLabel] = trackingStatusLabel(status);
    const eta = etaForStatus(status);
    const emoji = catEmoji(m.title);
    // Title
    const titleEl = document.getElementById('tracking-modal-title');
    if (titleEl)
        titleEl.innerHTML = `<i class="fas fa-route" style="color:var(--accent);margin-right:8px;"></i> Seguimiento`;
    const subEl = document.getElementById('tracking-modal-sub');
    if (subEl)
        subEl.textContent = `Reserva ${b.id || '—'}`;
    // Header
    const emojiEl = document.getElementById('tracking-emoji');
    if (emojiEl)
        emojiEl.textContent = emoji;
    const nameEl = document.getElementById('tracking-machine-name');
    if (nameEl)
        nameEl.textContent = m.title;
    const metaEl = document.getElementById('tracking-machine-meta');
    if (metaEl)
        metaEl.textContent = `${b.service || '—'} · ${b.hectares ? b.hectares + ' ha' : '—'}${b.lote ? ' · ' + b.lote : ''}`;
    const statusEl = document.getElementById('tracking-status-chip');
    if (statusEl)
        statusEl.innerHTML = `<span class="chip ${chipCls}">${chipLabel}</span>`;
    // ETA
    const etaBanner = document.getElementById('tracking-eta-banner');
    const etaValue = document.getElementById('tracking-eta-value');
    if (etaBanner && etaValue) {
        etaBanner.style.display = eta ? 'flex' : 'none';
        if (eta)
            etaValue.textContent = eta;
    }
    // Timeline
    const timelineEl = document.getElementById('tracking-timeline');
    if (timelineEl) {
        timelineEl.innerHTML = TRACKING_STEPS.map((step, i) => {
            let dotClass = 'pending';
            let labelClass = 'pending';
            let timeTxt = '';
            let isDoneLine = false;
            if (i < stepIdx) {
                dotClass = 'done';
                labelClass = 'done';
                isDoneLine = true;
            }
            if (i === stepIdx) {
                dotClass = 'active';
                labelClass = 'active';
                timeTxt = 'Ahora';
            }
            if (i === 0 && stepIdx > 0)
                timeTxt = 'Completado';
            return `<div class="tracking-timeline-step ${isDoneLine ? 'done-line' : ''}">
        <div class="tracking-step-dot ${dotClass}">
          <i class="fas ${step.icon}" style="font-size:13px;"></i>
        </div>
        <div class="tracking-step-text">
          <div class="tracking-step-label ${labelClass}">${step.label}</div>
          <div class="tracking-step-sub">${i <= stepIdx ? step.sub : ''}</div>
        </div>
        ${timeTxt ? `<div class="tracking-step-time">${timeTxt}</div>` : ''}
      </div>`;
        }).join('');
    }
    const infoGrid = document.getElementById('tracking-booking-info');
    if (infoGrid) {
        const dateStr = (b.fecha || b.date)
            ? new Date((b.fecha || b.date) + 'T12:00:00').toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })
            : 'A coordinar';
        const deposit = b.payNow
            ? (typeof fmtCalcCurrency === 'function' ? fmtCalcCurrency(b.payNow) : '$' + Math.round(b.payNow))
            : '—';
        infoGrid.innerHTML = [
            ['Fecha', dateStr],
            ['Hectáreas', b.hectares ? b.hectares + ' ha' : '—'],
            ['Seña pagada', deposit],
            ['Operario', m.operario ? 'Incluido' : 'Sin operario'],
        ].map(([l, v]) => `
      <div>
        <div class="res-live-detail-lbl">${l}</div>
        <div class="res-live-detail-val">${v}</div>
      </div>`).join('');
    }
    // WA button label
    const waLabel = document.getElementById('tracking-wa-label');
    if (waLabel) {
        if (WA_FOLLOWUP_STATUSES.has(status)) {
            waLabel.textContent = 'Avisar estado del trabajo';
        }
        else {
            waLabel.textContent = 'Coordinar por WhatsApp';
        }
    }
    // Simulate next state button (dev helper visible to user — premium feel)
    const footer = document.querySelector('#tracking-modal .modal-footer');
    if (footer) {
        const existingBtn = footer.querySelector('.tracking-advance-btn');
        if (existingBtn)
            existingBtn.remove();
        if (status !== 'finalizado' && status !== 'cancelled') {
            const advBtn = document.createElement('button');
            advBtn.className = 'btn btn-ghost btn-sm w-full tracking-advance-btn';
            advBtn.style.cssText = 'font-size:11px;color:var(--text-muted);';
            advBtn.innerHTML = `<i class="fas fa-forward"></i> Simular siguiente estado (demo)`;
            advBtn.onclick = () => advanceBookingStatus(machineId);
            footer.insertBefore(advBtn, footer.lastElementChild);
        }
    }
    document.getElementById('tracking-modal').style.display = 'flex';
}
function closeTrackingModal(e) {
    if (!e || e.target.id === 'tracking-modal') {
        document.getElementById('tracking-modal').style.display = 'none';
        _trackingMachineId = null;
    }
}
function sendTrackingWAMessage() {
    if (!_trackingMachineId)
        return;
    const m = marketData.find(x => x.id === _trackingMachineId);
    const b = getBooking(_trackingMachineId);
    if (!m || !b)
        return;
    const operName = m.operario && typeof m.operario === 'string' ? m.operario.split(' ')[0] : '';
    const msg = buildFollowUpMessage(m.title, operName, b, null);
    const phone = b.providerPhone || '5491112345678';
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
    closeTrackingModal();
    showToast('Abriendo WhatsApp — mensaje de seguimiento enviado', 'success');
}
// ── BOOKING STEPS MODAL ──────────────────────────────────────────────────────
let _bstepMarket = null;
let _bstepData = {};
let _bstepCurrent = 1;
const BSTEP_TOTAL = 5;
const BSTEP_LABELS = ['Servicio', 'Fecha', 'Ubicación', 'Hectáreas', 'Revisar'];
function openBookingStepsModal(marketId) {
    const m = marketData.find(x => x.id === marketId);
    if (!m)
        return;
    if (!checkMachineAvailability(m)) {
        showToast('Este equipo no tiene disponibilidad en este momento.', 'warning');
        return;
    }
    _bstepMarket = m;
    _bstepData = {
        nombre: typeof buildFullName === 'function' ? buildFullName() : '',
        service: (m.serviceOptions || ['Solo maquinaria'])[0],
        fecha: '',
        lote: '',
        ha: '',
        trabajo: '',
    };
    _bstepCurrent = 1;
    const nameEl = document.getElementById('bstep-machine-name');
    if (nameEl)
        nameEl.textContent = `${m.title} · ${m.price}`;
    renderBstep();
    document.getElementById('booking-steps-modal').style.display = 'flex';
}
function closeBookingStepsModal(e) {
    if (!e || e.target.id === 'booking-steps-modal') {
        document.getElementById('booking-steps-modal').style.display = 'none';
    }
}
function renderBstepIndicators() {
    document.querySelectorAll('.bstep-ind').forEach((el, i) => {
        const stepNum = i + 1;
        el.classList.remove('active', 'done');
        if (stepNum < _bstepCurrent)
            el.classList.add('done');
        if (stepNum === _bstepCurrent)
            el.classList.add('active');
    });
    document.querySelectorAll('.bstep-line').forEach((el, i) => {
        el.classList.toggle('done', i < _bstepCurrent - 1);
    });
    const lbl = document.getElementById('bstep-label');
    if (lbl)
        lbl.textContent = BSTEP_LABELS[_bstepCurrent - 1] || '';
    const backBtn = document.getElementById('bstep-back-btn');
    if (backBtn)
        backBtn.style.display = _bstepCurrent > 1 ? '' : 'none';
    const nextBtn = document.getElementById('bstep-next-btn');
    if (nextBtn) {
        if (_bstepCurrent === BSTEP_TOTAL) {
            nextBtn.innerHTML = '<i class="fas fa-lock"></i> Pagar y confirmar';
        }
        else {
            nextBtn.innerHTML = 'Siguiente <i class="fas fa-arrow-right"></i>';
        }
    }
}
function renderBstep() {
    renderBstepIndicators();
    const body = document.getElementById('bstep-body');
    if (!body || !_bstepMarket)
        return;
    const m = _bstepMarket;
    if (_bstepCurrent === 1) {
        const opts = serviceOptionsFor(m);
        body.innerHTML = `
      <div style="padding:4px 0 8px;">
        <div class="form-label" style="margin-bottom:10px;">¿Qué modalidad necesitás?</div>
        <div class="urgency-selector" id="bstep-service-opts">
          ${opts.map((o, i) => `<button class="urgency-btn ${i === 0 ? 'active normal' : ''}" onclick="bstepSelectService('${o}',this)">${o}</button>`).join('')}
        </div>
        ${m.area ? `<div style="margin-top:16px;padding:12px;background:var(--bg-secondary);border-radius:var(--r-md);">
          <div style="font-size:11px;color:var(--text-muted);text-transform:uppercase;font-weight:700;letter-spacing:.4px;margin-bottom:4px;">Equipo</div>
          <div style="font-size:13px;font-weight:600;">${m.title}</div>
          <div style="font-size:12px;color:var(--text-muted);margin-top:2px;"><i class="fas fa-map-pin" style="font-size:10px;"></i> ${m.area} · ${m.dist}</div>
          <div style="font-size:13px;color:var(--accent);font-weight:700;margin-top:4px;">${m.price}</div>
        </div>` : ''}
      </div>`;
    }
    else if (_bstepCurrent === 2) {
        body.innerHTML = `
      <div style="padding:4px 0 8px;">
        <div class="form-group">
          <label class="form-label">Fecha estimada del trabajo</label>
          <input class="form-input" type="date" id="bstep-fecha" value="${_bstepData.fecha}"
            min="${new Date().toISOString().split('T')[0]}"
            oninput="bstepSave('fecha',this.value)">
        </div>
        <div class="form-group" style="margin-top:12px;">
          <label class="form-label">¿Qué trabajo necesitás?</label>
          <input class="form-input" type="text" id="bstep-trabajo" value="${_bstepData.trabajo}"
            placeholder="Ej: Siembra de soja" oninput="bstepSave('trabajo',this.value)">
        </div>
        <div style="margin-top:12px;padding:10px 14px;background:var(--accent-light);border-radius:var(--r-md);font-size:12px;color:var(--green-600);">
          <i class="fas fa-info-circle" style="margin-right:4px;"></i>
          La disponibilidad del equipo es <strong>${m.avail}</strong>.
        </div>
      </div>`;
    }
    else if (_bstepCurrent === 3) {
        body.innerHTML = `
      <div style="padding:4px 0 8px;">
        <div class="form-group">
          <label class="form-label">Lote / Ubicación del trabajo</label>
          <input class="form-input" type="text" id="bstep-lote" value="${_bstepData.lote}"
            placeholder="Ej: Lote 12 — Pergamino, BA"
            oninput="bstepSave('lote',this.value)">
        </div>
        <div style="margin-top:12px;padding:12px;background:var(--bg-secondary);border-radius:var(--r-md);">
          <div style="font-size:11px;color:var(--text-muted);text-transform:uppercase;font-weight:700;letter-spacing:.4px;margin-bottom:6px;">
            <i class="fas fa-route" style="margin-right:4px;"></i>Traslado estimado
          </div>
          <div style="font-size:13px;font-weight:600;">${m.area} → Tu campo</div>
          <div style="font-size:12px;color:var(--text-muted);margin-top:2px;">Distancia base: ${m.dist}</div>
        </div>
      </div>`;
    }
    else if (_bstepCurrent === 4) {
        const priceHa = servicePriceFor(m, _bstepData.service);
        const haNum = parseFloat(_bstepData.ha) || 0;
        const total = haNum * priceHa;
        body.innerHTML = `
      <div style="padding:4px 0 8px;">
        <div class="form-group">
          <label class="form-label">Hectáreas a trabajar</label>
          <div class="input-group has-suffix">
            <input class="form-input" type="number" id="bstep-ha" value="${_bstepData.ha}"
              min="1" placeholder="Ej: 80" oninput="bstepSave('ha',this.value);updateBstepTotal()">
            <span class="input-suffix">ha</span>
          </div>
        </div>
        <div id="bstep-total-preview" style="margin-top:12px;padding:14px;background:var(--bg-secondary);border-radius:var(--r-md);">
          ${haNum > 0 ? `
          <div style="display:flex;justify-content:space-between;margin-bottom:6px;font-size:12px;color:var(--text-muted);">
            <span>Gasto total estimado</span><span>${fmtUSDPlain(total)}</span>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:14px;font-weight:700;color:var(--accent);">
            <span>Seña ahora (20%)</span><span>${fmtUSDPlain(total * 0.2)}</span>
          </div>` : `<div style="text-align:center;color:var(--text-muted);font-size:13px;">Ingresá las hectáreas para ver el resumen.</div>`}
        </div>
      </div>`;
    }
    else if (_bstepCurrent === 5) {
        const amounts = calcBookingAmounts(m, _bstepData.service, _bstepData.ha);
        const dateStr = _bstepData.fecha
            ? new Date(_bstepData.fecha + 'T12:00:00').toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })
            : 'A coordinar';
        body.innerHTML = `
      <div style="padding:4px 0 8px;">
        <div style="padding:14px;background:var(--accent-light);border-radius:var(--r-md);margin-bottom:14px;border:1px solid var(--green-100);">
          <div style="font-size:13px;font-weight:700;color:var(--green-800);margin-bottom:8px;">📋 Resumen de tu reserva</div>
          <div style="display:flex;flex-direction:column;gap:6px;font-size:13px;">
            <div style="display:flex;justify-content:space-between;"><span style="color:var(--green-600);">Equipo</span><span style="font-weight:600;text-align:right;max-width:60%;">${m.title}</span></div>
            <div style="display:flex;justify-content:space-between;"><span style="color:var(--green-600);">Servicio</span><span>${_bstepData.service}</span></div>
            <div style="display:flex;justify-content:space-between;"><span style="color:var(--green-600);">Fecha</span><span>${dateStr}</span></div>
            <div style="display:flex;justify-content:space-between;"><span style="color:var(--green-600);">Ubicación</span><span>${_bstepData.lote || 'A completar'}</span></div>
            <div style="display:flex;justify-content:space-between;"><span style="color:var(--green-600);">Hectáreas</span><span>${amounts.hectares || '—'} ha</span></div>
            <div style="height:1px;background:var(--green-100);margin:4px 0;"></div>
            <div style="display:flex;justify-content:space-between;font-weight:700;font-size:15px;color:var(--green-800);">
              <span>Pagás ahora</span><span>${amounts.hectares ? fmtUSDPlain(amounts.payNow) : '—'}</span>
            </div>
            <div style="font-size:11px;color:var(--green-600);">Incluye seña 20% + comisión Agronex 10%</div>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Medio de pago</label>
          <div class="payment-provider-grid" id="bstep-provider-options">
            <button type="button" class="payment-provider-btn active" onclick="selectPaymentProvider('Mercado Pago',this)"><i class="fas fa-wallet"></i> Mercado Pago</button>
            <button type="button" class="payment-provider-btn" onclick="selectPaymentProvider('Stripe',this)"><i class="fas fa-credit-card"></i> Stripe</button>
          </div>
        </div>
        <div class="payment-terms" style="margin-top:10px;">
          Al confirmar, se reserva la disponibilidad. WhatsApp se desbloquea automáticamente.
        </div>
      </div>`;
    }
}
function bstepSelectService(service, el) {
    _bstepData.service = service;
    el.parentElement.querySelectorAll('.urgency-btn').forEach(b => b.classList.remove('active', 'normal'));
    el.classList.add('active', 'normal');
}
function bstepSave(key, val) {
    _bstepData[key] = val;
}
function updateBstepTotal() {
    const haNum = parseFloat(_bstepData.ha) || 0;
    const priceHa = _bstepMarket ? servicePriceFor(_bstepMarket, _bstepData.service) : 0;
    const total = haNum * priceHa;
    const el = document.getElementById('bstep-total-preview');
    if (!el)
        return;
    el.innerHTML = haNum > 0 ? `
    <div style="display:flex;justify-content:space-between;margin-bottom:6px;font-size:12px;color:var(--text-muted);">
      <span>Gasto total estimado</span><span>${fmtUSDPlain(total)}</span>
    </div>
    <div style="display:flex;justify-content:space-between;font-size:14px;font-weight:700;color:var(--accent);">
      <span>Seña ahora (20%)</span><span>${fmtUSDPlain(total * 0.2)}</span>
    </div>` :
        `<div style="text-align:center;color:var(--text-muted);font-size:13px;">Ingresá las hectáreas.</div>`;
}
function bookingStepNext() {
    if (_bstepCurrent < BSTEP_TOTAL) {
        if (_bstepCurrent === 2) {
            const fechaCheck = validateField(_bstepData.fecha, { required: true, type: 'date' });
            if (!fechaCheck.valid) {
                showToast('Ingresá una fecha para continuar.', 'warning');
                return;
            }
            const trabajoCheck = validateField(_bstepData.trabajo, { required: true, minLength: 3 });
            if (!trabajoCheck.valid) {
                showToast('Indicá el tipo de trabajo.', 'warning');
                return;
            }
            const selectedDate = new Date(`${_bstepData.fecha}T12:00:00`);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (selectedDate < today) {
                showToast('La fecha no puede ser en el pasado.', 'warning');
                return;
            }
        }
        if (_bstepCurrent === 3 && !_bstepData.lote) {
            const body = document.getElementById('bstep-body');
            if (body && !document.getElementById('bstep-lote-hint')) {
                body.insertAdjacentHTML('beforeend', '<div class="pub-field-hint" id="bstep-lote-hint">Podés completar el lote después desde la sección Reservas.</div>');
            }
        }
        if (_bstepCurrent === 4) {
            const haCheck = validateField(_bstepData.ha, { required: true, type: 'number', min: 1, max: 10000 });
            if (!haCheck.valid) {
                const haNum = parseFloat(_bstepData.ha);
                if (Number.isNaN(haNum) || haNum <= 0)
                    showToast('Ingresá un número válido de hectáreas.', 'warning');
                else
                    showToast('El valor máximo es 10.000 ha. Verificá el dato.', 'warning');
                return;
            }
        }
        _bstepCurrent++;
        renderBstep();
    }
    else {
        // Final step: process
        if (!_bstepMarket || !_bstepData.ha) {
            showToast('Ingresá las hectáreas para calcular la reserva.', 'warning');
            return;
        }
        processBookingSteps();
    }
}
function bookingStepBack() {
    if (_bstepCurrent > 1) {
        _bstepCurrent--;
        renderBstep();
    }
}
function processBookingSteps() {
    const m = _bstepMarket;
    if (!m)
        return;
    if (hasPaidReservation(m.id)) {
        showToast('Ya tenés una reserva activa para este equipo.', 'warning');
        return;
    }
    if (!_bstepData.nombre) {
        _bstepData.nombre = (typeof buildFullName === 'function' ? buildFullName() : '').trim() || 'Cliente Agronex';
    }
    const amounts = calcBookingAmounts(m, _bstepData.service, _bstepData.ha);
    const nextBtn = document.getElementById('bstep-next-btn');
    if (nextBtn) {
        nextBtn.disabled = true;
        nextBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando reserva...';
    }
    setTimeout(() => {
        const booking = {
            id: `NXD-${Date.now().toString().slice(-6)}`,
            machineId: m.id,
            machineName: m.title,
            machineTitle: m.title,
            clientName: _bstepData.nombre,
            service: _bstepData.service,
            trabajo: _bstepData.trabajo,
            fecha: _bstepData.fecha,
            lote: _bstepData.lote,
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
        nexuDriveBookings[bookingKey(m.id)] = booking;
        saveBookings();
        AgronexBus.onBookingCreated(booking, m);
        document.getElementById('booking-steps-modal').style.display = 'none';
        if (nextBtn) {
            nextBtn.disabled = false;
            nextBtn.innerHTML = 'Siguiente <i class="fas fa-arrow-right"></i>';
        }
        selectMarket(m.id);
        showToast(`✅ Reserva confirmada — ${m.title}. WhatsApp desbloqueado.`, 'success');
        // Auto-open tracking so user sees the timeline immediately
        setTimeout(() => openTrackingModal(m.id), 700);
    }, 900);
}
function calcBookingAmounts(m, service, ha) {
    const hectares = Math.max(parseFloat(ha) || 0, 0);
    const priceHa = servicePriceFor(m, service);
    const total = hectares * priceHa;
    const deposit = total * PAYMENT_CONFIG.depositRate;
    const commission = deposit * PAYMENT_CONFIG.commissionRate;
    const payNow = deposit + commission;
    const balance = Math.max(total - deposit, 0);
    return { hectares, priceHa, total, deposit, commission, payNow, balance };
}
function formatDateHuman(dateStr) {
    if (!dateStr)
        return 'fecha a coordinar';
    const d = new Date(`${dateStr}T12:00:00`);
    if (Number.isNaN(d.getTime()))
        return dateStr;
    return d.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' });
}
function providerBadge(provider) {
    return provider === 'Stripe' ? 'Stripe · tarjeta' : 'Mercado Pago';
}
function handleNdInsightAction(index) {
    const alerts = typeof AI !== 'undefined' && AI.alerts ? AI.alerts() : [];
    const alert = alerts[index];
    if (!alert)
        return;
    if (alert.category && typeof ndCatFilter === 'function') {
        const btn = document.querySelector(`.nd-cat[data-cat="${alert.category}"]`);
        ndCatFilter(alert.category, btn);
        const grid = document.getElementById('market-grid');
        if (grid)
            grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
    }
    if (alert.targetId && typeof selectMarket === 'function') {
        selectMarket(alert.targetId);
        return;
    }
    if (alert.cta && String(alert.cta).toLowerCase().includes('reserva')) {
        showScreen('reservas');
        return;
    }
    const input = document.getElementById('nd-search-input');
    if (input)
        input.focus();
}
function renderNdIAStrip() {
    const container = document.getElementById('nd-ia-strip');
    if (!container)
        return;
    const alerts = AI.alerts();
    if (!alerts.length) {
        container.style.display = 'none';
        return;
    }
    container.style.display = 'flex';
    const colorMap = { green: 'nd-ia-pill-green', amber: 'nd-ia-pill-amber', red: 'nd-ia-pill-red' };
    container.innerHTML = alerts.map((a, index) => `
    <div class="nd-ia-pill ${colorMap[a.color] || 'nd-ia-pill-green'}"
      onclick="handleNdInsightAction(${index})">
      <span class="nd-ia-pill-text">${a.icon} ${a.text}</span>
      ${a.cta ? `<span class="nd-pill-cta">${a.cta}</span>` : ''}
    </div>
  `).join('');
}

// ---- original java.js lines 6466-6530 ----
function renderReservasCards(shown) {
    const list = document.getElementById('reservas-cards-list');
    if (!list)
        return;
    if (!shown || !shown.length) {
        list.style.display = 'none';
        return;
    }
    list.style.display = 'flex';
    const statusInfo = s => ({ active: ['chip-green', 'Activa'], confirmed: ['chip-green', 'Confirmada'], pending: ['chip-amber', 'Pendiente'], done: ['chip-gray', 'Completada'], cancelled: ['chip-red', 'Cancelada'] }[s] || ['chip-gray', s || '—']);
    const emoji = n => {
        if (!n)
            return '🚜';
        const l = n.toLowerCase();
        if (l.includes('dron'))
            return '🚁';
        if (l.includes('sembradora'))
            return '🌱';
        if (l.includes('cosechadora'))
            return '⚙️';
        if (l.includes('pulverizadora'))
            return '💦';
        return '🚜';
    };
    list.innerHTML = shown.map(b => {
        const name = b.machineName || b.title || '—';
        const svc = b.service || b.selectedService || '—';
        const ha = b.hectares ? `${b.hectares} ha` : '—';
        const d = (b.fecha || b.date) ? new Date((b.fecha || b.date) + 'T12:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'short' }) : '—';
        const dep = b.payNow ? (typeof fmtCalcCurrency === 'function' ? fmtCalcCurrency(b.payNow) : '$' + Math.round(b.payNow)) : '—';
        const [cls, lbl] = statusInfo(b.status || 'confirmed');
        const mid = b.machineId || b.id;
        return `<div class="res-card">
      <div class="res-card-hdr">
        <div class="res-card-emoji">${emoji(name)}</div>
        <div class="res-card-info"><div class="res-card-title">${name}</div><div class="res-card-meta">${svc}</div></div>
        <span class="chip ${cls}">${lbl}</span>
      </div>
      <div class="res-card-body">
        <div><div class="res-detail-lbl">Fecha</div><div class="res-detail-val">${d}</div></div>
        <div><div class="res-detail-lbl">Hectáreas</div><div class="res-detail-val">${ha}</div></div>
        <div><div class="res-detail-lbl">Seña</div><div class="res-detail-val">${dep}</div></div>
        <div><div class="res-detail-lbl">Lote</div><div class="res-detail-val" style="font-size:12px;">${b.lote || '—'}</div></div>
      </div>
      <div class="res-card-footer">
        <div class="res-card-price">${dep}</div>
        <div style="display:flex;gap:6px;">
          <button class="btn btn-ghost btn-xs" onclick="openWAModal(${mid})"><i class="fab fa-whatsapp" style="color:var(--primary-700);"></i></button>
          <button class="btn btn-ghost btn-xs" onclick="showScreen('market');setTimeout(()=>selectMarket(${mid}),150)"><i class="fas fa-eye"></i></button>
        </div>
      </div>
    </div>`;
    }).join('');
}
// ---- original java.js lines 6568-6584 ----
// Badge sync
function syncReservasBadge() {
    const dot = document.getElementById('bn-res-badge');
    if (dot) {
        dot.textContent = '';
        dot.style.display = 'none';
    }
}
// Init
document.addEventListener('DOMContentLoaded', function () {
    renderCampanasCards();
    syncReservasBadge();
    const sideEl = document.getElementById('tcn-res-badge') || document.getElementById('sn-res-badge');
    if (sideEl && window.MutationObserver) {
        new MutationObserver(syncReservasBadge).observe(sideEl, { childList: true, subtree: true, characterData: true });
    }
});
