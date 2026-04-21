import { prisma } from "@/lib/prisma";

type CreateUpgradePayload = {
  characterId: string;
  title: string;
  description: string;
  options: string[];
};

export async function POST(request: Request) {
  const payload = (await request.json()) as Partial<CreateUpgradePayload>;

  if (!payload.characterId) {
    return Response.json({ error: "Character is required." }, { status: 400 });
  }

  if (!payload.title?.trim()) {
    return Response.json({ error: "Upgrade title is required." }, { status: 400 });
  }

  const options = payload.options?.filter((option) => option.trim().length > 0) ?? [];

  if (options.length < 2) {
    return Response.json({ error: "Provide at least two options." }, { status: 400 });
  }

  const upgrade = await prisma.upgradePrompt.create({
    data: {
      characterId: payload.characterId,
      title: payload.title.trim(),
      description: payload.description?.trim() ?? "",
      options,
    },
  });

  return Response.json(upgrade, { status: 201 });
}
