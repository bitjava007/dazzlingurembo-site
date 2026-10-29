// Types générés depuis le schéma Supabase (outil generate_typescript_types), puis
// ajustés : paramètres facultatifs de submit_contact_message acceptant null.
// À régénérer après chaque migration.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type ContentStatus = "draft" | "published" | "archived";

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.18";
  };
  public: {
    Tables: {
      admins: {
        Row: { created_at: string; email: string };
        Insert: { created_at?: string; email: string };
        Update: { created_at?: string; email?: string };
        Relationships: [];
      };
      catalogue_models: {
        Row: { catalogue_id: string; model_id: string; position: number };
        Insert: { catalogue_id: string; model_id: string; position?: number };
        Update: { catalogue_id?: string; model_id?: string; position?: number };
        Relationships: [
          {
            foreignKeyName: "catalogue_models_catalogue_id_fkey";
            columns: ["catalogue_id"];
            isOneToOne: false;
            referencedRelation: "catalogues";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "catalogue_models_model_id_fkey";
            columns: ["model_id"];
            isOneToOne: false;
            referencedRelation: "models";
            referencedColumns: ["id"];
          },
        ];
      };
      catalogues: {
        Row: {
          cover_path: string | null;
          created_at: string;
          description_en: string | null;
          description_fr: string | null;
          featured_order: number | null;
          id: string;
          is_featured: boolean;
          published_at: string | null;
          slug_en: string;
          slug_fr: string;
          status: ContentStatus;
          title_en: string | null;
          title_fr: string;
          updated_at: string;
        };
        Insert: {
          cover_path?: string | null;
          created_at?: string;
          description_en?: string | null;
          description_fr?: string | null;
          featured_order?: number | null;
          id?: string;
          is_featured?: boolean;
          published_at?: string | null;
          slug_en: string;
          slug_fr: string;
          status?: ContentStatus;
          title_en?: string | null;
          title_fr: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["catalogues"]["Insert"]>;
        Relationships: [];
      };
      contact_messages: {
        Row: {
          created_at: string;
          email: string | null;
          handled_at: string | null;
          id: string;
          ip_hash: string | null;
          locale: string;
          message: string;
          model_id: string | null;
          name: string;
          phone: string | null;
          subject: string;
        };
        Insert: {
          created_at?: string;
          email?: string | null;
          handled_at?: string | null;
          id?: string;
          ip_hash?: string | null;
          locale?: string;
          message: string;
          model_id?: string | null;
          name: string;
          phone?: string | null;
          subject: string;
        };
        Update: Partial<Database["public"]["Tables"]["contact_messages"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "contact_messages_model_id_fkey";
            columns: ["model_id"];
            isOneToOne: false;
            referencedRelation: "models";
            referencedColumns: ["id"];
          },
        ];
      };
      model_images: {
        Row: {
          alt_en: string | null;
          alt_fr: string | null;
          created_at: string;
          height: number | null;
          id: string;
          is_primary: boolean;
          model_id: string;
          position: number;
          storage_path: string;
          width: number | null;
        };
        Insert: {
          alt_en?: string | null;
          alt_fr?: string | null;
          created_at?: string;
          height?: number | null;
          id?: string;
          is_primary?: boolean;
          model_id: string;
          position?: number;
          storage_path: string;
          width?: number | null;
        };
        Update: Partial<Database["public"]["Tables"]["model_images"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "model_images_model_id_fkey";
            columns: ["model_id"];
            isOneToOne: false;
            referencedRelation: "models";
            referencedColumns: ["id"];
          },
        ];
      };
      model_themes: {
        Row: { model_id: string; theme_id: string };
        Insert: { model_id: string; theme_id: string };
        Update: { model_id?: string; theme_id?: string };
        Relationships: [
          {
            foreignKeyName: "model_themes_model_id_fkey";
            columns: ["model_id"];
            isOneToOne: false;
            referencedRelation: "models";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "model_themes_theme_id_fkey";
            columns: ["theme_id"];
            isOneToOne: false;
            referencedRelation: "themes";
            referencedColumns: ["id"];
          },
        ];
      };
      models: {
        Row: {
          craftsmanship_en: string | null;
          craftsmanship_fr: string | null;
          created_at: string;
          description_en: string | null;
          description_fr: string | null;
          featured_order: number | null;
          id: string;
          is_featured: boolean;
          material_en: string | null;
          material_fr: string | null;
          name_en: string | null;
          name_fr: string;
          published_at: string | null;
          reference: string | null;
          slug_en: string;
          slug_fr: string;
          status: ContentStatus;
          updated_at: string;
        };
        Insert: {
          craftsmanship_en?: string | null;
          craftsmanship_fr?: string | null;
          created_at?: string;
          description_en?: string | null;
          description_fr?: string | null;
          featured_order?: number | null;
          id?: string;
          is_featured?: boolean;
          material_en?: string | null;
          material_fr?: string | null;
          name_en?: string | null;
          name_fr: string;
          published_at?: string | null;
          reference?: string | null;
          slug_en: string;
          slug_fr: string;
          status?: ContentStatus;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["models"]["Insert"]>;
        Relationships: [];
      };
      pages: {
        Row: {
          body_en: string | null;
          body_fr: string | null;
          key: string;
          seo_description_en: string | null;
          seo_description_fr: string | null;
          title_en: string | null;
          title_fr: string | null;
          updated_at: string;
        };
        Insert: {
          body_en?: string | null;
          body_fr?: string | null;
          key: string;
          seo_description_en?: string | null;
          seo_description_fr?: string | null;
          title_en?: string | null;
          title_fr?: string | null;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["pages"]["Insert"]>;
        Relationships: [];
      };
      site_settings: {
        Row: {
          address: string | null;
          contact_email: string | null;
          facebook_url: string | null;
          hero_image_path: string | null;
          id: number;
          instagram_url: string | null;
          opening_hours_en: string | null;
          opening_hours_fr: string | null;
          phone: string | null;
          tiktok_url: string | null;
          updated_at: string;
          watermark_enabled: boolean;
          whatsapp_number: string | null;
        };
        Insert: {
          address?: string | null;
          contact_email?: string | null;
          facebook_url?: string | null;
          hero_image_path?: string | null;
          id?: number;
          instagram_url?: string | null;
          opening_hours_en?: string | null;
          opening_hours_fr?: string | null;
          phone?: string | null;
          tiktok_url?: string | null;
          updated_at?: string;
          watermark_enabled?: boolean;
          whatsapp_number?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["site_settings"]["Insert"]>;
        Relationships: [];
      };
      themes: {
        Row: {
          cover_path: string | null;
          created_at: string;
          description_en: string | null;
          description_fr: string | null;
          id: string;
          kind: ThemeKind;
          name_en: string | null;
          name_fr: string;
          position: number;
          slug_en: string;
          slug_fr: string;
          status: ContentStatus;
          updated_at: string;
        };
        Insert: {
          cover_path?: string | null;
          created_at?: string;
          description_en?: string | null;
          description_fr?: string | null;
          id?: string;
          kind?: ThemeKind;
          name_en?: string | null;
          name_fr: string;
          position?: number;
          slug_en: string;
          slug_fr: string;
          status?: ContentStatus;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["themes"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      assert_admin: { Args: never; Returns: undefined };
      is_admin: { Args: never; Returns: boolean };
      set_catalogue_models: { Args: { p_catalogue_id: string; p_model_ids: string[] }; Returns: undefined };
      set_model_catalogues: { Args: { p_catalogue_ids: string[]; p_model_id: string }; Returns: undefined };
      set_model_images_order: { Args: { p_image_ids: string[]; p_model_id: string }; Returns: undefined };
      set_model_themes: { Args: { p_model_id: string; p_theme_ids: string[] }; Returns: undefined };
      submit_contact_message: {
        Args: {
          p_email: string | null;
          p_ip_hash: string | null;
          p_locale: string;
          p_message: string;
          p_model_id: string | null;
          p_name: string;
          p_phone: string | null;
          p_subject: string;
        };
        Returns: string;
      };
    };
    Enums: { content_status: ContentStatus };
    CompositeTypes: { [_ in never]: never };
  };
};

export type ContentStatusValue = ContentStatus;
/** Niveau d'une thématique : catégorie de navigation ou filtre de matière. */
export type ThemeKind = "category" | "material";

export type TableRow<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"];
