
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
            <div className="absolute inset-0 bg-indigo-400 rounded-xl blur-xl opacity-30 group-hover:opacity-60 transition-opacity"></div>
            <div className="relative w-12 h-12 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center text-white shadow-2xl transform group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500">
              <i className="fa-solid fa-brain text-xl"></i>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-black tracking-tighter bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
              MindStudy
            </span>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-2 bg-slate-100/50 dark:bg-slate-900/40 p-1.5 rounded-full backdrop-blur-xl border border-white/20">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`px-6 py-2.5 rounded-full text-sm font-black transition-all flex items-center gap-2 ${
                activeSection === item.id 
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-xl scale-105' 
                  : 'text-slate-500 hover:text-indigo-400 dark:hover:text-slate-300'
              }`}
            >
              <i className={`fa-solid ${item.icon} text-xs`}></i>
              {item.label}
            </button>
          ))}
          <div className="w-px h-6 bg-slate-300 dark:bg-slate-700 mx-2"></div>
          <button
            onClick={toggleDarkMode}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white dark:hover:bg-slate-800 transition-all text-slate-500 hover:text-amber-500"
          >
            <i className={`fa-solid ${isDarkMode ? 'fa-sun' : 'fa-moon'}`}></i>
          </button>
        </nav>

        <button className="md:hidden text-2xl text-slate-500">
          <i className="fa-solid fa-bars-staggered"></i>
        </button>
      </div>
    </header>
  );
};

export default Header;
