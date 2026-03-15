import { useState, useRef, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Upload, User, CreditCard, Hash, Phone, AlertTriangle } from "lucide-react";
import ShareCard from "@/components/ShareCard";
import bkashLogo from "@/assets/bkash-logo.jpeg";
import nagadLogo from "@/assets/nagad-logo.jpeg";
import rocketLogo from "@/assets/rocket-logo.png";

interface JoiningFormProps {
  formRef: React.RefObject<HTMLDivElement>;
}

interface PaymentMethod {
  id: string;
  name: string;
  number: string;
  type: string;
  icon: string;
  instruction: string;
  warning: string;
}

export default function JoiningForm({ formRef }: JoiningFormProps) {
  const [name, setName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [sscBatch, setSscBatch] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentAmount, setPaymentAmount] = useState(100);
  const [paymentNumber, setPaymentNumber] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [submittedName, setSubmittedName] = useState('');
  const [submittedBatch, setSubmittedBatch] = useState('');
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [paymentReceiver, setPaymentReceiver] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sscBatches = Array.from({ length: 2026 - 1960 + 1 }, (_, i) => 2026 - i);

  useEffect(() => {
    supabase
      .from('payment_methods')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .then(({ data }) => {
        const methods = (data || []) as PaymentMethod[];
        setPaymentMethods(methods);
        if (methods.length > 0) setPaymentMethod(methods[0].name.toLowerCase());
      });
  }, []);

  const selectedMethod = paymentMethods.find(m => m.name.toLowerCase() === paymentMethod);
  const isManual = selectedMethod?.type === 'ক্যাশ' || selectedMethod?.name?.includes('হাতে হাতে');

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('ছবির সাইজ ৫ MB এর বেশি হওয়া যাবে না');
        return;
      }
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) return setError('নাম দিন');
    if (!sscBatch) return setError('এসএসসি ব্যাচ সিলেক্ট করুন');
    if (paymentAmount < 100) return setError('সর্বনিম্ন চাঁদা ১০০ টাকা');
    if (!isManual && !paymentNumber.trim()) return setError('পেমেন্ট নম্বর দিন');
    if (!isManual && !transactionId.trim()) return setError('ট্রানজেকশন আইডি দিন');
    if (isManual && !paymentReceiver.trim()) return setError('টাকা গ্রহণকারীর নাম দিন');

    setLoading(true);
    try {
      let photoUrl = '';
      if (photoFile) {
        const ext = photoFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from('participant-photos')
          .upload(fileName, photoFile);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage
          .from('participant-photos')
          .getPublicUrl(fileName);
        photoUrl = publicUrl;
      }

      const { error: insertError } = await supabase.from('joining_requests').insert({
        name: name.trim(),
        ssc_batch: parseInt(sscBatch),
        photo_url: photoUrl || null,
        payment_amount: paymentAmount,
        payment_method: paymentMethod,
        payment_number: paymentNumber.trim() || null,
        transaction_id: transactionId.trim() || null,
        mobile_number: mobileNumber.trim() || null,
        payment_receiver: isManual ? paymentReceiver.trim() || null : null,
      });

      if (insertError) throw insertError;

      setSubmittedName(name.trim());
      setSubmittedBatch(sscBatch);
      setSuccess(true);
      setName(''); setSscBatch(''); setPhotoFile(null); setPhotoPreview('');
      setPaymentAmount(100); setPaymentNumber(''); setTransactionId('');
      setMobileNumber(''); setPaymentReceiver('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'কিছু একটা সমস্যা হয়েছে, আবার চেষ্টা করুন';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full border border-border rounded-xl px-4 py-3 font-bengali text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition";

  if (success) {
    return (
      <div ref={formRef} className="py-16 px-4 bg-background relative overflow-hidden">
        {/* Confetti / star particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 30 }).map((_, i) => {
            const left = Math.random() * 100;
            const delay = Math.random() * 3;
            const duration = 2 + Math.random() * 3;
            const size = 6 + Math.random() * 10;
            const colors = ['#f59e0b', '#10b981', '#6366f1', '#ec4899', '#f97316', '#14b8a6'];
            const color = colors[i % colors.length];
            const shape = i % 3 === 0 ? '★' : i % 3 === 1 ? '✦' : '●';
            return (
              <span
                key={i}
                className="absolute text-xs animate-bounce"
                style={{
                  left: `${left}%`,
                  top: `-${size}px`,
                  fontSize: `${size}px`,
                  color,
                  animation: `confetti-fall ${duration}s ${delay}s ease-in infinite`,
                  opacity: 0.85,
                }}
              >
                {shape}
              </span>
            );
          })}
        </div>

        {/* Glowing moon animation */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div
              className="text-7xl md:text-8xl"
              style={{
                animation: 'moon-float 3s ease-in-out infinite, moon-glow-pulse 2s ease-in-out infinite',
                filter: 'drop-shadow(0 0 20px hsl(44 80% 50% / 0.6))',
              }}
            >
              🌙
            </div>
            {/* Sparkles around moon */}
            {[0, 60, 120, 180, 240, 300].map((deg, i) => (
              <span
                key={i}
                className="absolute text-gold"
                style={{
                  top: '50%',
                  left: '50%',
                  fontSize: '12px',
                  transform: `rotate(${deg}deg) translateY(-50px)`,
                  animation: `sparkle-twinkle 1.5s ${i * 0.25}s ease-in-out infinite`,
                  transformOrigin: '0 0',
                }}
              >
                ✦
              </span>
            ))}
          </div>
        </div>

        <div className="max-w-lg mx-auto text-center bg-card rounded-2xl border border-border shadow-card p-10 relative animate-scale-in">
          <h3
            className="font-bengali text-2xl md:text-3xl font-bold text-primary mb-3"
            style={{ animation: 'fade-slide-up 0.6s 0.3s ease-out both' }}
          >
            আলহামদুলিল্লাহ! সফলভাবে জমা হয়েছে
          </h3>
          <p
            className="font-bengali text-muted-foreground mb-6"
            style={{ animation: 'fade-slide-up 0.6s 0.5s ease-out both' }}
          >
            আপনার রেজিস্ট্রেশন পেমেন্ট যাচাইয়ের পর অনুমোদন করা হবে। অনুগ্রহ করে অপেক্ষা করুন।
          </p>
          {/* Social share section */}
          <div
            className="mb-6 space-y-3"
            style={{ animation: 'fade-slide-up 0.6s 0.7s ease-out both' }}
          >
            <p className="font-bengali text-sm text-muted-foreground">বন্ধুদের জানান — শেয়ার করুন!</p>
            <div className="flex justify-center gap-3 flex-wrap">
              <button
                onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(`আমি খেপুপাড়া হাইস্কুলিয়ান ইফতার ২০২৬-এ যোগ দিচ্ছি! 🌙 তুমিও যোগ দাও!`)}`, '_blank')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full font-bengali text-sm font-semibold bg-[hsl(221_44%_41%)] text-white hover:opacity-90 hover:scale-105 active:scale-95 transition-all"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                Facebook
              </button>
              <button
                onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`🌙 খেপুপাড়া হাইস্কুলিয়ান ইফতার ২০২৬\n\nআমি যোগ দিচ্ছি! তুমিও এসো।\n\n${window.location.href}`)}`, '_blank')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full font-bengali text-sm font-semibold bg-[hsl(142_70%_35%)] text-white hover:opacity-90 hover:scale-105 active:scale-95 transition-all"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                WhatsApp
              </button>
            </div>
            <div className="flex justify-center pt-1">
              <ShareCard participantName={submittedName} participantBatch={submittedBatch ? `${submittedBatch} ব্যাচ` : ''} />
            </div>
          </div>

          <button
            onClick={() => setSuccess(false)}
            className="bg-primary text-primary-foreground font-bengali px-6 py-3 rounded-full hover:opacity-90 hover:scale-105 active:scale-95 transition-all shadow-lg"
            style={{ animation: 'fade-slide-up 0.6s 0.9s ease-out both' }}
          >
            আরেকজন রেজিস্ট্রেশন করুন
          </button>
          <p className="font-bengali text-xs text-muted-foreground mt-4 opacity-60">
            কারিগরি সহায়তায় — ইয়াছিন আরাফাত শাওন
          </p>
        </div>
      </div>
    );
  }

  return (
    <section ref={formRef} className="py-16 bg-background" id="join-form">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Section header */}
        <div className="text-center mb-10">
          <div className="ornament-divider mb-4 max-w-sm mx-auto">
            <span style={{ color: 'hsl(330 70% 55%)' }} className="text-xl">✦</span>
            <span className="text-primary font-display text-sm tracking-widest uppercase">Registration</span>
            <span style={{ color: 'hsl(170 65% 45%)' }} className="text-xl">✦</span>
          </div>
          <h2 className="font-bengali text-3xl md:text-4xl font-bold text-primary mb-3">
            রেজিস্ট্রেশন ফর্ম
          </h2>
          <p className="font-bengali text-muted-foreground">
            আপনার তথ্য পূরণ করুন এবং পেমেন্ট করে রেজিস্ট্রেশন সম্পন্ন করুন
          </p>
          <div className="mt-4 inline-flex items-center gap-2 bg-destructive/10 border border-destructive/40 text-destructive rounded-full px-5 py-2.5 font-bengali font-bold text-sm animate-pulse">
            ⏰ রেজিষ্ট্রেশন এর শেষ সময় — ১৬ই মার্চ (২৬ রমজান)
          </div>
        </div>

        <form onSubmit={handleSubmit} className="shadow-card rounded-2xl border border-border overflow-hidden bg-card">
          {/* Form header */}
          <div className="p-5 text-center" style={{ background: 'linear-gradient(135deg, hsl(270 55% 45%), hsl(330 60% 48%), hsl(32 80% 50%))' }}>
            <p className="font-bengali font-semibold text-lg text-white">
              🌙 ইফতার মাহফিল ২০২৬ — রেজিস্ট্রেশন
            </p>
          </div>

          <div className="p-6 md:p-8 space-y-6">
            {/* Name */}
            <div>
              <label className="font-bengali text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                আপনার নাম *
              </label>
              <input type="text" value={name} onChange={e => setName(e.target.value)}
                placeholder="পূর্ণ নাম লিখুন" maxLength={100} className={inputCls} />
            </div>

            {/* Mobile Number */}
            <div>
              <label className="font-bengali text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary" />
                মোবাইল নম্বর *
              </label>
              <input type="tel" value={mobileNumber} onChange={e => setMobileNumber(e.target.value)}
                placeholder="01XXXXXXXXX" maxLength={15} className={inputCls} />
            </div>

            {/* SSC Batch */}
            <div>
              <label className="font-bengali text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                <Hash className="w-4 h-4 text-primary" />
                এসএসসি ব্যাচ *
              </label>
              <select value={sscBatch} onChange={e => setSscBatch(e.target.value)} className={inputCls}>
                <option value="">ব্যাচ সিলেক্ট করুন</option>
                {sscBatches.map(year => (
                  <option key={year} value={year}>{year} ব্যাচ</option>
                ))}
              </select>
            </div>

            {/* Photo Upload */}
            <div>
              <label className="font-bengali text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                <Upload className="w-4 h-4 text-primary" />
                আপনার ছবি (ঐচ্ছিক)
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-primary/60 transition-colors bg-muted/40"
              >
                {photoPreview ? (
                  <div className="flex flex-col items-center gap-3">
                    <img src={photoPreview} alt="Preview" className="w-24 h-24 rounded-full object-cover border-4 border-primary/30" />
                    <p className="font-bengali text-sm text-muted-foreground">ছবি পরিবর্তন করতে ক্লিক করুন</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                      <Upload className="w-6 h-6 text-primary" />
                    </div>
                    <p className="font-bengali text-sm text-muted-foreground">ছবি আপলোড করতে ক্লিক করুন</p>
                    <p className="font-bengali text-xs text-muted-foreground opacity-70">সর্বোচ্চ ৫ MB (JPG, PNG)</p>
                  </div>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
            </div>

            {/* Payment Amount */}
            <div>
              <label className="font-bengali text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-primary" />
                চাঁদার পরিমাণ (টাকা) *
              </label>
              <div className="flex items-center gap-3">
                <input type="number" value={paymentAmount}
                  onChange={e => setPaymentAmount(Math.max(100, parseInt(e.target.value) || 100))}
                  min={100} className={inputCls} />
                <span className="font-bengali text-muted-foreground whitespace-nowrap text-sm">টাকা</span>
              </div>
              <div className="flex gap-2 mt-2 flex-wrap">
                {[100, 200, 500, 1000].map(amt => (
                  <button key={amt} type="button" onClick={() => setPaymentAmount(amt)}
                    className={`px-3 py-1.5 rounded-full text-sm font-bengali border transition ${
                      paymentAmount === amt
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'border-border text-muted-foreground hover:border-primary/50 bg-background'
                    }`}>
                    ৳{amt}
                  </button>
                ))}
              </div>
              <p className="font-bengali text-xs text-muted-foreground mt-1 opacity-70">নূন্যতম ১০০ টাকা, ইচ্ছামতো ডোনেশন যোগ করতে পারেন</p>
            </div>

            {/* Payment Method — fetched from DB */}
            {paymentMethods.length > 0 && (
              <div>
                <label className="font-bengali text-sm font-semibold text-foreground mb-3 block">পেমেন্ট পদ্ধতি *</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  {paymentMethods.map(method => {
                    const isActive = paymentMethod === method.name.toLowerCase();
                    const nameLower = method.name.toLowerCase();
                    const logoMap: Record<string, string> = {
                      'বিকাশ': bkashLogo,
                      'bkash': bkashLogo,
                      'নগদ': nagadLogo,
                      'nagad': nagadLogo,
                      'রকেট': rocketLogo,
                      'rocket': rocketLogo,
                    };
                    const logoSrc = logoMap[method.name] || logoMap[nameLower];
                    return (
                      <button key={method.id} type="button"
                        onClick={() => setPaymentMethod(method.name.toLowerCase())}
                        className={`p-3 rounded-xl border-2 text-center font-bengali font-bold text-sm transition-all ${
                          isActive ? 'border-primary bg-primary/10 scale-105 shadow-md' : 'border-border bg-background hover:border-primary/40'
                        }`}>
                        {logoSrc ? (
                          <img src={logoSrc} alt={method.name} className="w-10 h-10 rounded-full object-cover mx-auto mb-1" />
                        ) : (
                          <div className="text-2xl mb-1">{method.icon}</div>
                        )}
                        <div className={isActive ? 'text-primary' : 'text-foreground'}>{method.name}</div>
                      </button>
                    );
                  })}
                </div>

                {selectedMethod && !isManual && (
                  <div className="space-y-2">
                    {/* Warning banner */}
                    {selectedMethod.warning && (
                      <div className="flex items-center gap-2 bg-amber-50 border border-amber-300 rounded-xl px-4 py-3">
                        <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                        <p className="font-bengali text-sm text-amber-800 font-semibold">{selectedMethod.warning}</p>
                      </div>
                    )}
                    <div className="bg-primary/5 rounded-xl p-4 border border-primary/20 space-y-2">
                      <p className="font-bengali text-sm text-foreground">
                        <span className="font-semibold text-primary">{selectedMethod.name}</span> নম্বরে ৳{paymentAmount} পাঠান
                      </p>
                      <p className="font-display font-bold text-xl text-primary">{selectedMethod.number}</p>
                      {selectedMethod.instruction && (
                        <div className="bg-primary/10 rounded-lg px-3 py-2 mt-1">
                          <p className="font-bengali text-xs text-primary font-medium mb-1">নির্দেশনা:</p>
                          <p className="font-bengali text-xs text-foreground leading-relaxed">{selectedMethod.instruction}</p>
                        </div>
                      )}
                      <p className="font-bengali text-xs text-muted-foreground">পেমেন্টের পর নিচে তথ্য পূরণ করুন</p>
                    </div>
                  </div>
                )}

                {isManual && (
                  <div className="space-y-3">
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-1">
                      <p className="font-bengali text-sm text-green-800 font-medium">
                        সরাসরি হাতে হাতে টাকা দেওয়া যাবে।
                      </p>
                      {selectedMethod?.instruction && (
                        <p className="font-bengali text-xs text-green-700 leading-relaxed">{selectedMethod.instruction}</p>
                      )}
                    </div>
                    <div>
                      <label className="font-bengali text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                        <User className="w-4 h-4 text-primary" />
                        কার কাছে টাকা দিবেন? *
                      </label>
                      <input
                        type="text"
                        value={paymentReceiver}
                        onChange={e => setPaymentReceiver(e.target.value)}
                        placeholder="যেমন: রনি, বিধান শাহা"
                        maxLength={100}
                        className={inputCls}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Payment Number & TxnID — only for non-manual */}
            {!isManual && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bengali text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-primary" />
                    আপনার নম্বর *
                  </label>
                  <input type="text" value={paymentNumber} onChange={e => setPaymentNumber(e.target.value)}
                    placeholder="যে নম্বর থেকে পাঠিয়েছেন" maxLength={20} className={inputCls} />
                </div>
                <div>
                  <label className="font-bengali text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                    <Hash className="w-4 h-4 text-primary" />
                    ট্রানজেকশন আইডি *
                  </label>
                  <input type="text" value={transactionId} onChange={e => setTransactionId(e.target.value)}
                    placeholder="TxnID / Reference" maxLength={50} className={inputCls} />
                </div>
              </div>
            )}

            {error && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4">
                <p className="font-bengali text-sm text-destructive font-medium">{error}</p>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-4 rounded-xl font-bengali text-lg font-bold bg-gold text-primary hover:opacity-90 active:scale-95 disabled:opacity-50 transition-all shadow-lg">
              {loading ? '⏳ জমা হচ্ছে...' : '🌙 রেজিস্ট্রেশন জমা দিন'}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
