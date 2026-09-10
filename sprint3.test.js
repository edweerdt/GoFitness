/**
 * @jest-environment jsdom
 */
// Regressietests voor de Sprint 3 UX-fixes: update-melding i.p.v. stille reload,
// offline-fallback in de service worker, Escape op modals, QR-knop op iOS en
// toegankelijkheidsattributen.
const fs = require('fs');
const path = require('path');
const { app, store } = require('./app');

const read = f => fs.readFileSync(path.join(__dirname, f), 'utf8');

describe('service worker en registratie', () => {
    it('sw.js activeert niet meer ongevraagd en heeft een navigatie-fallback', () => {
        const sw = read('sw.js');
        const installBlock = sw.slice(sw.indexOf("addEventListener('install'"), sw.indexOf("addEventListener('activate'"));
        expect(installBlock).not.toContain('self.skipWaiting()');
        expect(sw).toContain("e.data.type === 'SKIP_WAITING'");
        expect(sw).toContain("e.request.mode === 'navigate'");
        expect(sw).toContain("caches.match('./index.html')");
        expect(sw).toContain('Response.error()');
        expect(sw).toMatch(/CACHE_NAME = 'go-fitness-cache-v2[3-9]'/);
    });

    it('index.html herlaadt niet meer automatisch bij controllerchange', () => {
        const html = read('index.html');
        expect(html).not.toContain('window.location.reload()');
        expect(html).toContain('app.handleServiceWorkerRegistration(reg)');
    });

    it('toont een update-melding bij een wachtende worker en herlaadt pas na Vernieuwen', () => {
        document.body.innerHTML = '<div id="toast-container"></div>';
        const listeners = {};
        const waiting = { postMessage: jest.fn() };
        const reg = { waiting, installing: null, addEventListener: jest.fn() };
        const swListeners = {};
        Object.defineProperty(navigator, 'serviceWorker', {
            configurable: true,
            value: { controller: {}, addEventListener: (ev, fn) => { swListeners[ev] = fn; } }
        });
        const reload = jest.spyOn(app, '_reloadPage').mockImplementation(() => {});
        app._updateAccepted = false;
        app._controllerChangeBound = false;

        app.handleServiceWorkerRegistration(reg);

        const toast = document.getElementById('update-toast');
        expect(toast).not.toBeNull();
        expect(toast.textContent).toContain('Nieuwe versie beschikbaar');

        // controllerchange zonder keuze van de gebruiker: geen reload
        swListeners.controllerchange();
        expect(reload).not.toHaveBeenCalled();

        toast.querySelector('.toast-action').click();
        expect(waiting.postMessage).toHaveBeenCalledWith({ type: 'SKIP_WAITING' });
        expect(document.getElementById('update-toast')).toBeNull();

        swListeners.controllerchange();
        expect(reload).toHaveBeenCalledTimes(1);

        reload.mockRestore();
        delete navigator.serviceWorker;
        expect(listeners).toEqual({});
    });

    it('toont de melding maar één keer en laat hem wegklikken', () => {
        document.body.innerHTML = '<div id="toast-container"></div>';
        app.showUpdateToast({ waiting: null });
        app.showUpdateToast({ waiting: null });
        expect(document.querySelectorAll('#update-toast').length).toBe(1);
        document.querySelector('#update-toast .toast-dismiss').click();
        expect(document.getElementById('update-toast')).toBeNull();
    });
});

describe('Escape sluit de bovenste modal', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <div id="modal-delete-plan" class="modal-overlay hidden">
                <button class="btn-secondary" onclick="app.hideDeleteModal('plan')" data-modal-close>Annuleren</button>
            </div>
            <div id="modal-exercise-history" class="modal-overlay hidden" style="z-index:1150">
                <button class="icon-btn" onclick="app.hideExerciseHistoryModal()" data-modal-close>x</button>
            </div>
            <div id="modal-zonder-knop" class="modal-overlay hidden"></div>`;
        global.app = app;
    });

    it('roept de eigen sluitfunctie aan van de modal met de hoogste z-index', () => {
        document.getElementById('modal-delete-plan').classList.remove('hidden');
        document.getElementById('modal-exercise-history').classList.remove('hidden');
        const hideHistory = jest.spyOn(app, 'hideExerciseHistoryModal').mockImplementation(() => {
            document.getElementById('modal-exercise-history').classList.add('hidden');
        });
        const hideDelete = jest.spyOn(app, 'hideDeleteModal').mockImplementation(() => {});

        expect(app.closeTopmostModal()).toBe(true);
        expect(hideHistory).toHaveBeenCalledTimes(1);
        expect(hideDelete).not.toHaveBeenCalled();

        expect(app.closeTopmostModal()).toBe(true);
        expect(hideDelete).toHaveBeenCalledWith('plan');

        hideHistory.mockRestore();
        hideDelete.mockRestore();
    });

    it('verbergt een modal zonder sluitknop direct en doet niets als er geen modal open is', () => {
        const el = document.getElementById('modal-zonder-knop');
        el.classList.remove('hidden');
        expect(app.closeTopmostModal()).toBe(true);
        expect(el.classList.contains('hidden')).toBe(true);
        expect(app.closeTopmostModal()).toBe(false);
    });

    it('reageert op de Escape-toets na setupKeyboardShortcuts', () => {
        app.setupKeyboardShortcuts();
        const el = document.getElementById('modal-zonder-knop');
        el.classList.remove('hidden');
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        expect(el.classList.contains('hidden')).toBe(true);
    });

    it('elke modal in index.html heeft een data-modal-close knop', () => {
        document.body.innerHTML = read('index.html').replace(/^[\s\S]*<body>/, '').replace(/<script[\s\S]*$/, '');
        const modals = [...document.querySelectorAll('.modal-overlay')];
        expect(modals.length).toBeGreaterThanOrEqual(16);
        modals.forEach(m => {
            expect(m.querySelector('[data-modal-close]')).not.toBeNull();
        });
    });
});

describe('QR scannen zonder BarcodeDetector (iOS)', () => {
    it('verbergt de scan-knop en toont een melding bij een directe aanroep', () => {
        document.body.innerHTML = `
            <button data-feature="qr-scan">Scan QR</button>
            <div id="toast-container"></div>
            <div id="modal-qr-scanner" class="modal-overlay hidden"></div>`;
        expect(app.isQrScanSupported()).toBe(false); // jsdom heeft geen BarcodeDetector
        app.updateQrScanAvailability();
        expect(document.querySelector('[data-feature="qr-scan"]').classList.contains('hidden')).toBe(true);

        return app.startQrScanner().then(() => {
            expect(document.getElementById('modal-qr-scanner').classList.contains('hidden')).toBe(true);
            expect(document.getElementById('toast-container').textContent).toContain('niet ondersteund');
        });
    });

    it('toont de knop wel als BarcodeDetector bestaat', () => {
        document.body.innerHTML = '<button data-feature="qr-scan" class="hidden">Scan QR</button>';
        window.BarcodeDetector = function () {};
        app.updateQrScanAvailability();
        expect(document.querySelector('[data-feature="qr-scan"]').classList.contains('hidden')).toBe(false);
        delete window.BarcodeDetector;
    });
});

describe('toegankelijkheid in index.html en style.css', () => {
    const html = read('index.html');
    const css = read('style.css');

    it('laat zoomen toe en heeft iOS-standalone metatags', () => {
        expect(html).not.toContain('user-scalable=no');
        expect(html).not.toContain('maximum-scale=1.0');
        expect(html).toContain('viewport-fit=cover');
        expect(html).toContain('name="apple-mobile-web-app-capable"');
        expect(html).toContain('name="apple-mobile-web-app-title"');
        expect(html).toContain('name="theme-color" media="(prefers-color-scheme: light)"');
    });

    it('geeft icon-only knoppen een aria-label en het toast-gebied een live-region', () => {
        document.body.innerHTML = html.replace(/^[\s\S]*<body>/, '').replace(/<script[\s\S]*$/, '');
        const iconButtons = [...document.querySelectorAll('button.icon-btn')];
        expect(iconButtons.length).toBeGreaterThan(10);
        iconButtons.forEach(b => expect(b.getAttribute('aria-label')).toBeTruthy());
        const toastContainer = document.getElementById('toast-container');
        expect(toastContainer.getAttribute('aria-live')).toBe('polite');
        expect(document.getElementById('bottom-nav').getAttribute('aria-label')).toBeTruthy();
        expect(document.getElementById('rest-timer').getAttribute('tabindex')).toBe('0');
        expect(document.getElementById('rest-timer').getAttribute('role')).toBe('button');
    });

    it('heeft focus-visible styling, reduced-motion en 44px tap-targets', () => {
        expect(css).toContain(':focus-visible');
        expect(css).toContain('@media (prefers-reduced-motion: reduce)');
        expect(css).toMatch(/\.nav-item\s*\{[^}]*min-height:\s*44px/);
        expect(css).toMatch(/\.icon-btn\s*\{[^}]*min-height:\s*44px/);
    });

    it('navigate zet aria-current op het actieve nav-item', () => {
        document.body.innerHTML = `
            <section id="view-home" class="view"></section><section id="view-plans" class="view"></section>
            <nav id="bottom-nav"><button class="nav-item active" data-target="home"></button><button class="nav-item" data-target="plans"></button></nav>
            <div id="plans-list"></div><div id="preset-plans-container"></div>`;
        store.plans = [];
        app.renderPlans = jest.fn();
        app.navigate('plans');
        expect(document.querySelector('[data-target="plans"]').getAttribute('aria-current')).toBe('page');
        expect(document.querySelector('[data-target="home"]').hasAttribute('aria-current')).toBe(false);
    });

    it('de statische Home-kaart is geen doodlopende weg meer', () => {
        expect(html).not.toContain('Geen schema actief');
        expect(html).not.toContain('Zoek in alle 107 oefeningen');
    });
});
