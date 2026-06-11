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
      SELECT u.loja, COUNT(r.id) as total
      FROM usuarios u
      LEFT JOIN registros r ON u.id = r.usuario_id
      WHERE u.é_admin = false
      GROUP BY u.loja
      ORDER BY total DESC
    `);

    return NextResponse.json({
      success: true,
      stats: result.rows
    });
  } catch (error) {
    console.error('Erro ao buscar loja stats:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar estatísticas' },
      { status: 500 }
    );
  }
}