import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ContactsPage } from './contacts.page';

const routes: Routes = [
  {
    path: '',
    component: ContactsPage,
    children:[
      {
        path: 'profile',
        loadChildren: () => import('./profile/profile.module').then( m => m.ProfilePageModule)
      },
      {
        path: 'home',
        loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
      },
      {
        path: 'add-contact',
        loadChildren: () => import('./add-contact/add-contact.module').then( m => m.AddContactPageModule)
      },


    ]
  },



];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ContactsPageRoutingModule {}
