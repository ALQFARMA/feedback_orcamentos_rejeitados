import { verifyAuth } from '@/lib/auth';
import { query } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAuth(req);
    if (!auth || !auth.isAdmin) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const result = await query(`
      SELECT o.nome, COUNT(r.id) as total
      FROM opcoes o
      LEFT JOIN registros r ON o.id = r.opcao_id
      GROUP BY o.id, o.nome
      ORDER BY total DESC
    `);

    return NextResponse.json({
      success: true,
      stats: result.rows
    });
  } catch (error) {
    console.error('Erro ao buscar stats:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar estatísticas' },
      { status: 500 }
    );
  }
}