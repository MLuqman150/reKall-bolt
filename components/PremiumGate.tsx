import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { Crown, X, Check } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface PremiumGateProps {
  visible: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  feature: string;
}

export function PremiumGate({ visible, onClose, onUpgrade, feature }: PremiumGateProps) {
  const premiumFeatures = [
    'Unlimited media attachments',
    'Recurring reminders',
    'Advanced collaboration',
    'Priority notifications',
    'Export reminders',
    'Custom themes',
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.container}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <X size={24} color="#6B7280" />
        </TouchableOpacity>

        <LinearGradient
          colors={['#3B82F6', '#8B5CF6']}
          style={styles.header}
        >
          <Crown size={48} color="#FFFFFF" />
          <Text style={styles.headerTitle}>Upgrade to Pro</Text>
          <Text style={styles.headerSubtitle}>
            Unlock {feature} and more premium features
          </Text>
        </LinearGradient>

        <View style={styles.content}>
          <View style={styles.featuresContainer}>
            <Text style={styles.featuresTitle}>What's included:</Text>
            {premiumFeatures.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <Check size={20} color="#10B981" />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>

          <View style={styles.pricingContainer}>
            <View style={styles.pricingCard}>
              <Text style={styles.pricingTitle}>Pro Plan</Text>
              <View style={styles.priceContainer}>
                <Text style={styles.price}>$4.99</Text>
                <Text style={styles.pricePeriod}>/month</Text>
              </View>
              <Text style={styles.pricingSubtitle}>
                Cancel anytime • 7-day free trial
              </Text>
            </View>
          </View>

          <TouchableOpacity style={styles.upgradeButton} onPress={onUpgrade}>
            <LinearGradient
              colors={['#3B82F6', '#8B5CF6']}
              style={styles.upgradeGradient}
            >
              <Text style={styles.upgradeButtonText}>Start Free Trial</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.laterButton} onPress={onClose}>
            <Text style={styles.laterButtonText}>Maybe Later</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  closeButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    paddingTop: 80,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#E5E7EB',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  featuresContainer: {
    marginBottom: 32,
  },
  featuresTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  featureText: {
    fontSize: 16,
    color: '#374151',
  },
  pricingContainer: {
    marginBottom: 32,
  },
  pricingCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  pricingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  price: {
    fontSize: 36,
    fontWeight: '700',
    color: '#3B82F6',
  },
  pricePeriod: {
    fontSize: 16,
    color: '#6B7280',
    marginLeft: 4,
  },
  pricingSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  upgradeButton: {
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  upgradeGradient: {
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
  },
  upgradeButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  laterButton: {
    alignItems: 'center',
    padding: 16,
  },
  laterButtonText: {
    fontSize: 16,
    color: '#6B7280',
  },
});