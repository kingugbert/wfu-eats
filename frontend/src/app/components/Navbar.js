'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MapPin, BookOpen, Heart, LogOut, User } from 'lucide-react';
import { useAuth } from './AuthContext';
import AuthModal from './AuthModal';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  return (
    <>
      <nav className="bg-black border-b border-wfu-gray-800 sticky top-0 z-[9999]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-wfu-gold rounded flex items-center justify-center">
                <span className="text-black font-bold text-sm">WF</span>
              </div>
              <span className="text-wfu-gold font-bold text-xl">WFU Eats</span>
            </Link>

            <div className="flex items-center space-x-1 sm:space-x-4">
              <Link href="/" className="flex items-center space-x-1 px-3 py-2 rounded-lg text-wfu-gray-300 hover:text-wfu-gold hover:bg-wfu-gray-800 transition-colors">
                <MapPin size={18} />
                <span className="hidden sm:inline">Map</span>
              </Link>

              <Link href="/posts" className="flex items-center space-x-1 px-3 py-2 rounded-lg text-wfu-gray-300 hover:text-wfu-gold hover:bg-wfu-gray-800 transition-colors">
                <BookOpen size={18} />
                <span className="hidden sm:inline">Feed</span>
              </Link>

              {user && (
                <Link href="/restaurants" className="flex items-center space-x-1 px-3 py-2 rounded-lg text-wfu-gray-300 hover:text-wfu-gold hover:bg-wfu-gray-800 transition-colors">
                  <Heart size={18} />
                  <span className="hidden sm:inline">Favorites</span>
                </Link>
              )}

              {user ? (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-wfu-gray-400 hidden md:inline">
                    <User size={14} className="inline mr-1" />
                    {user.firstName}
                  </span>
                  <button
                    onClick={logout}
                    className="flex items-center space-x-1 px-3 py-2 rounded-lg text-wfu-gray-300 hover:text-red-400 hover:bg-wfu-gray-800 transition-colors"
                  >
                    <LogOut size={18} />
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAuth(true)}
                  className="px-4 py-2 bg-wfu-gold text-black font-semibold rounded-lg hover:bg-wfu-gold-light transition-colors"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
    </>
  );
}
