# Rishikesh Bastakoti – AI-Powered Portfolio

This is my personal portfolio website where I showcase my background, projects, and an interactive AI-driven experience. Instead of a static page, this behaves more like a small product with chat, voice, calls, and live data.

Built using HTML, CSS, vanilla JavaScript, serverless APIs, and Supabase.

---

## Features

- AI chat assistant (Groq – Llama 3.3 70B)
- Voice assistant (speech recognition + text-to-speech)
- Audio and video call simulation
- Interactive quiz game
- Live weather, time, and news
- Responsive modern UI
- Supabase logging and analytics

---

## Sections

- Intro – About me and what I study  
- Projects – Featured projects with tech stacks  
- Education – Academic background  
- Hometown – Kathmandu with live time, weather, and map  
- Favorites – Music player, favorite city, movie  
- Games – “Know Rishikesh?” quiz  
- News – Live headlines  
- Contact – Resume, LinkedIn, GitHub, contact form  

---

## AI & Interactive Features

### Chat Assistant
- Context-aware AI assistant
- Answers questions and controls the site
- Logs messages to Supabase

### Voice Assistant
- Built with Web Speech API
- Supports commands like:
  - Show projects
  - Play music
  - Start video call

### Audio Call
- Simulated call UI (ringing → active)
- Continuous voice interaction
- Mute/unmute and end call

### Video Call
- AI avatar powered by Anam
- Live video inside chat widget
- Mute/unmute and end controls

---

## Live Data

- Time & Date – Nepal timezone  
- Weather – Open-Meteo API  
- News – GNews API  

---

## Data & Analytics (Supabase)

- chat_logs  
- tab_events  
- quiz_results  
- contact_messages  

---

## Project Structure

index.html – main UI  
portfolio.css – styling  
portfolio.js – frontend logic  

api/
- chat.js  
- news.js  
- anam-session.js  
- _supabaseAdmin.js  
- admin/  

---

## Setup

### Install
npm install

### Environment variables (.env)

GROQ_API_KEY=  
SUPABASE_URL=  
SUPABASE_SERVICE_ROLE_KEY=  
NEWS_API_KEY=  
ANAM_API_KEY=  
ANAM_PERSONA_ID=  

Client:
SUPABASE_ANON_KEY=  

---

## Run

vercel dev

---

## Security

- All API keys are stored in environment variables  
- No sensitive data is exposed in frontend  

---

## What This Shows

- Frontend development (UI, responsiveness)
- AI integration (chat, voice, avatar)
- Full-stack thinking (APIs + database)
- Real-time data handling

---

## Goal

To build a portfolio that feels like a real product, not just a static page.