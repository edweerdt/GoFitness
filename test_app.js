const fs = require('fs');

// Mock localStorage and browser environment
global.localStorage = {
    store: {},
    getItem(key) { return this.store[key] || null; },
    setItem(key, value) { this.store[key] = value.toString(); },
    removeItem(key) { delete this.store[key]; }
};

global.document = {
    documentElement: { classList: { add: () => {}, remove: () => {} } },
    getElementById: (id) => {
        return {
            textContent: '', className: '', innerHTML: '', value: '',
            classList: { add: () => {}, remove: () => {} },
            querySelector: () => ({ textContent: '' }),
            appendChild: () => {},
            style: {},
            addEventListener: () => {}
        };
    },
    querySelectorAll: () => [],
    createElement: () => ({ className: '', innerHTML: '', style: {}, appendChild: () => {} }),
    querySelector: () => ({ appendChild: () => {} })
};

global.alert = console.log;

// Load app source inside context where store and app are exposed globally
const appSource = fs.readFileSync('./app.js', 'utf8');
eval(`
    ${appSource}
    global.store = store;
    global.app = app;
`);

// Load the rich schema test data
const richSchema = JSON.parse(fs.readFileSync('./test_rich_schema.json', 'utf8'));

// Test importing rich schema
console.log('--- Testing Import ---');
global.store.importPlan(richSchema);
console.log('Plan imported successfully. Plans in store:', global.store.plans.length);
console.log('Active plan name:', global.store.getActivePlan().name);

// Test progress and milestones parsing
console.log('--- Testing Progress Milestones ---');
global.app.renderProgress();
console.log('Progress rendered without errors.');

// Test home logic
console.log('--- Testing Training Logic ---');
global.app.renderHome();
console.log('Home rendered without errors.');

console.log('All tests passed.');
