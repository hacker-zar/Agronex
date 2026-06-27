"use strict";
/* ================================================================
   AGRONEX module: Calculator business logic
   Extracted from calcujava.js without behavior changes.
================================================================ */

"use strict";
/* ================================================================
   AGRONEX — Módulo Calculadora
   Incluye: CALC MODE, inputs, benchmarks, semáforo, lotes
   Depende de: UserStore, AgronexBus, perfilData, getTC(), fmtMoneda()
================================================================ */
// Variables globales propias de la calculadora
let simMode = 'alquilar';
let calcChart;
const haToNum = { 'menos100': 60, '100-500': 250, '500-1500': 800, 'mas1500': 2000 };
// ===== CALC MODE (simple / lotes) =====
let calcMode = 'simple';
let lotes = [];
let loteCounter = 0;
let editingSavedCampaignKey = null;
const AGRONEX_SAVED_CAMPAIGNS_KEY = 'agronex_saved_campaigns';
function calcTextEscape(value) {
    return String(value == null ? '' : value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
function getCampaignNameInput() {
    const el = document.getElementById('c-campaign-name');
    return el ? el.value.trim() : '';
}
function fallbackCampaignName(title) {
    return `${title || getCalcCultivoLabel()} ${new Date().getFullYear()}`;
}
function loteDisplayName(l) {
    return (l && l.nombre && String(l.nombre).trim()) || `Lote ${l && l.id}`;
}
function updateLoteTitle(l) {
    if (!l)
        return;
    const titleEl = document.getElementById(`lote-title-${l.id}`);
    if (titleEl)
        titleEl.textContent = `${cultivoEmoji[l.cultivo]} ${loteDisplayName(l)} — ${cultivoNombre[l.cultivo]}`;
}
const cultivoDefaults = {
    soja: { rend: 30, precio: 22, sem: 45, fert: 60, agro: 35, comb: 30, maq: 40, mo: 20, alq: 120, log: 22 },
    maiz: { rend: 80, precio: 14, sem: 55, fert: 80, agro: 30, comb: 35, maq: 45, mo: 22, alq: 120, log: 28 },
    trigo: { rend: 38, precio: 19, sem: 38, fert: 55, agro: 25, comb: 25, maq: 35, mo: 18, alq: 100, log: 20 },
    girasol: { rend: 22, precio: 32, sem: 30, fert: 40, agro: 20, comb: 22, maq: 32, mo: 15, alq: 110, log: 24 },
    cebada: { rend: 42, precio: 17, sem: 36, fert: 58, agro: 22, comb: 23, maq: 34, mo: 16, alq: 100, log: 21 },
    sorgo: { rend: 55, precio: 11, sem: 18, fert: 45, agro: 18, comb: 20, maq: 30, mo: 14, alq: 95, log: 24 },
    arroz: { rend: 65, precio: 20, sem: 50, fert: 75, agro: 30, comb: 40, maq: 60, mo: 35, alq: 150, log: 40 },
    algodon: { rend: 12, precio: 55, sem: 40, fert: 65, agro: 45, comb: 28, maq: 50, mo: 30, alq: 130, log: 34 },
    mani: { rend: 28, precio: 30, sem: 55, fert: 50, agro: 30, comb: 25, maq: 45, mo: 20, alq: 115, log: 32 },
    avena: { rend: 30, precio: 14, sem: 28, fert: 42, agro: 18, comb: 18, maq: 28, mo: 13, alq: 90, log: 18 },
};
const cultivoNombre = {
    soja: 'Soja', maiz: 'Maíz', trigo: 'Trigo', girasol: 'Girasol',
    cebada: 'Cebada', sorgo: 'Sorgo', arroz: 'Arroz',
    algodon: 'Algodón', mani: 'Maní', avena: 'Avena'
};
const cultivoEmoji = {
    soja: '🌱', maiz: '🌽', trigo: '🌾', girasol: '🌻',
    cebada: '🟡', sorgo: '🌿', arroz: '🍚', algodon: '☁️', mani: '🥜', avena: '🌿'
};
function switchCalcMode(mode, el) {
    calcMode = mode;
    document.querySelectorAll('.lote-mode-tab').forEach(t => t.classList.remove('active'));
    const activeTab = el || document.getElementById(mode === 'lotes' ? 'tab-lotes' : 'tab-simple');
    if (activeTab)
        activeTab.classList.add('active');
    document.getElementById('calc-mode-simple').style.display = mode === 'simple' ? 'block' : 'none';
    document.getElementById('calc-mode-lotes').style.display = mode === 'lotes' ? 'block' : 'none';
    document.getElementById('lotes-summary-panel').style.display = mode === 'lotes' ? 'block' : 'none';
    if (mode === 'simple') {
        const rowsEl = document.getElementById('lotes-summary-rows');
        const totalEl = document.getElementById('lotes-total-val');
        if (rowsEl)
            rowsEl.innerHTML = '';
        if (totalEl)
            totalEl.textContent = '—';
    }
    if (mode === 'lotes' && lotes.length === 0) {
        addLote();
        addLote();
    }
    else if (mode === 'lotes')
        calcLotes();
    else
        calcAuto();
}
function addLote() {
    loteCounter++;
    const id = loteCounter;
    const ckeys = ['soja', 'maiz', 'trigo', 'girasol', 'cebada', 'sorgo', 'arroz', 'algodon', 'mani', 'avena'];
    const ck = ckeys[(id - 1) % ckeys.length];
    const d = cultivoDefaults[ck];
    lotes.push(Object.assign({ id, nombre: `Lote ${id}`, cultivo: ck, ha: 100 }, d));
    renderLotes();
}
function removeLote(id) {
    lotes = lotes.filter(l => l.id !== id);
    renderLotes();
    showToast('Lote eliminado', 'info');
}
function renderLotes() {
    const container = document.getElementById('lotes-container');
    if (!container)
        return;
    // Only create new DOM nodes for lotes that don't exist yet — preserve existing cards
    const existingIds = new Set([...container.querySelectorAll('.lote-card')].map(el => +el.dataset.loteid));
    // Remove cards for deleted lotes
    container.querySelectorAll('.lote-card').forEach(el => {
        if (!lotes.find(l => l.id === +el.dataset.loteid))
            el.remove();
    });
    // Add cards for new lotes
    lotes.forEach(l => {
        if (!existingIds.has(l.id)) {
            const card = document.createElement('div');
            card.className = 'lote-card';
            card.dataset.loteid = l.id;
            card.innerHTML = buildLoteCardHTML(l);
            container.appendChild(card);
        }
        updateLoteTitle(l);
        // Always update semaforo visuals for every lote
        updateLoteSemaforo(l);
    });
    // Sync delete buttons visibility
    container.querySelectorAll('.lote-delete-btn').forEach(btn => {
        btn.style.display = lotes.length > 1 ? '' : 'none';
    });
    calcLotes();
}
function buildLoteCardHTML(l) {
    return `
    <div class="lote-card-header">
      <span class="lote-card-title" id="lote-title-${l.id}">${cultivoEmoji[l.cultivo]} Lote ${l.id} — ${cultivoNombre[l.cultivo]}</span>
      <button class="lote-delete-btn" onclick="removeLote(${l.id})" style="display:${lotes.length > 1 ? '' : 'none'}"><i class="fas fa-times"></i></button>
    </div>
    <div class="form-grid-2" style="margin-bottom:4px;">
      <div class="form-group">
        <label class="form-label">Nombre del lote</label>
        <input class="form-input" type="text" value="${calcTextEscape(loteDisplayName(l))}" maxlength="60"
          oninput="updateLote(${l.id},'nombre',this.value)">
      </div>
      <div class="form-group">
        <label class="form-label">Cultivo</label>
        <select class="form-select" onchange="updateLote(${l.id},'cultivo',this.value)">
          ${['soja', 'maiz', 'trigo', 'girasol', 'cebada', 'sorgo', 'arroz', 'algodon', 'mani', 'avena'].map(c => `<option value="${c}" ${l.cultivo === c ? 'selected' : ''}>${cultivoEmoji[c]} ${cultivoNombre[c]}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Hectáreas</label>
        <input class="form-input" type="number" value="${l.ha}" min="1"
          oninput="updateLote(${l.id},'ha',+this.value)">
      </div>
      <div class="form-group">
        <label class="form-label">¿Cuánto esperás cosechar? <span class="unit-grano-ha" style="font-size:10px;color:var(--text-muted);">${granoLabel()}/ha</span></label>
        <div style="position:relative;">
          <input class="form-input semaforo-input" type="number" id="l${l.id}-rend" value="${Math.round(toDisplayUnit(l.rend) * 10) / 10}"
            oninput="updateLote(${l.id},'rend',+this.value)" style="padding-right:32px;">
          <span class="lote-sem-badge" id="l${l.id}-sb-rend"></span>
          <div class="lote-sem-tip" id="l${l.id}-st-rend"></div>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">¿A cuánto lo vendés? <span style="font-size:10px;color:var(--text-muted);">${perfilData.moneda === 'ARS' ? 'ARS' : 'USD'}/<span class="unit-grano">${granoLabel()}</span></span></label>
        <div style="position:relative;">
          <input class="form-input semaforo-input" type="number" id="l${l.id}-precio" value="${l.precio}"
            oninput="updateLote(${l.id},'precio',+this.value)" style="padding-right:32px;">
          <span class="lote-sem-badge" id="l${l.id}-sb-precio"></span>
          <div class="lote-sem-tip" id="l${l.id}-st-precio"></div>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Insumos <span style="font-size:10px;color:var(--text-muted);">sem+fert+agro — $/ha</span></label>
        <div style="position:relative;">
          <input class="form-input semaforo-input" type="number" id="l${l.id}-insumos" value="${Math.round((l.sem || 0) + (l.fert || 0) + (l.agro || 0))}"
            oninput="splitLote(${l.id},'insumos',+this.value)" style="padding-right:32px;">
          <span class="lote-sem-badge" id="l${l.id}-sb-insumos"></span>
          <div class="lote-sem-tip" id="l${l.id}-st-insumos"></div>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Operación <span style="font-size:10px;color:var(--text-muted);">maq+comb+mo — $/ha</span></label>
        <div style="position:relative;">
          <input class="form-input semaforo-input" type="number" id="l${l.id}-op" value="${Math.round((l.maq || 0) + (l.comb || 0) + (l.mo || 0))}"
            oninput="splitLote(${l.id},'op',+this.value)" style="padding-right:32px;">
          <span class="lote-sem-badge" id="l${l.id}-sb-op"></span>
          <div class="lote-sem-tip" id="l${l.id}-st-op"></div>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Distribucion / logistica <span style="font-size:10px;color:var(--text-muted);">$/ha</span></label>
        <div style="position:relative;">
          <input class="form-input semaforo-input" type="number" id="l${l.id}-log" value="${Math.round(l.log || 0)}"
            oninput="updateLote(${l.id},'log',+this.value)" style="padding-right:32px;">
          <span class="lote-sem-badge" id="l${l.id}-sb-log"></span>
          <div class="lote-sem-tip" id="l${l.id}-st-log"></div>
        </div>
      </div>
    </div>
    <!-- Per-lote insight -->
    <div class="lote-insight" id="l${l.id}-insight"></div>
  `;
}
// ── UNIFIED SEMAFORO ENGINE — shared by both En Conjunto and Por Lotes ────────
// bmFmt: format a benchmark threshold value for display in tip texts.
// Monetary values → fmtCalcCurrency. Yield/unit values → raw number + unit label.
function bmFmt(val, fieldId) {
    if (fieldId === 'rend') {
        const u = granoLabel();
        return `${Math.round(val)} ${u}`;
    }
    if (fieldId === 'precio') {
        // precio is per qq/kg — show with currency + unit
        const sym = perfilData.moneda === 'ARS' ? '$' : 'USD ';
        const u = granoLabel();
        return `${sym}${Math.round(val)}/${u}`;
    }
    // cost fields: per-hectare monetary value
    return fmtCalcCurrency(val) + '/ha';
}
// buildTipText: generates tip text dynamically using already-scaled numeric thresholds.
// No hardcoded currency strings — always matches the user's active moneda.
function buildTipText(fieldId, level, bm, cultivo) {
    var _a, _b;
    const cn = cultivoNombre[cultivo] || cultivo;
    if (fieldId === 'rend') {
        const lo = bmFmt(bm.opt_lo, 'rend'), hi = bmFmt(bm.opt_hi, 'rend'), max = bmFmt(bm.hi, 'rend');
        if (level === 'red' && bm._wasLow)
            return `Estás esperando cosechar muy poco. En la zona el ${cn} rinde entre ${lo} y ${hi} por hectárea.`;
        if (level === 'red')
            return `Ese rendimiento parece muy optimista para ${cn}. El máximo habitual es cerca de ${max}/ha.`;
        if (level === 'amber')
            return `Tu expectativa de cosecha está un poco fuera de lo normal para ${cn} (${lo}–${hi}/ha).`;
    }
    if (fieldId === 'precio') {
        const lo = bmFmt(bm.opt_lo, 'precio'), hi = bmFmt(bm.opt_hi, 'precio'), max = bmFmt(bm.hi, 'precio');
        if (level === 'red' && bm._wasLow)
            return `Lo estás vendiendo muy barato. El ${cn} en el mercado está entre ${lo} y ${hi}.`;
        if (level === 'red')
            return `Ese precio está muy por encima del mercado para ${cn}.`;
        if (level === 'amber')
            return `El precio está un poco fuera del rango de mercado para ${cn} (${lo}–${hi}).`;
    }
    // cost fields (sem, fert, agro, comb, maq, mo, alq)
    const label = ((_b = (_a = BENCHMARKS[cultivo]) === null || _a === void 0 ? void 0 : _a[fieldId]) === null || _b === void 0 ? void 0 : _b.label) || fieldId;
    const opt = bmFmt(bm.opt, fieldId);
    if (level === 'green') {
        if (fieldId === 'alq')
            return `Buen alquiler para ${cn}. Está dentro del rango esperado para campañas similares.`;
        if (fieldId === 'com')
            return `Buen costo de comercialización para ${cn}. Está alineado al promedio regional.`;
        if (fieldId === 'seg')
            return `Buen costo de seguro para ${cn}. Te cubre sin pesar demasiado en el margen.`;
        if (fieldId === 'imp')
            return `Buen costo administrativo para ${cn}. Está controlado frente a campañas similares.`;
    }
    if (fieldId === 'alq') {
        if (level === 'amber')
            return `Tu alquiler está un poco alto para ${cn}. En campos y campañas similares suele estar cerca de ${opt}.`;
        if (level === 'red')
            return `Tu alquiler está muy alto para ${cn}. Lo normal es ${opt} — revisá contrato, zona o esquema de aparcería.`;
    }
    if (fieldId === 'com') {
        if (level === 'amber')
            return `El costo de comercialización supera levemente el promedio para ${cn}. Lo normal es cerca de ${opt}.`;
        if (level === 'red')
            return `El costo de comercialización supera mucho el promedio para ${cn}. Lo normal es ${opt} — revisá flete, acopio o comisión.`;
    }
    if (fieldId === 'seg') {
        if (level === 'amber')
            return `El seguro está un poco alto para ${cn}. Campañas similares suelen estar cerca de ${opt}.`;
        if (level === 'red')
            return `El seguro está demasiado alto para ${cn}. Lo normal es ${opt} — compará cobertura y deducibles.`;
    }
    if (fieldId === 'imp') {
        if (level === 'amber')
            return `Administración e impuestos están un poco altos para ${cn}. Lo normal es cerca de ${opt}.`;
        if (level === 'red')
            return `Administración e impuestos están demasiado altos para ${cn}. Lo normal es ${opt} — revisá estructura y cargas.`;
    }
    if (level === 'amber')
        return `${label} está un poco alto para ${cn}. Lo normal es cerca de ${opt}.`;
    if (level === 'red')
        return `${label} está demasiado alto para ${cn}. Lo normal es ${opt} — revisá esta categoría.`;
    return '';
}
// classifyField: single source of truth for semaforo decisions.
// Returns {level, tipText} — never touches the DOM.
// Tip texts are always generated from scaled numeric values → always in active currency.
function classifyField(fieldId, value, cultivo) {
    var _a;
    const bmRaw = (_a = BENCHMARKS[cultivo]) === null || _a === void 0 ? void 0 : _a[fieldId];
    if (!bmRaw || value <= 0)
        return { level: '', tipText: '' };
    // Scale thresholds to active currency (benchmarks stored in USD)
    let bm = Object.assign({}, bmRaw);
    if (fieldId === 'rend' && perfilData.unidadGrano === 'kg') {
        bm.low = bm.low * QQ_TO_KG;
        bm.opt_lo = bm.opt_lo * QQ_TO_KG;
        bm.opt_hi = bm.opt_hi * QQ_TO_KG;
        bm.hi = bm.hi * QQ_TO_KG;
    }
    if (perfilData.moneda === 'ARS' && fieldId !== 'rend') {
        const tc = getTC();
        if (bm.opt !== undefined)
            bm.opt = bm.opt * tc;
        if (bm.hi !== undefined)
            bm.hi = bm.hi * tc;
        if (bm.low !== undefined)
            bm.low = bm.low * tc;
        if (bm.opt_lo !== undefined)
            bm.opt_lo = bm.opt_lo * tc;
        if (bm.opt_hi !== undefined)
            bm.opt_hi = bm.opt_hi * tc;
    }
    let level;
    if (fieldId === 'rend' || fieldId === 'precio') {
        if (value < bm.low) {
            level = 'red';
            bm._wasLow = true;
        }
        else if (value < bm.opt_lo) {
            level = 'amber';
        }
        else if (value > bm.hi) {
            level = 'red';
            bm._wasLow = false;
        }
        else if (value > bm.opt_hi && value <= bm.hi) {
            level = 'amber';
        }
        else {
            level = 'green';
        }
    }
    else {
        if (value <= bm.opt) {
            level = 'green';
        }
        else if (value <= bm.hi) {
            level = 'amber';
        }
        else {
            level = 'red';
        }
    }
    // Generate tip text dynamically — always in the user's active currency
    const tipText = buildTipText(fieldId, level, bm, cultivo);
    return { level, tipText };
}
// applyFieldSemaforo: applies a semaforo classification to any input+badge+tip trio.
// Works for both En Conjunto (prefix 'c-') and Per-lote (prefix 'l{id}-') elements.
function applyFieldSemaforo(inputEl, badgeEl, tipEl, level, tipText) {
    if (!inputEl)
        return;
    const badgeBaseClass = (badgeEl === null || badgeEl === void 0 ? void 0 : badgeEl.classList.contains('lote-sem-badge')) ? 'lote-sem-badge' : 'semaforo-badge';
    const tipBaseClass = (tipEl === null || tipEl === void 0 ? void 0 : tipEl.classList.contains('lote-sem-tip')) ? 'lote-sem-tip' : 'semaforo-tip';
    inputEl.classList.remove('s-green', 's-amber', 's-red');
    if (badgeEl) {
        badgeEl.className = badgeBaseClass;
        badgeEl.textContent = '';
    }
    if (tipEl) {
        tipEl.textContent = '';
        tipEl.className = tipBaseClass;
    }
    if (!level)
        return;
    inputEl.classList.add('s-' + level);
    if (badgeEl) {
        badgeEl.classList.add('s-' + level);
        badgeEl.textContent = level === 'green' ? '✓' : level === 'amber' ? '⚠' : '!';
    }
    if (tipEl && tipText) {
        tipEl.textContent = tipText;
        tipEl.className = `${tipBaseClass} show`;
        const wrapper = inputEl.parentElement;
        if (wrapper && !wrapper._semHook) {
            wrapper._semHook = true;
            wrapper.addEventListener('mouseenter', () => { if (tipEl.textContent)
                tipEl.style.display = 'block'; });
            wrapper.addEventListener('mouseleave', () => { tipEl.style.display = ''; });
        }
    }
}
// applyLoteSemField: applies semaforo to a per-lote field using the unified engine.
function applyLoteSemField(loteId, field, val, cultivo) {
    const { level, tipText } = classifyField(field, val, cultivo);
    const inputEl = document.getElementById(`l${loteId}-${field}`);
    const badgeEl = document.getElementById(`l${loteId}-sb-${field}`);
    const tipEl = document.getElementById(`l${loteId}-st-${field}`);
    // Lote badges use class 'lote-sem-badge' — ensure correct base class
    if (badgeEl)
        badgeEl.className = 'lote-sem-badge';
    applyFieldSemaforo(inputEl, badgeEl, tipEl, level, tipText);
    // Re-apply lote-specific badge class since applyFieldSemaforo sets 's-X' (shared style)
    if (badgeEl && level) {
        badgeEl.className = `lote-sem-badge lote-sem-${level}`;
        badgeEl.textContent = level === 'green' ? '✓' : level === 'amber' ? '⚠' : '!';
    }
    return level;
}
// classifyComposite: classify a composite field (insumos = sem+fert+agro; op = maq+comb+mo)
// by summing the opt/hi thresholds of its components. Reuses the same opt/hi boundary logic.
function classifyComposite(parts, cultivo) {
    const bm = BENCHMARKS[cultivo] || BENCHMARKS.soja;
    const scale = perfilData.moneda === 'ARS' ? getTC() : 1;
    const optSum = parts.reduce((s, k) => { var _a; return s + (((_a = bm[k]) === null || _a === void 0 ? void 0 : _a.opt) || 0); }, 0) * scale;
    const hiSum = parts.reduce((s, k) => { var _a; return s + (((_a = bm[k]) === null || _a === void 0 ? void 0 : _a.hi) || 0); }, 0) * scale;
    return { optSum, hiSum };
}
function updateLoteSemaforo(l) {
    const c = l.cultivo;
    const insumos = (l.sem || 0) + (l.fert || 0) + (l.agro || 0);
    const op = (l.maq || 0) + (l.comb || 0) + (l.mo || 0);
    // rend and precio: pass rend in display unit (same as rendDisplay in En Conjunto)
    // classifyField scales benchmarks to kg when unidadGrano==='kg', so comparison must be in same unit
    applyLoteSemField(l.id, 'rend', toDisplayUnit(l.rend), c);
    applyLoteSemField(l.id, 'precio', l.precio, c);
    applyLoteSemField(l.id, 'log', Number(l.log) || 0, c);
    // Insumos composite — classify using summed thresholds
    const { optSum: insOpt, hiSum: insHi } = classifyComposite(['sem', 'fert', 'agro'], c);
    const insLevel = insumos <= insOpt ? 'green' : insumos <= insHi ? 'amber' : 'red';
    const _insOptFmt = fmtCalcCurrency(insOpt) + '/ha';
    const insTip = insLevel === 'amber'
        ? `Insumos un poco altos para ${cultivoNombre[c]}. Lo normal es cerca de ${_insOptFmt}.`
        : insLevel === 'red'
            ? `Estás gastando demasiado en insumos para ${cultivoNombre[c]}. Lo normal es ${_insOptFmt} — revisá semilla y fertilización.`
            : '';
    const inInput = document.getElementById(`l${l.id}-insumos`);
    const inBadge = document.getElementById(`l${l.id}-sb-insumos`);
    const inTip = document.getElementById(`l${l.id}-st-insumos`);
    if (inBadge)
        inBadge.className = 'lote-sem-badge';
    applyFieldSemaforo(inInput, inBadge, inTip, insLevel, insTip);
    if (inBadge && insLevel) {
        inBadge.className = `lote-sem-badge lote-sem-${insLevel}`;
        inBadge.textContent = insLevel === 'green' ? '✓' : insLevel === 'amber' ? '⚠' : '!';
    }
    // Operación composite
    const { optSum: opOpt, hiSum: opHi } = classifyComposite(['maq', 'comb', 'mo'], c);
    const opLevel = op <= opOpt ? 'green' : op <= opHi ? 'amber' : 'red';
    const _opOptFmt = fmtCalcCurrency(opOpt) + '/ha';
    const opTip = opLevel === 'amber'
        ? `La operación está un poco cara para ${cultivoNombre[c]}. Lo normal es cerca de ${_opOptFmt}.`
        : opLevel === 'red'
            ? `La operación te está costando demasiado en ${cultivoNombre[c]}. Lo normal es ${_opOptFmt} — revisá maquinaria y combustible.`
            : '';
    const opInput = document.getElementById(`l${l.id}-op`);
    const opBadge = document.getElementById(`l${l.id}-sb-op`);
    const opTipEl = document.getElementById(`l${l.id}-st-op`);
    if (opBadge)
        opBadge.className = 'lote-sem-badge';
    applyFieldSemaforo(opInput, opBadge, opTipEl, opLevel, opTip);
    if (opBadge && opLevel) {
        opBadge.className = `lote-sem-badge lote-sem-${opLevel}`;
        opBadge.textContent = opLevel === 'green' ? '✓' : opLevel === 'amber' ? '⚠' : '!';
    }
    // Per-lote insight — reuse exact same logic as renderInsight() in En Conjunto
    const costoHa = insumos + op + (l.alq || 0) + (l.log || 0);
    const ingHa = (l.rend || 0) * (l.precio || 0);
    const ganHa = ingHa - costoHa;
    const ganTotal = ganHa * (l.ha || 0);
    const maqPct = costoHa > 0 ? ((l.maq || 0) / costoHa * 100) : 0;
    const margenPct = ingHa > 0 ? (ganHa / ingHa * 100).toFixed(1) : 0;
    const insightEl = document.getElementById(`l${l.id}-insight`);
    if (insightEl) {
        let html = '';
        if (ganTotal < 0) {
            html = `<div class="calc-insight warn">
        <div class="calc-insight-lbl">⚠ ESTÁS PERDIENDO PLATA EN ESTE LOTE</div>
        <div class="calc-insight-text">Con estos números, <strong>perdés ${fmtCalcCurrency(Math.abs(ganHa))} por hectárea</strong>. Revisá tus gastos o evaluá el precio de venta.</div>
      </div>`;
        }
        else if (maqPct > 25) {
            html = `<div class="calc-insight warn">
        <div class="calc-insight-lbl">🔴 LA MAQUINARIA DE ESTE LOTE CUESTA DEMASIADO</div>
        <div class="calc-insight-text">La maquinaria representa el <strong>${maqPct.toFixed(0)}% de tus gastos</strong>. Alquilar podría hacerte ahorrar — mirá NexuDrive.</div>
      </div>`;
        }
        else if (ganTotal > 0) {
            html = `<div class="calc-insight">
        <div class="calc-insight-lbl">✓ ESTE LOTE VA BIEN</div>
        <div class="calc-insight-text">Estás ganando <strong>${fmtCalcCurrency(ganHa)} por hectárea</strong>. Margen del ${margenPct}%. Este lote es rentable.</div>
      </div>`;
        }
        insightEl.innerHTML = html;
    }
}
function updateLote(id, field, val) {
    const l = lotes.find(x => x.id === id);
    if (!l)
        return;
    // rend is stored internally in qq — convert from user's display unit when saving
    if (field === 'rend') {
        l.rend = perfilData.unidadGrano === 'kg' ? val / QQ_TO_KG : val;
    }
    else {
        l[field] = val;
    }
    if (field === 'cultivo') {
        // Full re-render only on cultivo change (structure changes)
        Object.assign(l, cultivoDefaults[val]);
        const card = document.querySelector(`.lote-card[data-loteid="${id}"]`);
        if (card) {
            card.innerHTML = buildLoteCardHTML(l);
            // Re-sync delete buttons
            document.querySelectorAll('.lote-delete-btn').forEach(btn => {
                btn.style.display = lotes.length > 1 ? '' : 'none';
            });
        }
        updateLoteSemaforo(l);
        // Update title
        const titleEl = document.getElementById(`lote-title-${id}`);
        if (titleEl)
            titleEl.textContent = `${cultivoEmoji[l.cultivo]} Lote ${l.id} — ${cultivoNombre[l.cultivo]}`;
    }
    else {
        // Just update semaforo — no re-render
        updateLoteSemaforo(l);
    }
    updateLoteTitle(l);
    calcLotes();
}
function splitLote(id, type, val) {
    const l = lotes.find(x => x.id === id);
    if (!l)
        return;
    const third = val / 3;
    if (type === 'insumos') {
        l.sem = third;
        l.fert = third;
        l.agro = third;
    }
    else {
        l.maq = third;
        l.comb = third;
        l.mo = third;
    }
    updateLoteSemaforo(l);
    calcLotes();
}
function calcLotes() {
    var _a;
    if (calcMode !== 'lotes')
        return;
    const mon = perfilData.moneda;
    const tc = +(((_a = document.getElementById('tc-ars')) === null || _a === void 0 ? void 0 : _a.value) || 1285);
    let totalGan = 0, totalHa = 0, totalIng = 0, totalCosto = 0, totalQq = 0;
    let totalDirectos = 0, totalIndirectos = 0;
    const costTotals = { sem: 0, fert: 0, agro: 0, comb: 0, maq: 0, mo: 0, alq: 0, log: 0 };
    const rows = lotes.map(l => {
        const ha = Math.max(Number(l.ha) || 0, 0);
        const sem = Number(l.sem) || 0, fert = Number(l.fert) || 0, agro = Number(l.agro) || 0;
        const comb = Number(l.comb) || 0, maq = Number(l.maq) || 0, mo = Number(l.mo) || 0, alq = Number(l.alq) || 0, log = Number(l.log) || 0;
        const rend = Number(l.rend) || 0, precio = Number(l.precio) || 0;
        const directosHa = sem + fert + agro + comb + maq + mo;
        const indirectosHa = alq + log;
        const costoHa = directosHa + indirectosHa;
        const ingHa = rend * precio;
        const ganHa = ingHa - costoHa;
        const ganTotal = ganHa * ha;
        totalGan += ganTotal;
        totalHa += ha;
        totalIng += ingHa * ha;
        totalCosto += costoHa * ha;
        totalQq += rend * ha;
        totalDirectos += directosHa * ha;
        totalIndirectos += indirectosHa * ha;
        costTotals.sem += sem * ha;
        costTotals.fert += fert * ha;
        costTotals.agro += agro * ha;
        costTotals.comb += comb * ha;
        costTotals.maq += maq * ha;
        costTotals.mo += mo * ha;
        costTotals.alq += alq * ha;
        costTotals.log += log * ha;
        return { name: `${cultivoEmoji[l.cultivo]} ${cultivoNombre[l.cultivo]} (${ha} ha)`, ganTotal };
    });
    const fv = v => fmtMoneda(v, mon, tc); // tc kept for API compat; fmtMoneda uses active currency
    const gEl = document.getElementById('r-ganancia');
    if (gEl) {
        gEl.textContent = fv(totalGan);
        gEl.className = 'result-main-val' + (totalGan < 0 ? ' negative' : '');
    }
    const sub = document.getElementById('calc-subtitle');
    if (sub)
        sub.textContent = `${lotes.length} lote${lotes.length > 1 ? 's' : ''} · ${totalHa} ha`;
    const s = (id, v) => { const e = document.getElementById(id); if (e)
        e.textContent = v; };
    const costoHaMed = totalHa > 0 ? totalCosto / totalHa : 0;
    s('r-ingreso', fv(totalIng));
    s('r-costo', fv(totalCosto));
    s('r-directos', `${fv(costoHaMed)}${haLabel()}`);
    s('r-indirectos', fv(totalIndirectos));
    const ganHaMed = totalHa > 0 ? totalGan / totalHa : 0;
    const mainSub = document.getElementById('result-main-sub');
    if (mainSub) {
        const label = ganHaMed >= 0 ? 'Ganancia por hectárea' : 'Pérdida por hectárea';
        mainSub.textContent = `${label}: ${fv(Math.abs(ganHaMed))}`;
        mainSub.className = 'result-main-sub ' + (ganHaMed >= 0 ? 'green' : 'red');
    }
    const mEl = document.getElementById('r-margen');
    if (mEl) {
        mEl.textContent = `${fv(ganHaMed)}${haLabel()}`;
        mEl.className = 'result-row-val ' + (ganHaMed >= 0 ? 'green' : 'red');
    }
    const precioMed = totalQq > 0 ? totalIng / totalQq : 0;
    const peQq = costoHaMed > 0 && precioMed > 0 ? costoHaMed / precioMed : 0;
    s('r-pe', peQq ? `${toDisplayUnit(peQq).toFixed(1)} ${granoLabel()}/ha` : '—');
    const rowsEl = document.getElementById('lotes-summary-rows');
    if (rowsEl)
        rowsEl.innerHTML = rows.map(r => `
    <div class="lotes-summary-row">
      <span class="lotes-row-lbl">${r.name}</span>
      <span class="lotes-row-val" style="color:${r.ganTotal >= 0 ? 'var(--green-600)' : 'var(--red-400)'};">${fv(r.ganTotal)}</span>
    </div>`).join('');
    const tot = document.getElementById('lotes-total-val');
    if (tot)
        tot.textContent = fv(totalGan);
    const avg = key => totalHa > 0 ? costTotals[key] / totalHa : 0;
    const agg = {
        ha: Math.max(totalHa, 1),
        rend: totalHa > 0 ? totalQq / totalHa : 0,
        precio: precioMed,
        ingHa: totalHa > 0 ? totalIng / totalHa : 0,
        costoHa: costoHaMed,
        ganHa: ganHaMed,
        ganTotal: totalGan,
        ingTotal: totalIng,
        costoTotal: totalCosto,
        directosHa: totalHa > 0 ? totalDirectos / totalHa : 0,
        indirectosHa: totalHa > 0 ? totalIndirectos / totalHa : 0,
        directosTotal: totalDirectos,
        indirectosTotal: totalIndirectos,
        margenPct: totalIng > 0 ? (totalGan / totalIng * 100).toFixed(1) : 0,
        peQq: peQq ? peQq.toFixed(1) : 0,
        sem: avg('sem'), fert: avg('fert'), agro: avg('agro'), comb: avg('comb'), maq: avg('maq'), mo: avg('mo'), alq: avg('alq'), log: avg('log')
    };
    updateResultState(totalGan, ganHaMed, totalHa > 0 ? totalIng / totalHa : 0, agg);
    renderInsight(agg);
    renderCalcSim(agg);
    renderCalcChart(agg);
    const cultivoPrincipal = (lotes[0] && lotes[0].cultivo) || 'soja';
    renderOpportunities(agg, cultivoPrincipal);
    return agg;
}
function fmtBigNum(abs, mon) {
    const fmt = perfilData.numFormat || 'normal';
    const sym = mon === 'ARS' ? '$' : 'USD ';
    if (fmt === 'abrev') {
        if (abs >= 1e9)
            return sym + (abs / 1e9).toFixed(1).replace('.0', '') + 'B';
        if (abs >= 1e6)
            return sym + (abs / 1e6).toFixed(1).replace('.0', '') + 'M';
        if (abs >= 1e3)
            return sym + (abs / 1e3).toFixed(1).replace('.0', '') + 'K';
        return sym + Math.round(abs).toLocaleString('es-AR');
    }
    if (fmt === 'palabras') {
        if (abs >= 1e9)
            return sym + (abs / 1e9).toFixed(2).replace('.00', '') + ' mil millones';
        if (abs >= 1e6)
            return sym + (abs / 1e6).toFixed(2).replace('.00', '') + ' millones';
        if (abs >= 1e3)
            return sym + (abs / 1e3).toFixed(1).replace('.0', '') + ' mil';
        return sym + Math.round(abs).toLocaleString('es-AR');
    }
    // normal
    return sym + Math.round(abs).toLocaleString('es-AR');
}
function fmtMoneda(val, mon, tc) {
    // Values are ALWAYS in the user's active currency — no conversion needed.
    // tc is kept as parameter for legacy calls but is NOT applied here.
    const neg = val < 0;
    const abs = Math.abs(val);
    if (mon === 'ARS') {
        const str = fmtBigNum(abs, 'ARS');
        return (neg ? '-' : '') + str + ' ARS';
    }
    return (neg ? '-' : '') + fmtBigNum(abs, 'USD');
}
// Returns the active type-of-change (ARS per USD), used ONLY for benchmark scaling
function getTC() {
    var _a;
    return +(((_a = document.getElementById('tc-ars')) === null || _a === void 0 ? void 0 : _a.value) || 1285);
}
// Scale a USD benchmark value to the active currency
function bmScale(usdVal) {
    return perfilData.moneda === 'ARS' ? usdVal * getTC() : usdVal;
}
// Rescale calculator inputs when the user switches currency.
// Tracks the previous currency so we know which direction to convert.
let _lastCurrency = 'USD';
function rescaleInputsForCurrency(newMon) {
    const prev = _lastCurrency;
    if (prev === newMon)
        return;
    _lastCurrency = newMon;
    const tc = getTC();
    // Cost fields (USD/ha) — scale by tc in one direction
    const costIds = ['c-sem', 'c-fert', 'c-agro', 'c-comb', 'c-maq', 'c-mo', 'c-alq', 'c-com', 'c-log', 'c-seg', 'c-imp'];
    const factor = newMon === 'ARS' ? tc : (1 / tc);
    costIds.forEach(id => {
        const el = document.getElementById(id);
        if (!el)
            return;
        const v = parseFloat(el.value);
        if (!isNaN(v) && v > 0)
            el.value = Math.round(v * factor);
    });
    // Lotes: rescale all cost fields too
    lotes.forEach(l => {
        ['sem', 'fert', 'agro', 'comb', 'maq', 'mo', 'alq'].forEach(f => {
            if (l[f])
                l[f] = Math.round(l[f] * factor);
        });
    });
    // Re-render lotes inputs if in lotes mode
    if (calcMode === 'lotes')
        renderLotes();
}
// ===== PREFERENCIAS =====
function setPref(pref, val, el, label) {
    perfilData[pref] = val;
    el.parentElement.querySelectorAll('.pref-toggle-btn').forEach(b => b.classList.remove('active'));
    el.classList.add('active');
    if (pref === 'moneda') {
        const monedaDisplay = document.getElementById('perfil-moneda-display');
        if (monedaDisplay)
            monedaDisplay.textContent = label;
        const arsRow = document.getElementById('ars-tc-row');
        if (arsRow)
            arsRow.style.display = val === 'ARS' ? 'block' : 'none';
        // Rescale input values when switching currency so existing numbers stay coherent
        rescaleInputsForCurrency(val);
        // Sync all currency prefixes in the calculator
        syncCalcCurrencyLabels(val);
        // Sync plan prices
        syncPlanPrices(val);
        if (calcMode === 'simple')
            calcAuto();
        else
            calcLotes();
    }
    showToast(`Preferencia: ${label}`, 'success');
}
function syncCalcCurrencyLabels(mon) {
    // All input-prefix spans that show $ or USD in the calculator
    const sym = mon === 'ARS' ? '$' : 'USD';
    const shortSym = '$'; // always $ for cost fields, USD only for price
    // Cost fields use $, price field uses USD/ARS
    document.querySelectorAll('.input-prefix').forEach(el => {
        const inp = el.parentElement.querySelector('input');
        if (!inp)
            return;
        const id = inp.id || '';
        if (id === 'c-precio') {
            el.textContent = mon === 'ARS' ? '$' : 'USD';
        }
        else if (id.startsWith('c-') || id.startsWith('pub-')) {
            el.textContent = shortSym;
        }
    });
    // Section subtitle
    document.querySelectorAll('.calc-section-sub').forEach(el => {
        if (el.textContent.includes('por hectárea') || el.textContent.includes('/ha') || el.textContent.includes('USD') || el.textContent.includes('ARS')) {
            const monStr = (mon === 'ARS' ? 'ARS' : 'USD');
            const haStr = perfilData.sufijoPorHa === '/ha' ? '/ha' : ' por hectárea';
            el.textContent = `${monStr}${haStr}`;
        }
    });
    // Also update lote price field labels (USD/qq → $/qq in ARS mode)
    document.querySelectorAll('[style*="USD/qq"], .form-label').forEach(el => {
        if (el.textContent.includes('USD/qq') || el.textContent.includes('ARS/qq')) {
            el.textContent = el.textContent.replace(/USD\/qq|ARS\/qq/, mon === 'ARS' ? 'ARS/qq' : 'USD/qq');
        }
    });
}
function syncPlanPrices(mon) {
    const tc = getTC();
    const proEl = document.getElementById('plan-price-pro');
    const empEl = document.getElementById('plan-price-empresa');
    if (mon === 'ARS') {
        if (proEl)
            proEl.textContent = `$${(29 * tc).toLocaleString('es-AR')}`;
        if (empEl)
            empEl.textContent = `$${(99 * tc).toLocaleString('es-AR')}`;
    }
    else {
        if (proEl)
            proEl.textContent = 'USD 29';
        if (empEl)
            empEl.textContent = 'USD 99';
    }
}
function setNumFormat(fmt, el) {
    var _a;
    perfilData.numFormat = fmt;
    (_a = document.getElementById('pref-numfmt-toggle')) === null || _a === void 0 ? void 0 : _a.querySelectorAll('.pref-toggle-btn').forEach(b => b.classList.remove('active'));
    el.classList.add('active');
    if (calcMode === 'simple')
        calcAuto();
    else
        calcLotes();
    showToast('Formato de números actualizado', 'success');
}
// ===== UNIDAD DE GRANO (qq / kg) =====
// Conversion factor: 1 qq = 100 kg
const QQ_TO_KG = 100;
function toDisplayUnit(valueInQq) {
    return perfilData.unidadGrano === 'kg' ? valueInQq * QQ_TO_KG : valueInQq;
}
function fromDisplayUnit(displayValue) {
    return perfilData.unidadGrano === 'kg' ? displayValue / QQ_TO_KG : displayValue;
}
function granoLabel() { return perfilData.unidadGrano; } // 'qq' or 'kg'
function granoPerHaLabel() { return `${granoLabel()}${haLabel()}`; }
function haLabel() { return perfilData.sufijoPorHa === '/ha' ? '/ha' : ' por hectárea'; }
function syncUnitLabels() {
    const u = perfilData.unidadGrano;
    const ha = perfilData.sufijoPorHa;
    const haStr = ha === '/ha' ? '/ha' : ' por hectárea';
    // Update all qq/ha suffix spans in calculator
    document.querySelectorAll('.unit-grano').forEach(el => { el.textContent = u; });
    document.querySelectorAll('.unit-grano-ha').forEach(el => { el.textContent = `${u}/ha`; });
    document.querySelectorAll('.unit-por-ha').forEach(el => { el.textContent = haStr.trim(); });
    document.querySelectorAll('.unit-slash-ha').forEach(el => { el.textContent = ha; });
    // The calc rendimiento suffix: "qq/ha", "qq por hectárea", "kg/ha", "kg por hectárea"
    const rendSuffix = document.getElementById('rend-unit-suffix');
    if (rendSuffix)
        rendSuffix.textContent = perfilData.sufijoPorHa === '/ha' ? `${u}/ha` : `${u} por hectárea`;
    // The precio suffix: "/qq" or "/kg"
    const precioSuffix = document.getElementById('precio-unit-suffix');
    if (precioSuffix)
        precioSuffix.textContent = `/${u}`;
    // Update the rendimiento input value to reflect new unit
    const rendInput = document.getElementById('c-rend');
    if (rendInput) {
        // Only convert if switching; track last unit to avoid double-converting
        if (rendInput.dataset.lastUnit && rendInput.dataset.lastUnit !== u) {
            rendInput.value = u === 'kg'
                ? Math.round(parseFloat(rendInput.value) * QQ_TO_KG)
                : Math.round(parseFloat(rendInput.value) / QQ_TO_KG);
        }
        rendInput.dataset.lastUnit = u;
    }
    // Update all lote rend inputs — l.rend is stored in qq, so just re-display in new unit.
    // No conversion needed in the data model (l.rend stays in qq always).
    // The input just needs to show toDisplayUnit(l.rend).
    if (calcMode === 'lotes') {
        lotes.forEach(l => {
            const lRendInput = document.getElementById(`l${l.id}-rend`);
            if (lRendInput) {
                lRendInput.value = Math.round(toDisplayUnit(l.rend) * 10) / 10;
            }
        });
    }
    // Section subtitles
    document.querySelectorAll('.calc-section-sub').forEach(el => {
        const mon = perfilData.moneda === 'ARS' ? 'ARS' : 'USD';
        if (el.textContent.includes('por hectárea') || el.textContent.includes('/ha')) {
            el.textContent = `${mon}${haStr}`;
        }
    });
    // Recalc to update all displayed values
    if (calcMode === 'simple')
        calcAuto();
    else
        calcLotes();
}
function setUnidadGrano(val, el) {
    var _a;
    perfilData.unidadGrano = val;
    (_a = document.getElementById('pref-unidad-toggle')) === null || _a === void 0 ? void 0 : _a.querySelectorAll('.pref-toggle-btn').forEach(b => b.classList.remove('active'));
    el.classList.add('active');
    syncUnitLabels();
    showToast(`Unidad cambiada a ${val}`, 'success');
}
function setSufijoPorHa(val, el) {
    var _a;
    perfilData.sufijoPorHa = val;
    (_a = document.getElementById('pref-sufijoha-toggle')) === null || _a === void 0 ? void 0 : _a.querySelectorAll('.pref-toggle-btn').forEach(b => b.classList.remove('active'));
    el.classList.add('active');
    syncUnitLabels();
    showToast('Formato de hectárea actualizado', 'success');
}
function updateThemeBtn(btn) {
    const theme = document.documentElement.getAttribute('data-theme') || 'light';
    const label = theme === 'dark' ? '<i class="fas fa-adjust"></i> Alto contraste' : theme === 'contrast' ? '<i class="fas fa-sun"></i> Modo claro' : '<i class="fas fa-moon"></i> Oscuro';
    btn.innerHTML = label;
}
// ===== THEME =====
function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const next = current === 'light' ? 'dark' : current === 'dark' ? 'contrast' : 'light';
    isDark = next === 'dark';
    document.documentElement.setAttribute('data-theme', next === 'light' ? '' : next);
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.innerHTML = next === 'dark' ? '<i class="fas fa-adjust"></i>' : next === 'contrast' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        themeToggle.title = next === 'dark' ? 'Alto contraste' : next === 'contrast' ? 'Modo claro' : 'Modo oscuro';
    }
    const prefThemeBtn = document.getElementById('pref-theme-btn');
    if (prefThemeBtn)
        updateThemeBtn(prefThemeBtn);
}
// ===== AUTH =====
function switchAuthTab(tab, el) {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    el.classList.add('active');
    document.getElementById('auth-login').style.display = tab === 'login' ? 'block' : 'none';
    document.getElementById('auth-register').style.display = tab === 'register' ? 'block' : 'none';
}
// ── hydratePerfilForm: populate profile form inputs from UserStore on login ───
function hydratePerfilForm() {
    const u = UserStore.get();
    const fields = {
        'perfil-nombre': u.nombre,
        'perfil-apellido': u.apellido,
        'perfil-email': u.email,
        'perfil-tel': u.tel,
        'perfil-ciudad': u.ciudad,
        'perfil-empresa': u.empresa,
        'perfil-cuit': u.cuit,
    };
    Object.entries(fields).forEach(([id, val]) => {
        const el = document.getElementById(id);
        if (el)
            el.value = val || '';
    });
    // Province select
    const provEl = document.getElementById('perfil-provincia');
    if (provEl && u.provincia)
        provEl.value = u.provincia;
    // Ha numeric input
    const haInp = document.getElementById('perfil-ha-num');
    if (haInp && perfilData.ha) {
        const haVal = typeof perfilData.ha === 'number' ? perfilData.ha : haToNum[perfilData.ha];
        if (haVal) haInp.value = haVal;
    }
}
function doLogin() {
    // NOTA: ya no llamamos UserStore.init() acá — eso cargaba localStorage con
    // datos de ejemplo ("Carlos Argüello") y pisaba el perfil real recién cargado
    // desde Supabase vía UserStore.loadFromProfile(). El perfil real ya está en
    // memoria para este punto (lo carga enterApp() en auth.js antes de llamar acá).
    document.getElementById('auth-screen').style.display = 'none';
    document.getElementById('app').style.display = 'block';
    document.body.classList.remove('auth-active');
    const bn = document.getElementById('bottom-nav');
    if (bn) bn.style.display = '';
    hydratePerfilForm(); // fill form inputs from stored data
    initGreeting();
    applyPerfilToCalc();
    renderMarket();
    renderFavoritos();
    renderOfertas();
    renderSavedCampaigns();
    updateFavBadge();
    updateReservasBadge();
    syncAll(); // propagate user data to all UI
    applyLang();
    // ── Integration Bus: sync everything connected ──
    AgronexBus.init();
    showToast(t('toasts.welcome'), 'success');
}
// ===== SCREEN =====
// ===== DESKTOP SUBNAV SYSTEM =====
const SUBNAV_MAP = {
    home: 'sn-home', calc: 'sn-calc', campanas: 'sn-campanas',
    market: 'sn-market', service: 'sn-service', reservas: 'sn-reservas', favoritos: 'sn-favoritos',
    publicar: 'sn-dd-publicar', ofertas: 'sn-dd-ofertas', perfil: 'sn-dd-perfil',
};
const SUBNAV_MORE_SCREENS = new Set(['publicar', 'ofertas', 'perfil']);
function subnavGo(id) {
    showScreen(id);
    updateSubnav(id);
    closeCampaignDropdown();
    closeTcnGroups();
    closeUserMenu();
}
function updateSubnav(id) {
    // Legacy subnav (hidden but kept for mobile drawer references)
    document.querySelectorAll('.subnav-item').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.subnav-dd-item').forEach(el => el.classList.remove('active'));
    const snId = SUBNAV_MAP[id];
    if (snId) {
        const el = document.getElementById(snId);
        if (el)
            el.classList.add('active');
    }
    // T1 items: home, calc, campanas — set active directly
    document.querySelectorAll('.tcn-item').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tcn-dd-item').forEach(el => el.classList.remove('active'));
    // Publicar CTA active state
    const publishBtn = document.getElementById('tcn-publicar');
    if (publishBtn) {
        publishBtn.classList.toggle('tcn-publish-active', id === 'publicar');
        // Centrar el botón Publicar si se presiona
        if (id === 'publicar') {
            setTimeout(() => {
                // Usar scrollIntoView con comportamiento smooth
                publishBtn.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest',
                    inline: 'center'
                });
            }, 0);
        }
    }
    // T1 direct items
    const tcnId = 'tcn-' + id;
    const tcnEl = document.getElementById(tcnId);
    if (tcnEl) {
        if (tcnEl.classList.contains('tcn-dd-item')) {
            tcnEl.classList.add('active');
            // Highlight parent group trigger
            const MAQUINARIA_SCREENS = ['market','service','reservas'];
            const CUENTA_SCREENS = ['ofertas','favoritos','verificacion'];
            if (MAQUINARIA_SCREENS.includes(id)) {
                const btn = document.getElementById('tcn-group-btn-maquinaria');
                if (btn) {
                    btn.classList.add('active');
                    // Centrar el botón de grupo
                    setTimeout(() => {
                        btn.scrollIntoView({
                            behavior: 'smooth',
                            block: 'nearest',
                            inline: 'center'
                        });
                    }, 0);
                }
            } else if (CUENTA_SCREENS.includes(id)) {
                const btn = document.getElementById('tcn-group-btn-cuenta');
                if (btn) {
                    btn.classList.add('active');
                    // Centrar el botón de grupo
                    setTimeout(() => {
                        btn.scrollIntoView({
                            behavior: 'smooth',
                            block: 'nearest',
                            inline: 'center'
                        });
                    }, 0);
                }
            }
        } else {
            tcnEl.classList.add('active');
            // Centrar el elemento en la barra de navegación
            setTimeout(() => {
                // Usar scrollIntoView con comportamiento smooth
                tcnEl.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest',
                    inline: 'center'
                });
            }, 0);
        }
    }
}

// ─── TCN Group Dropdowns — Portal con position:fixed ─────────────────────────
function _positionPortal(dd, anchorEl, alignRight) {
    const r = anchorEl.getBoundingClientRect();
    const ddW = dd.offsetWidth || 240;
    let left = alignRight ? (r.right - ddW) : (r.left + r.width / 2 - ddW / 2);
    // Clamp to viewport
    if (left + ddW > window.innerWidth - 8) left = window.innerWidth - ddW - 8;
    if (left < 8) left = 8;
    dd.style.top  = (r.bottom + 8) + 'px';
    dd.style.left = left + 'px';
}

function toggleTcnGroup(groupId) {
    const dd = document.getElementById('tcn-dd-' + groupId);
    const group = document.getElementById('tcn-group-' + groupId);
    const btn = document.getElementById('tcn-group-btn-' + groupId);
    if (!dd || !group || !btn) return;
    const isOpen = group.classList.contains('open');
    closeTcnGroups();
    if (!isOpen) {
        group.classList.add('open');
        // FIX: usar visibility:hidden para medir offsetWidth SIN mostrar el elemento,
        // luego posicionar sincronicamente ANTES de agregar .open y disparar la animacion.
        // Esto elimina el "salto" causado por (a) translateX(-50%) en la keyframe y
        // (b) el gap de 1 frame del requestAnimationFrame anterior.
        dd.style.visibility = 'hidden';
        dd.style.display = 'block';
        _positionPortal(dd, btn, false); // posicion correcta, offsetWidth ya es valido
        dd.style.visibility = '';
        dd.classList.add('open');
        // Centrar el botón en la barra de navegación
        setTimeout(() => {
            btn.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'center'
            });
            document.addEventListener('click', _closeTcnGroupsOnOutside, { once: true });
        }, 10);
    }
}
function closeTcnGroups() {
    document.querySelectorAll('.tcn-group').forEach(g => g.classList.remove('open'));
    document.querySelectorAll('.tcn-dropdown').forEach(d => {
        d.classList.remove('open');
        d.style.display = '';
    });
}
function _closeTcnGroupsOnOutside(e) {
    // Check if click was inside any dropdown or group trigger
    const inGroup = !!e.target.closest('.tcn-group');
    const inDd = !!e.target.closest('.tcn-dropdown');
    if (!inGroup && !inDd) closeTcnGroups();
}

// ─── User Menu (avatar dropdown) — Portal con position:fixed ──────────────────
function toggleUserMenu() {
    const menu = document.getElementById('user-menu');
    const avatar = document.getElementById('topbar-avatar');
    if (!menu) return;
    const isOpen = menu.classList.contains('open');
    closeTcnGroups();
    closeUserMenu();
    if (!isOpen) {
        // FIX: mismo patron que toggleTcnGroup — posicionar antes de animar
        menu.style.visibility = 'hidden';
        menu.style.display = 'block';
        _positionPortal(menu, avatar, true);
        menu.style.visibility = '';
        menu.classList.add('open');
        setTimeout(() => {
            document.addEventListener('click', _closeUserMenuOnOutside, { once: true });
        }, 10);
    }
}
function closeUserMenu() {
    const menu = document.getElementById('user-menu');
    if (menu) {
        menu.classList.remove('open');
        menu.style.display = '';
    }
}
function _closeUserMenuOnOutside(e) {
    const inMenu = !!e.target.closest('#user-menu');
    const inWrap = !!e.target.closest('#topbar-user-wrap');
    if (!inMenu && !inWrap) closeUserMenu();
}
function doLogout() {
    closeUserMenu();
    document.getElementById('app').style.display = 'none';
    document.getElementById('auth-screen').style.display = 'flex';
    document.body.classList.add('auth-active');
    const bn = document.getElementById('bottom-nav');
    if (bn) bn.style.display = 'none';
    showToast('Sesión cerrada', 'info');
}
// ─── Campaign Dropdown ───────────────────────────
let activeCampaign = 'Soja 2024/25';
function toggleCampaignDropdown() {
    const dd = document.getElementById('campaign-dropdown');
    const ch = document.getElementById('camp-chevron');
    const isOpen = dd.classList.contains('open');
    dd.classList.toggle('open', !isOpen);
    if (ch)
        ch.style.transform = isOpen ? '' : 'rotate(180deg)';
    if (!isOpen) {
        // Close on outside click
        setTimeout(() => {
            document.addEventListener('click', _closeCampOnOutside, { once: true });
        }, 10);
    }
}
function _closeCampOnOutside(e) {
    const btn = document.getElementById('campaign-selector-btn');
    const dd = document.getElementById('campaign-dropdown');
    if (!(btn === null || btn === void 0 ? void 0 : btn.contains(e.target)) && !(dd === null || dd === void 0 ? void 0 : dd.contains(e.target))) {
        closeCampaignDropdown();
    }
}
function closeCampaignDropdown() {
    const dd = document.getElementById('campaign-dropdown');
    const ch = document.getElementById('camp-chevron');
    dd === null || dd === void 0 ? void 0 : dd.classList.remove('open');
    if (ch)
        ch.style.transform = '';
}
function selectCampaign(name, el) {
    activeCampaign = name;
    // Update label
    const lbl = document.getElementById('topbar-campaign-label');
    if (lbl)
        lbl.textContent = name;
    // Update active state in dropdown
    document.querySelectorAll('.camp-dd-item').forEach(b => b.classList.remove('active'));
    el.classList.add('active');
    closeCampaignDropdown();
    // Update all screens that depend on the active campaign
    showToast(`Campaña activa: ${name}`, 'success');
    if (typeof renderMarket === 'function')
        renderMarket();
    if (typeof renderCalcChart === 'function')
        setTimeout(renderCalcChart, 100);
    if (typeof renderAIAlerts === 'function')
        renderAIAlerts();
    // Update greeting sub-text if visible
    const grSub = document.querySelector('.home-greeting-sub');
    if (grSub) {
        const haMap = { 'Soja 2024/25': '420 ha · Campaña activa', 'Maíz 2024/25': '270 ha · Campaña activa', 'Trigo 2023': '80 ha · Campaña cerrada' };
        grSub.textContent = haMap[name] || name;
    }
}
function toggleSubnavMore() {
    const dd = document.getElementById('subnav-dropdown');
    if (!dd)
        return;
    dd.classList.toggle('open');
}
function closeSubnavMore() {
    const dd = document.getElementById('subnav-dropdown');
    if (dd)
        dd.classList.remove('open');
}
function updateSubnavBadges() {
    // Reservas badge
    const snRes = document.getElementById('sn-res-badge');
    if (snRes) {
        snRes.textContent = '';
        snRes.classList.remove('show');
        snRes.style.display = 'none';
    }
    // Favoritos badge
    const favCount = (typeof favIds !== 'undefined' ? favIds.length : 0);
    const snFav = document.getElementById('sn-fav-badge');
    if (snFav) {
        snFav.textContent = favCount;
        snFav.classList.toggle('show', favCount > 0);
    }
    // Sync avatar initials
    const initials = typeof getInitials === 'function'
        ? getInitials(personalData === null || personalData === void 0 ? void 0 : personalData.nombre, personalData === null || personalData === void 0 ? void 0 : personalData.apellido)
        : 'CA';
    const av = document.getElementById('topbar-avatar');
    if (av && !(personalData === null || personalData === void 0 ? void 0 : personalData.fotoUrl))
        av.textContent = initials;
}
// Close subnav dropdown when clicking outside
document.addEventListener('click', e => {
    const dd = document.getElementById('subnav-dropdown');
    const btn = document.getElementById('sn-more-btn');
    if (dd && btn && !dd.contains(e.target) && !btn.contains(e.target)) {
        dd.classList.remove('open');
    }
});
// Keyboard shortcut: / focuses search
document.addEventListener('keydown', e => {
    if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
        e.preventDefault();
        const inp = document.getElementById('topbar-search-input');
        if (inp)
            inp.focus();
    }
    if (e.key === 'Escape') {
        const inp = document.getElementById('topbar-search-input');
        if (inp && document.activeElement === inp)
            inp.blur();
        closeSubnavMore();
    }
});
function showScreen(id, navEl) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    const el = document.getElementById('screen-' + id);
    if (el)
        el.classList.add('active');
    else {
        const nf = document.getElementById('screen-notfound');
        if (nf)
            nf.classList.add('active');
        id = 'notfound';
    }
    const nb = document.getElementById('nav-' + id) || navEl;
    if (nb)
        nb.classList.add('active');
    updateSubnav(id);
    updateSubnavBadges();
    window.scrollTo(0, 0);
    if (id === 'calc') {
        setTimeout(() => calcMode === 'lotes' ? calcLotes() : calcAuto(), 100);
    }
    if (id === 'market') {
        setTimeout(() => {
            renderMarket();
            renderAIAlerts();
        }, 50);
    }
    if (id === 'market') {
    }
    if (id === 'reservas') {
        renderReservas();
    }
    if (id === 'favoritos') {
        renderFavoritos();
        updateFavBadge();
    }
    if (id === 'campanas') {
        renderSavedCampaigns();
    }
    if (id === 'service' && typeof renderNexuService === 'function') {
        renderNexuService();
    }
}
// ===== GREETING =====
function initGreeting() {
    const nombre = UserStore.get('nombre') || 'Carlos';
    const h = new Date().getHours();
    const gr = h < 12 ? 'Buenos días' : h < 18 ? 'Buenas tardes' : 'Buenas noches';
    const el = document.querySelector('.home-welcome-name');
    if (el)
        el.innerHTML = `${gr}, <em>${nombre}.</em>`;
    const de = document.getElementById('greeting-date');
    if (de)
        de.textContent = new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}
// ===== TABS =====
function switchTab(screen, tabId, el) {
    const pfx = `${screen}-tab-`;
    document.querySelectorAll(`[id^="${pfx}"]`).forEach(t => t.classList.remove('active'));
    document.getElementById(pfx + tabId).classList.add('active');
    el.parentElement.querySelectorAll('.tab-item').forEach(t => t.classList.remove('active'));
    el.classList.add('active');
}
// ===== NOTIFICATIONS =====
const AGRONEX_ACTION_LOG_KEY = 'agronex_user_actions';
const AGRONEX_NOTIF_READ_KEY = 'agronex_notif_last_read';

function toggleNotifs() {
    const p = document.getElementById('notif-panel');
    const ov = document.getElementById('overlay');
    const open = p.style.display === 'block';
    if (open) {
        closeNotifs();
        return;
    }
    renderNotifications();
    p.style.display = 'block';
    ov.classList.add('active');
}
function closeNotifs() {
    document.getElementById('notif-panel').style.display = 'none';
    document.getElementById('overlay').classList.remove('active');
}
function getAgronexActions() {
    try {
        return JSON.parse(localStorage.getItem(AGRONEX_ACTION_LOG_KEY) || '[]');
    }
    catch (e) {
        return [];
    }
}
function saveAgronexActions(actions) {
    localStorage.setItem(AGRONEX_ACTION_LOG_KEY, JSON.stringify(actions.slice(0, 40)));
}
function pushUserAction(type, payload) {
    const actions = getAgronexActions();
    actions.unshift({ type, payload: payload || {}, ts: Date.now() });
    saveAgronexActions(actions);
    renderNotifications();
}
function getLastNotificationReadTime() {
    return parseInt(localStorage.getItem(AGRONEX_NOTIF_READ_KEY) || '0', 10) || 0;
}
function setLastNotificationReadTime(ts) {
    localStorage.setItem(AGRONEX_NOTIF_READ_KEY, ts.toString());
}
function humanizeAgo(ts) {
    const diff = Date.now() - ts;
    const minutes = Math.round(diff / 60000);
    if (minutes < 1)
        return 'Justo ahora';
    if (minutes < 60)
        return `Hace ${minutes} min`;
    const hours = Math.round(minutes / 60);
    if (hours < 24)
        return `Hace ${hours} h`;
    const days = Math.round(hours / 24);
    return days === 1 ? 'Ayer' : `Hace ${days} días`;
}
function uniqueNotifications(items) {
    const seen = new Set();
    return items.filter(item => {
        const key = `${item.title}|${item.body}`;
        if (seen.has(key))
            return false;
        seen.add(key);
        return true;
    });
}
function buildNotifications() {
    const actions = getAgronexActions();
    const notifs = [];
    const recentSearch = actions.find(a => a.type === 'search' && a.payload && a.payload.query && a.payload.query.length > 1);
    if (recentSearch) {
        notifs.push({
            icon: 'fas fa-search',
            title: 'Búsqueda inteligente',
            body: `Encontramos ofertas relacionadas con “${recentSearch.payload.query}”. Revisa la selección de mercado si querés reservar rápido.`,
            color: 'blue',
            type: 'opportunity',
            ts: recentSearch.ts,
        });
    }
    const lastViewed = actions.find(a => a.type === 'view_machine');
    if (lastViewed) {
        notifs.push({
            icon: 'fas fa-eye',
            title: 'Equipo observado',
            body: `Seguimiento activado para ${lastViewed.payload.title}. Te avisamos si cambian su disponibilidad o precio.`,
            color: 'amber',
            type: 'operativa',
            ts: lastViewed.ts,
        });
    }
    const bookingActions = actions.filter(a => a.type === 'reservation');
    if (bookingActions.length) {
        const latestBooking = bookingActions[0];
        notifs.push({
            icon: 'fas fa-calendar-check',
            title: 'Reserva en curso',
            body: `Reserva confirmada para ${latestBooking.payload.title}. Coordiná con WhatsApp cuando lo necesites.`,
            color: 'green',
            type: 'operativa',
            ts: latestBooking.ts,
        });
    }
    const serviceActions = actions.filter(a => a.type === 'service_request');
    if (serviceActions.length) {
        const latestService = serviceActions[0];
        notifs.push({
            icon: 'fas fa-wrench',
            title: 'Solicitud de servicio enviada',
            body: `Tu pedido de servicio para ${latestService.payload.machine || 'tu equipo'} fue enviado. Estamos en contacto con el técnico.`,
            color: 'blue',
            type: 'operativa',
            ts: latestService.ts,
        });
    }
    const profileActions = actions.filter(a => a.type === 'profile_update');
    if (profileActions.length) {
        const latestProfile = profileActions[0];
        notifs.push({
            icon: 'fas fa-user-check',
            title: 'Perfil actualizado',
            body: `Tu perfil ${latestProfile.payload.kind === 'personal' ? 'personal' : 'de cultivo'} se guardó correctamente. Ajustamos recomendaciones por vos.`,
            color: 'green',
            type: 'info',
            ts: latestProfile.ts,
        });
    }
    const calcAction = actions.find(a => a.type === 'calc_saved');
    if (calcAction) {
        const v = calcAction.payload || getCalcVals();
        const costNote = v.costoHa > 140 ? ' detectamos gastos más altos de lo habitual' : '';
        notifs.push({
            icon: 'fas fa-calculator',
            title: 'Cálculo registrado',
            body: `Tu cálculo fue guardado.${costNote} Revisá las recomendaciones para mejorar tu margen.`,
            color: 'amber',
            type: 'ahorro',
            ts: calcAction.ts,
        });
    }
    if (typeof AI !== 'undefined' && typeof AI.alerts === 'function') {
        AI.alerts().forEach(alert => {
            notifs.push({
                icon: 'fas fa-lightbulb',
                title: 'Oportunidad Agronex',
                body: alert.text,
                color: alert.color === 'red' ? 'red' : alert.color === 'amber' ? 'amber' : 'blue',
                type: 'recommendation',
                ts: Date.now(),
            });
        });
    }
    // Always include the most recent manual notification if no other items exist
    if (!notifs.length) {
        notifs.push({
            icon: 'fas fa-bell',
            title: 'Centro de notificaciones',
            body: 'Aquí verás alertas personalizadas sobre búsquedas recientes, reservas, gastos y solicitudes de servicio.',
            color: 'blue',
            type: 'info',
            ts: Date.now(),
        });
    }
    return uniqueNotifications(notifs)
        .sort((a, b) => b.ts - a.ts)
        .slice(0, 6);
}
function renderNotifications() {
    const panel = document.getElementById('notif-panel');
    const listRoot = document.getElementById('notif-list');
    if (!panel || !listRoot)
        return;
    listRoot.innerHTML = '';
    const notifications = buildNotifications();
    const lastRead = getLastNotificationReadTime();
    const unreadCount = notifications.filter(n => n.ts > lastRead).length;
    const dot = document.getElementById('notif-dot');
    if (dot) {
        dot.style.display = unreadCount ? 'inline-block' : 'none';
    }
    listRoot.innerHTML = notifications.map(n => {
        const unread = n.ts > lastRead ? 'unread' : '';
        return `<div class="notif-item ${unread} notif-${n.type}" data-notif-ts="${n.ts}">
            <div class="notif-icon ${n.color}"><i class="${n.icon}"></i></div>
            <div class="notif-body">
              <div class="notif-title">${n.title}</div>
              <div class="notif-time">${humanizeAgo(n.ts)}</div>
              <div class="notif-extra">${n.body}</div>
            </div>
          </div>`;
    }).join('');
}
function initNotifAccordion() {
    const panel = document.getElementById('notif-panel');
    if (!panel)
        return;
    panel.addEventListener('click', (event) => {
        const target = event.target;
        const action = target.closest('.notif-hdr-action');
        if (action)
            return;
        const item = target.closest('.notif-item');
        if (!item)
            return;
        event.stopPropagation();
        const expanded = item.classList.contains('expanded');
        const items = panel.querySelectorAll('.notif-item.expanded');
        items.forEach(el => el.classList.remove('expanded'));
        if (!expanded)
            item.classList.add('expanded');
    });
}
function markAllRead() {
    setLastNotificationReadTime(Date.now());
    document.querySelectorAll('.notif-item.unread').forEach(n => n.classList.remove('unread'));
    const dot = document.getElementById('notif-dot');
    if (dot)
        dot.style.display = 'none';
    closeNotifs();
    showToast('Todas las notificaciones leídas', 'success');
}
// ===== TOASTS =====
function showToast(msg, type = 'info') {
    const icons = { success: 'fa-check-circle', error: 'fa-times-circle', warning: 'fa-exclamation-triangle', info: 'fa-info-circle' };
    const tc = document.getElementById('toast-container');
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    t.innerHTML = `<i class="fas ${icons[type] || icons.info}"></i> ${msg}`;
    tc.appendChild(t);
    setTimeout(() => t.remove(), 3500);
}
// ===== CALCULATOR =====
function getCalcVals() {
    const g = (id) => { var _a; return parseFloat((_a = document.getElementById(id)) === null || _a === void 0 ? void 0 : _a.value) || 0; };
    const ha = Math.max(g('c-ha'), 1);
    // rend input is in display unit (qq or kg); convert to qq internally for calculations
    const rendDisplay = g('c-rend');
    const rend = perfilData.unidadGrano === 'kg' ? rendDisplay / QQ_TO_KG : rendDisplay;
    const precio = g('c-precio');
    const ingHa = rend * precio;
    const sem = g('c-sem'), fert = g('c-fert'), agro = g('c-agro');
    const comb = g('c-comb'), maq = g('c-maq'), mo = g('c-mo');
    const alq = g('c-alq'), com = g('c-com'), log = g('c-log'), seg = g('c-seg'), imp = g('c-imp');
    const directosHa = sem + fert + agro + comb + maq + mo;
    const indirectosHa = alq + com + log + seg + imp;
    const costoHa = directosHa + indirectosHa;
    const ganHa = ingHa - costoHa;
    const ganTotal = ganHa * ha;
    const ingTotal = ingHa * ha;
    const costoTotal = costoHa * ha;
    const directosTotal = directosHa * ha;
    const indirectosTotal = indirectosHa * ha;
    const margenPct = ingHa > 0 ? (ganHa / ingHa * 100).toFixed(1) : 0;
    const peQq = costoHa > 0 && precio > 0 ? (costoHa / precio).toFixed(1) : 0;
    // rendDisplay: value as typed by user (in their chosen unit), used for semaforo comparison
    return { ha, rend, rendDisplay, precio, ingHa, costoHa, ganHa, ganTotal, ingTotal, costoTotal, directosHa, indirectosHa, directosTotal, indirectosTotal, margenPct, peQq, maq, comb, sem, fert, agro, mo, alq, com, log, seg, imp };
}
function getCalcCultivoLabel() {
    const el = document.getElementById('c-cultivo');
    const value = el ? el.value : 'soja';
    return cultivoNombre[value] || value || 'Campaña';
}
function getSavedCampaigns() {
    try {
        const rows = JSON.parse(localStorage.getItem(AGRONEX_SAVED_CAMPAIGNS_KEY) || '[]');
        return Array.isArray(rows) ? rows : [];
    }
    catch (e) {
        return [];
    }
}
function saveSavedCampaigns(rows) {
    localStorage.setItem(AGRONEX_SAVED_CAMPAIGNS_KEY, JSON.stringify((rows || []).slice(0, 40)));
}
function buildSavedLoteDetails() {
    return lotes.map(l => {
        const ha = Math.max(Number(l.ha) || 0, 0);
        const sem = Number(l.sem) || 0, fert = Number(l.fert) || 0, agro = Number(l.agro) || 0;
        const comb = Number(l.comb) || 0, maq = Number(l.maq) || 0, mo = Number(l.mo) || 0, alq = Number(l.alq) || 0, log = Number(l.log) || 0;
        const rend = Number(l.rend) || 0, precio = Number(l.precio) || 0;
        const ingreso = rend * precio * ha;
        const gasto = (sem + fert + agro + comb + maq + mo + alq + log) * ha;
        const ganancia = ingreso - gasto;
        const margen = ingreso > 0 ? (ganancia / ingreso * 100) : 0;
        return {
            id: l.id,
            nombre: loteDisplayName(l),
            name: loteDisplayName(l),
            cultivo: cultivoNombre[l.cultivo] || l.cultivo || 'Lote',
            ha,
            ingreso,
            gasto,
            ganancia,
            margen,
            sem, fert, agro, comb, maq, mo, alq, log,
        };
    });
}
function buildSavedCampaignFromCalc() {
    const campaignName = getCampaignNameInput();
    if (calcMode === 'lotes') {
        const summary = calcLotes();
        const ha = lotes.reduce((s, l) => s + (Number(l.ha) || 0), 0);
        const cropNames = [...new Set(lotes.map(l => cultivoNombre[l.cultivo] || l.cultivo).filter(Boolean))];
        const title = cropNames.length === 1 ? cropNames[0] : `${cropNames.length || 0} cultivos`;
        const savedName = campaignName || fallbackCampaignName(title);
        const loteDetails = buildSavedLoteDetails();
        const ingreso = summary.ingTotal || 0;
        const gasto = summary.costoTotal || 0;
        const ganancia = summary.ganTotal || 0;
        const margen = ingreso > 0 ? (ganancia / ingreso * 100) : 0;
        const cultivoGuardado = (lotes[0] && lotes[0].cultivo) || 'soja';
        const opportunitiesSnapshot = generateOpportunities(summary, cultivoGuardado)
            .map(o => ({ id: o.id, title: o.title, impactUsd: o.impactUsd }));
        return {
            id: `camp_${Date.now()}`,
            name: savedName,
            crop: `Por lotes · ${title} ${new Date().getFullYear()}`,
            ha,
            ingreso,
            gasto,
            ganancia,
            margen,
            mode: 'lotes',
            lotes: lotes.map(l => Object.assign({}, l)),
            loteDetails,
            opportunities: opportunitiesSnapshot,
            createdAt: Date.now(),
        };
    }
    const v = getCalcVals();
    const cultivoGuardado = (document.getElementById('c-cultivo') && document.getElementById('c-cultivo').value) || 'soja';
    const savedName = campaignName || fallbackCampaignName(getCalcCultivoLabel());
    const opportunitiesSnapshot = generateOpportunities(v, cultivoGuardado)
        .map(o => ({ id: o.id, title: o.title, impactUsd: o.impactUsd }));
    return {
        id: `camp_${Date.now()}`,
        name: savedName,
        loteName: savedName,
        crop: `${getCalcCultivoLabel()} ${new Date().getFullYear()}`,
        cultivo: cultivoGuardado,
        ha: v.ha,
        ingreso: v.ingTotal,
        gasto: v.costoTotal,
        ganancia: v.ganTotal,
        margen: Number(v.margenPct) || 0,
        mode: 'simple',
        values: v,
        opportunities: opportunitiesSnapshot,
        createdAt: Date.now(),
    };
}
function formatSavedCampaignMoney(n) {
    return typeof fmtCalcCurrency === 'function' ? fmtCalcCurrency(n || 0) : `$${Math.round(n || 0).toLocaleString('es-AR')}`;
}
function formatSavedCampaignDate(ts) {
    if (!ts)
        return '—';
    const diff = Date.now() - ts;
    if (diff < 24 * 60 * 60 * 1000)
        return 'Hoy';
    const days = Math.round(diff / (24 * 60 * 60 * 1000));
    if (days === 1)
        return 'Ayer';
    if (days < 8)
        return `Hace ${days} días`;
    return new Date(ts).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });
}
function savedCampaignRowsWithFallback() {
    const saved = getSavedCampaigns();
    if (saved.length)
        return saved;
    return [
        { crop: 'Soja 24/25', ha: 150, ingreso: 99000, gasto: 55500, ganancia: 43500, margen: 44, createdAt: Date.now() },
        { crop: 'Maíz 24/25', ha: 270, ingreso: 112320, gasto: 81000, ganancia: 31320, margen: 28, createdAt: Date.now() - 3 * 86400000 },
        { crop: 'Soja 23/24', ha: 420, ingreso: 277200, gasto: 153720, ganancia: 123480, margen: 45, createdAt: Date.now() - 90 * 86400000 },
        { crop: 'Trigo 23', ha: 80, ingreso: 44880, gasto: 47200, ganancia: -2320, margen: -5, createdAt: Date.now() - 130 * 86400000 },
    ];
}
const TREND_CONTEXT_TEXT = 'Comparado con la campaña anterior';
const TREND_NEUTRAL_EPS = 0.5;
const TREND_SYMBOL_HTML = { up: '&uarr;', down: '&darr;', neutral: '&mdash;' };
function trendForMetric(current, previous, metricType = 'profit', unit = '') {
    const cur = Number(current);
    const prev = Number(previous);
    if (!Number.isFinite(cur) || !Number.isFinite(prev))
        return { dir: 'neutral', symbol: '—', text: 'Sin comparación', color: 'var(--text-muted)', title: TREND_CONTEXT_TEXT };
    const diff = cur - prev;
    if (Math.abs(diff) <= TREND_NEUTRAL_EPS)
        return { dir: 'neutral', symbol: '—', text: 'Sin variación', color: 'var(--text-muted)', title: TREND_CONTEXT_TEXT };
    const lowerIsBetter = ['cost', 'tax', 'fuel'].includes(metricType);
    const improved = lowerIsBetter ? diff < 0 : diff > 0;
    const abs = Math.abs(diff);
    const valueText = `${diff > 0 ? '+' : '-'}${Number.isInteger(abs) ? abs.toFixed(0) : abs.toFixed(1)}${unit}`;
    return {
        dir: improved ? 'up' : 'down',
        symbol: improved ? '↑' : '↓',
        text: `${improved ? '↑' : '↓'} ${valueText}`,
        color: improved ? 'var(--green-600)' : 'var(--red-400)',
        title: TREND_CONTEXT_TEXT,
    };
}
function normalizeCampaignCropName(name) {
    return String(name || '')
        .replace(/^Por lotes\s*·\s*/i, '')
        .replace(/\b(19|20)\d{2}(\/\d{2})?\b/g, '')
        .replace(/\b\d{2}\/\d{2}\b/g, '')
        .trim()
        .split(/\s+/)[0]
        .toLowerCase();
}
function findComparableSavedCampaign(current) {
    const rows = getSavedCampaigns().slice().sort((a, b) => (Number(b.createdAt) || 0) - (Number(a.createdAt) || 0));
    if (!rows.length)
        return null;
    if (calcMode === 'lotes')
        return rows.find(r => r.mode === 'lotes') || rows[0] || null;
    const crop = normalizeCampaignCropName((current && current.crop) || getCalcCultivoLabel());
    return rows.find(r => normalizeCampaignCropName(r.crop) === crop) || rows[0] || null;
}
function savedCampaignKey(row, idx) {
    return row && row.id ? String(row.id) : `idx-${idx}`;
}
function deleteSavedCampaign(key) {
    const rows = getSavedCampaigns();
    const filtered = rows.filter((row, idx) => savedCampaignKey(row, idx) !== String(key));
    if (filtered.length === rows.length)
        return;
    saveSavedCampaigns(filtered);
    renderSavedCampaigns();
    if (typeof showToast === 'function')
        showToast('Campania eliminada', 'success');
}
if (typeof window !== 'undefined')
    window.deleteSavedCampaign = deleteSavedCampaign;
function beginEditSavedCampaign(key) {
    const rows = getSavedCampaigns();
    const idx = rows.findIndex((row, rowIdx) => savedCampaignKey(row, rowIdx) === String(key));
    const row = rows[idx];
    if (!row)
        return;
    editingSavedCampaignKey = String(key);
    const nameInput = document.getElementById('c-campaign-name');
    if (nameInput)
        nameInput.value = row.name || row.crop || '';
    if (row.mode === 'lotes' && Array.isArray(row.lotes)) {
        switchCalcMode('lotes');
        lotes = row.lotes.map((l, i) => Object.assign({ id: i + 1, nombre: `Lote ${i + 1}` }, l));
        const details = Array.isArray(row.loteDetails) ? row.loteDetails : [];
        lotes.forEach((l, i) => {
            if (details[i]) {
                l.nombre = details[i].name || details[i].nombre || l.nombre;
            }
        });
        loteCounter = lotes.reduce((max, l) => Math.max(max, Number(l.id) || 0), 0);
        renderLotes();
    }
    else {
        switchCalcMode('simple');
        const v = row.values || {};
        const map = {
            'c-ha': v.ha || row.ha,
            'c-rend': v.rendDisplay || v.rend,
            'c-precio': v.precio,
            'c-sem': v.sem,
            'c-fert': v.fert,
            'c-agro': v.agro,
            'c-comb': v.comb,
            'c-maq': v.maq,
            'c-mo': v.mo,
            'c-alq': v.alq,
            'c-com': v.com,
            'c-log': v.log,
            'c-seg': v.seg,
            'c-imp': v.imp,
        };
        Object.keys(map).forEach(id => {
            const el = document.getElementById(id);
            if (el && map[id] != null)
                el.value = map[id];
        });
        const cultivoEl = document.getElementById('c-cultivo');
        if (cultivoEl && row.cultivo)
            cultivoEl.value = row.cultivo;
        calcAuto();
    }
    showScreen('calc');
    if (typeof showToast === 'function')
        showToast('Campaña lista para modificar. Guardá para actualizarla.', 'info');
}
if (typeof window !== 'undefined')
    window.beginEditSavedCampaign = beginEditSavedCampaign;
function renderSavedCampaigns() {
    const rows = savedCampaignRowsWithFallback();
    const tbody = document.getElementById('campanas-history-tbody');
    const lotesSummary = row => {
        if (!row || row.mode !== 'lotes' || !Array.isArray(row.loteDetails) || !row.loteDetails.length)
            return '';
        return row.loteDetails.map(l => `${l.cultivo} ${Math.round(l.ha || 0)} ha`).join(' · ');
    };
    const fmtVs = (row, idx) => {
        const prev = rows[idx + 1];
        if (!prev || !Number.isFinite(Number(prev.margen)))
            return { text: '—', color: 'var(--text-muted)', title: TREND_CONTEXT_TEXT };
        return trendForMetric(Number(row.margen) || 0, Number(prev.margen) || 0, 'profit', '%');
    };
    const oppsBadge = row => {
        const count = row && Array.isArray(row.opportunities) ? row.opportunities.length : 0;
        if (!count)
            return '';
        return `<div class="camp-opps-badge"><i class="fas fa-lightbulb"></i>${count} oportunidad${count > 1 ? 'es' : ''} detectada${count > 1 ? 's' : ''}</div>`;
    };
    if (tbody) {
        tbody.innerHTML = rows.map((r, idx) => {
            const isNeg = (Number(r.ganancia) || 0) < 0;
            const vs = fmtVs(r, idx);
            const detail = lotesSummary(r);
            const key = savedCampaignKey(r, idx);
            return `<tr>
        <td><strong>${r.crop || 'Campaña'}</strong>${detail ? `<div style="font-size:12px;color:var(--text-secondary);font-weight:700;margin-top:3px;">${detail}</div>` : ''}${oppsBadge(r)}</td>
        <td>${Math.round(r.ha || 0)} ha</td>
        <td>${formatSavedCampaignMoney(r.ingreso)}</td>
        <td>${formatSavedCampaignMoney(r.gasto)}</td>
        <td style="color:${isNeg ? 'var(--red-400)' : 'var(--green-600)'};font-weight:900;">${formatSavedCampaignMoney(r.ganancia)}</td>
        <td><span class="chip ${isNeg ? 'chip-red' : 'chip-green'}">${Math.round(r.margen || 0)}%</span></td>
        <td><span title="${vs.title}" style="color:${vs.color};font-size:13px;font-weight:900;">${vs.text}</span></td>
        <td>${formatSavedCampaignDate(r.createdAt)}</td>
        <td>
          <div class="campana-actions">
            <button class="btn btn-ghost btn-xs" onclick="showScreen('calc')" title="Recalcular"><i class="fas fa-redo"></i></button>
            <button class="btn btn-ghost btn-xs campana-delete-btn" onclick="deleteSavedCampaign('${key}')" title="Eliminar campania"><i class="fas fa-trash"></i></button>
          </div>
        </td>
      </tr>`;
        }).join('');
    }
    const list = document.getElementById('campanas-mobile-list');
    if (list) {
        list.innerHTML = rows.map((r, idx) => {
            const isNeg = (Number(r.ganancia) || 0) < 0;
            const vs = fmtVs(r, idx);
            const detail = lotesSummary(r);
            const key = savedCampaignKey(r, idx);
            return `
    <div class="campana-card">
      <div class="campana-card-top">
        <div><div class="campana-card-crop">${r.crop || 'Campaña'}</div><div class="campana-card-ha">${Math.round(r.ha || 0)} ha · ${formatSavedCampaignDate(r.createdAt)}${detail ? `<br>${detail}` : ''}</div>${oppsBadge(r)}</div>
        <span class="chip ${isNeg ? 'chip-red' : 'chip-green'}">${Math.round(r.margen || 0)}%</span>
      </div>
      <div class="campana-card-stats">
        <div class="campana-stat"><div class="campana-stat-lbl">Ingreso</div><div class="campana-stat-val">${formatSavedCampaignMoney(r.ingreso)}</div></div>
        <div class="campana-stat"><div class="campana-stat-lbl">Gasto</div><div class="campana-stat-val">${formatSavedCampaignMoney(r.gasto)}</div></div>
        <div class="campana-stat"><div class="campana-stat-lbl">Ganancia</div><div class="campana-stat-val ${isNeg ? 'neg' : 'pos'}">${formatSavedCampaignMoney(r.ganancia)}</div></div>
      </div>
      <div class="campana-card-footer">
        <span title="${vs.title}" style="font-size:13px;font-weight:900;color:${vs.color}">${vs.text}</span>
        <div class="campana-actions">
          <button class="btn btn-ghost btn-xs" onclick="showScreen('calc')" title="Recalcular"><i class="fas fa-redo"></i></button>
          <button class="btn btn-ghost btn-xs campana-delete-btn" onclick="deleteSavedCampaign('${key}')" title="Eliminar campania"><i class="fas fa-trash"></i></button>
        </div>
      </div>
    </div>`;
        }).join('');
    }
}
function fmtUSD(n) {
    const abs = Math.abs(Math.round(n));
    const str = abs.toLocaleString('es-AR');
    return (n < 0 ? '-$' : '$') + str;
}
function fmtCalcCurrency(n) {
    return fmtMoneda(n, perfilData.moneda, getTC());
}
// ===== BENCHMARKS POR CULTIVO (USD/ha, valores regionales estimados) =====
const BENCHMARKS = {
    soja: {
        sem: { opt: 42, hi: 55, label: 'Compra de semilla' },
        fert: { opt: 55, hi: 75, label: 'Fertilizantes' },
        agro: { opt: 32, hi: 45, label: 'Agroquímicos' },
        comb: { opt: 25, hi: 35, label: 'Combustible' },
        maq: { opt: 38, hi: 55, label: 'Maquinaria' },
        mo: { opt: 18, hi: 28, label: 'Empleados' },
        rend: { low: 22, opt_lo: 28, opt_hi: 40, hi: 48, },
        precio: { low: 18, opt_lo: 20, opt_hi: 27, hi: 32, },
    },
    maiz: {
        sem: { opt: 75, hi: 100, label: 'Compra de semilla' },
        fert: { opt: 90, hi: 120, label: 'Fertilizantes' },
        agro: { opt: 38, hi: 52, label: 'Agroquímicos' },
        comb: { opt: 32, hi: 44, label: 'Combustible' },
        maq: { opt: 55, hi: 75, label: 'Maquinaria' },
        mo: { opt: 22, hi: 32, label: 'Empleados' },
        rend: { low: 55, opt_lo: 70, opt_hi: 110, hi: 130, },
        precio: { low: 14, opt_lo: 16, opt_hi: 22, hi: 27, },
    },
    trigo: {
        sem: { opt: 35, hi: 48, label: 'Compra de semilla' },
        fert: { opt: 65, hi: 88, label: 'Fertilizantes' },
        agro: { opt: 28, hi: 40, label: 'Agroquímicos' },
        comb: { opt: 22, hi: 30, label: 'Combustible' },
        maq: { opt: 42, hi: 58, label: 'Maquinaria' },
        mo: { opt: 15, hi: 22, label: 'Empleados' },
        rend: { low: 25, opt_lo: 32, opt_hi: 55, hi: 65, },
        precio: { low: 16, opt_lo: 18, opt_hi: 25, hi: 30, },
    },
    girasol: {
        sem: { opt: 30, hi: 42, label: 'Compra de semilla' },
        fert: { opt: 40, hi: 56, label: 'Fertilizantes' },
        agro: { opt: 25, hi: 36, label: 'Agroquímicos' },
        comb: { opt: 20, hi: 28, label: 'Combustible' },
        maq: { opt: 38, hi: 52, label: 'Maquinaria' },
        mo: { opt: 14, hi: 20, label: 'Empleados' },
        rend: { low: 15, opt_lo: 20, opt_hi: 32, hi: 38, },
        precio: { low: 22, opt_lo: 25, opt_hi: 34, hi: 40, },
    },
    cebada: {
        sem: { opt: 36, hi: 50, label: 'Compra de semilla' },
        fert: { opt: 58, hi: 78, label: 'Fertilizantes' },
        agro: { opt: 22, hi: 32, label: 'Agroquímicos' },
        comb: { opt: 23, hi: 32, label: 'Combustible' },
        maq: { opt: 34, hi: 48, label: 'Maquinaria' },
        mo: { opt: 16, hi: 24, label: 'Empleados' },
        rend: { low: 28, opt_lo: 35, opt_hi: 55, hi: 65, },
        precio: { low: 14, opt_lo: 16, opt_hi: 21, hi: 26, },
    },
    sorgo: {
        sem: { opt: 18, hi: 28, label: 'Compra de semilla' },
        fert: { opt: 45, hi: 62, label: 'Fertilizantes' },
        agro: { opt: 18, hi: 26, label: 'Agroquímicos' },
        comb: { opt: 20, hi: 28, label: 'Combustible' },
        maq: { opt: 30, hi: 42, label: 'Maquinaria' },
        mo: { opt: 14, hi: 20, label: 'Empleados' },
        rend: { low: 35, opt_lo: 50, opt_hi: 75, hi: 90, },
        precio: { low: 9, opt_lo: 11, opt_hi: 14, hi: 18, },
    },
    arroz: {
        sem: { opt: 50, hi: 70, label: 'Compra de semilla' },
        fert: { opt: 75, hi: 100, label: 'Fertilizantes' },
        agro: { opt: 30, hi: 44, label: 'Agroquímicos' },
        comb: { opt: 40, hi: 55, label: 'Combustible' },
        maq: { opt: 60, hi: 82, label: 'Maquinaria' },
        mo: { opt: 35, hi: 50, label: 'Empleados' },
        rend: { low: 45, opt_lo: 60, opt_hi: 80, hi: 95, },
        precio: { low: 16, opt_lo: 19, opt_hi: 24, hi: 30, },
    },
    algodon: {
        sem: { opt: 40, hi: 56, label: 'Compra de semilla' },
        fert: { opt: 65, hi: 88, label: 'Fertilizantes' },
        agro: { opt: 45, hi: 62, label: 'Agroquímicos' },
        comb: { opt: 28, hi: 40, label: 'Combustible' },
        maq: { opt: 50, hi: 68, label: 'Maquinaria' },
        mo: { opt: 30, hi: 44, label: 'Empleados' },
        rend: { low: 8, opt_lo: 12, opt_hi: 18, hi: 22, },
        precio: { low: 42, opt_lo: 50, opt_hi: 65, hi: 80, },
    },
    mani: {
        sem: { opt: 55, hi: 75, label: 'Compra de semilla' },
        fert: { opt: 50, hi: 68, label: 'Fertilizantes' },
        agro: { opt: 30, hi: 42, label: 'Agroquímicos' },
        comb: { opt: 25, hi: 35, label: 'Combustible' },
        maq: { opt: 45, hi: 62, label: 'Maquinaria' },
        mo: { opt: 20, hi: 30, label: 'Empleados' },
        rend: { low: 18, opt_lo: 25, opt_hi: 35, hi: 42, },
        precio: { low: 24, opt_lo: 28, opt_hi: 36, hi: 44, },
    },
    avena: {
        sem: { opt: 28, hi: 40, label: 'Compra de semilla' },
        fert: { opt: 42, hi: 58, label: 'Fertilizantes' },
        agro: { opt: 18, hi: 26, label: 'Agroquímicos' },
        comb: { opt: 18, hi: 26, label: 'Combustible' },
        maq: { opt: 28, hi: 40, label: 'Maquinaria' },
        mo: { opt: 13, hi: 20, label: 'Empleados' },
        rend: { low: 18, opt_lo: 25, opt_hi: 40, hi: 50, },
        precio: { low: 11, opt_lo: 13, opt_hi: 17, hi: 22, },
    },
};
const OTROS_GASTOS_BENCHMARKS = {
    soja: { alq: { opt: 120, hi: 165 }, com: { opt: 18, hi: 28 }, log: { opt: 22, hi: 35 }, seg: { opt: 10, hi: 18 }, imp: { opt: 15, hi: 26 } },
    maiz: { alq: { opt: 125, hi: 175 }, com: { opt: 22, hi: 34 }, log: { opt: 28, hi: 44 }, seg: { opt: 12, hi: 20 }, imp: { opt: 18, hi: 30 } },
    trigo: { alq: { opt: 100, hi: 145 }, com: { opt: 16, hi: 26 }, log: { opt: 20, hi: 32 }, seg: { opt: 9, hi: 16 }, imp: { opt: 13, hi: 22 } },
    girasol: { alq: { opt: 105, hi: 150 }, com: { opt: 15, hi: 24 }, log: { opt: 24, hi: 38 }, seg: { opt: 8, hi: 15 }, imp: { opt: 12, hi: 21 } },
    cebada: { alq: { opt: 98, hi: 140 }, com: { opt: 15, hi: 24 }, log: { opt: 21, hi: 34 }, seg: { opt: 8, hi: 15 }, imp: { opt: 12, hi: 21 } },
    sorgo: { alq: { opt: 85, hi: 125 }, com: { opt: 12, hi: 20 }, log: { opt: 24, hi: 38 }, seg: { opt: 7, hi: 13 }, imp: { opt: 10, hi: 18 } },
    arroz: { alq: { opt: 135, hi: 190 }, com: { opt: 24, hi: 38 }, log: { opt: 40, hi: 62 }, seg: { opt: 16, hi: 28 }, imp: { opt: 24, hi: 40 } },
    algodon: { alq: { opt: 115, hi: 165 }, com: { opt: 20, hi: 32 }, log: { opt: 34, hi: 52 }, seg: { opt: 14, hi: 24 }, imp: { opt: 22, hi: 36 } },
    mani: { alq: { opt: 130, hi: 180 }, com: { opt: 20, hi: 32 }, log: { opt: 32, hi: 50 }, seg: { opt: 13, hi: 22 }, imp: { opt: 20, hi: 34 } },
    avena: { alq: { opt: 80, hi: 118 }, com: { opt: 11, hi: 19 }, log: { opt: 18, hi: 30 }, seg: { opt: 7, hi: 13 }, imp: { opt: 10, hi: 18 } },
};
function applyOtrosGastosBenchmarks() {
    const labels = {
        alq: 'Alquiler / arrendamiento',
        com: 'Comercialización',
        log: 'Distribucion / logistica',
        seg: 'Seguro',
        imp: 'Administración / impuestos',
    };
    const sojaBase = OTROS_GASTOS_BENCHMARKS.soja;
    Object.keys(BENCHMARKS).forEach(cultivo => {
        const cfg = OTROS_GASTOS_BENCHMARKS[cultivo] || sojaBase;
        Object.keys(labels).forEach(field => {
            if (!BENCHMARKS[cultivo][field]) {
                BENCHMARKS[cultivo][field] = Object.assign(Object.assign({}, cfg[field]), { label: labels[field] });
            }
        });
    });
}
applyOtrosGastosBenchmarks();
function applySemaforo(fieldId, value, cultivo) {
    var _a;
    const input = document.getElementById('c-' + fieldId);
    const badge = document.getElementById('sb-' + fieldId);
    const tip = document.getElementById('st-' + fieldId);
    if (!input || !((_a = BENCHMARKS[cultivo]) === null || _a === void 0 ? void 0 : _a[fieldId]))
        return;
    const { level, tipText } = classifyField(fieldId, value, cultivo);
    applyFieldSemaforo(input, badge, tip, level, tipText);
}
// ===== SISTEMA DE FLECHAS DE TENDENCIA =====
// Las flechas del resultado comparan margen/rentabilidad contra una campaña previa real.
const ARROW_CONFIG = {
    leve_pos: { arrows: 1, dir: 'up', label: 'Mejora leve', msg: 'Estás mejorando' },
    buena_pos: { arrows: 2, dir: 'up', label: 'Mejora clara', msg: 'Mejor que la campaña anterior' },
    excelente_pos: { arrows: 3, dir: 'up', label: 'Mejora fuerte', msg: 'Mejoraste mucho' },
    leve_neg: { arrows: 1, dir: 'down', label: 'Baja leve', msg: 'Estás empeorando' },
    importante_neg: { arrows: 2, dir: 'down', label: 'Baja clara', msg: 'Peor que la campaña anterior' },
    grave_neg: { arrows: 3, dir: 'down', label: 'Baja fuerte', msg: 'Empeoraste mucho' },
    neutro: { arrows: 0, dir: 'none', label: 'Sin variación', msg: 'Sin cambios relevantes' },
};
function getArrowConfigFromTrend(trend) {
    if (!trend || trend.dir === 'neutral')
        return ARROW_CONFIG.neutro;
    const abs = Math.abs(Number(trend.diff) || 0);
    if (trend.dir === 'up') {
        if (abs >= 10)
            return ARROW_CONFIG.excelente_pos;
        if (abs >= 3)
            return ARROW_CONFIG.buena_pos;
        return ARROW_CONFIG.leve_pos;
    }
    if (abs >= 10)
        return ARROW_CONFIG.grave_neg;
    if (abs >= 3)
        return ARROW_CONFIG.importante_neg;
    return ARROW_CONFIG.leve_neg;
}
function getResultTrend(current) {
    const prev = findComparableSavedCampaign(current);
    const currentMargin = Number(current && current.margenPct);
    if (!prev) {
        if (!Number.isFinite(currentMargin) || Math.abs(currentMargin) <= TREND_NEUTRAL_EPS)
            return { dir: 'neutral', diff: 0, text: 'Sin comparacion', title: 'Sin campania anterior guardada' };
        return {
            dir: currentMargin > 0 ? 'up' : 'down',
            diff: currentMargin,
            text: 'Rentabilidad actual',
            title: 'Sin campania anterior guardada',
        };
    }
    const prevMargin = Number(prev.margen);
    const trend = trendForMetric(currentMargin, prevMargin, 'profit', '%');
    trend.diff = currentMargin - prevMargin;
    return trend;
}
function updateResultStateLegacy(ganTotal, ganHa, ingHa, currentValues) {
    const hdr = document.getElementById('result-state-hdr');
    const label = document.getElementById('result-state-label');
    const badge = document.getElementById('result-intensity-badge');
    const mainBlock = document.querySelector('.result-main');
    const mainLbl = document.getElementById('result-main-lbl');
    const arr1 = document.getElementById('arr-1');
    const arr2 = document.getElementById('arr-2');
    const arr3 = document.getElementById('arr-3');
    if (!hdr || !label)
        return;
    const resultTrend = getResultTrend(currentValues || { ganTotal, ganHa, ingHa, margenPct: ingHa > 0 ? ganHa / ingHa * 100 : 0 });
    const cfg = getArrowConfigFromTrend(resultTrend);
    // Clear state classes
    hdr.classList.remove('state-positive', 'state-negative', 'state-neutral');
    if (mainBlock)
        mainBlock.classList.remove('state-negative');
    // Determine state and arrow character
    const isUp = cfg.dir === 'up';
    const isDown = cfg.dir === 'down';
    const isNone = cfg.dir === 'none';
    const arrowChar = isUp ? '↑' : isDown ? '↓' : '—';
    const activeClass = isUp ? 'active-up' : isDown ? 'active-down' : '';
    // Apply state background
    if (isUp)
        hdr.classList.add('state-positive');
    else if (isDown) {
        hdr.classList.add('state-negative');
        if (mainBlock)
            mainBlock.classList.add('state-negative');
    }
    else
        hdr.classList.add('state-neutral');
    // Update labels
    label.textContent = cfg.msg;
    if (badge)
        badge.textContent = cfg.label;
    if (hdr)
        hdr.title = resultTrend.title || TREND_CONTEXT_TEXT;
    if (badge)
        badge.title = resultTrend.title || TREND_CONTEXT_TEXT;
    if (mainLbl)
        mainLbl.textContent = ganTotal < 0 ? 'Pérdida total estimada' : 'Ganancia total estimada';
    // Render arrows
    [arr1, arr2, arr3].forEach((el, i) => {
        if (!el)
            return;
        el.textContent = arrowChar;
        el.className = 'result-arrow';
        el.title = resultTrend.title || TREND_CONTEXT_TEXT;
        el.style.opacity = '';
        if (isNone) {
            el.style.opacity = i === 1 ? '0.25' : '0.1';
            el.textContent = '—';
            return;
        }
        const isActive = (i + 1) <= cfg.arrows;
        el.classList.add(activeClass);
        if (isActive) {
            el.classList.add('anim-arrow');
        }
        else {
            el.classList.add('dim');
        }
    });
}
function updateResultState(ganTotal, ganHa, ingHa, currentValues) {
    const hdr = document.getElementById('result-state-hdr');
    const label = document.getElementById('result-state-label');
    const badge = document.getElementById('result-intensity-badge');
    const mainBlock = document.querySelector('.result-main');
    const mainLbl = document.getElementById('result-main-lbl');
    const arrows = [
        document.getElementById('arr-1'),
        document.getElementById('arr-2'),
        document.getElementById('arr-3'),
    ];
    if (!hdr || !label)
        return;
    const isProfit = ganTotal > 0;
    const isLoss = ganTotal < 0;
    const cfg = isProfit
        ? { arrows: 3, dir: 'up', label: 'Ganancia', msg: 'Campania rentable' }
        : isLoss
            ? { arrows: 3, dir: 'down', label: 'Perdida', msg: 'Campania con perdida' }
            : { arrows: 0, dir: 'none', label: 'Neutro', msg: 'Resultado equilibrado' };
    const stateTitle = 'Segun la ganancia estimada actual';
    const isUp = cfg.dir === 'up';
    const isDown = cfg.dir === 'down';
    const isNone = cfg.dir === 'none';
    const activeClass = isUp ? 'active-up' : isDown ? 'active-down' : '';
    const arrowHtml = isUp ? TREND_SYMBOL_HTML.up : isDown ? TREND_SYMBOL_HTML.down : TREND_SYMBOL_HTML.neutral;
    hdr.classList.remove('state-positive', 'state-negative', 'state-neutral');
    if (mainBlock)
        mainBlock.classList.remove('state-negative');
    if (isUp)
        hdr.classList.add('state-positive');
    else if (isDown) {
        hdr.classList.add('state-negative');
        if (mainBlock)
            mainBlock.classList.add('state-negative');
    }
    else
        hdr.classList.add('state-neutral');
    label.textContent = cfg.msg;
    if (badge)
        badge.textContent = cfg.label;
    hdr.title = stateTitle;
    if (badge)
        badge.title = stateTitle;
    if (mainLbl)
        mainLbl.textContent = ganTotal < 0 ? 'Perdida total estimada' : 'Ganancia total estimada';
    arrows.forEach((el, i) => {
        if (!el)
            return;
        el.innerHTML = arrowHtml;
        el.className = 'result-arrow';
        el.title = stateTitle;
        el.style.opacity = '';
        if (isNone) {
            el.style.opacity = i === 1 ? '0.25' : '0.1';
            el.innerHTML = TREND_SYMBOL_HTML.neutral;
            return;
        }
        const isActive = (i + 1) <= cfg.arrows;
        el.classList.add(activeClass);
        if (isActive)
            el.classList.add('anim-arrow');
        else
            el.classList.add('dim');
    });
}
function updateAlquilerField() {
    var _a;
    const tenencia = (_a = document.getElementById('c-tenencia')) === null || _a === void 0 ? void 0 : _a.value;
    const alqGroup = document.getElementById('alq-group');
    const alqInput = document.getElementById('c-alq');
    const badge = document.getElementById('alq-propio-badge');
    if (!alqGroup || !alqInput)
        return;
    const esPropio = tenencia === 'propio';
    alqGroup.classList.toggle('alq-disabled', esPropio);
    if (badge)
        badge.style.display = esPropio ? 'inline-flex' : 'none';
    // Zero out for calc if propio
    alqInput.dataset.realVal = alqInput.dataset.realVal || alqInput.value;
    if (esPropio) {
        alqInput.dataset.realVal = alqInput.value;
        alqInput.value = 0;
    }
    else {
        if (alqInput.value === '0' && alqInput.dataset.realVal) {
            alqInput.value = alqInput.dataset.realVal;
        }
    }
}
function calcAuto() {
    var _a, _b;
    if (calcMode === 'lotes') {
        calcLotes();
        return;
    }
    // Alquiler / tenencia logic first
    updateAlquilerField();
    const v = getCalcVals();
    const cultivo = ((_a = document.getElementById('c-cultivo')) === null || _a === void 0 ? void 0 : _a.value) || 'soja';
    const cultivoMap = { soja: 'Soja', maiz: 'Maíz', trigo: 'Trigo', girasol: 'Girasol', cebada: 'Cebada', sorgo: 'Sorgo', arroz: 'Arroz', algodon: 'Algodón', mani: 'Maní', avena: 'Avena' };
    const mon = perfilData.moneda;
    const tc = +(((_b = document.getElementById('tc-ars')) === null || _b === void 0 ? void 0 : _b.value) || 1285);
    const fv = val => fmtMoneda(val, mon, tc);
    // Subtitle
    const sub = document.getElementById('calc-subtitle');
    if (sub)
        sub.textContent = `${cultivoMap[cultivo]} · ${v.ha} ha`;
    // Main value
    const gEl = document.getElementById('r-ganancia');
    if (gEl) {
        gEl.textContent = fv(v.ganTotal);
        gEl.className = 'result-main-val' + (v.ganTotal < 0 ? ' negative' : '');
    }
    const mainSub = document.getElementById('result-main-sub');
    if (mainSub) {
        const label = v.ganHa >= 0 ? 'Ganancia por hectárea' : 'Pérdida por hectárea';
        mainSub.textContent = `${label}: ${fv(Math.abs(v.ganHa))}`;
        mainSub.className = 'result-main-sub ' + (v.ganHa >= 0 ? 'green' : 'red');
    }
    const setEl = (id, val) => { const e = document.getElementById(id); if (e)
        e.textContent = val; };
    setEl('r-ingreso', fv(v.ingTotal));
    setEl('r-costo', fv(v.costoTotal));
    setEl('r-directos', `${fv(v.costoHa)}${haLabel()}`);
    setEl('r-indirectos', fv(v.indirectosTotal));
    setEl('r-margen', `${fv(v.ganHa)}${haLabel()}`);
    setEl('r-pe', v.peQq ? `${toDisplayUnit(+v.peQq).toFixed(1)} ${granoLabel()}/ha` : '—');
    // Color margen
    const mEl = document.getElementById('r-margen');
    if (mEl)
        mEl.className = 'result-row-val ' + (v.ganHa >= 0 ? 'green' : 'red');
    // Apply semaforo to all benchmarked fields, including indirect/future expense fields
    ['sem', 'fert', 'agro', 'comb', 'maq', 'mo', 'alq', 'com', 'log', 'seg', 'imp'].forEach(f => applySemaforo(f, v[f], cultivo));
    // rend semaforo uses the display value (in user's unit); benchmarks scale accordingly
    applySemaforo('rend', v.rendDisplay, cultivo);
    applySemaforo('precio', v.precio, cultivo);
    updateResultState(v.ganTotal, v.ganHa, v.ingHa, Object.assign({ crop: getCalcCultivoLabel() }, v));
    renderInsight(v);
    renderCalcSim(v);
    renderCalcChart(v);
    if (window.LivePrices)
        window.LivePrices.showSuggestionBadge(cultivo);
    renderOpportunities(v, cultivo);
}
function renderInsight(v) {
    const block = document.getElementById('r-insight');
    if (!block)
        return;
    block.innerHTML = '';
    block.style.display = 'none';
}
function selectSimMode(mode, el) {
    simMode = mode;
    document.querySelectorAll('.calc-sim-btn').forEach(b => b.classList.remove('active'));
    if (el)
        el.classList.add('active');
    if (calcMode === 'lotes')
        calcLotes();
    else
        renderCalcSim(getCalcVals());
}
function getLogisticsRecommendation(v, cultivo) {
    const bm = (BENCHMARKS[cultivo] || BENCHMARKS.soja || {}).log;
    const logCost = Number(v && v.log) || 0;
    const ha = Math.max(Number(v && v.ha) || 0, 0);
    if (!bm || !logCost || logCost <= bm.opt)
        return null;
    const shouldBuy = ha >= 450 && logCost > bm.hi;
    const saving = Math.max((logCost - bm.opt) * ha, 0);
    return {
        shouldBuy,
        saving,
        title: shouldBuy ? 'Logistica alta: comparar compra vs alquiler' : 'Logistica alta: conviene alquilar capacidad',
        text: shouldBuy
            ? `Con ${ha} ha y ${fmtCalcCurrency(logCost)}/ha en logistica, compara comprar tolva/acoplado o camion usado contra alquilar por campania.`
            : `Con ${ha} ha y ${fmtCalcCurrency(logCost)}/ha en logistica, lo mas prudente es alquilar camiones o acoplados por campania antes de inmovilizar capital.`,
        cta: shouldBuy ? 'Comparar camiones y acoplados' : 'Ver camiones y acoplados'
    };
}
function renderCalcSim(v) {
    const block = document.getElementById('calc-sim-result');
    if (!block)
        return;
    const cultivo = calcMode === 'lotes' && lotes[0]
        ? lotes[0].cultivo
        : ((document.getElementById('c-cultivo') && document.getElementById('c-cultivo').value) || 'soja');
    const logRec = getLogisticsRecommendation(v, cultivo);
    const logCTA = logRec
        ? `<div style="margin-top:10px;padding:10px 12px;background:var(--bg-secondary);border-radius:var(--r-md);border-left:3px solid var(--blue-400);">
          <div style="font-size:11px;font-weight:700;color:var(--blue-600);margin-bottom:4px;"><i class="fas fa-truck"></i> ${logRec.title}</div>
          <div style="font-size:12px;color:var(--text-secondary);margin-bottom:8px;">${logRec.text} Ahorro potencial estimado: <strong>${fmtCalcCurrency(logRec.saving)}</strong>.</div>
          <button class="btn btn-secondary btn-sm" onclick="quickCatFilter('Camion', null);showScreen('market');" style="font-size:11px;"><i class="fas fa-truck"></i> ${logRec.cta}</button>
        </div>`
        : '';
    const maqCostAlq = v.maq;
    const maqCostPropia = v.maq * 0.82;
    const ahorroAlq = (maqCostPropia - maqCostAlq) * v.ha;
    const ahorroPropia = (maqCostAlq - maqCostPropia) * v.ha;
    if (simMode === 'alquilar') {
        const saving = Math.abs(ahorroAlq) * 1.1;
        const savingHa = saving / v.ha;
        // Drone CTA: show when agro cost is significant (>$25/ha)
        const droneCTA = v.agro > 25
            ? `<div style="margin-top:10px;padding:10px 12px;background:var(--bg-secondary);border-radius:var(--r-md);border-left:3px solid var(--amber-400);">
          <div style="font-size:11px;font-weight:700;color:var(--amber-600);margin-bottom:4px;">🚁 ¿Ya consideraste aplicación con dron?</div>
          <div style="font-size:12px;color:var(--text-secondary);margin-bottom:8px;">Tus gastos en agroquímicos están en <strong>${fmtCalcCurrency(v.agro)}/ha</strong>. La fumigación con dron puede reducir el gasto en producto hasta un 20% por aplicación más precisa.</div>
          <button class="btn btn-secondary btn-sm" onclick="quickCatFilter('Dron', document.querySelector('#quick-cat-chips .filter-chip'));showScreen('market');" style="font-size:11px;"><i class="fas fa-helicopter"></i> Ver drones disponibles</button>
        </div>`
            : '';
        block.innerHTML = `Con proveedores disponibles en NexuDrive, <strong>podrías ahorrar <span class="saving">+${fmtCalcCurrency(saving)}</span></strong> en la campaña (${fmtCalcCurrency(savingHa)}/ha).<br><br><button class="btn btn-secondary btn-sm" onclick="showScreen('market')" style="margin-top:4px;"><i class="fas fa-tractor"></i> Ver opciones</button>${droneCTA}${logCTA}`;
    }
    else {
        if (v.ha < 200) {
            block.innerHTML = `Con menos de 200 ha, <strong>comprar maquinaria probablemente no conviene</strong>. El costo fijo diluye la inversión. Seguí alquilando.${logCTA}`;
        }
        else {
            block.innerHTML = `Con ${v.ha} ha, comprar maquinaria propia podría ahorrarte aproximadamente <span class="saving">${fmtCalcCurrency(ahorroPropia)}/año</span> en gastos variables. Pero necesitás capital inicial para la inversión.${logCTA}`;
        }
    }
}
function renderCalcChart(v) {
    var _a, _b;
    const wrap = document.getElementById('expense-chart-wrap');
    const container = document.getElementById('expense-bars-container');
    const totalLbl = document.getElementById('chart-total-lbl');
    const insStrip = document.getElementById('chart-insight-strip');
    if (!container)
        return;
    // ── Build expense items list ──────────────────────────────────────────
    const cultivo = ((_a = document.getElementById('c-cultivo')) === null || _a === void 0 ? void 0 : _a.value) || 'soja';
    const bm = BENCHMARKS[cultivo] || BENCHMARKS.soja;
    const tenencia = (_b = document.getElementById('c-tenencia')) === null || _b === void 0 ? void 0 : _b.value;
    const rows = [
        { key: 'sem', label: 'Semilla', val: v.sem, bmKey: 'sem' },
        { key: 'fert', label: 'Fertilizantes', val: v.fert, bmKey: 'fert' },
        { key: 'agro', label: 'Agroquímicos', val: v.agro, bmKey: 'agro' },
        { key: 'maq', label: 'Maquinaria', val: v.maq, bmKey: 'maq' },
        { key: 'comb', label: 'Combustible', val: v.comb, bmKey: 'comb' },
        { key: 'mo', label: 'Empleados', val: v.mo, bmKey: 'mo' },
        { key: 'alq', label: 'Alquiler', val: tenencia === 'propio' ? 0 : v.alq, bmKey: null },
        { key: 'com', label: 'Comercializ.', val: v.com, bmKey: null },
        { key: 'log', label: 'Distribucion', val: v.log, bmKey: 'log' },
        { key: 'seg', label: 'Seguro', val: v.seg, bmKey: null },
        { key: 'imp', label: 'Impuestos', val: v.imp, bmKey: null },
    ].filter(r => r.val > 0);
    if (!rows.length) {
        container.innerHTML = '<div class="chart-empty">Ingresá tus gastos para ver el análisis.</div>';
        if (wrap)
            wrap.classList.remove('is-hidden');
        if (insStrip)
            insStrip.style.display = 'none';
        if (totalLbl)
            totalLbl.textContent = '';
        return;
    }
    // ── Sort descending by value ──────────────────────────────────────────
    rows.sort((a, b) => b.val - a.val);
    const maxVal = rows[0].val;
    const totalCosto = rows.reduce((s, r) => s + r.val, 0);
    if (totalLbl)
        totalLbl.textContent = fmtCalcCurrency(totalCosto) + '/ha total';
    // ── Semaphore level per row ───────────────────────────────────────────
    function getLevel(row) {
        if (!row.bmKey)
            return 'green'; // no benchmark → neutral green
        const b = bm[row.bmKey];
        if (!b)
            return 'green';
        if (row.val <= b.opt)
            return 'green';
        if (row.val <= b.hi)
            return 'amber';
        return 'red';
    }
    // ── Build tip text ────────────────────────────────────────────────────
    function getTip(row, level) {
        if (!row.bmKey || level === 'green')
            return '';
        const b = bm[row.bmKey];
        if (!b)
            return '';
        return level === 'amber' ? b.tip_amber : b.tip_red;
    }
    // ── Render bars ───────────────────────────────────────────────────────
    container.innerHTML = rows.map((r, idx) => {
        const level = getLevel(r);
        const pct = maxVal > 0 ? (r.val / maxVal * 100).toFixed(1) : 0;
        const tip = getTip(r, level);
        const pctOfTotal = totalCosto > 0 ? ((r.val / totalCosto) * 100).toFixed(0) : 0;
        const titleAttr = tip ? `title="${tip}"` : '';
        return `
    <div class="expense-row" ${titleAttr} style="animation-delay:${idx * 0.045}s">
      <div class="expense-label-wrap">
        <div class="exp-dot level-${level}"></div>
        <div class="expense-label">${r.label}</div>
      </div>
      <div class="expense-bar-track">
        <div class="expense-bar-fill level-${level}" style="width:0%" data-target="${pct}%"></div>
      </div>
      <div class="expense-value level-${level}">${fmtCalcCurrency(r.val)}</div>
    </div>`;
    }).join('');
    // ── Animate bars in (rAF so CSS transition fires) ────────────────────
    requestAnimationFrame(() => {
        container.querySelectorAll('.expense-bar-fill').forEach(el => {
            el.style.width = el.dataset.target;
        });
    });
    // ── Insight strip — show warnings ────────────────────────────────────
    const warnings = rows
        .filter(r => getLevel(r) !== 'green' && getTip(r, getLevel(r)))
        .slice(0, 3); // max 3 insights
    if (warnings.length && insStrip) {
        insStrip.style.display = 'flex';
        insStrip.innerHTML = warnings.map(r => {
            const level = getLevel(r);
            const tip = getTip(r, level);
            const cls = level === 'red' ? 'warn' : 'amber';
            const icon = level === 'red' ? 'fa-exclamation-circle' : 'fa-exclamation-triangle';
            return `<div class="chart-insight-item ${cls}"><i class="fas ${icon}"></i><span>${tip}</span></div>`;
        }).join('');
    }
    else if (insStrip) {
        insStrip.style.display = 'none';
        insStrip.innerHTML = '';
    }
    if (wrap)
        wrap.classList.remove('is-hidden');
}
function saveCalc() {
    const campaign = buildSavedCampaignFromCalc();
    const rows = getSavedCampaigns();
    const editingKey = editingSavedCampaignKey;
    const editingIndex = editingKey ? rows.findIndex((row, idx) => savedCampaignKey(row, idx) === String(editingKey)) : -1;
    if (editingIndex >= 0) {
        const previous = rows[editingIndex] || {};
        rows[editingIndex] = Object.assign({}, campaign, {
            id: previous.id || campaign.id,
            createdAt: previous.createdAt || campaign.createdAt,
            updatedAt: Date.now(),
        });
        editingSavedCampaignKey = null;
    }
    else {
        rows.unshift(campaign);
    }
    saveSavedCampaigns(rows);
    renderSavedCampaigns();
    if (editingIndex >= 0) {
        showToast('Campaña actualizada en Campañas ✓', 'success');
        pushUserAction('calc_saved', campaign.values || campaign);
        return;
    }
    showToast(campaign.mode === 'lotes' ? 'Cálculo por lote/cultivo guardado en Campañas ✓' : 'Cálculo guardado en Campañas ✓', 'success');
    pushUserAction('calc_saved', campaign.values || campaign);
}
function resetCalc() {
    const campaignNameInput = document.getElementById('c-campaign-name');
    if (campaignNameInput)
        campaignNameInput.value = '';
    if (calcMode === 'lotes') {
        lotes = [];
        loteCounter = 0;
        addLote();
        addLote();
        return;
    }
    ['c-ha', 'c-rend', 'c-precio', 'c-sem', 'c-fert', 'c-agro', 'c-comb', 'c-maq', 'c-mo', 'c-alq', 'c-com', 'c-log', 'c-seg', 'c-imp'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            const defaults = { 'c-ha': 100, 'c-rend': 30, 'c-precio': 22, 'c-sem': 45, 'c-fert': 60, 'c-agro': 35, 'c-comb': 30, 'c-maq': 40, 'c-mo': 20, 'c-alq': 120, 'c-com': 18, 'c-log': 22, 'c-seg': 10, 'c-imp': 15 };
            el.value = defaults[id] || 0;
        }
    });
    const cultivoEl = document.getElementById('c-cultivo');
    if (cultivoEl)
        cultivoEl.value = 'soja';
    calcAuto();
}
function applyPerfilToCalc() {
    const haNum = typeof perfilData.ha === 'number' ? perfilData.ha : (haToNum[perfilData.ha] || 100);
    const haEl = document.getElementById('c-ha');
    if (haEl)
        haEl.value = haNum;
    const cEl = document.getElementById('c-cultivo');
    if (cEl && perfilData.cultivos.length) {
        const map = { 'Soja': 'soja', 'Maíz': 'maiz', 'Trigo': 'trigo', 'Girasol': 'girasol' };
        const v = map[perfilData.cultivos[0]];
        if (v)
            cEl.value = v;
    }
    setTimeout(calcAuto, 50); }

let _lastOpportunities = [];

function oppValueUsd(value) {
    const n = Number(value) || 0;
    return perfilData.moneda === 'ARS' ? n / getTC() : n;
}

function oppImpactLabel(impactUsd) {
    return `USD ${Math.round(impactUsd).toLocaleString('es-AR')} en la campaña`;
}

function addOpportunityIfRelevant(items, item) {
    if (!item || item.impactUsd < 500)
        return;
    items.push(Object.assign({
        impactLabel: oppImpactLabel(item.impactUsd)
    }, item));
}

function getActiveMachineryBookingForOpportunity() {
    const source = (typeof window !== 'undefined' && window.nexuDriveBookings) || (typeof nexuDriveBookings !== 'undefined' && nexuDriveBookings) || null;
    if (!source)
        return null;
    const activeStatuses = ['pending', 'reserved', 'confirmed', 'reservado', 'confirmado', 'preparando_salida', 'en_camino', 'llegando', 'trabajando'];
    const bookings = Object.values(source)
        .filter(Boolean)
        .filter(b => activeStatuses.includes(String(b.status || '').toLowerCase()))
        .filter(b => Number(b.priceHa) > 0)
        .sort((a, b) => {
        const aDate = Date.parse(a.createdAt || '') || 0;
        const bDate = Date.parse(b.createdAt || '') || 0;
        return bDate - aDate;
    });
    return bookings[0] || null;
}

function generateOpportunities(v, cultivo) {
    const bm = BENCHMARKS[cultivo] || BENCHMARKS.soja;
    const ha = Math.max(Number(v && v.ha) || 0, 0);
    const items = [];
    const val = key => oppValueUsd(v && v[key]);
    const totalUsd = key => oppValueUsd(v && v[key]);
    const impactField = key => (val(key) - bm[key].opt) * ha;
    if (bm.maq && val('maq') > bm.maq.opt) {
        const activeBooking = getActiveMachineryBookingForOpportunity();
        const bookingPriceHa = activeBooking ? Number(activeBooking.priceHa) || 0 : 0;
        const bookingHa = activeBooking ? Math.max(Number(activeBooking.hectares) || ha, 0) : ha;
        const hasBookingImpact = activeBooking && bookingPriceHa > 0 && val('maq') > bookingPriceHa;
        const impactUsd = hasBookingImpact ? (val('maq') - bookingPriceHa) * bookingHa : impactField('maq');
        addOpportunityIfRelevant(items, {
            id: 'maq_alto',
            type: 'nexudrive',
            priority: val('maq') > bm.maq.hi ? 'high' : 'medium',
            impactUsd,
            icon: 'fa-tractor',
            title: hasBookingImpact ? 'Reserva activa con ahorro en maquinaria' : 'Maquinaria por encima del promedio regional',
            description: hasBookingImpact
                ? `Tu reserva de ${activeBooking.machineName || 'maquinaria'} mejora el costo actual por hectárea.`
                : 'Alquilar equipos en NexuDrive puede reducir este costo sin invertir capital.',
            cta: hasBookingImpact ? 'Ver reserva' : 'Ver alternativas',
            screen: hasBookingImpact ? 'reservas' : 'market',
            condition: hasBookingImpact ? 'v.maq > activeBooking.priceHa' : 'v.maq > BENCHMARKS[cultivo].maq.opt'
        });
    }
    if (Number(v && v.ganHa) < 0) {
        addOpportunityIfRelevant(items, {
            id: 'perdida_activa',
            type: 'general',
            priority: 'high',
            impactUsd: Math.abs(totalUsd('ganTotal')),
            icon: 'fa-exclamation-triangle',
            title: 'La campaña está generando pérdida',
            description: 'Con los números actuales perdés dinero. Revisá precio de venta y costos operativos.',
            cta: 'Ver diagnóstico',
            screen: null,
            condition: 'v.ganHa < 0'
        });
    }
    if (bm.agro && val('agro') > bm.agro.opt) {
        addOpportunityIfRelevant(items, {
            id: 'agro_alto',
            type: 'drones',
            priority: val('agro') > bm.agro.hi ? 'high' : 'medium',
            impactUsd: impactField('agro'),
            icon: 'fa-helicopter',
            title: 'Costos de aplicación elevados',
            description: 'Aplicar con drones puede bajar agroquímicos por mayor precisión.',
            cta: 'Ver drones disponibles',
            screen: 'market',
            condition: 'v.agro > BENCHMARKS[cultivo].agro.opt'
        });
    }
    if (bm.log && val('log') > bm.log.opt) {
        const shouldBuy = ha >= 450 && val('log') > bm.log.hi;
        addOpportunityIfRelevant(items, {
            id: 'logistica_alta',
            type: 'nexudrive',
            priority: val('log') > bm.log.hi ? 'high' : 'medium',
            impactUsd: impactField('log'),
            icon: 'fa-truck',
            title: shouldBuy ? 'Logistica elevada: comparar compra vs alquiler' : 'Logistica elevada: alquilar capacidad puntual',
            description: shouldBuy
                ? 'Por escala y costo por hectarea, compará compra de tolva/acoplado o camion usado contra alquiler por campaña.'
                : 'Alquilar camiones o acoplados en NexuDrive puede bajar el costo sin inmovilizar capital.',
            cta: shouldBuy ? 'Comparar opciones' : 'Ver camiones y acoplados',
            screen: 'market',
            condition: 'v.log > BENCHMARKS[cultivo].log.opt'
        });
    }
    if (bm.comb && bm.maq && bm.mo) {
        const opActual = val('comb') + val('maq') + val('mo');
        const opOpt = bm.comb.opt + bm.maq.opt + bm.mo.opt;
        addOpportunityIfRelevant(items, opActual > opOpt ? {
            id: 'op_baja',
            type: 'nexuservice',
            priority: 'medium',
            impactUsd: (opActual - opOpt) * ha,
            icon: 'fa-wrench',
            title: 'Costos operativos por encima del promedio',
            description: 'Un técnico puede detectar ineficiencias en maquinaria y combustible.',
            cta: 'Contactar técnico',
            screen: 'service',
            condition: '(v.comb + v.maq + v.mo) > sumOpts'
        } : null);
    }
    const margenPct = Number(v && v.margenPct) || 0;
    if (margenPct > 0 && margenPct < 15) {
        const ingTotalUsd = totalUsd('ingTotal');
        const ganTotalUsd = totalUsd('ganTotal');
        addOpportunityIfRelevant(items, {
            id: 'margen_bajo',
            type: 'general',
            priority: 'medium',
            impactUsd: (0.15 * ingTotalUsd) - ganTotalUsd,
            icon: 'fa-chart-line',
            title: 'Margen ajustado, poco espacio ante imprevistos',
            description: 'Tu margen es inferior al 15%. Una baja de precio o rinde puede generar pérdida.',
            cta: 'Ver optimizaciones',
            screen: null,
            condition: 'v.margenPct > 0 && v.margenPct < 15'
        });
    }
    if (bm.alq && val('alq') > bm.alq.opt) {
        addOpportunityIfRelevant(items, {
            id: 'alq_alto',
            type: 'general',
            priority: val('alq') > bm.alq.hi ? 'high' : 'low',
            impactUsd: impactField('alq'),
            icon: 'fa-map-marked-alt',
            title: 'Alquiler por encima del promedio para este cultivo',
            description: 'El arrendamiento supera el benchmark regional. Evaluá renegociar el contrato.',
            cta: 'Ver benchmark',
            screen: null,
            condition: 'v.alq > BENCHMARKS[cultivo].alq.opt'
        });
    }
    if (bm.sem && bm.fert && bm.agro) {
        const insumosActual = val('sem') + val('fert') + val('agro');
        const insumosOpt = bm.sem.opt + bm.fert.opt + bm.agro.opt;
        addOpportunityIfRelevant(items, insumosActual > insumosOpt ? {
            id: 'insumos_altos',
            type: 'general',
            priority: 'low',
            impactUsd: (insumosActual - insumosOpt) * ha,
            icon: 'fa-seedling',
            title: 'Insumos por encima del promedio',
            description: 'Semillas, fertilizantes y agroquímicos superan el benchmark. Revisá proveedores.',
            cta: 'Ver diagnóstico',
            screen: null,
            condition: '(v.sem + v.fert + v.agro) > sumOpts'
        } : null);
    }
    return items
        .sort((a, b) => b.impactUsd - a.impactUsd)
        .slice(0, 3);
}

function escapeOppHTML(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, ch => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[ch]));
}

function buildOpportunitiesHTML(opportunities) {
    const priorityLabel = priority => priority === 'high' ? 'Alta prioridad' : priority === 'medium' ? 'Media prioridad' : 'A considerar';
    const cards = opportunities.map(o => `
  <div class="opp-card opp-priority-${escapeOppHTML(o.priority)}">
    <div class="opp-card-top">
      <div class="opp-card-icon opp-type-${escapeOppHTML(o.type)}">
        <i class="fas ${escapeOppHTML(o.icon)}"></i>
      </div>
      <div class="opp-card-meta">
        <div class="opp-card-priority-badge opp-priority-${escapeOppHTML(o.priority)}">${priorityLabel(o.priority)}</div>
        <div class="opp-impact">
          <span class="opp-impact-label">Ahorro estimado</span>
          <span class="opp-impact-val">${escapeOppHTML(o.impactLabel)}</span>
        </div>
      </div>
    </div>
    <div class="opp-card-title">${escapeOppHTML(o.title)}</div>
    <div class="opp-card-desc">${escapeOppHTML(o.description)}</div>
    ${o.screen ? `<button class="opp-cta-btn opp-type-${escapeOppHTML(o.type)}-btn" onclick="oppNavigate('${escapeOppHTML(o.id)}', '${escapeOppHTML(o.screen)}')">${escapeOppHTML(o.cta)} <i class="fas fa-arrow-right"></i></button>` : ''}
  </div>`).join('');
    return `
  <div class="opp-panel-header">
    <span class="opp-panel-icon"><i class="fas fa-lightbulb"></i></span>
    <div>
      <div class="opp-panel-title">Oportunidades Detectadas</div>
      <div class="opp-panel-sub" id="opp-panel-sub">${opportunities.length} oportunidad${opportunities.length > 1 ? 'es' : ''} accionable${opportunities.length > 1 ? 's' : ''}</div>
    </div>
  </div>
  <div id="opp-cards-container" class="opp-cards-container">${cards}</div>`;
}

function renderOpportunities(v, cultivo) {
    const panel = document.getElementById('opportunities-panel');
    if (!panel)
        return;
    const opportunities = generateOpportunities(v, cultivo);
    _lastOpportunities = opportunities;
    if (!opportunities.length) {
        panel.style.display = 'none';
        return;
    }
    panel.style.display = 'block';
    panel.innerHTML = buildOpportunitiesHTML(opportunities);
}

function oppNavigate(oppId, screen) {
    if (oppId === 'agro_alto' && typeof quickCatFilter !== 'undefined')
        quickCatFilter('Dron', null);
    if (oppId === 'logistica_alta' && typeof quickCatFilter !== 'undefined')
        quickCatFilter('Camion', null);
    if (screen === 'market') {
        const opp = _lastOpportunities.find(o => o.id === oppId);
        if (opp && typeof AgronexBus !== 'undefined' && AgronexBus.setOpportunityContext) {
            AgronexBus.setOpportunityContext({
                oppId: opp.id,
                type: opp.type,
                impactUsd: opp.impactUsd,
                title: opp.title,
            });
        }
    }
    if (screen)
        showScreen(screen);
}

if (typeof window !== 'undefined') {
    window.generateOpportunities = generateOpportunities;
    window.renderOpportunities = renderOpportunities;
    window.oppNavigate = oppNavigate;
}

let currentTCSource = 'oficial';

function showLiveUpdateBadge() {
    const badge = document.getElementById('live-update-badge');
    if (!badge)
        return;
    badge.style.display = 'inline-flex';
    badge.style.animation = 'none';
    requestAnimationFrame(() => {
        badge.style.animation = '';
        setTimeout(() => { badge.style.display = 'none'; }, 2100);
    });
}

const LiveTC = {
    data: null,
    lastFetch: 0,
    interval: null,
    async fetch() {
        try {
            if (document.visibilityState && document.visibilityState !== 'visible')
                return;
            const res = await fetch('https://api.bluelytics.com.ar/v2/latest');
            if (!res.ok)
                throw new Error('tc_fetch_failed');
            const data = await res.json();
            if (!data || !data.oficial || !data.blue)
                throw new Error('tc_payload_invalid');
            this.data = data;
            this.lastFetch = Date.now();
            this.apply(currentTCSource);
        }
        catch (err) {
            showToast('No se pudo actualizar el tipo de cambio', 'warning');
        }
    },
    apply(source) {
        if (!this.data || !this.data[source])
            return;
        const quote = this.data[source];
        const buy = Number(quote.value_buy);
        const sell = Number(quote.value_sell);
        if (!Number.isFinite(buy) || !Number.isFinite(sell))
            return;
        const newTC = Math.round((buy + sell) / 2);
        const input = document.getElementById('tc-ars');
        const valueEl = document.getElementById('live-tc-value');
        const timeEl = document.getElementById('live-tc-time');
        const bar = document.getElementById('live-tc-bar');
        const oldTC = input ? Math.round(parseFloat(input.value) || 0) : 0;
        if (valueEl)
            valueEl.textContent = `$${newTC.toLocaleString('es-AR')} ARS/USD`;
        if (timeEl) {
            const d = this.lastFetch ? new Date(this.lastFetch) : new Date();
            timeEl.textContent = `actualizado ${d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}`;
        }
        if (input)
            input.value = String(newTC);
        if (bar) {
            bar.classList.remove('updated');
            requestAnimationFrame(() => {
                bar.classList.add('updated');
                setTimeout(() => bar.classList.remove('updated'), 1000);
            });
        }
        if (newTC !== oldTC) {
            if (calcMode === 'lotes')
                calcLotes();
            else
                calcAuto();
            showLiveUpdateBadge();
        }
    },
    setSource(source) {
        if (source !== 'oficial' && source !== 'blue')
            return;
        currentTCSource = source;
        document.querySelectorAll('.tc-src-btn').forEach(btn => btn.classList.remove('active'));
        const btn = document.getElementById(`tc-src-${source}`);
        if (btn)
            btn.classList.add('active');
        this.apply(source);
    },
    start() {
        this.stop();
        this.fetch();
        this.interval = setInterval(() => {
            if (document.visibilityState === 'visible')
                this.fetch();
        }, 10 * 60 * 1000);
    },
    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }
};

const LivePrices = {
    data: {},
    lastFetch: 0,
    async fetchAll() {
        try {
            const jobs = [
                ['soja', 'ZS=F', 36.74],
                ['maiz', 'ZC=F', 39.37],
                ['trigo', 'ZW=F', 36.74]
            ];
            const results = await Promise.allSettled(jobs.map(job => this.fetchSymbol(job[1], job[2])));
            const nextData = {};
            results.forEach((result, index) => {
                if (result.status === 'fulfilled' && result.value !== null)
                    nextData[jobs[index][0]] = result.value;
            });
            this.data = nextData;
            this.lastFetch = Date.now();
            this.showSuggestionBadge(this.getCurrentCultivo());
        }
        catch (err) {
            this.data = {};
            this.showSuggestionBadge(this.getCurrentCultivo());
        }
    },
    async fetchSymbol(symbol, conversionFactor) {
        try {
            const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`;
            const res = await fetch(url);
            if (!res.ok)
                return null;
            const payload = await res.json();
            const result = payload && payload.chart && payload.chart.result && payload.chart.result[0];
            const marketPrice = result && result.meta && Number(result.meta.regularMarketPrice);
            if (!Number.isFinite(marketPrice))
                return null;
            return Math.round((marketPrice / conversionFactor) * 100) / 100;
        }
        catch (err) {
            return null;
        }
    },
    getCurrentCultivo() {
        const el = document.getElementById('c-cultivo');
        return el ? el.value : 'soja';
    },
    getSuggestion(cultivo) {
        const key = String(cultivo || '').toLowerCase();
        return Object.prototype.hasOwnProperty.call(this.data, key) ? this.data[key] : null;
    },
    showSuggestionBadge(cultivo) {
        const bar = document.getElementById('price-suggestion-bar');
        if (!bar)
            return;
        const price = this.getSuggestion(cultivo);
        if (price === null) {
            bar.style.display = 'none';
            return;
        }
        const valueEl = document.getElementById('price-sug-value');
        if (valueEl)
            valueEl.textContent = price.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        bar.style.display = 'flex';
    },
    applyToInput() {
        const cultivo = this.getCurrentCultivo();
        const price = this.getSuggestion(cultivo);
        const input = document.getElementById('c-precio');
        if (price === null || !input)
            return;
        const nextPrice = perfilData.moneda === 'ARS' ? price * getTC() : price;
        input.value = perfilData.moneda === 'ARS' ? String(Math.round(nextPrice)) : nextPrice.toFixed(2);
        calcAuto();
        showToast('Precio CBOT aplicado - ajusta con tu precio local', 'info');
    }
};

window.LiveTC = LiveTC;
window.LivePrices = LivePrices;
window.showLiveUpdateBadge = showLiveUpdateBadge;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        LiveTC.start();
        LivePrices.fetchAll();
    });
}
else {
    LiveTC.start();
    LivePrices.fetchAll();
}
