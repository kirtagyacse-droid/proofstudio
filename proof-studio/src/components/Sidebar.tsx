'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Logo from './Logo';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Folder, User, Settings, LogOut, Menu, X } from 'lucide-react';

type SidebarProps = {
  user: {
    id: string;
    name: string | null;
    email: string;
  } | null;
};

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Hidden on public/auth pages
  if (
    pathname === '/login' ||
    pathname === '/signup' ||
    pathname.startsWith('/f/') ||
    pathname.startsWith('/p/')
  ) {
    return null;
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  };

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Projects', href: '/dashboard', icon: Folder }, // Based on prompt, links to dashboard too
    { name: 'Account', href: '/account', icon: User },
  ];

  const sidebarContent = (
    <>
      <div style={{
        padding: '20px 16px 20px 16px',
        borderBottom: '1px solid #222222',
        marginBottom: '8px',
      }}>
        <Logo variant="full" href="/dashboard" />
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.name === 'Projects' && pathname.startsWith('/project/'));
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={`nav-link ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} color={isActive ? '#ffffff' : 'currentColor'} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {user && (
        <div className="user-section">
          <div className="user-avatar">
            {(user.name || user.email).charAt(0).toUpperCase()}
          </div>
          
          <div className="user-info">
            <div className="user-name">
              {user.name || 'User'}
            </div>
            <div className="user-email">
              {user.email}
            </div>
          </div>
          
          <Link href="/account" className="settings-btn">
            <Settings size={16} />
          </Link>
          <button 
            onClick={handleLogout}
            className="logout-btn"
            title="Log out"
          >
            <LogOut size={16} />
          </button>
        </div>
      )}
    </>
  );

  return (
    <>
      {/* Mobile Topbar */}
      <div className="hidden-desktop mobile-topbar">
        <button 
          onClick={() => setIsOpen(true)}
          className="menu-btn"
        >
          <Menu size={20} />
        </button>
        <Logo variant="icon" href="/dashboard" />
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden-mobile desktop-sidebar">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMounted && isOpen && (
        <div 
          className="hidden-desktop mobile-drawer-overlay"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Drawer Sidebar */}
      <aside 
        className={`hidden-desktop mobile-drawer-sidebar ${isOpen ? 'open' : 'closed'}`}
      >
        <button 
          onClick={() => setIsOpen(false)}
          className="close-btn"
        >
          <X size={20} />
        </button>
        {sidebarContent}
      </aside>
    </>
  );
}
