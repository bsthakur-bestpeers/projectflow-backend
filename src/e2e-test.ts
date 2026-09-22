import http from 'http';

const BASE_URL = 'http://localhost:4000';

async function request(path: string, options: { method?: string; body?: any; token?: string; cookies?: string } = {}) {
  const url = new URL(path, BASE_URL);
  return new Promise<{ status: number; data: any; headers: http.IncomingHttpHeaders }>((resolve, reject) => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (options.token) {
      headers['Authorization'] = `Bearer ${options.token}`;
    }
    if (options.cookies) {
      headers['Cookie'] = options.cookies;
    }

    const payload = options.body ? JSON.stringify(options.body) : undefined;
    if (payload) {
      headers['Content-Length'] = Buffer.byteLength(payload).toString();
    }

    const req = http.request(
      url,
      {
        method: options.method || 'GET',
        headers,
      },
      (res) => {
        let raw = '';
        res.on('data', (chunk) => (raw += chunk));
        res.on('end', () => {
          let parsed;
          try {
            parsed = JSON.parse(raw);
          } catch {
            parsed = raw;
          }
          resolve({ status: res.statusCode || 500, data: parsed, headers: res.headers });
        });
      }
    );

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function runTests() {
  console.log('🚀 Starting ProjectFlow Comprehensive E2E Test Suite...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, extra?: any) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`, extra ? extra : '');
      failed++;
    }
  }

  // 1. Health Check
  const health = await request('/health');
  assert(health.status === 200 && health.data.success === true, 'Health check endpoint works');

  // 2. Auth - Login Existing User
  const loginRes = await request('/api/auth/login', {
    method: 'POST',
    body: { email: 'alice@projectflow.dev', password: 'Password123' },
  });
  assert(loginRes.status === 200 && loginRes.data.data?.token, 'Alice login succeeds with token');
  const token = loginRes.data.data.token;

  // 3. Auth - Get Current User (/api/auth/me)
  const meRes = await request('/api/auth/me', { token });
  assert(meRes.status === 200 && meRes.data.data?.email === 'alice@projectflow.dev', 'Fetch authenticated user profile (/api/auth/me)');

  // 4. Projects - List Projects
  const projectsRes = await request('/api/projects', { token });
  assert(projectsRes.status === 200 && Array.isArray(projectsRes.data.data.projects), 'List user projects');
  const projectId = projectsRes.data.data.projects[0]?.id;
  assert(projectId !== undefined, 'Found at least one seed project (ID: ' + projectId + ')');

  // 5. Projects - Create New Project
  const newProjectRes = await request('/api/projects', {
    method: 'POST',
    token,
    body: {
      name: 'Integration Test Project ' + Date.now(),
      description: 'Project created during automated test run',
    },
  });
  assert(newProjectRes.status === 201 && newProjectRes.data.data?.id, 'Create new project');
  const testProjectId = newProjectRes.data.data?.id;

  // 6. Sprint - Create Sprint (Date required, Name optional as per requirement)
  const now = new Date();
  const futureStart = new Date(now.getTime() + 86400000 * 30).toISOString();
  const futureEnd = new Date(now.getTime() + 86400000 * 44).toISOString();
  const sprintRes = await request(`/api/projects/${testProjectId}/sprints`, {
    method: 'POST',
    token,
    body: {
      start_date: futureStart,
      end_date: futureEnd,
      goal: 'Deliver initial MVP modules',
    },
  });
  assert(sprintRes.status === 201 && sprintRes.data.data?.id, 'Create sprint with optional name and required dates');
  const testSprintId = sprintRes.data.data?.id;

  // 7. Ticket - Create Ticket with Rich Text Description & Estimation (e.g. "3d", "2h", "5pts")
  const ticketRes = await request(`/api/projects/${testProjectId}/tickets`, {
    method: 'POST',
    token,
    body: {
      title: 'Setup automated deployment script',
      description: '<p>Deploy to <strong>Kubernetes</strong> cluster with zero downtime.</p>',
      status: 'TODO',
      estimation: '2d',
      sprintId: testSprintId,
    },
  });
  assert(ticketRes.status === 201 && ticketRes.data.data?.id, 'Create ticket with HTML description & estimation');
  const testTicketId = ticketRes.data.data?.id;

  // 8. Ticket - Update Ticket Status (Move across Kanban columns)
  const updateTicketRes = await request(`/api/tickets/${testTicketId}`, {
    method: 'PATCH',
    token,
    body: {
      status: 'IN_PROGRESS',
    },
  });
  assert(updateTicketRes.status === 200 && updateTicketRes.data.data?.status === 'IN_PROGRESS', 'Update ticket status to IN_PROGRESS');

  // 9. Members - Add Member to Project
  const addMemberRes = await request(`/api/projects/${testProjectId}/members`, {
    method: 'POST',
    token,
    body: {
      email: 'bob@projectflow.dev',
    },
  });
  assert(addMemberRes.status === 201, 'Add member (Bob) to test project');

  // 10. Members - List Project Members
  const membersRes = await request(`/api/projects/${testProjectId}/members`, { token });
  assert(membersRes.status === 200 && membersRes.data.data?.length >= 2, 'List project members shows owner and new member');

  // 11. Tickets - Assign Ticket to Member
  const assignTicketRes = await request(`/api/tickets/${testTicketId}`, {
    method: 'PATCH',
    token,
    body: {
      assigneeId: 2, // Bob
    },
  });
  assert(assignTicketRes.status === 200 && assignTicketRes.data.data?.assignee_id === 2, 'Assign ticket to member Bob');

  // 12. Sprints - Start Sprint
  const startSprintRes = await request(`/api/sprints/${testSprintId}/start`, {
    method: 'POST',
    token,
  });
  assert(startSprintRes.status === 200 && startSprintRes.data.data?.status === 'ACTIVE', 'Start sprint (status=ACTIVE)');

  // 13. Sprints - Complete Sprint
  const completeSprintRes = await request(`/api/sprints/${testSprintId}/complete`, {
    method: 'POST',
    token,
  });
  assert(completeSprintRes.status === 200 && completeSprintRes.data.data?.status === 'COMPLETED', 'Complete sprint (status=COMPLETED)');

  // 14. Dashboard metrics endpoint
  const dashRes = await request('/api/tickets/dashboard', { token });
  assert(dashRes.status === 200 && Array.isArray(dashRes.data.data?.assignedTickets), 'Ticket dashboard assigned tickets array');
  assert(dashRes.status === 200 && Array.isArray(dashRes.data.data?.recentTickets), 'Ticket dashboard recent tickets array');

  // 15. Clean up - Delete Ticket & Project
  const delTicketRes = await request(`/api/tickets/${testTicketId}`, {
    method: 'DELETE',
    token,
  });
  assert(delTicketRes.status === 200, 'Delete ticket');

  const delProjectRes = await request(`/api/projects/${testProjectId}`, {
    method: 'DELETE',
    token,
  });
  assert(delProjectRes.status === 200, 'Delete test project');

  console.log(`\n========================================`);
  console.log(`E2E TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal error during test run:', err);
  process.exit(1);
});
