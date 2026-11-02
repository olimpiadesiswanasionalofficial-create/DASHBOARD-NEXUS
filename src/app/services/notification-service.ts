import { Injectable, signal } from '@angular/core';

export interface PushNotificationItem {
  id: string;
  title: string;
  body: string;
  timestamp: string;
  type: 'security' | 'activation' | 'auth' | 'api' | 'nexus';
  read: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationState {
  readonly notifications = signal<PushNotificationItem[]>([
    {
      id: 'notif-1',
      title: 'Aktivasi Lisensi Berhasil',
      body: 'Lisensi LD-PREMIUM-2026 berhasil dipasangkan dengan akun utama.',
      timestamp: '1 menit yang lalu',
      type: 'activation',
      read: false,
    },
    {
      id: 'notif-2',
      title: 'Enkripsi E2EE Aktif',
      body: 'Kunci AES-256-GCM berhasil diinisiasi untuk brankas data Anda.',
      timestamp: '15 menit yang lalu',
      type: 'security',
      read: false,
    },
    {
      id: 'notif-3',
      title: 'Sinkronisasi Nexus Portal',
      body: 'Koneksi SSO terverifikasi ke https://nexus-lac-kappa.vercel.app/',
      timestamp: '1 jam yang lalu',
      type: 'nexus',
      read: true,
    },
  ]);

  readonly activeToast = signal<PushNotificationItem | null>(null);
  readonly pushPermission = signal<NotificationPermission>('default');

  constructor() {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      this.pushPermission.set(Notification.permission);
    }
  }

  async requestPermission(): Promise<boolean> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      this.showToast({
        id: 'toast-' + Date.now(),
        title: 'Notifikasi Web',
        body: 'Browser ini tidak mendukung Web Notifications API.',
        timestamp: 'Baru saja',
        type: 'security',
        read: false,
      });
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      this.pushPermission.set(permission);

      if (permission === 'granted') {
        this.sendPush(
          'Notifikasi Push Aktif',
          'Anda akan menerima peringatan keamanan dan pembaruan aktivasi secara langsung.'
        );
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  sendPush(title: string, body: string, type: PushNotificationItem['type'] = 'security') {
    const item: PushNotificationItem = {
      id: 'notif-' + Date.now(),
      title,
      body,
      timestamp: 'Baru saja',
      type,
      read: false,
    };

    this.notifications.update((list) => [item, ...list]);
    this.showToast(item);

    // Native browser push notification if granted
    if (
      typeof window !== 'undefined' &&
      'Notification' in window &&
      Notification.permission === 'granted'
    ) {
      try {
        new Notification(title, {
          body,
          icon: '/favicon.ico',
        });
      } catch {
        // Fallback gracefully
      }
    }
  }

  showToast(item: PushNotificationItem) {
    this.activeToast.set(item);
    setTimeout(() => {
      if (this.activeToast()?.id === item.id) {
        this.activeToast.set(null);
      }
    }, 4500);
  }

  dismissToast() {
    this.activeToast.set(null);
  }

  markAllAsRead() {
    this.notifications.update((list) =>
      list.map((item) => ({ ...item, read: true }))
    );
  }

  clearAll() {
    this.notifications.set([]);
  }
}
