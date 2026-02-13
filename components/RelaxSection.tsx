
import React, { useState } from 'react';
import { INITIAL_RELAX_ACTIVITIES } from '../constants';
import { generateRelaxSuggestions } from '../services/geminiService';

const RelaxSection: React.FC = () => {
  const [selected, setSelected] = useState<string | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [stressSource, setStressSource] = useState('');

  const getAiHelp = async () => {
    if (!stressSource) return;
    setLoading(true);
    try {
      const suggestions = await generateRelaxSuggestions(stressSource);
      setAiSuggestions(suggestions);
    } catch (error) {
      setAiSuggestions("Hơi quá tải một chút, hãy thử hít thở sâu nhé!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="relax-section" className="max-w-6xl mx-auto space-y-16 py-8 animate-fade-in scroll-mt-24">
      <div className="text-center space-y-4">
        <h2 className="text-5xl font-bold tracking-tight text-slate-800">Cân Bằng Tâm Trí</h2>
        <p className="text-slate-500 max-w-xl mx-auto text-lg font-medium">
          Nghỉ ngơi không phải là dừng lại, mà là nạp năng lượng để đi xa hơn. 
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {INITIAL_RELAX_ACTIVITIES.map((activity) => (
          <div 
            key={activity.id}
            onClick={() => setSelected(activity.id)}
            className={`group p-10 rounded-[3rem] cursor-pointer transition-all border-4 ${
              selected === activity.id 
                ? 'bg-indigo-500 text-white border-indigo-200 scale-105 shadow-2xl' 
                : 'bg-white/60 backdrop-blur-sm border-white shadow-sm hover:shadow-xl hover:-translate-y-2'
            }`}
          >
            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-4xl mb-8 transition-all ${
              selected === activity.id ? 'bg-white/20 scale-110 rotate-6' : 'bg-indigo-50 text-indigo-500'
            }`}>
              <i className={`fa-solid ${activity.icon}`}></i>
            </div>
            <h3 className="text-2xl font-bold mb-4">{activity.title}</h3>
            <p className={`text-sm leading-relaxed font-medium ${selected === activity.id ? 'text-indigo-50' : 'text-slate-500'}`}>
              {activity.description}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-white/40 backdrop-blur-xl p-10 md:p-16 rounded-[4rem] border border-white/60 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row gap-12 items-center relative z-10">
          <div className="flex-1 space-y-8">
            <h3 className="text-4xl font-bold text-slate-800">Lời khuyên cho bạn</h3>
            <p className="text-slate-600 text-lg font-medium">Hãy cho chúng tớ biết bạn đang cảm thấy mệt mỏi hoặc nguyên nhân khiến bạn mệt mỏi:</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <input 
                value={stressSource}
                onChange={(e) => setStressSource(e.target.value)}
                placeholder="Chia sẻ với MindStudy..."
                className="flex-grow p-5 bg-white rounded-[2rem] border-none shadow-inner outline-none focus:ring-2 focus:ring-pink-400 text-lg"
              />
              <button 
                onClick={getAiHelp}
                disabled={loading || !stressSource}
                className="px-10 py-5 bg-pink-500 hover:bg-pink-600 disabled:bg-slate-300 text-white rounded-full font-bold text-lg transition-all shadow-xl active:scale-95 flex items-center gap-2"
              >
                {loading ? <i className="fa-solid fa-spinner animate-spin"></i> : <><i className="fa-solid fa-magic"></i> Tư vấn ngay</>}
              </button>
            </div>
          </div>
          
          {aiSuggestions && (
            <div className="flex-1 bg-white p-10 rounded-[3rem] shadow-2xl border border-pink-50 animate-fade-in">
              <div className="flex items-center gap-3 mb-6 text-pink-500 font-bold uppercase tracking-widest text-xs">
                <i className="fa-solid fa-heart"></i> Gợi ý thư giãn
              </div>
              <p className="text-slate-700 italic text-lg leading-relaxed whitespace-pre-line">{aiSuggestions}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RelaxSection;
