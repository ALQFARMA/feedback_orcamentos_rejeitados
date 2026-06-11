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
      SELECT sl.id, u.nome, u.loja, sl.acao, sl.detalhes, sl.created_at
      FROM system_logs sl
      LEFT JOIN usuarios u ON sl.usuario_id = u.id
      ORDER BY sl.created_at DESC
      LIMIT 100
    `);

    return NextResponse.json({
      success: true,
      logs: result.rows
    });
  } catch (error) {
    console.error('Erro ao buscar logs:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar logs' },
      { status: 500 }
    );
  }
}