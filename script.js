// =========================
// ELEMENTS
// =========================

const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("userInput");

const sendBtn = document.getElementById("sendBtn");
const micBtn = document.getElementById("micBtn");

const newChatBtn = document.getElementById("newChat");
const clearChatBtn = document.getElementById("clearChat");
const exportBtn = document.getElementById("exportChat");
const themeBtn = document.getElementById("themeToggle");

const menuBtn = document.getElementById("menuBtn");
const sidebar = document.querySelector(".sidebar");

const chatHistory = document.getElementById("chatHistory");

// =========================
// SETTINGS
// =========================

const API_URL = "https://ai-chatbot-backend-d5bo.onrender.com";

// =========================
// SESSION MEMORY
// =========================

let sessionId = localStorage.getItem("sessionId");

if (!sessionId) {
    sessionId = Date.now().toString();
    localStorage.setItem("sessionId", sessionId);
}

// =========================
// TIME
// =========================

function getTime() {
    return new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
    });
}

// =========================
// SAVE CHAT
// =========================

function saveChat() {
    localStorage.setItem(
        "chatData",
        chatBox.innerHTML
    );
}

// =========================
// LOAD CHAT
// =========================

function loadChat() {

    const saved =
    localStorage.getItem("chatData");

    if(saved){
        chatBox.innerHTML = saved;
    }

}

loadChat();

// =========================
// SCROLL
// =========================

function scrollBottom() {
    chatBox.scrollTop =
    chatBox.scrollHeight;
}

// =========================
// HISTORY
// =========================

function addHistory(title){

    const p =
    document.createElement("p");

    p.textContent = title;

    chatHistory.appendChild(p);

}

// =========================
// COPY RESPONSE
// =========================

function copyResponse(btn){

    const text =
    btn.parentElement
    .querySelector(".reply")
    .innerText;

    navigator.clipboard.writeText(text);

    btn.innerText = "Copied ✓";

    setTimeout(()=>{

        btn.innerText = "Copy";

    },2000);

}

window.copyResponse = copyResponse;

// =========================
// TYPING DOTS
// =========================

function showTyping(){

    chatBox.innerHTML += `
    <div class="bot" id="typing">

        <strong>AI</strong>

        <div class="typing">
            <span>.</span>
            <span>.</span>
            <span>.</span>
        </div>

    </div>
    `;

    scrollBottom();

}

function removeTyping(){

    const typing =
    document.getElementById("typing");

    if(typing){
        typing.remove();
    }

}

// =========================
// TYPEWRITER EFFECT
// =========================

async function typeWriter(element,text){

    let i = 0;

    while(i < text.length){

        element.innerHTML +=
        text.charAt(i);

        i++;

        await new Promise(resolve =>
            setTimeout(resolve,10)
        );

        scrollBottom();

    }

}

// =========================
// SEND MESSAGE
// =========================

async function sendMessage(){

    const message =
    userInput.value.trim();

    if(!message) return;

    chatBox.innerHTML += `
    <div class="user">

        <strong>You</strong>

        <p>${message}</p>

        <small>${getTime()}</small>

    </div>
    `;

    saveChat();

    addHistory(
        message.substring(0,25)
    );

    userInput.value = "";

    scrollBottom();

    showTyping();

    try{

        const response =
        await fetch(API_URL,{
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify({
                message,
                sessionId
            })
        });

        const data =
        await response.json();

        removeTyping();

        let botReply =
        "No response received.";

        if(
            data.candidates &&
            data.candidates[0] &&
            data.candidates[0].content &&
            data.candidates[0].content.parts &&
            data.candidates[0].content.parts[0]
        ){
            botReply =
            data.candidates[0]
            .content.parts[0]
            .text;
        }

        const botDiv =
        document.createElement("div");

        botDiv.className = "bot";

        botDiv.innerHTML = `
        <button
        class="copy-btn"
        onclick="copyResponse(this)">
        Copy
        </button>

        <strong>AI</strong>

        <div class="reply"></div>

        <small>
        ${getTime()}
        </small>
        `;

        chatBox.appendChild(botDiv);

        const replyArea =
        botDiv.querySelector(".reply");

        const formattedReply =
typeof marked !== "undefined"
? marked.parse(botReply)
: botReply;

replyArea.innerHTML =
formattedReply;
        saveChat();

        scrollBottom();

    }
    catch(error){

        removeTyping();

        chatBox.innerHTML += `
        <div class="bot">

            <strong>AI</strong>

            <p>
            ❌ Error connecting
            to backend.
            </p>

            <small>
            ${getTime()}
            </small>

        </div>
        `;

        console.error(error);

        saveChat();

        scrollBottom();

    }

}

// =========================
// SEND BUTTON
// =========================

if(sendBtn){

    sendBtn.addEventListener(
        "click",
        sendMessage
    );

}

// =========================
// ENTER KEY
// =========================

userInput.addEventListener(
    "keypress",
    (e)=>{

        if(e.key === "Enter"){
            sendMessage();
        }

    }
);

// =========================
// NEW CHAT
// =========================

if(newChatBtn){

newChatBtn.addEventListener(
    "click",
    async ()=>{

        sessionId =
        Date.now().toString();

        localStorage.setItem(
            "sessionId",
            sessionId
        );

        try{

            await fetch(
                "https://ai-chatbot-backend-d5bo.onrender.com",
                {
                    method:"POST",
                    headers:{
                        "Content-Type":
                        "application/json"
                    },
                    body:JSON.stringify({
                        sessionId
                    })
                }
            );

        }catch(err){
            console.log(err);
        }

        chatBox.innerHTML = `
        <div class="bot">

        <strong>AI</strong>

        <p>
        New chat started.
        How can I help?
        </p>

        </div>
        `;

        saveChat();

    }
);

}

// =========================
// CLEAR CHAT
// =========================

if(clearChatBtn){

clearChatBtn.addEventListener(
    "click",
    ()=>{

        localStorage.removeItem(
            "chatData"
        );

        chatBox.innerHTML = `
        <div class="bot">

        <strong>AI</strong>

        <p>
        Chat cleared.
        </p>

        </div>
        `;

    }
);

}

// =========================
// EXPORT CHAT
// =========================

if(exportBtn){

exportBtn.addEventListener(
    "click",
    ()=>{

        const text =
        chatBox.innerText;

        const blob =
        new Blob([text],{
            type:"text/plain"
        });

        const link =
        document.createElement("a");

        link.href =
        URL.createObjectURL(blob);

        link.download =
        "chat.txt";

        link.click();

    }
);

}

// =========================
// THEME
// =========================

if(themeBtn){

themeBtn.addEventListener(
    "click",
    ()=>{

        document.body
        .classList.toggle(
            "light"
        );

        localStorage.setItem(
            "theme",
            document.body
            .classList.contains(
                "light"
            )
        );

    }
);

}

if(
localStorage.getItem(
    "theme"
) === "true"
){

document.body.classList.add(
    "light"
);

}

// =========================
// MOBILE MENU
// =========================

if(menuBtn){

menuBtn.addEventListener(
    "click",
    ()=>{

        sidebar.classList.toggle(
            "active"
        );

    }
);

}

// =========================
// VOICE INPUT
// =========================

const SpeechRecognition =
window.SpeechRecognition ||
window.webkitSpeechRecognition;

if(SpeechRecognition){

const recognition =
new SpeechRecognition();

recognition.lang = "en-US";
recognition.continuous = false;
recognition.interimResults = false;

micBtn.addEventListener(
    "click",
    ()=>{

        recognition.start();

        micBtn.classList.add(
            "listening"
        );

        micBtn.innerText =
        "🎙️";

    }
);

recognition.onresult =
(event)=>{

    const text =
    event.results[0][0]
    .transcript;

    userInput.value = text;

    sendMessage();

};

recognition.onend = ()=>{

    micBtn.classList.remove(
        "listening"
    );

    micBtn.innerText = "🎤";

};

recognition.onerror = ()=>{

    micBtn.classList.remove(
        "listening"
    );

    micBtn.innerText = "🎤";

};

}else{

if(micBtn){
    micBtn.disabled = true;
    micBtn.innerText = "❌";
}

}

// =========================
// START
// =========================

scrollBottom();
