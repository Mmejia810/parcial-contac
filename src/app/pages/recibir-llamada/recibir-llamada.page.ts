import { Component, OnInit } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Router } from '@angular/router';
import { FirebaseService } from 'src/app/services/firebase.service';

@Component({
  selector: 'app-recibir-llamada',
  templateUrl: './recibir-llamada.page.html',
  styleUrls: ['./recibir-llamada.page.scss'],
  standalone: false
})
export class RecibirLlamadaPage implements OnInit {
  meetingId: string = '';
  callerName: string = '';
  showCall: boolean = false;

  constructor(private router: Router, private firebaseSvc: FirebaseService) {}

  ngOnInit(): void {
    // Obtener los datos pasados por la navegación
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state;

    if (state) {
      this.meetingId = state['meetingId'] || '';
      this.callerName = state['callerName'] || '';
      console.log('📞 Datos de la llamada:', this.meetingId, this.callerName);
    } else {
      console.warn('❌ No hay datos de llamada en el estado de navegación');
    }
  }

  // Método para aceptar la llamada
  async acceptCall() {
    if (!this.meetingId || !this.callerName) {
      console.warn('⚠️ No se puede iniciar la llamada sin un meetingId o callerName');
      return;
    }

    if (Capacitor.getPlatform() === 'android') {
      try {
        console.log('📞 Iniciando videollamada en Android...');
        // Llamada al plugin personalizado para iniciar la llamada
        await (window as any).Capacitor.Plugins.ExamplePlugin.startCall({
          meetingId: this.meetingId,
          userName: this.callerName
        });
      } catch (error) {
        console.error('❌ Error al iniciar la llamada con el plugin:', error);
      }
    } else {
      console.log('🌐 Plataforma web, abriendo Jitsi en iframe');
      // Mostrar el iframe con Jitsi para la llamada web
      this.showCall = true;
    }
  }

  // Método para finalizar la llamada
  endCall() {
    console.log('📞 Terminando la llamada');
    this.showCall = false;
    // Navegar a la página de inicio
    this.router.navigate(['/home']);
  }

  // Método para rechazar la llamada
  rejectCall() {
    console.log('❌ Llamada cancelada por el usuario');
    // Navegar a la página de inicio si se rechaza la llamada
    this.router.navigate(['/home']);
  }
}
