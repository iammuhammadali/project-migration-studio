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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      application_documents: {
        Row: {
          application_id: string
          created_at: string
          doc_type: string
          file_name: string
          file_path: string
          id: string
          mime_type: string | null
          user_id: string
        }
        Insert: {
          application_id: string
          created_at?: string
          doc_type: string
          file_name: string
          file_path: string
          id?: string
          mime_type?: string | null
          user_id?: string
        }
        Update: {
          application_id?: string
          created_at?: string
          doc_type?: string
          file_name?: string
          file_path?: string
          id?: string
          mime_type?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "application_documents_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      application_types: {
        Row: {
          code: string
          fee: number
          label: string
          sort: number
        }
        Insert: {
          code: string
          fee?: number
          label: string
          sort?: number
        }
        Update: {
          code?: string
          fee?: number
          label?: string
          sort?: number
        }
        Relationships: []
      }
      applications: {
        Row: {
          additional: Json
          application_type: string
          cnic: string
          created_at: string
          current_step: number
          details: Json
          electoral: Json
          fee_amount: number | null
          id: string
          personal: Json
          status: string
          submitted_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          additional?: Json
          application_type: string
          cnic: string
          created_at?: string
          current_step?: number
          details?: Json
          electoral?: Json
          fee_amount?: number | null
          id?: string
          personal?: Json
          status?: string
          submitted_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Update: {
          additional?: Json
          application_type?: string
          cnic?: string
          created_at?: string
          current_step?: number
          details?: Json
          electoral?: Json
          fee_amount?: number | null
          id?: string
          personal?: Json
          status?: string
          submitted_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_application_type_fkey"
            columns: ["application_type"]
            isOneToOne: false
            referencedRelation: "application_types"
            referencedColumns: ["code"]
          },
        ]
      }
      issued_domiciles: {
        Row: {
          cnic: string
          created_at: string
          date_of_birth: string
          district: string
          full_name: string
          id: string
          issue_date: string
          status: string
          surname: string
          tehsil: string
        }
        Insert: {
          cnic: string
          created_at?: string
          date_of_birth: string
          district: string
          full_name: string
          id?: string
          issue_date: string
          status?: string
          surname: string
          tehsil: string
        }
        Update: {
          cnic?: string
          created_at?: string
          date_of_birth?: string
          district?: string
          full_name?: string
          id?: string
          issue_date?: string
          status?: string
          surname?: string
          tehsil?: string
        }
        Relationships: []
      }
      legacy_user_mappings: {
        Row: {
          auth_user_id: string
          imported_at: string
          legacy_user_id: string
        }
        Insert: {
          auth_user_id: string
          imported_at?: string
          legacy_user_id: string
        }
        Update: {
          auth_user_id?: string
          imported_at?: string
          legacy_user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          cnic: string
          created_at: string
          id: string
        }
        Insert: {
          cnic: string
          created_at?: string
          id: string
        }
        Update: {
          cnic?: string
          created_at?: string
          id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      track_application: {
        Args: { p_cnic: string }
        Returns: {
          application_type: string
          created_at: string
          stage: string
          submitted_at: string
          updated_at: string
        }[]
      }
      verify_domicile: {
        Args: { p_cnic: string }
        Returns: {
          date_of_birth: string
          district: string
          full_name: string
          issue_date: string
          status: string
          surname: string
          tehsil: string
        }[]
      }
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
