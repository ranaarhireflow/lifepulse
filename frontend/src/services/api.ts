import axios from "axios"

const IS_DEV = !import.meta.env.VITE_FIREBASE_API_KEY

// Detect Capacitor native app
const isNative = !!(window as any).Capacitor?.isNativePlatform()

// API base URL:
// - Native app (Capacitor): use Railway backend directly
// - Web with VITE_API_URL set: use that (Railway deploy)
// - Web dev (localhost): use /api/v1 proxy (Vite handles it)
const PRODUCTION_API = "https://lifepulse-production.up.railway.app/api/v1"

const baseURL = isNative
  ? PRODUCTION_API
  : (import.meta.env.VITE_API_URL || "/api/v1")

const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
})

// Attach Firebase auth token to every request (only when Firebase is configured)
api.interceptors.request.use(async (config) => {
  if (IS_DEV) {
    config.headers["X-Dev-Mode"] = "true"
    return config
  }

  try {
    const { auth } = await import("@/lib/firebase")
    const user = auth.currentUser
    if (user) {
      const token = await user.getIdToken()
      config.headers.Authorization = `Bearer ${token}`
    }
  } catch {
    // Firebase not initialized
  }
  return config
})

// Retry once on 401 — handles race where Firebase token isn't ready yet after login
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !error.config._retried) {
      error.config._retried = true
      // Wait for auth to settle
      await new Promise(r => setTimeout(r, 1000))
      return api(error.config)
    }
    return Promise.reject(error)
  }
)

export default api
