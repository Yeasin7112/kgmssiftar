import { useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Upload, User, CreditCard, Hash, Phone } from "lucide-react";

interface JoiningFormProps {
  formRef: React.RefObject<HTMLDivElement>;
}

const PAYMENT_METHODS = [
  { value: 'bkash', label: 'বিকাশ', number: '01XXXXXXXXX', color: '#E2136E' },
  { value: 'nagad', label: 'নগদ', number: '01XXXXXXXXX', color: '#F55000' },
  { value: 'rocket', label: 'রকেট', number: '01XXXXXXXXX', color: '#8C3494' },
  { value: 'manual', label: 'হাতে হাতে', number: '', color: '#16A34A' },
];

export default function JoiningForm({ formRef }: JoiningFormProps) {
  const [name, setName] = useState('');
  const [sscBatch, setSscBatch] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState('bkash');
  const [paymentAmount, setPaymentAmount] = useState(100);
  const [paymentNumber, setPaymentNumber] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sscBatches = Array.from({ length: 2026 - 1960 + 1 }, (_, i) => 2026 - i);

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
    if (paymentMethod !== 'manual' && !paymentNumber.trim()) return setError('পেমেন্ট নম্বর দিন');
    if (paymentMethod !== 'manual' && !transactionId.trim()) return setError('ট্রানজেকশন আইডি দিন');

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
      });

      if (insertError) throw insertError;

      setSuccess(true);
      setName(''); setSscBatch(''); setPhotoFile(null); setPhotoPreview('');
      setPaymentMethod('bkash'); setPaymentAmount(100); setPaymentNumber(''); setTransactionId('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'কিছু একটা সমস্যা হয়েছে, আবার চেষ্টা করুন';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const selectedMethod = PAYMENT_METHODS.find(m => m.value === paymentMethod);

  if (success) {
    return (
      <div ref={formRef} className="py-16 px-4 bg-background">
        <div className="max-w-lg mx-auto text-center">
          <div className="text-6xl mb-4">🌙</div>
          <h3 className="font-bengali text-2xl font-bold text-primary mb-3">
            আলহামদুলিল্লাহ! সফলভাবে জমা হয়েছে
          </h3>
          <p className="font-bengali text-muted-foreground mb-6">
            আপনার রেজিস্ট্রেশন পেমেন্ট যাচাইয়ের পর অনুমোদন করা হবে। অনুগ্রহ করে অপেক্ষা করুন।
          </p>
          <button
            onClick={() => setSuccess(false)}
            className="bg-primary text-primary-foreground font-bengali px-6 py-3 rounded-full hover:opacity-90 transition"
          >
            আরেকজন রেজিস্ট্রেশন করুন
          </button>
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
            <span className="text-gold text-xl">✦</span>
            <span className="text-primary font-display text-sm tracking-widest uppercase">Registration</span>
            <span className="text-gold text-xl">✦</span>
          </div>
          <h2 className="font-bengali text-3xl md:text-4xl font-bold text-primary mb-3">
            রেজিস্ট্রেশন ফর্ম
          </h2>
          <p className="font-bengali text-muted-foreground">
            আপনার তথ্য পূরণ করুন এবং পেমেন্ট করে রেজিস্ট্রেশন সম্পন্ন করুন
          </p>
        </div>

        <form onSubmit={handleSubmit} className="shadow-card rounded-2xl border border-border overflow-hidden bg-card">
          <div className="bg-primary p-5 text-center">
            <p className="font-bengali text-primary-foreground font-semibold text-lg">
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
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="পূর্ণ নাম লিখুন"
                maxLength={100}
                className="w-full border border-border rounded-xl px-4 py-3 font-bengali text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
              />
            </div>

            {/* SSC Batch */}
            <div>
              <label className="font-bengali text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                <Hash className="w-4 h-4 text-primary" />
                এসএসসি ব্যাচ *
              </label>
              <select
                value={sscBatch}
                onChange={e => setSscBatch(e.target.value)}
                className="w-full border border-border rounded-xl px-4 py-3 font-bengali text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
              >
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
                className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-primary/50 transition-colors bg-muted/30"
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
                    <p className="font-bengali text-xs text-muted-foreground opacity-60">সর্বোচ্চ ৫ MB (JPG, PNG)</p>
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
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={e => setPaymentAmount(Math.max(100, parseInt(e.target.value) || 100))}
                  min={100}
                  className="w-full border border-border rounded-xl px-4 py-3 font-bengali text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
                />
                <span className="font-bengali text-muted-foreground whitespace-nowrap text-sm">টাকা</span>
              </div>
              <div className="flex gap-2 mt-2 flex-wrap">
                {[100, 200, 500, 1000].map(amt => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setPaymentAmount(amt)}
                    className={`px-3 py-1.5 rounded-full text-sm font-bengali border transition ${
                      paymentAmount === amt
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'border-border text-muted-foreground hover:border-primary/50'
                    }`}
                  >
                    ৳{amt}
                  </button>
                ))}
              </div>
              <p className="font-bengali text-xs text-muted-foreground mt-1 opacity-70">নূন্যতম ১০০ টাকা, ইচ্ছামতো ডোনেশন যোগ করতে পারেন</p>
            </div>

            {/* Payment Method */}
            <div>
              <label className="font-bengali text-sm font-semibold text-foreground mb-3 block">
                পেমেন্ট পদ্ধতি *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                {PAYMENT_METHODS.map(method => (
                  <button
                    key={method.value}
                    type="button"
                    onClick={() => setPaymentMethod(method.value)}
                    className={`p-3 rounded-xl border-2 text-center font-bengali font-semibold text-sm transition-all ${
                      paymentMethod === method.value
                        ? 'border-primary shadow-md scale-105'
                        : 'border-border hover:border-primary/40'
                    }`}
                    style={paymentMethod === method.value ? { borderColor: method.color, background: method.color + '15' } : {}}
                  >
                    <div className="font-bold" style={{ color: method.color }}>{method.label}</div>
                  </button>
                ))}
              </div>

              {paymentMethod !== 'manual' && selectedMethod && (
                <div className="bg-muted/40 rounded-xl p-4 border border-border">
                  <p className="font-bengali text-sm text-muted-foreground mb-1">
                    <span className="font-semibold" style={{ color: selectedMethod.color }}>{selectedMethod.label}</span> নম্বরে ৳{paymentAmount} পাঠান
                  </p>
                  <p className="font-display font-bold text-lg text-foreground mb-3">01XXXXXXXXX</p>
                  <p className="font-bengali text-xs text-muted-foreground opacity-70">পেমেন্টের পর নিচে তথ্য পূরণ করুন</p>
                </div>
              )}

              {paymentMethod === 'manual' && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <p className="font-bengali text-sm text-green-700">
                    সরাসরি হাতে হাতে টাকা দেওয়া যাবে। যোগাযোগ করুন।
                  </p>
                </div>
              )}
            </div>

            {/* Payment Number */}
            {paymentMethod !== 'manual' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bengali text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-primary" />
                    আপনার নম্বর *
                  </label>
                  <input
                    type="text"
                    value={paymentNumber}
                    onChange={e => setPaymentNumber(e.target.value)}
                    placeholder="যে নম্বর থেকে পাঠিয়েছেন"
                    maxLength={20}
                    className="w-full border border-border rounded-xl px-4 py-3 font-bengali text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
                  />
                </div>
                <div>
                  <label className="font-bengali text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                    <Hash className="w-4 h-4 text-primary" />
                    ট্রানজেকশন আইডি *
                  </label>
                  <input
                    type="text"
                    value={transactionId}
                    onChange={e => setTransactionId(e.target.value)}
                    placeholder="TxnID / Reference"
                    maxLength={50}
                    className="w-full border border-border rounded-xl px-4 py-3 font-bengali text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="font-bengali text-sm text-red-600">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl font-bengali text-lg font-bold text-emerald-900 transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, hsl(44, 85%, 55%), hsl(38, 90%, 65%))' }}
            >
              {loading ? '⏳ জমা হচ্ছে...' : '🌙 রেজিস্ট্রেশন জমা দিন'}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
