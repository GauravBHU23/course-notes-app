import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export async function nextInvoiceNumber(): Promise<string> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc("generate_invoice_number");
  if (error || !data) {
    throw new Error(`Failed to generate invoice number: ${error?.message}`);
  }
  return data;
}
