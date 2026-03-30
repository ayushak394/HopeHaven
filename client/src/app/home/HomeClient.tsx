"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Heart,
  Brain,
  BookOpen,
  TrendingUp,
  BarChart3,
  Settings,
  LogOut,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import axios from "axios";
import { app } from "@/lib/firebase";
import { useRouter } from "next/navigation";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  streak?: number;
  totalMoodEntries?: number;
  totalJournalEntries?: number;

  weeklyCompletion?: number;
}

export default function HomePage() {
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const auth = getAuth(app);
  const router = useRouter();

  useEffect(() => {
    setIsVisible(true);

    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (!authUser) {
        router.push("/");
        return;
      }

      try {
        const token = await authUser.getIdToken();

        // ⭐ Get profile from DB
        const profileRes = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/user/profile`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const dbUser = profileRes.data;

        // ⭐ ALSO fetch dashboard summary (YOU REMOVED THIS)
        const dashboardRes = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/summary`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const summary = dashboardRes.data;

        // Store combined profile + stats
        setUserProfile({
          id: authUser.uid,
          name: dbUser.name,
          email: dbUser.email,
          totalMoodEntries: summary.totalMoods,
          streak: summary.streak,
          totalJournalEntries: summary.totalJournals,
          weeklyCompletion: summary.weeklyCompletion,
        });
      } catch (error) {
        console.error("Error fetching profile or summary:", error);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth, router]);

  const handleSignOut = async () => {
    await signOut(auth);
    router.push("/");
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

  type FeatureColor =
    | "bg-coral-500"
    | "bg-blue-500"
    | "bg-purple-500"
    | "bg-orange-500";

  const features: {
    icon: any;
    title: string;
    description: string;
    color: FeatureColor; // ⭐ FIXED
    href: string;
    delay: string;
  }[] = [
    {
      icon: TrendingUp,
      title: "Mood Tracker",
      description: "Log your daily mood and track patterns over time",
      color: "bg-coral-500",
      href: "/moodtracker",
      delay: "animation-delay-100",
    },
    {
      icon: BookOpen,
      title: "Journal",
      description: "Express your thoughts in a private, secure space",
      color: "bg-blue-500",
      href: "/journal",
      delay: "animation-delay-200",
    },
    {
      icon: Brain,
      title: "Mood Analyzer",
      description: "Get AI-powered insights about your emotional patterns",
      color: "bg-purple-500",
      href: "/mood-analyzer",
      delay: "animation-delay-300",
    },
    {
      icon: BarChart3,
      title: "Dashboard",
      description: "View your wellness progress and achievements",
      color: "bg-orange-500",
      href: "/dashboard",
      delay: "animation-delay-400",
    },
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-coral-50 via-purple-50 to-blue-50 relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-coral-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-float animation-delay-200" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-3xl animate-pulse-gentle" />
      </div>

      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div
            className="flex items-center gap-3 group cursor-pointer hover:opacity-80 transition-opacity duration-300"
            onClick={() => router.push("/home")}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-coral-500 to-pink-500 rounded-full blur-lg opacity-40" />
              <Heart className="w-8 h-8 text-coral-500 relative animate-pulse-gentle" />
            </div>
            <div>
              <span className="text-2xl font-bold bg-linear-to-r from-coral-600 via-pink-500 to-purple-600 bg-clip-text text-transparent">
                HopeHaven
              </span>
              <p className="text-xs text-muted-foreground">Your wellness hub</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/settings")}
              className="rounded-full hover:bg-coral-100 transition-all duration-300 hover:scale-110"
            >
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div
            className={`transition-all duration-1000 ${
              isVisible
                ? "animate-slide-up opacity-100"
                : "opacity-0 translate-y-8"
            }`}
          >
            <div className="mb-12 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-linear-to-r from-coral-100 to-pink-100 border border-coral-200 mb-6 animate-fade-in">
                <Sparkles className="w-4 h-4 text-coral-600" />
                <span className="text-sm font-medium text-coral-700">
                  Welcome to your wellness hub
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 leading-tight">
                <span className="block text-slate-900 mb-2">Welcome back,</span>
                <span className="bg-gradient-to-r from-coral-600 via-pink-600 to-purple-600 bg-clip-text text-transparent animate-fade-in animation-delay-200">
                  {userProfile?.name || "Friend"}
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-slate-600 mb-10 max-w-3xl mx-auto leading-relaxed animate-fade-in animation-delay-300">
                You&apos;re making great progress! Continue your mental wellness journey with our tools designed just for you.
              </p>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-5xl mx-auto">
                <Card className="border-0 bg-linear-to-br from-coral-100/80 via-pink-100/80 to-rose-100/80 backdrop-blur-sm hover:shadow-2xl hover:scale-105 transition-all duration-500 animate-fade-in animation-delay-100 group overflow-hidden relative">
                  <div className="absolute inset-0 bg-linear-to-br from-coral-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <CardContent className="p-6 text-center relative z-10">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-linear-to-br from-coral-400 to-pink-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-4xl font-bold text-coral-600 mb-2">
                      {userProfile?.totalMoodEntries || 0}
                    </div>
                    <p className="text-xs font-semibold text-coral-700">
                      Mood Entries
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-0 bg-linear-to-br from-blue-100/80 via-cyan-100/80 to-sky-100/80 backdrop-blur-sm hover:shadow-2xl hover:scale-105 transition-all duration-500 animate-fade-in animation-delay-200 group overflow-hidden relative">
                  <div className="absolute inset-0 bg-linear-to-br from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <CardContent className="p-6 text-center relative z-10">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-linear-to-br from-blue-400 to-cyan-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Heart className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-4xl font-bold text-blue-600 mb-2">
                      {userProfile?.streak || 0}
                    </div>
                    <p className="text-xs font-semibold text-blue-700">
                      Day Streak
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-0 bg-linear-to-br from-purple-100/80 via-fuchsia-100/80 to-pink-100/80 backdrop-blur-sm hover:shadow-2xl hover:scale-105 transition-all duration-500 animate-fade-in animation-delay-300 group overflow-hidden relative">
                  <div className="absolute inset-0 bg-linear-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <CardContent className="p-6 text-center relative z-10">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-linear-to-br from-purple-400 to-pink-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <BookOpen className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-4xl font-bold text-purple-600 mb-2">
                      {userProfile?.totalJournalEntries || 0}
                    </div>
                    <p className="text-xs font-semibold text-purple-700">
                      Journal Posts
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-0 bg-linear-to-br from-amber-100/80 via-orange-100/80 to-yellow-100/80 backdrop-blur-sm hover:shadow-2xl hover:scale-105 transition-all duration-500 animate-fade-in animation-delay-400 group overflow-hidden relative">
                  <div className="absolute inset-0 bg-linear-to-br from-orange-500/5 to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <CardContent className="p-6 text-center relative z-10">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-linear-to-br from-orange-400 to-amber-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <BarChart3 className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-4xl font-bold text-orange-600 mb-2">
                      {userProfile?.weeklyCompletion ?? 0}%
                    </div>
                    <p className="text-xs font-semibold text-orange-700">
                      This Week
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 bg-linear-to-r from-coral-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
              Your Wellness Tools
            </h2>
            <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Explore all your mental health features. Find what resonates with you today.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              const gradients = {
                "bg-coral-500": "from-coral-500 to-pink-500",
                "bg-blue-500": "from-blue-500 to-cyan-500",
                "bg-purple-500": "from-purple-500 to-pink-500",
                "bg-orange-500": "from-orange-500 to-amber-500",
              };

              return (
                <Card
                  key={index}
                  className={`group hover:shadow-2xl hover:scale-105 transition-all duration-500 border-0 bg-white/80 backdrop-blur-xl cursor-pointer animate-fade-in ${feature.delay} overflow-hidden relative`}
                  onClick={() => router.push(feature.href)}
                >
                  <div
                    className={`absolute inset-0 bg-linear-to-br ${
                      gradients[feature.color]
                    }/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                  />

                  <CardContent className="p-8 sm:p-10 relative z-10">
                    <div className="flex items-start justify-between mb-6">
                      <div className="relative">
                        <div
                          className={`absolute inset-0 bg-linear-to-br ${
                            gradients[feature.color]
                          } rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity duration-500`}
                        />
                        <div
                          className={`relative bg-linear-to-br ${
                            gradients[feature.color]
                          } rounded-2xl flex items-center justify-center p-5 group-hover:scale-125 transition-transform duration-500 shadow-lg`}
                        >
                          <IconComponent className="w-8 h-8 text-white" />
                        </div>
                      </div>
                      <div className="bg-slate-100/80 rounded-full p-2 group-hover:bg-slate-200 transition-colors duration-300">
                        <ArrowRight className="w-5 h-5 text-slate-700 group-hover:translate-x-1 transition-transform duration-300" />
                      </div>
                    </div>

                    <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3 group-hover:text-transparent group-hover:bg-linear-to-r group-hover:bg-clip-text group-hover:from-coral-600 group-hover:to-purple-600 transition-all duration-300">
                      {feature.title}
                    </h3>
                    <p className="text-slate-600 leading-relaxed text-lg">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 relative">
        <div className="max-w-7xl mx-auto">
          <Card className="border-0 bg-linear-to-br from-coral-50 via-pink-50 to-purple-50 shadow-2xl overflow-hidden relative group hover:shadow-3xl hover:scale-105 transition-all duration-500">
            <div className="absolute inset-0 bg-linear-to-br from-coral-500/10 via-pink-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute top-10 right-10 w-40 h-40 bg-pink-400/20 rounded-full blur-3xl animate-float animation-delay-200" />

            <CardContent className="p-8 sm:p-14 relative z-10">
              <div className="flex flex-col md:flex-row items-center justify-between gap-10 md:gap-16">
                <div className="flex-1">
                  <div className="relative inline-block mb-6">
                    <div className="absolute inset-0 bg-gradient-to-r from-coral-500 to-pink-500 rounded-full blur-2xl opacity-40 animate-pulse-gentle" />
                    <div className="relative w-20 h-20 bg-gradient-to-br from-coral-500 to-pink-500 rounded-full flex items-center justify-center shadow-xl">
                      <span className="text-4xl">🫁</span>
                    </div>
                  </div>

                  <h3 className="text-3xl sm:text-4xl font-bold mb-4 bg-gradient-to-r from-coral-600 via-pink-500 to-purple-600 bg-clip-text text-transparent">
                    Overwhelmed?
                  </h3>
                  <p className="text-lg text-slate-700 leading-relaxed mb-8">
                    Guided breathing exercises help calm your mind and body when things feel like too much. Take a moment of peace right now.
                  </p>

                  <Button
                    size="lg"
                    className="relative bg-gradient-to-r from-coral-500 via-pink-500 to-purple-500 hover:opacity-90 text-white px-10 py-6 text-lg rounded-full transition-all duration-300 hover:scale-105 hover:shadow-2xl shadow-lg overflow-hidden group/btn"
                    onClick={() => router.push("/exercises")}
                  >
                    <span className="relative z-10 flex items-center gap-2 font-semibold">
                      Start Exercise
                      <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                    </span>
                  </Button>
                </div>

                <div className="relative flex-1 h-64 md:h-72 flex items-center justify-center">
                  <div className="absolute w-48 h-48 bg-gradient-to-br from-coral-400/30 to-pink-400/30 rounded-full animate-pulse-gentle" />
                  <div className="absolute w-40 h-40 bg-gradient-to-br from-pink-400/40 to-purple-400/40 rounded-full animate-float animation-delay-200" />
                  <div className="relative text-6xl animate-float">
                    🌊
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <Card className="border-0 bg-linear-to-br from-coral-100 via-pink-100 to-purple-100 shadow-2xl overflow-hidden relative group hover:shadow-3xl hover:scale-105 transition-all duration-500">
            <div className="absolute inset-0 bg-linear-to-br from-coral-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <CardContent className="p-10 sm:p-16 text-center relative z-10">
              <div className="relative inline-block mb-8">
                <div className="absolute inset-0 bg-linear-to-r from-coral-500 to-purple-500 rounded-full blur-xl opacity-40 animate-pulse-gentle" />
                <div className="relative w-20 h-20 bg-linear-to-br from-coral-500 to-purple-500 rounded-full flex items-center justify-center mx-auto animate-float shadow-xl group-hover:scale-110 transition-transform duration-300">
                  <Heart className="w-10 h-10 text-white" />
                </div>
              </div>

              <h3 className="text-3xl sm:text-4xl font-bold mb-6 bg-linear-to-r from-coral-600 to-purple-600 bg-clip-text text-transparent">
                You&apos;ve Got This
              </h3>
              <p className="text-lg sm:text-xl text-slate-700 leading-relaxed max-w-2xl mx-auto">
                Remember, mental wellness is a journey, not a destination. Every small step counts. Be kind to yourself.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <footer className="py-12 px-4 sm:px-6 bg-white/60 backdrop-blur-xl border-t border-white/20 relative">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Heart className="w-5 h-5 text-coral-500" />
            <p className="text-slate-700 font-medium">
              © 2026 HopeHaven. Your mental wellness matters.
            </p>
          </div>
          <p className="text-sm text-slate-600 max-w-2xl mx-auto">
            If you're in crisis, please reach out to a mental health
            professional or contact a crisis helpline.
          </p>
        </div>
      </footer>
    </div>
  );
}
