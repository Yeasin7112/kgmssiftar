import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Phone, ChevronDown, ChevronUp } from "lucide-react";

interface PaymentMethod {
  id: string;
  name: string;
  number: string;
  type: string;
  icon: string;
  instruction: string;
  is_active: boolean;
  sort_order: number;
}

const methodColors: Record<string, { color: string; bg: string }> = {
  'বিকাশ': { color: '#E2136E', bg: '#fce7f3' },
  'নগদ': { color: '#F55000', bg: '#fff7ed' },
  'রকেট': { color: '#8C3494', bg: '#faf5ff' },
  'হাতে হাতে': { color: '#16A34A', bg: '#f0fdf4' },
};

export default function PaymentSection() {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('payment_methods')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .then(({ data }) => {
        const typedData = (data || []) as PaymentMethod[];
        setMethods(typedData);
        if (typedData.length > 0) setExpanded(typedData[0].id);
        setLoading(false);
      });
  }, []);

  const getColors = (name: string) =>
    methodColors[name] || { color: '#158 64% 28%', bg: '#f0fdf4' };

  return (
    <section className="py-16 bg-background" id="payment">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <div className="ornament-divider mb-4 max-w-sm mx-auto">
            <span className="text-gold text-xl">✦</span>
            <span className="text-primary font-display text-sm tracking-widest uppercase">Payment</span>
            <span className="text-gold text-xl">✦</span>
          </div>
          <h2 className="font-bengali text-3xl md:text-4xl font-bold text-primary mb-3">
            পেমেন্ট পদ্ধতি
          </h2>
          <p className="font-bengali text-muted-foreground">
            যেকোনো পদ্ধতিতে নূন্যতম <span className="font-bold text-primary">১০০ টাকা</span> চাঁদা দিন
          </p>
        </div>

        {loading ? (
          <div className="flex gap-4 max-w-4xl mx-auto justify-center">
            {[1,2,3,4].map(i => <div key={i} className="h-24 w-full bg-muted rounded-2xl animate-pulse" />)}
          </div>
        ) : (
          <>
            {/* Method selector tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-4xl mx-auto mb-6">
              {methods.map((method) => {
                const { color, bg } = getColors(method.name);
                const isActive = expanded === method.id;
                return (
                  <button
                    key={method.id}
                    onClick={() => setExpanded(isActive ? null : method.id)}
                    className="rounded-2xl border-2 p-4 text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
                    style={{
                      borderColor: isActive ? color : color + '40',
                      background: isActive ? color : bg,
                    }}
                  >
                    <div className="text-3xl mb-2">{method.icon}</div>
                    <p className="font-bengali font-bold text-sm" style={{ color: isActive ? '#fff' : color }}>
                      {method.name}
                    </p>
                    <span
                      className="inline-block text-xs font-bengali px-2 py-0.5 rounded-full mt-1"
                      style={{ background: isActive ? 'rgba(255,255,255,0.25)' : color + '20', color: isActive ? '#fff' : color }}
                    >
                      {method.type}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Expanded instruction card */}
            {expanded && (() => {
              const method = methods.find(m => m.id === expanded);
              if (!method) return null;
              const { color, bg } = getColors(method.name);
              return (
                <div
                  className="max-w-2xl mx-auto rounded-2xl border-2 overflow-hidden mb-8 shadow-card"
                  style={{ borderColor: color + '60', background: bg }}
                >
                  <div className="p-1" style={{ background: color }}>
                    <p className="text-white text-center font-bengali font-bold text-sm py-1">
                      {method.icon} {method.name} পেমেন্ট নির্দেশিকা
                    </p>
                  </div>
                  <div className="p-5">
                    {/* Number */}
                    <div
                      className="flex items-center justify-center gap-3 rounded-xl px-4 py-3 mb-4 border"
                      style={{ borderColor: color + '40', background: 'rgba(255,255,255,0.7)' }}
                    >
                      <Phone className="w-5 h-5" style={{ color }} />
                      <div className="text-center">
                        <p className="text-xs font-bengali text-muted-foreground">পেমেন্ট নম্বর</p>
                        <p className="font-display font-bold text-lg tracking-widest" style={{ color }}>
                          {method.number}
                        </p>
                      </div>
                    </div>
                    {/* Step-by-step */}
                    <div className="space-y-2">
                      {method.instruction.split('→').map((step, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <span
                            className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 text-white"
                            style={{ background: color }}
                          >
                            {idx + 1}
                          </span>
                          <p className="font-bengali text-sm text-foreground leading-relaxed">{step.trim()}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}
          </>
        )}

        {/* Important note */}
        <div className="max-w-2xl mx-auto bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center">
          <div className="text-3xl mb-3">⚠️</div>
          <h4 className="font-bengali font-bold text-amber-800 mb-2">গুরুত্বপূর্ণ তথ্য</h4>
          <p className="font-bengali text-amber-700 text-sm leading-relaxed">
            পেমেন্ট করার পর রেজিস্ট্রেশন ফর্মে ট্রানজেকশন আইডি এবং আপনার নম্বর দিয়ে
            সাবমিট করুন। অ্যাডমিন যাচাই করার পর আপনার নাম তালিকায় যুক্ত হবে।
          </p>
        </div>
      </div>
    </section>
  );
}
