// Notification Service per AMC App

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
  data?: any;
}

class NotificationService {
  private registration: ServiceWorkerRegistration | null = null;
  private permissionGranted: boolean = false;

  /**
   * Inizializza il service worker e richiede permessi
   */
  async init(): Promise<boolean> {
    // Verifica supporto browser
    if (!('serviceWorker' in navigator) || !('Notification' in window)) {
      console.warn('⚠️ Browser non supporta notifiche push');
      return false;
    }

    try {
      // Registra service worker
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });

      console.log('✅ Service Worker registrato:', this.registration);

      // Richiedi permesso notifiche
      const permission = await this.requestPermission();
      this.permissionGranted = permission;

      return permission;
    } catch (error) {
      console.error('❌ Errore inizializzazione notifiche:', error);
      return false;
    }
  }

  /**
   * Richiede permesso all'utente per le notifiche
   */
  async requestPermission(): Promise<boolean> {
    if (Notification.permission === 'granted') {
      console.log('✅ Permesso notifiche già concesso');
      return true;
    }

    if (Notification.permission === 'denied') {
      console.warn('⚠️ Permesso notifiche negato');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      const granted = permission === 'granted';

      if (granted) {
        console.log('✅ Permesso notifiche concesso');
      } else {
        console.warn('⚠️ Permesso notifiche negato dall\'utente');
      }

      return granted;
    } catch (error) {
      console.error('❌ Errore richiesta permesso:', error);
      return false;
    }
  }

  /**
   * Verifica se le notifiche sono supportate e autorizzate
   */
  isSupported(): boolean {
    return (
      'serviceWorker' in navigator &&
      'Notification' in window &&
      Notification.permission === 'granted'
    );
  }

  /**
   * Invia una notifica locale
   */
  async showNotification(payload: NotificationPayload): Promise<void> {
    if (!this.isSupported()) {
      console.warn('⚠️ Notifiche non supportate o non autorizzate');
      return;
    }

    try {
      if (this.registration) {
        // Invia messaggio al service worker
        if (this.registration.active) {
          this.registration.active.postMessage({
            type: 'SHOW_NOTIFICATION',
            payload,
          });
        }
      } else {
        // Fallback: notifica diretta
        new Notification(payload.title, {
          body: payload.body,
          icon: payload.icon || '/icon-192.png',
          tag: payload.tag || 'notification',
          vibrate: [200, 100, 200],
        });
      }

      console.log('🔔 Notifica inviata:', payload.title);
    } catch (error) {
      console.error('❌ Errore invio notifica:', error);
    }
  }

  /**
   * Notifica per nuovo messaggio
   */
  async notifyNewMessage(
    senderName: string,
    projectName: string,
    messagePreview: string
  ): Promise<void> {
    await this.showNotification({
      title: `${senderName} in ${projectName}`,
      body: messagePreview,
      icon: '/icon-192.png',
      tag: `message-${Date.now()}`,
      data: {
        type: 'message',
        timestamp: Date.now(),
      },
    });
  }

  /**
   * Notifica per check-in/out
   */
  async notifyTimeEntry(
    userName: string,
    type: 'check-in' | 'check-out',
    projectName: string
  ): Promise<void> {
    const title = type === 'check-in' ? '✅ Check-In' : '🛑 Check-Out';
    const body = `${userName} ha fatto ${type === 'check-in' ? 'check-in' : 'check-out'} su ${projectName}`;

    await this.showNotification({
      title,
      body,
      icon: '/icon-192.png',
      tag: `time-entry-${Date.now()}`,
      data: {
        type: 'time-entry',
        timestamp: Date.now(),
      },
    });
  }

  /**
   * Test notifica
   */
  async testNotification(): Promise<void> {
    await this.showNotification({
      title: '🎉 Notifiche Attive!',
      body: 'Le notifiche push funzionano correttamente',
      icon: '/icon-192.png',
      tag: 'test',
    });
  }

  /**
   * Ottieni stato permessi
   */
  getPermissionStatus(): NotificationPermission {
    return Notification.permission;
  }
}

// Esporta istanza singleton
export const notificationService = new NotificationService();
