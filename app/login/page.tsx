'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha }),
      });

      const data = await res.json();

      if (data.success && data.isAdmin) {
        router.push('/admin');
      } else if (data.success && !data.isAdmin) {
        setError('Acesso restrito a administradores.');
      } else {
        setError(data.error || 'Email ou senha incorretos');
      }
    } catch (err) {
      setError('Erro na requisição');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md border-t-4 border-blue-900">
        <div className="flex justify-center mb-6">
          <Image src="/images/logo.png" alt="Logo" width={120} height={120} className="rounded-lg" />
        </div>

        <h1 className="text-2xl font-bold mb-6 text-center text-blue-900" style={{ fontFamily: 'Poppins' }}>
          Acesso Administrativo
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
            style={{ fontFamily: 'Poppins' }}
          />
          <input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
            style={{ fontFamily: 'Poppins' }}
          />

          {error && (
            <p className="text-red-500 text-sm text-center" style={{ fontFamily: 'Poppins' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-900 hover:bg-blue-950 text-white font-bold py-2 rounded-lg disabled:opacity-50"
            style={{ fontFamily: 'Poppins' }}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="text-center mt-4">
          <button
            onClick={() => router.push('/')}
            className="text-xs text-slate-400 hover:text-blue-900"
            style={{ fontFamily: 'Poppins' }}
          >
            ← Voltar ao feedback
          </button>
        </p>
      </div>
    </div>
  );
}