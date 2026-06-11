import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const auth = await verifyAuth(req);
    if (!auth) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await req.json();
    const { opcao_id } = body;

    if (!opcao_id) {
      return NextResponse.json(
        { error: 'Opção não selecionada' },
        { status: 400 }
      );
    }

    // Insere registro
    await query(
      'INSERT INTO registros (usuario_id, opcao_id) VALUES ($1, $2)',
      [auth.userId, opcao_id]
    );

    // Log
    await query(
      'INSERT INTO system_logs (usuario_id, acao) VALUES ($1, $2)',
      [auth.userId, `Selecionou opção ID: ${opcao_id}`]
    );

    return NextResponse.json({
      success: true,
      message: 'Opção registrada!'
    });
  } catch (error) {
    console.error('Erro ao salvar opção:', error);
    return NextResponse.json(
      { error: 'Erro ao registrar' },
      { status: 500 }
    );
  }
}