import { useState } from "react"
import { Navigate } from "react-router-dom"
import { motion } from "framer-motion"
import { useAuth } from "@/store/auth-context"
import { BRAND } from "@/lib/brand"
import { PulseLogo } from "@/components/common/PulseLogo"
import { Button } from "@/components/ui/button"
import { Loader2, Activity, TrendingUp, Bell, Flame } from "lucide-react"

const FEATURES = [
  { icon: Activity, label: "Track Anything", desc: "Weight, habits, water, workouts, sleep, reading", color: "#16A34A" },
  { icon: TrendingUp, label: "See Your Trends", desc: "Charts, heatmaps, streaks, and detailed analytics", color: "#0284C7" },
  { icon: Bell, label: "Smart Reminders", desc: "Multiple daily alerts per pulse — never miss a log", color: "#D97706" },
  { icon: Flame, label: "Build Streaks", desc: "Stay consistent. Track habits. Achieve monk mode.", color: "#EA580C" },
]

export function LoginPage() {
  const { user, loading, signInWithGoogle } = useAuth()
  const [signingIn, setSigningIn] = useState(false)

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <PulseLogo size={64} className="animate-pulse" />
          <Loader2 className="h-5 w-5 animate-spin text-[#22C55E]" />
        </motion.div>
      </div>
    )
  }

  if (user) return <Navigate to="/" replace />

  const [error, setError] = useState<string | null>(null)

  const handleSignIn = async () => {
    setSigningIn(true)
    setError(null)
    try {
      await signInWithGoogle()
    } catch (e: any) {
      setError(e?.message || String(e) || "Sign-in failed")
      setSigningIn(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left: Brand */}
      <div className="hidden lg:flex lg:flex-1 items-center justify-center p-12">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
          >
            <PulseLogo size={72} />
          </motion.div>

          <h1 className="mt-8 text-5xl font-extrabold tracking-tight text-foreground">
            {BRAND.name}
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            {BRAND.description}
          </p>

          <div className="mt-12 space-y-5">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="flex items-start gap-4"
              >
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                  style={{ backgroundColor: `${f.color}20` }}
                >
                  <f.icon className="h-5 w-5" style={{ color: f.color }} />
                </div>
                <div>
                  <p className="font-bold text-sm text-foreground">{f.label}</p>
                  <p className="text-sm text-muted-foreground">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right: Login */}
      <div className="flex flex-1 items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-sm"
        >
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-10">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="mx-auto"
            >
              <PulseLogo size={72} className="mx-auto" />
            </motion.div>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-foreground">
              {BRAND.name}
            </h1>
            <p className="mt-1 text-muted-foreground">{BRAND.description}</p>
          </div>

          {/* Login card */}
          <div className="rounded-2xl border border-border bg-card backdrop-blur-sm p-8">
            <h2 className="text-xl font-bold text-center text-white mb-1">Welcome</h2>
            <p className="text-sm text-muted-foreground text-center mb-8">
              Sign in to start tracking your life
            </p>

            <Button
              onClick={handleSignIn}
              disabled={signingIn}
              className="w-full gap-3 h-12 text-base rounded-xl bg-primary text-primary-foreground hover:bg-white/90 font-bold"
            >
              {signingIn ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              )}
              {signingIn ? "Signing in..." : "Continue with Google"}
            </Button>

            {/* Mobile features */}
            <div className="lg:hidden mt-8 grid grid-cols-2 gap-3">
              {FEATURES.map((f, i) => (
                <motion.div
                  key={f.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.08 }}
                  className="rounded-xl bg-card p-3 text-center"
                >
                  <f.icon className="mx-auto mb-1 h-4 w-4" style={{ color: f.color }} />
                  <p className="text-[11px] font-bold text-foreground/80">{f.label}</p>
                </motion.div>
              ))}
            </div>

            <p className="text-center text-[11px] text-muted-foreground/60 mt-6 leading-relaxed">
              {error && (
                <span className="block text-destructive text-[11px] font-bold mb-2 bg-destructive/10 rounded-lg p-2">{error}</span>
              )}
              Free forever. No subscriptions. No ads.
              <br />
              Your data stays private and secure.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
