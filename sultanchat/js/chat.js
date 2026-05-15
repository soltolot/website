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

    if (!chat || !status || !window.displayName) return;

    try {

        const { data: messages, error: msgErr } =
            await client
                .from("message")
                .select("*")
                .order("id", { ascending: true });

            if (error) {
                chat.innerHTML =
                    "SUPABASE ERROR: " + error.message;

            return;
        }

        const { data: profiles, error: profErr } =
            await client.from("profiles").select("*");

        if (profErr) throw profErr;

        // map colors
        const colors = {};
        profiles.forEach(p => {
            colors[p.username] = p.color;
        });

        status.textContent = `● ONLINE • ${messages.length}`;

        // render
        chat.innerHTML = "";

        for (const m of messages) {

            const div = document.createElement("div");
            div.className = "msg";

            if (m.username === window.displayName) {
                div.classList.add("my-msg");
            } else {
                div.style.background =
                    colors[m.username] || "#FF6200";
            }

            div.textContent = `${m.username}: ${m.message}`;
            chat.appendChild(div);
        }

        chat.scrollTop = chat.scrollHeight;

    } catch (err) {
        status.textContent = "● ERROR";
        console.error(err);
    }
}

// ===============================
// SEND MESSAGE
// ===============================
async function sendMessage() {

    const input = document.getElementById("message-input");
    const text = input?.value.trim();

    if (!text || !window.displayName) return;

    const { error } = await client
        .from("messages")
        .insert({
            username: window.displayName,
            message: text
        });

    if (error) {
        console.error(error);
        return;
    }

    input.value = "";
}

// ===============================
// SEND SUGGESTION (RESTORED)
// ===============================
async function sendSuggest() {

    const input = document.getElementById("suggest-input");
    const text = input?.value.trim();

    if (!text || !window.displayName) return;

    const { error } = await client
        .from("messages")
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

    client.channel("messages-live")
    .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "messages"
    }, () => {
        loadMessages();
    })
    .subscribe();
}

// ===============================
// BUTTON WIRING (IMPORTANT)
// ===============================
function setupChatUI() {

    const sendBtn = document.getElementById("send-btn");
    const suggestBtn = document.getElementById("suggest-btn");

    sendBtn?.addEventListener("click", sendMessage);
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
