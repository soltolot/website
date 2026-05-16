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

    let output = "🚨 SYSTEM ERROR\n\n";
    output += "Context: " + context + "\n\n";

    // Handle different error types
    if (error instanceof Error) {
        output += "Message: " + error.message + "\n";
        output += "Name: " + error.name + "\n\n";
        output += error.stack || "";
    }
    else if (typeof error === "object") {
        output += JSON.stringify(error, null, 2);
    }
    else {
        output += String(error);
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
