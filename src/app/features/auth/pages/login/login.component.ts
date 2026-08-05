import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent {
  private readonly formBuilder = inject(FormBuilder);
  readonly auth = inject(AuthService);

  readonly mode = signal<'signin' | 'signup'>('signin');
  readonly submitting = signal(false);
  readonly resendingConfirmation = signal(false);
  readonly pendingConfirmationEmail = signal('');
  readonly message = signal('');
  readonly errorMessage = signal('');

  readonly form = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  toggleMode(): void {
    this.mode.update((value) => (value === 'signin' ? 'signup' : 'signin'));
    this.pendingConfirmationEmail.set('');
    this.message.set('');
    this.errorMessage.set('');
  }

  async submit(): Promise<void> {
    this.form.markAllAsTouched();
    this.pendingConfirmationEmail.set('');
    this.message.set('');
    this.errorMessage.set('');

    if (this.form.invalid || !this.auth.configured) {
      return;
    }

    const { email, password } = this.form.getRawValue();
    this.submitting.set(true);

    try {
      if (this.mode() === 'signin') {
        await this.auth.signIn(email, password);
      } else {
        const result = await this.auth.signUp(email, password);
        if (result.confirmationRequired) {
          this.pendingConfirmationEmail.set(email.trim());
          this.message.set(
            'Cadastro realizado. Abra o e-mail enviado pelo Supabase para confirmar sua conta.'
          );
        }
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Não foi possível concluir a autenticação.';

      if (message === 'Confirme seu e-mail antes de entrar.') {
        this.pendingConfirmationEmail.set(email.trim());
      }

      this.errorMessage.set(message);
    } finally {
      this.submitting.set(false);
    }
  }

  async resendConfirmation(): Promise<void> {
    const email = this.pendingConfirmationEmail() || this.form.controls.email.value.trim();

    if (!email || this.form.controls.email.invalid || !this.auth.configured) {
      this.form.controls.email.markAsTouched();
      return;
    }

    this.resendingConfirmation.set(true);
    this.message.set('');
    this.errorMessage.set('');

    try {
      await this.auth.resendSignupConfirmation(email);
      this.pendingConfirmationEmail.set(email);
      this.message.set('Um novo e-mail de confirmação foi enviado.');
    } catch (error: unknown) {
      this.errorMessage.set(
        error instanceof Error ? error.message : 'Não foi possível reenviar a confirmação.'
      );
    } finally {
      this.resendingConfirmation.set(false);
    }
  }
}
