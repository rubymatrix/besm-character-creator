export type ChoiceOption = {
  id: string;
  name: string;
  summary: string;
  cp: number;
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

export const archetypes = [
  {
    id: "blade",
    name: "Blade",
    status: "playable",
    summary:
      "Professional frontline fighter built from Fighting Form, Blade Signature, and Guild Background.",
  },
  {
    id: "shieldbearer",
    name: "Shieldbearer",
    status: "in-progress",
    summary: "Defensive archetype draft is not fully written yet.",
  },
  {
    id: "seeker",
    name: "Seeker",
    status: "in-progress",
    summary: "Scout and investigator archetype is still being drafted.",
  },
  {
    id: "chanter",
    name: "Chanter",
    status: "in-progress",
    summary: "Mystic support archetype is still being drafted.",
  },
  {
    id: "brand",
    name: "Brand",
    status: "in-progress",
    summary: "Rune-marked specialist archetype is still being drafted.",
  },
] as const;

export const bladeCore = {
  body: 7,
  mind: 5,
  soul: 6,
  coreCp: 53,
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
        id: "ironwall",
        name: "The Ironwall",
        summary: "Durable frontline anchor that soaks punishment and guards allies.",
        cp: 14,
        hpDelta: 30,
        dcvMeleeDelta: 2,
        dcvOtherDelta: 2,
        armorRating: 10,
        notes: ["Guardian interpose feature", "Reduced running speed"],
      },
      {
        id: "reckless-edge",
        name: "The Reckless Edge",
        summary: "High-offense stance that trades defense for damage and tempo.",
        cp: 11,
        dmDelta: 2,
        extraActionsDelta: 1,
        dcvMeleeDelta: -2,
        dcvOtherDelta: -2,
        notes: ["Battle Fury below 50% HP", "Very vulnerable to counterattacks"],
      },
      {
        id: "wind-step",
        name: "Wind Step",
        summary: "Mobile duelist with evasive movement and ranged defense.",
        cp: 11,
        hpDelta: -10,
        dcvMeleeDelta: 2,
        dcvOtherDelta: 2,
        dcvRangedBonus: 2,
        notes: ["Double movement speed", "Fragile if enemies connect"],
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
        cp: 13,
        dmDelta: 1,
        weaponLevel: 4,
        weaponNote: "Greatweapon; hard to conceal in civilized areas.",
      },
      {
        id: "paired-blades",
        name: "The Paired Blades",
        summary: "Dual-wield style that increases action economy and strike volume.",
        cp: 12,
        extraActionsDelta: 1,
        weaponLevel: 3,
        weaponNote: "Off-hand control and one additional attack each round.",
      },
      {
        id: "rune-marked",
        name: "The Rune-Marked Blade",
        summary: "Inscribed weapon with Drain and Continuing wound pressure.",
        cp: 10,
        weaponLevel: 3,
        weaponNote: "Purchased at L5, effective L3 after two enhancements.",
        notes: ["Drain reduces Body over time", "Ongoing wound damage next round"],
      },
    ],
  },
  {
    id: "guildBackground",
    label: "Guild Background",
    description: "Your prior contract history and non-combat edge.",
    options: [
      {
        id: "pit-fighter",
        name: "Pit Fighter",
        summary: "Arena veteran with intimidation and attrition durability.",
        cp: 11,
        hpDelta: 20,
      },
      {
        id: "shadow-operative",
        name: "Shadow Operative",
        summary: "Stealth and infiltration specialist with off-ledger contacts.",
        cp: 11,
      },
      {
        id: "road-contractor",
        name: "Road Contractor",
        summary: "Travel-hardened escort expert with regional route knowledge.",
        cp: 12,
        hpDelta: 20,
      },
    ],
  },
];
