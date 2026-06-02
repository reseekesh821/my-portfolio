# Rishikesh Bastakoti – Portfolio

My portfolio website. It has my projects and background, plus a chatbot you can talk to (and use with voice). There is also a quiz, live weather and news for Kathmandu, and a contact form.

Built with HTML, CSS, and JavaScript. The backend stuff runs on Vercel serverless functions, and I use Supabase to store chat logs, quiz scores, tab clicks, and contact messages.

**Live:** https://rishikeshbastakoti.vercel.app/

---

## What's on the site

- Intro, projects, education, hometown, favorites, games, news, contact
- AI chat (Groq / Llama 3.3 70B) — can answer questions about me and do things on the site like show projects or play music
- Voice commands (browser speech recognition)
- Fake audio call and video call UI (video uses Anam for the avatar)
- Quiz — "Know Rishikesh?"
- Light/dark mode and a few accent colors
- Languages: English, Nepali, Spanish, French, German, Portuguese, Chinese
- Live time and weather for Kathmandu, news headlines
- Admin page (`admin.html`) to look at what people submitted or logged

---

## Files

- `index.html` — main page
- `portfolio.css` — styles
- `portfolio.js` — most of the logic
- `admin.html` — admin dashboard
- `favicon.svg`
- `api/chat.js` — chat API
- `api/news.js` — news
- `api/tts.js` — voice for audio calls (ElevenLabs)
- `api/anam-session.js` — video call session
- `api/reverse-geocode.js` — turns lat/lon into a place name
- `api/_supabaseAdmin.js` — Supabase on the server
- `api/_requireAdmin.js` — checks admin password
- `api/admin/` — endpoints for chat logs, tab events, quiz results, contact messages

---

## Run it locally

```bash
npm install
vercel dev
```

You need a `.env` file in the project root (it is in `.gitignore`, so do not push it). Add your keys from Groq, Supabase, GNews, Anam, and ElevenLabs. You also need `ADMIN_TOKEN` if you want to use the admin page, and `SUPABASE_ANON_KEY` in `index.html` for the client side.

On Vercel, put the same variables in the project settings.

---

## Supabase

Tables I use: `chat_logs`, `tab_events`, `quiz_results`, `contact_messages`
