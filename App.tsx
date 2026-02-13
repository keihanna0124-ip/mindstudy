
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import StudySection from './components/StudySection';
import RelaxSection from './components/RelaxSection';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';
import Onboarding from './components/Onboarding';
import ChatBot from './components/ChatBot';

const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'home' | 'study' | 'relax' | 'contact'>('home');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [userData, setUserData] = useState<{ name: string; email: string } | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('mindstudy_user');
    if (savedUser) setUserData(JSON.parse(savedUser));
    else setShowOnboarding(true);
  }, []);

  useEffect(() => {
    if (isDarkMode) document.body.classList.add('dark');
    else document.body.classList.remove('dark');
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  const handleOnboardingComplete = (name: string, email: string) => {
    const data = { name, email };
    setUserData(data);
    localStorage.setItem('mindstudy_user', JSON.stringify(data));
    setShowOnboarding(false);
  };

  const handleRelaxTransition = () => {
    setActiveSection('relax');
    setTimeout(() => {
      document.getElementById('relax-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-500 ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-800'}`}>
      {showOnboarding && <Onboarding onComplete={handleOnboardingComplete} />}
      
      <Header 
        activeSection={activeSection} 
        setActiveSection={setActiveSection} 
        isDarkMode={isDarkMode} 
        toggleDarkMode={toggleDarkMode} 
      />
      
      <main className="flex-grow container mx-auto px-4 py-4 md:py-8">
        {activeSection === 'home' && <Hero onStart={() => setActiveSection('study')} />}
        {activeSection === 'study' && <StudySection onRelaxClick={handleRelaxTransition} />}
        {activeSection === 'relax' && <RelaxSection />}
        {activeSection === 'contact' && <ContactSection />}
      </main>

      <ChatBot />
      <Footer />
    </div>
  );
};

export default App;
