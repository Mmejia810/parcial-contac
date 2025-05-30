import { Injectable } from '@angular/core';
import { Route, Router } from '@angular/router';
import { AlertController, AlertOptions, IonToast, LoadingController, LoadingOptions, ModalController, ModalOptions, ToastController, ToastOptions } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {

  constructor(
    private loadingController: LoadingController,
    private router: Router,
    private toastController: ToastController,
    private alertController: AlertController,
    private modalController: ModalController
  ) { }

  // loading
// presente
  async presentLoading(opts?: LoadingOptions) {
    const loading = await this.loadingController.create(opts);
    await loading.present();
  }
// despues
  async dismissLoading(){
    return await this.loadingController.dismiss()
  }


  // localstorage
// set
  setElementInLocalstorage(key:string, element:any){
    return localStorage.setItem(key,JSON.stringify(element));
  }
// get
  getElementFromLocalstorage(key: string){
    return JSON.parse(localStorage.getItem(key));
  }

  async presentToast(opts: ToastOptions) {
    const toast = await this.toastController.create(opts);
    toast.present();
  }

// router
  routerLink(url:string){
    return this.router.navigateByUrl(url);
  }
// alert
  async presentAlert(opts: AlertOptions) {
    const alert = await this.alertController.create(opts);

    await alert.present();
  }

// modal
// present
  async presentModal(opts: ModalOptions) {
    const modal = await this.modalController.create(opts);
    await modal.present();
    const {data} = await modal.onWillDismiss();

    if(data){
      return data;
    }
  }
// dismiss
dismissModal(data?: any){
  this.modalController.dismiss(data);
}
}
