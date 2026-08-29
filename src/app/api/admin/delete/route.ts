import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';

export async function POST(req: Request) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'Registrant ID is required' }, { status: 400 });
    }

    // Delete related payments first to avoid foreign key constraints
    await prisma.payment.deleteMany({
      where: { registrantId: id }
    });

    // Delete the registrant
    await prisma.registrant.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting record:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
