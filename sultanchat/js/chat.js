// ===============================
// CHAT CORE SYSTEM
// ===============================

// ---------- STATE ----------
let myColor = localStorage.getItem("myColor") || "#FF6200";

// ---------- APPLY COLOR ----------
document.documentElement.style.setProperty("--my-msg-color", myColor);

// ===============================
// LOAD MESSAGES (NO FLICKER VERSION)
// ===============================
async function loadMessages() {

    const chat = document.getElementById("chat");
    const status = document.getElementById("status");

    if (!chat || !status) return;

    // safe fallback
    if (!window.displayName) {
        window.displayName = "Anonymous";
    }

    // SHOW LOADING STATE (IMPORTANT)
    status.textContent = "⏳ Loading messages...";
    chat.innerHTML = "⏳ Loading messages...";

    try {

        // -------------------------
        // LOAD MESSAGES
        // -------------------------
        const { data: messages, error: msgErr } =
            await client
                .from("message")
                .select("*")
                .order("id", { ascending: true });

        if (msgErr) {
            showError(msgErr, "LOAD_MESSAGES");
            status.textContent = "● ERROR";
            return;
        }

        // -------------------------
        // LOAD PROFILES
        // -------------------------
        const { data: profiles, error: profErr } =
            await client
                .from("profiles")
                .select("*");

        if (profErr) {
            showError(profErr, "LOAD_PROFILES");
            status.textContent = "● ERROR";
            return;
        }

        // -------------------------
        // MAP COLORS
        // -------------------------
        const colors = {};
        profiles?.forEach(p => {
            colors[p.username] = p.color;
        });

        // -------------------------
        // STATUS UPDATE
        // -------------------------
        status.textContent = `● ONLINE • ${messages?.length || 0}`;

        // -------------------------
        // RENDER CHAT
        // -------------------------
        chat.innerHTML = "";

        for (const m of messages || []) {

            const div = document.createElement("div");
            div.className = "msg";

            if (m.username === window.displayName) {
                div.classList.add("my-msg");
            } else {
                div.style.background =
                    colors[m.username] || "#FF6200";
            }

            div.textContent =
                `${m.username}: ${m.message}`;

            chat.appendChild(div);
        }

        chat.scrollTop = chat.scrollHeight;

    } catch (err) {

        status.textContent = "● ERROR";

        showError(err, "FATAL_LOAD_MESSAGES");
    }
}
// ===============================
// SEND SUGGESTION (RESTORED)
// ===============================
async function sendSuggest() {

    const input = document.getElementById("suggest-input");
    const text = input?.value.trim();

    if (!text || !window.displayName) return;

    const { error } = await client
        .from("message")
        .insert({
            username: window.displayName,
            message: `[SUGGESTION] ${text}`
        });

    if (error) {
        console.error(error);
        return;
    }

    input.value = "";
}

// ===============================
// REALTIME UPDATES
// ===============================
function setupRealtime() {

    client.channel("message-live")
    .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "message"
    }, () => {
        loadMessages();
    })
    .subscribe();
}


window.sendMessage = async function () {

    const input = document.getElementById("message-input");
    const text = input?.value?.trim();

    if (!text) return;

    const { error } = await client
        .from("message")
        .insert({
            username: window.displayName || "Anonymous",
            message: text
        });

    if (error) {
        showError(error, "SEND_MESSAGE");
        return;
    }

    input.value = "";
};


// ===============================
// BUTTON WIRING (IMPORTANT)
// ===============================
function setupChatUI() {

    const sendBtn = document.getElementById("send-btn");
    const suggestBtn = document.getElementById("suggest-btn");

    sendBtn?.addEventListener("click", () => sendMessage());
    suggestBtn?.addEventListener("click", sendSuggest);

    // Enter key support
    document.getElementById("message-input")
        ?.addEventListener("keydown", (e) => {
            if (e.key === "Enter") sendMessage();
        });

    document.getElementById("suggest-input")
        ?.addEventListener("keydown", (e) => {
            if (e.key === "Enter") sendSuggest();
        });
}

// ===============================
// INIT CHAT MODULE
// ===============================
async function initChat() {

    // wait for auth system
    if (!window.displayName) {
        console.warn("Chat waiting for auth...");
    }

    await loadMessages();
    setupRealtime();
    setupChatUI();
}
