import { useState, useEffect } from "react";

const EVENT_DATE = new Date("2026-03-18T18:00:00");

function pad(n: number) {
  return String(n).padStart(2, "0");
}

const boxColors = [
  { bg: 'hsl(270 55% 18%)', border: 'hsl(270 55% 45% / 0.6)', glow: 'hsl(270 55% 45% / 0.2)', text: 'hsl(270 60% 75%)' },
  { bg: 'hsl(330 40% 18%)', border: 'hsl(330 70% 50% / 0.6)', glow: 'hsl(330 70% 50% / 0.2)', text: 'hsl(330 60% 75%)' },
  { bg: 'hsl(170 45% 16%)', border: 'hsl(170 65% 45% / 0.6)', glow: 'hsl(170 65% 45% / 0.2)', text: 'hsl(170 55% 70%)' },
  { bg: 'hsl(32 50% 18%)', border: 'hsl(32 95% 55% / 0.6)', glow: 'hsl(32 95% 55% / 0.2)', text: 'hsl(32 80% 72%)' },
];

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
      <div className="py-8 text-center" style={{ background: 'linear-gradient(135deg, hsl(270 50% 12%), hsl(330 40% 14%))' }}>
        <p className="font-bengali text-2xl font-bold" style={{ color: "hsl(32 95% 68%)" }}>
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
      className="py-12 relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, hsl(270 55% 10%) 0%, hsl(330 40% 14%) 40%, hsl(32 45% 14%) 70%, hsl(170 45% 12%) 100%)" }}
    >
      {/* Subtle pattern */}
      <div className="absolute inset-0 festive-pattern opacity-30 pointer-events-none" />

      <div className="relative container mx-auto px-4 text-center">
        {/* Header */}
        <div className="mb-8">
          <p className="font-bengali text-sm font-medium tracking-widest uppercase mb-3" style={{ color: "hsl(330 60% 65%)" }}>
            ✦ কাউন্টডাউন ✦
          </p>
          <h2 className="font-bengali text-2xl md:text-3xl font-bold mb-1" style={{ color: "hsl(32 95% 72%)" }}>
            ইফতার মাহফিল শুরু হতে আর
          </h2>
          <p className="font-bengali text-base" style={{ color: "hsl(270 30% 72%)" }}>
            ২৮শে রমজান · ১৮ই মার্চ ২০২৬ · ইফতারের সময়
          </p>
        </div>

        {/* Countdown boxes */}
        <div className="flex items-center justify-center gap-3 sm:gap-5 mb-6 flex-wrap">
          {units.map((unit, i) => (
            <div key={unit.label} className="flex items-center gap-3 sm:gap-5">
              <div
                className="w-20 sm:w-24 rounded-2xl p-4 text-center border transition-transform hover:scale-105"
                style={{
                  background: boxColors[i].bg,
                  borderColor: boxColors[i].border,
                  boxShadow: `0 0 24px ${boxColors[i].glow}`,
                }}
              >
                <p
                  className="font-display text-3xl sm:text-4xl font-black tabular-nums"
                  style={{ color: boxColors[i].text }}
                >
                  {pad(unit.value)}
                </p>
                <p className="font-bengali text-xs mt-1" style={{ color: `${boxColors[i].text}90` }}>
                  {unit.label}
                </p>
              </div>
              {i < units.length - 1 && (
                <span className="font-display text-2xl font-bold animate-pulse" style={{ color: "hsl(330 70% 55%)" }}>:</span>
              )}
            </div>
          ))}
        </div>

        {/* Event info chips */}
        <div className="flex items-center justify-center gap-3 flex-wrap">
          {[
            { icon: '📅', text: '১৮ই মার্চ ২০২৬', color: 'hsl(270 55% 50%)' },
            { icon: '🌙', text: '২৮শে রমজান', color: 'hsl(330 70% 50%)' },
            { icon: '📍', text: 'খেপুপাড়া হাই স্কুল', color: 'hsl(170 65% 42%)' },
          ].map((chip, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bengali border"
              style={{ background: `${chip.color}15`, borderColor: `${chip.color}40`, color: `${chip.color}` }}
            >
              {chip.icon} {chip.text}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
