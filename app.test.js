const { DataStore, app, store } = require('./app');

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

    describe('saveActiveWorkoutState', () => {
        it('should save active workout state to localStorage when state is provided', () => {
            const store = new DataStore();
            const mockState = { exerciseId: 'ex_1', sets: [] };

            store.saveActiveWorkoutState(mockState);

            expect(store.activeWorkoutState).toEqual(mockState);
            expect(mockLocalStorage.setItem).toHaveBeenCalledWith('activeWorkoutState', JSON.stringify(mockState));
        });

        it('should remove active workout state from localStorage when state is null', () => {
            const store = new DataStore();

            // First, set a state
            store.saveActiveWorkoutState({ exerciseId: 'ex_1' });

            // Then clear it
            store.saveActiveWorkoutState(null);

            expect(store.activeWorkoutState).toBeNull();
            expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('activeWorkoutState');
        });
    });
});

describe('app logic', () => {
    beforeEach(() => {
        // Reset store state before each test
        store.plans = [];
        store.activePlanId = null;
        store.logs = [];
    });

    describe('getRecoveryStatus', () => {
        it('should return green when no plan is active', () => {
            const status = app.getRecoveryStatus();
            expect(status).toEqual({ status: 'green', text: 'Klaar om te trainen' });
        });

        it('should return green when there are no logs', () => {
            store.plans = [{ id: 'plan_1', minRecoveryHours: 48 }];
            store.activePlanId = 'plan_1';
            const status = app.getRecoveryStatus();
            expect(status).toEqual({ status: 'green', text: 'Klaar om te trainen' });
        });

        it('should return red when hours since last log is less than half min recovery hours', () => {
            store.plans = [{ id: 'plan_1', minRecoveryHours: 48 }];
            store.activePlanId = 'plan_1';
            const logDate = new Date();
            logDate.setHours(logDate.getHours() - 10); // 10 hours ago (< 24)
            store.logs = [{ date: logDate.toISOString() }];

            const status = app.getRecoveryStatus();
            expect(status).toEqual({ status: 'red', text: 'Beter rusten' });
        });

        it('should return orange when hours since last log is between half and full min recovery hours', () => {
            store.plans = [{ id: 'plan_1', minRecoveryHours: 48 }];
            store.activePlanId = 'plan_1';
            const logDate = new Date();
            logDate.setHours(logDate.getHours() - 30); // 30 hours ago (> 24, < 48)
            store.logs = [{ date: logDate.toISOString() }];

            const status = app.getRecoveryStatus();
            expect(status).toEqual({ status: 'orange', text: 'Rustig aan' });
        });

        it('should return green when hours since last log is greater than min recovery hours', () => {
            store.plans = [{ id: 'plan_1', minRecoveryHours: 48 }];
            store.activePlanId = 'plan_1';
            const logDate = new Date();
            logDate.setHours(logDate.getHours() - 50); // 50 hours ago (> 48)
            store.logs = [{ date: logDate.toISOString() }];

            const status = app.getRecoveryStatus();
            expect(status).toEqual({ status: 'green', text: 'Volledig hersteld' });
        });
    });

    describe('getRecommendedSession', () => {
        it('should return null when no plan is active', () => {
            expect(app.getRecommendedSession()).toBeNull();
        });

        it('should return the first session when no sessions have been done recently', () => {
            const session1 = { id: 's1', name: 'Session 1' };
            const session2 = { id: 's2', name: 'Session 2' };
            store.plans = [{ id: 'plan_1', name: 'Test Plan', sessions: [session1, session2] }];
            store.activePlanId = 'plan_1';

            const recommended = app.getRecommendedSession();
            expect(recommended.session).toEqual(session1);
            expect(recommended.reason).toContain('volgende in je schema');
        });

        it('should return the next uncompleted session', () => {
            const session1 = { id: 's1', name: 'Session 1' };
            const session2 = { id: 's2', name: 'Session 2' };
            store.plans = [{ id: 'plan_1', name: 'Test Plan', sessions: [session1, session2] }];
            store.activePlanId = 'plan_1';

            const logDate = new Date();
            store.logs = [{ sessionId: 's1', date: logDate.toISOString() }];

            const recommended = app.getRecommendedSession();
            expect(recommended.session).toEqual(session2);
        });

        it('should loop back to the first session when all have been completed', () => {
            const session1 = { id: 's1', name: 'Session 1' };
            const session2 = { id: 's2', name: 'Session 2' };
            store.plans = [{ id: 'plan_1', name: 'Test Plan', sessions: [session1, session2] }];
            store.activePlanId = 'plan_1';

            const logDate = new Date();
            store.logs = [
                { sessionId: 's1', date: logDate.toISOString() },
                { sessionId: 's2', date: logDate.toISOString() }
            ];

            const recommended = app.getRecommendedSession();
            expect(recommended.session).toEqual(session1);
            expect(recommended.reason).toContain('we beginnen weer vooraan');
        });
    });

    describe('calculateStreak', () => {
        it('should return 0 when there are no logs', () => {
            expect(app.calculateStreak()).toBe(0);
        });

        it('should return 1 when there are logs', () => {
            store.logs = [{ id: 'log1' }];
            expect(app.calculateStreak()).toBe(1);
        });
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
