import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  Shield, LogOut, Mail, Phone, Calendar, Clock, Loader2, Users,
  CalendarCheck, ClockAlert, CheckCircle2, UserCog, Pencil, Save,
  Trash2, Plus, AlertTriangle, RefreshCw, FileText, Star, Power,
  Bell, BellDot, Eye, EyeOff, Check, Link2, UserCheck
} from "lucide-react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

interface Consultation {
  id: string;
  client_name: string;
  client_phone: string;
  client_email: string | null;
  expert_name: string;
  expert_expertise: string;
  consultation_date: string;
  consultation_time: string;
  memo: string | null;
  status: string;
  created_at: string;
}

interface Expert {
  id: string;
  name: string;
  expertise: string;
  experience_score: number;
  tags: string[];
  match_rate: number;
  available: boolean;
  career: string;
  description: string;
  specialties: string[];
  consult_fee: string;
  sort_order: number;
  // multilingual
  name_en: string; name_ja: string; name_zh: string;
  expertise_en: string; expertise_ja: string; expertise_zh: string;
  career_en: string; career_ja: string; career_zh: string;
  description_en: string; description_ja: string; description_zh: string;
  consult_fee_en: string; consult_fee_ja: string; consult_fee_zh: string;
  tags_en: string[]; tags_ja: string[]; tags_zh: string[];
  specialties_en: string[]; specialties_ja: string[]; specialties_zh: string[];
}

const emptyExpert: Omit<Expert, "id"> = {
  name: "", expertise: "", experience_score: 90, tags: [], match_rate: 90,
  available: true, career: "", description: "", specialties: [],
  consult_fee: "초기 상담 무료", sort_order: 0,
  name_en: "", name_ja: "", name_zh: "",
  expertise_en: "", expertise_ja: "", expertise_zh: "",
  career_en: "", career_ja: "", career_zh: "",
  description_en: "", description_ja: "", description_zh: "",
  consult_fee_en: "", consult_fee_ja: "", consult_fee_zh: "",
  tags_en: [], tags_ja: [], tags_zh: [],
  specialties_en: [], specialties_ja: [], specialties_zh: [],
};

interface DeleteTarget {
  id: string;
  type: "consultation" | "expert";
  name: string;
}

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  consultation_id: string | null;
  created_at: string;
}

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [experts, setExperts] = useState<Expert[]>([]);
  const [expertsLoading, setExpertsLoading] = useState(false);
  const [editingExpert, setEditingExpert] = useState<Expert | null>(null);
  const [editForm, setEditForm] = useState<Omit<Expert, "id">>(emptyExpert);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [isNewExpert, setIsNewExpert] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [serviceEnabled, setServiceEnabled] = useState(true);
  const [serviceToggling, setServiceToggling] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);

  // Matching management state — from DB
  interface WaitingUser {
    id: string;
    name: string;
    unit: string;
    service_year: string;
    phone: string;
    email: string | null;
    is_matched: boolean;
    created_at: string;
    match_fee_type: string;
    match_fee: number;
  }
  interface MatchRecord {
    id: string;
    user_a_id: string;
    user_b_id: string;
    match_type: string;
    status: string;
    created_at: string;
    user_a?: WaitingUser;
    user_b?: WaitingUser;
  }
  const [waitingUsers, setWaitingUsers] = useState<WaitingUser[]>([]);
  const [waitingLoading, setWaitingLoading] = useState(false);
  const [matches, setMatches] = useState<MatchRecord[]>([]);
  const [matchesLoading, setMatchesLoading] = useState(false);
  const [matchSelectA, setMatchSelectA] = useState("");
  const [matchSelectB, setMatchSelectB] = useState("");
  const [matchSearchQuery, setMatchSearchQuery] = useState("");
  const [matchPage, setMatchPage] = useState(0);
  const MATCH_PAGE_SIZE = 50;

  // 30-minute inactivity auto-logout (throttled, passive listeners)
  useEffect(() => {
    if (!session) return;
    const TIMEOUT_MS = 30 * 60 * 1000;
    let inactivityTimer: ReturnType<typeof setTimeout>;
    let lastReset = 0;

    const resetTimer = () => {
      const now = Date.now();
      if (now - lastReset < 1000) return; // throttle to 1/s
      lastReset = now;
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(async () => {
        await supabase.auth.signOut();
        toast({ title: "자동 로그아웃", description: "30분간 활동이 없어 보안을 위해 자동 로그아웃되었습니다." });
      }, TIMEOUT_MS);
    };

    const events: (keyof WindowEventMap)[] = ["mousedown", "keydown", "scroll", "touchstart", "mousemove"];
    const opts: AddEventListenerOptions = { passive: true };
    events.forEach(e => window.addEventListener(e, resetTimer, opts));
    resetTimer();

    return () => {
      clearTimeout(inactivityTimer);
      events.forEach(e => window.removeEventListener(e, resetTimer, opts));
    };
  }, [session, toast]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) return;
    // Parallel initial fetch — was sequential before
    Promise.all([
      fetchConsultations(),
      fetchExperts(),
      fetchServiceStatus(),
      fetchNotifications(),
      fetchWaitingUsers(),
      fetchMatches(),
    ]);

    // Realtime: keep tables in sync without manual refresh
    const ch = supabase
      .channel("admin-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "consultations" }, () => fetchConsultations())
      .on("postgres_changes", { event: "*", schema: "public", table: "notifications" }, () => fetchNotifications())
      .on("postgres_changes", { event: "*", schema: "public", table: "buddy_matches" }, () => fetchMatches())
      .on("postgres_changes", { event: "*", schema: "public", table: "buddy_waiting_users" }, () => fetchWaitingUsers())
      .subscribe();

    return () => { supabase.removeChannel(ch); };
  }, [session]);

  const fetchWaitingUsers = async () => {
    setWaitingLoading(true);
    const allUsers: any[] = [];
    let from = 0;
    const pageSize = 1000;
    while (true) {
      const { data } = await supabase.from("buddy_waiting_users").select("*").order("created_at", { ascending: false }).range(from, from + pageSize - 1);
      if (data && data.length > 0) {
        allUsers.push(...data);
        if (data.length < pageSize) break;
        from += pageSize;
      } else break;
    }
    setWaitingUsers(allUsers as unknown as WaitingUser[]);
    setWaitingLoading(false);
  };

  const fetchMatches = async () => {
    setMatchesLoading(true);
    const { data } = await supabase.from("buddy_matches").select("*").order("created_at", { ascending: false });
    if (data && data.length > 0) {
      // Collect all user IDs from matches
      const userIds = [...new Set(data.flatMap((m: any) => [m.user_a_id, m.user_b_id]))];
      // Fetch only matched users (in batches if needed)
      const allUsers: any[] = [];
      for (let i = 0; i < userIds.length; i += 50) {
        const batch = userIds.slice(i, i + 50);
        const { data: users } = await supabase.from("buddy_waiting_users").select("*").in("id", batch);
        if (users) allUsers.push(...users);
      }
      const userMap = new Map(allUsers.map((u: any) => [u.id, u]));
      const enriched = data.map((m: any) => ({
        ...m,
        user_a: userMap.get(m.user_a_id),
        user_b: userMap.get(m.user_b_id),
      }));
      setMatches(enriched as MatchRecord[]);
    } else {
      setMatches([]);
    }
    setMatchesLoading(false);
  };

  const fetchServiceStatus = async () => {
    const { data } = await supabase.from("site_settings").select("service_enabled").eq("id", "main").single();
    if (data) setServiceEnabled(data.service_enabled);
  };

  const handleToggleService = async () => {
    setServiceToggling(true);
    const newValue = !serviceEnabled;
    const { error } = await supabase.from("site_settings").update({ service_enabled: newValue, updated_at: new Date().toISOString() } as any).eq("id", "main");
    if (error) {
      toast({ title: "변경 실패", description: error.message, variant: "destructive" });
    } else {
      setServiceEnabled(newValue);
      toast({ title: newValue ? "서비스 공개 ON" : "서비스 공개 OFF", description: newValue ? "일반 사용자가 서비스에 접근할 수 있습니다." : "점검 안내 페이지가 표시됩니다." });
    }
    setServiceToggling(false);
  };

  const fetchConsultations = async () => {
    setDataLoading(true);
    const { data } = await supabase.from("consultations").select("*").order("created_at", { ascending: false });
    if (data) setConsultations(data);
    setDataLoading(false);
  };

  const fetchExperts = async () => {
    setExpertsLoading(true);
    const { data } = await supabase.from("experts").select("*").order("sort_order", { ascending: true });
    if (data) setExperts(data as unknown as Expert[]);
    setExpertsLoading(false);
  };

  const fetchNotifications = async () => {
    setNotifLoading(true);
    const { data } = await supabase.from("notifications").select("*").order("created_at", { ascending: false }).limit(50);
    if (data) setNotifications(data as unknown as Notification[]);
    setNotifLoading(false);
  };

  const markNotifRead = async (id: string) => {
    await supabase.from("notifications").update({ is_read: true } as any).eq("id", id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const markAllRead = async () => {
    await supabase.from("notifications").update({ is_read: true } as any).eq("is_read", false);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) toast({ title: "로그인 실패", description: "이메일 또는 비밀번호가 올바르지 않습니다.", variant: "destructive" });
    setLoginLoading(false);
  };

  const handleLogout = async () => { await supabase.auth.signOut(); };

  const handleStatusChange = async (id: string, newStatus: string) => {
    const { error } = await supabase.from("consultations").update({ status: newStatus }).eq("id", id);
    if (error) {
      toast({ title: "상태 변경 실패", description: error.message, variant: "destructive" });
    } else {
      setConsultations(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
      toast({ title: "상태 변경 완료" });
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    if (deleteTarget.type === "consultation") {
      const { error } = await supabase.from("consultations").delete().eq("id", deleteTarget.id);
      if (error) { toast({ title: "삭제 실패", description: error.message, variant: "destructive" }); }
      else { setConsultations(prev => prev.filter(c => c.id !== deleteTarget.id)); toast({ title: "상담 삭제 완료" }); }
    } else {
      const { error } = await supabase.from("experts").delete().eq("id", deleteTarget.id);
      if (error) { toast({ title: "삭제 실패", description: error.message, variant: "destructive" }); }
      else { setExperts(prev => prev.filter(e => e.id !== deleteTarget.id)); toast({ title: "전문가 삭제 완료" }); }
    }
    setDeleting(false);
    setDeleteTarget(null);
  };

  const handleToggleAvailable = async (expert: Expert) => {
    const { error } = await supabase.from("experts").update({ available: !expert.available } as any).eq("id", expert.id);
    if (error) { toast({ title: "변경 실패", variant: "destructive" }); }
    else { setExperts(prev => prev.map(e => e.id === expert.id ? { ...e, available: !e.available } : e)); }
  };

  const openEditModal = (expert?: Expert) => {
    if (expert) {
      setEditingExpert(expert);
      setEditForm({ ...expert });
      setIsNewExpert(false);
    } else {
      setEditingExpert(null);
      setEditForm({ ...emptyExpert, sort_order: experts.length + 1 });
      setIsNewExpert(true);
    }
    setEditModalOpen(true);
  };

  const handleSaveExpert = async () => {
    setSaving(true);
    const payload: any = {
      name: editForm.name, expertise: editForm.expertise,
      experience_score: editForm.experience_score, tags: editForm.tags,
      match_rate: editForm.match_rate, available: editForm.available,
      career: editForm.career, description: editForm.description,
      specialties: editForm.specialties, consult_fee: editForm.consult_fee,
      sort_order: editForm.sort_order,
      name_en: editForm.name_en, name_ja: editForm.name_ja, name_zh: editForm.name_zh,
      expertise_en: editForm.expertise_en, expertise_ja: editForm.expertise_ja, expertise_zh: editForm.expertise_zh,
      career_en: editForm.career_en, career_ja: editForm.career_ja, career_zh: editForm.career_zh,
      description_en: editForm.description_en, description_ja: editForm.description_ja, description_zh: editForm.description_zh,
      consult_fee_en: editForm.consult_fee_en, consult_fee_ja: editForm.consult_fee_ja, consult_fee_zh: editForm.consult_fee_zh,
      tags_en: editForm.tags_en, tags_ja: editForm.tags_ja, tags_zh: editForm.tags_zh,
      specialties_en: editForm.specialties_en, specialties_ja: editForm.specialties_ja, specialties_zh: editForm.specialties_zh,
    };

    if (isNewExpert) {
      const { error } = await supabase.from("experts").insert(payload);
      if (error) { toast({ title: "추가 실패", variant: "destructive" }); setSaving(false); return; }
      toast({ title: "전문가 추가 완료" });
    } else if (editingExpert) {
      const { error } = await supabase.from("experts").update(payload).eq("id", editingExpert.id);
      if (error) { toast({ title: "수정 실패", variant: "destructive" }); setSaving(false); return; }
      toast({ title: "전문가 수정 완료" });
    }
    setSaving(false);
    setEditModalOpen(false);
    fetchExperts();
  };

  // Debounced search input — avoid re-filtering thousands of users on each keystroke
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(matchSearchQuery), 200);
    return () => clearTimeout(t);
  }, [matchSearchQuery]);

  // Memoized derived values
  const stats = useMemo(() => {
    const today = format(new Date(), "yyyy-MM-dd");
    return {
      total: consultations.length,
      todayCount: consultations.filter(c => c.consultation_date === today || c.created_at.startsWith(today)).length,
      pending: consultations.filter(c => c.status === "pending").length,
      completed: consultations.filter(c => c.status === "completed").length,
    };
  }, [consultations]);

  const unreadCount = useMemo(
    () => notifications.reduce((n, x) => n + (x.is_read ? 0 : 1), 0),
    [notifications]
  );

  const filteredWaiting = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    return waitingUsers.filter(u => {
      if (u.is_matched) return false;
      if (!q) return true;
      return `${u.name} ${u.unit} ${u.service_year} ${u.phone}`.toLowerCase().includes(q);
    });
  }, [waitingUsers, debouncedSearch]);

    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 shadow-card">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">관리자 로그인</h1>
            <p className="mt-1 text-sm text-muted-foreground">전우찾기 관리 시스템</p>
          </div>
          <Card className="shadow-card">
            <CardContent className="p-6">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">이메일</label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@example.com" required className="h-11" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">비밀번호</label>
                  <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required className="h-11" />
                </div>
                <Button type="submit" className="h-11 w-full text-sm font-semibold" disabled={loginLoading}>
                  {loginLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  로그인
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const today = format(new Date(), "yyyy-MM-dd");
  const total = consultations.length;
  const todayCount = consultations.filter(c => c.consultation_date === today || c.created_at.startsWith(today)).length;
  const pending = consultations.filter(c => c.status === "pending").length;
  const completed = consultations.filter(c => c.status === "completed").length;

  const statusConfig: Record<string, { label: string; className: string }> = {
    pending: { label: "대기중", className: "border-warning/30 bg-warning/10 text-warning" },
    confirmed: { label: "확정", className: "border-primary/30 bg-primary/10 text-primary" },
    completed: { label: "완료", className: "border-success/30 bg-success/10 text-success" },
  };

  const renderLangField = (label: string, field: keyof Omit<Expert, "id">, placeholder?: string, textarea?: boolean) => (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-foreground">{label}</label>
      {textarea ? (
        <Textarea
          value={typeof editForm[field] === "string" ? (editForm[field] as string) : ""}
          onChange={(e) => setEditForm(p => ({ ...p, [field]: e.target.value }))}
          placeholder={placeholder}
          rows={2}
        />
      ) : (
        <Input
          value={typeof editForm[field] === "string" ? (editForm[field] as string) : ""}
          onChange={(e) => setEditForm(p => ({ ...p, [field]: e.target.value }))}
          placeholder={placeholder}
        />
      )}
    </div>
  );

  const renderLangArrayField = (label: string, field: keyof Omit<Expert, "id">, placeholder?: string) => (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-foreground">{label}</label>
      <Input
        value={(editForm[field] as string[] || []).join(", ")}
        onChange={(e) => setEditForm(p => ({ ...p, [field]: e.target.value.split(",").map(s => s.trim()).filter(Boolean) }))}
        placeholder={placeholder}
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="font-serif-legal text-lg font-bold leading-tight text-foreground">관리자 대시보드</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-muted-foreground sm:inline">{session.user.email}</span>
            <Button variant="outline" size="sm" onClick={() => navigate("/")} className="gap-1.5">
              <Power className="h-4 w-4" />
              <span className="hidden sm:inline">메인으로</span>
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout} className="gap-1.5">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">로그아웃</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-6xl px-4 py-6 sm:py-8">
        {/* Service Toggle */}
        <Card className={`mb-6 shadow-card border-2 transition-colors ${serviceEnabled ? "border-success/40" : "border-destructive/40"}`}>
          <CardContent className="flex items-center justify-between p-4 sm:p-5">
            <div className="flex items-center gap-3">
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${serviceEnabled ? "bg-success/10" : "bg-destructive/10"}`}>
                <Power className={`h-5 w-5 ${serviceEnabled ? "text-success" : "text-destructive"}`} />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">전우찾기 서비스 전체 공개</h3>
                <p className="text-sm text-muted-foreground">
                  {serviceEnabled ? "현재 서비스가 공개 상태입니다. 모든 사용자가 접근 가능합니다." : "현재 서비스가 비공개 상태입니다. 점검 안내 페이지가 표시됩니다."}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-sm font-semibold ${serviceEnabled ? "text-success" : "text-destructive"}`}>
                {serviceEnabled ? "ON" : "OFF"}
              </span>
              <Switch
                checked={serviceEnabled}
                onCheckedChange={handleToggleService}
                disabled={serviceToggling}
                className="scale-125"
              />
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="mb-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {[
            { icon: Users, label: "총 상담", value: total, iconBg: "bg-primary/10", iconColor: "text-primary" },
            { icon: CalendarCheck, label: "오늘 접수", value: todayCount, iconBg: "bg-accent", iconColor: "text-accent-foreground" },
            { icon: ClockAlert, label: "대기중", value: pending, iconBg: "bg-warning/10", iconColor: "text-warning" },
            { icon: CheckCircle2, label: "완료", value: completed, iconBg: "bg-success/10", iconColor: "text-success" },
          ].map(({ icon: Icon, label, value, iconBg, iconColor }) => (
            <Card key={label} className="shadow-card transition-shadow hover:shadow-card-hover">
              <CardContent className="flex items-center gap-3 p-4 sm:p-5">
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconBg}`}>
                  <Icon className={`h-5 w-5 ${iconColor}`} />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">{label}</p>
                  <p className="font-mono-num text-2xl font-bold text-foreground">{value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="consultations">
          <TabsList className="mb-6 h-11 w-full justify-start rounded-xl bg-secondary/60 p-1 sm:w-auto">
            <TabsTrigger value="consultations" className="gap-1.5 rounded-lg px-4 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <FileText className="h-4 w-4" />상담 관리
            </TabsTrigger>
            <TabsTrigger value="experts" className="gap-1.5 rounded-lg px-4 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Star className="h-4 w-4" />전문가 관리
            </TabsTrigger>
            <TabsTrigger value="notifications" className="relative gap-1.5 rounded-lg px-4 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              {notifications.filter(n => !n.is_read).length > 0 ? <BellDot className="h-4 w-4 text-warning" /> : <Bell className="h-4 w-4" />}
              알림
              {notifications.filter(n => !n.is_read).length > 0 && (
                <span className="ml-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-warning text-[10px] font-bold text-warning-foreground px-1">
                  {notifications.filter(n => !n.is_read).length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="matching" className="gap-1.5 rounded-lg px-4 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Link2 className="h-4 w-4" />매칭 관리
            </TabsTrigger>
          </TabsList>

          {/* Consultations Tab */}
          <TabsContent value="consultations">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-foreground">상담 신청 목록</h2>
                <p className="text-sm text-muted-foreground">총 {consultations.length}건의 상담 신청</p>
              </div>
              <Button variant="outline" size="sm" onClick={fetchConsultations} disabled={dataLoading} className="gap-1.5">
                <RefreshCw className={`h-4 w-4 ${dataLoading ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">새로고침</span>
              </Button>
            </div>

            {consultations.length === 0 && !dataLoading ? (
              <Card className="shadow-card">
                <CardContent className="flex flex-col items-center gap-3 py-16">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
                    <FileText className="h-7 w-7 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">아직 접수된 상담 신청이 없습니다.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-3">
                {consultations.map((c) => {
                  const status = statusConfig[c.status] || statusConfig.pending;
                  return (
                    <Card key={c.id} className="shadow-card transition-all hover:shadow-card-hover">
                      <CardContent className="p-4 sm:p-5">
                        <div className="flex flex-col gap-3">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2.5">
                              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-sm font-bold text-foreground">
                                {c.client_name.charAt(0)}
                              </div>
                              <div>
                                <h3 className="text-base font-semibold text-foreground">{c.client_name}</h3>
                                <p className="text-xs text-muted-foreground">{format(new Date(c.created_at), "yyyy.MM.dd HH:mm", { locale: ko })} 접수</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className={`${status.className} border text-xs font-medium`}>
                                {status.label}
                              </Badge>
                              <Select value={c.status} onValueChange={(v) => handleStatusChange(c.id, v)}>
                                <SelectTrigger className="h-8 w-24 text-xs"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">대기중</SelectItem>
                                  <SelectItem value="confirmed">확정</SelectItem>
                                  <SelectItem value="completed">완료</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                onClick={() => setDeleteTarget({ id: c.id, type: "consultation", name: c.client_name })}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 gap-2 rounded-lg bg-muted/40 p-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
                            <div className="flex items-center gap-2">
                              <Phone className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                              <span className="text-foreground">{c.client_phone}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Mail className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                              <span className="truncate text-foreground">{c.client_email || "-"}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                              <span className="text-foreground">{c.consultation_date} {c.consultation_time}</span>
                            </div>
                            <div className="flex items-center gap-2 sm:col-span-2 lg:col-span-3">
                              <UserCog className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                              <span className="text-foreground">{c.expert_name} <span className="text-muted-foreground">({c.expert_expertise})</span></span>
                            </div>
                          </div>
                          {c.memo && (
                            <div className="rounded-lg border border-border/50 bg-card px-3 py-2.5">
                              <p className="text-sm text-muted-foreground leading-relaxed">{c.memo}</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Experts Tab */}
          <TabsContent value="experts">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-foreground">전문가 목록</h2>
                <p className="text-sm text-muted-foreground">총 {experts.length}명의 전문가</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={fetchExperts} disabled={expertsLoading} className="gap-1.5">
                  <RefreshCw className={`h-4 w-4 ${expertsLoading ? "animate-spin" : ""}`} />
                  <span className="hidden sm:inline">새로고침</span>
                </Button>
                <Button size="sm" onClick={() => openEditModal()} className="gap-1.5">
                  <Plus className="h-4 w-4" />전문가 추가
                </Button>
              </div>
            </div>

            <div className="grid gap-3">
              {experts.map((expert) => (
                <Card key={expert.id} className="shadow-card transition-all hover:shadow-card-hover">
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex-1 space-y-2.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                            {expert.name.charAt(0)}
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-foreground">{expert.name}</h3>
                            <p className="text-xs text-muted-foreground">{expert.career}</p>
                          </div>
                          <Badge variant="outline" className="border-primary/30 text-primary">{expert.expertise}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{expert.description}</p>
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="secondary" className="font-mono-num text-xs">경력 {expert.experience_score}점</Badge>
                          <Badge variant="secondary" className="font-mono-num text-xs">선호도 {expert.match_rate}%</Badge>
                          {expert.tags.map((tag, i) => (
                            <span key={i} className="rounded-full bg-secondary px-2.5 py-0.5 text-xs text-secondary-foreground">{tag}</span>
                          ))}
                          {expert.specialties.map((s, i) => (
                            <span key={`s-${i}`} className="rounded-full border border-border px-2.5 py-0.5 text-xs text-foreground">{s}</span>
                          ))}
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-3 sm:flex-col sm:items-end">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-medium ${expert.available ? "text-success" : "text-muted-foreground"}`}>
                            {expert.available ? "상담 가능" : "예약 필요"}
                          </span>
                          <Switch checked={expert.available} onCheckedChange={() => handleToggleAvailable(expert)} />
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => openEditModal(expert)} className="gap-1.5">
                            <Pencil className="h-3.5 w-3.5" />수정
                          </Button>
                          <Button variant="ghost" size="sm" className="gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => setDeleteTarget({ id: expert.id, type: "expert", name: expert.name })}>
                            <Trash2 className="h-3.5 w-3.5" />삭제
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-foreground">알림 센터</h2>
                <p className="text-sm text-muted-foreground">
                  읽지 않은 알림 {notifications.filter(n => !n.is_read).length}건 / 전체 {notifications.length}건
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={fetchNotifications} disabled={notifLoading} className="gap-1.5">
                  <RefreshCw className={`h-4 w-4 ${notifLoading ? "animate-spin" : ""}`} />
                  <span className="hidden sm:inline">새로고침</span>
                </Button>
                {notifications.some(n => !n.is_read) && (
                  <Button variant="outline" size="sm" onClick={markAllRead} className="gap-1.5">
                    <Check className="h-4 w-4" />
                    <span className="hidden sm:inline">모두 읽음</span>
                  </Button>
                )}
              </div>
            </div>

            {notifications.length === 0 && !notifLoading ? (
              <Card className="shadow-card">
                <CardContent className="flex flex-col items-center gap-3 py-16">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
                    <Bell className="h-7 w-7 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">아직 알림이 없습니다.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-2">
                {notifications.map((n) => (
                  <Card
                    key={n.id}
                    className={`shadow-card transition-all hover:shadow-card-hover cursor-pointer ${!n.is_read ? "border-l-4 border-l-warning bg-warning/5" : ""}`}
                    onClick={() => !n.is_read && markNotifRead(n.id)}
                  >
                    <CardContent className="flex items-start gap-3 p-4">
                      <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${!n.is_read ? "bg-warning/10" : "bg-muted"}`}>
                        {!n.is_read ? <BellDot className="h-4 w-4 text-warning" /> : <Bell className="h-4 w-4 text-muted-foreground" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className={`text-sm font-semibold ${!n.is_read ? "text-foreground" : "text-muted-foreground"}`}>{n.title}</h3>
                          {!n.is_read && <span className="inline-block h-2 w-2 rounded-full bg-warning" />}
                        </div>
                        <p className="mt-0.5 text-sm text-muted-foreground leading-relaxed">{n.message}</p>
                        <p className="mt-1 text-xs text-muted-foreground/70">
                          {format(new Date(n.created_at), "yyyy.MM.dd HH:mm", { locale: ko })}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Matching Tab */}
          <TabsContent value="matching">
            <div className="mb-5">
              <h2 className="text-xl font-bold text-foreground">전우 매칭 관리</h2>
              <p className="text-sm text-muted-foreground">등록된 사용자를 확인하고 수동/자동 매칭을 관리합니다.</p>
            </div>

            <Tabs defaultValue="manual" className="mb-6">
              <TabsList className="mb-4 h-10 w-full justify-start rounded-xl bg-secondary/60 p-1 sm:w-auto">
                <TabsTrigger value="manual" className="gap-1.5 rounded-lg px-4 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                  <UserCog className="h-4 w-4" />수동 매칭
                </TabsTrigger>
                <TabsTrigger value="auto" className="gap-1.5 rounded-lg px-4 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                  <RefreshCw className="h-4 w-4" />자동 매칭
                </TabsTrigger>
              </TabsList>

              {/* Tab A: Manual Matching */}
              <TabsContent value="manual" className="space-y-6">
                <Card className="shadow-card">
                  <CardContent className="p-0">
                    <div className="border-b border-border px-5 py-3 flex items-center justify-between gap-3">
                      <h3 className="text-sm font-semibold text-foreground shrink-0">대기 사용자 목록 ({waitingUsers.filter(u => !u.is_matched).length}명)</h3>
                      <div className="flex items-center gap-2 flex-1 max-w-sm">
                        <Input
                          placeholder="이름, 부대, 연도 검색..."
                          value={matchSearchQuery}
                          onChange={(e) => { setMatchSearchQuery(e.target.value); setMatchPage(0); }}
                          className="h-8 text-xs"
                        />
                        <Button variant="outline" size="sm" onClick={fetchWaitingUsers} disabled={waitingLoading} className="gap-1.5 shrink-0">
                          <RefreshCw className={`h-3.5 w-3.5 ${waitingLoading ? "animate-spin" : ""}`} />
                        </Button>
                      </div>
                    </div>
                    <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
                      <Table>
                         <TableHeader>
                          <TableRow>
                            <TableHead className="w-10"></TableHead>
                            <TableHead>이름</TableHead>
                            <TableHead>부대</TableHead>
                            <TableHead>기수/연도</TableHead>
                            <TableHead>전화번호</TableHead>
                            <TableHead>인증비용</TableHead>
                            <TableHead>상태</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {(() => {
                            const filtered = waitingUsers.filter(u => {
                              if (u.is_matched) return false;
                              if (!matchSearchQuery.trim()) return true;
                              const q = matchSearchQuery.toLowerCase();
                              return `${u.name} ${u.unit} ${u.service_year} ${u.phone}`.toLowerCase().includes(q);
                            });
                            const totalPages = Math.ceil(filtered.length / MATCH_PAGE_SIZE);
                            const currentPage = Math.min(matchPage, Math.max(0, totalPages - 1));
                            const paged = filtered.slice(currentPage * MATCH_PAGE_SIZE, (currentPage + 1) * MATCH_PAGE_SIZE);
                            return (
                              <>
                                {paged.map((u) => (
                            <TableRow
                              key={u.id}
                              className={`cursor-pointer transition-colors ${matchSelectA === u.id || matchSelectB === u.id ? "bg-primary/10" : ""}`}
                              onClick={() => {
                                if (!matchSelectA) setMatchSelectA(u.id);
                                else if (matchSelectA === u.id) setMatchSelectA("");
                                else if (!matchSelectB && u.id !== matchSelectA) setMatchSelectB(u.id);
                                else if (matchSelectB === u.id) setMatchSelectB("");
                              }}
                            >
                              <TableCell>
                                <div className={`h-4 w-4 rounded border ${matchSelectA === u.id || matchSelectB === u.id ? "bg-primary border-primary" : "border-border"}`} />
                              </TableCell>
                              <TableCell className="font-medium">{u.name}</TableCell>
                              <TableCell>{u.unit}</TableCell>
                              <TableCell><Badge variant="outline" className="text-xs">{u.service_year}</Badge></TableCell>
                              <TableCell className="text-muted-foreground text-xs">{u.phone}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className={`text-xs ${u.match_fee_type === "paid" ? "border-primary/30 bg-primary/10 text-primary" : ""}`}>
                                  {u.match_fee_type === "paid" ? `₩${(u.match_fee || 0).toLocaleString()}` : "무료"}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="text-xs border-success/30 bg-success/10 text-success">대기중</Badge>
                              </TableCell>
                            </TableRow>
                                ))}
                                {filtered.length === 0 && (
                            <TableRow>
                            <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                등록된 대기 사용자가 없습니다.
                              </TableCell>
                            </TableRow>
                                )}
                                {totalPages > 1 && (
                                  <TableRow>
                                    <TableCell colSpan={7}>
                                      <div className="flex items-center justify-between py-2">
                                        <span className="text-xs text-muted-foreground">총 {filtered.length}명 (페이지 {currentPage + 1}/{totalPages})</span>
                                        <div className="flex gap-1">
                                          <Button variant="outline" size="sm" className="h-7 text-xs" disabled={currentPage === 0} onClick={() => setMatchPage(currentPage - 1)}>이전</Button>
                                          <Button variant="outline" size="sm" className="h-7 text-xs" disabled={currentPage >= totalPages - 1} onClick={() => setMatchPage(currentPage + 1)}>다음</Button>
                                        </div>
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                )}
                              </>
                            );
                          })()}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex items-center gap-3">
                  <p className="text-sm text-muted-foreground">
                    선택: {matchSelectA ? waitingUsers.find(u => u.id === matchSelectA)?.name : "—"} ↔ {matchSelectB ? waitingUsers.find(u => u.id === matchSelectB)?.name : "—"}
                  </p>
                  <Button
                    variant="warmBrown"
                    className="gap-1.5"
                    disabled={!matchSelectA || !matchSelectB}
                    onClick={async () => {
                      const { error } = await supabase.from("buddy_matches").insert({
                        user_a_id: matchSelectA,
                        user_b_id: matchSelectB,
                        match_type: "manual",
                        status: "verified",
                      } as any);
                      if (error) {
                        toast({ title: "매칭 실패", description: error.message, variant: "destructive" });
                      } else {
                        const a = waitingUsers.find(u => u.id === matchSelectA);
                        const b = waitingUsers.find(u => u.id === matchSelectB);
                        toast({ title: "수동 매칭 완료", description: `${a?.name}님과 ${b?.name}님이 매칭되었습니다.` });
                        setMatchSelectA("");
                        setMatchSelectB("");
                        fetchMatches();
                        fetchWaitingUsers();
                        fetchNotifications();
                      }
                    }}
                  >
                    <UserCheck className="h-4 w-4" />수동 매칭 실행
                  </Button>
                </div>
              </TabsContent>

              {/* Tab B: Auto Matching */}
              <TabsContent value="auto" className="space-y-6">
                <Card className="shadow-card">
                  <CardContent className="p-6 text-center">
                    <RefreshCw className="mx-auto h-10 w-10 text-primary/40" />
                    <h3 className="mt-3 text-lg font-semibold text-foreground">자동 매칭 시스템</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      동일한 부대 및 복무 연도를 가진 사용자를 자동으로 찾아 매칭합니다.
                    </p>
                    <p className="mt-1 text-xs text-primary font-medium">기본 인증 비용: ₩20,000</p>
                    <Button
                      variant="warmBrown"
                      className="mt-4 gap-1.5"
                      onClick={async () => {
                        const unmatched = waitingUsers.filter(u => !u.is_matched);
                        // Group by unit + service_year
                        const groups: Record<string, WaitingUser[]> = {};
                        unmatched.forEach((u) => {
                          const key = `${u.unit}|${u.service_year}`;
                          if (!groups[key]) groups[key] = [];
                          groups[key].push(u);
                        });

                        let newMatches = 0;
                        for (const group of Object.values(groups)) {
                          if (group.length >= 2) {
                            for (let i = 0; i < group.length - 1; i += 2) {
                              const { error } = await supabase.from("buddy_matches").insert({
                                user_a_id: group[i].id,
                                user_b_id: group[i + 1].id,
                                match_type: "auto",
                                status: "pending",
                              } as any);
                              if (!error) newMatches++;
                            }
                          }
                        }

                        toast({
                          title: "자동 매칭 완료",
                          description: newMatches > 0 ? `${newMatches}건의 새로운 매칭이 발견되었습니다.` : "새로운 매칭이 없습니다.",
                        });
                        fetchMatches();
                        fetchWaitingUsers();
                        fetchNotifications();
                      }}
                    >
                      <RefreshCw className="h-4 w-4" />자동 매칭 시스템 가동
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Matching Status */}
            <Card className="shadow-card">
              <CardContent className="p-0">
                <div className="border-b border-border px-5 py-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground">매칭 현황 ({matches.length}건)</h3>
                  <Button variant="outline" size="sm" onClick={fetchMatches} disabled={matchesLoading} className="gap-1.5">
                    <RefreshCw className={`h-3.5 w-3.5 ${matchesLoading ? "animate-spin" : ""}`} />
                  </Button>
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>사용자 A</TableHead>
                        <TableHead>사용자 B</TableHead>
                        <TableHead>타입</TableHead>
                        <TableHead>상태</TableHead>
                        <TableHead>날짜</TableHead>
                        <TableHead>관리</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {matches.map((m) => (
                        <TableRow key={m.id}>
                          <TableCell>
                            <div
                              className="cursor-pointer group"
                              onClick={() => toast({ title: `${m.user_a?.name || "—"} 연락처`, description: `📞 ${m.user_a?.phone || "없음"}${m.user_a?.email ? `\n📧 ${m.user_a.email}` : ""}` })}
                            >
                              <p className="font-medium text-foreground group-hover:text-primary transition-colors">{m.user_a?.name || "—"}</p>
                              <p className="text-xs text-muted-foreground">{m.user_a?.unit || ""}</p>
                              <p className="text-xs text-primary/60 group-hover:text-primary"><Phone className="inline h-3 w-3 mr-0.5" />클릭하여 연락처 보기</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div
                              className="cursor-pointer group"
                              onClick={() => toast({ title: `${m.user_b?.name || "—"} 연락처`, description: `📞 ${m.user_b?.phone || "없음"}${m.user_b?.email ? `\n📧 ${m.user_b.email}` : ""}` })}
                            >
                              <p className="font-medium text-foreground group-hover:text-primary transition-colors">{m.user_b?.name || "—"}</p>
                              <p className="text-xs text-muted-foreground">{m.user_b?.unit || ""}</p>
                              <p className="text-xs text-primary/60 group-hover:text-primary"><Phone className="inline h-3 w-3 mr-0.5" />클릭하여 연락처 보기</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {m.match_type === "manual" ? "수동" : "자동"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={
                              m.status === "verified" ? "border-success/30 bg-success/10 text-success" :
                              m.status === "pending" ? "border-warning/30 bg-warning/10 text-warning" :
                              "border-destructive/30 bg-destructive/10 text-destructive"
                            }>
                              {m.status === "verified" ? "인증완료" : m.status === "pending" ? "대기중" : "거절"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">{format(new Date(m.created_at), "yyyy.MM.dd", { locale: ko })}</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              {m.status === "pending" && (
                                <Button variant="outline" size="sm" className="h-7 text-xs gap-1"
                                  onClick={async () => {
                                    await supabase.from("buddy_matches").update({ status: "verified" } as any).eq("id", m.id);
                                    fetchMatches();
                                    toast({ title: "매칭 승인 완료" });
                                  }}>
                                  <CheckCircle2 className="h-3 w-3" />승인
                                </Button>
                              )}
                              <Button variant="outline" size="sm" className="h-7 text-xs gap-1 text-warning hover:bg-warning/10"
                                onClick={async () => {
                                  if (m.user_a_id) await supabase.from("buddy_waiting_users").update({ is_matched: false } as any).eq("id", m.user_a_id);
                                  if (m.user_b_id) await supabase.from("buddy_waiting_users").update({ is_matched: false } as any).eq("id", m.user_b_id);
                                  await supabase.from("buddy_matches").delete().eq("id", m.id);
                                  fetchMatches();
                                  fetchWaitingUsers();
                                  toast({ title: "매칭 취소 완료", description: "사용자가 대기 목록으로 복귀되었습니다." });
                                }}>
                                <RefreshCw className="h-3 w-3" />취소
                              </Button>
                              <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive hover:bg-destructive/10"
                                onClick={async () => {
                                  await supabase.from("buddy_matches").delete().eq("id", m.id);
                                  fetchMatches();
                                  toast({ title: "매칭 삭제 완료", description: "매칭 기록이 완전히 삭제되었습니다." });
                                }}>
                                <Trash2 className="h-3 w-3" />삭제
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {matches.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                            매칭 기록이 없습니다.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Expert Edit Modal - with multilingual tabs */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{isNewExpert ? "전문가 추가" : "전문가 수정"}</DialogTitle>
            <DialogDescription>
              {isNewExpert ? "새로운 전문가 정보를 입력하세요." : "전문가 정보를 수정하세요."}
            </DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="ko" className="pt-2">
            <TabsList className="mb-4 w-full">
              <TabsTrigger value="ko" className="flex-1">🇰🇷 한국어</TabsTrigger>
              <TabsTrigger value="en" className="flex-1">🇺🇸 English</TabsTrigger>
              <TabsTrigger value="ja" className="flex-1">🇯🇵 日本語</TabsTrigger>
              <TabsTrigger value="zh" className="flex-1">🇨🇳 中文</TabsTrigger>
            </TabsList>

            {/* Korean (base) */}
            <TabsContent value="ko" className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {renderLangField("이름 *", "name", "홍길동")}
                {renderLangField("전문 분야 *", "expertise", "상속법")}
              </div>
              {renderLangField("경력 소개", "career", "서울대 법학과 졸업 · 변호사 28년 경력")}
              {renderLangField("상세 설명", "description", undefined, true)}
              {renderLangField("상담 비용", "consult_fee")}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">태그 (쉼표로 구분)</label>
                <Input value={editForm.tags.join(", ")} onChange={(e) => setEditForm(p => ({ ...p, tags: e.target.value.split(",").map(s => s.trim()).filter(Boolean) }))} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">전문 분야 목록 (쉼표로 구분)</label>
                <Input value={editForm.specialties.join(", ")} onChange={(e) => setEditForm(p => ({ ...p, specialties: e.target.value.split(",").map(s => s.trim()).filter(Boolean) }))} />
              </div>
            </TabsContent>

            {/* English */}
            <TabsContent value="en" className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {renderLangField("Name", "name_en", "Name in English")}
                {renderLangField("Expertise", "expertise_en", "Inheritance Law")}
              </div>
              {renderLangField("Career", "career_en", "28 years of experience")}
              {renderLangField("Description", "description_en", undefined, true)}
              {renderLangField("Consultation Fee", "consult_fee_en")}
              {renderLangArrayField("Tags (comma separated)", "tags_en")}
              {renderLangArrayField("Specialties (comma separated)", "specialties_en")}
            </TabsContent>

            {/* Japanese */}
            <TabsContent value="ja" className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {renderLangField("名前", "name_ja", "日本語の名前")}
                {renderLangField("専門分野", "expertise_ja", "相続法")}
              </div>
              {renderLangField("経歴", "career_ja")}
              {renderLangField("説明", "description_ja", undefined, true)}
              {renderLangField("相談料", "consult_fee_ja")}
              {renderLangArrayField("タグ（カンマ区切り）", "tags_ja")}
              {renderLangArrayField("専門分野リスト（カンマ区切り）", "specialties_ja")}
            </TabsContent>

            {/* Chinese */}
            <TabsContent value="zh" className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {renderLangField("姓名", "name_zh", "中文姓名")}
                {renderLangField("专业领域", "expertise_zh", "继承法")}
              </div>
              {renderLangField("经历", "career_zh")}
              {renderLangField("说明", "description_zh", undefined, true)}
              {renderLangField("咨询费", "consult_fee_zh")}
              {renderLangArrayField("标签（逗号分隔）", "tags_zh")}
              {renderLangArrayField("专业列表（逗号分隔）", "specialties_zh")}
            </TabsContent>
          </Tabs>

          {/* Common fields */}
          <div className="space-y-4 border-t border-border pt-4">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">내부 검증 평가 최우수</label>
                <Input type="number" value={editForm.experience_score} onChange={(e) => setEditForm(p => ({ ...p, experience_score: Number(e.target.value) }))} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">고객 만족도 최우선 배정</label>
                <Input type="number" value={editForm.match_rate} onChange={(e) => setEditForm(p => ({ ...p, match_rate: Number(e.target.value) }))} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">정렬 순서</label>
                <Input type="number" value={editForm.sort_order} onChange={(e) => setEditForm(p => ({ ...p, sort_order: Number(e.target.value) }))} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={editForm.available} onCheckedChange={(v) => setEditForm(p => ({ ...p, available: v }))} />
              <span className="text-sm text-foreground">{editForm.available ? "상담 가능" : "예약 필요"}</span>
            </div>
            <Button className="h-11 w-full" onClick={handleSaveExpert} disabled={saving || !editForm.name || !editForm.expertise}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {isNewExpert ? "추가하기" : "저장하기"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <DialogTitle className="text-center">삭제 확인</DialogTitle>
            <DialogDescription className="text-center">
              <span className="font-semibold text-foreground">{deleteTarget?.name}</span>
              {deleteTarget?.type === "consultation" ? " 님의 상담 신청을" : " 전문가 정보를"} 삭제하시겠습니까?
              <br />
              <span className="text-xs">삭제된 데이터는 복구할 수 없습니다.</span>
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="h-10 flex-1" onClick={() => setDeleteTarget(null)} disabled={deleting}>취소</Button>
            <Button variant="destructive" className="h-10 flex-1 gap-1.5" onClick={handleConfirmDelete} disabled={deleting}>
              {deleting && <Loader2 className="h-4 w-4 animate-spin" />}삭제
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;
