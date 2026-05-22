// src/components/Logo.tsx
import Link from 'next/link';

interface LogoProps {
  variant?: 'full' | 'icon';
  href?: string;
}

export default function Logo({ variant = 'full', href = '/dashboard' }: LogoProps) {
  const icon = (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" suppressHydrationWarning>
      <defs>
        <linearGradient id="logoGrad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#60A5FA" suppressHydrationWarning />
          <stop offset="100%" stopColor="#8B5CF6" suppressHydrationWarning />
        </linearGradient>
      </defs>
      {/* Speech bubble shape */}
      <path
        d="M4 6C4 4.343 5.343 3 7 3H25C26.657 3 28 4.343 28 6V20C28 21.657 26.657 23 25 23H18L13 29V23H7C5.343 23 4 21.657 4 20V6Z"
        fill="url(#logoGrad)"
        suppressHydrationWarning
      />
      {/* Checkmark inside */}
      <path
        d="M10 13L14 17L22 9"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        suppressHydrationWarning
      />
    </svg>
  );

  const wordmark = (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }} suppressHydrationWarning>
      {icon}
      <span style={{
        fontSize: '18px',
        fontWeight: '700',
        fontFamily: 'Inter, -apple-system, sans-serif',
        letterSpacing: '-0.3px',
        lineHeight: 1,
      }} suppressHydrationWarning>
        <span style={{ color: '#ffffff' }} suppressHydrationWarning>Proof</span>
        <span style={{ color: '#8B5CF6' }} suppressHydrationWarning>Studio</span>
      </span>
    </div>
  );

  return (
    <Link
      href={href}
      style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
      suppressHydrationWarning
    >
      {variant === 'full' ? wordmark : icon}
    </Link>
  );
}
