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
  readonly message = signal('');
  readonly errorMessage = signal('');

  readonly form = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  toggleMode(): void {
    this.mode.update((value) => (value === 'signin' ? 'signup' : 'signin'));
    this.message.set('');
    this.errorMessage.set('');
  }

  async submit(): Promise<void> {
    this.form.markAllAsTouched();
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
          this.message.set(
            'Cadastro realizado. Abra o e-mail enviado pelo Supabase para confirmar sua conta.'
          );
        }
      }
    } catch (error: unknown) {
      this.errorMessage.set(
        error instanceof Error ? error.message : 'Não foi possível concluir a autenticação.'
      );
    } finally {
      this.submitting.set(false);
    }
  }
}
