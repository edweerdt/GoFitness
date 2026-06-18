// app.js

class DataStore {
    constructor() {
        this.load();
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
    },

    toggleTheme() {
        const themes = ['auto', 'light', 'dark'];
        const currentIdx = themes.indexOf(store.theme);
        store.theme = themes[(currentIdx + 1) % themes.length];
        store.save();
        this.applyTheme();
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
        
        const recentLogs = store.logs.filter(l => new Date(l.date) > sevenDaysAgo);
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

    // --- RENDERING ---

    formatRichField(value, label = null) {
        if (value === null || value === undefined) return '';

        let labelHtml = label ? `<strong>${label}:</strong> ` : '';
        let headerHtml = label ? `<div style="font-weight:600; font-size:0.85rem; color:var(--text-primary); margin-top:8px;">${label}</div>` : '';

        if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
            return `<div class="text-sm text-muted mt-1">${labelHtml}${value}</div>`;
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
                const recentLogsCount = store.logs.filter(l => new Date(l.date) > oneWeekAgo && l.planId === plan.id).length;

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
            const recoveryRules = this.formatRichField(p.recoveryRules, 'Herstelregels');
            const progressionRules = this.formatRichField(p.progressionRules, 'Progressieregels');
            const completionRules = this.formatRichField(p.completionRules, 'Voltooiingsregels');
            const milestones = this.formatRichField(p.successMilestones, 'Mijlpalen');


            el.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                    <div style="flex:1;">
                        <div style="display:flex; align-items:center; gap:8px;">
                            <h3 style="color:var(--text-primary); text-transform:none; font-size:1.1rem; line-height:1.2; margin:0;">${p.name}</h3>
                            ${level}
                        </div>
                        ${desc}
                    </div>
                    <div style="display:flex; align-items:center; gap:8px; margin-left:12px;">
                        ${isActive ? '<span class="status-badge green" style="padding:4px 8px; font-size:0.7rem; white-space:nowrap;">Actief</span>' : ''}
                        <span class="material-icons-round" style="font-size:1.4rem; cursor:pointer; color:#ff5252;" onclick="app.showDeletePlanModal('${p.id}')">delete_outline</span>
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
                    ${recoveryRules}
                    ${progressionRules}
                    ${completionRules}
                    ${milestones}
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
        let totalMinutes = store.logs.reduce((sum, l) => sum + (l.duration || 45), 0);
        let totalExercises = store.logs.reduce((sum, l) => sum + (l.exercisesCompleted || 0), 0);
        
        document.getElementById('full-stats-grid').innerHTML = `
            <div class="stat-box glass-panel"><div class="stat-details"><span class="stat-value">${totalWorkouts}</span><span class="stat-label">Trainingen</span></div></div>
            <div class="stat-box glass-panel"><div class="stat-details"><span class="stat-value">${this.calculateStreak()}</span><span class="stat-label">Weken Streak</span></div></div>
            <div class="stat-box glass-panel"><div class="stat-details"><span class="stat-value">${totalMinutes}</span><span class="stat-label">Minuten</span></div></div>
            <div class="stat-box glass-panel"><div class="stat-details"><span class="stat-value">${totalExercises}</span><span class="stat-label">Oefeningen</span></div></div>
        `;

        const milestones = [];
        if(totalWorkouts >= 1) milestones.push({ title: 'De Eerste Stap', desc: 'Eerste training voltooid!', icon: 'directions_walk' });
        if(totalWorkouts >= 5) milestones.push({ title: 'High Five', desc: '5 trainingen gehaald!', icon: 'front_hand' });
        if(this.calculateStreak() >= 3) milestones.push({ title: 'Gewoontevormer', desc: '3 weken achter elkaar getraind', icon: 'loop' });

        // Add custom success milestones from the active plan
        const plan = store.getActivePlan();
        if (plan && plan.successMilestones && plan.successMilestones.length > 0) {
            plan.successMilestones.forEach(sm => {
                let achieved = false;
                if (sm.condition && sm.condition.type === 'muscleGroupSessions') {
                    const group = sm.condition.muscleGroup;
                    const requiredCount = sm.condition.count;
                    let count = 0;

                    store.logs.filter(l => l.planId === plan.id).forEach(log => {
                        const session = plan.sessions.find(s => s.id === log.sessionId);
                        if (session) {
                            let hasGroup = false;
                            session.exercises.forEach(ex => {
                                if (ex.muscleGroups && ex.muscleGroups.includes(group)) {
                                    hasGroup = true;
                                }
                            });
                            if (hasGroup) count++;
                        }
                    });
                    if (count >= requiredCount) achieved = true;
                }

                if (achieved) {
                    milestones.push({ title: sm.title, desc: sm.description, icon: 'star' });
                }
            });
        }

        const mList = document.getElementById('milestones-list');
        mList.innerHTML = milestones.length ? '' : '<p class="text-muted">Nog geen mijlpalen behaald.</p>';
        milestones.forEach(m => {
            mList.innerHTML += `
                <div class="glass-panel" style="display:flex; align-items:center; gap:16px;">
                    <div class="stat-icon-wrapper text-accent"><span class="material-icons-round">${m.icon}</span></div>
                    <div><div style="font-weight:600">${m.title}</div><div class="text-sm text-muted">${m.desc}</div></div>
                </div>
            `;
        });

        this.renderHistory();
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
            const sortedLogs = [...logs].sort((a, b) => new Date(b.date) - new Date(a.date));

            const planSection = document.createElement('div');
            planSection.className = 'mt-4';
            planSection.innerHTML = `<h4 style="color:var(--text-primary); margin-bottom:8px; margin-top:16px;">${planName}</h4>`;
            
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
                                <div style="font-weight:600; font-size:0.9rem;">${ex.name} (${ex.setsCompleted}/${ex.totalSets} sets)</div>
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
                            <span class="material-icons-round" style="font-size:1.4rem; cursor:pointer; color:#ff5252;" onclick="app.showDeleteLogModal('${log.id}')">delete_outline</span>
                        </div>
                    `;
                } else {
                    summaryHtml += `
                        <div style="display:flex; justify-content:flex-end; gap:16px; margin-top:12px; padding-top:12px; border-top: 1px solid rgba(0,0,0,0.05);">
                            <span class="material-icons-round" style="font-size:1.4rem; cursor:pointer; color:#ff5252;" onclick="app.showDeleteLogModal('${log.id}')">delete_outline</span>
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

    showDeletePlanModal(planId) {
        this.planToDelete = planId;
        document.getElementById('modal-delete-plan').classList.remove('hidden');
    },

    hideDeletePlanModal() {
        this.planToDelete = null;
        document.getElementById('modal-delete-plan').classList.add('hidden');
    },

    confirmDeletePlan() {
        if (!this.planToDelete) return;
        store.plans = store.plans.filter(p => p.id !== this.planToDelete);
        if (store.activePlanId === this.planToDelete) {
            store.activePlanId = null;
        }
        store.save();
        this.hideDeletePlanModal();
        this.renderPlans();
        this.renderHome();
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
                            <div class="exercise-title" style="margin:0;">${ex.name}</div>
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

    showDeleteLogModal(logId) {
        this.logToDelete = logId;
        document.getElementById('modal-delete-log').classList.remove('hidden');
    },

    hideDeleteLogModal() {
        this.logToDelete = null;
        document.getElementById('modal-delete-log').classList.add('hidden');
    },

    confirmDeleteLog() {
        if (!this.logToDelete) return;
        store.logs = store.logs.filter(l => l.id !== this.logToDelete);
        store.save();
        this.hideDeleteLogModal();
        this.renderProgress();
        this.renderHome(); // Update home stats if needed
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
                <div style="font-weight: 600; margin-bottom: 8px;">${ex.name}</div>
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
            if (data.level) extraInfo += `<strong>Niveau:</strong> ${data.level}<br>`;
            if (data.schedule && data.schedule.targetSessionsPerWeek) {
                extraInfo += `<strong>Doel:</strong> ${data.schedule.targetSessionsPerWeek}x per week<br>`;
            } else if (data.targetSessionsPerWeek) {
                extraInfo += `<strong>Doel:</strong> ${data.targetSessionsPerWeek}x per week<br>`;
            }

            const richFieldsHTML = [
                this.formatRichField(data.schedule, 'Schema Regels'),
                this.formatRichField(data.progressionRules, 'Progressieregels'),
                this.formatRichField(data.recoveryRules, 'Herstelregels')
            ].join('');

            prevEl.innerHTML = `
                <div class="text-sm">
                    <strong>Schema:</strong> ${data.name}<br>
                    ${extraInfo}
                    <strong>Sessies:</strong> ${data.sessions.length}<br>
                    <strong>Oefeningen:</strong> ${totalEx}
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
        alert("Schema succesvol geïmporteerd!");
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

document.getElementById('import-file').addEventListener('change', (e) => app.handleFileSelect(e));

// Start app
app.init();
