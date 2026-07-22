const { CloudSync, mergeSyncData } = require('./sync');

describe('mergeSyncData', () => {
    it('should union plans and logs from both devices by id', () => {
        const local = {
            plans: [{ id: 'p1', name: 'Plan A' }],
            logs: [{ id: 'l1', date: '2026-07-01T10:00:00.000Z' }],
            deleted: { plans: [], logs: [] }
        };
        const remote = {
            plans: [{ id: 'p2', name: 'Plan B' }],
            logs: [{ id: 'l2', date: '2026-07-02T10:00:00.000Z' }],
            deleted: { plans: [], logs: [] }
        };

        const merged = mergeSyncData(local, remote);

        expect(merged.plans.map(p => p.id).sort()).toEqual(['p1', 'p2']);
        expect(merged.logs.map(l => l.id)).toEqual(['l1', 'l2']);
    });

    it('should apply tombstones from either side and keep them in the result', () => {
        const local = {
            plans: [{ id: 'p1' }],
            logs: [{ id: 'l1', date: '2026-07-01T10:00:00.000Z' }],
            deleted: { plans: [], logs: ['l2'] }
        };
        const remote = {
            plans: [{ id: 'p1' }, { id: 'p2' }],
            logs: [{ id: 'l1', date: '2026-07-01T10:00:00.000Z' }, { id: 'l2', date: '2026-07-02T10:00:00.000Z' }],
            deleted: { plans: ['p2'], logs: [] }
        };

        const merged = mergeSyncData(local, remote);

        // p2 is op remote verwijderd, l2 lokaal: beide blijven weg
        expect(merged.plans.map(p => p.id)).toEqual(['p1']);
        expect(merged.logs.map(l => l.id)).toEqual(['l1']);
        expect(merged.deleted.plans).toEqual(['p2']);
        expect(merged.deleted.logs).toEqual(['l2']);
    });

    it('should prefer the most recently edited version on id conflicts', () => {
        const local = {
            plans: [],
            logs: [{ id: 'l1', date: '2026-07-01T10:00:00.000Z', duration: 45, updatedAt: '2026-07-05T10:00:00.000Z' }],
            deleted: { plans: [], logs: [] }
        };
        const remote = {
            plans: [],
            logs: [{ id: 'l1', date: '2026-07-01T10:00:00.000Z', duration: 30 }],
            deleted: { plans: [], logs: [] }
        };

        const merged = mergeSyncData(local, remote);
        expect(merged.logs).toHaveLength(1);
        expect(merged.logs[0].duration).toBe(45);
    });

    it('should sort merged logs by date so the newest stays last', () => {
        const local = { plans: [], logs: [{ id: 'l2', date: '2026-07-10T10:00:00.000Z' }], deleted: { plans: [], logs: [] } };
        const remote = { plans: [], logs: [{ id: 'l1', date: '2026-07-01T10:00:00.000Z' }], deleted: { plans: [], logs: [] } };

        const merged = mergeSyncData(local, remote);
        expect(merged.logs.map(l => l.id)).toEqual(['l1', 'l2']);
    });

    it('should tolerate missing deleted structures in older payloads', () => {
        const merged = mergeSyncData({ plans: [{ id: 'p1' }], logs: [] }, { plans: [], logs: [{ id: 'l1', date: 'x' }] });
        expect(merged.plans).toHaveLength(1);
        expect(merged.logs).toHaveLength(1);
        expect(merged.deleted).toEqual({ plans: [], logs: [] });
    });
});

describe('CloudSync.syncNow', () => {
    let fakeStore;

    beforeEach(() => {
        localStorage.clear();
        localStorage.setItem('sync_enabled', '1');

        fakeStore = {
            plans: [{ id: 'p_local', name: 'Lokaal Plan' }],
            logs: [{ id: 'l_local', date: '2026-07-10T10:00:00.000Z' }],
            deleted: { plans: [], logs: [] },
            activePlanId: 'p_local',
            save: jest.fn()
        };

        CloudSync.clientId = 'test-client-id';
        CloudSync.store = fakeStore;
        CloudSync.app = null;
        CloudSync._saveWithoutSync = fakeStore.save;
        CloudSync.accessToken = 'test-token';
        CloudSync.tokenExpiry = Date.now() + 3600 * 1000;
        CloudSync.fileId = null;
    });

    afterEach(() => {
        delete global.fetch;
        localStorage.clear();
        CloudSync.clientId = '';
        CloudSync.accessToken = null;
    });

    it('should pull remote data, merge it into the store and push the union', async () => {
        const remotePayload = {
            schemaVersion: 1,
            plans: [{ id: 'p_remote', name: 'Remote Plan' }],
            logs: [{ id: 'l_remote', date: '2026-07-05T10:00:00.000Z' }],
            deleted: { plans: [], logs: [] }
        };
        const calls = [];
        global.fetch = jest.fn((url, options = {}) => {
            calls.push({ url, options });
            if (url.includes('/drive/v3/files?')) {
                return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({ files: [{ id: 'file123' }] }) });
            }
            if (url.includes('alt=media')) {
                return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(remotePayload) });
            }
            return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({}) });
        });

        await CloudSync.syncNow();

        // Lokaal en remote zijn samengevoegd
        expect(fakeStore.plans.map(p => p.id).sort()).toEqual(['p_local', 'p_remote']);
        expect(fakeStore.logs.map(l => l.id)).toEqual(['l_remote', 'l_local']);
        expect(fakeStore.save).toHaveBeenCalled();

        // De union is teruggeschreven naar Drive
        const pushCall = calls.find(c => c.options.method === 'PATCH');
        expect(pushCall).toBeDefined();
        expect(pushCall.url).toContain('file123');
        expect(pushCall.options.body).toContain('p_remote');
        expect(pushCall.options.body).toContain('l_local');

        expect(localStorage.getItem('sync_lastSyncedAt')).not.toBeNull();
        expect(CloudSync.status).toBe('actief');
    });

    it('should create the Drive file on first sync when none exists', async () => {
        const calls = [];
        global.fetch = jest.fn((url, options = {}) => {
            calls.push({ url, options });
            if (url.includes('www.googleapis.com/drive/v3/files?')) {
                return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({ files: [] }) });
            }
            return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({ id: 'newfile1' }) });
        });

        await CloudSync.syncNow();

        const createCall = calls.find(c => c.options.method === 'POST');
        expect(createCall).toBeDefined();
        expect(createCall.url).toContain('uploadType=multipart');
        expect(createCall.options.body).toContain('appDataFolder');
        expect(createCall.options.body).toContain('l_local');
        expect(CloudSync.fileId).toBe('newfile1');
    });

    it('should mark the session as expired on a 401 from Drive', async () => {
        global.fetch = jest.fn(() => Promise.resolve({ ok: false, status: 401, json: () => Promise.resolve({}) }));

        await expect(CloudSync.syncNow()).rejects.toThrow('auth');
        expect(CloudSync.status).toBe('verlopen');
        expect(CloudSync.accessToken).toBeNull();
    });

    it('should do nothing when sync is disabled or not configured', async () => {
        global.fetch = jest.fn();

        localStorage.removeItem('sync_enabled');
        await CloudSync.syncNow();

        localStorage.setItem('sync_enabled', '1');
        CloudSync.clientId = '';
        await CloudSync.syncNow();

        expect(global.fetch).not.toHaveBeenCalled();
    });
});

describe('CloudSync.signOut', () => {
    it('should clear sync state', () => {
        localStorage.setItem('sync_enabled', '1');
        localStorage.setItem('sync_email', 'test@example.com');
        localStorage.setItem('sync_lastSyncedAt', '2026-07-01T10:00:00.000Z');
        CloudSync.accessToken = 'tok';
        CloudSync.fileId = 'f1';

        CloudSync.signOut();

        expect(localStorage.getItem('sync_enabled')).toBeNull();
        expect(localStorage.getItem('sync_email')).toBeNull();
        expect(localStorage.getItem('sync_lastSyncedAt')).toBeNull();
        expect(CloudSync.accessToken).toBeNull();
        expect(CloudSync.fileId).toBeNull();
        expect(CloudSync.enabled).toBe(false);
    });
});
