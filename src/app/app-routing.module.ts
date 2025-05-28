import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { noAuthGuard } from './guards/no-auth.guard';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [

  {
    path: '',
    redirectTo: 'intro',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    loadChildren: () => import('./pages/auth/auth.module').then( m => m.AuthPageModule), canActivate: [noAuthGuard]
  },
  {
    path: 'contacts',
    loadChildren: () => import('./pages/contacts/contacts.module').then( m => m.ContactsPageModule), canActivate: [AuthGuard]
  },
  {
    path: 'recibir-llamada',
    loadChildren: () => import('./pages/recibir-llamada/recibir-llamada.module').then( m => m.RecibirLlamadaPageModule)
  },
  {
    path: 'intro',
    loadChildren: () => import('./pages/intro/intro.module').then( m => m.IntroPageModule)
  },
 {
    path: 'chat/:contactId/:contactName',
  loadChildren: () => import('./pages/chat/chat.module').then(m => m.ChatPageModule),
  canActivate: [AuthGuard]
}
,


];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
