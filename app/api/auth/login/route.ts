import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, senha } = body;

    if (!email || !senha) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    // Busca usuário
    const result = await query(
      'SELECT id, senha, é_admin FROM usuarios WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Email ou senha incorretos' },
        { status: 400 }
      );
    }

    const user = result.rows[0];

    // Verifica senha
    const senhaValida = await bcrypt.compare(senha, user.senha);
    if (!senhaValida) {
      return NextResponse.json(
        { error: 'Email ou senha incorretos' },
        { status: 400 }
      );
    }

    // Cria JWT token
    const token = jwt.sign(
      { userId: user.id, isAdmin: user.é_admin },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    // Log
    await query(
      'INSERT INTO system_logs (usuario_id, acao) VALUES ($1, $2)',
      [user.id, 'Login realizado']
    );

    const response = NextResponse.json({
      success: true,
      token,
      userId: user.id,
      isAdmin: user.é_admin
    });

    // Salva token em cookie (seguro)
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 // 7 dias
    });

    return response;
  } catch (error) {
    console.error('Erro no login:', error);
    return NextResponse.json(
      { error: 'Erro ao fazer login' },
      { status: 500 }
    );
  }
}