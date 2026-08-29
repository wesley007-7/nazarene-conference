import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import PayBalanceButton from './PayBalanceButton';

export default async function StatusPage({ params }: { params: { id: string } }) {
  const registrant = await prisma.registrant.findUnique({
    where: { id: params.id }
  });

  if (!registrant) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex justify-center">
      <div className="max-w-xl w-full bg-white rounded-xl shadow-md overflow-hidden p-8">
        <h1 className="text-2xl font-bold text-gray-800 border-b pb-4 mb-4">Registration Status</h1>
        
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-500">Name</p>
            <p className="font-medium">{registrant.fullName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Package</p>
            <p className="font-medium">{registrant.registrationType}</p>
          </div>
          
          <div className="pt-4 border-t">
            <h3 className="font-semibold text-gray-700 mb-2">Payment Status</h3>
            
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">Confirmation Fee (KSh 500)</span>
              {registrant.confirmationPaid ? (
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Paid</span>
              ) : (
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">Pending</span>
              )}
            </div>

            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">Balance (KSh {registrant.balanceAmount})</span>
              {registrant.balancePaid ? (
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Paid</span>
              ) : (
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">Pending</span>
              )}
            </div>
            
            {registrant.extraTShirt && (
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Extra T-Shirt (KSh 700)</span>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Pay On-Site</span>
              </div>
            )}
          </div>
        </div>

        {registrant.confirmationPaid && !registrant.balancePaid && (
          <div className="mt-8">
            <PayBalanceButton registrantId={registrant.id} amount={registrant.balanceAmount} />
          </div>
        )}
      </div>
    </main>
  );
}

