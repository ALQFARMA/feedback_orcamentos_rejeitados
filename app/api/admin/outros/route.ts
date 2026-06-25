import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAuth(req);
    if (!auth?.isAdmin) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const inicio = searchParams.get('inicio') || '2026-06-01';
    const fim = searchParams.get('fim') || '2026-06-30';

    const result = await query(
      `SELECT id, outro_texto, created_at 
       FROM registros 
       WHERE outro_texto IS NOT NULL 
       AND created_at >= $1 AND created_at <= $2
       ORDER BY created_at DESC`,
      [inicio, fim + ' 23:59:59']
    );

    return NextResponse.json({ success: true, outros: result.rows });
  } catch (error) {
    console.error('Erro ao buscar outros:', error);
    return NextResponse.json({ error: 'Erro ao buscar dados' }, { status: 500 });
  }
}