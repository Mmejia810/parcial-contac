import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {

  darkMode = new BehaviorSubject(false)

  constructor() { }

  setInitialTheme(){
    let darkMode = JSON.parse(localStorage.getItem('darkMode'))
    if ( darkMode){
      this.setTheme(darkMode)
    }
    else{
      this.setTheme(darkMode)
    }
    this.darkMode.next(darkMode);
    localStorage.setItem('darkMode', JSON.stringify(darkMode))
  }


  setTheme ( darkMode : boolean){
    console.log("Cambiando tema a:", darkMode ? "Oscuro" : "Claro");
    if ( darkMode){
      document.body.setAttribute('color-theme', 'dark')
    }
    else{
      document.body.setAttribute('color-theme', 'light')
    }
    this.darkMode.next(darkMode);
    localStorage.setItem('darkMode', JSON.stringify(darkMode))
  }
}
