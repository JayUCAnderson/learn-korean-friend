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
      daily_progress: {
        Row: {
          created_at: string
          date: string
          id: string
          minutes_studied: number
          progress_percentage: number
          user_id: string
        }
        Insert: {
          created_at?: string
          date?: string
          id?: string
          minutes_studied?: number
          progress_percentage?: number
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          minutes_studied?: number
          progress_percentage?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      hangul_lessons: {
        Row: {
          character: string
          created_at: string
          examples: Json
          id: string
          lesson_order: number
          mnemonic_base: string
          mnemonic_image_id: string | null
          romanization: string
          similar_sounds: string[] | null
          sound_description: string
          stroke_order: Json | null
        }
        Insert: {
          character: string
          created_at?: string
          examples: Json
          id?: string
          lesson_order: number
          mnemonic_base: string
          mnemonic_image_id?: string | null
          romanization: string
          similar_sounds?: string[] | null
          sound_description: string
          stroke_order?: Json | null
        }
        Update: {
          character?: string
          created_at?: string
          examples?: Json
          id?: string
          lesson_order?: number
          mnemonic_base?: string
          mnemonic_image_id?: string | null
          romanization?: string
          similar_sounds?: string[] | null
          sound_description?: string
          stroke_order?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "hangul_lessons_mnemonic_image_id_fkey"
            columns: ["mnemonic_image_id"]
            isOneToOne: false
            referencedRelation: "mnemonic_images"
            referencedColumns: ["id"]
          },
        ]
      }
      hangul_progress: {
        Row: {
          character_id: string | null
          created_at: string
          id: string
          last_reviewed: string | null
          mastery_level: number | null
          next_review: string | null
          user_id: string | null
        }
        Insert: {
          character_id?: string | null
          created_at?: string
          id?: string
          last_reviewed?: string | null
          mastery_level?: number | null
          next_review?: string | null
          user_id?: string | null
        }
        Update: {
          character_id?: string | null
          created_at?: string
          id?: string
          last_reviewed?: string | null
          mastery_level?: number | null
          next_review?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hangul_progress_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "hangul_lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hangul_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_content: {
        Row: {
          content: Json
          content_type: Database["public"]["Enums"]["content_type"]
          created_at: string
          id: string
          interest_category: string[]
          level: Database["public"]["Enums"]["korean_level"]
          topic: string
          usage_count: number
        }
        Insert: {
          content: Json
          content_type: Database["public"]["Enums"]["content_type"]
          created_at?: string
          id?: string
          interest_category: string[]
          level: Database["public"]["Enums"]["korean_level"]
          topic: string
          usage_count?: number
        }
        Update: {
          content?: Json
          content_type?: Database["public"]["Enums"]["content_type"]
          created_at?: string
          id?: string
          interest_category?: string[]
          level?: Database["public"]["Enums"]["korean_level"]
          topic?: string
          usage_count?: number
        }
        Relationships: []
      }
      learning_sessions: {
        Row: {
          completed_at: string | null
          content_id: string | null
          created_at: string
          feedback: string | null
          id: string
          performance_score: number | null
          session_type: Database["public"]["Enums"]["content_type"]
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          content_id?: string | null
          created_at?: string
          feedback?: string | null
          id?: string
          performance_score?: number | null
          session_type: Database["public"]["Enums"]["content_type"]
          user_id: string
        }
        Update: {
          completed_at?: string | null
          content_id?: string | null
          created_at?: string
          feedback?: string | null
          id?: string
          performance_score?: number | null
          session_type?: Database["public"]["Enums"]["content_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_sessions_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "learning_content"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          audio_content: Json | null
          completed_at: string | null
          content: Json
          created_at: string | null
          description: string | null
          id: string
          lesson_number: number
          mnemonic_images: Json | null
          status: Database["public"]["Enums"]["lesson_status"] | null
          title: string
          user_id: string
          vocabulary: Json[] | null
        }
        Insert: {
          audio_content?: Json | null
          completed_at?: string | null
          content: Json
          created_at?: string | null
          description?: string | null
          id?: string
          lesson_number: number
          mnemonic_images?: Json | null
          status?: Database["public"]["Enums"]["lesson_status"] | null
          title: string
          user_id: string
          vocabulary?: Json[] | null
        }
        Update: {
          audio_content?: Json | null
          completed_at?: string | null
          content?: Json
          created_at?: string | null
          description?: string | null
          id?: string
          lesson_number?: number
          mnemonic_images?: Json | null
          status?: Database["public"]["Enums"]["lesson_status"] | null
          title?: string
          user_id?: string
          vocabulary?: Json[] | null
        }
        Relationships: [
          {
            foreignKeyName: "lessons_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mnemonic_images: {
        Row: {
          character: string | null
          created_at: string
          id: string
          image_url: string
          prompt: string | null
        }
        Insert: {
          character?: string | null
          created_at?: string
          id?: string
          image_url: string
          prompt?: string | null
        }
        Update: {
          character?: string | null
          created_at?: string
          id?: string
          image_url?: string
          prompt?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          interests: string[] | null
          learning_goal: Database["public"]["Enums"]["learning_goal"] | null
          level: Database["public"]["Enums"]["korean_level"] | null
          updated_at: string
          username: string | null
        }
        Insert: {
          created_at?: string
          id: string
          interests?: string[] | null
          learning_goal?: Database["public"]["Enums"]["learning_goal"] | null
          level?: Database["public"]["Enums"]["korean_level"] | null
          updated_at?: string
          username?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          interests?: string[] | null
          learning_goal?: Database["public"]["Enums"]["learning_goal"] | null
          level?: Database["public"]["Enums"]["korean_level"] | null
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      vocabulary_progress: {
        Row: {
          audio_content: Json | null
          created_at: string | null
          id: string
          last_reviewed: string | null
          mastery_level: number | null
          times_correct: number | null
          times_encountered: number | null
          user_id: string
          vocabulary_item: Json
        }
        Insert: {
          audio_content?: Json | null
          created_at?: string | null
          id?: string
          last_reviewed?: string | null
          mastery_level?: number | null
          times_correct?: number | null
          times_encountered?: number | null
          user_id: string
          vocabulary_item: Json
        }
        Update: {
          audio_content?: Json | null
          created_at?: string | null
          id?: string
          last_reviewed?: string | null
          mastery_level?: number | null
          times_correct?: number | null
          times_encountered?: number | null
          user_id?: string
          vocabulary_item?: Json
        }
        Relationships: [
          {
            foreignKeyName: "vocabulary_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_vocabulary_stats: {
        Args: {
          user_id_param: string
        }
        Returns: {
          total_vocabulary: number
          mastered_vocabulary: number
          average_mastery: number
        }[]
      }
    }
    Enums: {
      content_type: "vocabulary" | "grammar" | "conversation" | "culture"
      korean_level: "beginner" | "intermediate" | "advanced"
      learning_goal: "casual" | "business" | "academic" | "culture"
      lesson_status: "not_started" | "in_progress" | "completed"
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
