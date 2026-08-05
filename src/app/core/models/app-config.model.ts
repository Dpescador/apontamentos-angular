export interface AppConfig {
  supabaseUrl: string;
  supabasePublishableKey: string;
  authRedirectUrl?: string;
  localAuthRedirectUrl?: string;
}
