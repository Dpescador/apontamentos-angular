import { Injectable, computed, inject, signal } from '@angular/core';
import { Session, User } from '@supabase/supabase-js';
import { UserProfile, UserRole } from '../models/user-profile.model';
import { SupabaseService } from './supabase.service';

interface ProfileRow {
  id: string;
  email: string | null;
  role: string;
  criado_em: string;
  atualizado_em: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly supabase = inject(SupabaseService);
  private readonly sessionState = signal<Session | null>(null);
  private readonly userState = signal<User | null>(null);
  private readonly profileState = signal<UserProfile | null>(null);
  private profileRequestId = 0;

  readonly session = this.sessionState.asReadonly();
  readonly user = this.userState.asReadonly();
  readonly profile = this.profileState.asReadonly();
  readonly loading = signal(true);
  readonly profileLoading = signal(false);
  readonly configured = this.supabase.isConfigured;
  readonly isAdmin = computed(() => this.profileState()?.role === 'ADMIN');
  readonly initialized: Promise<void>;

  constructor() {
    this.initialized = this.initialize();
  }

  async signIn(email: string, password: string): Promise<void> {
    const { data, error } = await this.supabase.client.auth.signInWithPassword({
      email: email.trim(),
      password
    });

    if (error) {
      throw new Error(this.translateAuthError(error.message));
    }

    this.setSession(data.session);
    await this.loadProfile(data.user);
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

    if (data.session) {
      this.setSession(data.session);
      await this.loadProfile(data.user);
    }

    return { confirmationRequired: data.session === null };
  }

  async signOut(): Promise<void> {
    const { error } = await this.supabase.client.auth.signOut();
    if (error) {
      throw new Error(error.message);
    }

    this.setSession(null);
    this.profileState.set(null);
  }

  async refreshProfile(): Promise<void> {
    await this.loadProfile(this.userState());
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
    await this.loadProfile(data.session?.user ?? null);

    this.supabase.client.auth.onAuthStateChange((_event: string, session: Session | null) => {
      this.setSession(session);

      window.setTimeout(() => {
        void this.loadProfile(session?.user ?? null);
      }, 0);
    });

    this.loading.set(false);
  }

  private setSession(session: Session | null): void {
    this.sessionState.set(session);
    this.userState.set(session?.user ?? null);

    if (!session) {
      this.profileState.set(null);
    }
  }

  private async loadProfile(user: User | null): Promise<void> {
    const requestId = ++this.profileRequestId;

    if (!user) {
      this.profileState.set(null);
      this.profileLoading.set(false);
      return;
    }

    this.profileLoading.set(true);

    const { data, error } = await this.supabase.client
      .from('profiles')
      .select('id, email, role, criado_em, atualizado_em')
      .eq('id', user.id)
      .maybeSingle();

    if (requestId !== this.profileRequestId) {
      return;
    }

    if (error) {
      console.error(
        'Não foi possível carregar o perfil de acesso. Execute os scripts mais recentes do Liquibase.',
        error
      );
      this.profileState.set(null);
      this.profileLoading.set(false);
      return;
    }

    if (!data) {
      this.profileState.set(null);
      this.profileLoading.set(false);
      return;
    }

    const row = data as ProfileRow;
    this.profileState.set({
      id: row.id,
      email: row.email,
      role: this.toRole(row.role),
      createdAt: row.criado_em,
      updatedAt: row.atualizado_em
    });
    this.profileLoading.set(false);
  }

  private toRole(value: string): UserRole {
    return value === 'ADMIN' ? 'ADMIN' : 'USER';
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
