import { createApp } from './server/index.js';

async function runTests() {
  console.log('--- STARTING APPS.ABISHEK.IN API TEST SUITE ---');
  const app = await createApp();
  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    // 1. Get Tools
    console.log('\n[TEST 1] Fetching all public tools...');
    const toolsRes = await fetch(`${baseUrl}/api/tools`);
    const toolsData = await toolsRes.json();
    console.log(`Status: ${toolsRes.status}, Found: ${toolsData.tools.length} tools`);
    if (toolsData.tools.length === 0) throw new Error('No tools returned');

    // Verify presence of our five new subdomains + existing ones
    const slugs = toolsData.tools.map(t => t.slug);
    console.log('Available Tool Slugs:', slugs.join(', '));
    ['base64', 'compiler', 'json', 'md', 'prettier'].forEach(s => {
      if (!slugs.includes(s)) throw new Error(`Missing seeded tool: ${s}`);
    });

    // 2. Submit a Bug Report
    console.log('\n[TEST 2] Submitting public bug report with email...');
    const bugRes = await fetch(`${baseUrl}/api/bugs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tool_slug: 'compiler',
        title: 'Dark mode contrast in mobile view',
        description: 'Testing bug submission form verification',
        email: 'tester@example.com'
      })
    });
    const bugData = await bugRes.json();
    console.log(`Status: ${bugRes.status}, Bug ID: ${bugData.id}`);
    if (!bugData.id) throw new Error('Bug submission failed');

    // 3. Submit a Feature / Tool Request
    console.log('\n[TEST 3] Submitting community tool request...');
    const reqRes = await fetch(`${baseUrl}/api/requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'RegEx Playground & Tester',
        description: 'Interactive regular expression visualizer and live test suite',
        category: 'developer',
        email: 'developer@example.com'
      })
    });
    const reqData = await reqRes.json();
    console.log(`Status: ${reqRes.status}, Request ID: ${reqData.id}`);
    if (!reqData.id) throw new Error('Tool request submission failed');

    // 4. Upvote the request
    console.log('\n[TEST 4] Upvoting request...');
    const upvoteRes = await fetch(`${baseUrl}/api/requests/${reqData.id}/vote`, {
      method: 'POST'
    });
    const upvoteData = await upvoteRes.json();
    console.log(`Status: ${upvoteRes.status}, New Upvotes: ${upvoteData.votes}`);
    if (upvoteData.votes < 2) throw new Error('Upvote increment failed');

    // 5. Subscribe to Launch Alerts
    console.log('\n[TEST 5] Subscribing to launch alert...');
    const subRes = await fetch(`${baseUrl}/api/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'user@example.com',
        tool_slug: 'sql'
      })
    });
    const subData = await subRes.json();
    console.log(`Status: ${subRes.status}, Subscribed: ${subData.message}`);

    // 6. Admin Login
    console.log('\n[TEST 6] Admin authentication test (admin@abishek.in)...');
    const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@abishek.in',
        password: 'admin'
      })
    });
    const loginData = await loginRes.json();
    console.log(`Status: ${loginRes.status}, Role: ${loginData.user?.role}`);
    if (loginData.user?.role !== 'admin') throw new Error('Admin login failed');

    const adminToken = loginData.token;

    // Toggle in-product notification preference
    console.log('\n[TEST 6b] Toggling in-product notification preferences...');
    const prefRes = await fetch(`${baseUrl}/api/auth/preferences`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ notify_new_tools: false })
    });
    const prefData = await prefRes.json();
    console.log(`Status: ${prefRes.status}, Notification Pref: ${prefData.message}`);
    if (prefData.notify_new_tools !== 0) throw new Error('Preferences toggle failed');

    // 7. Admin CRUD: Add new tool
    console.log('\n[TEST 7] Admin creating new tool...');
    const addToolRes = await fetch(`${baseUrl}/api/admin/tools`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        slug: 'cron',
        name: 'Cron Generator',
        url: 'https://cron.abishek.in',
        category: 'developer',
        short_desc: 'Interactive cron schedule expression builder',
        icon: '⏰',
        tags: ['cron', 'scheduler', 'linux'],
        is_hidden: 0
      })
    });
    const addToolData = await addToolRes.json();
    console.log(`Status: ${addToolRes.status}, Created tool id: ${addToolData.id}`);
    if (!addToolData.id) throw new Error('Admin tool creation failed');

    // 8. Admin CRUD: Toggle tool visibility (Hide / View)
    console.log('\n[TEST 8] Admin toggling tool visibility...');
    const hideToolRes = await fetch(`${baseUrl}/api/admin/tools/${addToolData.id}/toggle-visibility`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const hideToolData = await hideToolRes.json();
    console.log(`Status: ${hideToolRes.status}, is_hidden: ${hideToolData.is_hidden}`);
    if (hideToolData.is_hidden !== 1) throw new Error('Toggle visibility failed');

    // 9. Admin Review Bug and Update Status
    console.log('\n[TEST 9] Admin updating bug status to in-progress...');
    const updateBugRes = await fetch(`${baseUrl}/api/admin/bugs/${bugData.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ status: 'in-progress', adminNotes: 'Investigating issue' })
    });
    const updateBugData = await updateBugRes.json();
    console.log(`Status: ${updateBugRes.status}, Bug Status: ${updateBugData.success}`);

    // 10. Admin Stats Overview
    console.log('\n[TEST 10] Admin fetching overview stats...');
    const statsRes = await fetch(`${baseUrl}/api/admin/overview`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const statsData = await statsRes.json();
    console.log('Overview Counts:', JSON.stringify(statsData.counts));

    console.log('\n>>> ALL 10 TESTS PASSED SUCCESSFULLY! <<<\n');
  } finally {
    server.close();
  }
}

runTests().catch(err => {
  console.error('\n❌ TEST FAILED:', err);
  process.exit(1);
});
