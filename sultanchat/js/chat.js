window.displayName = null;

// ⭐ Load username from session
client.auth.getSession().then(({ data }) => {
    const session = data.session;

    if (!session) {
        log("No session found — redirecting to login.");
        window.location.href = "login.html";
        return;
    }

    window.displayName = session.user.user_metadata.username;
    log("USERNAME LOADED:", window.displayName);

    loadMessages();

    log(session);
    log(session?.user?.user_metadata);

    
});

// ⭐ Load messages
async function loadMessages() {
    const { data, error } = await client
        .from("messages")
        .select("*")
        .order("created_at", { ascending: true });

    if (error) {
        console.error(error);
        return;
    }

    const box = document.getElementById("messages");
    box.innerHTML = "";

    data.forEach(msg => {
        const div = document.createElement("div");
        div.textContent = msg.username + ": " + msg.text;
        box.appendChild(div);
    });
}

// ⭐ Send message
async function sendMessage() {
    const text = document.getElementById("messageInput").value.trim();
    if (!text) return;

    if (!window.displayName) {
        console.error("Username not loaded yet.");
        return;
    }

    await client.from("messages").insert({
        username: window.displayName,
        text: text
    });

    document.getElementById("messageInput").value = "";
    loadMessages();
}
