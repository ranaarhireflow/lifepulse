import { useState, useEffect } from "react"
import { NavLink, useNavigate } from "react-router-dom"
import { PulseLogo } from "@/components/common/PulseLogo"
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
  ChevronLeft,
} from "lucide-react"
import { Button } from "@/components/ui/button"
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
  updateTracker,
  type Tracker,
} from "@/services/trackers"
import { ConfigDrawer } from "@/components/common/ConfigDrawer"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

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
  const [editPulse, setEditPulse] = useState<Tracker | null>(null)
  const [editName, setEditName] = useState("")
  const [editIcon, setEditIcon] = useState("")
  const [editColor, setEditColor] = useState("")
  const [editUnit, setEditUnit] = useState("")
  const [editTarget, setEditTarget] = useState("")
  const [editDefault, setEditDefault] = useState("")
  const [saving, setSaving] = useState(false)

  const openEdit = (t: Tracker) => {
    setEditPulse(t)
    setEditName(t.name)
    setEditIcon(t.icon || "📊")
    setEditColor(t.color || "#16A34A")
    setEditUnit(t.unit || "")
    setEditTarget(t.target_value ? String(t.target_value) : "")
    setEditDefault(t.default_behavior)
  }

  const saveEdit = async () => {
    if (!editPulse) return
    setSaving(true)
    try {
      await updateTracker(editPulse.id, {
        name: editName,
        icon: editIcon,
        color: editColor,
        unit: editUnit || null,
        target_value: editTarget ? parseFloat(editTarget) : null,
        default_behavior: editDefault as "CARRY_FORWARD" | "ZERO" | "NULL",
      })
      setEditPulse(null)
      loadTrackers()
    } catch { /* */ }
    finally { setSaving(false) }
  }

  const loadTrackers = async () => {
    setLoading(true)
    try { setTrackers(await fetchTrackers(true)) } catch { setTrackers([]) } finally { setLoading(false) }
  }

  useEffect(() => { loadTrackers() }, [])

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
    <div className="space-y-5 px-5 pt-6 pb-6 max-w-md mx-auto">
      <div className="flex items-center gap-2 mb-4">
        <button onClick={() => navigate(-1)} className="flex items-center justify-center h-8 w-8 rounded-lg hover:bg-accent transition-colors">
          <ChevronLeft className="h-5 w-5 text-muted-foreground" />
        </button>
        <NavLink to="/"><PulseLogo size={28} /></NavLink>
        <div className="flex-1">
          <h1 className="text-[20px] font-bold text-foreground">My Pulses</h1>
          <p className="text-[11px] text-muted-foreground">
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
                      <DropdownMenuItem onClick={() => openEdit(tracker)}>
                        <Pencil className="mr-2 h-4 w-4" />Edit Pulse
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

      {/* Edit drawer */}
      <ConfigDrawer open={!!editPulse} onClose={() => setEditPulse(null)} title="Edit Pulse" description="Update pulse settings">
        {editPulse && (
          <div className="space-y-5">
            {/* Icon + Color */}
            <div className="flex gap-5">
              <div className="flex-1">
                <Label className="text-[12px]">Icon</Label>
                <div className="grid grid-cols-8 gap-1 mt-1.5">
                  {["⚖️","❤️","💧","😴","🌅","👣","🔥","💓","🏋️","🏃","⏱️","📝","🧘","🧠","📖","✍️","📱","🥗","🚫","🙏","😊","💰","🪥","🌙","☕","🎯","💪","✨","🎵","🌿","🍎","📊"].map((i) => (
                    <button key={i} onClick={() => setEditIcon(i)}
                      className={`flex h-8 w-8 items-center justify-center rounded-lg text-[15px] transition-all ${editIcon === i ? "ring-2 ring-primary bg-accent scale-110" : "hover:bg-accent/50"}`}>
                      {i}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-[12px]">Color</Label>
                <div className="grid grid-cols-4 gap-1 mt-1.5">
                  {["#16A34A","#0284C7","#8B5CF6","#D97706","#EC4899","#EF4444","#F59E0B","#14B8A6","#6366F1","#22C55E","#06B6D4","#64748B"].map((c) => (
                    <button key={c} onClick={() => setEditColor(c)}
                      className={`h-7 w-7 rounded-lg transition-all ${editColor === c ? "ring-2 ring-foreground scale-110" : ""}`}
                      style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>
            </div>

            {/* Name */}
            <div>
              <Label className="text-[12px]">Name</Label>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="mt-1" />
            </div>

            {/* Type — read-only (changing type would break existing data) */}
            <div>
              <Label className="text-[12px]">Type</Label>
              <div className="mt-1 rounded-lg border border-border bg-secondary px-3 py-2 text-[13px] font-semibold text-muted-foreground">
                {TYPE_LABELS[editPulse.type] || editPulse.type}
                <span className="text-[10px] ml-2 opacity-50">(cannot change — would break existing data)</span>
              </div>
            </div>

            {/* Unit */}
            <div>
              <Label className="text-[12px]">Unit</Label>
              <Input value={editUnit} onChange={(e) => setEditUnit(e.target.value)} placeholder="e.g. kg, pages, glasses" className="mt-1" />
            </div>

            {/* Target */}
            {editPulse.type !== "BOOLEAN" && editPulse.type !== "TEXT" && (
              <div>
                <Label className="text-[12px]">Daily Target</Label>
                <Input type="number" value={editTarget} onChange={(e) => setEditTarget(e.target.value)} placeholder="Optional" className="mt-1" />
              </div>
            )}

            {/* Default */}
            <div>
              <Label className="text-[12px]">When Not Logged</Label>
              <Select value={editDefault} onValueChange={(v) => v && setEditDefault(v)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="NULL">Leave empty</SelectItem>
                  <SelectItem value="ZERO">Default to 0</SelectItem>
                  <SelectItem value="CARRY_FORWARD">Use yesterday's value</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={saveEdit} disabled={!editName.trim() || saving} className="w-full mt-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save Changes
            </Button>
          </div>
        )}
      </ConfigDrawer>

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
