// app.js

class DataStore {
    constructor() {
        // Only load if localStorage is defined (useful for testing environments)
        if (typeof localStorage !== 'undefined') {
            this.load();
        } else {
            this.plans = [];
            this.activePlanId = null;
            this.logs = [];
            this.activeWorkoutState = null;
            this.theme = 'auto';
        }
    }
    load() {
        this.plans = this.safeParse('plans', []);
        this.activePlanId = localStorage.getItem('activePlanId') || null;
        this.logs = this.safeParse('logs', []);
        this.activeWorkoutState = this.safeParse('activeWorkoutState', null);
        this.theme = localStorage.getItem('theme') || 'auto';
    }
    safeParse(key, fallback) {
        // Corrupte data in localStorage mag de app niet laten crashen bij het opstarten
        try {
            const raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : fallback;
        } catch (e) {
            console.warn(`Kon '${key}' niet lezen uit localStorage, standaardwaarde gebruikt.`, e);
            localStorage.removeItem(key);
            return fallback;
        }
    }
    save() {
        try {
            localStorage.setItem('plans', JSON.stringify(this.plans));
            if(this.activePlanId) {
                localStorage.setItem('activePlanId', this.activePlanId);
            } else {
                // Anders blijft een verwijderd actief plan na een reload terugkomen
                localStorage.removeItem('activePlanId');
            }
            localStorage.setItem('logs', JSON.stringify(this.logs));
            localStorage.setItem('theme', this.theme);
            return true;
        } catch (e) {
            console.error('Opslaan naar localStorage mislukt:', e);
            if (typeof app !== 'undefined' && app.showToast) {
                app.showToast('⚠️ Opslag vol! Data kon niet worden opgeslagen.', 'error');
            }
            return false;
        }
    }
    saveActiveWorkoutState(state) {
        this.activeWorkoutState = state;
        try {
            if(state) {
                localStorage.setItem('activeWorkoutState', JSON.stringify(state));
            } else {
                localStorage.removeItem('activeWorkoutState');
            }
        } catch (e) {
            console.error('Workout-state opslaan mislukt:', e);
            if (typeof app !== 'undefined' && app.showToast) {
                app.showToast('⚠️ Opslag vol! Workout-voortgang kon niet worden bewaard.', 'error');
            }
        }
    }
    getActivePlan() {
        return this.plans.find(p => p.id === this.activePlanId) || null;
    }
    importPlan(planData) {
        planData.id = 'plan_' + Date.now();

        // Normalize top-level rich schema fields
        if (!planData.schemaVersion) planData.schemaVersion = "1.0";
        if (!planData.schedule) planData.schedule = {};
        if (planData.targetSessionsPerWeek && !planData.schedule.targetSessionsPerWeek) {
            planData.schedule.targetSessionsPerWeek = planData.targetSessionsPerWeek;
        }
        if (planData.minRecoveryHours && !planData.schedule.minRecoveryHours) {
            planData.schedule.minRecoveryHours = planData.minRecoveryHours;
        }
        if (!planData.recoveryRules) planData.recoveryRules = {};
        if (!planData.successMilestones) planData.successMilestones = [];

        // Give ids to sessions and exercises if they don't have one
        planData.sessions.forEach(s => {
            if (!s.id && !s.sessionId) s.id = 'sess_' + Math.random().toString(36).slice(2, 11);
            else if (s.sessionId) s.id = s.sessionId;
            
            s.exercises.forEach(e => {
                if (!e.id && !e.exerciseId) e.id = 'ex_' + Math.random().toString(36).slice(2, 11);
                else if (e.exerciseId) e.id = e.exerciseId;
            });
        });
        this.plans.push(planData);
        if (!this.activePlanId) this.activePlanId = planData.id;
        this.save();
    }
    saveWorkoutLog(log) {
        this.logs.push({ ...log, id: 'log_' + Date.now(), date: new Date().toISOString() });
        this.save();
    }
    restoreBackup(backup) {
        this.plans = backup.plans;
        this.logs = backup.logs;
        // De backup bevat geen activePlanId; kies een geldig plan als het huidige niet (meer) bestaat
        if (!this.plans.find(p => p.id === this.activePlanId)) {
            this.activePlanId = this.plans.length > 0 ? this.plans[0].id : null;
        }
        this.save();
    }
}

const store = new DataStore();

const app = {
    currentView: 'home',
    activeWorkout: null,

    init() {
        if(store.activeWorkoutState) {
            this.activeWorkout = store.activeWorkoutState;
            if(this.activeWorkout && this.activeWorkout.startTime) {
                this.activeWorkout.startTime = new Date(this.activeWorkout.startTime);
            }
        }

        this.applyTheme();

        // Wake lock vervalt zodra de app naar de achtergrond gaat; vraag opnieuw aan
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible' && this.activeWorkout && this.currentView === 'workout') {
                this.requestWakeLock();
            }
        });

        this.setupNavigation();
        this.renderHome();
        this.renderPlans();
        this.renderProgress();
        this.renderAchievements();
    },

    toggleTheme() {
        const themes = ['auto', 'light', 'dark'];
        const currentIdx = themes.indexOf(store.theme);
        store.theme = themes[(currentIdx + 1) % themes.length];
        store.save();
        this.applyTheme();
    },

    showToast(message, type = 'success') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const iconName = type === 'success' ? 'check_circle' : 'error_outline';
        const iconColor = type === 'success' ? 'var(--status-green)' : 'var(--status-red)';

        toast.innerHTML = `
            <span class="material-icons-round" style="color: ${iconColor};">${iconName}</span>
            <div style="flex: 1; font-weight: 500; font-size: 0.9rem;">${this.escapeHTML(String(message))}</div>
        `;

        container.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'fadeOut 0.3s ease forwards';
            setTimeout(() => {
                if (container.contains(toast)) {
                    container.removeChild(toast);
                }
            }, 300);
        }, 3000);
    },

    applyTheme() {
        const btns = document.querySelectorAll('.theme-toggle-btn');
        
        document.documentElement.classList.remove('theme-light', 'theme-dark');
        
        let iconName = 'brightness_auto';
        if (store.theme === 'light') {
            document.documentElement.classList.add('theme-light');
            iconName = 'light_mode';
        } else if (store.theme === 'dark') {
            document.documentElement.classList.add('theme-dark');
            iconName = 'dark_mode';
        }

        btns.forEach(btn => {
            const icon = btn.querySelector('.material-icons-round');
            if (icon) icon.textContent = iconName;
        });
    },

    navigate(viewId) {
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        
        document.getElementById(`view-${viewId}`).classList.add('active');
        const navBtn = document.querySelector(`.nav-item[data-target="${viewId}"]`);
        if(navBtn) navBtn.classList.add('active');
        
        if (viewId === 'workout') {
            document.getElementById('bottom-nav').classList.add('hidden');
        } else {
            document.getElementById('bottom-nav').classList.remove('hidden');
        }

        this.currentView = viewId;
        
        if(viewId === 'home') this.renderHome();
        if(viewId === 'plans') this.renderPlans();
        if(viewId === 'progress') this.renderProgress();
        if(viewId === 'achievements') this.renderAchievements();
    },

    setupNavigation() {
        document.querySelectorAll('.nav-item').forEach(btn => {
            btn.addEventListener('click', () => {
                this.navigate(btn.dataset.target);
            });
        });
    },

    // --- LOGIC ---
    
    getRecoveryStatus() {
        const plan = store.getActivePlan();
        if(!plan || store.logs.length === 0) return { status: 'green', text: 'Klaar om te trainen' };

        const minHours = (plan.schedule && plan.schedule.minRecoveryHours) ? plan.schedule.minRecoveryHours : (plan.minRecoveryHours || 48);
        const now = new Date();

        // Herstelregels per spiergroep, genormaliseerd op sleutel
        const mgRules = {};
        if (plan.recoveryRules && plan.recoveryRules.muscleGroupRecoveryHours) {
            Object.entries(plan.recoveryRules.muscleGroupRecoveryHours).forEach(([k, v]) => {
                mgRules[this.normalizeMuscleGroup(k)] = v;
            });
        }

        // Per spiergroep: wanneer voor het laatst getraind?
        const lastTrained = {};
        store.logs.forEach(log => {
            if (!log.date || !log.exercises) return;
            const t = new Date(log.date).getTime();
            log.exercises.forEach(ex => {
                (ex.muscleGroups || []).forEach(mg => {
                    const g = this.normalizeMuscleGroup(mg);
                    if (!lastTrained[g] || t > lastTrained[g]) lastTrained[g] = t;
                });
            });
        });

        // Spiergroepen die de eerstvolgende (aanbevolen) sessie traint
        const rec = (plan.sessions && plan.sessions.length > 0) ? this.getRecommendedSession() : null;
        const nextGroups = [];
        if (rec && rec.session && rec.session.exercises) {
            rec.session.exercises.forEach(ex => (ex.muscleGroups || []).forEach(mg => {
                const g = this.normalizeMuscleGroup(mg);
                if (!nextGroups.includes(g)) nextGroups.push(g);
            }));
        }

        // Spiergroep-specifiek stoplicht: alleen de spiergroepen die de volgende sessie
        // traint tellen mee. "Benen gisteren, push vandaag" mag dus gewoon groen zijn.
        if (nextGroups.length > 0 && Object.keys(lastTrained).length > 0) {
            let worstRatio = Infinity;
            nextGroups.forEach(g => {
                if (!lastTrained[g]) return; // nooit getraind -> hersteld
                const hoursSince = (now - lastTrained[g]) / (1000 * 60 * 60);
                const required = mgRules[g] || minHours;
                worstRatio = Math.min(worstRatio, hoursSince / required);
            });
            if (worstRatio === Infinity || worstRatio >= 1) return { status: 'green', text: 'Klaar om te trainen' };
            if (worstRatio < 0.5) return { status: 'red', text: 'Beter rusten' };
            return { status: 'orange', text: 'Rustig aan' };
        }

        // Fallback zonder spiergroep-data: algemene rusttijd sinds de laatste sessie
        const lastLog = store.logs[store.logs.length - 1];
        const hoursSinceLast = (now - new Date(lastLog.date)) / (1000 * 60 * 60);

        if(hoursSinceLast < (minHours * 0.5)) return { status: 'red', text: 'Beter rusten' };
        if(hoursSinceLast < minHours) return { status: 'orange', text: 'Rustig aan' };
        return { status: 'green', text: 'Volledig hersteld' };
    },

    getRecommendedSession() {
        const plan = store.getActivePlan();
        if(!plan) return null;
        
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const sevenDaysAgoStr = sevenDaysAgo.toISOString();
        
        const recentLogs = store.logs.filter(l => l.date > sevenDaysAgoStr);
        const doneSessionIds = recentLogs.map(l => l.sessionId);
        
        let orderedSessions = [...plan.sessions];

        // Use defaultSessionOrder from rich schema if available
        if (plan.schedule && plan.schedule.defaultSessionOrder && plan.schedule.defaultSessionOrder.length > 0) {
            orderedSessions = plan.schedule.defaultSessionOrder.map(id => plan.sessions.find(s => s.id === id || s.sessionId === id)).filter(Boolean);
        } else {
            // Sort by dayOrderHint if available
            orderedSessions.sort((a, b) => (a.dayOrderHint || 99) - (b.dayOrderHint || 99));
        }

        const nextSession = orderedSessions.find(s => !doneSessionIds.includes(s.id));
        
        if(nextSession) {
            return {
                session: nextSession,
                reason: `Dit is de volgende in je schema (${plan.name}).`
            };
        }
        
        return {
            session: orderedSessions[0],
            reason: `Je hebt alle sessies gehad, we beginnen weer vooraan.`
        };
    },

    // --- UTILS ---

    // Normaliseert spiergroep-namen uit schema's (hoofdletters, synoniemen) naar de interne sleutels
    normalizeMuscleGroup(mg) {
        const key = String(mg).toLowerCase().trim();
        const aliases = {
            biceps: 'arms', triceps: 'arms', forearms: 'arms',
            quads: 'legs', hamstrings: 'legs', calves: 'legs',
            abs: 'core', lats: 'back', traps: 'back'
        };
        return aliases[key] || key;
    },

    // Fallback voor oude logs zonder muscleGroups: raad spiergroepen op basis van de oefennaam
    guessMuscleGroupsFromName(name) {
        const n = String(name || '').toLowerCase();
        const groups = [];
        if (n.includes('press') || n.includes('push') || n.includes('fly') || n.includes('dip')) {
            if (n.includes('leg')) groups.push('legs');
            else if (n.includes('shoulder') || n.includes('overhead') || n.includes('pike')) groups.push('shoulders');
            else groups.push('chest');
        }
        if (n.includes('pull') || n.includes('row') || n.includes('chin') || n.includes('deadlift')) groups.push('back');
        if (n.includes('squat') || n.includes('lunge') || (n.includes('extension') && n.includes('leg')) || (n.includes('curl') && n.includes('leg'))) groups.push('legs');
        if (n.includes('thrust') || n.includes('bridge') || n.includes('kickback')) groups.push('glutes');
        if (n.includes('plank') || n.includes('crunch') || (n.includes('raise') && n.includes('leg'))) groups.push('core');
        if ((n.includes('curl') || n.includes('extension') || n.includes('skull')) && !n.includes('leg')) groups.push('arms');
        return [...new Set(groups)];
    },

    escapeHTML(str) {
        if (typeof str !== 'string') return str;
        return str.replace(/[&<>'"]/g,
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag] || tag)
        );
    },

    // --- RENDERING ---

    formatRichField(value, label = null) {
        if (value === null || value === undefined) return '';

        const safeLabel = this.escapeHTML(label);
        let labelHtml = safeLabel ? `<strong>${safeLabel}:</strong> ` : '';
        let headerHtml = safeLabel ? `<div style="font-weight:600; font-size:0.85rem; color:var(--text-primary); margin-top:8px;">${safeLabel}</div>` : '';

        if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
            const safeValue = this.escapeHTML(String(value));
            return `<div class="text-sm text-muted mt-1">${labelHtml}${safeValue}</div>`;
        }

        if (Array.isArray(value)) {
            if (value.length === 0) return '';
            let html = headerHtml + `<ul class="text-sm text-muted mt-1" style="list-style-type: disc; padding-left: 20px; margin-bottom: 8px;">`;
            value.forEach(item => {
                let formattedItem = this.formatRichField(item);
                if (typeof item === 'string' || typeof item === 'number' || typeof item === 'boolean') {
                    formattedItem = formattedItem.replace(/^<div[^>]*>/, '').replace(/<\/div>$/, '');
                }
                html += `<li>${formattedItem}</li>`;
            });
            html += `</ul>`;
            return html;
        }

        if (typeof value === 'object') {
            const keys = Object.keys(value);
            if (keys.length === 0) return '';
            let html = headerHtml + `<div class="text-sm text-muted mt-1" style="margin-bottom: 8px; padding-left: 8px; border-left: 2px solid var(--border-color);">`;
            keys.forEach(key => {
                html += this.formatRichField(value[key], key);
            });
            html += `</div>`;
            return html;
        }

        return '';
    },

    renderHome() {
        const dateOpt = { weekday: 'long', day: 'numeric', month: 'long' };
        document.getElementById('home-date').textContent = new Date().toLocaleDateString('nl-NL', dateOpt);

        const recStatus = this.getRecoveryStatus();
        const badge = document.getElementById('recovery-status');
        badge.className = `status-badge ${recStatus.status}`;
        document.getElementById('recovery-text').textContent = recStatus.text;
        
        let icon = 'battery_charging_full';
        if(recStatus.status === 'orange') icon = 'battery_50';
        if(recStatus.status === 'red') icon = 'battery_alert';
        badge.querySelector('.material-icons-round').textContent = icon;

        const btnStart = document.getElementById('btn-start-session');
        
        if (this.activeWorkout) {
            document.getElementById('recommended-card-title').textContent = "Sessie in uitvoering";
            document.getElementById('recommended-session-name').textContent = this.activeWorkout.session.name;
            document.getElementById('recommended-reason').textContent = "Je was al bezig met deze sessie. Pak hem weer op!";
            btnStart.textContent = "Hervat Nu";
            btnStart.disabled = false;
            btnStart.onclick = () => this.openWorkoutView();
        } else {
            document.getElementById('recommended-card-title').textContent = "Aanbevolen Sessie";
            const recSession = this.getRecommendedSession();
            if(recSession) {
                document.getElementById('recommended-session-name').textContent = recSession.session.name;
                document.getElementById('recommended-reason').textContent = recSession.reason;
                btnStart.textContent = "Start Nu";
                btnStart.disabled = false;
                btnStart.onclick = () => this.startWorkout(recSession.session);
            } else {
                document.getElementById('recommended-session-name').textContent = "Geen schema actief";
                document.getElementById('recommended-reason').textContent = "Importeer eerst een trainingsschema via Schema's.";
                btnStart.textContent = "Start Nu";
                btnStart.disabled = true;
            }
        }

        // Stats
        document.getElementById('stat-completed').textContent = store.logs.length;
        document.getElementById('stat-streak').textContent = this.calculateStreak();

        // Target sessions per week progress
        const plan = store.getActivePlan();
        const targetSessions = plan ? ((plan.schedule && plan.schedule.targetSessionsPerWeek) ? plan.schedule.targetSessionsPerWeek : plan.targetSessionsPerWeek) : null;
        let existingProgress = document.getElementById('home-weekly-progress');
        if (plan && targetSessions) {
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
            const oneWeekAgoStr = oneWeekAgo.toISOString();
            const recentLogsCount = store.logs.filter(l => l.date > oneWeekAgoStr && l.planId === plan.id).length;

            const progressText = `${recentLogsCount}/${targetSessions} sessies deze week`;

            // Add or update progress text under the streak stats
            const statsMini = document.querySelector('.stats-mini');
            if (!existingProgress) {
                existingProgress = document.createElement('div');
                existingProgress.id = 'home-weekly-progress';
                existingProgress.style.gridColumn = '1 / -1';
                statsMini.appendChild(existingProgress);
            }
            existingProgress.innerHTML = `<div class="glass-panel text-center text-sm" style="padding: 8px;"><strong>Doel:</strong> ${this.escapeHTML(progressText)}</div>`;
        } else if (existingProgress) {
            // Geen (plan met) weekdoel meer -> oude voortgangsbalk opruimen
            existingProgress.remove();
        }
    },

    renderPlans() {
        const list = document.getElementById('plans-list');
        list.innerHTML = '';
        if(store.plans.length === 0) {
            list.innerHTML = '<p class="text-muted">Nog geen schema\'s. Importeer er een!</p>';
            return;
        }
        store.plans.forEach(p => {
            const el = document.createElement('div');
            el.className = 'glass-panel flex-col gap-3';
            const isActive = store.activePlanId === p.id;
            
            const sched = p.schedule || {};
            const targetSessions = sched.targetSessionsPerWeek || p.targetSessionsPerWeek || '?';
            let descriptionText = p.description || '';
            descriptionText = descriptionText.split(/Herstelregels/i)[0];
            descriptionText = descriptionText.split(/Voltooiingsregels/i)[0];
            descriptionText = descriptionText.split(/Mijlpalen/i)[0];
            descriptionText = descriptionText.trim();
            const desc = descriptionText ? `<p class="text-sm mt-1" style="color:var(--text-primary);">${this.escapeHTML(descriptionText)}</p>` : '';
            const recPattern = sched.recommendedPattern || p.recommendedPattern ?
                `<div class="text-sm text-muted mt-1"><strong>Aanbevolen patroon:</strong> ${this.escapeHTML(String(sched.recommendedPattern || p.recommendedPattern))}</div>` : '';
            const recovery = sched.minRecoveryHours || p.minRecoveryHours ?
                `<div class="text-sm text-muted"><strong>Herstel:</strong> Minimaal ${this.escapeHTML(String(sched.minRecoveryHours || p.minRecoveryHours))} uur</div>` : '';
            const weeklyMins = p.estimatedWeeklyMinutes ?
                `<div class="text-sm text-muted"><strong>Geschatte tijd per week:</strong> ${this.escapeHTML(String(p.estimatedWeeklyMinutes))} min</div>` : '';
            const sessionOrder = p.defaultSessionOrder ?
                `<div class="text-sm text-muted mt-1"><strong>Sessie volgorde:</strong> ${this.escapeHTML(p.defaultSessionOrder.join(', '))}</div>` :
                (p.sessions ? `<div class="text-sm text-muted mt-1"><strong>Sessies:</strong> ${this.escapeHTML(p.sessions.map(s=>s.name).join(', '))}</div>` : '');

            const level = p.level ? `<span class="status-badge" style="padding:2px 6px; font-size:0.7rem; background:rgba(255,255,255,0.1); color:var(--text-muted);">${this.escapeHTML(String(p.level))}</span>` : '';
            const goal = p.goal ? `<div class="text-sm text-muted"><strong>Doel:</strong> ${this.escapeHTML(String(p.goal))}</div>` : '';
            const equipment = p.equipment && p.equipment.length > 0 ? `<div class="text-sm text-muted mt-1"><strong>Apparatuur:</strong> ${this.escapeHTML(p.equipment.join(', '))}</div>` : '';

            const scheduleInfo = this.formatRichField(p.schedule, 'Schema Regels');
            const progressionRules = this.formatRichField(p.progressionRules, 'Progressieregels');


            el.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                    <div style="flex:1; min-width:0;">
                        <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
                            <h3 style="color:var(--text-primary); text-transform:none; font-size:1.1rem; line-height:1.2; margin:0; overflow-wrap:anywhere;">${this.escapeHTML(p.name)}</h3>
                            ${level}
                        </div>
                        ${desc}
                    </div>
                    <div style="display:flex; align-items:center; gap:8px; margin-left:12px; flex-shrink:0;">
                        ${isActive ? '<span class="status-badge green" style="padding:4px 8px; font-size:0.7rem; white-space:nowrap;">Actief</span>' : ''}
                        <span class="material-icons-round" style="font-size:1.4rem; cursor:pointer; color:var(--text-muted);" onclick="app.sharePlan('${this.escapeHTML(p.id)}')" title="Schema delen">ios_share</span>
                        <span class="material-icons-round" style="font-size:1.4rem; cursor:pointer; color:#ff5252;" onclick="app.showDeleteModal('plan', '${this.escapeHTML(p.id)}')">delete_outline</span>
                    </div>
                </div>
                
                <div style="background: rgba(0,0,0,0.03); padding: 8px 12px; border-radius: 8px; margin-top: 8px; cursor: pointer;" onclick="this.nextElementSibling.classList.toggle('hidden')">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <div style="font-weight:600; font-size:0.85rem; color:var(--accent-color);">DETAILS</div>
                        <span class="material-icons-round text-muted" style="font-size:1.2rem;">expand_more</span>
                    </div>
                    <div class="text-sm text-muted mt-1"><strong>Frequentie:</strong> ${this.escapeHTML(String(targetSessions))}x per week (${p.sessions.length} unieke sessies)</div>
                    ${goal}
                </div>

                <div class="hidden" style="background: rgba(0,0,0,0.03); padding: 8px 12px; border-radius: 8px; margin-top: 4px; border-top: 1px solid rgba(255,255,255,0.05);">
                    ${equipment}
                    ${weeklyMins}
                    ${recovery}
                    ${scheduleInfo}
                    ${progressionRules}
                    ${recPattern}
                    ${sessionOrder}
                </div>
                
                ${!isActive ? `<button class="btn-secondary mt-3 w-full" onclick="app.setActivePlan('${p.id}')">Maak Actief</button>` : ''}
            `;
            list.appendChild(el);
        });
    },

    renderProgress() {
        const totalWorkouts = store.logs.length;
        let totalMinutes = 0;
        let totalExercises = 0;
        for (let i = 0; i < store.logs.length; i++) {
            const l = store.logs[i];
            totalMinutes += (l.duration || 45);
            totalExercises += (l.exercisesCompleted || 0);
        }
        
        document.getElementById('full-stats-grid').innerHTML = `
            <div class="stat-box glass-panel"><div class="stat-details"><span class="stat-value">${totalWorkouts}</span><span class="stat-label">Trainingen</span></div></div>
            <div class="stat-box glass-panel"><div class="stat-details"><span class="stat-value">${this.calculateStreak()}</span><span class="stat-label">Weken Streak</span></div></div>
            <div class="stat-box glass-panel"><div class="stat-details"><span class="stat-value">${totalMinutes}</span><span class="stat-label">Minuten</span></div></div>
            <div class="stat-box glass-panel"><div class="stat-details"><span class="stat-value">${totalExercises}</span><span class="stat-label">Oefeningen</span></div></div>
        `;
        this.renderExerciseProgress();
        this.renderMuscleStats();
        this.renderHistory();
    },

    // Bouwt per oefening een reeks (datum, max gewicht) uit de logs
    getExerciseProgressSeries() {
        const series = {};
        store.logs.forEach(log => {
            if (!log.exercises || !log.date) return;
            log.exercises.forEach(ex => {
                let maxWeight = 0;
                let bestSet = null;
                (ex.details || []).forEach(d => {
                    const w = parseFloat(d.weight);
                    if (!isNaN(w) && w > maxWeight) {
                        maxWeight = w;
                        bestSet = d;
                    }
                });
                if (maxWeight <= 0) return;

                const key = String(ex.name).toLowerCase().trim();
                if (!series[key]) series[key] = { name: ex.name, points: [] };
                series[key].points.push({ date: log.date, weight: maxWeight, reps: parseInt(bestSet.reps) || 0 });
            });
        });

        // Alleen oefeningen met minstens 2 metingen, punten op datumvolgorde
        return Object.values(series)
            .map(s => ({ ...s, points: [...s.points].sort((a, b) => (a.date < b.date ? -1 : 1)) }))
            .filter(s => s.points.length >= 2);
    },

    // Epley-formule: geschat 1-rep-max op basis van gewicht en herhalingen
    estimate1RM(weight, reps) {
        if (!(weight > 0) || !(reps > 0)) return null;
        if (reps === 1) return weight;
        return weight * (1 + reps / 30);
    },

    buildSparklineSVG(points) {
        // Vaste viewBox met behoud van verhouding, zodat de gewichtslabels niet vervormen
        const w = 320, h = 96;
        const padX = 26, padTop = 20, padBottom = 14;
        const weights = points.map(p => p.weight);
        const min = Math.min(...weights);
        const max = Math.max(...weights);
        const range = (max - min) || 1;
        const step = points.length > 1 ? (w - padX * 2) / (points.length - 1) : 0;

        const coords = points.map((p, i) => {
            const x = padX + i * step;
            const y = h - padBottom - ((p.weight - min) / range) * (h - padTop - padBottom);
            return { x, y, weight: p.weight };
        });

        // Bij veel metingen alle labels tonen wordt te druk: dan alleen eerste, laatste en de piek
        const showAll = points.length <= 6;
        const maxIdx = weights.indexOf(max);
        const labelIdx = showAll
            ? points.map((_, i) => i)
            : [...new Set([0, maxIdx, points.length - 1])];

        const line = `<polyline points="${coords.map(c => `${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ')}" fill="none" stroke="var(--accent-color)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>`;

        const dots = coords.map(c =>
            `<circle cx="${c.x.toFixed(1)}" cy="${c.y.toFixed(1)}" r="3" fill="var(--accent-color)"/>`
        ).join('');

        const labels = labelIdx.map(i => {
            const c = coords[i];
            // Labels aan de randen naar binnen uitlijnen zodat ze binnen de viewBox blijven
            let anchor = 'middle';
            if (i === 0 && points.length > 1) anchor = 'start';
            else if (i === points.length - 1) anchor = 'end';
            // Piek onderin het bereik? Label dan onder de punt tekenen i.p.v. erboven
            const above = c.y > padTop + 6;
            const ly = above ? c.y - 7 : c.y + 13;
            return `<text x="${c.x.toFixed(1)}" y="${ly.toFixed(1)}" text-anchor="${anchor}" font-size="12" font-weight="600" fill="var(--text-primary)">${this.escapeHTML(String(c.weight))}</text>`;
        }).join('');

        return `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid meet" style="width:100%; height:auto; display:block; overflow:visible;">
            ${line}${dots}${labels}
        </svg>`;
    },

    renderExerciseProgress() {
        const container = document.getElementById('exercise-progress-list');
        if (!container) return;

        const series = this.getExerciseProgressSeries();
        if (series.length === 0) {
            container.innerHTML = '<p class="text-muted text-sm">Log minimaal twee sessies met gewichten om je progressie te zien.</p>';
            return;
        }

        // Meest gelogde oefeningen bovenaan, maximaal 8 grafieken
        series.sort((a, b) => b.points.length - a.points.length);

        let html = '';
        series.slice(0, 8).forEach(s => {
            const first = s.points[0].weight;
            const last = s.points[s.points.length - 1].weight;
            const diff = Math.round((last - first) * 10) / 10;
            const diffText = diff === 0 ? 'gelijk' : (diff > 0 ? `+${diff} kg` : `${diff} kg`);
            const diffColor = diff > 0 ? 'var(--status-green)' : (diff < 0 ? 'var(--status-red)' : 'var(--text-muted)');

            // Beste geschatte 1RM over alle sessies van deze oefening
            let best1RM = 0;
            s.points.forEach(p => {
                const est = this.estimate1RM(p.weight, p.reps);
                if (est && est > best1RM) best1RM = est;
            });
            const rmHtml = best1RM > 0 ? `<span>Geschat 1RM: ${Math.round(best1RM)} kg</span>` : '';

            html += `
                <div class="glass-panel" style="padding: 12px 16px;">
                    <div style="display:flex; justify-content:space-between; align-items:baseline; gap:8px;">
                        <div style="font-weight:600; font-size:0.9rem;">${this.escapeHTML(String(s.name))}</div>
                        <div class="text-sm" style="color:${diffColor}; white-space:nowrap;">${diffText}</div>
                    </div>
                    <div class="mt-2">${this.buildSparklineSVG(s.points)}</div>
                    <div class="text-sm text-muted" style="display:flex; justify-content:space-between; gap:8px; flex-wrap:wrap;">
                        <span>${s.points.length} sessies</span>
                        ${rmHtml}
                        <span>Laatst: ${last} kg</span>
                    </div>
                </div>
            `;
        });
        container.innerHTML = html;
    },

    renderMuscleStats() {
        const grid = document.getElementById('muscle-stats-grid');
        if (!grid) return;

        // Metadata for UI
        const muscleMeta = {
            'chest': { name: 'Borst', icon: 'fitness_center', color: '#fca5a5' },
            'back': { name: 'Rug', icon: 'flight_takeoff', color: '#93c5fd' },
            'legs': { name: 'Benen', icon: 'directions_run', color: '#86efac' },
            'glutes': { name: 'Billen', icon: 'sports_gymnastics', color: '#fbcfe8' },
            'shoulders': { name: 'Schouders', icon: 'accessibility_new', color: '#fde047' },
            'arms': { name: 'Armen', icon: 'sports_martial_arts', color: '#c4b5fd' },
            'core': { name: 'Core', icon: 'sports_mma', color: '#fdba74' },
            'overig': { name: 'Overig', icon: 'more_horiz', color: '#d1d5db' }
        };

        const stats = {};

        // Build a fallback map from all plans
        const fallbackMap = {};
        store.plans.forEach(plan => {
            if (plan.sessions) {
                plan.sessions.forEach(session => {
                    if (session.exercises) {
                        session.exercises.forEach(ex => {
                            if (ex.muscleGroups && ex.muscleGroups.length > 0) {
                                fallbackMap[ex.name] = ex.muscleGroups;
                            }
                        });
                    }
                });
            }
        });

        // Loop over all logs
        store.logs.forEach(log => {
            const sessionMuscles = new Set();
            
            if (log.exercises) {
                log.exercises.forEach(ex => {
                    let muscles = ex.muscleGroups;
                    if (!muscles || muscles.length === 0) {
                        muscles = fallbackMap[ex.name] || ['overig'];
                    }
                    // Normaliseren zodat 'Chest' en 'chest' (en synoniemen) samen tellen
                    muscles = [...new Set(muscles.map(m => this.normalizeMuscleGroup(m)))];

                    muscles.forEach(m => {
                        sessionMuscles.add(m);
                        if (!stats[m]) stats[m] = { sessions: 0, reps: 0, maxWeight: 0, maxReps: 0 };
                        
                        if (ex.details) {
                            ex.details.forEach(detail => {
                                const reps = parseInt(detail.reps) || 0;
                                const weight = parseFloat(detail.weight) || 0;
                                
                                stats[m].reps += reps;
                                if (reps > stats[m].maxReps) stats[m].maxReps = reps;
                                if (weight > stats[m].maxWeight) stats[m].maxWeight = weight;
                            });
                        }
                    });
                });
            }

            // Increment session count for each muscle trained in this log
            sessionMuscles.forEach(m => {
                if (!stats[m]) stats[m] = { sessions: 0, reps: 0, maxWeight: 0, maxReps: 0 };
                stats[m].sessions++;
            });
        });

        // Generate HTML
        const muscleKeys = Object.keys(stats).sort((a, b) => stats[b].sessions - stats[a].sessions);
        
        if (muscleKeys.length === 0) {
            grid.innerHTML = '<p class="text-muted text-sm">Nog geen spiergroep-data beschikbaar.</p>';
            return;
        }

        let html = '';
        muscleKeys.forEach(m => {
            const data = stats[m];
            const meta = muscleMeta[m] || { name: m, icon: 'fitness_center', color: '#a78bfa' };
            
            html += `
                <div class="glass-panel" style="display:flex; flex-direction:column; gap:12px; padding:16px;">
                    <div style="display:flex; align-items:center; gap:10px;">
                        <div class="stat-icon-wrapper" style="width:36px; height:36px; padding:6px; background:rgba(255,255,255,0.05); color:${meta.color};">
                            <span class="material-icons-round" style="font-size:18px;">${meta.icon}</span>
                        </div>
                        <div style="font-weight:600; font-size:1rem;">${this.escapeHTML(meta.name)}</div>
                    </div>
                    <div class="text-muted text-sm" style="display:flex; flex-direction:column; gap:4px;">
                        <div style="display:flex; justify-content:space-between; gap:8px;">
                            <span style="white-space:nowrap;">Sessies:</span>
                            <span style="color:var(--text-primary); font-weight:500; text-align:right;">${data.sessions}</span>
                        </div>
                        <div style="display:flex; justify-content:space-between; gap:8px;">
                            <span style="white-space:nowrap;">Reps:</span>
                            <span style="color:var(--text-primary); font-weight:500; text-align:right;">${data.reps}</span>
                        </div>
                        <div style="display:flex; justify-content:space-between; gap:8px;">
                            <span style="white-space:nowrap;">Max gewicht:</span>
                            <span style="color:var(--text-primary); font-weight:500; text-align:right;">${data.maxWeight} kg</span>
                        </div>
                        <div style="display:flex; justify-content:space-between; gap:8px;">
                            <span style="white-space:nowrap;">Max reps:</span>
                            <span style="color:var(--text-primary); font-weight:500; text-align:right;">${data.maxReps}</span>
                        </div>
                    </div>
                </div>
            `;
        });

        grid.innerHTML = html;
    },

    renderAchievements() {
        const grid = document.getElementById('achievements-grid');
        if (!grid) return;
        
        const logs = store.logs;
        const totalWorkouts = logs.length;
        
        // Define all 22 achievements
        const allAchievements = [
            { id: 'first_step', title: 'De Eerste Stap', desc: '1e training voltooid!', icon: 'directions_walk', unlocked: false },
            { id: 'taste_it', title: 'De Smaak te Pakken', desc: '3 trainingen voltooid.', icon: 'local_fire_department', unlocked: false },
            { id: 'unstoppable', title: 'Niet Te Stoppen', desc: '10 trainingen voltooid.', icon: 'trending_up', unlocked: false },
            { id: 'century', title: '100 Club', desc: '100 trainingen in het logboek!', icon: 'military_tech', unlocked: false },
            { id: 'rhythm', title: 'Vast in het Ritme', desc: '4 weken op rij getraind.', icon: 'event_available', unlocked: false },
            { id: 'exorcist', title: 'Bankhanger Exorcist', desc: 'Getraind na >5 dagen rust.', icon: 'weekend', unlocked: false },
            { id: 'golden_path', title: 'De Gouden Middenweg', desc: 'Perfecte rust genomen.', icon: 'balance', unlocked: false },
            { id: 'chest', title: 'Borst Vooruit', desc: 'Focus op borstspieren.', icon: 'fitness_center', unlocked: false },
            { id: 'back', title: 'Vleugels Kweken', desc: 'Focus op rugspieren.', icon: 'flight_takeoff', unlocked: false },
            { id: 'shoulders', title: 'Bolder Schouders', desc: 'Focus op schouders.', icon: 'accessibility_new', unlocked: false },
            { id: 'legs', title: 'T-Rex Mode Geactiveerd', desc: 'Never skip leg day.', icon: 'cruelty_free', unlocked: false },
            { id: 'glutes', title: 'Perzik Power', desc: 'Bouwen aan bilspieren.', icon: 'sports_gymnastics', unlocked: false },
            { id: 'core', title: 'Wasbordje in de Maak', desc: 'Focus op core.', icon: 'grid_on', unlocked: false },
            { id: 'arms', title: 'Mouwenscheurder', desc: 'Focus op armen.', icon: 'sports_martial_arts', unlocked: false },
            { id: 'calisthenics', title: 'Zwaartekracht Ontkenner', desc: '>80% bodyweight sessie.', icon: 'sports_gymnastics', unlocked: false },
            { id: 'iron', title: 'Zwaar Metaal', desc: 'Puur krachtwerk sessie.', icon: 'fitness_center', unlocked: false },
            { id: 'oops', title: 'Oeps, ik deed het weer', desc: 'Twee workouts op 1 dag.', icon: 'looks_two', unlocked: false },
            { id: 'night', title: 'De Nachtbraker', desc: 'Trainen tussen 00:00 - 04:00.', icon: 'bedtime', unlocked: false },
            { id: 'bird', title: 'Vroege Vogel', desc: 'Trainen voor 06:00.', icon: 'wb_twilight', unlocked: false },
            { id: 'weekend', title: 'Weekend Warrior', desc: 'Zware workout in het weekend.', icon: 'celebration', unlocked: false },
            { id: 'flash', title: 'Flash', desc: 'Workout < 15 minuten.', icon: 'bolt', unlocked: false },
            { id: 'marathon', title: 'Marathon Strijder', desc: 'Workout > 90 minuten.', icon: 'timer', unlocked: false }
        ];

        // Evaluate logic
        if (totalWorkouts >= 1) allAchievements.find(a => a.id === 'first_step').unlocked = true;
        if (totalWorkouts >= 3) allAchievements.find(a => a.id === 'taste_it').unlocked = true;
        if (totalWorkouts >= 10) allAchievements.find(a => a.id === 'unstoppable').unlocked = true;
        if (totalWorkouts >= 100) allAchievements.find(a => a.id === 'century').unlocked = true;
        
        let lastDate = null;
        let datesMap = {};
        let weeksMap = {};

        logs.forEach(log => {
            const d = new Date(log.date);
            const dateString = d.toDateString();
            const hour = d.getHours();
            const dayOfWeek = d.getDay();
            
            datesMap[dateString] = (datesMap[dateString] || 0) + 1;
            if (datesMap[dateString] >= 2) allAchievements.find(a => a.id === 'oops').unlocked = true;

            if (hour >= 0 && hour < 4) allAchievements.find(a => a.id === 'night').unlocked = true;
            if (hour >= 4 && hour < 6) allAchievements.find(a => a.id === 'bird').unlocked = true;
            if (dayOfWeek === 0 || dayOfWeek === 6) allAchievements.find(a => a.id === 'weekend').unlocked = true;
            if (log.duration < 15) allAchievements.find(a => a.id === 'flash').unlocked = true;
            if (log.duration > 90) allAchievements.find(a => a.id === 'marathon').unlocked = true;

            if (lastDate) {
                const diffDays = (d - lastDate) / (1000 * 60 * 60 * 24);
                if (diffDays > 5) allAchievements.find(a => a.id === 'exorcist').unlocked = true;
                if (diffDays > 1.5 && diffDays <= 2.5) allAchievements.find(a => a.id === 'golden_path').unlocked = true;
            }

            // Weekstart (maandag) als sleutel, zodat de jaargrens geen rol speelt
            weeksMap[this.getWeekStart(d)] = true;

            lastDate = d;

            if (log.exercises && log.exercises.length > 0) {
                // Tel per spiergroep via de schema-metadata; alleen bij oude logs zonder
                // muscleGroups vallen we terug op naam-herkenning
                const groupCounts = {};
                let bwCount = 0, weightCount = 0;

                log.exercises.forEach(ex => {
                    const groups = (ex.muscleGroups && ex.muscleGroups.length > 0)
                        ? [...new Set(ex.muscleGroups.map(mg => this.normalizeMuscleGroup(mg)))]
                        : this.guessMuscleGroupsFromName(ex.name);
                    groups.forEach(g => groupCounts[g] = (groupCounts[g] || 0) + 1);

                    // Gewicht gelogd? Dan telt de oefening als krachtwerk, anders als bodyweight
                    const hasWeight = ex.details && ex.details.some(d => parseFloat(d.weight) > 0);
                    if (hasWeight) weightCount++;
                    else bwCount++;
                });

                if ((groupCounts['chest'] || 0) >= 3) allAchievements.find(a => a.id === 'chest').unlocked = true;
                if ((groupCounts['back'] || 0) >= 3) allAchievements.find(a => a.id === 'back').unlocked = true;
                if ((groupCounts['shoulders'] || 0) >= 3) allAchievements.find(a => a.id === 'shoulders').unlocked = true;
                if ((groupCounts['legs'] || 0) >= 3) allAchievements.find(a => a.id === 'legs').unlocked = true;
                if ((groupCounts['glutes'] || 0) >= 2) allAchievements.find(a => a.id === 'glutes').unlocked = true;
                if ((groupCounts['core'] || 0) >= 3) allAchievements.find(a => a.id === 'core').unlocked = true;
                if ((groupCounts['arms'] || 0) >= 3) allAchievements.find(a => a.id === 'arms').unlocked = true;

                if (bwCount > weightCount && bwCount >= 3) allAchievements.find(a => a.id === 'calisthenics').unlocked = true;
                if (weightCount > bwCount && weightCount >= 3) allAchievements.find(a => a.id === 'iron').unlocked = true;
            }
        });

        // 4 weken op rij getraind: opeenvolgende weekstarts liggen exact 1 week uit elkaar
        const weekStarts = Object.keys(weeksMap).map(Number).sort((a, b) => a - b);
        let consecutiveWeeks = 1;
        for(let i=1; i<weekStarts.length; i++) {
            const expectedNext = new Date(weekStarts[i-1]);
            expectedNext.setDate(expectedNext.getDate() + 7);
            if (expectedNext.getTime() === weekStarts[i]) consecutiveWeeks++;
            else consecutiveWeeks = 1;
            if (consecutiveWeeks >= 4) allAchievements.find(a => a.id === 'rhythm').unlocked = true;
        }

        // Render grid: behaalde badges eerst, daarna de nog te verdienen (vergrijsd)
        grid.innerHTML = '';
        grid.style.display = 'grid';

        const sortedAchievements = [...allAchievements].sort((a, b) => (b.unlocked ? 1 : 0) - (a.unlocked ? 1 : 0));

        sortedAchievements.forEach(ach => {
            const el = document.createElement('div');
            el.className = `glass-panel achievement ${ach.unlocked ? 'unlocked' : 'locked'}`;
            el.dataset.achievementId = ach.id;
            el.style.textAlign = 'center';
            el.style.padding = '16px';
            el.style.display = 'flex';
            el.style.flexDirection = 'column';
            el.style.alignItems = 'center';
            el.style.justifyContent = 'center';
            el.style.gap = '8px';

            el.innerHTML = `
                <div class="stat-icon-wrapper text-accent" style="width:48px; height:48px; margin: 0 auto; background:rgba(59, 130, 246, 0.2);">
                    <span class="material-icons-round">${ach.unlocked ? this.escapeHTML(ach.icon) : 'lock'}</span>
                </div>
                <div style="font-weight:600; font-size:0.85rem; line-height:1.2; margin-top:4px;">${this.escapeHTML(ach.title)}</div>
                <div class="text-sm text-muted" style="font-size:0.7rem; line-height:1.3;">${this.escapeHTML(ach.desc)}</div>
            `;
            grid.appendChild(el);
        });
    },

    renderHistory() {
        const hList = document.getElementById('history-list');
        if (!hList) return;
        hList.innerHTML = '';

        if (store.logs.length === 0) {
            hList.innerHTML = '<p class="text-muted">Nog geen sessies afgerond.</p>';
            return;
        }

        const groupedLogs = {};
        store.logs.forEach(log => {
            const pName = log.planName || 'Overige Sessies';
            if (!groupedLogs[pName]) groupedLogs[pName] = [];
            groupedLogs[pName].push(log);
        });

        for (const [planName, logs] of Object.entries(groupedLogs)) {
            const sortedLogs = [...logs].sort((a, b) => (a.date < b.date ? 1 : (a.date > b.date ? -1 : 0)));

            const planSection = document.createElement('div');
            planSection.className = 'mt-4';

            const titleEl = document.createElement('h4');
            titleEl.style.color = 'var(--text-primary)';
            titleEl.style.marginBottom = '8px';
            titleEl.style.marginTop = '16px';
            titleEl.textContent = planName;
            planSection.appendChild(titleEl);
            
            const listWrapper = document.createElement('div');
            listWrapper.className = 'flex-col gap-3';

            sortedLogs.forEach(log => {
                const dateStr = new Date(log.date).toLocaleDateString('nl-NL', { weekday: 'short', day: 'numeric', month: 'short' });
                
                let summaryHtml = '';
                if (log.exercises && log.exercises.length > 0) {
                    log.exercises.forEach(ex => {
                        let exDetails = [];
                        if (ex.details) {
                            ex.details.forEach(d => {
                                let text = `Set ${d.setNumber}:`;
                                if (d.weight) text += ` ${d.weight}kg`;
                                if (d.reps) text += ` x ${d.reps}`;
                                exDetails.push(app.escapeHTML(text));
                            });
                        }
                        
                        summaryHtml += `
                            <div class="mt-2 pt-2" style="border-top: 1px solid rgba(0,0,0,0.05);">
                                <div style="font-weight:600; font-size:0.9rem;">${app.escapeHTML(ex.name)} (${ex.setsCompleted}/${ex.totalSets} sets)</div>
                                <div class="text-sm text-muted" style="margin-top:2px;">
                                    ${exDetails.length > 0 ? exDetails.join(', ') : 'Afgevinkt (geen details)'}
                                </div>
                            </div>
                        `;
                    });
                } else {
                    summaryHtml = '<div class="text-sm text-muted mt-2">Geen details beschikbaar (oude sessie).</div>';
                }

                const safeLogId = app.escapeHTML(log.id);
                if (log.exercises && log.exercises.length > 0) {
                    summaryHtml += `
                        <div style="display:flex; justify-content:flex-end; gap:16px; margin-top:12px; padding-top:12px; border-top: 1px solid rgba(0,0,0,0.05);">
                            <span class="material-icons-round" style="font-size:1.4rem; cursor:pointer; color:var(--text-muted);" onclick="app.showEditLogModal('${safeLogId}')">edit_note</span>
                            <span class="material-icons-round" style="font-size:1.4rem; cursor:pointer; color:#ff5252;" onclick="app.showDeleteModal('log', '${safeLogId}')">delete_outline</span>
                        </div>
                    `;
                } else {
                    summaryHtml += `
                        <div style="display:flex; justify-content:flex-end; gap:16px; margin-top:12px; padding-top:12px; border-top: 1px solid rgba(0,0,0,0.05);">
                            <span class="material-icons-round" style="font-size:1.4rem; cursor:pointer; color:#ff5252;" onclick="app.showDeleteModal('log', '${safeLogId}')">delete_outline</span>
                        </div>
                    `;
                }

                const el = document.createElement('div');
                el.className = 'glass-panel';
                el.innerHTML = `
                    <div style="display:flex; justify-content:space-between; align-items:center; cursor:pointer;" onclick="this.nextElementSibling.classList.toggle('hidden')">
                        <div>
                            <div style="font-weight:600;">${app.escapeHTML(log.sessionName || 'Sessie')}</div>
                            <div class="text-sm text-muted">${dateStr} • ${log.duration} min • ${log.exercisesCompleted} oefeningen</div>
                        </div>
                        <span class="material-icons-round text-muted" style="font-size:1.2rem;">expand_more</span>
                    </div>
                    <div class="hidden history-details">
                        ${summaryHtml}
                    </div>
                `;
                listWrapper.appendChild(el);
            });
            
            planSection.appendChild(listWrapper);
            hList.appendChild(planSection);
        }
    },

    setActivePlan(id) {
        store.activePlanId = id;
        store.save();
        this.renderPlans();
    },

    showDeleteModal(type, id) {
        this.itemToDelete = { type, id };
        document.getElementById(`modal-delete-${type}`).classList.remove('hidden');
    },

    hideDeleteModal(type) {
        this.itemToDelete = null;
        document.getElementById(`modal-delete-${type}`).classList.add('hidden');
    },

    confirmDelete(type) {
        if (!this.itemToDelete || this.itemToDelete.type !== type) return;

        if (type === 'plan') {
            store.plans = store.plans.filter(p => p.id !== this.itemToDelete.id);
            if (store.activePlanId === this.itemToDelete.id) {
                store.activePlanId = null;
            }
            store.save();
            this.hideDeleteModal('plan');
            this.renderPlans();
            this.renderHome();
        } else if (type === 'log') {
            store.logs = store.logs.filter(l => l.id !== this.itemToDelete.id);
            store.save();
            this.hideDeleteModal('log');
            this.renderProgress();
            this.renderHome();
        }
    },

    // Geeft de timestamp van maandag 00:00 van de week waarin `date` valt
    getWeekStart(date) {
        const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const day = (d.getDay() + 6) % 7; // maandag = 0, zondag = 6
        d.setDate(d.getDate() - day);
        return d.getTime();
    },

    calculateStreak() {
        if(store.logs.length === 0) return 0;

        const trainedWeeks = new Set();
        store.logs.forEach(log => {
            if (log.date) trainedWeeks.add(this.getWeekStart(new Date(log.date)));
        });
        if (trainedWeeks.size === 0) return 0;

        // Start in de huidige week; nog niet getraind deze week? Dan telt een
        // streak t/m vorige week nog gewoon door.
        const cursor = new Date(this.getWeekStart(new Date()));
        if (!trainedWeeks.has(cursor.getTime())) {
            cursor.setDate(cursor.getDate() - 7);
        }

        let streak = 0;
        while (trainedWeeks.has(cursor.getTime())) {
            streak++;
            cursor.setDate(cursor.getDate() - 7);
        }
        return streak;
    },

    // --- WORKOUT FLOW ---

    startWorkout(session) {
        // Snapshot plan-info zodat wisselen van actief plan tijdens de workout
        // niet leidt tot een log die aan het verkeerde plan wordt gekoppeld
        const activePlan = store.getActivePlan();
        this.activeWorkout = {
            planId: activePlan ? activePlan.id : null,
            planName: activePlan ? activePlan.name : 'Overige Sessies',
            session: session,
            startTime: new Date(),
            exercises: session.exercises.map(e => ({
                ...e,
                setsCompleted: Array(e.sets).fill(false),
                weights: Array(e.sets).fill(''),
                actualReps: Array(e.sets).fill('')
            }))
        };
        store.saveActiveWorkoutState(this.activeWorkout);
        this.openWorkoutView();
    },

    // Opent de workout-view voor de actieve workout (zowel starten als hervatten)
    openWorkoutView() {
        document.getElementById('workout-title').textContent = this.activeWorkout.session.name;
        this.renderWorkoutExercises();

        document.getElementById('btn-finish-workout').onclick = () => this.showFinishModal();

        document.getElementById('bottom-nav').classList.add('hidden');
        document.getElementById('view-workout').querySelector('.sticky-footer').style.bottom = '0';

        this.requestWakeLock();
        this.navigate('workout');
    },

    getPreviousExerciseDetails(exerciseName) {
        if (!exerciseName) return null;
        const targetName = exerciseName.toLowerCase().trim();
        for (let i = store.logs.length - 1; i >= 0; i--) {
            const log = store.logs[i];
            if (!log.exercises) continue;
            
            const ex = log.exercises.find(e => e.name && e.name.toLowerCase().trim() === targetName);
            if (ex && ex.details && ex.details.length > 0) {
                return ex.details;
            }
        }
        return null;
    },

    // Advies voor progressive overload: vorige sessie alle sets (met gewicht) aan de
    // bovenkant van de herhalingsrange gehaald? Stel dan een licht hoger gewicht voor.
    getOverloadSuggestion(ex, prevDetails, plan) {
        if (!prevDetails || prevDetails.length === 0 || !ex.repsMax) return null;

        let maxWeight = 0;
        for (const d of prevDetails) {
            const reps = parseInt(d.reps);
            const weight = parseFloat(d.weight);
            if (!(weight > 0) || !(reps >= ex.repsMax)) return null;
            if (weight > maxWeight) maxWeight = weight;
        }

        // Increment uit de progressieregels van het plan (onder-/bovenlichaam), anders 2.5 kg
        let increment = 2.5;
        const guidance = plan && plan.progressionRules && plan.progressionRules.weightIncreaseGuidance;
        if (guidance) {
            const groups = (ex.muscleGroups || []).map(mg => this.normalizeMuscleGroup(mg));
            const lowerBody = groups.includes('legs') || groups.includes('glutes');
            const g = lowerBody ? guidance.lowerBodyKg : guidance.upperBodyKg;
            if (g > 0) increment = g;
        }

        return { prevWeight: maxWeight, newWeight: Math.round((maxWeight + increment) * 10) / 10 };
    },

    renderWorkoutExercises() {
        const list = document.getElementById('workout-exercise-list');
        list.innerHTML = '';
        
        if (this.activeWorkout.session.warmup) {
            const warmupEl = document.createElement('div');
            warmupEl.className = 'glass-panel';
            warmupEl.style.padding = '12px 16px';
            warmupEl.innerHTML = this.formatRichField(this.activeWorkout.session.warmup, 'WARM-UP');
            list.appendChild(warmupEl);
        }

        const sortedExercises = [...this.activeWorkout.exercises].sort((a, b) => (a.order || 99) - (b.order || 99));

        sortedExercises.forEach((ex) => {
            const exIndex = this.activeWorkout.exercises.findIndex(e => e.id === ex.id);
            const prevDetails = this.getPreviousExerciseDetails(ex.name) || [];

            // Build rep/duration string
            let metaString = `${ex.sets} sets`;
            if (ex.repsMin && ex.repsMax) metaString += ` • ${ex.repsMin}-${ex.repsMax} reps`;
            else if (ex.reps) metaString += ` • ${ex.reps}`;
            else if (ex.durationSecondsMin && ex.durationSecondsMax) metaString += ` • ${ex.durationSecondsMin}-${ex.durationSecondsMax} sec`;
            else if (ex.durationSeconds) metaString += ` • ${ex.durationSeconds} sec`;
            else if (ex.duration) metaString += ` • ${ex.duration}`;
            
            if (ex.restSeconds) metaString += ` • ${ex.restSeconds}s rust`;

            // Build badges
            let badgesHtml = '';
            if (ex.category) badgesHtml += `<span class="status-badge" style="padding:2px 6px; font-size:0.7rem; background:rgba(255,255,255,0.1); color:var(--text-muted); margin-right:4px;">${app.escapeHTML(String(ex.category))}</span>`;
            if (ex.exerciseType) badgesHtml += `<span class="status-badge" style="padding:2px 6px; font-size:0.7rem; background:rgba(255,255,255,0.1); color:var(--text-muted);">${app.escapeHTML(String(ex.exerciseType))}</span>`;

            // Build notes & alternatives
            let notesHtml = '';
            if (ex.notes && Array.isArray(ex.notes) && ex.notes.length > 0) {
                notesHtml += `<ul class="text-sm text-muted mt-2" style="list-style-type: disc; padding-left: 20px;">`;
                ex.notes.forEach(n => notesHtml += `<li>${app.escapeHTML(String(n))}</li>`);
                notesHtml += `</ul>`;
            } else if (ex.notes && typeof ex.notes === 'string') {
                notesHtml += `<div class="text-sm text-muted mt-2">${app.escapeHTML(ex.notes)}</div>`;
            }

            if (ex.alternatives && ex.alternatives.length > 0) {
                notesHtml += `<div class="text-sm text-muted mt-2"><strong>Alternatieven:</strong> ${app.escapeHTML(ex.alternatives.join(', '))}</div>`;
            } else if (ex.optionalAlternatives && ex.optionalAlternatives.length > 0) {
                notesHtml += `<div class="text-sm text-muted mt-2"><strong>Alternatieven:</strong> ${app.escapeHTML(ex.optionalAlternatives.join(', '))}</div>`;
            }

            // Progressive-overload-advies op basis van de vorige sessie
            const overload = app.getOverloadSuggestion(ex, prevDetails, store.getActivePlan());
            if (overload) {
                notesHtml += `<div class="text-sm mt-2 progression-hint"><span class="material-icons-round" style="font-size:1rem; vertical-align:-3px;">trending_up</span> Vorige keer alle sets op ${app.escapeHTML(String(ex.repsMax))} reps met ${app.escapeHTML(String(overload.prevWeight))} kg. Probeer nu ${app.escapeHTML(String(overload.newWeight))} kg.</div>`;
            }

            let setsHtml = '';
            for(let i=0; i<ex.sets; i++) {
                const checked = ex.setsCompleted[i] ? 'checked' : '';
                
                const prevSet = prevDetails[i] || {};
                const weightPlaceholder = prevSet.weight || 'kg';
                const repsPlaceholder = prevSet.reps || 'reps';

                // TrackMetrics check for dynamic inputs
                const wantsWeight = ex.trackMetrics ? ex.trackMetrics.includes('weight') : true;
                const wantsReps = ex.trackMetrics ? ex.trackMetrics.includes('reps') : false;
                const wantsDuration = ex.trackMetrics ? ex.trackMetrics.includes('duration_seconds') : false;
                
                let inputsHtml = '';
                if (wantsWeight) {
                    inputsHtml += `<input type="number" class="weight-input" placeholder="${app.escapeHTML(String(weightPlaceholder))}"
                        value="${app.escapeHTML(String(ex.weights ? ex.weights[i] : ''))}" onchange="app.updateWeight(${exIndex}, ${i}, this.value)">`;
                }
                if (wantsReps) {
                    inputsHtml += `<input type="number" class="weight-input" placeholder="${app.escapeHTML(String(repsPlaceholder))}" style="width: 55px;"
                        value="${app.escapeHTML(String(ex.actualReps ? ex.actualReps[i] : ''))}" onchange="app.updateReps(${exIndex}, ${i}, this.value)">`;
                }
                if (wantsDuration && !wantsReps) {
                     inputsHtml += `<input type="number" class="weight-input" placeholder="sec" style="width: 55px;"
                        value="${app.escapeHTML(String(ex.actualReps ? ex.actualReps[i] : ''))}" onchange="app.updateReps(${exIndex}, ${i}, this.value)">`;
                }

                setsHtml += `
                    <div class="set-row">
                        <div class="set-info text-muted">Set ${i+1}</div>
                        <div class="set-actions">
                            ${inputsHtml}
                            <button class="check-btn ${checked}" onclick="app.toggleSet(${exIndex}, ${i})">
                                <span class="material-icons-round">check</span>
                            </button>
                        </div>
                    </div>
                `;
            }
            
            const card = document.createElement('div');
            card.className = 'glass-panel exercise-card';
            card.innerHTML = `
                <div class="exercise-header">
                    <div>
                        <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
                            <div class="exercise-title" style="margin:0;">${app.escapeHTML(ex.name)}</div>
                        </div>
                        <div style="margin-bottom:4px;">${badgesHtml}</div>
                        <div class="exercise-meta">${app.escapeHTML(metaString)}</div>
                        ${notesHtml}
                    </div>
                </div>
                <div class="exercise-body">
                    ${setsHtml}
                </div>
            `;
            list.appendChild(card);
        });
    },

    toggleSet(exIndex, setIndex) {
        const ex = this.activeWorkout.exercises[exIndex];
        ex.setsCompleted[setIndex] = !ex.setsCompleted[setIndex];
        store.saveActiveWorkoutState(this.activeWorkout);

        // Set afgevinkt en de oefening heeft een rusttijd? Start de rusttimer.
        if (ex.setsCompleted[setIndex] && ex.restSeconds) {
            this.startRestTimer(ex.restSeconds);
        }

        this.renderWorkoutExercises();
    },

    // --- WAKE LOCK ---

    wakeLock: null,

    // Houdt het scherm aan tijdens een workout (waar ondersteund)
    async requestWakeLock() {
        try {
            if (typeof navigator !== 'undefined' && navigator.wakeLock) {
                this.wakeLock = await navigator.wakeLock.request('screen');
            }
        } catch (e) {
            // Geen ramp: het scherm valt dan gewoon in slaap volgens de systeeminstelling
        }
    },

    releaseWakeLock() {
        if (this.wakeLock) {
            this.wakeLock.release();
            this.wakeLock = null;
        }
    },

    // --- RUSTTIMER ---

    restTimer: null,

    startRestTimer(seconds) {
        this.stopRestTimer();
        const el = document.getElementById('rest-timer');
        const label = document.getElementById('rest-timer-label');
        if (!el || !label) return;

        let remaining = Math.round(seconds);
        const update = () => {
            label.textContent = `Rust: ${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, '0')}`;
        };
        update();
        el.classList.remove('hidden');

        this.restTimer = setInterval(() => {
            remaining--;
            if (remaining <= 0) {
                this.stopRestTimer();
                if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([200, 100, 200]);
                this.showToast('Rust voorbij, tijd voor je volgende set!', 'success');
            } else {
                update();
            }
        }, 1000);
    },

    stopRestTimer() {
        if (this.restTimer) {
            clearInterval(this.restTimer);
            this.restTimer = null;
        }
        const el = document.getElementById('rest-timer');
        if (el) el.classList.add('hidden');
    },

    updateWeight(exIndex, setIndex, val) {
        this.activeWorkout.exercises[exIndex].weights[setIndex] = val;
        store.saveActiveWorkoutState(this.activeWorkout);
    },

    updateReps(exIndex, setIndex, val) {
        this.activeWorkout.exercises[exIndex].actualReps[setIndex] = val;
        store.saveActiveWorkoutState(this.activeWorkout);
    },

    showFinishModal() {
        document.getElementById('modal-finish-workout').classList.remove('hidden');
    },

    hideFinishModal() {
        document.getElementById('modal-finish-workout').classList.add('hidden');
    },

    finishWorkout() {
        this.hideFinishModal();
        this.stopRestTimer();
        this.releaseWakeLock();

        // Een sessie die per ongeluk uren of dagen open bleef staan levert een
        // onrealistische duur op; begrens die zodat statistieken kloppen. De gebruiker
        // kan de duur naderhand alsnog aanpassen in het logboek.
        const MAX_SESSION_MINUTES = 240;
        let duration = Math.round((new Date() - this.activeWorkout.startTime) / 60000);
        if (!(duration >= 0)) duration = 0;
        if (duration > MAX_SESSION_MINUTES) {
            duration = MAX_SESSION_MINUTES;
            this.showToast('Sessieduur leek onrealistisch lang en is begrensd. Pas hem eventueel aan in het logboek.', 'error');
        }

        let totalExercisesCompleted = 0;
        
        const exerciseLogs = [];

        this.activeWorkout.exercises.forEach(ex => {
            const completedSetsCount = ex.setsCompleted.filter(Boolean).length;
            if(completedSetsCount > 0) {
                totalExercisesCompleted++;
                
                const setDetails = [];
                for(let i=0; i<ex.sets; i++) {
                    if (ex.setsCompleted[i]) {
                        setDetails.push({
                            setNumber: i + 1,
                            weight: ex.weights[i] || '',
                            reps: ex.actualReps[i] || ''
                        });
                    }
                }
                
                exerciseLogs.push({
                    name: ex.name,
                    muscleGroups: ex.muscleGroups || [],
                    setsCompleted: completedSetsCount,
                    totalSets: ex.sets,
                    details: setDetails
                });
            }
        });

        // Gebruik het plan dat bij de start is opgeslagen (niet het huidige actieve plan)
        // Fallback naar store.getActivePlan() voor oude workout-states zonder planId
        const snapshotPlanId = this.activeWorkout.planId;
        const snapshotPlanName = this.activeWorkout.planName;
        const fallbackPlan = (snapshotPlanId === undefined) ? store.getActivePlan() : null;

        store.saveWorkoutLog({
            planId: snapshotPlanId !== undefined ? snapshotPlanId : (fallbackPlan ? fallbackPlan.id : null),
            planName: snapshotPlanName !== undefined ? snapshotPlanName : (fallbackPlan ? fallbackPlan.name : 'Overige Sessies'),
            sessionId: this.activeWorkout.session.id,
            sessionName: this.activeWorkout.session.name,
            duration: duration,
            exercisesCompleted: totalExercisesCompleted,
            exercises: exerciseLogs
        });

        this.activeWorkout = null;
        store.saveActiveWorkoutState(null);
        
        document.getElementById('bottom-nav').classList.remove('hidden');
        this.navigate('home');
    },


    showEditLogModal(logId) {
        const originalLog = store.logs.find(l => l.id === logId);
        if (!originalLog) return;
        
        this.logToEdit = JSON.parse(JSON.stringify(originalLog));
        
        const plan = store.plans.find(p => p.id === this.logToEdit.planId);
        const session = plan ? plan.sessions.find(s => s.id === this.logToEdit.sessionId) : null;
        
        if (session) {
            const fullExercises = session.exercises.map(sessionEx => {
                const loggedEx = this.logToEdit.exercises.find(e => e.name === sessionEx.name);
                const details = [];
                for (let i = 1; i <= sessionEx.sets; i++) {
                    const loggedSet = loggedEx && loggedEx.details ? loggedEx.details.find(d => d.setNumber === i) : null;
                    details.push({
                        setNumber: i,
                        weight: loggedSet ? loggedSet.weight : '',
                        reps: loggedSet ? loggedSet.reps : ''
                    });
                }
                return {
                    name: sessionEx.name,
                    totalSets: sessionEx.sets,
                    setsCompleted: loggedEx ? loggedEx.setsCompleted : 0,
                    details: details
                };
            });
            this.logToEdit.exercises = fullExercises;
        } else {
            this.logToEdit.exercises.forEach(ex => {
                if (ex.totalSets > ex.details.length) {
                    for (let i = 1; i <= ex.totalSets; i++) {
                        if (!ex.details.find(d => d.setNumber === i)) {
                            ex.details.push({ setNumber: i, weight: '', reps: '' });
                        }
                    }
                    ex.details.sort((a,b) => a.setNumber - b.setNumber);
                }
            });
        }

        this.renderEditLogModal();
        document.getElementById('modal-edit-log').classList.remove('hidden');
    },

    hideEditLogModal() {
        this.logToEdit = null;
        document.getElementById('modal-edit-log').classList.add('hidden');
    },

    updateEditLogDuration(val) {
        const parsed = parseInt(val, 10);
        // Alleen een geldige, niet-negatieve waarde overnemen; anders de vorige behouden
        if (!isNaN(parsed) && parsed >= 0) {
            this.logToEdit.duration = parsed;
        }
    },

    updateEditLogWeight(exIndex, setIndex, val) {
        const detail = this.logToEdit.exercises[exIndex].details.find(d => d.setNumber === setIndex + 1);
        if (detail) detail.weight = val;
    },

    updateEditLogReps(exIndex, setIndex, val) {
        const detail = this.logToEdit.exercises[exIndex].details.find(d => d.setNumber === setIndex + 1);
        if (detail) detail.reps = val;
    },

    renderEditLogModal() {
        const container = document.getElementById('edit-log-container');
        container.innerHTML = '';

        // Duur-veld: altijd bewerkbaar, ook bij oude sessies zonder oefening-details
        const durationCard = document.createElement('div');
        durationCard.className = 'glass-panel';
        durationCard.style.padding = '12px';
        durationCard.innerHTML = `
            <div class="set-row" style="justify-content: space-between; align-items:center;">
                <div style="font-weight:600;">Duur (minuten)</div>
                <input type="number" min="0" class="input-field" style="width:90px; text-align:center;"
                    value="${app.escapeHTML(String(this.logToEdit.duration != null ? this.logToEdit.duration : ''))}"
                    onchange="app.updateEditLogDuration(this.value)">
            </div>
        `;
        container.appendChild(durationCard);

        if (!this.logToEdit.exercises || this.logToEdit.exercises.length === 0) {
            const note = document.createElement('p');
            note.className = 'text-muted';
            note.textContent = 'Geen oefening-details beschikbaar voor deze oude sessie.';
            container.appendChild(note);
            return;
        }

        this.logToEdit.exercises.forEach((ex, exIndex) => {
            let setsHtml = '';
            
            if (ex.details && ex.details.length > 0) {
                ex.details.forEach(d => {
                    const setIndex = d.setNumber - 1;
                    setsHtml += `
                        <div class="set-row" style="margin-top: 8px; justify-content: space-between;">
                            <div class="set-info text-muted">Set ${d.setNumber}</div>
                            <div style="display:flex; gap:8px;">
                                <input type="number" class="input-field" placeholder="kg" style="width:70px; text-align:center;"
                                    value="${app.escapeHTML(String(d.weight || ''))}" onchange="app.updateEditLogWeight(${exIndex}, ${setIndex}, this.value)">
                                <input type="number" class="input-field" placeholder="reps" style="width:70px; text-align:center;"
                                    value="${app.escapeHTML(String(d.reps || ''))}" onchange="app.updateEditLogReps(${exIndex}, ${setIndex}, this.value)">
                            </div>
                        </div>
                    `;
                });
            } else {
                setsHtml = '<div class="text-sm text-muted">Geen details opgeslagen voor deze oefening.</div>';
            }

            const card = document.createElement('div');
            card.className = 'glass-panel';
            card.style.padding = '12px';
            card.innerHTML = `
                <div style="font-weight: 600; margin-bottom: 8px;">${app.escapeHTML(ex.name)}</div>
                <div>${setsHtml}</div>
            `;
            container.appendChild(card);
        });
    },

    saveEditLog() {
        if (!this.logToEdit) return;
        
        let totalExercisesCompleted = 0;
        this.logToEdit.exercises.forEach(ex => {
            const completedDetails = ex.details.filter(d => (d.weight && d.weight.toString().trim() !== '') || (d.reps && d.reps.toString().trim() !== ''));
            ex.setsCompleted = completedDetails.length;
            ex.details = completedDetails;
            if (ex.setsCompleted > 0) totalExercisesCompleted++;
        });
        
        this.logToEdit.exercises = this.logToEdit.exercises.filter(ex => ex.setsCompleted > 0);
        this.logToEdit.exercisesCompleted = totalExercisesCompleted;

        const index = store.logs.findIndex(l => l.id === this.logToEdit.id);
        if (index > -1) {
            store.logs[index] = this.logToEdit;
            store.save();
        }
        this.hideEditLogModal();
        this.renderProgress();
    },

    // --- IMPORT / EXPORT ---

    showImportModal() {
        document.getElementById('import-json-text').value = '';
        document.getElementById('import-file').value = '';
        const urlInput = document.getElementById('import-url');
        if (urlInput) urlInput.value = '';
        document.getElementById('import-error').classList.add('hidden');
        document.getElementById('import-preview').classList.add('hidden');
        document.getElementById('btn-confirm-import').textContent = 'Preview';
        document.getElementById('btn-confirm-import').onclick = () => this.previewImport();
        
        document.getElementById('modal-overlay').classList.remove('hidden');
    },

    hideModal() {
        document.getElementById('modal-overlay').classList.add('hidden');
    },

    async fetchFromUrl() {
        const urlInput = document.getElementById('import-url');
        if (!urlInput || !urlInput.value.trim()) return;
        
        const rawUrl = urlInput.value.trim();
        const errEl = document.getElementById('import-error');
        errEl.classList.add('hidden');
        
        let fetchUrl = rawUrl;
        const driveMatch = rawUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || rawUrl.match(/id=([a-zA-Z0-9_-]+)/);
        if (rawUrl.includes('drive.google.com') && driveMatch) {
            fetchUrl = `https://drive.google.com/uc?export=download&id=${driveMatch[1]}`;
        }
        
        try {
            urlInput.disabled = true;
            const res = await fetch(fetchUrl);
            if (!res.ok) throw new Error(`Netwerk fout (${res.status}). Controleer of de link publiek toegankelijk is.`);
            
            const text = await res.text();
            document.getElementById('import-json-text').value = text;
            this.previewImport();
        } catch (e) {
            errEl.textContent = "Fout bij ophalen link: " + e.message + " (Soms blokkeert je browser de verbinding vanwege beveiliging).";
            errEl.classList.remove('hidden');
        } finally {
            urlInput.disabled = false;
        }
    },

    handleFileSelect(e) {
        const file = e.target.files[0];
        if(!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
            document.getElementById('import-json-text').value = evt.target.result;
            this.previewImport();
        };
        reader.readAsText(file);
    },

    previewImport() {
        const text = document.getElementById('import-json-text').value;
        const errEl = document.getElementById('import-error');
        errEl.classList.add('hidden');
        
        try {
            const data = JSON.parse(text);
            if(!data.name || !data.sessions || !Array.isArray(data.sessions)) {
                throw new Error("Ongeldig formaat. Mist 'name' of 'sessions'.");
            }
            
            const prevEl = document.getElementById('import-preview');
            const totalEx = data.sessions.reduce((sum, s) => sum + (s.exercises ? s.exercises.length : 0), 0);
            
            let extraInfo = '';
            if (data.level) extraInfo += `<strong>Niveau:</strong> ${this.escapeHTML(String(data.level))}<br>`;
            if (data.schedule && data.schedule.targetSessionsPerWeek) {
                extraInfo += `<strong>Doel:</strong> ${this.escapeHTML(String(data.schedule.targetSessionsPerWeek))}x per week<br>`;
            } else if (data.targetSessionsPerWeek) {
                extraInfo += `<strong>Doel:</strong> ${this.escapeHTML(String(data.targetSessionsPerWeek))}x per week<br>`;
            }

            const richFieldsHTML = [
                this.formatRichField(data.schedule, 'Schema Regels'),
                this.formatRichField(data.progressionRules, 'Progressieregels')
            ].join('');

            prevEl.innerHTML = `
                <div class="text-sm">
                    <strong>Schema:</strong> ${this.escapeHTML(String(data.name))}<br>
                    ${extraInfo}
                    <strong>Sessies:</strong> ${this.escapeHTML(String(data.sessions.length))}<br>
                    <strong>Oefeningen:</strong> ${this.escapeHTML(String(totalEx))}
                </div>
                ${richFieldsHTML}
            `;
            prevEl.classList.remove('hidden');
            
            const btn = document.getElementById('btn-confirm-import');
            btn.textContent = 'Importeer Nu';
            btn.onclick = () => this.executeImport(data);
            
        } catch(e) {
            errEl.textContent = e.message || "Ongeldige JSON syntax.";
            errEl.classList.remove('hidden');
        }
    },

    executeImport(data) {
        store.importPlan(data);
        this.hideModal();
        this.renderPlans();
        this.renderHome();
        this.showToast("Schema succesvol geïmporteerd!", "success");
    },

    exportData() {
        const backup = {
            plans: store.plans,
            logs: store.logs,
            exportDate: new Date().toISOString()
        };
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backup, null, 2));
        const dlAnchorElem = document.createElement('a');
        dlAnchorElem.setAttribute("href", dataStr);
        dlAnchorElem.setAttribute("download", "go_fitness_backup.json");
        dlAnchorElem.click();
    },

    // Deelt een schema als JSON via de Web Share API, met klembord als fallback
    async sharePlan(planId) {
        const plan = store.plans.find(p => p.id === planId);
        if (!plan) return;

        // Interne id niet meegeven; de ontvanger krijgt bij import een eigen id
        const shareable = { ...plan };
        delete shareable.id;
        const json = JSON.stringify(shareable, null, 2);
        const fileName = `${String(plan.name || 'schema').toLowerCase().replace(/[^a-z0-9]+/g, '_')}.json`;

        try {
            if (typeof navigator !== 'undefined' && navigator.share) {
                const file = new File([json], fileName, { type: 'application/json' });
                if (navigator.canShare && navigator.canShare({ files: [file] })) {
                    await navigator.share({ files: [file], title: plan.name });
                } else {
                    await navigator.share({ title: plan.name, text: json });
                }
                return;
            }
            if (typeof navigator !== 'undefined' && navigator.clipboard) {
                await navigator.clipboard.writeText(json);
                this.showToast('Schema-JSON gekopieerd naar het klembord!', 'success');
                return;
            }
            this.showToast('Delen wordt niet ondersteund in deze browser.', 'error');
        } catch (e) {
            if (e && e.name === 'AbortError') return; // gebruiker annuleerde het delen
            this.showToast('Delen mislukt: ' + (e.message || e), 'error');
        }
    },

    validateBackup(data) {
        if (!data || !Array.isArray(data.plans) || !Array.isArray(data.logs)) {
            throw new Error("Ongeldig backup-bestand. Verwacht 'plans' en 'logs'.");
        }
        return { plans: data.plans, logs: data.logs };
    },

    handleRestoreFileSelect(e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                this.backupToRestore = this.validateBackup(JSON.parse(evt.target.result));
                const summary = `Backup bevat ${this.backupToRestore.plans.length} schema('s) en ${this.backupToRestore.logs.length} gelogde sessie(s).`;
                document.getElementById('restore-summary').textContent = summary;
                document.getElementById('modal-restore').classList.remove('hidden');
            } catch (err) {
                this.showToast('Herstellen mislukt: ' + (err.message || 'ongeldige JSON.'), 'error');
            }
            // Reset zodat hetzelfde bestand later opnieuw gekozen kan worden
            e.target.value = '';
        };
        reader.readAsText(file);
    },

    hideRestoreModal() {
        this.backupToRestore = null;
        document.getElementById('modal-restore').classList.add('hidden');
    },

    confirmRestore() {
        if (!this.backupToRestore) return;
        store.restoreBackup(this.backupToRestore);
        this.hideRestoreModal();
        this.renderPlans();
        this.renderHome();
        this.renderProgress();
        this.renderAchievements();
        this.showToast('Backup succesvol hersteld!', 'success');
    }
};

// Ensure we don't crash when running in a Node/test environment
if (typeof document !== 'undefined' && document.getElementById('import-file')) {
    document.getElementById('import-file').addEventListener('change', (e) => app.handleFileSelect(e));
    const restoreInput = document.getElementById('restore-file');
    if (restoreInput) restoreInput.addEventListener('change', (e) => app.handleRestoreFileSelect(e));

    // Start app
    app.init();
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DataStore, app, store };
}
