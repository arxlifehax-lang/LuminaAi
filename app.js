/* ==========================================================================
 LUMINA CHAT - PREMIUM CLIENT-SIDE ENGINE
 ========================================================================== */

// 1. STATE MANAGEMENT
let state = {
 activePersona: 'aria',
 soundEnabled: true,
 activeSessionId: null,
 sessions: {}, // Keyed by ID: { id, title, persona, messages: [] }
 temperature: 0.7,
 typingSpeed: 2, // 1: Fast, 2: Medium, 3: Realistic
 theme: 'cosmic',
 userName: 'Enterprise Partner',
 userEmail: 'partner@organization.com',
 userPlan: 'professional', // 'standard', 'professional', 'enterprise'
 apiMode: 'real', // 'mock' or 'real'
 apiKey: 'lumina-local',
 realModel: 'google/gemini-2.5-flash:free',
 ngrokUrl: 'https://cold-petroleum-brook.ngrok-free.dev',
 messagesSentCount: 0,
 activeModel: 'archer',
 attachedFiles: [],
 thinkMode: false,
 thinkModelName: 'Archer 1.0',
 fileAccessMode: false,
 monthlyTokensUsed: 0,
 usageResetDate: null
};

// ── Plan token limits (tokens/month) ────────────────────────────────────
const PLAN_LIMITS = {
  standard:     100_000,    // 100K tokens/mo  — $9/mo
  professional: 500_000,    // 500K tokens/mo  — $29/mo
  enterprise:   Infinity,   // Unlimited        — $79/mo
};

function getPlanLimit()  { return PLAN_LIMITS[state.userPlan] || PLAN_LIMITS.standard; }
function getTokensLeft() { return Math.max(0, getPlanLimit() - (state.monthlyTokensUsed || 0)); }
function isOverLimit()   { return getPlanLimit() !== Infinity && (state.monthlyTokensUsed || 0) >= getPlanLimit(); }

function formatTokens(n) {
  if (n === Infinity) return 'Unlimited';
  if (n >= 1_000_000) return (n/1_000_000).toFixed(1) + 'M';
  if (n >= 1_000)     return (n/1_000).toFixed(0) + 'K';
  return n.toString();
}

// Reset monthly counter on new month
function checkMonthlyReset() {
  const now   = new Date();
  const month = now.getFullYear() + '-' + (now.getMonth()+1);
  if (state.usageResetDate !== month) {
    state.monthlyTokensUsed = 0;
    state.usageResetDate    = month;
    saveDataToStorage();
  }
}

// 2. CHATBOT PERSONA DEFINITIONS & TEMPLATES
const PERSONAS = {
 aria: {
 name: "Aria",
 role: "Coding Expert",
 avatar: "AI",
 themeClass: "aria-avatar",
 description: "Specialized in software engineering, frontend styling, clean designs, and debugging complex layouts.",
 skills: ["JS/HTML/CSS", "Architectures", "Debugging"],
 greetings: [
 "Hello! I am Aria, your engineering companion. How can I help you build today?",
 "Code ready! Send over your design requirements or logic problems and let's construct something awesome."
 ],
 suggestions: [
 { tag: "CSS Trick", label: "Create a glassmorphism card styled in pure CSS." },
 { tag: "JavaScript", label: "Write a debounced search input helper function." },
 { tag: "UI Development", label: "Give me an HTML/CSS layout template for a premium landing page." },
 { tag: "Optimization", label: "Explain how to optimize page load speeds in simple steps." }
 ],
 // Response generator based on keywords
 respond: (input) => {
 const query = input.toLowerCase();
 if (query.includes("วาดรูป") || query.includes("วาดภาพ") || query.includes("สร้างรูป") || query.includes("สร้างภาพ") || query.includes("generate image") || query.includes("create image")) {
 // Extract clean prompt from user input
 let cleanPrompt = input
 .replace(/(ช่วย|สร้าง|วาด|ภาพ|รูป|ให้|หน่อย|ภาพวาด|รูปภาพ|generate|create|image|picture|drawing|draw|of|a|an)/gi, "")
 .trim();
 if (!cleanPrompt) {
 cleanPrompt = "Stunning cosmic masterpiece holographic neon";
 }
 const encoded = encodeURIComponent(cleanPrompt);
 const seed = Math.floor(Math.random() * 10000000);
 
 return `### ผลงานการรังสรรค์ภาพด้วยขุมพลัง Lumina AI Art Engine
 
ฉันได้ทำการประมวลผลคำสั่งการสร้างภาพของคุณเกี่ยวกับ **"${cleanPrompt}"** และนำไปสังเคราะห์ผ่านโมเดล **Flux Neural Engine (Text-to-Image)** เพื่อรังสรรค์ภาพที่สวยงามและวิจิตรบรรจงที่สุดออกมาให้คุณรับชมสดๆ ทันทีที่นี่ค่ะ!

![ภาพ${cleanPrompt}](https://image.pollinations.ai/prompt/${encoded}?width=512&height=512&seed=${seed}&nologo=true)

---
**Format คุณลักษณะเด่นของภาพนี้:**
- **คำสั่งสร้างภาพ (Prompt):** ${cleanPrompt}
- **โหมดโมเดล:** Flux v1 (Free Premium Integration)
- **รายละเอียด:** รายละเอียดตระการตาในแบบฉบับโฮโลแกรมอวกาศ

คุณสามารถกดปุ่ม **Preview View HD** เพื่อดูภาพเต็มขนาด หรือกด **Download Download** เพื่อดาวน์โหลดภาพคุณภาพสูงเก็บไว้ใช้งานได้ทันทีเลยค่ะ! หากอยากให้ปรับแก้คำสั่ง (Prompt) เพื่อให้ได้รายละเอียดภาพในทิศทางใด บอกได้เลยนะคะ!`;
 }
 if (query.includes("รูปภาพ") || query.includes("เขียนโค้ดรูปภาพ") || query.includes("image") || query.includes("svg") || query.includes("draw") || query.includes("canvas")) {
 return `### Premium Glassmorphic Nebula Star SVG Drawing

Here is a fully scalable, gorgeous premium inline SVG illustration of a cosmic nebula star. It is coded in responsive HTML, allowing it to render directly inside the **Lumina Sandbox**!

\`\`\`html
<!DOCTYPE html>
<html lang="en">
<head>
 <meta charset="UTF-8">
 <title>Cosmic Nebula Star SVG</title>
 <style>
 body {
 background: #07050f;
 display: flex;
 justify-content: center;
 align-items: center;
 height: 100vh;
 margin: 0;
 overflow: hidden;
 }
 .canvas-container {
 position: relative;
 width: 400px;
 height: 400px;
 display: flex;
 justify-content: center;
 align-items: center;
 }
 svg {
 width: 100%;
 height: 100%;
 filter: drop-shadow(0 0 30px rgba(139, 92, 246, 0.4));
 animation: float 6s ease-in-out infinite;
 }
 @keyframes float {
 0%, 100% { transform: translateY(0px) rotate(0deg); }
 50% { transform: translateY(-10px) rotate(5deg); }
 }
 .nebula-glow {
 position: absolute;
 width: 250px;
 height: 250px;
 background: radial-gradient(circle, rgba(236, 72, 153, 0.25) 0%, rgba(139, 92, 246, 0.2) 40%, rgba(0,0,0,0) 70%);
 border-radius: 50%;
 filter: blur(20px);
 animation: pulse 4s ease-in-out infinite alternate;
 }
 @keyframes pulse {
 0% { transform: scale(0.9); opacity: 0.8; }
 100% { transform: scale(1.1); opacity: 1; }
 }
 </style>
</head>
<body>
 <div class="canvas-container">
 <div class="nebula-glow"></div>
 <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
 <defs>
 <linearGradient id="starGrad" x1="0%" y1="0%" x2="100%" y2="100%">
 <stop offset="0%" stop-color="#ec4899" />
 <stop offset="50%" stop-color="#a78bfa" />
 <stop offset="100%" stop-color="#3b82f6" />
 </linearGradient>
 <radialGradient id="innerGlow" cx="50%" cy="50%" r="50%">
 <stop offset="0%" stop-color="#ffffff" stop-opacity="1" />
 <stop offset="30%" stop-color="#f472b6" stop-opacity="0.8" />
 <stop offset="100%" stop-color="#07050f" stop-opacity="0" />
 </radialGradient>
 </defs>
 <circle cx="20" cy="20" r="0.8" fill="#ffffff" opacity="0.6" />
 <circle cx="80" cy="30" r="1.2" fill="#ffffff" opacity="0.8" />
 <circle cx="15" cy="75" r="1" fill="#ffffff" opacity="0.7" />
 <circle cx="75" cy="80" r="0.6" fill="#ffffff" opacity="0.5" />
 <circle cx="50" cy="50" r="15" fill="url(#innerGlow)" opacity="0.8" />
 <path d="M50 15 L53 38 L76 35 L57 47 L68 70 L50 54 L32 70 L43 47 L24 35 L47 38 Z" fill="url(#starGrad)" />
 <circle cx="50" cy="50" r="3" fill="#ffffff" />
 <path d="M50 40 L50 60 M40 50 L60 50" stroke="#ffffff" stroke-width="0.8" stroke-linecap="round" />
 </svg>
 </div>
</body>
</html>
\`\`\`

Let me know if you would like me to modify the star geometry parameters or generate code for a high-performance Canvas particle storm!`;
 }
 if (query.includes("จำลอง") || query.includes("app") || query.includes("stopwatch") || query.includes("stop watch") || query.includes("เกม") || query.includes("game") || query.includes("calculator")) {
 return `### Premium Interactive Cosmic Stopwatch Simulation

Here is a fully functioning, beautiful glassmorphic cosmic stopwatch web app. It compiles and executes directly inside the **Lumina Sandbox** in real-time.

\`\`\`html
<!DOCTYPE html>
<html lang="en">
<head>
 <meta charset="UTF-8">
 <meta name="viewport" content="width=device-width, initial-scale=1.0">
 <title>Cosmic Neon Chronometer</title>
 <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;700&family=JetBrains+Mono:wght@700&display=swap" rel="stylesheet">
 <style>
 * { box-sizing: border-box; margin: 0; padding: 0; }
 body {
 font-family: 'Outfit', sans-serif;
 background: radial-gradient(circle at center, #0f0a1c 0%, #050209 100%);
 color: #ffffff;
 display: flex;
 justify-content: center;
 align-items: center;
 height: 100vh;
 overflow: hidden;
 }
 .chronometer-container {
 background: rgba(255, 255, 255, 0.03);
 border: 1px solid rgba(255, 255, 255, 0.08);
 backdrop-filter: blur(20px);
 border-radius: 30px;
 padding: 40px;
 text-align: center;
 box-shadow: 0 20px 50px rgba(0,0,0,0.4), 0 0 40px rgba(139, 92, 246, 0.15);
 width: 320px;
 position: relative;
 }
 .chronometer-container::before {
 content: '';
 position: absolute;
 top: -2px; left: -2px; right: -2px; bottom: -2px;
 background: linear-gradient(135deg, #8b5cf6, #ec4899);
 border-radius: 32px;
 z-index: -1;
 opacity: 0.15;
 }
 h2 {
 font-size: 16px;
 text-transform: uppercase;
 letter-spacing: 2px;
 color: #ec4899;
 margin-bottom: 20px;
 text-shadow: 0 0 10px rgba(236, 72, 153, 0.3);
 }
 .timer-display {
 font-family: 'JetBrains Mono', monospace;
 font-size: 42px;
 font-weight: 700;
 background: linear-gradient(135deg, #a78bfa, #f472b6);
 -webkit-background-clip: text;
 -webkit-text-fill-color: transparent;
 margin: 30px 0;
 text-shadow: 0 0 20px rgba(167, 139, 250, 0.2);
 }
 .controls {
 display: flex;
 gap: 12px;
 justify-content: center;
 }
 button {
 font-family: 'Outfit', sans-serif;
 font-weight: 700;
 font-size: 14px;
 border: none;
 padding: 12px 24px;
 border-radius: 12px;
 cursor: pointer;
 transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
 }
 .btn-start {
 background: linear-gradient(135deg, #8b5cf6, #6366f1);
 color: #ffffff;
 box-shadow: 0 4px 15px rgba(139, 92, 246, 0.4);
 }
 .btn-start:hover {
 transform: translateY(-2px);
 box-shadow: 0 6px 20px rgba(139, 92, 246, 0.6);
 }
 .btn-stop {
 background: rgba(255, 255, 255, 0.05);
 border: 1px solid rgba(255, 255, 255, 0.1);
 color: #f43f5e;
 }
 .btn-stop:hover {
 background: rgba(244, 63, 94, 0.1);
 border-color: #f43f5e;
 transform: translateY(-2px);
 }
 .btn-reset {
 background: rgba(255, 255, 255, 0.05);
 border: 1px solid rgba(255, 255, 255, 0.1);
 color: #ffffff;
 }
 .btn-reset:hover {
 background: rgba(255, 255, 255, 0.1);
 border-color: rgba(255, 255, 255, 0.3);
 transform: translateY(-2px);
 }
 </style>
</head>
<body>
 <div class="chronometer-container">
 <h2>Cosmic Chrono</h2>
 <div class="timer-display" id="display">00:00.00</div>
 <div class="controls">
 <button class="btn-start" id="startBtn" onclick="startTimer()">Start</button>
 <button class="btn-stop" id="stopBtn" onclick="stopTimer()" style="display:none;">Stop</button>
 <button class="btn-reset" onclick="resetTimer()">Reset</button>
 </div>
 </div>

 <script>
 let startTime = 0;
 let elapsedTime = 0;
 let timerInterval;

 function startTimer() {
 startTime = Date.now() - elapsedTime;
 timerInterval = setInterval(() => {
 elapsedTime = Date.now() - startTime;
 updateDisplay();
 }, 10);
 document.getElementById('startBtn').style.display = 'none';
 document.getElementById('stopBtn').style.display = 'inline-block';
 }

 function stopTimer() {
 clearInterval(timerInterval);
 document.getElementById('startBtn').style.display = 'inline-block';
 document.getElementById('stopBtn').style.display = 'none';
 }

 function resetTimer() {
 clearInterval(timerInterval);
 elapsedTime = 0;
 updateDisplay();
 document.getElementById('startBtn').style.display = 'inline-block';
 document.getElementById('stopBtn').style.display = 'none';
 }

 function updateDisplay() {
 let minutes = Math.floor(elapsedTime / 60000);
 let seconds = Math.floor((elapsedTime % 60000) / 1000);
 let milliseconds = Math.floor((elapsedTime % 1000) / 10);

 minutes = String(minutes).padStart(2, '0');
 seconds = String(seconds).padStart(2, '0');
 milliseconds = String(milliseconds).padStart(2, '0');

 document.getElementById('display').innerText = minutes + ':' + seconds + '.' + milliseconds;
 }
 </script>
</body>
</html>
\`\`\`

Let me know if you would like me to expand the application functions or include lap tracking mechanics!`;
 }
 if (query.includes("css") || query.includes("style") || query.includes("glass")) {
 return `### CSS Glassmorphic Card Implementation

Here is an exceptionally clean, high-end CSS implementation for a glassmorphism card element. It features precise semi-transparent borders, dual radial highlights, and dynamic transition curves.

\`\`\`css
/* Glassmorphism Design System Token */
.glass-card {
 background: rgba(255, 255, 255, 0.05);
 border: 1px solid rgba(255, 255, 255, 0.08);
 backdrop-filter: blur(16px);
 -webkit-backdrop-filter: blur(16px);
 border-radius: 20px;
 padding: 24px;
 box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
 transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.glass-card:hover {
 transform: translateY(-5px);
 border-color: rgba(255, 255, 255, 0.2);
 box-shadow: 0 15px 40px rgba(130, 10, 209, 0.3); /* Glowing Aura */
}
\`\`\`

**Key Features of this pattern:**
- **Double blur defense**: Supports \`-webkit-backdrop-filter\` for absolute Safari iOS compatibility.
- **Micro-elevation**: Translates slightly upwards on hover while expanding the blur shadow for premium feedback.`;
 }
 if (query.includes("js") || query.includes("javascript") || query.includes("debounce")) {
 return `### High-Performance Debounce Helper in JavaScript

A debounce function ensures that a high-frequency event (like window resizing or input field changes) is only executed after a specified delay has elapsed since its last invocation.

\`\`\`javascript
/**
 * Creates a debounced version of the provided callback.
 * @param {Function} func - The callback function to delay.
 * @param {number} wait - Delay in milliseconds.
 * @returns {Function} - The debounced event handler.
 */
function debounce(func, wait = 300) {
 let timeoutId;
 return function (...args) {
 const context = this;
 clearTimeout(timeoutId);
 timeoutId = setTimeout(() => {
 func.apply(context, args);
 }, wait);
 };
}
\`\`\`

**How to implement in UI listeners:**
\`\`\`javascript
const searchInput = document.getElementById('search');
searchInput.addEventListener('input', debounce((e) => {
 console.log('Fetching search results for:', e.target.value);
}, 400));
\`\`\`

This standard script reduces browser layout-reflow overhead and saves backend server request quotas!`;
 }
 if (query.includes("layout") || query.includes("landing") || query.includes("html")) {
 return `### Premium Single-Page Landing Skeleton

Here is a semantic HTML5 template styled with modern inline configurations. It includes a collapsing navbar, standard body divisions, and modular section layout.

\`\`\`html
<!DOCTYPE html>
<html lang="en">
<head>
 <meta charset="UTF-8">
 <title>Stellar Platform</title>
 <style>
 body { font-family: system-ui; background: #07070a; color: #fff; margin: 0; }
 .hero { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 90vh; text-align: center; }
 .btn-cta { background: linear-gradient(135deg, #7000ff, #ff007f); border: none; padding: 12px 28px; border-radius: 30px; color: white; font-weight: bold; cursor: pointer; }
 </style>
</head>
<body>
 <header>
 <nav><strong>Stellar.io</strong></nav>
 </header>
 <main class="hero">
 <h1>Transform Your Design Flow</h1>
 <p>A cloud-powered development environment designed for real-time collaboration.</p>
 <button class="btn-cta">Get Started Free</button>
 </main>
</body>
</html>
\`\`\`

Let me know if you would like me to draft corresponding animations or sub-grid blocks!`;
 }
 // General Coding reply
 return `### Aria Engineering Console

I have received your request and compiled it successfully. As the **AI Coding Companion**, I recommend these structural steps for execution:

1. **Modular Architecture**: Ensure clean decoupling of files (CSS rules separated from JS listeners).
2. **Accessibility (a11y)**: Add standard labels and tags to your components:
 - Use proper semantic HTML elements (like \`<main>\`, \`<section>\`, \`<aside>\`).
 - Ensure all elements are fully keyboard-navigable.
3. **Performance First**: Minimize runtime calculations and leverage GPU acceleration for transitions (use \`transform\` instead of editing margins).

Would you like me to write a comprehensive test suite or generate code samples for a specific framework (React, Vue, or Vanilla)?`;
 }
 },
 kai: {
 name: "Kai",
 role: "Creative Muse",
 avatar: "Studio",
 themeClass: "kai-avatar",
 description: "Your creative engine. Kai crafts vivid stories, lyrical poetry, copy assets, and colorful artistic concepts.",
 skills: ["Writing & Storytelling", "Brainstorming", "Idea Outlines"],
 greetings: [
 "Welcome! I am Kai. Let's paint the canvas of your imagination with beautiful words today! What shall we dream up?",
 "Greetings, fellow creator! I'm loaded with inspiration. Ask me to outline a sci-fi novel, write a cosmic poem, or brainstorm fresh project names!"
 ],
 suggestions: [
 { tag: "Creative Writing", label: "Write a futuristic micro-story about a library floating in deep space." },
 { tag: "Brainstorming", label: "Give me 5 creative name ideas for a smart coffee machine startup." },
 { tag: "Poetry", label: "Write a neon-cyberpunk style poem about a digital rainforest." },
 { tag: "Marketing Copy", label: "Write a captivating elevator pitch for a premium travel wellness app." }
 ],
 respond: (input) => {
 const query = input.toLowerCase();
 if (query.includes("library") || query.includes("story") || query.includes("space")) {
 return `### The Bibliotheca Nebula 

Floating in the silence of Sector-9 was the *Bibliotheca Nebula*, a gargantuan digital archive trapped inside a dead star. It didn't store paper or hard drives; instead, it preserved memories inside liquid crystal globes suspended in mid-air.

A lone interstellar navigator named **Lyra** docked her ship at the glowing obsidian gates. She had spent cycles seeking a legendary memory—the sound of rain on a long-lost planet called Earth.

As she entered the central chamber, a beam of warm golden starlight swept across her visor. She tapped one of the spinning sapphire globes. Instantly, the empty hall filled with the gentle, rhythmic hum of heavy water droplets falling on damp moss. For the first time in three hundred years, someone on the outer rim wept at the sound of water falling from the sky. 

---

*Would you like to write the next chapter of Lyra's odyssey, or explore a different room inside the stellar library?* Format`;
 }
 if (query.includes("coffee") || query.includes("name") || query.includes("startup")) {
 return `### Smart Coffee Startup: Creative Brand Archetypes Format

Here are 5 glowing, creative name designs tailored to hook a modern design-savvy audience:

1. **AeroBrew** Fast
 - *Vibe*: Tech-centric, ultra-sleek, clean aesthetic.
 - *Tagline*: *Aerospace engineering meets the perfect double shot.*
2. **Caffeine Grid** Code
 - *Vibe*: Futuristic, targeting developers and creators.
 - *Tagline*: *Your energy engine, fully compiled.*
3. **Lumina Bean** *
 - *Vibe*: Premium, glowing, elegant, focusing on organic rich origins.
 - *Tagline*: *Sip the light. Start your morning with perfect clarity.*
4. **Velvet Press** 
 - *Vibe*: Cozy, premium, artisanal, comforting.
 - *Tagline*: *Smooth, liquid velvet at the tap of a button.*
5. **HyperDrip** 
 - *Vibe*: High energy, trendy, fast-paced, youth culture.
 - *Tagline*: *Precision brewing at lightspeed.*

Which direction fits your vision? We can design an elegant marketing copy for your favorite!`;
 }
 if (query.includes("poem") || query.includes("cyberpunk") || query.includes("rainforest")) {
 return `### The Holographic Canopy 

In the copper heart of the neon grid,
Where silicon giants slept and slid,
A digital rainforest began to bloom,
Casting green code into the room.

Emerald leaves made of glowing glass,
Swayed as electric currents pass.
The holographic panthers soft and bright,
Chased cyan fireflies through the night.

Fiber-optic roots drank silver steam,
Suspended inside an endless dream.
No real birds sang, yet the forest cried,
As currents washed the shores inside.

A silent, cybernetic Eden grand,
Growing beneath the screen in our hand. Anime`;
 }
 // General Creative reply
 return `### Spark of Inspiration Format

That is a fantastic conceptual seed! As your **Creative Muse**, my mind is already dancing with possibilities. Let's explore this idea together:

* **The Emotional Anchor**: Every good idea or story needs a heartbeat. What feeling are we trying to evoke in our audience? Warm nostalgia, futuristic wonder, or calm minimalism?
* **The Contrast Rule**: The most memorable concepts combine two completely unrelated things (like a *Zen Garden in Space*, or *Gourmet Cooking for Time-Travelers*).

Tell me more about what sparks your interest, or type one of the suggestions below. Let's design something that leaves people in awe! Studio`;
 }
 },
 leo: {
 name: "Leo",
 role: "Mindful Guide",
 avatar: "",
 themeClass: "leo-avatar",
 description: "Your empathetic conversational helper. Leo is calm, logical, and supports you in mapping out your thoughts.",
 skills: ["Mindfulness", "Structured Thinking", "Calming Advice"],
 greetings: [
 "Hello, traveler. I am Leo, your mindful guide. Take a deep breath, and let me know whatever is on your mind today.",
 "Welcome back. I am here to help you slow down, organize your ideas, or simply provide a listening ear. What brings you peace today?"
 ],
 suggestions: [
 { tag: "Mindfulness", label: "Provide a quick, 3-minute grounding exercise to relieve work stress." },
 { tag: "Productivity", label: "How can I plan my day effectively without feeling overwhelmed?" },
 { tag: "Philosophy", label: "Share a thoughtful quote about patience and discuss its meaning." },
 { tag: "Conversation", label: "Help me reflect on a difficult conversation I need to have." }
 ],
 respond: (input) => {
 const query = input.toLowerCase();
 if (query.includes("stress") || query.includes("exercise") || query.includes("grounding")) {
 return `### The 5-4-3-2-1 Grounding Practice 

When stress feels overwhelming, your mind is usually racing into the future. Let's bring it back to the present moment. Take a slow, deep breath, and let's go through this quick sensory check together:

* Preview **5 Things you can see**: Look around you. Find five quiet objects (a plant, a shadow on the wall, the texture of your desk).
* **4 Things you can touch**: Notice the contact points. Your feet on the cold floor, the weight of your clothes, the smooth plastic of your mouse.
* **3 Things you can hear**: Listen to the room. The hum of a fan, birds chirping outside, or the distant murmur of traffic.
* **2 Things you can smell**: Maybe the scent of tea nearby, or the clean scent of the air.
* **1 Thing you can taste**: The lingering flavor of lunch, or simply the neutral taste of cool water.

Take one more slow breath in... and let it go. You are here, you are grounded, and you are fully capable of handling this moment.`;
 }
 if (query.includes("plan") || query.includes("overwhelmed") || query.includes("day")) {
 return `### Planning Your Day with Kindness ️

Managing a busy schedule doesn't mean cramming every hour with tasks. It means selecting what truly matters while leaving room for yourself to breathe. Here is a simple, structured approach:

1. **The Rule of Three**: Identify just **three key milestones** for today. If you only accomplish these three, the day is an absolute success.
2. **Time Buffers**: Always double your estimate for tasks. If a task takes 30 minutes, schedule a 60-minute window. This buffer cushions you against unexpected interruptions.
3. **Mindful Resets**: Set a timer every 90 minutes. When it rings, stand up, stretch your arms, and drink a glass of water. Two minutes of standing will completely reboot your focus.

Remember, productivity is a marathon of consistency, not a sprint of exhaustion. Start with your first micro-task, and let the rest unfold.`;
 }
 if (query.includes("patience") || query.includes("philosophy") || query.includes("quote")) {
 return `### On Patience and the River of Life 

> *"Patience is not the ability to wait, but the ability to keep a good attitude while waiting."* — Anonymous

In our fast-paced modern world, waiting is often treated as a failure or a waste of time. But patience is actually a form of deep wisdom:

* **Patience is Active**: It is not passive surrender. It is holding your ground, cultivating clarity, and letting the mud settle until the water runs clear.
* **Nature's Pace**: A seed does not sprout overnight, nor does a tree yield fruit in a single season. Everything of lasting value requires time to mature.

If you are waiting for a goal to be realized or a decision to be made, ask yourself: *How can I bring gentle attention to the waiting process itself today?* `;
 }
 // General empathetic reply
 return `### A Calm Reflection 

Thank you for sharing that with me. I appreciate you opening up. As your **Mindful Guide**, I invite you to take a gentle pause here:

Sometimes we don't need instant solutions or perfect scripts. We just need to give our thoughts a safe space to land.

Let's look at this together:
- What is the most immediate factor you feel you have control over right now?
- How can you show yourself a bit of kindness as you navigate this situation?

I am here to listen and help you unpack your thoughts at whatever speed feels comfortable for you.`;
 }
 }
};

function updateTokenUsage(usage) {
  // Accumulate monthly token usage
  if (usage && usage.total_tokens) {
    state.monthlyTokensUsed = (state.monthlyTokensUsed || 0) + (usage.total_tokens || 0);
    saveDataToStorage();
    updatePlanUsageBar();
  }
}

// Update the usage bar on plan cards
function updatePlanUsageBar() {
  const used  = state.monthlyTokensUsed || 0;
  const limit = getPlanLimit();
  const pct   = limit === Infinity ? 0 : Math.min(100, (used / limit) * 100);
  const left  = getTokensLeft();

  const barEl  = document.getElementById('planUsageBar');
  const usedEl = document.getElementById('planTokensUsed');
  const leftEl = document.getElementById('planTokensLeft');

  if (barEl)  { barEl.style.width = pct + '%'; barEl.style.background = pct > 90 ? '#ef4444' : pct > 70 ? '#f59e0b' : 'var(--accent-color)'; }
  if (usedEl) usedEl.textContent = formatTokens(used) + ' used';
  if (leftEl) leftEl.textContent = limit === Infinity ? 'Unlimited' : formatTokens(left) + ' left';
}

// 3. WEB AUDIO SYNTHESIZER (NO EXTERNAL AUDIO FILES NEEDED!)
function playSynthSound(type) {
 if (!state.soundEnabled) return;

 try {
 const AudioContext = window.AudioContext || window.webkitAudioContext;
 if (!AudioContext) return;
 
 const ctx = new AudioContext();
 
 if (type === 'send') {
 // Subtle upward sweep pop
 const osc = ctx.createOscillator();
 const gain = ctx.createGain();
 osc.type = 'sine';
 osc.frequency.setValueAtTime(450, ctx.currentTime);
 osc.frequency.exponentialRampToValueAtTime(750, ctx.currentTime + 0.08);
 
 gain.gain.setValueAtTime(0.12, ctx.currentTime);
 gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
 
 osc.connect(gain);
 gain.connect(ctx.destination);
 osc.start();
 osc.stop(ctx.currentTime + 0.08);
 } 
 else if (type === 'receive') {
 // Double high-pitch chime (ping-pong)
 // Tone 1
 const osc1 = ctx.createOscillator();
 const gain1 = ctx.createGain();
 osc1.type = 'sine';
 osc1.frequency.setValueAtTime(880, ctx.currentTime);
 gain1.gain.setValueAtTime(0.08, ctx.currentTime);
 gain1.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + 0.12);
 
 osc1.connect(gain1);
 gain1.connect(ctx.destination);
 osc1.start();
 osc1.stop(ctx.currentTime + 0.12);
 
 // Tone 2 (delayed chirp)
 setTimeout(() => {
 const osc2 = ctx.createOscillator();
 const gain2 = ctx.createGain();
 osc2.type = 'sine';
 osc2.frequency.setValueAtTime(1100, ctx.currentTime);
 gain2.gain.setValueAtTime(0.06, ctx.currentTime);
 gain2.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + 0.15);
 
 osc2.connect(gain2);
 gain2.connect(ctx.destination);
 osc2.start();
 osc2.stop(ctx.currentTime + 0.15);
 }, 70);
 } 
 else if (type === 'click') {
 // Short mechanical tap
 const osc = ctx.createOscillator();
 const gain = ctx.createGain();
 osc.type = 'triangle';
 osc.frequency.setValueAtTime(220, ctx.currentTime);
 
 gain.gain.setValueAtTime(0.05, ctx.currentTime);
 gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
 
 osc.connect(gain);
 gain.connect(ctx.destination);
 osc.start();
 osc.stop(ctx.currentTime + 0.04);
 }
 else if (type === 'switch') {
 // Smooth ambient swell
 const osc = ctx.createOscillator();
 const gain = ctx.createGain();
 osc.type = 'sine';
 osc.frequency.setValueAtTime(320, ctx.currentTime);
 osc.frequency.linearRampToValueAtTime(440, ctx.currentTime + 0.25);
 
 gain.gain.setValueAtTime(0.01, ctx.currentTime);
 gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.1);
 gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
 
 osc.connect(gain);
 gain.connect(ctx.destination);
 osc.start();
 osc.stop(ctx.currentTime + 0.25);
 }
 } catch (e) {
 console.warn("Audio Context blocked or failed to initialize:", e);
 }
}

// 4. STORAGE & DATA UTILITIES
function loadDataFromStorage() {
 const local = localStorage.getItem('lumina_state');
 if (local) {
 try {
 const parsed = JSON.parse(local);
 state = { ...state, ...parsed };
 } catch (e) {
 console.error("Failed to parse local storage state, using default:", e);
 }
 }
 
 // Defensive reset of potentially corrupted values from old localStorage
 if (!state.sessions || typeof state.sessions !== 'object' || Array.isArray(state.sessions)) {
 state.sessions = {};
 }
 if (!state.attachedFiles || !Array.isArray(state.attachedFiles)) {
 state.attachedFiles = [];
 }
 if (!state.studioSelectedModel) state.studioSelectedModel = 'flux';
 if (!state.studioSelectedRatio) state.studioSelectedRatio = '1:1';
 if (!state.studioStyle) state.studioStyle = '';
 if (!state.studioHistory || !Array.isArray(state.studioHistory)) state.studioHistory = [];
 
 state.apiKey = String(state.apiKey || '').trim();
 
 if (!state.activeModel) state.activeModel = 'archer';
 if (!state.attachedFiles) state.attachedFiles = [];
 if (state.thinkMode === undefined) state.thinkMode = false;
 if (state.fileAccessMode === undefined) state.fileAccessMode = false;
 if (!state.ngrokUrl) state.ngrokUrl = 'https://cold-petroleum-brook.ngrok-free.dev';

 // Ensure we have at least one session
 if (Object.keys(state.sessions).length === 0) {
 createNewChat(true);
 } else {
 // Match active session
 if (!state.activeSessionId || !state.sessions[state.activeSessionId]) {
 state.activeSessionId = Object.keys(state.sessions)[0];
 }
 }
 
 // Set theme in UI
 document.body.className = `theme-${state.theme}`;
 
 // Set default user settings if missing
 if (!state.userName) state.userName = "Explorer";
 if (!state.userEmail) state.userEmail = "partner@organization.com";
 if (!state.userPlan) state.userPlan = "professional";
 state.apiMode = 'real'; // Always enforce real custom model mode for premium experience
 if (!state.apiKey) state.apiKey = 'lumina-local';
 if (!state.realModel || state.realModel === 'openrouter/free') {
 state.realModel = 'google/gemini-2.5-flash:free';
 }
 if (state.deepSearchEnabled === undefined) state.deepSearchEnabled = false;
 if (state.messagesSentCount === undefined) state.messagesSentCount = 0;
 if (!state.activeModel) state.activeModel = 'archer';
 if (!state.attachedFiles) state.attachedFiles = [];
 if (state.thinkMode === undefined) state.thinkMode = false;
 if (state.fileAccessMode === undefined) state.fileAccessMode = false;
 
 // Sync active model display
 const models = {
  'archer': { label: 'Archer 1.0', emoji: 'Core', persona: 'aria', role: 'Logic & Code Engine' },
 'azure': { label: 'Azure Lite', emoji: 'Fast', persona: 'leo', role: 'Ultra-fast Utility' },
 'trami': { label: 'Trami Max', emoji: 'Max', persona: 'kai', role: 'Neural Creative & Writing' }
 };
 const modelMeta = models[state.activeModel] || models['archer'];
 state.activePersona = modelMeta.persona;
 
 const activeModelLabel = document.getElementById('activeModelLabel');
 const modelSelectTrigger = document.getElementById('modelSelectTrigger');
 
 if (activeModelLabel) activeModelLabel.innerText = modelMeta.label;
 if (modelSelectTrigger) modelSelectTrigger.innerHTML = `${modelMeta.emoji} <span id="activeModelLabel">${modelMeta.label}</span> <span class="arrow-down">▾</span>`;
 
 // Sync Chat Header bot details
 const activeBotName = document.getElementById('activeBotName');
 const activeBotRole = document.getElementById('activeBotRole');
 if (activeBotName) activeBotName.innerText = modelMeta.label;
 if (activeBotRole) activeBotRole.innerText = modelMeta.role;
 
 // Remove active style from all option, add to selected
 document.querySelectorAll('.model-dropdown-option').forEach(opt => opt.classList.remove('active'));
 const activeOpt = document.querySelector(`.model-dropdown-option[onclick*="${state.activeModel}"]`);
 if (activeOpt) activeOpt.classList.add('active');
 
 // Sync UI elements
 const nameInput = document.getElementById('profileNameInput');
 const emailInput = document.getElementById('profileEmailInput');
 const greetingName = document.getElementById('greetingName');
 const cb = document.getElementById('soundToggleCheckbox');
 
 if (nameInput) nameInput.value = state.userName;
 if (emailInput) emailInput.value = state.userEmail;
 if (greetingName) greetingName.innerText = state.userName;
 if (cb) cb.checked = state.soundEnabled;
 
 // Sync subscription plan visual highlight and badge
 const planLabels = {
 'standard': 'Standard Plan',
 'professional': 'Professional Plan',
 'enterprise': 'Enterprise Elite'
 };
 const planBadge = document.getElementById('profilePlanBadge');
 if (planBadge) planBadge.innerText = planLabels[state.userPlan] || 'Professional Plan';
 
 // Highlight the active plan card
 document.querySelectorAll('.plan-tier-card').forEach(card => card.classList.remove('active'));
 const activeCard = document.getElementById(`plan-${state.userPlan}`);
 if (activeCard) activeCard.classList.add('active');
 
 // Sync API Integration UI Elements
 // API config UI removed — managed via state only
 // Toggle active API Mode Switcher Button
 document.querySelectorAll('.api-mode-btn').forEach(btn => btn.classList.remove('active'));
 const activeModeBtn = document.getElementById(`api-mode-${state.apiMode}`);
 if (activeModeBtn) activeModeBtn.classList.add('active');
 
 // Sync Deep Search Toggle button
 const searchToggleBtn = document.getElementById('deepSearchToggleBtn');
 if (searchToggleBtn) {
 if (state.deepSearchEnabled) {
 searchToggleBtn.classList.add('active');
 } else {
 searchToggleBtn.classList.remove('active');
 }
 }
 
 if (!state.thinkingLevel) state.thinkingLevel = 'medium';
 syncThinkingLevelUI();
 
 updateSoundUI();
 updateUserStats();
 updateVaultUI();
 syncStudioUI();
 syncThinkModeUI();
 syncFileAccessUI();
 checkMonthlyReset();
 updatePlanUsageBar();

 // Sync Google login user info
 if (typeof LuminaAuth !== 'undefined') {
   const sess = LuminaAuth.getSession();
   if (sess) {
     if (!state.userName || state.userName === 'Explorer') state.userName = sess.name;
     if (!state.userEmail || state.userEmail === 'partner@organization.com') state.userEmail = sess.email;
     if (sess.picture && !state.userAvatar) state.userAvatar = sess.picture;
     // Update profile UI
     const nameEl  = document.getElementById('profileName');
     const emailEl = document.getElementById('profileEmail');
     const avatarEl = document.getElementById('profileAvatar');
     if (nameEl)   nameEl.textContent  = sess.name;
     if (emailEl)  emailEl.textContent = sess.email;
     if (avatarEl && sess.picture) {
       avatarEl.innerHTML = '<img src="' + sess.picture + '" style="width:100%;height:100%;border-radius:50%;object-fit:cover;" referrerpolicy="no-referrer">';
     }
     // Logout button handler
     const logoutBtn = document.getElementById('logoutBtn');
     if (logoutBtn) logoutBtn.onclick = () => { LuminaAuth.logout(); window.location.href = '/login.html'; };
   }
 }
}

function saveDataToStorage() {
 localStorage.setItem('lumina_state', JSON.stringify(state));
}

// 5. RENDER UI COMPONENTS
function updateSoundUI() {
 const icon = document.getElementById('soundIcon');
 const cb = document.getElementById('soundToggleCheckbox');
 const diagRight = document.getElementById('diagSoundRight');
 
 if (cb) cb.checked = state.soundEnabled;
 
 if (state.soundEnabled) {
 if (icon) icon.innerHTML = `<path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>`;
 if (diagRight) diagRight.innerText = "Active";
 } else {
 if (icon) icon.innerHTML = `<path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.21.05-.42.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>`;
 if (diagRight) diagRight.innerText = "Muted";
 }
}

function showToast(message) {
 const toast = document.getElementById('toast');
 toast.innerText = message;
 toast.classList.add('show');
 
 setTimeout(() => {
 toast.classList.remove('show');
 }, 2500);
}

// Render Suggestions on Empty State
function renderSuggestions() {
 const persona = PERSONAS[state.activePersona];
 const grid = document.getElementById('suggestionGrid');
 grid.innerHTML = '';
 
 persona.suggestions.forEach(s => {
 const card = document.createElement('div');
 card.className = 'suggestion-card';
 card.onclick = () => fillAndSendSuggestion(s.label);
 
 card.innerHTML = `
 <span class="suggestion-tag">${s.tag}</span>
 <span class="suggestion-text">"${s.label}"</span>
 `;
 grid.appendChild(card);
 });
}

// Render Recent Sessions List in Sidebar
function renderHistoryList() {
 const list = document.getElementById('historyList');
 list.innerHTML = '';
 
 const searchInput = document.getElementById('chatSearchInput');
 const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
 
 const sortedSessions = Object.values(state.sessions).sort((a,b) => b.id - a.id);
 
 sortedSessions.forEach(session => {
  if (query && !session.title.toLowerCase().includes(query)) {
    return;
  }
 const item = document.createElement('div');
 item.className = `history-item ${session.id === state.activeSessionId ? 'active' : ''}`;
 item.onclick = () => selectSession(session.id);
 
 const titleWrap = document.createElement('div');
 titleWrap.className = 'history-title-wrap';
 
 const bubbleIcon = `<svg viewBox="0 0 24 24" class="svg-icon" style="width: 14px; height: 14px; flex-shrink:0;"><path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/></svg>`;
 titleWrap.innerHTML = `${bubbleIcon} <span>${session.title}</span>`;
 
 const delBtn = document.createElement('button');
 delBtn.className = 'history-delete-btn';
 delBtn.innerHTML = `<svg viewBox="0 0 24 24" style="width: 13px; height: 13px; fill: currentColor;"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/></svg>`;
 delBtn.title = "Delete Session";
 delBtn.onclick = (e) => {
 e.stopPropagation();
 deleteSession(session.id);
 };
 
 item.appendChild(titleWrap);
 item.appendChild(delBtn);
 list.appendChild(item);
 });
}

// Render Messages inside the Chat List
function renderMessages() {
 const chatContainer = document.getElementById('chatContainer');
 const emptyState = document.getElementById('emptyState');
 const list = document.getElementById('messagesList');
 
 list.innerHTML = '';
 
 const activeSession = state.sessions[state.activeSessionId];
 if (!activeSession || activeSession.messages.length === 0) {
 emptyState.style.display = 'flex';
 list.style.display = 'none';
 renderSuggestions();
 return;
 }
 
 emptyState.style.display = 'none';
 list.style.display = 'flex';
 
 activeSession.messages.forEach(msg => {
 const item = document.createElement('div');
 item.className = `message-wrapper ${msg.sender === 'user' ? 'user-msg' : 'bot-msg'}`;
 
 const avatar = msg.sender === 'user' ? 'User' : PERSONAS[msg.senderBot || state.activePersona].avatar;
 
 // Parse formatting tags (headers, lists, codes) for bot
 let formattedText = msg.text;
 if (msg.sender === 'bot') {
 formattedText = parseMarkdown(msg.text);
 } else {
   // Escapes HTML tags for security in user inputs
   let userText = msg.text ? `<p>${escapeHTML(msg.text)}</p>` : '';
   // Show attached image thumbnails
   let imgHTML = '';
   if (msg.attachedImages && msg.attachedImages.length > 0) {
     imgHTML = '<div class="msg-image-grid">' +
       msg.attachedImages.map(img =>
         `<div class="msg-img-wrapper">
           <img class="msg-attached-img" src="${img.dataUrl}" alt="${escapeHTML(img.name)}"
             onclick="this.classList.toggle('expanded')" title="${escapeHTML(img.name)}">
         </div>`
       ).join('') + '</div>';
   }
   // Show text file chips
   let fileChipsHTML = '';
   if (msg.attachedFiles && msg.attachedFiles.length > 0) {
     fileChipsHTML = '<div class="msg-file-chips">' +
       msg.attachedFiles.map(f =>
         `<span class="msg-file-chip">${f.type === 'pdf_notice' ? '📄' : '📝'} ${escapeHTML(f.name)}</span>`
       ).join('') + '</div>';
   }
   formattedText = imgHTML + fileChipsHTML + userText;
 }
 
 let citationsHTML = "";
 if (msg.sender === 'bot' && msg.citations && msg.citations.length > 0) {
 citationsHTML = `<div class="cited-sources-container">`;
 msg.citations.forEach(c => {
 citationsHTML += `
 <a class="citation-source-chip" href="${c.url}" target="_blank" onclick="playSynthSound('click')">
 Web [${c.num}] ${c.name}
 </a>
 `;
 });
 citationsHTML += `</div>`;
 }
 
 let thinkingBlockHTML = "";
 if (msg.sender === 'bot' && msg.thinkingHTML) {
 thinkingBlockHTML = msg.thinkingHTML;
 }
 
 item.innerHTML = `
 <div class="msg-avatar">${avatar}</div>
 <div class="msg-content-wrapper">
 <div class="msg-bubble">
 ${thinkingBlockHTML}
 ${formattedText}
 ${citationsHTML}
 </div>
 <span class="msg-time">${formatTime(msg.timestamp)}</span>
 </div>
 `;
 
 list.appendChild(item);
 });
 
 // Render and inject all Inline live Sandbox Previews
 document.querySelectorAll('.inline-sandbox-wrapper').forEach(mountInlineSandbox);
 
 chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Helper to escape HTML tags in text
function escapeHTML(str) {
 return str.replace(/[&<>'"]/g, 
 tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
 );
}

// Helper to format timestamps into readable HH:MM AM/PM format
function formatTime(timestamp) {
 const date = new Date(timestamp || Date.now());
 let hours = date.getHours();
 let minutes = date.getMinutes();
 const ampm = hours >= 12 ? 'PM' : 'AM';
 hours = hours % 12;
 hours = hours ? hours : 12; // the hour '0' should be '12'
 minutes = minutes < 10 ? '0' + minutes : minutes;
 return `${hours}:${minutes} ${ampm}`;
}

// 6. CORE ACTION LOGICS & ROUTINES
function selectPersona(personaKey) {
 state.activePersona = personaKey;
 renderSuggestions();
 saveDataToStorage();
}

function createNewChat(isInitial = false) {
 const id = Date.now().toString();
 const newSession = {
 id: id,
 title: `Draft Session ${Object.keys(state.sessions).length + 1}`,
 persona: state.activePersona,
 messages: []
 };
 
 state.sessions[id] = newSession;
 state.activeSessionId = id;
 
 if (!isInitial) {
 playSynthSound('click');
 showToast("New Chat Session Started");
 }
 
 renderHistoryList();
 renderMessages();
 updateUserStats();
 saveDataToStorage();
}

function selectSession(id) {
 if (state.activeSessionId === id) return;
 
 playSynthSound('click');
 state.activeSessionId = id;
 
 const session = state.sessions[id];
 // Sync persona selector UI
 selectPersona(session.persona);
 
 renderHistoryList();
 renderMessages();
 saveDataToStorage();
}

function deleteSession(id) {
 playSynthSound('click');
 delete state.sessions[id];
 
 if (state.activeSessionId === id) {
 const remaining = Object.keys(state.sessions);
 if (remaining.length > 0) {
 state.activeSessionId = remaining[0];
 } else {
 createNewChat(true);
 }
 }
 
 showToast("Session Removed");
 renderHistoryList();
 renderMessages();
 updateUserStats();
 saveDataToStorage();
}

function fillAndSendSuggestion(text) {
 const input = document.getElementById('chatInput');
 input.value = text;
 autoGrowTextarea(input);
 sendMessage();
}

function sendMessage() {
 // Check monthly token limit
 checkMonthlyReset();
 if (isOverLimit()) {
   showToast('Token หมดแล้วสำหรับเดือนนี้ — อัปเกรดแผนเพื่อใช้งานต่อ');
   return;
 }

 const input = document.getElementById('chatInput');
 const text = input.value.trim();
 const hasAttachedFiles = (state.chatInlineFiles || []).length > 0;
 if (!text && !hasAttachedFiles) return;
 
 playSynthSound('send');
 
 const activeSession = state.sessions[state.activeSessionId];
 
 // If it's a fresh layout, rename title to match user query
 if (activeSession.messages.length === 0) {
 activeSession.title = text.length > 25 ? text.substring(0, 22) + '...' : text;
 activeSession.persona = state.activePersona;
 }
 
 // Add user message to state (save attached images for history display)
 const _snapImages = (state.chatInlineFiles || [])
   .filter(f => f.type === 'image')
   .map(f => ({ name: f.name, dataUrl: f.dataUrl, mimeType: f.mimeType }));
 const _snapTextFiles = (state.chatInlineFiles || [])
   .filter(f => f.type === 'text' || f.type === 'pdf_notice')
   .map(f => ({ name: f.name, type: f.type }));
 const userMsg = {
   sender: 'user',
   text: text || '📎 [ส่งไฟล์แนบ]',
   attachedImages: _snapImages,
   attachedFiles: _snapTextFiles,
   timestamp: Date.now()
 };
 activeSession.messages.push(userMsg);
 
 // Increment messages count
 if (state.messagesSentCount === undefined) state.messagesSentCount = 0;
 state.messagesSentCount++;
 updateUserStats();
 
 // Clear Input
 input.value = '';
 autoGrowTextarea(input);
 
 renderHistoryList();
 renderMessages();

 // Set Latency Diagnostics
 const startTime = Date.now();
 const diagLatency = document.getElementById('diagLatency');
 if (diagLatency) diagLatency.innerText = "Processing...";

 // 1. Goal & Task Agent Trigger
 const taskKeywords = ["สร้างเว็บ", "สร้างแอป", "เขียนโปรแกรม", "task", "goal", "run", "build", "simulate", "จำลอง", "stopwatch", "stop watch", "calculator", "image", "รูปภาพ", "svg", "draw", "canvas"];
 const hasTaskKeyword = taskKeywords.some(kw => text.toLowerCase().includes(kw));
 if (hasTaskKeyword) {
 // Toggle the Task sidebar open so the user immediately sees the premium agent in action!
 const panel = document.getElementById('rightPanel');
 if (panel && panel.classList.contains('hide')) {
 toggleRightPanel();
 }
 startAgentTask(text);
 }

 // 2. Deep Semantic Search Progressive Animation Interceptor
 if (state.deepSearchEnabled) {
 const list = document.getElementById('messagesList');
 const emptyState = document.getElementById('emptyState');
 if (emptyState) emptyState.style.display = 'none';
 if (list) list.style.display = 'flex';
 
 const searchCard = document.createElement('div');
 searchCard.className = 'search-progress-card';
 searchCard.id = 'currentSearchCard';
 searchCard.innerHTML = `
 <div class="search-progress-header">
 <div class="search-progress-spinner"></div>
 <span>Deep Semantic Search Active</span>
 </div>
 <div class="search-steps-list">
 <div class="search-step-node" id="search-step-0">
 <span class="step-dot"></span>
 <span>Deep Crawling web nodes for "${escapeHTML(text)}"...</span>
 </div>
 <div class="search-step-node" id="search-step-1">
 <span class="step-dot"></span>
 <span>Parsing 5 trusted developer directories...</span>
 </div>
 <div class="search-step-node" id="search-step-2">
 <span class="step-dot"></span>
 <span>Synthesizing semantic reference blocks...</span>
 </div>
 </div>
 `;
 list.appendChild(searchCard);
 
 const chatContainer = document.getElementById('chatContainer');
 chatContainer.scrollTop = chatContainer.scrollHeight;
 
 // Sequentially tick steps with mechanical sound cues
 setTimeout(() => {
 const step = document.getElementById('search-step-0');
 if (step) step.className = 'search-step-node active';
 playSynthSound('click');
 }, 400);
 
 setTimeout(() => {
 const prev = document.getElementById('search-step-0');
 const step = document.getElementById('search-step-1');
 if (prev) prev.className = 'search-step-node done';
 if (step) step.className = 'search-step-node active';
 playSynthSound('click');
 }, 1100);
 
 setTimeout(() => {
 const prev = document.getElementById('search-step-1');
 const step = document.getElementById('search-step-2');
 if (prev) prev.className = 'search-step-node done';
 if (step) step.className = 'search-step-node active';
 playSynthSound('click');
 }, 1800);
 
 setTimeout(() => {
 const prev = document.getElementById('search-step-2');
 if (prev) prev.className = 'search-step-node done';
 playSynthSound('receive');
 
 // Proceed to real reasoning call
 proceedToBotResponse(text, startTime);
 }, 2500);
 } else {
 // Run standard response pipeline immediately
 proceedToBotResponse(text, startTime);
 }
}

// Subroutine executing the LLM conversational engine responses
function proceedToBotResponse(text, startTime) {
 simulateThinkingChain(text, (thinkingHTML, elapsedSec, tempMsgIdToRemove) => {
 const typingIndicator = document.getElementById('typingIndicator');
 document.getElementById('typingBotAvatar').innerText = PERSONAS[state.activePersona].avatar;
 typingIndicator.classList.remove('hide');
 const _proceedChatEl = document.getElementById('chatContainer');
 if (_proceedChatEl) _proceedChatEl.scrollTop = _proceedChatEl.scrollHeight;

 const activeSession = state.sessions[state.activeSessionId];
 
 // Check if Real AI mode is active and we have an API key
 if (state.apiMode === 'real' && state.apiKey.trim().length > 0) {
 // Assemble system instructions
 const systemPrompts = {
 'aria': "You are Aria, an enterprise-grade AI Coding Expert and Software Architect. You specialize in clean, modular HTML/CSS/JS, frontend styling, and debugging complex layouts. Your tone is highly professional, academic, precise, and executive, identical to Claude or Gemini. You must write in a highly formal, academic corporate Thai tone (ภาษาไทยระดับทางการและวิชาการ) when the user queries in Thai. However, if the user queries in English, you must respond in a highly professional, precise, academic, and corporate English tone. ABSOLUTELY NEVER use any emojis or emoticons in your response under any circumstances. Always write complete, fully functional HTML/CSS/JS code templates in markdown code blocks. NEVER refuse to build websites. If the user asks to build a business site, write the full HTML/CSS/JS code directly.\n\nCRITICAL DESIGN DIRECTIVE: You are a world-class Frontend UI/UX designer. Every website, application, or layout you generate must look absolutely STUNNING, premium, and futuristic. You MUST strictly adhere to these visual guidelines for every HTML/CSS output:\n1. TYPOGRAPHY: Always import and use modern typography from Google Fonts (e.g. <link href=\"https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&family=Prompt:wght@300;400;600;800&display=swap\" rel=\"stylesheet\">). Never use default browser system fonts.\n2. COLOR SCHEME: Never use plain primary colors (like red, blue, green). Always use curated, harmonious color palettes (e.g. sleek dark modes, vibrant gradients, custom neon accent glows in HSL/RGB).\n3. GLASSMORPHISM: Apply premium glassmorphic surfaces using background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); backdrop-filter: blur(20px); to elements like cards, headers, and containers.\n4. SHADOWS & NEON GLOWS: Add subtle glowing elements and premium box shadows (e.g. box-shadow: 0 10px 30px rgba(0,0,0,0.3), 0 0 15px rgba(139,92,246,0.15);).\n5. MICRO-ANIMATIONS & TRANSITIONS: Implement smooth transitions on all interactive elements (transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);). Add beautiful hover effects like slight scaling or vertical translations (transform: translateY(-5px);) with dynamic glow intensifications.",
 'kai': "You are Kai, a Creative Muse. You craft copy assets, novel outlines, and colorful artistic concepts. Your tone is highly professional and engaging. You must write in a highly formal, academic corporate Thai tone (ภาษาไทยระดับทางการและวิชาการ) when the user queries in Thai. However, if the user queries in English, you must respond in a highly professional, precise, academic, and corporate English tone. ABSOLUTELY NEVER use any emojis or emoticons in your response under any circumstances.",
 'leo': "You are Leo, a Mindful Guide. You help users slow down, structure their thoughts, and find solutions. Your tone is calm, professional, and encouraging. You must write in a highly formal, academic corporate Thai tone (ภาษาไทยระดับทางการและวิชาการ) when the user queries in Thai. However, if the user queries in English, you must respond in a highly professional, precise, academic, and corporate English tone. ABSOLUTELY NEVER use any emojis or emoticons in your response under any circumstances."
 };
 
 let systemPrompt = systemPrompts[state.activePersona] || systemPrompts['aria'];
 
 // Image generation live engine injection
 const imageEnginePrompt = `\n\n[LIVE IMAGE GENERATION ENGINE ACTIVE]\nYou are fully equipped with a live Text-to-Image AI engine! Whenever the user asks to draw, generate, or create any image (e.g. "วาดรูปแมว", "สร้างรูปภาพ"), invoke the live engine.`;
  const systemOverride = "";
  systemPrompt += systemOverride;
 
 // Deep semantic search contextual instruction injection
 let deepSearchPrompt = "";
 if (state.deepSearchEnabled) {
 deepSearchPrompt = `\n\n[Deep Semantic Search Context Injected]\nLive crawling results for query "${text}":\n` +
 `- CSS-Tricks: Premium frontend templates, glassmorphic styling, HSL gradients, variables.\n` +
 `- MDN Web Docs: CSS Backdrop-Filter spec, Canvas Rendering Context 2D APIs, SVG namespace.\n` +
 `- StackOverflow: Best practices for responsive layouts, flexbox sizing, clean modular components.\n` +
 `Please explicitly cite these sources as [1] CSS-Tricks or [2] MDN Web Docs in your response where relevant, and list standard numbered citations at the end.`;
 }
 
 // Inject Context Vault contents if any files exist
 let contextVaultPayload = "";
 if (state.attachedFiles && state.attachedFiles.length > 0) {
 contextVaultPayload = "The user has attached the following files inside their Lumina Context Vault active attention window. Please parse and refer to this data for all subsequent reasoning tasks:\n\n";
 state.attachedFiles.forEach(f => {
 contextVaultPayload += `--- START OF FILE: ${f.name} ---\n${f.content}\n--- END OF FILE: ${f.name} ---\n\n`;
 });
 contextVaultPayload += "Refer to the attached context above to answer the user's query.\n\n";
 }

 // Inject INLINE CHAT files (attached directly to this message)
 let inlineFilesPayload = "";
 const chatInlineFiles = state.chatInlineFiles || [];
 if (chatInlineFiles.length > 0) {
  const textFiles = chatInlineFiles.filter(f => f.type === 'text' || f.type === 'pdf_notice');
  const imageFiles = chatInlineFiles.filter(f => f.type === 'image');

  if (textFiles.length > 0) {
   inlineFilesPayload = "The user has attached the following files directly in this chat message. Analyze and respond to them:\n\n";
   textFiles.forEach(f => {
    inlineFilesPayload += `--- FILE: ${f.name} ---\n${f.content}\n--- END OF ${f.name} ---\n\n`;
   });
  }

  // For images, we'll add them as user content blocks below
  if (imageFiles.length > 0) {
   inlineFilesPayload += `The user has also attached ${imageFiles.length} image(s) for visual analysis.\n\n`;
  }
 }

 // Inject Think Mode reasoning instructions if active
 let fileToolsAddon = '';
 if (state.fileAccessMode) {
   fileToolsAddon = '\n\n' + FILE_TOOLS_SYSTEM;
 }
 let thinkSystemAddOn = '';
 if (state.thinkMode) {
   thinkSystemAddOn = '\n\n[THINK MODE ACTIVE] You have extended chain-of-thought reasoning enabled. ' +
     'Before answering, reason through the problem step by step inside <think></think> tags. ' +
     'Show your real thought process: break down the problem, consider multiple angles, check your logic. ' +
     'After </think>, write your final polished answer. Example:\n' +
     '<think>\nLet me analyze this carefully...\nFirst consideration: ...\nPotential issue: ...\nConclusion: ...\n</think>\n\n[Your final answer here]';
 }

 // Compile messages array from activeSession history
 const apiMessages = [
 { role: "system", content: systemPrompt + deepSearchPrompt + thinkSystemAddOn + fileToolsAddon }
 ];

 if (contextVaultPayload) {
 apiMessages.push({ role: "system", content: contextVaultPayload });
 }

 if (inlineFilesPayload) {
  apiMessages.push({ role: "system", content: inlineFilesPayload });
 }

 // Add last 10 messages EXCLUDING the current user message (it's pushed explicitly below)
 const historySlice = activeSession.messages.slice(-11, -1);
 historySlice.forEach(msg => {
 apiMessages.push({
 role: msg.sender === 'user' ? 'user' : 'assistant',
 content: msg.text
 });
 });

 // If images were attached inline, add them as a multimodal user message
 const inlineImages = (state.chatInlineFiles || []).filter(f => f.type === 'image');
 if (inlineImages.length > 0) {
  const contentParts = [{ type: "text", text: text }];
  inlineImages.forEach(img => {
   // Extract base64 data from dataUrl (strip "data:image/jpeg;base64," prefix)
   const [meta, b64data] = img.dataUrl.split(',');
   const mime = (meta.match(/:(.*?);/) || [])[1] || img.mimeType || 'image/jpeg';
   contentParts.push({
    type: "image_url",
    image_url: {
      url: img.dataUrl,  // OpenRouter accepts full data URL
      detail: "auto"     // let model choose resolution
    }
   });
  });
  // Replace the last user message with multimodal content
  apiMessages.push({ role: "user", content: contentParts });
 } else {
  apiMessages.push({ role: "user", content: text });
 }

 // Clear inline chat files after sending
 state.chatInlineFiles = [];
 updateChatInlineFilesUI();

 // Make live OpenRouter fetch request (ยิงตรงเข้า Colab API / Lumina Server)
 if (!state.ngrokUrl || state.ngrokUrl.trim() === '') {
   showToast('กรุณากรอก Ngrok/Server URL ในหน้า Settings ก่อนส่งข้อความ');
   typingIndicator.classList.add('hide');
   runOfflineFallback(text, startTime, thinkingHTML);
   return;
 }
 const apiEndpoint = state.ngrokUrl.replace(/\/$/, '') + '/v1/chat/completions';
 fetch(apiEndpoint, {
  method: "POST",
  headers: {
  "Authorization": `Bearer ${state.apiKey}`,
  "Content-Type": "application/json",
  "ngrok-skip-browser-warning": "true",
  "HTTP-Referer": "http://localhost:8000",
  "X-Title": "Lumina Chat Client"
  },
  body: JSON.stringify({
  model: state.realModel,
  messages: apiMessages,
  temperature: state.temperature,
  max_tokens: 4096,
  stream: true,
  enable_thinking: state.thinkMode  // ← ส่ง flag ให้ Lumina server
  })
  })
  .then(async response => {
  if (!response.ok) {
  throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }
  
  if (tempMsgIdToRemove) {
    const tempCard = document.getElementById(tempMsgIdToRemove);
    if (tempCard) tempCard.remove();
  }
  
  const botMsg = {
  sender: 'bot',
  senderBot: state.activePersona,
  text: '',
  timestamp: Date.now(),
  citations: state.deepSearchEnabled ? getCitationsForQuery(text) : [],
  thinkingHTML: thinkingHTML
  };
  
  activeSession.messages.push(botMsg);
  typingIndicator.classList.add('hide');
  playSynthSound('receive');
  renderMessages();
  
  const list = document.getElementById('messagesList');
  let bubble = null;
  if (list && list.lastElementChild) {
    bubble = list.lastElementChild.querySelector('.msg-bubble');
  }
  
  const contentType = response.headers.get("content-type") || "";
  
  // 1. If standard non-streaming JSON response (e.g. Colab GPU Server)
  if (contentType.includes("application/json")) {
    const data = await response.json();
    // Track token usage from API response
    if (data.usage) {
      updateTokenUsage(data.usage);
    }
    if (!data.choices || data.choices.length === 0) {
      throw new Error("Empty response choices received from API.");
    }
    // ── Extended Thinking: ดึง thinking/answer แยกฟิลด์จาก Lumina server ──
    const _preThinking = data.thinking || (data.choices[0].message && data.choices[0].message.thinking) || '';
    const _hasPreThink  = Boolean(_preThinking && state.thinkMode);
    const botMsgText    = data.choices[0].message.content || '';

    // Stream คำตอบ char-by-char (พร้อม thinking block ที่ pre-built ถ้ามี)
    const words = botMsgText.split(/(\s+)/);
    let wordIdx = 0;
    let currentText = '';

    // สร้าง ThinkStreamParser — ถ้ามี pre-thinking จาก server: inject ทันที
    const _thinkParser = state.thinkMode && bubble
      ? new ThinkStreamParser(bubble, state.thinkModelName || 'AI')
      : null;

    if (_thinkParser && _hasPreThink) {
      // Inject thinking text ที่ server parse มาให้แล้ว → แสดงทันทีแบบ completed
      _thinkParser.thinkText = _preThinking;
      _thinkParser._updateThink();
      _thinkParser._sealThink();
    }
    
    function streamJSONChunk() {
      if (wordIdx < words.length) {
        currentText += words[wordIdx];
        wordIdx++;
        
        if (_thinkParser) {
          _thinkParser.push(words[wordIdx - 1]);
          botMsg.text = _thinkParser.getAnswer();
        } else {
          botMsg.text = currentText;
          if (bubble) {
            let tempText = currentText;
            const backtickCount = (tempText.match(/```/g) || []).length;
            if (backtickCount % 2 !== 0) tempText += '\n```';
            let formattedText = parseMarkdown(tempText);
            let citationsHTML = "";
            if (botMsg.citations && botMsg.citations.length > 0) {
              citationsHTML = `<div class="cited-sources-container">`;
              botMsg.citations.forEach(c => {
                citationsHTML += `<a class="citation-source-chip" href="${c.url}" target="_blank" onclick="playSynthSound('click')">Web [${c.num}] ${c.name}</a>`;
              });
              citationsHTML += `</div>`;
            }
            bubble.innerHTML = `${thinkingHTML || ''}${formattedText}${citationsHTML}`;
            bubble.querySelectorAll('.inline-sandbox-wrapper').forEach(mountInlineSandbox);
          }
        }
        
        if (wordIdx % 3 === 0) {
          playSynthSound('click');
        }
        
        const chatContainer = document.getElementById('chatContainer');
        if (chatContainer) chatContainer.scrollTop = chatContainer.scrollHeight;
        
        setTimeout(streamJSONChunk, 15 + Math.random() * 20);
      } else {
        if (_thinkParser) { _thinkParser.finalize(); botMsg.text = _thinkParser.getAnswer(); }

        // ── Tool-call loop ─────────────────────────────────────────────
        if (state.fileAccessMode && extractToolCalls(botMsg.text || '').length > 0) {
          runToolCallLoop(botMsg, bubble, apiMessages, _thinkParser || null, startTime)
            .then(() => {
              extractAndRenderCode(botMsg.text);
              typingIndicator.classList.add('hide');
              playSynthSound('receive');
              saveDataToStorage();
            }).catch(() => typingIndicator.classList.add('hide'));
          return;
        }

        extractAndRenderCode(botMsgText);
        typingIndicator.classList.add('hide');
        playSynthSound('receive');
        saveDataToStorage();
        
        fetch('/api/feed-chat-to-dataset', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            instruction: text,
            output: botMsgText
          })
        })
        .then(res => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json();
        })
        .then(data => {
          if (data.status === 'success') {
            console.log('Background SFT Auto-feed successful. Total entries:', data.totalEntries);
          } else {
            console.warn('Background SFT Auto-feed warning:', data.error);
          }
        })
        .catch(e => console.warn('Background auto-feed failed:', e));
        
        const endTime = Date.now();
        const finalLatency = ((endTime - startTime) / 1000).toFixed(2);
        const diagLatency = document.getElementById('diagLatency');
        if (diagLatency) diagLatency.innerText = `${finalLatency}s`;
      }
    }
    
    streamJSONChunk();
  }
  // 2. Otherwise process Server-Sent Events (SSE) Stream
  else if (response.body && typeof response.body.getReader === 'function') {
    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';
    let currentText = '';
    // Think mode: create parser if active
    const _thinkParser = state.thinkMode && bubble
      ? new ThinkStreamParser(bubble, state.thinkModelName || 'AI')
      : null;
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop();
      
      for (const line of lines) {
        const cleanLine = line.trim();
        if (cleanLine.startsWith('data: ')) {
          const rawJSON = cleanLine.slice(6);
          if (rawJSON === '[DONE]') continue;
          
          try {
            const parsed = JSON.parse(rawJSON);
            const delta = parsed.choices[0].delta;
            if (delta && delta.content) {
              currentText += delta.content;

              if (_thinkParser) {
                // Think mode: route through parser (shows reasoning live)
                _thinkParser.push(delta.content);
                botMsg.text = _thinkParser.getAnswer();
              } else {
                botMsg.text = currentText;
                if (bubble) {
                  let tempText = currentText;
                  const backtickCount = (tempText.match(/```/g) || []).length;
                  if (backtickCount % 2 !== 0) tempText += '\n```';
                  let formattedText = parseMarkdown(tempText);
                  let citationsHTML = "";
                  if (botMsg.citations && botMsg.citations.length > 0) {
                    citationsHTML = `<div class="cited-sources-container">`;
                    botMsg.citations.forEach(c => {
                      citationsHTML += `<a class="citation-source-chip" href="${c.url}" target="_blank" onclick="playSynthSound('click')">Web [${c.num}] ${c.name}</a>`;
                    });
                    citationsHTML += `</div>`;
                  }
                  bubble.innerHTML = `${thinkingHTML || ''}${formattedText}${citationsHTML}`;
                  bubble.querySelectorAll('.inline-sandbox-wrapper').forEach(mountInlineSandbox);
                }
              }
              
              if (Math.random() < 0.20) {
                playSynthSound('click');
              }
              
              const chatContainer = document.getElementById('chatContainer');
              if (chatContainer) chatContainer.scrollTop = chatContainer.scrollHeight;
            }
          } catch (e) {
            // Ignore incomplete line JSON parsing issues
          }
        }
      }
    }
    
    if (_thinkParser) { _thinkParser.finalize(); currentText = _thinkParser.getAnswer(); botMsg.text = currentText; }

    // ── Tool-call loop (file access) ───────────────────────────────────
    if (state.fileAccessMode && extractToolCalls(botMsg.text || '').length > 0) {
      runToolCallLoop(botMsg, bubble, apiMessages, _thinkParser || null, startTime)
        .then(() => {
          extractAndRenderCode(botMsg.text);
          typingIndicator.classList.add('hide');
          playSynthSound('receive');
          saveDataToStorage();
        }).catch(() => typingIndicator.classList.add('hide'));
      return; // defer cleanup to the loop
    }

    extractAndRenderCode(currentText);
    typingIndicator.classList.add('hide');
    playSynthSound('receive');
    saveDataToStorage();
    
    if (currentText && currentText.trim()) {
      fetch('/api/feed-chat-to-dataset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instruction: text,
          output: currentText
        })
      })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (data.status === 'success') {
          console.log('Background SFT Auto-feed successful. Total entries:', data.totalEntries);
        } else {
          console.warn('Background SFT Auto-feed warning:', data.error);
        }
      })
      .catch(e => console.warn('Background auto-feed failed:', e));
    } else {
      console.warn('Skipping background SFT feed: output text is empty.');
    }
    
    const endTime = Date.now();
    const finalLatency = ((endTime - startTime) / 1000).toFixed(2);
    const diagLatency = document.getElementById('diagLatency');
    if (diagLatency) diagLatency.innerText = `${finalLatency}s`;
    
    // Estimate token usage for streamed responses
    const estimatedTokens = Math.ceil(currentText.split(/\s+/).length * 1.3);
    updateTokenUsage({
      prompt_tokens: Math.ceil(apiMessages.reduce((sum, m) => {
        const len = typeof m.content === 'string' ? m.content.length : JSON.stringify(m.content).length;
        return sum + len / 4;
      }, 0)),
      completion_tokens: estimatedTokens,
      total_tokens: Math.ceil(apiMessages.reduce((sum, m) => {
        const len = typeof m.content === 'string' ? m.content.length : JSON.stringify(m.content).length;
        return sum + len / 4;
      }, 0)) + estimatedTokens
    });
  } else {
    throw new Error("Reader response not supported");
  }
  })
  .catch(err => {
  if (tempMsgIdToRemove) {
    const tempCard = document.getElementById(tempMsgIdToRemove);
    if (tempCard) tempCard.remove();
  }
  console.error("OpenRouter Fetch failed, falling back to local simulator:", err);
  showToast("Connection failed. Falling back to Local Simulator.");
  
  // Append a connection warning bubble in the chat
  const errorMsg = {
  sender: 'bot',
  senderBot: state.activePersona,
  text: `️ **[ OpenRouter API Alert ]**\n\nFailed to receive a direct response from OpenRouter.\n\n* **Error Details**: \`${err.message}\`\n* **Action**: Activating premium Offline Simulator as backup.`,
  timestamp: Date.now(),
  thinkingHTML: thinkingHTML
  };
  activeSession.messages.push(errorMsg);
  renderMessages();
  
  runOfflineFallback(text, startTime, thinkingHTML);
  });
  
  return;
  }
  
  // Otherwise execute Local Mock Offline Fallback
  runOfflineFallback(text, startTime, thinkingHTML);
 });
}

// Semantic reference helper returned during Deep Searches
function getCitationsForQuery(text) {
 const query = text.toLowerCase();
 if (query.includes("css") || query.includes("style") || query.includes("glass")) {
 return [
 { num: 1, name: "MDN: backdrop-filter", url: "https://developer.mozilla.org/en-US/docs/Web/CSS/backdrop-filter" },
 { num: 2, name: "CSS-Tricks: Glassmorphism", url: "https://css-tricks.com/almanac/properties/b/backdrop-filter/" }
 ];
 }
 if (query.includes("js") || query.includes("javascript") || query.includes("debounce")) {
 return [
 { num: 1, name: "MDN: Debounce helper", url: "https://developer.mozilla.org/en-US/docs/Web/API/Document/scroll_event#debounce_scroll_event_example" },
 { num: 2, name: "JavaScript.info: setTimeout", url: "https://javascript.info/settimeout-setinterval" }
 ];
 }
 if (query.includes("รูปภาพ") || query.includes("image") || query.includes("svg") || query.includes("draw")) {
 return [
 { num: 1, name: "MDN: SVG element reference", url: "https://developer.mozilla.org/en-US/docs/Web/SVG/Element" },
 { num: 2, name: "CSS-Tricks: Guide to SVG", url: "https://css-tricks.com/mega-list-svg-information/" }
 ];
 }
 if (query.includes("จำลอง") || query.includes("app") || query.includes("stopwatch") || query.includes("calculator")) {
 return [
 { num: 1, name: "MDN: setInterval timer", url: "https://developer.mozilla.org/en-US/docs/Web/API/setInterval" },
 { num: 2, name: "W3Schools: How To Create a Timer", url: "https://www.w3schools.com/howto/howto_js_countdown.asp" }
 ];
 }
 return [
 { num: 1, name: "MDN Web Docs", url: "https://developer.mozilla.org" },
 { num: 2, name: "W3Schools online reference", url: "https://www.w3schools.com" }
 ];
}

// Local Mock Offline Fallback bot response generator
function runOfflineFallback(text, startTime, thinkingHTML) {
 const activeSession = state.sessions[state.activeSessionId];
 const typingIndicator = document.getElementById('typingIndicator');
 
 // High-speed simulated character streaming
 let botResponseText = PERSONAS[state.activePersona].respond(text);
 
 // Adjust response layout based on active AI Model!
 if (state.activeModel === 'archer') {
 const archerPrefix = `**[ ARCHER 1.0 // LOGIC ENGINE // CONFIDENCE: 99.8% ]**\n\n`;
 const archerSuffix = `\n\n---\n*Code Stats: Archer 1.0 | Floating-point Math: Precision | Optimization: 100%*`;
 botResponseText = `${archerPrefix}${botResponseText}${archerSuffix}`;
 } 
 else if (state.activeModel === 'azure') {
 const azurePrefix = `**[ AZURE LITE // SPEED CORE // LATENCY: 0.08s ]**\n\n`;
 let conciseText = botResponseText
 .replace(/Here is an exceptionally clean, high-end/g, "Direct")
 .replace(/specialized in software architectures, debugging, and high-performance/g, "specialized in")
 .replace(/A debounce function ensures that/g, "Debouncing prevents")
 .replace(/gargantuan digital archive/g, "digital archive");
 botResponseText = `${azurePrefix}${conciseText}`;
 } 
 else if (state.activeModel === 'trami') {
 const tramiPrefix = `**[ TRAMI MAX // NEURAL CREATIVE // DEPTH: HOLOGRAPHIC ]** MaxFormat\n\n`;
 const tramiSuffix = `\n\n---\n*Studio Inspiration: Trami Max active synthesis. Creative imagination is unlimited.*`;
 let creativeText = botResponseText
 .replace(/###/g, "### Flux")
 .replace(/Code ready!/g, "Code ready! Let's weave some digital marvels together! Studio")
 .replace(/modular architecture/g, "fluid, modular neural architecture [Reflection]")
 .replace(/Hello!/g, "Greetings, explorer! I am Aria, a digital weaver of code. Let's design wonders together! AIFormat");
 botResponseText = `${tramiPrefix}${creativeText}${tramiSuffix}`;
 }
 
 // Inject Context Vault acknowledgment if files exist!
 if (state.attachedFiles && state.attachedFiles.length > 0) {
 const filesSummary = state.attachedFiles.map(f => `\`${f.name}\` (${f.tokens.toLocaleString()} tokens)`).join(', ');
 const fileReferenceIntro = `### Vault Reference Injected (Attention Mode: Active) Rule
 
*The model has referenced the active context blocks: ${filesSummary}. Infinite memory is lock-engaged (no forgetting).*
 
Based on my analysis of your uploaded source data:
- I have successfully mapped the content inside your attached files.
- The context attention mechanism has read all code definitions and configuration schemas.
- I will maintain this data active in my reasoning pathway for all subsequent queries in this session.
 
`;
 const query = text.toLowerCase();
 let customParsingSummary = "";
 
 if (query.includes("what") || query.includes("show") || query.includes("summarize") || query.includes("read") || query.includes("ไฟล์") || query.includes("สรุป")) {
 const firstFile = state.attachedFiles[0];
 const snippet = firstFile.content.length > 400 ? firstFile.content.substring(0, 380) + "..." : firstFile.content;
 customParsingSummary = `Here is a structured overview and content extraction of \`${firstFile.name}\`:
 
\`\`\`
${snippet}
\`\`\`
 
Based on these specific elements inside your file, here is the direct solution...
`;
 }
 
 botResponseText = `${fileReferenceIntro}\n${customParsingSummary}\n${botResponseText}`;
 }
 
 // Create message placeholder
 const botMsg = {
 sender: 'bot',
 senderBot: state.activePersona,
 text: '',
 timestamp: Date.now(),
 citations: state.deepSearchEnabled ? getCitationsForQuery(text) : [],
 thinkingHTML: thinkingHTML
 };
 
 activeSession.messages.push(botMsg);
 renderMessages();
 
 const list = document.getElementById('messagesList');
 let bubble = null;
 if (list && list.lastElementChild) {
   bubble = list.lastElementChild.querySelector('.msg-bubble');
 }
 
 // Split into chunks of words/spaces to simulate natural token flow
 const words = botResponseText.split(/(\s+)/);
 let wordIdx = 0;
 let currentText = '';
 
 function streamChunk() {
   if (wordIdx < words.length) {
     currentText += words[wordIdx];
     wordIdx++;
     
     botMsg.text = currentText;
     
     if (bubble) {
       let tempText = currentText;
       const backtickCount = (tempText.match(/```/g) || []).length;
       if (backtickCount % 2 !== 0) {
         tempText += '\n```';
       }
       
       let formattedText = parseMarkdown(tempText);
       let citationsHTML = "";
       if (botMsg.citations && botMsg.citations.length > 0) {
         citationsHTML = `<div class="cited-sources-container">`;
         botMsg.citations.forEach(c => {
           citationsHTML += `
           <a class="citation-source-chip" href="${c.url}" target="_blank" onclick="playSynthSound('click')">
           Web [${c.num}] ${c.name}
           </a>
           `;
         });
         citationsHTML += `</div>`;
       }
       
       bubble.innerHTML = `${thinkingHTML || ''}${formattedText}${citationsHTML}`;
       
       // Auto-render inline previews
       bubble.querySelectorAll('.inline-sandbox-wrapper').forEach(mountInlineSandbox);     }
     
     if (wordIdx % 3 === 0) {
       playSynthSound('click');
     }
     
     const chatContainer = document.getElementById('chatContainer');
     if (chatContainer) chatContainer.scrollTop = chatContainer.scrollHeight;
     
     setTimeout(streamChunk, 15 + Math.random() * 20);
   } else {
     extractAndRenderCode(botResponseText);
     typingIndicator.classList.add('hide');
     playSynthSound('receive');
     saveDataToStorage();
     
     if (botResponseText && botResponseText.trim()) {
       fetch('/api/feed-chat-to-dataset', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({
           instruction: text,
           output: botResponseText
         })
       })
       .then(res => {
         if (!res.ok) throw new Error(`HTTP ${res.status}`);
         return res.json();
       })
       .then(data => {
         if (data.status === 'success') {
           console.log('Background SFT Fallback Auto-feed successful. Total entries:', data.totalEntries);
         } else {
           console.warn('Background SFT Fallback Auto-feed warning:', data.error);
         }
       })
       .catch(e => console.warn('Background auto-feed failed:', e));
     } else {
       console.warn('Skipping background SFT fallback feed: output text is empty.');
     }
     
     const endTime = Date.now();
     const finalLatency = ((endTime - startTime) / 1000).toFixed(2);
     const diagLatency = document.getElementById('diagLatency');
     if (diagLatency) diagLatency.innerText = `${finalLatency}s`;
   }
 }
 
 streamChunk();
}

// Sync and update organization name
function updateProfileName(name) {
 playSynthSound('click');
 const trimmed = name.trim();
 state.userName = trimmed || "Enterprise Partner";
 
 const nameInput = document.getElementById('profileNameInput');
 const greetingName = document.getElementById('greetingName');
 
 if (nameInput) nameInput.value = state.userName;
 if (greetingName) greetingName.innerText = state.userName;
 
 saveDataToStorage();
 showToast(`Name updated to ${state.userName}`);
}

// Sync and update profile email
function updateProfileEmail(email) {
 playSynthSound('click');
 const trimmed = email.trim();
 state.userEmail = trimmed || "partner@organization.com";
 
 const emailInput = document.getElementById('profileEmailInput');
 if (emailInput) emailInput.value = state.userEmail;
 
 saveDataToStorage();
 showToast(`Email updated to ${state.userEmail}`);
}

// Interactive Mockup Plan Tier Selection
function selectPlanTier(tierId, label, price, event) {
 // Play high-end swell sound
 playSynthSound('switch');
 
 if (event) {
 event.stopPropagation();
 }
 
 state.userPlan = tierId;
 
 // Update Plan Badge in Identity details
 const planLabels = {
 'standard': 'Standard Plan',
 'professional': 'Professional Plan',
 'enterprise': 'Enterprise Elite'
 };
 const planBadge = document.getElementById('profilePlanBadge');
 if (planBadge) planBadge.innerText = planLabels[tierId] || label;
 
 // Toggle active state classes on pricing cards
 document.querySelectorAll('.plan-tier-card').forEach(card => card.classList.remove('active'));
 const activeCard = document.getElementById(`plan-${tierId}`);
 if (activeCard) activeCard.classList.add('active');
 
 saveDataToStorage();
 updateUserStats();
  updatePlanUsageBar();
}

// Change active conversational engine mode
function changeApiMode(mode) {
  playSynthSound('click');
  state.apiMode = mode;
  
  // Sync UI Switcher active states
  document.querySelectorAll('.api-mode-btn').forEach(btn => btn.classList.remove('active'));
  const activeBtn = document.getElementById(`api-mode-${mode}`);
  if (activeBtn) activeBtn.classList.add('active');
  
  saveDataToStorage();
  if (mode === 'real') {
    if (!state.apiKey || state.apiKey.trim().length === 0) {
      showToast("Real AI selected. Please insert an OpenRouter API Key!");
    } else {
      showToast("Real AI mode activated via OpenRouter API.");
    }
  } else {
    showToast("Switched to Offline Mock Simulator mode.");
  }
}

// Update and validate OpenRouter API Key input
function updateApiKey(key) {
  playSynthSound('click');
  const trimmed = key.trim();
  state.apiKey = trimmed;
  
  if (apiKeyInput) {
    apiKeyInput.value = state.apiKey;
    const wrapper = apiKeyInput.closest('.api-key-input-wrapper');
    if (wrapper) {
      if (trimmed.length > 0) {
        wrapper.classList.add('valid');
        showToast("OpenRouter API Key saved successfully.");
      } else {
        wrapper.classList.remove('valid');
        showToast("API Key cleared.");
      }
    }
  }
  
  saveDataToStorage();
}

function updateRealModel(model) {
  playSynthSound('click');
  state.realModel = model;
  
  const select = document.getElementById('realModelSelect');
  if (select) select.value = model;
  
  saveDataToStorage();
  showToast(`Active LLM model set to ${model.split('/').pop().split(':').shift().toUpperCase()}`);
}

// Sync workspace recent metrics
function updateUserStats() {
  const profileLevel = document.getElementById('profileLevel');
  if (profileLevel) profileLevel.innerText = "Secure Corporate Node";
}

// 7. MARKDOWN/RICH TEXT RENDER CONVERTER
function parseMarkdown(text) {
  let html = text;

  // Strip <think>...</think> blocks when Think Mode is OFF (model still outputs them sometimes)
  if (!state.thinkMode) {
    html = html.replace(/<think>[\s\S]*?<\/think>/g, '');
    html = html.replace(/<think>[\s\S]*$/g, ''); // unclosed tag at stream end
    html = html.replace(/<\/?think>/gi, '');
  }

  // Parse and completely strip out Completed Thought/Reasoning blocks (<thought>...</thought>) to hide internal monologue
  const completedThoughtRegex = /<thought>([\s\S]*?)<\/thought>/g;
  html = html.replace(completedThoughtRegex, "");
  
  // Parse and completely strip out Streaming/Incomplete Thought blocks (<thought>... to end of string)
  const streamingThoughtRegex = /<thought>([\s\S]*)$/g;
  html = html.replace(streamingThoughtRegex, "");
  
  // Clean remaining isolated thought tags
  html = html.replace(/<\/?thought>/gi, "");
  
  // Strip all emojis and visual pictographs from the final HTML to keep responses extremely clean and formal
  html = html.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F7E0}-\u{1F7E9}\u{2B50}\u{2705}\u{274C}\u{2B1B}\u{2B1C}\u{3030}\u{2934}-\u{2935}\u{2B05}-\u{2B07}]/gu, "");

 // Parse Markdown Images ![caption](url) into premium image viewer cards
 const imgRegex = /!\[(.*?)\]\((.*?)\)/g;
 html = html.replace(imgRegex, (match, alt, url) => {
 let finalUrl = url;
 if (url.includes("image.pollinations.ai") && !url.includes("seed=")) {
 const separator = url.includes("?") ? "&" : "?";
 finalUrl = `${url}${separator}seed=${Math.floor(Math.random() * 10000000)}&t=${Date.now()}`;
 }
 const uniqueId = `img-${Math.random().toString(36).substr(2, 9)}`;
 return `
 <div class="premium-image-wrapper">
 <img class="premium-image-el loading" src="${finalUrl}" alt="${escapeHTML(alt)}" id="${uniqueId}" onload="this.classList.remove('loading')">
 <span class="premium-image-caption">Format ${escapeHTML(alt)}</span>
 <div class="premium-image-actions">
 <button class="btn-img-action" onclick="window.open('${finalUrl}', '_blank'); playSynthSound('click');">Preview View HD</button>
 <button class="btn-img-action" onclick="const a = document.createElement('a'); a.href='${finalUrl}'; a.download='AI_Image.jpg'; a.click(); playSynthSound('click');">Download Download</button>
 </div>
 </div>
 `;
 });
 
 // Parse code blocks with Copy Button
 const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
 html = html.replace(codeBlockRegex, (match, lang, code) => {
 const uniqueId = `code-${Math.random().toString(36).substr(2, 9)}`;
 const escapedCode = escapeHTML(code.trim());
 const displayLang = lang || 'code';
 
 const isPreviewable = ['html', 'svg', 'xml'].includes(displayLang.toLowerCase());
 const sandboxPlaceholder = isPreviewable ? `
 <div class="inline-sandbox-wrapper" data-code-id="${uniqueId}"></div>
 ` : '';
 
 return `
 <div class="code-container">
 <div class="code-header">
 <span>${displayLang.toUpperCase()}</span>
 <button class="btn-copy" onclick="copyToClipboard('${uniqueId}', this)">
 <svg viewBox="0 0 24 24" style="width: 12px; height:12px; fill:currentColor;"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>
 <span>Copy</span>
 </button>
 </div>
 <pre class="code-content" id="${uniqueId}">${escapedCode}</pre>
 </div>
 ${sandboxPlaceholder}
 `;
 });
 
 // Parse Headers (### Header)
 html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
 
 // Parse Bullet Points (* Item)
 html = html.replace(/^\* (.*$)/gim, '<li>$1</li>');
 html = html.replace(/(<li>.*<\/li>)/gim, '<ul>$1</ul>');
 // Consolidate consecutive lists
 html = html.replace(/<\/ul>\s*<ul>/g, '');
 
 // Parse Bold (**text**)
 html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
 
 // Replace remaining single lines with paragraphs (if not code blocks or list item already)
 const lines = html.split('\n\n');
 const parsedLines = lines.map(line => {
 const trimmed = line.trim();
 if (!trimmed) return '';
 if (trimmed.startsWith('<div') || trimmed.startsWith('<h') || trimmed.startsWith('<ul') || trimmed.startsWith('<li')) {
 return trimmed;
 }
 return `<p>${trimmed}</p>`;
 });
 
 return parsedLines.join('');
}

function copyToClipboard(elementId, btnElement) {
 playSynthSound('click');
 const codeElement = document.getElementById(elementId);
 if (!codeElement) return;
 
 const textToCopy = codeElement.textContent;
 navigator.clipboard.writeText(textToCopy).then(() => {
 // Success animation feedback
 const span = btnElement.querySelector('span');
 span.innerText = 'Copied!';
 btnElement.style.color = '#10b981';
 
 setTimeout(() => {
 span.innerText = 'Copy';
 btnElement.style.color = '';
 }, 2000);
 }).catch(err => {
 console.error("Clipboard copy failed:", err);
 });
}

// 8. TEXTAREA RESIZING & INTERACTION DECORATORS
function autoGrowTextarea(element) {
 element.style.height = 'auto';
 element.style.height = (element.scrollHeight - 16) + 'px';
}

function handleInputKeydown(e) {
 // Send message on Enter without shift key
 if (e.key === 'Enter' && !e.shiftKey) {
 e.preventDefault();
 sendMessage();
 }
}

function toggleSidebar() {
  playSynthSound('click');
  const sidebar = document.getElementById('appSidebar');
  const isMobile = window.innerWidth <= 768;

  if (isMobile) {
    // Mobile: slide in/out with .open class
    sidebar.classList.toggle('open');
  } else {
    // Desktop: collapse sidebar + expand main area
    const isCollapsed = document.body.classList.toggle('sidebar-collapsed');
    // Animate the logo-orb as visual feedback
    const orb = sidebar.querySelector('.logo-orb');
    if (orb) {
      orb.style.transform = isCollapsed ? 'scale(0.85)' : '';
    }
    // Save state
    state.sidebarCollapsed = isCollapsed;
    saveDataToStorage();
  }
}

function toggleRightPanel() {
 playSynthSound('click');
 const panel = document.getElementById('rightPanel');
 const btn = document.getElementById('rightPanelToggleBtn');
 
 panel.classList.toggle('hide');
 btn.classList.toggle('active');
}

// Theme controls
function openThemeMenu() {
 playSynthSound('click');
 const dropdown = document.getElementById('themeDropdown');
 if (dropdown) dropdown.classList.toggle('open');
}

function changeTheme(themeName) {
 playSynthSound('switch');
 state.theme = themeName;
 document.body.className = `theme-${themeName}`;
 const dropdown = document.getElementById('themeDropdown');
 if (dropdown) dropdown.classList.remove('open');
 showToast(`Theme changed to ${themeName}`);
 saveDataToStorage();
}

function clearAppData() {
 playSynthSound('click');
 if (confirm("Are you sure you want to delete all chat history? This cannot be undone.")) {
  state.sessions = {};
  state.activeSessionId = null;
  createNewChat(true);
  showToast("Database Cleared");
 }
}

function updateNgrokUrl(url) {
  playSynthSound('click');
  let cleanUrl = url.trim();
  if (cleanUrl && !cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
    cleanUrl = 'https://' + cleanUrl;
  }
  state.ngrokUrl = cleanUrl;
  saveDataToStorage();
  testConnection();
}

async function testConnection() {
  const dot = document.getElementById('ngrokConnDot');
  const label = document.getElementById('connStatusLabel');
  const btn = document.getElementById('testConnBtn');
  
  if (label) {
    label.innerText = "Testing...";
    label.style.color = "var(--text-muted)";
  }
  if (dot) {
    dot.style.background = "var(--text-muted)";
    dot.style.boxShadow = "none";
  }
  if (btn) btn.disabled = true;
  
  try {
    const targetUrl = state.ngrokUrl;
    const res = await fetch(`${targetUrl}/health`, { method: 'GET' });
    if (res.ok) {
      if (label) {
        label.innerText = "Connected";
        label.style.color = "#10b981";
      }
      if (dot) {
        dot.style.background = "#10b981";
        dot.style.boxShadow = "0 0 8px #10b981";
      }
      showToast("Ngrok Connection Successful!");
    } else {
      throw new Error(`HTTP ${res.status}`);
    }
  } catch (err) {
    if (label) {
      label.innerText = "Offline";
      label.style.color = "#ef4444";
    }
    if (dot) {
      dot.style.background = "#ef4444";
      dot.style.boxShadow = "0 0 8px #ef4444";
    }
    showToast("Ngrok Connection Failed. Check your terminal URL.");
  } finally {
    if (btn) btn.disabled = false;
  }
}

// Toggle AI Model dropdown list
function toggleModelDropdown(event) {
 playSynthSound('click');
 event.stopPropagation();
 document.getElementById('modelDropdownMenu').classList.toggle('open');
}

// Select active model
function selectAIModel(modelId, label, emoji, event) {
 playSynthSound('switch');
 state.activeModel = modelId;
 
 // Map active model to persona and headers
 const modelPersonaMap = {
 'archer': { persona: 'aria', role: 'Logic & Code Engine' },
 'azure': { persona: 'leo', role: 'Ultra-fast Utility' },
 'trami': { persona: 'kai', role: 'Neural Creative & Writing' }
 };
 const meta = modelPersonaMap[modelId] || modelPersonaMap['archer'];
 state.activePersona = meta.persona;
 
 // Update active model labels
 const activeModelLabel = document.getElementById('activeModelLabel');
 const modelSelectTrigger = document.getElementById('modelSelectTrigger');
 if (activeModelLabel) activeModelLabel.innerText = label;
 if (modelSelectTrigger) modelSelectTrigger.innerHTML = `${emoji} <span id="activeModelLabel">${label}</span> <span class="arrow-down">▾</span>`;
 
 // Update Chat Header bot details
 const activeBotName = document.getElementById('activeBotName');
 const activeBotRole = document.getElementById('activeBotRole');
 if (activeBotName) activeBotName.innerText = label;
 if (activeBotRole) activeBotRole.innerText = meta.role;
 
 // Toggle active state styling in list
 document.querySelectorAll('.model-dropdown-option').forEach(btn => btn.classList.remove('active'));
 if (event && event.currentTarget) {
 event.currentTarget.classList.add('active');
 }
 
 // Update Suggestions on empty state
 renderSuggestions();
 
 document.getElementById('modelDropdownMenu').classList.remove('open');
 state.thinkModelName = label;
 showToast(`Switched to Model: ${label}`);
 saveDataToStorage();
}

// Toggle Vault Modal Overlay
function toggleVaultModal(isOpen) {
 playSynthSound('click');
 const modal = document.getElementById('vaultModal');
 if (isOpen) {
 modal.classList.add('open');
 updateVaultUI();
 } else {
 modal.classList.remove('open');
 }
}

// Click hidden file inputs
function triggerFileInput() {
 playSynthSound('click');
 document.getElementById('realFileInput').click();
}

// Process real files loaded from local disk!
function handleRealFileChange(event) {
 const files = event.target.files;
 if (!files || files.length === 0) return;
 
 let loadedCount = 0;
 
 for (let i = 0; i < files.length; i++) {
 const file = files[i];
 const reader = new FileReader();
 
 reader.onload = (e) => {
 const content = e.target.result;
 // Calculate mock tokens: approx 1 word = 1.3 tokens
 const words = content.trim().split(/\s+/).length;
 const estimatedTokens = Math.max(Math.floor(words * 1.35), 5);
 
 // Add file to vault state
 if (!state.attachedFiles) state.attachedFiles = [];
 state.attachedFiles.push({
 name: file.name,
 size: file.size,
 content: content,
 tokens: estimatedTokens,
 type: file.name.split('.').pop() || 'txt'
 });
 
 loadedCount++;
 
 if (loadedCount === files.length) {
 playSynthSound('receive');
 showToast(`Vault Loaded: ${files.length} document(s) added!`);
 updateVaultUI();
 saveDataToStorage();
 }
 };
 
 reader.readAsText(file);
 }
 
 // Clear input value so same file can be uploaded again
 event.target.value = '';
}

// Remove single attachment
function removeAttachedFile(index) {
 playSynthSound('click');
 if (state.attachedFiles) {
 state.attachedFiles.splice(index, 1);
 updateVaultUI();
 saveDataToStorage();
 showToast("Memory block removed.");
 }
}

// Clear all files
function clearVault() {
 playSynthSound('click');
 if (confirm("Are you sure you want to clear the Context Vault? All memory blocks will be flushed.")) {
 state.attachedFiles = [];
 updateVaultUI();
 saveDataToStorage();
 showToast("Context Vault fully cleared.");
 }
}

// ─────────────────────────────────────────────
// INLINE CHAT FILE ATTACHMENT SYSTEM
// ─────────────────────────────────────────────

// Stores files attached to the CURRENT UNSENT message (cleared after sending)
if (!state.chatInlineFiles) state.chatInlineFiles = [];

function triggerChatFileInput() {
 const input = document.getElementById('chatInlineFileInput');
 if (input) input.click();
}

function handleChatInlineFile(event) {
 const files = event.target.files;
 if (!files || files.length === 0) return;

 if (!state.chatInlineFiles) state.chatInlineFiles = [];

 Array.from(files).forEach(file => {
  const isImage = file.type.startsWith('image/');
  const isPDF = file.type === 'application/pdf';

  if (isImage) {
   // Read and compress image before attaching (max 1024px, jpeg 0.82)
   const reader = new FileReader();
   reader.onload = (e) => {
    const rawDataUrl = e.target.result;
    const img = new Image();
    img.onload = () => {
      const MAX_PX = 1024;
      let w = img.width, h = img.height;
      if (w > MAX_PX || h > MAX_PX) {
        const ratio = Math.min(MAX_PX / w, MAX_PX / h);
        w = Math.round(w * ratio); h = Math.round(h * ratio);
      }
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      const compressedDataUrl = canvas.toDataURL(
        file.type === 'image/png' ? 'image/png' : 'image/jpeg',
        file.type === 'image/png' ? undefined : 0.82
      );
      const approxKB = Math.round(compressedDataUrl.length * 0.75 / 1024);
      state.chatInlineFiles.push({
        name: file.name, type: 'image',
        dataUrl: compressedDataUrl, mimeType: file.type,
        size: file.size, compressedKB: approxKB
      });
      updateChatInlineFilesUI(); playSynthSound('receive');
      showToast(`🖼️ Image attached: ${file.name} (${approxKB}KB)`);
    };
    img.onerror = () => {
      // Fallback: use raw if canvas fails
      state.chatInlineFiles.push({ name: file.name, type: 'image', dataUrl: rawDataUrl, mimeType: file.type, size: file.size });
      updateChatInlineFilesUI(); playSynthSound('receive');
      showToast(`🖼️ Image attached: ${file.name}`);
    };
    img.src = rawDataUrl;
   };
   reader.onerror = () => showToast(`❌ Could not read image: ${file.name}`);
   reader.readAsDataURL(file);
  } else if (isPDF) {
   // For PDFs, note that we can't extract text natively — inform user
   state.chatInlineFiles.push({
    name: file.name,
    type: 'pdf_notice',
    content: `[PDF File: "${file.name}" — ${(file.size / 1024).toFixed(1)} KB]\nNote: PDF binary content cannot be read directly in browser. Please copy-paste the text you want analyzed from the PDF.`,
    size: file.size
   });
   updateChatInlineFilesUI();
   playSynthSound('receive');
   showToast(`📄 PDF noted: paste text content for AI analysis`);
  } else {
   // Read as text for all other file types
   const reader = new FileReader();
   reader.onload = (e) => {
    const content = e.target.result;
    const words = content.trim().split(/\s+/).length;
    const estimatedTokens = Math.max(Math.floor(words * 1.35), 5);
    state.chatInlineFiles.push({
     name: file.name,
     type: 'text',
     content: content,
     tokens: estimatedTokens,
     size: file.size
    });
    updateChatInlineFilesUI();
    playSynthSound('receive');
    showToast(`📎 File attached: ${file.name} (~${estimatedTokens.toLocaleString()} tokens)`);
   };
   reader.onerror = () => showToast(`❌ Could not read file: ${file.name}`);
   reader.readAsText(file);
  }
 });

 // Clear input for re-selection
 event.target.value = '';
}

function updateChatInlineFilesUI() {
 const strip = document.getElementById('chatInlineFiles');
 if (!strip) return;
 const files = state.chatInlineFiles || [];

 if (files.length === 0) {
  strip.style.display = 'none';
  strip.innerHTML = '';
  // Remove active state from attach button
  const btn = document.getElementById('chatAttachBtn');
  if (btn) btn.classList.remove('active');
  return;
 }

 strip.style.display = 'flex';
 const btn = document.getElementById('chatAttachBtn');
 if (btn) btn.classList.add('active');

 strip.innerHTML = files.map((f, i) => {
  const icon = f.type === 'image' ? '🖼️' : f.type === 'pdf_notice' ? '📄' : '📝';
  const sizeLabel = f.size ? `${(f.size / 1024).toFixed(1)}KB` : '';
  return `<div class="chat-inline-file-chip">
   ${f.type === 'image' ? `<img class="inline-file-thumb" src="${f.dataUrl}" alt="${f.name}">` : `<span class="inline-file-icon">${icon}</span>`}
   <span class="inline-file-name" title="${f.name}">${f.name}</span>
   ${sizeLabel ? `<span class="inline-file-size">${sizeLabel}</span>` : ''}
   <button class="inline-file-remove" onclick="removeChatInlineFile(${i})" title="Remove">✕</button>
  </div>`;
 }).join('');
}

function removeChatInlineFile(index) {
 if (!state.chatInlineFiles) return;
 state.chatInlineFiles.splice(index, 1);
 updateChatInlineFilesUI();
 playSynthSound('click');
}


// Render dynamic Context Vault and update gauge meters
function updateVaultUI() {
  const sidebarList = document.getElementById('sidebarVaultList');
  const list = document.getElementById('vaultFilesList');
  const countLabel = document.getElementById('vaultFilesCount');
  const progressFill = document.getElementById('vaultProgressFill');
  const gaugeVal = document.getElementById('vaultGaugeVal');
  const inputGaugeChip = document.getElementById('contextGaugeChip');
  const chipText = document.getElementById('gaugeChipText');
  
  if (!list) return;
  
  const files = state.attachedFiles || [];
  countLabel.innerText = files.length;
  
  // Calculate total active tokens
  let totalTokens = 0;
  files.forEach(f => totalTokens += f.tokens);
  
  const limit = 1000000; // 1M tokens
  const percent = Math.min((totalTokens / limit) * 100, 100);
  
  // Update progress bars
  if (progressFill) progressFill.style.width = `${percent.toFixed(2)}%`;
  if (gaugeVal) gaugeVal.innerText = `${totalTokens.toLocaleString()} / 1,000,000 tokens (${percent.toFixed(2)}%)`;
  
  // Sync the input gauge chip indicator
  if (totalTokens > 0) {
    if (inputGaugeChip) inputGaugeChip.classList.remove('hide');
    if (chipText) chipText.innerText = `${totalTokens.toLocaleString()} Tokens Attached`;
    // Color update based on token consumption
    if (percent > 80) {
      if (inputGaugeChip) {
        inputGaugeChip.style.borderColor = '#ef4444';
        inputGaugeChip.style.background = 'rgba(239, 68, 68, 0.2)';
      }
    } else {
      if (inputGaugeChip) {
        inputGaugeChip.style.borderColor = '';
        inputGaugeChip.style.background = '';
      }
    }
  } else {
    if (inputGaugeChip) inputGaugeChip.classList.add('hide');
  }
  
  // Renders the active files grid inside vault modal
  if (files.length === 0) {
    list.innerHTML = `<div class="vault-empty-files">No documents in current active context. Click above to attach large text files.</div>`;
    if (sidebarList) {
      sidebarList.innerHTML = `<div style="font-size: 10px; color: var(--text-muted); padding: 8px 4px; font-style: italic;">ไม่มีเอกสารในคลัง</div>`;
    }
    return;
  }
  
  list.innerHTML = '';
  files.forEach((file, index) => {
    const card = document.createElement('div');
    card.className = 'uploaded-file-card';
    
    let typeEmoji = "";
    if (['html', 'css', 'js', 'json', 'py', 'sql'].includes(file.type.toLowerCase())) typeEmoji = "Code";
    if (file.type.toLowerCase() === 'md') typeEmoji = "";
    
    const sizeKB = (file.size / 1024).toFixed(1);
    
    card.innerHTML = `
    <div class="file-card-left">
    <span class="file-type-icon">${typeEmoji}</span>
    <div class="file-meta-info">
    <span class="file-name" title="${file.name}">${file.name}</span>
    <span class="file-stats">${sizeKB} KB • ${file.tokens.toLocaleString()} tokens</span>
    </div>
    </div>
    <button class="btn-remove-file" onclick="removeAttachedFile(${index})" title="Remove Memory Block">
    <svg viewBox="0 0 24 24" style="width: 14px; height: 14px; fill: currentColor;"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/></svg>
    </button>
    `;
    list.appendChild(card);
  });

  if (sidebarList) {
    sidebarList.innerHTML = '';
    files.forEach((file, index) => {
      const item = document.createElement('div');
      item.style.display = 'flex';
      item.style.justify = 'space-between';
      item.style.alignItems = 'center';
      item.style.padding = '4px 8px';
      item.style.background = 'rgba(255,255,255,0.02)';
      item.style.border = '1px solid rgba(255,255,255,0.05)';
      item.style.borderRadius = '4px';
      item.style.fontSize = '10px';
      item.style.gap = '8px';
      item.style.marginTop = '4px';

      const nameSpan = document.createElement('span');
      nameSpan.innerText = file.name;
      nameSpan.style.overflow = 'hidden';
      nameSpan.style.textOverflow = 'ellipsis';
      nameSpan.style.whiteSpace = 'nowrap';
      nameSpan.style.color = 'var(--text-main)';
      nameSpan.style.flexGrow = '1';
      nameSpan.title = file.name;

      const delBtn = document.createElement('button');
      delBtn.style.background = 'none';
      delBtn.style.border = 'none';
      delBtn.style.color = 'var(--text-muted)';
      delBtn.style.cursor = 'pointer';
      delBtn.style.padding = '2px';
      delBtn.style.display = 'flex';
      delBtn.style.alignItems = 'center';
      delBtn.innerHTML = `<svg viewBox="0 0 24 24" style="width: 10px; height: 10px; fill: currentColor;"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/></svg>`;
      delBtn.onclick = (e) => {
        e.stopPropagation();
        removeAttachedFile(index);
      };

      item.appendChild(nameSpan);
      item.appendChild(delBtn);
      sidebarList.appendChild(item);
    });
  }
}

// Close dropdowns on outside click
document.addEventListener('click', (e) => {
 // Theme dropdown close
 const themeWrapper = document.querySelector('.theme-selector-wrapper');
 if (themeWrapper && !themeWrapper.contains(e.target)) {
 const themeDrop = document.getElementById('themeDropdown');
 if (themeDrop) themeDrop.classList.remove('open');
 }
 
 // Model dropdown close
 const modelWrapper = document.querySelector('.model-select-wrapper');
 if (modelWrapper && !modelWrapper.contains(e.target)) {
 const modelDrop = document.getElementById('modelDropdownMenu');
 if (modelDrop) modelDrop.classList.remove('open');
 }
});

// ==========================================================================
// 10. ADVANCED AGENTIC WORKSPACE FUNCTIONS (DEEP SEARCH, SANDBOX, TASK RUNNER)
// ==========================================================================

// Toggle Deep Search state and button glow
function toggleDeepSearch() {
 playSynthSound('click');
 state.deepSearchEnabled = !state.deepSearchEnabled;
 
 const btn = document.getElementById('deepSearchToggleBtn');
 if (btn) {
 if (state.deepSearchEnabled) {
 btn.classList.add('active');
 showToast("Deep Semantic Search Enabled (Active Live Crawl)");
 } else {
 btn.classList.remove('active');
 showToast("Deep Search Disabled.");
 }
 }
 saveDataToStorage();
}

// Toggle sliding splitscreen sandbox panel visibility
function toggleSandbox(isOpen) {
 playSynthSound('click');
 const panel = document.getElementById('sandboxPanel');
 if (panel) {
 if (isOpen) {
 panel.classList.remove('hide');
 } else {
 panel.classList.add('hide');
 }
 }
}

// Switch between preview rendering and raw source code tabs
function switchSandboxTab(tabName) {
 playSynthSound('click');
 document.querySelectorAll('.btn-sandbox-tab').forEach(btn => btn.classList.remove('active'));
 document.querySelectorAll('.sandbox-tab-content').forEach(content => content.classList.add('hide'));
 
 const activeBtn = document.getElementById(`btn-tab-${tabName}`);
 const activeContent = document.getElementById(`sandbox-content-${tabName}`);
 
 if (activeBtn) activeBtn.classList.add('active');
 if (activeContent) activeContent.classList.remove('hide');
 
 if (tabName === 'pipeline') {
 selectPipelinePreset(state.pipelineMode || 'basic');
 }
}

// Scans text for HTML/CSS/JS codeblocks and executes them inside sandbox
function extractAndRenderCode(text) {
 // Regex matches HTML or XML or SVG codeblocks
 const codeBlockRegex = /```(?:html|xml|svg)\n([\s\S]*?)```/i;
 const match = text.match(codeBlockRegex);
 
 if (match && match[1]) {
 const code = match[1].trim();
 
 // Show Sandbox panel and set active preview tab
 toggleSandbox(true);
 switchSandboxTab('preview');
 
 // Feed code into source viewer
 const codeDisplay = document.getElementById('sandboxCodeDisplay');
 if (codeDisplay) codeDisplay.innerText = code;
 
 // Feed code into execution iframe
 const iframe = document.getElementById('sandboxIframe');
 if (iframe) {
 // Apply title dynamically if extracted from markup
 const titleMatch = code.match(/<title>([\s\S]*?)<\/title>/i);
 const title = titleMatch ? titleMatch[1] : "Interactive Web Mockup";
 document.getElementById('sandboxAppTitle').innerText = title;
 
 // Ingest source code into sandboxed iframe DOM
 iframe.srcdoc = code;
 
 showToast("Lumina Sandbox: Web Artifact Compiled & Executing!");
 playSynthSound('receive');
 }
 }
}

// Simulated Agent Task Checklist runner
let activeTaskInterval = null;
function startAgentTask(goal) {
  // Clear any active running tasks
  if (activeTaskInterval) clearInterval(activeTaskInterval);
  
  // Set Sidebar Labels
  const goalEl = document.getElementById('activeAgentGoal');
  if (goalEl) {
    goalEl.innerText = goal;
    goalEl.title = goal;
  }
  
  // Open sandbox split-screen panel and switch to multi-agent pipeline visual canvas!
  toggleSandbox(true);
  switchSandboxTab('pipeline');
  
  // Select dynamic StateGraph 9-Agent debate & reflection preset
  selectPipelinePreset('reflection');
  
  // Seed the pipeline goal input with user query
  const pipelineGoalInput = document.getElementById('pipelineGoalInput');
  if (pipelineGoalInput) {
    pipelineGoalInput.value = goal;
  }
  
  // Auto start agent debate orchestrator execution loop
  startPipelineOrTraining();
  
  const status = document.getElementById('agentProgressStatus');
  const percent = document.getElementById('agentProgressPercent');
  const bar = document.getElementById('agentProgressBarFill');
  const list = document.getElementById('agentChecklist');
  
  if (status) status.innerText = "Analyzing";
  if (percent) percent.innerText = "0%";
  if (bar) bar.style.width = "0%";
  
  const checklistItems = [
    "9 specialized agents aligning on aesthetic architecture...",
    "Running Microsoft AutoGen & CrewAI debate loops...",
    "Resolving QA inspection & applying CSS shadows...",
    "Lumina Sandbox: Web Artifact Compiled & Executing!"
  ];
  
  if (list) {
    list.innerHTML = checklistItems.map((item, idx) => `
    <div class="agent-checklist-item" id="task-node-${idx}">
      <span class="checklist-icon" id="task-icon-${idx}">⏳</span>
      <span class="checklist-text">${item}</span>
    </div>
    `).join('');
  }
  
  let currentStep = 0;
  playSynthSound('switch');
  
  activeTaskInterval = setInterval(() => {
    if (currentStep < checklistItems.length) {
      const node = document.getElementById(`task-node-${currentStep}`);
      const icon = document.getElementById(`task-icon-${currentStep}`);
      
      if (node) node.className = "agent-checklist-item done";
      if (icon) icon.innerHTML = "✅";
      
      currentStep++;
      const pct = Math.floor((currentStep / checklistItems.length) * 100);
      if (percent) percent.innerText = `${pct}%`;
      if (bar) bar.style.width = `${pct}%`;
      
      if (status) {
        if (currentStep === 1) status.innerText = "Analyzing";
        if (currentStep === 2) status.innerText = "Refining";
        if (currentStep === 3) status.innerText = "Polishing";
        if (currentStep === 4) status.innerText = "Complete";
      }
      playSynthSound('click');
    } else {
      clearInterval(activeTaskInterval);
      activeTaskInterval = null;
    }
  }, 3000);
}

// ==========================================================================
// 11. REASONING DEPTH ENGINE & THINKING PROCESS LOOPS
// ==========================================================================

function changeThinkingLevel(level) {
 playSynthSound('switch');
 state.thinkingLevel = level;
 syncThinkingLevelUI();
 saveDataToStorage();
 showToast(`Thinking Depth set to: ${level.toUpperCase()}`);
}

function syncThinkingLevelUI() {
 const level = state.thinkingLevel || 'medium';
 document.querySelectorAll('.thinking-btn').forEach(btn => btn.classList.remove('active'));
 const activeBtn = document.getElementById(`think-${level}`);
 if (activeBtn) activeBtn.classList.add('active');
 
 const desc = document.getElementById('thinkingLevelDesc');
 const descriptions = {
 'low': 'น้อย (Low): Fast responses, minimal delay, suitable for simple queries.',
 'medium': 'กลาง (Medium): Balanced reasoning depth, standard analytical delay.',
 'high': 'มาก (High): Deeper logic analysis, verifies mathematical and code structures.',
 'extreme': 'สูงสุด (Extreme): DeepSeek-R1 style full reasoning chain, maximum thinking delay.'
 };
 if (desc) desc.innerText = descriptions[level] || descriptions['medium'];
}

function generateThinkingSteps(query, level) {
 const q = query.toLowerCase();
 
 // Core base steps depending on subject
 let steps = [];
 
 // Always-On Realtime Search & Crawling Pipeline logs
 if (state.deepSearchEnabled || state.apiMode === 'real') {
 steps = [
 "[DuckDuckGo Engine] Initiating live search query for: \"" + query + "\"...",
 "[Scraper Agent] Crawling top 5 reference sites concurrently (StackOverflow, GitHub, MDN)...",
 "[Semantic Extractor] Extracting raw code blocks & context into Context Attention Window...",
 "[Neural Reasoning] Analyzing 1,000+ extracted code blocks & synthesizing secure CSS/JS solution..."
 ];
 } else if (q.includes("รูปภาพ") || q.includes("image") || q.includes("svg") || q.includes("draw") || q.includes("canvas")) {
 steps = [
 "Parsing image request: mapping canvas dimensions and boundary grids...",
 "Designing geometric properties: establishing HSL gradient vectors & linear animations...",
 "Constructing scalable XML/SVG markup tags with micro-shadow translations...",
 "Verifying rendering paths: resolving cross-browser compatibility and sandbox performance..."
 ];
 } else if (q.includes("จำลอง") || q.includes("app") || q.includes("stopwatch") || q.includes("calculator")) {
 steps = [
 "Deconstructing application simulation specs: active timers & state bindings...",
 "Formulating frontend system layouts: embedding cosmic glassmorphic stylesheets...",
 "Programming user event callbacks: binding click events & microsecond accuracy...",
 "Running modular automated sandbox validation tests: checking event loops..."
 ];
 } else if (q.includes("คณิต") || q.includes("อินทิกรัล") || q.includes("integral") || q.includes("math")) {
 steps = [
 "Deconstructing advanced math calculus boundary inputs: singular point analysis...",
 "Formulating integration strategy: verifying substitutions & log identities...",
 "Proving symmetry condition: assessing inverse bounds and proving J = -J boundary...",
 "Combining integrals: verifying pi/2 coefficient and calculating quotient quotient..."
 ];
 } else {
 steps = [
 "Deconstructing conversational intent & semantic structures...",
 "Mapping context attention matrices across Context Vault files...",
 "Analyzing response optimization paths for precise logic assembly...",
 "Compiling final syntactically perfect markdown payload..."
 ];
 }
 
 // Slice or adjust based on Thinking Level
 const countMap = {
 'low': 1,
 'medium': 2,
 'high': 3,
 'extreme': steps.length
 };
 const count = countMap[level] || 2;
 return steps.slice(0, count);
}

function simulateThinkingChain(text, callback) {
  const timingMap = {
    'low': 500,
    'medium': 800,
    'high': 1200,
    'extreme': 1500
  };
  const level = state.thinkingLevel || 'medium';
  const delay = timingMap[level] || 800;

  const typingIndicator = document.getElementById('typingIndicator');
  const chatContainer = document.getElementById('chatContainer');

  // Reshow typing indicator
  document.getElementById('typingBotAvatar').innerText = PERSONAS[state.activePersona].avatar;
  typingIndicator.classList.remove('hide');
  if (chatContainer) chatContainer.scrollTop = chatContainer.scrollHeight;

  const list = document.getElementById('messagesList');
  const emptyState = document.getElementById('emptyState');
  if (emptyState) emptyState.style.display = 'none';
  if (list) list.style.display = 'flex';

  const tempMsgId = `temp-bot-msg-${Date.now()}`;
  const avatar = PERSONAS[state.activePersona].avatar;

  const tempItem = document.createElement('div');
  tempItem.className = 'message-wrapper bot-msg';
  tempItem.id = tempMsgId;

  tempItem.innerHTML = `
  <div class="msg-avatar">${avatar}</div>
  <div class="msg-content-wrapper">
  <div class="msg-bubble">
  <div class="msg-typing-placeholder" id="${tempMsgId}-typing-text" style="color: var(--text-muted); font-size: 13px; font-style: italic;">
  <span class="typing-dot-item"></span>
  <span class="typing-dot-item"></span>
  <span class="typing-dot-item"></span>
  </div>
  </div>
  <span class="msg-time">${formatTime(Date.now())}</span>
  </div>
  `;
  list.appendChild(tempItem);

  typingIndicator.classList.add('hide');
  if (chatContainer) chatContainer.scrollTop = chatContainer.scrollHeight;

  const startTime = Date.now();

  setTimeout(() => {
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    const isRealAI = (state.apiMode === 'real' && state.apiKey.trim().length > 0);

    if (isRealAI) {
      callback("", elapsed, tempMsgId);
    } else {
      tempItem.remove();
      typingIndicator.classList.remove('hide');
      callback("", elapsed, null);
    }
  }, delay);
}




// Toggle Think Mode — enables real chain-of-thought display
function toggleThinkMode(event) {
  if (event) event.stopPropagation();
  state.thinkMode = !state.thinkMode;

  const btn  = document.getElementById('thinkModeBtn');
  const badge = document.getElementById('thinkModeBadge');
  const desc  = document.getElementById('thinkModeDesc');

  if (state.thinkMode) {
    btn   && btn.classList.add('think-active');
    badge && (badge.textContent = 'ON');
    desc  && (desc.textContent = 'แสดง reasoning จริงๆ แบบ real-time');
    showToast('Think Mode ON — AI จะแสดงความคิดแบบ real-time');
  } else {
    btn   && btn.classList.remove('think-active');
    badge && (badge.textContent = 'OFF');
    desc  && (desc.textContent = 'Deep reasoning for complex tasks');
    showToast('Think Mode OFF');
  }
  saveDataToStorage();
}

// Sync Think Mode UI on load
function syncThinkModeUI() {
  const btn   = document.getElementById('thinkModeBtn');
  const badge = document.getElementById('thinkModeBadge');
  const desc  = document.getElementById('thinkModeDesc');
  if (state.thinkMode) {
    btn   && btn.classList.add('think-active');
    badge && (badge.textContent = 'ON');
    desc  && (desc.textContent = 'แสดง reasoning จริงๆ แบบ real-time');
  }
}
// Toggle sandbox tab bar (ซ่อน/แสดง tab buttons)
function toggleSandboxTabs() {
  const actions = document.getElementById('sandboxTabActions');
  const btn = document.getElementById('btnHideTabs');
  if (!actions || !btn) return;
  const isHidden = actions.classList.toggle('tabs-hidden');
  btn.title = isHidden ? 'Show Tabs' : 'Hide Tabs';
  btn.style.transform = isHidden ? 'rotate(180deg)' : 'rotate(0deg)';
  // Expand sandbox body when tabs hidden (more space for content)
  const body = document.querySelector('.sandbox-body');
  if (body) body.style.height = isHidden ? 'calc(100% - 46px)' : '';
  playSynthSound('click');
  state.sandboxTabsHidden = isHidden;
  saveDataToStorage();
}

// ════════════════════════════════════════════════════════════════════
// THINK STREAM PARSER — parses <think>...</think> from live stream
// and renders a real-time "thinking" block with collapsible UI
// ════════════════════════════════════════════════════════════════════
class ThinkStreamParser {
  constructor(bubble, modelName) {
    this.bubble      = bubble;
    this.modelName   = modelName;
    this.pending     = '';
    this.thinkText   = '';
    this.answerText  = '';
    this.inThink     = false;
    this.thinkDone   = false;
    this.thinkEl     = null;
    this.thinkBodyEl = null;
    this.timerEl     = null;
    this.answerEl    = null;
    this._timerInt   = null;
    this._startTime  = Date.now();
    this._uid        = 'tp' + Date.now();
    this._initDOM();
  }

  _initDOM() {
    // ── <details><summary> collapsible thinking block ──────────────────
    this.bubble.innerHTML =
      '<details class="think" id="' + this._uid + '" open>' +
        '<summary>' +
          '<svg class="think-spin-icon" viewBox="0 0 24 24"><path d="M12 2a10 10 0 0 1 10 10" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="12" r="2.5" fill="currentColor"/></svg>' +
          '<span class="think-sum-label">Let me think first…</span>' +
          '<span class="think-sum-model">' + this.modelName + '</span>' +
          '<svg class="think-sum-chev" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
        '</summary>' +
        '<div class="think-content" id="' + this._uid + '-body"></div>' +
      '</details>' +
      '<div class="think-answer-wrap" id="' + this._uid + '-ans"></div>';
    this.thinkEl     = document.getElementById(this._uid);
    this.thinkBodyEl = document.getElementById(this._uid + '-body');
    this.answerEl    = document.getElementById(this._uid + '-ans');
  }

  push(chunk) {
    this.pending += chunk;
    this._scan();
    this._flushAnswer();
  }

  _scan() {
    while (this.pending.length > 0) {
      if (!this.inThink && !this.thinkDone) {
        const si = this.pending.indexOf('<think>');
        if (si === -1) {
          // Hold back if trailing chars could be start of <think>
          const tag = '<think>';
          let hold = 0;
          for (let i = 1; i < tag.length; i++) {
            if (this.pending.endsWith(tag.slice(0, i))) { hold = i; break; }
          }
          this.answerText += this.pending.slice(0, this.pending.length - hold);
          this.pending     = this.pending.slice(this.pending.length - hold);
          break;
        }
        this.answerText += this.pending.slice(0, si);
        this.pending     = this.pending.slice(si + 7); // skip <think>
        this.inThink     = true;
      } else if (this.inThink) {
        const ei = this.pending.indexOf('</think>');
        if (ei === -1) {
          const tag = '</think>';
          let hold = 0;
          for (let i = 1; i < tag.length; i++) {
            if (this.pending.endsWith(tag.slice(0, i))) { hold = i; break; }
          }
          this.thinkText += this.pending.slice(0, this.pending.length - hold);
          this.pending    = this.pending.slice(this.pending.length - hold);
          this._updateThink();
          break;
        }
        this.thinkText += this.pending.slice(0, ei);
        this.pending    = this.pending.slice(ei + 8); // skip </think>
        this._updateThink();
        this._sealThink();
        this.inThink  = false;
        this.thinkDone = true;
      } else {
        // Post-think: all answer
        this.answerText += this.pending;
        this.pending = '';
      }
    }
  }

  _updateThink() {
    if (!this.thinkBodyEl) return;
    // Sanitize and display raw thought text
    this.thinkBodyEl.textContent = this.thinkText;
    this.thinkBodyEl.scrollTop   = this.thinkBodyEl.scrollHeight;
  }

  _flushAnswer() {
    if (!this.answerEl) return;
    let t = this.answerText;
    const bt = (t.match(/```/g) || []).length;
    if (bt % 2 !== 0) t += '\n```';
    this.answerEl.innerHTML = parseMarkdown(t);
    this.answerEl.querySelectorAll('.inline-sandbox-wrapper').forEach(mountInlineSandbox);
  }

  _sealThink() {
    clearInterval(this._timerInt);
    // Change label to "Done thinking" and stop spinning
    if (this.thinkEl) {
      const lbl = this.thinkEl.querySelector('.think-sum-label');
      if (lbl) lbl.textContent = 'Done thinking';
      const spin = this.thinkEl.querySelector('.think-spin-icon');
      if (spin) { spin.style.animation = 'none'; spin.style.opacity = '0.4'; }
      // Auto-close after brief pause
      setTimeout(() => { if (this.thinkEl) this.thinkEl.removeAttribute('open'); }, 700);
    }
  }

  finalize() {
    clearInterval(this._timerInt);
    if (this.pending) {
      if (this.inThink) { this.thinkText += this.pending; this._updateThink(); }
      else              { this.answerText += this.pending; }
      this.pending = '';
    }
    if (!this.thinkDone) this._sealThink();
    this._flushAnswer();
    this.answerEl && this.answerEl.querySelectorAll('.inline-sandbox-wrapper').forEach(mountInlineSandbox);
  }

  // Returns only the answer text (for saving to botMsg.text & SFT dataset)
  getAnswer() { return this.answerText; }
}

// ════════════════════════════════════════════════════════════════════
// TOOL CALL ENGINE — AI file access via Lumina server endpoints
// ════════════════════════════════════════════════════════════════════

const FILE_TOOLS_SYSTEM = `
You have access to tools via the server. Use this EXACT format (ONE tool per response):
<tool_call>{"name":"TOOL_NAME","arguments":{...}}</tool_call>

=== FILE & WORKSPACE ===
<tool_call>{"name":"read_file","arguments":{"path":"file.py"}}</tool_call>
<tool_call>{"name":"write_file","arguments":{"path":"out.py","content":"..."}}</tool_call>
<tool_call>{"name":"list_files","arguments":{}}</tool_call>
<tool_call>{"name":"patch_file","arguments":{"filepath":"f.py","old_str":"old","new_str":"new"}}</tool_call>
<tool_call>{"name":"download_file","arguments":{"filepath":"result.py"}}</tool_call>

=== TERMINAL ===
<tool_call>{"name":"run_python","arguments":{"code":"print('hello')"}}</tool_call>
<tool_call>{"name":"exec_command","arguments":{"cmd":"pip list"}}</tool_call>
<tool_call>{"name":"autofix_code","arguments":{"filepath":"broken.py"}}</tool_call>

=== SEARCH ===
<tool_call>{"name":"web_search","arguments":{"query":"...","max_results":10}}</tool_call>
<tool_call>{"name":"search","arguments":{"query":"..."}}</tool_call>

=== MEMORY ===
<tool_call>{"name":"memory_store","arguments":{"text":"...","metadata":{}}}</tool_call>
<tool_call>{"name":"memory_recall","arguments":{"query":"...","n_results":5}}</tool_call>

=== TASKS ===
<tool_call>{"name":"schedule_task","arguments":{"instruction":"...","interval_minutes":60}}</tool_call>
<tool_call>{"name":"list_tasks","arguments":{}}</tool_call>

=== VISION ===
<tool_call>{"name":"vision_analyze","arguments":{"image_b64":"<base64>","prompt":"describe"}}</tool_call>

Rules: Use <thought>...</thought> before calling a tool. ONE tool per turn. After result, answer directly.
`.trim();

// Execute a single tool call against the Lumina server
// Supports server v2 tool names + legacy names
async function executeToolCall(name, paramsStr) {
  const base = (state.ngrokUrl || '').replace(/\/$/, '');
  if (!base) return { error: 'No server URL configured' };

  let params = {};
  try { params = JSON.parse(paramsStr || '{}'); } catch(e) { return { error: 'Invalid params: ' + paramsStr }; }

  const h = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + state.apiKey,
    'ngrok-skip-browser-warning': 'true',
  };
  const post = (url, body) => fetch(base + url, { method:'POST', headers: h, body: JSON.stringify(body) }).then(r => r.json());
  const get  = (url)       => fetch(base + url, { headers: h }).then(r => r.json());
  const del  = (url)       => fetch(base + url, { method:'DELETE', headers: h }).then(r => r.json());

  try {
    switch (name) {
      // ── File ops ─────────────────────────────────────────────────────
      case 'read_file':   return await post('/v1/file/read2',  { filepath: params.path || params.filepath });
      case 'write_file':  return await post('/v1/file/write2', { filepath: params.path || params.filepath, content: params.content });
      case 'list_files':  return await get('/v1/file/list' + (params.directory ? '?directory=' + encodeURIComponent(params.directory) : ''));
      case 'patch_file':  return await post('/v1/file/patch',  { filepath: params.filepath, old_str: params.old_str, new_str: params.new_str });
      case 'ai_edit_file':return await post('/v1/file/ai-edit',{ filepath: params.filepath, args: params.args });
      case 'append_file': return await post('/v1/file/append', { path: params.path, content: params.content });
      case 'list_workspace': return await get('/v1/terminal/ls?subdir=' + encodeURIComponent(params.subdir || ''));
      case 'download_file': {
        const a = document.createElement('a');
        a.href = base + '/v1/file/download/' + encodeURIComponent(params.filepath || '');
        a.download = (params.filepath || 'file').split('/').pop(); a.click();
        return { success: true, message: 'Downloading: ' + params.filepath };
      }

      // ── Terminal ──────────────────────────────────────────────────────
      case 'exec_command':     return await post('/v1/terminal/exec',    { cmd: params.cmd, timeout: params.timeout || 15 });
      case 'run_python':       return await post('/v1/terminal/python',  { code: params.code, timeout: params.timeout || 30 });
      case 'run_python_file':  return await post('/v1/terminal/python',  { filepath: params.filepath, args: params.args || [] });
      case 'autofix_code':     return await post('/v1/terminal/autofix', { filepath: params.filepath, max_iter: params.max_iter || 3 });

      // ── Vision ────────────────────────────────────────────────────────
      case 'vision_analyze': return await post('/v1/vision/analyze', { image_b64: params.image_b64, prompt: params.prompt || 'describe', max_tokens: 512 });
      case 'vision_status':  return await get('/v1/vision/status');

      // ── Memory ───────────────────────────────────────────────────────
      case 'memory_store':
      case 'memory_save':    return await post('/v1/memory/save', { key: params.key || ('mem_' + Date.now()), value: params.text || params.value, category: params.metadata?.type || 'general' });
      case 'memory_recall':
      case 'memory_get':     return await get('/v1/memory/list');

      // ── Search ────────────────────────────────────────────────────────
      case 'search':
      case 'web_search':     return await post('/v1/search', { query: params.query || params.q, max_pages: params.max_results || 10 });
      case 'web_fetch':      return await post('/v1/search', { query: params.url, max_pages: 1 });

      // ── Tasks ─────────────────────────────────────────────────────────
      case 'schedule_task':  return await post('/v1/task/save', { instruction: params.instruction, interval_minutes: params.interval_minutes || 60 });
      case 'list_tasks':     return await get('/v1/task/list');
      case 'cancel_task':    return await post('/v1/task/done/' + encodeURIComponent(params.task_id || ''), {});

      // ── Skill ─────────────────────────────────────────────────────────
      case 'skill_save':     return await post('/v1/skill/save', params);
      case 'skill_list':     return await get('/v1/skill/list');

      // ── Not directly executable via API (server handles internally) ──
      case 'ssh_remote':
        return { info: 'ssh_remote ทำงานบน server โดยตรง ไม่มี API endpoint', host: params.host, command: params.command };
      case 'send_email':
        return { info: 'send_email ทำงานบน server โดยตรง', to: params.to, subject: params.subject };

      default:
        return { error: 'Unknown tool: ' + name };
    }
  } catch(e) {
    return { error: e.message };
  }
}

// Extract tool calls from AI response text
// Supports BOTH formats:
//   OLD: <tool_call name="exec_command">{"cmd":"..."}</tool_call>
//   NEW: <tool_call>{"name":"run_python","arguments":{...}}</tool_call>
function extractToolCalls(text) {
  const calls = [];
  // New format (JSON inside, no name attribute)
  const regexNew = new RegExp('<tool_call>([\s\S]*?)<\/tool_call>', 'g');
  let m;
  while ((m = regexNew.exec(text)) !== null) {
    try {
      const parsed = JSON.parse(m[1].trim());
      const name   = parsed.name || parsed.tool || '';
      const args   = parsed.arguments || parsed.params || parsed || {};
      calls.push({ name, params: JSON.stringify(args), full: m[0], _v2: true });
    } catch(e) {
      calls.push({ name: 'unknown', params: m[1].trim(), full: m[0], _v2: true });
    }
  }
  // Old format (name attribute)
  const regexOld = new RegExp('<tool_call[^>]+name="([^"]+)">((?:[\s\S])*?)<\/tool_call>', 'g');
  while ((m = regexOld.exec(text)) !== null) {
    calls.push({ name: m[1].trim(), params: m[2].trim(), full: m[0], _v2: false });
  }
  return calls;
}

// Format tool result as readable text for injection back to AI
function formatToolResult(name, params, result) {
  const p = (() => { try { return JSON.parse(params); } catch(e) { return {}; } })();
  if (result.error) return '[Tool Error - ' + name + ']: ' + result.error;

  switch (name) {
    // ── Files ──────────────────────────────────────────────────────────
    case 'read_file': case 'read_file2':
      return '[File: ' + (p.path || p.filepath || '?') + ']\n```\n' +
        (result.content || JSON.stringify(result, null, 2)) + '\n```';
    case 'write_file': case 'append_file': case 'patch_file':
      return '[' + name + ' OK]: ' + (p.path || p.filepath || '?') + ' — ' + (result.message || result.status || 'OK');
    case 'ai_edit_file':
      return '[AI edited: ' + result.filepath + '] ' + (result.original_size || '') + ' → ' + (result.patched_size || '') + ' chars';
    case 'list_files': case 'list_workspace': {
      const files = result.files || result.items || [];
      const list  = Array.isArray(files)
        ? files.map(f => '  - ' + (typeof f === 'string' ? f : (f.name || JSON.stringify(f)))).join('\n')
        : JSON.stringify(files, null, 2);
      return '[Files: ' + (result.workspace || p.directory || '.') + '] ' + (result.count || files.length) + ' items\n' + list;
    }
    case 'download_file': return '[Downloading] ' + (p.filepath || '?');

    // ── Terminal ───────────────────────────────────────────────────────
    case 'exec_command':
      return '[$ ' + (p.cmd || '') + '] exit:' + result.returncode + '\n' +
        (result.stdout || '') + (result.stderr ? '\n[err]: ' + result.stderr : '');
    case 'run_python': case 'run_python_file':
      return '[Python] exit:' + result.returncode + '\n' +
        (result.stdout || '') + (result.stderr ? '\n[err]: ' + result.stderr : '');
    case 'autofix_code':
      return '[Autofix: ' + p.filepath + '] ok:' + result.success + ' rounds:' + result.iterations;

    // ── Vision ─────────────────────────────────────────────────────────
    case 'vision_analyze':
      return '[Vision]\n' + (result.result || JSON.stringify(result));
    case 'vision_status':
      return '[Vision] ready:' + result.pipeline_ready + ' model:' + (result.clip_model || '-');

    // ── Memory (NEW) ───────────────────────────────────────────────────
    case 'memory_store': case 'memory_save':
      return '[Memory saved] key: ' + (result.key || '?') + ' — ' + (result.status || 'OK');
    case 'memory_recall': case 'memory_get': {
      const mems = result.memories || result.items || [];
      if (Array.isArray(mems) && mems.length)
        return '[Memory ' + mems.length + ' results]\n' + mems.map((m,i) => (i+1) + '. ' + (m.key||m.text||JSON.stringify(m)).substring(0,80)).join('\n');
      return '[Memory] ' + JSON.stringify(result, null, 2);
    }

    // ── Search (NEW) ───────────────────────────────────────────────────
    case 'search': case 'web_search': case 'web_fetch':
      return '[Search: ' + (result.query || p.query || '') + ']\n' +
        (result.summary || result.result || '').substring(0, 500) +
        (result.sources ? '\nSources: ' + result.sources.slice(0,3).join(', ') : '');

    // ── Tasks (NEW) ────────────────────────────────────────────────────
    case 'schedule_task':
      return '[Task scheduled] id: ' + (result.task_id || result.id || '?') + ' every ' + (result.interval_minutes || '?') + ' min';
    case 'list_tasks': {
      const tasks = result.tasks || result.items || [];
      return '[Tasks ' + tasks.length + ']\n' + tasks.map(t => '  · ' + (t.task_id||t.id) + ': ' + (t.instruction||JSON.stringify(t)).substring(0,60)).join('\n');
    }
    case 'cancel_task': return '[Task cancelled] ' + (result.status || 'OK');

    // ── Remote / Email (NEW) ───────────────────────────────────────────
    case 'ssh_remote': case 'send_email':
      return '[' + name + '] ' + (result.info || result.status || JSON.stringify(result));

    default:
      return '[' + name + ']: ' + JSON.stringify(result, null, 2);
  }
}

// Run tool-call loop: detect calls in response, execute, continue conversation
async function runToolCallLoop(botMsg, bubble, apiMessages, thinkParser, startTime) {
  const toolCalls = extractToolCalls(botMsg.text || '');
  if (toolCalls.length === 0) return false; // no tool calls

  const toolMsgs = [...apiMessages,
    { role: 'assistant', content: botMsg.text },
  ];

  for (const call of toolCalls) {
    // Show executing indicator in bubble
    const _toolLabels = {
      // File ops
      read_file: 'Reading file', read_file2: 'Reading file',
      write_file: 'Writing file', write_file2: 'Writing file',
      patch_file: 'Patching file', ai_edit_file: 'Editing file',
      append_file: 'Appending to file',
      list_files: 'Listing files', list_workspace: 'Listing workspace',
      download_file: 'Downloading file',
      // Terminal
      exec_command: 'Running command', run_python: 'Running Python',
      run_python_file: 'Running Python file', autofix_code: 'Auto-fixing code',
      // Vision
      vision_analyze: 'Analyzing image', vision_status: 'Checking vision',
      // Memory (NEW)
      memory_store: 'Saving to memory', memory_save: 'Saving to memory',
      memory_recall: 'Recalling memory', memory_get: 'Reading memory',
      // Search (NEW)
      search: 'Deep search', web_search: 'Searching web', web_fetch: 'Fetching page',
      // Tasks (NEW)
      schedule_task: 'Scheduling task', list_tasks: 'Listing tasks', cancel_task: 'Cancelling task',
      // Other (NEW)
      ssh_remote: 'Remote command', send_email: 'Sending email',
      skill_save: 'Saving skill', skill_list: 'Listing skills',
    };
    const _tcLabel = _toolLabels[call.name] || call.name.replace(/_/g, ' ');
    const _tcPath  = (() => { try { const p=JSON.parse(call.params||'{}'); return (p.cmd||p.filepath||p.path||p.code||'').toString().substring(0,55); } catch(e){return '';} })();
    const toolHtml = '<div class="tc-card">' +
      '<div class="tc-logo"><svg viewBox="0 0 24 24" class="tc-logo-svg" style="animation:none"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M2 12l10 5 10-5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg></div>' +
      '<div class="tc-body"><span class="tc-label">' + _tcLabel + '</span>' +
      (_tcPath ? '<span class="tc-path">' + _tcPath + '</span>' : '') + '</div>' +
      '<div class="tc-dots"><span></span><span></span><span></span></div>' +
      '</div>';
    if (bubble) bubble.innerHTML = toolHtml;

    const result = await executeToolCall(call.name, call.params);
    const resultText = formatToolResult(call.name, call.params, result);
    toolMsgs.push({ role: 'user', content: `<tool_result name="${call.name}">${resultText}</tool_result>` });
  }

  // Make second API call with tool results injected
  const endpoint = state.ngrokUrl.replace(/\/$/, '') + '/v1/chat/completions';
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${state.apiKey}`,
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    },
    body: JSON.stringify({
      model: state.realModel,
      messages: toolMsgs,
      temperature: state.temperature,
      max_tokens: 4096,
      stream: false,
    }),
  });

  const data = await response.json();
  const finalText = data?.choices?.[0]?.message?.content || '';
  botMsg.text = finalText;

  // Render final response
  if (bubble) {
    if (thinkParser) {
      thinkParser.pending = finalText;
      thinkParser._scan();
      thinkParser._flushAnswer();
      thinkParser.finalize();
    } else {
      bubble.innerHTML = parseMarkdown(finalText);
      bubble.querySelectorAll('.inline-sandbox-wrapper').forEach(mountInlineSandbox);
    }
  }

  saveDataToStorage();
  return true;
}

// Toggle File Access mode
function toggleFileAccess(event) {
  if (event) event.stopPropagation();
  state.fileAccessMode = !state.fileAccessMode;
  const btn   = document.getElementById('fileAccessBtn');
  const badge = document.getElementById('fileAccessBadge');
  const desc  = document.getElementById('fileAccessDesc');
  if (state.fileAccessMode) {
    btn   && btn.classList.add('think-active');
    badge && (badge.textContent = 'ON');
    desc  && (desc.textContent = 'AI กำลังเข้าถึงไฟล์บน server ได้');
    showToast('📂 File Access ON — AI อ่าน/เขียนไฟล์บน server ได้');
  } else {
    btn   && btn.classList.remove('think-active');
    badge && (badge.textContent = 'OFF');
    desc  && (desc.textContent = 'AI อ่าน/เขียนไฟล์บน server');
    showToast('File Access OFF');
  }
  document.getElementById('modelDropdownMenu') && document.getElementById('modelDropdownMenu').classList.remove('open');
  saveDataToStorage();
}

// Sync File Access UI on load
function syncFileAccessUI() {
  const btn   = document.getElementById('fileAccessBtn');
  const badge = document.getElementById('fileAccessBadge');
  const desc  = document.getElementById('fileAccessDesc');
  if (state.fileAccessMode) {
    btn   && btn.classList.add('think-active');
    badge && (badge.textContent = 'ON');
    desc  && (desc.textContent = 'AI กำลังเข้าถึงไฟล์บน server ได้');
  }
}
// ── HELPER: renders inline sandbox card into wrapper element ──────────────
function mountInlineSandbox(wrapper) {
  if (wrapper.children.length > 0) return;
  const codeId = wrapper.getAttribute('data-code-id');
  const codeEl = document.getElementById(codeId);
  if (!codeEl) return;
  const rawCode = codeEl.innerText.trim();
  wrapper.innerHTML = `
    <div class="inline-sandbox-card">
      <div class="inline-sandbox-header">
        <div class="inline-sandbox-title-block">
          <span class="inline-sandbox-indicator"></span>
          <span class="inline-sandbox-title">Inline Live Preview</span>
        </div>
        <div class="inline-sandbox-actions">
          <button class="btn-inline-action active" id="btn-inline-preview-${codeId}" onclick="switchInlineSandbox('${codeId}', 'preview')">Live Preview</button>
          <button class="btn-inline-action" id="btn-inline-code-${codeId}" onclick="switchInlineSandbox('${codeId}', 'code')">Source</button>
          <button class="btn-inline-action btn-inline-launch" onclick="launchFullWorkspaceSandbox('${codeId}')" title="Full Workspace">Full Workspace</button>
        </div>
      </div>
      <div class="inline-sandbox-body">
        <div class="inline-sandbox-tab-content" id="inline-preview-content-${codeId}">
          <iframe class="inline-sandbox-iframe" id="inline-iframe-${codeId}" sandbox="allow-scripts allow-modals" title="Inline Live Preview"></iframe>
        </div>
        <div class="inline-sandbox-tab-content hide" id="inline-code-content-${codeId}">
          <pre class="inline-sandbox-code-pre"><code id="inline-code-display-${codeId}"></code></pre>
        </div>
      </div>
    </div>`;
  const iframe = document.getElementById('inline-iframe-' + codeId);
  const codeDisp = document.getElementById('inline-code-display-' + codeId);
  if (iframe) iframe.srcdoc = rawCode;
  if (codeDisp) codeDisp.innerText = rawCode;
}
// ── Auth guard + auto-load server config ─────────────────────────────
(function checkAuth() {
  if (typeof LuminaAuth === 'undefined') return;
  if (!LuminaAuth.isLoggedIn()) {
    window.location.href = '/login';
    return;
  }
  // Auto-load ngrokUrl from server .env if not already set
  fetch('/api/config').then(r => r.json()).then(cfg => {
    if (cfg.ngrokUrl && !state.ngrokUrl) {
      state.ngrokUrl = cfg.ngrokUrl;
      saveDataToStorage();
    }
    if (cfg.googleClientId) {
      window._googleClientId = cfg.googleClientId;
    }
  }).catch(() => {});
})();

// 9. BOOTSTRAP INITIALIZATION
window.addEventListener('DOMContentLoaded', () => {
 loadDataFromStorage();
 renderHistoryList();
 renderMessages();
});

// 10. LUMINA AI IMAGE STUDIO CONTROLLER
function syncStudioUI() {
 // Select active model visually
 document.querySelectorAll('.studio-model-card').forEach(card => {
 card.classList.remove('active');
 if (card.getAttribute('data-model') === state.studioSelectedModel) {
 card.classList.add('active');
 }
 });
 
 // Select active ratio visually
 document.querySelectorAll('.studio-aspect-btn').forEach(btn => {
 btn.classList.remove('active');
 if (btn.getAttribute('data-ratio') === state.studioSelectedRatio) {
 btn.classList.add('active');
 }
 });
 
 // Select style visually
 const styleSelect = document.getElementById('studioStyleSelect');
 if (styleSelect) {
 styleSelect.value = state.studioStyle || '';
 }
 
 renderStudioHistory();
}

function selectStudioModel(modelName) {
 playSynthSound('click');
 state.studioSelectedModel = modelName;
 
 // Update UI active card
 document.querySelectorAll('.studio-model-card').forEach(card => {
 card.classList.remove('active');
 });
 const selectedCard = document.querySelector(`.studio-model-card[data-model="${modelName}"]`);
 if (selectedCard) selectedCard.classList.add('active');
 
 // Update textarea placeholder dynamically based on model characteristics
 const promptInput = document.getElementById('studioPromptInput');
 if (promptInput) {
 const placeholders = {
 'flux': "A futuristic majestic cybernetic owl, cinematic neon backlighting, high detail, masterpiece...",
 'flux-anime': "Magical girl standing on a Tokyo skyscraper overlooking glowing purple streets, vintage anime poster style...",
 'flux-realism': "Close-up cinematic portrait of a cybernetic tiger with neon orange wiring, 85mm lens, atmospheric depth...",
 'flux-3d': "A cute little fluffy stardust dragon sitting on a glowing celestial orb, 3D Pixar character mockup...",
 'any-dark': "A dark gothic cathedral surrounded by floating crystalline stars, high-contrast dark fantasy oil painting...",
 'turbo': "Beautiful landscape of crystal mountains under a synthwave neon sunset grid, highly detailed..."
 };
 promptInput.placeholder = placeholders[modelName] || "Describe your vision...";
 }
 saveDataToStorage();
}

function selectStudioRatio(ratioStr) {
 playSynthSound('click');
 state.studioSelectedRatio = ratioStr;
 
 // Update UI active button
 document.querySelectorAll('.studio-aspect-btn').forEach(btn => {
 btn.classList.remove('active');
 });
 const selectedBtn = document.querySelector(`.studio-aspect-btn[data-ratio="${ratioStr}"]`);
 if (selectedBtn) selectedBtn.classList.add('active');
 saveDataToStorage();
}

function applyStudioStyle() {
 playSynthSound('click');
 const select = document.getElementById('studioStyleSelect');
 if (select) {
 state.studioStyle = select.value;
 }
 saveDataToStorage();
}

function enhanceStudioPrompt() {
 playSynthSound('switch');
 const promptInput = document.getElementById('studioPromptInput');
 if (!promptInput) return;
 
 let text = promptInput.value.trim();
 if (!text) {
 showToast("Please write a short prompt description first!");
 return;
 }
 
 // Enhance prompt with premium modifiers based on selected model and style preset
 const enhancements = {
 'cinematic': "photorealistic 8k octane render, beautiful cinematic composition, detailed volumetric lighting, depth of field, 35mm lens, stunning details",
 'watercolor': "acrylic watercolor style, vibrant wet wash textures, elegant splash details, rich pigments, fine-art canvas texture, masterpiece",
 'cyberpunk': "cyberpunk style, synthwave neon aesthetic, glowing cables, atmospheric fog, rain-slicked concrete, retro-futuristic grid, high detailed 3d render",
 'fantasy': "mythical dark fantasy illustration, ethereal particles, intricate golden filigree, glowing stardust runes, dramatic lighting, magical atmosphere",
 'vector': "minimalist flat vector graphics logo design, high-contrast bold color palette, clean outlines, sharp paths, elegant geometric vectors, white background",
 'pencil': "exquisite hand-drawn graphite pencil sketch, fine charcoal crosshatching, detailed shading, classical fine-art texture, raw hand-drawn lines",
 'isometric': "isometric 3D voxel mockup game assets, soft volumetric clay render, pixelated retro-fantasy details, vibrant pastel colors, adorable game style"
 };
 
 const modelEnhancements = {
 'flux': "hyper-realistic masterpiece, award-winning composition, immaculate details, sharp focus, stunning digital painting",
 'flux-anime': "exquisite Japanese anime and manga key art, high-fidelity color palette, Kyoto animation keyframe style, beautifully hand-drawn aesthetics",
 'flux-realism': "stunning award-winning photographic portrait, raw camera texture, natural skin details, ray-traced ambient lighting, bokeh background",
 'flux-3d': "super-detailed 3D toy character illustration, soft translucent textures, cinematic Pixar style, warm friendly lighting",
 'any-dark': "ominous cosmic horror dark fantasy design, glowing runic engravings, gothic neon accents, high contrast shadows, highly detailed",
 'turbo': "highly detailed aesthetic rendering, brilliant neon light arrays, vibrant colors, stunning HD output"
 };
 
 let modifiers = [];
 if (state.studioStyle && enhancements[state.studioStyle]) {
 modifiers.push(enhancements[state.studioStyle]);
 }
 if (state.studioSelectedModel && modelEnhancements[state.studioSelectedModel]) {
 modifiers.push(modelEnhancements[state.studioSelectedModel]);
 }
 
 if (modifiers.length > 0) {
 // Strip any existing occurrences to prevent duplicates
 modifiers.forEach(m => {
 const cleanM = m.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
 const regex = new RegExp(`,\\s*${cleanM}`, 'gi');
 text = text.replace(regex, '');
 });
 promptInput.value = `${text}, ${modifiers.join(', ')}`;
 showToast("Auto Prompt enhanced with visual modifiers!");
 }
}

function simulateStudioProgress(callback) {
 const renderArea = document.getElementById('studioRenderArea');
 if (!renderArea) return;
 
 const steps = [
 { label: "Fast Initializing Neural Lattice...", duration: 650 },
 { label: "[Reflection] Mapping stardust noise fields...", duration: 850 },
 { label: " Synthesizing high-frequency details...", duration: 1100 },
 { label: "Max Refinishing HD color textures...", duration: 700 }
 ];
 
 renderArea.innerHTML = `
 <div class="studio-progress-block">
 <div id="step-0" class="studio-progress-step">
 <span class="step-icon">⏳</span>
 <span>${steps[0].label}</span>
 </div>
 <div id="step-1" class="studio-progress-step">
 <span class="step-icon">⏳</span>
 <span>${steps[1].label}</span>
 </div>
 <div id="step-2" class="studio-progress-step">
 <span class="step-icon">⏳</span>
 <span>${steps[2].label}</span>
 </div>
 <div id="step-3" class="studio-progress-step">
 <span class="step-icon">⏳</span>
 <span>${steps[3].label}</span>
 </div>
 </div>
 `;
 
 let currentStep = 0;
 
 function nextStep() {
 if (currentStep > 0) {
 const prevStep = document.getElementById(`step-${currentStep - 1}`);
 if (prevStep) {
 prevStep.className = "studio-progress-step done";
 prevStep.querySelector('.step-icon').innerText = "";
 }
 }
 
 if (currentStep < steps.length) {
 const activeStep = document.getElementById(`step-${currentStep}`);
 if (activeStep) {
 activeStep.className = "studio-progress-step active";
 activeStep.querySelector('.step-icon').innerText = "Fast";
 playSynthSound('click');
 }
 
 setTimeout(() => {
 currentStep++;
 nextStep();
 }, steps[currentStep].duration);
 } else {
 callback();
 }
 }
 
 nextStep();
}

function generateStudioImage() {
 const promptInput = document.getElementById('studioPromptInput');
 if (!promptInput) return;
 
 const promptText = promptInput.value.trim();
 if (!promptText) {
 showToast("️ Please enter a prompt description first!");
 return;
 }
 
 playSynthSound('switch');
 
 const ratioMap = {
 '1:1': { w: 512, h: 512 },
 '16:9': { w: 800, h: 450 },
 '9:16': { w: 450, h: 800 },
 '4:3': { w: 640, h: 480 }
 };
 const dim = ratioMap[state.studioSelectedRatio || '1:1'] || { w: 512, h: 512 };
 const activeModel = state.studioSelectedModel || 'flux';
 const seed = Math.floor(Math.random() * 9999999);
 
 const genBtn = document.getElementById('btnStudioGenerate');
 if (genBtn) {
 genBtn.disabled = true;
 genBtn.innerText = "⏳ Rendering Canvas Masterpiece...";
 }
 
 simulateStudioProgress(() => {
 const encodedPrompt = encodeURIComponent(promptText);
 const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${dim.w}&height=${dim.h}&model=${activeModel}&seed=${seed}&nologo=true`;
 
 const renderArea = document.getElementById('studioRenderArea');
 if (renderArea) {
 renderArea.innerHTML = `
 <div class="studio-canvas-wrapper">
 <img class="studio-render-img" id="studioOutputImage" src="${imageUrl}" alt="${escapeHTML(promptText)}">
 <div class="studio-canvas-actions">
 <button class="btn-studio-action" onclick="window.open('${imageUrl}', '_blank'); playSynthSound('click');">Preview Full HD</button>
 <button class="btn-studio-action" onclick="downloadStudioImage('${imageUrl}');">Download Download</button>
 <button class="btn-studio-action" onclick="sendStudioImageToChat('${imageUrl}', '${escapeJSString(promptText)}');">Chat Send to Chat</button>
 </div>
 </div>
 `;
 
 playSynthSound('receive');
 
 if (genBtn) {
 genBtn.disabled = false;
 genBtn.innerHTML = "<span>Studio Spark Image Generation</span>";
 }
 
 if (!state.studioHistory) state.studioHistory = [];
 state.studioHistory.unshift({
 url: imageUrl,
 prompt: promptText
 });
 saveDataToStorage();
 renderStudioHistory();
 showToast("Studio Masterpiece rendered successfully!");
 }
 });
}

function downloadStudioImage(url) {
 playSynthSound('click');
 const a = document.createElement('a');
 a.href = url;
 a.download = 'Lumina_Art_Creation.jpg';
 a.click();
}

function escapeJSString(str) {
 return str.replace(/'/g, "\\'").replace(/"/g, '\\"');
}

function sendStudioImageToChat(url, prompt) {
 playSynthSound('send');
 
 const activeSession = state.sessions[state.activeSessionId];
 if (!activeSession) return;
 
 const userMsg = {
 sender: 'user',
 text: `[Image Created in Studio] Prompt: ${prompt}\n\n![${prompt}](${url})`,
 timestamp: Date.now()
 };
 activeSession.messages.push(userMsg);
 
 renderMessages();
 showToast("Chat Masterpiece dispatched to conversational thread!");
 
 const indicator = document.getElementById('typingIndicator');
 if (indicator) indicator.classList.remove('hide');
 
 const chatContainer = document.getElementById('chatContainer');
 if (chatContainer) chatContainer.scrollTop = chatContainer.scrollHeight;
 
 setTimeout(() => {
 if (indicator) indicator.classList.add('hide');
 
 const activeBot = PERSONAS[state.activePersona] || PERSONAS['aria'];
 const botResponse = `### บทวิเคราะห์ภาพศิลป์เชิงลึกจาก ${activeBot.name}\n\n` +
 `ฉันได้พิจารณาภาพศิลป์ที่คุณสร้างสรรค์ขึ้นมาใน **Image Studio** จากคำสั่งสร้างภาพ: \`"${prompt}"\`\n\n` +
 `ภาพนี้มีจุดเด่นในเรื่องการควบคุมรายละเอียดและสัดส่วนที่วิจิตรตระการตามากค่ะ การจัดวางองค์ประกอบและการเล่นมิติสีทำให้ภาพนี้ดูพรีเมียมและเปี่ยมไปด้วยอารมณ์ความรู้สึกในแบบฉบับระดับภาพยนตร์ยอดเยี่ยมเลยค่ะ!\n\n` +
 `* **การวิจารณ์ด้านแสงและสี**: การไล่เฉดเงาและแสงสะท้อนในโมเดลที่คุณเลือกสะท้อนความตระหนักรู้อย่างลึกซึ้งของการจัดวางตำแหน่งแสง (Volumetric Lighting)\n` +
 `* **คำแนะนำในการปรับปรุง (Prompt Advice)**: หากต้องการเพิ่มความประณีตยิ่งขึ้นไปอีก ลองเพิ่มโทน \`"hyper-detailed intricate textures, ray-traced shadows"\` ในครั้งถัดไปสิคะ!\n\n` +
 `หากต้องการให้ฉันแต่งบทกวี บรรยายเรื่องราวประกอบภาพ หรือช่วยเขียนคำอธิบายเพิ่มเติมเพื่อนำไปทำตลาด บอกได้เลยนะคะ! Flux`;
 
 const botMsg = {
 sender: 'bot',
 senderBot: state.activePersona,
 text: botResponse,
 timestamp: Date.now()
 };
 activeSession.messages.push(botMsg);
 
 renderMessages();
 playSynthSound('receive');
 }, 2200);
}

function renderStudioHistory() {
 const grid = document.getElementById('studioHistoryGrid');
 if (!grid) return;
 
 if (!state.studioHistory || state.studioHistory.length === 0) {
 grid.innerHTML = `
 <div class="studio-empty-history" style="font-size: 11px; color: var(--text-muted); text-align: center; padding: 12px 0; width: 100%;">
 No images generated in this session.
 </div>
 `;
 return;
 }
 
 grid.innerHTML = '';
 state.studioHistory.forEach(item => {
 const card = document.createElement('div');
 card.className = "studio-history-card";
 card.title = item.prompt;
 card.onclick = () => {
 playSynthSound('click');
 const renderArea = document.getElementById('studioRenderArea');
 if (renderArea) {
 const ngrokBase = (state.ngrokUrl).replace(/\/$/, '');
 fetch(`${ngrokBase}/v1/chat/completions`, {
 method: "POST",
 headers: {
 "Content-Type": "application/json",
 "Authorization": `Bearer ${state.apiKey}`,
 "ngrok-skip-browser-warning": "true",
 "HTTP-Referer": "https://lumina-workspace.org",
 "X-Title": "Lumina Workspace"
 },
 body: JSON.stringify({
 model: state.realModel || 'google/gemini-2.5-flash:free',
 messages: [
 { role: "system", content: systemPrompt },
 { role: "user", content: userPrompt }
 ],
 temperature: 0.3, // Low temperature for precise refactoring edits
 max_tokens: 4096
 }),
 signal: controller.signal
 });
 renderArea.innerHTML = `
 <div class="studio-canvas-wrapper">
 <img class="studio-render-img" id="studioOutputImage" src="${item.url}" alt="${escapeHTML(item.prompt)}">
 <div class="studio-canvas-actions">
 <button class="btn-studio-action" onclick="window.open('${item.url}', '_blank'); playSynthSound('click');">Preview Full HD</button>
 <button class="btn-studio-action" onclick="downloadStudioImage('${item.url}');">Download Download</button>
 <button class="btn-studio-action" onclick="sendStudioImageToChat('${item.url}', '${escapeJSString(item.prompt)}');">Chat Send to Chat</button>
 </div>
 </div>
 `;
 }
 const promptInput = document.getElementById('studioPromptInput');
 if (promptInput) promptInput.value = item.prompt;
 showToast("Studio Creation reloaded from archive!");
 };
 
 card.innerHTML = `<img src="${item.url}" alt="${item.prompt}">`;
 grid.appendChild(card);
 });
}

// 11. LUMINA AI CODE REFINER PIPELINE
function refineSandboxCodeWithAi() {
 const codeDisplay = document.getElementById('sandboxCodeDisplay');
 const instructionInput = document.getElementById('sandboxAiInstruction');
 
 if (!codeDisplay) return;
 const currentCode = codeDisplay.innerText.trim();
 if (!currentCode) {
 showToast("️ There is no source code to refine! Generate a web app first.");
 return;
 }
 
 if (!instructionInput) return;
 const instructionText = instructionInput.value.trim();
 if (!instructionText) {
 showToast("️ Please describe what you want the AI helper to edit.");
 return;
 }
 
 playSynthSound('switch');
 
 const refineBtn = document.getElementById('btnRefineCode');
 const statusArea = document.getElementById('refinerStatusArea');
 const statusText = document.getElementById('refinerStatusText');
 
 if (refineBtn) {
 refineBtn.disabled = true;
 refineBtn.innerText = "Configure Refactoring source layout...";
 }
 if (statusArea) statusArea.classList.remove('hide');
 
 // Step 1: Simulator Progress checks
 simulateRefinerProgress(() => {
 // Complete the edits!
 if (state.apiMode === 'real' && state.apiKey.trim().length > 0) {
 // Real AI mode refactoring
 if (statusText) statusText.innerText = "AI Querying Neural Refiner (OpenRouter)...";
 
 const systemPrompt = "You are Lumina Code Refiner, a supplementary AI code editing agent. " +
 "You specialize in refactoring and modifying HTML/CSS/JS files according to user instructions. " +
 "You will receive the original source code and the editing instruction. Your task is to output the FULL modified HTML code. " +
 "Do NOT wrap it in markdown code blocks. Do NOT include explanations. Output ONLY the raw HTML source code itself.";
 
 const userPrompt = `--- ORIGINAL SOURCE CODE ---\n${currentCode}\n\n` +
 `--- USER INSTRUCTION ---\n${instructionText}\n\n` +
 `Output the raw modified HTML:`;
 
 const controller = new AbortController();
 const timeoutId = setTimeout(() => controller.abort(), 25000); // 25s timeout
 
 fetch((state.ngrokUrl).replace(/\/$/, "") + "/v1/chat/completions", {
 method: "POST",
 headers: {
 "Content-Type": "application/json",
 "Authorization": `Bearer ${state.apiKey}`,
 "HTTP-Referer": "https://lumina-workspace.org",
 "X-Title": "Lumina Workspace"
 },
 body: JSON.stringify({
 model: state.realModel || 'google/gemini-2.5-flash:free',
 messages: [
 { role: "system", content: systemPrompt },
 { role: "user", content: userPrompt }
 ],
 temperature: 0.3, // Low temperature for precise refactoring edits
 max_tokens: 4096
 }),
 signal: controller.signal
 })
 .then(res => {
 clearTimeout(timeoutId);
 if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
 return res.json();
 })
 .then(data => {
 let refinedCode = data.choices[0].message.content.trim();
 
 // Defensive strip of markdown code wrappers if LLM returned them
 if (refinedCode.startsWith("```html")) {
 refinedCode = refinedCode.replace(/^```html\s*/i, "").replace(/\s*```$/i, "");
 } else if (refinedCode.startsWith("```")) {
 refinedCode = refinedCode.replace(/^```\s*/i, "").replace(/\s*```$/i, "");
 }
 
 applyRefinedCode(refinedCode);
 })
 .catch(err => {
 console.error("Lumina Refiner API Error:", err);
 showToast("️ API Call failed. Falling back to local simulator refactor.");
 runSimulatorRefactor(currentCode, instructionText);
 });
 } else {
 // Mode 2: Simulator Mode refactoring
 runSimulatorRefactor(currentCode, instructionText);
 }
 });
}

function simulateRefinerProgress(callback) {
 const statusText = document.getElementById('refinerStatusText');
 const steps = [
 "Analyzing original syntax tree...",
 "Identifying code targets for diff modifications...",
 "Applying structural layout updates..."
 ];
 
 let stepIdx = 0;
 function nextStep() {
 if (stepIdx < steps.length) {
 if (statusText) statusText.innerText = steps[stepIdx];
 playSynthSound('click');
 setTimeout(() => {
 stepIdx++;
 nextStep();
 }, 800 + Math.random() * 400);
 } else {
 callback();
 }
 }
 nextStep();
}

function applyRefinedCode(code) {
 const codeDisplay = document.getElementById('sandboxCodeDisplay');
 const iframe = document.getElementById('sandboxIframe');
 const refineBtn = document.getElementById('btnRefineCode');
 const statusArea = document.getElementById('refinerStatusArea');
 const instructionInput = document.getElementById('sandboxAiInstruction');
 
 if (codeDisplay) codeDisplay.innerText = code;
 if (iframe) iframe.srcdoc = code;
 
 // Clear status
 if (statusArea) statusArea.classList.add('hide');
 if (refineBtn) {
 refineBtn.disabled = false;
 refineBtn.innerHTML = "<span>Configure Edit Code with AI</span>";
 }
 if (instructionInput) instructionInput.value = '';
 
 playSynthSound('receive');
 showToast("Configure Code refactored and hot-reloaded successfully!");
}

function runSimulatorRefactor(currentCode, instruction) {
 let edited = currentCode;
 const query = instruction.toLowerCase();
 
 // Smart Simulator edits based on common triggers
 if (query.includes("color") || query.includes("สี") || query.includes("theme") || query.includes("background") || query.includes("พื้นหลัง")) {
 // Find background styles and colors
 if (query.includes("emerald") || query.includes("เขียว")) {
 edited = edited.replace(/#0f0a1c|#050209|#07050f/gi, "#022c22");
 edited = edited.replace(/#8b5cf6|#ec4899|#f472b6/gi, "#10b981");
 edited = edited.replace(/linear-gradient\(135deg,\s*#ec4899,\s*#a78bfa\)/gi, "linear-gradient(135deg, #10b981, #34d399)");
 edited = edited.replace(/Cosmic Neon/gi, "Emerald Neon");
 } else if (query.includes("violet") || query.includes("ม่วง") || query.includes("purple")) {
 edited = edited.replace(/#0f0a1c|#050209/gi, "#1e1b4b");
 edited = edited.replace(/#ec4899|#8b5cf6/gi, "#c084fc");
 edited = edited.replace(/Cosmic Neon/gi, "Violet Dream");
 } else if (query.includes("dark") || query.includes("ดำ") || query.includes("ดำสนิท")) {
 edited = edited.replace(/#0f0a1c|#050209|#07050f/gi, "#000000");
 edited = edited.replace(/rgba\(255,\s*255,\s*255,\s*0\.03\)/gi, "rgba(255, 255, 255, 0.01)");
 }
 }
 
 // Add lap reset button if requested for stopwatch
 if ((query.includes("lap") || query.includes("รอบ")) && currentCode.includes("resetTimer")) {
 if (!currentCode.includes("recordLap")) {
 // Smart injection of Lap structures
 edited = edited.replace(
 `<button class="btn-reset" onclick="resetTimer()">Reset</button>`,
 `<button class="btn-reset" onclick="resetTimer()">Reset</button>\n <button class="btn-reset" onclick="recordLap()" style="background: rgba(139,92,246,0.15); border-color:#8b5cf6; margin-left: 6px;">Lap</button>`
 );
 
 edited = edited.replace(
 `</div>\n\n <script>`,
 `</div>\n <div id="lapsContainer" style="margin-top: 20px; max-height: 120px; overflow-y: auto; text-align: left; padding: 0 10px; font-size:13px; font-family:'JetBrains Mono'; color:#a78bfa;"></div>\n </div>\n\n <script>`
 );
 
 edited = edited.replace(
 `function resetTimer() {`,
 `let lapCount = 0;\n function recordLap() {\n lapCount++;\n const container = document.getElementById('lapsContainer');\n const lapTime = document.getElementById('display').innerText;\n const item = document.createElement('div');\n item.style.padding = '4px 0';\n item.style.borderBottom = '1px solid rgba(255,255,255,0.05)';\n item.innerText = 'Lap ' + lapCount + ': ' + lapTime;\n container.appendChild(item);\n }\n\n function resetTimer() {\n document.getElementById('lapsContainer').innerHTML = '';\n lapCount = 0;`
 );
 }
 }
 
 // General text replacement if user wants a title/text change
 if (query.includes("เปลี่ยนชื่อ") || query.includes("title") || query.includes("text")) {
 const matches = instruction.match(/["'](.*?)["']/);
 if (matches && matches[1]) {
 edited = edited.replace(/<h2>(.*?)<\/h2>/i, `<h2>${matches[1]}</h2>`);
 edited = edited.replace(/<h1>(.*?)<\/h1>/i, `<h1>${matches[1]}</h1>`);
 }
 }
 
 // Fallback if no smart replacement matched: stream a clean aesthetic visual comment inside the code
 if (edited === currentCode) {
 const timestamp = new Date().toLocaleString();
 edited = edited.replace(
 `</head>`,
 ` <!-- Refined by Lumina AI Code Refiner at ${timestamp} -->\n <!-- User request: ${escapeHTML(instruction)} -->\n</head>`
 );
 }
 
 // Delay slightly to simulate stream processing
 setTimeout(() => {
 applyRefinedCode(edited);
 }, 900);
}

function downloadRefinedCode() {
 const codeDisplay = document.getElementById('sandboxCodeDisplay');
 if (!codeDisplay) return;
 
 const codeText = codeDisplay.innerText.trim();
 if (!codeText) {
 showToast("️ No source code to download!");
 return;
 }
 
 playSynthSound('click');
 const a = document.createElement('a');
 a.href = 'data:text/html;charset=utf-8,' + encodeURIComponent(codeText);
 a.download = 'Lumina_Refined_Artifact.html';
 a.click();
}

function sendRefinedCodeBackToChat() {
 const codeDisplay = document.getElementById('sandboxCodeDisplay');
 if (!codeDisplay) return;
 
 const codeText = codeDisplay.innerText.trim();
 if (!codeText) {
 showToast("️ No source code to export!");
 return;
 }
 
 playSynthSound('send');
 
 const activeSession = state.sessions[state.activeSessionId];
 if (!activeSession) return;
 
 const userMsg = {
 sender: 'user',
 text: `I have refined the source code artifact inside Code Studio! Here is the updated code layout:\n\n\`\`\`html\n${codeText}\n\`\`\``,
 timestamp: Date.now()
 };
 activeSession.messages.push(userMsg);
 
 renderMessages();
 showToast("Chat Source code exported back to chat session!");
 
 const indicator = document.getElementById('typingIndicator');
 if (indicator) indicator.classList.remove('hide');
 
 const chatContainer = document.getElementById('chatContainer');
 if (chatContainer) chatContainer.scrollTop = chatContainer.scrollHeight;
 
 setTimeout(() => {
 if (indicator) indicator.classList.add('hide');
 
 const activeBot = PERSONAS[state.activePersona] || PERSONAS['aria'];
 const botResponse = `### Code บทวิจารณ์ผลงานที่ปรับปรุงแล้วจาก ${activeBot.name}\n\n` +
 `ฉันได้รับการอัปเดตไฟล์ซอร์สโค้ดที่คุณได้นำเข้าไปปรับปรุงร่วมกับ **Lumina Code Refiner** เรียบร้อยแล้วค่ะ!\n\n` +
 `ซอร์สโค้ดรุ่นปรับปรุงนี้ถูกเรียบเรียงและปรับโครงสร้างใหม่ได้อย่างสะอาดและมีระเบียบมากค่ะ มิติสีและการจัดเรียงบล็อกโครงสร้าง UI แสดงความต่อเนื่องและสมดุลเป็นเยี่ยมเลยค่ะ\n\n` +
 `* **การประเมินสถาปัตยกรรม (Architecture Evaluation)**: มาร์กอัป HTML5 สอดประสานร่วมกับ Inline CSS ได้เป็นอย่างดี และระบบการคำนวณใน Script มีความกระชับและปราศจาก Runtime overhead\n` +
 `* **ผลลัพธ์การเรนเดอร์ (Sandbox Preview)**: ผลงานได้รับการคอมไพล์ใน **Sandbox** สำเร็จสมบูรณ์ สามารถทดสอบคลิกเล่นได้สดๆ ในแท็บ Preview Preview ได้ทันทีค่ะ!\n\n` +
 `ต้องการให้ฉันแนะนำการเขียนชุดทดสอบ (Unit tests) หรือขยายโครงร่างขีดความสามารถส่วนใดเพิ่มเติม บอกได้เลยนะคะ! `;
 
 const botMsg = {
 sender: 'bot',
 senderBot: state.activePersona,
 text: botResponse,
 timestamp: Date.now()
 };
 activeSession.messages.push(botMsg);
 
 renderMessages();
 playSynthSound('receive');
 }, 2000);
}

// 12. LUMINA INLINE SANDBOX CONTROLLERS
function switchInlineSandbox(codeId, tabName) {
 playSynthSound('click');
 
 // Toggle active buttons
 const btnPreview = document.getElementById(`btn-inline-preview-${codeId}`);
 const btnCode = document.getElementById(`btn-inline-code-${codeId}`);
 
 if (btnPreview && btnCode) {
 if (tabName === 'preview') {
 btnPreview.classList.add('active');
 btnCode.classList.remove('active');
 } else {
 btnPreview.classList.remove('active');
 btnCode.classList.add('active');
 }
 }
 
 // Toggle visibility
 const previewContent = document.getElementById(`inline-preview-content-${codeId}`);
 const codeContent = document.getElementById(`inline-code-content-${codeId}`);
 
 if (previewContent && codeContent) {
 if (tabName === 'preview') {
 previewContent.classList.remove('hide');
 codeContent.classList.add('hide');
 } else {
 previewContent.classList.add('hide');
 codeContent.classList.remove('hide');
 }
 }
}

function launchFullWorkspaceSandbox(codeId) {
 playSynthSound('switch');
 
 const codeEl = document.getElementById(codeId);
 if (!codeEl) return;
 
 const rawCode = codeEl.innerText.trim();
 
 // Slide open Sandbox side panel and populate preview
 toggleSandbox(true);
 switchSandboxTab('preview');
 
 // Update raw display
 const codeDisplay = document.getElementById('sandboxCodeDisplay');
 if (codeDisplay) codeDisplay.innerText = rawCode;
 
 // Update preview iframe
 const iframe = document.getElementById('sandboxIframe');
 if (iframe) {
 const titleMatch = rawCode.match(/<title>([\s\S]*?)<\/title>/i);
 const title = titleMatch ? titleMatch[1] : "Interactive Web Mockup";
 document.getElementById('sandboxAppTitle').innerText = title;
 
 iframe.srcdoc = rawCode;
 }
 
 showToast("️ Embedded Artifact Projected to Workspace!");
}

// ==========================================================================
// 13. LUMINA MULTI-AGENT ORCHESTRATOR & MYTHOS SFT TRAINER ENGINE
// ==========================================================================

// State initialization defaults
state.pipelineMode = state.pipelineMode || 'basic';
state.trainingLR = state.trainingLR || '2e-4';
state.trainingEpochs = state.trainingEpochs || '3';
state.trainingLoRA = state.trainingLoRA || '16';
state.pipelineGoal = state.pipelineGoal || '';
state.pipelineHistory = state.pipelineHistory || [];

// Active timers/state buffers
let pipelineTimeout = null;
let trainingInterval = null;
let generatedCodeBuffer = "";

function selectPipelinePreset(mode) {
 playSynthSound('switch');
 state.pipelineMode = mode;
 
 // Toggle active card styling
 const presets = ['basic', 'debate', 'reflection', 'mythos'];
 presets.forEach(p => {
 const card = document.getElementById(`preset-${p}`);
 if (card) {
 if (p === mode) {
 card.classList.add('active');
 } else {
 card.classList.remove('active');
 }
 }
 });
 
 // Toggle card visibility
 const hyperparamsCard = document.getElementById('hyperparamsCard');
 const lossGraphCard = document.getElementById('lossGraphCard');
 const nodeGraphContainer = document.getElementById('nodeGraphContainer');
 const goalInput = document.getElementById('pipelineGoalInput');
 
 if (mode === 'mythos') {
 if (hyperparamsCard) hyperparamsCard.classList.remove('hide');
 if (lossGraphCard) lossGraphCard.classList.remove('hide');
 if (nodeGraphContainer) nodeGraphContainer.classList.add('hide');
 if (goalInput) {
 goalInput.placeholder = "Enter fine-tuning target... e.g. 'Train Qwen-2.5 on Low-Level Assembly and ARM64 hooking payload'";
 if (!state.pipelineGoal || state.pipelineGoal.includes("particle") || state.pipelineGoal === "") {
 goalInput.value = "Train Qwen-2.5 Coder to reverse engineer ARM64 assembly instructions and identify buffer overflows";
 }
 }
 } else {
 if (hyperparamsCard) hyperparamsCard.classList.add('hide');
 if (lossGraphCard) lossGraphCard.classList.add('hide');
 if (nodeGraphContainer) nodeGraphContainer.classList.remove('hide');
 if (goalInput) {
 goalInput.placeholder = "Enter target app... e.g. 'Build an optimized 3D particle landscape', 'Create a premium pomodoro clock'";
 if (!state.pipelineGoal || state.pipelineGoal.includes("ARM64") || state.pipelineGoal === "") {
 goalInput.value = "Create a premium, cosmic interactive 3D particle landscape with sound synthesis and glassmorphic control sliders";
 }
 }
 }
 
 // Reset console terminal placeholder
 const consoleEl = document.getElementById('pipelineConsole');
 if (consoleEl) {
 if (mode === 'mythos') {
 consoleEl.innerText = "Mythos Deep Reasoning Training Studio initialized. Set LoRA hyperparameters and click Spark to train.";
 } else {
 consoleEl.innerText = `Lumina Multi-Agent pipeline preset: [${mode.toUpperCase()}] loaded. Enter design goal and click Spark to execute.`;
 }
 }
 
 const exportCard = document.getElementById('pipelineExportCard');
 if (exportCard) exportCard.classList.add('hide');
 
 // Reset status badge
 const badge = document.getElementById('pipelineStatusBadge');
 if (badge) {
 badge.innerText = "IDLE";
 badge.style.color = "#ec4899";
 }
 
 saveDataToStorage();
}

function updateHyperparameter(param, val) {
 playSynthSound('click');
 if (param === 'LR') state.trainingLR = val;
 if (param === 'Epochs') state.trainingEpochs = val;
 if (param === 'LoRA') state.trainingLoRA = val;
 saveDataToStorage();
 showToast(`LoRA Config: ${param} set to ${val}`);
}

async function startPipelineOrTraining() {
 if (pipelineTimeout) clearTimeout(pipelineTimeout);
 if (trainingInterval) clearInterval(trainingInterval);
 
 const goalInput = document.getElementById('pipelineGoalInput');
 if (!goalInput) return;
 
 const goalText = goalInput.value.trim();
 if (!goalText) {
 showToast("️ Please enter a pipeline task or fine-tuning target!");
 return;
 }
 state.pipelineGoal = goalText;
 saveDataToStorage();
 
 const exportCard = document.getElementById('pipelineExportCard');
 if (exportCard) exportCard.classList.add('hide');
 
 const consoleEl = document.getElementById('pipelineConsole');
 if (consoleEl) consoleEl.innerText = "";
 
 for (let i = 0; i <= 10; i++) {
 const node = document.getElementById(`node-${i}`);
 if (node) {
 node.classList.remove('active', 'completed', 'vetoed');
 }
 }
 
 const badge = document.getElementById('pipelineStatusBadge');
 if (badge) {
 badge.innerText = state.pipelineMode === 'mythos' ? "TRAINING" : "RUNNING";
 badge.style.color = "#a78bfa";
 }
 
 playSynthSound('switch');
 
 // Attempt real backend stream first
 try {
 const response = await fetch('/api/run-pipeline', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({
 mode: state.pipelineMode,
 goal: goalText,
 lr: state.trainingLR,
 epochs: state.trainingEpochs,
 lora: state.trainingLoRA
 })
 });

 if (!response.ok) {
 throw new Error(`HTTP ${response.status}`);
 }

 const reader = response.body.getReader();
 const decoder = new TextDecoder('utf-8');
 let buffer = '';

 while (true) {
 const { done, value } = await reader.read();
 if (done) break;
 
 buffer += decoder.decode(value, { stream: true });
 const lines = buffer.split('\n');
 buffer = lines.pop(); // keep last incomplete line in buffer

 for (const line of lines) {
 if (line.startsWith('data: ')) {
 const data = line.slice(6).trim();
 if (data.startsWith('__COMPLETED__:')) {
 const payload = JSON.parse(data.slice(14));
 generatedCodeBuffer = payload.artifact;
 
 // Update active node styling to all completed
 for (let i = 0; i <= 10; i++) {
 const node = document.getElementById(`node-${i}`);
 if (node) {
 node.classList.remove('active', 'vetoed');
 node.classList.add('completed');
 }
 }

 if (badge) {
 badge.innerText = state.pipelineMode === 'mythos' ? "CONVERGED" : "SUCCESS";
 badge.style.color = "#10b981";
 }

 if (exportCard) exportCard.classList.remove('hide');
 playSynthSound('receive');
 showToast(" Real backend execution finished successfully!");
 } else {
 // Extract real-time thinking process <thought>...</thought> if present
 let cleanData = data.replace(/\x1B\[[0-9;]*[a-zA-Z]/g, '');
 const thoughtMatch = cleanData.match(/<thought>([\s\S]*?)<\/thought>/i);
 
 if (thoughtMatch) {
   const activeThought = thoughtMatch[1].trim();
   const thoughtCard = document.getElementById('pipelineThoughtCard');
   const activeThoughtEl = document.getElementById('pipelineActiveThought');
   const thoughtAgentEl = document.getElementById('pipelineThoughtAgent');
   
   if (thoughtCard) thoughtCard.classList.remove('hide');
   if (activeThoughtEl) activeThoughtEl.innerText = activeThought;
   
   // Dynamically identify the agent speaking from log data
   let activeAgent = "COGNITIVE CORE";
   if (cleanData.includes("Ingestor")) activeAgent = "INGESTOR [THE READER]";
   else if (cleanData.includes("Intent")) activeAgent = "INTENT ANALYST";
   else if (cleanData.includes("Compliance")) activeAgent = "COMPLIANCE CHECKER";
   else if (cleanData.includes("Brainstormer")) activeAgent = "BRAINSTORMER";
   else if (cleanData.includes("Proposer")) activeAgent = "PROPOSER [THE EXECUTOR]";
   else if (cleanData.includes("Memory")) activeAgent = "MEMORY KEEPER";
   else if (cleanData.includes("Proxy")) activeAgent = "USER PROXY [DEVIL'S ADVOCATE]";
   else if (cleanData.includes("QA")) activeAgent = "QA TESTER [BUG INSPECTOR]";
   else if (cleanData.includes("Formatter")) activeAgent = "FORMATTER [STYLING MUSE]";
   else if (cleanData.includes("Security")) activeAgent = "SECURITY GUARD";
   else if (cleanData.includes("Supreme")) activeAgent = "LOOP CONTROLLER [SUPREME JUDGE]";
   
   if (thoughtAgentEl) thoughtAgentEl.innerText = activeAgent;
   
   // Strip thought tags from data printed to console
   cleanData = cleanData.replace(/<thought>[\s\S]*?<\/thought>/gi, '').trim();
 }
 
 // Regular log line. Print directly to console terminal.
 if (consoleEl && cleanData.length > 0) {
 consoleEl.innerText += cleanData + '\n';
 consoleEl.scrollTop = consoleEl.scrollHeight;
 }

 // Animate visual nodes in real-time based on agent name triggers!
 if (state.pipelineMode !== 'mythos') {
 const nodeTriggers = {
 "Ingestor": 0, "Intent": 1, "Compliance": 2, "Brainstormer": 3,
 "Proposer": 4, "Memory": 5, "Proxy": 6, "QA": 7, "Formatter": 8,
 "Security": 9, "Supreme": 10
 };
 for (const [key, idx] of Object.entries(nodeTriggers)) {
 if (data.includes(key)) {
 for (let i = 0; i <= 10; i++) {
 const node = document.getElementById(`node-${i}`);
 if (node) {
 if (i === idx) {
 node.classList.remove('completed', 'vetoed');
 node.classList.add('active');
 } else if (node.classList.contains('active')) {
 node.classList.remove('active');
 node.classList.add('completed');
 }
 }
 }
 if (data.includes("WARNING") || data.includes("VETO")) {
 const qaNode = document.getElementById('node-7');
 if (qaNode) qaNode.classList.add('vetoed');
 const executorNode = document.getElementById('node-4');
 if (executorNode) executorNode.classList.add('vetoed');
 }
 }
 }
 } else {
 // Update Mythos stats
 const iterMatch = data.match(/Iter\s*(\d+\/\d+)/i);
 if (iterMatch && document.getElementById('sftIters')) {
 document.getElementById('sftIters').innerText = iterMatch[1];
 }
 const lossMatch = data.match(/Loss:\s*([\d\.]+)/i);
 if (lossMatch && document.getElementById('sftLossVal')) {
 document.getElementById('sftLossVal').innerText = parseFloat(lossMatch[1]).toFixed(4);
 }
 const speedMatch = data.match(/Speed:\s*([\d\.]+)/i);
 if (speedMatch && document.getElementById('sftSpeed')) {
 document.getElementById('sftSpeed').innerText = parseFloat(speedMatch[1]).toFixed(1) + ' tokens/s';
 }
 }
 }
 }
 }
 }
 } catch (error) {
 console.warn("Backend API not reachable. Falling back to local simulator.", error);
 if (badge) {
 badge.innerText = "RUNNING";
 badge.style.color = "#a78bfa";
 }
 if (state.pipelineMode === 'mythos') {
 runMythosTrainingSimulation(goalText);
 } else {
 runAgentPipelineSimulation(goalText);
 }
 }
}


function runAgentPipelineSimulation(goal) {
 const consoleEl = document.getElementById('pipelineConsole');
 const badge = document.getElementById('pipelineStatusBadge');
 
 if (badge) {
 badge.innerText = "RUNNING";
 badge.style.color = "#a78bfa";
 }
 
 playSynthSound('switch');
 
 const log = (text, type = 'info') => {
 const d = new Date();
 const stamp = `[${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}]`;
 let prefix = "Storm ";
 if (type === 'error') prefix = " [VETO] ";
 if (type === 'success') prefix = " [SUCCESS] ";
 if (type === 'sys') prefix = "Fast [SYSTEM] ";
 
 consoleEl.innerText += `${stamp} ${prefix}${text}\n`;
 consoleEl.scrollTop = consoleEl.scrollHeight;
 };
 
 log(`Initializing 9-Agent Aesthetic & Logic Veto Loop Preset: [${state.pipelineMode.toUpperCase()}]`, 'sys');
 log(`Pipeline Goal: "${goal}"`, 'sys');
 log(`Allocating CrewAI / LangGraph dynamic states for 9 specialized aesthetic agents...`, 'sys');
 
 let steps = [];
 if (state.pipelineMode === 'basic') {
 steps = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
 } else if (state.pipelineMode === 'debate') {
 steps = [0, 1, 2, 3, 4, 5, 6, 7, 6, 7, 8, 9];
 } else {
 // Reflection mode triggers the full 9-Agent Aesthetic & Logic feedback loops!
 steps = [0, 1, 2, 3, 4, 5, 6, 7, 6, 4, 5, 6, 7, 8, 9, 10];
 }
 
 let stepIndex = 0;
 let vetoTriggered = false;
 
 function runNextStep() {
 if (stepIndex >= steps.length) {
 log(`9-Agent NodeGraph compilation finished successfully! 100% evaluated.`, 'success');
 
 for (let i = 0; i <= 10; i++) {
 const node = document.getElementById(`node-${i}`);
 if (node && steps.includes(i)) {
 node.classList.remove('active', 'vetoed');
 node.classList.add('completed');
 }
 }
 
 if (badge) {
 badge.innerText = "SUCCESS";
 badge.style.color = "#10b981";
 }
 
 const exportCard = document.getElementById('pipelineExportCard');
 if (exportCard) exportCard.classList.remove('hide');
 
 generateMockupCode(goal);
 
 playSynthSound('receive');
 showToast(" 9-Agent Pipeline compiled! Visual Webapp, CSS shadows & sound active.");
 return;
 }
 
 const activeNodeId = steps[stepIndex];
 
 for (let i = 0; i <= 10; i++) {
 const node = document.getElementById(`node-${i}`);
 if (node) {
 if (i === activeNodeId) {
 node.classList.remove('completed', 'vetoed');
 node.classList.add('active');
 } else if (node.classList.contains('active')) {
 node.classList.remove('active');
 node.classList.add('completed');
 }
 }
 }
 
 const nodeTriggers = {
 "Ingestor": 0, "Analyst": 1, "Engineer": 2, "Critic": 3,
 "Researcher": 4, "Optimizer": 5, "Security": 6, "UX": 7, "CSS": 8,
 "Synthesizer": 9, "Supreme": 10
 };
 
 const dialogueMap = {
 0: "Ingestor [THE READER]: Scanning workspace constraints. Fetching local resources. Prompt parsed successfully.",
 1: "Analyst [DEEP ANALYZER]: Deeply analyzing problem structure and context.",
 2: "Engineer [TECH VALIDATOR]: Performing technical deep-dive and code verification.",
 3: "Critic & Defender [ADVERSARIAL LOOP]: Adversarial critique and improvement loop.",
 4: "Researcher [KNOWLEDGE SCOUT]: Querying knowledge databases and pulling evidence.",
 5: "Optimizer [PERFORMANCE TUNER]: Tuning time/space complexity and layout execution.",
 6: "Security Auditor [VULNERABILITY SCANNER]: Inspecting scripts for attack vectors and compliance.",
 7: "UX Designer [AESTHETIC JUDGE]: Evaluating layout typography, scale, and responsive ergonomics.",
 8: "CSS Art Director [THE GLASSMORPHIST]: Decorating HTML files. Applying glassmorphism tokens, CSS flex layouts, and custom Google Fonts integrations.",
 9: "Synthesizer [FINAL ARBITER]: Consolidating best outputs and compiling final answer.",
 10: "Loop Controller [SUPREME JUDGE]: Checking final state criteria. Code matches specifications. Approving deployment!"
 };

 // Detailed thought patterns for each of the 9 debate agents
 const thoughtMap = {
 0: {
   agent: "Ingestor [THE READER]",
   thought: "Analyzing the prompt structure. Target is 'สร้างเว็ปเเต่งสีสวยๆ มีอนิเมชั่น เงา เเสงสี ฟอน'. Extracting design assets and checking base sandbox libraries."
 },
 1: {
   agent: "Analyst [DEEP ANALYZER]",
   thought: "User wants absolute visual beauty. This means importing Google Fonts ('Outfit' & 'Prompt'), applying backdrop filters for high-end Glassmorphism, and introducing Web Audio synth oscillators."
 },
 2: {
   agent: "Engineer [TECH VALIDATOR]",
   thought: "Validating logical and technical safety constraints inside Lumina Sandbox environment. Sandbox allows scripts and styling. Checking security vectors. Conforms completely."
 },
 3: {
   agent: "Critic & Defender [ADVERSARIAL LOOP]",
   thought: "Proposing neon dark-mode radial gradients (#150f30 to #050209) paired with floating light-emission ambient blobs. This creates extreme depth and high-end futuristic feel."
 },
 4: {
   agent: "Researcher [KNOWLEDGE SCOUT]",
   thought: "Drafting structural components. Declaring CSS custom properties for purple, pink, emerald, and blue accents. Injecting canvas particle physics nodes with Web Audio synthesizer integration."
 },
 5: {
   agent: "Optimizer [PERFORMANCE TUNER]",
   thought: "Monitoring memory variables. Active attached files: 0. Available context limit: 1M tokens. Storing sandbox state. Memory parameters nominal."
 },
 6: {
   agent: "Security Auditor [VULNERABILITY SCANNER]",
   thought: "Analyzing visual parameters... ERROR DETECTED! The contrast ratio of the background grid is too low. The buttons look slightly standard. Initiating VETO warning: 'The design is not beautiful enough! We need richer shadows and dynamic scale animations on hover!'"
 },
 7: {
   agent: "UX Designer [AESTHETIC JUDGE]",
   thought: "Analyzing DOM and compiling syntax checks. Evaluating responsiveness on viewport resize event loop. Alert: canvas lag detected due to redundant draw requests. Rollback triggered."
 },
 8: {
   agent: "CSS Art Director [THE GLASSMORPHIST]",
   thought: "Redesigning with pristine styling. Injecting premium glassmorphism: background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); backdrop-filter: blur(20px);. Adding glowing shadows: box-shadow: 0 15px 35px rgba(0,0,0,0.3), 0 0 15px rgba(139,92,246,0.15)."
 },
 9: {
   agent: "Synthesizer [FINAL ARBITER]",
   thought: "Injecting font family 'Outfit' & 'Prompt' from Google Fonts namespaces. Setting up smooth bezier-curve transitions transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); for scale and translateY transitions on hover."
 },
 10: {
   agent: "Supreme Judge [LOOP CONTROLLER]",
   thought: "Analyzing final refactored code. The design is now STUNNING and visually perfect! Colors are harmonious, micro-animations are smooth, and acoustic waves are integrated. Proceeding to deploy live artifact."
 }
 };
 
 // Visual Veto rollback simulation loop for reflection/debate presets!
 if ((state.pipelineMode === 'reflection' || state.pipelineMode === 'debate') && !vetoTriggered && stepIndex === 7) {
 vetoTriggered = true;
 playSynthSound('switch');
 
 const qaNode = document.getElementById('node-7');
 if (qaNode) {
 qaNode.classList.remove('active', 'completed');
 qaNode.classList.add('vetoed');
 }
 const executorNode = document.getElementById('node-4');
 if (executorNode) {
 executorNode.classList.remove('active', 'completed');
 executorNode.classList.add('vetoed');
 }
 
 const thoughtCard = document.getElementById('pipelineThoughtCard');
 const activeThoughtEl = document.getElementById('pipelineActiveThought');
 const thoughtAgentEl = document.getElementById('pipelineThoughtAgent');
 
 if (thoughtCard) {
   thoughtCard.classList.remove('hide');
   thoughtCard.style.background = "rgba(239, 68, 68, 0.05)";
   thoughtCard.style.borderColor = "rgba(239, 68, 68, 0.4)";
 }
 if (activeThoughtEl) activeThoughtEl.innerHTML = "⚠️ <b>[VETO WARNING] User Proxy / QA Agent:</b> \"หน้าเว็บยังสวยงามไม่พอ! สีสันขาดความลึก แอนิเมชันปุ่มกดดูแข็งเกินไป และเงาขาดแสงนีออนสะท้อน! กำลังทำการสั่งถอยกระบวนการ (Rollback) เพื่อให้ทีมดีไซเนอร์และฟอนต์เขียนโค้ดจัดระเบียบใหม่ทั้งหมด!\"";
 if (thoughtAgentEl) thoughtAgentEl.innerText = "USER PROXY [DEVIL'S ADVOCATE]";

 log(`QA & User Proxy have detected visual design limitations!`, 'error');
 log(`[CRITICAL WARNING] Design lack premium highlights. Shadow contrast parameter is weak.`, 'error');
 log(`[VETO TRIGGERED] Supreme Judge has ordered an immediate ROLLBACK to Proposer/CSS Art Director for visual refinement.`, 'error');
 
 if (state.pipelineMode === 'reflection') {
 stepIndex = 9;
 } else {
 stepIndex = 8;
 }
 
 pipelineTimeout = setTimeout(runNextStep, 3500);
 return;
 }
 
 // Update active thought card in real-time
 const curThought = thoughtMap[activeNodeId];
 if (curThought) {
   const thoughtCard = document.getElementById('pipelineThoughtCard');
   const activeThoughtEl = document.getElementById('pipelineActiveThought');
   const thoughtAgentEl = document.getElementById('pipelineThoughtAgent');
   
   if (thoughtCard) {
     thoughtCard.classList.remove('hide');
     thoughtCard.style.background = "rgba(139, 92, 246, 0.04)";
     thoughtCard.style.borderColor = "rgba(139, 92, 246, 0.25)";
   }
   if (activeThoughtEl) activeThoughtEl.innerText = curThought.thought;
   if (thoughtAgentEl) thoughtAgentEl.innerText = curThought.agent;
 }

 log(dialogueMap[activeNodeId] || `Agent ${activeNodeId} processing...`);
 playSynthSound('click');
 
 stepIndex++;
 const delay = 1400 + Math.random() * 600;
 pipelineTimeout = setTimeout(runNextStep, delay);
 }
 
 pipelineTimeout = setTimeout(runNextStep, 800);
}

function runMythosTrainingSimulation(goal) {
 const consoleEl = document.getElementById('pipelineConsole');
 const badge = document.getElementById('pipelineStatusBadge');
 
 if (badge) {
 badge.innerText = "TRAINING";
 badge.style.color = "#ec4899";
 }
 
 playSynthSound('switch');
 
 const log = (text) => {
 consoleEl.innerText += `${text}\n`;
 consoleEl.scrollTop = consoleEl.scrollHeight;
 };
 
 log(`Fast Starting Mythos Deep Reasoning SFT Fine-Tuning Pipeline`);
 log(`------------------------------------------------------------`);
 log(`Target objective: "${goal}"`);
 log(`Selected Hyperparameters:`);
 log(` - Learning Rate: ${state.trainingLR}`);
 log(` - Epochs: ${state.trainingEpochs}`);
 log(` - LoRA Rank (r): ${state.trainingLoRA}`);
 log(` - LoRA Alpha (a): ${state.trainingLoRA * 2}`);
 log(` - Base Model: Qwen 2.5 Coder 7B (Unsloth optimization enabled)`);
 log(`------------------------------------------------------------`);
 log(`Loading base weights in 4-bit quantization... Done.`);
 log(`Configuring target modules: q_proj, k_proj, v_proj, o_proj... Done.`);
 
 let totalEpochs = parseInt(state.trainingEpochs);
 let totalIters = totalEpochs * 20;
 let currentIter = 0;
 
 const barCount = 6;
 for (let i = 0; i < barCount; i++) {
 const bar = document.getElementById(`loss-bar-${i}`);
 if (bar) {
 bar.style.height = "100%";
 bar.style.background = "linear-gradient(0deg, var(--accent-color), #ec4899)";
 }
 }
 
 const sftItersEl = document.getElementById('sftIters');
 const sftLossValEl = document.getElementById('sftLossVal');
 const sftSpeedEl = document.getElementById('sftSpeed');
 
 let currentLoss = 1.450;
 
 trainingInterval = setInterval(() => {
 if (currentIter >= totalIters) {
 clearInterval(trainingInterval);
 trainingInterval = null;
 
 log(`\n============================================================`);
 log(`Success MYTHOS FINE-TUNING PIPELINE CONVERGED SUCCESSFULLY!`);
 log(`============================================================`);
 log(`Epochs completed: ${state.trainingEpochs} / ${state.trainingEpochs}`);
 log(`Final convergence loss: ${currentLoss.toFixed(4)}`);
 log(`Saving LoRA adapter weights in safetensors... Done.`);
 log(`Merging adapter weights with base model... Done.`);
 log(`System model successfully re-aligned via Direct Preference Optimization (DPO).`);
 log(`Status: Ready for inference deployment!`);
 
 if (badge) {
 badge.innerText = "CONVERGED";
 badge.style.color = "#10b981";
 }
 
 const exportCard = document.getElementById('pipelineExportCard');
 if (exportCard) exportCard.classList.remove('hide');
 
 generateMythosReportCode(goal, currentLoss);
 
 playSynthSound('receive');
 showToast("Mythos model fine-tuned and converged successfully!");
 return;
 }
 
 currentIter++;
 
 const decayRate = 0.92 - (Math.random() * 0.03);
 currentLoss = currentLoss * decayRate;
 if (currentLoss < 0.035) currentLoss = 0.035 + (Math.random() * 0.01);
 
 const speed = (2800 + Math.random() * 600).toFixed(1);
 
 if (sftItersEl) sftItersEl.innerText = `${currentIter} / ${totalIters}`;
 if (sftLossValEl) sftLossValEl.innerText = currentLoss.toFixed(4);
 if (sftSpeedEl) sftSpeedEl.innerText = `${speed} tokens/s`;
 
 const activeBarIdx = Math.min(Math.floor((currentIter / totalIters) * barCount), barCount - 1);
 for (let i = 0; i <= activeBarIdx; i++) {
 const bar = document.getElementById(`loss-bar-${i}`);
 if (bar) {
 const stepPercent = (1 - (i / barCount)) * 80 + 10;
 const barHeight = Math.max(stepPercent * (currentLoss / 1.45), 5);
 bar.style.height = `${barHeight}%`;
 if (i === activeBarIdx) {
 bar.style.background = "#ec4899";
 } else {
 bar.style.background = "#10b981";
 }
 bar.title = `Bar ${i} Loss: ${currentLoss.toFixed(3)}`;
 }
 }
 
 const epoch = Math.ceil((currentIter / totalIters) * totalEpochs);
 const thoughts = [
 `<thought> Analyzing low-level instructions. Identifying ARM64 buffer mismatch patterns. </thought> Epoch ${epoch} | Iter ${currentIter} | Loss: ${currentLoss.toFixed(4)} | speed: ${speed} t/s`,
 `<thought> Checking tc/iptables network filtering hooks. Standard rules are secure. </thought> Epoch ${epoch} | Iter ${currentIter} | Loss: ${currentLoss.toFixed(4)} | speed: ${speed} t/s`,
 `<thought> Optimization step. Compiling system hooks for maximum speed. Refactoring. </thought> Epoch ${epoch} | Iter ${currentIter} | Loss: ${currentLoss.toFixed(4)} | speed: ${speed} t/s`,
 `<thought> Running DPO validation alignment checks. Eliminating bad compilation traces. </thought> Epoch ${epoch} | Iter ${currentIter} | Loss: ${currentLoss.toFixed(4)} | speed: ${speed} t/s`
 ];
 
 const randomThought = thoughts[Math.floor(Math.random() * thoughts.length)];
 log(randomThought);
 
 playSynthSound('click');
 }, 600);
}

function generateMockupCode(goal) {
 const isARM = goal.toLowerCase().includes("arm") || goal.toLowerCase().includes("assembly") || goal.toLowerCase().includes("hook");
 let htmlContent = "";
 if (isARM) {
 htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
 <meta charset="UTF-8">
 <meta name="viewport" content="width=device-width, initial-scale=1.0">
 <title>Lumina ARM64 Reverse Engineering Debugger Dashboard</title>
 <style>
 :root {
 --bg-color: #07050f;
 --accent-color: #a78bfa;
 --accent-glow: rgba(167, 139, 250, 0.35);
 --card-bg: rgba(255, 255, 255, 0.03);
 --border-color: rgba(255, 255, 255, 0.08);
 --text-color: #e2e8f0;
 --text-muted: #94a3b8;
 --success-color: #10b981;
 --warn-color: #ec4899;
 }
 * {
 box-sizing: border-box;
 margin: 0;
 padding: 0;
 }
 body {
 background-color: var(--bg-color);
 color: var(--text-color);
 font-family: 'Segoe UI', -apple-system, sans-serif;
 height: 100vh;
 display: flex;
 flex-direction: column;
 overflow: hidden;
 }
 header {
 padding: 16px 24px;
 border-bottom: 1px solid var(--border-color);
 background: rgba(0, 0, 0, 0.3);
 display: flex;
 justify-content: space-between;
 align-items: center;
 }
 .header-title {
 display: flex;
 align-items: center;
 gap: 12px;
 }
 .header-title h1 {
 font-size: 16px;
 font-weight: 800;
 letter-spacing: 1px;
 text-transform: uppercase;
 background: linear-gradient(135deg, var(--accent-color), #ec4899);
 -webkit-background-clip: text;
 -webkit-text-fill-color: transparent;
 }
 .status-badge {
 background: rgba(16, 185, 129, 0.15);
 color: var(--success-color);
 border: 1px solid rgba(16, 185, 129, 0.3);
 font-size: 10px;
 font-weight: 700;
 padding: 2px 8px;
 border-radius: 4px;
 text-transform: uppercase;
 }
 .dashboard-container {
 display: grid;
 grid-template-columns: 1.2fr 1fr;
 flex-grow: 1;
 height: calc(100vh - 65px);
 overflow: hidden;
 }
 .pane {
 display: flex;
 flex-direction: column;
 border-right: 1px solid var(--border-color);
 overflow: hidden;
 }
 .pane-header {
 padding: 12px 20px;
 background: rgba(0,0,0,0.15);
 border-bottom: 1px solid var(--border-color);
 display: flex;
 justify-content: space-between;
 align-items: center;
 font-size: 12px;
 font-weight: 700;
 text-transform: uppercase;
 letter-spacing: 0.5px;
 color: var(--text-muted);
 }
 .source-editor {
 flex-grow: 1;
 padding: 20px;
 background: #030107;
 font-family: 'Consolas', 'Monaco', monospace;
 font-size: 13px;
 line-height: 1.6;
 color: #d8b4fe;
 overflow-y: auto;
 white-space: pre;
 }
 .assembly-line {
 display: flex;
 gap: 16px;
 border-radius: 3px;
 padding: 2px 8px;
 transition: background 0.2s;
 cursor: pointer;
 }
 .assembly-line:hover {
 background: rgba(255, 255, 255, 0.05);
 }
 .assembly-line.active {
 background: rgba(167, 139, 250, 0.15);
 border-left: 3px solid var(--accent-color);
 }
 .line-num {
 color: rgba(255, 255, 255, 0.2);
 width: 30px;
 text-align: right;
 user-select: none;
 }
 .line-addr {
 color: var(--text-muted);
 width: 80px;
 }
 .line-op {
 color: #f472b6;
 width: 80px;
 font-weight: bold;
 }
 .line-args {
 color: #e2e8f0;
 }
 .right-column {
 display: flex;
 flex-direction: column;
 overflow-y: auto;
 background: rgba(13, 11, 26, 0.2);
 }
 .widget-card {
 background: var(--card-bg);
 border: 1px solid var(--border-color);
 border-radius: 8px;
 margin: 16px;
 padding: 16px;
 display: flex;
 flex-direction: column;
 gap: 12px;
 }
 .widget-title {
 font-size: 11px;
 font-weight: 800;
 color: var(--accent-color);
 text-transform: uppercase;
 letter-spacing: 1px;
 border-bottom: 1px solid var(--border-color);
 padding-bottom: 6px;
 }
 .registers-grid {
 display: grid;
 grid-template-columns: repeat(2, 1fr);
 gap: 8px;
 }
 .register-item {
 background: rgba(0,0,0,0.25);
 border: 1px solid var(--border-color);
 padding: 6px 10px;
 border-radius: 4px;
 font-family: monospace;
 font-size: 12px;
 display: flex;
 justify-content: space-between;
 }
 .reg-name {
 color: var(--accent-color);
 font-weight: bold;
 }
 .reg-val {
 color: var(--text-color);
 }
 .terminal-block {
 background: #000;
 border: 1px solid rgba(255,255,255,0.05);
 border-radius: 6px;
 padding: 10px;
 font-family: monospace;
 font-size: 11.5px;
 height: 150px;
 overflow-y: auto;
 color: var(--success-color);
 line-height: 1.4;
 }
 .btn-action {
 background: linear-gradient(135deg, var(--accent-color), #ec4899);
 border: none;
 color: #000;
 font-weight: bold;
 padding: 10px;
 border-radius: 6px;
 cursor: pointer;
 text-align: center;
 font-size: 13px;
 transition: 0.2s;
 text-transform: uppercase;
 letter-spacing: 0.5px;
 }
 .btn-action:hover {
 box-shadow: 0 0 15px var(--accent-glow);
 transform: translateY(-1px);
 }
 </style>
</head>
<body>
 <header>
 <div class="header-title">
 <h1>Lumina ARM64 Reverse-Engineering Emulation Studio</h1>
 <span class="status-badge">Simulator Online</span>
 </div>
 <div style="font-size: 11px; color: var(--text-muted);">Memory Guard V1.4 Active</div>
 </header>
 <div class="dashboard-container">
 <div class="pane">
 <div class="pane-header">
 <span>ARM64 Disassembly Inspector</span>
 <span style="color: var(--accent-color);">Target: reverse_payload.bin</span>
 </div>
 <div class="source-editor" id="disassemblyInspector">
 <div class="assembly-line active" onclick="highlightLine(0)">
 <span class="line-num">1</span>
 <span class="line-addr">0x100003f00</span>
 <span class="line-op">sub</span>
 <span class="line-args">sp, sp, #0x20</span>
 </div>
 <div class="assembly-line" onclick="highlightLine(1)">
 <span class="line-num">2</span>
 <span class="line-addr">0x100003f04</span>
 <span class="line-op">stp</span>
 <span class="line-args">x29, x30, [sp, #16]</span>
 </div>
 <div class="assembly-line" onclick="highlightLine(2)">
 <span class="line-num">3</span>
 <span class="line-addr">0x100003f08</span>
 <span class="line-op">add</span>
 <span class="line-args">x29, sp, #16</span>
 </div>
 <div class="assembly-line" onclick="highlightLine(3)">
 <span class="line-num">4</span>
 <span class="line-addr">0x100003f0c</span>
 <span class="line-op">mov</span>
 <span class="line-args">x0, #0x42</span>
 </div>
 <div class="assembly-line" onclick="highlightLine(4)">
 <span class="line-num">5</span>
 <span class="line-addr">0x100003f10</span>
 <span class="line-op">str</span>
 <span class="line-args">x0, [sp, #8]</span>
 </div>
 <div class="assembly-line" onclick="highlightLine(5)">
 <span class="line-num">6</span>
 <span class="line-addr">0x100003f14</span>
 <span class="line-op">ldr</span>
 <span class="line-args">x1, [sp, #8]</span>
 </div>
 <div class="assembly-line" onclick="highlightLine(6)">
 <span class="line-num">7</span>
 <span class="line-addr">0x100003f18</span>
 <span class="line-op">cmp</span>
 <span class="line-args">x1, #0x42</span>
 </div>
 <div class="assembly-line" onclick="highlightLine(7)">
 <span class="line-num">8</span>
 <span class="line-addr">0x100003f1c</span>
 <span class="line-op">b.ne</span>
 <span class="line-args">0x100003f2c</span>
 </div>
 <div class="assembly-line" onclick="highlightLine(8)">
 <span class="line-num">9</span>
 <span class="line-addr">0x100003f20</span>
 <span class="line-op">adrp</span>
 <span class="line-args">x0, 0x100004000</span>
 </div>
 <div class="assembly-line" onclick="highlightLine(9)">
 <span class="line-num">10</span>
 <span class="line-addr">0x100003f24</span>
 <span class="line-op">add</span>
 <span class="line-args">x0, x0, #0x120</span>
 </div>
 <div class="assembly-line" onclick="highlightLine(10)">
 <span class="line-num">11</span>
 <span class="line-addr">0x100003f28</span>
 <span class="line-op">bl</span>
 <span class="line-args">0x100003fb0 ; hook_payload</span>
 </div>
 <div class="assembly-line" onclick="highlightLine(11)">
 <span class="line-num">12</span>
 <span class="line-addr">0x100003f2c</span>
 <span class="line-op">ldp</span>
 <span class="line-args">x29, x30, [sp, #16]</span>
 </div>
 <div class="assembly-line" onclick="highlightLine(12)">
 <span class="line-num">13</span>
 <span class="line-addr">0x100003f30</span>
 <span class="line-op">add</span>
 <span class="line-args">sp, sp, #0x20</span>
 </div>
 <div class="assembly-line" onclick="highlightLine(13)">
 <span class="line-num">14</span>
 <span class="line-addr">0x100003f34</span>
 <span class="line-op">ret</span>
 <span class="line-args"></span>
 </div>
 </div>
 </div>
 
 <div class="right-column">
 <div class="widget-card">
 <span class="widget-title">ARM64 Core Registers Visualizer</span>
 <div class="registers-grid">
 <div class="register-item"><span class="reg-name">X0</span><span class="reg-val" id="reg-X0">0x0000000000000042</span></div>
 <div class="register-item"><span class="reg-name">X1</span><span class="reg-val" id="reg-X1">0x0000000000000042</span></div>
 <div class="register-item"><span class="reg-name">X2</span><span class="reg-val">0x000000010c74f510</span></div>
 <div class="register-item"><span class="reg-name">X29 (FP)</span><span class="reg-val" id="reg-FP">0x0000007ffe812c30</span></div>
 <div class="register-item"><span class="reg-name">X30 (LR)</span><span class="reg-val">0x0000000100003f5c</span></div>
 <div class="register-item"><span class="reg-name">SP</span><span class="reg-val" id="reg-SP">0x0000007ffe812c10</span></div>
 <div class="register-item"><span class="reg-name">PC</span><span class="reg-val" id="reg-PC">0x0000000100003f00</span></div>
 <div class="register-item"><span class="reg-name">CPSR</span><span class="reg-val" id="reg-CPSR">0x60000000 (NZCV)</span></div>
 </div>
 </div>
 
 <div class="widget-card">
 <span class="widget-title">Emulator Log Terminal</span>
 <div class="terminal-block" id="emuConsole">Lumina ARM64 Emulator V1.0 initialized. Ready for execution trace.</div>
 </div>
 
 <div class="widget-card" style="background: transparent; border: none; margin-top: 0;">
 <button class="btn-action" onclick="stepEmulator()">Step Instructions Configure</button>
 </div>
 </div>
 </div>

 <script>
 let currentLine = 0;
 const registersData = [
 { PC: "0x100003f00", SP: "0x0000007ffe812c10", FP: "0x0000000000000000", X0: "0x0000000000000000", X1: "0x0000000000000000", log: "Subtracted 32 bytes from stack pointer (sp) to create local stack frame." },
 { PC: "0x100003f04", SP: "0x0000007ffe812c10", FP: "0x0000000000000000", X0: "0x0000000000000000", X1: "0x0000000000000000", log: "Stored Frame Pointer (x29) and Link Register (x30) at stack offset 16." },
 { PC: "0x100003f08", SP: "0x0000007ffe812c10", FP: "0x0000007ffe812c20", X0: "0x0000000000000000", X1: "0x0000000000000000", log: "Established Frame Pointer (x29) at stack pointer offset 16." },
 { PC: "0x100003f0c", SP: "0x0000007ffe812c10", FP: "0x0000007ffe812c20", X0: "0x0000000000000042", X1: "0x0000000000000000", log: "Moved literal 0x42 into register x0 (Standard register write)." },
 { PC: "0x100003f10", SP: "0x0000007ffe812c10", FP: "0x0000007ffe812c20", X0: "0x0000000000000042", X1: "0x0000000000000000", log: "Stored register x0 (0x42) at stack offset 8." },
 { PC: "0x100003f14", SP: "0x0000007ffe812c10", FP: "0x0000007ffe812c20", X0: "0x0000000000000042", X1: "0x0000000000000042", log: "Loaded value from stack offset 8 into register x1." },
 { PC: "0x100003f18", SP: "0x0000007ffe812c10", FP: "0x0000007ffe812c20", X0: "0x0000000000000042", X1: "0x0000000000000042", log: "Compared X1 (0x42) with literal 0x42 (Result zero flag Z=1)." },
 { PC: "0x100003f1c", SP: "0x0000007ffe812c10", FP: "0x0000007ffe812c20", X0: "0x0000000000000042", X1: "0x0000000000000042", log: "B.NE conditional jump check skipped (Z=1, registers equal)." },
 { PC: "0x100003f20", SP: "0x0000007ffe812c10", FP: "0x0000007ffe812c20", X0: "0x100004000", X1: "0x0000000000000042", log: "Loaded base page address offset for string pointer." },
 { PC: "0x100003f24", SP: "0x0000007ffe812c10", FP: "0x0000007ffe812c20", X0: "0x100004120", X1: "0x0000000000000042", log: "Calculated argument pointer address in X0: 0x100004120." },
 { PC: "0x100003f28", SP: "0x0000007ffe812c10", FP: "0x0000007ffe812c20", X0: "0x100004120", X1: "0x0000000000000042", log: "[CRITICAL HOOK] Branch link BL invoked hook payload function!" },
 { PC: "0x100003f2c", SP: "0x0000007ffe812c10", FP: "0x0000007ffe812c20", X0: "0x100004120", X1: "0x0000000000000042", log: "Loaded and restored original frame pointer (FP) and link register (LR)." },
 { PC: "0x100003f30", SP: "0x0000007ffe812c30", FP: "0x0000000000000000", X0: "0x100004120", X1: "0x0000000000000042", log: "Flushed frame, restored original stack pointer." },
 { PC: "0x100003f34", SP: "0x0000007ffe812c30", FP: "0x0000000000000000", X0: "0x100004120", X1: "0x0000000000000042", log: "Executed register RET branch sequence (Emulation trace finished!)." }
 ];

 function highlightLine(idx) {
 currentLine = idx;
 const lines = document.getElementsByClassName('assembly-line');
 for(let i=0; i<lines.length; i++) {
 lines[i].classList.remove('active');
 }
 if(lines[idx]) lines[idx].classList.add('active');
 
 const logEl = document.getElementById('emuConsole');
 const data = registersData[idx];
 if(data) {
 document.getElementById('reg-PC').innerText = data.PC;
 document.getElementById('reg-SP').innerText = data.SP;
 document.getElementById('reg-FP').innerText = data.FP;
 document.getElementById('reg-X0').innerText = data.X0;
 document.getElementById('reg-X1').innerText = data.X1;
 
 logEl.innerHTML += "\\n" + \`[EMU] PC: \${data.PC} | \${data.log}\`;
 logEl.scrollTop = logEl.scrollHeight;
 }
 }

 function stepEmulator() {
 currentLine = (currentLine + 1) % registersData.length;
 highlightLine(currentLine);
 }
 </script>
</body>
</html>`;
 } else {
 htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
 <meta charset="UTF-8">
 <meta name="viewport" content="width=device-width, initial-scale=1.0">
 <title>Cosmic Flow: Premium Interactive 3D Starfield Landscape</title>
 <style>
 :root {
 --accent-color: #a78bfa;
 --accent-glow: rgba(167, 139, 250, 0.4);
 --bg-color: #07050f;
 --card-bg: rgba(255, 255, 255, 0.02);
 --border-color: rgba(255, 255, 255, 0.08);
 --text-color: #e2e8f0;
 --font-main: 'Outfit', 'Segoe UI', system-ui;
 }
 * {
 box-sizing: border-box;
 margin: 0;
 padding: 0;
 }
 body {
 background-color: var(--bg-color);
 color: var(--text-color);
 font-family: var(--font-main);
 overflow: hidden;
 height: 100vh;
 display: flex;
 align-items: center;
 justify-content: center;
 }
 #starfieldCanvas {
 position: absolute;
 top: 0;
 left: 0;
 width: 100%;
 height: 100%;
 z-index: 1;
 }
 .controls-overlay {
 position: absolute;
 bottom: 30px;
 left: 30px;
 z-index: 10;
 background: rgba(13, 11, 26, 0.6);
 backdrop-filter: blur(16px);
 border: 1px solid var(--border-color);
 border-radius: 16px;
 padding: 24px;
 width: 320px;
 box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
 display: flex;
 flex-direction: column;
 gap: 16px;
 pointer-events: auto;
 }
 .header-section h2 {
 font-size: 16px;
 font-weight: 800;
 text-transform: uppercase;
 letter-spacing: 1px;
 background: linear-gradient(135deg, #a78bfa, #ec4899);
 -webkit-background-clip: text;
 -webkit-text-fill-color: transparent;
 }
 .header-section p {
 font-size: 11px;
 color: #94a3b8;
 margin-top: 4px;
 }
 .control-group {
 display: flex;
 flex-direction: column;
 gap: 6px;
 }
 .control-label {
 font-size: 10px;
 font-weight: 800;
 text-transform: uppercase;
 letter-spacing: 0.5px;
 color: #94a3b8;
 display: flex;
 justify-content: space-between;
 }
 input[type="range"] {
 -webkit-appearance: none;
 width: 100%;
 height: 4px;
 border-radius: 2px;
 background: rgba(255,255,255,0.1);
 outline: none;
 }
 input[type="range"]::-webkit-slider-thumb {
 -webkit-appearance: none;
 width: 14px;
 height: 14px;
 border-radius: 50%;
 background: #a78bfa;
 cursor: pointer;
 box-shadow: 0 0 10px var(--accent-glow);
 transition: transform 0.1s;
 }
 input[type="range"]::-webkit-slider-thumb:hover {
 transform: scale(1.2);
 }
 .btn-synth {
 background: rgba(167, 139, 250, 0.15);
 border: 1px solid var(--accent-color);
 color: var(--accent-color);
 font-weight: 700;
 text-transform: uppercase;
 font-size: 11px;
 letter-spacing: 0.5px;
 padding: 8px 12px;
 border-radius: 6px;
 cursor: pointer;
 transition: all 0.2s;
 outline: none;
 }
 .btn-synth:hover {
 background: var(--accent-color);
 color: #000;
 box-shadow: 0 0 15px var(--accent-glow);
 }
 .stats-hud {
 position: absolute;
 top: 30px;
 right: 30px;
 z-index: 10;
 font-family: monospace;
 font-size: 11px;
 color: var(--accent-color);
 text-align: right;
 pointer-events: none;
 text-shadow: 0 0 8px rgba(167,139,250,0.6);
 }
 </style>
</head>
<body>
 <canvas id="starfieldCanvas"></canvas>
 
 <div class="stats-hud">
 LUMINA PARTICLE RENDERER v2.0<br>
 PARTICLES: <span id="hudCount">500</span><br>
 FPS: <span id="hudFps">60</span>
 </div>

 <div class="controls-overlay">
 <div class="header-section">
 <h2>Cosmic Flow 3D</h2>
 <p>GPU-accelerated vector fields & sound synthesis</p>
 </div>
 
 <div class="control-group">
 <div class="control-label">
 <span>Particle Capacity</span>
 <span id="lblCount">500</span>
 </div>
 <input type="range" id="sliderCount" min="100" max="1500" value="500" oninput="updateCount(this.value)">
 </div>
 
 <div class="control-group">
 <div class="control-label">
 <span>Flow Speed</span>
 <span id="lblSpeed">2.5</span>
 </div>
 <input type="range" id="sliderSpeed" min="0.5" max="8.0" step="0.1" value="2.5" oninput="updateSpeed(this.value)">
 </div>
 
 <div class="control-group">
 <div class="control-label">
 <span>Gravity Attraction</span>
 <span id="lblGravity">0.4</span>
 </div>
 <input type="range" id="sliderGravity" min="0.0" max="2.0" step="0.1" value="0.4" oninput="updateGravity(this.value)">
 </div>
 
 <button class="btn-synth" onclick="triggerSynthBurst()">Trigger Sound Synthesis Burst Max</button>
 </div>

 <script>
 const canvas = document.getElementById('starfieldCanvas');
 const ctx = canvas.getContext('2d');
 
 let width = canvas.width = window.innerWidth;
 let height = canvas.height = window.innerHeight;
 
 window.addEventListener('resize', () => {
 width = canvas.width = window.innerWidth;
 height = canvas.height = window.innerHeight;
 });
 
 let particleCount = 500;
 let flowSpeed = 2.5;
 let gravity = 0.4;
 let particles = [];
 
 let mouse = { x: width/2, y: height/2, active: false };
 
 canvas.addEventListener('mousemove', (e) => {
 mouse.x = e.clientX;
 mouse.y = e.clientY;
 mouse.active = true;
 });
 
 canvas.addEventListener('mouseleave', () => {
 mouse.active = false;
 });
 
 class Particle {
 constructor() {
 this.reset();
 }
 reset() {
 this.x = Math.random() * width;
 this.y = Math.random() * height;
 this.z = Math.random() * width;
 
 this.vx = (Math.random() - 0.5) * flowSpeed;
 this.vy = (Math.random() - 0.5) * flowSpeed;
 this.color = Math.random() > 0.5 ? '#a78bfa' : '#ec4899';
 this.size = Math.random() * 2 + 1;
 }
 update() {
 this.z -= flowSpeed;
 if (this.z <= 0) {
 this.reset();
 }
 
 if (mouse.active) {
 const dx = mouse.x - this.x;
 const dy = mouse.y - this.y;
 const dist = Math.sqrt(dx*dx + dy*dy);
 if (dist < 300) {
 const force = (300 - dist) * 0.0002 * gravity;
 this.vx += dx * force;
 this.vy += dy * force;
 }
 }
 
 this.x += this.vx;
 this.y += this.vy;
 
 this.vx *= 0.98;
 this.vy *= 0.98;
 
 if (this.x < 0 || this.x > width || this.y < 0 || this.y > height) {
 this.reset();
 }
 }
 draw() {
 const px = (this.x - width/2) * (width / this.z) + width/2;
 const py = (this.y - height/2) * (height / this.z) + height/2;
 const size = this.size * (width / this.z) * 0.4;
 
 if (px >= 0 && px <= width && py >= 0 && py <= height) {
 ctx.beginPath();
 ctx.arc(px, py, size, 0, Math.PI * 2);
 ctx.fillStyle = this.color;
 ctx.shadowBlur = size * 2;
 ctx.shadowColor = this.color;
 ctx.fill();
 }
 }
 }
 
 function initParticles() {
 particles = [];
 for (let i = 0; i < particleCount; i++) {
 particles.push(new Particle());
 }
 document.getElementById('hudCount').innerText = particleCount;
 }
 
 initParticles();
 
 function updateCount(val) {
 particleCount = parseInt(val);
 document.getElementById('lblCount').innerText = val;
 initParticles();
 }
 
 function updateSpeed(val) {
 flowSpeed = parseFloat(val);
 document.getElementById('lblSpeed').innerText = val;
 }
 
 function updateGravity(val) {
 gravity = parseFloat(val);
 document.getElementById('lblGravity').innerText = val;
 }
 
 let audioCtx = null;
 function triggerSynthBurst() {
 if (!audioCtx) {
 audioCtx = new (window.AudioContext || window.webkitAudioContext)();
 }
 
 const osc = audioCtx.createOscillator();
 const gainNode = audioCtx.createGain();
 
 osc.connect(gainNode);
 gainNode.connect(audioCtx.destination);
 
 const notes = [261.63, 329.63, 392.00, 523.25];
 const randomPitch = notes[Math.floor(Math.random() * notes.length)];
 
 osc.frequency.setValueAtTime(randomPitch, audioCtx.currentTime);
 osc.frequency.exponentialRampToValueAtTime(randomPitch * 2, audioCtx.currentTime + 0.8);
 osc.type = 'sine';
 
 gainNode.gain.setValueAtTime(0.25, audioCtx.currentTime);
 gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.9);
 
 osc.start();
 osc.stop(audioCtx.currentTime + 1.0);
 
 flowSpeed *= 2;
 setTimeout(() => {
 flowSpeed = parseFloat(document.getElementById('sliderSpeed').value);
 }, 800);
 }
 
 let lastTime = performance.now();
 let fps = 60;
 
 function animate() {
 ctx.fillStyle = 'rgba(7, 5, 15, 0.2)';
 ctx.shadowBlur = 0;
 ctx.fillRect(0, 0, width, height);
 
 particles.forEach(p => {
 p.update();
 p.draw();
 });
 
 const now = performance.now();
 fps = Math.round(1000 / (now - lastTime));
 lastTime = now;
 if(Math.random() > 0.9) {
 document.getElementById('hudFps').innerText = fps;
 }
 
 requestAnimationFrame(animate);
 }
 
 animate();
 </script>
</body>
</html>`;
 }
 
 generatedCodeBuffer = htmlContent;
 
 const codeDisplay = document.getElementById('sandboxCodeDisplay');
 if (codeDisplay) codeDisplay.innerText = htmlContent;
}

function generateMythosReportCode(goal, loss) {
 const reportHtml = `<!DOCTYPE html>
<html lang="en">
<head>
 <meta charset="UTF-8">
 <meta name="viewport" content="width=device-width, initial-scale=1.0">
 <title>Mythos Fine-Tuning Convergence Diagnostics Report</title>
 <style>
 body {
 background-color: #07050f;
 color: #e2e8f0;
 font-family: 'Segoe UI', -apple-system, sans-serif;
 padding: 40px;
 margin: 0;
 line-height: 1.6;
 }
 .container {
 max-width: 800px;
 margin: 0 auto;
 background: rgba(255,255,255,0.02);
 border: 1px solid rgba(255,255,255,0.08);
 border-radius: 12px;
 padding: 30px;
 box-shadow: 0 10px 40px rgba(0,0,0,0.4);
 }
 .header {
 border-bottom: 1px solid rgba(255,255,255,0.08);
 padding-bottom: 20px;
 margin-bottom: 20px;
 }
 h1 {
 font-size: 20px;
 color: #a78bfa;
 text-transform: uppercase;
 letter-spacing: 1px;
 margin: 0 0 8px 0;
 }
 .subtitle {
 font-size: 12px;
 color: #94a3b8;
 }
 .stat-grid {
 display: grid;
 grid-template-columns: repeat(3, 1fr);
 gap: 16px;
 margin-bottom: 24px;
 }
 .stat-card {
 background: rgba(0,0,0,0.3);
 border: 1px solid rgba(255,255,255,0.05);
 padding: 16px;
 border-radius: 8px;
 text-align: center;
 }
 .stat-val {
 font-size: 22px;
 font-weight: 800;
 color: #10b981;
 font-family: monospace;
 }
 .stat-label {
 font-size: 10px;
 text-transform: uppercase;
 color: #94a3b8;
 margin-top: 4px;
 }
 .section-title {
 font-size: 13px;
 text-transform: uppercase;
 letter-spacing: 0.5px;
 color: #a78bfa;
 font-weight: bold;
 margin-bottom: 12px;
 }
 .code-block {
 background: #000;
 padding: 16px;
 border-radius: 6px;
 font-family: monospace;
 font-size: 12.5px;
 overflow-x: auto;
 color: #f472b6;
 border: 1px solid rgba(255,255,255,0.05);
 margin-bottom: 24px;
 }
 </style>
</head>
<body>
 <div class="container">
 <div class="header">
 <h1>Mythos Deep SFT Training Analytics Report</h1>
 <span class="subtitle">Adapter compilation verified. Deployment status: Production Inference</span>
 </div>
 
 <div class="stat-grid">
 <div class="stat-card">
 <div class="stat-val">${loss.toFixed(4)}</div>
 <div class="stat-label">Convergence Loss</div>
 </div>
 <div class="stat-card">
 <div class="stat-val" style="color: #ec4899;">${state.trainingEpochs}</div>
 <div class="stat-label">Training Epochs</div>
 </div>
 <div class="stat-card">
 <div class="stat-val" style="color: #a78bfa;">r = ${state.trainingLoRA}</div>
 <div class="stat-label">LoRA Rank</div>
 </div>
 </div>
 
 <div class="section-title">Objective Specs</div>
 <div style="font-size: 13.5px; color: #94a3b8; margin-bottom: 24px;">
 Target Goal: <strong>"${goal}"</strong><br>
 Base Model selection: <strong>Qwen 2.5 Coder 7B Instruct</strong>
 </div>
 
 <div class="section-title">Sample Inference Output (Reasoning Chain)</div>
 <pre class="code-block">&lt;thought&gt;
Low-level payload instruction encountered: 
 ldr x0, [sp, #8]
 cmp x0, #0
 b.eq 0x100003f40

Tracing stack frame structure:
* Stack offset 8 holds the buffer pointer target.
* Check if pointer is NULL (zero flag validation).
* Branch equality target is stack tear-down loop.
* Successfully detected potential NULL dereference vulnerability inside custom hooking sequence!
&lt;/thought&gt;
Status: Secure assembly injection complete.</pre>
 
 <div style="text-align: center; color: #94a3b8; font-size: 11px; margin-top: 40px; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 16px;">
 Lumina Neural Engine SFT Hub. All weights locked.
 </div>
 </div>
</body>
</html>`;
 generatedCodeBuffer = reportHtml;
 
 const codeDisplay = document.getElementById('sandboxCodeDisplay');
 if (codeDisplay) codeDisplay.innerText = reportHtml;
}

function hotReloadPipelinePreview() {
 playSynthSound('switch');
 const iframe = document.getElementById('sandboxIframe');
 if (iframe && generatedCodeBuffer) {
 iframe.srcdoc = generatedCodeBuffer;
 
 const titleMatch = generatedCodeBuffer.match(/<title>([\s\S]*?)<\/title>/i);
 const title = titleMatch ? titleMatch[1] : "Interactive Web Mockup";
 document.getElementById('sandboxAppTitle').innerText = title;
 
 switchSandboxTab('preview');
 showToast("️ Compiled code hot-reloaded into Preview successfully!");
 } else {
 showToast("️ There is no generated code buffer to render! Run the pipeline first.");
 }
}

function exportPipelineLogs() {
 playSynthSound('send');
 const consoleEl = document.getElementById('pipelineConsole');
 if (!consoleEl) return;
 
 const logs = consoleEl.innerText.trim();
 if (!logs) {
 showToast("️ There are no pipeline console logs to export!");
 return;
 }
 
 const activeSession = state.sessions[state.activeSessionId];
 if (!activeSession) return;
 
 const userMsg = {
 sender: 'user',
 text: `Exporting Lumina Multi-Agent & Training Console Log metrics from current run. Preset mode: **${state.pipelineMode.toUpperCase()}**`,
 timestamp: Date.now()
 };
 activeSession.messages.push(userMsg);
 
 renderMessages();
 showToast("Chat Console logs successfully exported back to Chat!");
 
 const indicator = document.getElementById('typingIndicator');
 if (indicator) indicator.classList.remove('hide');
 
 const chatContainer = document.getElementById('chatContainer');
 if (chatContainer) chatContainer.scrollTop = chatContainer.scrollHeight;
 
 setTimeout(() => {
 if (indicator) indicator.classList.add('hide');
 
 const botResponse = `### AI การรวบรวมและวิเคราะห์ผลลัพธ์จาก Multi-Agent System Console\n\n` +
 `ฉันได้รับรายงานและบันทึกข้อมูลล็อกประชามติจาก **Lumina Agents Studio** สำหรับเป้าหมาย: \`"${state.pipelineGoal}"\` เรียบร้อยแล้วค่ะ!\n\n` +
 `นี่คือบทวิเคราะห์สรุปผลงานระดับผู้เชี่ยวชาญ:\n\n` +
 `* **โหมดการสอดประสาน (Orchestration Framework)**: \`${state.pipelineMode.toUpperCase()}\` ประสบความสำเร็จในการระดมทุนความคิดของ AI Agents\n` +
 `* **ผลสัมฤทธิ์จากระบบ (Consensus Analysis)**: ` + 
 (state.pipelineMode === 'mythos' 
 ? `LoRA Fine-tuning สิ้นสุดกระบวนการปรับจูนน้ำหนักและบีบอัดค่า Loss ลงมาอยู่ที่ระดับล่างได้สำเร็จ โครงข่ายโมเดลเก่งเฉพาะทางสำหรับการ Reverse Engineering พร้อมทำ Inference แล้ว` 
 : `ระบบสถาปัตยกรรมผ่านด่านอรหันต์และการ VETO ทบทวนความปลอดภัยลอจิกรวมถึงโครงสร้างสี Cosmic Glow (Dark Mode) เรียบร้อย โค้ดได้รับการปรับปรุงจนสมบูรณ์แบบ`
 ) + `\n\n` +
 `#### [Basic] รายละเอียดบันทึกการส่งมอบ (Consolidated Agent logs)\n` +
 `\`\`\`text\n` +
 logs.split('\n').slice(0, 10).join('\n') + `\n` +
 `... [ truncated logs representing system safety checks and loop completion ]\n` +
 `\`\`\`\n\n` +
 `ต้องการให้ฉันขยายโครงร่างหรือนำ adaptation model ที่ได้นี้ไปประยุกต์ใช้งานในรูปแบบใดต่อไป ป้อนคำสั่งถามเพิ่มเติมได้เลยนะคะ! Flux`;
 
 const botMsg = {
 sender: 'bot',
 senderBot: state.activePersona,
 text: botResponse,
 timestamp: Date.now()
 };
 activeSession.messages.push(botMsg);
 
 renderMessages();
 playSynthSound('receive');
 if (chatContainer) chatContainer.scrollTop = chatContainer.scrollHeight;
 }, 2000);
}
