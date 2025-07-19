import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { ReminderService } from '../../services/reminderService';
import { ReminderDetailModal } from '../../components/ReminderDetailModal';
import { Database } from '../../types/database';
import { Image } from 'expo-image';
import { Clock, User, ChevronRight } from 'lucide-react-native';

type Reminder = Database['public']['Tables']['reminders']['Row'];

export default function RemindersTab() {
  const { user } = useAuth();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState<Reminder | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    if (user) {
      fetchReminders();
    }
  }, [user]);

  const fetchReminders = async () => {
    try {
      if (!user) return;
      const data = await ReminderService.getUserReminders(user.id);
      setReminders(data);
    } catch (error) {
      console.error('Error fetching reminders:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleReminderPress = (reminder: Reminder) => {
    setSelectedReminder(reminder);
    setShowDetailModal(true);
  };

  const handleModalClose = () => {
    setShowDetailModal(false);
    setSelectedReminder(null);
  };

  const handleReminderUpdate = () => {
    fetchReminders();
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchReminders();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderReminder = ({ item }: { item: Reminder }) => (
    <TouchableOpacity 
      style={styles.reminderCard}
      onPress={() => handleReminderPress(item)}
    >
      <View style={styles.reminderHeader}>
        <View style={styles.reminderInfo}>
          <Text style={styles.reminderTitle}>{item.title}</Text>
          {item.description && (
            <Text style={styles.reminderDescription} numberOfLines={2}>
              {item.description}
            </Text>
          )}
        </View>
        <View style={styles.reminderMeta}>
          <View style={styles.metaItem}>
            <Clock size={16} color="#6B7280" />
            <Text style={styles.metaText}>{formatDate(item.scheduled_at)}</Text>
          </View>
          {item.assigned_to && item.assigned_to !== user?.id && (
            <View style={styles.metaItem}>
              <User size={16} color="#6B7280" />
              <Text style={styles.metaText}>Assigned</Text>
            </View>
          )}
        </View>
      </View>
      
      {item.media_attachments && item.media_attachments.length > 0 && (
        <View style={styles.mediaPreview}>
          <FlatList
            data={item.media_attachments.slice(0, 3)}
            horizontal
            renderItem={({ item: attachment }) => (
              <View style={styles.mediaItem}>
                {attachment.type === 'image' ? (
                  <Image source={{ uri: attachment.url }} style={styles.mediaImage} />
                ) : (
                  <View style={styles.mediaFile}>
                    <Text style={styles.mediaFileName} numberOfLines={1}>
                      {attachment.filename}
                    </Text>
                  </View>
                )}
              </View>
            )}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
          />
        </View>
      )}
      
      <View style={styles.reminderActions}>
        <View style={[styles.statusBadge, styles[`status${item.status}`]]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
        <ChevronRight size={16} color="#6B7280" />
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading reminders...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Reminders</Text>
        <Text style={styles.headerSubtitle}>
          {reminders.length} reminder{reminders.length !== 1 ? 's' : ''}
        </Text>
      </View>

      <FlatList
        data={reminders}
        renderItem={renderReminder}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No reminders yet</Text>
            <Text style={styles.emptySubtext}>
              Tap the + button to create your first reminder
            </Text>
          </View>
        }
      />

      <ReminderDetailModal
        visible={showDetailModal}
        reminder={selectedReminder}
        currentUserId={user?.id}
        onClose={handleModalClose}
        onUpdate={handleReminderUpdate}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  listContainer: {
    padding: 20,
  },
  reminderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  reminderHeader: {
    marginBottom: 12,
  },
  reminderInfo: {
    marginBottom: 8,
  },
  reminderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  reminderDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  reminderMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#6B7280',
  },
  mediaPreview: {
    marginBottom: 12,
  },
  mediaItem: {
    marginRight: 8,
  },
  mediaImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  mediaFile: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  mediaFileName: {
    fontSize: 10,
    color: '#6B7280',
    textAlign: 'center',
  },
  reminderActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statuspending: {
    backgroundColor: '#FEF3C7',
  },
  statuscompleted: {
    backgroundColor: '#D1FAE5',
  },
  statuscancelled: {
    backgroundColor: '#FEE2E2',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});