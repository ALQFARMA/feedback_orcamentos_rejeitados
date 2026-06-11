import { query } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const result = await query('SELECT id, nome FROM opcoes ORDER BY id');

    return NextResponse.json({
      success: true,
      opcoes: result.rows
    });
  } catch (error) {
    console.error('Erro ao listar opções:', error);
    return NextResponse.json(
      { error: 'Erro ao listar opções' },
      { status: 500 }
    );
  }
}