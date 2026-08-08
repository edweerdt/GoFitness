// app.js

const DEFAULT_EXERCISES = [
    { id: 'def_bench_press', name: 'Barbell Bench Press', muscleGroups: ['chest', 'triceps', 'shoulders'], exerciseType: 'weight_reps', trackMetrics: ['weight', 'reps'], category: 'compound' },
    { id: 'def_incline_bench_press', name: 'Incline Bench Press', muscleGroups: ['chest', 'shoulders', 'triceps'], exerciseType: 'weight_reps', trackMetrics: ['weight', 'reps'], category: 'compound' },
    { id: 'def_incline_db_press', name: 'Incline Dumbbell Press', muscleGroups: ['chest', 'shoulders', 'triceps'], exerciseType: 'weight_reps', trackMetrics: ['weight', 'reps'], category: 'compound' },
    { id: 'def_chest_fly', name: 'Dumbbell Chest Fly', muscleGroups: ['chest'], exerciseType: 'weight_reps', trackMetrics: ['weight', 'reps'], category: 'isolation' },
    { id: 'def_pushup', name: 'Push-Up', muscleGroups: ['chest', 'triceps', 'core'], exerciseType: 'bodyweight_reps', trackMetrics: ['reps'], category: 'bodyweight' },
    { id: 'def_dip', name: 'Chest / Tricep Dips', muscleGroups: ['chest', 'triceps'], exerciseType: 'bodyweight_reps', trackMetrics: ['weight', 'reps'], category: 'bodyweight' },
    { id: 'def_overhead_press', name: 'Overhead Press (OHP)', muscleGroups: ['shoulders', 'triceps'], exerciseType: 'weight_reps', trackMetrics: ['weight', 'reps'], category: 'compound' },
    { id: 'def_lateral_raise', name: 'Dumbbell Lateral Raise', muscleGroups: ['shoulders'], exerciseType: 'weight_reps', trackMetrics: ['weight', 'reps'], category: 'isolation' },
    { id: 'def_barbell_squat', name: 'Barbell Back Squat', muscleGroups: ['legs', 'glutes'], exerciseType: 'weight_reps', trackMetrics: ['weight', 'reps'], category: 'compound' },
    { id: 'def_goblet_squat', name: 'Goblet Squat', muscleGroups: ['legs', 'glutes'], exerciseType: 'weight_reps', trackMetrics: ['weight', 'reps'], category: 'compound' },
    { id: 'def_leg_press', name: 'Leg Press', muscleGroups: ['legs', 'glutes'], exerciseType: 'weight_reps', trackMetrics: ['weight', 'reps'], category: 'compound' },
    { id: 'def_romanian_deadlift', name: 'Romanian Deadlift (RDL)', muscleGroups: ['legs', 'glutes', 'back'], exerciseType: 'weight_reps', trackMetrics: ['weight', 'reps'], category: 'compound' },
    { id: 'def_bulgarian_split_squat', name: 'Bulgarian Split Squat', muscleGroups: ['legs', 'glutes'], exerciseType: 'weight_reps', trackMetrics: ['weight', 'reps'], category: 'compound' },
    { id: 'def_leg_extension', name: 'Leg Extension', muscleGroups: ['legs'], exerciseType: 'weight_reps', trackMetrics: ['weight', 'reps'], category: 'isolation' },
    { id: 'def_leg_curl', name: 'Lying Leg Curl', muscleGroups: ['legs'], exerciseType: 'weight_reps', trackMetrics: ['weight', 'reps'], category: 'isolation' },
    { id: 'def_deadlift', name: 'Conventional Deadlift', muscleGroups: ['back', 'legs', 'glutes'], exerciseType: 'weight_reps', trackMetrics: ['weight', 'reps'], category: 'compound' },
    { id: 'def_barbell_row', name: 'Barbell Bent Over Row', muscleGroups: ['back', 'biceps'], exerciseType: 'weight_reps', trackMetrics: ['weight', 'reps'], category: 'compound' },
    { id: 'def_lat_pulldown', name: 'Lat Pulldown', muscleGroups: ['back', 'biceps'], exerciseType: 'weight_reps', trackMetrics: ['weight', 'reps'], category: 'compound' },
    { id: 'def_pullup', name: 'Pull-Up / Chin-Up', muscleGroups: ['back', 'biceps'], exerciseType: 'bodyweight_reps', trackMetrics: ['weight', 'reps'], category: 'bodyweight' },
    { id: 'def_bicep_curl', name: 'Dumbbell Bicep Curl', muscleGroups: ['biceps'], exerciseType: 'weight_reps', trackMetrics: ['weight', 'reps'], category: 'isolation' },
    { id: 'def_tricep_pushdown', name: 'Tricep Cable Pushdown', muscleGroups: ['triceps'], exerciseType: 'weight_reps', trackMetrics: ['weight', 'reps'], category: 'isolation' },
    { id: 'def_plank', name: 'Plank Hold', muscleGroups: ['core'], exerciseType: 'duration', trackMetrics: ['duration_seconds'], category: 'isometric' },
    { id: 'def_running', name: 'Hardlopen', muscleGroups: ['legs'], exerciseType: 'duration', trackMetrics: ['duration_seconds'], category: 'cardio' },
    // Geëxtraheerd uit Thijs training log (Google Drive)
    { id: 'def_cable_crunch', name: 'Cable Crunch', muscleGroups: ['core'], exerciseType: 'weight_reps', trackMetrics: ['weight', 'reps'], category: 'isolation' },
    { id: 'def_knee_raise_db', name: 'Dumbbell Hanging Knee Raise', muscleGroups: ['core'], exerciseType: 'weight_reps', trackMetrics: ['weight', 'reps'], category: 'isolation' },
    { id: 'def_ab_wheel_rollout', name: 'Ab Wheel Rollout', muscleGroups: ['core'], exerciseType: 'bodyweight_reps', trackMetrics: ['reps'], category: 'bodyweight' },
    { id: 'def_hollow_body_hold', name: 'Hollow Body Hold', muscleGroups: ['core'], exerciseType: 'duration', trackMetrics: ['duration_seconds'], category: 'isometric' },
    { id: 'def_toes_to_bar', name: 'Toes-to-Bar', muscleGroups: ['core'], exerciseType: 'bodyweight_reps', trackMetrics: ['reps'], category: 'bodyweight' },
    { id: 'def_pec_deck_fly', name: 'Pec Deck Fly Machine', muscleGroups: ['chest'], exerciseType: 'weight_reps', trackMetrics: ['weight', 'reps'], category: 'isolation' },
    { id: 'def_cable_chest_fly', name: 'Cable Chest Fly', muscleGroups: ['chest'], exerciseType: 'weight_reps', trackMetrics: ['weight', 'reps'], category: 'isolation' },
    { id: 'def_dumbbell_bench_press', name: 'Dumbbell Bench Press', muscleGroups: ['chest', 'triceps', 'shoulders'], exerciseType: 'weight_reps', trackMetrics: ['weight', 'reps'], category: 'compound' },
    { id: 'def_single_arm_db_press', name: 'Single-Arm Dumbbell Bench Press', muscleGroups: ['chest', 'triceps', 'core'], exerciseType: 'weight_reps', trackMetrics: ['weight', 'reps'], category: 'compound' },
    { id: 'def_hip_thrust', name: 'Barbell Hip Thrust', muscleGroups: ['glutes', 'legs'], exerciseType: 'weight_reps', trackMetrics: ['weight', 'reps'], category: 'compound' },
    { id: 'def_single_leg_press', name: 'Single-Leg Press Machine', muscleGroups: ['legs', 'glutes'], exerciseType: 'weight_reps', trackMetrics: ['weight', 'reps'], category: 'compound' },
    { id: 'def_hip_abductor', name: 'Hip Abductor Machine', muscleGroups: ['glutes'], exerciseType: 'weight_reps', trackMetrics: ['weight', 'reps'], category: 'isolation' },
    { id: 'def_hammer_pullup', name: 'Neutral Grip Pull-Up (Hammer Grip)', muscleGroups: ['back', 'biceps'], exerciseType: 'bodyweight_reps', trackMetrics: ['weight', 'reps'], category: 'bodyweight' },
    { id: 'def_seated_cable_row', name: 'Seated Cable Row', muscleGroups: ['back', 'biceps'], exerciseType: 'weight_reps', trackMetrics: ['weight', 'reps'], category: 'compound' },
    { id: 'def_row_machine', name: 'Row Machine (Roeimachine)', muscleGroups: ['back', 'biceps', 'legs', 'cardio'], exerciseType: 'duration', trackMetrics: ['duration_seconds', 'level'], category: 'cardio', defaultSets: 1 },
    { id: 'def_single_arm_db_row', name: 'Single-Arm Dumbbell Row', muscleGroups: ['back', 'biceps'], exerciseType: 'weight_reps', trackMetrics: ['weight', 'reps'], category: 'compound' },
    { id: 'def_kb_wrist_flip', name: 'Kettlebell Wrist Flip', muscleGroups: ['arms'], exerciseType: 'weight_reps', trackMetrics: ['weight', 'reps'], category: 'isolation' },
    { id: 'def_hand_gripper', name: 'Hand Gripper (Handknijper)', muscleGroups: ['arms'], exerciseType: 'weight_reps', trackMetrics: ['weight', 'reps'], category: 'isolation' },
    { id: 'def_bent_over_tricep_ext', name: 'Bent-Over Triceps Extension', muscleGroups: ['triceps'], exerciseType: 'weight_reps', trackMetrics: ['weight', 'reps'], category: 'isolation' },
    { id: 'def_squat_clean', name: 'Barbell Squat Clean', muscleGroups: ['legs', 'glutes', 'shoulders', 'back'], exerciseType: 'weight_reps', trackMetrics: ['weight', 'reps'], category: 'compound' }
];

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
            this.holdTimerDelaySeconds = 3;
            this.deleted = { plans: [], logs: [] };
            this.customExercises = [];
        }
    }
    load() {
        this.plans = this.safeParse('plans', []);
        this.activePlanId = localStorage.getItem('activePlanId') || null;
        this.logs = this.safeParse('logs', []);
        this.activeWorkoutState = this.safeParse('activeWorkoutState', null);
        this.theme = localStorage.getItem('theme') || 'auto';
        this.holdTimerDelaySeconds = (typeof localStorage !== 'undefined' && localStorage.getItem('holdTimerDelaySeconds')) ? (parseInt(localStorage.getItem('holdTimerDelaySeconds'), 10) || 3) : 3;
        this.customExercises = this.safeParse('customExercises', []);
        // Tombstones: ids van verwijderde items, zodat cloud-sync ze niet terugbrengt
        this.deleted = this.safeParse('deleted', { plans: [], logs: [] });
        this.sanitizeLogPlanIds();
    }
    setHoldTimerDelaySeconds(val) {
        const parsed = parseInt(val, 10);
        this.holdTimerDelaySeconds = (!isNaN(parsed) && parsed >= 0) ? parsed : 3;
        this.save();
    }
    sanitizeLogPlanIds() {
        if (!this.plans || !this.logs) return;
        this.logs.forEach(log => {
            if (log.planId && !this.plans.some(p => p.id === log.planId)) {
                const matchedPlan = this.plans.find(p => 
                    (p.planId && p.planId === log.planId) ||
                    (log.planName && p.name && log.planName.toLowerCase().trim() === p.name.toLowerCase().trim())
                );
                if (matchedPlan) {
                    log.planId = matchedPlan.id;
                }
            }
        });
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
            localStorage.setItem('holdTimerDelaySeconds', String(this.holdTimerDelaySeconds || 3));
            localStorage.setItem('customExercises', JSON.stringify(this.customExercises || []));
            localStorage.setItem('deleted', JSON.stringify(this.deleted));
            return true;
        } catch (e) {
            console.error('Opslaan naar localStorage mislukt:', e);
            if (typeof app !== 'undefined' && app.showToast) {
                app.showToast('⚠️ Opslag vol! Data kon niet worden opgeslagen.', 'error');
            }
            return false;
        }
    }
    // Onthoudt een verwijdering zodat sync die op andere devices ook doorvoert
    recordDeletion(type, id) {
        if (!this.deleted[type]) this.deleted[type] = [];
        if (!this.deleted[type].includes(id)) this.deleted[type].push(id);
        // Begrens de lijst zodat localStorage niet volloopt
        if (this.deleted[type].length > 500) this.deleted[type] = this.deleted[type].slice(-500);
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
    // Uniek over devices heen: sync merget op id, dus een botsing zou data laten verdwijnen
    generateId(prefix) {
        return prefix + '_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
    }
    getExerciseLibrary() {
        const list = [...DEFAULT_EXERCISES];

        // Oefeningen uit geïmporteerde schema's toevoegen indien nog niet in de lijst
        if (this.plans) {
            this.plans.forEach(p => {
                if (p.sessions) {
                    p.sessions.forEach(s => {
                        if (s.exercises) {
                            s.exercises.forEach(e => {
                                if (e.name && !list.some(item => item.name.toLowerCase().trim() === e.name.toLowerCase().trim())) {
                                    list.push({
                                        id: e.id || ('plan_ex_' + Math.random().toString(36).slice(2, 9)),
                                        name: e.name,
                                        muscleGroups: e.muscleGroups || [],
                                        exerciseType: e.exerciseType || (e.durationSeconds ? 'duration' : 'weight_reps'),
                                        trackMetrics: e.trackMetrics || (e.durationSeconds ? ['duration_seconds'] : ['weight', 'reps']),
                                        category: e.category || 'compound',
                                        fromPlan: true
                                    });
                                }
                            });
                        }
                    });
                }
            });
        }

        // Custom oefeningen van de gebruiker toevoegen / overschrijven
        if (this.customExercises) {
            this.customExercises.forEach(c => {
                const idx = list.findIndex(item => item.name.toLowerCase().trim() === c.name.toLowerCase().trim());
                if (idx !== -1) {
                    list[idx] = { ...list[idx], ...c };
                } else {
                    list.push(c);
                }
            });
        }

        return list;
    }
    addCustomExercise(exData) {
        if (!exData.name || !exData.name.trim()) throw new Error("Oefeningnaam is verplicht.");
        const id = 'custom_ex_' + Date.now();
        const newEx = {
            id,
            name: exData.name.trim(),
            muscleGroups: exData.muscleGroups || [],
            exerciseType: exData.exerciseType || 'weight_reps',
            trackMetrics: exData.trackMetrics || (exData.exerciseType === 'duration' ? ['duration_seconds'] : (exData.exerciseType === 'bodyweight_reps' ? ['reps'] : ['weight', 'reps'])),
            category: exData.category || 'custom',
            isCustom: true
        };
        if (!this.customExercises) this.customExercises = [];
        this.customExercises.push(newEx);
        this.save();
        return newEx;
    }
    updateCustomExercise(id, exData) {
        if (!this.customExercises) this.customExercises = [];
        const idx = this.customExercises.findIndex(c => c.id === id);
        if (idx === -1) throw new Error("Oefening niet gevonden.");
        this.customExercises[idx] = {
            ...this.customExercises[idx],
            name: exData.name ? exData.name.trim() : this.customExercises[idx].name,
            muscleGroups: exData.muscleGroups || this.customExercises[idx].muscleGroups,
            exerciseType: exData.exerciseType || this.customExercises[idx].exerciseType,
            trackMetrics: exData.trackMetrics || this.customExercises[idx].trackMetrics,
            category: exData.category || this.customExercises[idx].category
        };
        this.save();
        return this.customExercises[idx];
    }
    deleteCustomExercise(id) {
        if (!this.customExercises) this.customExercises = [];
        this.recordDeletion('customExercises', id);
        this.customExercises = this.customExercises.filter(c => c.id !== id);
        this.save();
    }
    static validatePlanSchema(data) {
        if (!data || typeof data !== 'object' || Array.isArray(data)) {
            throw new Error("Ongeldig formaat. Het schema moet een JSON-object zijn.");
        }
        if (!data.name || typeof data.name !== 'string' || !data.name.trim()) {
            throw new Error("Ongeldig formaat: Schema-naam ('name') is verplicht.");
        }
        if (!data.sessions || !Array.isArray(data.sessions) || data.sessions.length === 0) {
            throw new Error("Ongeldig formaat: Het schema moet minstens één sessie ('sessions') bevatten.");
        }

        data.sessions.forEach((s, sIdx) => {
            if (!s || typeof s !== 'object' || Array.isArray(s)) {
                throw new Error(`Ongeldige sessie op positie ${sIdx + 1}: moet een object zijn.`);
            }
            const sessionName = (typeof s.name === 'string' && s.name.trim()) ? s.name.trim() : (s.id || s.sessionId || `Sessie ${sIdx + 1}`);
            if (!s.name || typeof s.name !== 'string' || !s.name.trim()) {
                throw new Error(`Ongeldige sessie #${sIdx + 1}: Sessienaam ('name') is verplicht.`);
            }
            if (!s.exercises || !Array.isArray(s.exercises) || s.exercises.length === 0) {
                throw new Error(`Ongeldige sessie '${sessionName}': Moet minstens één oefening ('exercises') bevatten.`);
            }

            s.exercises.forEach((ex, exIdx) => {
                if (!ex || typeof ex !== 'object' || Array.isArray(ex)) {
                    throw new Error(`Ongeldige oefening op positie ${exIdx + 1} in sessie '${sessionName}': moet een object zijn.`);
                }
                const exName = (typeof ex.name === 'string' && ex.name.trim()) ? ex.name.trim() : `Oefening ${exIdx + 1}`;
                if (!ex.name || typeof ex.name !== 'string' || !ex.name.trim()) {
                    throw new Error(`Ongeldige oefening #${exIdx + 1} in sessie '${sessionName}': Oefeningnaam ('name') is verplicht.`);
                }
                const setsNum = Number(ex.sets);
                if (ex.sets === undefined || ex.sets === null || isNaN(setsNum) || setsNum <= 0) {
                    throw new Error(`Ongeldige oefening '${exName}' in sessie '${sessionName}': Aantal sets ('sets') moet een getal groter dan 0 zijn.`);
                }
            });
        });

        return true;
    }

    importPlan(planData) {
        DataStore.validatePlanSchema(planData);

        // Zoek of dit schema al bestaat (op id, planId, of naam)
        const existingIndex = this.plans.findIndex(p => 
            (planData.id && p.id === planData.id) ||
            (planData.planId && (p.planId === planData.planId || p.id === planData.planId)) ||
            (p.name && planData.name && p.name.toLowerCase().trim() === planData.name.toLowerCase().trim())
        );

        if (existingIndex !== -1) {
            // Behoud het bestaande plan.id zodat de historie/logs 100% gekoppeld blijven!
            planData.id = this.plans[existingIndex].id;
        } else if (!planData.id) {
            planData.id = this.generateId('plan');
        }

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

            // Sessies zonder oefeningen (de preview laat ze door) mogen de import niet breken
            if (!Array.isArray(s.exercises)) s.exercises = [];

            s.exercises.forEach(e => {
                if (!e.id && !e.exerciseId) e.id = 'ex_' + Math.random().toString(36).slice(2, 11);
                else if (e.exerciseId) e.id = e.exerciseId;
            });
        });

        if (existingIndex !== -1) {
            this.plans[existingIndex] = planData;
        } else {
            this.plans.push(planData);
        }

        this.activePlanId = planData.id;
        this.save();
    }
    saveWorkoutLog(log) {
        this.logs.push({ ...log, id: this.generateId('log'), date: new Date().toISOString() });
        this.save();
    }
    restoreBackup(backup) {
        this.plans = backup.plans;
        this.logs = backup.logs;
        // Handgemaakte of oude backups normaliseren zodat het renderen niet breekt
        this.plans.forEach(p => {
            if (!Array.isArray(p.sessions)) p.sessions = [];
        });
        // De backup bevat geen activePlanId; kies een geldig plan als het huidige niet (meer) bestaat
        if (!this.plans.find(p => p.id === this.activePlanId)) {
            this.activePlanId = this.plans.length > 0 ? this.plans[0].id : null;
        }
        // Tombstones wissen, anders zou sync zojuist herstelde items direct weer verwijderen
        this.deleted = { plans: [], logs: [] };
        this.save();
    }
}

const store = new DataStore();

// --- VEILIG RENDEREN ---

// Resultaat van html`` dat bij hergebruik in een volgende template als HTML geldt
class HtmlString {
    constructor(value) { this.value = value; }
    toString() { return this.value; }
}

// Markeert een string expliciet als bedoelde HTML (spaarzaam gebruiken,
// alleen voor output die zelf al veilig is opgebouwd)
const rawHtml = value => new HtmlString(String(value));

// Tagged template die alle interpolaties automatisch escapet, zodat vergeten
// escaping structureel onmogelijk wordt. Geneste html``-resultaten en arrays
// daarvan worden wel als HTML ingevoegd.
function html(strings, ...values) {
    const escape = str => String(str).replace(/[&<>'"]/g, tag => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    }[tag] || tag));
    const render = v => {
        if (v === null || v === undefined) return '';
        if (v instanceof HtmlString) return v.value;
        if (Array.isArray(v)) return v.map(render).join('');
        return escape(v);
    };
    return new HtmlString(strings.reduce((out, s, i) => (i === 0 ? s : out + render(values[i - 1]) + s), ''));
}

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

        toast.innerHTML = html`
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
        if (typeof document === 'undefined' || !document.documentElement) return;
        const btns = document.querySelectorAll('.theme-toggle-btn');
        
        if (document.documentElement.classList) {
            document.documentElement.classList.remove('theme-light', 'theme-dark');
        }
        
        let iconName = 'brightness_auto';
        if (store.theme === 'light') {
            if (document.documentElement.classList) document.documentElement.classList.add('theme-light');
            iconName = 'light_mode';
        } else if (store.theme === 'dark') {
            if (document.documentElement.classList) document.documentElement.classList.add('theme-dark');
            iconName = 'dark_mode';
        }

        if (btns) {
            btns.forEach(btn => {
                const icon = btn ? btn.querySelector('.material-icons-round') : null;
                if (icon) icon.textContent = iconName;
            });
        }
    },

    navigate(viewId) {
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

        // DOM-tolerant: ontbrekende elementen (bijv. in tests) mogen navigatie niet breken
        const viewEl = document.getElementById(`view-${viewId}`);
        if (viewEl) viewEl.classList.add('active');
        const navBtn = document.querySelector(`.nav-item[data-target="${viewId}"]`);
        if(navBtn) navBtn.classList.add('active');

        const bottomNav = document.getElementById('bottom-nav');
        if (bottomNav) {
            if (viewId === 'workout') {
                bottomNav.classList.add('hidden');
            } else {
                bottomNav.classList.remove('hidden');
            }
        }

        this.currentView = viewId;
        
        if(viewId === 'home') this.renderHome();
        if(viewId === 'plans') this.renderPlans();
        if(viewId === 'progress') this.renderProgress();
        if(viewId === 'friends') this.renderFriends();
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

    isLogForPlan(log, plan) {
        if (!log || !plan) return false;
        if (!log.planId && !log.planName) return true;

        const pId = plan.id || null;
        const pPlanId = plan.planId || null;
        const pName = plan.name ? plan.name.toLowerCase().trim() : null;

        if (log.planId && (log.planId === pId || log.planId === pPlanId)) return true;
        if (log.planName && pName && log.planName.toLowerCase().trim() === pName) return true;

        return false;
    },
    
    getRecoveryStatus() {
        let hoursSinceLast = null;
        if (store.logs && store.logs.length > 0) {
            const validLogs = store.logs.filter(log => log && log.date);
            if (validLogs.length > 0) {
                const nowTime = new Date().getTime();
                const latestLog = validLogs.reduce((latest, current) => {
                    const currentDate = current.endTime ? new Date(current.endTime) : new Date(current.date);
                    const latestDate = latest.endTime ? new Date(latest.endTime) : new Date(latest.date);
                    return currentDate > latestDate ? current : latest;
                });
                const lastTrainingTime = latestLog.endTime ? new Date(latestLog.endTime) : new Date(latestLog.date);
                if (!isNaN(lastTrainingTime.getTime())) {
                    hoursSinceLast = Math.max(0, (nowTime - lastTrainingTime.getTime()) / (1000 * 60 * 60));
                }
            }
        }

        const plan = store.getActivePlan();
        if(!plan || store.logs.length === 0) return { status: 'green', text: 'Klaar om te trainen', hoursSinceLast };

        // Filter logs die bij het actieve plan horen (of legacy logs / matching op naam/id)
        const planLogs = store.logs.filter(log => this.isLogForPlan(log, plan) && log.date);
        if (planLogs.length === 0) return { status: 'green', text: 'Klaar om te trainen', hoursSinceLast };

        const minHours = (plan.schedule && plan.schedule.minRecoveryHours) ? plan.schedule.minRecoveryHours : (plan.minRecoveryHours || 48);
        const now = new Date();

        // Herstelregels per spiergroep, genormaliseerd op sleutel
        const mgRules = {};
        if (plan.recoveryRules && plan.recoveryRules.muscleGroupRecoveryHours) {
            Object.entries(plan.recoveryRules.muscleGroupRecoveryHours).forEach(([k, v]) => {
                mgRules[this.normalizeMuscleGroup(k)] = v;
            });
        }

        // Per spiergroep: wanneer voor het laatst getraind (binnen dit plan)?
        const lastTrained = {};
        planLogs.forEach(log => {
            if (!log.date || !log.exercises) return;
            const logTime = log.endTime ? new Date(log.endTime) : new Date(log.date);
            const t = logTime.getTime();
            log.exercises.forEach(ex => {
                const groups = (ex.muscleGroups && ex.muscleGroups.length > 0) ? ex.muscleGroups : this.guessMuscleGroupsFromName(ex.name);
                groups.forEach(mg => {
                    const g = this.normalizeMuscleGroup(mg);
                    if (!lastTrained[g] || t > lastTrained[g]) lastTrained[g] = t;
                });
            });
        });

        // Spiergroepen die de eerstvolgende (aanbevolen) sessie traint
        const rec = (plan.sessions && plan.sessions.length > 0) ? this.getRecommendedSession() : null;
        const nextGroups = [];
        if (rec && rec.session && rec.session.exercises) {
            rec.session.exercises.forEach(ex => {
                const groups = (ex.muscleGroups && ex.muscleGroups.length > 0) ? ex.muscleGroups : this.guessMuscleGroupsFromName(ex.name);
                groups.forEach(mg => {
                    const g = this.normalizeMuscleGroup(mg);
                    if (!nextGroups.includes(g)) nextGroups.push(g);
                });
            });
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
            if (worstRatio === Infinity || worstRatio >= 1) return { status: 'green', text: 'Klaar om te trainen', hoursSinceLast };
            if (worstRatio < 0.5) return { status: 'red', text: 'Beter rusten', hoursSinceLast };
            return { status: 'orange', text: 'Rustig aan', hoursSinceLast };
        }

        // Fallback zonder spiergroep-data: algemene rusttijd sinds de laatste sessie van DIT plan
        const sortedLogs = [...planLogs].sort((a, b) => {
            const dateB = b.endTime ? new Date(b.endTime) : new Date(b.date);
            const dateA = a.endTime ? new Date(a.endTime) : new Date(a.date);
            return dateB - dateA;
        });
        const lastLog = sortedLogs[0];
        const lastLogTime = lastLog.endTime ? new Date(lastLog.endTime) : new Date(lastLog.date);
        const hoursSinceLastPlanLog = (now - lastLogTime) / (1000 * 60 * 60);

        if(hoursSinceLastPlanLog < (minHours * 0.5)) return { status: 'red', text: 'Beter rusten', hoursSinceLast };
        if(hoursSinceLastPlanLog < minHours) return { status: 'orange', text: 'Rustig aan', hoursSinceLast };
        return { status: 'green', text: 'Volledig hersteld', hoursSinceLast };
    },

    getRecommendedSession() {
        const plan = store.getActivePlan();
        if(!plan || !plan.sessions || plan.sessions.length === 0) return null;
        
        let orderedSessions = [...plan.sessions];

        // Use defaultSessionOrder from rich schema if available
        if (plan.schedule && plan.schedule.defaultSessionOrder && plan.schedule.defaultSessionOrder.length > 0) {
            const mapped = plan.schedule.defaultSessionOrder.map(id => plan.sessions.find(s => s.id === id || s.sessionId === id)).filter(Boolean);
            if (mapped.length > 0) orderedSessions = mapped;
        } else {
            // Sort by dayOrderHint if available
            orderedSessions.sort((a, b) => (a.dayOrderHint || 99) - (b.dayOrderHint || 99));
        }

        const planLogs = store.logs.filter(l => this.isLogForPlan(l, plan));
        
        if (planLogs.length === 0) {
            return {
                session: orderedSessions[0],
                reason: `Dit is de volgende in je schema (${plan.name || 'Schema'}).`
            };
        }

        // Sorteer logs op datum (meest recente bovenaan)
        const sortedLogs = [...planLogs].sort((a, b) => new Date(b.date) - new Date(a.date));
        const lastLog = sortedLogs[0];

        // Vind de positie van de laatst voltooide sessie in orderedSessions
        const lastIndex = orderedSessions.findIndex(s => 
            (s.id && s.id === lastLog.sessionId) || 
            (s.sessionId && s.sessionId === lastLog.sessionId)
        );

        if (lastIndex === -1) {
            // Fallback als de laatst gedane sessie niet (meer) in de lijst voorkomt
            return {
                session: orderedSessions[0],
                reason: `Dit is de volgende in je schema (${plan.name || 'Schema'}).`
            };
        }

        const nextIndex = (lastIndex + 1) % orderedSessions.length;
        const nextSession = orderedSessions[nextIndex];

        const isCycleStart = (nextIndex === 0);
        const reason = isCycleStart
            ? `Je hebt alle sessies gehad, we beginnen weer vooraan.`
            : `Dit is de volgende in je schema (${plan.name || 'Schema'}).`;

        return {
            session: nextSession,
            reason: reason
        };
    },

    // --- UTILS ---

    normalizeMuscleGroup(mg) {
        const key = String(mg || '').toLowerCase().trim();
        const aliases = {
            biceps: 'biceps', triceps: 'triceps', forearms: 'arms',
            rear_shoulders: 'shoulders', obliques: 'core',
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
        if (n.includes('curl') && !n.includes('leg')) groups.push('biceps');
        if ((n.includes('tricep') || n.includes('pushdown') || n.includes('skull') || (n.includes('extension') && !n.includes('leg')))) groups.push('triceps');
        if (groups.length === 0 && (n.includes('arm') || n.includes('forearm'))) groups.push('arms');
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

    formatClickableExerciseName(nameStr) {
        if (!nameStr || typeof nameStr !== 'string') return this.escapeHTML(String(nameStr || ''));

        // Splitst op ' of ', ' / ', ' OR ', ',' om individuele oefeningen afzonderlijk klikbaar te maken
        const parts = nameStr.split(/(\s+of\s+|\s*\/\s*|\s+or\s+|\s*,\s*)/i);
        return parts.map(part => {
            const trimmed = part.trim();
            const lower = trimmed.toLowerCase();
            if (lower === 'of' || lower === '/' || lower === 'or' || lower === ',') {
                return `<span class="text-muted" style="font-weight:normal; margin:0 2px;">${this.escapeHTML(part)}</span>`;
            }
            if (!trimmed) return '';

            // Naam als data-attribuut meegeven i.p.v. in een inline JS-string:
            // een naam met een quote kan dan nooit uit de string breken (XSS)
            const safeName = this.escapeHTML(trimmed);
            return `<span class="exercise-search-target" data-exercise-name="${safeName}" onclick="app.triggerExerciseSearch(this.dataset.exerciseName, event, this)" title="Zoek uitvoering van ${safeName}">${safeName} <span class="material-icons-round text-muted" style="font-size:0.85rem; vertical-align:middle; opacity:0.6;">search</span></span>`;
        }).join('');
    },

    triggerExerciseSearch(term, event, el) {
        if (event) {
            event.stopPropagation();
        }

        // 1. Programmatische tekstselectie voor de native browser/PWA zoekbalk onderin op mobiel
        if (el && typeof window !== 'undefined' && window.getSelection && document.createRange) {
            try {
                const selection = window.getSelection();
                const range = document.createRange();
                range.selectNodeContents(el);
                selection.removeAllRanges();
                selection.addRange(range);
            } catch (e) {}
        }

        // 2. Open zoekopdracht op Google in browser tab
        if (typeof window !== 'undefined' && window.open) {
            const query = encodeURIComponent(term);
            window.open(`https://www.google.com/search?q=${query}`, '_blank');
        }
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
        const homeDateEl = document.getElementById('home-date');
        if (homeDateEl) {
            const dateOpt = { weekday: 'long', day: 'numeric', month: 'long' };
            homeDateEl.textContent = new Date().toLocaleDateString('nl-NL', dateOpt);
        }

        const recStatus = this.getRecoveryStatus();
        const badge = document.getElementById('recovery-status');
        if (badge) {
            badge.className = `status-badge ${recStatus.status}`;
            const iconEl = badge.querySelector('.material-icons-round');
            if (iconEl) {
                let icon = 'battery_charging_full';
                if (recStatus.status === 'orange') icon = 'battery_50';
                if (recStatus.status === 'red') icon = 'battery_alert';
                iconEl.textContent = icon;
            }
        }
        
        const recTextEl = document.getElementById('recovery-text');
        if (recTextEl) recTextEl.textContent = recStatus.text;

        const recHoursEl = document.getElementById('recovery-hours');
        if (recHoursEl) {
            if (recStatus.hoursSinceLast !== null && recStatus.hoursSinceLast !== undefined) {
                const hours = Math.round(recStatus.hoursSinceLast);
                const hoursText = hours < 1 ? '< 1u' : `${hours}u`;
                recHoursEl.textContent = `• ${hoursText} geleden`;
                recHoursEl.style.display = '';
            } else {
                recHoursEl.textContent = '';
                recHoursEl.style.display = 'none';
            }
        }

        const btnStart = document.getElementById('btn-start-session');
        const pickerWrapper = document.getElementById('session-picker-wrapper');
        const sessionSelect = document.getElementById('home-session-select');

        const setCardText = (title, name, reason) => {
            const titleEl = document.getElementById('recommended-card-title');
            if (titleEl) titleEl.textContent = title;
            const nameEl = document.getElementById('recommended-session-name');
            if (nameEl) nameEl.textContent = name;
            const reasonEl = document.getElementById('recommended-reason');
            if (reasonEl) reasonEl.textContent = reason;
        };

        if (this.activeWorkout) {
            if (pickerWrapper) pickerWrapper.classList.add('hidden');
            setCardText("Sessie in uitvoering", this.activeWorkout.session.name, "Je was al bezig met deze sessie. Pak hem weer op!");
            if (btnStart) {
                btnStart.textContent = "Hervat Nu";
                btnStart.disabled = false;
                btnStart.onclick = () => this.openWorkoutView();
            }
        } else {
            const activePlan = store.getActivePlan();
            const recSession = this.getRecommendedSession();

            if (pickerWrapper && sessionSelect) {
                pickerWrapper.classList.remove('hidden');

                let optionsHtml = '';
                if (activePlan && activePlan.sessions && activePlan.sessions.length > 0) {
                    optionsHtml += activePlan.sessions.map(s => {
                        const sId = s.id || s.sessionId;
                        const isRec = recSession && sId === (recSession.session.id || recSession.session.sessionId);
                        const label = isRec ? `${this.escapeHTML(s.name)} (Aanbevolen)` : this.escapeHTML(s.name);
                        return `<option value="${this.escapeHTML(sId)}"${isRec ? ' selected' : ''}>${label}</option>`;
                    }).join('');
                }
                optionsHtml += `<option value="custom_session"${(!activePlan || !activePlan.sessions || activePlan.sessions.length === 0) ? ' selected' : ''}>➕ Vrije Sessie</option>`;

                sessionSelect.innerHTML = optionsHtml;

                const updateCardForSelectedSession = () => {
                    const chosenVal = sessionSelect.value;
                    if (chosenVal === 'custom_session') {
                        setCardText("Vrije Sessie", "Vrije Sessie", "Start een blanco training zonder vaste oefeningen. Voeg tijdens het trainen oefeningen toe.");
                        if (btnStart) {
                            btnStart.textContent = "Start Vrije Sessie";
                            btnStart.disabled = false;
                            btnStart.onclick = () => this.startCustomWorkout();
                        }
                    } else if (activePlan) {
                        const chosenSession = activePlan.sessions.find(s => (s.id || s.sessionId) === chosenVal);
                        if (!chosenSession) return;
                        const isRecChoice = recSession && (chosenSession.id || chosenSession.sessionId) === (recSession.session.id || recSession.session.sessionId);
                        setCardText(
                            isRecChoice ? "Aanbevolen Sessie" : "Gekozen Sessie",
                            chosenSession.name,
                            isRecChoice ? recSession.reason : `Handmatig gekozen uit schema (${activePlan.name}).`
                        );
                        if (btnStart) {
                            btnStart.textContent = "Start Nu";
                            btnStart.disabled = false;
                            btnStart.onclick = () => this.startWorkout(chosenSession, activePlan);
                        }
                    }
                };

                sessionSelect.onchange = updateCardForSelectedSession;
                updateCardForSelectedSession();
            } else {
                setCardText("Vrije Sessie", "Vrije Sessie", "Start een blanco training zonder vaste oefeningen.");
                if (btnStart) {
                    btnStart.textContent = "Start Vrije Sessie";
                    btnStart.disabled = false;
                    btnStart.onclick = () => this.startCustomWorkout();
                }
            }
        }

        // Stats
        const statCompletedEl = document.getElementById('stat-completed');
        if (statCompletedEl) statCompletedEl.textContent = store.logs.length;
        const statStreakEl = document.getElementById('stat-streak');
        if (statStreakEl) statStreakEl.textContent = this.calculateStreak();

        // Target sessions per week progress
        const plan = store.getActivePlan();
        const targetSessions = plan ? ((plan.schedule && plan.schedule.targetSessionsPerWeek) ? plan.schedule.targetSessionsPerWeek : plan.targetSessionsPerWeek) : null;
        let existingProgress = document.getElementById('home-weekly-progress');
        if (plan && targetSessions) {
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
            const oneWeekAgoStr = oneWeekAgo.toISOString();
            const recentLogsCount = store.logs.filter(l => l.date > oneWeekAgoStr && this.isLogForPlan(l, plan)).length;

            const progressText = `${recentLogsCount}/${targetSessions} sessies deze week`;

            // Add or update progress text under the streak stats
            const statsMini = document.querySelector('.stats-mini');
            if (statsMini) {
                if (!existingProgress) {
                    existingProgress = document.createElement('div');
                    existingProgress.id = 'home-weekly-progress';
                    existingProgress.style.gridColumn = '1 / -1';
                    statsMini.appendChild(existingProgress);
                }
                existingProgress.innerHTML = `<div class="glass-panel text-center text-sm" style="padding: 8px;"><strong>Doel:</strong> ${this.escapeHTML(progressText)}</div>`;
            }
        } else if (existingProgress) {
            // Geen (plan met) weekdoel meer -> oude voortgangsbalk opruimen
            existingProgress.remove();
        }
    },

    renderPlans() {
        const list = document.getElementById('plans-list');
        list.innerHTML = '';

        // Vrije Sessie kaart altijd bovenaan tonen in Schema's view
        const customCard = document.createElement('div');
        customCard.className = 'glass-panel flex-col gap-2';
        customCard.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <h3 style="color:var(--text-primary); text-transform:none; font-size:1.1rem; line-height:1.2; margin:0;">➕ Vrije Sessie</h3>
                    <p class="text-sm text-muted mt-1">Start een blanco training zonder vaste oefeningen. Voeg losse oefeningen toe tijdens het trainen.</p>
                </div>
                <button class="btn-primary" style="padding:6px 14px; font-size:0.85rem; flex-shrink:0; margin-left:12px;" onclick="app.startCustomWorkout()">Start</button>
            </div>
        `;
        list.appendChild(customCard);

        if(store.plans.length === 0) {
            const emptyNote = document.createElement('p');
            emptyNote.className = 'text-muted mt-2';
            emptyNote.textContent = 'Nog geen vaste schema\'s geïmporteerd. Importeer een schema of start een Vrije Sessie!';
            list.appendChild(emptyNote);
        } else {
            store.plans.forEach(p => {
                const el = document.createElement('div');
                el.className = 'glass-panel flex-col gap-3';
                const isActive = store.activePlanId === p.id;
                
                const sched = p.schedule || {};
                const targetSessions = sched.targetSessionsPerWeek || p.targetSessionsPerWeek || '?';
                // Oude platte beschrijvingen hadden secties als "Herstelregels: ..." achteraan;
                // alleen knippen als zo'n kopje op een eigen regel begint, zodat een zin
                // die toevallig het woord 'mijlpalen' bevat niet wordt afgekapt
                let descriptionText = String(p.description || '');
                descriptionText = descriptionText.split(/\n\s*(?:Herstelregels|Voltooiingsregels|Mijlpalen)/i)[0].trim();
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

                let sessionsListHtml = '';
                if (p.sessions && p.sessions.length > 0) {
                    sessionsListHtml = `
                        <div style="margin-top: 10px; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 8px;">
                            <div style="font-weight:600; font-size:0.8rem; color:var(--text-muted); text-transform:uppercase; margin-bottom:6px;">Sessies in dit schema</div>
                            <div class="flex-col gap-2">
                                ${p.sessions.map(s => {
                                    const sId = this.escapeHTML(s.id || s.sessionId);
                                    const exCount = (s.exercises || []).length;
                                    const exNames = (s.exercises || []).map(ex => this.formatClickableExerciseName(ex.name)).join(', ');
                                    return `
                                        <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(0,0,0,0.03); padding:8px 12px; border-radius:8px;">
                                            <div style="min-width:0; flex:1; margin-right:8px;">
                                                <div style="font-weight:500; font-size:0.9rem; color:var(--text-primary); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${this.escapeHTML(s.name)}</div>
                                                <div class="text-sm text-muted">${exCount} ${exCount === 1 ? 'oefening' : 'oefeningen'}${exNames ? ': ' + exNames : ''}</div>
                                            </div>
                                            <button class="btn-secondary" style="padding:4px 10px; font-size:0.8rem; display:inline-flex; align-items:center; gap:4px; flex-shrink:0;" onclick="app.startWorkoutBySessionId('${this.escapeHTML(p.id)}', '${sId}')" title="Start sessie">
                                                <span class="material-icons-round" style="font-size:1rem;">play_arrow</span> Start
                                            </button>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        </div>
                    `;
                }

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

                    ${sessionsListHtml}
                    
                    ${!isActive ? `<button class="btn-secondary mt-3 w-full" onclick="app.setActivePlan('${p.id}')">Maak Actief</button>` : ''}
                `;
                list.appendChild(el);
            });
        }

        this.renderExerciseLibrary();
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
        
        const statsGrid = document.getElementById('full-stats-grid');
        if (statsGrid) {
            statsGrid.innerHTML = `
                <div class="stat-box glass-panel"><div class="stat-details"><span class="stat-value">${totalWorkouts}</span><span class="stat-label">Trainingen</span></div></div>
                <div class="stat-box glass-panel"><div class="stat-details"><span class="stat-value">${this.calculateStreak()}</span><span class="stat-label">Weken Streak</span></div></div>
                <div class="stat-box glass-panel"><div class="stat-details"><span class="stat-value">${totalMinutes}</span><span class="stat-label">Minuten</span></div></div>
                <div class="stat-box glass-panel"><div class="stat-details"><span class="stat-value">${totalExercises}</span><span class="stat-label">Oefeningen</span></div></div>
            `;
        }
        this.renderExerciseProgress();
        this.renderMuscleStats();
        this.renderHistory();
    },

    // Bouwt per oefening een reeks (datum, max gewicht) uit de logs
    progressWeeks: 1,

    setProgressWeeks(val) {
        if (val === 'all') {
            this.progressWeeks = 'all';
        } else {
            let parsed = parseInt(val, 10);
            if (isNaN(parsed) || parsed < 1) parsed = 1;
            if (parsed > 999) parsed = 999;
            this.progressWeeks = parsed;
        }
        this.renderExerciseProgress();
    },

    adjustProgressWeeks(delta) {
        let current = typeof this.progressWeeks === 'number' ? this.progressWeeks : 4;
        current += delta;
        if (current < 1) current = 1;
        if (current > 999) current = 999;
        this.progressWeeks = current;
        this.renderExerciseProgress();
    },

    formatShortDate(dateStr) {
        if (!dateStr) return '';
        const t = this.parseLogDate ? this.parseLogDate(dateStr) : new Date(dateStr).getTime();
        if (!t || isNaN(t)) return '';
        const d = new Date(t);
        const now = new Date();
        const isSameYear = d.getFullYear() === now.getFullYear();
        const day = d.getDate();
        const months = ['jan.', 'feb.', 'mrt.', 'apr.', 'mei', 'jun.', 'jul.', 'aug.', 'sep.', 'okt.', 'nov.', 'dec.'];
        const monthStr = months[d.getMonth()];
        return isSameYear ? `${day} ${monthStr}` : `${day} ${monthStr} '${String(d.getFullYear()).slice(-2)}`;
    },

    parseLogDate(dateStr) {
        if (!dateStr) return 0;
        let t = new Date(dateStr).getTime();
        if (!isNaN(t) && t > 0) return t;
        const parts = String(dateStr).split(/[-/]/);
        if (parts.length === 3) {
            if (parts[0].length === 2 && parts[2].length === 4) {
                t = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`).getTime();
                if (!isNaN(t)) return t;
            }
        }
        return 0;
    },

    getExerciseProgressSeries() {
        const series = {};
        const isAll = this.progressWeeks === 'all';
        const weeks = typeof this.progressWeeks === 'number' && this.progressWeeks >= 1 ? this.progressWeeks : 1;
        const now = Date.now();
        const cutoffTime = isAll ? 0 : (now - (weeks * 7 * 24 * 60 * 60 * 1000));

        store.logs.forEach(log => {
            if (!log.exercises || !log.date) return;
            const logTime = this.parseLogDate(log.date);
            if (!isAll && (logTime === 0 || logTime < cutoffTime)) return;

            log.exercises.forEach(ex => {
                let maxVal = 0;
                let bestSet = null;
                (ex.details || []).forEach(d => {
                    const w = parseFloat(d.weight) || 0;
                    const r = parseInt(d.reps, 10) || 0;
                    const val = w > 0 ? w : r;
                    if (val > maxVal) {
                        maxVal = val;
                        bestSet = d;
                    }
                });
                if (maxVal <= 0) return;

                // Split combined names ("X of Y") so historical logs attribute data to each variation name
                const exNames = String(ex.name || '').split(/\s+of\s+/i).map(s => s.trim()).filter(Boolean);

                exNames.forEach(displayName => {
                    const key = displayName.toLowerCase();
                    if (!series[key]) series[key] = { name: displayName, points: [] };
                    series[key].points.push({ 
                        date: log.date, 
                        weight: maxVal, 
                        isBodyweight: (parseFloat(bestSet ? bestSet.weight : 0) || 0) === 0,
                        reps: parseInt(bestSet ? bestSet.reps : 0) || 0 
                    });
                });
            });
        });

        // Punten op datumvolgorde
        return Object.values(series)
            .map(s => ({ ...s, points: [...s.points].sort((a, b) => (a.date < b.date ? -1 : 1)) }));
    },

    // Epley-formule: geschat 1-rep-max op basis van gewicht en herhalingen
    estimate1RM(weight, reps) {
        if (!(weight > 0) || !(reps > 0)) return null;
        if (reps === 1) return weight;
        return weight * (1 + reps / 30);
    },

    buildSparklineSVG(points) {
        const w = 320, h = 96;
        if (points.length === 1) {
            const p = points[0];
            return `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid meet" style="width:100%; height:auto; display:block; overflow:visible;">
                <circle cx="${w/2}" cy="${h/2}" r="4" fill="var(--accent-color)"/>
                <text x="${w/2}" y="${h/2 - 10}" text-anchor="middle" font-size="12" font-weight="600" fill="var(--text-primary)">${this.escapeHTML(String(p.weight))} kg</text>
            </svg>`;
        }

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
            let anchor = 'middle';
            if (i === 0 && points.length > 1) anchor = 'start';
            else if (i === points.length - 1) anchor = 'end';
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

        const inputEl = document.getElementById('progress-weeks-input');
        const allBtn = document.getElementById('btn-progress-all');

        if (this.progressWeeks === 'all') {
            if (inputEl) inputEl.value = '';
            if (allBtn) allBtn.classList.add('active');
        } else {
            if (inputEl) inputEl.value = this.progressWeeks || 1;
            if (allBtn) allBtn.classList.remove('active');
        }

        const series = this.getExerciseProgressSeries();
        if (series.length === 0) {
            const weeksText = this.progressWeeks === 'all' 
                ? 'het hele logboek' 
                : ((this.progressWeeks || 1) === 1 ? 'afgelopen week' : `afgelopen ${this.progressWeeks} weken`);
            container.innerHTML = `<p class="text-muted text-sm text-center py-4">Geen trainingen met gewichten gelogd in ${weeksText}.</p>`;
            return;
        }

        // Sorteer op meest gelogde oefeningen
        series.sort((a, b) => b.points.length - a.points.length);

        let html = '';
        series.forEach(s => {
            const first = s.points[0].weight;
            const last = s.points[s.points.length - 1].weight;
            const diff = Math.round((last - first) * 10) / 10;
            let diffText = '';
            let diffColor = 'var(--text-muted)';
            if (s.points.length > 1) {
                diffText = diff === 0 ? 'gelijk' : (diff > 0 ? `+${diff} kg` : `${diff} kg`);
                diffColor = diff > 0 ? 'var(--status-green)' : (diff < 0 ? 'var(--status-red)' : 'var(--text-muted)');
            } else {
                diffText = '1 sessie';
            }

            let best1RM = 0;
            s.points.forEach(p => {
                const est = this.estimate1RM(p.weight, p.reps);
                if (est && est > best1RM) best1RM = est;
            });
            const rmHtml = best1RM > 0 ? `<span>Geschat 1RM: ${Math.round(best1RM)} kg</span>` : '';

            html += `
                <div class="glass-panel progress-card" style="padding: 16px;">
                    <div style="display:flex; justify-content:space-between; align-items:baseline; gap:8px;">
                        <div style="font-weight:600; font-size:0.9rem;">${this.escapeHTML(String(s.name))}</div>
                        <div class="text-sm" style="color:${diffColor}; white-space:nowrap;">${diffText}</div>
                    </div>
                    <div class="mt-2">${this.buildSparklineSVG(s.points)}</div>
                    <div class="text-sm text-muted" style="display:flex; justify-content:space-between; gap:8px; flex-wrap:wrap;">
                        <span>${s.points.length} sessie${s.points.length > 1 ? 's' : ''}</span>
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
            'biceps': { name: 'Biceps', icon: 'sports_martial_arts', color: '#c4b5fd' },
            'triceps': { name: 'Triceps', icon: 'sports_mma', color: '#a78bfa' },
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
                    // Normaliseren zodat synoniemen en subgroepen samen tellen
                    muscles = [...new Set(muscles.map(m => this.normalizeMuscleGroup(m)))];
                    const primaryMuscle = muscles[0];

                    muscles.forEach(m => {
                        sessionMuscles.add(m);
                        if (!stats[m]) stats[m] = { sessions: 0, reps: 0, maxWeight: 0, maxReps: 0 };
                        
                        if (ex.details) {
                            ex.details.forEach(detail => {
                                const reps = parseInt(detail.reps) || 0;
                                const weight = parseFloat(detail.weight) || 0;
                                
                                stats[m].reps += reps;
                                if (reps > stats[m].maxReps) stats[m].maxReps = reps;
                                // Max weight alleen toekennen aan de primaire spiergroep van de oefening
                                if (m === primaryMuscle && weight > stats[m].maxWeight) {
                                    stats[m].maxWeight = weight;
                                }
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
            const fallbackName = m ? (m.charAt(0).toUpperCase() + m.slice(1).replace(/_/g, ' ')) : 'Overig';
            const meta = muscleMeta[m] || { name: fallbackName, icon: 'fitness_center', color: '#a78bfa' };
            const maxWeightDisplay = data.maxWeight > 0 ? `${data.maxWeight} kg` : '-';
            
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
                            <span style="color:var(--text-primary); font-weight:500; text-align:right;">${maxWeightDisplay}</span>
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
            if (el.dataset) {
                el.dataset.achievementId = ach.id;
            } else {
                el.setAttribute('data-achievement-id', ach.id);
            }
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

    formatLogTimeRange(log) {
        if (!log) return '';
        let startD, endD;
        if (log.startTime && log.endTime) {
            startD = new Date(log.startTime);
            endD = new Date(log.endTime);
        } else if (log.date) {
            endD = new Date(log.date);
            const durationMin = typeof log.duration === 'number' && log.duration >= 0 ? log.duration : 0;
            startD = new Date(endD.getTime() - durationMin * 60000);
        }
        if (!startD || !endD || isNaN(startD.getTime()) || isNaN(endD.getTime())) return '';
        const formatTime = d => d.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' });
        return `${formatTime(startD)} - ${formatTime(endD)}`;
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
                const timeRange = app.formatLogTimeRange(log);
                const timeRangeStr = timeRange ? ` (${timeRange})` : '';
                
                const summaryParts = [];
                if (log.exercises && log.exercises.length > 0) {
                    log.exercises.forEach(ex => {
                        // Per set: gewicht, reps en/of stand tonen; kaal afgevinkte sets ook benoemen
                        const exDetails = (ex.details || []).map(d => {
                            let text = `Set ${d.setNumber}:`;
                            const hasW = d.weight !== null && d.weight !== undefined && String(d.weight).trim() !== '';
                            const hasR = d.reps !== null && d.reps !== undefined && String(d.reps).trim() !== '';
                            const hasL = d.level !== null && d.level !== undefined && String(d.level).trim() !== '';
                            if (hasW) text += ` ${d.weight}kg`;
                            if (hasR) text += ` x ${d.reps}`;
                            if (hasL) text += ` • Stand ${d.level}`;
                            if (!hasW && !hasR && !hasL) text += ` Afgevinkt`;
                            return text;
                        });

                        summaryParts.push(html`
                            <div class="mt-2 pt-2" style="border-top: 1px solid rgba(0,0,0,0.05);">
                                <div style="font-weight:600; font-size:0.9rem;">${ex.name} (${ex.setsCompleted}/${ex.totalSets} sets)</div>
                                <div class="text-sm text-muted" style="margin-top:2px;">
                                    ${exDetails.length > 0 ? exDetails.join(', ') : 'Afgevinkt (geen details)'}
                                </div>
                            </div>
                        `);
                    });
                } else {
                    summaryParts.push(html`<div class="text-sm text-muted mt-2">Geen details beschikbaar (oude sessie).</div>`);
                }

                const editIcon = (log.exercises && log.exercises.length > 0)
                    ? html`<span class="material-icons-round" style="font-size:1.4rem; cursor:pointer; color:var(--text-muted);" onclick="app.showEditLogModal('${log.id}')">edit_note</span>`
                    : '';
                summaryParts.push(html`
                    <div style="display:flex; justify-content:flex-end; gap:16px; margin-top:12px; padding-top:12px; border-top: 1px solid rgba(0,0,0,0.05);">
                        ${editIcon}
                        <span class="material-icons-round" style="font-size:1.4rem; cursor:pointer; color:#ff5252;" onclick="app.showDeleteModal('log', '${log.id}')">delete_outline</span>
                    </div>
                `);

                const el = document.createElement('div');
                el.className = 'glass-panel';
                el.innerHTML = html`
                    <div style="display:flex; justify-content:space-between; align-items:center; cursor:pointer;" onclick="this.nextElementSibling.classList.toggle('hidden')">
                        <div>
                            <div style="font-weight:600;">${log.sessionName || 'Sessie'}</div>
                            <div class="text-sm text-muted">${dateStr}${timeRangeStr} • ${log.duration != null ? log.duration : '?'} min • ${log.exercisesCompleted != null ? log.exercisesCompleted : '?'} oefeningen</div>
                        </div>
                        <span class="material-icons-round text-muted" style="font-size:1.2rem;">expand_more</span>
                    </div>
                    <div class="hidden history-details">
                        ${summaryParts}
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
            store.recordDeletion('plans', this.itemToDelete.id);
            store.plans = store.plans.filter(p => p.id !== this.itemToDelete.id);
            if (store.activePlanId === this.itemToDelete.id) {
                store.activePlanId = null;
            }
            store.save();
            this.hideDeleteModal('plan');
            this.renderPlans();
            this.renderHome();
        } else if (type === 'log') {
            store.recordDeletion('logs', this.itemToDelete.id);
            store.logs = store.logs.filter(l => l.id !== this.itemToDelete.id);
            store.save();
            this.hideDeleteModal('log');
            this.renderProgress();
            this.renderHome();
        } else if (type === 'exercise') {
            store.deleteCustomExercise(this.itemToDelete.id);
            this.hideDeleteModal('exercise');
            this.renderExerciseLibrary();
            this.showToast('Oefening verwijderd.', 'success');
        }
    },

    // --- CUSTOM EXERCISES & VRIJE SESSIE LOGIC ---

    startCustomWorkout() {
        const customSession = {
            id: 'custom_session_' + Date.now(),
            name: 'Vrije Sessie',
            exercises: []
        };
        const customPlan = {
            id: 'custom_plan',
            name: 'Vrije Sessie'
        };
        this.startWorkout(customSession, customPlan);
    },

    detectExerciseType(name) {
        const n = String(name || '').toLowerCase().trim();
        if (!n) return { exerciseType: 'weight_reps', category: 'compound' };

        if (n.includes('seated row') || n.includes('seated cable row')) {
            return { exerciseType: 'weight_reps', category: 'compound' };
        }
        if (n.includes('row machine') || n.includes('roeimachine') || n.includes('rower') || n.includes('concept2')) {
            return { exerciseType: 'duration', category: 'cardio' };
        }
        if (n.includes('plank') || n.includes('hold') || n.includes('wall sit') || n.includes('statisch') || n.includes('l-sit') || n.includes('hollow body') || n.includes('dead bug')) {
            return { exerciseType: 'duration', category: 'isometric' };
        }
        if (n.includes('hardlopen') || n.includes('running') || n.includes('fietsen') || n.includes('roeien') || n.includes('treadmill') || n.includes('crosstrainer') || n.includes('wandelen')) {
            return { exerciseType: 'duration', category: 'cardio' };
        }
        if (n.includes('pull-up') || n.includes('chin-up') || n.includes('push-up') || n.includes('dip') || n.includes('crunch') || n.includes('leg raise') || n.includes('bodyweight')) {
            return { exerciseType: 'bodyweight_reps', category: 'bodyweight' };
        }
        if (n.includes('curl') || n.includes('raise') || n.includes('fly') || n.includes('extension') || n.includes('kickback') || n.includes('pushdown')) {
            return { exerciseType: 'weight_reps', category: 'isolation' };
        }
        return { exerciseType: 'weight_reps', category: 'compound' };
    },

    handleExerciseNameInput(val) {
        if (this.isTypeManuallySelected) return;

        const detected = this.detectExerciseType(val);
        const typeSelect = document.getElementById('new-ex-type');
        const catSelect = document.getElementById('new-ex-category');
        const hintEl = document.getElementById('new-ex-type-hint');

        if (typeSelect && detected.exerciseType) {
            typeSelect.value = detected.exerciseType;
        }
        if (catSelect && detected.category) {
            catSelect.value = detected.category;
        }
        if (hintEl && val.trim()) {
            const selectedText = typeSelect.options[typeSelect.selectedIndex] ? typeSelect.options[typeSelect.selectedIndex].text.split(' (')[0] : '';
            hintEl.textContent = `💡 Automatisch herkend als: ${selectedText}`;
        } else if (hintEl) {
            hintEl.textContent = '';
        }
    },

    markTypeManuallySelected() {
        this.isTypeManuallySelected = true;
        const hintEl = document.getElementById('new-ex-type-hint');
        if (hintEl) hintEl.textContent = '✏️ Handmatig ingesteld';
    },

    renderExerciseLibrary() {
        const list = document.getElementById('exercise-library-list');
        if (!list) return;

        const searchInput = document.getElementById('library-search');
        const query = searchInput ? searchInput.value.toLowerCase().trim() : '';

        const allExercises = store.getExerciseLibrary();
        const filtered = allExercises.filter(ex => {
            if (!query) return true;
            const nameMatch = ex.name.toLowerCase().includes(query);
            const muscleMatch = (ex.muscleGroups || []).some(m => m.toLowerCase().includes(query));
            const typeMatch = (ex.exerciseType || '').toLowerCase().includes(query) || (ex.category || '').toLowerCase().includes(query);
            return nameMatch || muscleMatch || typeMatch;
        });

        if (filtered.length === 0) {
            list.innerHTML = '<p class="text-muted text-sm py-2">Geen oefeningen gevonden.</p>';
            return;
        }

        list.innerHTML = filtered.map(ex => {
            const safeName = this.escapeHTML(ex.name);
            const safeId = this.escapeHTML(ex.id);
            const musclesStr = (ex.muscleGroups || []).map(m => this.escapeHTML(m)).join(', ') || 'Algemeen';
            const typeBadge = ex.exerciseType === 'duration' ? 'Tijd / Sec' : (ex.exerciseType === 'bodyweight_reps' ? 'Lichaamsgewicht' : 'Gewicht & Reps');
            
            let actions = '';
            if (ex.isCustom) {
                actions = `
                    <div style="display:flex; align-items:center; gap:6px;">
                        <span class="material-icons-round" style="font-size:1.2rem; cursor:pointer; color:var(--text-muted);" onclick="app.showAddExerciseModal('${safeId}')" title="Bewerken">edit</span>
                        <span class="material-icons-round" style="font-size:1.2rem; cursor:pointer; color:#ff5252;" onclick="app.showDeleteModal('exercise', '${safeId}')" title="Verwijderen">delete_outline</span>
                    </div>
                `;
            } else {
                actions = `<span class="status-badge" style="padding:2px 6px; font-size:0.65rem; background:rgba(255,255,255,0.06); color:var(--text-muted);">Ingebouwd</span>`;
            }

            return `
                <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(0,0,0,0.03); padding:8px 12px; border-radius:8px;">
                    <div style="min-width:0; flex:1; margin-right:8px;">
                        <div style="font-weight:500; font-size:0.9rem; color:var(--text-primary);">${safeName}</div>
                        <div class="text-sm text-muted">${typeBadge} • ${musclesStr}</div>
                    </div>
                    ${actions}
                </div>
            `;
        }).join('');
    },

    showAddExerciseModal(editId = null) {
        this.editingExerciseId = editId;
        this.isTypeManuallySelected = false;

        const titleEl = document.getElementById('modal-add-exercise-title');
        const nameInput = document.getElementById('new-ex-name');
        const typeSelect = document.getElementById('new-ex-type');
        const catSelect = document.getElementById('new-ex-category');
        const idInput = document.getElementById('ex-edit-id');
        const hintEl = document.getElementById('new-ex-type-hint');

        if (idInput) idInput.value = editId || '';
        if (hintEl) hintEl.textContent = '';

        document.querySelectorAll('#new-ex-muscles input[type="checkbox"]').forEach(cb => cb.checked = false);

        if (editId) {
            if (titleEl) titleEl.textContent = "Oefening Bewerken";
            const all = store.getExerciseLibrary();
            const ex = all.find(e => e.id === editId);
            if (ex) {
                if (nameInput) nameInput.value = ex.name;
                if (typeSelect) typeSelect.value = ex.exerciseType || 'weight_reps';
                if (catSelect) catSelect.value = ex.category || 'compound';
                (ex.muscleGroups || []).forEach(m => {
                    const cb = document.querySelector(`#new-ex-muscles input[value="${m}"]`);
                    if (cb) cb.checked = true;
                });
                this.isTypeManuallySelected = true;
            }
        } else {
            if (titleEl) titleEl.textContent = "Oefening Toevoegen";
            if (nameInput) nameInput.value = '';
            if (typeSelect) typeSelect.value = 'weight_reps';
            if (catSelect) catSelect.value = 'compound';
        }

        const modal = document.getElementById('modal-add-exercise');
        if (modal) modal.classList.remove('hidden');
    },

    hideAddExerciseModal() {
        const modal = document.getElementById('modal-add-exercise');
        if (modal) modal.classList.add('hidden');
    },

    saveCustomExercise() {
        const nameInput = document.getElementById('new-ex-name');
        const typeSelect = document.getElementById('new-ex-type');
        const catSelect = document.getElementById('new-ex-category');
        const editId = document.getElementById('ex-edit-id') ? document.getElementById('ex-edit-id').value : null;

        const name = nameInput ? nameInput.value.trim() : '';
        if (!name) {
            this.showToast('Vul een naam in voor de oefening.', 'error');
            return;
        }

        const selectedMuscles = Array.from(document.querySelectorAll('#new-ex-muscles input[type="checkbox"]:checked')).map(cb => cb.value);
        const exerciseType = typeSelect ? typeSelect.value : 'weight_reps';
        const category = catSelect ? catSelect.value : 'compound';

        const trackMetrics = (exerciseType === 'duration' || category === 'isometric')
            ? ['duration_seconds']
            : (exerciseType === 'bodyweight_reps' ? ['reps'] : ['weight', 'reps']);

        const exData = {
            name,
            muscleGroups: selectedMuscles,
            exerciseType,
            trackMetrics,
            category
        };

        if (editId) {
            store.updateCustomExercise(editId, exData);
            this.showToast('Oefening bijgewerkt!', 'success');
        } else {
            store.addCustomExercise(exData);
            this.showToast('Oefening opgeslagen in je bibliotheek!', 'success');
        }

        this.hideAddExerciseModal();
        this.renderExerciseLibrary();

        if (document.getElementById('modal-select-exercise-for-workout') && !document.getElementById('modal-select-exercise-for-workout').classList.contains('hidden')) {
            this.renderWorkoutExerciseSelectList();
        }
    },

    showSelectExerciseForWorkoutModal() {
        this.exerciseSelectTarget = 'activeWorkout';
        this.selectedWorkoutEx = null;
        const configPanel = document.getElementById('workout-ex-configure');
        if (configPanel) configPanel.classList.add('hidden');
        
        const searchInput = document.getElementById('workout-ex-search');
        if (searchInput) searchInput.value = '';

        this.renderWorkoutExerciseSelectList();

        const modal = document.getElementById('modal-select-exercise-for-workout');
        if (modal) modal.classList.remove('hidden');
    },

    showSelectExerciseForEditLogModal() {
        this.exerciseSelectTarget = 'editLog';
        this.selectedWorkoutEx = null;
        const configPanel = document.getElementById('workout-ex-configure');
        if (configPanel) configPanel.classList.add('hidden');
        
        const searchInput = document.getElementById('workout-ex-search');
        if (searchInput) searchInput.value = '';

        this.renderWorkoutExerciseSelectList();

        const modal = document.getElementById('modal-select-exercise-for-workout');
        if (modal) modal.classList.remove('hidden');
    },

    hideSelectExerciseForWorkoutModal() {
        const modal = document.getElementById('modal-select-exercise-for-workout');
        if (modal) modal.classList.add('hidden');
    },

    showAddExerciseModalFromWorkout() {
        this.showAddExerciseModal();
    },

    renderWorkoutExerciseSelectList() {
        const container = document.getElementById('workout-ex-select-list');
        if (!container) return;

        const searchInput = document.getElementById('workout-ex-search');
        const query = searchInput ? searchInput.value.toLowerCase().trim() : '';

        const allExercises = store.getExerciseLibrary();
        const filtered = allExercises.filter(ex => {
            if (!query) return true;
            const nameMatch = ex.name.toLowerCase().includes(query);
            const muscleMatch = (ex.muscleGroups || []).some(m => m.toLowerCase().includes(query));
            return nameMatch || muscleMatch;
        });

        if (filtered.length === 0) {
            container.innerHTML = `
                <div class="text-muted text-sm text-center py-3">
                    Geen oefening gevonden.<br>
                    <button class="btn-secondary mt-2" onclick="app.showAddExerciseModalFromWorkout()">+ Maak '${app.escapeHTML(query)}' aan</button>
                </div>
            `;
            return;
        }

        container.innerHTML = filtered.map(ex => {
            const safeName = this.escapeHTML(ex.name);
            const safeId = this.escapeHTML(ex.id);
            const musclesStr = (ex.muscleGroups || []).map(m => this.escapeHTML(m)).join(', ') || 'Algemeen';
            const typeBadge = ex.exerciseType === 'duration' ? 'Tijd' : (ex.exerciseType === 'bodyweight_reps' ? 'Bodyweight' : 'Kracht');
            const isSelected = this.selectedWorkoutEx && this.selectedWorkoutEx.id === ex.id;
            const borderStyle = isSelected ? 'border: 2px solid var(--accent-color);' : '';

            return `
                <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(0,0,0,0.05); padding:10px 12px; border-radius:10px; cursor:pointer; ${borderStyle}" onclick="app.selectExerciseForWorkout('${safeId}')">
                    <div style="min-width:0; flex:1;">
                        <div style="font-weight:600; font-size:0.9rem;">${safeName}</div>
                        <div class="text-sm text-muted">${typeBadge} • ${musclesStr}</div>
                    </div>
                    <button class="btn-secondary" style="padding:4px 10px; font-size:0.8rem; pointer-events:none;">Kies</button>
                </div>
            `;
        }).join('');
    },

    selectExerciseForWorkout(exId) {
        const all = store.getExerciseLibrary();
        const ex = all.find(e => e.id === exId);
        if (!ex) return;

        this.selectedWorkoutEx = ex;

        const displayEl = document.getElementById('selected-ex-name-display');
        const repsLabel = document.getElementById('workout-ex-reps-label');
        const repsInput = document.getElementById('workout-ex-reps');
        const configPanel = document.getElementById('workout-ex-configure');

        if (displayEl) displayEl.textContent = ex.name;

        const defaultSets = (ex.defaultSets !== undefined && ex.defaultSets !== null) ? ex.defaultSets : (ex.name && ex.name.toLowerCase().includes('row machine') ? 1 : 3);
        const setsInput = document.getElementById('workout-ex-sets');
        if (setsInput) setsInput.value = String(defaultSets);

        if (ex.exerciseType === 'duration') {
            if (repsLabel) repsLabel.textContent = "Standaard Duur (sec)";
            if (repsInput) repsInput.value = "300";
        } else {
            if (repsLabel) repsLabel.textContent = "Standaard Reps";
            if (repsInput) repsInput.value = "10";
        }

        if (configPanel) configPanel.classList.remove('hidden');

        this.renderWorkoutExerciseSelectList();
    },

    confirmAddExerciseToWorkout() {
        if (!this.selectedWorkoutEx) return;

        const setsInput = document.getElementById('workout-ex-sets');
        const repsInput = document.getElementById('workout-ex-reps');

        const defaultSets = (this.selectedWorkoutEx.defaultSets !== undefined && this.selectedWorkoutEx.defaultSets !== null) ? this.selectedWorkoutEx.defaultSets : (this.selectedWorkoutEx.name && this.selectedWorkoutEx.name.toLowerCase().includes('row machine') ? 1 : 3);
        const setsCount = Math.max(1, parseInt(setsInput ? setsInput.value : String(defaultSets), 10) || defaultSets);
        const defaultReps = repsInput ? repsInput.value.trim() : '10';

        if (this.exerciseSelectTarget === 'editLog') {
            this.addExerciseToEditLog(this.selectedWorkoutEx, setsCount, defaultReps);
        } else {
            this.addExerciseToActiveWorkout(this.selectedWorkoutEx, setsCount, defaultReps);
        }

        this.hideSelectExerciseForWorkoutModal();
    },

    addExerciseToActiveWorkout(exerciseData, setsCount = null, defaultReps = '10') {
        if (!this.activeWorkout) return;
        if (!this.activeWorkout.exercises) this.activeWorkout.exercises = [];

        const determinedSets = (setsCount !== null && setsCount !== undefined)
            ? setsCount
            : ((exerciseData && exerciseData.defaultSets !== undefined && exerciseData.defaultSets !== null)
                ? exerciseData.defaultSets
                : ((exerciseData && exerciseData.name && exerciseData.name.toLowerCase().includes('row machine')) ? 1 : 3));

        let trackMetrics = exerciseData.trackMetrics;
        if (!trackMetrics) {
            if (exerciseData.exerciseType === 'duration') trackMetrics = ['duration_seconds'];
            else if (exerciseData.exerciseType === 'bodyweight_reps') trackMetrics = ['reps'];
            else trackMetrics = ['weight', 'reps'];
        }

        const exObj = {
            id: 'ex_' + Math.random().toString(36).slice(2, 11),
            name: exerciseData.name,
            muscleGroups: exerciseData.muscleGroups || [],
            exerciseType: exerciseData.exerciseType || 'weight_reps',
            trackMetrics: trackMetrics,
            category: exerciseData.category || 'custom',
            sets: determinedSets,
            reps: defaultReps,
            setsCompleted: Array(determinedSets).fill(false),
            weights: Array(determinedSets).fill(''),
            actualReps: Array(determinedSets).fill(''),
            levels: Array(determinedSets).fill('')
        };

        this.activeWorkout.exercises.push(exObj);
        store.saveActiveWorkoutState(this.activeWorkout);
        this.renderWorkoutExercises();
        this.showToast(`${exerciseData.name} toegevoegd aan sessie!`, 'success');
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

    startWorkout(session, planOverride = null) {
        const plan = planOverride || store.getActivePlan();
        if (planOverride && store.activePlanId !== planOverride.id) {
            store.activePlanId = planOverride.id;
            store.save();
        }
        this.activeWorkout = {
            planId: plan ? plan.id : null,
            planName: plan ? plan.name : 'Overige Sessies',
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

    startWorkoutBySessionId(planId, sessionId) {
        const plan = store.plans.find(p => p.id === planId);
        if (!plan) return;
        const session = (plan.sessions || []).find(s => (s.id || s.sessionId) === sessionId);
        if (!session) return;
        this.startWorkout(session, plan);
    },

    // Opent de workout-view voor de actieve workout (zowel starten als hervatten)
    openWorkoutView() {
        const titleEl = document.getElementById('workout-title');
        if (titleEl && this.activeWorkout && this.activeWorkout.session) {
            titleEl.textContent = this.activeWorkout.session.name;
        }
        this.renderWorkoutExercises();

        const finishBtn = document.getElementById('btn-finish-workout');
        if (finishBtn) finishBtn.onclick = () => this.showFinishModal();

        const bottomNav = document.getElementById('bottom-nav');
        if (bottomNav) bottomNav.classList.add('hidden');

        const viewWorkout = document.getElementById('view-workout');
        if (viewWorkout) {
            const stickyFooter = viewWorkout.querySelector('.sticky-footer');
            if (stickyFooter) stickyFooter.style.bottom = '0';
        }

        this.requestWakeLock();
        this.navigate('workout');
    },

    extractExerciseNameTokens(input, exObj = null) {
        const tokens = new Set();
        
        const processStr = (str) => {
            if (!str || typeof str !== 'string') return;
            const raw = str.toLowerCase().trim();
            if (!raw) return;
            tokens.add(raw);

            // Strip quotes/punctuation
            const cleanPunct = raw.replace(/['"`]/g, '');
            tokens.add(cleanPunct);

            // Extract content inside parentheses e.g. "Row Machine (Roeimachine)" -> "roeimachine" & "row machine"
            const parenRegex = /\(([^)]+)\)/g;
            let match;
            while ((match = parenRegex.exec(raw)) !== null) {
                if (match[1] && match[1].trim()) {
                    tokens.add(match[1].trim());
                }
            }
            const withoutParen = raw.replace(/\([^)]*\)/g, ' ').replace(/\s+/g, ' ').trim();
            if (withoutParen) tokens.add(withoutParen);

            // Split by separators: " of ", "/", " or ", ",", "&", "+", " - "
            const splitRegex = /(\s+of\s+|\s*\/\s*|\s+or\s+|\s*,\s*|\s*&\s*|\s*\+\s*|\s+-\s+)/i;
            const currentList = Array.from(tokens);
            currentList.forEach(s => {
                const parts = s.split(splitRegex);
                parts.forEach(p => {
                    const t = p.trim();
                    if (t && !['of', '/', 'or', ',', '&', '+', '-'].includes(t)) {
                        tokens.add(t);
                    }
                });
            });

            // Strip equipment/modifier prefixes
            const modifiers = ['barbell', 'dumbbell', 'cable', 'machine', 'seated', 'lying', 'standing', 'single-arm', 'single arm', 'kettlebell'];
            Array.from(tokens).forEach(s => {
                modifiers.forEach(mod => {
                    if (s.startsWith(mod + ' ')) {
                        const stripped = s.slice(mod.length + 1).trim();
                        if (stripped.length > 2) tokens.add(stripped);
                    }
                });
                if (s.includes('-')) {
                    tokens.add(s.replace(/-/g, ' ').replace(/\s+/g, ' ').trim());
                    tokens.add(s.replace(/-/g, '').trim());
                }
            });
        };

        if (typeof input === 'string') processStr(input);
        else if (input && typeof input === 'object') exObj = input;

        if (exObj) {
            const variations = this.getExerciseVariations(exObj);
            // Als er meerdere variaties mogelijk zijn (bijv. "Goblet Squat of Leg Press"),
            // tonen we pas historie zodra de gebruiker expliciet een variatie kiest!
            if (variations && variations.length > 1) {
                if (exObj.chosenVariation && String(exObj.chosenVariation).trim() !== '') {
                    processStr(exObj.chosenVariation);
                } else {
                    return tokens; // Lege set -> wacht op variatieselectie
                }
            } else {
                if (exObj.chosenVariation && String(exObj.chosenVariation).trim() !== '') {
                    processStr(exObj.chosenVariation);
                }
                if (exObj.name) processStr(exObj.name);
                if (exObj.originalName) processStr(exObj.originalName);
                if (Array.isArray(exObj.alternatives)) exObj.alternatives.forEach(processStr);
                if (Array.isArray(exObj.optionalAlternatives)) exObj.optionalAlternatives.forEach(processStr);
                if (Array.isArray(exObj.availableVariations)) exObj.availableVariations.forEach(processStr);
            }
        }

        return tokens;
    },

    getPreviousExerciseDetails(exerciseName, exObj = null) {
        if (!exerciseName && !exObj) return null;
        const targetTokens = this.extractExerciseNameTokens(exerciseName, exObj);
        if (targetTokens.size === 0) return null;

        const isNonEmpty = val => val !== null && val !== undefined && String(val).trim() !== '';

        for (let i = store.logs.length - 1; i >= 0; i--) {
            const log = store.logs[i];
            if (!log || !log.exercises) continue;
            
            const matchedEx = log.exercises.find(e => {
                if (!e || !e.name) return false;
                const logTokens = this.extractExerciseNameTokens(e.name, e);
                for (const t of logTokens) {
                    if (targetTokens.has(t)) return true;
                }
                return false;
            });

            if (matchedEx && matchedEx.details && matchedEx.details.length > 0) {
                const hasData = matchedEx.details.some(d => isNonEmpty(d.weight) || isNonEmpty(d.reps) || isNonEmpty(d.level));
                if (hasData) {
                    return matchedEx.details;
                }
            }
        }
        return null;
    },

    formatPreviousDetailsSummary(prevDetails) {
        if (!prevDetails || !Array.isArray(prevDetails) || prevDetails.length === 0) return null;
        const parts = prevDetails.map(d => {
            if (!d) return null;
            const w = (d.weight !== undefined && d.weight !== null && String(d.weight).trim() !== '') ? `${this.escapeHTML(String(d.weight))}kg` : '';
            const r = (d.reps !== undefined && d.reps !== null && String(d.reps).trim() !== '') ? `${this.escapeHTML(String(d.reps))} reps` : '';
            const l = (d.level !== undefined && d.level !== null && String(d.level).trim() !== '') ? `stand ${this.escapeHTML(String(d.level))}` : '';
            const combined = [w, r, l].filter(Boolean).join(' × ');
            return combined;
        }).filter(Boolean);

        if (parts.length === 0) return null;

        const first = parts[0];
        const allSame = parts.every(p => p === first);
        if (allSame && parts.length > 1) {
            return `${parts.length}× (${first})`;
        }
        return parts.join(' • ');
    },

    showExerciseHistoryModal(exerciseName) {
        const modal = document.getElementById('modal-exercise-history');
        const container = document.getElementById('exercise-history-modal-content');
        const titleEl = document.getElementById('exercise-history-modal-title');
        if (!modal || !container) return;

        const safeName = this.escapeHTML(exerciseName);
        if (titleEl) titleEl.textContent = `Geschiedenis: ${exerciseName}`;

        const targetTokens = this.extractExerciseNameTokens(exerciseName);
        const entries = [];

        for (let i = store.logs.length - 1; i >= 0; i--) {
            const log = store.logs[i];
            if (!log || !log.exercises) continue;

            const matchedEx = log.exercises.find(e => {
                if (!e || !e.name) return false;
                const logTokens = this.extractExerciseNameTokens(e.name, e);
                for (const t of logTokens) {
                    if (targetTokens.has(t)) return true;
                }
                return false;
            });

            if (matchedEx && matchedEx.details && matchedEx.details.length > 0) {
                const hasData = matchedEx.details.some(d => (d.weight && String(d.weight).trim() !== '') || (d.reps && String(d.reps).trim() !== '') || (d.level && String(d.level).trim() !== ''));
                if (hasData) {
                    entries.push({
                        date: log.date,
                        sessionName: log.sessionName || 'Sessie',
                        planName: log.planName || '',
                        matchedName: matchedEx.name,
                        details: matchedEx.details
                    });
                }
            }
        }

        if (entries.length === 0) {
            container.innerHTML = `<p class="text-muted text-sm text-center py-4">Nog geen gelogde trainingen gevonden voor ${safeName}.</p>`;
        } else {
            let html = '';
            entries.forEach(entry => {
                const dateFormatted = entry.date ? app.formatShortDate(entry.date) : 'Onbekende datum';
                const detailStr = entry.details.map((d, idx) => {
                    const parts = [];
                    if (d.weight && String(d.weight).trim() !== '') parts.push(`${app.escapeHTML(String(d.weight))} kg`);
                    if (d.reps && String(d.reps).trim() !== '') parts.push(`${app.escapeHTML(String(d.reps))} reps`);
                    if (d.level && String(d.level).trim() !== '') parts.push(`stand ${app.escapeHTML(String(d.level))}`);
                    return `<div class="text-sm" style="display:flex; justify-content:space-between; padding:3px 0; border-bottom:1px solid rgba(255,255,255,0.05);">
                        <span class="text-muted">Set ${d.setNumber || (idx + 1)}:</span>
                        <span style="font-weight:500;">${parts.join(' × ')}</span>
                    </div>`;
                }).join('');

                html += `
                    <div class="glass-panel" style="padding:12px; margin-bottom:8px; background:rgba(255,255,255,0.03); border-radius:10px;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                            <span style="font-weight:600; font-size:0.9rem; color:var(--text-primary);">${app.escapeHTML(dateFormatted)}</span>
                            <span class="status-badge" style="font-size:0.75rem; padding:2px 8px;">${app.escapeHTML(entry.sessionName)}</span>
                        </div>
                        <div class="flex-col gap-1 mt-1">
                            ${detailStr}
                        </div>
                    </div>
                `;
            });
            container.innerHTML = html;
        }

        modal.classList.remove('hidden');
    },

    hideExerciseHistoryModal() {
        const modal = document.getElementById('modal-exercise-history');
        if (modal) modal.classList.add('hidden');
    },

    getRealisticIncrement(ex, plan) {
        if (!ex) return 2.5;

        if (typeof ex.weightIncrement === 'number' && ex.weightIncrement > 0) {
            return ex.weightIncrement;
        }
        if (ex.progressionRuleOverride && typeof ex.progressionRuleOverride.weightIncrement === 'number' && ex.progressionRuleOverride.weightIncrement > 0) {
            return ex.progressionRuleOverride.weightIncrement;
        }

        const name = (ex.name || '').toLowerCase().trim();
        const equipmentStr = Array.isArray(ex.equipment) ? ex.equipment.join(' ').toLowerCase() : (typeof ex.equipment === 'string' ? ex.equipment.toLowerCase() : '');
        const fullText = `${name} ${equipmentStr}`;
        const category = (ex.category || '').toLowerCase();
        const groups = (ex.muscleGroups || []).map(mg => this.normalizeMuscleGroup ? this.normalizeMuscleGroup(mg) : mg);
        const isLowerBody = groups.includes('legs') || groups.includes('glutes');

        const isDumbbell = fullText.includes('dumbbell') || fullText.includes(' db') || fullText.includes('kettlebell') || fullText.includes(' kb');
        const isBarbell = fullText.includes('barbell') || fullText.includes('bench press') || fullText.includes('squat') || fullText.includes('deadlift') || fullText.includes('halterschijf');
        const isIsolation = category === 'isolation' || category === 'supporting' ||
            fullText.includes('curl') || fullText.includes('raise') || fullText.includes('fly') || fullText.includes('flye') || fullText.includes('extension') || fullText.includes('kickback') || fullText.includes('pushdown');

        const guidance = plan && plan.progressionRules && plan.progressionRules.weightIncreaseGuidance;
        let planGuidance = null;
        if (guidance) {
            const g = isLowerBody ? guidance.lowerBodyKg : guidance.upperBodyKg;
            if (typeof g === 'number' && g > 0) planGuidance = g;
        }

        if (isDumbbell) {
            if (isLowerBody) {
                return planGuidance ? Math.min(planGuidance, 2.0) : 2.0;
            }
            return planGuidance ? Math.min(planGuidance, 1.0) : 1.0;
        }

        if (isIsolation) {
            if (isLowerBody) {
                return planGuidance ? Math.min(planGuidance, 2.0) : 2.0;
            }
            return planGuidance ? Math.min(planGuidance, 1.0) : 1.0;
        }

        if (isLowerBody) {
            return planGuidance ? planGuidance : 2.5;
        }

        return planGuidance ? planGuidance : 2.5;
    },

    // Advies voor progressive overload: vorige sessie alle sets (met gewicht) aan de
    // bovenkant van de herhalingsrange gehaald? Stel dan een licht hoger gewicht voor.
    getOverloadSuggestion(ex, prevDetails, plan) {
        if (!prevDetails || prevDetails.length === 0 || !ex.repsMax) return null;

        // Alleen adviseren als de vorige sessie alle geplande sets heeft afgerond;
        // 1 van de 3 sets aan de bovenkant halen is geen reden om zwaarder te gaan
        if (ex.sets && prevDetails.length < ex.sets) return null;

        let maxWeight = 0;
        let minWeight = Infinity;
        for (const d of prevDetails) {
            const reps = parseInt(d.reps);
            const weight = parseFloat(d.weight);
            if (!(weight > 0) || !(reps >= ex.repsMax)) return null;
            if (weight > maxWeight) maxWeight = weight;
            if (weight < minWeight) minWeight = weight;
        }

        if (minWeight === Infinity) return null;

        const increment = this.getRealisticIncrement(ex, plan);
        const allSameWeight = (minWeight === maxWeight);
        const newWeight = Math.round((maxWeight + increment) * 10) / 10;

        return {
            prevWeight: maxWeight,
            maxWeight: maxWeight,
            minWeight: minWeight,
            allSameWeight: allSameWeight,
            newWeight: newWeight,
            increment: increment
        };
    },

    renderWorkoutExercises() {
        const list = document.getElementById('workout-exercise-list');
        if (!list) return;
        list.innerHTML = '';
        
        if (this.activeWorkout.session && this.activeWorkout.session.warmup) {
            const warmupEl = document.createElement('div');
            warmupEl.className = 'glass-panel';
            warmupEl.style.padding = '12px 16px';
            warmupEl.innerHTML = this.formatRichField(this.activeWorkout.session.warmup, 'WARM-UP');
            list.appendChild(warmupEl);
        }

        const sortedExercises = [...(this.activeWorkout.exercises || [])].sort((a, b) => (a.order || 99) - (b.order || 99));

        if (sortedExercises.length === 0) {
            const emptyCard = document.createElement('div');
            emptyCard.className = 'glass-panel text-center';
            emptyCard.style.padding = '32px 16px';
            emptyCard.innerHTML = `
                <div class="stat-icon-wrapper" style="margin: 0 auto 12px auto; width: 56px; height: 56px; background: rgba(59, 130, 246, 0.1); color: var(--accent-color);">
                    <span class="material-icons-round" style="font-size: 28px; display:flex; align-items:center; justify-content:center; width:100%; height:100%;">fitness_center</span>
                </div>
                <h3 style="color:var(--text-primary); text-transform:none; font-size:1.1rem;">Vrije Sessie Gestart</h3>
                <p class="text-sm text-muted mt-1">Voeg je eerste oefening toe om te beginnen met trainen.</p>
                <button class="btn-primary mt-4" style="padding:10px 20px; font-size:0.9rem;" onclick="app.showSelectExerciseForWorkoutModal()">
                    <span class="material-icons-round" style="vertical-align:-3px;">add</span> Oefening Toevoegen
                </button>
            `;
            list.appendChild(emptyCard);
            return;
        }

        sortedExercises.forEach((ex) => {
            const exIndex = this.activeWorkout.exercises.findIndex(e => e.id === ex.id);
            const prevDetails = this.getPreviousExerciseDetails(ex.name, ex) || [];

            if (!ex.setsCompleted) ex.setsCompleted = Array(ex.sets || 1).fill(false);
            if (!ex.weights) ex.weights = Array(ex.sets || 1).fill('');
            if (!ex.actualReps) ex.actualReps = Array(ex.sets || 1).fill('');

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
                const altLinks = ex.alternatives.map(a => app.formatClickableExerciseName(a)).join(', ');
                notesHtml += `<div class="text-sm text-muted mt-2"><strong>Alternatieven:</strong> ${altLinks}</div>`;
            } else if (ex.optionalAlternatives && ex.optionalAlternatives.length > 0) {
                const altLinks = ex.optionalAlternatives.map(a => app.formatClickableExerciseName(a)).join(', ');
                notesHtml += `<div class="text-sm text-muted mt-2"><strong>Alternatieven:</strong> ${altLinks}</div>`;
            }

            // Progressive-overload-advies op basis van de vorige sessie
            const overload = app.getOverloadSuggestion(ex, prevDetails, store.getActivePlan());
            if (overload) {
                let hintText = '';
                if (overload.allSameWeight) {
                    hintText = `Vorige keer alle sets op ${app.escapeHTML(String(ex.repsMax))} reps met ${app.escapeHTML(String(overload.maxWeight))} kg. Probeer nu ${app.escapeHTML(String(overload.newWeight))} kg.`;
                } else {
                    hintText = `Vorige keer alle sets op ${app.escapeHTML(String(ex.repsMax))} reps (${app.escapeHTML(String(overload.minWeight))}-${app.escapeHTML(String(overload.maxWeight))} kg). Probeer nu ${app.escapeHTML(String(overload.newWeight))} kg op je zwaarste set.`;
                }
                notesHtml += `<div class="text-sm mt-2 progression-hint"><span class="material-icons-round" style="font-size:1rem; vertical-align:-3px;">trending_up</span> ${hintText}</div>`;
            }

            const isHold = app.isHoldExercise(ex);

            let delayBarHtml = '';
            if (isHold) {
                const currentDelay = (typeof store !== 'undefined' && typeof store.holdTimerDelaySeconds === 'number') ? store.holdTimerDelaySeconds : 3;
                delayBarHtml = `
                    <div class="hold-delay-bar">
                        <span class="text-sm text-muted" style="font-weight:500;">Startvertraging:</span>
                        <div class="delay-pills">
                            <button class="delay-pill ${currentDelay === 1 ? 'active' : ''}" onclick="app.setHoldTimerDelay(1)">1s</button>
                            <button class="delay-pill ${currentDelay === 2 ? 'active' : ''}" onclick="app.setHoldTimerDelay(2)">2s</button>
                            <button class="delay-pill ${currentDelay === 3 ? 'active' : ''}" onclick="app.setHoldTimerDelay(3)">3s</button>
                            <button class="delay-pill ${currentDelay === 5 ? 'active' : ''}" onclick="app.setHoldTimerDelay(5)">5s</button>
                        </div>
                    </div>
                `;
            }

            let setsHtml = '';
            for(let i=0; i<ex.sets; i++) {
                const checked = ex.setsCompleted[i] ? 'checked' : '';
                
                const prevSet = (prevDetails[i] && (prevDetails[i].weight || prevDetails[i].reps)) ? prevDetails[i] : (prevDetails[0] || {});
                const weightPlaceholder = prevSet.weight || (prevDetails[0] ? prevDetails[0].weight : '') || 'kg';
                const repsPlaceholder = prevSet.reps || (prevDetails[0] ? prevDetails[0].reps : '') || 'reps';

                // TrackMetrics check for dynamic inputs
                const wantsWeight = ex.trackMetrics ? ex.trackMetrics.includes('weight') : true;
                let wantsReps = ex.trackMetrics ? ex.trackMetrics.includes('reps') : false;
                let wantsDuration = (ex.trackMetrics ? ex.trackMetrics.includes('duration_seconds') : false) || isHold;
                const wantsLevel = (ex.trackMetrics ? (ex.trackMetrics.includes('level') || ex.trackMetrics.includes('stand')) : false) || ex.name.toLowerCase().includes('row machine') || ex.name.toLowerCase().includes('roeimachine');

                if (!wantsReps && !wantsDuration) {
                    wantsReps = true;
                }
                
                let inputsHtml = '';
                if (wantsWeight) {
                    inputsHtml += `<input type="number" class="weight-input" placeholder="${app.escapeHTML(String(weightPlaceholder))}"
                        inputmode="decimal" enterkeyhint="next"
                        data-ex="${exIndex}" data-set="${i}" data-type="weight"
                        value="${app.escapeHTML(String(ex.weights ? ex.weights[i] : ''))}"
                        oninput="app.updateWeight(${exIndex}, ${i}, this.value)"
                        onchange="app.updateWeight(${exIndex}, ${i}, this.value, true)"
                        onkeydown="if(event.key==='Enter'){event.preventDefault();app.handleInputEnter(event, ${exIndex}, ${i}, 'weight');}">`;
                }
                if (wantsReps && !isHold) {
                    inputsHtml += `<input type="number" class="weight-input" placeholder="${app.escapeHTML(String(repsPlaceholder))}" style="width: 55px;"
                        inputmode="decimal" enterkeyhint="next"
                        data-ex="${exIndex}" data-set="${i}" data-type="reps"
                        value="${app.escapeHTML(String(ex.actualReps ? ex.actualReps[i] : ''))}"
                        oninput="app.updateReps(${exIndex}, ${i}, this.value)"
                        onchange="app.updateReps(${exIndex}, ${i}, this.value, true)"
                        onkeydown="if(event.key==='Enter'){event.preventDefault();app.handleInputEnter(event, ${exIndex}, ${i}, 'reps');}">`;
                }
                if (wantsDuration || isHold) {
                     inputsHtml += `<input type="number" class="weight-input" placeholder="sec" style="width: 55px;"
                        inputmode="decimal" enterkeyhint="next"
                        data-ex="${exIndex}" data-set="${i}" data-type="reps"
                        value="${app.escapeHTML(String(ex.actualReps ? ex.actualReps[i] : ''))}"
                        oninput="app.updateReps(${exIndex}, ${i}, this.value)"
                        onchange="app.updateReps(${exIndex}, ${i}, this.value, true)"
                        onkeydown="if(event.key==='Enter'){event.preventDefault();app.handleInputEnter(event, ${exIndex}, ${i}, 'reps');}">`;

                     inputsHtml += `
                        <div class="step-btn-group">
                            <button class="step-btn" onclick="app.adjustDuration(${exIndex}, ${i}, -1)" title="-1 sec">-</button>
                            <button class="step-btn" onclick="app.adjustDuration(${exIndex}, ${i}, 1)" title="+1 sec">+</button>
                            <button class="step-btn" onclick="app.startHoldTimer(${exIndex}, ${i})" title="Start timer voor Set ${i+1}">
                                <span class="material-icons-round" style="font-size:0.9rem;">timer</span>
                            </button>
                        </div>
                     `;
                }
                if (wantsLevel) {
                    const levelPlaceholder = prevSet.level || 'stand';
                    inputsHtml += `<input type="text" class="weight-input" placeholder="${app.escapeHTML(String(levelPlaceholder))}" style="width: 65px;"
                        inputmode="text" enterkeyhint="next"
                        data-ex="${exIndex}" data-set="${i}" data-type="level"
                        value="${app.escapeHTML(String(ex.levels ? ex.levels[i] : ''))}"
                        oninput="app.updateLevel(${exIndex}, ${i}, this.value)"
                        onchange="app.updateLevel(${exIndex}, ${i}, this.value, true)"
                        onkeydown="if(event.key==='Enter'){event.preventDefault();app.handleInputEnter(event, ${exIndex}, ${i}, 'level');}">`;
                }

                const removeSetBtn = ex.sets > 1 ? `
                    <button class="btn-icon" style="background:none; border:none; padding:2px 4px; cursor:pointer; color:var(--text-muted); opacity:0.6;" onclick="app.removeSetFromExercise(${exIndex}, ${i})" title="Set ${i+1} verwijderen">
                        <span class="material-icons-round" style="font-size:1.1rem; vertical-align:middle;">remove_circle_outline</span>
                    </button>
                ` : '';

                setsHtml += `
                    <div class="set-row">
                        <div class="set-info text-muted" style="display:flex; align-items:center; gap:4px;">
                            ${removeSetBtn}
                            <span>Set ${i+1}</span>
                        </div>
                        <div class="set-actions">
                            ${inputsHtml}
                            <button class="check-btn ${checked}" onclick="app.toggleSet(${exIndex}, ${i})">
                                <span class="material-icons-round">check</span>
                            </button>
                        </div>
                    </div>
                `;
            }

            const addSetControlsHtml = `
                <div style="display:flex; justify-content:flex-start; margin-top:10px; padding-top:8px; border-top:1px dashed rgba(255,255,255,0.1);">
                    <button class="btn-secondary" style="padding:4px 10px; font-size:0.8rem; display:flex; align-items:center; gap:4px;" onclick="app.addSetToExercise(${exIndex})">
                        <span class="material-icons-round" style="font-size:1rem;">add</span> Set Toevoegen
                    </button>
                </div>
            `;

            let singleHoldTimerHtml = '';
            if (isHold) {
                const isTiming = app.holdTimerState && app.holdTimerState.exIndex === exIndex;
                let activeSetIdx = app.holdTimerState ? app.holdTimerState.setIndex : null;
                if (activeSetIdx === null || typeof activeSetIdx !== 'number') {
                    const firstUncompleted = (ex.setsCompleted && Array.isArray(ex.setsCompleted)) ? ex.setsCompleted.findIndex(c => !c) : -1;
                    activeSetIdx = firstUncompleted !== -1 ? firstUncompleted : Math.max(0, (ex.sets || 1) - 1);
                }

                if (isTiming) {
                    if (app.holdTimerState.status === 'delay') {
                        const elapsedDelay = (Date.now() - app.holdTimerState.delayStartTime) / 1000;
                        const remaining = Math.max(0, Math.ceil(app.holdTimerState.delaySeconds - elapsedDelay));
                        singleHoldTimerHtml = `
                            <div class="hold-timer-container">
                                <button id="hold-timer-btn-${exIndex}" class="hold-timer-btn starting" onclick="app.stopHoldTimer(false)">
                                    <span class="material-icons-round">hourglass_top</span> Klaar in ${remaining}s... (Set ${activeSetIdx + 1})
                                </button>
                            </div>
                        `;
                    } else {
                        const elapsedSec = Math.floor((Date.now() - app.holdTimerState.startTime) / 1000);
                        const mins = Math.floor(elapsedSec / 60);
                        const secs = elapsedSec % 60;
                        const timeStr = mins > 0 ? `${mins}:${String(secs).padStart(2, '0')}` : `${secs}s`;
                        singleHoldTimerHtml = `
                            <div class="hold-timer-container">
                                <button id="hold-timer-btn-${exIndex}" class="hold-timer-btn running" onclick="app.stopHoldTimer(true)">
                                    <span class="material-icons-round">stop</span> ${timeStr} Stop (Set ${activeSetIdx + 1})
                                </button>
                            </div>
                        `;
                    }
                } else {
                    singleHoldTimerHtml = `
                        <div class="hold-timer-container">
                            <button id="hold-timer-btn-${exIndex}" class="hold-timer-btn" onclick="app.startHoldTimer(${exIndex}, ${activeSetIdx})">
                                <span class="material-icons-round">timer</span> Start hold (Set ${activeSetIdx + 1})
                            </button>
                        </div>
                    `;
                }
            }
            
            // --- Variation Pill Selector ---
            let variationHtml = '';
            const variations = app.getExerciseVariations(ex);
            if (variations.length > 1) {
                const chosen = ex.chosenVariation || '';
                variationHtml = `<div class="variation-selector">`;
                variations.forEach(v => {
                    const isActive = chosen === v;
                    const safeV = app.escapeHTML(v);
                    variationHtml += `<button class="variation-pill ${isActive ? 'active' : ''}" data-variation="${safeV}" onclick="app.selectVariation(${exIndex}, this.dataset.variation)"><span class="material-icons-round" style="font-size:0.85rem;">${isActive ? 'check_circle' : 'radio_button_unchecked'}</span> ${safeV}</button>`;
                });
                variationHtml += `</div>`;
            }

            // Formatteer de vorige prestatie als een duidelijke samenvattingsbalk
            let prevSummaryHtml = '';
            const prevSummaryText = app.formatPreviousDetailsSummary(prevDetails);
            const chosenName = ex.chosenVariation || '';
            const safeExName = app.escapeHTML(chosenName || ex.name);
            const varLabel = chosenName ? ` (${app.escapeHTML(chosenName)})` : '';

            if (variations && variations.length > 1 && !chosenName) {
                prevSummaryHtml = `
                    <div class="text-sm mt-2" style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:6px; background:rgba(255,255,255,0.04); padding:6px 10px; border-radius:8px; border:1px dashed rgba(255,255,255,0.15);">
                        <div style="display:flex; align-items:center; gap:6px; color:var(--text-muted); font-size:0.85rem;">
                            <span class="material-icons-round" style="font-size:1rem; color:var(--accent-color);">touch_app</span>
                            <span>Kies een variatie hierboven om de historie en gewichten te zien</span>
                        </div>
                    </div>
                `;
            } else if (prevSummaryText) {
                prevSummaryHtml = `
                    <div class="text-sm mt-2" style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:6px; background:rgba(255,255,255,0.06); padding:6px 10px; border-radius:8px; border:1px solid rgba(255,255,255,0.1);">
                        <div style="display:flex; align-items:center; gap:4px; color:var(--text-muted); font-size:0.85rem; min-width:0; flex:1;">
                            <span class="material-icons-round" style="font-size:1rem; color:var(--accent-color); flex-shrink:0;">history</span>
                            <span style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">Vorige keer${varLabel}: <strong style="color:var(--text-primary); font-weight:600;">${prevSummaryText}</strong></span>
                        </div>
                        <button class="btn-secondary" style="padding:2px 8px; font-size:0.75rem; display:inline-flex; align-items:center; gap:3px; flex-shrink:0;" onclick="app.showExerciseHistoryModal('${safeExName}')">
                            <span class="material-icons-round" style="font-size:0.85rem;">read_more</span> Alle Historie
                        </button>
                    </div>
                `;
            } else {
                prevSummaryHtml = `
                    <div class="text-sm mt-2" style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:6px; background:rgba(255,255,255,0.03); padding:6px 10px; border-radius:8px; border:1px solid rgba(255,255,255,0.05);">
                        <div style="display:flex; align-items:center; gap:4px; color:var(--text-muted); font-size:0.85rem; flex:1; min-width:0;">
                            <span class="material-icons-round" style="font-size:0.95rem; opacity:0.6; flex-shrink:0;">info</span>
                            <span style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">Geen eerdere gegevens gelogd voor ${app.escapeHTML(chosenName || ex.name)}</span>
                        </div>
                        <button class="btn-secondary" style="padding:2px 8px; font-size:0.75rem; display:inline-flex; align-items:center; gap:3px; flex-shrink:0;" onclick="app.showExerciseHistoryModal('${safeExName}')">
                            <span class="material-icons-round" style="font-size:0.85rem;">read_more</span> Alle Historie
                        </button>
                    </div>
                `;
            }

            const card = document.createElement('div');
            card.className = 'glass-panel exercise-card';
            card.innerHTML = `
                <div class="exercise-header">
                    <div>
                        <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
                            <div class="exercise-title" style="margin:0;">${app.formatClickableExerciseName(ex.name)}</div>
                        </div>
                        ${variationHtml}
                        <div style="margin-bottom:4px;">${badgesHtml}</div>
                        <div class="exercise-meta">${app.escapeHTML(metaString)}</div>
                        ${prevSummaryHtml}
                        ${notesHtml}
                        ${delayBarHtml}
                    </div>
                </div>
                <div class="exercise-body">
                    ${setsHtml}
                    ${addSetControlsHtml}
                    ${singleHoldTimerHtml}
                </div>
            `;
            list.appendChild(card);
        });

        // Appending Add Exercise button at the bottom of the active exercise list
        const addBtnContainer = document.createElement('div');
        addBtnContainer.className = 'mt-3';
        addBtnContainer.innerHTML = `
            <button class="btn-primary w-full" style="display:flex; align-items:center; justify-content:center; gap:8px; padding:12px; font-size:0.95rem;" onclick="app.showSelectExerciseForWorkoutModal()">
                <span class="material-icons-round">add_circle_outline</span> Oefening Toevoegen
            </button>
        `;
        list.appendChild(addBtnContainer);
    },

    addSetToExercise(exIndex) {
        if (!this.activeWorkout || !this.activeWorkout.exercises || !this.activeWorkout.exercises[exIndex]) return;
        const ex = this.activeWorkout.exercises[exIndex];

        ex.sets = (parseInt(ex.sets, 10) || 0) + 1;

        if (!Array.isArray(ex.setsCompleted)) ex.setsCompleted = [];
        if (!Array.isArray(ex.weights)) ex.weights = [];
        if (!Array.isArray(ex.actualReps)) ex.actualReps = [];
        if (!Array.isArray(ex.levels)) ex.levels = [];

        const lastWeight = ex.weights.length > 0 ? ex.weights[ex.weights.length - 1] : '';
        const lastReps = ex.actualReps.length > 0 ? ex.actualReps[ex.actualReps.length - 1] : '';
        const lastLevel = ex.levels.length > 0 ? ex.levels[ex.levels.length - 1] : '';

        ex.setsCompleted.push(false);
        ex.weights.push(lastWeight);
        ex.actualReps.push(lastReps);
        ex.levels.push(lastLevel);

        store.saveActiveWorkoutState(this.activeWorkout);
        this.renderWorkoutExercises();
    },

    removeSetFromExercise(exIndex, setIndex) {
        if (!this.activeWorkout || !this.activeWorkout.exercises || !this.activeWorkout.exercises[exIndex]) return;
        const ex = this.activeWorkout.exercises[exIndex];

        if (!ex.sets || ex.sets <= 1) {
            this.showToast('Een oefening moet minstens 1 set bevatten.', 'error');
            return;
        }

        ex.sets = ex.sets - 1;
        if (Array.isArray(ex.setsCompleted)) ex.setsCompleted.splice(setIndex, 1);
        if (Array.isArray(ex.weights)) ex.weights.splice(setIndex, 1);
        if (Array.isArray(ex.actualReps)) ex.actualReps.splice(setIndex, 1);
        if (Array.isArray(ex.levels)) ex.levels.splice(setIndex, 1);

        store.saveActiveWorkoutState(this.activeWorkout);
        this.renderWorkoutExercises();
    },

    toggleSet(exIndex, setIndex) {
        const ex = this.activeWorkout.exercises[exIndex];
        const isTurningOn = !ex.setsCompleted[setIndex];
        ex.setsCompleted[setIndex] = isTurningOn;

        if (isTurningOn) {
            const isNonEmpty = val => val !== null && val !== undefined && String(val).trim() !== '';
            const prevDetails = this.getPreviousExerciseDetails(ex.name, ex) || [];

            // Auto-fill missing weight if empty
            if (!ex.weights) ex.weights = Array(ex.sets).fill('');
            if (!isNonEmpty(ex.weights[setIndex])) {
                let fillW = '';
                for (let k = setIndex - 1; k >= 0; k--) {
                    if (isNonEmpty(ex.weights[k])) { fillW = ex.weights[k]; break; }
                }
                if (!isNonEmpty(fillW) && prevDetails[setIndex] && isNonEmpty(prevDetails[setIndex].weight)) {
                    fillW = prevDetails[setIndex].weight;
                } else if (!isNonEmpty(fillW) && prevDetails[0] && isNonEmpty(prevDetails[0].weight)) {
                    fillW = prevDetails[0].weight;
                }
                if (isNonEmpty(fillW)) ex.weights[setIndex] = fillW;
            }

            // Auto-fill missing reps if empty
            if (!ex.actualReps) ex.actualReps = Array(ex.sets).fill('');
            if (!isNonEmpty(ex.actualReps[setIndex])) {
                let fillR = '';
                for (let k = setIndex - 1; k >= 0; k--) {
                    if (isNonEmpty(ex.actualReps[k])) { fillR = ex.actualReps[k]; break; }
                }
                if (!isNonEmpty(fillR) && prevDetails[setIndex] && isNonEmpty(prevDetails[setIndex].reps)) {
                    fillR = prevDetails[setIndex].reps;
                } else if (!isNonEmpty(fillR) && prevDetails[0] && isNonEmpty(prevDetails[0].reps)) {
                    fillR = prevDetails[0].reps;
                } else if (!isNonEmpty(fillR) && isNonEmpty(ex.repsMax)) {
                    fillR = ex.repsMax;
                } else if (!isNonEmpty(fillR) && isNonEmpty(ex.reps)) {
                    fillR = ex.reps;
                } else if (!isNonEmpty(fillR) && isNonEmpty(ex.durationSeconds)) {
                    fillR = ex.durationSeconds;
                }
                if (isNonEmpty(fillR)) ex.actualReps[setIndex] = fillR;
            }

            // Auto-fill missing level if empty
            if (!ex.levels) ex.levels = Array(ex.sets).fill('');
            if (!isNonEmpty(ex.levels[setIndex])) {
                let fillL = '';
                for (let k = setIndex - 1; k >= 0; k--) {
                    if (isNonEmpty(ex.levels[k])) { fillL = ex.levels[k]; break; }
                }
                if (!isNonEmpty(fillL) && prevDetails[setIndex] && isNonEmpty(prevDetails[setIndex].level)) {
                    fillL = prevDetails[setIndex].level;
                }
                if (isNonEmpty(fillL)) ex.levels[setIndex] = fillL;
            }
        }

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

    // --- HOLD TIMER LOGIC ---

    holdTimerState: null,

    isHoldExercise(ex) {
        if (!ex) return false;
        if (ex.trackMetrics && (ex.trackMetrics.includes('duration_seconds') || ex.trackMetrics.includes('duration'))) return true;
        if (ex.exerciseType === 'isometric' || ex.exerciseType === 'bodyweight_hold' || ex.exerciseType === 'hold') return true;
        if (ex.durationSeconds || ex.durationSecondsMin || ex.durationSecondsMax || ex.durationText || ex.duration) return true;
        
        const name = String(ex.name || '').toLowerCase();
        const keywords = ['plank', 'hold', 'side raise', 'wall sit', 'statisch', 'hollow body', 'dead bug', 'isometric', 'l-sit', 'row machine', 'roeimachine'];
        if (keywords.some(k => name.includes(k))) return true;
        return false;
    },

    setHoldTimerDelay(delaySeconds) {
        if (typeof store !== 'undefined' && store.setHoldTimerDelaySeconds) {
            store.setHoldTimerDelaySeconds(delaySeconds);
        }
        if (typeof document !== 'undefined' && document.getElementById('workout-exercise-list')) {
            this.renderWorkoutExercises();
        }
    },

    startHoldTimer(exIndex, setIndex) {
        if (typeof document !== 'undefined' && document.activeElement && typeof document.activeElement.blur === 'function') {
            document.activeElement.blur();
        }

        if (this.holdTimerState) {
            this.stopHoldTimer(false);
        }

        if (typeof setIndex !== 'number') {
            const ex = (this.activeWorkout && this.activeWorkout.exercises) ? this.activeWorkout.exercises[exIndex] : null;
            if (ex && ex.setsCompleted) {
                const firstUncompleted = ex.setsCompleted.findIndex(c => !c);
                setIndex = firstUncompleted !== -1 ? firstUncompleted : Math.max(0, (ex.sets || 1) - 1);
            } else {
                setIndex = 0;
            }
        }

        const delaySec = (typeof store !== 'undefined' && typeof store.holdTimerDelaySeconds === 'number') ? store.holdTimerDelaySeconds : 3;
        const now = Date.now();

        this.holdTimerState = {
            exIndex,
            setIndex,
            delaySeconds: delaySec,
            startTime: delaySec > 0 ? null : now,
            delayStartTime: now,
            status: delaySec > 0 ? 'delay' : 'running',
            intervalId: null
        };

        this.renderWorkoutExercises();

        const intervalId = setInterval(() => {
            if (!this.holdTimerState) {
                clearInterval(intervalId);
                return;
            }

            const btnEl = document.getElementById(`hold-timer-btn-${exIndex}`);
            const currentNow = Date.now();

            if (this.holdTimerState.status === 'delay') {
                const elapsedDelay = (currentNow - this.holdTimerState.delayStartTime) / 1000;
                const remaining = Math.max(0, Math.ceil(this.holdTimerState.delaySeconds - elapsedDelay));

                if (btnEl) {
                    btnEl.className = 'hold-timer-btn starting';
                    btnEl.innerHTML = `<span class="material-icons-round">hourglass_top</span> Klaar in ${remaining}s... (Set ${setIndex + 1})`;
                }

                if (elapsedDelay >= this.holdTimerState.delaySeconds) {
                    this.holdTimerState.status = 'running';
                    this.holdTimerState.startTime = currentNow;
                    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([40]);
                    if (btnEl) {
                        btnEl.className = 'hold-timer-btn running';
                        btnEl.innerHTML = `<span class="material-icons-round">stop</span> 0s Stop (Set ${setIndex + 1})`;
                    }
                }
            } else if (this.holdTimerState.status === 'running') {
                const elapsedSec = Math.floor((currentNow - this.holdTimerState.startTime) / 1000);
                const mins = Math.floor(elapsedSec / 60);
                const secs = elapsedSec % 60;
                const timeStr = mins > 0 ? `${mins}:${String(secs).padStart(2, '0')}` : `${secs}s`;

                if (btnEl) {
                    btnEl.className = 'hold-timer-btn running';
                    btnEl.innerHTML = `<span class="material-icons-round">stop</span> ${timeStr} Stop (Set ${setIndex + 1})`;
                }
            }
        }, 100);

        this.holdTimerState.intervalId = intervalId;
    },

    stopHoldTimer(autoCheck = true) {
        if (typeof document !== 'undefined' && document.activeElement && typeof document.activeElement.blur === 'function') {
            document.activeElement.blur();
        }

        if (!this.holdTimerState) return;

        const { exIndex, setIndex, startTime, status, intervalId } = this.holdTimerState;

        if (intervalId) {
            clearInterval(intervalId);
        }

        if (status === 'delay') {
            this.holdTimerState = null;
            if (typeof document !== 'undefined' && document.getElementById('workout-exercise-list')) {
                this.renderWorkoutExercises();
            }
            return;
        }

        if (status === 'running' && startTime) {
            const grossSeconds = Math.round((Date.now() - startTime) / 1000);
            // 1 second stop offset compensation (reaction time)
            const netSeconds = Math.max(1, grossSeconds - 1);

            if (this.activeWorkout && this.activeWorkout.exercises[exIndex]) {
                const ex = this.activeWorkout.exercises[exIndex];
                if (!ex.actualReps) ex.actualReps = Array(ex.sets).fill('');
                ex.actualReps[setIndex] = String(netSeconds);

                if (autoCheck) {
                    if (!ex.setsCompleted) ex.setsCompleted = Array(ex.sets).fill(false);
                    ex.setsCompleted[setIndex] = true;
                    if (ex.restSeconds) {
                        this.startRestTimer(ex.restSeconds);
                    }
                }
                if (typeof store !== 'undefined') {
                    store.saveActiveWorkoutState(this.activeWorkout);
                }
                this.checkAutoCompleteSet(exIndex, setIndex);
                if (this.showToast) {
                    this.showToast(`⏱️ ${netSeconds} sec gelogd voor Set ${setIndex + 1}!`, 'success');
                }
            }
        }

        this.holdTimerState = null;
        if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([100]);
        if (typeof document !== 'undefined' && document.getElementById('workout-exercise-list')) {
            this.renderWorkoutExercises();
        }
    },

    adjustDuration(exIndex, setIndex, deltaSeconds) {
        if (!this.activeWorkout || !this.activeWorkout.exercises[exIndex]) return;
        const ex = this.activeWorkout.exercises[exIndex];
        if (!ex.actualReps) ex.actualReps = Array(ex.sets).fill('');
        
        let currentVal = parseInt(ex.actualReps[setIndex], 10);
        if (isNaN(currentVal) || currentVal < 0) currentVal = 0;
        
        const newVal = Math.max(0, currentVal + deltaSeconds);
        ex.actualReps[setIndex] = String(newVal);
        if (typeof store !== 'undefined') {
            store.saveActiveWorkoutState(this.activeWorkout);
        }
        this.checkAutoCompleteSet(exIndex, setIndex);
        if (typeof document !== 'undefined' && document.getElementById('workout-exercise-list')) {
            this.renderWorkoutExercises();
        }
    },

    checkAutoCompleteSet(exIndex, setIndex) {
        if (!this.activeWorkout || !this.activeWorkout.exercises[exIndex]) return;
        const ex = this.activeWorkout.exercises[exIndex];
        const isHold = this.isHoldExercise(ex);

        const wantsWeight = ex.trackMetrics ? ex.trackMetrics.includes('weight') : !isHold;
        const wantsReps = ex.trackMetrics ? ex.trackMetrics.includes('reps') : !isHold;
        const wantsDuration = (ex.trackMetrics ? ex.trackMetrics.includes('duration_seconds') : false) || isHold;
        const wantsLevel = (ex.trackMetrics ? (ex.trackMetrics.includes('level') || ex.trackMetrics.includes('stand')) : false) || (ex.name && (ex.name.toLowerCase().includes('row machine') || ex.name.toLowerCase().includes('roeimachine')));

        const hasWeight = !wantsWeight || (ex.weights && String(ex.weights[setIndex] || '').trim() !== '');
        const hasReps = !wantsReps || (ex.actualReps && String(ex.actualReps[setIndex] || '').trim() !== '');
        const hasDuration = !wantsDuration || (ex.actualReps && String(ex.actualReps[setIndex] || '').trim() !== '' && parseInt(ex.actualReps[setIndex], 10) > 0);
        const hasLevel = !wantsLevel || (ex.levels && String(ex.levels[setIndex] || '').trim() !== '');

        if (hasWeight && hasReps && hasDuration && hasLevel && ex.setsCompleted && !ex.setsCompleted[setIndex]) {
            ex.setsCompleted[setIndex] = true;
            if (typeof store !== 'undefined') store.saveActiveWorkoutState(this.activeWorkout);
            if (ex.restSeconds) this.startRestTimer(ex.restSeconds);

            // Gericht alleen de check-knop van deze set bijwerken: een volledige
            // re-render zou de focus (en daarmee de scrollpositie/het toetsenbord
            // op mobiel) slopen terwijl de gebruiker aan het invoeren is
            if (typeof document !== 'undefined' && document.getElementById('workout-exercise-list')) {
                const anchor = document.querySelector(`#workout-exercise-list input[data-ex="${exIndex}"][data-set="${setIndex}"]`);
                const checkBtn = anchor && anchor.closest('.set-row') ? anchor.closest('.set-row').querySelector('.check-btn') : null;
                if (checkBtn) {
                    checkBtn.classList.add('checked');
                } else {
                    this.renderWorkoutExercises();
                }
            }
        }
    },

    // finalize=true alleen als de invoer af is (change/Enter): tijdens het typen
    // (oninput) mag de set niet al afgevinkt worden na het eerste cijfer
    updateWeight(exIndex, setIndex, val, finalize = false) {
        if (!this.activeWorkout || !this.activeWorkout.exercises[exIndex]) return;
        const ex = this.activeWorkout.exercises[exIndex];
        if (!ex.weights) ex.weights = Array(ex.sets).fill('');
        ex.weights[setIndex] = val;
        if (typeof store !== 'undefined') store.saveActiveWorkoutState(this.activeWorkout);
        if (finalize) this.checkAutoCompleteSet(exIndex, setIndex);
    },

    updateReps(exIndex, setIndex, val, finalize = false) {
        if (!this.activeWorkout || !this.activeWorkout.exercises[exIndex]) return;
        const ex = this.activeWorkout.exercises[exIndex];
        if (!ex.actualReps) ex.actualReps = Array(ex.sets).fill('');
        ex.actualReps[setIndex] = val;
        if (typeof store !== 'undefined') store.saveActiveWorkoutState(this.activeWorkout);
        if (finalize) this.checkAutoCompleteSet(exIndex, setIndex);
    },

    updateLevel(exIndex, setIndex, val, finalize = false) {
        if (!this.activeWorkout || !this.activeWorkout.exercises[exIndex]) return;
        const ex = this.activeWorkout.exercises[exIndex];
        if (!ex.levels) ex.levels = Array(ex.sets).fill('');
        ex.levels[setIndex] = val;
        if (typeof store !== 'undefined') store.saveActiveWorkoutState(this.activeWorkout);
        if (finalize) this.checkAutoCompleteSet(exIndex, setIndex);
    },

    handleInputEnter(event, exIndex, setIndex, inputType) {
        const inputEl = event.target;
        const val = inputEl ? inputEl.value : '';

        if (inputType === 'weight') {
            this.updateWeight(exIndex, setIndex, val);
        } else if (inputType === 'reps') {
            this.updateReps(exIndex, setIndex, val);
        } else if (inputType === 'level') {
            this.updateLevel(exIndex, setIndex, val);
        }

        const ex = (this.activeWorkout && this.activeWorkout.exercises) ? this.activeWorkout.exercises[exIndex] : null;
        if (!ex) return;

        // Check if there is a reps input in the same set row that needs focus next
        const setRow = inputEl ? inputEl.closest('.set-row') : null;
        const repsInSameSet = setRow ? setRow.querySelector('input[data-type="reps"]') : null;

        if (inputType === 'weight' && repsInSameSet && repsInSameSet !== inputEl) {
            repsInSameSet.focus();
            if (typeof repsInSameSet.select === 'function') repsInSameSet.select();
            return;
        }

        // If completing reps (or weight in a weight-only exercise), mark set completed!
        const wasCompleted = ex.setsCompleted ? ex.setsCompleted[setIndex] : false;
        if (!wasCompleted) {
            if (!ex.setsCompleted) ex.setsCompleted = Array(ex.sets).fill(false);
            ex.setsCompleted[setIndex] = true;
            if (typeof store !== 'undefined') {
                store.saveActiveWorkoutState(this.activeWorkout);
            }
            if (ex.restSeconds) {
                this.startRestTimer(ex.restSeconds);
            }
        }

        // Find next target input in DOM before re-rendering
        const allInputs = Array.from(document.querySelectorAll('#workout-exercise-list input.weight-input'));
        const currentIndex = allInputs.indexOf(inputEl);
        let nextTarget = null;
        if (currentIndex !== -1 && currentIndex + 1 < allInputs.length) {
            const nextEl = allInputs[currentIndex + 1];
            if (nextEl && nextEl.dataset) {
                nextTarget = {
                    ex: nextEl.dataset.ex,
                    set: nextEl.dataset.set,
                    type: nextEl.dataset.type
                };
            }
        }

        // Re-render workout exercises to display updated checked status and rest timers
        this.renderWorkoutExercises();

        // Restore focus to the target input in the newly rendered DOM
        if (nextTarget) {
            const selector = `#workout-exercise-list input.weight-input[data-ex="${nextTarget.ex}"][data-set="${nextTarget.set}"][data-type="${nextTarget.type}"]`;
            const focusNext = () => {
                const nextInputEl = document.querySelector(selector);
                if (nextInputEl) {
                    nextInputEl.focus();
                    if (typeof nextInputEl.select === 'function') nextInputEl.select();
                }
            };
            focusNext();
            setTimeout(focusNext, 50);
        } else {
            if (document.activeElement && typeof document.activeElement.blur === 'function') {
                document.activeElement.blur();
            }
        }
    },

    showFinishModal() {
        if (document.activeElement && typeof document.activeElement.blur === 'function') {
            document.activeElement.blur();
        }
        const modal = document.getElementById('modal-finish-workout');
        if (modal) modal.classList.remove('hidden');
    },

    hideFinishModal() {
        const modal = document.getElementById('modal-finish-workout');
        if (modal) modal.classList.add('hidden');
    },

    showCancelWorkoutModal() {
        const modal = document.getElementById('modal-cancel-workout');
        if (modal) modal.classList.remove('hidden');
    },

    hideCancelWorkoutModal() {
        const modal = document.getElementById('modal-cancel-workout');
        if (modal) modal.classList.add('hidden');
    },

    cancelWorkout() {
        this.hideCancelWorkoutModal();
        if (this.holdTimerState) this.stopHoldTimer(false);
        this.stopRestTimer();
        this.releaseWakeLock();

        this.activeWorkout = null;
        store.saveActiveWorkoutState(null);

        const bottomNav = document.getElementById('bottom-nav');
        if (bottomNav) bottomNav.classList.remove('hidden');

        this.navigate('home');
        this.showToast('Training geannuleerd.', 'error');
    },

    finishWorkout() {
        this.hideFinishModal();
        if (this.holdTimerState) this.stopHoldTimer(false);
        this.stopRestTimer();
        this.releaseWakeLock();

        if (document.activeElement && typeof document.activeElement.blur === 'function') {
            document.activeElement.blur();
        }

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

        const isNonEmpty = val => val !== null && val !== undefined && String(val).trim() !== '';

        let totalExercisesCompleted = 0;
        
        const exerciseLogs = [];

        this.activeWorkout.exercises.forEach(ex => {
            const prevDetails = this.getPreviousExerciseDetails(ex.name, ex) || [];

            if (!ex.setsCompleted) ex.setsCompleted = Array(ex.sets || 1).fill(false);
            if (!ex.weights) ex.weights = Array(ex.sets || 1).fill('');
            if (!ex.actualReps) ex.actualReps = Array(ex.sets || 1).fill('');
            if (!ex.levels) ex.levels = Array(ex.sets || 1).fill('');

            // Automatically mark set completed if any data input exists for it
            for (let i = 0; i < ex.sets; i++) {
                if (isNonEmpty(ex.weights[i]) || isNonEmpty(ex.actualReps[i]) || isNonEmpty(ex.levels[i])) {
                    ex.setsCompleted[i] = true;
                }
            }

            const setDetails = [];
            for (let i = 0; i < ex.sets; i++) {
                if (ex.setsCompleted[i]) {
                    // Resolve weight with fallbacks
                    let weightVal = isNonEmpty(ex.weights[i]) ? ex.weights[i] : '';
                    if (!isNonEmpty(weightVal)) {
                        for (let k = i - 1; k >= 0; k--) {
                            if (isNonEmpty(ex.weights[k])) { weightVal = ex.weights[k]; break; }
                        }
                    }
                    if (!isNonEmpty(weightVal) && prevDetails[i] && isNonEmpty(prevDetails[i].weight)) {
                        weightVal = prevDetails[i].weight;
                    } else if (!isNonEmpty(weightVal) && prevDetails[0] && isNonEmpty(prevDetails[0].weight)) {
                        weightVal = prevDetails[0].weight;
                    }

                    // Resolve reps with fallbacks
                    let repsVal = isNonEmpty(ex.actualReps[i]) ? ex.actualReps[i] : '';
                    if (!isNonEmpty(repsVal)) {
                        for (let k = i - 1; k >= 0; k--) {
                            if (isNonEmpty(ex.actualReps[k])) { repsVal = ex.actualReps[k]; break; }
                        }
                    }
                    if (!isNonEmpty(repsVal) && prevDetails[i] && isNonEmpty(prevDetails[i].reps)) {
                        repsVal = prevDetails[i].reps;
                    } else if (!isNonEmpty(repsVal) && prevDetails[0] && isNonEmpty(prevDetails[0].reps)) {
                        repsVal = prevDetails[0].reps;
                    } else if (!isNonEmpty(repsVal) && isNonEmpty(ex.repsMax)) {
                        repsVal = ex.repsMax;
                    } else if (!isNonEmpty(repsVal) && isNonEmpty(ex.reps)) {
                        repsVal = ex.reps;
                    } else if (!isNonEmpty(repsVal) && isNonEmpty(ex.durationSeconds)) {
                        repsVal = ex.durationSeconds;
                    }

                    // Resolve level with fallbacks
                    let levelVal = isNonEmpty(ex.levels[i]) ? ex.levels[i] : '';
                    if (!isNonEmpty(levelVal)) {
                        for (let k = i - 1; k >= 0; k--) {
                            if (isNonEmpty(ex.levels[k])) { levelVal = ex.levels[k]; break; }
                        }
                    }
                    if (!isNonEmpty(levelVal) && prevDetails[i] && isNonEmpty(prevDetails[i].level)) {
                        levelVal = prevDetails[i].level;
                    }

                    const detail = {
                        setNumber: i + 1,
                        weight: weightVal != null ? String(weightVal) : '',
                        reps: repsVal != null ? String(repsVal) : ''
                    };
                    if (isNonEmpty(levelVal)) {
                        detail.level = String(levelVal);
                    }
                    setDetails.push(detail);
                }
            }

            if (setDetails.length > 0) {
                totalExercisesCompleted++;
                exerciseLogs.push({
                    name: ex.chosenVariation || ex.name,
                    originalName: ex.name,
                    chosenVariation: ex.chosenVariation || '',
                    muscleGroups: ex.muscleGroups || [],
                    setsCompleted: setDetails.length,
                    totalSets: ex.sets,
                    details: setDetails
                });
            }
        });

        // Gebruik het plan dat bij de start is opgeslagen (niet het huidige actieve plan)
        // Fallback naar store.getActivePlan() voor oude workout-states zonder planId
        const snapshotPlanId = this.activeWorkout ? this.activeWorkout.planId : undefined;
        const snapshotPlanName = this.activeWorkout ? this.activeWorkout.planName : undefined;
        const fallbackPlan = (snapshotPlanId === undefined) ? store.getActivePlan() : null;
        const endTime = new Date();
        const startTime = (this.activeWorkout && this.activeWorkout.startTime) ? this.activeWorkout.startTime : new Date(endTime.getTime() - duration * 60000);

        store.saveWorkoutLog({
            planId: snapshotPlanId !== undefined ? snapshotPlanId : (fallbackPlan ? fallbackPlan.id : null),
            planName: snapshotPlanName !== undefined ? snapshotPlanName : (fallbackPlan ? fallbackPlan.name : 'Overige Sessies'),
            sessionId: this.activeWorkout.session.id,
            sessionName: this.activeWorkout.session.name,
            startTime: startTime instanceof Date ? startTime.toISOString() : startTime,
            endTime: endTime.toISOString(),
            duration: duration,
            exercisesCompleted: totalExercisesCompleted,
            exercises: exerciseLogs
        });

        this.activeWorkout = null;
        store.saveActiveWorkoutState(null);
        
        if (typeof FriendsManager !== 'undefined' && FriendsManager.pushStats) {
            FriendsManager.pushStats().catch(e => console.warn("Friends pushStats fout:", e));
        }

        const bottomNavEl = document.getElementById('bottom-nav');
        if (bottomNavEl) bottomNavEl.classList.remove('hidden');
        this.navigate('home');
    },


    showEditLogModal(logId) {
        const originalLog = store.logs.find(l => l.id === logId);
        if (!originalLog) return;
        
        this.logToEdit = JSON.parse(JSON.stringify(originalLog));
        
        const plan = store.plans.find(p => p.id === this.logToEdit.planId);
        const session = plan ? plan.sessions.find(s => s.id === this.logToEdit.sessionId) : null;
        
        if (session) {
            const matchedLoggedExs = new Set();
            const fullExercises = session.exercises.map(sessionEx => {
                const loggedEx = this.logToEdit.exercises.find(e => 
                    e.name === sessionEx.name || 
                    (sessionEx.alternatives && sessionEx.alternatives.includes(e.name)) ||
                    (sessionEx.name && sessionEx.name.toLowerCase().includes(e.name.toLowerCase()))
                );
                if (loggedEx) matchedLoggedExs.add(loggedEx);
                const details = [];
                for (let i = 1; i <= sessionEx.sets; i++) {
                    const loggedSet = loggedEx && loggedEx.details ? loggedEx.details.find(d => d.setNumber === i) : null;
                    const dObj = {
                        setNumber: i,
                        weight: loggedSet && loggedSet.weight !== undefined && loggedSet.weight !== null ? loggedSet.weight : '',
                        reps: loggedSet && loggedSet.reps !== undefined && loggedSet.reps !== null ? loggedSet.reps : '',
                        // Afgevinkte sets zonder kg/reps moeten bij opslaan behouden blijven
                        completed: !!loggedSet
                    };
                    if (loggedSet && loggedSet.level !== undefined && loggedSet.level !== null) {
                        dObj.level = loggedSet.level;
                    }
                    details.push(dObj);
                }
                const variations = this.getExerciseVariations(sessionEx);
                return {
                    name: loggedEx ? loggedEx.name : sessionEx.name,
                    originalName: sessionEx.name,
                    availableVariations: variations.length > 0 ? variations : this.getExerciseVariations(loggedEx || {}),
                    muscleGroups: (loggedEx && loggedEx.muscleGroups && loggedEx.muscleGroups.length > 0) ? loggedEx.muscleGroups : (sessionEx.muscleGroups || []),
                    totalSets: sessionEx.sets,
                    setsCompleted: loggedEx ? loggedEx.setsCompleted : 0,
                    details: details
                };
            });

            // Preserve any extra logged exercises that were NOT matched to session.exercises
            this.logToEdit.exercises.forEach(loggedEx => {
                if (!matchedLoggedExs.has(loggedEx)) {
                    loggedEx.availableVariations = loggedEx.availableVariations || this.getExerciseVariations(loggedEx);
                    if (!loggedEx.details) loggedEx.details = [];
                    fullExercises.push(loggedEx);
                }
            });

            this.logToEdit.exercises = fullExercises;
        } else {
            this.logToEdit.exercises.forEach(ex => {
                // Bestaande details zijn oorspronkelijk voltooide sets
                ex.details.forEach(d => { d.completed = true; });
                ex.availableVariations = this.getExerciseVariations(ex);
                if (ex.totalSets > ex.details.length) {
                    for (let i = 1; i <= ex.totalSets; i++) {
                        if (!ex.details.find(d => d.setNumber === i)) {
                            ex.details.push({ setNumber: i, weight: '', reps: '', completed: false });
                        }
                    }
                    ex.details.sort((a,b) => a.setNumber - b.setNumber);
                }
            });
        }

        this.renderEditLogModal();
        const modal = document.getElementById('modal-edit-log');
        if (modal && modal.classList) {
            modal.classList.remove('hidden');
        }
    },

    hideEditLogModal() {
        this.logToEdit = null;
        const modal = document.getElementById('modal-edit-log');
        if (modal && modal.classList) {
            modal.classList.add('hidden');
        }
    },

    formatDateTimeLocal(dateInput) {
        const d = dateInput ? new Date(dateInput) : new Date();
        if (isNaN(d.getTime())) return '';
        const pad = n => String(n).padStart(2, '0');
        const year = d.getFullYear();
        const month = pad(d.getMonth() + 1);
        const day = pad(d.getDate());
        const hours = pad(d.getHours());
        const minutes = pad(d.getMinutes());
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    },

    updateEditLogDate(val) {
        if (!this.logToEdit || !val) return;
        const d = new Date(val);
        if (!isNaN(d.getTime())) {
            this.logToEdit.date = d.toISOString();
        }
    },

    updateEditLogDuration(val) {
        const parsed = parseInt(val, 10);
        // Alleen een geldige, niet-negatieve waarde overnemen; anders de vorige behouden
        if (!isNaN(parsed) && parsed >= 0) {
            this.logToEdit.duration = parsed;
        }
    },

    updateEditLogWeight(exIndex, setIndex, val) {
        if (!this.logToEdit || !this.logToEdit.exercises[exIndex]) return;
        const detail = this.logToEdit.exercises[exIndex].details.find(d => d.setNumber === setIndex + 1);
        if (detail) detail.weight = val;
    },

    updateEditLogReps(exIndex, setIndex, val) {
        if (!this.logToEdit || !this.logToEdit.exercises[exIndex]) return;
        const detail = this.logToEdit.exercises[exIndex].details.find(d => d.setNumber === setIndex + 1);
        if (detail) detail.reps = val;
    },

    updateEditLogLevel(exIndex, setIndex, val) {
        if (!this.logToEdit || !this.logToEdit.exercises[exIndex]) return;
        const detail = this.logToEdit.exercises[exIndex].details.find(d => d.setNumber === setIndex + 1);
        if (detail) detail.level = val;
    },

    updateEditLogVariation(exIndex, variationName) {
        if (!this.logToEdit || !this.logToEdit.exercises || !this.logToEdit.exercises[exIndex]) return;
        const ex = this.logToEdit.exercises[exIndex];
        ex.name = variationName;
        this.renderEditLogModal();
    },

    addExerciseToEditLog(exData, setsCount = 3, defaultReps = '10') {
        if (!this.logToEdit) return;
        if (!this.logToEdit.exercises) this.logToEdit.exercises = [];

        const determinedSets = (setsCount !== null && setsCount !== undefined && setsCount > 0)
            ? setsCount
            : ((exData && exData.defaultSets !== undefined && exData.defaultSets !== null)
                ? exData.defaultSets
                : ((exData && exData.name && exData.name.toLowerCase().includes('row machine')) ? 1 : 3));

        const details = [];
        for (let i = 1; i <= determinedSets; i++) {
            details.push({
                setNumber: i,
                weight: '',
                reps: defaultReps || '10',
                level: ''
            });
        }

        const variations = this.getExerciseVariations(exData);
        const newExObj = {
            name: exData.name,
            originalName: exData.name,
            availableVariations: variations.length > 0 ? variations : [exData.name],
            muscleGroups: exData.muscleGroups || [],
            totalSets: determinedSets,
            setsCompleted: 0,
            details: details
        };

        this.logToEdit.exercises.push(newExObj);
        this.renderEditLogModal();
        this.showToast(`${exData.name} toegevoegd aan sessie!`, 'success');
    },

    addSetToEditLog(exIndex) {
        if (!this.logToEdit || !this.logToEdit.exercises || !this.logToEdit.exercises[exIndex]) return;
        const ex = this.logToEdit.exercises[exIndex];
        if (!ex.details) ex.details = [];
        const newSetNumber = ex.details.length + 1;
        const defaultReps = (ex.details.length > 0 && ex.details[ex.details.length - 1].reps) ? ex.details[ex.details.length - 1].reps : '10';
        const defaultWeight = (ex.details.length > 0 && ex.details[ex.details.length - 1].weight) ? ex.details[ex.details.length - 1].weight : '';
        ex.details.push({
            setNumber: newSetNumber,
            weight: defaultWeight,
            reps: defaultReps,
            level: ''
        });
        ex.totalSets = ex.details.length;
        this.renderEditLogModal();
    },

    removeSetFromEditLog(exIndex, setIndex) {
        if (!this.logToEdit || !this.logToEdit.exercises || !this.logToEdit.exercises[exIndex]) return;
        const ex = this.logToEdit.exercises[exIndex];
        if (!ex.details || !ex.details[setIndex]) return;
        ex.details.splice(setIndex, 1);
        ex.details.forEach((d, idx) => {
            d.setNumber = idx + 1;
        });
        ex.totalSets = ex.details.length;
        this.renderEditLogModal();
    },

    removeExerciseFromEditLog(exIndex) {
        if (!this.logToEdit || !this.logToEdit.exercises || !this.logToEdit.exercises[exIndex]) return;
        const ex = this.logToEdit.exercises[exIndex];
        const exName = ex.name;
        this.logToEdit.exercises.splice(exIndex, 1);
        this.renderEditLogModal();
        this.showToast(`${exName} verwijderd.`, 'info');
    },

    renderEditLogModal() {
        const container = document.getElementById('edit-log-container');
        if (!container) return;
        container.innerHTML = '';

        const dateTimeVal = this.formatDateTimeLocal(this.logToEdit.date);

        // Datum, Tijd en Duur in een overzichtelijke bewerkbare kaart
        const metaCard = document.createElement('div');
        metaCard.className = 'glass-panel flex-col gap-2';
        metaCard.style.padding = '12px';
        metaCard.innerHTML = `
            <div class="set-row" style="justify-content: space-between; align-items:center;">
                <div style="font-weight:600;">Datum & Tijd</div>
                <input type="datetime-local" class="input-field" style="width:auto; max-width:210px; text-align:center;"
                    value="${app.escapeHTML(dateTimeVal)}"
                    onchange="app.updateEditLogDate(this.value)">
            </div>
            <div class="set-row" style="justify-content: space-between; align-items:center; margin-top:8px;">
                <div style="font-weight:600;">Duur (minuten)</div>
                <input type="number" min="0" class="input-field" style="width:90px; text-align:center;"
                    value="${this.logToEdit.duration != null ? this.logToEdit.duration : ''}"
                    onchange="app.updateEditLogDuration(this.value)">
            </div>
        `;
        container.appendChild(metaCard);

        if (!this.logToEdit.exercises || this.logToEdit.exercises.length === 0) {
            const note = document.createElement('p');
            note.className = 'text-muted';
            note.textContent = 'Geen oefeningen in deze sessie.';
            container.appendChild(note);
        } else {
            this.logToEdit.exercises.forEach((ex, exIndex) => {
                let setsHtml = '';
                
                if (ex.details && ex.details.length > 0) {
                    ex.details.forEach((d, setIndex) => {
                        const isRow = ex.name.toLowerCase().includes('row machine') || ex.name.toLowerCase().includes('roeimachine');
                        const hasLevel = d.level !== undefined || isRow;
                        const levelInput = hasLevel ? `
                            <input type="text" class="input-field" placeholder="stand" style="width:65px; text-align:center;"
                                value="${app.escapeHTML(String(d.level || ''))}"
                                oninput="app.updateEditLogLevel(${exIndex}, ${setIndex}, this.value)"
                                onchange="app.updateEditLogLevel(${exIndex}, ${setIndex}, this.value)">
                        ` : '';
                        setsHtml += `
                            <div class="set-row" style="margin-top: 8px; justify-content: space-between; align-items:center;">
                                <div class="set-info text-muted">Set ${d.setNumber}</div>
                                <div style="display:flex; gap:6px; align-items:center;">
                                    <input type="number" class="input-field" placeholder="kg" style="width:65px; text-align:center;"
                                        value="${app.escapeHTML(String(d.weight || ''))}"
                                        oninput="app.updateEditLogWeight(${exIndex}, ${setIndex}, this.value)"
                                        onchange="app.updateEditLogWeight(${exIndex}, ${setIndex}, this.value)">
                                    <input type="number" class="input-field" placeholder="reps/sec" style="width:65px; text-align:center;"
                                        value="${app.escapeHTML(String(d.reps || d.durationSeconds || ''))}"
                                        oninput="app.updateEditLogReps(${exIndex}, ${setIndex}, this.value)"
                                        onchange="app.updateEditLogReps(${exIndex}, ${setIndex}, this.value)">
                                    ${levelInput}
                                    <button class="icon-btn" style="color:var(--text-muted); padding:2px;" onclick="app.removeSetFromEditLog(${exIndex}, ${setIndex})" title="Set verwijderen">
                                        <span class="material-icons-round" style="font-size:1rem;">close</span>
                                    </button>
                                </div>
                            </div>
                        `;
                    });
                } else {
                    setsHtml = '<div class="text-sm text-muted">Geen details opgeslagen voor deze oefening.</div>';
                }

                let variationHtml = '';
                const variations = ex.availableVariations || app.getExerciseVariations(ex);
                if (variations.length > 1) {
                    variationHtml = `<div class="variation-selector mb-2">`;
                    variations.forEach(v => {
                        const isActive = ex.name === v;
                        const safeV = app.escapeHTML(v);
                        variationHtml += `<button class="variation-pill ${isActive ? 'active' : ''}" data-variation="${safeV}" onclick="app.updateEditLogVariation(${exIndex}, this.dataset.variation)"><span class="material-icons-round" style="font-size:0.85rem;">${isActive ? 'check_circle' : 'radio_button_unchecked'}</span> ${safeV}</button>`;
                    });
                    variationHtml += `</div>`;
                }

                const card = document.createElement('div');
                card.className = 'glass-panel';
                card.style.padding = '12px';
                card.innerHTML = `
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 4px;">
                        <div style="font-weight: 600;">${app.escapeHTML(ex.name)}</div>
                        <button class="icon-btn" style="color:var(--text-muted); padding:4px;" onclick="app.removeExerciseFromEditLog(${exIndex})" title="Oefening verwijderen">
                            <span class="material-icons-round" style="font-size:1.1rem;">delete_outline</span>
                        </button>
                    </div>
                    ${variationHtml}
                    <div>${setsHtml}</div>
                    <div style="margin-top:8px; display:flex; justify-content:flex-end;">
                        <button class="btn-secondary text-xs" style="padding:4px 10px; font-size:0.8rem;" onclick="app.addSetToEditLog(${exIndex})">
                            + Set Toevoegen
                        </button>
                    </div>
                `;
                container.appendChild(card);
            });
        }

        const addExBtnCard = document.createElement('div');
        addExBtnCard.style.marginTop = '12px';
        addExBtnCard.innerHTML = `
            <button class="btn-primary w-full" style="display:flex; align-items:center; justify-content:center; gap:8px; padding:10px; font-size:0.9rem;" onclick="app.showSelectExerciseForEditLogModal()">
                <span class="material-icons-round">add_circle_outline</span> Extra Oefening Toevoegen
            </button>
        `;
        container.appendChild(addExBtnCard);
    },

    saveEditLog() {
        if (!this.logToEdit) return;
        
        const isNonEmpty = val => val !== null && val !== undefined && String(val).trim() !== '';
        let totalExercisesCompleted = 0;
        this.logToEdit.exercises.forEach(ex => {
            // Een set telt mee als hij oorspronkelijk was afgevinkt (ook zonder waardes)
            // of als er nu waardes zijn ingevuld
            const completedDetails = ex.details.filter(d =>
                d.completed || isNonEmpty(d.weight) || isNonEmpty(d.reps) || isNonEmpty(d.level)
            );
            ex.setsCompleted = completedDetails.length;
            // Interne 'completed'-markering niet mee opslaan in het log
            ex.details = completedDetails.map(d => {
                const clean = { setNumber: d.setNumber, weight: d.weight, reps: d.reps };
                if (d.level !== undefined && d.level !== null && String(d.level).trim() !== '') clean.level = d.level;
                return clean;
            });
            if (ex.setsCompleted > 0) totalExercisesCompleted++;
            delete ex.availableVariations;
            delete ex.originalName;
        });
        
        this.logToEdit.exercises = this.logToEdit.exercises.filter(ex => ex.setsCompleted > 0);
        this.logToEdit.exercisesCompleted = totalExercisesCompleted;
        // Timestamp zodat cloud-sync bij een conflict de nieuwste bewerking kan kiezen
        this.logToEdit.updatedAt = new Date().toISOString();

        const index = store.logs.findIndex(l => l.id === this.logToEdit.id);
        if (index > -1) {
            store.logs[index] = this.logToEdit;
            store.save();
        }
        this.hideEditLogModal();
        this.renderProgress();
        this.renderHome();

        if (typeof FriendsManager !== 'undefined' && FriendsManager.pushStats) {
            FriendsManager.pushStats().catch(e => console.warn("Friends pushStats error:", e));
        }

        this.showToast('Sessie gewijzigd.', 'success');
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
            DataStore.validatePlanSchema(data);
            
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
                let file = null;
                try {
                    if (typeof File !== 'undefined') {
                        file = new File([json], fileName, { type: 'application/json' });
                    }
                } catch (fileErr) {}

                if (file && typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] })) {
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
        // Met sync actief moet de backup de cloud-versie vervangen, niet ermee mergen
        if (typeof CloudSync !== 'undefined' && CloudSync.enabled) {
            CloudSync.overwriteRemote().catch(() => {});
        }
        this.hideRestoreModal();
        this.renderPlans();
        this.renderHome();
        this.renderProgress();
        this.renderAchievements();
        this.showToast('Backup succesvol hersteld!', 'success');
    },

    calculateMuscleGroupMaxes() {
        // Legacy wrapper: returns best single exercise per muscle group.
        // Used by progress/achievements views.
        const byGroup = this.calculateExerciseMaxesByMuscleGroup();
        const result = {};
        for (const mg in byGroup) {
            if (byGroup[mg].length > 0) {
                result[mg] = byGroup[mg][0]; // already sorted best-first
            }
        }
        return result;
    },

    calculateExerciseMaxesByMuscleGroup() {
        const groups = {}; // mg -> { exerciseName -> { exercise, maxKg, maxReps, estimated1RM } }
        if (!store || !store.logs) return groups;

        store.logs.forEach(log => {
            if (!log.exercises) return;
            log.exercises.forEach(ex => {
                if (!ex.details || ex.details.length === 0) return;
                
                let mGroups = ex.muscleGroups || [];
                if (mGroups.length === 0 && this.guessMuscleGroupsFromName) {
                    mGroups = this.guessMuscleGroupsFromName(ex.name);
                }

                // Split old "X of Y" names into individual exercise names
                const exNames = String(ex.name || '').split(/\s+of\s+/i).map(s => s.trim()).filter(Boolean);

                exNames.forEach(displayName => {
                    mGroups.forEach(rawMg => {
                        const mg = this.normalizeMuscleGroup ? this.normalizeMuscleGroup(rawMg) : String(rawMg).toLowerCase().trim();
                        if (!groups[mg]) groups[mg] = {};

                        const key = displayName;
                        if (!groups[mg][key]) {
                            groups[mg][key] = { exercise: displayName, maxKg: 0, maxReps: 0, estimated1RM: 0 };
                        }

                        ex.details.forEach(d => {
                            const weight = parseFloat(d.weight) || 0;
                            const reps = parseInt(d.reps, 10) || 0;
                            if (weight <= 0 && reps <= 0) return;

                            const est1RM = weight > 0 ? (reps === 1 ? weight : weight * (1 + reps / 30)) : 0;
                            const rounded1RM = Math.round(est1RM * 10) / 10;

                            const current = groups[mg][key];
                            const isNewBetter = (rounded1RM > current.estimated1RM) ||
                                (rounded1RM === current.estimated1RM && weight > current.maxKg) ||
                                (weight === 0 && current.maxKg === 0 && reps > current.maxReps);

                            if (isNewBetter) {
                                groups[mg][key] = {
                                    exercise: displayName,
                                    maxKg: weight,
                                    maxReps: reps,
                                    estimated1RM: rounded1RM,
                                    date: log.date
                                };
                            }
                        });
                    });
                });
            });
        });

        // Convert to arrays sorted by performance (1RM or maxReps) desc
        const result = {};
        for (const mg in groups) {
            result[mg] = Object.values(groups[mg]).sort((a, b) => {
                const scoreA = a.estimated1RM > 0 ? a.estimated1RM : a.maxReps;
                const scoreB = b.estimated1RM > 0 ? b.estimated1RM : b.maxReps;
                return scoreB - scoreA;
            });
        }
        return result;
    },

    // --- Variation helpers ---
    getExerciseVariations(ex) {
        // 1. Use alternatives field if present
        if (ex.alternatives && ex.alternatives.length > 0) return ex.alternatives;
        if (ex.optionalAlternatives && ex.optionalAlternatives.length > 0) return ex.optionalAlternatives;
        // 2. Split name by " of " as fallback
        const parts = String(ex.name || '').split(/\s+of\s+/i).map(s => s.trim()).filter(Boolean);
        return parts.length > 1 ? parts : [];
    },

    selectVariation(exIndex, variationName) {
        if (!this.activeWorkout || !this.activeWorkout.exercises[exIndex]) return;
        const ex = this.activeWorkout.exercises[exIndex];
        // Toggle: deselect if already chosen
        if (ex.chosenVariation === variationName) {
            ex.chosenVariation = '';
        } else {
            ex.chosenVariation = variationName;
        }
        store.saveActiveWorkoutState(this.activeWorkout);
        this.renderWorkoutExercises();
    },

    toggleProfileWidget() {
        this.isProfileExpanded = !this.isProfileExpanded;
        this.renderFriends();
    },

    toggleAddFriendInput() {
        this.showAddFriendInput = !this.showAddFriendInput;
        this.renderFriends();
    },

    async handleSendFriendRequest() {
        const input = document.getElementById('input-friend-code');
        if (!input || !input.value.trim()) return;
        const code = input.value.trim();
        try {
            const name = await FriendsManager.sendFriendRequest(code);
            input.value = '';
            this.showAddFriendInput = false;
            this.showToast(`Vriendverzoek verstuurd naar ${name}!`, 'success');
            this.renderFriends();
        } catch (e) {
            this.showToast(e.message || "Fout bij versturen verzoek.", 'error');
        }
    },

    renderFriends() {
        const container = document.getElementById('friends-container');
        if (!container) return;

        if (typeof FriendsManager === 'undefined' || !FriendsManager.user) {
            container.innerHTML = `
                <div class="glass-panel text-center" style="padding:32px 20px;">
                    <div class="stat-icon-wrapper text-accent" style="margin:0 auto 16px auto; width:64px; height:64px; border-radius:50%; display:grid; place-items:center;">
                        <span class="material-icons-round" style="font-size:36px;">group</span>
                    </div>
                    <h2>Vrienden Statistieken</h2>
                    <p class="text-sm text-muted mt-2" style="max-width:320px; margin-left:auto; margin-right:auto;">
                        Log in met Google om je unieke vrienden-code te krijgen en elkaars max kg en reps per spiergroep te vergelijken.
                    </p>
                    <button class="btn-primary mt-6 w-full" onclick="FriendsManager.signIn()" style="display:inline-flex; align-items:center; justify-content:center; gap:8px;">
                        <span class="material-icons-round">login</span> Inloggen met Google
                    </button>
                </div>
            `;
            return;
        }

        const profile = FriendsManager.userProfile || {};
        const code = profile.friendCode || '...';
        const name = profile.displayName || FriendsManager.user.displayName || 'Sporter';
        const photo = FriendsManager.user.photoURL || '';

        // 1. Collapsible Profile & Friend Code Header
        let html = `
            <div class="glass-panel mb-4">
                <div style="display:flex; justify-content:space-between; align-items:center; cursor:pointer;" onclick="app.toggleProfileWidget()">
                    <div style="display:flex; align-items:center; gap:12px;">
                        ${photo ? `<img src="${this.escapeHTML(photo)}" style="width:38px; height:38px; border-radius:50%; object-fit:cover; border:2px solid var(--accent-color);">` : `<div style="width:38px; height:38px; border-radius:50%; background:var(--surface-light); display:grid; place-items:center; font-weight:700; color:var(--accent-color);">${this.escapeHTML(name.slice(0, 1).toUpperCase())}</div>`}
                        <div>
                            <div style="font-weight:600; font-size:0.95rem;">${this.escapeHTML(name)}</div>
                            <div class="text-sm text-muted" style="font-size:0.75rem;">Mijn profiel & code</div>
                        </div>
                    </div>
                    <div style="display:flex; align-items:center; gap:6px;">
                        <span class="material-icons-round text-muted" style="font-size:1.4rem;">${this.isProfileExpanded ? 'expand_less' : 'expand_more'}</span>
                    </div>
                </div>
                ${this.isProfileExpanded ? `
                    <div style="margin-top:12px; padding-top:12px; border-top:1px solid rgba(255,255,255,0.08);">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                            <div>
                                <div class="text-sm text-muted" style="font-size:0.75rem;">Jouw vrienden-code:</div>
                                <div style="color:var(--accent-color); font-family:monospace; font-weight:700; font-size:0.95rem; margin-top:2px;">${this.escapeHTML(code)}</div>
                            </div>
                            <button class="btn-secondary" style="padding:6px 12px; font-size:0.8rem;" onclick="navigator.clipboard.writeText('${this.escapeHTML(code)}'); app.showToast('Vrienden-code gekopieerd!', 'success');" title="Kopieer code">
                                <span class="material-icons-round" style="font-size:1rem;">content_copy</span> Kopieer
                            </button>
                        </div>
                        <div style="display:flex; justify-content:flex-end;">
                            <button class="btn-secondary" style="padding:4px 10px; font-size:0.75rem; color:var(--text-muted);" onclick="FriendsManager.signOut()">
                                <span class="material-icons-round" style="font-size:0.9rem;">logout</span> Uitloggen
                            </button>
                        </div>
                    </div>
                ` : ''}
            </div>
        `;

        // 2. Pending Incoming Requests
        if (FriendsManager.requests && FriendsManager.requests.length > 0) {
            html += `
                <div class="glass-panel mb-4" style="border-left:4px solid var(--status-orange);">
                    <div style="font-weight:600; font-size:0.95rem; margin-bottom:8px; display:flex; align-items:center; gap:6px;">
                        <span class="material-icons-round text-accent" style="color:var(--status-orange);">person_add</span> Vriendverzoeken (${FriendsManager.requests.length})
                    </div>
                    <div class="flex-col gap-2">
                        ${FriendsManager.requests.map(req => `
                            <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(0,0,0,0.15); padding:10px 12px; border-radius:10px;">
                                <div style="font-weight:500;">${this.escapeHTML(req.fromName)}</div>
                                <div style="display:flex; gap:6px;">
                                    <button class="btn-primary" style="padding:4px 10px; font-size:0.8rem; background:var(--status-green);" onclick="FriendsManager.acceptFriendRequest('${this.escapeHTML(req.id)}')">Accepteren</button>
                                    <button class="btn-secondary" style="padding:4px 10px; font-size:0.8rem;" onclick="FriendsManager.rejectFriendRequest('${this.escapeHTML(req.id)}')">Weigeren</button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        // 3. Friends List / Selector with Add Friend Pill
        const friends = FriendsManager.friends || [];
        html += `
            <div class="mb-4">
                <div class="text-sm text-muted mb-2" style="font-weight:500;">Kies een vriend om te vergelijken:</div>
                <div style="display:flex; gap:8px; overflow-x:auto; padding-bottom:4px; align-items:center;">
                    ${friends.map(f => {
                        const isSelected = f.uid === FriendsManager.selectedFriendUid && !this.showAddFriendInput;
                        const fName = f.displayName || 'Vriend';
                        return `
                            <button class="btn-secondary ${isSelected ? 'active-friend-pill' : ''}" style="padding:8px 14px; border-radius:99px; white-space:nowrap; display:flex; align-items:center; gap:6px; ${isSelected ? 'background:var(--accent-color); color:white; font-weight:600;' : ''}" onclick="FriendsManager.selectedFriendUid = '${this.escapeHTML(f.uid)}'; app.showAddFriendInput = false; app.renderFriends();">
                                <span class="material-icons-round" style="font-size:1rem;">person</span> ${this.escapeHTML(fName)}
                            </button>
                        `;
                    }).join('')}
                    <button class="btn-secondary ${this.showAddFriendInput ? 'active-friend-pill' : ''}" style="padding:8px 12px; border-radius:99px; white-space:nowrap; display:flex; align-items:center; gap:4px; ${this.showAddFriendInput ? 'background:var(--accent-color); color:white; font-weight:600;' : 'border:1px dashed rgba(255,255,255,0.2);'}" onclick="app.toggleAddFriendInput()" title="Vriend toevoegen">
                        <span class="material-icons-round" style="font-size:1.1rem;">person_add</span>
                    </button>
                </div>
                ${this.showAddFriendInput ? `
                    <div class="glass-panel mt-3" style="padding:12px; border-left:3px solid var(--accent-color);">
                        <div style="font-weight:600; font-size:0.85rem; margin-bottom:8px;">Vriend Toevoegen</div>
                        <div style="display:flex; gap:8px;">
                            <input type="text" id="input-friend-code" class="input-field" placeholder="Voer vrienden-code in (bijv. GF-XXXX...)" style="flex:1; text-transform:uppercase; font-family:monospace; font-size:0.85rem;" onkeydown="if(event.key==='Enter'){event.preventDefault();app.handleSendFriendRequest();}">
                            <button class="btn-primary" style="padding:6px 14px; font-size:0.85rem; white-space:nowrap;" onclick="app.handleSendFriendRequest()">Verstuur</button>
                        </div>
                    </div>
                ` : ''}
            </div>
        `;

        if (friends.length === 0 && !this.showAddFriendInput) {
            html += `
                <div class="glass-panel text-center p-4 mb-4">
                    <p class="text-muted text-sm">Je hebt nog geen vrienden toegevoegd. Klik op het <span class="material-icons-round" style="font-size:1rem; vertical-align:-2px;">person_add</span> knopje hierboven of deel je vrienden-code om elkaars prestaties te vergelijken!</p>
                </div>
            `;
        } else if (friends.length > 0 && !this.showAddFriendInput) {
            // 4. Comparison View for Selected Friend
            const selectedFriend = friends.find(f => f.uid === FriendsManager.selectedFriendUid) || friends[0];
            if (selectedFriend) {
                const myMaxesByGroup = this.calculateExerciseMaxesByMuscleGroup();
                const friendMaxes = (selectedFriend.stats && selectedFriend.stats.muscleGroups) ? selectedFriend.stats.muscleGroups : {};
                const friendName = selectedFriend.displayName || 'Vriend';

                const muscleGroupDefs = [
                    { id: 'chest', name: 'Borst', icon: 'fitness_center' },
                    { id: 'back', name: 'Rug', icon: 'shield' },
                    { id: 'legs', name: 'Benen', icon: 'directions_run' },
                    { id: 'shoulders', name: 'Schouders', icon: 'accessibility_new' },
                    { id: 'arms', name: 'Armen', icon: 'sports_gymnastics' },
                    { id: 'glutes', name: 'Billen', icon: 'sports_kabaddi' },
                    { id: 'core', name: 'Core', icon: 'grid_view' }
                ];

                html += `
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                        <h3 style="margin:0; text-transform:none; font-size:1.1rem; color:var(--text-primary);">Vergelijking met ${this.escapeHTML(friendName)}</h3>
                        <button class="btn-secondary" style="padding:2px 8px; font-size:0.75rem; color:var(--status-red);" onclick="if(confirm('Weet je zeker dat je ${this.escapeHTML(friendName)} wilt verwijderen uit je vriendenlijst?')){ FriendsManager.removeFriend('${this.escapeHTML(selectedFriend.uid)}'); }">Verwijder vriend</button>
                    </div>
                `;

                muscleGroupDefs.forEach(mgDef => {
                    const myExercises = myMaxesByGroup[mgDef.id] || [];
                    // Friend data: supports both old (single object) and new (exercises array) format
                    const friendMgData = friendMaxes[mgDef.id];
                    let friendExercises = [];
                    if (friendMgData) {
                        if (Array.isArray(friendMgData.exercises)) {
                            friendExercises = friendMgData.exercises;
                        } else if (friendMgData.exercise) {
                            // Legacy single-exercise format
                            friendExercises = [friendMgData];
                        }
                    }

                    // Merge all unique exercise names (only if at least one user has valid data: maxKg > 0 or maxReps > 0)
                    const allExerciseNames = new Set();
                    myExercises.forEach(e => {
                        if (e.maxKg > 0 || e.maxReps > 0 || e.estimated1RM > 0) allExerciseNames.add(e.exercise);
                    });
                    friendExercises.forEach(e => {
                        if (e.maxKg > 0 || e.maxReps > 0 || e.estimated1RM > 0) allExerciseNames.add(e.exercise);
                    });

                    if (allExerciseNames.size === 0) return; // skip empty groups

                    html += `
                        <div class="muscle-group-section">
                            <div class="muscle-group-header">
                                <span class="material-icons-round text-accent" style="font-size:1.2rem;">${mgDef.icon}</span>
                                ${mgDef.name}
                                <span class="text-sm text-muted" style="font-weight:400;">(${allExerciseNames.size} oefening${allExerciseNames.size !== 1 ? 'en' : ''})</span>
                            </div>
                    `;

                    allExerciseNames.forEach(exName => {
                        const myStat = myExercises.find(e => e.exercise === exName) || null;
                        const fStat = friendExercises.find(e => e.exercise === exName) || null;
                        const my1RM = myStat ? (myStat.estimated1RM || 0) : 0;
                        const f1RM = fStat ? (fStat.estimated1RM || 0) : 0;
                        const myReps = myStat ? (myStat.maxReps || 0) : 0;
                        const fReps = fStat ? (fStat.maxReps || 0) : 0;
                        const myKg = myStat ? (myStat.maxKg || 0) : 0;
                        const fKg = fStat ? (fStat.maxKg || 0) : 0;

                        const isBodyweightCompare = (myStat && myKg === 0) || (fStat && fKg === 0);

                        let leaderBadge = '';
                        if (myStat && fStat) {
                            if (isBodyweightCompare && myReps > 0 && fReps > 0) {
                                if (myReps > fReps) {
                                    leaderBadge = `<span class="status-badge green" style="padding:2px 8px; font-size:0.65rem; white-space:nowrap;">+${myReps - fReps} reps</span>`;
                                } else if (fReps > myReps) {
                                    leaderBadge = `<span class="status-badge orange" style="padding:2px 8px; font-size:0.65rem; white-space:nowrap;">-${fReps - myReps} reps</span>`;
                                } else {
                                    leaderBadge = `<span class="status-badge" style="padding:2px 8px; font-size:0.65rem; background:rgba(255,255,255,0.1); color:var(--text-primary); white-space:nowrap;">Gelijk</span>`;
                                }
                            } else if (my1RM > 0 && f1RM > 0) {
                                if (my1RM > f1RM) {
                                    const diff = Math.round((my1RM - f1RM) * 10) / 10;
                                    leaderBadge = `<span class="status-badge green" style="padding:2px 8px; font-size:0.65rem; white-space:nowrap;">+${diff} kg</span>`;
                                } else if (f1RM > my1RM) {
                                    const diff = Math.round((f1RM - my1RM) * 10) / 10;
                                    leaderBadge = `<span class="status-badge orange" style="padding:2px 8px; font-size:0.65rem; white-space:nowrap;">-${diff} kg</span>`;
                                } else {
                                    leaderBadge = `<span class="status-badge" style="padding:2px 8px; font-size:0.65rem; background:rgba(255,255,255,0.1); color:var(--text-primary); white-space:nowrap;">Gelijk</span>`;
                                }
                            }
                        }

                        const myScore = isBodyweightCompare ? myReps : my1RM;
                        const fScore = isBodyweightCompare ? fReps : f1RM;
                        const totalScore = (myScore + fScore) || 1;
                        const myPct = Math.round((myScore / totalScore) * 100) || 50;
                        const fPct = 100 - myPct;

                        const myDateStr = myStat && myStat.date ? this.formatShortDate(myStat.date) : '';
                        const fDateStr = fStat && fStat.date ? this.formatShortDate(fStat.date) : '';

                        html += `
                            <div class="exercise-compare-card">
                                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                                    <div style="font-weight:600; font-size:0.9rem; color:var(--text-primary);">${this.escapeHTML(exName)}</div>
                                    ${leaderBadge}
                                </div>
                                <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
                                    <div style="background:rgba(59, 130, 246, 0.06); border-left:3px solid var(--accent-color); padding:8px 10px; border-radius:6px;">
                                        <div class="text-sm text-muted" style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:4px; font-size:0.65rem; font-weight:600;">
                                            <span>JIJ</span>
                                            ${myDateStr ? `<span style="font-weight:600; opacity:0.8; white-space:nowrap;">${this.escapeHTML(myDateStr)}</span>` : ''}
                                        </div>
                                        ${myStat && (myKg > 0 || myReps > 0) ? `
                                            <div style="font-size:1rem; font-weight:700; margin-top:2px;">${myKg > 0 ? `${myKg} kg` : '0 kg'} <span class="text-sm font-normal text-muted">${myReps > 0 ? `× ${myReps}` : ''}</span></div>
                                            <div class="text-accent" style="font-size:0.7rem; font-weight:600; margin-top:2px; font-family:monospace;">${myKg > 0 ? `1RM: ${my1RM} kg` : `Max: ${myReps} reps`}</div>
                                        ` : `<div class="text-sm text-muted" style="margin-top:4px;">Geen data</div>`}
                                    </div>
                                    <div style="background:rgba(245, 158, 11, 0.06); border-left:3px solid var(--status-orange); padding:8px 10px; border-radius:6px;">
                                        <div class="text-sm text-muted" style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:4px; font-size:0.65rem; font-weight:600;">
                                            <span style="text-transform:uppercase;">${this.escapeHTML(friendName)}</span>
                                            ${fDateStr ? `<span style="font-weight:600; opacity:0.8; white-space:nowrap;">${this.escapeHTML(fDateStr)}</span>` : ''}
                                        </div>
                                        ${fStat && (fKg > 0 || fReps > 0) ? `
                                            <div style="font-size:1rem; font-weight:700; margin-top:2px;">${fKg > 0 ? `${fKg} kg` : '0 kg'} <span class="text-sm font-normal text-muted">${fReps > 0 ? `× ${fReps}` : ''}</span></div>
                                            <div style="color:var(--status-orange); font-size:0.7rem; font-weight:600; margin-top:2px; font-family:monospace;">${fKg > 0 ? `1RM: ${f1RM} kg` : `Max: ${fReps} reps`}</div>
                                        ` : `<div class="text-sm text-muted" style="margin-top:4px;">Geen data</div>`}
                                    </div>
                                </div>
                                ${(myScore > 0 || fScore > 0) ? `
                                    <div style="background:rgba(255,255,255,0.05); height:4px; border-radius:2px; overflow:hidden; display:flex; margin-top:8px;">
                                        <div style="width:${myPct}%; background:var(--accent-color); transition:width 0.3s ease;"></div>
                                        <div style="width:${fPct}%; background:var(--status-orange); transition:width 0.3s ease;"></div>
                                    </div>
                                ` : ''}
                            </div>
                        `;
                    });

                    html += `</div>`;
                });
            }
        }

        container.innerHTML = html;
    }
};

// Ensure we don't crash when running in a Node/test environment
if (typeof window !== 'undefined' && typeof document !== 'undefined' && !(typeof process !== 'undefined' && process.env && process.env.JEST_WORKER_ID)) {
    const importInput = document.getElementById('import-file');
    if (importInput && importInput.addEventListener) {
        importInput.addEventListener('change', (e) => app.handleFileSelect(e));
    }
    const restoreInput = document.getElementById('restore-file');
    if (restoreInput && restoreInput.addEventListener) {
        restoreInput.addEventListener('change', (e) => app.handleRestoreFileSelect(e));
    }

    if (document.readyState === 'loading' && document.addEventListener) {
        document.addEventListener('DOMContentLoaded', () => app.init());
    } else {
        app.init();
    }
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DataStore, app, store, html, rawHtml };
}
