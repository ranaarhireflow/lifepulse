import { useState, useEffect } from "react"
import { NavLink, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  Plus,
  LayoutGrid,
  Archive,
  ArchiveRestore,
  Trash2,
  Loader2,
  MoreVertical,
  Pencil,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  fetchTrackers,
  archiveTracker,
  unarchiveTracker,
  deleteTracker,
  type Tracker,
} from "@/services/trackers"

const TYPE_LABELS: Record<string, string> = {
  NUMERIC: "Number",
  DUAL_NUMERIC: "Dual Number",
  BOOLEAN: "Yes/No",
  DURATION: "Duration",
  TIME: "Time",
  TEXT: "Notes",
}

export function TrackersPage() {
  const navigate = useNavigate()
  const [trackers, setTrackers] = useState<Tracker[]>([])
  const [loading, setLoading] = useState(true)
  const [showArchived, setShowArchived] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<Tracker | null>(null)

  const loadTrackers = async () => {
    setLoading(true)
    try {
      const data = await fetchTrackers(showArchived)
      setTrackers(data)
    } catch {
      setTrackers([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTrackers()
  }, [showArchived])

  const handleArchive = async (tracker: Tracker) => {
    try {
      if (tracker.archived) {
        await unarchiveTracker(tracker.id)
      } else {
        await archiveTracker(tracker.id)
      }
      loadTrackers()
    } catch {
      alert("Failed to update tracker")
    }
  }

  const handleDelete = async () => {
    if (!deleteConfirm) return
    try {
      await deleteTracker(deleteConfirm.id)
      setDeleteConfirm(null)
      loadTrackers()
    } catch {
      alert("Failed to delete tracker")
    }
  }

  const activeTrackers = trackers.filter((t) => !t.archived)
  const archivedTrackers = trackers.filter((t) => t.archived)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Trackers</h1>
          <p className="text-sm text-muted-foreground">
            {activeTrackers.length} active
            {archivedTrackers.length > 0 &&
              ` · ${archivedTrackers.length} archived`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {trackers.some((t) => t.archived) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowArchived(!showArchived)}
              className="gap-1.5 text-xs"
            >
              <Archive className="h-3.5 w-3.5" />
              {showArchived ? "Hide Archived" : "Show Archived"}
            </Button>
          )}
          <NavLink to="/trackers/new">
            <Button className="gap-2" size="sm">
              <Plus className="h-4 w-4" />
              New
            </Button>
          </NavLink>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {!loading && trackers.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border p-12 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
            <LayoutGrid className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-semibold">No trackers yet</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            Create trackers from templates or build your own.
          </p>
          <NavLink to="/trackers/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create Your First Tracker
            </Button>
          </NavLink>
        </div>
      )}

      {!loading && activeTrackers.length > 0 && (
        <div className="space-y-2">
          <AnimatePresence>
            {activeTrackers.map((tracker, i) => (
              <motion.div
                key={tracker.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ delay: i * 0.03 }}
              >
                <Card className="transition-shadow hover:shadow-sm">
                  <CardContent className="flex items-center gap-4 p-3">
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl"
                      style={{
                        backgroundColor: `${tracker.color || "#6366f1"}12`,
                      }}
                    >
                      {tracker.icon || "📊"}
                    </div>
                    <div
                      className="min-w-0 flex-1 cursor-pointer"
                      onClick={() => navigate(`/trackers/${tracker.id}`)}
                    >
                      <p className="truncate font-medium">{tracker.name}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                          {TYPE_LABELS[tracker.type] || tracker.type}
                        </Badge>
                        {tracker.unit && (
                          <span className="text-xs text-muted-foreground">
                            {tracker.unit}
                          </span>
                        )}
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <div className="inline-flex items-center justify-center rounded-md h-8 w-8 hover:bg-accent hover:text-accent-foreground transition-colors">
                          <MoreVertical className="h-4 w-4" />
                        </div>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => navigate(`/trackers/${tracker.id}`)}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          View & Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleArchive(tracker)}
                        >
                          <Archive className="mr-2 h-4 w-4" />
                          Archive
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => setDeleteConfirm(tracker)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Archived section */}
      {!loading && showArchived && archivedTrackers.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Archived
          </h2>
          {archivedTrackers.map((tracker) => (
            <Card key={tracker.id} className="opacity-60">
              <CardContent className="flex items-center gap-4 p-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted text-xl">
                  {tracker.icon || "📊"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{tracker.name}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleArchive(tracker)}
                  className="gap-1.5"
                >
                  <ArchiveRestore className="h-3.5 w-3.5" />
                  Restore
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Tracker</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deleteConfirm?.name}"? This will
              permanently remove all entries and analytics data. This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
