import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import type { JoiningRequest } from "@/lib/supabase";
import { Check, X, LogOut, RefreshCw, Eye, Users, Clock, CheckCircle, CreditCard, UserCheck, Plus, Trash2, Edit2, Save, Upload, UserPlus, Printer, Download, Image as ImageIcon, Camera, Pin, Shield } from "lucide-react";
import { Session } from "@supabase/supabase-js";

interface PaymentMethod {
  id: string;
  name: string;
  number: string;
  type: string;
  icon: string;
  instruction: string;
  warning: string;
  is_active: boolean;
  sort_order: number;
}

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

type AdminTab = 'requests' | 'payments' | 'committee' | 'members' | 'print' | 'gallery' | 'admins';

interface EventPhoto {
  id: string;
  photo_url: string;
  caption?: string;
  event_year?: number;
  sort_order: number;
  created_at: string;
}

export default function AdminPanel() {
  const [session, setSession] = useState<Session | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [requests, setRequests] = useState<JoiningRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTab>('requests');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Admin management state (super admin only)
  const [adminsList, setAdminsList] = useState<{id: string; email: string; user_id: string}[]>([]);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [adminActionLoading, setAdminActionLoading] = useState(false);
  const [adminActionMsg, setAdminActionMsg] = useState('');

  // Payment methods state
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [editingPayment, setEditingPayment] = useState<PaymentMethod | null>(null);
  const [newPayment, setNewPayment] = useState({ name: '', number: '', type: 'সেন্ড মানি', icon: '📱', instruction: '', warning: '' });
  const [showAddPayment, setShowAddPayment] = useState(false);

  // Committee state
  const [committee, setCommittee] = useState<CommitteeMember[]>([]);
  const [editingMember, setEditingMember] = useState<CommitteeMember | null>(null);
  const [newMember, setNewMember] = useState({ name: '', role: '', phone: '', facebook_url: '', ssc_batch: '', photo_url: '' });
  const [showAddMember, setShowAddMember] = useState(false);
  const [memberPhotoFile, setMemberPhotoFile] = useState<File | null>(null);
  const [memberPhotoPreview, setMemberPhotoPreview] = useState('');
  const [editMemberPhotoFile, setEditMemberPhotoFile] = useState<File | null>(null);
  const [editMemberPhotoPreview, setEditMemberPhotoPreview] = useState('');
  const memberPhotoRef = useRef<HTMLInputElement>(null);
  const editMemberPhotoRef = useRef<HTMLInputElement>(null);

  // Manual participant state
  const [newParticipant, setNewParticipant] = useState({ name: '', ssc_batch: '', payment_amount: '100', mobile_number: '' });
  const [participantPhotoFile, setParticipantPhotoFile] = useState<File | null>(null);
  const [participantPhotoPreview, setParticipantPhotoPreview] = useState('');
  const [participantSaving, setParticipantSaving] = useState(false);
  const [participantError, setParticipantError] = useState('');
  const [participantSuccess, setParticipantSuccess] = useState('');
  const participantPhotoRef = useRef<HTMLInputElement>(null);
  const sscBatches = Array.from({ length: 2026 - 1960 + 1 }, (_, i) => 2026 - i);

  // Print list state
  const [approvedList, setApprovedList] = useState<JoiningRequest[]>([]);
  const [printLoading, setPrintLoading] = useState(false);
  const [printBatchFilter, setPrintBatchFilter] = useState<string>('all');

  // Gallery state
  const [eventPhotos, setEventPhotos] = useState<EventPhoto[]>([]);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [galleryUploading, setGalleryUploading] = useState(false);
  const [galleryCaption, setGalleryCaption] = useState('');
  const [galleryYear, setGalleryYear] = useState('');
  const [galleryFile, setGalleryFile] = useState<File | null>(null);
  const [galleryPreview, setGalleryPreview] = useState('');
  const galleryFileRef = useRef<HTMLInputElement>(null);

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
    const adminOk = data?.role === 'admin';
    setIsAdmin(adminOk);
    if (adminOk) {
      // Super admin is admin@gmail.com
      const { data: { user } } = await supabase.auth.getUser();
      setIsSuperAdmin(user?.email === 'admin@gmail.com');
    }
  };

  useEffect(() => {
    if (session && isAdmin) {
      fetchRequests();
      fetchPaymentMethods();
      fetchCommittee();
      fetchApprovedList();
      fetchEventPhotos();
      if (isSuperAdmin) fetchAdminsList();
    }
  }, [session, isAdmin, isSuperAdmin, filter]);

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

  const fetchApprovedList = async () => {
    setPrintLoading(true);
    const { data } = await supabase
      .from('joining_requests')
      .select('*')
      .eq('status', 'approved')
      .order('ssc_batch', { ascending: false });
    setApprovedList((data as JoiningRequest[]) || []);
    setPrintLoading(false);
  };

  const fetchEventPhotos = async () => {
    setGalleryLoading(true);
    const { data } = await supabase.from('event_photos').select('*').order('sort_order', { ascending: true });
    setEventPhotos((data as EventPhoto[]) || []);
    setGalleryLoading(false);
  };

  const fetchAdminsList = async () => {
    try {
      const session = (await supabase.auth.getSession()).data.session;
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-admins`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ action: 'list' }),
      });
      const result = await res.json();
      setAdminsList(result.admins || []);
    } catch {
      setAdminsList([]);
    }
  };

  const handleGalleryFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => { setGalleryFile(file); setGalleryPreview(reader.result as string); };
    reader.readAsDataURL(file);
  };

  const uploadEventPhoto = async () => {
    if (!galleryFile) return;
    setGalleryUploading(true);
    try {
      const ext = galleryFile.name.split('.').pop();
      const fileName = `event-photo-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from('event-photos').upload(fileName, galleryFile);
      if (upErr) throw upErr;
      const { data: { publicUrl } } = supabase.storage.from('event-photos').getPublicUrl(fileName);
      await supabase.from('event_photos').insert({
        photo_url: publicUrl,
        caption: galleryCaption || null,
        event_year: galleryYear ? parseInt(galleryYear) : null,
        sort_order: eventPhotos.length + 1,
      });
      setGalleryFile(null);
      setGalleryPreview('');
      setGalleryCaption('');
      setGalleryYear('');
      fetchEventPhotos();
    } catch (err) {
      console.error(err);
    } finally {
      setGalleryUploading(false);
    }
  };

  const deleteEventPhoto = async (id: string, photoUrl: string) => {
    if (!window.confirm('এই ছবি মুছে ফেলবেন?')) return;
    const fileName = photoUrl.split('/').pop();
    if (fileName) await supabase.storage.from('event-photos').remove([fileName]);
    await supabase.from('event_photos').delete().eq('id', id);
    fetchEventPhotos();
  };

  const downloadCSV = (list: JoiningRequest[]) => {
    const header = 'ক্রমিক,নাম,মোবাইল,ব্যাচ,পেমেন্ট পদ্ধতি,পরিমাণ (৳),তারিখ';
    const rows = list.map((r, i) => {
      const mobile = (r as JoiningRequest & { mobile_number?: string }).mobile_number || '';
      return `${i + 1},"${r.name}","${mobile}",${r.ssc_batch},"${r.payment_method}",${r.payment_amount},"${new Date(r.created_at).toLocaleDateString('bn-BD')}"`;
    });
    const csv = '\uFEFF' + [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `iftar-list-${printBatchFilter === 'all' ? 'all' : printBatchFilter + '-batch'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const printList = (list: JoiningRequest[]) => {
    const batches = printBatchFilter === 'all'
      ? [...new Set(list.map(r => r.ssc_batch))].sort((a, b) => b - a)
      : [parseInt(printBatchFilter)];

    const groupedHTML = batches.map(batch => {
      const members = list.filter(r => r.ssc_batch === batch);
      const rows = members.map((r, i) => {
        const mobile = (r as JoiningRequest & { mobile_number?: string }).mobile_number || '—';
        return `
        <tr>
          <td style="padding:6px 10px;border:1px solid #ccc;text-align:center;">${i + 1}</td>
          <td style="padding:6px 10px;border:1px solid #ccc;">${r.name}</td>
          <td style="padding:6px 10px;border:1px solid #ccc;text-align:center;">${mobile}</td>
          <td style="padding:6px 10px;border:1px solid #ccc;text-align:center;">${r.payment_method}</td>
          <td style="padding:6px 10px;border:1px solid #ccc;text-align:center;">৳${r.payment_amount}</td>
          <td style="padding:6px 10px;border:1px solid #ccc;"></td>
        </tr>`;
      }).join('');
      return `
        <div style="margin-bottom:32px;page-break-inside:avoid;">
          <h3 style="background:#1a4731;color:#f5c842;padding:8px 16px;margin:0 0 0 0;font-size:16px;border-radius:4px 4px 0 0;">
            ${batch} ব্যাচ — মোট: ${members.length} জন
          </h3>
          <table style="width:100%;border-collapse:collapse;font-size:13px;">
            <thead>
              <tr style="background:#f0f0f0;">
                <th style="padding:6px 10px;border:1px solid #ccc;width:40px;">ক্রমিক</th>
                <th style="padding:6px 10px;border:1px solid #ccc;text-align:left;">নাম</th>
                <th style="padding:6px 10px;border:1px solid #ccc;width:110px;">মোবাইল</th>
                <th style="padding:6px 10px;border:1px solid #ccc;width:100px;">পেমেন্ট</th>
                <th style="padding:6px 10px;border:1px solid #ccc;width:80px;">পরিমাণ</th>
                <th style="padding:6px 10px;border:1px solid #ccc;width:80px;">স্বাক্ষর</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>`;
    }).join('');

    const totalAmount = list.reduce((s, r) => s + Number(r.payment_amount), 0);
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>ইফতার ২০২৬ — অংশগ্রহণকারী তালিকা</title>
  <style>
    body { font-family: 'SolaimanLipi', Arial, sans-serif; margin: 20px; color: #111; }
    @media print { body { margin: 10px; } }
    h1 { text-align:center; color:#1a4731; margin-bottom:4px; font-size:20px; }
    .meta { text-align:center; color:#666; font-size:13px; margin-bottom:24px; }
    .summary { display:flex; gap:24px; justify-content:center; margin-bottom:24px; background:#f9f9f9; padding:12px; border-radius:8px; }
    .summary div { text-align:center; }
    .summary strong { display:block; font-size:18px; color:#1a4731; }
  </style>
</head>
<body>
  <h1>🌙 খেপুপাড়া হাইস্কুলিয়ান ইফতার মাহফিল ২০২৬</h1>
  <p class="meta">২৮শে রমজান · ১৮ই মার্চ ২০২৬ · খেপুপাড়া সরকারি মডেল মাধ্যমিক বিদ্যালয়</p>
  <div class="summary">
    <div><strong>${list.length} জন</strong>মোট অংশগ্রহণকারী</div>
    <div><strong>৳${totalAmount}</strong>মোট সংগ্রহ</div>
    <div><strong>${printBatchFilter === 'all' ? batches.length + 'টি' : printBatchFilter}</strong>${printBatchFilter === 'all' ? 'ব্যাচ' : 'ব্যাচ'}</div>
  </div>
  ${groupedHTML}
  <p style="text-align:right;font-size:11px;color:#999;margin-top:24px;">মুদ্রণের তারিখ: ${new Date().toLocaleDateString('bn-BD')}</p>
</body>
</html>`);
    printWindow.document.close();
    printWindow.print();
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
    fetchApprovedList();
  };

  const deleteRequest = async (id: string) => {
    if (!window.confirm('এই সদস্যকে তালিকা থেকে মুছে ফেলবেন?')) return;
    setDeletingId(id);
    await supabase.from('joining_requests').delete().eq('id', id);
    setDeletingId(null);
    fetchRequests();
    fetchApprovedList();
  };

  // Payment method CRUD
  const savePaymentMethod = async () => {
    if (editingPayment) {
      await supabase.from('payment_methods').update(editingPayment).eq('id', editingPayment.id);
      setEditingPayment(null);
    } else {
      await supabase.from('payment_methods').insert({ ...newPayment, sort_order: paymentMethods.length + 1 });
      setNewPayment({ name: '', number: '', type: 'সেন্ড মানি', icon: '📱', instruction: '', warning: '' });
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

  // Upload photo helper
  const uploadPhoto = async (file: File, prefix = 'photo'): Promise<string> => {
    const ext = file.name.split('.').pop();
    const fileName = `${prefix}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('participant-photos').upload(fileName, file);
    if (error) throw error;
    const { data: { publicUrl } } = supabase.storage.from('participant-photos').getPublicUrl(fileName);
    return publicUrl;
  };

  // Committee CRUD
  const saveCommitteeMember = async () => {
    let photoUrl = newMember.photo_url;
    if (memberPhotoFile) photoUrl = await uploadPhoto(memberPhotoFile, 'committee');

    if (editingMember) {
      let editPhotoUrl: string | undefined = editingMember.photo_url;
      if (editMemberPhotoFile) editPhotoUrl = await uploadPhoto(editMemberPhotoFile, 'committee');
      const { id, sort_order: _so, ...rest } = editingMember;
      await supabase.from('committee_members').update({ ...rest, photo_url: editPhotoUrl || null }).eq('id', id);
      setEditingMember(null);
      setEditMemberPhotoFile(null);
      setEditMemberPhotoPreview('');
    } else {
      await supabase.from('committee_members').insert({
        name: newMember.name,
        role: newMember.role,
        phone: newMember.phone || null,
        facebook_url: newMember.facebook_url || null,
        ssc_batch: newMember.ssc_batch ? parseInt(newMember.ssc_batch) : null,
        photo_url: photoUrl || null,
        sort_order: committee.length + 1,
      });
      setNewMember({ name: '', role: '', phone: '', facebook_url: '', ssc_batch: '', photo_url: '' });
      setMemberPhotoFile(null);
      setMemberPhotoPreview('');
      setShowAddMember(false);
    }
    fetchCommittee();
  };

  const deleteCommitteeMember = async (id: string) => {
    await supabase.from('committee_members').delete().eq('id', id);
    fetchCommittee();
  };

  const togglePinMember = async (m: CommitteeMember) => {
    await supabase.from('committee_members').update({ is_pinned: !m.is_pinned }).eq('id', m.id);
    fetchCommittee();
  };

  const togglePinParticipant = async (req: JoiningRequest) => {
    await supabase.from('joining_requests').update({ is_pinned: !(req as JoiningRequest & { is_pinned?: boolean }).is_pinned }).eq('id', req.id);
    fetchRequests();
    fetchApprovedList();
  };

  const handleMemberPhotoChange = (e: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (isEdit) { setEditMemberPhotoFile(file); setEditMemberPhotoPreview(reader.result as string); }
      else { setMemberPhotoFile(file); setMemberPhotoPreview(reader.result as string); }
    };
    reader.readAsDataURL(file);
  };

  // Manual participant
  const handleParticipantPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setParticipantPhotoFile(file);
      setParticipantPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const saveManualParticipant = async () => {
    setParticipantError('');
    setParticipantSuccess('');
    if (!newParticipant.name.trim()) return setParticipantError('নাম দিন');
    if (!newParticipant.ssc_batch) return setParticipantError('ব্যাচ সিলেক্ট করুন');

    setParticipantSaving(true);
    try {
      let photoUrl = '';
      if (participantPhotoFile) photoUrl = await uploadPhoto(participantPhotoFile, 'manual');

      const { error } = await supabase.from('joining_requests').insert({
        name: newParticipant.name.trim(),
        ssc_batch: parseInt(newParticipant.ssc_batch),
        photo_url: photoUrl || null,
        payment_amount: parseInt(newParticipant.payment_amount) || 100,
        payment_method: 'manual',
        status: 'approved',
        added_by: session?.user?.email || null,
        mobile_number: newParticipant.mobile_number.trim() || null,
      });

      if (error) throw error;

      setParticipantSuccess(`✅ "${newParticipant.name}" সফলভাবে তালিকায় যুক্ত হয়েছে`);
      setNewParticipant({ name: '', ssc_batch: '', payment_amount: '100', mobile_number: '' });
      setParticipantPhotoFile(null);
      setParticipantPhotoPreview('');
    } catch (err: unknown) {
      setParticipantError(err instanceof Error ? err.message : 'সমস্যা হয়েছে, আবার চেষ্টা করুন');
    } finally {
      setParticipantSaving(false);
    }
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
      <div className="min-h-screen flex items-center justify-center p-4 bg-primary">
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
                  className="w-full border border-border rounded-xl px-4 py-3 text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition" />
              </div>
              <div>
                <label className="font-bengali text-sm font-medium text-foreground mb-2 block">পাসওয়ার্ড</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                  className="w-full border border-border rounded-xl px-4 py-3 text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition" />
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
          <p className="text-center mt-4 text-primary-foreground font-bengali text-sm opacity-70">শুধুমাত্র অ্যাডমিনের জন্য</p>
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
        <div className="container mx-auto px-4 flex gap-1 pb-2 overflow-x-auto">
          {([
            { key: 'requests', label: 'রিকুয়েস্ট', icon: Users },
            { key: 'members', label: 'সদস্য যোগ', icon: UserPlus },
            { key: 'payments', label: 'পেমেন্ট', icon: CreditCard },
            { key: 'committee', label: 'কমিটি', icon: UserCheck },
            { key: 'print', label: 'প্রিন্ট', icon: Printer },
            { key: 'gallery', label: 'গ্যালারি', icon: Camera },
            ...(isSuperAdmin ? [{ key: 'admins', label: 'অ্যাডমিন', icon: Shield }] : []),
          ] as const).map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key as AdminTab)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bengali transition whitespace-nowrap ${activeTab === tab.key ? 'bg-white/20 text-white' : 'text-white/60 hover:bg-white/10'}`}>
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

            {/* Payment Method Summary */}
            {(() => {
              const approved = requests.filter(r => r.status === 'approved');
              const methodMap = new Map<string, { count: number; total: number }>();
              approved.forEach(r => {
                const key = r.payment_method;
                const prev = methodMap.get(key) || { count: 0, total: 0 };
                methodMap.set(key, { count: prev.count + 1, total: prev.total + Number(r.payment_amount) });
              });
              const totalAmount = approved.reduce((s, r) => s + Number(r.payment_amount), 0);
              const methods = [...methodMap.entries()].sort((a, b) => b[1].total - a[1].total);
              if (methods.length === 0) return null;
              return (
                <div className="bg-card rounded-2xl border border-border shadow-card p-4 mb-6">
                  <p className="font-bengali text-sm font-bold text-foreground mb-3">💰 পেমেন্ট মাধ্যম অনুযায়ী সারসংক্ষেপ (অনুমোদিত)</p>
                  <div className="flex flex-wrap gap-2">
                    {methods.map(([method, { count, total }]) => (
                      <div key={method} className="bg-muted rounded-xl px-3 py-2 text-center min-w-[100px]">
                        <p className="font-bengali text-xs text-muted-foreground">{method}</p>
                        <p className="font-display text-sm font-bold text-foreground">৳{total}</p>
                        <p className="font-bengali text-[10px] text-muted-foreground">{count} জন</p>
                      </div>
                    ))}
                    <div className="bg-primary/10 rounded-xl px-3 py-2 text-center min-w-[100px] border border-primary/20">
                      <p className="font-bengali text-xs text-primary">মোট</p>
                      <p className="font-display text-sm font-bold text-primary">৳{totalAmount}</p>
                      <p className="font-bengali text-[10px] text-primary/70">{approved.length} জন</p>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Search + Filter row */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="নাম, ব্যাচ বা TxnID দিয়ে খুঁজুন..."
                  className="w-full border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm font-bengali text-foreground bg-card focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
                />
                <Eye className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                    <X className="w-4 h-4 text-muted-foreground hover:text-foreground transition" />
                  </button>
                )}
              </div>
              <div className="flex gap-2 flex-wrap">
                {(['all', 'pending', 'approved', 'rejected'] as const).map(f => {
                  const labels = { all: 'সব', pending: 'অপেক্ষারত', approved: 'অনুমোদিত', rejected: 'বাতিল' };
                  return (
                    <button key={f} onClick={() => setFilter(f)}
                      className={`px-3 py-2 rounded-full font-bengali text-sm font-medium transition whitespace-nowrap ${filter === f ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-muted-foreground hover:border-primary/50'}`}>
                      {labels[f]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Payment method filter */}
            {(() => {
              const methods = [...new Set(requests.map(r => r.payment_method))].sort();
              if (methods.length <= 1) return null;
              return (
                <div className="flex gap-2 flex-wrap mb-6">
                  <button onClick={() => setPaymentFilter('all')}
                    className={`px-3 py-1.5 rounded-full font-bengali text-xs font-medium transition ${paymentFilter === 'all' ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-muted-foreground hover:border-primary/50'}`}>
                    সব মাধ্যম
                  </button>
                  {methods.map(m => (
                    <button key={m} onClick={() => setPaymentFilter(m)}
                      className={`px-3 py-1.5 rounded-full font-bengali text-xs font-medium transition ${paymentFilter === m ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-muted-foreground hover:border-primary/50'}`}>
                      {m} ({requests.filter(r => r.payment_method === m).length})
                    </button>
                  ))}
                </div>
              );
            })()}

            {(() => {
              const filtered = requests
                .filter(r => paymentFilter === 'all' || r.payment_method === paymentFilter)
                .filter(r =>
                  r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  String(r.ssc_batch).includes(searchQuery) ||
                  (r.transaction_id || '').toLowerCase().includes(searchQuery.toLowerCase())
                );
              if (loading) return (
                <div className="text-center py-12">
                  <RefreshCw className="w-8 h-8 text-primary mx-auto animate-spin mb-3" />
                  <p className="font-bengali text-muted-foreground">লোড হচ্ছে...</p>
                </div>
              );
              if (filtered.length === 0) return (
                <div className="text-center py-12">
                  <Eye className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="font-bengali text-muted-foreground">
                    {searchQuery ? `"${searchQuery}" — কোনো ফলাফল পাওয়া যায়নি` : 'কোনো রিকুয়েস্ট নেই'}
                  </p>
                </div>
              );
              return (
                <div className="space-y-4">
                  {searchQuery && (
                    <p className="font-bengali text-sm text-muted-foreground">
                      {filtered.length}টি ফলাফল পাওয়া গেছে
                    </p>
                  )}
                  {filtered.map(req => (
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
                                {req.payment_method === 'manual' && (
                                  <span className="bg-green-100 text-green-700 text-xs font-bengali px-2 py-0.5 rounded-full border border-green-200">হাতে হাতে</span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                              {req.status === 'pending' && (
                                <>
                                  <button onClick={() => updateStatus(req.id, 'approved')}
                                    className="flex items-center gap-1 bg-green-100 text-green-700 border border-green-200 px-3 py-1.5 rounded-lg font-bengali text-sm hover:bg-green-200 transition">
                                    <Check className="w-4 h-4" /><span>অনুমোদন</span>
                                  </button>
                                  <button onClick={() => updateStatus(req.id, 'rejected')}
                                    className="flex items-center gap-1 bg-red-50 text-red-600 border border-red-200 px-3 py-1.5 rounded-lg font-bengali text-sm hover:bg-red-100 transition">
                                    <X className="w-4 h-4" /><span>বাতিল</span>
                                  </button>
                                </>
                              )}
                              {req.status === 'rejected' && (
                                <button onClick={() => updateStatus(req.id, 'approved')}
                                  className="flex items-center gap-1 bg-green-100 text-green-700 border border-green-200 px-3 py-1.5 rounded-lg font-bengali text-sm hover:bg-green-200 transition">
                                  <Check className="w-4 h-4" /><span>পুনরায় অনুমোদন</span>
                                </button>
                              )}
                              {isSuperAdmin && (
                                <>
                                  <button
                                    onClick={() => togglePinParticipant(req)}
                                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-bengali text-sm transition ${(req as JoiningRequest & { is_pinned?: boolean }).is_pinned ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-muted text-muted-foreground border border-border hover:border-amber-300'}`}
                                    title={(req as JoiningRequest & { is_pinned?: boolean }).is_pinned ? 'পিন সরান' : 'পিন করুন'}
                                  >
                                    <Pin className="w-4 h-4" />
                                    <span className="hidden sm:inline">{(req as JoiningRequest & { is_pinned?: boolean }).is_pinned ? 'পিন সরান' : 'পিন'}</span>
                                  </button>
                                  <button
                                    onClick={() => deleteRequest(req.id)}
                                    disabled={deletingId === req.id}
                                    className="flex items-center gap-1 bg-red-50 text-red-600 border border-red-200 px-3 py-1.5 rounded-lg font-bengali text-sm hover:bg-red-100 transition disabled:opacity-50"
                                    title="মুছে ফেলুন"
                                  >
                                    {deletingId === req.id
                                      ? <RefreshCw className="w-4 h-4 animate-spin" />
                                      : <Trash2 className="w-4 h-4" />
                                    }
                                    <span className="hidden sm:inline">মুছুন</span>
                                  </button>
                                </>
                              )}
                            </div>
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
                            {(req as JoiningRequest & { mobile_number?: string }).mobile_number && (
                              <div className="bg-muted/50 rounded-lg px-3 py-2">
                                <p className="text-xs font-bengali text-muted-foreground">মোবাইল</p>
                                <p className="font-semibold text-foreground text-xs">{(req as JoiningRequest & { mobile_number?: string }).mobile_number}</p>
                              </div>
                            )}
                            {req.payment_number && (
                              <div className="bg-muted/50 rounded-lg px-3 py-2">
                                <p className="text-xs font-bengali text-muted-foreground">পেমেন্ট নম্বর</p>
                                <p className="font-semibold text-foreground text-xs">{req.payment_number}</p>
                              </div>
                            )}
                            {req.transaction_id && (
                              <div className="bg-muted/50 rounded-lg px-3 py-2">
                                <p className="text-xs font-bengali text-muted-foreground">TxnID</p>
                                <p className="font-semibold text-foreground text-xs truncate">{req.transaction_id}</p>
                              </div>
                            )}
                            {(req as JoiningRequest & { payment_receiver?: string }).payment_receiver && (
                              <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                                <p className="text-xs font-bengali text-muted-foreground">টাকা পেয়েছেন</p>
                                <p className="font-bengali font-semibold text-green-700 text-xs">{(req as JoiningRequest & { payment_receiver?: string }).payment_receiver}</p>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-3 flex-wrap mt-1">
                            <p className="text-xs text-muted-foreground">{new Date(req.created_at).toLocaleString('bn-BD')}</p>
                            {(req as JoiningRequest & { added_by?: string }).added_by && (
                              <span className="text-xs text-blue-500 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full font-bengali">
                                ➕ added by {(req as JoiningRequest & { added_by?: string }).added_by}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </>
        )}

        {/* ===== MANUAL MEMBER ADD TAB ===== */}
        {activeTab === 'members' && (
          <div className="max-w-xl mx-auto">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <UserPlus className="w-8 h-8 text-primary" />
              </div>
              <h2 className="font-bengali text-2xl font-bold text-foreground mb-2">সদস্য ম্যানুয়ালি যোগ করুন</h2>
              <p className="font-bengali text-muted-foreground text-sm">
                যারা হাতে হাতে টাকা দিয়েছেন তাদের সরাসরি অনুমোদিত তালিকায় যুক্ত করুন
              </p>
            </div>

            <div className="bg-card rounded-2xl border border-border shadow-card p-6 space-y-5">
              {/* Photo */}
              <div>
                <label className="font-bengali text-sm font-semibold text-foreground mb-2 block">ছবি (ঐচ্ছিক)</label>
                <div
                  onClick={() => participantPhotoRef.current?.click()}
                  className="border-2 border-dashed border-border rounded-xl p-5 text-center cursor-pointer hover:border-primary/60 transition bg-muted/30"
                >
                  {participantPhotoPreview ? (
                    <div className="flex flex-col items-center gap-2">
                      <img src={participantPhotoPreview} alt="preview" className="w-24 h-24 rounded-full object-cover border-4 border-primary/30" />
                      <p className="font-bengali text-xs text-muted-foreground">পরিবর্তন করতে ক্লিক করুন</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 py-2">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Upload className="w-5 h-5 text-primary" />
                      </div>
                      <p className="font-bengali text-sm text-muted-foreground">ছবি আপলোড করুন</p>
                    </div>
                  )}
                </div>
                <input ref={participantPhotoRef} type="file" accept="image/*" className="hidden" onChange={handleParticipantPhotoChange} />
              </div>

              {/* Name */}
              <div>
                <label className="font-bengali text-sm font-semibold text-foreground mb-2 block">পূর্ণ নাম *</label>
                <input
                  type="text"
                  className={inputCls}
                  placeholder="সদস্যের নাম লিখুন"
                  value={newParticipant.name}
                  onChange={e => setNewParticipant({ ...newParticipant, name: e.target.value })}
                  maxLength={100}
                />
              </div>

              {/* SSC Batch */}
              <div>
                <label className="font-bengali text-sm font-semibold text-foreground mb-2 block">এসএসসি ব্যাচ *</label>
                <select
                  className={inputCls}
                  value={newParticipant.ssc_batch}
                  onChange={e => setNewParticipant({ ...newParticipant, ssc_batch: e.target.value })}
                >
                  <option value="">ব্যাচ সিলেক্ট করুন</option>
                  {sscBatches.map(year => (
                    <option key={year} value={year}>{year} ব্যাচ</option>
                  ))}
                </select>
              </div>

              {/* Mobile Number */}
              <div>
                <label className="font-bengali text-sm font-semibold text-foreground mb-2 block">মোবাইল নম্বর (ঐচ্ছিক)</label>
                <input
                  type="tel"
                  className={inputCls}
                  placeholder="01XXXXXXXXX"
                  value={newParticipant.mobile_number}
                  onChange={e => setNewParticipant({ ...newParticipant, mobile_number: e.target.value })}
                  maxLength={15}
                />
              </div>

              <div>
                <label className="font-bengali text-sm font-semibold text-foreground mb-2 block">চাঁদার পরিমাণ (টাকা)</label>
                <input
                  type="number"
                  className={inputCls}
                  placeholder="100"
                  min={0}
                  value={newParticipant.payment_amount}
                  onChange={e => setNewParticipant({ ...newParticipant, payment_amount: e.target.value })}
                />
                <div className="flex gap-2 mt-2 flex-wrap">
                  {[100, 200, 500, 1000].map(amt => (
                    <button key={amt} type="button"
                      onClick={() => setNewParticipant({ ...newParticipant, payment_amount: String(amt) })}
                      className={`px-3 py-1.5 rounded-full text-sm font-bengali border transition ${
                        newParticipant.payment_amount === String(amt)
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'border-border text-muted-foreground hover:border-primary/50 bg-background'
                      }`}>
                      ৳{amt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Info note */}
              <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                <p className="font-bengali text-xs text-green-700">
                  ✅ এই সদস্য সরাসরি <strong>অনুমোদিত</strong> তালিকায় যুক্ত হবেন। পেমেন্ট পদ্ধতি: হাতে হাতে।
                </p>
              </div>

              {participantError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                  <p className="font-bengali text-sm text-red-600">{participantError}</p>
                </div>
              )}
              {participantSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                  <p className="font-bengali text-sm text-green-700 font-medium">{participantSuccess}</p>
                </div>
              )}

              <button
                onClick={saveManualParticipant}
                disabled={participantSaving}
                className="w-full py-4 rounded-xl font-bengali text-lg font-bold bg-primary text-primary-foreground hover:opacity-90 active:scale-95 disabled:opacity-50 transition-all"
              >
                {participantSaving ? '⏳ যোগ হচ্ছে...' : '✅ তালিকায় যুক্ত করুন'}
              </button>
            </div>
          </div>
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
                <input className={inputCls} placeholder="⚠️ সতর্কতা (যেমন: বিকাশ থেকে সেন্ড মানি করবেন)" value={newPayment.warning} onChange={e => setNewPayment({...newPayment, warning: e.target.value})} />
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
                      <textarea className={inputCls + " h-20 resize-none"} placeholder="নির্দেশনা" value={editingPayment.instruction} onChange={e => setEditingPayment({...editingPayment, instruction: e.target.value})} />
                      <input className={inputCls} placeholder="⚠️ সতর্কতা (যেমন: বিকাশ থেকে সেন্ড মানি করবেন)" value={editingPayment.warning || ''} onChange={e => setEditingPayment({...editingPayment, warning: e.target.value})} />
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
                        <p className="text-sm text-muted-foreground">{m.number}</p>
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
              <div className="bg-card rounded-2xl border border-border p-5 mb-6 space-y-4">
                <h3 className="font-bengali font-bold text-foreground">নতুন সদস্য যোগ করুন</h3>

                <div>
                  <label className="font-bengali text-sm font-medium text-foreground mb-2 block">ছবি (ঐচ্ছিক)</label>
                  <div
                    onClick={() => memberPhotoRef.current?.click()}
                    className="border-2 border-dashed border-border rounded-xl p-4 text-center cursor-pointer hover:border-primary/50 transition bg-muted/30"
                  >
                    {memberPhotoPreview ? (
                      <div className="flex flex-col items-center gap-2">
                        <img src={memberPhotoPreview} alt="preview" className="w-20 h-20 rounded-full object-cover border-2 border-primary/30" />
                        <p className="font-bengali text-xs text-muted-foreground">পরিবর্তন করতে ক্লিক করুন</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1 py-2">
                        <Upload className="w-6 h-6 text-primary" />
                        <p className="font-bengali text-xs text-muted-foreground">ছবি আপলোড করুন</p>
                      </div>
                    )}
                  </div>
                  <input ref={memberPhotoRef} type="file" accept="image/*" className="hidden" onChange={e => handleMemberPhotoChange(e, false)} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <input className={inputCls} placeholder="নাম *" value={newMember.name} onChange={e => setNewMember({...newMember, name: e.target.value})} />
                  <input className={inputCls} placeholder="পদবি (যেমন: সভাপতি) *" value={newMember.role} onChange={e => setNewMember({...newMember, role: e.target.value})} />
                  <input className={inputCls} placeholder="মোবাইল নম্বর" value={newMember.phone} onChange={e => setNewMember({...newMember, phone: e.target.value})} />
                  <input className={inputCls} placeholder="SSC ব্যাচ (বছর)" value={newMember.ssc_batch} onChange={e => setNewMember({...newMember, ssc_batch: e.target.value})} />
                  <input className={inputCls + " col-span-2"} placeholder="Facebook URL (ঐচ্ছিক)" value={newMember.facebook_url} onChange={e => setNewMember({...newMember, facebook_url: e.target.value})} />
                </div>
                <div className="flex gap-2">
                  <button onClick={saveCommitteeMember} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl font-bengali text-sm hover:opacity-90 transition">
                    <Save className="w-4 h-4" />সংরক্ষণ
                  </button>
                  <button onClick={() => { setShowAddMember(false); setMemberPhotoPreview(''); setMemberPhotoFile(null); }} className="px-4 py-2 rounded-xl font-bengali text-sm border border-border text-muted-foreground hover:bg-muted transition">বাতিল</button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {committee.map(m => (
                <div key={m.id} className="bg-card rounded-2xl border border-border p-4">
                  {editingMember?.id === m.id ? (
                    <div className="space-y-3">
                      <div
                        onClick={() => editMemberPhotoRef.current?.click()}
                        className="border-2 border-dashed border-border rounded-xl p-3 text-center cursor-pointer hover:border-primary/50 transition bg-muted/30"
                      >
                        {editMemberPhotoPreview || editingMember.photo_url ? (
                          <div className="flex flex-col items-center gap-1">
                            <img src={editMemberPhotoPreview || editingMember.photo_url} alt="preview" className="w-16 h-16 rounded-full object-cover border-2 border-primary/30" />
                            <p className="font-bengali text-xs text-muted-foreground">পরিবর্তন করতে ক্লিক করুন</p>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-2 py-1">
                            <Upload className="w-4 h-4 text-muted-foreground" />
                            <p className="font-bengali text-xs text-muted-foreground">ছবি আপলোড করুন</p>
                          </div>
                        )}
                      </div>
                      <input ref={editMemberPhotoRef} type="file" accept="image/*" className="hidden" onChange={e => handleMemberPhotoChange(e, true)} />

                      <div className="grid grid-cols-2 gap-3">
                        <input className={inputCls} value={editingMember.name} onChange={e => setEditingMember({...editingMember, name: e.target.value})} placeholder="নাম" />
                        <input className={inputCls} value={editingMember.role} onChange={e => setEditingMember({...editingMember, role: e.target.value})} placeholder="পদবি" />
                        <input className={inputCls} value={editingMember.phone || ''} onChange={e => setEditingMember({...editingMember, phone: e.target.value})} placeholder="মোবাইল" />
                        <input className={inputCls} value={editingMember.ssc_batch?.toString() || ''} onChange={e => setEditingMember({...editingMember, ssc_batch: parseInt(e.target.value) || undefined})} placeholder="ব্যাচ" />
                        <input className={inputCls + " col-span-2"} value={editingMember.facebook_url || ''} onChange={e => setEditingMember({...editingMember, facebook_url: e.target.value})} placeholder="Facebook URL" />
                      </div>
                      <div className="flex gap-2">
                        <button onClick={saveCommitteeMember} className="flex items-center gap-2 bg-primary text-primary-foreground px-3 py-1.5 rounded-lg font-bengali text-sm hover:opacity-90 transition">
                          <Save className="w-3.5 h-3.5" />সংরক্ষণ
                        </button>
                        <button onClick={() => { setEditingMember(null); setEditMemberPhotoFile(null); setEditMemberPhotoPreview(''); }} className="px-3 py-1.5 rounded-lg font-bengali text-sm border border-border text-muted-foreground hover:bg-muted transition">বাতিল</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      {m.photo_url ? (
                        <img src={m.photo_url} alt={m.name} className="w-12 h-12 rounded-full object-cover border-2 border-primary/20 flex-shrink-0" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="font-bold text-primary font-bengali">{m.name.charAt(0)}</span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-bengali font-bold text-foreground">{m.name}</p>
                        <p className="font-bengali text-sm text-muted-foreground">{m.role}{m.ssc_batch ? ` · ${m.ssc_batch} ব্যাচ` : ''}</p>
                        {m.phone && <p className="text-xs text-muted-foreground">{m.phone}</p>}
                        {m.facebook_url && <p className="text-xs text-blue-500 truncate">{m.facebook_url}</p>}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => togglePinMember(m)}
                          className={`p-1.5 rounded-lg transition ${m.is_pinned ? 'bg-amber-100 text-amber-600' : 'bg-muted text-muted-foreground hover:bg-border'}`}
                          title={m.is_pinned ? 'পিন সরান' : 'পিন করুন'}
                        >
                          <Pin className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => { setEditingMember(m); setEditMemberPhotoPreview(''); setEditMemberPhotoFile(null); }} className="p-1.5 rounded-lg bg-muted hover:bg-border transition">
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

        {/* ===== PRINT TAB ===== */}
        {activeTab === 'print' && (
          <div>
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Printer className="w-8 h-8 text-primary" />
              </div>
              <h2 className="font-bengali text-2xl font-bold text-foreground mb-2">অংশগ্রহণকারী তালিকা</h2>
              <p className="font-bengali text-muted-foreground text-sm">অনুমোদিত সকল সদস্যের তালিকা প্রিন্ট বা ডাউনলোড করুন</p>
            </div>

            {/* Stats bar */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-card rounded-2xl border border-border p-4 text-center">
                <p className="font-display text-2xl font-bold text-primary">{approvedList.length}</p>
                <p className="font-bengali text-xs text-muted-foreground">মোট সদস্য</p>
              </div>
              <div className="bg-card rounded-2xl border border-border p-4 text-center">
                <p className="font-display text-2xl font-bold text-primary">
                  {[...new Set(approvedList.map(r => r.ssc_batch))].length}
                </p>
                <p className="font-bengali text-xs text-muted-foreground">ব্যাচ সংখ্যা</p>
              </div>
              <div className="bg-card rounded-2xl border border-border p-4 text-center">
                <p className="font-display text-2xl font-bold text-primary">
                  ৳{approvedList.reduce((s, r) => s + Number(r.payment_amount), 0)}
                </p>
                <p className="font-bengali text-xs text-muted-foreground">মোট সংগ্রহ</p>
              </div>
            </div>

            {/* Filters & Actions */}
            <div className="bg-card rounded-2xl border border-border p-5 mb-6 space-y-4">
              <div>
                <label className="font-bengali text-sm font-semibold text-foreground mb-2 block">ব্যাচ ফিল্টার</label>
                <select
                  value={printBatchFilter}
                  onChange={e => setPrintBatchFilter(e.target.value)}
                  className="w-full border border-border rounded-xl px-3 py-2 text-sm text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition font-bengali"
                >
                  <option value="all">সব ব্যাচ একসাথে</option>
                  {[...new Set(approvedList.map(r => r.ssc_batch))].sort((a, b) => b - a).map(batch => (
                    <option key={batch} value={String(batch)}>{batch} ব্যাচ ({approvedList.filter(r => r.ssc_batch === batch).length} জন)</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    const list = printBatchFilter === 'all'
                      ? approvedList
                      : approvedList.filter(r => r.ssc_batch === parseInt(printBatchFilter));
                    printList(list);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bengali font-bold text-sm bg-primary text-primary-foreground hover:opacity-90 transition"
                >
                  <Printer className="w-4 h-4" />
                  প্রিন্ট করুন
                </button>
                <button
                  onClick={() => {
                    const list = printBatchFilter === 'all'
                      ? approvedList
                      : approvedList.filter(r => r.ssc_batch === parseInt(printBatchFilter));
                    downloadCSV(list);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bengali font-bold text-sm border border-primary text-primary hover:bg-primary/5 transition"
                >
                  <Download className="w-4 h-4" />
                  CSV ডাউনলোড
                </button>
              </div>
              <p className="font-bengali text-xs text-muted-foreground text-center">
                প্রিন্ট করলে ব্যাচ অনুযায়ী গ্রুপ + স্বাক্ষরের কলামসহ সুন্দর তালিকা পাবেন
              </p>
            </div>

            {/* Preview */}
            {printLoading ? (
              <div className="text-center py-10">
                <RefreshCw className="w-6 h-6 text-primary mx-auto animate-spin mb-2" />
                <p className="font-bengali text-muted-foreground">লোড হচ্ছে...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {(printBatchFilter === 'all'
                  ? [...new Set(approvedList.map(r => r.ssc_batch))].sort((a, b) => b - a)
                  : [parseInt(printBatchFilter)]
                ).map(batch => {
                  const members = approvedList.filter(r => r.ssc_batch === batch);
                  return (
                    <div key={batch} className="bg-card rounded-2xl border border-border overflow-hidden">
                      <div className="bg-primary px-5 py-3 flex items-center justify-between">
                        <p className="font-bengali font-bold text-primary-foreground">{batch} ব্যাচ</p>
                        <span className="bg-white/20 text-white text-xs font-bengali px-2 py-0.5 rounded-full">{members.length} জন</span>
                      </div>
                      <div className="divide-y divide-border">
                        {members.map((r, i) => (
                          <div key={r.id} className="flex items-center gap-3 px-4 py-3">
                            <span className="text-xs text-muted-foreground w-7 text-right font-display">{i + 1}.</span>
                            {r.photo_url ? (
                              <img src={r.photo_url} alt={r.name} className="w-8 h-8 rounded-full object-cover border border-primary/20 flex-shrink-0" />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <span className="text-xs font-bold text-primary">{r.name.charAt(0)}</span>
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-bengali font-semibold text-foreground text-sm">{r.name}</p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span className="font-bengali text-xs text-muted-foreground">{r.payment_method}</span>
                              <span className="font-bengali text-xs font-semibold text-primary">৳{r.payment_amount}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
                {approvedList.length === 0 && (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="font-bengali text-muted-foreground">এখনো কোনো অনুমোদিত সদস্য নেই</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ===== GALLERY TAB ===== */}
        {activeTab === 'gallery' && (
          <div>
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Camera className="w-8 h-8 text-primary" />
              </div>
              <h2 className="font-bengali text-2xl font-bold text-foreground mb-2">পূর্ববর্তী ইভেন্টের ছবি</h2>
              <p className="font-bengali text-muted-foreground text-sm">ল্যান্ডিং পেজের গ্যালারি সেকশনে দেখানো হবে</p>
            </div>

            {/* Upload card */}
            <div className="bg-card rounded-2xl border border-border shadow-card p-6 mb-8 space-y-4">
              <h3 className="font-bengali font-bold text-foreground flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-primary" /> নতুন ছবি আপলোড করুন
              </h3>

              <div
                onClick={() => galleryFileRef.current?.click()}
                className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-primary/60 transition bg-muted/30"
              >
                {galleryPreview ? (
                  <div className="flex flex-col items-center gap-2">
                    <img src={galleryPreview} alt="preview" className="max-h-48 rounded-xl object-cover border-2 border-primary/20" />
                    <p className="font-bengali text-xs text-muted-foreground">পরিবর্তন করতে ক্লিক করুন</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 py-4">
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                      <Upload className="w-6 h-6 text-primary" />
                    </div>
                    <p className="font-bengali text-muted-foreground">ছবি সিলেক্ট করুন</p>
                    <p className="font-bengali text-xs text-muted-foreground">JPG, PNG সাপোর্টেড</p>
                  </div>
                )}
              </div>
              <input ref={galleryFileRef} type="file" accept="image/*" className="hidden" onChange={handleGalleryFileChange} />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bengali text-sm font-medium text-foreground mb-1 block">ক্যাপশন (ঐচ্ছিক)</label>
                  <input
                    className="w-full border border-border rounded-xl px-3 py-2 text-sm text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition font-bengali"
                    placeholder="যেমন: ২০২৩ সালের ইফতার"
                    value={galleryCaption}
                    onChange={e => setGalleryCaption(e.target.value)}
                  />
                </div>
                <div>
                  <label className="font-bengali text-sm font-medium text-foreground mb-1 block">বছর (ঐচ্ছিক)</label>
                  <input
                    type="number"
                    className="w-full border border-border rounded-xl px-3 py-2 text-sm text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition font-bengali"
                    placeholder="যেমন: 2023"
                    value={galleryYear}
                    onChange={e => setGalleryYear(e.target.value)}
                    min={2000} max={2030}
                  />
                </div>
              </div>

              <button
                onClick={uploadEventPhoto}
                disabled={!galleryFile || galleryUploading}
                className="w-full py-3 rounded-xl font-bengali font-bold text-sm bg-primary text-primary-foreground hover:opacity-90 transition disabled:opacity-50"
              >
                {galleryUploading ? '⏳ আপলোড হচ্ছে...' : '📸 ছবি আপলোড করুন'}
              </button>
            </div>

            {/* Photo grid */}
            {galleryLoading ? (
              <div className="text-center py-12">
                <RefreshCw className="w-8 h-8 text-primary mx-auto animate-spin mb-3" />
                <p className="font-bengali text-muted-foreground">লোড হচ্ছে...</p>
              </div>
            ) : eventPhotos.length === 0 ? (
              <div className="text-center py-12">
                <ImageIcon className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                <p className="font-bengali text-muted-foreground">এখনো কোনো ছবি আপলোড করা হয়নি</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {eventPhotos.map(photo => (
                  <div key={photo.id} className="relative group rounded-xl overflow-hidden border border-border shadow-card">
                    <img
                      src={photo.photo_url}
                      alt={photo.caption || 'Event photo'}
                      className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                      {photo.caption && <p className="font-bengali text-white text-xs text-center leading-tight">{photo.caption}</p>}
                      {photo.event_year && <span className="bg-amber-400 text-amber-900 text-xs font-bold px-2 py-0.5 rounded-full">{photo.event_year}</span>}
                      <button
                        onClick={() => deleteEventPhoto(photo.id, photo.photo_url)}
                        className="mt-1 flex items-center gap-1 bg-red-500 text-white px-3 py-1.5 rounded-lg font-bengali text-xs hover:bg-red-600 transition"
                      >
                        <Trash2 className="w-3 h-3" /> মুছুন
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ===== ADMIN MANAGEMENT TAB (super admin only) ===== */}
        {activeTab === 'admins' && isSuperAdmin && (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h2 className="font-bengali text-2xl font-bold text-foreground mb-2">অ্যাডমিন ম্যানেজমেন্ট</h2>
              <p className="font-bengali text-muted-foreground text-sm">
                নতুন অ্যাডমিন যোগ করুন বা বিদ্যমান অ্যাডমিন সরিয়ে দিন। শুধুমাত্র সুপার অ্যাডমিনের অ্যাক্সেস।
              </p>
            </div>

            {/* Add new admin */}
            <div className="bg-card rounded-2xl border border-border shadow-card p-6 mb-6">
              <h3 className="font-bengali font-bold text-foreground mb-4 flex items-center gap-2">
                <Plus className="w-4 h-4 text-primary" /> নতুন অ্যাডমিন যোগ করুন
              </h3>
              <p className="font-bengali text-xs text-muted-foreground mb-4">
                নতুন অ্যাডমিনের ইমেইল ও পাসওয়ার্ড দিন। অ্যাকাউন্ট তৈরি হয়ে যাবে এবং সে সরাসরি অ্যাডমিন প্যানেলে লগইন করতে পারবেন।
              </p>
              <div className="space-y-3">
                <input
                  className={inputCls}
                  type="email"
                  placeholder="নতুন অ্যাডমিনের ইমেইল *"
                  value={newAdminEmail}
                  onChange={e => setNewAdminEmail(e.target.value)}
                />
                <input
                  className={inputCls}
                  type="password"
                  placeholder="পাসওয়ার্ড (কমপক্ষে ৮ অক্ষর) *"
                  value={newAdminPassword}
                  onChange={e => setNewAdminPassword(e.target.value)}
                />
                <button
                  disabled={adminActionLoading || !newAdminEmail.trim() || newAdminPassword.length < 8}
                  onClick={async () => {
                    setAdminActionLoading(true);
                    setAdminActionMsg('');
                    try {
                      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-admins`, {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
                        },
                        body: JSON.stringify({ action: 'create', email: newAdminEmail.trim(), password: newAdminPassword }),
                      });
                      const result = await res.json();
                      if (result.error) throw new Error(result.error);
                      setAdminActionMsg(`✅ "${newAdminEmail}" অ্যাডমিন হিসেবে তৈরি করা হয়েছে`);
                      setNewAdminEmail('');
                      setNewAdminPassword('');
                      fetchAdminsList();
                    } catch (err) {
                      setAdminActionMsg(`❌ ${err instanceof Error ? err.message : 'সমস্যা হয়েছে'}`);
                    } finally {
                      setAdminActionLoading(false);
                    }
                  }}
                  className="w-full py-2.5 rounded-xl font-bengali text-sm bg-primary text-primary-foreground hover:opacity-90 transition disabled:opacity-50"
                >
                  {adminActionLoading ? '⏳ তৈরি হচ্ছে...' : '➕ অ্যাডমিন অ্যাকাউন্ট তৈরি করুন'}
                </button>
              </div>
              {adminActionMsg && (
                <p className="font-bengali text-sm mt-3">{adminActionMsg}</p>
              )}
            </div>

            {/* Current admins list */}
            <div className="bg-card rounded-2xl border border-border shadow-card p-6">
              <h3 className="font-bengali font-bold text-foreground mb-4">বর্তমান অ্যাডমিনগণ</h3>
              <div className="space-y-3">
                {adminsList.map(admin => (
                  <div key={admin.id} className="flex items-center justify-between gap-3 p-3 bg-muted/30 rounded-xl border border-border">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                        <Shield className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-bengali text-sm font-semibold text-foreground">
                          {admin.email}
                          {admin.email === 'admin@gmail.com' && (
                            <span className="ml-2 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200">সুপার অ্যাডমিন</span>
                          )}
                        </p>
                      </div>
                    </div>
                    {admin.email !== 'admin@gmail.com' && (
                      <button
                        onClick={async () => {
                          if (!window.confirm(`${admin.email} কে অ্যাডমিন থেকে সরিয়ে দেবেন?`)) return;
                          setAdminActionLoading(true);
                          try {
                            const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-admins`, {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
                              },
                              body: JSON.stringify({ action: 'remove', userId: admin.user_id }),
                            });
                            const result = await res.json();
                            if (result.error) throw new Error(result.error);
                            setAdminActionMsg(`✅ অ্যাডমিন সরিয়ে দেওয়া হয়েছে`);
                            fetchAdminsList();
                          } catch (err) {
                            setAdminActionMsg(`❌ ${err instanceof Error ? err.message : 'সমস্যা হয়েছে'}`);
                          } finally {
                            setAdminActionLoading(false);
                          }
                        }}
                        className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 transition flex-shrink-0"
                        title="অ্যাডমিন সরিয়ে দিন"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-500" />
                      </button>
                    )}
                  </div>
                ))}
                {adminsList.length === 0 && (
                  <p className="font-bengali text-sm text-muted-foreground text-center py-4">লোড হচ্ছে...</p>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
