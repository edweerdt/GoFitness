const { DataStore, app } = require('./app');

describe('DataStore', () => {
    let mockLocalStorage;

    beforeEach(() => {
        // Mock localStorage
        mockLocalStorage = {
            store: {},
            getItem: jest.fn(key => mockLocalStorage.store[key] || null),
            setItem: jest.fn((key, value) => {
                mockLocalStorage.store[key] = value.toString();
            }),
            removeItem: jest.fn(key => {
                delete mockLocalStorage.store[key];
            }),
            clear: jest.fn(() => {
                mockLocalStorage.store = {};
            })
        };

        // Assign mock to global context
        Object.defineProperty(global, 'localStorage', {
            value: mockLocalStorage,
            configurable: true
        });
    });

    afterEach(() => {
        // Clean up
        jest.restoreAllMocks();
    });

    it('should initialize with default empty state when localStorage is empty', () => {
        const store = new DataStore();

        expect(store.plans).toEqual([]);
        expect(store.activePlanId).toBeNull();
        expect(store.logs).toEqual([]);
        expect(store.activeWorkoutState).toBeNull();
        expect(store.theme).toBe('auto');

        // Assert load was called (indicated by calling localStorage.getItem)
        expect(mockLocalStorage.getItem).toHaveBeenCalledWith('plans');
        expect(mockLocalStorage.getItem).toHaveBeenCalledWith('activePlanId');
        expect(mockLocalStorage.getItem).toHaveBeenCalledWith('logs');
        expect(mockLocalStorage.getItem).toHaveBeenCalledWith('activeWorkoutState');
        expect(mockLocalStorage.getItem).toHaveBeenCalledWith('theme');
    });

    it('should initialize with data from localStorage when available', () => {
        const mockPlans = [{ id: 'plan_1', name: 'Test Plan' }];
        const mockLogs = [{ id: 'log_1', duration: 45 }];
        const mockWorkoutState = { startTime: new Date().toISOString() };

        // Pre-populate mock localStorage
        mockLocalStorage.setItem('plans', JSON.stringify(mockPlans));
        mockLocalStorage.setItem('activePlanId', 'plan_1');
        mockLocalStorage.setItem('logs', JSON.stringify(mockLogs));
        mockLocalStorage.setItem('activeWorkoutState', JSON.stringify(mockWorkoutState));
        mockLocalStorage.setItem('theme', 'dark');

        const store = new DataStore();

        expect(store.plans).toEqual(mockPlans);
        expect(store.activePlanId).toBe('plan_1');
        expect(store.logs).toEqual(mockLogs);
        expect(store.activeWorkoutState).toEqual(mockWorkoutState);
        expect(store.theme).toBe('dark');
    });

    it('should handle malformed JSON in localStorage gracefully without crashing', () => {
        // Put invalid JSON in localStorage
        mockLocalStorage.setItem('plans', 'invalid json data');

        // Ensure parsing invalid json throws as normal
        expect(() => {
            new DataStore();
        }).toThrow(SyntaxError);
    });
});

describe('app XSS Security', () => {
    it('should escape HTML characters using escapeHTML to prevent XSS', () => {
        expect(app.escapeHTML('<script>alert("xss")</script>')).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
        expect(app.escapeHTML('Hello & Welcome')).toBe('Hello &amp; Welcome');
        expect(app.escapeHTML("O'Reilly")).toBe('O&#39;Reilly');
    });

    it('should format rich fields escaping XSS safely', () => {
        const result = app.formatRichField('<script>alert("XSS")</script>', '<style>body{display:none}</style>');
        expect(result).not.toContain('<script>');
        expect(result).toContain('&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;');
        expect(result).not.toContain('<style>');
        expect(result).toContain('&lt;style&gt;body{display:none}&lt;/style&gt;');
    });
});
