const { DataStore, app, store, html, rawHtml, PRESET_PLANS } = require('./app');

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

        // Assign mock to global context safely across Node versions
        try {
            Object.defineProperty(global, 'localStorage', {
                value: mockLocalStorage,
                configurable: true,
                writable: true
            });
        } catch (e) {
            if (global.localStorage) {
                global.localStorage.getItem = mockLocalStorage.getItem;
                global.localStorage.setItem = mockLocalStorage.setItem;
                global.localStorage.removeItem = mockLocalStorage.removeItem;
                global.localStorage.clear = mockLocalStorage.clear;
            }
        }
    });

    afterEach(() => {
        // Clean up
        jest.restoreAllMocks();
        if (typeof window !== 'undefined' && window.localStorage) {
            try {
                Object.defineProperty(global, 'localStorage', {
                    value: window.localStorage,
                    configurable: true,
                    writable: true
                });
            } catch (e) {
                global.localStorage = window.localStorage;
            }
        }
    });

    it('should initialize with default empty state when localStorage is empty', () => {
        const store = new DataStore();

        expect(store.plans).toEqual([]);
        expect(store.activePlanId).toBeNull();
        expect(store.logs).toEqual([]);
        expect(store.activeWorkoutState).toBeNull();
        expect(store.theme).toBe('auto');
        expect(store.holdTimerDelaySeconds).toBe(3);

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
        mockLocalStorage.setItem('logs', '{broken}}}');

        // Spy on console.warn to verify it logs the corruption
        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

        // Should NOT throw — graceful fallback to defaults
        let store;
        expect(() => {
            store = new DataStore();
        }).not.toThrow();

        expect(store.plans).toEqual([]);
        expect(store.logs).toEqual([]);
        expect(store.activeWorkoutState).toBeNull();
        expect(store.theme).toBe('auto');

        // Verify corrupt keys were removed from localStorage
        expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('plans');
        expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('logs');

        // Verify warnings were logged
        expect(consoleSpy).toHaveBeenCalled();

        consoleSpy.mockRestore();
    });

    it('should recover partial data when only some localStorage keys are corrupt', () => {
        // Valid plans, corrupt logs
        const validPlans = [{ id: 'plan_1', name: 'Good Plan' }];
        mockLocalStorage.setItem('plans', JSON.stringify(validPlans));
        mockLocalStorage.setItem('logs', 'not valid json');
        mockLocalStorage.setItem('theme', 'dark');

        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

        const store = new DataStore();

        // Valid data should be loaded correctly
        expect(store.plans).toEqual(validPlans);
        expect(store.theme).toBe('dark');

        // Corrupt data should fall back to defaults
        expect(store.logs).toEqual([]);

        // Only the corrupt key should be removed
        expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('logs');

        consoleSpy.mockRestore();
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

    describe('deletion tombstones', () => {
        it('should record and persist deleted ids', () => {
            const store = new DataStore();
            store.recordDeletion('plans', 'plan_1');
            store.recordDeletion('logs', 'log_1');
            store.recordDeletion('logs', 'log_1'); // dubbel registreren blijft 1 entry
            store.save();

            expect(store.deleted.plans).toEqual(['plan_1']);
            expect(store.deleted.logs).toEqual(['log_1']);
            expect(JSON.parse(mockLocalStorage.store['deleted'])).toEqual({ plans: ['plan_1'], logs: ['log_1'] });

            const reloaded = new DataStore();
            expect(reloaded.deleted.plans).toEqual(['plan_1']);
        });

        it('should cap the tombstone list at 500 entries', () => {
            const store = new DataStore();
            for (let i = 0; i < 510; i++) store.recordDeletion('logs', 'log_' + i);
            expect(store.deleted.logs).toHaveLength(500);
            expect(store.deleted.logs[0]).toBe('log_10');
        });

        it('should clear tombstones when restoring a backup', () => {
            const store = new DataStore();
            store.recordDeletion('plans', 'plan_1');
            store.restoreBackup({ plans: [], logs: [] });
            expect(store.deleted).toEqual({ plans: [], logs: [] });
        });
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

            expect(store.plans).toEqual([{ id: 'plan_new', name: 'Nieuw', sessions: [] }]);
            expect(store.logs).toHaveLength(2);
            // Oude activePlanId bestaat niet meer -> eerste plan uit de backup wordt actief
            expect(store.activePlanId).toBe('plan_new');
            expect(mockLocalStorage.store['plans']).toContain('plan_new');
        });

        it('should normalize plans without sessions from handcrafted backups', () => {
            const store = new DataStore();
            store.restoreBackup({ plans: [{ id: 'p1', name: 'Kaal' }], logs: [] });
            expect(store.plans[0].sessions).toEqual([]);
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

    describe('quota handling', () => {
        it('should not crash when localStorage is full on save()', () => {
            const store = new DataStore();
            store.plans = [{ id: 'plan_1', name: 'Test' }];
            store.logs = [{ id: 'log_1' }];

            // Simulate QuotaExceededError
            mockLocalStorage.setItem = jest.fn(() => {
                throw new DOMException('quota exceeded', 'QuotaExceededError');
            });

            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

            // Should not throw and return false
            expect(() => {
                const result = store.save();
                expect(result).toBe(false);
            }).not.toThrow();

            // In-memory state should still be intact
            expect(store.plans).toEqual([{ id: 'plan_1', name: 'Test' }]);
            expect(store.logs).toEqual([{ id: 'log_1' }]);

            expect(consoleSpy).toHaveBeenCalled();
            consoleSpy.mockRestore();
        });

        it('should return true on successful save()', () => {
            const store = new DataStore();
            store.plans = [];
            store.logs = [];
            const result = store.save();
            expect(result).toBe(true);
        });

        it('should not crash when localStorage is full on saveActiveWorkoutState()', () => {
            const store = new DataStore();
            const mockState = { exerciseId: 'ex_1', sets: [true, false] };

            // Simulate QuotaExceededError
            mockLocalStorage.setItem = jest.fn(() => {
                throw new DOMException('quota exceeded', 'QuotaExceededError');
            });

            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

            // Should not throw
            expect(() => {
                store.saveActiveWorkoutState(mockState);
            }).not.toThrow();

            // In-memory state should still be updated
            expect(store.activeWorkoutState).toEqual(mockState);

            expect(consoleSpy).toHaveBeenCalled();
            consoleSpy.mockRestore();
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

        it('should update an existing plan in place when importing a plan with matching id, planId or name', () => {
            const store = new DataStore();
            store.plans = [{ id: 'plan_1781938748008', planId: 'my-schema', name: 'Beginner Gym', sessions: [] }];
            store.activePlanId = 'plan_1781938748008';

            const updatedPlanData = {
                id: 'plan_1781938748008',
                planId: 'my-schema',
                name: 'Beginner Gym',
                sessions: [{ name: 'Full Body A', exercises: [{ name: 'Squat', sets: 3 }] }]
            };

            store.importPlan(updatedPlanData);

            expect(store.plans.length).toBe(1);
            expect(store.plans[0].id).toBe('plan_1781938748008');
            expect(store.plans[0].sessions.length).toBe(1);
            expect(store.activePlanId).toBe('plan_1781938748008');
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
            expect(status).toEqual({ status: 'green', text: 'Klaar om te trainen', hoursSinceLast: null });
        });

        it('should return green when there are no logs', () => {
            store.plans = [{ id: 'plan_1', minRecoveryHours: 48 }];
            store.activePlanId = 'plan_1';
            const status = app.getRecoveryStatus();
            expect(status).toEqual({ status: 'green', text: 'Klaar om te trainen', hoursSinceLast: null });
        });

        it('should return red when hours since last log is less than half min recovery hours', () => {
            store.plans = [{ id: 'plan_1', minRecoveryHours: 48 }];
            store.activePlanId = 'plan_1';
            const logDate = new Date();
            logDate.setHours(logDate.getHours() - 10); // 10 hours ago (< 24)
            store.logs = [{ date: logDate.toISOString() }];

            const status = app.getRecoveryStatus();
            expect(status.status).toBe('red');
            expect(status.text).toBe('Beter rusten');
            expect(status.hoursSinceLast).toBeCloseTo(10, 0);
        });

        it('should return orange when hours since last log is between half and full min recovery hours', () => {
            store.plans = [{ id: 'plan_1', minRecoveryHours: 48 }];
            store.activePlanId = 'plan_1';
            const logDate = new Date();
            logDate.setHours(logDate.getHours() - 30); // 30 hours ago (> 24, < 48)
            store.logs = [{ date: logDate.toISOString() }];

            const status = app.getRecoveryStatus();
            expect(status.status).toBe('orange');
            expect(status.text).toBe('Rustig aan');
            expect(status.hoursSinceLast).toBeCloseTo(30, 0);
        });

        it('should return green when hours since last log is greater than min recovery hours', () => {
            store.plans = [{ id: 'plan_1', minRecoveryHours: 48 }];
            store.activePlanId = 'plan_1';
            const logDate = new Date();
            logDate.setHours(logDate.getHours() - 50); // 50 hours ago (> 48)
            store.logs = [{ date: logDate.toISOString() }];

            const status = app.getRecoveryStatus();
            expect(status.status).toBe('green');
            expect(status.text).toBe('Volledig hersteld');
            expect(status.hoursSinceLast).toBeCloseTo(50, 0);
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

        it('should ignore logs from other plans when calculating recovery status', () => {
            const tenHoursAgo = new Date();
            tenHoursAgo.setHours(tenHoursAgo.getHours() - 10);

            const plan1 = { id: 'plan_1', minRecoveryHours: 48, sessions: [{ id: 'push1', name: 'Push 1', exercises: [{ name: 'Bench', muscleGroups: ['chest'] }] }] };
            const plan2 = { id: 'plan_2', minRecoveryHours: 48, sessions: [{ id: 'push2', name: 'Push 2', exercises: [{ name: 'Bench', muscleGroups: ['chest'] }] }] };

            store.plans = [plan1, plan2];
            store.activePlanId = 'plan_1';

            // Log belongs to plan_2 (recent)
            store.logs = [{ planId: 'plan_2', sessionId: 'push2', date: tenHoursAgo.toISOString(), exercises: [{ name: 'Bench', muscleGroups: ['chest'] }] }];

            // For plan_1, no logs exist -> green
            expect(app.getRecoveryStatus().status).toBe('green');
        });
    });

    describe('getRecommendedSession', () => {
        it('should return null when no plan is active', () => {
            expect(app.getRecommendedSession()).toBeNull();
        });

        it('should return null when active plan has no sessions', () => {
            store.plans = [{ id: 'plan_1', name: 'Empty Plan' }];
            store.activePlanId = 'plan_1';
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

            const now = Date.now();
            store.logs = [
                { sessionId: 's2', date: new Date(now).toISOString() },
                { sessionId: 's1', date: new Date(now - 86400000).toISOString() }
            ];

            const recommended = app.getRecommendedSession();
            expect(recommended.session).toEqual(session1);
            expect(recommended.reason).toContain('we beginnen weer vooraan');
        });

        it('should continuously alternate sessions A-B-A-B across multiple cycles', () => {
            const sessionA = { id: 'sA', name: 'Full Body A' };
            const sessionB = { id: 'sB', name: 'Full Body B' };
            store.plans = [{ id: 'plan_1', name: 'Test Plan', sessions: [sessionA, sessionB] }];
            store.activePlanId = 'plan_1';

            const now = Date.now();
            // Log sequence: A (oldest), B, A (most recent)
            store.logs = [
                { sessionId: 'sA', date: new Date(now).toISOString() },
                { sessionId: 'sB', date: new Date(now - 86400000).toISOString() },
                { sessionId: 'sA', date: new Date(now - 172800000).toISOString() }
            ];

            // After completing A, next should be B
            const rec1 = app.getRecommendedSession();
            expect(rec1.session).toEqual(sessionB);

            // Simulate completing B
            store.logs.unshift({ sessionId: 'sB', date: new Date(now + 86400000).toISOString() });
            const rec2 = app.getRecommendedSession();
            expect(rec2.session).toEqual(sessionA);
        });

        it('should ignore recent logs from other plans when recommending next session', () => {
            const session1 = { id: 's1', name: 'Session 1' };
            const session2 = { id: 's2', name: 'Session 2' };
            store.plans = [
                { id: 'plan_1', name: 'Plan 1', sessions: [session1, session2] },
                { id: 'plan_2', name: 'Plan 2', sessions: [session1, session2] }
            ];
            store.activePlanId = 'plan_1';

            // s1 was completed recently under plan_2
            store.logs = [{ planId: 'plan_2', sessionId: 's1', date: new Date().toISOString() }];

            // For plan_1, s1 has not been done yet -> recommend s1
            const recommended = app.getRecommendedSession();
            expect(recommended.session).toEqual(session1);
        });

        it('should match logs by planName when planId differs due to plan re-import', () => {
            const sessionA = { id: 'full-body-a', name: 'Full Body A' };
            const sessionB = { id: 'full-body-b', name: 'Full Body B' };
            const plan = { id: 'plan_new', planId: 'my-schema', name: 'My Schema', sessions: [sessionA, sessionB] };
            store.plans = [plan];
            store.activePlanId = 'plan_new';

            // Log has an old planId from a previous import, but same planName
            const recentLog = {
                planId: 'plan_old',
                planName: 'My Schema',
                sessionId: 'full-body-a',
                date: new Date(Date.now() - 3600000).toISOString(),
                exercises: [{ name: 'Leg Press', muscleGroups: ['legs'] }]
            };
            store.logs = [recentLog];

            // isLogForPlan should match this log to the active plan
            expect(app.isLogForPlan(recentLog, plan)).toBe(true);

            // getRecoveryStatus should recognize the recent log and not blindly return green
            const recStatus = app.getRecoveryStatus();
            expect(recStatus.status).not.toBe('green');

            // sanitizeLogPlanIds should update the log planId to matched active plan.id
            store.sanitizeLogPlanIds();
            expect(store.logs[0].planId).toBe('plan_new');
        });

        it('should normalize muscle groups separating biceps/triceps and mapping rear_shoulders/obliques', () => {
            expect(app.normalizeMuscleGroup('biceps')).toBe('biceps');
            expect(app.normalizeMuscleGroup('triceps')).toBe('triceps');
            expect(app.normalizeMuscleGroup('rear_shoulders')).toBe('shoulders');
            expect(app.normalizeMuscleGroup('obliques')).toBe('core');
        });

        it('should guess biceps and triceps from exercise names when muscleGroups are missing', () => {
            expect(app.guessMuscleGroupsFromName('Bicep Curl')).toContain('biceps');
            expect(app.guessMuscleGroupsFromName('Triceps Pushdown')).toContain('triceps');
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

describe('workout flow', () => {
    beforeEach(() => {
        store.plans = [];
        store.activePlanId = null;
        store.logs = [];
        app.activeWorkout = null;
        document.body.innerHTML = `
            <div id="modal-finish-workout" class="modal-overlay hidden"></div>
            <div id="modal-cancel-workout" class="modal-overlay hidden"></div>
            <div id="bottom-nav" class="hidden"></div>
            <div id="toast-container"></div>
        `;
        jest.spyOn(app, 'navigate').mockImplementation(() => {});
        jest.spyOn(app, 'openWorkoutView').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should log only exercises with completed sets, including their set details', () => {
        app.activeWorkout = {
            session: { id: 's1', name: 'Push' },
            startTime: new Date(Date.now() - 30 * 60000),
            exercises: [
                { name: 'Bench Press', muscleGroups: ['chest'], sets: 3, setsCompleted: [true, true, false], weights: ['40', '42.5', ''], actualReps: ['10', '8', ''] },
                { name: 'Overhead Press', muscleGroups: ['shoulders'], sets: 3, setsCompleted: [false, false, false], weights: ['', '', ''], actualReps: ['', '', ''] }
            ]
        };

        app.finishWorkout();

        expect(store.logs).toHaveLength(1);
        const log = store.logs[0];
        expect(log.sessionName).toBe('Push');
        expect(log.exercisesCompleted).toBe(1);
        expect(log.exercises).toHaveLength(1);
        expect(log.exercises[0].name).toBe('Bench Press');
        expect(log.exercises[0].details).toEqual([
            { setNumber: 1, weight: '40', reps: '10' },
            { setNumber: 2, weight: '42.5', reps: '8' }
        ]);
        expect(log.duration).toBeGreaterThanOrEqual(29);
        expect(app.activeWorkout).toBeNull();
        expect(store.activeWorkoutState).toBeNull();
    });

    it('should cap an unrealistically long session duration on finish', () => {
        app.activeWorkout = {
            session: { id: 's1', name: 'Push' },
            startTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 dagen geleden open blijven staan
            exercises: [
                { name: 'Bench Press', muscleGroups: ['chest'], sets: 1, setsCompleted: [true], weights: ['40'], actualReps: ['10'] }
            ]
        };

        app.finishWorkout();

        expect(store.logs).toHaveLength(1);
        expect(store.logs[0].duration).toBe(240);
    });

    it('should snapshot planId and planName at workout start and retain them on finish even if active plan changes', () => {
        const planA = { id: 'plan_A', name: 'Plan Alpha', sessions: [] };
        const planB = { id: 'plan_B', name: 'Plan Beta', sessions: [] };
        store.plans = [planA, planB];
        store.activePlanId = 'plan_A';

        const session = { id: 's1', name: 'Leg Day', exercises: [] };

        // Start workout under Plan Alpha
        app.startWorkout(session);

        expect(app.activeWorkout.planId).toBe('plan_A');
        expect(app.activeWorkout.planName).toBe('Plan Alpha');

        // Switch active plan to Plan Beta mid-workout
        store.activePlanId = 'plan_B';

        // Complete workout
        app.activeWorkout.exercises = [
            { name: 'Squat', muscleGroups: ['legs'], sets: 1, setsCompleted: [true], weights: ['100'], actualReps: ['5'] }
        ];
        app.finishWorkout();

        expect(store.logs).toHaveLength(1);
        expect(store.logs[0].planId).toBe('plan_A');
        expect(store.logs[0].planName).toBe('Plan Alpha');
    });

    it('should fallback to store.getActivePlan() when finishing an activeWorkout lacking snapshot planId', () => {
        const planA = { id: 'plan_A', name: 'Plan Alpha' };
        store.plans = [planA];
        store.activePlanId = 'plan_A';

        // Legacy active workout object without planId/planName
        app.activeWorkout = {
            session: { id: 's1', name: 'Arm Day' },
            startTime: new Date(),
            exercises: [
                { name: 'Curl', muscleGroups: ['biceps'], sets: 1, setsCompleted: [true], weights: ['15'], actualReps: ['10'] }
            ]
        };

        app.finishWorkout();

        expect(store.logs).toHaveLength(1);
        expect(store.logs[0].planId).toBe('plan_A');
        expect(store.logs[0].planName).toBe('Plan Alpha');
    });

    it('should auto-detect completed sets with data and fallback empty fields from previous sets on finish', () => {
        app.activeWorkout = {
            session: { id: 's1', name: 'Leg Day' },
            startTime: new Date(),
            exercises: [
                {
                    name: 'Squat',
                    muscleGroups: ['legs'],
                    sets: 3,
                    setsCompleted: [true, false, true],
                    weights: ['80', '80', ''],
                    actualReps: ['10', '8', '']
                }
            ]
        };

        app.finishWorkout();

        expect(store.logs).toHaveLength(1);
        const log = store.logs[0];
        expect(log.exercises[0].setsCompleted).toBe(3);
        expect(log.exercises[0].details).toHaveLength(3);
        expect(log.exercises[0].details[0]).toEqual({ setNumber: 1, weight: '80', reps: '10' });
        expect(log.exercises[0].details[1]).toEqual({ setNumber: 2, weight: '80', reps: '8' });
        expect(log.exercises[0].details[2]).toEqual({ setNumber: 3, weight: '80', reps: '8' });
    });

    it('should show and hide the cancel workout confirmation modal', () => {
        const modal = document.getElementById('modal-cancel-workout');
        expect(modal.classList.contains('hidden')).toBe(true);

        app.showCancelWorkoutModal();
        expect(modal.classList.contains('hidden')).toBe(false);

        app.hideCancelWorkoutModal();
        expect(modal.classList.contains('hidden')).toBe(true);
    });

    it('should cancel active workout, clear activeWorkoutState, and navigate home', () => {
        app.activeWorkout = {
            session: { id: 's1', name: 'Leg Day' },
            startTime: new Date(),
            exercises: []
        };
        store.activeWorkoutState = app.activeWorkout;

        app.showCancelWorkoutModal();
        app.cancelWorkout();

        expect(app.activeWorkout).toBeNull();
        expect(store.activeWorkoutState).toBeNull();
        expect(localStorage.getItem('activeWorkoutState')).toBeNull();
        expect(app.navigate).toHaveBeenCalledWith('home');
        expect(store.logs).toHaveLength(0);
    });

    it('should start a specific session via startWorkoutBySessionId and make its plan active', () => {
        const session1 = { id: 's1', name: 'Push', exercises: [{ name: 'Bench', sets: 3 }] };
        const session2 = { id: 's2', name: 'Pull', exercises: [{ name: 'Row', sets: 3 }] };
        const plan = { id: 'plan_1', name: 'PPL Plan', sessions: [session1, session2] };

        store.plans = [plan];
        store.activePlanId = null;

        app.startWorkoutBySessionId('plan_1', 's2');

        expect(store.activePlanId).toBe('plan_1');
        expect(app.activeWorkout).not.toBeNull();
        expect(app.activeWorkout.session.name).toBe('Pull');
        expect(app.activeWorkout.planId).toBe('plan_1');
        expect(app.activeWorkout.planName).toBe('PPL Plan');
    });

    it('should populate session picker on home view when plan has multiple sessions', () => {
        document.body.innerHTML = `
            <div id="recovery-status" class="status-badge"><span class="material-icons-round"></span></div>
            <div id="recovery-text"></div>
            <div id="recommended-card-title"></div>
            <div id="recommended-session-name"></div>
            <div id="recommended-reason"></div>
            <div id="session-picker-wrapper" class="hidden"><select id="home-session-select"></select></div>
            <button id="btn-start-session"></button>
            <div id="home-date"></div>
            <div id="stat-completed"></div>
            <div id="stat-streak"></div>
            <div class="stats-mini"></div>
        `;

        const session1 = { id: 's1', name: 'Sessie 1', exercises: [{ name: 'Squat', sets: 3 }] };
        const session2 = { id: 's2', name: 'Sessie 2', exercises: [{ name: 'Bench', sets: 3 }] };
        const plan = { id: 'plan_1', name: 'Duo Schema', sessions: [session1, session2] };

        store.plans = [plan];
        store.activePlanId = 'plan_1';
        store.logs = [];

        app.renderHome();

        const pickerWrapper = document.getElementById('session-picker-wrapper');
        const sessionSelect = document.getElementById('home-session-select');
        expect(pickerWrapper.classList.contains('hidden')).toBe(false);
        // 2 sessies uit het plan + de vaste 'Vrije Sessie'-optie
        expect(sessionSelect.children.length).toBe(3);

        // Change dropdown to session 2
        sessionSelect.value = 's2';
        sessionSelect.onchange();

        expect(document.getElementById('recommended-session-name').textContent).toBe('Sessie 2');
        expect(document.getElementById('recommended-card-title').textContent).toBe('Gekozen Sessie');
    });

    it('should render hours since last training in recovery-hours element on home view', () => {
        document.body.innerHTML = `
            <div id="recovery-status" class="status-badge"><span class="material-icons-round"></span></div>
            <div id="recovery-text"></div>
            <div id="recovery-hours"></div>
            <div id="recommended-card-title"></div>
            <div id="recommended-session-name"></div>
            <div id="recommended-reason"></div>
            <div id="session-picker-wrapper" class="hidden"><select id="home-session-select"></select></div>
            <button id="btn-start-session"></button>
            <div id="home-date"></div>
            <div id="stat-completed"></div>
            <div id="stat-streak"></div>
            <div class="stats-mini"></div>
        `;

        const plan = { id: 'plan_1', name: 'Plan 1', minRecoveryHours: 48, sessions: [{ id: 's1', name: 'Sessie 1', exercises: [] }] };
        store.plans = [plan];
        store.activePlanId = 'plan_1';

        const twelveHoursAgo = new Date();
        twelveHoursAgo.setHours(twelveHoursAgo.getHours() - 12);
        store.logs = [{ date: twelveHoursAgo.toISOString() }];

        app.renderHome();

        const recHoursEl = document.getElementById('recovery-hours');
        expect(recHoursEl.textContent).toBe('• 12u geleden');
    });
});

describe('editing session duration', () => {
    beforeEach(() => {
        store.plans = [];
        store.activePlanId = null;
        store.logs = [{
            id: 'log1', planId: null, planName: 'Overige Sessies', sessionName: 'Push',
            duration: 4098, exercisesCompleted: 1,
            exercises: [{ name: 'Bench Press', totalSets: 1, setsCompleted: 1, details: [{ setNumber: 1, weight: '40', reps: '10' }] }]
        }];
        document.body.innerHTML = `
            <div id="edit-log-container"></div>
            <div id="modal-edit-log" class="hidden"></div>
        `;
        jest.spyOn(app, 'renderProgress').mockImplementation(() => {});
    });

    afterEach(() => jest.restoreAllMocks());

    it('should render an editable duration field in the edit modal', () => {
        app.showEditLogModal('log1');
        const html = document.getElementById('edit-log-container').innerHTML;
        expect(html).toContain('Duur (minuten)');
        expect(html).toContain('updateEditLogDuration');
        expect(html).toContain('value="4098"');
    });

    it('should persist an adjusted duration when saving the log', () => {
        app.showEditLogModal('log1');
        app.updateEditLogDuration('55');
        app.saveEditLog();

        expect(store.logs[0].duration).toBe(55);
        // Overige gegevens blijven behouden
        expect(store.logs[0].exercises[0].details[0].weight).toBe('40');
        // Bewerking krijgt een timestamp voor conflict-detectie bij sync
        expect(store.logs[0].updatedAt).toBeDefined();
    });

    it('should keep checkbox-only sets when only the duration is edited', () => {
        // Sets die zijn afgevinkt zonder kg/reps mogen niet verdwijnen door een bewerking
        store.logs = [{
            id: 'log2', planId: null, planName: 'Overige Sessies', sessionName: 'Bodyweight',
            duration: 30, exercisesCompleted: 1,
            exercises: [{
                name: 'Push-up', totalSets: 3, setsCompleted: 3,
                details: [
                    { setNumber: 1, weight: '', reps: '' },
                    { setNumber: 2, weight: '', reps: '' },
                    { setNumber: 3, weight: '', reps: '' }
                ]
            }]
        }];

        app.showEditLogModal('log2');
        app.updateEditLogDuration('45');
        app.saveEditLog();

        expect(store.logs[0].duration).toBe(45);
        expect(store.logs[0].exercises).toHaveLength(1);
        expect(store.logs[0].exercises[0].setsCompleted).toBe(3);
        expect(store.logs[0].exercisesCompleted).toBe(1);
        // De interne markering lekt niet mee het log in
        expect(store.logs[0].exercises[0].details[0].completed).toBeUndefined();
    });

    it('should remove a set via the explicit remove button', () => {
        app.showEditLogModal('log1');

        // De verwijder-knop staat bij elke set
        expect(document.getElementById('edit-log-container').innerHTML).toContain('removeSetFromEditLog');

        app.removeSetFromEditLog(0, 0);
        app.saveEditLog();

        // Enige set verwijderd -> hele oefening weg uit het log
        expect(store.logs[0].exercises).toHaveLength(0);
        expect(store.logs[0].exercisesCompleted).toBe(0);
    });

    it('should ignore invalid or negative duration input', () => {
        app.logToEdit = JSON.parse(JSON.stringify(store.logs[0]));
        app.updateEditLogDuration('abc');
        expect(app.logToEdit.duration).toBe(4098);
        app.updateEditLogDuration('-5');
        expect(app.logToEdit.duration).toBe(4098);
    });
});

describe('import flow', () => {
    beforeEach(() => {
        store.plans = [];
        store.activePlanId = null;
        store.logs = [];
    });

    it('should normalize a rich schema on import and activate the first plan', () => {
        const richSchema = JSON.parse(JSON.stringify(require('./examples/test_rich_schema.json')));
        store.importPlan(richSchema);

        expect(store.plans).toHaveLength(1);
        const plan = store.plans[0];
        expect(plan.id).toMatch(/^plan_/);
        expect(store.activePlanId).toBe(plan.id);
        // sessionId/exerciseId uit het rijke schema worden overgenomen als interne id
        expect(plan.sessions[0].id).toBe(plan.sessions[0].sessionId);
        expect(plan.sessions[0].exercises[0].id).toBe(plan.sessions[0].exercises[0].exerciseId);
        expect(plan.schemaVersion).toBeDefined();
        expect(plan.schedule).toBeDefined();
    });

    it('should reject sessions without exercises with a clear validation error', () => {
        // Schema-validatie geeft een duidelijke fout in plaats van een crash
        expect(() => store.importPlan({ name: 'Kaal Plan', sessions: [{ name: 'Rustdag-instructies' }] }))
            .toThrow(/oefening/i);
        expect(store.plans).toHaveLength(0);
    });

    it('should activate the imported plan and upsert on re-import by name', () => {
        store.importPlan({ name: 'Plan A', sessions: [{ name: 'S1', exercises: [{ name: 'Squat', sets: 3 }] }] });
        const firstId = store.activePlanId;
        store.importPlan({ name: 'Plan B', sessions: [{ name: 'S1', exercises: [{ name: 'Bench Press', sets: 3 }] }] });

        expect(store.plans).toHaveLength(2);
        // Het zojuist geïmporteerde plan wordt actief
        expect(store.activePlanId).toBe(store.plans[1].id);
        // Ids botsen niet, ook niet bij imports binnen dezelfde milliseconde
        expect(store.plans[0].id).not.toBe(store.plans[1].id);

        // Re-import met dezelfde naam vervangt het plan en behoudt het id (logs blijven gekoppeld)
        store.importPlan({ name: 'Plan A', sessions: [{ name: 'S2', exercises: [{ name: 'Row', sets: 3 }] }] });
        expect(store.plans).toHaveLength(2);
        expect(store.plans.find(p => p.name === 'Plan A').id).toBe(firstId);
    });

    it('should reject JSON without name or sessions in the import preview', () => {
        document.body.innerHTML = `
            <textarea id="import-json-text">{"foo": 1}</textarea>
            <div id="import-error" class="hidden"></div>
            <div id="import-preview" class="hidden"></div>
            <button id="btn-confirm-import"></button>
        `;
        app.previewImport();

        const err = document.getElementById('import-error');
        expect(err.classList.contains('hidden')).toBe(false);
        expect(err.textContent).toContain('Ongeldig formaat');
    });
});

describe('renderHistory', () => {
    beforeEach(() => {
        store.plans = [];
        store.activePlanId = null;
        store.logs = [];
        document.body.innerHTML = '<div id="history-list"></div>';
    });

    it('should group logs by plan and show the newest session first with set details', () => {
        store.logs = [
            { id: 'l1', planName: 'Plan X', sessionName: 'Push', date: '2026-07-01T10:00:00.000Z', duration: 40, exercisesCompleted: 1,
              exercises: [{ name: 'Bench Press', setsCompleted: 2, totalSets: 3, details: [{ setNumber: 1, weight: '40', reps: '10' }] }] },
            { id: 'l2', planName: 'Plan X', sessionName: 'Pull', date: '2026-07-10T10:00:00.000Z', duration: 35, exercisesCompleted: 1,
              exercises: [{ name: 'Row', setsCompleted: 3, totalSets: 3, details: [] }] }
        ];
        app.renderHistory();

        const html = document.getElementById('history-list').innerHTML;
        expect(html).toContain('Plan X');
        expect(html).toContain('Bench Press');
        expect(html).toContain('Set 1: 40kg x 10');
        // Nieuwste sessie staat bovenaan binnen de plan-groep
        expect(html.indexOf('Pull')).toBeLessThan(html.indexOf('Push'));
    });

    it('should show an empty state when there are no logs', () => {
        app.renderHistory();
        expect(document.getElementById('history-list').innerHTML).toContain('Nog geen sessies');
    });
});

describe('getOverloadSuggestion', () => {
    it('should suggest more weight when all previous sets hit the top of the rep range', () => {
        const ex = { name: 'Bench Press', repsMax: 12, muscleGroups: ['chest'], sets: 3 };
        const prev = [
            { setNumber: 1, weight: '40', reps: '12' },
            { setNumber: 2, weight: '40', reps: '13' },
            { setNumber: 3, weight: '40', reps: '12' }
        ];
        const plan = { progressionRules: { weightIncreaseGuidance: { upperBodyKg: 2.0, lowerBodyKg: 5.0 } } };

        expect(app.getOverloadSuggestion(ex, prev, plan)).toEqual({
            prevWeight: 40,
            maxWeight: 40,
            minWeight: 40,
            allSameWeight: true,
            newWeight: 42,
            increment: 2
        });
    });

    it('should correctly handle varied set weights and report min and max weight', () => {
        const ex = { name: 'Dumbbell Shoulder Press', repsMax: 12, muscleGroups: ['shoulders'], sets: 3 };
        const prev = [
            { setNumber: 1, weight: '10', reps: '12' },
            { setNumber: 2, weight: '12.5', reps: '12' },
            { setNumber: 3, weight: '15', reps: '12' }
        ];
        const plan = { progressionRules: { weightIncreaseGuidance: { upperBodyKg: 2.0, lowerBodyKg: 5.0 } } };

        const suggestion = app.getOverloadSuggestion(ex, prev, plan);
        expect(suggestion).toEqual({
            prevWeight: 15,
            maxWeight: 15,
            minWeight: 10,
            allSameWeight: false,
            newWeight: 16,
            increment: 1
        });
    });

    it('should cap dumbbell exercise increments to realistic +1 kg step for upper body', () => {
        const ex = { name: 'Dumbbell Curl', repsMax: 12, muscleGroups: ['biceps'] };
        const prev = [{ setNumber: 1, weight: '15', reps: '12' }];
        const plan = { progressionRules: { weightIncreaseGuidance: { upperBodyKg: 5.0, lowerBodyKg: 6.0 } } };

        const suggestion = app.getOverloadSuggestion(ex, prev, plan);
        expect(suggestion.increment).toBe(1);
        expect(suggestion.newWeight).toBe(16);
    });

    it('should cap dumbbell exercise increments to realistic +2 kg step for lower body', () => {
        const ex = { name: 'Dumbbell Lunge', repsMax: 10, muscleGroups: ['legs'] };
        const prev = [{ setNumber: 1, weight: '15', reps: '10' }];
        const plan = { progressionRules: { weightIncreaseGuidance: { upperBodyKg: 5.0, lowerBodyKg: 6.0 } } };

        const suggestion = app.getOverloadSuggestion(ex, prev, plan);
        expect(suggestion.increment).toBe(2);
        expect(suggestion.newWeight).toBe(17);
    });

    it('should use the lower body increment for leg exercises', () => {
        const ex = { name: 'Squat', repsMax: 10, muscleGroups: ['legs'], sets: 1 };
        const prev = [{ setNumber: 1, weight: '80', reps: '10' }];
        const plan = { progressionRules: { weightIncreaseGuidance: { upperBodyKg: 2.0, lowerBodyKg: 5.0 } } };

        expect(app.getOverloadSuggestion(ex, prev, plan)).toEqual({
            prevWeight: 80,
            maxWeight: 80,
            minWeight: 80,
            allSameWeight: true,
            newWeight: 85,
            increment: 5
        });
    });

    it('should not suggest anything when the previous session was incomplete', () => {
        const ex = { name: 'Bench Press', repsMax: 12, muscleGroups: ['chest'], sets: 3 };
        // Slechts 1 van de 3 geplande sets gedaan, ook al haalde die de bovenkant
        const prev = [{ setNumber: 1, weight: '40', reps: '12' }];

        expect(app.getOverloadSuggestion(ex, prev, null)).toBeNull();
    });

    it('should not suggest anything when a set stayed below the top of the rep range', () => {
        const ex = { name: 'Bench Press', repsMax: 12, muscleGroups: ['chest'] };
        const prev = [
            { setNumber: 1, weight: '40', reps: '12' },
            { setNumber: 2, weight: '40', reps: '9' }
        ];
        expect(app.getOverloadSuggestion(ex, prev, null)).toBeNull();
    });

    it('should fall back to 2.5 kg without progression rules', () => {
        const ex = { name: 'Row', repsMax: 12, muscleGroups: ['back'] };
        const prev = [{ setNumber: 1, weight: '50', reps: '12' }];

        expect(app.getOverloadSuggestion(ex, prev, null)).toEqual({
            prevWeight: 50,
            maxWeight: 50,
            minWeight: 50,
            allSameWeight: true,
            newWeight: 52.5,
            increment: 2.5
        });
    });

    it('should not suggest anything for bodyweight sets or missing rep targets', () => {
        expect(app.getOverloadSuggestion({ name: 'Plank' }, [{ setNumber: 1, weight: '', reps: '60' }], null)).toBeNull();
        expect(app.getOverloadSuggestion({ name: 'Push-up', repsMax: 15 }, [{ setNumber: 1, weight: '', reps: '15' }], null)).toBeNull();
    });
});

describe('exercise progress', () => {
    beforeEach(() => {
        store.plans = [];
        store.activePlanId = null;
        store.logs = [];
        // Testdata heeft vaste datums: het weken-filter uitzetten
        app.progressWeeks = 'all';
        document.body.innerHTML = '<div id="exercise-progress-list"></div>';
    });

    it('should render a sparkline per exercise with at least two weighted sessions', () => {
        store.logs = [
            { date: '2026-07-01T10:00:00.000Z', exercises: [{ name: 'Bench Press', details: [{ setNumber: 1, weight: '40', reps: '10' }] }] },
            { date: '2026-07-08T10:00:00.000Z', exercises: [{ name: 'Bench Press', details: [{ setNumber: 1, weight: '45', reps: '8' }] }] },
            { date: '2026-07-08T10:00:00.000Z', exercises: [{ name: 'Plank', details: [{ setNumber: 1, weight: '', reps: '' }] }] }
        ];
        app.renderExerciseProgress();

        const html = document.getElementById('exercise-progress-list').innerHTML;
        expect(html).toContain('Bench Press');
        expect(html).toContain('<svg');
        expect(html).toContain('+5 kg');
        // De gewichtswaardes staan als labels in de grafiek
        expect(html).toContain('<text');
        expect(html).toContain('>40</text>');
        expect(html).toContain('>45</text>');
        // Oefeningen zonder gewichtsdata krijgen geen grafiek
        expect(html).not.toContain('Plank');
    });

    it('should limit value labels with an adaptive stride when there are many sessions', () => {
        const weights = [40, 42, 44, 46, 48, 50, 52];
        store.logs = weights.map((wt, i) => ({
            date: `2026-07-0${i + 1}T10:00:00.000Z`,
            exercises: [{ name: 'Squat', details: [{ setNumber: 1, weight: String(wt), reps: '5' }] }]
        }));
        app.renderExerciseProgress();

        const html = document.getElementById('exercise-progress-list').innerHTML;
        // 7 metingen -> met minLabelDistance 45px wordt stride 2 gebruikt (indices 0, 2, 4, 6)
        const labelCount = (html.match(/<text/g) || []).length;
        expect(labelCount).toBe(4);
        expect(html).toContain('>40</text>');
        expect(html).toContain('>44</text>');
        expect(html).toContain('>48</text>');
        expect(html).toContain('>52</text>');
        expect(html).not.toContain('>42</text>');
        expect(html).not.toContain('>46</text>');
    });

    it('should increase label gap stride to 3 when 13 sessions are rendered to prevent overlapping labels like Goblet Squat', () => {
        const weights = [10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 30, 30]; // 13 values
        store.logs = weights.map((wt, i) => ({
            date: `2026-07-${i < 9 ? '0' + (i + 1) : (i + 1)}T10:00:00.000Z`,
            exercises: [{ name: 'Goblet Squat', details: [{ setNumber: 1, weight: String(wt), reps: '10' }] }]
        }));
        app.renderExerciseProgress();

        const html = document.getElementById('exercise-progress-list').innerHTML;
        // 13 metingen -> step ~22.3px -> stride 3 (indices 0, 3, 6, 9, 12)
        const labelMatches = html.match(/<text[^>]*>([^<]+)<\/text>/g) || [];
        expect(labelMatches.length).toBe(5);
        expect(html).toContain('>10</text>'); // idx 0
        expect(html).toContain('>16</text>'); // idx 3
        expect(html).toContain('>22</text>'); // idx 6
        expect(html).toContain('>28</text>'); // idx 9
        expect(html).toContain('>30</text>'); // idx 12
    });

    it('should show a hint when there is not enough data', () => {
        app.renderExerciseProgress();
        expect(document.getElementById('exercise-progress-list').innerHTML).toContain('Geen trainingen met gewichten');
    });

    it('should show the estimated 1RM based on the best set (Epley)', () => {
        store.logs = [
            { date: '2026-07-01T10:00:00.000Z', exercises: [{ name: 'Squat', details: [{ setNumber: 1, weight: '100', reps: '5' }] }] },
            { date: '2026-07-08T10:00:00.000Z', exercises: [{ name: 'Squat', details: [{ setNumber: 1, weight: '90', reps: '1' }] }] }
        ];
        app.renderExerciseProgress();

        // 100 kg x 5 -> 100 * (1 + 5/30) = 116.7 -> 117 kg
        expect(document.getElementById('exercise-progress-list').innerHTML).toContain('Geschat 1RM: 117 kg');
    });

    it('should display hold exercises in seconds and omit estimated 1RM', () => {
        store.logs = [
            { date: '2026-07-01T10:00:00.000Z', exercises: [{ name: 'Plank Hold', details: [{ setNumber: 1, weight: '0', reps: '50', durationSeconds: 50 }] }] },
            { date: '2026-07-08T10:00:00.000Z', exercises: [{ name: 'Plank Hold', details: [{ setNumber: 1, weight: '0', reps: '60', durationSeconds: 60 }] }] }
        ];
        app.renderExerciseProgress();

        const html = document.getElementById('exercise-progress-list').innerHTML;
        expect(html).toContain('Plank Hold');
        expect(html).toContain('+10 sec');
        expect(html).toContain('Laatst: 60 sec');
        expect(html).not.toContain('Geschat 1RM');
    });

    it('should group singular and plural exercise names together in progress series', () => {
        store.logs = [
            { date: '2026-07-01T10:00:00.000Z', exercises: [{ name: 'Dumbbell Bicep Curls', details: [{ setNumber: 1, weight: '12', reps: '10' }] }] },
            { date: '2026-07-08T10:00:00.000Z', exercises: [{ name: 'Dumbbell Bicep Curl', details: [{ setNumber: 1, weight: '14', reps: '10' }] }] }
        ];
        app.renderExerciseProgress();

        const html = document.getElementById('exercise-progress-list').innerHTML;
        expect(html).toContain('Dumbbell Bicep Curl');
        expect(html).toContain('2 sessies');
        expect(html).toContain('+2 kg');
        expect(html).toContain('Laatst: 14 kg');
    });

    it('should aggregate sessions across different schemas and name variations/typos (GOF-20)', () => {
        store.logs = [
            { planName: 'Schema A', date: '2026-07-01T10:00:00.000Z', exercises: [{ name: 'Dumbell Bicep Curl', details: [{ setNumber: 1, weight: '10', reps: '10' }] }] },
            { planName: 'Schema B', date: '2026-07-08T10:00:00.000Z', exercises: [{ name: 'Dumbbell Bicep Curl', details: [{ setNumber: 1, weight: '12', reps: '10' }] }] },
            { planName: 'Schema C', date: '2026-07-15T10:00:00.000Z', exercises: [{ name: 'DB Bicep Curl', details: [{ setNumber: 1, weight: '14', reps: '10' }] }] }
        ];
        app.renderExerciseProgress();

        const html = document.getElementById('exercise-progress-list').innerHTML;
        expect(html).toContain('Dumbbell Bicep Curl');
        expect(html).toContain('3 sessies');
        expect(html).toContain('+4 kg');
        expect(html).toContain('Laatst: 14 kg');
    });

    it('should resolve canonical exercise keys for typos, abbreviations, and parenthetical suffixes', () => {
        expect(app.getCanonicalExerciseKey('Dumbell Bicep Curl')).toBe('def_bicep_curl');
        expect(app.getCanonicalExerciseKey('DB Bicep Curl')).toBe('def_bicep_curl');
        expect(app.getCanonicalExerciseKey('Overhead Press')).toBe('def_overhead_press');
        expect(app.getCanonicalExerciseKey('Overhead Press (OHP)')).toBe('def_overhead_press');
        expect(app.getCanonicalExerciseKey('Bicep Curl')).toBe('def_bicep_curl');
    });

    it('should never render duplicate cards with the same display name even if logs mix exercise IDs and name strings', () => {
        store.plans = [{
            id: 'plan_1',
            sessions: [{
                exercises: [{ id: 'plan_ex_99', name: 'Dumbbell Bicep Curl' }]
            }]
        }];
        store.logs = [
            { planName: 'Schema A', date: '2026-07-01T10:00:00.000Z', exercises: [{ id: 'plan_ex_99', name: 'Dumbbell Bicep Curl', details: [{ setNumber: 1, weight: '10', reps: '10' }] }] },
            { planName: 'Schema B', date: '2026-07-08T10:00:00.000Z', exercises: [{ id: 'def_bicep_curl', name: 'Dumbbell Bicep Curl', details: [{ setNumber: 1, weight: '12', reps: '10' }] }] },
            { planName: 'Schema C', date: '2026-07-15T10:00:00.000Z', exercises: [{ name: 'Bicep Curl', details: [{ setNumber: 1, weight: '14', reps: '10' }] }] }
        ];
        app.renderExerciseProgress();

        const html = document.getElementById('exercise-progress-list').innerHTML;
        const occurrences = (html.match(/Dumbbell Bicep Curl/g) || []).length;
        // Should only render 1 progress card header for Dumbbell Bicep Curl
        expect(occurrences).toBe(1);
        expect(html).toContain('3 sessies');
        expect(html).toContain('+4 kg');
    });

    it('should ignore 0kg sets for weighted exercises on progress graph and only plot sets with extra weight', () => {
        store.logs = [
            { date: '2026-07-01T10:00:00.000Z', exercises: [{ name: 'Walking Lunges', details: [{ setNumber: 1, weight: '0', reps: '20' }] }] },
            { date: '2026-07-05T10:00:00.000Z', exercises: [{ name: 'Walking Lunges', details: [{ setNumber: 1, weight: '0', reps: '20' }] }] },
            { date: '2026-07-10T10:00:00.000Z', exercises: [{ name: 'Walking Lunges', details: [{ setNumber: 1, weight: '4', reps: '12' }] }] }
        ];
        app.renderExerciseProgress();

        const html = document.getElementById('exercise-progress-list').innerHTML;
        expect(html).toContain('Walking Lunges');
        expect(html).toContain('1 sessie');
        expect(html).toContain('Laatst: 4 kg');
        expect(html).not.toContain('20 kg');
    });

    it('should estimate 1RM with the Epley formula', () => {
        expect(app.estimate1RM(100, 1)).toBe(100);
        expect(app.estimate1RM(40, 10)).toBeCloseTo(53.33, 1);
        expect(app.estimate1RM(0, 10)).toBeNull();
        expect(app.estimate1RM(40, 0)).toBeNull();
    });
});

describe('sharePlan & 1-Click Deep Links / QR Code', () => {
    beforeEach(() => {
        store.plans = [{
            id: 'p1',
            name: 'Mijn Schema (Test & Kracht)',
            description: 'Schema met speciale karakters: é, ö, ü!',
            sessions: [
                {
                    id: 's1',
                    name: 'Sessie A',
                    exercises: [{ name: 'Bankdrukken', sets: 3, reps: '8-10' }]
                }
            ]
        }];
        store.activePlanId = 'p1';
        store.logs = [];
        document.body.innerHTML = `
            <div id="toast-container"></div>
            <div id="modal-overlay" class="modal-overlay hidden"></div>
            <div id="modal-share-plan" class="modal-overlay hidden">
                <h3 id="share-plan-modal-title"></h3>
                <p id="share-plan-modal-subtitle"></p>
                <canvas id="share-plan-qr-canvas"></canvas>
            </div>
            <div id="modal-qr-scanner" class="modal-overlay hidden">
                <video id="qr-scanner-video"></video>
                <div id="qr-scanner-status"></div>
                <input type="file" id="qr-file-input">
            </div>
            <div id="modal-confirm-import-link" class="modal-overlay hidden">
                <div id="link-import-preview"></div>
                <button id="btn-confirm-link-import"></button>
            </div>
            <div id="view-plans" class="view">
                <div id="plans-list"></div>
            </div>
        `;
        try { delete global.navigator.share; } catch(e) { global.navigator.share = undefined; }
        try { delete global.navigator.canShare; } catch(e) { global.navigator.canShare = undefined; }
        try { delete global.navigator.clipboard; } catch(e) { global.navigator.clipboard = undefined; }
    });

    afterEach(() => {
        try { delete global.navigator.share; } catch(e) { global.navigator.share = undefined; }
        try { delete global.navigator.canShare; } catch(e) { global.navigator.canShare = undefined; }
        try { delete global.navigator.clipboard; } catch(e) { global.navigator.clipboard = undefined; }
    });

    it('should encode plan into URL-safe string and decode it back identically', () => {
        const plan = store.plans[0];
        const encoded = app.encodePlanForUrl(plan);
        expect(typeof encoded).toBe('string');
        expect(encoded.length).toBeGreaterThan(10);

        const decoded = app.decodePlanFromUrl(encoded);
        expect(decoded).not.toBeNull();
        expect(decoded.name).toBe(plan.name);
        expect(decoded.description).toBe(plan.description);
        expect(decoded.sessions.length).toBe(1);
        expect(decoded.sessions[0].exercises[0].name).toBe('Bankdrukken');
        // id should not be in encoded payload
        expect(decoded.id).toBeUndefined();
    });

    it('should open share plan modal and generate QR code on canvas', () => {
        const modal = document.getElementById('modal-share-plan');
        const titleEl = document.getElementById('share-plan-modal-title');
        const canvas = document.getElementById('share-plan-qr-canvas');

        app.openSharePlanModal('p1');

        expect(modal.classList.contains('hidden')).toBe(false);
        expect(titleEl.textContent).toContain('Mijn Schema');
        expect(app.activeSharePlanId).toBe('p1');
    });

    it('should trigger navigator.share with 1-click URL when sharePlanLink is called', async () => {
        const share = jest.fn().mockResolvedValue();
        Object.defineProperty(global.navigator, 'share', { value: share, configurable: true, writable: true });

        await app.sharePlanLink('p1');

        expect(share).toHaveBeenCalledTimes(1);
        const arg = share.mock.calls[0][0];
        expect(arg.title).toContain('Mijn Schema');
        expect(arg.url).toContain('#plan=');
    });

    it('should copy 1-click URL to clipboard when copyPlanLink is called', async () => {
        const writeText = jest.fn().mockResolvedValue();
        Object.defineProperty(global.navigator, 'clipboard', { value: { writeText }, configurable: true, writable: true });

        await app.copyPlanLink('p1');

        expect(writeText).toHaveBeenCalledTimes(1);
        expect(writeText.mock.calls[0][0]).toContain('#plan=');
    });

    it('should detect #plan= hash on URL and show 1-click import prompt modal', async () => {
        const plan = store.plans[0];
        const encoded = await app.encodePlanForUrl(plan);
        window.location.hash = `#plan=${encoded}`;

        await app.checkUrlForImportedPlan();

        const confirmModal = document.getElementById('modal-confirm-import-link');
        const previewEl = document.getElementById('link-import-preview');

        expect(confirmModal.classList.contains('hidden')).toBe(false);
        expect(previewEl.textContent).toContain('Mijn Schema');
        expect(app.planToImportFromLink).not.toBeNull();
    });

    it('should confirm and import plan from link when confirmImportFromLink is clicked', () => {
        const newPlanData = {
            name: 'Nieuw Gedeeld Schema',
            sessions: [{ name: 'Sessie 1', exercises: [{ name: 'Squat', sets: 3 }] }]
        };
        app.showPlanImportPromptModal(newPlanData);
        expect(app.planToImportFromLink).toEqual(newPlanData);

        const importSpy = jest.spyOn(store, 'importPlan');
        app.confirmImportFromLink();

        expect(importSpy).toHaveBeenCalledWith(newPlanData);
        expect(app.planToImportFromLink).toBeNull();
        expect(document.getElementById('modal-confirm-import-link').classList.contains('hidden')).toBe(true);
        importSpy.mockRestore();
    });

    it('should process scanned QR text and trigger import prompt', async () => {
        const plan = store.plans[0];
        const encoded = await app.encodePlanForUrl(plan);
        const qrText = `https://gofitness.app/#plan=${encoded}`;

        const handled = await app.processQrScannedText(qrText);
        expect(handled).toBe(true);

        const confirmModal = document.getElementById('modal-confirm-import-link');
        expect(confirmModal.classList.contains('hidden')).toBe(false);
    });

    it('should download plan as JSON file via downloadPlan', () => {
        const clickSpy = jest.fn();
        const originalCreateElement = document.createElement.bind(document);
        jest.spyOn(document, 'createElement').mockImplementation((tagName) => {
            const el = originalCreateElement(tagName);
            if (tagName.toLowerCase() === 'a') {
                el.click = clickSpy;
            }
            return el;
        });

        app.downloadPlan('p1');

        expect(clickSpy).toHaveBeenCalled();
        document.createElement.mockRestore();
    });

    it('should generate short share code and publish to cloud when Firestore is available', async () => {
        const mockSet = jest.fn().mockResolvedValue();
        const mockDoc = jest.fn().mockReturnValue({ set: mockSet });
        const mockCollection = jest.fn().mockReturnValue({ doc: mockDoc });
        const mockDb = { collection: mockCollection };

        global.getDb = jest.fn().mockReturnValue(mockDb);

        const plan = store.plans[0];
        const code = await app.publishPlanToCloud(plan);

        expect(code).toMatch(/^GF-[A-Z0-9]{4}$/);
        expect(mockCollection).toHaveBeenCalledWith('shared_plans');
        expect(mockDoc).toHaveBeenCalledWith(code);
        expect(mockSet).toHaveBeenCalledTimes(1);
        expect(plan.shareCode).toBe(code);

        const shareUrl = await app.getPlanShareUrl('p1');
        expect(shareUrl).toContain(`#p=${code}`);

        delete global.getDb;
    });

    it('should fetch plan from cloud and show import modal when #p= shortcode is opened', async () => {
        const cloudPlan = {
            schemaVersion: '2.0',
            name: 'Cloud Workout Plan',
            sessions: [{ name: 'Sessie 1', exercises: [{ name: 'Bench Press', sets: 3 }] }]
        };

        const mockGet = jest.fn().mockResolvedValue({ exists: true, data: () => ({ plan: cloudPlan }) });
        const mockDoc = jest.fn().mockReturnValue({ get: mockGet });
        const mockCollection = jest.fn().mockReturnValue({ doc: mockDoc });
        const mockDb = { collection: mockCollection };

        global.getDb = jest.fn().mockReturnValue(mockDb);

        window.location.hash = '#p=GF-9K2M';
        await app.checkUrlForImportedPlan();

        const confirmModal = document.getElementById('modal-confirm-import-link');
        const previewEl = document.getElementById('link-import-preview');

        expect(confirmModal.classList.contains('hidden')).toBe(false);
        expect(previewEl.textContent).toContain('Cloud Workout Plan');
        expect(app.planToImportFromLink).toEqual(cloudPlan);

        delete global.getDb;
    });
});

describe('wake lock', () => {
    afterEach(() => {
        app.wakeLock = null;
        delete global.navigator.wakeLock;
    });

    it('should request and release a screen wake lock when supported', async () => {
        const release = jest.fn();
        Object.defineProperty(global.navigator, 'wakeLock', {
            value: { request: jest.fn().mockResolvedValue({ release }) },
            configurable: true
        });

        await app.requestWakeLock();
        expect(navigator.wakeLock.request).toHaveBeenCalledWith('screen');
        expect(app.wakeLock).not.toBeNull();

        app.releaseWakeLock();
        expect(release).toHaveBeenCalled();
        expect(app.wakeLock).toBeNull();
    });

    it('should not crash when wake lock is unsupported', async () => {
        await app.requestWakeLock();
        expect(app.wakeLock).toBeNull();
    });
});

describe('renderWorkoutExercises', () => {
    beforeEach(() => {
        store.plans = [];
        store.activePlanId = null;
        store.logs = [];
        document.body.innerHTML = '<div id="workout-exercise-list"></div>';
    });

    it('should render sets, inputs, meta and placeholders from the previous session', () => {
        store.logs = [{ id: 'l1', date: '2026-07-01T10:00:00.000Z', exercises: [{ name: 'Bench Press', details: [{ setNumber: 1, weight: '40', reps: '10' }] }] }];
        app.activeWorkout = {
            session: { id: 's1', name: 'Push' },
            startTime: new Date(),
            exercises: [{
                id: 'e1', name: 'Bench Press', sets: 2, repsMin: 8, repsMax: 12, restSeconds: 90,
                category: 'compound', trackMetrics: ['weight', 'reps'],
                notes: ['Rustig zakken'], alternatives: ['Dumbbell Press'],
                setsCompleted: [true, false], weights: ['42.5', ''], actualReps: ['10', '']
            }]
        };

        app.renderWorkoutExercises();

        const html = document.getElementById('workout-exercise-list').innerHTML;
        expect(html).toContain('Bench Press');
        expect(html).toContain('2 sets');
        expect(html).toContain('8-12 reps');
        expect(html).toContain('90s rust');
        expect(html).toContain('compound');
        expect(html).toContain('Rustig zakken');
        expect((html.match(/class="set-row"/g) || []).length).toBe(2);
        // Ingevulde waarde en placeholder uit de vorige sessie
        expect(html).toContain('value="42.5"');
        expect(html).toContain('placeholder="40"');
        // Eerste set is afgevinkt met PR styling
        expect(html).toContain('check-btn checked-pr');
    });

    it('should escape malicious exercise fields', () => {
        app.activeWorkout = {
            session: { id: 's1', name: 'Push' },
            startTime: new Date(),
            exercises: [{
                id: 'e1', name: '<img src=x onerror=alert(1)>', sets: 1,
                category: '<script>x</script>', notes: '<b onmouseover=x>notitie</b>',
                setsCompleted: [false], weights: [''], actualReps: ['']
            }]
        };

        app.renderWorkoutExercises();

        // Geen daadwerkelijke element-injectie: kwaadaardige namen worden data, geen DOM
        expect(document.querySelector('#workout-exercise-list img')).toBeNull();
        expect(document.querySelector('#workout-exercise-list script')).toBeNull();
        expect(document.getElementById('workout-exercise-list').innerHTML).toContain('&lt;img');
    });

    it('should not steal focus while typing reps: auto-complete only on change', () => {
        app.activeWorkout = {
            session: { id: 's1', name: 'Push' },
            startTime: new Date(),
            exercises: [{
                id: 'e1', name: 'Bench Press', sets: 1, trackMetrics: ['weight', 'reps'],
                setsCompleted: [false], weights: ['40'], actualReps: ['']
            }]
        };
        app.renderWorkoutExercises();

        const repsInput = document.querySelector('#workout-exercise-list input[data-type="reps"]');
        expect(repsInput).not.toBeNull();
        // De onchange-handler finaliseert, de oninput-handler niet
        expect(repsInput.getAttribute('onchange')).toContain('this.value, true');
        expect(repsInput.getAttribute('oninput')).not.toContain('this.value, true');

        // Typen (oninput): het eerste cijfer mag de set niet afvinken of de lijst re-renderen
        app.updateReps(0, 0, '1');
        expect(app.activeWorkout.exercises[0].setsCompleted[0]).toBe(false);
        expect(document.contains(repsInput)).toBe(true);

        // Veld verlaten (onchange): set wordt afgevinkt, maar zonder re-render
        app.updateReps(0, 0, '12', true);
        expect(app.activeWorkout.exercises[0].setsCompleted[0]).toBe(true);
        // Het input-element is niet vervangen -> focus/scroll blijven intact
        expect(document.contains(repsInput)).toBe(true);
        const checkBtn = repsInput.closest('.set-row').querySelector('.check-btn');
        expect(checkBtn.classList.contains('checked')).toBe(true);
    });

    it('should not allow quote-injection into inline handlers via exercise names', () => {
        // Een naam met quotes mag nooit uit de JS-string van een onclick breken
        // (geen '/' in de payload: daar splitst de functie bewust op als alternatieven-scheiding)
        const evil = "x');window.__pwned=true;('";
        const markup = app.formatClickableExerciseName(evil);
        document.body.innerHTML = `<div id="wrap">${markup}</div>`;

        const span = document.querySelector('#wrap .exercise-search-target');
        expect(span.dataset.exerciseName).toBe(evil);
        // De handler haalt de naam uit het data-attribuut, niet uit een letterlijke string
        expect(span.getAttribute('onclick')).toContain('this.dataset.exerciseName');
        expect(span.getAttribute('onclick')).not.toContain('window.__pwned');
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

describe('validatePlanSchema', () => {
    const validPlan = {
        name: 'Full Body Schema',
        sessions: [
            {
                name: 'Sessie A',
                exercises: [
                    { name: 'Squat', sets: 3 },
                    { name: 'Bench Press', sets: 4 }
                ]
            }
        ]
    };

    it('should accept a valid plan schema', () => {
        expect(DataStore.validatePlanSchema(validPlan)).toBe(true);
    });

    it('should reject non-object or null plan data', () => {
        expect(() => DataStore.validatePlanSchema(null)).toThrow("JSON-object");
        expect(() => DataStore.validatePlanSchema("invalid")).toThrow("JSON-object");
        expect(() => DataStore.validatePlanSchema([])).toThrow("JSON-object");
    });

    it('should reject plan data with missing or empty name', () => {
        expect(() => DataStore.validatePlanSchema({ sessions: validPlan.sessions })).toThrow("Schema-naam ('name') is verplicht");
        expect(() => DataStore.validatePlanSchema({ name: '  ', sessions: validPlan.sessions })).toThrow("Schema-naam ('name') is verplicht");
    });

    it('should reject plan data with missing or empty sessions array', () => {
        expect(() => DataStore.validatePlanSchema({ name: 'Plan' })).toThrow("minstens één sessie");
        expect(() => DataStore.validatePlanSchema({ name: 'Plan', sessions: [] })).toThrow("minstens één sessie");
    });

    it('should reject session missing a valid name', () => {
        const invalid = {
            name: 'Plan',
            sessions: [{ name: '', exercises: [{ name: 'Squat', sets: 3 }] }]
        };
        expect(() => DataStore.validatePlanSchema(invalid)).toThrow("Sessienaam ('name') is verplicht");
    });

    it('should reject session missing an exercises array or having empty exercises', () => {
        const invalid1 = {
            name: 'Plan',
            sessions: [{ name: 'Sessie A' }]
        };
        const invalid2 = {
            name: 'Plan',
            sessions: [{ name: 'Sessie A', exercises: [] }]
        };
        expect(() => DataStore.validatePlanSchema(invalid1)).toThrow("minstens één oefening");
        expect(() => DataStore.validatePlanSchema(invalid2)).toThrow("minstens één oefening");
    });

    it('should reject exercise missing a name', () => {
        const invalid = {
            name: 'Plan',
            sessions: [{ name: 'Sessie A', exercises: [{ sets: 3 }] }]
        };
        expect(() => DataStore.validatePlanSchema(invalid)).toThrow("Oefeningnaam ('name') is verplicht");
    });

    it('should reject exercise with missing, non-numeric, or <= 0 sets', () => {
        const invalid1 = {
            name: 'Plan',
            sessions: [{ name: 'Sessie A', exercises: [{ name: 'Squat' }] }]
        };
        const invalid2 = {
            name: 'Plan',
            sessions: [{ name: 'Sessie A', exercises: [{ name: 'Squat', sets: 0 }] }]
        };
        const invalid3 = {
            name: 'Plan',
            sessions: [{ name: 'Sessie A', exercises: [{ name: 'Squat', sets: 'vijf' }] }]
        };
        expect(() => DataStore.validatePlanSchema(invalid1)).toThrow("Aantal sets ('sets') moet een getal groter dan 0 zijn");
        expect(() => DataStore.validatePlanSchema(invalid2)).toThrow("Aantal sets ('sets') moet een getal groter dan 0 zijn");
        expect(() => DataStore.validatePlanSchema(invalid3)).toThrow("Aantal sets ('sets') moet een getal groter dan 0 zijn");
    });

    it('should prevent importing invalid plans into store.importPlan', () => {
        expect(() => store.importPlan({ name: 'Kapot Plan' })).toThrow();
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
        const card = document.querySelector('[data-achievement-id="rhythm"]');
        expect(card.classList.contains('unlocked')).toBe(true);
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
        const card = document.querySelector('[data-achievement-id="chest"]');
        expect(card.classList.contains('unlocked')).toBe(true);
    });

    it('should render locked achievements greyed out with a lock icon', () => {
        store.logs = [];
        app.renderAchievements();

        const cards = document.querySelectorAll('.achievement');
        expect(cards.length).toBe(22);
        const rhythmCard = document.querySelector('[data-achievement-id="rhythm"]');
        expect(rhythmCard.classList.contains('locked')).toBe(true);
        expect(rhythmCard.innerHTML).toContain('lock');
    });

    it('should not unlock the rhythm achievement when a week is skipped', () => {
        store.logs = [
            { date: new Date(2025, 11, 8).toISOString(), duration: 45 },
            { date: new Date(2025, 11, 15).toISOString(), duration: 45 },
            { date: new Date(2025, 11, 29).toISOString(), duration: 45 },
            { date: new Date(2026, 0, 5).toISOString(), duration: 45 }
        ];
        app.renderAchievements();
        const card = document.querySelector('[data-achievement-id="rhythm"]');
        expect(card.classList.contains('unlocked')).toBe(false);
    });
});

describe('html template helper', () => {
    it('should escape interpolated values automatically', () => {
        const result = String(html`<div>${'<script>alert(1)</script>'}</div>`);
        expect(result).toBe('<div>&lt;script&gt;alert(1)&lt;/script&gt;</div>');
    });

    it('should insert nested html results and arrays as HTML', () => {
        const item = html`<li>${'<b>x</b>'}</li>`;
        const result = String(html`<ul>${[item, item]}</ul>`);
        expect(result).toBe('<ul><li>&lt;b&gt;x&lt;/b&gt;</li><li>&lt;b&gt;x&lt;/b&gt;</li></ul>');
    });

    it('should render null, undefined and rawHtml correctly', () => {
        expect(String(html`<p>${null}${undefined}</p>`)).toBe('<p></p>');
        expect(String(html`<p>${rawHtml('<em>ok</em>')}</p>`)).toBe('<p><em>ok</em></p>');
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

    it('should escape markup in toast messages', () => {
        // Foutmeldingen (bijv. JSON.parse-fouten) bevatten ruwe bestandsinhoud
        document.body.innerHTML = '<div id="toast-container"></div>';
        app.showToast('Herstellen mislukt: Unexpected token \'<\', "<img src=x onerror=alert(1)>" is not valid JSON', 'error');

        const html = document.getElementById('toast-container').innerHTML;
        expect(html).not.toContain('<img');
        expect(html).toContain('&lt;img');
    });

    it('should only strip legacy description sections that start on their own line', () => {
        document.body.innerHTML = '<div id="plans-list"></div>';
        store.plans = [{
            id: 'p1', name: 'Plan',
            description: 'Werk in kleine mijlpalen naar je doel.\nHerstelregels: minimaal 48 uur rust.',
            sessions: []
        }];
        store.activePlanId = 'p1';

        app.renderPlans();

        const listHtml = document.getElementById('plans-list').innerHTML;
        // Het woord 'mijlpalen' midden in een zin blijft staan
        expect(listHtml).toContain('Werk in kleine mijlpalen naar je doel.');
        // De sectie op een eigen regel wordt wel weggeknipt
        expect(listHtml).not.toContain('minimaal 48 uur rust');
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

    it('should escape HTML in toast messages', () => {
        document.body.innerHTML = '<div id="toast-container"></div>';
        app.showToast('<img src=x onerror=alert(1)> Foutmelding!', 'error');

        const container = document.getElementById('toast-container');
        expect(container.innerHTML).not.toContain('<img src=x');
        expect(container.innerHTML).toContain('&lt;img src=x onerror=alert(1)&gt;');
    });

    it('should escape achievement title and description when rendering achievements', () => {
        document.body.innerHTML = '<div id="achievements-grid"></div>';
        store.logs = [];

        app.renderAchievements();

        const cards = document.querySelectorAll('.achievement');
        expect(cards.length).toBeGreaterThan(0);
        cards.forEach(card => {
            expect(card.innerHTML).not.toContain('<script>');
            expect(card.innerHTML).not.toContain('<img src=x');
        });
    });
});

describe('PWA manifest', () => {
    it('should have all required PWA manifest fields including id, scope, lang, categories and icons', () => {
        const fs = require('fs');
        const path = require('path');
        const manifestPath = path.join(__dirname, 'manifest.json');
        const manifestRaw = fs.readFileSync(manifestPath, 'utf8');
        const manifest = JSON.parse(manifestRaw);

        expect(manifest.id).toBe('./');
        expect(manifest.scope).toBe('./');
        expect(manifest.lang).toBe('nl');
        expect(manifest.name).toBe('Go Fitness');
        expect(manifest.start_url).toBe('./index.html');
        expect(manifest.display).toBe('standalone');
        expect(Array.isArray(manifest.categories)).toBe(true);
        expect(manifest.categories).toContain('fitness');

        expect(Array.isArray(manifest.icons)).toBe(true);
        expect(manifest.icons.length).toBeGreaterThanOrEqual(2);
        const maskableIcon = manifest.icons.find(i => i.purpose === 'maskable');
        expect(maskableIcon).toBeDefined();
    });
});

describe('Hold Timer (Stopwatch)', () => {
    beforeEach(() => {
        store.plans = [];
        store.activePlanId = null;
        store.logs = [];
        app.activeWorkout = null;
        if (app.holdTimerState && app.holdTimerState.intervalId) {
            clearInterval(app.holdTimerState.intervalId);
        }
        app.holdTimerState = null;
    });

    afterEach(() => {
        if (app.holdTimerState && app.holdTimerState.intervalId) {
            clearInterval(app.holdTimerState.intervalId);
        }
        app.holdTimerState = null;
    });

    it('should correctly identify hold/isometric exercises', () => {
        expect(app.isHoldExercise({ name: 'Side Plank' })).toBe(true);
        expect(app.isHoldExercise({ name: 'Plank hold' })).toBe(true);
        expect(app.isHoldExercise({ name: 'Side Raise' })).toBe(true);
        expect(app.isHoldExercise({ name: 'Wall Sit' })).toBe(true);
        expect(app.isHoldExercise({ name: 'Bench Press' })).toBe(false);
        expect(app.isHoldExercise({ name: 'Custom', exerciseType: 'isometric' })).toBe(true);
        expect(app.isHoldExercise({ name: 'Custom', trackMetrics: ['duration_seconds'] })).toBe(true);
    });

    it('should allow setting start delay seconds in DataStore', () => {
        store.setHoldTimerDelaySeconds(5);
        expect(store.holdTimerDelaySeconds).toBe(5);

        store.setHoldTimerDelaySeconds(0);
        expect(store.holdTimerDelaySeconds).toBe(0);
    });

    it('should calculate gross duration minus 1 second reaction time compensation on stop', () => {
        const mockSession = {
            id: 'sess_1',
            name: 'Test Session',
            exercises: [
                { id: 'ex_1', name: 'Side Plank', sets: 2, actualReps: ['', ''], setsCompleted: [false, false] }
            ]
        };
        app.activeWorkout = {
            session: mockSession,
            exercises: mockSession.exercises
        };

        store.holdTimerDelaySeconds = 0; // zero delay for immediate test
        app.startHoldTimer(0, 0);

        expect(app.holdTimerState).not.toBeNull();
        expect(app.holdTimerState.status).toBe('running');

        // Simulate 10 seconds elapsed time deterministically
        app.holdTimerState.startTime = Date.now() - 10000;

        // Stop timer
        app.stopHoldTimer(true);

        // Gross 10s minus 1s offset compensation = 9s
        expect(app.activeWorkout.exercises[0].actualReps[0]).toBe('9');
        expect(app.activeWorkout.exercises[0].setsCompleted[0]).toBe(true);
        expect(app.holdTimerState).toBeNull();
    });

    it('should adjust duration using adjustDuration (+1s, -1s)', () => {
        const mockSession = {
            id: 'sess_1',
            name: 'Test Session',
            exercises: [
                { id: 'ex_1', name: 'Plank', sets: 1, actualReps: ['20'] }
            ]
        };
        app.activeWorkout = {
            session: mockSession,
            exercises: mockSession.exercises
        };

        app.adjustDuration(0, 0, 1);
        expect(app.activeWorkout.exercises[0].actualReps[0]).toBe('21');

        app.adjustDuration(0, 0, -1);
        expect(app.activeWorkout.exercises[0].actualReps[0]).toBe('20');

        app.adjustDuration(0, 0, -30); // should not go below 0
        expect(app.activeWorkout.exercises[0].actualReps[0]).toBe('0');
    });

    it('should auto-select the first uncompleted set when starting timer without setIndex', () => {
        const mockSession = {
            id: 'sess_1',
            name: 'Test Session',
            exercises: [
                { id: 'ex_1', name: 'Plank', sets: 3, actualReps: ['30', '', ''], setsCompleted: [true, false, false] }
            ]
        };
        app.activeWorkout = {
            session: mockSession,
            exercises: mockSession.exercises
        };

        store.holdTimerDelaySeconds = 0;
        app.startHoldTimer(0);

        expect(app.holdTimerState.setIndex).toBe(1); // auto-selected set 2 (index 1)
    });

    it('should auto-complete hold exercises when duration is entered via updateReps or adjustDuration', () => {
        const mockSession = {
            id: 'sess_1',
            name: 'Test Session',
            exercises: [
                { id: 'ex_1', name: 'Plank Hold', sets: 2, actualReps: ['', ''], setsCompleted: [false, false] }
            ]
        };
        app.activeWorkout = {
            session: mockSession,
            exercises: mockSession.exercises
        };

        // finalize=true: pas afvinken wanneer de invoer af is (change/Enter),
        // niet tijdens het typen — anders wordt '450' al na '45' afgevinkt
        app.updateReps(0, 0, '45', true);
        expect(app.activeWorkout.exercises[0].setsCompleted[0]).toBe(true);

        app.adjustDuration(0, 1, 30);
        expect(app.activeWorkout.exercises[0].setsCompleted[1]).toBe(true);
    });

    it('should sequentially complete sets in timed exercises on stopHoldTimer', () => {
        const mockSession = {
            id: 'sess_1',
            name: 'Test Session',
            exercises: [
                { id: 'ex_1', name: 'Plank Hold', sets: 3, actualReps: ['', '', ''], setsCompleted: [false, false, false] }
            ]
        };
        app.activeWorkout = {
            session: mockSession,
            exercises: mockSession.exercises
        };
        store.holdTimerDelaySeconds = 0;

        // Run set 1 timer
        app.startHoldTimer(0);
        expect(app.holdTimerState.setIndex).toBe(0);
        app.holdTimerState.startTime = Date.now() - 31000;
        app.stopHoldTimer(true);

        expect(app.activeWorkout.exercises[0].actualReps[0]).toBe('30');
        expect(app.activeWorkout.exercises[0].setsCompleted[0]).toBe(true);

        // Run set 2 timer (should automatically pick index 1)
        app.startHoldTimer(0);
        expect(app.holdTimerState.setIndex).toBe(1);
        app.holdTimerState.startTime = Date.now() - 41000;
        app.stopHoldTimer(true);

        expect(app.activeWorkout.exercises[0].actualReps[1]).toBe('40');
        expect(app.activeWorkout.exercises[0].setsCompleted[1]).toBe(true);
    });

    describe('getPreviousAchievedDuration and green timer state (GOF-24)', () => {
        it('should return previous set duration from previous session log', () => {
            store.logs = [
                {
                    id: 'log_1',
                    date: '2026-08-01',
                    exercises: [
                        {
                            name: 'Plank Hold',
                            details: [
                                { set: 1, reps: '35', completed: true },
                                { set: 2, reps: '45', completed: true }
                            ]
                        }
                    ]
                }
            ];

            const ex = { name: 'Plank Hold', sets: 2 };
            expect(app.getPreviousAchievedDuration(ex, 0)).toBe(35);
            expect(app.getPreviousAchievedDuration(ex, 1)).toBe(45);
        });

        it('should fallback to earlier sets or historical logs or planned duration', () => {
            store.logs = [
                {
                    id: 'log_old',
                    date: '2026-07-20',
                    exercises: [
                        {
                            name: 'Side Plank',
                            details: [
                                { set: 1, reps: '50', completed: true }
                            ]
                        }
                    ]
                }
            ];

            // Set 2 not in log, but historical log has 50
            const ex = { name: 'Side Plank', sets: 3 };
            expect(app.getPreviousAchievedDuration(ex, 1)).toBe(50);

            // Exercise with planned durationSeconds fallback
            const plannedEx = { name: 'Wall Sit', durationSeconds: 60 };
            expect(app.getPreviousAchievedDuration(plannedEx, 0)).toBe(60);

            // Exercise with no history or duration
            const unknownEx = { name: 'Brand New Hold Exercise' };
            expect(app.getPreviousAchievedDuration(unknownEx, 0)).toBe(0);
        });

        it('should color the timer green and vibrate when elapsed time exceeds previous achieved time', () => {
            const mockVibrate = jest.fn();
            global.navigator.vibrate = mockVibrate;

            store.logs = [
                {
                    id: 'log_prev',
                    date: '2026-08-10',
                    exercises: [
                        {
                            name: 'Plank Hold',
                            details: [
                                { set: 1, reps: '30', completed: true }
                            ]
                        }
                    ]
                }
            ];

            const mockSession = {
                id: 'sess_1',
                name: 'Test Session',
                exercises: [
                    { id: 'ex_1', name: 'Plank Hold', sets: 2, actualReps: ['', ''], setsCompleted: [false, false] }
                ]
            };
            app.activeWorkout = {
                session: mockSession,
                exercises: mockSession.exercises
            };

            document.body.innerHTML = `
                <div id="workout-exercise-list">
                    <button id="hold-timer-btn-0" class="hold-timer-btn"></button>
                </div>
            `;

            store.holdTimerDelaySeconds = 0;
            app.startHoldTimer(0, 0);

            const btnEl = document.getElementById('hold-timer-btn-0');
            expect(btnEl).not.toBeNull();

            // Simulate 20s elapsed time (previous was 30s): should still be red/running, not green
            app.holdTimerState.startTime = Date.now() - 20000;
            const ex = app.activeWorkout.exercises[0];
            const targetSec = app.getPreviousAchievedDuration(ex, 0);
            expect(targetSec).toBe(30);

            // Tick timer update directly
            const currentNow20 = Date.now();
            const elapsed20 = Math.floor((currentNow20 - app.holdTimerState.startTime) / 1000);
            expect(elapsed20 >= 20 && elapsed20 < 30).toBe(true);

            // Simulate 35s elapsed time (exceeding previous 30s): should turn green
            app.holdTimerState.startTime = Date.now() - 35000;
            const currentNow35 = Date.now();
            const elapsed35 = Math.floor((currentNow35 - app.holdTimerState.startTime) / 1000);
            expect(elapsed35 > 30).toBe(true);

            // Re-render exercises: button should have green and passed-previous classes
            app.renderWorkoutExercises();
            const renderedBtn = document.getElementById('hold-timer-btn-0');
            expect(renderedBtn.className).toContain('running');
            expect(renderedBtn.className).toContain('green');
            expect(renderedBtn.className).toContain('passed-previous');

            app.stopHoldTimer(false);
        });
    });
});

describe('clickable exercise web search', () => {
    it('should split compound exercise names into individual clickable search targets', () => {
        const html = app.formatClickableExerciseName('Leg Press of Squat');
        expect(html).toContain('exercise-search-target');
        expect(html).toContain('Leg Press');
        expect(html).toContain('Squat');
        expect(html).toContain('app.triggerExerciseSearch');
    });

    it('should handle single exercise names correctly', () => {
        const html = app.formatClickableExerciseName('Bench Press');
        expect(html).toContain('exercise-search-target');
        expect(html).toContain('Bench Press');
    });

    it('should select text and open search window on triggerExerciseSearch', () => {
        const openSpy = jest.spyOn(window, 'open').mockImplementation(() => {});
        const mockEl = document.createElement('div');
        mockEl.textContent = 'Leg Press';

        app.triggerExerciseSearch('Leg Press', { stopPropagation: jest.fn() }, mockEl);

        expect(openSpy).toHaveBeenCalledWith(
            'https://www.google.com/search?q=Leg%20Press',
            '_blank'
        );

        openSpy.mockRestore();
    });
});

describe('Exercise Library & Custom Vrije Sessie', () => {
    let mockLocalStorage;

    beforeEach(() => {
        store.customExercises = [];
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
        Object.defineProperty(global, 'localStorage', {
            value: mockLocalStorage,
            configurable: true
        });
    });

    it('should retrieve exercise library containing default and custom exercises', () => {
        const store = new DataStore();
        const library = store.getExerciseLibrary();

        expect(library.length).toBeGreaterThan(15); // contains built-in exercises
        expect(library.some(e => e.name === 'Barbell Bench Press')).toBe(true);
        expect(library.some(e => e.name === 'Incline Bench Press')).toBe(true);

        const customEx = store.addCustomExercise({
            name: 'Bulgarian Split Squat',
            muscleGroups: ['legs', 'glutes'],
            exerciseType: 'weight_reps'
        });

        const updatedLib = store.getExerciseLibrary();
        expect(updatedLib.some(e => e.name === 'Bulgarian Split Squat')).toBe(true);
    });

    it('should allow adding, updating and deleting custom exercises', () => {
        const testStore = new DataStore();
        testStore.customExercises = [];
        const created = testStore.addCustomExercise({
            name: 'Pike Push-Up',
            muscleGroups: ['shoulders', 'triceps'],
            exerciseType: 'bodyweight_reps'
        });

        expect(created.id).toBeDefined();
        expect(testStore.customExercises.length).toBe(1);

        testStore.updateCustomExercise(created.id, { name: 'Pike Pushup Modified' });
        expect(testStore.customExercises[0].name).toBe('Pike Pushup Modified');

        testStore.deleteCustomExercise(created.id);
        expect(testStore.customExercises.length).toBe(0);
    });

    it('should detect exercise type based on exercise name keywords', () => {
        expect(app.detectExerciseType('Plank Hold').exerciseType).toBe('duration');
        expect(app.detectExerciseType('Hardlopen').exerciseType).toBe('duration');
        expect(app.detectExerciseType('Pull-Up').exerciseType).toBe('bodyweight_reps');
        expect(app.detectExerciseType('Dumbbell Bicep Curl').exerciseType).toBe('weight_reps');
    });

    it('should start a Vrije Sessie workout correctly', () => {
        const navigateSpy = jest.spyOn(app, 'navigate').mockImplementation(() => {});

        app.startCustomWorkout();

        expect(app.activeWorkout).toBeDefined();
        expect(app.activeWorkout.session.name).toBe('Vrije Sessie');
        expect(app.activeWorkout.exercises).toEqual([]);

        navigateSpy.mockRestore();
    });

    it('should add exercise to active workout and match previous exercise history', () => {
        const navigateSpy = jest.spyOn(app, 'navigate').mockImplementation(() => {});

        // Pre-populate previous log
        store.logs = [
            {
                id: 'log_1',
                date: new Date().toISOString(),
                exercises: [
                    {
                        name: 'Barbell Bench Press',
                        details: [{ setNumber: 1, weight: '80', reps: '10' }]
                    }
                ]
            }
        ];

        app.startCustomWorkout();
        app.addExerciseToActiveWorkout({
            name: 'Barbell Bench Press',
            muscleGroups: ['chest'],
            exerciseType: 'weight_reps'
        }, 3, '10');

        expect(app.activeWorkout.exercises.length).toBe(1);
        expect(app.activeWorkout.exercises[0].name).toBe('Barbell Bench Press');

        const prevDetails = app.getPreviousExerciseDetails('Barbell Bench Press');
        expect(prevDetails).toBeDefined();
        expect(prevDetails[0].weight).toBe('80');

        // Composite name matching: 'Bench Press of Chest Press Machine' -> 'Barbell Bench Press' or 'Bench Press'
        const compositeDetails = app.getPreviousExerciseDetails('Barbell Bench Press of Chest Press Machine');
        expect(compositeDetails).toBeDefined();
        expect(compositeDetails[0].weight).toBe('80');

        // Exercise object matching with chosen variation
        const exObj = { name: 'Leg Press of Squat', chosenVariation: 'Barbell Bench Press' };
        const objectDetails = app.getPreviousExerciseDetails(exObj.name, exObj);
        expect(objectDetails).toBeDefined();
        expect(objectDetails[0].weight).toBe('80');

        const summaryText = app.formatPreviousDetailsSummary(prevDetails);
        expect(summaryText).toContain('80kg × 10 reps');

        // Deep token extraction test: parentheses & modifiers
        const tokensRow = app.extractExerciseNameTokens('Row Machine (Roeimachine)');
        expect(tokensRow.has('roeimachine')).toBe(true);
        expect(tokensRow.has('row machine')).toBe(true);

        const tokensRDL = app.extractExerciseNameTokens('Romanian Deadlift (RDL)');
        expect(tokensRDL.has('rdl')).toBe(true);
        expect(tokensRDL.has('romanian deadlift')).toBe(true);

        // Specific variation isolation test
        const gobletEx = { name: 'Goblet Squat of Leg Press', chosenVariation: 'Goblet Squat' };
        const gobletTokens = app.extractExerciseNameTokens(gobletEx.name, gobletEx);
        expect(gobletTokens.has('goblet squat')).toBe(true);
        expect(gobletTokens.has('leg press')).toBe(false);

        const legPressEx = { name: 'Goblet Squat of Leg Press', chosenVariation: 'Leg Press' };
        const legPressTokens = app.extractExerciseNameTokens(legPressEx.name, legPressEx);
        expect(legPressTokens.has('leg press')).toBe(true);
        expect(legPressTokens.has('goblet squat')).toBe(false);

        const unchosenEx = { name: 'Goblet Squat of Leg Press', chosenVariation: '' };
        const unchosenTokens = app.extractExerciseNameTokens(unchosenEx.name, unchosenEx);
        expect(unchosenTokens.size).toBe(0);

        navigateSpy.mockRestore();
    });

    it('should save and update custom exercise with alternatives', () => {
        const customEx = store.addCustomExercise({
            name: 'Bulgarian Split Squat Test',
            muscleGroups: ['legs', 'glutes'],
            exerciseType: 'weight_reps',
            category: 'compound',
            alternatives: ['Leg Press', 'Dumbbell Lunge']
        });

        expect(customEx.alternatives).toEqual(['Leg Press', 'Dumbbell Lunge']);

        const updated = store.updateCustomExercise(customEx.id, {
            alternatives: ['Barbell Squat', 'Leg Press']
        });

        expect(updated.alternatives).toEqual(['Barbell Squat', 'Leg Press']);

        const lib = store.getExerciseLibrary();
        const found = lib.find(e => e.id === customEx.id);
        expect(found).toBeDefined();
        expect(found.alternatives).toEqual(['Barbell Squat', 'Leg Press']);
    });

    it('should split Seated Cable Row and Row Machine with duration and stand input', () => {
        const lib = store.getExerciseLibrary();
        const seatedRow = lib.find(e => e.name === 'Seated Cable Row');
        const rowMachine = lib.find(e => e.name === 'Row Machine (Roeimachine)');

        expect(seatedRow).toBeDefined();
        expect(seatedRow.exerciseType).toBe('weight_reps');

        expect(rowMachine).toBeDefined();
        expect(rowMachine.exerciseType).toBe('duration');
        expect(rowMachine.trackMetrics).toContain('level');

        // Test exercise type detection
        const detectedSeated = app.detectExerciseType('Seated Cable Row');
        expect(detectedSeated.exerciseType).toBe('weight_reps');

        const detectedMachine = app.detectExerciseType('Row Machine (Roeimachine)');
        expect(detectedMachine.exerciseType).toBe('duration');

        // Test hold timer check
        expect(app.isHoldExercise(rowMachine)).toBe(true);

        // Test updating level input and finishing workout
        app.startCustomWorkout();
        app.addExerciseToActiveWorkout(rowMachine, 2, '300');

        const exIndex = 0;
        app.updateLevel(exIndex, 0, 'Stand 6');
        app.updateReps(exIndex, 0, '300');
        app.activeWorkout.exercises[exIndex].setsCompleted[0] = true;

        expect(app.activeWorkout.exercises[exIndex].levels[0]).toBe('Stand 6');

        app.finishWorkout();

        const latestLog = store.logs[store.logs.length - 1];
        expect(latestLog).toBeDefined();
        const loggedEx = latestLog.exercises.find(e => e.name === 'Row Machine (Roeimachine)');
        expect(loggedEx).toBeDefined();
        expect(loggedEx.details[0].level).toBe('Stand 6');
    });
});

describe('editing logged session date & time', () => {
    beforeEach(() => {
        store.logs = [];
        store.plans = [];
    });

    it('should format ISO dates into datetime-local string format', () => {
        const iso = '2026-07-20T14:30:00.000Z';
        const formatted = app.formatDateTimeLocal(iso);
        expect(formatted).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
    });

    it('should update log date when updateEditLogDate is called', () => {
        app.logToEdit = {
            id: 'log_1',
            date: '2026-07-01T10:00:00.000Z',
            duration: 45,
            exercises: []
        };

        app.updateEditLogDate('2026-07-15T18:45');

        const newDate = new Date(app.logToEdit.date);
        expect(newDate).toBeDefined();
        expect(isNaN(newDate.getTime())).toBe(false);
    });

    it('should save edited session date and time to store.logs', () => {
        const renderHomeSpy = jest.spyOn(app, 'renderHome').mockImplementation(() => {});
        const renderProgressSpy = jest.spyOn(app, 'renderProgress').mockImplementation(() => {});

        const originalLog = {
            id: 'log_100',
            sessionName: 'Push A',
            date: '2026-07-01T10:00:00.000Z',
            duration: 45,
            exercisesCompleted: 1,
            exercises: [
                {
                    name: 'Bench Press',
                    setsCompleted: 1,
                    details: [{ setNumber: 1, weight: '60', reps: '10' }]
                }
            ]
        };
        store.logs = [originalLog];

        document.body.innerHTML = `
            <div id="modal-edit-log" class="modal-overlay hidden"></div>
            <div id="edit-log-container"></div>
            <div id="toast-container"></div>
            <div id="history-list"></div>
        `;

        app.showEditLogModal('log_100');
        expect(app.logToEdit).toBeDefined();

        app.updateEditLogDate('2026-07-25T14:30');
        app.saveEditLog();

        expect(store.logs[0].date).toBeDefined();
        expect(isNaN(new Date(store.logs[0].date).getTime())).toBe(false);
        expect(store.logs[0].updatedAt).toBeDefined();

        renderHomeSpy.mockRestore();
        renderProgressSpy.mockRestore();
    });

    it('should add extra exercise to logToEdit when addExerciseToEditLog is called', () => {
        app.logToEdit = {
            id: 'log_101',
            sessionName: 'Push A',
            exercises: [
                { name: 'Bench Press', details: [{ setNumber: 1, weight: '60', reps: '10' }] }
            ]
        };

        document.body.innerHTML = `
            <div id="modal-edit-log" class="modal-overlay hidden"></div>
            <div id="edit-log-container"></div>
            <div id="toast-container"></div>
        `;

        app.addExerciseToEditLog({ name: 'Incline Dumbbell Press', muscleGroups: ['borst', 'schouders'] }, 3, '10');

        expect(app.logToEdit.exercises.length).toBe(2);
        expect(app.logToEdit.exercises[1].name).toBe('Incline Dumbbell Press');
        expect(app.logToEdit.exercises[1].details.length).toBe(3);
    });

    it('should add set to exercise when addSetToEditLog is called', () => {
        app.logToEdit = {
            id: 'log_102',
            exercises: [
                { name: 'Squat', details: [{ setNumber: 1, weight: '80', reps: '8' }] }
            ]
        };

        document.body.innerHTML = `
            <div id="modal-edit-log" class="modal-overlay hidden"></div>
            <div id="edit-log-container"></div>
            <div id="toast-container"></div>
        `;

        app.addSetToEditLog(0);

        expect(app.logToEdit.exercises[0].details.length).toBe(2);
        expect(app.logToEdit.exercises[0].details[1].setNumber).toBe(2);
        expect(app.logToEdit.exercises[0].details[1].weight).toBe('80');
    });

    it('should remove set and exercise from logToEdit', () => {
        app.logToEdit = {
            id: 'log_103',
            exercises: [
                { name: 'Squat', details: [{ setNumber: 1, weight: '80', reps: '8' }, { setNumber: 2, weight: '80', reps: '8' }] },
                { name: 'Leg Press', details: [{ setNumber: 1, weight: '120', reps: '10' }] }
            ]
        };

        document.body.innerHTML = `
            <div id="modal-edit-log" class="modal-overlay hidden"></div>
            <div id="edit-log-container"></div>
            <div id="toast-container"></div>
        `;

        app.removeSetFromEditLog(0, 0);
        expect(app.logToEdit.exercises[0].details.length).toBe(1);
        expect(app.logToEdit.exercises[0].details[0].setNumber).toBe(1);

        app.removeExerciseFromEditLog(1);
        expect(app.logToEdit.exercises.length).toBe(1);
        expect(app.logToEdit.exercises[0].name).toBe('Squat');
    });
});

describe('add and remove sets during workout', () => {
    beforeEach(() => {
        store.plans = [];
        store.logs = [];
        app.activeWorkout = null;
        document.body.innerHTML = '<div id="workout-exercise-list"></div><div id="toast-container"></div>';
    });

    it('should default Row Machine to 1 set when added to active workout', () => {
        const rowMachine = store.getExerciseLibrary().find(e => e.name === 'Row Machine (Roeimachine)');
        expect(rowMachine).toBeDefined();
        expect(rowMachine.defaultSets).toBe(1);

        app.startCustomWorkout();
        app.addExerciseToActiveWorkout(rowMachine);

        expect(app.activeWorkout.exercises[0].sets).toBe(1);
        expect(app.activeWorkout.exercises[0].setsCompleted.length).toBe(1);
    });

    it('should allow adding a set to an exercise during workout without prefilling values if no set history exists', () => {
        app.startCustomWorkout();
        app.addExerciseToActiveWorkout({ name: 'Bench Press', exerciseType: 'weight_reps' }, 2);

        app.activeWorkout.exercises[0].weights = ['80', '85'];
        app.activeWorkout.exercises[0].actualReps = ['10', '8'];

        app.addSetToExercise(0);

        expect(app.activeWorkout.exercises[0].sets).toBe(3);
        expect(app.activeWorkout.exercises[0].setsCompleted.length).toBe(3);
        expect(app.activeWorkout.exercises[0].setsCompleted[2]).toBe(false);
        expect(app.activeWorkout.exercises[0].weights[2]).toBe('');
        expect(app.activeWorkout.exercises[0].actualReps[2]).toBe('');
    });

    it('should allow removing a set from an exercise during workout', () => {
        app.startCustomWorkout();
        app.addExerciseToActiveWorkout({ name: 'Squat', exerciseType: 'weight_reps' }, 3);
        app.activeWorkout.exercises[0].weights = ['100', '110', '120'];

        app.removeSetFromExercise(0, 1);

        expect(app.activeWorkout.exercises[0].sets).toBe(2);
        expect(app.activeWorkout.exercises[0].weights).toEqual(['100', '120']);
    });

    it('should prevent reducing sets below 1', () => {
        app.startCustomWorkout();
        app.addExerciseToActiveWorkout({ name: 'Deadlift', exerciseType: 'weight_reps' }, 1);

        app.removeSetFromExercise(0, 0);

        expect(app.activeWorkout.exercises[0].sets).toBe(1);
    });

    it('should include Romanian Deadlift (RDL) and Dumbbell Romanian Deadlift (DB RDL) in exercise library', () => {
        const library = store.getExerciseLibrary();
        const rdl = library.find(e => e.id === 'def_romanian_deadlift');
        const dbRdl = library.find(e => e.id === 'def_db_romanian_deadlift');

        expect(rdl).toBeDefined();
        expect(rdl.name).toBe('Romanian Deadlift (RDL)');
        expect(rdl.muscleGroups).toEqual(['legs', 'glutes', 'back']);
        expect(rdl.category).toBe('compound');
        expect(rdl.alternatives).toContain('Dumbbell Romanian Deadlift');

        expect(dbRdl).toBeDefined();
        expect(dbRdl.name).toBe('Dumbbell Romanian Deadlift (DB RDL)');
        expect(dbRdl.muscleGroups).toEqual(['legs', 'glutes', 'back']);
    });

    it('should correctly guess muscle groups for Romanian Deadlift and RDL names', () => {
        const groupsRDL = app.guessMuscleGroupsFromName('Romanian Deadlift');
        expect(groupsRDL).toContain('back');
        expect(groupsRDL).toContain('legs');
        expect(groupsRDL).toContain('glutes');

        const groupsShortRDL = app.guessMuscleGroupsFromName('DB RDL');
        expect(groupsShortRDL).toContain('back');
        expect(groupsShortRDL).toContain('legs');
        expect(groupsShortRDL).toContain('glutes');
    });

    it('should deduplicate plan exercises matching default exercises like Romanian Deadlift', () => {
        store.plans = [
            {
                id: 'plan_test',
                sessions: [
                    {
                        exercises: [{ name: 'Romanian Deadlift', muscleGroups: ['hamstrings', 'glutes', 'legs'] }]
                    }
                ]
            }
        ];
        const library = store.getExerciseLibrary();
        const rdls = library.filter(e => e.name.toLowerCase().includes('romanian deadlift') && !e.name.toLowerCase().includes('dumbbell'));
        expect(rdls.length).toBe(1);
        expect(rdls[0].name).toBe('Romanian Deadlift (RDL)');
    });

    describe('Visual Statistics Sharing', () => {
        beforeEach(() => {
            document.body.innerHTML = `
                <div id="modal-share-stats" class="modal-overlay hidden">
                    <input type="checkbox" id="share-opt-stats" checked>
                    <input type="checkbox" id="share-opt-progress" checked>
                    <input type="checkbox" id="share-opt-muscles" checked>
                    <div id="share-stats-empty-msg" class="hidden"></div>
                    <img id="share-stats-img-preview" style="display:none;">
                    <canvas id="share-stats-canvas"></canvas>
                    <button id="btn-action-share-img"></button>
                    <button id="btn-download-share-img"></button>
                </div>
                <div id="toast-container"></div>
            `;
        });

        it('should open and hide the share stats modal', () => {
            const modal = document.getElementById('modal-share-stats');
            app.openShareStatsModal();
            expect(modal.classList.contains('hidden')).toBe(false);

            app.hideShareStatsModal();
            expect(modal.classList.contains('hidden')).toBe(true);
        });

        it('should handle preview rendering when no sections are selected', () => {
            document.getElementById('share-opt-stats').checked = false;
            document.getElementById('share-opt-progress').checked = false;
            document.getElementById('share-opt-muscles').checked = false;

            app.renderShareStatsPreview();

            const emptyMsg = document.getElementById('share-stats-empty-msg');
            const btnShare = document.getElementById('btn-action-share-img');
            expect(emptyMsg.classList.contains('hidden')).toBe(false);
            expect(btnShare.disabled).toBe(true);
        });

        it('should generate canvas with selected options without crashing', () => {
            const canvas = document.getElementById('share-stats-canvas');
            canvas.getContext = jest.fn().mockReturnValue({
                createLinearGradient: jest.fn().mockReturnValue({ addColorStop: jest.fn() }),
                fillRect: jest.fn(),
                beginPath: jest.fn(),
                arc: jest.fn(),
                fill: jest.fn(),
                fillText: jest.fn(),
                moveTo: jest.fn(),
                lineTo: jest.fn(),
                quadraticCurveTo: jest.fn(),
                closePath: jest.fn(),
                stroke: jest.fn()
            });

            store.logs = [
                {
                    id: 'log1',
                    date: '2026-08-10',
                    duration: 60,
                    exercisesCompleted: 3,
                    exercises: [{ name: 'Bench Press', muscleGroups: ['chest'], details: [{ weight: 80, reps: 10 }] }]
                }
            ];

            app.renderShareStatsPreview();

            expect(canvas.width).toBe(1000);
            expect(canvas.height).toBeGreaterThan(100);
        });

        it('should trigger download when downloadStatsImage is called', () => {
            const canvas = document.getElementById('share-stats-canvas');
            canvas.toDataURL = jest.fn().mockReturnValue('data:image/png;base64,fake');
            app.showToast = jest.fn();

            app.downloadStatsImage();

            expect(canvas.toDataURL).toHaveBeenCalledWith('image/png');
        });

        it('GOF-21: should omit duplicate top title and render section labels when stats, progress, and muscles are selected', () => {
            const canvas = document.getElementById('share-stats-canvas');
            const fillTextCalls = [];
            canvas.getContext = jest.fn().mockReturnValue({
                createLinearGradient: jest.fn().mockReturnValue({ addColorStop: jest.fn() }),
                fillRect: jest.fn(),
                beginPath: jest.fn(),
                arc: jest.fn(),
                fill: jest.fn(),
                fillText: jest.fn((text, x, y) => fillTextCalls.push({ text, x, y })),
                moveTo: jest.fn(),
                lineTo: jest.fn(),
                quadraticCurveTo: jest.fn(),
                closePath: jest.fn(),
                stroke: jest.fn()
            });

            store.plans = [{
                id: 'plan_test',
                sessions: [{
                    exercises: [{ id: 'ex_bench', name: 'Barbell Bench Press', muscleGroups: ['chest'] }]
                }]
            }];

            store.logs = [
                {
                    id: 'log1',
                    date: '2026-08-10T10:00:00.000Z',
                    duration: 60,
                    exercisesCompleted: 2,
                    exercises: [
                        { name: 'Barbell Bench Press', muscleGroups: ['chest'], details: [{ weight: 80, reps: 10 }, { weight: 90, reps: 8 }] },
                        { name: 'Pull Up', muscleGroups: ['back'], details: [{ weight: 0, reps: 12 }] }
                    ]
                },
                {
                    id: 'log2',
                    date: '2026-08-12T10:00:00.000Z',
                    duration: 45,
                    exercisesCompleted: 1,
                    exercises: [
                        { name: 'Barbell Bench Press', muscleGroups: ['chest'], details: [{ weight: 85, reps: 10 }] }
                    ]
                }
            ];

            document.getElementById('share-opt-stats').checked = true;
            document.getElementById('share-opt-progress').checked = true;
            document.getElementById('share-opt-muscles').checked = true;

            app.renderShareStatsPreview();

            // Check that the duplicate top title 'Statistieken' is NOT drawn separately from the section label
            const drawnTexts = fillTextCalls.map(c => c.text);
            const statsHeaders = drawnTexts.filter(t => t === 'STATISTIEKEN' || t === 'Statistieken');
            // Only 1 section label 'STATISTIEKEN' should be present
            expect(statsHeaders).toEqual(['STATISTIEKEN']);
            expect(drawnTexts).toContain('PROGRESSIE');
            expect(drawnTexts).toContain('SPIERGROEPEN');

            // Total height should accurately accommodate all 3 sections without clipping
            expect(canvas.width).toBe(1000);
            expect(canvas.height).toBeGreaterThan(600);
        });

        it('GOF-21: should compute exact canvas height without clipping when all 3 sections are enabled with multiple items', () => {
            const canvas = document.createElement('canvas');
            canvas.getContext = jest.fn().mockReturnValue({
                createLinearGradient: jest.fn().mockReturnValue({ addColorStop: jest.fn() }),
                fillRect: jest.fn(),
                beginPath: jest.fn(),
                arc: jest.fn(),
                fill: jest.fn(),
                fillText: jest.fn(),
                moveTo: jest.fn(),
                lineTo: jest.fn(),
                quadraticCurveTo: jest.fn(),
                closePath: jest.fn(),
                stroke: jest.fn()
            });

            store.plans = [];
            store.logs = [
                {
                    id: 'log1',
                    date: '2026-08-01T10:00:00.000Z',
                    exercises: [
                        { name: 'Ex A', muscleGroups: ['chest'], details: [{ weight: 50, reps: 10 }] },
                        { name: 'Ex B', muscleGroups: ['back'], details: [{ weight: 60, reps: 10 }] },
                        { name: 'Ex C', muscleGroups: ['legs'], details: [{ weight: 70, reps: 10 }] },
                        { name: 'Ex D', muscleGroups: ['shoulders'], details: [{ weight: 80, reps: 10 }] },
                        { name: 'Ex E', muscleGroups: ['biceps'], details: [{ weight: 30, reps: 10 }] }
                    ]
                }
            ];

            app.generateStatsCanvas(canvas, true, true, true);

            // startY (32) + Stats (26 + 224 + 28 = 278) + Progress (26 + (3 * 190 + 2 * 16) + 28 = 656) + Muscles (26 + (2 * 210 + 1 * 16) + 28 = 490) + bottomPadding (32) = 1488
            expect(canvas.height).toBe(1488);
        });
    });

    describe('GOF-5: Set Check Button Achievements', () => {
        beforeEach(() => {
            store.logs = [
                {
                    id: 'log_old_pr',
                    date: '2026-06-01',
                    exercises: [
                        {
                            name: 'Barbell Bench Press',
                            details: [
                                { weight: 60, reps: 10 }
                            ]
                        }
                    ]
                },
                {
                    id: 'log_prev',
                    date: '2026-08-01',
                    exercises: [
                        {
                            name: 'Barbell Bench Press',
                            details: [
                                { weight: 50, reps: 10 },
                                { weight: 50, reps: 10 }
                            ]
                        }
                    ]
                }
            ];
            app.activeWorkout = {
                id: 'workout_current',
                exercises: [
                    {
                        id: 'ex_1',
                        name: 'Barbell Bench Press',
                        sets: 2,
                        setsCompleted: [false, false],
                        weights: ['50', '52.5'],
                        actualReps: ['10', '10']
                    }
                ]
            };
        });

        it('should evaluate normal set completion when matching previous performance', () => {
            app.activeWorkout.exercises[0].setsCompleted[0] = true;
            app.activeWorkout.exercises[0].weights[0] = '50';
            app.activeWorkout.exercises[0].actualReps[0] = '10';

            const status = app.evaluateSetAchievement(app.activeWorkout.exercises[0], 0);
            expect(status).toBe('normal');
        });

        it('should evaluate progressive overload when exceeding previous session performance', () => {
            app.activeWorkout.exercises[0].setsCompleted[0] = true;
            app.activeWorkout.exercises[0].weights[0] = '52.5';
            app.activeWorkout.exercises[0].actualReps[0] = '10';

            const status = app.evaluateSetAchievement(app.activeWorkout.exercises[0], 0);
            expect(status).toBe('overload');
        });

        it('should evaluate PR when beating all-time historical 1RM/max weight', () => {
            app.activeWorkout.exercises[0].setsCompleted[0] = true;
            app.activeWorkout.exercises[0].weights[0] = '70';
            app.activeWorkout.exercises[0].actualReps[0] = '10';

            const status = app.evaluateSetAchievement(app.activeWorkout.exercises[0], 0);
            expect(status).toBe('pr');
        });
    });

    describe('GOF-18: Schema list rendering and collapse functionality', () => {
        beforeEach(() => {
            document.body.innerHTML = `
                <div id="plans-list"></div>
                <div id="exercise-library-list"></div>
            `;
            store.plans = [
                {
                    id: 'plan-1',
                    name: 'Inactief Schema',
                    description: 'Beschrijving van inactief schema',
                    sessions: [{ id: 's1', name: 'Sessie 1', exercises: [] }]
                },
                {
                    id: 'plan-2',
                    name: 'Actief Schema',
                    description: 'Beschrijving van actief schema',
                    sessions: [{ id: 's2', name: 'Sessie 2', exercises: [] }]
                }
            ];
            store.activePlanId = 'plan-2';
        });

        it('should render active plan at the top of plans list below custom workout card', () => {
            app.renderPlans();

            const planList = document.getElementById('plans-list');
            const cards = planList.children;
            // First card is Vrije Sessie
            expect(cards[0].textContent).toContain('Vrije Sessie');
            // Second card should be Actief Schema (plan-2) because it is active
            expect(cards[1].textContent).toContain('Actief Schema');
            // Third card should be Inactief Schema (plan-1)
            expect(cards[2].textContent).toContain('Inactief Schema');
        });

        it('should collapse sessions list for inactive plans and expand for active plans', () => {
            app.renderPlans();

            const planList = document.getElementById('plans-list');
            const activeCard = planList.children[1];
            const inactiveCard = planList.children[2];

            // Active card sessions container should NOT have 'hidden' class
            const activeSessionsContainer = activeCard.querySelector('.flex-col.gap-2:not(.hidden)');
            expect(activeSessionsContainer).not.toBeNull();

            // Inactive card sessions container SHOULD have 'hidden' class
            const inactiveSessionsContainer = inactiveCard.querySelector('.flex-col.gap-2.hidden');
            expect(inactiveSessionsContainer).not.toBeNull();
        });
    });

    describe('GOF-7: Extra set and extra exercise retention in edit log', () => {
        it('should preserve extra sets and extra exercises when opening showEditLogModal', () => {
            store.plans = [{
                id: 'plan-gof7',
                name: 'Test Plan',
                sessions: [{
                    id: 'session-gof7',
                    name: 'Leg Day',
                    exercises: [
                        { name: 'Squat', sets: 3 }
                    ]
                }]
            }];

            store.logs = [{
                id: 'log-gof7',
                planId: 'plan-gof7',
                sessionId: 'session-gof7',
                planName: 'Test Plan',
                sessionName: 'Leg Day',
                date: '2026-08-10T10:00:00.000Z',
                exercises: [
                    {
                        name: 'Squat',
                        setsCompleted: 4,
                        totalSets: 4,
                        details: [
                            { setNumber: 1, weight: '100', reps: '10' },
                            { setNumber: 2, weight: '100', reps: '10' },
                            { setNumber: 3, weight: '100', reps: '10' },
                            { setNumber: 4, weight: '105', reps: '8' }
                        ]
                    },
                    {
                        name: 'Dumbbell Bicep Curl',
                        setsCompleted: 2,
                        totalSets: 2,
                        details: [
                            { setNumber: 1, weight: '14', reps: '12' },
                            { setNumber: 2, weight: '14', reps: '12' }
                        ]
                    }
                ]
            }];

            app.showEditLogModal('log-gof7');

            expect(app.logToEdit).not.toBeNull();
            expect(app.logToEdit.exercises.length).toBe(2);

            // Squat should retain all 4 sets (despite session default of 3)
            const squat = app.logToEdit.exercises.find(e => e.name === 'Squat');
            expect(squat.totalSets).toBe(4);
            expect(squat.details.length).toBe(4);
            expect(squat.details[3].setNumber).toBe(4);
            expect(squat.details[3].weight).toBe('105');

            // Extra exercise (Dumbbell Bicep Curl) should be retained with completed flags
            const bicep = app.logToEdit.exercises.find(e => e.name === 'Dumbbell Bicep Curl');
            expect(bicep).not.toBeUndefined();
            expect(bicep.details.length).toBe(2);
            expect(bicep.details[0].completed).toBe(true);

            // Saving edit log should keep all 4 Squat sets and the Bicep Curl exercise intact in store.logs
            app.saveEditLog();

            const updatedLog = store.logs.find(l => l.id === 'log-gof7');
            expect(updatedLog.exercises.length).toBe(2);
            const updatedSquat = updatedLog.exercises.find(e => e.name === 'Squat');
            expect(updatedSquat.details.length).toBe(4);
            expect(updatedSquat.details[3].weight).toBe('105');
        });
    });

    describe('GOF-19: Friends exercise sorting (matched first, then non-matched)', () => {
        beforeEach(() => {
            document.body.innerHTML = '<div id="friends-container"></div>';
            global.FriendsManager = {
                user: { uid: 'user1', displayName: 'User 1' },
                userProfile: { uid: 'user1', displayName: 'User 1', friendCode: 'GF-1111-2222-3333' },
                friends: [
                    {
                        uid: 'friend1',
                        displayName: 'Friend 1',
                        stats: {
                            muscleGroups: {
                                chest: {
                                    exercises: [
                                        { exercise: 'Incline Bench Press', maxKg: 80, maxReps: 10, estimated1RM: 100 },
                                        { exercise: 'Dumbbell Flyes', maxKg: 20, maxReps: 12, estimated1RM: 28 }
                                    ]
                                }
                            }
                        }
                    }
                ],
                selectedFriendUid: 'friend1'
            };
            store.logs = [
                {
                    id: 'log1',
                    date: '2026-08-10',
                    exercises: [
                        {
                            name: 'Barbell Bench Press',
                            details: [{ weight: 100, reps: 5, completed: true }]
                        },
                        {
                            name: 'Incline Bench Press',
                            details: [{ weight: 70, reps: 8, completed: true }]
                        }
                    ]
                }
            ];
        });

        it('should sort matched exercises first followed by unmatched exercises within each muscle group', () => {
            app.renderFriends();
            const container = document.getElementById('friends-container');
            const chestSection = container.querySelector('.muscle-group-section');
            const exerciseCards = chestSection.querySelectorAll('.exercise-compare-card');
            
            expect(exerciseCards.length).toBe(3);
            const titles = Array.from(exerciseCards).map(card => {
                const titleEl = card.children[0] && card.children[0].children[0];
                return titleEl ? titleEl.textContent.trim() : '';
            });
            // Incline Bench Press is present for both (matched) -> should be first
            // Barbell Bench Press (only my user) & Dumbbell Flyes (only friend) -> non-matched, sorted alphabetically
            expect(titles[0]).toBe('Incline Bench Press');
        });

        it('should sort exercises with newest date first per muscle group', () => {
            global.FriendsManager.friends = [
                {
                    uid: 'friend1',
                    displayName: 'Friend 1',
                    stats: {
                        muscleGroups: {
                            chest: {
                                exercises: [
                                    { exercise: 'Dumbbell Flyes', maxKg: 20, maxReps: 12, estimated1RM: 28, date: '2026-08-25' }
                                ]
                            }
                        }
                    }
                }
            ];
            store.logs = [
                {
                    id: 'log_old',
                    date: '2026-08-01',
                    exercises: [
                        {
                            name: 'Barbell Bench Press',
                            details: [{ weight: 100, reps: 5, completed: true }]
                        }
                    ]
                },
                {
                    id: 'log_new',
                    date: '2026-08-20',
                    exercises: [
                        {
                            name: 'Incline Bench Press',
                            details: [{ weight: 70, reps: 8, completed: true }]
                        }
                    ]
                }
            ];

            app.renderFriends();
            const container = document.getElementById('friends-container');
            const chestSection = container.querySelector('.muscle-group-section');
            const exerciseCards = chestSection.querySelectorAll('.exercise-compare-card');
            const titles = Array.from(exerciseCards).map(card => {
                const titleEl = card.children[0] && card.children[0].children[0];
                return titleEl ? titleEl.textContent.trim() : '';
            });

            // Dumbbell Flyes (2026-08-25) > Incline Bench Press (2026-08-20) > Barbell Bench Press (2026-08-01)
            expect(titles[0]).toBe('Dumbbell Flyes');
            expect(titles[1]).toBe('Incline Bench Press');
            expect(titles[2]).toBe('Barbell Bench Press');
        });

        it('should show golden crown PR badge for users with data and not for Geen data', () => {
            app.renderFriends();
            const container = document.getElementById('friends-container');
            const cards = container.querySelectorAll('.exercise-compare-card');
            
            // First card is Incline Bench Press (both have data)
            const inclineCard = cards[0];
            const prBadgesIncline = inclineCard.querySelectorAll('.pr-crown-badge');
            expect(prBadgesIncline.length).toBe(2); // both JIJ and Friend 1 get PR crown
            expect(prBadgesIncline[0].textContent).toContain('PR');
            expect(prBadgesIncline[0].textContent).toContain('👑');

            // Barbell Bench Press: JIJ has data, Friend 1 has "Geen data"
            const barbellCard = Array.from(cards).find(c => c.textContent.includes('Barbell Bench Press'));
            expect(barbellCard).toBeDefined();
            const prBadgesBarbell = barbellCard.querySelectorAll('.pr-crown-badge');
            expect(prBadgesBarbell.length).toBe(1); // only JIJ gets PR crown
        });

        it('calculateExerciseMaxesByMuscleGroup should attach isPR: true to max records', () => {
            const maxes = app.calculateExerciseMaxesByMuscleGroup();
            expect(maxes.chest).toBeDefined();
            maxes.chest.forEach(entry => {
                expect(entry.isPR).toBe(true);
            });
        });
    });

    describe('GOF-9: Extra set handling', () => {
        beforeEach(() => {
            store.logs = [
                {
                    id: 'log_2sets',
                    date: '2026-08-01',
                    exercises: [
                        {
                            name: 'Barbell Bench Press',
                            details: [
                                { weight: 80, reps: 10 },
                                { weight: 80, reps: 8 }
                            ]
                        }
                    ]
                }
            ];
            app.activeWorkout = {
                id: 'workout_test',
                exercises: [
                    {
                        id: 'ex_bench',
                        name: 'Barbell Bench Press',
                        sets: 2,
                        setsCompleted: [false, false],
                        weights: ['80', '80'],
                        actualReps: ['10', '8'],
                        levels: ['', '']
                    }
                ]
            };
        });

        it('getPreviousSetDetails returns correct set detail if present in history, or null if set index missing', () => {
            const set0 = app.getPreviousSetDetails('Barbell Bench Press', 0);
            const set1 = app.getPreviousSetDetails('Barbell Bench Press', 1);
            const set2 = app.getPreviousSetDetails('Barbell Bench Press', 2);

            expect(set0).toEqual({ weight: 80, reps: 10 });
            expect(set1).toEqual({ weight: 80, reps: 8 });
            expect(set2).toBeNull();
        });

        it('addSetToExercise leaves new set empty if set index does not exist in history', () => {
            app.addSetToExercise(0);

            const ex = app.activeWorkout.exercises[0];
            expect(ex.sets).toBe(3);
            expect(ex.setsCompleted.length).toBe(3);
            expect(ex.weights[2]).toBe('');
            expect(ex.actualReps[2]).toBe('');
            expect(ex.levels[2]).toBe('');
        });

        it('addSetToExercise populates matching set history if set index exists in historical log', () => {
            store.logs.unshift({
                id: 'log_3sets',
                date: '2026-08-05',
                exercises: [
                    {
                        name: 'Barbell Bench Press',
                        details: [
                            { weight: 80, reps: 10 },
                            { weight: 80, reps: 8 },
                            { weight: 75, reps: 6 }
                        ]
                    }
                ]
            });

            app.addSetToExercise(0);

            const ex = app.activeWorkout.exercises[0];
            expect(ex.sets).toBe(3);
            expect(ex.weights[2]).toBe('75');
            expect(ex.actualReps[2]).toBe('6');
        });
    });

    describe('GOF-8: Exercise library cleanup and schema exercise matching', () => {
        it('should resolve canonical keys for plurals, hyphens, and compound words', () => {
            expect(app.getCanonicalExerciseKey('Dumbbell Bicep Curls')).toBe('def_bicep_curl');
            expect(app.getCanonicalExerciseKey('Pushups')).toBe('def_pushup');
            expect(app.getCanonicalExerciseKey('Push-ups')).toBe('def_pushup');
            expect(app.getCanonicalExerciseKey('Push up')).toBe('def_pushup');
            expect(app.getCanonicalExerciseKey('Pull-ups')).toBe('def_pullup');
            expect(app.getCanonicalExerciseKey('Chest Dips')).toBe('def_dip');
        });

        it('should deduplicate schema exercises in getExerciseLibrary when schema contains variations', () => {
            store.plans = [
                {
                    id: 'plan_test_gof8',
                    name: 'GOF-8 Test Plan',
                    sessions: [
                        {
                            id: 's_gof8',
                            name: 'Session 1',
                            exercises: [
                                { name: 'Dumbbell Bicep Curls' },
                                { name: 'Push-ups' },
                                { name: 'Unieke Custom Oefening Zonder Library Match' }
                            ]
                        }
                    ]
                }
            ];

            const lib = store.getExerciseLibrary();
            // Dumbbell Bicep Curls and Push-ups should match def_bicep_curl and def_pushup, so no new fromPlan items for them
            const fromPlanItems = lib.filter(ex => ex.fromPlan);
            expect(fromPlanItems.length).toBe(1);
            expect(fromPlanItems[0].name).toBe('Unieke Custom Oefening Zonder Library Match');
        });

        it('should aggregate exercise maxes by canonical exercise name in calculateExerciseMaxesByMuscleGroup', () => {
            store.logs = [
                {
                    id: 'l1',
                    date: '2026-08-01',
                    exercises: [
                        {
                            name: 'Dumbell Bicep Curl',
                            muscleGroups: ['biceps'],
                            details: [{ weight: 12, reps: 10 }]
                        }
                    ]
                },
                {
                    id: 'l2',
                    date: '2026-08-05',
                    exercises: [
                        {
                            name: 'Dumbbell Bicep Curls',
                            muscleGroups: ['biceps'],
                            details: [{ weight: 14, reps: 10 }]
                        }
                    ]
                }
            ];

            const maxes = app.calculateExerciseMaxesByMuscleGroup();
            expect(maxes.biceps).toBeDefined();
            // Both variations should be aggregated under the canonical name "Dumbbell Bicep Curl"
            const bicepEntry = maxes.biceps.find(e => app.getCanonicalExerciseKey(e.exercise) === 'def_bicep_curl');
            expect(bicepEntry).toBeDefined();
            expect(bicepEntry.maxKg).toBe(14);
        });
    });

    describe('GOF-23: Sessie Header minder hoog', () => {
        it('should have reduced vertical padding for .workout-header in style.css compared to .top-nav', () => {
            const fs = require('fs');
            const path = require('path');
            const cssPath = path.join(__dirname, 'style.css');
            const cssContent = fs.readFileSync(cssPath, 'utf8');

            // .workout-header should have 12px vertical padding (reduced from 20px by ~1/3)
            expect(cssContent).toMatch(/\.workout-header\s*\{[^}]*padding:\s*12px\s+20px;/);
            // .top-nav should maintain its standard 20px padding
            expect(cssContent).toMatch(/\.top-nav\s*\{[^}]*padding:\s*20px;/);
        });

        it('should have .workout-header element in the workout view in index.html', () => {
            const fs = require('fs');
            const path = require('path');
            const htmlPath = path.join(__dirname, 'index.html');
            const htmlContent = fs.readFileSync(htmlPath, 'utf8');

            expect(htmlContent).toContain('<header class="workout-header">');
        });
    });

    describe('GOF-22: Rusttimer bovenaan onder de sessieheader', () => {
        it('should place #rest-timer under .workout-header inside .workout-sticky-header before #workout-exercise-list in index.html', () => {
            const fs = require('fs');
            const path = require('path');
            const htmlPath = path.join(__dirname, 'index.html');
            const htmlContent = fs.readFileSync(htmlPath, 'utf8');

            expect(htmlContent).toContain('<div class="workout-sticky-header">');
            const stickyHeaderIdx = htmlContent.indexOf('<div class="workout-sticky-header">');
            const workoutHeaderIdx = htmlContent.indexOf('<header class="workout-header">', stickyHeaderIdx);
            const restTimerIdx = htmlContent.indexOf('id="rest-timer"', stickyHeaderIdx);
            const exerciseListIdx = htmlContent.indexOf('id="workout-exercise-list"');

            expect(workoutHeaderIdx).toBeGreaterThan(stickyHeaderIdx);
            expect(restTimerIdx).toBeGreaterThan(workoutHeaderIdx);
            expect(exerciseListIdx).toBeGreaterThan(restTimerIdx);
        });

        it('should style .workout-sticky-header and .rest-timer at the top and not at the bottom in style.css', () => {
            const fs = require('fs');
            const path = require('path');
            const cssPath = path.join(__dirname, 'style.css');
            const cssContent = fs.readFileSync(cssPath, 'utf8');

            expect(cssContent).toContain('.workout-sticky-header');
            expect(cssContent).toMatch(/\.workout-sticky-header\s*\{[^}]*position:\s*sticky;/);
            expect(cssContent).toMatch(/\.workout-sticky-header\s*\{[^}]*top:\s*0;/);

            // .rest-timer should not have fixed bottom positioning
            expect(cssContent).not.toMatch(/\.rest-timer\s*\{[^}]*bottom:\s*96px;/);
        });
    });

    describe('GOF-25: Preset Bibliotheek, Startersschema & AI Template Generator', () => {
        beforeEach(() => {
            document.body.innerHTML = `
                <div id="app">
                    <section id="view-home" class="view active">
                        <h1 id="home-date">Vandaag</h1>
                        <div id="recovery-status" class="status-badge green">
                            <span class="material-icons-round">battery_charging_full</span>
                            <span id="recovery-text">Klaar om te trainen</span>
                            <span id="recovery-hours" class="recovery-hours-text"></span>
                        </div>
                        <div class="recommended-card glass-panel">
                            <h3 id="recommended-card-title">Aanbevolen Sessie</h3>
                            <h2 id="recommended-session-name">Geen schema actief</h2>
                            <p id="recommended-reason" class="text-muted">Importeer eerst een trainingsschema.</p>
                            <div id="session-picker-wrapper" class="hidden mt-3">
                                <select id="home-session-select" class="input-field"></select>
                            </div>
                            <button id="btn-start-session" class="btn-primary mt-4" disabled>Start Nu</button>
                        </div>
                        <div class="stats-mini mt-4">
                            <span id="stat-streak">0</span>
                            <span id="stat-completed">0</span>
                        </div>
                    </section>

                    <section id="view-plans" class="view">
                        <div id="preset-plans-container" class="mt-4"></div>
                        <div id="ai-generator-panel" class="glass-panel mt-4"></div>
                        <div id="plans-list" class="flex-col gap-3"></div>
                        <div id="exercise-library-list"></div>
                        <div id="sync-panel">
                            <span id="sync-status">uit</span>
                            <div id="sync-detail"></div>
                            <div id="sync-actions"></div>
                        </div>
                    </section>
                </div>
            `;
            store.plans = [];
            store.activePlanId = null;
            store.logs = [];
            store.customExercises = [];
            app.activeWorkout = null;
            app._presetsExpanded = undefined;
        });

        it('should have valid PRESET_PLANS that pass DataStore.validatePlanSchema', () => {
            const { PRESET_PLANS } = require('./app');
            expect(Array.isArray(PRESET_PLANS)).toBe(true);
            expect(PRESET_PLANS.length).toBeGreaterThanOrEqual(3);

            PRESET_PLANS.forEach(preset => {
                expect(() => DataStore.validatePlanSchema(preset)).not.toThrow();
                expect(preset.id).toBeTruthy();
                expect(preset.name).toBeTruthy();
                expect(preset.sessions.length).toBeGreaterThanOrEqual(2);
                preset.sessions.forEach(sess => {
                    expect(sess.name).toBeTruthy();
                    expect(sess.exercises.length).toBeGreaterThanOrEqual(4);
                    sess.exercises.forEach(ex => {
                        expect(ex.name).toBeTruthy();
                        expect(ex.sets).toBeGreaterThan(0);
                    });
                });
            });
        });

        it('should load a preset plan and set it as active via app.loadPresetPlan', () => {
            const loaded = app.loadPresetPlan('preset_beginner_gym_mix');
            expect(loaded).toBeTruthy();
            expect(loaded.name).toBe('Beginner Gym + Lichaamsgewicht Mix');
            expect(store.plans.length).toBe(1);
            expect(store.activePlanId).toBe(loaded.id);

            // Loading again should not duplicate
            const reloaded = app.loadPresetPlan('preset_beginner_gym_mix');
            expect(store.plans.length).toBe(1);
            expect(reloaded.id).toBe(loaded.id);
        });

        it('should start session directly if autoStartSession is true in app.loadPresetPlan', () => {
            const startWorkoutSpy = jest.spyOn(app, 'startWorkout').mockImplementation(() => {});
            const loaded = app.loadPresetPlan('preset_beginner_gym_mix', true);
            expect(startWorkoutSpy).toHaveBeenCalledWith(loaded.sessions[0], loaded);
            startWorkoutSpy.mockRestore();
        });

        it('should return null and show error toast when loading invalid preset ID', () => {
            const toastSpy = jest.spyOn(app, 'showToast').mockImplementation(() => {});
            const result = app.loadPresetPlan('non_existent_preset');
            expect(result).toBeNull();
            expect(toastSpy).toHaveBeenCalledWith('Preset schema niet gevonden.', 'error');
            toastSpy.mockRestore();
        });

        it('should render friendly onboarding starter card on Home when store.plans is empty', () => {
            store.plans = [];
            store.activePlanId = null;
            app.renderHome();

            const titleEl = document.getElementById('recommended-card-title');
            const nameEl = document.getElementById('recommended-session-name');
            const btnStart = document.getElementById('btn-start-session');
            const choosePresetsBtn = document.getElementById('btn-home-presets');

            expect(titleEl.textContent).toBe('⚡ Direct Starten');
            expect(nameEl.textContent).toBe('Beginner Gym + Lichaamsgewicht Mix');
            expect(btnStart.textContent).toBe('⚡ Start Beginnersschema');
            expect(btnStart.disabled).toBe(false);
            expect(choosePresetsBtn).toBeTruthy();
            expect(choosePresetsBtn.classList.contains('hidden')).toBe(false);
        });

        it('should generate complete AI Prompt with schema v2.0 and library exercises', () => {
            const prompt = app.getAIPromptText();
            expect(prompt).toContain('GoFitness');
            expect(prompt).toContain('GOFITNESS SCHEMA v2.0 JSON STRUCTUUR');
            expect(prompt).toContain('GOFITNESS OEFENINGENBIBLIOTHEEK');
            expect(prompt).toContain('Barbell Bench Press');
            expect(prompt).toContain('Barbell Back Squat');
            expect(prompt).toContain('Lat Pulldown');
            expect(prompt).toContain('Push-Up');
        });

        it('should copy AI prompt to clipboard via app.copyAIPrompt', async () => {
            const writeTextMock = jest.fn().mockResolvedValue(undefined);
            Object.assign(navigator, {
                clipboard: {
                    writeText: writeTextMock
                }
            });
            const toastSpy = jest.spyOn(app, 'showToast').mockImplementation(() => {});

            await app.copyAIPrompt();
            expect(writeTextMock).toHaveBeenCalled();
            expect(writeTextMock.mock.calls[0][0]).toContain('GOFITNESS SCHEMA v2.0 JSON STRUCTUUR');
            expect(toastSpy).toHaveBeenCalledWith('AI Prompt gekopieerd naar klembord!', 'success');

            toastSpy.mockRestore();
        });

        it('should trigger JSON download via app.downloadTemplateJSON', () => {
            const clickMock = jest.fn();
            const originalCreateElement = document.createElement.bind(document);
            jest.spyOn(document, 'createElement').mockImplementation((tag) => {
                const el = originalCreateElement(tag);
                if (tag === 'a') {
                    el.click = clickMock;
                }
                return el;
            });
            const toastSpy = jest.spyOn(app, 'showToast').mockImplementation(() => {});

            app.downloadTemplateJSON();
            expect(clickMock).toHaveBeenCalled();
            expect(toastSpy).toHaveBeenCalledWith('Template JSON gedownload!', 'success');

            document.createElement.mockRestore();
            toastSpy.mockRestore();
        });

        it('should render Presets and AI Generator in renderPlans', () => {
            app.renderPlans();

            const presetContainer = document.getElementById('preset-plans-container');
            const aiPanel = document.getElementById('ai-generator-panel');

            expect(presetContainer.innerHTML).toContain('Preset Bibliotheek');
            expect(presetContainer.innerHTML).toContain('Beginner Gym + Lichaamsgewicht Mix');
            expect(presetContainer.innerHTML).toContain('Full Body Thuis &amp; Lichaamsgewicht');
            expect(presetContainer.innerHTML).toContain('Upper / Lower Split (4 Dagen)');

            expect(aiPanel.innerHTML).toContain('AI Schema Assistent');
            expect(aiPanel.innerHTML).toContain('Kopieer AI Prompt');
            expect(aiPanel.innerHTML).toContain('Download Template');
        });

        it('should toggle presets expansion state via app.togglePresetsExpanded', () => {
            app._presetsExpanded = false;
            app.togglePresetsExpanded();
            expect(app._presetsExpanded).toBe(true);

            app.togglePresetsExpanded();
            expect(app._presetsExpanded).toBe(false);
        });

        it('should check index.html for correct structure with plans-list above presets and moved sync-panel', () => {
            const fs = require('fs');
            const path = require('path');
            const htmlPath = path.join(__dirname, 'index.html');
            const htmlContent = fs.readFileSync(htmlPath, 'utf8');

            expect(htmlContent).toContain('id="plans-list"');
            expect(htmlContent).toContain('id="preset-plans-container"');
            expect(htmlContent).toContain('id="ai-generator-panel"');
            expect(htmlContent).toContain('id="sync-panel"');

            const plansListIdx = htmlContent.indexOf('id="plans-list"');
            const presetIdx = htmlContent.indexOf('id="preset-plans-container"');
            const aiIdx = htmlContent.indexOf('id="ai-generator-panel"');
            const libIdx = htmlContent.indexOf('id="exercise-library-list"');
            const syncIdx = htmlContent.indexOf('id="sync-panel"');

            expect(presetIdx).toBeGreaterThan(plansListIdx);
            expect(aiIdx).toBeGreaterThan(presetIdx);
            expect(libIdx).toBeGreaterThan(aiIdx);
            expect(syncIdx).toBeGreaterThan(libIdx); // Sync panel is moved to the bottom!
        });
    });

    describe('Keyboard dismissal and focus handling on set completion', () => {
        beforeEach(() => {
            document.body.innerHTML = `
                <div id="workout-exercise-list">
                    <div class="set-row">
                        <input class="weight-input" data-ex="0" data-set="0" data-type="weight" value="50" />
                        <input class="weight-input" data-ex="0" data-set="0" data-type="reps" value="10" />
                    </div>
                    <div class="set-row">
                        <input class="weight-input" data-ex="0" data-set="1" data-type="weight" value="50" />
                        <input class="weight-input" data-ex="0" data-set="1" data-type="reps" value="" />
                    </div>
                </div>
                <div id="rest-timer" class="hidden"><span id="rest-timer-label"></span></div>
            `;
            app.activeWorkout = {
                id: 'workout_focus_test',
                exercises: [
                    {
                        name: 'Squat',
                        sets: 2,
                        setsCompleted: [false, false],
                        weights: ['50', '50'],
                        actualReps: ['10', ''],
                        restSeconds: 60
                    }
                ]
            };
        });

        it('should move focus to reps input when Enter is pressed on weight in the same set', () => {
            const weightInput = document.querySelector('input[data-ex="0"][data-set="0"][data-type="weight"]');
            const repsInput = document.querySelector('input[data-ex="0"][data-set="0"][data-type="reps"]');
            const repsFocusSpy = jest.spyOn(repsInput, 'focus');

            app.handleInputEnter({ target: weightInput }, 0, 0, 'weight');

            expect(repsFocusSpy).toHaveBeenCalled();
            repsFocusSpy.mockRestore();
        });

        it('should mark set completed, start rest timer, and blur activeElement without focusing next set when Enter is pressed on reps', () => {
            const repsInput = document.querySelector('input[data-ex="0"][data-set="0"][data-type="reps"]');
            repsInput.focus();
            const nextSetWeightInput = document.querySelector('input[data-ex="0"][data-set="1"][data-type="weight"]');
            const nextSetFocusSpy = jest.spyOn(nextSetWeightInput, 'focus');
            const blurSpy = jest.spyOn(repsInput, 'blur');

            app.handleInputEnter({ target: repsInput }, 0, 0, 'reps');

            expect(app.activeWorkout.exercises[0].setsCompleted[0]).toBe(true);
            expect(app.restTimer).not.toBeNull();
            expect(nextSetFocusSpy).not.toHaveBeenCalled();
            expect(blurSpy).toHaveBeenCalled();

            nextSetFocusSpy.mockRestore();
            blurSpy.mockRestore();
            app.stopRestTimer();
        });

        it('should blur active element when toggleSet is called', () => {
            const input = document.querySelector('input[data-ex="0"][data-set="0"][data-type="reps"]');
            input.focus();
            const blurSpy = jest.spyOn(input, 'blur');

            app.toggleSet(0, 0);

            expect(blurSpy).toHaveBeenCalled();
            blurSpy.mockRestore();
            app.stopRestTimer();
        });
    });

    describe('GOF-30: Session | rust timer styling & light theme', () => {
        it('should have frost slate background, sky border, and glow for .rest-timer in style.css', () => {
            const fs = require('fs');
            const path = require('path');
            const css = fs.readFileSync(path.join(__dirname, 'style.css'), 'utf8');

            expect(css).toMatch(/\.rest-timer\s*\{[^}]*background:\s*linear-gradient/);
            expect(css).toMatch(/\.rest-timer\s*\{[^}]*border:\s*1\.5px solid rgba\(56,\s*189,\s*248,\s*0\.45\);/);
            expect(css).toMatch(/\.rest-timer\s*\{[^}]*box-shadow:\s*0 4px 20px rgba\(56,\s*189,\s*248,\s*0\.22\)/);
        });

        it('should support light theme styles for .theme-light and prefers-color-scheme light', () => {
            const fs = require('fs');
            const path = require('path');
            const css = fs.readFileSync(path.join(__dirname, 'style.css'), 'utf8');

            expect(css).toContain('.theme-light .rest-timer');
            expect(css).toMatch(/\.theme-light \.rest-timer\s*\{[^}]*background:\s*linear-gradient\(135deg,\s*#f0f7ff 0%,\s*#e0f2fe 100%\);/);
            expect(css).toContain(':root:not(.theme-dark) .rest-timer');
        });
    });
});









