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
// --------------------------------
function log(...args) {
    console.log(...args); // still logs to browser console

    const box = document.getElementById("chat"); // THIS is your chat area
    if (!box) return; // prevents crashes

    const line = document.createElement("div");
    line.textContent = args
        .map(a => (typeof a === "string" ? a : JSON.stringify(a)))
        .join(" ");
    box.appendChild(line);
}


    div.textContent = output;
    div.style.whiteSpace = "pre-wrap";

    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
};

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
