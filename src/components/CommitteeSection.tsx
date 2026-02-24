import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Facebook, Phone, Users, Pin } from "lucide-react";

interface CommitteeMember {
  id: string;
  name: string;
  role: string;
  phone?: string;
  facebook_url?: string;
  photo_url?: string;
  ssc_batch?: number;
  sort_order: number;
  is_pinned?: boolean;
}

export default function CommitteeSection() {
  const [members, setMembers] = useState<CommitteeMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('committee_members')
      .select('*')
      .order('sort_order', { ascending: true })
      .then(({ data }) => {
        setMembers((data as CommitteeMember[]) || []);
        setLoading(false);
      });
  }, []);

  if (!loading && members.length === 0) return null;

  return (
    <section className="py-10 bg-muted/30" id="committee">
      <div className="container mx-auto px-4">
        <div className="text-center mb-6">
          <div className="ornament-divider mb-3 max-w-sm mx-auto">
            <span className="text-gold text-lg">✦</span>
            <span className="text-primary font-display text-xs tracking-widest uppercase">Committee</span>
            <span className="text-gold text-lg">✦</span>
          </div>
          <h2 className="font-bengali text-2xl md:text-3xl font-bold text-primary mb-1">
            আয়োজক কমিটি
          </h2>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <Users className="w-8 h-8 text-primary mx-auto animate-pulse" />
          </div>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent snap-x snap-mandatory">
            {members.map((member) => (
              <div
                key={member.id}
                className="bg-card rounded-xl border border-border shadow-card p-3 text-center hover:shadow-gold transition-all hover:-translate-y-1 duration-300 flex-shrink-0 w-32 snap-start"
              >
                {member.photo_url ? (
                  <img
                    src={member.photo_url}
                    alt={member.name}
                    className="w-12 h-12 rounded-full object-cover mx-auto mb-2 border-2 border-primary/30"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                    <span className="text-lg font-bold text-primary font-bengali">
                      {member.name.charAt(0)}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-center gap-1 mb-0.5">
                  {member.is_pinned && (
                    <Pin className="w-2.5 h-2.5 text-amber-500" />
                  )}
                  <p className="font-bengali font-bold text-xs text-foreground leading-tight">{member.name}</p>
                </div>
                <span className="inline-block bg-primary/10 text-primary text-[10px] font-bengali px-1.5 py-0.5 rounded-full mb-1">
                  {member.role}
                </span>
                {member.ssc_batch && (
                  <p className="font-bengali text-[10px] text-muted-foreground">{member.ssc_batch} ব্যাচ</p>
                )}
                <div className="flex items-center justify-center gap-1.5 mt-1">
                  {member.phone && (
                    <a href={`tel:${member.phone}`} className="p-1 rounded-full bg-green-100 text-green-700 hover:bg-green-200 transition" title={member.phone}>
                      <Phone className="w-2.5 h-2.5" />
                    </a>
                  )}
                  {member.facebook_url && (
                    <a href={member.facebook_url} target="_blank" rel="noopener noreferrer" className="p-1 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 transition">
                      <Facebook className="w-2.5 h-2.5" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
