import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Share2, X, Download, Facebook, MessageCircle, Loader2, Sparkles } from "lucide-react";

interface ShareCardProps {
  participantName?: string;
  participantBatch?: string;
  totalParticipants?: number;
}

export default function ShareCard({ participantName, participantBatch, totalParticipants = 0 }: ShareCardProps) {
  const [open, setOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [customName, setCustomName] = useState(participantName || '');
  const [customBatch, setCustomBatch] = useState(participantBatch || '');

  const generate = async () => {
    if (!customName.trim()) { setError('নাম দিন'); return; }
    setError('');
    setGenerating(true);
    setImageUrl(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('generate-event-card', {
        body: {
          name: customName.trim(),
          batch: customBatch || 'প্রাক্তন শিক্ষার্থী',
          participants_count: totalParticipants,
        },
      });

      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);
      if (!data?.imageUrl) throw new Error('ছবি তৈরি হয়নি');

      setImageUrl(data.imageUrl);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'কিছু একটা সমস্যা হয়েছে';
      setError(msg);
    } finally {
      setGenerating(false);
    }
  };

  const download = () => {
    if (!imageUrl) return;
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = `iftar-card-${customName}.png`;
    a.click();
  };

  const shareOnFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(`আমি খেপুপাড়া হাইস্কুলিয়ান ইফতার ২০২৬-এ যোগ দিচ্ছি! 🌙 তুমিও যোগ দাও!`)}`, '_blank');
  };

  const shareOnWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(`🌙 খেপুপাড়া হাইস্কুলিয়ান ইফতার ২০২৬\n\nআমি যোগ দিচ্ছি! তুমিও এসো।\n\n${window.location.href}`)}`, '_blank');
  };

  const sscBatches = Array.from({ length: 2026 - 1960 + 1 }, (_, i) => 2026 - i);

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-bengali text-sm font-semibold border-2 transition-all hover:scale-105 active:scale-95"
        style={{
          borderColor: 'hsl(44 70% 52%)',
          color: 'hsl(44 85% 52%)',
          background: 'hsl(44 80% 52% / 0.08)',
        }}
      >
        <Share2 className="w-4 h-4" />
        শেয়ার করুন
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="bg-card rounded-2xl border border-border shadow-card w-full max-w-md max-h-[90vh] overflow-y-auto">
            {/* Modal header */}
            <div className="flex items-center justify-between p-5 border-b border-border">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-gold" />
                <h3 className="font-bengali font-bold text-foreground text-lg">ইভেন্ট কার্ড শেয়ার করুন</h3>
              </div>
              <button onClick={() => setOpen(false)} className="p-2 rounded-xl hover:bg-muted transition">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Name input */}
              <div>
                <label className="font-bengali text-sm font-semibold text-foreground mb-2 block">আপনার নাম *</label>
                <input
                  type="text"
                  value={customName}
                  onChange={e => setCustomName(e.target.value)}
                  placeholder="নাম লিখুন"
                  className="w-full border border-border rounded-xl px-4 py-3 font-bengali text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
                />
              </div>

              {/* Batch select */}
              <div>
                <label className="font-bengali text-sm font-semibold text-foreground mb-2 block">SSC ব্যাচ (ঐচ্ছিক)</label>
                <select
                  value={customBatch}
                  onChange={e => setCustomBatch(e.target.value)}
                  className="w-full border border-border rounded-xl px-4 py-3 font-bengali text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
                >
                  <option value="">ব্যাচ সিলেক্ট করুন</option>
                  {sscBatches.map(year => (
                    <option key={year} value={`${year} ব্যাচ`}>{year} ব্যাচ</option>
                  ))}
                </select>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                  <p className="font-bengali text-sm text-red-700">{error}</p>
                </div>
              )}

              {/* Generate button */}
              <button
                onClick={generate}
                disabled={generating}
                className="w-full py-3 rounded-xl font-bengali font-bold text-sm transition-all hover:opacity-90 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                style={{
                  background: 'linear-gradient(135deg, hsl(158 64% 28%), hsl(158 60% 35%))',
                  color: 'hsl(44 90% 80%)',
                }}
              >
                {generating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    AI কার্ড তৈরি হচ্ছে...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    AI দিয়ে কার্ড তৈরি করুন
                  </>
                )}
              </button>

              {generating && (
                <p className="text-center font-bengali text-xs text-muted-foreground animate-pulse">
                  সুন্দর কার্ড তৈরি করা হচ্ছে, একটু অপেক্ষা করুন... ✨
                </p>
              )}

              {/* Generated image */}
              {imageUrl && (
                <div className="space-y-3">
                  <div className="rounded-xl overflow-hidden border border-border shadow-card">
                    <img src={imageUrl} alt="Event Card" className="w-full" />
                  </div>

                  {/* Action buttons */}
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={download}
                      className="flex flex-col items-center gap-1 py-3 rounded-xl border border-border bg-muted/40 hover:bg-muted transition text-xs font-bengali text-foreground"
                    >
                      <Download className="w-4 h-4" />
                      ডাউনলোড
                    </button>
                    <button
                      onClick={shareOnFacebook}
                      className="flex flex-col items-center gap-1 py-3 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 transition text-xs font-bengali text-blue-700"
                    >
                      <Facebook className="w-4 h-4" />
                      Facebook
                    </button>
                    <button
                      onClick={shareOnWhatsApp}
                      className="flex flex-col items-center gap-1 py-3 rounded-xl border border-green-200 bg-green-50 hover:bg-green-100 transition text-xs font-bengali text-green-700"
                    >
                      <MessageCircle className="w-4 h-4" />
                      WhatsApp
                    </button>
                  </div>

                  <button
                    onClick={generate}
                    className="w-full py-2 rounded-xl font-bengali text-sm text-muted-foreground border border-border hover:bg-muted transition"
                  >
                    🔄 নতুন কার্ড তৈরি করুন
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
