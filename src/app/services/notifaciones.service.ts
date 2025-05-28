import { Injectable } from '@angular/core';
import { FirebaseMessaging } from '@capacitor-firebase/messaging';
import { Router } from '@angular/router';
import { Capacitor } from '@capacitor/core';
import { FirebaseService } from './firebase.service';

import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { ToastController } from '@ionic/angular';
import { doc, Firestore, updateDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class NotifacionesService {
  constructor(
    private router: Router,
    private firebaseSvc: FirebaseService,
    private toastController: ToastController,
    private firestore: Firestore
  ) {}

  async initializePushNotifications() {
    try {
      const permStatus = await FirebaseMessaging.requestPermissions();
      console.log('📱 Permisos de notificaciones:', permStatus);

      const { token } = await FirebaseMessaging.getToken();
      if (token) {
        localStorage.setItem('fcm', token);
        console.log('📲 Token FCM guardado:', token);

        const auth = getAuth();
        onAuthStateChanged(auth, async user => {
          if (user) {
            const db = this.firebaseSvc['db']; // acceso directo a Firestore
          const userDoc = doc(this.firestore, 'users', user.uid);
await updateDoc(userDoc, { token });
            console.log('✅ Token FCM actualizado en Firestore');
          }
        });
      }

      // Escuchar notificaciones recibidas (cuando app está en segundo plano)
      await FirebaseMessaging.addListener('notificationReceived', async (notification: any) => {
        console.log('📩 Notificación recibida en segundo plano:', notification);

        const data = notification?.data;

        if (data?.meetingId) {
          localStorage.setItem('incoming-call', JSON.stringify(data));
          this.router.navigate(['/recibir-llamada']);
        } else if (data?.chatId) {
          this.router.navigate(['/chat', data.chatId]);
        } else {
          this.presentToast(notification?.notification?.title || 'Nueva notificación');
        }
      });

      // Acción cuando el usuario toca la notificación (app cerrada o segundo plano)
      await FirebaseMessaging.addListener('notificationActionPerformed', async (notification: any) => {
        console.log('📨 Acción en notificación:', notification);

        const data = notification?.notification?.data;

        if (data?.meetingId) {
          localStorage.setItem('incoming-call', JSON.stringify(data));
          this.router.navigate(['/recibir-llamada']);
        } else if (data?.chatId) {
          this.router.navigate(['/chat', data.chatId]);
        }
      });

    } catch (error) {
      console.error('❌ Error al inicializar notificaciones push:', error);
    }
  }

  private async presentToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'top',
    });
    await toast.present();
  }
}
