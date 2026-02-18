import { Smartphone, Banknote, Phone } from "lucide-react";

const PAYMENT_OPTIONS = [
  {
    name: 'বিকাশ',
    number: '01XXXXXXXXX',
    type: 'সেন্ড মানি',
    color: '#E2136E',
    bg: '#fce7f3',
    icon: '📱',
    instruction: 'বিকাশ অ্যাপ → সেন্ড মানি → নম্বর দিন → টাকা পাঠান'
  },
  {
    name: 'নগদ',
    number: '01XXXXXXXXX',
    type: 'সেন্ড মানি',
    color: '#F55000',
    bg: '#fff7ed',
    icon: '💸',
    instruction: 'নগদ অ্যাপ → সেন্ড মানি → নম্বর দিন → টাকা পাঠান'
  },
  {
    name: 'রকেট',
    number: '01XXXXXXXXX',
    type: 'সেন্ড মানি',
    color: '#8C3494',
    bg: '#faf5ff',
    icon: '🚀',
    instruction: 'রকেট অ্যাপ → সেন্ড মানি → নম্বর দিন → টাকা পাঠান'
  },
  {
    name: 'হাতে হাতে',
    number: 'সরাসরি যোগাযোগ',
    type: 'ক্যাশ',
    color: '#16A34A',
    bg: '#f0fdf4',
    icon: '🤝',
    instruction: 'সরাসরি আয়োজকদের সাথে যোগাযোগ করুন'
  },
];

export default function PaymentSection() {
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto mb-10">
          {PAYMENT_OPTIONS.map((method) => (
            <div
              key={method.name}
              className="rounded-2xl border shadow-card overflow-hidden hover:shadow-gold transition-all hover:-translate-y-1 duration-300"
              style={{ borderColor: method.color + '40', background: method.bg }}
            >
              <div className="p-5 text-center">
                <div className="text-4xl mb-3">{method.icon}</div>
                <h3 className="font-bengali text-xl font-bold mb-1" style={{ color: method.color }}>
                  {method.name}
                </h3>
                <span className="inline-block text-xs font-bengali px-2 py-0.5 rounded-full mb-3" style={{ background: method.color + '20', color: method.color }}>
                  {method.type}
                </span>
                <div className="flex items-center justify-center gap-2 bg-white/60 rounded-xl px-3 py-2 mb-3">
                  <Phone className="w-4 h-4" style={{ color: method.color }} />
                  <span className="font-display font-bold text-sm text-foreground">{method.number}</span>
                </div>
                <p className="font-bengali text-xs text-muted-foreground leading-relaxed">{method.instruction}</p>
              </div>
            </div>
          ))}
        </div>

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
