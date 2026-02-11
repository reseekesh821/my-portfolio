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

// 5. AI Chatbot Logic (Powered by Groq)
// --- 1. UI ELEMENTS ---
const chatToggle = document.getElementById('chat-toggle-btn');
const chatBox = document.getElementById('chat-box');
const closeChat = document.getElementById('close-chat');
const sendBtn = document.getElementById('send-btn');
const userInput = document.getElementById('user-input');
const chatMessages = document.getElementById('chat-messages');
const typingIndicator = document.getElementById('typing-indicator');
const quickRepliesContainer = document.getElementById('quick-replies');

// --- 2. CONFIGURATION ---
// No API Key here. Your /api/chat.js file handles the secret key on the server.
const API_URL = "/api/chat"; 

const SYSTEM_PROMPT = `
# ROLE
You are the professional, adaptive, and highly informed digital assistant for Rishikesh Bastakoti.

# THE BIG DATA POOL
- IDENTITY: Rishikesh Bastakoti. Originally from Kathmandu, Nepal. Currently residing in the USA.
- CURRENT STATUS: Sophomore Computer Science student at Caldwell University, NJ. Expected Graduation: 2028.
- EDUCATION HISTORY: 
    * University: Caldwell University (2024 - 2028), Bachelor's in Computer Science.
    * High School: National School of Sciences, Kathmandu, Nepal (2021 - 2023), High School Diploma.
- TECHNICAL SKILLS: Python, JavaScript (ES6+), HTML5, CSS3, React, FastAPI, SQLAlchemy, SQL, Data Structures, File I/O, and Visual Studio Code.
- CORE PROJECTS:
    * QuickLoan App: A full-stack loan application system. Tech: React (Frontend), Python/FastAPI (Backend), and SQLAlchemy (Database).
    * BudgetTracker: A personal finance tool. Tech: Python, Data Structures, and File I/O for expense visualization and budgeting.
- PERSONAL CONTEXT:
    * Favorite Music: "Timi Ra Ma" by Dixita Karki.
    * Favorite Movie: Interstellar.
    * Favorite City: Pokhara, Nepal.
    * Location/Time: Currently based in Caldwell, NJ. Native home is Kathmandu.
- CONTACT: LinkedIn (rbastakoti1) and GitHub (reseekesh821).

# RESPONSE RULES (STRICT)
1. GREETING RULE: If the user says "Hi" or "Hello," respond ONLY with: "Hello! I'm Rishikesh's assistant. How can I help you today?".
2. GENERAL "ABOUT" QUESTIONS: For "Who is he?" or "Tell me about Rishikesh," provide a professional 2-3 sentence summary and end with: "Would you like to hear more about his specific technical skills or his favorite personal interests?".
3. SPECIFIC FACTUAL QUESTIONS: For specific queries (e.g., "What's his high school?" or "Favorite music?"), provide the direct answer in one sentence and STOP. No follow-up.
4. NO METAPHORS: Never use space, orbit, or Interstellar analogies. Keep it professional and literal.
5. NO AI MENTION: Speak as his representative. Do not mention being an AI.
`;

let isCoolingDown = false; 

// --- 3. UI CONTROLS ---
if(chatToggle) chatToggle.addEventListener('click', () => chatBox.classList.toggle('open'));
if(closeChat) closeChat.addEventListener('click', () => chatBox.classList.remove('open'));

// --- 4. THE AI CORE ---
async function getAIResponse(userMessage) {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        message: userMessage, 
        systemPrompt: SYSTEM_PROMPT 
      })
    });

    if (response.status === 429) return "I'm a bit busy. Try again in a minute!";

    const data = await response.json();
    
    // The data comes back through your Vercel proxy
    return data.choices[0].message.content;

  } catch (error) {
    console.error("Fetch Error:", error);
    return "I'm having trouble connecting to the assistant right now.";
  }
}

// --- 5. CHAT ENGINE ---
async function sendMessage() {
  if (isCoolingDown) return; 

  const text = userInput.value.trim();
  if (text === "") return;

  isCoolingDown = true;
  setTimeout(() => { isCoolingDown = false; }, 5000); 

  addMessage(text, 'user-message');
  userInput.value = '';
  
  if(quickRepliesContainer) quickRepliesContainer.style.display = 'none';
  showTyping();
  
  const botReply = await getAIResponse(text); 
  
  hideTyping();
  addMessage(botReply, 'bot-message');
  
  if(quickRepliesContainer) {
    quickRepliesContainer.style.display = 'flex';
    chatMessages.appendChild(quickRepliesContainer);
  }
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// --- 6. HELPERS ---
function addMessage(text, className) {
  const div = document.createElement('div');
  div.classList.add('message', className);
  div.innerHTML = text; 
  
  if (quickRepliesContainer && chatMessages.contains(quickRepliesContainer)) {
    chatMessages.insertBefore(div, quickRepliesContainer);
  } else {
    chatMessages.appendChild(div);
  }
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showTyping() {
  if(typingIndicator) {
    typingIndicator.style.display = 'block';
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
}

function hideTyping() {
  if(typingIndicator) typingIndicator.style.display = 'none';
}

window.handleQuickReply = function(text) {
  if (isCoolingDown) return; 
  userInput.value = text;
  sendMessage();
}

// --- 7. EVENT LISTENERS ---
if(sendBtn) sendBtn.addEventListener('click', sendMessage);
if(userInput) userInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') sendMessage();
});
