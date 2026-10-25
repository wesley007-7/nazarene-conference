import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getPhoneVariants } from '@/lib/phone';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get('phone');

    if (!phone) {
      return NextResponse.json({ message: 'Phone number is required' }, { status: 400 });
    }

    const variants = getPhoneVariants(phone);

    const registrant = await prisma.registrant.findFirst({
      where: {
        phoneNumber: { in: variants }
      },
      orderBy: { createdAt: 'desc' }
    });

    if (!registrant) {
      return NextResponse.json({ message: 'No registration found for this phone number.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, registrant });

  } catch (error) {
    console.error('Portal Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
