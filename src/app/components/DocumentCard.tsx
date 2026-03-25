import { useState } from "react";
import { FileText, Image, File, Download, Eye, X, ExternalLink } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { formatDateTime } from "@/utils/dateFormatter";

interface DocumentCardProps {
  doc: {
    id: number;
    doc_type: string;
    filename: string;
    file_url: string;
    uploaded_at: string;
  };
}

function getFileIcon(url: string, docType: string) {
  if (/\.(jpg|jpeg|png|gif|webp)$/i.test(url) || url.startsWith("data:image")) {
    return { icon: Image, color: "text-blue-500", bgColor: "bg-blue-50 dark:bg-blue-950/30", label: "Image" };
  }
  if (/\.pdf$/i.test(url) || url.startsWith("data:application/pdf")) {
    return { icon: FileText, color: "text-red-500", bgColor: "bg-red-50 dark:bg-red-950/30", label: "PDF" };
  }
  return { icon: File, color: "text-gray-500", bgColor: "bg-gray-50 dark:bg-gray-950/30", label: docType || "File" };
}

function getFullUrl(url: string) {
  return url.startsWith("http") ? url : `http://localhost:5000${url}`;
}

export function DocumentCard({ doc }: DocumentCardProps) {
  const [viewOpen, setViewOpen] = useState(false);
  const fullUrl = getFullUrl(doc.file_url);
  const { icon: IconComp, color, bgColor, label } = getFileIcon(doc.file_url, doc.doc_type);
  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(doc.file_url) || doc.file_url.startsWith("data:image");
  const isPdf = /\.pdf$/i.test(doc.file_url) || doc.file_url.startsWith("data:application/pdf");
  const dateStr = doc.uploaded_at ? formatDateTime(doc.uploaded_at) : "";

  return (
    <>
      <div className="group flex items-center gap-4 p-4 border border-border rounded-xl hover:shadow-md hover:border-primary/20 transition-all duration-200 bg-card">
        {/* File Icon */}
        <div className={`w-12 h-12 rounded-lg ${bgColor} flex items-center justify-center flex-shrink-0`}>
          <IconComp className={`w-6 h-6 ${color}`} />
        </div>

        {/* File Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">{doc.filename}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">{label}</span>
            {doc.doc_type && doc.doc_type !== label && (
              <span className="text-xs text-muted-foreground">{doc.doc_type}</span>
            )}
            {dateStr && <span className="text-xs text-muted-foreground">• {dateStr}</span>}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {(isImage || isPdf) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewOpen(true)}
              className="gap-1.5 text-xs"
            >
              <Eye className="w-3.5 h-3.5" />
              View
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(fullUrl, "_blank")}
            className="gap-1.5 text-xs"
          >
            <Download className="w-3.5 h-3.5" />
            Download
          </Button>
        </div>
      </div>

      {/* Full-screen Document Viewer Modal */}
      {viewOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setViewOpen(false)}>
          <div className="relative w-full max-w-5xl max-h-[90vh] m-4 bg-card rounded-2xl shadow-2xl overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-muted/50">
              <div className="flex items-center gap-3 min-w-0">
                <IconComp className={`w-5 h-5 ${color} flex-shrink-0`} />
                <span className="text-sm font-semibold truncate">{doc.filename}</span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => window.open(fullUrl, "_blank")} className="gap-1.5 text-xs">
                  <ExternalLink className="w-3.5 h-3.5" />
                  Open in New Tab
                </Button>
                <button
                  onClick={() => setViewOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-accent transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-auto flex items-center justify-center p-4 bg-black/5 dark:bg-black/20">
              {isImage ? (
                <img
                  src={fullUrl}
                  alt={doc.filename}
                  className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-lg"
                />
              ) : isPdf ? (
                <iframe
                  src={`${fullUrl}#toolbar=1`}
                  className="w-full h-[75vh] rounded-lg bg-white"
                  title={doc.filename}
                />
              ) : null}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
