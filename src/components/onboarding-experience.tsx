"use client";

import { gsap } from "gsap";
import Image from "next/image";
import { Fragment } from "react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { CharacterCreator } from "@/components/character-creator";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const splashLines = [
  "Yruun is an old world built on buried wonders, sacred laws, and things people have learned not to question.",
  "Most people live close to the ground: farming villages, shrine towns, trade roads, guild halls, and border forts where church bells mark the hours and adventurer contracts decide who gets help when trouble comes.",
  "Life in Yruun is deliberately simple. The church calls it the Mercy of Limits: a belief that the world survives because people no longer build things that think for them, move for them, kill for them, or choose for them.",
];

const fadeOutMs = 900;

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
  const [phase, setPhase] = useState<"splash" | "fading" | "creator">("splash");
  const [isIntroRevealed, setIsIntroRevealed] = useState(false);

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
        .to(cta, {
          opacity: 1,
          y: 0,
          duration: 0.45,
          ease: "power2.out",
        }, "+=0.2");
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
    if (phase !== "splash" || isIntroRevealed) {
      return;
    }

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
  }, [phase, isIntroRevealed, revealIntroImmediately]);

  const transitionToCreator = () => {
    if (phase !== "splash") {
      return;
    }

    setPhase("fading");

    window.setTimeout(() => {
      setPhase("creator");
    }, fadeOutMs);
  };

  if (phase === "creator") {
    return <CharacterCreator />;
  }

  return (
    <section
      ref={splashRef}
      onPointerDown={revealIntroImmediately}
      className={cn(
        "relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-5 py-8 md:px-10",
        "transition-all duration-900",
        phase === "fading" && "scale-[1.01] opacity-0"
      )}
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
          <Button size="lg" onClick={transitionToCreator}>
            Begin Character Creation
          </Button>
        </div>
      </div>
    </section>
  );
}
