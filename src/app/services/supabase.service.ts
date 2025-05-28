import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      'https://vkkhgwadkcyqatqlsstn.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZra2hnd2Fka2N5cWF0cWxzc3RuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzNzE1MTYsImV4cCI6MjA2Mzk0NzUxNn0.qMInRyEXCAMwdbKfBmh0hTCy2RTbjgNy26B4YPKyCFk'
    );
  }

async uploadFile(file: File, path: string): Promise<string> {
  // path ejemplo: 'multimedia/miimagen123.png'
  const { data, error } = await this.supabase.storage
    .from('multimedia')
    .upload(path, file, { cacheControl: '3600', upsert: false });

  if (error) {
    throw new Error(error.message);
  }

  // Obtener URL pública del archivo
  const { data: urlData } = this.supabase.storage
    .from('multimedia')
    .getPublicUrl(path);

  const publicUrl = urlData.publicUrl;

  return publicUrl;
}
}
