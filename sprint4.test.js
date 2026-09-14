/**
 * @jest-environment jsdom
 */
// Regressietests voor het herontworpen logboek (Sprint 4): tijdgroepering met
// schema-chip, compacte kaart met set-strip, tabel-detail met PR en delta, paginering.
const { app, store } = require('./app');

const daysAgo = n => new Date(Date.now() - n * 86400000).toISOString();
const log = (id, date, name, planName, exercises = [], extra = {}) => ({
    id, date, sessionName: name, planName, duration: 45, exercisesCompleted: exercises.length, exercises, ...extra
});
const ex = (name, details, totalSets = details.length) => ({ name, setsCompleted: details.length, totalSets, details });
const set = (n, weight, reps, level) => { const d = { setNumber: n, weight: String(weight), reps: String(reps) }; if (level) d.level = String(level); return d; };

beforeEach(() => {
    store.plans = [];
    store.customExercises = [];
    store.logs = [];
    app.historyVisibleCount = app.historyPageSize;
    document.body.innerHTML = '<section id="view-progress"><header class="top-nav"></header><div id="history-list"></div></section>';
});

describe('groupHistoryLogs', () => {
    it('groepeert op Deze week, Vorige week en daarna per maand, in volgorde van de logs', () => {
        const now = new Date(2026, 8, 10, 12); // donderdag 10-09-2026
        const logs = [
            log('a', new Date(2026, 8, 9).toISOString(), 'A', 'P'),
            log('b', new Date(2026, 8, 2).toISOString(), 'B', 'P'),
            log('c', new Date(2026, 7, 20).toISOString(), 'C', 'P'),
            log('d', new Date(2026, 6, 3).toISOString(), 'D', 'P')
        ];
        const groups = app.groupHistoryLogs(logs, now);
        expect(groups.map(g => g.label)).toEqual(['Deze week', 'Vorige week', 'Augustus 2026', 'Juli 2026']);
        expect(groups[0].logs.map(l => l.id)).toEqual(['a']);
    });

    it('zet een maandag in dezelfde week als de zondag erna niet bij Vorige week', () => {
        const now = new Date(2026, 8, 13, 12); // zondag 13-09-2026
        const groups = app.groupHistoryLogs([log('m', new Date(2026, 8, 7).toISOString(), 'M', 'P')], now);
        expect(groups[0].label).toBe('Deze week');
    });
});

describe('buildHistoryAnnotations', () => {
    it('markeert een PR alleen als er eerdere data was, en berekent delta en volume', () => {
        store.logs = [
            log('l1', daysAgo(10), 'Push', 'P', [ex('Bench Press', [set(1, 40, 10), set(2, 40, 10)])]),
            log('l2', daysAgo(3), 'Push', 'P', [ex('Bench Press', [set(1, 45, 10), set(2, 40, 8)])])
        ];
        const ann = app.buildHistoryAnnotations();
        const first = ann.get('l1');
        const second = ann.get('l2');
        expect(first.prCount).toBe(0); // eerste keer ooit is geen PR
        expect(first.volume).toBe(800);
        expect(second.prCount).toBe(1);
        expect([...second.exercises[0].prSets]).toEqual([0]);
        expect(second.exercises[0].deltas[0]).toEqual({ kind: 'kg', value: 5 });
        expect(second.exercises[0].deltas[1]).toBeNull(); // zelfde gewicht, andere reps: geen kg-delta
        expect(second.volume).toBe(450 + 320);
    });

    it('telt duur-oefeningen (seconden in het reps-veld) niet mee in volume of 1RM, wel als tijd-PR', () => {
        store.logs = [
            log('l1', daysAgo(10), 'Cardio', 'P', [ex('Row Machine', [set(1, '', 600, 5)]), ex('Plank', [set(1, 10, 45)])]),
            log('l2', daysAgo(3), 'Cardio', 'P', [ex('Row Machine', [set(1, '', 720, 6)]), ex('Plank', [set(1, 10, 60)])])
        ];
        const ann = app.buildHistoryAnnotations();
        expect(ann.get('l1').volume).toBe(0); // 10 kg x 45 s is geen volume
        expect(ann.get('l2').volume).toBe(0);
        expect(ann.get('l2').prCount).toBe(2); // langer geroeid en langer geplankt
        expect(ann.get('l2').exercises[0].trend).toEqual({ kind: 'reps', value: 120 });
    });

    it('vergelijkt bodyweight-oefeningen op herhalingen', () => {
        store.logs = [
            log('l1', daysAgo(10), 'Core', 'P', [ex('Plank', [set(1, '', 40)])]),
            log('l2', daysAgo(3), 'Core', 'P', [ex('Plank', [set(1, '', 55)])])
        ];
        const ann = app.buildHistoryAnnotations();
        expect(ann.get('l2').prCount).toBe(1);
        expect(ann.get('l2').exercises[0].deltas[0]).toEqual({ kind: 'reps', value: 15 });
    });
});

describe('renderHistory', () => {
    it('toont groepskoppen, schema-chip, meta en set-strip op de kaart', () => {
        store.logs = [
            log('l1', daysAgo(10), 'Push', 'Kracht A', [ex('Bench Press', [set(1, 40, 10), set(2, 40, 10)], 3)]),
            log('l2', new Date().toISOString(), 'Push', 'Kracht A', [ex('Bench Press', [set(1, 45, 10), set(2, 45, 9)], 3)])
        ];
        app.renderHistory();
        const list = document.getElementById('history-list');
        const headers = [...list.querySelectorAll('.history-group-header')].map(h => h.textContent);
        expect(headers[0]).toContain('Deze week');
        const cards = list.querySelectorAll('.history-card');
        expect(cards.length).toBe(2);

        const newest = cards[0];
        expect(newest.querySelector('.plan-chip').textContent).toBe('Kracht A');
        expect(newest.querySelector('.plan-chip').style.getPropertyValue('--chip-h')).toBe(String(app.planChipHue('Kracht A')));
        expect(newest.querySelector('.history-meta').textContent).toContain('45 min');
        expect(newest.querySelector('.history-meta').textContent).toContain('2/3 sets');
        expect(newest.querySelector('.history-meta').textContent).not.toContain('kg'); // volume alleen in het detail
        expect(newest.querySelector('.history-meta .pr-crown-badge').textContent).toContain('1 PR');
        expect(newest.querySelector('.history-volume').textContent).toContain('855 kg'); // 450 + 405

        const dots = newest.querySelectorAll('.set-strip .set-dot');
        expect(dots.length).toBe(3);
        expect(dots[0].classList.contains('pr')).toBe(true);
        expect(dots[1].classList.contains('done')).toBe(true);
        expect(dots[1].classList.contains('pr')).toBe(false);
        expect(dots[2].classList.contains('missed')).toBe(true);
    });

    it('toont details als tabel met PR-rij en delta, en een stand-kolom alleen als die er is', () => {
        store.logs = [
            log('l1', daysAgo(10), 'Pull', 'P', [ex('Chest Press Machine', [set(1, 50, 10, 4)])]),
            log('l2', daysAgo(1), 'Pull', 'P', [ex('Chest Press Machine', [set(1, 55, 10, 5)])]),
            log('l3', daysAgo(0), 'Push', 'P', [ex('Bench Press', [set(1, 60, 5)])])
        ];
        app.renderHistory();
        const cards = document.querySelectorAll('.history-card');
        const pullTable = cards[1].querySelector('.history-set-table');
        expect(pullTable.querySelectorAll('th').length).toBe(4);
        expect(pullTable.querySelector('tr.is-pr')).not.toBeNull();
        expect(pullTable.querySelector('.set-delta.up').textContent).toBe('+5');
        const pushTable = cards[0].querySelector('.history-set-table');
        expect(pushTable.querySelectorAll('th').length).toBe(3);
        expect(cards[0].querySelector('.history-details').classList.contains('hidden')).toBe(true);
    });

    it('behoudt kolom-uitlijning voor gewichten met en zonder deltas via CSS regels', () => {
        const fs = require('fs');
        const css = fs.readFileSync(__dirname + '/style.css', 'utf8');
        expect(css).toContain('.history-set-table th:nth-child(2)');
        expect(css).toContain('.history-set-table td:nth-child(2)');
        expect(css).toContain('padding-right: 38px');
        expect(css).toContain('.history-set-table td:nth-child(2) .set-delta');
        expect(css).toContain('position: absolute');
    });

    it('klapt details uit met Enter en zet aria-expanded', () => {
        store.logs = [log('l1', daysAgo(1), 'Push', 'P', [ex('Bench Press', [set(1, 40, 10)])])];
        app.renderHistory();
        const head = document.querySelector('.history-card-head');
        head.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
        expect(head.getAttribute('aria-expanded')).toBe('true');
        expect(document.querySelector('.history-details').classList.contains('hidden')).toBe(false);
    });

    it('toont oude sessies zonder details compact en behoudt de bewerk- en verwijderknop', () => {
        store.logs = [log('old', daysAgo(2), 'Oud', 'P', [], { exercisesCompleted: 3 })];
        app.renderHistory();
        const card = document.querySelector('.history-card');
        expect(card.textContent).toContain('geen details');
        const items = [...card.querySelectorAll('.history-menu-label')].map(b => b.textContent.trim());
        expect(items).toContain('Verwijderen');
        expect(items).not.toContain('Bewerken');
        expect(items).not.toContain('Herhalen');
    });

    it('rendert maximaal 20 sessies en laadt de rest met een knop', () => {
        store.logs = Array.from({ length: 25 }, (_, i) => log('l' + i, daysAgo(i), 'S' + i, 'P', [ex('Squat', [set(1, 60, 5)])]));
        app.renderHistory();
        expect(document.querySelectorAll('.history-card').length).toBe(20);
        const more = document.querySelector('.history-load-more');
        expect(more.textContent).toContain('5 resterend');
        more.click();
        expect(document.querySelectorAll('.history-card').length).toBe(25);
        expect(document.querySelector('.history-load-more')).toBeNull();
    });

    it('escapet namen uit logs', () => {
        store.logs = [log('x', daysAgo(1), '<img src=x onerror=alert(1)>', '<b>P</b>', [ex('<script>alert(2)</script>', [set(1, 40, 10)])])];
        app.renderHistory();
        const list = document.getElementById('history-list');
        // Geen echte elementen uit de data; de namen staan als tekst op het scherm
        expect(list.querySelector('img')).toBeNull();
        expect(list.querySelector('script')).toBeNull();
        expect(list.querySelector('b')).toBeNull();
        expect(list.querySelector('.plan-chip').textContent).toBe('<b>P</b>');
        expect(list.querySelector('.history-session-name').textContent).toBe('<img src=x onerror=alert(1)>');
        expect(list.querySelector('.history-exercise-title').textContent).toContain('<script>alert(2)</script>');
    });
});
