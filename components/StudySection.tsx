
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { StudyProfile, QuizResult, StudyPlan, LearningProgress, Flashcard, Reminder } from '../types';
import { generateDetailedStudyPlan, generateVividAudio } from '../services/geminiService';

// Audio decoding helper for PCM data from Gemini TTS
function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);
  return bytes;
}

async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
  }
  return buffer;
}

const QUIZ_QUESTIONS = [
  {
    q: "Môn học nào khiến bạn cảm thấy tràn đầy năng lượng nhất?",
    options: ["Toán học/Khoa học tự nhiên", "Ngữ văn/Ngoại ngữ", "Nghệ thuật/Thể chất", "Lịch sử/Địa lý"]
  },
  {
    q: "Thách thức lớn nhất bạn đang gặp phải khi tự học là gì?",
    options: ["Khó tập trung", "Thiếu tài liệu chuẩn", "Áp lực điểm số", "Không biết bắt đầu từ đâu"]
  },
  {
    q: "Môi trường học tập lý tưởng của bạn trông như thế nào?",
    options: ["Quán cafe chill, có nhạc nhẹ", "Thư viện yên tĩnh tuyệt đối", "Bàn học tại nhà, đầy đủ đồ decor", "Học nhóm cùng bạn bè"]
  },
  {
    q: "Bạn thấy mình tỉnh táo và tiếp thu kiến thức tốt nhất vào lúc nào?",
    options: ["Sáng sớm tinh mơ", "Buổi chiều sau khi ngủ dậy", "Tối muộn khi mọi người đã ngủ", "Bất cứ khi nào có cảm hứng"]
  },
  {
    q: "Cách bạn thường ghi chép kiến thức là gì?",
    options: ["Ghi chép truyền thống vào vở", "Dùng MindMap, sơ đồ", "Gõ máy tính, Notion/Evernote", "Chỉ nghe và ghi nhớ key words"]
  },
  {
    q: "Mục tiêu điểm số/thành tích bạn đang hướng tới là?",
    options: ["Top đầu của lớp/trường", "Cải thiện từng chút một", "Vượt qua kỳ thi quan trọng", "Chỉ cần hiểu sâu kiến thức"]
  },
  {
    q: "Điều gì thường khiến bạn dễ bị xao nhãng nhất?",
    options: ["Điện thoại/Mạng xã hội", "Tiếng ồn xung quanh", "Suy nghĩ vẩn vơ", "Cảm giác mệt mỏi/buồn ngủ"]
  },
  {
    q: "Bạn muốn MindStudy AI đóng vai trò gì cho bạn?",
    options: ["Một 'Gia sư' nghiêm khắc", "Một 'Người bạn' đồng hành tâm lý", "Một 'Chiến lược gia' phân tích dữ liệu", "Một 'Người truyền cảm hứng'"]
  }
];

const StudySection: React.FC<{ onRelaxClick: () => void }> = ({ onRelaxClick }) => {
  const [activeTab, setActiveTab] = useState<'roadmap' | 'progress' | 'flashcards' | 'pomodoro' | 'reminders'>('roadmap');
  const [step, setStep] = useState<'form' | 'quiz' | 'result'>('form');
  const [currentQuizStep, setCurrentQuizStep] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [userName, setUserName] = useState('');
  
  const [profile, setProfile] = useState<StudyProfile>({
    grade: '', strengths: '', weaknesses: '', challenges: '', goals: '', focusTime: '4', sleepDuration: '7'
  });
  const [plan, setPlan] = useState<StudyPlan | null>(null);

  // Reminders
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [newReminder, setNewReminder] = useState({ task: '', time: '', frequency: 'Daily' as any });

  // Pomodoro
  const [pomoTime, setPomoTime] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [pomoMode, setPomoMode] = useState<'study' | 'break'>('study');
  const [pomoOption, setPomoOption] = useState({ study: 25, break: 5 });
  const timerRef = useRef<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem('mindstudy_user');
    if (saved) setUserName(JSON.parse(saved).name);
    
    if (isActive && pomoTime > 0) {
      timerRef.current = setInterval(() => setPomoTime((prev) => prev - 1), 1000);
    } else if (pomoTime === 0) {
      setIsActive(false);
      clearInterval(timerRef.current);
      if (pomoMode === 'study') { setPomoMode('break'); setPomoTime(pomoOption.break * 60); }
      else { setPomoMode('study'); setPomoTime(pomoOption.study * 60); }
    }
    return () => clearInterval(timerRef.current);
  }, [isActive, pomoTime, pomoMode, pomoOption.break, pomoOption.study]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => { setIsActive(false); setPomoTime(pomoMode === 'study' ? pomoOption.study * 60 : pomoOption.break * 60); };

  // Achievements
  const [progressList, setProgressList] = useState<LearningProgress[]>([]);
  const [newEntry, setNewEntry] = useState({ subject: '', date: '', score: '', icon: 'fa-star' });

  // Flashcards
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [newCard, setNewCard] = useState({ front: '', back: '', setName: 'Chung' });
  const [currentFlashIndex, setCurrentFlashIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedSet, setSelectedSet] = useState('Tất cả');

  const sets = useMemo(() => {
    const s = new Set(flashcards.map(c => c.setName));
    return ['Tất cả', ...Array.from(s)];
  }, [flashcards]);

  const filteredCards = useMemo(() => {
    return selectedSet === 'Tất cả' ? flashcards : flashcards.filter(c => c.setName === selectedSet);
  }, [flashcards, selectedSet]);

  const handleQuizAnswer = (answer: string) => {
    const newAnswers = [...quizAnswers, answer];
    setQuizAnswers(newAnswers);
    if (currentQuizStep < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuizStep(currentQuizStep + 1);
    } else {
      finalizePlan(newAnswers);
    }
  };

  const handleCreatePodcastAudio = async () => {
    if (!plan || isGeneratingAudio) return;
    setIsGeneratingAudio(true);
    try {
      const summaryText = `Xin chào ${userName}. MindStudy AI đã thiết kế xong giải pháp cho bạn. ${plan.summary}. ${plan.advice}. Cuối cùng, hãy ghi nhớ câu danh ngôn này: ${plan.motivationalQuote}. Chúc bạn học tập thật tốt!`;
      const base64 = await generateVividAudio(summaryText);
      if (base64) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const audioContext = new AudioCtx({ sampleRate: 24000 });
        const decodedBytes = decodeBase64(base64);
        const audioBuffer = await decodeAudioData(decodedBytes, audioContext, 24000, 1);
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        source.start();
      }
    } catch (e) {
      console.error("Audio error:", e);
      if ('speechSynthesis' in window) {
        const u = new SpeechSynthesisUtterance(plan.summary);
        u.lang = 'vi-VN';
        window.speechSynthesis.speak(u);
      }
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  const finalizePlan = async (answers: string[]) => {
    setLoading(true);
    try {
      const quizResult: QuizResult = { 
        focusLevel: answers[1], 
        stamina: profile.focusTime, 
        style: answers[4] 
      };
      const result = await generateDetailedStudyPlan(profile, quizResult, isThinking);
      setPlan(result);
      setStep('result');
    } catch (e) { alert("Lỗi kết nối AI"); }
    finally { setLoading(false); }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="max-w-6xl mx-auto py-10 space-y-12 animate-fade-in relative">
      <div className="flex flex-wrap justify-center bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl p-2 rounded-[3rem] shadow-2xl border border-white/20 max-w-3xl mx-auto gap-2">
        {[
          { id: 'roadmap', label: 'Lộ trình', icon: 'fa-route' },
          { id: 'pomodoro', label: 'Tập trung', icon: 'fa-stopwatch' },
          { id: 'reminders', label: 'Nhắc nhở', icon: 'fa-bell' },
          { id: 'progress', label: 'Kỷ lục', icon: 'fa-trophy' },
          { id: 'flashcards', label: 'Thẻ bài', icon: 'fa-clone' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 py-4 px-6 rounded-[2.5rem] font-black text-xs transition-all flex items-center justify-center gap-3 ${
              activeTab === tab.id ? 'bg-indigo-600 text-white shadow-xl scale-105' : 'text-slate-400 hover:bg-white/20 dark:hover:bg-slate-800/40'
            }`}
          >
            <i className={`fa-solid ${tab.icon}`}></i>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {activeTab === 'roadmap' && (
        <div className="space-y-12">
          {step === 'form' && (
            <div className="bg-white/70 dark:bg-slate-800/70 p-12 rounded-[4rem] shadow-2xl border border-white dark:border-slate-700 space-y-12 animate-fade-in">
              <div className="text-center space-y-4">
                <h2 className="text-4xl font-black text-slate-800 dark:text-white">Kiến tạo hành trình học tập</h2>
                <div className="flex items-center justify-center gap-6 p-2 bg-slate-100 dark:bg-slate-900/80 w-fit mx-auto rounded-full px-6">
                  <span className={`text-[10px] font-black uppercase tracking-widest ${isThinking ? 'text-slate-400' : 'text-indigo-500'}`}>Standard</span>
                  <button onClick={() => setIsThinking(!isThinking)} className={`w-14 h-7 rounded-full relative transition-all ${isThinking ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`}>
                    <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${isThinking ? 'right-1' : 'left-1'}`}></div>
                  </button>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${isThinking ? 'text-indigo-500' : 'text-slate-400'}`}>Deep Think</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Thông tin cơ bản</label>
                   <input placeholder="Lớp học của bạn" value={profile.grade} onChange={e => setProfile({...profile, grade: e.target.value})} className="w-full p-5 rounded-3xl bg-white dark:bg-slate-900 border-none outline-none font-bold dark:text-white shadow-inner" />
                   <input placeholder="Môn bạn giỏi nhất" value={profile.strengths} onChange={e => setProfile({...profile, strengths: e.target.value})} className="w-full p-5 rounded-3xl bg-white dark:bg-slate-900 border-none outline-none font-bold dark:text-white shadow-inner" />
                   <input placeholder="Môn bạn cần cải thiện" value={profile.weaknesses} onChange={e => setProfile({...profile, weaknesses: e.target.value})} className="w-full p-5 rounded-3xl bg-white dark:bg-slate-900 border-2 border-red-50 dark:border-red-900/10 outline-none font-bold dark:text-white shadow-inner" />
                </div>
                <div className="space-y-4">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Thách thức & Mục tiêu</label>
                   <input placeholder="Khó khăn lớn nhất" value={profile.challenges} onChange={e => setProfile({...profile, challenges: e.target.value})} className="w-full p-5 rounded-3xl bg-white dark:bg-slate-900 border-none outline-none font-bold dark:text-white shadow-inner" />
                   <textarea placeholder="Bạn muốn đạt được gì?" value={profile.goals} onChange={e => setProfile({...profile, goals: e.target.value})} className="w-full p-5 rounded-3xl bg-white dark:bg-slate-900 border-none outline-none font-bold dark:text-white shadow-inner h-[120px]" />
                </div>
                
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-10 bg-emerald-50/50 dark:bg-emerald-900/10 p-10 rounded-[3rem] border border-emerald-100 dark:border-emerald-800/30">
                   <div className="space-y-6">
                      <div className="flex justify-between items-center">
                         <label className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase">Khả năng tập trung</label>
                         <span className="bg-emerald-600 text-white px-4 py-1 rounded-full text-xs font-black">{profile.focusTime}h</span>
                      </div>
                      <input type="range" min="1" max="14" value={profile.focusTime} onChange={e => setProfile({...profile, focusTime: e.target.value})} className="w-full h-2 bg-emerald-200 rounded-lg appearance-none cursor-pointer accent-emerald-600" />
                   </div>
                   <div className="space-y-6">
                      <div className="flex justify-between items-center">
                         <label className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase">Thời gian ngủ</label>
                         <span className="bg-indigo-600 text-white px-4 py-1 rounded-full text-xs font-black">{profile.sleepDuration}h</span>
                      </div>
                      <input type="range" min="3" max="12" value={profile.sleepDuration} onChange={e => setProfile({...profile, sleepDuration: e.target.value})} className="w-full h-2 bg-indigo-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
                   </div>
                </div>
              </div>
              
              <button onClick={() => setStep('quiz')} className="w-full py-8 bg-indigo-600 text-white rounded-[3rem] font-black text-3xl shadow-2xl hover:bg-indigo-700 transition-all">
                 Bắt đầu bài Test <i className="fa-solid fa-bolt ml-2"></i>
              </button>
            </div>
          )}

          {step === 'quiz' && (
            <div className="bg-white/90 dark:bg-slate-800/90 p-12 rounded-[4rem] shadow-2xl border border-white dark:border-slate-700 space-y-12 animate-fade-in min-h-[600px] flex flex-col items-center justify-center relative overflow-hidden">
               <div className="absolute top-0 left-0 h-2 bg-emerald-500 transition-all duration-500" style={{ width: `${((currentQuizStep + 1) / QUIZ_QUESTIONS.length) * 100}%` }}></div>
               
               <div className="text-center space-y-6 w-full max-w-2xl">
                  <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em]">Câu hỏi {currentQuizStep + 1} / {QUIZ_QUESTIONS.length}</span>
                  <h3 className="text-4xl font-black text-slate-800 dark:text-white leading-tight">{QUIZ_QUESTIONS[currentQuizStep].q}</h3>
                  
                  <div className="grid grid-cols-1 gap-4 pt-10">
                     {QUIZ_QUESTIONS[currentQuizStep].options.map((opt, i) => (
                       <button 
                         key={i} 
                         onClick={() => handleQuizAnswer(opt)}
                         className="p-6 bg-slate-50 dark:bg-slate-900 hover:bg-indigo-600 hover:text-white rounded-[2rem] font-bold text-lg shadow-sm border border-slate-100 dark:border-slate-700 transition-all active:scale-95 text-center"
                       >
                         {opt}
                       </button>
                     ))}
                  </div>
               </div>
               
               {loading && (
                 <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex flex-col items-center justify-center z-50">
                    <div className="w-24 h-24 border-8 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-8"></div>
                    <p className="text-2xl font-black text-slate-800 dark:text-white animate-pulse">MindStudy AI đang phân tích...</p>
                    <p className="text-slate-400 font-bold mt-2 italic text-sm">Chỉ mất vài giây để kiến tạo lộ trình của bạn</p>
                 </div>
               )}
            </div>
          )}

          {step === 'result' && plan && (
            <div className="space-y-12 animate-fade-in pb-20">
              {/* Generalized Solution & AI Podcast (NotebookLM style) */}
              <div className="bg-white/80 dark:bg-slate-800/80 p-12 rounded-[5rem] shadow-2xl border-4 border-indigo-100 dark:border-slate-700 text-center space-y-10 nature-card relative overflow-hidden">
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-100/50 dark:bg-emerald-900/10 rounded-full blur-3xl -z-10"></div>
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-100/50 dark:bg-indigo-900/10 rounded-full blur-3xl -z-10"></div>

                <div className="space-y-4">
                  <div className="w-20 h-20 bg-indigo-600 text-white rounded-[2.5rem] flex items-center justify-center text-4xl mx-auto shadow-2xl animate-pulse">
                     <i className="fa-solid fa-podcast"></i>
                  </div>
                  <h3 className="text-4xl md:text-5xl font-black italic text-slate-900 dark:text-white leading-[1.1]">"{plan.motivationalQuote}"</h3>
                </div>

                <div className="max-w-4xl mx-auto p-10 bg-indigo-50/40 dark:bg-slate-900/40 rounded-[3rem] border border-white dark:border-slate-700 shadow-inner space-y-6">
                   <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest text-xs">Giải pháp đề xuất</p>
                   <p className="text-xl font-bold text-slate-600 dark:text-slate-300 leading-relaxed italic">{plan.summary}</p>
                </div>

                <div className="flex flex-col md:flex-row justify-center gap-6 pt-6">
                   <button 
                     onClick={handleCreatePodcastAudio} 
                     disabled={isGeneratingAudio}
                     className="px-16 py-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-black text-2xl shadow-2xl flex items-center justify-center gap-6 transition-all hover:scale-105"
                   >
                      {isGeneratingAudio ? <i className="fa-solid fa-circle-notch animate-spin"></i> : <i className="fa-solid fa-play"></i>}
                      {isGeneratingAudio ? "Đang tạo Podcast..." : "Nghe giải pháp Podcast"}
                   </button>
                   <button onClick={() => setStep('form')} className="px-12 py-6 bg-white dark:bg-slate-700 text-slate-500 dark:text-white rounded-full font-black text-lg border border-slate-100 dark:border-slate-600 shadow-sm">Thử lại</button>
                </div>
              </div>

              {/* Roadmap MindMap Visualization */}
              <div className="relative pt-10">
                <div className="absolute top-1/2 left-0 right-0 h-2 bg-indigo-100 dark:bg-slate-800 -translate-y-1/2 hidden lg:block -z-10 rounded-full"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                   {plan.roadmap.map((node, i) => (
                     <div key={i} className="bg-white dark:bg-slate-800 p-10 rounded-[4rem] shadow-2xl border-t-8 border-indigo-500 flex flex-col items-center text-center gap-6 group hover:-translate-y-4 transition-all nature-card">
                        <div className="w-16 h-16 bg-indigo-50 dark:bg-slate-900 text-indigo-600 rounded-[2rem] flex items-center justify-center text-3xl font-black shadow-inner group-hover:rotate-12 transition-transform">
                          {i+1}
                        </div>
                        <h4 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">{node.title}</h4>
                        <p className="text-sm font-bold text-slate-400 leading-relaxed italic">"{node.content}"</p>
                     </div>
                   ))}
                </div>
              </div>
              
              <div className="bg-emerald-500 rounded-[4rem] p-16 text-center space-y-8 shadow-3xl animate-bounce cursor-pointer group" onClick={onRelaxClick}>
                 <p className="text-4xl md:text-5xl font-black text-white flex items-center justify-center gap-6">
                    <i className="fa-solid fa-leaf"></i> Cảm thấy áp lực? Hãy Chill nào!
                 </p>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'pomodoro' && (
        <div className="max-w-4xl mx-auto space-y-12 animate-fade-in text-center pb-20">
           <div className="bg-white/80 dark:bg-slate-800/80 p-20 rounded-[5rem] shadow-2xl border border-white dark:border-slate-700 space-y-16">
              <div className="space-y-4">
                 <h2 className="text-4xl font-black text-slate-900 dark:text-white">{pomoMode === 'study' ? 'Giờ làm việc sâu' : 'Giờ nghỉ ngơi'}</h2>
                 <p className="text-slate-400 font-black tracking-widest uppercase text-xs">Tập trung tuyệt đối • Phút : Giây</p>
              </div>
              <div className="text-[12rem] md:text-[15rem] font-black text-slate-900 dark:text-white leading-none tracking-tighter tabular-nums drop-shadow-2xl">{formatTime(pomoTime)}</div>
              <div className="flex justify-center gap-8">
                 <button onClick={toggleTimer} className={`px-24 py-10 rounded-[4rem] font-black text-4xl shadow-2xl transition-all ${isActive ? 'bg-red-500 text-white' : 'bg-indigo-600 text-white'}`}>
                   {isActive ? 'Dừng' : 'Bắt đầu'}
                 </button>
                 <button onClick={resetTimer} className="w-28 h-28 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center text-4xl text-slate-400 hover:text-indigo-600 transition-all"><i className="fa-solid fa-rotate-right"></i></button>
              </div>
              <div className="flex flex-wrap justify-center gap-4 pt-10">
                 {[{ label: 'Pomodoro', study: 25, break: 5 }, { label: 'Deep Work', study: 45, break: 10 }, { label: 'Siêu tốc', study: 15, break: 3 }].map(opt => (
                   <button key={opt.label} onClick={() => { setPomoOption({study: opt.study, break: opt.break}); setPomoTime(opt.study*60); setIsActive(false); }} className={`px-8 py-4 rounded-[2rem] font-black text-sm transition-all ${pomoOption.study === opt.study ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-900 text-slate-500'}`}>
                      {opt.label}
                   </button>
                 ))}
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default StudySection;
