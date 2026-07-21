import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

bootstrapApplication(AppComponent, appConfig).catch((error: unknown) => {
  console.error('Não foi possível iniciar a aplicação.', error);

  const root = document.querySelector('app-root');
  if (root) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    root.innerHTML = `
      <main style="max-width:760px;margin:48px auto;padding:24px;font-family:Arial,sans-serif">
        <h1 style="color:#b91c1c">Não foi possível iniciar a aplicação</h1>
        <p>Execute o projeto pelo Angular CLI usando <strong>npm start</strong>. Não abra o arquivo <strong>src/index.html</strong> diretamente.</p>
        <pre style="white-space:pre-wrap;padding:16px;border-radius:8px;background:#f1f5f9">${escapeHtml(message)}</pre>
      </main>`;
  }
});

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
