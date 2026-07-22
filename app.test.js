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
        expect(mockLocalStorage.getItem('activeWorkoutState')).toBeNull();
        expect(app.navigate).toHaveBeenCalledWith('home');
        expect(store.logs).toHaveLength(0);
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

    it('should keep the existing active plan when importing another plan', () => {
        store.importPlan({ name: 'Plan A', sessions: [] });
        const firstId = store.activePlanId;
        store.importPlan({ name: 'Plan B', sessions: [] });

        expect(store.plans).toHaveLength(2);
        expect(store.activePlanId).toBe(firstId);
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
            { setNumber: 2, weight: '40', reps: '13' }
        ];
        const plan = { progressionRules: { weightIncreaseGuidance: { upperBodyKg: 2.0, lowerBodyKg: 5.0 } } };

        expect(app.getOverloadSuggestion(ex, prev, plan)).toEqual({ prevWeight: 40, newWeight: 42 });
    });

    it('should use the lower body increment for leg exercises', () => {
        const ex = { name: 'Squat', repsMax: 10, muscleGroups: ['legs'], sets: 3 };
        const prev = [{ setNumber: 1, weight: '80', reps: '10' }];
        const plan = { progressionRules: { weightIncreaseGuidance: { upperBodyKg: 2.0, lowerBodyKg: 5.0 } } };

        expect(app.getOverloadSuggestion(ex, prev, plan)).toEqual({ prevWeight: 80, newWeight: 85 });
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

        expect(app.getOverloadSuggestion(ex, prev, null)).toEqual({ prevWeight: 50, newWeight: 52.5 });
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

    it('should limit value labels to first, peak and last when there are many sessions', () => {
        const weights = [40, 42, 44, 46, 48, 50, 52];
        store.logs = weights.map((wt, i) => ({
            date: `2026-07-0${i + 1}T10:00:00.000Z`,
            exercises: [{ name: 'Squat', details: [{ setNumber: 1, weight: String(wt), reps: '5' }] }]
        }));
        app.renderExerciseProgress();

        const html = document.getElementById('exercise-progress-list').innerHTML;
        // 7 metingen -> alleen eerste (40), piek (52) en laatste (52) gelabeld, niet alle
        const labelCount = (html.match(/<text/g) || []).length;
        expect(labelCount).toBeLessThan(weights.length);
        expect(html).toContain('>40</text>');
        expect(html).toContain('>52</text>');
        expect(html).not.toContain('>44</text>');
    });

    it('should show a hint when there is not enough data', () => {
        app.renderExerciseProgress();
        expect(document.getElementById('exercise-progress-list').innerHTML).toContain('minimaal twee sessies');
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

    it('should estimate 1RM with the Epley formula', () => {
        expect(app.estimate1RM(100, 1)).toBe(100);
        expect(app.estimate1RM(40, 10)).toBeCloseTo(53.33, 1);
        expect(app.estimate1RM(0, 10)).toBeNull();
        expect(app.estimate1RM(40, 0)).toBeNull();
    });
});

describe('sharePlan', () => {
    beforeEach(() => {
        store.plans = [{ id: 'p1', name: 'Mijn Schema', sessions: [] }];
        store.activePlanId = 'p1';
        store.logs = [];
        document.body.innerHTML = '<div id="toast-container"></div>';
    });

    afterEach(() => {
        delete global.navigator.share;
        delete global.navigator.canShare;
        delete global.navigator.clipboard;
    });

    it('should share the plan JSON without the internal id via the Web Share API', async () => {
        const share = jest.fn().mockResolvedValue();
        Object.defineProperty(global.navigator, 'share', { value: share, configurable: true });

        await app.sharePlan('p1');

        expect(share).toHaveBeenCalledTimes(1);
        const arg = share.mock.calls[0][0];
        expect(arg.title).toBe('Mijn Schema');
        expect(arg.text).toContain('"name": "Mijn Schema"');
        expect(arg.text).not.toContain('"id"');
    });

    it('should copy the JSON to the clipboard when Web Share is unavailable', async () => {
        const writeText = jest.fn().mockResolvedValue();
        Object.defineProperty(global.navigator, 'clipboard', { value: { writeText }, configurable: true });

        await app.sharePlan('p1');

        expect(writeText).toHaveBeenCalledTimes(1);
        expect(writeText.mock.calls[0][0]).toContain('Mijn Schema');
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
