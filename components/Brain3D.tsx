
import React, { useState, useEffect } from 'react';

const Brain3D: React.FC = () => {
  const [rotate, setRotate] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      // Tăng cường biên độ xoay để cảm giác 3D rõ rệt hơn
      const x = (e.clientX / innerWidth - 0.5) * 80; 
      const y = (e.clientY / innerHeight - 0.5) * 80;
      setRotate({ x: -y, y: x });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="flex justify-center items-center py-20 perspective-[2500px]">
      <div 
        className="relative w-64 h-64 md:w-96 md:h-96 transition-transform duration-500 ease-out cursor-none"
        style={{
          transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
          transformStyle: 'preserve-3d'
        }}
      >
        {/* Shadow floor - Creates depth perception */}
        <div className="absolute top-[110%] left-1/2 -translate-x-1/2 w-64 h-16 bg-black/10 blur-[40px] rounded-full" style={{ transform: 'translateZ(-150px) rotateX(90deg)' }}></div>

        {/* Ambient Outer Halo */}
        <div className="absolute inset-[-60px] border-[6px] border-indigo-400/10 rounded-full animate-pulse blur-[50px]" style={{ transform: 'translateZ(-80px)' }}></div>
        
        {/* Orbits showing depth */}
        <div className="absolute inset-[-30px] border-2 border-dashed border-emerald-400/10 rounded-full animate-spin-slow" style={{ transform: 'translateZ(-40px)' }}></div>
        <div className="absolute inset-[-15px] border-2 border-dotted border-indigo-400/10 rounded-full animate-spin-reverse" style={{ transform: 'translateZ(40px)' }}></div>

        {/* Main 3D Container for Brain */}
        <div className="absolute inset-0 transform-style-3d">
            {/* The "Brain" Body - Multi-layered for depth */}
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 rounded-[5rem] shadow-[0_50px_100px_-20px_rgba(79,70,229,0.5)] border-[8px] border-white/30 flex items-center justify-center" style={{ transform: 'translateZ(20px)' }}>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,_white_0%,_transparent_60%)] opacity-40"></div>
                <i className="fa-solid fa-brain text-white text-[12rem] md:text-[15rem] drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)] z-10 filter blur-[0.5px]"></i>
            </div>
            
            {/* Floating sparkles at different Z-depths */}
            <div className="absolute -top-10 -left-10 w-16 h-16 bg-emerald-300 rounded-full blur-2xl opacity-40 animate-bounce" style={{ transform: 'translateZ(100px)' }}></div>
            <div className="absolute bottom-10 right-10 w-24 h-24 bg-indigo-300 rounded-full blur-[40px] opacity-30" style={{ transform: 'translateZ(-60px)' }}></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ transform: 'translateZ(180px)' }}>
                <i className="fa-solid fa-sparkles text-white text-4xl animate-ping opacity-60"></i>
            </div>
            <div className="absolute top-0 right-0" style={{ transform: 'translateZ(140px)' }}>
                <i className="fa-solid fa-lightbulb text-amber-200 text-6xl drop-shadow-xl animate-float"></i>
            </div>
        </div>
      </div>
      
      <style>{`
        .animate-spin-slow { animation: spin 25s linear infinite; }
        .animate-spin-reverse { animation: spin-rev 18s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes spin-rev { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
        .shadow-3xl { box-shadow: 0 35px 60px -15px rgba(0, 0, 0, 0.3); }
      `}</style>
    </div>
  );
};

export default Brain3D;
