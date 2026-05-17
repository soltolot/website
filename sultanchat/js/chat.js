// ===============================
// CHAT CORE SYSTEM
// ===============================

let myColor = localStorage.getItem("myColor") || "#FF6200";
let userColors = {};

document.documentElement.style.setProperty("--my-msg-color", myColor);

// ===============================
// LOAD PROFILES
// ===============================
async function loadProfiles() {

    const { data, error } = await client
        .from("profiles")
        .select("*");

    if (error) {
        showError(error, "LOAD_PROFILES");
        return;
    }

    userColors = {};

    data?.forEach(p => {
        userColors[p.username] = p.color;
    });
}

// ===============================
// LOAD MESSAGES (FIXED)
// ===============================
async function loadMessages() {

    const chat = document.getElementById("chat");
    const status = document.getElementById("status");

    if (!chat || !status) return;

    status.textContent = "⏳ Loading messages...";
    chat.innerHTML = "⏳ Loading messages...";

    try {

        const { data, error } = await client
            .from("message")
            .select("*")
            .order("id", { ascending: true });

        if (error) {
            showError(error, "LOAD_MESSAGES");
            return;
        }

        const messages = data || [];

        status.textContent = `● ONLINE • ${messages.length}`;

        chat.innerHTML = "";

        for (const m of messages) {

            // 🚨 IMPORTANT FIX (your request)
            if (!m.message || m.message.trim() === "") continue;

            const div = document.createElement("div");
            div.className = "msg";
            div.setAttribute("data-user", m.username);

            if (m.username === window.displayName) {
                div.classList.add("my-msg");
            } else {
                div.style.background = userColors[m.username] || "#FF6200";
            }

            div.textContent = `${m.username}: ${m.message}`;

            chat.appendChild(div);
        }

        chat.scrollTop = chat.scrollHeight;

    } catch (err) {
        showError(err, "FATAL_LOAD_MESSAGES");
    }
}

// ===============================
// SEND MESSAGE
// ===============================
window.sendMessage = async function () {

    const input = document.getElementById("message-input");
    const text = input?.value?.trim();

    if (!text) return;

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
// REALTIME (SAFE)
// ===============================
let realtimeChannel = null;

function setupRealtime() {

    if (realtimeChannel) return;

    realtimeChannel = client.channel("message-live");

    realtimeChannel
        .on("postgres_changes", {
            event: "INSERT",
            schema: "public",
            table: "message"
        }, (payload) => {

            const m = payload.new;

            if (!m.message) return;

            const chat = document.getElementById("chat");
            const status = document.getElementById("status");

            if (!chat) return;

            if (status) {
                const current = parseInt(status.textContent.match(/\d+/)) || 0;
                status.textContent = `● ONLINE • ${current + 1}`;
            }

            const div = document.createElement("div");
            div.className = "msg";

            if (m.username === window.displayName) {
                div.classList.add("my-msg");
            }

            div.textContent = `${m.username}: ${m.message}`;

            chat.appendChild(div);
            chat.scrollTop = chat.scrollHeight;
        })
        .subscribe();
}

// ===============================
// INIT CHAT
// ===============================
async function initChat() {

    await loadProfiles();
    await loadMessages();

    setupRealtime();
}
