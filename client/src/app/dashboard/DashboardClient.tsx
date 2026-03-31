"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Heart,
  ArrowLeft,
  TrendingUp,
  Award,
  Calendar,
  BookOpen,
  Brain,
  Sparkles,
  Target,
  BarChart3,
  PieChartIcon,
} from "lucide-react";
import jsPDF from "jspdf";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import axios from "axios";
import { toPng } from "html-to-image";
import { app } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  AreaChart,
  Area,
} from "recharts";

interface DashboardData {
  averageMood: number;
  totalMoods: number;
  averageSentiment: number;
  totalJournals: number;
  achievements: string[];

  moodTrend: { label: string; value: number }[];
  emotionalBalance: { category: string; score: number }[];
  engagementTrend: { week: string; engagement: number }[];
  moods: { mood: string; timestamp: string }[];
  journals: { createdAt: string }[];
}

const MOOD_SCALE = {
  1: "Anxious",
  2: "Sad",
  3: "Neutral",
  4: "Calm",
  5: "Happy",
};

const waitforchartload = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const getMoodEmoji = (moodValue: number): string => {
  if (moodValue >= 4.5) return "😊";
  if (moodValue >= 3.5) return "😌";
  if (moodValue >= 2.5) return "😐";
  if (moodValue >= 1.5) return "😢";
  return "😰";
};

const getMoodColor = (moodValue: number): string => {
  if (moodValue >= 4.5) return "text-yellow-500";
  if (moodValue >= 3.5) return "text-green-500";
  if (moodValue >= 2.5) return "text-gray-500";
  if (moodValue >= 1.5) return "text-blue-500";
  return "text-purple-500";
};

const getWeeklyActivityData = (moods: any[] = [], journals: any[] = []) => {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const map = days.map((day) => ({
    day,
    moods: 0,
    journals: 0,
  }));

  moods.forEach((m) => {
    const d = new Date(m.timestamp);
    map[d.getDay()].moods += 1;
  });

  journals.forEach((j) => {
    const d = new Date(j.createdAt);
    map[d.getDay()].journals += 1;
  });

  return map;
};

const getMoodDistribution = (moods: any[] = []) => {
  const map: Record<string, number> = {};

  moods.forEach((m) => {
    map[m.mood] = (map[m.mood] || 0) + 1;
  });

  return Object.entries(map).map(([mood, count]) => ({
    mood,
    count,
    emoji:
      mood === "happy"
        ? "😊"
        : mood === "calm"
        ? "😌"
        : mood === "neutral"
        ? "😐"
        : mood === "sad"
        ? "😢"
        : "😰",
  }));
};

const addCoverPage = (pdf: jsPDF, userName: string = "HopeHaven User") => {
  const w = pdf.internal.pageSize.getWidth();
  const h = pdf.internal.pageSize.getHeight();

  /* ======================
     Base background
  ====================== */
  pdf.setFillColor(255, 251, 245); // warm off-white
  pdf.rect(0, 0, w, h, "F");

  /* ======================
     Soft decorative blobs
     (mimics website glow)
  ====================== */
  pdf.setFillColor(255, 237, 213); // coral-100
  pdf.circle(40, 40, 35, "F");

  pdf.setFillColor(254, 215, 170); // orange-200
  pdf.circle(w - 30, 80, 45, "F");

  /* ======================
     Brand title
  ====================== */
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(36);
  pdf.setTextColor(124, 45, 18); // coral-800
  pdf.text("HopeHaven", w / 2, 85, { align: "center" });

  /* ======================
     Tagline
  ====================== */
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(16);
  pdf.setTextColor(180, 83, 9); // orange-600
  pdf.text("Your mental wellness, thoughtfully tracked", w / 2, 100, {
    align: "center",
  });

  /* ======================
     Main title
  ====================== */
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(26);
  pdf.setTextColor(15, 23, 42);
  pdf.text("Wellness Report", w / 2, 145, { align: "center" });

  const cardX = 30;
  const cardY = 170;
  const cardW = w - 60;
  const cardH = 75;

  pdf.setFillColor(255, 255, 255);
  pdf.roundedRect(cardX, cardY, cardW, cardH, 14, 14, "F");

  pdf.setDrawColor(254, 215, 170);
  pdf.setLineWidth(1);
  pdf.roundedRect(cardX, cardY, cardW, cardH, 14, 14);

  pdf.setFontSize(14);
  pdf.setTextColor(100, 116, 139);
  pdf.text("Prepared for", w / 2, cardY + 28, { align: "center" });

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(20);
  pdf.setTextColor(30, 41, 59);
  pdf.text(userName, w / 2, cardY + 48, { align: "center" });

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(12);
  pdf.setTextColor(148, 163, 184);
  pdf.text(
    `Generated on ${new Date().toLocaleDateString()}`,
    w / 2,
    cardY + 65,
    { align: "center" }
  );

  /* ======================
     Footer
  ====================== */
  pdf.setFontSize(11);
  pdf.setTextColor(180, 83, 9);
  pdf.text(
    "Mental wellness is a journey — one step at a time.",
    w / 2,
    h - 30,
    { align: "center" }
  );
};

const addPageNumbers = (pdf: jsPDF) => {
  const pageCount = pdf.getNumberOfPages();
  const w = pdf.internal.pageSize.getWidth();
  const h = pdf.internal.pageSize.getHeight();

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  pdf.setTextColor(148, 163, 184); // slate-400

  for (let i = 2; i <= pageCount; i++) {
    pdf.setPage(i);
    pdf.text(`Page ${i - 1} of ${pageCount - 1}`, w / 2, h - 10, {
      align: "center",
    });
  }
};

const downloadReport = async (userName: string) => {
  await waitforchartload(2000);

  const element = document.getElementById("dashboard-report");
  if (!element) return;

  const dataUrl = await toPng(element, {
    cacheBust: true,
    backgroundColor: "#ffffff",
    pixelRatio: 2,
  });

  const pdf = new jsPDF("p", "mm", "a4");

  // 1️⃣ Cover Page
  addCoverPage(pdf, userName);

  // 2️⃣ Dashboard Pages
  pdf.addPage();

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const marginX = 10;
  const marginY = 12;

  const usableWidth = pageWidth - marginX * 2;

  const img = new Image();
  img.src = dataUrl;
  await new Promise((resolve) => (img.onload = resolve));

  const imgHeight = (img.height * usableWidth) / img.width;

  let y = 0;
  let remainingHeight = imgHeight;

  while (remainingHeight > 0) {
    pdf.addImage(dataUrl, "PNG", marginX, y + marginY, usableWidth, imgHeight);

    remainingHeight -= pageHeight - marginY * 2;

    if (remainingHeight > 10) {
      pdf.addPage();
      y -= pageHeight - marginY * 2;
    }
  }

  // 3️⃣ Page Numbers
  addPageNumbers(pdf);

  pdf.save("HopeHaven_Dashboard_Report.pdf");
};

const renderActivityLabel = ({
  cx,
  cy,
  midAngle,
  outerRadius,
  percent,
  payload,
}: any) => {
  const RADIAN = Math.PI / 180;
  const radius = outerRadius + 18;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="#374151" // slate-700
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      fontSize={12}
      fontWeight={500}
    >
      {payload.name}
      <tspan
        x={x}
        dy="1.2em"
        fill="#6B7280" // slate-500
        fontSize={11}
      >
        {Math.round(percent * 100)}%
      </tspan>
    </text>
  );
};

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const auth = getAuth(app);
  const router = useRouter();

  useEffect(() => {
    setIsVisible(true);

    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        setUser(authUser);
        await fetchDashboardData(authUser);
      } else {
        router.push("/");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth, router]);

  const fetchDashboardData = async (authUser: any) => {
    try {
      const token = await authUser.getIdToken();
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDashboardData(response.data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse">
          <Heart className="w-12 h-12 text-coral-500 animate-pulse" />
        </div>
      </div>
    );
  }

  const activityData = [
    { name: "Mood Logs", value: dashboardData?.totalMoods || 0 },
    { name: "Journal Entries", value: dashboardData?.totalJournals || 0 },
  ];

  const weeklyActivityData = dashboardData
    ? getWeeklyActivityData(
        dashboardData.moods || [],
        dashboardData.journals || []
      )
    : [];

  const moodDistributionData = dashboardData
    ? getMoodDistribution(dashboardData.moods || [])
    : [];

  const COLORS = ["#FFB703", "#3B82F6"];

  const MOOD_COLORS = ["#FFB703", "#4ADE80", "#94A3B8", "#60A5FA", "#C084FC"];

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-coral-50/20 to-blue-50/20 relative overflow-hidden">
      <div className="absolute top-20 left-10 w-72 h-72 bg-coral-500/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-float animation-delay-200" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-3xl animate-pulse-gentle" />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/home")}
              className="rounded-full hover:bg-coral-100 transition-all duration-300 hover:scale-110"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-3xl font-bold bg-linear-to-r from-coral-500 via-orange-500 to-blue-500 bg-clip-text text-transparent">
              Wellness Dashboard
            </h1>
          </div>
          <Button
            onClick={() =>
              downloadReport(user?.displayName || "HopeHaven User")
            }
            className="bg-linear-to-r from-coral-500 to-orange-500 hover:from-coral-600 hover:to-orange-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Download Your Report
          </Button>
        </div>
      </header>

      {/* Main Content */}

      <section className="py-8 px-4 relative">
        <div className="max-w-7xl mx-auto">
          {/* Overview Section */}
          <div id="dashboard-report">
            <div
              className={`transition-all duration-1000 ${
                isVisible ? "animate-slide-up opacity-100" : "opacity-0"
              }`}
            >
              <div className="grid md:grid-cols-4 gap-6 mb-8">
                {/* Average Mood Card */}
                <Card className="border-0 bg-linear-to-br from-yellow-100/80 via-orange-100/80 to-coral-100/80 backdrop-blur-sm hover:shadow-2xl hover:scale-105 transition-all duration-500 animate-fade-in group">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold text-orange-700/80">
                        Average Mood
                      </p>
                      <div className="w-10 h-10 rounded-full bg-linear-to-br from-yellow-400 to-orange-500 flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                        <Target className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span
                        className={`text-5xl font-bold ${getMoodColor(
                          dashboardData?.averageMood || 0
                        )}`}
                      >
                        {dashboardData?.averageMood?.toFixed(1) || "0"}
                      </span>
                      <span className="text-3xl">
                        {getMoodEmoji(dashboardData?.averageMood || 0)}
                      </span>
                    </div>
                    <p className="text-xs text-orange-600 mt-2 font-medium">
                      {dashboardData && dashboardData.averageMood >= 4
                        ? "Excellent!"
                        : "Keep going!"}
                    </p>
                  </CardContent>
                </Card>

                {/* Total Mood Entries Card */}
                <Card className="border-0 bg-linear-to-br from-coral-100/80 via-pink-100/80 to-rose-100/80 backdrop-blur-sm hover:shadow-2xl hover:scale-105 transition-all duration-500 animate-fade-in animation-delay-100 group">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold text-coral-700/80">
                        Mood Logs
                      </p>
                      <div className="w-10 h-10 rounded-full bg-linear-to-br from-coral-400 to-pink-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Heart className="w-5 h-5 text-white fill-white animate-pulse-gentle" />
                      </div>
                    </div>
                    <span className="text-5xl font-bold text-coral-600">
                      {dashboardData?.totalMoods || 0}
                    </span>
                    <p className="text-xs text-coral-600 mt-2 font-medium">
                      Total check-ins
                    </p>
                  </CardContent>
                </Card>

                {/* Journal Entries Card */}
                <Card className="border-0 bg-linear-to-br from-blue-100/80 via-cyan-100/80 to-sky-100/80 backdrop-blur-sm hover:shadow-2xl hover:scale-105 transition-all duration-500 animate-fade-in animation-delay-200 group">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold text-blue-700/80">
                        Journal Entries
                      </p>
                      <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-400 to-cyan-500 flex items-center justify-center group-hover:rotate-6 transition-transform duration-300">
                        <BookOpen className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <span className="text-5xl font-bold text-blue-600">
                      {dashboardData?.totalJournals || 0}
                    </span>
                    <p className="text-xs text-blue-600 mt-2 font-medium">
                      Reflections written
                    </p>
                  </CardContent>
                </Card>

                {/* Sentiment Score Card */}
                <Card className="border-0 bg-linear-to-br from-purple-100/80 via-violet-100/80 to-fuchsia-100/80 backdrop-blur-sm hover:shadow-2xl hover:scale-105 transition-all duration-500 animate-fade-in animation-delay-300 group">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold text-purple-700/80">
                        Sentiment
                      </p>
                      <div className="w-10 h-10 rounded-full bg-linear-to-br from-purple-400 to-fuchsia-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Brain className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <span className="text-5xl font-bold text-purple-600">
                      {(dashboardData?.averageSentiment || 0).toFixed(1)}
                    </span>
                    <p className="text-xs text-purple-600 mt-2 font-medium">
                      AI analysis
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
            <div className="h-10" />

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
              {/* Mood Trend Chart */}
              <Card className="border-0 bg-white/70 backdrop-blur-lg shadow-xl hover:shadow-2xl transition-all duration-500 animate-fade-in animation-delay-100 overflow-hidden group lg:col-span-2">
                <div className="absolute inset-0 bg-linear-to-br from-coral-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <CardHeader className="relative">
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-linear-to-br from-coral-400 to-orange-500 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl">Mood Trend</span>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Your emotional journey over the past month
                  </p>
                </CardHeader>
                <CardContent className="relative">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={dashboardData?.moodTrend || []}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="rgba(0,0,0,0.05)"
                      />
                      <XAxis dataKey="label" stroke="#666" fontSize={12} />
                      <YAxis domain={[0, 5]} stroke="#666" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(255, 255, 255, 0.95)",
                          border: "none",
                          borderRadius: "12px",
                          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                        }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="url(#colorGradient)"
                        strokeWidth={4}
                        dot={{
                          fill: "#FFB703",
                          r: 8,
                          strokeWidth: 2,
                          stroke: "#fff",
                        }}
                        activeDot={{ r: 10 }}
                        name="Mood Average"
                      />
                      <defs>
                        <linearGradient
                          id="colorGradient"
                          x1="0"
                          y1="0"
                          x2="1"
                          y2="0"
                        >
                          <stop offset="0%" stopColor="#FFB703" />
                          <stop offset="100%" stopColor="#FF6B6B" />
                        </linearGradient>
                      </defs>
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Activity Distribution */}
              <Card className="border-0 bg-white/70 backdrop-blur-lg shadow-xl hover:shadow-2xl transition-all duration-500 animate-fade-in animation-delay-200 overflow-hidden group">
                <div className="absolute inset-0 bg-linear-to-br from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <CardHeader className="relative">
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-linear-to-br from-blue-400 to-cyan-500 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl">Activity Balance</span>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Your wellness activities breakdown
                  </p>
                </CardHeader>
                <CardContent className="relative">
                  {(dashboardData?.totalMoods || 0) +
                    (dashboardData?.totalJournals || 0) >
                  0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={activityData}
                          cx="50%"
                          cy="50%"
                          label={renderActivityLabel}
                          labelLine={{ stroke: "#CBD5E1", strokeWidth: 1 }}
                          outerRadius={100}
                          dataKey="value"
                        >
                          {COLORS.map((color, index) => (
                            <Cell key={`cell-${index}`} fill={color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "rgba(255, 255, 255, 0.95)",
                            border: "none",
                            borderRadius: "12px",
                            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex flex-col items-center justify-center text-muted-foreground gap-3">
                      <div className="w-16 h-16 rounded-full bg-linear-to-br from-coral-100 to-blue-100 flex items-center justify-center mx-auto mb-4">
                        <Calendar className="w-8 h-8 text-coral-500" />
                      </div>
                      <p className="font-medium">
                        Start tracking to see your activity distribution!
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Weekly Activity Bar Chart */}
              <Card className="border-0 bg-white/70 backdrop-blur-lg shadow-xl hover:shadow-2xl transition-all duration-500 animate-fade-in animation-delay-300 overflow-hidden group lg:col-span-2">
                <div className="absolute inset-0 bg-linear-to-br from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <CardHeader className="relative">
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-linear-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl">Weekly Activity</span>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Your mood logs and journal entries this week
                  </p>
                </CardHeader>
                <CardContent className="relative">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={weeklyActivityData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="rgba(0,0,0,0.05)"
                      />
                      <XAxis dataKey="day" stroke="#666" fontSize={12} />
                      <YAxis stroke="#666" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(255, 255, 255, 0.95)",
                          border: "none",
                          borderRadius: "12px",
                          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                        }}
                      />
                      <Legend />
                      <Bar
                        dataKey="moods"
                        fill="#FFB703"
                        radius={[8, 8, 0, 0]}
                        name="Mood Logs"
                      />
                      <Bar
                        dataKey="journals"
                        fill="#3B82F6"
                        radius={[8, 8, 0, 0]}
                        name="Journal Entries"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Mood Distribution Chart */}
              <Card className="border-0 bg-white/70 backdrop-blur-lg shadow-xl hover:shadow-2xl transition-all duration-500 animate-fade-in animation-delay-400 overflow-hidden group">
                <div className="absolute inset-0 bg-linear-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <CardHeader className="relative">
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-linear-to-br from-purple-400 to-pink-500 flex items-center justify-center">
                      <PieChartIcon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl">Mood Types</span>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Distribution of your emotional states
                  </p>
                </CardHeader>
                <CardContent className="relative">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={moodDistributionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(props) => {
                          const { percent, payload } = props;
                          return `${payload.emoji} ${(percent! * 100).toFixed(
                            0
                          )}%`;
                        }}
                        outerRadius={90}
                        dataKey="count"
                      >
                        {moodDistributionData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={MOOD_COLORS[index % MOOD_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(255, 255, 255, 0.95)",
                          border: "none",
                          borderRadius: "12px",
                          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Emotional Balance Radar Chart */}
              <Card className="border-0 bg-white/70 backdrop-blur-lg shadow-xl hover:shadow-2xl transition-all duration-500 animate-fade-in animation-delay-500 overflow-hidden group lg:col-span-2">
                <div className="absolute inset-0 bg-linear-to-br from-indigo-500/5 to-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <CardHeader className="relative">
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-linear-to-br from-indigo-400 to-violet-500 flex items-center justify-center">
                      <Target className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl">Emotional Balance</span>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Your wellness dimensions overview
                  </p>
                </CardHeader>
                <CardContent className="relative">
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={dashboardData?.emotionalBalance || []}>
                      <PolarGrid stroke="rgba(0,0,0,0.1)" />
                      <PolarAngleAxis
                        dataKey="category"
                        stroke="#666"
                        fontSize={12}
                      />
                      <PolarRadiusAxis
                        angle={90}
                        domain={[0, 100]}
                        stroke="#666"
                        fontSize={11}
                      />
                      <Radar
                        name="Balance Score"
                        dataKey="score"
                        stroke="#8B5CF6"
                        fill="#8B5CF6"
                        fillOpacity={0.5}
                        strokeWidth={2}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(255, 255, 255, 0.95)",
                          border: "none",
                          borderRadius: "12px",
                          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                        }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Engagement Trend Area Chart */}
              <Card className="border-0 bg-white/70 backdrop-blur-lg shadow-xl hover:shadow-2xl transition-all duration-500 animate-fade-in animation-delay-600 overflow-hidden group">
                <div className="absolute inset-0 bg-linear-to-br from-teal-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <CardHeader className="relative">
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-linear-to-br from-teal-400 to-cyan-500 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl">Engagement</span>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Your consistency over time
                  </p>
                </CardHeader>
                <CardContent className="relative">
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={dashboardData?.engagementTrend || []}>
                      <defs>
                        <linearGradient
                          id="engagementGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#14B8A6"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor="#14B8A6"
                            stopOpacity={0.1}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="rgba(0,0,0,0.05)"
                      />
                      <XAxis dataKey="week" stroke="#666" fontSize={12} />
                      <YAxis stroke="#666" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(255, 255, 255, 0.95)",
                          border: "none",
                          borderRadius: "12px",
                          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="engagement"
                        stroke="#14B8A6"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#engagementGradient)"
                        name="Engagement %"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Achievements Section */}
          <Card className="border-0 bg-white/70 backdrop-blur-lg shadow-xl hover:shadow-2xl transition-all duration-500 animate-fade-in animation-delay-300 overflow-hidden mb-8 group">
            <div className="absolute inset-0 bg-linear-to-br from-yellow-500/5 via-coral-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardHeader className="relative">
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-linear-to-br from-yellow-400 to-coral-500 flex items-center justify-center">
                  <Award className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl">Your Achievements</span>
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Celebrating your wellness milestones
              </p>
            </CardHeader>
            <CardContent className="relative">
              {dashboardData?.achievements &&
              dashboardData.achievements.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {dashboardData.achievements.map((achievement, index) => (
                    <div
                      key={index}
                      className="p-5 bg-linear-to-br from-yellow-100/80 via-coral-100/80 to-pink-100/80 rounded-2xl border-2 border-coral-200/50 flex items-center gap-4 animate-fade-in hover:scale-105 hover:shadow-lg transition-all duration-300 group/item"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="text-3xl group-hover/item:scale-125 transition-transform duration-300">
                        🏆
                      </div>
                      <p className="font-semibold text-foreground">
                        {achievement}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <div className="w-20 h-20 rounded-full bg-linear-to-br from-coral-100 to-yellow-100 flex items-center justify-center mx-auto mb-4">
                    <Award className="w-10 h-10 text-coral-500" />
                  </div>
                  <p className="font-medium text-lg">
                    Keep tracking your mood and journaling to unlock
                    achievements!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}

