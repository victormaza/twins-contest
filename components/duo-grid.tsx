"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { Check } from "lucide-react";
import type { Duo } from "@/lib/supabase";
import { DuoModal } from "./duo-modal";

interface DuoGridProps {
  duos: Duo[];
  votedDuoId: string | null;
  hasVoted: boolean;
  onVote: (duo: Duo) => void;
  onChangeVote: (duo: Duo) => void;
}

export function DuoGrid({ duos, votedDuoId, hasVoted, onVote, onChangeVote }: DuoGridProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const handleOpenDuo = useCallback((index: number) => {
    setSelectedIndex(index);
  }, []);

  const handleClose = useCallback(() => {
    setSelectedIndex(null);
  }, []);

  const handleNavigate = useCallback(
    (direction: "prev" | "next") => {
      if (selectedIndex === null) return;
      if (direction === "prev") {
        setSelectedIndex((prev) =>
          prev === null ? null : prev === 0 ? duos.length - 1 : prev - 1
        );
      } else {
        setSelectedIndex((prev) =>
          prev === null ? null : prev === duos.length - 1 ? 0 : prev + 1
        );
      }
    },
    [selectedIndex, duos.length]
  );

  return (
    <>
      <div className="grid grid-cols-2 gap-3 px-4 pb-8">
        {duos.map((duo, index) => {
          const isVoted = duo.id === votedDuoId;
          return (
            <button
              key={duo.id}
              onClick={() => handleOpenDuo(index)}
              className="duo-card relative aspect-square rounded-xl overflow-hidden border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#c20000] focus:ring-offset-2 focus:ring-offset-[#002c70]"
              aria-label={`Voir ${duo.name}`}
            >
              {/* Image */}
              <Image
                src={duo.image_url}
                alt={duo.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 200px"
              />

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

              {/* Name */}
              <div className="absolute bottom-0 left-0 right-0 p-2">
                <p className="text-white text-sm font-semibold leading-tight line-clamp-2">
                  {duo.name}
                </p>
              </div>

              {/* Voted badge */}
              {isVoted && (
                <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold voted-pulse"
                  style={{
                    background: "#c20000",
                    color: "#ffffff",
                  }}
                >
                  <Check size={10} strokeWidth={3} />
                  Voté
                </div>
              )}

              {/* Has voted overlay — dim non-voted cards */}
              {hasVoted && !isVoted && (
                <div className="absolute inset-0 bg-black/50" />
              )}
            </button>
          );
        })}
      </div>

      {selectedIndex !== null && (
        <DuoModal
          duo={duos[selectedIndex]}
          duos={duos}
          currentIndex={selectedIndex}
          votedDuoId={votedDuoId}
          hasVoted={hasVoted}
          onClose={handleClose}
          onNavigate={handleNavigate}
          onVote={onVote}
          onChangeVote={onChangeVote}
        />
      )}
    </>
  );
}
