// =====================================
// ERROR SYSTEM (UI + SUPABASE)
// =====================================

// -------------------------------
// CORE ERROR DISPLAY
// -------------------------------
function showError(error, context = "UNKNOWN") {

    const chat = document.getElementById("chat");

    // If UI not ready → queue it
    if (!chat) {
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

    window.log && window.log(`ERROR:${context}`, error);
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
// FLUSH EARLY ERRORS NOW THAT showError EXISTS
// -------------------------------
window.addEventListener("DOMContentLoaded", () => {
    window.flushEarlyErrors && window.flushEarlyErrors();
});
