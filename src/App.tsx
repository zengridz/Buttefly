/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { useAudioAnalyzer } from './hooks/useAudioAnalyzer';
import { Butterfly } from './components/Butterfly';
import { ParticleSystem } from './components/ParticleSystem';

const EMERALD_THEME = {
  color: '#00ff88',
  bg: 'radial-gradient(circle at 50% 30%, #103a25 0%, transparent 60%), radial-gradient(circle at 10% 80%, #00ff88 0%, transparent 50%)'
};

export default function App() {
  const { volume, isAnalyzing, startAnalyzing, stopAnalyzing } = useAudioAnalyzer();
  const [showIntro, setShowIntro] = useState(true);

  const butterflies = Array.from({ length: 25 }, (_, i) => i);

  const handleStart = () => {
    startAnalyzing();
    setShowIntro(false);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#0a0502] font-sans text-white">
      {/* Atmospheric Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ duration: 2 }}
          className="absolute inset-0"
          style={{
            background: EMERALD_THEME.bg,
            filter: 'blur(80px)',
          }}
        />
      </div>

      {/* Particle System */}
      <ParticleSystem volume={volume} />

      {/* Butterflies */}
      {butterflies.map((id) => (
        <Butterfly key={id} id={id} volume={volume} themeColor={EMERALD_THEME.color} />
      ))}

      {/* UI Overlay */}
      <div className="relative z-20 flex flex-col items-center justify-between h-full p-8 pointer-events-none">
        <header className="text-center">
          <motion.h1 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-4xl md:text-6xl font-light tracking-tighter text-white/90"
          >
            BUTTERFLY <span className="italic font-serif" style={{ color: EMERALD_THEME.color }}>SYMPHONY</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            className="text-xs uppercase tracking-[0.3em] mt-2"
          >
            An Interactive Sound Experience
          </motion.p>
        </header>

        <AnimatePresence>
          {showIntro && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl text-center max-w-md pointer-events-auto"
            >
              <h2 className="text-2xl font-light mb-4">Welcome to the Garden</h2>
              <p className="text-white/60 mb-8 leading-relaxed">
                Allow microphone access to see the butterflies react to your voice, music, or ambient sound.
              </p>
              <button
                onClick={handleStart}
                className="group relative px-8 py-4 text-black font-bold rounded-full transition-all hover:scale-105 active:scale-95"
                style={{ backgroundColor: EMERALD_THEME.color }}
              >
                <span className="relative z-10 flex items-center gap-2">
                  START EXPERIENCE <Mic size={18} />
                </span>
                <div className="absolute inset-0 blur-xl opacity-50 group-hover:opacity-80 transition-opacity rounded-full" style={{ backgroundColor: EMERALD_THEME.color }} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <footer className="w-full flex justify-between items-end pointer-events-auto">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
              {isAnalyzing ? <Volume2 size={16} style={{ color: EMERALD_THEME.color }} /> : <MicOff size={16} className="text-white/40" />}
              <div className="w-32 h-1 bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full"
                  style={{ backgroundColor: EMERALD_THEME.color }}
                  animate={{ width: `${volume * 100}%` }}
                />
              </div>
            </div>
            <p className="text-[10px] uppercase tracking-widest text-white/40 ml-4">
              {isAnalyzing ? 'Analyzing Soundscape' : 'Microphone Inactive'}
            </p>
          </div>

          <button 
            onClick={isAnalyzing ? stopAnalyzing : startAnalyzing}
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

