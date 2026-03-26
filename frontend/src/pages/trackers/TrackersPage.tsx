import { useState, useEffect } from "react"
import { NavLink, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutGrid,
  Archive,
  ArchiveRestore,
  Trash2,
  Loader2,
  MoreVertical,
  Pencil,
  Bell,
  BellOff,
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
  DUAL_NUMERIC: "Dual",
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
    try { setTrackers(await fetchTrackers(showArchived)) } catch { setTrackers([]) } finally { setLoading(false) }
  }

  useEffect(() => { loadTrackers() }, [showArchived])

  const handleArchive = async (tracker: Tracker) => {
    try {
      tracker.archived ? await unarchiveTracker(tracker.id) : await archiveTracker(tracker.id)
      loadTrackers()
    } catch { /* */ }
  }

  const handleDelete = async () => {
    if (!deleteConfirm) return
    try { await deleteTracker(deleteConfirm.id); setDeleteConfirm(null); loadTrackers() } catch { /* */ }
  }

  const activeTrackers = trackers.filter((t) => !t.archived)
  const archivedTrackers = trackers.filter((t) => t.archived)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[24px] font-extrabold tracking-tight">My Pulses</h1>
          <p className="text-[12px] text-muted-foreground">
            {activeTrackers.length} active{archivedTrackers.length > 0 && ` · ${archivedTrackers.length} archived`}
          </p>
        </div>
        {trackers.some((t) => t.archived) && (
          <Button variant="ghost" size="sm" onClick={() => setShowArchived(!showArchived)} className="gap-1.5 text-xs">
            <Archive className="h-3.5 w-3.5" />
            {showArchived ? "Hide Archived" : "Show Archived"}
          </Button>
        )}
      </div>

      {loading && <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>}

      {!loading && trackers.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <LayoutGrid className="h-8 w-8 text-primary mb-3" />
          <h3 className="text-lg font-bold">No pulses yet</h3>
          <p className="mb-4 text-sm text-muted-foreground">Create pulses from templates or build your own.</p>
          <NavLink to="/trackers/new"><Button className="gap-2">Create Your First Pulse</Button></NavLink>
        </div>
      )}

      {!loading && activeTrackers.length > 0 && (
        <div className="space-y-[6px]">
          <AnimatePresence>
            {activeTrackers.map((tracker, i) => (
              <motion.div
                key={tracker.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ delay: i * 0.03 }}
              >
                <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 transition-all hover:border-primary/20 hover:shadow-sm">
                  <div className="flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-[11px] bg-accent text-[18px]">
                    {tracker.icon || "📊"}
                  </div>
                  <div className="min-w-0 flex-1 cursor-pointer" onClick={() => navigate(`/trackers/${tracker.id}`)}>
                    <p className="truncate text-[13px] font-bold">{tracker.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant="secondary" className="text-[9px] px-1.5 py-0 font-semibold">
                        {TYPE_LABELS[tracker.type] || tracker.type}
                      </Badge>
                      {tracker.unit && <span className="text-[10px] text-muted-foreground">{tracker.unit}</span>}
                      {/* Alert indicator */}
                      {tracker.alerts && tracker.alerts.length > 0 ? (
                        <span className="flex items-center gap-0.5 text-[10px] text-primary">
                          <Bell className="h-3 w-3" />
                          {tracker.alerts.length}
                        </span>
                      ) : (
                        <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground/40">
                          <BellOff className="h-3 w-3" />
                        </span>
                      )}
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <div className="inline-flex items-center justify-center rounded-lg h-8 w-8 hover:bg-accent transition-colors">
                        <MoreVertical className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => navigate(`/trackers/${tracker.id}`)}>
                        <Pencil className="mr-2 h-4 w-4" />View & Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate(`/trackers/${tracker.id}`)}>
                        <Bell className="mr-2 h-4 w-4" />Configure Alerts
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleArchive(tracker)}>
                        <Archive className="mr-2 h-4 w-4" />Archive
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setDeleteConfirm(tracker)} className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Archived */}
      {!loading && showArchived && archivedTrackers.length > 0 && (
        <div className="space-y-[6px]">
          <h2 className="text-[11px] font-bold uppercase tracking-[1.5px] text-muted-foreground mb-2">Archived</h2>
          {archivedTrackers.map((tracker) => (
            <div key={tracker.id} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 opacity-50">
              <div className="flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-[11px] bg-muted text-[18px]">
                {tracker.icon || "📊"}
              </div>
              <p className="flex-1 truncate text-[13px] font-bold">{tracker.name}</p>
              <Button variant="ghost" size="sm" onClick={() => handleArchive(tracker)} className="gap-1.5 text-xs">
                <ArchiveRestore className="h-3.5 w-3.5" />Restore
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirm */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Pulse</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deleteConfirm?.name}"? All entries and data will be deactivated (not permanently deleted for 7 days).
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
