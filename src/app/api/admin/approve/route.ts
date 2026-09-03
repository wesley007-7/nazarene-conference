import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendSMS } from '@/lib/sms';

export async function POST(req: Request) {
  try {
    const { id, type, amount } = await req.json();

    if (!id || !type) {
      return NextResponse.json({ message: 'Missing registrant ID or approval type' }, { status: 400 });
    }

    const registrant = await prisma.registrant.findUnique({ where: { id } });
    if (!registrant) {
      return NextResponse.json({ message: 'Registrant not found' }, { status: 404 });
    }

    let attendeeMsg = '';

    if (type === 'confirmation') {
      await prisma.registrant.update({
        where: { id },
        data: { status: 'CONFIRMED' }
      });
      attendeeMsg = `Hi ${registrant.fullName}, your confirmation fee of KES 500 has been received. Your balance is KES ${registrant.balanceAmount.toLocaleString()}. Your registration is confirmed!`;
    } else if (type === 'installment') {
      const parsedAmount = parseInt(amount, 10);
      
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        return NextResponse.json({ message: 'Invalid installment amount' }, { status: 400 });
      }

      const newBalance = registrant.balanceAmount - parsedAmount;
      const isFullyPaid = newBalance <= 0;
      const safeBalance = Math.max(0, newBalance);

      await prisma.registrant.update({
        where: { id },
        data: { 
          status: isFullyPaid ? 'FULLY_PAID' : 'CONFIRMED',
          balanceAmount: safeBalance 
        }
      });
      
      attendeeMsg = `Hi ${registrant.fullName}, we received your installment of KES ${parsedAmount.toLocaleString()}. ${isFullyPaid ? 'You are fully paid for the conference!' : `Your new balance is KES ${safeBalance.toLocaleString()}.`}`;
    } else {
      return NextResponse.json({ message: 'Invalid approval type' }, { status: 400 });
    }

    // Send to attendee
    await sendSMS([registrant.phoneNumber], attendeeMsg);

    return NextResponse.json({ success: true, message: 'Approved and SMS sent.' });

  } catch (error) {
    console.error('Approval Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

