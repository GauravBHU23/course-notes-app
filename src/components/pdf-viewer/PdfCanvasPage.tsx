"use client";

import { useEffect, useRef } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { drawWatermark } from "@/components/pdf-viewer/WatermarkOverlay";

interface PdfCanvasPageProps {
  pdfDoc: PDFDocumentProxy;
  pageNumber: number;
  zoom: number;
  watermarkText: string;
}

export function PdfCanvasPage({ pdfDoc, pageNumber, zoom, watermarkText }: PdfCanvasPageProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const renderTaskRef = useRef<ReturnType<import("pdfjs-dist").PDFPageProxy["render"]> | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function render() {
      const page = await pdfDoc.getPage(pageNumber);
      if (cancelled) return;

      const viewport = page.getViewport({ scale: zoom });
      const canvas = canvasRef.current;
      if (!canvas) return;

      const context = canvas.getContext("2d");
      if (!context) return;

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      renderTaskRef.current?.cancel();
      const task = page.render({ canvasContext: context, viewport, canvas });
      renderTaskRef.current = task;

      try {
        await task.promise;
      } catch (err) {
        if ((err as { name?: string })?.name === "RenderingCancelledException") return;
        throw err;
      }
      if (cancelled) return;

      // Baked into the canvas pixels after render, not a DOM overlay.
      drawWatermark(context, canvas.width, canvas.height, watermarkText);
    }

    render();

    return () => {
      cancelled = true;
      renderTaskRef.current?.cancel();
    };
  }, [pdfDoc, pageNumber, zoom, watermarkText]);

  return (
    <canvas
      ref={canvasRef}
      className="no-select mx-auto block rounded-lg shadow-md"
      onContextMenu={(e) => e.preventDefault()}
    />
  );
}
