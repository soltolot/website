// ==================================================
// chat.js — REAL-TIME MESSAGING ENGINE
// ==================================================

let messageSubscription = null;

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

    // 1. Load the existing message history pool
    await loadMessages();

    // 2. Turn on live listening for incoming messages instantly
    subscribeToMessages();

    log("CHAT", "initChat COMPLETE");
}

// --------------------------------------------------
// SUBSCRIBE TO REAL-TIME CHANGES 
// --------------------------------------------------
function subscribeToMessages() {
    // Prevent duplicate channel subscriptions if initChat runs multiple times
    if (messageSubscription) {
        log("CHAT", "Cleaning up old live subscription channel...");
        client.removeChannel(messageSubscription);
    }

    log("CHAT", "Connecting to Supabase Realtime channel...");

    messageSubscription = client
        .channel('public:message')
        .on(
            'postgres_changes', 
            { event: 'INSERT', schema: 'public', table: 'message' }, 
            (payload) => {
                log("CHAT", "⚡ Live message received from:", payload.new.username);
                
                // Reload the feed to display the new message with precise server ordering
                loadMessages(); 
            }
        )
        .subscribe((status) => {
            log("CHAT", "Realtime socket status updated to:", status);
        });
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

    // Keep scroll viewport anchored to the bottom
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
    // NOTE: loadMessages() is intentionally omitted here! 
    // Our real-time listener subscription catches the insert event 
    // and updates the feed instantly for both you and everyone else.
}
