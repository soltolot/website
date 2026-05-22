// --------------------------------------------------
// chat.js — Managed entirely by app.js
// --------------------------------------------------

window.displayName = null;

// Better log() function (supports multiple arguments safely)
function log(...args) {
    const chatBox = document.getElementById("chat");
    if (!chatBox) return; 
    
    const logDiv = document.createElement("div");
    logDiv.style.color = "#999";
    logDiv.style.fontSize = "0.9em";
    logDiv.style.fontStyle = "italic";
    logDiv.textContent = "[LOG] " + args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(" ");
    chatBox.appendChild(logDiv);
}

// --------------------------------------------------
// initChat() — CALLED BY app.js AFTER AUTH IS VALID
// --------------------------------------------------
async function initChat() {
    log("CHAT", "initChat ENTERED");

    // Grab the verified session safely
    const { data } = await client.auth.getSession();
    const session = data?.session;

    if (!session) {
        log("CHAT", "initChat aborted: No active session found.");
        return; 
    }

    // Set user profile data globally
    window.displayName = session.user?.user_metadata?.username || "Anonymous";
    log("CHAT", "USERNAME LOADED:", window.displayName);

    // Initial load of messages
    await loadMessages();

    log("CHAT", "initChat COMPLETE");
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
        div.textContent = `${msg.username || 'Unknown'}: ${msg.text || ''}`;
        box.appendChild(div);
    });

    box.scrollTop = box.scrollHeight; // Keep chat scrolled to bottom
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
    await loadMessages();
}
