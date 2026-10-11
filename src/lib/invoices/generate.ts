import "server-only";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export interface InvoiceData {
  invoiceNumber: string;
  purchaseDate: Date;
  customerName: string;
  customerEmail: string;
  bundleTitle: string;
  amountInr: number;
  accessStartsAt: Date;
  accessExpiresAt: Date;
  cashfreeOrderId: string;
}

export async function generateInvoicePdf(data: InvoiceData): Promise<Buffer> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([595.28, 841.89]); // A4
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  const brand = rgb(0.31, 0.27, 0.9); // ~#4f46e5
  const gray = rgb(0.4, 0.45, 0.5);
  const dark = rgb(0.1, 0.12, 0.18);

  let y = 780;
  const left = 50;

  page.drawText("Course and Notes", { x: left, y, size: 20, font: bold, color: brand });
  page.drawText("Purchasing App", { x: left, y: y - 20, size: 11, font, color: gray });
  page.drawText("TAX INVOICE", { x: 420, y, size: 14, font: bold, color: dark });
  y -= 44;
  page.drawLine({ start: { x: left, y }, end: { x: 545, y }, thickness: 1, color: gray });

  y -= 30;
  page.drawText(`Invoice Number: ${data.invoiceNumber}`, { x: left, y, size: 11, font, color: dark });
  y -= 18;
  page.drawText(`Date: ${data.purchaseDate.toLocaleDateString("en-IN")}`, { x: left, y, size: 11, font, color: dark });
  y -= 18;
  page.drawText(`Order ID: ${data.cashfreeOrderId}`, { x: left, y, size: 11, font, color: dark });

  y -= 40;
  page.drawText("Billed To", { x: left, y, size: 12, font: bold, color: dark });
  y -= 18;
  page.drawText(data.customerName, { x: left, y, size: 11, font, color: dark });
  y -= 16;
  page.drawText(data.customerEmail, { x: left, y, size: 11, font, color: gray });

  y -= 40;
  page.drawRectangle({ x: left, y: y - 4, width: 495, height: 28, color: rgb(0.93, 0.94, 0.99) });
  page.drawText("Description", { x: left + 10, y, size: 11, font: bold, color: dark });
  page.drawText("Amount", { x: 480, y, size: 11, font: bold, color: dark });

  y -= 36;
  page.drawText(data.bundleTitle, { x: left + 10, y, size: 11, font, color: dark });
  page.drawText(`Rs. ${data.amountInr}`, { x: 470, y, size: 11, font, color: dark });

  y -= 16;
  page.drawText(
    `Access valid: ${data.accessStartsAt.toLocaleDateString("en-IN")} - ${data.accessExpiresAt.toLocaleDateString("en-IN")}`,
    { x: left + 10, y, size: 9, font, color: gray }
  );

  y -= 40;
  page.drawLine({ start: { x: left, y }, end: { x: 545, y }, thickness: 1, color: gray });
  y -= 24;
  page.drawText("Total Paid", { x: left + 300, y, size: 12, font: bold, color: dark });
  page.drawText(`Rs. ${data.amountInr}`, { x: left + 420, y, size: 12, font: bold, color: brand });

  page.drawText(
    "This is a system-generated invoice. For queries, contact support via WhatsApp/Telegram in your dashboard.",
    { x: left, y: 60, size: 8, font, color: gray }
  );

  const bytes = await doc.save();
  return Buffer.from(bytes);
}
