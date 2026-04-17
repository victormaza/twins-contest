"use client";

import { useState } from "react";
import Image from "next/image";
import { Trophy, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Duo } from "@/lib/supabase";

type State = "idle" | "5" | "4" | "3" | "2" | "1" | "revealed";

interface RevelationClientProps {
  winner: Pick<Duo, "id" | "name" | "image_url" | "vote_count"> | null;
}

export function RevelationClient({ winner }: RevelationClientProps) {
  const [state, setState] = useState<State>("idle");

  const startReveal = () => {
    setState("5");
    setTimeout(() => setState("4"), 1000);
    setTimeout(() => setState("3"), 2000);
    setTimeout(() => setState("2"), 3000);
    setTimeout(() => setState("1"), 4000);
    setTimeout(() => setState("revealed"), 5000);
  };

  // ── Idle ──────────────────────────────────────────────────────────────────
  if (state === "idle") {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen px-6 text-center gap-10 relative overflow-hidden">
        {/* Curtain background */}
        <Image src="/bg-curtain.png" alt="" fill className="object-cover" sizes="100vw" priority />
        <div className="absolute inset-0 bg-black/30" />

        <div className="relative z-10 flex flex-col items-center gap-8">
          {!winner || winner.vote_count === 0 ? (
            <p className="text-white/70 text-lg font-semibold">Aucun vote enregistré pour le moment.</p>
          ) : (
            <Button
              onClick={startReveal}
              size="lg"
              className="h-auto py-6 px-12 font-sans active:scale-95 transition-all duration-150 relative overflow-hidden leading-tight"
              style={{
                fontSize: "clamp(1.6rem, 5vw, 2.6rem)",
                background: "#c20000",
                color: "#fff",
                boxShadow: "0 8px 40px rgba(194,0,0,0.7), 0 0 0 4px #fff",
                textShadow: "0 2px 8px rgba(0,0,0,0.4)",
              }}
            >
              THE BEST DUO<br />OF THE NIGHT IS...
            </Button>
          )}
        </div>
      </main>
    );
  }

  // ── Countdown ─────────────────────────────────────────────────────────────
  if (state === "5" || state === "4" || state === "3" || state === "2" || state === "1") {
    return (
      <main className="relative flex items-center justify-center min-h-screen overflow-hidden">
        <Image src="/bg-curtain.png" alt="" fill className="object-cover" sizes="100vw" priority />
        <div className="absolute inset-0 bg-black/30" />

        <div
          key={state}
          className="relative z-10 flex items-center justify-center"
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
