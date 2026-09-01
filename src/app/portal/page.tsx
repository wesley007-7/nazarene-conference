"use client";

import { useState } from 'react';
import Link from 'next/link';

export default function PortalPage() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [registrant, setRegistrant] = useState<any>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setRegistrant(null);

    try {
      const res = await fetch(`/api/portal?phone=${encodeURIComponent(phone)}`);
      const data = await res.json();

      if (res.ok) {
        setRegistrant(data.registrant);
      } else {
        setError(data.message || 'Error finding registration.');
      }
    } catch {
      setError('A network error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900">
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex justify-between items-center">
          <Link href="/" className="brand flex items-center">
            <img className="h-12 w-auto transition-transform hover:scale-105 duration-300" src="/logo.png" alt="Logo" />
          </Link>
          <nav className="flex gap-6">
            <Link href="/" className="font-medium text-zinc-600 hover:text-zinc-950 transition-colors">New Registration</Link>
          </nav>
        </div>
      </header>

      <main className="py-16 md:py-24 px-4 md:px-8 max-w-3xl mx-auto">
        <div className="text-center mb-12 animate-fade-in-up">
          <p className="text-sm font-bold uppercase tracking-widest text-zinc-500 mb-2">Participant Portal</p>
          <h1 className="text-3xl font-extrabold text-zinc-900 mb-4">Check Status & Pay Installments</h1>
          <p className="text-zinc-600">Enter the phone number you used to register to track your balance and make partial payments.</p>
        </div>

        {!registrant ? (
          <div className="bg-white rounded-3xl shadow-xl shadow-zinc-200/40 p-6 md:p-10 border border-zinc-100 animate-fade-in-up delay-100">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
              <input 
                type="tel" 
                placeholder="Enter Phone (e.g. 07XXXXXXXX)" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="flex-1 p-4 border border-zinc-300 rounded-xl focus:ring-2 focus:ring-zinc-800 outline-none bg-zinc-50 focus:bg-white transition-all"
              />
              <button 
                type="submit" 
                disabled={loading}
                className="bg-zinc-900 hover:bg-black text-white px-8 py-4 rounded-xl font-bold transition-all disabled:opacity-70 whitespace-nowrap"
              >
                {loading ? 'Searching...' : 'Check Status'}
              </button>
            </form>
            {error && <p className="mt-4 text-red-600 text-sm font-medium bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>}
          </div>
        ) : (
          <div className="animate-fade-in-up">
            <div className="bg-white rounded-t-3xl shadow-lg border border-zinc-100 p-8">
              <div className="flex justify-between items-start border-b border-zinc-100 pb-6 mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-zinc-900">{registrant.fullName}</h2>
                  <p className="text-zinc-500 mt-1">{registrant.registrationType} • {registrant.localChurch}</p>
                </div>
                <span className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider 
                  ${registrant.status === 'FULLY_PAID' ? 'bg-green-100 text-green-800' : 
                    registrant.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' : 
                    'bg-yellow-100 text-yellow-800'}`}>
                  {registrant.status.replace('_', ' ')}
                </span>
              </div>

              <div className="mb-8">
                <p className="text-sm font-medium text-zinc-500 mb-1">Remaining Balance</p>
                <p className="text-4xl font-extrabold text-zinc-900">KSh {registrant.balanceAmount.toLocaleString()}</p>
              </div>

              {registrant.status === 'PENDING' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 text-yellow-800">
                  <h4 className="font-bold flex items-center gap-2 mb-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    Verification Pending
                  </h4>
                  <p className="text-sm">We are currently verifying your initial 500 KES confirmation fee. You will receive an SMS once your spot is officially secured!</p>
                </div>
              )}

              {registrant.status === 'CONFIRMED' && (
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 text-blue-900">
                  <h4 className="font-bold text-lg mb-3">Make an Installment Payment</h4>
                  <p className="text-sm mb-6">You can pay off your balance in installments of your own choosing. Send any amount you wish to our M-PESA account and our treasurer will update your balance.</p>
                  
                  <div className="bg-white rounded-xl p-5 shadow-sm border border-blue-100">
                    <ol className="list-decimal list-inside space-y-2 text-sm text-zinc-700">
                      <li>Go to <strong>M-PESA Menu</strong> &gt; <strong>Lipa na M-PESA</strong> &gt; <strong>Pochi la Biashara</strong></li>
                      <li>Enter Phone: <strong className="text-blue-700 text-base">0723552949</strong></li>
                      <li>Enter Amount: <strong>(Any amount you choose)</strong></li>
                      <li>Enter your M-PESA PIN</li>
                    </ol>
                  </div>
                </div>
              )}

              {registrant.status === 'FULLY_PAID' && (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-green-900 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  </div>
                  <h4 className="font-bold text-xl mb-2">You&apos;re Fully Paid!</h4>
                  <p className="text-sm">Thank you! Your registration is complete and fully paid. We look forward to seeing you at the conference.</p>
                </div>
              )}
            </div>
            
            <div className="mt-6 text-center">
              <button 
                onClick={() => setRegistrant(null)} 
                className="text-zinc-500 hover:text-zinc-800 text-sm font-medium transition-colors"
              >
                ← Check a different phone number
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

