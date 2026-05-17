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

    if (appStarted) return;
    appStarted = true;

    console.log("🚀 Starting SultanChat...");

    try {

        // -------------------------
        // AUTH (non-blocking safe check)
        // -------------------------
        const ok = await requireAuth();

        if (!ok) {
            console.warn("⚠️ Auth not confirmed, continuing anyway");
        }

        // -------------------------
        // OPTIONAL UI SETUP
        // -------------------------
        if (typeof setupUI === "function") {
            setupUI();
        }

        if (typeof setupDevToggle === "function") {
            setupDevToggle();
        }
        
        // -------------------------
        // CHAT INIT (ONLY ONCE)
        // -------------------------
        if (typeof initChat === "function") {
            await initChat();
        }

        console.log("✅ SultanChat fully started");

    } catch (err) {
        console.error("❌ App startup failed:", err);

        if (window.showError) {
            showError(err, "APP_STARTUP_ERROR");
        }
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
(function boot() {

    console.log("🧠 Boot sequence started");

    setupGlobalAuthWatch();

    // IMPORTANT: no artificial delays
    startApp();

})();
