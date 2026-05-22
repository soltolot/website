// --------------------------------------------------
// Better log() function (supports multiple arguments)
// --------------------------------------------------
function log(...args) {
    const chatBox = document.getElementById("chat");
    if (!chatBox) return; // Guard clause in case DOM isn't ready
    
    const logDiv = document.createElement("div");
    logDiv.style.color = "#999";
    logDiv.style.fontSize = "0.9em";
    logDiv.style.fontStyle = "italic";
    logDiv.textContent = "[LOG] " + args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(" ");
    chatBox.appendChild(logDiv);
}

// Global state for user
window.displayName = null;

// --------------------------------------------------
// initChat() — REQUIRED BY app.js
// --------------------------------------------------
async function initChat() {
    log("CHAT", "initChat ENTERED");

    try {
        // Fetch session safely
        const { data, error } = await client.auth.getSession();
        const session = data?.session;

        if (error || !session) {
            log("CHAT", "NO SESSION OR ERROR — redirecting");
            window.location.href = "login.html";
            return;
        }

        // Load username
        window.displayName = session.user?.user_metadata?.username;
        log("CHAT", "USERNAME LOADED:", window.displayName);

        // Load messages
        await loadMessages();

        log("CHAT", "initChat COMPLETE");
    } catch (err) {
        log("CHAT ERROR during init:", err.message);
    }
}

// --------------------------------------------------
// Load messages
// --------------------------------------------------
async function loadMessages() {
    const { data, error } = await client
        .from("message")
        .select("*")
        .order("created_at", { ascending: true });

    if (error) {
        log("Error loading messages:", error.message);
        return;
    }

    const box = document.getElementById("chat");
    if (!box) return;
    
    box.innerHTML = "";

    data.forEach(msg => {
        const div = document.createElement("div");
        // Safe mapping in case username or text is missing
        div.textContent = `${msg.username || 'Unknown'}: ${msg.text || ''}`;
        box.appendChild(div);
    });
    
    // Auto-scroll to bottom of chat
    box.scrollTop = box.scrollHeight;
}

// --------------------------------------------------
// Send message
// --------------------------------------------------
async function sendMessage() {
    const inputEl = document.getElementById("message-input");
    const text = inputEl.value.trim();
    if (!text) return;

    if (!window.displayName) {
        log("ERROR: Username not loaded yet.");
        return;
    }

    const { error } = await client.from("message").insert({
        username: window.displayName,
        text: text
    });

    if (error) {
        log("Error sending message:", error.message);
        return;
    }

    inputEl.value = "";
    
    // Refresh the feed
    await loadMessages();
}
