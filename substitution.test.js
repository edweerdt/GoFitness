/**
 * @jest-environment jsdom
 */

const { SubstitutionEngine } = require('./substitutionEngine');
const { exercises, EXERCISE_DATABASE } = require('./exercises');

describe('Exercise Database & SubstitutionEngine Tests', () => {
  let engine;

  beforeAll(() => {
    engine = new SubstitutionEngine(exercises);
  });

  describe('Database Structure & Integrity', () => {
    test('moet de complete dataset met 100+ oefeningen correct inladen', () => {
      expect(exercises.length).toBeGreaterThanOrEqual(100);
      expect(EXERCISE_DATABASE.count).toBe(exercises.length);
    });

    test('elke oefening moet geldige en verplichte velden hebben', () => {
      const validCategories = [
        'Borst',
        'Rug',
        'Schouders',
        'Benen (Knie-dominant)',
        'Benen (Heup-dominant)',
        'Armen',
        'Kuiten & Core'
      ];
      const validTypes = ['Compound', 'Isolatie', 'Isometrisch'];
      const validLevels = ['Beginner', 'Intermediate', 'Advanced'];
      const validSymmetries = ['Bilateraal', 'Unilateraal'];
      const validAxial = ['Geen', 'Laag', 'Gemiddeld', 'Hoog'];

      const idSet = new Set();

      for (const ex of exercises) {
        // Uniek ID
        expect(idSet.has(ex.id)).toBe(false);
        idSet.add(ex.id);

        expect(typeof ex.id).toBe('string');
        expect(ex.id.length).toBeGreaterThan(0);
        expect(typeof ex.name).toBe('string');
        expect(validCategories).toContain(ex.category);
        expect(typeof ex.movement_pattern).toBe('string');
        expect(Array.isArray(ex.primary_muscles)).toBe(true);
        expect(ex.primary_muscles.length).toBeGreaterThan(0);
        expect(Array.isArray(ex.secondary_muscles)).toBe(true);
        expect(validTypes).toContain(ex.type);
        expect(validLevels).toContain(ex.level);
        expect(validSymmetries).toContain(ex.symmetry);
        expect(validAxial).toContain(ex.axial_load);
        expect(typeof ex.is_home_friendly).toBe('boolean');
        expect(Array.isArray(ex.equipment)).toBe(true);
        expect(Array.isArray(ex.required_equipment)).toBe(true);
        expect(Array.isArray(ex.substitutes)).toBe(true);
      }
    });

    test('alle gedefinieerde substitutes moeten daadwerkelijk bestaan in de database', () => {
      const allIds = new Set(exercises.map(e => e.id));
      for (const ex of exercises) {
        for (const subId of ex.substitutes) {
          expect(allIds.has(subId)).toBe(true);
        }
      }
    });

    test('bevat de Mike Mentzer Close-Grip Supinated Lat Pulldown met juiste metadata', () => {
      const mentzer = engine.getExercise('close-grip-supinated-lat-pulldown');
      expect(mentzer).toBeDefined();
      expect(mentzer.name).toContain('Close-Grip Supinated Lat Pulldown');
      expect(mentzer.aliases).toContain('Mentzer Pulldown');
      expect(mentzer.movement_pattern).toBe('Verticaal Trekken');
      expect(mentzer.primary_muscles).toContain('Brede rugspier (Lats)');
      expect(mentzer.primary_muscles).toContain('Biceps');
      expect(mentzer.type).toBe('Compound');
    });
  });

  describe('Substitutie Scenario 1: Barbell Back Squat vervangen door Thuisopties', () => {
    test('moet veilige en thuis-geschikte quad/glute compounds aanbevelen met dumbbells', () => {
      const context = {
        location: 'home',
        availableEquipment: ['dumbbells', 'bankje'],
        maxAxialLoad: 'Laag',
        userLevel: 'Beginner'
      };

      const results = engine.getSubstitutes('barbell-back-squat', context, 5);
      expect(results.length).toBeGreaterThan(0);

      const resultIds = results.map(r => r.exercise.id);

      // Goblet Squat en Bulgarian Split Squat moeten bovenaan staan
      expect(resultIds).toContain('goblet-squat');
      expect(resultIds).toContain('bulgarian-split-squat');

      // Barbell en machine oefeningen mogen NIET voorkomen
      expect(resultIds).not.toContain('barbell-back-squat');
      expect(resultIds).not.toContain('leg-press');
      expect(resultIds).not.toContain('hack-squat');
      expect(resultIds).not.toContain('front-squat');

      // Alle resultaten moeten axiaal laag of geen hebben
      for (const r of results) {
        expect(['Geen', 'Laag']).toContain(r.exercise.axial_load);
        expect(r.exercise.is_home_friendly).toBe(true);
      }
    });
  });

  describe('Substitutie Scenario 2: Rugklachten / Axiale ontlasting in Gym', () => {
    test('moet rugsparende machine compounds aanbevelen bij maxAxialLoad: Geen', () => {
      const context = {
        location: 'gym',
        maxAxialLoad: 'Geen'
      };

      const results = engine.getSubstitutes('barbell-back-squat', context, 5);
      const resultIds = results.map(r => r.exercise.id);

      // Leg Press en Belt Squat moeten aangeboden worden
      expect(resultIds).toContain('leg-press');
      expect(resultIds).toContain('belt-squat');

      // Hoge of gemiddelde rugbelasting mag NIET voorkomen
      expect(resultIds).not.toContain('barbell-back-squat');
      expect(resultIds).not.toContain('hack-squat');
      expect(resultIds).not.toContain('front-squat');

      for (const r of results) {
        expect(r.exercise.axial_load).toBe('Geen');
      }
    });
  });

  describe('Substitutie Scenario 3: Bankdrukken vervangen voor Bodyweight thuis', () => {
    test('moet push-up varianten aanbevelen voor borst', () => {
      const context = {
        location: 'home',
        availableEquipment: ['bodyweight']
      };

      const results = engine.getSubstitutes('barbell-bench-press', context, 3);
      const resultIds = results.map(r => r.exercise.id);

      expect(resultIds).toContain('push-up');
      expect(resultIds).not.toContain('flat-dumbbell-press');
      expect(resultIds).not.toContain('chest-press-machine');
    });
  });

  describe('Substitutie Scenario 4: Strikte Equipment AND-voorwaarden', () => {
    test('mag geen incline dumbbell press aanbieden als gebruiker geen bankje heeft', () => {
      const contextWithoutBench = {
        location: 'home',
        availableEquipment: ['dumbbells'] // Geen incline bench!
      };

      const results = engine.getSubstitutes('incline-barbell-bench-press', contextWithoutBench, 5);
      const resultIds = results.map(r => r.exercise.id);

      // Incline DB press vereist een incline bench, dus mag niet matchen
      expect(resultIds).not.toContain('incline-dumbbell-press');
      
      // Decline push-up (voeten op verhoging/stoel) mag wel matchen
      expect(resultIds).toContain('decline-push-up');
    });
  });

  describe('Substitutie Scenario 5: Mike Mentzer Pulldown substitutie', () => {
    test('Close-Grip Supinated Lat Pulldown matched uitstekend met Lat Pulldown en Chin-up', () => {
      const context = { location: 'gym' };
      const results = engine.getSubstitutes('lat-pulldown', context, 5);
      const resultIds = results.map(r => r.exercise.id);

      expect(resultIds).toContain('close-grip-supinated-lat-pulldown');
      expect(resultIds).toContain('pull-up');
      expect(resultIds).toContain('chin-up');
    });
  });

  describe('UI Flow & Integratie Tests in GoFitness App', () => {
    const { app, store, PRESET_PLANS } = require('./app');

    beforeEach(() => {
      document.body.innerHTML = `
        <div id="main-content">
          <div id="view-home" class="view active">
            <div id="recommended-card-title"></div>
            <div id="recommended-session-name"></div>
            <div id="recommended-reason"></div>
            <div id="session-picker-wrapper"></div>
            <select id="home-session-select"></select>
            <button id="btn-start-session">Start Nu</button>
          </div>
          <div id="view-workout" class="view">
            <div id="active-exercises-list"></div>
          </div>
          <div id="view-plans" class="view">
            <div id="plans-list"></div>
          </div>
        </div>
        <div id="modal-substitute-exercise" class="modal-overlay hidden">
          <div id="sub-modal-target-name"></div>
          <div id="sub-modal-target-meta"></div>
          <button id="sub-chip-location"><span id="sub-chip-location-text"></span></button>
          <button id="sub-chip-axial"><span id="sub-chip-axial-text"></span></button>
          <button id="sub-chip-equipment"><span id="sub-chip-equipment-text"></span></button>
          <input type="text" id="sub-modal-search" />
          <div id="sub-modal-results-list"></div>
          <label id="sub-modal-save-plan-label"><input type="checkbox" id="sub-modal-save-to-plan" /></label>
        </div>
        <div id="toast-container"></div>
      `;
      store.plans = JSON.parse(JSON.stringify(PRESET_PLANS));
      store.activePlanId = store.plans[0].id;
      app.activeWorkout = null;
      app.initSubstitutionEngine();
    });

    test('openSubstitutionModalForActiveWorkout opent de modal met correcte data', () => {
      app.startWorkout(store.plans[0].sessions[0], store.plans[0]);
      expect(app.activeWorkout).toBeDefined();

      app.openSubstitutionModalForActiveWorkout(0);
      const modal = document.getElementById('modal-substitute-exercise');
      expect(modal.classList.contains('hidden')).toBe(false);

      const targetTitle = document.getElementById('sub-modal-target-name');
      expect(targetTitle.textContent).toBe(app.activeWorkout.exercises[0].name);

      const resultsList = document.getElementById('sub-modal-results-list');
      expect(resultsList.children.length).toBeGreaterThan(0);
    });

    test('applySubstitution vervangt de oefening tijdens een actieve workout', () => {
      app.startWorkout(store.plans[0].sessions[0], store.plans[0]);
      const initialExerciseName = app.activeWorkout.exercises[0].name;

      app.openSubstitutionModalForActiveWorkout(0);
      app.applySubstitution('goblet-squat');

      expect(app.activeWorkout.exercises[0].name).toBe('Goblet Squat');
      expect(app.activeWorkout.exercises[0].id).toBe('goblet-squat');
      expect(app.activeWorkout.exercises[0].name).not.toBe(initialExerciseName);

      const modal = document.getElementById('modal-substitute-exercise');
      expect(modal.classList.contains('hidden')).toBe(true);
    });

    test('quickConvertAndStartSession zet een sessie om naar een thuis-workout met vervangers', () => {
      const select = document.getElementById('home-session-select');
      select.innerHTML = `<option value="${store.plans[0].sessions[0].id}" selected></option>`;

      app.quickConvertAndStartSession('home');

      expect(app.activeWorkout).toBeDefined();
      expect(app.activeWorkout.session.name).toContain('Thuis-workout');

      // Alle oefeningen in de actieve sessie moeten nu thuis-geschikt zijn
      for (const ex of app.activeWorkout.exercises) {
        const exObj = app.substitutionEngine.getExercise(ex.name);
        if (exObj) {
          expect(exObj.is_home_friendly).toBe(true);
        }
      }
    });

    test('quickConvertAndStartSession zet een sessie om naar een rugsparende workout', () => {
      const select = document.getElementById('home-session-select');
      select.innerHTML = `<option value="${store.plans[0].sessions[0].id}" selected></option>`;

      app.quickConvertAndStartSession('axial');

      expect(app.activeWorkout).toBeDefined();
      expect(app.activeWorkout.session.name).toContain('Rugsparende workout');

      // Geen hoge axiale belasting in de workout
      for (const ex of app.activeWorkout.exercises) {
        const exObj = app.substitutionEngine.getExercise(ex.name);
        if (exObj) {
          expect(['Geen', 'Laag']).toContain(exObj.axial_load);
        }
      }
    });
  });
});
