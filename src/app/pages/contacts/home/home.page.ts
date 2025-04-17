import { Component, OnInit } from '@angular/core';
import { contacts } from 'src/app/models/contacts.model';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { AddUpdateContactComponent } from 'src/app/shared/components/add-update-contact/add-update-contact.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: false
})
export class HomePage implements OnInit {

  contacts: contacts[] = [];

  constructor(
    private firebaseSvc: FirebaseService,
    private utilsScv: UtilsService
  ) {}

  ngOnInit() {
    // Solo se ejecuta una vez
  }

  ionViewWillEnter() {
    this.getContacts();
  }

  getContacts() {
    let user: User = this.utilsScv.getElementFromLocalstorage('user');
    let path = `users/${user.uid}/contacts`;

    this.firebaseSvc.getSubcollection(path).subscribe({
      next: (res) => {
        this.contacts = (res as contacts[]).map(contact => ({
          ...contact,
          bgColor: this.getRandomColor()
        }));
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
}
