/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { useAudioAnalyzer } from './hooks/useAudioAnalyzer';
import { Fish } from './components/Fish';
import { ParticleSystem } from './components/ParticleSystem';

const THEMES = [
  {
    name: 'Emerald Pond',
    color: '#00ff88',
    secondary: '#103a25',
    bg: 'radial-gradient(circle at 50% 30%, #103a25 0%, transparent 60%), radial-gradient(circle at 10% 80%, #00ff88 0%, transparent 50%)'
  },
  {
    name: 'Pink Pond',
    color: '#ff71ce',
    secondary: '#3a102b',
    bg: 'radial-gradient(circle at 50% 30%, #3a102b 0%, transparent 60%), radial-gradient(circle at 10% 80%, #ff71ce 0%, transparent 50%)'
  },
  {
    name: 'Blue Pond',
    color: '#00d1ff',
    secondary: '#102b3a',
    bg: 'radial-gradient(circle at 50% 30%, #102b3a 0%, transparent 60%), radial-gradient(circle at 10% 80%, #00d1ff 0%, transparent 50%)'
  }
];

const RESET_INTERVAL_SECONDS = 300; // 5 minutes

export default function App() {
  const { volume, isAnalyzing, error, startAnalyzing, stopAnalyzing } = useAudioAnalyzer();
  const [themeIndex, setThemeIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(RESET_INTERVAL_SECONDS);
  const [fishSetKey, setFishSetKey] = useState(0);

  const [hasInteracted, setHasInteracted] = useState(false);

  const currentTheme = THEMES[themeIndex];

  const handleStart = async () => {
    setHasInteracted(true);
    await startAnalyzing();
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Time to cycle theme and reset pond
          setThemeIndex((current) => (current + 1) % THEMES.length);
          setFishSetKey((k) => k + 1);
          return RESET_INTERVAL_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const fishes = Array.from({ length: 50 }, (_, i) => i);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#0a0502] font-sans text-white">
      {/* Dynamic Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div 
          key={themeIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ duration: 2 }}
          className="absolute inset-0"
          style={{
            background: currentTheme.bg,
            filter: 'blur(80px)',
          }}
        />
      </div>

      {/* Particle System */}
      <ParticleSystem volume={volume} themeColor={currentTheme.color} />

      {/* Fish - Wrapped in a container with a key to force full remount on pond reset */}
      <div key={fishSetKey}>
        {fishes.map((id) => (
          <Fish key={id} id={id} volume={volume} themeColor={currentTheme.color} />
        ))}
      </div>

      {/* UI Overlay */}
      <div className="relative z-20 flex flex-col items-center justify-between h-full p-8 pointer-events-none">
        <header className="text-center">
          <motion.h1 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-4xl md:text-6xl font-space-mono tracking-tight text-white mb-2 uppercase"
          >
            {currentTheme.name}
          </motion.h1>
          <motion.p 
            key={themeIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            className="text-sm md:text-base font-space-mono font-light tracking-wide mt-4"
            style={{ color: currentTheme.color }}
          >
            Fishes react to your whistles
          </motion.p>
        </header>

        {/* Reset Timer UI */}
        {timeLeft <= 10 && hasInteracted && !error && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="flex flex-col items-center gap-4 py-8 px-12 rounded-3xl bg-black/40 backdrop-blur-3xl border border-white/10"
          >
            <p className="font-space-mono text-xs uppercase tracking-[0.3em] text-white/40">Refreshing Pond</p>
            <motion.div 
              key={timeLeft}
              initial={{ scale: 1.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-7xl font-space-mono font-bold"
              style={{ color: currentTheme.color }}
            >
              {timeLeft}
            </motion.div>
          </motion.div>
        )}

        {/* Start Overlay / Error Message */}
        {!hasInteracted || error ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-black/60 backdrop-blur-2xl border border-white/10 px-10 py-8 rounded-[2rem] max-w-md text-center pointer-events-auto"
          >
            {error ? (
              <>
                <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4 border border-red-500/30">
                  <MicOff size={24} className="text-red-400" />
                </div>
                <p className="text-red-400 font-space-mono text-xs uppercase tracking-[0.3em] mb-3">Permission Needed</p>
                <p className="text-white/80 text-sm mb-8 leading-relaxed">
                  {error.includes('denied') 
                    ? "Microphone access is blocked. Please enable it in your browser's address bar settings to interact with the fishes."
                    : error}
                </p>
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-6 border border-white/10">
                  <Mic size={32} className="text-white" />
                </div>
                <p className="text-white/40 font-space-mono text-xs uppercase tracking-[0.3em] mb-4">Ready to Begin</p>
                <h2 className="text-2xl font-space-mono text-white mb-8">Enter the Pond</h2>
              </>
            )}
            
            <button 
              onClick={handleStart}
              className="w-full py-4 bg-white text-black hover:bg-white/90 rounded-2xl text-sm font-bold uppercase tracking-[0.2em] transition-all transform active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.2)]"
            >
              {error ? 'Try Again' : 'Begin Experience'}
            </button>
            
            {!error && (
              <p className="mt-6 text-[10px] text-white/30 uppercase tracking-widest font-light">
                Microphone required to react to sound
              </p>
            )}
          </motion.div>
        ) : (
          <div /> 
        )}

        <footer className="w-full flex justify-between items-end pointer-events-auto">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
              {isAnalyzing ? <Volume2 size={16} style={{ color: currentTheme.color }} /> : <MicOff size={16} className="text-white/40" />}
              <div className="w-32 h-1 bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full"
                  style={{ backgroundColor: currentTheme.color }}
                  animate={{ width: `${volume * 100}%` }}
                />
              </div>
            </div>
            <div className="flex items-center gap-4 ml-4">
              <p className="text-[10px] uppercase tracking-widest text-white/40">
                {isAnalyzing ? 'Analyzing Soundscape' : 'Microphone Inactive'}
              </p>
              <div className="w-[1px] h-2 bg-white/10" />
              <p className="text-[10px] uppercase tracking-widest text-white/40">
                Reset in {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              </p>
            </div>
          </div>

          <button 
            onClick={isAnalyzing ? stopAnalyzing : handleStart}
            className="p-4 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
          >
            {isAnalyzing ? <Mic size={20} /> : <MicOff size={20} className="text-white/40" />}
          </button>
        </footer>
      </div>

      {/* Vignette */}
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_150px_rgba(0,0,0,0.8)]" />
    </div>
  );
}

