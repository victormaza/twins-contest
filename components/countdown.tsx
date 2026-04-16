"use client";

import { useEffect, useState } from "react";

const DEADLINE = new Date("2026-04-17T23:45:00");

function getTimeLeft() {
  const diff = DEADLINE.getTime() - Date.now();
  if (diff <= 0) return null;
  const h = Math.floor(diff / 1000 / 3600);
  const m = Math.floor((diff / 1000 / 60) % 60);
  const s = Math.floor((diff / 1000) % 60);
  return { h, m, s };
}

export function Countdown() {
  const [time, setTime] = useState<{ h: number; m: number; s: number } | null>(null);

  useEffect(() => {
    setTime(getTimeLeft());
    const id = setInterval(() => setTime(getTimeLeft()), 1000);
    return () => clearInterval(id);
  }, []);

  if (time === null) return null; // votes closed or not yet hydrated

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-white/40 text-xs uppercase tracking-widest">
        Fin des votes dans
      </p>
      <div className="flex items-center gap-1">
        {[
          { value: pad(time.h), label: "h" },
          { value: pad(time.m), label: "min" },
          { value: pad(time.s), label: "s" },
        ].map(({ value, label }, i) => (
          <div key={label} className="flex items-center gap-1">
            {i > 0 && <span className="text-white/30 text-lg font-bold mb-2">:</span>}
            <div className="flex flex-col items-center">
              <div
                className="w-12 h-12 flex items-center justify-center rounded-lg text-xl font-bold tabular-nums"
                style={{ background: "rgba(194,0,0,0.15)", border: "1px solid rgba(194,0,0,0.3)", color: "#fff" }}
              >
                {value}
              </div>
              <span className="text-white/30 text-[10px] mt-1">{label}</span>
            </div>
          </div>
        ))}
      </div>
      <p className="text-white/30 text-xs">vendredi 17 avril à 23h45</p>
    </div>
  );
}
