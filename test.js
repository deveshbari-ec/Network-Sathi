/**
 * NetworkSathi - Automated Test Suite
 * Comprehensive verification of all endpoints, scenarios, constraints, and error states.
 */

process.env.NODE_ENV = 'test';
const http = require('http');
const { app } = require('./server');

const TEST_PORT = 3099;
let server;

const sleep = ms => new Promise(r => setTimeout(r, ms));

function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : null;
    const reqHeaders = { ...headers };
    if (postData) {
      reqHeaders['Content-Type'] = 'application/json';
      reqHeaders['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = http.request({
      hostname: '127.0.0.1',
      port: TEST_PORT,
      path,
      method,
      headers: reqHeaders
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let parsed;
        try {
          parsed = JSON.parse(data);
        } catch (_) {
          parsed = data;
        }
        resolve({ status: res.statusCode, data: parsed, headers: res.headers });
      });
    });

    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function runTests() {
  console.log('====================================================');
  console.log('Starting NetworkSathi Automated Verification Suite');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, details = '') {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName} - ${details}`);
      failed++;
    }
  }

  try {
    // 1. Health check
    const health = await request('GET', '/api/health');
    assert(health.status === 200 && health.data.ok === true, 'GET /api/health returns ok: true');

    // 2. Test Input Validations: Empty Student Name
    const emptyStudent = await request('POST', '/api/generate', {
      scenario: 'internship',
      messageType: 'email',
      student: { name: '' },
      recipient: { name: 'Priya' },
      goal: 'Get internship'
    });
    assert(emptyStudent.status === 400 && emptyStudent.data.error.includes('name'), 'Validation: Rejects empty student name');

    // 3. Test Input Validations: Invalid Scenario enum
    const invalidScenario = await request('POST', '/api/generate', {
      scenario: 'crypto_pitch',
      student: { name: 'Aryan' },
      recipient: { name: 'Priya' },
      goal: 'Pitch coin'
    });
    assert(invalidScenario.status === 400 && invalidScenario.data.error.includes('scenario'), 'Validation: Rejects unknown scenario enum');

    // 4. Test Input Validations: Oversized profile text (> 3000 chars)
    const oversizedProfile = await request('POST', '/api/generate', {
      scenario: 'internship',
      messageType: 'email',
      student: { name: 'Aryan' },
      recipient: { name: 'Priya', profileText: 'A'.repeat(3050) },
      goal: 'Summer internship'
    });
    assert(oversizedProfile.status === 400 && oversizedProfile.data.error.includes('3000'), 'Validation: Rejects profileText exceeding 3000 characters');

    // 5. Test Simulated API Failure Handling
    const simulatedFail = await request('POST', '/api/generate', {
      scenario: 'internship',
      messageType: 'email',
      student: { name: 'Aryan' },
      recipient: { name: 'Priya' },
      goal: 'Summer internship'
    }, { 'x-simulate-error': 'true' });
    assert(simulatedFail.status === 500 && simulatedFail.data.error.includes('Simulated AI provider failure'), 'Error Handling: Graceful simulated failure without leaking stack traces');

    // 6. Test Scenario: Research Professor with Missing University
    const missingUni = await request('POST', '/api/generate', {
      scenario: 'research_professor',
      messageType: 'email',
      student: { name: 'Aryan' },
      recipient: { name: 'Prof. Sen' },
      goal: 'Summer research'
    });
    assert(missingUni.status === 400 && missingUni.data.error.includes('University'), 'Validation: Professor outreach requires Department or University');

    // 7. Test Scenario: Referral with Missing Job ID / Role
    const missingReferralJob = await request('POST', '/api/generate', {
      scenario: 'referral',
      messageType: 'email',
      student: { name: 'Sneha' },
      recipient: { name: 'Rohan', company: '' },
      goal: ''
    });
    assert(missingReferralJob.status === 400, 'Validation: Referral request requires Company and Job Goal');

    // 8. Test Generate: All 8 Scenarios with Sample Data
    const scenarios = [
      'internship',
      'referral',
      'research_professor',
      'alumni_advice',
      'recruiter',
      'follow_up',
      'thank_you',
      'collab_project'
    ];

    console.log('\n--- Testing /api/generate for all 8 Scenarios ---');
    for (const sc of scenarios) {
      const payload = {
        scenario: sc,
        messageType: sc === 'alumni_advice' ? 'linkedin_connect' : sc === 'referral' ? 'linkedin_dm' : 'email',
        tone: sc === 'research_professor' ? 'formal' : 'professional',
        length: 'short',
        student: {
          name: 'Student Candidate',
          college: 'Tier 2 Engineering College',
          course: 'BTech CSE',
          year: '3rd Year',
          skills: 'React, Node.js, Python, SQL',
          projects: 'Built high-throughput payment queue demo'
        },
        recipient: {
          name: sc === 'research_professor' ? 'Prof. Anirban Sen' : 'Priya Nair',
          role: sc === 'research_professor' ? 'Associate Professor' : 'Engineering Manager',
          company: sc === 'research_professor' ? 'IIT Delhi' : 'Swiggy'
        },
        goal: sc === 'referral' ? 'Referral for SDE-1 (Job ID #1234)' : 'Explore potential openings'
      };

      const res = await request('POST', '/api/generate', payload);
      const ok = res.status === 200 && (Boolean(res.data.message) || Boolean(res.data.fallbackText));
      assert(ok, `Generate Scenario: ${sc}`, res.data?.error || `Status: ${res.status}`);
      await sleep(1500);
    }

    // 9. Test Message Types: Verify LinkedIn Connect length awareness
    console.log('\n--- Testing Message Types (email, linkedin_connect, linkedin_dm) ---');
    await sleep(1500);
    const connectRes = await request('POST', '/api/generate', {
      scenario: 'internship',
      messageType: 'linkedin_connect',
      tone: 'friendly',
      length: 'short',
      student: { name: 'Aryan', college: 'SRM' },
      recipient: { name: 'Siddharth Rao', company: 'Khatabook' },
      goal: 'Connect regarding engineering updates'
    });
    assert(connectRes.status === 200, 'Generate LinkedIn Connect note succeeds');
    if (connectRes.data.message) {
      const len = connectRes.data.message.length;
      console.log(`   (LinkedIn connect length: ${len} chars)`);
      assert(len <= 320, 'LinkedIn connect stays around or under 300 characters');
    }

    // 10. Test Score Endpoint: Deliberately bad message ("Respected Sir...")
    console.log('\n--- Testing /api/score ---');
    await sleep(1500);
    const badDraft = 'Respected Sir,\n\nI am a student from XYZ College. Kindly do the needful and please give me an internship at your reputed company. I will work very hard.';
    const scoreBad = await request('POST', '/api/score', {
      text: badDraft,
      messageType: 'email',
      scenario: 'internship'
    });

    assert(scoreBad.status === 200, 'Score endpoint accepts bad draft');
    assert(scoreBad.data.overallScore !== undefined, 'Returns overallScore numeric value');
    assert(Array.isArray(scoreBad.data.cringeFlags) && scoreBad.data.cringeFlags.length > 0,
      'Identifies cringe flags for "Respected Sir" / "kindly do the needful"');
    assert(Boolean(scoreBad.data.improvedVersion), 'Provides rewritten improvedVersion');
    console.log(`   (Overall score for bad draft: ${scoreBad.data.overallScore}/100, Cringe flags: ${scoreBad.data.cringeFlags.length})`);

    // 11. Test Score Endpoint: Empty text validation
    const scoreEmpty = await request('POST', '/api/score', { text: '' });
    assert(scoreEmpty.status === 400 && scoreEmpty.data.error.includes('draft'), 'Score rejects empty draft message');

    // 12. Test LinkedIn Profile Boost Endpoint (/api/profile)
    console.log('\n--- Testing /api/profile ---');
    await sleep(1500);
    const profileRes = await request('POST', '/api/profile', {
      targetRole: 'Full Stack Software Engineer',
      skills: 'React, Node.js, Express, PostgreSQL, Docker',
      projects: 'Built DevCollab real-time editor with 400 active users',
      currentHeadline: 'Student at SRM | Looking for opportunities',
      currentAbout: 'I am a CS student looking for 2026 roles.'
    });

    assert(profileRes.status === 200, 'Profile Boost generates successfully');
    assert(Array.isArray(profileRes.data.headlineOptions) && profileRes.data.headlineOptions.length === 3, 'Returns 3 headline options');
    assert(Boolean(profileRes.data.improvedAbout), 'Returns improved About section');
    assert(Array.isArray(profileRes.data.skillsToHighlight), 'Returns skills to highlight');
    assert(Array.isArray(profileRes.data.profileTips), 'Returns profile coaching tips');

    // 13. Test Profile Endpoint: Missing targetRole validation
    const profileMissingRole = await request('POST', '/api/profile', { targetRole: '' });
    assert(profileMissingRole.status === 400 && profileMissingRole.data.error.includes('Target Role'), 'Profile Boost validates required targetRole');

  } catch (err) {
    console.error('Test execution error:', err);
    failed++;
  } finally {
    console.log('\n====================================================');
    console.log(`Test Suite Completed: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================');
    if (server) server.close();
    process.exit(failed > 0 ? 1 : 0);
  }
}

// Start server on test port and run
server = app.listen(TEST_PORT, () => {
  runTests();
});
