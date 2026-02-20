import { Facebook } from "lucide-react";
import { Moon } from "lucide-react";

export default function Footer() {
  return (
    <footer className="py-10" style={{ background: 'linear-gradient(135deg, hsl(158 80% 6%) 0%, hsl(158 70% 14%) 50%, hsl(38 65% 14%) 100%)' }}>
      <div className="container mx-auto px-4 text-center">
        {/* Ornament */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="h-px w-16 bg-amber-400/60" />
          <Moon className="w-5 h-5 text-gold" />
          <div className="h-px w-16 bg-amber-400/60" />
        </div>

        <p className="font-bengali text-emerald-100 text-sm mb-4 font-medium">
          খেপুপাড়া হাইস্কুলিয়ান ইফতার ২০২৬ — সকলকে মোবারকবাদ 🌙
        </p>

        <div className="text-amber-300 font-bengali text-sm mb-6 font-medium">
          <p>রমজান কারীম | بارك الله فيكم</p>
        </div>


        <div className="flex items-center justify-center gap-1 text-emerald-200 font-bengali text-sm mb-6">
          <span>কারিগরি সহায়তায় :</span>
          <a
            href="https://www.facebook.com/share/16qsAxToVV/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-amber-300 hover:text-amber-200 font-bold transition-colors bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/30"
          >
            <Facebook className="w-3.5 h-3.5" />
            ইয়াছিন আরাফাত শাওন
          </a>
        </div>

      </div>
    </footer>
  );
}
