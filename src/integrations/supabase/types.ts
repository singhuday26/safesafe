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
      profiles: {
        Row: {
          avatar_url: string | null
          company: string | null
          created_at: string
          first_name: string | null
          id: string
          last_name: string | null
          role: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          company?: string | null
          created_at?: string
          first_name?: string | null
          id: string
          last_name?: string | null
          role?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          company?: string | null
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          role?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      risk_metrics: {
        Row: {
          behavior_risk_score: number
          calculated_at: string
          created_at: string
          device_risk_score: number
          flagged_transactions_count: number
          fraud_attempts_count: number
          id: string
          location_risk_score: number
          overall_risk_score: number
          transaction_risk_score: number
          updated_at: string
          user_id: string
        }
        Insert: {
          behavior_risk_score: number
          calculated_at?: string
          created_at?: string
          device_risk_score: number
          flagged_transactions_count?: number
          fraud_attempts_count?: number
          id?: string
          location_risk_score: number
          overall_risk_score: number
          transaction_risk_score: number
          updated_at?: string
          user_id: string
        }
        Update: {
          behavior_risk_score?: number
          calculated_at?: string
          created_at?: string
          device_risk_score?: number
          flagged_transactions_count?: number
          fraud_attempts_count?: number
          id?: string
          location_risk_score?: number
          overall_risk_score?: number
          transaction_risk_score?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      security_alerts: {
        Row: {
          alert_type: string
          created_at: string
          description: string
          id: string
          related_transaction_id: string | null
          severity: string
          status: string
          timestamp: string
          title: string
          user_id: string
        }
        Insert: {
          alert_type: string
          created_at?: string
          description: string
          id?: string
          related_transaction_id?: string | null
          severity: string
          status?: string
          timestamp?: string
          title: string
          user_id: string
        }
        Update: {
          alert_type?: string
          created_at?: string
          description?: string
          id?: string
          related_transaction_id?: string | null
          severity?: string
          status?: string
          timestamp?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "security_alerts_related_transaction_id_fkey"
            columns: ["related_transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      security_tips: {
        Row: {
          category: string
          content: string
          created_at: string
          id: string
          priority: number
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          content: string
          created_at?: string
          id?: string
          priority?: number
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          id?: string
          priority?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          card_last4: string | null
          city: string | null
          country: string | null
          created_at: string
          currency: string
          device_info: Json | null
          id: string
          ip_address: string | null
          merchant: string
          payment_method: string
          risk_score: number
          status: string
          timestamp: string
          transaction_number: string | null
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          card_last4?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          currency?: string
          device_info?: Json | null
          id?: string
          ip_address?: string | null
          merchant: string
          payment_method: string
          risk_score: number
          status: string
          timestamp?: string
          transaction_number?: string | null
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          card_last4?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          currency?: string
          device_info?: Json | null
          id?: string
          ip_address?: string | null
          merchant?: string
          payment_method?: string
          risk_score?: number
          status?: string
          timestamp?: string
          transaction_number?: string | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          created_at: string
          id: string
          location_tracking_enabled: boolean
          login_alerts_enabled: boolean
          notification_email: boolean
          notification_push: boolean
          notification_sms: boolean
          security_level: string
          transaction_alerts_enabled: boolean
          two_factor_enabled: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          location_tracking_enabled?: boolean
          login_alerts_enabled?: boolean
          notification_email?: boolean
          notification_push?: boolean
          notification_sms?: boolean
          security_level?: string
          transaction_alerts_enabled?: boolean
          two_factor_enabled?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          location_tracking_enabled?: boolean
          login_alerts_enabled?: boolean
          notification_email?: boolean
          notification_push?: boolean
          notification_sms?: boolean
          security_level?: string
          transaction_alerts_enabled?: boolean
          two_factor_enabled?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
