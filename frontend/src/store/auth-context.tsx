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
      // Dev mode: auto-login, register with backend
      api
        .post("/auth/dev-login")
        .then((res) => setUser(res.data))
        .catch(() => setUser(DEV_USER))
        .finally(() => setLoading(false))
    } else {
      // Firebase mode: dynamic import to avoid loading Firebase when not configured
      import("@/lib/firebase").then(({ auth }) => {
        import("firebase/auth").then(({ onAuthStateChanged }) => {
          onAuthStateChanged(auth, async (fbUser) => {
            if (fbUser) {
              try {
                const token = await fbUser.getIdToken()
                const res = await api.post("/auth/login", {
                  id_token: token,
                })
                setUser(res.data)
                // Auto-detect and sync timezone
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
    const { auth, googleProvider } = await import("@/lib/firebase")
    const { signInWithPopup } = await import("firebase/auth")
    const result = await signInWithPopup(auth, googleProvider)
    const token = await result.user.getIdToken()
    const res = await api.post("/auth/login", { id_token: token })
    setUser(res.data)
  }

  const signOut = async () => {
    if (!IS_DEV) {
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
