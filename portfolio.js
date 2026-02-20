// 0. THEME (light/dark) — run first so theme is applied ASAP
(function() {
  const STORAGE_KEY = 'portfolio-theme';
  const html = document.documentElement;

  function getStored() {
    try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
  }
  function setStored(value) {
    try { localStorage.setItem(STORAGE_KEY, value); } catch (e) {}
  }

  function applyTheme(theme) {
    if (theme === 'light') html.setAttribute('data-theme', 'light');
    else html.removeAttribute('data-theme');
    setStored(theme === 'light' ? 'light' : 'dark');
  }

  var saved = getStored();
  if (saved === 'light') applyTheme('light');

  var btn = document.getElementById('theme-toggle');
  if (btn) {
    btn.addEventListener('click', function() {
      var isLight = html.getAttribute('data-theme') === 'light';
      applyTheme(isLight ? 'dark' : 'light');
    });
  }
})();

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

function getNepalTimeForVoice() {
  const now = new Date();
  const timeStr = now.toLocaleTimeString("en-US", { timeZone: "Asia/Kathmandu", hour: 'numeric', minute: '2-digit', hour12: true });
  const dateStr = now.toLocaleDateString("en-US", { timeZone: "Asia/Kathmandu", weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  return { timeStr, dateStr };
}

setInterval(updateNepalTime, 1000);
updateNepalTime();

// 3. Fetch Real Weather (Open-Meteo API) — store for voice assistant
let lastWeather = { temp: null, wind: null, description: 'Kathmandu' };

async function getWeather() {
  const weatherElement = document.getElementById("nepal-weather");
  try {
    const response = await fetch("https://api.open-meteo.com/v1/forecast?latitude=27.7172&longitude=85.3240&current_weather=true&temperature_unit=celsius");
    const data = await response.json();

    if (data.current_weather) {
      const temp = data.current_weather.temperature;
      const wind = data.current_weather.windspeed;
      lastWeather = { temp, wind, description: 'Kathmandu' };
      if (weatherElement) weatherElement.innerText = `${temp}°C (Wind: ${wind} km/h)`;
    } else {
      if (weatherElement) weatherElement.innerText = "17°C (Fallback)";
    }
  } catch (error) {
    if (weatherElement) weatherElement.innerText = "17°C (Fallback)";
  }
}
getWeather();
setInterval(getWeather, 600000);

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


// 4b. QUIZ GAME — Know Rishikesh?
const QUIZ_QUESTIONS = [
  { q: "Where is Rishikesh from?", options: ["India", "Kathmandu, Nepal", "USA", "UK"], correct: 1 },
  { q: "Which university does he attend?", options: ["MIT", "Caldwell University", "Stanford", "NYU"], correct: 1 },
  { q: "What is the QuickLoan App built with?", options: ["Vue + Django", "React + FastAPI", "Angular + Node", "Svelte + Flask"], correct: 1 },
  { q: "What is his favorite movie?", options: ["Inception", "Interstellar", "The Matrix", "Tenet"], correct: 1 },
  { q: "Which city does he love to visit?", options: ["Kathmandu", "Pokhara", "Lumbini", "Chitwan"], correct: 1 },
  { q: "What does BudgetTracker use?", options: ["React", "Python + File I/O", "Java", "C#"], correct: 1 },
  { q: "His favorite song is by which artist?", options: ["Pritam", "Dixita Karki", "A.R. Rahman", "Taylor Swift"], correct: 1 },
  { q: "What is his major?", options: ["Electrical Engineering", "Computer Science", "Data Science", "Mathematics"], correct: 1 }
];

(function initQuiz() {
  const startBtn = document.getElementById('quiz-start');
  const nextBtn = document.getElementById('quiz-next');
  const questionEl = document.getElementById('quiz-question');
  const choicesEl = document.getElementById('quiz-choices');
  const scoreEl = document.getElementById('quiz-score');
  const resultEl = document.getElementById('quiz-result');

  let quizIndex = 0;
  let quizScore = 0;
  let answered = false;

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function showEl(el, show) {
    if (!el) return;
    if (show) el.classList.remove('hidden'); else el.classList.add('hidden');
  }

  function renderQuestion() {
    if (quizIndex >= QUIZ_QUESTIONS.length) {
      questionEl.textContent = "Quiz complete!";
      choicesEl.innerHTML = '';
      showEl(nextBtn, false);
      showEl(startBtn, true);
      startBtn.textContent = 'Play Again';
      resultEl.classList.remove('hidden');
      resultEl.innerHTML = `<strong>Your score: ${quizScore} / ${QUIZ_QUESTIONS.length}</strong><br>${quizScore === QUIZ_QUESTIONS.length ? 'Perfect! You know Rishikesh well.' : quizScore >= QUIZ_QUESTIONS.length / 2 ? 'Nice job! Explore the portfolio to learn more.' : 'No worries — check out Intro and Projects!'}`;
      return;
    }
    const item = QUIZ_QUESTIONS[quizIndex];
    questionEl.textContent = item.q;
    const opts = item.options.map((o, i) => ({ text: o, index: i }));
    const shuffled = shuffle(opts);
    choicesEl.innerHTML = shuffled.map((opt, i) =>
      `<button type="button" class="game-choice" data-index="${opt.index}">${opt.text}</button>`
    ).join('');
    choicesEl.querySelectorAll('.game-choice').forEach(btn => {
      btn.addEventListener('click', () => handleChoice(parseInt(btn.dataset.index, 10)));
    });
    scoreEl.textContent = `Score: ${quizScore} / ${quizIndex}`;
    resultEl.classList.add('hidden');
    resultEl.innerHTML = '';
    answered = false;
    showEl(nextBtn, false);
  }

  function handleChoice(selectedIndex) {
    if (answered) return;
    answered = true;
    const item = QUIZ_QUESTIONS[quizIndex];
    const isCorrect = selectedIndex === item.correct;
    if (isCorrect) quizScore++;
    scoreEl.textContent = `Score: ${quizScore} / ${quizIndex + 1}`;
    const buttons = choicesEl.querySelectorAll('.game-choice');
    buttons.forEach((btn, i) => {
      const idx = parseInt(btn.dataset.index, 10);
      btn.disabled = true;
      if (idx === item.correct) btn.classList.add('correct');
      else if (idx === selectedIndex && !isCorrect) btn.classList.add('wrong');
    });
    showEl(nextBtn, true);
  }

  if (startBtn) {
    startBtn.addEventListener('click', () => {
      quizIndex = 0;
      quizScore = 0;
      showEl(resultEl, false);
      resultEl.innerHTML = '';
      startBtn.classList.add('hidden');
      nextBtn.classList.remove('hidden');
      nextBtn.textContent = 'Next Question';
      renderQuestion();
    });
  }
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      quizIndex++;
      renderQuestion();
      if (quizIndex >= QUIZ_QUESTIONS.length) nextBtn.classList.add('hidden');
    });
  }
})();


// 5 VOICE ASSISTANT (Alexa-style for portfolio)
const VoiceAssistant = (function() {
  const voiceBtn = document.getElementById('voice-btn');
  const voiceStatus = document.getElementById('voice-status');
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const synth = window.speechSynthesis;

  const THEMES = {
    cyan: { primary: '#00d2ff', secondary: '#3a7bd5' },
    blue: { primary: '#4dabf7', secondary: '#228be6' },
    purple: { primary: '#9775fa', secondary: '#7950f2' },
    green: { primary: '#51cf66', secondary: '#37b24d' },
    red: { primary: '#ff6b6b', secondary: '#fa5252' },
    orange: { primary: '#ff922b', secondary: '#fd7e14' },
    pink: { primary: '#f06595', secondary: '#e64980' },
    teal: { primary: '#20c997', secondary: '#0ca678' },
    yellow: { primary: '#ffd43b', secondary: '#fab005' }
  };

  const ABOUT_RISHI = "Rishikesh Bastakoti is a Computer Science student at Caldwell University, class of 2028. He's from Kathmandu, Nepal, and is building a career in software development. He's built a full-stack QuickLoan app with React and FastAPI, and a Python Budget Tracker. He loves web development, algorithms, and in his free time enjoys the song Timi Ra Ma by Dixita Karki, the movie Interstellar, and the city of Pokhara.";

  const HELP_PHRASE = "You can ask me: Who is Rishikesh, or tell me about him. Ask what's the weather or time in Kathmandu. Say play music or pause. Say change color to blue, red, green, purple, orange, pink, teal, or yellow. Or say show projects, games, contact, education, hometown, or favorites.";

  function speak(text) {
    if (!synth) return;
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.9;
    u.pitch = 1;
    synth.cancel();
    synth.speak(u);
  }

  function applyTheme(name) {
    const theme = THEMES[name];
    if (!theme) return false;
    document.documentElement.style.setProperty('--primary-color', theme.primary);
    document.documentElement.style.setProperty('--secondary-color', theme.secondary);
    return true;
  }

  function switchTab(targetId) {
    const tab = document.querySelector(`.tabs li[data-target="${targetId}"]`);
    if (!tab) return false;
    tabs.forEach((t) => t.classList.remove('active'));
    tabContents.forEach((content) => content.classList.remove('active'));
    tab.classList.add('active');
    const el = document.getElementById(targetId);
    if (el) el.classList.add('active');
    return true;
  }

  function handleCommand(text, forChat) {
    const t = text.toLowerCase().trim();
    function reply(msg) {
      if (!forChat) speak(msg);
      return forChat ? msg : true;
    }

    // Greetings
    if (/^(hi|hello|hey|yo|sup|what'?s up|howdy|good morning|good afternoon|good evening)\s*\.?$/.test(t)) {
      return reply("Hi. Ask me about Rishikesh, or try commands like play music, change color, or show projects.");
    }

    // About Rishikesh
    if (/\b(who is|tell me about|about)\s*(rishi|rishikesh|him|this (guy|person)|the (owner|developer))\b/.test(t) || 
        /^(who('?s| is) (rishi|this)|introduce (rishi|him)|describe (rishi|him))\b/.test(t)) {
      return reply(ABOUT_RISHI);
    }

    // Weather
    if (/\b(weather|temperature|how('?s| is) (the )?weather|what'?s (the )?weather|weather in (kathmandu|nepal)?)\b/.test(t) || t === "what's the weather") {
      if (lastWeather.temp != null) {
        return reply(`In Kathmandu it's ${Math.round(lastWeather.temp)}°C, wind ${Math.round(lastWeather.wind)} km/h.`);
      }
      if (!forChat) {
        speak("Checking the weather for Kathmandu. One moment.");
        getWeather().then(() => {
          if (lastWeather.temp != null) speak(`In Kathmandu it's ${Math.round(lastWeather.temp)}°C.`);
          else speak("Weather is unavailable right now.");
        });
      }
      return reply("Checking weather for Kathmandu…");
    }

    // Time
    if (/\b(time|what('?s| is) (the )?time|current time|time in (kathmandu|nepal)?)\b/.test(t) || t === "what time is it") {
      const { timeStr, dateStr } = getNepalTimeForVoice();
      return reply(`In Kathmandu it's ${timeStr}. ${dateStr}.`);
    }

    // Help
    if (/\b(help|what can you do|commands|what do you do|how do (you|i) (work|use this)|what (can i|should i) say)\b/.test(t)) {
      return reply(HELP_PHRASE);
    }

    // Play music
    if (/(play|start)\s*(the\s*)?(music|song)/.test(t) || t === 'play' || t === 'play music') {
      if (!isPlaying) { togglePlay(); return reply('Playing music.'); }
      return reply('Music is already playing.');
    }

    // Pause music
    if (/(pause|stop)\s*(the\s*)?(music|song)?/.test(t) || t === 'pause' || t === 'stop') {
      if (isPlaying) { togglePlay(); return reply('Music paused.'); }
      return reply('Music is already paused.');
    }

    // Color / theme (e.g. "change color to red", "color change to red", "make it blue")
    const colorMatch = t.match(/(?:change\s*(?:color\s*)?to\s*|color\s*change\s*to\s*|make\s*it\s*|set\s*to\s*|switch\s*to\s*|theme\s*)(cyan|blue|purple|green|red|orange|pink|teal|yellow)/i) ||
                       t.match(/(cyan|blue|purple|green|red|orange|pink|teal|yellow)\s*(theme|color)?/i);
    if (colorMatch) {
      const color = (colorMatch[2] || colorMatch[1]).toLowerCase();
      if (THEMES[color] && applyTheme(color)) {
        return reply(`Theme changed to <b>${color}</b>.`);
      }
    }

    // Tab switching
    const tabMap = { intro: 'intro', projects: 'projects', education: 'education', hometown: 'hometown', favorites: 'favorites', games: 'games', contact: 'contact' };
    for (const [keyword, id] of Object.entries(tabMap)) {
      if (t.includes(keyword) && (t.includes('show') || t.includes('go') || t.includes('open') || t.includes('switch') || t.includes('take me'))) {
        if (switchTab(id)) return reply(`Opening <b>${keyword}</b>.`);
      }
    }
    if (/(show|go\s*to|open|switch to)\s*(intro|projects|education|hometown|favorites|games|contact)/.test(t)) {
      const id = t.match(/(intro|projects|education|hometown|favorites|games|contact)/)[1];
      if (switchTab(id)) return reply(`Opening <b>${id}</b>.`);
    }

    return false;
  }

  function startListening() {
    if (!SpeechRecognition) {
      speak('Voice recognition is not supported in this browser. Try Chrome or Edge.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 3;

    recognition.onstart = () => {
      if (voiceBtn) voiceBtn.classList.add('listening');
      if (voiceStatus) { voiceStatus.textContent = 'Listening... speak now'; voiceStatus.classList.add('active'); }
    };

    recognition.onend = () => {
      if (voiceBtn) voiceBtn.classList.remove('listening');
      if (voiceStatus) voiceStatus.classList.remove('active');
    };

    recognition.onspeechstart = () => {
      if (voiceStatus) voiceStatus.textContent = 'Hearing you...';
    };

    recognition.onresult = (e) => {
      const result = e.results[e.results.length - 1];
      const transcript = (result[0]?.transcript || '').trim();
      const isFinal = result.isFinal;

      if (!transcript) return;
      if (!isFinal) {
        if (voiceStatus) voiceStatus.textContent = '"' + transcript + '"';
        return;
      }
      if (handleCommand(transcript)) return;
      speak("I didn't catch that. Try: Who is Rishikesh, what's the weather, play music, or change color to blue. Say help for more options.");
    };

    recognition.onnomatch = () => {
      speak("I heard something but couldn't match it. Say help to hear what you can ask.");
    };

    let noSpeechRetry = false;

    recognition.onerror = (e) => {
      if (voiceBtn) voiceBtn.classList.remove('listening');
      if (voiceStatus) voiceStatus.classList.remove('active');

      if (e.error === 'no-speech' && !noSpeechRetry) {
        noSpeechRetry = true;
        speak("I didn't hear anything. Try again now — speak right after the beep.");
        setTimeout(() => {
          voiceStatus.textContent = 'Listening again... speak now';
          voiceStatus.classList.add('active');
          voiceBtn.classList.add('listening');
          recognition.start();
        }, 1500);
        return;
      }

      const msg = e.error === 'no-speech'
        ? "I still didn't hear anything. Check that your microphone works and speak clearly right after clicking."
        : e.error === 'not-allowed' || e.error === 'service-not-allowed'
        ? "Microphone access was denied. Please allow the microphone and try again."
        : e.error === 'audio-capture'
        ? "No microphone found. Check your device."
        : e.error === 'network'
        ? "Network error. Check your connection."
        : "Something went wrong. Try again.";
      speak(msg);
    };

    recognition.start();
  }

  if (voiceBtn) {
    voiceBtn.addEventListener('click', startListening);
  }

  const helpBtn = document.getElementById('voice-help-btn');
  const commandsPanel = document.getElementById('voice-commands-panel');
  if (helpBtn && commandsPanel) {
    helpBtn.addEventListener('click', () => commandsPanel.classList.toggle('open'));
    document.addEventListener('click', (e) => {
      if (commandsPanel.classList.contains('open') && !commandsPanel.contains(e.target) && !helpBtn.contains(e.target)) {
        commandsPanel.classList.remove('open');
      }
    });
  }

  return { speak, handleCommand, applyTheme };
})();


// 6 AI CHATBOT LOGIC (Groq Powered)


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

// --- c. SYSTEM PROMPT (improved, modern, helpful) ---
const SYSTEM_PROMPT = `
You are the friendly AI assistant for Rishikesh Bastakoti's portfolio. Be warm, concise, and helpful. You help visitors learn about Rishikesh and his work.

WHO YOU ARE
- Refer to yourself in first person ("I'm Rishi's assistant").
- Refer to Rishikesh in third person ("He", "Rishikesh").
- Never say you are an AI model or mention training. You are "Rishikesh's digital assistant."

FACTS (use only these)
- Education: Sophomore, Computer Science, Caldwell University (Class of 2028). High school: National School of Sciences, Kathmandu.
- From: Kathmandu, Nepal; now in Caldwell, NJ, USA.
- Tech: Python, JavaScript, React, FastAPI, SQL/SQLAlchemy, HTML5, CSS3.
- Projects: (1) QuickLoan App — full-stack, React + FastAPI + SQLAlchemy. (2) BudgetTracker — Python, data structures, file I/O.
- Interests: Web development, algorithms, AI/ML.
- Personal: Favorite song "Timi Ra Ma" by Dixita Karki, movie Interstellar, city Pokhara.

STYLE
- Keep replies short (2–4 sentences unless they ask for more). Be conversational, not robotic.
- After answering, sometimes suggest a follow-up: e.g. "Want to hear about his projects?" or "You can try the Games tab to quiz yourself about him."
- Use HTML only: <b>bold</b>. No markdown. Links: <a href="https://www.linkedin.com/in/rbastakoti1/" target="_blank">LinkedIn</a>, <a href="https://github.com/reseekesh821" target="_blank">GitHub</a>.

GREETINGS
If they say Hi, Hello, Hey, Sup, Yo, etc., reply warmly and invite them to ask about Rishikesh, his projects, or to try the voice assistant and Games section.

OUT-OF-SCOPE
If the question isn’t about Rishikesh: give a brief direct answer, suggest Google/Wikipedia, and if relevant add a fun tie-in to Rishikesh (e.g. "Fun fact: he’s from Kathmandu.").

UNKNOWN FACTS
If you don’t know: "I don’t have that detail — you can reach out on his LinkedIn!"

RUDENESS
Stay calm and redirect: "I’m here to tell you about Rishikesh. What would you like to know?"

GOODBYE
"Bye! Feel free to ask again or check out his Projects and Games tab."
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

  isCoolingDown = true;
  sendBtn.disabled = true;
  userInput.value = '';
  if (quickRepliesContainer) quickRepliesContainer.style.display = 'none';
  addMessage(text, 'user-message');

  // Run portfolio commands first (color, play music, show tab, etc.)
  const commandReply = VoiceAssistant && VoiceAssistant.handleCommand(text, true);
  if (commandReply !== false && typeof commandReply === 'string') {
    addMessage(commandReply, 'bot-message');
    if (quickRepliesContainer) {
      quickRepliesContainer.style.display = 'flex';
      chatMessages.appendChild(quickRepliesContainer);
    }
    chatMessages.scrollTop = chatMessages.scrollHeight;
    setTimeout(() => { isCoolingDown = false; sendBtn.disabled = false; }, 600);
    return;
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

