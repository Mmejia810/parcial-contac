import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { User } from 'src/app/models/user.model';

import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

import { CustomValidators } from 'src/app/utils/custom-validators';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.page.html',
  styleUrls: ['./sign-up.page.scss'],
  standalone: false
})
export class SignUpPage implements OnInit {

  form = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(4)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    phone: new FormControl('', [Validators.required, Validators.maxLength(10), Validators.pattern('^[0-9]*$')]),
    password: new FormControl('', [Validators.required]),
    confirmPassword: new FormControl(''),
  });

  constructor(
    private firebaseSvc: FirebaseService,
    private utilsSvc: UtilsService
  ) {}

  ngOnInit() {
    this.confirmPasswordValidator();
  }

  confirmPasswordValidator() {
    this.form.controls.confirmPassword.setValidators([
      Validators.required,
      CustomValidators.matchValues(this.form.controls.password)
    ]);
    this.form.controls.confirmPassword.updateValueAndValidity();
  }

  submit() {
    if (this.form.valid) {
      this.utilsSvc.presentLoading({ message: 'Registrando....' });

      this.firebaseSvc.signUp(this.form.value as User).then(async res => {
        this.utilsSvc.dismissLoading();

        this.utilsSvc.presentToast({
          message: `Te enviamos un correo a ${this.form.value.email}. Verifica tu cuenta antes de iniciar sesión.`,
          duration: 5000,
          color: 'success',
          icon: 'mail-outline'
        });

        this.form.reset();
        this.utilsSvc.routerLink('/auth');

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
