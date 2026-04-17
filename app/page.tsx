import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Trophy, Star } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Countdown } from "@/components/countdown";

export const revalidate = 60;

export default async function HomePage() {
  const { count } = await supabase
    .from("duos")
    .select("*", { count: "exact", head: true });

  const duoCount = count ?? 0;

  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-6 py-12 text-center relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full blur-3xl"
          style={{ background: "oklch(0.55 0.22 290 / 0.08)" }}
        />
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full blur-3xl"
          style={{ background: "rgba(194,0,0,0.06)" }}
        />
      </div>

      {/* Stars decoration */}
      <div className="absolute top-8 left-8 text-[#c20000] opacity-40">
        <Star size={16} fill="currentColor" />
      </div>
      <div className="absolute top-12 right-12 text-[#c20000] opacity-30">
        <Star size={12} fill="currentColor" />
      </div>
      <div className="absolute bottom-20 left-10 text-[#c20000] opacity-30">
        <Star size={10} fill="currentColor" />
      </div>
      <div className="absolute bottom-32 right-8 text-[#c20000] opacity-40">
        <Star size={14} fill="currentColor" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-8 max-w-sm w-full">
        {/* Trophy icon */}
        <div
          className="flex items-center justify-center w-24 h-24 rounded-full border"
          style={{
            background: "rgba(194,0,0,0.15)",
            borderColor: "rgba(194,0,0,0.3)",
          }}
        >
          <Trophy style={{ color: "#c20000" }} size={44} strokeWidth={1.5} />
        </div>

        {/* Title — Laries font uniquement ici */}
        <div className="space-y-3">
          <h1
            className="font-laries leading-tight"
            style={{
              fontSize: "clamp(3rem, 14vw, 4.5rem)",
              color: "#c20000",
              textShadow: "0 0 8px #fff, 0 0 20px #fff, 0 0 40px rgba(255,255,255,0.6)",
            }}
          >
            Twin Contest
          </h1>
        </div>

        {/* Description */}
        <p className="text-white/60 text-base leading-relaxed">
          Votez pour votre duo préféré&nbsp;!
          <br />
          Un seul vote par personne.
        </p>

        {/* Countdown */}
        <Countdown />

        {/* CTA Button */}
        <Link href="/vote" className="w-full">
          <Button
            size="lg"
            className="w-full h-14 text-lg font-semibold active:scale-95 transition-all duration-150"
            style={{
              background: "#c20000",
              color: "#ffffff",
              boxShadow: "0 8px 24px rgba(194,0,0,0.35)",
            }}
          >
            VOTER !
          </Button>
        </Link>

        {/* Footer note */}
          <p className="text-white/30 text-xs">
          1 seul duo gagnant !
          </p>
      </div>
    </main>
  );
}
