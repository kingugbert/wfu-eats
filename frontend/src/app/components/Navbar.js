'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from './AuthContext';
import AuthModal from './AuthModal';
import { MapPin, Utensils, BookOpen, Heart, LogOut, Menu, X } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <nav className="sticky top-0 z-50 bg-black/90 backdrop-blur-md border-b border-wfu-gold/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 bg-wfu-gold rounded-lg flex items-center justify-center
                              group-hover:shadow-lg group-hover:shadow-wfu-gold/30 transition-all">
                <Utensils className="w-5 h-5 text-black" />
              </div>
              <div>
                <span className="text-wfu-gold font-display font-bold text-lg leading-none">WFU</span>
                <span className="text-white font-display font-bold text-lg leading-none ml-1">Eats</span>
              </div>
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-1">
              <NavLink href="/" icon={<MapPin className="w-4 h-4" />} label="Map" />
              <NavLink href="/posts" icon={<BookOpen className="w-4 h-4" />} label="Feed" />
              {user && (
                <NavLink href="/restaurants" icon={<Heart className="w-4 h-4" />} label="Favorites" />
              )}
            </div>

            {/* Auth / User */}
            <div className="hidden md:flex items-center gap-3">
              {user ? (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-wfu-gold/20 border border-wfu-gold/40 rounded-full
                                  flex items-center justify-center text-wfu-gold text-sm font-semibold">
                    {user.display_name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm text-wfu-gray-300">{user.display_name}</span>
                  <button
                    onClick={logout}
                    className="text-wfu-gray-400 hover:text-wfu-gold transition-colors p-2"
                    title="Sign out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button onClick={() => setShowAuth(true)} className="btn-gold text-sm">
                  Sign In
                </button>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              className="md:hidden text-wfu-gray-300 p-2"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden bg-black border-t border-wfu-gray-700 px-4 pb-4">
            <MobileNavLink href="/" label="Map" onClick={() => setMobileOpen(false)} />
            <MobileNavLink href="/posts" label="Feed" onClick={() => setMobileOpen(false)} />
            {user && <MobileNavLink href="/restaurants" label="Favorites" onClick={() => setMobileOpen(false)} />}
            <div className="mt-3 pt-3 border-t border-wfu-gray-700">
              {user ? (
                <button onClick={() => { logout(); setMobileOpen(false); }}
                        className="text-wfu-gray-400 text-sm">Sign Out</button>
              ) : (
                <button onClick={() => { setShowAuth(true); setMobileOpen(false); }}
                        className="btn-gold text-sm w-full">Sign In</button>
              )}
            </div>
          </div>
        )}
      </nav>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  );
}

function NavLink({ href, icon, label }) {
  return (
    <Link href={href}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-wfu-gray-300
                     hover:text-wfu-gold hover:bg-wfu-gray-800 transition-all">
      {icon} {label}
    </Link>
  );
}

function MobileNavLink({ href, label, onClick }) {
  return (
    <Link href={href} onClick={onClick}
          className="block py-2.5 text-wfu-gray-300 hover:text-wfu-gold transition-colors">
      {label}
    </Link>
  );
}
