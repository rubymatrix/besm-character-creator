"use client";

import Image from "next/image";
import { type ComponentType, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  archetypes,
  getArchetypeConfigById,
  getInitialSelectionsForArchetype,
  type ArchetypeId,
  type ChoiceOption,
  type SheetEntry,
} from "@/lib/archetypes";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Flame, Music2, Search, Shield, Swords } from "lucide-react";

const mythicalCap = 10;
type Gender = "male" | "female";
type CreatorSheetData = {
  core: {
    body: number;
    mind: number;
    soul: number;
    coreCp: number;
    hp: number;
    ep: number;
    acv: number;
    dcvMelee: number;
    dcvOther: number;
    dcvRanged: number;
    dm: number;
    extraActions: number;
    armor: number;
    weaponLevel: number;
  };
  choiceGroups: {
    id: string;
    label: string;
    description: string;
    options: {
      id: string;
      name: string;
      summary: string;
      cp: number;
    }[];
  }[];
  flavorText: string[];
  coreAttributes: SheetEntry[];
  coreDefects: SheetEntry[];
  optionEntriesByChoice: Record<string, SheetEntry[]>;
};

const sheetEntryKindOrder: SheetEntry["kind"][] = [
  "attribute",
  "feature",
  "skill",
  "contact",
  "enhancement",
  "limiter",
  "defect",
];

const sheetEntryKindLabel: Record<SheetEntry["kind"], string> = {
  attribute: "Attributes",
  feature: "Features",
  skill: "Skills",
  contact: "Contacts",
  enhancement: "Enhancements",
  limiter: "Limiters",
  defect: "Defects",
};

function sumBy<T>(items: T[], getter: (item: T) => number | undefined): number {
  return items.reduce((total, item) => total + (getter(item) ?? 0), 0);
}

function levelAsNumber(level?: string): number {
  if (!level) {
    return 0;
  }

  const match = level.match(/\d+/);
  return match ? Number(match[0]) : 0;
}

export function CharacterCreator() {
  const router = useRouter();
  const [characterName, setCharacterName] = useState("");
  const [race, setRace] = useState("");
  const [gender, setGender] = useState<Gender>("male");
  const [selectedArchetypeId, setSelectedArchetypeId] = useState<ArchetypeId>("blade");
  const [selections, setSelections] = useState<Record<string, string>>(
    getInitialSelectionsForArchetype("blade")
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [sheetData, setSheetData] = useState<CreatorSheetData | null>(null);
  const [sheetError, setSheetError] = useState<string | null>(null);

  const fallbackConfig = getArchetypeConfigById(selectedArchetypeId);
  const activeChoiceGroups =
    sheetData?.choiceGroups && sheetData.choiceGroups.length
      ? sheetData.choiceGroups
      : fallbackConfig.choiceGroups;
  const activeCore = sheetData?.core ?? fallbackConfig.core;

  const selectedOptions = useMemo(() => {
    return activeChoiceGroups
      .map((group) => group.options.find((option) => option.id === selections[group.id]))
      .filter((option): option is ChoiceOption => Boolean(option));
  }, [activeChoiceGroups, selections]);

  const activeArchetype = archetypes.find((entry) => entry.id === selectedArchetypeId);
  const [previewCandidateIndexes, setPreviewCandidateIndexes] = useState<Record<string, number>>({});

  useEffect(() => {
    let cancelled = false;

    const loadSheet = async () => {
      setSheetError(null);
      const response = await fetch(`/api/archetypes/${selectedArchetypeId}/sheet`, {
        cache: "no-store",
      });

      if (!response.ok) {
        if (!cancelled) {
          setSheetData(null);
          setSheetError("Could not load packet details.");
        }
        return;
      }

      const payload = (await response.json()) as CreatorSheetData;
      if (!cancelled) {
        setSheetData(payload);
        if (payload.choiceGroups.length) {
          setSelections(
            Object.fromEntries(payload.choiceGroups.map((group) => [group.id, group.options[0]?.id ?? ""]))
          );
        }
      }
    };

    void loadSheet();

    return () => {
      cancelled = true;
    };
  }, [selectedArchetypeId]);

  const selectedChoiceNames = useMemo(() => {
    return activeChoiceGroups
      .map((group) => group.options.find((option) => option.id === selections[group.id])?.name)
      .filter((choice): choice is string => Boolean(choice));
  }, [activeChoiceGroups, selections]);

  const groupedSelectedSheetEntries = useMemo(() => {
    const grouped: Record<SheetEntry["kind"], SheetEntry[]> = {
      attribute: [],
      feature: [],
      skill: [],
      contact: [],
      enhancement: [],
      limiter: [],
      defect: [],
    };

    if (!sheetData) {
      return grouped;
    }

    const entries = selectedChoiceNames.flatMap(
      (choiceName) => sheetData.optionEntriesByChoice[choiceName] ?? []
    );

    for (const entry of entries) {
      grouped[entry.kind].push(entry);
    }

    return grouped;
  }, [selectedChoiceNames, sheetData]);

  const selectedOptionEntries = useMemo(() => {
    if (!sheetData) {
      return [] as SheetEntry[];
    }

    return selectedChoiceNames.flatMap((choiceName) => sheetData.optionEntriesByChoice[choiceName] ?? []);
  }, [selectedChoiceNames, sheetData]);

  const computedBonuses = useMemo(() => {
    let hpDelta = 0;
    let dmDelta = 0;
    let acvDelta = 0;
    let dcvMeleeDelta = 0;
    let dcvOtherDelta = 0;
    let dcvRangedDelta = 0;
    let extraActionsDelta = 0;
    let armorValue = activeCore.armor;
    let weaponLevel = activeCore.weaponLevel;

    for (const entry of selectedOptionEntries) {
      const level = levelAsNumber(entry.level);
      const lower = entry.name.toLowerCase();

      if (lower === "tough") hpDelta += level * 10;
      if (lower === "massive damage") dmDelta += level;
      if (lower === "extra actions") extraActionsDelta += level;
      if (lower === "melee attack" || lower === "ranged attack") acvDelta += level * 2;
      if (lower === "melee defence") dcvMeleeDelta += level * 2;
      if (lower === "ranged defence") dcvRangedDelta += level * 2;
      if (lower === "defence mastery") {
        dcvMeleeDelta += level * 2;
        dcvOtherDelta += level * 2;
        dcvRangedDelta += level * 2;
      }
      if (lower === "armour") armorValue = Math.max(armorValue, level * 5);
      if (lower.startsWith("weapon") && level > weaponLevel) weaponLevel = level;
    }

    return {
      hpDelta,
      dmDelta,
      acvDelta,
      dcvMeleeDelta,
      dcvOtherDelta,
      dcvRangedDelta,
      extraActionsDelta,
      armorValue,
      weaponLevel,
    };
  }, [activeCore.armor, activeCore.weaponLevel, selectedOptionEntries]);

  const computed = useMemo(() => {
    const rawAcv =
      activeCore.acv + sumBy(selectedOptions, (o) => o.acvDelta) + computedBonuses.acvDelta;
    const rawDcvMelee =
      activeCore.dcvMelee +
      sumBy(selectedOptions, (o) => o.dcvMeleeDelta) +
      computedBonuses.dcvMeleeDelta;
    const rawDcvOther =
      activeCore.dcvOther +
      sumBy(selectedOptions, (o) => o.dcvOtherDelta) +
      computedBonuses.dcvOtherDelta;
    const rangedBonus = sumBy(selectedOptions, (o) => o.dcvRangedBonus) + computedBonuses.dcvRangedDelta;
    const dm = activeCore.dm + sumBy(selectedOptions, (o) => o.dmDelta) + computedBonuses.dmDelta;
    const weaponLevel =
      selectedOptions.find((o) => o.weaponLevel)?.weaponLevel ?? computedBonuses.weaponLevel;
    const hp = activeCore.hp + sumBy(selectedOptions, (o) => o.hpDelta) + computedBonuses.hpDelta;
    const totalCp = activeCore.coreCp + sumBy(selectedOptions, (o) => o.cp);
    const extraActions =
      activeCore.extraActions +
      sumBy(selectedOptions, (o) => o.extraActionsDelta) +
      computedBonuses.extraActionsDelta;
    const armor = selectedOptions.find((o) => o.armorRating)?.armorRating ?? computedBonuses.armorValue;

    const acv = Math.min(rawAcv, mythicalCap);
    const dcvMelee = Math.min(rawDcvMelee, mythicalCap);
    const dcvOther = Math.min(rawDcvOther, mythicalCap);
    const dcvRanged = Math.min(activeCore.dcvRanged + rangedBonus, mythicalCap);
    const damagePerHit = weaponLevel * dm + acv;

    return {
      hp,
      ep: activeCore.ep,
      acv,
      dcvMelee,
      dcvOther,
      dcvRanged,
      dm,
      weaponLevel,
      damagePerHit,
      totalCp,
      extraActions,
      attacksPerRound: 1 + extraActions,
      armor,
    };
  }, [activeCore, computedBonuses, selectedOptions]);

  const archetypeIcons: Record<string, ComponentType<{ className?: string }>> = {
    blade: Swords,
    shieldbearer: Shield,
    seeker: Search,
    chanter: Music2,
    brand: Flame,
  };

  const previewImageCandidates = useMemo(
    () => [
      `/${selectedArchetypeId}_${gender}.png`,
      `/${selectedArchetypeId}.png`,
    ],
    [gender, selectedArchetypeId]
  );

  const previewVariantKey = `${selectedArchetypeId}:${gender}`;
  const previewCandidateIndex = previewCandidateIndexes[previewVariantKey] ?? 0;
  const previewImageSrc = previewImageCandidates[previewCandidateIndex] ?? null;

  const saveCharacter = async () => {
    if (!characterName.trim()) {
      setSaveError("Enter a character name before saving.");
      return;
    }

    setSaveError(null);
    setIsSaving(true);

    const [choiceOneGroup, choiceTwoGroup, choiceThreeGroup] = activeChoiceGroups;

    const body = {
      name: characterName.trim(),
      race: race.trim(),
      gender,
      archetype: selectedArchetypeId,
      fightingForm: selectedOptions.find((option) =>
        choiceOneGroup?.options.some((groupOption) => groupOption.id === option.id)
      )?.name,
      bladeSignature: selectedOptions.find((option) =>
        choiceTwoGroup?.options.some((groupOption) => groupOption.id === option.id)
      )?.name,
      background: selectedOptions.find((option) =>
        choiceThreeGroup?.options.some((groupOption) => groupOption.id === option.id)
      )?.name,
      body: activeCore.body,
      mind: activeCore.mind,
      soul: activeCore.soul,
      hp: computed.hp,
      ep: computed.ep,
      acv: computed.acv,
      dcvMelee: computed.dcvMelee,
      dcvOther: computed.dcvOther,
      dcvRanged: computed.dcvRanged,
      dm: computed.dm,
      weaponLevel: computed.weaponLevel,
      damagePerHit: computed.damagePerHit,
      totalCp: computed.totalCp,
      extraActions: computed.extraActions,
      attacksPerRound: computed.attacksPerRound,
      armor: computed.armor,
    };

    const response = await fetch("/api/characters", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const payload = (await response.json()) as { error?: string };
      setSaveError(payload.error ?? "Unable to save character.");
      setIsSaving(false);
      return;
    }

    const created = (await response.json()) as { id: string };
    router.push(`/character/${created.id}`);
  };

  return (
    <main className="creator-theme min-h-screen bg-[radial-gradient(circle_at_12%_8%,rgba(255,145,66,0.24),transparent_34%),radial-gradient(circle_at_88%_12%,rgba(255,189,120,0.18),transparent_36%),radial-gradient(circle_at_82%_36%,rgba(111,203,220,0.12),transparent_30%),linear-gradient(180deg,rgba(21,15,14,1)_0%,rgba(38,24,19,1)_45%,rgba(26,18,16,1)_100%)] px-4 py-6 md:px-8 md:py-10">
      <section className="mx-auto mb-5 max-w-7xl animate-in fade-in slide-in-from-bottom-1 duration-500">
        <Badge className="mb-3" variant="outline">
          Big Eyes, Small Mouth 4e
        </Badge>
        <h1 className="font-heading text-4xl leading-tight tracking-tight text-foreground md:text-5xl">
          Character Creator
        </h1>
        <div className="mt-4 flex flex-wrap gap-2">
          {archetypes.map((entry) => {
            const Icon = archetypeIcons[entry.id] ?? Swords;
            const selected = selectedArchetypeId === entry.id;
            return (
                <Button
                  key={entry.id}
                  type="button"
                  variant={selected ? "default" : "outline"}
                  onClick={() => {
                    setSelectedArchetypeId(entry.id as ArchetypeId);
                    setSelections(getInitialSelectionsForArchetype(entry.id));
                    setSaveError(null);
                  }}
                  className={cn("h-10 px-3", !selected && "bg-card/40")}
                >
                <Icon className="size-4" />
                <span>{entry.name}</span>
              </Button>
            );
          })}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(20rem,1fr)]">
        <Card className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          <CardHeader>
            <CardTitle className="font-heading text-2xl">{activeArchetype?.name}</CardTitle>
            <CardDescription>{activeArchetype?.summary}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {sheetData?.flavorText.length ? (
              <div className="space-y-2 rounded-lg border bg-muted/20 p-3">
                {sheetData.flavorText.map((paragraph) => (
                  <p key={paragraph} className="text-sm leading-relaxed text-muted-foreground">
                    {paragraph}
                  </p>
                ))}
              </div>
            ) : null}

            <div className="grid gap-3 md:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="character-name">Character Name</Label>
                <Input
                  id="character-name"
                  value={characterName}
                  onChange={(event) => setCharacterName(event.target.value)}
                  placeholder="Ryn Ashfall"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="character-race">Race</Label>
                <Input
                  id="character-race"
                  value={race}
                  onChange={(event) => setRace(event.target.value)}
                  placeholder="Human, Sylph, Beastkin..."
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="character-gender">Gender</Label>
                <Select value={gender} onValueChange={(value) => setGender(value as Gender)}>
                  <SelectTrigger id="character-gender" className="w-full">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="font-heading text-xl">{activeArchetype?.name} Core Stats ({activeCore.coreCp} CP)</h2>
              <p className="text-sm text-muted-foreground">
                Fixed base before options from the updated packet for this archetype.
              </p>
              <div className="grid grid-cols-2 gap-2 text-sm md:grid-cols-4">
                {[
                  ["Body", activeCore.body],
                  ["Mind", activeCore.mind],
                  ["Soul", activeCore.soul],
                  ["HP", activeCore.hp],
                  ["EP", activeCore.ep],
                  ["ACV", activeCore.acv],
                  ["DCV (Melee)", activeCore.dcvMelee],
                  ["DCV (Other)", activeCore.dcvOther],
                  ["DCV (Ranged)", activeCore.dcvRanged],
                  ["DM", activeCore.dm],
                  ["Core CP", activeCore.coreCp],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-lg border bg-muted/40 p-2">
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="font-heading text-lg leading-tight">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div className="space-y-5">
              {activeChoiceGroups.map((group) => (
                <section key={group.id}>
                  <h3 className="font-heading text-lg">{group.label}</h3>
                  <p className="mb-2 text-sm text-muted-foreground">{group.description}</p>
                  <div className="grid gap-3 md:grid-cols-[minmax(0,15rem)_minmax(0,1fr)]">
                    <div className="grid gap-2 md:content-start">
                      {group.options.map((option) => {
                        const selected = selections[group.id] === option.id;

                        return (
                          <Button
                            key={option.id}
                            type="button"
                            variant={selected ? "default" : "outline"}
                            className={cn(
                              "h-auto items-start justify-start p-3 text-left",
                              !selected && "bg-card/70"
                            )}
                            onClick={() =>
                              setSelections((current) => ({
                                ...current,
                                [group.id]: option.id,
                              }))
                            }
                          >
                            <div className="flex w-full items-center justify-between gap-2">
                              <span className="font-heading text-base">{option.name}</span>
                              <Badge variant={selected ? "secondary" : "outline"}>{option.cp} CP</Badge>
                            </div>
                          </Button>
                        );
                      })}
                    </div>

                    {(() => {
                      const selectedOption =
                        group.options.find((option) => option.id === selections[group.id]) ?? group.options[0];

                      if (!selectedOption) {
                        return (
                          <Card className="bg-card/60">
                            <CardContent className="p-4 text-sm text-muted-foreground">
                              No option selected.
                            </CardContent>
                          </Card>
                        );
                      }

                      const selectedOptionEntries = sheetData?.optionEntriesByChoice[selectedOption.name] ?? [];
                      const groupedSelectedOptionEntries = selectedOptionEntries.reduce<
                        Record<SheetEntry["kind"], SheetEntry[]>
                      >(
                        (accumulator, entry) => {
                          accumulator[entry.kind].push(entry);
                          return accumulator;
                        },
                        {
                          attribute: [],
                          feature: [],
                          skill: [],
                          contact: [],
                          enhancement: [],
                          limiter: [],
                          defect: [],
                        }
                      );

                      const fallbackOption = selectedOption as ChoiceOption;

                      return (
                        <Card className="bg-card/70">
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between gap-2">
                              <CardTitle className="font-heading text-xl">{selectedOption.name}</CardTitle>
                              <Badge variant="secondary">{selectedOption.cp} CP</Badge>
                            </div>
                            <CardDescription className="text-sm leading-relaxed">
                              {selectedOption.summary}
                            </CardDescription>
                            {fallbackOption.weaponNote ? (
                              <p className="text-xs text-muted-foreground italic">{fallbackOption.weaponNote}</p>
                            ) : null}
                          </CardHeader>
                          <CardContent className="space-y-3">
                            {selectedOptionEntries.length ? (
                              sheetEntryKindOrder.map((kind) =>
                                groupedSelectedOptionEntries[kind].length ? (
                                  <div key={`${group.id}-${selectedOption.id}-${kind}`}>
                                    <p className="mb-1 text-xs font-medium text-muted-foreground">
                                      {sheetEntryKindLabel[kind]}
                                    </p>
                                    <div className="space-y-1">
                                      {groupedSelectedOptionEntries[kind].map((entry) => (
                                        <p
                                          key={`${group.id}-${selectedOption.id}-${kind}-${entry.name}-${entry.notes}`}
                                          className="text-xs leading-relaxed text-muted-foreground"
                                        >
                                          • {entry.name}
                                          {entry.level ? ` L${entry.level}` : ""} ({entry.cp >= 0 ? `+${entry.cp}` : entry.cp} CP): {entry.notes}
                                        </p>
                                      ))}
                                    </div>
                                  </div>
                                ) : null
                              )
                            ) : fallbackOption.notes?.length || fallbackOption.highlights?.length ? (
                              <div>
                                <p className="mb-1 text-xs font-medium text-muted-foreground">Details</p>
                                <div className="space-y-1">
                                  {(fallbackOption.notes ?? fallbackOption.highlights ?? []).map((detail) => (
                                    <p
                                      key={`${group.id}-${selectedOption.id}-${detail}`}
                                      className="text-xs leading-relaxed text-muted-foreground"
                                    >
                                      • {detail}
                                    </p>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <p className="text-xs text-muted-foreground">
                                Detailed packet data for this option is not available yet.
                              </p>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })()}
                  </div>
                </section>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="h-fit overflow-hidden pt-0 animate-in fade-in slide-in-from-bottom-2 duration-700 lg:sticky lg:top-6">
          {previewImageSrc ? (
            <div className="relative h-[400px] w-full overflow-hidden rounded-t-xl border-b">
              <Image
                src={previewImageSrc}
                alt={`${activeArchetype?.name ?? "Archetype"} ${gender} preview`}
                fill
                sizes="(max-width: 1024px) 100vw, 24rem"
                className="object-cover object-top"
                priority
                onError={() => {
                  setPreviewCandidateIndexes((current) => ({
                    ...current,
                    [previewVariantKey]: (current[previewVariantKey] ?? 0) + 1,
                  }));
                }}
              />
            </div>
          ) : null}
          <CardHeader>
            <CardTitle className="font-heading text-2xl">
              {characterName.trim() || "Unnamed Character"}
            </CardTitle>
            <CardDescription>
              {gender === "female" ? "Female" : "Male"}, {race.trim() || "Race not chosen"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2 text-sm">
                {[
                  ["Body", activeCore.body],
                  ["Mind", activeCore.mind],
                  ["Soul", activeCore.soul],
                  ["HP", computed.hp],
                  ["EP", computed.ep],
                  ["DM", computed.dm],
                  ["ACV", computed.acv],
                  ["DCV (Melee)", computed.dcvMelee],
                  ["DCV (Other)", computed.dcvOther],
                  ["DCV (Ranged)", computed.dcvRanged],
                  ["Weapon Level", computed.weaponLevel],
                  ["Damage / Hit", computed.damagePerHit],
                ].map(([label, value]) => (
                  <Card key={label} size="sm" className="bg-muted/25 py-2">
                    <CardContent className="px-2">
                      <p className="text-xs text-muted-foreground">{label}</p>
                      <p className="font-heading text-lg leading-tight">{value}</p>
                    </CardContent>
                  </Card>
                ))}
            </div>

            <Separator />

            <div className="space-y-1 text-sm">
              <p>
                <span className="text-muted-foreground">Total CP:</span> {computed.totalCp}
              </p>
              <p>
                <span className="text-muted-foreground">Extra Actions:</span> {computed.extraActions}
              </p>
              <p>
                <span className="text-muted-foreground">Attacks/Round:</span> {computed.attacksPerRound}
              </p>
              <p>
                <span className="text-muted-foreground">Armor Rating:</span> {computed.armor || "None"}
              </p>
            </div>

            <div className="space-y-3 rounded-lg border bg-muted/30 p-3">
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Full Sheet Preview
              </p>

              {sheetError ? <p className="text-xs text-destructive">{sheetError}</p> : null}

              {sheetData ? (
                <>
                  <div>
                    <p className="mb-1 text-xs font-medium">Core Attributes</p>
                    <div className="space-y-1">
                        {sheetData.coreAttributes.map((entry) => (
                          <p key={`core-attr-${entry.name}-${entry.notes}`} className="text-xs leading-relaxed text-muted-foreground">
                          • {entry.name}
                          {entry.level ? ` L${entry.level}` : ""} ({entry.cp >= 0 ? `+${entry.cp}` : entry.cp} CP)
                          </p>
                        ))}
                    </div>
                  </div>

                  <div>
                    <p className="mb-1 text-xs font-medium">Core Defects</p>
                    <div className="space-y-1">
                      {sheetData.coreDefects.map((entry) => (
                        <p key={`core-defect-${entry.name}-${entry.notes}`} className="text-xs leading-relaxed text-muted-foreground">
                          • {entry.name}
                          {entry.level ? ` L${entry.level}` : ""} ({entry.cp} CP)
                        </p>
                      ))}
                    </div>
                  </div>

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
                    groupedSelectedSheetEntries[kind].length ? (
                      <div key={`selected-${kind}`}>
                        <p className="mb-1 text-xs font-medium">Selected {label}</p>
                        <div className="space-y-1">
                          {groupedSelectedSheetEntries[kind].map((entry) => (
                            <p
                              key={`${kind}-${entry.name}-${entry.notes}`}
                              className="text-xs leading-relaxed text-muted-foreground"
                            >
                              • {entry.name}
                              {entry.level ? ` L${entry.level}` : ""} ({entry.cp >= 0 ? `+${entry.cp}` : entry.cp} CP)
                            </p>
                          ))}
                        </div>
                      </div>
                    ) : null
                  )}
                </>
              ) : (
                <p className="text-xs text-muted-foreground">Loading packet-based attributes...</p>
              )}
            </div>

            <p className="text-xs leading-relaxed text-muted-foreground">
              Formula: Damage = Weapon Level x DM + ACV. Mythical ACV/DCV cap of 10 is enforced.
              Extra actions stack and still take cumulative penalties each round.
            </p>

            <Button type="button" className="w-full" onClick={saveCharacter} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Character and Open Detail"}
            </Button>
            {saveError ? <p className="text-xs text-destructive">{saveError}</p> : null}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
