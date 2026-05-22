// ==================================================
// chat.js — CHAT INTERACTION & DOM INTERFACE
// ==================================================

// --------------------------------------------------
// Logger tool supporting strings and objects safely
// --------------------------------------------------
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
// initChat() — REQUIRED & CALLED BY app.js
// --------------------------------------------------
async function initChat() {
    log("CHAT", "initChat ENTERED");

    // Rely entirely on global state populated by auth.js
    if (!window.displayName) {
        log("CHAT", "ERROR: window.displayName is missing. Aborting setup.");
        return; 
    }

    log("CHAT", "Environment verified for user:", window.displayName);

    // Initial feed render
    await loadMessages();

    log("CHAT", "initChat COMPLETE");
}

// --------------------------------------------------
// LOAD MESSAGES FROM DATABASE
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

    // Automatically stick scroll window to the bottom
    box.scrollTop = box.scrollHeight;
}

// --------------------------------------------------
// SEND MESSAGE
// --------------------------------------------------
async function sendMessage() {
    const inputEl = document.getElementById("message-input");
    const text = inputEl.value.trim();
    if (!text) return;

    if (!window.displayName) {
        log("ERROR: Message blocked. Username global state is missing.");
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
