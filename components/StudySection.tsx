
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
  { q: "Môn học nào khiến bạn cảm thấy tràn đầy năng lượng nhất?", options: ["Toán học/Khoa học tự nhiên", "Ngữ văn/Ngoại ngữ", "Nghệ thuật/Thể chất", "Lịch sử/Địa lý"] },
  { q: "Thách thức lớn nhất bạn đang gặp phải khi tự học là gì?", options: ["Khó tập trung", "Thiếu tài liệu chuẩn", "Áp lực điểm số", "Không biết bắt đầu từ đâu"] },
  { q: "Môi trường học tập lý tưởng của bạn trông như thế nào?", options: ["Quán cafe chill, có nhạc nhẹ", "Thư viện yên tĩnh tuyệt đối", "Bàn học tại nhà, đầy đủ đồ decor", "Học nhóm cùng bạn bè"] },
  { q: "Bạn thấy mình tỉnh táo và tiếp thu kiến thức tốt nhất vào lúc nào?", options: ["Sáng sớm tinh mơ", "Buổi chiều sau khi ngủ dậy", "Tối muộn khi mọi người đã ngủ", "Bất cứ khi nào có cảm hứng"] },
  { q: "Cách bạn thường ghi chép kiến thức là gì?", options: ["Ghi chép truyền thống vào vở", "Dùng MindMap, sơ đồ", "Gõ máy tính, Notion/Evernote", "Chỉ nghe và ghi nhớ key words"] },
  { q: "Mục tiêu điểm số/thành tích bạn đang hướng tới là?", options: ["Top đầu của lớp/trường", "Cải thiện từng chút một", "Vượt qua kỳ thi quan trọng", "Chỉ cần hiểu sâu kiến thức"] },
  { q: "Điều gì thường khiến bạn dễ bị xao nhãng nhất?", options: ["Điện thoại/Mạng xã hội", "Tiếng ồn xung quanh", "Suy nghĩ vẩn vơ", "Cảm giác mệt mỏi/buồn ngủ"] },
  { q: "Bạn muốn MindStudy AI đóng vai trò gì cho bạn?", options: ["Một 'Gia sư' nghiêm khắc", "Một 'Người bạn' đồng hành tâm lý", "Một 'Chiến lược gia' phân tích dữ liệu", "Một 'Người truyền cảm hứng'"] }
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
  const [userEmail, setUserEmail] = useState('');
  
  const [profile, setProfile] = useState<StudyProfile>({
    grade: '', strengths: '', weaknesses: '', challenges: '', goals: '', focusTime: '4', sleepDuration: '7'
  });
  const [plan, setPlan] = useState<StudyPlan | null>(null);

  // Reminders
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [newReminder, setNewReminder] = useState({ task: '', time: '' });

  // Pomodoro
  const [pomoOption, setPomoOption] = useState({ study: 25, break: 5 });
  const [pomoTime, setPomoTime] = useState(pomoOption.study * 60);
  const [isActive, setIsActive] = useState(false);
  const [pomoMode, setPomoMode] = useState<'study' | 'break'>('study');
  const timerRef = useRef<any>(null);

  // Achievements
  const [progressList, setProgressList] = useState<LearningProgress[]>([]);
  const [newEntry, setNewEntry] = useState({ subject: '', date: new Date().toISOString().split('T')[0], score: '', icon: 'fa-star' });

  // Flashcards
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [newCard, setNewCard] = useState({ front: '', back: '', setName: '' });
  const [currentFlashIndex, setCurrentFlashIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedSet, setSelectedSet] = useState('Tất cả');

  useEffect(() => {
    const saved = localStorage.getItem('mindstudy_user');
    if (saved) {
      const data = JSON.parse(saved);
      setUserName(data.name);
      setUserEmail(data.email);
    }
  }, []);

  // Pomodoro Logic Fixed
  useEffect(() => {
    if (isActive && pomoTime > 0) {
      timerRef.current = setInterval(() => {
        setPomoTime((prev) => prev - 1);
      }, 1000);
    } else if (pomoTime === 0) {
      setIsActive(false);
      clearInterval(timerRef.current);
      if (pomoMode === 'study') {
        alert("Tuyệt vời! Thời gian làm việc kết thúc. Hãy nghỉ ngơi một chút.");
        setPomoMode('break');
        setPomoTime(pomoOption.break * 60);
      } else {
        alert("Thời gian nghỉ kết thúc! Quay lại làm việc thôi nào.");
        setPomoMode('study');
        setPomoTime(pomoOption.study * 60);
      }
    }
    return () => clearInterval(timerRef.current);
  }, [isActive, pomoTime, pomoMode, pomoOption]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    clearInterval(timerRef.current);
    setPomoTime(pomoMode === 'study' ? pomoOption.study * 60 : pomoOption.break * 60);
  };

  const selectPomoPreset = (study: number, b: number) => {
    setIsActive(false);
    setPomoOption({ study, break: b });
    setPomoMode('study');
    setPomoTime(study * 60);
  };

  const handleQuizAnswer = (answer: string) => {
    const newAnswers = [...quizAnswers, answer];
    setQuizAnswers(newAnswers);
    if (currentQuizStep < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuizStep(currentQuizStep + 1);
    } else {
      finalizePlan(newAnswers);
    }
  };

  const finalizePlan = async (answers: string[]) => {
    setLoading(true);
    try {
      const result = await generateDetailedStudyPlan(profile, answers, isThinking);
      setPlan(result);
      setStep('result');
    } catch (e: any) { 
      console.error("AI Error:", e);
      if (e.message?.toLowerCase().includes("quota") || e.message?.includes("429")) {
        alert("MindStudy AI đang đạt giới hạn lượt dùng thử. Vui lòng quay lại sau ít phút nhé!");
      } else {
        alert("Lỗi kết nối AI. Vui lòng thử lại sau."); 
      }
    }
    finally { setLoading(false); }
  };

  const handleCreatePodcastAudio = async () => {
    if (!plan || isGeneratingAudio) return;
    setIsGeneratingAudio(true);
    try {
      const summaryText = `Chào ${userName}! Lắng nghe lộ trình cá nhân hóa của bạn từ MindStudy. ${plan.summary}. ${plan.advice}. Nhớ lấy thông điệp này: ${plan.motivationalQuote}.`;
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
      if ('speechSynthesis' in window) {
        const u = new SpeechSynthesisUtterance(plan.summary);
        u.lang = 'vi-VN';
        window.speechSynthesis.speak(u);
      }
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const addReminder = () => {
    if (newReminder.task && newReminder.time) {
      const rem: Reminder = {
        id: Date.now().toString(),
        task: newReminder.task,
        time: newReminder.time,
        frequency: 'Daily',
        isActive: true,
        color: 'bg-indigo-500'
      };
      setReminders([rem, ...reminders]);
      setNewReminder({ task: '', time: '' });
      alert(`Đã đặt nhắc nhở! Chúng tớ sẽ gửi thông báo tới email ${userEmail} vào lúc ${newReminder.time}`);
    }
  };

  const addEntry = () => {
    if (newEntry.subject && newEntry.score) {
      const entry: LearningProgress = {
        id: Date.now().toString(),
        subject: newEntry.subject,
        score: Number(newEntry.score),
        date: newEntry.date,
        icon: newEntry.icon
      };
      setProgressList([entry, ...progressList]);
      setNewEntry({ subject: '', date: new Date().toISOString().split('T')[0], score: '', icon: 'fa-star' });
    }
  };

  const sets = useMemo(() => {
    const s = new Set(flashcards.map(c => c.setName || 'Chung'));
    return ['Tất cả', ...Array.from(s)];
  }, [flashcards]);

  const filteredCards = useMemo(() => {
    return selectedSet === 'Tất cả' ? flashcards : flashcards.filter(c => (c.setName || 'Chung') === selectedSet);
  }, [flashcards, selectedSet]);

  const icons = ["fa-star", "fa-trophy", "fa-medal", "fa-award", "fa-fire", "fa-bolt", "fa-brain"];

  return (
    <div className="max-w-6xl mx-auto py-6 space-y-8 animate-fade-in relative">
      {/* Tabs Navigation */}
      <div className="flex flex-wrap justify-center bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl p-2 rounded-3xl shadow-xl border border-white/20 max-w-4xl mx-auto gap-1">
        {[
          { id: 'roadmap', label: 'Lộ trình', icon: 'fa-route' },
          { id: 'pomodoro', label: 'Tập trung', icon: 'fa-stopwatch' },
          { id: 'reminders', label: 'Nhắc nhở', icon: 'fa-bell' },
          { id: 'progress', label: 'Kỷ lục', icon: 'fa-trophy' },
          { id: 'flashcards', label: 'Flashcard', icon: 'fa-clone' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 py-3 px-4 rounded-2xl font-black text-[11px] uppercase transition-all flex items-center justify-center gap-2 ${
              activeTab === tab.id ? 'bg-indigo-600 text-white shadow-xl scale-105' : 'text-slate-400 hover:bg-white/20'
            }`}
          >
            <i className={`fa-solid ${tab.icon} text-xs`}></i>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {activeTab === 'roadmap' && (
        <div className="space-y-12">
          {step === 'form' && (
            <div className="bg-white/70 dark:bg-slate-800/70 p-8 md:p-12 rounded-[3rem] shadow-2xl border border-white dark:border-slate-700 space-y-10 animate-fade-in">
              <div className="text-center space-y-4">
                <h2 className="text-3xl font-black text-slate-800 dark:text-white leading-tight overflow-visible pb-12">Thiết kế lộ trình cho {userName}</h2>
                <div className="flex items-center justify-center gap-4 p-2 bg-slate-100 dark:bg-slate-900/80 w-fit mx-auto rounded-full px-5">
                  <span className={`text-[10px] font-black uppercase ${isThinking ? 'text-slate-400' : 'text-indigo-500'}`}>Tốc độ</span>
                  <button onClick={() => setIsThinking(!isThinking)} className={`w-12 h-6 rounded-full relative transition-all ${isThinking ? 'bg-indigo-600' : 'bg-slate-200'}`}>
                    <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all ${isThinking ? 'right-0.5' : 'left-0.5'}`}></div>
                  </button>
                  <span className={`text-[10px] font-black uppercase ${isThinking ? 'text-indigo-500' : 'text-slate-400'}`}>Chuyên sâu</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                   <input placeholder="Lớp (VD: 12)" value={profile.grade} onChange={e => setProfile({...profile, grade: e.target.value})} className="w-full p-5 rounded-2xl bg-white dark:bg-slate-900 border-none outline-none font-bold shadow-inner" />
                   <input placeholder="Môn thế mạnh" value={profile.strengths} onChange={e => setProfile({...profile, strengths: e.target.value})} className="w-full p-5 rounded-2xl bg-white dark:bg-slate-900 border-none outline-none font-bold shadow-inner" />
                   <input placeholder="Môn cần cải thiện" value={profile.weaknesses} onChange={e => setProfile({...profile, weaknesses: e.target.value})} className="w-full p-5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-red-50 outline-none font-bold shadow-inner" />
                </div>
                <div className="space-y-4">
                   <input placeholder="Thách thức lớn nhất?" value={profile.challenges} onChange={e => setProfile({...profile, challenges: e.target.value})} className="w-full p-5 rounded-2xl bg-white dark:bg-slate-900 border-none outline-none font-bold shadow-inner" />
                   <textarea placeholder="Mục tiêu mong muốn?" value={profile.goals} onChange={e => setProfile({...profile, goals: e.target.value})} className="w-full p-5 rounded-2xl bg-white dark:bg-slate-900 border-none outline-none font-bold shadow-inner h-[120px]" />
                </div>
                
                {/* Sliders Restored */}
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-10 bg-emerald-50/40 dark:bg-emerald-900/10 p-10 rounded-[2.5rem] border border-emerald-100">
                   <div className="space-y-6">
                      <div className="flex justify-between items-center px-2">
                         <label className="text-xs font-black text-emerald-600 uppercase">Khả năng bền bỉ</label>
                         <span className="bg-emerald-600 text-white px-4 py-1 rounded-full text-[10px] font-black">{profile.focusTime}h học tập</span>
                      </div>
                      <input type="range" min="1" max="14" value={profile.focusTime} onChange={e => setProfile({...profile, focusTime: e.target.value})} className="w-full h-2 bg-emerald-200 rounded-lg appearance-none cursor-pointer accent-emerald-600" />
                   </div>
                   <div className="space-y-6">
                      <div className="flex justify-between items-center px-2">
                         <label className="text-xs font-black text-indigo-600 uppercase">Năng lượng giấc ngủ</label>
                         <span className="bg-indigo-600 text-white px-4 py-1 rounded-full text-[10px] font-black">{profile.sleepDuration}h ngủ</span>
                      </div>
                      <input type="range" min="3" max="12" value={profile.sleepDuration} onChange={e => setProfile({...profile, sleepDuration: e.target.value})} className="w-full h-2 bg-indigo-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
                   </div>
                </div>
              </div>
              
              <button onClick={() => setStep('quiz')} className="w-full py-6 bg-indigo-600 text-white rounded-3xl font-black text-2xl shadow-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-4">
                 Bắt đầu Mini-test <i className="fa-solid fa-bolt"></i>
              </button>
            </div>
          )}

          {step === 'quiz' && (
            <div className="bg-white/90 dark:bg-slate-800/90 p-8 md:p-12 rounded-[3rem] shadow-2xl border border-white dark:border-slate-700 space-y-10 animate-fade-in min-h-[500px] flex flex-col items-center justify-center relative overflow-hidden">
               <div className="absolute top-0 left-0 h-1 bg-emerald-500 transition-all duration-500" style={{ width: `${((currentQuizStep + 1) / QUIZ_QUESTIONS.length) * 100}%` }}></div>
               <div className="text-center space-y-6 w-full max-w-2xl">
                  <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Câu hỏi {currentQuizStep + 1} / {QUIZ_QUESTIONS.length}</span>
                  <h3 className="text-3xl font-black text-slate-800 dark:text-white leading-tight">{QUIZ_QUESTIONS[currentQuizStep].q}</h3>
                  <div className="grid grid-cols-1 gap-3 pt-8">
                     {QUIZ_QUESTIONS[currentQuizStep].options.map((opt, i) => (
                       <button key={i} onClick={() => handleQuizAnswer(opt)} className="p-5 bg-slate-50 dark:bg-slate-900 hover:bg-indigo-600 hover:text-white rounded-2xl font-bold text-base shadow-sm transition-all active:scale-95">{opt}</button>
                     ))}
                  </div>
               </div>
               {loading && (
                 <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex flex-col items-center justify-center z-50">
                    <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-6"></div>
                    <p className="text-xl font-black animate-pulse">MindStudy đang dệt lộ trình...</p>
                 </div>
               )}
            </div>
          )}

          {step === 'result' && plan && (
            <div className="space-y-10 animate-fade-in pb-20">
              <div className="bg-white/80 dark:bg-slate-800/80 p-8 md:p-12 rounded-[3rem] shadow-2xl border-4 border-indigo-100 dark:border-slate-700 text-center space-y-8 nature-card">
                <h3 className="text-2xl md:text-4xl font-black italic">"{plan.motivationalQuote}"</h3>
                <div className="max-w-4xl mx-auto p-8 bg-indigo-50/40 dark:bg-slate-900/40 rounded-3xl border border-white shadow-inner">
                   <p className="text-[10px] font-black text-indigo-600 uppercase mb-3 tracking-widest">Chiến lược đề xuất</p>
                   <p className="text-lg font-bold italic text-slate-700 dark:text-slate-200">{plan.summary}</p>
                </div>
                <div className="flex flex-col md:flex-row justify-center gap-4">
                   <button onClick={handleCreatePodcastAudio} disabled={isGeneratingAudio} className="px-12 py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-black text-xl shadow-xl flex items-center justify-center gap-4 transition-all hover:scale-105">
                      {isGeneratingAudio ? <i className="fa-solid fa-circle-notch animate-spin"></i> : <i className="fa-solid fa-podcast"></i>}
                      {isGeneratingAudio ? "Đang xử lý..." : "Nghe Podcast Lộ trình"}
                   </button>
                   <button onClick={() => setStep('form')} className="px-10 py-5 bg-white dark:bg-slate-700 text-slate-500 dark:text-white rounded-full font-black text-base border border-slate-100 shadow-sm">Thử lại bài test</button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 {plan.roadmap.map((node, i) => (
                   <div key={i} className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-xl border-t-4 border-indigo-500 flex flex-col items-center text-center gap-4 group hover:-translate-y-2 transition-all">
                      <div className="w-12 h-12 bg-indigo-50 dark:bg-slate-900 text-indigo-600 rounded-full flex items-center justify-center text-xl font-black shadow-inner">{i+1}</div>
                      <h4 className="text-xl font-black">{node.title}</h4>
                      <p className="text-xs font-bold text-slate-400 italic leading-relaxed">"{node.content}"</p>
                   </div>
                 ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'pomodoro' && (
        <div className="max-w-3xl mx-auto space-y-10 animate-fade-in text-center pb-20">
           <div className={`p-12 md:p-20 rounded-[4rem] shadow-2xl border border-white transition-all duration-700 ${pomoMode === 'study' ? 'bg-indigo-50/80 dark:bg-slate-800/80' : 'bg-emerald-50/80 dark:bg-emerald-900/40'}`}>
              <div className="space-y-4">
                 <div className={`inline-flex items-center gap-3 px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-widest ${pomoMode === 'study' ? 'bg-indigo-600 text-white' : 'bg-emerald-600 text-white'}`}>
                   <i className={`fa-solid ${pomoMode === 'study' ? 'fa-brain' : 'fa-leaf'} animate-pulse`}></i>
                   {pomoMode === 'study' ? 'Giai đoạn: Tập trung sâu' : 'Giai đoạn: Nghỉ ngơi'}
                 </div>
                 <p className="text-slate-400 font-bold text-xs">Mục tiêu: {pomoMode === 'study' ? `${pomoOption.study} phút học` : `${pomoOption.break} phút nghỉ`}</p>
              </div>
              
              <div className="relative py-12">
                 {/* Progress circle simulation */}
                 <div className="text-[10rem] md:text-[12rem] font-black leading-none drop-shadow-2xl tabular-nums bg-gradient-to-b from-slate-900 to-slate-500 dark:from-white dark:to-slate-400 bg-clip-text text-transparent relative z-10">
                    {formatTime(pomoTime)}
                 </div>
              </div>

              <div className="flex justify-center gap-6">
                 <button onClick={toggleTimer} className={`px-20 py-8 rounded-full font-black text-3xl shadow-2xl transition-all hover:scale-105 active:scale-95 ${isActive ? 'bg-red-500 text-white' : (pomoMode === 'study' ? 'bg-indigo-600 text-white' : 'bg-emerald-600 text-white')}`}>
                   {isActive ? 'Dừng' : 'Bắt đầu'}
                 </button>
                 <button onClick={resetTimer} className="w-20 h-20 bg-white dark:bg-slate-700 rounded-full flex items-center justify-center text-3xl text-slate-400 hover:text-indigo-600 transition-all shadow-md"><i className="fa-solid fa-rotate-right"></i></button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-10">
                 {[
                   { label: 'Pomodoro', study: 25, break: 5 },
                   { label: 'Deep Work', study: 45, break: 10 },
                   { label: 'Siêu tốc', study: 15, break: 3 },
                   { label: 'Luyện đề', study: 90, break: 15 },
                 ].map(opt => (
                   <button 
                    key={opt.label} 
                    onClick={() => selectPomoPreset(opt.study, opt.break)} 
                    className={`px-4 py-3 rounded-2xl font-black text-[10px] uppercase transition-all border ${pomoOption.study === opt.study ? 'bg-white dark:bg-slate-800 border-indigo-200 text-indigo-600 shadow-xl' : 'bg-transparent border-slate-200 text-slate-500'}`}
                   >
                      {opt.label}
                      <span className="block text-[8px] opacity-50 mt-1">{opt.study}/{opt.break} min</span>
                   </button>
                 ))}
              </div>
           </div>
        </div>
      )}

      {activeTab === 'reminders' && (
        <div className="max-w-4xl mx-auto space-y-10 animate-fade-in">
           <div className="bg-white/80 dark:bg-slate-800/80 p-8 md:p-12 rounded-[3rem] shadow-2xl border border-white dark:border-slate-700 space-y-10">
              <h2 className="text-3xl font-black flex items-center gap-4">
                 <i className="fa-solid fa-bell text-amber-500"></i> Nhắc nhở thông minh
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 dark:bg-slate-900 p-6 rounded-3xl">
                 <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Công việc cần nhắc</label>
                    <input 
                      placeholder="VD: Làm bài tập toán..." 
                      value={newReminder.task} 
                      onChange={e => setNewReminder({...newReminder, task: e.target.value})} 
                      className="w-full p-5 rounded-xl bg-white dark:bg-slate-800 font-bold border-none outline-none shadow-sm" 
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Thời gian nhắc</label>
                    <input 
                      type="time" 
                      value={newReminder.time} 
                      onChange={e => setNewReminder({...newReminder, time: e.target.value})} 
                      className="w-full p-5 rounded-xl bg-white dark:bg-slate-800 font-bold border-none outline-none shadow-sm" 
                    />
                 </div>
                 <button onClick={addReminder} className="md:col-span-3 py-5 bg-indigo-600 text-white rounded-2xl font-black text-lg shadow-xl hover:bg-indigo-700 transition-all">
                   Lên lịch gửi qua Email ({userEmail})
                 </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6">
                 {reminders.map(rem => (
                   <div key={rem.id} className="p-8 bg-white dark:bg-slate-900 rounded-[2rem] shadow-lg flex items-center justify-between group border border-slate-50 transition-all hover:scale-102">
                      <div className="flex items-center gap-6">
                         <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center text-2xl"><i className="fa-solid fa-clock"></i></div>
                         <div>
                            <p className="font-black text-lg">{rem.task}</p>
                            <p className="text-[10px] font-black text-indigo-500 uppercase">{rem.time} • Hàng ngày</p>
                         </div>
                      </div>
                      <button onClick={() => setReminders(reminders.filter(r => r.id !== rem.id))} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 p-2 text-xl transition-all"><i className="fa-solid fa-trash"></i></button>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      )}

      {activeTab === 'progress' && (
        <div className="max-w-4xl mx-auto space-y-10 animate-fade-in">
           <div className="bg-white/80 dark:bg-slate-800/80 p-8 md:p-12 rounded-[3rem] shadow-2xl border border-white dark:border-slate-700 space-y-10">
              <h2 className="text-3xl font-black">Bảng vàng thành tích</h2>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3 bg-slate-50 dark:bg-slate-900/40 p-6 rounded-3xl">
                 <input placeholder="Môn học" value={newEntry.subject} onChange={e => setNewEntry({...newEntry, subject: e.target.value})} className="col-span-1 md:col-span-2 p-4 rounded-xl bg-white dark:bg-slate-800 font-bold shadow-sm outline-none" />
                 <input type="number" placeholder="Điểm" value={newEntry.score} onChange={e => setNewEntry({...newEntry, score: e.target.value})} className="p-4 rounded-xl bg-white dark:bg-slate-800 font-bold shadow-sm outline-none" />
                 <input type="date" value={newEntry.date} onChange={e => setNewEntry({...newEntry, date: e.target.value})} className="p-4 rounded-xl bg-white dark:bg-slate-800 font-bold shadow-sm outline-none" />
                 <select value={newEntry.icon} onChange={e => setNewEntry({...newEntry, icon: e.target.value})} className="p-4 rounded-xl bg-white dark:bg-slate-800 font-bold shadow-sm outline-none">
                    {icons.map(icon => <option key={icon} value={icon}>{icon.split('-')[1]}</option>)}
                 </select>
                 <button onClick={addEntry} className="md:col-span-5 bg-indigo-600 text-white rounded-xl py-4 font-black text-lg hover:bg-indigo-700 transition-all mt-2 shadow-lg">Lưu kỷ lục mới</button>
              </div>

              <div className="space-y-4 pt-4">
                 {progressList.map(item => (
                   <div key={item.id} className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-3xl flex items-center justify-between shadow-sm border border-white hover:shadow-md transition-all">
                      <div className="flex items-center gap-6">
                         <div className="w-16 h-16 bg-indigo-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center text-3xl shadow-inner">
                            <i className={`fa-solid ${item.icon}`}></i>
                         </div>
                         <div>
                            <p className="font-black text-xl">{item.subject}</p>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.date}</p>
                         </div>
                      </div>
                      <div className="text-5xl font-black text-indigo-600 pr-4">{item.score}</div>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      )}

      {activeTab === 'flashcards' && (
        <div className="max-w-5xl mx-auto space-y-10 animate-fade-in pb-20">
           <div className="bg-white/40 dark:bg-slate-800/40 p-8 rounded-[3rem] text-center border-2 border-indigo-100 border-dashed backdrop-blur-sm">
              <h2 className="text-3xl font-black text-indigo-600 mb-2 uppercase">Flashcard Học Ngoại Ngữ</h2>
              <p className="text-base font-bold text-slate-500 italic max-w-2xl mx-auto">"Sử dụng phương pháp Spaced Repetition (Lặp lại ngắt quãng) để ghi nhớ từ vựng lâu dài. Công cụ tối ưu cho các bạn chuyên ngoại ngữ."</p>
           </div>
           
           <div className="flex flex-col lg:flex-row gap-8">
              <div className="flex-1 bg-white/80 dark:bg-slate-800/80 p-10 rounded-[3rem] shadow-2xl border border-white dark:border-slate-700 space-y-8">
                 <div className="space-y-4">
                    <input placeholder="Chủ đề (VD: TOEIC, IELTS...)" value={newCard.setName} onChange={e => setNewCard({...newCard, setName: e.target.value})} className="w-full p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 font-bold text-lg shadow-inner outline-none" />
                    <div className="grid grid-cols-1 gap-4">
                        <textarea placeholder="Mặt trước: Từ mới..." value={newCard.front} onChange={e => setNewCard({...newCard, front: e.target.value})} className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 font-bold h-40 outline-none text-lg shadow-inner" />
                        <textarea placeholder="Mặt sau: Giải nghĩa..." value={newCard.back} onChange={e => setNewCard({...newCard, back: e.target.value})} className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 font-bold h-40 outline-none text-lg shadow-inner" />
                    </div>
                 </div>
                 <button onClick={() => {
                   if (newCard.front && newCard.back) {
                     setFlashcards([{ ...newCard, id: Date.now().toString() }, ...flashcards]);
                     setNewCard({ front: '', back: '', setName: newCard.setName || 'Chung' });
                   }
                 }} className="w-full py-6 bg-purple-600 text-white rounded-3xl font-black text-2xl shadow-xl hover:bg-purple-700 transition-all">Tạo thẻ Flashcard</button>
              </div>

              <div className="lg:w-[400px] space-y-6 flex flex-col items-center">
                 <div className="w-full p-5 bg-white/40 dark:bg-slate-900/40 rounded-3xl border border-white/20 shadow-lg backdrop-blur-xl overflow-x-auto whitespace-nowrap scrollbar-hide">
                    <div className="flex gap-2">
                       {sets.map(s => (
                         <button 
                           key={s} 
                           onClick={() => {setSelectedSet(s); setCurrentFlashIndex(0); setIsFlipped(false);}}
                           className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all flex-shrink-0 ${selectedSet === s ? 'bg-purple-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-500'}`}
                         >
                            {s}
                         </button>
                       ))}
                    </div>
                 </div>

                 {filteredCards.length > 0 ? (
                   <div className="perspective-2000 relative h-[400px] w-full cursor-pointer group" onClick={() => setIsFlipped(!isFlipped)}>
                      <div className={`relative w-full h-full transition-all duration-700 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
                         <div className="absolute inset-0 backface-hidden bg-white dark:bg-slate-800 p-10 rounded-[3rem] shadow-xl flex items-center justify-center text-center border-4 border-purple-50">
                            <p className="text-3xl font-black leading-tight">{filteredCards[currentFlashIndex].front}</p>
                         </div>
                         <div className="absolute inset-0 backface-hidden rotate-y-180 bg-gradient-to-br from-purple-600 to-indigo-800 p-10 rounded-[3rem] shadow-xl flex items-center justify-center text-center text-white">
                            <p className="text-xl font-bold leading-relaxed">{filteredCards[currentFlashIndex].back}</p>
                         </div>
                      </div>
                   </div>
                 ) : (
                   <div className="h-[400px] w-full bg-slate-100 dark:bg-slate-900/50 rounded-[3rem] border-4 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-300 gap-4 p-8 text-center">
                      <i className="fa-solid fa-clone text-6xl opacity-10"></i>
                      <p className="font-bold italic">Bắt đầu học ngoại ngữ cùng Flashcard nào!</p>
                   </div>
                 )}
                 
                 {filteredCards.length > 1 && (
                   <div className="flex justify-between gap-4 w-full">
                      <button onClick={(e) => {e.stopPropagation(); setCurrentFlashIndex(prev => (prev - 1 + filteredCards.length) % filteredCards.length); setIsFlipped(false);}} className="flex-1 py-4 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center text-2xl text-slate-400 hover:text-purple-600 shadow-md transition-all"><i className="fa-solid fa-chevron-left"></i></button>
                      <button onClick={(e) => {e.stopPropagation(); setCurrentFlashIndex(prev => (prev + 1) % filteredCards.length); setIsFlipped(false);}} className="flex-1 py-4 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center text-2xl text-slate-400 hover:text-purple-600 shadow-md transition-all"><i className="fa-solid fa-chevron-right"></i></button>
                   </div>
                 )}
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default StudySection;
