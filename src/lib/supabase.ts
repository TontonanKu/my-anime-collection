import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dvmxrnfuudybbyyuldos.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2bXhybmZ1dWR5YmJ5eXVsZG9zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY1NzYxNDksImV4cCI6MjEwMjE1MjE0OX0.rgKs-PJb1yrRAMgW1wexTGjuh51XyfM2QdrUlv-0y6c';

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function uploadImage(file: File): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
  
  const { data, error } = await supabase.storage
    .from('images')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    console.error('Error uploading image:', error);
    throw new Error('Failed to upload image to Supabase');
  }

  const { data: publicUrlData } = supabase.storage
    .from('images')
    .getPublicUrl(data.path);

  return publicUrlData.publicUrl;
}
