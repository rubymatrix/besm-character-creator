export type ChoiceOption = {
  id: string;
  name: string;
  summary: string;
  cp: number;
  highlights?: string[];
  hpDelta?: number;
  dmDelta?: number;
  acvDelta?: number;
  dcvMeleeDelta?: number;
  dcvOtherDelta?: number;
  dcvRangedBonus?: number;
  extraActionsDelta?: number;
  armorRating?: number;
  weaponLevel?: number;
  weaponNote?: string;
  notes?: string[];
};

export type ChoiceGroup = {
  id: string;
  label: string;
  description: string;
  options: ChoiceOption[];
};

export type SheetEntry = {
  kind: "attribute" | "feature" | "skill" | "defect" | "enhancement" | "limiter" | "contact";
  name: string;
  level?: string;
  cp: number;
  notes: string;
};

export type ArchetypeId = "blade" | "shieldbearer" | "seeker" | "chanter" | "brand";

export type ArchetypeCore = {
  body: number;
  mind: number;
  soul: number;
  coreCp: number;
  hp: number;
  ep: number;
  acv: number;
  dcvMelee: number;
  dcvOther: number;
  dm: number;
  dcvRanged: number;
  extraActions: number;
  armor: number;
  weaponLevel: number;
};

export type ArchetypeConfig = {
  id: ArchetypeId;
  name: string;
  status: "playable" | "in-progress";
  summary: string;
  core: ArchetypeCore;
  choiceGroups: ChoiceGroup[];
};

export const archetypes = [
  {
    id: "blade",
    name: "Blade",
    status: "playable",
    summary:
      "Lantern Guild frontline specialist built from Fighting Form, Blade Signature, and Background.",
  },
  {
    id: "shieldbearer",
    name: "Shieldbearer",
    status: "playable",
    summary: "Faith-touched guardian built from Sacred Calling, Shield & Arms, and Background.",
  },
  {
    id: "seeker",
    name: "Seeker",
    status: "playable",
    summary: "Ranged hunter built from Hunting Form, Seeker Signature, and Background.",
  },
  {
    id: "chanter",
    name: "Chanter",
    status: "playable",
    summary: "Licensed lay healer built from Ministry, Sacred Chant, and Background.",
  },
  {
    id: "brand",
    name: "Brand",
    status: "playable",
    summary: "Rune-marked channeler built from Casting Form, Brand Signature, and Background.",
  },
] as const;

export const bladeCore = {
  body: 7,
  mind: 5,
  soul: 6,
  coreCp: 55,
  hp: 65,
  ep: 55,
  acv: 10,
  dcvMelee: 8,
  dcvOther: 6,
  dm: 5,
  extraActions: 1,
};

export const bladeChoiceGroups: ChoiceGroup[] = [
  {
    id: "fightingForm",
    label: "Fighting Form",
    description: "Your combat posture and instinct under pressure.",
    options: [
      {
        id: "breaker",
        name: "The Breaker",
        summary: "Heavy commitment style that converts pain into escalating damage pressure.",
        cp: 15,
        hpDelta: 20,
        dmDelta: 2,
        notes: [
          "Wound Surge: DM +1 below 50% HP",
          "Raging Endurance: ignore injury penalties below 25% HP",
          "War Cry and Blood Price features",
          "Blind Fury and Composure shortcomings",
        ],
      },
      {
        id: "reckoner",
        name: "The Reckoner",
        summary: "High-offense stance that trades defense for damage and tempo.",
        cp: 15,
        dmDelta: 2,
        extraActionsDelta: 1,
        dcvMeleeDelta: -2,
        dcvOtherDelta: -2,
        notes: [
          "Battle Fury below 50% HP",
          "Through the Pain once per scene",
          "Very vulnerable to counterattacks",
        ],
      },
      {
        id: "wind-step",
        name: "Wind Step",
        summary: "Mobile duelist with evasive movement and ranged defense.",
        cp: 15,
        dcvMeleeDelta: 2,
        dcvOtherDelta: 2,
        dcvRangedBonus: 2,
        notes: ["Double movement speed", "Slippery reposition on enemy miss"],
      },
    ],
  },
  {
    id: "bladeSignature",
    label: "Blade Signature",
    description: "Your weapon profile and how you apply pressure.",
    options: [
      {
        id: "cleaver",
        name: "The Cleaver",
        summary: "Two-handed heavy weapon with top-end single-hit damage.",
        cp: 15,
        dmDelta: 1,
        weaponLevel: 4,
        weaponNote: "Greatweapon with Reach, Cleave, and Brace.",
      },
      {
        id: "paired-blades",
        name: "The Paired Blades",
        summary: "Dual-wield style that increases action economy and strike volume.",
        cp: 15,
        extraActionsDelta: 1,
        weaponLevel: 3,
        weaponNote: "Off-hand control and one additional attack each round.",
      },
      {
        id: "rune-marked",
        name: "The Rune-Marked Blade",
        summary: "Inscribed weapon with Drain and Continuing wound pressure.",
        cp: 15,
        weaponLevel: 3,
        weaponNote: "Purchased at L5, effective L3 after two enhancements.",
        notes: ["Drain reduces Body over time", "Ongoing wound damage next round"],
      },
    ],
  },
  {
    id: "background",
    label: "Background",
    description: "Your prior Lantern Guild assignment and contract history.",
    options: [
      {
        id: "barrow-warden",
        name: "Barrow Warden",
        summary: "Burial-site specialist experienced with spirits and fiend-taint.",
        cp: 15,
        hpDelta: 10,
        notes: ["Ghost Sense", "Spirit Lore +3"],
      },
      {
        id: "border-veteran",
        name: "Border Veteran",
        summary: "Fort-settlement fighter with tactics and incursion awareness.",
        cp: 15,
        hpDelta: 20,
        notes: ["Wilderness +3", "Nightmares defect"],
      },
      {
        id: "ruin-scout",
        name: "Ruin Scout",
        summary: "Old-age site scout with trap sense and off-ledger ruin contacts.",
        cp: 15,
        hpDelta: 10,
        notes: ["Heightened Awareness +2", "Arcane Lore +2"],
      },
    ],
  },
];

export const shieldbearerCore: ArchetypeCore = {
  body: 6,
  mind: 4,
  soul: 8,
  coreCp: 55,
  hp: 70,
  ep: 60,
  acv: 8,
  dcvMelee: 8,
  dcvOther: 6,
  dcvRanged: 6,
  dm: 5,
  extraActions: 0,
  armor: 10,
  weaponLevel: 2,
};

export const seekerCore: ArchetypeCore = {
  body: 5,
  mind: 7,
  soul: 6,
  coreCp: 55,
  hp: 55,
  ep: 65,
  acv: 10,
  dcvMelee: 6,
  dcvOther: 6,
  dcvRanged: 8,
  dm: 5,
  extraActions: 1,
  armor: 0,
  weaponLevel: 3,
};

export const chanterCore: ArchetypeCore = {
  body: 4,
  mind: 6,
  soul: 8,
  coreCp: 55,
  hp: 60,
  ep: 70,
  acv: 8,
  dcvMelee: 8,
  dcvOther: 6,
  dcvRanged: 6,
  dm: 5,
  extraActions: 0,
  armor: 0,
  weaponLevel: 1,
};

export const brandCore: ArchetypeCore = {
  body: 4,
  mind: 6,
  soul: 8,
  coreCp: 55,
  hp: 60,
  ep: 70,
  acv: 8,
  dcvMelee: 6,
  dcvOther: 6,
  dcvRanged: 8,
  dm: 5,
  extraActions: 0,
  armor: 0,
  weaponLevel: 4,
};

export const shieldbearerChoiceGroups: ChoiceGroup[] = [
  {
    id: "sacredCalling",
    label: "Sacred Calling",
    description: "What you are called to protect when the line is drawn.",
    options: [
      {
        id: "radiant-blade",
        name: "The Radiant Blade",
        summary: "Offensive guardian who pushes fiends and undead back with holy pressure.",
        cp: 15,
        highlights: [
          "Aggressive melee protection style",
          "Consecrated pressure against fiends/restless dead",
          "Trades pure mitigation for threat removal",
        ],
      },
      {
        id: "sheltering-light",
        name: "The Sheltering Light",
        summary: "Protective specialist focused on wards, mitigation, and ally safety.",
        cp: 15,
        highlights: [
          "Best at guarding and mitigation",
          "Ward-based ally protection",
          "Strong formation defense toolkit",
        ],
      },
      {
        id: "living-shield",
        name: "The Living Shield",
        summary: "Durable front-liner built to absorb pressure and hold narrow ground.",
        cp: 15,
        highlights: [
          "Maximum durability profile",
          "Excels in chokepoints and line holding",
          "Built to absorb hits for allies",
        ],
      },
    ],
  },
  {
    id: "shieldAndArms",
    label: "Shield & Arms",
    description: "What you carry and how your ward changes the fight.",
    options: [
      {
        id: "tower-shield",
        name: "The Tower Shield",
        summary: "Maximum cover and lane control at the cost of mobility and speed.",
        cp: 15,
        highlights: [
          "Highest cover and lane denial",
          "Heavy defense package",
          "Reduced mobility compared to other sets",
        ],
      },
      {
        id: "war-round",
        name: "The War Round",
        summary: "Balanced shield style that keeps defense strong while staying mobile.",
        cp: 15,
        highlights: [
          "Balanced offense and defense",
          "Good movement while guarding",
          "Reliable all-purpose shield loadout",
        ],
      },
      {
        id: "faith-marked-shield",
        name: "The Faith-Marked Shield",
        summary: "Consecrated armament tuned for spiritual threats and rite work.",
        cp: 15,
        highlights: [
          "Faith-marked anti-fiend utility",
          "Ritual and ward interaction tools",
          "Spiritual-threat specialist package",
        ],
      },
    ],
  },
  {
    id: "background",
    label: "Background",
    description: "Where your guarding practice was shaped before this contract.",
    options: [
      {
        id: "processional-guard",
        name: "Processional Guard",
        summary: "Temple and ceremony defender used to controlled public risk.",
        cp: 15,
        highlights: [
          "Urban and ceremonial defense experience",
          "Crowd-risk and posture discipline",
          "Strong church-facing social utility",
        ],
      },
      {
        id: "settlement-wall-guard",
        name: "Settlement Wall Guard",
        summary: "Perimeter veteran from repeated incursions and wall failures.",
        cp: 15,
        highlights: [
          "Incursion and perimeter defense veteran",
          "Best at prolonged stand-up fights",
          "Field endurance under repeated waves",
        ],
      },
      {
        id: "escort-guard",
        name: "Escort Guard",
        summary: "Road and caravan protector who reads ambush geometry quickly.",
        cp: 15,
        highlights: [
          "Ambush detection and response",
          "Travel-route protection toolkit",
          "Mobile defense with mixed terrain",
        ],
      },
    ],
  },
];

export const seekerChoiceGroups: ChoiceGroup[] = [
  {
    id: "huntingForm",
    label: "Hunting Form",
    description: "How you fight at range under changing pressure.",
    options: [
      {
        id: "long-watch",
        name: "Long Watch",
        summary: "Patient overwatch discipline built for single decisive shots.",
        cp: 15,
        highlights: [
          "Precision-first single-target play",
          "Positioned overwatch discipline",
          "Field-reading and shot timing focus",
        ],
      },
      {
        id: "cover-fire",
        name: "Cover Fire",
        summary: "High-volume style that controls space and suppresses hostiles.",
        cp: 15,
        highlights: [
          "High attack volume and suppression",
          "Controls enemy movement lanes",
          "Best when multiple hostiles are active",
        ],
      },
      {
        id: "blind-side",
        name: "Blind Side",
        summary: "Counter-sniper approach focused on angle denial and repositioning.",
        cp: 15,
        highlights: [
          "Counter-sniper and anti-shooter toolkit",
          "Angle denial and flank pressure",
          "Frequent repositioning and stealth value",
        ],
      },
    ],
  },
  {
    id: "seekerSignature",
    label: "Seeker Signature",
    description: "The distance weapon you trust to finish the job.",
    options: [
      {
        id: "long-shaft",
        name: "The Long Shaft",
        summary: "Long-range bow package for precision and distance dominance.",
        cp: 15,
        highlights: [
          "Longest effective range profile",
          "Strong single-shot payoff",
          "Best pairing for Long Watch",
        ],
      },
      {
        id: "repeater",
        name: "The Repeater",
        summary: "Fast-cycling crossbow setup for sustained shot volume.",
        cp: 15,
        highlights: [
          "Fast cycle and multi-shot pressure",
          "Sustained suppressive fire",
          "Strong synergy with Cover Fire",
        ],
      },
      {
        id: "hand-cannon",
        name: "The Hand Cannon",
        summary: "High-impact powder weapon with intimidation and stopping force.",
        cp: 15,
        highlights: [
          "High-impact close-mid range shot",
          "Intimidation and disruption utility",
          "Loud but decisive stopping power",
        ],
      },
    ],
  },
  {
    id: "background",
    label: "Background",
    description: "Where your tracking and contract habits were formed.",
    options: [
      {
        id: "road-watch",
        name: "Road Watch",
        summary: "Open-road scout accustomed to caravan lanes and bandit routes.",
        cp: 15,
        highlights: [
          "Tracking and route-security focus",
          "Open terrain scouting strength",
          "Reliable caravan contract skills",
        ],
      },
      {
        id: "perimeter-eye",
        name: "Perimeter Eye",
        summary: "Ruin-edge observer trained for long surveillance rotations.",
        cp: 15,
        highlights: [
          "Long-duration surveillance toolkit",
          "Threat detection at distance",
          "Ruin-edge observation specialization",
        ],
      },
      {
        id: "warrant-runner",
        name: "Warrant Runner",
        summary: "Licensed retriever used to urban marks and legal pursuit.",
        cp: 15,
        highlights: [
          "Urban pursuit and mark acquisition",
          "Legal-contract retrieval experience",
          "Strong social-navigation utility",
        ],
      },
    ],
  },
];

export const chanterChoiceGroups: ChoiceGroup[] = [
  {
    id: "ministry",
    label: "Ministry",
    description: "The healing discipline you rely on under fire.",
    options: [
      {
        id: "vigil-tender",
        name: "Vigil Tender",
        summary: "Sustained single-target healer built to keep the front line active.",
        cp: 15,
        highlights: [
          "Top sustained healing on one ally",
          "Frontline stabilizer role",
          "Excellent with high-damage tanks",
        ],
      },
      {
        id: "chorus-voice",
        name: "Chorus Voice",
        summary: "Group-healing specialist who restores entire squads over time.",
        cp: 15,
        highlights: [
          "Party-wide healing throughput",
          "Wins attrition engagements",
          "Highest broad restoration coverage",
        ],
      },
      {
        id: "last-rite",
        name: "Last Rite",
        summary: "Crisis medic focused on emergency stabilization at death threshold.",
        cp: 15,
        highlights: [
          "Emergency recovery at 0 HP",
          "Burst rescue over long sustain",
          "Often trades your reserves to save others",
        ],
      },
    ],
  },
  {
    id: "sacredChant",
    label: "Sacred Chant",
    description: "The prayer pattern you channel in active contracts.",
    options: [
      {
        id: "mending-word",
        name: "The Mending Word",
        summary: "Pure restorative throughput with excellent speed and efficiency.",
        cp: 15,
        highlights: [
          "Maximum direct HP restoration",
          "High range and speed for healing",
          "Little defensive utility outside healing",
        ],
      },
      {
        id: "warding-hymn",
        name: "The Warding Hymn",
        summary: "Protective chant focused on prevention, resistance, and control.",
        cp: 15,
        highlights: [
          "Damage prevention and resistance tools",
          "Protective control support",
          "Best before damage lands",
        ],
      },
      {
        id: "kindling-prayer",
        name: "The Kindling Prayer",
        summary: "Energy and spirit restoration that keeps allies operational.",
        cp: 15,
        highlights: [
          "EP recovery and fatigue relief",
          "Keeps spellcasters and techniques online",
          "Strong anti-exhaustion support",
        ],
      },
    ],
  },
  {
    id: "background",
    label: "Background",
    description: "Where your license and field habits were earned.",
    options: [
      {
        id: "field-mender",
        name: "Field Mender",
        summary: "Combat medic assignment with sustained violence exposure.",
        cp: 15,
        highlights: [
          "Best in active combat medicine",
          "High pressure triage experience",
          "Pairs well with frontline parties",
        ],
      },
      {
        id: "hospice-warden",
        name: "Hospice Warden",
        summary: "Town-care practitioner skilled in chronic and community healing.",
        cp: 15,
        highlights: [
          "Disease and long-care specialist",
          "Community and social healing utility",
          "Stable sustained-care background",
        ],
      },
      {
        id: "rite-keeper",
        name: "Rite Keeper",
        summary: "Quiet Bell assistant focused on death-boundary and funeral support.",
        cp: 15,
        highlights: [
          "Death-rite and boundary expertise",
          "Spiritual threat handling utility",
          "Strong Twin Vigil ritual contacts",
        ],
      },
    ],
  },
];

export const brandChoiceGroups: ChoiceGroup[] = [
  {
    id: "castingForm",
    label: "Casting Form",
    description: "How you structure a release when the channel opens.",
    options: [
      {
        id: "pyre",
        name: "The Pyre",
        summary: "Wide-release caster that wins by area pressure and attrition.",
        cp: 15,
        highlights: [
          "Area-release damage profile",
          "Charge discipline for bigger blasts",
          "Best into clustered enemies",
        ],
      },
      {
        id: "condemner",
        name: "The Condemner",
        summary: "Single-target execution style built for armored threats.",
        cp: 15,
        highlights: [
          "Focused single-target burst",
          "Armor-punishing judgment style",
          "Excellent boss and elite killer",
        ],
      },
      {
        id: "brand-knight",
        name: "The Brand Knight",
        summary: "Hybrid melee-channel fighter who alternates steel and release.",
        cp: 15,
        highlights: [
          "Hybrid melee and channel gameplay",
          "Sword Conduit style interactions",
          "Flexible in shifting fight ranges",
        ],
      },
    ],
  },
  {
    id: "brandSignature",
    label: "Brand Signature",
    description: "The shaped attack your mark channels most reliably.",
    options: [
      {
        id: "scorching-mark",
        name: "The Scorching Mark",
        summary: "Area blast signature tuned for clustered enemies.",
        cp: 15,
        highlights: [
          "Blast radius pressure",
          "Reliable multi-target hit profile",
          "High battlefield visibility on release",
        ],
      },
      {
        id: "condemning-lance",
        name: "The Condemning Lance",
        summary: "Precision beam signature with penetration and focus.",
        cp: 15,
        highlights: [
          "Precision line strike",
          "Armor penetration baked into profile",
          "Charge-to-delete target rhythm",
        ],
      },
      {
        id: "branded-blade",
        name: "The Branded Blade",
        summary: "Melee channel signature with drain and lingering wound pressure.",
        cp: 15,
        highlights: [
          "Melee brand delivery",
          "Drain and continuing wound pressure",
          "Best when fighting up close",
        ],
      },
    ],
  },
  {
    id: "background",
    label: "Background",
    description: "Where the church, guild, and your mark first converged.",
    options: [
      {
        id: "penitent-flame",
        name: "The Penitent Flame",
        summary: "License-surviving brand bearer with strong church ties.",
        cp: 15,
        highlights: [
          "Church-facing social and legal utility",
          "Confessor and license network access",
          "Strong oversight navigation tools",
        ],
      },
      {
        id: "ruin-contact",
        name: "Ruin Contact",
        summary: "Old-age site specialist with deep salvage and artifact networks.",
        cp: 15,
        highlights: [
          "Ruin and artifact expertise",
          "Deep salvage contact network",
          "Strong old-age investigation utility",
        ],
      },
      {
        id: "frontier-brand",
        name: "Frontier Brand",
        summary: "Border-hardened channeler used to unstable field conditions.",
        cp: 15,
        highlights: [
          "Field-hardened under unstable conditions",
          "Practical combat consistency",
          "Border contract endurance profile",
        ],
      },
    ],
  },
];

export const archetypeConfigs: Record<ArchetypeId, ArchetypeConfig> = {
  blade: {
    ...archetypes[0],
    core: {
      ...bladeCore,
      dcvRanged: bladeCore.dcvOther,
      armor: 0,
      weaponLevel: 3,
    },
    choiceGroups: bladeChoiceGroups,
  },
  shieldbearer: {
    ...archetypes[1],
    core: shieldbearerCore,
    choiceGroups: shieldbearerChoiceGroups,
  },
  seeker: {
    ...archetypes[2],
    core: seekerCore,
    choiceGroups: seekerChoiceGroups,
  },
  chanter: {
    ...archetypes[3],
    core: chanterCore,
    choiceGroups: chanterChoiceGroups,
  },
  brand: {
    ...archetypes[4],
    core: brandCore,
    choiceGroups: brandChoiceGroups,
  },
};

export function getArchetypeConfigById(id: string): ArchetypeConfig {
  return archetypeConfigs[(id as ArchetypeId) ?? "blade"] ?? archetypeConfigs.blade;
}

export function getInitialSelectionsForArchetype(id: string): Record<string, string> {
  const config = getArchetypeConfigById(id);
  return Object.fromEntries(config.choiceGroups.map((group) => [group.id, group.options[0]?.id ?? ""]));
}

export const bladeCoreAttributes: SheetEntry[] = [
  { kind: "attribute", name: "Melee Attack", level: "2", cp: 2, notes: "+4 ACV with your chosen weapon class" },
  { kind: "attribute", name: "Melee Defence", level: "1", cp: 1, notes: "+2 DCV vs melee attacks" },
  {
    kind: "attribute",
    name: "Extra Actions",
    level: "1",
    cp: 4,
    notes: "One extra action per round; cumulative -1 penalty per additional action used",
  },
  { kind: "attribute", name: "Combat Technique", level: "2", cp: 2, notes: "Blind Fighting; Weapon Catch" },
  {
    kind: "attribute",
    name: "Heightened Awareness",
    level: "2",
    cp: 4,
    notes: "Edge die on initiative and threat-detection rolls",
  },
  { kind: "skill", name: "Skill Group: Combat Arts", level: "2", cp: 2, notes: "+2 die to melee-related skill checks" },
  { kind: "skill", name: "Skill Group: Athletics", level: "2", cp: 2, notes: "+2 die to running, climbing, and physical exertion" },
  {
    kind: "skill",
    name: "Skill Group: Streetwise",
    level: "2",
    cp: 2,
    notes: "+2 die to navigating guilds, markets, underworlds, and local politics",
  },
  {
    kind: "feature",
    name: "Features",
    level: "4",
    cp: 4,
    notes: "Quick Draw; Read the Fight; Measure; Blade Sense",
  },
  {
    kind: "contact",
    name: "Contacts",
    level: "2",
    cp: 2,
    notes: "Lantern Guild officers; low-level underworld acquaintances; fellow contractors",
  },
];

export const bladeCoreDefects: SheetEntry[] = [
  {
    kind: "defect",
    name: "Obligated",
    level: "2",
    cp: -4,
    notes: "Guild bond, dues, oaths, and mandatory contract assignments",
  },
  {
    kind: "defect",
    name: "Social Fault",
    level: "1",
    cp: -1,
    notes: "Hired fighter reputation causes social friction",
  },
  {
    kind: "defect",
    name: "Marked",
    level: "1",
    cp: -1,
    notes: "Recognizable scar, brand, or fighter's callus",
  },
];

export const bladeOptionSheetEntries: Record<string, SheetEntry[]> = {
  breaker: [
    { kind: "attribute", name: "Massive Damage", level: "2", cp: 6, notes: "DM becomes 7" },
    { kind: "attribute", name: "Tough", level: "2", cp: 2, notes: "+20 HP" },
    {
      kind: "attribute",
      name: "Combat Technique",
      level: "2",
      cp: 2,
      notes: "Reckless Charge; Savage Counter",
    },
    { kind: "feature", name: "Wound Surge", cp: 1, notes: "Below 50% HP, DM increases by +1" },
    { kind: "feature", name: "Raging Endurance", cp: 1, notes: "Below 25% HP, ignore injury-threshold penalties" },
    { kind: "feature", name: "War Cry", cp: 1, notes: "Once per encounter, enemies in earshot suffer obstacle on next attack" },
    { kind: "feature", name: "Blood Price", cp: 1, notes: "Drop target to 0 HP: recover 5 HP" },
    { kind: "skill", name: "Skill Group: Intimidation", level: "2", cp: 2, notes: "+2 die to threats and displays of force" },
    { kind: "skill", name: "Skill Group: Endurance", level: "2", cp: 2, notes: "+2 die to sustained exertion and resisting pain" },
    {
      kind: "defect",
      name: "Blind Fury",
      level: "1",
      cp: -2,
      notes: "Can enter berserk targeting state under trigger conditions",
    },
    {
      kind: "defect",
      name: "Shortcoming (Composure)",
      level: "1",
      cp: -1,
      notes: "Minor obstacle on Composure-aspect checks",
    },
  ],
  reckoner: [
    { kind: "attribute", name: "Massive Damage", level: "2", cp: 6, notes: "DM becomes 7" },
    { kind: "attribute", name: "Extra Actions", level: "1", cp: 4, notes: "Total 2 extra actions (3 attacks per round)" },
    { kind: "feature", name: "Battle Fury", cp: 1, notes: "Below 50% HP, minor edge on attack rolls" },
    { kind: "feature", name: "Bloodrush", cp: 1, notes: "Drop target to 0 HP: move up to half speed free" },
    { kind: "feature", name: "Through the Pain", cp: 1, notes: "Once per scene, ignore injury penalties for one round" },
    { kind: "skill", name: "Skill Group: Intimidation", level: "2", cp: 2, notes: "+2 die to threats and morale-breaking" },
    { kind: "skill", name: "Skill Group: Survival", level: "2", cp: 2, notes: "+2 die to enduring harsh conditions" },
    { kind: "defect", name: "Inept Defence", level: "2", cp: -2, notes: "-2 to all DCV" },
  ],
  "wind-step": [
    { kind: "attribute", name: "Defence Mastery", level: "2", cp: 2, notes: "+2 DCV all" },
    { kind: "attribute", name: "Ranged Defence", level: "1", cp: 1, notes: "+2 DCV vs ranged attacks" },
    { kind: "attribute", name: "Special Movement: Fast", level: "1", cp: 2, notes: "Running speed doubled" },
    { kind: "attribute", name: "Heightened Awareness", level: "1", cp: 2, notes: "Additional level (total L3)" },
    { kind: "feature", name: "Disengage", cp: 1, notes: "Move up to half speed after attacking without provoking" },
    { kind: "feature", name: "Lightning Reflexes", cp: 1, notes: "Minor edge on initiative rolls" },
    { kind: "feature", name: "Slippery", cp: 1, notes: "Enemy misses melee: move 2m as free action" },
    { kind: "feature", name: "Feint Mastery", cp: 1, notes: "Controlled Feint gains an additional edge die" },
    { kind: "skill", name: "Skill Group: Acrobatics", level: "2", cp: 2, notes: "+2 die to tumbling, balance, vaulting" },
    { kind: "skill", name: "Skill Group: Stealth", level: "2", cp: 2, notes: "+2 die to moving quietly" },
  ],
  cleaver: [
    { kind: "attribute", name: "Weapon", level: "4", cp: 8, notes: "Two-handed melee; damage = (4 x DM) + ACV" },
    { kind: "attribute", name: "Massive Damage", level: "1", cp: 3, notes: "DM +1" },
    { kind: "feature", name: "Reach", cp: 1, notes: "Acts first vs shorter weapons; corridor facing control" },
    { kind: "feature", name: "Intimidating Draw", cp: 1, notes: "Minor edge on Intimidation rolls in visual range" },
    { kind: "feature", name: "Cleave", cp: 1, notes: "Beat defence by 5+: half damage to adjacent secondary target" },
    { kind: "feature", name: "Brace", cp: 1, notes: "Spend action to halve next received hit" },
    { kind: "skill", name: "Skill Group: Heavy Weapons", level: "2", cp: 2, notes: "+2 die to large weapon checks" },
    { kind: "defect", name: "Inept Attack (confined spaces)", level: "1", cp: -1, notes: "-2 ACV in narrow/crowded spaces" },
    { kind: "defect", name: "Marked (weapon)", level: "1", cp: -1, notes: "Weapon cannot be concealed" },
  ],
  "paired-blades": [
    { kind: "attribute", name: "Weapon", level: "3", cp: 6, notes: "Primary blade; damage = (3 x DM) + ACV" },
    { kind: "attribute", name: "Extra Actions", level: "1", cp: 4, notes: "Total 2 extra actions per round" },
    { kind: "feature", name: "Ambidextrous", cp: 1, notes: "No off-hand penalty" },
    { kind: "feature", name: "Blade Catch", cp: 1, notes: "+1 DCV against one melee attack each round" },
    { kind: "feature", name: "Blur of Steel", cp: 1, notes: "Second+ attacks on same target gain minor edge" },
    { kind: "attribute", name: "Ranged Attack", level: "1", cp: 1, notes: "Can throw one blade as ranged attack" },
    { kind: "skill", name: "Skill Group: Dual Weapons", level: "2", cp: 2, notes: "+2 die to paired-weapon techniques" },
    { kind: "defect", name: "Conditional Ownership", level: "1", cp: -1, notes: "One blade is guild-issued or under lien" },
  ],
  "rune-marked": [
    {
      kind: "attribute",
      name: "Weapon (Rune-Marked)",
      level: "5 (effective 3)",
      cp: 10,
      notes: "Purchased L5, effective L3 after enhancements",
    },
    { kind: "enhancement", name: "Drain", cp: 0, notes: "Each hit reduces target Body by 1 (recovers 1/hour)" },
    {
      kind: "enhancement",
      name: "Continuing",
      cp: 0,
      notes: "One-fifth of original damage next round, bypasses armor",
    },
    { kind: "attribute", name: "Heightened Awareness", level: "1", cp: 2, notes: "Additional level (total L3)" },
    { kind: "feature", name: "Spirit Sense", cp: 1, notes: "Directional resonance near fiends/restless dead" },
    { kind: "feature", name: "Rune-Bond", cp: 1, notes: "Blade cannot be disarmed or taken without consent" },
    { kind: "feature", name: "Wound Memory", cp: 1, notes: "Sense if blade harmed nearby creature/location within past hour" },
    { kind: "skill", name: "Skill Group: Arcane Lore", level: "3", cp: 3, notes: "+3 die to old-age inscriptions and artifacts" },
    { kind: "defect", name: "Special Requirement", level: "1", cp: -1, notes: "Requires periodic re-inscription" },
    {
      kind: "defect",
      name: "Skeleton in the Closet",
      level: "1",
      cp: -2,
      notes: "Church scrutiny risk tied to rune-mark practice",
    },
  ],
  "barrow-warden": [
    { kind: "attribute", name: "Tough", level: "1", cp: 1, notes: "+10 HP" },
    { kind: "attribute", name: "Combat Technique", level: "2", cp: 2, notes: "Exorcist's Hold; Spirit Strike" },
    { kind: "attribute", name: "Heightened Awareness", level: "1", cp: 2, notes: "Additional level (total L3)" },
    { kind: "feature", name: "Ghost Sense", cp: 1, notes: "Directional sense of restless spirits and fiend-taint" },
    { kind: "feature", name: "Rite-Keeper", cp: 1, notes: "Can assist Twin Vigil funeral rites" },
    { kind: "feature", name: "Cold-Steady", cp: 1, notes: "Minor edge vs fear and supernatural dread" },
    { kind: "feature", name: "Mortuary Knowledge", cp: 1, notes: "Read cause/age/disturbance signs from remains" },
    { kind: "feature", name: "Quieting Touch", cp: 1, notes: "Once per encounter partial appeasing rite" },
    { kind: "skill", name: "Skill Group: Spirit Lore", level: "3", cp: 3, notes: "+3 die to spirits, rites, fiend behavior" },
    { kind: "skill", name: "Skill Group: Endurance", level: "2", cp: 2, notes: "+2 die to sustained exertion" },
    { kind: "contact", name: "Contacts", level: "2", cp: 2, notes: "Quiet Bell captains; exorcists-for-hire; shrine attendants" },
    { kind: "defect", name: "Skeleton in the Closet", level: "1", cp: -2, notes: "Compromising burial-site incident in your history" },
  ],
  "border-veteran": [
    { kind: "attribute", name: "Tough", level: "2", cp: 2, notes: "+20 HP" },
    { kind: "attribute", name: "Combat Technique", level: "2", cp: 2, notes: "Counterattack; Hold the Line" },
    { kind: "attribute", name: "Heightened Awareness", level: "1", cp: 2, notes: "Additional level (total L3)" },
    { kind: "feature", name: "Fiend Knowledge", cp: 1, notes: "Recognize fiend types, signs, and movement indicators" },
    { kind: "feature", name: "Formation Fighter", cp: 1, notes: "Minor edge when fighting with ally in melee range" },
    { kind: "feature", name: "Ground Sense", cp: 1, notes: "Edge on terrain tactical usage" },
    { kind: "feature", name: "Veteran's Resolve", cp: 1, notes: "Minor edge after receiving tactical information/orders" },
    { kind: "feature", name: "Read the Push", cp: 1, notes: "Estimate numbers/condition/morale from observation" },
    { kind: "skill", name: "Skill Group: Tactics", level: "2", cp: 2, notes: "+2 die to squad-level combat planning" },
    { kind: "skill", name: "Skill Group: Wilderness", level: "3", cp: 3, notes: "+3 die to navigation, tracking, fieldcraft" },
    { kind: "contact", name: "Contacts", level: "1", cp: 1, notes: "Former fort commanders; militia; border contractors" },
    { kind: "defect", name: "Nightmares", level: "2", cp: -2, notes: "Moderate frequency and daily effect" },
  ],
  "ruin-scout": [
    { kind: "attribute", name: "Heightened Awareness", level: "2", cp: 4, notes: "Two additional levels (total L4)" },
    { kind: "attribute", name: "Tough", level: "1", cp: 1, notes: "+10 HP" },
    { kind: "attribute", name: "Combat Technique", level: "1", cp: 1, notes: "Careful Strike" },
    { kind: "feature", name: "Ruin-Reading", cp: 1, notes: "Identify old-age tech and active/dormant states" },
    { kind: "feature", name: "Trap Sense", cp: 1, notes: "Minor edge on detecting/avoiding trap mechanisms" },
    { kind: "feature", name: "Seal Sense", cp: 1, notes: "Detect active old-age seals/fields by proximity" },
    { kind: "feature", name: "Quick Mapping", cp: 1, notes: "Accurate rough map after one pass" },
    { kind: "skill", name: "Skill Group: Infiltration", level: "2", cp: 2, notes: "+2 die to bypassing locks/wards" },
    { kind: "skill", name: "Skill Group: Arcane Lore", level: "2", cp: 2, notes: "+2 die to ruin-script and artifacts" },
    { kind: "skill", name: "Skill Group: Stealth", level: "2", cp: 2, notes: "+2 die to enclosed-space stealth" },
    { kind: "contact", name: "Contacts", level: "3", cp: 3, notes: "Off-ledger officers; relic fences; forbidden scholars" },
    {
      kind: "defect",
      name: "Skeleton in the Closet",
      level: "2",
      cp: -4,
      notes: "Serious legal/religious exposure tied to ruin work",
    },
  ],
};
