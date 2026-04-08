export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      admin_users: {
        Row: {
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      buddy_matches: {
        Row: {
          created_at: string
          id: string
          match_type: string
          status: string
          user_a_id: string
          user_b_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          match_type?: string
          status?: string
          user_a_id: string
          user_b_id: string
        }
        Update: {
          created_at?: string
          id?: string
          match_type?: string
          status?: string
          user_a_id?: string
          user_b_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "buddy_matches_user_a_id_fkey"
            columns: ["user_a_id"]
            isOneToOne: false
            referencedRelation: "buddy_waiting_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "buddy_matches_user_b_id_fkey"
            columns: ["user_b_id"]
            isOneToOne: false
            referencedRelation: "buddy_waiting_users"
            referencedColumns: ["id"]
          },
        ]
      }
      buddy_waiting_users: {
        Row: {
          created_at: string
          email: string | null
          id: string
          is_matched: boolean
          name: string
          phone: string
          service_year: string
          unit: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          is_matched?: boolean
          name: string
          phone: string
          service_year: string
          unit: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          is_matched?: boolean
          name?: string
          phone?: string
          service_year?: string
          unit?: string
        }
        Relationships: []
      }
      consultations: {
        Row: {
          client_email: string | null
          client_name: string
          client_phone: string
          consultation_date: string
          consultation_time: string
          created_at: string
          expert_expertise: string
          expert_name: string
          id: string
          memo: string | null
          status: string
        }
        Insert: {
          client_email?: string | null
          client_name: string
          client_phone: string
          consultation_date: string
          consultation_time: string
          created_at?: string
          expert_expertise: string
          expert_name: string
          id?: string
          memo?: string | null
          status?: string
        }
        Update: {
          client_email?: string | null
          client_name?: string
          client_phone?: string
          consultation_date?: string
          consultation_time?: string
          created_at?: string
          expert_expertise?: string
          expert_name?: string
          id?: string
          memo?: string | null
          status?: string
        }
        Relationships: []
      }
      experts: {
        Row: {
          available: boolean
          career: string
          career_en: string
          career_ja: string
          career_zh: string
          consult_fee: string
          consult_fee_en: string
          consult_fee_ja: string
          consult_fee_zh: string
          created_at: string
          description: string
          description_en: string
          description_ja: string
          description_zh: string
          experience_score: number
          expertise: string
          expertise_en: string
          expertise_ja: string
          expertise_zh: string
          id: string
          match_rate: number
          name: string
          name_en: string
          name_ja: string
          name_zh: string
          sort_order: number
          specialties: string[]
          specialties_en: string[]
          specialties_ja: string[]
          specialties_zh: string[]
          tags: string[]
          tags_en: string[]
          tags_ja: string[]
          tags_zh: string[]
        }
        Insert: {
          available?: boolean
          career?: string
          career_en?: string
          career_ja?: string
          career_zh?: string
          consult_fee?: string
          consult_fee_en?: string
          consult_fee_ja?: string
          consult_fee_zh?: string
          created_at?: string
          description?: string
          description_en?: string
          description_ja?: string
          description_zh?: string
          experience_score?: number
          expertise: string
          expertise_en?: string
          expertise_ja?: string
          expertise_zh?: string
          id?: string
          match_rate?: number
          name: string
          name_en?: string
          name_ja?: string
          name_zh?: string
          sort_order?: number
          specialties?: string[]
          specialties_en?: string[]
          specialties_ja?: string[]
          specialties_zh?: string[]
          tags?: string[]
          tags_en?: string[]
          tags_ja?: string[]
          tags_zh?: string[]
        }
        Update: {
          available?: boolean
          career?: string
          career_en?: string
          career_ja?: string
          career_zh?: string
          consult_fee?: string
          consult_fee_en?: string
          consult_fee_ja?: string
          consult_fee_zh?: string
          created_at?: string
          description?: string
          description_en?: string
          description_ja?: string
          description_zh?: string
          experience_score?: number
          expertise?: string
          expertise_en?: string
          expertise_ja?: string
          expertise_zh?: string
          id?: string
          match_rate?: number
          name?: string
          name_en?: string
          name_ja?: string
          name_zh?: string
          sort_order?: number
          specialties?: string[]
          specialties_en?: string[]
          specialties_ja?: string[]
          specialties_zh?: string[]
          tags?: string[]
          tags_en?: string[]
          tags_ja?: string[]
          tags_zh?: string[]
        }
        Relationships: []
      }
      notifications: {
        Row: {
          consultation_id: string | null
          created_at: string
          id: string
          is_read: boolean
          message: string
          title: string
          type: string
        }
        Insert: {
          consultation_id?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          title: string
          type?: string
        }
        Update: {
          consultation_id?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_consultation_id_fkey"
            columns: ["consultation_id"]
            isOneToOne: false
            referencedRelation: "consultations"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          id: string
          service_enabled: boolean
          updated_at: string
        }
        Insert: {
          id?: string
          service_enabled?: boolean
          updated_at?: string
        }
        Update: {
          id?: string
          service_enabled?: boolean
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
