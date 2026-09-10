/**
 * @jest-environment jsdom
 */
// Regressietests voor de Sprint 1-fixes: XSS in inline handlers, sync-dataverlies,
// chronologische logs, invoervalidatie en deelcodes.
const { DataStore, app, store } = require('./app');
const { CloudSync, mergeSyncData } = require('./sync');

// Voert een onclick-attribuut uit zoals de browser dat zou doen, met een nep-`app`
// zodat we kunnen zien welk argument de handler werkelijk ontvangt.
function runOnclick(el, fakeApp) {
    const attr = el.getAttribute('onclick');
    // eslint-disable-next-line no-new-func
    new Function('app', 'event', attr)(fakeApp, {});
}

describe('jsArg: veilige JS-argumenten in inline handlers', () => {
    it('levert een JSON-stringliteral die HTML-veilig is', () => {
        expect(app.jsArg('abc')).toBe('&quot;abc&quot;');
        expect(app.jsArg(null)).toBe('&quot;&quot;');
        expect(app.jsArg(42)).toBe('&quot;42&quot;');
    });

    it('laat een naam met quotes niet uit de JS-string breken', () => {
        const evil = "x');alert(1);//";
        document.body.innerHTML = `<button onclick="app.foo(${app.jsArg(evil)})">k</button>`;
        const received = [];
        runOnclick(document.querySelector('button'), { foo: v => received.push(v) });
        expect(received).toEqual([evil]);
    });

    it('geeft dubbele quotes, backslashes en HTML-tekens ongeschonden door', () => {
        const tricky = 'a"b\\c<d>&e';
        document.body.innerHTML = `<button onclick="app.foo(${app.jsArg(tricky)})">k</button>`;
        const received = [];
        runOnclick(document.querySelector('button'), { foo: v => received.push(v) });
        expect(received).toEqual([tricky]);
    });

    it('renderPlans: een kwaadaardig plan-id komt als gewone string bij setActivePlan aan', () => {
        document.body.innerHTML = '<div id="plans-list"></div>';
        const evilId = "p1');alert(1);//";
        store.plans = [
            { id: 'p0', name: 'Actief', sessions: [] },
            { id: evilId, name: 'Kwaad', sessions: [{ id: 's1', name: 'S', exercises: [{ name: 'Squat', sets: 3 }] }] }
        ];
        store.activePlanId = 'p0';

        app.renderPlans();

        const buttons = [...document.querySelectorAll('#plans-list button')]
            .filter(b => (b.getAttribute('onclick') || '').includes('setActivePlan'));
        expect(buttons.length).toBe(1);
        const received = [];
        runOnclick(buttons[0], { setActivePlan: id => received.push(id) });
        expect(received).toEqual([evilId]);
    });
});

describe('DataStore: sets-validatie en veilige workout-start', () => {
    const plan = (sets) => ({
        name: 'Plan', sessions: [{ name: 'A', exercises: [{ name: 'Squat', sets }] }]
    });

    it('accepteert gehele getallen, ook als string', () => {
        expect(DataStore.validatePlanSchema(plan(3))).toBe(true);
        expect(DataStore.validatePlanSchema(plan('3'))).toBe(true);
    });

    it('weigert decimalen', () => {
        expect(() => DataStore.validatePlanSchema(plan(2.5))).toThrow('geheel getal');
        expect(() => DataStore.validatePlanSchema(plan('2.5'))).toThrow('geheel getal');
    });

    it('importPlan zet sets om naar een getal', () => {
        store.plans = [];
        store.importPlan(plan('4'));
        expect(store.plans[0].sessions[0].exercises[0].sets).toBe(4);
    });

    it('startWorkout maakt het juiste aantal set-rijen bij sets als string', () => {
        store.plans = [];
        store.activePlanId = null;
        const session = { id: 's1', name: 'S', exercises: [{ id: 'e1', name: 'Squat', sets: '3' }] };
        app.navigate = jest.fn();
        app.startWorkout(session);
        expect(app.activeWorkout.exercises[0].setsCompleted).toEqual([false, false, false]);
        expect(app.activeWorkout.exercises[0].sets).toBe(3);
        app.activeWorkout = null;
        store.saveActiveWorkoutState(null);
    });

    it('restoreBackup normaliseert sessies zonder oefeningen', () => {
        store.restoreBackup({ plans: [{ id: 'p1', name: 'P', sessions: [{ id: 's1', name: 'S' }] }], logs: [] });
        expect(store.plans[0].sessions[0].exercises).toEqual([]);
    });
});

describe('DataStore: logs chronologisch', () => {
    it('sortLogs sorteert op datum en laat ongeldige datums vooraan', () => {
        store.logs = [
            { id: 'c', date: '2026-07-03T10:00:00.000Z' },
            { id: 'a', date: '2026-07-01T10:00:00.000Z' },
            { id: 'x' },
            { id: 'b', date: '2026-07-02T10:00:00.000Z' }
        ];
        store.sortLogs();
        expect(store.logs.map(l => l.id)).toEqual(['x', 'a', 'b', 'c']);
    });

    it('saveEditLog hersorteert na een datumcorrectie en schuift start/endTime mee', () => {
        document.body.innerHTML = '<div id="modal-edit-log" class="modal-overlay hidden"></div><div id="toast-container"></div>';
        store.logs = [
            { id: 'l1', date: '2026-07-01T10:00:00.000Z', startTime: '2026-07-01T09:00:00.000Z', endTime: '2026-07-01T10:00:00.000Z', exercises: [] },
            { id: 'l2', date: '2026-07-05T10:00:00.000Z', exercises: [] }
        ];
        app.logToEdit = JSON.parse(JSON.stringify(store.logs[0]));
        app.hideEditLogModal = jest.fn();
        app.renderProgress = jest.fn();
        app.renderHome = jest.fn();

        app.updateEditLogDate('2026-07-10T12:00');
        app.saveEditLog();

        expect(store.logs.map(l => l.id)).toEqual(['l2', 'l1']);
        const edited = store.logs[1];
        const dateMs = new Date(edited.date).getTime();
        expect(new Date(edited.endTime).getTime()).toBe(dateMs);
        expect(new Date(edited.startTime).getTime()).toBe(dateMs - 3600 * 1000);
    });

    it('saveEditLog meldt een fout als de log niet meer bestaat', () => {
        document.body.innerHTML = '<div id="toast-container"></div>';
        store.logs = [];
        app.logToEdit = { id: 'weg', date: '2026-07-01T10:00:00.000Z', exercises: [] };
        app.hideEditLogModal = jest.fn();
        const toasts = [];
        const orig = app.showToast;
        app.showToast = (msg, type) => toasts.push({ msg, type });
        app.saveEditLog();
        app.showToast = orig;
        expect(toasts.length).toBe(1);
        expect(toasts[0].type).toBe('error');
    });
});

describe('Actieve workout zonder sessie', () => {
    it('renderHome crasht niet en toont de normale kaart', () => {
        document.body.innerHTML = `
            <h1 id="home-date"></h1><div id="recovery-status"><span class="material-icons-round"></span></div>
            <span id="recovery-text"></span><span id="recovery-hours"></span>
            <button id="btn-start-session"></button><div id="session-picker-wrapper"></div>
            <select id="home-session-select"></select>
            <h3 id="recommended-card-title"></h3><h2 id="recommended-session-name"></h2><p id="recommended-reason"></p>
            <span id="stat-streak"></span><span id="stat-completed"></span>`;
        store.plans = [];
        store.logs = [];
        store.activePlanId = null;
        app.activeWorkout = { planId: null, exercises: [] };
        expect(() => app.renderHome()).not.toThrow();
        expect(document.getElementById('recommended-card-title').textContent).not.toBe('Sessie in uitvoering');
        app.activeWorkout = null;
    });

    it('init wist een corrupte activeWorkoutState', () => {
        document.body.innerHTML = '<div id="bottom-nav"></div>';
        store.plans = [];
        store.logs = [];
        store.activeWorkoutState = { planId: 'p', exercises: 'geen array' };
        const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
        ['applyTheme', 'setupNavigation', 'renderHome', 'renderPlans', 'renderProgress', 'renderAchievements', 'checkUrlForImportedPlan']
            .forEach(fn => { app[fn] = jest.fn(); });
        app.init();
        warn.mockRestore();
        expect(app.activeWorkout).toBeNull();
        expect(store.activeWorkoutState).toBeNull();
    });
});

describe('Sync: plannen met updatedAt en corrupt cloud-bestand', () => {
    it('importPlan geeft een plan een updatedAt zodat de merge de nieuwste kan kiezen', () => {
        store.plans = [];
        store.importPlan({ name: 'Nieuw', sessions: [{ name: 'A', exercises: [{ name: 'Squat', sets: 3 }] }] });
        expect(typeof store.plans[0].updatedAt).toBe('string');
        expect(isNaN(new Date(store.plans[0].updatedAt).getTime())).toBe(false);
    });

    it('mergeSyncData laat de nieuwste plan-bewerking winnen, ongeacht de kant', () => {
        const local = { plans: [{ id: 'p1', name: 'Oud', updatedAt: '2026-07-01T10:00:00.000Z' }], logs: [], deleted: { plans: [], logs: [] } };
        const remote = { plans: [{ id: 'p1', name: 'Nieuw', updatedAt: '2026-07-02T10:00:00.000Z' }], logs: [], deleted: { plans: [], logs: [] } };
        expect(mergeSyncData(local, remote).plans[0].name).toBe('Nieuw');
        expect(mergeSyncData(remote, local).plans[0].name).toBe('Nieuw');
    });

    it('mergeSyncData bewaart tombstones van custom oefeningen', () => {
        const local = { plans: [], logs: [], deleted: { plans: [], logs: [], customExercises: ['c1'] } };
        const remote = { plans: [], logs: [], deleted: { plans: [], logs: [] } };
        expect(mergeSyncData(local, remote).deleted.customExercises).toEqual(['c1']);
    });

    it('syncNow overschrijft de cloud niet als het bestand onleesbaar is', async () => {
        const fakeStore = {
            plans: [{ id: 'p_local', name: 'Lokaal' }],
            logs: [],
            deleted: { plans: [], logs: [] },
            activePlanId: 'p_local',
            save: jest.fn()
        };
        localStorage.setItem('sync_enabled', '1');
        CloudSync.clientId = 'test-client-id';
        CloudSync.store = fakeStore;
        CloudSync.app = null;
        CloudSync._saveWithoutSync = fakeStore.save;
        CloudSync.accessToken = 'test-token';
        CloudSync.tokenExpiry = Date.now() + 3600 * 1000;
        CloudSync.fileId = null;
        CloudSync._remoteVersion = null;

        const calls = [];
        global.fetch = jest.fn((url, options = {}) => {
            calls.push({ url, options });
            if (url.includes('/drive/v3/files?')) {
                return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({ files: [{ id: 'file123' }] }) });
            }
            if (url.includes('alt=media')) {
                return Promise.resolve({ ok: true, status: 200, json: () => Promise.reject(new SyntaxError('Unexpected token')) });
            }
            return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({ version: '7' }) });
        });

        await expect(CloudSync.syncNow()).rejects.toThrow('corrupt');

        expect(calls.find(c => c.options.method === 'PATCH')).toBeUndefined();
        expect(fakeStore.save).not.toHaveBeenCalled();
        expect(CloudSync.status).toBe('fout');
        expect(CloudSync.lastError).toContain('onleesbaar');

        delete global.fetch;
        localStorage.clear();
        CloudSync.clientId = '';
        CloudSync.accessToken = null;
    });
});

describe('Deelcodes', () => {
    it('genereert GF-XXXX-XXXX met alleen ondubbelzinnige tekens', () => {
        for (let i = 0; i < 20; i++) {
            expect(app.generateShortShareCode()).toMatch(/^GF-[23456789A-HJ-NP-Z]{4}-[23456789A-HJ-NP-Z]{4}$/);
        }
    });

    it('kiest een andere code als de eerste al bestaat en stuurt ownerUid mee', async () => {
        store.plans = [{ id: 'p1', name: 'Plan', sessions: [] }];
        const seen = [];
        const mockGet = jest.fn()
            .mockResolvedValueOnce({ exists: true })
            .mockResolvedValueOnce({ exists: false });
        const mockSet = jest.fn().mockResolvedValue();
        const mockDoc = jest.fn(code => { seen.push(code); return { get: mockGet, set: mockSet }; });
        global.getDb = jest.fn().mockReturnValue({ collection: jest.fn().mockReturnValue({ doc: mockDoc }) });
        global.getAuth = jest.fn().mockReturnValue({ currentUser: { uid: 'uid_1' } });

        const code = await app.publishPlanToCloud(store.plans[0]);

        expect(mockGet).toHaveBeenCalledTimes(2);
        expect(mockSet).toHaveBeenCalledTimes(1);
        expect(seen.length).toBe(2);
        expect(seen[0]).not.toBe(seen[1]);
        expect(code).toBe(seen[1]);
        expect(mockSet.mock.calls[0][0].ownerUid).toBe('uid_1');
        expect(typeof store.plans[0].updatedAt).toBe('string');

        delete global.getDb;
        delete global.getAuth;
    });
});
