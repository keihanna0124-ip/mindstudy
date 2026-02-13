
import React, { useState } from 'react';

interface OnboardingProps {
  onComplete: (name: string, email: string) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && email) {
      setStatus('loading');
      setTimeout(() => {
        setStatus('success');
      }, 1500);
    }
  };

  if (status === 'success') {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-xl animate-fade-in text-center">
        <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-[3rem] p-12 shadow-2xl border border-white/20 space-y-8 animate-scale-up">
           <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500 rounded-full flex items-center justify-center text-5xl mx-auto shadow-lg animate-bounce">
              <i className="fa-solid fa-paper-plane"></i>
           </div>
           <div className="space-y-4">
              <h2 className="text-3xl font-black text-slate-800 dark:text-white leading-tight">Tuyệt vời, {name}!</h2>
              <p className="text-slate-500 dark:text-slate-400 font-bold leading-relaxed">
                Bạn đã gia nhập cộng đồng MindStudy thành công. 
                <br />
                <span className="text-indigo-500 font-black">Một lộ trình riêng biệt</span> đang chờ đón bạn khám phá cùng <span className="text-slate-700 dark:text-white underline">{email}</span>.
              </p>
           </div>
           <button 
             onClick={() => onComplete(name, email)}
             className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-xl shadow-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-3"
           >
              Khám phá cùng chúng tớ <i className="fa-solid fa-arrow-right"></i>
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-xl animate-fade-in">
      <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-[3rem] p-10 shadow-2xl border border-white/20 space-y-8">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-pink-500 text-white rounded-2xl flex items-center justify-center text-3xl mx-auto shadow-lg animate-bounce">
            <i className="fa-solid fa-wand-magic-sparkles"></i>
          </div>
          <h2 className="text-3xl font-black text-slate-800 dark:text-white">Chào bạn mới!</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium italic">"Mọi hành trình vạn dặm đều bắt đầu từ một bước chân."</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Tên của bạn là gì?</label>
            <input 
              required
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: An Huyền"
              className="w-full p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border-none outline-none focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900 transition-all font-bold text-slate-700 dark:text-white"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Email nhận gợi ý học tập</label>
            <input 
              required
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              className="w-full p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border-none outline-none focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900 transition-all font-bold text-slate-700 dark:text-white"
            />
          </div>
          <button 
            type="submit"
            disabled={status === 'loading'}
            className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-xl shadow-xl hover:bg-indigo-700 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:bg-slate-400"
          >
            {status === 'loading' ? (
              <>
                <i className="fa-solid fa-circle-notch animate-spin"></i>
                Đang chuẩn bị...
              </>
            ) : (
              <>Bắt đầu ngay thôi!</>
            )}
          </button>
        </form>
        <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">✨ Privacy First • Smart AI • Nature Vibe</p>
      </div>
      <style>{`
        .animate-scale-up { animation: scaleUp 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
        @keyframes scaleUp { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      `}</style>
    </div>
  );
};

export default Onboarding;
