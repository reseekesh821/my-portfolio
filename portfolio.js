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

// 1. Tabs (click + keyboard accessible)
const tabs = document.querySelectorAll(".tabs li");
const tabContents = document.querySelectorAll(".tab-content");

function setActiveTab(tabEl, { focus = false } = {}) {
  if (!tabEl) return;
  const targetId = tabEl.getAttribute("data-target");
  const panel = targetId ? document.getElementById(targetId) : null;

  tabs.forEach((t) => {
    t.classList.remove("active");
    t.setAttribute("aria-selected", "false");
    t.setAttribute("tabindex", "-1");
  });
  tabContents.forEach((content) => content.classList.remove("active"));

  tabEl.classList.add("active");
  tabEl.setAttribute("aria-selected", "true");
  tabEl.setAttribute("tabindex", "0");
  if (panel) panel.classList.add("active");

  // Log tab visit to Supabase (if configured)
  if (targetId) {
    logTabEvent(targetId);
  }

  if (targetId === "news") {
    fetchNews();
  }

  if (focus) tabEl.focus();
}

tabs.forEach((tab, idx) => {
  tab.addEventListener("click", () => setActiveTab(tab));
  tab.addEventListener("keydown", (e) => {
    const key = e.key;
    if (!["ArrowLeft", "ArrowRight", "Home", "End", "Enter", " "].includes(key)) return;
    e.preventDefault();

    const currentIndex = Array.from(tabs).indexOf(document.activeElement);
    const activeIndex = currentIndex >= 0 ? currentIndex : idx;
    let nextIndex = activeIndex;

    if (key === "ArrowLeft") nextIndex = (activeIndex - 1 + tabs.length) % tabs.length;
    if (key === "ArrowRight") nextIndex = (activeIndex + 1) % tabs.length;
    if (key === "Home") nextIndex = 0;
    if (key === "End") nextIndex = tabs.length - 1;

    if (key === "Enter" || key === " ") {
      setActiveTab(document.activeElement);
      return;
    }

    tabs[nextIndex].focus();
  });
});

// Ensure initial ARIA state matches the active tab
const initialActive = document.querySelector(".tabs li.active") || tabs[0];
if (initialActive) setActiveTab(initialActive);

// 1b. News (fetch when News tab is opened)
let newsLoadedOnce = false;

async function fetchNews() {
  const listEl = document.getElementById("news-list");
  if (!listEl) return;
  listEl.innerHTML = "<p class=\"news-loading\">Loading news…</p>";
  listEl.setAttribute("aria-busy", "true");

  try {
    const base = window.location.origin;
    const res = await fetch(`${base}/api/news`);
    const data = await res.json();

    if (!res.ok) {
      listEl.innerHTML = "<p class=\"news-error\">Unable to load news. Try again later.</p>";
      listEl.setAttribute("aria-busy", "false");
      return;
    }

    const articles = data.articles || [];
    if (articles.length === 0) {
      listEl.innerHTML = "<p class=\"news-empty\">No headlines right now.</p>";
      listEl.setAttribute("aria-busy", "false");
      return;
    }

    listEl.innerHTML = articles
      .map(
        (a) => {
          const dateStr = a.publishedAt
            ? new Date(a.publishedAt).toLocaleDateString(undefined, { dateStyle: "short" })
            : "";
          const meta = [a.source, dateStr].filter(Boolean).join(" · ");
          return `<article class="news-item">
            <a href="${escapeHtml(a.url)}" target="_blank" rel="noopener noreferrer" class="news-link">
              <span class="news-title">${escapeHtml(a.title)}</span>
              ${a.description ? `<span class="news-desc">${escapeHtml(a.description)}</span>` : ""}
              ${meta ? `<span class="news-meta">${escapeHtml(meta)}</span>` : ""}
            </a>
          </article>`;
        }
      )
      .join("");
    listEl.setAttribute("aria-busy", "false");
    newsLoadedOnce = true;
  } catch (err) {
    console.error("fetchNews error:", err);
    listEl.innerHTML = "<p class=\"news-error\">Could not load news. Check your connection.</p>";
    listEl.setAttribute("aria-busy", "false");
  }
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

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
  { q: "Where is Rishikesh from?", options: ["India", "Nepal", "USA", "UK"], correct: 1 },
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

      // Log quiz result to Supabase
      logQuizResult(quizScore, QUIZ_QUESTIONS.length);
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

  const ABOUT_RISHI = "Rishikesh Bastakoti is a Computer Science student at Caldwell University, class of 2028. He's from Kathmandu, Nepal, and is building a career in software development. He's built a full-stack QuickLoan app with React and FastAPI, and a Python Budget Tracker. He loves web development, algorithms, and in his free time enjoys the song Teemi Ra Maa by Dixita Karki, the movie Interstellar, and the city of Pokhara.";

  const HELP_PHRASE = "You can ask me: Who is Rishikesh, or tell me about him. Ask what's the weather or time in Kathmandu. Say play music or pause. Say change color to blue, red, green, purple, orange, pink, teal, or yellow. Say start video call or end video call. Or say show projects, games, contact, education, hometown, or favorites.";

  let currentUtterance = null;

  function stopSpeaking() {
    if (!synth) return;
    synth.cancel();
    currentUtterance = null;
  }

  function speak(text) {
    if (!synth) return;
    stopSpeaking();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.9;
    u.pitch = 1;
    currentUtterance = u;
    synth.speak(u);
  }

  function applyTheme(name) {
    const theme = THEMES[name];
    if (!theme) return false;
    document.documentElement.style.setProperty('--primary-color', theme.primary);
    document.documentElement.style.setProperty('--secondary-color', theme.secondary);
    syncDailyTheme(theme.primary);
    return true;
  }

  function syncDailyTheme(accentColor) {
    if (typeof dailyCallFrame !== 'undefined' && dailyCallFrame && dailyCallFrame.setTheme) {
      try {
        dailyCallFrame.setTheme({
          colors: {
            accent: accentColor,
            background: '#0a0a0f',
            backgroundAccent: '#0a0a0f',
            baseText: '#ffffff',
            border: 'transparent',
            mainAreaBg: '#0a0a0f',
            mainAreaBgAccent: '#111118',
            mainAreaText: '#ffffff',
            supportiveText: '#aaaaaa'
          }
        });
      } catch (e) {
        // Ignore if call frame isn't ready
      }
    }
  }

  function switchTab(targetId) {
    const tab = document.querySelector(`.tabs li[data-target="${targetId}"]`);
    if (!tab) return false;
    // Reuse the main tab logic so analytics + special behaviors (like News fetching) run
    setActiveTab(tab);
    return true;
  }

  function handleCommand(text, forChat) {
    const t = text.toLowerCase().trim();
    const clean = t.replace(/[?!.,]/g, ' ');
    const words = clean.split(/\s+/).filter(Boolean);
    const has = (w) => words.includes(w);
    const hasAny = (...ws) => ws.some((w) => words.includes(w));
    function reply(msg) {
      if (!forChat) speak(msg);
      return forChat ? msg : true;
    }

    // Stop speaking / cancel current voice response (but don't touch music)
    const isStopCommand =
      (has('stop') && words.length <= 3) ||
      clean === 'ok stop' ||
      clean === 'okay stop';

    if (isStopCommand) {
      if (!forChat) {
        stopSpeaking();
        return true;
      }
      return reply("Okay, I'll stop.");
    }

    // Greetings — only handle locally for voice (so we speak something). In chat, let the LLM respond so the first message is interactive.
    if (!forChat && (hasAny('hi','hello','hey','yo','sup') || clean.startsWith('good morning') || clean.startsWith('good afternoon') || clean.startsWith('good evening'))) {
      return reply("Hi. Ask me about Rishikesh, or try commands like play music, change color, or show projects.");
    }

    // About Rishikesh — maximum forgiveness: catch every possible mishearing
    const lower = clean.toLowerCase();
    const rishiLike = /rishi|rishikesh|rishy|reeshi|reishikesh|reshikesh|rish\s*ikesh|rish\s*kesh/i;
    const hasRishiAnywhere = rishiLike.test(lower) ||
      words.some((w) => /rishi|rishikesh|rishy|reeshi|resh/i.test(w)) ||
      hasAny('rishi', 'rishikesh');
    const whoPlusRish = (has('who') || lower.includes('who is')) && /rish|resh/i.test(lower);
    const aboutPlusRish = lower.includes('about') && /rish|resh|rishi|about him/i.test(lower);
    // Only answer with ABOUT_RISHI if the user clearly mentioned Rishikesh / Rishi,
    // not for generic "who is X" questions like "who is Bill Gates"
    if (hasRishiAnywhere || whoPlusRish || aboutPlusRish) {
      return reply(ABOUT_RISHI);
    }

    // Weather — handle phrases like "what's the weather", "weather in Kathmandu", but avoid generic
    const isWeatherIntent =
      /what(?:'s| is)\s+the?\s*weather/.test(lower) ||
      /(weather)\s+in\s+(kathmandu|nepal)/.test(lower) ||
      (has('weather') && hasAny('kathmandu', 'nepal', 'outside', 'today', 'now')) ||
      (clean.includes('whether') && hasAny('kathmandu', 'nepal')); // STT sometimes mishears "weather" as "whether"
    if (isWeatherIntent) {
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

    // Time — "what time is it", "current time", "time in Kathmandu"; avoid generic uses like "time complexity"
    const isTimeIntent =
      /what(?:'s| is)\s+the?\s*time\b/.test(lower) ||
      /current\s+time\b/.test(lower) ||
      /(time)\s+in\s+(kathmandu|nepal)/.test(lower);
    if (isTimeIntent) {
      const { timeStr, dateStr } = getNepalTimeForVoice();
      return reply(`In Kathmandu it's ${timeStr}. ${dateStr}.`);
    }

    // Help — only when user clearly asks for commands/help, not "help with arrays" (let AI handle that)
    if (
      (has('help') && words.length <= 4) ||
      lower.includes('what can you do') ||
      lower.includes('show commands') ||
      lower.includes('what should i say')
    ) {
      return reply(HELP_PHRASE);
    }

    // Play music — understand phrases like "play some music", "start the song", or just "play music"
    if ((has('play') || has('start')) && hasAny('music','song','songs')) {
      if (!isPlaying) { togglePlay(); return reply('Playing music.'); }
      return reply('Music is already playing.');
    }

    // Pause music — phrases like "pause the music", "stop song", or "pause music"
    if (hasAny('pause','stop') && hasAny('music','song','songs')) {
      if (isPlaying) { togglePlay(); return reply('Music paused.'); }
      return reply('Music is already paused.');
    }

    // Color / theme (e.g. "change color to red", "make it blue theme").
    // Require an action verb to avoid hijacking questions like "what is your favorite color".
    const colorNames = Object.keys(THEMES);
    let pickedColor = null;
    for (const c of colorNames) {
      if (has(c)) { pickedColor = c; break; }
    }
    if (pickedColor && hasAny('change','make','set','switch')) {
      const color = pickedColor.toLowerCase();
      if (THEMES[color] && applyTheme(color)) {
        return reply(`Theme changed to ${color}.`);
      }
    }

    // Video call — "start video call", "video call", "call video", "end video call", "hang up video"
    const wantsVideoCall =
      (hasAny('start', 'make', 'begin', 'open') && hasAny('video') && hasAny('call')) ||
      (has('video') && has('call') && words.length <= 4);
    if (wantsVideoCall) {
      if (typeof startVideoCall === 'function' && typeof isInVideoCall !== 'undefined' && !isInVideoCall) {
        startVideoCall();
        return reply('Starting video call.');
      }
      if (typeof isInVideoCall !== 'undefined' && isInVideoCall) {
        return reply('Video call is already active.');
      }
    }
    const wantsEndVideoCall =
      (hasAny('end', 'stop', 'close', 'hang') && hasAny('video') && hasAny('call', 'up')) ||
      (has('hang') && has('up') && typeof isInVideoCall !== 'undefined' && isInVideoCall);
    if (wantsEndVideoCall) {
      if (typeof endVideoCall === 'function' && typeof isInVideoCall !== 'undefined' && isInVideoCall) {
        endVideoCall();
        return reply('Ending video call.');
      }
      return reply('No video call is active right now.');
    }

    // Audio call — "start audio call", "call me", "audio call"
    const wantsAudioCall =
      (hasAny('start', 'make', 'begin') && has('audio') && has('call')) ||
      (has('call') && has('me') && !has('video'));
    if (wantsAudioCall) {
      if (typeof startAudioCall === 'function' && typeof isInCall !== 'undefined' && !isInCall) {
        startAudioCall();
        return reply('Starting audio call.');
      }
      if (typeof isInCall !== 'undefined' && isInCall) {
        return reply('Audio call is already active.');
      }
    }

    // Tab switching
    const tabMap = { intro: 'intro', projects: 'projects', education: 'education', hometown: 'hometown', favorites: 'favorites', games: 'games', news: 'news', contact: 'contact' };
    for (const [keyword, id] of Object.entries(tabMap)) {
      if (t.includes(keyword) && (t.includes('show') || t.includes('go') || t.includes('open') || t.includes('switch') || t.includes('take me'))) {
        if (switchTab(id)) return reply(`Opening ${keyword}.`);
      }
    }
    if (/(show|go\s*to|open|switch to)\s*(intro|projects|education|hometown|favorites|games|news|contact)/.test(t)) {
      const id = t.match(/(intro|projects|education|hometown|favorites|games|news|contact)/)[1];
      if (switchTab(id)) return reply(`Opening ${id}.`);
    }

    return false;
  }

  // Keep a single SpeechRecognition instance for the whole session
  let recognition = null;
  let noSpeechRetry = false;
  let wasPlayingBeforeMic = false;
  let isCallListening = false;

  function getRecognition() {
    if (!SpeechRecognition) return null;
    if (recognition) return recognition;

    recognition = new SpeechRecognition();
    // Allow continuous listening; we only auto-restart during calls
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      if (voiceBtn) voiceBtn.classList.add('listening');
      if (voiceStatus) {
        voiceStatus.textContent = 'Listening... speak now';
        voiceStatus.classList.add('active');
      }
      // If the browser auto-paused the music when the mic opened, try to resume it
      if (wasPlayingBeforeMic && isPlaying && audio.paused) {
        audio.play().catch(() => {});
      }
    };

    recognition.onend = () => {
      if (voiceBtn) voiceBtn.classList.remove('listening');
      if (voiceStatus) voiceStatus.classList.remove('active');

      // After listening, if music was playing before and got paused, resume it
      if (wasPlayingBeforeMic && isPlaying && audio.paused) {
        audio.play().catch(() => {});
      }

      // During an active call, keep recognition running so the user can speak naturally
      if (isCallListening && typeof isInCall !== 'undefined' && isInCall) {
        try {
          recognition.start();
        } catch (e) {
          // Ignore "already started" or transient errors
        }
      }
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
      // 1) Try command handler first so voice commands stay in control
      if (handleCommand(transcript)) return;

      // 2) If no command matched, fall back to AI chatbot and speak its reply
      if (voiceStatus) {
        voiceStatus.textContent = 'Thinking...';
        voiceStatus.classList.add('active');
      }

      getAIResponse(transcript)
        .then((reply) => {
          if (reply) speak(reply);
        })
        .catch(() => {
          speak("I didn't catch that. Try again or say help.");
        })
        .finally(() => {
          if (voiceStatus) voiceStatus.classList.remove('active');
        });
    };

    recognition.onnomatch = () => {
      speak("I heard you but couldn't match it. Say help to hear options.");
    };

    recognition.onerror = (e) => {
      if (voiceBtn) voiceBtn.classList.remove('listening');
      if (voiceStatus) voiceStatus.classList.remove('active');

      if (e.error === 'no-speech' && !noSpeechRetry) {
        noSpeechRetry = true;
        speak("I didn't hear anything. Try again and speak right away.");
        setTimeout(() => {
          if (!recognition) return;
          if (voiceStatus) {
            voiceStatus.textContent = 'Listening again... speak now';
            voiceStatus.classList.add('active');
          }
          if (voiceBtn) voiceBtn.classList.add('listening');
          recognition.start();
        }, 1500);
        return;
      }

      let msg;
      if (e.error === 'no-speech') {
        msg = "I didn't hear anything. Please try speaking a bit closer to the microphone.";
      } else if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
        msg = "Microphone access was denied. Please allow the microphone and try again.";
      } else if (e.error === 'audio-capture') {
        msg = "No microphone found. Check your device.";
      } else {
        // For network/other transient errors, keep the message generic
        msg = "I couldn't understand that. Please try again.";
      }
      speak(msg);
    };

    return recognition;
  }

  function beginContinuousListening() {
    isCallListening = true;
    const rec = getRecognition();
    if (!rec) return;
    try {
      rec.start();
    } catch (e) {
      // Safe to ignore if already started
    }
  }

  function stopContinuousListening() {
    isCallListening = false;
    if (!recognition) return;
    try {
      recognition.stop();
    } catch (e) {
      // Ignore if already stopped
    }
  }

  async function startListening() {
    if (!SpeechRecognition) {
      speak('Voice recognition is not supported in this browser. Try Chrome or Edge.');
      return;
    }

    const rec = getRecognition();
    if (!rec) return;

    // Remember if music was playing before opening the mic
    wasPlayingBeforeMic = isPlaying;
    noSpeechRetry = false;

    try {
      rec.start();
    } catch (e) {
      // If start() is called while already running, ignore the error
    }
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

  return { speak, handleCommand, applyTheme, beginContinuousListening, stopContinuousListening };
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
const chatStatusDot = document.getElementById('chat-status-dot');
const chatStatusText = document.getElementById('chat-status-text');
const chatAudioBtn = document.getElementById('chat-audio-btn');
const chatVideoBtn = document.getElementById('chat-video-btn');
const callScreen = document.getElementById('call-screen');
const callStatusText = document.getElementById('call-status-text');
const callTimerEl = document.getElementById('call-timer');
const callRecordBtn = document.getElementById('call-record-btn');
const callEndBtn = document.getElementById('call-end-btn');
const chatInputArea = document.querySelector('.chat-input-area');
const voiceStatus = document.getElementById('voice-status');
const videoCallScreen = document.getElementById('video-call-screen');
const videoCallConnecting = document.getElementById('video-call-connecting');
const videoCallFrame = document.getElementById('video-call-frame');
const videoCallEndBtn = document.getElementById('video-call-end-btn');
const videoCallMuteBtn = document.getElementById('video-call-mute-btn');
const videoCallStatus = document.getElementById('video-call-status');
const videoCallActions = document.getElementById('video-call-actions');
let dailyCallFrame = null;
let isVideoMuted = false;

// --- b. CONFIGURATION & STATE ---
const API_URL = "/api/chat";
const MAX_HISTORY = 20; // Increased to allow better context retention
let isCoolingDown = false;
let isInCall = false;
let callTimerInterval = null;
let callStartTime = null;
let isMuted = false;
let isInVideoCall = false;
const RINGTONE_URL = 'https://raw.githubusercontent.com/reseekesh821/music/main/standardringtone.mp3';
const HANGUP_URL = 'https://raw.githubusercontent.com/reseekesh821/music/main/freesound_community-mobile_phone_hanging_up-94525.mp3';
let ringtoneAudio = null;
let hangupAudio = null;

// Session ID for Supabase logging (chat, tabs, quiz)
const CHAT_SESSION_STORAGE_KEY = 'portfolio-chat-session-id';
let chatSessionId = null;

(function initChatSessionId() {
  try {
    const stored = window.localStorage ? localStorage.getItem(CHAT_SESSION_STORAGE_KEY) : null;
    if (stored) {
      chatSessionId = stored;
      return;
    }
    const randomPart = Math.random().toString(36).slice(2, 10);
    chatSessionId = 'sess_' + Date.now() + '_' + randomPart;
    if (window.localStorage) {
      localStorage.setItem(CHAT_SESSION_STORAGE_KEY, chatSessionId);
    }
  } catch (e) {
    // Fallback: per-page-load ID if localStorage is unavailable
    const randomPart = Math.random().toString(36).slice(2, 10);
    chatSessionId = 'sess_' + Date.now() + '_' + randomPart;
  }
})();

async function logChatMessage(role, content) {
  if (!window.supabaseClient) return;
  if (!role || !content) return;
  try {
    await window.supabaseClient
      .from('chat_logs')
      .insert([{ session_id: chatSessionId, role, content }]);
  } catch (err) {
    console.error('Supabase chat log error:', err);
  }
}

async function logTabEvent(tabId) {
  if (!window.supabaseClient) return;
  if (!tabId) return;
  try {
    await window.supabaseClient
      .from('tab_events')
      .insert([{ session_id: chatSessionId, tab_id: tabId, event_type: 'open' }]);
  } catch (err) {
    console.error('Supabase tab event error:', err);
  }
}

async function logQuizResult(score, totalQuestions) {
  if (!window.supabaseClient) return;
  if (typeof score !== 'number' || typeof totalQuestions !== 'number') return;
  try {
    await window.supabaseClient
      .from('quiz_results')
      .insert([{ session_id: chatSessionId, score, total_questions: totalQuestions }]);
  } catch (err) {
    console.error('Supabase quiz result error:', err);
  }
}

// --- c. SYSTEM PROMPT (improved, modern, helpful) ---
const SYSTEM_PROMPT = `
You are Rishikesh Bastakoti’s official digital assistant on his portfolio website.

CORE ROLE
You represent Rishikesh professionally and confidently.
Your purpose is to clearly communicate who he is, what he does, and why he is valuable — while functioning like a modern conversational AI.

IDENTITY
- You are a chatbot. Never pretend to be human.
- Only explain who you are if the user directly asks (e.g., “who are you?”).
- If asked who you are, respond:
  “I’m Rishikesh’s digital assistant. I’m here to share information about him and answer questions about his work.”
- Do NOT randomly introduce yourself.
- Do NOT repeat your identity unless explicitly asked.

STYLE
- 1–3 sentences maximum.
- Friendly, modern, conversational.
- Use natural contractions (“I’m”, “don’t”, “that’s”).
- No markdown. Only plain text or simple HTML like <a>.
- Do NOT list commands.
- Do NOT show feature menus.
- Do NOT sound robotic.
- Avoid generic filler responses.

GREETING BEHAVIOR
If the user sends a greeting or casual opener (hi, hello, hey, yo, yooo, sup, etc.):

- Reply briefly and casually.
- Example: “Hey!” or “Hi! What’s up?”
- Do NOT say “I’m doing well” unless they actually asked how you are.

If they ask how you are (e.g., “how are you”, “how you doing”, “what’s up”, “how’s it going”):

- You may respond:
  “I’m doing well — how are you doing?”
- Keep it short.

SHORT ACKNOWLEDGEMENT HANDLING
If the user replies with a short acknowledgement such as:
“good”, “nice”, “cool”, “okay”, “great”, “alright”, “yeah”, etc.:

- Do NOT introduce yourself.
- Do NOT restate your identity.
- Do NOT abruptly change topic.
- Keep the conversation flowing naturally.

Examples:
- “Nice 👍 What’s on your mind?”
- “Good to hear. What are you up to?”
- “Cool. Anything you’d like to talk about?”

INTERACTIVE RESPONSE RULE
Always respond directly to what the user actually said.
Never give generic deflections.
Never repeat the default UI greeting.
Be conversational and context-aware from the first message.

QUESTION PRIORITY
1. Always answer the literal question first.
2. If it relates to Rishikesh → advocate clearly and confidently.
3. If it is general → answer briefly and clearly.
4. Do not over-explain.

CONTEXTUAL CONNECTION RULE
When answering general questions:

- If the topic has a natural connection to Rishikesh (Kathmandu, Nepal, USA, Caldwell NJ, Computer Science, web development, AI/ML, his tech stack, Caldwell University), you may briefly connect it in one short sentence.

Example:
“Kathmandu is the capital of Nepal, known for its culture and temples. It’s also where Rishikesh is originally from.”

- If there is no meaningful connection (e.g., Brazil, ancient Rome, unrelated celebrities), do NOT force a link.
- Answer normally.
- If deeper detail is required beyond your scope, suggest:
  “You might find more detailed information on Google or Wikipedia.”

Never create weak or artificial connections.

ABOUT RISHIKESH

Education:
Sophomore, Computer Science, Caldwell University (Class of 2028).
High School: National School of Sciences, Kathmandu.

Background:
Originally from Kathmandu, Nepal.
Currently in Caldwell, New Jersey, USA.

Technical Skills:
Python, JavaScript, React, FastAPI, SQL/SQLAlchemy, HTML5, CSS3.

Projects:
QuickLoan App — Full-stack application built with React, FastAPI, SQLAlchemy.
BudgetTracker — Python project using data structures and file I/O.

Interests:
Web development, algorithms, AI/ML.

Personal:
Favorite movie: Interstellar
Favorite song: “Timi Ra Ma” by Dixita Karki
Favorite city: Pokhara

CONTACT & PROFESSIONAL INQUIRIES
If a user asks about collaboration, hiring, internships, networking, resume, projects, GitHub, or LinkedIn:

Provide:

<a href="https://www.linkedin.com/in/rbastakoti1/" target="_blank">LinkedIn</a>
<a href="https://github.com/reseekesh821" target="_blank">GitHub</a>

Keep it short.
Do not randomly promote links.

BOUNDARIES
If user says “please don’t help me” →
“Alright. I’ll stay quiet. Let me know if you need anything.”

If insulted →
Stay calm. Do not argue.

If unsure →
Say you’re not sure and suggest looking it up.

CONVERSATION STABILITY RULE
Never revert to an identity statement unless explicitly asked.
Never reset the conversation after short replies.
Maintain conversational continuity at all times.

Your goal is to sound like a smart, confident digital representative of Rishikesh — not a generic AI and not a command system.

Keep responses concise, natural, and professional.
`;

let conversationHistory = [
  { role: "system", content: SYSTEM_PROMPT }
];

// --- d. EVENT LISTENERS ---
if (chatToggle) {
  chatToggle.addEventListener('click', () => {
    const willOpen = !chatBox.classList.contains('open');
    chatBox.classList.toggle('open');
    chatToggle.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
    if (willOpen && userInput) setTimeout(() => userInput.focus(), 0);
  });
}
if (closeChat) {
  closeChat.addEventListener('click', () => {
    chatBox.classList.remove('open');
    if (chatToggle) chatToggle.setAttribute('aria-expanded', 'false');
    if (chatToggle) chatToggle.focus();
  });
}
if (sendBtn) {
  sendBtn.addEventListener('click', sendMessage);
}
if (userInput) {
  userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
  });
}

// ESC closes chat when open
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  if (!chatBox || !chatToggle) return;
  if (!chatBox.classList.contains('open')) return;
  chatBox.classList.remove('open');
  chatToggle.setAttribute('aria-expanded', 'false');
  chatToggle.focus();
});

// --- Contact form: send to Supabase, no Formspree redirect ---
(function contactForm() {
  const form = document.getElementById('contact-form');
  const statusEl = document.getElementById('form-status');
  const submitBtn = document.getElementById('contact-submit-btn');

  function isValidEmail(email) {
    const trimmed = (email || '').trim();
    if (!trimmed) return false;
    // Realistic format: local@domain.tld (no spaces, has @ and a dot in domain)
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed) && trimmed.length <= 254;
  }

  function setStatus(message, isError) {
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.className = 'form-status ' + (isError ? 'form-status-error' : 'form-status-success');
    statusEl.setAttribute('aria-live', 'polite');
  }

  function clearStatus() {
    if (statusEl) {
      statusEl.textContent = '';
      statusEl.className = 'form-status';
    }
  }

  if (!form) return;

  // Message character counter (10–500)
  const messageInput = form.querySelector('textarea[name="message"]');
  const countEl = document.getElementById('contact-message-count');
  function updateMessageCount() {
    if (!countEl || !messageInput) return;
    const len = (messageInput.value || '').length;
    countEl.textContent = len + ' / 500';
  }
  if (messageInput) {
    messageInput.addEventListener('input', updateMessageCount);
    messageInput.addEventListener('change', updateMessageCount);
    updateMessageCount();
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nameInput = form.querySelector('input[name="name"]');
    const emailInput = form.querySelector('input[name="email"]');
    const messageInput = form.querySelector('textarea[name="message"]');

    const name = (nameInput && nameInput.value || '').trim();
    const email = (emailInput && emailInput.value || '').trim();
    const message = (messageInput && messageInput.value || '').trim();

    clearStatus();

    if (name.length < 2) {
      setStatus('Please enter your name (at least 2 characters).', true);
      if (nameInput) nameInput.focus();
      return;
    }
    if (!email) {
      setStatus('Please enter your email address.', true);
      if (emailInput) emailInput.focus();
      return;
    }
    if (!isValidEmail(email)) {
      setStatus('Please enter a valid email address (e.g. name@example.com).', true);
      if (emailInput) emailInput.focus();
      return;
    }
    if (message.length < 10) {
      setStatus('Please write a message (at least 10 characters).', true);
      if (messageInput) messageInput.focus();
      return;
    }
    if (message.length > 500) {
      setStatus('Message must be at most 500 characters.', true);
      if (messageInput) messageInput.focus();
      return;
    }

    if (!window.supabaseClient) {
      setStatus('Server is not ready to receive messages. Please try again later.', true);
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.setAttribute('aria-busy', 'true');
    }

    try {
      const { data, error } = await window.supabaseClient
        .from('contact_messages')
        .insert([{ name, email, message }]);

      if (error) {
        console.error('Supabase insert error:', error);
        setStatus('Could not send your message right now. Please try again later.', true);
      } else {
        setStatus("Thanks! Your message was sent. I'll reply to your email soon.");
        form.reset();
        if (typeof updateMessageCount === 'function') updateMessageCount();
        setTimeout(clearStatus, 6000);
      }
    } catch (err) {
      console.error('Unexpected error sending message:', err);
      setStatus('Could not send your message. Check your connection and try again.', true);
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.removeAttribute('aria-busy');
      }
    }
  });
})();

initChatPresence();

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
  logChatMessage('user', text);

  // Run portfolio commands first (color, play music, show tab, etc.)
  const commandReply = VoiceAssistant && VoiceAssistant.handleCommand(text, true);
  if (commandReply !== false && typeof commandReply === 'string') {
    addMessage(commandReply, 'bot-message');
    logChatMessage('assistant', commandReply);
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
  logChatMessage('assistant', botReply);

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

function updateChatOnlineStatus(isOnline) {
  if (!chatStatusDot || !chatStatusText) return;
  chatStatusDot.classList.toggle('status-online', isOnline);
  chatStatusDot.classList.toggle('status-offline', !isOnline);
  chatStatusText.textContent = isOnline ? 'Online' : 'Offline';
  if (chatAudioBtn) chatAudioBtn.disabled = !isOnline;
  if (chatVideoBtn) chatVideoBtn.disabled = !isOnline;
}

function initChatPresence() {
  if (typeof navigator !== 'undefined') {
    updateChatOnlineStatus(navigator.onLine);
    window.addEventListener('online', () => updateChatOnlineStatus(true));
    window.addEventListener('offline', () => updateChatOnlineStatus(false));
  } else {
    updateChatOnlineStatus(true);
  }

  if (chatAudioBtn) {
    chatAudioBtn.addEventListener('click', () => {
      if (chatAudioBtn.disabled) return;
      startAudioCall();
    });
  }
  if (chatVideoBtn) {
    chatVideoBtn.addEventListener('click', () => {
      if (chatVideoBtn.disabled) return;
      startVideoCall();
    });
  }
  if (videoCallEndBtn) {
    videoCallEndBtn.addEventListener('click', () => {
      endVideoCall();
    });
  }
  if (videoCallMuteBtn) {
    videoCallMuteBtn.addEventListener('click', () => {
      if (!isInVideoCall || !dailyCallFrame) return;
      isVideoMuted = !isVideoMuted;
      dailyCallFrame.setLocalAudio(!isVideoMuted);
      if (isVideoMuted) {
        videoCallMuteBtn.classList.add('muted');
        videoCallMuteBtn.innerHTML = '<i class="fa-solid fa-microphone-slash"></i>';
        videoCallMuteBtn.setAttribute('aria-label', 'Unmute microphone');
      } else {
        videoCallMuteBtn.classList.remove('muted');
        videoCallMuteBtn.innerHTML = '<i class="fa-solid fa-microphone"></i>';
        videoCallMuteBtn.setAttribute('aria-label', 'Mute microphone');
      }
    });
  }
}

function playRingtone() {
  if (typeof Audio === 'undefined') return;
  try {
    if (!ringtoneAudio) {
      ringtoneAudio = new Audio(RINGTONE_URL);
      ringtoneAudio.loop = true;
      ringtoneAudio.preload = 'auto';
      ringtoneAudio.volume = 0.6;
    }
    ringtoneAudio.currentTime = 0;
    ringtoneAudio.play().catch(() => {});
  } catch (e) {
    // Ignore ringtone playback errors
  }
}

function stopRingtone() {
  if (!ringtoneAudio) return;
  try {
    ringtoneAudio.pause();
    ringtoneAudio.currentTime = 0;
  } catch (e) {
    // Ignore ringtone stop errors
  }
}

function playHangup() {
  if (typeof Audio === 'undefined') return;
  try {
    if (!hangupAudio) {
      hangupAudio = new Audio(HANGUP_URL);
      hangupAudio.preload = 'auto';
      hangupAudio.volume = 0.7;
    }
    hangupAudio.currentTime = 0;
    hangupAudio.play().catch(() => {});
  } catch (e) {
    // Ignore hangup playback errors
  }
}

function startAudioCall() {
  if (!VoiceAssistant || isInCall || !callScreen || !callStatusText || !callTimerEl) return;
  isInCall = true;
  callScreen.classList.add('active');
  callStatusText.textContent = 'Ringing...';
  callTimerEl.textContent = '00:00';
  if (callRecordBtn) callRecordBtn.disabled = true;
  if (callEndBtn) callEndBtn.disabled = false;

   // Start ringtone while the call is ringing
  playRingtone();

  // Hide chat UI behind the call screen
  if (chatMessages) chatMessages.style.display = 'none';
  if (typingIndicator) typingIndicator.style.display = 'none';
  if (quickRepliesContainer) quickRepliesContainer.style.display = 'none';
  if (voiceStatus) voiceStatus.style.display = 'none';
  if (chatInputArea) chatInputArea.style.display = 'none';

  // Simulate ringing for ~9 seconds (~two full rounds), then start the call
  setTimeout(() => {
    if (!isInCall) return;
    stopRingtone();
    callStatusText.textContent = 'On call';
    callStartTime = Date.now();
    callTimerInterval = setInterval(() => {
      if (!isInCall || !callTimerEl || !callStartTime) return;
      const elapsed = Math.floor((Date.now() - callStartTime) / 1000);
      const mins = String(Math.floor(elapsed / 60)).padStart(2, '0');
      const secs = String(elapsed % 60).padStart(2, '0');
      callTimerEl.textContent = `${mins}:${secs}`;
    }, 1000);
    if (callRecordBtn) {
      callRecordBtn.disabled = false;
      callRecordBtn.classList.remove('recording', 'muted');
      callRecordBtn.textContent = 'Mute';
      callRecordBtn.setAttribute('aria-label', 'Mute microphone');
    }
    isMuted = false;
    VoiceAssistant.speak("Hello, it's me Rishikesh Bastakoti. How can I help you today?");
    if (VoiceAssistant && VoiceAssistant.beginContinuousListening) {
      VoiceAssistant.beginContinuousListening();
    }
  }, 9000);

  if (callRecordBtn) {
    callRecordBtn.classList.remove('recording');
  }

  if (callRecordBtn && !callRecordBtn.__bound) {
    callRecordBtn.addEventListener('click', () => {
      if (!isInCall || callRecordBtn.disabled) return;
      isMuted = !isMuted;
      if (isMuted) {
        if (VoiceAssistant && VoiceAssistant.stopContinuousListening) {
          VoiceAssistant.stopContinuousListening();
        }
        callRecordBtn.classList.add('muted');
        callRecordBtn.textContent = 'Unmute';
        callRecordBtn.setAttribute('aria-label', 'Unmute microphone');
      } else {
        if (VoiceAssistant && VoiceAssistant.beginContinuousListening) {
          VoiceAssistant.beginContinuousListening();
        }
        callRecordBtn.classList.remove('muted');
        callRecordBtn.textContent = 'Mute';
        callRecordBtn.setAttribute('aria-label', 'Mute microphone');
      }
    });
    callRecordBtn.__bound = true;
  }

  if (callEndBtn && !callEndBtn.__bound) {
    callEndBtn.addEventListener('click', () => {
      endAudioCall();
    });
    callEndBtn.__bound = true;
  }
}

function endAudioCall() {
  if (!isInCall) return;
  isInCall = false;
  if (VoiceAssistant && VoiceAssistant.stopContinuousListening) {
    VoiceAssistant.stopContinuousListening();
  }
  stopRingtone();
  playHangup();
  if (callTimerInterval) {
    clearInterval(callTimerInterval);
    callTimerInterval = null;
  }
  callStartTime = null;
  if (callScreen) callScreen.classList.remove('active');
  if (callStatusText) callStatusText.textContent = '';
  if (callTimerEl) callTimerEl.textContent = '';
  if (callRecordBtn) {
    callRecordBtn.disabled = true;
    callRecordBtn.classList.remove('recording', 'muted');
    callRecordBtn.textContent = 'Record';
    callRecordBtn.setAttribute('aria-label', 'Record voice message');
  }
  if (callEndBtn) callEndBtn.disabled = true;

  // Restore chat UI
  if (chatMessages) chatMessages.style.display = 'flex';
  if (quickRepliesContainer) quickRepliesContainer.style.display = 'flex';
  if (chatInputArea) chatInputArea.style.display = 'flex';
  // voiceStatus is controlled by voice assistant; leave hidden until used again
  // Refresh online status so the audio button reflects current connectivity
  if (typeof navigator !== 'undefined') {
    updateChatOnlineStatus(navigator.onLine);
  } else {
    updateChatOnlineStatus(true);
  }
}

// --- VIDEO CALL (Tavus) ---

async function startVideoCall() {
  if (isInVideoCall || isInCall) return;
  if (!videoCallScreen || !videoCallFrame || !videoCallConnecting) return;
  if (typeof window.Daily === 'undefined') {
    console.error('Daily.js SDK not loaded');
    return;
  }

  isInVideoCall = true;
  isVideoMuted = false;
  videoCallScreen.classList.add('active');
  if (videoCallConnecting) videoCallConnecting.classList.remove('hidden');
  if (videoCallStatus) videoCallStatus.textContent = 'Ringing...';
  if (videoCallEndBtn) videoCallEndBtn.disabled = false;
  if (videoCallMuteBtn) {
    videoCallMuteBtn.classList.remove('muted');
    videoCallMuteBtn.innerHTML = '<i class="fa-solid fa-microphone"></i>';
  }

  if (chatMessages) chatMessages.style.display = 'none';
  if (typingIndicator) typingIndicator.style.display = 'none';
  if (quickRepliesContainer) quickRepliesContainer.style.display = 'none';
  if (voiceStatus) voiceStatus.style.display = 'none';
  if (chatInputArea) chatInputArea.style.display = 'none';

  playRingtone();

  try {
    const res = await fetch('/api/tavus-session', { method: 'POST' });
    const data = await res.json();

    if (!res.ok || !data.conversation_url) {
      throw new Error(data.error || 'No conversation URL');
    }

    stopRingtone();
    if (videoCallStatus) videoCallStatus.textContent = 'Connecting...';

    dailyCallFrame = window.Daily.createFrame(videoCallFrame, {
      showLeaveButton: false,
      showFullscreenButton: false,
      showUserNameChangeUI: false,
      showLocalVideo: false,
      showParticipantsBar: false,
      activeSpeakerMode: true,
      userName: 'You',
      startVideoOff: true,
      iframeStyle: {
        width: '100%',
        height: '100%',
        border: 'none',
        borderRadius: '0'
      },
      theme: {
        colors: {
          accent: '#00d2ff',
          background: '#0a0a0f',
          backgroundAccent: '#0a0a0f',
          baseText: '#ffffff',
          border: 'transparent',
          mainAreaBg: '#0a0a0f',
          mainAreaBgAccent: '#111118',
          mainAreaText: '#ffffff',
          supportiveText: '#aaaaaa'
        }
      }
    });

    dailyCallFrame.on('joined-meeting', () => {
      if (videoCallConnecting) videoCallConnecting.classList.add('hidden');
    });

    dailyCallFrame.on('participant-joined', () => {
      if (videoCallConnecting) videoCallConnecting.classList.add('hidden');
    });

    dailyCallFrame.on('left-meeting', () => {
      endVideoCall();
    });

    dailyCallFrame.on('error', (e) => {
      console.error('Daily error:', e);
      endVideoCall();
    });

    await dailyCallFrame.join({ url: data.conversation_url });

    // Fallback: hide connecting overlay after 10s
    setTimeout(() => {
      if (isInVideoCall && videoCallConnecting) {
        videoCallConnecting.classList.add('hidden');
      }
    }, 10000);

  } catch (err) {
    console.error('Video call error:', err);
    stopRingtone();
    if (videoCallStatus) videoCallStatus.textContent = 'Could not connect: ' + (err.message || 'Unknown error');
    setTimeout(() => {
      endVideoCall();
    }, 4000);
  }
}

function endVideoCall() {
  if (!isInVideoCall && !dailyCallFrame) return;
  isInVideoCall = false;
  stopRingtone();
  playHangup();

  if (dailyCallFrame) {
    try {
      dailyCallFrame.leave();
      dailyCallFrame.destroy();
    } catch (e) {
      // Ignore destroy errors
    }
    dailyCallFrame = null;
  }

  if (videoCallFrame) videoCallFrame.innerHTML = '';
  if (videoCallScreen) videoCallScreen.classList.remove('active');
  if (videoCallConnecting) videoCallConnecting.classList.remove('hidden');
  if (videoCallEndBtn) videoCallEndBtn.disabled = true;
  if (videoCallMuteBtn) {
    videoCallMuteBtn.classList.remove('muted');
    videoCallMuteBtn.innerHTML = '<i class="fa-solid fa-microphone"></i>';
  }

  if (chatMessages) chatMessages.style.display = 'flex';
  if (quickRepliesContainer) quickRepliesContainer.style.display = 'flex';
  if (chatInputArea) chatInputArea.style.display = 'flex';

  if (typeof navigator !== 'undefined') {
    updateChatOnlineStatus(navigator.onLine);
  } else {
    updateChatOnlineStatus(true);
  }
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

