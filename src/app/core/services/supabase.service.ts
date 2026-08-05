import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AppConfig } from '../models/app-config.model';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  private readonly config = this.readConfig();
  private readonly clientInstance: SupabaseClient | null = this.createClient();

  readonly isConfigured = this.clientInstance !== null;
  readonly authRedirectUrl = this.resolveAuthRedirectUrl();

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

  private resolveAuthRedirectUrl(): string {
    const isLocalhost =
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1';

    const configuredUrl = isLocalhost
      ? this.config.localAuthRedirectUrl
      : this.config.authRedirectUrl;

    if (this.isValidRedirectUrl(configuredUrl)) {
      return this.ensureTrailingSlash(configuredUrl.trim());
    }

    const currentUrl = new URL(window.location.href);
    currentUrl.search = '';
    currentUrl.hash = '';

    return this.ensureTrailingSlash(currentUrl.toString());
  }

  private isValidRedirectUrl(value: string | undefined): value is string {
    if (!value?.trim()) {
      return false;
    }

    try {
      const url = new URL(value.trim());
      const isLocalhost =
        url.hostname === 'localhost' || url.hostname === '127.0.0.1';

      return url.protocol === 'https:' || (url.protocol === 'http:' && isLocalhost);
    } catch {
      return false;
    }
  }

  private ensureTrailingSlash(value: string): string {
    const url = new URL(value);
    url.search = '';
    url.hash = '';

    if (!url.pathname.endsWith('/')) {
      url.pathname += '/';
    }

    return url.toString();
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
