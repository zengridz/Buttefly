import { useState, useEffect, useRef } from 'react';

export function useAudioAnalyzer() {
  const [volume, setVolume] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const startAnalyzing = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContextClass();
      const source = audioContext.createMediaStreamSource(stream);
      const analyzer = audioContext.createAnalyser();
      
      analyzer.fftSize = 256;
      const bufferLength = analyzer.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      source.connect(analyzer);
      
      audioContextRef.current = audioContext;
      analyzerRef.current = analyzer;
      dataArrayRef.current = dataArray;
      setIsAnalyzing(true);

      const update = () => {
        if (analyzerRef.current && dataArrayRef.current) {
          analyzerRef.current.getByteFrequencyData(dataArrayRef.current);
          let sum = 0;
          for (let i = 0; i < dataArrayRef.current.length; i++) {
            sum += dataArrayRef.current[i];
          }
          const average = sum / dataArrayRef.current.length;
          setVolume(average / 255); // Normalize to 0-1
        }
        animationFrameRef.current = requestAnimationFrame(update);
      };

      update();
    } catch (err) {
      console.error('Error accessing microphone:', err);
    }
  };

  const stopAnalyzing = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    setIsAnalyzing(false);
    setVolume(0);
  };

  useEffect(() => {
    return () => {
      stopAnalyzing();
    };
  }, []);

  return { volume, isAnalyzing, startAnalyzing, stopAnalyzing };
}
