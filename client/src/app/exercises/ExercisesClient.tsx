// "use client";

// import { useState, useEffect } from "react";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent } from "@/components/ui/card";
// import { ArrowLeft, Play, Pause } from "lucide-react";
// import { useRouter } from "next/navigation";

// type ExerciseType = "box-breathing" | "4-7-8" | "deep-breathing" | null;

// interface BreathingExercise {
//   id: ExerciseType;
//   title: string;
//   description: string;
//   duration: number;
//   cycles: number;
//   steps: {
//     action: string;
//     duration: number;
//     label: string;
//   }[];
//   color: string;
// }

// export default function CalmPage() {
//   const router = useRouter();
//   const [selectedExercise, setSelectedExercise] = useState<ExerciseType>(null);
//   const [feedback, setFeedback] = useState<"positive" | "negative" | null>(null)
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [currentStep, setCurrentStep] = useState(0);
//   const [cycleCount, setCycleCount] = useState(0);
//   const [timeLeft, setTimeLeft] = useState(0);

//   useEffect(() => {
//     if (!isPlaying || !currentExercise) return;

//     let step = currentStep;
//     let cycle = cycleCount;
//     let time = currentExercise.steps[step].duration;

//     setTimeLeft(time);

//     const interval = setInterval(() => {
//       time--;

//       if (time > 0) {
//         setTimeLeft(time);
//       } else {
//         step++;

//         if (step >= currentExercise.steps.length) {
//           step = 0;
//           cycle++;

//           if (cycle >= currentExercise.cycles) {
//             clearInterval(interval);
//             setIsPlaying(false);
//             return;
//           }

//           setCycleCount(cycle);
//         }

//         time = currentExercise.steps[step].duration;
//         setCurrentStep(step);
//         setTimeLeft(time);
//       }
//     }, 1000);

//     return () => clearInterval(interval);
//   }, [isPlaying]);

// const handleFeedback = (type: "positive" | "negative") => {
//   setFeedback(type)

//   setTimeout(() => {
//     // Reset everything & go back
//     setSelectedExercise(null)
//     setIsPlaying(false)
//     setCycleCount(0)
//     setCurrentStep(0)
//     setTimeLeft(0)
//     setFeedback(null)
//   }, 2500)
// }

//   const exercises: BreathingExercise[] = [
//     {
//       id: "box-breathing",
//       title: "Box Breathing",
//       description:
//         "A calming technique used by athletes and military personnel",
//       duration: 4,
//       cycles: 4,
//       steps: [
//         { action: "Inhale", duration: 4, label: "In" },
//         { action: "Hold", duration: 4, label: "Hold" },
//         { action: "Exhale", duration: 4, label: "Out" },
//         { action: "Hold", duration: 4, label: "Wait" },
//       ],
//       color: "from-coral-500 to-pink-500",
//     },
//     {
//       id: "4-7-8",
//       title: "4-7-8 Technique",
//       description:
//         "A powerful relaxation method that calms your nervous system",
//       duration: 19,
//       cycles: 4,
//       steps: [
//         { action: "Inhale", duration: 4, label: "In" },
//         { action: "Hold", duration: 7, label: "Hold" },
//         { action: "Exhale", duration: 8, label: "Out" },
//       ],
//       color: "from-purple-500 to-fuchsia-500",
//     },
//     {
//       id: "deep-breathing",
//       title: "Deep Breathing",
//       description: "Simple yet effective for immediate stress relief",
//       duration: 6,
//       cycles: 5,
//       steps: [
//         { action: "Inhale deeply", duration: 3, label: "In" },
//         { action: "Hold", duration: 1, label: "Hold" },
//         { action: "Exhale slowly", duration: 2, label: "Out" },
//       ],
//       color: "from-blue-500 to-cyan-500",
//     },
//   ];

//   const currentExercise = exercises.find((e) => e.id === selectedExercise);

//   return (
//     <div className="min-h-screen bg-linear-to-br from-coral-50 via-purple-50 to-blue-50 relative overflow-hidden">
//       <div className="fixed inset-0 pointer-events-none overflow-hidden">
//         <div className="absolute top-20 left-10 w-72 h-72 bg-coral-500/10 rounded-full blur-3xl animate-float" />
//         <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-float animation-delay-200" />
//         <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-float animation-delay-300" />
//       </div>

//       <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-white/20 shadow-sm">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center">
//           <Button
//             variant="ghost"
//             size="sm"
//             onClick={() => router.push("/home")}
//             className="flex items-center gap-2 text-slate-600 hover:text-slate-900 rounded-full px-3 py-2"
//           >
//             <ArrowLeft className="w-5 h-5" />
//             Back
//           </Button>
//           <h1 className="flex-1 text-center text-2xl font-bold bg-gradient-to-r from-coral-500 via-orange-500 to-purple-500 bg-clip-text text-transparent">
//             Breathing Exercises
//           </h1>
//           <div className="w-16" />
//         </div>
//       </header>

//       {!selectedExercise ? (
//         <section className="py-20 px-4 sm:px-6 relative">
//           <div className="max-w-6xl mx-auto">
//             <div className="text-center mb-16">
//               <div className="relative inline-block mb-8">
//                 <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full blur-2xl opacity-30 animate-pulse-gentle" />
//                 <div className="relative text-8xl animate-float">🧘</div>
//               </div>

//               <h2 className="text-5xl sm:text-6xl font-bold mb-6">
//                 <span className="block text-slate-900 mb-2">Take a Moment</span>
//                 <span className="bg-gradient-to-r from-coral-500 to-purple-500 bg-clip-text text-transparent">
//                   for Yourself
//                 </span>
//               </h2>
//               <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
//                 Choose a breathing exercise that resonates with you. Each
//                 technique is designed to calm your mind and reduce stress.
//               </p>
//             </div>

//             <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
//               {exercises.map((exercise) => (
//                 <Card
//                   key={exercise.id}
//                   className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-0 bg-white/80 backdrop-blur-xl cursor-pointer overflow-hidden relative"
//                   onClick={() => {
//                     setSelectedExercise(exercise.id);
//                     setCurrentStep(0);
//                     setCycleCount(0);
//                     setTimeLeft(exercise.steps[0].duration);
//                   }}
//                 >
//                   <div
//                     className={`absolute inset-0 bg-gradient-to-br ${exercise.color}/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
//                   />

//                   <CardContent className="p-8 relative z-10">
//                     <div className="mb-6">
//                       <div
//                         className={`w-16 h-16 bg-gradient-to-br ${exercise.color} rounded-2xl flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform duration-500 shadow-lg`}
//                       >
//                         {exercise.id === "box-breathing" && "📦"}
//                         {exercise.id === "4-7-8" && "🔢"}
//                         {exercise.id === "deep-breathing" && "🌬️"}
//                       </div>
//                     </div>

//                     <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-blue-600 group-hover:to-cyan-600 transition-all duration-300">
//                       {exercise.title}
//                     </h3>
//                     <p className="text-slate-600 leading-relaxed mb-6">
//                       {exercise.description}
//                     </p>

//                     <div className="flex items-center justify-between pt-4 border-t border-slate-200">
//                       <div className="text-sm text-slate-500">
//                         <span className="font-semibold text-slate-700">
//                           {exercise.cycles}
//                         </span>{" "}
//                         cycles
//                       </div>
//                       <div className="text-sm text-slate-500">
//                         <span className="font-semibold text-slate-700">
//                           {exercise.duration * exercise.cycles}
//                         </span>{" "}
//                         sec
//                       </div>
//                     </div>
//                   </CardContent>
//                 </Card>
//               ))}
//             </div>

//             <Card className="mt-12 border-0 bg-gradient-to-br from-coral-50 to-purple-50 shadow-lg">
//               <CardContent className="p-8 sm:p-12 text-center">
//                 <h3 className="text-2xl font-bold text-slate-900 mb-4">
//                   Tips for Effective Breathing
//                 </h3>
//                 <div className="grid md:grid-cols-3 gap-8 text-left max-w-4xl mx-auto">
//                   <div>
//                     <div className="text-3xl mb-3">💺</div>
//                     <h4 className="font-semibold text-slate-900 mb-2">
//                       Sit Comfortably
//                     </h4>
//                     <p className="text-slate-600">
//                       Find a comfortable position where your spine is straight
//                       and you won't be disturbed.
//                     </p>
//                   </div>
//                   <div>
//                     <div className="text-3xl mb-3">👃</div>
//                     <h4 className="font-semibold text-slate-900 mb-2">
//                       Breathe Naturally
//                     </h4>
//                     <p className="text-slate-600">
//                       Don't force your breathing. Let it flow at a comfortable
//                       pace throughout the exercise.
//                     </p>
//                   </div>
//                   <div>
//                     <div className="text-3xl mb-3">🎯</div>
//                     <h4 className="font-semibold text-slate-900 mb-2">
//                       Stay Focused
//                     </h4>
//                     <p className="text-slate-600">
//                       Keep your attention on the breath and the moment. Let
//                       thoughts pass without judgment.
//                     </p>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           </div>
//         </section>
//       ) : (
//         <section className="py-20 px-4 sm:px-6 relative flex items-center justify-center min-h-[calc(100vh-80px)]">
//           <div className="max-w-2xl mx-auto w-full">
//             <Card className="border-0 bg-white/80 backdrop-blur-xl shadow-2xl overflow-hidden relative">
//               <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-cyan-500/5 to-teal-500/5" />

//               <CardContent className="p-8 sm:p-16 text-center relative z-10">
//                 <Button
//                   variant="ghost"
//                   size="sm"
//                   onClick={() => {
//                     setSelectedExercise(null);
//                     setIsPlaying(false);
//                     setCycleCount(0);
//                     setCurrentStep(0);
//                   }}
//                   className="absolute top-4 left-4 text-slate-600 hover:text-slate-900"
//                 >
//                   ← Change
//                 </Button>

//                 <h2 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
//                   {currentExercise?.title}
//                 </h2>
//                 <p className="text-slate-600 mb-12">
//                   {currentExercise?.description}
//                 </p>

//                 <div className="flex justify-center gap-8 mb-16">
//                   <div className="text-center">
//                     <div className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
//                       {cycleCount + 1}
//                     </div>
//                     <p className="text-sm text-slate-600">Cycle</p>
//                   </div>
//                   <div className="text-center">
//                     <div className="text-5xl font-bold text-slate-900 mb-2">
//                       {currentExercise?.cycles}
//                     </div>
//                     <p className="text-sm text-slate-600">Total</p>
//                   </div>
//                 </div>

//                 <div className="relative w-48 h-48 mx-auto mb-12 flex items-center justify-center">
//                   <div
//                     className={`absolute inset-0 bg-gradient-to-br ${currentExercise?.color} rounded-full opacity-20 animate-pulse-gentle`}
//                   />
//                   <div className="relative text-center">
//                     <div className="text-6xl font-bold text-slate-900 mb-2">
//                       {timeLeft}
//                     </div>
//                     <p className="text-lg text-slate-600">
//                       {currentExercise?.steps[currentStep]?.action}
//                     </p>
//                   </div>
//                 </div>

//                 <div className="mb-12">
//                   <div className="flex justify-between text-sm text-slate-600 mb-2">
//                     <span>
//                       Step {currentStep + 1} of {currentExercise?.steps.length}
//                     </span>
//                   </div>
//                   <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
//                     <div
//                       className={`h-full bg-gradient-to-r ${currentExercise?.color} transition-all duration-1000`}
//                       style={{
//                         width: `${((currentStep + 1) / (currentExercise?.steps.length || 1)) * 100}%`,
//                       }}
//                     />
//                   </div>
//                 </div>

//                 <Button
//                   size="lg"
//                   className={`relative bg-gradient-to-r ${currentExercise?.color} text-white px-12 py-6 text-lg rounded-full transition-all duration-300 hover:scale-105 shadow-lg overflow-hidden group`}
//                   onClick={() => setIsPlaying(!isPlaying)}
//                 >
//                   <span className="relative z-10 flex items-center gap-2">
//                     {isPlaying ? (
//                       <>
//                         <Pause className="w-6 h-6" />
//                         Pause
//                       </>
//                     ) : (
//                       <>
//                         <Play className="w-6 h-6" />
//                         Start Breathing
//                       </>
//                     )}
//                   </span>
//                 </Button>

//                 {cycleCount === (currentExercise?.cycles || 0) - 1 &&
//  currentStep === (currentExercise?.steps.length || 0) - 1 && (
//   <div className="mt-12 p-6 bg-gradient-to-br from-coral-50 to-purple-50 border-coral-200 rounded-2xl border border-green-200">

//     {!feedback ? (
//       <>
//         <p className="text-lg font-semibold text-coral-700 mb-6">
//           ✨ You made it through — take a moment… how are you feeling now?
//         </p>

//         <div className="flex gap-4 justify-center">
//           <Button
//             className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-full"
//             onClick={() => handleFeedback("positive")}
//           >
//             😊 I feel better
//           </Button>

//           <Button
//             variant="outline"
//             className="border-red-300 text-red-600 hover:bg-red-50 px-6 py-3 rounded-full"
//             onClick={() => handleFeedback("negative")}
//           >
//             😕 Not helpful
//           </Button>
//         </div>
//       </>
//     ) : (
//       <p className="text-lg font-semibold text-slate-800">
//         {feedback === "positive"
//           ? "🌿 That’s great to hear. Your mind and body needed that pause."
//           : "🙏 Thanks for sharing. We’re constantly improving to support you better."}
//       </p>
//     )}

//   </div>
// )}
//               </CardContent>
//             </Card>
//           </div>
//         </section>
//       )}
//     </div>
//   );
// }

"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Play, Pause, Clock, Sparkles, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";

type ExerciseType = "box-breathing" | "4-7-8" | "deep-breathing" | null;

interface BreathingExercise {
  id: ExerciseType;
  title: string;
  description: string;
  duration: number;
  cycles: number;
  steps: {
    action: string;
    duration: number;
    label: string;
  }[];
  color: string;
}

export default function CalmPage() {
  const router = useRouter();
  const [selectedExercise, setSelectedExercise] = useState<ExerciseType>(null);
  const [feedback, setFeedback] = useState<"positive" | "negative" | null>(null)
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!isPlaying || !currentExercise) return;

    let step = currentStep;
    let cycle = cycleCount;
    let time = currentExercise.steps[step].duration;

    setTimeLeft(time);

    const interval = setInterval(() => {
      time--;

      if (time > 0) {
        setTimeLeft(time);
      } else {
        step++;

        if (step >= currentExercise.steps.length) {
          step = 0;
          cycle++;

          if (cycle >= currentExercise.cycles) {
            clearInterval(interval);
            setIsPlaying(false);
            return;
          }

          setCycleCount(cycle);
        }

        time = currentExercise.steps[step].duration;
        setCurrentStep(step);
        setTimeLeft(time);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying]);

const handleFeedback = (type: "positive" | "negative") => {
  setFeedback(type)

  setTimeout(() => {
    // Reset everything & go back
    setSelectedExercise(null)
    setIsPlaying(false)
    setCycleCount(0)
    setCurrentStep(0)
    setTimeLeft(0)
    setFeedback(null)
  }, 2500)
}

  const exercises: BreathingExercise[] = [
    {
      id: "box-breathing",
      title: "Box Breathing",
      description:
        "A calming technique used by athletes and military personnel",
      duration: 4,
      cycles: 4,
      steps: [
        { action: "Inhale", duration: 4, label: "In" },
        { action: "Hold", duration: 4, label: "Hold" },
        { action: "Exhale", duration: 4, label: "Out" },
        { action: "Hold", duration: 4, label: "Wait" },
      ],
      color: "from-coral-500 to-pink-500",
    },
    {
      id: "4-7-8",
      title: "4-7-8 Technique",
      description:
        "A powerful relaxation method that calms your nervous system",
      duration: 19,
      cycles: 4,
      steps: [
        { action: "Inhale", duration: 4, label: "In" },
        { action: "Hold", duration: 7, label: "Hold" },
        { action: "Exhale", duration: 8, label: "Out" },
      ],
      color: "from-purple-500 to-fuchsia-500",
    },
    {
      id: "deep-breathing",
      title: "Deep Breathing",
      description: "Simple yet effective for immediate stress relief",
      duration: 6,
      cycles: 5,
      steps: [
        { action: "Inhale deeply", duration: 3, label: "In" },
        { action: "Hold", duration: 1, label: "Hold" },
        { action: "Exhale slowly", duration: 2, label: "Out" },
      ],
      color: "from-blue-500 to-cyan-500",
    },
  ];

  const currentExercise = exercises.find((e) => e.id === selectedExercise);

  return (
    <div className="min-h-screen bg-linear-to-br from-coral-50 via-purple-50 to-blue-50 relative overflow-hidden">
      <div className="absolute top-20 left-10 w-72 h-72 bg-coral-500/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-float animation-delay-200" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-3xl animate-pulse-gentle" />

      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/home")}
              className="rounded-full hover:bg-coral-100 transition-all duration-300 hover:scale-110"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-linear-to-r from-coral-500 via-orange-500 to-purple-500 bg-clip-text text-transparent">
                Breathing Exercises
              </h1>
              <p className="text-xs text-muted-foreground">
                Calm your mind and reduce stress
              </p>
            </div>
          </div>
        </div>
      </header>

      {!selectedExercise ? (
        <section className="py-8 px-4 sm:px-6 relative">
          <div className="max-w-7xl mx-auto">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {/* Duration Card */}
              <Card className="border-0 bg-linear-to-br from-coral-100/80 via-pink-100/80 to-rose-100/80 backdrop-blur-sm hover:shadow-2xl hover:scale-105 transition-all duration-500 group">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-coral-700/80">
                      Quick Exercise
                    </p>
                    <div className="w-10 h-10 rounded-full bg-linear-to-br from-coral-400 to-pink-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Clock className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <span className="text-4xl font-bold text-coral-600">
                    3-5
                  </span>
                  <p className="text-xs text-coral-600 mt-2 font-medium">
                    Minutes per session
                  </p>
                </CardContent>
              </Card>

              {/* Techniques Card */}
              <Card className="border-0 bg-linear-to-br from-purple-100/80 via-fuchsia-100/80 to-pink-100/80 backdrop-blur-sm hover:shadow-2xl hover:scale-105 transition-all duration-500 animation-delay-100 group">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-purple-700/80">
                      Techniques
                    </p>
                    <div className="w-10 h-10 rounded-full bg-linear-to-br from-purple-400 to-pink-500 flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <span className="text-4xl font-bold text-purple-600">
                    3
                  </span>
                  <p className="text-xs text-purple-600 mt-2 font-medium">
                    Different methods
                  </p>
                </CardContent>
              </Card>

              {/* Benefits Card */}
              <Card className="border-0 bg-linear-to-br from-blue-100/80 via-cyan-100/80 to-sky-100/80 backdrop-blur-sm hover:shadow-2xl hover:scale-105 transition-all duration-500 animation-delay-200 group">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-blue-700/80">
                      Benefits
                    </p>
                    <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-400 to-cyan-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <span className="text-4xl font-bold text-blue-600">
                    ∞
                  </span>
                  <p className="text-xs text-blue-600 mt-2 font-medium">
                    Stress relief anytime
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="text-center mb-12">
              <div className="relative inline-block mb-8">
                <div className="absolute inset-0 bg-gradient-to-r from-coral-500 to-purple-500 rounded-full blur-2xl opacity-20 animate-pulse-gentle" />
                <div className="relative text-6xl animate-float">🧘</div>
              </div>

              <h2 className="text-4xl sm:text-5xl font-bold mb-4">
                <span className="block text-slate-900 mb-2">Choose Your</span>
                <span className="bg-gradient-to-r from-coral-500 to-purple-500 bg-clip-text text-transparent">
                  Perfect Moment
                </span>
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
                Each breathing technique is scientifically designed to calm your nervous system and bring clarity to your mind.
              </p>
            </div>

            {/* Exercise Cards */}
            <div className="grid md:grid-cols-3 gap-6 lg:gap-8 mb-12">
              {exercises.map((exercise, index) => (
                <Card
                  key={exercise.id}
                  className="group hover:shadow-2xl hover:scale-105 transition-all duration-500 border-0 bg-white/80 backdrop-blur-xl cursor-pointer overflow-hidden relative animation-delay-100 hover:-translate-y-1"
                  onClick={() => {
                    setSelectedExercise(exercise.id);
                    setCurrentStep(0);
                    setCycleCount(0);
                    setTimeLeft(exercise.steps[0].duration);
                  }}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${exercise.color}/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                  />

                  <CardContent className="p-8 relative z-10">
                    <div className="mb-6">
                      <div
                        className={`w-16 h-16 bg-gradient-to-br ${exercise.color} rounded-2xl flex items-center justify-center text-3xl mb-4 group-hover:scale-125 transition-transform duration-500 shadow-lg`}
                      >
                        {exercise.id === "box-breathing" && "📦"}
                        {exercise.id === "4-7-8" && "🔢"}
                        {exercise.id === "deep-breathing" && "🌬️"}
                      </div>
                    </div>

                    <h3 className="text-2xl font-bold text-slate-900 mb-3">
                      {exercise.title}
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed mb-6">
                      {exercise.description}
                    </p>

                    <div className="space-y-3 pt-4 border-t border-slate-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">Duration:</span>
                        <span className="font-semibold text-slate-900">
                          {exercise.duration * exercise.cycles}s
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">Cycles:</span>
                        <span className="font-semibold text-slate-900">
                          {exercise.cycles}
                        </span>
                      </div>
                    </div>

                    <Button className={`w-full mt-4 bg-gradient-to-r ${exercise.color} text-white hover:opacity-90 transition-all rounded-lg`}>
                      Start Now
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Tips Section */}
            <Card className="border-0 bg-linear-to-br from-coral-50 to-purple-50 shadow-lg">
              <CardContent className="p-8 sm:p-12">
                <h3 className="text-2xl font-bold text-slate-900 mb-8 text-center">
                  Tips for Success
                </h3>
                <div className="grid md:grid-cols-3 gap-8">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-linear-to-br from-coral-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-xl">💺</span>
                    </div>
                    <h4 className="font-semibold text-slate-900 mb-2">
                      Sit Comfortably
                    </h4>
                    <p className="text-slate-600 text-sm">
                      Find a comfortable position where your spine is straight
                      and you won&apos;t be disturbed.
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-linear-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-xl">👃</span>
                    </div>
                    <h4 className="font-semibold text-slate-900 mb-2">
                      Breathe Naturally
                    </h4>
                    <p className="text-slate-600 text-sm">
                      Don&apos;t force your breathing. Let it flow at a comfortable
                      pace throughout the exercise.
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-linear-to-br from-blue-400 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-xl">🎯</span>
                    </div>
                    <h4 className="font-semibold text-slate-900 mb-2">
                      Stay Focused
                    </h4>
                    <p className="text-slate-600 text-sm">
                      Keep your attention on the breath and the moment. Let
                      thoughts pass without judgment.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      ) : (
        <section className="py-20 px-4 sm:px-6 relative flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="max-w-2xl mx-auto w-full">
            <Card className="border-0 bg-white/80 backdrop-blur-xl shadow-2xl overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-cyan-500/5 to-teal-500/5" />

              <CardContent className="p-8 sm:p-16 text-center relative z-10">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedExercise(null);
                    setIsPlaying(false);
                    setCycleCount(0);
                    setCurrentStep(0);
                  }}
                  className="absolute top-4 left-4 text-slate-600 hover:text-slate-900"
                >
                  ← Change
                </Button>

                <h2 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  {currentExercise?.title}
                </h2>
                <p className="text-slate-600 mb-12">
                  {currentExercise?.description}
                </p>

                <div className="flex justify-center gap-8 mb-16">
                  <div className="text-center">
                    <div className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
                      {cycleCount + 1}
                    </div>
                    <p className="text-sm text-slate-600">Cycle</p>
                  </div>
                  <div className="text-center">
                    <div className="text-5xl font-bold text-slate-900 mb-2">
                      {currentExercise?.cycles}
                    </div>
                    <p className="text-sm text-slate-600">Total</p>
                  </div>
                </div>

                <div className="relative w-48 h-48 mx-auto mb-12 flex items-center justify-center">
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${currentExercise?.color} rounded-full opacity-20 animate-pulse-gentle`}
                  />
                  <div className="relative text-center">
                    <div className="text-6xl font-bold text-slate-900 mb-2">
                      {timeLeft}
                    </div>
                    <p className="text-lg text-slate-600">
                      {currentExercise?.steps[currentStep]?.action}
                    </p>
                  </div>
                </div>

                <div className="mb-12">
                  <div className="flex justify-between text-sm text-slate-600 mb-2">
                    <span>
                      Step {currentStep + 1} of {currentExercise?.steps.length}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${currentExercise?.color} transition-all duration-1000`}
                      style={{
                        width: `${((currentStep + 1) / (currentExercise?.steps.length || 1)) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                <Button
                  size="lg"
                  className={`relative bg-gradient-to-r ${currentExercise?.color} text-white px-12 py-6 text-lg rounded-full transition-all duration-300 hover:scale-105 shadow-lg overflow-hidden group`}
                  onClick={() => setIsPlaying(!isPlaying)}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    {isPlaying ? (
                      <>
                        <Pause className="w-6 h-6" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="w-6 h-6" />
                        Start Breathing
                      </>
                    )}
                  </span>
                </Button>

                {cycleCount === (currentExercise?.cycles || 0) - 1 &&
 currentStep === (currentExercise?.steps.length || 0) - 1 && (
  <div className="mt-12 p-6 bg-gradient-to-br from-coral-50 to-purple-50 border-coral-200 rounded-2xl border border-green-200">

    {!feedback ? (
      <>
        <p className="text-lg font-semibold text-coral-700 mb-6">
          ✨ You made it through — take a moment… how are you feeling now?
        </p>

        <div className="flex gap-4 justify-center">
          <Button
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-full"
            onClick={() => handleFeedback("positive")}
          >
            😊 I feel better
          </Button>

          <Button
            variant="outline"
            className="border-red-300 text-red-600 hover:bg-red-50 px-6 py-3 rounded-full"
            onClick={() => handleFeedback("negative")}
          >
            😕 Not helpful
          </Button>
        </div>
      </>
    ) : (
      <p className="text-lg font-semibold text-slate-800">
        {feedback === "positive"
          ? "🌿 That’s great to hear. Your mind and body needed that pause."
          : "🙏 Thanks for sharing. We’re constantly improving to support you better."}
      </p>
    )}

  </div>
)}
              </CardContent>
            </Card>
          </div>
        </section>
      )}
    </div>
  );
}
