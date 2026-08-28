/**
 * GoFitness Substitution Engine
 * Deterministische scoring & filtering voor oefeningssubstituties.
 */

const AXIAL_LOAD_WEIGHTS = {
  'Geen': 0,
  'Laag': 1,
  'Gemiddeld': 2,
  'Hoog': 3
};

const EQUIPMENT_SYNONYMS = {
  'bodyweight': 'bodyweight',
  'lichaamsgewicht': 'bodyweight',
  'eigen gewicht': 'bodyweight',
  'dumbbell': 'dumbbell',
  'dumbbells': 'dumbbell',
  'losse gewichten': 'dumbbell',
  'halter': 'dumbbell',
  'halters': 'dumbbell',
  'barbell': 'barbell',
  'stang': 'barbell',
  'halterstang': 'barbell',
  'bench': 'bench',
  'bank': 'bench',
  'bankje': 'bench',
  'trainingsbank': 'bench',
  'flat_bench': 'bench',
  'incline_bench': 'incline_bench',
  'schuine bank': 'incline_bench',
  'decline_bench': 'decline_bench',
  'preacher_bench': 'preacher_bench',
  'squat_rack': 'squat_rack',
  'rack': 'squat_rack',
  'power_rack': 'squat_rack',
  'cable_machine': 'cable_machine',
  'cable': 'cable_machine',
  'kabel': 'cable_machine',
  'kabels': 'cable_machine',
  'lat_pulldown_machine': 'lat_pulldown_machine',
  'lat pulldown': 'lat_pulldown_machine',
  'chest_press_machine': 'chest_press_machine',
  'leg_press_machine': 'leg_press_machine',
  'leg press': 'leg_press_machine',
  'hack_squat_machine': 'hack_squat_machine',
  'belt_squat_machine': 'belt_squat_machine',
  'leg_extension_machine': 'leg_extension_machine',
  'leg_curl_machine': 'leg_curl_machine',
  'hip_abductor_machine': 'hip_abductor_machine',
  'hip_adductor_machine': 'hip_adductor_machine',
  'pec_deck_machine': 'pec_deck_machine',
  'shoulder_press_machine': 'shoulder_press_machine',
  'seated_row_machine': 'seated_row_machine',
  't_bar_machine': 't_bar_machine',
  'seated_calf_machine': 'seated_calf_machine',
  'back_extension_bench': 'back_extension_bench',
  'machine': 'machine',
  'machines': 'machine',
  'pullup_bar': 'pullup_bar',
  'optrekstang': 'pullup_bar',
  'dip_station': 'dip_station',
  'dip bars': 'dip_station',
  'resistance_band': 'resistance_band',
  'weerstandsband': 'resistance_band',
  'elastiek': 'resistance_band',
  'kettlebell': 'kettlebell',
  'trap_bar': 'trap_bar',
  'hex_bar': 'trap_bar',
  'ab_wheel': 'ab_wheel',
  'trx': 'trx',
  'box': 'box',
  'verhoging': 'box'
};

class SubstitutionEngine {
  /**
   * @param {Array<Object>} exerciseList 
   */
  constructor(exerciseList = []) {
    this.exercises = new Map();
    this.nameIndex = new Map();
    this.loadDatabase(exerciseList);
  }

  /**
   * Laadt of update de oefeningen in het geheugen
   * @param {Array<Object>} list 
   */
  loadDatabase(list) {
    this.exercises.clear();
    this.nameIndex.clear();

    if (!Array.isArray(list)) return;

    for (const ex of list) {
      if (!ex || !ex.id) continue;
      this.exercises.set(ex.id, ex);
      this.nameIndex.set(ex.name.toLowerCase().trim(), ex.id);

      if (Array.isArray(ex.aliases)) {
        for (const alias of ex.aliases) {
          this.nameIndex.set(alias.toLowerCase().trim(), ex.id);
        }
      }
    }
  }

  /**
   * Vind een oefening op ID, naam of alias
   * @param {string} idOrName 
   * @returns {Object|null}
   */
  getExercise(idOrName) {
    if (!idOrName) return null;
    const direct = this.exercises.get(idOrName);
    if (direct) return direct;

    const normalized = idOrName.toLowerCase().trim();
    const mappedId = this.nameIndex.get(normalized);
    if (mappedId) return this.exercises.get(mappedId) || null;

    // Fuzzy fallback: zoek op inclusie
    for (const [key, id] of this.nameIndex.entries()) {
      if (key.includes(normalized) || normalized.includes(key)) {
        return this.exercises.get(id) || null;
      }
    }

    return null;
  }

  /**
   * Normaliseert equipment strings naar gestandaardiseerde keys
   * @param {string} raw 
   * @returns {string}
   */
  normalizeEquipment(raw) {
    if (!raw) return '';
    const clean = raw.toLowerCase().trim();
    return EQUIPMENT_SYNONYMS[clean] || clean.replace(/\s+/g, '_');
  }

  /**
   * Controleert of de gebruiker voldoet aan de apparatuureisen van de oefening
   * @param {Object} exercise 
   * @param {Object} context 
   * @returns {boolean}
   */
  meetsEquipmentCriteria(exercise, context = {}) {
    // 1. Home filter
    if (context.location === 'home' && exercise.is_home_friendly === false) {
      return false;
    }

    // Als er geen apparatuurcontext is meegegeven, neem aan dat alles mag
    if (!context.availableEquipment) {
      return true;
    }

    const userEquipSet = new Set(
      context.availableEquipment.map(eq => this.normalizeEquipment(eq))
    );

    // Als de gebruiker aangeeft in een gym te zijn met 'machine' of 'all', geef toegang tot machines
    const hasAnyMachine = userEquipSet.has('machine') || context.location === 'gym';

    // Controleer required_equipment matrix (OR-groepen van AND-items)
    if (Array.isArray(exercise.required_equipment) && exercise.required_equipment.length > 0) {
      for (const reqGroup of exercise.required_equipment) {
        if (!Array.isArray(reqGroup) || reqGroup.length === 0) continue;

        const allMatched = reqGroup.every(reqItem => {
          const normReq = this.normalizeEquipment(reqItem);
          if (normReq === 'bodyweight') return true;
          if (userEquipSet.has(normReq)) return true;
          // Machine fallback
          if (normReq.endsWith('_machine') && hasAnyMachine) return true;
          // Bench fallback als incline bench vereist is maar gebruiker bench heeft
          if (normReq === 'incline_bench' && (userEquipSet.has('bench') || userEquipSet.has('incline_bench'))) return true;
          return false;
        });

        if (allMatched) return true;
      }
      return false;
    }

    // Fallback voor plain equipment array
    if (Array.isArray(exercise.equipment)) {
      const isPureBodyweight = exercise.equipment.every(eq => 
        eq.toLowerCase().includes('lichaamsgewicht')
      );
      if (isPureBodyweight) return true;

      return exercise.equipment.some(req => {
        const norm = this.normalizeEquipment(req);
        return userEquipSet.has(norm) || (norm.endsWith('_machine') && hasAnyMachine);
      });
    }

    return true;
  }

  /**
   * Berekent de matchingscore tussen de doeloefening en een kandidaat
   * @param {Object} target 
   * @param {Object} candidate 
   * @param {Object} context 
   * @returns {{ score: number, reasons: string[] }}
   */
  calculateMatchScore(target, candidate, context = {}) {
    let score = 0;
    const reasons = [];

    // Criterium A: Expliciet gedefinieerd als 1-op-1 alternatief (+50 pt)
    if (Array.isArray(target.substitutes) && target.substitutes.includes(candidate.id)) {
      score += 50;
      reasons.push('Direct 1-op-1 alternatief');
    }

    // Criterium B: Bewegingspatroon (+30 pt exact, +15 pt gerelateerd)
    if (candidate.movement_pattern === target.movement_pattern) {
      score += 30;
      reasons.push(`Zelfde patroon (${candidate.movement_pattern})`);
    } else if (
      (target.movement_pattern.includes('Push') && candidate.movement_pattern.includes('Push')) ||
      (target.movement_pattern.includes('Pull') && candidate.movement_pattern.includes('Pull')) ||
      (target.movement_pattern.includes('Trekken') && candidate.movement_pattern.includes('Trekken')) ||
      (target.movement_pattern.includes('Hinge') && candidate.movement_pattern.includes('Hinge')) ||
      (target.movement_pattern.includes('Squat') && candidate.movement_pattern.includes('Squat')) ||
      (target.movement_pattern.includes('Lunge') && candidate.movement_pattern.includes('Squat')) ||
      (target.movement_pattern.includes('Squat') && candidate.movement_pattern.includes('Lunge'))
    ) {
      score += 15;
      reasons.push(`Verwant patroon (${candidate.movement_pattern})`);
    }

    // Criterium C: Primaire spiergroep overlap (+20 pt per spier)
    const primaryOverlap = (candidate.primary_muscles || []).filter(cm =>
      (target.primary_muscles || []).some(tm => 
        tm.toLowerCase().split('(')[0].trim() === cm.toLowerCase().split('(')[0].trim()
      )
    );
    if (primaryOverlap.length > 0) {
      score += primaryOverlap.length * 20;
      reasons.push(`Target primaire spieren: ${primaryOverlap.join(', ')}`);
    }

    // Criterium D: Secundaire spiergroep overlap (+6 pt per spier)
    const secondaryOverlap = (candidate.secondary_muscles || []).filter(cm =>
      (target.secondary_muscles || []).some(tm => 
        tm.toLowerCase().split('(')[0].trim() === cm.toLowerCase().split('(')[0].trim()
      )
    );
    if (secondaryOverlap.length > 0) {
      score += secondaryOverlap.length * 6;
    }

    // Criterium E: Type match (Compound vs Isolatie vs Isometrisch) (+15 pt)
    if (candidate.type === target.type) {
      score += 15;
      reasons.push(`Zelfde type (${candidate.type})`);
    }

    // Criterium F: Categorie match (+10 pt)
    if (candidate.category === target.category) {
      score += 10;
    }

    // Criterium G: Symmetrie match (+10 pt)
    if (candidate.symmetry === target.symmetry) {
      score += 10;
    }

    // Criterium H: Gebruikersniveau aansluiting (+5 pt)
    if (context.userLevel && candidate.level === context.userLevel) {
      score += 5;
    }

    // Criterium I: Axiale belasting verlichting (+15 pt bij verlichting van rugdruk)
    const targetLoad = AXIAL_LOAD_WEIGHTS[target.axial_load] ?? 1;
    const candLoad = AXIAL_LOAD_WEIGHTS[candidate.axial_load] ?? 1;
    if (context.maxAxialLoad && candLoad < targetLoad) {
      score += 15;
      reasons.push('Vermindert druk op de rug');
    }

    return { score, reasons };
  }

  /**
   * Vindt en rangschikt de beste alternatieven voor een specifieke oefening
   * @param {string} targetExerciseIdOrName 
   * @param {Object} context 
   * @param {number} limit 
   * @returns {Array<{ exercise: Object, score: number, matchReasons: string[] }>}
   */
  getSubstitutes(targetExerciseIdOrName, context = {}, limit = 5) {
    const target = this.getExercise(targetExerciseIdOrName);
    if (!target) {
      return [];
    }

    const candidates = [];
    const maxAllowedAxial = context.maxAxialLoad 
      ? (AXIAL_LOAD_WEIGHTS[context.maxAxialLoad] ?? 3)
      : 3;

    for (const candidate of this.exercises.values()) {
      // 1. Zichzelf uitsluiten
      if (candidate.id === target.id) continue;

      // 2. Harde filter op axiale belasting (rugklachten / wens tot ontlasting)
      const candAxialWeight = AXIAL_LOAD_WEIGHTS[candidate.axial_load] ?? 1;
      if (candAxialWeight > maxAllowedAxial) {
        continue;
      }

      // 3. Harde filters (Equipment & Locatie)
      if (!this.meetsEquipmentCriteria(candidate, context)) {
        continue;
      }

      // 4. Matchingscore berekenen
      const { score, reasons } = this.calculateMatchScore(target, candidate, context);

      // Alleen relevante kandidaten toelaten (drempel)
      if (score >= 20) {
        candidates.push({
          exercise: candidate,
          score,
          matchReasons: reasons
        });
      }
    }

    // Sorteren op score aflopend
    return candidates
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  /**
   * Filter de database op categorie of patroon
   * @param {Object} filters 
   * @returns {Array<Object>}
   */
  filter(filters = {}) {
    return Array.from(this.exercises.values()).filter(ex => {
      if (filters.category && ex.category !== filters.category) return false;
      if (filters.movement_pattern && ex.movement_pattern !== filters.movement_pattern) return false;
      if (filters.type && ex.type !== filters.type) return false;
      if (filters.is_home_friendly !== undefined && ex.is_home_friendly !== filters.is_home_friendly) return false;
      return true;
    });
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    SubstitutionEngine,
    AXIAL_LOAD_WEIGHTS,
    EQUIPMENT_SYNONYMS
  };
}
