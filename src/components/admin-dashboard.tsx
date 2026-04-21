"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type CharacterSummary = {
  id: string;
  name: string;
  archetype: string;
  race: string | null;
  gender: "male" | "female";
  createdAt: string;
  pendingUpgradeCount: number;
};

export function AdminDashboard() {
  const [characters, setCharacters] = useState<CharacterSummary[]>([]);
  const [characterId, setCharacterId] = useState<string>("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [optionsText, setOptionsText] = useState("+1 Body\n+1 Mind");
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const loadCharacters = useCallback(async () => {
    setLoading(true);
    const response = await fetch("/api/characters", { cache: "no-store" });
    if (!response.ok) {
      setLoading(false);
      return;
    }
    const data = (await response.json()) as CharacterSummary[];
    setCharacters(data);
    setCharacterId((current) => current || data[0]?.id || "");
    setLoading(false);
  }, []);

  useEffect(() => {
    const initial = window.setTimeout(() => {
      void loadCharacters();
    }, 0);

    const interval = window.setInterval(() => {
      void loadCharacters();
    }, 6000);

    return () => {
      window.clearTimeout(initial);
      window.clearInterval(interval);
    };
  }, [loadCharacters]);

  const selectedCharacter = useMemo(
    () => characters.find((character) => character.id === characterId) ?? null,
    [characters, characterId]
  );

  const sendUpgrade = async () => {
    const options = optionsText
      .split("\n")
      .map((option) => option.trim())
      .filter(Boolean);

    const response = await fetch("/api/admin/upgrades", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        characterId,
        title,
        description,
        options,
      }),
    });

    if (!response.ok) {
      const payload = (await response.json()) as { error?: string };
      setStatusMessage(payload.error ?? "Failed to send upgrade prompt.");
      return;
    }

    setStatusMessage("Upgrade prompt sent.");
    setTitle("");
    setDescription("");
    setOptionsText("+1 Body\n+1 Mind");
    void loadCharacters();
  };

  return (
    <main className="min-h-screen bg-background px-4 py-6 md:px-8 md:py-10">
      <div className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-3xl">Admin Console</CardTitle>
            <CardDescription>Monitor created characters and pending upgrades.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? <p className="text-sm text-muted-foreground">Loading characters...</p> : null}
            {!loading && characters.length === 0 ? (
              <p className="text-sm text-muted-foreground">No characters created yet.</p>
            ) : null}
            {characters.map((character) => (
              <div key={character.id} className="rounded-lg border p-3">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <div>
                    <p className="font-medium">{character.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {character.gender}, {character.race ?? "race not chosen"}, {character.archetype}
                    </p>
                  </div>
                  <Badge variant={character.pendingUpgradeCount > 0 ? "secondary" : "outline"}>
                    {character.pendingUpgradeCount} pending
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">ID: {character.id}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-heading">Send Upgrade Prompt</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5">
              <Label>Character</Label>
              <Select value={characterId} onValueChange={(value) => setCharacterId(value ?? "") }>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a character" />
                </SelectTrigger>
                <SelectContent>
                  {characters.map((character) => (
                    <SelectItem key={character.id} value={character.id}>
                      {character.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedCharacter ? (
              <p className="text-xs text-muted-foreground">Target: {selectedCharacter.name}</p>
            ) : null}

            <div className="space-y-1.5">
              <Label>Title</Label>
              <Input value={title} onChange={(event) => setTitle(event.target.value)} />
            </div>

            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea value={description} onChange={(event) => setDescription(event.target.value)} />
            </div>

            <div className="space-y-1.5">
              <Label>Options (one per line)</Label>
              <Textarea value={optionsText} onChange={(event) => setOptionsText(event.target.value)} />
            </div>

            <Button type="button" className="w-full" onClick={sendUpgrade} disabled={!characterId}>
              Send Prompt
            </Button>

            {statusMessage ? <p className="text-xs text-muted-foreground">{statusMessage}</p> : null}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
