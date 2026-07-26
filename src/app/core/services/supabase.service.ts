import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AppConfig } from '../models/app-config.model';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  private readonly config = this.readConfig();
  private readonly clientInstance: SupabaseClient | null = this.createClient();

  readonly isConfigured = this.clientInstance !== null;

  get client(): SupabaseClient {
    if (!this.clientInstance) {
      throw new Error(
        'Supabase não configurado. Preencha public/app-config.js com a URL e a Publishable key do projeto.'
      );
    }

    return this.clientInstance;
  }

  private createClient(): SupabaseClient | null {
    if (!this.hasValidConfig(this.config)) {
      return null;
    }

    return createClient(
      this.config.supabaseUrl,
      this.config.supabasePublishableKey,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        }
      }
    );
  }

  private readConfig(): Partial<AppConfig> {
    return window.__APP_CONFIG__ ?? {};
  }

  private hasValidConfig(config: Partial<AppConfig>): config is AppConfig {
    const url = config.supabaseUrl?.trim() ?? '';
    const key = config.supabasePublishableKey?.trim() ?? '';

    const isPublicKey =
      key.startsWith('sb_publishable_') || key.startsWith('eyJ');

    return (
      /^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(url) &&
      isPublicKey &&
      key.length > 20 &&
      !url.includes('SEU-PROJETO') &&
      !key.includes('SUA_CHAVE') &&
      !key.includes('EXEMPLO')
    );
  }
}
