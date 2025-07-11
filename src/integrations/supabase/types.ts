export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      exercise_records: {
        Row: {
          created_at: string | null
          date: string
          duration_minutes: number | null
          exercise_id: string
          id: string
          notes: string | null
          reps: number | null
          sets: number | null
          training_session_id: string | null
          user_id: string
          weight_kg: number | null
        }
        Insert: {
          created_at?: string | null
          date: string
          duration_minutes?: number | null
          exercise_id: string
          id?: string
          notes?: string | null
          reps?: number | null
          sets?: number | null
          training_session_id?: string | null
          user_id: string
          weight_kg?: number | null
        }
        Update: {
          created_at?: string | null
          date?: string
          duration_minutes?: number | null
          exercise_id?: string
          id?: string
          notes?: string | null
          reps?: number | null
          sets?: number | null
          training_session_id?: string | null
          user_id?: string
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "exercise_records_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercise_records_training_session_id_fkey"
            columns: ["training_session_id"]
            isOneToOne: false
            referencedRelation: "training_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      exercises: {
        Row: {
          created_at: string | null
          id: string
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      notification_logs: {
        Row: {
          id: string
          reminder_id: string
          sent_at: string
          status: string
          user_id: string
        }
        Insert: {
          id?: string
          reminder_id: string
          sent_at?: string
          status?: string
          user_id: string
        }
        Update: {
          id?: string
          reminder_id?: string
          sent_at?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_logs_reminder_id_fkey"
            columns: ["reminder_id"]
            isOneToOne: false
            referencedRelation: "training_reminders"
            referencedColumns: ["id"]
          },
        ]
      }
      nutrition_entries: {
        Row: {
          calories: number | null
          carbs: number | null
          created_at: string | null
          date: string
          fats: number | null
          id: string
          meal_description: string
          protein: number | null
          user_id: string
        }
        Insert: {
          calories?: number | null
          carbs?: number | null
          created_at?: string | null
          date: string
          fats?: number | null
          id?: string
          meal_description: string
          protein?: number | null
          user_id: string
        }
        Update: {
          calories?: number | null
          carbs?: number | null
          created_at?: string | null
          date?: string
          fats?: number | null
          id?: string
          meal_description?: string
          protein?: number | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          club_name: string | null
          competition_category: string | null
          created_at: string | null
          current_belt: Database["public"]["Enums"]["belt_level"] | null
          email: string | null
          full_name: string | null
          gender: Database["public"]["Enums"]["gender_type"] | null
          id: string
          injuries: string[] | null
          injury_description: string | null
          profile_image_url: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          club_name?: string | null
          competition_category?: string | null
          created_at?: string | null
          current_belt?: Database["public"]["Enums"]["belt_level"] | null
          email?: string | null
          full_name?: string | null
          gender?: Database["public"]["Enums"]["gender_type"] | null
          id?: string
          injuries?: string[] | null
          injury_description?: string | null
          profile_image_url?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          club_name?: string | null
          competition_category?: string | null
          created_at?: string | null
          current_belt?: Database["public"]["Enums"]["belt_level"] | null
          email?: string | null
          full_name?: string | null
          gender?: Database["public"]["Enums"]["gender_type"] | null
          id?: string
          injuries?: string[] | null
          injury_description?: string | null
          profile_image_url?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      randori_sessions: {
        Row: {
          created_at: string | null
          id: string
          notes: string | null
          opponent_name: string
          techniques_attempted: string[] | null
          techniques_failed: string[] | null
          techniques_received: string[] | null
          techniques_successful: string[] | null
          training_session_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          notes?: string | null
          opponent_name: string
          techniques_attempted?: string[] | null
          techniques_failed?: string[] | null
          techniques_received?: string[] | null
          techniques_successful?: string[] | null
          training_session_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          notes?: string | null
          opponent_name?: string
          techniques_attempted?: string[] | null
          techniques_failed?: string[] | null
          techniques_received?: string[] | null
          techniques_successful?: string[] | null
          training_session_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "randori_sessions_training_session_id_fkey"
            columns: ["training_session_id"]
            isOneToOne: false
            referencedRelation: "training_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      tactical_notes: {
        Row: {
          content: string | null
          created_at: string | null
          id: string
          image_urls: string[] | null
          title: string
          updated_at: string | null
          user_id: string
          video_url: string | null
          youtube_url: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          id?: string
          image_urls?: string[] | null
          title: string
          updated_at?: string | null
          user_id: string
          video_url?: string | null
          youtube_url?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          id?: string
          image_urls?: string[] | null
          title?: string
          updated_at?: string | null
          user_id?: string
          video_url?: string | null
          youtube_url?: string | null
        }
        Relationships: []
      }
      techniques: {
        Row: {
          belt_level: Database["public"]["Enums"]["belt_level"]
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          name: string
          updated_at: string | null
          user_id: string
          video_url: string | null
          youtube_url: string | null
        }
        Insert: {
          belt_level: Database["public"]["Enums"]["belt_level"]
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          updated_at?: string | null
          user_id: string
          video_url?: string | null
          youtube_url?: string | null
        }
        Update: {
          belt_level?: Database["public"]["Enums"]["belt_level"]
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          updated_at?: string | null
          user_id?: string
          video_url?: string | null
          youtube_url?: string | null
        }
        Relationships: []
      }
      trainer_assignments: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          id: string
          student_id: string
          trainer_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          student_id: string
          trainer_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          student_id?: string
          trainer_id?: string
        }
        Relationships: []
      }
      training_reminders: {
        Row: {
          created_at: string
          days_of_week: number[]
          id: string
          is_active: boolean
          message: string | null
          time_of_day: string
          title: string
          training_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          days_of_week: number[]
          id?: string
          is_active?: boolean
          message?: string | null
          time_of_day: string
          title: string
          training_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          days_of_week?: number[]
          id?: string
          is_active?: boolean
          message?: string | null
          time_of_day?: string
          title?: string
          training_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      training_sessions: {
        Row: {
          created_at: string | null
          date: string
          duration_minutes: number | null
          id: string
          intensity: number | null
          notes: string | null
          session_type: string
          training_category: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          date: string
          duration_minutes?: number | null
          id?: string
          intensity?: number | null
          notes?: string | null
          session_type: string
          training_category?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          date?: string
          duration_minutes?: number | null
          id?: string
          intensity?: number | null
          notes?: string | null
          session_type?: string
          training_category?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      weight_entries: {
        Row: {
          created_at: string | null
          date: string
          id: string
          user_id: string
          weight: number
        }
        Insert: {
          created_at?: string | null
          date: string
          id?: string
          user_id: string
          weight: number
        }
        Update: {
          created_at?: string | null
          date?: string
          id?: string
          user_id?: string
          weight?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_student_trainer: {
        Args: { _student_id?: string }
        Returns: {
          trainer_id: string
          full_name: string
          email: string
          assigned_at: string
        }[]
      }
      get_trainer_students: {
        Args: { _trainer_id?: string }
        Returns: {
          student_id: string
          full_name: string
          email: string
          assigned_at: string
        }[]
      }
      get_user_role: {
        Args: { _user_id?: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "practicante" | "entrenador" | "admin"
      belt_level:
        | "white"
        | "yellow"
        | "orange"
        | "green"
        | "blue"
        | "brown"
        | "black"
      gender_type: "male" | "female"
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
    Enums: {
      app_role: ["practicante", "entrenador", "admin"],
      belt_level: [
        "white",
        "yellow",
        "orange",
        "green",
        "blue",
        "brown",
        "black",
      ],
      gender_type: ["male", "female"],
    },
  },
} as const
