import { useMemo, useState } from 'react';
import { BookOpen, ChefHat, LogIn, Mail, UserPlus } from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';

const modes = {
  login: {
    title: 'Entrar',
    submit: 'Entrar',
    icon: LogIn
  },
  register: {
    title: 'Criar conta',
    submit: 'Criar conta',
    icon: UserPlus
  },
  reset: {
    title: 'Recuperar senha',
    submit: 'Enviar e-mail',
    icon: Mail
  }
};

function getAuthErrorMessage(error, mode) {
  switch (error?.code) {
    case 'auth/invalid-email':
      return 'Informe um e-mail valido.';
    case 'auth/invalid-credential':
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return mode === 'login'
        ? 'E-mail ou senha incorretos. Se ainda nao tiver conta, toque em Criar conta.'
        : 'Nao foi possivel validar esses dados.';
    case 'auth/email-already-in-use':
      return 'Este e-mail ja tem uma conta. Toque em Entrar.';
    case 'auth/weak-password':
      return 'Use uma senha com pelo menos 6 caracteres.';
    case 'auth/too-many-requests':
      return 'Muitas tentativas. Aguarde um pouco e tente novamente.';
    case 'auth/network-request-failed':
      return 'Falha de conexao. Confira sua internet e tente novamente.';
    default:
      return 'Nao foi possivel concluir. Confira os dados e tente novamente.';
  }
}

export function LoginPage() {
  const { signIn, signUp, resetPassword, hasFirebaseConfig } = useAuth();
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const currentMode = useMemo(() => modes[mode], [mode]);
  const Icon = currentMode.icon;

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage('');
    setError('');

    if (!email.trim()) {
      setError('Informe seu e-mail.');
      return;
    }

    if (mode !== 'reset' && password.length < 6) {
      setError('A senha precisa ter pelo menos 6 caracteres.');
      return;
    }

    setSubmitting(true);

    try {
      if (mode === 'login') {
        await signIn(email.trim(), password);
      } else if (mode === 'register') {
        await signUp(email.trim(), password);
      } else {
        await resetPassword(email.trim());
        setMessage('Enviamos as instrucoes para o seu e-mail.');
      }
    } catch (submitError) {
      console.error(submitError);
      setError(getAuthErrorMessage(submitError, mode));
    } finally {
      setSubmitting(false);
    }
  }

  if (!hasFirebaseConfig) {
    return (
      <main className="auth-page">
        <section className="auth-panel">
          <div className="brand-lockup">
            <span className="brand-icon brand-icon-large" aria-hidden="true">
              <BookOpen size={28} />
              <ChefHat size={16} className="brand-icon-badge" />
            </span>
            <div>
              <p className="eyebrow">Minhas Receitas</p>
              <h1>Configure o Firebase</h1>
            </div>
          </div>
          <p className="muted">
            Copie o arquivo .env.example para .env e preencha as variaveis do seu projeto Firebase.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <div className="brand-lockup">
          <span className="brand-icon brand-icon-large" aria-hidden="true">
            <BookOpen size={28} />
            <ChefHat size={16} className="brand-icon-badge" />
          </span>
          <div>
            <p className="eyebrow">Minhas Receitas</p>
            <h1>{currentMode.title}</h1>
          </div>
        </div>

        <form className="stack" onSubmit={handleSubmit}>
          <label>
            E-mail
            <input
              autoComplete="email"
              inputMode="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="voce@email.com"
            />
          </label>

          {mode !== 'reset' ? (
            <label>
              Senha
              <input
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Sua senha"
              />
            </label>
          ) : null}

          {error ? <p className="form-message error">{error}</p> : null}
          {message ? <p className="form-message success">{message}</p> : null}

          <button className="primary-button" type="submit" disabled={submitting}>
            <Icon size={20} />
            {submitting ? 'Aguarde...' : currentMode.submit}
          </button>
        </form>

        <div className="auth-actions">
          {mode !== 'login' ? (
            <button type="button" className="link-button" onClick={() => setMode('login')}>
              Ja tenho conta
            </button>
          ) : null}
          {mode !== 'register' ? (
            <button type="button" className="link-button" onClick={() => setMode('register')}>
              Criar conta
            </button>
          ) : null}
          {mode !== 'reset' ? (
            <button type="button" className="link-button" onClick={() => setMode('reset')}>
              Esqueci minha senha
            </button>
          ) : null}
        </div>
      </section>
    </main>
  );
}
