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

// 5. Advanced Chatbot Logic
const chatToggle = document.getElementById('chat-toggle-btn');
const chatBox = document.getElementById('chat-box');
const closeChat = document.getElementById('close-chat');
const sendBtn = document.getElementById('send-btn');
const userInput = document.getElementById('user-input');
const chatMessages = document.getElementById('chat-messages');
const typingIndicator = document.getElementById('typing-indicator');
const quickRepliesContainer = document.getElementById('quick-replies');

if(chatToggle) {
  chatToggle.addEventListener('click', () => chatBox.classList.toggle('open'));
}

if(closeChat) {
  closeChat.addEventListener('click', () => chatBox.classList.remove('open'));
}

const knowledgeBase = {
  "greetings": {
    keywords: ["hello", "hi", "hey", "sup", "yo", "greeting", "morning", "evening"],
    answer: "Hello! I'm Rishi's virtual assistant. I can tell you about his <b>Education</b>, <b>Projects</b>, or <b>Skills</b>. What would you like to know?"
  },
  "howareyou": {
    keywords: ["how are you", "how are things", "how you doing", "what's up"],
    answer: "I'm just a bot, but I'm functioning perfectly! Thanks for asking. How can I help you explore Rishi's portfolio?"
  },
  "bye": {
    keywords: ["bye", "goodbye", "see you", "later", "cya", "exit", "close"],
    answer: "Goodbye! Thanks for visiting. Feel free to reach out via the Contact tab if you need anything!"
  },
  "thanks": {
    keywords: ["thank", "thx", "appreciate", "cool", "nice", "awesome", "good job"],
    answer: "You're welcome! I'll pass the compliment along to Rishi."
  },
  "identity": {
    keywords: ["who are you", "what are you", "bot", "assistant", "real person"],
    answer: "I am a custom-built chatbot created by Rishi using JavaScript to answer your questions instantly!"
  },
  "rishi": {
    keywords: ["who is rishi", "who is rishikesh", "about rishi", "about rishikesh", "tell me about yourself", "bio", "intro", "author", "creator"],
    answer: "Rishikesh is a Computer Science student at Caldwell University. He is from Kathmandu, Nepal, and is passionate about Full-Stack Development and Python."
  },
  "hometown": {
    keywords: ["where are you from", "where is rishi from", "where is rishikesh from", "nepal", "kathmandu", "origin", "country", "born", "hometown"],
    answer: "Rishi is from <b>Kathmandu, Nepal</b> 🇳🇵. He is currently studying in the USA. Check the Hometown tab for live weather data from Nepal!"
  },
  "education": {
    keywords: ["university", "college", "caldwell", "school", "degree", "major", "study", "sophomore", "graduate", "class"],
    answer: "He is currently a <b>Sophomore</b> pursuing a B.S. in Computer Science at <b>Caldwell University</b> (New Jersey). He expects to graduate in 2028."
  },
  "projects": {
    keywords: ["project", "work", "portfolio", "built", "make", "creation", "app"],
    answer: "Rishikesh has built several cool things! His featured projects are: <br>1. <b>QuickLoan App</b> (Full Stack)<br>2. <b>BudgetTracker</b> (Python)<br>Which one do you want details on?"
  },
  "quickloan": {
    keywords: ["quickloan", "loan", "lending", "fastapi"],
    answer: "<b>QuickLoan App</b> is a full-stack system designed to streamline borrowing. <br>• <b>Stack:</b> React, Python (FastAPI), SQLAlchemy.<br>• <b>Features:</b> User auth, loan status tracking, and SQL database integration."
  },
  "budget": {
    keywords: ["budget", "tracker", "finance", "money", "spending", "cost"],
    answer: "<b>BudgetTracker</b> is a Python application that helps users track expenses.<br>• <b>Stack:</b> Python, Data Structures, File I/O.<br>• <b>Goal:</b> Visualize spending habits to save money."
  },
  "skills": {
    keywords: ["skill", "stack", "technology", "language", "code", "program", "tech", "coding"],
    answer: "Rishi's technical toolkit includes:<br>• <b>Languages:</b> Python, JavaScript, HTML/CSS, SQL.<br>• <b>Frameworks:</b> React, FastAPI.<br>• <b>Tools:</b> Git, GitHub, VS Code."
  },
  "python": {
    keywords: ["python", "py", "pandas", "numpy"],
    answer: "Python is Rishi's strongest language! He uses it for backend development (FastAPI), automation, and data structures."
  },
  "favorites": {
    keywords: ["favorite", "hobby", "hobbies", "interest", "like", "fun"],
    answer: "Rishi loves coding, but he also enjoys <b>Art History</b>, listening to Nepali music, and watching sci-fi movies."
  },
  "music": {
    keywords: ["music", "song", "listen", "band", "singer", "timi ra ma"],
    answer: "He is currently listening to 'Timi Ra Ma' by Dixita Karki. Go to the <b>Favorites</b> tab to listen along!"
  },
  "movie": {
    keywords: ["movie", "film", "cinema", "interstellar", "show"],
    answer: "His all-time favorite movie is <b>Interstellar</b>. He loves the visuals and the concept of time dilation!"
  },
  "contact": {
    keywords: ["contact", "email", "reach", "message", "talk", "hire", "phone"],
    answer: "You can send him a message using the form in the <b>Contact</b> tab, or connect on <a href='https://www.linkedin.com/in/rbastakoti1' target='_blank' style='color:#00d2ff'>LinkedIn</a>."
  },
  "resume": {
    keywords: ["resume", "cv", "job", "internship", "download", "document"],
    answer: "You can view or download his Resume by clicking the <b>View Resume</b> button in the Contact section."
  },
  "default": {
    answer: "I'm not sure about that one yet. Try asking about <b>Education</b>, <b>Projects</b>, <b>Skills</b>, or <b>Contact Info</b>!"
  }
};

function getSmartResponse(input) {
  const cleanInput = input.toLowerCase().trim();
  if(!cleanInput) return knowledgeBase["default"].answer;

  for (const category in knowledgeBase) {
    if (category === "default") continue;

    const topic = knowledgeBase[category];
    
    // Hybrid Matching: 
    // Short words (<=3 chars) use Regex for exact match (fixes "yo" vs "you").
    // Long words use .includes() for partial match (fixes "project" vs "projects").
    const hasMatch = topic.keywords.some(keyword => {
      if (keyword.length <= 3) {
         return new RegExp(`\\b${keyword}\\b`, 'i').test(cleanInput);
      }
      return cleanInput.includes(keyword);
    });

    if (hasMatch) return topic.answer;
  }

  return knowledgeBase["default"].answer;
}

function sendMessage() {
  const text = userInput.value.trim();
  if (text === "") return;

  addMessage(text, 'user-message');
  userInput.value = '';
  
  if(quickRepliesContainer) quickRepliesContainer.style.display = 'none';
  showTyping();

  setTimeout(() => {
    hideTyping();
    const botReply = getSmartResponse(text);
    addMessage(botReply, 'bot-message');
    
    if(quickRepliesContainer) {
      quickRepliesContainer.style.display = 'flex';
      chatMessages.appendChild(quickRepliesContainer);
    }
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }, 800); 
}

window.handleQuickReply = function(text) {
  userInput.value = text;
  sendMessage();
}

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

if(sendBtn) sendBtn.addEventListener('click', sendMessage);
if(userInput) userInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') sendMessage();
});