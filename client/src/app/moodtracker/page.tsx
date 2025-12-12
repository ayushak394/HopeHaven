"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, ArrowLeft, CheckCircle, TrendingUp } from 'lucide-react'
import { getAuth, onAuthStateChanged } from "firebase/auth"
import axios from "axios"
import { app } from "@/lib/firebase"
import { useRouter } from 'next/navigation'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

interface MoodEntry {
  id: number
  userId: string
  mood: string
  timestamp: string
}

interface MoodStats {
  mood: string
  count: number
}

const MOODS = [
  { value: "happy", label: "Happy", emoji: "😊", color: "bg-yellow-500" },
  { value: "sad", label: "Sad", emoji: "😢", color: "bg-blue-500" },
  { value: "anxious", label: "Anxious", emoji: "😰", color: "bg-purple-500" },
  { value: "calm", label: "Calm", emoji: "😌", color: "bg-green-500" },
  { value: "angry", label: "Angry", emoji: "😠", color: "bg-red-500" },
  { value: "neutral", label: "Neutral", emoji: "😐", color: "bg-gray-500" },
]

const MOOD_COLORS: Record<string, string> = {
  happy: "#FFB703",
  sad: "#3B82F6",
  anxious: "#A855F7",
  calm: "#10B981",
  angry: "#EF4444",
  neutral: "#6B7280",
}

export default function MoodTrackerPage() {
  const [user, setUser] = useState<any>(null)
  const [selectedMood, setSelectedMood] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([])
  const [moodStats, setMoodStats] = useState<MoodStats[]>([])
  const [isVisible, setIsVisible] = useState(false)
  const auth = getAuth(app)
  const router = useRouter()

  useEffect(() => {
    setIsVisible(true)

    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        setUser(authUser)
        await fetchMoodEntries(authUser)
      } else {
        router.push("/")
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [auth, router])

  const fetchMoodEntries = async (authUser: any) => {
    try {
      const token = await authUser.getIdToken()
      const response = await axios.get("http://localhost:8080/api/moods/all", {
        headers: { Authorization: `Bearer ${token}` },
      })
      setMoodEntries(response.data)
      calculateStats(response.data)
    } catch (error) {
      console.error("Error fetching mood entries:", error)
    }
  }

  const calculateStats = (entries: MoodEntry[]) => {
    const stats: Record<string, number> = {}
    entries.forEach((entry) => {
      stats[entry.mood] = (stats[entry.mood] || 0) + 1
    })

    const statsArray = Object.entries(stats).map(([mood, count]) => ({
      mood,
      count,
    }))
    setMoodStats(statsArray)
  }

  const handleSubmitMood = async () => {
    if (!selectedMood || !user) return

    setSubmitting(true)
    try {
      const token = await user.getIdToken()
      await axios.post(
        "http://localhost:8080/api/moods/track",
        { mood: selectedMood },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      setSubmitted(true)
      setSelectedMood(null)

      setTimeout(async () => {
        await fetchMoodEntries(user)
      }, 2000)
    } catch (error) {
      console.error("Error submitting mood:", error)
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse">
          <Heart className="w-12 h-12 text-coral-500 animate-pulse" />
        </div>
      </div>
    )
  }

  const chartData = moodEntries.slice(0, 14).reverse().map((entry) => ({
    date: new Date(entry.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    mood: entry.mood,
  }))

  const timeSeriesData = chartData.reduce((acc: any[], item) => {
    const existing = acc.find((d) => d.date === item.date)
    if (existing) {
      existing.count++
    } else {
      acc.push({ date: item.date, count: 1 })
    }
    return acc
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/home")}
              className="rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-bold text-foreground">Mood Tracker</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <section className="py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Mood Input Section */}
          <div className={`transition-all duration-1000 ${isVisible ? "animate-slide-up opacity-100" : "opacity-0"}`}>
            <Card className="border-0 bg-gradient-to-br from-coral-50 to-blue-50 mb-8">
              <CardHeader>
                <CardTitle className="text-3xl">How are you feeling right now?</CardTitle>
              </CardHeader>
              <CardContent>
                {submitted ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-4 animate-fade-in">
                    <CheckCircle className="w-16 h-16 text-coral-500 animate-float" />
                    <p className="text-xl font-semibold text-foreground">Mood logged successfully!</p>
                    <p className="text-muted-foreground">Great job checking in with yourself today.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                      {MOODS.map((mood, index) => (
                        <button
                          key={mood.value}
                          onClick={() => setSelectedMood(mood.value)}
                          className={`p-4 rounded-2xl transition-all duration-300 transform hover:scale-110 ${
                            selectedMood === mood.value
                              ? `${mood.color} text-white shadow-lg scale-110`
                              : "bg-white/60 hover:bg-white/80 text-foreground border-2 border-transparent hover:border-coral-300"
                          } animate-fade-in ${`animation-delay-${index * 100}`}`}
                        >
                          <div className="text-4xl mb-2">{mood.emoji}</div>
                          <div className="text-sm font-semibold">{mood.label}</div>
                        </button>
                      ))}
                    </div>

                    <Button
                      onClick={handleSubmitMood}
                      disabled={!selectedMood || submitting}
                      size="lg"
                      className="w-full bg-coral-500 hover:bg-coral-600 text-white py-3 text-lg rounded-full transition-all duration-300 hover:scale-105"
                    >
                      {submitting ? "Logging mood..." : "Log This Mood"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Analytics Section */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Mood Distribution Pie Chart */}
            <Card className="border-0 bg-gradient-to-br from-white to-gray-50 animate-fade-in animation-delay-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-coral-500" />
                  Mood Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                {moodStats.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={moodStats}
                        dataKey="count"
                        nameKey="mood"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={({ mood, count }) => `${mood}: ${count}`}
                      >
                        {moodStats.map((entry) => (
                          <Cell key={entry.mood} fill={MOOD_COLORS[entry.mood]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    <p>No mood data yet. Start logging to see patterns!</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Mood Frequency Bar Chart */}
            <Card className="border-0 bg-gradient-to-br from-white to-gray-50 animate-fade-in animation-delay-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-500" />
                  Mood Count
                </CardTitle>
              </CardHeader>
              <CardContent>
                {moodStats.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={moodStats}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                      <XAxis dataKey="mood" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#FFB703" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    <p>No mood data yet. Start logging to see patterns!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Entries Section */}
          <Card className="border-0 bg-gradient-to-br from-white to-gray-50 animate-fade-in animation-delay-300">
            <CardHeader>
              <CardTitle>Recent Mood Entries</CardTitle>
            </CardHeader>
            <CardContent>
              {moodEntries.length > 0 ? (
                <div className="space-y-3">
                  {moodEntries.slice(0, 10).map((entry, index) => {
                    const moodData = MOODS.find((m) => m.value === entry.mood)
                    return (
                      <div
                        key={entry.id}
                        className="flex items-center justify-between p-4 bg-white/60 rounded-xl border border-border/30 hover:bg-white/80 transition-colors animate-fade-in"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div className="flex items-center gap-4">
                          <span className="text-3xl">{moodData?.emoji}</span>
                          <div>
                            <p className="font-semibold text-foreground capitalize">{entry.mood}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(entry.timestamp).toLocaleDateString("en-US", {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>
                        <Heart className="w-5 h-5 text-coral-500 fill-coral-500" />
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <p>No mood entries yet. Start by logging your mood above!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
