import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function CharactersPage() {
  const characters = await prisma.character.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      archetype: true,
      race: true,
      gender: true,
      createdAt: true,
    },
  });

  return (
    <main className="min-h-screen bg-background px-4 py-6 md:px-8 md:py-10">
      <div className="mx-auto max-w-5xl space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-3xl">Created Characters</CardTitle>
            <CardDescription>
              Browse every character currently in the campaign and open their full sheet.
            </CardDescription>
          </CardHeader>
        </Card>

        {characters.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">No characters created yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {characters.map((character) => (
              <Card key={character.id}>
                <CardContent className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-heading text-xl">{character.name}</p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {character.gender}, {character.race ?? "race not chosen"}, {character.archetype}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Created {character.createdAt.toLocaleString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="capitalize">
                      {character.archetype}
                    </Badge>
                    <Link
                      href={`/character/${character.id}`}
                      className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:opacity-90"
                    >
                      Open Sheet
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
