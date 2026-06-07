import cors from "cors";
import express from "express";

const app = express();

app.use(cors());
app.use(express.json());

require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// =========================
// CONFIG
// =========================

const API_KEY = process.env.GEMINI_API_KEY;
const PORT = process.env.PORT || 3000;

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

            return res.status(400).json({
                error: "Message is required"
            });

        }

        const currentSession =
            sessionId || "default";

        // Create session

        if (!conversations[currentSession]) {

            conversations[currentSession] = [];

        }

        // Save user message

        conversations[currentSession].push({
            role: "user",
            parts: [
                {
                    text: message
                }
            ]
        });

        // Limit memory size

        if (
            conversations[currentSession].length > 30
        ) {

            conversations[currentSession] =
            conversations[currentSession]
            .slice(-30);

        }

        async function callGemini(url, options, retries = 3) {

    for (let i = 0; i < retries; i++) {

        const response = await fetch(url, options);

        const data = await response.json();

        if (!data.error) {
            return data;
        }

        if (
            data.error.code === 503 &&
            i < retries - 1
        ) {

            console.log(
                `Retry ${i + 1}...`
            );

            await new Promise(resolve =>
                setTimeout(resolve, 3000)
            );

            continue;
        }

        throw new Error(
            data.error.message
        );
    }
}
const data = await callGemini(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${API_KEY}`,
    {
        method: "POST",
        headers: {
            "Content-Type":
            "application/json"
        },
        body: JSON.stringify({
            systemInstruction: {
                parts: [{
                    text:
                    "You are Nova AI."
                }]
            },
            contents:
            conversations[currentSession]
        })
    }
);

        
        // Save AI Response

        if (
            data.candidates &&
            data.candidates[0] &&
            data.candidates[0].content
        ) {

            conversations[currentSession].push({

                role: "model",

                parts:
                data.candidates[0]
                .content.parts

            });

        }

        res.json(data);

    }

    catch (error) {

        console.error(
            "Server Error:",
            error
        );

        res.status(500).json({

            error:
            "Internal Server Error"

        });

    }

});

// =========================
// NEW CHAT
// =========================

app.post("/new-chat", (req, res) => {

    try {

        const { sessionId } = req.body;

        if (sessionId) {

            conversations[sessionId] = [];

        }

        res.json({

            success: true,
            message:
            "New chat created"

        });

    }

    catch (error) {

        console.error(error);

        res.status(500).json({

            error:
            "Failed to create chat"

        });

    }

});

// =========================
// CLEAR ALL MEMORY
// =========================

app.post("/clear-memory", (req, res) => {

    try {

        Object.keys(conversations)
        .forEach(key => {

            delete conversations[key];

        });

        res.json({

            success: true,
            message:
            "All memory cleared"

        });

    }

    catch (error) {

        res.status(500).json({

            error:
            "Failed to clear memory"

        });

    }

});

// =========================
// START SERVER
// =========================

app.listen(PORT, () => {

    console.log(
        `🚀 Nova AI Server Running`
    );

    console.log(
        `🌐 http://localhost:${PORT}`
    );

});
