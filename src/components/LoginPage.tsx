import { Link, useNavigate } from 'react-router-dom';
import React, { useState } from 'react';
import { Building2 } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();

  const handleLogin = () => {
    localStorage.setItem('userProfile', JSON.stringify({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@gmail.com',
      phone: '+1 234 567 8900'
    }));
    navigate('/app');
  };

  return (
    <div className="min-h-screen text-gray-900 flex items-center justify-center relative p-6 selection:bg-rose-100 font-sans overflow-hidden">
      
      {/* Blurred Property Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img 
          src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=2000" 
          alt="Luxury Property Background" 
          className="w-full h-full object-cover blur-sm opacity-80 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-white/30 backdrop-blur-[2px]"></div>
      </div>

      <nav className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-6 md:px-12 w-full bg-transparent">
        <Link to="/" className="text-xl tracking-tight font-sans font-bold flex items-center gap-2.5 text-gray-900 hover:opacity-80 transition-opacity">
          <div className="p-1.5 bg-gradient-to-br from-blue-900 to-slate-800 rounded-lg text-white shadow-md">
            <Building2 className="w-5 h-5" />
          </div>
          LuxeReal
        </Link>
      </nav>

      <div className="w-full max-w-md bg-white/95 backdrop-blur-xl rounded-[2rem] p-10 shadow-[0_20px_60px_rgb(0,0,0,0.15)] ring-1 ring-gray-200 z-10 relative">
        <h2 className="text-3xl font-medium tracking-tight text-gray-900 mb-2">Sign in</h2>
        <p className="text-gray-500 font-light mb-8">Access your personalized real estate experience.</p>

        <button 
          onClick={handleLogin}
          className="w-full py-4 bg-white text-gray-900 rounded-xl font-medium border border-gray-200 hover:bg-gray-50 transition-all active:scale-[0.98] flex items-center justify-center gap-3 shadow-sm"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>
      </div>
    </div>
  );
}
