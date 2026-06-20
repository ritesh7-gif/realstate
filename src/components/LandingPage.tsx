import { Link } from 'react-router-dom';
import { Building2, Play, Pause } from 'lucide-react';
import { useState, useRef } from 'react';

export default function LandingPage() {
  const [isPlaying, setIsPlaying] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="min-h-screen text-gray-900 font-sans selection:bg-rose-100 selection:text-gray-900 flex flex-col relative overflow-hidden bg-gray-50">
      
      {/* Blurred Property Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img 
          src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=2000" 
          alt="Luxury Property Background" 
          className="w-full h-full object-cover blur-sm opacity-80 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-white/30 backdrop-blur-[2px]"></div>
      </div>

      {/* Navbar integrated with background */}
      <nav className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-6 md:px-12 w-full bg-transparent">
        <div className="text-xl tracking-tight font-sans font-bold flex items-center gap-2.5 text-gray-900">
          <div className="p-1.5 bg-gradient-to-br from-blue-900 to-slate-800 rounded-lg text-white shadow-md">
            <Building2 className="w-5 h-5" />
          </div>
          LuxeReal
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center relative min-h-screen pt-24 pb-12 px-6 lg:px-12 z-10 w-full max-w-[1600px] mx-auto">
        
        <div className="flex flex-col lg:flex-row items-center justify-between w-full gap-10 lg:gap-12 xl:gap-16">
          
          {/* Left Content Area */}
          <div className="w-full lg:w-[35%] xl:w-[28%] text-center lg:text-left flex flex-col items-center lg:items-start z-10 shrink-0">
            <h1 className="text-5xl md:text-6xl xl:text-7xl font-serif tracking-tight text-gray-900 leading-[1.05] mb-6">
              Find Your <br/>
              <span className="italic text-[#1a365d]">Dream Home</span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-600 font-light leading-relaxed mb-8 max-w-lg lg:max-w-none">
              Discover exclusive properties, luxury villas, and prime investment land perfectly tailored to your vision.
            </p>

            <Link 
              to="/login" 
              className="inline-flex items-center justify-center bg-gray-900 text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
            >
              Get Started
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </Link>
          </div>

          {/* Right Video Area */}
          <div className="w-full lg:w-[65%] xl:w-[72%] relative z-10">
            <div className="relative p-[3px] rounded-[1.75rem] overflow-hidden shadow-[0_20px_60px_rgba(30,58,138,0.12)]">
              {/* Spinning Animated Spark Background */}
              <div 
                className="absolute top-1/2 left-1/2 aspect-square w-[200%] -translate-x-1/2 -translate-y-1/2 animate-[spin_4s_linear_infinite] bg-[conic-gradient(from_0deg,transparent_0%,transparent_40%,#93c5fd_60%,#3b82f6_80%,#1e40af_100%)] opacity-100" 
              />
              
              {/* Inner Video Container */}
              <div className="relative aspect-video rounded-[21px] overflow-hidden bg-white ring-2 ring-white/60 shadow-inner group">
                <video 
                  ref={videoRef}
                  autoPlay 
                  loop 
                  muted 
                  playsInline
                  className="w-full h-full object-cover relative z-10"
                >
                  <source src="/Create_a_second_premium_web.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-20 pointer-events-none"></div>
                
                <button
                  onClick={togglePlay}
                  className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 bg-black/30 hover:bg-black/50 backdrop-blur-sm border border-white/30 text-white rounded-full p-4 md:p-5 transition-all duration-300 flex items-center justify-center shadow-2xl scale-95 hover:scale-105 active:scale-95 ${isPlaying ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}`}
                  aria-label={isPlaying ? "Pause video" : "Play video"}
                >
                  {isPlaying ? (
                    <Pause className="w-8 h-8 md:w-10 md:h-10 fill-current" />
                  ) : (
                    <Play className="w-8 h-8 md:w-10 md:h-10 fill-current ml-1" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
