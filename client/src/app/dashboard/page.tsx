"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, ArrowLeft, TrendingUp, Award, Calendar, BookOpen, Brain } from 'lucide-react'
import { getAuth, onAuthStateChanged } from "firebase/auth"
import axios from "axios"
import { app } from "@/lib/firebase"
import { useRouter } from 'next/navigation'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

interface DashboardData {
  averageMood: number
  totalMoods: number
  averageSentiment: number
  totalJournals: number
  achievements: string[]
}

const MOOD_SCALE = {
  1: "Anxious",
  2: "Sad",
  3: "Neutral",
  4: "Calm",
  5: "Happy",
}

const getMoodEmoji = (moodValue: number): string => {
  if (moodValue >= 4.5) return "😊"
  if (moodValue >= 3.5) return "😌"
  if (moodValue >= 2.5) return "😐"
  if (moodValue >= 1.5) return "😢"
  return "😰"
}

const getMoodColor = (moodValue: number): string => {
  if (moodValue >= 4.5) return "text-yellow-500"
  if (moodValue >= 3.5) return "text-green-500"
  if (moodValue >= 2.5) return "text-gray-500"
  if (moodValue >= 1.5) return "text-blue-500"
  return "text-purple-500"
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [isVisible, setIsVisible] = useState(false)
  const auth = getAuth(app)
  const router = useRouter()

  useEffect(() => {
    setIsVisible(true)

    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        setUser(authUser)
        await fetchDashboardData(authUser)
      } else {
        router.push("/")
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [auth, router])

  const fetchDashboardData = async (authUser: any) => {
    try {
      const token = await authUser.getIdToken()
      const response = await axios.get("http://localhost:8080/api/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      })
      setDashboardData(response.data)
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
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

  const moodTrendData = [
    { week: "Week 1", average: 3.2 },
    { week: "Week 2", average: 3.5 },
    { week: "Week 3", average: 3.8 },
    { week: "Week 4", average: 4.1 },
  ]

  const activityData = [
    { name: "Mood Logs", value: dashboardData?.totalMoods || 0 },
    { name: "Journal Entries", value: dashboardData?.totalJournals || 0 },
  ]

  const COLORS = ["#FFB703", "#3B82F6"]

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
            <h1 className="text-2xl font-bold text-foreground">Wellness Dashboard</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <section className="py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Overview Section */}
          <div className={`transition-all duration-1000 ${isVisible ? "animate-slide-up opacity-100" : "opacity-0"}`}>
            <div className="grid md:grid-cols-4 gap-4 mb-8">
              {/* Average Mood Card */}
              <Card className="border-0 bg-gradient-to-br from-yellow-50 to-orange-50 animate-fade-in">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Average Mood</p>
                      <div className="flex items-baseline gap-2">
                        <span className={`text-4xl font-bold ${getMoodColor(dashboardData?.averageMood || 0)}`}>
                          {dashboardData?.averageMood?.toFixed(1) || "0"}
                        </span>
                        <span className="text-2xl">{getMoodEmoji(dashboardData?.averageMood || 0)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Total Mood Entries Card */}
              <Card className="border-0 bg-gradient-to-br from-coral-50 to-pink-50 animate-fade-in animation-delay-100">
                <CardContent className="p-6">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Mood Logs</p>
                    <div className="flex items-center gap-3">
                      <span className="text-4xl font-bold text-coral-600">{dashboardData?.totalMoods || 0}</span>
                      <Heart className="w-6 h-6 text-coral-500 fill-coral-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Journal Entries Card */}
              <Card className="border-0 bg-gradient-to-br from-blue-50 to-cyan-50 animate-fade-in animation-delay-200">
                <CardContent className="p-6">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Journal Entries</p>
                    <div className="flex items-center gap-3">
                      <span className="text-4xl font-bold text-blue-600">{dashboardData?.totalJournals || 0}</span>
                      <BookOpen className="w-6 h-6 text-blue-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Sentiment Score Card */}
              <Card className="border-0 bg-gradient-to-br from-purple-50 to-pink-50 animate-fade-in animation-delay-300">
                <CardContent className="p-6">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Sentiment Score</p>
                    <div className="flex items-center gap-3">
                      <span className="text-4xl font-bold text-purple-600">{(dashboardData?.averageSentiment || 0).toFixed(1)}</span>
                      <Brain className="w-6 h-6 text-purple-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Mood Trend Chart */}
            <Card className="border-0 bg-gradient-to-br from-white to-gray-50 animate-fade-in animation-delay-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-coral-500" />
                  Mood Trend (Weekly)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={moodTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                    <XAxis dataKey="week" />
                    <YAxis domain={[0, 5]} />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="average"
                      stroke="#FFB703"
                      strokeWidth={3}
                      dot={{ fill: "#FFB703", r: 6 }}
                      name="Mood Average"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Activity Distribution */}
            <Card className="border-0 bg-gradient-to-br from-white to-gray-50 animate-fade-in animation-delay-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-500" />
                  Activity Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(dashboardData?.totalMoods || 0) + (dashboardData?.totalJournals || 0) > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={activityData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {COLORS.map((color, index) => (
                          <Cell key={`cell-${index}`} fill={color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    <p>Start tracking to see your activity distribution!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Achievements Section */}
          <Card className="border-0 bg-gradient-to-br from-white to-gray-50 animate-fade-in animation-delay-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-coral-500" />
                Your Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dashboardData?.achievements && dashboardData.achievements.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {dashboardData.achievements.map((achievement, index) => (
                    <div
                      key={index}
                      className="p-4 bg-gradient-to-br from-coral-100 to-yellow-100 rounded-xl border-2 border-coral-200 flex items-center gap-3 animate-fade-in"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="text-2xl">🏆</div>
                      <p className="font-semibold text-foreground">{achievement}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Keep tracking your mood and journaling to unlock achievements!</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Wellness Tips Section */}
          <Card className="border-0 bg-gradient-to-br from-blue-100 to-cyan-100 mt-8 animate-fade-in animation-delay-400">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-blue-600" />
                Wellness Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-foreground leading-relaxed">
                  {dashboardData && dashboardData.averageMood >= 4
                    ? "Great job! Your mood has been consistently positive. Keep up the good work with your wellness routine!"
                    : "You're on your journey to better mental health. Remember to check in with yourself regularly and celebrate small wins."}
                </p>
                <p className="text-foreground leading-relaxed">
                  {dashboardData && dashboardData.totalJournals > 0
                    ? "Your journaling is helping you process emotions. Keep expressing yourself!"
                    : "Consider starting a journal to help process your thoughts and emotions."}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
