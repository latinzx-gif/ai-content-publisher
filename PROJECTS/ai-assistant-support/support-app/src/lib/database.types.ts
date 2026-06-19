export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      aas_clients: {
        Row: {
          active: boolean | null
          created_at: string | null
          id: string
          linear_project_id: string | null
          name: string
          repo_url: string | null
          slug: string
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          id?: string
          linear_project_id?: string | null
          name: string
          repo_url?: string | null
          slug: string
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          id?: string
          linear_project_id?: string | null
          name?: string
          repo_url?: string | null
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      aas_incidents: {
        Row: {
          body: string | null
          client_id: string | null
          created_at: string | null
          fingerprint: string
          first_seen_at: string
          id: string
          last_payload: Json | null
          last_seen_at: string
          linear_issue_id: string | null
          linear_issue_url: string | null
          occurrence_count: number
          service: string
          severity: string
          source: string
          source_ref: string | null
          status: string
          subject: string
          ticket_id: string | null
          updated_at: string | null
        }
        Insert: {
          body?: string | null
          client_id?: string | null
          created_at?: string | null
          fingerprint: string
          first_seen_at?: string
          id?: string
          last_payload?: Json | null
          last_seen_at?: string
          linear_issue_id?: string | null
          linear_issue_url?: string | null
          occurrence_count?: number
          service: string
          severity: string
          source: string
          source_ref?: string | null
          status?: string
          subject: string
          ticket_id?: string | null
          updated_at?: string | null
        }
        Update: {
          body?: string | null
          client_id?: string | null
          created_at?: string | null
          fingerprint?: string
          first_seen_at?: string
          id?: string
          last_payload?: Json | null
          last_seen_at?: string
          linear_issue_id?: string | null
          linear_issue_url?: string | null
          occurrence_count?: number
          service?: string
          severity?: string
          source?: string
          source_ref?: string | null
          status?: string
          subject?: string
          ticket_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "aas_incidents_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "aas_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aas_incidents_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "aas_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      aas_support_contacts: {
        Row: {
          client_id: string
          created_at: string | null
          display_name: string | null
          id: string
          line_user_id: string
          org_code: string | null
        }
        Insert: {
          client_id: string
          created_at?: string | null
          display_name?: string | null
          id?: string
          line_user_id: string
          org_code?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string | null
          display_name?: string | null
          id?: string
          line_user_id?: string
          org_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "aas_support_contacts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "aas_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      aas_tickets: {
        Row: {
          body: string | null
          client_id: string
          created_at: string | null
          id: string
          linear_issue_id: string | null
          linear_issue_url: string | null
          notified_at: string | null
          page_url: string | null
          reporter_line_user_id: string
          resolution_summary: string | null
          severity: string
          status: string | null
          subject: string
          ticket_code: string
          type: string
          updated_at: string | null
        }
        Insert: {
          body?: string | null
          client_id: string
          created_at?: string | null
          id?: string
          linear_issue_id?: string | null
          linear_issue_url?: string | null
          notified_at?: string | null
          page_url?: string | null
          reporter_line_user_id: string
          resolution_summary?: string | null
          severity: string
          status?: string | null
          subject: string
          ticket_code: string
          type: string
          updated_at?: string | null
        }
        Update: {
          body?: string | null
          client_id?: string
          created_at?: string | null
          id?: string
          linear_issue_id?: string | null
          linear_issue_url?: string | null
          notified_at?: string | null
          page_url?: string | null
          reporter_line_user_id?: string
          resolution_summary?: string | null
          severity?: string
          status?: string | null
          subject?: string
          ticket_code?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "aas_tickets_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "aas_clients"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      dearmor: { Args: { "": string }; Returns: string }
      gen_random_uuid: { Args: never; Returns: string }
      gen_salt: { Args: { "": string }; Returns: string }
      pgp_armor_headers: {
        Args: { "": string }
        Returns: Record<string, unknown>[]
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