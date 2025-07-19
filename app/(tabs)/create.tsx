import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Switch,
  FlatList,
} from 'react-native';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../hooks/useNotifications';
import { SubscriptionService } from '../../services/subscriptionService';
import { PremiumGate } from '../../components/PremiumGate';
import { MediaService, MediaAttachment } from '../../services/mediaService';
import { Image } from 'expo-image';
import { Calendar, Clock, Image as ImageIcon, Video, FileText, X, Plus } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Platform } from 'react-native';

export default function CreateReminderTab() {
  const { user } = useAuth();
  const { scheduleNotification } = useNotifications();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [scheduledDate, setScheduledDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [mediaAttachments, setMediaAttachments] = useState<MediaAttachment[]>([]);
  const [assignedTo, setAssignedTo] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPremiumGate, setShowPremiumGate] = useState(false);
  const [subscriptionTier, setSubscriptionTier] = useState<'free' | 'pro'>('free');

  useEffect(() => {
    if (user) {
      fetchUserSubscription();
    }
  }, [user]);

  const fetchUserSubscription = async () => {
    if (!user) return;
    const profile = await SubscriptionService.getUserSubscription(user.id);
    if (profile) {
      setSubscriptionTier(profile.subscription_tier || 'free');
    }
  };

  const handleAddMedia = async (type: 'image' | 'video' | 'file') => {
    // Check subscription limits
    if (!SubscriptionService.canAddAttachment(mediaAttachments.length, subscriptionTier)) {
      setShowPremiumGate(true);
      return;
    }

    let attachment: MediaAttachment | null = null;
    
    try {
      switch (type) {
        case 'image':
          attachment = await MediaService.pickImage();
          break;
        case 'video':
          attachment = await MediaService.pickVideo();
          break;
        case 'file':
          attachment = await MediaService.pickDocument();
          break;
      }
      
      if (attachment) {
        setMediaAttachments(prev => [...prev, attachment!]);
      }
    } catch (error) {
      console.error('Error adding media:', error);
      Alert.alert('Error', 'Failed to add media attachment');
    }
  };

  const removeMedia = (id: string) => {
    if (!SubscriptionService.canCreateRecurringReminder(subscriptionTier)) {
      setShowPremiumGate(true);
      return;
    }
    setMediaAttachments(prev => prev.filter(item => item.id !== id));
  };

  const handleUpgrade = async () => {
    if (!user) return;
    
    try {
      const checkoutUrl = await SubscriptionService.initializeStripePayment(user.id);
      if (checkoutUrl) {
        // Open Stripe checkout
        // This would typically open a web browser or in-app browser
        console.log('Redirect to:', checkoutUrl);
      }
    } catch (error) {
      console.error('Error initializing payment:', error);
    }
    setShowPremiumGate(false);
  };

  const handleCreateReminder = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title for your reminder');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'You must be logged in to create a reminder');
      return;
    }

    setLoading(true);
    
    try {
      const reminderData = {
        title: title.trim(),
        description: description.trim() || null,
        scheduled_at: scheduledDate.toISOString(),
        created_by: user.id,
        assigned_to: assignedTo || user.id,
        media_attachments: mediaAttachments,
        status: 'pending' as const,
        is_recurring: isRecurring,
        recurring_pattern: isRecurring ? 'daily' : null,
      };

      const { data, error } = await supabase
        .from('reminders')
        .insert([reminderData])
        .select()
        .single();

      if (error) throw error;

      // Schedule notification
      await scheduleNotification(data);

      Alert.alert('Success', 'Reminder created successfully!');
      
      // Reset form
      setTitle('');
      setDescription('');
      setScheduledDate(new Date());
      setIsRecurring(false);
      setMediaAttachments([]);
      setAssignedTo('');
      
    } catch (error) {
      console.error('Error creating reminder:', error);
      Alert.alert('Error', 'Failed to create reminder');
    } finally {
      setLoading(false);
    }
  };

  const renderMediaItem = ({ item }: { item: MediaAttachment }) => (
    <View style={styles.mediaItem}>
      {item.type === 'image' ? (
        <Image source={{ uri: item.url }} style={styles.mediaPreview} />
      ) : (
        <View style={styles.mediaFile}>
          <Text style={styles.mediaFileName} numberOfLines={1}>
            {item.filename}
          </Text>
        </View>
      )}
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => removeMedia(item.id)}
      >
        <X size={16} color="#EF4444" />
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Create Reminder</Text>
        <Text style={styles.headerSubtitle}>
          Add a new reminder with optional media attachments
        </Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Title *</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Enter reminder title"
            placeholderTextColor="#9CA3AF"
            maxLength={100}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Enter reminder description (optional)"
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Scheduled Date & Time</Text>
          <View style={styles.dateTimeContainer}>
            <TouchableOpacity
              style={styles.dateTimeButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Calendar size={20} color="#3B82F6" />
              <Text style={styles.dateTimeText}>
                {scheduledDate.toLocaleDateString()}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.dateTimeButton}
              onPress={() => setShowTimePicker(true)}
            >
              <Clock size={20} color="#3B82F6" />
              <Text style={styles.dateTimeText}>
                {scheduledDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={scheduledDate}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowDatePicker(Platform.OS === 'ios');
              if (selectedDate) {
                setScheduledDate(selectedDate);
              }
            }}
          />
        )}

        {showTimePicker && (
          <DateTimePicker
            value={scheduledDate}
            mode="time"
            display="default"
            onChange={(event, selectedTime) => {
              setShowTimePicker(Platform.OS === 'ios');
              if (selectedTime) {
                setScheduledDate(selectedTime);
              }
            }}
          />
        )}

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Assign To (Email)</Text>
          <TextInput
            style={styles.input}
            value={assignedTo}
            onChangeText={setAssignedTo}
            placeholder="Enter email address (optional)"
            placeholderTextColor="#9CA3AF"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.switchContainer}>
          <Text style={styles.label}>Recurring Reminder</Text>
          <Switch
            value={isRecurring}
            onValueChange={handleRecurringToggle}
            trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
            thumbColor={isRecurring ? '#FFFFFF' : '#9CA3AF'}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Media Attachments</Text>
          <View style={styles.mediaButtons}>
            <TouchableOpacity
              style={styles.mediaButton}
              onPress={() => handleAddMedia('image')}
            >
              <ImageIcon size={20} color="#3B82F6" />
              <Text style={styles.mediaButtonText}>Image</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.mediaButton}
              onPress={() => handleAddMedia('video')}
            >
              <Video size={20} color="#3B82F6" />
              <Text style={styles.mediaButtonText}>Video</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.mediaButton}
              onPress={() => handleAddMedia('file')}
            >
              <FileText size={20} color="#3B82F6" />
              <Text style={styles.mediaButtonText}>File</Text>
            </TouchableOpacity>
          </View>
          
          {mediaAttachments.length > 0 && (
            <FlatList
              data={mediaAttachments}
              renderItem={renderMediaItem}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.mediaList}
            />
          )}
        </View>

        <TouchableOpacity
          style={[styles.createButton, loading && styles.createButtonDisabled]}
          onPress={handleCreateReminder}
          disabled={loading}
        >
          <Plus size={20} color="#FFFFFF" />
          <Text style={styles.createButtonText}>
            {loading ? 'Creating...' : 'Create Reminder'}
          </Text>
        </TouchableOpacity>
      </View>

      <PremiumGate
        visible={showPremiumGate}
        onClose={() => setShowPremiumGate(false)}
        onUpgrade={handleUpgrade}
        feature="unlimited attachments and recurring reminders"
      />
    </ScrollView>
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
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#111827',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  dateTimeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  dateTimeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
  },
  dateTimeText: {
    fontSize: 16,
    color: '#111827',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  mediaButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  mediaButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
  },
  mediaButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
  },
  mediaList: {
    paddingTop: 12,
  },
  mediaItem: {
    position: 'relative',
    marginRight: 12,
  },
  mediaPreview: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  mediaFile: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  mediaFileName: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
  },
  createButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});