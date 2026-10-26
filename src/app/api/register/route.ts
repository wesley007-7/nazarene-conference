import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { normalizePhone, getPhoneVariants } from '@/lib/phone';
import { areSameTwoNames } from '@/lib/names';

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

    // 1. Check if phone number is already registered
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let existing: any = await prisma.registrant.findFirst({
      where: {
        phoneNumber: { in: variants }
      },
      orderBy: { createdAt: 'desc' }
    });

    let matchedReason: 'phone' | 'name' = 'phone';

    // 2. If not matched by phone, check if someone with the same two names is already registered
    if (!existing) {
      const allRegistrants = await prisma.registrant.findMany({
        select: {
          id: true,
          fullName: true,
          district: true,
          localChurch: true,
          phoneNumber: true,
          registrationType: true,
          status: true,
          balanceAmount: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' }
      });

      const nameMatch = allRegistrants.find(r => areSameTwoNames(data.fullName, r.fullName));
      if (nameMatch) {
        existing = nameMatch;
        matchedReason = 'name';
      }
    }

    if (existing) {
      const isConfirmedOrPaid = existing.status === 'CONFIRMED' || existing.status === 'FULLY_PAID';

      const errorText = matchedReason === 'name'
        ? `A participant with this name is already registered (${existing.fullName} - ${existing.phoneNumber}).`
        : `This phone number is already registered under ${existing.fullName} (${existing.status}).`;

      return NextResponse.json({
        success: false,
        alreadyRegistered: true,
        matchedReason,
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
        error: errorText
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
