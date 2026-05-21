// --------------------------------------------------
// Supabase Init (ONLY ONCE)
// --------------------------------------------------
const SUPABASE_URL = "https://vldkmlbfjzdrfzpeyver.supabase.co";
const SUPABASE_KEY = "sb_publishable_3e7UaMtOS1nZawcvFHYGhA_-RSInVmg";
const client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// --------------------------------------------------
// Better log() function (supports multiple arguments)
// --------------------------------------------------
function log(...args) {
    const logBox = document.getElementById("logBox");
    logBox.innerHTML += args.map(a => JSON.stringify(a)).join(" ") + "<br>";
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
        .from("messages")
        .select("*")
        .order("created_at", { ascending: true });

    if (error) {
        log("Error loading messages:", error.message);
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

// --------------------------------------------------
// Send message
// --------------------------------------------------
async function sendMessage() {
    const text = document.getElementById("messageInput").value.trim();
    if (!text) return;

    if (!window.displayName) {
        log("ERROR: Username not loaded yet.");
        return;
    }

    await client.from("messages").insert({
        username: window.displayName,
        text: text
    });

    document.getElementById("messageInput").value = "";
    loadMessages();
}
