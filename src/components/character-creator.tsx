"use client";

import { useMemo, useState } from "react";
import { archetypes, bladeChoiceGroups, bladeCore, type ChoiceOption } from "@/lib/archetypes";
import styles from "./character-creator.module.css";

const mythicalCap = 10;

function sumBy<T>(items: T[], getter: (item: T) => number | undefined): number {
  return items.reduce((total, item) => total + (getter(item) ?? 0), 0);
}

export function CharacterCreator() {
  const [characterName, setCharacterName] = useState("");
  const [race, setRace] = useState("");
  const [selectedArchetypeId, setSelectedArchetypeId] = useState("blade");
  const [selections, setSelections] = useState<Record<string, string>>({
    fightingForm: bladeChoiceGroups[0].options[0].id,
    bladeSignature: bladeChoiceGroups[1].options[0].id,
    guildBackground: bladeChoiceGroups[2].options[0].id,
  });

  const selectedOptions = useMemo(() => {
    return bladeChoiceGroups
      .map((group) => group.options.find((option) => option.id === selections[group.id]))
      .filter((option): option is ChoiceOption => Boolean(option));
  }, [selections]);

  const computed = useMemo(() => {
    const rawAcv = bladeCore.acv + sumBy(selectedOptions, (o) => o.acvDelta);
    const rawDcvMelee = bladeCore.dcvMelee + sumBy(selectedOptions, (o) => o.dcvMeleeDelta);
    const rawDcvOther = bladeCore.dcvOther + sumBy(selectedOptions, (o) => o.dcvOtherDelta);
    const rangedBonus = sumBy(selectedOptions, (o) => o.dcvRangedBonus);
    const dm = bladeCore.dm + sumBy(selectedOptions, (o) => o.dmDelta);
    const weaponLevel = selectedOptions.find((o) => o.weaponLevel)?.weaponLevel ?? 3;
    const hp = bladeCore.hp + sumBy(selectedOptions, (o) => o.hpDelta);
    const totalCp = bladeCore.coreCp + sumBy(selectedOptions, (o) => o.cp);
    const extraActions = bladeCore.extraActions + sumBy(selectedOptions, (o) => o.extraActionsDelta);
    const armor = selectedOptions.find((o) => o.armorRating)?.armorRating ?? 0;

    const acv = Math.min(rawAcv, mythicalCap);
    const dcvMelee = Math.min(rawDcvMelee, mythicalCap);
    const dcvOther = Math.min(rawDcvOther, mythicalCap);
    const dcvRanged = Math.min(rawDcvOther + rangedBonus, mythicalCap);
    const damagePerHit = weaponLevel * dm + acv;

    return {
      hp,
      ep: bladeCore.ep,
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
  }, [selectedOptions]);

  const activeArchetype = archetypes.find((entry) => entry.id === selectedArchetypeId);
  const isBlade = selectedArchetypeId === "blade";

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <p className={styles.kicker}>Big Eyes, Small Mouth 4e</p>
        <h1>Character Creator</h1>
        <p>
          Build characters from your archetype packet. Blade is fully interactive now, and the
          other archetypes are ready to slot in as those drafts are completed.
        </p>
      </section>

      <section className={styles.grid}>
        <div className={styles.builderPanel}>
          <div className={styles.fieldRow}>
            <label>
              Character Name
              <input
                value={characterName}
                onChange={(event) => setCharacterName(event.target.value)}
                placeholder="Ryn Ashfall"
              />
            </label>
            <label>
              Race
              <input
                value={race}
                onChange={(event) => setRace(event.target.value)}
                placeholder="Human, Sylph, Beastkin..."
              />
            </label>
          </div>

          <h2>Archetype</h2>
          <div className={styles.archetypeList}>
            {archetypes.map((entry) => (
              <button
                key={entry.id}
                type="button"
                className={`${styles.archetypeCard} ${
                  selectedArchetypeId === entry.id ? styles.archetypeCardActive : ""
                }`}
                onClick={() => setSelectedArchetypeId(entry.id)}
              >
                <span>{entry.name}</span>
                <small>{entry.status === "playable" ? "Playable" : "In Progress"}</small>
                <p>{entry.summary}</p>
              </button>
            ))}
          </div>

          {isBlade ? (
            bladeChoiceGroups.map((group) => (
              <section key={group.id} className={styles.choiceGroup}>
                <h3>{group.label}</h3>
                <p>{group.description}</p>
                <div className={styles.options}>
                  {group.options.map((option) => {
                    const selected = selections[group.id] === option.id;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        className={`${styles.optionCard} ${selected ? styles.optionCardActive : ""}`}
                        onClick={() =>
                          setSelections((current) => ({
                            ...current,
                            [group.id]: option.id,
                          }))
                        }
                      >
                        <div>
                          <strong>{option.name}</strong>
                          <small>{option.cp} CP</small>
                        </div>
                        <p>{option.summary}</p>
                        {option.weaponNote ? <em>{option.weaponNote}</em> : null}
                      </button>
                    );
                  })}
                </div>
              </section>
            ))
          ) : (
            <section className={styles.placeholder}>
              <h3>{activeArchetype?.name}</h3>
              <p>
                This archetype is still in draft. Keep using Blade for full calculations, then swap
                in your finalized archetype packet when its options are ready.
              </p>
            </section>
          )}
        </div>

        <aside className={styles.summaryPanel}>
          <h2>{characterName.trim() || "Unnamed Character"}</h2>
          <p>{race.trim() || "Race not chosen"}</p>

          <div className={styles.statsGrid}>
            <div>
              <strong>Body</strong>
              <span>{bladeCore.body}</span>
            </div>
            <div>
              <strong>Mind</strong>
              <span>{bladeCore.mind}</span>
            </div>
            <div>
              <strong>Soul</strong>
              <span>{bladeCore.soul}</span>
            </div>
            <div>
              <strong>HP</strong>
              <span>{computed.hp}</span>
            </div>
            <div>
              <strong>EP</strong>
              <span>{computed.ep}</span>
            </div>
            <div>
              <strong>DM</strong>
              <span>{computed.dm}</span>
            </div>
            <div>
              <strong>ACV</strong>
              <span>{computed.acv}</span>
            </div>
            <div>
              <strong>DCV (Melee)</strong>
              <span>{computed.dcvMelee}</span>
            </div>
            <div>
              <strong>DCV (Other)</strong>
              <span>{computed.dcvOther}</span>
            </div>
            <div>
              <strong>DCV (Ranged)</strong>
              <span>{computed.dcvRanged}</span>
            </div>
            <div>
              <strong>Weapon Level</strong>
              <span>{computed.weaponLevel}</span>
            </div>
            <div>
              <strong>Damage / Hit</strong>
              <span>{computed.damagePerHit}</span>
            </div>
          </div>

          <div className={styles.metaList}>
            <p>
              <strong>Total CP:</strong> {computed.totalCp}
            </p>
            <p>
              <strong>Extra Actions:</strong> {computed.extraActions}
            </p>
            <p>
              <strong>Total Attacks/Round:</strong> {computed.attacksPerRound}
            </p>
            <p>
              <strong>Armor Rating:</strong> {computed.armor || "None"}
            </p>
          </div>

          <p className={styles.footnote}>
            Formula: Damage = Weapon Level x DM + ACV. Mythical ACV/DCV cap of 10 is enforced.
            Extra actions stack and still take cumulative penalties each round.
          </p>
        </aside>
      </section>
    </main>
  );
}
