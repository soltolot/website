// =====================================
// SULTANCHAT ERROR SYSTEM (MAIN)
// Handles display + Supabase + flush
// =====================================

// -------------------------------
// CORE ERROR DISPLAY
// -------------------------------
function showError(error, context = "UNKNOWN") {

    const chat = document.getElementById("chat");

    // if UI not ready yet → queue it
    if (!chat) {
        window.__earlyErrorQueue = window.__earlyErrorQueue || [];
        window.__earlyErrorQueue.push({ error, context });
        return;
    }

    const div = document.createElement("div");
    div.className = "msg system-msg";

    let output = `🚨 ${context}\n\n`;

    if (error instanceof Error) {
        output += `${error.message}\n\n${error.stack || ""}`;
    } else if (typeof error === "object") {
        output += JSON.stringify(error, null, 2);
    } else {
        output += String(error);
    }

    div.textContent = output;
    div.style.whiteSpace = "pre-wrap";

    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
}

// -------------------------------
// SUPABASE WRAPPER
// -------------------------------
function handleSupabase(result, context = "SUPABASE") {

    const { data, error } = result;

    if (error) {
        showError(error, context);
        return null;
    }

    return data;
}

// -------------------------------
// FLUSH EARLY ERRORS
// -------------------------------
window.addEventListener("DOMContentLoaded", () => {

    if (window.__earlyErrorQueue?.length) {

        window.__earlyErrorQueue.forEach(item => {
            showError(item.error || item, "EARLY_ERROR");
        });

        window.__earlyErrorQueue = [];
    }
});

// -------------------------------
// GLOBAL ERROR HOOKS (ONLY HERE NOW)
// -------------------------------
window.addEventListener("error", (event) => {
    showError(event.error || event.message, "JS_RUNTIME_ERROR");
});

window.addEventListener("unhandledrejection", (event) => {
    showError(event.reason, "PROMISE_REJECTION");
});


function log(title, data = "") {

    if (!window.DEV_MODE) return; // 🚨 IMPORTANT FILTER

    const chat = document.getElementById("chat");
    if (!chat) return;

    const div = document.createElement("div");
    div.className = "msg";

    div.style.background = "#777";
    div.style.color = "white";

    let output = `🪵 LOG: ${title}\n`;

    if (typeof data === "object") {
        output += JSON.stringify(data, null, 2);
    } else {
        output += String(data);
    }

    div.textContent = output;
    div.style.whiteSpace = "pre-wrap";

    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
}
