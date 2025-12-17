// "use client"

// import type React from "react"

// import { useState, useEffect, useRef } from "react"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import {
//   BookOpen,
//   ArrowLeft,
//   CheckCircle,
//   Trash2,
//   Calendar,
//   Pencil,
//   X,
//   Check,
//   Sparkles,
//   TrendingUp,
//   FileText,
//   Clock,
//   Upload,
// } from "lucide-react"
// import { getAuth, onAuthStateChanged } from "firebase/auth"
// import axios from "axios"
// import { app } from "@/lib/firebase"
// import { useRouter } from "next/navigation"
// import { getOrCreateUserKey, encryptJSON, decryptJSON, imageToBase64 } from "@/lib/crypto"

// interface JournalEntry {
//   id: number
//   userId: string
//   cipherText: string
//   iv: string
//   createdAt: string
//   content?: {
//     text: string
//     images: string[]
//   }
// }

// export default function JournalPage() {
//   const [user, setUser] = useState<any>(null)
//   const [loading, setLoading] = useState(true)
//   const [submitting, setSubmitting] = useState(false)
//   const [submitted, setSubmitted] = useState(false)
//   const [entryContent, setEntryContent] = useState("")
//   const [selectedImages, setSelectedImages] = useState<string[]>([])
//   const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([])
//   const [isVisible, setIsVisible] = useState(false)
//   const [deletingId, setDeletingId] = useState<number | null>(null)
//   const [editingId, setEditingId] = useState<number | null>(null)
//   const [editContent, setEditContent] = useState("")
//   const [editImages, setEditImages] = useState<string[]>([])
//   const [updatingId, setUpdatingId] = useState<number | null>(null)
//   const fileInputRef = useRef<HTMLInputElement>(null)
//   const editFileInputRef = useRef<HTMLInputElement>(null)
//   const auth = getAuth(app)
//   const router = useRouter()

//   useEffect(() => {
//     setIsVisible(true)

//     const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
//       if (authUser) {
//         setUser(authUser)
//         await fetchJournalEntries(authUser)
//       } else {
//         router.push("/")
//       }
//       setLoading(false)
//     })

//     return () => unsubscribe()
//   }, [auth, router])

//   const fetchJournalEntries = async (authUser: any) => {
//     try {
//       const token = await authUser.getIdToken()
//       const key = await getOrCreateUserKey(authUser.uid)

//       const response = await axios.get("http://localhost:8080/api/journal/all-encrypted", {
//         headers: { Authorization: `Bearer ${token}` },
//       })

//       const entries: JournalEntry[] = response.data

//       for (const e of entries) {
//         try {
//           const decrypted = await decryptJSON(e.cipherText, e.iv, key)
//           // Handle both old format (string) and new format (object with text and images)
//           if (typeof decrypted === "string") {
//             e.content = { text: decrypted, images: [] }
//           } else {
//             e.content = decrypted
//           }
//         } catch {
//           e.content = { text: "[Decryption failed on this device]", images: [] }
//         }
//       }

//       setJournalEntries(entries)
//     } catch (error) {
//       console.error("Error fetching journal entries:", error)
//     }
//   }

//   const handleSaveEntry = async () => {
//     if (!entryContent.trim() || !user) return

//     setSubmitting(true)
//     try {
//       const token = await user.getIdToken()
//       const key = await getOrCreateUserKey(user.uid)

//       // Prepare data with text and images
//       const journalData = {
//         text: entryContent,
//         images: selectedImages,
//       }

//       const { cipherTextB64, ivB64 } = await encryptJSON(journalData, key)

//       await axios.post(
//         "http://localhost:8080/api/journal/add-encrypted",
//         { cipherText: cipherTextB64, iv: ivB64 },
//         { headers: { Authorization: `Bearer ${token}` } },
//       )

//       setSubmitted(true)
//       setEntryContent("")
//       setSelectedImages([])

//       setTimeout(async () => {
//         await fetchJournalEntries(user)
//         setSubmitted(false)
//         setSubmitting(false)
//       }, 1200)
//     } catch (error) {
//       console.error("Error saving journal entry:", error)
//       setSubmitting(false)
//     }
//   }

//   const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
//     const files = event.target.files
//     if (!files) return

//     const imagePromises = Array.from(files).map(async (file) => {
//       if (file.type.startsWith("image/")) {
//         return await imageToBase64(file)
//       }
//       return null
//     })

//     const images = await Promise.all(imagePromises)
//     const validImages = images.filter((img): img is string => img !== null)
//     setSelectedImages((prev) => [...prev, ...validImages])
//   }

//   const handleEditImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
//     const files = event.target.files
//     if (!files) return

//     const imagePromises = Array.from(files).map(async (file) => {
//       if (file.type.startsWith("image/")) {
//         return await imageToBase64(file)
//       }
//       return null
//     })

//     const images = await Promise.all(imagePromises)
//     const validImages = images.filter((img): img is string => img !== null)
//     setEditImages((prev) => [...prev, ...validImages])
//   }

//   const removeImage = (index: number) => {
//     setSelectedImages((prev) => prev.filter((_, i) => i !== index))
//   }

//   const removeEditImage = (index: number) => {
//     setEditImages((prev) => prev.filter((_, i) => i !== index))
//   }

//   const handleStartEdit = (entry: JournalEntry) => {
//     setEditingId(entry.id)
//     setEditContent(entry.content?.text || "")
//     setEditImages(entry.content?.images || [])
//   }

//   const handleCancelEdit = () => {
//     setEditingId(null)
//     setEditContent("")
//     setEditImages([])
//   }

//   const handleSaveEdit = async (entryId: number) => {
//     if (!editContent.trim() || !user) return

//     setUpdatingId(entryId)
//     try {
//       const token = await user.getIdToken()
//       const key = await getOrCreateUserKey(user.uid)

//       const journalData = {
//         text: editContent,
//         images: editImages,
//       }

//       const { cipherTextB64, ivB64 } = await encryptJSON(journalData, key)

//       await axios.put(
//         `http://localhost:8080/api/journal/update/${entryId}`,
//         { cipherText: cipherTextB64, iv: ivB64 },
//         { headers: { Authorization: `Bearer ${token}` } },
//       )

//       setEditingId(null)
//       setEditContent("")
//       setEditImages([])
//       await fetchJournalEntries(user)
//     } catch (error) {
//       console.error("Error updating journal entry:", error)
//     } finally {
//       setUpdatingId(null)
//     }
//   }

//   const handleDeleteEntry = async (entryId: number) => {
//     if (!user) return

//     setDeletingId(entryId)
//     try {
//       const token = await user.getIdToken()
//       await axios.delete(`http://localhost:8080/api/journal/${entryId}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       })

//       await fetchJournalEntries(user)
//     } catch (error) {
//       console.error("Error deleting journal entry:", error)
//     } finally {
//       setDeletingId(null)
//     }
//   }

//   const getTotalWords = () => {
//     return journalEntries.reduce((total, entry) => {
//       return total + (entry.content?.text.split(/\s+/).length || 0)
//     }, 0)
//   }

//   const getThisWeekCount = () => {
//     const oneWeekAgo = new Date()
//     oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
//     return journalEntries.filter((entry) => new Date(entry.createdAt + "Z") > oneWeekAgo).length
//   }

//   const getAverageLength = () => {
//     if (journalEntries.length === 0) return 0
//     return Math.round(getTotalWords() / journalEntries.length)
//   }

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-coral-50 via-purple-50 to-blue-50 flex items-center justify-center">
//         <div className="animate-pulse">
//           <BookOpen className="w-12 h-12 text-coral-500 animate-float" />
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-coral-50 via-purple-50 to-blue-50 relative overflow-hidden">
//       <div className="absolute top-20 left-10 w-72 h-72 bg-coral-500/10 rounded-full blur-3xl animate-float" />
//       <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-float animation-delay-200" />
//       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-3xl animate-pulse-gentle" />

//       {/* Header */}
//       <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border/50 shadow-sm">
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
//             <div>
//               <h1 className="text-3xl font-bold bg-gradient-to-r from-coral-500 via-orange-500 to-purple-500 bg-clip-text text-transparent">
//                 My Journal
//               </h1>
//               <p className="text-xs text-muted-foreground">Express your thoughts and feelings</p>
//             </div>
//           </div>
//           <div className="flex items-center gap-2 px-3 py-1 bg-coral-100 rounded-full">
//             <Sparkles className="w-4 h-4 text-coral-500" />
//             <span className="text-sm font-semibold text-coral-600">{journalEntries.length} Entries</span>
//           </div>
//         </div>
//       </header>

//       {/* Main Content */}
//       <section className="py-8 px-4 relative">
//         <div className="max-w-7xl mx-auto">
//           <div
//             className={`transition-all duration-1000 ${isVisible ? "animate-slide-up opacity-100" : "opacity-0"} mb-8`}
//           >
//             <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
//               {/* Total Entries Stat */}
//               <Card className="border-0 bg-gradient-to-br from-coral-100/80 via-pink-100/80 to-rose-100/80 backdrop-blur-sm hover:shadow-2xl hover:scale-105 transition-all duration-500 group">
//                 <CardContent className="p-6">
//                   <div className="flex items-center justify-between mb-2">
//                     <p className="text-sm font-semibold text-coral-700/80">Total Entries</p>
//                     <div className="w-10 h-10 rounded-full bg-gradient-to-br from-coral-400 to-pink-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
//                       <BookOpen className="w-5 h-5 text-white" />
//                     </div>
//                   </div>
//                   <span className="text-5xl font-bold text-coral-600">{journalEntries.length}</span>
//                   <p className="text-xs text-coral-600 mt-2 font-medium">Reflections captured</p>
//                 </CardContent>
//               </Card>

//               {/* This Week Stat */}
//               <Card className="border-0 bg-gradient-to-br from-blue-100/80 via-cyan-100/80 to-sky-100/80 backdrop-blur-sm hover:shadow-2xl hover:scale-105 transition-all duration-500 animation-delay-100 group">
//                 <CardContent className="p-6">
//                   <div className="flex items-center justify-between mb-2">
//                     <p className="text-sm font-semibold text-blue-700/80">This Week</p>
//                     <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
//                       <TrendingUp className="w-5 h-5 text-white" />
//                     </div>
//                   </div>
//                   <span className="text-5xl font-bold text-blue-600">{getThisWeekCount()}</span>
//                   <p className="text-xs text-blue-600 mt-2 font-medium">Recent entries</p>
//                 </CardContent>
//               </Card>

//               {/* Total Words Stat */}
//               <Card className="border-0 bg-gradient-to-br from-purple-100/80 via-violet-100/80 to-fuchsia-100/80 backdrop-blur-sm hover:shadow-2xl hover:scale-105 transition-all duration-500 animation-delay-200 group">
//                 <CardContent className="p-6">
//                   <div className="flex items-center justify-between mb-2">
//                     <p className="text-sm font-semibold text-purple-700/80">Total Words</p>
//                     <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-fuchsia-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
//                       <FileText className="w-5 h-5 text-white" />
//                     </div>
//                   </div>
//                   <span className="text-5xl font-bold text-purple-600">{getTotalWords()}</span>
//                   <p className="text-xs text-purple-600 mt-2 font-medium">Words written</p>
//                 </CardContent>
//               </Card>

//               {/* Average Length Stat */}
//               <Card className="border-0 bg-gradient-to-br from-yellow-100/80 via-orange-100/80 to-amber-100/80 backdrop-blur-sm hover:shadow-2xl hover:scale-105 transition-all duration-500 animation-delay-300 group">
//                 <CardContent className="p-6">
//                   <div className="flex items-center justify-between mb-2">
//                     <p className="text-sm font-semibold text-orange-700/80">Avg Length</p>
//                     <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center group-hover:rotate-6 transition-transform duration-300">
//                       <Clock className="w-5 h-5 text-white" />
//                     </div>
//                   </div>
//                   <span className="text-5xl font-bold text-orange-600">{getAverageLength()}</span>
//                   <p className="text-xs text-orange-600 mt-2 font-medium">Words per entry</p>
//                 </CardContent>
//               </Card>
//             </div>
//           </div>

//           <div className="grid lg:grid-cols-2 gap-8">
//             {/* Left Column - Write Entry Section */}
//             <div className={`transition-all duration-1000 ${isVisible ? "animate-slide-up opacity-100" : "opacity-0"}`}>
//               <Card className="border-0 bg-gradient-to-br from-white via-coral-50/30 to-purple-50/30 backdrop-blur-sm shadow-xl overflow-hidden relative h-fit sticky top-24">
//                 <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-coral-200/30 to-transparent rounded-full blur-3xl" />
//                 <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-purple-200/30 to-transparent rounded-full blur-3xl" />

//                 <CardHeader className="relative">
//                   <CardTitle className="text-2xl flex items-center gap-3">
//                     <div className="p-2 bg-coral-100 rounded-xl">
//                       <BookOpen className="w-6 h-6 text-coral-500" />
//                     </div>
//                     <div>
//                       <span className="bg-gradient-to-r from-coral-500 to-purple-500 bg-clip-text text-transparent">
//                         Write Your Thoughts
//                       </span>
//                       <p className="text-sm text-muted-foreground font-normal mt-1">
//                         Let your feelings flow onto the page
//                       </p>
//                     </div>
//                   </CardTitle>
//                 </CardHeader>
//                 <CardContent className="relative">
//                   {submitted ? (
//                     <div className="flex flex-col items-center justify-center py-12 gap-4 animate-fade-in">
//                       <div className="relative">
//                         <CheckCircle className="w-20 h-20 text-coral-500 animate-float" />
//                         <div className="absolute inset-0 w-20 h-20 bg-coral-500/20 rounded-full animate-ping" />
//                       </div>
//                       <p className="text-2xl font-bold text-foreground">Entry saved!</p>
//                       <p className="text-muted-foreground text-center max-w-md">
//                         Your thoughts have been securely recorded.
//                       </p>
//                     </div>
//                   ) : (
//                     <div className="space-y-4">
//                       <div className="relative">
//                         <textarea
//                           value={entryContent}
//                           onChange={(e) => setEntryContent(e.target.value)}
//                           placeholder="Write your thoughts, feelings, and reflections here... Let it all out, this is your safe space."
//                           className="w-full p-5 rounded-2xl bg-white/90 border-2 border-white/50 focus:border-coral-300 focus:ring-4 focus:ring-coral-100 focus:outline-none resize-none text-foreground placeholder-muted-foreground/60 transition-all duration-300 min-h-[220px] shadow-inner leading-relaxed"
//                         />
//                         <div className="absolute bottom-4 right-4 text-xs text-muted-foreground bg-white/80 px-2 py-1 rounded-lg">
//                           {entryContent.length} characters
//                         </div>
//                       </div>

//                       <div className="space-y-3">
//                         <div className="flex items-center gap-2">
//                           <input
//                             ref={fileInputRef}
//                             type="file"
//                             accept="image/*"
//                             multiple
//                             onChange={handleImageUpload}
//                             className="hidden"
//                           />
//                           <Button
//                             type="button"
//                             variant="outline"
//                             size="sm"
//                             onClick={() => fileInputRef.current?.click()}
//                             className="rounded-xl border-2 hover:bg-coral-50 hover:border-coral-200 transition-all duration-300"
//                           >
//                             <Upload className="w-4 h-4 mr-2" />
//                             Add Images
//                           </Button>
//                           {selectedImages.length > 0 && (
//                             <span className="text-sm text-muted-foreground">
//                               {selectedImages.length} image{selectedImages.length > 1 ? "s" : ""} selected
//                             </span>
//                           )}
//                         </div>

//                         {selectedImages.length > 0 && (
//                           <div className="grid grid-cols-3 gap-2">
//                             {selectedImages.map((img, idx) => (
//                               <div key={idx} className="relative group">
//                                 <img
//                                   src={img || "/placeholder.svg"}
//                                   alt={`Upload ${idx + 1}`}
//                                   className="w-full h-24 object-cover rounded-xl border-2 border-gray-200"
//                                 />
//                                 <button
//                                   onClick={() => removeImage(idx)}
//                                   className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
//                                 >
//                                   <X className="w-4 h-4" />
//                                 </button>
//                               </div>
//                             ))}
//                           </div>
//                         )}
//                       </div>

//                       <div className="flex gap-3">
//                         <Button
//                           onClick={handleSaveEntry}
//                           disabled={!entryContent.trim() || submitting}
//                           size="lg"
//                           className="flex-1 bg-gradient-to-r from-coral-500 to-coral-600 hover:from-coral-600 hover:to-coral-700 text-white py-6 text-lg rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
//                         >
//                           {submitting ? (
//                             <span className="flex items-center gap-2">
//                               <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
//                               Saving...
//                             </span>
//                           ) : (
//                             <span className="flex items-center gap-2">
//                               <BookOpen className="w-5 h-5" />
//                               Save Entry
//                             </span>
//                           )}
//                         </Button>
//                         <Button
//                           onClick={() => {
//                             setEntryContent("")
//                             setSelectedImages([])
//                           }}
//                           variant="outline"
//                           size="lg"
//                           className="rounded-2xl border-2 hover:bg-gray-50 transition-all duration-300 px-8"
//                         >
//                           Clear
//                         </Button>
//                       </div>
//                     </div>
//                   )}
//                 </CardContent>
//               </Card>
//             </div>

//             {/* Right Column - Journal Entries List */}
//             <div className="animate-fade-in animation-delay-100">
//               <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl overflow-hidden">
//                 <CardHeader>
//                   <CardTitle className="flex items-center justify-between">
//                     <div className="flex items-center gap-2">
//                       <div className="p-2 bg-blue-100 rounded-xl">
//                         <Calendar className="w-5 h-5 text-blue-500" />
//                       </div>
//                       <div>
//                         <span className="text-foreground">Your Journal Entries</span>
//                         <p className="text-sm text-muted-foreground font-normal mt-0.5">
//                           {journalEntries.length} {journalEntries.length === 1 ? "entry" : "entries"} recorded
//                         </p>
//                       </div>
//                     </div>
//                   </CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                   {journalEntries.length > 0 ? (
//                     <div className="max-h-[800px] overflow-y-auto space-y-4 pr-2 custom-scrollbar">
//                       {journalEntries.map((entry, index) => (
//                         <div
//                           key={entry.id}
//                           className="group p-6 bg-gradient-to-br from-white to-gray-50/50 rounded-2xl border-2 border-gray-100 hover:border-coral-200 hover:shadow-lg transition-all duration-300 animate-fade-in relative overflow-hidden"
//                           style={{ animationDelay: `${index * 50}ms` }}
//                         >
//                           <div className="absolute inset-0 bg-gradient-to-r from-coral-50/0 via-coral-50/50 to-coral-50/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

//                           <div className="relative">
//                             <div className="flex items-start justify-between mb-4">
//                               <div className="flex-1">
//                                 <div className="flex items-center gap-2 text-sm text-muted-foreground bg-gray-100 px-3 py-1.5 rounded-lg w-fit">
//                                   <Calendar className="w-4 h-4 text-blue-500" />
//                                   {new Date(entry.createdAt + "Z").toLocaleDateString("en-US", {
//                                     weekday: "long",
//                                     year: "numeric",
//                                     month: "long",
//                                     day: "numeric",
//                                     hour: "2-digit",
//                                     minute: "2-digit",
//                                   })}
//                                 </div>
//                               </div>
//                               <div className="flex gap-2">
//                                 {editingId === entry.id ? (
//                                   <>
//                                     <Button
//                                       onClick={() => handleSaveEdit(entry.id)}
//                                       disabled={!editContent.trim() || updatingId === entry.id}
//                                       variant="ghost"
//                                       size="sm"
//                                       className="text-green-600 hover:text-green-700 hover:bg-green-50 rounded-xl transition-all duration-200 hover:scale-110"
//                                     >
//                                       <Check className="w-5 h-5" />
//                                     </Button>
//                                     <Button
//                                       onClick={handleCancelEdit}
//                                       variant="ghost"
//                                       size="sm"
//                                       className="text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:scale-110"
//                                     >
//                                       <X className="w-5 h-5" />
//                                     </Button>
//                                   </>
//                                 ) : (
//                                   <>
//                                     <Button
//                                       onClick={() => handleStartEdit(entry)}
//                                       variant="ghost"
//                                       size="sm"
//                                       className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-all duration-200 hover:scale-110 opacity-0 group-hover:opacity-100"
//                                     >
//                                       <Pencil className="w-5 h-5" />
//                                     </Button>
//                                     <Button
//                                       onClick={() => handleDeleteEntry(entry.id)}
//                                       disabled={deletingId === entry.id}
//                                       variant="ghost"
//                                       size="sm"
//                                       className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all duration-200 hover:scale-110 opacity-0 group-hover:opacity-100"
//                                     >
//                                       {deletingId === entry.id ? (
//                                         <div className="w-5 h-5 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" />
//                                       ) : (
//                                         <Trash2 className="w-5 h-5" />
//                                       )}
//                                     </Button>
//                                   </>
//                                 )}
//                               </div>
//                             </div>

//                             {editingId === entry.id ? (
//                               <div className="space-y-3">
//                                 <div className="relative">
//                                   <textarea
//                                     value={editContent}
//                                     onChange={(e) => setEditContent(e.target.value)}
//                                     className="w-full p-5 rounded-2xl bg-white border-2 border-blue-300 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 focus:outline-none resize-none text-foreground transition-all duration-300 min-h-[180px] shadow-inner leading-relaxed"
//                                     autoFocus
//                                   />
//                                   <div className="absolute bottom-3 right-3 text-xs text-muted-foreground bg-white px-2 py-1 rounded-lg">
//                                     {editContent.length} characters
//                                   </div>
//                                 </div>

//                                 <div className="space-y-2">
//                                   <div className="flex items-center gap-2">
//                                     <input
//                                       ref={editFileInputRef}
//                                       type="file"
//                                       accept="image/*"
//                                       multiple
//                                       onChange={handleEditImageUpload}
//                                       className="hidden"
//                                     />
//                                     <Button
//                                       type="button"
//                                       variant="outline"
//                                       size="sm"
//                                       onClick={() => editFileInputRef.current?.click()}
//                                       className="rounded-xl border-2 hover:bg-blue-50 hover:border-blue-200 transition-all duration-300"
//                                     >
//                                       <Upload className="w-4 h-4 mr-2" />
//                                       Add Images
//                                     </Button>
//                                     {editImages.length > 0 && (
//                                       <span className="text-sm text-muted-foreground">
//                                         {editImages.length} image{editImages.length > 1 ? "s" : ""}
//                                       </span>
//                                     )}
//                                   </div>

//                                   {editImages.length > 0 && (
//                                     <div className="grid grid-cols-3 gap-2">
//                                       {editImages.map((img, idx) => (
//                                         <div key={idx} className="relative group/img">
//                                           <img
//                                             src={img || "/placeholder.svg"}
//                                             alt={`Edit ${idx + 1}`}
//                                             className="w-full h-20 object-cover rounded-xl border-2 border-gray-200"
//                                           />
//                                           <button
//                                             onClick={() => removeEditImage(idx)}
//                                             className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover/img:opacity-100 transition-opacity duration-200 hover:bg-red-600"
//                                           >
//                                             <X className="w-3 h-3" />
//                                           </button>
//                                         </div>
//                                       ))}
//                                     </div>
//                                   )}
//                                 </div>
//                               </div>
//                             ) : (
//                               <div className="mt-3 space-y-4">
//                                 <div className="p-4 bg-white/50 rounded-xl">
//                                   <p className="text-foreground leading-relaxed whitespace-pre-wrap break-words text-[15px]">
//                                     {entry.content?.text}
//                                   </p>
//                                 </div>

//                                 {entry.content?.images && entry.content.images.length > 0 && (
//                                   <div className="grid grid-cols-2 gap-2">
//                                     {entry.content.images.map((img, idx) => (
//                                       <div
//                                         key={idx}
//                                         className="relative group/img overflow-hidden rounded-xl border-2 border-gray-200 hover:border-coral-300 transition-all duration-300"
//                                       >
//                                         <img
//                                           src={img || "/placeholder.svg"}
//                                           alt={`Journal image ${idx + 1}`}
//                                           className="w-full h-48 object-cover group-hover/img:scale-105 transition-transform duration-300"
//                                         />
//                                         <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity duration-300" />
//                                       </div>
//                                     ))}
//                                   </div>
//                                 )}
//                               </div>
//                             )}
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   ) : (
//                     <div className="text-center py-20 text-muted-foreground">
//                       <div className="relative inline-block mb-6">
//                         <BookOpen className="w-16 h-16 mx-auto opacity-20" />
//                         <div className="absolute inset-0 w-16 h-16 bg-coral-500/10 rounded-full blur-xl" />
//                       </div>
//                       <p className="text-xl font-semibold mb-2">No journal entries yet.</p>
//                       <p className="text-sm max-w-md mx-auto">
//                         Start writing above to capture your thoughts and feelings! This is your personal space for
//                         reflection.
//                       </p>
//                     </div>
//                   )}
//                 </CardContent>
//               </Card>
//             </div>
//           </div>
//         </div>
//       </section>
//     </div>
//   )
// }

"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BookOpen,
  ArrowLeft,
  CheckCircle,
  Trash2,
  Calendar,
  Pencil,
  X,
  Check,
  Sparkles,
  TrendingUp,
  FileText,
  Clock,
  Upload,
  Lock,
} from "lucide-react"
import { getAuth, onAuthStateChanged } from "firebase/auth"
import axios from "axios"
import { app } from "@/lib/firebase"
import { useRouter } from "next/navigation"
import { getOrCreateUserKey, encryptJSON, decryptJSON, imageToBase64 } from "@/lib/crypto"

interface JournalEntry {
  id: number
  userId: string
  cipherText: string
  iv: string
  createdAt: string
  content?: {
    text: string
    images: string[]
  }
}

export default function JournalPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [entryContent, setEntryContent] = useState("")
  const [selectedImages, setSelectedImages] = useState<string[]>([])
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([])
  const [isVisible, setIsVisible] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editContent, setEditContent] = useState("")
  const [editImages, setEditImages] = useState<string[]>([])
  const [updatingId, setUpdatingId] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const editFileInputRef = useRef<HTMLInputElement>(null)

  const [isLocked, setIsLocked] = useState(false)
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [passcode, setPasscode] = useState("")
  const [passcodeError, setPasscodeError] = useState("")
  const [verifying, setVerifying] = useState(false)

  const auth = getAuth(app)
  const router = useRouter()

  useEffect(() => {
    setIsVisible(true)

    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        setUser(authUser)
        await checkJournalLock(authUser)
      } else {
        router.push("/")
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [auth, router])

  const checkJournalLock = async (authUser: any) => {
    try {
      const token = await authUser.getIdToken()
      const response = await axios.get("http://localhost:8080/api/journal-lock/status", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.data.enabled) {
        setIsLocked(true)
      } else {
        setIsLocked(false)
        setIsUnlocked(true)
        await fetchJournalEntries(authUser)
      }
    } catch (error) {
      console.error("Error checking journal lock status:", error)
      // If error, assume no lock and proceed
      setIsLocked(false)
      setIsUnlocked(true)
      await fetchJournalEntries(authUser)
    }
  }

  const handleVerifyPasscode = async () => {
    if (!passcode.trim() || !user) return

    setVerifying(true)
    setPasscodeError("")

    try {
      const token = await user.getIdToken()
      const response = await axios.post(
        "http://localhost:8080/api/journal-lock/verify",
        { passcode },
        { headers: { Authorization: `Bearer ${token}` } },
      )

      if (response.data.success) {
        setIsUnlocked(true)
        setIsLocked(false)
        await fetchJournalEntries(user)
      } else {
        setPasscodeError("Incorrect passcode. Please try again.")
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        setPasscodeError("Incorrect passcode. Please try again.")
      } else {
        setPasscodeError("An error occurred. Please try again.")
      }
    } finally {
      setVerifying(false)
      setPasscode("")
    }
  }

  const fetchJournalEntries = async (authUser: any) => {
    try {
      const token = await authUser.getIdToken()
      const key = await getOrCreateUserKey(authUser.uid)

      const response = await axios.get("http://localhost:8080/api/journal/all-encrypted", {
        headers: { Authorization: `Bearer ${token}` },
      })

      const entries: JournalEntry[] = response.data

      for (const e of entries) {
        try {
          const decrypted = await decryptJSON(e.cipherText, e.iv, key)
          // Handle both old format (string) and new format (object with text and images)
          if (typeof decrypted === "string") {
            e.content = { text: decrypted, images: [] }
          } else {
            e.content = decrypted
          }
        } catch {
          e.content = { text: "[Decryption failed on this device]", images: [] }
        }
      }

      setJournalEntries(entries)
    } catch (error) {
      console.error("Error fetching journal entries:", error)
    }
  }

  const handleSaveEntry = async () => {
    if (!entryContent.trim() || !user) return

    setSubmitting(true)
    try {
      const token = await user.getIdToken()
      const key = await getOrCreateUserKey(user.uid)

      // Prepare data with text and images
      const journalData = {
        text: entryContent,
        images: selectedImages,
      }

      const { cipherTextB64, ivB64 } = await encryptJSON(journalData, key)

      await axios.post(
        "http://localhost:8080/api/journal/add-encrypted",
        { cipherText: cipherTextB64, iv: ivB64 },
        { headers: { Authorization: `Bearer ${token}` } },
      )

      setSubmitted(true)
      setEntryContent("")
      setSelectedImages([])

      setTimeout(async () => {
        await fetchJournalEntries(user)
        setSubmitted(false)
        setSubmitting(false)
      }, 1200)
    } catch (error) {
      console.error("Error saving journal entry:", error)
      setSubmitting(false)
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    const imagePromises = Array.from(files).map(async (file) => {
      if (file.type.startsWith("image/")) {
        return await imageToBase64(file)
      }
      return null
    })

    const images = await Promise.all(imagePromises)
    const validImages = images.filter((img): img is string => img !== null)
    setSelectedImages((prev) => [...prev, ...validImages])
  }

  const handleEditImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    const imagePromises = Array.from(files).map(async (file) => {
      if (file.type.startsWith("image/")) {
        return await imageToBase64(file)
      }
      return null
    })

    const images = await Promise.all(imagePromises)
    const validImages = images.filter((img): img is string => img !== null)
    setEditImages((prev) => [...prev, ...validImages])
  }

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index))
  }

  const removeEditImage = (index: number) => {
    setEditImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleStartEdit = (entry: JournalEntry) => {
    setEditingId(entry.id)
    setEditContent(entry.content?.text || "")
    setEditImages(entry.content?.images || [])
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditContent("")
    setEditImages([])
  }

  const handleSaveEdit = async (entryId: number) => {
    if (!editContent.trim() || !user) return

    setUpdatingId(entryId)
    try {
      const token = await user.getIdToken()
      const key = await getOrCreateUserKey(user.uid)

      const journalData = {
        text: editContent,
        images: editImages,
      }

      const { cipherTextB64, ivB64 } = await encryptJSON(journalData, key)

      await axios.put(
        `http://localhost:8080/api/journal/update/${entryId}`,
        { cipherText: cipherTextB64, iv: ivB64 },
        { headers: { Authorization: `Bearer ${token}` } },
      )

      setEditingId(null)
      setEditContent("")
      setEditImages([])
      await fetchJournalEntries(user)
    } catch (error) {
      console.error("Error updating journal entry:", error)
    } finally {
      setUpdatingId(null)
    }
  }

  const handleDeleteEntry = async (entryId: number) => {
    if (!user) return

    setDeletingId(entryId)
    try {
      const token = await user.getIdToken()
      await axios.delete(`http://localhost:8080/api/journal/${entryId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      await fetchJournalEntries(user)
    } catch (error) {
      console.error("Error deleting journal entry:", error)
    } finally {
      setDeletingId(null)
    }
  }

  const getTotalWords = () => {
    return journalEntries.reduce((total, entry) => {
      return total + (entry.content?.text.split(/\s+/).length || 0)
    }, 0)
  }

  const getThisWeekCount = () => {
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    return journalEntries.filter((entry) => new Date(entry.createdAt + "Z") > oneWeekAgo).length
  }

  const getAverageLength = () => {
    if (journalEntries.length === 0) return 0
    return Math.round(getTotalWords() / journalEntries.length)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-coral-50 via-purple-50 to-blue-50 flex items-center justify-center">
        <div className="animate-pulse">
          <BookOpen className="w-12 h-12 text-coral-500 animate-float" />
        </div>
      </div>
    )
  }

  if (isLocked && !isUnlocked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-coral-50 via-purple-50 to-blue-50 relative overflow-hidden">
        {/* Animated background orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-coral-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-float animation-delay-200" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-3xl animate-pulse-gentle" />

        {/* Blurred content backdrop */}
        <div className="absolute inset-0 backdrop-blur-2xl bg-white/30 z-10" />

        {/* Passcode modal */}
        <div className="relative z-20 min-h-screen flex items-center justify-center px-4">
          <Card className="w-full max-w-md border-0 bg-white/90 backdrop-blur-xl shadow-2xl animate-scale-in">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-gradient-to-br from-coral-400 to-purple-500 rounded-2xl shadow-lg">
                  <Lock className="w-12 h-12 text-white" />
                </div>
              </div>
              <CardTitle className="text-3xl">
                <span className="bg-gradient-to-r from-coral-500 to-purple-500 bg-clip-text text-transparent">
                  Journal Locked
                </span>
              </CardTitle>
              <p className="text-muted-foreground mt-2">Enter your passcode to access your private journal</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <input
                  type="password"
                  value={passcode}
                  onChange={(e) => {
                    setPasscode(e.target.value)
                    setPasscodeError("")
                  }}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleVerifyPasscode()
                    }
                  }}
                  placeholder="Enter your passcode"
                  className="w-full p-4 rounded-xl bg-white border-2 border-gray-200 focus:border-coral-400 focus:ring-4 focus:ring-coral-100 focus:outline-none transition-all duration-300 text-lg text-center tracking-wider"
                  autoFocus
                />
                {passcodeError && <p className="text-red-500 text-sm text-center animate-shake">{passcodeError}</p>}
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handleVerifyPasscode}
                  disabled={!passcode.trim() || verifying}
                  className="w-full bg-gradient-to-r from-coral-500 to-purple-500 hover:from-coral-600 hover:to-purple-600 text-white py-6 text-lg rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                >
                  {verifying ? (
                    <span className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Verifying...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Lock className="w-5 h-5" />
                      Unlock Journal
                    </span>
                  )}
                </Button>

                <Button
                  onClick={() => router.push("/home")}
                  variant="outline"
                  className="w-full rounded-xl border-2 py-3 transition-all duration-300 hover:bg-gray-50"
                >
                  Go Back
                </Button>
              </div>

              <p className="text-xs text-center text-muted-foreground">
                Forgot your passcode? You can disable the journal lock in Settings.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-coral-50 via-purple-50 to-blue-50 relative overflow-hidden">
      <div className="absolute top-20 left-10 w-72 h-72 bg-coral-500/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-float animation-delay-200" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-3xl animate-pulse-gentle" />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border/50 shadow-sm">
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
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-coral-500 via-orange-500 to-purple-500 bg-clip-text text-transparent">
                My Journal
              </h1>
              <p className="text-xs text-muted-foreground">Express your thoughts and feelings</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-coral-100 rounded-full">
            <Sparkles className="w-4 h-4 text-coral-500" />
            <span className="text-sm font-semibold text-coral-600">{journalEntries.length} Entries</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <section className="py-8 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <div
            className={`transition-all duration-1000 ${isVisible ? "animate-slide-up opacity-100" : "opacity-0"} mb-8`}
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Total Entries Stat */}
              <Card className="border-0 bg-gradient-to-br from-coral-100/80 via-pink-100/80 to-rose-100/80 backdrop-blur-sm hover:shadow-2xl hover:scale-105 transition-all duration-500 group">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-coral-700/80">Total Entries</p>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-coral-400 to-pink-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <BookOpen className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <span className="text-5xl font-bold text-coral-600">{journalEntries.length}</span>
                  <p className="text-xs text-coral-600 mt-2 font-medium">Reflections captured</p>
                </CardContent>
              </Card>

              {/* This Week Stat */}
              <Card className="border-0 bg-gradient-to-br from-blue-100/80 via-cyan-100/80 to-sky-100/80 backdrop-blur-sm hover:shadow-2xl hover:scale-105 transition-all duration-500 animation-delay-100 group">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-blue-700/80">This Week</p>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <span className="text-5xl font-bold text-blue-600">{getThisWeekCount()}</span>
                  <p className="text-xs text-blue-600 mt-2 font-medium">Recent entries</p>
                </CardContent>
              </Card>

              {/* Total Words Stat */}
              <Card className="border-0 bg-gradient-to-br from-purple-100/80 via-violet-100/80 to-fuchsia-100/80 backdrop-blur-sm hover:shadow-2xl hover:scale-105 transition-all duration-500 animation-delay-200 group">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-purple-700/80">Total Words</p>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-fuchsia-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <span className="text-5xl font-bold text-purple-600">{getTotalWords()}</span>
                  <p className="text-xs text-purple-600 mt-2 font-medium">Words written</p>
                </CardContent>
              </Card>

              {/* Average Length Stat */}
              <Card className="border-0 bg-gradient-to-br from-yellow-100/80 via-orange-100/80 to-amber-100/80 backdrop-blur-sm hover:shadow-2xl hover:scale-105 transition-all duration-500 animation-delay-300 group">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-orange-700/80">Avg Length</p>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center group-hover:rotate-6 transition-transform duration-300">
                      <Clock className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <span className="text-5xl font-bold text-orange-600">{getAverageLength()}</span>
                  <p className="text-xs text-orange-600 mt-2 font-medium">Words per entry</p>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Column - Write Entry Section */}
            <div className={`transition-all duration-1000 ${isVisible ? "animate-slide-up opacity-100" : "opacity-0"}`}>
              <Card className="border-0 bg-gradient-to-br from-white via-coral-50/30 to-purple-50/30 backdrop-blur-sm shadow-xl overflow-hidden relative h-fit sticky top-24">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-coral-200/30 to-transparent rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-purple-200/30 to-transparent rounded-full blur-3xl" />

                <CardHeader className="relative">
                  <CardTitle className="text-2xl flex items-center gap-3">
                    <div className="p-2 bg-coral-100 rounded-xl">
                      <BookOpen className="w-6 h-6 text-coral-500" />
                    </div>
                    <div>
                      <span className="bg-gradient-to-r from-coral-500 to-purple-500 bg-clip-text text-transparent">
                        Write Your Thoughts
                      </span>
                      <p className="text-sm text-muted-foreground font-normal mt-1">
                        Let your feelings flow onto the page
                      </p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative">
                  {submitted ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-4 animate-fade-in">
                      <div className="relative">
                        <CheckCircle className="w-20 h-20 text-coral-500 animate-float" />
                        <div className="absolute inset-0 w-20 h-20 bg-coral-500/20 rounded-full animate-ping" />
                      </div>
                      <p className="text-2xl font-bold text-foreground">Entry saved!</p>
                      <p className="text-muted-foreground text-center max-w-md">
                        Your thoughts have been securely recorded.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="relative">
                        <textarea
                          value={entryContent}
                          onChange={(e) => setEntryContent(e.target.value)}
                          placeholder="Write your thoughts, feelings, and reflections here... Let it all out, this is your safe space."
                          className="w-full p-5 rounded-2xl bg-white/90 border-2 border-white/50 focus:border-coral-300 focus:ring-4 focus:ring-coral-100 focus:outline-none resize-none text-foreground placeholder-muted-foreground/60 transition-all duration-300 min-h-[220px] shadow-inner leading-relaxed"
                        />
                        <div className="absolute bottom-4 right-4 text-xs text-muted-foreground bg-white/80 px-2 py-1 rounded-lg">
                          {entryContent.length} characters
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                            className="rounded-xl border-2 hover:bg-coral-50 hover:border-coral-200 transition-all duration-300"
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Add Images
                          </Button>
                          {selectedImages.length > 0 && (
                            <span className="text-sm text-muted-foreground">
                              {selectedImages.length} image{selectedImages.length > 1 ? "s" : ""} selected
                            </span>
                          )}
                        </div>

                        {selectedImages.length > 0 && (
                          <div className="grid grid-cols-3 gap-2">
                            {selectedImages.map((img, idx) => (
                              <div key={idx} className="relative group">
                                <img
                                  src={img || "/placeholder.svg"}
                                  alt={`Upload ${idx + 1}`}
                                  className="w-full h-24 object-cover rounded-xl border-2 border-gray-200"
                                />
                                <button
                                  onClick={() => removeImage(idx)}
                                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex gap-3">
                        <Button
                          onClick={handleSaveEntry}
                          disabled={!entryContent.trim() || submitting}
                          size="lg"
                          className="flex-1 bg-gradient-to-r from-coral-500 to-coral-600 hover:from-coral-600 hover:to-coral-700 text-white py-6 text-lg rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                        >
                          {submitting ? (
                            <span className="flex items-center gap-2">
                              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              Saving...
                            </span>
                          ) : (
                            <span className="flex items-center gap-2">
                              <BookOpen className="w-5 h-5" />
                              Save Entry
                            </span>
                          )}
                        </Button>
                        <Button
                          onClick={() => {
                            setEntryContent("")
                            setSelectedImages([])
                          }}
                          variant="outline"
                          size="lg"
                          className="rounded-2xl border-2 hover:bg-gray-50 transition-all duration-300 px-8"
                        >
                          Clear
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Journal Entries List */}
            <div className="animate-fade-in animation-delay-100">
              <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl overflow-hidden">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-blue-100 rounded-xl">
                        <Calendar className="w-5 h-5 text-blue-500" />
                      </div>
                      <div>
                        <span className="text-foreground">Your Journal Entries</span>
                        <p className="text-sm text-muted-foreground font-normal mt-0.5">
                          {journalEntries.length} {journalEntries.length === 1 ? "entry" : "entries"} recorded
                        </p>
                      </div>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {journalEntries.length > 0 ? (
                    <div className="max-h-[800px] overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                      {journalEntries.map((entry, index) => (
                        <div
                          key={entry.id}
                          className="group p-6 bg-gradient-to-br from-white to-gray-50/50 rounded-2xl border-2 border-gray-100 hover:border-coral-200 hover:shadow-lg transition-all duration-300 animate-fade-in relative overflow-hidden"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-coral-50/0 via-coral-50/50 to-coral-50/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                          <div className="relative">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-gray-100 px-3 py-1.5 rounded-lg w-fit">
                                  <Calendar className="w-4 h-4 text-blue-500" />
                                  {new Date(entry.createdAt + "Z").toLocaleDateString("en-US", {
                                    weekday: "long",
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </div>
                              </div>
                              <div className="flex gap-2">
                                {editingId === entry.id ? (
                                  <>
                                    <Button
                                      onClick={() => handleSaveEdit(entry.id)}
                                      disabled={!editContent.trim() || updatingId === entry.id}
                                      variant="ghost"
                                      size="sm"
                                      className="text-green-600 hover:text-green-700 hover:bg-green-50 rounded-xl transition-all duration-200 hover:scale-110"
                                    >
                                      <Check className="w-5 h-5" />
                                    </Button>
                                    <Button
                                      onClick={handleCancelEdit}
                                      variant="ghost"
                                      size="sm"
                                      className="text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:scale-110"
                                    >
                                      <X className="w-5 h-5" />
                                    </Button>
                                  </>
                                ) : (
                                  <>
                                    <Button
                                      onClick={() => handleStartEdit(entry)}
                                      variant="ghost"
                                      size="sm"
                                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-all duration-200 hover:scale-110 opacity-0 group-hover:opacity-100"
                                    >
                                      <Pencil className="w-5 h-5" />
                                    </Button>
                                    <Button
                                      onClick={() => handleDeleteEntry(entry.id)}
                                      disabled={deletingId === entry.id}
                                      variant="ghost"
                                      size="sm"
                                      className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all duration-200 hover:scale-110 opacity-0 group-hover:opacity-100"
                                    >
                                      {deletingId === entry.id ? (
                                        <div className="w-5 h-5 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" />
                                      ) : (
                                        <Trash2 className="w-5 h-5" />
                                      )}
                                    </Button>
                                  </>
                                )}
                              </div>
                            </div>

                            {editingId === entry.id ? (
                              <div className="space-y-3">
                                <div className="relative">
                                  <textarea
                                    value={editContent}
                                    onChange={(e) => setEditContent(e.target.value)}
                                    className="w-full p-5 rounded-2xl bg-white border-2 border-blue-300 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 focus:outline-none resize-none text-foreground transition-all duration-300 min-h-[180px] shadow-inner leading-relaxed"
                                    autoFocus
                                  />
                                  <div className="absolute bottom-3 right-3 text-xs text-muted-foreground bg-white px-2 py-1 rounded-lg">
                                    {editContent.length} characters
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <input
                                      ref={editFileInputRef}
                                      type="file"
                                      accept="image/*"
                                      multiple
                                      onChange={handleEditImageUpload}
                                      className="hidden"
                                    />
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => editFileInputRef.current?.click()}
                                      className="rounded-xl border-2 hover:bg-blue-50 hover:border-blue-200 transition-all duration-300"
                                    >
                                      <Upload className="w-4 h-4 mr-2" />
                                      Add Images
                                    </Button>
                                    {editImages.length > 0 && (
                                      <span className="text-sm text-muted-foreground">
                                        {editImages.length} image{editImages.length > 1 ? "s" : ""}
                                      </span>
                                    )}
                                  </div>

                                  {editImages.length > 0 && (
                                    <div className="grid grid-cols-3 gap-2">
                                      {editImages.map((img, idx) => (
                                        <div key={idx} className="relative group/img">
                                          <img
                                            src={img || "/placeholder.svg"}
                                            alt={`Edit ${idx + 1}`}
                                            className="w-full h-20 object-cover rounded-xl border-2 border-gray-200"
                                          />
                                          <button
                                            onClick={() => removeEditImage(idx)}
                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover/img:opacity-100 transition-opacity duration-200 hover:bg-red-600"
                                          >
                                            <X className="w-3 h-3" />
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div className="mt-3 space-y-4">
                                <div className="p-4 bg-white/50 rounded-xl">
                                  <p className="text-foreground leading-relaxed whitespace-pre-wrap break-words text-[15px]">
                                    {entry.content?.text}
                                  </p>
                                </div>

                                {entry.content?.images && entry.content.images.length > 0 && (
                                  <div className="grid grid-cols-2 gap-2">
                                    {entry.content.images.map((img, idx) => (
                                      <div
                                        key={idx}
                                        className="relative group/img overflow-hidden rounded-xl border-2 border-gray-200 hover:border-coral-300 transition-all duration-300"
                                      >
                                        <img
                                          src={img || "/placeholder.svg"}
                                          alt={`Journal image ${idx + 1}`}
                                          className="w-full h-48 object-cover group-hover/img:scale-105 transition-transform duration-300"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity duration-300" />
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-20 text-muted-foreground">
                      <div className="relative inline-block mb-6">
                        <BookOpen className="w-16 h-16 mx-auto opacity-20" />
                        <div className="absolute inset-0 w-16 h-16 bg-coral-500/10 rounded-full blur-xl" />
                      </div>
                      <p className="text-xl font-semibold mb-2">No journal entries yet.</p>
                      <p className="text-sm max-w-md mx-auto">
                        Start writing above to capture your thoughts and feelings! This is your personal space for
                        reflection.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
