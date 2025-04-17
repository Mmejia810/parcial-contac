import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { from, map, Observable } from 'rxjs';
import { FirebaseService } from '../services/firebase.service';
import { UtilsService } from '../services/utils.service';

@Injectable({
  providedIn: 'root'
})
export class noAuthGuard implements CanActivate {

  constructor(
    private firebaseSvc: FirebaseService,
    private utilsSvc: UtilsService
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> {
    return from(this.firebaseSvc.getAuthState()).pipe(
      map(auth => {
        if (!auth) {
          // No hay usuario autenticado → permite acceso
          return true;
        } else {
          // Ya hay un usuario autenticado → redirige
          this.utilsSvc.routerLink('/contacts/home');
          return false;
        }
      })
    );
  }
}
