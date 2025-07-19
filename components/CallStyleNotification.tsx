import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { BlurView } from 'expo-blur';
import { Phone, PhoneOff, Clock, User } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

interface CallStyleNotificationProps {
  visible: boolean;
  reminder: {
    id: string;
    title: string;
    description?: string;
    media_attachments?: Array<{
      id: string;
      type: 'image' | 'video' | 'file';
      url: string;
      filename: string;
    }>;
    scheduled_at: string;
  };
  onAccept: () => void;
  onDismiss: () => void;
}

const { width, height } = Dimensions.get('window');

export function CallStyleNotification({
  visible,
  reminder,
  onAccept,
  onDismiss,
}: CallStyleNotificationProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (visible && Platform.OS !== 'web') {
      // Trigger haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      
      // Start animation
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 500);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getMediaPreview = () => {
    const imageAttachment = reminder.media_attachments?.find(
      (attachment) => attachment.type === 'image'
    );
    return imageAttachment?.url;
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      presentationStyle="overFullScreen"
      statusBarTranslucent
    >
      <View style={styles.container}>
        <BlurView intensity={20} style={styles.blurContainer}>
          <View style={styles.content}>
            {/* Avatar/Media Preview */}
            <View style={[styles.avatarContainer, isAnimating && styles.avatarAnimating]}>
              {getMediaPreview() ? (
                <Image source={{ uri: getMediaPreview() }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <User size={48} color="#FFFFFF" />
                </View>
              )}
            </View>

            {/* Reminder Info */}
            <View style={styles.infoContainer}>
              <Text style={styles.title}>{reminder.title}</Text>
              {reminder.description && (
                <Text style={styles.description} numberOfLines={2}>
                  {reminder.description}
                </Text>
              )}
              <View style={styles.timeContainer}>
                <Clock size={16} color="#FFFFFF" />
                <Text style={styles.timeText}>
                  Scheduled for {formatTime(reminder.scheduled_at)}
                </Text>
              </View>
            </View>

            {/* Media Attachments Count */}
            {reminder.media_attachments && reminder.media_attachments.length > 0 && (
              <View style={styles.attachmentsContainer}>
                <Text style={styles.attachmentsText}>
                  {reminder.media_attachments.length} attachment
                  {reminder.media_attachments.length !== 1 ? 's' : ''}
                </Text>
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.actionsContainer}>
              <TouchableOpacity
                style={[styles.actionButton, styles.dismissButton]}
                onPress={onDismiss}
              >
                <PhoneOff size={32} color="#FFFFFF" />
                <Text style={styles.actionText}>Dismiss</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.acceptButton]}
                onPress={onAccept}
              >
                <Phone size={32} color="#FFFFFF" />
                <Text style={styles.actionText}>View</Text>
              </TouchableOpacity>
            </View>
          </View>
        </BlurView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  blurContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 40,
    width: '100%',
  },
  avatarContainer: {
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  avatarAnimating: {
    transform: [{ scale: 1.1 }],
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  infoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#E5E7EB',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 22,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeText: {
    fontSize: 14,
    color: '#D1D5DB',
  },
  attachmentsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 40,
  },
  attachmentsText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 280,
    gap: 40,
  },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
    height: 80,
    borderRadius: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  dismissButton: {
    backgroundColor: '#EF4444',
  },
  acceptButton: {
    backgroundColor: '#10B981',
  },
  actionText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
    marginTop: 8,
  },
});