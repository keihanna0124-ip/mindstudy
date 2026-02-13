
import React from 'react';

const ContactSection: React.FC = () => {
  const team = [
    { 
      name: 'Nguyễn Ngọc An Huyền', 
      role: 'Leader, Designer', 
      school: 'THPT Yên Viên',
      icon: 'fa-palette', 
      color: 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400' 
    },
    { 
      name: 'Ngô Hoàng Hà', 
      role: 'System Developer', 
      school: 'THPT Yên Viên',
      icon: 'fa-code', 
      color: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' 
    },
  ];

  return (
    <div className="max-w-6xl mx-auto py-24 space-y-24 animate-fade-in">
      <div className="text-center space-y-8">
        <h2 className="text-6xl md:text-7xl font-black tracking-tighter text-slate-900 dark:text-white leading-[0.8]">Team MindStudy</h2>
        <div className="w-24 h-3 bg-gradient-to-r from-indigo-500 to-pink-500 mx-auto rounded-full"></div>
        <p className="text-slate-500 dark:text-slate-400 text-2xl font-bold max-w-3xl mx-auto italic leading-relaxed">
          "Chúng tớ tin rằng sự sáng tạo và công nghệ có thể biến đổi cách chúng ta học tập mỗi ngày."
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {team.map((member, i) => (
          <div key={i} className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-3xl p-16 rounded-[5rem] shadow-2xl hover:shadow-indigo-200/50 dark:hover:shadow-indigo-900/20 transition-all flex flex-col items-center text-center gap-10 group border border-white/40 dark:border-slate-700 hover:-translate-y-4">
            <div className={`w-32 h-32 ${member.color} rounded-[3rem] flex items-center justify-center text-6xl shadow-inner group-hover:rotate-12 transition-transform duration-500`}>
              <i className={`fa-solid ${member.icon}`}></i>
            </div>
            <div className="space-y-4">
              <h3 className="text-5xl font-black text-slate-900 dark:text-white tracking-tight">{member.name}</h3>
              <p className="text-indigo-600 dark:text-indigo-400 font-black text-2xl uppercase tracking-[0.2em]">{member.role}</p>
              <div className="px-8 py-3 bg-slate-100 dark:bg-slate-900 rounded-full text-slate-400 font-black uppercase tracking-[0.3em] text-[12px] inline-block">
                {member.school}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-indigo-600 rounded-[5rem] p-16 md:p-24 text-center space-y-12 shadow-[0_40px_100px_-20px_rgba(79,70,229,0.4)] relative overflow-hidden group">
        {/* Glow effect */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-from)_0%,_transparent_70%)] from-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
        
        <div className="space-y-10 relative z-10">
          <div className="w-24 h-24 bg-white text-indigo-600 rounded-[2.5rem] flex items-center justify-center text-5xl mx-auto shadow-2xl animate-bounce">
            <i className="fa-solid fa-envelope"></i>
          </div>
          <div className="space-y-6">
            <p className="text-4xl md:text-6xl font-black text-white leading-[1] max-w-4xl mx-auto tracking-tight">
              Gửi yêu cầu hoặc góp ý cho chúng tớ qua Email
            </p>
            <div className="pt-8">
              <a 
                href="mailto:keihanna0124@gmail.com"
                className="text-3xl md:text-5xl font-black text-white hover:text-indigo-100 transition-all underline decoration-white/30 hover:decoration-white underline-offset-[16px] decoration-8 break-all"
              >
                keihanna0124@gmail.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactSection;
