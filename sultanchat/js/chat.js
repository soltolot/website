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

    // Add a loading bubble (non-destructive)
    const loading = document.createElement("div");
    loading.className = "msg system-msg loading-msg";
    chat.appendChild(loading);

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

        // Remove ONLY the loading bubble
        chat.querySelectorAll(".loading-msg").forEach(el => el.remove());

        for (const m of messages) {

            if (!m.text || m.text.trim() === "") continue;

            const div = document.createElement("div");
            div.className = "msg";
            div.setAttribute("data-user", m.username);

            if (m.username === window.displayName) {
                div.classList.add("my-msg");
            } else {
                div.style.background = userColors[m.username] || "#FF6200";
            }

            div.textContent = `${m.username}: ${m.text}`;

            chat.appendChild(div);
        }

        chat.scrollTop = chat.scrollHeight;

    } catch (err) {
        showError(err, "FATAL_LOAD_MESSAGES");
    }
}

// ===============================
// SEND MESSAGE (FIXED)
// ===============================
window.sendMessage = async function () {

    const input = document.getElementById("message-input");
    const text = input?.value?.trim();

    if (!text) return;

    const { error } = await client
        .from("text")
        .insert({
            username: window.displayName,
            text: text   // FIXED
        });

    if (error) {
        showError(error, "SEND_MESSAGE");
        return;
    }

    input.value = "";
};

// ===============================
// REALTIME (FIXED)
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

            // FIXED
            if (!m.text) return;

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
            } else {
                div.style.background = userColors[m.username] || "#FF6200";
            }

            div.textContent = `${m.username}: ${m.text}`;

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
