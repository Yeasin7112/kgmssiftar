import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { JoiningRequest } from "@/lib/supabase";
import { Camera, RefreshCw } from "lucide-react";

interface PhotoWallProps {
  onJoinClick?: () => void;
}

const borderColors = [
  'hsl(270 55% 50%)',
  'hsl(330 70% 50%)',
  'hsl(170 65% 42%)',
  'hsl(32 95% 55%)',
  'hsl(200 80% 55%)',
];

export default function PhotoWall({ onJoinClick }: PhotoWallProps) {
  const [photos, setPhotos] = useState<JoiningRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPhotos = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('joining_requests')
      .select('*')
      .eq('status', 'approved')
      .not('photo_url', 'is', null)
      .order('ssc_batch', { ascending: false });
    setPhotos((data as JoiningRequest[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchPhotos();
    const channel = supabase
      .channel('photo-wall-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'joining_requests' }, fetchPhotos)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  if (!loading && photos.length === 0) return null;

  return (
    <section className="py-16 bg-background" id="photo-wall">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="text-center mb-10">
          <div className="ornament-divider mb-4 max-w-sm mx-auto">
            <span style={{ color: 'hsl(270 55% 50%)' }} className="text-xl">✦</span>
            <span className="text-primary font-display text-sm tracking-widest uppercase">Gallery</span>
            <span style={{ color: 'hsl(32 95% 55%)' }} className="text-xl">✦</span>
          </div>
          <h2 className="font-bengali text-3xl md:text-4xl font-bold text-primary mb-3">
            স্মৃতির দেওয়াল
          </h2>
          <p className="font-bengali text-muted-foreground">
            অংশগ্রহণকারীদের ছবির গ্যালারি — {photos.length} জন
          </p>
          {onJoinClick && (
            <button
              onClick={onJoinClick}
              className="mt-5 inline-flex items-center gap-2 px-6 py-3 rounded-full font-bengali font-bold text-sm transition-all hover:scale-105 active:scale-95 text-white"
              style={{
                background: 'linear-gradient(135deg, hsl(330 70% 50%), hsl(270 55% 50%), hsl(32 95% 55%))',
                boxShadow: '0 4px 20px hsl(330 70% 50% / 0.3)',
              }}
            >
              🌙 এখনই রেজিষ্ট্রেশন করুন
            </button>
          )}
        </div>

        {loading ? (
          <div className="text-center py-16">
            <RefreshCw className="w-8 h-8 text-primary mx-auto animate-spin mb-3" />
            <p className="font-bengali text-muted-foreground">লোড হচ্ছে...</p>
          </div>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory">
            {photos.map((p, i) => (
              <div
                key={p.id}
                className="flex-shrink-0 w-44 rounded-2xl overflow-hidden border-2 group relative cursor-pointer snap-start transition-transform hover:-translate-y-1 duration-300"
                style={{
                  borderColor: borderColors[i % borderColors.length],
                  boxShadow: `0 6px 24px ${borderColors[i % borderColors.length]}25`,
                }}
              >
                <img
                  src={p.photo_url!}
                  alt={p.name}
                  className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                  <div>
                    <p className="font-bengali font-bold text-white text-sm leading-tight">{p.name}</p>
                    <span
                      className="inline-block text-xs font-bengali px-2 py-0.5 rounded-full mt-1 text-white"
                      style={{ background: borderColors[i % borderColors.length] }}
                    >
                      {p.ssc_batch} ব্যাচ
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
