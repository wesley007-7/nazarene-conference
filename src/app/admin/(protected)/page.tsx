import { prisma } from '@/lib/prisma';
import AdminTable from './AdminTable';

// Tell Next.js not to statically cache this page
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminDashboard() {
  const registrants = await prisma.registrant.findMany({
    orderBy: { createdAt: 'desc' }
  });

  const totalConfirmed = registrants.filter(r => r.status === 'CONFIRMED' || r.status === 'FULLY_PAID');
  
  const totalCollected = registrants.reduce((sum, r) => {
    if (r.status === 'PENDING') return sum; // Not officially paid yet
    const originalTotal = r.registrationType === 'Full Board' ? 5850 : 3100;
    const amountPaidSoFar = originalTotal - r.balanceAmount;
    return sum + amountPaidSoFar;
  }, 0);

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">Total Registrants</h3>
          <p className="text-3xl font-bold">{registrants.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">Confirmed (500 Paid)</h3>
          <p className="text-3xl font-bold text-green-600">{totalConfirmed.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">Total Collected (KSh)</h3>
          <p className="text-3xl font-bold text-green-600">{totalCollected.toLocaleString()}</p>
        </div>
      </div>

      <AdminTable initialRegistrants={registrants} />
    </div>
  );
}
