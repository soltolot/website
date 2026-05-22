// ==================================================
// bootstrap.js — THE GLOBAL UTILITY FOUNDATION
// ==================================================

// --------------------------------------------------
// EARLY ERROR QUEUE
// --------------------------------------------------
window.__earlyErrorQueue = [];

// --------------------------------------------------
// CENTRALIZED DEV MODE SYSTEM (THE ONLY ONE)
// --------------------------------------------------
(function () {
    const saved = localStorage.getItem("DEV_MODE");
    window.DEV_MODE = saved === "true";

    window.setDevMode = function (enabled) {
        const value = !!enabled;
        window.DEV_MODE = value;
        localStorage.setItem("DEV_MODE", value ? "true" : "false");

        // Uses the log function declared right below
        window.log("DEV_MODE", value ? "ON 🧠" : "OFF 👤");
    };
})();

// --------------------------------------------------
// CENTRALIZED LOGGER SYSTEM (THE ONLY ONE)
// --------------------------------------------------
function log(...args) {
    console.log(...args); // Always output to developer tools console

    // Write logs visually into the chat UI area if it has rendered
    const box = document.getElementById("chat");
    if (!box) return; 

    const line = document.createElement("div");
    line.style.color = "#888"; 
    line.style.fontSize = "0.9em";
    line.style.fontStyle = "italic";
    line.textContent = "[LOG] " + args
        .map(a => (typeof a === "string" ? a : JSON.stringify(a)))
        .join(" ");
    box.appendChild(line);
}

// --------------------------------------------------
// GLOBAL RUNTIME ERROR HOOKS
// --------------------------------------------------
window.addEventListener("error", (event) => {
    window.__earlyErrorQueue.push({
        error: event.error || event.message,
        context: "JS_RUNTIME_ERROR"
    });
});

window.addEventListener("unhandledrejection", (event) => {
    window.__earlyErrorQueue.push({
        error: event.reason,
        context: "PROMISE_REJECTION"
    });
});

// Called externally by an error.js file if present
window.flushEarlyErrors = function () {
    if (!window.__earlyErrorQueue?.length) return;
    if (typeof window.showError !== "function") return;

    window.__earlyErrorQueue.forEach(item => {
        window.showError(item.error, item.context);
    });

    window.__earlyErrorQueue = [];
};
