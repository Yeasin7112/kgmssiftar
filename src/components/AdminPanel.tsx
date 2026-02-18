import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { JoiningRequest } from "@/lib/supabase";
import { Check, X, LogOut, RefreshCw, Eye, Users, Clock, CheckCircle } from "lucide-react";
import { Session } from "@supabase/supabase-js";

export default function AdminPanel() {
  const [session, setSession] = useState<Session | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [requests, setRequests] = useState<JoiningRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    supabase.auth.onAuthStateChange((_, s) => {
      setSession(s);
      if (s) checkAdmin(s.user.id);
    });
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      if (s) checkAdmin(s.user.id);
    });
  }, []);

  const checkAdmin = async (userId: string) => {
    const { data } = await supabase.from('user_roles').select('role').eq('user_id', userId).single();
    setIsAdmin(data?.role === 'admin');
  };

  useEffect(() => {
    if (session && isAdmin) fetchRequests();
  }, [session, isAdmin, filter]);

  const fetchRequests = async () => {
    setLoading(true);
    let query = supabase.from('joining_requests').select('*').order('created_at', { ascending: false });
    if (filter !== 'all') query = query.eq('status', filter);
    const { data } = await query;
    setRequests((data as JoiningRequest[]) || []);
    setLoading(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setLoginError('ইমেইল বা পাসওয়ার্ড ভুল');
    setLoginLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAdmin(false);
  };

  const updateStatus = async (id: string, status: 'approved' | 'rejected') => {
    await supabase.from('joining_requests').update({ status }).eq('id', id);
    fetchRequests();
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      pending: 'bg-amber-100 text-amber-700 border-amber-200',
      approved: 'bg-green-100 text-green-700 border-green-200',
      rejected: 'bg-red-100 text-red-600 border-red-200',
    };
    const label: Record<string, string> = { pending: 'অপেক্ষারত', approved: 'অনুমোদিত', rejected: 'বাতিল' };
    return <span className={`px-2 py-0.5 rounded-full border text-xs font-bengali ${map[status]}`}>{label[status]}</span>;
  };

  if (!session || !isAdmin) {
    return (
      <div className="min-h-screen gradient-hero islamic-pattern flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-card rounded-2xl shadow-card border border-border overflow-hidden">
            <div className="bg-primary p-6 text-center">
              <p className="font-display text-xl font-bold text-primary-foreground">Admin Panel</p>
              <p className="font-bengali text-primary-foreground/70 text-sm mt-1">খেপুপাড়া হাইস্কুলিয়ান ইফতার ২০২৬</p>
            </div>
            <form onSubmit={handleLogin} className="p-6 space-y-4">
              <div>
                <label className="font-bengali text-sm font-medium text-foreground mb-2 block">ইমেইল</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@gmail.com"
                  className="w-full border border-border rounded-xl px-4 py-3 font-bengali-sans text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
                />
              </div>
              <div>
                <label className="font-bengali text-sm font-medium text-foreground mb-2 block">পাসওয়ার্ড</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full border border-border rounded-xl px-4 py-3 font-bengali-sans text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
                />
              </div>
              {loginError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                  <p className="font-bengali text-sm text-red-600">{loginError}</p>
                </div>
              )}
              <button
                type="submit"
                disabled={loginLoading}
                className="w-full py-3 rounded-xl font-bengali font-bold text-primary-foreground bg-primary hover:opacity-90 transition disabled:opacity-50"
              >
                {loginLoading ? 'লগইন হচ্ছে...' : 'লগইন করুন'}
              </button>
            </form>
          </div>
          <p className="text-center mt-4 text-emerald-200 font-bengali text-sm opacity-70">
            শুধুমাত্র অ্যাডমিনের জন্য
          </p>
        </div>
      </div>
    );
  }

  const pendingCount = requests.filter(r => r.status === 'pending').length;

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <div className="bg-primary text-primary-foreground sticky top-0 z-50 shadow-md">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <p className="font-display font-bold text-lg">Admin Panel</p>
            <p className="font-bengali text-primary-foreground/70 text-xs">খেপুপাড়া ইফতার ২০২৬</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={fetchRequests} className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button onClick={handleLogout} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg font-bengali text-sm transition">
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:block">লগআউট</span>
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'মোট রিকুয়েস্ট', value: requests.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'অপেক্ষারত', value: pendingCount, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'অনুমোদিত', value: requests.filter(r => r.status === 'approved').length, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'বাতিল', value: requests.filter(r => r.status === 'rejected').length, icon: X, color: 'text-red-600', bg: 'bg-red-50' },
          ].map(stat => (
            <div key={stat.label} className="bg-card rounded-2xl border border-border shadow-card p-4">
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <p className="font-display text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="font-bengali text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {(['all', 'pending', 'approved', 'rejected'] as const).map(f => {
            const labels = { all: 'সব', pending: 'অপেক্ষারত', approved: 'অনুমোদিত', rejected: 'বাতিল' };
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-full font-bengali text-sm font-medium transition ${
                  filter === f ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-muted-foreground hover:border-primary/50'
                }`}
              >
                {labels[f]}
              </button>
            );
          })}
        </div>

        {/* Requests List */}
        {loading ? (
          <div className="text-center py-12">
            <RefreshCw className="w-8 h-8 text-primary mx-auto animate-spin mb-3" />
            <p className="font-bengali text-muted-foreground">লোড হচ্ছে...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-12">
            <Eye className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="font-bengali text-muted-foreground">কোনো রিকুয়েস্ট নেই</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map(req => (
              <div key={req.id} className="bg-card rounded-2xl border border-border shadow-card p-4 md:p-5">
                <div className="flex items-start gap-4">
                  {/* Photo */}
                  {req.photo_url ? (
                    <img src={req.photo_url} alt={req.name} className="w-14 h-14 rounded-full object-cover border-2 border-primary/20 flex-shrink-0" />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-xl font-bold text-primary font-bengali">{req.name.charAt(0)}</span>
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div>
                        <h3 className="font-bengali font-bold text-lg text-foreground">{req.name}</h3>
                        <div className="flex items-center gap-2 flex-wrap mt-1">
                          <span className="bg-primary/10 text-primary text-xs font-bengali px-2 py-0.5 rounded-full">
                            {req.ssc_batch} ব্যাচ
                          </span>
                          {statusBadge(req.status)}
                        </div>
                      </div>
                      {/* Actions */}
                      {req.status === 'pending' && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateStatus(req.id, 'approved')}
                            className="flex items-center gap-1 bg-green-100 text-green-700 border border-green-200 px-3 py-1.5 rounded-lg font-bengali text-sm hover:bg-green-200 transition"
                          >
                            <Check className="w-4 h-4" />
                            <span>অনুমোদন</span>
                          </button>
                          <button
                            onClick={() => updateStatus(req.id, 'rejected')}
                            className="flex items-center gap-1 bg-red-50 text-red-600 border border-red-200 px-3 py-1.5 rounded-lg font-bengali text-sm hover:bg-red-100 transition"
                          >
                            <X className="w-4 h-4" />
                            <span>বাতিল</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Payment Details */}
                    <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                      <div className="bg-muted/50 rounded-lg px-3 py-2">
                        <p className="text-xs font-bengali text-muted-foreground">পেমেন্ট</p>
                        <p className="font-bengali font-semibold text-foreground">৳{req.payment_amount}</p>
                      </div>
                      <div className="bg-muted/50 rounded-lg px-3 py-2">
                        <p className="text-xs font-bengali text-muted-foreground">মাধ্যম</p>
                        <p className="font-bengali font-semibold text-foreground capitalize">{req.payment_method}</p>
                      </div>
                      {req.payment_number && (
                        <div className="bg-muted/50 rounded-lg px-3 py-2">
                          <p className="text-xs font-bengali text-muted-foreground">নম্বর</p>
                          <p className="font-bengali-sans font-semibold text-foreground text-xs">{req.payment_number}</p>
                        </div>
                      )}
                      {req.transaction_id && (
                        <div className="bg-muted/50 rounded-lg px-3 py-2">
                          <p className="text-xs font-bengali text-muted-foreground">TxnID</p>
                          <p className="font-bengali-sans font-semibold text-foreground text-xs truncate">{req.transaction_id}</p>
                        </div>
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground font-bengali-sans mt-2">
                      {new Date(req.created_at).toLocaleString('bn-BD')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
