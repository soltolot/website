// ==================================================
// ui.js — INTERFACE, THEMES, & DEVELOPER TOGGLE
// ==================================================

function setupUI() {
    log("UI", "setupUI ENTERED");

    // 1. Recover saved theme color from cache instantly
    const savedColor = localStorage.getItem("myColor");
    if (savedColor) {
        document.documentElement.style.setProperty("--my-msg-color", savedColor);
        log("UI", "Recovered theme color from local storage:", savedColor);
    }

    // 2. ⭐ RECOVER AND VISUALLY INITIALIZE DEVELOPER MODE STATE
    const devToggle = document.getElementById("dev-toggle");
    if (devToggle) {
        // Sync the checkbox UI state with the global Boolean from bootstrap.js
        devToggle.checked = !!window.DEV_MODE;
        log("UI", "Initialized developer mode toggle state to:", window.DEV_MODE);
    }

    const settingsBtn = document.getElementById("settings-btn");
    const overlay = document.getElementById("settings-overlay");
    const closeBtn = document.getElementById("close-settings");
    const colors = document.querySelectorAll(".color-option");

    // Open/Close Settings Panels
    settingsBtn?.addEventListener("click", () => {
        if (overlay) overlay.style.display = "flex";
    });

    closeBtn?.addEventListener("click", () => {
        if (overlay) overlay.style.display = "none";
    });

    overlay?.addEventListener("click", (e) => {
        if (e.target === overlay) overlay.style.display = "none";
    });

    // ⭐ LISTEN FOR DEVELOPER MODE CHANGES
    devToggle?.addEventListener("change", (e) => {
        // Pass the checkbox's true/false state straight to the master utility
        window.setDevMode(e.target.checked);
    });

    // Theme Customizer Selectors
    colors.forEach(c => {
        c.addEventListener("click", async () => {
            const color = c.dataset.color;
            if (!color) return;

            localStorage.setItem("myColor", color);
            document.documentElement.style.setProperty("--my-msg-color", color);
            log("UI", "Local style color altered to:", color);

            if (window.displayName && typeof client !== "undefined") {
                log("UI", "Syncing theme color choices to the cloud...");
                const { error } = await client
                    .from("profiles")
                    .update({ color })
                    .eq("username", window.displayName);

                if (error) {
                    log("ERROR", "Supabase profile sync failed: " + error.message);
                } else {
                    log("UI", "Theme color synced cleanly to Supabase.");
                }
            }
        });
    });

    // Button Click Animations
    document.querySelectorAll("button").forEach(btn => {
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

    log("UI", "setupUI COMPLETED");
}
