import heroImage from "@/assets/iftar-hero.jpg";
import ShareCard from "@/components/ShareCard";

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
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(10,40,25,0.5) 0%, rgba(10,40,25,0.7) 60%, hsl(158 80% 8%) 100%)' }} />
      </div>

      {/* Content — solid dark emerald, no transparency */}
      <div style={{ background: 'linear-gradient(180deg, hsl(158 80% 8%) 0%, hsl(158 75% 10%) 100%)' }}>
        {/* Subtle geometric pattern overlay */}
        <div className="absolute inset-0 opacity-5 pointer-events-none islamic-pattern" />
        <div className="relative container mx-auto px-4 py-12 md:py-16 text-center">
          {/* Ornament */}
          <div className="ornament-divider mb-8 max-w-md mx-auto">
            <span className="text-gold font-display text-xl">✦</span>
            <span className="text-gold font-display text-sm tracking-widest uppercase">আমন্ত্রণ</span>
            <span className="text-gold font-display text-xl">✦</span>
          </div>

          <h2 className="font-bengali text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-relaxed" style={{ color: 'hsl(44 90% 62%)' }}>
            এসো মিলি প্রাণের বন্ধনে
          </h2>

          <div className="max-w-2xl mx-auto space-y-4 mb-10">
            <p className="font-bengali text-lg md:text-xl leading-relaxed" style={{ color: 'hsl(158 40% 85%)' }}>
              বছরের পর বছর পার হয়ে গেছে, কিন্তু স্কুলের সেই স্মৃতি, সেই বন্ধুত্ব আজও মনে জাগে।
              আসো, পবিত্র রমজান মাসে একসাথে ইফতার করি এবং পুরনো স্মৃতি তাজা করি।
            </p>
            <p className="font-bengali text-base md:text-lg leading-relaxed" style={{ color: 'hsl(44 80% 72%)' }}>
              খেপুপাড়া হাই স্কুলের সকল ব্যাচের প্রাক্তন শিক্ষার্থীরা একত্রিত হবো এক অসাধারণ মুহূর্তে।
              সেই পুরনো বন্ধুত্বের মেলবন্ধন আরও দৃঢ় করতে আমরা আয়োজন করেছি বিশেষ ইফতার মাহফিল।
            </p>

            {/* Event detail cards — solid backgrounds */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 max-w-xl mx-auto">
              {[
                { top: '২৮', bottom: 'রমজান' },
                { top: 'ইফতার', bottom: 'মাহফিল' },
                { top: 'খেপুপাড়া', bottom: 'হাই স্কুল' },
              ].map((item, i) => (
                <div
                  key={i}
                  className="rounded-xl p-4 border"
                  style={{
                    background: 'hsl(158 70% 13%)',
                    borderColor: 'hsl(44 70% 45% / 0.5)',
                  }}
                >
                  <p className="font-display text-2xl font-bold" style={{ color: 'hsl(44 90% 62%)' }}>{item.top}</p>
                  <p className="font-bengali text-sm" style={{ color: 'hsl(158 40% 80%)' }}>{item.bottom}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Button */}
          <button
            onClick={onJoinClick}
            className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-full font-bengali text-lg font-bold transition-all duration-300 hover:scale-105 active:scale-95"
            style={{
              background: 'linear-gradient(135deg, hsl(44 85% 52%), hsl(38 90% 62%))',
              boxShadow: '0 6px 30px hsl(44 80% 52% / 0.45)',
              color: 'hsl(158 70% 10%)',
            }}
          >
            <span className="text-xl">🌙</span>
            <span>এখনই রেজিস্ট্রেশন করুন</span>
            <span className="text-xl group-hover:translate-x-1 transition-transform">→</span>
          </button>

          <p className="font-bengali text-sm mt-4" style={{ color: 'hsl(158 40% 65%)' }}>
            নূন্যতম চাঁদা মাত্র ১০০ টাকা
          </p>

          {/* Share button */}
          <div className="mt-6">
            <ShareCard totalParticipants={0} />
          </div>
        </div>
      </div>
    </section>
  );
}
