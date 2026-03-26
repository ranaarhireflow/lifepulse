import axios from "axios"

const IS_DEV = !import.meta.env.VITE_FIREBASE_API_KEY

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api/v1",
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

export default api
