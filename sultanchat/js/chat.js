
// ===============================
// STATE
// ===============================
let myColor = localStorage.getItem("myColor") || "#FF6200";
let userColors = {}; // username -> color map

document.documentElement.style.setProperty("--my-msg-color", myColor);

// ===============================
// WAIT FOR USER
// ===============================
async function waitForUser() {
    const start = Date.now();

    return new Promise((resolve) => {
        const check = setInterval(() => {

            if (window.displayName) {
                clearInterval(check);
                resolve(window.displayName);
            }

            // safety timeout (IMPORTANT)
            if (Date.now() - start > 5000) {
                clearInterval(check);
                console.warn("User not ready, continuing anyway");
                resolve("Anonymous");
            }

        }, 200);
    });
}
// ===============================
// LOAD PROFILES (colors)
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

    refreshMessageColors();
}

// ===============================
// REFRESH COLORS ON EXISTING MESSAGES
// ===============================
function refreshMessageColors() {

    const messages = document.querySelectorAll(".msg");

    messages.forEach(el => {

        const text = el.getAttribute("data-user");

        if (!text) return;

        el.style.background = userColors[text] || "#FF6200";
    });
}

// ===============================
// LOAD MESSAGES (FULL RENDER)
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
            status.textContent = "● ERROR";
            return;
        }

        const messages = data || [];

        status.textContent = `● ONLINE • ${messages.length}`;

        chat.innerHTML = "";

        for (const m of messages) {

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
        showError(error, "SEND_SUGGEST");
        return;
    }

    input.value = "";
}

// ===============================
// REALTIME (FAST APPEND ONLY)
// ===============================
function setupRealtime() {

    client.channel("message-live")
        .on("postgres_changes", {
            event: "INSERT",
            schema: "public",
            table: "message"
        }, (payload) => {

            const m = payload.new;

            const chat = document.getElementById("chat");
            const status = document.getElementById("status");

            if (!chat) return;

            // update status count (cheap update)
            if (status) {
                const current = parseInt(status.textContent.match(/\d+/)) || 0;
                status.textContent = `● ONLINE • ${current + 1}`;
            }

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
            chat.scrollTop = chat.scrollHeight;
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

    await waitForUser();

    await loadProfiles();   // load colors first
    await loadMessages();   // then messages

    setupRealtime();
    setupChatUI();

    // optional: refresh colors every 10s in case user changes them
    setInterval(loadProfiles, 10000);
}

initChat();
