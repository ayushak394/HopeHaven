"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Heart,
  ArrowLeft,
  CheckCircle,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Sparkles,
  Activity,
} from "lucide-react"
import { getAuth, onAuthStateChanged } from "firebase/auth"
import axios from "axios"
import { app } from "@/lib/firebase"
import { useRouter } from "next/navigation"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

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
  const [currentMonth, setCurrentMonth] = useState(new Date())
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
        { headers: { Authorization: `Bearer ${token}` } },
      )

      setSubmitted(true)
      setSelectedMood(null)

      setTimeout(async () => {
        await fetchMoodEntries(user)
        setSubmitted(false)
        setSubmitting(false) // ✅ FIX HERE
      }, 2000)
    } catch (error) {
      console.error("Error submitting mood:", error)
      setSubmitting(false) // already correct here
    }
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const firstDayOfMonth = new Date(year, month, 1).getDay()
    return { daysInMonth, firstDayOfMonth }
  }

  const getMoodForDate = (date: Date) => {
    const dateStr = date.toDateString()
    const moodsForDate = moodEntries.filter((entry) => {
      const entryDate = new Date(entry.timestamp)
      return entryDate.toDateString() === dateStr
    })
    return moodsForDate
  }

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  const goToCurrentMonth = () => {
    setCurrentMonth(new Date())
  }

  const renderCalendar = () => {
    const { daysInMonth, firstDayOfMonth } = getDaysInMonth(currentMonth)
    const days = []
    const monthName = currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="aspect-square" />)
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
      const moodsForDay = getMoodForDate(date)
      const isToday = date.toDateString() === new Date().toDateString()
      const isFuture = date > new Date()

      days.push(
        <div
          key={day}
          className={`aspect-square p-1 rounded-lg border transition-all duration-300 ${
            isToday
              ? "border-coral-500 bg-linear-to-br from-coral-100 to-orange-100 shadow-lg"
              : isFuture
                ? "border-gray-200 bg-gray-50 opacity-50"
                : "border-gray-200 bg-white hover:border-coral-300 hover:shadow-lg hover:scale-105"
          }`}
        >
          <div className="flex flex-col h-full">
            <span className={`text-sm font-semibold mb-1 ${isToday ? "text-coral-600" : "text-gray-700"}`}>{day}</span>
            <div className="flex-1 flex items-center justify-center">
              {moodsForDay.length > 0 ? (
                <div className="flex flex-wrap gap-1 justify-center">
                  {moodsForDay.slice(0, 3).map((entry, idx) => {
                    const moodData = MOODS.find((m) => m.value === entry.mood)
                    return (
                      <span
                        key={idx}
                        className="text-4xl hover:scale-125 transition-transform cursor-pointer"
                        title={`${entry.mood} - ${new Date(entry.timestamp).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`}
                      >
                        {moodData?.emoji}
                      </span>
                    )
                  })}
                  {moodsForDay.length > 3 && (
                    <span className="text-xs text-gray-500 font-semibold">+{moodsForDay.length - 3}</span>
                  )}
                </div>
              ) : !isFuture ? (
                <div className="w-2 h-2 rounded-full bg-gray-200" />
              ) : null}
            </div>
          </div>
        </div>,
      )
    }

    return (
      <Card className="border-0 bg-white/70 backdrop-blur-lg shadow-xl hover:shadow-2xl transition-all duration-500 animate-fade-in animation-delay-300 overflow-hidden group">
        <div className="absolute inset-0 bg-linear-to-br from-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <CardHeader className="relative">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-linear-to-br from-purple-400 to-blue-500 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl">Mood Calendar</span>
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={goToPreviousMonth}
                className="rounded-full hover:bg-coral-100 transition-all duration-300"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                onClick={goToCurrentMonth}
                className="text-sm font-semibold min-w-[140px] hover:bg-coral-100 transition-all duration-300"
              >
                {monthName}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={goToNextMonth}
                className="rounded-full hover:bg-coral-100 transition-all duration-300"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">Track your emotional journey day by day</p>
        </CardHeader>
        <CardContent className="relative">
          <div className="grid grid-cols-7 gap-2 mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">{days}</div>
        </CardContent>
      </Card>
    )
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

  const chartData = moodEntries
    .slice(0, 14)
    .reverse()
    .map((entry) => ({
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
    <div className="min-h-screen bg-linear-to-br from-background via-coral-50/20 to-blue-50/20 relative overflow-hidden">
      <div className="absolute top-20 left-10 w-72 h-72 bg-coral-500/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-float animation-delay-200" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-3xl animate-pulse-gentle" />

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
              Mood Tracker
            </h1>
          </div>
          <Sparkles className="w-6 h-6 text-coral-500 animate-pulse" />
        </div>
      </header>

      <section className="py-8 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <div
            className={`grid md:grid-cols-3 gap-6 mb-8 transition-all duration-1000 ${isVisible ? "animate-slide-up opacity-100" : "opacity-0"}`}
          >
            <div className="md:col-span-2">
              <Card className="border-0 bg-white/70 backdrop-blur-lg shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden group h-full">
                <div className="absolute inset-0 bg-linear-to-br from-coral-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <CardHeader className="relative">
                  <CardTitle className="text-3xl font-bold bg-linear-to-r from-coral-600 to-orange-600 bg-clip-text text-transparent">
                    How are you feeling right now?
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-2">Take a moment to check in with yourself</p>
                </CardHeader>
                <CardContent className="relative">
                  {submitted ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-4 animate-fade-in">
                      <div className="w-20 h-20 rounded-full bg-linear-to-br from-coral-400 to-orange-500 flex items-center justify-center">
                        <CheckCircle className="w-12 h-12 text-white animate-float" />
                      </div>
                      <p className="text-xl font-semibold text-foreground">Mood logged successfully!</p>
                      <p className="text-muted-foreground">Great job checking in with yourself today.</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {MOODS.map((mood, index) => (
                          <button
                            key={mood.value}
                            onClick={() => setSelectedMood(mood.value)}
                            className={`p-6 rounded-2xl transition-all duration-300 transform hover:scale-110 ${
                              selectedMood === mood.value
                                ? `bg-linear-to-br ${mood.color === "bg-yellow-500" ? "from-yellow-400 to-orange-500" : mood.color === "bg-blue-500" ? "from-blue-400 to-cyan-500" : mood.color === "bg-purple-500" ? "from-purple-400 to-fuchsia-500" : mood.color === "bg-green-500" ? "from-green-400 to-teal-500" : mood.color === "bg-red-500" ? "from-red-400 to-pink-500" : "from-gray-400 to-slate-500"} text-white shadow-2xl scale-110`
                                : "bg-white hover:bg-linear-to-br hover:from-white hover:to-coral-50 text-foreground border-2 border-gray-200 hover:border-coral-300 shadow-md hover:shadow-xl"
                            } animate-fade-in`}
                            style={{ animationDelay: `${index * 100}ms` }}
                          >
                            <div className="text-5xl mb-3">{mood.emoji}</div>
                            <div className="text-sm font-bold">{mood.label}</div>
                          </button>
                        ))}
                      </div>

                      <Button
                        onClick={handleSubmitMood}
                        disabled={!selectedMood || submitting}
                        size="lg"
                        className="w-full bg-linear-to-r from-coral-500 to-orange-500 hover:from-coral-600 hover:to-orange-600 text-white py-6 text-lg rounded-2xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-2xl disabled:opacity-50"
                      >
                        {submitting ? (
                          <span className="flex items-center gap-2">
                            <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                            Logging mood...
                          </span>
                        ) : (
                          "Log This Mood"
                        )}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card className="border-0 bg-white/70 backdrop-blur-lg shadow-xl hover:shadow-2xl transition-all duration-500 animate-fade-in animation-delay-300 overflow-hidden group">
              <div className="absolute inset-0 bg-linear-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardHeader className="relative">
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-linear-to-br from-purple-400 to-pink-500 flex items-center justify-center">
                    <Heart className="w-4 h-4 text-white fill-white" />
                  </div>
                  Recent Entries
                </CardTitle>
              </CardHeader>
              <CardContent className="relative">
                {moodEntries.length > 0 ? (
                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {moodEntries.slice(0, 20).map((entry, index) => {
                      const moodData = MOODS.find((m) => m.value === entry.mood)
                      return (
                        <div
                          key={entry.id}
                          className="flex items-center gap-3 p-4 bg-linear-to-br from-white/90 to-coral-50/50 rounded-xl border border-coral-200/30 hover:border-coral-300 hover:shadow-lg transition-all duration-300 animate-fade-in hover:scale-[1.02] group/item"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <span className="text-3xl group-hover/item:scale-125 transition-transform duration-300">
                            {moodData?.emoji}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-foreground capitalize">{entry.mood}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(entry.timestamp).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <div className="w-16 h-16 rounded-full bg-linear-to-br from-coral-100 to-pink-100 flex items-center justify-center mx-auto mb-3">
                      <Heart className="w-8 h-8 text-coral-500" />
                    </div>
                    <p className="font-medium text-sm">No mood entries yet</p>
                    <p className="text-xs mt-1">Start logging!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <Card className="border-0 bg-white/70 backdrop-blur-lg shadow-xl hover:shadow-2xl transition-all duration-500 animate-fade-in animation-delay-100 overflow-hidden group">
              <div className="absolute inset-0 bg-linear-to-br from-coral-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardHeader className="relative">
                <CardTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-linear-to-br from-coral-400 to-orange-500 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl">Mood Distribution</span>
                </CardTitle>
                <p className="text-sm text-muted-foreground">Your emotional patterns at a glance</p>
              </CardHeader>
              <CardContent className="relative">
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
                        paddingAngle={3}
                      >
                        {moodStats.map((entry) => (
                          <Cell key={entry.mood} fill={MOOD_COLORS[entry.mood]} />
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
                    <div className="w-16 h-16 rounded-full bg-linear-to-br from-coral-100 to-orange-100 flex items-center justify-center">
                      <TrendingUp className="w-8 h-8 text-coral-500" />
                    </div>
                    <p className="font-medium">No data yet</p>
                    <p className="text-xs">Start tracking to see patterns!</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-0 bg-white/70 backdrop-blur-lg shadow-xl hover:shadow-2xl transition-all duration-500 animate-fade-in animation-delay-200 overflow-hidden group">
              <div className="absolute inset-0 bg-linear-to-br from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardHeader className="relative">
                <CardTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-linear-to-br from-blue-400 to-cyan-500 flex items-center justify-center">
                    <Activity className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl">Recent Activity</span>
                </CardTitle>
                <p className="text-sm text-muted-foreground">Mood entries over the last 2 weeks</p>
              </CardHeader>
              <CardContent className="relative">
                {timeSeriesData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={timeSeriesData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                      <XAxis dataKey="date" stroke="#666" fontSize={12} />
                      <YAxis stroke="#666" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(255, 255, 255, 0.95)",
                          border: "none",
                          borderRadius: "12px",
                          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                        }}
                      />
                      <Bar dataKey="count" fill="url(#barGradient)" radius={[8, 8, 0, 0]} />
                      <defs>
                        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#FFB703" />
                          <stop offset="100%" stopColor="#FF6B6B" />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex flex-col items-center justify-center text-muted-foreground gap-3">
                    <div className="w-16 h-16 rounded-full bg-linear-to-br from-blue-100 to-cyan-100 flex items-center justify-center">
                      <Activity className="w-8 h-8 text-blue-500" />
                    </div>
                    <p className="font-medium">No activity yet</p>
                    <p className="text-xs">Log moods to see your timeline!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="max-w-7xl mx-auto">{renderCalendar()}</div>
        </div>
      </section>
    </div>
  )
}
