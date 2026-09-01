import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    // Package amount (500 KES confirmation fee is standalone and not deducted from this)
    const packageAmount = data.registrationType === 'Full Board' ? 5350 : 2600;
    
    const registrant = await prisma.registrant.create({
      data: {
        fullName: data.fullName,
        district: data.district,
        localChurch: data.localChurch,
        phoneNumber: data.phoneNumber,
        registrationType: data.registrationType,
        tShirtSize: data.tShirtSize,
        extraTShirt: data.extraTShirt,
        extraTShirtSize: data.extraTShirtSize || null,
        balanceAmount: packageAmount,
        status: "PENDING"
      }
    });

    return NextResponse.json({ 
      success: true,
      registrantId: registrant.id 
    });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
