import { useState, useEffect, useRef } from 'react';

export function useAudioAnalyzer() {
  const [volume, setVolume] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const startAnalyzing = async () => {
    setError(null);
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
          // Increase sensitivity by scaling the normalized value (e.g., 3.0x multiplier)
          const sensitivity = 3.0;
          const normalizedVolume = Math.min(1, (average / 255) * sensitivity);
          setVolume(normalizedVolume);
        }
        animationFrameRef.current = requestAnimationFrame(update);
      };

      update();
    } catch (err) {
      console.error('Error accessing microphone:', err);
      const errorMessage = err instanceof Error ? err.name : 'UnknownError';
      if (errorMessage === 'NotAllowedError' || errorMessage === 'PermissionDeniedError') {
        setError('Microphone access denied. Please enable it in your browser settings and refresh.');
      } else if (errorMessage === 'NotFoundError' || errorMessage === 'DevicesNotFoundError') {
        setError('No microphone found on your device.');
      } else {
        setError('Error accessing microphone. Please try again.');
      }
      setIsAnalyzing(false);
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

  return { volume, isAnalyzing, error, startAnalyzing, stopAnalyzing };
}
