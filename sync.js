// sync.js — Google-login + synchronisatie van schema's en sessies via Google Drive
//
// Werkt volledig client-side: de data staat in de appDataFolder van het eigen
// Google-account van de gebruiker, er is geen eigen server nodig. Inloggen is
// optioneel; zonder login blijft de app volledig lokaal werken.
//
// Setup (eenmalig, zie ook README): maak in Google Cloud Console een OAuth 2.0
// Client ID (type "Web application") aan, zet de GitHub Pages-URL bij de
// "Authorized JavaScript origins", schakel de Google Drive API in en vul het
// Client ID hieronder in.

const GOOGLE_CLIENT_ID = '1064597245112-8vvkjkce2s40id51elnl4k0djfjfhlg6.apps.googleusercontent.com'; // <-- OAuth 2.0 Client ID invullen om sync te activeren

const SYNC_SCOPES = 'https://www.googleapis.com/auth/drive.appdata openid email';
const SYNC_FILE_NAME = 'gofitness-data.json';

// Voegt lokale en remote data zonder verlies samen:
// - unie op id (sessies van verschillende devices blijven allemaal bestaan)
// - verwijderingen (tombstones) winnen van beide kanten
// - bij hetzelfde id op beide devices wint de nieuwste bewerking
function mergeSyncData(local, remote) {
    const uniq = arr => [...new Set(arr)];
    const deleted = {
        plans: uniq([...(local.deleted && local.deleted.plans || []), ...(remote.deleted && remote.deleted.plans || [])]),
        logs: uniq([...(local.deleted && local.deleted.logs || []), ...(remote.deleted && remote.deleted.logs || [])])
    };

    const ts = item => new Date(item.updatedAt || item.date || 0).getTime() || 0;
    const mergeById = (a, b, tombstones) => {
        const map = new Map();
        [...a, ...b].forEach(item => {
            if (!item || !item.id || tombstones.includes(item.id)) return;
            const existing = map.get(item.id);
            if (!existing || ts(item) > ts(existing)) map.set(item.id, item);
        });
        return [...map.values()];
    };

    const plans = mergeById(local.plans || [], remote.plans || [], deleted.plans);
    // Logs op datum sorteren: de app verwacht dat de laatste log de recentste is
    const logs = mergeById(local.logs || [], remote.logs || [], deleted.logs)
        .sort((a, b) => ((a.date || '') < (b.date || '') ? -1 : 1));

    return { plans, logs, deleted };
}

const CloudSync = {
    clientId: GOOGLE_CLIENT_ID,
    store: null,
    app: null,
    tokenClient: null,
    accessToken: null,
    tokenExpiry: 0,
    fileId: null,
    pushTimer: null,
    status: 'uit', // uit | verbinden | synchroniseren | actief | verlopen | offline | fout
    lastError: null,
    _syncing: false,
    _saveWithoutSync: null,

    get enabled() { return localStorage.getItem('sync_enabled') === '1'; },
    get email() { return localStorage.getItem('sync_email') || ''; },
    get lastSyncedAt() { return localStorage.getItem('sync_lastSyncedAt') || null; },

    init(deps) {
        this.store = deps.store;
        this.app = deps.app;

        // Elke lokale wijziging (store.save) plant automatisch een push in
        this._saveWithoutSync = this.store.save.bind(this.store);
        this.store.save = () => {
            this._saveWithoutSync();
            if (!this._syncing) this.schedulePush();
        };

        window.addEventListener('online', () => {
            if (this.enabled) this.syncNow().catch(() => {});
        });

        if (this.enabled && this.clientId) {
            this.status = 'verbinden';
            this.syncNow().catch(() => {});
        }
        this.renderPanel();
    },

    // --- AUTHENTICATIE ---

    loadGis() {
        if (typeof google !== 'undefined' && google.accounts && google.accounts.oauth2) return Promise.resolve();
        return new Promise((resolve, reject) => {
            const s = document.createElement('script');
            s.src = 'https://accounts.google.com/gsi/client';
            s.onload = resolve;
            s.onerror = () => reject(new Error('Kon Google-login niet laden. Ben je online?'));
            document.head.appendChild(s);
        });
    },

    async ensureToken(interactive) {
        if (this.accessToken && Date.now() < this.tokenExpiry - 60000) return this.accessToken;
        await this.loadGis();
        if (!this.tokenClient) {
            this.tokenClient = google.accounts.oauth2.initTokenClient({
                client_id: this.clientId,
                scope: SYNC_SCOPES,
                callback: () => {}
            });
        }
        return new Promise((resolve, reject) => {
            this.tokenClient.callback = (resp) => {
                if (resp.error) return reject(new Error(resp.error));
                this.accessToken = resp.access_token;
                this.tokenExpiry = Date.now() + ((parseInt(resp.expires_in, 10) || 3600) * 1000);
                resolve(this.accessToken);
            };
            // Zonder interactie proberen (stil hergebruik van eerdere toestemming),
            // met interactie toont Google het inlog-/toestemmingsscherm
            this.tokenClient.requestAccessToken({ prompt: interactive ? 'consent' : '' });
        });
    },

    async signIn() {
        if (!this.clientId) return;
        this.setStatus('verbinden');
        try {
            await this.ensureToken(true);

            // E-mailadres ophalen voor de statusweergave
            try {
                const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: { 'Authorization': 'Bearer ' + this.accessToken }
                });
                if (res.ok) {
                    const info = await res.json();
                    if (info.email) localStorage.setItem('sync_email', info.email);
                }
            } catch (e) { /* geen e-mail is geen blokkade */ }

            localStorage.setItem('sync_enabled', '1');
            await this.syncNow();
        } catch (e) {
            this.lastError = e.message;
            this.setStatus('fout');
        }
    },

    signOut() {
        try {
            if (this.accessToken && typeof google !== 'undefined' && google.accounts && google.accounts.oauth2) {
                google.accounts.oauth2.revoke(this.accessToken, () => {});
            }
        } catch (e) { /* revoke is best-effort */ }
        clearTimeout(this.pushTimer);
        this.accessToken = null;
        this.tokenExpiry = 0;
        this.fileId = null;
        localStorage.removeItem('sync_enabled');
        localStorage.removeItem('sync_email');
        localStorage.removeItem('sync_lastSyncedAt');
        this.setStatus('uit');
    },

    // --- GOOGLE DRIVE ---

    async driveRequest(path, options = {}) {
        const token = await this.ensureToken(false);
        const res = await fetch('https://www.googleapis.com' + path, {
            ...options,
            headers: { 'Authorization': 'Bearer ' + token, ...(options.headers || {}) }
        });
        if (res.status === 401 || res.status === 403) {
            this.accessToken = null;
            throw new Error('auth');
        }
        if (!res.ok) throw new Error('Drive API fout (' + res.status + ')');
        return res;
    },

    async findFileId() {
        if (this.fileId) return this.fileId;
        const q = encodeURIComponent(`name='${SYNC_FILE_NAME}'`);
        const res = await this.driveRequest(`/drive/v3/files?spaces=appDataFolder&fields=files(id,name)&q=${q}`);
        const data = await res.json();
        this.fileId = (data.files && data.files.length > 0) ? data.files[0].id : null;
        return this.fileId;
    },

    async pull() {
        const id = await this.findFileId();
        if (!id) return null;
        const res = await this.driveRequest(`/drive/v3/files/${id}?alt=media`);
        try {
            return await res.json();
        } catch (e) {
            return null; // corrupt bestand -> behandelen als geen remote data
        }
    },

    async push(data) {
        const body = JSON.stringify({
            schemaVersion: 1,
            plans: data.plans,
            logs: data.logs,
            deleted: data.deleted,
            exportDate: new Date().toISOString()
        });

        const id = await this.findFileId();
        if (id) {
            await this.driveRequest(`/upload/drive/v3/files/${id}?uploadType=media`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body
            });
        } else {
            const boundary = 'gofitness_sync_boundary';
            const multipart =
                `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n` +
                JSON.stringify({ name: SYNC_FILE_NAME, parents: ['appDataFolder'] }) +
                `\r\n--${boundary}\r\nContent-Type: application/json\r\n\r\n` +
                body +
                `\r\n--${boundary}--`;
            const res = await this.driveRequest(`/upload/drive/v3/files?uploadType=multipart&fields=id`, {
                method: 'POST',
                headers: { 'Content-Type': `multipart/related; boundary=${boundary}` },
                body: multipart
            });
            const created = await res.json();
            this.fileId = created.id;
        }
    },

    // --- SYNCHRONISATIE ---

    async syncNow() {
        if (!this.enabled || !this.clientId) return;
        if (typeof navigator !== 'undefined' && navigator.onLine === false) {
            this.setStatus('offline');
            return;
        }

        this.setStatus('synchroniseren');
        this._syncing = true;
        try {
            const remote = await this.pull();
            const local = { plans: this.store.plans, logs: this.store.logs, deleted: this.store.deleted };
            const merged = remote ? mergeSyncData(local, remote) : local;

            this.store.plans = merged.plans;
            this.store.logs = merged.logs;
            this.store.deleted = merged.deleted;
            if (this.store.activePlanId && !merged.plans.find(p => p.id === this.store.activePlanId)) {
                this.store.activePlanId = merged.plans.length > 0 ? merged.plans[0].id : null;
            }
            this._saveWithoutSync();

            await this.push(merged);

            localStorage.setItem('sync_lastSyncedAt', new Date().toISOString());
            this.lastError = null;
            this.setStatus('actief');
            this.rerender();
        } catch (e) {
            this.lastError = e.message;
            this.setStatus(e.message === 'auth' ? 'verlopen' : 'fout');
            throw e;
        } finally {
            this._syncing = false;
        }
    },

    // Debounced push: meerdere snelle wijzigingen worden gebundeld tot 1 sync
    schedulePush() {
        if (!this.enabled || !this.clientId) return;
        clearTimeout(this.pushTimer);
        this.pushTimer = setTimeout(() => {
            this.syncNow().catch(() => {});
        }, 4000);
    },

    // --- UI ---

    setStatus(status) {
        this.status = status;
        this.renderPanel();
    },

    rerender() {
        if (!this.app) return;
        ['renderHome', 'renderPlans', 'renderProgress', 'renderAchievements'].forEach(fn => {
            try { this.app[fn](); } catch (e) { /* view mogelijk nog niet in de DOM */ }
        });
    },

    renderPanel() {
        if (typeof document === 'undefined') return;
        const badge = document.getElementById('sync-status');
        const detail = document.getElementById('sync-detail');
        const actions = document.getElementById('sync-actions');
        if (!badge || !detail || !actions) return;

        const esc = this.app ? this.app.escapeHTML.bind(this.app) : (s => s);

        if (!this.clientId) {
            badge.textContent = 'niet ingesteld';
            badge.className = 'status-badge';
            detail.textContent = 'Om sync te gebruiken moet eenmalig een Google OAuth Client ID ingevuld worden in sync.js (zie README).';
            actions.innerHTML = '';
            return;
        }

        const labels = {
            uit: 'uit', verbinden: 'verbinden...', synchroniseren: 'synchroniseren...',
            actief: 'actief', verlopen: 'sessie verlopen', offline: 'offline', fout: 'fout'
        };
        badge.textContent = labels[this.status] || this.status;
        badge.className = 'status-badge ' + (this.status === 'actief' ? 'green' : (this.status === 'fout' || this.status === 'verlopen' ? 'red' : (this.status === 'offline' ? 'orange' : '')));

        if (!this.enabled) {
            detail.textContent = 'Log in met Google om je schema\'s en sessies automatisch te synchroniseren tussen je apparaten, met altijd een backup in je eigen Google Drive.';
            actions.innerHTML = '<button class="btn-secondary flex-1" onclick="CloudSync.signIn()"><span class="material-icons-round">login</span> Inloggen met Google</button>';
            return;
        }

        let text = this.email ? `Verbonden als ${this.email}.` : 'Verbonden met Google Drive.';
        if (this.lastSyncedAt) {
            text += ` Laatst gesynchroniseerd: ${new Date(this.lastSyncedAt).toLocaleString('nl-NL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}.`;
        }
        if (this.status === 'fout' && this.lastError) text += ` Fout: ${this.lastError}`;
        if (this.status === 'verlopen') text += ' Log opnieuw in om verder te synchroniseren.';
        detail.innerHTML = esc(text);

        const primary = this.status === 'verlopen'
            ? '<button class="btn-secondary flex-1" onclick="CloudSync.signIn()"><span class="material-icons-round">login</span> Opnieuw inloggen</button>'
            : '<button class="btn-secondary flex-1" onclick="CloudSync.syncNow().catch(function(){})"><span class="material-icons-round">sync</span> Nu synchroniseren</button>';
        actions.innerHTML = primary +
            '<button class="btn-secondary flex-1" onclick="CloudSync.signOut()"><span class="material-icons-round">logout</span> Uitloggen</button>';
    }
};

// Export voor tests (Node/jest); in de browser is CloudSync een top-level binding
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CloudSync, mergeSyncData };
}
