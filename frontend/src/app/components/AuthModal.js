'use client';
import { useState } from 'react';
import { useAuth } from './AuthContext';
import { X, Eye, EyeOff } from 'lucide-react';

export default function AuthModal({ onClose }) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [form, setForm] = useState({
    email: '', password: '', displayName: '', classYear: '', major: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
      } else {
        await register({
          email: form.email,
          password: form.password,
          displayName: form.displayName,
          classYear: form.classYear ? parseInt(form.classYear) : undefined,
          major: form.major || undefined,
        });
      }
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const update = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
         onClick={onClose}>
      <div className="w-full max-w-md bg-wfu-gray-800 border border-wfu-gray-700 rounded-2xl shadow-2xl
                      animate-fadeInUp" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-wfu-gray-700">
          <h2 className="text-xl font-display font-bold text-wfu-gold">
            {mode === 'login' ? 'Welcome Back' : 'Join WFU Eats'}
          </h2>
          <button onClick={onClose} className="text-wfu-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-900/30 border border-red-700/50 text-red-300 text-sm px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm text-wfu-gray-300 mb-1">Wake Forest Email</label>
            <input type="email" required value={form.email} onChange={update('email')}
                   placeholder="deacon@wfu.edu"
                   className="w-full bg-wfu-gray-900 border border-wfu-gray-600 rounded-lg px-4 py-2.5 text-white
                              placeholder:text-wfu-gray-500 focus:outline-none focus:border-wfu-gold
                              focus:ring-1 focus:ring-wfu-gold transition-colors" />
          </div>

          <div>
            <label className="block text-sm text-wfu-gray-300 mb-1">Password</label>
            <div className="relative">
              <input type={showPw ? 'text' : 'password'} required value={form.password}
                     onChange={update('password')} placeholder="Min 8 characters"
                     className="w-full bg-wfu-gray-900 border border-wfu-gray-600 rounded-lg px-4 py-2.5 text-white
                                placeholder:text-wfu-gray-500 focus:outline-none focus:border-wfu-gold
                                focus:ring-1 focus:ring-wfu-gold transition-colors pr-10" />
              <button type="button" onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-wfu-gray-400 hover:text-wfu-gold">
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {mode === 'register' && (
            <>
              <div>
                <label className="block text-sm text-wfu-gray-300 mb-1">Display Name</label>
                <input type="text" required value={form.displayName} onChange={update('displayName')}
                       placeholder="Your name"
                       className="w-full bg-wfu-gray-900 border border-wfu-gray-600 rounded-lg px-4 py-2.5 text-white
                                  placeholder:text-wfu-gray-500 focus:outline-none focus:border-wfu-gold
                                  focus:ring-1 focus:ring-wfu-gold transition-colors" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-wfu-gray-300 mb-1">Class Year</label>
                  <input type="number" value={form.classYear} onChange={update('classYear')}
                         placeholder="2026" min="2020" max="2035"
                         className="w-full bg-wfu-gray-900 border border-wfu-gray-600 rounded-lg px-4 py-2.5 text-white
                                    placeholder:text-wfu-gray-500 focus:outline-none focus:border-wfu-gold
                                    focus:ring-1 focus:ring-wfu-gold transition-colors" />
                </div>
                <div>
                  <label className="block text-sm text-wfu-gray-300 mb-1">Major</label>
                  <input type="text" value={form.major} onChange={update('major')}
                         placeholder="Computer Science"
                         className="w-full bg-wfu-gray-900 border border-wfu-gray-600 rounded-lg px-4 py-2.5 text-white
                                    placeholder:text-wfu-gray-500 focus:outline-none focus:border-wfu-gold
                                    focus:ring-1 focus:ring-wfu-gold transition-colors" />
                </div>
              </div>
            </>
          )}

          <button type="submit" disabled={loading}
                  className="btn-gold w-full disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? 'Please wait...' : (mode === 'login' ? 'Sign In' : 'Create Account')}
          </button>

          <p className="text-center text-sm text-wfu-gray-400">
            {mode === 'login' ? "Don't have an account?" : "Already have an account?"}
            <button type="button" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
                    className="ml-1 text-wfu-gold hover:text-wfu-gold-light transition-colors">
              {mode === 'login' ? 'Sign Up' : 'Sign In'}
            </button>
          </p>

          {mode === 'login' && (
            <p className="text-center text-xs text-wfu-gray-500">
              Demo: demo@wfu.edu / DeaconEats2024!
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
