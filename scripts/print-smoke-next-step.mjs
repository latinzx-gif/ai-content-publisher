import { existsSync, readFileSync } from 'node:fs';

const reportPath = process.env.AI_CONTENT_MVP_AUDIT_REPORT_PATH ?? 'reports/mvp-production-audit.json';

if (!existsSync(reportPath)) {
  console.log('No MVP audit report found.');
  console.log('Run: npm run mvp:audit');
  process.exit(2);
}

const report = JSON.parse(readFileSync(reportPath, 'utf8'));

console.log(`MVP status: ${report.status ?? 'unknown'}`);
console.log(`MVP complete: ${report.mvpComplete === true ? 'yes' : 'no'}`);

if (report.mvpComplete === true) {
  console.log('No next smoke step is required.');
  process.exit(0);
}

if (report.nextCommand) {
  console.log('');
  console.log('Next command:');
  console.log(report.nextCommand);
  process.exit(2);
}

console.log('');
console.log('Next command was not found in the audit report.');
console.log('Run: npm run mvp:audit');
process.exit(2);
