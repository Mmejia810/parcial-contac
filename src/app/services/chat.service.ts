import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  getDoc,
  addDoc,
  query,
  orderBy
} from '@angular/fire/firestore';
import { FirebaseService } from './firebase.service';
import { SupabaseService } from './supabase.service';

export interface Message {
  from: string;
  text?: string;
  type: 'text' | 'image' | 'audio' | 'file' | 'location';
  mediaUrl?: string;
  location?: { lat: number; lng: number };
  createdAt?: any;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  constructor(
    private firestore: Firestore,
    private supabaseSvc: SupabaseService,
    private firebaseSvc: FirebaseService
  ) {}

  getMessages(chatId: string): Observable<Message[]> {
    const messagesRef = collection(this.firestore, `chats/${chatId}/messages`);
    const q = query(messagesRef, orderBy('createdAt', 'asc'));
    return collectionData(q, { idField: 'id' }) as Observable<Message[]>;
  }

  async sendMessage(chatId: string, message: Message, recipientId: string) {
    try {
      const messageToSend: Message = {
        ...message,
        createdAt: new Date()
      };

      const messagesRef = collection(this.firestore, `chats/${chatId}/messages`);
      await addDoc(messagesRef, messageToSend);

      const userDocRef = doc(this.firestore, 'users', recipientId);
      const userDocSnap = await getDoc(userDocRef);
      const recipientToken = userDocSnap.data()?.['token'];

      if (recipientToken) {
        const title = `Nuevo mensaje de ${message.from}`;
        const body = message.text || '📎 Nuevo archivo adjunto';
        const data = { chatId };

        await this.firebaseSvc.sendPushNotification(recipientToken, title, body, data);
      }
    } catch (error) {
      console.error('Error enviando mensaje o notificación:', error);
    }
  }

  async sendImageMessage(chatId: string, file: File, senderName: string, recipientId: string) {
    try {
      const filePath = `images/${Date.now()}_${file.name}`;
      const imageUrl = await this.supabaseSvc.uploadFile(file, filePath);

      const message: Message = {
        from: senderName,
        type: 'image',
        mediaUrl: imageUrl,
        createdAt: new Date()
      };

      const messagesRef = collection(this.firestore, `chats/${chatId}/messages`);
      await addDoc(messagesRef, message);

      const userDocRef = doc(this.firestore, 'users', recipientId);
      const userDocSnap = await getDoc(userDocRef);
      const recipientToken = userDocSnap.data()?.['token'];

      if (recipientToken) {
        const title = `Nuevo mensaje de ${senderName}`;
        const body = '📷 Imagen adjunta';
        const data = { chatId };

        await this.firebaseSvc.sendPushNotification(recipientToken, title, body, data);
      }
    } catch (error) {
      console.error('Error enviando mensaje de imagen o notificación:', error);
    }
  }
}
