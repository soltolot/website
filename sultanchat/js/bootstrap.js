// ===============================
// BOOTSTRAP / DEV + LOG SYSTEM
// MUST LOAD VERY EARLY (AFTER bootloader.js)
// ===============================

// -------------------------------
// DEV MODE PERSISTENCE
// -------------------------------
(function () {

    // Read DEV_MODE from localStorage (persist across refresh)
    const saved = localStorage.getItem("DEV_MODE");

    // If nothing saved yet → default to false
    window.DEV_MODE = saved === "true";

    // Helper to toggle + persist DEV_MODE
    window.setDevMode = function (enabled) {
        const value = !!enabled;
        window.DEV_MODE = value;
        localStorage.setItem("DEV_MODE", value ? "true" : "false");

        if (typeof window.log === "function") {
            window.log("DEV_MODE", value ? "ON 🧠" : "OFF 👤");
        }
    };

})();

// -------------------------------
// GLOBAL LOGGER
// -------------------------------
window.log = function (title, data = "") {

    // Always log to console (even if DEV_MODE is off)
    try {
        if (typeof data === "undefined" || data === "") {
            console.log("🪵", title);
        } else {
            console.log("🪵", title, data);
        }
    } catch (e) {
        // ignore console errors
    }

    // Only mirror logs into chat UI when DEV_MODE is ON
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
    } else if (data !== "") {
        output += String(data);
    }

    div.textContent = output;
    div.style.whiteSpace = "pre-wrap";

    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
};
