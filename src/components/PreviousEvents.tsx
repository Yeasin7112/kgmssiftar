import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { RefreshCw, Camera } from "lucide-react";

interface EventPhoto {
  id: string;
  photo_url: string;
  caption?: string;
  event_year?: number;
}

export default function PreviousEvents() {
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
          {/* Section header */}
          <div className="text-center mb-10">
            <div className="ornament-divider mb-4 max-w-sm mx-auto">
              <span className="text-gold text-xl">✦</span>
              <span className="text-primary font-display text-sm tracking-widest uppercase">স্মৃতি</span>
              <span className="text-gold text-xl">✦</span>
            </div>
            <h2 className="font-bengali text-3xl md:text-4xl font-bold text-primary mb-3">
              পূর্ববর্তী আয়োজন
            </h2>
            <p className="font-bengali text-muted-foreground">
              বিগত বছরগুলোর স্মরণীয় মুহূর্তের ছবি
            </p>
          </div>

          {loading ? (
            <div className="text-center py-16">
              <RefreshCw className="w-8 h-8 text-primary mx-auto animate-spin mb-3" />
              <p className="font-bengali text-muted-foreground">লোড হচ্ছে...</p>
            </div>
          ) : (
            <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-3 space-y-3">
              {photos.map((photo, i) => (
                <div
                  key={photo.id}
                  onClick={() => setSelectedPhoto(photo)}
                  className="break-inside-avoid rounded-2xl overflow-hidden border border-border shadow-card group relative cursor-pointer"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <img
                    src={photo.photo_url}
                    alt={photo.caption || 'Previous event photo'}
                    className="w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                    <div>
                      {photo.caption && (
                        <p className="font-bengali font-bold text-white text-sm leading-tight">{photo.caption}</p>
                      )}
                      {photo.event_year && (
                        <span className="inline-block bg-amber-400/90 text-amber-900 text-xs font-bold px-2 py-0.5 rounded-full mt-1">
                          {photo.event_year}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
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
              <div className="bg-black/70 rounded-b-2xl px-5 py-3 flex items-center gap-3">
                {selectedPhoto.caption && (
                  <p className="font-bengali text-white flex-1">{selectedPhoto.caption}</p>
                )}
                {selectedPhoto.event_year && (
                  <span className="bg-amber-400 text-amber-900 text-sm font-bold px-3 py-1 rounded-full flex-shrink-0">
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
