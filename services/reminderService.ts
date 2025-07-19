import { supabase } from '../lib/supabase';
import { Database } from '../types/database';
import { MediaAttachment } from './mediaService';

type Reminder = Database['public']['Tables']['reminders']['Row'];
type ReminderInsert = Database['public']['Tables']['reminders']['Insert'];
type ReminderUpdate = Database['public']['Tables']['reminders']['Update'];

export class ReminderService {
  static async createReminder(reminderData: {
    title: string;
    description?: string;
    scheduled_at: string;
    created_by: string;
    assigned_to?: string;
    media_attachments?: MediaAttachment[];
    is_recurring?: boolean;
    recurring_pattern?: string;
  }): Promise<Reminder | null> {
    try {
      const { data, error } = await supabase
        .from('reminders')
        .insert([{
          ...reminderData,
          status: 'pending',
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating reminder:', error);
      return null;
    }
  }

  static async getUserReminders(userId: string): Promise<Reminder[]> {
    try {
      const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .or(`created_by.eq.${userId},assigned_to.eq.${userId}`)
        .order('scheduled_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching reminders:', error);
      return [];
    }
  }

  static async getSharedReminders(userId: string): Promise<Reminder[]> {
    try {
      const { data, error } = await supabase
        .from('shared_reminders')
        .select(`
          reminder_id,
          reminders (*)
        `)
        .eq('shared_with', userId);

      if (error) throw error;
      return data?.map(item => item.reminders).filter(Boolean) || [];
    } catch (error) {
      console.error('Error fetching shared reminders:', error);
      return [];
    }
  }

  static async updateReminderStatus(
    reminderId: string,
    status: 'pending' | 'completed' | 'cancelled'
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('reminders')
        .update({ 
          status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', reminderId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating reminder status:', error);
      return false;
    }
  }

  static async shareReminder(
    reminderId: string,
    sharedWithUserId: string,
    permission: 'view' | 'edit' = 'view'
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('shared_reminders')
        .insert([{
          reminder_id: reminderId,
          shared_with: sharedWithUserId,
          permission,
        }]);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error sharing reminder:', error);
      return false;
    }
  }

  static async deleteReminder(reminderId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('reminders')
        .delete()
        .eq('id', reminderId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting reminder:', error);
      return false;
    }
  }

  static async searchUsers(query: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, display_name, avatar_url')
        .or(`email.ilike.%${query}%,display_name.ilike.%${query}%`)
        .limit(10);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching users:', error);
      return [];
    }
  }

  static async getUpcomingReminders(userId: string, hours: number = 24): Promise<Reminder[]> {
    try {
      const now = new Date();
      const future = new Date(now.getTime() + (hours * 60 * 60 * 1000));

      const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .or(`created_by.eq.${userId},assigned_to.eq.${userId}`)
        .eq('status', 'pending')
        .gte('scheduled_at', now.toISOString())
        .lte('scheduled_at', future.toISOString())
        .order('scheduled_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching upcoming reminders:', error);
      return [];
    }
  }
}