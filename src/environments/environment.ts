// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,

   supabase: {
    url: 'https://vkkhgwadkcyqatqlsstn.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZra2hnd2Fka2N5cWF0cWxzc3RuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzNzE1MTYsImV4cCI6MjA2Mzk0NzUxNn0.qMInRyEXCAMwdbKfBmh0hTCy2RTbjgNy26B4YPKyCFk'  // reemplaza aquí con tu anon key
  },
  firebaseConfig:{
    apiKey: "AIzaSyAFo-es0dXZDgiUmeLF1X-RbXjdttTAp0g",
    authDomain: "pushnoti-b78a7.firebaseapp.com",
    projectId: "pushnoti-b78a7",
    storageBucket: "pushnoti-b78a7.firebasestorage.app",
    messagingSenderId: "1050286023399",
    appId: "1:1050286023399:web:462cf1f32dfea3c227f842"
  }

};


/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
