import { User } from 'src/app/models/user.model';
import { Component, OnInit } from '@angular/core';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone:false
})
export class ProfilePage implements OnInit {

  user = {} as User

  constructor(
    private firebaseSvc: FirebaseService,
    private utilsScv: UtilsService
  ) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.getUser();
  }



  getUser(){
    return this.user = this.utilsScv.getElementFromLocalstorage('user')

  }



  signOut() {
    this.utilsScv.presentAlert({
      header: 'Cerrar Sesion',
      message: '¿Quieres cerrar sesion?',
      mode:'ios',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',

        }, {
          text: 'Si, cerrar',
          handler: () => {
            this.firebaseSvc.signOut();
          }
        }
      ]
    })
  }
}

