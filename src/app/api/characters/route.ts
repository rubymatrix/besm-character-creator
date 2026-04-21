import { prisma } from "@/lib/prisma";

type CreateCharacterPayload = {
  name: string;
  race?: string;
  gender: "male" | "female";
  archetype: string;
  fightingForm?: string;
  bladeSignature?: string;
  background?: string;
  body: number;
  mind: number;
  soul: number;
  hp: number;
  ep: number;
  acv: number;
  dcvMelee: number;
  dcvOther: number;
  dcvRanged: number;
  dm: number;
  weaponLevel: number;
  damagePerHit: number;
  totalCp: number;
  extraActions: number;
  attacksPerRound: number;
  armor: number;
};

export async function GET() {
  const characters = await prisma.character.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      upgrades: {
        where: { status: "pending" },
        select: { id: true },
      },
    },
  });

  return Response.json(
    characters.map((character) => ({
      ...character,
      pendingUpgradeCount: character.upgrades.length,
      upgrades: undefined,
    }))
  );
}

export async function POST(request: Request) {
  const payload = (await request.json()) as Partial<CreateCharacterPayload>;

  if (!payload.name?.trim()) {
    return Response.json({ error: "Character name is required." }, { status: 400 });
  }

  if (!payload.archetype) {
    return Response.json({ error: "Archetype is required." }, { status: 400 });
  }

  if (!payload.gender || (payload.gender !== "male" && payload.gender !== "female")) {
    return Response.json({ error: "Gender must be male or female." }, { status: 400 });
  }

  const requiredStats = [
    "body",
    "mind",
    "soul",
    "hp",
    "ep",
    "acv",
    "dcvMelee",
    "dcvOther",
    "dcvRanged",
    "dm",
    "weaponLevel",
    "damagePerHit",
    "totalCp",
    "extraActions",
    "attacksPerRound",
    "armor",
  ] as const;

  for (const stat of requiredStats) {
    if (typeof payload[stat] !== "number") {
      return Response.json({ error: `Missing stat: ${stat}` }, { status: 400 });
    }
  }

  const character = await prisma.character.create({
    data: {
      name: payload.name.trim(),
      race: payload.race?.trim() || null,
      gender: payload.gender,
      archetype: payload.archetype,
      fightingForm: payload.fightingForm ?? null,
      bladeSignature: payload.bladeSignature ?? null,
      background: payload.background ?? null,
      body: payload.body as number,
      mind: payload.mind as number,
      soul: payload.soul as number,
      hp: payload.hp as number,
      ep: payload.ep as number,
      acv: payload.acv as number,
      dcvMelee: payload.dcvMelee as number,
      dcvOther: payload.dcvOther as number,
      dcvRanged: payload.dcvRanged as number,
      dm: payload.dm as number,
      weaponLevel: payload.weaponLevel as number,
      damagePerHit: payload.damagePerHit as number,
      totalCp: payload.totalCp as number,
      extraActions: payload.extraActions as number,
      attacksPerRound: payload.attacksPerRound as number,
      armor: payload.armor as number,
    },
  });

  return Response.json(character, { status: 201 });
}
