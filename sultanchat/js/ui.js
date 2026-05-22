// ==================================================
// ui.js — INTERFACE & INTERACTIVE THEMES
// ==================================================

function setupUI() {
    log("UI", "setupUI ENTERED");

    // 1. Instantly pull and apply saved theme color from cache
    const savedColor = localStorage.getItem("myColor");
    if (savedColor) {
        document.documentElement.style.setProperty("--my-msg-color", savedColor);
        log("UI", "Recovered theme color from local storage:", savedColor);
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

    // Theme Customizer Selectors
    colors.forEach(c => {
        c.addEventListener("click", async () => {
            const color = c.dataset.color;
            if (!color) return;

            // Apply locally instantly
            localStorage.setItem("myColor", color);
            document.documentElement.style.setProperty("--my-msg-color", color);
            log("UI", "Local style color altered to:", color);

            // Sync choice to Supabase backend safely with error auditing
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

    // Tactical Button Click Animations
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
