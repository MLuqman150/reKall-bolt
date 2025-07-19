import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { Image } from 'expo-image';
import { Clock, User, ChevronRight, FileText, Video, Image as ImageIcon } from 'lucide-react-native';
import { Database } from '../types/database';

type Reminder = Database['public']['Tables']['reminders']['Row'];

interface ReminderCardProps {
  reminder: Reminder;
  currentUserId?: string;
  onPress?: () => void;
}

export function ReminderCard({ reminder, currentUserId, onPress }: ReminderCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays === 1) {
      return `Tomorrow at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays === -1) {
      return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
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
        return <ImageIcon size={16} color="#6B7280" />;
      case 'video':
        return <Video size={16} color="#6B7280" />;
      default:
        return <FileText size={16} color="#6B7280" />;
    }
  };

  const renderMediaItem = ({ item }: { item: any }) => (
    <View style={styles.mediaItem}>
      {item.type === 'image' ? (
        <Image source={{ uri: item.url }} style={styles.mediaImage} />
      ) : (
        <View style={styles.mediaFile}>
          {getMediaIcon(item.type)}
          <Text style={styles.mediaFileName} numberOfLines={1}>
            {item.filename}
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{reminder.title}</Text>
          {reminder.is_recurring && (
            <View style={styles.recurringBadge}>
              <Text style={styles.recurringText}>Recurring</Text>
            </View>
          )}
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(reminder.status) }]}>
          <Text style={styles.statusText}>{reminder.status}</Text>
        </View>
      </View>

      {reminder.description && (
        <Text style={styles.description} numberOfLines={2}>
          {reminder.description}
        </Text>
      )}

      <View style={styles.metaContainer}>
        <View style={styles.metaItem}>
          <Clock size={16} color="#6B7280" />
          <Text style={styles.metaText}>{formatDate(reminder.scheduled_at)}</Text>
        </View>
        {reminder.assigned_to && reminder.assigned_to !== currentUserId && (
          <View style={styles.metaItem}>
            <User size={16} color="#6B7280" />
            <Text style={styles.metaText}>Assigned</Text>
          </View>
        )}
      </View>

      {reminder.media_attachments && reminder.media_attachments.length > 0 && (
        <View style={styles.mediaContainer}>
          <FlatList
            data={reminder.media_attachments.slice(0, 3)}
            renderItem={renderMediaItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
          {reminder.media_attachments.length > 3 && (
            <View style={styles.moreMedia}>
              <Text style={styles.moreMediaText}>
                +{reminder.media_attachments.length - 3} more
              </Text>
            </View>
          )}
        </View>
      )}

      <View style={styles.footer}>
        <View style={styles.footerLeft}>
          {reminder.created_by !== currentUserId && (
            <Text style={styles.creatorText}>
              Created by {reminder.created_by}
            </Text>
          )}
        </View>
        <ChevronRight size={16} color="#6B7280" />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  recurringBadge: {
    backgroundColor: '#EDE9FE',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  recurringText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#7C3AED',
  },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    textTransform: 'capitalize',
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 12,
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
  mediaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
    gap: 4,
  },
  mediaFileName: {
    fontSize: 8,
    color: '#6B7280',
    textAlign: 'center',
  },
  moreMedia: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreMediaText: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '600',
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerLeft: {
    flex: 1,
  },
  creatorText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
});