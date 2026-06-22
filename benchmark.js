const { performance } = require('perf_hooks');

// Generate mock logs
const numLogs = 100000;
const mockLogs = [];
for (let i = 0; i < numLogs; i++) {
  mockLogs.push({
    duration: Math.floor(Math.random() * 60) + 15,
    exercisesCompleted: Math.floor(Math.random() * 10) + 1
  });
}

function runBaseline() {
  const start = performance.now();
  let totalMinutes = mockLogs.reduce((sum, l) => sum + (l.duration || 45), 0);
  let totalExercises = mockLogs.reduce((sum, l) => sum + (l.exercisesCompleted || 0), 0);
  const end = performance.now();
  return end - start;
}

function runOptimized() {
  const start = performance.now();
  let totalMinutes = 0;
  let totalExercises = 0;
  for (let i = 0; i < mockLogs.length; i++) {
    const l = mockLogs[i];
    totalMinutes += (l.duration || 45);
    totalExercises += (l.exercisesCompleted || 0);
  }
  const end = performance.now();
  return end - start;
}

// Warm up
for (let i = 0; i < 100; i++) {
  runBaseline();
  runOptimized();
}

let baselineTotal = 0;
let optimizedTotal = 0;
const iterations = 1000;

for (let i = 0; i < iterations; i++) {
  baselineTotal += runBaseline();
  optimizedTotal += runOptimized();
}

console.log(`Baseline avg: ${baselineTotal / iterations} ms`);
console.log(`Optimized avg: ${optimizedTotal / iterations} ms`);
console.log(`Improvement: ${((baselineTotal - optimizedTotal) / baselineTotal * 100).toFixed(2)}%`);
