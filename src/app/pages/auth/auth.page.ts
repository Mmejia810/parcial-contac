import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
  standalone: false,
})
export class AuthPage implements OnInit {

  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
  });

  constructor(
    private firebaseSvc: FirebaseService,
    private utilsSvc: UtilsService
  ) {}

  ngOnInit() {}

  submit() {
    if (this.form.valid) {
      this.utilsSvc.presentLoading({ message: 'Autenticando....' });

      this.firebaseSvc.login(this.form.value as User).then(async res => {
        const user: User = {
          uid: res.user.uid,
          name: res.user.displayName,
          email: res.user.email,
          phone: res.user.phoneNumber
        };

        try {
          // ⬇️ Llamar a la API externa para obtener el JWT
          await this.firebaseSvc.loginToNotificationApi(user.email!, this.form.value.password!);
        } catch (error) {
          console.warn('⚠️ Error al autenticar con la API externa:', error);
          // Podrías decidir si continuar o no aquí dependiendo de si el token es crítico
        }

        // Guardar usuario en localStorage
        this.utilsSvc.setElementInLocalstorage('user', user);

        // Navegar al home
        this.utilsSvc.routerLink('/contacts/home');

        // Finalizar loading y mostrar mensaje de bienvenida
        this.utilsSvc.dismissLoading();
        this.utilsSvc.presentToast({
          message: `Te damos la bienvenida ${user.name}`,
          duration: 1500,
          color: 'primary',
          icon: 'person-outline'
        });

        this.form.reset();

      }, error => {
        this.utilsSvc.dismissLoading();
        this.utilsSvc.presentToast({
          message: error.message || error,
          duration: 5000,
          color: 'warning',
          icon: 'alert-circle-outline'
        });
      });
    }
  }

}
