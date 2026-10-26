# NetworkSathi (नेटवर्क साथी)
> *"Sahi message, sahi mauka."*

NetworkSathi is an AI-powered Cold Email and LinkedIn Coach built specifically for Indian college students (BTech, BCA, BSc, MBA, and similar) across 1st to final year. It helps students write high-converting, human-sounding outreach messages for internships, job referrals, research positions with professors, alumni guidance, and project collaborations.

Instead of generating generic robotic templates, NetworkSathi acts like a smart, empathetic senior (bhaiya/didi) who reviews your background, identifies missing proof of work, strips out outdated letter clichés (e.g., *"Respected Sir"*, *"Kindly do the needful"*), and teaches you what actually makes cold outreach work in the Indian tech ecosystem.

---

## 🎯 Key Features

1. **8 Indian College Outreach Scenarios**:
   - 🚀 **Internship Request**: Startup founders, engineering leads, and CTOs.
   - 🤝 **Job Referral**: College alumni and engineers at target companies (Job ID-focused).
   - 🔬 **Research with Professor**: IIT, NIT, IIIT, or global lab faculty (paper and lab-specific).
   - 🎓 **Alumni Advice & Chat**: Seniors from your college who cracked your target role.
   - 💼 **Recruiter Outreach**: Tech talent acquisition partners (concise, availability-focused).
   - ⏰ **Gentle Follow-Up**: 5–7 days later with new project milestones, zero guilt-tripping.
   - 🙏 **Thank You Note**: Meaningful post-chat or post-interview gratitude.
   - 💡 **Project Collab**: Hackathon or open-source peer partnership proposals.

2. **Multi-Channel & Strict Constraints**:
   - **Cold Email**: 3 high-open-rate subject lines, hook, proof of work, low-friction ask, easy out, and follow-up.
   - **LinkedIn Connection Note**: Strictly enforced **under 300 characters** with a live warning if exceeded.
   - **LinkedIn DM / InMail**: Crisp and structured under 600 characters.

3. **Score My Draft**:
   - Evaluates any existing message with an **Overall Score (out of 100)** and 5 category pillars: *Clarity*, *Personalization*, *Length & Brevity*, *Tone & Respect*, and *Clear Ask*.
   - Flags Indian corporate clichés (**Cringe Flags**) like *"Respected Sir"*, *"Kindly do the needful"*, *"Please give me a chance"*.
   - Classifies **Spam Risk** (Low, Medium, High).
   - Provides an instant **Rewritten Version** ready to copy.

4. **LinkedIn Profile Boost**:
   - Generates 3 keyword-optimized headlines (under 120 characters).
   - Creates a magnetic, first-person **About section** (under 1800 characters) with a hook, proof of work, and clear call-to-action.
   - Highlights 5 in-demand skills and offers 3 actionable profile tips for Indian students.

5. **Learn Masterclass**:
   - 6 actionable guides covering the Anatomy of Cold Email, Do's & Don'ts for Indian Students, How to Approach Professors, Non-Awkward Referrals, Follow-up Strategy, and High-Open-Rate Subject Lines.

6. **Student-Centric UX**:
   - Dark / Light mode toggle (persisted via `localStorage`).
   - "Fill with sample data" button customized for every scenario.
   - One-click copy, mailto generator (`Open in Email App`), and editable textareas.
   - In-memory **Session History** (reopen the last 5 messages).
   - Completely responsive, mobile-first design with a sticky bottom action bar on phones.

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: Plain HTML5, CSS3, and vanilla JavaScript (no React, no bundlers, zero build step) served statically from `/public`.
- **Backend**: Node.js with Express (`server.js`).
- **AI Provider**: Google Gemini API via official REST endpoint (`callAI(systemPrompt, userPrompt)`).
- **Rate Limiting**: `express-rate-limit` (20 requests per 10 minutes per IP).
- **Security & Privacy**: Zero scraping or fetching of third-party websites. Never invents facts. No API keys in frontend code.

---

## 🚀 Getting Started Locally

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or higher recommended).
- A free Google Gemini API Key from [Google AI Studio](https://aistudio.google.com/).

### 1. Installation
Clone or navigate to the project directory:
```bash
cd networksathi
npm install
```

### 2. Configure Environment Variables
Copy the `.env.example` file to `.env`:
```bash
cp .env.example .env
```

Open `.env` in any text editor and paste your Gemini API key:
```env
PORT=3000
GEMINI_API_KEY=your_gemini_api_key_here
AI_MODEL=gemini-2.5-flash
```
*(Note: If `gemini-2.5-flash` is unavailable in your region or account, NetworkSathi automatically falls back to `gemini-flash-lite-latest` or `gemini-3.8-flash` seamlessly.)*

### 3. Run the Server
```bash
npm start
```
Or for development with automatic reload:
```bash
npm run dev
```

Visit **`http://localhost:3000`** in your browser!

### 4. Run the Automated Test Suite
To verify all 8 scenarios, message types, scoring engine, profile booster, and input validations:
```bash
npm test
```

---

## 🌐 Production Deployment

### Option A: Deploy to Render (Recommended - Free Web Service)
1. Push your repository to GitHub or GitLab.
2. Sign in to [Render](https://render.com/) and click **New > Web Service**.
3. Connect your repository.
4. Set the following build settings:
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Under **Environment Variables**, add:
   - `GEMINI_API_KEY`: Your Google Gemini API key.
   - `AI_MODEL`: `gemini-2.5-flash` (or `gemini-flash-lite-latest`).
6. Click **Deploy Web Service**. Render will assign you a live HTTPS URL.

### Option B: Deploy to Vercel
1. Install Vercel CLI (`npm i -g vercel`) or import your repository on [vercel.com](https://vercel.com/).
2. Add `GEMINI_API_KEY` in Project Settings > Environment Variables.
3. Deploy with `vercel --prod`.

---

## 🛡️ Guardrails & Important Design Principles

- **No Scraping**: NetworkSathi never contacts LinkedIn or external websites. The user manually pastes any profile snippet or job description.
- **No Fact Invention**: When details are missing, the AI uses clear placeholders like `[mention your project]` and lists them in the **Personalization Checklist**.
- **No Direct Sending / Spamming**: NetworkSathi does not send emails directly; it provides **Copy** and **Open in Email App** (mailto) links.
- **Anti-Cringe Indian Context**: Eliminates colonial letter formulas (*"Respected Sir"*, *"Kindly do the needful"*), replacing them with modern, respectful, and confident professional English.

---

## 📄 License
MIT License. Built with ❤️ for Indian college students.
