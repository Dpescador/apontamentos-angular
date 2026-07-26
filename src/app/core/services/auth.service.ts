import { Injectable, inject, signal } from '@angular/core';
import { Session, User } from '@supabase/supabase-js';
import { SupabaseService } from './supabase.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly supabase = inject(SupabaseService);
  private readonly sessionState = signal<Session | null>(null);
  private readonly userState = signal<User | null>(null);

  readonly session = this.sessionState.asReadonly();
  readonly user = this.userState.asReadonly();
  readonly loading = signal(true);
  readonly configured = this.supabase.isConfigured;
  readonly initialized: Promise<void>;

  constructor() {
    this.initialized = this.initialize();
  }

  async signIn(email: string, password: string): Promise<void> {
    const { error } = await this.supabase.client.auth.signInWithPassword({
      email: email.trim(),
      password
    });

    if (error) {
      throw new Error(this.translateAuthError(error.message));
    }
  }

  async signUp(email: string, password: string): Promise<{ confirmationRequired: boolean }> {
    const { data, error } = await this.supabase.client.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: window.location.origin + window.location.pathname
      }
    });

    if (error) {
      throw new Error(this.translateAuthError(error.message));
    }

    return { confirmationRequired: data.session === null };
  }

  async signOut(): Promise<void> {
    const { error } = await this.supabase.client.auth.signOut();
    if (error) {
      throw new Error(error.message);
    }
  }

  private async initialize(): Promise<void> {
    if (!this.configured) {
      this.loading.set(false);
      return;
    }

    const { data, error } = await this.supabase.client.auth.getSession();
    if (error) {
      console.error('Não foi possível recuperar a sessão do Supabase.', error);
    }

    this.setSession(data.session);

    this.supabase.client.auth.onAuthStateChange((_event: string, session: Session | null) => {
      this.setSession(session);
    });

    this.loading.set(false);
  }

  private setSession(session: Session | null): void {
    this.sessionState.set(session);
    this.userState.set(session?.user ?? null);
  }

  private translateAuthError(message: string): string {
    const normalized = message.toLowerCase();

    if (normalized.includes('invalid login credentials')) {
      return 'E-mail ou senha inválidos.';
    }
    if (normalized.includes('email not confirmed')) {
      return 'Confirme seu e-mail antes de entrar.';
    }
    if (normalized.includes('user already registered')) {
      return 'Este e-mail já está cadastrado.';
    }
    if (normalized.includes('password should be at least')) {
      return 'A senha deve possuir pelo menos 6 caracteres.';
    }

    return message;
  }
}
