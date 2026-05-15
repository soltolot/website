// ===============================
// APP STARTUP CONTROLLER
// ===============================

let appStarted = false;

// -------------------------------
// WAIT FOR EVERYTHING TO EXIST
// -------------------------------
function wait(ms) {
    return new Promise(r => setTimeout(r, ms));
}

// -------------------------------
// SAFE INIT FLOW
// -------------------------------
async function startApp() {

    if (appStarted) return;
    appStarted = true;

    // 1. Wait for Supabase hydration
    await wait(200);

    // 2. AUTH CHECK (from auth.js)
    const ok = await requireAuth();
    if (!ok) return;

    // 3. Ensure UI exists before anything touches DOM
    if (typeof setupUI === "function") {
        setupUI();
    }

    // 4. Wait a tiny bit for DOM stability (kills flicker bug)
    await wait(100);

    // 5. CHAT INIT (from chat.js)
    if (typeof initChat === "function") {
        await initChat();
    }

    // 6. FINAL LOAD: force first render
    if (typeof loadMessages === "function") {
        await loadMessages();
    }

    console.log("✅ SultanChat fully started");
}

// -------------------------------
// HANDLE AUTH STATE CHANGES
// (prevents bounce between login/chat)
// -------------------------------
function setupGlobalAuthWatch() {

    client.auth.onAuthStateChange((event, session) => {

        // if user logs out → send to login
        if (!session) {
            window.location.href = "login.html";
            return;
        }

        // if user logs in while on login page → go chat
        if (session && window.location.pathname.includes("login")) {
            window.location.href = "chat.html";
        }
    });
}

// -------------------------------
// BOOT SEQUENCE
// -------------------------------
(async function boot() {

    setupGlobalAuthWatch();

    // small delay to avoid Supabase race conditions
    await wait(150);

    startApp();

})();
