'use client'
import { useState } from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function SettingsForm({ initialData }: { initialData: any }) {
  const [treasurerPhone, setTreasurerPhone] = useState(initialData?.treasurerPhone || '');
  const [secretaryPhone, setSecretaryPhone] = useState(initialData?.secretaryPhone || '');
  const [status, setStatus] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('Saving...');
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ treasurerPhone, secretaryPhone })
      });
      if (res.ok) {
        setStatus('Saved successfully');
      } else {
        setStatus('Error saving settings');
      }
    } catch {
      setStatus('Error saving settings');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Treasurer Phone Number</label>
        <input 
          type="text" 
          value={treasurerPhone}
          onChange={(e) => setTreasurerPhone(e.target.value)}
          placeholder="+2547XXXXXXXX"
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" 
        />
        <p className="text-xs text-gray-500 mt-1">Receives SMS alerts on payments.</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Secretary Phone Number</label>
        <input 
          type="text" 
          value={secretaryPhone}
          onChange={(e) => setSecretaryPhone(e.target.value)}
          placeholder="+2547XXXXXXXX"
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" 
        />
        <p className="text-xs text-gray-500 mt-1">Receives SMS alerts on payments.</p>
      </div>

      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">Save</button>
      {status && <span className="ml-4 text-sm text-gray-600">{status}</span>}
    </form>
  )
}

