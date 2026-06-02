// ==================================================
// app.js — SEQUENTIAL PIPELINE INITIALIZATION
// ==================================================

log("DEBUG", "APP JS LOADED");

if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("/service-worker.js")
            .then(() => log("SW registered"))
            .catch(err => log("SW failed:", err));
    });
}

let appStarted = false;

// --------------------------------------------------
// START SEQUENTIAL STARTUP EXECUTION TREE
// --------------------------------------------------
async function startApp() {
    if (appStarted) {
        log("DEBUG", "startApp already invoked. Canceling loop duplication.");
        return;
    }
    appStarted = true;

    log("BOOT", "startApp ENTERED");

    try {
        // Step 1: Run Auth Guard checks
        log("AUTH", "calling requireAuth()");
        const ok = await requireAuth();
        log("AUTH", "requireAuth returned: " + ok);

        if (!ok) {
            log("AUTH", "AUTHENTICATION GUARD BLOCKED EXECUTIONS — STOPPING SYSTEM");
            return;
        }

        // Step 2: Initialize UI configurations
        log("UI", "calling setupUI()");
        try {
            if (typeof setupUI === "function") {
                await setupUI();
            } else {
                log("DEBUG", "setupUI target module missing from runtime paths.");
            }
        } catch (err) {
            log("ERROR", "setupUI crashed: " + (err?.message || err));
        }

        // Step 3: Run Chat Engine
        log("CHAT", "calling initChat()");
        try {
            if (typeof initChat === "function") {
                await initChat();
            } else {
                log("ERROR", "initChat framework method target missing from tracking branches!");
            }
        } catch (err) {
            log("ERROR", "initChat crashed: " + (err?.message || err));
        }

        log("DONE", "All pipelines finished setup successfully.");

    } catch (err) {
        log("FATAL", "Core boot engine exception caught: " + (err?.message || err));
    }
}

// --------------------------------------------------
// GLOBAL AUTH WATCH (THE ONLY REDIRECTION LISTENER)
// --------------------------------------------------
function setupGlobalAuthWatch() {
    log("DEBUG", "setupGlobalAuthWatch ENTERED");

    if (typeof client === "undefined" || !client.auth) {
        log("ERROR", "Supabase client is inaccessible in current script context.");
        return;
    }

    client.auth.onAuthStateChange((event, session) => {
        log("AUTH", "GLOBAL AUTH STATE TRIGGERED: " + event);

        const isLoginPage = window.location.pathname.includes("login.html");

        if (!session && !isLoginPage) {
            log("AUTH", "NO ROUTE SESSION DETECTED — moving window to login.html");
            
            // Clean hook: Disconnect active real-time WebSockets before page tearing
            if (client && typeof client.removeAllChannels === "function") {
                log("AUTH", "Removing active real-time socket channels...");
                client.removeAllChannels();
            }

            window.location.href = "login.html";
            return;
        }

        if (session && isLoginPage) {
            log("AUTH", "SESSION DETECTED ON USER LOGIN VIEW — moving window to chat.html");
            window.location.href = "chat.html";
        }
    });
}

// --------------------------------------------------
// BOOTSTRAP MAIN INTERACTION INITIALIZATION
// --------------------------------------------------
async function boot() {
    log("BOOT", "boot() ENTERED — RUNNING TIMELINE STAGES");

    setupGlobalAuthWatch();

    log("BOOT", "calling startApp()");
    await startApp(); // 🔥 IMPORTANT CHANGE

    log("BOOT", "calling setupDevToggle()");
    if (typeof setupDevToggle === "function") {
        setupDevToggle();
    }

    log("BOOT", "boot() LIFECYCLE COMPLETED");

    document.getElementById("status").textContent = "CONNECTED";
}

// Attach pipeline start execution directly onto the DOM trigger
document.addEventListener("DOMContentLoaded", () => {
    log("BOOT", "DOM ENVIRONMENT READY — CALLING boot()");
    boot();
});
