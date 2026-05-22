// ==================================================
// auth.js — AUTHENTICATION UTILITIES
// ==================================================

window.currentUser = null;
window.displayName = null;

// --------------------------------------------------
// GET SESSION SAFELY (Resolves Supabase local storage delay)
// --------------------------------------------------
async function getSessionSafe() {
    const { data: { session } } = await client.auth.getSession();
    if (session) return session;

    // 300ms retry block fallback
    await new Promise(r => setTimeout(r, 300));
    const retry = await client.auth.getSession();
    return retry.data.session || null;
}

// --------------------------------------------------
// LOAD USER & ASSIGN GLOBAL INITIALS
// --------------------------------------------------
async function loadUser() {
    const { data: { user }, error } = await client.auth.getUser();
    if (error || !user) return null;

    window.currentUser = user;
    
    // Prioritizes metadata keys, falls back safely to email prefix
    window.displayName = user.user_metadata?.username || 
                         user.user_metadata?.display_name || 
                         user.email?.split('@')[0] || 
                         "Anonymous";

    return user;
}

// --------------------------------------------------
// AUTH GUARD ROUTINE (CALLED SEVENERED BY APP.JS)
// --------------------------------------------------
async function requireAuth() {
    log("AUTH", "Checking session stability...");
    const session = await getSessionSafe();

    if (!session) {
        log("AUTH", "No valid session found in requireAuth.");
        return false;
    }

    log("AUTH", "Session found. Loading user metadata profiles...");
    const user = await loadUser();

    if (!user) {
        log("AUTH", "Session exists, but profile fetching failed.");
        return false;
    }

    return true;
}

// --------------------------------------------------
// LOGOUT COMMAND
// --------------------------------------------------
async function logout() {
    log("AUTH", "Logging user out...");
    await client.auth.signOut();
    window.location.href = "login.html";
}
