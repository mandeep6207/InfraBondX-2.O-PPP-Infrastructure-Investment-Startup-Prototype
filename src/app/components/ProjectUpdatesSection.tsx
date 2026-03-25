import { useState, useEffect } from "react";
import {
  PlayCircle,
  Image as ImageIcon,
  MapPin,
  Activity,
  Clock,
  Camera,
  Video,
  FileText,
  ChevronDown,
  ChevronUp,
  Maximize2,
  X,
  HardHat,
  Truck,
  Ruler,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { apiGet } from "@/app/services/api";
import { formatDateTime } from "@/utils/dateFormatter";

interface ProjectUpdatesSectionProps {
  projectId: number;
}

type ProjectUpdateDTO = {
  id: number;
  project_id: number;
  media_type: string;
  media_url?: string;
  description: string;
  latitude?: number;
  longitude?: number;
  timestamp: string;
};

/* ── Construction-themed SVG icons ────────────────────────────────── */
function CraneIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M6 22V4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v18" />
      <path d="M6 8h14a1 1 0 0 1 .8 1.6L16 16" />
      <path d="M16 16v6" />
      <path d="M2 22h20" />
    </svg>
  );
}

function BlueprintIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18" />
      <path d="M9 3v18" />
      <circle cx="15" cy="15" r="2" />
    </svg>
  );
}

const MEDIA_CONFIGS: Record<string, { bg: string; text: string; icon: typeof Camera; label: string }> = {
  IMAGE: { bg: "bg-blue-500", text: "text-white", icon: Camera, label: "Photo Update" },
  VIDEO: { bg: "bg-purple-500", text: "text-white", icon: Video, label: "Video Update" },
  TEXT:  { bg: "bg-amber-500", text: "text-white", icon: FileText, label: "Activity Note" },
};

export function ProjectUpdatesSection({ projectId }: ProjectUpdatesSectionProps) {
  const [updates, setUpdates] = useState<ProjectUpdateDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(true);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const fetchUpdates = async () => {
      try {
        setLoading(true);
        const res = await apiGet(`/projects/${projectId}/updates`);
        if (res && !res.error && Array.isArray(res)) {
          setUpdates(res);
        }
      } catch (err) {
        console.error("Failed to load updates", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUpdates();
  }, [projectId]);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <HardHat className="w-8 h-8 text-primary animate-bounce" />
            </div>
            <p className="text-sm font-medium">Loading construction updates...</p>
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <div key={i} className="w-2 h-2 rounded-full bg-primary/40 animate-pulse" style={{ animationDelay: `${i * 200}ms` }} />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (updates.length === 0) {
    return (
      <Card>
        <CardContent className="p-10 flex flex-col items-center justify-center text-muted-foreground bg-muted/20 border-dashed border-2 m-4 rounded-xl">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
            <CraneIcon className="w-8 h-8 text-slate-300" />
          </div>
          <p className="font-semibold text-sm">No construction updates yet</p>
          <p className="text-xs mt-1 max-w-xs text-center">
            The issuer hasn't posted any timeline updates. Check back soon for photos, videos and progress notes.
          </p>
        </CardContent>
      </Card>
    );
  }

  const sorted = [...updates].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  const visible = showAll ? sorted : sorted.slice(0, 5);

  const stats = {
    images: updates.filter((u) => u.media_type === "IMAGE").length,
    videos: updates.filter((u) => u.media_type === "VIDEO").length,
    notes: updates.filter((u) => u.media_type === "TEXT").length,
  };

  function resolveUrl(url: string) {
    return url.startsWith("http") ? url : `http://localhost:5000${url}`;
  }

  return (
    <>
      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setLightbox(null)}
        >
          <button className="absolute top-4 right-4 text-white/80 hover:text-white" onClick={() => setLightbox(null)}>
            <X className="w-6 h-6" />
          </button>
          <img src={lightbox} alt="Full view" className="max-w-full max-h-[90vh] rounded-lg shadow-2xl" />
        </div>
      )}

      <Card className="overflow-hidden">
        {/* Header with stats */}
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <HardHat className="w-4 h-4 text-primary" />
              </div>
              <div>
                <span className="text-base">Construction Timeline</span>
                <span className="text-xs text-muted-foreground font-normal ml-2">
                  {updates.length} update{updates.length !== 1 ? "s" : ""}
                </span>
              </div>
            </CardTitle>
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1.5 rounded-md hover:bg-accent transition-colors text-muted-foreground"
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {/* Mini stats bar */}
          {expanded && (
            <div className="flex gap-4 mt-3">
              {stats.images > 0 && (
                <div className="flex items-center gap-1.5 text-xs text-blue-600">
                  <Camera className="w-3.5 h-3.5" />
                  <span className="font-medium">{stats.images}</span> photos
                </div>
              )}
              {stats.videos > 0 && (
                <div className="flex items-center gap-1.5 text-xs text-purple-600">
                  <Video className="w-3.5 h-3.5" />
                  <span className="font-medium">{stats.videos}</span> videos
                </div>
              )}
              {stats.notes > 0 && (
                <div className="flex items-center gap-1.5 text-xs text-amber-600">
                  <FileText className="w-3.5 h-3.5" />
                  <span className="font-medium">{stats.notes}</span> notes
                </div>
              )}
            </div>
          )}
        </CardHeader>

        {expanded && (
          <CardContent className="pt-2">
            {/* Timeline */}
            <div className="relative ml-5">
              {/* Vertical line */}
              <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/30 via-primary/20 to-transparent" />

              <div className="space-y-1">
                {visible.map((update, idx) => {
                  const cfg = MEDIA_CONFIGS[update.media_type] || MEDIA_CONFIGS.TEXT;
                  const Icon = cfg.icon;
                  const isFirst = idx === 0;

                  return (
                    <div key={update.id} className="relative pl-8 pb-5 group">
                      {/* Timeline dot */}
                      <div
                        className={`absolute left-0 -translate-x-1/2 w-8 h-8 rounded-full ${cfg.bg} ${cfg.text} flex items-center justify-center shadow-md ring-4 ring-white transition-transform group-hover:scale-110`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>

                      {/* Content card */}
                      <div
                        className={`rounded-xl border bg-white p-4 shadow-sm hover:shadow-md transition-all ${
                          isFirst ? "ring-1 ring-primary/20" : ""
                        }`}
                      >
                        {/* Top bar */}
                        <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}
                            >
                              {cfg.label}
                            </span>
                            {isFirst && (
                              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-green-500 text-white">
                                Latest
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {update.latitude != null && update.longitude != null && (
                              <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded">
                                <MapPin className="w-2.5 h-2.5" />
                                {update.latitude.toFixed(4)}, {update.longitude.toFixed(4)}
                              </span>
                            )}
                            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDateTime(update.timestamp)}
                            </span>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-sm text-slate-700 leading-relaxed">{update.description}</p>

                        {/* Media */}
                        {update.media_url && update.media_type === "IMAGE" && (
                          <div className="mt-3 rounded-lg overflow-hidden border relative group/img cursor-pointer" onClick={() => setLightbox(resolveUrl(update.media_url!))}>
                            <img
                              src={resolveUrl(update.media_url)}
                              alt="Construction progress"
                              className="w-full object-cover max-h-56 transition-transform group-hover/img:scale-[1.02]"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/10 transition-colors flex items-center justify-center">
                              <Maximize2 className="w-6 h-6 text-white opacity-0 group-hover/img:opacity-80 transition-opacity drop-shadow-lg" />
                            </div>
                          </div>
                        )}

                        {update.media_url && update.media_type === "VIDEO" && (
                          <div className="mt-3 rounded-lg overflow-hidden border bg-slate-900">
                            <video
                              src={resolveUrl(update.media_url)}
                              className="w-full max-h-56"
                              controls
                              preload="metadata"
                              poster=""
                            />
                          </div>
                        )}

                        {/* Date detail */}
                        <div className="mt-2 text-[10px] text-muted-foreground">
                          {formatDateTime(update.timestamp)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Show more / less */}
              {sorted.length > 5 && (
                <div className="pl-8 pt-2">
                  <button
                    onClick={() => setShowAll(!showAll)}
                    className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
                  >
                    {showAll ? (
                      <>
                        <ChevronUp className="w-3 h-3" /> Show less
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-3 h-3" /> Show all {sorted.length} updates
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Card>
    </>
  );
}
