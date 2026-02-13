
import React, { useState, useRef, useEffect } from 'react';
import { chatWithAssistant } from '../services/geminiService';

const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'ai', text: string, sources?: any[]}[]>([
    { role: 'ai', text: 'Chào bạn! Mình là MindStudy AI, bạn cần mình hỗ trợ gì không?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [useSearch, setUseSearch] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const result = await chatWithAssistant(userMsg, useSearch);
      setMessages(prev => [...prev, { role: 'ai', text: result.text, sources: result.sources }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'ai', text: 'Xin lỗi, mình đang gặp chút trục trặc kết nối.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[300]">
      {isOpen ? (
        <div className="w-[380px] h-[550px] bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl flex flex-col border border-indigo-100 dark:border-slate-700 animate-scale-up overflow-hidden">
          <div className="p-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex justify-between items-center">
            <div className="flex items-center gap-3">
              <i className="fa-solid fa-robot-astromech text-xl"></i>
              <span className="font-black">MindStudy Assistant</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="opacity-70 hover:opacity-100"><i className="fa-solid fa-xmark"></i></button>
          </div>

          <div ref={scrollRef} className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50 dark:bg-slate-900/50">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-2xl font-bold text-sm ${
                  m.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-800 shadow-sm text-slate-700 dark:text-slate-200'
                }`}>
                  {m.text}
                  {m.sources && m.sources.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                      <p className="text-[10px] text-slate-400 mb-1">Nguồn tham khảo:</p>
                      {m.sources.map((s: any, idx: number) => (
                        <a key={idx} href={s.web?.uri} target="_blank" className="block text-[10px] text-indigo-400 truncate hover:underline">
                          • {s.web?.title || s.web?.uri}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm space-y-2">
                   <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-75"></div>
                      <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-150"></div>
                   </div>
                   {useSearch && <p className="text-[10px] font-black text-indigo-500 uppercase">Đang tìm kiếm dữ liệu thực tế...</p>}
                </div>
              </div>
            )}
          </div>

          <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 space-y-3">
            <div className="flex items-center justify-between px-2">
               <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setUseSearch(!useSearch)}
                    className={`text-[9px] font-black uppercase px-2 py-1 rounded-full transition-all ${useSearch ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}
                  >
                    <i className="fa-solid fa-earth-americas mr-1"></i> Google Search
                  </button>
               </div>
            </div>
            <div className="flex gap-2">
              <input 
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Hỏi bất cứ điều gì..."
                className="flex-1 bg-slate-100 dark:bg-slate-900 p-3 rounded-xl outline-none font-bold text-sm dark:text-white"
              />
              <button onClick={handleSend} className="w-12 h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg hover:bg-indigo-700 transition-all">
                <i className="fa-solid fa-paper-plane"></i>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 bg-gradient-to-tr from-indigo-600 to-purple-600 text-white rounded-full shadow-2xl flex items-center justify-center text-2xl hover:scale-110 active:scale-95 transition-all animate-bounce"
        >
          <i className="fa-solid fa-comment-dots"></i>
        </button>
      )}
    </div>
  );
};

export default ChatBot;
