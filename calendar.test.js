/**
 * @jest-environment jsdom
 */
const { app, store } = require('./app');

const log = (id, date, name, planName, exercises = [], extra = {}) => ({
    id, date, sessionName: name, planName, duration: 45, exercisesCompleted: exercises.length, exercises, ...extra
});
const ex = (name, details, totalSets = details.length) => ({ name, setsCompleted: details.length, totalSets, details });
const set = (n, weight, reps, level) => { const d = { setNumber: n, weight: String(weight), reps: String(reps) }; if (level) d.level = String(level); return d; };

beforeEach(() => {
    store.plans = [];
    store.customExercises = [];
    store.logs = [];
    localStorage.clear();
    app.historyViewMode = 'list';
    app.calendarYear = 2026;
    app.calendarMonth = 8; // September
    app.calendarSelectedDate = null;
    app.pendingLogDeletes.clear();

    document.body.innerHTML = `
        <section id="view-progress">
            <header class="top-nav"></header>
            <div class="history-header-row">
                <button type="button" id="btn-history-view-list" class="active" aria-pressed="true"></button>
                <button type="button" id="btn-history-view-calendar" aria-pressed="false"></button>
            </div>
            <div id="history-list"></div>
            <div id="history-calendar" class="hidden"></div>
        </section>
    `;
});

describe('Calendar View Mode Toggle', () => {
    it('schakelt tussen lijst en kalender weergave en bewaart voorkeur in localStorage', () => {
        expect(app.historyViewMode).toBe('list');

        app.setHistoryViewMode('calendar');
        expect(app.historyViewMode).toBe('calendar');
        expect(localStorage.getItem('gofitness_history_view_mode')).toBe('calendar');

        const btnList = document.getElementById('btn-history-view-list');
        const btnCal = document.getElementById('btn-history-view-calendar');
        const hList = document.getElementById('history-list');
        const hCal = document.getElementById('history-calendar');

        expect(btnList.classList.contains('active')).toBe(false);
        expect(btnList.getAttribute('aria-pressed')).toBe('false');
        expect(btnCal.classList.contains('active')).toBe(true);
        expect(btnCal.getAttribute('aria-pressed')).toBe('true');
        expect(hList.classList.contains('hidden')).toBe(true);
        expect(hCal.classList.contains('hidden')).toBe(false);

        app.setHistoryViewMode('list');
        expect(app.historyViewMode).toBe('list');
        expect(localStorage.getItem('gofitness_history_view_mode')).toBe('list');
        expect(btnList.classList.contains('active')).toBe(true);
        expect(btnCal.classList.contains('active')).toBe(false);
        expect(hList.classList.contains('hidden')).toBe(false);
        expect(hCal.classList.contains('hidden')).toBe(true);
    });
});

describe('Calendar Rendering & Navigation', () => {
    it('toont een melding wanneer er nog geen sessies zijn', () => {
        app.setHistoryViewMode('calendar');
        const hCal = document.getElementById('history-calendar');
        expect(hCal.innerHTML).toContain('Nog geen sessies afgerond');
    });

    it('rendert de maandkalender met totalen, weekdagen en trainingsdagen', () => {
        // Twee sessies in september 2026
        store.logs = [
            log('l1', '2026-09-02T10:00:00.000Z', 'Push Day', 'PPL', [ex('Bench Press', [set(1, 60, 10), set(2, 60, 10)])]),
            log('l2', '2026-09-04T10:00:00.000Z', 'Push Day 2', 'PPL', [ex('Bench Press', [set(1, 65, 10), set(2, 60, 10)])]) // PR
        ];

        app.setHistoryViewMode('calendar');
        const hCal = document.getElementById('history-calendar');

        expect(hCal.querySelector('.calendar-month-title').textContent).toBe('September 2026');
        expect(hCal.querySelector('.calendar-weekdays').textContent).toContain('Ma');
        expect(hCal.querySelector('.calendar-weekdays').textContent).toContain('Zo');

        // Maandstatistieken: 2 sessies, PR
        const statsBar = hCal.querySelector('.calendar-stats-bar');
        expect(statsBar.textContent).toContain('2 sessies');
        expect(statsBar.textContent).toContain('1 PR');

        // Trainingsstippen op de juiste dagen
        const dayCellsWithLogs = hCal.querySelectorAll('.calendar-day-cell.has-log');
        expect(dayCellsWithLogs.length).toBe(2);

        const prIcon = hCal.querySelector('.calendar-pr-crown-icon');
        expect(prIcon).not.toBeNull();
    });

    it('navigeert naar de volgende en vorige maand en omvat jaarwisseling', () => {
        store.logs = [log('l1', '2026-09-02T10:00:00.000Z', 'A', 'B')];
        app.setHistoryViewMode('calendar');

        app.changeCalendarMonth(1);
        expect(app.calendarMonth).toBe(9); // Oktober
        expect(app.calendarYear).toBe(2026);
        expect(document.querySelector('.calendar-month-title').textContent).toBe('Oktober 2026');

        app.changeCalendarMonth(-1);
        expect(app.calendarMonth).toBe(8); // September
        expect(document.querySelector('.calendar-month-title').textContent).toBe('September 2026');

        // Jaarwissel test
        app.calendarMonth = 0; // Januari
        app.calendarYear = 2027;
        app.changeCalendarMonth(-1);
        expect(app.calendarMonth).toBe(11); // December
        expect(app.calendarYear).toBe(2026);

        app.changeCalendarMonth(1);
        expect(app.calendarMonth).toBe(0); // Januari
        expect(app.calendarYear).toBe(2027);
    });

    it('toont workout details voor de geselecteerde trainingsdag en rustdag voor een lege dag', () => {
        store.logs = [
            log('l1', '2026-09-02T10:00:00.000Z', 'Leg Day', 'PPL', [ex('Squat', [set(1, 100, 5)])])
        ];
        app.setHistoryViewMode('calendar');

        // Selecteer trainingsdag
        app.selectCalendarDate('2026-09-02');
        let dayCards = document.getElementById('calendar-day-cards');
        expect(dayCards.textContent).toContain('Leg Day');
        expect(dayCards.textContent).toContain('Squat');

        // Selecteer rustdag
        app.selectCalendarDate('2026-09-03');
        dayCards = document.getElementById('calendar-day-cards');
        expect(dayCards.textContent).toContain('Rustdag');
        expect(dayCards.textContent).toContain('Geen trainingssessie gelogd');
    });

    it('update de kalender direct bij het verwijderen van een sessie via deleteLogWithUndo', () => {
        store.logs = [
            log('l1', '2026-09-02T10:00:00.000Z', 'Leg Day', 'PPL', [ex('Squat', [set(1, 100, 5)])])
        ];
        app.setHistoryViewMode('calendar');
        expect(document.querySelectorAll('.calendar-day-cell.has-log').length).toBe(1);

        app.deleteLogWithUndo('l1');
        expect(document.querySelectorAll('.calendar-day-cell.has-log').length).toBe(0);

        app.undoLogDelete('l1');
        expect(document.querySelectorAll('.calendar-day-cell.has-log').length).toBe(1);
    });
});
