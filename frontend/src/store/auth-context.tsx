import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"
import api from "@/services/api"

// Dev mode: no Firebase key OR accessing from a non-localhost IP (mobile testing)
const IS_DEV = !import.meta.env.VITE_FIREBASE_API_KEY ||
  (typeof window !== "undefined" && !window.location.hostname.includes("localhost") && !window.location.hostname.includes("lifepulse"))

/** Check if running inside Capacitor native app */
function isNativeApp(): boolean {
  return !!(window as any).Capacitor?.isNativePlatform()
}

interface AppUser {
  id: string
  email: string
  display_name: string | null
  photo_url: string | null
  timezone: string
}

interface AuthContextType {
  user: AppUser | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

const DEV_USER: AppUser = {
  id: "dev-user-001",
  email: "dev@mypersonaltracker.app",
  display_name: "Dev User",
  photo_url: null,
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (IS_DEV) {
      api
        .post("/auth/dev-login")
        .then((res) => setUser(res.data))
        .catch(() => setUser(DEV_USER))
        .finally(() => setLoading(false))
    } else {
      // Firebase mode
      import("@/lib/firebase").then(({ auth }) => {
        import("firebase/auth").then(({ onAuthStateChanged }) => {
          onAuthStateChanged(auth, async (fbUser) => {
            if (fbUser) {
              try {
                const token = await fbUser.getIdToken()
                const res = await api.post("/auth/login", { id_token: token })
                setUser(res.data)
                const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
                if (res.data.timezone !== tz) {
                  api.patch("/auth/me", { timezone: tz }).catch(() => {})
                }
              } catch {
                setUser(null)
              }
            } else {
              setUser(null)
            }
            setLoading(false)
          })
        })
      })
    }
  }, [])

  const signInWithGoogle = async () => {
    if (IS_DEV) {
      try {
        const res = await api.post("/auth/dev-login")
        setUser(res.data)
      } catch {
        setUser(DEV_USER)
      }
      return
    }

    if (isNativeApp()) {
      // NATIVE: Use Capacitor Firebase plugin for native Google Sign-In
      // This shows the native Google account picker (bottom sheet)
      // and returns the credential without leaving the app
      const { FirebaseAuthentication } = await import("@capacitor-firebase/authentication")
      const { GoogleAuthProvider, signInWithCredential } = await import("firebase/auth")
      const { auth } = await import("@/lib/firebase")

      const result = await FirebaseAuthentication.signInWithGoogle()
      if (!result.credential?.idToken) throw new Error("No ID token from Google Sign-In")

      // Use the native token to sign in to Firebase Web SDK
      const credential = GoogleAuthProvider.credential(result.credential.idToken)
      const userCredential = await signInWithCredential(auth, credential)
      const token = await userCredential.user.getIdToken()

      // Register with our backend
      const res = await api.post("/auth/login", { id_token: token })
      setUser(res.data)
    } else {
      // WEB: Use popup (works in browsers)
      const { auth, googleProvider } = await import("@/lib/firebase")
      const { signInWithPopup } = await import("firebase/auth")
      const result = await signInWithPopup(auth, googleProvider)
      const token = await result.user.getIdToken()
      const res = await api.post("/auth/login", { id_token: token })
      setUser(res.data)
    }
  }

  const signOut = async () => {
    if (!IS_DEV) {
      if (isNativeApp()) {
        const { FirebaseAuthentication } = await import("@capacitor-firebase/authentication")
        await FirebaseAuthentication.signOut()
      }
      const { auth } = await import("@/lib/firebase")
      const { signOut: firebaseSignOut } = await import("firebase/auth")
      await firebaseSignOut(auth)
    }
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
