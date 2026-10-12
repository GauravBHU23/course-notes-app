// Mirrors the web app's src/types/database.types.ts. Keep in sync manually
// until both apps are regenerated from `npx supabase gen types typescript`.
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type Table<Row, Insert, Update = Partial<Insert>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export interface Database {
  public: {
    Tables: {
      profiles: Table<
        {
          id: string;
          full_name: string;
          email: string;
          mobile: string | null;
          role: string;
          session_version: number;
          current_session_id: string | null;
          failed_login_attempts: number;
          locked_until: string | null;
          created_at: string;
          updated_at: string;
        },
        { id: string; full_name: string; email: string; mobile?: string | null; role?: string },
        Partial<{
          full_name: string;
          email: string;
          mobile: string | null;
          role: string;
          session_version: number;
          current_session_id: string | null;
          failed_login_attempts: number;
          locked_until: string | null;
        }>
      >;
      exam_categories: Table<
        {
          id: string;
          slug: string;
          name: string;
          description: string | null;
          icon_url: string | null;
          display_order: number;
          is_active: boolean;
          created_at: string;
        },
        { slug: string; name: string; description?: string | null; icon_url?: string | null; display_order?: number; is_active?: boolean }
      >;
      bundles: Table<
        {
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
        },
        {
          category_id: string;
          slug: string;
          title: string;
          description?: string | null;
          cover_image_url?: string | null;
          price_inr: number;
          validity_days: number;
          is_active?: boolean;
        }
      >;
      pdfs: Table<
        {
          id: string;
          bundle_id: string;
          title: string;
          storage_path: string;
          page_count: number | null;
          file_size_bytes: number | null;
          display_order: number;
          is_active: boolean;
          created_at: string;
        },
        {
          bundle_id: string;
          title: string;
          storage_path: string;
          page_count?: number | null;
          file_size_bytes?: number | null;
          display_order?: number;
          is_active?: boolean;
        }
      >;
      purchases: Table<
        {
          id: string;
          user_id: string;
          bundle_id: string;
          cashfree_order_id: string;
          cashfree_payment_id: string | null;
          amount_inr: number;
          status: string;
          access_starts_at: string | null;
          access_expires_at: string | null;
          created_at: string;
          updated_at: string;
        },
        {
          user_id: string;
          bundle_id: string;
          cashfree_order_id: string;
          cashfree_payment_id?: string | null;
          amount_inr: number;
          status?: string;
          access_starts_at?: string | null;
          access_expires_at?: string | null;
        }
      >;
      invoices: Table<
        {
          id: string;
          purchase_id: string;
          invoice_number: string;
          pdf_storage_path: string | null;
          emailed_at: string | null;
          created_at: string;
        },
        { purchase_id: string; invoice_number: string; pdf_storage_path?: string | null; emailed_at?: string | null }
      >;
      active_sessions: Table<
        {
          id: string;
          user_id: string;
          session_version: number;
          device_label: string | null;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
          last_seen_at: string;
          revoked_at: string | null;
          revoked_reason: string | null;
        },
        {
          user_id: string;
          session_version: number;
          device_label?: string | null;
          ip_address?: string | null;
          user_agent?: string | null;
          revoked_at?: string | null;
          revoked_reason?: string | null;
        },
        Partial<{
          device_label: string | null;
          ip_address: string | null;
          user_agent: string | null;
          last_seen_at: string;
          revoked_at: string | null;
          revoked_reason: string | null;
        }>
      >;
      otp_codes: Table<
        {
          id: string;
          identifier: string;
          channel: string;
          purpose: string;
          code_hash: string;
          expires_at: string;
          consumed_at: string | null;
          attempt_count: number;
          created_at: string;
        },
        {
          identifier: string;
          channel: string;
          purpose: string;
          code_hash: string;
          expires_at: string;
          consumed_at?: string | null;
          attempt_count?: number;
        }
      >;
      login_attempts: Table<
        {
          id: string;
          identifier: string;
          success: boolean;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        },
        { identifier: string; success: boolean; ip_address?: string | null; user_agent?: string | null }
      >;
      pdf_access_tokens: Table<
        {
          id: string;
          user_id: string;
          pdf_id: string;
          purchase_id: string;
          token_jti: string;
          expires_at: string;
          used_count: number;
          created_at: string;
        },
        {
          user_id: string;
          pdf_id: string;
          purchase_id: string;
          token_jti: string;
          expires_at: string;
          used_count?: number;
        }
      >;
      site_visits: Table<
        { id: number; visited_at: string; path: string | null; visitor_hash: string },
        { visitor_hash: string; path?: string | null }
      >;
      counters: Table<
        { key: string; value: number; updated_at: string },
        { key: string; value?: number }
      >;
      settings: Table<
        { key: string; value: string | null; updated_at: string },
        { key: string; value?: string | null }
      >;
      banners: Table<
        {
          id: string;
          title: string | null;
          image_url: string | null;
          link_url: string | null;
          display_order: number;
          is_active: boolean;
          starts_at: string | null;
          ends_at: string | null;
          created_at: string;
        },
        {
          title?: string | null;
          image_url?: string | null;
          link_url?: string | null;
          display_order?: number;
          is_active?: boolean;
          starts_at?: string | null;
          ends_at?: string | null;
        }
      >;
      contact_queries: Table<
        {
          id: string;
          name: string;
          email: string;
          subject: string;
          message: string;
          user_id: string | null;
          status: string;
          emailed_to_admin: boolean;
          created_at: string;
        },
        {
          name: string;
          email: string;
          subject: string;
          message: string;
          user_id?: string | null;
          status?: string;
          emailed_to_admin?: boolean;
        },
        Partial<{ status: string; emailed_to_admin: boolean }>
      >;
    };
    Views: {
      bundles_public: {
        Row: {
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
          category_slug: string;
          category_name: string;
        };
        Relationships: [];
      };
      pdfs_public: {
        Row: {
          id: string;
          bundle_id: string;
          title: string;
          page_count: number | null;
          display_order: number;
          is_active: boolean;
        };
        Relationships: [];
      };
    };
    Functions: {
      is_admin: { Args: Record<string, never>; Returns: boolean };
      increment_counter: { Args: { p_key: string; p_amount?: number }; Returns: number };
      bump_session_version: { Args: { p_user_id: string }; Returns: number };
      generate_invoice_number: { Args: Record<string, never>; Returns: string };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
