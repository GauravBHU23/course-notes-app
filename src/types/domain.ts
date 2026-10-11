export type UserRole = "student" | "admin";

export type PurchaseStatus = "pending" | "success" | "failed" | "cancelled";

export type SessionRevokedReason = "new_login" | "admin_revoked" | "logout";

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  mobile: string | null;
  role: UserRole;
  session_version: number;
  current_session_id: string | null;
  failed_login_attempts: number;
  locked_until: string | null;
  created_at: string;
  updated_at: string;
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

export interface PdfDoc {
  id: string;
  bundle_id: string;
  title: string;
  storage_path: string;
  page_count: number | null;
  file_size_bytes: number | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export interface Purchase {
  id: string;
  user_id: string;
  bundle_id: string;
  cashfree_order_id: string;
  cashfree_payment_id: string | null;
  amount_inr: number;
  status: PurchaseStatus;
  access_starts_at: string | null;
  access_expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: string;
  purchase_id: string;
  invoice_number: string;
  pdf_storage_path: string | null;
  emailed_at: string | null;
  created_at: string;
}

export interface ActiveSession {
  id: string;
  user_id: string;
  session_version: number;
  device_label: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  last_seen_at: string;
  revoked_at: string | null;
  revoked_reason: SessionRevokedReason | null;
}

export interface Banner {
  id: string;
  title: string | null;
  image_url: string | null;
  link_url: string | null;
  display_order: number;
  is_active: boolean;
  starts_at: string | null;
  ends_at: string | null;
  created_at: string;
}

export interface SettingRow {
  key: string;
  value: string | null;
  updated_at: string;
}

export interface PdfAccessTokenPayload {
  uid: string;
  pid: string;
  purchase_id: string;
  sid: string;
  jti: string;
  iat: number;
  exp: number;
}
