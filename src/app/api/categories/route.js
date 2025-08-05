import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const categorias = await prisma.categorias.findMany();
    return NextResponse.json(categorias);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}