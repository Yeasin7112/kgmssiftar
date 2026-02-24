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
    <section className="py-10 bg-gradient-to-b from-background to-muted/30" id="top-donors">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <div className="ornament-divider mb-3 max-w-sm mx-auto">
            <span className="text-gold text-lg">✦</span>
            <span className="text-primary font-display text-xs tracking-widest uppercase">Top Donors</span>
            <span className="text-gold text-lg">✦</span>
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
                className={`bg-card rounded-2xl border border-border shadow-card p-5 text-center transition-all duration-300 hover:shadow-gold w-36 md:w-44 ${i === 0 ? 'scale-105 border-amber-300/50' : ''}`}
              >
                <span className="text-2xl md:text-3xl block mb-2">{medals[i]}</span>
                {donor.photo_url ? (
                  <img
                    src={donor.photo_url}
                    alt={donor.name}
                    className={`w-16 h-16 md:w-20 md:h-20 rounded-full object-cover mx-auto mb-3 border-3 ${i === 0 ? 'border-amber-400' : i === 1 ? 'border-gray-400' : 'border-amber-700'}`}
                    style={{ borderWidth: '3px', borderStyle: 'solid' }}
                  />
                ) : (
                  <div className={`w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center mx-auto mb-3 ${i === 0 ? 'bg-amber-100' : 'bg-primary/10'}`}>
                    <span className={`text-2xl md:text-3xl font-bold font-bengali ${i === 0 ? 'text-amber-600' : 'text-primary'}`}>
                      {donor.name.charAt(0)}
                    </span>
                  </div>
                )}
                <p className="font-bengali font-bold text-sm text-foreground leading-tight mb-1">
                  {donor.name}
                </p>
                <span className="inline-block bg-primary/10 text-primary text-xs font-bengali px-2 py-0.5 rounded-full mb-2">
                  {donor.ssc_batch} ব্যাচ
                </span>
                <p className="font-display text-lg md:text-xl font-bold text-primary">
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
