import { Injectable } from '@angular/core';
import { Filesystem } from '@capacitor/filesystem';
import { createClient } from '@supabase/supabase-js';


@Injectable({
  providedIn: 'root'
})
export class StorageService {

  private supabaseUrl = 'https://vkkhgwadkcyqatqlsstn.supabase.co';
  private supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZra2hnd2Fka2N5cWF0cWxzc3RuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzNzE1MTYsImV4cCI6MjA2Mzk0NzUxNn0.qMInRyEXCAMwdbKfBmh0hTCy2RTbjgNy26B4YPKyCFk';
  private supabase = createClient(this.supabaseUrl, this.supabaseAnonKey);

  constructor() {}

  async uploadFile(file: any): Promise<string> {
    let fileData: Blob;

    if (file instanceof File) {
      fileData = file;
    } else if (file.webPath) {
      const response = await fetch(file.webPath);
      fileData = await response.blob();
    } else if (file.path) {
      const fileRead = await Filesystem.readFile({ path: file.path });
      const base64 = fileRead.data;
      fileData = this.b64toBlob(base64);
    } else {
      throw new Error('Tipo de archivo no soportado');
    }

    const fileName = new Date().getTime() + '_' + (file.name || 'uploadfile');

    const { data, error } = await this.supabase.storage
      .from('multimedia')
      .upload(fileName, fileData);

    if (error) {
      console.error('Error subida Supabase:', error);
      throw error;
    }

    const { data: publicData } = this.supabase.storage.from('multimedia').getPublicUrl(fileName);
const url = publicData.publicUrl;


    return url;
  }

  b64toBlob(b64Data, contentType = '', sliceSize = 512) {
    const byteCharacters = atob(b64Data);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);

      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    return new Blob(byteArrays, { type: contentType });
  }
}
