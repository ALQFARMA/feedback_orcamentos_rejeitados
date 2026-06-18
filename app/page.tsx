'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface Opcao {
  id: number;
  nome: string;
}

export default function Home() {
  const router = useRouter();
  const [opcoes, setOpcoes] = useState<Opcao[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadOpcoes();
  }, []);

  const loadOpcoes = async () => {
    try {
      const res = await fetch('/api/options/list');
      const data = await res.json();
      if (data.success) setOpcoes(data.opcoes);
    } catch (err) {
      console.error('Erro ao carregar opções:', err);
    }
  };

  const handleSubmit = async () => {
    if (!selected) return;
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await fetch('/api/feedback/save', {
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
        setError(data.error || 'Erro ao salvar');
      }
    } catch (err) {
      setError('Erro ao salvar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8 border-t-4 border-blue-900">

          {/* HEADER */}
          <div className="flex justify-between items-center mb-8">
            <Image src="/images/logo.png" alt="Logo" width={140} height={140} className="rounded-lg" />
            <button
              onClick={() => router.push('/login')}
              className="bg-blue-900 hover:bg-blue-950 text-white text-sm font-bold px-4 py-2 rounded-lg transition"
              style={{ fontFamily: 'Poppins' }}
            >
              Log in
            </button>
          </div>

          <h1 className="text-3xl font-bold text-blue-900 mb-2" style={{ fontFamily: 'Poppins' }}>
            Feedbacks de Orçamentos Negativos
          </h1>

          <div className="bg-blue-50 border-l-4 border-blue-900 p-4 mb-6 rounded">
            <p className="text-blue-900 text-center" style={{ fontFamily: 'Poppins' }}>
              Selecione um dos motivos abaixo que seu cliente indicou para não ter aprovado o orçamento enviado e depois clique em salvar.
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
            {opcoes.map((opcao) => (
              <label key={opcao.id} className="flex items-start p-3 hover:bg-white rounded cursor-pointer transition mb-2">
                <input
                  type="radio"
                  name="opcao"
                  value={opcao.id}
                  checked={selected === opcao.id}
                  onChange={() => setSelected(opcao.id)}
                  className="w-4 h-4 text-blue-900 mt-1"
                />
                <span className="ml-3 font-medium text-gray-700" style={{ fontFamily: 'Poppins' }}>
                  {opcao.nome}
                </span>
              </label>
            ))}
          </div>

          {error && <p className="text-red-500 text-center mb-4" style={{ fontFamily: 'Poppins' }}>{error}</p>}
          {success && <p className="text-green-600 font-bold text-center mb-4" style={{ fontFamily: 'Poppins' }}>{success}</p>}

          <button
            onClick={handleSubmit}
            disabled={loading || !selected}
            className="w-full bg-blue-900 hover:bg-blue-950 text-white font-bold py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ fontFamily: 'Poppins' }}
          >
            {loading ? 'Salvando...' : 'Salvar'}
          </button>

        </div>
      </div>
    </div>
  );
}