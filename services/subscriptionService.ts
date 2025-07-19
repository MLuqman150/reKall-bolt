import { supabase } from '../lib/supabase';
import { Database } from '../types/database';

type Profile = Database['public']['Tables']['profiles']['Row'];

export interface SubscriptionLimits {
  maxAttachments: number;
  recurringReminders: boolean;
  collaborationFeatures: boolean;
  priorityNotifications: boolean;
}

export class SubscriptionService {
  static getSubscriptionLimits(tier: 'free' | 'pro'): SubscriptionLimits {
    switch (tier) {
      case 'pro':
        return {
          maxAttachments: -1, // Unlimited
          recurringReminders: true,
          collaborationFeatures: true,
          priorityNotifications: true,
        };
      case 'free':
      default:
        return {
          maxAttachments: 3,
          recurringReminders: false,
          collaborationFeatures: false,
          priorityNotifications: false,
        };
    }
  }

  static async getUserSubscription(userId: string): Promise<Profile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('subscription_tier')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user subscription:', error);
      return null;
    }
  }

  static async updateSubscriptionTier(
    userId: string,
    tier: 'free' | 'pro'
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          subscription_tier: tier,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating subscription tier:', error);
      return false;
    }
  }

  static canAddAttachment(
    currentAttachments: number,
    subscriptionTier: 'free' | 'pro'
  ): boolean {
    const limits = this.getSubscriptionLimits(subscriptionTier);
    if (limits.maxAttachments === -1) return true;
    return currentAttachments < limits.maxAttachments;
  }

  static canCreateRecurringReminder(subscriptionTier: 'free' | 'pro'): boolean {
    const limits = this.getSubscriptionLimits(subscriptionTier);
    return limits.recurringReminders;
  }

  static canUseCollaboration(subscriptionTier: 'free' | 'pro'): boolean {
    const limits = this.getSubscriptionLimits(subscriptionTier);
    return limits.collaborationFeatures;
  }

  // Stripe integration placeholder
  static async initializeStripePayment(userId: string): Promise<string | null> {
    try {
      // This would typically call a Supabase Edge Function
      // that creates a Stripe checkout session
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          userId,
          priceId: 'price_1234567890', // Your Stripe price ID
          successUrl: 'myapp://subscription/success',
          cancelUrl: 'myapp://subscription/cancel',
        },
      });

      if (error) throw error;
      return data.checkoutUrl;
    } catch (error) {
      console.error('Error creating Stripe checkout session:', error);
      return null;
    }
  }

  static async handleSubscriptionWebhook(
    userId: string,
    subscriptionStatus: string
  ): Promise<void> {
    try {
      const tier = subscriptionStatus === 'active' ? 'pro' : 'free';
      await this.updateSubscriptionTier(userId, tier);
    } catch (error) {
      console.error('Error handling subscription webhook:', error);
    }
  }
}