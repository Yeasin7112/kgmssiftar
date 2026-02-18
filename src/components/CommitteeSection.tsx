import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Facebook, Phone, Users } from "lucide-react";

interface CommitteeMember {
  id: string;
  name: string;
  role: string;
  phone?: string;
  facebook_url?: string;
  photo_url?: string;
  ssc_batch?: number;
  sort_order: number;
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
    <section className="py-16 bg-muted/30" id="committee">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <div className="ornament-divider mb-4 max-w-sm mx-auto">
            <span className="text-gold text-xl">✦</span>
            <span className="text-primary font-display text-sm tracking-widest uppercase">Committee</span>
            <span className="text-gold text-xl">✦</span>
          </div>
          <h2 className="font-bengali text-3xl md:text-4xl font-bold text-primary mb-3">
            আয়োজক কমিটি
          </h2>
          <p className="font-bengali text-muted-foreground">
            যারা এই ইফতার আয়োজন করছেন
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <Users className="w-10 h-10 text-primary mx-auto animate-pulse" />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 max-w-5xl mx-auto">
            {members.map((member) => (
              <div
                key={member.id}
                className="bg-card rounded-2xl border border-border shadow-card p-4 text-center hover:shadow-gold transition-all hover:-translate-y-1 duration-300"
              >
                {member.photo_url ? (
                  <img
                    src={member.photo_url}
                    alt={member.name}
                    className="w-16 h-16 rounded-full object-cover mx-auto mb-3 border-2 border-primary/30"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl font-bold text-primary font-bengali">
                      {member.name.charAt(0)}
                    </span>
                  </div>
                )}
                <p className="font-bengali font-bold text-sm text-foreground mb-1 leading-tight">{member.name}</p>
                <span className="inline-block bg-primary/10 text-primary text-xs font-bengali px-2 py-0.5 rounded-full mb-2">
                  {member.role}
                </span>
                {member.ssc_batch && (
                  <p className="font-bengali text-xs text-muted-foreground mb-2">{member.ssc_batch} ব্যাচ</p>
                )}
                <div className="flex items-center justify-center gap-2 mt-1">
                  {member.phone && (
                    <a
                      href={`tel:${member.phone}`}
                      className="p-1.5 rounded-full bg-green-100 text-green-700 hover:bg-green-200 transition"
                      title={member.phone}
                    >
                      <Phone className="w-3 h-3" />
                    </a>
                  )}
                  {member.facebook_url && (
                    <a
                      href={member.facebook_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 transition"
                    >
                      <Facebook className="w-3 h-3" />
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
