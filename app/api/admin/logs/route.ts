import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAuth(req);
    if (!auth || !auth.é_admin) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const result = await query(`
      SELECT 
        l.id,
        u.email,
        l.acao,
        l.detalhes,
        l.created_at
      FROM system_logs l
      LEFT JOIN usuarios u ON l.usuario_id = u.id
      ORDER BY l.created_at DESC
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