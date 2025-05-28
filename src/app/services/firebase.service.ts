import { Injectable } from '@angular/core';
import {
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  sendEmailVerification
} from '@angular/fire/auth';

import { User } from '../models/user.model';
import { UtilsService } from './utils.service';
import { Router } from '@angular/router';
import { UserService } from './user.service';
import { Observable, from } from 'rxjs';
import { collection, collectionData, deleteDoc, doc, Firestore, getDocs, query, setDoc, where } from '@angular/fire/firestore';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {


  constructor(
    private auth: Auth,
    private utilsSvc: UtilsService,
    private router: Router,
    private usuarioSvc: UserService,
    private http: HttpClient,
    private db: Firestore
  ) {}

  // Iniciar sesión
  login(user: User) {
    return signInWithEmailAndPassword(this.auth, user.email, user.password).then(res => {
      if (!res.user.emailVerified) {
        throw new Error('Correo no verificado. Por favor revisa tu email.');
      }
      return res;
    });
  }

  // Registrar nuevo usuario con envío de verificación y token FCM
  signUp(user: User) {
    return createUserWithEmailAndPassword(this.auth, user.email, user.password)
      .then(async cred => {
        if (cred.user) {
          await sendEmailVerification(cred.user);
        }

        let tokenFCM = localStorage.getItem('fcm');

        if (!tokenFCM) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          tokenFCM = localStorage.getItem('fcm');
        }

        if (!tokenFCM) {
          throw new Error('Token FCM no disponible. No se puede registrar el usuario.');
        }

        const newUser = {
          name: user.name,
          email: user.email,
          phone: user.phone,
          uid: cred.user.uid,
          token: tokenFCM
        };

        await setDoc(doc(this.db, 'users', cred.user.uid), newUser);

        localStorage.removeItem('fcm');

        return true;
      });
  }

  // Actualizar perfil
  updateUser(user: Partial<{ displayName: string; photoURL: string }>) {
    if (this.auth.currentUser) {
      return updateProfile(this.auth.currentUser, user);
    } else {
      throw new Error('No hay usuario autenticado');
    }
  }

  // Obtener estado de autenticación (Promise)
  getAuthState() {
    return new Promise<FirebaseUser | null>((resolve) => {
      onAuthStateChanged(this.auth, resolve);
    });
  }

  // Obtener usuario autenticado (Promise)
  async getUser(): Promise<any> {
    return new Promise((resolve, reject) => {
      const unsubscribe = onAuthStateChanged(this.auth, user => {
        unsubscribe();
        if (user) {
          resolve(user);
        } else {
          reject('No hay usuario autenticado');
        }
      });
    });
  }

  // Cerrar sesión y limpiar localStorage
  async signOut() {
    await signOut(this.auth);
    this.utilsSvc.routerLink('/auth');
    localStorage.removeItem('user');
  }

  // Obtener subcolección de Firestore como Observable
  getSubcollection(pathToSubcollection: string): Observable<any> {
    const subColRef = collection(this.db, pathToSubcollection);
    return collectionData(subColRef, { idField: 'id' });
  }

  // Buscar usuario por teléfono
  async getUserByPhone(phone: string): Promise<any | null> {
    const usersRef = collection(this.db, 'users');
    const q = query(usersRef, where('phone', '==', phone));
    const snapshot = await getDocs(q);

    if (snapshot.empty) return null;

    const userDoc = snapshot.docs[0];
    return { id: userDoc.id, ...userDoc.data() };
  }

  // Eliminar documento Firestore
  deleteDocument(path: string) {
    const docRef = doc(this.db, path);
    return from(deleteDoc(docRef));
  }

  // Enviar notificación de llamada a API externa
  sendCallNotification(token: string, meetingId: string, callerName: string) {
    const body = { token, meetingId, callerName };
    return this.sendNotificationToServer(body);
  }

  // Enviar notificación a servidor externo con token JWT
  private async sendNotificationToServer(body: any) {
    try {
      const tokenAuth = localStorage.getItem('token');
      if (!tokenAuth) throw new Error('Token JWT no encontrado en localStorage');

      const response = await fetch('https://ravishing-courtesy-production.up.railway.app/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenAuth}`
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const err = await response.text();
        throw new Error(`Error al enviar la notificación: ${err}`);
      }

      console.log('📤 Notificación enviada exitosamente');
    } catch (error) {
      console.error('❌ Error al enviar notificación push:', error);
    }
  }

  // Login a API externa para obtener JWT
  async loginToNotificationApi(email: string, password: string) {
    try {
      const response = await fetch('https://ravishing-courtesy-production.up.railway.app/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const err = await response.text();
        throw new Error(`Error al autenticar con la API externa: ${err}`);
      }

      const data = await response.json();
      localStorage.setItem('token', data.token);
      console.log('🔐 Token guardado:', data.token);
    } catch (error) {
      console.error('❌ Error en loginToNotificationApi:', error);
      throw error;
    }
  }

  // Otra forma de obtener el usuario actual (Promise)
  async getCurrentUser(): Promise<any> {
    return new Promise((resolve, reject) => {
      const unsubscribe = onAuthStateChanged(this.auth, user => {
        unsubscribe();
        if (user) resolve(user);
        else reject('No user logged in');
      });
    });
  }

  // Enviar notificación push usando HttpClient y API externa
  async sendPushNotification(token: string, title: string, body: string, data: any = {}) {
    const payload = { token, title, body, data };

    try {
      const response = await this.http.post(
        'https://ravishing-courtesy-production.up.railway.app/send',
        payload
      ).toPromise();

      console.log('📤 Notificación enviada con éxito', response);
    } catch (err) {
      console.error('❌ Error al enviar notificación:', err);
    }
  }
}
