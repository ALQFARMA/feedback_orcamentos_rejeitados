import { verifyAuth } from '@/lib/auth';
import { query } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAuth(req);
    if (!auth || !auth.isAdmin) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const inicio = searchParams.get('inicio') || '2000-01-01';
    const fim = searchParams.get('fim') || '2099-12-31';

    const result = await query(`
      SELECT sl.id, u.nome, sl.acao, sl.created_at
      FROM system_logs sl
      LEFT JOIN usuarios u ON sl.usuario_id = u.id
      WHERE sl.created_at >= $1 AND sl.created_at <= $2::date + interval '1 day'
      ORDER BY sl.created_at DESC
      LIMIT 100
    `, [inicio, fim]);

    return NextResponse.json({ success: true, logs: result.rows });
  } catch (error) {
    console.error('Erro ao buscar logs:', error);
    return NextResponse.json({ error: 'Erro ao buscar logs' }, { status: 500 });
  }
}