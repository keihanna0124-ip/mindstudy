
import React from 'react';
import Brain3D from './Brain3D';

interface HeroProps {
  onStart: () => void;
}

const Hero: React.FC<HeroProps> = ({ onStart }) => {
  return (
    <div className="relative min-h-[85vh] flex flex-col items-center justify-center text-center px-6 overflow-hidden">
      {/* Nature Orbs - Background decor */}
      <div className="absolute -top-20 -left-20 w-[40rem] h-[40rem] bg-emerald-100/30 dark:bg-emerald-900/10 rounded-full blur-[120px] -z-10 animate-pulse"></div>
      <div className="absolute -bottom-20 -right-20 w-[35rem] h-[35rem] bg-indigo-100/30 dark:bg-indigo-900/10 rounded-full blur-[120px] -z-10 animate-pulse" style={{ animationDelay: '3s' }}></div>

      <div className="max-w-5xl space-y-8 py-10">
        <div className="flex flex-col items-center gap-4 animate-fade-in">
          <Brain3D />
          
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white/60 dark:bg-slate-900/40 border border-white dark:border-slate-800 text-indigo-600 dark:text-indigo-400 font-black text-xs uppercase tracking-widest shadow-xl">
              <i className="fa-solid fa-leaf text-emerald-500"></i>
              Học tập cân bằng cùng AI
            </div>
            <h1 className="text-6xl md:text-[7.5rem] font-black tracking-tighter text-slate-900 dark:text-white leading-[0.9] pb-6">
              <span className="inline-block transform hover:scale-105 transition-transform duration-500 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent px-2">
                MindStudy
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-500 dark:text-slate-400 font-bold max-w-2xl mx-auto leading-tight italic">
              "Khai phá tiềm năng - Làm chủ tri thức theo cách của riêng bạn"
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-8 pt-4">
          <button 
            onClick={onStart}
            className="px-16 py-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[2.5rem] font-black text-2xl shadow-[0_20px_60px_-15px_rgba(79,70,229,0.5)] transition-all hover:scale-105 active:scale-95 flex items-center gap-6 group"
          >
            Bắt đầu hành trình
            <i className="fa-solid fa-arrow-right group-hover:translate-x-3 transition-transform"></i>
          </button>
          
          <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.5em] animate-pulse">
            Scroll to discover more
          </p>
        </div>
      </div>

      <style>{`
        .animate-fade-in { animation: fadeIn 1.5s cubic-bezier(0.19, 1, 0.22, 1); }
        @keyframes fadeIn { 
          from { opacity: 0; transform: translateY(40px) scale(0.95); } 
          to { opacity: 1; transform: translateY(0) scale(1); } 
        }
      `}</style>
    </div>
  );
};

export default Hero;
