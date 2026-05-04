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
      attendance: {
        Row: {
          created_at: string
          event_id: string
          id: string
          member_id: string
          remark: string
          status: Database["public"]["Enums"]["attendance_status"] | null
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          member_id: string
          remark?: string
          status?: Database["public"]["Enums"]["attendance_status"] | null
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          member_id?: string
          remark?: string
          status?: Database["public"]["Enums"]["attendance_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_members: {
        Row: {
          conversation_id: string
          id: string
          joined_at: string
          last_read_at: string
          user_id: string
        }
        Insert: {
          conversation_id: string
          id?: string
          joined_at?: string
          last_read_at?: string
          user_id: string
        }
        Update: {
          conversation_id?: string
          id?: string
          joined_at?: string
          last_read_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_members_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          avatar_url: string | null
          created_at: string
          created_by: string
          id: string
          is_group: boolean
          name: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          created_by: string
          id?: string
          is_group?: boolean
          name?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          created_by?: string
          id?: string
          is_group?: boolean
          name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
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
      ledger: {
        Row: {
          amount: number
          category: string
          created_at: string | null
          date: string
          finance_id: string
          icon: string
          id: string
          is_approved: boolean | null
          receipt_path: string | null
          requester_id: string
          status: string
          title: string
          type: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          category?: string
          created_at?: string | null
          date: string
          finance_id?: string
          icon?: string
          id?: string
          is_approved?: boolean | null
          receipt_path?: string | null
          requester_id: string
          status?: string
          title: string
          type: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string | null
          date?: string
          finance_id?: string
          icon?: string
          id?: string
          is_approved?: boolean | null
          receipt_path?: string | null
          requester_id?: string
          status?: string
          title?: string
          type?: string
          updated_at?: string | null
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
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          image_url: string | null
          is_deleted: boolean
          message_type: string
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          image_url?: string | null
          is_deleted?: boolean
          message_type?: string
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          image_url?: string | null
          is_deleted?: boolean
          message_type?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_profiles: {
        Args: { user_ids: string[] }
        Returns: {
          avatar_url: string
          id: string
          name: string
        }[]
      }
      is_conversation_member: { Args: { conv_id: string }; Returns: boolean }
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
