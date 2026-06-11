import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, senha, confirma_senha, nome, loja } = body;

    // Validações
    if (!email || !senha || !confirma_senha || !nome || !loja) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      );
    }

    if (senha !== confirma_senha) {
      return NextResponse.json(
        { error: 'Senhas não conferem' },
        { status: 400 }
      );
    }

    // Verifica se email já existe
    const existing = await query('SELECT id FROM usuarios WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return NextResponse.json(
        { error: 'Email já cadastrado' },
        { status: 400 }
      );
    }

    // Hash da senha
    const senhaHash = await bcrypt.hash(senha, 10);

    // Insere usuário
    const result = await query(
      'INSERT INTO usuarios (email, senha, nome, loja) VALUES ($1, $2, $3, $4) RETURNING id',
      [email, senhaHash, nome, loja]
    );

    const userId = result.rows[0].id;

    // Log
    await query(
      'INSERT INTO system_logs (usuario_id, acao) VALUES ($1, $2)',
      [userId, 'Registro de novo usuário']
    );

    return NextResponse.json({
      success: true,
      message: 'Usuário criado com sucesso!'
    });
  } catch (error) {
    console.error('Erro no registro:', error);
    return NextResponse.json(
      { error: 'Erro ao registrar usuário' },
      { status: 500 }
    );
  }
}