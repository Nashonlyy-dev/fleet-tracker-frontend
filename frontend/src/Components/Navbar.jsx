import React from 'react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useAuth();

    // Get initial for avatar
    const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'D';

    return (
        <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-3 flex justify-between items-center absolute top-0 left-0 right-0 z-[1010] transition-all">
            {/* Logo & Brand */}
            <div className="flex items-center space-x-3 group cursor-pointer">
                <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-100 transform group-hover:rotate-12 transition-transform duration-300">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17h5" />
                    </svg>
                </div>
                <div className="flex flex-col">
                    <h1 className="text-lg font-black text-slate-800 leading-tight tracking-tight hidden md:block">
                        TruckTrack <span className="text-indigo-600">Pro</span>
                    </h1>
                    <span className="text-[10px] font-bold text-slate-400 tracking-[0.2em] uppercase hidden md:block">Fleet Control</span>
                </div>
            </div>

            {/* User Profile & Actions */}
            <div className="flex items-center space-x-6">
                {/* Status Indicator (Subtle) */}
                <div className="hidden lg:flex items-center space-x-2 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Server Live</span>
                </div>

                {/* Profile Section */}
                <div className="flex items-center space-x-4 pl-6 border-l border-slate-200">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-black text-slate-800 leading-none">{user?.name || 'Authorized User'}</p>
                        <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-widest mt-1">{user?.role || 'Access Level'}</p>
                    </div>
                    
                    {/* User Avatar Circle */}
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white font-black shadow-lg shadow-indigo-100 border-2 border-white ring-1 ring-slate-100">
                        {userInitial}
                    </div>

                    {/* Logout Button */}
                    <button
                        onClick={logout}
                        className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-100 border border-transparent transition-all active:scale-95 group"
                        title="Sign Out"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;