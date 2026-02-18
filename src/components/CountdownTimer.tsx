import { useState, useEffect } from "react";

const EVENT_DATE = new Date("2026-03-18T18:00:00"); // March 18, 2026 — Iftar time

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export default function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: false });

  useEffect(() => {
    const calc = () => {
      const diff = EVENT_DATE.getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: true });
        return;
      }
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
        expired: false,
      });
    };
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, []);

  if (timeLeft.expired) {
    return (
      <div className="py-8 text-center">
        <p className="font-bengali text-2xl font-bold" style={{ color: "hsl(44 90% 62%)" }}>
          🌙 ইফতার মাহফিল শুরু হয়ে গেছে! আলহামদুলিল্লাহ!
        </p>
      </div>
    );
  }

  const units = [
    { label: "দিন", value: timeLeft.days },
    { label: "ঘণ্টা", value: timeLeft.hours },
    { label: "মিনিট", value: timeLeft.minutes },
    { label: "সেকেন্ড", value: timeLeft.seconds },
  ];

  return (
    <section
      className="py-12"
      style={{ background: "linear-gradient(135deg, hsl(158 80% 7%) 0%, hsl(158 72% 12%) 50%, hsl(38 60% 14%) 100%)" }}
    >
      <div className="container mx-auto px-4 text-center">
        {/* Header */}
        <div className="mb-8">
          <p className="font-bengali text-sm font-medium tracking-widest uppercase mb-3" style={{ color: "hsl(44 70% 55%)" }}>
            ✦ কাউন্টডাউন ✦
          </p>
          <h2 className="font-bengali text-2xl md:text-3xl font-bold mb-1" style={{ color: "hsl(44 90% 68%)" }}>
            ইফতার মাহফিল শুরু হতে আর
          </h2>
          <p className="font-bengali text-base" style={{ color: "hsl(158 40% 72%)" }}>
            ২৮শে রমজান · ১৮ই মার্চ ২০২৬ · ইফতারের সময়
          </p>
        </div>

        {/* Countdown boxes */}
        <div className="flex items-center justify-center gap-3 sm:gap-5 mb-6 flex-wrap">
          {units.map((unit, i) => (
            <div key={unit.label} className="flex items-center gap-3 sm:gap-5">
              <div
                className="w-20 sm:w-24 rounded-2xl p-4 text-center border"
                style={{
                  background: "hsl(158 65% 11%)",
                  borderColor: "hsl(44 65% 40% / 0.5)",
                  boxShadow: "0 0 24px hsl(44 80% 45% / 0.15)",
                }}
              >
                <p
                  className="font-display text-3xl sm:text-4xl font-black tabular-nums"
                  style={{ color: "hsl(44 90% 65%)" }}
                >
                  {pad(unit.value)}
                </p>
                <p className="font-bengali text-xs mt-1" style={{ color: "hsl(158 35% 65%)" }}>
                  {unit.label}
                </p>
              </div>
              {i < units.length - 1 && (
                <span className="font-display text-2xl font-bold animate-pulse" style={{ color: "hsl(44 80% 55%)" }}>:</span>
              )}
            </div>
          ))}
        </div>

        {/* Event info chips */}
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <span
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bengali border"
            style={{ background: "hsl(158 60% 14%)", borderColor: "hsl(44 60% 38% / 0.5)", color: "hsl(44 80% 72%)" }}
          >
            📅 ১৮ই মার্চ ২০২৬
          </span>
          <span
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bengali border"
            style={{ background: "hsl(158 60% 14%)", borderColor: "hsl(44 60% 38% / 0.5)", color: "hsl(44 80% 72%)" }}
          >
            🌙 ২৮শে রমজান
          </span>
          <span
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bengali border"
            style={{ background: "hsl(158 60% 14%)", borderColor: "hsl(44 60% 38% / 0.5)", color: "hsl(44 80% 72%)" }}
          >
            📍 খেপুপাড়া হাই স্কুল
          </span>
        </div>
      </div>
    </section>
  );
}
