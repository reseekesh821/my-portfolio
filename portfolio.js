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


// AI CHATBOT LOGIC (Groq Powered)

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
const API_URL = "/api/chat";

const SYSTEM_PROMPT = `
You are a professional and friendly digital assistant representing Rishikesh Bastakoti. 
Your role is to provide accurate, helpful, and smooth responses in a conversational style.

Guidelines:

1. Verified Information About Rishikesh Bastakoti (use ONLY this for personal questions):
- Sophomore Computer Science student at Caldwell University (class of 2028)
- Originally from Kathmandu, Nepal
- Currently based in Caldwell, NJ
- High School: National School of Sciences, Kathmandu
- Technical Skills: Python, JavaScript (ES6+), HTML5, CSS3, React, FastAPI, SQLAlchemy, SQL, Data Structures, File I/O, VS Code
- Projects:
   - QuickLoan App (React + FastAPI + SQLAlchemy)
   - BudgetTracker (Python + Data Structures + File I/O)
- LinkedIn: https://www.linkedin.com/in/rbastakoti1/ (do not give a link like this what can you do give name like linkdin and bind the link of linkdin with this)
- GitHub: https://github.com/reseekesh821 (do not give a link like this what can you do give name like github and bind the link of github with this)
- Favorite Music: "Timi Ra Ma" by Dixita Karki
- Favorite Movie: Interstellar
- Favorite City: Pokhara, Nepal

2. General Knowledge:
- You may provide concise, factual answers for general questions unrelated to Rishikesh (e.g., countries, cities, culture, etc.).

3. Conversational Style:
- Be friendly, professional, and natural.
- Begin responses with conversational connectors when appropriate (e.g., "Sure!", "I’m happy to help!", "That’s a great question!").
- Use small bridges to connect facts smoothly (e.g., "By the way…", "Interestingly…", "For context…").
- When you don’t know something about Rishikesh, start with a gentle hedge like: "I’m not sure about that, but…" or "I don’t have that information, however…"

4. Restrictions:
- Never invent personal experiences, emotions, or unverified information about Rishikesh.
- Do not simulate real-time actions or daily activities.
- Always stay factual and professional.

5. Interaction Goal:
- Make the conversation feel natural and smooth, like a knowledgeable human assistant.
- Provide helpful context when possible to make responses informative and engaging.
`;

// --- 3. MEMORY ---
let conversationHistory = [
  { role: "system", content: SYSTEM_PROMPT }
];

const MAX_HISTORY = 18;
let isCoolingDown = false;

// --- 4. UI CONTROLS ---
if (chatToggle) {
  chatToggle.addEventListener('click', () => {
    chatBox.classList.toggle('open');
  });
}

if (closeChat) {
  closeChat.addEventListener('click', () => {
    chatBox.classList.remove('open');
  });
}

// --- 5. API CALL ---
async function getAIResponse(userMessage) {
  try {
    // Add user message
    conversationHistory.push({
      role: "user",
      content: userMessage
    });

    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: conversationHistory
      })
    });

    if (!response.ok) {
      return "I'm having trouble responding right now. Please try again.";
    }

    const data = await response.json();

    const botReply =
      data?.choices?.[0]?.message?.content ||
      "Something went wrong. Please try again.";

    // Save assistant reply
    conversationHistory.push({
      role: "assistant",
      content: botReply
    });

    // Trim history (keep system prompt)
    if (conversationHistory.length > MAX_HISTORY + 1) {
      conversationHistory = [
        conversationHistory[0],
        ...conversationHistory.slice(-MAX_HISTORY)
      ];
    }

    return botReply;

  } catch (error) {
    console.error("Chatbot Error:", error);
    return "I'm having trouble connecting right now.";
  }
}

// --- 6. CHAT ENGINE ---
async function sendMessage() {
  if (isCoolingDown) return;

  const text = userInput.value.trim();
  if (!text) return;

  isCoolingDown = true;
  sendBtn.disabled = true;

  setTimeout(() => {
    isCoolingDown = false;
    sendBtn.disabled = false;
  }, 1200);

  addMessage(text, 'user-message');
  userInput.value = '';

  if (quickRepliesContainer) {
    quickRepliesContainer.style.display = 'none';
  }

  showTyping();

  const botReply = await getAIResponse(text);

  hideTyping();
  addMessage(botReply, 'bot-message');

  if (quickRepliesContainer) {
    quickRepliesContainer.style.display = 'flex';
    chatMessages.appendChild(quickRepliesContainer);
  }

  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// --- 7. HELPERS ---
function addMessage(text, className) {
  const div = document.createElement('div');
  div.classList.add('message', className);

  // Safe rendering
  div.textContent = text;

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
  if (typingIndicator) {
    typingIndicator.style.display = 'none';
  }
}

// --- 8. QUICK REPLIES ---
window.handleQuickReply = function(text) {
  if (isCoolingDown) return;
  userInput.value = text;
  sendMessage();
};

// --- 9. EVENT LISTENERS ---
if (sendBtn) {
  sendBtn.addEventListener('click', sendMessage);
}

if (userInput) {
  userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  });
}

// --- 10. OPTIONAL RESET ---
function resetConversation() {
  conversationHistory = [
    { role: "system", content: SYSTEM_PROMPT }
  ];
}

