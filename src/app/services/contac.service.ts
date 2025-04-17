import { Injectable } from '@angular/core';
import {
  addDoc,
  collection,
  collectionData,
  Firestore,
  getDocs,
  query,
  where,
  DocumentReference,
  deleteDoc,
  doc,
  updateDoc
} from '@angular/fire/firestore';
import { contacts } from '../models/contacts.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ContacService {
  private readonly usersCollection = 'users';
  private readonly contactsSubcollection = 'contacts';

  constructor(private firestore: Firestore) {}

  /**
   * Obtiene todos los contactos de un usuario
   * @param userId ID del usuario propietario
   * @returns Observable de array de contactos
   */
  getContacts(userId: string): Observable<contacts[]> {
    const contactsRef = collection(
      this.firestore,
      `${this.usersCollection}/${userId}/${this.contactsSubcollection}`
    );
    return collectionData(contactsRef, { idField: 'id' }) as Observable<contacts[]>;
  }

  /**
   * Añade un nuevo contacto a la subcolección del usuario
   * @param contacto Datos del contacto
   * @param userId ID del usuario propietario
   * @returns Promise con la referencia del documento creado
   */
  async addContact(contacto: contacts, userId: string): Promise<DocumentReference> {
    this.validateContact(contacto);

    const userExists = await this.userExistsByPhone(contacto.phone);
    if (!userExists) {
      throw new Error(`No existe un usuario con el número ${contacto.phone}`);
    }

    const contactsRef = collection(
      this.firestore,
      `${this.usersCollection}/${userId}/${this.contactsSubcollection}`
    );
    return await addDoc(contactsRef, contacto);
  }

  /**
   * Actualiza un contacto existente
   * @param contactId ID del contacto
   * @param userId ID del usuario propietario
   * @param changes Campos a actualizar
   */
  async updateContact(contactId: string, userId: string, changes: Partial<contacts>): Promise<void> {
    const contactDoc = doc(
      this.firestore,
      `${this.usersCollection}/${userId}/${this.contactsSubcollection}/${contactId}`
    );
    return await updateDoc(contactDoc, changes);
  }

  /**
   * Elimina un contacto
   * @param contactId ID del contacto
   * @param userId ID del usuario propietario
   */
  async deleteContact(contactId: string, userId: string): Promise<void> {
    const contactDoc = doc(
      this.firestore,
      `${this.usersCollection}/${userId}/${this.contactsSubcollection}/${contactId}`
    );
    return await deleteDoc(contactDoc);
  }

  private async userExistsByPhone(phone: string): Promise<boolean> {
    const usersRef = collection(this.firestore, this.usersCollection);
    const q = query(usersRef, where('phone', '==', phone));
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  }

  private validateContact(contacto: contacts): void {
    if (!contacto?.phone || contacto.phone.length !== 10) {
      throw new Error('El teléfono debe tener 10 dígitos');
    }
    if (!contacto.name || contacto.name.trim().length < 2) {
      throw new Error('El nombre debe tener al menos 2 caracteres');
    }
  }
}
