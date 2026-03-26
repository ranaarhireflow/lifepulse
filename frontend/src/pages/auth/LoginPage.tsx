import { useState } from "react"
import { Navigate } from "react-router-dom"
import { motion } from "framer-motion"
import { useAuth } from "@/store/auth-context"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Loader2, BarChart3, Target, Flame, Bell } from "lucide-react"

const FEATURES = [
  { icon: Target, label: "Track anything", desc: "Weight, habits, books, water, workouts" },
  { icon: BarChart3, label: "See your trends", desc: "Charts, heatmaps, streaks, analytics" },
  { icon: Bell, label: "Smart reminders", desc: "Custom alerts per tracker" },
  { icon: Flame, label: "Build streaks", desc: "Don't break the chain" },
]

export function LoginPage() {
  const { user, loading, signInWithGoogle } = useAuth()
  const [signingIn, setSigningIn] = useState(false)

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-bold text-2xl animate-pulse">
            T
          </div>
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </motion.div>
      </div>
    )
  }

  if (user) return <Navigate to="/" replace />

  const handleSignIn = async () => {
    setSigningIn(true)
    try {
      await signInWithGoogle()
    } catch {
      setSigningIn(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-2xl border-0 bg-card/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-2">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
              className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-primary to-purple-600 text-white font-bold text-3xl shadow-lg shadow-primary/30"
            >
              T
            </motion.div>
            <CardTitle className="text-3xl font-bold tracking-tight">
              myTracker
            </CardTitle>
            <CardDescription className="text-base">
              Track anything. See your progress.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Features */}
            <div className="grid grid-cols-2 gap-3">
              {FEATURES.map((f, i) => (
                <motion.div
                  key={f.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="rounded-xl bg-accent/50 p-3 text-center"
                >
                  <f.icon className="mx-auto mb-1.5 h-5 w-5 text-primary" />
                  <p className="text-xs font-semibold">{f.label}</p>
                  <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">
                    {f.desc}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Sign in button */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <Button
                onClick={handleSignIn}
                disabled={signingIn}
                className="w-full gap-3 h-12 text-base shadow-md"
                variant="outline"
              >
                {signingIn ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                )}
                {signingIn ? "Signing in..." : "Continue with Google"}
              </Button>
            </motion.div>

            <p className="text-center text-[11px] text-muted-foreground leading-relaxed">
              Free forever. No subscriptions. No ads.
              <br />
              Your data stays private and secure.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
