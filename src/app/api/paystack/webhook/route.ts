import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { sendSMS } from '@/lib/sms';

export async function POST(req: Request) {
  try {
    const text = await req.text();
    const signature = req.headers.get('x-paystack-signature');

    // Verify signature
    if (process.env.PAYSTACK_SECRET_KEY && signature) {
        const hash = crypto.createHmac('sha512', process.env.PAYSTACK_SECRET_KEY).update(text).digest('hex');
        if (hash !== signature) {
            return NextResponse.json({ message: 'Invalid signature' }, { status: 400 });
        }
    }

    const event = JSON.parse(text);

    if (event.event === 'charge.success') {
      const { reference, amount, metadata } = event.data;
      const purpose = metadata?.purpose;
      const registrantId = metadata?.registrantId;

      if (!registrantId) {
        return NextResponse.json({ message: 'Missing metadata' }, { status: 400 });
      }

      // Update payment if it exists
      await prisma.payment.updateMany({
        where: { reference },
        data: { status: 'success' }
      });

      // Update registrant
      const registrant = await prisma.registrant.findUnique({
        where: { id: registrantId }
      });

      if (!registrant) {
        return NextResponse.json({ message: 'Registrant not found' }, { status: 404 });
      }

      const settings = await prisma.settings.findUnique({ where: { id: 1 } });
      const adminPhones = [settings?.treasurerPhone, settings?.secretaryPhone].filter(Boolean) as string[];

      if (purpose === 'confirmation') {
        await prisma.registrant.update({
          where: { id: registrantId },
          data: { confirmationPaid: true }
        });

        // Send SMS for confirmation
        const userMsg = `Dear ${registrant.fullName}, your KSh 500 confirmation fee has been received. Your spot for Church of the Nazarene Men's Conference is secured. Balance remaining: KSh ${registrant.balanceAmount}. Thank you!`;
        await sendSMS([registrant.phoneNumber], userMsg);

        const adminMsg = `New registration: ${registrant.fullName} (${registrant.district}) paid KSh 500 confirmation fee. Package: ${registrant.registrationType}. Balance: KSh ${registrant.balanceAmount}.`;
        if (adminPhones.length > 0) await sendSMS(adminPhones, adminMsg);

      } else if (purpose === 'balance') {
        await prisma.registrant.update({
          where: { id: registrantId },
          data: { balancePaid: true }
        });

        const amountPaid = amount / 100;

        // Send SMS for balance
        const userMsg = `Dear ${registrant.fullName}, your balance of KSh ${amountPaid} has been received. Your registration for Church of the Nazarene Men's Conference is now fully paid. See you there!`;
        await sendSMS([registrant.phoneNumber], userMsg);

        const adminMsg = `${registrant.fullName} (${registrant.district}) has completed payment. Balance of KSh ${amountPaid} paid. Registration status: Fully Paid.`;
        if (adminPhones.length > 0) await sendSMS(adminPhones, adminMsg);
      }
    }

    return NextResponse.json({ message: 'Success' });
  } catch (error) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

