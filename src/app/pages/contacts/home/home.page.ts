import { Component, OnInit } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { UserService } from 'src/app/services/user.service'; // Importar UserService
import { contacts } from 'src/app/models/contacts.model';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { AddUpdateContactComponent } from 'src/app/shared/components/add-update-contact/add-update-contact.component';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: false
})
export class HomePage implements OnInit {

  contacts: contacts[] = [];

  constructor(
    private userService: UserService, // Inyectar UserService
    private firebaseSvc: FirebaseService,
    private utilsScv: UtilsService,
    private alertController: AlertController,
  ) {}

  ngOnInit() {
    // Solo se ejecuta una vez
  }

  ionViewWillEnter() {
    this.getContacts();
  }

  getContacts() {
    let user: User = this.utilsScv.getElementFromLocalstorage('user');

    this.userService.getUsuarioById(user.uid).subscribe({
      next: (userData) => {
        if (userData) {
          let path = `users/${user.uid}/contacts`; // Obtener la subcolección de contactos
          this.firebaseSvc.getSubcollection(path).subscribe((res) => {
            this.contacts = (res as contacts[]).map(contact => ({
              ...contact,
              bgColor: this.getRandomColor()
            }));
          });
        }
      },
      error: (err) => {
        console.error('Error al obtener los datos del usuario:', err);
      }
    });
  }

  getRandomColor(): string {
    const colors = ['f44336', 'e91e63', '9c27b0', '3f51b5', '009688', 'ff9800'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  addOrUpdateContact(contact?: contacts) {
    this.utilsScv.presentModal({
      component: AddUpdateContactComponent,
      componentProps: { contact },
      cssClass: 'add-update-modal'
    });
  }

  startVideoCall(contact: contacts) {
    const meetingId = `call_${contact.phone}_${Date.now()}`;
    const callerName = this.utilsScv.getElementFromLocalstorage('user')?.name || 'Desconocido';

    // 1. Enviar la notificación push al contacto
    if (contact.token) {
      this.firebaseSvc.sendCallNotification(contact.token, meetingId, callerName)
        .then(() => {
          console.log('📤 Notificación de videollamada enviada');
        })
        .catch((err) => {
          console.error('❌ Error al enviar notificación:', err);
        });
    } else {
      console.warn('⚠️ El contacto no tiene un token de notificación');
    }

    // 2. Iniciar la llamada en el lado del llamador
    if (Capacitor.getPlatform() === 'android') {
      try {
        console.log('🚀 Iniciando llamada (Android)...', meetingId, callerName);
        (window as any).Capacitor.Plugins.ExamplePlugin.startCall({
          meetingId,
          userName: callerName
        });
      } catch (err) {
        console.error('❌ No se pudo iniciar la llamada:', err);
      }
    } else {
      const url = `https://jitsi1.geeksec.de/${meetingId}#userInfo.displayName="${callerName}"`;
      window.open(url, '_blank');
    }
  }

  // Método para eliminar un contacto con confirmación de alerta
  async deleteContact(contact: contacts) {
    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: `¿Estás seguro de que deseas eliminar a ${contact.name}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Eliminación cancelada');
          }
        },
        {
          text: 'Eliminar',
          handler: () => {
            let user: User = this.utilsScv.getElementFromLocalstorage('user');
            const path = `users/${user.uid}/contacts/${contact.id}`;

            // Llamar al método deleteDocument de FirebaseService para eliminar el contacto
            this.firebaseSvc.deleteDocument(path).subscribe({
              next: () => {
                console.log('Contacto eliminado exitosamente');
                this.getContacts(); // Actualizar la lista de contactos después de eliminar
              },
              error: (err) => {
                console.error('Error al eliminar el contacto:', err);
              }
            });
          }
        }
      ]
    });

    await alert.present();
  }
}
