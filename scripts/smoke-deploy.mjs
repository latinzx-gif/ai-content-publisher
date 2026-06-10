const targetUrl = process.argv[2];

if (!targetUrl) {
  console.error('Usage: npm run smoke:deploy -- https://your-preview-url.vercel.app');
  process.exit(1);
}

const baseUrl = normalizeBaseUrl(targetUrl);
const checks = [
  {
    name: 'runtime health',
    method: 'GET',
    path: '/api/health',
    expectedStatus: 200,
  },
  {
    name: 'PRD page',
    method: 'GET',
    path: '/?page=dashboard',
    expectedStatus: 200,
    expectedHeaders: {
      'x-content-type-options': 'nosniff',
      'x-frame-options': 'DENY',
      'referrer-policy': 'strict-origin-when-cross-origin',
      'permissions-policy': 'camera=(), microphone=(), geolocation=()',
    },
  },
  {
    name: 'PRD publishing deep link',
    method: 'GET',
    path: '/?page=publishing&tab=scheduled',
    expectedStatus: 200,
  },
  {
    name: 'protected review API rejects missing bearer',
    method: 'POST',
    path: '/api/reviews',
    expectedStatus: 401,
    body: {
      contentItemId: '00000000-0000-0000-0000-000000000000',
    },
  },
];

const failures = [];

for (const check of checks) {
  const response = await fetch(`${baseUrl}${check.path}`, {
    method: check.method,
    headers: check.body ? { 'content-type': 'application/json' } : undefined,
    body: check.body ? JSON.stringify(check.body) : undefined,
  });
  const passed = response.status === check.expectedStatus;
  const headerFailures = check.expectedHeaders
    ? Object.entries(check.expectedHeaders).filter(([name, value]) => response.headers.get(name) !== value)
    : [];
  const fullyPassed = passed && headerFailures.length === 0;

  console.log(`${fullyPassed ? 'PASS' : 'FAIL'} ${check.name}: ${response.status} expected ${check.expectedStatus}`);

  if (!fullyPassed) {
    failures.push({
      name: check.name,
      path: check.path,
      status: response.status,
      expectedStatus: check.expectedStatus,
      headerFailures,
    });
  }
}

if (failures.length > 0) {
  console.log('');
  console.log('Deploy smoke failed:');
  for (const failure of failures) {
    console.log(`- ${failure.name} ${failure.path}: ${failure.status}, expected ${failure.expectedStatus}`);
    for (const [name, value] of failure.headerFailures ?? []) {
      console.log(`  header ${name}: expected ${value}`);
    }
  }
  process.exit(1);
}

console.log('');
console.log('Deploy smoke passed.');

function normalizeBaseUrl(value) {
  const url = new URL(value);
  url.pathname = '';
  url.search = '';
  url.hash = '';
  return url.toString().replace(/\/$/, '');
}
