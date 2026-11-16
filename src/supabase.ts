import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Konfigurasi Supabase untuk Sistem Asesmen Bakat dan Minat (ABM).
 *
 * Cara menghubungkan ke Supabase:
 * 1. Buat proyek baru di https://supabase.com lalu jalankan skrip SQL di `/supabase/schema.sql`
 *    melalui menu SQL Editor di Dashboard Supabase.
 * 2. Ambil Project URL dan Project API Key (`anon` / `publishable`) dari:
 *    Project Settings -> API.
 * 3. Isi ke file `.env` (VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY),
 *    ATAU isi langsung nilai fallback pada objek `supabaseConfig` di bawah ini.
 */
export const supabaseConfig = {
  // URL proyek Supabase Anda (region ap-southeast-1)
  url:
    (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim() ||
    'https://vnzxkbufsqjszhjcxkye.supabase.co',

  // Public / Publishable API Key Supabase (JANGAN masukkan secret key ke frontend)
  anonKey:
    (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim() ||
    'sb_publishable_-epAkVZ5co1edfzgtnJLOw_Y18AGDsn',
};

const PLACEHOLDER_MARKERS = ['YOUR_', 'MY_', '<', 'EXAMPLE', 'PLACEHOLDER'];

function isValidCredential(value: string): boolean {
  if (!value) return false;
  return !PLACEHOLDER_MARKERS.some((marker) => value.toUpperCase().includes(marker));
}

export function isSupabaseConfigured(): boolean {
  return (
    isValidCredential(supabaseConfig.url) &&
    supabaseConfig.url.startsWith('https://') &&
    isValidCredential(supabaseConfig.anonKey)
  );
}

export type BackendProvider = 'supabase' | 'firebase';

export function getBackendProvider(): BackendProvider {
  const rawMode = (
    (import.meta.env.VITE_BACKEND_PROVIDER as string | undefined) || 'auto'
  )
    .trim()
    .toLowerCase();

  if (rawMode === 'firebase') return 'firebase';
  if (rawMode === 'supabase') {
    if (!isSupabaseConfigured()) {
      console.warn(
        'VITE_BACKEND_PROVIDER="supabase", namun VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY belum diisi. Fallback sementara ke Firebase.'
      );
      return 'firebase';
    }
    return 'supabase';
  }

  return isSupabaseConfigured() ? 'supabase' : 'firebase';
}

export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(supabaseConfig.url, supabaseConfig.anonKey, {
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    })
  : null;

export async function testSupabaseConnection(): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('settings').select('id').limit(1);
    if (error) {
      console.error('Koneksi Supabase gagal:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Koneksi Supabase gagal:', err);
    return false;
  }
}
