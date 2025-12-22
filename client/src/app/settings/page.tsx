"use client"
import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Upload,
  LogOut,
  ArrowLeft,
  Trash2,
  AlertTriangle,
  User,
  Sparkles,
  Palette,
  Shield,
  Lock,
  Key,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useTheme } from "@/lib/theme-context"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth"
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { app } from "@/lib/firebase"
import axios from "axios"
import { AvatarCropModal } from "@/components/ui/AvatarModal"

interface UserProfile {
  id: string
  name: string
  email: string
  profilePicture?: string
}

type Theme = "light" | "dark" | "calm-blue" | "sunset-orange" | "lavender"

const themes = [
  { id: "light", name: "Light", description: "Clean and bright interface", icon: "☀️" },
  { id: "dark", name: "Dark", description: "Easy on the eyes at night", icon: "🌙" },
  { id: "calm-blue", name: "Calm Blue", description: "Serene blue tones", icon: "💙" },
  { id: "sunset-orange", name: "Sunset Orange", description: "Warm sunset vibes", icon: "🌅" },
  { id: "lavender", name: "Lavender", description: "Soft lavender hues", icon: "💜" },
]

export default function SettingsPage() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isVisible, setIsVisible] = useState(false)
  const [displayName, setDisplayName] = useState("")
  const [isEditingName, setIsEditingName] = useState(false)
  const [isSavingName, setIsSavingName] = useState(false)
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [cropModalOpen, setCropModalOpen] = useState(false)
  const [imageToCrop, setImageToCrop] = useState<string>("")
  const [deleteConfirmText, setDeleteConfirmText] = useState("")
  const [isDeletingAccount, setIsDeletingAccount] = useState(false)

  const [isJournalLockEnabled, setIsJournalLockEnabled] = useState(false)
  const [showEnableDialog, setShowEnableDialog] = useState(false)
  const [showDisableDialog, setShowDisableDialog] = useState(false)
  const [showChangeDialog, setShowChangeDialog] = useState(false)
  const [newPasscode, setNewPasscode] = useState("")
  const [oldPasscode, setOldPasscode] = useState("")
  const [verifyPasscode, setVerifyPasscode] = useState("")
  const [passcodeError, setPasscodeError] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const auth = getAuth(app)
  const storage = getStorage(app)

  useEffect(() => {
    setIsVisible(true)

    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (!authUser) {
        router.push("/")
        return
      }

      try {
        const token = await authUser.getIdToken()

        const res = await axios.get("http://localhost:8080/api/user/profile", {
          headers: { Authorization: `Bearer ${token}` },
        })

        const dbUser = res.data

        setUserProfile({
          id: dbUser.uid,
          name: dbUser.name,
          email: dbUser.email,
          profilePicture: dbUser.avatarUrl || authUser.photoURL,
        })

        setDisplayName(dbUser.name)

        const lockStatusRes = await axios.get("http://localhost:8080/api/journal-lock/status", {
          headers: { Authorization: `Bearer ${token}` },
        })
        setIsJournalLockEnabled(lockStatusRes.data.enabled)
      } catch (err) {
        console.error("Failed to fetch user profile:", err)
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [auth, router])

  // ✅ Real signout function copied from HomePage
  const handleSignOut = async () => {
    await signOut(auth)
    router.push("/")
  }

  const handleSaveName = async () => {
    if (!displayName.trim()) return

    setIsSavingName(true)

    try {
      const token = await auth.currentUser?.getIdToken()

      await axios.put(
        "http://localhost:8080/api/user/update-name",
        { newName: displayName },
        { headers: { Authorization: `Bearer ${token}` } },
      )

      setUserProfile({ ...userProfile!, name: displayName })
      setIsEditingName(false)
    } catch (err) {
      console.error("Failed to update name:", err)
    }

    setIsSavingName(false)
  }

  async function uploadToFirebase(croppedBlob, uid) {
    const fileRef = ref(storage, `avatars/${uid}.jpg`)
    await uploadBytes(fileRef, croppedBlob)
    return await getDownloadURL(fileRef)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => {
      setImageToCrop(reader.result as string)
      setCropModalOpen(true)
    }
    reader.readAsDataURL(file)
  }

  const handleCroppedImage = async (blob: Blob) => {
    try {
      const uid = userProfile!.id
      const token = await auth.currentUser?.getIdToken()

      // 1) Upload to Firebase
      const storageRef = ref(storage, `avatars/${uid}.jpg`)
      await uploadBytes(storageRef, blob)
      const downloadUrl = await getDownloadURL(storageRef)

      // 2) Save to backend
      await axios.put(
        "http://localhost:8080/api/user/update-avatar",
        { avatarUrl: downloadUrl },
        { headers: { Authorization: `Bearer ${token}` } },
      )

      // 3) Update UI
      setUserProfile({
        ...userProfile!,
        profilePicture: downloadUrl,
      })
      setProfileImage(downloadUrl)
    } catch (err) {
      console.error("Avatar upload failed:", err)
    }
  }

  const handleEnableJournalLock = async () => {
    if (newPasscode.length < 4) {
      setPasscodeError("Passcode must be at least 4 characters")
      return
    }

    setIsProcessing(true)
    setPasscodeError("")

    try {
      const token = await auth.currentUser?.getIdToken()

      await axios.post(
        "http://localhost:8080/api/journal-lock/enable",
        { passcode: newPasscode },
        { headers: { Authorization: `Bearer ${token}` } },
      )

      setIsJournalLockEnabled(true)
      setShowEnableDialog(false)
      setNewPasscode("")
    } catch (err) {
      console.error("Failed to enable journal lock:", err)
      setPasscodeError("Failed to enable lock")
    }

    setIsProcessing(false)
  }

  const handleDisableJournalLock = async () => {
    setIsProcessing(true)
    setPasscodeError("")

    try {
      const token = await auth.currentUser?.getIdToken()

      // Verify passcode first
      const verifyRes = await axios.post(
        "http://localhost:8080/api/journal-lock/verify",
        { passcode: verifyPasscode },
        { headers: { Authorization: `Bearer ${token}` } },
      )

      if (!verifyRes.data.success) {
        setPasscodeError("Incorrect passcode")
        setIsProcessing(false)
        return
      }

      // Disable lock
      await axios.post(
        "http://localhost:8080/api/journal-lock/disable",
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      )

      setIsJournalLockEnabled(false)
      setShowDisableDialog(false)
      setVerifyPasscode("")
    } catch (err) {
      console.error("Failed to disable journal lock:", err)
      setPasscodeError("Failed to disable lock")
    }

    setIsProcessing(false)
  }

  const handleChangePasscode = async () => {
    if (newPasscode.length < 4) {
      setPasscodeError("New passcode must be at least 4 characters")
      return
    }

    setIsProcessing(true)
    setPasscodeError("")

    try {
      const token = await auth.currentUser?.getIdToken()

      await axios.post(
        "http://localhost:8080/api/journal-lock/change",
        { oldPasscode, newPasscode },
        { headers: { Authorization: `Bearer ${token}` } },
      )

      setShowChangeDialog(false)
      setOldPasscode("")
      setNewPasscode("")
    } catch (err: any) {
      console.error("Failed to change passcode:", err)
      setPasscodeError(err.response?.data?.message || "Incorrect old passcode or failed to change")
    }

    setIsProcessing(false)
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") {
      return
    }

    setIsDeletingAccount(true)

    try {
      const token = await auth.currentUser?.getIdToken()

      // Send DELETE request to backend
      await axios.delete("http://localhost:8080/api/user/delete", {
        headers: { Authorization: `Bearer ${token}` },
      })

      // Delete Firebase auth account
      await auth.currentUser?.delete()

      // Clear localStorage
      localStorage.clear()

      // Redirect to home
      router.push("/")
    } catch (error) {
      console.error("Failed to delete account:", error)
      // Handle re-authentication if needed
    } finally {
      setIsDeletingAccount(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-purple-50/20 to-blue-50/20 relative overflow-hidden">
      <div className="absolute top-20 left-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl animate-float animation-delay-200" />
      <div className="absolute top-1/2 left-1/3 w-96 h-96 bg-coral-500/5 rounded-full blur-3xl animate-pulse-gentle" />
      <div className="absolute bottom-1/4 left-20 w-72 h-72 bg-pink-500/8 rounded-full blur-3xl animate-float animation-delay-300" />

      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
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
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-500 via-coral-500 to-blue-500 bg-clip-text text-transparent">
                Settings
              </h1>
              <p className="text-sm text-muted-foreground mt-1">Manage your account and preferences</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
            </div>
          </div>
        </div>
      </header>

      <div className={`transition-all duration-1000 ${isVisible ? "animate-slide-up opacity-100" : "opacity-0"}`}>
        <section className="py-10 px-6 relative">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-8 mb-8">
              {/* Profile Card */}
              <Card className="border-0 bg-white/70 backdrop-blur-lg shadow-xl hover:shadow-2xl transition-all duration-500 animate-fade-in overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-coral-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <CardHeader className="border-b border-border/50 relative pb-6">
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-coral-400 to-pink-500 flex items-center justify-center shadow-lg">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <span className="text-xl font-bold">Profile Settings</span>
                      <p className="text-sm text-muted-foreground font-normal mt-1">Update your personal information</p>
                    </div>
                  </CardTitle>
                </CardHeader>

                <CardContent className="pt-8 relative">
                  <div className="flex flex-col items-center gap-6 mb-8">
                    <div className="relative group/avatar">
                      <div className="w-32 h-32 rounded-full bg-gradient-to-br from-coral-400 via-pink-400 to-coral-600 flex items-center justify-center overflow-hidden border-4 border-white shadow-2xl group-hover/avatar:scale-105 transition-transform duration-300">
                        {profileImage || userProfile?.profilePicture ? (
                          <img
                            src={profileImage || userProfile.profilePicture!}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-6xl">👤</span>
                        )}
                      </div>
                      <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                    </div>

                    <input
                      id="avatarUpload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />

                    <Button
                      variant="outline"
                      onClick={() => document.getElementById("avatarUpload")?.click()}
                      className="bg-white/80 hover:bg-coral-50 hover:border-coral-300 transition-all duration-300 hover:scale-105 shadow-md"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Change Profile Picture
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-muted-foreground mb-3">Display Name</label>

                      {isEditingName ? (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            className="flex-1 px-4 py-3 bg-background/50 backdrop-blur-sm border-2 border-border rounded-xl focus:ring-2 focus:ring-coral-500 focus:border-transparent transition-all duration-300"
                            placeholder="Enter your name"
                          />
                          <Button
                            onClick={handleSaveName}
                            disabled={isSavingName}
                            className="bg-gradient-to-r from-coral-500 to-pink-500 hover:from-coral-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                          >
                            {isSavingName ? "Saving..." : "Save"}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setIsEditingName(false)}
                            className="hover:bg-gray-100 transition-all duration-300"
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-coral-50/80 to-pink-50/80 rounded-xl border-2 border-coral-100">
                          <span className="text-2xl font-bold text-foreground flex-1">{displayName}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsEditingName(true)}
                            className="hover:bg-white hover:border-coral-300 transition-all duration-300 hover:scale-105"
                          >
                            Edit
                          </Button>
                        </div>
                      )}
                    </div>

                    <div className="p-4 bg-gradient-to-r from-blue-50/80 to-cyan-50/80 rounded-xl border-2 border-blue-100">
                      <label className="block text-xs font-semibold text-muted-foreground mb-2">Email Address</label>
                      <p className="text-sm font-medium text-foreground flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        {userProfile?.email}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Theme Preferences Card */}
              <Card className="border-0 bg-white/70 backdrop-blur-lg shadow-xl hover:shadow-2xl transition-all duration-500 animate-fade-in animation-delay-100 overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <CardHeader className="border-b border-border/50 relative pb-6">
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center shadow-lg">
                      <Palette className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <span className="text-xl font-bold">Theme Preferences</span>
                      <p className="text-sm text-muted-foreground font-normal mt-1">Customize your experience</p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-8 relative">
                  <div className="grid grid-cols-1 gap-4">
                    {themes.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setTheme(t.id)}
                        className={`p-5 rounded-2xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-xl flex items-center gap-4 relative overflow-hidden group/theme ${
                          theme === t.id
                            ? "border-coral-500 bg-gradient-to-br from-coral-50 to-pink-50 shadow-lg"
                            : "border-border hover:border-coral-300 bg-white/80 backdrop-blur-sm"
                        }`}
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-coral-500/10 to-purple-500/10 opacity-0 group-hover/theme:opacity-100 transition-opacity duration-300" />
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                          <span className="text-3xl relative z-10 group-hover/theme:scale-110 transition-transform duration-300">
                            {t.icon}
                          </span>
                        </div>
                        <div className="flex-1 text-left relative z-10">
                          <span className="font-bold text-foreground block">{t.name}</span>
                          <span className="text-sm text-muted-foreground">{t.description}</span>
                        </div>
                        {theme === t.id && (
                          <div className="w-6 h-6 bg-coral-500 rounded-full flex items-center justify-center relative z-10">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 mb-8">
              <Card className="border-0 bg-white/70 backdrop-blur-lg shadow-xl hover:shadow-2xl transition-all duration-500 animate-fade-in animation-delay-200 overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <CardHeader className="border-b border-border/50 relative pb-6">
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center shadow-lg">
                      <Lock className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <span className="text-xl font-bold">Journal Security</span>
                      <p className="text-sm text-muted-foreground font-normal mt-1">Protect your journal entries</p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-8 relative">
                  <div className="space-y-6">
                    <div className="p-6 bg-gradient-to-br from-blue-50/80 to-cyan-50/80 rounded-2xl border-2 border-blue-200/50">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="font-semibold text-foreground">Journal Lock</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {isJournalLockEnabled ? "Lock is enabled" : "Require passcode to view journals"}
                          </p>
                        </div>
                        <div
                          className={`w-14 h-8 rounded-full transition-all duration-300 cursor-pointer relative ${
                            isJournalLockEnabled ? "bg-blue-500" : "bg-gray-300"
                          }`}
                          onClick={() => {
                            if (isJournalLockEnabled) {
                              setShowDisableDialog(true)
                            } else {
                              setShowEnableDialog(true)
                            }
                          }}
                        >
                          <div
                            className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 ${
                              isJournalLockEnabled ? "translate-x-7" : "translate-x-1"
                            }`}
                          />
                        </div>
                      </div>

                      {isJournalLockEnabled && (
                        <Button
                          variant="outline"
                          onClick={() => setShowChangeDialog(true)}
                          className="w-full mt-4 hover:bg-blue-50 hover:border-blue-300 transition-all duration-300"
                        >
                          <Key className="w-4 h-4 mr-2" />
                          Change Passcode
                        </Button>
                      )}
                    </div>

                    <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-200">
                      <p className="text-xs text-blue-700/80 leading-relaxed">
                        When enabled, you'll need to enter your passcode before viewing journal entries. This keeps your
                        private thoughts secure.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Account Actions Card */}
              <Card className="border-0 bg-gradient-to-br from-orange-100/80 via-red-100/80 to-coral-100/80 backdrop-blur-lg shadow-xl hover:shadow-2xl transition-all duration-500 animate-fade-in animation-delay-200 overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <CardHeader className="border-b border-red-200/50 relative pb-6">
                  <CardTitle className="flex items-center gap-3 text-red-800">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-400 to-orange-500 flex items-center justify-center shadow-lg">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <span className="text-xl font-bold">Account Actions</span>
                      <p className="text-sm text-red-700/70 font-normal mt-1">Manage your session</p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-8 relative">
                  <div className="space-y-6">
                    <div className="p-6 bg-white/60 backdrop-blur-sm rounded-2xl border-2 border-orange-200/50">
                      <p className="text-sm text-red-700/80 mb-4 leading-relaxed font-medium">
                        Sign out of your account securely. You can always sign back in anytime with your credentials.
                      </p>
                      <Button
                        onClick={handleSignOut}
                        className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid lg:grid-cols-1 gap-8">
              {/* Danger Zone Card */}
              <Card className="border-2 border-red-500 bg-gradient-to-br from-red-50/90 via-red-100/90 to-red-50/90 backdrop-blur-lg shadow-xl hover:shadow-2xl transition-all duration-500 animate-fade-in animation-delay-300 overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-red-600/5 to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <CardHeader className="border-b border-red-300/50 bg-gradient-to-r from-red-100/80 to-orange-100/80 relative pb-6">
                  <CardTitle className="flex items-center gap-3 text-red-800">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center animate-pulse-gentle shadow-lg">
                      <AlertTriangle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <span className="text-xl font-bold">Danger Zone</span>
                      <p className="text-sm text-red-700/70 font-normal mt-1">Irreversible actions</p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-8 relative">
                  <div className="space-y-4">
                    <div className="p-6 bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-red-300/50 hover:border-red-400 transition-all duration-300 hover:shadow-lg">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center flex-shrink-0">
                          <Trash2 className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-red-800 mb-2 text-lg">Delete Account</h3>
                          <p className="text-sm text-red-700/80 mb-3 leading-relaxed">
                            Permanently delete your account and all associated data.
                          </p>
                        </div>
                      </div>

                      <div className="bg-red-50/80 rounded-xl p-4 mb-4">
                        <p className="text-xs font-semibold text-red-800 mb-2">This will delete:</p>
                        <ul className="text-xs text-red-600/80 space-y-1.5 ml-4 list-disc">
                          <li>Your profile and settings</li>
                          <li>All mood tracking entries</li>
                          <li>All journal entries</li>
                          <li>Your profile picture</li>
                          <li>All dashboard analytics</li>
                        </ul>
                      </div>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="destructive"
                            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete My Account
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="max-w-md">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center gap-2 text-red-700">
                              <AlertTriangle className="w-6 h-6" />
                              Delete Account Permanently?
                            </AlertDialogTitle>
                            <AlertDialogDescription className="space-y-4 pt-4">
                              <p className="text-foreground font-medium">This will permanently delete:</p>
                              <ul className="text-sm text-muted-foreground space-y-2 ml-4 list-disc">
                                <li>Your user profile and settings</li>
                                <li>All mood tracking entries</li>
                                <li>All journal entries</li>
                                <li>Your profile picture</li>
                                <li>All dashboard analytics</li>
                              </ul>
                              <div className="pt-4 space-y-2">
                                <label className="text-sm font-medium text-foreground">
                                  Type <span className="font-bold text-red-600">DELETE</span> to confirm:
                                </label>
                                <input
                                  type="text"
                                  value={deleteConfirmText}
                                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                                  placeholder="Type DELETE"
                                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-foreground bg-background"
                                />
                              </div>
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setDeleteConfirmText("")}>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleDeleteAccount}
                              disabled={deleteConfirmText !== "DELETE" || isDeletingAccount}
                              className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isDeletingAccount ? "Deleting..." : "Delete Forever"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </div>

      <AvatarCropModal
        isOpen={cropModalOpen}
        onClose={() => setCropModalOpen(false)}
        imageSrc={imageToCrop}
        onCropComplete={handleCroppedImage}
      />

      <Dialog open={showEnableDialog} onOpenChange={setShowEnableDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-blue-600" />
              Enable Journal Lock
            </DialogTitle>
            <DialogDescription>Create a passcode to protect your journal entries</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium mb-2">Create Passcode</label>
              <input
                type="password"
                value={newPasscode}
                onChange={(e) => setNewPasscode(e.target.value)}
                placeholder="Enter at least 4 characters"
                className="w-full px-4 py-3 bg-background border-2 border-border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              />
            </div>

            {passcodeError && <p className="text-sm text-red-600">{passcodeError}</p>}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEnableDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleEnableJournalLock}
              disabled={isProcessing}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
            >
              {isProcessing ? "Enabling..." : "Enable Lock"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDisableDialog} onOpenChange={setShowDisableDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              Disable Journal Lock
            </DialogTitle>
            <DialogDescription>Enter your passcode to disable journal protection</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium mb-2">Enter Current Passcode</label>
              <input
                type="password"
                value={verifyPasscode}
                onChange={(e) => setVerifyPasscode(e.target.value)}
                placeholder="Enter your passcode"
                className="w-full px-4 py-3 bg-background border-2 border-border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
              />
            </div>

            {passcodeError && <p className="text-sm text-red-600">{passcodeError}</p>}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDisableDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleDisableJournalLock}
              disabled={isProcessing}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
            >
              {isProcessing ? "Disabling..." : "Disable Lock"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showChangeDialog} onOpenChange={setShowChangeDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="w-5 h-5 text-blue-600" />
              Change Journal Passcode
            </DialogTitle>
            <DialogDescription>Enter your current passcode and create a new one</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium mb-2">Current Passcode</label>
              <input
                type="password"
                value={oldPasscode}
                onChange={(e) => setOldPasscode(e.target.value)}
                placeholder="Enter current passcode"
                className="w-full px-4 py-3 bg-background border-2 border-border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">New Passcode</label>
              <input
                type="password"
                value={newPasscode}
                onChange={(e) => setNewPasscode(e.target.value)}
                placeholder="Enter at least 4 characters"
                className="w-full px-4 py-3 bg-background border-2 border-border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              />
            </div>

            {passcodeError && <p className="text-sm text-red-600">{passcodeError}</p>}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowChangeDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleChangePasscode}
              disabled={isProcessing}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
            >
              {isProcessing ? "Changing..." : "Change Passcode"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
