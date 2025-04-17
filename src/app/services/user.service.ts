import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  docData,
  DocumentReference,
  setDoc,
} from '@angular/fire/firestore';
import { User } from '../models/user.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly collectionName = 'users';

  constructor(private firestore: Firestore) {}

  // Obtener todos los usuarios
  getUsuarios(): Observable<(User & { id: string })[]> {
    const usuariosRef = collection(this.firestore, this.collectionName);
    return collectionData(usuariosRef, { idField: 'id' }) as Observable<(User & { id: string })[]>;
  }

  // Obtener un usuario por ID
  getUsuarioById(id: string): Observable<User> {
    const usuarioDocRef = doc(this.firestore, `${this.collectionName}/${id}`);
    return docData(usuarioDocRef) as Observable<User>;
  }

  // Crear un nuevo usuario
  async addUsuario(usuario: User): Promise<void> {
    try {
      if (!usuario.uid) throw new Error('El usuario no tiene UID');

      const usuarioRef = doc(this.firestore, this.collectionName, usuario.uid);
      await setDoc(usuarioRef, usuario);
    } catch (error) {
      console.error('Error al agregar usuario a Firestore:', error);
      throw error; // vuelve a lanzar para que el que llama pueda manejarlo también
    }
  }

  // Actualizar un usuario existente
  updateUsuario(id: string, usuario: Partial<User>): Promise<void> {
    const usuarioDocRef = doc(this.firestore, `${this.collectionName}/${id}`);
    return updateDoc(usuarioDocRef, usuario);
  }

  // Eliminar un usuario
  deleteUsuario(id: string): Promise<void> {
    const usuarioDocRef = doc(this.firestore, `${this.collectionName}/${id}`);
    return deleteDoc(usuarioDocRef);
  }
}
