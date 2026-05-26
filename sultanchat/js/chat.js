// ==================================================
// chat.js — REAL-TIME MESSAGING ENGINE WITH MULTI-COLOR BUBBLES
// ==================================================

let messageSubscription = null;
let cachedProfiles = {}; // Temporarily holds username -> color maps to avoid hammering the DB

// --------------------------------------------------
// initChat() — ORCHESTRATION PIPELINE INTERACTION
// --------------------------------------------------
async function initChat() {
    log("CHAT", "initChat ENTERED");

    if (!window.displayName) {
        log("CHAT", "ERROR: Global state window.displayName missing. Halting execution.");
        return; 
    }

    log("CHAT", "Active workspace cleared for user:", window.displayName);

    // 1. Prefetch user profile colors so we know who owns what color
    await loadProfilesCache();

    // 2. Load the existing message history pool
    await loadMessages();

    // 3. Turn on live listening for incoming messages instantly
    subscribeToMessages();

    log("CHAT", "initChat COMPLETE");
}

// --------------------------------------------------
// PREFETCH USER PROFILES TO CACHE COLORS
// --------------------------------------------------
async function loadProfilesCache() {
    log("CHAT", "Caching user profile colors...");
    const { data, error } = await client.from("profiles").select("username, color");
    
    if (error) {
        log("ERROR", "Could not cache profiles: " + error.message);
        return;
    }

    cachedProfiles = {};
    data.forEach(p => {
        if (p.username) cachedProfiles[p.username] = p.color;
    });
}

// --------------------------------------------------
// SUBSCRIBE TO REAL-TIME CHANGES 
// --------------------------------------------------
function subscribeToMessages() {
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
            async (payload) => {
                log("CHAT", "⚡ Live message received from:", payload.new.username);
                
                // Quick check: If a new user chats whose color we don't know, refresh cache
                if (payload.new.username && !cachedProfiles[payload.new.username]) {
                    await loadProfilesCache();
                }
                
                loadMessages(); 
            }
        )
        .subscribe((status) => {
            log("CHAT", "Realtime socket status updated to:", status);
        });
}

// --------------------------------------------------
// DOWNLOAD AND RENDER MESSAGES WITH UNIQUE COLORS
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
        const username = msg.username || 'Unknown';
        const textContent = msg.text || '';
        const isMe = (username === window.displayName);

        // 1. Create the single bubble element
        const bubble = document.createElement("div");
        
        // 2. Assign classes based on who sent it
        if (isMe) {
            bubble.classList.add("msg", "my-msg");
            // Always pull your own color live from localStorage (in case you just changed it)
            const myLocalColor = localStorage.getItem("myColor") || "#FF6200";
            bubble.style.setProperty("--bubble-color", myLocalColor);
        } else {
            bubble.classList.add("msg", "other-msg");
            // Pull the other person's color from our profile cache, fallback if missing
            const theirColor = cachedProfiles[username] || "#546E7A";
            bubble.style.setProperty("--bubble-color", theirColor);
        }

        // 3. Build the inner layout: "Sultan: Hello"
        bubble.innerHTML = `<strong>${username}:</strong> ${textContent}`;

        // 4. Append directly into chat window
        box.appendChild(bubble);
    });

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
}
