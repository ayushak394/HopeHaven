"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Brain, Lightbulb, TrendingUp, Heart, Zap } from 'lucide-react'
import { getAuth, onAuthStateChanged } from "firebase/auth"
import axios from "axios"
import { app } from "@/lib/firebase"
import { useRouter } from 'next/navigation'
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

  // const fetchInsights = async (authUser: any) => {
  //   try {
  //     const token = await authUser.getIdToken()
  //     const response = await axios.get("http://localhost:8080/api/insights", {
  //       headers: { Authorization: `Bearer ${token}` },
  //     })

  //     setInsights(response.data)
  //     setError(null)
  //   } catch (err) {
  //     console.error("Error fetching insights:", err)
  //     setError("Unable to generate insights. Please try again later.")
  //     setInsights("")
  //   }
  // }


  const fetchInsights = async (authUser: any) => {
  try {
    const token = await authUser.getIdToken()

    // 1) Get encrypted journals
    const encResp = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/journal/all-encrypted`,
      { headers: { Authorization: `Bearer ${token}` } }
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

    // 3) Call backend to generate insights (backend will fetch moods itself)
    const aiResp = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/insights/generate`,
      {
        journals: decryptedJournals,
        // Optionally pass a date window:
        // fromDate: new Date(Date.now() - 7*24*3600*1000).toISOString().slice(0,19),
        // toDate: new Date().toISOString().slice(0,19),
      },
      { headers: { Authorization: `Bearer ${token}` } }
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

    setInsights(text)
    setError(null)
  } catch (err) {
    console.error("Error fetching insights:", err)
    setError("Unable to generate insights. Please try again later.")
    setInsights("")
  }
}

  const parseInsights = (text: string) => {
    text = text.replace(/\*\*/g, "")
               .replace(/:/g, "")
               .replace(/\)/g, ".")

    const sections: InsightSection[] = []

    const parts = text.split(/\d+\.\s+/)

    const titles = [
      "Emotional Summary",
      "Patterns & Trends",
      "Wellness Suggestions",
      "Your Motivation"
    ]

    const icons = [Heart, TrendingUp, Lightbulb, Zap]
    const colors = ["coral", "blue", "green", "purple"]

    parts.slice(1).forEach((part, index) => {
      if (part.trim()) {
        sections.push({
          title: titles[index] || `Insight ${index + 1}`,
          content: part.trim(),
          icon: icons[index] || Heart,
          color: colors[index] || "blue"
        })
      }
    })

    return sections.length > 0 ? sections : null
  }

  const parsedInsights = insights ? parseInsights(insights) : null

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse">
          <Brain className="w-12 h-12 text-coral-500 animate-pulse" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/home")}
            className="rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold text-foreground">AI Emotional Insights</h1>
        </div>
      </header>

      {/* Main Content */}
      <section className="py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {error && (
            <Card className="border-0 bg-gradient-to-br from-red-50 to-pink-50 mb-8">
              <CardContent className="p-6">
                <p className="text-red-700">{error}</p>
                <Button
                  onClick={() => fetchInsights(user)}
                  className="mt-4 bg-coral-500 hover:bg-coral-600"
                >
                  Try Again
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Render either parsed insights or fallback for new users */}
          {insights && (
            parsedInsights ? (
              <div className={`transition-all duration-1000 ${isVisible ? "animate-slide-up opacity-100" : "opacity-0"}`}>
                {/* Sectioned Insights */}
                {parsedInsights.map((section, index) => {
                  const IconComponent = section.icon || Heart;
                  const bgColors: { [key: string]: string } = {
                    coral: "from-coral-50 to-orange-50",
                    blue: "from-blue-50 to-cyan-50",
                    green: "from-green-50 to-emerald-50",
                    purple: "from-purple-50 to-pink-50"
                  }
                  const textColors: { [key: string]: string } = {
                    coral: "text-coral-600",
                    blue: "text-blue-600",
                    green: "text-green-600",
                    purple: "text-purple-600"
                  }
                  const borderColors: { [key: string]: string } = {
                    coral: "border-coral-200",
                    blue: "border-blue-200",
                    green: "border-green-200",
                    purple: "border-purple-200"
                  }

                  return (
                    <Card
                      key={index}
                      className={`border-2 ${borderColors[section.color]} bg-gradient-to-br ${bgColors[section.color]} animate-fade-in`}
                      style={{ animationDelay: `${(index + 1) * 150}ms` }}
                    >
                      <CardHeader>
                        <CardTitle className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg bg-white/50 ${textColors[section.color]}`}>
                            <IconComponent className="w-6 h-6" />
                          </div>
                          <span className={textColors[section.color]}>{section.title}</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-foreground leading-relaxed whitespace-pre-line">
                          {section.content}
                        </p>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            ) : (
              <Card className="border-0 bg-gradient-to-br from-purple-50 to-pink-50 mb-8 animate-fade-in">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Brain className="w-8 h-8 text-purple-600" />
                    <h2 className="text-xl font-semibold text-foreground">Getting Started with Mood & Journaling</h2>
                  </div>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {insights}
                  </p>
                </CardContent>
              </Card>
            )
          )}

          {/* No insights yet (initially empty) */}
          {!insights && !error && (
            <Card className="border-0 bg-gradient-to-br from-gray-50 to-blue-50 text-center py-12">
              <CardContent className="p-6">
                <Brain className="w-12 h-12 text-blue-500 mx-auto mb-4 animate-pulse" />
                <p className="text-muted-foreground mb-4">No insights available yet.</p>
                <p className="text-sm text-muted-foreground mb-6">Start tracking your mood and journaling to get AI-powered emotional insights!</p>
                <div className="flex gap-3 justify-center">
                  <Button onClick={() => router.push("/mood-tracker")} variant="outline">
                    Track Mood
                  </Button>
                  <Button onClick={() => router.push("/journal")} className="bg-coral-500 hover:bg-coral-600">
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
