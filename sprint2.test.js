/**
 * @jest-environment jsdom
 */
// Regressietests voor de Sprint 2-performancefixes. Gedrag moet gelijk blijven;
// deze tests bewaken vooral dat caches niet stale worden en dat dure paden
// daadwerkelijk minder vaak draaien.
const { app, store } = require('./app');

const logWith = (id, date, name, details, extra = {}) => ({
    id, date, exercises: [{ name, details, ...extra }]
});

describe('getExerciseLibrary cache', () => {
    beforeEach(() => {
        store.plans = [];
        store.customExercises = [];
        store.logs = [];
    });

    it('bouwt de bibliotheek maar één keer zolang de bron gelijk blijft', () => {
        const spy = jest.spyOn(store, '_buildExerciseLibrary');
        const a = store.getExerciseLibrary();
        const b = store.getExerciseLibrary();
        expect(spy).toHaveBeenCalledTimes(1);
        expect(b).toEqual(a);
        expect(b).not.toBe(a); // aanroepers krijgen een eigen array
        spy.mockRestore();
    });

    it('ziet een eigen oefening die via addCustomExercise is toegevoegd', () => {
        store.getExerciseLibrary();
        store.addCustomExercise({ name: 'Mijn Unieke Oefening' });
        expect(store.getExerciseLibrary().some(e => e.name === 'Mijn Unieke Oefening')).toBe(true);
    });

    it('ziet plan-oefeningen na directe vervanging van store.plans (zonder save)', () => {
        store.getExerciseLibrary();
        store.plans = [{ id: 'p1', name: 'P', sessions: [{ id: 's1', name: 'S', exercises: [{ name: 'Zeer Specifieke Planoefening', sets: 3 }] }] }];
        expect(store.getExerciseLibrary().some(e => e.name === 'Zeer Specifieke Planoefening')).toBe(true);
    });
});

describe('canonieke naam-cache', () => {
    beforeEach(() => {
        store.plans = [];
        store.customExercises = [];
        store.save();
    });

    it('geeft hetzelfde resultaat als zonder cache en raadpleegt de store maar één keer', () => {
        const spy = jest.spyOn(store, 'resolveCanonicalExercise');
        const first = app.getCanonicalExerciseKey('Barbell Bench Press');
        const second = app.getCanonicalExerciseKey('Barbell Bench Press');
        expect(second).toBe(first);
        expect(spy).toHaveBeenCalledTimes(1);
        spy.mockRestore();
    });

    it('wordt gereset zodra store.customExercises direct vervangen is', () => {
        expect(app.getCanonicalExerciseName('Vreemde Oefening X')).toBe('Vreemde Oefening X');
        store.customExercises = [{ id: 'custom_1', name: 'Vreemde Oefening X' }];
        const resolved = store.resolveCanonicalExercise('Vreemde Oefening X');
        expect(resolved && resolved.id).toBe('custom_1');
        expect(app.getCanonicalExerciseKey('Vreemde Oefening X')).toBe('custom_1');
    });
});

describe('log-match-index', () => {
    beforeEach(() => {
        store.plans = [];
        store.customExercises = [];
        store.logs = [
            logWith('l1', '2026-07-01T10:00:00.000Z', 'Squat', [{ setNumber: 1, weight: '60', reps: '8' }]),
            logWith('l2', '2026-07-03T10:00:00.000Z', 'Squat', [{ setNumber: 1, weight: '65', reps: '8' }, { setNumber: 2, weight: '65', reps: '6' }])
        ];
        store.save();
    });

    it('vorige-set-placeholder komt uit de laatste log en tokeniseert log-oefeningen maar één keer', () => {
        const spy = jest.spyOn(app, 'extractExerciseNameTokens');
        expect(app.getPreviousSetDetails('Squat', 0).weight).toBe('65');
        expect(app.getPreviousSetDetails('Squat', 1).reps).toBe('6');
        expect(app.getPreviousExerciseDetails('Squat').length).toBe(2);
        const callsForLogs = spy.mock.calls.filter(c => c[1] && c[1] !== null && typeof c[1] === 'object' && !('setsCompleted' in c[1]) && c[0] !== 'Squat').length;
        // Twee log-oefeningen, elk hoogstens één keer getokeniseerd ondanks drie lookups
        expect(callsForLogs).toBeLessThanOrEqual(2);
        spy.mockRestore();
    });

    it('ziet een nieuw toegevoegde log direct', () => {
        expect(app.getPreviousSetDetails('Squat', 0).weight).toBe('65');
        store.logs.push(logWith('l3', '2026-07-05T10:00:00.000Z', 'Squat', [{ setNumber: 1, weight: '70', reps: '5' }]));
        expect(app.getPreviousSetDetails('Squat', 0).weight).toBe('70');
    });

    it('ziet een in-place bewerking na save()', () => {
        expect(app.getPreviousSetDetails('Squat', 0).weight).toBe('65');
        store.logs[1].exercises[0].details[0].weight = '80';
        store.save();
        expect(app.getPreviousSetDetails('Squat', 0).weight).toBe('80');
    });

    it('PR-detectie geeft hetzelfde oordeel als voorheen', () => {
        const ex = { name: 'Squat', sets: 1, setsCompleted: [true], weights: ['70'], actualReps: ['8'] };
        expect(app.evaluateSetAchievement(ex, 0)).toBe('pr');
        const same = { name: 'Squat', sets: 1, setsCompleted: [true], weights: ['60'], actualReps: ['6'] };
        expect(app.evaluateSetAchievement(same, 0)).not.toBe('pr');
    });

    it('hold-timer-doel gebruikt de hoogste historische duur', () => {
        store.logs = [
            logWith('h1', '2026-07-01T10:00:00.000Z', 'Plank', [{ setNumber: 1, weight: '', reps: '40' }]),
            logWith('h2', '2026-07-02T10:00:00.000Z', 'Plank', [{ setNumber: 1, weight: '', reps: '35' }])
        ];
        store.save();
        const ex = { name: 'Plank', trackMetrics: ['duration_seconds'], sets: 1 };
        // Stap 1 (vorige set) wint: 35; een onbekende set-index valt terug op de eerste set
        expect(app.getPreviousAchievedDuration(ex, 0)).toBe(35);
        expect(app.getPreviousAchievedDuration(ex, 3)).toBe(35);

        // Laatste sessie zonder reps (alleen een stand): dan telt de hoogste duur uit de hele historie
        store.logs.push(logWith('h3', '2026-07-03T10:00:00.000Z', 'Plank', [{ setNumber: 1, weight: '', reps: '', level: '2' }]));
        store.save();
        expect(app.getPreviousAchievedDuration(ex, 0)).toBe(40);
    });
});

describe('hold-timer berekent het doel één keer', () => {
    afterEach(() => {
        if (app.holdTimerState) app.stopHoldTimer(false);
        jest.useRealTimers();
        app.activeWorkout = null;
        store.saveActiveWorkoutState(null);
    });

    it('roept getPreviousAchievedDuration niet per tick aan', () => {
        jest.useFakeTimers();
        document.body.innerHTML = '<div id="workout-exercise-list"></div><button id="hold-timer-btn-0"></button>';
        store.logs = [];
        store.holdTimerDelaySeconds = 0;
        app.activeWorkout = {
            planId: null, planName: 'Vrije Sessie', startTime: new Date(),
            session: { id: 's', name: 'S', exercises: [] },
            exercises: [{ id: 'e1', name: 'Plank', trackMetrics: ['duration_seconds'], sets: 1, setsCompleted: [false], weights: [''], actualReps: [''] }]
        };
        const spy = jest.spyOn(app, 'getPreviousAchievedDuration');
        app.startHoldTimer(0, 0);
        // Starten mag het doel bepalen (en de render toont het in de knop), maar
        // de 100 ms-ticks daarna mogen de logs niet opnieuw scannen
        const callsAfterStart = spy.mock.calls.length;
        expect(callsAfterStart).toBeGreaterThanOrEqual(1);
        jest.advanceTimersByTime(1000);
        expect(app.holdTimerState).not.toBeNull();
        expect(spy.mock.calls.length).toBe(callsAfterStart);
        expect(app.holdTimerState.targetSec).toBeDefined();
        spy.mockRestore();
    });
});

describe('workout-state opslaan wordt gebundeld', () => {
    beforeEach(() => {
        jest.useFakeTimers();
        store.logs = [];
        app.activeWorkout = {
            planId: null, planName: 'Vrije Sessie', startTime: new Date(),
            session: { id: 's', name: 'S', exercises: [] },
            exercises: [{ id: 'e1', name: 'Squat', sets: 2, setsCompleted: [false, false], weights: ['', ''], actualReps: ['', ''] }]
        };
        store.saveActiveWorkoutState(app.activeWorkout);
    });
    afterEach(() => {
        jest.useRealTimers();
        app.activeWorkout = null;
        store.saveActiveWorkoutState(null);
    });

    it('schrijft niet bij elke toetsaanslag, wel na de debounce', () => {
        const spy = jest.spyOn(store, 'saveActiveWorkoutState');
        app.updateWeight(0, 0, '6');
        app.updateWeight(0, 0, '60');
        app.updateReps(0, 0, '8');
        expect(spy).not.toHaveBeenCalled();
        jest.advanceTimersByTime(300);
        expect(spy).toHaveBeenCalledTimes(1);
        expect(JSON.parse(localStorage.getItem('activeWorkoutState')).exercises[0].weights[0]).toBe('60');
        spy.mockRestore();
    });

    it('schrijft direct bij het afronden van een veld', () => {
        const spy = jest.spyOn(store, 'saveActiveWorkoutState');
        app.updateWeight(0, 1, '70', true);
        expect(spy).toHaveBeenCalledTimes(1);
        spy.mockRestore();
    });

    it('schrijft niets meer nadat de workout is afgesloten', () => {
        app.updateWeight(0, 0, '50');
        app.activeWorkout = null;
        store.saveActiveWorkoutState(null);
        jest.advanceTimersByTime(300);
        expect(store.activeWorkoutState).toBeNull();
        expect(localStorage.getItem('activeWorkoutState')).toBeNull();
    });
});

describe('navigate stopt de rusttimer buiten de workout-view', () => {
    it('ruimt het interval op', () => {
        jest.useFakeTimers();
        document.body.innerHTML = '<div id="rest-timer" class="hidden"><span id="rest-timer-label"></span></div>';
        app.startRestTimer(90);
        expect(app.restTimer).not.toBeNull();
        app.navigate('home');
        expect(app.restTimer).toBeNull();
        jest.useRealTimers();
    });
});

describe('achievements', () => {
    it('ontgrendelt dezelfde badges als voorheen voor een vaste set logs', () => {
        document.body.innerHTML = '<div id="achievements-grid"></div>';
        store.logs = [
            { id: 'a1', date: '2026-07-01T10:00:00.000Z', duration: 10, exercises: [] },
            { id: 'a2', date: '2026-07-03T10:00:00.000Z', duration: 100, exercises: [] },
            { id: 'a3', date: '2026-07-03T18:00:00.000Z', duration: 45, exercises: [] }
        ];
        app.renderAchievements();
        const unlocked = [...document.querySelectorAll('.achievement.unlocked')].map(el => el.dataset.achievementId).sort();
        // 3 trainingen, 10 en 100 minuten, twee op één dag, precies 2 dagen rust tussen de eerste twee
        expect(unlocked).toEqual(['first_step', 'flash', 'golden_path', 'marathon', 'oops', 'taste_it']);
        expect(document.querySelectorAll('.achievement').length).toBe(22);
    });
});
