"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, SettingsIcon, Upload, LogOut, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/lib/theme-context";

// ✅ Firebase imports added
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { app } from "@/lib/firebase";
import axios from "axios";
import { AvatarCropModal } from "../../components/ui/AvatarModal";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  profilePicture?: string;
}

type Theme = "light" | "dark" | "calm-blue" | "sunset-orange" | "lavender";

const themes = [
  { id: "light", name: "Light", description: "Clean and bright interface", icon: "☀️" },
  { id: "dark", name: "Dark", description: "Easy on the eyes at night", icon: "🌙" },
  { id: "calm-blue", name: "Calm Blue", description: "Serene blue tones", icon: "💙" },
  { id: "sunset-orange", name: "Sunset Orange", description: "Warm sunset vibes", icon: "🌅" },
  { id: "lavender", name: "Lavender", description: "Soft lavender hues", icon: "💜" },
];

export default function SettingsPage() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [isSavingName, setIsSavingName] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [cropModalOpen, setCropModalOpen] = useState(false)
const [imageToCrop, setImageToCrop] = useState<string>("")


  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const auth = getAuth(app);
  const storage = getStorage(app);


  // ✅ Fetch real user data from Firebase (copied from HomePage)
//   useEffect(() => {
//     setIsVisible(true);

//     const unsubscribe = onAuthStateChanged(auth, (authUser) => {
//       if (authUser) {
//         const profile = {
//           id: authUser.uid,
//           name: authUser.displayName || "Friend",
//           email: authUser.email || "",
//         };

//         setUserProfile(profile);
//         setDisplayName(profile.name);
//       } else {
//         router.push("/");
//       }

//       setLoading(false);
//     });

//     return () => unsubscribe();
//   }, [auth, router]);


useEffect(() => {
  setIsVisible(true);

  const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
    if (!authUser) {
      router.push("/");
      return;
    }

    try {
      const token = await authUser.getIdToken();

      // GET USER FROM BACKEND instead of Firebase
      const res = await axios.get("http://localhost:8080/api/user/profile", {
        headers: { Authorization: `Bearer ${token}` }
      });

      const dbUser = res.data;

      setUserProfile({
  id: dbUser.uid,
  name: dbUser.name,
  email: dbUser.email,
  profilePicture: dbUser.avatarUrl
});


      setDisplayName(dbUser.name);

    } catch (err) {
      console.error("Failed to fetch user profile:", err);
    }

    setLoading(false);
  });

  return () => unsubscribe();
}, [auth, router]);

  // ✅ Real signout function copied from HomePage
  const handleSignOut = async () => {
    await signOut(auth);
    router.push("/");
  };

  const handleSaveName = async () => {
  if (!displayName.trim()) return;

  setIsSavingName(true);

  try {
    const token = await auth.currentUser?.getIdToken();

    await axios.put(
      "http://localhost:8080/api/user/update-name",
      { newName: displayName },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setUserProfile({ ...userProfile!, name: displayName });
    setIsEditingName(false);
  } catch (err) {
    console.error("Failed to update name:", err);
  }

  setIsSavingName(false);
};

async function uploadToFirebase(croppedBlob, uid) {
  const fileRef = ref(storage, `avatars/${uid}.jpg`);
  await uploadBytes(fileRef, croppedBlob);
  return await getDownloadURL(fileRef);
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


  if (loading || !userProfile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Heart className="w-12 h-12 text-coral-500 animate-pulse" />
      </div>
    );
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
      { headers: { Authorization: `Bearer ${token}` } }
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


  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-8 h-8 text-coral-500" />
            <span className="text-2xl font-bold text-foreground">HopeHaven</span>
          </div>

          <Button variant="ghost" size="sm" onClick={() => router.push("/home")} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className={`transition-all duration-1000 ${isVisible ? "animate-slide-up opacity-100" : "opacity-0"}`}>
        <section className="py-12 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 flex items-center gap-3">
                <SettingsIcon className="w-10 h-10 text-coral-500" />
                Settings
              </h1>
              <p className="text-lg text-muted-foreground">Personalize your HopeHaven experience</p>
            </div>

            {/* Profile Section */}
            <Card className="border-0 bg-gradient-to-br from-white to-gray-50 mb-8 animate-fade-in shadow-lg">
              <CardHeader className="border-b border-border">
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-coral-500" />
                  Profile
                </CardTitle>
              </CardHeader>

              <CardContent className="pt-8">
                <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">

                  {/* Profile Picture */}
<div className="flex flex-col items-center gap-4">
  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-coral-400 to-coral-600 flex items-center justify-center overflow-hidden border-4 border-coral-200">
    {profileImage || userProfile.profilePicture ? (
      <img
        src={profileImage || userProfile.profilePicture!}
        alt="Profile"
        className="w-full h-full object-cover"
      />
    ) : (
      <span className="text-4xl">👤</span>
    )}
  </div>

  {/* Hidden input */}
  <input
    id="avatarUpload"
    type="file"
    accept="image/*"
    className="hidden"
    onChange={handleImageUpload}
  />

  {/* Visible button */}
  <Button
    variant="outline"
    size="sm"
    onClick={() => document.getElementById("avatarUpload")?.click()}
  >
    <Upload className="w-4 h-4" />
  </Button>
</div>


                  {/* Name + Email */}
                  <div className="flex-1 w-full md:w-auto">
                    <label className="block text-sm font-semibold text-foreground mb-3">Display Name</label>

                    {isEditingName ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          className="flex-1 px-4 py-2 bg-background border border-border rounded-lg"
                        />
                        <Button size="sm" onClick={handleSaveName} disabled={isSavingName} className="bg-coral-500 text-white">
                          {isSavingName ? "Saving..." : "Save"}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setIsEditingName(false)}>
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-medium">{displayName}</span>
                        <Button variant="outline" size="sm" onClick={() => setIsEditingName(true)}>
                          Edit
                        </Button>
                      </div>
                    )}

                    <p className="text-sm text-muted-foreground mt-3">{userProfile.email}</p>
                  </div>

                </div>
              </CardContent>
            </Card>
             <Card className="border-0 bg-gradient-to-br from-white to-gray-50 mb-8 animate-fade-in animation-delay-100 shadow-lg">
              <CardHeader className="border-b border-border">
                 <CardTitle className="flex items-center gap-2">
                 <SettingsIcon className="w-5 h-5 text-purple-500" />
                   Theme
                 </CardTitle>
              </CardHeader>
               <CardContent className="pt-8">
               <p className="text-sm text-muted-foreground mb-6">
                   Choose your preferred theme to personalize your experience
                 </p>
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                   {themes.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTheme(t.id)}
                      className={`p-4 rounded-lg border-2 transition-all duration-300 hover:scale-105 flex flex-col items-center gap-2 ${
                        theme === t.id
                          ? "border-coral-500 bg-coral-50"
                          : "border-border hover:border-coral-300 bg-background"
                      }`}
                    >
                      <span className="text-2xl">{t.icon}</span>
                      <span className="font-semibold text-foreground text-sm">{t.name}</span>
                      <span className="text-xs text-muted-foreground text-center">{t.description}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Account Section */}
            <Card className="border-0 bg-gradient-to-br from-red-50 to-red-100 animate-fade-in animation-delay-200 shadow-lg">
              <CardHeader className="border-b border-red-200">
                <CardTitle className="flex items-center gap-2 text-red-700">
                  <LogOut className="w-5 h-5" />
                  Account
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-8">
                <p className="text-sm text-red-600 mb-6">
                  Sign out of your account. You can always sign back in anytime.
                </p>
                <Button
                  onClick={handleSignOut}
                  className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>

      <AvatarCropModal
  open={cropModalOpen}
  onClose={() => setCropModalOpen(false)}
  imageUrl={imageToCrop}
  onCropComplete={handleCroppedImage}/>


      {/* Footer */}
      <footer className="py-12 px-4 bg-slate-50 border-t border-border mt-20">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-muted-foreground mb-2">© 2025 HopeHaven. Your mental wellness matters.</p>
        </div>
      </footer>
    </div>
  )
}