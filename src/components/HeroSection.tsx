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
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(30,10,50,0.5) 0%, rgba(30,10,50,0.7) 60%, hsl(270 60% 10%) 100%)' }} />
      </div>

      {/* Content */}
      <div style={{ background: 'linear-gradient(180deg, hsl(270 60% 10%) 0%, hsl(270 50% 14%) 50%, hsl(330 35% 14%) 100%)' }}>
        <div className="absolute inset-0 opacity-5 pointer-events-none festive-pattern" />
        <div className="relative container mx-auto px-4 py-12 md:py-16 text-center">
          {/* Ornament */}
          <div className="ornament-divider mb-8 max-w-md mx-auto">
            <span style={{ color: 'hsl(330 70% 55%)' }} className="font-display text-xl">✦</span>
            <span style={{ color: 'hsl(32 95% 70%)' }} className="font-display text-sm tracking-widest uppercase">আমন্ত্রণ</span>
            <span style={{ color: 'hsl(170 65% 50%)' }} className="font-display text-xl">✦</span>
          </div>

          <h2 className="font-bengali text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-relaxed" style={{ color: 'hsl(32 95% 70%)' }}>
            এসো মিলি প্রাণের বন্ধনে
          </h2>

          <div className="max-w-2xl mx-auto space-y-4 mb-10">
            <p className="font-bengali text-lg md:text-xl leading-relaxed" style={{ color: 'hsl(270 30% 82%)' }}>
              বছরের পর বছর কেটে গেছে, সময় বদলেছে, জীবন আমাদের ভিন্ন ভিন্ন পথে নিয়ে গেছে, তবু স্কুলের সেই দিনগুলো, সেই নির্ভেজাল হাসি, টিফিনের আড্ডা আর বন্ধুত্বের নির্মল বন্ধন আজও হৃদয়ের গভীরে অমলিন।
            </p>
            <p className="font-bengali text-base md:text-lg leading-relaxed" style={{ color: 'hsl(330 50% 75%)' }}>
              তাই চলুন এই পবিত্র রমজান মাসে আবার এক ছাদের নিচে মিলিত হই, একসাথে ইফতার করি, দোয়ার মাঝে পুরনো দিনের গল্পগুলো নতুন করে জাগিয়ে তুলি।
            </p>
            <p className="font-bengali text-base md:text-lg leading-relaxed" style={{ color: 'hsl(170 40% 72%)' }}>
              সময়কে একটু থামিয়ে, স্মৃতির অ্যালবাম খুলে, বন্ধুত্বকে আবারও আগের মতোই উজ্জ্বল করে তুলি।
            </p>

            {/* Event detail cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 max-w-xl mx-auto">
              {[
                { top: '২৮', bottom: 'রমজান', color: 'hsl(270 55% 50%)' },
                { top: '১৮ মার্চ', bottom: '২০২৬', color: 'hsl(330 70% 50%)' },
                { top: 'খেপুপাড়া', bottom: 'হাই স্কুল', color: 'hsl(170 65% 40%)' },
              ].map((item, i) => (
                <div
                  key={i}
                  className="rounded-xl p-4 border transition-transform hover:scale-105"
                  style={{
                    background: `linear-gradient(135deg, ${item.color}20, ${item.color}10)`,
                    borderColor: `${item.color}50`,
                    boxShadow: `0 4px 20px ${item.color}15`,
                  }}
                >
                  <p className="font-display text-2xl font-bold" style={{ color: 'hsl(32 95% 70%)' }}>{item.top}</p>
                  <p className="font-bengali text-sm" style={{ color: 'hsl(270 30% 78%)' }}>{item.bottom}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Button */}
          <button
            onClick={onJoinClick}
            className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-full font-bengali text-lg font-bold transition-all duration-300 hover:scale-105 active:scale-95"
            style={{
              background: 'linear-gradient(135deg, hsl(330 70% 50%), hsl(270 55% 50%), hsl(32 95% 55%))',
              boxShadow: '0 6px 30px hsl(330 70% 50% / 0.35), 0 4px 15px hsl(270 55% 45% / 0.25)',
              color: '#fff',
            }}
          >
            <span className="text-xl">🌙</span>
            <span>এখনই রেজিস্ট্রেশন করুন</span>
            <span className="text-xl group-hover:translate-x-1 transition-transform">→</span>
          </button>

          <p className="font-bengali text-sm mt-4" style={{ color: 'hsl(270 30% 65%)' }}>
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
