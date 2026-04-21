import { promises as fs } from "node:fs";
import path from "node:path";
import { cache } from "react";
import {
  bladeCoreAttributes,
  bladeCoreDefects,
  bladeOptionSheetEntries,
  getArchetypeConfigById,
  type SheetEntry,
} from "@/lib/archetypes";

export type ParsedArchetypeSheet = {
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

const packetDirectory = path.resolve(
  process.cwd(),
  "..",
  "Worlds",
  "The World of Yruun",
  "Campaigns",
  "The Farm Beneath the Vigil",
  "Character Setup and Guild Briefing",
  "Character Creation Packet"
);

const archetypeToFilename: Record<string, string> = {
  blade: "Blade.md",
  shieldbearer: "Shieldbearer.md",
  seeker: "Seeker.md",
  chanter: "Chanter.md",
  brand: "Brand.md",
};

const fallbackDataByArchetype: Partial<
  Record<
    string,
    {
      coreAttributes: SheetEntry[];
      coreDefects: SheetEntry[];
      optionEntriesByOptionId: Record<string, SheetEntry[]>;
    }
  >
> = {
  blade: {
    coreAttributes: bladeCoreAttributes,
    coreDefects: bladeCoreDefects,
    optionEntriesByOptionId: bladeOptionSheetEntries,
  },
};

function buildFallbackSheet(archetypeId: string): ParsedArchetypeSheet {
  const config = getArchetypeConfigById(archetypeId);
  const fallback = fallbackDataByArchetype[archetypeId];
  const optionEntriesByChoice = Object.fromEntries(
    config.choiceGroups.flatMap((group) =>
      group.options.map((option) => [option.name, fallback?.optionEntriesByOptionId[option.id] ?? []])
    )
  );

  return {
    core: config.core,
    choiceGroups: config.choiceGroups,
    flavorText: [config.summary],
    coreAttributes: fallback?.coreAttributes ?? [],
    coreDefects: fallback?.coreDefects ?? [],
    optionEntriesByChoice,
  };
}

function normalizeCell(value: string): string {
  return value
    .replace(/\*\*/g, "")
    .replace(/`/g, "")
    .replace(/[—–]/g, ", ")
    .replace(/\s-\s/g, ", ")
    .replace(/\s+/g, " ")
    .trim();
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function parseCp(value: string): number {
  const match = value.replace(/−/g, "-").match(/[-+]?\d+/);
  return match ? Number(match[0]) : 0;
}

function parseFirstNumber(value: string): number {
  const match = normalizeCell(value).replace(/−/g, "-").match(/-?\d+/);
  return match ? Number(match[0]) : 0;
}

function toEntryKind(name: string): SheetEntry["kind"] {
  const normalized = name.toLowerCase();
  if (normalized.startsWith("feature:")) {
    return "feature";
  }
  if (normalized.startsWith("defect:")) {
    return "defect";
  }
  if (normalized.startsWith("enhancement:")) {
    return "enhancement";
  }
  if (normalized.startsWith("limiter:")) {
    return "limiter";
  }
  if (normalized.startsWith("skill group:")) {
    return "skill";
  }
  if (normalized === "features") {
    return "feature";
  }
  if (normalized.startsWith("contacts") || normalized.startsWith("contact")) {
    return "contact";
  }
  return "attribute";
}

function normalizeNameForKind(name: string, kind: SheetEntry["kind"]): string {
  if (kind === "feature") {
    return name.replace(/^feature:\s*/i, "").trim();
  }
  if (kind === "defect") {
    return name.replace(/^defect:\s*/i, "").trim();
  }
  if (kind === "enhancement") {
    return name.replace(/^enhancement:\s*/i, "").trim();
  }
  if (kind === "limiter") {
    return name.replace(/^limiter:\s*/i, "").trim();
  }
  return name;
}

function parseTableRows(lines: string[], startIndex: number): { rows: string[][]; nextIndex: number } {
  const rows: string[][] = [];
  let index = startIndex + 2;

  while (index < lines.length && lines[index].trim().startsWith("|")) {
    const raw = lines[index].trim();
    const columns = raw
      .split("|")
      .slice(1, -1)
      .map((column) => normalizeCell(column));

    if (columns.some((column) => column.length > 0)) {
      rows.push(columns);
    }

    index += 1;
  }

  return { rows, nextIndex: index };
}

function rowToSheetEntry(
  row: string[],
  context: "core-attributes" | "core-defects" | "option"
): SheetEntry | null {
  if (!row.length) {
    return null;
  }

  let name = row[0] ?? "";
  const levelRaw = row.length >= 4 ? row[1] : undefined;
  const cpRaw = row.length >= 4 ? row[2] : row.length === 3 ? row[1] : "0";
  const notes = row.length >= 4 ? row[3] : row.length === 3 ? row[2] : "";

  if (!name || name.toLowerCase().includes("total")) {
    return null;
  }

  let kind: SheetEntry["kind"] = toEntryKind(name);
  if (context === "core-defects") {
    kind = "defect";
  }

  name = normalizeNameForKind(name, kind);

  const level = levelRaw && levelRaw !== "-" && levelRaw !== "—" ? levelRaw : undefined;

  return {
    kind,
    name,
    level,
    cp: parseCp(cpRaw),
    notes,
  };
}

function extractFlavorText(lines: string[]): string[] {
  const paragraphs: string[] = [];
  let buffer: string[] = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (line === "---") {
      break;
    }

    if (!line) {
      if (buffer.length) {
        paragraphs.push(normalizeCell(buffer.join(" ")));
        buffer = [];
      }
      continue;
    }

    if (line.startsWith("#")) {
      continue;
    }

    buffer.push(line);
  }

  if (buffer.length) {
    paragraphs.push(normalizeCell(buffer.join(" ")));
  }

  return paragraphs;
}

function extractChoiceGroups(lines: string[]) {
  const groups: {
    id: string;
    label: string;
    description: string;
    options: { id: string; name: string; summary: string; cp: number }[];
  }[] = [];

  let currentGroup:
    | {
        id: string;
        label: string;
        description: string;
        options: { id: string; name: string; summary: string; cp: number }[];
      }
    | null = null;

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].trim();

    const groupMatch = line.match(/^#\s+Choice\s+\d+:\s+(.+?)\s*[—-]\s*\d+\s*CP/i);
    if (groupMatch) {
      const label = normalizeCell(groupMatch[1]);
      currentGroup = {
        id: slugify(label),
        label,
        description: "",
        options: [],
      };
      groups.push(currentGroup);
      continue;
    }

    if (!currentGroup) {
      continue;
    }

    if (!currentGroup.description) {
      const candidate = line;
      if (candidate && !candidate.startsWith("#") && !candidate.startsWith("|")) {
        currentGroup.description = normalizeCell(candidate);
      }
    }

    const optionMatch = line.match(/^##\s+[A-C]\)\s+(.+?)\s*[—-]\s*(\d+)\s*CP/i);
    if (!optionMatch) {
      continue;
    }

    const optionName = normalizeCell(optionMatch[1]);
    const cp = Number(optionMatch[2]);
    const summaryLines: string[] = [];
    let scanIndex = index + 1;

    while (scanIndex < lines.length) {
      const scanLine = lines[scanIndex].trim();
      if (!scanLine) {
        if (summaryLines.length) {
          break;
        }
        scanIndex += 1;
        continue;
      }

      if (scanLine.startsWith("#") || scanLine.startsWith("|")) {
        break;
      }

      summaryLines.push(scanLine);
      scanIndex += 1;
    }

    currentGroup.options.push({
      id: slugify(optionName),
      name: optionName,
      summary: normalizeCell(summaryLines.join(" ")) || optionName,
      cp,
    });
  }

  for (const group of groups) {
    if (!group.description) {
      group.description = `Select one ${group.label.toLowerCase()} option.`;
    }
  }

  return groups;
}

function extractCore(lines: string[], coreAttributes: SheetEntry[]) {
  const core = {
    body: 0,
    mind: 0,
    soul: 0,
    coreCp: 55,
    hp: 0,
    ep: 0,
    acv: 0,
    dcvMelee: 0,
    dcvOther: 0,
    dcvRanged: 0,
    dm: 5,
    extraActions: 0,
    armor: 0,
    weaponLevel: 1,
  };

  const coreBuildLine = lines.find((line) => /^##\s+Core Build\s+—\s+\d+\s+CP/i.test(line.trim()));
  if (coreBuildLine) {
    core.coreCp = parseFirstNumber(coreBuildLine);
  }

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].trim();
    const nextLine = lines[index + 1]?.trim() ?? "";
    if (!line.startsWith("|") || !/^\|(?:\s*[-:]+\s*\|)+$/.test(nextLine)) {
      continue;
    }

    const { rows, nextIndex } = parseTableRows(lines, index);
    index = nextIndex - 1;

    for (const row of rows) {
      const label = (row[0] ?? "").toLowerCase();
      const value = row[2] ?? row[1] ?? "";

      if (label === "body") core.body = parseFirstNumber(value);
      if (label === "mind") core.mind = parseFirstNumber(value);
      if (label === "soul") core.soul = parseFirstNumber(value);
      if (label === "hp") core.hp = parseFirstNumber(value);
      if (label === "ep") core.ep = parseFirstNumber(value);
      if (label === "acv" || label.startsWith("acv ")) core.acv = parseFirstNumber(value);
      if (label.includes("dcv (melee")) core.dcvMelee = parseFirstNumber(value);
      if (label.includes("dcv (other")) core.dcvOther = parseFirstNumber(value);
      if (label.includes("dcv (ranged")) core.dcvRanged = parseFirstNumber(value);
      if (label === "damage multiplier") core.dm = parseFirstNumber(value) || core.dm;
      if (label === "ar") core.armor = parseFirstNumber(value);
    }
  }

  if (!core.dcvRanged) {
    core.dcvRanged = core.dcvOther;
  }

  for (const entry of coreAttributes) {
    const name = entry.name.toLowerCase();
    const level = parseFirstNumber(entry.level ?? "0");
    if (name === "extra actions") {
      core.extraActions += level;
    }
    if (name.startsWith("weapon") && level > core.weaponLevel) {
      core.weaponLevel = level;
    }
    if (name === "armour" && !core.armor) {
      core.armor = level * 5;
    }
  }

  return core;
}

function parseArchetypeSheetMarkdown(markdown: string): ParsedArchetypeSheet {
  const lines = markdown.split(/\r?\n/);
  const flavorText = extractFlavorText(lines);
  const choiceGroups = extractChoiceGroups(lines);
  const coreAttributes: SheetEntry[] = [];
  const coreDefects: SheetEntry[] = [];
  const optionEntriesByChoice: Record<string, SheetEntry[]> = {};

  let mode: "core-attributes" | "core-defects" | "option" | null = null;
  let currentOption: string | null = null;
  let index = 0;

  while (index < lines.length) {
    const line = lines[index].trim();

    if (/^###\s+Core Attributes/i.test(line)) {
      mode = "core-attributes";
      currentOption = null;
      index += 1;
      continue;
    }

    if (/^###\s+Core Defects/i.test(line)) {
      mode = "core-defects";
      currentOption = null;
      index += 1;
      continue;
    }

    const optionMatch = line.match(/^##\s+[A-C]\)\s+(.+?)\s+(?:—|-)\s+15\s+CP/i);
    if (optionMatch) {
      mode = "option";
      currentOption = normalizeCell(optionMatch[1]);
      optionEntriesByChoice[currentOption] = [];
      index += 1;
      continue;
    }

    if (/^#{1,6}\s+/.test(line)) {
      mode = null;
      currentOption = null;
      index += 1;
      continue;
    }

    const nextLine = lines[index + 1]?.trim() ?? "";
    if (mode && line.startsWith("|") && /^\|(?:\s*[-:]+\s*\|)+$/.test(nextLine)) {
      const { rows, nextIndex } = parseTableRows(lines, index);
      for (const row of rows) {
        const entry = rowToSheetEntry(row, mode);
        if (!entry) {
          continue;
        }

        if (mode === "core-attributes") {
          coreAttributes.push(entry);
        } else if (mode === "core-defects") {
          coreDefects.push(entry);
        } else if (mode === "option" && currentOption) {
          optionEntriesByChoice[currentOption].push(entry);
        }
      }

      index = nextIndex;
      continue;
    }

    index += 1;
  }

  const core = extractCore(lines, coreAttributes);

  return {
    core,
    choiceGroups,
    flavorText,
    coreAttributes,
    coreDefects,
    optionEntriesByChoice,
  };
}

export const getParsedArchetypeSheet = cache(async (archetypeId: string): Promise<ParsedArchetypeSheet> => {
  const filename = archetypeToFilename[archetypeId] ?? archetypeToFilename.blade;
  const absolutePath = path.resolve(packetDirectory, filename);

  try {
    const markdown = await fs.readFile(absolutePath, "utf8");
    return parseArchetypeSheetMarkdown(markdown);
  } catch (error) {
    if ((error as NodeJS.ErrnoException)?.code === "ENOENT") {
      return buildFallbackSheet(archetypeId);
    }

    throw error;
  }
});
