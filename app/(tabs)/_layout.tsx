import { Tabs } from 'expo-router';
import { Bell, Calendar, Plus, Settings, User } from 'lucide-react-native';
import { View, StyleSheet } from 'react-native';
import { AuthGuard } from '../../components/AuthGuard';

export default function TabLayout() {
  return (
    <AuthGuard>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: styles.tabBar,
          tabBarActiveTintColor: '#3B82F6',
          tabBarInactiveTintColor: '#6B7280',
          tabBarShowLabel: true,
          tabBarLabelStyle: styles.tabBarLabel,
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Reminders',
            tabBarIcon: ({ size, color }) => (
              <Bell size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="calendar"
          options={{
            title: 'Calendar',
            tabBarIcon: ({ size, color }) => (
              <Calendar size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="create"
          options={{
            title: 'Create',
            tabBarIcon: ({ size, color }) => (
              <View style={styles.createButtonContainer}>
                <Plus size={size} color="white" />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="shared"
          options={{
            title: 'Shared',
            tabBarIcon: ({ size, color }) => (
              <User size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ size, color }) => (
              <Settings size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingBottom: 8,
    paddingTop: 8,
    height: 70,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  createButtonContainer: {
    backgroundColor: '#3B82F6',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});