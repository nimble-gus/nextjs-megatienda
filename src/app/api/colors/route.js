import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { executeWithRetry } from '@/lib/db-utils';

export async function GET() {
  try {
    const colores = await executeWithRetry(async () => {
      return await prisma.colores.findMany();
    });
    return NextResponse.json(colores);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
