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
    // Realtime subscription
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

  return (
    <section className="py-16 bg-muted/30" id="participants">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="text-center mb-10">
          <div className="ornament-divider mb-4 max-w-sm mx-auto">
            <span className="text-gold text-xl">✦</span>
            <span className="text-primary font-display text-sm tracking-widest uppercase">Participants</span>
            <span className="text-gold text-xl">✦</span>
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
              className={`px-4 py-2 rounded-full font-bengali text-sm font-medium transition ${
                selectedBatch === 'all'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card border border-border text-muted-foreground hover:border-primary/50'
              }`}
            >
              সব ব্যাচ ({participants.length})
            </button>
            {batches.map(batch => (
              <button
                key={batch}
                onClick={() => setSelectedBatch(batch)}
                className={`px-4 py-2 rounded-full font-bengali text-sm font-medium transition ${
                  selectedBatch === batch
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card border border-border text-muted-foreground hover:border-primary/50'
                }`}
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
            {filtered.map((participant) => (
              <div
                key={participant.id}
                className="flex-shrink-0 w-48 snap-center bg-card rounded-2xl border border-border shadow-card p-5 text-center hover:shadow-gold transition-all duration-300"
              >
                {participant.photo_url ? (
                  <img
                    src={participant.photo_url}
                    alt={participant.name}
                    className="w-20 h-20 rounded-full object-cover mx-auto mb-3"
                    style={{ borderWidth: '3px', borderStyle: 'solid', borderColor: 'hsl(var(--primary) / 0.3)' }}
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
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
                <span className="inline-block bg-primary/10 text-primary text-xs font-bengali px-2 py-0.5 rounded-full">
                  {participant.ssc_batch} ব্যাচ
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
