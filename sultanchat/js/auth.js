// ==================================================
// auth.js — AUTH SYSTEM (SESSION + USER)
// ==================================================

window.currentUser = null;
window.displayName = null;

// --------------------------------------------------
// GET SESSION SAFELY (With fallback retry for hydration)
// --------------------------------------------------
async function getSessionSafe() {
    const { data: { session } } = await client.auth.getSession();
    if (session) return session;

    // Small retry delay (fixes Supabase local storage hydration delay bug)
    await new Promise(r => setTimeout(r, 300));
    const retry = await client.auth.getSession();
    return retry.data.session || null;
}

// --------------------------------------------------
// LOAD USER
// --------------------------------------------------
async function loadUser() {
    const { data: { user }, error } = await client.auth.getUser();
    if (error || !user) return null;

    window.currentUser = user;
    
    // Checks for 'username', then 'display_name', then falls back to email prefix
    window.displayName = user.user_metadata?.username || 
                         user.user_metadata?.display_name || 
                         user.email?.split('@')[0] || 
                         "Anonymous";

    return user;
}

// --------------------------------------------------
// AUTH GUARD (USED BY APP.JS)
// --------------------------------------------------
async function requireAuth() {
    log("AUTH", "Checking session stability...");
    const session = await getSessionSafe();

    if (!session) {
        log("AUTH", "No valid session found in requireAuth.");
        return false;
    }

    log("AUTH", "Session found. Loading profile data...");
    const user = await loadUser();

    if (!user) {
        log("AUTH", "Session exists, but user profile failed to download.");
        return false;
    }

    return true;
}

// --------------------------------------------------
// LOGOUT UTILITY
// --------------------------------------------------
async function logout() {
    log("AUTH", "Logging out...");
    await client.auth.signOut();
    window.location.href = "login.html";
}
