// Mirrors the web app's src/types/domain.ts.
export type UserRole = "student" | "admin";

export type PurchaseStatus = "pending" | "success" | "failed" | "cancelled";

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  mobile: string | null;
  role: UserRole;
  created_at: string;
}

export interface ExamCategory {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  icon_url: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export interface Bundle {
  id: string;
  category_id: string;
  slug: string;
  title: string;
  description: string | null;
  cover_image_url: string | null;
  price_inr: number;
  validity_days: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BundlePublic extends Bundle {
  category_slug: string;
  category_name: string;
}

export interface PdfSummary {
  id: string;
  bundle_id: string;
  title: string;
  page_count: number | null;
  display_order: number;
}

export interface Purchase {
  id: string;
  user_id: string;
  bundle_id: string;
  amount_inr: number;
  status: PurchaseStatus;
  access_starts_at: string | null;
  access_expires_at: string | null;
  created_at: string;
}
