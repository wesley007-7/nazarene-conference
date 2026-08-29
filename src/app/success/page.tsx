import Link from 'next/link';

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl shadow-zinc-200/40 p-8 text-center animate-fade-in-up border border-zinc-100">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        
        <h1 className="text-2xl font-extrabold text-zinc-900 mb-4">Payment Confirmation Underway</h1>
        
        <p className="text-zinc-600 leading-relaxed mb-8">
          Thank you for registering! Our treasurer is currently verifying your M-PESA payment. Once approved, you will receive a confirmation SMS on your phone.
        </p>
        
        <Link 
          href="/" 
          className="inline-block bg-zinc-900 hover:bg-black text-white px-8 py-3 rounded-xl font-bold transition-all duration-300 shadow-lg shadow-zinc-900/20 hover:shadow-xl hover:-translate-y-1"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}

