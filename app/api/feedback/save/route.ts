import { query } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { opcao_id } = body;

    if (!opcao_id) {
      return NextResponse.json({ error: 'Selecione uma opção' }, { status: 400 });
    }

    await query(
      'INSERT INTO registros (opcao_id, created_at) VALUES ($1, NOW())',
      [opcao_id]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao salvar feedback:', error);
    return NextResponse.json({ error: 'Erro ao salvar' }, { status: 500 });
  }
}