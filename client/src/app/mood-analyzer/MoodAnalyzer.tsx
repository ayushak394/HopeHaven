"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  Brain,
  Lightbulb,
  TrendingUp,
  Heart,
  Zap,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import axios from "axios";
import { app } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { getUserKey, decryptText } from "@/lib/crypto";

interface InsightData {
  summary: string;
  patterns: string;
  wellness: string;
  motivation: string;
}

interface InsightSection {
  key: keyof InsightData;
  title: string;
  icon: any;
  color: string;
}

const INSIGHT_SECTIONS: InsightSection[] = [
  {
    key: "summary",
    title: "Emotional Summary",
    icon: Heart,
    color: "coral",
  },
  {
    key: "patterns",
    title: "Patterns & Trends",
    icon: TrendingUp,
    color: "blue",
  },
  {
    key: "wellness",
    title: "Wellness Suggestions",
    icon: Lightbulb,
    color: "green",
  },
  {
    key: "motivation",
    title: "Your Motivation",
    icon: Zap,
    color: "purple",
  },
];

export default function InsightsPage() {
  const [user, setUser] = useState<any>(null);
  const [insights, setInsights] = useState<InsightData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const auth = getAuth(app);
  const router = useRouter();

  useEffect(() => {
    setIsVisible(true);

    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        setUser(authUser);
        await fetchInsights(authUser);
      } else {
        router.push("/");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth, router]);

  const fetchInsights = async (authUser: any) => {
    try {
      const token = await authUser.getIdToken();

      // 1) Get encrypted journals
      const encResp = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/journal/all-encrypted`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      // 2) Decrypt locally
      const key = await getUserKey(authUser.uid);
      const decryptedJournals: string[] = [];
      for (const e of encResp.data as Array<{
        cipherText: string;
        iv: string;
      }>) {
        try {
          const plain = await decryptText(e.cipherText, e.iv, key);
          decryptedJournals.push(plain);
        } catch {
          // skip if decryption fails
        }
      }

      // 3) Call backend to generate insights (backend returns Map with 4 keys)
      const aiResp = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/insights/generate`,
        {
          journals: decryptedJournals,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      // 4) Parse the response - backend returns Map<String, String>
      const data = aiResp.data;
      const insightData: InsightData = {
        summary: data?.summary || "Unable to generate summary.",
        patterns: data?.patterns || "No patterns detected.",
        wellness: data?.wellness || "No suggestions today.",
        motivation: data?.motivation || "Keep going!",
      };

      setInsights(insightData);
      setError(null);
    } catch (err) {
      console.error("Error fetching insights:", err);
      setError("Unable to generate insights. Please try again later.");
      setInsights(null);
    }
  };

  const cleanAIResponse = (text: string) => {
    if (!text) return text;

    const headings = [
      "Emotional Summary",
      "Patterns and Trends",
      "Wellness Suggestions",
      "Your Motivation",
    ];

    let cleaned = text;

    headings.forEach((heading) => {
      const regex = new RegExp(`^${heading}\\s*[:\\-]?\\s*`, "i");
      cleaned = cleaned.replace(regex, "");
    });

    return cleaned.trim();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-purple-50/20 to-pink-50/20 relative overflow-hidden flex items-center justify-center">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-float animation-delay-200" />
        <div className="flex flex-col items-center gap-4">
          <Brain className="w-16 h-16 text-purple-500 animate-pulse" />
          <p className="text-lg text-muted-foreground animate-pulse">
            Analyzing your emotional patterns...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-purple-50/20 to-pink-50/20 relative overflow-hidden">
      <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-float animation-delay-200" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-3xl animate-pulse-gentle" />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/home")}
              className="rounded-full hover:bg-purple-100 transition-all duration-300 hover:scale-110"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <Brain className="w-8 h-8 text-purple-500" />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 bg-clip-text text-transparent">
                AI Emotional Insights
              </h1>
            </div>
          </div>
          <Sparkles className="w-6 h-6 text-purple-500 animate-pulse" />
        </div>
      </header>

      {/* Main Content */}
      <section className="py-8 px-4 relative">
        <div className="max-w-5xl mx-auto">
          {error && (
            <Card className="border-0 bg-gradient-to-br from-red-50/80 to-pink-50/80 backdrop-blur-sm mb-8 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-lg font-semibold text-red-700">
                    Unable to Generate Insights
                  </p>
                </div>
                <p className="text-red-600 mb-4">{error}</p>
                <Button
                  onClick={() => fetchInsights(user)}
                  className="bg-gradient-to-r from-coral-500 to-orange-500 hover:from-coral-600 hover:to-orange-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Render insights if available */}
          {insights ? (
            <div
              className={`transition-all duration-1000 ${isVisible ? "animate-slide-up opacity-100" : "opacity-0"}`}
            >
              {/* Introduction Card */}
              <Card className="border-0 bg-gradient-to-br from-purple-50/80 to-pink-50/80 backdrop-blur-sm mb-8 shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in">
                <CardContent className="p-8">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg">
                      <Brain className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                        Your Emotional Analysis
                      </h2>
                      <p className="text-muted-foreground leading-relaxed">
                        Based on your recent mood logs and journal entries, here
                        are personalized insights into your emotional patterns
                        and wellness recommendations.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 4 Insight Sections Grid */}
              <div className="grid lg:grid-cols-2 gap-6 mb-8">
                {INSIGHT_SECTIONS.map((section, index) => {
                  const IconComponent = section.icon;
                  const bgColors: { [key: string]: string } = {
                    coral: "from-coral-50/80 to-orange-50/80",
                    blue: "from-blue-50/80 to-cyan-50/80",
                    green: "from-green-50/80 to-emerald-50/80",
                    purple: "from-purple-50/80 to-pink-50/80",
                  };
                  const iconGradients: { [key: string]: string } = {
                    coral: "from-coral-500 to-orange-500",
                    blue: "from-blue-500 to-cyan-500",
                    green: "from-green-500 to-emerald-500",
                    purple: "from-purple-500 to-pink-500",
                  };
                  const textGradients: { [key: string]: string } = {
                    coral: "from-coral-600 to-orange-600",
                    blue: "from-blue-600 to-cyan-600",
                    green: "from-green-600 to-emerald-600",
                    purple: "from-purple-600 to-pink-600",
                  };

                  const content = insights[section.key];

                  return (
                    <Card
                      key={section.key}
                      className={`border-0 bg-gradient-to-br ${bgColors[section.color]} backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] animate-fade-in ${
                        section.key === "summary" ||
                        section.key === "motivation"
                          ? "lg:col-span-2"
                          : ""
                      }`}
                      style={{ animationDelay: `${(index + 1) * 150}ms` }}
                    >
                      <CardHeader>
                        <CardTitle className="flex items-center gap-4">
                          <div
                            className={`p-3 rounded-2xl bg-gradient-to-br ${iconGradients[section.color]} shadow-lg`}
                          >
                            <IconComponent className="w-6 h-6 text-white" />
                          </div>
                          <span
                            className={`text-xl font-bold bg-gradient-to-r ${textGradients[section.color]} bg-clip-text text-transparent`}
                          >
                            {section.title}
                          </span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-foreground leading-relaxed whitespace-pre-line text-base">
                          {cleanAIResponse(content)}
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Action Cards Grid */}
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <Card className="border-0 bg-gradient-to-br from-yellow-50/80 to-orange-50/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] animate-fade-in animation-delay-400">
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center gap-4">
                      <div className="text-6xl">✨</div>
                      <div>
                        <p className="font-bold text-lg text-foreground mb-2">
                          Continue Your Journey
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Keep tracking to unlock deeper insights and patterns.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 bg-gradient-to-br from-green-50/80 to-emerald-50/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] animate-fade-in animation-delay-400">
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center gap-4">
                      <div className="text-6xl">🎯</div>
                      <div>
                        <p className="font-bold text-lg text-foreground mb-2">
                          Set Your Goals
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Use these insights to build better mental health
                          habits.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 bg-gradient-to-br from-blue-50/80 to-cyan-50/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] animate-fade-in animation-delay-400">
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center gap-4">
                      <div className="text-6xl">📈</div>
                      <div>
                        <p className="font-bold text-lg text-foreground mb-2">
                          Track Progress
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Monitor your emotional growth over time.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <Card className="border-0 bg-gradient-to-br from-gray-50/80 to-blue-50/80 backdrop-blur-sm text-center py-16 shadow-lg animate-fade-in">
              <CardContent className="p-8">
                <div className="p-6 rounded-3xl bg-gradient-to-br from-blue-500 to-purple-500 w-24 h-24 mx-auto mb-6 flex items-center justify-center shadow-xl">
                  <Brain className="w-12 h-12 text-white animate-pulse" />
                </div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                  No Insights Available Yet
                </h2>
                <p className="text-muted-foreground mb-3 text-lg">
                  Start tracking your mood and journaling to unlock AI-powered
                  insights!
                </p>
                <p className="text-sm text-muted-foreground mb-8 max-w-md mx-auto">
                  Our AI will analyze your emotional patterns and provide
                  personalized recommendations once you have some data.
                </p>
                <div className="flex gap-4 justify-center">
                  <Button
                    onClick={() => router.push("/mood-tracker")}
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 px-6"
                  >
                    <Heart className="w-4 h-4 mr-2" />
                    Track Mood
                  </Button>
                  <Button
                    onClick={() => router.push("/journal")}
                    className="bg-gradient-to-r from-coral-500 to-orange-500 hover:from-coral-600 hover:to-orange-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 px-6"
                  >
                    <Lightbulb className="w-4 h-4 mr-2" />
                    Write Journal
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
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
            professional or{" "}
            <a
              href="https://findahelpline.com/"
              target="_blank"
              rel="HelpLine Finder"
              className="text-blue-600 underline hover:text-blue-800"
            >
              contact a crisis helpline
            </a>
            .
          </p>
        </div>
      </footer>
    </div>
  );
}
