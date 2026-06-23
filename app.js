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
        this.plans = JSON.parse(localStorage.getItem('plans') || '[]');
        this.activePlanId = localStorage.getItem('activePlanId') || null;
        this.logs = JSON.parse(localStorage.getItem('logs') || '[]');
        this.activeWorkoutState = JSON.parse(localStorage.getItem('activeWorkoutState')) || null;
        this.theme = localStorage.getItem('theme') || 'auto';
    }
    save() {
        localStorage.setItem('plans', JSON.stringify(this.plans));
        if(this.activePlanId) localStorage.setItem('activePlanId', this.activePlanId);
        localStorage.setItem('logs', JSON.stringify(this.logs));
        localStorage.setItem('theme', this.theme);
    }
    saveActiveWorkoutState(state) {
        this.activeWorkoutState = state;
        if(state) {
            localStorage.setItem('activeWorkoutState', JSON.stringify(state));
        } else {
            localStorage.removeItem('activeWorkoutState');
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
            if (!s.id && !s.sessionId) s.id = 'sess_' + Math.random().toString(36).substr(2, 9);
            else if (s.sessionId) s.id = s.sessionId;
            
            s.exercises.forEach(e => {
                if (!e.id && !e.exerciseId) e.id = 'ex_' + Math.random().toString(36).substr(2, 9);
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
            <div style="flex: 1; font-weight: 500; font-size: 0.9rem;">${message}</div>
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
        
        const lastLog = store.logs[store.logs.length - 1];
        const hoursSinceLast = (new Date() - new Date(lastLog.date)) / (1000 * 60 * 60);
        let minHours = (plan.schedule && plan.schedule.minRecoveryHours) ? plan.schedule.minRecoveryHours : (plan.minRecoveryHours || 48);
        
        // Check muscle group specific recovery
        if (plan.recoveryRules && plan.recoveryRules.muscleGroupRecoveryHours && lastLog.exercises) {
            let maxMuscleGroupRecovery = 0;
            const recentSession = plan.sessions.find(s => s.id === lastLog.sessionId);
            if (recentSession) {
                recentSession.exercises.forEach(ex => {
                    if (ex.muscleGroups) {
                        ex.muscleGroups.forEach(mg => {
                            if (plan.recoveryRules.muscleGroupRecoveryHours[mg]) {
                                maxMuscleGroupRecovery = Math.max(maxMuscleGroupRecovery, plan.recoveryRules.muscleGroupRecoveryHours[mg]);
                            }
                        });
                    }
                });
            }
            if (maxMuscleGroupRecovery > minHours) minHours = maxMuscleGroupRecovery;
        }

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
            btnStart.onclick = () => {
                document.getElementById('workout-title').textContent = this.activeWorkout.session.name;
                this.renderWorkoutExercises();
                document.getElementById('btn-finish-workout').onclick = () => this.showFinishModal();
                document.getElementById('bottom-nav').classList.add('hidden');
                document.getElementById('view-workout').querySelector('.sticky-footer').style.bottom = '0';
                this.navigate('workout');
            };
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
        if (plan) {
            const targetSessions = (plan.schedule && plan.schedule.targetSessionsPerWeek) ? plan.schedule.targetSessionsPerWeek : plan.targetSessionsPerWeek;
            if (targetSessions) {
                const oneWeekAgo = new Date();
                oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
                const oneWeekAgoStr = oneWeekAgo.toISOString();
                const recentLogsCount = store.logs.filter(l => l.date > oneWeekAgoStr && l.planId === plan.id).length;

                let progressText = `${recentLogsCount}/${targetSessions} sessies deze week`;
                const progressDiv = document.createElement('div');
                progressDiv.className = 'text-sm text-muted mt-2';
                progressDiv.style.textAlign = 'center';
                progressDiv.textContent = progressText;

                // Add or update progress text under the streak stats
                const statsMini = document.querySelector('.stats-mini');
                let existingProgress = document.getElementById('home-weekly-progress');
                if (!existingProgress) {
                    existingProgress = document.createElement('div');
                    existingProgress.id = 'home-weekly-progress';
                    existingProgress.style.gridColumn = '1 / -1';
                    statsMini.appendChild(existingProgress);
                }
                existingProgress.innerHTML = `<div class="glass-panel text-center text-sm" style="padding: 8px;"><strong>Doel:</strong> ${progressText}</div>`;
            }
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
            const desc = descriptionText ? `<p class="text-sm mt-1" style="color:var(--text-primary);">${descriptionText}</p>` : '';
            const recPattern = sched.recommendedPattern || p.recommendedPattern ? 
                `<div class="text-sm text-muted mt-1"><strong>Aanbevolen patroon:</strong> ${sched.recommendedPattern || p.recommendedPattern}</div>` : '';
            const recovery = sched.minRecoveryHours || p.minRecoveryHours ? 
                `<div class="text-sm text-muted"><strong>Herstel:</strong> Minimaal ${sched.minRecoveryHours || p.minRecoveryHours} uur</div>` : '';
            const weeklyMins = p.estimatedWeeklyMinutes ? 
                `<div class="text-sm text-muted"><strong>Geschatte tijd per week:</strong> ${p.estimatedWeeklyMinutes} min</div>` : '';
            const sessionOrder = p.defaultSessionOrder ? 
                `<div class="text-sm text-muted mt-1"><strong>Sessie volgorde:</strong> ${p.defaultSessionOrder.join(', ')}</div>` : 
                (p.sessions ? `<div class="text-sm text-muted mt-1"><strong>Sessies:</strong> ${p.sessions.map(s=>s.name).join(', ')}</div>` : '');

            const level = p.level ? `<span class="status-badge" style="padding:2px 6px; font-size:0.7rem; background:rgba(255,255,255,0.1); color:var(--text-muted);">${p.level}</span>` : '';
            const goal = p.goal ? `<div class="text-sm text-muted"><strong>Doel:</strong> ${p.goal}</div>` : '';
            const equipment = p.equipment && p.equipment.length > 0 ? `<div class="text-sm text-muted mt-1"><strong>Apparatuur:</strong> ${p.equipment.join(', ')}</div>` : '';

            const scheduleInfo = this.formatRichField(p.schedule, 'Schema Regels');
            const progressionRules = this.formatRichField(p.progressionRules, 'Progressieregels');


            el.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                    <div style="flex:1;">
                        <div style="display:flex; align-items:center; gap:8px;">
                            <h3 style="color:var(--text-primary); text-transform:none; font-size:1.1rem; line-height:1.2; margin:0;">${this.escapeHTML(p.name)}</h3>
                            ${level}
                        </div>
                        ${desc}
                    </div>
                    <div style="display:flex; align-items:center; gap:8px; margin-left:12px;">
                        ${isActive ? '<span class="status-badge green" style="padding:4px 8px; font-size:0.7rem; white-space:nowrap;">Actief</span>' : ''}
                        <span class="material-icons-round" style="font-size:1.4rem; cursor:pointer; color:#ff5252;" onclick="app.showDeleteModal('plan', '${p.id}')">delete_outline</span>
                    </div>
                </div>
                
                <div style="background: rgba(0,0,0,0.03); padding: 8px 12px; border-radius: 8px; margin-top: 8px; cursor: pointer;" onclick="this.nextElementSibling.classList.toggle('hidden')">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <div style="font-weight:600; font-size:0.85rem; color:var(--accent-color);">DETAILS</div>
                        <span class="material-icons-round text-muted" style="font-size:1.2rem;">expand_more</span>
                    </div>
                    <div class="text-sm text-muted mt-1"><strong>Frequentie:</strong> ${targetSessions}x per week (${p.sessions.length} unieke sessies)</div>
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
        this.renderMuscleStats();
        this.renderHistory();
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
                        <div style="font-weight:600; font-size:1rem;">${meta.name}</div>
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

            const year = d.getFullYear();
            const week = Math.ceil((d - new Date(year, 0, 1)) / (1000 * 60 * 60 * 24) / 7);
            const wKey = year + '-' + week;
            weeksMap[wKey] = (weeksMap[wKey] || 0) + 1;

            lastDate = d;

            if (log.exercises && log.exercises.length > 0) {
                let chestCount=0, backCount=0, shoulderCount=0, legCount=0, gluteCount=0, coreCount=0, armCount=0, bwCount=0, weightCount=0;
                
                log.exercises.forEach(ex => {
                    const n = ex.name.toLowerCase();
                    if (n.includes('press') || n.includes('push') || n.includes('fly') || n.includes('dip')) {
                        if (n.includes('leg')) legCount++;
                        else if (n.includes('shoulder') || n.includes('overhead') || n.includes('pike')) shoulderCount++;
                        else chestCount++;
                    }
                    if (n.includes('pull') || n.includes('row') || n.includes('chin') || n.includes('deadlift')) backCount++;
                    if (n.includes('squat') || n.includes('lunge') || n.includes('extension') || n.includes('curl') && n.includes('leg')) legCount++;
                    if (n.includes('thrust') || n.includes('bridge') || n.includes('kickback')) gluteCount++;
                    if (n.includes('plank') || n.includes('crunch') || n.includes('raise') && n.includes('leg')) coreCount++;
                    if (n.includes('curl') || n.includes('extension') || n.includes('skull')) {
                        if (!n.includes('leg')) armCount++;
                    }
                    
                    if (n.includes('push-up') || n.includes('pull-up') || n.includes('dip') || n.includes('plank') || n.includes('squat') && !n.includes('barbell')) bwCount++;
                    if (n.includes('barbell') || n.includes('dumbbell') || n.includes('machine') || n.includes('cable')) weightCount++;
                });

                if (chestCount >= 3) allAchievements.find(a => a.id === 'chest').unlocked = true;
                if (backCount >= 3) allAchievements.find(a => a.id === 'back').unlocked = true;
                if (shoulderCount >= 3) allAchievements.find(a => a.id === 'shoulders').unlocked = true;
                if (legCount >= 3) allAchievements.find(a => a.id === 'legs').unlocked = true;
                if (gluteCount >= 2) allAchievements.find(a => a.id === 'glutes').unlocked = true;
                if (coreCount >= 3) allAchievements.find(a => a.id === 'core').unlocked = true;
                if (armCount >= 3) allAchievements.find(a => a.id === 'arms').unlocked = true;

                if (bwCount > weightCount && bwCount >= 3) allAchievements.find(a => a.id === 'calisthenics').unlocked = true;
                if (weightCount > bwCount && weightCount >= 3) allAchievements.find(a => a.id === 'iron').unlocked = true;
            }
        });

        let consecutiveWeeks = 0;
        let weekKeys = Object.keys(weeksMap).sort();
        for(let i=1; i<weekKeys.length; i++) {
            const currentW = parseInt(weekKeys[i].split('-')[1]);
            const prevW = parseInt(weekKeys[i-1].split('-')[1]);
            if (currentW === prevW + 1) consecutiveWeeks++;
            else consecutiveWeeks = 0;
            if (consecutiveWeeks >= 3) allAchievements.find(a => a.id === 'rhythm').unlocked = true;
        }

        // Render grid
        grid.innerHTML = '';
        
        const unlockedAchievements = allAchievements.filter(ach => ach.unlocked);
        
        if (unlockedAchievements.length === 0) {
            grid.style.display = 'block';
            grid.innerHTML = '<div class="glass-panel text-center text-muted" style="padding: 32px 16px;">Nog geen achievements behaald.<br>Voltooi een training om je eerste badge vrij te spelen!</div>';
            return;
        }
        
        grid.style.display = 'grid';
        unlockedAchievements.forEach(ach => {
            const el = document.createElement('div');
            el.className = 'glass-panel';
            el.style.textAlign = 'center';
            el.style.padding = '16px';
            el.style.display = 'flex';
            el.style.flexDirection = 'column';
            el.style.alignItems = 'center';
            el.style.justifyContent = 'center';
            el.style.gap = '8px';

            el.innerHTML = `
                <div class="stat-icon-wrapper text-accent" style="width:48px; height:48px; margin: 0 auto; background:rgba(59, 130, 246, 0.2);">
                    <span class="material-icons-round">${ach.icon}</span>
                </div>
                <div style="font-weight:600; font-size:0.85rem; line-height:1.2; margin-top:4px;">${ach.title}</div>
                <div class="text-sm text-muted" style="font-size:0.7rem; line-height:1.3;">${ach.desc}</div>
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
                                exDetails.push(text);
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

                if (log.exercises && log.exercises.length > 0) {
                    summaryHtml += `
                        <div style="display:flex; justify-content:flex-end; gap:16px; margin-top:12px; padding-top:12px; border-top: 1px solid rgba(0,0,0,0.05);">
                            <span class="material-icons-round" style="font-size:1.4rem; cursor:pointer; color:var(--text-muted);" onclick="app.showEditLogModal('${log.id}')">edit_note</span>
                            <span class="material-icons-round" style="font-size:1.4rem; cursor:pointer; color:#ff5252;" onclick="app.showDeleteModal('log', '${log.id}')">delete_outline</span>
                        </div>
                    `;
                } else {
                    summaryHtml += `
                        <div style="display:flex; justify-content:flex-end; gap:16px; margin-top:12px; padding-top:12px; border-top: 1px solid rgba(0,0,0,0.05);">
                            <span class="material-icons-round" style="font-size:1.4rem; cursor:pointer; color:#ff5252;" onclick="app.showDeleteModal('log', '${log.id}')">delete_outline</span>
                        </div>
                    `;
                }

                const el = document.createElement('div');
                el.className = 'glass-panel';
                el.innerHTML = `
                    <div style="display:flex; justify-content:space-between; align-items:center; cursor:pointer;" onclick="this.nextElementSibling.classList.toggle('hidden')">
                        <div>
                            <div style="font-weight:600;">${log.sessionName || 'Sessie'}</div>
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

    calculateStreak() {
        if(store.logs.length === 0) return 0;
        return 1; // Simplified for MVP
    },

    // --- WORKOUT FLOW ---

    startWorkout(session) {
        this.activeWorkout = {
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
        
        document.getElementById('workout-title').textContent = session.name;
        this.renderWorkoutExercises();
        
        document.getElementById('btn-finish-workout').onclick = () => this.showFinishModal();
        
        document.getElementById('bottom-nav').classList.add('hidden');
        document.getElementById('view-workout').querySelector('.sticky-footer').style.bottom = '0';
        
        this.navigate('workout');
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
            if (ex.category) badgesHtml += `<span class="status-badge" style="padding:2px 6px; font-size:0.7rem; background:rgba(255,255,255,0.1); color:var(--text-muted); margin-right:4px;">${ex.category}</span>`;
            if (ex.exerciseType) badgesHtml += `<span class="status-badge" style="padding:2px 6px; font-size:0.7rem; background:rgba(255,255,255,0.1); color:var(--text-muted);">${ex.exerciseType}</span>`;

            // Build notes & alternatives
            let notesHtml = '';
            if (ex.notes && Array.isArray(ex.notes) && ex.notes.length > 0) {
                notesHtml += `<ul class="text-sm text-muted mt-2" style="list-style-type: disc; padding-left: 20px;">`;
                ex.notes.forEach(n => notesHtml += `<li>${n}</li>`);
                notesHtml += `</ul>`;
            } else if (ex.notes && typeof ex.notes === 'string') {
                notesHtml += `<div class="text-sm text-muted mt-2">${ex.notes}</div>`;
            }

            if (ex.alternatives && ex.alternatives.length > 0) {
                notesHtml += `<div class="text-sm text-muted mt-2"><strong>Alternatieven:</strong> ${ex.alternatives.join(', ')}</div>`;
            } else if (ex.optionalAlternatives && ex.optionalAlternatives.length > 0) {
                notesHtml += `<div class="text-sm text-muted mt-2"><strong>Alternatieven:</strong> ${ex.optionalAlternatives.join(', ')}</div>`;
            }

            let setsHtml = '';
            for(let i=0; i<ex.sets; i++) {
                const checked = ex.setsCompleted[i] ? 'checked' : '';
                
                // TrackMetrics check for dynamic inputs
                const wantsWeight = ex.trackMetrics ? ex.trackMetrics.includes('weight') : true;
                const wantsReps = ex.trackMetrics ? ex.trackMetrics.includes('reps') : false;
                const wantsDuration = ex.trackMetrics ? ex.trackMetrics.includes('duration_seconds') : false;
                
                let inputsHtml = '';
                if (wantsWeight) {
                    inputsHtml += `<input type="number" class="weight-input" placeholder="kg" 
                        value="${ex.weights ? ex.weights[i] : ''}" onchange="app.updateWeight(${exIndex}, ${i}, this.value)">`;
                }
                if (wantsReps) {
                    inputsHtml += `<input type="number" class="weight-input" placeholder="reps" style="width: 55px;"
                        value="${ex.actualReps ? ex.actualReps[i] : ''}" onchange="app.updateReps(${exIndex}, ${i}, this.value)">`;
                }
                if (wantsDuration && !wantsReps) {
                     inputsHtml += `<input type="number" class="weight-input" placeholder="sec" style="width: 55px;"
                        value="${ex.actualReps ? ex.actualReps[i] : ''}" onchange="app.updateReps(${exIndex}, ${i}, this.value)">`;
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
                        <div class="exercise-meta">${metaString}</div>
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
        this.activeWorkout.exercises[exIndex].setsCompleted[setIndex] = !this.activeWorkout.exercises[exIndex].setsCompleted[setIndex];
        store.saveActiveWorkoutState(this.activeWorkout);
        this.renderWorkoutExercises();
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
        const duration = Math.round((new Date() - this.activeWorkout.startTime) / 60000);
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

        const activePlan = store.getActivePlan();

        store.saveWorkoutLog({
            planId: activePlan ? activePlan.id : null,
            planName: activePlan ? activePlan.name : 'Overige Sessies',
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

        if (!this.logToEdit.exercises || this.logToEdit.exercises.length === 0) {
            container.innerHTML = '<p class="text-muted">Geen details beschikbaar voor deze oude sessie.</p>';
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
                                    value="${d.weight || ''}" onchange="app.updateEditLogWeight(${exIndex}, ${setIndex}, this.value)">
                                <input type="number" class="input-field" placeholder="reps" style="width:70px; text-align:center;" 
                                    value="${d.reps || ''}" onchange="app.updateEditLogReps(${exIndex}, ${setIndex}, this.value)">
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
    }
};

// Ensure we don't crash when running in a Node/test environment
if (typeof document !== 'undefined' && document.getElementById('import-file')) {
    document.getElementById('import-file').addEventListener('change', (e) => app.handleFileSelect(e));

    // Start app
    app.init();
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DataStore, app, store };
}
