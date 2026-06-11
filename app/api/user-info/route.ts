import { verifyAuth } from '@/lib/auth';
import { query } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAuth(req);
    if (!auth) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const result = await query(
      'SELECT nome FROM usuarios WHERE id = $1',
      [auth.userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      nome: result.rows[0].nome
    });
  } catch (error) {
    console.error('Erro ao buscar info do usuário:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar informações' },
      { status: 500 }
    );
  }
}