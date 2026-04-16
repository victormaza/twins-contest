"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { Trophy, Star } from "lucide-react";
import { supabase, type Duo } from "@/lib/supabase";
import { DuoGrid } from "@/components/duo-grid";

const VOTER_TOKEN_KEY = "twins_voter_token";
const VOTED_DUO_KEY = "twins_voted_duo";

interface VotePageClientProps {
  duos: Duo[];
}

export function VotePageClient({ duos }: VotePageClientProps) {
  const router = useRouter();
  const [votedDuoId, setVotedDuoId] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [isVoting, setIsVoting] = useState(false);

  // Check localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem(VOTER_TOKEN_KEY);
    const savedDuoId = localStorage.getItem(VOTED_DUO_KEY);
    if (token && savedDuoId) {
      setHasVoted(true);
      setVotedDuoId(savedDuoId);
    }
  }, []);

  const handleVote = async (duo: Duo) => {
    if (isVoting) return;

    setIsVoting(true);

    try {
      // Generate voter token
      let token = localStorage.getItem(VOTER_TOKEN_KEY);
      if (!token) {
        token = uuidv4();
      }

      // Insert vote into Supabase
      const { error } = await supabase.from("votes").insert({
        duo_id: duo.id,
        voter_token: token,
      });

      if (error) {
        if (error.code === "23505") {
          // Unique constraint — already voted
          const savedDuoId = localStorage.getItem(VOTED_DUO_KEY);
          setHasVoted(true);
          setVotedDuoId(savedDuoId);
          return;
        }
        throw error;
      }

      // Also increment vote_count on duos table
      await supabase.rpc("increment_vote_count", { duo_id: duo.id });

      // Save to localStorage
      localStorage.setItem(VOTER_TOKEN_KEY, token);
      localStorage.setItem(VOTED_DUO_KEY, duo.id);
      localStorage.setItem("twins_voted_duo_name", duo.name);
      localStorage.setItem("twins_voted_duo_image", duo.image_url);

      setHasVoted(true);
      setVotedDuoId(duo.id);

      // Redirect to merci page
      router.push("/merci");
    } catch (err) {
      console.error("Vote error:", err);
      alert("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setIsVoting(false);
    }
  };

  const handleChangeVote = async (duo: Duo) => {
    if (isVoting) return;
    setIsVoting(true);

    try {
      const token = localStorage.getItem(VOTER_TOKEN_KEY);
      if (!token) return;

      const res = await fetch("/api/vote/change", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voter_token: token, new_duo_id: duo.id }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Erreur inconnue");

      // Update localStorage
      localStorage.setItem(VOTED_DUO_KEY, duo.id);
      localStorage.setItem("twins_voted_duo_name", duo.name);
      localStorage.setItem("twins_voted_duo_image", duo.image_url);

      setVotedDuoId(duo.id);

      router.push("/merci");
    } catch (err) {
      console.error("Change vote error:", err);
      alert("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 px-4 py-3 flex items-center justify-between"
        style={{ background: "rgba(0,44,112,0.95)", backdropFilter: "blur(12px)", borderBottom: "1px solid oklch(1 0 0 / 0.08)" }}
      >
        <div className="flex items-center gap-2">
          <Trophy style={{ color: "#c20000" }} size={18} strokeWidth={1.5} />
          <span
            className="font-laries"
            style={{
              fontSize: "1.4rem",
              color: "#c20000",
              textShadow: "0 0 6px #fff, 0 0 16px rgba(255,255,255,0.6)",
            }}
          >
            Bal des Twins
          </span>
        </div>
        {hasVoted ? (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
            style={{ background: "rgba(194,0,0,0.15)", color: "#c20000", border: "1px solid rgba(194,0,0,0.3)" }}
          >
            <Star size={10} fill="currentColor" />
            Vote enregistré
          </div>
        ) : (
          <p className="text-white/40 text-xs">Choisissez un duo</p>
        )}
      </header>

      {/* Subtitle */}
      <div className="px-4 pt-5 pb-3">
        <h1 className="text-white font-semibold text-lg">
          {hasVoted ? "Résultats en cours…" : "Votez pour votre duo préféré"}
        </h1>
        <p className="text-white/40 text-sm mt-0.5">
          {hasVoted
            ? "Merci pour votre participation !"
            : `${duos.length} duos participent ce soir`}
        </p>
      </div>

      {/* Grid */}
      {duos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center gap-4">
          <div className="text-4xl">🎭</div>
          <p className="text-white/50">Les duos arrivent bientôt…</p>
        </div>
      ) : (
        <DuoGrid
          duos={duos}
          votedDuoId={votedDuoId}
          hasVoted={hasVoted}
          onVote={handleVote}
          onChangeVote={handleChangeVote}
        />
      )}
    </div>
  );
}
