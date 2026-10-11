/**
 * Draws a tiled, semi-transparent watermark directly onto the page canvas,
 * after the PDF page itself has been rendered. Because it's baked into the
 * canvas pixels (not a removable DOM overlay), a screenshot/crop will still
 * carry a watermark instance. This is a deterrent/traceability measure, not
 * a technical block — it cannot stop a determined photo-of-screen capture.
 */
export function drawWatermark(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  text: string
) {
  ctx.save();
  ctx.globalAlpha = 0.12;
  ctx.fillStyle = "#4f46e5";
  ctx.font = `${Math.max(14, Math.round(canvasWidth / 28))}px Arial`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const diagonal = Math.sqrt(canvasWidth ** 2 + canvasHeight ** 2);
  const stepY = diagonal / 4;

  ctx.translate(canvasWidth / 2, canvasHeight / 2);
  ctx.rotate(-Math.PI / 6);

  for (let y = -diagonal; y < diagonal; y += stepY) {
    ctx.fillText(text, 0, y);
  }

  ctx.restore();
}

export function buildWatermarkText(fullName: string, email: string, mobile: string | null): string {
  const timestamp = new Date().toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" });
  const contact = mobile ? `${email} | ${mobile}` : email;
  return `${fullName} | ${contact} | ${timestamp}`;
}
