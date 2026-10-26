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
