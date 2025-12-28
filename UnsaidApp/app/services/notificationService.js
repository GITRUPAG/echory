import api from './api';

export const notificationService = {

  // 🔔 GET ALL NOTIFICATIONS (auth)
  // GET /api/notifications
  getNotifications: () =>
    api.get('/notifications'),

  // 🔴 GET UNREAD COUNT (auth)
  // GET /api/notifications/unread-count
  getUnreadCount: () =>
    api.get('/notifications/unread-count'),

  // ✅ MARK NOTIFICATION AS READ (auth)
  // POST /api/notifications/{id}/read
  markAsRead: (notificationId) =>
    api.post(`/notifications/${notificationId}/read`),

};
