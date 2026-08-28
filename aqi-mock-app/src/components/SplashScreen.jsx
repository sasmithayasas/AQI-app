import React from 'react';
import { WifiOff, Cloud } from 'lucide-react';

export default function SplashScreen({ error, onRetry }) {
  return (
    <div className="min-h-screen relative font-sans flex flex-col items-center justify-center overflow-hidden" 
         style={{ background: 'linear-gradient(135deg, #004c6b 0%, #00658d 40%, #88cffc 100%)' }}>
      
      {/* Background Orbs for Atmospheric Depth */}
      <div className="absolute w-96 h-96 top-[-10%] left-[-10%] opacity-60 rounded-full blur-[30px]"
           style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 70%)' }}></div>
      <div className="absolute w-80 h-80 bottom-[-5%] right-[-5%] opacity-50 rounded-full blur-[30px]"
           style={{ background: 'radial-gradient(circle, #a5d568 0%, rgba(255,255,255,0) 70%)' }}></div>
      <div className="absolute w-64 h-64 top-[40%] right-[20%] opacity-30 rounded-full blur-[30px]"
           style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 70%)' }}></div>

      <main className="relative z-10 flex flex-col items-center justify-center w-full h-full p-6">
        
        {error ? (
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl shadow-[0_8px_32px_0_rgba(0,40,80,0.1)] max-w-sm w-full flex flex-col items-center animate-float">
            <div className="bg-red-500/20 p-4 rounded-full mb-6">
              <WifiOff className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">Connection Error</h1>
            <p className="text-[#c6e7ff] mb-8 leading-relaxed text-center font-light">
              Cannot reach the SentinelAQ live model server. Please check your internet connection.
            </p>
            <button 
              onClick={onRetry}
              className="w-full bg-white/20 backdrop-blur-md border border-white/30 text-white font-semibold py-3 px-6 rounded-2xl shadow-lg hover:bg-white/30 hover:scale-[1.02] active:scale-95 transition-all"
            >
              Retry Connection
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-8 animate-float">
            {/* Logo Container */}
            <div className="w-48 h-48 md:w-64 md:h-64 rounded-full flex items-center justify-center relative overflow-hidden"
                 style={{
                   background: 'rgba(255, 255, 255, 0.1)',
                   backdropFilter: 'blur(20px)',
                   WebkitBackdropFilter: 'blur(20px)',
                   border: '1px solid rgba(255, 255, 255, 0.2)',
                   boxShadow: '0 8px 32px 0 rgba(0, 40, 80, 0.1)'
                 }}>
              {/* Inner glow simulation */}
              <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent rounded-full z-0"></div>
              <Cloud className="w-24 h-24 md:w-32 md:h-32 text-white relative z-10 drop-shadow-2xl" />
            </div>
            
            {/* Typography */}
            <div className="text-center space-y-2">
              <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.2)] tracking-tight">SentinelAQ</h1>
              <p className="text-lg text-[#c6e7ff] opacity-90 font-light tracking-wide">Environmental AI Monitoring</p>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Indicator (Only show if loading) */}
      {!error && (
        <div className="absolute bottom-10 w-full flex justify-center space-x-3 z-10">
          <div className="w-2 h-2 rounded-full bg-white opacity-100 animate-pulse-dot" style={{ animationDelay: '0s' }}></div>
          <div className="w-2 h-2 rounded-full bg-white opacity-50 animate-pulse-dot" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 rounded-full bg-white opacity-25 animate-pulse-dot" style={{ animationDelay: '0.4s' }}></div>
        </div>
      )}

      <style>{`
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-pulse-dot {
          animation: pulseDot 1.5s infinite;
        }
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
          100% { transform: translateY(0px); }
        }
        @keyframes pulseDot {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(255, 255, 255, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); }
        }
      `}</style>
    </div>
  );
}
