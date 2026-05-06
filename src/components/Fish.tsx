import { motion, useAnimation } from 'motion/react';
import { useEffect, useRef } from 'react';

interface FishProps {
  id: number;
  volume: number;
  themeColor: string;
  key?: number;
}

export function Fish({ id, volume, themeColor }: FishProps) {
  const controls = useAnimation();
  const volumeRef = useRef(volume);
  const x = useRef(Math.random() * 100);
  const y = useRef(Math.random() * 100);
  const angle = useRef(Math.random() * 360);
  // Slower, smoother speed
  const speed = useRef(0.05 + Math.random() * 0.08);

  useEffect(() => {
    volumeRef.current = volume;
  }, [volume]);
  
  useEffect(() => {
    let frame: number;
    let trailCounter = 0;
    const move = () => {
      const currentVolume = volumeRef.current;
      // Much milder volume boost for a calmer feel
      const volumeBoost = currentVolume * 1.0; 
      const currentSpeed = speed.current + volumeBoost * 0.1;
      
      // Calculate target angle to center if there is significant volume
      if (currentVolume > 0.05) {
        const dx = 50 - x.current;
        const dy = 50 - y.current;
        const targetAngle = (Math.atan2(dy, dx) * 180) / Math.PI;
        
        let diff = targetAngle - angle.current;
        while (diff < -180) diff += 360;
        while (diff > 180) diff -= 360;
        
        // Smoother turning
        angle.current += diff * currentVolume * 0.05;
      }
      
      // Calmer random wandering
      angle.current += (Math.random() - 0.5) * 4 * (1 + volumeBoost * 0.2);
      
      const rad = (angle.current * Math.PI) / 180;
      x.current += Math.cos(rad) * currentSpeed;
      y.current += Math.sin(rad) * currentSpeed;

      // Screen wrapping
      if (x.current < -15) x.current = 115;
      if (x.current > 115) x.current = -15;
      if (y.current < -15) y.current = 115;
      if (y.current > 115) y.current = -15;

      controls.set({
        left: `${x.current}%`,
        top: `${y.current}%`,
        rotate: angle.current,
      });

      // Spawn trail particle (bubbles/glimmer)
      trailCounter++;
      if (trailCounter >= 5) {
        window.dispatchEvent(new CustomEvent('fish-trail', {
          detail: { x: x.current, y: y.current, color: themeColor }
        }));
        trailCounter = 0;
      }

      frame = requestAnimationFrame(move);
    };

    frame = requestAnimationFrame(move);
    return () => cancelAnimationFrame(frame);
  }, [controls, volume, themeColor]);

  // Adjust tail movement based on movement speed
  const tailDuration = 0.8 - (volume * 0.4);

  return (
    <motion.div
      animate={controls}
      style={{
        position: 'absolute',
        width: '50px',
        height: '24px',
        zIndex: 10,
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Fish Body */}
      <div
        style={{
          width: '30px',
          height: '14px',
          backgroundColor: themeColor,
          borderRadius: '50% 100% 100% 50%', // Fish shaped body
          filter: `drop-shadow(0 0 12px ${themeColor})`,
          opacity: 0.9,
          position: 'relative',
          zIndex: 2,
        }}
      >
        {/* Eye */}
        <div 
          style={{
            position: 'absolute',
            right: '6px',
            top: '4px',
            width: '2px',
            height: '2px',
            backgroundColor: '#fff',
            borderRadius: '50%',
          }}
        />
      </div>

      {/* Fish Tail */}
      <motion.div
        animate={{
          rotateY: [25, -25, 25],
          rotate: [10, -10, 10],
          x: [-2, 0, -2]
        }}
        transition={{
          duration: tailDuration,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          position: 'absolute',
          left: '4px',
          width: '16px',
          height: '18px',
          backgroundColor: themeColor,
          clipPath: 'polygon(0 50%, 100% 0, 80% 50%, 100% 100%)', // Triangle-ish tail
          transformOrigin: 'right center',
          filter: `drop-shadow(0 0 8px ${themeColor})`,
          opacity: 0.7,
          zIndex: 1,
        }}
      />
      
      {/* Fin Side */}
      <motion.div
         animate={{
           rotateZ: [0, 20, 0],
         }}
         transition={{
           duration: 1.2,
           repeat: Infinity,
           ease: "easeInOut",
         }}
         style={{
           position: 'absolute',
           top: '4px',
           width: '8px',
           height: '4px',
           backgroundColor: themeColor,
           borderRadius: '0 100% 100% 0',
           opacity: 0.6,
           zIndex: 3,
         }}
      />
    </motion.div>
  );
}
