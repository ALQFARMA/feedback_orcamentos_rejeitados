import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

export async function verifyAuth(req: NextRequest) {
  try {
    const token = req.cookies.get('auth_token')?.value;

    if (!token) {
      return null;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    return {
      userId: decoded.userId,
      email: decoded.email,
      isAdmin: decoded.isAdmin
    };
  } catch (error) {
    return null;
  }
}