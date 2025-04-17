import { Component } from '@angular/core';
import {
  ActionPerformed,
  PushNotificationSchema,
  PushNotifications,
  Token,
} from '@capacitor/push-notifications';
import { Platform } from '@ionic/angular';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  constructor(
    private platform : Platform,
    private themeSvc : ThemeService
  ) {

     this.themeSvc.setInitialTheme()
    if(this.platform.is('capacitor')) this.initPush()
  }
  initPush() {
    // Imprime en la consola que se está inicializando la página de inicio
    console.log('Initializing HomePage');

    // Solicita permisos al usuario para recibir notificaciones push
    // En iOS mostrará un mensaje al usuario preguntando si permite notificaciones
    // En Android generalmente ya se concede el permiso automáticamente
    PushNotifications.requestPermissions().then(result => {
      if (result.receive === 'granted') {
        // Si el permiso fue concedido, se registra el dispositivo con Apple (APNs) o Google (FCM)
        PushNotifications.register();
      } else {
        // Si el permiso fue denegado, podrías mostrar un mensaje de error aquí
        // alert('Permiso denegado para notificaciones push');
      }
    });

    // Escucha cuando el dispositivo ha sido registrado exitosamente para recibir notificaciones
    // Esto devuelve un "token" único para el dispositivo, que luego se puede usar para enviarle notificaciones
    PushNotifications.addListener('registration',
      (token: Token) => {
        // Muestra una alerta con el token de registro
        alert('Registro de notificaciones push exitoso, token: ' + token.value);
      }
    );

    // Escucha si ocurre algún error durante el proceso de registro del dispositivo
    PushNotifications.addListener('registrationError',
      (error: any) => {
        // Muestra una alerta con el error que ocurrió durante el registro
        alert('Error al registrar el dispositivo: ' + JSON.stringify(error));
      }
    );

    // Escucha cuando llega una notificación push mientras la aplicación está abierta (en primer plano)
    PushNotifications.addListener('pushNotificationReceived',
      (notification: PushNotificationSchema) => {
        // Muestra una alerta con el contenido de la notificación recibida
        alert('Notificación recibida: ' + JSON.stringify(notification));
      }
    );

    // Escucha cuando el usuario hace clic sobre una notificación
    // Aquí puedes decidir a qué parte de tu app dirigir al usuario, por ejemplo
    PushNotifications.addListener('pushNotificationActionPerformed',
      (notification: ActionPerformed) => {
        // Muestra una alerta con la información de la acción realizada
        alert('Acción realizada desde la notificación: ' + JSON.stringify(notification));
      }
    );
  }
}

