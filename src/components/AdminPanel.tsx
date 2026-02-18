import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { JoiningRequest } from "@/lib/supabase";
import { Check, X, LogOut, RefreshCw, Eye, Users, Clock, CheckCircle, CreditCard, UserCheck, Plus, Trash2, Edit2, Save } from "lucide-react";
import { Session } from "@supabase/supabase-js";

interface PaymentMethod {
  id: string;
  name: string;
  number: string;
  type: string;
  icon: string;
  instruction: string;
  is_active: boolean;
  sort_order: number;
}

interface CommitteeMember {
  id: string;
  name: string;
  role: string;
  phone?: string;
  facebook_url?: string;
  ssc_batch?: number;
  sort_order: number;
}

type AdminTab = 'requests' | 'payments' | 'committee';

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
  const [activeTab, setActiveTab] = useState<AdminTab>('requests');

  // Payment methods state
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [editingPayment, setEditingPayment] = useState<PaymentMethod | null>(null);
  const [newPayment, setNewPayment] = useState({ name: '', number: '', type: 'সেন্ড মানি', icon: '📱', instruction: '' });
  const [showAddPayment, setShowAddPayment] = useState(false);

  // Committee state
  const [committee, setCommittee] = useState<CommitteeMember[]>([]);
  const [editingMember, setEditingMember] = useState<CommitteeMember | null>(null);
  const [newMember, setNewMember] = useState({ name: '', role: '', phone: '', facebook_url: '', ssc_batch: '' });
  const [showAddMember, setShowAddMember] = useState(false);

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
    if (session && isAdmin) {
      fetchRequests();
      fetchPaymentMethods();
      fetchCommittee();
    }
  }, [session, isAdmin, filter]);

  const fetchRequests = async () => {
    setLoading(true);
    let query = supabase.from('joining_requests').select('*').order('created_at', { ascending: false });
    if (filter !== 'all') query = query.eq('status', filter);
    const { data } = await query;
    setRequests((data as JoiningRequest[]) || []);
    setLoading(false);
  };

  const fetchPaymentMethods = async () => {
    const { data } = await supabase.from('payment_methods').select('*').order('sort_order', { ascending: true });
    setPaymentMethods((data as PaymentMethod[]) || []);
  };

  const fetchCommittee = async () => {
    const { data } = await supabase.from('committee_members').select('*').order('sort_order', { ascending: true });
    setCommittee((data as CommitteeMember[]) || []);
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

  // Payment method CRUD
  const savePaymentMethod = async () => {
    if (editingPayment) {
      await supabase.from('payment_methods').update(editingPayment).eq('id', editingPayment.id);
      setEditingPayment(null);
    } else {
      await supabase.from('payment_methods').insert({ ...newPayment, sort_order: paymentMethods.length + 1 });
      setNewPayment({ name: '', number: '', type: 'সেন্ড মানি', icon: '📱', instruction: '' });
      setShowAddPayment(false);
    }
    fetchPaymentMethods();
  };

  const deletePaymentMethod = async (id: string) => {
    await supabase.from('payment_methods').delete().eq('id', id);
    fetchPaymentMethods();
  };

  const togglePaymentActive = async (m: PaymentMethod) => {
    await supabase.from('payment_methods').update({ is_active: !m.is_active }).eq('id', m.id);
    fetchPaymentMethods();
  };

  // Committee CRUD
  const saveCommitteeMember = async () => {
    if (editingMember) {
      await supabase.from('committee_members').update(editingMember).eq('id', editingMember.id);
      setEditingMember(null);
    } else {
      await supabase.from('committee_members').insert({
        ...newMember,
        ssc_batch: newMember.ssc_batch ? parseInt(newMember.ssc_batch) : null,
        sort_order: committee.length + 1,
      });
      setNewMember({ name: '', role: '', phone: '', facebook_url: '', ssc_batch: '' });
      setShowAddMember(false);
    }
    fetchCommittee();
  };

  const deleteCommitteeMember = async (id: string) => {
    await supabase.from('committee_members').delete().eq('id', id);
    fetchCommittee();
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
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, hsl(158 80% 8%) 0%, hsl(158 70% 16%) 50%, hsl(38 65% 16%) 100%)' }}>
        <div className="w-full max-w-md">
          <div className="bg-card rounded-2xl shadow-card border border-border overflow-hidden">
            <div className="bg-primary p-6 text-center">
              <p className="font-display text-xl font-bold text-primary-foreground">Admin Panel</p>
              <p className="font-bengali text-primary-foreground/70 text-sm mt-1">খেপুপাড়া হাইস্কুলিয়ান ইফতার ২০২৬</p>
            </div>
            <form onSubmit={handleLogin} className="p-6 space-y-4">
              <div>
                <label className="font-bengali text-sm font-medium text-foreground mb-2 block">ইমেইল</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@gmail.com"
                  className="w-full border border-border rounded-xl px-4 py-3 font-bengali-sans text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition" />
              </div>
              <div>
                <label className="font-bengali text-sm font-medium text-foreground mb-2 block">পাসওয়ার্ড</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                  className="w-full border border-border rounded-xl px-4 py-3 font-bengali-sans text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition" />
              </div>
              {loginError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                  <p className="font-bengali text-sm text-red-600">{loginError}</p>
                </div>
              )}
              <button type="submit" disabled={loginLoading}
                className="w-full py-3 rounded-xl font-bengali font-bold text-primary-foreground bg-primary hover:opacity-90 transition disabled:opacity-50">
                {loginLoading ? 'লগইন হচ্ছে...' : 'লগইন করুন'}
              </button>
            </form>
          </div>
          <p className="text-center mt-4 text-emerald-200 font-bengali text-sm opacity-70">শুধুমাত্র অ্যাডমিনের জন্য</p>
        </div>
      </div>
    );
  }

  const pendingCount = requests.filter(r => r.status === 'pending').length;

  const inputCls = "w-full border border-border rounded-xl px-3 py-2 text-sm text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition font-bengali";

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
            <button onClick={() => { fetchRequests(); fetchPaymentMethods(); fetchCommittee(); }} className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button onClick={handleLogout} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg font-bengali text-sm transition">
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:block">লগআউট</span>
            </button>
          </div>
        </div>
        {/* Tabs */}
        <div className="container mx-auto px-4 flex gap-1 pb-2">
          {([
            { key: 'requests', label: 'রিকুয়েস্ট', icon: Users },
            { key: 'payments', label: 'পেমেন্ট', icon: CreditCard },
            { key: 'committee', label: 'কমিটি', icon: UserCheck },
          ] as const).map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bengali transition ${activeTab === tab.key ? 'bg-white/20 text-white' : 'text-white/60 hover:bg-white/10'}`}>
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
              {tab.key === 'requests' && pendingCount > 0 && (
                <span className="bg-amber-400 text-amber-900 text-xs px-1.5 rounded-full font-bold">{pendingCount}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">

        {/* ===== REQUESTS TAB ===== */}
        {activeTab === 'requests' && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'মোট', value: requests.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
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

            <div className="flex gap-2 mb-6 flex-wrap">
              {(['all', 'pending', 'approved', 'rejected'] as const).map(f => {
                const labels = { all: 'সব', pending: 'অপেক্ষারত', approved: 'অনুমোদিত', rejected: 'বাতিল' };
                return (
                  <button key={f} onClick={() => setFilter(f)}
                    className={`px-4 py-2 rounded-full font-bengali text-sm font-medium transition ${filter === f ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-muted-foreground hover:border-primary/50'}`}>
                    {labels[f]}
                  </button>
                );
              })}
            </div>

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
                      {req.photo_url ? (
                        <img src={req.photo_url} alt={req.name} className="w-14 h-14 rounded-full object-cover border-2 border-primary/20 flex-shrink-0" />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-xl font-bold text-primary font-bengali">{req.name.charAt(0)}</span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 flex-wrap">
                          <div>
                            <h3 className="font-bengali font-bold text-lg text-foreground">{req.name}</h3>
                            <div className="flex items-center gap-2 flex-wrap mt-1">
                              <span className="bg-primary/10 text-primary text-xs font-bengali px-2 py-0.5 rounded-full">{req.ssc_batch} ব্যাচ</span>
                              {statusBadge(req.status)}
                            </div>
                          </div>
                          {req.status === 'pending' && (
                            <div className="flex items-center gap-2">
                              <button onClick={() => updateStatus(req.id, 'approved')}
                                className="flex items-center gap-1 bg-green-100 text-green-700 border border-green-200 px-3 py-1.5 rounded-lg font-bengali text-sm hover:bg-green-200 transition">
                                <Check className="w-4 h-4" /><span>অনুমোদন</span>
                              </button>
                              <button onClick={() => updateStatus(req.id, 'rejected')}
                                className="flex items-center gap-1 bg-red-50 text-red-600 border border-red-200 px-3 py-1.5 rounded-lg font-bengali text-sm hover:bg-red-100 transition">
                                <X className="w-4 h-4" /><span>বাতিল</span>
                              </button>
                            </div>
                          )}
                        </div>
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
                        <p className="text-xs text-muted-foreground font-bengali-sans mt-2">{new Date(req.created_at).toLocaleString('bn-BD')}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ===== PAYMENTS TAB ===== */}
        {activeTab === 'payments' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bengali text-xl font-bold text-foreground">পেমেন্ট পদ্ধতি</h2>
              <button onClick={() => setShowAddPayment(!showAddPayment)}
                className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl font-bengali text-sm hover:opacity-90 transition">
                <Plus className="w-4 h-4" />যোগ করুন
              </button>
            </div>

            {showAddPayment && (
              <div className="bg-card rounded-2xl border border-border p-5 mb-6 space-y-3">
                <h3 className="font-bengali font-bold text-foreground">নতুন পেমেন্ট পদ্ধতি</h3>
                <div className="grid grid-cols-2 gap-3">
                  <input className={inputCls} placeholder="নাম (যেমন: বিকাশ)" value={newPayment.name} onChange={e => setNewPayment({...newPayment, name: e.target.value})} />
                  <input className={inputCls} placeholder="আইকন (emoji)" value={newPayment.icon} onChange={e => setNewPayment({...newPayment, icon: e.target.value})} />
                  <input className={inputCls} placeholder="নম্বর" value={newPayment.number} onChange={e => setNewPayment({...newPayment, number: e.target.value})} />
                  <input className={inputCls} placeholder="ধরন (যেমন: সেন্ড মানি)" value={newPayment.type} onChange={e => setNewPayment({...newPayment, type: e.target.value})} />
                </div>
                <textarea className={inputCls + " h-20 resize-none"} placeholder="নির্দেশনা → ধাপ → পরবর্তী ধাপ" value={newPayment.instruction} onChange={e => setNewPayment({...newPayment, instruction: e.target.value})} />
                <div className="flex gap-2">
                  <button onClick={savePaymentMethod} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl font-bengali text-sm hover:opacity-90 transition">
                    <Save className="w-4 h-4" />সংরক্ষণ
                  </button>
                  <button onClick={() => setShowAddPayment(false)} className="px-4 py-2 rounded-xl font-bengali text-sm border border-border text-muted-foreground hover:bg-muted transition">বাতিল</button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {paymentMethods.map(m => (
                <div key={m.id} className="bg-card rounded-2xl border border-border p-4">
                  {editingPayment?.id === m.id ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <input className={inputCls} value={editingPayment.name} onChange={e => setEditingPayment({...editingPayment, name: e.target.value})} />
                        <input className={inputCls} value={editingPayment.icon} onChange={e => setEditingPayment({...editingPayment, icon: e.target.value})} />
                        <input className={inputCls} value={editingPayment.number} onChange={e => setEditingPayment({...editingPayment, number: e.target.value})} />
                        <input className={inputCls} value={editingPayment.type} onChange={e => setEditingPayment({...editingPayment, type: e.target.value})} />
                      </div>
                      <textarea className={inputCls + " h-20 resize-none"} value={editingPayment.instruction} onChange={e => setEditingPayment({...editingPayment, instruction: e.target.value})} />
                      <div className="flex gap-2">
                        <button onClick={savePaymentMethod} className="flex items-center gap-2 bg-primary text-primary-foreground px-3 py-1.5 rounded-lg font-bengali text-sm hover:opacity-90 transition">
                          <Save className="w-3.5 h-3.5" />সংরক্ষণ
                        </button>
                        <button onClick={() => setEditingPayment(null)} className="px-3 py-1.5 rounded-lg font-bengali text-sm border border-border text-muted-foreground hover:bg-muted transition">বাতিল</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{m.icon}</span>
                      <div className="flex-1">
                        <p className="font-bengali font-bold text-foreground">{m.name} <span className="text-xs text-muted-foreground">({m.type})</span></p>
                        <p className="font-bengali-sans text-sm text-muted-foreground">{m.number}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => togglePaymentActive(m)}
                          className={`px-2 py-1 rounded-lg text-xs font-bengali transition ${m.is_active ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`}>
                          {m.is_active ? 'সক্রিয়' : 'বন্ধ'}
                        </button>
                        <button onClick={() => setEditingPayment(m)} className="p-1.5 rounded-lg bg-muted hover:bg-border transition">
                          <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
                        </button>
                        <button onClick={() => deletePaymentMethod(m.id)} className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 transition">
                          <Trash2 className="w-3.5 h-3.5 text-red-500" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===== COMMITTEE TAB ===== */}
        {activeTab === 'committee' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bengali text-xl font-bold text-foreground">আয়োজক কমিটি</h2>
              <button onClick={() => setShowAddMember(!showAddMember)}
                className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl font-bengali text-sm hover:opacity-90 transition">
                <Plus className="w-4 h-4" />যোগ করুন
              </button>
            </div>

            {showAddMember && (
              <div className="bg-card rounded-2xl border border-border p-5 mb-6 space-y-3">
                <h3 className="font-bengali font-bold text-foreground">নতুন সদস্য</h3>
                <div className="grid grid-cols-2 gap-3">
                  <input className={inputCls} placeholder="নাম" value={newMember.name} onChange={e => setNewMember({...newMember, name: e.target.value})} />
                  <input className={inputCls} placeholder="পদবি (যেমন: সভাপতি)" value={newMember.role} onChange={e => setNewMember({...newMember, role: e.target.value})} />
                  <input className={inputCls} placeholder="মোবাইল নম্বর" value={newMember.phone} onChange={e => setNewMember({...newMember, phone: e.target.value})} />
                  <input className={inputCls} placeholder="SSC ব্যাচ (বছর)" value={newMember.ssc_batch} onChange={e => setNewMember({...newMember, ssc_batch: e.target.value})} />
                  <input className={inputCls + " col-span-2"} placeholder="Facebook URL (ঐচ্ছিক)" value={newMember.facebook_url} onChange={e => setNewMember({...newMember, facebook_url: e.target.value})} />
                </div>
                <div className="flex gap-2">
                  <button onClick={saveCommitteeMember} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl font-bengali text-sm hover:opacity-90 transition">
                    <Save className="w-4 h-4" />সংরক্ষণ
                  </button>
                  <button onClick={() => setShowAddMember(false)} className="px-4 py-2 rounded-xl font-bengali text-sm border border-border text-muted-foreground hover:bg-muted transition">বাতিল</button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {committee.map(m => (
                <div key={m.id} className="bg-card rounded-2xl border border-border p-4">
                  {editingMember?.id === m.id ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <input className={inputCls} value={editingMember.name} onChange={e => setEditingMember({...editingMember, name: e.target.value})} />
                        <input className={inputCls} value={editingMember.role} onChange={e => setEditingMember({...editingMember, role: e.target.value})} />
                        <input className={inputCls} value={editingMember.phone || ''} onChange={e => setEditingMember({...editingMember, phone: e.target.value})} placeholder="মোবাইল" />
                        <input className={inputCls} value={editingMember.ssc_batch?.toString() || ''} onChange={e => setEditingMember({...editingMember, ssc_batch: parseInt(e.target.value) || undefined})} placeholder="ব্যাচ" />
                        <input className={inputCls + " col-span-2"} value={editingMember.facebook_url || ''} onChange={e => setEditingMember({...editingMember, facebook_url: e.target.value})} placeholder="Facebook URL" />
                      </div>
                      <div className="flex gap-2">
                        <button onClick={saveCommitteeMember} className="flex items-center gap-2 bg-primary text-primary-foreground px-3 py-1.5 rounded-lg font-bengali text-sm hover:opacity-90 transition">
                          <Save className="w-3.5 h-3.5" />সংরক্ষণ
                        </button>
                        <button onClick={() => setEditingMember(null)} className="px-3 py-1.5 rounded-lg font-bengali text-sm border border-border text-muted-foreground hover:bg-muted transition">বাতিল</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="font-bold text-primary font-bengali">{m.name.charAt(0)}</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-bengali font-bold text-foreground">{m.name}</p>
                        <p className="font-bengali text-sm text-muted-foreground">{m.role}{m.ssc_batch ? ` · ${m.ssc_batch} ব্যাচ` : ''}</p>
                        {m.phone && <p className="font-bengali-sans text-xs text-muted-foreground">{m.phone}</p>}
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => setEditingMember(m)} className="p-1.5 rounded-lg bg-muted hover:bg-border transition">
                          <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
                        </button>
                        <button onClick={() => deleteCommitteeMember(m.id)} className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 transition">
                          <Trash2 className="w-3.5 h-3.5 text-red-500" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {committee.length === 0 && (
                <div className="text-center py-12">
                  <UserCheck className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="font-bengali text-muted-foreground">কোনো সদস্য যোগ করা হয়নি</p>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
