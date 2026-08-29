import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { registrantId, amount } = await req.json();

    const registrant = await prisma.registrant.findUnique({
      where: { id: registrantId }
    });

    if (!registrant) {
      return NextResponse.json({ error: 'Registrant not found' }, { status: 404 });
    }

    if (registrant.balancePaid) {
      return NextResponse.json({ error: 'Balance already paid' }, { status: 400 });
    }

    const paystackAmount = amount * 100;
    const dummyEmail = `${registrant.phoneNumber.replace('+', '')}@nazarenemensconference.org`;
    
    const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: dummyEmail,
        amount: paystackAmount,
        callback_url: `${process.env.NEXTAUTH_URL}/status/${registrant.id}`,
        metadata: {
          registrantId: registrant.id,
          purpose: 'balance'
        }
      })
    });

    const paystackData = await paystackResponse.json();

    if (!paystackData.status) {
      console.error('Paystack initialization failed:', paystackData);
      return NextResponse.json({ error: 'Payment initialization failed' }, { status: 500 });
    }

    await prisma.payment.create({
      data: {
        amount: amount,
        purpose: 'balance',
        status: 'pending',
        reference: paystackData.data.reference,
        registrantId: registrant.id
      }
    });

    return NextResponse.json({ 
      authorizationUrl: paystackData.data.authorization_url
    });

  } catch (error) {
    console.error('Balance init error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

