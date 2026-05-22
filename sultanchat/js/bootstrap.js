// ===============================
// BOOTLOADER (EARLY ERRORS + DEV MODE + LOG)
// MUST LOAD FIRST
// ===============================

// --------------------------------
// EARLY ERROR QUEUE
// --------------------------------
window.__earlyErrorQueue = [];

// --------------------------------
// DEV MODE PERSISTENCE
// --------------------------------
(function () {

    const saved = localStorage.getItem("DEV_MODE");
    window.DEV_MODE = saved === "true";

    window.setDevMode = function (enabled) {
        const value = !!enabled;
        window.DEV_MODE = value;
        localStorage.setItem("DEV_MODE", value ? "true" : "false");

        window.log && window.log("DEV_MODE", value ? "ON 🧠" : "OFF 👤");
    };

})();

// --------------------------------
// GLOBAL LOGGER
function log(...args) {
    console.log(...args); // always log to console

    // write logs into the chat area
    const box = document.getElementById("chat");
    if (!box) return; // prevents crashes if chat isn't loaded yet

    const line = document.createElement("div");
    line.style.color = "#888"; // makes logs visually different
    line.textContent = args
        .map(a => (typeof a === "string" ? a : JSON.stringify(a)))
        .join(" ");
    box.appendChild(line);
}

// --------------------------------
// GLOBAL ERROR HOOKS (EARLY)
// --------------------------------
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

// --------------------------------
// FLUSH EARLY ERRORS (CALLED BY error.js)
// --------------------------------
window.flushEarlyErrors = function () {

    if (!window.__earlyErrorQueue?.length) return;

    if (typeof window.showError !== "function") return;

    window.__earlyErrorQueue.forEach(item => {
        window.showError(item.error, item.context);
    });

    window.__earlyErrorQueue = [];
};
