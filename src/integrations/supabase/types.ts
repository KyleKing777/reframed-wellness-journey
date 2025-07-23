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
      ChatbotLogs: {
        Row: {
          context: string | null
          created_at: string
          id: number
          message_bot: string | null
          message_user: string | null
          timestamp: string | null
          user_id: string | null
        }
        Insert: {
          context?: string | null
          created_at?: string
          id?: number
          message_bot?: string | null
          message_user?: string | null
          timestamp?: string | null
          user_id?: string | null
        }
        Update: {
          context?: string | null
          created_at?: string
          id?: number
          message_bot?: string | null
          message_user?: string | null
          timestamp?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      DailyMacros: {
        Row: {
          carbs: number | null
          created_at: string
          date: string | null
          fat: number | null
          id: number
          protein: number | null
          total_calories: number | null
          user_id: string | null
        }
        Insert: {
          carbs?: number | null
          created_at?: string
          date?: string | null
          fat?: number | null
          id?: number
          protein?: number | null
          total_calories?: number | null
          user_id?: string | null
        }
        Update: {
          carbs?: number | null
          created_at?: string
          date?: string | null
          fat?: number | null
          id?: number
          protein?: number | null
          total_calories?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      MealIngredients: {
        Row: {
          calories: number | null
          carbs: number | null
          created_at: string
          fats: number | null
          id: number
          meal_id: string | null
          name: string | null
          protein: number | null
          quantity: string | null
        }
        Insert: {
          calories?: number | null
          carbs?: number | null
          created_at?: string
          fats?: number | null
          id?: number
          meal_id?: string | null
          name?: string | null
          protein?: number | null
          quantity?: string | null
        }
        Update: {
          calories?: number | null
          carbs?: number | null
          created_at?: string
          fats?: number | null
          id?: number
          meal_id?: string | null
          name?: string | null
          protein?: number | null
          quantity?: string | null
        }
        Relationships: []
      }
      Meals: {
        Row: {
          created_at: string
          date: string | null
          id: number
          meal_type: string | null
          name: string | null
          total_calories: number | null
          total_carbs: number | null
          total_fat: number | null
          total_protein: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          date?: string | null
          id?: number
          meal_type?: string | null
          name?: string | null
          total_calories?: number | null
          total_carbs?: number | null
          total_fat?: number | null
          total_protein?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          date?: string | null
          id?: number
          meal_type?: string | null
          name?: string | null
          total_calories?: number | null
          total_carbs?: number | null
          total_fat?: number | null
          total_protein?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      Users: {
        Row: {
          activity_level: string | null
          age: number | null
          avg_steps_per_day: number | null
          created_at: string
          email: string | null
          fear_foods: Json | null
          gender: string | null
          goal_weight_kg: number | null
          height_cm: number | null
          id: number
          password: string | null
          therapist_description: string | null
          therapy_style: string | null
          user_id: string | null
          username: string | null
          weekly_weight_gain_goal: number | null
          weight_kg: number | null
        }
        Insert: {
          activity_level?: string | null
          age?: number | null
          avg_steps_per_day?: number | null
          created_at?: string
          email?: string | null
          fear_foods?: Json | null
          gender?: string | null
          goal_weight_kg?: number | null
          height_cm?: number | null
          id?: number
          password?: string | null
          therapist_description?: string | null
          therapy_style?: string | null
          user_id?: string | null
          username?: string | null
          weekly_weight_gain_goal?: number | null
          weight_kg?: number | null
        }
        Update: {
          activity_level?: string | null
          age?: number | null
          avg_steps_per_day?: number | null
          created_at?: string
          email?: string | null
          fear_foods?: Json | null
          gender?: string | null
          goal_weight_kg?: number | null
          height_cm?: number | null
          id?: number
          password?: string | null
          therapist_description?: string | null
          therapy_style?: string | null
          user_id?: string | null
          username?: string | null
          weekly_weight_gain_goal?: number | null
          weight_kg?: number | null
        }
        Relationships: []
      }
      WeightTracking: {
        Row: {
          created_at: string
          date: string | null
          id: number
          user_id: string | null
          weight_kg: number | null
        }
        Insert: {
          created_at?: string
          date?: string | null
          id?: number
          user_id?: string | null
          weight_kg?: number | null
        }
        Update: {
          created_at?: string
          date?: string | null
          id?: number
          user_id?: string | null
          weight_kg?: number | null
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
