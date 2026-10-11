"use client";

import { Button } from "@/components/ui/Button";

interface ViewerToolbarProps {
  pageNumber: number;
  numPages: number;
  zoom: number;
  onPageChange: (page: number) => void;
  onZoomChange: (zoom: number) => void;
}

export function ViewerToolbar({ pageNumber, numPages, zoom, onPageChange, onZoomChange }: ViewerToolbarProps) {
  return (
    <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-border-subtle bg-surface/95 px-4 py-3 backdrop-blur">
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onPageChange(Math.max(1, pageNumber - 1))}
          disabled={pageNumber <= 1}
        >
          ← Prev
        </Button>
        <span className="text-sm text-foreground/70">
          Page {pageNumber} of {numPages}
        </span>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onPageChange(Math.min(numPages, pageNumber + 1))}
          disabled={pageNumber >= numPages}
        >
          Next →
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => onZoomChange(Math.max(0.5, zoom - 0.2))}>
          −
        </Button>
        <span className="w-12 text-center text-sm">{Math.round(zoom * 100)}%</span>
        <Button variant="ghost" size="sm" onClick={() => onZoomChange(Math.min(2.5, zoom + 0.2))}>
          +
        </Button>
      </div>
      {/* Deliberately no download/print button anywhere in this toolbar. */}
    </div>
  );
}
