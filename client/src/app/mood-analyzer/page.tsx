"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Brain, Lightbulb, TrendingUp, Heart, Zap, RefreshCw, Sparkles } from "lucide-react"
import { getAuth, onAuthStateChanged } from "firebase/auth"
import axios from "axios"
import { app } from "@/lib/firebase"
import { useRouter } from "next/navigation"
import { getOrCreateUserKey, decryptText } from "@/lib/crypto"

interface InsightSection {
  title: string
  content: string
  icon: any
  color: string
}

export default function InsightsPage() {
  const [user, setUser] = useState<any>(null)
  const [insights, setInsights] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const auth = getAuth(app)
  const router = useRouter()

  useEffect(() => {
    setIsVisible(true)

    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        setUser(authUser)
        await fetchInsights(authUser)
      } else {
        router.push("/")
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [auth, router])

  const fetchInsights = async (authUser: any) => {
    try {
      const token = await authUser.getIdToken()

      // 1) Get encrypted journals
      const encResp = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/journal/all-encrypted`,
        { headers: { Authorization: `Bearer ${token}` } },
      )

      // 2) Decrypt locally
      const key = await getOrCreateUserKey(authUser.uid)
      const decryptedJournals: string[] = []
      for (const e of encResp.data as Array<{ cipherText: string; iv: string }>) {
        try {
          const plain = await decryptText(e.cipherText, e.iv, key)
          decryptedJournals.push(plain)
        } catch {
          // skip if decryption fails
        }
      }

      console.log("DECRYPTED JOURNALS:", decryptedJournals)

      // 3) Call backend to generate insights (backend will fetch moods itself)
      const aiResp = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/insights/generate`,
        {
          journals: decryptedJournals,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      )

      console.log("AI RAW:", aiResp.data)

      // 4) Extract the text from Gemini-style JSON or accept raw text fallback
      let text = ""
      try {
        const data = typeof aiResp.data === "string" ? JSON.parse(aiResp.data) : aiResp.data
        text =
          data?.candidates?.[0]?.content?.parts?.[0]?.text ||
          data?.result ||
          (typeof aiResp.data === "string" ? aiResp.data : JSON.stringify(aiResp.data))
      } catch {
        text = typeof aiResp.data === "string" ? aiResp.data : JSON.stringify(aiResp.data)
      }

      console.log("FINAL INSIGHTS TEXT:", text)

      setInsights(text)
      setError(null)
    } catch (err) {
      console.error("Error fetching insights:", err)
      setError("Unable to generate insights. Please try again later.")
      setInsights("")
    }
  }

  const parseInsights = (text: string) => {
    text = text.replace(/\*\*/g, "").replace(/:/g, "").replace(/\)/g, ".")

    const sections: InsightSection[] = []

    // Split by numbered sections
    const parts = text.split(/\d+\.\s+/)

    const titles = ["Emotional Summary", "Patterns & Trends", "Wellness Suggestions", "Your Motivation"]

    const icons = [Heart, TrendingUp, Lightbulb, Zap]
    const colors = ["coral", "blue", "green", "purple"]

    parts.slice(1).forEach((part, index) => {
      if (part.trim()) {
        sections.push({
          title: titles[index] || `Insight ${index + 1}`,
          content: part.trim(),
          icon: icons[index],
          color: colors[index],
        })
      }
    })

    return sections.length > 0 ? sections : null
  }

  const parsedInsights = insights ? parseInsights(insights) : null

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-background via-purple-50/20 to-pink-50/20 relative overflow-hidden flex items-center justify-center">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-float animation-delay-200" />
        <div className="flex flex-col items-center gap-4">
          <Brain className="w-16 h-16 text-purple-500 animate-pulse" />
          <p className="text-lg text-muted-foreground animate-pulse">Analyzing your emotional patterns...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-purple-50/20 to-pink-50/20 relative overflow-hidden">
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
              <h1 className="text-3xl font-bold bg-linear-to-r from-purple-500 via-pink-500 to-blue-500 bg-clip-text text-transparent">
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
            <Card className="border-0 bg-linear-to-br from-red-50/80 to-pink-50/80 backdrop-blur-sm mb-8 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-full bg-linear-to-br from-purple-500 to-pink-500 shadow-lg">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-lg font-semibold text-red-700">Unable to Generate Insights</p>
                </div>
                <p className="text-red-600 mb-4">{error}</p>
                <Button
                  onClick={() => fetchInsights(user)}
                  className="bg-linear-to-r from-coral-500 to-orange-500 hover:from-coral-600 hover:to-orange-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Render either parsed insights or fallback for new users */}
          {insights &&
            (parsedInsights ? (
              <div
                className={`transition-all duration-1000 ${isVisible ? "animate-slide-up opacity-100" : "opacity-0"}`}
              >
                {/* Introduction Card */}
                <Card className="border-0 bg-linear-to-br from-purple-50/80 to-pink-50/80 backdrop-blur-sm mb-8 shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in">
                  <CardContent className="p-8">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="p-4 rounded-2xl bg-linear-to-br from-purple-500 to-pink-500 shadow-lg">
                        <Brain className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <h2 className="text-2xl font-bold bg-linear-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                          Your Emotional Analysis
                        </h2>
                        <p className="text-muted-foreground leading-relaxed">
                          Based on your recent mood logs and journal entries, here are personalized insights into your
                          emotional patterns and wellness recommendations.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Insight Sections */}
                <div className="grid lg:grid-cols-2 gap-6 mb-8">
                  {parsedInsights.map((section, index) => {
                    const IconComponent = section.icon || Heart
                    const bgColors: { [key: string]: string } = {
                      coral: "from-coral-50/80 to-orange-50/80",
                      blue: "from-blue-50/80 to-cyan-50/80",
                      green: "from-green-50/80 to-emerald-50/80",
                      purple: "from-purple-50/80 to-pink-50/80",
                    }
                    const iconGradients: { [key: string]: string } = {
                      coral: "from-coral-500 to-orange-500",
                      blue: "from-blue-500 to-cyan-500",
                      green: "from-green-500 to-emerald-500",
                      purple: "from-purple-500 to-pink-500",
                    }
                    const textGradients: { [key: string]: string } = {
                      coral: "from-coral-600 to-orange-600",
                      blue: "from-blue-600 to-cyan-600",
                      green: "from-green-600 to-emerald-600",
                      purple: "from-purple-600 to-pink-600",
                    }

                    return (
                      <Card
                        key={index}
                        className={`border-0 bg-linear-to-br ${bgColors[section.color]} backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] animate-fade-in ${
                          index === 0 ? "lg:col-span-2" : ""
                        }`}
                        style={{ animationDelay: `${(index + 1) * 150}ms` }}
                      >
                        <CardHeader>
                          <CardTitle className="flex items-center gap-4">
                            <div
                              className={`p-3 rounded-2xl bg-linear-to-br ${iconGradients[section.color]} shadow-lg`}
                            >
                              <IconComponent className="w-6 h-6 text-white" />
                            </div>
                            <span
                              className={`text-xl font-bold bg-linear-to-r ${textGradients[section.color]} bg-clip-text text-transparent`}
                            >
                              {section.title}
                            </span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-foreground leading-relaxed whitespace-pre-line text-base">
                            {section.content}
                          </p>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>

                {/* Action Cards Grid */}
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  <Card className="border-0 bg-linear-to-br from-yellow-50/80 to-orange-50/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] animate-fade-in animation-delay-400">
                    <CardContent className="p-6">
                      <div className="flex flex-col items-center text-center gap-4">
                        <div className="text-6xl">✨</div>
                        <div>
                          <p className="font-bold text-lg text-foreground mb-2">Continue Your Journey</p>
                          <p className="text-sm text-muted-foreground">
                            Keep tracking to unlock deeper insights and patterns.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 bg-linear-to-br from-green-50/80 to-emerald-50/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] animate-fade-in animation-delay-400">
                    <CardContent className="p-6">
                      <div className="flex flex-col items-center text-center gap-4">
                        <div className="text-6xl">🎯</div>
                        <div>
                          <p className="font-bold text-lg text-foreground mb-2">Set Your Goals</p>
                          <p className="text-sm text-muted-foreground">
                            Use these insights to build better mental health habits.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 bg-linear-to-br from-blue-50/80 to-cyan-50/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] animate-fade-in animation-delay-400">
                    <CardContent className="p-6">
                      <div className="flex flex-col items-center text-center gap-4">
                        <div className="text-6xl">📈</div>
                        <div>
                          <p className="font-bold text-lg text-foreground mb-2">Track Progress</p>
                          <p className="text-sm text-muted-foreground">Monitor your emotional growth over time.</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Refresh Button */}
                <div className="flex justify-center">
                  <Button
                    onClick={() => {
                      setLoading(true)
                      fetchInsights(user)
                    }}
                    className="bg-linear-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    <RefreshCw className="w-5 h-5 mr-2" />
                    Refresh Insights
                  </Button>
                </div>
              </div>
            ) : (
              <Card className="border-0 bg-linear-to-br from-purple-50/80 to-pink-50/80 backdrop-blur-sm mb-8 shadow-lg animate-fade-in">
                <CardContent className="p-8">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-4 rounded-2xl bg-linear-to-br from-purple-500 to-pink-500 shadow-lg">
                      <Brain className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold bg-linear-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      Getting Started with Mood & Journaling
                    </h2>
                  </div>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line text-base">{insights}</p>
                </CardContent>
              </Card>
            ))}

          {/* No insights yet */}
          {!insights && !error && (
            <Card className="border-0 bg-linear-to-br from-gray-50/80 to-blue-50/80 backdrop-blur-sm text-center py-16 shadow-lg animate-fade-in">
              <CardContent className="p-8">
                <div className="p-6 rounded-3xl bg-linear-to-br from-blue-500 to-purple-500 w-24 h-24 mx-auto mb-6 flex items-center justify-center shadow-xl">
                  <Brain className="w-12 h-12 text-white animate-pulse" />
                </div>
                <h2 className="text-2xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                  No Insights Available Yet
                </h2>
                <p className="text-muted-foreground mb-3 text-lg">
                  Start tracking your mood and journaling to unlock AI-powered insights!
                </p>
                <p className="text-sm text-muted-foreground mb-8 max-w-md mx-auto">
                  Our AI will analyze your emotional patterns and provide personalized recommendations once you have
                  some data.
                </p>
                <div className="flex gap-4 justify-center">
                  <Button
                    onClick={() => router.push("/mood-tracker")}
                    className="bg-linear-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 px-6"
                  >
                    <Heart className="w-4 h-4 mr-2" />
                    Track Mood
                  </Button>
                  <Button
                    onClick={() => router.push("/journal")}
                    className="bg-linear-to-r from-coral-500 to-orange-500 hover:from-coral-600 hover:to-orange-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 px-6"
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
    </div>
  )
}
