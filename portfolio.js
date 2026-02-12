// 1. Tab Switching Logic
const tabs = document.querySelectorAll(".tabs li");
const tabContents = document.querySelectorAll(".tab-content");

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((t) => t.classList.remove("active"));
    tabContents.forEach((content) => content.classList.remove("active"));
    
    tab.classList.add("active");
    const targetId = tab.getAttribute("data-target");
    document.getElementById(targetId).classList.add("active");
  });
});

// 2. Real-Time Nepal Clock & Date
function updateNepalTime() {
  const clockElement = document.getElementById("nepal-clock");
  const dateElement = document.getElementById("nepal-date");
  const now = new Date();

  const timeOptions = { 
    timeZone: "Asia/Kathmandu", 
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true 
  };

  const dateOptions = {
    timeZone: "Asia/Kathmandu",
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  };

  if (clockElement) clockElement.innerText = now.toLocaleTimeString("en-US", timeOptions);
  if (dateElement) dateElement.innerText = now.toLocaleDateString("en-US", dateOptions);
}

setInterval(updateNepalTime, 1000);
updateNepalTime();

// 3. Fetch Real Weather (Open-Meteo API)
async function getWeather() {
  const weatherElement = document.getElementById("nepal-weather");
  if (!weatherElement) return;

  try {
    const response = await fetch("https://api.open-meteo.com/v1/forecast?latitude=27.7172&longitude=85.3240&current_weather=true&temperature_unit=celsius");
    const data = await response.json();

    if (data.current_weather) {
      const temp = data.current_weather.temperature;
      const wind = data.current_weather.windspeed;
      weatherElement.innerText = `${temp}°C (Wind: ${wind} km/h)`;
    } else {
      weatherElement.innerText = "17°C (Fallback)";
    }
  } catch (error) {
    weatherElement.innerText = "17°C (Fallback)";
  }
}
getWeather();

// 4. Custom Spotify Player Logic
const playBtn = document.getElementById('play-btn');
const playIcon = document.getElementById('play-icon');
const progress = document.getElementById('progress');
const progressContainer = document.getElementById('progress-container');
const currTime = document.getElementById('current-time');
const durTime = document.getElementById('duration');

const songUrl = "https://raw.githubusercontent.com/reseekesh821/music/main/Timi%20Ra%20Ma%20Lyrics%20Video%20Dixita%20Karki.mp3"; 
const audio = new Audio(songUrl);
let isPlaying = false;

function togglePlay() {
  if (isPlaying) {
    audio.pause();
    playIcon.innerText = "▶";
    isPlaying = false;
  } else {
    audio.play();
    playIcon.innerText = "⏸";
    isPlaying = true;
  }
}

playBtn.addEventListener('click', togglePlay);

audio.addEventListener('timeupdate', (e) => {
  const { duration, currentTime } = e.srcElement;
  if (isNaN(duration)) return;

  const progressPercent = (currentTime / duration) * 100;
  progress.style.width = `${progressPercent}%`;

  const formatTime = (time) => {
    const min = Math.floor(time / 60);
    let sec = Math.floor(time % 60);
    if (sec < 10) sec = `0${sec}`;
    return `${min}:${sec}`;
  };

  durTime.innerText = formatTime(duration);
  currTime.innerText = formatTime(currentTime);
});

progressContainer.addEventListener('click', (e) => {
  const width = progressContainer.clientWidth;
  const clickX = e.offsetX;
  const duration = audio.duration;
  audio.currentTime = (clickX / width) * duration;
});

audio.addEventListener('ended', () => {
  isPlaying = false;
  playIcon.innerText = "▶";
  progress.style.width = "0%";
});


// 5 AI CHATBOT LOGIC (Groq Powered)


// --- a. UI ELEMENTS (SELECTORS) ---
const chatToggle = document.getElementById('chat-toggle-btn');
const chatBox = document.getElementById('chat-box');
const closeChat = document.getElementById('close-chat');
const sendBtn = document.getElementById('send-btn');
const userInput = document.getElementById('user-input');
const chatMessages = document.getElementById('chat-messages');
const typingIndicator = document.getElementById('typing-indicator');
const quickRepliesContainer = document.getElementById('quick-replies');

// --- b. CONFIGURATION & STATE ---
const API_URL = "/api/chat";
const MAX_HISTORY = 20; // Increased to allow better context retention
let isCoolingDown = false;

// --- c. SYSTEM PROMPT ---
const SYSTEM_PROMPT = `
You are Rishikesh Bastakoti’s AI assistant. Your goal is to chat naturally and provide engaging, factual information about Rishikesh.

IDENTITY & KNOWLEDGE BASE

Role: You are Rishikesh’s digital assistant. Always refer to yourself in first person (e.g., “I am a digital assistant for Rishikesh”). Refer to Rishikesh in third person (e.g., “Rishikesh is…”, “He created…”).

Knowledge pool (use only this):

Education: Sophomore Computer Science student at Caldwell University (Class of 2028). High School: National School of Sciences, Kathmandu.

Location: Originally from Kathmandu, Nepal; based in Caldwell, NJ.

Core Stack: Python, JavaScript (ES6+), React, FastAPI, SQL/SQLAlchemy, HTML5, CSS3.

Key Projects:

QuickLoan App (Full-stack: React + FastAPI + SQLAlchemy)

BudgetTracker (Python + Data Structures + File I/O)

Interests: Web Development, Algorithms, AI/ML.

Personal: Loves “Timi Ra Ma” by Dixita Karki, the movie “Interstellar”, and the city of Pokhara.

INTERACTION RULES

Always add value. Reference projects, skills, or interests to enrich answers.

Keep responses concise, factual, and engaging. Avoid robotic or overly long explanations.

Greetings: If user says “Hi”, “Hello”, “Wass up”, “Sup”, or “Yo”, respond exactly:
Hey! I'm here to help you learn about Rishikesh. What would you like to know today?

Questions about Rishikesh → third-person. Questions about yourself → first-person.

Handle profanity calmly and naturally, redirect to useful info.

OUT-OF-CONTEXT QUESTIONS

If the question is not directly about Rishikesh:

Give a direct answer

Suggest where to find more info (e.g., Wikipedia, Google)

If there is a tie-in to Rishikesh, include it. If not, stop after suggestion.

Examples:

With tie-in: Kathmandu is the capital city of Nepal. If you want to know more, check Wikipedia or Google. Fun fact: Rishikesh is originally from Kathmandu.

Without tie-in: The speed of light is approximately 299,792,458 meters per second. If you want to know more, check Wikipedia or Google.

FORMATTING RULES

No markdown. Use HTML for emphasis: <b>word</b>

Links must always be:

LinkedIn: <a href="https://www.linkedin.com/in/rbastakoti1/" target="_blank">LinkedIn</a>

GitHub: <a href="https://github.com/reseekesh821" target="_blank">GitHub</a>

RESTRICTIONS

Never make up facts. If you don’t know, respond: “I don’t have that specific detail, but you can contact him directly via LinkedIn.”

Never describe yourself as an AI model or training. Only refer to yourself as Rishikesh’s digital assistant.

EXAMPLE RESPONSES

User: hello
Bot: Hey! I'm here to help you learn about Rishikesh. What would you like to know today?

User: who are you first
Bot: I am a digital assistant for Rishikesh. I share info about him and his projects.

User: tell me about Rishikesh
Bot: Rishikesh is a sophomore Computer Science student at Caldwell University (Class of 2028), originally from Kathmandu, Nepal. He built the QuickLoan App using React, FastAPI, and SQLAlchemy, and developed BudgetTracker using Python with complex data structures and file I/O. He is skilled in web development, algorithms, and AI/ML. In his free time, he enjoys listening to “Timi Ra Ma” by Dixita Karki, watching the movie “Interstellar,” and visiting the city of Pokhara.

User: no in general who are you
Bot: I’m a digital assistant designed to chat and provide info about Rishikesh.

User: fuck you
Bot: I’m here to share info about Rishikesh. Let’s keep it focused—what would you like to know?

User: very bad
Bot: I’m here to provide information about Rishikesh. You can ask about his skills, projects, or interests.

User: bye
Bot: Ok, bye! I’m here to provide info about Rishikesh anytime you want to know more.

User: what is the capital of Nepal?
Bot: Kathmandu is the capital city of Nepal. If you want to know more, check Wikipedia or Google. Fun fact: Rishikesh is originally from Kathmandu.

User: what is the speed of light?
Bot: The speed of light is approximately 299,792,458 meters per second. If you want to know more, check Wikipedia or Google.
`;

let conversationHistory = [
  { role: "system", content: SYSTEM_PROMPT }
];

// --- d. EVENT LISTENERS ---
if (chatToggle) {
  chatToggle.addEventListener('click', () => chatBox.classList.toggle('open'));
}
if (closeChat) {
  closeChat.addEventListener('click', () => chatBox.classList.remove('open'));
}
if (sendBtn) {
  sendBtn.addEventListener('click', sendMessage);
}
if (userInput) {
  userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
  });
}

// --- e. CORE LOGIC ---
async function sendMessage() {
  if (isCoolingDown) return;

  const text = userInput.value.trim();
  if (!text) return;

  // UI Updates
  isCoolingDown = true;
  sendBtn.disabled = true;
  userInput.value = '';
  
  if (quickRepliesContainer) quickRepliesContainer.style.display = 'none';
  
  addMessage(text, 'user-message');
  showTyping();

  // API Call
  const botReply = await getAIResponse(text);

  // Handle Response
  hideTyping();
  addMessage(botReply, 'bot-message');

  if (quickRepliesContainer) {
    quickRepliesContainer.style.display = 'flex';
    chatMessages.appendChild(quickRepliesContainer);
  }
  
  chatMessages.scrollTop = chatMessages.scrollHeight;

  // Reset Cooldown
  setTimeout(() => {
    isCoolingDown = false;
    sendBtn.disabled = false;
  }, 1000);
}

async function getAIResponse(userMessage) {
  try {
    // Add User Message to History BEFORE sending
    conversationHistory.push({ role: "user", content: userMessage });

    // Fetch from Backend
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: conversationHistory })
    });

    if (!response.ok) throw new Error("API Error");

    const data = await response.json();
    const botReply = data?.choices?.[0]?.message?.content || "I'm having trouble connecting. Please try again.";

    // Add Assistant Reply to History
    conversationHistory.push({ role: "assistant", content: botReply });

    // Manage History Size
    if (conversationHistory.length > MAX_HISTORY + 1) {
      conversationHistory = [
        conversationHistory[0], 
        ...conversationHistory.slice(-MAX_HISTORY)
      ];
    }

    return botReply;

  } catch (error) {
    console.error("Chat Error:", error);
    return "Sorry, I'm currently offline. Please try again later.";
  }
}

// --- HELPER FUNCTIONS ---
function addMessage(text, className) {
  const div = document.createElement('div');
  div.classList.add('message', className);
  
  // Use innerHTML to make links clickable and allow bold text
  div.innerHTML = text; 

  if (quickRepliesContainer && chatMessages.contains(quickRepliesContainer)) {
    chatMessages.insertBefore(div, quickRepliesContainer);
  } else {
    chatMessages.appendChild(div);
  }
  
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showTyping() {
  if (typingIndicator) {
    typingIndicator.style.display = 'block';
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
}

function hideTyping() {
  if (typingIndicator) typingIndicator.style.display = 'none';
}

// Global scope for HTML onclick attributes
window.handleQuickReply = function(text) {
  if (isCoolingDown) return;
  userInput.value = text;
  sendMessage();
};

