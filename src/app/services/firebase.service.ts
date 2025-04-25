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
import {
  Firestore,
  collection,
  doc,
  updateDoc,
  query,
  where,
  getDocs,
  deleteDoc,
  setDoc,
  getFirestore
} from 'firebase/firestore';
import { User } from '../models/user.model';
import { UtilsService } from './utils.service';
import { Router } from '@angular/router';
import { UserService } from './user.service';
import { Observable, from } from 'rxjs';
import { collectionData } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private db = getFirestore(); // Correctamente inicializamos Firestore

  constructor(
    private auth: Auth,
    private utilsSvc: UtilsService,
    private router: Router,
    private usuarioSvc: UserService
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

  // Registrar un nuevo usuario
  signUp(user: User) {
    return createUserWithEmailAndPassword(this.auth, user.email, user.password)
      .then(async cred => {
        if (cred.user) {
          await sendEmailVerification(cred.user); // Enviar verificación
        }

        let tokenFCM = localStorage.getItem('fcm');

        if (!tokenFCM) {
          await new Promise(resolve => setTimeout(resolve, 1000)); // Esperar 1 segundo
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

        if (tokenFCM) {
          localStorage.removeItem('fcm');
        }

        return true;
      });
  }

  // Actualizar perfil del usuario
  updateUser(user: Partial<{ displayName: string; photoURL: string }>) {
    if (this.auth.currentUser) {
      return updateProfile(this.auth.currentUser, user);
    } else {
      throw new Error('No hay usuario autenticado');
    }
  }

  // Obtener estado de autenticación
  getAuthState() {
    return new Promise<FirebaseUser | null>((resolve) => {
      onAuthStateChanged(this.auth, resolve);
    });
  }

  // Cerrar sesión
  async signOut() {
    await signOut(this.auth);
    this.utilsSvc.routerLink('/auth');
    localStorage.removeItem('user');
  }

  // Obtener subcolección de Firestore
  getSubcollection(pathToSubcollection: string): Observable<any> {
    const subColRef = collection(this.db, pathToSubcollection); // Correcto: Obtiene una subcolección
    return collectionData(subColRef, { idField: 'id' });
  }

  // Obtener usuario por teléfono
  async getUserByPhone(phone: string): Promise<any | null> {
    const usersRef = collection(this.db, 'users');
    const q = query(usersRef, where('phone', '==', phone));
    const snapshot = await getDocs(q);

    if (snapshot.empty) return null;

    const userDoc = snapshot.docs[0];
    return { id: userDoc.id, ...userDoc.data() };
  }

  // Método para eliminar un documento en Firestore
  deleteDocument(path: string) {
    const docRef = doc(this.db, path); // Correcto: Creación de referencia de documento
    return from(deleteDoc(docRef)); // Deletar el documento
  }

  // Enviar notificación de llamada
  sendCallNotification(token: string, meetingId: string, callerName: string) {
    const body = {
      token,
      meetingId,
      callerName
    };

    return this.sendNotificationToServer(body); // Llamada a una función externa
  }

  // Método para enviar la notificación utilizando un servidor externo con token de autenticación
  private async sendNotificationToServer(body: any) {
    try {
      const tokenAuth = localStorage.getItem('token');
      if (!tokenAuth) {
        throw new Error('Token JWT no encontrado en localStorage');
      }

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

  // Método para autenticar con la API externa y obtener el JWT
  async loginToNotificationApi(email: string, password: string) {
    try {
      const response = await fetch('https://ravishing-courtesy-production.up.railway.app/user/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const err = await response.text();
        throw new Error(`Error al autenticar con la API externa: ${err}`);
      }

      const data = await response.json();
      localStorage.setItem('token', data.token); // Guardar el token JWT
      console.log('🔐 Token guardado:', data.token);
    } catch (error) {
      console.error('❌ Error en loginToNotificationApi:', error);
      throw error;
    }
  }
}
