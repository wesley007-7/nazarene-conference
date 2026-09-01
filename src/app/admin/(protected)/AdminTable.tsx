"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function AdminTable({ initialRegistrants }: { initialRegistrants: any[] }) {
  const [filter, setFilter] = useState("ALL");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    district: '',
    localChurch: '',
    phoneNumber: '',
    registrationType: 'Full Board',
    tShirtSize: 'M',
    extraTShirt: false,
    extraTShirtSize: ''
  });
  
  const router = useRouter();

  const handleApprove = async (id: string, type: 'confirmation' | 'installment') => {
    let amount = 0;
    
    if (type === 'confirmation') {
      if (!confirm(`Are you sure you want to approve the 500 KES confirmation fee for this user? This will send automated SMS messages.`)) return;
    } else if (type === 'installment') {
      const input = prompt("Enter the installment amount received in KES:");
      if (!input) return;
      amount = parseInt(input, 10);
      if (isNaN(amount) || amount <= 0) {
        alert("Please enter a valid amount.");
        return;
      }
      if (!confirm(`Are you sure you want to log a payment of ${amount} KES for this user?`)) return;
    }
    
    setLoadingId(id);
    
    try {
      const res = await fetch('/api/admin/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, type, amount })
      });
      
      if (res.ok) {
        router.refresh();
      } else {
        const errorData = await res.json();
        alert(errorData.message || "Failed to approve.");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred while approving.");
    } finally {
      setLoadingId(null);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setIsAddModalOpen(false);
        setFormData({
          fullName: '', district: '', localChurch: '', phoneNumber: '',
          registrationType: 'Full Board', tShirtSize: 'M', extraTShirt: false, extraTShirtSize: ''
        });
        router.refresh();
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Failed to add registrant.");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred while adding.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredRegistrants = initialRegistrants.filter(r => 
    filter === "ALL" ? true : r.status === filter
  );

  return (
    <div className="space-y-6">
      {/* SMS Warning Banner */}
      <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-md shadow-sm">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-amber-800">SMS Sending Restrictions (IMPORTANT)</h3>
            <div className="mt-2 text-sm text-amber-700">
              <p>
                Because our SMS account uses a default sender ID, Kenyan regulations block all text messages from going out at night. 
                <strong> SMS confirmations will ONLY be delivered between 8:00 AM and 6:00 PM.</strong> Approving payments outside these hours will result in failed receipts. Please process your approvals during daytime hours.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b flex flex-col md:flex-row md:justify-between items-start md:items-center bg-gray-50 gap-4">
          <h2 className="text-lg font-medium text-gray-900">Registrants</h2>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="border-gray-300 rounded-md text-sm shadow-sm p-2 bg-white flex-1 md:flex-none min-w-[140px]"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending Confirmation</option>
            <option value="CONFIRMED">Confirmed (Balance Pending)</option>
            <option value="FULLY_PAID">Fully Paid</option>
          </select>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="flex-1 md:flex-none justify-center inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-colors"
            >
              Add Registrant
            </button>
            <a 
              href="/api/admin/export" 
              className="flex-1 md:flex-none justify-center inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 shadow-sm transition-colors"
            >
              Export to CSV
            </a>
          </div>
        </div>
      </div>
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name & Phone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tier</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance Due</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredRegistrants.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-500">
                  No registrants found.
                </td>
              </tr>
            ) : filteredRegistrants.map(r => (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{r.fullName}</div>
                  <div className="text-sm text-gray-500">{r.phoneNumber}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{r.registrationType}</div>
                  <div className="text-xs text-gray-500">{r.district} - {r.localChurch}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                  KSh {r.balanceAmount.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${r.status === 'FULLY_PAID' ? 'bg-green-100 text-green-800' : 
                      r.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' : 
                      'bg-yellow-100 text-yellow-800'}`}>
                    {r.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex gap-2">
                    {r.status === 'PENDING' && (
                      <button
                        onClick={() => handleApprove(r.id, 'confirmation')}
                        disabled={loadingId === r.id}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded shadow transition-colors disabled:opacity-50"
                      >
                        {loadingId === r.id ? "Approving..." : "Approve 500 KSh"}
                      </button>
                    )}
                    {r.status === 'CONFIRMED' && (
                      <button
                        onClick={() => handleApprove(r.id, 'installment')}
                        disabled={loadingId === r.id}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow transition-colors disabled:opacity-50"
                      >
                        {loadingId === r.id ? "Recording..." : "Record Payment"}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card Layout */}
      <div className="md:hidden flex flex-col divide-y divide-gray-200">
        {filteredRegistrants.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-gray-500">
            No registrants found.
          </div>
        ) : filteredRegistrants.map(r => (
          <div key={r.id} className="p-4 bg-white hover:bg-gray-50 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-sm font-bold text-gray-900">{r.fullName}</div>
                <div className="text-sm text-gray-500">{r.phoneNumber}</div>
              </div>
              <span className={`px-2 py-1 text-[10px] uppercase leading-5 font-bold rounded-full 
                ${r.status === 'FULLY_PAID' ? 'bg-green-100 text-green-800' : 
                  r.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' : 
                  'bg-yellow-100 text-yellow-800'}`}>
                {r.status.replace('_', ' ')}
              </span>
            </div>
            
            <div className="flex justify-between items-center text-sm">
              <div className="text-gray-600">
                <span className="font-semibold text-gray-900">{r.registrationType}</span><br/>
                <span className="text-xs">{r.district} - {r.localChurch}</span>
              </div>
              <div className="text-right">
                <span className="text-xs text-gray-500 uppercase">Balance Due</span><br/>
                <span className="font-bold text-gray-900">KSh {r.balanceAmount.toLocaleString()}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 flex flex-wrap gap-2">
              {r.status === 'PENDING' && (
                <button
                  onClick={() => handleApprove(r.id, 'confirmation')}
                  disabled={loadingId === r.id}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-3 rounded shadow transition-colors disabled:opacity-50 text-sm"
                >
                  {loadingId === r.id ? "Approving..." : "Approve 500 KSh"}
                </button>
              )}
              {r.status === 'CONFIRMED' && (
                <button
                  onClick={() => handleApprove(r.id, 'installment')}
                  disabled={loadingId === r.id}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded shadow transition-colors disabled:opacity-50 text-sm"
                >
                  {loadingId === r.id ? "Recording..." : "Record Payment"}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => setIsAddModalOpen(false)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
            <div className="inline-block px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6 text-black">
              <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Add Manual Registration</h3>
              <form onSubmit={handleAddSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <input required type="text" value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-black" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">District</label>
                    <input required type="text" value={formData.district} onChange={(e) => setFormData({...formData, district: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-black" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Local Church</label>
                    <input required type="text" value={formData.localChurch} onChange={(e) => setFormData({...formData, localChurch: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-black" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone Number (M-PESA)</label>
                  <input required type="text" value={formData.phoneNumber} onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})} placeholder="e.g. 07..." className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-black" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Registration Type</label>
                  <select required value={formData.registrationType} onChange={(e) => setFormData({...formData, registrationType: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-black">
                    <option value="Full Board">Full Board (5350 KES)</option>
                    <option value="Day Scholar">Day Scholar (2600 KES)</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">T-Shirt Size</label>
                    <select required value={formData.tShirtSize} onChange={(e) => setFormData({...formData, tShirtSize: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-black">
                      <option value="S">S</option><option value="M">M</option><option value="L">L</option><option value="XL">XL</option><option value="XXL">XXL</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Extra T-Shirt?</label>
                    <div className="mt-2">
                      <input type="checkbox" checked={formData.extraTShirt} onChange={(e) => setFormData({...formData, extraTShirt: e.target.checked})} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                      <span className="ml-2 text-sm text-gray-600">Yes (+600 KES)</span>
                    </div>
                  </div>
                </div>
                {formData.extraTShirt && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Extra T-Shirt Size</label>
                    <select required value={formData.extraTShirtSize} onChange={(e) => setFormData({...formData, extraTShirtSize: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-black">
                      <option value="">Select Size</option><option value="S">S</option><option value="M">M</option><option value="L">L</option><option value="XL">XL</option><option value="XXL">XXL</option>
                    </select>
                  </div>
                )}
                <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse">
                  <button type="submit" disabled={isSubmitting} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50">
                    {isSubmitting ? "Adding..." : "Add Registrant"}
                  </button>
                  <button type="button" onClick={() => setIsAddModalOpen(false)} disabled={isSubmitting} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}

