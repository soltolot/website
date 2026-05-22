// ==================================================
// app.js — APP STARTUP CONTROLLER (ORCHESTRATOR)
// ==================================================

log("DEBUG", "APP JS LOADED");

let appStarted = false;

// --------------------------------------------------
// START SEQUENTIAL PIPELINE
// --------------------------------------------------
async function startApp() {
    if (appStarted) {
        log("DEBUG", "startApp already called, skipping duplicate routine");
        return;
    }
    appStarted = true;

    log("BOOT", "startApp ENTERED");

    try {
        log("AUTH", "calling requireAuth()");
        const ok = await requireAuth();
        log("AUTH", "requireAuth returned: " + ok);

        if (!ok) {
            log("AUTH", "AUTH BLOCKED — STOPPING INITS");
            return;
        }

        log("UI", "calling setupUI()");
        try {
            if (typeof setupUI === "function") {
                await setupUI();
            } else {
                log("DEBUG", "setupUI function not found, skipping contextually");
            }
        } catch (err) {
            log("ERROR", "setupUI failed: " + (err?.message || err));
        }

        log("CHAT", "calling initChat()");
        try {
            if (typeof initChat === "function") {
                await initChat();
            } else {
                log("ERROR", "initChat function is missing from execution tree!");
            }
        } catch (err) {
            log("ERROR", "initChat failed: " + (err?.message || err));
        }

        log("DONE", "App pipeline finished successfully!");

    } catch (err) {
        log("FATAL", err?.message || err);
    }
}

// --------------------------------------------------
// GLOBAL AUTH WATCH (Single Source of Redirection Truth)
// --------------------------------------------------
function setupGlobalAuthWatch() {
    log("DEBUG", "setupGlobalAuthWatch ENTERED");

    if (typeof client === "undefined" || !client.auth) {
        log("ERROR", "Supabase client not initialized globally");
        return;
    }

    client.auth.onAuthStateChange((event, session) => {
        log("AUTH", "AUTH STATE CHANGE: " + event);

        const isLoginPage = window.location.pathname.includes("login.html");

        if (!session && !isLoginPage) {
            log("AUTH", "NO SESSION — redirecting to login.html");
            window.location.href = "login.html";
            return;
        }

        if (session && isLoginPage) {
            log("AUTH", "LOGGED IN ON LOGIN PAGE — redirecting to chat.html");
            window.location.href = "chat.html";
        }
    });
}

// --------------------------------------------------
// BOOTSTRAP INITIALIZATION
// --------------------------------------------------
function boot() {
    log("BOOT", "boot() ENTERED — RUNNING SEQUENCE");

    setupGlobalAuthWatch();

    log("BOOT", "calling startApp()");
    startApp();

    log("BOOT", "calling setupDevToggle()");
    if (typeof setupDevToggle === "function") {
        setupDevToggle();
    }

    log("BOOT", "boot() FINISHED EXECUTING");
}

// Wait for DOM to finish loading completely
document.addEventListener("DOMContentLoaded", () => {
    log("BOOT", "DOM READY — CALLING boot()");
    boot();
});
