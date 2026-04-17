"use client";

import { useState } from "react";
import Image from "next/image";
import { Trophy, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Duo } from "@/lib/supabase";

type State = "idle" | "3" | "2" | "1" | "revealed";

interface RevelationClientProps {
  winner: Pick<Duo, "id" | "name" | "image_url" | "vote_count"> | null;
}

export function RevelationClient({ winner }: RevelationClientProps) {
  const [state, setState] = useState<State>("idle");

  const startReveal = () => {
    setState("3");
    setTimeout(() => setState("2"), 1000);
    setTimeout(() => setState("1"), 2000);
    setTimeout(() => setState("revealed"), 3000);
  };

  // ── Idle ──────────────────────────────────────────────────────────────────
  if (state === "idle") {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen px-6 text-center gap-10 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl" style={{ background: "rgba(194,0,0,0.08)" }} />
        </div>

        <div className="relative z-10 flex flex-col items-center gap-8">
          <div className="flex items-center justify-center w-28 h-28 rounded-full border-2" style={{ background: "rgba(194,0,0,0.12)", borderColor: "rgba(194,0,0,0.4)" }}>
            <Trophy size={52} strokeWidth={1.5} style={{ color: "#c20000" }} />
          </div>

          <div className="space-y-2">
            <h1 className="font-laries" style={{ fontSize: "clamp(2.5rem, 12vw, 4rem)", color: "#c20000", textShadow: "0 0 8px #fff, 0 0 20px rgba(255,255,255,0.6)" }}>
              Bal des Twins
            </h1>
            <p className="text-white/50 text-lg">La révélation du gagnant</p>
          </div>

          {!winner || winner.vote_count === 0 ? (
            <p className="text-white/40 text-sm">Aucun vote enregistré pour le moment.</p>
          ) : (
            <Button
              onClick={startReveal}
              size="lg"
              className="h-16 px-10 text-xl font-bold active:scale-95 transition-all duration-150 relative overflow-hidden"
              style={{ background: "#c20000", color: "#fff", boxShadow: "0 8px 32px rgba(194,0,0,0.5)" }}
            >
              Découvrir les twins gagnants
            </Button>
          )}
        </div>
      </main>
    );
  }

  // ── Countdown ─────────────────────────────────────────────────────────────
  if (state === "3" || state === "2" || state === "1") {
    return (
      <main className="flex items-center justify-center min-h-screen bg-[#002c70]">
        <div
          key={state}
          className="flex items-center justify-center"
          style={{ animation: "countdown-pop 0.9s ease forwards" }}
        >
          <span
            className="font-laries select-none"
            style={{
              fontSize: "clamp(12rem, 40vw, 22rem)",
              color: "#c20000",
              textShadow: "0 0 20px #fff, 0 0 60px #fff, 0 0 120px rgba(255,255,255,0.5)",
              lineHeight: 1,
            }}
          >
            {state}
          </span>
        </div>

        <style>{`
          @keyframes countdown-pop {
            0%   { opacity: 0; transform: scale(0.4); }
            20%  { opacity: 1; transform: scale(1.1); }
            40%  { transform: scale(1); }
            75%  { opacity: 1; transform: scale(1); }
            100% { opacity: 0; transform: scale(1.4); }
          }
        `}</style>
      </main>
    );
  }

  // ── Revealed ──────────────────────────────────────────────────────────────
  return (
    <main className="relative flex flex-col items-center justify-end min-h-screen overflow-hidden" style={{ animation: "fade-in 0.8s ease forwards" }}>
      {/* Full-screen photo */}
      {winner?.image_url && (
        <Image
          src={winner.image_url}
          alt={winner.name}
          fill
          className="object-cover"
          sizes="100vw"
          priority
        />
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

      {/* Confetti stars */}
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className="absolute pointer-events-none"
          style={{
            top: `${5 + (i * 7) % 50}%`,
            left: `${(i * 13) % 95}%`,
            animation: `twinkle ${1.5 + (i % 3) * 0.5}s ease-in-out ${i * 0.2}s infinite`,
          }}
        >
          <Star size={10 + (i % 4) * 6} fill="#c20000" style={{ color: "#c20000", opacity: 0.6 }} />
        </div>
      ))}

      {/* Winner info */}
      <div className="relative z-10 w-full px-6 pb-16 pt-8 text-center flex flex-col items-center gap-4">
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold" style={{ background: "#c20000" }}>
          <Trophy size={14} />
          Twins gagnants
        </div>

        <h2
          className="font-laries leading-tight"
          style={{
            fontSize: "clamp(2.5rem, 10vw, 5rem)",
            color: "#fff",
            textShadow: "0 0 12px #c20000, 0 0 40px rgba(194,0,0,0.8)",
          }}
        >
          {winner?.name}
        </h2>

        {winner && (
          <p className="text-white/60 text-sm">
            {winner.vote_count} vote{winner.vote_count > 1 ? "s" : ""}
          </p>
        )}
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50%       { opacity: 0.8; transform: scale(1.3); }
        }
      `}</style>
    </main>
  );
}
