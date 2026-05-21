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
window.log = function (title, data = "") {

    // Always log to console
    console.log("🪵", title, data);

    // Only mirror logs into chat when DEV_MODE is ON
    if (!window.DEV_MODE) return;

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
