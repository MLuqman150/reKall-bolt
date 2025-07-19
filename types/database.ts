export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          display_name: string | null;
          avatar_url: string | null;
          notification_preferences: {
            push_enabled: boolean;
            call_popup_enabled: boolean;
            sound_enabled: boolean;
          };
          subscription_tier: 'free' | 'pro';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          display_name?: string | null;
          avatar_url?: string | null;
          notification_preferences?: {
            push_enabled: boolean;
            call_popup_enabled: boolean;
            sound_enabled: boolean;
          };
          subscription_tier?: 'free' | 'pro';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          notification_preferences?: {
            push_enabled: boolean;
            call_popup_enabled: boolean;
            sound_enabled: boolean;
          };
          subscription_tier?: 'free' | 'pro';
          created_at?: string;
          updated_at?: string;
        };
      };
      reminders: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          scheduled_at: string;
          created_by: string;
          assigned_to: string | null;
          media_attachments: {
            id: string;
            type: 'image' | 'video' | 'file';
            url: string;
            filename: string;
            size: number;
          }[];
          status: 'pending' | 'completed' | 'cancelled';
          recurring_pattern: string | null;
          is_recurring: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          scheduled_at: string;
          created_by: string;
          assigned_to?: string | null;
          media_attachments?: {
            id: string;
            type: 'image' | 'video' | 'file';
            url: string;
            filename: string;
            size: number;
          }[];
          status?: 'pending' | 'completed' | 'cancelled';
          recurring_pattern?: string | null;
          is_recurring?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          scheduled_at?: string;
          created_by?: string;
          assigned_to?: string | null;
          media_attachments?: {
            id: string;
            type: 'image' | 'video' | 'file';
            url: string;
            filename: string;
            size: number;
          }[];
          status?: 'pending' | 'completed' | 'cancelled';
          recurring_pattern?: string | null;
          is_recurring?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      shared_reminders: {
        Row: {
          id: string;
          reminder_id: string;
          shared_with: string;
          permission: 'view' | 'edit';
          created_at: string;
        };
        Insert: {
          id?: string;
          reminder_id: string;
          shared_with: string;
          permission?: 'view' | 'edit';
          created_at?: string;
        };
        Update: {
          id?: string;
          reminder_id?: string;
          shared_with?: string;
          permission?: 'view' | 'edit';
          created_at?: string;
        };
      };
    };
  };
}