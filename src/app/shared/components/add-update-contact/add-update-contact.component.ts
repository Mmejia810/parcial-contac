import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ModalController, ToastController } from '@ionic/angular';
import { User } from 'src/app/models/user.model';
import { contacts } from 'src/app/models/contacts.model';
import { UtilsService } from 'src/app/services/utils.service';
import { FirebaseService } from 'src/app/services/firebase.service';
import { ContacService } from 'src/app/services/contac.service';

@Component({
  selector: 'app-add-update-contact',
  templateUrl: './add-update-contact.component.html',
  styleUrls: ['./add-update-contact.component.scss'],
  standalone: false
})
export class AddUpdateContactComponent implements OnInit {
  @Input() contact: contacts | null = null;
  user: User | null = null;
  isSubmitting = false;

  readonly MESSAGES = {
    CONTACT_ADDED: 'Contacto agregado exitosamente.',
    CONTACT_UPDATED: 'Contacto actualizado exitosamente.',
    USER_NOT_FOUND: 'No se pudo identificar al usuario.',
    PHONE_NOT_REGISTERED: 'El número no está registrado en el sistema.',
    GENERAL_ERROR: 'Ocurrió un error. Por favor, inténtelo nuevamente.',
    FORM_INVALID: 'Por favor, ingrese un número de teléfono válido.'
  };

  form = new FormGroup({
    id: new FormControl(''),
    phone: new FormControl('', [
      Validators.required,
      Validators.minLength(10),
      Validators.maxLength(10),
      Validators.pattern('^[0-9]*$')
    ]),
  });

  constructor(
    private firebaseSvc: FirebaseService,
    private contacService: ContacService,
    private utilsSvc: UtilsService,
    private toastController: ToastController,
    private modalCtrl: ModalController
  ) {}

  async ngOnInit(): Promise<void> {
    this.user = this.utilsSvc.getElementFromLocalstorage('user');

    if (this.contact) {
      this.form.patchValue({
        id: this.contact.id,
        phone: this.contact.phone
      });
    }
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid || this.isSubmitting || !this.user?.uid) {
      await this.showToast(this.MESSAGES.FORM_INVALID, 'warning');
      return;
    }

    this.isSubmitting = true;

    try {
      const phone = this.form.value.phone!;
      const userFound = await this.firebaseSvc.getUserByPhone(phone);

      if (!userFound) {
        await this.showToast(this.MESSAGES.PHONE_NOT_REGISTERED, 'danger');
        return;
      }

      const contactData: contacts = {
        id: this.form.value.id || '',
        phone: phone,
        name: userFound.name,           // ← Nombre del usuario encontrado
        token: userFound.token ?? null  // ← Token del usuario encontrado
      };

      if (contactData.id) {
        await this.contacService.updateContact(
          contactData.id,
          this.user.uid,
          { phone: contactData.phone, name: contactData.name, token: contactData.token }
        );
        await this.showToast(this.MESSAGES.CONTACT_UPDATED, 'success');
      } else {
        await this.contacService.addContact(contactData, this.user.uid);
        await this.showToast(this.MESSAGES.CONTACT_ADDED, 'success');
      }

      this.modalCtrl.dismiss({ refresh: true });
    } catch (error: any) {
      console.error('Error:', error);
      await this.showToast(this.MESSAGES.GENERAL_ERROR, 'danger');
    } finally {
      this.isSubmitting = false;
    }
  }


  private async showToast(
    message: string,
    color: 'success' | 'danger' | 'warning'
  ): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 2500,
      color,
      position: 'bottom',
      buttons: [{ text: 'OK', role: 'cancel' }]
    });
    await toast.present();
  }

  get phoneControl() {
    return this.form.get('phone');
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }
}
