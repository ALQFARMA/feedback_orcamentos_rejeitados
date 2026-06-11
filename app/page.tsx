'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function Home() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirma, setConfirma] = useState('');
  const [nome, setNome] = useState('');
  const [loja, setLoja] = useState('Tijuca');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const body = isLogin 
        ? { email, senha }
        : { email, senha, confirma_senha: confirma, nome, loja };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (data.success) {
        if (isLogin) {
          if (data.é_admin) {
            router.push('/admin');
          } else {
            router.push('/dashboard');
          }
        } else {
          setError('');
          alert('Usuário criado com sucesso! Agora faça login.');
          setIsLogin(true);
          setEmail('');
          setSenha('');
          setConfirma('');
          setNome('');
          setLoja('Tijuca');
        }
      } else {
        setError(data.error || 'Erro');
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
        {/* LOGO */}
        <div className="flex justify-center mb-6">
          <Image
            src="/images/logo.png"
            alt="Logo"
            width={120}
            height={120}
            className="rounded-lg"
          />
        </div>

        <h1 className="text-3xl font-bold mb-6 text-center text-blue-900" style={{ fontFamily: 'Poppins' }}>
          {isLogin ? 'Entrar' : 'Registrar'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <input
                type="text"
                placeholder="Seu nome completo"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
                style={{ fontFamily: 'Poppins' }}
              />

              <select
                value={loja}
                onChange={(e) => setLoja(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
                style={{ fontFamily: 'Poppins' }}
              >
                <option value="Tijuca">Loja Tijuca</option>
                <option value="Downtown">Loja Downtown</option>
                <option value="Barra">Loja Barra</option>
              </select>
            </>
          )}

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

          {!isLogin && (
            <input
              type="password"
              placeholder="Confirmar Senha"
              value={confirma}
              onChange={(e) => setConfirma(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
              style={{ fontFamily: 'Poppins' }}
            />
          )}

          {error && <p className="text-red-500 text-sm text-center" style={{ fontFamily: 'Poppins' }}>{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-900 hover:bg-blue-950 text-white font-bold py-2 rounded-lg disabled:opacity-50"
            style={{ fontFamily: 'Poppins' }}
          >
            {loading ? 'Processando...' : (isLogin ? 'Entrar' : 'Registrar')}
          </button>
        </form>

        <p className="text-center mt-4 text-gray-600" style={{ fontFamily: 'Poppins' }}>
          {isLogin ? 'Não tem conta? ' : 'Já tem conta? '}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-900 hover:underline font-bold"
          >
            {isLogin ? 'Registre-se' : 'Entrar'}
          </button>
        </p>
      </div>
    </div>
  );
}