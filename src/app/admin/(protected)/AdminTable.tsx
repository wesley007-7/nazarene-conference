"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function AdminTable({ initialRegistrants }: { initialRegistrants: any[] }) {
  const [filter, setFilter] = useState("ALL");
  const [loadingId, setLoadingId] = useState<string | null>(null);
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

