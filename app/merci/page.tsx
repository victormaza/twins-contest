"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Trophy, Star, Check, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const STARS = Array.from({ length: 8 }, (_, i) => ({
  top: `${10 + ((i * 37 + 13) % 80)}%`,
  left: `${5 + ((i * 53 + 7) % 90)}%`,
  opacity: 0.2 + ((i * 17 + 3) % 30) / 100,
}));

export default function MerciPage() {
  const router = useRouter();
  const [duoName, setDuoName] = useState<string | null>(null);
  const [duoImage, setDuoImage] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("twins_voter_token");
    if (!token) {
      // Not voted — redirect to vote page
      router.replace("/vote");
      return;
    }
    setDuoName(localStorage.getItem("twins_voted_duo_name"));
    setDuoImage(localStorage.getItem("twins_voted_duo_image"));
  }, [router]);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-6 py-12 text-center relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full blur-3xl"
          style={{ background: "oklch(0.55 0.22 290 / 0.1)" }}
        />
        <div
          className="absolute bottom-1/3 left-1/2 -translate-x-1/2 w-[300px] h-[300px] rounded-full blur-3xl"
          style={{ background: "rgba(194,0,0,0.08)" }}
        />
      </div>

      {/* Confetti stars */}
      {STARS.map((s, i) => (
        <div
          key={i}
          className="absolute"
          style={{ top: s.top, left: s.left, opacity: s.opacity }}
        >
          <Star
            style={{ color: "#c20000" }}
            size={8 + (i % 3) * 4}
            fill="currentColor"
          />
        </div>
      ))}

      <div className="relative z-10 flex flex-col items-center gap-6 max-w-sm w-full">
        {/* Success icon */}
        <div
          className="flex items-center justify-center w-20 h-20 rounded-full border-2"
          style={{
            background: "rgba(194,0,0,0.15)",
            borderColor: "rgba(194,0,0,0.5)",
          }}
        >
          <Check
            style={{ color: "#c20000" }}
            size={36}
            strokeWidth={2.5}
          />
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="font-heading text-4xl font-black text-gold-gradient">
            Merci pour
            <br />
            votre vote&nbsp;!
          </h1>
          <div className="flex items-center gap-2 justify-center">
            <div
              className="h-px w-6"
              style={{ background: "rgba(194,0,0,0.4)" }}
            />
            <Trophy
              style={{ color: "#c20000" }}
              size={12}
              fill="currentColor"
              strokeWidth={0}
            />
            <div
              className="h-px w-6"
              style={{ background: "rgba(194,0,0,0.4)" }}
            />
          </div>
        </div>

        {/* Voted duo card */}
        {duoName && (
          <div
            className="w-full rounded-2xl overflow-hidden border"
            style={{
              background: "#001d4a",
              borderColor: "rgba(194,0,0,0.25)",
            }}
          >
            {duoImage && (
              <div className="relative w-full aspect-video">
                <Image
                  src={duoImage}
                  alt={duoName}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, 384px"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
            )}
            <div className="px-4 py-3 flex items-center gap-3">
              <div
                className="flex items-center justify-center w-8 h-8 rounded-full flex-shrink-0"
                style={{ background: "rgba(194,0,0,0.2)" }}
              >
                <Check
                  style={{ color: "#c20000" }}
                  size={14}
                  strokeWidth={3}
                />
              </div>
              <div className="text-left">
                <p className="text-white/50 text-xs">Votre vote</p>
                <p className="text-white font-semibold text-sm">{duoName}</p>
              </div>
            </div>
          </div>
        )}

        {/* Message */}
        <p className="text-white/50 text-sm leading-relaxed">
          Les votes sont en cours. Le duo gagnant sera annoncé en fin de soirée.
          Profitez du spectacle&nbsp;!&nbsp;🎭
        </p>

        {/* Back button */}
        <Link href="/vote" className="w-full">
          <Button
            variant="outline"
            className="w-full border-white/20 text-white/60 bg-transparent hover:bg-white/5"
          >
            <ArrowLeft size={16} />
            Voir tous les duos
          </Button>
        </Link>
      </div>
    </main>
  );
}
