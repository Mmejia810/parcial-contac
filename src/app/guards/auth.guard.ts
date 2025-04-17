import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { FirebaseService } from '../services/firebase.service';
import { UtilsService } from '../services/utils.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

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
        if (auth) {
          return true;
        } else {
          this.utilsSvc.routerLink('/auth');
          return false;
        }
      })
    );
  }
}
