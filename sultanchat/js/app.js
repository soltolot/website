alert("APP JS LOADED");
window.DEV_MODE = JSON.parse(localStorage.getItem("DEV_MODE") || "false");

// safe logger call (prevents crash if log() not loaded yet)
function setDevMode(value) {

    window.DEV_MODE = value;
    localStorage.setItem("DEV_MODE", JSON.stringify(value));

    if (typeof log === "function") {
        log("DEV_MODE", value ? "ON 🧠" : "OFF 👤");
    }
}

function setupDevToggle() {

    const toggle = document.getElementById("dev-toggle");

    if (!toggle) return;

    // ensure state is valid boolean
    toggle.checked = !!window.DEV_MODE;

    toggle.addEventListener("change", (e) => {
        setDevMode(!!e.target.checked);
    });
}


log('app.js working')


// ===============================
// APP STARTUP CONTROLLER (CLEAN)
// ===============================

let appStarted = false;

// -------------------------------
// SAFE START
// -------------------------------
async function startApp() {

    log("BOOT", "startApp entered");

    try {

        log("AUTH", "calling requireAuth...");
        const ok = await requireAuth();
        log("AUTH", ok);

        if (!ok) {
            log("AUTH", "blocked");
            return;
        }

        log("UI", "setupUI...");
        setupUI?.();

        log("CHAT", "initChat...");
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

    client.auth.onAuthStateChange((event, session) => {

        // Logged out → go login
        if (!session) {
            window.location.href = "login.html";
            return;
        }

        // Logged in on login page → go chat
        if (session && window.location.pathname.includes("login")) {
            window.location.href = "chat.html";
        }
    });
}

// -------------------------------
// BOOTSTRAP SEQUENCE
// -------------------------------
function boot() {

    console.log("🧠 Boot sequence started");

    setupGlobalAuthWatch();

    // IMPORTANT: no artificial delays
    startApp();

})();
