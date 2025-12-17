import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Card } from '../../components/common/Card';

export const NotificationsScreen = () => {
  const notifications = [
    {
      type: 'transaction',
      title: 'Transaction Successful',
      message: 'Your swap of 0.1 ETH to 180 USDT was successful',
      time: '2 minutes ago',
      read: false,
    },
    {
      type: 'price_alert',
      title: 'Price Alert',
      message: 'ETH is up 5% in the last hour',
      time: '1 hour ago',
      read: true,
    },
    {
      type: 'security',
      title: 'Security Alert',
      message: 'New device logged into your account',
      time: '2 hours ago',
      read: false,
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity>
          <Text style={styles.markAllRead}>Mark all as read</Text>
        </TouchableOpacity>
      </View>

      {notifications.map((notification, index) => (
        <Card 
          key={index}
          style={[
            styles.notificationCard,
            !notification.read && styles.unreadCard
          ]}
        >
          <View style={styles.notificationContent}>
            <View style={styles.notificationHeader}>
              <Text style={styles.notificationTitle}>
                {notification.title}
              </Text>
              <Text style={styles.notificationTime}>
                {notification.time}
              </Text>
            </View>
            <Text style={styles.notificationMessage}>
              {notification.message}
            </Text>
          </View>
        </Card>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  markAllRead: {
    color: '#FF007A',
    fontWeight: '500',
  },
  notificationCard: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  unreadCard: {
    borderLeftWidth: 3,
    borderLeftColor: '#FF007A',
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  notificationTime: {
    color: '#666',
    fontSize: 12,
  },
  notificationMessage: {
    color: '#444',
    lineHeight: 20,
  },
});
