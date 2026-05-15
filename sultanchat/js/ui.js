// ===============================
// UI SYSTEM (SETTINGS + COLORS)
// ===============================

// ---------- ELEMENTS ----------
const settingsBtn = document.getElementById("settings-btn");
const settingsOverlay = document.getElementById("settings-overlay");
const closeSettingsBtn = document.getElementById("close-settings");
const colorOptions = document.querySelectorAll(".color-option");

// ---------- OPEN SETTINGS ----------
function openSettings() {
    if (!settingsOverlay) return;
    settingsOverlay.style.display = "flex";
}

// ---------- CLOSE SETTINGS ----------
function closeSettings() {
    if (!settingsOverlay) return;
    settingsOverlay.style.display = "none";
}

// ---------- APPLY COLOR ----------
function applyColor(color) {

    // save locally
    localStorage.setItem("myColor", color);

    // apply instantly
    document.documentElement.style.setProperty("--my-msg-color", color);

    // update global state if chat.js exists
    if (typeof myColor !== "undefined") {
        myColor = color;
    }

    // optional: sync to DB if user exists
    if (window.displayName && typeof client !== "undefined") {
        client
            .from("profiles")
            .update({ color })
            .eq("username", window.displayName)
            .then(() => {
                // silently updated
            });
    }
}

// ---------- COLOR PICKER ----------
function setupColorPicker() {

    colorOptions.forEach(el => {

        el.addEventListener("click", () => {
            const color = el.getAttribute("data-color");
            applyColor(color);
        });

    });
}

// ---------- BUTTON INTERACTIONS ----------
function setupSettingsUI() {

    settingsBtn?.addEventListener("click", openSettings);
    closeSettingsBtn?.addEventListener("click", closeSettings);

    // click outside window closes
    settingsOverlay?.addEventListener("click", (e) => {
        if (e.target === settingsOverlay) {
            closeSettings();
        }
    });
}

// ---------- HOVER / ACTIVE FIXES ----------
function setupButtonFX() {

    const sendBtn = document.getElementById("send-btn");
    const suggestBtn = document.getElementById("suggest-btn");

    [sendBtn, suggestBtn].forEach(btn => {
        if (!btn) return;

        btn.addEventListener("mousedown", () => {
            btn.style.transform = "scale(0.96)";
        });

        btn.addEventListener("mouseup", () => {
            btn.style.transform = "scale(1)";
        });

        btn.addEventListener("mouseleave", () => {
            btn.style.transform = "scale(1)";
        });
    });
}

// ---------- INIT UI ----------
function setupUI() {

    setupSettingsUI();
    setupColorPicker();
    setupButtonFX();
}
