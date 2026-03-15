import { Moon, Star, Settings, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, hsl(270 60% 10%) 0%, hsl(270 50% 20%) 25%, hsl(330 40% 18%) 50%, hsl(32 50% 16%) 75%, hsl(170 50% 14%) 100%)' }}>
      {/* Admin link */}
      <div className="absolute top-3 right-4 z-20">
        <Link
          to="/admin"
          className="flex items-center gap-1 text-purple-300/50 hover:text-amber-300/70 transition-colors text-xs"
        >
          <Settings className="w-3 h-3" />
          <span className="hidden sm:inline font-bengali-sans">Admin</span>
        </Link>
      </div>

      {/* Decorative floating lanterns/stars */}
      <div className="absolute inset-0 pointer-events-none">
        <span className="absolute top-6 left-8 text-lg opacity-50 animate-lantern" style={{ animationDelay: '0s' }}>🏮</span>
        <Star className="absolute top-12 right-16 w-3 h-3 opacity-40 animate-float" style={{ animationDelay: '1s', color: 'hsl(330 70% 60%)' }} />
        <span className="absolute bottom-8 left-1/4 text-sm opacity-40 animate-lantern" style={{ animationDelay: '2s' }}>🏮</span>
        <Star className="absolute top-8 right-1/3 w-3 h-3 opacity-30 animate-float" style={{ animationDelay: '1.5s', color: 'hsl(170 65% 50%)' }} />
        <Sparkles className="absolute bottom-12 right-1/4 w-3 h-3 opacity-35 animate-float" style={{ animationDelay: '0.8s', color: 'hsl(32 95% 65%)' }} />
        <Star className="absolute top-16 left-1/3 w-2 h-2 opacity-25 animate-float" style={{ animationDelay: '2.5s', color: 'hsl(200 80% 65%)' }} />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 md:py-12 text-center">
        {/* Top ornament */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="h-px w-16 md:w-24" style={{ background: 'linear-gradient(to right, transparent, hsl(330 70% 55%))' }} />
          <Moon className="w-6 h-6 animate-float" style={{ animationDelay: '0.5s', color: 'hsl(32 95% 65%)' }} />
          <div className="h-px w-16 md:w-24" style={{ background: 'linear-gradient(to left, transparent, hsl(270 55% 55%))' }} />
        </div>

        {/* Bismillah */}
        <p className="font-bengali text-sm md:text-base mb-3 opacity-90 tracking-wider" style={{ color: 'hsl(32 90% 75%)' }}>
          ﷽ বিসমিল্লাহির রাহমানির রাহিম ﷽
        </p>

        {/* Main Title */}
        <h1 className="font-bengali text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-3"
            style={{ color: 'hsl(32 95% 72%)' }}>
          খেপুপাড়া হাইস্কুলিয়ান
        </h1>
        <h1 className="font-bengali text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-tight mb-4 animate-shimmer">
          ইফতার ২০২৬
        </h1>

        {/* Badge */}
        <div
          className="inline-flex items-center gap-2.5 rounded-full px-7 py-2.5 mb-6 border-2"
          style={{
            background: 'linear-gradient(135deg, hsl(270 50% 20%), hsl(330 40% 22%), hsl(32 45% 20%))',
            borderColor: 'hsl(32 90% 55% / 0.6)',
            boxShadow: '0 0 25px hsl(330 70% 50% / 0.2), 0 0 15px hsl(32 95% 55% / 0.15), inset 0 1px 0 hsl(270 60% 60% / 0.15)',
          }}
        >
          <span className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ background: 'linear-gradient(135deg, hsl(330 70% 55%), hsl(32 95% 60%))' }} />
          <span className="font-bengali text-base md:text-lg font-bold tracking-wide" style={{ color: 'hsl(32 95% 75%)' }}>
            ২৮শে রমজান · ১৮ই মার্চ ২০২৬
          </span>
        </div>

        {/* School name subtitle */}
        <p className="font-bengali text-base md:text-lg opacity-80" style={{ color: 'hsl(200 60% 80%)' }}>
          খেপুপাড়া সরকারি মডেল মাধ্যমিক বিদ্যালয় — প্রাক্তন শিক্ষার্থীদের মহামিলন
        </p>

        {/* Bottom ornament */}
        <div className="flex items-center justify-center gap-3 mt-6">
          <div className="h-px w-16 md:w-24" style={{ background: 'linear-gradient(to right, transparent, hsl(170 65% 45%))' }} />
          <span style={{ color: 'hsl(330 70% 55%)' }} className="text-lg">✦</span>
          <div className="h-px w-16 md:w-24" style={{ background: 'linear-gradient(to left, transparent, hsl(32 95% 55%))' }} />
        </div>
      </div>
    </header>
  );
}
