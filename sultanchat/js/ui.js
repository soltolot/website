// ===============================
// UI SYSTEM (INTERACTIONS ONLY)
// ===============================

function setupUI() {

    const settingsBtn = document.getElementById("settings-btn");
    const overlay = document.getElementById("settings-overlay");
    const closeBtn = document.getElementById("close-settings");
    const colors = document.querySelectorAll(".color-option");

    // open/close
    settingsBtn?.addEventListener("click", () => {
        overlay.style.display = "flex";
    });

    closeBtn?.addEventListener("click", () => {
        overlay.style.display = "none";
    });

    overlay?.addEventListener("click", (e) => {
        if (e.target === overlay) overlay.style.display = "none";
    });

    // color picker
    colors.forEach(c => {
        c.addEventListener("click", () => {
            const color = c.dataset.color;

            localStorage.setItem("myColor", color);
            document.documentElement.style.setProperty("--my-msg-color", color);

            if (window.displayName && typeof client !== "undefined") {
                client
                    .from("profiles")
                    .update({ color })
                    .eq("username", window.displayName);
            }
        });
    });

    // button feel
    document.querySelectorAll("button").forEach(btn => {
        btn.addEventListener("mousedown", () => {
            btn.style.transform = "scale(0.96)";
        });

        btn.addEventListener("mouseup", () => {
            btn.style.transform = "scale(1)";
        });
    });
}
