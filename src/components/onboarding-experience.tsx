"use client";

import { gsap } from "gsap";
import { BookOpen, ChevronLeft, ChevronRight, Map, Moon, Shield, Sparkles } from "lucide-react";
import Image from "next/image";
import { Fragment } from "react";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const splashLines = [
  "Yruun is an old world that lives carefully.",
  "Villages survive by shrine bells, guild charters, honest work, and the teachings of the Twin Vigil.",
  "You are newly enrolled C-rank Lantern Guild adventurers from Harrowfen and the Sablemere Farmlands.",
];

const primerSteps = [
  {
    label: "The World",
    title: "Yruun Lives Carefully",
    icon: Moon,
    body: [
      "Most people live close to the ground: farming villages, shrine towns, trade roads, guild halls, border posts, and market squares where everyone knows who missed shrine bell and whose roof needs repair.",
      "Work is done by hand, craft, prayer, sweat, and season. The dominant faith, the Twin Vigil, teaches that the world survives through humility, restraint, and balance.",
    ],
    bullets: [
      "The white moon Lumae is mercy.",
      "The black moon Veyr is warning.",
      "Ruins, sealed places, and strange ancient works are treated with fear and religious caution.",
    ],
  },
  {
    label: "Faith",
    title: "The Twin Vigil Shapes Daily Life",
    icon: Sparkles,
    body: [
      "The Twin Vigil is not only temple doctrine. It is the calendar, the funeral rite, the blessing over fields, the reason roads are forbidden, and the reason most people distrust power that arrives too easily.",
      "Magic exists, but most people understand it as blessing, prayer, spirit pact, sacred duty, or dangerous old knowledge.",
    ],
    bullets: [
      "Faithful characters fit naturally.",
      "Doubtful characters also fit, as long as they understand the church matters.",
      "The community takes rites, death, and spiritual boundaries seriously.",
    ],
  },
  {
    label: "Home",
    title: "Harrowfen and the Sablemere Farmlands",
    icon: Map,
    body: [
      "You are from Harrowfen, a small shrine-market town on the southern edge of the Sablemere Farmlands.",
      "Harrowfen is practical, muddy, devout, and intimate. People know each other's families, debts, habits, and mistakes.",
    ],
    bullets: [
      "Lumae Green is the market common and public notice board.",
      "The Twin Vigil Shrine is the religious heart of town.",
      "Harrowfen Lantern House is the local adventurer guild hall.",
      "Stonewake Wood is the forest north of the farms. Most people avoid it after dark.",
    ],
  },
  {
    label: "Guild",
    title: "You Just Joined the Lantern Guild",
    icon: Shield,
    body: [
      "The Lantern Guild handles dangerous work ordinary villagers, shrine attendants, and farm militias cannot.",
      "You are not famous heroes. You are newly enrolled C-rank adventurers from Harrowfen and the surrounding farmlands.",
    ],
    bullets: [
      "People in town know your face, mostly as a local who recently started wearing guild colors.",
      "C-rank work is real work, but senior guild members still watch you closely.",
      "Guild jobs can involve escorts, monsters, strange sites, and problems local authorities cannot safely ignore.",
    ],
  },
  {
    label: "Build",
    title: "Character Creation Rules",
    icon: BookOpen,
    body: [
      "Build a custom BESM 4th Edition character. Your character should be local to Harrowfen or the Sablemere Farmlands.",
      "The campaign starts at Adventurer power level.",
    ],
    bullets: [
      "Starting Character Points: 50 CP.",
      "Guild Rank: C-rank.",
      "Max Stat Value: 9.",
      "Max Effective Attribute Level: 4.",
      "Combat Values: 3-8. HP and EP: 40-80. Damage Multiplier: 4-8.",
    ],
  },
  {
    label: "Skills",
    title: "Skill Groups Must Stay Official",
    icon: BookOpen,
    body: [
      "If you buy the Skill Group Attribute, use only the official BESM 4th Edition groups. Do not invent custom Skill Group names.",
      "Put your specialty inside the official group, such as Academic for Twin Vigil doctrine, Adventuring for monster survival, or Technical for approved tools and ward maintenance.",
    ],
    bullets: [
      "Background, 1 CP/level: Academic, Artistic, Domestic, Occupation.",
      "Field, 2 CP/level: Business, Social, Street, Technical.",
      "Action, 3 CP/level: Adventuring, Detective, Military, Scientific.",
    ],
  },
  {
    label: "The Vels",
    title: "Your Character Knows the Vel Family",
    icon: Sparkles,
    body: [
      "Your character should know the Vel family of Vel Orchard and Apiary in the North Orchard Bounds.",
      "They are part of ordinary Harrowfen life, not distant quest-givers.",
    ],
    bullets: [
      "Toma Vel: father, former militia cook, known for feeding people who showed up muddy and tired.",
      "Seren Vel: mother, beekeeper and shrine donor, known for clean beeswax candles and quiet kindness.",
      "Illa Vel: teenage daughter, recently enrolled with your Lantern Guild intake.",
      "Benn Vel: young son, known for carved toy swords and too much curiosity.",
    ],
  },
  {
    label: "Hooks",
    title: "Come Ready With Local Ties",
    icon: Map,
    body: [
      "Before play, answer at least two Vel family connection questions. These are for character planning and table discussion.",
      "Your character does not need to be fearless. It is better if they are not.",
    ],
    bullets: [
      "How did you know Toma Vel?",
      "What kindness did Seren Vel show you?",
      "What did Illa say or do when she enrolled with your guild intake?",
      "What small memory do you have of Benn?",
      "What work did you once do around Vel Orchard and Apiary?",
    ],
  },
  {
    label: "Tone",
    title: "What This Campaign Wants",
    icon: Moon,
    body: [
      "Expect rural fantasy, community ties, religious pressure, dangerous field work, mystery, and things hidden under ordinary places.",
      "The campaign works best if Harrowfen matters to you.",
    ],
    bullets: [
      "Good fits include farm kids, shrine-raised locals, guild hall regulars, scouts, healers, ward-workers, guards, and odd-touched troublemakers.",
      "Avoid characters who are already famous, politically powerful, wealthy outsiders, or disconnected from Harrowfen.",
      "Be new enough that C-rank work still feels dangerous and brave enough to answer when the Lantern Guild calls.",
    ],
  },
];

const amberButtonClass =
  "border border-amber-300/50 bg-amber-300/10 text-amber-200 hover:bg-amber-300/20 hover:text-amber-100";

function splitToChars(text: string, keyPrefix: string, scope: "title" | "body") {
  const words = text.split(" ");

  return words.map((word, wordIndex) => (
    <Fragment key={`${keyPrefix}-word-${wordIndex}`}>
      <span className="inline-block whitespace-nowrap">
        {word.split("").map((char, charIndex) => (
          <span
            key={`${keyPrefix}-${wordIndex}-${charIndex}`}
            data-char
            data-scope={scope}
            className="inline-block will-change-transform"
          >
            {char}
          </span>
        ))}
      </span>
      {wordIndex < words.length - 1 ? " " : null}
    </Fragment>
  ));
}

export function OnboardingExperience() {
  const splashRef = useRef<HTMLElement | null>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const [phase, setPhase] = useState<"splash" | "primer">("splash");
  const [isIntroRevealed, setIsIntroRevealed] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const currentStep = primerSteps[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === primerSteps.length - 1;
  const progress = useMemo(
    () => ((currentStepIndex + 1) / primerSteps.length) * 100,
    [currentStepIndex]
  );

  useLayoutEffect(() => {
    if (!splashRef.current || phase !== "splash") {
      return;
    }

    setIsIntroRevealed(false);

    const ctx = gsap.context(() => {
      const titleChars = gsap.utils.toArray<HTMLElement>('[data-scope="title"]');
      const bodyChars = gsap.utils.toArray<HTMLElement>('[data-scope="body"]');
      const cta = gsap.utils.toArray<HTMLElement>("[data-cta]");

      gsap.set([...titleChars, ...bodyChars], {
        opacity: 0,
        y: 24,
        filter: "blur(6px)",
      });

      gsap.set(cta, { opacity: 0, y: 16 });

      const tl = gsap.timeline({
        onComplete: () => {
          setIsIntroRevealed(true);
        },
      });

      timelineRef.current = tl;

      tl.to(titleChars, {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        duration: 1.35,
        ease: "power3.out",
        stagger: 0.06,
      })
        .to(
          bodyChars,
          {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.8,
            ease: "power3.out",
            stagger: 0.02,
          },
          "+=0.35"
        )
        .to(
          cta,
          {
            opacity: 1,
            y: 0,
            duration: 0.45,
            ease: "power2.out",
          },
          "+=0.2"
        );
    }, splashRef);

    return () => {
      timelineRef.current = null;
      ctx.revert();
    };
  }, [phase]);

  const revealIntroImmediately = useCallback(() => {
    if (phase !== "splash" || isIntroRevealed) {
      return;
    }

    timelineRef.current?.progress(1);
    setIsIntroRevealed(true);
  }, [phase, isIntroRevealed]);

  useEffect(() => {
    if (phase === "splash" && !isIntroRevealed) {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key !== "Enter") {
          return;
        }

        event.preventDefault();
        revealIntroImmediately();
      };

      window.addEventListener("keydown", handleKeyDown);

      return () => {
        window.removeEventListener("keydown", handleKeyDown);
      };
    }

    if (phase === "primer") {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          setCurrentStepIndex((index) => Math.max(index - 1, 0));
        }

        if (event.key === "ArrowRight") {
          event.preventDefault();
          setCurrentStepIndex((index) => Math.min(index + 1, primerSteps.length - 1));
        }
      };

      window.addEventListener("keydown", handleKeyDown);

      return () => {
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [phase, isIntroRevealed, revealIntroImmediately]);

  const moveToNextStep = () => {
    if (isLastStep) {
      return;
    }

    setCurrentStepIndex((index) => Math.min(index + 1, primerSteps.length - 1));
  };

  if (phase === "primer") {
    const Icon = currentStep.icon;

    return (
      <section
        className="relative min-h-screen overflow-hidden bg-[#171414] px-4 py-4 text-stone-100 md:px-8 md:py-6"
      >
        <Image
          src="/yruun.png"
          alt="Moonlit view over Yruun"
          fill
          priority
          className="object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(10,8,8,0.9)_0%,rgba(21,16,14,0.78)_52%,rgba(10,8,8,0.9)_100%)]" />

        <div className="relative z-10 mx-auto flex min-h-[75vh] w-full max-w-5xl flex-col pb-4">
          <header className="mb-4 flex items-center justify-between gap-3">
            <div>
              <Badge variant="outline" className="mb-2 border-stone-500/60 bg-stone-950/40 text-stone-200">
                The Farm Beneath the Vigil
              </Badge>
              <h1 className="font-heading text-2xl leading-tight text-white md:text-4xl">
                Player Campaign Primer
              </h1>
            </div>
          </header>

          <div className="mb-4 h-2 overflow-hidden rounded-full bg-stone-800">
            <div
              className="h-full rounded-full bg-amber-400 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="mb-4 flex items-center justify-between gap-3 lg:hidden">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCurrentStepIndex((index) => Math.max(index - 1, 0))}
              disabled={isFirstStep}
              className="border-stone-500/60 bg-stone-950/40 text-stone-100 hover:bg-stone-800"
            >
              <ChevronLeft className="size-4" />
              Back
            </Button>

            <div className="flex max-w-[44%] flex-wrap justify-center gap-1">
              {primerSteps.map((step, index) => (
                <button
                  key={`mobile-dot-${step.label}`}
                  type="button"
                  aria-label={`Go to ${step.label}`}
                  onClick={() => setCurrentStepIndex(index)}
                  className={cn(
                    "size-2.5 rounded-full border border-stone-500 transition-colors",
                    index === currentStepIndex ? "bg-amber-300" : "bg-stone-800"
                  )}
                />
              ))}
            </div>

            {isLastStep ? (
              <Button
                type="button"
                disabled
                className={cn(
                  amberButtonClass,
                  "disabled:border-amber-300/40 disabled:bg-amber-300/10 disabled:text-amber-200 disabled:opacity-70"
                )}
              >
                Done
              </Button>
            ) : (
              <Button type="button" onClick={moveToNextStep} className={amberButtonClass}>
                Next
                <ChevronRight className="size-4" />
              </Button>
            )}
          </div>

          <main className="grid flex-1 gap-4 lg:grid-cols-[13rem_minmax(0,1fr)]">
            <nav className="hidden content-start gap-2 lg:grid">
              {primerSteps.map((step, index) => {
                const StepIcon = step.icon;
                const selected = index === currentStepIndex;

                return (
                  <Button
                    key={step.label}
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStepIndex(index)}
                    className={cn(
                      "h-auto justify-start gap-2 whitespace-normal border-stone-600/70 bg-stone-950/45 p-3 text-left text-stone-200 hover:bg-stone-800",
                      selected && "border-yellow-300 bg-stone-800 !text-yellow-300 hover:bg-stone-800"
                    )}
                  >
                    <StepIcon className={cn("size-4", selected && "!text-yellow-300")} />
                    <span className={cn(selected && "!text-yellow-300")}>{step.label}</span>
                  </Button>
                );
              })}
            </nav>

            <article className="grid content-start gap-5 rounded-lg border border-stone-600/70 bg-stone-950/70 p-5 shadow-2xl shadow-black/30 md:p-7">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex size-11 items-center justify-center rounded-lg border border-amber-300/50 bg-amber-300/10">
                    <Icon className="size-5 text-amber-200" />
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.22em] text-amber-200">
                      {currentStep.label}
                    </p>
                    <h2 className="font-heading text-3xl leading-tight text-white md:text-5xl">
                      {currentStep.title}
                    </h2>
                  </div>
                </div>
                <Badge variant="outline" className="border-stone-500/60 bg-stone-900 text-stone-200">
                  {currentStepIndex + 1} / {primerSteps.length}
                </Badge>
              </div>

              <div className="space-y-4 text-base leading-relaxed text-stone-200 md:text-lg">
                {currentStep.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>

              <div className="grid gap-2">
                {currentStep.bullets.map((bullet) => (
                  <div
                    key={bullet}
                    className="rounded-lg border border-stone-700 bg-stone-900/70 px-3 py-2 text-sm leading-relaxed text-stone-200 md:text-base"
                  >
                    {bullet}
                  </div>
                ))}
              </div>
            </article>
          </main>

          <footer className="mt-4 hidden items-center justify-between gap-3 lg:flex">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCurrentStepIndex((index) => Math.max(index - 1, 0))}
              disabled={isFirstStep}
              className="border-stone-500/60 bg-stone-950/40 text-stone-100 hover:bg-stone-800"
            >
              <ChevronLeft className="size-4" />
              Back
            </Button>

            <div className="flex max-w-[45%] flex-wrap justify-center gap-1">
              {primerSteps.map((step, index) => (
                <button
                  key={`dot-${step.label}`}
                  type="button"
                  aria-label={`Go to ${step.label}`}
                  onClick={() => setCurrentStepIndex(index)}
                  className={cn(
                    "size-2.5 rounded-full border border-stone-500 transition-colors",
                    index === currentStepIndex ? "bg-amber-300" : "bg-stone-800"
                  )}
                />
              ))}
            </div>

            {isLastStep ? (
              <Button
                type="button"
                disabled
                className={cn(
                  amberButtonClass,
                  "disabled:border-amber-300/40 disabled:bg-amber-300/10 disabled:text-amber-200 disabled:opacity-70"
                )}
              >
                Primer Complete
              </Button>
            ) : (
              <Button
                type="button"
                onClick={moveToNextStep}
                className={amberButtonClass}
              >
                Next
                <ChevronRight className="size-4" />
              </Button>
            )}
          </footer>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={splashRef}
      onPointerDown={revealIntroImmediately}
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-5 py-8 transition-all duration-900 md:px-10"
    >
      <Image
        src="/yruun.png"
        alt="Moonlit view over Yruun"
        fill
        priority
        className="object-cover opacity-25"
      />

      <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center text-left">
        <h1 className="mb-6 w-full max-w-2xl font-heading text-5xl text-white md:text-7xl">
          {splitToChars("Welcome to Yruun", "title", "title")}
        </h1>

        <div className="max-w-2xl space-y-4 text-sm leading-relaxed text-slate-100 md:text-base">
          {splashLines.map((line, index) => (
            <p key={line}>{splitToChars(line, `line-${index}`, "body")}</p>
          ))}
        </div>

        <div data-cta className={cn("mt-8", !isIntroRevealed && "pointer-events-none")}>
          <Button
            size="lg"
            onClick={() => setPhase("primer")}
            className={amberButtonClass}
          >
            Read Campaign Primer
          </Button>
        </div>
      </div>
    </section>
  );
}
