"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Heart,
  Brain,
  BookOpen,
  Sparkles,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import type { Metadata } from "next";
import {
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from "firebase/auth";
import axios from "axios";
import { app } from "../lib/firebase";

export const metadata: Metadata = {
  title: "HopeHaven",
  description: "Learn more about HopeHaven and our mission.",
};

export default function HopeHavenLanding() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentMood, setCurrentMood] = useState(0);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const auth = getAuth(app);

  const handleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Sign-in error:", error);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
  };

  // useEffect(() => {
  //   setIsVisible(true)

  //   const interval = setInterval(() => {
  //     setCurrentMood((prev) => (prev + 1) % moods.length)
  //   }, 2000)

  //   const unsubscribe = onAuthStateChanged(auth, async (user) => {
  //     if (user) {
  //       setUser(user)
  //       console.log("Signed in as:", user.email)
  //       const token = await user.getIdToken()
  //       try {
  //         const res = await axios.get("http://localhost:8080/api/secure-data", {
  //           headers: { Authorization: `Bearer ${token}` },
  //         })
  //         console.log(res.data)
  //       } catch (err) {
  //         console.error("Error calling backend:", err)
  //       }
  //     } else {
  //       setUser(null)
  //       console.log("No user signed in")
  //     }
  //   })

  //   return () => {
  //     clearInterval(interval)
  //     unsubscribe()
  //   }
  // }, [])

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentMood((prev) => (prev + 1) % moods.length);
    }, 2000);

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        console.log("✅ Signed in as:", user.email);

        const token = await user.getIdToken();
        localStorage.setItem("authToken", token);
        localStorage.setItem("user", JSON.stringify(user));

        // ✅ redirect to home after successful login
        router.push("/home");

        try {
          const res = await axios.get("http://localhost:8080/api/secure-data", {
            headers: { Authorization: `Bearer ${token}` },
          });
          console.log(res.data);
        } catch (err) {
          console.error("Error calling backend:", err);
        }
      } else {
        setUser(null);
        console.log("No user signed in");
      }
    });

    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, []);

  const moods = [
    { emoji: "😊", label: "Happy", color: "text-coral-500" },
    { emoji: "😌", label: "Calm", color: "text-blue-400" },
    { emoji: "😔", label: "Sad", color: "text-slate-400" },
    { emoji: "😰", label: "Anxious", color: "text-yellow-500" },
    { emoji: "😴", label: "Tired", color: "text-purple-400" },
  ];

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentMood((prev) => (prev + 1) % moods.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <section className="relative overflow-hidden bg-gradient-to-br from-coral-50 to-blue-50 py-20 px-4">
        <div className="relative max-w-6xl mx-auto text-center">
          <div
            className={`transition-all duration-1000 ${
              isVisible ? "animate-slide-up opacity-100" : "opacity-0"
            }`}
          >
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-6 py-2 mb-8 animate-pulse-gentle">
              <Heart className="w-5 h-5 text-coral-500" />
              <span className="text-sm font-medium text-foreground">
                Your Mental Wellness Journey Starts Here
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight">
              Welcome to{" "}
              <span className="bg-gradient-to-r from-coral-600 to-coral-400 bg-clip-text text-transparent">
                HopeHaven
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              Track your moods, journal your thoughts, and receive personalized
              AI wellness guidance in a safe, supportive environment designed
              just for you.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 text-lg rounded-full transition-all duration-300 hover:scale-105 animate-float"
                onClick={handleSignIn}
              >
                Start Your Journey
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="px-8 py-4 text-lg rounded-full border-2 hover:bg-accent/10 transition-all duration-300 bg-transparent"
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Your Wellness Toolkit
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover powerful tools designed to support your mental health
              journey with compassion and understanding.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="group hover:shadow-xl transition-all duration-500 hover:-translate-y-2 border-0 bg-gradient-to-br from-coral-50 to-coral-100/50 animate-fade-in">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-coral-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 animate-pulse-gentle">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">
                  Mood Tracking
                </h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Monitor your emotional patterns with our intuitive mood
                  tracker. Gain insights into what affects your wellbeing.
                </p>
                <div className="flex justify-center items-center gap-2">
                  <span
                    className={`text-3xl transition-all duration-500 ${moods[currentMood].color}`}
                  >
                    {moods[currentMood].emoji}
                  </span>
                  <span className="text-sm font-medium text-muted-foreground">
                    {moods[currentMood].label}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-500 hover:-translate-y-2 border-0 bg-gradient-to-br from-blue-50 to-blue-100/50 animate-fade-in animation-delay-200">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 animate-float">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">
                  Private Journaling
                </h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Express your thoughts freely in a secure, private space.
                  Reflect, process, and grow through writing.
                </p>
                <div className="bg-white/60 rounded-lg p-4 text-left">
                  <div className="w-full h-2 bg-blue-200 rounded mb-2"></div>
                  <div className="w-3/4 h-2 bg-blue-200 rounded mb-2"></div>
                  <div className="w-1/2 h-2 bg-blue-200 rounded"></div>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-500 hover:-translate-y-2 border-0 bg-gradient-to-br from-purple-50 to-purple-100/50 animate-fade-in animation-delay-400">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 animate-pulse-gentle">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">
                  AI Wellness Guide
                </h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Receive personalized wellness suggestions and insights powered
                  by compassionate AI technology.
                </p>
                <div className="flex items-center justify-center gap-2">
                  <Brain className="w-6 h-6 text-purple-500 animate-pulse-gentle" />
                  <span className="text-sm font-medium text-purple-600">
                    Personalized for you
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-gradient-to-r from-coral-50/50 to-blue-50/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Simple Steps to Better Wellbeing
          </h2>
          <p className="text-xl text-muted-foreground mb-16 max-w-2xl mx-auto">
            Start your mental health journey with these easy steps designed to
            fit seamlessly into your daily routine.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="animate-fade-in">
              <div className="w-20 h-20 bg-coral-500 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold animate-float">
                1
              </div>
              <h3 className="text-xl font-bold text-foreground mb-4">
                Track Your Mood
              </h3>
              <p className="text-muted-foreground">
                Start each day by checking in with yourself. Log your mood and
                any thoughts you'd like to remember.
              </p>
            </div>

            <div className="animate-fade-in animation-delay-200">
              <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold animate-float animation-delay-200">
                2
              </div>
              <h3 className="text-xl font-bold text-foreground mb-4">
                Journal & Reflect
              </h3>
              <p className="text-muted-foreground">
                Use our guided prompts or free-write in your private journal.
                Express yourself without judgment.
              </p>
            </div>

            <div className="animate-fade-in animation-delay-400">
              <div className="w-20 h-20 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold animate-float animation-delay-400">
                3
              </div>
              <h3 className="text-xl font-bold text-foreground mb-4">
                Get Insights
              </h3>
              <p className="text-muted-foreground">
                Receive personalized wellness suggestions and track your
                progress over time with AI-powered insights.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Transform Your Mental Wellness
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover the positive changes that come from consistent self-care
              and mindful reflection.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="group hover:shadow-lg transition-all duration-500 hover:-translate-y-1 border-0 bg-gradient-to-br from-coral-50 to-coral-100/50 animate-fade-in">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-coral-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white text-xl">📈</span>
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">
                  Better Self-Awareness
                </h3>
                <p className="text-sm text-muted-foreground">
                  Understand your emotional patterns and triggers through
                  consistent tracking.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-500 hover:-translate-y-1 border-0 bg-gradient-to-br from-blue-50 to-blue-100/50 animate-fade-in animation-delay-100">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white text-xl">🧘</span>
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">
                  Reduced Stress
                </h3>
                <p className="text-sm text-muted-foreground">
                  Find calm through guided reflection and personalized wellness
                  practices.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-500 hover:-translate-y-1 border-0 bg-gradient-to-br from-purple-50 to-purple-100/50 animate-fade-in animation-delay-200">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white text-xl">💡</span>
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">
                  Clear Insights
                </h3>
                <p className="text-sm text-muted-foreground">
                  Gain meaningful understanding of your mental health journey
                  over time.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-500 hover:-translate-y-1 border-0 bg-gradient-to-br from-orange-50 to-orange-100/50 animate-fade-in animation-delay-300">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white text-xl">🌱</span>
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">
                  Personal Growth
                </h3>
                <p className="text-sm text-muted-foreground">
                  Develop healthy habits and coping strategies that support your
                  wellbeing.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-gradient-to-br from-slate-50 to-blue-50/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Why HopeHaven?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              We believe everyone deserves access to tools that support their
              mental wellness journey. Our platform combines technology with
              compassion to create a safe space for growth.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-coral-500 rounded-full flex items-center justify-center flex-shrink-0 animate-pulse-gentle">
                    <Heart className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground mb-2">
                      Compassionate Design
                    </h3>
                    <p className="text-muted-foreground">
                      Every feature is crafted with empathy and understanding of
                      mental health challenges.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 animate-pulse-gentle">
                    <Brain className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground mb-2">
                      Science-Backed
                    </h3>
                    <p className="text-muted-foreground">
                      Our AI suggestions are based on proven therapeutic
                      techniques and wellness research.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 animate-pulse-gentle">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground mb-2">
                      Personalized Experience
                    </h3>
                    <p className="text-muted-foreground">
                      Your journey is unique, and our platform adapts to your
                      individual needs and preferences.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="animate-fade-in animation-delay-200">
              <Card className="border-0 bg-gradient-to-br from-coral-100 to-blue-100 p-8">
                <CardContent className="p-0">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-coral-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-float">
                      <Heart className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground mb-4">
                      Our Mission
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      To make mental wellness accessible, approachable, and
                      empowering for everyone. We're here to support you in
                      building a healthier relationship with your thoughts and
                      emotions.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-gradient-to-br from-coral-600 to-coral-500 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Begin Your Journey?
            </h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto leading-relaxed">
              Join thousands who have found peace, clarity, and growth through
              HopeHaven. Your mental wellness matters, and we're here to support
              you every step of the way.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                size="lg"
                variant="secondary"
                className="bg-white text-coral-600 hover:bg-white/90 px-8 py-4 text-lg rounded-full transition-all duration-300 hover:scale-105 animate-pulse-gentle"
                onClick={handleSignIn}
              >
                Start Free Today
                <Heart className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-12 px-4 bg-slate-50">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Heart className="w-8 h-8 text-coral-500 animate-pulse-gentle" />
            <span className="text-2xl font-bold text-foreground">
              HopeHaven
            </span>
          </div>
          <p className="text-muted-foreground mb-4">
            Supporting your mental wellness journey with compassion and
            understanding.
          </p>
          <p className="text-sm text-muted-foreground">
            © 2024 HopeHaven. Made with care for your wellbeing.
          </p>
        </div>
      </footer>
    </div>
  );
}
