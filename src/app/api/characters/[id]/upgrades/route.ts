import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  const upgrades = await prisma.upgradePrompt.findMany({
    where: {
      characterId: id,
      status: status === "pending" || status === "accepted" || status === "declined" ? status : undefined,
    },
    orderBy: { createdAt: "asc" },
  });

  return Response.json(upgrades);
}
