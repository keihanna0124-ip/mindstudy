
import React, { useState, useRef, useEffect } from 'react';
import { chatWithAssistant } from '../services/geminiService';

const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'ai', text: string, sources?: any[]}[]>([
    { role: 'ai', text: 'Xin chào! Mình là MindStudy GPT. Mình có thể hỗ trợ bạn giải bài tập, viết code hoặc tư vấn lộ trình học tập. Hãy đặt câu hỏi nhé!' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [useSearch, setUseSearch] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const result = await chatWithAssistant(userMsg, useSearch);
      setMessages(prev => [...prev, { role: 'ai', text: result.text, sources: result.sources }]);
    } catch (e: any) {
      let errorMsg = 'Rất tiếc, máy chủ đang bận xử lý dữ liệu. Bạn thử lại sau vài giây nhé!';
      if (e.message?.includes('429') || e.message?.toLowerCase().includes('quota')) {
        errorMsg = 'Hệ thống AI đang đạt giới hạn lượt dùng thử miễn phí. Vui lòng đợi khoảng 1 phút rồi đặt câu hỏi tiếp theo nhé! Cảm ơn bạn đã kiên nhẫn.';
      }
      setMessages(prev => [...prev, { role: 'ai', text: errorMsg }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-[300]">
      {isOpen ? (
        <div className="w-[450px] max-w-[90vw] h-[700px] max-h-[85vh] bg-white dark:bg-slate-900 rounded-[3rem] shadow-[0_30px_100px_rgba(0,0,0,0.3)] flex flex-col border border-indigo-100 dark:border-slate-800 animate-scale-up overflow-hidden ring-1 ring-white/10">
          {/* Header */}
          <div className="p-8 bg-slate-900 dark:bg-slate-800 text-white flex justify-between items-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 blur-[50px] rounded-full"></div>
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-12 h-12 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/20">
                 <i className="fa-solid fa-robot text-indigo-400"></i>
              </div>
              <div>
                 <h3 className="font-black text-lg tracking-tight">MindStudy GPT</h3>
                 <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                    <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Sẵn sàng hỗ trợ</p>
                 </div>
              </div>
            </div>
            <div className="flex items-center gap-2 relative z-10">
              <a 
                href="https://www.facebook.com/profile.php?id=61552134227973" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-indigo-600/20 flex items-center justify-center hover:bg-indigo-600 transition-all border border-indigo-500/30"
                title="Facebook Creator"
              >
                <i className="fa-brands fa-facebook-f text-white"></i>
              </a>
              <button onClick={() => setIsOpen(false)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/20 transition-all">
                 <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
          </div>

          {/* Chat Body */}
          <div ref={scrollRef} className="flex-1 p-8 overflow-y-auto space-y-6 bg-slate-50 dark:bg-slate-950/50">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-5 rounded-[2rem] font-bold text-sm leading-relaxed ${
                  m.role === 'user' 
                    ? 'bg-indigo-600 text-white shadow-xl rounded-tr-none' 
                    : 'bg-white dark:bg-slate-800 shadow-sm text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-700 rounded-tl-none'
                }`}>
                  {m.text}
                  {m.sources && m.sources.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                      <p className="text-[10px] text-slate-400 mb-2 uppercase tracking-widest font-black">Nguồn:</p>
                      <div className="space-y-1">
                        {m.sources.map((s: any, idx: number) => (
                          <a key={idx} href={s.web?.uri} target="_blank" className="block text-[10px] text-indigo-400 truncate hover:underline flex items-center gap-2">
                            <i className="fa-solid fa-link text-[8px]"></i> {s.web?.title || s.web?.uri}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-slate-800 p-5 rounded-[2rem] rounded-tl-none shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col gap-3">
                   <div className="flex gap-1.5">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce delay-150"></div>
                      <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce delay-300"></div>
                   </div>
                   <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest animate-pulse">
                      AI is thinking...
                   </p>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-6 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 space-y-4">
            <div className="flex items-center gap-4">
                <button 
                  onClick={() => setUseSearch(!useSearch)}
                  className={`flex-1 py-2 px-4 rounded-xl text-[9px] font-black uppercase transition-all flex items-center justify-center gap-2 border ${
                    useSearch 
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-600 shadow-sm' 
                      : 'bg-slate-50 border-slate-200 text-slate-400'
                  }`}
                >
                  <i className="fa-solid fa-globe"></i>
                  Google Search {useSearch ? 'On' : 'Off'}
                </button>
                <div className="flex-1 text-center">
                   <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">
                      Deep Learning Mode
                   </p>
                </div>
            </div>
            <div className="flex gap-3 items-center">
              <input 
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Nhập câu hỏi tại đây..."
                className="flex-1 bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl outline-none font-bold text-sm dark:text-white border border-transparent focus:border-indigo-500 transition-all shadow-inner"
              />
              <button 
                onClick={handleSend} 
                disabled={loading || !input.trim()}
                className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg hover:bg-indigo-700 disabled:opacity-50 transition-all transform active:scale-90"
              >
                <i className="fa-solid fa-paper-plane text-lg"></i>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
          className="w-20 h-20 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[2rem] shadow-[0_20px_50px_rgba(79,70,229,0.4)] flex items-center justify-center text-3xl hover:scale-110 active:scale-95 transition-all group overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <i className="fa-solid fa-robot relative z-10"></i>
          {/* Badge */}
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full border-4 border-slate-50 dark:border-slate-950 animate-bounce"></div>
        </button>
      )}
      <style>{`
        .animate-scale-up { animation: scaleUp 0.4s cubic-bezier(0.17, 0.67, 0.16, 0.99); }
        @keyframes scaleUp { from { transform: scale(0.85); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      `}</style>
    </div>
  );
};

export default ChatBot;
