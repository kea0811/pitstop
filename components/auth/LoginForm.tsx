'use client';

import { useState } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';

/**
 * Email + password sign-in via Supabase.
 *
 * Account creation is intentionally NOT exposed here — Gotham Garage is a
 * single-owner app. New accounts are provisioned out-of-band (Supabase
 * dashboard) and public sign-ups should be disabled in
 * Authentication → Settings → "Allow new users to sign up".
 */
export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError('Supabase is not configured — see the README.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err) {
        setError(
          err.message === 'Invalid login credentials'
            ? 'Wrong email or password.'
            : err.message,
        );
        return;
      }
      // Full navigation so middleware sees the fresh session cookies.
      window.location.assign('/collection');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {error ? (
        <p className="rounded-xl border border-danger/40 bg-danger/10 p-4 text-sm text-danger">
          {error}
        </p>
      ) : null}

      <form onSubmit={submit} className="flex flex-col gap-3">
        <Field
          label="Email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Field
          label="Password"
          type="password"
          required
          minLength={8}
          autoComplete="current-password"
          placeholder="Your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Button type="submit" disabled={busy || !email || !password}>
          {busy ? 'One sec…' : 'Sign in'}
        </Button>
      </form>
    </div>
  );
}
