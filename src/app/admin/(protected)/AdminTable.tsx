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

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to completely delete this registration? This action cannot be undone.")) return;
    
    setLoadingId(id);
    try {
      const res = await fetch('/api/admin/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      
      if (res.ok) {
        router.refresh();
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Failed to delete.");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred while deleting.");
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
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
        <h2 className="text-lg font-medium text-gray-900">Registrants</h2>
        <div className="flex items-center gap-4">
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="border-gray-300 rounded-md text-sm shadow-sm p-2 bg-white"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending Confirmation</option>
            <option value="CONFIRMED">Confirmed (Balance Pending)</option>
            <option value="FULLY_PAID">Fully Paid</option>
          </select>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-colors"
          >
            Add Registrant
          </button>
          <a 
            href="/api/admin/export" 
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 shadow-sm transition-colors"
          >
            Export to CSV
          </a>
        </div>
      </div>
      <div className="overflow-x-auto">
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
                  {r.status === 'PENDING' && (
                    <button
                      onClick={() => handleApprove(r.id, 'confirmation')}
                      disabled={loadingId === r.id}
                      className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded shadow transition-colors disabled:opacity-50 mr-2"
                    >
                      {loadingId === r.id ? "Approving..." : "Approve 500 KSh"}
                    </button>
                  )}
                  {r.status === 'CONFIRMED' && (
                    <button
                      onClick={() => handleApprove(r.id, 'installment')}
                      disabled={loadingId === r.id}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow transition-colors disabled:opacity-50 mr-2"
                    >
                      {loadingId === r.id ? "Recording..." : "Record Payment"}
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(r.id)}
                    disabled={loadingId === r.id}
                    className="bg-red-50 text-red-600 hover:bg-red-100 font-bold py-2 px-3 rounded shadow-sm border border-red-200 transition-colors disabled:opacity-50"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
  );
}

