import heroImage from "@/assets/iftar-hero.jpg";

interface HeroSectionProps {
  onJoinClick: () => void;
}

export default function HeroSection({ onJoinClick }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden">
      {/* Hero Image */}
      <div className="relative h-72 md:h-96 lg:h-[480px]">
        <img
          src={heroImage}
          alt="Iftar Event"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-emerald-900/80" />
      </div>

      {/* Content overlay at bottom */}
      <div className="relative bg-gradient-to-b from-emerald-900 to-emerald-950 islamic-pattern">
        <div className="container mx-auto px-4 py-12 md:py-16 text-center">
          {/* Ornament */}
          <div className="ornament-divider mb-8 max-w-md mx-auto">
            <span className="text-gold font-display text-xl">✦</span>
            <span className="text-gold font-display text-sm tracking-widest uppercase">আমন্ত্রণ</span>
            <span className="text-gold font-display text-xl">✦</span>
          </div>

          <h2 className="font-bengali text-3xl md:text-4xl lg:text-5xl font-bold text-amber-300 mb-6 leading-relaxed">
            এসো মিলি প্রাণের বন্ধনে
          </h2>

          <div className="max-w-2xl mx-auto space-y-4 mb-10">
            <p className="font-bengali text-emerald-100 text-lg md:text-xl leading-relaxed">
              বছরের পর বছর পার হয়ে গেছে, কিন্তু স্কুলের সেই স্মৃতি, সেই বন্ধুত্ব আজও মনে জাগে।
              আসো, পবিত্র রমজান মাসে একসাথে ইফতার করি এবং পুরনো স্মৃতি তাজা করি।
            </p>
            <p className="font-bengali text-amber-200 text-base md:text-lg leading-relaxed">
              খেপুপাড়া হাই স্কুলের সকল ব্যাচের প্রাক্তন শিক্ষার্থীরা একত্রিত হবো এক অসাধারণ মুহূর্তে।
              সেই পুরনো বন্ধুত্বের মেলবন্ধন আরও দৃঢ় করতে আমরা আয়োজন করেছি বিশেষ ইফতার মাহফিল।
            </p>

            {/* Event details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 max-w-xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm border border-amber-400/30 rounded-xl p-4">
                <p className="text-amber-300 font-display text-2xl font-bold">২৮</p>
                <p className="text-emerald-200 font-bengali text-sm">রমজান</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm border border-amber-400/30 rounded-xl p-4">
                <p className="text-amber-300 font-display text-xl font-bold">ইফতার</p>
                <p className="text-emerald-200 font-bengali text-sm">মাহফিল</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm border border-amber-400/30 rounded-xl p-4">
                <p className="text-amber-300 font-display text-lg font-bold">খেপুপাড়া</p>
                <p className="text-emerald-200 font-bengali text-sm">হাই স্কুল</p>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <button
            onClick={onJoinClick}
            className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-full font-bengali text-lg font-bold text-emerald-900 transition-all duration-300 hover:scale-105 active:scale-95"
            style={{
              background: 'linear-gradient(135deg, hsl(44, 85%, 55%), hsl(38, 90%, 65%))',
              boxShadow: '0 6px 30px hsl(44 80% 52% / 0.5)',
            }}
          >
            <span className="text-xl">🌙</span>
            <span>এখনই রেজিস্ট্রেশন করুন</span>
            <span className="text-xl group-hover:translate-x-1 transition-transform">→</span>
          </button>

          <p className="text-emerald-300 font-bengali text-sm mt-4 opacity-70">
            নূন্যতম চাঁদা মাত্র ১০০ টাকা
          </p>
        </div>
      </div>
    </section>
  );
}
