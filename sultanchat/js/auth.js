window.displayName = null;

// ===============================
// AUTH SYSTEM (SESSION + USER)
// ===============================

let currentUser = null;
let displayName = null;

// -------------------------------
// WAIT FOR SUPABASE READY
// -------------------------------
function waitForAuth() {
    return new Promise((resolve) => {

        const { data: listener } =
            client.auth.onAuthStateChange(() => {
                listener.subscription.unsubscribe();
                resolve();
            });

        // fallback in case event doesn't fire fast
        setTimeout(resolve, 300);
    });
}

// -------------------------------
// GET SESSION SAFELY
// -------------------------------
async function getSessionSafe() {

    const { data: { session } } = await client.auth.getSession();

    if (session) return session;

    // small retry (fixes Supabase hydration delay bug)
    await new Promise(r => setTimeout(r, 300));

    const retry = await client.auth.getSession();
    return retry.data.session || null;
}

// -------------------------------
// LOAD USER
// -------------------------------
async function loadUser() {

    const { data: { user } } = await client.auth.getUser();

    if (!user) return null;

    currentUser = user;

    displayName =
        user.user_metadata?.display_name || "Anonymous";

    return user;
}

// -------------------------------
// LOGOUT (optional helper)
// -------------------------------
async function logout() {
    await client.auth.signOut();
    window.location.href = "login.html";
}

// -------------------------------
// AUTH GUARD (STOP UNAUTH ACCESS)
// -------------------------------
async function requireAuth() {

    const session = await getSessionSafe();

    if (!session) {
        window.location.href = "login.html";
        return false;
    }

    await loadUser();

    if (!currentUser || !displayName) {
        window.location.href = "login.html";
        return false;
    }

    return true;
}

// -------------------------------
// LISTENER (PREVENT FAKE ACCESS)
// -------------------------------
function setupAuthListener() {

    client.auth.onAuthStateChange((event, session) => {

        if (!session) {
            window.location.href = "login.html";
        }
    });
}
