// 1. Tab Switching Logic
const tabs = document.querySelectorAll(".tabs li");
const tabContents = document.querySelectorAll(".tab-content");

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    // Remove active class from all tabs
    tabs.forEach((t) => t.classList.remove("active"));
    tabContents.forEach((content) => content.classList.remove("active"));
    
    // Add active class to the clicked tab
    tab.classList.add("active");
    
    // Show the corresponding content div
    const targetId = tab.getAttribute("data-target");
    document.getElementById(targetId).classList.add("active");
  });
});

// 2. Real-Time Nepal Clock & Date
function updateNepalTime() {
  const clockElement = document.getElementById("nepal-clock");
  const dateElement = document.getElementById("nepal-date");
  
  const now = new Date();

  // Options for Time (Kathmandu Time Zone)
  const timeOptions = { 
    timeZone: "Asia/Kathmandu", 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit',
    hour12: true 
  };

  // Options for Date
  const dateOptions = {
    timeZone: "Asia/Kathmandu",
    weekday: 'long',  // e.g., "Monday"
    year: 'numeric',  // e.g., "2024"
    month: 'long',    // e.g., "January"
    day: 'numeric'    // e.g., "15"
  };

  if (clockElement) {
    clockElement.innerText = now.toLocaleTimeString("en-US", timeOptions);
  }
  
  if (dateElement) {
    dateElement.innerText = now.toLocaleDateString("en-US", dateOptions);
  }
}

// Update clock every 1 second
setInterval(updateNepalTime, 1000);
updateNepalTime();

// 3. Fetch Real Weather for Kathmandu (API Integration)
async function getWeather() {
  const weatherElement = document.getElementById("nepal-weather");
  if (!weatherElement) return;

  try {
    // Fetch weather data from Open-Meteo API
    const response = await fetch("https://api.open-meteo.com/v1/forecast?latitude=27.7172&longitude=85.3240&current_weather=true&temperature_unit=celsius");
    const data = await response.json();

    if (data.current_weather) {
      const temp = data.current_weather.temperature;
      const wind = data.current_weather.windspeed;
      weatherElement.innerText = `${temp}°C (Wind: ${wind} km/h)`;
    } else {
      // Fallback text if API returns empty data
      weatherElement.innerText = "17°C (Fallback)";
    }
  } catch (error) {
    // Fallback text if fetch fails (e.g., no internet)
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

// Your Song URL (Hosted on GitHub)
const songUrl = "https://raw.githubusercontent.com/reseekesh821/music/main/Nachahe%20ko%20Hoina%20-%20The%20Edge%20Band%20I%20Jeewan%20Gurung.mp3"; 

const audio = new Audio(songUrl);
let isPlaying = false;

// Function to Toggle Play/Pause
function togglePlay() {
  if (isPlaying) {
    audio.pause();
    playIcon.innerText = "▶"; // Show Play icon
    isPlaying = false;
  } else {
    audio.play();
    playIcon.innerText = "⏸"; // Show Pause icon
    isPlaying = true;
  }
}

playBtn.addEventListener('click', togglePlay);

// Update Progress Bar & Time Stamps
audio.addEventListener('timeupdate', (e) => {
  const { duration, currentTime } = e.srcElement;
  
  if (isNaN(duration)) return;

  // Update visual progress bar width
  const progressPercent = (currentTime / duration) * 100;
  progress.style.width = `${progressPercent}%`;

  // Calculate duration (minutes:seconds)
  const durationMinutes = Math.floor(duration / 60);
  let durationSeconds = Math.floor(duration % 60);
  if (durationSeconds < 10) durationSeconds = `0${durationSeconds}`;
  durTime.innerText = `${durationMinutes}:${durationSeconds}`;

  // Calculate current time (minutes:seconds)
  const currentMinutes = Math.floor(currentTime / 60);
  let currentSeconds = Math.floor(currentTime % 60);
  if (currentSeconds < 10) currentSeconds = `0${currentSeconds}`;
  currTime.innerText = `${currentMinutes}:${currentSeconds}`;
});

// Click on Progress Bar to Seek Audio
progressContainer.addEventListener('click', (e) => {
  const width = progressContainer.clientWidth;
  const clickX = e.offsetX;
  const duration = audio.duration;
  
  audio.currentTime = (clickX / width) * duration;
});

// Reset Player when Song Ends
audio.addEventListener('ended', () => {
  isPlaying = false;
  playIcon.innerText = "▶";
  progress.style.width = "0%";
});

// 5. Advanced Chatbot Logic (Smart Replies & Typing Effect)
const chatToggle = document.getElementById('chat-toggle-btn');
const chatBox = document.getElementById('chat-box');
const closeChat = document.getElementById('close-chat');
const sendBtn = document.getElementById('send-btn');
const userInput = document.getElementById('user-input');
const chatMessages = document.getElementById('chat-messages');
const typingIndicator = document.getElementById('typing-indicator');
const quickRepliesContainer = document.getElementById('quick-replies');

// Toggle Chat Visibility
chatToggle.addEventListener('click', () => {
  chatBox.classList.toggle('open');
});

closeChat.addEventListener('click', () => {
  chatBox.classList.remove('open');
});

// Knowledge Base (The "Brain" of the bot)
const knowledgeBase = {
  "hello": "Hello! I hope you are having a great day. Ask me about my <b>projects</b> or <b>skills</b>!",
  "hi": "Hi there! How can I help you?",
  "projects": "I have worked on the <b>QuickLoan App</b> (React/Python) and a <b>BudgetTracker</b> (Python). Which one do you want to know more about?",
  "quickloan": "The QuickLoan App is a full-stack project using React, FastAPI, and SQLAlchemy. It streamlines loan applications.",
  "budget": "The BudgetTracker is a Python tool that helps track expenses and visualize spending habits.",
  "skills": "My technical skills include: <br>• Python & JavaScript<br>• React & HTML/CSS<br>• SQL & Data Structures.",
  "contact": "You can reach me via the <b>Contact Tab</b> or message me on <a href='https://www.linkedin.com/in/rbastakoti1' target='_blank' style='color:#00d2ff'>LinkedIn</a>.",
  "nepal": "Yes! I am from Kathmandu, Nepal. Check out the Hometown tab for a live map!",
  "default": "I'm not sure about that. Try asking about <b>Projects</b>, <b>Skills</b>, or <b>Contact</b>."
};

// Function to Send Message
function sendMessage() {
  const text = userInput.value.trim();
  if (text === "") return;

  // Add user's message to chat
  addMessage(text, 'user-message');
  userInput.value = '';
  
  // Hide quick reply chips while thinking
  if(quickRepliesContainer) quickRepliesContainer.style.display = 'none';

  // Show "Typing..." animation
  showTyping();

  // Simulate "Thinking" delay (1 second)
  setTimeout(() => {
    hideTyping();
    const botReply = getSmartResponse(text);
    addMessage(botReply, 'bot-message');
    
    // Show quick reply chips again
    if(quickRepliesContainer) {
      quickRepliesContainer.style.display = 'flex';
      // Move chips to the very bottom of chat
      chatMessages.appendChild(quickRepliesContainer);
    }
    
    // Auto-scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }, 1000); 
}

// Function to handle Quick Reply Chips (Global scope)
window.handleQuickReply = function(text) {
  userInput.value = text;
  sendMessage();
}

// Helper to add message bubbles to DOM
function addMessage(text, className) {
  const div = document.createElement('div');
  div.classList.add('message', className);
  div.innerHTML = text; // innerHTML allows bold tags like <b>
  
  // Insert message before chips if they exist
  if (quickRepliesContainer && chatMessages.contains(quickRepliesContainer)) {
    chatMessages.insertBefore(div, quickRepliesContainer);
  } else {
    chatMessages.appendChild(div);
  }
  
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Helper to show typing indicator
function showTyping() {
  if(typingIndicator) {
    typingIndicator.style.display = 'block';
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
}

// Helper to hide typing indicator
function hideTyping() {
  if(typingIndicator) typingIndicator.style.display = 'none';
}

// Logic to pick the best response based on keywords
function getSmartResponse(input) {
  input = input.toLowerCase();
  
  // Specific Matching Logic
  if (input.includes('quick') || input.includes('loan')) return knowledgeBase["quickloan"];
  if (input.includes('budget') || input.includes('tracker')) return knowledgeBase["budget"];
  if (input.includes('skill') || input.includes('language') || input.includes('stack')) return knowledgeBase["skills"];
  if (input.includes('contact') || input.includes('email') || input.includes('hire')) return knowledgeBase["contact"];
  if (input.includes('nepal') || input.includes('kathmandu') || input.includes('from')) return knowledgeBase["nepal"];
  
  // General Keyword Matching Loop
  for (let key in knowledgeBase) {
    if (input.includes(key)) {
      return knowledgeBase[key];
    }
  }
  
  return knowledgeBase["default"];
}

// Event Listeners for Chat Input
if(sendBtn) sendBtn.addEventListener('click', sendMessage);

if(userInput) userInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    sendMessage();
  }
});