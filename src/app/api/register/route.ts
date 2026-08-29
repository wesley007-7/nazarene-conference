import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    // Total amount depends on the package (Extra T-Shirts are paid on site)
    const totalAmount = data.registrationType === 'Full Board' ? 5850 : 3100;
    
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
        balanceAmount: totalAmount - 500,
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
