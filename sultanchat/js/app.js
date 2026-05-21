log("DEBUG", "APP JS LOADED");
log("DISPLAY NAME", window.displayName);


window.DEV_MODE = JSON.parse(localStorage.getItem("DEV_MODE") || "false");

// safe logger call (prevents crash if log() not loaded yet)
function setDevMode(value) {

    log("DEBUG", "setDevMode CALLED with " + value);

    window.DEV_MODE = value;
    localStorage.setItem("DEV_MODE", JSON.stringify(value));

    if (typeof log === "function") {
        log("DEV_MODE", value ? "ON 🧠" : "OFF 👤");
    }
}

function setupDevToggle() {

    log("DEBUG", "setupDevToggle() ENTERED");

    const toggle = document.getElementById("dev-toggle");

    if (!toggle) {
        log("DEBUG", "setupDevToggle: toggle NOT FOUND");
        return;
    }

    log("DEBUG", "setupDevToggle: toggle FOUND");

    toggle.checked = !!window.DEV_MODE;

    toggle.addEventListener("change", (e) => {
        log("DEBUG", "setupDevToggle: toggle CHANGED");
        setDevMode(!!e.target.checked);
    });
}

if (typeof log === "function") {
    log("DEBUG", "log() EXISTS — calling requireAuth soon");
} else {
    console.log("APP JS WORKING (fallback)");
}

// ===============================
// APP STARTUP CONTROLLER (CLEAN)
// ===============================

let appStarted = false;

// -------------------------------
// SAFE START
// -------------------------------
async function startApp() {

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
        setupUI?.();

        log("CHAT", "calling initChat()");
        await initChat?.();

        log("DONE", "app finished successfully");

    } catch (err) {
        log("FATAL", err);
    }
}

// -------------------------------
// GLOBAL AUTH WATCH
// -------------------------------
function setupGlobalAuthWatch() {

    log("DEBUG", "setupGlobalAuthWatch ENTERED");

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
}

// FIRE BOOT IMMEDIATELY
log("BOOT", "CALLING boot()");
boot();
log("BOOT", "boot() FINISHED EXECUTING");
