import { Component, OnInit } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-recibir-llamada',
  templateUrl: './recibir-llamada.page.html',
  styleUrls: ['./recibir-llamada.page.scss'],
  standalone: false
})
export class RecibirLlamadaPage implements OnInit {

  meetingId: string = '';
  callerName: string = '';

  constructor(private router: Router) {}

  ngOnInit(): void {
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

  async acceptCall() {
    if (Capacitor.getPlatform() !== 'android') {
      console.warn('Esta función solo está disponible en Android.');
      return;
    }

    try {
      console.log('🚀 Aceptando llamada:', this.meetingId, this.callerName);
      await (window as any).Capacitor.Plugins.ExamplePlugin.startCall({
        meetingId: this.meetingId,
        userName: this.callerName
      });
    } catch (error) {
      console.error('❌ Error al lanzar la llamada:', error);
    }
  }
}
