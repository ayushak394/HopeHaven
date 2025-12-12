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
}

export default function HomePage() {
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const auth = getAuth(app);
  const router = useRouter();

//   useEffect(() => {
//   setIsVisible(true);

//   const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
//     if (authUser) {
//       setUser(authUser);
//       try {
//         const token = await authUser.getIdToken();

//         // Fetch user dashboard summary
//         const dashboardRes = await axios.get(
//           "http://localhost:8080/api/dashboard/summary",
//           { headers: { Authorization: `Bearer ${token}` } }
//         );

//         const userSummary = dashboardRes.data;

//         setUserProfile({
//           id: authUser.uid,
//           name: authUser.displayName || "Friend",
//           email: authUser.email || "",
//           totalMoodEntries: userSummary.totalMoods,
//           streak: userSummary.streak,
//           totalJournalEntries: userSummary.totalJournals,
//           weeklyCompletion: userSummary.weeklyCompletion,
//         });
//       } catch (error) {
//         console.error("Error fetching dashboard stats:", error);
//       }
//     } else {
//       router.push("/");
//     }
//     setLoading(false);
//   });

//   return () => unsubscribe();
// }, [auth, router]);

useEffect(() => {
  setIsVisible(true);

  const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
    if (!authUser) {
      router.push("/");
      return;
    }

    try {
      const token = await authUser.getIdToken();

      // ⭐ Fetch DB profile instead of Firebase
      const profileRes = await axios.get(
        "http://localhost:8080/api/user/profile",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const dbUser = profileRes.data;

      // ⭐ Fetch dashboard stats (already correct)
      const dashboardRes = await axios.get(
        "http://localhost:8080/api/dashboard/summary",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const userSummary = dashboardRes.data;

      setUserProfile({
        id: authUser.uid,
        name: dbUser.name,              // ⭐ use DB name
        email: dbUser.email,            // ⭐ use DB email
        totalMoodEntries: userSummary.totalMoods,
        streak: userSummary.streak,
        totalJournalEntries: userSummary.totalJournals,
        weeklyCompletion: userSummary.weeklyCompletion,
      });

    } catch (error) {
      console.error("Error fetching profile or dashboard:", error);
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

  const features = [
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-8 h-8 text-coral-500" />
            <span className="text-2xl font-bold text-foreground">
              HopeHaven
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/settings")}
              className="flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              Settings
            </Button>
            
          </div>
        </div>
      </header>

      {/* Welcome Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-coral-50 to-blue-50 py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div
            className={`transition-all duration-1000 ${
              isVisible ? "animate-slide-up opacity-100" : "opacity-0"
            }`}
          >
            <div className="mb-8">
              <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-4 leading-tight">
                Welcome back,{" "}
                <span className="bg-gradient-to-r from-coral-600 to-coral-400 bg-clip-text text-transparent">
                  {userProfile?.name || "Friend"}
                </span>
                !
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl leading-relaxed">
                You're doing great! Let's continue your mental wellness journey
                today. Choose what you'd like to do.
              </p>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                <Card className="border-0 bg-white/60 backdrop-blur-sm animate-fade-in">
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold text-coral-600 mb-2">
                      {userProfile?.totalMoodEntries || 0}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Mood Entries
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-0 bg-white/60 backdrop-blur-sm animate-fade-in animation-delay-100">
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {userProfile?.streak || 0}
                    </div>
                    <p className="text-sm text-muted-foreground">Day Streak</p>
                  </CardContent>
                </Card>

                <Card className="border-0 bg-white/60 backdrop-blur-sm animate-fade-in animation-delay-200">
                  <CardContent className="p-6 text-center">
                  

                    <div className="text-3xl font-bold text-purple-600 mb-2">
  {userProfile?.totalJournalEntries || 0}
</div>
<p className="text-sm text-muted-foreground">
  Journal Posts
</p>

                  </CardContent>
                </Card>

                <Card className="border-0 bg-white/60 backdrop-blur-sm animate-fade-in animation-delay-300">
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold text-orange-600 mb-2">
  {userProfile?.weeklyCompletion || 0}%
</div>
<p className="text-sm text-muted-foreground">This Week</p>

                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Your Wellness Tools
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Access all your mental health features in one place. Start with
              what feels right for you today.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card
                  key={index}
                  className={`group hover:shadow-xl transition-all duration-500 hover:-translate-y-2 border-0 bg-gradient-to-br from-white to-gray-50 cursor-pointer animate-fade-in ${feature.delay}`}
                  onClick={() => router.push(feature.href)}
                >
                  <CardContent className="p-8">
                    <div className="flex items-start justify-between mb-6">
                      <div
                        className={`${feature.color} rounded-full flex items-center justify-center p-4 group-hover:scale-110 transition-transform duration-300`}
                      >
                        <IconComponent className="w-8 h-8 text-white" />
                      </div>
                      <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all duration-300" />
                    </div>

                    <h3 className="text-2xl font-bold text-foreground mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Quick Action Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-slate-50 to-blue-50/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              How Are You Feeling Today?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Start by checking in with your mood. It only takes a few seconds
              and helps us provide better support.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              className="bg-coral-500 hover:bg-coral-600 text-white px-8 py-4 text-lg rounded-full transition-all duration-300 hover:scale-105 animate-float"
              onClick={() => router.push("/moodtracker")}
            >
              Log Your Mood Now
              <Heart className="ml-2 w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="px-8 py-4 text-lg rounded-full border-2 bg-transparent"
              onClick={() => router.push("/dashboard")}
            >
              View My Progress
            </Button>
          </div>
        </div>
      </section>

      {/* Motivation Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Card className="border-0 bg-gradient-to-br from-coral-100 to-blue-100 p-8 md:p-12">
            <CardContent className="p-0">
              <div className="w-16 h-16 bg-gradient-to-r from-coral-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-float">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                You've Got This
              </h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Remember, mental wellness is a journey, not a destination. Every
                small step you take matters. We're here to support you every
                day.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-slate-50 border-t border-border">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-muted-foreground mb-2">
            © 2025 HopeHaven. Your mental wellness matters.
          </p>
          <p className="text-sm text-muted-foreground">
            If you're in crisis, please reach out to a mental health
            professional or contact a crisis helpline.
          </p>
        </div>
      </footer>
    </div>
  );
}
