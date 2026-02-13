
import React from 'react';

interface HeaderProps {
  activeSection: string;
  setActiveSection: (s: any) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const Header: React.FC<HeaderProps> = ({ activeSection, setActiveSection, isDarkMode, toggleDarkMode }) => {
  const navItems = [
    { id: 'home', label: 'Trang chủ', icon: 'fa-house' },
    { id: 'study', label: 'Cá nhân hóa', icon: 'fa-sparkles' },
    { id: 'relax', label: 'Chill', icon: 'fa-leaf' },
    { id: 'contact', label: 'Kết nối', icon: 'fa-paper-plane' },
  ];

  return (
    <header className="sticky top-0 z-50 glass transition-all duration-300 border-b border-white/20 dark:border-slate-800/50">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between gap-4">
        <div 
          className="flex items-center gap-3 cursor-pointer group" 
          onClick={() => setActiveSection('home')}
        >
          <div className="relative">
            <div className="absolute inset-0 bg-indigo-500 rounded-full blur-xl opacity-20 group-hover:opacity-50 transition-opacity"></div>
            {/* Minimalist Professional Logo */}
            <div className="relative w-11 h-11 bg-slate-900 dark:bg-white rounded-2xl flex items-center justify-center text-white dark:text-slate-900 shadow-xl transform group-hover:rotate-[10deg] transition-all duration-500 overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600 to-purple-600 opacity-80"></div>
               <i className="fa-solid fa-atom text-xl relative z-10 animate-spin-slow"></i>
            </div>
          </div>
          <div className="flex flex-col pt-1 overflow-visible">
            <span className="text-2xl font-black tracking-tighter bg-gradient-to-r from-slate-900 to-slate-500 dark:from-white dark:to-slate-400 bg-clip-text text-transparent leading-none pb-4 overflow-visible">
              MindStudy
            </span>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-2 bg-slate-100/30 dark:bg-slate-900/40 p-1.5 rounded-full backdrop-blur-3xl border border-white/10 shadow-inner">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`px-5 py-2.5 rounded-full text-xs font-black transition-all flex items-center gap-2 ${
                activeSection === item.id 
                  ? 'bg-indigo-600 text-white shadow-lg scale-105' 
                  : 'text-slate-500 hover:text-indigo-400 dark:hover:text-slate-300'
              }`}
            >
              <i className={`fa-solid ${item.icon} text-[10px]`}></i>
              {item.label}
            </button>
          ))}
          <div className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-2"></div>
          <button
            onClick={toggleDarkMode}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white dark:hover:bg-slate-800 transition-all text-slate-500"
          >
            <i className={`fa-solid ${isDarkMode ? 'fa-sun' : 'fa-moon'}`}></i>
          </button>
        </nav>

        <button className="md:hidden text-2xl text-slate-500">
          <i className="fa-solid fa-bars-staggered"></i>
        </button>
      </div>
      <style>{`
        .animate-spin-slow { animation: spin 8s linear infinite; }
      `}</style>
    </header>
  );
};

export default Header;
