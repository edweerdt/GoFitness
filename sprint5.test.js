/**
 * @jest-environment jsdom
 */
// Regressietests voor logboek stap 2: delta's t.o.v. de vorige keer, actiemenu,
// verwijderen met undo, en "Herhaal deze sessie".
const { app, store } = require('./app');

const daysAgo = n => new Date(Date.now() - n * 86400000).toISOString();
const log = (id, date, name, planName, exercises = [], extra = {}) => ({
    id, date, sessionName: name, planName, duration: 45, exercisesCompleted: exercises.length, exercises, ...extra
});
const ex = (name, details, totalSets = details.length, extra = {}) => ({ name, setsCompleted: details.length, totalSets, details, ...extra });
const set = (n, weight, reps, level) => { const d = { setNumber: n, weight: String(weight), reps: String(reps) }; if (level) d.level = String(level); return d; };

beforeEach(() => {
    // Inline onclick-handlers draaien in window-scope: app moet daar bereikbaar zijn
    window.app = app;
    store.plans = [];
    store.customExercises = [];
    store.logs = [];
    store.deleted = { plans: [], logs: [] };
    app.activeWorkout = null;
    app.pendingLogDeletes = new Map();
    app.historyVisibleCount = app.historyPageSize;
    document.body.innerHTML = `
        <section id="view-progress"><header class="top-nav"></header><div id="history-list"></div></section>
        <div id="toast-container"></div>`;
});

describe('delta ten opzichte van de vorige keer', () => {
    it('berekent het volumeverschil per sessie en de trend per oefening', () => {
        store.logs = [
            log('l1', daysAgo(10), 'Push', 'P', [ex('Bench Press', [set(1, 40, 10), set(2, 40, 10)]), ex('Plank', [set(1, '', 40)])], { planId: 'p1' }),
            log('l2', daysAgo(3), 'Push', 'P', [ex('Bench Press', [set(1, 45, 10), set(2, 40, 10)]), ex('Plank', [set(1, '', 35)])], { planId: 'p1' }),
            log('l3', daysAgo(1), 'Pull', 'P', [ex('Row', [set(1, 50, 10)])], { planId: 'p1' })
        ];
        const ann = app.buildHistoryAnnotations();
        expect(ann.get('l1').volumeDelta).toBeNull();
        expect(ann.get('l2').volumeDelta).toBe(50);
        expect(ann.get('l3').volumeDelta).toBeNull(); // andere sessienaam
        expect(ann.get('l2').exercises[0].trend).toEqual({ kind: 'kg', value: 50 });
        expect(ann.get('l2').exercises[1].trend).toEqual({ kind: 'reps', value: -5 });
        expect(ann.get('l1').exercises[0].trend).toBeNull();
    });

    it('toont de delta op de kaart en de trend bij de oefening', () => {
        store.logs = [
            log('l1', daysAgo(10), 'Push', 'P', [ex('Bench Press', [set(1, 40, 10)])]),
            log('l2', daysAgo(1), 'Push', 'P', [ex('Bench Press', [set(1, 45, 10)])])
        ];
        app.renderHistory();
        const newest = document.querySelectorAll('.history-card')[0];
        const delta = newest.querySelector('.volume-delta');
        expect(delta.classList.contains('up')).toBe(true);
        expect(delta.textContent).toBe('+50 kg');
        expect(newest.querySelector('.ex-trend.up').textContent).toContain('+50 kg');
        const oldest = document.querySelectorAll('.history-card')[1];
        expect(oldest.querySelector('.volume-delta')).toBeNull();
    });
});

describe('actiemenu', () => {
    beforeEach(() => {
        store.logs = [log('l1', daysAgo(1), 'Push', 'P', [ex('Bench Press', [set(1, 40, 10)])])];
        app.renderHistory();
    });

    it('opent en sluit via de knop, buiten klikken en Escape', () => {
        const btn = document.querySelector('.history-menu-btn');
        const menu = document.querySelector('.history-menu');
        expect(menu.classList.contains('hidden')).toBe(true);
        btn.click();
        expect(menu.classList.contains('hidden')).toBe(false);
        expect(btn.getAttribute('aria-expanded')).toBe('true');
        expect([...menu.querySelectorAll('.history-menu-label')].map(b => b.textContent.trim())).toEqual(['Bewerken', 'Herhalen', 'Verwijderen']);

        document.body.click();
        expect(menu.classList.contains('hidden')).toBe(true);

        btn.click();
        app.setupKeyboardShortcuts();
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        expect(menu.classList.contains('hidden')).toBe(true);
    });

    it('klikken op de menuknop klapt de kaart niet uit', () => {
        document.querySelector('.history-menu-btn').click();
        expect(document.querySelector('.history-details').classList.contains('hidden')).toBe(true);
    });
});

describe('verwijderen met undo', () => {
    beforeEach(() => {
        jest.useFakeTimers();
        store.logs = [
            log('l1', daysAgo(2), 'Push', 'P', [ex('Bench Press', [set(1, 40, 10)])]),
            log('l2', daysAgo(1), 'Pull', 'P', [ex('Row', [set(1, 50, 10)])])
        ];
        app.renderProgress = jest.fn();
        app.renderHome = jest.fn();
        app.renderHistory();
    });
    afterEach(() => { jest.useRealTimers(); });

    it('verbergt de sessie direct, verwijdert pas na de undo-periode en zet dan een tombstone', () => {
        const push = jest.spyOn(app, 'pushFriendStats').mockImplementation(() => {});
        app.deleteLogWithUndo('l2');
        expect(document.querySelectorAll('.history-card').length).toBe(1);
        expect(store.logs.length).toBe(2); // nog niet echt weg
        expect(store.deleted.logs).not.toContain('l2');
        const toast = document.querySelector('.toast.action-toast');
        expect(toast.textContent).toContain("Sessie 'Pull' verwijderd");

        jest.advanceTimersByTime(6000);
        expect(store.logs.map(l => l.id)).toEqual(['l1']);
        expect(store.deleted.logs).toContain('l2');
        expect(push).toHaveBeenCalledTimes(1);
        expect(document.querySelector('.toast.action-toast')).toBeNull();
        push.mockRestore();
    });

    it('zet de sessie terug bij Ongedaan maken zonder tombstone', () => {
        app.deleteLogWithUndo('l2');
        document.querySelector('.toast.action-toast .toast-action').click();
        expect(document.querySelectorAll('.history-card').length).toBe(2);
        jest.advanceTimersByTime(7000);
        expect(store.logs.length).toBe(2);
        expect(store.deleted.logs).not.toContain('l2');
    });

    it('rondt lopende verwijderingen direct af bij het verlaten van de app', () => {
        jest.spyOn(app, 'pushFriendStats').mockImplementation(() => {});
        app.deleteLogWithUndo('l1');
        app.flushPendingLogDeletes();
        expect(store.logs.map(l => l.id)).toEqual(['l2']);
        expect(app.pendingLogDeletes.size).toBe(0);
        app.pushFriendStats.mockRestore();
    });
});

describe('Herhaal deze sessie', () => {
    let openView, renderWorkout;
    beforeEach(() => {
        openView = jest.spyOn(app, 'openWorkoutView').mockImplementation(() => {});
        renderWorkout = jest.spyOn(app, 'renderWorkoutExercises').mockImplementation(() => {});
    });
    afterEach(() => {
        openView.mockRestore();
        renderWorkout.mockRestore();
        app.activeWorkout = null;
        store.saveActiveWorkoutState(null);
    });

    it('bouwt de sessie uit het log op en vult gewichten en standen in, reps niet', () => {
        store.logs = [log('l1', daysAgo(1), 'Push', 'Los', [
            ex('Bench Press', [set(1, 40, 10), set(2, 42.5, 8)], 3),
            ex('Row Machine', [set(1, '', 300, 5)], 1)
        ])];
        app.repeatLoggedSession('l1');
        const w = app.activeWorkout;
        expect(w).not.toBeNull();
        expect(w.session.name).toBe('Push');
        expect(w.planName).toBe('Los');
        expect(w.exercises.map(e => e.name)).toEqual(['Bench Press', 'Row Machine']);
        expect(w.exercises[0].sets).toBe(3);
        expect(w.exercises[0].weights).toEqual(['40', '42.5', '']);
        expect(w.exercises[0].actualReps).toEqual(['', '', '']);
        expect(w.exercises[0].setsCompleted).toEqual([false, false, false]);
        expect(w.exercises[1].levels[0]).toBe('5');
        expect(w.exercises[1].trackMetrics).toContain('level');
        expect(openView).toHaveBeenCalled();
        expect(document.getElementById('toast-container').textContent).toContain('gewichten van de vorige keer');
    });

    it('gebruikt de sessie uit het schema als die nog bestaat', () => {
        store.plans = [{ id: 'p1', name: 'Kracht', sessions: [{ id: 's1', name: 'Push', exercises: [{ id: 'e1', name: 'Bench Press', sets: 4, repsMin: 6, repsMax: 8 }] }] }];
        store.activePlanId = 'p1';
        store.logs = [log('l1', daysAgo(1), 'Push', 'Kracht', [ex('Bench Press', [set(1, 50, 8)], 3)], { planId: 'p1', sessionId: 's1' })];
        app.repeatLoggedSession('l1');
        const w = app.activeWorkout;
        expect(w.planId).toBe('p1');
        expect(w.exercises[0].sets).toBe(4); // definitie uit het schema
        expect(w.exercises[0].repsMax).toBe(8);
        expect(w.exercises[0].weights[0]).toBe('50');
    });

    it('weigert als er al een training loopt', () => {
        store.logs = [log('l1', daysAgo(1), 'Push', 'P', [ex('Bench Press', [set(1, 40, 10)])])];
        app.activeWorkout = { session: { id: 's', name: 'Bezig' }, exercises: [] };
        app.repeatLoggedSession('l1');
        expect(app.activeWorkout.session.name).toBe('Bezig');
        expect(document.getElementById('toast-container').textContent).toContain('Rond eerst');
    });
});
