
import React, { useState } from 'react';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { ref, set } from 'firebase/database';
import { User } from '../types';
import { ShieldCheck, Mail, Lock, User as UserIcon, Phone, ArrowRight } from 'lucide-react';

interface AuthProps {
  onLogin: (uid: string) => void;
}

export const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const generateReferralCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const generateMPID = () => {
      const randomNum = Math.floor(10000 + Math.random() * 90000);
      return `MP${randomNum}`;
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        // App listener handles state change
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const newUid = generateMPID(); // Use Custom ID for display, map auth UID to it internally if needed, but here we store under auth.uid
        
        // Note: We use firebase Auth UID as the database key for security, 
        // but we assign a display ID (MPxxxxx) inside the object.
        
        const newUser: User = {
          id: newUid, 
          name,
          email,
          phone,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
          balance: 0,
          isActive: false,
          referralCode: generateReferralCode(),
          referrerId: '', // Set during activation
          role: 'user',
          joinedAt: Date.now()
        };

        // For simplicity in this codebase structure, we are saving data using Auth UID
        await set(ref(db, 'users/' + userCredential.user.uid), newUser);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message.replace('Firebase:', '').trim());
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center p-6 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-violet-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

      <div className="z-10 w-full max-w-sm mx-auto">
        <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-violet-500/30">
                <ShieldCheck className="text-white" size={32} />
            </div>
            <h1 className="text-3xl font-bold text-white mb-1">Max Power</h1>
            <p className="text-slate-400 text-sm">Next Gen Wallet & Networking</p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg border border-white/10 rounded-3xl p-6 shadow-xl">
            <div className="flex bg-slate-800/50 rounded-xl p-1 mb-6">
                <button 
                  onClick={() => setIsLogin(true)}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${isLogin ? 'bg-white text-slate-900 shadow-md' : 'text-slate-400 hover:text-white'}`}
                >
                    Login
                </button>
                <button 
                  onClick={() => setIsLogin(false)}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${!isLogin ? 'bg-white text-slate-900 shadow-md' : 'text-slate-400 hover:text-white'}`}
                >
                    Sign Up
                </button>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-200 px-4 py-3 rounded-xl text-xs mb-4">
                    {error}
                </div>
            )}

            <form onSubmit={handleAuth} className="space-y-4">
                {!isLogin && (
                    <>
                    <div className="relative group">
                        <UserIcon className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-violet-400 transition-colors" size={18} />
                        <input 
                            type="text" placeholder="Full Name" required
                            value={name} onChange={e => setName(e.target.value)}
                            className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-slate-500 outline-none focus:border-violet-500 transition-all"
                        />
                    </div>
                    <div className="relative group">
                        <Phone className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-violet-400 transition-colors" size={18} />
                        <input 
                            type="tel" placeholder="Mobile Number" required
                            value={phone} onChange={e => setPhone(e.target.value)}
                            className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-slate-500 outline-none focus:border-violet-500 transition-all"
                        />
                    </div>
                    </>
                )}

                <div className="relative group">
                    <Mail className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-violet-400 transition-colors" size={18} />
                    <input 
                        type="email" placeholder="Email Address" required
                        value={email} onChange={e => setEmail(e.target.value)}
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-slate-500 outline-none focus:border-violet-500 transition-all"
                    />
                </div>

                <div className="relative group">
                    <Lock className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-violet-400 transition-colors" size={18} />
                    <input 
                        type="password" placeholder="Password" required
                        value={password} onChange={e => setPassword(e.target.value)}
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-slate-500 outline-none focus:border-violet-500 transition-all"
                    />
                </div>

                <button 
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-violet-600/30 active:scale-95 transition-all flex items-center justify-center gap-2 mt-2"
                >
                    {loading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <>
                           {isLogin ? 'Access Wallet' : 'Create Account'} <ArrowRight size={18} />
                        </>
                    )}
                </button>
            </form>
        </div>
      </div>
    </div>
  );
};
