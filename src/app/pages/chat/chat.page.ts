import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Geolocation } from '@capacitor/geolocation';
import { MediaCapture, CaptureAudioOptions } from '@ionic-native/media-capture/ngx';
import { File } from '@ionic-native/file/ngx';
import { StorageService } from 'src/app/services/storage.service';

import { NavController } from '@ionic/angular';
import { ChatService } from 'src/app/services/chat.service';
import { FirebaseService } from 'src/app/services/firebase.service';  // <-- Servicio Firebase

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
  standalone: false
})
export class ChatPage implements OnInit {

  @ViewChild('imageInput') imageInputRef!: ElementRef<HTMLInputElement>; // <-- para input oculto

  contactId: string;
  contactName: string;
  currentUserId: string;
  chatId: string;

  messages: any[] = [];
  newMessage: string = '';

  constructor(
    private route: ActivatedRoute,
    private ChatService: ChatService,
    private navCtrl: NavController,
    private mediaCapture: MediaCapture,
    private file: File,
    private storageService: StorageService,
    private firebaseService: FirebaseService
  ) { }

  async ngOnInit() {
    this.contactId = this.route.snapshot.paramMap.get('contactId');
    this.contactName = this.route.snapshot.paramMap.get('contactName');

    try {
      const user = await this.firebaseService.getCurrentUser();
      this.currentUserId = user.uid;

      this.chatId = this.getChatId(this.currentUserId, this.contactId);
      this.loadMessages();
    } catch (error) {
      console.error('No hay usuario autenticado:', error);
    }
  }

  getChatId(user1: string, user2: string): string {
    return [user1, user2].sort().join('_');
  }

  loadMessages() {
    this.ChatService.getMessages(this.chatId).subscribe(msgs => {
      this.messages = msgs;
    });
  }

  sendMessage() {
    if (!this.newMessage.trim()) return;

    this.ChatService.sendMessage(this.chatId, {
      from: this.currentUserId,
      type: 'text',
      text: this.newMessage,
      createdAt: new Date()
    }, this.contactId);

    this.newMessage = '';
  }

  callContact() {
    alert(`Llamando a ${this.contactName}...`);
  }

  async sendImage() {
    // Activa el input oculto para seleccionar imagen manualmente
    if (this.imageInputRef) {
      this.imageInputRef.nativeElement.click();
    }
  }

  async onImageSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const imageUrl = await this.storageService.uploadFile(file);

      this.ChatService.sendMessage(this.chatId, {
        from: this.currentUserId,
        type: 'image',
        mediaUrl: imageUrl,
        createdAt: new Date()
      }, this.contactId);

    } catch (error) {
      console.error('Error al enviar imagen seleccionada', error);
    }
  }

  async sendAudio() {
    try {
      const options: CaptureAudioOptions = { limit: 1, duration: 30 };
      const audioData = await this.mediaCapture.captureAudio(options);

      if (!Array.isArray(audioData) || audioData.length === 0) {
        console.warn('No se capturó ningún audio');
        return;
      }

      const audioFileUri = audioData[0].fullPath;
      const audioUrl = await this.storageService.uploadFile({ path: audioFileUri });

      this.ChatService.sendMessage(this.chatId, {
        from: this.currentUserId,
        type: 'audio',
        mediaUrl: audioUrl,
        createdAt: new Date()
      }, this.contactId);

    } catch (error) {
      console.error('Error al enviar audio', error);
    }
  }

  async sendLocation() {
    try {
      const coordinates = await Geolocation.getCurrentPosition();

      this.ChatService.sendMessage(this.chatId, {
        from: this.currentUserId,
        type: 'location',
        location: {
          lat: coordinates.coords.latitude,
          lng: coordinates.coords.longitude
        },
        createdAt: new Date()
      }, this.contactId);

    } catch (error) {
      console.error('Error al obtener ubicación', error);
    }
  }

  async sendFile() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.onchange = async () => {
      const file = fileInput.files[0];
      const fileUrl = await this.storageService.uploadFile(file);

      this.ChatService.sendMessage(this.chatId, {
        from: this.currentUserId,
        type: 'file',
        mediaUrl: fileUrl,
        createdAt: new Date()
      }, this.contactId);
    };
    fileInput.click();
  }

}
