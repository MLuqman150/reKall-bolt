import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
  FlatList,
} from 'react-native';
import { Image } from 'expo-image';
import { BlurView } from 'expo-blur';
import { X, Clock, User, FileText, Video, Image as ImageIcon, Check, Circle as XCircle, Share, CreditCard as Edit } from 'lucide-react-native';
import { Database } from '../types/database';
import { ReminderService } from '../services/reminderService';

type Reminder = Database['public']['Tables']['reminders']['Row'];

interface ReminderDetailModalProps {
  visible: boolean;
  reminder: Reminder | null;
  currentUserId?: string;
  onClose: () => void;
  onUpdate: () => void;
}

export function ReminderDetailModal({
  visible,
  reminder,
  currentUserId,
  onClose,
  onUpdate,
}: ReminderDetailModalProps) {
  const [loading, setLoading] = useState(false);

  if (!reminder) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#10B981';
      case 'cancelled':
        return '#EF4444';
      default:
        return '#F59E0B';
    }
  };

  const getMediaIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <ImageIcon size={20} color="#6B7280" />;
      case 'video':
        return <Video size={20} color="#6B7280" />;
      default:
        return <FileText size={20} color="#6B7280" />;
    }
  };

  const handleStatusUpdate = async (status: 'completed' | 'cancelled') => {
    setLoading(true);
    try {
      const success = await ReminderService.updateReminderStatus(reminder.id, status);
      if (success) {
        onUpdate();
        onClose();
      } else {
        Alert.alert('Error', 'Failed to update reminder status');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update reminder status');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    Alert.alert(
      'Share Reminder',
      'Enter the email address of the person you want to share this reminder with:',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Share', onPress: () => {
          // Implement sharing logic
          console.log('Share reminder');
        }},
      ]
    );
  };

  const renderMediaItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.mediaItem}>
      {item.type === 'image' ? (
        <Image source={{ uri: item.url }} style={styles.mediaImage} />
      ) : (
        <View style={styles.mediaFile}>
          {getMediaIcon(item.type)}
          <Text style={styles.mediaFileName} numberOfLines={2}>
            {item.filename}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const canEdit = currentUserId === reminder.created_by;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.container}>
        <BlurView intensity={20} style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Reminder Details</Text>
          {canEdit && (
            <TouchableOpacity style={styles.editButton}>
              <Edit size={20} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </BlurView>

        <ScrollView style={styles.content}>
          <View style={styles.titleSection}>
            <Text style={styles.title}>{reminder.title}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(reminder.status) }]}>
              <Text style={styles.statusText}>{reminder.status}</Text>
            </View>
          </View>

          {reminder.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.description}>{reminder.description}</Text>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Scheduled Time</Text>
            <View style={styles.timeContainer}>
              <Clock size={20} color="#3B82F6" />
              <Text style={styles.timeText}>{formatDate(reminder.scheduled_at)}</Text>
            </View>
          </View>

          {reminder.assigned_to && reminder.assigned_to !== currentUserId && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Assigned To</Text>
              <View style={styles.assignedContainer}>
                <User size={20} color="#8B5CF6" />
                <Text style={styles.assignedText}>Another user</Text>
              </View>
            </View>
          )}

          {reminder.is_recurring && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Recurring</Text>
              <Text style={styles.recurringText}>
                This reminder repeats {reminder.recurring_pattern || 'regularly'}
              </Text>
            </View>
          )}

          {reminder.media_attachments && reminder.media_attachments.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Attachments ({reminder.media_attachments.length})
              </Text>
              <FlatList
                data={reminder.media_attachments}
                renderItem={renderMediaItem}
                keyExtractor={(item) => item.id}
                numColumns={2}
                scrollEnabled={false}
              />
            </View>
          )}

          {reminder.status === 'pending' && (
            <View style={styles.actionsSection}>
              <TouchableOpacity
                style={[styles.actionButton, styles.completeButton]}
                onPress={() => handleStatusUpdate('completed')}
                disabled={loading}
              >
                <Check size={20} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>Mark Complete</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.cancelButton]}
                onPress={() => handleStatusUpdate('cancelled')}
                disabled={loading}
              >
                <XCircle size={20} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.shareButton]}
                onPress={handleShare}
              >
                <Share size={20} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>Share</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#3B82F6',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  title: {
    flex: 1,
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginRight: 16,
  },
  statusBadge: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    textTransform: 'capitalize',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeText: {
    fontSize: 16,
    color: '#374151',
  },
  assignedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  assignedText: {
    fontSize: 16,
    color: '#374151',
  },
  recurringText: {
    fontSize: 16,
    color: '#374151',
    fontStyle: 'italic',
  },
  mediaItem: {
    flex: 1,
    margin: 4,
    aspectRatio: 1,
  },
  mediaImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  mediaFile: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  mediaFileName: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 4,
  },
  actionsSection: {
    gap: 12,
    marginTop: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 12,
    padding: 16,
  },
  completeButton: {
    backgroundColor: '#10B981',
  },
  cancelButton: {
    backgroundColor: '#EF4444',
  },
  shareButton: {
    backgroundColor: '#8B5CF6',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});