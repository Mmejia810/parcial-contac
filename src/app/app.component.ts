import { initializeApp } from '@angular/fire/app';
import { Component } from '@angular/core';
import {
  ActionPerformed,
  PushNotificationSchema,
  PushNotifications,
  Token,
} from '@capacitor/push-notifications';
import { Platform } from '@ionic/angular';
import { ThemeService } from './services/theme.service';
import { NotifacionesService } from './services/notifaciones.service';
import { PushService } from './services/push.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private themeSvc: ThemeService,
    private notificationService: NotifacionesService,
    private pushService: PushService) {
      this.initializeApp();
    }

  async initializeApp() {
    await this.notificationService.initPush();

    this.themeSvc.setInitialTheme();

    }
  }

