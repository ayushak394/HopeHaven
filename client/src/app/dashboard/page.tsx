// "use client"

// import { useState, useEffect } from "react"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Heart, ArrowLeft, TrendingUp, Award, Calendar, BookOpen, Brain, Sparkles, Target } from "lucide-react"
// import { getAuth, onAuthStateChanged } from "firebase/auth"
// import axios from "axios"
// import { app } from "@/lib/firebase"
// import { useRouter } from "next/navigation"
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
//   PieChart,
//   Pie,
//   Cell,
// } from "recharts"

// interface DashboardData {
//   averageMood: number
//   totalMoods: number
//   averageSentiment: number
//   totalJournals: number
//   achievements: string[]
// }

// const MOOD_SCALE = {
//   1: "Anxious",
//   2: "Sad",
//   3: "Neutral",
//   4: "Calm",
//   5: "Happy",
// }

// const getMoodEmoji = (moodValue: number): string => {
//   if (moodValue >= 4.5) return "😊"
//   if (moodValue >= 3.5) return "😌"
//   if (moodValue >= 2.5) return "😐"
//   if (moodValue >= 1.5) return "😢"
//   return "😰"
// }

// const getMoodColor = (moodValue: number): string => {
//   if (moodValue >= 4.5) return "text-yellow-500"
//   if (moodValue >= 3.5) return "text-green-500"
//   if (moodValue >= 2.5) return "text-gray-500"
//   if (moodValue >= 1.5) return "text-blue-500"
//   return "text-purple-500"
// }

// export default function DashboardPage() {
//   const [user, setUser] = useState<any>(null)
//   const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
//   const [loading, setLoading] = useState(true)
//   const [isVisible, setIsVisible] = useState(false)
//   const auth = getAuth(app)
//   const router = useRouter()

//   useEffect(() => {
//     setIsVisible(true)

//     const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
//       if (authUser) {
//         setUser(authUser)
//         await fetchDashboardData(authUser)
//       } else {
//         router.push("/")
//       }
//       setLoading(false)
//     })

//     return () => unsubscribe()
//   }, [auth, router])

//   const fetchDashboardData = async (authUser: any) => {
//     try {
//       const token = await authUser.getIdToken()
//       const response = await axios.get("http://localhost:8080/api/dashboard", {
//         headers: { Authorization: `Bearer ${token}` },
//       })
//       setDashboardData(response.data)
//     } catch (error) {
//       console.error("Error fetching dashboard data:", error)
//     }
//   }

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-background flex items-center justify-center">
//         <div className="animate-pulse">
//           <Heart className="w-12 h-12 text-coral-500 animate-pulse" />
//         </div>
//       </div>
//     )
//   }

//   const moodTrendData = [
//     { week: "Week 1", average: 3.2 },
//     { week: "Week 2", average: 3.5 },
//     { week: "Week 3", average: 3.8 },
//     { week: "Week 4", average: 4.1 },
//   ]

//   const activityData = [
//     { name: "Mood Logs", value: dashboardData?.totalMoods || 0 },
//     { name: "Journal Entries", value: dashboardData?.totalJournals || 0 },
//   ]

//   const COLORS = ["#FFB703", "#3B82F6"]

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-background via-coral-50/20 to-blue-50/20 relative overflow-hidden">
//       <div className="absolute top-20 left-10 w-72 h-72 bg-coral-500/10 rounded-full blur-3xl animate-float" />
//       <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-float animation-delay-200" />
//       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-3xl animate-pulse-gentle" />

//       {/* Header */}
//       <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
//         <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
//           <div className="flex items-center gap-4">
//             <Button
//               variant="ghost"
//               size="icon"
//               onClick={() => router.push("/home")}
//               className="rounded-full hover:bg-coral-100 transition-all duration-300 hover:scale-110"
//             >
//               <ArrowLeft className="w-5 h-5" />
//             </Button>
//             <h1 className="text-3xl font-bold bg-gradient-to-r from-coral-500 via-orange-500 to-blue-500 bg-clip-text text-transparent">
//               Wellness Dashboard
//             </h1>
//           </div>
//           <Sparkles className="w-6 h-6 text-coral-500 animate-pulse" />
//         </div>
//       </header>

//       {/* Main Content */}
//       <section className="py-8 px-4 relative">
//         <div className="max-w-7xl mx-auto">
//           {/* Overview Section */}
//           <div className={`transition-all duration-1000 ${isVisible ? "animate-slide-up opacity-100" : "opacity-0"}`}>
//             <div className="grid md:grid-cols-4 gap-6 mb-8">
//               {/* Average Mood Card */}
//               <Card className="border-0 bg-gradient-to-br from-yellow-100/80 via-orange-100/80 to-coral-100/80 backdrop-blur-sm hover:shadow-2xl hover:scale-105 transition-all duration-500 animate-fade-in group">
//                 <CardContent className="p-6">
//                   <div className="flex items-center justify-between mb-2">
//                     <p className="text-sm font-semibold text-orange-700/80">Average Mood</p>
//                     <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
//                       <Target className="w-5 h-5 text-white" />
//                     </div>
//                   </div>
//                   <div className="flex items-baseline gap-2">
//                     <span className={`text-5xl font-bold ${getMoodColor(dashboardData?.averageMood || 0)}`}>
//                       {dashboardData?.averageMood?.toFixed(1) || "0"}
//                     </span>
//                     <span className="text-3xl">{getMoodEmoji(dashboardData?.averageMood || 0)}</span>
//                   </div>
//                   <p className="text-xs text-orange-600 mt-2 font-medium">
//                     {dashboardData && dashboardData.averageMood >= 4 ? "Excellent!" : "Keep going!"}
//                   </p>
//                 </CardContent>
//               </Card>

//               {/* Total Mood Entries Card */}
//               <Card className="border-0 bg-gradient-to-br from-coral-100/80 via-pink-100/80 to-rose-100/80 backdrop-blur-sm hover:shadow-2xl hover:scale-105 transition-all duration-500 animate-fade-in animation-delay-100 group">
//                 <CardContent className="p-6">
//                   <div className="flex items-center justify-between mb-2">
//                     <p className="text-sm font-semibold text-coral-700/80">Mood Logs</p>
//                     <div className="w-10 h-10 rounded-full bg-gradient-to-br from-coral-400 to-pink-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
//                       <Heart className="w-5 h-5 text-white fill-white animate-pulse-gentle" />
//                     </div>
//                   </div>
//                   <span className="text-5xl font-bold text-coral-600">{dashboardData?.totalMoods || 0}</span>
//                   <p className="text-xs text-coral-600 mt-2 font-medium">Total check-ins</p>
//                 </CardContent>
//               </Card>

//               {/* Journal Entries Card */}
//               <Card className="border-0 bg-gradient-to-br from-blue-100/80 via-cyan-100/80 to-sky-100/80 backdrop-blur-sm hover:shadow-2xl hover:scale-105 transition-all duration-500 animate-fade-in animation-delay-200 group">
//                 <CardContent className="p-6">
//                   <div className="flex items-center justify-between mb-2">
//                     <p className="text-sm font-semibold text-blue-700/80">Journal Entries</p>
//                     <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center group-hover:rotate-6 transition-transform duration-300">
//                       <BookOpen className="w-5 h-5 text-white" />
//                     </div>
//                   </div>
//                   <span className="text-5xl font-bold text-blue-600">{dashboardData?.totalJournals || 0}</span>
//                   <p className="text-xs text-blue-600 mt-2 font-medium">Reflections written</p>
//                 </CardContent>
//               </Card>

//               {/* Sentiment Score Card */}
//               <Card className="border-0 bg-gradient-to-br from-purple-100/80 via-violet-100/80 to-fuchsia-100/80 backdrop-blur-sm hover:shadow-2xl hover:scale-105 transition-all duration-500 animate-fade-in animation-delay-300 group">
//                 <CardContent className="p-6">
//                   <div className="flex items-center justify-between mb-2">
//                     <p className="text-sm font-semibold text-purple-700/80">Sentiment</p>
//                     <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-fuchsia-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
//                       <Brain className="w-5 h-5 text-white" />
//                     </div>
//                   </div>
//                   <span className="text-5xl font-bold text-purple-600">
//                     {(dashboardData?.averageSentiment || 0).toFixed(1)}
//                   </span>
//                   <p className="text-xs text-purple-600 mt-2 font-medium">AI analysis</p>
//                 </CardContent>
//               </Card>
//             </div>
//           </div>

//           {/* Charts Section */}
//           <div className="grid md:grid-cols-2 gap-8 mb-8">
//             {/* Mood Trend Chart */}
//             <Card className="border-0 bg-white/70 backdrop-blur-lg shadow-xl hover:shadow-2xl transition-all duration-500 animate-fade-in animation-delay-100 overflow-hidden group">
//               <div className="absolute inset-0 bg-gradient-to-br from-coral-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
//               <CardHeader className="relative">
//                 <CardTitle className="flex items-center gap-3">
//                   <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-coral-400 to-orange-500 flex items-center justify-center">
//                     <TrendingUp className="w-5 h-5 text-white" />
//                   </div>
//                   <span className="text-xl">Mood Trend</span>
//                 </CardTitle>
//                 <p className="text-sm text-muted-foreground">Your emotional journey over the past month</p>
//               </CardHeader>
//               <CardContent className="relative">
//                 <ResponsiveContainer width="100%" height={300}>
//                   <LineChart data={moodTrendData}>
//                     <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
//                     <XAxis dataKey="week" stroke="#666" fontSize={12} />
//                     <YAxis domain={[0, 5]} stroke="#666" fontSize={12} />
//                     <Tooltip
//                       contentStyle={{
//                         backgroundColor: "rgba(255, 255, 255, 0.95)",
//                         border: "none",
//                         borderRadius: "12px",
//                         boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
//                       }}
//                     />
//                     <Legend />
//                     <Line
//                       type="monotone"
//                       dataKey="average"
//                       stroke="url(#colorGradient)"
//                       strokeWidth={4}
//                       dot={{ fill: "#FFB703", r: 8, strokeWidth: 2, stroke: "#fff" }}
//                       activeDot={{ r: 10 }}
//                       name="Mood Average"
//                     />
//                     <defs>
//                       <linearGradient id="colorGradient" x1="0" y1="0" x2="1" y2="0">
//                         <stop offset="0%" stopColor="#FFB703" />
//                         <stop offset="100%" stopColor="#FF6B6B" />
//                       </linearGradient>
//                     </defs>
//                   </LineChart>
//                 </ResponsiveContainer>
//               </CardContent>
//             </Card>

//             {/* Activity Distribution */}
//             <Card className="border-0 bg-white/70 backdrop-blur-lg shadow-xl hover:shadow-2xl transition-all duration-500 animate-fade-in animation-delay-200 overflow-hidden group">
//               <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
//               <CardHeader className="relative">
//                 <CardTitle className="flex items-center gap-3">
//                   <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center">
//                     <Calendar className="w-5 h-5 text-white" />
//                   </div>
//                   <span className="text-xl">Activity Balance</span>
//                 </CardTitle>
//                 <p className="text-sm text-muted-foreground">Your wellness activities breakdown</p>
//               </CardHeader>
//               <CardContent className="relative">
//                 {(dashboardData?.totalMoods || 0) + (dashboardData?.totalJournals || 0) > 0 ? (
//                   <ResponsiveContainer width="100%" height={300}>
//                     <PieChart>
//                       <Pie
//                         data={activityData}
//                         cx="50%"
//                         cy="50%"
//                         labelLine={false}
//                         label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
//                         outerRadius={100}
//                         fill="#8884d8"
//                         dataKey="value"
//                         paddingAngle={5}
//                       >
//                         {COLORS.map((color, index) => (
//                           <Cell key={`cell-${index}`} fill={color} />
//                         ))}
//                       </Pie>
//                       <Tooltip
//                         contentStyle={{
//                           backgroundColor: "rgba(255, 255, 255, 0.95)",
//                           border: "none",
//                           borderRadius: "12px",
//                           boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
//                         }}
//                       />
//                     </PieChart>
//                   </ResponsiveContainer>
//                 ) : (
//                   <div className="h-[300px] flex flex-col items-center justify-center text-muted-foreground gap-3">
//                     <div className="w-16 h-16 rounded-full bg-gradient-to-br from-coral-100 to-blue-100 flex items-center justify-center">
//                       <Calendar className="w-8 h-8 text-coral-500" />
//                     </div>
//                     <p className="font-medium">Start tracking to see your activity distribution!</p>
//                   </div>
//                 )}
//               </CardContent>
//             </Card>
//           </div>

//           {/* Achievements Section */}
//           <Card className="border-0 bg-white/70 backdrop-blur-lg shadow-xl hover:shadow-2xl transition-all duration-500 animate-fade-in animation-delay-300 overflow-hidden mb-8 group">
//             <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-coral-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
//             <CardHeader className="relative">
//               <CardTitle className="flex items-center gap-3">
//                 <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-coral-500 flex items-center justify-center">
//                   <Award className="w-5 h-5 text-white" />
//                 </div>
//                 <span className="text-xl">Your Achievements</span>
//               </CardTitle>
//               <p className="text-sm text-muted-foreground">Celebrating your wellness milestones</p>
//             </CardHeader>
//             <CardContent className="relative">
//               {dashboardData?.achievements && dashboardData.achievements.length > 0 ? (
//                 <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
//                   {dashboardData.achievements.map((achievement, index) => (
//                     <div
//                       key={index}
//                       className="p-5 bg-gradient-to-br from-yellow-100/80 via-coral-100/80 to-pink-100/80 rounded-2xl border-2 border-coral-200/50 flex items-center gap-4 animate-fade-in hover:scale-105 hover:shadow-lg transition-all duration-300 group/item"
//                       style={{ animationDelay: `${index * 100}ms` }}
//                     >
//                       <div className="text-3xl group-hover/item:scale-125 transition-transform duration-300">🏆</div>
//                       <p className="font-semibold text-foreground">{achievement}</p>
//                     </div>
//                   ))}
//                 </div>
//               ) : (
//                 <div className="text-center py-12 text-muted-foreground">
//                   <div className="w-20 h-20 rounded-full bg-gradient-to-br from-coral-100 to-yellow-100 flex items-center justify-center mx-auto mb-4">
//                     <Award className="w-10 h-10 text-coral-500" />
//                   </div>
//                   <p className="font-medium text-lg">Keep tracking your mood and journaling to unlock achievements!</p>
//                 </div>
//               )}
//             </CardContent>
//           </Card>

//           {/* Wellness Tips Section */}
//           <Card className="border-0 bg-gradient-to-br from-blue-100/80 via-cyan-100/80 to-teal-100/80 backdrop-blur-lg shadow-xl hover:shadow-2xl transition-all duration-500 animate-fade-in animation-delay-400 overflow-hidden group">
//             <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
//             <CardHeader className="relative">
//               <CardTitle className="flex items-center gap-3">
//                 <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-teal-500 flex items-center justify-center">
//                   <Brain className="w-5 h-5 text-white" />
//                 </div>
//                 <span className="text-xl">Wellness Insights</span>
//               </CardTitle>
//               <p className="text-sm text-blue-700/70">Personalized guidance for your journey</p>
//             </CardHeader>
//             <CardContent className="relative">
//               <div className="space-y-4">
//                 <div className="p-5 bg-white/60 rounded-xl border-l-4 border-blue-500 hover:bg-white/80 transition-all duration-300">
//                   <p className="text-foreground leading-relaxed font-medium">
//                     {dashboardData && dashboardData.averageMood >= 4
//                       ? "🌟 Great job! Your mood has been consistently positive. Keep up the good work with your wellness routine!"
//                       : "💪 You're on your journey to better mental health. Remember to check in with yourself regularly and celebrate small wins."}
//                   </p>
//                 </div>
//                 <div className="p-5 bg-white/60 rounded-xl border-l-4 border-cyan-500 hover:bg-white/80 transition-all duration-300">
//                   <p className="text-foreground leading-relaxed font-medium">
//                     {dashboardData && dashboardData.totalJournals > 0
//                       ? "✍️ Your journaling is helping you process emotions. Keep expressing yourself!"
//                       : "📔 Consider starting a journal to help process your thoughts and emotions."}
//                   </p>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         </div>
//       </section>
//     </div>
//   )
// }

"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
} from "lucide-react"
import { getAuth, onAuthStateChanged } from "firebase/auth"
import axios from "axios"
import { app } from "@/lib/firebase"
import { useRouter } from "next/navigation"
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
} from "recharts"

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

  const weeklyActivityData = [
    { day: "Mon", moods: 5, journals: 2 },
    { day: "Tue", moods: 3, journals: 1 },
    { day: "Wed", moods: 7, journals: 3 },
    { day: "Thu", moods: 4, journals: 2 },
    { day: "Fri", moods: 6, journals: 4 },
    { day: "Sat", moods: 8, journals: 5 },
    { day: "Sun", moods: 5, journals: 3 },
  ]

  const moodDistributionData = [
    { mood: "Happy", count: 15, emoji: "😊" },
    { mood: "Calm", count: 12, emoji: "😌" },
    { mood: "Neutral", count: 8, emoji: "😐" },
    { mood: "Sad", count: 5, emoji: "😢" },
    { mood: "Anxious", count: 3, emoji: "😰" },
  ]

  const emotionalBalanceData = [
    { category: "Positive", score: 85 },
    { category: "Calm", score: 78 },
    { category: "Energy", score: 65 },
    { category: "Social", score: 70 },
    { category: "Focus", score: 80 },
  ]

  const engagementTrendData = [
    { month: "Jan", engagement: 45 },
    { month: "Feb", engagement: 52 },
    { month: "Mar", engagement: 61 },
    { month: "Apr", engagement: 73 },
    { month: "May", engagement: 85 },
    { month: "Jun", engagement: 92 },
  ]

  const MOOD_COLORS = ["#FFB703", "#4ADE80", "#94A3B8", "#60A5FA", "#C084FC"]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-coral-50/20 to-blue-50/20 relative overflow-hidden">
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
            <h1 className="text-3xl font-bold bg-gradient-to-r from-coral-500 via-orange-500 to-blue-500 bg-clip-text text-transparent">
              Wellness Dashboard
            </h1>
          </div>
          <Sparkles className="w-6 h-6 text-coral-500 animate-pulse" />
        </div>
      </header>

      {/* Main Content */}
      <section className="py-8 px-4 relative">
        <div className="max-w-7xl mx-auto">
          {/* Overview Section */}
          <div className={`transition-all duration-1000 ${isVisible ? "animate-slide-up opacity-100" : "opacity-0"}`}>
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              {/* Average Mood Card */}
              <Card className="border-0 bg-gradient-to-br from-yellow-100/80 via-orange-100/80 to-coral-100/80 backdrop-blur-sm hover:shadow-2xl hover:scale-105 transition-all duration-500 animate-fade-in group">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-orange-700/80">Average Mood</p>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                      <Target className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className={`text-5xl font-bold ${getMoodColor(dashboardData?.averageMood || 0)}`}>
                      {dashboardData?.averageMood?.toFixed(1) || "0"}
                    </span>
                    <span className="text-3xl">{getMoodEmoji(dashboardData?.averageMood || 0)}</span>
                  </div>
                  <p className="text-xs text-orange-600 mt-2 font-medium">
                    {dashboardData && dashboardData.averageMood >= 4 ? "Excellent!" : "Keep going!"}
                  </p>
                </CardContent>
              </Card>

              {/* Total Mood Entries Card */}
              <Card className="border-0 bg-gradient-to-br from-coral-100/80 via-pink-100/80 to-rose-100/80 backdrop-blur-sm hover:shadow-2xl hover:scale-105 transition-all duration-500 animate-fade-in animation-delay-100 group">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-coral-700/80">Mood Logs</p>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-coral-400 to-pink-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Heart className="w-5 h-5 text-white fill-white animate-pulse-gentle" />
                    </div>
                  </div>
                  <span className="text-5xl font-bold text-coral-600">{dashboardData?.totalMoods || 0}</span>
                  <p className="text-xs text-coral-600 mt-2 font-medium">Total check-ins</p>
                </CardContent>
              </Card>

              {/* Journal Entries Card */}
              <Card className="border-0 bg-gradient-to-br from-blue-100/80 via-cyan-100/80 to-sky-100/80 backdrop-blur-sm hover:shadow-2xl hover:scale-105 transition-all duration-500 animate-fade-in animation-delay-200 group">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-blue-700/80">Journal Entries</p>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center group-hover:rotate-6 transition-transform duration-300">
                      <BookOpen className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <span className="text-5xl font-bold text-blue-600">{dashboardData?.totalJournals || 0}</span>
                  <p className="text-xs text-blue-600 mt-2 font-medium">Reflections written</p>
                </CardContent>
              </Card>

              {/* Sentiment Score Card */}
              <Card className="border-0 bg-gradient-to-br from-purple-100/80 via-violet-100/80 to-fuchsia-100/80 backdrop-blur-sm hover:shadow-2xl hover:scale-105 transition-all duration-500 animate-fade-in animation-delay-300 group">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-purple-700/80">Sentiment</p>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-fuchsia-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Brain className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <span className="text-5xl font-bold text-purple-600">
                    {(dashboardData?.averageSentiment || 0).toFixed(1)}
                  </span>
                  <p className="text-xs text-purple-600 mt-2 font-medium">AI analysis</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Charts Section - Expanded Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            {/* Mood Trend Chart */}
            <Card className="border-0 bg-white/70 backdrop-blur-lg shadow-xl hover:shadow-2xl transition-all duration-500 animate-fade-in animation-delay-100 overflow-hidden group lg:col-span-2">
              <div className="absolute inset-0 bg-gradient-to-br from-coral-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardHeader className="relative">
                <CardTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-coral-400 to-orange-500 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl">Mood Trend</span>
                </CardTitle>
                <p className="text-sm text-muted-foreground">Your emotional journey over the past month</p>
              </CardHeader>
              <CardContent className="relative">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={moodTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                    <XAxis dataKey="week" stroke="#666" fontSize={12} />
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
                      dataKey="average"
                      stroke="url(#colorGradient)"
                      strokeWidth={4}
                      dot={{ fill: "#FFB703", r: 8, strokeWidth: 2, stroke: "#fff" }}
                      activeDot={{ r: 10 }}
                      name="Mood Average"
                    />
                    <defs>
                      <linearGradient id="colorGradient" x1="0" y1="0" x2="1" y2="0">
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
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardHeader className="relative">
                <CardTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl">Activity Balance</span>
                </CardTitle>
                <p className="text-sm text-muted-foreground">Your wellness activities breakdown</p>
              </CardHeader>
              <CardContent className="relative">
                {(dashboardData?.totalMoods || 0) + (dashboardData?.totalJournals || 0) > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={activityData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        paddingAngle={5}
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
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-coral-100 to-blue-100 flex items-center justify-center mx-auto mb-4">
                      <Calendar className="w-8 h-8 text-coral-500" />
                    </div>
                    <p className="font-medium">Start tracking to see your activity distribution!</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Weekly Activity Bar Chart */}
            <Card className="border-0 bg-white/70 backdrop-blur-lg shadow-xl hover:shadow-2xl transition-all duration-500 animate-fade-in animation-delay-300 overflow-hidden group lg:col-span-2">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardHeader className="relative">
                <CardTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl">Weekly Activity</span>
                </CardTitle>
                <p className="text-sm text-muted-foreground">Your mood logs and journal entries this week</p>
              </CardHeader>
              <CardContent className="relative">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={weeklyActivityData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
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
                    <Bar dataKey="moods" fill="#FFB703" radius={[8, 8, 0, 0]} name="Mood Logs" />
                    <Bar dataKey="journals" fill="#3B82F6" radius={[8, 8, 0, 0]} name="Journal Entries" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Mood Distribution Chart */}
            <Card className="border-0 bg-white/70 backdrop-blur-lg shadow-xl hover:shadow-2xl transition-all duration-500 animate-fade-in animation-delay-400 overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardHeader className="relative">
                <CardTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
                    <PieChartIcon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl">Mood Types</span>
                </CardTitle>
                <p className="text-sm text-muted-foreground">Distribution of your emotional states</p>
              </CardHeader>
              <CardContent className="relative">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={moodDistributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, emoji, percent }) => `${emoji} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={90}
                      fill="#8884d8"
                      dataKey="count"
                      paddingAngle={3}
                    >
                      {moodDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={MOOD_COLORS[index % MOOD_COLORS.length]} />
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
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardHeader className="relative">
                <CardTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl">Emotional Balance</span>
                </CardTitle>
                <p className="text-sm text-muted-foreground">Your wellness dimensions overview</p>
              </CardHeader>
              <CardContent className="relative">
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={emotionalBalanceData}>
                    <PolarGrid stroke="rgba(0,0,0,0.1)" />
                    <PolarAngleAxis dataKey="category" stroke="#666" fontSize={12} />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#666" fontSize={11} />
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
              <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardHeader className="relative">
                <CardTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl">Engagement</span>
                </CardTitle>
                <p className="text-sm text-muted-foreground">Your consistency over time</p>
              </CardHeader>
              <CardContent className="relative">
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={engagementTrendData}>
                    <defs>
                      <linearGradient id="engagementGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#14B8A6" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#14B8A6" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                    <XAxis dataKey="month" stroke="#666" fontSize={12} />
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

          {/* Achievements Section */}
          <Card className="border-0 bg-white/70 backdrop-blur-lg shadow-xl hover:shadow-2xl transition-all duration-500 animate-fade-in animation-delay-300 overflow-hidden mb-8 group">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-coral-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardHeader className="relative">
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-coral-500 flex items-center justify-center">
                  <Award className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl">Your Achievements</span>
              </CardTitle>
              <p className="text-sm text-muted-foreground">Celebrating your wellness milestones</p>
            </CardHeader>
            <CardContent className="relative">
              {dashboardData?.achievements && dashboardData.achievements.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {dashboardData.achievements.map((achievement, index) => (
                    <div
                      key={index}
                      className="p-5 bg-gradient-to-br from-yellow-100/80 via-coral-100/80 to-pink-100/80 rounded-2xl border-2 border-coral-200/50 flex items-center gap-4 animate-fade-in hover:scale-105 hover:shadow-lg transition-all duration-300 group/item"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="text-3xl group-hover/item:scale-125 transition-transform duration-300">🏆</div>
                      <p className="font-semibold text-foreground">{achievement}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-coral-100 to-yellow-100 flex items-center justify-center mx-auto mb-4">
                    <Award className="w-10 h-10 text-coral-500" />
                  </div>
                  <p className="font-medium text-lg">Keep tracking your mood and journaling to unlock achievements!</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Wellness Tips Section */}
          <Card className="border-0 bg-gradient-to-br from-blue-100/80 via-cyan-100/80 to-teal-100/80 backdrop-blur-lg shadow-xl hover:shadow-2xl transition-all duration-500 animate-fade-in animation-delay-400 overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardHeader className="relative">
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-teal-500 flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl">Wellness Insights</span>
              </CardTitle>
              <p className="text-sm text-blue-700/70">Personalized guidance for your journey</p>
            </CardHeader>
            <CardContent className="relative">
              <div className="space-y-4">
                <div className="p-5 bg-white/60 rounded-xl border-l-4 border-blue-500 hover:bg-white/80 transition-all duration-300">
                  <p className="text-foreground leading-relaxed font-medium">
                    {dashboardData && dashboardData.averageMood >= 4
                      ? "🌟 Great job! Your mood has been consistently positive. Keep up the good work with your wellness routine!"
                      : "💪 You're on your journey to better mental health. Remember to check in with yourself regularly and celebrate small wins."}
                  </p>
                </div>
                <div className="p-5 bg-white/60 rounded-xl border-l-4 border-cyan-500 hover:bg-white/80 transition-all duration-300">
                  <p className="text-foreground leading-relaxed font-medium">
                    {dashboardData && dashboardData.totalJournals > 0
                      ? "✍️ Your journaling is helping you process emotions. Keep expressing yourself!"
                      : "📔 Consider starting a journal to help process your thoughts and emotions."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
