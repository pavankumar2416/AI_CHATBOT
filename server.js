const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// =========================
// CONFIG
// =========================

const API_KEY = process.env.GEMINI_API_KEY;
const PORT = process.env.PORT || 3000;

// rest of your code stays SAME

// =========================
// MEMORY STORAGE
// =========================

const conversations = {};

// =========================
// HEALTH CHECK
// =========================

app.get("/", (req, res) => {
    res.send("🚀 Nova AI Backend Running");
});

// =========================
// CHAT API
// =========================

app.post("/chat", async (req, res) => {
    try {
        const { message, sessionId } = req.body;

        if (!message) {
            return res.status(400).json({ error: "Message is required" });
        }

        const currentSession = sessionId || "default";

        if (!conversations[currentSession]) {
            conversations[currentSession] = [];
        }

        conversations[currentSession].push({
            role: "user",
            parts: [{ text: message }]
        });

        if (conversations[currentSession].length > 30) {
            conversations[currentSession] =
                conversations[currentSession].slice(-30);
        }

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${API_KEY}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    contents: conversations[currentSession]
                })
            }
        );

        const data = await response.json();

console.log("API RESPONSE:", data);

removeTyping();

let botReply = "⚠️ No response from AI";

if (data.error) {
    botReply = "❌ Backend Error: " + (data.error.message || "Unknown error");

} else if (data.candidates?.length > 0) {

    const parts = data.candidates[0]?.content?.parts;

    if (parts?.length > 0) {
        botReply = parts.map(p => p.text || "").join("");
    }
}

// =========================
// NEW CHAT
// =========================

app.post("/new-chat", (req, res) => {
    const { sessionId } = req.body;

    if (sessionId) {
        conversations[sessionId] = [];
    }

    res.json({ success: true });
});

// =========================
// CLEAR MEMORY
// =========================

app.post("/clear-memory", (req, res) => {
    Object.keys(conversations).forEach(key => delete conversations[key]);
    res.json({ success: true });
});

// =========================
// START SERVER
// =========================

app.listen(PORT, () => {
    console.log("🚀 Server Running on port " + PORT);
});
