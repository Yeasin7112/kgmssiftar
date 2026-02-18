import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { JoiningRequest } from "@/lib/supabase";
import { Camera, RefreshCw } from "lucide-react";

interface PhotoWallProps {
  onJoinClick?: () => void;
}

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
            <span className="text-gold text-xl">✦</span>
            <span className="text-primary font-display text-sm tracking-widest uppercase">Gallery</span>
            <span className="text-gold text-xl">✦</span>
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
              className="mt-5 inline-flex items-center gap-2 px-6 py-3 rounded-full font-bengali font-bold text-sm transition-all hover:scale-105 active:scale-95"
              style={{
                background: 'linear-gradient(135deg, hsl(44 85% 52%), hsl(38 90% 62%))',
                color: 'hsl(158 70% 10%)',
                boxShadow: '0 4px 20px hsl(44 80% 52% / 0.4)',
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
                className="flex-shrink-0 w-44 rounded-2xl overflow-hidden border border-border shadow-card group relative cursor-pointer snap-start"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <img
                  src={p.photo_url!}
                  alt={p.name}
                  className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                  <div>
                    <p className="font-bengali font-bold text-white text-sm leading-tight">{p.name}</p>
                    <span className="inline-block bg-amber-400/90 text-amber-900 text-xs font-bengali px-2 py-0.5 rounded-full mt-1">
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
