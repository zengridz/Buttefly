import { motion, useAnimation } from 'motion/react';
import { useEffect, useRef } from 'react';

interface ButterflyProps {
  id: number;
  volume: number;
  themeColor: string;
  key?: number;
}

export function Butterfly({ id, volume, themeColor }: ButterflyProps) {
  const controls = useAnimation();
  const x = useRef(Math.random() * 100);
  const y = useRef(Math.random() * 100);
  const angle = useRef(Math.random() * 360);
  const speed = useRef(0.1 + Math.random() * 0.15);
  
  useEffect(() => {
    let frame: number;
    let trailCounter = 0;
    const move = () => {
      const volumeBoost = volume * 1.0;
      const currentSpeed = speed.current + volumeBoost;
      
      angle.current += (Math.random() - 0.5) * 12 * (1 + volumeBoost);
      
      const rad = (angle.current * Math.PI) / 180;
      x.current += Math.cos(rad) * currentSpeed;
      y.current += Math.sin(rad) * currentSpeed;

      if (x.current < -10) x.current = 110;
      if (x.current > 110) x.current = -10;
      if (y.current < -10) y.current = 110;
      if (y.current > 110) y.current = -10;

      controls.set({
        left: `${x.current}%`,
        top: `${y.current}%`,
        rotate: angle.current + 90,
      });

      // Spawn trail particle every 3 frames
      trailCounter++;
      if (trailCounter >= 3) {
        window.dispatchEvent(new CustomEvent('butterfly-trail', {
          detail: { x: x.current, y: y.current, color: themeColor }
        }));
        trailCounter = 0;
      }

      frame = requestAnimationFrame(move);
    };

    move();
    return () => cancelAnimationFrame(frame);
  }, [controls, volume, themeColor]);

  return (
    <motion.div
      animate={controls}
      style={{
        position: 'absolute',
        width: '40px',
        height: '40px',
        zIndex: 10,
        pointerEvents: 'none',
      }}
    >
      {/* Left Wing */}
      <motion.div
        animate={{
          rotateY: [0, 80, 0],
        }}
        transition={{
          duration: 0.4 - (volume * 0.2),
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          position: 'absolute',
          left: '0',
          width: '20px',
          height: '40px',
          background: `linear-gradient(to right, transparent, ${themeColor})`,
          borderRadius: '20px 0 0 20px',
          transformOrigin: 'right center',
          filter: `drop-shadow(0 0 8px ${themeColor})`,
          opacity: 0.8,
        }}
      />

      {/* Right Wing */}
      <motion.div
        animate={{
          rotateY: [0, -80, 0],
        }}
        transition={{
          duration: 0.4 - (volume * 0.2),
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          position: 'absolute',
          right: '0',
          width: '20px',
          height: '40px',
          background: `linear-gradient(to left, transparent, ${themeColor})`,
          borderRadius: '0 20px 20px 0',
          transformOrigin: 'left center',
          filter: `drop-shadow(0 0 8px ${themeColor})`,
          opacity: 0.8,
        }}
      />

      {/* Body */}
      <div
        style={{
          position: 'absolute',
          left: '19px',
          top: '10px',
          width: '2px',
          height: '20px',
          backgroundColor: '#fff',
          boxShadow: `0 0 10px ${themeColor}`,
          borderRadius: '1px',
          zIndex: 11,
        }}
      />
    </motion.div>
  );
}
