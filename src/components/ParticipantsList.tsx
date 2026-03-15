import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { JoiningRequest } from "@/lib/supabase";
import { Users, RefreshCw } from "lucide-react";

export default function ParticipantsList() {
  const [participants, setParticipants] = useState<JoiningRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBatch, setSelectedBatch] = useState<number | 'all'>('all');

  const fetchParticipants = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('joining_requests')
      .select('*')
      .eq('status', 'approved')
      .order('ssc_batch', { ascending: false });
    setParticipants((data as JoiningRequest[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchParticipants();
    const channel = supabase
      .channel('approved-participants')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'joining_requests',
        filter: 'status=eq.approved'
      }, () => fetchParticipants())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const batches = [...new Set(participants.map(p => p.ssc_batch))].sort((a, b) => b - a);
  const filteredBase = selectedBatch === 'all' ? participants : participants.filter(p => p.ssc_batch === selectedBatch);
  const filtered = [...filteredBase].sort((a, b) => {
    const aPinned = (a as JoiningRequest & { is_pinned?: boolean }).is_pinned ? 1 : 0;
    const bPinned = (b as JoiningRequest & { is_pinned?: boolean }).is_pinned ? 1 : 0;
    return bPinned - aPinned;
  });

  const cardColors = [
    { border: 'hsl(270 55% 45% / 0.3)', shadow: 'hsl(270 55% 45% / 0.1)' },
    { border: 'hsl(330 70% 50% / 0.3)', shadow: 'hsl(330 70% 50% / 0.1)' },
    { border: 'hsl(170 65% 42% / 0.3)', shadow: 'hsl(170 65% 42% / 0.1)' },
    { border: 'hsl(32 95% 55% / 0.3)', shadow: 'hsl(32 95% 55% / 0.1)' },
    { border: 'hsl(200 80% 55% / 0.3)', shadow: 'hsl(200 80% 55% / 0.1)' },
  ];

  return (
    <section className="py-16" id="participants" style={{ background: 'linear-gradient(180deg, hsl(270 15% 96%), hsl(330 10% 97%))' }}>
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="text-center mb-10">
          <div className="ornament-divider mb-4 max-w-sm mx-auto">
            <span style={{ color: 'hsl(330 70% 55%)' }} className="text-xl">✦</span>
            <span className="text-primary font-display text-sm tracking-widest uppercase">Participants</span>
            <span style={{ color: 'hsl(170 65% 45%)' }} className="text-xl">✦</span>
          </div>
          <h2 className="font-bengali text-3xl md:text-4xl font-bold text-primary mb-3">
            যারা যোগ দিচ্ছেন
          </h2>
          <p className="font-bengali text-muted-foreground mb-6">
            অনুমোদিত অংশগ্রহণকারীদের তালিকা — মোট {participants.length} জন
          </p>

          <div className="flex items-center justify-center gap-2 mb-6 flex-wrap">
            <button
              onClick={() => setSelectedBatch('all')}
              className={`px-4 py-2 rounded-full font-bengali text-sm font-medium transition-all duration-200 ${
                selectedBatch === 'all'
                  ? 'text-white shadow-lg'
                  : 'bg-card border border-border text-muted-foreground hover:border-primary/50'
              }`}
              style={selectedBatch === 'all' ? { background: 'linear-gradient(135deg, hsl(270 55% 45%), hsl(330 70% 50%))' } : {}}
            >
              সব ব্যাচ ({participants.length})
            </button>
            {batches.map(batch => (
              <button
                key={batch}
                onClick={() => setSelectedBatch(batch)}
                className={`px-4 py-2 rounded-full font-bengali text-sm font-medium transition-all duration-200 ${
                  selectedBatch === batch
                    ? 'text-white shadow-lg'
                    : 'bg-card border border-border text-muted-foreground hover:border-primary/50'
                }`}
                style={selectedBatch === batch ? { background: 'linear-gradient(135deg, hsl(330 70% 50%), hsl(32 95% 55%))' } : {}}
              >
                {batch} ({participants.filter(p => p.ssc_batch === batch).length})
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <RefreshCw className="w-8 h-8 text-primary mx-auto animate-spin mb-3" />
            <p className="font-bengali text-muted-foreground">লোড হচ্ছে...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Users className="w-16 h-16 text-muted-foreground/40 mx-auto mb-4" />
            <h3 className="font-bengali text-xl text-muted-foreground mb-2">এখনো কেউ যোগ দেননি</h3>
            <p className="font-bengali text-sm text-muted-foreground opacity-70">রেজিস্ট্রেশন করুন এবং এখানে আপনার নাম দেখুন!</p>
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 -mx-4 px-4">
            {filtered.map((participant, idx) => {
              const colors = cardColors[idx % cardColors.length];
              return (
                <div
                  key={participant.id}
                  className="flex-shrink-0 w-48 snap-center bg-card rounded-2xl border-2 p-5 text-center hover:-translate-y-1 transition-all duration-300"
                  style={{
                    borderColor: colors.border,
                    boxShadow: `0 8px 30px ${colors.shadow}`,
                  }}
                >
                  {participant.photo_url ? (
                    <img
                      src={participant.photo_url}
                      alt={participant.name}
                      className="w-20 h-20 rounded-full object-cover mx-auto mb-3"
                      style={{ borderWidth: '3px', borderStyle: 'solid', borderColor: colors.border }}
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: `${colors.shadow}` }}>
                      <span className="text-3xl font-bold text-primary font-bengali">
                        {participant.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  {(participant as JoiningRequest & { is_pinned?: boolean }).is_pinned && (
                    <span className="text-amber-500 text-xs mb-1 block">📌</span>
                  )}
                  <p className="font-bengali font-semibold text-sm text-foreground mb-2 leading-tight">
                    {participant.name}
                  </p>
                  <span
                    className="inline-block text-xs font-bengali px-3 py-1 rounded-full text-white font-medium"
                    style={{ background: `linear-gradient(135deg, hsl(270 55% 45%), hsl(330 60% 50%))` }}
                  >
                    {participant.ssc_batch} ব্যাচ
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
