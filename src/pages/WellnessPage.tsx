/**
 * WellnessPage — ZIVO Health & Wellness hub
 * Single page with sub-sections routed via URL: /wellness, /wellness/activity,
 * /wellness/workouts, /wellness/vitals, /wellness/mindfulness, /wellness/telehealth,
 * /wellness/meds, /wellness/nutrition, /wellness/goals
 */
import { useMemo } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  ArrowLeft, Activity, Dumbbell, Heart, Brain, Stethoscope, Pill,
  UtensilsCrossed, Trophy, Footprints, Flame, Droplets, Moon,
  ChevronRight, Plus, TrendingUp, Calendar, Clock, Bell, Target,
  Video, Phone, Plus as PlusIcon, Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import SEOHead from "@/components/SEOHead";
import ZivoMobileNav from "@/components/app/ZivoMobileNav";

type SectionKey =
  | "hub"
  | "activity"
  | "workouts"
  | "vitals"
  | "mindfulness"
  | "telehealth"
  | "meds"
  | "nutrition"
  | "goals";

const SECTION_TITLES: Record<SectionKey, string> = {
  hub: "Health & Wellness",
  activity: "Activity Tracker",
  workouts: "Workouts",
  vitals: "Health Vitals",
  mindfulness: "Mindfulness",
  telehealth: "Telehealth",
  meds: "Medications",
  nutrition: "Nutrition",
  goals: "Wellness Goals",
};

const HUB_CARDS: { key: SectionKey; icon: any; label: string; desc: string; gradient: string }[] = [
  { key: "activity", icon: Activity, label: "Activity", desc: "Steps, calories & moves", gradient: "from-emerald-500 via-teal-400 to-cyan-400" },
  { key: "workouts", icon: Dumbbell, label: "Workouts", desc: "Plans & guides", gradient: "from-rose-500 via-red-500 to-orange-400" },
  { key: "vitals", icon: Heart, label: "Vitals", desc: "HR, BP & sleep", gradient: "from-pink-500 via-fuchsia-500 to-purple-500" },
  { key: "mindfulness", icon: Brain, label: "Mindfulness", desc: "Meditation & calm", gradient: "from-violet-500 via-purple-500 to-indigo-500" },
  { key: "telehealth", icon: Stethoscope, label: "Telehealth", desc: "Talk to a doctor", gradient: "from-sky-500 via-blue-500 to-indigo-500" },
  { key: "meds", icon: Pill, label: "Medications", desc: "Reminders & refills", gradient: "from-amber-500 via-orange-500 to-rose-400" },
  { key: "nutrition", icon: UtensilsCrossed, label: "Nutrition", desc: "Meals & macros", gradient: "from-lime-500 via-green-500 to-emerald-500" },
  { key: "goals", icon: Trophy, label: "Goals", desc: "Targets & streaks", gradient: "from-yellow-500 via-amber-400 to-orange-400" },
];

function resolveSection(slug?: string): SectionKey {
  if (!slug) return "hub";
  const k = slug.toLowerCase();
  if (k in SECTION_TITLES) return k as SectionKey;
  return "hub";
}

export default function WellnessPage() {
  const navigate = useNavigate();
  const { section } = useParams<{ section?: string }>();
  const active = useMemo(() => resolveSection(section), [section]);

  const title = SECTION_TITLES[active];

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background pb-24 safe-area-bottom">
      <SEOHead title={`${title} – ZIVO`} description="Track your health, workouts, vitals and wellness goals." noIndex />

      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/85 backdrop-blur-xl border-b border-border/40 flex items-center gap-2 px-3 pb-2 pt-safe"
        style={{ paddingTop: "var(--zivo-safe-top-sticky, env(safe-area-inset-top, 0px))" }}>
        <button
          onClick={() => (active === "hub" ? navigate("/more") : navigate("/wellness"))}
          aria-label="Go back"
          className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-muted/60 active:scale-90 transition-transform text-foreground"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="font-bold text-[17px] flex-1 truncate">{title}</h1>
      </header>

      <main className="flex-1 px-4 pt-4 lg:max-w-3xl lg:mx-auto w-full">
        {active === "hub" && <HubView />}
        {active === "activity" && <ActivityView />}
        {active === "workouts" && <WorkoutsView />}
        {active === "vitals" && <VitalsView />}
        {active === "mindfulness" && <MindfulnessView />}
        {active === "telehealth" && <TelehealthView />}
        {active === "meds" && <MedsView />}
        {active === "nutrition" && <NutritionView />}
        {active === "goals" && <GoalsView />}
      </main>

      <ZivoMobileNav />
    </div>
  );
}

/* ─────────────────────────  Hub  ───────────────────────── */
function HubView() {
  return (
    <div className="space-y-5">
      {/* Today summary */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-cyan-500/10 border border-emerald-500/20 p-4"
      >
        <p className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Today</p>
        <p className="mt-1 text-lg font-bold">You're 68% to your daily goal</p>
        <Progress value={68} className="mt-2 h-2" />
        <div className="grid grid-cols-4 gap-2 mt-4">
          {[
            { icon: Footprints, label: "Steps", value: "6,842" },
            { icon: Flame, label: "Cal", value: "412" },
            { icon: Droplets, label: "Water", value: "5/8" },
            { icon: Moon, label: "Sleep", value: "7h 24m" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <s.icon className="w-4 h-4 mx-auto text-emerald-600 dark:text-emerald-400" />
              <p className="text-[13px] font-bold mt-1">{s.value}</p>
              <p className="text-[10px] text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Sub-sections */}
      <div className="grid grid-cols-2 gap-3">
        {HUB_CARDS.map((card, i) => (
          <Link key={card.key} to={`/wellness/${card.key}`} className="contents">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04, type: "spring", stiffness: 280, damping: 22 }}
              className={cn(
                "rounded-2xl bg-gradient-to-br p-4 h-[112px] flex flex-col justify-between shadow-md active:scale-95 transition-transform",
                card.gradient,
              )}
            >
              <card.icon className="w-5 h-5 text-white/90" />
              <div>
                <p className="text-white font-bold text-[14px] leading-tight">{card.label}</p>
                <p className="text-white/80 text-[11px] mt-0.5">{card.desc}</p>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <Card className="p-4">
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Quick actions</p>
        <div className="space-y-1.5">
          <ActionRow
            icon={PlusIcon}
            label="Log a workout"
            onClick={() => toast.info("Workout logging is coming soon", { description: "We'll notify you when it ships." })}
          />
          <ActionRow
            icon={Droplets}
            label="Log water intake"
            onClick={() => toast.info("Water tracking is coming soon", { description: "We'll notify you when it ships." })}
          />
          <ActionRow
            icon={UtensilsCrossed}
            label="Log a meal"
            onClick={() => toast.info("Meal logging is coming soon", { description: "We'll notify you when it ships." })}
          />
          <ActionRow
            icon={Heart}
            label="Add a vital reading"
            onClick={() => toast.info("Vital tracking is coming soon", { description: "We'll notify you when it ships." })}
          />
        </div>
      </Card>
    </div>
  );
}

function ActionRow({ icon: Icon, label, onClick }: { icon: any; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/60 active:scale-[0.98] transition-all text-left"
    >
      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <span className="flex-1 text-[13px] font-medium">{label}</span>
      <ChevronRight className="w-4 h-4 text-muted-foreground/40" />
    </button>
  );
}

/* ─────────────────────────  Activity  ───────────────────────── */
function ActivityView() {
  return (
    <div className="space-y-4">
      <Card className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Today's steps</p>
            <p className="text-3xl font-bold">6,842</p>
            <p className="text-[12px] text-muted-foreground mt-1">Goal: 10,000</p>
          </div>
          <div className="h-16 w-16 rounded-full border-4 border-emerald-500/30 border-t-emerald-500 animate-pulse flex items-center justify-center">
            <Footprints className="w-6 h-6 text-emerald-500" />
          </div>
        </div>
        <Progress value={68} className="mt-4 h-2" />
      </Card>

      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: Flame, label: "Calories", value: "412", unit: "kcal" },
          { icon: Clock, label: "Active time", value: "47", unit: "min" },
          { icon: TrendingUp, label: "Distance", value: "4.8", unit: "km" },
        ].map((s) => (
          <Card key={s.label} className="p-3 text-center">
            <s.icon className="w-5 h-5 mx-auto text-orange-500" />
            <p className="text-lg font-bold mt-1">{s.value}</p>
            <p className="text-[10px] text-muted-foreground">{s.unit}</p>
            <p className="text-[10px] text-muted-foreground/80 mt-0.5">{s.label}</p>
          </Card>
        ))}
      </div>

      <Card className="p-4">
        <p className="font-semibold text-[14px] mb-3">This week</p>
        <div className="flex items-end justify-between h-24 gap-2">
          {[60, 80, 45, 90, 70, 85, 68].map((h, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full rounded-t bg-gradient-to-t from-emerald-500 to-teal-400" style={{ height: `${h}%` }} />
              <span className="text-[10px] text-muted-foreground">{["M", "T", "W", "T", "F", "S", "S"][i]}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ─────────────────────────  Workouts  ───────────────────────── */
function WorkoutsView() {
  const plans = [
    { name: "Full body strength", duration: "45 min", level: "Intermediate", color: "from-rose-500 to-orange-500" },
    { name: "Morning yoga flow", duration: "20 min", level: "Beginner", color: "from-violet-500 to-purple-500" },
    { name: "HIIT cardio blast", duration: "30 min", level: "Advanced", color: "from-red-500 to-pink-500" },
    { name: "Core & abs focus", duration: "15 min", level: "All levels", color: "from-amber-500 to-orange-500" },
    { name: "Recovery stretch", duration: "10 min", level: "Beginner", color: "from-emerald-500 to-teal-500" },
  ];
  return (
    <div className="space-y-4">
      <Card className="p-4 bg-gradient-to-br from-rose-500/10 to-orange-500/10 border-rose-500/20">
        <p className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider">Today</p>
        <p className="font-bold text-[15px] mt-1">Full body strength • 45 min</p>
        <Button size="sm" className="mt-3">
          <Dumbbell className="w-4 h-4 mr-1.5" />
          Start workout
        </Button>
      </Card>

      <div>
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Recommended plans</p>
        <div className="space-y-2">
          {plans.map((p) => (
            <Card key={p.name} className="p-3 flex items-center gap-3 active:scale-[0.99] transition-transform">
              <div className={cn("w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center shrink-0", p.color)}>
                <Dumbbell className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[13px] truncate">{p.name}</p>
                <p className="text-[11px] text-muted-foreground">{p.duration} • {p.level}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground/40" />
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────  Vitals  ───────────────────────── */
function VitalsView() {
  const vitals = [
    { icon: Heart, label: "Heart rate", value: "72", unit: "bpm", color: "text-rose-500" },
    { icon: Activity, label: "Blood pressure", value: "118/76", unit: "mmHg", color: "text-blue-500" },
    { icon: Droplets, label: "Blood oxygen", value: "98%", unit: "SpO₂", color: "text-cyan-500" },
    { icon: Moon, label: "Sleep", value: "7h 24m", unit: "last night", color: "text-violet-500" },
    { icon: TrendingUp, label: "Weight", value: "68.4", unit: "kg", color: "text-emerald-500" },
    { icon: Flame, label: "Body temp", value: "36.6", unit: "°C", color: "text-orange-500" },
  ];
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {vitals.map((v) => (
          <Card key={v.label} className="p-4">
            <v.icon className={cn("w-5 h-5", v.color)} />
            <p className="text-[11px] text-muted-foreground mt-2">{v.label}</p>
            <p className="text-xl font-bold mt-0.5">{v.value}</p>
            <p className="text-[10px] text-muted-foreground/70">{v.unit}</p>
          </Card>
        ))}
      </div>
      <Button className="w-full" variant="outline">
        <Plus className="w-4 h-4 mr-1.5" />
        Add a reading
      </Button>
    </div>
  );
}

/* ─────────────────────────  Mindfulness  ───────────────────────── */
function MindfulnessView() {
  const sessions = [
    { name: "Morning calm", duration: "5 min", category: "Breathing" },
    { name: "Stress relief", duration: "10 min", category: "Meditation" },
    { name: "Sleep wind-down", duration: "15 min", category: "Sleep" },
    { name: "Focus session", duration: "20 min", category: "Productivity" },
  ];
  return (
    <div className="space-y-4">
      <Card className="p-5 bg-gradient-to-br from-violet-500/10 to-purple-500/10 border-violet-500/20 text-center">
        <Brain className="w-10 h-10 mx-auto text-violet-500" />
        <p className="font-bold text-[15px] mt-3">3-day streak</p>
        <p className="text-[12px] text-muted-foreground">Keep going — you're building a habit</p>
        <Button className="mt-3" size="sm">Start a session</Button>
      </Card>

      <div>
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Featured sessions</p>
        <div className="space-y-2">
          {sessions.map((s) => (
            <Card key={s.name} className="p-3 flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shrink-0">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[13px]">{s.name}</p>
                <p className="text-[11px] text-muted-foreground">{s.category} • {s.duration}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground/40" />
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────  Telehealth  ───────────────────────── */
function TelehealthView() {
  const docs = [
    { name: "Dr. Sarah Chen", specialty: "General Practice", available: "Available now", color: "bg-emerald-500" },
    { name: "Dr. Marcus Reed", specialty: "Cardiology", available: "Next: 2:30 PM", color: "bg-amber-500" },
    { name: "Dr. Priya Patel", specialty: "Dermatology", available: "Available now", color: "bg-emerald-500" },
    { name: "Dr. James Liu", specialty: "Mental Health", available: "Tomorrow", color: "bg-muted-foreground" },
  ];
  return (
    <div className="space-y-4">
      <Card className="p-4 bg-gradient-to-br from-sky-500/10 to-blue-500/10 border-sky-500/20">
        <Stethoscope className="w-6 h-6 text-sky-500" />
        <p className="font-bold text-[15px] mt-2">Need to talk to a doctor?</p>
        <p className="text-[12px] text-muted-foreground mt-0.5">Book a video or voice consultation in minutes.</p>
        <div className="flex gap-2 mt-3">
          <Button size="sm"><Video className="w-4 h-4 mr-1.5" />Video</Button>
          <Button size="sm" variant="outline"><Phone className="w-4 h-4 mr-1.5" />Voice</Button>
        </div>
      </Card>

      <div>
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Available providers</p>
        <div className="space-y-2">
          {docs.map((d) => (
            <Card key={d.name} className="p-3 flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sky-500 to-blue-500 flex items-center justify-center shrink-0 text-white font-bold">
                {d.name.split(" ")[1][0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[13px]">{d.name}</p>
                <p className="text-[11px] text-muted-foreground">{d.specialty}</p>
              </div>
              <div className="text-right">
                <span className={cn("inline-block w-2 h-2 rounded-full", d.color)} />
                <p className="text-[10px] text-muted-foreground mt-0.5">{d.available}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────  Medications  ───────────────────────── */
function MedsView() {
  const meds = [
    { name: "Vitamin D3", dose: "1000 IU", schedule: "Daily • 8:00 AM", next: "Tomorrow" },
    { name: "Omega-3", dose: "1 capsule", schedule: "Daily • with breakfast", next: "Tomorrow" },
    { name: "Magnesium", dose: "400 mg", schedule: "Daily • bedtime", next: "Tonight" },
  ];
  return (
    <div className="space-y-4">
      <Card className="p-4 bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20">
        <p className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider">Reminders</p>
        <p className="font-bold text-[15px] mt-1">3 active medications</p>
        <p className="text-[12px] text-muted-foreground">You've taken 2 of 3 today</p>
        <Progress value={66} className="mt-2 h-2" />
      </Card>

      <div className="space-y-2">
        {meds.map((m) => (
          <Card key={m.name} className="p-3 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/15 flex items-center justify-center shrink-0">
              <Pill className="w-5 h-5 text-amber-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-[13px]">{m.name}</p>
              <p className="text-[11px] text-muted-foreground">{m.dose} • {m.schedule}</p>
            </div>
            <div className="text-right">
              <Bell className="w-4 h-4 text-muted-foreground inline" />
              <p className="text-[10px] text-muted-foreground mt-0.5">{m.next}</p>
            </div>
          </Card>
        ))}
      </div>

      <Button className="w-full" variant="outline">
        <Plus className="w-4 h-4 mr-1.5" />
        Add medication
      </Button>
    </div>
  );
}

/* ─────────────────────────  Nutrition  ───────────────────────── */
function NutritionView() {
  const meals = [
    { name: "Breakfast", time: "8:30 AM", cal: 420, items: "Oatmeal, banana, coffee" },
    { name: "Lunch", time: "12:45 PM", cal: 580, items: "Grilled chicken salad" },
    { name: "Snack", time: "3:30 PM", cal: 180, items: "Greek yogurt & berries" },
  ];
  const macros = [
    { label: "Protein", value: 86, target: 120, color: "bg-rose-500" },
    { label: "Carbs", value: 142, target: 220, color: "bg-amber-500" },
    { label: "Fat", value: 48, target: 70, color: "bg-emerald-500" },
  ];
  return (
    <div className="space-y-4">
      <Card className="p-4">
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Today's intake</p>
        <p className="text-3xl font-bold mt-1">1,180 <span className="text-base font-normal text-muted-foreground">/ 2,000 kcal</span></p>
        <Progress value={59} className="mt-2 h-2" />
        <div className="grid grid-cols-3 gap-3 mt-4">
          {macros.map((m) => (
            <div key={m.label}>
              <p className="text-[11px] text-muted-foreground">{m.label}</p>
              <p className="text-sm font-bold">{m.value}<span className="text-[10px] font-normal text-muted-foreground">/{m.target}g</span></p>
              <div className="h-1.5 rounded-full bg-muted mt-1 overflow-hidden">
                <div className={cn("h-full", m.color)} style={{ width: `${(m.value / m.target) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="space-y-2">
        {meals.map((m) => (
          <Card key={m.name} className="p-3 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-green-500/15 flex items-center justify-center shrink-0">
              <UtensilsCrossed className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-[13px]">{m.name} • {m.time}</p>
              <p className="text-[11px] text-muted-foreground truncate">{m.items}</p>
            </div>
            <p className="text-[12px] font-bold text-muted-foreground">{m.cal} kcal</p>
          </Card>
        ))}
      </div>

      <Button className="w-full">
        <Plus className="w-4 h-4 mr-1.5" />
        Log a meal
      </Button>
    </div>
  );
}

/* ─────────────────────────  Goals  ───────────────────────── */
function GoalsView() {
  const goals = [
    { icon: Footprints, label: "10,000 steps daily", progress: 68, streak: "12 days", color: "text-emerald-500" },
    { icon: Droplets, label: "Drink 8 glasses water", progress: 62, streak: "5 days", color: "text-cyan-500" },
    { icon: Moon, label: "Sleep 7+ hours", progress: 100, streak: "3 days", color: "text-violet-500" },
    { icon: Dumbbell, label: "Workout 5x per week", progress: 60, streak: "2 weeks", color: "text-rose-500" },
    { icon: Brain, label: "Meditate daily", progress: 33, streak: "3 days", color: "text-purple-500" },
  ];
  return (
    <div className="space-y-4">
      <Card className="p-5 bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border-yellow-500/20 text-center">
        <Trophy className="w-10 h-10 mx-auto text-yellow-500" />
        <p className="font-bold text-[15px] mt-3">5 active goals</p>
        <p className="text-[12px] text-muted-foreground">3 on track today</p>
      </Card>

      <div className="space-y-2">
        {goals.map((g) => (
          <Card key={g.label} className="p-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-muted/60 flex items-center justify-center shrink-0">
                <g.icon className={cn("w-5 h-5", g.color)} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[13px]">{g.label}</p>
                <p className="text-[11px] text-muted-foreground">{g.streak} streak</p>
              </div>
              <div className="flex items-center gap-1 text-amber-500">
                <Star className="w-4 h-4 fill-current" />
                <span className="text-[12px] font-bold">{g.progress}%</span>
              </div>
            </div>
            <Progress value={g.progress} className="mt-2 h-1.5" />
          </Card>
        ))}
      </div>

      <Button className="w-full" variant="outline">
        <Target className="w-4 h-4 mr-1.5" />
        Add a goal
      </Button>
    </div>
  );
}
