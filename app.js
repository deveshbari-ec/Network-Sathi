/**
 * NetworkSathi - Frontend Controller
 * Plain Vanilla JavaScript | Zero Build Step
 */

document.addEventListener('DOMContentLoaded', () => {
  // =========================================================================
  // STATE MANAGEMENT
  // =========================================================================
  const state = {
    theme: 'light',
    activeTab: 'tab-write',
    activeScenario: 'internship',
    sessionHistory: [], // Max 5 items in memory
    currentGeneratedResult: null,
    rotatingInterval: null
  };

  // Rotating loading messages
  const ROTATING_MESSAGES = [
    'NetworkSathi is writing your message...',
    'Checking tone for Indian professional context...',
    'Ensuring zero clichés and no begging...',
    'Polishing high-open-rate subject lines...',
    'Checking character constraints and formatting...',
    'Making it sound like an authentic human...'
  ];

  // Sample datasets for all 8 scenarios
  const SCENARIO_SAMPLES = {
    internship: {
      student: {
        name: 'Aryan Sharma',
        college: 'SRM Institute of Science and Technology',
        course: 'BTech CSE',
        year: '3rd Year',
        skills: 'React.js, Node.js, Express, PostgreSQL, Tailwind CSS, REST APIs',
        projects: 'Built "DevCollab", a real-time collaborative code editor with WebSockets; 200+ stars on GitHub and 400 active monthly users.',
        achievements: 'Smart India Hackathon 2025 finalist, 400+ LeetCode problems solved'
      },
      recipient: {
        name: 'Siddharth Rao',
        role: 'Co-founder & CTO',
        company: 'Khatabook',
        profileText: 'Building financial software for 10M+ Indian MSMEs. Passionate about developer tooling, clean architectures, and mentoring early-career talent.'
      },
      goal: 'Explore 3-month Summer 2026 Software Engineering Internship openings',
      extraContext: 'Read his recent LinkedIn post about refactoring their transaction microservices.',
      messageType: 'email',
      tone: 'professional',
      length: 'short'
    },
    referral: {
      student: {
        name: 'Sneha Patel',
        college: 'Delhi Technological University (DTU)',
        course: 'BTech Information Technology',
        year: 'Final Year',
        skills: 'Java, Spring Boot, Microservices, Kafka, Redis, AWS, Docker',
        projects: 'Designed high-throughput distributed payment queue handling 1,500 req/sec with Apache Kafka and Redis caching.',
        achievements: 'Secured 3rd rank in DTU Coding Olympiad, AWS Certified Cloud Practitioner'
      },
      recipient: {
        name: 'Rohan Verma',
        role: 'Senior Software Engineer',
        company: 'Atlassian India',
        profileText: 'DTU 2021 Alum. Working on Jira Cloud infrastructure. Love connecting with fellow DTU engineers.'
      },
      goal: 'Referral for Graduate Software Engineer role (Job ID: #ATL-9042)',
      extraContext: 'DTU alum connection; Job ID is already active on Atlassian Careers portal.',
      messageType: 'linkedin_dm',
      tone: 'friendly',
      length: 'short'
    },
    research_professor: {
      student: {
        name: 'Karthik Raman',
        college: 'Vellore Institute of Technology (VIT)',
        course: 'BTech Computer Science',
        year: '3rd Year',
        skills: 'Python, PyTorch, HuggingFace Transformers, NumPy, NLP, FastHTML',
        projects: 'Fine-tuned Llama-3 on Indic multilingual datasets for Hindi & Tamil clinical summarization with 0.84 ROUGE score.',
        achievements: 'Coursework: Machine Learning (Grade: 10/10), Natural Language Processing (Grade: 9/10)'
      },
      recipient: {
        name: 'Prof. Anirban Sen',
        role: 'Associate Professor & Lab Director',
        company: 'Department of Computer Science & Engineering, IIT Bombay',
        profileText: 'Director of the Multimodal AI Lab at IITB. Focus areas: Low-resource Indian NLP, Speech processing, and Cross-lingual Embeddings.'
      },
      goal: 'Inquire about prospective Summer 2026 Research Internship / Project Assistant openings in his lab',
      extraContext: 'Read his recent 2025 paper "Sub-word tokenization challenges in Dravidian Languages" published in ACL.',
      messageType: 'email',
      tone: 'formal',
      length: 'medium'
    },
    alumni_advice: {
      student: {
        name: 'Ananya Mukherjee',
        college: 'Thapar Institute of Engineering & Technology',
        course: 'BTech CSE',
        year: '2nd Year',
        skills: 'Python, SQL, Tableau, Power BI, Statistics, Data Modeling',
        projects: 'Analyzed 500,000 Zepto delivery records to identify urban delivery route bottlenecks and presented insights in interactive dashboard.',
        achievements: 'Lead organizer at Thapar Analytics Society'
      },
      recipient: {
        name: 'Vikram Joshi',
        role: 'Product Analyst',
        company: 'Swiggy',
        profileText: 'Thapar 2022 batch. Transitioned from college electronics background to product analytics at Swiggy.'
      },
      goal: '15-minute quick chat or advice on transitioning from college to top product analytics roles',
      extraContext: 'Shared Thapar alma mater; saw his recent talk on behavioral metrics.',
      messageType: 'linkedin_connect',
      tone: 'friendly',
      length: 'short'
    },
    recruiter: {
      student: {
        name: 'Devansh Tiwari',
        college: 'Jadavpur University',
        course: 'BTech Information Technology',
        year: 'Final Year',
        skills: 'Go, Kubernetes, Docker, PostgreSQL, gRPC, Prometheus',
        projects: 'Built container health monitoring agent in Go with under 20MB RAM footprint; integrated with Prometheus metrics.',
        achievements: 'Google Summer of Code (GSoC) 2025 Contributor'
      },
      recipient: {
        name: 'Megha Kapoor',
        role: 'Tech Talent Acquisition Lead',
        company: 'Razorpay',
        profileText: 'Hiring software engineers, backend ninjas, and infrastructure builders across India for Razorpay Banking Platform.'
      },
      goal: 'Explore entry-level Backend Engineer openings for 2026 graduating batch',
      extraContext: 'Available to join as full-time engineer starting July 2026 or 6-month intern from Jan 2026.',
      messageType: 'email',
      tone: 'professional',
      length: 'short'
    },
    follow_up: {
      student: {
        name: 'Aryan Sharma',
        college: 'SRM IST',
        course: 'BTech CSE',
        year: '3rd Year',
        skills: 'React.js, Node.js, PostgreSQL',
        projects: 'Shipped v2.0 of DevCollab with OAuth2 and Redis session storage.',
        achievements: 'Winner of HackVIT 2025'
      },
      recipient: {
        name: 'Siddharth Rao',
        role: 'Co-founder & CTO',
        company: 'Khatabook',
        profileText: 'CTO Khatabook. Reached out 6 days ago regarding SDE intern role.'
      },
      goal: 'Gentle follow-up on previous cold email sent 6 days ago',
      extraContext: 'Just launched v2.0 with Redis integration which relates to the scalability points discussed in his podcast.',
      messageType: 'email',
      tone: 'professional',
      length: 'short'
    },
    thank_you: {
      student: {
        name: 'Sneha Patel',
        college: 'DTU',
        course: 'BTech IT',
        year: 'Final Year',
        skills: 'Java, Spring Boot, Microservices',
        projects: 'Distributed payment queue in Kafka',
        achievements: 'DTU Coding Olympiad Rank 3'
      },
      recipient: {
        name: 'Rohan Verma',
        role: 'Senior Software Engineer',
        company: 'Atlassian India',
        profileText: 'Had a 20-minute mentor chat yesterday about Jira backend systems and interview preparation.'
      },
      goal: 'Express gratitude for the 20-minute mentorship call and specific guidance on distributed tracing',
      extraContext: 'He recommended reading "Designing Data-Intensive Applications" chapter 6.',
      messageType: 'linkedin_dm',
      tone: 'friendly',
      length: 'short'
    },
    collab_project: {
      student: {
        name: 'Rishi Mehta',
        college: 'BITS Pilani (Goa Campus)',
        course: 'BTech Computer Science',
        year: '2nd Year',
        skills: 'Next.js, Tailwind CSS, TypeScript, Supabase, UI/UX Design',
        projects: 'Created design system used by 3 campus club websites; won Best UI at BITS Hackathon.',
        achievements: 'Active open source designer & developer'
      },
      recipient: {
        name: 'Tanmay Kulkarni',
        role: 'AI / ML Developer & Student',
        company: 'COEP Pune',
        profileText: 'Building agentic AI tools and LLM wrappers. Looking for strong frontend collaborator for upcoming global AI hackathon.'
      },
      goal: 'Propose teaming up for the upcoming AI Hackathon (March 2026)',
      extraContext: 'Saw his viral GitHub repository on agentic workflow visualizer; my frontend and UI skills complement his ML backend.',
      messageType: 'linkedin_connect',
      tone: 'friendly',
      length: 'short'
    }
  };

  // =========================================================================
  // DOM ELEMENT REFERENCES
  // =========================================================================
  const elements = {
    // Theme & Header
    themeToggle: document.getElementById('theme-toggle'),
    historyBtn: document.getElementById('history-btn'),
    historyCountBadge: document.getElementById('history-count'),
    historyDrawer: document.getElementById('history-drawer'),
    drawerBackdrop: document.getElementById('drawer-backdrop'),
    closeHistoryBtn: document.getElementById('close-history-btn'),
    historyItemsList: document.getElementById('history-items-list'),

    // Nav Tabs
    navTabs: document.querySelectorAll('.nav-tab'),
    tabPanels: document.querySelectorAll('.tab-panel'),

    // Alerts & Toasts
    globalAlert: document.getElementById('global-alert'),
    globalAlertText: document.getElementById('global-alert-text'),
    alertDismiss: document.getElementById('alert-dismiss'),
    toastContainer: document.getElementById('toast-container'),

    // Write Message Form
    scenarioButtons: document.querySelectorAll('.scenario-btn'),
    writeForm: document.getElementById('write-form'),
    studentName: document.getElementById('student-name'),
    studentCollege: document.getElementById('student-college'),
    studentCourse: document.getElementById('student-course'),
    studentYear: document.getElementById('student-year'),
    studentSkills: document.getElementById('student-skills'),
    studentProjects: document.getElementById('student-projects'),
    studentAchievements: document.getElementById('student-achievements'),
    recipientName: document.getElementById('recipient-name'),
    recipientRole: document.getElementById('recipient-role'),
    lblRecipientRole: document.getElementById('lbl-recipient-role'),
    recipientCompany: document.getElementById('recipient-company'),
    lblRecipientCompany: document.getElementById('lbl-recipient-company'),
    recipientProfile: document.getElementById('recipient-profile'),
    profileCharCount: document.getElementById('profile-char-count'),
    outreachGoal: document.getElementById('outreach-goal'),
    lblOutreachGoal: document.getElementById('lbl-outreach-goal'),
    goalHelper: document.getElementById('goal-helper'),
    extraContext: document.getElementById('extra-context'),

    // Form buttons
    btnSampleData: document.getElementById('btn-sample-data'),
    btnClearForm: document.getElementById('btn-clear-form'),
    btnGenerate: document.getElementById('btn-generate'),
    genBtnText: document.getElementById('gen-btn-text'),
    genSpinner: document.getElementById('gen-spinner'),
    mobileBtnGenerate: document.getElementById('mobile-btn-generate'),

    // Loader & Output
    generationLoader: document.getElementById('generation-loader'),
    loaderStatusText: document.getElementById('loader-status-text'),
    outputSection: document.getElementById('output-section'),
    outputMetaStats: document.getElementById('output-meta-stats'),
    linkedinWarningBadge: document.getElementById('linkedin-warning-badge'),
    subjectOptionsContainer: document.getElementById('subject-options-container'),
    subjectChips: document.getElementById('subject-chips'),
    outputMessageText: document.getElementById('output-message-text'),

    // Output Actions
    btnCopyMessage: document.getElementById('btn-copy-message'),
    copyBtnText: document.getElementById('copy-btn-text'),
    btnOpenEmail: document.getElementById('btn-open-email'),
    btnScoreThis: document.getElementById('btn-score-this'),
    btnToggleAlternate: document.getElementById('btn-toggle-alternate'),
    btnRegenerate: document.getElementById('btn-regenerate'),
    alternateVersionBox: document.getElementById('alternate-version-box'),
    alternateVersionText: document.getElementById('alternate-version-text'),
    btnCopyAlternate: document.getElementById('btn-copy-alternate'),
    missingInfoBox: document.getElementById('missing-info-box'),
    missingInfoList: document.getElementById('missing-info-list'),
    toggleFollowupBtn: document.getElementById('toggle-followup-btn'),
    followupContent: document.getElementById('followup-content'),
    followupTimingText: document.getElementById('followup-timing-text'),
    followupMessageText: document.getElementById('followup-message-text'),
    btnCopyFollowup: document.getElementById('btn-copy-followup'),
    coachingTipsList: document.getElementById('coaching-tips-list'),
    fallbackBox: document.getElementById('fallback-box'),
    fallbackTextContent: document.getElementById('fallback-text-content'),

    // Score Tab
    scoreMsgType: document.getElementById('score-msg-type'),
    scoreScenario: document.getElementById('score-scenario'),
    scoreInputText: document.getElementById('score-input-text'),
    scoreInputChars: document.getElementById('score-input-chars'),
    btnLoadBadSample: document.getElementById('btn-load-bad-sample'),
    btnRunScore: document.getElementById('btn-run-score'),
    scoreBtnText: document.getElementById('score-btn-text'),
    scoreSpinner: document.getElementById('score-spinner'),
    scoreResultsCard: document.getElementById('score-results-card'),
    overallScoreCircle: document.getElementById('overall-score-circle'),
    overallScoreNum: document.getElementById('overall-score-num'),
    scoreVerdictTitle: document.getElementById('score-verdict-title'),
    spamRiskBadge: document.getElementById('spam-risk-badge'),
    cringeFlagsCard: document.getElementById('cringe-flags-card'),
    cringeFlagsList: document.getElementById('cringe-flags-list'),
    whatWorksList: document.getElementById('what-works-list'),
    improvementsList: document.getElementById('improvements-list'),
    improvedVersionText: document.getElementById('improved-version-text'),
    btnCopyImproved: document.getElementById('btn-copy-improved'),

    // Pillar elements
    barClarity: document.getElementById('bar-clarity'),
    scoreValClarity: document.getElementById('score-val-clarity'),
    barPersonalization: document.getElementById('bar-personalization'),
    scoreValPersonalization: document.getElementById('score-val-personalization'),
    barLength: document.getElementById('bar-length'),
    scoreValLength: document.getElementById('score-val-length'),
    barTone: document.getElementById('bar-tone'),
    scoreValTone: document.getElementById('score-val-tone'),
    barClearAsk: document.getElementById('bar-clearAsk'),
    scoreValClearAsk: document.getElementById('score-val-clearAsk'),

    // Profile Tab
    profTargetRole: document.getElementById('prof-target-role'),
    profSkills: document.getElementById('prof-skills'),
    profProjects: document.getElementById('prof-projects'),
    profCurrentHeadline: document.getElementById('prof-current-headline'),
    profCurrentAbout: document.getElementById('prof-current-about'),
    btnSampleProfile: document.getElementById('btn-sample-profile'),
    btnRunProfile: document.getElementById('btn-run-profile'),
    profBtnText: document.getElementById('prof-btn-text'),
    profSpinner: document.getElementById('prof-spinner'),
    profileResultsCard: document.getElementById('profile-results-card'),
    headlineOptionsList: document.getElementById('headline-options-list'),
    improvedAboutText: document.getElementById('improved-about-text'),
    aboutCharCounter: document.getElementById('about-char-counter'),
    btnCopyAbout: document.getElementById('btn-copy-about'),
    skillsChipsList: document.getElementById('skills-chips-list'),
    profileTipsList: document.getElementById('profile-tips-list')
  };

  // =========================================================================
  // THEME MANAGEMENT (localStorage wrapped in try/catch)
  // =========================================================================
  function initTheme() {
    let savedTheme = null;
    try {
      savedTheme = localStorage.getItem('networksathi-theme');
    } catch (e) {
      console.warn('localStorage unavailable for theme preference');
    }

    if (savedTheme === 'dark' || savedTheme === 'light') {
      state.theme = savedTheme;
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      state.theme = 'dark';
    } else {
      state.theme = 'light';
    }

    applyTheme(state.theme);
  }

  function applyTheme(theme) {
    document.body.setAttribute('data-theme', theme);
    state.theme = theme;
    try {
      localStorage.setItem('networksathi-theme', theme);
    } catch (e) {
      // Ignored safely
    }
  }

  elements.themeToggle.addEventListener('click', () => {
    const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme);
    showToast(`Switched to ${nextTheme} mode`);
  });

  // =========================================================================
  // NAVIGATION TABS
  // =========================================================================
  function switchTab(tabId) {
    state.activeTab = tabId;

    elements.navTabs.forEach(tab => {
      const isTarget = tab.dataset.tab === tabId;
      tab.classList.toggle('active', isTarget);
      tab.setAttribute('aria-selected', isTarget ? 'true' : 'false');
    });

    elements.tabPanels.forEach(panel => {
      const isTarget = panel.id === tabId;
      panel.classList.toggle('active', isTarget);
    });

    // Update mobile bar label depending on active tab
    if (tabId === 'tab-write') {
      elements.mobileBtnGenerate.textContent = 'Generate Message';
    } else if (tabId === 'tab-score') {
      elements.mobileBtnGenerate.textContent = 'Analyze & Score Draft';
    } else if (tabId === 'tab-profile') {
      elements.mobileBtnGenerate.textContent = 'Boost LinkedIn Profile';
    } else {
      elements.mobileBtnGenerate.textContent = 'Write Message';
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  elements.navTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      switchTab(tab.dataset.tab);
    });
  });

  // Mobile quick action button trigger
  elements.mobileBtnGenerate.addEventListener('click', () => {
    if (state.activeTab === 'tab-write') {
      elements.writeForm.requestSubmit();
    } else if (state.activeTab === 'tab-score') {
      elements.btnRunScore.click();
    } else if (state.activeTab === 'tab-profile') {
      elements.btnRunProfile.click();
    } else {
      switchTab('tab-write');
    }
  });

  // =========================================================================
  // SCENARIO PICKER & DYNAMIC LABELS
  // =========================================================================
  function selectScenario(scenarioKey) {
    state.activeScenario = scenarioKey;

    elements.scenarioButtons.forEach(btn => {
      const isSelected = btn.dataset.scenario === scenarioKey;
      btn.classList.toggle('active', isSelected);
      btn.setAttribute('aria-checked', isSelected ? 'true' : 'false');
    });

    // Update dynamic hints and labels based on scenario
    if (scenarioKey === 'research_professor') {
      elements.lblRecipientRole.textContent = 'Department / Lab / Research Area';
      elements.recipientRole.placeholder = 'e.g. Dept of CSE / Multimodal AI Lab';
      elements.lblRecipientCompany.textContent = 'University / Institute Name *';
      elements.recipientCompany.placeholder = 'e.g. IIT Bombay / IISc Bangalore / CMU';
      elements.lblOutreachGoal.textContent = 'Research Interest / Inquired Opening *';
      elements.outreachGoal.placeholder = 'e.g. Inquire about summer research assistant opening in low-resource NLP';
      elements.goalHelper.textContent = 'Academic faculty appreciate students who know what their lab investigates.';
      // Default to formal and medium for professors
      setRadioValue('tone', 'formal');
      setRadioValue('length', 'medium');
    } else if (scenarioKey === 'referral') {
      elements.lblRecipientRole.textContent = 'Their Role / Team';
      elements.recipientRole.placeholder = 'e.g. Senior Software Engineer / SDE-2';
      elements.lblRecipientCompany.textContent = 'Company Name *';
      elements.recipientCompany.placeholder = 'e.g. Atlassian / Swiggy / Google';
      elements.lblOutreachGoal.textContent = 'Target Job Title & Job ID / Link *';
      elements.outreachGoal.placeholder = 'e.g. Referral for Graduate Engineer (Req #8942) or SDE-1';
      elements.goalHelper.textContent = 'Always include the exact Job ID so the referrer can submit your profile in 60 seconds.';
      setRadioValue('tone', 'professional');
      setRadioValue('length', 'short');
    } else if (scenarioKey === 'follow_up') {
      elements.lblRecipientRole.textContent = 'Recipient Designation';
      elements.recipientRole.placeholder = 'e.g. Engineering Manager';
      elements.lblRecipientCompany.textContent = 'Company / Organization';
      elements.recipientCompany.placeholder = 'e.g. Razorpay';
      elements.lblOutreachGoal.textContent = 'Context of Previous Message & Update *';
      elements.outreachGoal.placeholder = 'e.g. Follow up on note sent 6 days ago regarding SDE intern; shipped v2';
      elements.goalHelper.textContent = 'Wait 5-7 business days. Adding a small new project milestone increases reply rate.';
      setRadioValue('tone', 'professional');
      setRadioValue('length', 'short');
    } else if (scenarioKey === 'thank_you') {
      elements.lblRecipientRole.textContent = 'Recipient Designation';
      elements.lblRecipientCompany.textContent = 'Company / Organization';
      elements.lblOutreachGoal.textContent = 'What are you thanking them for? *';
      elements.outreachGoal.placeholder = 'e.g. 20-min mentorship chat on distributed systems and career advice';
      elements.goalHelper.textContent = 'Mention one specific insight or takeaway from your conversation.';
      setRadioValue('tone', 'friendly');
      setRadioValue('length', 'short');
    } else if (scenarioKey === 'alumni_advice') {
      elements.lblRecipientRole.textContent = 'Their Current Designation';
      elements.lblRecipientCompany.textContent = 'Company Name';
      elements.lblOutreachGoal.textContent = 'Specific Advice or 15-min Call Ask *';
      elements.outreachGoal.placeholder = 'e.g. 15-minute quick call on navigating campus placement for product firms';
      elements.goalHelper.textContent = 'Seniors love helping juniors from their alma mater when the ask is respectful and brief.';
      setRadioValue('tone', 'friendly');
      setRadioValue('length', 'short');
    } else {
      // Default reset
      elements.lblRecipientRole.textContent = 'Designation / Role';
      elements.recipientRole.placeholder = 'e.g. Engineering Manager / SDE-2';
      elements.lblRecipientCompany.textContent = 'Company / Organization / University';
      elements.recipientCompany.placeholder = 'e.g. Razorpay / Swiggy / IIT Delhi';
      elements.lblOutreachGoal.textContent = 'Your Specific Ask / Goal *';
      elements.outreachGoal.placeholder = 'e.g. Referral for SDE Intern or 15-min chat about product engineering';
      elements.goalHelper.textContent = 'Make the ask small, clear, and easy to say yes or no to.';
      setRadioValue('tone', 'professional');
      setRadioValue('length', 'short');
    }
  }

  elements.scenarioButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      selectScenario(btn.dataset.scenario);
    });
  });

  function setRadioValue(name, val) {
    const radio = document.querySelector(`input[name="${name}"][value="${val}"]`);
    if (radio) radio.checked = true;
  }

  function getRadioValue(name) {
    const radio = document.querySelector(`input[name="${name}"]:checked`);
    return radio ? radio.value : null;
  }

  // Profile text live counter
  elements.recipientProfile.addEventListener('input', () => {
    const len = elements.recipientProfile.value.length;
    elements.profileCharCount.textContent = `${len} / 3000`;
  });

  // Score text live counter
  elements.scoreInputText.addEventListener('input', () => {
    const len = elements.scoreInputText.value.length;
    elements.scoreInputChars.textContent = `${len} / 5000`;
  });

  // =========================================================================
  // SAMPLE DATA POPULATOR
  // =========================================================================
  elements.btnSampleData.addEventListener('click', () => {
    clearFieldErrors();
    const sample = SCENARIO_SAMPLES[state.activeScenario] || SCENARIO_SAMPLES.internship;

    elements.studentName.value = sample.student.name;
    elements.studentCollege.value = sample.student.college;
    elements.studentCourse.value = sample.student.course;
    elements.studentYear.value = sample.student.year;
    elements.studentSkills.value = sample.student.skills;
    elements.studentProjects.value = sample.student.projects;
    elements.studentAchievements.value = sample.student.achievements;

    elements.recipientName.value = sample.recipient.name;
    elements.recipientRole.value = sample.recipient.role;
    elements.recipientCompany.value = sample.recipient.company;
    elements.recipientProfile.value = sample.recipient.profileText;
    elements.profileCharCount.textContent = `${sample.recipient.profileText.length} / 3000`;

    elements.outreachGoal.value = sample.goal;
    elements.extraContext.value = sample.extraContext;

    setRadioValue('messageType', sample.messageType);
    setRadioValue('tone', sample.tone);
    setRadioValue('length', sample.length);

    showToast(`Loaded sample data for "${formatScenarioName(state.activeScenario)}"`);
  });

  // Clear Form Button
  elements.btnClearForm.addEventListener('click', () => {
    elements.writeForm.reset();
    clearFieldErrors();
    elements.profileCharCount.textContent = '0 / 3000';
    elements.outputSection.classList.add('hidden');
    showToast('Form cleared');
  });

  // =========================================================================
  // VALIDATION & FIELD ERRORS
  // =========================================================================
  function clearFieldErrors() {
    document.querySelectorAll('.field-error').forEach(el => el.textContent = '');
    document.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
    hideGlobalAlert();
  }

  function setFieldError(fieldElement, errorElementId, message) {
    if (fieldElement) {
      fieldElement.classList.add('input-error');
      fieldElement.focus();
    }
    const errEl = document.getElementById(errorElementId);
    if (errEl) {
      errEl.textContent = message;
    }
  }

  function validateWriteForm() {
    clearFieldErrors();

    const name = elements.studentName.value.trim();
    if (!name) {
      setFieldError(elements.studentName, 'err-student-name', 'Please provide your full name.');
      return false;
    }

    const rName = elements.recipientName.value.trim();
    if (!rName) {
      setFieldError(elements.recipientName, 'err-recipient-name', 'Please provide the recipient\'s name or title.');
      return false;
    }

    const scenario = state.activeScenario;
    const rCompany = elements.recipientCompany.value.trim();
    const goal = elements.outreachGoal.value.trim();

    if (scenario === 'research_professor' && !rCompany) {
      setFieldError(elements.recipientCompany, 'err-recipient-company', 'Please specify the University or Institute name.');
      return false;
    }

    if (scenario === 'referral' && (!rCompany || !goal)) {
      if (!rCompany) {
        setFieldError(elements.recipientCompany, 'err-recipient-company', 'Please specify the company for the referral.');
        return false;
      }
      if (!goal) {
        setFieldError(elements.outreachGoal, 'err-outreach-goal', 'Please provide target role & Job ID.');
        return false;
      }
    }

    if (!goal) {
      setFieldError(elements.outreachGoal, 'err-outreach-goal', 'Please describe your specific goal or ask.');
      return false;
    }

    return true;
  }

  // =========================================================================
  // FORM SUBMISSION & GENERATION (/api/generate)
  // =========================================================================
  elements.writeForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validateWriteForm()) return;

    const payload = {
      scenario: state.activeScenario,
      messageType: getRadioValue('messageType') || 'email',
      tone: getRadioValue('tone') || 'professional',
      length: getRadioValue('length') || 'short',
      student: {
        name: elements.studentName.value.trim(),
        college: elements.studentCollege.value.trim(),
        course: elements.studentCourse.value.trim(),
        year: elements.studentYear.value,
        skills: elements.studentSkills.value.trim(),
        projects: elements.studentProjects.value.trim(),
        achievements: elements.studentAchievements.value.trim()
      },
      recipient: {
        name: elements.recipientName.value.trim(),
        role: elements.recipientRole.value.trim(),
        company: elements.recipientCompany.value.trim(),
        profileText: elements.recipientProfile.value.trim()
      },
      goal: elements.outreachGoal.value.trim(),
      extraContext: elements.extraContext.value.trim()
    };

    setGeneratingState(true);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Server error (${response.status})`);
      }

      state.currentGeneratedResult = { ...data, payload, timestamp: new Date() };
      renderGeneratedOutput(data, payload.messageType);
      saveToSessionHistory(state.currentGeneratedResult);
      showToast('Message generated successfully!');

      // Smooth scroll to output card
      setTimeout(() => {
        elements.outputSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);

    } catch (err) {
      console.error('Generation failed:', err);
      showGlobalAlert(err.message || 'NetworkSathi could not complete your request. Please check server or retry.', 'danger');
    } finally {
      setGeneratingState(false);
    }
  });

  function setGeneratingState(isGenerating) {
    elements.btnGenerate.disabled = isGenerating;
    elements.mobileBtnGenerate.disabled = isGenerating;
    elements.genSpinner.classList.toggle('hidden', !isGenerating);
    elements.genBtnText.textContent = isGenerating ? 'NetworkSathi is writing...' : 'Generate Message with NetworkSathi';

    if (isGenerating) {
      elements.generationLoader.classList.remove('hidden');
      elements.outputSection.classList.add('hidden');
      hideGlobalAlert();

      let msgIndex = 0;
      elements.loaderStatusText.textContent = ROTATING_MESSAGES[0];
      state.rotatingInterval = setInterval(() => {
        msgIndex = (msgIndex + 1) % ROTATING_MESSAGES.length;
        elements.loaderStatusText.textContent = ROTATING_MESSAGES[msgIndex];
      }, 1800);
    } else {
      elements.generationLoader.classList.add('hidden');
      if (state.rotatingInterval) {
        clearInterval(state.rotatingInterval);
        state.rotatingInterval = null;
      }
    }
  }

  // =========================================================================
  // RENDER GENERATED OUTPUT
  // =========================================================================
  function renderGeneratedOutput(data, messageType) {
    elements.outputSection.classList.remove('hidden');

    // Subject Lines (Only relevant for email)
    if (messageType === 'email' && Array.isArray(data.subjectOptions) && data.subjectOptions.length > 0) {
      elements.subjectOptionsContainer.classList.remove('hidden');
      elements.subjectChips.innerHTML = '';

      data.subjectOptions.forEach((subj, idx) => {
        const chip = document.createElement('div');
        chip.className = `subject-chip ${idx === 0 ? 'selected' : ''}`;
        chip.innerHTML = `
          <span class="subject-text">${escapeHtml(subj)}</span>
          <button type="button" class="subject-copy-action" title="Copy subject line">Copy</button>
        `;

        chip.addEventListener('click', (e) => {
          if (e.target.classList.contains('subject-copy-action')) {
            navigator.clipboard.writeText(subj).then(() => showToast('Subject line copied!'));
            e.stopPropagation();
          } else {
            document.querySelectorAll('.subject-chip').forEach(c => c.classList.remove('selected'));
            chip.classList.add('selected');
          }
        });

        elements.subjectChips.appendChild(chip);
      });
    } else {
      elements.subjectOptionsContainer.classList.add('hidden');
    }

    // Main Message
    const msg = data.message || data.fallbackText || '';
    elements.outputMessageText.value = msg;
    updateLiveOutputStats(msg, messageType);

    // Alternate version
    if (data.alternateVersion && data.alternateVersion.trim()) {
      elements.alternateVersionText.textContent = data.alternateVersion;
      elements.btnToggleAlternate.classList.remove('hidden');
      elements.alternateVersionBox.classList.add('hidden'); // collapsed by default
      elements.btnToggleAlternate.textContent = 'Show Alternate Angle';
    } else {
      elements.btnToggleAlternate.classList.add('hidden');
      elements.alternateVersionBox.classList.add('hidden');
    }

    // Missing Info Checklist
    if (Array.isArray(data.missingInfo) && data.missingInfo.length > 0) {
      elements.missingInfoBox.classList.remove('hidden');
      elements.missingInfoList.innerHTML = data.missingInfo.map(item =>
        `<li class="checklist-item">${escapeHtml(item)}</li>`
      ).join('');
    } else {
      elements.missingInfoBox.classList.add('hidden');
    }

    // Follow-up Section
    if (data.followUp && data.followUp.trim()) {
      elements.followupMessageText.value = data.followUp;
      elements.followupTimingText.textContent = data.followUpTiming || 'Wait 5-7 business days before sending.';
      elements.followupContent.classList.add('hidden');
      elements.toggleFollowupBtn.setAttribute('aria-expanded', 'false');
    }

    // Coaching Tips
    if (Array.isArray(data.tips) && data.tips.length > 0) {
      elements.coachingTipsList.innerHTML = data.tips.map(tip =>
        `<li>${escapeHtml(tip)}</li>`
      ).join('');
    } else {
      elements.coachingTipsList.innerHTML = `
        <li>Personalize the opening hook with something specific to their team or work.</li>
        <li>Always double check links and portfolio URLs before hitting send.</li>
        <li>Never mass-email 10 employees at the same company simultaneously.</li>
      `;
    }

    // Fallback display if AI returned non-JSON raw text
    if (data.fallbackText) {
      elements.fallbackBox.classList.remove('hidden');
      elements.fallbackTextContent.textContent = data.fallbackText;
    } else {
      elements.fallbackBox.classList.add('hidden');
    }
  }

  // Live Stats Updater on Output Textarea
  function updateLiveOutputStats(text, messageType) {
    const chars = text.length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    elements.outputMetaStats.textContent = `${words} words | ${chars} characters`;

    // 300-character constraint for LinkedIn connection note
    if (messageType === 'linkedin_connect' && chars > 300) {
      elements.linkedinWarningBadge.classList.remove('hidden');
      elements.linkedinWarningBadge.textContent = `⚠️ Exceeds 300 character limit (${chars}/300 chars)`;
    } else {
      elements.linkedinWarningBadge.classList.add('hidden');
    }
  }

  elements.outputMessageText.addEventListener('input', () => {
    const currentMsgType = getRadioValue('messageType') || 'email';
    updateLiveOutputStats(elements.outputMessageText.value, currentMsgType);
  });

  // Toggle Alternate Version
  elements.btnToggleAlternate.addEventListener('click', () => {
    const isHidden = elements.alternateVersionBox.classList.contains('hidden');
    elements.alternateVersionBox.classList.toggle('hidden', !isHidden);
    elements.btnToggleAlternate.textContent = isHidden ? 'Hide Alternate Angle' : 'Show Alternate Angle';
  });

  elements.btnCopyAlternate.addEventListener('click', () => {
    const text = elements.alternateVersionText.textContent;
    navigator.clipboard.writeText(text).then(() => showToast('Copied alternate version!'));
  });

  // Toggle Collapsible Follow-up
  elements.toggleFollowupBtn.addEventListener('click', () => {
    const isExpanded = elements.toggleFollowupBtn.getAttribute('aria-expanded') === 'true';
    elements.toggleFollowupBtn.setAttribute('aria-expanded', isExpanded ? 'false' : 'true');
    elements.followupContent.classList.toggle('hidden', isExpanded);
  });

  elements.btnCopyFollowup.addEventListener('click', () => {
    const text = elements.followupMessageText.value;
    navigator.clipboard.writeText(text).then(() => showToast('Copied follow-up message!'));
  });

  // Output Action: Copy Message
  elements.btnCopyMessage.addEventListener('click', () => {
    const text = elements.outputMessageText.value;
    if (!text) return;

    navigator.clipboard.writeText(text).then(() => {
      elements.copyBtnText.textContent = 'Copied!';
      showToast('Message copied to clipboard!');
      setTimeout(() => {
        elements.copyBtnText.textContent = 'Copy Message';
      }, 2000);
    }).catch(() => {
      showToast('Could not auto-copy. Please select and copy manually.');
    });
  });

  // Output Action: Open in Email App (mailto link)
  elements.btnOpenEmail.addEventListener('click', () => {
    const body = elements.outputMessageText.value;
    let subject = 'Connecting regarding opportunities';

    const selectedChip = document.querySelector('.subject-chip.selected .subject-text');
    if (selectedChip) {
      subject = selectedChip.textContent.trim();
    } else if (state.currentGeneratedResult?.subjectOptions?.[0]) {
      subject = state.currentGeneratedResult.subjectOptions[0];
    }

    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
    showToast('Opening default email application...');
  });

  // Output Action: Regenerate
  elements.btnRegenerate.addEventListener('click', () => {
    elements.writeForm.requestSubmit();
  });

  // Output Action: Score this Message
  elements.btnScoreThis.addEventListener('click', () => {
    const textToScore = elements.outputMessageText.value.trim();
    if (!textToScore) return;

    switchTab('tab-score');
    elements.scoreInputText.value = textToScore;
    elements.scoreInputChars.textContent = `${textToScore.length} / 5000`;

    const msgType = getRadioValue('messageType') || 'email';
    elements.scoreMsgType.value = msgType;
    elements.scoreScenario.value = state.activeScenario;

    elements.btnRunScore.click();
  });

  // =========================================================================
  // TAB 2: SCORE MY DRAFT (/api/score)
  // =========================================================================
  elements.btnLoadBadSample.addEventListener('click', () => {
    elements.scoreInputText.value = 'Respected Sir,\n\nI am a 3rd year BTech student from XYZ College. Kindly do the needful and please give me an internship at your reputed company. I am very hardworking and ready to do anything.\n\nThanking you in anticipation.\nYours obediently,\nStudent';
    elements.scoreInputChars.textContent = `${elements.scoreInputText.value.length} / 5000`;
    elements.scoreMsgType.value = 'email';
    elements.scoreScenario.value = 'internship';
    showToast('Loaded bad sample draft');
  });

  elements.btnRunScore.addEventListener('click', async () => {
    const text = elements.scoreInputText.value.trim();
    const errEl = document.getElementById('err-score-input');
    errEl.textContent = '';
    elements.scoreInputText.classList.remove('input-error');

    if (!text) {
      elements.scoreInputText.classList.add('input-error');
      errEl.textContent = 'Please paste your message draft to analyze.';
      elements.scoreInputText.focus();
      return;
    }

    setScoringState(true);

    try {
      const response = await fetch('/api/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          messageType: elements.scoreMsgType.value,
          scenario: elements.scoreScenario.value
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Server error (${response.status})`);
      }

      renderScoreResults(data);
      showToast('Draft evaluated!');

      setTimeout(() => {
        elements.scoreResultsCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);

    } catch (err) {
      console.error('Score request failed:', err);
      showGlobalAlert(err.message || 'Failed to evaluate draft. Please try again.', 'danger');
    } finally {
      setScoringState(false);
    }
  });

  function setScoringState(isScoring) {
    elements.btnRunScore.disabled = isScoring;
    elements.scoreSpinner.classList.toggle('hidden', !isScoring);
    elements.scoreBtnText.textContent = isScoring ? 'Analyzing with NetworkSathi...' : 'Analyze & Score Draft';
    if (isScoring) hideGlobalAlert();
  }

  function renderScoreResults(data) {
    elements.scoreResultsCard.classList.remove('hidden');

    const overall = typeof data.overallScore === 'number' ? data.overallScore : 70;
    elements.overallScoreNum.textContent = overall;

    // Set score circle color & verdict
    let verdictText = 'Great Draft! Ready to send.';
    let circleColor = 'var(--success)';
    if (overall < 50) {
      verdictText = 'Needs Heavy Polish (High Cringe / Generic)';
      circleColor = 'var(--danger)';
    } else if (overall < 80) {
      verdictText = 'Decent start, but can be sharper';
      circleColor = 'var(--warning)';
    }

    elements.overallScoreCircle.style.borderColor = circleColor;
    elements.overallScoreNum.style.color = circleColor;
    elements.scoreVerdictTitle.textContent = verdictText;

    // Spam Risk
    const spam = (data.spamRisk || 'low').toLowerCase();
    elements.spamRiskBadge.textContent = `Spam Risk: ${spam.toUpperCase()}`;
    elements.spamRiskBadge.className = `badge-tag ${spam === 'high' ? 'text-danger' : spam === 'medium' ? 'text-warning' : 'text-success'}`;

    // Pillar progress bars
    const scores = data.scores || { clarity: 7, personalization: 7, length: 7, tone: 7, clearAsk: 7 };
    setPillarBar(elements.barClarity, elements.scoreValClarity, scores.clarity);
    setPillarBar(elements.barPersonalization, elements.scoreValPersonalization, scores.personalization);
    setPillarBar(elements.barLength, elements.scoreValLength, scores.length);
    setPillarBar(elements.barTone, elements.scoreValTone, scores.tone);
    setPillarBar(elements.barClearAsk, elements.scoreValClearAsk, scores.clearAsk);

    // Cringe flags
    if (Array.isArray(data.cringeFlags) && data.cringeFlags.length > 0) {
      elements.cringeFlagsCard.classList.remove('hidden');
      elements.cringeFlagsList.innerHTML = data.cringeFlags.map(f =>
        `<li>${escapeHtml(f)}</li>`
      ).join('');
    } else {
      elements.cringeFlagsCard.classList.add('hidden');
    }

    // What works well
    if (Array.isArray(data.whatWorks) && data.whatWorks.length > 0) {
      elements.whatWorksList.innerHTML = data.whatWorks.map(w =>
        `<li>${escapeHtml(w)}</li>`
      ).join('');
    } else {
      elements.whatWorksList.innerHTML = '<li>Concise structure</li>';
    }

    // Actionable fixes
    if (Array.isArray(data.improvements) && data.improvements.length > 0) {
      elements.improvementsList.innerHTML = data.improvements.map(imp =>
        `<li>${escapeHtml(imp)}</li>`
      ).join('');
    } else {
      elements.improvementsList.innerHTML = '<li>Personalize the opening line with their project name.</li>';
    }

    // Improved Version
    elements.improvedVersionText.value = data.improvedVersion || '';
  }

  function setPillarBar(barElement, labelElement, scoreVal) {
    const score = typeof scoreVal === 'number' ? scoreVal : 5;
    const pct = Math.min(Math.max(score * 10, 0), 100);
    barElement.style.width = `${pct}%`;
    labelElement.textContent = `${score}/10`;

    barElement.className = 'progress-bar';
    if (score >= 8) barElement.classList.add('bar-green');
    else if (score >= 5) barElement.classList.add('bar-amber');
    else barElement.classList.add('bar-red');
  }

  elements.btnCopyImproved.addEventListener('click', () => {
    const text = elements.improvedVersionText.value;
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => showToast('Copied rewritten version!'));
  });

  // =========================================================================
  // TAB 3: LINKEDIN PROFILE BOOST (/api/profile)
  // =========================================================================
  elements.btnSampleProfile.addEventListener('click', () => {
    elements.profTargetRole.value = 'Full Stack Software Engineer Intern';
    elements.profSkills.value = 'React.js, Node.js, Express, PostgreSQL, TypeScript, Docker';
    elements.profProjects.value = 'Built DevCollab (real-time editor with WebSockets; 400 active monthly users), and a Microservices payment gateway demo in Node & Redis.';
    elements.profCurrentHeadline.value = 'Student at SRM IST | Aspiring Full Stack Developer | Learning MERN';
    elements.profCurrentAbout.value = 'I am a 3rd year student passionate about coding and software engineering. Looking for internships.';
    showToast('Loaded profile sample');
  });

  elements.btnRunProfile.addEventListener('click', async () => {
    const targetRole = elements.profTargetRole.value.trim();
    const errEl = document.getElementById('err-prof-target-role');
    errEl.textContent = '';
    elements.profTargetRole.classList.remove('input-error');

    if (!targetRole) {
      elements.profTargetRole.classList.add('input-error');
      errEl.textContent = 'Please enter your target role.';
      elements.profTargetRole.focus();
      return;
    }

    setProfileState(true);

    try {
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetRole,
          skills: elements.profSkills.value.trim(),
          projects: elements.profProjects.value.trim(),
          currentHeadline: elements.profCurrentHeadline.value.trim(),
          currentAbout: elements.profCurrentAbout.value.trim()
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Server error (${response.status})`);
      }

      renderProfileResults(data);
      showToast('LinkedIn profile boost generated!');

      setTimeout(() => {
        elements.profileResultsCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);

    } catch (err) {
      console.error('Profile boost failed:', err);
      showGlobalAlert(err.message || 'Failed to boost profile. Please try again.', 'danger');
    } finally {
      setProfileState(false);
    }
  });

  function setProfileState(isBoosting) {
    elements.btnRunProfile.disabled = isBoosting;
    elements.profSpinner.classList.toggle('hidden', !isBoosting);
    elements.profBtnText.textContent = isBoosting ? 'Boosting Profile...' : 'Boost My LinkedIn Profile';
    if (isBoosting) hideGlobalAlert();
  }

  function renderProfileResults(data) {
    elements.profileResultsCard.classList.remove('hidden');

    // 3 Headline Options
    if (Array.isArray(data.headlineOptions) && data.headlineOptions.length > 0) {
      elements.headlineOptionsList.innerHTML = '';
      data.headlineOptions.forEach(hl => {
        const card = document.createElement('div');
        card.className = 'headline-card';
        card.innerHTML = `
          <span class="headline-text">${escapeHtml(hl)}</span>
          <button type="button" class="headline-copy-btn" title="Copy headline">Copy</button>
        `;

        card.addEventListener('click', (e) => {
          navigator.clipboard.writeText(hl).then(() => showToast('Headline copied!'));
        });

        elements.headlineOptionsList.appendChild(card);
      });
    }

    // Improved About Section
    const about = data.improvedAbout || '';
    elements.improvedAboutText.value = about;
    elements.aboutCharCounter.textContent = `${about.length} / 1800 chars`;

    // 5 Skills to Highlight
    if (Array.isArray(data.skillsToHighlight) && data.skillsToHighlight.length > 0) {
      elements.skillsChipsList.innerHTML = data.skillsToHighlight.map(sk =>
        `<span class="skill-chip">${escapeHtml(sk)}</span>`
      ).join('');
    }

    // 3 Profile Tips
    if (Array.isArray(data.profileTips) && data.profileTips.length > 0) {
      elements.profileTipsList.innerHTML = data.profileTips.map(tip =>
        `<li>${escapeHtml(tip)}</li>`
      ).join('');
    }
  }

  elements.improvedAboutText.addEventListener('input', () => {
    elements.aboutCharCounter.textContent = `${elements.improvedAboutText.value.length} / 1800 chars`;
  });

  elements.btnCopyAbout.addEventListener('click', () => {
    const about = elements.improvedAboutText.value;
    if (!about) return;
    navigator.clipboard.writeText(about).then(() => showToast('About section copied to clipboard!'));
  });

  // =========================================================================
  // SESSION HISTORY (in-memory array, last 5 items)
  // =========================================================================
  function saveToSessionHistory(item) {
    state.sessionHistory.unshift(item);
    if (state.sessionHistory.length > 5) {
      state.sessionHistory.pop();
    }
    updateHistoryUI();
  }

  function updateHistoryUI() {
    const count = state.sessionHistory.length;
    elements.historyCountBadge.textContent = count;

    if (count === 0) {
      elements.historyItemsList.innerHTML = `
        <div class="empty-history">
          <p>No messages generated yet in this session.</p>
          <span class="section-subtext">Your last 5 generated messages will appear here.</span>
        </div>
      `;
      return;
    }

    elements.historyItemsList.innerHTML = '';
    state.sessionHistory.forEach((histItem, idx) => {
      const card = document.createElement('div');
      card.className = 'history-card';
      const timeStr = histItem.timestamp ? new Date(histItem.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
      const previewText = histItem.message || histItem.fallbackText || 'Outreach draft';

      card.innerHTML = `
        <div class="history-card-header">
          <span class="history-scenario-badge">${formatScenarioName(histItem.payload.scenario)}</span>
          <span class="history-time">${timeStr}</span>
        </div>
        <p class="history-preview">${escapeHtml(previewText)}</p>
      `;

      card.addEventListener('click', () => {
        loadHistoryItem(histItem);
        toggleHistoryDrawer(false);
      });

      elements.historyItemsList.appendChild(card);
    });
  }

  function loadHistoryItem(histItem) {
    switchTab('tab-write');
    selectScenario(histItem.payload.scenario);

    // Populate form inputs
    const p = histItem.payload;
    elements.studentName.value = p.student?.name || '';
    elements.studentCollege.value = p.student?.college || '';
    elements.studentCourse.value = p.student?.course || '';
    if (p.student?.year) elements.studentYear.value = p.student.year;
    elements.studentSkills.value = p.student?.skills || '';
    elements.studentProjects.value = p.student?.projects || '';
    elements.studentAchievements.value = p.student?.achievements || '';

    elements.recipientName.value = p.recipient?.name || '';
    elements.recipientRole.value = p.recipient?.role || '';
    elements.recipientCompany.value = p.recipient?.company || '';
    elements.recipientProfile.value = p.recipient?.profileText || '';
    elements.profileCharCount.textContent = `${(p.recipient?.profileText || '').length} / 3000`;

    elements.outreachGoal.value = p.goal || '';
    elements.extraContext.value = p.extraContext || '';

    setRadioValue('messageType', p.messageType || 'email');
    setRadioValue('tone', p.tone || 'professional');
    setRadioValue('length', p.length || 'short');

    // Render generated result
    state.currentGeneratedResult = histItem;
    renderGeneratedOutput(histItem, p.messageType);
    showToast('Loaded message from session history');

    setTimeout(() => {
      elements.outputSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  function toggleHistoryDrawer(open) {
    elements.historyDrawer.classList.toggle('open', open);
    elements.drawerBackdrop.classList.toggle('hidden', !open);
    elements.historyDrawer.setAttribute('aria-hidden', open ? 'false' : 'true');
  }

  elements.historyBtn.addEventListener('click', () => toggleHistoryDrawer(true));
  elements.closeHistoryBtn.addEventListener('click', () => toggleHistoryDrawer(false));
  elements.drawerBackdrop.addEventListener('click', () => toggleHistoryDrawer(false));

  // =========================================================================
  // TOASTS & GLOBAL ALERTS
  // =========================================================================
  function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span>${escapeHtml(message)}</span>`;

    elements.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 300);
    }, 2800);
  }

  function showGlobalAlert(message, type = 'warning') {
    elements.globalAlert.className = `global-alert alert-${type}`;
    elements.globalAlertText.textContent = message;
    elements.globalAlert.classList.remove('hidden');
  }

  function hideGlobalAlert() {
    elements.globalAlert.classList.add('hidden');
  }

  elements.alertDismiss.addEventListener('click', hideGlobalAlert);

  // =========================================================================
  // HELPERS
  // =========================================================================
  function formatScenarioName(scenarioKey) {
    const map = {
      internship: 'Internship',
      referral: 'Referral',
      research_professor: 'Professor Research',
      alumni_advice: 'Alumni Advice',
      recruiter: 'Recruiter Outreach',
      follow_up: 'Follow-Up',
      thank_you: 'Thank You',
      collab_project: 'Project Collab'
    };
    return map[scenarioKey] || scenarioKey;
  }

  function escapeHtml(str) {
    if (!str || typeof str !== 'string') return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Initialize
  initTheme();
  selectScenario('internship');
});
