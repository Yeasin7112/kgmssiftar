import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Trophy } from "lucide-react";

interface Donor {
  id: string;
  name: string;
  ssc_batch: number;
  photo_url?: string;
  payment_amount: number;
}

const podiumStyles = [
  { bg: 'linear-gradient(135deg, hsl(32 90% 55%), hsl(44 95% 60%))', border: 'hsl(32 95% 55%)', glow: '0 8px 30px hsl(32 95% 55% / 0.35)', textColor: '#fff' },
  { bg: 'linear-gradient(135deg, hsl(270 40% 65%), hsl(270 50% 75%))', border: 'hsl(270 50% 65%)', glow: '0 6px 20px hsl(270 50% 65% / 0.25)', textColor: '#fff' },
  { bg: 'linear-gradient(135deg, hsl(330 55% 55%), hsl(330 65% 65%))', border: 'hsl(330 60% 55%)', glow: '0 6px 20px hsl(330 60% 55% / 0.25)', textColor: '#fff' },
];

export default function TopDonors() {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('joining_requests')
      .select('id, name, ssc_batch, photo_url, payment_amount')
      .eq('status', 'approved')
      .order('payment_amount', { ascending: false })
      .limit(3)
      .then(({ data }) => {
        setDonors((data as Donor[]) || []);
        setLoading(false);
      });
  }, []);

  if (!loading && donors.length === 0) return null;

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <section className="py-10" id="top-donors" style={{ background: 'linear-gradient(180deg, hsl(330 10% 97%), hsl(32 15% 97%))' }}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <div className="ornament-divider mb-3 max-w-sm mx-auto">
            <span style={{ color: 'hsl(32 95% 55%)' }} className="text-lg">✦</span>
            <span className="text-primary font-display text-xs tracking-widest uppercase">Top Donors</span>
            <span style={{ color: 'hsl(330 70% 55%)' }} className="text-lg">✦</span>
          </div>
          <h2 className="font-bengali text-2xl md:text-3xl font-bold text-primary mb-1">
            সর্বোচ্চ ডোনেশন
          </h2>
          <p className="font-bengali text-sm text-muted-foreground">
            যারা সবচেয়ে বেশি অবদান রেখেছেন
          </p>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <Trophy className="w-8 h-8 text-primary mx-auto animate-pulse" />
          </div>
        ) : (
          <div className="flex justify-center gap-4 md:gap-6">
            {donors.map((donor, i) => (
              <div
                key={donor.id}
                className={`bg-card rounded-2xl border-2 p-5 text-center transition-all duration-300 hover:-translate-y-2 w-36 md:w-44 ${i === 0 ? 'scale-105' : ''}`}
                style={{
                  borderColor: podiumStyles[i]?.border || 'hsl(var(--border))',
                  boxShadow: podiumStyles[i]?.glow || 'none',
                }}
              >
                <span className="text-2xl md:text-3xl block mb-2">{medals[i]}</span>
                {donor.photo_url ? (
                  <img
                    src={donor.photo_url}
                    alt={donor.name}
                    className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover mx-auto mb-3"
                    style={{ borderWidth: '3px', borderStyle: 'solid', borderColor: podiumStyles[i]?.border }}
                  />
                ) : (
                  <div
                    className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center mx-auto mb-3"
                    style={{ background: podiumStyles[i]?.bg }}
                  >
                    <span className="text-2xl md:text-3xl font-bold font-bengali" style={{ color: podiumStyles[i]?.textColor }}>
                      {donor.name.charAt(0)}
                    </span>
                  </div>
                )}
                <p className="font-bengali font-bold text-sm text-foreground leading-tight mb-1">
                  {donor.name}
                </p>
                <span
                  className="inline-block text-xs font-bengali px-2 py-0.5 rounded-full mb-2 text-white"
                  style={{ background: podiumStyles[i]?.bg }}
                >
                  {donor.ssc_batch} ব্যাচ
                </span>
                <p className="font-display text-lg md:text-xl font-bold" style={{ color: podiumStyles[i]?.border }}>
                  ৳{donor.payment_amount}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
