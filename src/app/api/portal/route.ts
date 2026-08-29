import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get('phone');

    if (!phone) {
      return NextResponse.json({ message: 'Phone number is required' }, { status: 400 });
    }

    // Format phone number to match how it's saved in the DB
    let formattedPhone = phone.trim();
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '+254' + formattedPhone.substring(1);
    } else if (formattedPhone.startsWith('254')) {
      formattedPhone = '+' + formattedPhone;
    } else if (!formattedPhone.startsWith('+')) {
      formattedPhone = '+254' + formattedPhone;
    }

    const registrant = await prisma.registrant.findFirst({
      where: { phoneNumber: formattedPhone },
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

