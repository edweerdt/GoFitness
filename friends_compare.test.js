/**
 * @jest-environment jsdom
 */
// Regressietests voor de logische fixes in de vrienden-vergelijking:
// gemengd kg/bodyweight, balk zonder data, fijne spiergroepen, lege staten,
// versheid, dubbele kaarten, 1RM-plafond en pushStats na verwijderen/restore/sync.
const { app, store } = require('./app');
const { CloudSync } = require('./sync');

const stat = (exercise, maxKg, maxReps, date) => ({ exercise, maxKg, maxReps, estimated1RM: maxKg > 0 ? Math.round(maxKg * (1 + maxReps / 30) * 10) / 10 : 0, date });

describe('buildFriendComparison', () => {
    beforeEach(() => {
        store.plans = [];
        store.customExercises = [];
        store.logs = [];
    });

    it('vergelijkt gewicht met gewicht op een afgetopte 1RM in hele kilo\'s', () => {
        const mine = { chest: [stat('Bench Press', 100, 5, '2026-08-10')] };
        const theirs = { chest: { exercises: [stat('Bench Press', 90, 20, '2026-08-11')] } };
        const result = app.buildFriendComparison(mine, theirs);
        const ex = result.groups[0].exercises[0];
        expect(ex.mode).toBe('weight');
        // 100 x 5 -> 117; 90 x 20 wordt afgetopt op 10 reps -> 120 (niet 150)
        expect(ex.my1RM).toBe(117);
        expect(ex.f1RM).toBe(120);
        expect(ex.leader).toBe('friend');
        expect(ex.diff).toBe(3);
    });

    it('zet gewicht tegenover lichaamsgewicht niet tegen elkaar af', () => {
        const mine = { back: [stat('Pull-up', 0, 12, '2026-08-10')] };
        const theirs = { back: { exercises: [stat('Pull-up', 20, 5, '2026-08-11')] } };
        const ex = app.buildFriendComparison(mine, theirs).groups[0].exercises[0];
        expect(ex.mode).toBe('mixed');
        expect(ex.leader).toBeNull();
        expect(ex.showBar).toBe(false);
    });

    it('vergelijkt bodyweight met bodyweight op herhalingen', () => {
        const mine = { core: [stat('Plank', 0, 60)] };
        const theirs = { core: { exercises: [stat('Plank', 0, 45)] } };
        const ex = app.buildFriendComparison(mine, theirs).groups[0].exercises[0];
        expect(ex.mode).toBe('reps');
        expect(ex.leader).toBe('me');
        expect(ex.diff).toBe(15);
        expect(ex.myPct).toBe(57);
    });

    it('toont geen 50/50-balk als een kant geen data heeft', () => {
        const ex = app.buildFriendComparison({}, { chest: { exercises: [stat('Bench Press', 80, 8)] } }).groups[0].exercises[0];
        expect(ex.mode).toBe('single');
        expect(ex.myPct).toBe(0);
        expect(ex.fPct).toBe(100);
        expect(ex.showBar).toBe(true);
    });

    it('laat biceps en triceps onder Armen vallen en onbekende groepen onder Overig', () => {
        const mine = { biceps: [stat('Bicep Curl', 14, 12)], triceps: [stat('Skullcrusher', 20, 10)], cardio: [stat('Roeien', 0, 30)] };
        const result = app.buildFriendComparison(mine, {});
        const ids = result.groups.map(g => g.id);
        expect(ids).toEqual(expect.arrayContaining(['arms', 'other']));
        const arms = result.groups.find(g => g.id === 'arms');
        const canon = n => app.getCanonicalExerciseName(n);
        expect(arms.exercises.map(e => e.name).sort()).toEqual([canon('Bicep Curl'), canon('Skullcrusher')].sort());
        expect(result.groups.find(g => g.id === 'other').exercises[0].name).toBe(canon('Roeien'));
    });

    it('toont een oefening die in meerdere groepen staat maar één keer', () => {
        const mine = { chest: [stat('Bench Press', 100, 5)], arms: [stat('Bench Press', 100, 5)] };
        const theirs = { arms: { exercises: [stat('Bench Press', 90, 5)] } };
        const result = app.buildFriendComparison(mine, theirs);
        const all = result.groups.flatMap(g => g.exercises.map(e => e.name));
        expect(all.filter(n => n === app.getCanonicalExerciseName('Bench Press')).length).toBe(1);
        expect(all.length).toBe(1);
        // Vaste prioriteit: borst gaat voor armen, ook al staat de vriend-data alleen onder armen
        expect(result.groups.find(g => g.id === 'chest').exercises[0].matched).toBe(true);
    });

    it('leest het oude formaat met één object per groep', () => {
        const result = app.buildFriendComparison({}, { legs: stat('Squat', 120, 3) });
        expect(result.groups[0].id).toBe('legs');
        expect(result.groups[0].exercises[0].name).toBe(app.getCanonicalExerciseName('Squat'));
    });

    it('meldt of de vriend al statistieken deelt', () => {
        expect(app.buildFriendComparison({ chest: [stat('Bench Press', 80, 8)] }, {}).hasFriendStats).toBe(false);
        expect(app.buildFriendComparison({}, { chest: { exercises: [] } }).hasFriendStats).toBe(true);
    });
});

describe('renderFriends vergelijking', () => {
    const setup = (friendStats) => {
        document.body.innerHTML = '<div id="friends-container"></div>';
        global.FriendsManager = {
            user: { uid: 'me', displayName: 'Ik' },
            userProfile: { uid: 'me', displayName: 'Ik', friendCode: 'GF-1111-2222-3333' },
            requests: [],
            friends: [{ uid: 'f1', displayName: 'Maat', stats: friendStats }],
            selectedFriendUid: 'f1'
        };
        app.showAddFriendInput = false;
        store.plans = [];
        store.customExercises = [];
        store.logs = [{ id: 'l1', date: '2026-08-10T10:00:00.000Z', exercises: [{ name: 'Barbell Bench Press', muscleGroups: ['chest'], details: [{ weight: 100, reps: 5 }] }] }];
        store.save();
    };
    afterEach(() => { delete global.FriendsManager; });

    it('toont een lege staat als de vriend nog niets heeft gedeeld', () => {
        setup(null);
        app.renderFriends();
        const text = document.getElementById('friends-container').textContent;
        expect(text).toContain('heeft nog geen statistieken gedeeld');
        expect(document.querySelectorAll('.exercise-compare-card').length).toBe(0);
    });

    it('toont de versheid van de vriend-data en markeert oude data', () => {
        setup({ lastUpdated: '2026-01-01T10:00:00.000Z', muscleGroups: { chest: { exercises: [stat('Barbell Bench Press', 90, 5, '2026-01-01')] } } });
        app.renderFriends();
        const fresh = document.querySelector('.friend-stats-freshness').textContent;
        expect(fresh).toContain('Bijgewerkt op');
        expect(fresh).toContain('mogelijk verouderd');
    });

    it('toont "Niet vergelijkbaar" bij gewicht tegenover bodyweight en geen balk', () => {
        setup({ lastUpdated: new Date().toISOString(), muscleGroups: { chest: { exercises: [stat('Barbell Bench Press', 0, 30, '2026-08-11')] } } });
        app.renderFriends();
        const card = document.querySelector('.exercise-compare-card');
        expect(card.textContent).toContain('Niet vergelijkbaar');
        expect(card.querySelector('.compare-bar')).toBeNull();
    });

    it('toont het verschil in hele kilo\'s met een veilige balk', () => {
        setup({ lastUpdated: new Date().toISOString(), muscleGroups: { chest: { exercises: [stat('Barbell Bench Press', 90, 5, '2026-08-11')] } } });
        app.renderFriends();
        const card = document.querySelector('.exercise-compare-card');
        expect(card.textContent).toContain('+12 kg'); // 117 vs 105
        const bar = card.querySelector('.compare-bar');
        expect(bar).not.toBeNull();
        expect(bar.children[0].style.width).toBe('53%');
    });
});

describe('pushFriendStats', () => {
    afterEach(() => { delete global.FriendsManager; });

    it('pusht alleen als de logs veranderd zijn, ook na verwijderen', async () => {
        const pushStats = jest.fn().mockResolvedValue();
        global.FriendsManager = { user: { uid: 'me' }, pushStats };
        store.logs = [{ id: 'a', date: '2026-08-01T10:00:00.000Z', exercises: [] }, { id: 'b', date: '2026-08-02T10:00:00.000Z', exercises: [] }];
        app._lastPushedStatsSignature = null;

        app.pushFriendStats();
        app.pushFriendStats();
        await Promise.resolve();
        expect(pushStats).toHaveBeenCalledTimes(1);

        store.logs = store.logs.filter(l => l.id !== 'b');
        app.pushFriendStats();
        await Promise.resolve();
        expect(pushStats).toHaveBeenCalledTimes(2);
    });

    it('wordt aangeroepen na het verwijderen van een log en na een sync-merge', () => {
        document.body.innerHTML = '<div id="modal-delete-log" class="modal-overlay"></div>';
        const spy = jest.spyOn(app, 'pushFriendStats').mockImplementation(() => {});
        app.renderProgress = jest.fn();
        app.renderHome = jest.fn();
        store.logs = [{ id: 'weg', date: '2026-08-01T10:00:00.000Z', exercises: [] }];
        app.itemToDelete = { type: 'log', id: 'weg' };
        app.confirmDelete('log');
        expect(store.logs.length).toBe(0);
        expect(spy).toHaveBeenCalledTimes(1);

        CloudSync.app = app;
        app.renderPlans = jest.fn();
        app.renderAchievements = jest.fn();
        CloudSync.rerender();
        expect(spy).toHaveBeenCalledTimes(2);
        CloudSync.app = null;
        spy.mockRestore();
    });
});
