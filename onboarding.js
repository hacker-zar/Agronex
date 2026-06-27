"use strict";
/* ================================================================
   AGRONEX — ONBOARDING
   Reglas del contexto maestro:
   - Se activa solo la primera vez (profile.onboarding_completado = false)
   - No se puede saltar (no existe "Completar después")
   - 4 pasos productor / 5 pasos contratista o ambos
   - Máximo 2 campos por pantalla
   - Se guarda en Supabase al avanzar cada paso, no al final
   - Si abandona, retoma donde dejó
================================================================ */

let _onboardingState = {
    profileId: null,
    tipoUsuario: null, // 'productor' | 'contratista' | 'ambos'
    totalSteps: 4,      // se recalcula tras el paso 1
    currentStep: 1,
};

function startOnboarding(profile) {
    _onboardingState.profileId = profile.id;

    // Si ya eligió tipo en un intento anterior, retomamos con el total correcto
    if (profile.tipo === 'contratista' || profile.tipo === 'ambos') {
        _onboardingState.tipoUsuario = profile.tipo;
        _onboardingState.totalSteps = 5;
    }

    document.getElementById('auth-screen').style.display = 'none';
    document.getElementById('app').style.display = 'none';
    document.body.classList.remove('auth-active');
    _renderOnboardingShell();
    _renderOnboardingStep(1);
}

function _renderOnboardingShell() {
    if (document.getElementById('onboarding-overlay')) return; // ya montado
    const shell = document.createElement('div');
    shell.id = 'onboarding-overlay';
    shell.innerHTML = `
        <div class="onb-bg"></div>
        <div class="onb-card">
            <div class="onb-progress"><div class="onb-progress-fill" id="onb-progress-fill"></div></div>
            <div id="onb-step-content"></div>
        </div>
    `;
    document.body.appendChild(shell);
    _injectOnboardingStyles();
}

function _injectOnboardingStyles() {
    if (document.getElementById('onb-styles')) return;
    const style = document.createElement('style');
    style.id = 'onb-styles';
    style.textContent = `
        #onboarding-overlay { position: fixed; inset: 0; z-index: 9999; display: flex; align-items: center; justify-content: center; }
        #onboarding-overlay .onb-bg { position: absolute; inset: 0; background: var(--color-bg, #f7f6f3); }
        #onboarding-overlay .onb-card { position: relative; width: min(420px, 92vw); max-height: 88vh; overflow-y: auto; background: var(--bg-card, #fff); border-radius: 16px; padding: 28px 24px; box-shadow: 0 12px 40px rgba(0,0,0,.12); }
        #onboarding-overlay .onb-progress { height: 4px; border-radius: 4px; background: rgba(0,0,0,.08); margin-bottom: 22px; overflow: hidden; }
        #onboarding-overlay .onb-progress-fill { height: 100%; background: var(--color-accent, #3b6d11); transition: width .25s ease; }
        #onboarding-overlay h2 { font-family: var(--font-display, 'Barlow Condensed', sans-serif); font-size: 22px; margin: 0 0 6px; }
        #onboarding-overlay .onb-sub { color: var(--text-secondary, #666); font-size: 14px; margin-bottom: 20px; }
        #onboarding-overlay .onb-field { margin-bottom: 16px; }
        #onboarding-overlay .onb-field label { display: block; font-size: 13px; font-weight: 600; margin-bottom: 6px; }
        #onboarding-overlay .onb-field input, #onboarding-overlay .onb-field select {
            width: 100%; padding: 12px; border-radius: 10px; border: 1px solid rgba(0,0,0,.12); font-size: 16px;
        }
        #onboarding-overlay .onb-option-btn {
            display: block; width: 100%; text-align: left; padding: 14px 16px; margin-bottom: 10px;
            border-radius: 12px; border: 1px solid rgba(0,0,0,.12); background: var(--bg-card, #fff);
            font-size: 15px; cursor: pointer; transition: border-color .15s;
        }
        #onboarding-overlay .onb-option-btn:hover { border-color: var(--color-accent, #3b6d11); }
        #onboarding-overlay .onb-actions { display: flex; justify-content: space-between; align-items: center; margin-top: 20px; gap: 10px; }
        #onboarding-overlay .onb-actions button { min-height: 44px; }
        #onboarding-overlay .onb-error { color: var(--color-loss, #d94040); font-size: 13px; margin-bottom: 10px; display: none; }
    `;
    document.head.appendChild(style);
}

function _updateProgress() {
    const pct = Math.round((_onboardingState.currentStep / _onboardingState.totalSteps) * 100);
    const fill = document.getElementById('onb-progress-fill');
    if (fill) fill.style.width = pct + '%';
}

async function _saveOnboardingStep(fields) {
    const { error } = await UserStore.saveToSupabase(fields);
    if (error) {
        showToast('No pudimos guardar este paso. Revisá tu conexión.', 'error');
        return false;
    }
    UserStore.setQuiet(fields);
    return true;
}

function _renderOnboardingStep(step) {
    _onboardingState.currentStep = step;
    _updateProgress();
    const target = document.getElementById('onb-step-content');
    if (!target) return;

    // ── Paso 1: tipo de usuario ──
    if (step === 1) {
        target.innerHTML = `
            <h2>Bienvenido a Agronex</h2>
            <p class="onb-sub">En 2 minutos configuramos todo para vos.</p>
            <button class="onb-option-btn" onclick="_onbSelectTipo('productor')">Soy productor — tengo campos y cultivos</button>
            <button class="onb-option-btn" onclick="_onbSelectTipo('contratista')">Soy contratista — tengo maquinaria para alquilar</button>
            <button class="onb-option-btn" onclick="_onbSelectTipo('ambos')">Soy los dos</button>
        `;
        return;
    }

    // ── Paso 2: datos básicos ──
    if (step === 2) {
        const nombre = UserStore.get('nombre') || '';
        const apellido = UserStore.get('apellido') || '';
        target.innerHTML = `
            <h2>Tus datos</h2>
            <p class="onb-sub">Así te van a reconocer en Agronex.</p>
            <div class="onb-field"><label>Nombre *</label><input id="onb-nombre" value="${_escapeHtml(nombre)}" placeholder="Carlos"></div>
            <div class="onb-field"><label>Apellido *</label><input id="onb-apellido" value="${_escapeHtml(apellido)}" placeholder="Sánchez"></div>
            <div class="onb-field"><label>Teléfono * (con código de país)</label><input id="onb-telefono" placeholder="+54 9 11 1234-5678"></div>
            <div class="onb-error" id="onb-error"></div>
            <div class="onb-actions">
                <button class="btn btn-secondary" onclick="_renderOnboardingStep(1)">Atrás</button>
                <button class="btn btn-primary" onclick="_onbSubmitStep2()">Continuar</button>
            </div>
        `;
        return;
    }

    // ── Paso 3: operación ──
    if (step === 3) {
        target.innerHTML = `
            <h2>Tu operación</h2>
            <p class="onb-sub">Esto hace que la Calculadora y los Benchmarks funcionen desde el día 1.</p>
            <div class="onb-field"><label>Zona principal * (provincia / departamento)</label><input id="onb-zona" placeholder="Pergamino, Buenos Aires"></div>
            <div class="onb-field"><label>Hectáreas totales (opcional)</label><input id="onb-ha" type="number" min="0" placeholder="300"></div>
            <div class="onb-field"><label>Cultivo principal</label>
                <select id="onb-cultivo">
                    <option value="Soja">Soja</option><option value="Maíz">Maíz</option><option value="Trigo">Trigo</option><option value="Girasol">Girasol</option>
                </select>
            </div>
            <div class="onb-error" id="onb-error"></div>
            <div class="onb-actions">
                <button class="btn btn-secondary" onclick="_renderOnboardingStep(2)">Atrás</button>
                <button class="btn btn-primary" onclick="_onbSubmitStep3()">Continuar</button>
            </div>
        `;
        return;
    }

    // ── Paso 4: contratista (solo si aplica) ──
    if (step === 4 && _onboardingState.totalSteps === 5) {
        target.innerHTML = `
            <h2>¿Qué tenés disponible?</h2>
            <p class="onb-sub">Así pre-completamos tu primera publicación en NexuDrive.</p>
            <div class="onb-field"><label>Zona de trabajo *</label><input id="onb-zona-trabajo" placeholder="Pergamino y alrededores"></div>
            <div class="onb-error" id="onb-error"></div>
            <div class="onb-actions">
                <button class="btn btn-secondary" onclick="_renderOnboardingStep(3)">Atrás</button>
                <button class="btn btn-primary" onclick="_onbSubmitStep4()">Continuar</button>
            </div>
        `;
        return;
    }

    // ── Paso final: confirmación ──
    const finalStep = _onboardingState.totalSteps;
    if (step === finalStep) {
        const nombre = UserStore.get('nombre') || '';
        target.innerHTML = `
            <h2>Todo listo, ${_escapeHtml(nombre)}.</h2>
            <p class="onb-sub">Ya podés empezar a usar Agronex.</p>
            <div class="onb-actions" style="justify-content:center;">
                <button class="btn btn-primary" onclick="_finishOnboarding()">Entrar a Agronex →</button>
            </div>
        `;
    }
}

function _escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
}

async function _onbSelectTipo(tipo) {
    _onboardingState.tipoUsuario = tipo;
    _onboardingState.totalSteps = (tipo === 'contratista' || tipo === 'ambos') ? 5 : 4;
    const ok = await _saveOnboardingStep({ tipo });
    if (!ok) return;
    _renderOnboardingStep(2);
}

async function _onbSubmitStep2() {
    const nombre = document.getElementById('onb-nombre').value.trim();
    const apellido = document.getElementById('onb-apellido').value.trim();
    const telefono = document.getElementById('onb-telefono').value.trim();
    const errEl = document.getElementById('onb-error');
    errEl.style.display = 'none';

    if (nombre.length < 2 || /\d/.test(nombre)) {
        errEl.textContent = 'Ingresá un nombre válido.';
        errEl.style.display = 'block';
        return;
    }
    if (apellido.length < 2) {
        errEl.textContent = 'Ingresá tu apellido.';
        errEl.style.display = 'block';
        return;
    }
    if (!telefono || telefono.length < 8) {
        errEl.textContent = 'Ingresá un teléfono válido con código de país.';
        errEl.style.display = 'block';
        return;
    }

    const ok = await _saveOnboardingStep({ nombre, apellido, telefono });
    if (!ok) return;
    _renderOnboardingStep(3);
}

async function _onbSubmitStep3() {
    const zona = document.getElementById('onb-zona').value.trim();
    const haRaw = document.getElementById('onb-ha').value;
    const cultivo = document.getElementById('onb-cultivo').value;
    const errEl = document.getElementById('onb-error');
    errEl.style.display = 'none';

    if (!zona) {
        errEl.textContent = 'Ingresá tu zona principal.';
        errEl.style.display = 'block';
        return;
    }

    const fields = { provincia: zona, cultivo_principal: cultivo };
    if (haRaw) fields.ha = parseInt(haRaw, 10);

    const ok = await _saveOnboardingStep(fields);
    if (!ok) return;

    _renderOnboardingStep(4); // tanto productor puro (final) como contratista (paso 4 real) caen acá
}

async function _onbSubmitStep4() {
    const zonaTrabajo = document.getElementById('onb-zona-trabajo').value.trim();
    const errEl = document.getElementById('onb-error');
    errEl.style.display = 'none';

    if (!zonaTrabajo) {
        errEl.textContent = 'Ingresá tu zona de trabajo.';
        errEl.style.display = 'block';
        return;
    }

    const ok = await _saveOnboardingStep({ tiene_maquinaria: true });
    if (!ok) return;
    _renderOnboardingStep(5);
}

async function _finishOnboarding() {
    const ok = await _saveOnboardingStep({ onboarding_completado: true });
    if (!ok) return;

    const overlay = document.getElementById('onboarding-overlay');
    if (overlay) overlay.remove();

    document.getElementById('app').style.display = 'block';
    doLogin();
    showToast('¡Bienvenido a Agronex! 🌱', 'success');
}
