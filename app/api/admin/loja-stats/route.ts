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
        u.loja,
        COUNT(r.id) as total
      FROM usuarios u
      LEFT JOIN registros r ON u.id = r.usuario_id
      WHERE u.é_admin = false
      GROUP BY u.loja
      ORDER BY u.loja
    `);

    return NextResponse.json({
      success: true,
      dados: result.rows
    });
  } catch (error) {
    console.error('Erro ao buscar loja stats:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar estatísticas' },
      { status: 500 }
    );
  }
}