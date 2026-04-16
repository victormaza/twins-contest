"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { useDrag } from "@use-gesture/react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { Duo } from "@/lib/supabase";

interface DuoModalProps {
  duo: Duo;
  duos: Duo[];
  currentIndex: number;
  votedDuoId: string | null;
  hasVoted: boolean;
  onClose: () => void;
  onNavigate: (direction: "prev" | "next") => void;
  onVote: (duo: Duo) => void;
  onChangeVote: (duo: Duo) => void;
}

export function DuoModal({
  duo,
  currentIndex,
  votedDuoId,
  hasVoted,
  onClose,
  onNavigate,
  onVote,
  onChangeVote,
}: DuoModalProps) {
  const [offsetX, setOffsetX] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const isVoted = duo.id === votedDuoId;

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onNavigate("prev");
      if (e.key === "ArrowRight") onNavigate("next");
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose, onNavigate]);

  // Swipe gesture
  const bind = useDrag(
    ({ active, movement: [mx], direction: [dx], distance: [dist], cancel }) => {
      if (active) {
        setOffsetX(mx);
      } else {
        setOffsetX(0);
        if (dist > 60) {
          if (dx < 0) {
            handleNavigate("next");
          } else {
            handleNavigate("prev");
          }
        }
      }
    },
    { axis: "x", filterTaps: true }
  );

  const handleNavigate = (direction: "prev" | "next") => {
    if (isAnimating) return;
    setIsAnimating(true);
    onNavigate(direction);
    setTimeout(() => setIsAnimating(false), 150);
  };

  const handleConfirmVote = () => {
    onVote(duo);
  };

  const handleConfirmChange = () => {
    onChangeVote(duo);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: "rgba(0,0,0,0.85)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Modal panel */}
      <div
        ref={containerRef}
        className="relative w-full max-w-lg bg-[#001640] rounded-t-3xl overflow-hidden"
        style={{
          maxHeight: "92dvh",
          transform: `translateX(${offsetX * 0.2}px)`,
          transition: offsetX === 0 ? "transform 0.2s ease" : "none",
          touchAction: "none",
        }}
        {...bind()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 flex items-center justify-center w-8 h-8 rounded-full bg-white/10 text-white/70 hover:bg-white/20 transition-colors"
          aria-label="Fermer"
        >
          <X size={16} />
        </button>

        {/* Navigation buttons */}
        <button
          onClick={() => handleNavigate("prev")}
          className="absolute left-3 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-9 h-9 rounded-full bg-black/40 text-white/80 hover:bg-black/60 transition-colors"
          aria-label="Duo précédent"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={() => handleNavigate("next")}
          className="absolute right-3 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-9 h-9 rounded-full bg-black/40 text-white/80 hover:bg-black/60 transition-colors"
          aria-label="Duo suivant"
        >
          <ChevronRight size={20} />
        </button>

        {/* Image */}
        <div className="relative w-full aspect-[4/3]">
          <Image
            src={duo.image_url}
            alt={duo.name}
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
          {/* Voted overlay */}
          {isVoted && (
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ background: "rgba(194,0,0,0.2)" }}
            >
              <div
                className="flex items-center gap-2 px-4 py-2 rounded-full text-lg font-bold"
                style={{
                  background: "#c20000",
                  color: "#ffffff",
                }}
              >
                <Check size={20} strokeWidth={3} />
                Voté !
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="px-6 py-5 space-y-4">
          {/* Name */}
          <div className="space-y-1">
            <p className="text-white/40 text-xs uppercase tracking-widest">
              Duo #{currentIndex + 1}
            </p>
            <h2 className="font-heading text-2xl font-bold text-white leading-tight">
              {duo.name}
            </h2>
          </div>

          {/* Swipe hint */}
          <p className="text-white/30 text-xs text-center">
            ← Swiper pour naviguer →
          </p>

          {/* Vote button */}
          {!hasVoted && (
            <AlertDialog>
              <AlertDialogTrigger
                render={
                  <Button
                    size="lg"
                    className="w-full h-13 text-base font-semibold active:scale-95 transition-all duration-150"
                    style={{
                      background: "#c20000",
                      color: "#ffffff",
                      boxShadow: "0 4px 20px rgba(194,0,0,0.4)",
                    }}
                  >
                    Je vote pour ces twin !
                  </Button>
                }
              />
              <AlertDialogContent
                className="border-white/10 max-w-[340px]"
                style={{ background: "#001640" }}
              >
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-white font-heading text-xl">
                    Confirmer votre vote ?
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-white/60">
                    Vous êtes sur le point de voter pour{" "}
                    <span className="font-semibold text-white">{duo.name}</span>.{" "}
                    <br />
                    <span className="text-xs">Un seul vote autorisé.</span>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="border-white/20 text-white/70 bg-transparent hover:bg-white/10">
                    Annuler
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleConfirmVote}
                    style={{ background: "#c20000", color: "#ffffff" }}
                    className="font-semibold"
                  >
                    Confirmer
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          {hasVoted && isVoted && (
            <p className="text-center text-sm font-semibold py-3" style={{ color: "#c20000" }}>
              ✓ Vous avez voté pour ces twin !
            </p>
          )}

          {hasVoted && !isVoted && (
            <AlertDialog>
              <AlertDialogTrigger
                render={
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full h-13 text-base font-semibold active:scale-95 transition-all duration-150"
                    style={{
                      borderColor: "oklch(0.55 0.22 290 / 0.6)",
                      color: "oklch(0.82 0.18 290)",
                      background: "oklch(0.55 0.22 290 / 0.12)",
                    }}
                  >
                    Changer mon vote pour ces twin
                  </Button>
                }
              />
              <AlertDialogContent
                className="border-white/10 max-w-[340px]"
                style={{ background: "#001640" }}
              >
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-white font-heading text-xl">
                    Changer votre vote ?
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-white/60">
                    Votre vote précédent sera annulé et remplacé par{" "}
                    <span className="font-semibold text-white">{duo.name}</span>.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="border-white/20 text-white/70 bg-transparent hover:bg-white/10">
                    Annuler
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleConfirmChange}
                    style={{ background: "oklch(0.55 0.22 290)", color: "white" }}
                    className="font-semibold"
                  >
                    Confirmer le changement
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>
    </div>
  );
}
