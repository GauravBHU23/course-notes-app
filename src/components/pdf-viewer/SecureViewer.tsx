"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { ViewerToolbar } from "@/components/pdf-viewer/ViewerToolbar";
import { PdfCanvasPage } from "@/components/pdf-viewer/PdfCanvasPage";
import { buildWatermarkText } from "@/components/pdf-viewer/WatermarkOverlay";

interface SecureViewerProps {
  pdfId: string;
  viewer: { fullName: string; email: string; mobile: string | null };
}

type LoadState = "loading" | "ready" | "error";

/**
 * Orchestrates: request a fresh single-use token -> fetch the byte stream
 * with it -> hand the bytes to pdf.js -> render via PdfCanvasPage. Also
 * installs the global shortcut/context-menu blockers for the lifetime of
 * the viewer. PrintScreen/camera capture cannot be blocked from a webpage;
 * the watermark (not these listeners) is the real deterrent for that case.
 */
export function SecureViewer({ pdfId, viewer }: SecureViewerProps) {
  const [state, setState] = useState<LoadState>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [zoom, setZoom] = useState(1.1);
  const watermarkText = useRef(buildWatermarkText(viewer.fullName, viewer.email, viewer.mobile));

  const loadPdf = useCallback(async () => {
    setState("loading");
    setErrorMessage(null);
    try {
      const tokenRes = await fetch(`/api/pdf/${pdfId}/token`, { method: "POST" });
      const tokenData = await tokenRes.json();
      if (!tokenRes.ok) {
        setErrorMessage(tokenData.error ?? "Could not load this PDF.");
        setState("error");
        return;
      }

      const streamRes = await fetch(`/api/pdf/stream?token=${encodeURIComponent(tokenData.token)}`);
      if (!streamRes.ok) {
        const data = await streamRes.json().catch(() => ({}));
        setErrorMessage(data.error ?? "Could not load this PDF.");
        setState("error");
        return;
      }
      const bytes = await streamRes.arrayBuffer();

      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
        "pdfjs-dist/build/pdf.worker.min.mjs",
        import.meta.url
      ).toString();

      const doc = await pdfjsLib.getDocument({ data: bytes }).promise;
      setPdfDoc(doc);
      setPageNumber(1);
      setState("ready");
    } catch {
      setErrorMessage("Something went wrong while loading this PDF. Please try again.");
      setState("error");
    }
  }, [pdfId]);

  useEffect(() => {
    loadPdf();
  }, [loadPdf]);

  useEffect(() => {
    function blockContextMenu(e: MouseEvent) {
      e.preventDefault();
    }
    function blockShortcuts(e: KeyboardEvent) {
      const blockedCombos =
        (e.ctrlKey && ["p", "s"].includes(e.key.toLowerCase())) ||
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && ["i", "j", "c"].includes(e.key.toLowerCase()));
      if (blockedCombos) e.preventDefault();
    }

    document.addEventListener("contextmenu", blockContextMenu);
    document.addEventListener("keydown", blockShortcuts);
    return () => {
      document.removeEventListener("contextmenu", blockContextMenu);
      document.removeEventListener("keydown", blockShortcuts);
    };
  }, []);

  if (state === "loading") {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-64 w-48 rounded-lg skeleton-shimmer" />
      </div>
    );
  }

  if (state === "error" || !pdfDoc) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-3 text-center">
        <p className="text-sm text-red-600">{errorMessage}</p>
        <button onClick={loadPdf} className="text-sm text-brand-600 hover:underline">
          Try again
        </button>
      </div>
    );
  }

  return (
    <div>
      <ViewerToolbar
        pageNumber={pageNumber}
        numPages={pdfDoc.numPages}
        zoom={zoom}
        onPageChange={setPageNumber}
        onZoomChange={setZoom}
      />
      <div className="overflow-auto bg-slate-100 p-6">
        <PdfCanvasPage
          pdfDoc={pdfDoc}
          pageNumber={pageNumber}
          zoom={zoom}
          watermarkText={watermarkText.current}
        />
      </div>
    </div>
  );
}
