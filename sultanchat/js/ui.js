// ==================================================
// ui.js — INTERFACE, THEMES, COLORS, DEV MODE
// ==================================================

function setupUI() {
    log("UI", "setupUI ENTERED");

    // ===============================
    // COLOR RESTORE (LOCAL STORAGE)
    // ===============================
    const savedColor = localStorage.getItem("myColor");

    if (savedColor) {
        document.documentElement.style.setProperty("--my-msg-color", savedColor);
        log("UI", "Recovered theme color:", savedColor);
    }

    // ===============================
    // DEV MODE INIT
    // ===============================
    const devToggle = document.getElementById("dev-toggle");

    if (devToggle) {
        devToggle.checked = !!window.DEV_MODE;
        log("UI", "Dev mode initialized:", window.DEV_MODE);
    }

    // ===============================
    // DARK MODE INIT
    // ===============================
    const darkToggle = document.getElementById("dark-mode-toggle");

    const savedTheme = localStorage.getItem("theme");
    const isDark = savedTheme === "dark";

    if (isDark) {
        document.body.classList.add("dark");
    }

    if (darkToggle) {
        darkToggle.checked = isDark;
    }

    // ===============================
    // SETTINGS ELEMENTS
    // ===============================
    const settingsBtn = document.getElementById("settings-btn");
    const overlay = document.getElementById("settings-overlay");
    const closeBtn = document.getElementById("close-settings");
    const colors = document.querySelectorAll(".color-option");

    // ===============================
    // OPEN / CLOSE SETTINGS
    // ===============================
    settingsBtn?.addEventListener("click", () => {
        overlay.style.display = "flex";
    });

    closeBtn?.addEventListener("click", () => {
        overlay.style.display = "none";
    });

    overlay?.addEventListener("click", (e) => {
        if (e.target === overlay) {
            overlay.style.display = "none";
        }
    });

    // ===============================
    // DEV MODE TOGGLE
    // ===============================
    devToggle?.addEventListener("change", (e) => {
        window.setDevMode(e.target.checked);
    });

    // ===============================
    // DARK MODE TOGGLE
    // ===============================
    darkToggle?.addEventListener("change", (e) => {
        const dark = e.target.checked;

        document.body.classList.toggle("dark", dark);
        localStorage.setItem("theme", dark ? "dark" : "light");

        log("UI", "Dark mode:", dark ? "enabled" : "disabled");
    });

    // ===============================
    // COLOR PICKER
    // ===============================
    colors.forEach(c => {
        c.addEventListener("click", async () => {
            const color = c.dataset.color;
            if (!color) return;

            // local update
            localStorage.setItem("myColor", color);
            document.documentElement.style.setProperty("--my-msg-color", color);

            log("UI", "Color changed:", color);

            // cloud sync
            if (window.displayName && typeof client !== "undefined") {
                log("UI", "Syncing color to Supabase...");

                const { error } = await client
                    .from("profiles")
                    .update({ color })
                    .eq("username", window.displayName);

                if (error) {
                    log("ERROR", "Supabase sync failed:", error.message);
                } else {
                    log("UI", "Color synced successfully.");
                }
            }
        });
    });

    // ===============================
    // BUTTON PRESS ANIMATION
    // ===============================
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

    // ===============================
    // REALTIME COLOR SYNC (SUPABASE)
    // ===============================
    setupColorSubscription();

    log("UI", "setupUI COMPLETED");
}


// ==================================================
// REALTIME COLOR SYNC (Supabase)
// ==================================================

function setupColorSubscription() {
    if (!window.displayName || typeof client === "undefined") return;

    const channel = client
        .channel("profile-color-live")
        .on(
            "postgres_changes",
            {
                event: "UPDATE",
                schema: "public",
                table: "profiles",
                filter: `username=eq.${window.displayName}`,
            },
            (payload) => {
                const newColor = payload.new.color;
                if (!newColor) return;

                const current = localStorage.getItem("myColor");
                if (current === newColor) return;

                localStorage.setItem("myColor", newColor);
                document.documentElement.style.setProperty("--my-msg-color", newColor);

                log("UI", "Live color update:", newColor);
            }
        )
        .subscribe();

    log("UI", "Subscribed to color updates");
}
