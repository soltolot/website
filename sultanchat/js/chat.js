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

    chat.innerHTML = "⏳ contacting Supabase...";

    const res = await client
        .from("message")
        .select("*");

    console.log(res); // ignore console — just temporary

    const { data, error } = res;

    if (error) {
        chat.innerHTML =
            "❌ ERROR:\n" +
            JSON.stringify(error, null, 2);
        return;
    }

    if (!data || data.length === 0) {
        chat.innerHTML = "⚠️ No messages found (table is empty)";
        return;
    }

    chat.innerHTML =
        "✅ Loaded " + data.length + " messages";
}// ===============================
// SEND MESSAGE
// ===============================
async function sendMessage() {

    const input = document.getElementById("message-input");
    const text = input?.value.trim();

    if (!text || !window.displayName) return;

    const { error } = await client
        .from("message")
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
