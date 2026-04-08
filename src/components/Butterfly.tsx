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
  
  // The provided wing image URL
  const wingUrl = "https://drive.google.com/uc?export=download&id=162U8WyPO1kjuzLk_Ud-sUNFkU7lnOJRr";

  useEffect(() => {
    let frame: number;
    let trailCounter = 0;
    const move = () => {
      const volumeBoost = volume * 1.0;
      const currentSpeed = speed.current + volumeBoost;
      
      angle.current += (Math.random() - 0.5) * 5 * (1 + volumeBoost);
      
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
        width: '80px',
        height: '80px',
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
          width: '40px',
          height: '80px',
          transformOrigin: 'right center',
          filter: `drop-shadow(0 0 5px ${themeColor})`,
        }}
      >
        <img 
          src={wingUrl} 
          alt="" 
          referrerPolicy="no-referrer"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            transform: 'scaleX(-1)', // Flip for left wing
            filter: `hue-rotate(${id * 45}deg) brightness(1.1) saturate(1.2)`, // Subtle variety
          }}
        />
      </motion.div>

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
          width: '40px',
          height: '80px',
          transformOrigin: 'left center',
          filter: `drop-shadow(0 0 5px ${themeColor})`,
        }}
      >
        <img 
          src={wingUrl} 
          alt="" 
          referrerPolicy="no-referrer"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            filter: `hue-rotate(${id * 45}deg) brightness(1.1) saturate(1.2)`,
          }}
        />
      </motion.div>

      {/* Body - Hidden or adjusted as the image has its own body-like part */}
      <div
        style={{
          position: 'absolute',
          left: '39px',
          top: '20px',
          width: '2px',
          height: '30px',
          backgroundColor: '#111',
          borderRadius: '1px',
          zIndex: 11,
          opacity: 0.5,
        }}
      />
    </motion.div>
  );
}
