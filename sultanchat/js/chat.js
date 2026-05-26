// ==================================================
// chat.js — REAL-TIME MESSAGING ENGINE WITH MULTI-COLOR BUBBLES
// ==================================================

let messageSubscription = null;
let profileSubscription = null;
let cachedProfiles = {};

// --------------------------------------------------
// initChat()
// --------------------------------------------------
async function initChat() {
    log("CHAT", "initChat ENTERED");

    if (!window.displayName) return;

    await loadProfilesCache();
    await loadMessages();

    subscribeToMessages();
    subscribeToProfileColors(); // 🔥 ONLY NEW FEATURE HOOK

    log("CHAT", "initChat COMPLETE");
}

// --------------------------------------------------
// CACHE PROFILES (username → color)
// --------------------------------------------------
async function loadProfilesCache() {
    const { data, error } = await client
        .from("profiles")
        .select("username, color");

    if (error) return;

    cachedProfiles = {};

    data.forEach(p => {
        if (p.username) {
            cachedProfiles[p.username] = p.color;
        }
    });
}

// --------------------------------------------------
// MESSAGE SUBSCRIPTION
// --------------------------------------------------
function subscribeToMessages() {
    if (messageSubscription) {
        client.removeChannel(messageSubscription);
    }

    messageSubscription = client
        .channel('public:message')
        .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'message' },
            () => {
                loadMessages();
            }
        )
        .subscribe();
}

// --------------------------------------------------
// 🔥 NEW: GLOBAL PROFILE COLOR SUBSCRIPTION
// --------------------------------------------------
function subscribeToProfileColors() {
    if (profileSubscription) {
        client.removeChannel(profileSubscription);
    }

    profileSubscription = client
        .channel('public:profiles-live')
        .on(
            'postgres_changes',
            {
                event: 'UPDATE',
                schema: 'public',
                table: 'profiles'
            },
            (payload) => {

                const username = payload.new.username;
                const color = payload.new.color;

                if (!username || !color) return;

                // update cache instantly
                cachedProfiles[username] = color;

                // repaint existing bubbles instantly
                repaintUserMessages(username, color);
            }
        )
        .subscribe();
}

// --------------------------------------------------
// LOAD + RENDER MESSAGES
// --------------------------------------------------
async function loadMessages() {
    const { data, error } = await client
        .from("message")
        .select("*")
        .order("created_at", { ascending: true });

    if (error) return;

    const box = document.getElementById("chat");
    if (!box) return;

    box.innerHTML = "";

    data.forEach(msg => {
        const username = msg.username || "Unknown";
        const textContent = msg.text || "";
        const isMe = username === window.displayName;

        const bubble = document.createElement("div");

        // 🔥 IMPORTANT: enables live repaint targeting
        bubble.dataset.username = username;

        if (isMe) {
            bubble.classList.add("msg", "my-msg");

            const myColor = localStorage.getItem("myColor") || "#FF6200";
            bubble.style.setProperty("--bubble-color", myColor);
        } else {
            bubble.classList.add("msg", "other-msg");

            const theirColor = cachedProfiles[username] || "#546E7A";
            bubble.style.setProperty("--bubble-color", theirColor);
        }

        bubble.innerHTML = `<strong>${username}:</strong> ${textContent}`;

        box.appendChild(bubble);
    });

    box.scrollTop = box.scrollHeight;
}

// --------------------------------------------------
// 🔥 LIVE REPAINT ENGINE
// --------------------------------------------------
function repaintUserMessages(username, color) {
    const bubbles = document.querySelectorAll(`[data-username="${username}"]`);

    bubbles.forEach(bubble => {
        bubble.style.setProperty("--bubble-color", color);
    });
}

// --------------------------------------------------
// SEND MESSAGE
// --------------------------------------------------
async function sendMessage() {
    const inputEl = document.getElementById("message-input");
    const text = inputEl.value.trim();
    if (!text) return;

    if (!window.displayName) return;

    const { error } = await client
        .from("message")
        .insert({
            username: window.displayName,
            text
        });

    if (error) return;

    inputEl.value = "";
}
