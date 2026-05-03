export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      activity_feed: {
        Row: {
          amount: number | null;
          created_at: string;
          id: string;
          kind: string;
        };
        Insert: {
          amount?: number | null;
          created_at?: string;
          id?: string;
          kind: string;
        };
        Update: {
          amount?: number | null;
          created_at?: string;
          id?: string;
          kind?: string;
        };
        Relationships: [];
      };
      challenges: {
        Row: {
          created_at: string;
          goal_amount: number;
          id: string;
          kind: string;
          progress: number;
          status: string;
          user_id: string;
          week_start: string;
        };
        Insert: {
          created_at?: string;
          goal_amount?: number;
          id?: string;
          kind: string;
          progress?: number;
          status?: string;
          user_id: string;
          week_start: string;
        };
        Update: {
          created_at?: string;
          goal_amount?: number;
          id?: string;
          kind?: string;
          progress?: number;
          status?: string;
          user_id?: string;
          week_start?: string;
        };
        Relationships: [];
      };
      debts: {
        Row: {
          balance: number;
          created_at: string;
          debt_type: string;
          due_day: number | null;
          id: string;
          initial_balance: number;
          interest_rate: number;
          minimum_payment: number;
          name: string;
          user_id: string;
        };
        Insert: {
          balance: number;
          created_at?: string;
          debt_type?: string;
          due_day?: number | null;
          id?: string;
          initial_balance: number;
          interest_rate?: number;
          minimum_payment?: number;
          name: string;
          user_id: string;
        };
        Update: {
          balance?: number;
          created_at?: string;
          debt_type?: string;
          due_day?: number | null;
          id?: string;
          initial_balance?: number;
          interest_rate?: number;
          minimum_payment?: number;
          name?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      milestones: {
        Row: {
          achieved_at: string;
          id: string;
          milestone_key: string;
          user_id: string;
        };
        Insert: {
          achieved_at?: string;
          id?: string;
          milestone_key: string;
          user_id: string;
        };
        Update: {
          achieved_at?: string;
          id?: string;
          milestone_key?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      payments: {
        Row: {
          amount: number;
          cleared_debt: boolean;
          created_at: string;
          debt_id: string;
          id: string;
          paid_at: string;
          user_id: string;
        };
        Insert: {
          amount: number;
          cleared_debt?: boolean;
          created_at?: string;
          debt_id: string;
          id?: string;
          paid_at?: string;
          user_id: string;
        };
        Update: {
          amount?: number;
          cleared_debt?: boolean;
          created_at?: string;
          debt_id?: string;
          id?: string;
          paid_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "payments_debt_id_fkey";
            columns: ["debt_id"];
            isOneToOne: false;
            referencedRelation: "debts";
            referencedColumns: ["id"];
          },
        ];
      };
      personal_bests: {
        Row: {
          created_at: string;
          id: string;
          period: string;
          period_start: string;
          total_amount: number;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          period: string;
          period_start: string;
          total_amount: number;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          period?: string;
          period_start?: string;
          total_amount?: number;
          user_id?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          created_at: string;
          debt_free_reason: string | null;
          display_name: string | null;
          extra_monthly: number;
          id: string;
          onboarding_completed: boolean;
          strategy: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          debt_free_reason?: string | null;
          display_name?: string | null;
          extra_monthly?: number;
          id: string;
          onboarding_completed?: boolean;
          strategy?: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          debt_free_reason?: string | null;
          display_name?: string | null;
          extra_monthly?: number;
          id?: string;
          onboarding_completed?: boolean;
          strategy?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      streaks: {
        Row: {
          created_at: string;
          has_extra_payment: boolean;
          id: string;
          no_unnecessary_spending: boolean;
          user_id: string;
          week_start: string;
        };
        Insert: {
          created_at?: string;
          has_extra_payment?: boolean;
          id?: string;
          no_unnecessary_spending?: boolean;
          user_id: string;
          week_start: string;
        };
        Update: {
          created_at?: string;
          has_extra_payment?: boolean;
          id?: string;
          no_unnecessary_spending?: boolean;
          user_id?: string;
          week_start?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
