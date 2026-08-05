/**
 * Configuração pública do Supabase para execução local e no GitHub Pages.
 *
 * A URL e a Publishable key podem ser expostas no navegador quando o banco
 * está protegido por autenticação e políticas RLS. O workflow do GitHub Pages
 * substitui estes valores pelas Repository Variables durante a publicação.
 *
 * Nunca adicione chaves administrativas ou credenciais do PostgreSQL aqui.
 */
window.__APP_CONFIG__ = {
  supabaseUrl: 'https://farlvrnapxqeirfduakc.supabase.co',
  supabasePublishableKey: 'sb_publishable_pZWYx9sgBCrbwcDUFNwXGg_Ep_VwdrG',
  authRedirectUrl: 'https://dpescador.github.io/apontamentos-angular/',
  localAuthRedirectUrl: 'http://localhost:4200/'
};
