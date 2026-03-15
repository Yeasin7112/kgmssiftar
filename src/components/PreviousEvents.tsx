import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { RefreshCw, Camera } from "lucide-react";

interface EventPhoto {
  id: string;
  photo_url: string;
  caption?: string;
  event_year?: number;
}

interface PreviousEventsProps {
  onJoinClick?: () => void;
}

const frameBorders = [
  'hsl(270 55% 50%)',
  'hsl(330 70% 50%)',
  'hsl(170 65% 42%)',
  'hsl(32 95% 55%)',
];

export default function PreviousEvents({ onJoinClick }: PreviousEventsProps) {
  const [photos, setPhotos] = useState<EventPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<EventPhoto | null>(null);

  useEffect(() => {
    const fetchPhotos = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('event_photos')
        .select('*')
        .order('sort_order', { ascending: true });
      setPhotos((data as EventPhoto[]) || []);
      setLoading(false);
    };
    fetchPhotos();
  }, []);

  if (!loading && photos.length === 0) return null;

  return (
    <>
      <section className="py-16 bg-background" id="previous-events">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <div className="ornament-divider mb-4 max-w-sm mx-auto">
              <span style={{ color: 'hsl(32 95% 55%)' }} className="text-xl">✦</span>
              <span className="text-primary font-display text-sm tracking-widest uppercase">স্মৃতি</span>
              <span style={{ color: 'hsl(270 55% 50%)' }} className="text-xl">✦</span>
            </div>
            <h2 className="font-bengali text-3xl md:text-4xl font-bold text-primary mb-3">
              পূর্ববর্তী আয়োজন
            </h2>
            <p className="font-bengali text-muted-foreground">
              বিগত বছরগুলোর স্মরণীয় মুহূর্তের ছবি
            </p>
            {onJoinClick && (
              <button
                onClick={onJoinClick}
                className="mt-5 inline-flex items-center gap-2 px-6 py-3 rounded-full font-bengali font-bold text-sm transition-all hover:scale-105 active:scale-95 text-white"
                style={{
                  background: 'linear-gradient(135deg, hsl(270 55% 50%), hsl(330 70% 50%), hsl(32 95% 55%))',
                  boxShadow: '0 4px 20px hsl(270 55% 50% / 0.3)',
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
            <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-4 -mx-4 px-4">
              {photos.map((photo, i) => {
                const borderColor = frameBorders[i % frameBorders.length];
                return (
                  <div
                    key={photo.id}
                    onClick={() => setSelectedPhoto(photo)}
                    className="flex-shrink-0 w-[80vw] max-w-sm snap-center rounded-2xl overflow-hidden border-2 group relative cursor-pointer transition-transform hover:-translate-y-1 duration-300"
                    style={{
                      borderColor,
                      boxShadow: `0 6px 24px ${borderColor}25`,
                    }}
                  >
                    <img
                      src={photo.photo_url}
                      alt={photo.caption || 'Previous event photo'}
                      className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-3">
                      <div>
                        {photo.caption && (
                          <p className="font-bengali font-bold text-white text-sm leading-tight">{photo.caption}</p>
                        )}
                        {photo.event_year && (
                          <span
                            className="inline-block text-xs font-bold px-2 py-0.5 rounded-full mt-1 text-white"
                            style={{ background: borderColor }}
                          >
                            {photo.event_year}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {photos.length === 0 && !loading && (
            <div className="text-center py-16">
              <Camera className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <p className="font-bengali text-muted-foreground">এখনো কোনো ছবি যোগ করা হয়নি</p>
            </div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(20,5,40,0.9)' }}
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="relative max-w-3xl w-full"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute -top-10 right-0 text-white font-display text-2xl opacity-70 hover:opacity-100 transition"
            >✕</button>
            <img
              src={selectedPhoto.photo_url}
              alt={selectedPhoto.caption || 'Event photo'}
              className="w-full rounded-2xl object-contain max-h-[80vh]"
            />
            {(selectedPhoto.caption || selectedPhoto.event_year) && (
              <div className="rounded-b-2xl px-5 py-3 flex items-center gap-3" style={{ background: 'rgba(20,5,40,0.8)' }}>
                {selectedPhoto.caption && (
                  <p className="font-bengali text-white flex-1">{selectedPhoto.caption}</p>
                )}
                {selectedPhoto.event_year && (
                  <span className="text-sm font-bold px-3 py-1 rounded-full flex-shrink-0 text-white" style={{ background: 'linear-gradient(135deg, hsl(270 55% 50%), hsl(330 70% 50%))' }}>
                    {selectedPhoto.event_year}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
