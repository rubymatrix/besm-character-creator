import { getParsedArchetypeSheet } from "@/lib/archetype-sheet-parser";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const sheet = await getParsedArchetypeSheet(id);
  return Response.json(sheet);
}
