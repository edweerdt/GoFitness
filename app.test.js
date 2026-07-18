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
        mockLocalStorage.setItem('logs', '{not valid');

        let store;
        expect(() => {
            store = new DataStore();
        }).not.toThrow();

        // Corrupte keys vallen terug op de standaardwaarde
        expect(store.plans).toEqual([]);
        expect(store.logs).toEqual([]);
        expect(store.theme).toBe('auto');
    });

    it('should remove activePlanId from localStorage when it is cleared', () => {
        const store = new DataStore();
        store.activePlanId = 'plan_1';
        store.save();
        expect(mockLocalStorage.store['activePlanId']).toBe('plan_1');

        // Actief plan verwijderd -> id moet ook uit localStorage verdwijnen
        store.activePlanId = null;
        store.save();
        expect(mockLocalStorage.getItem('activePlanId')).toBeNull();
    });

    describe('restoreBackup', () => {
        it('should replace plans and logs and pick a valid active plan', () => {
            const store = new DataStore();
            store.plans = [{ id: 'plan_old', name: 'Oud' }];
            store.activePlanId = 'plan_old';
            store.logs = [{ id: 'log_old' }];

            store.restoreBackup({
                plans: [{ id: 'plan_new', name: 'Nieuw' }],
                logs: [{ id: 'log_new' }, { id: 'log_new2' }]
            });

            expect(store.plans).toEqual([{ id: 'plan_new', name: 'Nieuw' }]);
            expect(store.logs).toHaveLength(2);
            // Oude activePlanId bestaat niet meer -> eerste plan uit de backup wordt actief
            expect(store.activePlanId).toBe('plan_new');
            expect(mockLocalStorage.store['plans']).toContain('plan_new');
        });

        it('should clear the active plan when the backup contains no plans', () => {
            const store = new DataStore();
            store.plans = [{ id: 'plan_old' }];
            store.activePlanId = 'plan_old';

            store.restoreBackup({ plans: [], logs: [] });

            expect(store.activePlanId).toBeNull();
            expect(mockLocalStorage.getItem('activePlanId')).toBeNull();
        });
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

        it('should be green when the next session trains recovered muscle groups', () => {
            const twentyHoursAgo = new Date();
            twentyHoursAgo.setHours(twentyHoursAgo.getHours() - 20);
            store.plans = [{
                id: 'plan_1', minRecoveryHours: 48,
                sessions: [
                    { id: 'legs', name: 'Benen', dayOrderHint: 1, exercises: [{ id: 'e1', name: 'Squat', muscleGroups: ['legs'], sets: 3 }] },
                    { id: 'push', name: 'Push', dayOrderHint: 2, exercises: [{ id: 'e2', name: 'Bench Press', muscleGroups: ['chest'], sets: 3 }] }
                ]
            }];
            store.activePlanId = 'plan_1';
            store.logs = [{ sessionId: 'legs', date: twentyHoursAgo.toISOString(), exercises: [{ name: 'Squat', muscleGroups: ['legs'] }] }];

            // Benen gisteren getraind, maar de aanbevolen sessie is push (borst nooit getraind) -> groen
            expect(app.getRecoveryStatus().status).toBe('green');
        });

        it('should be red when the next session trains a muscle group that was just trained', () => {
            const tenHoursAgo = new Date();
            tenHoursAgo.setHours(tenHoursAgo.getHours() - 10);
            store.plans = [{
                id: 'plan_1', minRecoveryHours: 48,
                sessions: [
                    { id: 'push', name: 'Push', exercises: [{ id: 'e2', name: 'Bench Press', muscleGroups: ['chest'], sets: 3 }] }
                ]
            }];
            store.activePlanId = 'plan_1';
            store.logs = [{ sessionId: 'push', date: tenHoursAgo.toISOString(), exercises: [{ name: 'Bench Press', muscleGroups: ['chest'] }] }];

            expect(app.getRecoveryStatus().status).toBe('red');
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

        it('should return 1 when there is only a workout in the current week', () => {
            store.logs = [{ id: 'log1', date: new Date().toISOString() }];
            expect(app.calculateStreak()).toBe(1);
        });

        it('should count consecutive training weeks', () => {
            const now = new Date();
            const lastWeek = new Date(now); lastWeek.setDate(now.getDate() - 7);
            const twoWeeksAgo = new Date(now); twoWeeksAgo.setDate(now.getDate() - 14);
            store.logs = [
                { date: twoWeeksAgo.toISOString() },
                { date: lastWeek.toISOString() },
                { date: now.toISOString() }
            ];
            expect(app.calculateStreak()).toBe(3);
        });

        it('should keep the streak alive when this week has no workout yet', () => {
            const now = new Date();
            const lastWeek = new Date(now); lastWeek.setDate(now.getDate() - 7);
            const twoWeeksAgo = new Date(now); twoWeeksAgo.setDate(now.getDate() - 14);
            store.logs = [
                { date: twoWeeksAgo.toISOString() },
                { date: lastWeek.toISOString() }
            ];
            expect(app.calculateStreak()).toBe(2);
        });

        it('should break the streak when a week is skipped', () => {
            const now = new Date();
            const threeWeeksAgo = new Date(now); threeWeeksAgo.setDate(now.getDate() - 21);
            store.logs = [
                { date: threeWeeksAgo.toISOString() },
                { date: now.toISOString() }
            ];
            expect(app.calculateStreak()).toBe(1);
        });
    });
});

describe('rest timer', () => {
    beforeEach(() => {
        jest.useFakeTimers();
        document.body.innerHTML = `
            <div id="rest-timer" class="hidden"><span id="rest-timer-label"></span></div>
            <div id="toast-container"></div>
        `;
    });

    afterEach(() => {
        app.stopRestTimer();
        jest.useRealTimers();
    });

    it('should show a countdown and hide itself when the rest is over', () => {
        app.startRestTimer(90);
        const el = document.getElementById('rest-timer');
        const label = document.getElementById('rest-timer-label');

        expect(el.classList.contains('hidden')).toBe(false);
        expect(label.textContent).toBe('Rust: 1:30');

        jest.advanceTimersByTime(1000);
        expect(label.textContent).toBe('Rust: 1:29');

        jest.advanceTimersByTime(89000);
        expect(el.classList.contains('hidden')).toBe(true);
        expect(app.restTimer).toBeNull();
    });

    it('should be cancellable via stopRestTimer', () => {
        app.startRestTimer(60);
        app.stopRestTimer();

        expect(document.getElementById('rest-timer').classList.contains('hidden')).toBe(true);
        expect(app.restTimer).toBeNull();
    });

    it('should restart the countdown when a new set is completed', () => {
        app.startRestTimer(60);
        jest.advanceTimersByTime(30000);
        expect(document.getElementById('rest-timer-label').textContent).toBe('Rust: 0:30');

        app.startRestTimer(60);
        expect(document.getElementById('rest-timer-label').textContent).toBe('Rust: 1:00');
    });
});

describe('validateBackup', () => {
    it('should accept a valid backup with plans and logs', () => {
        const result = app.validateBackup({ plans: [{ id: 'p1' }], logs: [], exportDate: '2026-01-01' });
        expect(result).toEqual({ plans: [{ id: 'p1' }], logs: [] });
    });

    it('should reject data without plans or logs arrays', () => {
        expect(() => app.validateBackup(null)).toThrow();
        expect(() => app.validateBackup({})).toThrow();
        expect(() => app.validateBackup({ plans: 'geen array', logs: [] })).toThrow();
        expect(() => app.validateBackup({ plans: [], logs: 'geen array' })).toThrow();
    });
});

describe('app achievements', () => {
    beforeEach(() => {
        store.plans = [];
        store.activePlanId = null;
        store.logs = [];
        document.body.innerHTML = '<div id="achievements-grid"></div>';
    });

    it('should unlock the rhythm achievement for 4 consecutive weeks across a year boundary', () => {
        // 4 opeenvolgende maandagen over de jaargrens 2025 -> 2026
        store.logs = [
            { date: new Date(2025, 11, 15).toISOString(), duration: 45 },
            { date: new Date(2025, 11, 22).toISOString(), duration: 45 },
            { date: new Date(2025, 11, 29).toISOString(), duration: 45 },
            { date: new Date(2026, 0, 5).toISOString(), duration: 45 }
        ];
        app.renderAchievements();
        expect(document.getElementById('achievements-grid').innerHTML).toContain('Vast in het Ritme');
    });

    it('should unlock muscle achievements via muscleGroups metadata for Dutch exercise names', () => {
        // De oude naam-heuristiek (Engelse termen) zou deze namen missen
        store.logs = [{
            date: new Date().toISOString(),
            duration: 45,
            exercises: [
                { name: 'Borstdrukken', muscleGroups: ['Chest'], details: [{ setNumber: 1, weight: '40', reps: '10' }] },
                { name: 'Vlinderslag Apparaat', muscleGroups: ['chest'], details: [{ setNumber: 1, weight: '30', reps: '12' }] },
                { name: 'Opdrukken', muscleGroups: ['CHEST'], details: [{ setNumber: 1, weight: '', reps: '15' }] }
            ]
        }];
        app.renderAchievements();
        expect(document.getElementById('achievements-grid').innerHTML).toContain('Borst Vooruit');
    });

    it('should not unlock the rhythm achievement when a week is skipped', () => {
        store.logs = [
            { date: new Date(2025, 11, 8).toISOString(), duration: 45 },
            { date: new Date(2025, 11, 15).toISOString(), duration: 45 },
            { date: new Date(2025, 11, 29).toISOString(), duration: 45 },
            { date: new Date(2026, 0, 5).toISOString(), duration: 45 }
        ];
        app.renderAchievements();
        expect(document.getElementById('achievements-grid').innerHTML).not.toContain('Vast in het Ritme');
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

    it('should escape malicious imported plan fields when rendering plans', () => {
        document.body.innerHTML = '<div id="plans-list"></div>';
        store.plans = [{
            id: 'p1',
            name: 'Kwaadaardig Plan',
            description: '<img src=x onerror="alert(1)">',
            goal: '<script>alert(2)</script>',
            level: '<b onmouseover=alert(3)>pro</b>',
            equipment: ['<iframe src=x>'],
            sessions: [{ id: 's1', name: '<svg onload=alert(4)>', exercises: [] }]
        }];
        store.activePlanId = 'p1';

        app.renderPlans();

        const html = document.getElementById('plans-list').innerHTML;
        expect(html).not.toContain('<img');
        expect(html).not.toContain('<script>');
        expect(html).not.toContain('<iframe');
        expect(html).not.toContain('<svg');
        expect(html).toContain('&lt;script&gt;alert(2)&lt;/script&gt;');
    });
});
