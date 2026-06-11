import { FormEvent, ReactNode, useState } from 'react';
import { ArrowRight, Eye, EyeOff, LockKeyhole, UserPlus, X } from 'lucide-react';
import { LoginPayload, SignUpPayload } from '../../types';

type SignInModalProps = {
  onClose: () => void;
  onLogin: (payload: LoginPayload) => Promise<void>;
  onSignUp: (payload: SignUpPayload) => Promise<void>;
};

type AuthView = 'login' | 'signup';
type SocialProvider = 'Google' | 'Apple' | 'Facebook';

type LoginFormState = LoginPayload;
type SignUpFormState = SignUpPayload & { confirmPassword: string };

const initialLoginForm: LoginFormState = {
  email: '',
  password: '',
};

const initialSignUpForm: SignUpFormState = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  documentNumber: '',
  profession: '',
  password: '',
  confirmPassword: '',
};

function cleanSignUpPayload(form: SignUpFormState): SignUpPayload {
  return {
    firstName: form.firstName.trim(),
    lastName: form.lastName?.trim() || undefined,
    email: form.email.trim().toLowerCase(),
    phone: form.phone?.trim() || undefined,
    documentNumber: form.documentNumber?.trim() || undefined,
    profession: form.profession?.trim() || undefined,
    password: form.password,
  };
}

function validateSignUp(form: SignUpFormState) {
  if (!form.firstName.trim()) return 'Ingresá tu nombre.';
  if (!form.email.trim()) return 'Ingresá tu email.';
  if (!form.documentNumber?.trim()) return 'Ingresá tu número de documento.';
  if (form.password.length < 8) return 'La contraseña debe tener al menos 8 caracteres.';
  if (form.password !== form.confirmPassword) return 'Las contraseñas no coinciden.';
  return null;
}

function GoogleIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
      <path fill="currentColor" d="M17.05 20.28c-.98.95-2.05 1.72-3.21 1.72-1.13 0-1.5-.69-2.84-.69-1.34 0-1.75.67-2.84.69-1.11.02-2.13-.72-3.16-1.74-2.1-2.08-3.21-5.89-3.21-8.49 0-4.1 2.66-6.26 5.19-6.26 1.33 0 2.59.92 3.4.92.81 0 2.12-.92 3.67-.92 1.41 0 3.61.51 4.84 2.3-2.94 1.72-2.46 5.48.46 6.65-.88 2.13-2.32 4.87-3.3 5.82zM12.03 5.07C12.01 2.38 14.26.18 16.94 0c.25 2.7-2.23 5.07-4.91 5.07z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
      <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function SocialAuthButton({ provider, children, onUnavailable }: { provider: SocialProvider; children: ReactNode; onUnavailable: (provider: SocialProvider) => void }) {
  return (
    <button className="social-auth-button" type="button" onClick={() => onUnavailable(provider)}>
      {children}
      <span>{provider}</span>
    </button>
  );
}

function SocialAuthOptions({ onUnavailable }: { onUnavailable: (provider: SocialProvider) => void }) {
  return (
    <div className="auth-social-section" aria-label="Acceso con proveedores externos">
      <SocialAuthButton provider="Google" onUnavailable={onUnavailable}><GoogleIcon /></SocialAuthButton>
      <SocialAuthButton provider="Apple" onUnavailable={onUnavailable}><AppleIcon /></SocialAuthButton>
      <SocialAuthButton provider="Facebook" onUnavailable={onUnavailable}><FacebookIcon /></SocialAuthButton>
    </div>
  );
}

function PasswordInput({
  id,
  name,
  value,
  placeholder,
  autoComplete,
  showPassword,
  onTogglePassword,
  onChange,
}: {
  id: string;
  name: string;
  value: string;
  placeholder: string;
  autoComplete: string;
  showPassword: boolean;
  onTogglePassword: () => void;
  onChange: (value: string) => void;
}) {
  return (
    <div className="password-field">
      <input
        id={id}
        name={name}
        autoComplete={autoComplete}
        minLength={8}
        placeholder={placeholder}
        required
        type={showPassword ? 'text' : 'password'}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      <button type="button" onClick={onTogglePassword} aria-label="Mostrar u ocultar contraseña">
        {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
      </button>
    </div>
  );
}

export function SignInModal({ onClose, onLogin, onSignUp }: SignInModalProps) {
  const [view, setView] = useState<AuthView>('login');
  const [loginForm, setLoginForm] = useState<LoginFormState>(initialLoginForm);
  const [signUpForm, setSignUpForm] = useState<SignUpFormState>(initialSignUpForm);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const title = view === 'login' ? 'Ingresar a Espacios MDP' : 'Crear cuenta';
  const subtitle = view === 'login'
    ? 'Entrá con tu email y contraseña para gestionar tus reservas.'
    : 'Registrate para reservar horarios y consultar tus próximas reservas.';

  async function submitLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await onLogin({ email: loginForm.email.trim().toLowerCase(), password: loginForm.password });
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'No se pudo iniciar sesión.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function submitSignUp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const validationError = validateSignUp(signUpForm);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSignUp(cleanSignUpPayload(signUpForm));
    } catch (signUpError) {
      setError(signUpError instanceof Error ? signUpError.message : 'No se pudo crear la cuenta.');
    } finally {
      setIsSubmitting(false);
    }
  }

  function switchView(nextView: AuthView) {
    setView(nextView);
    setError(null);
    setShowPassword(false);
  }

  function handleUnavailableProvider(provider: SocialProvider) {
    setError(`${provider} todavía no está implementado. Por ahora usá email y contraseña.`);
  }

  return (
    <div className="modal-backdrop auth-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="auth-modal-title">
      <section className="modal-card auth-card auth-card-v2">
        <button className="auth-close-button" onClick={onClose} aria-label="Cerrar modal" type="button"><X size={18} /></button>

        <header className="auth-modal-title-block">
          <h2 id="auth-modal-title">{title}</h2>
          <p>{subtitle}</p>
        </header>

        <div className="auth-tabs auth-tabs-v2" role="tablist" aria-label="Acceso">
          <button className={view === 'login' ? 'is-active' : ''} type="button" onClick={() => switchView('login')}>Iniciar sesión</button>
          <button className={view === 'signup' ? 'is-active' : ''} type="button" onClick={() => switchView('signup')}>Crear cuenta</button>
        </div>

        {view === 'login' && (
          <>
            <form className="auth-form auth-form-v2 auth-form-compact-bottom" onSubmit={submitLogin} autoComplete="on">
              <label>
                <span>Email</span>
                <input
                  id="login-email"
                  name="email"
                  autoComplete="email"
                  inputMode="email"
                  placeholder="tu@email.com"
                  required
                  type="email"
                  value={loginForm.email}
                  onChange={(event) => setLoginForm((current) => ({ ...current, email: event.target.value }))}
                />
              </label>

              <label>
                <span>Contraseña</span>
                <PasswordInput
                  id="login-password"
                  name="current-password"
                  autoComplete="current-password"
                  placeholder="Tu contraseña"
                  value={loginForm.password}
                  showPassword={showPassword}
                  onTogglePassword={() => setShowPassword((current) => !current)}
                  onChange={(password) => setLoginForm((current) => ({ ...current, password }))}
                />
              </label>

              {error && <p className="auth-error">{error}</p>}

              <button className="primary-button full auth-submit" type="submit" disabled={isSubmitting}>
                <LockKeyhole size={18} />
                {isSubmitting ? 'Ingresando...' : 'Ingresar'}
                <ArrowRight size={18} />
              </button>
            </form>

            <div className="auth-divider auth-divider-compact"><span>o continuar con</span></div>
            <SocialAuthOptions onUnavailable={handleUnavailableProvider} />
            <p className="auth-provider-note">Google, Apple y Facebook quedan preparados para implementar OAuth.</p>
          </>
        )}

        {view === 'signup' && (
          <>
            <SocialAuthOptions onUnavailable={handleUnavailableProvider} />

            <div className="auth-divider"><span>o registrate con email</span></div>

            <form className="auth-form auth-form-v2" onSubmit={submitSignUp} autoComplete="on">
              <div className="auth-form-grid">
                <label>
                  <span>Nombre</span>
                  <input
                    id="signup-first-name"
                    name="given-name"
                    autoComplete="given-name"
                    placeholder="Ej: Juan"
                    required
                    value={signUpForm.firstName}
                    onChange={(event) => setSignUpForm((current) => ({ ...current, firstName: event.target.value }))}
                  />
                </label>

                <label>
                  <span>Apellido</span>
                  <input
                    id="signup-last-name"
                    name="family-name"
                    autoComplete="family-name"
                    placeholder="Ej: Pérez"
                    value={signUpForm.lastName}
                    onChange={(event) => setSignUpForm((current) => ({ ...current, lastName: event.target.value }))}
                  />
                </label>
              </div>

              <label>
                <span>Email</span>
                <input
                  id="signup-email"
                  name="email"
                  autoComplete="email"
                  inputMode="email"
                  placeholder="tu@email.com"
                  required
                  type="email"
                  value={signUpForm.email}
                  onChange={(event) => setSignUpForm((current) => ({ ...current, email: event.target.value }))}
                />
              </label>

              <div className="auth-form-grid">
                <label>
                  <span>Teléfono</span>
                  <input
                    id="signup-phone"
                    name="tel"
                    autoComplete="tel"
                    inputMode="tel"
                    placeholder="+54 223 ..."
                    value={signUpForm.phone}
                    onChange={(event) => setSignUpForm((current) => ({ ...current, phone: event.target.value }))}
                  />
                </label>

                <label>
                  <span>Número de documento</span>
                  <input
                    id="signup-document-number"
                    name="document-number"
                    autoComplete="off"
                    inputMode="numeric"
                    placeholder="DNI / documento"
                    required
                    value={signUpForm.documentNumber}
                    onChange={(event) => setSignUpForm((current) => ({ ...current, documentNumber: event.target.value }))}
                  />
                </label>
              </div>

              <label>
                <span>Profesión / actividad</span>
                <input
                  id="signup-profession"
                  name="organization-title"
                  autoComplete="organization-title"
                  placeholder="Ej: psicóloga, abogado, consultora..."
                  value={signUpForm.profession}
                  onChange={(event) => setSignUpForm((current) => ({ ...current, profession: event.target.value }))}
                />
              </label>

              <div className="auth-form-grid">
                <label>
                  <span>Contraseña</span>
                  <PasswordInput
                    id="signup-password"
                    name="new-password"
                    autoComplete="new-password"
                    placeholder="Mínimo 8 caracteres"
                    value={signUpForm.password}
                    showPassword={showPassword}
                    onTogglePassword={() => setShowPassword((current) => !current)}
                    onChange={(password) => setSignUpForm((current) => ({ ...current, password }))}
                  />
                </label>

                <label>
                  <span>Repetir contraseña</span>
                  <PasswordInput
                    id="signup-confirm-password"
                    name="new-password-confirmation"
                    autoComplete="new-password"
                    placeholder="Repetí la contraseña"
                    value={signUpForm.confirmPassword}
                    showPassword={showPassword}
                    onTogglePassword={() => setShowPassword((current) => !current)}
                    onChange={(confirmPassword) => setSignUpForm((current) => ({ ...current, confirmPassword }))}
                  />
                </label>
              </div>

              {error && <p className="auth-error">{error}</p>}

              <button className="primary-button full auth-submit" type="submit" disabled={isSubmitting}>
                <UserPlus size={18} />
                {isSubmitting ? 'Creando cuenta...' : 'Crear cuenta'}
                <ArrowRight size={18} />
              </button>
            </form>
          </>
        )}
      </section>
    </div>
  );
}
