// --------------------------------------------------
// Better log() function (supports multiple arguments)
// --------------------------------------------------
function log(...args) {
    const chatBox = document.getElementById("chat");
    const logDiv = document.createElement("div");
    logDiv.style.color = "#999";
    logDiv.style.fontSize = "0.9em";
    logDiv.style.fontStyle = "italic";
    logDiv.textContent = "[LOG] " + args.map(a => JSON.stringify(a)).join(" ");
    chatBox.appendChild(logDiv);
}



// --------------------------------------------------
// initChat() — REQUIRED BY app.js
// --------------------------------------------------
async function initChat() {
    log("CHAT", "initChat ENTERED");

    // Get session again (safe)
    const { data } = await client.auth.getSession();
    const session = data.session;

    if (!session) {
        log("CHAT", "NO SESSION — redirecting");
        window.location.href = "login.html";
        return;
    }

    // Load username
    window.displayName = session.user.user_metadata.username;
    log("CHAT", "USERNAME LOADED:", window.displayName);

    // Load messages
    await loadMessages();

    log("CHAT", "initChat COMPLETE");
}





// --------------------------------------------------
// Load session + username
// --------------------------------------------------
window.displayName = null;

client.auth.getSession().then(({ data }) => {
    const session = data.session;

    log("FULL SESSION:", session);
    log("METADATA:", session?.user?.user_metadata);

    if (!session) {
        log("No session found — redirecting to login.");
        window.location.href = "login.html";
        return;
    }

    // ⭐ This is correct — your metadata key is "username"
    window.displayName = session.user.user_metadata.username;
    log("USERNAME LOADED:", window.displayName);

    loadMessages();
});

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
    box.innerHTML = "";

    data.forEach(msg => {
        const div = document.createElement("div");
        div.textContent = msg.username + ": " + msg.text;
        box.appendChild(div);
    });
}

// --------------------------------------------------
// Send message
// --------------------------------------------------
async function sendMessage() {
    const text = document.getElementById("message-input").value.trim();
    if (!text) return;

    if (!window.displayName) {
        log("ERROR: Username not loaded yet.");
        return;
    }

    await client.from("message").insert({
        username: window.displayName,
        text: text
    });

    document.getElementById("message-input").value = "";
    loadMessages();
}
