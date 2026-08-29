import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession();
  
  if (!session) {
    redirect('/admin/login');
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <nav className="bg-blue-900 text-white p-4 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="font-bold text-xl">Admin Dashboard</h1>
          <div className="space-x-6">
            <Link href="/admin" className="hover:text-blue-200">Dashboard</Link>
            <Link href="/admin/settings" className="hover:text-blue-200">Settings</Link>
            <Link href="/api/auth/signout" className="hover:text-red-300">Sign Out</Link>
          </div>
        </div>
      </nav>
      <main className="flex-1 max-w-7xl w-full mx-auto p-6">
        {children}
      </main>
    </div>
  );
}

