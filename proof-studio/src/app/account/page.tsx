import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'My Account | ProofStudio',
};

export default async function AccountPage() {
  const session = await getSession();
  
  if (!session?.userId) {
    redirect('/login');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
  });

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-8">My Account</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="card">
          <h2 className="text-xl mb-6">Profile Information</h2>
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-sm text-muted mb-2">Name</label>
              <input type="text" className="input w-full" value={user.name || ''} readOnly />
            </div>
            <div>
              <label className="block text-sm text-muted mb-2">Email</label>
              <input type="email" className="input w-full" value={user.email} readOnly />
            </div>
            <p className="text-sm text-muted mt-2">
              To update your profile, please contact support.
            </p>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl mb-6">Preferences & Settings</h2>
          <p className="text-muted">
            Additional account settings like billing, notifications, and password reset will appear here in future updates.
          </p>
        </div>
      </div>
    </div>
  );
}
