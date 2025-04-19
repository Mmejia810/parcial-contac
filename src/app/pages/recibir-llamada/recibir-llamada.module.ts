import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RecibirLlamadaPageRoutingModule } from './recibir-llamada-routing.module';

import { RecibirLlamadaPage } from './recibir-llamada.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RecibirLlamadaPageRoutingModule,
    SharedModule
  ],
  declarations: [RecibirLlamadaPage]
})
export class RecibirLlamadaPageModule {}
