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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      events: {
        Row: {
          all_day: boolean
          color: string
          created_at: string
          created_by: string
          description: string
          end_at: string
          id: string
          location: string
          participants: string[] | null
          recurrence: Database["public"]["Enums"]["event_recurrence"]
          start_at: string
          title: string
        }
        Insert: {
          all_day?: boolean
          color?: string
          created_at?: string
          created_by?: string
          description?: string
          end_at: string
          id?: string
          location?: string
          participants?: string[] | null
          recurrence?: Database["public"]["Enums"]["event_recurrence"]
          start_at: string
          title?: string
        }
        Update: {
          all_day?: boolean
          color?: string
          created_at?: string
          created_by?: string
          description?: string
          end_at?: string
          id?: string
          location?: string
          participants?: string[] | null
          recurrence?: Database["public"]["Enums"]["event_recurrence"]
          start_at?: string
          title?: string
        }
        Relationships: []
      }
      meditation_sessions: {
        Row: {
          completed: boolean | null
          created_at: string | null
          duration_seconds: number
          id: string
          meditation_type: string | null
          note: string | null
          started_at: string
          target_seconds: number
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          created_at?: string | null
          duration_seconds: number
          id?: string
          meditation_type?: string | null
          note?: string | null
          started_at: string
          target_seconds: number
          user_id: string
        }
        Update: {
          completed?: boolean | null
          created_at?: string | null
          duration_seconds?: number
          id?: string
          meditation_type?: string | null
          note?: string | null
          started_at?: string
          target_seconds?: number
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_id_by_email: { Args: { email_addr: string }; Returns: string }
      get_user_profiles: {
        Args: { user_ids: string[] }
        Returns: {
          avatar_url: string
          id: string
          name: string
        }[]
      }
      is_conversation_member: { Args: { conv_id: string }; Returns: boolean }
      reject_friend_invitation: {
        Args: { invitation_id: string }
        Returns: undefined
      }
    }
    Enums: {
      attendance_status: "attendance" | "lateness" | "leave" | "absence"
      club_role:
        | "Role.admin"
        | "Role.teacher"
        | "Role.counselor"
        | "Role.president"
        | "Role.vice_president"
        | "Role.team_director"
        | "Role.deputy_team_director"
        | "Role.committee_member"
        | "Role.member"
        | "Role.new_member"
        | "Role.guest"
      event_recurrence: "none" | "daily" | "weekly" | "monthly" | "yearly"
      grade:
        | "Grade.freshman"
        | "Grade.sophomore"
        | "Grade.junior"
        | "Grade.senior"
        | "Grade.graduate"
      hierarchy:
        | "Hierarchy.core_officers"
        | "Hierarchy.officers"
        | "Hierarchy.members"
        | "Hierarchy.associate_members"
    }
    CompositeTypes: {
      event_extended: {
        location: string | null
        description: string | null
        is_public: boolean | null
        participants: string[] | null
        metadata:
          | Database["public"]["CompositeTypes"]["event_extended_meta_data"]
          | null
      }
      event_extended_meta_data: {
        created_at: string | null
        created_by: string | null
      }
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
    Enums: {
      attendance_status: ["attendance", "lateness", "leave", "absence"],
      club_role: [
        "Role.admin",
        "Role.teacher",
        "Role.counselor",
        "Role.president",
        "Role.vice_president",
        "Role.team_director",
        "Role.deputy_team_director",
        "Role.committee_member",
        "Role.member",
        "Role.new_member",
        "Role.guest",
      ],
      event_recurrence: ["none", "daily", "weekly", "monthly", "yearly"],
      grade: [
        "Grade.freshman",
        "Grade.sophomore",
        "Grade.junior",
        "Grade.senior",
        "Grade.graduate",
      ],
      hierarchy: [
        "Hierarchy.core_officers",
        "Hierarchy.officers",
        "Hierarchy.members",
        "Hierarchy.associate_members",
      ],
    },
  },
} as const
