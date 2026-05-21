alert("APP JS LOADED — TOP OF FILE");

// Load DEV_MODE
alert("Loading DEV_MODE from localStorage");
window.DEV_MODE = JSON.parse(localStorage.getItem("DEV_MODE") || "false");
alert("DEV_MODE = " + window.DEV_MODE);

// safe logger call (prevents crash if log() not loaded yet)
function setDevMode(value) {
    alert("setDevMode CALLED with " + value);

    window.DEV_MODE = value;
    localStorage.setItem("DEV_MODE", JSON.stringify(value));

    if (typeof log === "function") {
        alert("setDevMode: log() exists, logging now");
        log("DEV_MODE", value ? "ON 🧠" : "OFF 👤");
    } else {
        alert("setDevMode: log() DOES NOT EXIST");
    }
}

function setupDevToggle() {
    alert("setupDevToggle() ENTERED");

    const toggle = document.getElementById("dev-toggle");

    if (!toggle) {
        alert("setupDevToggle: toggle NOT FOUND");
        return;
    }

    alert("setupDevToggle: toggle FOUND");

    toggle.checked = !!window.DEV_MODE;

    toggle.addEventListener("change", (e) => {
        alert("setupDevToggle: toggle CHANGED");
        setDevMode(!!e.target.checked);
    });
}

if (typeof log === "function") {
    alert("log() EXISTS — calling requireAuth soon");
} else {
    alert("log() DOES NOT EXIST — fallback mode");
}

// ===============================
// APP STARTUP CONTROLLER (CLEAN)
// ===============================

let appStarted = false;

// -------------------------------
// SAFE START
// -------------------------------
async function startApp() {
    alert("startApp() ENTERED");

    try {
        alert("startApp: calling requireAuth()");
        const ok = await requireAuth();
        alert("startApp: requireAuth() returned: " + ok);

        if (!ok) {
            alert("startApp: AUTH BLOCKED — STOPPING");
            return;
        }

        alert("startApp: calling setupUI()");
        setupUI?.();

        alert("startApp: calling initChat()");
        await initChat?.();

        alert("startApp: FINISHED SUCCESSFULLY");

    } catch (err) {
        alert("startApp: FATAL ERROR — " + err);
    }
}

// -------------------------------
// GLOBAL AUTH WATCH
// -------------------------------
function setupGlobalAuthWatch() {
    alert("setupGlobalAuthWatch() ENTERED");

    client.auth.onAuthStateChange((event, session) => {
        alert("AUTH STATE CHANGE: " + event);

        if (!session) {
            alert("AUTH: No session — redirecting to login.html");
            window.location.href = "login.html";
            return;
        }

        if (session && window.location.pathname.includes("login")) {
            alert("AUTH: Logged in on login page — redirecting to chat.html");
            window.location.href = "chat.html";
        }
    });
}

// -------------------------------
// BOOTSTRAP SEQUENCE
// -------------------------------
function boot() {
    alert("boot() ENTERED — BOOT SEQUENCE STARTED");

    setupGlobalAuthWatch();

    alert("boot(): calling startApp()");
    startApp();
}

// FIRE BOOT IMMEDIATELY
alert("CALLING boot()");
boot();
alert("boot() FINISHED EXECUTING");
