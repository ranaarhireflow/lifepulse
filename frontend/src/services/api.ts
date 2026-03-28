import axios from "axios"

const IS_DEV = !import.meta.env.VITE_FIREBASE_API_KEY

// Detect Capacitor native app
const isNative = !!(window as any).Capacitor?.isNativePlatform()

// API base URL
const PRODUCTION_API = "https://lifepulse-production.up.railway.app/api/v1"
const baseURL = isNative
  ? PRODUCTION_API
  : (import.meta.env.VITE_API_URL || "/api/v1")

const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000, // 15 second timeout
})

// Wait for Firebase auth to be ready (resolves with token or null)
async function getAuthToken(): Promise<string | null> {
  if (IS_DEV) return null

  try {
    const { auth } = await import("@/lib/firebase")

    // If user is already available, get token immediately
    if (auth.currentUser) {
      return await auth.currentUser.getIdToken()
    }

    // Wait up to 3 seconds for auth to settle (after login/redirect)
    return new Promise((resolve) => {
      const unsub = auth.onAuthStateChanged(async (user) => {
        unsub()
        if (user) {
          resolve(await user.getIdToken())
        } else {
          resolve(null)
        }
      })
      // Don't wait forever
      setTimeout(() => resolve(null), 3000)
    })
  } catch {
    return null
  }
}

// Attach auth token to every request
api.interceptors.request.use(async (config) => {
  if (IS_DEV) {
    config.headers["X-Dev-Mode"] = "true"
    return config
  }

  const token = await getAuthToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api
