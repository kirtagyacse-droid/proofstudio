'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Logo from '@/components/Logo';

export default function Login() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Run on mount to bypass password-manager hydration crashes
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      const data = await res.json();
      if (!data.hasSeenDemo && data.demoProjectId) {
        router.push(`/project/${data.demoProjectId}`);
      } else {
        router.push('/dashboard');
      }
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error || 'Login failed');
    }
  };

  return (
    <div className="container flex flex-col items-center justify-center min-h-[70vh]">
      <div className="mb-8 text-center">
        <Logo variant="full" href="/" />
      </div>
      <div className="card w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-2">Welcome Back</h2>
        <p className="text-center text-muted mb-8">Log in to ProofStudio</p>
        
        {mounted ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm text-muted mb-2">Email</label>
              <input 
                type="email" 
                name="email"
                className="input w-full" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                required 
              />
            </div>
            <div>
              <label className="block text-sm text-muted mb-2">Password</label>
              <input 
                type="password" 
                name="password"
                className="input w-full" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required 
              />
            </div>
            
            {error && <div className="text-danger text-sm">{error}</div>}
            
            <button type="submit" className="btn btn-primary w-full mt-4">Login</button>
          </form>
        ) : (
          <div className="flex flex-col gap-4 opacity-50 pointer-events-none">
            <div>
              <label className="block text-sm text-muted mb-2">Email</label>
              <input type="email" className="input w-full" disabled />
            </div>
            <div>
              <label className="block text-sm text-muted mb-2">Password</label>
              <input type="password" className="input w-full" disabled />
            </div>
            <button type="button" className="btn btn-primary w-full mt-4" disabled>Loading...</button>
          </div>
        )}

        <div className="text-center mt-6 text-sm">
          <span className="text-muted">Don't have an account? </span>
          <Link href="/signup" className="text-primary hover:underline">Sign up</Link>
        </div>
      </div>
    </div>
  );
}
