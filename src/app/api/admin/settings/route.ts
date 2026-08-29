import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';

export async function POST(req: Request) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { treasurerPhone, secretaryPhone } = await req.json();

  const settings = await prisma.settings.upsert({
    where: { id: 1 },
    update: { treasurerPhone, secretaryPhone },
    create: { id: 1, treasurerPhone, secretaryPhone }
  });

  return NextResponse.json(settings);
}

