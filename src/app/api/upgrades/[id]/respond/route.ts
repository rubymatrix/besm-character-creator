import { prisma } from "@/lib/prisma";

type RespondPayload = {
  selectedOption: string;
};

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const payload = (await request.json()) as Partial<RespondPayload>;

  if (!payload.selectedOption?.trim()) {
    return Response.json({ error: "Selected option is required." }, { status: 400 });
  }

  const current = await prisma.upgradePrompt.findUnique({ where: { id } });

  if (!current) {
    return Response.json({ error: "Upgrade request not found." }, { status: 404 });
  }

  if (current.status !== "pending") {
    return Response.json({ error: "Upgrade request is already resolved." }, { status: 409 });
  }

  const options = Array.isArray(current.options) ? current.options : [];

  if (!options.includes(payload.selectedOption)) {
    return Response.json({ error: "Selected option is invalid for this request." }, { status: 400 });
  }

  const resolved = await prisma.upgradePrompt.update({
    where: { id },
    data: {
      status: "accepted",
      selectedOption: payload.selectedOption,
      resolvedAt: new Date(),
    },
  });

  return Response.json(resolved);
}
