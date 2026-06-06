this is my ui.js
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

    // 2. RECOVER DEVELOPER MODE STATE
    const devToggle = document.getElementById("dev-toggle");
    if (devToggle) {
        devToggle.checked = !!window.DEV_MODE;
        log("UI", "Initialized developer mode toggle state to:", window.DEV_MODE);
    }

    const settingsBtn = document.getElementById("settings-btn");
    const overlay = document.getElementById("settings-overlay");
    const closeBtn = document.getElementById("close-settings");
    const colors = document.querySelectorAll(".color-option");

    // Open/Close Settings Panel
    settingsBtn?.addEventListener("click", () => {
        if (overlay) overlay.style.display = "flex";
    });

    closeBtn?.addEventListener("click", () => {
        if (overlay) overlay.style.display = "none";
    });

    overlay?.addEventListener("click", (e) => {
        if (e.target === overlay) overlay.style.display = "none";
    });

    // Developer mode toggle
    devToggle?.addEventListener("change", (e) => {
        window.setDevMode(e.target.checked);
    });

    // Theme color selection
    colors.forEach(c => {
        c.addEventListener("click", async () => {
            const color = c.dataset.color;
            if (!color) return;

            // local update
            localStorage.setItem("myColor", color);
            document.documentElement.style.setProperty("--my-msg-color", color);

            log("UI", "Local style color altered to:", color);

            // cloud sync
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

    // Button click animations
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

    // Start realtime sync
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

                log("UI", "Live color update received:", newColor);
            }
        )
        .subscribe();

    log("UI", "Subscribed to live color updates");
}
