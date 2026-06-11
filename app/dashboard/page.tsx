'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface Opcao {
  id: number;
  nome: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [opcoes, setOpcoes] = useState<Opcao[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userName, setUserName] = useState('');

  useEffect(() => {
    loadOpcoes();
    loadUserName();
  }, []);

  const loadOpcoes = async () => {
    try {
      const res = await fetch('/api/options/list');
      const data = await res.json();
      if (data.success) {
        setOpcoes(data.opcoes);
      }
    } catch (err) {
      setError('Erro ao carregar opções');
    }
  };

  const loadUserName = async () => {
    try {
      const res = await fetch('/api/auth/user-info');
      const data = await res.json();
      if (data.success) {
        setUserName(data.nome);
      }
    } catch (err) {
      console.error('Erro ao carregar nome do usuário:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await fetch('/api/options/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ opcao_id: selected }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccess('Seu registro foi salvo com sucesso');
        setSelected(null);
        setTimeout(() => setSuccess(''), 4000);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Erro ao registrar');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8 border-t-4 border-blue-900">
          {/* HEADER COM LOGO E NOME DO USUÁRIO */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
              <Image
                src="/images/logo.png"
                alt="Logo"
                width={80}
                height={80}
                className="rounded-lg"
              />
              {userName && (
                <div>
                  <p className="text-gray-600" style={{ fontFamily: 'Poppins' }}>
                    Bem-vindo(a),
                  </p>
                  <p className="text-2xl font-bold text-blue-900" style={{ fontFamily: 'Poppins' }}>
                    {userName}
                  </p>
                </div>
              )}
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm"
              style={{ fontFamily: 'Poppins' }}
            >
              Sair
            </button>
          </div>

          <h1 className="text-3xl font-bold text-blue-900 mb-2" style={{ fontFamily: 'Poppins' }}>
            Feedbacks de Orçamentos Negativos
          </h1>

          {/* PARÁGRAFO ATUALIZADO */}
          <div className="bg-blue-50 border-l-4 border-blue-900 p-4 mb-6 rounded">
            <p className="text-blue-900 text-center" style={{ fontFamily: 'Poppins' }}>
              Selecione um dos motivos abaixo que seu cliente indicou para não ter aprovado o orçamento enviado e depois clique em salvar.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              {opcoes.map((opcao) => (
                <label key={opcao.id} className="flex items-start p-3 hover:bg-white rounded cursor-pointer transition mb-2">
                  <input
                    type="radio"
                    name="opcao"
                    value={opcao.id}
                    checked={selected === opcao.id}
                    onChange={(e) => setSelected(Number(e.target.value))}
                    className="w-4 h-4 text-blue-900 mt-1"
                  />
                  <span className="ml-3 font-medium text-gray-700" style={{ fontFamily: 'Poppins' }}>
                    {opcao.nome}
                  </span>
                </label>
              ))}
            </div>

            {error && (
              <p className="text-red-500 text-center" style={{ fontFamily: 'Poppins' }}>
                {error}
              </p>
            )}
            {success && (
              <p className="text-green-600 font-bold text-center" style={{ fontFamily: 'Poppins' }}>
                {success}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || !selected}
              className="w-full bg-blue-900 hover:bg-blue-950 text-white font-bold py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ fontFamily: 'Poppins' }}
            >
              {loading ? 'Registrando...' : 'Salvar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}