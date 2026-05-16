// =====================================
// SULTANCHAT GLOBAL ERROR SYSTEM
// Catches: JS errors, promises, Supabase
// Shows everything inside chat UI
// =====================================

// -------------------------------
// 1. CORE DISPLAY FUNCTION
// -------------------------------
function showError(error, context = "UNKNOWN") {

    const chat = document.getElementById("chat");
    if (!chat) return;

    const div = document.createElement("div");
    div.className = "msg system-msg";

    let output = "🚨 " + context + "\n\n";

    if (error instanceof Error) {
        output += error.message + "\n\n" + (error.stack || "");
    } 
    else {
        output += JSON.stringify(error, null, 2);
    }

    div.textContent = output;
    div.style.whiteSpace = "pre-wrap";

    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
}

// -------------------------------
// 2. SUPABASE ERROR WRAPPER
// -------------------------------
function handleSupabase({ data, error }, context = "SUPABASE") {

    if (error) {
        showError(error, context);
        return null;
    }

    return data;
}

// -------------------------------
// 3. GLOBAL JS ERROR CATCHER
// -------------------------------
window.onerror = function (message, source, line, col, error) {

    showError(
        {
            message,
            source,
            line,
            col,
            error
        },
        "JS_RUNTIME_ERROR"
    );

    return false;
};

// -------------------------------
// 4. PROMISE REJECTION CATCHER
// -------------------------------
window.addEventListener("unhandledrejection", function (event) {

    showError(
        event.reason,
        "PROMISE_REJECTION"
    );
});

// -------------------------------
// 5. OPTIONAL: SAFE EXECUTOR
// -------------------------------
async function safeAsync(fn, context = "ASYNC_FUNCTION") {

    try {
        return await fn();
    } catch (err) {
        showError(err, context);
        return null;
    }
}


// ===============================
// FLUSH EARLY ERRORS
// ===============================
window.addEventListener("DOMContentLoaded", () => {

    if (window.__earlyErrorQueue?.length) {

        window.__earlyErrorQueue.forEach(err => {
            showError(err, "EARLY_ERROR");
        });

        window.__earlyErrorQueue = [];
    }

});

