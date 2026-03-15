import { Facebook, Moon } from "lucide-react";

export default function Footer() {
  return (
    <footer className="py-10" style={{ background: 'linear-gradient(135deg, hsl(270 55% 8%) 0%, hsl(270 45% 14%) 25%, hsl(330 35% 14%) 50%, hsl(32 40% 12%) 75%, hsl(170 40% 10%) 100%)' }}>
      <div className="container mx-auto px-4 text-center">
        {/* Ornament */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="h-px w-16" style={{ background: 'linear-gradient(to right, transparent, hsl(330 70% 55%))' }} />
          <Moon className="w-5 h-5" style={{ color: 'hsl(32 95% 65%)' }} />
          <div className="h-px w-16" style={{ background: 'linear-gradient(to left, transparent, hsl(270 55% 55%))' }} />
        </div>

        <p className="font-bengali text-sm mb-4 font-medium" style={{ color: 'hsl(270 30% 80%)' }}>
          খেপুপাড়া হাইস্কুলিয়ান ইফতার ২০২৬ — সকলকে মোবারকবাদ 🌙
        </p>

        <div className="font-bengali text-sm mb-6 font-medium" style={{ color: 'hsl(32 90% 70%)' }}>
          <p>রমজান কারীম | بارك الله فيكم</p>
        </div>

        <div className="flex items-center justify-center gap-1 font-bengali text-sm mb-6" style={{ color: 'hsl(200 60% 78%)' }}>
          <span>কারিগরি সহায়তায় :</span>
          <a
            href="https://www.facebook.com/share/16qsAxToVV/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-bold transition-colors px-2 py-0.5 rounded-full border"
            style={{
              color: 'hsl(330 70% 65%)',
              background: 'hsl(330 70% 50% / 0.1)',
              borderColor: 'hsl(330 70% 50% / 0.3)',
            }}
          >
            <Facebook className="w-3.5 h-3.5" />
            ইয়াছিন আরাফাত শাওন
          </a>
        </div>
      </div>
    </footer>
  );
}
