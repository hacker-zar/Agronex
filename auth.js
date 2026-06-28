"use strict";
/* ================================================================
   AGRONEX — AUTH REAL (Supabase)
   Reemplaza el doLogin() decorativo por autenticación de verdad.
   Reglas del contexto maestro:
   - Supabase Auth (email + password)
   - Sesiones persistentes con refresh token
   - Onboarding al primer login, no se puede saltar
   - Si ya tiene cuenta (profile.onboarding_completado = true) → directo al Home
================================================================ */

// ===== CLIENTE SUPABASE =====
const SUPABASE_URL = 'https://cadmgykrljznmzgxolrr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhZG1neWtybGp6bm16Z3hvbHJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI1NTYyMzMsImV4cCI6MjA5ODEzMjIzM30.8abFKWDV-kQ_WqO5d5PGSxAkbD4UZYGkhFne5p3VnPU';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        persistSession: true,      // sesión persiste entre recargas (refresh token)
        autoRefreshToken: true,    // renueva el token solo, sin desloguear al usuario
        detectSessionInUrl: true,  // necesario para magic links / OAuth a futuro
    },
});

// ===== HELPERS DE UI =====
function _setAuthLoading(btnId, labelId, loading, loadingText, normalText) {
    const btn = document.getElementById(btnId);
    const label = document.getElementById(labelId);
    if (!btn || !label) return;
    btn.disabled = loading;
    btn.style.opacity = loading ? '0.7' : '1';
    label.textContent = loading ? loadingText : normalText;
}

function _showAuthError(elId, message) {
    const el = document.getElementById(elId);
    if (!el) return;
    el.textContent = message;
    el.style.display = 'block';
}

function _hideAuthError(elId) {
    const el = document.getElementById(elId);
    if (!el) return;
    el.style.display = 'none';
}

// Traduce errores técnicos de Supabase a mensajes humanos (regla de UX del contexto maestro)
function _translateAuthError(error) {
    const msg = (error && error.message) || '';
    if (msg.includes('Invalid login credentials')) return 'Email o contraseña incorrectos.';
    if (msg.includes('User already registered')) return 'Ya existe una cuenta con ese email. Probá iniciar sesión.';
    if (msg.includes('Password should be at least')) return 'La contraseña debe tener al menos 8 caracteres.';
    if (msg.includes('Unable to validate email')) return 'Ese email no parece válido.';
    if (msg.includes('Email not confirmed')) return 'Confirmá tu email antes de iniciar sesión (revisá tu bandeja de entrada).';
    return 'Algo salió mal. Intentá de nuevo.';
}

// ===== REGISTRO =====
async function handleRegisterSubmit() {
    _hideAuthError('auth-register-error');

    const nombre = document.getElementById('register-nombre').value.trim();
    const apellido = document.getElementById('register-apellido').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const ha = document.getElementById('register-ha').value;
    const tipo = document.getElementById('register-tipo').value;
    const pass = document.getElementById('register-pass').value;

    // Validación mínima en cliente (la validación fuerte la hace Supabase del lado servidor)
    if (!nombre || nombre.length < 2) {
        _showAuthError('auth-register-error', 'Ingresá tu nombre.');
        return;
    }
    if (!apellido || apellido.length < 2) {
        _showAuthError('auth-register-error', 'Ingresá tu apellido.');
        return;
    }
    if (!email || !email.includes('@')) {
        _showAuthError('auth-register-error', 'Ingresá un email válido.');
        return;
    }
    if (!pass || pass.length < 8) {
        _showAuthError('auth-register-error', 'La contraseña debe tener al menos 8 caracteres.');
        return;
    }

    _setAuthLoading('auth-register-btn', 'auth-register-btn-label', true, 'Creando cuenta...', 'Crear cuenta gratis');

    const { data, error } = await supabaseClient.auth.signUp({
        email,
        password: pass,
        options: {
            data: { nombre, apellido }, // queda en auth.users.raw_user_meta_data, opcional
        },
    });

    if (error) {
        _setAuthLoading('auth-register-btn', 'auth-register-btn-label', false, '', 'Crear cuenta gratis');
        _showAuthError('auth-register-error', _translateAuthError(error));
        return;
    }

    // El trigger de Supabase ya creó la fila en profiles con email + onboarding_completado=false.
    // Completamos con los datos extra que el trigger no tiene (nombre, apellido, ha, tipo).
    if (data.user) {
        const haMap = { '0-100': 80, '100-500': 300, '500-1500': 1000, '1500+': 2000 };
        const { error: profileError } = await supabaseClient
            .from('profiles')
            .update({
                nombre,
                apellido,
                ha: haMap[ha] || null,
                tipo,
                updated_at: new Date().toISOString(),
            })
            .eq('id', data.user.id);

        if (profileError) {
            console.warn('[Agronex] No se pudo completar el perfil inicial:', profileError);
            // No bloqueamos el flujo por esto: el onboarding va a pedir estos datos igual.
        }
    }

    _setAuthLoading('auth-register-btn', 'auth-register-btn-label', false, '', 'Crear cuenta gratis');

    // Si Supabase requiere confirmación de email, no hay sesión todavía
    if (!data.session) {
        _showAuthError('auth-register-error', 'Te enviamos un email de confirmación. Confirmalo para poder entrar.');
        return;
    }

    // Hay sesión real → entramos. enterApp() decide si va a onboarding o al Home.
    await enterApp();
}

// ===== LOGIN =====
async function handleLoginSubmit() {
    _hideAuthError('auth-login-error');

    const email = document.getElementById('login-email').value.trim();
    const pass = document.getElementById('login-pass').value;

    if (!email || !pass) {
        _showAuthError('auth-login-error', 'Completá email y contraseña.');
        return;
    }

    _setAuthLoading('auth-login-btn', 'auth-login-btn-label', true, 'Entrando...', 'Entrar al campo');

    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password: pass });

    _setAuthLoading('auth-login-btn', 'auth-login-btn-label', false, '', 'Entrar al campo');

    if (error) {
        _showAuthError('auth-login-error', _translateAuthError(error));
        return;
    }

    await enterApp();
}

// ===== LOGOUT =====
async function handleLogout() {
    await supabaseClient.auth.signOut();
    // Volvemos a mostrar la pantalla de auth, limpia
    document.getElementById('app').style.display = 'none';
    document.getElementById('auth-screen').style.display = 'flex';
    document.body.classList.add('auth-active');
    document.getElementById('login-email').value = '';
    document.getElementById('login-pass').value = '';
}

// ===== NÚCLEO: decide a dónde entra el usuario =====
// Se llama después de login/registro exitoso, y también al cargar la página si ya hay sesión.
async function enterApp() {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (!session) {
        // No hay sesión real → mostramos auth-screen, nunca el Home
        document.getElementById('auth-screen').style.display = 'flex';
        document.getElementById('app').style.display = 'none';
        document.body.classList.add('auth-active');
        return;
    }

    const userId = session.user.id;
    const { data: profile, error } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (error || !profile) {
        console.error('[Agronex] No se pudo cargar el perfil:', error);
        showToast('No pudimos cargar tu perfil. Intentá de nuevo.', 'error');
        return;
    }

    // Cargamos el perfil real de Supabase al UserStore (fuente única de verdad)
    UserStore.loadFromProfile(profile);

    if (!profile.onboarding_completado) {
        startOnboarding(profile);
    } else {
        doLogin(); // entra directo al Home con los datos ya cargados
    }
}

// ===== Al cargar la página: ¿ya hay sesión activa? =====
window.addEventListener('DOMContentLoaded', async () => {
    await enterApp();
});

// Si la sesión expira o se cierra desde otra pestaña, reflejarlo acá también
supabaseClient.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_OUT') {
        document.getElementById('app').style.display = 'none';
        document.getElementById('auth-screen').style.display = 'flex';
        document.body.classList.add('auth-active');
    }
});

// Nota: switchAuthTab() ya está definida en calculator.js, no se duplica acá.
// Le agregamos solo el reseteo de errores cuando se cambia de tab.
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.auth-tab').forEach(tabBtn => {
        tabBtn.addEventListener('click', () => {
            _hideAuthError('auth-login-error');
            _hideAuthError('auth-register-error');
        });
    });
});
