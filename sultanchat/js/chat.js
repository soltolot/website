// ==================================================
// chat.js — MESSAGING & DATA FEED RENDERS
// ==================================================

// --------------------------------------------------
// initChat() — ORCHESTRATION PIPELINE INTERACTION
// --------------------------------------------------
async function initChat() {
    log("CHAT", "initChat ENTERED");

    // Validates that auth.js finished compiling user metrics first
    if (!window.displayName) {
        log("CHAT", "ERROR: Global state window.displayName missing. Halting execution.");
        return; 
    }

    log("CHAT", "Active workspace cleared for user:", window.displayName);

    // Initial table sync fetch
    await loadMessages();

    log("CHAT", "initChat COMPLETE");
}

// --------------------------------------------------
// DOWNLOAD MESSAGES
// --------------------------------------------------
async function loadMessages() {
    const { data, error } = await client
        .from("message")
        .select("*")
        .order("created_at", { ascending: true });

    if (error) {
        log("Error loading messages from database:", error.message);
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

    // Automatically force scroll viewport tracking down
    box.scrollTop = box.scrollHeight;
}

// --------------------------------------------------
// UPLOAD/SEND MESSAGE
// --------------------------------------------------
async function sendMessage() {
    const inputEl = document.getElementById("message-input");
    const text = inputEl.value.trim();
    if (!text) return;

    if (!window.displayName) {
        log("ERROR: Message rejected. Identity parameter window.displayName is missing.");
        return;
    }

    const { error } = await client.from("message").insert({
        username: window.displayName,
        text: text
    });

    if (error) {
        log("Error sending message to Supabase:", error.message);
        return;
    }

    inputEl.value = "";
    await loadMessages();
}
