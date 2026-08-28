/**
 * GoFitness Exercise Database
 * Gevalideerde dataset met 107 oefeningen voor workout templates & substitutie.
 */
const EXERCISE_DATABASE = {
  "version": "1.0.0",
  "generated_at": "2026-08-28T20:42:20.646Z",
  "description": "Complete GoFitness Exercise Database met genormaliseerde taxonomie voor intelligente substitutie.",
  "count": 107,
  "exercises": [
    {
      "id": "barbell-bench-press",
      "name": "Barbell Bench Press",
      "aliases": [
        "Bench Press",
        "Flat Barbell Bench Press",
        "Bankdrukken"
      ],
      "category": "Borst",
      "movement_pattern": "Horizontale Push",
      "primary_muscles": [
        "Borst (Midden/Onder)"
      ],
      "secondary_muscles": [
        "Triceps",
        "Voorkant schouder"
      ],
      "type": "Compound",
      "equipment": [
        "Barbell",
        "Vlakke Bank"
      ],
      "required_equipment": [
        [
          "barbell",
          "bench"
        ]
      ],
      "level": "Intermediate",
      "symmetry": "Bilateraal",
      "axial_load": "Gemiddeld",
      "is_home_friendly": false,
      "substitutes": [
        "flat-dumbbell-press",
        "chest-press-machine",
        "push-up",
        "dumbbell-floor-press"
      ]
    },
    {
      "id": "flat-dumbbell-press",
      "name": "Flat Dumbbell Press",
      "aliases": [
        "Dumbbell Bench Press",
        "DB Press",
        "Dumbbell Drukken"
      ],
      "category": "Borst",
      "movement_pattern": "Horizontale Push",
      "primary_muscles": [
        "Borst (Midden/Onder)"
      ],
      "secondary_muscles": [
        "Triceps",
        "Voorkant schouder"
      ],
      "type": "Compound",
      "equipment": [
        "Dumbbells",
        "Vlakke Bank"
      ],
      "required_equipment": [
        [
          "dumbbell",
          "bench"
        ],
        [
          "dumbbell",
          "mat"
        ]
      ],
      "level": "Beginner",
      "symmetry": "Bilateraal",
      "axial_load": "Laag",
      "is_home_friendly": true,
      "substitutes": [
        "barbell-bench-press",
        "chest-press-machine",
        "push-up",
        "dumbbell-floor-press"
      ]
    },
    {
      "id": "incline-dumbbell-press",
      "name": "Incline Dumbbell Press",
      "aliases": [
        "Schuine Dumbbell Press",
        "Incline DB Press"
      ],
      "category": "Borst",
      "movement_pattern": "Incline Push",
      "primary_muscles": [
        "Bovenkant borst"
      ],
      "secondary_muscles": [
        "Triceps",
        "Voorkant schouder"
      ],
      "type": "Compound",
      "equipment": [
        "Dumbbells",
        "Schuine Bank"
      ],
      "required_equipment": [
        [
          "dumbbell",
          "incline_bench"
        ]
      ],
      "level": "Beginner",
      "symmetry": "Bilateraal",
      "axial_load": "Laag",
      "is_home_friendly": true,
      "substitutes": [
        "incline-barbell-bench-press",
        "decline-push-up",
        "incline-push-up"
      ]
    },
    {
      "id": "incline-barbell-bench-press",
      "name": "Incline Barbell Bench Press",
      "aliases": [
        "Incline Bench Press",
        "Schuin Bankdrukken"
      ],
      "category": "Borst",
      "movement_pattern": "Incline Push",
      "primary_muscles": [
        "Bovenkant borst"
      ],
      "secondary_muscles": [
        "Triceps",
        "Voorkant schouder"
      ],
      "type": "Compound",
      "equipment": [
        "Barbell",
        "Schuine Bank"
      ],
      "required_equipment": [
        [
          "barbell",
          "incline_bench"
        ]
      ],
      "level": "Intermediate",
      "symmetry": "Bilateraal",
      "axial_load": "Gemiddeld",
      "is_home_friendly": false,
      "substitutes": [
        "incline-dumbbell-press",
        "decline-push-up"
      ]
    },
    {
      "id": "decline-dumbbell-press",
      "name": "Decline Dumbbell Press",
      "aliases": [
        "Decline DB Press"
      ],
      "category": "Borst",
      "movement_pattern": "Decline Push",
      "primary_muscles": [
        "Onderkant borst"
      ],
      "secondary_muscles": [
        "Triceps",
        "Voorkant schouder"
      ],
      "type": "Compound",
      "equipment": [
        "Dumbbells",
        "Decline Bank"
      ],
      "required_equipment": [
        [
          "dumbbell",
          "decline_bench"
        ]
      ],
      "level": "Beginner",
      "symmetry": "Bilateraal",
      "axial_load": "Laag",
      "is_home_friendly": true,
      "substitutes": [
        "dips",
        "flat-dumbbell-press",
        "push-up"
      ]
    },
    {
      "id": "dumbbell-floor-press",
      "name": "Dumbbell Floor Press",
      "aliases": [
        "Floor Press",
        "Vloerdrukken"
      ],
      "category": "Borst",
      "movement_pattern": "Horizontale Push",
      "primary_muscles": [
        "Borst (Midden/Onder)"
      ],
      "secondary_muscles": [
        "Triceps",
        "Voorkant schouder"
      ],
      "type": "Compound",
      "equipment": [
        "Dumbbells",
        "Mat"
      ],
      "required_equipment": [
        [
          "dumbbell"
        ]
      ],
      "level": "Beginner",
      "symmetry": "Bilateraal",
      "axial_load": "Geen",
      "is_home_friendly": true,
      "substitutes": [
        "flat-dumbbell-press",
        "push-up"
      ]
    },
    {
      "id": "push-up",
      "name": "Push-up",
      "aliases": [
        "Opdrukken",
        "Standard Push-up"
      ],
      "category": "Borst",
      "movement_pattern": "Horizontale Push",
      "primary_muscles": [
        "Borst (Midden/Onder)"
      ],
      "secondary_muscles": [
        "Triceps",
        "Voorkant schouder",
        "Core"
      ],
      "type": "Compound",
      "equipment": [
        "Lichaamsgewicht"
      ],
      "required_equipment": [
        [
          "bodyweight"
        ]
      ],
      "level": "Beginner",
      "symmetry": "Bilateraal",
      "axial_load": "Geen",
      "is_home_friendly": true,
      "substitutes": [
        "incline-push-up",
        "deficit-push-up",
        "flat-dumbbell-press",
        "chest-press-machine"
      ]
    },
    {
      "id": "incline-push-up",
      "name": "Incline Push-up",
      "aliases": [
        "Hands-Elevated Push-up",
        "Opdrukken op verhoging"
      ],
      "category": "Borst",
      "movement_pattern": "Incline Push",
      "primary_muscles": [
        "Borst (Midden/Onder)"
      ],
      "secondary_muscles": [
        "Triceps",
        "Voorkant schouder",
        "Core"
      ],
      "type": "Compound",
      "equipment": [
        "Lichaamsgewicht",
        "Verhoging / Bankje / Tafel"
      ],
      "required_equipment": [
        [
          "bodyweight"
        ]
      ],
      "level": "Beginner",
      "symmetry": "Bilateraal",
      "axial_load": "Geen",
      "is_home_friendly": true,
      "substitutes": [
        "push-up",
        "chest-press-machine"
      ]
    },
    {
      "id": "decline-push-up",
      "name": "Decline Push-up",
      "aliases": [
        "Feet-Elevated Push-up",
        "Voeten op verhoging opdrukken"
      ],
      "category": "Borst",
      "movement_pattern": "Incline Push",
      "primary_muscles": [
        "Bovenkant borst"
      ],
      "secondary_muscles": [
        "Triceps",
        "Voorkant schouder",
        "Core"
      ],
      "type": "Compound",
      "equipment": [
        "Lichaamsgewicht",
        "Verhoging"
      ],
      "required_equipment": [
        [
          "bodyweight"
        ]
      ],
      "level": "Intermediate",
      "symmetry": "Bilateraal",
      "axial_load": "Geen",
      "is_home_friendly": true,
      "substitutes": [
        "incline-dumbbell-press",
        "push-up",
        "deficit-push-up"
      ]
    },
    {
      "id": "deficit-push-up",
      "name": "Deficit Push-up",
      "aliases": [
        "Elevated Hands Push-up",
        "Deep Push-up"
      ],
      "category": "Borst",
      "movement_pattern": "Horizontale Push",
      "primary_muscles": [
        "Borst (Midden/Onder)"
      ],
      "secondary_muscles": [
        "Triceps",
        "Core"
      ],
      "type": "Compound",
      "equipment": [
        "Lichaamsgewicht",
        "Push-up bars / Verhoging"
      ],
      "required_equipment": [
        [
          "bodyweight"
        ]
      ],
      "level": "Intermediate",
      "symmetry": "Bilateraal",
      "axial_load": "Geen",
      "is_home_friendly": true,
      "substitutes": [
        "push-up",
        "dips",
        "flat-dumbbell-press"
      ]
    },
    {
      "id": "chest-press-machine",
      "name": "Chest Press Machine",
      "aliases": [
        "Seated Chest Press",
        "Machine Borstdrukken"
      ],
      "category": "Borst",
      "movement_pattern": "Horizontale Push",
      "primary_muscles": [
        "Borst (Midden/Onder)"
      ],
      "secondary_muscles": [
        "Triceps",
        "Voorkant schouder"
      ],
      "type": "Compound",
      "equipment": [
        "Chest Press Machine"
      ],
      "required_equipment": [
        [
          "chest_press_machine"
        ],
        [
          "machine"
        ]
      ],
      "level": "Beginner",
      "symmetry": "Bilateraal",
      "axial_load": "Geen",
      "is_home_friendly": false,
      "substitutes": [
        "barbell-bench-press",
        "flat-dumbbell-press",
        "push-up",
        "cable-chest-press"
      ]
    },
    {
      "id": "cable-chest-press",
      "name": "Cable Chest Press",
      "aliases": [
        "Standing Cable Press"
      ],
      "category": "Borst",
      "movement_pattern": "Horizontale Push",
      "primary_muscles": [
        "Borst (Midden/Onder)"
      ],
      "secondary_muscles": [
        "Triceps",
        "Voorkant schouder",
        "Core"
      ],
      "type": "Compound",
      "equipment": [
        "Cable Machine"
      ],
      "required_equipment": [
        [
          "cable_machine"
        ]
      ],
      "level": "Beginner",
      "symmetry": "Bilateraal",
      "axial_load": "Geen",
      "is_home_friendly": false,
      "substitutes": [
        "chest-press-machine",
        "flat-dumbbell-press",
        "push-up"
      ]
    },
    {
      "id": "dips",
      "name": "Dips (Chest Focus)",
      "aliases": [
        "Chest Dips",
        "Parallel Bar Dips"
      ],
      "category": "Borst",
      "movement_pattern": "Verticale/Incline Push",
      "primary_muscles": [
        "Onderkant borst",
        "Triceps"
      ],
      "secondary_muscles": [
        "Voorkant schouder"
      ],
      "type": "Compound",
      "equipment": [
        "Dip Station / Dip Bars"
      ],
      "required_equipment": [
        [
          "dip_station"
        ],
        [
          "bodyweight"
        ]
      ],
      "level": "Intermediate",
      "symmetry": "Bilateraal",
      "axial_load": "Geen",
      "is_home_friendly": true,
      "substitutes": [
        "push-up",
        "close-grip-bench-press",
        "bench-dips",
        "decline-dumbbell-press"
      ]
    },
    {
      "id": "cable-fly",
      "name": "Cable Fly / Crossover",
      "aliases": [
        "Cable Crossover",
        "Cable Chest Fly"
      ],
      "category": "Borst",
      "movement_pattern": "Fly",
      "primary_muscles": [
        "Borst (Midden/Onder)"
      ],
      "secondary_muscles": [
        "Voorkant schouder"
      ],
      "type": "Isolatie",
      "equipment": [
        "Cable Machine"
      ],
      "required_equipment": [
        [
          "cable_machine"
        ]
      ],
      "level": "Beginner",
      "symmetry": "Bilateraal",
      "axial_load": "Geen",
      "is_home_friendly": false,
      "substitutes": [
        "dumbbell-fly",
        "machine-pec-deck"
      ]
    },
    {
      "id": "dumbbell-fly",
      "name": "Dumbbell Fly",
      "aliases": [
        "DB Flyes",
        "Flat Dumbbell Fly"
      ],
      "category": "Borst",
      "movement_pattern": "Fly",
      "primary_muscles": [
        "Borst (Midden/Onder)"
      ],
      "secondary_muscles": [
        "Voorkant schouder"
      ],
      "type": "Isolatie",
      "equipment": [
        "Dumbbells",
        "Vlakke Bank"
      ],
      "required_equipment": [
        [
          "dumbbell",
          "bench"
        ]
      ],
      "level": "Beginner",
      "symmetry": "Bilateraal",
      "axial_load": "Geen",
      "is_home_friendly": true,
      "substitutes": [
        "cable-fly",
        "machine-pec-deck"
      ]
    },
    {
      "id": "machine-pec-deck",
      "name": "Machine Pec Deck",
      "aliases": [
        "Pec Fly Machine",
        "Seated Pec Deck"
      ],
      "category": "Borst",
      "movement_pattern": "Fly",
      "primary_muscles": [
        "Borst (Midden/Onder)"
      ],
      "secondary_muscles": [
        "Voorkant schouder"
      ],
      "type": "Isolatie",
      "equipment": [
        "Pec Deck Machine"
      ],
      "required_equipment": [
        [
          "pec_deck_machine"
        ],
        [
          "machine"
        ]
      ],
      "level": "Beginner",
      "symmetry": "Bilateraal",
      "axial_load": "Geen",
      "is_home_friendly": false,
      "substitutes": [
        "cable-fly",
        "dumbbell-fly"
      ]
    },
    {
      "id": "lat-pulldown",
      "name": "Lat Pulldown",
      "aliases": [
        "Cable Lat Pulldown",
        "Wide-Grip Lat Pulldown"
      ],
      "category": "Rug",
      "movement_pattern": "Verticaal Trekken",
      "primary_muscles": [
        "Brede rugspier (Lats)"
      ],
      "secondary_muscles": [
        "Biceps",
        "Bovenrug"
      ],
      "type": "Compound",
      "equipment": [
        "Lat Pulldown Machine"
      ],
      "required_equipment": [
        [
          "lat_pulldown_machine"
        ],
        [
          "cable_machine"
        ]
      ],
      "level": "Beginner",
      "symmetry": "Bilateraal",
      "axial_load": "Geen",
      "is_home_friendly": false,
      "substitutes": [
        "pull-up",
        "chin-up",
        "neutral-grip-lat-pulldown",
        "close-grip-supinated-lat-pulldown"
      ]
    },
    {
      "id": "pull-up",
      "name": "Pull-up",
      "aliases": [
        "Optrekken (bovenhands)",
        "Overhand Pull-up"
      ],
      "category": "Rug",
      "movement_pattern": "Verticaal Trekken",
      "primary_muscles": [
        "Brede rugspier (Lats)"
      ],
      "secondary_muscles": [
        "Biceps",
        "Bovenrug",
        "Core"
      ],
      "type": "Compound",
      "equipment": [
        "Optrekstang"
      ],
      "required_equipment": [
        [
          "pullup_bar"
        ]
      ],
      "level": "Intermediate",
      "symmetry": "Bilateraal",
      "axial_load": "Geen",
      "is_home_friendly": true,
      "substitutes": [
        "lat-pulldown",
        "chin-up",
        "inverted-row"
      ]
    },
    {
      "id": "chin-up",
      "name": "Chin-up",
      "aliases": [
        "Optrekken (onderhands)",
        "Underhand Pull-up"
      ],
      "category": "Rug",
      "movement_pattern": "Verticaal Trekken",
      "primary_muscles": [
        "Brede rugspier (Lats)",
        "Biceps"
      ],
      "secondary_muscles": [
        "Bovenrug",
        "Core"
      ],
      "type": "Compound",
      "equipment": [
        "Optrekstang"
      ],
      "required_equipment": [
        [
          "pullup_bar"
        ]
      ],
      "level": "Intermediate",
      "symmetry": "Bilateraal",
      "axial_load": "Geen",
      "is_home_friendly": true,
      "substitutes": [
        "pull-up",
        "close-grip-supinated-lat-pulldown",
        "lat-pulldown"
      ]
    },
    {
      "id": "neutral-grip-lat-pulldown",
      "name": "Neutral-Grip Lat Pulldown",
      "aliases": [
        "V-Bar Pulldown",
        "Parallel Grip Pulldown"
      ],
      "category": "Rug",
      "movement_pattern": "Verticaal Trekken",
      "primary_muscles": [
        "Brede rugspier (Lats)"
      ],
      "secondary_muscles": [
        "Biceps",
        "Bovenrug"
      ],
      "type": "Compound",
      "equipment": [
        "Lat Pulldown Machine",
        "V-Grip Handle"
      ],
      "required_equipment": [
        [
          "lat_pulldown_machine"
        ],
        [
          "cable_machine"
        ]
      ],
      "level": "Beginner",
      "symmetry": "Bilateraal",
      "axial_load": "Geen",
      "is_home_friendly": false,
      "substitutes": [
        "lat-pulldown",
        "close-grip-supinated-lat-pulldown",
        "pull-up"
      ]
    },
    {
      "id": "close-grip-supinated-lat-pulldown",
      "name": "Close-Grip Supinated Lat Pulldown (Mentzer)",
      "aliases": [
        "Underhand Lat Pulldown",
        "Reverse Grip Pulldown",
        "Mentzer Pulldown"
      ],
      "category": "Rug",
      "movement_pattern": "Verticaal Trekken",
      "primary_muscles": [
        "Brede rugspier (Lats)",
        "Biceps"
      ],
      "secondary_muscles": [
        "Brachialis",
        "Bovenrug",
        "Onderarmen"
      ],
      "type": "Compound",
      "equipment": [
        "Lat Pulldown Machine"
      ],
      "required_equipment": [
        [
          "lat_pulldown_machine"
        ],
        [
          "cable_machine"
        ]
      ],
      "level": "Beginner",
      "symmetry": "Bilateraal",
      "axial_load": "Geen",
      "is_home_friendly": false,
      "substitutes": [
        "chin-up",
        "lat-pulldown",
        "neutral-grip-lat-pulldown",
        "pull-up"
      ]
    },
    {
      "id": "barbell-bent-over-row",
      "name": "Barbell Bent-Over Row",
      "aliases": [
        "Barbell Row",
        "Bent-Over Row",
        "BB Row"
      ],
      "category": "Rug",
      "movement_pattern": "Horizontaal Trekken",
      "primary_muscles": [
        "Bovenrug",
        "Brede rugspier (Lats)"
      ],
      "secondary_muscles": [
        "Biceps",
        "Onderrug",
        "Hamstrings"
      ],
      "type": "Compound",
      "equipment": [
        "Barbell"
      ],
      "required_equipment": [
        [
          "barbell"
        ]
      ],
      "level": "Intermediate",
      "symmetry": "Bilateraal",
      "axial_load": "Hoog",
      "is_home_friendly": false,
      "substitutes": [
        "chest-supported-row",
        "single-arm-dumbbell-row",
        "seated-cable-row",
        "t-bar-row"
      ]
    },
    {
      "id": "single-arm-dumbbell-row",
      "name": "Single-Arm Dumbbell Row",
      "aliases": [
        "One-Arm DB Row",
        "Kroc Row",
        "Zaagbeweging"
      ],
      "category": "Rug",
      "movement_pattern": "Horizontaal Trekken",
      "primary_muscles": [
        "Brede rugspier (Lats)",
        "Bovenrug"
      ],
      "secondary_muscles": [
        "Biceps",
        "Core"
      ],
      "type": "Compound",
      "equipment": [
        "Dumbbells",
        "Vlakke Bank"
      ],
      "required_equipment": [
        [
          "dumbbell",
          "bench"
        ],
        [
          "dumbbell"
        ]
      ],
      "level": "Beginner",
      "symmetry": "Unilateraal",
      "axial_load": "Laag",
      "is_home_friendly": true,
      "substitutes": [
        "seated-cable-row",
        "chest-supported-row",
        "single-arm-cable-row"
      ]
    },
    {
      "id": "seated-cable-row",
      "name": "Seated Cable Row",
      "aliases": [
        "Cable Row",
        "Low Row Machine"
      ],
      "category": "Rug",
      "movement_pattern": "Horizontaal Trekken",
      "primary_muscles": [
        "Middenrug",
        "Brede rugspier (Lats)"
      ],
      "secondary_muscles": [
        "Biceps",
        "Achterkant schouder"
      ],
      "type": "Compound",
      "equipment": [
        "Cable Machine / Seated Row"
      ],
      "required_equipment": [
        [
          "cable_machine"
        ],
        [
          "seated_row_machine"
        ]
      ],
      "level": "Beginner",
      "symmetry": "Bilateraal",
      "axial_load": "Laag",
      "is_home_friendly": false,
      "substitutes": [
        "single-arm-dumbbell-row",
        "chest-supported-row",
        "barbell-bent-over-row"
      ]
    },
    {
      "id": "chest-supported-row",
      "name": "Chest-Supported Row",
      "aliases": [
        "Incline DB Row",
        "Seal Row",
        "Machine Row"
      ],
      "category": "Rug",
      "movement_pattern": "Horizontaal Trekken",
      "primary_muscles": [
        "Bovenrug",
        "Bovenste Trapezius"
      ],
      "secondary_muscles": [
        "Biceps",
        "Achterkant schouder"
      ],
      "type": "Compound",
      "equipment": [
        "Dumbbells",
        "Schuine Bank / Machine"
      ],
      "required_equipment": [
        [
          "dumbbell",
          "incline_bench"
        ],
        [
          "machine"
        ]
      ],
      "level": "Beginner",
      "symmetry": "Bilateraal",
      "axial_load": "Geen",
      "is_home_friendly": true,
      "substitutes": [
        "seated-cable-row",
        "single-arm-dumbbell-row",
        "inverted-row"
      ]
    },
    {
      "id": "t-bar-row",
      "name": "T-Bar Row",
      "aliases": [
        "Landmine Row",
        "T-Bar"
      ],
      "category": "Rug",
      "movement_pattern": "Horizontaal Trekken",
      "primary_muscles": [
        "Bovenrug",
        "Middenrug"
      ],
      "secondary_muscles": [
        "Brede rugspier (Lats)",
        "Biceps",
        "Onderrug"
      ],
      "type": "Compound",
      "equipment": [
        "T-Bar Row Machine / Barbell"
      ],
      "required_equipment": [
        [
          "barbell"
        ],
        [
          "t_bar_machine"
        ]
      ],
      "level": "Intermediate",
      "symmetry": "Bilateraal",
      "axial_load": "Gemiddeld",
      "is_home_friendly": false,
      "substitutes": [
        "chest-supported-row",
        "barbell-bent-over-row",
        "seated-cable-row"
      ]
    },
    {
      "id": "inverted-row",
      "name": "Inverted Row (Australian Pull-up)",
      "aliases": [
        "Bodyweight Row",
        "TRX Row",
        "Ring Row"
      ],
      "category": "Rug",
      "movement_pattern": "Horizontaal Trekken",
      "primary_muscles": [
        "Bovenrug",
        "Brede rugspier (Lats)"
      ],
      "secondary_muscles": [
        "Biceps",
        "Core"
      ],
      "type": "Compound",
      "equipment": [
        "Barbell in rack / Ringen / TRX / Tafel"
      ],
      "required_equipment": [
        [
          "bodyweight"
        ],
        [
          "trx"
        ]
      ],
      "level": "Beginner",
      "symmetry": "Bilateraal",
      "axial_load": "Geen",
      "is_home_friendly": true,
      "substitutes": [
        "chest-supported-row",
        "pull-up",
        "single-arm-dumbbell-row"
      ]
    },
    {
      "id": "single-arm-cable-row",
      "name": "Single-Arm Cable Row",
      "aliases": [
        "One-Arm Cable Row"
      ],
      "category": "Rug",
      "movement_pattern": "Horizontaal Trekken",
      "primary_muscles": [
        "Brede rugspier (Lats)"
      ],
      "secondary_muscles": [
        "Biceps",
        "Core"
      ],
      "type": "Compound",
      "equipment": [
        "Cable Machine"
      ],
      "required_equipment": [
        [
          "cable_machine"
        ]
      ],
      "level": "Beginner",
      "symmetry": "Unilateraal",
      "axial_load": "Geen",
      "is_home_friendly": false,
      "substitutes": [
        "single-arm-dumbbell-row",
        "seated-cable-row"
      ]
    },
    {
      "id": "straight-arm-pulldown",
      "name": "Straight-Arm Pulldown",
      "aliases": [
        "Cable Lat Pushdown",
        "Lat Pullover Cable"
      ],
      "category": "Rug",
      "movement_pattern": "Pull / Extensie",
      "primary_muscles": [
        "Brede rugspier (Lats)"
      ],
      "secondary_muscles": [
        "Triceps",
        "Core"
      ],
      "type": "Isolatie",
      "equipment": [
        "Cable Machine",
        "Rechte Stang / Touw"
      ],
      "required_equipment": [
        [
          "cable_machine"
        ]
      ],
      "level": "Beginner",
      "symmetry": "Bilateraal",
      "axial_load": "Geen",
      "is_home_friendly": false,
      "substitutes": [
        "dumbbell-pullover"
      ]
    },
    {
      "id": "dumbbell-pullover",
      "name": "Dumbbell Pullover",
      "aliases": [
        "DB Pullover"
      ],
      "category": "Rug",
      "movement_pattern": "Pull / Extensie",
      "primary_muscles": [
        "Brede rugspier (Lats)",
        "Serratus"
      ],
      "secondary_muscles": [
        "Borst (Midden/Onder)",
        "Triceps"
      ],
      "type": "Isolatie",
      "equipment": [
        "Dumbbells",
        "Vlakke Bank"
      ],
      "required_equipment": [
        [
          "dumbbell",
          "bench"
        ]
      ],
      "level": "Intermediate",
      "symmetry": "Bilateraal",
      "axial_load": "Geen",
      "is_home_friendly": true,
      "substitutes": [
        "straight-arm-pulldown"
      ]
    },
    {
      "id": "face-pull",
      "name": "Face Pull",
      "aliases": [
        "Cable Face Pull",
        "Rope Face Pull"
      ],
      "category": "Rug",
      "movement_pattern": "Horizontaal Trekken / Rotatie",
      "primary_muscles": [
        "Achterkant schouder",
        "Bovenste Trapezius"
      ],
      "secondary_muscles": [
        "Rotator Cuff"
      ],
      "type": "Isolatie",
      "equipment": [
        "Cable Machine / Resistance Band",
        "Touw"
      ],
      "required_equipment": [
        [
          "cable_machine"
        ],
        [
          "resistance_band"
        ]
      ],
      "level": "Beginner",
      "symmetry": "Bilateraal",
      "axial_load": "Geen",
      "is_home_friendly": true,
      "substitutes": [
        "rear-delt-dumbbell-fly",
        "reverse-pec-deck"
      ]
    },
    {
      "id": "overhead-press",
      "name": "Overhead Press (OHP)",
      "aliases": [
        "Military Press",
        "Standing Barbell Shoulder Press"
      ],
      "category": "Schouders",
      "movement_pattern": "Verticale Push",
      "primary_muscles": [
        "Voorkant schouder"
      ],
      "secondary_muscles": [
        "Zijkant schouder",
        "Triceps",
        "Core"
      ],
      "type": "Compound",
      "equipment": [
        "Barbell"
      ],
      "required_equipment": [
        [
          "barbell"
        ]
      ],
      "level": "Intermediate",
      "symmetry": "Bilateraal",
      "axial_load": "Hoog",
      "is_home_friendly": false,
      "substitutes": [
        "seated-db-shoulder-press",
        "machine-shoulder-press",
        "arnold-press"
      ]
    },
    {
      "id": "seated-db-shoulder-press",
      "name": "Seated DB Shoulder Press",
      "aliases": [
        "Dumbbell Shoulder Press",
        "DB Overhead Press"
      ],
      "category": "Schouders",
      "movement_pattern": "Verticale Push",
      "primary_muscles": [
        "Voorkant schouder"
      ],
      "secondary_muscles": [
        "Zijkant schouder",
        "Triceps"
      ],
      "type": "Compound",
      "equipment": [
        "Dumbbells",
        "Schuine/Rechte Bank"
      ],
      "required_equipment": [
        [
          "dumbbell",
          "bench"
        ],
        [
          "dumbbell"
        ]
      ],
      "level": "Beginner",
      "symmetry": "Bilateraal",
      "axial_load": "Laag",
      "is_home_friendly": true,
      "substitutes": [
        "overhead-press",
        "machine-shoulder-press",
        "arnold-press"
      ]
    },
    {
      "id": "arnold-press",
      "name": "Arnold Press",
      "aliases": [
        "Arnold Dumbbell Press"
      ],
      "category": "Schouders",
      "movement_pattern": "Verticale Push",
      "primary_muscles": [
        "Voorkant schouder",
        "Zijkant schouder"
      ],
      "secondary_muscles": [
        "Triceps"
      ],
      "type": "Compound",
      "equipment": [
        "Dumbbells",
        "Bankje"
      ],
      "required_equipment": [
        [
          "dumbbell",
          "bench"
        ],
        [
          "dumbbell"
        ]
      ],
      "level": "Intermediate",
      "symmetry": "Bilateraal",
      "axial_load": "Laag",
      "is_home_friendly": true,
      "substitutes": [
        "seated-db-shoulder-press",
        "overhead-press",
        "machine-shoulder-press"
      ]
    },
    {
      "id": "machine-shoulder-press",
      "name": "Machine Shoulder Press",
      "aliases": [
        "Seated Machine OHP"
      ],
      "category": "Schouders",
      "movement_pattern": "Verticale Push",
      "primary_muscles": [
        "Voorkant schouder"
      ],
      "secondary_muscles": [
        "Zijkant schouder",
        "Triceps"
      ],
      "type": "Compound",
      "equipment": [
        "Shoulder Press Machine"
      ],
      "required_equipment": [
        [
          "shoulder_press_machine"
        ],
        [
          "machine"
        ]
      ],
      "level": "Beginner",
      "symmetry": "Bilateraal",
      "axial_load": "Geen",
      "is_home_friendly": false,
      "substitutes": [
        "seated-db-shoulder-press",
        "overhead-press"
      ]
    },
    {
      "id": "dumbbell-lateral-raise",
      "name": "Dumbbell Lateral Raise",
      "aliases": [
        "DB Side Raise",
        "Zijwaarts heffen"
      ],
      "category": "Schouders",
      "movement_pattern": "Abductie",
      "primary_muscles": [
        "Zijkant schouder"
      ],
      "secondary_muscles": [
        "Bovenste Trapezius"
      ],
      "type": "Isolatie",
      "equipment": [
        "Dumbbells"
      ],
      "required_equipment": [
        [
          "dumbbell"
        ]
      ],
      "level": "Beginner",
      "symmetry": "Bilateraal",
      "axial_load": "Geen",
      "is_home_friendly": true,
      "substitutes": [
        "cable-lateral-raise",
        "cable-y-raise",
        "lu-raises"
      ]
    },
    {
      "id": "cable-lateral-raise",
      "name": "Cable Lateral Raise",
      "aliases": [
        "Cable Side Raise",
        "Single-Arm Cable Lateral"
      ],
      "category": "Schouders",
      "movement_pattern": "Abductie",
      "primary_muscles": [
        "Zijkant schouder"
      ],
      "secondary_muscles": [
        "Bovenste Trapezius"
      ],
      "type": "Isolatie",
      "equipment": [
        "Cable Machine"
      ],
      "required_equipment": [
        [
          "cable_machine"
        ]
      ],
      "level": "Beginner",
      "symmetry": "Unilateraal",
      "axial_load": "Geen",
      "is_home_friendly": false,
      "substitutes": [
        "dumbbell-lateral-raise",
        "cable-y-raise"
      ]
    },
    {
      "id": "cable-y-raise",
      "name": "Cable Y-Raise",
      "aliases": [
        "Cable Incline Lateral Raise"
      ],
      "category": "Schouders",
      "movement_pattern": "Abductie / Elevatie",
      "primary_muscles": [
        "Zijkant schouder"
      ],
      "secondary_muscles": [
        "Bovenste Trapezius"
      ],
      "type": "Isolatie",
      "equipment": [
        "Cable Machine"
      ],
      "required_equipment": [
        [
          "cable_machine"
        ]
      ],
      "level": "Beginner",
      "symmetry": "Bilateraal",
      "axial_load": "Geen",
      "is_home_friendly": false,
      "substitutes": [
        "cable-lateral-raise",
        "dumbbell-lateral-raise"
      ]
    },
    {
      "id": "lu-raises",
      "name": "Lu Raises (Full ROM Lateral)",
      "aliases": [
        "Full ROM Lateral Raise",
        "Lu Xiaojun Raise"
      ],
      "category": "Schouders",
      "movement_pattern": "Abductie",
      "primary_muscles": [
        "Zijkant schouder"
      ],
      "secondary_muscles": [
        "Bovenste Trapezius",
        "Serratus"
      ],
      "type": "Isolatie",
      "equipment": [
        "Lichte Dumbbells / Schijven"
      ],
      "required_equipment": [
        [
          "dumbbell"
        ]
      ],
      "level": "Intermediate",
      "symmetry": "Bilateraal",
      "axial_load": "Geen",
      "is_home_friendly": true,
      "substitutes": [
        "dumbbell-lateral-raise"
      ]
    },
    {
      "id": "upright-row",
      "name": "Upright Row",
      "aliases": [
        "Cable Upright Row",
        "Barbell Upright Row"
      ],
      "category": "Schouders",
      "movement_pattern": "Verticale Pull",
      "primary_muscles": [
        "Zijkant schouder",
        "Bovenste Trapezius"
      ],
      "secondary_muscles": [
        "Biceps"
      ],
      "type": "Compound",
      "equipment": [
        "Cable / EZ-stang / Dumbbells"
      ],
      "required_equipment": [
        [
          "cable_machine"
        ],
        [
          "barbell"
        ],
        [
          "dumbbell"
        ]
      ],
      "level": "Intermediate",
      "symmetry": "Bilateraal",
      "axial_load": "Laag",
      "is_home_friendly": true,
      "substitutes": [
        "dumbbell-lateral-raise",
        "cable-lateral-raise",
        "face-pull"
      ]
    },
    {
      "id": "dumbbell-front-raise",
      "name": "Dumbbell Front Raise",
      "aliases": [
        "Front Raise"
      ],
      "category": "Schouders",
      "movement_pattern": "Flexie",
      "primary_muscles": [
        "Voorkant schouder"
      ],
      "secondary_muscles": [
        "Bovenkant borst"
      ],
      "type": "Isolatie",
      "equipment": [
        "Dumbbells"
      ],
      "required_equipment": [
        [
          "dumbbell"
        ]
      ],
      "level": "Beginner",
      "symmetry": "Bilateraal",
      "axial_load": "Geen",
      "is_home_friendly": true,
      "substitutes": [
        "seated-db-shoulder-press"
      ]
    },
    {
      "id": "reverse-pec-deck",
      "name": "Reverse Pec Deck / Fly",
      "aliases": [
        "Rear Delt Fly Machine",
        "Reverse Fly"
      ],
      "category": "Schouders",
      "movement_pattern": "Horizontale Abductie",
      "primary_muscles": [
        "Achterkant schouder"
      ],
      "secondary_muscles": [
        "Rhomboideus",
        "Middenrug"
      ],
      "type": "Isolatie",
      "equipment": [
        "Pec Deck Machine / Rear Delt Machine"
      ],
      "required_equipment": [
        [
          "pec_deck_machine"
        ],
        [
          "machine"
        ]
      ],
      "level": "Beginner",
      "symmetry": "Bilateraal",
      "axial_load": "Geen",
      "is_home_friendly": false,
      "substitutes": [
        "rear-delt-dumbbell-fly",
        "face-pull"
      ]
    },
    {
      "id": "rear-delt-dumbbell-fly",
      "name": "Rear Delt Dumbbell Fly",
      "aliases": [
        "Bent-Over DB Rear Delt Fly"
      ],
      "category": "Schouders",
      "movement_pattern": "Horizontale Abductie",
      "primary_muscles": [
        "Achterkant schouder"
      ],
      "secondary_muscles": [
        "Rhomboideus",
        "Bovenste Trapezius"
      ],
      "type": "Isolatie",
      "equipment": [
        "Dumbbells",
        "Vlakke / Schuine Bank"
      ],
      "required_equipment": [
        [
          "dumbbell"
        ]
      ],
      "level": "Beginner",
      "symmetry": "Bilateraal",
      "axial_load": "Geen",
      "is_home_friendly": true,
      "substitutes": [
        "reverse-pec-deck",
        "face-pull"
      ]
    },
    {
      "id": "dumbbell-shrug",
      "name": "Dumbbell Shrug",
      "aliases": [
        "DB Shrugs",
        "Schouderophalen DB"
      ],
      "category": "Schouders",
      "movement_pattern": "Elevatie",
      "primary_muscles": [
        "Bovenste Trapezius"
      ],
      "secondary_muscles": [
        "Grip",
        "Nek"
      ],
      "type": "Isolatie",
      "equipment": [
        "Dumbbells"
      ],
      "required_equipment": [
        [
          "dumbbell"
        ]
      ],
      "level": "Beginner",
      "symmetry": "Bilateraal",
      "axial_load": "Laag",
      "is_home_friendly": true,
      "substitutes": [
        "barbell-shrug"
      ]
    },
    {
      "id": "barbell-shrug",
      "name": "Barbell Shrug",
      "aliases": [
        "BB Shrugs"
      ],
      "category": "Schouders",
      "movement_pattern": "Elevatie",
      "primary_muscles": [
        "Bovenste Trapezius"
      ],
      "secondary_muscles": [
        "Grip",
        "Onderarmen"
      ],
      "type": "Isolatie",
      "equipment": [
        "Barbell"
      ],
      "required_equipment": [
        [
          "barbell"
        ]
      ],
      "level": "Intermediate",
      "symmetry": "Bilateraal",
      "axial_load": "Gemiddeld",
      "is_home_friendly": false,
      "substitutes": [
        "dumbbell-shrug"
      ]
    },
    {
      "id": "barbell-back-squat",
      "name": "Barbell Back Squat",
      "aliases": [
        "Back Squat",
        "Kniebuigen",
        "Squat"
      ],
      "category": "Benen (Knie-dominant)",
      "movement_pattern": "Squat",
      "primary_muscles": [
        "Quadriceps",
        "Glutes"
      ],
      "secondary_muscles": [
        "Hamstrings",
        "Onderrug",
        "Core"
      ],
      "type": "Compound",
      "equipment": [
        "Barbell",
        "Squat Rack"
      ],
      "required_equipment": [
        [
          "barbell",
          "squat_rack"
        ]
      ],
      "level": "Intermediate",
      "symmetry": "Bilateraal",
      "axial_load": "Hoog",
      "is_home_friendly": false,
      "substitutes": [
        "goblet-squat",
        "leg-press",
        "hack-squat",
        "front-squat",
        "belt-squat",
        "bulgarian-split-squat"
      ]
    },
    {
      "id": "front-squat",
      "name": "Front Squat",
      "aliases": [
        "Barbell Front Squat"
      ],
      "category": "Benen (Knie-dominant)",
      "movement_pattern": "Squat",
      "primary_muscles": [
        "Quadriceps"
      ],
      "secondary_muscles": [
        "Glutes",
        "Bovenrug",
        "Core"
      ],
      "type": "Compound",
      "equipment": [
        "Barbell",
        "Squat Rack"
      ],
      "required_equipment": [
        [
          "barbell",
          "squat_rack"
        ]
      ],
      "level": "Intermediate",
      "symmetry": "Bilateraal",
      "axial_load": "Hoog",
      "is_home_friendly": false,
      "substitutes": [
        "barbell-back-squat",
        "goblet-squat",
        "hack-squat"
      ]
    },
    {
      "id": "goblet-squat",
      "name": "Goblet Squat",
      "aliases": [
        "Dumbbell Squat",
        "Kettlebell Goblet Squat"
      ],
      "category": "Benen (Knie-dominant)",
      "movement_pattern": "Squat",
      "primary_muscles": [
        "Quadriceps",
        "Glutes"
      ],
      "secondary_muscles": [
        "Core",
        "Bovenrug"
      ],
      "type": "Compound",
      "equipment": [
        "Dumbbell / Kettlebell"
      ],
      "required_equipment": [
        [
          "dumbbell"
        ],
        [
          "kettlebell"
        ]
      ],
      "level": "Beginner",
      "symmetry": "Bilateraal",
      "axial_load": "Laag",
      "is_home_friendly": true,
      "substitutes": [
        "barbell-back-squat",
        "heel-elevated-goblet-squat",
        "bodyweight-squat",
        "leg-press"
      ]
    },
    {
      "id": "heel-elevated-goblet-squat",
      "name": "Heel-Elevated Goblet Squat",
      "aliases": [
        "Cyclist Squat",
        "Squat op verhoging"
      ],
      "category": "Benen (Knie-dominant)",
      "movement_pattern": "Squat",
      "primary_muscles": [
        "Quadriceps"
      ],
      "secondary_muscles": [
        "Glutes",
        "Core"
      ],
      "type": "Compound",
      "equipment": [
        "Dumbbell",
        "Wedges / Verhoging"
      ],
      "required_equipment": [
        [
          "dumbbell"
        ]
      ],
      "level": "Beginner",
      "symmetry": "Bilateraal",
      "axial_load": "Laag",
      "is_home_friendly": true,
      "substitutes": [
        "goblet-squat",
        "hack-squat",
        "leg-extension"
      ]
    },
    {
      "id": "hack-squat",
      "name": "Hack Squat",
      "aliases": [
        "Machine Hack Squat"
      ],
      "category": "Benen (Knie-dominant)",
      "movement_pattern": "Squat",
      "primary_muscles": [
        "Quadriceps"
      ],
      "secondary_muscles": [
        "Glutes"
      ],
      "type": "Compound",
      "equipment": [
        "Hack Squat Machine"
      ],
      "required_equipment": [
        [
          "hack_squat_machine"
        ],
        [
          "machine"
        ]
      ],
      "level": "Beginner",
      "symmetry": "Bilateraal",
      "axial_load": "Gemiddeld",
      "is_home_friendly": false,
      "substitutes": [
        "leg-press",
        "barbell-back-squat",
        "goblet-squat"
      ]
    },
    {
      "id": "belt-squat",
      "name": "Belt Squat",
      "aliases": [
        "Machine Belt Squat",
        "Riem Squat"
      ],
      "category": "Benen (Knie-dominant)",
      "movement_pattern": "Squat",
      "primary_muscles": [
        "Quadriceps",
        "Glutes"
      ],
      "secondary_muscles": [
        "Hamstrings"
      ],
      "type": "Compound",
      "equipment": [
        "Belt Squat Machine / Gewichtsriem"
      ],
      "required_equipment": [
        [
          "belt_squat_machine"
        ],
        [
          "machine"
        ]
      ],
      "level": "Beginner",
      "symmetry": "Bilateraal",
      "axial_load": "Geen",
      "is_home_friendly": false,
      "substitutes": [
        "leg-press",
        "goblet-squat",
        "hack-squat"
      ]
    },
    {
      "id": "leg-press",
      "name": "Leg Press",
      "aliases": [
        "45 Degree Leg Press",
        "Seated Leg Press"
      ],
      "category": "Benen (Knie-dominant)",
      "movement_pattern": "Squat",
      "primary_muscles": [
        "Quadriceps",
        "Glutes"
      ],
      "secondary_muscles": [
        "Hamstrings"
      ],
      "type": "Compound",
      "equipment": [
        "Leg Press Machine"
      ],
      "required_equipment": [
        [
          "leg_press_machine"
        ],
        [
          "machine"
        ]
      ],
      "level": "Beginner",
      "symmetry": "Bilateraal",
      "axial_load": "Geen",
      "is_home_friendly": false,
      "substitutes": [
        "barbell-back-squat",
        "hack-squat",
        "goblet-squat",
        "belt-squat"
      ]
    },
    {
      "id": "bulgarian-split-squat",
      "name": "Bulgarian Split Squat",
      "aliases": [
        "Rear Foot Elevated Split Squat",
        "BSS"
      ],
      "category": "Benen (Knie-dominant)",
      "movement_pattern": "Lunge / Single-leg",
      "primary_muscles": [
        "Quadriceps",
        "Glutes"
      ],
      "secondary_muscles": [
        "Stabilisatoren",
        "Core"
      ],
      "type": "Compound",
      "equipment": [
        "Dumbbells",
        "Bankje / Stoel"
      ],
      "required_equipment": [
        [
          "dumbbell",
          "bench"
        ],
        [
          "bodyweight"
        ]
      ],
      "level": "Beginner",
      "symmetry": "Unilateraal",
      "axial_load": "Laag",
      "is_home_friendly": true,
      "substitutes": [
        "walking-reverse-lunge",
        "static-split-squat",
        "dumbbell-step-up",
        "goblet-squat"
      ]
    },
    {
      "id": "walking-reverse-lunge",
      "name": "Walking / Reverse Lunge",
      "aliases": [
        "Lunges",
        "Uitvalspassen",
        "Reverse Lunge"
      ],
      "category": "Benen (Knie-dominant)",
      "movement_pattern": "Lunge / Single-leg",
      "primary_muscles": [
        "Quadriceps",
        "Glutes"
      ],
      "secondary_muscles": [
        "Hamstrings",
        "Kuiten"
      ],
      "type": "Compound",
      "equipment": [
        "Dumbbells / Lichaamsgewicht"
      ],
      "required_equipment": [
        [
          "dumbbell"
        ],
        [
          "bodyweight"
        ]
      ],
      "level": "Beginner",
      "symmetry": "Unilateraal",
      "axial_load": "Laag",
      "is_home_friendly": true,
      "substitutes": [
        "bulgarian-split-squat",
        "static-split-squat",
        "dumbbell-step-up"
      ]
    },
    {
      "id": "static-split-squat",
      "name": "Static Split Squat",
      "aliases": [
        "Split Squat",
        "Stilstaande Lunge"
      ],
      "category": "Benen (Knie-dominant)",
      "movement_pattern": "Lunge / Single-leg",
      "primary_muscles": [
        "Quadriceps",
        "Glutes"
      ],
      "secondary_muscles": [
        "Core"
      ],
      "type": "Compound",
      "equipment": [
        "Dumbbells / Lichaamsgewicht"
      ],
      "required_equipment": [
        [
          "dumbbell"
        ],
        [
          "bodyweight"
        ]
      ],
      "level": "Beginner",
      "symmetry": "Unilateraal",
      "axial_load": "Laag",
      "is_home_friendly": true,
      "substitutes": [
        "bulgarian-split-squat",
        "walking-reverse-lunge"
      ]
    },
    {
      "id": "dumbbell-step-up",
      "name": "Dumbbell Step-Up",
      "aliases": [
        "Step Up",
        "Opstap op box"
      ],
      "category": "Benen (Knie-dominant)",
      "movement_pattern": "Lunge / Single-leg",
      "primary_muscles": [
        "Quadriceps",
        "Glutes"
      ],
      "secondary_muscles": [
        "Hamstrings",
        "Stabilisatoren"
      ],
      "type": "Compound",
      "equipment": [
        "Dumbbells",
        "Verhoging / Box"
      ],
      "required_equipment": [
        [
          "dumbbell",
          "box"
        ],
        [
          "dumbbell"
        ]
      ],
      "level": "Beginner",
      "symmetry": "Unilateraal",
      "axial_load": "Laag",
      "is_home_friendly": true,
      "substitutes": [
        "bulgarian-split-squat",
        "walking-reverse-lunge"
      ]
    },
    {
      "id": "leg-extension",
      "name": "Leg Extension",
      "aliases": [
        "Quad Extension Machine"
      ],
      "category": "Benen (Knie-dominant)",
      "movement_pattern": "Knie-extensie",
      "primary_muscles": [
        "Quadriceps"
      ],
      "secondary_muscles": [],
      "type": "Isolatie",
      "equipment": [
        "Leg Extension Machine"
      ],
      "required_equipment": [
        [
          "leg_extension_machine"
        ],
        [
          "machine"
        ]
      ],
      "level": "Beginner",
      "symmetry": "Bilateraal",
      "axial_load": "Geen",
      "is_home_friendly": false,
      "substitutes": [
        "heel-elevated-goblet-squat"
      ]
    },
    {
      "id": "bodyweight-squat",
      "name": "Bodyweight Squat",
      "aliases": [
        "Air Squat",
        "Lichaamsgewicht Kniebuigen"
      ],
      "category": "Benen (Knie-dominant)",
      "movement_pattern": "Squat",
      "primary_muscles": [
        "Quadriceps",
        "Glutes"
      ],
      "secondary_muscles": [
        "Core"
      ],
      "type": "Compound",
      "equipment": [
        "Lichaamsgewicht"
      ],
      "required_equipment": [
        [
          "bodyweight"
        ]
      ],
      "level": "Beginner",
      "symmetry": "Bilateraal",
      "axial_load": "Geen",
      "is_home_friendly": true,
      "substitutes": [
        "goblet-squat",
        "static-split-squat"
      ]
    },
    {
      "id": "romanian-deadlift",
      "name": "Romanian Deadlift (RDL)",
      "aliases": [
        "RDL",
        "Barbell RDL",
        "Dumbbell RDL"
      ],
      "category": "Benen (Heup-dominant)",
      "movement_pattern": "Hinge",
      "primary_muscles": [
        "Hamstrings",
        "Glutes"
      ],
      "secondary_muscles": [
        "Onderrug",
        "Grip"
      ],
      "type": "Compound",
      "equipment": [
        "Barbell / Dumbbells"
      ],
      "required_equipment": [
        [
          "barbell"
        ],
        [
          "dumbbell"
        ]
      ],
      "level": "Beginner",
      "symmetry": "Bilateraal",
      "axial_load": "Gemiddeld",
      "is_home_friendly": true,
      "substitutes": [
        "single-leg-rdl",
        "good-morning",
        "back-extension-45",
        "cable-pull-through"
      ]
    },
    {
      "id": "conventional-deadlift",
      "name": "Conventional Deadlift",
      "aliases": [
        "Deadlift",
        "Klassieke Deadlift"
      ],
      "category": "Benen (Heup-dominant)",
      "movement_pattern": "Hinge",
      "primary_muscles": [
        "Glutes",
        "Hamstrings",
        "Bovenrug"
      ],
      "secondary_muscles": [
        "Quadriceps",
        "Grip",
        "Onderrug"
      ],
      "type": "Compound",
      "equipment": [
        "Barbell"
      ],
      "required_equipment": [
        [
          "barbell"
        ]
      ],
      "level": "Intermediate",
      "symmetry": "Bilateraal",
      "axial_load": "Hoog",
      "is_home_friendly": false,
      "substitutes": [
        "trap-bar-deadlift",
        "sumo-deadlift",
        "romanian-deadlift"
      ]
    },
    {
      "id": "trap-bar-deadlift",
      "name": "Trap Bar (Hex Bar) Deadlift",
      "aliases": [
        "Hex Bar Deadlift",
        "Trap Bar"
      ],
      "category": "Benen (Heup-dominant)",
      "movement_pattern": "Hinge / Squat Hybride",
      "primary_muscles": [
        "Quadriceps",
        "Glutes",
        "Hamstrings"
      ],
      "secondary_muscles": [
        "Onderrug",
        "Bovenste Trapezius",
        "Grip"
      ],
      "type": "Compound",
      "equipment": [
        "Trap Bar / Hex Bar"
      ],
      "required_equipment": [
        [
          "trap_bar"
        ]
      ],
      "level": "Beginner",
      "symmetry": "Bilateraal",
      "axial_load": "Gemiddeld",
      "is_home_friendly": false,
      "substitutes": [
        "conventional-deadlift",
        "romanian-deadlift",
        "sumo-deadlift"
      ]
    },
    {
      "id": "sumo-deadlift",
      "name": "Sumo Deadlift",
      "aliases": [
        "Sumo Barbell Deadlift"
      ],
      "category": "Benen (Heup-dominant)",
      "movement_pattern": "Hinge / Squat Hybride",
      "primary_muscles": [
        "Glutes",
        "Adductoren",
        "Bovenrug"
      ],
      "secondary_muscles": [
        "Quadriceps",
        "Onderarmen"
      ],
      "type": "Compound",
      "equipment": [
        "Barbell"
      ],
      "required_equipment": [
        [
          "barbell"
        ]
      ],
      "level": "Intermediate",
      "symmetry": "Bilateraal",
      "axial_load": "Gemiddeld",
      "is_home_friendly": false,
      "substitutes": [
        "conventional-deadlift",
        "trap-bar-deadlift",
        "romanian-deadlift"
      ]
    },
    {
      "id": "single-leg-rdl",
      "name": "Single-Leg RDL",
      "aliases": [
        "Eenbenige RDL",
        "Single-Leg Romanian Deadlift"
      ],
      "category": "Benen (Heup-dominant)",
      "movement_pattern": "Hinge",
      "primary_muscles": [
        "Hamstrings",
        "Glutes"
      ],
      "secondary_muscles": [
        "Enkelstabilisatoren",
        "Core"
      ],
      "type": "Compound",
      "equipment": [
        "Dumbbells / Kettlebell"
      ],
      "required_equipment": [
        [
          "dumbbell"
        ],
        [
          "kettlebell"
        ]
      ],
      "level": "Intermediate",
      "symmetry": "Unilateraal",
      "axial_load": "Laag",
      "is_home_friendly": true,
      "substitutes": [
        "romanian-deadlift",
        "back-extension-45"
      ]
    },
    {
      "id": "barbell-hip-thrust",
      "name": "Barbell Hip Thrust",
      "aliases": [
        "Hip Thrust",
        "Bekkenheffen met stang"
      ],
      "category": "Benen (Heup-dominant)",
      "movement_pattern": "Heup-extensie",
      "primary_muscles": [
        "Glutes"
      ],
      "secondary_muscles": [
        "Hamstrings"
      ],
      "type": "Compound",
      "equipment": [
        "Barbell",
        "Vlakke Bank",
        "Pad"
      ],
      "required_equipment": [
        [
          "barbell",
          "bench"
        ]
      ],
      "level": "Beginner",
      "symmetry": "Bilateraal",
      "axial_load": "Geen",
      "is_home_friendly": true,
      "substitutes": [
        "glute-bridge",
        "frog-pumps",
        "cable-glute-kickback"
      ]
    },
    {
      "id": "glute-bridge",
      "name": "Glute Bridge",
      "aliases": [
        "Bruggetje",
        "Floor Glute Bridge"
      ],
      "category": "Benen (Heup-dominant)",
      "movement_pattern": "Heup-extensie",
      "primary_muscles": [
        "Glutes"
      ],
      "secondary_muscles": [
        "Hamstrings",
        "Core"
      ],
      "type": "Compound",
      "equipment": [
        "Lichaamsgewicht / Dumbbell"
      ],
      "required_equipment": [
        [
          "bodyweight"
        ],
        [
          "dumbbell"
        ]
      ],
      "level": "Beginner",
      "symmetry": "Bilateraal",
      "axial_load": "Geen",
      "is_home_friendly": true,
      "substitutes": [
        "barbell-hip-thrust",
        "frog-pumps"
      ]
    },
    {
      "id": "frog-pumps",
      "name": "Frog Pumps",
      "aliases": [
        "Glute Frog Pumps"
      ],
      "category": "Benen (Heup-dominant)",
      "movement_pattern": "Heup-extensie",
      "primary_muscles": [
        "Glutes"
      ],
      "secondary_muscles": [],
      "type": "Isolatie",
      "equipment": [
        "Dumbbell / Lichaamsgewicht"
      ],
      "required_equipment": [
        [
          "bodyweight"
        ],
        [
          "dumbbell"
        ]
      ],
      "level": "Beginner",
      "symmetry": "Bilateraal",
      "axial_load": "Geen",
      "is_home_friendly": true,
      "substitutes": [
        "glute-bridge",
        "barbell-hip-thrust"
      ]
    },
    {
      "id": "back-extension-45",
      "name": "Back Extension (45° Hyperextension)",
      "aliases": [
        "Hyperextension",
        "45 Degree Back Extension"
      ],
      "category": "Benen (Heup-dominant)",
      "movement_pattern": "Hinge / Extensie",
      "primary_muscles": [
        "Hamstrings",
        "Glutes"
      ],
      "secondary_muscles": [
        "Onderrug"
      ],
      "type": "Compound",
      "equipment": [
        "Back Extension Bench"
      ],
      "required_equipment": [
        [
          "back_extension_bench"
        ],
        [
          "machine"
        ]
      ],
      "level": "Beginner",
      "symmetry": "Bilateraal",
      "axial_load": "Laag",
      "is_home_friendly": false,
      "substitutes": [
        "romanian-deadlift",
        "good-morning"
      ]
    },
    {
      "id": "good-morning",
      "name": "Good Morning",
      "aliases": [
        "Barbell Good Morning"
      ],
      "category": "Benen (Heup-dominant)",
      "movement_pattern": "Hinge",
      "primary_muscles": [
        "Hamstrings",
        "Onderrug"
      ],
      "secondary_muscles": [
        "Glutes",
        "Core"
      ],
      "type": "Compound",
      "equipment": [
        "Barbell / Resistance Band"
      ],
      "required_equipment": [
        [
          "barbell"
        ],
        [
          "resistance_band"
        ]
      ],
      "level": "Intermediate",
      "symmetry": "Bilateraal",
      "axial_load": "Hoog",
      "is_home_friendly": true,
      "substitutes": [
        "romanian-deadlift",
        "back-extension-45"
      ]
    },
    {
      "id": "seated-lying-leg-curl",
      "name": "Seated / Lying Leg Curl",
      "aliases": [
        "Hamstring Curl",
        "Leg Curl Machine"
      ],
      "category": "Benen (Heup-dominant)",
      "movement_pattern": "Knie-flexie",
      "primary_muscles": [
        "Hamstrings"
      ],
      "secondary_muscles": [
        "Kuiten"
      ],
      "type": "Isolatie",
      "equipment": [
        "Leg Curl Machine"
      ],
      "required_equipment": [
        [
          "leg_curl_machine"
        ],
        [
          "machine"
        ]
      ],
      "level": "Beginner",
      "symmetry": "Bilateraal",
      "axial_load": "Geen",
      "is_home_friendly": false,
      "substitutes": [
        "nordic-hamstring-curl",
        "romanian-deadlift"
      ]
    },
    {
      "id": "nordic-hamstring-curl",
      "name": "Nordic Hamstring Curl",
      "aliases": [
        "Nordic Curl"
      ],
      "category": "Benen (Heup-dominant)",
      "movement_pattern": "Knie-flexie",
      "primary_muscles": [
        "Hamstrings"
      ],
      "secondary_muscles": [
        "Kuiten"
      ],
      "type": "Isolatie",
      "equipment": [
        "Lichaamsgewicht / Voetfixatie"
      ],
      "required_equipment": [
        [
          "bodyweight"
        ]
      ],
      "level": "Advanced",
      "symmetry": "Bilateraal",
      "axial_load": "Geen",
      "is_home_friendly": true,
      "substitutes": [
        "seated-lying-leg-curl"
      ]
    },
    {
      "id": "cable-pull-through",
      "name": "Cable / Band Pull-Through",
      "aliases": [
        "Cable Pull-Through",
        "Band Pull-Through"
      ],
      "category": "Benen (Heup-dominant)",
      "movement_pattern": "Hinge",
      "primary_muscles": [
        "Glutes",
        "Hamstrings"
      ],
      "secondary_muscles": [
        "Onderrug"
      ],
      "type": "Compound",
      "equipment": [
        "Cable Machine / Resistance Band",
        "Touw"
      ],
      "required_equipment": [
        [
          "cable_machine"
        ],
        [
          "resistance_band"
        ]
      ],
      "level": "Beginner",
      "symmetry": "Bilateraal",
      "axial_load": "Geen",
      "is_home_friendly": true,
      "substitutes": [
        "romanian-deadlift",
        "glute-bridge"
      ]
    },
    {
      "id": "seated-hip-abduction",
      "name": "Seated Hip Abduction",
      "aliases": [
        "Hip Abductor Machine",
        "Buitenbeen machine"
      ],
      "category": "Benen (Heup-dominant)",
      "movement_pattern": "Abductie",
      "primary_muscles": [
        "Gluteus Medius / Minimus"
      ],
      "secondary_muscles": [
        "Tensor fasciae latae"
      ],
      "type": "Isolatie",
      "equipment": [
        "Hip Abduction Machine"
      ],
      "required_equipment": [
        [
          "hip_abductor_machine"
        ],
        [
          "machine"
        ]
      ],
      "level": "Beginner",
      "symmetry": "Bilateraal",
      "axial_load": "Geen",
      "is_home_friendly": false,
      "substitutes": [
        "side-lying-clamshell",
        "cable-glute-kickback"
      ]
    },
    {
      "id": "seated-hip-adduction",
      "name": "Seated Hip Adduction",
      "aliases": [
        "Hip Adductor Machine",
        "Binnenbeen machine"
      ],
      "category": "Benen (Heup-dominant)",
      "movement_pattern": "Adductie",
      "primary_muscles": [
        "Adductoren (Lies/Binnenbeen)"
      ],
      "secondary_muscles": [],
      "type": "Isolatie",
      "equipment": [
        "Hip Adduction Machine"
      ],
      "required_equipment": [
        [
          "hip_adductor_machine"
        ],
        [
          "machine"
        ]
      ],
      "level": "Beginner",
      "symmetry": "Bilateraal",
      "axial_load": "Geen",
      "is_home_friendly": false,
      "substitutes": [
        "sumo-deadlift"
      ]
    },
    {
      "id": "cable-glute-kickback",
      "name": "Cable Glute Kickback",
      "aliases": [
        "Glute Kickback",
        "Enkelband Kickback"
      ],
      "category": "Benen (Heup-dominant)",
      "movement_pattern": "Heup-extensie",
      "primary_muscles": [
        "Glutes"
      ],
      "secondary_muscles": [
        "Hamstrings"
      ],
      "type": "Isolatie",
      "equipment": [
        "Cable Machine",
        "Enkelband"
      ],
      "required_equipment": [
        [
          "cable_machine"
        ]
      ],
      "level": "Beginner",
      "symmetry": "Unilateraal",
      "axial_load": "Geen",
      "is_home_friendly": false,
      "substitutes": [
        "glute-bridge",
        "side-lying-clamshell"
      ]
    },
    {
      "id": "side-lying-clamshell",
      "name": "Side-Lying Clamshell",
      "aliases": [
        "Clamshells",
        "Banded Clamshell"
      ],
      "category": "Benen (Heup-dominant)",
      "movement_pattern": "Externe Rotatie / Abductie",
      "primary_muscles": [
        "Gluteus Medius / Minimus"
      ],
      "secondary_muscles": [
        "Heupstabilisatoren"
      ],
      "type": "Isolatie",
      "equipment": [
        "Resistance Band / Lichaamsgewicht"
      ],
      "required_equipment": [
        [
          "bodyweight"
        ],
        [
          "resistance_band"
        ]
      ],
      "level": "Beginner",
      "symmetry": "Unilateraal",
      "axial_load": "Geen",
      "is_home_friendly": true,
      "substitutes": [
        "seated-hip-abduction",
        "cable-glute-kickback"
      ]
    },
    {
      "id": "barbell-ez-bar-curl",
      "name": "Barbell / EZ-Bar Curl",
      "aliases": [
        "Bicep Curl",
        "EZ-Bar Curl",
        "BB Curl"
      ],
      "category": "Armen",
      "movement_pattern": "Armflexie",
      "primary_muscles": [
        "Biceps"
      ],
      "secondary_muscles": [
        "Onderarmen"
      ],
      "type": "Isolatie",
      "equipment": [
        "Barbell / EZ-stang"
      ],
      "required_equipment": [
        [
          "barbell"
        ],
        [
          "ez_bar"
        ]
      ],
      "level": "Beginner",
      "symmetry": "Bilateraal",
      "axial_load": "Geen",
      "is_home_friendly": true,
      "substitutes": [
        "incline-dumbbell-curl",
        "hammer-curl",
        "preacher-curl",
        "bayesian-cable-curl"
      ]
    },
    {
      "id": "incline-dumbbell-curl",
      "name": "Incline Dumbbell Curl",
      "aliases": [
        "Incline DB Curl",
        "Bicep Stretch Curl"
      ],
      "category": "Armen",
      "movement_pattern": "Armflexie",
      "primary_muscles": [
        "Biceps"
      ],
      "secondary_muscles": [
        "Onderarmen"
      ],
      "type": "Isolatie",
      "equipment": [
        "Dumbbells",
        "Schuine Bank"
      ],
      "required_equipment": [
        [
          "dumbbell",
          "incline_bench"
        ]
      ],
      "level": "Beginner",
      "symmetry": "Bilateraal",
      "axial_load": "Geen",
      "is_home_friendly": true,
      "substitutes": [
        "barbell-ez-bar-curl",
        "bayesian-cable-curl",
        "hammer-curl"
      ]
    },
    {
      "id": "bayesian-cable-curl",
      "name": "Bayesian Cable Curl",
      "aliases": [
        "Behind-the-Back Cable Curl"
      ],
      "category": "Armen",
      "movement_pattern": "Armflexie",
      "primary_muscles": [
        "Biceps"
      ],
      "secondary_muscles": [],
      "type": "Isolatie",
      "equipment": [
        "Cable Machine"
      ],
      "required_equipment": [
        [
          "cable_machine"
        ]
      ],
      "level": "Beginner",
      "symmetry": "Unilateraal",
      "axial_load": "Geen",
      "is_home_friendly": false,
      "substitutes": [
        "incline-dumbbell-curl",
        "barbell-ez-bar-curl"
      ]
    },
    {
      "id": "hammer-curl",
      "name": "Hammer Curl",
      "aliases": [
        "Dumbbell Hammer Curl",
        "Neutrale Grip Curl"
      ],
      "category": "Armen",
      "movement_pattern": "Armflexie",
      "primary_muscles": [
        "Brachialis / Onderarm"
      ],
      "secondary_muscles": [
        "Biceps"
      ],
      "type": "Isolatie",
      "equipment": [
        "Dumbbells / Cable"
      ],
      "required_equipment": [
        [
          "dumbbell"
        ],
        [
          "cable_machine"
        ]
      ],
      "level": "Beginner",
      "symmetry": "Bilateraal",
      "axial_load": "Geen",
      "is_home_friendly": true,
      "substitutes": [
        "cross-body-hammer-curl",
        "reverse-curl",
        "barbell-ez-bar-curl"
      ]
    },
    {
      "id": "cross-body-hammer-curl",
      "name": "Cross-Body Hammer Curl",
      "aliases": [
        "Pinwheel Curl"
      ],
      "category": "Armen",
      "movement_pattern": "Armflexie",
      "primary_muscles": [
        "Brachialis / Onderarm"
      ],
      "secondary_muscles": [
        "Biceps"
      ],
      "type": "Isolatie",
      "equipment": [
        "Dumbbells"
      ],
      "required_equipment": [
        [
          "dumbbell"
        ]
      ],
      "level": "Beginner",
      "symmetry": "Unilateraal",
      "axial_load": "Geen",
      "is_home_friendly": true,
      "substitutes": [
        "hammer-curl",
        "concentration-curl"
      ]
    },
    {
      "id": "preacher-curl",
      "name": "Preacher Curl",
      "aliases": [
        "EZ Preacher Curl",
        "Scott Curl"
      ],
      "category": "Armen",
      "movement_pattern": "Armflexie",
      "primary_muscles": [
        "Biceps"
      ],
      "secondary_muscles": [
        "Onderarmen"
      ],
      "type": "Isolatie",
      "equipment": [
        "EZ-stang / Dumbbell / Preacher Bank"
      ],
      "required_equipment": [
        [
          "preacher_bench",
          "ez_bar"
        ],
        [
          "preacher_bench",
          "dumbbell"
        ],
        [
          "machine"
        ]
      ],
      "level": "Beginner",
      "symmetry": "Bilateraal",
      "axial_load": "Geen",
      "is_home_friendly": true,
      "substitutes": [
        "spider-curl",
        "concentration-curl",
        "barbell-ez-bar-curl"
      ]
    },
    {
      "id": "spider-curl",
      "name": "Spider Curl",
      "aliases": [
        "Incline Bench Spider Curl"
      ],
      "category": "Armen",
      "movement_pattern": "Armflexie",
      "primary_muscles": [
        "Biceps"
      ],
      "secondary_muscles": [
        "Onderarmen"
      ],
      "type": "Isolatie",
      "equipment": [
        "Dumbbells / EZ-stang",
        "Schuine Bank"
      ],
      "required_equipment": [
        [
          "dumbbell",
          "incline_bench"
        ],
        [
          "ez_bar",
          "incline_bench"
        ]
      ],
      "level": "Beginner",
      "symmetry": "Bilateraal",
      "axial_load": "Geen",
      "is_home_friendly": true,
      "substitutes": [
        "preacher-curl",
        "concentration-curl"
      ]
    },
    {
      "id": "concentration-curl",
      "name": "Concentration Curl",
      "aliases": [
        "Geconcentreerde Curl",
        "Seated Concentration Curl"
      ],
      "category": "Armen",
      "movement_pattern": "Armflexie",
      "primary_muscles": [
        "Biceps"
      ],
      "secondary_muscles": [
        "Brachialis / Onderarm"
      ],
      "type": "Isolatie",
      "equipment": [
        "Dumbbells",
        "Bankje / Stoel"
      ],
      "required_equipment": [
        [
          "dumbbell"
        ]
      ],
      "level": "Beginner",
      "symmetry": "Unilateraal",
      "axial_load": "Geen",
      "is_home_friendly": true,
      "substitutes": [
        "preacher-curl",
        "spider-curl",
        "hammer-curl"
      ]
    },
    {
      "id": "reverse-curl",
      "name": "Reverse Barbell / Cable Curl",
      "aliases": [
        "Reverse Grip Curl",
        "Pronated Curl"
      ],
      "category": "Armen",
      "movement_pattern": "Armflexie",
      "primary_muscles": [
        "Brachialis / Onderarm"
      ],
      "secondary_muscles": [
        "Biceps"
      ],
      "type": "Isolatie",
      "equipment": [
        "Barbell / Cable"
      ],
      "required_equipment": [
        [
          "barbell"
        ],
        [
          "cable_machine"
        ]
      ],
      "level": "Beginner",
      "symmetry": "Bilateraal",
      "axial_load": "Geen",
      "is_home_friendly": true,
      "substitutes": [
        "hammer-curl",
        "wrist-curls"
      ]
    },
    {
      "id": "wrist-curls",
      "name": "Wrist Curls (Flexie/Extensie)",
      "aliases": [
        "Polscurls",
        "Forearm Curls"
      ],
      "category": "Armen",
      "movement_pattern": "Polsflexie",
      "primary_muscles": [
        "Onderarmen"
      ],
      "secondary_muscles": [
        "Grip"
      ],
      "type": "Isolatie",
      "equipment": [
        "Dumbbells / Barbell"
      ],
      "required_equipment": [
        [
          "dumbbell"
        ],
        [
          "barbell"
        ]
      ],
      "level": "Beginner",
      "symmetry": "Bilateraal",
      "axial_load": "Geen",
      "is_home_friendly": true,
      "substitutes": [
        "reverse-curl"
      ]
    },
    {
      "id": "triceps-rope-pushdown",
      "name": "Triceps Rope Pushdown",
      "aliases": [
        "Cable Tricep Pushdown",
        "Triceps Drukken"
      ],
      "category": "Armen",
      "movement_pattern": "Armextensie",
      "primary_muscles": [
        "Triceps"
      ],
      "secondary_muscles": [],
      "type": "Isolatie",
      "equipment": [
        "Cable Machine",
        "Touw"
      ],
      "required_equipment": [
        [
          "cable_machine"
        ]
      ],
      "level": "Beginner",
      "symmetry": "Bilateraal",
      "axial_load": "Geen",
      "is_home_friendly": false,
      "substitutes": [
        "overhead-cable-extension",
        "skull-crusher",
        "bench-dips"
      ]
    },
    {
      "id": "overhead-cable-extension",
      "name": "Overhead Cable Extension",
      "aliases": [
        "Triceps Cable Overhead Extension",
        "French Press Cable"
      ],
      "category": "Armen",
      "movement_pattern": "Armextensie",
      "primary_muscles": [
        "Triceps"
      ],
      "secondary_muscles": [],
      "type": "Isolatie",
      "equipment": [
        "Cable Machine / Dumbbells"
      ],
      "required_equipment": [
        [
          "cable_machine"
        ],
        [
          "dumbbell"
        ]
      ],
      "level": "Beginner",
      "symmetry": "Bilateraal",
      "axial_load": "Geen",
      "is_home_friendly": true,
      "substitutes": [
        "single-arm-overhead-cable-ext",
        "skull-crusher",
        "triceps-rope-pushdown"
      ]
    },
    {
      "id": "single-arm-overhead-cable-ext",
      "name": "Single-Arm Overhead Cable Ext (Katana)",
      "aliases": [
        "Katana Extension",
        "One-Arm Overhead Tricep Ext"
      ],
      "category": "Armen",
      "movement_pattern": "Armextensie",
      "primary_muscles": [
        "Triceps"
      ],
      "secondary_muscles": [],
      "type": "Isolatie",
      "equipment": [
        "Cable Machine"
      ],
      "required_equipment": [
        [
          "cable_machine"
        ]
      ],
      "level": "Beginner",
      "symmetry": "Unilateraal",
      "axial_load": "Geen",
      "is_home_friendly": false,
      "substitutes": [
        "overhead-cable-extension",
        "triceps-rope-pushdown"
      ]
    },
    {
      "id": "skull-crusher",
      "name": "Skull Crusher (Lying Triceps Ext)",
      "aliases": [
        "Lying Triceps Extension",
        "EZ-Bar Skull Crusher"
      ],
      "category": "Armen",
      "movement_pattern": "Armextensie",
      "primary_muscles": [
        "Triceps"
      ],
      "secondary_muscles": [],
      "type": "Isolatie",
      "equipment": [
        "EZ-stang / Dumbbells",
        "Vlakke Bank"
      ],
      "required_equipment": [
        [
          "ez_bar",
          "bench"
        ],
        [
          "dumbbell",
          "bench"
        ],
        [
          "dumbbell"
        ]
      ],
      "level": "Intermediate",
      "symmetry": "Bilateraal",
      "axial_load": "Geen",
      "is_home_friendly": true,
      "substitutes": [
        "overhead-cable-extension",
        "triceps-rope-pushdown",
        "jm-press"
      ]
    },
    {
      "id": "close-grip-bench-press",
      "name": "Close-Grip Bench Press",
      "aliases": [
        "CGBP",
        "Smal Bankdrukken"
      ],
      "category": "Armen",
      "movement_pattern": "Horizontale Push",
      "primary_muscles": [
        "Triceps"
      ],
      "secondary_muscles": [
        "Borst (Midden/Onder)",
        "Voorkant schouder"
      ],
      "type": "Compound",
      "equipment": [
        "Barbell",
        "Vlakke Bank"
      ],
      "required_equipment": [
        [
          "barbell",
          "bench"
        ]
      ],
      "level": "Intermediate",
      "symmetry": "Bilateraal",
      "axial_load": "Gemiddeld",
      "is_home_friendly": false,
      "substitutes": [
        "jm-press",
        "dips",
        "bench-dips"
      ]
    },
    {
      "id": "jm-press",
      "name": "JM Press",
      "aliases": [
        "JM Bench Press"
      ],
      "category": "Armen",
      "movement_pattern": "Hybride Press/Extensie",
      "primary_muscles": [
        "Triceps"
      ],
      "secondary_muscles": [
        "Borst (Midden/Onder)",
        "Voorkant schouder"
      ],
      "type": "Compound",
      "equipment": [
        "Barbell / Smith Machine",
        "Vlakke Bank"
      ],
      "required_equipment": [
        [
          "barbell",
          "bench"
        ]
      ],
      "level": "Intermediate",
      "symmetry": "Bilateraal",
      "axial_load": "Gemiddeld",
      "is_home_friendly": false,
      "substitutes": [
        "close-grip-bench-press",
        "skull-crusher"
      ]
    },
    {
      "id": "bench-dips",
      "name": "Bench Dips",
      "aliases": [
        "Triceps Bench Dips",
        "Stoel Dips"
      ],
      "category": "Armen",
      "movement_pattern": "Verticale/Incline Push",
      "primary_muscles": [
        "Triceps"
      ],
      "secondary_muscles": [
        "Voorkant schouder",
        "Borst (Midden/Onder)"
      ],
      "type": "Compound",
      "equipment": [
        "Bankje / Stoel / Lichaamsgewicht"
      ],
      "required_equipment": [
        [
          "bodyweight"
        ]
      ],
      "level": "Beginner",
      "symmetry": "Bilateraal",
      "axial_load": "Geen",
      "is_home_friendly": true,
      "substitutes": [
        "dips",
        "triceps-rope-pushdown",
        "close-grip-bench-press"
      ]
    },
    {
      "id": "standing-calf-raise",
      "name": "Standing Calf Raise",
      "aliases": [
        "Staand Kuitheffen",
        "Calf Raise"
      ],
      "category": "Kuiten & Core",
      "movement_pattern": "Kuitstrekken",
      "primary_muscles": [
        "Kuiten (Gastrocnemius)"
      ],
      "secondary_muscles": [
        "Voetboog"
      ],
      "type": "Isolatie",
      "equipment": [
        "Standing Calf Machine / Dumbbells"
      ],
      "required_equipment": [
        [
          "machine"
        ],
        [
          "dumbbell"
        ],
        [
          "bodyweight"
        ]
      ],
      "level": "Beginner",
      "symmetry": "Bilateraal",
      "axial_load": "Laag",
      "is_home_friendly": true,
      "substitutes": [
        "single-leg-standing-calf-raise",
        "leg-press-calf-press",
        "seated-calf-raise"
      ]
    },
    {
      "id": "single-leg-standing-calf-raise",
      "name": "Single-Leg Standing Calf Raise",
      "aliases": [
        "Eenbenig Kuitheffen"
      ],
      "category": "Kuiten & Core",
      "movement_pattern": "Kuitstrekken",
      "primary_muscles": [
        "Kuiten (Gastrocnemius)"
      ],
      "secondary_muscles": [
        "Voetboog"
      ],
      "type": "Isolatie",
      "equipment": [
        "Dumbbells / Lichaamsgewicht",
        "Verhoging/Trap"
      ],
      "required_equipment": [
        [
          "bodyweight"
        ],
        [
          "dumbbell"
        ]
      ],
      "level": "Beginner",
      "symmetry": "Unilateraal",
      "axial_load": "Geen",
      "is_home_friendly": true,
      "substitutes": [
        "standing-calf-raise",
        "seated-calf-raise"
      ]
    },
    {
      "id": "seated-calf-raise",
      "name": "Seated Calf Raise",
      "aliases": [
        "Zittend Kuitheffen"
      ],
      "category": "Kuiten & Core",
      "movement_pattern": "Kuitstrekken",
      "primary_muscles": [
        "Kuiten (Soleus)"
      ],
      "secondary_muscles": [],
      "type": "Isolatie",
      "equipment": [
        "Seated Calf Machine / Dumbbells"
      ],
      "required_equipment": [
        [
          "seated_calf_machine"
        ],
        [
          "machine"
        ],
        [
          "dumbbell"
        ]
      ],
      "level": "Beginner",
      "symmetry": "Bilateraal",
      "axial_load": "Geen",
      "is_home_friendly": true,
      "substitutes": [
        "standing-calf-raise",
        "leg-press-calf-press"
      ]
    },
    {
      "id": "leg-press-calf-press",
      "name": "Leg Press Calf Press",
      "aliases": [
        "Calf Press on Leg Press"
      ],
      "category": "Kuiten & Core",
      "movement_pattern": "Kuitstrekken",
      "primary_muscles": [
        "Kuiten (Gastrocnemius)"
      ],
      "secondary_muscles": [],
      "type": "Isolatie",
      "equipment": [
        "Leg Press Machine"
      ],
      "required_equipment": [
        [
          "leg_press_machine"
        ],
        [
          "machine"
        ]
      ],
      "level": "Beginner",
      "symmetry": "Bilateraal",
      "axial_load": "Geen",
      "is_home_friendly": false,
      "substitutes": [
        "standing-calf-raise",
        "seated-calf-raise"
      ]
    },
    {
      "id": "hanging-leg-knee-raise",
      "name": "Hanging Leg/Knee Raise",
      "aliases": [
        "Hanging Leg Raise",
        "Hanging Knee Raise",
        "Captains Chair"
      ],
      "category": "Kuiten & Core",
      "movement_pattern": "Bekkenflexie",
      "primary_muscles": [
        "Rechte buikspier (Onder)"
      ],
      "secondary_muscles": [
        "Heupbuigers",
        "Grip"
      ],
      "type": "Isolatie",
      "equipment": [
        "Optrekstang / Dip Station"
      ],
      "required_equipment": [
        [
          "pullup_bar"
        ],
        [
          "dip_station"
        ]
      ],
      "level": "Intermediate",
      "symmetry": "Bilateraal",
      "axial_load": "Geen",
      "is_home_friendly": true,
      "substitutes": [
        "reverse-crunch",
        "cable-crunch",
        "dead-bug"
      ]
    },
    {
      "id": "reverse-crunch",
      "name": "Reverse Crunch",
      "aliases": [
        "Omgekeerde Crunch"
      ],
      "category": "Kuiten & Core",
      "movement_pattern": "Bekkenflexie",
      "primary_muscles": [
        "Rechte buikspier (Onder)"
      ],
      "secondary_muscles": [
        "Heupbuigers"
      ],
      "type": "Isolatie",
      "equipment": [
        "Mat / Vloer"
      ],
      "required_equipment": [
        [
          "bodyweight"
        ]
      ],
      "level": "Beginner",
      "symmetry": "Bilateraal",
      "axial_load": "Geen",
      "is_home_friendly": true,
      "substitutes": [
        "hanging-leg-knee-raise",
        "dead-bug"
      ]
    },
    {
      "id": "cable-crunch",
      "name": "Cable Crunch",
      "aliases": [
        "Kneeling Cable Crunch",
        "Rope Crunch"
      ],
      "category": "Kuiten & Core",
      "movement_pattern": "Rompflexie",
      "primary_muscles": [
        "Rechte buikspier (Boven/Midden)"
      ],
      "secondary_muscles": [],
      "type": "Isolatie",
      "equipment": [
        "Cable Machine",
        "Touw"
      ],
      "required_equipment": [
        [
          "cable_machine"
        ]
      ],
      "level": "Beginner",
      "symmetry": "Bilateraal",
      "axial_load": "Geen",
      "is_home_friendly": false,
      "substitutes": [
        "reverse-crunch",
        "ab-wheel-rollout"
      ]
    },
    {
      "id": "ab-wheel-rollout",
      "name": "Ab Wheel Rollout",
      "aliases": [
        "Ab Roller",
        "Barbell Rollout"
      ],
      "category": "Kuiten & Core",
      "movement_pattern": "Anti-extensie",
      "primary_muscles": [
        "Rechte buikspier (Boven/Midden)",
        "Core"
      ],
      "secondary_muscles": [
        "Brede rugspier (Lats)",
        "Voorkant schouder"
      ],
      "type": "Compound",
      "equipment": [
        "Ab Wheel / Barbell met schijven"
      ],
      "required_equipment": [
        [
          "ab_wheel"
        ],
        [
          "barbell"
        ]
      ],
      "level": "Intermediate",
      "symmetry": "Bilateraal",
      "axial_load": "Laag",
      "is_home_friendly": true,
      "substitutes": [
        "plank",
        "dead-bug",
        "cable-crunch"
      ]
    },
    {
      "id": "plank",
      "name": "Plank",
      "aliases": [
        "Standard Plank",
        "Forearm Plank"
      ],
      "category": "Kuiten & Core",
      "movement_pattern": "Anti-extensie",
      "primary_muscles": [
        "Transversus abdominis (Core)"
      ],
      "secondary_muscles": [
        "Voorkant schouder",
        "Glutes"
      ],
      "type": "Isometrisch",
      "equipment": [
        "Lichaamsgewicht"
      ],
      "required_equipment": [
        [
          "bodyweight"
        ]
      ],
      "level": "Beginner",
      "symmetry": "Bilateraal",
      "axial_load": "Geen",
      "is_home_friendly": true,
      "substitutes": [
        "dead-bug",
        "ab-wheel-rollout",
        "side-plank"
      ]
    },
    {
      "id": "side-plank",
      "name": "Side Plank",
      "aliases": [
        "Zijwaartse Plank"
      ],
      "category": "Kuiten & Core",
      "movement_pattern": "Anti-laterale flexie",
      "primary_muscles": [
        "Schuine buikspieren (Obliques)"
      ],
      "secondary_muscles": [
        "Gluteus Medius / Minimus",
        "Zijkant schouder"
      ],
      "type": "Isometrisch",
      "equipment": [
        "Lichaamsgewicht"
      ],
      "required_equipment": [
        [
          "bodyweight"
        ]
      ],
      "level": "Beginner",
      "symmetry": "Unilateraal",
      "axial_load": "Geen",
      "is_home_friendly": true,
      "substitutes": [
        "pallof-press",
        "plank"
      ]
    },
    {
      "id": "pallof-press",
      "name": "Pallof Press",
      "aliases": [
        "Cable Pallof Press",
        "Anti-Rotation Press"
      ],
      "category": "Kuiten & Core",
      "movement_pattern": "Anti-rotatie",
      "primary_muscles": [
        "Schuine buikspieren (Obliques)"
      ],
      "secondary_muscles": [
        "Voorkant schouder",
        "Heupen"
      ],
      "type": "Isometrisch",
      "equipment": [
        "Cable Machine / Resistance Band"
      ],
      "required_equipment": [
        [
          "cable_machine"
        ],
        [
          "resistance_band"
        ]
      ],
      "level": "Beginner",
      "symmetry": "Unilateraal",
      "axial_load": "Geen",
      "is_home_friendly": true,
      "substitutes": [
        "side-plank",
        "cable-woodchopper",
        "bird-dog"
      ]
    },
    {
      "id": "cable-woodchopper",
      "name": "Cable Woodchopper",
      "aliases": [
        "Woodchopper",
        "Rotational Cable Chop"
      ],
      "category": "Kuiten & Core",
      "movement_pattern": "Rotatie",
      "primary_muscles": [
        "Schuine buikspieren (Obliques)",
        "Core"
      ],
      "secondary_muscles": [
        "Heupen",
        "Voorkant schouder"
      ],
      "type": "Compound",
      "equipment": [
        "Cable Machine"
      ],
      "required_equipment": [
        [
          "cable_machine"
        ]
      ],
      "level": "Intermediate",
      "symmetry": "Unilateraal",
      "axial_load": "Geen",
      "is_home_friendly": false,
      "substitutes": [
        "russian-twist",
        "pallof-press"
      ]
    },
    {
      "id": "russian-twist",
      "name": "Russian Twist",
      "aliases": [
        "Seated Russian Twist"
      ],
      "category": "Kuiten & Core",
      "movement_pattern": "Rotatie",
      "primary_muscles": [
        "Schuine buikspieren (Obliques)"
      ],
      "secondary_muscles": [
        "Rechte buikspier (Boven/Midden)"
      ],
      "type": "Isolatie",
      "equipment": [
        "Lichaamsgewicht / Dumbbell / Schijf"
      ],
      "required_equipment": [
        [
          "bodyweight"
        ],
        [
          "dumbbell"
        ]
      ],
      "level": "Beginner",
      "symmetry": "Bilateraal",
      "axial_load": "Geen",
      "is_home_friendly": true,
      "substitutes": [
        "cable-woodchopper",
        "pallof-press"
      ]
    },
    {
      "id": "dead-bug",
      "name": "Dead Bug",
      "aliases": [
        "Dead Bug Core"
      ],
      "category": "Kuiten & Core",
      "movement_pattern": "Anti-extensie",
      "primary_muscles": [
        "Transversus abdominis (Core)"
      ],
      "secondary_muscles": [
        "Heupbuigers"
      ],
      "type": "Isometrisch",
      "equipment": [
        "Lichaamsgewicht"
      ],
      "required_equipment": [
        [
          "bodyweight"
        ]
      ],
      "level": "Beginner",
      "symmetry": "Unilateraal",
      "axial_load": "Geen",
      "is_home_friendly": true,
      "substitutes": [
        "bird-dog",
        "plank",
        "reverse-crunch"
      ]
    },
    {
      "id": "bird-dog",
      "name": "Bird Dog",
      "aliases": [
        "Bird Dog Core"
      ],
      "category": "Kuiten & Core",
      "movement_pattern": "Anti-rotatie / Extensie",
      "primary_muscles": [
        "Onderrug",
        "Glutes",
        "Core"
      ],
      "secondary_muscles": [
        "Schouders"
      ],
      "type": "Isometrisch",
      "equipment": [
        "Lichaamsgewicht"
      ],
      "required_equipment": [
        [
          "bodyweight"
        ]
      ],
      "level": "Beginner",
      "symmetry": "Unilateraal",
      "axial_load": "Geen",
      "is_home_friendly": true,
      "substitutes": [
        "dead-bug",
        "pallof-press"
      ]
    }
  ]
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { EXERCISE_DATABASE, exercises: EXERCISE_DATABASE.exercises };
}
