import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { normalizePhone, getPhoneVariants } from '@/lib/phone';

export async function POST(req: Request) {
  try {
    const data = await req.json();

    if (!data.phoneNumber || !data.fullName) {
      return NextResponse.json({ success: false, error: 'Full name and phone number are required.' }, { status: 400 });
    }

    const normalizedPhone = normalizePhone(data.phoneNumber);
    const variants = getPhoneVariants(data.phoneNumber);

    // Package amount (500 KES confirmation fee is standalone and not deducted from this)
    const packageAmount = data.registrationType === 'Full Board' ? 5350 : 2600;

    // Check if phone number is already registered
    const existing = await prisma.registrant.findFirst({
      where: {
        phoneNumber: { in: variants }
      },
      orderBy: { createdAt: 'desc' }
    });

    if (existing) {
      const isConfirmedOrPaid = existing.status === 'CONFIRMED' || existing.status === 'FULLY_PAID';

      return NextResponse.json({
        success: false,
        alreadyRegistered: true,
        registrant: {
          id: existing.id,
          fullName: existing.fullName,
          district: existing.district,
          localChurch: existing.localChurch,
          phoneNumber: existing.phoneNumber,
          registrationType: existing.registrationType,
          status: existing.status,
          balanceAmount: existing.balanceAmount,
        },
        message: isConfirmedOrPaid
          ? (existing.status === 'FULLY_PAID'
              ? `You are already registered and your conference fee is fully paid!`
              : `You are already registered! Your spot is confirmed and your remaining balance is KSh ${existing.balanceAmount.toLocaleString()}.`)
          : `You already submitted a registration. It is currently awaiting verification of the 500 KES confirmation fee.`,
        error: `This phone number is already registered under ${existing.fullName} (${existing.status}).`
      }, { status: 409 });
    }

    // Create new record with standardized phone number
    const registrant = await prisma.registrant.create({
      data: {
        fullName: data.fullName.trim(),
        district: data.district,
        localChurch: data.localChurch,
        phoneNumber: normalizedPhone,
        registrationType: data.registrationType,
        tShirtSize: data.tShirtSize,
        extraTShirt: Boolean(data.extraTShirt),
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
