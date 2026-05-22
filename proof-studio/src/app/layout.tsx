import type { Metadata } from 'next';
import './globals.css';
import ClientLayout from '@/components/ClientLayout';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const metadata: Metadata = {
  title: 'ProofStudio',
  description: 'Turn client testimonials into powerful social proof — automatically.',
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/logo-icon.png',
  },
  openGraph: {
    title: 'ProofStudio',
    description: 'Turn client testimonials into powerful social proof — automatically.',
    images: ['/logo.png'],
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  let user = null;
  if (session?.userId) {
    user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true, name: true, email: true },
    });
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ClientLayout user={user}>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
