const { performance } = require('perf_hooks');

const numLogs = 100000;
const mockLogs = [];
const now = new Date();
for (let i = 0; i < numLogs; i++) {
  const d = new Date(now.getTime() - Math.random() * 14 * 24 * 60 * 60 * 1000);
  mockLogs.push({
    date: d.toISOString(),
    sessionId: 'session_' + i
  });
}

function runBaseline() {
  const start = performance.now();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const recentLogs = mockLogs.filter(l => new Date(l.date) > sevenDaysAgo);
  const doneSessionIds = recentLogs.map(l => l.sessionId);
  const end = performance.now();
  return end - start;
}

function runOptimizedString() {
  const start = performance.now();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const sevenDaysAgoStr = sevenDaysAgo.toISOString();

  const recentLogs = mockLogs.filter(l => l.date > sevenDaysAgoStr);
  const doneSessionIds = recentLogs.map(l => l.sessionId);
  const end = performance.now();
  return end - start;
}

// Warm up
for (let i = 0; i < 10; i++) {
  runBaseline();
  runOptimizedString();
}

let baselineTotal = 0;
let optimizedStringTotal = 0;
const iterations = 100;

for (let i = 0; i < iterations; i++) {
  baselineTotal += runBaseline();
  optimizedStringTotal += runOptimizedString();
}

console.log(`Baseline avg: ${baselineTotal / iterations} ms`);
console.log(`Optimized (String cmp) avg: ${optimizedStringTotal / iterations} ms`);
console.log(`Improvement (String cmp): ${((baselineTotal - optimizedStringTotal) / baselineTotal * 100).toFixed(2)}%`);
