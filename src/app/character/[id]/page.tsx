import { notFound } from "next/navigation";
import { CharacterDetailClient } from "@/components/character-detail-client";
import { getParsedArchetypeSheet } from "@/lib/archetype-sheet-parser";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function CharacterDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const character = await prisma.character.findUnique({ where: { id } });

  if (!character) {
    notFound();
  }

  const upgrades = await prisma.upgradePrompt.findMany({
    where: { characterId: id },
    orderBy: { createdAt: "desc" },
  });

  const initialSheetData = await getParsedArchetypeSheet(character.archetype);

  return (
    <CharacterDetailClient
      initialCharacter={{ ...character, createdAt: character.createdAt.toISOString() }}
      initialSheetData={initialSheetData}
      initialUpgrades={upgrades.map((upgrade) => ({
        ...upgrade,
        options: Array.isArray(upgrade.options) ? (upgrade.options as string[]) : [],
        createdAt: upgrade.createdAt.toISOString(),
      }))}
    />
  );
}
