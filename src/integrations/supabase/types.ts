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
          created_at: string | null
          current_belt: Database["public"]["Enums"]["belt_level"] | null
          email: string | null
          full_name: string | null
          gender: Database["public"]["Enums"]["gender_type"] | null
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          club_name?: string | null
          created_at?: string | null
          current_belt?: Database["public"]["Enums"]["belt_level"] | null
          email?: string | null
          full_name?: string | null
          gender?: Database["public"]["Enums"]["gender_type"] | null
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          club_name?: string | null
          created_at?: string | null
          current_belt?: Database["public"]["Enums"]["belt_level"] | null
          email?: string | null
          full_name?: string | null
          gender?: Database["public"]["Enums"]["gender_type"] | null
          id?: string
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
      [_ in never]: never
    }
    Enums: {
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
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
