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

const cardGradients = [
  'hsl(270 55% 45%)',
  'hsl(330 70% 50%)',
  'hsl(170 65% 42%)',
  'hsl(32 95% 55%)',
  'hsl(200 80% 55%)',
];

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
    <section className="py-10" id="committee" style={{ background: 'linear-gradient(180deg, hsl(32 15% 97%), hsl(270 15% 96%))' }}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-6">
          <div className="ornament-divider mb-3 max-w-sm mx-auto">
            <span style={{ color: 'hsl(170 65% 45%)' }} className="text-lg">✦</span>
            <span className="text-primary font-display text-xs tracking-widest uppercase">Committee</span>
            <span style={{ color: 'hsl(330 70% 55%)' }} className="text-lg">✦</span>
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
          <div className="flex gap-3 overflow-x-auto pb-3 snap-x snap-mandatory">
            {members.map((member, idx) => {
              const accentColor = cardGradients[idx % cardGradients.length];
              return (
                <div
                  key={member.id}
                  className="bg-card rounded-xl border-2 p-3 text-center hover:-translate-y-1 transition-all duration-300 flex-shrink-0 w-32 snap-start"
                  style={{
                    borderColor: `${accentColor}40`,
                    boxShadow: `0 4px 16px ${accentColor}15`,
                  }}
                >
                  {member.photo_url ? (
                    <img
                      src={member.photo_url}
                      alt={member.name}
                      className="w-12 h-12 rounded-full object-cover mx-auto mb-2"
                      style={{ borderWidth: '2px', borderStyle: 'solid', borderColor: accentColor }}
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2" style={{ background: `${accentColor}20` }}>
                      <span className="text-lg font-bold font-bengali" style={{ color: accentColor }}>
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
                  <span
                    className="inline-block text-[10px] font-bengali px-1.5 py-0.5 rounded-full mb-1 text-white"
                    style={{ background: accentColor }}
                  >
                    {member.role}
                  </span>
                  {member.ssc_batch && (
                    <p className="font-bengali text-[10px] text-muted-foreground">{member.ssc_batch} ব্যাচ</p>
                  )}
                  <div className="flex items-center justify-center gap-1.5 mt-1">
                    {member.phone && (
                      <a href={`tel:${member.phone}`} className="p-1 rounded-full transition" style={{ background: 'hsl(170 65% 42% / 0.15)', color: 'hsl(170 65% 35%)' }} title={member.phone}>
                        <Phone className="w-2.5 h-2.5" />
                      </a>
                    )}
                    {member.facebook_url && (
                      <a href={member.facebook_url} target="_blank" rel="noopener noreferrer" className="p-1 rounded-full transition" style={{ background: 'hsl(270 55% 45% / 0.15)', color: 'hsl(270 55% 40%)' }}>
                        <Facebook className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
