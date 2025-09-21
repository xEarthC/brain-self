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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          created_at: string
          description: string | null
          description_si: string | null
          icon: string | null
          id: string
          name: string
          name_si: string | null
          points: number | null
          requirement_type: string
          requirement_value: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          description_si?: string | null
          icon?: string | null
          id?: string
          name: string
          name_si?: string | null
          points?: number | null
          requirement_type: string
          requirement_value: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          description_si?: string | null
          icon?: string | null
          id?: string
          name?: string
          name_si?: string | null
          points?: number | null
          requirement_type?: string
          requirement_value?: number
          updated_at?: string
        }
        Relationships: []
      }
      courses: {
        Row: {
          created_at: string
          description: string | null
          description_si: string | null
          difficulty_level: string | null
          estimated_hours: number | null
          grade_level: string | null
          id: string
          is_published: boolean | null
          subject_id: string | null
          thumbnail_url: string | null
          title: string
          title_si: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          description_si?: string | null
          difficulty_level?: string | null
          estimated_hours?: number | null
          grade_level?: string | null
          id?: string
          is_published?: boolean | null
          subject_id?: string | null
          thumbnail_url?: string | null
          title: string
          title_si?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          description_si?: string | null
          difficulty_level?: string | null
          estimated_hours?: number | null
          grade_level?: string | null
          id?: string
          is_published?: boolean | null
          subject_id?: string | null
          thumbnail_url?: string | null
          title?: string
          title_si?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "courses_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      enrollments: {
        Row: {
          completed_at: string | null
          course_id: string
          enrolled_at: string
          id: string
          progress_percentage: number | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          course_id: string
          enrolled_at?: string
          id?: string
          progress_percentage?: number | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          course_id?: string
          enrolled_at?: string
          id?: string
          progress_percentage?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      group_chats: {
        Row: {
          created_at: string
          group_id: string
          id: string
          message: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          group_id: string
          id?: string
          message: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          group_id?: string
          id?: string
          message?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_chats_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      group_members: {
        Row: {
          added_by: string
          group_id: string
          id: string
          joined_at: string
          user_id: string
        }
        Insert: {
          added_by: string
          group_id: string
          id?: string
          joined_at?: string
          user_id: string
        }
        Update: {
          added_by?: string
          group_id?: string
          id?: string
          joined_at?: string
          user_id?: string
        }
        Relationships: []
      }
      groups: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          id: string
          name: string
          school_tag_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          name: string
          school_tag_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          name?: string
          school_tag_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      lesson_progress: {
        Row: {
          completed_at: string | null
          created_at: string
          enrollment_id: string
          id: string
          lesson_id: string
          score: number | null
          status: string | null
          time_spent_minutes: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          enrollment_id: string
          id?: string
          lesson_id: string
          score?: number | null
          status?: string | null
          time_spent_minutes?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          enrollment_id?: string
          id?: string
          lesson_id?: string
          score?: number | null
          status?: string | null
          time_spent_minutes?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_progress_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          content_data: Json | null
          content_type: string | null
          content_url: string | null
          course_id: string
          created_at: string
          description: string | null
          duration_minutes: number | null
          id: string
          is_published: boolean | null
          order_index: number
          title: string
          updated_at: string
        }
        Insert: {
          content_data?: Json | null
          content_type?: string | null
          content_url?: string | null
          course_id: string
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_published?: boolean | null
          order_index?: number
          title: string
          updated_at?: string
        }
        Update: {
          content_data?: Json | null
          content_type?: string | null
          content_url?: string | null
          course_id?: string
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_published?: boolean | null
          order_index?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lessons_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          message_type: string
          read_status: boolean
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          message_type: string
          read_status?: boolean
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          message_type?: string
          read_status?: boolean
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          contact_email: string | null
          contact_number: string | null
          created_at: string
          email: string
          grade_level: string | null
          id: string
          nickname: string
          registration_number: string | null
          role: Database["public"]["Enums"]["app_role"] | null
          school_tag_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          contact_email?: string | null
          contact_number?: string | null
          created_at?: string
          email: string
          grade_level?: string | null
          id?: string
          nickname: string
          registration_number?: string | null
          role?: Database["public"]["Enums"]["app_role"] | null
          school_tag_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          contact_email?: string | null
          contact_number?: string | null
          created_at?: string
          email?: string
          grade_level?: string | null
          id?: string
          nickname?: string
          registration_number?: string | null
          role?: Database["public"]["Enums"]["app_role"] | null
          school_tag_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_school_tag_id_fkey"
            columns: ["school_tag_id"]
            isOneToOne: false
            referencedRelation: "school_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      school_tags: {
        Row: {
          color: string | null
          created_at: string
          created_by: string
          description: string | null
          display_name: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          display_name: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          display_name?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      student_marks: {
        Row: {
          created_at: string
          custom_student_name: string | null
          grade_level: string
          id: string
          marks: number
          registration_number: string | null
          student_id: string
          subject_name: string
          teacher_id: string
          teacher_name: string | null
          term: string
          updated_at: string
          year: number
        }
        Insert: {
          created_at?: string
          custom_student_name?: string | null
          grade_level: string
          id?: string
          marks: number
          registration_number?: string | null
          student_id: string
          subject_name: string
          teacher_id: string
          teacher_name?: string | null
          term: string
          updated_at?: string
          year?: number
        }
        Update: {
          created_at?: string
          custom_student_name?: string | null
          grade_level?: string
          id?: string
          marks?: number
          registration_number?: string | null
          student_id?: string
          subject_name?: string
          teacher_id?: string
          teacher_name?: string | null
          term?: string
          updated_at?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_teacher_profile"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_marks_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_marks_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      study_sessions: {
        Row: {
          activity_id: string | null
          activity_type: string
          completed_at: string | null
          duration_minutes: number
          id: string
          started_at: string
          user_id: string
        }
        Insert: {
          activity_id?: string | null
          activity_type: string
          completed_at?: string | null
          duration_minutes?: number
          id?: string
          started_at?: string
          user_id: string
        }
        Update: {
          activity_id?: string | null
          activity_type?: string
          completed_at?: string | null
          duration_minutes?: number
          id?: string
          started_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subjects: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          description_si: string | null
          grade_level: string | null
          icon: string | null
          id: string
          name: string
          name_si: string | null
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          description_si?: string | null
          grade_level?: string | null
          icon?: string | null
          id?: string
          name: string
          name_si?: string | null
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          description_si?: string | null
          grade_level?: string | null
          icon?: string | null
          id?: string
          name?: string
          name_si?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      test_attempts: {
        Row: {
          answers: Json | null
          completed_at: string | null
          earned_points: number | null
          id: string
          score: number | null
          started_at: string
          test_id: string
          total_points: number | null
          user_id: string
        }
        Insert: {
          answers?: Json | null
          completed_at?: string | null
          earned_points?: number | null
          id?: string
          score?: number | null
          started_at?: string
          test_id: string
          total_points?: number | null
          user_id: string
        }
        Update: {
          answers?: Json | null
          completed_at?: string | null
          earned_points?: number | null
          id?: string
          score?: number | null
          started_at?: string
          test_id?: string
          total_points?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "test_attempts_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "tests"
            referencedColumns: ["id"]
          },
        ]
      }
      test_questions: {
        Row: {
          correct_answer: string
          created_at: string
          explanation: string | null
          explanation_si: string | null
          id: string
          options: Json | null
          options_si: Json | null
          order_index: number | null
          points: number | null
          question_text: string
          question_text_si: string | null
          question_type: string | null
          test_id: string
        }
        Insert: {
          correct_answer: string
          created_at?: string
          explanation?: string | null
          explanation_si?: string | null
          id?: string
          options?: Json | null
          options_si?: Json | null
          order_index?: number | null
          points?: number | null
          question_text: string
          question_text_si?: string | null
          question_type?: string | null
          test_id: string
        }
        Update: {
          correct_answer?: string
          created_at?: string
          explanation?: string | null
          explanation_si?: string | null
          id?: string
          options?: Json | null
          options_si?: Json | null
          order_index?: number | null
          points?: number | null
          question_text?: string
          question_text_si?: string | null
          question_type?: string | null
          test_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "test_questions_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "tests"
            referencedColumns: ["id"]
          },
        ]
      }
      tests: {
        Row: {
          created_at: string
          description: string | null
          description_si: string | null
          difficulty_level: string | null
          grade_level: string | null
          id: string
          is_published: boolean | null
          subject_id: string | null
          time_limit_minutes: number | null
          title: string
          title_si: string | null
          total_questions: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          description_si?: string | null
          difficulty_level?: string | null
          grade_level?: string | null
          id?: string
          is_published?: boolean | null
          subject_id?: string | null
          time_limit_minutes?: number | null
          title: string
          title_si?: string | null
          total_questions?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          description_si?: string | null
          difficulty_level?: string | null
          grade_level?: string | null
          id?: string
          is_published?: boolean | null
          subject_id?: string | null
          time_limit_minutes?: number | null
          title?: string
          title_si?: string | null
          total_questions?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tests_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      timetable_entries: {
        Row: {
          created_at: string
          description: string | null
          end_time: string
          entry_type: string | null
          id: string
          is_recurring: boolean | null
          notification_enabled: boolean | null
          recurrence_pattern: string | null
          start_time: string
          subject_name: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_time: string
          entry_type?: string | null
          id?: string
          is_recurring?: boolean | null
          notification_enabled?: boolean | null
          recurrence_pattern?: string | null
          start_time: string
          subject_name?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          end_time?: string
          entry_type?: string | null
          id?: string
          is_recurring?: boolean | null
          notification_enabled?: boolean | null
          recurrence_pattern?: string | null
          start_time?: string
          subject_name?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_id: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
        ]
      }
      user_school_tags: {
        Row: {
          assigned_at: string
          assigned_by: string
          id: string
          school_tag_id: string
          user_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by: string
          id?: string
          school_tag_id: string
          user_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string
          id?: string
          school_tag_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_school_tags_school_tag_id_fkey"
            columns: ["school_tag_id"]
            isOneToOne: false
            referencedRelation: "school_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      video_progress: {
        Row: {
          completed: boolean | null
          created_at: string
          id: string
          last_position_seconds: number | null
          updated_at: string
          user_id: string
          video_id: string
          watch_time_minutes: number | null
        }
        Insert: {
          completed?: boolean | null
          created_at?: string
          id?: string
          last_position_seconds?: number | null
          updated_at?: string
          user_id: string
          video_id: string
          watch_time_minutes?: number | null
        }
        Update: {
          completed?: boolean | null
          created_at?: string
          id?: string
          last_position_seconds?: number | null
          updated_at?: string
          user_id?: string
          video_id?: string
          watch_time_minutes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "video_progress_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "youtube_videos"
            referencedColumns: ["id"]
          },
        ]
      }
      youtube_videos: {
        Row: {
          created_at: string
          description: string | null
          description_si: string | null
          difficulty_level: string | null
          duration_minutes: number | null
          grade_level: string | null
          id: string
          is_published: boolean | null
          subject_id: string | null
          thumbnail_url: string | null
          title: string
          title_si: string | null
          updated_at: string
          view_count: number | null
          youtube_url: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          description_si?: string | null
          difficulty_level?: string | null
          duration_minutes?: number | null
          grade_level?: string | null
          id?: string
          is_published?: boolean | null
          subject_id?: string | null
          thumbnail_url?: string | null
          title: string
          title_si?: string | null
          updated_at?: string
          view_count?: number | null
          youtube_url: string
        }
        Update: {
          created_at?: string
          description?: string | null
          description_si?: string | null
          difficulty_level?: string | null
          duration_minutes?: number | null
          grade_level?: string | null
          id?: string
          is_published?: boolean | null
          subject_id?: string | null
          thumbnail_url?: string | null
          title?: string
          title_si?: string | null
          updated_at?: string
          view_count?: number | null
          youtube_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "youtube_videos_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      has_teacher_access: {
        Args: { _user_id: string }
        Returns: boolean
      }
      promote_user_to_admin: {
        Args: { _nickname: string }
        Returns: boolean
      }
      send_message_to_all_admins: {
        Args: {
          message_content: string
          message_title: string
          sender_contact: string
          sender_name: string
        }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "student" | "teacher" | "admin"
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
      app_role: ["student", "teacher", "admin"],
    },
  },
} as const
