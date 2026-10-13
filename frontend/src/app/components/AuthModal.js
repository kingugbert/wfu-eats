'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { useAuth } from './AuthContext';

export default function AuthModal({ isOpen, onClose }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [graduationYear, setGraduationYear] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register({
          email,
          password,
          firstName,
          lastName,
          graduationYear: graduationYear ? parseInt(graduationYear) : undefined
        });
      }
      onClose();
      resetForm();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setFirstName('');
    setLastName('');
    setGraduationYear('');
    setError('');
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-wfu-gray-800 rounded-xl shadow-2xl w-full max-w-md mx-4 p-6 border border-wfu-gray-700">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-wfu-gray-400 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-wfu-gold">
            {isLogin ? 'Welcome Back' : 'Join WFU Eats'}
          </h2>
          <p className="text-wfu-gray-400 mt-1">
            {isLogin ? 'Sign in with your WFU email' : 'Create your account'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-wfu-gray-300 mb-1">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required={!isLogin}
                  className="w-full px-3 py-2 bg-wfu-gray-700 border border-wfu-gray-600 rounded-lg text-white placeholder-wfu-gray-400 focus:outline-none focus:border-wfu-gold"
                  placeholder="First"
                />
              </div>
              <div>
                <label className="block text-sm text-wfu-gray-300 mb-1">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required={!isLogin}
                  className="w-full px-3 py-2 bg-wfu-gray-700 border border-wfu-gray-600 rounded-lg text-white placeholder-wfu-gray-400 focus:outline-none focus:border-wfu-gold"
                  placeholder="Last"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm text-wfu-gray-300 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 bg-wfu-gray-700 border border-wfu-gray-600 rounded-lg text-white placeholder-wfu-gray-400 focus:outline-none focus:border-wfu-gold"
              placeholder="yourname@wfu.edu"
            />
          </div>

          <div>
            <label className="block text-sm text-wfu-gray-300 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={isLogin ? undefined : 8}
              className="w-full px-3 py-2 bg-wfu-gray-700 border border-wfu-gray-600 rounded-lg text-white placeholder-wfu-gray-400 focus:outline-none focus:border-wfu-gold"
              placeholder={isLogin ? 'Your password' : 'Min 8 characters'}
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block text-sm text-wfu-gray-300 mb-1">Graduation Year (optional)</label>
              <input
                type="number"
                value={graduationYear}
                onChange={(e) => setGraduationYear(e.target.value)}
                min="2020"
                max="2030"
                className="w-full px-3 py-2 bg-wfu-gray-700 border border-wfu-gray-600 rounded-lg text-white placeholder-wfu-gray-400 focus:outline-none focus:border-wfu-gold"
                placeholder="2026"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-wfu-gold text-black font-semibold rounded-lg hover:bg-wfu-gold-light transition-colors disabled:opacity-50"
          >
            {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-wfu-gray-400">
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <button onClick={toggleMode} className="text-wfu-gold hover:underline">
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </div>
      </div>
    </div>
  );
}
