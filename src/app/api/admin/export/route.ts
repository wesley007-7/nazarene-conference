import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';

export async function GET() {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const registrants = await prisma.registrant.findMany({
    orderBy: { createdAt: 'desc' }
  });

  const headers = [
    'Name',
    'Phone',
    'District',
    'Local Church',
    'Package',
    'Conf Paid',
    'Balance Paid',
    'Balance Amount',
    'T-Shirt',
    'Extra T-Shirt',
    'Extra Size',
    'Registered At'
  ];

  const rows = registrants.map(r => [
    `"${r.fullName}"`,
    `"${r.phoneNumber}"`,
    `"${r.district}"`,
    `"${r.localChurch}"`,
    `"${r.registrationType}"`,
    r.confirmationPaid ? 'Yes' : 'No',
    r.balancePaid ? 'Yes' : 'No',
    r.balanceAmount,
    r.tShirtSize,
    r.extraTShirt ? 'Yes' : 'No',
    r.extraTShirtSize || '',
    r.createdAt.toISOString()
  ]);

  const csv = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="registrants.csv"',
    },
  });
}

