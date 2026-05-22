log("DEBUG", "APP JS LOADED");
log("DISPLAY NAME", window.displayName);

// ===============================
// APP STARTUP CONTROLLER (CLEAN)
// ===============================

let appStarted = false;

// -------------------------------
// SAFE START
// -------------------------------
async function startApp() {

    if (appStarted) {
        log("DEBUG", "startApp already called, skipping");
        return;
    }
    appStarted = true;

    log("BOOT", "startApp ENTERED");

    try {

        log("AUTH", "calling requireAuth()");
        const ok = await requireAuth();
        log("AUTH", "requireAuth returned: " + ok);

        if (!ok) {
            log("AUTH", "AUTH BLOCKED — STOPPING");
            return;
        }

        log("UI", "calling setupUI()");
        try {
            await setupUI?.();
        } catch (err) {
            log("ERROR", "setupUI failed: " + (err?.message || err));
        }

        log("CHAT", "calling initChat()");
        try {
            await initChat?.();
        } catch (err) {
            log("ERROR", "initChat failed: " + (err?.message || err));
        }

        log("DONE", "app finished successfully");

    } catch (err) {
        log("FATAL", err?.message || err);
    }
}

// -------------------------------
// GLOBAL AUTH WATCH
// -------------------------------
function setupGlobalAuthWatch() {

    log("DEBUG", "setupGlobalAuthWatch ENTERED");

    // Guard: check if client exists
    if (typeof client === "undefined" || !client.auth) {
        log("ERROR", "Supabase client not initialized");
        return;
    }

    client.auth.onAuthStateChange((event, session) => {

        log("AUTH", "AUTH STATE CHANGE: " + event);

        if (!session) {
            log("AUTH", "NO SESSION — redirecting to login.html");
            window.location.href = "login.html";
            return;
        }

        if (session && window.location.pathname.includes("login")) {
            log("AUTH", "LOGGED IN ON LOGIN PAGE — redirecting to chat.html");
            window.location.href = "chat.html";
        }
    });
}

// -------------------------------
// BOOTSTRAP SEQUENCE
// -------------------------------
function boot() {

    log("BOOT", "boot() ENTERED — BOOT SEQUENCE STARTED");

    setupGlobalAuthWatch();

    log("BOOT", "calling startApp()");
    startApp();

    log("BOOT", "calling setupDevToggle()");
    setupDevToggle();

    log("BOOT", "boot() FINISHED EXECUTING");
}

// ⭐ WAIT FOR DOM AND DEPENDENCIES BEFORE BOOT
document.addEventListener("DOMContentLoaded", () => {
    log("BOOT", "DOM READY — CALLING boot()");
    boot();
});
