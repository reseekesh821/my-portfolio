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

// 5. AI Chatbot Logic (Powered by Gemini)
const GEMINI_API_KEY = "AIzaSyCrbkf7JFPWx6HwHTj1Kr2deJZnbM40GfI"; 
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

const SYSTEM_PROMPT = `
You are the AI portfolio assistant for Rishikesh Bastakoti.
Here are the facts you must know and use:
- Rishikesh is a Computer Science student at Caldwell University (Class of 2028).
- He is from Kathmandu, Nepal.
- He built "QuickLoan" (React/FastAPI) and "BudgetTracker" (Python).
- His favorite movie is Interstellar and he loves the song "Timi Ra Ma".
- He is skilled in Python, JavaScript, React, and SQL.
- If asked about contact, direct them to the Contact tab or LinkedIn.
- Keep answers short, friendly, and under 3 sentences.
`;

// Toggle Chatbox Visibility
if(chatToggle) {
  chatToggle.addEventListener('click', () => chatBox.classList.toggle('open'));
}
if(closeChat) {
  closeChat.addEventListener('click', () => chatBox.classList.remove('open'));
}

// 1. The AI Fetch Function (FIXED & ROBUST)
async function getAIResponse(userMessage) {
  const requestBody = {
    contents: [
      {
        parts: [
          { text: SYSTEM_PROMPT + "\n\nUser Question: " + userMessage }
        ]
      }
    ]
  };

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();

    // ERROR HANDLER 1: API Level Errors
    if (data.error) {
      console.error("AI Error:", data.error);
      return "I can't answer right now. (API Error: " + data.error.message + ")";
    }

    // ERROR HANDLER 2: Safety Blocks / Empty Responses
    // This prevents the code from crashing if the AI refuses to answer
    if (!data.candidates || data.candidates.length === 0 || !data.candidates[0].content) {
      return "I can't answer that specifically, but I can tell you about Rishi's projects!";
    }

    // SUCCESS
    return data.candidates[0].content.parts[0].text;

  } catch (error) {
    console.error("Network Error:", error);
    return "I'm having trouble connecting to the internet right now.";
  }
}