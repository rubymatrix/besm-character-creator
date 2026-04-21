"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getArchetypeConfigById, type SheetEntry } from "@/lib/archetypes";

type CharacterRecord = {
  id: string;
  name: string;
  race: string | null;
  gender: "male" | "female";
  archetype: string;
  fightingForm: string | null;
  bladeSignature: string | null;
  background: string | null;
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
  createdAt: string;
};

type UpgradePrompt = {
  id: string;
  title: string;
  description: string;
  options: string[];
  status: "pending" | "accepted" | "declined";
  selectedOption: string | null;
  createdAt: string;
};

type SheetData = {
  coreAttributes: SheetEntry[];
  coreDefects: SheetEntry[];
  optionEntriesByChoice: Record<string, SheetEntry[]>;
};

export function CharacterDetailClient({
  initialCharacter,
  initialSheetData,
  initialUpgrades,
}: {
  initialCharacter: CharacterRecord;
  initialSheetData: SheetData;
  initialUpgrades: UpgradePrompt[];
}) {
  const [upgrades, setUpgrades] = useState<UpgradePrompt[]>(initialUpgrades);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const archetypeConfig = getArchetypeConfigById(initialCharacter.archetype);

  const storedChoices = [
    initialCharacter.fightingForm,
    initialCharacter.bladeSignature,
    initialCharacter.background,
  ];

  const selectedChoiceNames = storedChoices.filter((choice): choice is string => Boolean(choice));

  const selectedSheetEntries = useMemo(() => {
    const entries = selectedChoiceNames.flatMap(
      (choiceName) => initialSheetData.optionEntriesByChoice[choiceName] ?? []
    );
    const grouped: Record<SheetEntry["kind"], SheetEntry[]> = {
      attribute: [],
      feature: [],
      skill: [],
      contact: [],
      enhancement: [],
      limiter: [],
      defect: [],
    };

    for (const entry of entries) {
      grouped[entry.kind].push(entry);
    }

    return grouped;
  }, [initialSheetData.optionEntriesByChoice, selectedChoiceNames]);

  const pendingUpgrade = useMemo(
    () => upgrades.find((upgrade) => upgrade.status === "pending") ?? null,
    [upgrades]
  );

  useEffect(() => {
    const poll = window.setInterval(async () => {
      const response = await fetch(`/api/characters/${initialCharacter.id}/upgrades?status=pending`, {
        cache: "no-store",
      });

      if (!response.ok) {
        return;
      }

      const pending = (await response.json()) as UpgradePrompt[];

      setUpgrades((current) => {
        const existingNonPending = current.filter((upgrade) => upgrade.status !== "pending");
        return [...existingNonPending, ...pending];
      });
    }, 4000);

    return () => window.clearInterval(poll);
  }, [initialCharacter.id]);

  const chooseUpgrade = async (option: string) => {
    if (!pendingUpgrade) {
      return;
    }

    setIsSubmitting(true);
    const response = await fetch(`/api/upgrades/${pendingUpgrade.id}/respond`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ selectedOption: option }),
    });

    if (response.ok) {
      const resolved = (await response.json()) as UpgradePrompt;
      setUpgrades((current) =>
        current.map((upgrade) => (upgrade.id === resolved.id ? resolved : upgrade))
      );
    }

    setIsSubmitting(false);
  };

  const previewImage =
    initialCharacter.archetype === "blade"
      ? initialCharacter.gender === "female"
        ? "/blade_female.png"
        : "/blade_male.png"
      : null;

  return (
    <main className="min-h-screen bg-background px-4 py-6 md:px-8 md:py-10">
      <div className="mx-auto max-w-6xl space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-3xl">{initialCharacter.name}</CardTitle>
            <CardDescription>
              {initialCharacter.gender === "female" ? "Female" : "Male"}, {initialCharacter.race ?? "Race not chosen"}
            </CardDescription>
          </CardHeader>
        </Card>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <Card>
            <CardHeader>
              <CardTitle className="font-heading">Current Build</CardTitle>
              <CardDescription>Keep this page open to receive live upgrade prompts.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2 text-sm md:grid-cols-3">
              {[
                ["Body", initialCharacter.body],
                ["Mind", initialCharacter.mind],
                ["Soul", initialCharacter.soul],
                ["HP", initialCharacter.hp],
                ["EP", initialCharacter.ep],
                ["DM", initialCharacter.dm],
                ["ACV", initialCharacter.acv],
                ["DCV (Melee)", initialCharacter.dcvMelee],
                ["DCV (Other)", initialCharacter.dcvOther],
                ["DCV (Ranged)", initialCharacter.dcvRanged],
                ["Weapon Level", initialCharacter.weaponLevel],
                ["Damage / Hit", initialCharacter.damagePerHit],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg border bg-muted/30 p-2">
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="font-heading text-lg">{value}</p>
                </div>
              ))}

              <div className="col-span-full mt-2 text-sm text-muted-foreground">
                <p>Total CP: {initialCharacter.totalCp}</p>
                <p>Extra Actions: {initialCharacter.extraActions}</p>
                <p>Attacks/Round: {initialCharacter.attacksPerRound}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden pt-0">
            {previewImage ? (
              <div className="relative h-[320px] w-full border-b">
                <Image
                  src={previewImage}
                  alt={`${initialCharacter.archetype} preview`}
                  fill
                  className="object-cover object-top"
                  sizes="(max-width: 1024px) 100vw, 24rem"
                />
              </div>
            ) : null}
            <CardHeader>
              <CardTitle className="font-heading">Archetype Detail</CardTitle>
              <CardDescription className="capitalize">{initialCharacter.archetype}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {archetypeConfig.choiceGroups.map((group, index) => (
                <p key={group.id}>
                  {group.label}: {storedChoices[index] ?? "n/a"}
                </p>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="font-heading">Attributes Chosen</CardTitle>
            <CardDescription>
              Full sheet breakdown from the archetype packet, including attributes, defects,
              enhancements, and limiters.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border bg-muted/20 p-3">
              <p className="mb-2 text-sm font-medium">Core Attributes</p>
              <div className="space-y-1">
                {initialSheetData.coreAttributes.map((entry) => (
                  <p key={entry.name} className="text-sm text-muted-foreground">
                    • {entry.name}
                    {entry.level ? ` L${entry.level}` : ""} ({entry.cp >= 0 ? `+${entry.cp}` : entry.cp} CP): {entry.notes}
                  </p>
                ))}
              </div>
            </div>

            <div className="rounded-lg border bg-muted/20 p-3">
              <p className="mb-2 text-sm font-medium">Core Defects</p>
              <div className="space-y-1">
                {initialSheetData.coreDefects.map((entry) => (
                  <p key={entry.name} className="text-sm text-muted-foreground">
                    • {entry.name}
                    {entry.level ? ` L${entry.level}` : ""} ({entry.cp >= 0 ? `+${entry.cp}` : entry.cp} CP): {entry.notes}
                  </p>
                ))}
              </div>
            </div>

            {selectedChoiceNames.length ? (
              <div className="grid gap-3">
                {(
                  [
                    ["attribute", "Attributes"],
                    ["feature", "Features"],
                    ["skill", "Skills"],
                    ["contact", "Contacts"],
                    ["enhancement", "Enhancements"],
                    ["limiter", "Limiters"],
                    ["defect", "Defects"],
                  ] as const
                ).map(([kind, label]) =>
                  selectedSheetEntries[kind].length ? (
                    <div key={kind} className="rounded-lg border p-3">
                      <p className="mb-2 font-medium">{label}</p>
                      <div className="space-y-1">
                        {selectedSheetEntries[kind].map((entry) => (
                          <p
                            key={`${kind}-${entry.name}-${entry.notes}`}
                            className="text-sm text-muted-foreground"
                          >
                            • {entry.name}
                            {entry.level ? ` L${entry.level}` : ""} ({entry.cp >= 0 ? `+${entry.cp}` : entry.cp} CP): {entry.notes}
                          </p>
                        ))}
                      </div>
                    </div>
                  ) : null
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No option attributes found for this archetype yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-heading">Upgrade Log</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {upgrades.length ? (
              upgrades
                .slice()
                .sort((a, b) => Number(new Date(b.createdAt)) - Number(new Date(a.createdAt)))
                .map((upgrade) => (
                  <div key={upgrade.id} className="rounded-lg border p-3">
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <p className="font-medium">{upgrade.title}</p>
                      <Badge variant={upgrade.status === "pending" ? "secondary" : "outline"}>
                        {upgrade.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{upgrade.description}</p>
                    {upgrade.selectedOption ? (
                      <p className="mt-1 text-sm">Chosen: {upgrade.selectedOption}</p>
                    ) : null}
                  </div>
                ))
            ) : (
              <p className="text-sm text-muted-foreground">No upgrades sent yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {pendingUpgrade ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <Card className="w-full max-w-xl">
            <CardHeader>
              <Badge className="w-fit" variant="secondary">
                Upgrade Available
              </Badge>
              <CardTitle className="font-heading">{pendingUpgrade.title}</CardTitle>
              <CardDescription>{pendingUpgrade.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {pendingUpgrade.options.map((option) => (
                <Button
                  key={option}
                  className="w-full justify-start"
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => chooseUpgrade(option)}
                >
                  {option}
                </Button>
              ))}
              <Separator className="my-2" />
              <p className="text-xs text-muted-foreground">
                This prompt was sent by the GM. Choose one option to continue.
              </p>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </main>
  );
}
