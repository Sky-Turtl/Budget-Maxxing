import { useState, type FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import { signUp, signIn } from '../firebase/auth';
import { useAuth } from '../contexts/AuthContext';

export function AuthPage() {
  const { user, loading } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!loading && user) return <Navigate to="/paycheck" replace />;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (mode === 'signup') {
        await signUp(email, password);
      } else {
        await signIn(email, password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <h1>Budget-Maxxing</h1>
      <form onSubmit={handleSubmit}>
        <h2>{mode === 'login' ? 'Log in' : 'Sign up'}</h2>
        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />
        </label>
        {error && <p className="form-error">{error}</p>}
        <button type="submit" disabled={submitting}>
          {mode === 'login' ? 'Log in' : 'Sign up'}
        </button>
      </form>
      <button
        className="link-button"
        onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
      >
        {mode === 'login' ? 'Need an account? Sign up' : 'Already have an account? Log in'}
      </button>
    </div>
  );
}
