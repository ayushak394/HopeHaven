"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, ArrowLeft, CheckCircle, Trash2, Calendar } from 'lucide-react'
import { getAuth, onAuthStateChanged } from "firebase/auth"
import axios from "axios"
import { app } from "@/lib/firebase"
import { useRouter } from 'next/navigation'
import { getOrCreateUserKey, encryptText, decryptText } from "@/lib/crypto";

// interface JournalEntry {
//   id: number
//   userId: string
//   content: string
//   createdAt: string
// }

interface JournalEntry {
  id: number;
  userId: string;
  cipherText: string;  // <- encrypted content
  iv: string;          // <- base64 IV
  createdAt: string;
  // client-only field (decrypted for UI)
  content?: string;
}
export default function JournalPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [entryContent, setEntryContent] = useState("")
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([])
  const [isVisible, setIsVisible] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const auth = getAuth(app)
  const router = useRouter()

  useEffect(() => {
    setIsVisible(true)

    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        setUser(authUser)
        await fetchJournalEntries(authUser)
      } else {
        router.push("/")
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [auth, router])

  // const fetchJournalEntries = async (authUser: any) => {
  //   try {
  //     const token = await authUser.getIdToken()
  //     const response = await axios.get("http://localhost:8080/api/journal/all", {
  //       headers: { Authorization: `Bearer ${token}` },
  //     })
  //     setJournalEntries(response.data)
  //   } catch (error) {
  //     console.error("Error fetching journal entries:", error)
  //   }
  // }

  const fetchJournalEntries = async (authUser: any) => {
  try {
    const token = await authUser.getIdToken();
    const key = await getOrCreateUserKey(authUser.uid);

    const response = await axios.get("http://localhost:8080/api/journal/all-encrypted", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const entries: JournalEntry[] = response.data;

    // Decrypt each entry content
    for (const e of entries) {
      try {
        e.content = await decryptText(e.cipherText, e.iv, key);
      } catch {
        e.content = "[Decryption failed on this device]";
      }
    }

    setJournalEntries(entries);
  } catch (error) {
    console.error("Error fetching journal entries:", error);
  }
};

  // const handleSaveEntry = async () => {
  //   if (!entryContent.trim() || !user) return

  //   setSubmitting(true)
  //   try {
  //     const token = await user.getIdToken()
  //     await axios.post(
  //       "http://localhost:8080/api/journal/add",
  //       { content: entryContent },
  //       { headers: { Authorization: `Bearer ${token}` } }
  //     )

  //     setSubmitted(true)
  //     setEntryContent("")

  //     setTimeout(async () => {
  //       await fetchJournalEntries(user)
  //       setSubmitted(false)
  //     }, 2000)
  //   } catch (error) {
  //     console.error("Error saving journal entry:", error)
  //     setSubmitting(false)
  //   }
  // }

  const handleSaveEntry = async () => {
  if (!entryContent.trim() || !user) return;
  setSubmitting(true);
  try {
    const token = await user.getIdToken();
    const key = await getOrCreateUserKey(user.uid);
    const { cipherTextB64, ivB64 } = await encryptText(entryContent, key);

    await axios.post(
      "http://localhost:8080/api/journal/add-encrypted",
      { cipherText: cipherTextB64, iv: ivB64 },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setSubmitted(true);
    setEntryContent("");
    setTimeout(async () => {
      await fetchJournalEntries(user);
      setSubmitted(false);
    }, 1200);
  } catch (error) {
    console.error("Error saving journal entry:", error);
    setSubmitting(false);
  }
};

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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse">
          <BookOpen className="w-12 h-12 text-coral-500 animate-pulse" />
        </div>
      </div>
    )
  }

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
            <h1 className="text-2xl font-bold text-foreground">My Journal</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <section className="py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Journal Entry Input Section */}
          <div className={`transition-all duration-1000 ${isVisible ? "animate-slide-up opacity-100" : "opacity-0"}`}>
            <Card className="border-0 bg-gradient-to-br from-coral-50 to-purple-50 mb-8">
              <CardHeader>
                <CardTitle className="text-3xl flex items-center gap-2">
                  <BookOpen className="w-8 h-8 text-coral-500" />
                  Write Your Thoughts
                </CardTitle>
              </CardHeader>
              <CardContent>
                {submitted ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-4 animate-fade-in">
                    <CheckCircle className="w-16 h-16 text-coral-500 animate-float" />
                    <p className="text-xl font-semibold text-foreground">Entry saved successfully!</p>
                    <p className="text-muted-foreground">Your thoughts have been recorded. Keep expressing yourself!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <textarea
                      value={entryContent}
                      onChange={(e) => setEntryContent(e.target.value)}
                      placeholder="Write your thoughts, feelings, and reflections here..."
                      className="w-full p-4 rounded-xl bg-white/80 border-2 border-white/20 focus:border-coral-300 focus:outline-none resize-none text-foreground placeholder-muted-foreground transition-all duration-300 min-h-[200px]"
                    />

                    <div className="flex gap-3">
                      <Button
                        onClick={handleSaveEntry}
                        disabled={!entryContent.trim() || submitting}
                        size="lg"
                        className="flex-1 bg-coral-500 hover:bg-coral-600 text-white py-3 text-lg rounded-full transition-all duration-300 hover:scale-105"
                      >
                        {submitting ? "Saving..." : "Save Entry"}
                      </Button>
                      <Button
                        onClick={() => setEntryContent("")}
                        variant="outline"
                        size="lg"
                        className="rounded-full"
                      >
                        Clear
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Journal Entries List Section */}
          <Card className="border-0 bg-gradient-to-br from-white to-gray-50 animate-fade-in animation-delay-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-500" />
                Your Entries ({journalEntries.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {journalEntries.length > 0 ? (
                <div className="space-y-4">
                  {journalEntries.map((entry, index) => (
                    <div
                      key={entry.id}
                      className="p-6 bg-white/60 rounded-xl border border-border/30 hover:bg-white/80 transition-all duration-300 hover:shadow-md animate-fade-in"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <p className="text-sm text-muted-foreground flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {new Date(entry.createdAt + "Z").toLocaleDateString("en-US", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                        <Button
                          onClick={() => handleDeleteEntry(entry.id)}
                          disabled={deletingId === entry.id}
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-foreground leading-relaxed whitespace-pre-wrap break-words">
                        {entry.content}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 text-muted-foreground">
                  <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p className="text-lg">No journal entries yet.</p>
                  <p className="text-sm">Start writing above to capture your thoughts and feelings!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
