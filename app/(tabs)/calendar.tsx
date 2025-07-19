import { View, Text, StyleSheet } from 'react-native';
import { Calendar } from 'lucide-react-native';

export default function CalendarTab() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Calendar</Text>
        <Text style={styles.headerSubtitle}>
          View reminders in calendar format
        </Text>
      </View>
      
      <View style={styles.content}>
        <View style={styles.comingSoon}>
          <Calendar size={64} color="#3B82F6" />
          <Text style={styles.comingSoonTitle}>Calendar View</Text>
          <Text style={styles.comingSoonText}>
            Calendar integration coming soon! View your reminders in a beautiful calendar layout.
          </Text>
        </View>
      </View>
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
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  comingSoon: {
    alignItems: 'center',
    maxWidth: 300,
  },
  comingSoonTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  comingSoonText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
});