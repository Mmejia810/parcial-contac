import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { environment } from 'src/environments/environment';
import { UserService } from '../services/user.service';



@NgModule({
  declarations: [],
  imports: [
    CommonModule,

  ],
  providers:[
    provideFirebaseApp(() => initializeApp(environment
      .firebaseConfig)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    UserService,
  ]
})
export class CoreModule { }
