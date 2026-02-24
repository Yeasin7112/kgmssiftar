import { Moon, Star, Settings } from "lucide-react";
import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, hsl(158 80% 8%) 0%, hsl(158 70% 16%) 50%, hsl(38 65% 16%) 100%)' }}>
      {/* Admin link */}
      <div className="absolute top-3 right-4 z-20">
        <Link
          to="/admin"
          className="flex items-center gap-1 text-emerald-300/50 hover:text-amber-300/70 transition-colors text-xs"
        >
          <Settings className="w-3 h-3" />
          <span className="hidden sm:inline font-bengali-sans">Admin</span>
        </Link>
      </div>

      {/* Decorative stars */}
      <div className="absolute inset-0 pointer-events-none">
        <Star className="absolute top-6 left-8 w-3 h-3 text-gold opacity-60 animate-float" style={{ animationDelay: '0s' }} />
        <Star className="absolute top-12 right-16 w-2 h-2 text-gold opacity-40 animate-float" style={{ animationDelay: '1s' }} />
        <Star className="absolute bottom-8 left-1/4 w-2 h-2 text-gold opacity-50 animate-float" style={{ animationDelay: '2s' }} />
        <Star className="absolute top-8 right-1/3 w-3 h-3 text-gold opacity-30 animate-float" style={{ animationDelay: '1.5s' }} />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 md:py-12 text-center">
        {/* Top ornament */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="h-px w-16 md:w-24 bg-gradient-to-r from-transparent to-amber-400 opacity-70" />
          <Moon className="w-6 h-6 text-gold animate-float" style={{ animationDelay: '0.5s' }} />
          <div className="h-px w-16 md:w-24 bg-gradient-to-l from-transparent to-amber-400 opacity-70" />
        </div>

        {/* Bismillah */}
        <p className="text-gold-light font-bengali text-sm md:text-base mb-3 opacity-90 tracking-wider">
          ﷽ বিসমিল্লাহির রাহমানির রাহিম ﷽
        </p>

        {/* Main Title */}
        <h1 className="font-bengali text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-3"
            style={{ color: 'hsl(44, 85%, 65%)' }}>
          খেপুপাড়া হাইস্কুলিয়ান
        </h1>
        <h1 className="font-bengali text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-tight mb-4 animate-shimmer">
          ইফতার ২০২৬
        </h1>

        {/* Badge */}
        <div
          className="inline-flex items-center gap-2.5 rounded-full px-7 py-2.5 mb-6 border-2"
          style={{
            background: 'linear-gradient(135deg, hsl(158 60% 18%), hsl(158 50% 22%), hsl(44 40% 22%))',
            borderColor: 'hsl(44 80% 50% / 0.6)',
            boxShadow: '0 0 20px hsl(44 80% 50% / 0.2), inset 0 1px 0 hsl(44 80% 70% / 0.15)',
          }}
        >
          <span className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ background: 'hsl(44 90% 55%)' }} />
          <span className="font-bengali text-base md:text-lg font-bold tracking-wide" style={{ color: 'hsl(44 95% 72%)' }}>
            ২৮শে রমজান · ১৮ই মার্চ ২০২৬
          </span>
        </div>

        {/* School name subtitle */}
        <p className="text-emerald-200 font-bengali text-base md:text-lg opacity-80">
          খেপুপাড়া সরকারি মডেল মাধ্যমিক বিদ্যালয় — প্রাক্তন শিক্ষার্থীদের মহামিলন
        </p>

        {/* Bottom ornament */}
        <div className="flex items-center justify-center gap-3 mt-6">
          <div className="h-px w-16 md:w-24 bg-gradient-to-r from-transparent to-amber-400 opacity-50" />
          <span className="text-amber-400 text-lg">✦</span>
          <div className="h-px w-16 md:w-24 bg-gradient-to-l from-transparent to-amber-400 opacity-50" />
        </div>
      </div>
    </header>
  );
}
