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
  collectionData,
  doc,
  updateDoc,
  query,
  where,
  getDocs
} from '@angular/fire/firestore';

import { User } from '../models/user.model';
import { UtilsService } from './utils.service';
import { Router } from '@angular/router';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  constructor(
    private auth: Auth,
    private db: Firestore,
    private utilsSvc: UtilsService,
    private router: Router,
    private usuarioSvc: UserService
  ) {}

  login(user: User) {
    return signInWithEmailAndPassword(this.auth, user.email, user.password).then(res => {
      if (!res.user.emailVerified) {
        throw new Error('Correo no verificado. Por favor revisa tu email.');
      }
      return res;
    });
  }

  signUp(user: User) {
    return createUserWithEmailAndPassword(this.auth, user.email, user.password)
      .then(async cred => {
        if (cred.user) {
          await sendEmailVerification(cred.user); // Enviar verificación
        }

        const newUser = {
          name: user.name,
          email: user.email,
          phone: user.phone,
          uid: cred.user.uid
        };

        console.log(newUser);

        return this.usuarioSvc.addUsuario(newUser);
      });
  }

  updateUser(user: Partial<{ displayName: string; photoURL: string }>) {
    if (this.auth.currentUser) {
      return updateProfile(this.auth.currentUser, user);
    } else {
      throw new Error('No hay usuario autenticado');
    }
  }

  getAuthState() {
    return new Promise<FirebaseUser | null>((resolve) => {
      onAuthStateChanged(this.auth, resolve);
    });
  }

  async signOut() {
    await signOut(this.auth);
    this.utilsSvc.routerLink('/auth');
    localStorage.removeItem('user');
  }

  getSubcollection(pathToSubcollection: string) {
    const subColRef = collection(this.db, pathToSubcollection);
    return collectionData(subColRef, { idField: 'id' });
  }

  async getUserByPhone(phone: string): Promise<any | null> {
    const usersRef = collection(this.db, 'users');
    const q = query(usersRef, where('phone', '==', phone));
    const snapshot = await getDocs(q);

    if (snapshot.empty) return null;

    const userDoc = snapshot.docs[0];
    return { id: userDoc.id, ...userDoc.data() };
  }
}
