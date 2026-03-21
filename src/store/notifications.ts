import { create } from "zustand"

interface Notification {
  id: string
  type: string
  message: string
  isRead: boolean
  createdAt: string
  ecoId: string
  eco?: { title?: string }
}

interface NotificationStore {
  notifications: Notification[]
  unreadCount: number
  setNotifications: (n: Notification[]) => void
  markRead: (id: string) => void
  markAllRead: () => void
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],
  unreadCount: 0,

  setNotifications: (notifications) =>
    set({
      notifications,
      unreadCount: notifications.filter((n) => !n.isRead).length,
    }),

  markRead: (id) =>
    set((state) => {
      const updated = state.notifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n
      )
      return {
        notifications: updated,
        unreadCount: updated.filter((n) => !n.isRead).length,
      }
    }),

  markAllRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    })),
}))
