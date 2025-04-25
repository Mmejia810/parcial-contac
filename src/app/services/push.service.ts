import { Injectable } from '@angular/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Router } from '@angular/router';
import { FirebaseService } from './firebase.service';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class PushService {
  private isCallActive = false; // Estado para verificar llamadas activas
  callerPhotoURL: string = ''; // Para almacenar la URL de la foto del contacto

  constructor(
    private firebaseSvc: FirebaseService,
    private router: Router,
    private toastController: ToastController
  ) {}

  // Método para recibir notificación de llamada
  async handleIncomingCall(notification: any) {
    if (this.isCallActive) {
      console.warn('⚠️ Ya hay una llamada activa');
      return;
    }

    const { callerName, photoURL } = notification?.data || {};
    this.callerPhotoURL = photoURL || ''; // Establecemos la foto del contacto si está disponible

    // Mostrar nombre de la persona que llama y foto
    console.log(`📞 Llamada entrante de ${callerName}`);
    await this.showIncomingCallToast(callerName);

    // Realizar vibración o sonido
    await this.startRingtone();

    // Marcar que la llamada está activa
    this.isCallActive = true;

    // Redirigir a la pantalla de llamada entrante
    this.router.navigate(['/recibir-llamada']);
  }

  // Mostrar un toast con el nombre del llamante
  private async showIncomingCallToast(callerName: string) {
    const toast = await this.toastController.create({
      message: `Llamada entrante de ${callerName}`,
      duration: 3000,
      position: 'top',
    });
    await toast.present();
  }

  // Iniciar vibración o sonido
  private async startRingtone() {
    // Vibración utilizando Capacitor Haptics
    await Haptics.impact({ style: ImpactStyle.Heavy });

    // Reproducir un sonido de tono de llamada
    const audio = new Audio('assets/sounds/ringtone.mp3');
    audio.play();
  }

  // Finalizar llamada
  endCall() {
    this.isCallActive = false; // Reiniciar estado de llamada
    console.log('📞 Llamada terminada');
  }
}
