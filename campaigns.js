"use strict";
/* ================================================================
   AGRONEX module: Campaign operations center
   Reads the existing saved campaign, NexuDrive and booking state.
================================================================ */

function campaignEscape(value) {
    return String(value == null ? '' : value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function campaignNumber(value) {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
}

function campaignMoney(value) {
    if (typeof formatSavedCampaignMoney === 'function')
        return formatSavedCampaignMoney(value || 0);
    if (typeof fmtCalcCurrency === 'function')
        return fmtCalcCurrency(value || 0);
    return `USD ${Math.round(value || 0).toLocaleString('es-AR')}`;
}

function campaignCompactMoney(value) {
    const n = Math.round(Math.abs(value || 0));
    if (n >= 1000000)
        return `USD ${(n / 1000000).toFixed(n >= 10000000 ? 0 : 1)}M`;
    if (n >= 1000)
        return `USD ${Math.round(n / 1000)}K`;
    return campaignMoney(n);
}

function campaignDate(value) {
    if (typeof formatSavedCampaignDate === 'function')
        return formatSavedCampaignDate(value);
    return value ? new Date(value).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' }) : 'Sin fecha';
}

function getStoredCampaignRows() {
    if (typeof getSavedCampaigns === 'function')
        return getSavedCampaigns();
    try {
        const rows = JSON.parse(localStorage.getItem('agronex_saved_campaigns') || '[]');
        return Array.isArray(rows) ? rows : [];
    }
    catch (e) {
        return [];
    }
}

function getStoredBookings() {
    if (typeof nexuDriveBookings !== 'undefined' && nexuDriveBookings)
        return nexuDriveBookings;
    try {
        const rows = JSON.parse(localStorage.getItem('agronex_bookings') || '{}');
        return rows && typeof rows === 'object' ? rows : {};
    }
    catch (e) {
        return {};
    }
}

let selectedCampaignId = null;

function campaignRowKey(row, index) {
    return row && row.id ? String(row.id) : `campaign-${index}`;
}

function normalizeCampaignName(row) {
    const raw = String((row && (row.name || row.crop)) || `Campaña ${new Date().getFullYear()}`);
    return raw
        .replace(/^Por lotes\s*[·-]\s*/i, '')
        .replace(/\b(19|20)\d{2}(\/\d{2})?\b/g, '')
        .trim() || `Campaña ${new Date().getFullYear()}`;
}

function campaignYearLabel(row) {
    const fromName = String((row && row.crop) || '').match(/\b(20\d{2})(\/\d{2})?\b/);
    if (fromName)
        return fromName[0];
    const ts = campaignNumber(row && row.createdAt);
    return String(ts ? new Date(ts).getFullYear() : new Date().getFullYear());
}

function normalizeLote(raw, detail, index, row) {
    const source = Object.assign({}, raw || {}, detail || {});
    const ha = campaignNumber(source.ha);
    const rend = campaignNumber(source.rend);
    const precio = campaignNumber(source.precio);
    const costFields = ['sem', 'fert', 'agro', 'comb', 'maq', 'mo', 'alq', 'com', 'log', 'seg', 'imp'];
    const costoHa = campaignNumber(source.costoHa) || costFields.reduce((sum, key) => sum + campaignNumber(source[key]), 0);
    const ingreso = campaignNumber(source.ingreso) || (ha * rend * precio);
    const gasto = campaignNumber(source.gasto) || (ha * costoHa);
    const ganancia = campaignNumber(source.ganancia) || (ingreso - gasto);
    const margen = ingreso > 0 ? (ganancia / ingreso) * 100 : campaignNumber(source.margen);
    const cultivo = source.cultivo || source.crop || normalizeCampaignName(row);
    const cultivoKey = (raw && raw.cultivo) || source.cultivoKey || source.cultivo || source.crop || '';
    const id = source.id || source.loteId || `lote-${index + 1}`;
    return Object.assign({}, source, {
        id,
        name: source.name || source.nombre || `Lote ${id}`,
        cultivo,
        cultivoKey,
        ha,
        rend,
        precio,
        costoHa,
        ingreso,
        gasto,
        ganancia,
        margen,
        index,
    });
}

function normalizeCampaign(row, index) {
    if (!row)
        return null;
    const rawLotes = Array.isArray(row.lotes) ? row.lotes : [];
    const details = Array.isArray(row.loteDetails) ? row.loteDetails : [];
    const lotes = rawLotes.length || details.length
        ? (rawLotes.length ? rawLotes : details).map((lote, index) => normalizeLote(lote, details[index], index, row))
        : [normalizeLote({
            id: 'principal',
            name: row.loteName || row.name || normalizeCampaignName(row),
            cultivo: normalizeCampaignName(row),
            ha: row.ha,
            ingreso: row.ingreso,
            gasto: row.gasto,
            ganancia: row.ganancia,
            margen: row.margen,
            rend: row.values && row.values.rend,
            precio: row.values && row.values.precio,
            costoHa: row.values && row.values.costoHa,
            sem: row.values && row.values.sem,
            fert: row.values && row.values.fert,
            agro: row.values && row.values.agro,
            comb: row.values && row.values.comb,
            maq: row.values && row.values.maq,
            mo: row.values && row.values.mo,
            alq: row.values && row.values.alq,
            com: row.values && row.values.com,
            log: row.values && row.values.log,
            seg: row.values && row.values.seg,
            imp: row.values && row.values.imp,
        }, null, 0, row)];
    return {
        id: campaignRowKey(row, index || 0),
        name: row.name || `${normalizeCampaignName(row)} ${campaignYearLabel(row)}`,
        createdAt: row.createdAt,
        source: row,
        opportunities: Array.isArray(row.opportunities) ? row.opportunities : [],
        lotes,
    };
}

function getAllCampaigns() {
    return getStoredCampaignRows()
        .map((row, index) => normalizeCampaign(row, index))
        .filter(Boolean)
        .sort((a, b) => campaignNumber(b.createdAt) - campaignNumber(a.createdAt));
}

function getCurrentCampaign() {
    const campaigns = getAllCampaigns();
    if (!campaigns.length)
        return null;
    if (selectedCampaignId && campaigns.some(campaign => campaign.id === selectedCampaignId))
        return campaigns.find(campaign => campaign.id === selectedCampaignId);
    selectedCampaignId = campaigns[0].id;
    return campaigns[0];
}

function ensureAgronexCampaign() {
    if (!window.AgronexCampaign)
        window.AgronexCampaign = {};
    Object.defineProperties(window.AgronexCampaign, {
        rows: { configurable: true, get: () => getStoredCampaignRows() },
        campaigns: { configurable: true, get: () => getAllCampaigns() },
        current: { configurable: true, get: () => getCurrentCampaign() },
        bookings: { configurable: true, get: () => getStoredBookings() },
    });
    return window.AgronexCampaign;
}

function inferOpportunityField(lote) {
    const cropKey = String((lote && (lote.cultivoKey || lote.cultivo)) || '').toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const benchmark = typeof BENCHMARKS !== 'undefined'
        ? (BENCHMARKS[cropKey] || BENCHMARKS.soja)
        : null;
    const fields = ['maq', 'agro', 'comb', 'log', 'fert', 'sem', 'mo', 'alq', 'com', 'seg', 'imp'];
    let best = null;
    fields.forEach(field => {
        const value = campaignNumber(lote && lote[field]);
        const opt = campaignNumber(benchmark && benchmark[field] && benchmark[field].opt);
        if (!value || !opt || value <= opt)
            return;
        const saving = (value - opt) * Math.max(campaignNumber(lote.ha), 1);
        if (!best || saving > best.saving)
            best = { field, saving };
    });
    return best;
}

function providersForOpportunity(lote, opportunityField) {
    if (typeof marketData === 'undefined' || !Array.isArray(marketData))
        return [];
    const field = opportunityField && opportunityField.field;
    const categoryMap = {
        agro: ['Dron', 'Pulverizadora'],
        maq: ['Tractor', 'Sembradora', 'Cosechadora'],
        comb: ['Tractor', 'Camion', 'Acoplado'],
        log: ['Camion', 'Acoplado', 'Tolva'],
        sem: ['Sembradora'],
    };
    const categories = categoryMap[field] || null;
    const proveedoresFiltrados = marketData.filter(item => {
        if (!item)
            return false;
        if (item.avail === 'Sin disponibilidad' || item.avail === 'No disponible')
            return false;
        return !categories || categories.includes(item.cat);
    });
    return proveedoresFiltrados;
}

function loteHasConsultation(lote, bookings) {
    const rows = Object.values(bookings || {});
    const loteName = String((lote && lote.name) || '').toLowerCase();
    return rows.some(booking => {
        if (!booking)
            return false;
        const status = String(booking.status || '').toLowerCase();
        const active = ['reservado', 'confirmado', 'confirmed', 'pending', 'en camino', 'trabajando', 'active'].includes(status);
        if (!active)
            return false;
        const bookingLote = String(booking.lote || '').toLowerCase();
        return !bookingLote || bookingLote.includes(loteName) || loteName.includes(bookingLote);
    });
}

function contactCountForLote(lote, bookings) {
    const rows = Object.values(bookings || {});
    const loteName = String((lote && lote.name) || '').toLowerCase();
    return rows.filter(booking => {
        if (!booking)
            return false;
        const bookingLote = String(booking.lote || '').toLowerCase();
        return !bookingLote || bookingLote.includes(loteName) || loteName.includes(bookingLote);
    }).length;
}

function getLoteStatus(lote, campaign, context) {
    const bookings = (context && context.bookings) || {};
    const hasYield = campaignNumber(lote.rend) > 0 || campaignNumber(lote.ingreso) > 0;
    const hasCosts = campaignNumber(lote.costoHa) > 0 || campaignNumber(lote.gasto) > 0;
    const hasArea = campaignNumber(lote.ha) > 0;
    const missing = [];
    if (!hasArea)
        missing.push('hectáreas');
    if (!hasYield)
        missing.push('rendimiento esperado');
    if (!hasCosts)
        missing.push('costos cargados');
    const opportunityField = inferOpportunityField(lote);
    const fallbackOpportunity = ((campaign && campaign.opportunities) || [])[lote.index || 0];
    const opportunitySaving = campaignNumber(opportunityField && opportunityField.saving) || campaignNumber(fallbackOpportunity && fallbackOpportunity.impactUsd);
    const proveedoresFiltrados = providersForOpportunity(lote, opportunityField);
    const alternativesCount = proveedoresFiltrados.length;
    const consulted = loteHasConsultation(lote, bookings);
    const contactCount = contactCountForLote(lote, bookings);
    if (missing.length) {
        return {
            key: 'incomplete',
            label: 'Datos incompletos',
            tone: 'status-incomplete',
            cta: 'Completar datos',
            ctaIcon: 'fa-pen',
            action: 'calc',
            story: `Faltan ${missing.slice(0, 2).join(' y ')} para analizar este lote.`,
            next: 'Próxima acción: completar la ficha del lote',
            potential: 0,
            alternativesCount: 0,
            contactCount: 0,
        };
    }
    if (consulted) {
        return {
            key: 'consulted',
            label: 'Consulta enviada',
            tone: 'status-consulted',
            cta: 'Ver seguimiento',
            ctaIcon: 'fa-calendar-check',
            action: 'reservas',
            story: `${contactCount || 1} contratista${(contactCount || 1) > 1 ? 's' : ''} contactado${(contactCount || 1) > 1 ? 's' : ''}. Respuesta en seguimiento operativo.`,
            next: 'Próxima acción: revisar coordinación',
            potential: opportunitySaving,
            alternativesCount,
            contactCount: contactCount || 1,
        };
    }
    if (opportunitySaving > 0 && alternativesCount > 0) {
        return {
            key: 'opportunity',
            label: 'Oportunidad detectada',
            tone: 'status-opportunity',
            cta: 'Ver alternativas',
            ctaIcon: 'fa-tractor',
            action: 'market',
            marketCategory: opportunityField && opportunityField.field === 'agro' ? 'Dron' : opportunityField && opportunityField.field === 'log' ? 'Camion' : null,
            story: `Potencial de optimización de ${campaignMoney(opportunitySaving)}. NexuDrive encontró ${alternativesCount} alternativa${alternativesCount !== 1 ? 's' : ''}.`,
            next: 'Próxima acción: comparar proveedores',
            potential: opportunitySaving,
            alternativesCount,
            contactCount: 0,
        };
    }
    return {
        key: 'optimized',
        label: 'Optimizada',
        tone: 'status-optimized',
        cta: 'Ver detalle',
        ctaIcon: 'fa-eye',
        action: 'calc',
        story: `Estado optimizado. Margen ${Math.round(campaignNumber(lote.margen))}% y costos sin desvíos relevantes contra benchmark.`,
        next: 'Próxima acción: mantener seguimiento',
        potential: 0,
        alternativesCount: 0,
        contactCount: 0,
    };
}

function getCampaignSummary(campaign, statuses) {
    const lotes = (campaign && campaign.lotes) || [];
    const totalHa = lotes.reduce((sum, lote) => sum + campaignNumber(lote.ha), 0);
    const marginTotal = lotes.reduce((sum, lote) => sum + campaignNumber(lote.ganancia), 0);
    const potentialTotal = (statuses || []).reduce((sum, status) => sum + campaignNumber(status.potential), 0);
    const counts = (statuses || []).reduce((acc, status) => {
        acc[status.key] = (acc[status.key] || 0) + 1;
        return acc;
    }, {});
    const generalKey = counts.incomplete ? 'incomplete'
        : counts.consulted ? 'consulted'
            : counts.opportunity ? 'opportunity'
                : 'optimized';
    const general = {
        incomplete: ['Datos incompletos', 'status-incomplete'],
        optimized: ['Optimizada', 'status-optimized'],
        opportunity: ['Oportunidad detectada', 'status-opportunity'],
        consulted: ['Consulta enviada', 'status-consulted'],
    }[generalKey];
    return {
        name: (campaign && campaign.name) || `Campaña ${new Date().getFullYear()}`,
        lotesCount: lotes.length,
        totalHa,
        marginTotal,
        potentialTotal,
        generalKey,
        generalLabel: general[0],
        generalTone: general[1],
        createdAt: campaign && campaign.createdAt,
    };
}

function getCampaignFinancialSummary(campaign) {
    const lotes = (campaign && campaign.lotes) || [];
    const totalHa = lotes.reduce((sum, lote) => sum + campaignNumber(lote.ha), 0);
    const ingreso = lotes.reduce((sum, lote) => sum + campaignNumber(lote.ingreso), 0);
    const gasto = lotes.reduce((sum, lote) => sum + campaignNumber(lote.gasto), 0);
    const ganancia = lotes.reduce((sum, lote) => sum + campaignNumber(lote.ganancia), 0);
    const margenPct = ingreso > 0 ? (ganancia / ingreso) * 100 : 0;
    const gananciaHa = totalHa > 0 ? ganancia / totalHa : 0;
    return { totalHa, ingreso, gasto, ganancia, margenPct, gananciaHa };
}

function getPreviousCampaign(campaign, campaigns) {
    const list = campaigns || [];
    const index = list.findIndex(item => item && campaign && item.id === campaign.id);
    return index >= 0 ? list[index + 1] || null : null;
}

function getCampaignComparison(campaign, previous) {
    if (!campaign || !previous)
        return null;
    const current = getCampaignFinancialSummary(campaign);
    const prev = getCampaignFinancialSummary(previous);
    const diffGanancia = current.ganancia - prev.ganancia;
    const diffMargenPct = current.margenPct - prev.margenPct;
    const diffGananciaHa = current.gananciaHa - prev.gananciaHa;
    const improved = diffGananciaHa > 0 || (Math.abs(diffGananciaHa) < 0.01 && diffMargenPct > 0);
    const neutral = Math.abs(diffGananciaHa) < 0.01 && Math.abs(diffMargenPct) < 0.5;
    return {
        previous,
        current,
        prev,
        diffGanancia,
        diffMargenPct,
        diffGananciaHa,
        key: neutral ? 'neutral' : improved ? 'better' : 'worse',
    };
}

function signedMoney(value) {
    const sign = value > 0 ? '+' : value < 0 ? '-' : '';
    return `${sign}${campaignMoney(Math.abs(value))}`;
}

function signedPct(value) {
    const sign = value > 0 ? '+' : value < 0 ? '-' : '';
    return `${sign}${Math.abs(value).toFixed(Math.abs(value) >= 10 ? 0 : 1)} pts`;
}

function renderCampaignHeader(summary) {
    const metrics = [
        ['Lotes', `${summary.lotesCount}`],
        ['Hectáreas', `${Math.round(summary.totalHa).toLocaleString('es-AR')} ha`],
        ['Margen proyectado', campaignCompactMoney(summary.marginTotal)],
        ['Potencial', campaignCompactMoney(summary.potentialTotal)],
        ['Actualizado', campaignDate(summary.createdAt)],
    ];
    return `
    <div class="campaign-ops-header">
      <div>
        <div class="campaign-ops-title-kicker">Campaña seleccionada</div>
        <div class="campaign-ops-title-row">
          <h2 class="campaign-ops-title">${campaignEscape(summary.name)}</h2>
          <span class="campaign-ops-status ${summary.generalTone}">${campaignEscape(summary.generalLabel)}</span>
        </div>
        <p class="campaign-ops-sub">Vista operativa por lote: datos, oportunidad, consulta y seguimiento comercial en una sola lectura.</p>
      </div>
      <div class="campaign-ops-metrics">
        ${metrics.map(([label, value]) => `<div class="campaign-ops-metric"><span>${label}</span><strong>${campaignEscape(value)}</strong></div>`).join('')}
      </div>
    </div>`;
}

function renderCampaignHistory(campaigns, activeId) {
    if (!campaigns.length)
        return '';
    return `
    <div class="campaign-history-head">
      <div>
        <span>Campañas guardadas</span>
        <strong>Elegí una campaña para revisar</strong>
      </div>
      <em>${campaigns.length} campaña${campaigns.length !== 1 ? 's' : ''}</em>
    </div>
    <div class="campaign-history-list">
      ${campaigns.map(campaign => {
        const fin = getCampaignFinancialSummary(campaign);
        const active = campaign.id === activeId;
        return `
        <button class="campaign-history-item ${active ? 'active' : ''}" data-campaign-id="${campaignEscape(campaign.id)}">
          <span>${campaignEscape(campaign.name)}</span>
          <strong>${campaignMoney(fin.ganancia)}</strong>
          <small>${Math.round(fin.totalHa).toLocaleString('es-AR')} ha · ${campaignDate(campaign.createdAt)}</small>
        </button>`;
    }).join('')}
    </div>`;
}

function renderCampaignHistoryPanel(campaigns, activeId) {
    if (!campaigns.length)
        return '';
    return `
    <div class="campaign-history-head">
      <div>
        <span>Campañas guardadas</span>
        <strong>Historial de campañas</strong>
      </div>
      <em>${campaigns.length} campaña${campaigns.length !== 1 ? 's' : ''}</em>
    </div>
    <div class="campaign-history-list campaign-history-list-panel">
      ${campaigns.map(campaign => {
        const fin = getCampaignFinancialSummary(campaign);
        const active = campaign.id === activeId;
        return `
        <article class="campaign-history-item ${active ? 'active' : ''}" data-campaign-id="${campaignEscape(campaign.id)}">
          <div class="campaign-history-item-main">
            <span>${campaignEscape(campaign.name)}</span>
            <strong>${campaignMoney(fin.ganancia)}</strong>
            <small>${Math.round(fin.totalHa).toLocaleString('es-AR')} ha · ${campaignDate(campaign.createdAt)}</small>
          </div>
          <div class="campaign-history-actions">
            <button type="button" data-campaign-view="${campaignEscape(campaign.id)}"><i class="fas fa-eye"></i> Ver</button>
            <button type="button" data-campaign-edit="${campaignEscape(campaign.id)}"><i class="fas fa-pen"></i> Modificar</button>
            <button type="button" class="danger" data-campaign-delete="${campaignEscape(campaign.id)}"><i class="fas fa-trash"></i> Eliminar</button>
          </div>
        </article>`;
    }).join('')}
    </div>`;
}

function renderCampaignComparison(comparison) {
    if (!comparison) {
        return `
        <div class="campaign-compare-card is-empty">
          <div class="campaign-compare-icon"><i class="fas fa-clock-rotate-left"></i></div>
          <div>
            <span>Comparación</span>
            <strong>Sin campaña anterior comparable</strong>
            <p>Guardá al menos dos campañas para ver si mejoraste frente al ciclo anterior.</p>
          </div>
        </div>`;
    }
    const icon = comparison.key === 'better' ? 'fa-arrow-trend-up' : comparison.key === 'worse' ? 'fa-arrow-trend-down' : 'fa-minus';
    const title = comparison.key === 'better'
        ? 'Te fue mejor que antes'
        : comparison.key === 'worse'
            ? 'Te fue peor que antes'
            : 'Resultado similar al anterior';
    const tone = comparison.key === 'better' ? 'better' : comparison.key === 'worse' ? 'worse' : 'neutral';
    const prevName = comparison.previous && comparison.previous.name ? comparison.previous.name : 'campaña anterior';
    return `
    <div class="campaign-compare-card ${tone}">
      <div class="campaign-compare-icon"><i class="fas ${icon}"></i></div>
      <div class="campaign-compare-main">
        <span>Comparado con ${campaignEscape(prevName)}</span>
        <strong>${title}</strong>
        <p>${signedMoney(comparison.diffGananciaHa)} por ha · ${signedPct(comparison.diffMargenPct)} de margen · ${signedMoney(comparison.diffGanancia)} total.</p>
      </div>
      <div class="campaign-compare-values">
        <div><span>Esta campaña</span><strong>${campaignMoney(comparison.current.gananciaHa)}/ha</strong></div>
        <div><span>Anterior</span><strong>${campaignMoney(comparison.prev.gananciaHa)}/ha</strong></div>
      </div>
    </div>`;
}

function renderCampaignCard(lote, status) {
    const facts = [
        ['Hectáreas', `${Math.round(campaignNumber(lote.ha)).toLocaleString('es-AR')} ha`],
        ['Margen', `${Math.round(campaignNumber(lote.margen))}%`],
        [status.key === 'consulted' ? 'Contactados' : status.key === 'opportunity' ? 'Alternativas' : 'Resultado', status.key === 'consulted' ? `${status.contactCount}` : status.key === 'opportunity' ? `${status.alternativesCount}` : campaignMoney(lote.ganancia)],
    ];
    return `
    <article class="campaign-lote-card ${status.tone}" data-status="${status.key}">
      <div class="campaign-lote-top">
        <div>
          <div class="campaign-lote-name">${campaignEscape(lote.name)}</div>
          <div class="campaign-lote-meta">${campaignEscape(lote.cultivo)} · ${Math.round(campaignNumber(lote.ha)).toLocaleString('es-AR')} ha</div>
        </div>
        <span class="campaign-ops-status ${status.tone}">${campaignEscape(status.label)}</span>
      </div>
      <div class="campaign-lote-story">${campaignEscape(status.story)}</div>
      <div class="campaign-lote-facts">
        ${facts.map(([label, value]) => `<div class="campaign-lote-fact"><span>${label}</span><strong>${campaignEscape(value)}</strong></div>`).join('')}
      </div>
      <div class="campaign-lote-footer">
        <div class="campaign-lote-next">${campaignEscape(status.next)}</div>
        <button class="campaign-lote-cta" data-campaign-action="${status.action}" data-market-category="${campaignEscape(status.marketCategory || '')}">
          <i class="fas ${status.ctaIcon}"></i>
          ${campaignEscape(status.cta)}
        </button>
      </div>
    </article>`;
}

function handleCampaignAction(action, category) {
    if (action === 'market') {
        showScreen('market');
        if (category && typeof quickCatFilter === 'function') {
            setTimeout(() => quickCatFilter(category, null), 80);
        }
        return;
    }
    if (action === 'reservas') {
        showScreen('reservas');
        return;
    }
    showScreen('calc');
}

function deleteCampaignFromOps(campaignId) {
    const campaigns = window.AgronexCampaign.campaigns || [];
    const campaign = campaigns.find(item => item.id === String(campaignId));
    if (!campaign)
        return;
    if (!window.confirm(`¿Eliminar "${campaign.name}"?`))
        return;
    const rows = getStoredCampaignRows();
    const filtered = rows.filter((row, index) => campaignRowKey(row, index) !== String(campaignId));
    if (typeof saveSavedCampaigns === 'function')
        saveSavedCampaigns(filtered);
    else
        localStorage.setItem('agronex_saved_campaigns', JSON.stringify(filtered));
    selectedCampaignId = null;
    renderSavedCampaigns();
    if (typeof showToast === 'function')
        showToast('Campaña eliminada', 'success');
}

function editCampaignFromOps(campaignId) {
    if (typeof beginEditSavedCampaign === 'function') {
        beginEditSavedCampaign(campaignId);
        return;
    }
    showScreen('calc');
}

function renderSavedCampaigns() {
    ensureAgronexCampaign();
    const campaigns = window.AgronexCampaign.campaigns;
    const campaign = window.AgronexCampaign.current;
    const header = document.getElementById('campaign-ops-header');
    const history = document.getElementById('campaign-ops-history');
    const comparison = document.getElementById('campaign-ops-comparison');
    const list = document.getElementById('campaign-ops-list');
    const empty = document.getElementById('campaign-ops-empty');
    if (!header || !history || !comparison || !list || !empty)
        return;
    if (!campaign || !campaign.lotes.length) {
        header.innerHTML = '';
        history.innerHTML = '';
        comparison.innerHTML = '';
        list.innerHTML = '';
        empty.style.display = 'block';
        return;
    }
    const context = { bookings: window.AgronexCampaign.bookings };
    const statuses = campaign.lotes.map(lote => getLoteStatus(lote, campaign, context));
    const summary = getCampaignSummary(campaign, statuses);
    header.innerHTML = renderCampaignHeader(summary);
    history.innerHTML = renderCampaignHistoryPanel(campaigns, campaign.id);
    comparison.innerHTML = renderCampaignComparison(getCampaignComparison(campaign, getPreviousCampaign(campaign, campaigns)));
    list.innerHTML = campaign.lotes.map((lote, index) => renderCampaignCard(lote, statuses[index])).join('');
    empty.style.display = 'none';
    history.querySelectorAll('[data-campaign-view]').forEach(button => {
        button.addEventListener('click', () => {
            selectedCampaignId = button.dataset.campaignView;
            renderSavedCampaigns();
        });
    });
    history.querySelectorAll('[data-campaign-edit]').forEach(button => {
        button.addEventListener('click', () => editCampaignFromOps(button.dataset.campaignEdit));
    });
    history.querySelectorAll('[data-campaign-delete]').forEach(button => {
        button.addEventListener('click', () => deleteCampaignFromOps(button.dataset.campaignDelete));
    });
    list.querySelectorAll('[data-campaign-action]').forEach(button => {
        button.addEventListener('click', () => handleCampaignAction(button.dataset.campaignAction, button.dataset.marketCategory));
    });
}

function renderCampanasCards() {
    renderSavedCampaigns();
}

if (typeof window !== 'undefined') {
    window.getLoteStatus = getLoteStatus;
    window.getCampaignSummary = getCampaignSummary;
    window.renderCampaignCard = renderCampaignCard;
    window.renderCampaignHeader = renderCampaignHeader;
    window.renderSavedCampaigns = renderSavedCampaigns;
    window.renderCampanasCards = renderCampanasCards;
}

document.addEventListener('DOMContentLoaded', function () {
    ensureAgronexCampaign();
    renderSavedCampaigns();
});
