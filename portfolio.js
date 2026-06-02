// Theme toggle (runs first to avoid a flash of the wrong theme)
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

  function syncThemeToggleAria() {
    var btn = document.getElementById('theme-toggle');
    if (!btn) return;
    var isLight = html.getAttribute('data-theme') === 'light';
    btn.setAttribute('aria-label', isLight ? 'Switch to dark mode' : 'Switch to light mode');
    btn.setAttribute('title', isLight ? 'Dark mode' : 'Light mode');
  }

  var btn = document.getElementById('theme-toggle');
  if (btn) {
    btn.addEventListener('click', function() {
      var isLight = html.getAttribute('data-theme') === 'light';
      applyTheme(isLight ? 'dark' : 'light');
      syncThemeToggleAria();
    });
  }
  syncThemeToggleAria();
})();

// Accent color palette, persisted in localStorage so voice/chat color changes survive reload
var PORTFOLIO_ACCENT_STORAGE_KEY = "portfolio-accent";
var PORTFOLIO_ACCENT_THEMES = {
  cyan: { primary: "#00d2ff", secondary: "#3a7bd5" },
  blue: { primary: "#4dabf7", secondary: "#228be6" },
  purple: { primary: "#9775fa", secondary: "#7950f2" },
  green: { primary: "#51cf66", secondary: "#37b24d" },
  red: { primary: "#ff6b6b", secondary: "#fa5252" },
  orange: { primary: "#ff922b", secondary: "#fd7e14" },
  pink: { primary: "#f06595", secondary: "#e64980" },
  teal: { primary: "#20c997", secondary: "#0ca678" },
  yellow: { primary: "#ffd43b", secondary: "#fab005" }
};

function applyPortfolioAccent(name) {
  var key = String(name || "").toLowerCase();
  var theme = PORTFOLIO_ACCENT_THEMES[key];
  if (!theme) return false;
  var root = document.documentElement;
  root.style.setProperty("--primary-color", theme.primary);
  root.style.setProperty("--secondary-color", theme.secondary);
  try {
    localStorage.setItem(PORTFOLIO_ACCENT_STORAGE_KEY, key);
  } catch (e) {}
  var meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", theme.primary);
  return true;
}

(function initPortfolioAccentFromStorage() {
  try {
    var saved = localStorage.getItem(PORTFOLIO_ACCENT_STORAGE_KEY);
    if (saved && PORTFOLIO_ACCENT_THEMES[saved]) {
      applyPortfolioAccent(saved);
    }
  } catch (e) {}
})();

// Language / i18n strings (translated entirely on the client)
const PORTFOLIO_LANG_STORAGE_KEY = "portfolio-language";
const RTL_LANGS = new Set([]);
const I18N = {
  en: {
    introLead: "Hello everyone, my name is Rishikesh Bastakoti. I am originally from Nepal and currently living in the United States, where I am pursuing my undergraduate degree in Computer Science at Caldwell University. I am in my sophomore year and aspire to build a career as a software developer. So far, I have completed several projects using Python, HTML, CSS, and JavaScript, and I am continuously expanding my skills in full-stack development.",
    languageLabel: "Language",
    subtitle: "Computer Science Student | Aspiring Software Developer",
    tourStart: "Walk me through this site",
    intro: "Intro",
    projects: "Projects",
    education: "Education",
    hometown: "Hometown",
    favorites: "Favorites",
    games: "Games",
    news: "News",
    contact: "Contact",
    gamesTitle: "Play & Learn",
    gamesDesc: "Test what you know about Rishikesh with a quick quiz.",
    gameTitle: "Know Rishikesh?",
    scoreLabel: "Score",
    quizStart: "Start Quiz",
    quizNext: "Next Question",
    newsDesc: "Top headlines from around the world.",
    contactTitle: "Contact & Portfolio",
    contactDesc: "Reach out via the links below or drop a message—I will respond as soon as I can.",
    sendMessageTitle: "Send a Message",
    name: "Name",
    email: "Email Address",
    yourMessage: "Your Message",
    sendButton: "Send Message",
    chatPlaceholder: "Type a message or command...",
    typing: "Thinking...",
    listening: "Listening...",
    newsLoading: "Loading news…",
    newsUnavailable: "Unable to load news. Try again later.",
    newsEmpty: "No headlines right now.",
    newsConnection: "Could not load news. Check your connection."
  },
  ne: { languageLabel: "भाषा", subtitle: "कम्प्युटर विज्ञान विद्यार्थी | सफ्टवेयर विकासकर्ता बन्ने लक्ष्य", tourStart: "यो साइट देखाइदिनुहोस्", intro: "परिचय", projects: "प्रोजेक्टहरू", education: "शिक्षा", hometown: "गृहनगर", favorites: "मनपर्ने", games: "खेल", news: "समाचार", contact: "सम्पर्क", gamesTitle: "खेल्दै सिकौं", gamesDesc: "रिशिकेशबारे छोटो क्विज खेल्नुहोस्।", gameTitle: "रिशिकेशलाई चिन्नुहुन्छ?", scoreLabel: "स्कोर", quizStart: "क्विज सुरु गर्नुहोस्", quizNext: "अर्को प्रश्न", newsDesc: "विश्वभरिका मुख्य समाचारहरू।", contactTitle: "सम्पर्क र पोर्टफोलियो", contactDesc: "तलका लिङ्कमार्फत सम्पर्क गर्नुहोस् वा सन्देश पठाउनुहोस्।", sendMessageTitle: "सन्देश पठाउनुहोस्", name: "नाम", email: "इमेल ठेगाना", yourMessage: "तपाईंको सन्देश", sendButton: "सन्देश पठाउनुहोस्", chatPlaceholder: "सन्देश वा कमाण्ड टाइप गर्नुहोस्...", typing: "सोच्दै...", listening: "सुनिरहेको...", newsLoading: "समाचार लोड हुँदैछ…", newsUnavailable: "समाचार लोड गर्न सकिएन।", newsEmpty: "अहिले हेडलाइन छैन।", newsConnection: "समाचार लोड भएन। इन्टरनेट जाँच्नुहोस्।" },
  es: { languageLabel: "Idioma", subtitle: "Estudiante de Informática | Futuro desarrollador de software", tourStart: "Muéstrame este sitio", intro: "Introducción", projects: "Proyectos", education: "Educación", hometown: "Ciudad natal", favorites: "Favoritos", games: "Juegos", news: "Noticias", contact: "Contacto", gamesTitle: "Jugar y aprender", gamesDesc: "Pon a prueba lo que sabes sobre Rishikesh.", gameTitle: "¿Conoces a Rishikesh?", scoreLabel: "Puntuación", quizStart: "Iniciar quiz", quizNext: "Siguiente pregunta", newsDesc: "Titulares principales del mundo.", contactTitle: "Contacto y Portafolio", contactDesc: "Contáctame por los enlaces o envía un mensaje.", sendMessageTitle: "Enviar un mensaje", name: "Nombre", email: "Correo electrónico", yourMessage: "Tu mensaje", sendButton: "Enviar mensaje", chatPlaceholder: "Escribe un mensaje o comando...", typing: "Pensando...", listening: "Escuchando...", newsLoading: "Cargando noticias…", newsUnavailable: "No se pudieron cargar las noticias.", newsEmpty: "No hay titulares por ahora.", newsConnection: "No se pudieron cargar. Revisa tu conexión." },
  fr: { languageLabel: "Langue", subtitle: "Etudiant en informatique | Futur developpeur logiciel", tourStart: "Faire la visite du site", intro: "Intro", projects: "Projets", education: "Etudes", hometown: "Ville natale", favorites: "Favoris", games: "Jeux", news: "Actualites", contact: "Contact", gamesTitle: "Jouer & apprendre", gamesDesc: "Testez vos connaissances sur Rishikesh.", gameTitle: "Connaissez-vous Rishikesh ?", scoreLabel: "Score", quizStart: "Demarrer le quiz", quizNext: "Question suivante", newsDesc: "Les grands titres du monde.", contactTitle: "Contact & Portfolio", contactDesc: "Contactez-moi via les liens ou envoyez un message.", sendMessageTitle: "Envoyer un message", name: "Nom", email: "Adresse e-mail", yourMessage: "Votre message", sendButton: "Envoyer", chatPlaceholder: "Tapez un message ou une commande...", typing: "Reflexion...", listening: "Ecoute...", newsLoading: "Chargement des actualites…", newsUnavailable: "Impossible de charger les actualites.", newsEmpty: "Aucun titre pour le moment.", newsConnection: "Chargement impossible. Verifiez votre connexion." },
  de: { languageLabel: "Sprache", subtitle: "Informatikstudent | Zukuenftiger Softwareentwickler", tourStart: "Fuehre mich durch die Seite", intro: "Intro", projects: "Projekte", education: "Ausbildung", hometown: "Heimatstadt", favorites: "Favoriten", games: "Spiele", news: "Nachrichten", contact: "Kontakt", gamesTitle: "Spielen & Lernen", gamesDesc: "Teste dein Wissen ueber Rishikesh.", gameTitle: "Kennst du Rishikesh?", scoreLabel: "Punktzahl", quizStart: "Quiz starten", quizNext: "Naechste Frage", newsDesc: "Top-Schlagzeilen aus aller Welt.", contactTitle: "Kontakt & Portfolio", contactDesc: "Kontaktiere mich ueber die Links oder sende eine Nachricht.", sendMessageTitle: "Nachricht senden", name: "Name", email: "E-Mail-Adresse", yourMessage: "Deine Nachricht", sendButton: "Nachricht senden", chatPlaceholder: "Nachricht oder Befehl eingeben...", typing: "Denke nach...", listening: "Hoere zu...", newsLoading: "Nachrichten werden geladen…", newsUnavailable: "Nachrichten konnten nicht geladen werden.", newsEmpty: "Aktuell keine Schlagzeilen.", newsConnection: "Konnte nicht laden. Verbindung pruefen." },
  pt: { languageLabel: "Idioma", subtitle: "Estudante de Ciencia da Computacao | Futuro desenvolvedor de software", tourStart: "Guie-me por este site", intro: "Introducao", projects: "Projetos", education: "Educacao", hometown: "Cidade natal", favorites: "Favoritos", games: "Jogos", news: "Noticias", contact: "Contato", gamesTitle: "Jogar e aprender", gamesDesc: "Teste o que voce sabe sobre Rishikesh.", gameTitle: "Conhece o Rishikesh?", scoreLabel: "Pontuacao", quizStart: "Iniciar quiz", quizNext: "Proxima pergunta", newsDesc: "Principais manchetes do mundo.", contactTitle: "Contato e Portfolio", contactDesc: "Entre em contato pelos links ou envie uma mensagem.", sendMessageTitle: "Enviar mensagem", name: "Nome", email: "Endereco de e-mail", yourMessage: "Sua mensagem", sendButton: "Enviar mensagem", chatPlaceholder: "Digite uma mensagem ou comando...", typing: "Pensando...", listening: "Ouvindo...", newsLoading: "Carregando noticias…", newsUnavailable: "Nao foi possivel carregar noticias.", newsEmpty: "Sem manchetes no momento.", newsConnection: "Falha ao carregar. Verifique a conexao." },
  zh: { languageLabel: "语言", subtitle: "计算机科学学生 | 未来软件开发者", tourStart: "带我浏览这个网站", intro: "简介", projects: "项目", education: "教育", hometown: "家乡", favorites: "喜好", games: "游戏", news: "新闻", contact: "联系", gamesTitle: "边玩边学", gamesDesc: "通过小测验了解你对 Rishikesh 的认识。", gameTitle: "你了解 Rishikesh 吗？", scoreLabel: "得分", quizStart: "开始测验", quizNext: "下一题", newsDesc: "来自世界各地的头条新闻。", contactTitle: "联系与作品集", contactDesc: "你可以通过以下链接联系我，或直接留言。", sendMessageTitle: "发送消息", name: "姓名", email: "邮箱地址", yourMessage: "你的消息", sendButton: "发送消息", chatPlaceholder: "输入消息或指令...", typing: "思考中...", listening: "正在聆听...", newsLoading: "正在加载新闻…", newsUnavailable: "暂时无法加载新闻。", newsEmpty: "目前没有新闻。", newsConnection: "加载失败，请检查网络连接。" }
};

const I18N_EXTENDED = {
  en: {
    projectsTitle: "Featured Projects",
    projectsDesc: "Here are some of the projects I've been working on:",
    viewCode: "View Code",
    projectQuickLoanDesc: "A full-stack loan application system designed to streamline the borrowing process. Built with a modern frontend and robust backend.",
    projectBudgetDesc: "A personal finance tool written in Python to help users track expenses, set budgets, and visualize spending habits.",
    projectPortfolioDesc: "Personal portfolio site with an AI chat assistant (Groq), voice commands, audio/video call UI, live weather and news, quiz game, and Supabase analytics—serverless APIs on Vercel.",
    universityTitle: "University",
    highSchoolTitle: "High School",
    hometownTimeLabel: "Kathmandu Time:",
    hometownWeatherLabel: "Weather:",
    hometownLocationLabel: "Location:",
    favoritesMusicTitle: "Favorite Music",
    favoritesCityTitle: "Favorite City",
    favoritesMovieTitle: "Favorite Movie",
    resumeText: "View Resume",
    voiceCommandsTitle: "Voice commands",
    chatWelcome: "Hi. Ask me about Rishikesh, or try commands like play music, change color, or show projects.",
    chipRedTheme: "Red theme",
    chipPlayMusic: "Play music",
    chipAboutRishi: "About Rishi",
    chipProjects: "Projects",
    quizPromptStart: "Click Start to begin.",
    quizComplete: "Quiz complete!",
    playAgain: "Play Again",
    quizResultPerfect: "Perfect! You know Rishikesh well.",
    quizResultGood: "Nice job! Explore the portfolio to learn more.",
    quizResultTry: "No worries — check out Intro and Projects!",
    yourScore: "Your score",
    chatOnline: "Online",
    chatOffline: "Offline",
    voiceHelpTitle: "What can I say?",
    tourPrev: "Previous",
    tourNext: "Next",
    tourFinish: "Finish",
    tourExit: "Exit"
  },
  es: {
    introLead: "Hola a todos, mi nombre es Rishikesh Bastakoti. Soy de Nepal y actualmente vivo en Estados Unidos, donde estudio Informatica en Caldwell University. Estoy en segundo ano y quiero construir una carrera como desarrollador de software.",
    projectsTitle: "Proyectos Destacados",
    projectsDesc: "Estos son algunos de los proyectos en los que he estado trabajando:",
    viewCode: "Ver codigo",
    projectQuickLoanDesc: "Un sistema de prestamos full-stack disenado para agilizar el proceso de solicitud y aprobacion.",
    projectBudgetDesc: "Una herramienta de finanzas personales en Python para registrar gastos y visualizar habitos de consumo.",
    projectPortfolioDesc: "Portafolio personal con asistente de IA, comandos de voz, llamadas, clima y noticias en vivo, quiz y analiticas en Supabase.",
    universityTitle: "Universidad",
    highSchoolTitle: "Escuela secundaria",
    hometownTimeLabel: "Hora de Katmandu:",
    hometownWeatherLabel: "Clima:",
    hometownLocationLabel: "Ubicacion:",
    favoritesMusicTitle: "Musica favorita",
    favoritesCityTitle: "Ciudad favorita",
    favoritesMovieTitle: "Pelicula favorita",
    resumeText: "Ver CV",
    voiceCommandsTitle: "Comandos de voz",
    chatWelcome: "Hola. Preguntame sobre Rishikesh o usa comandos como reproducir musica, cambiar color o mostrar proyectos.",
    chipRedTheme: "Tema rojo",
    chipPlayMusic: "Reproducir musica",
    chipAboutRishi: "Sobre Rishi",
    chipProjects: "Proyectos",
    quizPromptStart: "Haz clic en iniciar para comenzar.",
    quizComplete: "Quiz completado!",
    playAgain: "Jugar de nuevo",
    quizResultPerfect: "Perfecto! Conoces muy bien a Rishikesh.",
    quizResultGood: "Buen trabajo! Explora el portafolio para aprender mas.",
    quizResultTry: "No pasa nada: revisa Introduccion y Proyectos.",
    yourScore: "Tu puntuacion",
    chatOnline: "En linea",
    chatOffline: "Desconectado",
    voiceHelpTitle: "Que puedo decir?",
    tourPrev: "Anterior",
    tourNext: "Siguiente",
    tourFinish: "Finalizar",
    tourExit: "Salir"
  },
  ne: {
    introLead: "नमस्ते सबैलाई, मेरो नाम रिशिकेश बास्ताकोटी हो। म नेपालबाट हुँ र हाल अमेरिकामा बस्दै कम्प्युटर साइन्स पढिरहेको छु। म दोस्रो वर्षमा छु र सफ्टवेयर डेभलपर बन्ने लक्ष्य राखेको छु।",
    projectsTitle: "विशेष प्रोजेक्टहरू",
    projectsDesc: "मैले काम गरिरहेका केही प्रोजेक्टहरू यहाँ छन्:",
    viewCode: "कोड हेर्नुहोस्",
    projectQuickLoanDesc: "ऋण प्रक्रिया सजिलो बनाउने फुल-स्ट्याक लोन प्रणाली। आधुनिक फ्रन्टएन्ड र बलियो ब्याकएन्डमा आधारित।",
    projectBudgetDesc: "Python मा बनेको व्यक्तिगत वित्त उपकरण जसले खर्च ट्र्याक, बजेट सेट र खर्च विश्लेषण गर्न मद्दत गर्छ।",
    projectPortfolioDesc: "AI सहायक, भ्वाइस कमाण्ड, कल, मौसम/समाचार, क्विज र Supabase एनालिटिक्स भएको व्यक्तिगत पोर्टफोलियो साइट।",
    universityTitle: "विश्वविद्यालय",
    highSchoolTitle: "उच्च माध्यमिक विद्यालय",
    hometownTimeLabel: "काठमाडौं समय:",
    hometownWeatherLabel: "मौसम:",
    hometownLocationLabel: "स्थान:",
    favoritesMusicTitle: "मनपर्ने संगीत",
    favoritesCityTitle: "मनपर्ने सहर",
    favoritesMovieTitle: "मनपर्ने चलचित्र",
    resumeText: "रिजुमे हेर्नुहोस्",
    voiceCommandsTitle: "भ्वाइस कमाण्डहरू",
    chatWelcome: "नमस्ते। मसँग रिशिकेशबारे सोध्नुहोस् वा संगीत चलाऊ, रंग बदल जस्ता कमाण्ड प्रयोग गर्नुहोस्।",
    chipRedTheme: "रातो थिम",
    chipPlayMusic: "संगीत चलाऊ",
    chipAboutRishi: "रिशीबारे",
    chipProjects: "प्रोजेक्टहरू",
    quizPromptStart: "सुरु गर्न Start थिच्नुहोस्।",
    quizComplete: "क्विज सकियो!",
    playAgain: "फेरि खेल्नुहोस्",
    quizResultPerfect: "उत्कृष्ट! तपाईंले रिशिकेशलाई राम्रोसँग चिन्नुहुन्छ।",
    quizResultGood: "राम्रो भयो! थप सिक्न पोर्टफोलियो हेर्नुहोस्।",
    quizResultTry: "चिन्ता नलिनुहोस् — Intro र Projects हेर्नुहोस्।",
    yourScore: "तपाईंको स्कोर",
    chatOnline: "अनलाइन",
    chatOffline: "अफलाइन",
    voiceHelpTitle: "म के भन्न सक्छु?",
    tourPrev: "अघिल्लो",
    tourNext: "अर्को",
    tourFinish: "समाप्त",
    tourExit: "बाहिरिने"
  },
  fr: {
    introLead: "Bonjour a tous, je m'appelle Rishikesh Bastakoti. Je viens du Nepal et je vis actuellement aux Etats-Unis, ou je poursuis une licence en informatique a Caldwell University. Je suis en deuxieme annee et je souhaite construire une carriere de developpeur logiciel.",
    projectsTitle: "Projets en vedette",
    projectsDesc: "Voici quelques projets sur lesquels j'ai travaille :",
    viewCode: "Voir le code",
    projectQuickLoanDesc: "Une application de pret full-stack concue pour simplifier le processus d'emprunt.",
    projectBudgetDesc: "Un outil de finances personnelles en Python pour suivre les depenses et visualiser les habitudes.",
    projectPortfolioDesc: "Portfolio personnel avec assistant IA, commandes vocales, appels audio/video, meteo et actualites en direct.",
    universityTitle: "Universite",
    highSchoolTitle: "Lycee",
    hometownTimeLabel: "Heure de Kathmandu :",
    hometownWeatherLabel: "Meteo :",
    hometownLocationLabel: "Localisation :",
    favoritesMusicTitle: "Musique preferee",
    favoritesCityTitle: "Ville preferee",
    favoritesMovieTitle: "Film prefere",
    resumeText: "Voir le CV",
    voiceCommandsTitle: "Commandes vocales",
    chatWelcome: "Salut. Posez-moi des questions sur Rishikesh ou essayez des commandes comme jouer la musique et ouvrir les projets.",
    chipRedTheme: "Theme rouge",
    chipPlayMusic: "Jouer la musique",
    chipAboutRishi: "A propos de Rishi",
    chipProjects: "Projets",
    quizPromptStart: "Cliquez sur Demarrer pour commencer.",
    quizComplete: "Quiz termine !",
    playAgain: "Rejouer",
    quizResultPerfect: "Parfait ! Vous connaissez tres bien Rishikesh.",
    quizResultGood: "Bien joue ! Explorez le portfolio pour en savoir plus.",
    quizResultTry: "Pas de souci — consultez Intro et Projets.",
    yourScore: "Votre score",
    chatOnline: "En ligne",
    chatOffline: "Hors ligne",
    voiceHelpTitle: "Que puis-je dire ?",
    tourPrev: "Precedent",
    tourNext: "Suivant",
    tourFinish: "Terminer",
    tourExit: "Quitter"
  },
  de: {
    introLead: "Hallo zusammen, ich heisse Rishikesh Bastakoti. Ich komme aus Nepal und lebe derzeit in den USA, wo ich an der Caldwell University Informatik studiere. Ich bin im zweiten Studienjahr und moechte Softwareentwickler werden.",
    projectsTitle: "Ausgewaehlte Projekte",
    projectsDesc: "Hier sind einige Projekte, an denen ich gearbeitet habe:",
    viewCode: "Code ansehen",
    projectQuickLoanDesc: "Ein Full-Stack-Kreditsystem, das den Ausleihprozess vereinfacht.",
    projectBudgetDesc: "Ein Python-Finanztool, um Ausgaben zu verfolgen und Budgets zu planen.",
    projectPortfolioDesc: "Persoenliche Portfolio-Seite mit KI-Chat, Sprachbefehlen, Audio/Video-Anrufen, Live-Wetter und News.",
    universityTitle: "Universitaet",
    highSchoolTitle: "Oberschule",
    hometownTimeLabel: "Kathmandu-Zeit:",
    hometownWeatherLabel: "Wetter:",
    hometownLocationLabel: "Ort:",
    favoritesMusicTitle: "Lieblingsmusik",
    favoritesCityTitle: "Lieblingsstadt",
    favoritesMovieTitle: "Lieblingsfilm",
    resumeText: "Lebenslauf ansehen",
    voiceCommandsTitle: "Sprachbefehle",
    chatWelcome: "Hi. Frag mich zu Rishikesh oder nutze Befehle wie Musik starten, Farbe wechseln oder Projekte anzeigen.",
    chipRedTheme: "Rotes Design",
    chipPlayMusic: "Musik starten",
    chipAboutRishi: "Ueber Rishi",
    chipProjects: "Projekte",
    quizPromptStart: "Klicke auf Start, um zu beginnen.",
    quizComplete: "Quiz abgeschlossen!",
    playAgain: "Nochmal spielen",
    quizResultPerfect: "Perfekt! Du kennst Rishikesh sehr gut.",
    quizResultGood: "Gut gemacht! Schau dir das Portfolio fuer mehr Infos an.",
    quizResultTry: "Kein Problem — sieh dir Intro und Projekte an.",
    yourScore: "Dein Ergebnis",
    chatOnline: "Online",
    chatOffline: "Offline",
    voiceHelpTitle: "Was kann ich sagen?",
    tourPrev: "Zurueck",
    tourNext: "Weiter",
    tourFinish: "Fertig",
    tourExit: "Beenden"
  },
  pt: {
    introLead: "Ola, pessoal. Meu nome e Rishikesh Bastakoti. Sou do Nepal e atualmente moro nos Estados Unidos, onde curso Ciencia da Computacao na Caldwell University. Estou no segundo ano e quero construir minha carreira como desenvolvedor de software.",
    projectsTitle: "Projetos em destaque",
    projectsDesc: "Aqui estao alguns projetos em que tenho trabalhado:",
    viewCode: "Ver codigo",
    projectQuickLoanDesc: "Um sistema full-stack de emprestimos para simplificar o processo de credito.",
    projectBudgetDesc: "Uma ferramenta de financas pessoais em Python para acompanhar gastos e metas.",
    projectPortfolioDesc: "Site de portfolio com assistente de IA, comandos de voz, chamadas, clima e noticias ao vivo.",
    universityTitle: "Universidade",
    highSchoolTitle: "Ensino medio",
    hometownTimeLabel: "Horario de Katmandu:",
    hometownWeatherLabel: "Clima:",
    hometownLocationLabel: "Localizacao:",
    favoritesMusicTitle: "Musica favorita",
    favoritesCityTitle: "Cidade favorita",
    favoritesMovieTitle: "Filme favorito",
    resumeText: "Ver curriculo",
    voiceCommandsTitle: "Comandos de voz",
    chatWelcome: "Oi. Pergunte sobre Rishikesh ou use comandos como tocar musica, mudar cor ou abrir projetos.",
    chipRedTheme: "Tema vermelho",
    chipPlayMusic: "Tocar musica",
    chipAboutRishi: "Sobre Rishi",
    chipProjects: "Projetos",
    quizPromptStart: "Clique em Iniciar para comecar.",
    quizComplete: "Quiz concluido!",
    playAgain: "Jogar novamente",
    quizResultPerfect: "Perfeito! Voce conhece muito bem o Rishikesh.",
    quizResultGood: "Bom trabalho! Explore o portfolio para saber mais.",
    quizResultTry: "Sem problema — veja Intro e Projetos.",
    yourScore: "Sua pontuacao",
    chatOnline: "Online",
    chatOffline: "Offline",
    voiceHelpTitle: "O que posso dizer?",
    tourPrev: "Anterior",
    tourNext: "Proximo",
    tourFinish: "Finalizar",
    tourExit: "Sair"
  },
  zh: {
    introLead: "大家好，我叫 Rishikesh Bastakoti。我来自尼泊尔，目前在美国就读 Caldwell University 计算机科学本科二年级，并希望成为软件开发工程师。",
    projectsTitle: "精选项目",
    projectsDesc: "以下是我正在进行的一些项目：",
    viewCode: "查看代码",
    projectQuickLoanDesc: "一个全栈贷款申请系统，用于简化借贷流程，包含现代前端和稳定后端。",
    projectBudgetDesc: "使用 Python 开发的个人理财工具，帮助用户记录支出并制定预算。",
    projectPortfolioDesc: "个人作品集网站，包含 AI 聊天助手、语音命令、音视频通话、实时天气与新闻等功能。",
    universityTitle: "大学",
    highSchoolTitle: "高中",
    hometownTimeLabel: "加德满都时间：",
    hometownWeatherLabel: "天气：",
    hometownLocationLabel: "位置：",
    favoritesMusicTitle: "最喜欢的音乐",
    favoritesCityTitle: "最喜欢的城市",
    favoritesMovieTitle: "最喜欢的电影",
    resumeText: "查看简历",
    voiceCommandsTitle: "语音指令",
    chatWelcome: "你好。你可以问我关于 Rishikesh 的信息，或尝试“播放音乐”“切换颜色”“打开项目”等指令。",
    chipRedTheme: "红色主题",
    chipPlayMusic: "播放音乐",
    chipAboutRishi: "关于 Rishi",
    chipProjects: "项目",
    quizPromptStart: "点击“开始测验”即可开始。",
    quizComplete: "测验完成！",
    playAgain: "再玩一次",
    quizResultPerfect: "太棒了！你非常了解 Rishikesh。",
    quizResultGood: "做得不错！继续浏览作品集了解更多。",
    quizResultTry: "没关系，先看看“简介”和“项目”吧。",
    yourScore: "你的得分",
    chatOnline: "在线",
    chatOffline: "离线",
    voiceHelpTitle: "我可以说什么？",
    tourPrev: "上一步",
    tourNext: "下一步",
    tourFinish: "完成",
    tourExit: "退出"
  }
};

Object.keys(I18N_EXTENDED).forEach((lang) => {
  I18N[lang] = { ...(I18N[lang] || {}), ...I18N_EXTENDED[lang] };
});

let currentLanguage = "en";
function t(key) {
  const pack = I18N[currentLanguage] || I18N.en;
  return pack[key] || I18N.en[key] || key;
}

function setLanguage(lang) {
  const nextLang = I18N[lang] ? lang : "en";
  currentLanguage = nextLang;
  try { localStorage.setItem(PORTFOLIO_LANG_STORAGE_KEY, nextLang); } catch (e) {}

  const html = document.documentElement;
  html.setAttribute("lang", nextLang);
  html.setAttribute("dir", RTL_LANGS.has(nextLang) ? "rtl" : "ltr");

  applyTranslations();
}

function applyTranslations() {
  const titleMap = [
    [".subtitle", "subtitle"],
    ["#tour-start-btn", "tourStart"],
    ["#intro-lead", "introLead"],
    ["#tab-intro", "intro"],
    ["#tab-projects", "projects"],
    ["#tab-education", "education"],
    ["#tab-hometown", "hometown"],
    ["#tab-favorites", "favorites"],
    ["#tab-games", "games"],
    ["#tab-news", "news"],
    ["#tab-contact", "contact"],
    ["#games h3", "gamesTitle"],
    ["#games > p", "gamesDesc"],
    [".game-title", "gameTitle"],
    ["#quiz-start", "quizStart"],
    ["#quiz-next", "quizNext"],
    ["#news > p", "newsDesc"],
    ["#contact > h3", "contactTitle"],
    ["#contact > p", "contactDesc"],
    [".form-container h3", "sendMessageTitle"],
    ["#language-label", "languageLabel"],
    ["#typing-indicator", "typing"],
    ["#voice-status", "listening"],
    ["#projects-title", "projectsTitle"],
    ["#projects-desc", "projectsDesc"],
    ["#project-quickloan-desc", "projectQuickLoanDesc"],
    ["#project-budget-desc", "projectBudgetDesc"],
    ["#project-portfolio-desc", "projectPortfolioDesc"],
    ["#education-university-title", "universityTitle"],
    ["#education-highschool-title", "highSchoolTitle"],
    ["#hometown-time-label", "hometownTimeLabel"],
    ["#hometown-weather-label", "hometownWeatherLabel"],
    ["#hometown-location-label", "hometownLocationLabel"],
    ["#favorites-music-title", "favoritesMusicTitle"],
    ["#favorites-city-title", "favoritesCityTitle"],
    ["#favorites-movie-title", "favoritesMovieTitle"],
    ["#contact-resume-text", "resumeText"],
    ["#voice-commands-title", "voiceCommandsTitle"],
    ["#chat-welcome-text", "chatWelcome"],
    ["#chip-red-theme", "chipRedTheme"],
    ["#chip-play-music", "chipPlayMusic"],
    ["#chip-about-rishi", "chipAboutRishi"],
    ["#chip-projects", "chipProjects"]
  ];
  titleMap.forEach(([selector, key]) => {
    const el = document.querySelector(selector);
    if (!el) return;

    // Preferred: a dedicated child <span> holds the label (e.g. top nav tabs
    // are <li><i></i><span>Intro</span></li>). Update only that span so the
    // icon stays put and we never duplicate the text on re-translation.
    const labelSpan = el.querySelector(":scope > span");
    if (labelSpan) {
      labelSpan.textContent = t(key);
      return;
    }

    const icon = el.querySelector("i");
    if (icon && el.childNodes.length > 1) {
      const textNodes = Array.from(el.childNodes).filter((n) => n.nodeType === Node.TEXT_NODE);
      if (textNodes.length > 0) {
        textNodes[textNodes.length - 1].textContent = " " + t(key);
      } else {
        el.append(" " + t(key));
      }
    } else {
      el.textContent = t(key);
    }
  });

  const labels = document.querySelectorAll(".input-group label");
  if (labels[0]) labels[0].textContent = t("name");
  if (labels[1]) labels[1].textContent = t("email");
  if (labels[2]) labels[2].textContent = t("yourMessage");

  const input = document.getElementById("user-input");
  if (input) input.placeholder = t("chatPlaceholder");

  const sendBtnText = document.getElementById("contact-send-btn-text");
  if (sendBtnText) sendBtnText.textContent = t("sendButton");

  document.querySelectorAll(".view-code-text").forEach((el) => {
    el.textContent = t("viewCode");
  });

  const voiceHelpBtn = document.getElementById("voice-help-btn");
  if (voiceHelpBtn) voiceHelpBtn.title = t("voiceHelpTitle");

  const tourPrev = document.getElementById("tour-prev-btn");
  const tourNext = document.getElementById("tour-next-btn");
  const tourExit = document.getElementById("tour-exit-btn");
  if (tourPrev) tourPrev.textContent = t("tourPrev");
  if (tourNext) tourNext.textContent = t("tourNext");
  if (tourExit) tourExit.textContent = t("tourExit");
}

(function initLanguage() {
  let saved = "en";
  try { saved = localStorage.getItem(PORTFOLIO_LANG_STORAGE_KEY) || "en"; } catch (e) {}
  const selector = document.getElementById("language-select");
  if (selector) {
    selector.value = I18N[saved] ? saved : "en";
    selector.addEventListener("change", (e) => setLanguage(e.target.value));
  }
  setLanguage(saved);
})();

// Visitor card: local time, city (reverse geocode) and weather (Open-Meteo)
(function initCoverVisitor() {
  const timeEl = document.getElementById("cover-local-time");
  const locEl = document.getElementById("cover-location");
  const weatherEl = document.getElementById("cover-weather");
  const weatherIconEl = document.getElementById("cover-weather-icon");
  if (!timeEl && !locEl && !weatherEl) return;

  function tickClock() {
    if (!timeEl) return;
    const now = new Date();
    timeEl.textContent = now.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
    timeEl.setAttribute("datetime", now.toISOString());
  }
  tickClock();
  setInterval(tickClock, 1000);

  function setLocation(text, title) {
    if (!locEl) return;
    locEl.textContent = text;
    if (title) locEl.setAttribute("title", title);
    else locEl.removeAttribute("title");
  }

  function wmoWeatherLabel(code) {
    const c = code | 0;
    if (c === 0) return "Clear";
    if (c <= 3) return c === 1 ? "Mostly clear" : c === 2 ? "Partly cloudy" : "Overcast";
    if (c <= 48) return "Fog";
    if (c <= 57) return "Drizzle";
    if (c <= 67) return "Rain";
    if (c <= 77) return "Snow";
    if (c <= 82) return "Showers";
    if (c <= 86) return "Snow showers";
    if (c >= 95) return "Thunderstorm";
    return "—";
  }

  function setWeatherIcon(code) {
    if (!weatherIconEl) return;
    const c = code | 0;
    let cls = "fa-solid fa-cloud-sun";
    if (c === 0) cls = "fa-solid fa-sun";
    else if (c <= 3) cls = "fa-solid fa-cloud-sun";
    else if (c <= 48) cls = "fa-solid fa-smog";
    else if (c <= 67) cls = "fa-solid fa-cloud-rain";
    else if (c <= 77) cls = "fa-solid fa-snowflake";
    else if (c <= 86) cls = "fa-solid fa-cloud-showers-heavy";
    else if (c >= 95) cls = "fa-solid fa-bolt";
    weatherIconEl.className = cls;
  }

  function isRainMoodCode(code) {
    const c = code | 0;
    return (
      (c >= 51 && c <= 67) ||
      (c >= 80 && c <= 82) ||
      (c >= 95 && c <= 99)
    );
  }

  function isSnowMoodCode(code) {
    const c = code | 0;
    return (c >= 71 && c <= 77) || (c >= 85 && c <= 86);
  }

  function localHourCoverMood() {
    const h = new Date().getHours();
    return h >= 6 && h < 19 ? "day" : "night";
  }

  /**
   * Weather/time chip only (#cover-visitor): sunny, day, night, rain, snow — hero cover stays unchanged.
   */
  var lastMoodWeatherCode = null;

  function applyVisitorMood(weatherCode) {
    const el = document.getElementById("cover-visitor");
    if (!el) return;

    var mood = localHourCoverMood();
    if (weatherCode != null && !Number.isNaN(Number(weatherCode))) {
      var c = Number(weatherCode) | 0;
      if (isRainMoodCode(c)) mood = "rain";
      else if (isSnowMoodCode(c)) mood = "snow";
      else if (mood === "day" && (c === 0 || c === 1)) mood = "sunny";
    }

    el.setAttribute("data-visitor-mood", mood);
  }

  async function fetchOpenMeteo(lat, lon) {
    if (!weatherEl) return;
    weatherEl.textContent = "…";
    try {
      const u = new URL("https://api.open-meteo.com/v1/forecast");
      u.searchParams.set("latitude", String(lat));
      u.searchParams.set("longitude", String(lon));
      u.searchParams.set("current", "temperature_2m,weather_code");
      u.searchParams.set("timezone", "auto");
      const res = await fetch(u.toString());
      if (!res.ok) throw new Error("wx");
      const data = await res.json();
      const cur = data.current;
      if (!cur || typeof cur.temperature_2m !== "number") throw new Error("wx");
      const t = Math.round(cur.temperature_2m * 10) / 10;
      const label = wmoWeatherLabel(cur.weather_code);
      setWeatherIcon(cur.weather_code);
      weatherEl.textContent = `${t}°C · ${label}`;
      weatherEl.setAttribute("title", "Open-Meteo (approx. for your area)");

      lastMoodWeatherCode = cur.weather_code;
      applyVisitorMood(lastMoodWeatherCode);
    } catch (e) {
      lastMoodWeatherCode = null;
      weatherEl.textContent = "Weather unavailable";
      weatherEl.removeAttribute("title");
      applyVisitorMood(null);
    }
  }

  async function tryReverseGeocode(lat, lon) {
    try {
      const base = window.location.origin;
      const res = await fetch(
        `${base}/api/reverse-geocode?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}`
      );
      if (!res.ok) return null;
      const data = await res.json();
      if (data && typeof data.label === "string" && data.label.trim()) {
        return data.label.trim();
      }
    } catch (e) {
      /* static host / no API route */
    }
    return null;
  }

  if (!locEl && !weatherEl) return;

  applyVisitorMood(null);
  setInterval(function () {
    applyVisitorMood(lastMoodWeatherCode);
  }, 60000);

  var geoGeneration = 0;

  async function onGeoSuccess(pos, gen) {
    if (gen !== geoGeneration) return;
    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;
    const coordTitle = `${lat.toFixed(5)}°, ${lon.toFixed(5)}°`;

    const labelPromise = tryReverseGeocode(lat, lon);
    const wxPromise = fetchOpenMeteo(lat, lon);
    const label = await labelPromise;
    if (gen !== geoGeneration) return;
    if (label) setLocation(label, coordTitle);
    else setLocation(coordTitle);
    await wxPromise;
  }

  function applyGeoErrorToUI(err) {
    if (!locEl) return;
    if (err && err.code === 1) {
      setLocation("Location blocked");
      locEl.setAttribute(
        "title",
        "Chrome: click the lock icon → Site settings → Location → Allow, then reload."
      );
    } else if (err && err.code === 2) {
      setLocation("System location off");
      locEl.setAttribute(
        "title",
        "Windows: Settings → Privacy & security → Location → On. Also allow location for Google Chrome. Then reload this page."
      );
    } else if (err && err.code === 3) {
      setLocation("Location timed out");
      locEl.setAttribute(
        "title",
        "Turn on system location and Wi‑Fi, then reload. Chrome may need a moment to get a fix."
      );
    } else {
      setLocation("Location unavailable");
      locEl.removeAttribute("title");
    }
  }

  function onGeoFailure(err, gen, options) {
    if (gen !== geoGeneration) return;
    options = options || {};
    if (!options.skipHighAccuracyRetry && err && (err.code === 2 || err.code === 3)) {
      if (locEl) setLocation("Locating…");
      navigator.geolocation.getCurrentPosition(
        function (pos) {
          onGeoSuccess(pos, gen);
        },
        function (e) {
          onGeoFailure(e, gen, { skipHighAccuracyRetry: true });
        },
        { enableHighAccuracy: true, maximumAge: 0, timeout: 35000 }
      );
      return;
    }

    applyGeoErrorToUI(err);
    if (weatherEl) {
      weatherEl.textContent = "—";
      weatherEl.removeAttribute("title");
    }
    lastMoodWeatherCode = null;
    applyVisitorMood(null);
  }

  function beginGeoRequest() {
    geoGeneration += 1;
    const gen = geoGeneration;
    if (locEl) setLocation("Locating…");
    if (weatherEl) weatherEl.textContent = "…";

    navigator.geolocation.getCurrentPosition(
      function (pos) {
        onGeoSuccess(pos, gen);
      },
      function (err) {
        onGeoFailure(err, gen, {});
      },
      { enableHighAccuracy: false, maximumAge: 0, timeout: 22000 }
    );
  }

  function startGeolocation() {
    if (!navigator.geolocation) {
      if (locEl) setLocation("Location not supported");
      if (weatherEl) weatherEl.textContent = "—";
      return;
    }

    if (!window.isSecureContext) {
      if (locEl) {
        setLocation("HTTPS required for location");
        locEl.setAttribute(
          "title",
          "Chrome only exposes geolocation on HTTPS (or localhost). Open your deployed site with https://"
        );
      }
      if (weatherEl) weatherEl.textContent = "—";
      return;
    }

    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions
        .query({ name: "geolocation" })
        .then(function (p) {
          if (p.state === "denied") {
            geoGeneration += 1;
            applyGeoErrorToUI({ code: 1 });
            if (weatherEl) {
              weatherEl.textContent = "—";
              weatherEl.removeAttribute("title");
            }
            lastMoodWeatherCode = null;
            applyVisitorMood(null);
            return;
          }
          beginGeoRequest();
        })
        .catch(function () {
          beginGeoRequest();
        });
    } else {
      beginGeoRequest();
    }
  }

  startGeolocation();
})();

// Navigation tabs (click + keyboard accessible)
const tabs = document.querySelectorAll(".tabs li");
const tabContents = document.querySelectorAll(".tab-content");
// Session ID for Supabase logging (chat, tabs, quiz)
// Must be declared before first tab activation to avoid TDZ errors.
let chatSessionId = null;

function setActiveTab(tabEl, { focus = false, scroll = true, log = true } = {}) {
  if (!tabEl) return;
  const targetId = tabEl.getAttribute("data-target");
  const panel = targetId ? document.getElementById(targetId) : null;

  // Fast-path: if nothing actually changes, do nothing. This prevents the
  // scroll-spy from churning the DOM (and the Supabase logger) on every
  // micro-scroll across a section boundary.
  if (tabEl.classList.contains("active") && (!panel || panel.classList.contains("active"))) {
    if (scroll && panel && typeof panel.scrollIntoView === "function") {
      panel.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    if (focus) tabEl.focus();
    return;
  }

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

  // Only log to Supabase on explicit user actions (click / keyboard / voice).
  // The scroll-spy calls us with log:false so wheel scrolling doesn't fire a
  // network request on every section boundary.
  if (log && targetId) {
    logTabEvent(targetId);
  }

  if (targetId === "news") {
    fetchNews();
  }

  if (scroll && panel && typeof panel.scrollIntoView === "function") {
    panel.scrollIntoView({ behavior: "smooth", block: "start" });
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

// Ensure initial ARIA state matches the active tab (no scroll on first load)
const initialActive = document.querySelector(".tabs li.active") || tabs[0];
if (initialActive) setActiveTab(initialActive, { scroll: false });

// Scroll-spy: update the active tab as the user scrolls between sections
(function initScrollSpy() {
  if (!("IntersectionObserver" in window)) return;
  const sections = Array.from(document.querySelectorAll("main .tab-content[id]"));
  if (!sections.length || !tabs.length) return;

  const tabByTarget = new Map();
  tabs.forEach((tab) => {
    const target = tab.getAttribute("data-target");
    if (target) tabByTarget.set(target, tab);
  });

  let lastActiveId = null;
  const visibility = new Map();

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        visibility.set(entry.target.id, entry.intersectionRatio);
      });
      let best = null;
      let bestRatio = 0;
      visibility.forEach((ratio, id) => {
        if (ratio > bestRatio) { best = id; bestRatio = ratio; }
      });
      if (best && best !== lastActiveId && bestRatio > 0) {
        lastActiveId = best;
        const tab = tabByTarget.get(best);
        if (tab && !tab.classList.contains("active")) {
          setActiveTab(tab, { scroll: false, log: false });
        }
      }
    },
    {
      root: null,
      // Detect when a section is roughly in the middle of the viewport so we
      // never flip the active tab while the user is still mid-section.
      rootMargin: "-40% 0px -45% 0px",
      threshold: 0
    }
  );

  sections.forEach((section) => observer.observe(section));
})();

// Add a "scrolled" class to the topbar once the page has moved past the hero.
// The handler is rAF-throttled so we never do work more than once per frame.
(function initTopbarScrolledClass() {
  const topbar = document.querySelector(".topbar");
  if (!topbar) return;

  let ticking = false;
  let lastScrolled = false;

  const apply = () => {
    const shouldBeScrolled = window.scrollY > 12;
    if (shouldBeScrolled !== lastScrolled) {
      topbar.classList.toggle("scrolled", shouldBeScrolled);
      lastScrolled = shouldBeScrolled;
    }
    ticking = false;
  };

  const onScroll = () => {
    if (!ticking) {
      window.requestAnimationFrame(apply);
      ticking = true;
    }
  };

  apply();
  window.addEventListener("scroll", onScroll, { passive: true });
})();

// News: fetch headlines when the News section becomes active

async function fetchNews() {
  const listEl = document.getElementById("news-list");
  if (!listEl) return;
  listEl.innerHTML = `<p class="news-loading">${t("newsLoading")}</p>`;
  listEl.setAttribute("aria-busy", "true");

  try {
    const base = window.location.origin;
    const res = await fetch(`${base}/api/news`);
    const data = await res.json();

    if (!res.ok) {
      listEl.innerHTML = `<p class="news-error">${t("newsUnavailable")}</p>`;
      listEl.setAttribute("aria-busy", "false");
      return;
    }

    const articles = data.articles || [];
    if (articles.length === 0) {
      listEl.innerHTML = `<p class="news-empty">${t("newsEmpty")}</p>`;
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
  } catch (err) {
    console.error("fetchNews error:", err);
    listEl.innerHTML = `<p class="news-error">${t("newsConnection")}</p>`;
    listEl.setAttribute("aria-busy", "false");
  }
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Live Nepal clock and date in the Hometown section
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

  if (clockElement) clockElement.innerText = now.toLocaleTimeString(currentLanguage === "en" ? "en-US" : currentLanguage, timeOptions);
  if (dateElement) dateElement.innerText = now.toLocaleDateString(currentLanguage === "en" ? "en-US" : currentLanguage, dateOptions);
}

function getNepalTimeForVoice() {
  const now = new Date();
  const locale = currentLanguage === "en" ? "en-US" : currentLanguage;
  const timeStr = now.toLocaleTimeString(locale, { timeZone: "Asia/Kathmandu", hour: 'numeric', minute: '2-digit', hour12: true });
  const dateStr = now.toLocaleDateString(locale, { timeZone: "Asia/Kathmandu", weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  return { timeStr, dateStr };
}

setInterval(updateNepalTime, 1000);
updateNepalTime();

// Fetch current weather from Open-Meteo (also cached for the voice assistant)
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

// Custom audio player used in the Favorites section
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
  if (playBtn) {
    playBtn.setAttribute('aria-pressed', isPlaying ? 'true' : 'false');
    playBtn.setAttribute('aria-label', isPlaying ? 'Pause' : 'Play');
  }
}

if (playBtn) {
  playBtn.setAttribute('aria-pressed', 'false');
  playBtn.setAttribute('aria-label', 'Play');
  playBtn.addEventListener('click', togglePlay);
}

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
  if (playBtn) {
    playBtn.setAttribute('aria-pressed', 'false');
    playBtn.setAttribute('aria-label', 'Play');
  }
});


// Quiz game logic (questions, scoring, Supabase logging)
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
  if (questionEl && questionEl.textContent.trim()) {
    questionEl.textContent = t("quizPromptStart");
  }

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
      questionEl.textContent = t("quizComplete");
      choicesEl.innerHTML = '';
      showEl(nextBtn, false);
      showEl(startBtn, true);
      startBtn.textContent = t("playAgain");
      resultEl.classList.remove('hidden');
      resultEl.innerHTML = `<strong>${t("yourScore")}: ${quizScore} / ${QUIZ_QUESTIONS.length}</strong><br>${quizScore === QUIZ_QUESTIONS.length ? t("quizResultPerfect") : quizScore >= QUIZ_QUESTIONS.length / 2 ? t("quizResultGood") : t("quizResultTry")}`;

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
    scoreEl.textContent = `${t("scoreLabel")}: ${quizScore} / ${quizIndex}`;
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
    scoreEl.textContent = `${t("scoreLabel")}: ${quizScore} / ${quizIndex + 1}`;
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
      nextBtn.textContent = t("quizNext");
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


// Voice assistant: speech recognition, command parsing, and TTS playback
const VoiceAssistant = (function() {
  const voiceBtn = document.getElementById('voice-btn');
  const voiceStatus = document.getElementById('voice-status');
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const synth = window.speechSynthesis;

  const THEMES = PORTFOLIO_ACCENT_THEMES;

  const ABOUT_RISHI = "Rishikesh Bastakoti is a Computer Science student at Caldwell University, class of 2028. He's from Kathmandu, Nepal, and is building a career in software development. He's built a full-stack QuickLoan app with React and FastAPI, and a Python Budget Tracker. He loves web development, algorithms, and in his free time enjoys the song Teemi Ra Maa by Dixita Karki, the movie Interstellar, and the city of Pokhara.";

  const HELP_PHRASE = "You can ask me: Who is Rishikesh, or tell me about him. Ask what's the weather or time in Kathmandu. Say play music or pause. Say change color to blue, red, green, purple, orange, pink, teal, or yellow. Say start video call or end video call. Or say show projects, games, contact, education, hometown, or favorites.";

  let currentUtterance = null;
  let isRecognizing = false;
  let resumeRecognitionAfterSpeech = false;
  let activeVoiceAbort = null;
  let activeTtsAudio = null;
  let activeTtsAbort = null;

  function stopSpeaking() {
    if (!synth) return;
    synth.cancel();
    currentUtterance = null;
    if (activeTtsAudio) {
      try { activeTtsAudio.pause(); } catch (e) {}
      activeTtsAudio = null;
    }
    if (activeTtsAbort) {
      try { activeTtsAbort.abort(); } catch (e) {}
      activeTtsAbort = null;
    }
  }

  async function speakViaApi(text) {
    const t = String(text ?? '').trim();
    if (!t) return false;

    stopSpeaking();

    if (activeTtsAbort) {
      try { activeTtsAbort.abort(); } catch (e) {}
    }
    activeTtsAbort = new AbortController();

    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: t }),
        signal: activeTtsAbort.signal
      });
      if (!res.ok) {
        let detail = '';
        try { detail = await res.text(); } catch (e) {}
        console.warn('[TTS] /api/tts failed:', res.status, detail);
        return false;
      }

      const blob = await res.blob();
      if (!blob || !blob.size) {
        console.warn('[TTS] /api/tts returned empty audio');
        return false;
      }
      const url = URL.createObjectURL(blob);
      const audioEl = new Audio(url);
      activeTtsAudio = audioEl;

      const cleanup = () => {
        try { URL.revokeObjectURL(url); } catch (e) {}
        if (activeTtsAudio === audioEl) activeTtsAudio = null;
      };
      audioEl.onended = cleanup;
      audioEl.onerror = cleanup;

      await audioEl.play();
      return true;
    } catch (e) {
      // If TTS fails, the caller will fall back to browser speech.
      console.warn('[TTS] speakViaApi error:', e);
      return false;
    } finally {
      activeTtsAbort = null;
    }
  }

  function speakBest(text) {
    const t = String(text ?? '').trim();
    if (!t) return;
    // Try ElevenLabs first, fall back to browser TTS.
    // (Don't block the UI; we only fall back if API fails.)
    (async () => {
      const ok = await speakViaApi(t);
      if (!ok) speak(t);
    })();
  }

  function abortPendingAI() {
    if (activeVoiceAbort) {
      try { activeVoiceAbort.abort(); } catch (e) {}
      activeVoiceAbort = null;
    }
  }

  function speak(text) {
    if (!synth) return;
    stopSpeaking();

    // Help reduce "assistant hears itself" loops, but still allow the user to say "stop"
    // mid-sentence (so we do NOT fully stop recognition here).
    if (typeof ignoreRecognitionUntilMs !== 'undefined') {
      ignoreRecognitionUntilMs = Date.now() + 250;
    }
    resumeRecognitionAfterSpeech = false;

    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.95;
    u.pitch = 1;
    u.onend = () => {
      currentUtterance = null;
    };
    u.onerror = () => {
      currentUtterance = null;
    };
    currentUtterance = u;
    synth.speak(u);
  }

  function applyTheme(name) {
    return applyPortfolioAccent(name);
  }

  function switchTab(targetId) {
    const tab = document.querySelector(`.tabs li[data-target="${targetId}"]`);
    if (!tab) return false;
    // Reuse the main tab logic so analytics + special behaviors (like News fetching) run
    setActiveTab(tab);
    return true;
  }

  function handleCommand(text, forChat) {
    const t = String(text || "")
      .trim()
      .toLowerCase()
      .replace(/\bthem\b/g, "theme")
      .replace(/\bthme\b/g, "theme")
      .replace(/\bcolou?r\b/g, "color");
    const clean = t.replace(/[?!.,]/g, " ");
    const lower = clean;
    const words = clean.split(/\s+/).filter(Boolean);
    const has = (w) => words.includes(w);
    const hasAny = (...ws) => ws.some((w) => words.includes(w));
    function doAction(actionFn) {
      if (typeof actionFn !== 'function') return false;
      if (forChat) {
        setTimeout(() => {
          try { actionFn(); } catch (e) {}
        }, 700);
        return true;
      }
      return actionFn();
    }
    function reply(msg) {
      if (!forChat) speakBest(msg);
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

    // Small-talk: answer these before greeting/about matchers.
    // STT often captures "hello, how are you" as just "hello" or "hi are you".
    const isHowAreYouIntent =
      /\bhow\s+are\s+you\b/.test(lower) ||
      /\bhow(?:'s| is)\s+it\s+going\b/.test(lower) ||
      /\bwhat(?:'s| is)\s+up\b/.test(lower) ||
      /\bhow\s+you\s+doin\b/.test(lower) ||
      (has('are') && has('you') && (has('how') || has('hi') || has('hey') || has('hello')));
    if (!forChat && isHowAreYouIntent) {
      return reply("I'm doing well — how can I help?");
    }

    // Greetings — only handle for very short openers to avoid hijacking real questions.
    const isGreetingIntent =
      (hasAny('hi','hello','hey','yo','sup') && words.length <= 2) ||
      lower.startsWith('good morning') ||
      lower.startsWith('good afternoon') ||
      lower.startsWith('good evening');
    if (!forChat && isGreetingIntent) {
      // Use "Hello" instead of "Hi" (avoids awkward "he"/"hi" pronunciations in some voices).
      return reply("Hello! What can I help you with?");
    }

    // About Rishikesh — maximum forgiveness: catch every possible mishearing
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
        speakBest("Checking the weather for Kathmandu. One moment.");
        getWeather().then(() => {
          if (lastWeather.temp != null) speakBest(`In Kathmandu it's ${Math.round(lastWeather.temp)}°C.`);
          else speakBest("Weather is unavailable right now.");
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
      if (!isPlaying) { doAction(() => togglePlay()); return reply('Playing music.'); }
      return reply('Music is already playing.');
    }

    // Pause music — phrases like "pause the music", "stop song", or "pause music"
    if (hasAny('pause','stop') && hasAny('music','song','songs')) {
      if (isPlaying) { doAction(() => togglePlay()); return reply('Music paused.'); }
      return reply('Music is already paused.');
    }

    // Color / theme (e.g. "change color to red", "make it blue theme").
    // Require an action verb to avoid hijacking questions like "what is your favorite color".
    const colorNames = Object.keys(THEMES);
    let pickedColor = null;
    for (const c of colorNames) {
      if (has(c)) { pickedColor = c; break; }
    }
    if (
      pickedColor &&
      hasAny("change", "make", "set", "switch", "theme", "color", "update", "turn")
    ) {
      const color = pickedColor.toLowerCase();
      if (THEMES[color] && doAction(() => applyTheme(color))) {
        return reply(`Theme changed to ${color}.`);
      }
    }

    // Video call — "start video call", "video call", "call video", "end video call", "hang up video"
    const wantsVideoCall =
      (hasAny('start', 'make', 'begin', 'open') && hasAny('video') && hasAny('call')) ||
      (has('video') && has('call') && words.length <= 4);
    if (wantsVideoCall) {
      if (typeof startVideoCall === 'function' && typeof isInVideoCall !== 'undefined' && !isInVideoCall) {
        doAction(() => startVideoCall());
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
        doAction(() => endVideoCall());
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
        doAction(() => startAudioCall());
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
        if (doAction(() => switchTab(id))) return reply(`Opening ${keyword}.`);
      }
    }
    if (/(show|go\s*to|open|switch to)\s*(intro|projects|education|hometown|favorites|games|news|contact)/.test(t)) {
      const id = t.match(/(intro|projects|education|hometown|favorites|games|news|contact)/)[1];
      if (doAction(() => switchTab(id))) return reply(`Opening ${id}.`);
    }

    return false;
  }

  // Keep a single SpeechRecognition instance for the whole session
  let recognition = null;
  let noSpeechRetry = false;
  let wasPlayingBeforeMic = false;
  let isCallListening = false;
  let ignoreRecognitionUntilMs = 0;
  let callMode = 'normal'; // 'normal' | 'push_to_talk'
  let callTurnActive = false;
  let callTurnResolve = null;
  let callTurnReject = null;
  let callTurnTimeoutId = null;

  function getRecognition() {
    if (!SpeechRecognition) return null;
    if (recognition) {
      recognition.lang = currentLanguage === "en" ? "en-US" : currentLanguage;
      return recognition;
    }

    recognition = new SpeechRecognition();
    // Default: single-turn listening to avoid "assistant talks to itself" loops.
    // During calls we restart on end to simulate continuous listening.
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = currentLanguage === "en" ? "en-US" : currentLanguage;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      isRecognizing = true;
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
      isRecognizing = false;
      if (voiceBtn) voiceBtn.classList.remove('listening');
      if (voiceStatus) voiceStatus.classList.remove('active');

      // After listening, if music was playing before and got paused, resume it
      if (wasPlayingBeforeMic && isPlaying && audio.paused) {
        audio.play().catch(() => {});
      }

      // During an active call, keep recognition running only for continuous call mode.
      // In push-to-talk, we stop after each utterance.
      if (isCallListening && callMode !== 'push_to_talk' && typeof isInCall !== 'undefined' && isInCall) {
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
      // If we just stopped a call / just spoke, ignore any stray mic pickup.
      if (Date.now() < ignoreRecognitionUntilMs) return;

      const result = e.results[e.results.length - 1];
      const transcript = (result[0]?.transcript || '').trim();
      const isFinal = result.isFinal;

      if (!transcript) return;
      if (!isFinal) {
        if (voiceStatus) voiceStatus.textContent = '"' + transcript + '"';
        return;
      }

      // While the assistant is speaking, only pay attention to clear "stop" style interrupts
      // so it doesn't respond to its own voice but still lets the user pause it.
      if (synth && (synth.speaking || synth.pending)) {
        const lower = transcript.toLowerCase().trim();
        const clean = lower.replace(/[?!.,]/g, ' ');
        const words = clean.split(/\s+/).filter(Boolean);
        const has = (w) => words.includes(w);
        const isStopLike =
          (has('stop') && words.length <= 3) ||
          clean === 'ok stop' ||
          clean === 'okay stop';
        if (isStopLike) {
          handleCommand(transcript);
        }
        return;
      }

      // Stop mic for single-turn interactions (prevents TTS feedback loops).
      if (!isCallListening) {
        try { recognition.stop(); } catch (e) {}
      }

      // Push-to-talk call mode: resolve the captured utterance first and do NOT
      // run the normal voice assistant command/AI pipeline here. The active
      // audio/video call controller will decide what to do with the transcript.
      if (callMode === 'push_to_talk' && callTurnActive) {
        callTurnActive = false;
        if (callTurnTimeoutId) {
          clearTimeout(callTurnTimeoutId);
          callTurnTimeoutId = null;
        }
        const r = callTurnResolve;
        callTurnResolve = null;
        callTurnReject = null;
        if (r) r(transcript);
        return;
      }

      // 1) Try command handler first so voice commands stay in control
      if (handleCommand(transcript)) return;

      // 2) If no command matched, fall back to AI chatbot and speak its reply
      if (voiceStatus) {
        voiceStatus.textContent = 'Thinking...';
        voiceStatus.classList.add('active');
      }

      // Abort any previous in-flight AI request triggered by voice.
      abortPendingAI();
      activeVoiceAbort = new AbortController();
      getAIResponse(transcript, { signal: activeVoiceAbort.signal })
        .then((result) => {
          const finalResult = runAgentResult(result);
          if (finalResult.reply) speakBest(finalResult.reply);
        })
        .catch(() => {
          // If we intentionally aborted (e.g., user ended call), stay quiet.
          if (activeVoiceAbort && activeVoiceAbort.signal && activeVoiceAbort.signal.aborted) return;
          speakBest("I didn't catch that. Try again or say help.");
        })
        .finally(() => {
          activeVoiceAbort = null;
          if (voiceStatus) voiceStatus.classList.remove('active');
        });
    };

    recognition.onnomatch = () => {
      speakBest("I heard you but couldn't match it. Say help to hear options.");
    };

    recognition.onerror = (e) => {
      isRecognizing = false;
      if (voiceBtn) voiceBtn.classList.remove('listening');
      if (voiceStatus) voiceStatus.classList.remove('active');

      if (e.error === 'no-speech' && !noSpeechRetry) {
        noSpeechRetry = true;
        speakBest("I didn't hear anything. Try again and speak right away.");
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
      speakBest(msg);
    };

    return recognition;
  }

  function beginContinuousListening() {
    isCallListening = true;
    callMode = 'normal';
    const rec = getRecognition();
    if (!rec) return;
    rec.lang = currentLanguage === "en" ? "en-US" : currentLanguage;
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

  function setCallMode(mode) {
    callMode = mode === 'push_to_talk' ? 'push_to_talk' : 'normal';
  }

  function listenOnceForCall({ timeoutMs = 9000 } = {}) {
    const rec = getRecognition();
    if (!rec) return Promise.reject(new Error('SpeechRecognition not supported'));
    if (typeof isInCall !== 'undefined' && typeof isInVideoCall !== 'undefined' && !isInCall && !isInVideoCall) {
      return Promise.reject(new Error('Not in call'));
    }
    if (callMode !== 'push_to_talk') return Promise.reject(new Error('Call mode is not push-to-talk'));

    // Cancel any previous call turn cleanly
    if (callTurnActive && callTurnReject) {
      try { callTurnReject(new Error('Cancelled')); } catch (e) {}
    }
    callTurnActive = true;

    return new Promise((resolve, reject) => {
      callTurnResolve = resolve;
      callTurnReject = reject;

      if (callTurnTimeoutId) clearTimeout(callTurnTimeoutId);
      callTurnTimeoutId = setTimeout(() => {
        callTurnTimeoutId = null;
        callTurnActive = false;
        callTurnResolve = null;
        callTurnReject = null;
        reject(new Error('timeout'));
        try { rec.stop(); } catch (e) {}
      }, timeoutMs);

      try { rec.start(); } catch (e) {}
    });
  }

  function hardStop() {
    // Stop everything the assistant can do: TTS, recognition, pending AI
    abortPendingAI();
    stopSpeaking();
    stopContinuousListening();
    ignoreRecognitionUntilMs = Date.now() + 800;
  }

  async function startListening() {
    if (!SpeechRecognition) {
      speakBest('Voice recognition is not supported in this browser. Try Chrome or Edge.');
      return;
    }
    // If the assistant is currently speaking, treat a mic-tap as an interrupt.
    if (synth && (synth.speaking || synth.pending)) {
      stopSpeaking();
      if (typeof ignoreRecognitionUntilMs !== 'undefined') ignoreRecognitionUntilMs = Date.now() + 600;
      return;
    }
    // Don't mix voice assistant with calls/video calls
    if (typeof isInCall !== 'undefined' && isInCall) {
      speakBest("You're in a call right now. End the call to use the voice assistant.");
      return;
    }
    if (typeof isInVideoCall !== 'undefined' && isInVideoCall) {
      speakBest("You're in a video call right now. End the video call to use the voice assistant.");
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

  // ESC can always stop speech (useful if the assistant is being verbose)
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (synth && (synth.speaking || synth.pending)) {
      stopSpeaking();
      if (typeof ignoreRecognitionUntilMs !== 'undefined') ignoreRecognitionUntilMs = Date.now() + 600;
    }
  });

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

  return { speak, speakViaApi, handleCommand, applyTheme, beginContinuousListening, stopContinuousListening, hardStop, setCallMode, listenOnceForCall };
})();


// AI chatbot powered by Groq


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
const videoCallTalkBtn = document.getElementById('video-call-talk-btn');
const videoCallEndBtn = document.getElementById('video-call-end-btn');
const videoCallMuteBtn = document.getElementById('video-call-mute-btn');
const videoCallStatus = document.getElementById('video-call-status');
let anamClient = null;
let anamSdk = null;
let isVideoMuted = false;

// --- b. CONFIGURATION & STATE ---
const API_URL = "/api/chat";
const MAX_HISTORY = 20; // Increased to allow better context retention
let isCoolingDown = false;
let isInCall = false;
let callTimerInterval = null;
let callStartTime = null;
let isInVideoCall = false;
const RINGTONE_URL = 'https://raw.githubusercontent.com/reseekesh821/music/main/standardringtone.mp3';
const HANGUP_URL = 'https://raw.githubusercontent.com/reseekesh821/music/main/freesound_community-mobile_phone_hanging_up-94525.mp3';
let ringtoneAudio = null;
let hangupAudio = null;
let callRingTimeoutId = null;

// Session ID for Supabase logging (chat, tabs, quiz)
const CHAT_SESSION_STORAGE_KEY = 'portfolio-chat-session-id';

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
function setChatFabLabels(open) {
  if (!chatToggle) return;
  chatToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  chatToggle.setAttribute('aria-label', open ? 'Close chat' : 'Open chat');
}

if (chatToggle) {
  chatToggle.addEventListener('click', () => {
    const willOpen = !chatBox.classList.contains('open');
    chatBox.classList.toggle('open');
    setChatFabLabels(willOpen);
    if (willOpen && userInput) setTimeout(() => userInput.focus(), 0);
  });
}
if (closeChat) {
  closeChat.addEventListener('click', () => {
    chatBox.classList.remove('open');
    setChatFabLabels(false);
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
  setChatFabLabels(false);
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
function looksLikePortfolioCommand(input) {
  const t = (input || '').toLowerCase();
  if (!t) return false;

  // common typos / variants
  const normalized = t
    .replace(/\bthem\b/g, 'theme')
    .replace(/\bthme\b/g, 'theme')
    .replace(/\bcolou?r\b/g, 'color');

  const hasAny = (arr) => arr.some((w) => normalized.includes(w));

  const colors = ["cyan", "blue", "purple", "green", "red", "orange", "pink", "teal", "yellow"];
  const colorIntent =
    hasAny(colors) &&
    hasAny(["change", "set", "switch", "make", "theme", "color", "update", "turn"]);

  const musicIntent = hasAny(['play music','play song','pause music','pause song','play','pause']) && hasAny(['music','song','songs','track','audio']);

  const callIntent =
    hasAny(['video call','start video','end video','hang up','call me','audio call','start call','end call']) ||
    (normalized.includes('call') && hasAny(['start','end','video','audio','hang']));

  const navIntent = hasAny(['show ','open ','go to ','switch to ']) &&
    hasAny(['intro','projects','education','hometown','favorites','games','news','contact']);

  const helpIntent = hasAny(['what can you do','show commands','help']);

  return colorIntent || musicIntent || callIntent || navIntent || helpIntent;
}

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

  // If it *looks like* a portfolio command but didn't match, don't send it to Groq.
  // This prevents "conflicts" where Groq answers instead of executing a command.
  if (looksLikePortfolioCommand(text)) {
    const fallback = "I think you're trying to use a portfolio command. Try: “change color to green”, “play music”, “show projects”, “start video call”, or “help”.";
    addMessage(fallback, 'bot-message');
    logChatMessage('assistant', fallback);
    if (quickRepliesContainer) {
      quickRepliesContainer.style.display = 'flex';
      chatMessages.appendChild(quickRepliesContainer);
    }
    chatMessages.scrollTop = chatMessages.scrollHeight;
    setTimeout(() => { isCoolingDown = false; sendBtn.disabled = false; }, 600);
    return;
  }

  showTyping();
  const result = runAgentResult(await getAIResponse(text), {
    deferVisualActions: true
  });
  hideTyping();
  addMessage(result.reply, 'bot-message');
  logChatMessage('assistant', result.reply);

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
  chatStatusText.textContent = isOnline ? t("chatOnline") : t("chatOffline");
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
  if (videoCallTalkBtn) {
    videoCallTalkBtn.addEventListener('click', handleVideoCallTalk);
  }
  if (videoCallMuteBtn) {
    videoCallMuteBtn.addEventListener('click', () => {
      if (!isInVideoCall || !anamClient) return;
      isVideoMuted = !isVideoMuted;
      if (anamClient && typeof anamClient.muteInputAudio === 'function') {
        try {
          if (isVideoMuted) anamClient.muteInputAudio();
          else anamClient.unmuteInputAudio();
        } catch (e) {
          // Ignore if not ready
        }
      }
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

const AGENT_EXTERNAL_LINKS = {
  github: 'https://github.com/reseekesh821',
  linkedin: 'https://www.linkedin.com/in/rbastakoti1/',
  resume: 'https://cdn.jsdelivr.net/gh/reseekesh821/music@main/Rishikesh_Bastakoti_Resume-upadted2026.pdf'
};

function normalizeSearchQuery(value) {
  const input = String(value || '').trim();
  if (!input) return '';
  return input
    .replace(/^(search|find|look up|lookup|show me|open)\s+/i, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function buildSearchUrl(query, provider) {
  const cleanQuery = normalizeSearchQuery(query);
  if (!cleanQuery) return '';
  const encoded = encodeURIComponent(cleanQuery);
  const normalizedProvider = String(provider || '').trim().toLowerCase();

  switch (normalizedProvider) {
    case 'amazon':
      return `https://www.amazon.com/s?k=${encoded}`;
    case 'bestbuy':
      return `https://www.bestbuy.com/site/searchpage.jsp?st=${encoded}`;
    case 'ebay':
      return `https://www.ebay.com/sch/i.html?_nkw=${encoded}`;
    case 'youtube':
      return `https://www.youtube.com/results?search_query=${encoded}`;
    case 'google':
    default:
      return `https://www.google.com/search?q=${encoded}`;
  }
}

function getEffectiveSearchProvider(query, provider) {
  const normalizedProvider = String(provider || '').trim().toLowerCase();
  if (normalizedProvider) return normalizedProvider;
  return chooseSearchProvider(query);
}

function chooseSearchProvider(query) {
  const cleanQuery = normalizeSearchQuery(query);
  if (!cleanQuery) return false;
  const q = cleanQuery.toLowerCase();

  if (/(review|reviews|unboxing|hands on|vs|comparison|compare|tutorial|how to|demo|watch|video|videos|youtube|trailer|song|songs|music video|lyrics|interview|live performance|performance|clip)/.test(q)) {
    return 'youtube';
  }
  if (/(used|second hand|second-hand|refurbished|vintage|collectible|rare)/.test(q)) {
    return 'ebay';
  }
  if (/(iphone|phone|smartphone|laptop|macbook|ipad|tablet|monitor|tv|television|headphones|earbuds|camera|keyboard|mouse|gpu|graphics card|pc|computer|console|playstation|xbox|nintendo|printer|router|ssd|hard drive|charger)/.test(q)) {
    return 'bestbuy';
  }
  return 'amazon';
}

function openSearchTab(query, provider) {
  const effectiveProvider = getEffectiveSearchProvider(query, provider);
  const url = buildSearchUrl(query, effectiveProvider);
  if (!url) return false;
  const opened = window.open(url, '_blank', 'noopener,noreferrer');
  return !!opened;
}

function openExternalLink(url) {
  const cleanUrl = String(url || '').trim();
  if (!/^https?:\/\//i.test(cleanUrl)) return false;
  const opened = window.open(cleanUrl, '_blank', 'noopener,noreferrer');
  return !!opened;
}

function isBlockedAdultQuery(value) {
  const t = String(value || '').toLowerCase();
  return /(porn|porno|pornhub|xvideos|xnxx|sex video|adult video|adult site|nude|nudes|nsfw|xxx|explicit sex|erotic)/.test(t);
}

function finalizeAgentResult(result) {
  const safeResult = result && typeof result === 'object'
    ? result
    : { reply: '', action: 'reply_only', params: {} };
  const safeParams =
    safeResult.params && typeof safeResult.params === 'object' && !Array.isArray(safeResult.params)
      ? { ...safeResult.params }
      : {};
  let safeReply = String(safeResult.reply || '').trim();

  if (
    (safeResult.action === 'open_search_tab' && isBlockedAdultQuery(safeParams.query)) ||
    (safeResult.action === 'open_external_link' && isBlockedAdultQuery(safeParams.url))
  ) {
    return {
      reply: "Sorry, I can't help open adult content or porn sites.",
      action: 'reply_only',
      params: {}
    };
  }

  if (safeResult.action === 'open_search_tab') {
    const query = normalizeSearchQuery(safeParams.query);
    const provider = getEffectiveSearchProvider(query, safeParams.provider);
    safeParams.provider = provider;
    if (query && (!safeReply || /opening search results/i.test(safeReply) || /opening results/i.test(safeReply))) {
      if (provider === 'youtube') safeReply = `Pulling up videos for ${query}.`;
      else safeReply = `Checking ${query} for you.`;
    }
  }

  if (safeResult.action === 'play_music' && !safeReply) {
    safeReply = 'Playing music.';
  }

  if (safeResult.action === 'pause_music' && !safeReply) {
    safeReply = 'Pausing the music.';
  }

  return {
    reply: safeReply,
    action: safeResult.action || 'reply_only',
    params: safeParams
  };
}

function shouldDelayAgentAction(action) {
  return action === 'open_search_tab' || action === 'open_external_link';
}

function runAgentResult(result, { deferVisualActions = false } = {}) {
  const finalResult = finalizeAgentResult(result);
  const runAction = () => executeAgentAction(finalResult.action, finalResult.params);

  if (deferVisualActions && shouldDelayAgentAction(finalResult.action)) {
    setTimeout(runAction, 900);
  } else {
    runAction();
  }

  return finalResult;
}

function executeAgentAction(action, params = {}) {
  switch (action) {
    case 'reply_only':
      return true;
    case 'switch_tab':
      return switchTab(String(params.target || '').toLowerCase());
    case 'open_search_tab':
      return openSearchTab(params.query, params.provider);
    case 'open_external_link': {
      const key = String(params.url || '').trim().toLowerCase();
      const resolvedUrl = AGENT_EXTERNAL_LINKS[key] || params.url;
      return openExternalLink(resolvedUrl);
    }
    case 'play_music':
      if (!isPlaying) togglePlay();
      return true;
    case 'pause_music':
      if (isPlaying) togglePlay();
      return true;
    case 'start_audio_call':
      startAudioCall();
      return true;
    case 'end_audio_call':
      endAudioCall();
      return true;
    case 'start_video_call':
      startVideoCall();
      return true;
    case 'end_video_call':
      endVideoCall();
      return true;
    default:
      return false;
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

function setVoiceButtonDisabled(disabled) {
  const btn = document.getElementById('voice-btn');
  if (!btn) return;
  btn.disabled = !!disabled;
  if (disabled) {
    btn.classList.remove('listening');
    btn.setAttribute('aria-disabled', 'true');
    btn.setAttribute('title', 'Voice assistant disabled during calls');
  } else {
    btn.removeAttribute('aria-disabled');
    btn.setAttribute('title', 'Voice assistant');
  }
}

function handleVideoCallTalk() {
  if (!isInVideoCall || !videoCallTalkBtn || videoCallTalkBtn.disabled) return;
  if (!VoiceAssistant || !VoiceAssistant.listenOnceForCall) return;

  videoCallTalkBtn.classList.add('recording');
  videoCallTalkBtn.innerHTML = '<i class="fa-solid fa-wave-square"></i>';
  videoCallTalkBtn.setAttribute('aria-label', 'Listening during video call');
  if (videoCallStatus) videoCallStatus.textContent = 'Listening...';

  VoiceAssistant.listenOnceForCall({ timeoutMs: 10000 })
    .then(async (transcript) => {
      if (!isInVideoCall) return;
      const text = (transcript || '').trim();
      if (!text) return;

      const commandReply = VoiceAssistant && VoiceAssistant.handleCommand
        ? VoiceAssistant.handleCommand(text, true)
        : false;
      if (commandReply !== false && typeof commandReply === 'string') {
        if (videoCallStatus) {
          videoCallStatus.textContent = commandReply;
          setTimeout(() => {
            if (isInVideoCall && videoCallStatus) videoCallStatus.textContent = 'On video call';
          }, 2200);
        }
        return;
      }

      if (videoCallStatus) videoCallStatus.textContent = 'Working on it...';
      const result = runAgentResult(await getAIResponse(text), { deferVisualActions: true });
      if (videoCallStatus) {
        videoCallStatus.textContent = result.reply || 'Done.';
        setTimeout(() => {
          if (isInVideoCall && videoCallStatus) videoCallStatus.textContent = 'On video call';
        }, 2200);
      }
    })
    .catch(() => {
      // timeout/cancel/no-speech: stay quiet
      if (isInVideoCall && videoCallStatus) videoCallStatus.textContent = 'On video call';
    })
    .finally(() => {
      if (!videoCallTalkBtn) return;
      videoCallTalkBtn.classList.remove('recording');
      videoCallTalkBtn.innerHTML = '<i class="fa-solid fa-wave-square"></i>';
      videoCallTalkBtn.setAttribute('aria-label', 'Speak during video call');
    });
}

function startAudioCall() {
  if (!VoiceAssistant || isInCall || !callScreen || !callStatusText || !callTimerEl) return;
  isInCall = true;
  setVoiceButtonDisabled(true);
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
  if (callRingTimeoutId) {
    clearTimeout(callRingTimeoutId);
    callRingTimeoutId = null;
  }
  callRingTimeoutId = setTimeout(() => {
    callRingTimeoutId = null;
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
      callRecordBtn.textContent = 'Talk';
      callRecordBtn.setAttribute('aria-label', 'Talk (push to talk)');
    }
    // Use push-to-talk during calls for a smooth "messenger call" feel (prevents self-feedback loops).
    if (VoiceAssistant && VoiceAssistant.setCallMode) VoiceAssistant.setCallMode('push_to_talk');
    (async () => {
      const greet = "Hello. How can I help you today?";
      const ok = VoiceAssistant && VoiceAssistant.speakViaApi ? await VoiceAssistant.speakViaApi(greet) : false;
      if (!ok) VoiceAssistant.speak(greet);
    })();
  }, 9000);

  if (callRecordBtn) {
    callRecordBtn.classList.remove('recording');
  }

  if (callRecordBtn && !callRecordBtn.__bound) {
    callRecordBtn.addEventListener('click', () => {
      if (!isInCall || callRecordBtn.disabled) return;
      if (!VoiceAssistant || !VoiceAssistant.listenOnceForCall) return;

      callRecordBtn.classList.add('recording');
      callRecordBtn.textContent = 'Listening…';
      callRecordBtn.setAttribute('aria-label', 'Listening…');

      VoiceAssistant.listenOnceForCall({ timeoutMs: 10000 })
        .then(async (transcript) => {
          if (!isInCall) return;
          const text = (transcript || '').trim();
          if (!text) return;
          // Feed it through the same AI pipeline used by chat, then speak the reply.
          const result = runAgentResult(await getAIResponse(text));
          if (!result.reply) return;
          const ok = VoiceAssistant && VoiceAssistant.speakViaApi ? await VoiceAssistant.speakViaApi(result.reply) : false;
          if (!ok) VoiceAssistant.speak(result.reply);
        })
        .catch(() => {
          // timeout/cancel/no-speech: stay quiet
        })
        .finally(() => {
          if (!callRecordBtn) return;
          callRecordBtn.classList.remove('recording');
          callRecordBtn.textContent = 'Talk';
          callRecordBtn.setAttribute('aria-label', 'Talk (push to talk)');
        });
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
  setVoiceButtonDisabled(false);
  if (callRingTimeoutId) {
    clearTimeout(callRingTimeoutId);
    callRingTimeoutId = null;
  }
  if (VoiceAssistant && VoiceAssistant.stopContinuousListening) {
    VoiceAssistant.stopContinuousListening();
  }
  if (VoiceAssistant && VoiceAssistant.hardStop) {
    VoiceAssistant.hardStop();
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

// --- VIDEO CALL (Anam) ---

function destroyVideoCallSession() {
  // Stop Anam if active
  if (anamClient && typeof anamClient.stopStreaming === 'function') {
    try {
      anamClient.stopStreaming();
    } catch (e) {}
  }
  anamClient = null;
  anamSdk = null;

  if (videoCallFrame) videoCallFrame.innerHTML = '';
}

async function startVideoCall() {
  if (isInVideoCall || isInCall) return;
  if (!videoCallScreen || !videoCallFrame || !videoCallConnecting) return;

  destroyVideoCallSession();

  isInVideoCall = true;
  setVoiceButtonDisabled(true);
  isVideoMuted = false;
  videoCallScreen.classList.add('active');
  if (videoCallConnecting) videoCallConnecting.classList.remove('hidden');
  if (videoCallStatus) videoCallStatus.textContent = 'Ringing...';
  if (videoCallEndBtn) videoCallEndBtn.disabled = false;
  if (videoCallMuteBtn) {
    videoCallMuteBtn.classList.remove('muted');
    videoCallMuteBtn.innerHTML = '<i class="fa-solid fa-microphone-slash"></i>';
  }
  if (videoCallTalkBtn) {
    videoCallTalkBtn.disabled = false;
    videoCallTalkBtn.classList.remove('recording');
    videoCallTalkBtn.innerHTML = '<i class="fa-solid fa-wave-square"></i>';
    videoCallTalkBtn.setAttribute('aria-label', 'Speak during video call');
  }

  if (chatMessages) chatMessages.style.display = 'none';
  if (typingIndicator) typingIndicator.style.display = 'none';
  if (quickRepliesContainer) quickRepliesContainer.style.display = 'none';
  if (voiceStatus) voiceStatus.style.display = 'none';
  if (chatInputArea) chatInputArea.style.display = 'none';

  const ringStartMs = Date.now();
  const MIN_RING_MS = 9000; // ~2 full tones / consistent "ringing" UX
  playRingtone();

  try {
    // 1) Create Anam session token (server-side exchange for security)
    const res = await fetch('/api/anam-session', { method: 'POST' });
    const data = await res.json();

    if (!res.ok || !data.session_token) {
      console.error('Anam session response:', data);
      const detailText = (data && data.detail) ? JSON.stringify(data.detail) : '';
      const raw = detailText || data.error || '';
      if (res.status === 401 || raw.toLowerCase().includes('invalid api key')) {
        throw new Error('Server rejected the Anam API key. Create a new key and redeploy.');
      }
      if (raw.toLowerCase().includes('out of') && raw.toLowerCase().includes('credits')) {
        throw new Error('Video call is temporarily unavailable. Please try again later.');
      }
      throw new Error('Unable to connect right now. Try again later.');
    }

    // Keep ringing a consistent amount before showing the avatar
    const remainingRing = Math.max(0, MIN_RING_MS - (Date.now() - ringStartMs));
    if (remainingRing) await new Promise((r) => setTimeout(r, remainingRing));

    stopRingtone();
    if (videoCallStatus) videoCallStatus.textContent = 'Connecting...';
    if (VoiceAssistant && VoiceAssistant.setCallMode) VoiceAssistant.setCallMode('push_to_talk');

    // 2) Load Anam SDK in-browser (no bundler required)
    if (!anamSdk) {
      anamSdk = await import('https://esm.sh/@anam-ai/js-sdk@latest');
    }

    // 3) Render videos:
    // - background: blurred + cover (fills the frame, no black bars)
    // - foreground: contain (shows full face, "zoomed out")
    const fgId = 'anam-video-foreground';
    const bgId = 'anam-video-background';
    videoCallFrame.innerHTML =
      `<div class="anam-video-stack">` +
        `<video id="${bgId}" class="anam-video anam-video-bg" autoplay playsinline muted></video>` +
        `<video id="${fgId}" class="anam-video anam-video-fg" autoplay playsinline></video>` +
      `</div>`;

    anamClient = anamSdk.createClient(data.session_token, {
      disableInputAudio: false
    });

    if (anamSdk.AnamEvent && typeof anamClient.addListener === 'function') {
      anamClient.addListener(anamSdk.AnamEvent.CONNECTION_ESTABLISHED, () => {
        if (videoCallConnecting) videoCallConnecting.classList.add('hidden');
      });
      anamClient.addListener(anamSdk.AnamEvent.CONNECTION_CLOSED, () => {
        endVideoCall();
      });
    }

    await anamClient.streamToVideoElement(fgId);

    // Mirror the same stream onto the blurred background video.
    // Some browsers/SDK paths attach srcObject asynchronously, so wait briefly.
    const fgEl = document.getElementById(fgId);
    const bgEl = document.getElementById(bgId);
    if (fgEl && bgEl) {
      const start = Date.now();
      while (!fgEl.srcObject && Date.now() - start < 2500) {
        await new Promise((r) => setTimeout(r, 50));
      }
      if (fgEl.srcObject && !bgEl.srcObject) {
        try {
          bgEl.srcObject = fgEl.srcObject;
          // background is muted so autoplay is allowed
          bgEl.play().catch(() => {});
        } catch (e) {
          // Foreground still works even if background can't autoplay
        }
      }
    }

    if (videoCallConnecting) videoCallConnecting.classList.add('hidden');

    // Fallback: hide connecting overlay after 10s
    setTimeout(() => {
      if (isInVideoCall && videoCallConnecting) {
        videoCallConnecting.classList.add('hidden');
      }
    }, 10000);

  } catch (err) {
    console.error('Video call error:', err);
    // Preserve the "ringing" feel even on fast failures
    const remainingRing = Math.max(0, MIN_RING_MS - (Date.now() - ringStartMs));
    if (remainingRing) await new Promise((r) => setTimeout(r, remainingRing));

    stopRingtone();
    if (videoCallStatus) videoCallStatus.textContent = 'Could not connect: ' + (err?.message || 'Unknown error');
    setTimeout(() => {
      endVideoCall();
    }, 4000);
  }
}

function endVideoCall() {
  if (!isInVideoCall && !anamClient) return;
  isInVideoCall = false;
  setVoiceButtonDisabled(false);
  stopRingtone();
  playHangup();

  destroyVideoCallSession();

  if (videoCallScreen) videoCallScreen.classList.remove('active');
  if (videoCallConnecting) videoCallConnecting.classList.remove('hidden');
  if (videoCallEndBtn) videoCallEndBtn.disabled = true;
  if (videoCallMuteBtn) {
    videoCallMuteBtn.classList.remove('muted');
    videoCallMuteBtn.innerHTML = '<i class="fa-solid fa-microphone"></i>';
  }
  if (videoCallTalkBtn) {
    videoCallTalkBtn.disabled = true;
    videoCallTalkBtn.classList.remove('recording');
    videoCallTalkBtn.innerHTML = '<i class="fa-solid fa-microphone-lines"></i>';
    videoCallTalkBtn.setAttribute('aria-label', 'Speak during video call');
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

async function getAIResponse(userMessage, { signal } = {}) {
  try {
    // Add User Message to History BEFORE sending
    conversationHistory.push({ role: "user", content: userMessage });

    // Fetch from Backend
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: conversationHistory, language: currentLanguage }),
      signal
    });

    if (!response.ok) throw new Error("API Error");

    const data = await response.json();
    const botReply =
      typeof data?.reply === 'string' && data.reply.trim()
        ? data.reply.trim()
        : "I'm having trouble connecting. Please try again.";
    const action =
      typeof data?.action === 'string' && data.action.trim()
        ? data.action.trim()
        : 'reply_only';
    const params =
      data?.params && typeof data.params === 'object' && !Array.isArray(data.params)
        ? data.params
        : {};

    // Add Assistant Reply to History
    conversationHistory.push({ role: "assistant", content: botReply });

    // Manage History Size
    if (conversationHistory.length > MAX_HISTORY + 1) {
      conversationHistory = [
        conversationHistory[0], 
        ...conversationHistory.slice(-MAX_HISTORY)
      ];
    }

    return { reply: botReply, action, params };

  } catch (error) {
    // If request was intentionally aborted (e.g. end call), don't speak "offline".
    if (error && (error.name === 'AbortError' || error.code === 20)) {
      return { reply: "", action: "reply_only", params: {} };
    }
    console.error("Chat Error:", error);
    return { reply: "Sorry, I'm currently offline. Please try again later.", action: "reply_only", params: {} };
  }
}

// --- HELPER FUNCTIONS ---
function addMessage(text, className) {
  const div = document.createElement('div');
  div.classList.add('message', className);

  // Prevent HTML injection (XSS). Only allow limited markup for bot messages.
  if (className === 'bot-message') {
    div.innerHTML = sanitizeBotHtml(text);
  } else {
    div.textContent = String(text ?? '');
  }

  if (quickRepliesContainer && chatMessages.contains(quickRepliesContainer)) {
    chatMessages.insertBefore(div, quickRepliesContainer);
  } else {
    chatMessages.appendChild(div);
  }
  
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function sanitizeBotHtml(input) {
  const html = String(input ?? '');
  // Fast path: no tags -> safe as text
  if (!/[<>]/.test(html)) return escapeHtmlForChat(html);

  const allowedTags = new Set(['A', 'BR', 'STRONG', 'EM', 'B', 'I', 'CODE']);
  const allowedAttrs = {
    A: new Set(['href', 'target', 'rel'])
  };

  const template = document.createElement('template');
  template.innerHTML = html;

  const sanitizeNode = (node) => {
    // Text nodes are safe
    if (node.nodeType === Node.TEXT_NODE) return;

    // Remove comments/processing instructions/etc.
    if (node.nodeType !== Node.ELEMENT_NODE) {
      node.remove();
      return;
    }

    const el = node;
    const tag = el.tagName;

    if (!allowedTags.has(tag)) {
      // Replace unknown elements with their text content (preserve readable output)
      const text = document.createTextNode(el.textContent || '');
      el.replaceWith(text);
      return;
    }

    // Strip all attributes except a small whitelist
    for (const attr of Array.from(el.attributes)) {
      const name = attr.name.toLowerCase();
      const tagAllowed = allowedAttrs[tag] || new Set();
      if (!tagAllowed.has(name)) {
        el.removeAttribute(attr.name);
      }
    }

    // Special handling for links: enforce safe target/rel and block javascript: URLs
    if (tag === 'A') {
      const href = (el.getAttribute('href') || '').trim();
      const isSafeHref =
        href.startsWith('https://') ||
        href.startsWith('http://') ||
        href.startsWith('mailto:') ||
        href.startsWith('/');
      if (!isSafeHref) {
        el.replaceWith(document.createTextNode(el.textContent || ''));
        return;
      }
      if (el.getAttribute('target') === '_blank') {
        el.setAttribute('rel', 'noopener noreferrer');
      }
    }

    // Recurse into children (copy list first because we may replace nodes)
    for (const child of Array.from(el.childNodes)) sanitizeNode(child);
  };

  for (const child of Array.from(template.content.childNodes)) sanitizeNode(child);
  return template.innerHTML;
}

function escapeHtmlForChat(text) {
  const div = document.createElement('div');
  div.textContent = String(text ?? '');
  return div.innerHTML;
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

// --- STORY MODE TOUR ---
const tourSteps = [
  { id: 'intro', label: 'Step 1 – Intro', targetSelector: '#intro', tabSelector: '#tab-intro', text: "This is the introduction where I share who I am, my background, and what I'm working on.", tooltipPosition: 'bottom' },
  { id: 'projects', label: 'Step 2 – Projects', targetSelector: '#projects', tabSelector: '#tab-projects', text: 'Here are some of my favorite projects, with descriptions and the technologies I use.', tooltipPosition: 'bottom' },
  { id: 'games', label: 'Step 3 – Games', targetSelector: '#games', tabSelector: '#tab-games', text: 'This tab includes fun little games and experiments that I built while learning.', tooltipPosition: 'bottom' },
  { id: 'contact', label: 'Step 4 – Contact', targetSelector: '#contact', tabSelector: '#tab-contact', text: 'Finally, here is how you can get in touch with me.', tooltipPosition: 'top' }
];

let currentTourIndex = 0;
let isTourActive = false;

const tourOverlay = document.getElementById('tour-overlay');
const tourTooltip = tourOverlay ? tourOverlay.querySelector('.tour-tooltip') : null;
const tourLabel = tourOverlay ? tourOverlay.querySelector('.tour-step-label') : null;
const tourText = tourOverlay ? tourOverlay.querySelector('.tour-step-text') : null;
const tourProgress = tourOverlay ? tourOverlay.querySelector('.tour-step-progress') : null;
const tourStartBtn = document.getElementById('tour-start-btn');
const tourPrevBtn = document.getElementById('tour-prev-btn');
const tourNextBtn = document.getElementById('tour-next-btn');
const tourExitBtn = document.getElementById('tour-exit-btn');

function activateTabForStep(step) {
  if (!step.tabSelector) return;
  const tab = document.querySelector(step.tabSelector);
  if (tab) tab.click();
}

function positionTooltip(step, targetEl) {
  if (!tourTooltip || !targetEl) return;
  // Overlay is position:fixed so tooltip uses viewport coords only (no scroll)
  const rect = targetEl.getBoundingClientRect();
  const margin = 12;
  const vw = document.documentElement.clientWidth;
  const vh = document.documentElement.clientHeight;
  const tw = tourTooltip.offsetWidth;
  const th = tourTooltip.offsetHeight;
  let top, left;
  switch (step.tooltipPosition) {
    case 'top':
      top = rect.top - th - margin;
      left = rect.left + (rect.width / 2) - (tw / 2);
      break;
    case 'right':
      top = rect.top + (rect.height / 2) - (th / 2);
      left = rect.right + margin;
      break;
    case 'left':
      top = rect.top + (rect.height / 2) - (th / 2);
      left = rect.left - tw - margin;
      break;
    case 'bottom':
    default:
      top = rect.bottom + margin;
      left = rect.left + (rect.width / 2) - (tw / 2);
      break;
  }
  left = Math.max(16, Math.min(vw - tw - 16, left));
  top = Math.max(16, Math.min(vh - th - 16, top));
  tourTooltip.style.top = top + 'px';
  tourTooltip.style.left = left + 'px';
  tourTooltip.style.transform = 'none';
}

function showTourStep(index) {
  if (!tourOverlay || !tourTooltip) return;
  const total = tourSteps.length;
  if (index < 0) index = 0;
  if (index >= total) { endTour(); return; }
  currentTourIndex = index;
  const step = tourSteps[index];
  activateTabForStep(step);
  const targetEl = document.querySelector(step.targetSelector);
  if (targetEl) {
    targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(function() { positionTooltip(step, targetEl); }, 350);
  }
  if (tourLabel) tourLabel.textContent = step.label;
  if (tourText) tourText.textContent = step.text;
  if (tourProgress) tourProgress.textContent = 'Step ' + (index + 1) + ' of ' + total;
  if (tourPrevBtn) tourPrevBtn.disabled = index === 0;
  if (tourNextBtn) tourNextBtn.textContent = index === total - 1 ? t("tourFinish") : t("tourNext");
}

function startTour() {
  if (!tourOverlay) return;
  isTourActive = true;
  tourOverlay.classList.remove('hidden');
  tourOverlay.setAttribute('aria-hidden', 'false');
  showTourStep(0);
}

function endTour() {
  if (!tourOverlay) return;
  isTourActive = false;
  tourOverlay.classList.add('hidden');
  tourOverlay.setAttribute('aria-hidden', 'true');
  const introTab = document.querySelector('#tab-intro');
  if (introTab) introTab.click();
}

if (tourStartBtn) tourStartBtn.addEventListener('click', function(e) { e.preventDefault(); e.stopPropagation(); startTour(); });
if (tourNextBtn) {
  tourNextBtn.addEventListener('click', function() {
    if (!isTourActive) return;
    if (currentTourIndex >= tourSteps.length - 1) endTour();
    else showTourStep(currentTourIndex + 1);
  });
}
if (tourPrevBtn) tourPrevBtn.addEventListener('click', function() { if (isTourActive) showTourStep(currentTourIndex - 1); });
if (tourExitBtn) tourExitBtn.addEventListener('click', endTour);
document.addEventListener('keydown', function(e) {
  if (!isTourActive) return;
  if (e.key === 'Escape') endTour();
});

