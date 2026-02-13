
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-100 dark:border-slate-800 mt-20">
      <div className="container mx-auto px-6 py-12 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
            <i className="fa-solid fa-brain text-xs"></i>
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-800 dark:text-white">MindStudy</span>
        </div>
        
        <p className="text-slate-500 text-sm font-medium text-center md:text-left">
          © 2024 MindStudy Pro. Mỗi đóng góp của bạn là động lực phát triển của chúng tớ.
        </p>

        <div className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest">
          <i className="fa-solid fa-envelope text-indigo-500"></i>
          keihanna0124@gmail.com
        </div>
      </div>
    </footer>
  );
};

export default Footer;
