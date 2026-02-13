
import React from 'react';
import Brain3D from './Brain3D';

interface HeroProps {
  onStart: () => void;
}

const Hero: React.FC<HeroProps> = ({ onStart }) => {
  return (
    <div className="relative min-h-[85vh] flex flex-col items-center justify-center text-center px-6 overflow-hidden">
      {/* Decorative Floating Objects */}
      <div className="absolute top-[15%] left-[10%] w-32 h-32 glass rounded-[2rem] opacity-20 animate-float -z-5 hidden lg:block"></div>
      <div className="absolute bottom-[20%] right-[12%] w-40 h-40 glass rounded-full opacity-10 animate-float -z-5 hidden lg:block" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-[40%] right-[5%] w-24 h-24 glass rounded-3xl opacity-15 animate-float -z-5 hidden lg:block" style={{ animationDelay: '4s' }}></div>

      <div className="max-w-4xl space-y-6 py-6 relative z-10">
        <div className="flex flex-col items-center gap-2 animate-fade-in">
          <Brain3D />
          
          <div className="space-y-4 overflow-visible">
            <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white/20 dark:bg-slate-900/20 border border-white/20 dark:border-slate-800 text-indigo-600 dark:text-indigo-400 font-black text-xs uppercase tracking-widest shadow-xl backdrop-blur-md">
              <i className="fa-solid fa-sparkles text-amber-400"></i>
              Future of Personalized Learning
            </div>
            <h1 className="text-6xl md:text-[6.5rem] font-black tracking-tighter text-slate-900 dark:text-white leading-none pb-12 overflow-visible flex justify-center">
              <span className="inline-block transform hover:scale-105 transition-transform duration-700 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent px-10 py-4 drop-shadow-sm">
                MindStudy
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-500 dark:text-slate-400 font-bold max-w-2xl mx-auto leading-relaxed italic opacity-80">
              "Biến dữ liệu thành tri thức, biến đam mê thành lộ trình dẫn lối tương lai."
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-8 pt-6">
          <button 
            onClick={onStart}
            className="px-16 py-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[2rem] font-black text-2xl shadow-2xl transition-all hover:scale-105 active:scale-95 flex items-center gap-4 group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <span className="relative z-10">Bắt đầu hành trình</span>
            <i className="fa-solid fa-bolt relative z-10 group-hover:animate-pulse"></i>
          </button>
          
          <div className="pt-4">
             <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.5em] animate-pulse">
                Sản phẩm trí tuệ sáng tạo
             </p>
          </div>
        </div>
      </div>

      <style>{`
        .animate-fade-in { animation: fadeIn 2s cubic-bezier(0.19, 1, 0.22, 1); }
        @keyframes fadeIn { 
          from { opacity: 0; transform: translateY(60px); } 
          to { opacity: 1; transform: translateY(0); } 
        }
      `}</style>
    </div>
  );
};

export default Hero;
