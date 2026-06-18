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
      SELECT o.nome, COUNT(r.id) as total
      FROM opcoes o
      LEFT JOIN registros r ON o.id = r.opcao_id
        AND r.created_at >= $1 AND r.created_at <= $2::date + interval '1 day'
      GROUP BY o.id, o.nome
      ORDER BY total DESC
    `, [inicio, fim]);

    return NextResponse.json({ success: true, stats: result.rows });
  } catch (error) {
    console.error('Erro ao buscar stats:', error);
    return NextResponse.json({ error: 'Erro ao buscar estatísticas' }, { status: 500 });
  }
}