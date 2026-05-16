// ===============================
// CHAT CORE SYSTEM (FIXED)
// ===============================

// ---------- STATE ----------
let myColor = localStorage.getItem("myColor") || "#FF6200";
document.documentElement.style.setProperty("--my-msg-color", myColor);

// ===============================
// WAIT FOR USER (FIX FOR FREEZE)
// ===============================
async function waitForUser() {
    return new Promise((resolve) => {
        const check = setInterval(() => {
            if (window.displayName) {
                clearInterval(check);
                resolve(window.displayName);
            }
        }, 200);
    });
}

// ===============================
// LOAD MESSAGES
// ===============================
async function loadMessages() {

    const chat = document.getElementById("chat");
    const status = document.getElementById("status");

    if (!chat || !status) return;

    // loading UI
    status.textContent = "⏳ Loading messages...";
    chat.innerHTML = "⏳ Loading messages...";

    try {

        const [msgRes, profRes] = await Promise.all([
            client
                .from("message")
                .select("*")
                .order("id", { ascending: true }),

            client
                .from("profiles")
                .select("*")
        ]);

        const messages = msgRes.data || [];
        const profiles = profRes.data || [];

        if (msgRes.error) {
            showError(msgRes.error, "LOAD_MESSAGES");
            status.textContent = "● ERROR";
            return;
        }

        if (profRes.error) {
            showError(profRes.error, "LOAD_PROFILES");
            status.textContent = "● ERROR";
            return;
        }

        // map colors
        const colors = {};
        profiles.forEach(p => {
            colors[p.username] = p.color;
        });

        // status
        status.textContent = `● ONLINE • ${messages.length}`;

        // render
        chat.innerHTML = "";

        for (const m of messages) {

            const div = document.createElement("div");
            div.className = "msg";

            if (m.username === window.displayName) {
                div.classList.add("my-msg");
            } else {
                div.style.background = colors[m.username] || "#FF6200";
            }

            div.textContent = `${m.username}: ${m.message}`;
            chat.appendChild(div);
        }

        chat.scrollTop = chat.scrollHeight;

    } catch (err) {
        status.textContent = "● ERROR";
        showError(err, "FATAL_LOAD_MESSAGES");
    }
}

// ===============================
// SEND MESSAGE
// ===============================
window.sendMessage = async function () {

    const input = document.getElementById("message-input");
    const text = input?.value?.trim();

    if (!text || !window.displayName) return;

    const { error } = await client
        .from("message")
        .insert({
            username: window.displayName,
            message: text
        });

    if (error) {
        showError(error, "SEND_MESSAGE");
        return;
    }

    input.value = "";
};

// ===============================
// SEND SUGGESTION
// ===============================
async function sendSuggest() {

    const input = document.getElementById("suggest-input");
    const text = input?.value?.trim();

    if (!text || !window.displayName) return;

    const { error } = await client
        .from("message")
        .insert({
            username: window.displayName,
            message: `[SUGGESTION] ${text}`
        });

    if (error) {
        showError(error, "SEND_SUGGESTION");
        return;
    }

    input.value = "";
}

// ===============================
// REALTIME
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
// UI SETUP
// ===============================
function setupChatUI() {

    document.getElementById("send-btn")
        ?.addEventListener("click", sendMessage);

    document.getElementById("suggest-btn")
        ?.addEventListener("click", sendSuggest);

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
// INIT
// ===============================
async function initChat() {

    // wait for auth safely
    await waitForUser();

    await loadMessages();
    setupRealtime();
    setupChatUI();
}

// auto start
initChat();
