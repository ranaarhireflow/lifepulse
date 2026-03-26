import { BrowserRouter, Routes, Route } from "react-router-dom"
import { TooltipProvider } from "@/components/ui/tooltip"
import { AuthProvider } from "@/store/auth-context"
import { ProtectedRoute } from "@/components/common/ProtectedRoute"
import { ErrorBoundary } from "@/components/common/ErrorBoundary"
import { AppLayout } from "@/components/layout/AppLayout"
import { LoginPage } from "@/pages/auth/LoginPage"
import { DailyPage } from "@/pages/dashboard/DailyPage"
import { TrackersPage } from "@/pages/trackers/TrackersPage"
import { TrackerCreatePage } from "@/pages/trackers/TrackerCreatePage"
import { TrackerDetailPage } from "@/pages/trackers/TrackerDetailPage"
import { AnalyticsPage } from "@/pages/analytics/AnalyticsPage"
import { SettingsPage } from "@/pages/settings/SettingsPage"

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <TooltipProvider>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<DailyPage />} />
                <Route path="trackers" element={<TrackersPage />} />
                <Route path="trackers/new" element={<TrackerCreatePage />} />
                <Route path="trackers/:id" element={<TrackerDetailPage />} />
                <Route path="analytics" element={<AnalyticsPage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>
            </Routes>
          </TooltipProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  )
}
