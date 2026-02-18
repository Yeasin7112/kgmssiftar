import { useState, useRef, useEffect } from "react";
import { Share2, X, Download, Facebook, MessageCircle } from "lucide-react";

interface ShareCardProps {
  participantName?: string;
  participantBatch?: string;
  totalParticipants?: number;
}

export default function ShareCard({ participantName, participantBatch }: ShareCardProps) {
  const [open, setOpen] = useState(false);
  const [customName, setCustomName] = useState(participantName || '');
  const [customBatch, setCustomBatch] = useState(participantBatch || '');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const sscBatches = Array.from({ length: 2026 - 1960 + 1 }, (_, i) => 2026 - i);

  // Draw card on canvas whenever name/batch changes
  useEffect(() => {
    if (!open) return;
    drawCard();
  }, [open, customName, customBatch]);

  const drawCard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = 800;
    const H = 800;
    canvas.width = W;
    canvas.height = H;

    // ── Background gradient (deep emerald) ──
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, '#0a2819');
    bg.addColorStop(0.5, '#0f3a24');
    bg.addColorStop(1, '#1a2e10');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // ── Gold border frame ──
    const bw = 18;
    ctx.strokeStyle = '#c9a227';
    ctx.lineWidth = bw;
    ctx.strokeRect(bw / 2, bw / 2, W - bw, H - bw);

    // Inner thin border
    ctx.strokeStyle = 'rgba(201,162,39,0.35)';
    ctx.lineWidth = 2;
    ctx.strokeRect(32, 32, W - 64, H - 64);

    // ── Decorative corner ornaments ──
    drawCornerOrnament(ctx, 44, 44, 1, 1);
    drawCornerOrnament(ctx, W - 44, 44, -1, 1);
    drawCornerOrnament(ctx, 44, H - 44, 1, -1);
    drawCornerOrnament(ctx, W - 44, H - 44, -1, -1);

    // ── Subtle radial glow in center ──
    const glow = ctx.createRadialGradient(W / 2, H / 2, 60, W / 2, H / 2, 340);
    glow.addColorStop(0, 'rgba(201,162,39,0.08)');
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);

    // ── Moon crescent emoji (drawn as text) ──
    ctx.font = '72px serif';
    ctx.textAlign = 'center';
    ctx.fillText('🌙', W / 2, 148);

    // ── "বিসমিল্লাহ" ornament line ──
    ctx.font = '16px serif';
    ctx.fillStyle = 'rgba(201,162,39,0.6)';
    ctx.fillText('﷽', W / 2, 175);

    // ── Thin divider ──
    drawGoldDivider(ctx, W / 2, 195, 180);

    // ── Event title ──
    ctx.fillStyle = '#f5c842';
    ctx.font = 'bold 38px serif';
    ctx.textAlign = 'center';
    wrapText(ctx, 'খেপুপাড়া হাইস্কুলিয়ান', W / 2, 248, 660, 46);

    ctx.font = 'bold 52px serif';
    ctx.fillStyle = '#ffd966';
    ctx.fillText('ইফতার ২০২৬', W / 2, 315);

    // ── Event date pill ──
    drawPill(ctx, W / 2, 356, '২৮শে রমজান · ১৮ই মার্চ ২০২৬');

    // ── Divider ──
    drawGoldDivider(ctx, W / 2, 392, 120);

    // ── "আমি যোগ দিচ্ছি" announcement ──
    ctx.fillStyle = 'rgba(201,162,39,0.55)';
    ctx.font = '18px serif';
    ctx.fillText('আমি যোগ দিচ্ছি  ✦  আপনিও আসুন', W / 2, 432);

    // ── Name box ──
    drawNameBox(ctx, W / 2, 510, customName || 'আপনার নাম');

    // ── Batch badge ──
    if (customBatch) {
      ctx.fillStyle = 'rgba(201,162,39,0.15)';
      roundRect(ctx, W / 2 - 100, 555, 200, 38, 19);
      ctx.fill();
      ctx.strokeStyle = 'rgba(201,162,39,0.5)';
      ctx.lineWidth = 1.5;
      roundRect(ctx, W / 2 - 100, 555, 200, 38, 19);
      ctx.stroke();
      ctx.fillStyle = '#f5c842';
      ctx.font = '20px serif';
      ctx.textAlign = 'center';
      ctx.fillText(customBatch, W / 2, 579);
    }

    // ── Bottom school name ──
    ctx.fillStyle = 'rgba(180,220,180,0.7)';
    ctx.font = '16px serif';
    ctx.textAlign = 'center';
    ctx.fillText('খেপুপাড়া সরকারি মডেল মাধ্যমিক বিদ্যালয়', W / 2, 650);

    // ── Bottom divider ──
    drawGoldDivider(ctx, W / 2, 670, 200);

    // ── Visit URL ──
    ctx.fillStyle = 'rgba(201,162,39,0.75)';
    ctx.font = '14px serif';
    ctx.fillText('রেজিষ্ট্রেশন করতে ভিজিট করুন: highschoolian.vercel.app', W / 2, 690);

    // ── Hashtag ──
    ctx.fillStyle = 'rgba(201,162,39,0.5)';
    ctx.font = '14px serif';
    ctx.fillText('#হাইস্কুলিয়ানইফতার', W / 2, 710);

    // ── Star dots ──
    const stars = [[120, 200], [680, 190], [90, 600], [710, 590], [130, 720], [670, 725]];
    stars.forEach(([x, y]) => {
      ctx.fillStyle = 'rgba(201,162,39,0.4)';
      ctx.font = '14px serif';
      ctx.textAlign = 'center';
      ctx.fillText('✦', x, y);
    });

    setImageUrl(canvas.toDataURL('image/png'));
  };

  // Helper: gold ornament corner
  function drawCornerOrnament(ctx: CanvasRenderingContext2D, x: number, y: number, sx: number, sy: number) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(sx, sy);
    ctx.strokeStyle = '#c9a227';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 25); ctx.lineTo(0, 0); ctx.lineTo(25, 0);
    ctx.stroke();
    ctx.fillStyle = '#c9a227';
    ctx.beginPath();
    ctx.arc(0, 0, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Helper: horizontal gold divider with diamond
  function drawGoldDivider(ctx: CanvasRenderingContext2D, cx: number, y: number, halfW: number) {
    ctx.strokeStyle = 'rgba(201,162,39,0.45)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(cx - halfW, y); ctx.lineTo(cx - 10, y); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx + 10, y); ctx.lineTo(cx + halfW, y); ctx.stroke();
    ctx.fillStyle = '#c9a227';
    ctx.font = '12px serif';
    ctx.textAlign = 'center';
    ctx.fillText('◆', cx, y + 5);
  }

  // Helper: pill shape
  function drawPill(ctx: CanvasRenderingContext2D, cx: number, cy: number, text: string) {
    const pw = 360, ph = 36, r = 18;
    ctx.fillStyle = 'rgba(201,162,39,0.18)';
    roundRect(ctx, cx - pw / 2, cy - ph / 2, pw, ph, r);
    ctx.fill();
    ctx.strokeStyle = 'rgba(201,162,39,0.6)';
    ctx.lineWidth = 1.5;
    roundRect(ctx, cx - pw / 2, cy - ph / 2, pw, ph, r);
    ctx.stroke();
    ctx.fillStyle = '#ffd966';
    ctx.font = '18px serif';
    ctx.textAlign = 'center';
    ctx.fillText(text, cx, cy + 6);
  }

  // Helper: name highlight box
  function drawNameBox(ctx: CanvasRenderingContext2D, cx: number, cy: number, name: string) {
    const bw = Math.min(Math.max(ctx.measureText(name).width + 60, 200), 640);
    const bh = 56, r = 12;
    const bx = cx - bw / 2, by = cy - bh / 2;

    // Glow
    const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, bw / 2);
    glow.addColorStop(0, 'rgba(201,162,39,0.2)');
    glow.addColorStop(1, 'rgba(201,162,39,0)');
    ctx.fillStyle = glow;
    roundRect(ctx, bx - 20, by - 10, bw + 40, bh + 20, r + 8);
    ctx.fill();

    ctx.fillStyle = 'rgba(201,162,39,0.12)';
    roundRect(ctx, bx, by, bw, bh, r);
    ctx.fill();
    ctx.strokeStyle = '#c9a227';
    ctx.lineWidth = 2;
    roundRect(ctx, bx, by, bw, bh, r);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 30px serif';
    ctx.textAlign = 'center';
    ctx.fillText(name, cx, cy + 10);
  }

  // Helper: rounded rect path
  function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h - r);
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h);
    ctx.arcTo(x, y + h, x, y + h - r, r);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + r, y, r);
    ctx.closePath();
  }

  // Helper: text wrap
  function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxW: number, lineH: number) {
    const words = text.split(' ');
    let line = '';
    for (const word of words) {
      const test = line ? line + ' ' + word : word;
      if (ctx.measureText(test).width > maxW && line) {
        ctx.fillText(line, x, y);
        line = word;
        y += lineH;
      } else {
        line = test;
      }
    }
    ctx.fillText(line, x, y);
  }

  const download = () => {
    if (!imageUrl) return;
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = `iftar-card-${customName || 'share'}.png`;
    a.click();
  };

  const shareOnFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(`আমি খেপুপাড়া হাইস্কুলিয়ান ইফতার ২০২৬-এ যোগ দিচ্ছি! 🌙 তুমিও যোগ দাও!`)}`, '_blank');
  };

  const shareOnWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(`🌙 খেপুপাড়া হাইস্কুলিয়ান ইফতার ২০২৬\n\nআমি যোগ দিচ্ছি! তুমিও এসো।\n\n${window.location.href}`)}`, '_blank');
  };

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
        শেয়ার কার্ড তৈরি করুন
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.75)' }}>
          <div className="bg-card rounded-2xl border border-border shadow-card w-full max-w-md max-h-[90vh] overflow-y-auto">

            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-border">
              <div className="flex items-center gap-2">
                <span className="text-xl">🌙</span>
                <h3 className="font-bengali font-bold text-foreground text-lg">শেয়ার কার্ড তৈরি করুন</h3>
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

              {/* Hidden canvas for generation */}
              <canvas ref={canvasRef} className="hidden" />

              {/* Card preview */}
              {imageUrl && (
                <div className="rounded-xl overflow-hidden border-2 border-border shadow-card">
                  <img src={imageUrl} alt="Event Card" className="w-full" />
                </div>
              )}

              {/* Action buttons */}
              {imageUrl && (
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
              )}

              {!customName && (
                <p className="font-bengali text-xs text-muted-foreground text-center">
                  নাম লিখলেই কার্ড তৈরি হয়ে যাবে ✨
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
