'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface Stat {
  nome: string;
  total: number;
}

interface UserStat {
  nome: string;
  loja: string;
  total: number;
}

interface LojaStat {
  loja: string;
  total: number;
}

interface Log {
  id: number;
  nome: string;
  acao: string;
  created_at: string;
}

const MESES_NOMES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

function getMeses() {
  const meses = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = `${MESES_NOMES[d.getMonth()]}/${String(d.getFullYear()).slice(2)}`;
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    meses.push({ label, value });
  }
  return meses;
}

function exportCSV(data: any[], filename: string) {
  if (!data.length) return;
  const headers = Object.keys(data[0]).join(',');
  const rows = data.map(row => Object.values(row).join(','));
  const csv = [headers, ...rows].join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Admin() {
  const router = useRouter();
  const meses = getMeses();
  const mesAtual = meses[meses.length - 1].value;
  const mesAnterior = meses[meses.length - 2].value;

  const [stats, setStats] = useState<Stat[]>([]);
  const [userStats, setUserStats] = useState<UserStat[]>([]);
  const [lojaStats, setLojaStats] = useState<LojaStat[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [tab, setTab] = useState<'opcoes' | 'usuarios' | 'lojas' | 'logs'>('opcoes');
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState('');
  const [periodoInicio, setPeriodoInicio] = useState(mesAtual);
  const [periodoFim, setPeriodoFim] = useState(mesAtual);

  useEffect(() => {
    loadUserName();
  }, []);

  useEffect(() => {
    loadAll();
  }, [periodoInicio, periodoFim]);

  const loadUserName = async () => {
    try {
      const res = await fetch('/api/auth/user-info');
      const data = await res.json();
      if (data.success) setUserName(data.nome);
    } catch (err) {
      console.error('Erro ao carregar nome:', err);
    }
  };

  const buildQuery = () => {
    const inicio = `${periodoInicio}-01`;
    const [ano, mes] = periodoFim.split('-');
    const ultimoDia = new Date(Number(ano), Number(mes), 0).getDate();
    const fim = `${periodoFim}-${ultimoDia}`;
    return `?inicio=${inicio}&fim=${fim}`;
  };

  const loadAll = () => {
    loadStats();
    loadUserStats();
    loadLojaStats();
    loadLogs();
  };

  const loadStats = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/stats${buildQuery()}`);
      const data = await res.json();
      if (data.success) setStats(data.stats);
    } catch (err) {
      console.error('Erro ao carregar stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadUserStats = async () => {
    try {
      const res = await fetch(`/api/admin/user-stats${buildQuery()}`);
      const data = await res.json();
      if (data.success) setUserStats(data.stats);
    } catch (err) {
      console.error('Erro ao carregar user stats:', err);
    }
  };

  const loadLojaStats = async () => {
    try {
      const res = await fetch(`/api/admin/loja-stats${buildQuery()}`);
      const data = await res.json();
      if (data.success) setLojaStats(data.stats);
    } catch (err) {
      console.error('Erro ao carregar loja stats:', err);
    }
  };

  const loadLogs = async () => {
    try {
      const res = await fetch(`/api/admin/logs${buildQuery()}`);
      const data = await res.json();
      if (data.success) setLogs(data.logs);
    } catch (err) {
      console.error('Erro ao carregar logs:', err);
    }
  };

  const handleUltimoMes = () => {
    setPeriodoInicio(mesAnterior);
    setPeriodoFim(mesAnterior);
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  const chartOpcoes = {
    labels: stats.map(s => s.nome.length > 25 ? s.nome.substring(0, 25) + '...' : s.nome),
    datasets: [{
      label: 'Total de Feedback',
      data: stats.map(s => Number(s.total)),
      backgroundColor: ['#2E3F6E', '#475569', '#64748B', '#94A3B8', '#CBD5E1', '#E2E8F0'],
      borderColor: '#fff',
      borderWidth: 2,
    }],
  };

  const chartUsuarios = {
    labels: userStats.map(u => `${u.nome} (${u.loja})`),
    datasets: [{
      label: 'Feedback por Atendente',
      data: userStats.map(u => Number(u.total)),
      backgroundColor: '#2E3F6E',
      borderColor: '#fff',
      borderWidth: 2,
    }],
  };

  const chartLojas = {
    labels: lojaStats.map(l => l.loja || 'Sem loja'),
    datasets: [{
      label: 'Total por Loja',
      data: lojaStats.map(l => Number(l.total)),
      backgroundColor: ['#2E3F6E', '#475569', '#64748B'],
      borderColor: '#fff',
      borderWidth: 2,
    }],
  };

  const SelectMes = ({ value, onChange }: { value: string, onChange: (v: string) => void }) => (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="bg-white border border-slate-300 rounded-full px-4 py-1.5 text-sm font-medium text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-900 cursor-pointer"
      style={{ fontFamily: 'Poppins' }}
    >
      {meses.map(m => (
        <option key={m.value} value={m.value}>{m.label}</option>
      ))}
    </select>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8 border-t-4 border-blue-900">

          {/* HEADER */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
              <Image src="/images/logo.png" alt="Logo" width={80} height={80} className="rounded-lg" />
              {userName && (
                <div>
                  <p className="text-gray-500 text-sm" style={{ fontFamily: 'Poppins' }}>Bem-vindo(a),</p>
                  <p className="text-xl font-bold text-blue-900" style={{ fontFamily: 'Poppins' }}>{userName}</p>
                </div>
              )}
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
              style={{ fontFamily: 'Poppins' }}
            >
              Sair
            </button>
          </div>

          <h1 className="text-3xl font-bold text-blue-900 mb-6" style={{ fontFamily: 'Poppins' }}>
            Painel Administrativo
          </h1>

          {/* FILTRO */}
          <div className="flex flex-wrap items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mb-8">
            <span className="text-xs font-bold text-slate-500 tracking-widest uppercase" style={{ fontFamily: 'Poppins' }}>
              Período:
            </span>
            <SelectMes value={periodoInicio} onChange={setPeriodoInicio} />
            <span className="text-slate-400 text-sm">até</span>
            <SelectMes value={periodoFim} onChange={setPeriodoFim} />
            <button
              onClick={handleUltimoMes}
              className="bg-blue-900 hover:bg-blue-950 text-white text-xs font-bold px-4 py-1.5 rounded-full tracking-wider uppercase"
              style={{ fontFamily: 'Poppins' }}
            >
              Último Mês
            </button>
          </div>

          {/* ABAS */}
          <div className="flex gap-2 mb-8 border-b-2 border-gray-200 overflow-x-auto">
            {([
              { key: 'opcoes', label: 'Feedback por Motivo' },
              { key: 'usuarios', label: 'Feedback por Atendente' },
              { key: 'lojas', label: 'Feedback por Loja' },
              { key: 'logs', label: 'Logs' },
            ] as const).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`px-4 py-2 font-bold whitespace-nowrap ${tab === key ? 'text-blue-900 border-b-4 border-blue-900' : 'text-gray-600'}`}
                style={{ fontFamily: 'Poppins' }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* FEEDBACK POR MOTIVO */}
          {tab === 'opcoes' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-blue-900" style={{ fontFamily: 'Poppins' }}>Motivos de Rejeição</h2>
                <div className="flex gap-2">
                  <button onClick={() => exportCSV(stats, 'motivos.csv')} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm" style={{ fontFamily: 'Poppins' }}>
                    Exportar CSV
                  </button>
                  <button onClick={loadStats} disabled={loading} className="bg-blue-900 hover:bg-blue-950 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50" style={{ fontFamily: 'Poppins' }}>
                    {loading ? 'Carregando...' : 'Atualizar'}
                  </button>
                </div>
              </div>
              {stats.length > 0 ? (
                <div className="mb-8">
                  <Bar data={chartOpcoes} options={{ responsive: true, indexAxis: 'y' as const }} />
                </div>
              ) : (
                <p className="text-gray-500 mb-6" style={{ fontFamily: 'Poppins' }}>Nenhum dado disponível</p>
              )}
              <table className="w-full mt-6 border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="text-left p-3 border-b" style={{ fontFamily: 'Poppins' }}>Motivo</th>
                    <th className="text-left p-3 border-b" style={{ fontFamily: 'Poppins' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.map((stat) => (
                    <tr key={stat.nome} className="hover:bg-gray-50">
                      <td className="p-3 border-b" style={{ fontFamily: 'Poppins' }}>{stat.nome}</td>
                      <td className="p-3 border-b font-bold" style={{ fontFamily: 'Poppins' }}>{stat.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* FEEDBACK POR ATENDENTE */}
          {tab === 'usuarios' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-blue-900" style={{ fontFamily: 'Poppins' }}>Feedback por Atendente</h2>
                <div className="flex gap-2">
                  <button onClick={() => exportCSV(userStats, 'atendentes.csv')} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm" style={{ fontFamily: 'Poppins' }}>
                    Exportar CSV
                  </button>
                  <button onClick={loadUserStats} className="bg-blue-900 hover:bg-blue-950 text-white px-4 py-2 rounded-lg text-sm" style={{ fontFamily: 'Poppins' }}>
                    Atualizar
                  </button>
                </div>
              </div>
              {userStats.filter(u => u.nome).length > 0 ? (
                <div className="mb-8">
                  <Bar data={chartUsuarios} options={{ responsive: true }} />
                </div>
              ) : (
                <p className="text-gray-500 mb-6" style={{ fontFamily: 'Poppins' }}>Nenhum dado disponível</p>
              )}
              <table className="w-full mt-6 border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="text-left p-3 border-b" style={{ fontFamily: 'Poppins' }}>Atendente</th>
                    <th className="text-left p-3 border-b" style={{ fontFamily: 'Poppins' }}>Loja</th>
                    <th className="text-left p-3 border-b" style={{ fontFamily: 'Poppins' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {userStats.filter(u => u.nome).map((user) => (
                    <tr key={`${user.nome}-${user.loja}`} className="hover:bg-gray-50">
                      <td className="p-3 border-b" style={{ fontFamily: 'Poppins' }}>{user.nome}</td>
                      <td className="p-3 border-b" style={{ fontFamily: 'Poppins' }}>{user.loja}</td>
                      <td className="p-3 border-b font-bold" style={{ fontFamily: 'Poppins' }}>{user.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* FEEDBACK POR LOJA */}
          {tab === 'lojas' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-blue-900" style={{ fontFamily: 'Poppins' }}>Feedback por Loja</h2>
                <div className="flex gap-2">
                  <button onClick={() => exportCSV(lojaStats, 'lojas.csv')} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm" style={{ fontFamily: 'Poppins' }}>
                    Exportar CSV
                  </button>
                  <button onClick={loadLojaStats} className="bg-blue-900 hover:bg-blue-950 text-white px-4 py-2 rounded-lg text-sm" style={{ fontFamily: 'Poppins' }}>
                    Atualizar
                  </button>
                </div>
              </div>
              {lojaStats.filter(l => l.loja).length > 0 ? (
                <div className="mb-8">
                  <Bar data={chartLojas} options={{ responsive: true }} />
                </div>
              ) : (
                <p className="text-gray-500 mb-6" style={{ fontFamily: 'Poppins' }}>Nenhum dado disponível</p>
              )}
              <table className="w-full mt-6 border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="text-left p-3 border-b" style={{ fontFamily: 'Poppins' }}>Loja</th>
                    <th className="text-left p-3 border-b" style={{ fontFamily: 'Poppins' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {lojaStats.filter(l => l.loja).map((loja) => (
                    <tr key={loja.loja} className="hover:bg-gray-50">
                      <td className="p-3 border-b" style={{ fontFamily: 'Poppins' }}>{loja.loja}</td>
                      <td className="p-3 border-b font-bold" style={{ fontFamily: 'Poppins' }}>{loja.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* LOGS */}
          {tab === 'logs' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-blue-900" style={{ fontFamily: 'Poppins' }}>Logs do Sistema</h2>
                <div className="flex gap-2">
                  <button onClick={() => exportCSV(logs, 'logs.csv')} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm" style={{ fontFamily: 'Poppins' }}>
                    Exportar CSV
                  </button>
                  <button onClick={loadLogs} className="bg-blue-900 hover:bg-blue-950 text-white px-4 py-2 rounded-lg text-sm" style={{ fontFamily: 'Poppins' }}>
                    Atualizar
                  </button>
                </div>
              </div>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="text-left p-3 border-b" style={{ fontFamily: 'Poppins' }}>Data/Hora</th>
                    <th className="text-left p-3 border-b" style={{ fontFamily: 'Poppins' }}>Usuário</th>
                    <th className="text-left p-3 border-b" style={{ fontFamily: 'Poppins' }}>Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="p-3 border-b text-sm" style={{ fontFamily: 'Poppins' }}>
                        {new Date(log.created_at).toLocaleString('pt-BR')}
                      </td>
                      <td className="p-3 border-b" style={{ fontFamily: 'Poppins' }}>{log.nome || 'Sistema'}</td>
                      <td className="p-3 border-b" style={{ fontFamily: 'Poppins' }}>{log.acao}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}