/**
 * NetworkSathi - AI Cold Email and LinkedIn Coach for Indian College Students
 * "Sahi message, sahi mauka."
 *
 * Backend server built with Node.js & Express
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const AI_MODEL = process.env.AI_MODEL || 'gemini-2.5-flash';

// Middleware
app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Rate Limiting: 20 requests per 10 minutes per IP
const apiLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 20,
  skip: () => process.env.NODE_ENV === 'test',
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Bohot saare requests ho gaye! Please wait a few minutes before asking NetworkSathi again (Rate limit: 20 requests per 10 mins).'
  }
});

// Apply rate limiter to API routes
app.use('/api/', apiLimiter);

/**
 * Clean and parse JSON from AI response, stripping markdown fences if present
 * @param {string} text
 * @returns {object} Parsed JSON or fallback object
 */
function cleanAndParseJSON(text) {
  if (!text || typeof text !== 'string') {
    return { fallbackText: '' };
  }

  let clean = text.trim();

  // Strip markdown code fences like ```json ... ``` or ``` ... ```
  if (clean.startsWith('```')) {
    const firstNewline = clean.indexOf('\n');
    if (firstNewline !== -1) {
      clean = clean.substring(firstNewline + 1);
    }
    const lastFence = clean.lastIndexOf('```');
    if (lastFence !== -1) {
      clean = clean.substring(0, lastFence);
    }
    clean = clean.trim();
  }

  try {
    return JSON.parse(clean);
  } catch (err) {
    // Attempt to extract the first balanced JSON object {...}
    const firstBrace = clean.indexOf('{');
    const lastBrace = clean.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      try {
        const potentialJson = clean.substring(firstBrace, lastBrace + 1);
        return JSON.parse(potentialJson);
      } catch (innerErr) {
        // Fallback gracefully
      }
    }
    return { fallbackText: text };
  }
}

/**
 * AI Provider Function
 * ALL AI-provider-specific logic lives exclusively inside this function.
 * You can swap Gemini for another provider by modifying ONLY this function.
 *
 * @param {string} systemPrompt
 * @param {string} userPrompt
 * @param {object} [options]
 * @returns {Promise<string>} Raw AI response text
 */
async function callAI(systemPrompt, userPrompt, options = {}) {
  // Support simulated failure for testing purposes
  if (options.simulateError || process.env.SIMULATE_AI_ERROR === 'true') {
    throw new Error('Simulated AI provider failure: Service temporarily overloaded. Please try again.');
  }

  // Offline mock generator for local tests or when MOCK_AI is enabled
  if (process.env.MOCK_AI === 'true') {
    return generateMockAiResponse(systemPrompt, userPrompt);
  }

  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_gemini_api_key_here') {
    throw new Error('GEMINI_API_KEY is not configured on the server. Please add your Gemini API key to the .env file.');
  }

  // Candidate models to try in case of 404/deprecation or temporary outage
  const candidateModels = [
    AI_MODEL,
    'gemini-flash-lite-latest',
    'gemini-3.8-flash',
    'gemini-2.5-flash-lite',
    'gemini-flash-latest',
    'gemini-2.5-flash'
  ].filter((v, i, a) => a.indexOf(v) === i);

  let lastError = null;

  for (const modelToTry of candidateModels) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelToTry}:generateContent?key=${GEMINI_API_KEY}`;

    const requestBody = {
      systemInstruction: {
        parts: [{ text: systemPrompt }]
      },
      contents: [
        {
          role: 'user',
          parts: [{ text: userPrompt }]
        }
      ],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.7
      }
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30-second timeout

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const status = response.status;
        let errorBody = '';
        try {
          const errJson = await response.json();
          errorBody = errJson?.error?.message || JSON.stringify(errJson);
        } catch (_) {
          errorBody = await response.text();
        }

        // If 404 (model retired/changed) or 503, try next candidate model
        if ((status === 404 || status === 503) && modelToTry !== candidateModels[candidateModels.length - 1]) {
          console.warn(`Model ${modelToTry} returned ${status} (${errorBody}). Retrying with next candidate model...`);
          lastError = new Error(`Model ${modelToTry} failed: ${errorBody}`);
          continue;
        }

        if (status === 429) {
          throw new Error('NetworkSathi is receiving high traffic right now (Gemini API quota reached). Please wait a minute and try again.');
        } else if (status === 400 || status === 403) {
          throw new Error(`API authentication error: ${errorBody || 'Please check your GEMINI_API_KEY in .env.'}`);
        } else {
          throw new Error(`AI service temporarily unavailable (${status}). Please try again shortly.`);
        }
      }

      const data = await response.json();
      const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!candidateText) {
        throw new Error('NetworkSathi did not receive an answer from the AI model. Please try again.');
      }

      return candidateText;
    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        throw new Error('AI request timed out after 30 seconds. Please try again.');
      }
      lastError = err;
      // If we still have candidate models and it was a network error, retry
      if (modelToTry !== candidateModels[candidateModels.length - 1] && !err.message.includes('GEMINI_API_KEY')) {
        continue;
      }
      throw err;
    }
  }

  throw lastError || new Error('Failed to communicate with AI provider.');
}

/**
 * Intelligent mock response generator for offline testing or unit verification
 */
function generateMockAiResponse(systemPrompt, userPrompt) {
  if (userPrompt.includes('Evaluate the draft') || systemPrompt.includes('evaluating a student\'s outreach')) {
    const isBad = userPrompt.includes('Respected Sir') || userPrompt.includes('please give me an internship');
    if (isBad) {
      return JSON.stringify({
        overallScore: 38,
        scores: { clarity: 5, personalization: 2, length: 7, tone: 3, clearAsk: 2 },
        cringeFlags: [
          '"Respected Sir" sounds outdated in modern tech companies',
          '"please give me an internship" sounds like begging rather than showcasing value',
          'Zero mention of recipient or why you chose their team'
        ],
        spamRisk: 'high',
        whatWorks: ['Straight to the point', 'Brief and not overly wordy'],
        improvements: [
          'Address recipient by their first name or professional title',
          'Mention a specific project or skill relevant to their company',
          'Ask for a short conversation or referral instead of demanding a job directly'
        ],
        improvedVersion: 'Hi [Name],\n\nI came across your work on [Recipient Project/Team] and was really impressed by [specific aspect]. As a 3rd-year CS student at [College], I recently built [Your Project Name] using React and Node.js.\n\nI would love to learn if your team at [Company] has any upcoming summer internship openings for frontend or backend roles. Happy to share my resume and GitHub if helpful.\n\nThanks for your time!\nBest,\n[Your Name]'
      });
    }

    return JSON.stringify({
      overallScore: 84,
      scores: { clarity: 9, personalization: 8, length: 8, tone: 9, clearAsk: 8 },
      cringeFlags: [],
      spamRisk: 'low',
      whatWorks: ['Clear proof of work mentioned', 'Polite and respectful tone', 'Frictionless call to action'],
      improvements: ['Consider adding a 1-line link to your live demo', 'Follow up in 5-7 days if no reply'],
      improvedVersion: 'Hi [Name],\n\nI really enjoyed reading your recent post on distributed systems. As a final-year CS undergrad at [College], I built a distributed task queue in Go.\n\nI noticed an opening for SDE Intern (Req #1234) on your team and would love to be considered. Would you be open to a quick 10-minute chat or passing along my resume?\n\nWarm regards,\n[Your Name]'
    });
  }

  if (userPrompt.includes('targetRole') || systemPrompt.includes('expert career mentor')) {
    return JSON.stringify({
      headlineOptions: [
        'Full Stack Developer | React, Node.js, TypeScript | Final Year CS @ [College] | Open for 2026 Grad Roles',
        'Backend Engineer | Building Scalable APIs with Python & Go | Open Source Contributor',
        'Software Engineer Aspirant | Cloud & Microservices Enthusiast | 2x Hackathon Finalist'
      ],
      improvedAbout: 'I am a computer science student with a passion for designing reliable backend systems and clean user experiences.\n\nDuring my degree, I built full-stack applications serving real users, including a peer tutoring portal and an automated task scheduler using Node.js and PostgreSQL. I enjoy diving into tricky bugs, optimizing SQL queries, and collaborating with cross-functional teams.\n\nCurrently, I am looking for full-time Software Engineer or Winter/Summer Internship opportunities where I can contribute to impactful products and learn from seasoned engineering leaders.\n\nLet’s connect or reach me at [email@college.edu].',
      skillsToHighlight: ['Node.js & Express', 'PostgreSQL / MongoDB', 'React.js', 'System Architecture & REST APIs', 'Git & CI/CD Pipelines'],
      profileTips: [
        'Feature your best GitHub project with a screenshot and live demo link in the Featured section.',
        'Customize your LinkedIn public URL (e.g., linkedin.com/in/yourname) to look clean on resumes.',
        'Request 2 recommendations from your project teammates, internship mentor, or college lab professor.'
      ]
    });
  }

  // Default generate mock
  const isLinkedInConnect = userPrompt.includes('"messageType": "linkedin_connect"') || userPrompt.includes('linkedin_connect');
  if (isLinkedInConnect) {
    const msg = 'Hi [Name], loved your post on tech architecture at [Company]. I am a CS undergrad at [College] building full-stack apps. Would love to connect and learn from your journey!';
    return JSON.stringify({
      subjectOptions: ['Connecting from [College]', 'Following your work at [Company]', 'Student developer connecting'],
      message: msg,
      alternateVersion: 'Hi [Name], your career trajectory from [College/Tier-2] to [Company] is inspiring. Would love to connect and follow your updates!',
      followUp: 'Hi [Name], just checking in. Hope you have a wonderful week ahead!',
      followUpTiming: 'Follow up in 1-2 weeks only if they accepted your connection request.',
      missingInfo: ['Add the specific topic or post they wrote recently', 'Add your college name'],
      tips: [
        'LinkedIn connection requests must stay under 300 characters.',
        'Never pitch a job in the first connection note; connect first, build rapport second.'
      ],
      characterCount: msg.length
    });
  }

  return JSON.stringify({
    subjectOptions: [
      'Question regarding [Recipient Project] & SDE opportunities at [Company]',
      'CS Student from [College] interested in [Company] engineering team',
      'Quick note from an aspiring engineer following your work'
    ],
    message: 'Hi [Name],\n\nI hope you are having a productive week. I have been following your engineering updates at [Company], especially your recent work on [mention their specific project/post].\n\nI am currently a 3rd-year CS student at [College]. Recently, I built [mention your top project], where I implemented [key tech stack] to solve [core problem].\n\nI noticed an opening for an Engineering Intern at [Company] and believe my background in [your skills] aligns well with what your team values. Would you be open to a 10-minute chat or passing along my profile if you think there is a fit?\n\nI know you are busy, so no worries at all if now is not a good time.\n\nWarm regards,\n[Your Name]\n[Portfolio/GitHub Link]',
    alternateVersion: 'Hi [Name],\n\nLoved your recent work at [Company]. I am a final-year student at [College] building full-stack products. Would love to be considered for any upcoming internship openings on your team. Happy to share my portfolio and resume whenever convenient.\n\nBest,\n[Your Name]',
    followUp: 'Hi [Name],\n\nI wanted to gently follow up on my note from last week. I recently open-sourced an update to [mention project/improvement] and thought it might interest you. Would still love to connect if you have a moment!\n\nBest regards,\n[Your Name]',
    followUpTiming: 'Wait 5 to 7 business days before sending this gentle follow-up.',
    missingInfo: [
      'Replace [Recipient Project] with an actual achievement or post from their profile',
      'Replace [mention your top project] with your strongest project name and GitHub link'
    ],
    tips: [
      'Personalize the opening sentence with something specific to their team.',
      'Always test links before hitting send.',
      'Never send the same message to 10 colleagues at the same company simultaneously.'
    ],
    characterCount: 680
  });
}

// ---------------------------------------------------------------------------
// Validation Helpers
// ---------------------------------------------------------------------------

const VALID_SCENARIOS = [
  'internship',
  'referral',
  'research_professor',
  'alumni_advice',
  'recruiter',
  'follow_up',
  'thank_you',
  'collab_project'
];

const VALID_MESSAGE_TYPES = ['email', 'linkedin_connect', 'linkedin_dm'];
const VALID_TONES = ['friendly', 'professional', 'formal'];
const VALID_LENGTHS = ['short', 'medium'];

function validateStringLength(val, maxLen, fieldName) {
  if (val && typeof val === 'string' && val.length > maxLen) {
    return `${fieldName} cannot exceed ${maxLen} characters (currently ${val.length} chars).`;
  }
  return null;
}

// ---------------------------------------------------------------------------
// API Routes
// ---------------------------------------------------------------------------

/**
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    service: 'NetworkSathi API',
    model: AI_MODEL,
    hasApiKey: Boolean(GEMINI_API_KEY && GEMINI_API_KEY !== 'your_gemini_api_key_here'),
    timestamp: new Date().toISOString()
  });
});

/**
 * POST /api/generate
 * Generates personalized cold email / LinkedIn outreach message
 */
app.post('/api/generate', async (req, res) => {
  try {
    const {
      scenario,
      tone = 'professional',
      length = 'short',
      messageType = 'email',
      student = {},
      recipient = {},
      goal = '',
      extraContext = '',
      outputLanguageStyle = 'clean_english'
    } = req.body || {};

    // Validate Enums
    if (!scenario || !VALID_SCENARIOS.includes(scenario)) {
      return res.status(400).json({
        error: `Invalid or missing scenario. Must be one of: ${VALID_SCENARIOS.join(', ')}`
      });
    }

    if (!VALID_MESSAGE_TYPES.includes(messageType)) {
      return res.status(400).json({
        error: `Invalid messageType. Must be one of: ${VALID_MESSAGE_TYPES.join(', ')}`
      });
    }

    if (!VALID_TONES.includes(tone)) {
      return res.status(400).json({
        error: `Invalid tone. Must be one of: ${VALID_TONES.join(', ')}`
      });
    }

    if (!VALID_LENGTHS.includes(length)) {
      return res.status(400).json({
        error: `Invalid length. Must be one of: ${VALID_LENGTHS.join(', ')}`
      });
    }

    // Validate text lengths
    const lengthErrors = [
      validateStringLength(recipient.profileText, 3000, 'recipient.profileText'),
      validateStringLength(student.skills, 1000, 'student.skills'),
      validateStringLength(student.projects, 1000, 'student.projects'),
      validateStringLength(student.achievements, 1000, 'student.achievements'),
      validateStringLength(student.name, 200, 'student.name'),
      validateStringLength(student.college, 200, 'student.college'),
      validateStringLength(student.course, 200, 'student.course'),
      validateStringLength(student.year, 100, 'student.year'),
      validateStringLength(recipient.name, 200, 'recipient.name'),
      validateStringLength(recipient.role, 200, 'recipient.role'),
      validateStringLength(recipient.company, 200, 'recipient.company'),
      validateStringLength(goal, 1000, 'goal'),
      validateStringLength(extraContext, 1000, 'extraContext')
    ].filter(Boolean);

    if (lengthErrors.length > 0) {
      return res.status(400).json({ error: lengthErrors[0] });
    }

    // Required fields per scenario
    if (!student.name || !student.name.trim()) {
      return res.status(400).json({ error: 'Please provide your name.' });
    }

    if (!recipient.name || !recipient.name.trim()) {
      return res.status(400).json({ error: 'Please provide the recipient\'s name (or title).' });
    }

    // Scenario-specific requirement checks
    if (scenario === 'research_professor' && !recipient.role && !recipient.company) {
      return res.status(400).json({ error: 'For professor outreach, please provide their Department or University/College.' });
    }

    if (scenario === 'referral' && (!recipient.company || !goal)) {
      return res.status(400).json({ error: 'For referral requests, please provide the company name and target role / Job ID.' });
    }

    const systemPrompt = `You are NetworkSathi, a friendly, smart, and experienced senior who helps Indian college students write cold emails and LinkedIn messages that actually get replies. Tagline: "Sahi message, sahi mauka."

Persona & Tone:
- You feel like an encouraging, practical senior (bhaiya/didi) who has successfully navigated tech internships, professor research labs, and company referrals.
- Tone must suit the Indian professional context: polite and respectful, but direct, modern, and human.
- Strictly AVOID outdated clichés: "I hope this mail finds you in good health", "kindly do the needful", "Respected Sir/Madam" (unless recipient is a senior professor AND tone is formal), "I am writing to express my interest in...", "Please give me a chance".
- Avoid spammy buzzwords, sycophancy, begging, or long generic autobiographies.
- Never invent facts about the student or the recipient. Mention ONLY the facts provided. When details are missing, use clear bracketed placeholders like [mention a specific project you built] or [insert your GitHub link], and list them in "missingInfo".
- Never assume gender of the recipient.

Length Constraints:
- If messageType is "linkedin_connect": The message MUST be strictly under 300 characters (including spaces). Every character counts. Be concise, mention common ground or interest, and state the connection reason cleanly.
- If messageType is "linkedin_dm": Keep under 600 characters.
- If messageType is "email": Under 120 words for "short", under 200 words for "medium".

Email Structure:
- 3 compelling, high-open-rate subject lines (clean, no spam words, personalized with student's college or recipient's project/company).
- A 1-line opener showing the student did homework about the recipient (referencing their work/post/company).
- 1-2 lines on who the student is with proof of work (projects, metrics, skills).
- A clear, low-friction ask (e.g. 15-minute Google Meet, feedback on a project, or a referral for Job ID [ID]).
- An easy way out ("No worries at all if you're busy right now").
- Warm, professional sign-off.

Scenario Specializations:
- "research_professor": Academic respect without groveling. Reference the professor's research area or paper (if provided), link student's coursework/projects, ask about summer/winter research assistant or internship opportunities.
- "referral": Make it easy for the referrer: include role title, link placeholder, 2-line fit summary, easy out.
- "internship": Highlight 1 standout project with tech stack and live link, clear availability.
- "alumni_advice": Leverage shared alma mater, acknowledge their journey, small 15-min chat ask.
- "recruiter": Brief, punchy, key tech stack, availability date, resume link.
- "follow_up": Polite, sent 5-7 days later, adds a small new update (e.g. "Just shipped feature X"), zero guilt-tripping.
- "thank_you": Genuine, mentions a specific tip they shared, keeps relationship warm.
- "collab_project": Peer-to-peer enthusiasm, complementary skill match, clear vision.

Return ONLY valid JSON matching this schema:
{
  "subjectOptions": ["Subject 1", "Subject 2", "Subject 3"],
  "message": "Full personalized text",
  "alternateVersion": "A differently-angled shorter or bolder version",
  "followUp": "Polite follow-up message to send if no reply in 5-7 days",
  "followUpTiming": "Short advice on when to send this follow-up",
  "missingInfo": ["Item 1 to customize", "Item 2"],
  "tips": ["Tip 1", "Tip 2", "Tip 3"],
  "characterCount": 180
}`;

    const userPrompt = `Generate outreach message with the following student and recipient details:

Scenario: ${scenario}
Message Type: ${messageType}
Tone: ${tone}
Target Length: ${length}
Student Information:
- Name: ${student.name}
- College: ${student.college || 'Not specified'}
- Course & Year: ${student.course || 'Degree'} ${student.year || ''}
- Skills: ${student.skills || 'Not specified'}
- Key Projects: ${student.projects || 'Not specified'}
- Key Achievements: ${student.achievements || 'Not specified'}

Recipient Information:
- Name: ${recipient.name}
- Role / Title: ${recipient.role || 'Not specified'}
- Company / Organization / Institution: ${recipient.company || 'Not specified'}
- Recipient Profile / Experience Notes: ${recipient.profileText || 'None provided'}

Outreach Goal: ${goal || 'Connect and explore potential opportunities'}
Additional Context: ${extraContext || 'None'}
Language Style: ${outputLanguageStyle}

Remember: Return JSON ONLY. Never invent facts. For linkedin_connect, keep the message strictly <= 300 characters.`;

    const checkSimulated = req.headers['x-simulate-error'] === 'true' || req.query.simulateError === 'true';
    const rawAiText = await callAI(systemPrompt, userPrompt, { simulateError: checkSimulated });
    const parsed = cleanAndParseJSON(rawAiText);

    if (parsed.fallbackText) {
      return res.json({
        fallbackText: parsed.fallbackText,
        characterCount: parsed.fallbackText.length
      });
    }

    // Ensure characterCount is calculated accurately
    if (parsed.message) {
      parsed.characterCount = parsed.message.length;
    }

    return res.json(parsed);
  } catch (error) {
    console.error('Error in /api/generate:', error.message);
    return res.status(500).json({
      error: error.message || 'NetworkSathi encountered an error while writing your message. Please try again.'
    });
  }
});

/**
 * POST /api/score
 * Evaluates draft quality and identifies cringe flags, spam risk, and improvements
 */
app.post('/api/score', async (req, res) => {
  try {
    const { text, messageType = 'email', scenario = 'internship' } = req.body || {};

    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ error: 'Please enter or paste your draft message to score.' });
    }

    if (text.length > 5000) {
      return res.status(400).json({ error: 'Draft message exceeds maximum limit of 5000 characters.' });
    }

    const systemPrompt = `You are NetworkSathi, evaluating a student's outreach message as a strict but kind mentor.
Analyze the message for Indian professional context (email, LinkedIn connection note, or LinkedIn DM).

Evaluate on:
1. Clarity (0-10): Is the goal immediately obvious within 5 seconds?
2. Personalization (0-10): Does it show genuine homework, or could this be sent to 500 people?
3. Length (0-10): Is it appropriately concise? (LinkedIn notes must be <= 300 chars, emails <= 150 words).
4. Tone (0-10): Is it polite and confident, without being subservient ("kindly do the needful", "Respected Sir") or entitled?
5. Clear Ask (0-10): Is the call to action small, specific, and frictionless?

Identify:
- "cringeFlags": Any phrases that sound outdated, desperate, generic, or robotic (e.g., "Respected Sir", "kindly do the needful", "I hope this email finds you in good health", "Please give me a chance", "I am a hardworking student").
- "spamRisk": "low", "medium", or "high".
- "whatWorks": 2-3 genuine strengths of the draft.
- "improvements": 2-3 specific, actionable fixes.
- "improvedVersion": A fully rewritten, high-converting version of the message maintaining the student's authentic intent.

Overall score must be 0 to 100 (weighted sum of category scores).

Return ONLY valid JSON matching this schema:
{
  "overallScore": 85,
  "scores": {
    "clarity": 8,
    "personalization": 9,
    "length": 9,
    "tone": 8,
    "clearAsk": 8
  },
  "cringeFlags": ["..."],
  "spamRisk": "low",
  "whatWorks": ["..."],
  "improvements": ["..."],
  "improvedVersion": "..."
}`;

    const userPrompt = `Evaluate the following draft message:

Message Type: ${messageType}
Scenario: ${scenario}
Draft Text:
"""
${text}
"""

Return JSON ONLY.`;

    const checkSimulated = req.headers['x-simulate-error'] === 'true' || req.query.simulateError === 'true';
    const rawAiText = await callAI(systemPrompt, userPrompt, { simulateError: checkSimulated });
    const parsed = cleanAndParseJSON(rawAiText);

    if (parsed.fallbackText) {
      return res.json({ fallbackText: parsed.fallbackText });
    }

    return res.json(parsed);
  } catch (error) {
    console.error('Error in /api/score:', error.message);
    return res.status(500).json({
      error: error.message || 'Failed to score draft. Please try again.'
    });
  }
});

/**
 * POST /api/profile
 * Enhances student's LinkedIn headline and About section
 */
app.post('/api/profile', async (req, res) => {
  try {
    const {
      currentHeadline = '',
      currentAbout = '',
      targetRole = '',
      skills = '',
      projects = ''
    } = req.body || {};

    if (!targetRole || !targetRole.trim()) {
      return res.status(400).json({ error: 'Please enter your Target Role (e.g. SDE Intern, Frontend Developer, Data Analyst).' });
    }

    const lengthErrors = [
      validateStringLength(currentHeadline, 1000, 'currentHeadline'),
      validateStringLength(currentAbout, 3000, 'currentAbout'),
      validateStringLength(targetRole, 1000, 'targetRole'),
      validateStringLength(skills, 1000, 'skills'),
      validateStringLength(projects, 1000, 'projects')
    ].filter(Boolean);

    if (lengthErrors.length > 0) {
      return res.status(400).json({ error: lengthErrors[0] });
    }

    const systemPrompt = `You are NetworkSathi, an expert career mentor for Indian college students.
Help the student boost their LinkedIn profile so that recruiters, founders, and alumni take them seriously when they reach out.

Guidelines:
- 3 Headline Options: Each strictly under 120 characters. Include target role keywords, key tech or domain, and a differentiator. Avoid buzzword stuffing (no "aspiring ninja", "passionate learner", or emoji overload).
- Improved About Section: Under 1800 characters. First person ("I"), authentic and conversational. Starts with a strong hook (what problem they love solving), mentions concrete projects/skills, shows curiosity, and ends with what they are looking for (e.g. 2026 internships, research collabs, or entry-level roles) with a contact CTA.
- 5 Skills to Highlight: 5 high-demand, relevant technical and professional skills for the target role.
- 3 Quick Profile Tips: Specific, actionable Indian student advice (e.g., featured section, custom URL, banner, recommendations).
- NEVER invent experience or fake achievements.

Return ONLY valid JSON with this exact schema:
{
  "headlineOptions": ["Headline 1", "Headline 2", "Headline 3"],
  "improvedAbout": "...",
  "skillsToHighlight": ["Skill 1", "Skill 2", "Skill 3", "Skill 4", "Skill 5"],
  "profileTips": ["Tip 1", "Tip 2", "Tip 3"]
}`;

    const userPrompt = `Help improve LinkedIn profile for this student:

Target Role: ${targetRole}
Current Headline: ${currentHeadline || 'None provided'}
Current About Section: ${currentAbout || 'None provided'}
Key Skills: ${skills || 'Not specified'}
Projects / Experience: ${projects || 'Not specified'}

Return JSON ONLY.`;

    const checkSimulated = req.headers['x-simulate-error'] === 'true' || req.query.simulateError === 'true';
    const rawAiText = await callAI(systemPrompt, userPrompt, { simulateError: checkSimulated });
    const parsed = cleanAndParseJSON(rawAiText);

    if (parsed.fallbackText) {
      return res.json({ fallbackText: parsed.fallbackText });
    }

    return res.json(parsed);
  } catch (error) {
    console.error('Error in /api/profile:', error.message);
    return res.status(500).json({
      error: error.message || 'Failed to generate profile boost. Please try again.'
    });
  }
});

// Generic 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({ error: 'Resource not found' });
});

// Global error handler - never leaks stack traces
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ error: 'An unexpected internal server error occurred.' });
});

// Start Server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`NetworkSathi Server is running on http://localhost:${PORT}`);
    console.log(`Tagline: "Sahi message, sahi mauka."`);
    console.log(`Active Model: ${AI_MODEL}`);
    console.log(`Gemini Key Configured: ${Boolean(GEMINI_API_KEY && GEMINI_API_KEY !== 'your_gemini_api_key_here')}`);
    console.log(`====================================================`);
  });
}

module.exports = { app, callAI, cleanAndParseJSON };
